import { createHash } from 'node:crypto';
import { redisPipeline } from './_labStatsCore.mjs';

export const V3_NAMESPACE = 'sitevl:visitor:v3';
export const V3_STATS_KEY = `${V3_NAMESPACE}:stats`;
export const FUNNEL_ACTIONS = Object.freeze(['ad_visit', 'view_services', 'view_cases', 'view_prices', 'open_contacts', 'telegram_click', 'whatsapp_click', 'brief_start', 'brief_complete', 'lead_created']);

// Runs inside the EXISTING V2 transaction; no dual-write race or new identity system.
export const V3_EVENT_LUA = `
local metadata = cjson.decode(ARGV[8])
local classification = metadata.classification or 'likely-human'
local reason = metadata.reason or 'browser-session'
if event.event == 'engagement' then
  classification = 'human'
  reason = 'client-reported-' .. event.signal .. '; heuristic-not-proof'
end
if redis.call('HGET', KEYS[7], 'classification') ~= 'human' then
  redis.call('HSET', KEYS[7], 'classification', classification, 'classificationReason', reason)
end
redis.call('HSET', KEYS[1], 'classification', redis.call('HGET', KEYS[7], 'classification'), 'classificationReason', redis.call('HGET', KEYS[7], 'classificationReason'))
history.classification = redis.call('HGET', KEYS[7], 'classification')
if event.signal then history.signal = event.signal end
if event.channel then history.channel = event.channel end
if metadata.geo then
  local geo = cjson.encode(metadata.geo)
  redis.call('HSET', KEYS[7], 'geo', geo)
  redis.call('HSET', KEYS[1], 'geo', geo)
end
redis.call('HSETNX', KEYS[13], 'since', stamp)
if redis.call('HSETNX', KEYS[7], 'v3HumanVisit', '1') == 1 then redis.call('HINCRBY', KEYS[13], 'humanVisits', 1) end
if redis.call('HSETNX', KEYS[1], 'v3HumanObserved', '1') == 1 then redis.call('HINCRBY', KEYS[13], 'uniqueHumanVisitors', 1) end
if metadata.attribution and not redis.call('HGET', KEYS[7], 'attribution') then
  local attribution = cjson.encode(metadata.attribution)
  redis.call('HSET', KEYS[7], 'attribution', attribution)
  redis.call('HSETNX', KEYS[1], 'firstAttribution', attribution)
  redis.call('HSET', KEYS[1], 'currentAttribution', attribution)
  redis.call('HSET', KEYS[7], 'source', metadata.attribution.source, 'referrerHost', metadata.attribution.referrerHost or '')
  redis.call('HSET', KEYS[1], 'currentSource', metadata.attribution.source, 'currentReferrerHost', metadata.attribution.referrerHost or '')
end
local attributionRaw = redis.call('HGET', KEYS[7], 'attribution')
local paid = false
local adArrived = false
if attributionRaw then
  local attribution = cjson.decode(attributionRaw)
  paid = attribution.paid == true
  history.attribution = attribution
end
if paid then
  if redis.call('HSETNX', KEYS[7], 'v3AdVisit', '1') == 1 then
    adArrived = true
    redis.call('HINCRBY', KEYS[13], 'paidAdHumanVisits', 1)
    redis.call('HINCRBY', KEYS[13], 'ad_visit', 1)
  end
  if redis.call('HSETNX', KEYS[1], 'v3AdObserved', '1') == 1 then redis.call('HINCRBY', KEYS[13], 'paidAdUniqueVisitors', 1) end
  local action = metadata.funnelAction or ''
  if action ~= '' and redis.call('HSETNX', KEYS[7], 'v3Funnel:' .. action, '1') == 1 then redis.call('HINCRBY', KEYS[13], action, 1) end
end
`;

export function funnelAction(event) {
  if (event.event === 'contact_click') return event.channel === 'telegram' ? 'telegram_click' : 'whatsapp_click';
  if (event.event === 'brief_started') return 'brief_start';
  if (event.event === 'brief_completed') return 'brief_complete';
  if (event.event !== 'page_view') return '';
  if (event.path === '/services') return 'view_services';
  if (event.path === '/cases' || event.path.startsWith('/cases/')) return 'view_cases';
  if (event.path === '/prices' || event.path.startsWith('/prices/')) return 'view_prices';
  if (event.path === '/contacts') return 'open_contacts';
  return '';
}

const BOT_SCRIPT = `
local count = redis.call('INCR', KEYS[1]); redis.call('EXPIRE', KEYS[1], 120)
if count > 120 then return cjson.encode({limited=true}) end
if not redis.call('SET', KEYS[2], '1', 'NX', 'EX', 1800) then return cjson.encode({deduplicated=true}) end
local record = cjson.decode(ARGV[1])
redis.call('HSETNX', KEYS[3], 'since', record.at)
redis.call('HINCRBY', KEYS[3], ARGV[2], 1)
redis.call('LPUSH', KEYS[4], ARGV[1]); redis.call('LTRIM', KEYS[4], 0, 99); redis.call('EXPIRE', KEYS[4], 604800)
local notify = redis.call('SET', KEYS[5], '1', 'NX', 'EX', 1800)
return cjson.encode({deduplicated=false, notify=notify ~= false and notify ~= nil})
`;

export async function recordBotVisit(path, traffic, options = {}) {
  const now = options.now?.() ?? Date.now();
  const family = traffic.family || 'Unknown client';
  const record = { at: new Date(now).toISOString(), path, classification: traffic.classification, family, reason: traffic.reason, verification: traffic.verification };
  const bucket = Math.floor(now / 1800000);
  const digest = createHash('sha256').update(`${family}:${path}:${bucket}`).digest('hex');
  const familyKey = createHash('sha256').update(family).digest('hex').slice(0, 16);
  const keys = [`${V3_NAMESPACE}:bot-rate:${Math.floor(now / 60000)}`, `${V3_NAMESPACE}:bot-dedup:${digest}`, V3_STATS_KEY, `${V3_NAMESPACE}:bots:recent`, `${V3_NAMESPACE}:bot-notify:${familyKey}`];
  const result = await redisPipeline([['EVAL', BOT_SCRIPT, '5', ...keys, JSON.stringify(record), traffic.classification === 'known-bot' ? 'knownBotVisits' : 'likelyBotVisits']], options);
  return { ...JSON.parse(result[0].result), record };
}

export async function readTrafficSummary(options = {}) {
  const result = await redisPipeline([['HGETALL', V3_STATS_KEY], ['LRANGE', `${V3_NAMESPACE}:bots:recent`, '0', '99']], options);
  const raw = result[0].result;
  const stats = Array.isArray(raw) ? Object.fromEntries(Array.from({ length: raw.length / 2 }, (_, i) => [raw[i * 2], raw[i * 2 + 1]])) : raw || {};
  return { version: 3, since: stats.since || null,
    counters: Object.fromEntries(['humanVisits', 'uniqueHumanVisitors', 'knownBotVisits', 'likelyBotVisits', 'paidAdHumanVisits', 'paidAdUniqueVisitors', ...FUNNEL_ACTIONS].map(key => [key, Number(stats[key]) || 0])),
    bots: (result[1].result || []).map(item => { try { return JSON.parse(item); } catch { return null; } }).filter(Boolean),
    definitions: { human: 'Browser identities, not verified people; V3 observations only. Existing historical totals unchanged.', unique: 'Deduplicated within the retained visitor profile lifetime.', bot: 'Family + page observations deduplicated in 30-minute buckets; not individual people or raw requests.', funnel: 'At most one action of each type per attributed session.', geo: 'Approximate network location, never GPS.' } };
}

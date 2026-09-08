import { createHash } from 'node:crypto';
import { redisPipeline } from './_labStatsCore.mjs';
import { V31_NAMESPACE, V31_STATS_KEY } from './_visitorConfidenceV31.mjs';

export const V3_NAMESPACE = 'sitevl:visitor:v3';
export const V3_STATS_KEY = `${V3_NAMESPACE}:stats`;
export const FUNNEL_ACTIONS = Object.freeze(['ad_visit', 'view_services', 'view_cases', 'view_prices', 'open_contacts', 'telegram_click', 'whatsapp_click', 'brief_start', 'brief_complete', 'lead_created']);


export function funnelAction(event) {
  if (event.event === 'contact_click') return event.channel === 'telegram' ? 'telegram_click' : 'whatsapp_click';
  if (event.event === 'brief_started') return 'brief_start';
  if (event.event === 'brief_completed') return 'brief_complete';
  if (event.event !== 'page_view') return '';
  if (event.path === '/services' || event.path.startsWith('/services/')) return 'view_services';
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
redis.call('HINCRBY', KEYS[3], 'technicalVisits', 1)
redis.call('LPUSH', KEYS[4], ARGV[1]); redis.call('LTRIM', KEYS[4], 0, 99); redis.call('EXPIRE', KEYS[4], 604800)
local notify = redis.call('SET', KEYS[5], '1', 'NX', 'EX', 1800)
return cjson.encode({deduplicated=false, notify=notify ~= false and notify ~= nil})
`;

export async function recordBotVisit(path, traffic, options = {}) {
  const now = options.now?.() ?? Date.now();
  const family = traffic.family || 'Unknown client';
  const record = { at: new Date(now).toISOString(), path, classification: traffic.classification, classificationScore: traffic.classification === 'known-bot' ? 0 : 10, family, reason: traffic.reason, verification: traffic.verification };
  const bucket = Math.floor(now / 1800000);
  const digest = createHash('sha256').update(`${family}:${path}:${bucket}`).digest('hex');
  const familyKey = createHash('sha256').update(family).digest('hex').slice(0, 16);
  const keys = [`${V31_NAMESPACE}:bot-rate:${Math.floor(now / 60000)}`, `${V31_NAMESPACE}:bot-dedup:${digest}`, V31_STATS_KEY, `${V31_NAMESPACE}:bots:recent`, `${V3_NAMESPACE}:bot-notify:${familyKey}`];
  const result = await redisPipeline([['EVAL', BOT_SCRIPT, '5', ...keys, JSON.stringify(record), traffic.classification === 'known-bot' ? 'knownBotVisits' : 'likelyBotVisits']], options);
  return { ...JSON.parse(result[0].result), record };
}

export async function readTrafficSummary(options = {}) {
  const result = await redisPipeline([['HGETALL', V31_STATS_KEY], ['LRANGE', `${V31_NAMESPACE}:bots:recent`, '0', '99'], ['HGETALL', V3_STATS_KEY]], options);
  const raw = result[0].result;
  const stats = Array.isArray(raw) ? Object.fromEntries(Array.from({ length: raw.length / 2 }, (_, i) => [raw[i * 2], raw[i * 2 + 1]])) : raw || {};
  return { version: '3.1', since: stats.since || null,
    counters: Object.fromEntries(['technicalVisits', 'humanVisits', 'unknownVisits', 'uniqueHumanVisitors', 'knownBotVisits', 'likelyBotVisits', 'paidAdTechnicalVisits', 'paidAdHumanVisits', 'paidAdUniqueHumans', ...FUNNEL_ACTIONS.filter(key => key !== 'ad_visit')].map(key => [key, Number(stats[key]) || 0])),
    legacyV3Totals: result[2].result || {},
    bots: (result[1].result || []).map(item => { try { return JSON.parse(item); } catch { return null; } }).filter(Boolean),
    definitions: { human: 'V3.1 score >= 60. Explainable heuristic, not proof or probability. Unknown is excluded.', unique: 'Pseudonymous retained identities with at least one currently qualified session; no cross-device identity.', bot: 'Signature observations are family + page deduplicated in 30-minute buckets, not individual people or raw requests. Behavioral bot sessions use the 30-minute activity window.', technical: 'V3.1 browser sessions plus deduplicated crawler observations. Human/unknown/bot partitions sum to technicalVisits.', funnel: 'At most one action per attributed session, including unknown traffic; paid human counters require score >= 60.', legacy: 'V3 totals and public site/LAB browser counters retained without retrospective human claims.', geo: 'Approximate network location, never GPS.' } };
}

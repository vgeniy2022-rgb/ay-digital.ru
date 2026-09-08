import { redisPipeline } from './_labStatsCore.mjs';
import { funnelAction } from './_visitorStoreV3.mjs';
import { CONFIDENCE_RULES, INTEREST_WEIGHTS, V31_EVENT_LUA, V31_NAMESPACE, V31_STATS_KEY, cohortKey } from './_visitorConfidenceV31.mjs';

export const V2_NAMESPACE = 'sitevl:visitor:v2';
export const SEQUENCE_KEYS = Object.freeze({ visitor: `${V2_NAMESPACE}:visitor-sequence`, visit: `${V2_NAMESPACE}:visit-sequence` });

// One bounded Redis operation: binding, dedup, number allocation, migration,
// session count and history commit cannot interleave with another request.
export const VISITOR_EVENT_SCRIPT = `
-- Upstash exposes KEYS as readonly; use a private working copy for aliases.
local providedKeys = KEYS
local KEYS = {}
for i, key in ipairs(providedKeys) do KEYS[i] = key end
local event = cjson.decode(ARGV[1])
local stamp, now, ttl = ARGV[2], tonumber(ARGV[3]), tonumber(ARGV[4])
local flags = cjson.decode(ARGV[5])
local network, netttl = ARGV[6], tonumber(ARGV[7])
local metadata = cjson.decode(ARGV[8])
local technicalKey = KEYS[7]
local bound = redis.call('GET', KEYS[6])
local sessionBound = redis.call('HGET', KEYS[7], 'visitorId')
if (bound and bound ~= event.visitorId) or (sessionBound and sessionBound ~= event.visitorId) then
  return cjson.encode({conflict=true})
end
if not bound and not sessionBound and event.event ~= 'session_start' then
  return cjson.encode({sessionRequired=true})
end
if redis.call('EXISTS', KEYS[5]) == 1 then return cjson.encode({deduplicated=true}) end
if event.event == 'session_start' and redis.call('HGET', technicalKey, 'v31StartRecorded') == '1' then return cjson.encode({deduplicated=true}) end
local firstVisit = redis.call('HGET', KEYS[1], 'firstVisit')
local previousVisit = redis.call('HGET', KEYS[1], 'lastVisit') or firstVisit or ''
local newVisitor = not firstVisit
local number = redis.call('GET', KEYS[8]) or redis.call('HGET', KEYS[1], 'visitorNumber')
if not number then number = tostring(redis.call('INCR', KEYS[9])) end
redis.call('SET', KEYS[8], number, 'EX', ttl)
redis.call('HSET', KEYS[1], 'visitorNumber', number)
-- Lazy aggregate migration uses only the retained legacy history (at most 100).
if not redis.call('HGET', KEYS[1], 'summarySince') then
  local counts = {pageViews=0, experimentStarts=0, aiConcepts=0, leads=0}
  for _, raw in ipairs(redis.call('LRANGE', KEYS[2], '0', '-1')) do
    local ok, old = pcall(cjson.decode, raw)
    if ok and type(old) == 'table' then
      if old.event == 'page_view' then counts.pageViews = counts.pageViews + 1 end
      if old.event == 'experiment_start' then counts.experimentStarts = counts.experimentStarts + 1 end
      if old.event == 'ai_concept_created' then counts.aiConcepts = counts.aiConcepts + 1 end
      if old.event == 'lead_created' then counts.leads = counts.leads + 1 end
    end
  end
  redis.call('HSET', KEYS[1], 'summarySince', stamp, 'pageViews', counts.pageViews, 'experimentStarts', counts.experimentStarts, 'aiConcepts', counts.aiConcepts, 'leads', counts.leads)
end
local prior = {pages=redis.call('SCARD', KEYS[3]), experiments=tonumber(redis.call('HGET', KEYS[1], 'experimentStarts') or '0'), concepts=tonumber(redis.call('HGET', KEYS[1], 'aiConcepts') or '0'), leads=tonumber(redis.call('HGET', KEYS[1], 'leads') or '0')}
-- The active visit belongs to the persistent visitor, not to a browser tab.
-- Existing V2 hashes retain their historical visitNumber; only an alias is added.
local activeVisit = redis.call('HGET', KEYS[1], 'v31ActiveVisit')
local lastActivity = tonumber(redis.call('HGET', KEYS[1], 'v31LastActivityMs') or metadata.legacyLastMs or '0')
local activeKey = activeVisit and 'sitevl:visitor:v31:session:' .. activeVisit or nil
local withinWindow = lastActivity > 0 and now - lastActivity <= 1800000
if event.event == 'behavior' and withinWindow and activeKey then
  local b = event.behavior
  local changed = b.dwell > tonumber(redis.call('HGET', activeKey, 'dwell') or '0') or b.scroll > tonumber(redis.call('HGET', activeKey, 'scroll') or '0')
  for _, kind in ipairs({'pointer', 'touch', 'keyboard', 'link', 'form'}) do
    if b[kind] and redis.call('HGET', activeKey, 'behavior:' .. kind) ~= '1' then changed = true end
  end
  if not changed then return cjson.encode({deduplicated=true}) end
end
local legacyVisit = not activeVisit and redis.call('HGET', KEYS[1], 'lastVisitNumber')
local newSession = not withinWindow or (not activeKey and not legacyVisit)
local visit = activeVisit or legacyVisit
local ordinal = tonumber(redis.call('HGET', KEYS[1], 'sessions') or '0')
if newSession then
  visit = tostring(redis.call('INCR', KEYS[10]))
  ordinal = redis.call('HINCRBY', KEYS[1], 'sessions', '1')
end
KEYS[7] = 'sitevl:visitor:v31:session:' .. visit
if redis.call('EXISTS', KEYS[7]) == 0 then
  if ordinal < 1 then ordinal = 1; redis.call('HSET', KEYS[1], 'sessions', '1') end
  local source = event.source or redis.call('HGET', KEYS[1], 'currentSource') or 'direct'
  local referrer = event.referrerHost or redis.call('HGET', KEYS[1], 'currentReferrerHost') or ''
  local legacyKey = 'sitevl:visitor:v2:session:' .. (redis.call('HGET', KEYS[1], 'lastSessionId') or '')
  if not newSession then
    source = redis.call('HGET', KEYS[1], 'currentSource') or source
    referrer = redis.call('HGET', KEYS[1], 'currentReferrerHost') or referrer
    if redis.call('HGET', legacyKey, 'visitorId') == event.visitorId then
      source = redis.call('HGET', legacyKey, 'source') or source
      referrer = redis.call('HGET', legacyKey, 'referrerHost') or referrer
    end
  end
  if newSession and event.event ~= 'session_start' then source = 'direct'; referrer = '' end
  redis.call('HSET', KEYS[7], 'visitorId', event.visitorId, 'visitNumber', visit, 'sessionNumber', ordinal, 'analyticsSessionNumber', ordinal, 'startedAt', stamp, 'observedAtMs', now, 'previousVisit', previousVisit, 'source', source, 'referrerHost', referrer)
  if not newSession and redis.call('HGET', legacyKey, 'visitorId') == event.visitorId and redis.call('HGET', legacyKey, 'attribution') then redis.call('HSET', KEYS[7], 'attribution', redis.call('HGET', legacyKey, 'attribution')) end
  if firstVisit and lastActivity > 0 and now - lastActivity >= 3600000 then redis.call('HSET', KEYS[7], 'returnAfterGap', 1) end
  local startsKey = 'sitevl:visitor:v31:session-starts:' .. event.visitorId
  redis.call('ZREMRANGEBYSCORE', startsKey, '-inf', now - 86400000)
  if newSession then redis.call('ZADD', startsKey, now, visit) end
  redis.call('EXPIRE', startsKey, 86400)
  redis.call('HSET', KEYS[7], 'sessionVelocity', redis.call('ZCARD', startsKey))
end
redis.call('HSET', KEYS[1], 'v31ActiveVisit', visit)
-- An idempotent duplicate does not extend activity; accepted meaningful events do.
if event.event ~= 'engagement' then redis.call('HSET', KEYS[1], 'v31LastActivityMs', math.max(lastActivity, now)) end
redis.call('HSET', technicalKey, 'visitorId', event.visitorId, 'v31AnalyticsKey', KEYS[7])
redis.call('HSETNX', technicalKey, 'visitNumber', visit)
redis.call('HSETNX', technicalKey, 'sessionNumber', ordinal)
redis.call('EXPIRE', technicalKey, ttl)
redis.call('SET', KEYS[6], event.visitorId, 'EX', ttl)
redis.call('EXPIRE', KEYS[7], ttl)
visit = redis.call('HGET', KEYS[7], 'visitNumber')
ordinal = redis.call('HGET', KEYS[7], 'sessionNumber')
if not firstVisit then
  firstVisit = stamp
  redis.call('HSET', KEYS[1], 'firstVisit', stamp, 'firstPage', event.path, 'firstSource', event.source or 'direct', 'firstReferrerHost', event.referrerHost or '')
end
local history = {event=event.event, at=stamp, path=event.path, visitNumber=tonumber(visit), sessionNumber=tonumber(ordinal)}
local networkState = ''
if event.event == 'session_start' then
  redis.call('HSET', technicalKey, 'v31StartRecorded', '1')
  redis.call('HSET', KEYS[7], 'startRecorded', '1', 'deviceType', event.deviceType, 'deviceFamily', event.deviceFamily, 'browser', event.browser)
  redis.call('HSET', KEYS[1], 'deviceType', event.deviceType, 'deviceFamily', event.deviceFamily or 'Other', 'browser', event.browser)
  history.source, history.referrerHost, history.deviceType, history.deviceFamily, history.browser = event.source, event.referrerHost, event.deviceType, event.deviceFamily, event.browser
  if network ~= '' then
    local previousNetwork = redis.call('GET', KEYS[12])
    networkState = previousNetwork == network and 'same' or 'new'
    redis.call('SET', KEYS[12], network, 'EX', netttl)
  end
end
if not redis.call('HGET', KEYS[7], 'deviceFamily') then
  for _, field in ipairs({'deviceType', 'deviceFamily', 'browser'}) do redis.call('HSET', KEYS[7], field, redis.call('HGET', KEYS[1], field) or 'Other') end
end
redis.call('HSET', KEYS[1], 'lastVisit', stamp, 'lastPage', event.path, 'lastVisitNumber', visit, 'lastSessionId', event.sessionId)
for i=1,#flags,2 do redis.call('HSET', KEYS[1], flags[i], flags[i+1]) end
if event.event == 'page_view' then redis.call('HINCRBY', KEYS[1], 'pageViews', '1') end
if event.event == 'experiment_start' then
  history.experimentId = event.experimentId
  redis.call('SADD', KEYS[4], event.experimentId)
  redis.call('EXPIRE', KEYS[4], ttl)
  redis.call('HINCRBY', KEYS[1], 'experimentStarts', '1')
end
if event.event == 'ai_concept_created' then
  history.conceptId = event.conceptId
  redis.call('HINCRBY', KEYS[1], 'aiConcepts', '1')
  redis.call('HSET', KEYS[1], 'generatedAiConcept', '1', 'lastConceptId', event.conceptId)
end
if event.event == 'brief_completed' then redis.call('HSET', KEYS[1], 'briefCompleted', '1') end
${V31_EVENT_LUA}
if redis.call('SCARD', KEYS[3]) < 200 then redis.call('SADD', KEYS[3], event.path) end
redis.call('RPUSH', KEYS[2], cjson.encode(history))
redis.call('LTRIM', KEYS[2], '-100', '-1')
redis.call('ZADD', KEYS[11], now, event.visitorId)
redis.call('ZREMRANGEBYRANK', KEYS[11], '0', '-5001')
for _, i in ipairs({1,2,3,11}) do redis.call('EXPIRE', KEYS[i], ttl) end
redis.call('SET', KEYS[5], '1', 'EX', ttl)
return cjson.encode({deduplicated=false, context={visitorNumber=tonumber(number), visitNumber=tonumber(visit), sessionNumber=tonumber(ordinal), isNewVisitor=newVisitor, newSession=newSession, firstVisit=firstVisit, previousVisit=redis.call('HGET', KEYS[7], 'previousVisit') or '', firstSource=redis.call('HGET', KEYS[1], 'firstSource') or 'direct', firstReferrerHost=redis.call('HGET', KEYS[1], 'firstReferrerHost') or '', currentSource=redis.call('HGET', KEYS[7], 'source') or 'direct', currentReferrerHost=redis.call('HGET', KEYS[7], 'referrerHost') or '', prior=prior, networkState=networkState, classification=classification, geo=get('geo') or '', attribution=attributionRaw or '', adArrived=adArrived, initialNotify=initialNotify, humanTransition=humanTransition, interestTransition=interestTransition, interestScore=interestScore, burstNotify=burstNotify, burstSize=math.max(cohortSize, networkSize), deviceFamily=get('deviceFamily'), browser=get('browser')}})
`;

export async function commitVisitorEvent(event, flags, ttl, now, options) {
  const base = `sitevl:visitor:v1:${event.visitorId}`;
  const keys = [base, `${base}:history`, `${base}:pages`, `${base}:experiments`, `sitevl:visitor:v1:event:${event.eventId}`, `sitevl:visitor:v1:session:${event.sessionId}`, `${V2_NAMESPACE}:session:${event.sessionId}`, `${V2_NAMESPACE}:identity:${event.visitorId}`, SEQUENCE_KEYS.visitor, SEQUENCE_KEYS.visit, 'sitevl:visitor:v1:index', `${V2_NAMESPACE}:network:${event.visitorId}`, V31_STATS_KEY, cohortKey(event, options), `${V31_NAMESPACE}:network-burst:${options.networkHash || 'disabled'}`];
  const network = /^[a-f0-9]{64}$/.test(options.networkHash || '') ? options.networkHash : '';
  // Legacy timestamp is read only for lazy adoption. EVAL rechecks the active
  // V3.1 pointer atomically, so concurrent tabs cannot allocate duplicate visits.
  const legacy = await redisPipeline([['HGET', base, 'lastVisit']], options);
  const metadata = { geo: options.geo || undefined, attribution: options.attribution || undefined, funnelAction: funnelAction(event), legacyLastMs: Date.parse(legacy[0]?.result || '') || 0 };
  const result = await redisPipeline([['EVAL', VISITOR_EVENT_SCRIPT, String(keys.length), ...keys, JSON.stringify(event), new Date(now).toISOString(), String(now), String(ttl), JSON.stringify(flags), network, String(Math.min(ttl, 86400)), JSON.stringify(metadata), JSON.stringify({ human: CONFIDENCE_RULES, interest: INTEREST_WEIGHTS })]], options);
  return JSON.parse(result[0].result);
}

export const LINK_LEAD_SCRIPT = `
local providedKeys = KEYS
local KEYS = {}
for i, key in ipairs(providedKeys) do KEYS[i] = key end
local bound = redis.call('HGET', KEYS[2], 'visitorId')
if bound ~= ARGV[1] or redis.call('EXISTS', KEYS[1]) == 0 then return 0 end
if redis.call('EXISTS', KEYS[3]) == 1 then return 2 end
local alias = redis.call('HGET', KEYS[2], 'v31AnalyticsKey')
if alias and redis.call('HGET', alias, 'visitorId') == ARGV[1] then KEYS[2] = alias end
local visit = redis.call('HGET', KEYS[2], 'visitNumber')
redis.call('HSET', KEYS[1], 'lastVisit', ARGV[2], 'leadSubmitted', '1', 'leadId', ARGV[3], 'lastConceptId', ARGV[4])
redis.call('HINCRBY', KEYS[1], 'leads', '1')
redis.call('RPUSH', KEYS[4], cjson.encode({event='lead_created', at=ARGV[2], path='/ai-website', conceptId=ARGV[4], leadId=ARGV[3], visitNumber=tonumber(visit)}))
redis.call('LTRIM', KEYS[4], '-100', '-1')
redis.call('EXPIRE', KEYS[1], ARGV[5]); redis.call('EXPIRE', KEYS[4], ARGV[5])
redis.call('SET', KEYS[3], '1', 'EX', ARGV[5])
local attribution = redis.call('HGET', KEYS[2], 'attribution')
if attribution and cjson.decode(attribution).paid == true and redis.call('HSETNX', KEYS[2], 'v31Funnel:lead_created', '1') == 1 then
  redis.call('HINCRBY', KEYS[5], 'lead_created', 1)
end
if alias and redis.call('HSETNX', KEYS[2], 'interest:lead_created', '1') == 1 then
  local interest = math.min(100, tonumber(redis.call('HGET', KEYS[2], 'interestScore') or '0') + tonumber(ARGV[6]))
  local reasons = cjson.decode(redis.call('HGET', KEYS[2], 'interestReasons') or '[]')
  table.insert(reasons, 'lead_created')
  local category = interest >= 60 and 'hot' or interest >= 40 and 'warm' or interest >= 20 and 'interested' or 'normal'
  for _, key in ipairs({KEYS[1], KEYS[2]}) do redis.call('HSET', key, 'interestScore', interest, 'interestReasons', cjson.encode(reasons), 'interestCategory', category) end
end
return 1
`;

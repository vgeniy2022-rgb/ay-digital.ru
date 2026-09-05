import { redisPipeline } from './_labStatsCore.mjs';

export const V2_NAMESPACE = 'sitevl:visitor:v2';
export const SEQUENCE_KEYS = Object.freeze({ visitor: `${V2_NAMESPACE}:visitor-sequence`, visit: `${V2_NAMESPACE}:visit-sequence` });

// One bounded Redis operation: binding, dedup, number allocation, migration,
// session count and history commit cannot interleave with another request.
export const VISITOR_EVENT_SCRIPT = `
local event = cjson.decode(ARGV[1])
local stamp, now, ttl = ARGV[2], tonumber(ARGV[3]), tonumber(ARGV[4])
local flags = cjson.decode(ARGV[5])
local network, netttl = ARGV[6], tonumber(ARGV[7])
local bound = redis.call('GET', KEYS[6])
local sessionBound = redis.call('HGET', KEYS[7], 'visitorId')
if (bound and bound ~= event.visitorId) or (sessionBound and sessionBound ~= event.visitorId) then
  return cjson.encode({conflict=true})
end
if not bound and not sessionBound and event.event ~= 'session_start' then
  return cjson.encode({sessionRequired=true})
end
if redis.call('EXISTS', KEYS[5]) == 1 then return cjson.encode({deduplicated=true}) end
if event.event == 'session_start' and redis.call('HGET', KEYS[7], 'startRecorded') == '1' then
  return cjson.encode({deduplicated=true})
end
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
local newSession = not bound and not sessionBound
if not sessionBound then
  local visit = redis.call('INCR', KEYS[10])
  local ordinal = tonumber(redis.call('HGET', KEYS[1], 'sessions') or '0')
  if newSession then ordinal = redis.call('HINCRBY', KEYS[1], 'sessions', '1') end
  if ordinal < 1 then ordinal = 1; redis.call('HSET', KEYS[1], 'sessions', '1') end
  redis.call('HSET', KEYS[7], 'visitorId', event.visitorId, 'visitNumber', visit, 'sessionNumber', ordinal, 'startedAt', stamp, 'previousVisit', previousVisit, 'source', event.source or 'direct', 'referrerHost', event.referrerHost or '')
end
redis.call('SET', KEYS[6], event.visitorId, 'EX', ttl)
redis.call('EXPIRE', KEYS[7], ttl)
local visit = redis.call('HGET', KEYS[7], 'visitNumber')
local ordinal = redis.call('HGET', KEYS[7], 'sessionNumber')
if not firstVisit then
  firstVisit = stamp
  redis.call('HSET', KEYS[1], 'firstVisit', stamp, 'firstPage', event.path, 'firstSource', event.source or 'direct', 'firstReferrerHost', event.referrerHost or '')
end
local history = {event=event.event, at=stamp, path=event.path, visitNumber=tonumber(visit), sessionNumber=tonumber(ordinal)}
local networkState = ''
if event.event == 'session_start' then
  redis.call('HSET', KEYS[7], 'startRecorded', '1', 'source', event.source, 'referrerHost', event.referrerHost)
  redis.call('HSET', KEYS[1], 'deviceType', event.deviceType, 'deviceFamily', event.deviceFamily or 'Other', 'browser', event.browser, 'currentSource', event.source, 'currentReferrerHost', event.referrerHost)
  history.source, history.referrerHost, history.deviceType, history.deviceFamily, history.browser = event.source, event.referrerHost, event.deviceType, event.deviceFamily, event.browser
  if network ~= '' then
    local previousNetwork = redis.call('GET', KEYS[12])
    networkState = previousNetwork == network and 'same' or 'new'
    redis.call('SET', KEYS[12], network, 'EX', netttl)
  end
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
redis.call('SADD', KEYS[3], event.path)
redis.call('RPUSH', KEYS[2], cjson.encode(history))
redis.call('LTRIM', KEYS[2], '-100', '-1')
redis.call('ZADD', KEYS[11], now, event.visitorId)
redis.call('ZREMRANGEBYRANK', KEYS[11], '0', '-5001')
for _, i in ipairs({1,2,3,11}) do redis.call('EXPIRE', KEYS[i], ttl) end
redis.call('SET', KEYS[5], '1', 'EX', ttl)
return cjson.encode({deduplicated=false, context={visitorNumber=tonumber(number), visitNumber=tonumber(visit), sessionNumber=tonumber(ordinal), isNewVisitor=newVisitor, newSession=newSession, firstVisit=firstVisit, previousVisit=redis.call('HGET', KEYS[7], 'previousVisit') or '', firstSource=redis.call('HGET', KEYS[1], 'firstSource') or 'direct', firstReferrerHost=redis.call('HGET', KEYS[1], 'firstReferrerHost') or '', currentSource=redis.call('HGET', KEYS[7], 'source') or 'direct', currentReferrerHost=redis.call('HGET', KEYS[7], 'referrerHost') or '', prior=prior, networkState=networkState}})
`;

export async function commitVisitorEvent(event, flags, ttl, now, options) {
  const base = `sitevl:visitor:v1:${event.visitorId}`;
  const keys = [base, `${base}:history`, `${base}:pages`, `${base}:experiments`, `sitevl:visitor:v1:event:${event.eventId}`, `sitevl:visitor:v1:session:${event.sessionId}`, `${V2_NAMESPACE}:session:${event.sessionId}`, `${V2_NAMESPACE}:identity:${event.visitorId}`, SEQUENCE_KEYS.visitor, SEQUENCE_KEYS.visit, 'sitevl:visitor:v1:index', `${V2_NAMESPACE}:network:${event.visitorId}`];
  const network = /^[a-f0-9]{64}$/.test(options.networkHash || '') ? options.networkHash : '';
  const result = await redisPipeline([['EVAL', VISITOR_EVENT_SCRIPT, String(keys.length), ...keys, JSON.stringify(event), new Date(now).toISOString(), String(now), String(ttl), JSON.stringify(flags), network, String(Math.min(ttl, 86400))]], options);
  return JSON.parse(result[0].result);
}

export const LINK_LEAD_SCRIPT = `
local bound = redis.call('HGET', KEYS[2], 'visitorId')
if bound ~= ARGV[1] or redis.call('EXISTS', KEYS[1]) == 0 then return 0 end
if redis.call('EXISTS', KEYS[3]) == 1 then return 2 end
local visit = redis.call('HGET', KEYS[2], 'visitNumber')
redis.call('HSET', KEYS[1], 'lastVisit', ARGV[2], 'leadSubmitted', '1', 'leadId', ARGV[3], 'lastConceptId', ARGV[4])
redis.call('HINCRBY', KEYS[1], 'leads', '1')
redis.call('RPUSH', KEYS[4], cjson.encode({event='lead_created', at=ARGV[2], path='/ai-website', conceptId=ARGV[4], leadId=ARGV[3], visitNumber=tonumber(visit)}))
redis.call('LTRIM', KEYS[4], '-100', '-1')
redis.call('EXPIRE', KEYS[1], ARGV[5]); redis.call('EXPIRE', KEYS[4], ARGV[5])
redis.call('SET', KEYS[3], '1', 'EX', ARGV[5])
return 1
`;

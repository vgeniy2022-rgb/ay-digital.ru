import { createHash } from 'node:crypto';

export const V31_NAMESPACE = 'sitevl:visitor:v31';
export const V31_STATS_KEY = `${V31_NAMESPACE}:stats`;
// These are rule points, NOT calibrated probabilities. No geo/city score exists.
export const CONFIDENCE_RULES = Object.freeze({
  baseline: 35, dwell: [0, 3, 10, 15, 18], pages: [0, 0, 7, 15],
  interaction: 8, link: 7, form: 5, scroll: 3, returning: 8,
  cohortBurst: -5, linuxBurst: -25, networkBurst: -30,
  traversal: -45, sessionVelocity: -15, legacyVolume: -5,
});
export const INTEREST_WEIGHTS = Object.freeze({ view_services: 5, view_cases: 10, view_prices: 15,
  repeat_prices: 10, open_contacts: 15, telegram_click: 20, whatsapp_click: 20,
  brief_start: 15, brief_complete: 30, lead_created: 40, returning: 10 });
export const REASON_CODES = Object.freeze(['insufficient-evidence', 'visible-dwell', 'multiple-pages',
  'interaction-category', 'visible-link-navigation', 'form-focus', 'scroll-milestone', 'return-after-gap',
  'cohort-burst', 'linux-burst', 'network-burst', 'independent-behavior-after-burst',
  'sequential-traversal', 'high-session-velocity', 'legacy-volume-with-traversal', 'short-observation']);

export function coarseBrowser(userAgent = '') {
  const ua = String(userAgent).slice(0, 2000);
  const deviceFamily = /iPhone|iPod/.test(ua) ? 'iPhone' : /iPad/.test(ua) ? 'iPad' : /Android/.test(ua) ? 'Android' : /Macintosh|Mac OS X/.test(ua) ? 'Mac' : /Windows/.test(ua) ? 'Windows' : /Linux/.test(ua) ? 'Linux' : 'Other';
  const browser = /Edg(?:A|iOS)?\//.test(ua) ? 'Edge' : /OPR\//.test(ua) ? 'Opera' : /Firefox|FxiOS/.test(ua) ? 'Firefox' : /Chrome|CriOS/.test(ua) ? 'Chrome' : /Safari/.test(ua) ? 'Safari' : 'Other';
  return { deviceFamily, browser, deviceType: /iPad|Tablet|Android(?!.*Mobile)/.test(ua) ? 'tablet' : /iPhone|iPod|Android.*Mobile/.test(ua) ? 'mobile' : 'desktop' };
}

// Shared short-lived cohort, not a persistent device fingerprint or identity.
// Country/region only narrow a cohort; they never imply a hosting network.
export function cohortKey(event, options = {}) {
  const platform = options.browser || { deviceFamily: 'Other', browser: 'Other' };
  const tuple = [platform.deviceFamily, platform.browser, event.path, options.geo?.country || '',
    options.geo?.region || '', options.attribution?.campaign || event.source || 'direct'];
  return `${V31_NAMESPACE}:burst:${createHash('sha256').update(JSON.stringify(tuple)).digest('hex').slice(0, 24)}`;
}

// Embedded in the same existing visitor EVAL; no read/compute/write race.
export const V31_EVENT_LUA = `
local rules = cjson.decode(ARGV[9])
local weights, human = rules.interest, rules.human
local function get(field) return redis.call('HGET', KEYS[7], field) end
local function num(field) return tonumber(get(field) or '0') end
local function set(field, value) redis.call('HSET', KEYS[7], field, value) end
local function once(field) return redis.call('HSETNX', KEYS[7], field, '1') == 1 end
local function interest(action)
  if weights[action] and once('interest:' .. action) then
    set('interestScore', math.min(100, num('interestScore') + weights[action]))
  end
end
if metadata.geo then
  local geo = cjson.encode(metadata.geo)
  set('geo', geo); redis.call('HSET', KEYS[1], 'geo', geo)
end
if metadata.attribution and not get('attribution') then
  local attribution = cjson.encode(metadata.attribution)
  set('attribution', attribution); set('source', metadata.attribution.source)
  set('referrerHost', metadata.attribution.referrerHost or '')
  redis.call('HSETNX', KEYS[1], 'firstAttribution', attribution)
  redis.call('HSET', KEYS[1], 'currentAttribution', attribution)
end
local attributionRaw = get('attribution')
local paid = attributionRaw and cjson.decode(attributionRaw).paid == true
local adArrived = paid and once('v31AdVisit')
redis.call('HSETNX', KEYS[13], 'since', stamp)
if adArrived then redis.call('HINCRBY', KEYS[13], 'paidAdTechnicalVisits', 1) end
if paid then history.attribution = cjson.decode(attributionRaw) end
redis.call('HSET', KEYS[1], 'currentSource', get('source') or 'direct', 'currentReferrerHost', get('referrerHost') or '')

if not get('cohortKey') then set('cohortKey', KEYS[14]) end
local cohort = get('cohortKey')
local netcohort = network ~= '' and KEYS[15] or nil
local function prune(key)
  redis.call('ZREMRANGEBYSCORE', key, '-inf', now - 10000)
end
prune(cohort)
if newVisitor then redis.call('ZADD', cohort, now, event.visitorId); redis.call('EXPIRE', cohort, 60) end
local cohortSize = redis.call('ZCARD', cohort)
local networkSize = 0
if netcohort then
  prune(netcohort)
  if newVisitor then redis.call('ZADD', netcohort, now, event.visitorId); redis.call('EXPIRE', netcohort, 60) end
  networkSize = redis.call('ZCARD', netcohort)
end
if cohortSize >= 6 then set('burstObserved', 1) end
if networkSize >= 6 then set('networkBurstObserved', 1) end
local burst = num('burstObserved') == 1 or num('networkBurstObserved') == 1
local burstNotify = false
if burst then
  local alertKey = (networkSize >= 6 and netcohort or cohort) .. ':alert'
  burstNotify = redis.call('SET', alertKey, '1', 'NX', 'EX', 1800) ~= false
end

local age = math.max(0, now - num('observedAtMs'))
local pageKey = KEYS[7] .. ':pages'
if event.event == 'page_view' or event.event == 'session_start' then
  if redis.call('SCARD', pageKey) < 100 then redis.call('SADD', pageKey, event.path) end
  redis.call('EXPIRE', pageKey, ttl)
end
local pageCount = redis.call('SCARD', pageKey)
if event.event == 'page_view' and get('previousPage') ~= event.path then
  local previous = num('pageAtMs')
  if previous > 0 then
    local interval = math.max(0, now - previous)
    local oldInterval = num('pageInterval')
    if interval <= 10000 then set('rapidPages', num('rapidPages') + 1) end
    if oldInterval > 0 and math.abs(interval - oldInterval) <= math.max(250, oldInterval * 0.1) then
      set('regularPages', num('regularPages') + 1)
    end
    set('pageInterval', interval)
  end
  set('pageAtMs', now); set('previousPage', event.path)
end
if event.event == 'behavior' then
  local b = event.behavior
  -- Cumulative bucket per observation window. Client clocks/visibility are NOT proof.
  local limits = {0, 10000, 30000, 120000, 300000}
  local dwell = 0
  for i=1,5 do if b.dwell >= i-1 and age >= limits[i] then dwell = i-1 end end
  set('dwell', math.max(num('dwell'), dwell))
  set('scroll', math.max(num('scroll'), b.scroll))
  for _, kind in ipairs({'pointer', 'touch', 'keyboard', 'link', 'form'}) do
    if b[kind] then set('behavior:' .. kind, 1) end
  end
  history.behavior = {dwell=num('dwell'), scroll=num('scroll')}
end
-- Old cached V3 clients remain compatible, but their one click / 8s timer
-- no longer assert human status and do not earn the new behavioral points.
if event.channel then history.channel = event.channel end
local interacted = num('behavior:pointer') + num('behavior:touch') + num('behavior:keyboard') > 0
local link = num('behavior:link') > 0
local independent = interacted and link and num('dwell') >= 2 and pageCount >= 3 and age >= 30000
local reasons = {'insufficient-evidence'}
local score = human.baseline
local function add(points, reason) score = score + points; table.insert(reasons, reason) end
if num('dwell') > 0 then add(human.dwell[num('dwell') + 1], 'visible-dwell') end
if pageCount >= 2 then add(human.pages[math.min(4, pageCount + 1)], 'multiple-pages') end
if interacted then add(human.interaction, 'interaction-category') end
if link then add(human.link, 'visible-link-navigation') end
if num('behavior:form') > 0 then add(human.form, 'form-focus') end
if num('scroll') > 0 then add(human.scroll, 'scroll-milestone') end
if num('returnAfterGap') == 1 then add(human.returning, 'return-after-gap') end
if burst then
  if independent then table.insert(reasons, 'independent-behavior-after-burst')
  elseif paid then add(human.cohortBurst, 'cohort-burst')
  elseif num('networkBurstObserved') == 1 then add(human.networkBurst, 'network-burst')
  elseif get('deviceFamily') == 'Linux' then add(human.linuxBurst, 'linux-burst')
  else add(human.cohortBurst, 'cohort-burst') end
end
local traversal = pageCount >= 12 and (num('rapidPages') >= 10 or num('regularPages') >= 8) and not independent
if traversal then
  add(human.traversal, 'sequential-traversal')
  if tonumber(redis.call('HGET', KEYS[1], 'sessions') or '0') >= 100 then add(human.legacyVolume, 'legacy-volume-with-traversal') end
end
if num('sessionVelocity') >= 6 and pageCount >= 8 and num('regularPages') >= 6 and not independent then add(human.sessionVelocity, 'high-session-velocity') end
score = math.max(0, math.min(100, score))
if age < 30000 and score >= 60 then score = 59; table.insert(reasons, 'short-observation') end
local classification = score < 25 and 'likely-bot' or score < 60 and 'unknown' or score < 80 and 'likely-human' or 'human'
local oldClass = get('classification')
local function counter(class)
  if class == 'human' or class == 'likely-human' then return 'humanVisits' end
  return class == 'likely-bot' and 'likelyBotVisits' or 'unknownVisits'
end
if not oldClass then redis.call('HINCRBY', KEYS[13], 'technicalVisits', 1) end
if not oldClass or counter(oldClass) ~= counter(classification) then
  if oldClass then redis.call('HINCRBY', KEYS[13], counter(oldClass), -1) end
  redis.call('HINCRBY', KEYS[13], counter(classification), 1)
end
local isHuman = score >= 60
local wasHuman = oldClass == 'human' or oldClass == 'likely-human'
local function unique(delta, profileField, totalField)
  local before = tonumber(redis.call('HGET', KEYS[1], profileField) or '0')
  local after = math.max(0, before + delta)
  redis.call('HSET', KEYS[1], profileField, after)
  if before == 0 and after > 0 then redis.call('HINCRBY', KEYS[13], totalField, 1) end
  if before > 0 and after == 0 then redis.call('HINCRBY', KEYS[13], totalField, -1) end
end
if isHuman ~= wasHuman then unique(isHuman and 1 or -1, 'v31HumanSessions', 'uniqueHumanVisitors') end
local countedPaid = num('v31PaidHuman') == 1
if (paid and isHuman) ~= countedPaid then
  local delta = paid and isHuman and 1 or -1
  set('v31PaidHuman', delta == 1 and 1 or 0)
  redis.call('HINCRBY', KEYS[13], 'paidAdHumanVisits', delta)
  unique(delta, 'v31PaidHumanSessions', 'paidAdUniqueHumans')
end
set('classification', classification); set('classificationScore', score)
set('classificationReasons', cjson.encode(reasons))
if num('returnAfterGap') == 1 then interest('returning') end
local action = metadata.funnelAction or ''
interest(action)
if action == 'view_prices' then
  if num('priceAtMs') > 0 and now - num('priceAtMs') >= 10000 then interest('repeat_prices') end
  set('priceAtMs', now)
end
if action ~= '' and paid and once('v31Funnel:' .. action) then redis.call('HINCRBY', KEYS[13], action, 1) end
local interestReasons = {}
for name, _ in pairs(weights) do if get('interest:' .. name) then table.insert(interestReasons, name) end end
table.sort(interestReasons)
set('interestReasons', #interestReasons == 0 and '[]' or cjson.encode(interestReasons))
local interestScore = num('interestScore')
local interestCategory = interestScore >= 60 and 'hot' or interestScore >= 40 and 'warm' or interestScore >= 20 and 'interested' or 'normal'
set('interestCategory', interestCategory)
local humanTransition = isHuman and once('notified:human')
local interestTransition = ''
if isHuman and interestScore >= 40 then
  if interestScore >= 60 then
    if once('notified:hot') then interestTransition = 'hot' end
    once('notified:warm')
  elseif once('notified:warm') then interestTransition = 'warm' end
end
for _, field in ipairs({'classification', 'classificationScore', 'classificationReasons', 'interestScore', 'interestCategory', 'interestReasons'}) do
  redis.call('HSET', KEYS[1], field, get(field) or '0')
end
history.classification = classification
local initialNotify = false
if newSession then
  -- One early unknown notice per coarse entry cohort / 10s, then one burst alert.
  initialNotify = redis.call('SET', cohort .. ':initial:' .. math.floor(now / 10000), '1', 'NX', 'EX', 10) ~= false
end
`;

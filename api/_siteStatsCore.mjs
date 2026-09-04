import { redisPipeline } from './_labStatsCore.mjs';

export const SITE_STATS_KEYS = Object.freeze({
  visits: 'sitevl:site:visits',
  visitors: 'sitevl:site:visitors',
});

const VISITOR_ID_PATTERN = /^(?:SV-[A-F0-9]{6}|visitor-[a-f0-9]{32}|visitor-[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;
const SESSION_ID_PATTERN = /^session-(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;
const MAX_REQUESTS_PER_MINUTE = 10;
const VISIT_SESSION_TTL_SECONDS = 6 * 60 * 60;
const requestWindows = new Map();

const plainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

function hasExactKeys(value, expected) {
  const actual = Object.keys(value).sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

function safeCount(value) {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : 0;
}

export function validateSiteTrackBody(raw) {
  if (!plainObject(raw) || !hasExactKeys(raw, ['event', 'sessionId', 'visitorId']) || raw.event !== 'site_visit') {
    return { ok: false, error: 'Некорректный формат события.' };
  }
  if (!SESSION_ID_PATTERN.test(raw.sessionId) || !VISITOR_ID_PATTERN.test(raw.visitorId)) {
    return { ok: false, error: 'Некорректный анонимный идентификатор.' };
  }
  return { ok: true, value: { event: 'site_visit', sessionId: raw.sessionId, visitorId: raw.visitorId } };
}

export function parseSiteStatsResults(results) {
  if (!Array.isArray(results) || results.length !== 2 || results.some((entry) => entry?.error)) throw new Error('invalid stats response');
  return {
    visits: safeCount(results[0]?.result),
    uniqueVisitors: safeCount(results[1]?.result),
  };
}

function checkMemoryRate(sessionId, now = Date.now()) {
  const recent = (requestWindows.get(sessionId) || []).filter((stamp) => now - stamp < 60_000);
  if (recent.length >= MAX_REQUESTS_PER_MINUTE) return false;
  recent.push(now);
  requestWindows.set(sessionId, recent);
  if (requestWindows.size > 4000) requestWindows.clear();
  return true;
}

async function checkRedisRate(sessionId, options) {
  const result = await redisPipeline([
    ['INCR', `sitevl:site:rate:${sessionId}`],
    ['EXPIRE', `sitevl:site:rate:${sessionId}`, '60'],
  ], options);
  return safeCount(result[0]?.result) <= MAX_REQUESTS_PER_MINUTE;
}

export async function readSiteStats(options = {}) {
  const result = await redisPipeline([
    ['GET', SITE_STATS_KEYS.visits],
    ['SCARD', SITE_STATS_KEYS.visitors],
  ], options);
  return parseSiteStatsResults(result);
}

export async function trackSiteVisit(event, options = {}) {
  if (!checkMemoryRate(event.sessionId, options.now?.() ?? Date.now())) return { accepted: false, rateLimited: true, deduplicated: false };
  if (!await checkRedisRate(event.sessionId, options)) return { accepted: false, rateLimited: true, deduplicated: false };

  const claim = await redisPipeline([
    ['SET', `sitevl:site:visit-session:${event.sessionId}`, '1', 'NX', 'EX', String(VISIT_SESSION_TTL_SECONDS)],
    ['SADD', SITE_STATS_KEYS.visitors, event.visitorId],
  ], options);
  const isNewVisit = claim[0]?.result === 'OK';
  if (isNewVisit) await redisPipeline([['INCR', SITE_STATS_KEYS.visits]], options);
  return { accepted: true, rateLimited: false, deduplicated: !isNewVisit };
}

export function resetSiteStatsRateLimitsForTests() {
  requestWindows.clear();
}

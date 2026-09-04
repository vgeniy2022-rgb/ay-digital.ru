export const LAB_PUBLIC_EXPERIMENT_IDS = Object.freeze(['builder', 'canvas', 'physics', 'modern-os', 'retro']);

export const LAB_STATS_KEYS = Object.freeze({
  visits: 'sitevl:lab:visits',
  visitors: 'sitevl:lab:visitors',
  experimentStarts: 'sitevl:lab:experiment-starts',
});

const experimentIdSet = new Set(LAB_PUBLIC_EXPERIMENT_IDS);
const requestWindows = new Map();
const ANONYMOUS_ID_PATTERN = /^(?:visitor|session|event)-[a-f0-9]{32}$|^(?:visitor|session|event)-[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const VISITOR_ID_PATTERN = /^(?:SV-[A-F0-9]{6}|visitor-[a-f0-9]{32}|visitor-[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;
const MAX_REQUESTS_PER_MINUTE = 30;
const VISIT_SESSION_TTL_SECONDS = 6 * 60 * 60;
const EXPERIMENT_EVENT_TTL_SECONDS = 60 * 60;

const plainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

export function redisConfiguration(environment = process.env) {
  return {
    url: environment.AI_LEADS_REDIS_REST_URL || environment.UPSTASH_REDIS_REST_URL || environment.KV_REST_API_URL,
    token: environment.AI_LEADS_REDIS_REST_TOKEN || environment.UPSTASH_REDIS_REST_TOKEN || environment.KV_REST_API_TOKEN,
  };
}

export function isLabStatsStorageConfigured(environment = process.env) {
  const redis = redisConfiguration(environment);
  return Boolean(redis.url && redis.token);
}

function hasExactKeys(value, expected) {
  const actual = Object.keys(value).sort();
  return actual.length === expected.length && actual.every((key, index) => key === expected[index]);
}

export function validateLabTrackBody(raw) {
  if (!plainObject(raw) || typeof raw.event !== 'string') return { ok: false, error: 'Некорректный формат события.' };

  if (raw.event === 'lab_visit') {
    if (!hasExactKeys(raw, ['event', 'sessionId', 'visitorId'])) return { ok: false, error: 'Некорректные поля события.' };
    if (!ANONYMOUS_ID_PATTERN.test(raw.sessionId) || !VISITOR_ID_PATTERN.test(raw.visitorId)) return { ok: false, error: 'Некорректный анонимный идентификатор.' };
    if (!String(raw.sessionId).startsWith('session-')) return { ok: false, error: 'Некорректный анонимный идентификатор.' };
    return { ok: true, value: { event: 'lab_visit', sessionId: raw.sessionId, visitorId: raw.visitorId } };
  }

  if (raw.event === 'experiment_start') {
    if (!hasExactKeys(raw, ['event', 'eventId', 'experimentId', 'sessionId'])) return { ok: false, error: 'Некорректные поля события.' };
    if (!ANONYMOUS_ID_PATTERN.test(raw.sessionId) || !ANONYMOUS_ID_PATTERN.test(raw.eventId)) return { ok: false, error: 'Некорректный анонимный идентификатор.' };
    if (!String(raw.sessionId).startsWith('session-') || !String(raw.eventId).startsWith('event-')) return { ok: false, error: 'Некорректный анонимный идентификатор.' };
    if (!experimentIdSet.has(raw.experimentId)) return { ok: false, error: 'Неизвестный эксперимент.' };
    return { ok: true, value: { event: 'experiment_start', eventId: raw.eventId, experimentId: raw.experimentId, sessionId: raw.sessionId } };
  }

  return { ok: false, error: 'Неизвестный тип события.' };
}

function safeCount(value) {
  const count = Number(value);
  return Number.isSafeInteger(count) && count >= 0 ? count : 0;
}

function parseExperimentHash(value) {
  if (plainObject(value)) return value;
  if (!Array.isArray(value)) return {};
  const parsed = {};
  for (let index = 0; index < value.length - 1; index += 2) parsed[String(value[index])] = value[index + 1];
  return parsed;
}

export function createEmptyLabStats() {
  return {
    visits: 0,
    uniqueVisitors: 0,
    experiments: Object.fromEntries(LAB_PUBLIC_EXPERIMENT_IDS.map((id) => [id, 0])),
  };
}

export function parseLabStatsResults(results) {
  if (!Array.isArray(results) || results.length !== 3 || results.some((entry) => entry?.error)) throw new Error('invalid stats response');
  const experimentHash = parseExperimentHash(results[2]?.result);
  return {
    visits: safeCount(results[0]?.result),
    uniqueVisitors: safeCount(results[1]?.result),
    experiments: Object.fromEntries(LAB_PUBLIC_EXPERIMENT_IDS.map((id) => [id, safeCount(experimentHash[id])])),
  };
}

export async function redisPipeline(commands, { fetchImpl = fetch, environment = process.env, timeoutMs = 5000 } = {}) {
  const redis = redisConfiguration(environment);
  if (!redis.url || !redis.token) throw new Error('storage unavailable');
  const response = await fetchImpl(`${redis.url.replace(/\/$/, '')}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${redis.token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(commands),
    signal: AbortSignal.timeout(timeoutMs),
  });
  if (!response.ok) throw new Error('storage request failed');
  const result = await response.json();
  if (!Array.isArray(result) || result.length !== commands.length || result.some((entry) => entry?.error)) throw new Error('storage pipeline failed');
  return result;
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
  const rateKey = `sitevl:lab:rate:${sessionId}`;
  const result = await redisPipeline([
    ['INCR', rateKey],
    ['EXPIRE', rateKey, '60'],
  ], options);
  return safeCount(result[0]?.result) <= MAX_REQUESTS_PER_MINUTE;
}

export async function readLabStats(options = {}) {
  const result = await redisPipeline([
    ['GET', LAB_STATS_KEYS.visits],
    ['SCARD', LAB_STATS_KEYS.visitors],
    ['HGETALL', LAB_STATS_KEYS.experimentStarts],
  ], options);
  return parseLabStatsResults(result);
}

export async function trackLabEvent(event, options = {}) {
  if (!checkMemoryRate(event.sessionId, options.now?.() ?? Date.now())) return { accepted: false, rateLimited: true, deduplicated: false };
  if (!await checkRedisRate(event.sessionId, options)) return { accepted: false, rateLimited: true, deduplicated: false };

  if (event.event === 'lab_visit') {
    const dedupKey = `sitevl:lab:visit-session:${event.sessionId}`;
    const claim = await redisPipeline([
      ['SET', dedupKey, '1', 'NX', 'EX', String(VISIT_SESSION_TTL_SECONDS)],
      ['SADD', LAB_STATS_KEYS.visitors, event.visitorId],
    ], options);
    const isNewVisit = claim[0]?.result === 'OK';
    if (isNewVisit) await redisPipeline([['INCR', LAB_STATS_KEYS.visits]], options);
    return { accepted: true, rateLimited: false, deduplicated: !isNewVisit };
  }

  const dedupKey = `sitevl:lab:experiment-event:${event.eventId}`;
  const claim = await redisPipeline([
    ['SET', dedupKey, '1', 'NX', 'EX', String(EXPERIMENT_EVENT_TTL_SECONDS)],
  ], options);
  const isNewStart = claim[0]?.result === 'OK';
  if (isNewStart) await redisPipeline([
    ['HINCRBY', LAB_STATS_KEYS.experimentStarts, event.experimentId, '1'],
  ], options);
  return { accepted: true, rateLimited: false, deduplicated: !isNewStart };
}

export function resetLabStatsRateLimitsForTests() {
  requestWindows.clear();
}

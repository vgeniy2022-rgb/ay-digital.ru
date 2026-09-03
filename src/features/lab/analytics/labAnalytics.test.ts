import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
// @ts-expect-error Vercel serverless handlers are native ESM JavaScript modules.
import labStatsHandler from '../../../../api/lab-stats.mjs';
// @ts-expect-error Shared server analytics is a native ESM JavaScript module.
import { LAB_PUBLIC_EXPERIMENT_IDS, LAB_STATS_KEYS, readLabStats, resetLabStatsRateLimitsForTests, trackLabEvent, validateLabTrackBody } from '../../../../api/_labStatsCore.mjs';
import { labPublicExperimentIds } from '../core/catalog';
import {
  LAB_SESSION_ID_KEY,
  LAB_VISITOR_ID_KEY,
  LAB_VISIT_TRACKED_KEY,
  createAnonymousId,
  ensureLabIdentity,
  getExperimentEventId,
  isLabVisitTracked,
  markLabVisitTracked,
  parseLabStats,
} from './labAnalytics';

function createStorage() {
  const values = new Map<string, string>();
  return {
    getItem(key: string) { return values.get(key) ?? null; },
    setItem(key: string, value: string) { values.set(key, value); },
    values,
  };
}

function responseCapture() {
  let body = '';
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    setHeader(key: string, value: string) { this.headers[key] = value; },
    end(value: string) { body = value; },
    result() { return { status: this.statusCode, headers: this.headers, body: JSON.parse(body) as Record<string, unknown> }; },
  };
}

function anonymousId(kind: 'visitor' | 'session' | 'event', index = 1) {
  return `${kind}-00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
}

function createRedisMock() {
  const strings = new Map<string, string>();
  const sets = new Map<string, Set<string>>();
  const hashes = new Map<string, Map<string, number>>();
  const commands: unknown[][] = [];

  const fetchImpl = async (_url: string | URL | Request, init?: RequestInit) => {
    const pipeline = JSON.parse(String(init?.body || '[]')) as Array<Array<string>>;
    const result = pipeline.map((command) => {
      commands.push(command);
      const [name, key, ...args] = command;
      if (name === 'INCR') {
        const next = Number(strings.get(key) || 0) + 1;
        strings.set(key, String(next));
        return { result: next };
      }
      if (name === 'EXPIRE') return { result: strings.has(key) ? 1 : 0 };
      if (name === 'SET') {
        const nx = args.includes('NX');
        if (nx && strings.has(key)) return { result: null };
        strings.set(key, args[0]);
        return { result: 'OK' };
      }
      if (name === 'SADD') {
        const set = sets.get(key) || new Set<string>();
        const before = set.size;
        set.add(args[0]);
        sets.set(key, set);
        return { result: set.size === before ? 0 : 1 };
      }
      if (name === 'SCARD') return { result: sets.get(key)?.size || 0 };
      if (name === 'HINCRBY') {
        const hash = hashes.get(key) || new Map<string, number>();
        const next = (hash.get(args[0]) || 0) + Number(args[1]);
        hash.set(args[0], next);
        hashes.set(key, hash);
        return { result: next };
      }
      if (name === 'HGETALL') return { result: Array.from(hashes.get(key)?.entries() || []).flatMap(([field, value]) => [field, String(value)]) };
      if (name === 'GET') return { result: strings.get(key) ?? null };
      return { error: 'unsupported test command' };
    });
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };

  return { fetchImpl: fetchImpl as typeof fetch, strings, sets, hashes, commands };
}

test('anonymous visitor generation uses randomUUID and a secure random-values fallback', () => {
  const uuidCrypto = {
    randomUUID: () => '12345678-1234-4234-9234-123456789abc' as `${string}-${string}-${string}-${string}-${string}`,
    getRandomValues: <T extends ArrayBufferView | null>(array: T) => array,
  };
  assert.equal(createAnonymousId('visitor', uuidCrypto), 'visitor-12345678-1234-4234-9234-123456789abc');

  const fallbackCrypto = {
    getRandomValues: <T extends ArrayBufferView | null>(array: T) => {
      if (array instanceof Uint8Array) array.fill(10);
      return array;
    },
  };
  assert.equal(createAnonymousId('session', fallbackCrypto), `session-${'0a'.repeat(16)}`);
});

test('LAB visit identity persists and session marker prevents refresh inflation', () => {
  const local = createStorage();
  const session = createStorage();
  const first = ensureLabIdentity(local, session);
  const second = ensureLabIdentity(local, session);
  assert.equal(first.visitorId, second.visitorId);
  assert.equal(first.sessionId, second.sessionId);
  assert.equal(local.values.get(LAB_VISITOR_ID_KEY), first.visitorId);
  assert.equal(session.values.get(LAB_SESSION_ID_KEY), first.sessionId);
  assert.equal(isLabVisitTracked(session), false);
  markLabVisitTracked(session);
  assert.equal(session.values.get(LAB_VISIT_TRACKED_KEY), 'true');
  assert.equal(isLabVisitTracked(session), true);
});

test('experiment event id is stable for one navigation and changes for a new entrance', () => {
  const session = createStorage();
  const first = getExperimentEventId(session, 'route-a', 'modern-os');
  assert.equal(getExperimentEventId(session, 'route-a', 'modern-os'), first);
  assert.notEqual(getExperimentEventId(session, 'route-b', 'modern-os'), first);
});

test('server experiment allowlist stays synchronized with the public LAB catalogue', () => {
  assert.deepEqual(LAB_PUBLIC_EXPERIMENT_IDS, labPublicExperimentIds);
});

test('server rejects arbitrary events, traversal ids and client-provided Redis keys', () => {
  const sessionId = anonymousId('session');
  const eventId = anonymousId('event');
  assert.equal(validateLabTrackBody({ event: 'arbitrary', sessionId }).ok, false);
  assert.equal(validateLabTrackBody({ event: 'experiment_start', experimentId: '../../secret', sessionId, eventId }).ok, false);
  assert.equal(validateLabTrackBody({ event: 'experiment_start', experimentId: 'modern-os', sessionId, eventId, redisKey: 'private' }).ok, false);
});

test('POST handler rejects oversized bodies before analytics processing', async () => {
  const response = responseCapture();
  await labStatsHandler({ method: 'POST', headers: { 'content-type': 'application/json' }, body: { event: 'lab_visit', padding: 'x'.repeat(5000) } }, response);
  assert.equal(response.result().status, 413);
});

test('visit and experiment counters use atomic Redis operations and deduplicate retries', async () => {
  resetLabStatsRateLimitsForTests();
  const redis = createRedisMock();
  const options = { fetchImpl: redis.fetchImpl, environment: { KV_REST_API_URL: 'https://redis.test', KV_REST_API_TOKEN: 'test-token' } };
  const visit = { event: 'lab_visit' as const, sessionId: anonymousId('session'), visitorId: anonymousId('visitor') };
  assert.equal((await trackLabEvent(visit, options)).deduplicated, false);
  assert.equal((await trackLabEvent(visit, options)).deduplicated, true);

  const start = { event: 'experiment_start' as const, sessionId: visit.sessionId, eventId: anonymousId('event'), experimentId: 'modern-os' };
  assert.equal((await trackLabEvent(start, options)).deduplicated, false);
  assert.equal((await trackLabEvent(start, options)).deduplicated, true);

  const stats = await readLabStats(options);
  assert.equal(stats.visits, 1);
  assert.equal(stats.uniqueVisitors, 1);
  assert.equal(stats.experiments['modern-os'], 1);
  assert.equal(redis.commands.filter(([name, key]) => name === 'INCR' && key === LAB_STATS_KEYS.visits).length, 1);
  assert.equal(redis.commands.filter(([name, key]) => name === 'HINCRBY' && key === LAB_STATS_KEYS.experimentStarts).length, 1);
  assert.equal(redis.commands.some(([name, key]) => name === 'SET' && key === LAB_STATS_KEYS.visits), false);
});

test('concurrent unique sessions increment the global visit counter without read-modify-write', async () => {
  resetLabStatsRateLimitsForTests();
  const redis = createRedisMock();
  const options = { fetchImpl: redis.fetchImpl, environment: { KV_REST_API_URL: 'https://redis.test', KV_REST_API_TOKEN: 'test-token' } };
  await Promise.all(Array.from({ length: 20 }, (_, index) => trackLabEvent({
    event: 'lab_visit',
    sessionId: anonymousId('session', index + 10),
    visitorId: anonymousId('visitor', index + 10),
  }, options)));
  const stats = await readLabStats(options);
  assert.equal(stats.visits, 20);
  assert.equal(stats.uniqueVisitors, 20);
});

test('anonymous session rate limit bounds repeated analytics writes', async () => {
  resetLabStatsRateLimitsForTests();
  const redis = createRedisMock();
  const options = { fetchImpl: redis.fetchImpl, environment: { KV_REST_API_URL: 'https://redis.test', KV_REST_API_TOKEN: 'test-token' } };
  const sessionId = anonymousId('session', 500);
  const results = [];
  for (let index = 0; index < 31; index += 1) {
    results.push(await trackLabEvent({ event: 'experiment_start', sessionId, eventId: anonymousId('event', 600 + index), experimentId: 'retro' }, options));
  }
  assert.equal(results.slice(0, 30).every((result) => result.accepted), true);
  assert.equal(results[30].rateLimited, true);
  const stats = await readLabStats(options);
  assert.equal(stats.experiments.retro, 30);
});

test('GET handler returns only the public aggregate stats schema', async () => {
  resetLabStatsRateLimitsForTests();
  const previousFetch = globalThis.fetch;
  const previousUrl = process.env.KV_REST_API_URL;
  const previousToken = process.env.KV_REST_API_TOKEN;
  const redis = createRedisMock();
  globalThis.fetch = redis.fetchImpl;
  process.env.KV_REST_API_URL = 'https://redis.test';
  process.env.KV_REST_API_TOKEN = 'test-token';
  try {
    const response = responseCapture();
    await labStatsHandler({ method: 'GET', headers: {} }, response);
    const result = response.result();
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { visits: 0, uniqueVisitors: 0, experiments: { builder: 0, canvas: 0, physics: 0, 'modern-os': 0, retro: 0 } });
    assert.equal('visitorId' in result.body, false);
    assert.match(result.headers['Cache-Control'], /s-maxage=30/);
    assert.deepEqual(parseLabStats(result.body, labPublicExperimentIds), result.body);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.KV_REST_API_URL; else process.env.KV_REST_API_URL = previousUrl;
    if (previousToken === undefined) delete process.env.KV_REST_API_TOKEN; else process.env.KV_REST_API_TOKEN = previousToken;
  }
});

test('Redis failure returns a generic fallback and never breaks the LAB contract', async () => {
  const previousFetch = globalThis.fetch;
  const previousUrl = process.env.KV_REST_API_URL;
  const previousToken = process.env.KV_REST_API_TOKEN;
  globalThis.fetch = async () => { throw new Error('test storage failure'); };
  process.env.KV_REST_API_URL = 'https://redis.test';
  process.env.KV_REST_API_TOKEN = 'test-token';
  try {
    const response = responseCapture();
    await labStatsHandler({ method: 'GET', headers: {} }, response);
    assert.deepEqual(response.result(), {
      status: 503,
      headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' },
      body: { error: 'Статистика временно недоступна.' },
    });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.KV_REST_API_URL; else process.env.KV_REST_API_URL = previousUrl;
    if (previousToken === undefined) delete process.env.KV_REST_API_TOKEN; else process.env.KV_REST_API_TOKEN = previousToken;
  }
});

test('frontend analytics contains no Redis credentials, arbitrary keys or fingerprinting', async () => {
  const [client, provider] = await Promise.all([
    readFile(new URL('./labAnalytics.ts', import.meta.url), 'utf8'),
    readFile(new URL('./LabAnalyticsProvider.tsx', import.meta.url), 'utf8'),
  ]);
  const source = `${client}\n${provider}`;
  assert.equal(/UPSTASH|REDIS_|KV_REST|redisKey/i.test(source), false);
  assert.equal(/canvas.*fingerprint|webgl.*fingerprint|font.*fingerprint/i.test(source), false);
  assert.equal(source.includes('/api/lab-stats'), true);
});

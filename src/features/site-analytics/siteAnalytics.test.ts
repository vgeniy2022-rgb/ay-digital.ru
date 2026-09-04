import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
// @ts-expect-error Vercel serverless handlers are native ESM JavaScript modules.
import siteStatsHandler from '../../../api/site-stats.mjs';
// @ts-expect-error Shared server analytics is a native ESM JavaScript module.
import { SITE_STATS_KEYS, readSiteStats, resetSiteStatsRateLimitsForTests, trackSiteVisit, validateSiteTrackBody } from '../../../api/_siteStatsCore.mjs';
// @ts-expect-error Shared server analytics is a native ESM JavaScript module.
import { LAB_STATS_KEYS, readLabStats, resetLabStatsRateLimitsForTests, trackLabEvent } from '../../../api/_labStatsCore.mjs';
import { LAB_SESSION_ID_KEY, LAB_VISITOR_ID_KEY } from '../lab/analytics/labAnalytics';
import {
  SITE_VISIT_TRACKED_KEY,
  ensureSiteVisit,
  isTrackableSitePath,
  parseSiteStats,
} from './siteAnalytics';

function createStorage(initial: Record<string, string> = {}) {
  const values = new Map(Object.entries(initial));
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

function anonymousId(kind: 'visitor' | 'session', index = 1) {
  return `${kind}-00000000-0000-4000-8000-${String(index).padStart(12, '0')}`;
}

function createRedisMock() {
  const strings = new Map<string, string>();
  const sets = new Map<string, Set<string>>();
  const hashes = new Map<string, Map<string, number>>();
  const commands: string[][] = [];

  const fetchImpl = async (_url: string | URL | Request, init?: RequestInit) => {
    const pipeline = JSON.parse(String(init?.body || '[]')) as string[][];
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
        if (args.includes('NX') && strings.has(key)) return { result: null };
        strings.set(key, args[0]);
        return { result: 'OK' };
      }
      if (name === 'SADD') {
        const set = sets.get(key) || new Set<string>();
        const previousSize = set.size;
        set.add(args[0]);
        sets.set(key, set);
        return { result: set.size === previousSize ? 0 : 1 };
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

  return { fetchImpl: fetchImpl as typeof fetch, strings, sets, commands };
}

test('site visit increments atomically and a repeated session is deduplicated', async () => {
  resetSiteStatsRateLimitsForTests();
  const redis = createRedisMock();
  const options = { fetchImpl: redis.fetchImpl, environment: { KV_REST_API_URL: 'https://redis.test', KV_REST_API_TOKEN: 'test-token' } };
  const event = { event: 'site_visit', visitorId: anonymousId('visitor'), sessionId: anonymousId('session') };
  assert.equal((await trackSiteVisit(event, options)).deduplicated, false);
  assert.equal((await trackSiteVisit(event, options)).deduplicated, true);
  assert.deepEqual(await readSiteStats(options), { visits: 1, uniqueVisitors: 1 });
  assert.equal(redis.commands.filter(([name, key]) => name === 'INCR' && key === SITE_STATS_KEYS.visits).length, 1);
  assert.equal(redis.commands.some(([, key]) => key.startsWith('sitevl:lab:')), false);
});

test('one visitor reused in two sessions creates two visits and one unique visitor', async () => {
  resetSiteStatsRateLimitsForTests();
  const redis = createRedisMock();
  const options = { fetchImpl: redis.fetchImpl, environment: { KV_REST_API_URL: 'https://redis.test', KV_REST_API_TOKEN: 'test-token' } };
  const visitorId = anonymousId('visitor', 7);
  await trackSiteVisit({ event: 'site_visit', visitorId, sessionId: anonymousId('session', 7) }, options);
  await trackSiteVisit({ event: 'site_visit', visitorId, sessionId: anonymousId('session', 8) }, options);
  assert.deepEqual(await readSiteStats(options), { visits: 2, uniqueVisitors: 1 });
});

test('frontend session marker prevents refresh and SPA navigation inflation', async () => {
  const visitorId = anonymousId('visitor', 20);
  const sessionId = anonymousId('session', 20);
  const local = createStorage({ [LAB_VISITOR_ID_KEY]: visitorId });
  const session = createStorage({ [LAB_SESSION_ID_KEY]: sessionId });
  const payloads: Array<[string, string]> = [];
  const sender = async (nextVisitorId: string, nextSessionId: string) => { payloads.push([nextVisitorId, nextSessionId]); return true; };

  assert.equal(await ensureSiteVisit('/', local, session, sender), true);
  assert.equal(await ensureSiteVisit('/', local, session, sender), false);
  assert.equal(await ensureSiteVisit('/services', local, session, sender), false);
  assert.deepEqual(payloads, [[visitorId, sessionId]]);
  assert.equal(session.values.get(SITE_VISIT_TRACKED_KEY), 'true');
});

test('direct LAB entry counts SITE and LAB independently with the shared visitor identity', async () => {
  resetSiteStatsRateLimitsForTests();
  resetLabStatsRateLimitsForTests();
  const redis = createRedisMock();
  const options = { fetchImpl: redis.fetchImpl, environment: { KV_REST_API_URL: 'https://redis.test', KV_REST_API_TOKEN: 'test-token' } };
  const visitorId = anonymousId('visitor', 30);
  const sessionId = anonymousId('session', 30);
  const local = createStorage({ [LAB_VISITOR_ID_KEY]: visitorId });
  const session = createStorage({ [LAB_SESSION_ID_KEY]: sessionId });

  assert.equal(await ensureSiteVisit('/lab', local, session, async (nextVisitorId, nextSessionId) => {
    const result = await trackSiteVisit({ event: 'site_visit', visitorId: nextVisitorId, sessionId: nextSessionId }, options);
    return result.accepted;
  }), true);
  await trackLabEvent({ event: 'lab_visit', visitorId, sessionId }, options);

  assert.deepEqual(await readSiteStats(options), { visits: 1, uniqueVisitors: 1 });
  const labStats = await readLabStats(options);
  assert.equal(labStats.visits, 1);
  assert.equal(labStats.uniqueVisitors, 1);
  assert.equal(redis.strings.get(SITE_STATS_KEYS.visits), '1');
  assert.equal(redis.strings.get(LAB_STATS_KEYS.visits), '1');
});

test('only browser-rendered public paths are trackable', () => {
  assert.equal(isTrackableSitePath('/'), true);
  assert.equal(isTrackableSitePath('/lab'), true);
  assert.equal(isTrackableSitePath('/mobile-apps'), true);
  assert.equal(isTrackableSitePath('/api/site-stats'), false);
  assert.equal(isTrackableSitePath('/assets/index.js'), false);
  assert.equal(isTrackableSitePath('/robots.txt'), false);
  assert.equal(isTrackableSitePath('/sitemap.xml'), false);
});

test('GET endpoint returns only the aggregate response schema', async () => {
  const previousFetch = globalThis.fetch;
  const previousUrl = process.env.KV_REST_API_URL;
  const previousToken = process.env.KV_REST_API_TOKEN;
  const redis = createRedisMock();
  globalThis.fetch = redis.fetchImpl;
  process.env.KV_REST_API_URL = 'https://redis.test';
  process.env.KV_REST_API_TOKEN = 'test-token';
  try {
    const response = responseCapture();
    await siteStatsHandler({ method: 'GET', headers: {} }, response);
    const result = response.result();
    assert.equal(result.status, 200);
    assert.deepEqual(result.body, { visits: 0, uniqueVisitors: 0 });
    assert.deepEqual(parseSiteStats(result.body), result.body);
    assert.equal('visitorId' in result.body, false);
    assert.equal(result.headers['Cache-Control'], 'no-store');
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.KV_REST_API_URL; else process.env.KV_REST_API_URL = previousUrl;
    if (previousToken === undefined) delete process.env.KV_REST_API_TOKEN; else process.env.KV_REST_API_TOKEN = previousToken;
  }
});

test('endpoint rejects extra fields and Redis failure stays isolated from the site', async () => {
  assert.equal(validateSiteTrackBody({ event: 'site_visit', visitorId: anonymousId('visitor'), sessionId: anonymousId('session'), redisKey: 'private' }).ok, false);
  const previousFetch = globalThis.fetch;
  const previousUrl = process.env.KV_REST_API_URL;
  const previousToken = process.env.KV_REST_API_TOKEN;
  globalThis.fetch = async () => { throw new Error('test storage failure'); };
  process.env.KV_REST_API_URL = 'https://redis.test';
  process.env.KV_REST_API_TOKEN = 'test-token';
  try {
    const response = responseCapture();
    await siteStatsHandler({ method: 'GET', headers: {} }, response);
    assert.equal(response.result().status, 503);
    assert.deepEqual(response.result().body, { error: 'Статистика временно недоступна.' });
  } finally {
    globalThis.fetch = previousFetch;
    if (previousUrl === undefined) delete process.env.KV_REST_API_URL; else process.env.KV_REST_API_URL = previousUrl;
    if (previousToken === undefined) delete process.env.KV_REST_API_TOKEN; else process.env.KV_REST_API_TOKEN = previousToken;
  }
});

test('frontend analytics has no Redis credentials, arbitrary keys or fingerprinting', async () => {
  const [client, provider, footer] = await Promise.all([
    readFile(new URL('./siteAnalytics.ts', import.meta.url), 'utf8'),
    readFile(new URL('./SiteAnalyticsProvider.tsx', import.meta.url), 'utf8'),
    readFile(new URL('../../components/Footer.tsx', import.meta.url), 'utf8'),
  ]);
  const source = `${client}\n${provider}\n${footer}`;
  assert.equal(/VITE_(?:REDIS|UPSTASH)|UPSTASH_REDIS_REST|KV_REST_API|redisKey/i.test(source), false);
  assert.equal(/canvas.*fingerprint|webgl.*fingerprint|font.*fingerprint|audio.*fingerprint/i.test(source), false);
  assert.equal(source.includes('/api/site-stats'), true);
  assert.equal(source.includes("Intl.NumberFormat('ru-RU')"), true);
});

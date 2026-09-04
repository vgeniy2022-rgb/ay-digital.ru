import assert from 'node:assert/strict';
import test from 'node:test';
// @ts-expect-error Server core is a native ESM JavaScript module.
import { authorizeOwnerRequest, buildLeadTelegramSummary, normalizePublicPath, readVisitor, resetVisitorRateLimitsForTests, trackVisitorEvent, validateVisitorEvent } from '../../../api/_visitorIntelligenceCore.mjs';
import { classifyBrowser, classifyDevice, safeReferrerHost, safeSource } from './visitorIntelligence';

function createRedisAndTelegramMock() {
  const strings = new Map<string, string>();
  const hashes = new Map<string, Map<string, string>>();
  const sets = new Map<string, Set<string>>();
  const lists = new Map<string, string[]>();
  const telegram: Array<Record<string, unknown>> = [];

  const fetchImpl = async (input: string | URL | Request, init?: RequestInit) => {
    if (String(input).includes('api.telegram.org')) {
      telegram.push(JSON.parse(String(init?.body || '{}')) as Record<string, unknown>);
      return new Response(JSON.stringify({ ok: true, result: { message_id: telegram.length } }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    const pipeline = JSON.parse(String(init?.body || '[]')) as string[][];
    const result = pipeline.map(([name, key, ...args]) => {
      if (name === 'INCR') { const value = Number(strings.get(key) || 0) + 1; strings.set(key, String(value)); return { result: value }; }
      if (name === 'SET') { if (args.includes('NX') && strings.has(key)) return { result: null }; strings.set(key, args[0]); return { result: 'OK' }; }
      if (name === 'EXPIRE' || name === 'ZADD' || name === 'ZREMRANGEBYRANK') return { result: 1 };
      if (name === 'HSETNX') {
        const hash = hashes.get(key) || new Map<string, string>();
        if (hash.has(args[0])) return { result: 0 };
        hash.set(args[0], args[1]); hashes.set(key, hash); return { result: 1 };
      }
      if (name === 'HSET') {
        const hash = hashes.get(key) || new Map<string, string>();
        for (let index = 0; index < args.length - 1; index += 2) hash.set(args[index], args[index + 1]);
        hashes.set(key, hash); return { result: Math.floor(args.length / 2) };
      }
      if (name === 'HINCRBY') {
        const hash = hashes.get(key) || new Map<string, string>();
        const value = Number(hash.get(args[0]) || 0) + Number(args[1]);
        hash.set(args[0], String(value)); hashes.set(key, hash); return { result: value };
      }
      if (name === 'HGETALL') return { result: Array.from(hashes.get(key)?.entries() || []).flat() };
      if (name === 'SADD') { const set = sets.get(key) || new Set<string>(); const before = set.size; set.add(args[0]); sets.set(key, set); return { result: set.size - before }; }
      if (name === 'SMEMBERS') return { result: Array.from(sets.get(key) || []) };
      if (name === 'RPUSH') { const list = lists.get(key) || []; list.push(args[0]); lists.set(key, list); return { result: list.length }; }
      if (name === 'LTRIM') { const list = lists.get(key) || []; lists.set(key, list.slice(Number(args[0]))); return { result: 'OK' }; }
      if (name === 'LRANGE') return { result: lists.get(key) || [] };
      return { error: `unsupported ${name}` };
    });
    return new Response(JSON.stringify(result), { status: 200, headers: { 'Content-Type': 'application/json' } });
  };
  return { fetchImpl: fetchImpl as typeof fetch, telegram, hashes, lists };
}

const environment = { KV_REST_API_URL: 'https://redis.test', KV_REST_API_TOKEN: 'redis-test', TELEGRAM_BOT_TOKEN: 'telegram-test', TELEGRAM_CHAT_ID: '42', VISITOR_INTELLIGENCE_RETENTION_DAYS: '45' };
const base = { visitorId: 'SV-A7F21C', sessionId: 'session-00000000-0000-4000-8000-000000000001' };

test('client source, referrer, browser and device classification stays coarse and query-safe', () => {
  assert.equal(safeSource('?src=telegram-vl-1&utm_secret=value'), 'telegram-vl-1');
  assert.equal(safeSource('?src=https://bad.example/?token=secret'), '');
  assert.equal(safeReferrerHost('https://t.me/example?secret=1', 'sitevl-ru.vercel.app'), 't.me');
  assert.equal(safeReferrerHost('https://sitevl-ru.vercel.app/private', 'sitevl-ru.vercel.app'), '');
  assert.equal(classifyBrowser('Mozilla AppleWebKit Safari/605.1.15'), 'Safari');
  assert.equal(classifyDevice('Mozilla iPhone Mobile Safari/605.1.15'), 'mobile');
});

test('server allowlist normalizes routes and rejects arbitrary payloads', () => {
  assert.equal(normalizePublicPath('/prices/?token=secret'), '/prices');
  assert.equal(normalizePublicPath('/api/private'), null);
  const valid = validateVisitorEvent({ event: 'session_start', ...base, eventId: 'event-00000000-0000-4000-8000-000000000001', path: '/', source: 'telegram-vl-1', referrerHost: 't.me', deviceType: 'mobile', browser: 'Safari' });
  assert.equal(valid.ok, true);
  const normalized = validateVisitorEvent({ event: 'page_view', ...base, eventId: 'event-00000000-0000-4000-8000-000000000099', path: '/prices?token=secret' });
  assert.equal((normalized as { value: { path: string } }).value.path, '/prices');
  assert.equal(validateVisitorEvent({ ...(valid as { value: object }).value, redisKey: 'sitevl:secret' }).ok, false);
  assert.equal(validateVisitorEvent({ event: 'send_message', ...base, eventId: 'event-00000000-0000-4000-8000-000000000002', path: '/', message: 'arbitrary' }).ok, false);
});

test('visitor history is deduplicated, retained in its namespace and sends allowlisted Telegram summaries', async () => {
  resetVisitorRateLimitsForTests();
  const mock = createRedisAndTelegramMock();
  const options = { fetchImpl: mock.fetchImpl, environment, now: () => Date.parse('2026-09-05T01:00:00.000Z') };
  const sessionStart = { event: 'session_start', ...base, eventId: 'event-00000000-0000-4000-8000-000000000011', path: '/', source: 'telegram-vl-1', referrerHost: 't.me', deviceType: 'mobile', browser: 'Safari' };
  assert.equal((await trackVisitorEvent(sessionStart, options)).deduplicated, false);
  assert.equal((await trackVisitorEvent(sessionStart, options)).deduplicated, true);
  await trackVisitorEvent({ event: 'page_view', ...base, eventId: 'event-00000000-0000-4000-8000-000000000012', path: '/mobile-apps' }, options);
  await trackVisitorEvent({ event: 'page_view', ...base, eventId: 'event-00000000-0000-4000-8000-000000000013', path: '/prices' }, options);
  await trackVisitorEvent({ event: 'experiment_start', ...base, eventId: 'event-00000000-0000-4000-8000-000000000014', path: '/lab/modern-os', experimentId: 'modern-os' }, options);
  const intelligence = await readVisitor(base.visitorId, options);
  assert.equal(intelligence.visitor.firstSource, 'telegram-vl-1');
  assert.equal(intelligence.visitor.sessions, '1');
  assert.equal(intelligence.visitor.viewedPrices, '1');
  assert.deepEqual(intelligence.pages, ['/', '/mobile-apps', '/prices', '/lab/modern-os']);
  assert.deepEqual(intelligence.experiments, ['modern-os']);
  assert.equal(intelligence.history.length, 4);
  assert.equal(JSON.stringify(intelligence).includes('utm_secret'), false);
  assert.equal(mock.telegram.length, 3);
  assert.match(String(mock.telegram[0].text), /Новый посетитель SITEVL[\s\S]*SV-A7F21C[\s\S]*Telegram/);
  assert.equal(JSON.stringify(mock.telegram).includes('telegram-test'), false);
});

test('lead summary uses the stored visitor path without embedding the AI concept JSON', () => {
  const text = buildLeadTelegramSummary({ id: 'lead-1', createdAt: '2026-09-05T02:00:00.000Z', visitorId: base.visitorId, conceptId: 'SV-AI-ABC123', recommendedPackage: 'Мобильное приложение', budget: '100 000 ₽', contact: { name: 'Александр', phone: '+7 900', telegram: '@alex' } }, { visitor: { firstVisit: '2026-09-05T01:00:00.000Z', sessions: '2' }, history: [{ path: '/' }, { path: '/mobile-apps' }, { path: '/prices' }, { path: '/ai-website' }] });
  assert.match(text, /Главная → Приложения → Цены → AI-концепт/);
  assert.match(text, /Сессий:\n2/);
  assert.equal(text.includes('generatedConcept'), false);
});

test('future owner API authentication is deny-by-default and constant-value based', () => {
  assert.equal(authorizeOwnerRequest('Bearer owner-token', {}), false);
  assert.equal(authorizeOwnerRequest('Bearer wrong', { VISITOR_OWNER_API_TOKEN: 'owner-token' }), false);
  assert.equal(authorizeOwnerRequest('Bearer owner-token', { VISITOR_OWNER_API_TOKEN: 'owner-token' }), true);
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
// @ts-expect-error Native server ESM.
import { authorizeOwnerRequest, buildLeadTelegramSummary, elapsedLabel, linkLeadToVisitor, normalizePublicPath, readVisitor, resetVisitorRateLimitsForTests, trackVisitorEvent, validateVisitorEvent } from '../../../api/_visitorIntelligenceCore.mjs';
// @ts-expect-error Native server ESM.
import { isIpAssistConfigured, requestNetworkHash } from '../../../api/_visitorNetwork.mjs';
import { classifyBrowser, classifyDevice, classifyDeviceFamily, ensureVisitorSession, ensureVisitorSources, safeReferrerHost, safeSource } from './visitorIntelligence';
import { createRedisHarness } from './visitorRedisHarness';

const start = (visitorId = 'SV-A7F21C', sessionId = 'session-' + randomUUID()) => ({ event: 'session_start', visitorId, sessionId, eventId: 'event-' + randomUUID(), path: '/', source: 'telegram-vl-1', referrerHost: 't.me', deviceType: 'mobile', deviceFamily: 'iPhone', browser: 'Safari' });
const action = (session: ReturnType<typeof start>, path = '/prices') => ({ event: 'page_view', visitorId: session.visitorId, sessionId: session.sessionId, eventId: 'event-' + randomUUID(), path });
const storage = () => { const values = new Map<string, string>(); return { getItem: (key: string) => values.get(key) || null, setItem: (key: string, value: string) => { values.set(key, value); } }; };

test('source attribution remains first-touch but returning direct session is direct', () => {
  const local = storage(); const session = storage();
  assert.deepEqual(ensureVisitorSources('?src=telegram-vl-1', local, session), { firstSource: 'telegram-vl-1', sessionSource: 'telegram-vl-1' });
  assert.equal(ensureVisitorSources('?src=vk', local, session).sessionSource, 'telegram-vl-1');
  assert.deepEqual(ensureVisitorSources('', local, storage()), { firstSource: 'telegram-vl-1', sessionSource: 'direct' });
  assert.equal(safeSource('?src=telegram-vl-1&secret=value'), 'telegram-vl-1');
  assert.equal(safeSource('?src=https://bad.example/?token=secret'), '');
  assert.equal(safeReferrerHost('https://t.me/example?secret=1', 'sitevl.tech'), 't.me');
  assert.equal(safeReferrerHost('https://sitevl.tech/private', 'sitevl.tech'), '');
  assert.equal(classifyBrowser('Safari/605'), 'Safari');
  assert.equal(classifyBrowser('FxiOS/100 Safari/605'), 'Firefox');
  assert.equal(classifyDevice('iPhone Mobile Safari/605'), 'mobile');
  assert.equal(classifyDeviceFamily('iPhone Mobile Safari/605'), 'iPhone');
  assert.equal(classifyDeviceFamily('Macintosh'), 'Mac');
});

test('client shares pending session registration and reload marker across concurrent callers', async (t) => {
  const calls: object[] = [];
  t.mock.method(globalThis, 'fetch', async (_url: unknown, init: RequestInit) => {
    calls.push(JSON.parse(String(init.body)));
    await new Promise((resolve) => setTimeout(resolve, 10));
    return Response.json({ accepted: true });
  });
  const local = storage(); const session = storage();
  const run = () => ensureVisitorSession('/', '?src=telegram-test', local, session, 'iPhone Safari/605', '', 'sitevl.tech');
  const values = await Promise.all(Array.from({ length: 10 }, run)); await run();
  assert.equal(calls.length, 1);
  assert.equal(new Set(values.map((value) => value.sessionId)).size, 1);
  assert.equal(JSON.stringify(calls).includes('userAgent'), false);
});

test('allowlist rejects secrets, raw IP, invalid identity and arbitrary events before storage', async () => {
  assert.equal(normalizePublicPath('/prices/?token=secret'), '/prices');
  assert.equal(normalizePublicPath('/api/private'), null);
  for (const extra of [{ redisKey: 'secret' }, { message: 'arbitrary' }, { ip: '192.0.2.1' }, { deviceFamily: 'raw device' }, { visitorNumber: 1 }]) assert.equal(validateVisitorEvent({ ...start(), ...extra }).ok, false);
  assert.equal(validateVisitorEvent({ ...start(), visitorId: '../../other' }).ok, false);
  await assert.rejects(trackVisitorEvent({ ...start(), visitorId: 'bad' }), /invalid visitor event/);
});

test('HMAC assist is optional, trusted-header only, normalized and secret-dependent', () => {
  const env = { VERCEL: '1', VISITOR_IP_HASH_SECRET: 'a'.repeat(64) };
  assert.equal(isIpAssistConfigured({}), false);
  assert.equal(isIpAssistConfigured({ ...env, VERCEL: '0' }), false);
  assert.equal(isIpAssistConfigured({ ...env, VISITOR_IP_HASH_SECRET: 'short' }), false);
  assert.equal(requestNetworkHash({ headers: { 'x-forwarded-for': '192.0.2.1' } }, env), '');
  assert.equal(requestNetworkHash({ headers: { 'x-vercel-forwarded-for': '192.0.2.1, 192.0.2.2' } }, env), '');
  const request = { headers: { 'x-vercel-forwarded-for': '192.0.2.1' } };
  const hash = requestNetworkHash(request, env);
  assert.match(hash, /^[a-f0-9]{64}$/);
  assert.equal(hash, requestNetworkHash(request, env));
  assert.notEqual(hash, requestNetworkHash(request, { ...env, VISITOR_IP_HASH_SECRET: 'b'.repeat(64) }));
  assert.equal(hash.includes('192.0.2.1'), false);
  assert.equal(requestNetworkHash(request, {}), '');
  assert.equal(requestNetworkHash({ headers: { 'x-vercel-forwarded-for': '2001:0db8:0:0:0:0:0:1' } }, env), requestNetworkHash({ headers: { 'x-vercel-forwarded-for': '2001:db8::1' } }, env));
});

test('real Redis: ten concurrent visitors receive ten distinct consecutive numbers', async (t) => {
  const h = await createRedisHarness(t); if (!h) return;
  const events = Array.from({ length: 10 }, (_, index) => start('SV-' + index.toString(16).padStart(6, '0').toUpperCase()));
  const results: Array<{ accepted: boolean }> = await Promise.all(events.map((event) => trackVisitorEvent(event, h.options)));
  assert.equal(results.every((result) => result.accepted), true);
  const profiles: Array<{ visitor: { visitorNumber: string }; session: { visitNumber: string } }> = await Promise.all(events.map((event) => readVisitor(event.visitorId, h.options)));
  assert.deepEqual(profiles.map((p) => Number(p.visitor.visitorNumber)).sort((a, b) => a - b), [1,2,3,4,5,6,7,8,9,10]);
  assert.equal(new Set(profiles.map((p) => p.session.visitNumber)).size, 10);
  assert.equal(await h.command(['TTL', 'sitevl:visitor:v2:visitor-sequence']), -1);
  assert.equal(await h.command(['TTL', 'sitevl:visitor:v2:visit-sequence']), -1);
});

test('real Redis: concurrent session starts and reload allocate once and send once', async (t) => {
  resetVisitorRateLimitsForTests();
  const h = await createRedisHarness(t); if (!h) return;
  const event = start();
  await Promise.all(Array.from({ length: 10 }, () => trackVisitorEvent({ ...event, eventId: 'event-' + randomUUID() }, h.options)));
  await trackVisitorEvent(event, h.options);
  const p = await readVisitor(event.visitorId, h.options);
  assert.equal(p.visitor.sessions, '1'); assert.equal(p.history.length, 1);
  assert.equal(h.telegram.length, 1);
  assert.match(h.telegram[0], /Новый посетитель SITEVL[\s\S]*Посещение сайта: #1[\s\S]*Уникальный посетитель: #1[\s\S]*iPhone · Safari/);
  assert.equal(h.telegram[0].includes(event.visitorId), false);
  assert.equal(await h.command(['GET', 'sitevl:visitor:v2:visit-sequence']), '1');
});

test('real Redis: returning visitor retains number; new session advances visits; action dedup is session-scoped', async (t) => {
  const h = await createRedisHarness(t); if (!h) return;
  const first = start(); await trackVisitorEvent(first, h.options);
  const price = action(first); await trackVisitorEvent(price, h.options); await trackVisitorEvent(price, h.options); await trackVisitorEvent(action(first), h.options);
  assert.equal(h.telegram.length, 2);
  const returning = { ...start(first.visitorId), source: 'direct', referrerHost: '' };
  const later = { ...h.options, now: () => Date.parse('2026-09-07T03:00:00Z') };
  await trackVisitorEvent(returning, later); await trackVisitorEvent(action(returning), later);
  const p = await readVisitor(first.visitorId, h.options);
  assert.equal(p.visitor.visitorNumber, '1'); assert.equal(p.visitor.sessions, '2'); assert.equal(p.session.visitNumber, '2');
  assert.equal(p.visitor.firstSource, 'telegram-vl-1'); assert.equal(p.session.source, 'direct');
  assert.match(h.telegram[2], /вернулся[\s\S]*#2[\s\S]*#1[\s\S]*Первый источник: Telegram[\s\S]*Текущий источник: Прямой переход/);
  assert.equal(h.telegram.length, 4); assert.match(h.telegram[3], /Посетитель #1 смотрит цены/);
});

test('real Redis: legacy migration preserves history and session count', async (t) => {
  const h = await createRedisHarness(t); if (!h) return;
  const event = start(); const profile = 'sitevl:visitor:v1:' + event.visitorId;
  await h.command(['HSET', profile, 'firstVisit', '2026-01-01T00:00:00Z', 'lastVisit', '2026-09-01T00:00:00Z', 'sessions', '4', 'firstSource', 'telegram-original']);
  await h.command(['RPUSH', profile + ':history', JSON.stringify({ event: 'page_view', path: '/mobile-apps', at: '2026-09-01T00:00:00Z' })]);
  await h.command(['SET', 'sitevl:visitor:v1:session:' + event.sessionId, event.visitorId]);
  await trackVisitorEvent(event, h.options);
  const p = await readVisitor(event.visitorId, h.options);
  assert.equal(p.visitor.sessions, '4'); assert.equal(p.visitor.visitorNumber, '1'); assert.equal(p.history.length, 2);
  assert.equal(p.visitor.firstSource, 'telegram-original'); assert.equal(p.visitor.pageViews, '1');
  assert.equal(h.telegram.length, 0);
});

test('real Redis: no rebinding, no IP merge; hash TTL is short and hidden from owner data', async (t) => {
  const h = await createRedisHarness(t); if (!h) return;
  const event = start(); const options = { ...h.options, networkHash: 'a'.repeat(64) };
  await trackVisitorEvent(event, options);
  assert.equal((await trackVisitorEvent(start('SV-BBBBBB', event.sessionId), options)).accepted, false);
  const other = start('SV-BBBBBB'); await trackVisitorEvent(other, options);
  assert.equal((await readVisitor(other.visitorId, options)).visitor.visitorNumber, '2');
  assert.equal((await trackVisitorEvent(action(start('SV-CCCCCC')), options)).accepted, false);
  const ttl = Number(await h.command(['TTL', 'sitevl:visitor:v2:network:' + event.visitorId]));
  assert.ok(ttl > 0 && ttl <= 86400);
  assert.equal(JSON.stringify(await readVisitor(event.visitorId, options)).includes('a'.repeat(64)), false);
});

test('real Redis: lead links through verified session with numbers and path; duplicates send once', async (t) => {
  const h = await createRedisHarness(t); if (!h) return;
  const event = start(); await trackVisitorEvent(event, h.options);
  for (const path of ['/mobile-apps', '/prices', '/ai-website']) await trackVisitorEvent(action(event, path), h.options);
  const lead = { id: randomUUID(), createdAt: '2026-09-06T02:00:00Z', visitorId: event.visitorId, visitorSessionId: event.sessionId, conceptId: 'SV-AI-ABC123', contact: { name: 'QA', telegram: '@test' } };
  assert.equal((await linkLeadToVisitor({ ...lead, visitorSessionId: 'session-' + randomUUID() }, h.options)).linked, false);
  const linked = await linkLeadToVisitor(lead, h.options);
  assert.equal(linked.linked, true);
  assert.equal((await linkLeadToVisitor(lead, h.options)).notification, 'skipped');
  assert.equal(linked.intelligence.visitor.leads, '1');
  const text = h.telegram[h.telegram.length - 1] || '';
  assert.match(text, /Новая заявка SITEVL[\s\S]*Посетитель: #1[\s\S]*Посещение сайта: #1/);
  assert.match(text, /Главная → Приложения → Цены → AI-концепт/);
  assert.equal(text.includes(event.visitorId), false);
  assert.equal(buildLeadTelegramSummary(lead, linked.intelligence).includes('generatedConcept'), false);
});

test('Redis unavailable is explicit; failed Telegram does not lose committed event', async (t) => {
  resetVisitorRateLimitsForTests();
  await assert.rejects(trackVisitorEvent(start(), { environment: {} }), /storage unavailable/);
  const h = await createRedisHarness(t); if (!h) return;
  const event = start();
  const options = { ...h.options, fetchImpl: async (input: string, init: RequestInit) => { if (String(input).includes('api.telegram.org')) throw new Error('test failure'); return h.options.fetchImpl(input, init); } };
  assert.equal((await trackVisitorEvent(event, options)).notification, 'failed');
  assert.equal((await readVisitor(event.visitorId, h.options)).visitor.sessions, '1');
});

test('real Redis: all significant action notifications are allowlisted and bounded by the session', async (t) => {
  const h = await createRedisHarness(t); if (!h) return;
  const event = start(); await trackVisitorEvent(event, h.options);
  const actions = [action(event, '/prices'), action(event, '/lab'), action(event, '/ai-website'),
    { ...action(event, '/lab/modern-os'), event: 'experiment_start', experimentId: 'modern-os' },
    { ...action(event, '/ai-website'), event: 'ai_concept_created', conceptId: 'SV-AI-TEST01' }];
  for (const item of actions) { await trackVisitorEvent(item, h.options); await trackVisitorEvent({ ...item, eventId: 'event-' + randomUUID() }, h.options); }
  assert.equal(h.telegram.length, 6);
  for (const label of ['смотрит цены', 'открыл LAB', 'открыл AI-концепт', 'запустил Modern OS', 'создал AI-концепт']) assert.ok(h.telegram.some((text) => text.includes(label)));
  assert.ok(h.telegram.every((text) => !text.includes(event.visitorId) && !text.includes('test-only')));
});

test('owner API stays deny-by-default and client imports no secrets or IP helper', async () => {
  assert.equal(authorizeOwnerRequest('Bearer owner-token', {}), false);
  assert.equal(authorizeOwnerRequest('Bearer wrong', { VISITOR_OWNER_API_TOKEN: 'owner-token' }), false);
  assert.equal(authorizeOwnerRequest('Bearer owner-token', { VISITOR_OWNER_API_TOKEN: 'owner-token' }), true);
  const client = await readFile(new URL('./visitorIntelligence.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(client, /VISITOR_IP_HASH_SECRET|TELEGRAM_BOT_TOKEN|_visitorNetwork|x-forwarded-for/);
  assert.equal(elapsedLabel(26 * 3600000), '1 дн 2 ч');
});

import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
// @ts-expect-error Native server ESM.
import { AD_CAMPAIGN, ATTRIBUTION_COOKIE, ATTRIBUTION_QUERY, classifyRequestTraffic, crawlerFamily, geoLabel, legacyAttribution, legacyRedirect, requestAttribution, requestCoarseGeo, resetTrafficVerificationForTests, signAttribution, verifyAttribution, verifyGoogleRequest } from '../../../api/_trafficPolicyV3.mjs';
// @ts-expect-error Native server ESM.
import { botTelegramText, linkLeadToVisitor, readVisitor, trackCrawlerVisit, trackVisitorEvent, validateVisitorEvent } from '../../../api/_visitorIntelligenceCore.mjs';
// @ts-expect-error Native server ESM.
import { FUNNEL_ACTIONS, readTrafficSummary } from '../../../api/_visitorStoreV3.mjs';
// @ts-expect-error Native server ESM.
import siteHandler from '../../../api/site-stats.mjs';
// @ts-expect-error Native server ESM.
import labHandler from '../../../api/lab-stats.mjs';
// @ts-expect-error Native server ESM.
import visitorHandler from '../../../api/visitor-events.mjs';
// @ts-expect-error Native server ESM.
import ownerHandler from '../../../api/visitor-owner.mjs';
// @ts-expect-error Vercel middleware ESM.
import middleware from '../../../middleware.js';
import { contactChannel, safeSource, trackVisitorAction, trackVisitorPage } from './visitorIntelligence';
import { createRedisHarness } from './visitorRedisHarness';

const safari = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
const chrome = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140.0.0.0 Safari/537.36';
const env = { VERCEL: '1', VISITOR_ATTRIBUTION_SECRET: 'isolated-test-signing-key-not-a-real-secret' };
const request = (ua = safari, extra: Record<string, string> = {}) => ({ headers: { 'user-agent': ua, ...extra } });
const start = (visitorId = 'SV-F3A001') => ({ event: 'session_start', visitorId, sessionId: 'session-' + randomUUID(), eventId: 'event-' + randomUUID(), path: '/', source: 'direct', referrerHost: '', deviceType: 'mobile', deviceFamily: 'iPhone', browser: 'Safari' });
const action = (s: ReturnType<typeof start>, event = 'page_view', path = '/prices', extra = {}) => ({ event, path, visitorId: s.visitorId, sessionId: s.sessionId, eventId: 'event-' + randomUUID(), ...extra });
const responseCapture = () => ({ statusCode: 0, body: {} as Record<string, unknown>, headers: {} as Record<string, string>, setHeader(k: string, v: string) { this.headers[k] = v; }, end(raw: string) { this.body = JSON.parse(raw); } });

test('V3: legacy redirect preserves public paths, repeated query values and establishes a signed HttpOnly cookie', () => {
  for (const path of ['/', '/prices', '/prices/websites', '/lab/modern-os', '/services/site-management', '/brief']) {
    const original = new URL(`https://sitevl-ru.vercel.app${path}?src=telegram-vl-1&utm_campaign=old-ad&tag=1&tag=2`);
    const first = legacyRedirect(new Request(original), env);
    assert.equal(first.status, 307);
    const target = new URL(first.headers.get('location'));
    assert.equal(target.origin, 'https://sitevl.tech'); assert.equal(target.pathname, path);
    for (const key of ['src', 'utm_campaign', 'tag']) assert.deepEqual(target.searchParams.getAll(key), original.searchParams.getAll(key));
    const second = legacyRedirect(new Request(target), env);
    assert.equal(second.status, 307);
    const final = new URL(second.headers.get('location'));
    assert.equal(final.searchParams.has(ATTRIBUTION_QUERY), false);
    assert.equal(final.pathname, path); assert.equal(final.search, original.search);
    const cookie = second.headers.get('set-cookie');
    assert.ok(cookie.startsWith(ATTRIBUTION_COOKIE + '='));
    assert.match(cookie, /HttpOnly; Secure; SameSite=Lax/);
    const attribution = requestAttribution(request(safari, { cookie }), env);
    assert.equal(attribution.source, 'paid-ad'); assert.equal(attribution.campaign, AD_CAMPAIGN);
    assert.equal(attribution.entryHost, 'sitevl-ru.vercel.app');
    assert.equal(legacyRedirect(new Request(final), env), null);
  }
});

test('V3: attribution is an explicit old-host assumption, not all traffic; no open redirect or forged token', () => {
  const old = new URL('https://sitevl-ru.vercel.app/');
  assert.equal(legacyAttribution(old).attributionBasis, 'assumed-old-host');
  assert.equal(legacyAttribution(new URL('https://sitevl.tech/')), null);
  for (const url of ['?src=vk', '?utm_source=google', '?src=bad%40mail.example']) assert.equal(legacyAttribution(new URL(url, old)).paid, false);
  assert.equal(legacyAttribution(old, 'https://www.google.com/search?q=private').paid, false);
  assert.equal(legacyAttribution(old, 'https://t.me/ad').paid, true);
  const signed = signAttribution(legacyAttribution(old), env, 1000000);
  assert.equal(verifyAttribution(signed + 'x', env, 1000000), null);
  assert.equal(verifyAttribution(signed.split('.')[0] + '.' + 'я'.repeat(43), env, 1000000), null);
  assert.equal(verifyAttribution(signed, env, 3000000), null);
  assert.equal(verifyAttribution(signed, env, 0), null);
  const invalid = legacyRedirect(new Request(`https://sitevl.tech/prices?${ATTRIBUTION_QUERY}=invalid&next=https://evil.example`), env);
  assert.equal(invalid.headers.has('set-cookie'), false);
  assert.equal(new URL(invalid.headers.get('location')).origin, 'https://sitevl.tech');
  assert.equal(legacyRedirect(new Request(old), {}), null); // Incomplete config never breaks paid links.
  assert.equal(legacyRedirect(new Request(old, { method: 'POST' }), env), null);
});

test('V3.1 regression: Safari and Chrome alone are unknown, crawler signatures remain automation', async () => {
  for (const ua of [safari, chrome]) assert.equal((await classifyRequestTraffic(request(ua), { environment: {} })).classification, 'unknown');
  for (const family of ['Googlebot', 'Google-InspectionTool', 'GoogleOther', 'Bingbot', 'YandexBot', 'Applebot', 'DuckDuckBot', 'TelegramBot', 'GPTBot', 'ClaudeBot', 'AhrefsBot']) {
    assert.ok(crawlerFamily(`${chrome} ${family}/1.0`));
    const traffic = await classifyRequestTraffic(request(`${chrome} ${family}/1.0`), { environment: {} });
    assert.equal(traffic.classification, 'likely-bot'); assert.equal(traffic.verification, 'unverified-claim');
  }
  assert.equal((await classifyRequestTraffic(request(''))).classification, 'likely-bot');
});

test('V3: Google verification requires reverse AND forward match and caches bounded results', async () => {
  resetTrafficVerificationForTests(); let calls = 0;
  const resolver = { reverse: async () => { calls++; return ['crawl-66-249-66-1.googlebot.com']; }, resolve4: async () => ['66.249.66.1'] };
  const options = { environment: env, resolver };
  const req = request('Google-InspectionTool/1.0', { 'x-vercel-forwarded-for': '66.249.66.1' });
  const results = await Promise.all(Array.from({ length: 8 }, () => classifyRequestTraffic(req, options)));
  assert.ok(results.every((r: { classification: string; verification: string }) => r.classification === 'known-bot' && r.verification === 'verified-dns'));
  await classifyRequestTraffic(req, options); assert.equal(calls, 1);
  resetTrafficVerificationForTests();
  assert.equal(await verifyGoogleRequest('66.249.66.1', { resolver: { ...resolver, resolve4: async () => ['192.0.2.1'] } }), false);
  for (const fake of ['crawl-66-249-66-1.googlebot.com.evil.example', 'evil-googlebot.com', '1-2-3-4.bc.googleusercontent.com', '1-2-3-4.gae.googleusercontent.com']) {
    resetTrafficVerificationForTests();
    assert.equal(await verifyGoogleRequest('66.249.66.1', { resolver: { ...resolver, reverse: async () => [fake] } }), false);
  }
  resetTrafficVerificationForTests();
  assert.equal((await classifyRequestTraffic(request('Googlebot', { 'x-forwarded-for': '66.249.66.1' }), options)).classification, 'likely-bot');
});

test('V3: Google DNS timeout degrades to unverified automation, never stalls indefinitely', async () => {
  resetTrafficVerificationForTests(); let cancelled = false;
  const before = Date.now();
  assert.equal(await verifyGoogleRequest('192.0.2.10', { resolver: { reverse: () => new Promise(() => {}), cancel: () => { cancelled = true; } } }), false);
  assert.equal(cancelled, true); assert.ok(Date.now() - before < 1800);
});

test('V3: only trusted coarse geo, encoded city, missing/invalid data and VPN precision', () => {
  const req = request(safari, { 'x-vercel-ip-country': 'RU', 'x-vercel-ip-country-region': 'PRI', 'x-vercel-ip-city': encodeURIComponent('Владивосток'), 'x-vercel-ip-latitude': '43.1', 'x-vercel-ip-longitude': '131.9' });
  const geo = requestCoarseGeo(req, env);
  assert.deepEqual(geo, { country: 'RU', region: 'PRI', city: 'Владивосток', geoSource: 'network', geoPrecision: 'approximate' });
  assert.match(geoLabel(geo), /Владивосток · Приморский край · Россия.*приблизительно/);
  assert.equal(requestCoarseGeo(req, {}), null); assert.equal(requestCoarseGeo(request(), env), null);
  for (const country of ['ZZ', 'XX', 'AA', 'RUS', '<RU>']) assert.equal(requestCoarseGeo(request(safari, { 'x-vercel-ip-country': country }), env), null);
  const invalid = requestCoarseGeo(request(safari, { 'x-vercel-ip-country': 'US', 'x-vercel-ip-city': '%not-encoded', 'x-vercel-ip-country-region': '<script>' }), env);
  assert.equal(invalid.city, ''); assert.equal(invalid.region, ''); assert.equal(invalid.geoPrecision, 'approximate');
  assert.doesNotMatch(JSON.stringify(geo), /latitude|longitude|43\.1|131\.9|exact/);
});

test('V3 real Redis: crawlers get no human profile, sequence or ad counters; notifications have cooldown', async (t) => {
  const h = await createRedisHarness(t); if (!h) return;
  const traffic = { classification: 'known-bot', family: 'Google-InspectionTool', reason: 'google-forward-confirmed-rdns', verification: 'verified-dns' };
  const options = { ...h.options, traffic, attribution: legacyAttribution(new URL('https://sitevl-ru.vercel.app/')) };
  const s = start();
  const result = await trackVisitorEvent(s, options); assert.equal(result.ignored, 'automated-traffic');
  await trackVisitorEvent(action(s, 'page_view', '/'), options);
  await trackCrawlerVisit('/prices', traffic, options);
  await trackCrawlerVisit('/cases', { ...traffic, family: 'Bingbot', classification: 'likely-bot', verification: 'unverified-claim' }, options);
  assert.equal(await h.command(['EXISTS', 'sitevl:visitor:v2:visitor-sequence', 'sitevl:visitor:v2:visit-sequence', 'sitevl:visitor:v1:' + s.visitorId]), 0);
  const summary = await readTrafficSummary(h.options);
  assert.equal(summary.counters.knownBotVisits, 2); assert.equal(summary.counters.likelyBotVisits, 1);
  assert.equal(summary.counters.humanVisits, 0); assert.equal(summary.counters.uniqueHumanVisitors, 0); assert.equal(summary.counters.paidAdHumanVisits, 0);
  assert.equal(h.telegram.length, 2); assert.match(h.telegram[0], /Google проверяет SITEVL/);
  assert.doesNotMatch(h.telegram.join('\n'), /Уникальный посетитель|Город:|География сети|SV-F3A001|test-only/);
  assert.ok(Number(await h.command(['TTL', 'sitevl:visitor:v31:bots:recent'])) > 0);
  assert.match(botTelegramText(summary.bots[0]), /В статистику людей и рекламы не включён/);
});

test('V3 real Redis: paid funnel persists beyond cookie, deduplicates, links lead and preserves returning numbers', async (t) => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); const traffic = await classifyRequestTraffic(request());
  const attribution = legacyAttribution(new URL('https://sitevl-ru.vercel.app/?src=telegram-vl-1&utm_campaign=old-ad'));
  const geo = requestCoarseGeo(request(safari, { 'x-vercel-ip-country': 'RU', 'x-vercel-ip-country-region': 'PRI', 'x-vercel-ip-city': 'Vladivostok' }), env);
  const options = { ...h.options, traffic };
  await trackVisitorEvent(s, { ...options, attribution, geo });
  // Remaining calls intentionally omit cookie/attribution: persisted in existing session.
  for (const path of ['/services', '/cases', '/prices', '/contacts']) {
    await trackVisitorEvent(action(s, 'page_view', path), options);
    await trackVisitorEvent(action(s, 'page_view', path), options);
  }
  for (const channel of ['telegram', 'whatsapp']) await trackVisitorEvent(action(s, 'contact_click', '/contacts', { channel }), options);
  for (const event of ['brief_started', 'brief_completed']) await trackVisitorEvent(action(s, event, '/brief'), options);
  await trackVisitorEvent(action(s, 'engagement', '/brief', { signal: 'visible-reader' }), options);
  await trackVisitorEvent(action(s), options);
  const lead = { id: randomUUID(), createdAt: '2026-09-06T02:00:00Z', visitorId: s.visitorId, visitorSessionId: s.sessionId, conceptId: 'SV-AI-V3TEST', contact: { name: 'Isolated unit test' } };
  await linkLeadToVisitor(lead, options); await linkLeadToVisitor(lead, options);
  let p = await readVisitor(s.visitorId, options);
  assert.equal(p.visitor.visitorNumber, '1'); assert.equal(p.session.classification, 'unknown');
  assert.match(p.visitor.classificationReasons, /insufficient-evidence/);
  assert.equal(JSON.parse(p.session.attribution).campaign, AD_CAMPAIGN);
  assert.deepEqual(p.history.filter((e: { event: string }) => e.event === 'contact_click').map((e: { channel: string }) => e.channel), ['telegram', 'whatsapp']);
  let summary = await readTrafficSummary(options);
  for (const key of FUNNEL_ACTIONS.filter((key: string) => key !== 'ad_visit')) assert.equal(summary.counters[key], 1, key);
  assert.equal(summary.counters.paidAdTechnicalVisits, 1);
  assert.equal(summary.counters.paidAdUniqueHumans, 0);
  assert.match(h.telegram[0], /Новый визит[\s\S]*iPhone · Safari[\s\S]*Оплаченная реклама[\s\S]*Владивосток · Приморский край · Россия/);
  const returning = start(s.visitorId); await trackVisitorEvent(returning, { ...options, now: () => h.options.now() + 86400000 });
  p = await readVisitor(s.visitorId, options); summary = await readTrafficSummary(options);
  assert.equal(p.visitor.visitorNumber, '1'); assert.equal(p.session.visitNumber, '2'); assert.equal(p.visitor.sessions, '2');
  assert.equal(p.session.source, 'direct'); assert.equal(p.visitor.firstSource, 'paid-ad');
  assert.equal(summary.counters.humanVisits, 0); assert.equal(summary.counters.unknownVisits, 2); assert.equal(summary.counters.paidAdHumanVisits, 0);
  assert.doesNotMatch(JSON.stringify(p), /x-vercel-forwarded|user-agent|latitude|longitude|test-only/);
});

test('V3 real Redis: late old-ad entry enriches existing session without renumbering or replacing first source', async (t) => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); await trackVisitorEvent(s, h.options);
  await trackVisitorEvent(action(s), { ...h.options, attribution: legacyAttribution(new URL('https://sitevl-ru.vercel.app/prices')) });
  const p = await readVisitor(s.visitorId, h.options);
  assert.equal(p.session.visitNumber, '1'); assert.equal(p.visitor.visitorNumber, '1'); assert.equal(p.visitor.firstSource, 'direct');
  assert.equal(p.session.source, 'paid-ad'); assert.equal(p.visitor.currentSource, 'paid-ad');
  assert.equal((await readTrafficSummary(h.options)).counters.unknownVisits, 1);
  assert.match(h.telegram[1], /Рекламный источник[\s\S]*предположение/);
});

test('V3 HTTP handlers: crawler JavaScript cannot inflate site, LAB, visitor numbers; owner API requires auth', async (t) => {
  const h = await createRedisHarness(t); if (!h) return;
  const keys = { ...h.options.environment, VISITOR_OWNER_API_TOKEN: 'test-owner-only' };
  const previous = Object.fromEntries(Object.keys(keys).map(key => [key, process.env[key]]));
  Object.assign(process.env, keys);
  t.after(() => { for (const [key, value] of Object.entries(previous)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } });
  t.mock.method(globalThis, 'fetch', h.options.fetchImpl);
  const s = start(); const headers = { 'content-type': 'application/json', 'user-agent': `${chrome} Google-InspectionTool/1.0` };
  for (const [handler, body] of [[siteHandler, { event: 'site_visit', visitorId: s.visitorId, sessionId: s.sessionId }], [labHandler, { event: 'lab_visit', visitorId: s.visitorId, sessionId: s.sessionId }], [visitorHandler, s]]) {
    const response = responseCapture(); await handler({ method: 'POST', body, headers }, response);
    assert.equal(response.statusCode, 202); assert.equal(response.body.ignored, 'automated-traffic');
  }
  assert.equal(await h.command(['EXISTS', 'sitevl:site:visits', 'sitevl:lab:visits', 'sitevl:visitor:v2:visitor-sequence']), 0);
  const normal = responseCapture(); await visitorHandler({ method: 'POST', body: s, headers: { ...headers, 'user-agent': safari } }, normal);
  assert.equal(normal.statusCode, 202); assert.equal(await h.command(['GET', 'sitevl:visitor:v2:visitor-sequence']), '1');
  for (const authorization of ['', 'Bearer wrong']) {
    const response = responseCapture(); await ownerHandler({ method: 'GET', query: { view: 'traffic' }, headers: { authorization } }, response);
    assert.equal(response.statusCode, 401); assert.equal('counters' in response.body, false);
  }
  const owner = responseCapture(); await ownerHandler({ method: 'GET', query: { view: 'traffic' }, headers: { authorization: 'Bearer test-owner-only' } }, owner);
  assert.equal(owner.statusCode, 200); assert.equal(owner.body.version, '3.1');
});

test('V3 middleware: ordinary delivery does not query Redis/DNS; crawler processing is deferred', async () => {
  const jobs: Promise<unknown>[] = [];
  const context = { waitUntil: (job: Promise<unknown>) => jobs.push(job) };
  const response = middleware(new Request('https://sitevl.tech/', { headers: { 'user-agent': safari } }), context);
  assert.equal(response.headers.get('x-middleware-next'), '1'); assert.equal(jobs.length, 0);
  middleware(new Request('https://sitevl.tech/', { headers: { 'user-agent': 'Googlebot' } }), context);
  assert.equal(jobs.length, 1); await Promise.all(jobs);
});

test('V3.1 client: contact categories allow server-session caps; channel/route allowlist; no sensitive frontend fields', async (t) => {
  const values = () => { const map = new Map<string, string>(); return { getItem: (k: string) => map.get(k) || null, setItem: (k: string, v: string) => { map.set(k, v); } }; };
  const bodies: Record<string, string>[] = [];
  t.mock.method(globalThis, 'fetch', async (_input: unknown, init: RequestInit) => { bodies.push(JSON.parse(String(init.body))); return Response.json({ accepted: true }); });
  const local = values(); const session = values();
  await trackVisitorAction('contact_click', '/contacts', 'telegram', local, session);
  await trackVisitorAction('contact_click', '/contacts', 'telegram', local, session);
  assert.equal(bodies.filter(body => body.event === 'contact_click').length, 2);
  assert.equal(contactChannel('https://t.me/sitevl?text=private'), 'telegram');
  assert.equal(contactChannel('https://t.me.evil.example/'), null);
  assert.equal(contactChannel('https://wa.me/123?text=private'), 'whatsapp');
  assert.equal(safeSource('?utm_source=telegram&email=private'), 'telegram');
  assert.equal(validateVisitorEvent(action(start(), 'contact_click', '/contacts', { channel: 'email' })).ok, false);
  assert.equal(validateVisitorEvent(action(start(), 'engagement', '/', { signal: 'raw-key' })).ok, false);
  for (const key of ['geo', 'classification', 'attribution', 'message', 'ip']) assert.equal(validateVisitorEvent({ ...start(), [key]: 'arbitrary' }).ok, false);
  const client = (await Promise.all(['visitorIntelligence.ts', 'visitorBehavior.ts', 'SiteAnalyticsProvider.tsx'].map(file => readFile(new URL(file, import.meta.url), 'utf8')))).join('\n');
  assert.doesNotMatch(client, /VISITOR_ATTRIBUTION_SECRET|TELEGRAM_BOT_TOKEN|x-vercel-ip|geolocation|fingerprint|\.value\b|keyCode/);
  assert.match(client, /removeEventListener/);
});

test('V3 client: new ad document can reach an existing session; SPA rerenders retain dedup ID', async (t) => {
  const values = () => { const map = new Map<string, string>(); return { getItem: (k: string) => map.get(k) || null, setItem: (k: string, v: string) => { map.set(k, v); } }; };
  const bodies: Record<string, string>[] = [];
  t.mock.method(globalThis, 'fetch', async (_input: unknown, init: RequestInit) => { bodies.push(JSON.parse(String(init.body))); return Response.json({ accepted: true }); });
  const local = values(); const session = values();
  const args = ['/prices', 'default', '', local, session, safari, '', 'sitevl.tech'] as const;
  await trackVisitorPage(...args); await trackVisitorPage(...args);
  const nextDocument = await import(new URL('./visitorIntelligence.ts?qaDocument=next', import.meta.url).href);
  await nextDocument.trackVisitorPage(...args);
  const pages = bodies.filter(e => e.event === 'page_view');
  assert.equal(pages[0].eventId, pages[1].eventId);
  assert.notEqual(pages[0].eventId, pages[2].eventId);
  assert.equal(new Set(pages.map(e => e.visitorId)).size, 1);
  assert.equal(new Set(pages.map(e => e.sessionId)).size, 1);
  assert.equal(bodies.filter(e => e.event === 'session_start').length, 1);
});

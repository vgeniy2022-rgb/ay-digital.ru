import assert from 'node:assert/strict';
import test from 'node:test';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
// @ts-expect-error Native server ESM.
import { trackVisitorEvent, readVisitor, validateVisitorEvent, linkLeadToVisitor } from '../../../api/_visitorIntelligenceCore.mjs';
// @ts-expect-error Native server ESM.
import { readTrafficSummary } from '../../../api/_visitorStoreV3.mjs';
// @ts-expect-error Native server ESM.
import { legacyAttribution, classifyRequestTraffic } from '../../../api/_trafficPolicyV3.mjs';
// @ts-expect-error Native server ESM.
import { REASON_CODES, INTEREST_WEIGHTS, coarseBrowser } from '../../../api/_visitorConfidenceV31.mjs';
// @ts-expect-error Native server ESM.
import { VISITOR_EVENT_SCRIPT, LINK_LEAD_SCRIPT } from '../../../api/_visitorStoreV2.mjs';
import { BehaviorAccumulator, dwellBucket } from './visitorBehavior';
import { createRedisHarness } from './visitorRedisHarness';

const start = (visitorId = 'visitor-' + randomUUID(), sessionId = 'session-' + randomUUID()) => ({ event: 'session_start', visitorId, sessionId, eventId: 'event-' + randomUUID(), path: '/', source: 'direct', referrerHost: '', deviceType: 'desktop', deviceFamily: 'Mac', browser: 'Chrome' });
const action = (s: ReturnType<typeof start>, event = 'page_view', path = '/', extra = {}) => ({ event, visitorId: s.visitorId, sessionId: s.sessionId, eventId: 'event-' + randomUUID(), path, ...extra });
const behavior = (overrides = {}) => ({ dwell: 2, scroll: 1, pointer: true, touch: false, keyboard: false, link: true, form: false, ...overrides });

test('V3.1 Upstash compatibility: both scripts copy readonly KEYS before alias resolution', () => {
  for (const script of [VISITOR_EVENT_SCRIPT, LINK_LEAD_SCRIPT]) {
    assert.match(script, /local providedKeys = KEYS\s+local KEYS = \{\}\s+for i, key in ipairs\(providedKeys\) do KEYS\[i\] = key end/);
    assert.ok(script.indexOf('local KEYS = {}') < script.indexOf('KEYS[2] = alias') || script.includes('KEYS[7] ='));
  }
});

test('V3.1: synthetic schemas reject scores, client clocks, nested data and arbitrary sources of identity', () => {
  const s = start();
  for (const key of ['humanScore', 'classificationScore', 'interestScore', 'classification', 'geo', 'timestamp', 'networkHash', 'visitorNumber']) assert.equal(validateVisitorEvent({ ...s, [key]: 100 }).ok, false);
  for (const b of [behavior({ dwell: 5 }), behavior({ dwell: -1 }), behavior({ scroll: 1.5 }), behavior({ keyboard: 'a' }), behavior({ x: 5 }), behavior({ text: 'private' })]) assert.equal(validateVisitorEvent(action(s, 'behavior', '/', { behavior: b })).ok, false);
  assert.equal(validateVisitorEvent(action(s, 'behavior', '/', { behavior: behavior() })).ok, true);
  assert.equal(validateVisitorEvent({ ...s, source: 'paid-ad' }).value.source, 'direct');
  assert.equal(coarseBrowser('Mozilla/5.0 (X11; Linux x86_64) Chrome/140 Safari/537').deviceFamily, 'Linux');
});

test('V3.1 real Redis: short passive browser is unknown; scroll alone weak; forged dwell is elapsed-time capped', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); let now = h.options.now(); const options = { ...h.options, now: () => now };
  await trackVisitorEvent(s, options);
  await trackVisitorEvent(action(s), options);
  now += 3000;
  await trackVisitorEvent(action(s, 'behavior', '/', { behavior: behavior({ dwell: 4, pointer: false, link: false, scroll: 4 }) }), options);
  const p = await readVisitor(s.visitorId, options);
  assert.equal(p.session.classification, 'unknown'); assert.equal(p.session.dwell, '0'); assert.equal(p.session.classificationScore, '38');
  const { counters } = await readTrafficSummary(options);
  assert.equal(counters.technicalVisits, 1); assert.equal(counters.unknownVisits, 1); assert.equal(counters.humanVisits, 0); assert.equal(counters.uniqueHumanVisitors, 0);
  assert.match(h.telegram[0], /❔ Новый визит[\s\S]*недостаточно данных/); assert.doesNotMatch(h.telegram[0], /вероятно человек|👤/);
});

test('V3.1 real Redis: 29-minute gap and new tabs reuse analytic visit; 31-minute gap in same tab creates one', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); let now = h.options.now(); const options = { ...h.options, now: () => now };
  await trackVisitorEvent(s, options);
  now += 29 * 60000;
  const tab = start(s.visitorId);
  await Promise.all([trackVisitorEvent(tab, options), trackVisitorEvent(action(s, 'page_view', '/cases'), options)]);
  let p = await readVisitor(s.visitorId, options);
  assert.equal(p.visitor.sessions, '1'); assert.equal(p.session.visitNumber, '1');
  now += 31 * 60000;
  await Promise.all([trackVisitorEvent(action(s, 'page_view', '/prices'), options), trackVisitorEvent(action(tab, 'page_view', '/services'), options)]);
  p = await readVisitor(s.visitorId, { ...options, sessionId: s.sessionId });
  assert.equal(p.visitor.visitorNumber, '1'); assert.equal(p.visitor.sessions, '2'); assert.equal(p.session.visitNumber, '2');
  assert.equal(p.session.technicalSessionId, s.sessionId);
  assert.equal(await h.command(['HGET', 'sitevl:visitor:v2:session:' + s.sessionId, 'visitNumber']), '1'); // preserved historical number
  assert.equal((await readTrafficSummary(options)).counters.technicalVisits, 2);
});

test('V3.1 real Redis: boundary exactly 30 minutes stays; duplicate event never refreshes inactivity', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); let now = h.options.now(); const options = { ...h.options, now: () => now };
  await trackVisitorEvent(s, options); now += 1800000;
  const page = action(s, 'page_view', '/services'); await trackVisitorEvent(page, options);
  assert.equal((await readVisitor(s.visitorId, options)).visitor.sessions, '1');
  now += 29 * 60000; await trackVisitorEvent(page, options);
  now += 2 * 60000; await trackVisitorEvent(action(s, 'page_view', '/cases'), options);
  assert.equal((await readVisitor(s.visitorId, options)).visitor.sessions, '2');
});

test('V3.1 real Redis: repeated aggregate cannot keep an idle session alive', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); let now = h.options.now(); const options = { ...h.options, now: () => now };
  await trackVisitorEvent(s, options); now += 60000;
  await trackVisitorEvent(action(s, 'behavior', '/', { behavior: behavior() }), options);
  now += 29 * 60000;
  const repeated = await trackVisitorEvent(action(s, 'behavior', '/', { behavior: behavior() }), options);
  assert.equal(repeated.deduplicated, true);
  now += 2 * 60000; await trackVisitorEvent(action(s, 'page_view', '/prices'), options);
  assert.equal((await readVisitor(s.visitorId, options)).visitor.sessions, '2');
});

test('V3.1 real Redis: legacy profiles read as legacy-unknown, lazily adopt recent number, never rewrite historical hashes/totals', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); const profile = 'sitevl:visitor:v1:' + s.visitorId;
  await h.command(['HSET', profile, 'visitorNumber', '81', 'lastVisitNumber', '600', 'sessions', '170', 'firstVisit', '2026-01-01T00:00:00Z', 'lastVisit', new Date(h.options.now() - 60000).toISOString(), 'classification', 'human']);
  await h.command(['HSET', 'sitevl:visitor:v3:stats', 'humanVisits', '999']);
  await h.command(['SET', 'sitevl:visitor:v2:visit-sequence', '600']);
  assert.equal((await readVisitor(s.visitorId, h.options)).visitor.classification, 'legacy-unknown');
  await trackVisitorEvent(s, h.options);
  const p = await readVisitor(s.visitorId, h.options);
  assert.equal(p.visitor.visitorNumber, '81'); assert.equal(p.session.visitNumber, '600'); assert.equal(p.visitor.sessions, '170');
  assert.equal(p.session.classification, 'unknown'); assert.equal(await h.command(['HGET', 'sitevl:visitor:v3:stats', 'humanVisits']), '999');
});

test('V3.1 real Redis: 6 Linux Chrome identities /2s produce one burst alert and no human uniques', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const browser = { deviceFamily: 'Linux', browser: 'Chrome', deviceType: 'desktop' };
  const events = Array.from({ length: 6 }, () => start()); let now = h.options.now(); const options = { ...h.options, browser, now: () => now };
  for (const event of events) { await trackVisitorEvent(event, options); now += 300; }
  const last = await readVisitor(events[5].visitorId, options);
  assert.equal(last.session.classification, 'likely-bot'); assert.match(last.session.classificationReasons, /linux-burst/);
  assert.equal((await readTrafficSummary(options)).counters.uniqueHumanVisitors, 0);
  assert.equal(h.telegram.filter(text => /Пачка похожих/.test(text)).length, 1);
  assert.equal(h.telegram.filter(text => /Новый визит/.test(text)).length, 1);
  assert.equal(h.telegram.filter(text => /👤/.test(text)).length, 0);
  await trackVisitorEvent(action(events[0]), options);
  assert.equal((await readVisitor(events[0].visitorId, options)).session.classification, 'likely-bot');
  assert.equal(h.telegram.filter(text => /Пачка похожих/.test(text)).length, 1);
});

test('V3.1 real Redis: network burst does not merge IDs or retain network hash in long-lived session/history', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const networkHash = 'b'.repeat(64); const options = { ...h.options, networkHash };
  const events = Array.from({ length: 6 }, () => start());
  for (const e of events) await trackVisitorEvent(e, options);
  const p = await readVisitor(events[5].visitorId, options);
  assert.equal(p.session.classification, 'likely-bot'); assert.match(p.session.classificationReasons, /network-burst/);
  assert.equal(p.visitor.visitorNumber, '6'); assert.doesNotMatch(JSON.stringify(p), /bbbbbbbbbbbbbbbb/);
  const raw = await h.command(['HGETALL', 'sitevl:visitor:v31:session:6']); assert.equal(JSON.stringify(raw).includes(networkHash), false);
  assert.ok(Number(await h.command(['TTL', 'sitevl:visitor:v31:network-burst:' + networkHash])) <= 60);
});

test('V3.1 real Redis: six paid iPhones are not bots; independent behavior qualifies each and preserves attribution', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const attribution = legacyAttribution(new URL('https://sitevl-ru.vercel.app/?src=telegram-vl-1'));
  let now = h.options.now(); const browser = { deviceFamily: 'iPhone', browser: 'Safari', deviceType: 'mobile' };
  const options = { ...h.options, browser, now: () => now };
  const events = Array.from({ length: 6 }, () => start());
  for (const e of events) { await trackVisitorEvent(e, { ...options, attribution }); now += 1000; }
  let stats = (await readTrafficSummary(options)).counters;
  assert.equal(stats.paidAdTechnicalVisits, 6); assert.equal(stats.paidAdHumanVisits, 0); assert.equal(stats.likelyBotVisits, 0);
  now += 60000;
  for (const e of events) {
    await trackVisitorEvent(action(e, 'behavior', '/', { behavior: behavior() }), options);
    await trackVisitorEvent(action(e, 'page_view', '/cases'), options); now += 4000;
    await trackVisitorEvent(action(e, 'page_view', '/prices'), options);
    const p = await readVisitor(e.visitorId, options);
    assert.equal(p.session.classification, 'likely-human'); assert.equal(p.session.source, 'paid-ad'); assert.equal(Number(p.session.interestScore), 25);
    assert.ok(JSON.parse(p.session.classificationReasons).every((reason: string) => REASON_CODES.includes(reason)));
  }
  stats = (await readTrafficSummary(options)).counters;
  assert.equal(stats.paidAdHumanVisits, 6); assert.equal(stats.paidAdUniqueHumans, 6); assert.equal(stats.uniqueHumanVisitors, 6); assert.equal(stats.unknownVisits, 0);
  assert.equal(h.telegram.filter(text => /Порог поведенческих признаков/.test(text)).length, 6);
});

test('V3.1 real Redis: reading + three pages raises confidence; interest capped separately; transitions notify once', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); let now = h.options.now(); const options = { ...h.options, now: () => now };
  await trackVisitorEvent(s, options); now += 30000;
  await trackVisitorEvent(action(s, 'behavior', '/', { behavior: behavior({ pointer: false, link: false, scroll: 0 }) }), options);
  await trackVisitorEvent(action(s, 'page_view', '/cases'), options); now += 5000;
  await trackVisitorEvent(action(s, 'page_view', '/prices'), options);
  let p = await readVisitor(s.visitorId, options);
  assert.equal(p.session.classificationScore, '60'); assert.equal(p.session.interestScore, '25');
  await trackVisitorEvent(action(s, 'page_view', '/contacts'), options);
  await trackVisitorEvent(action(s, 'contact_click', '/contacts', { channel: 'telegram' }), options);
  for (let i = 0; i < 3; i++) await trackVisitorEvent(action(s, 'contact_click', '/contacts', { channel: 'telegram' }), options);
  p = await readVisitor(s.visitorId, options); assert.equal(p.session.interestScore, '60'); assert.equal(p.session.classificationScore, '60');
  assert.equal(h.telegram.filter(text => /Порог поведенческих признаков/.test(text)).length, 1);
  assert.equal(h.telegram.filter(text => /♨️ Тёплый/.test(text)).length, 1);
  assert.equal(h.telegram.filter(text => /🔥 Горячий/.test(text)).length, 1);
  assert.doesNotMatch(h.telegram.join(' '), /вероятность человека \d+%/);
});

test('V3.1 real Redis: generic 50-page regular crawler is downgraded and reverses human/paid counts', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); let now = h.options.now(); const options = { ...h.options, now: () => now };
  await trackVisitorEvent(s, { ...options, attribution: legacyAttribution(new URL('https://sitevl-ru.vercel.app/')) });
  now += 31000;
  await trackVisitorEvent(action(s, 'behavior', '/', { behavior: behavior({ pointer: false, link: false }) }), options);
  for (let i = 0; i < 50; i++) { now += 2200; await trackVisitorEvent(action(s, 'page_view', '/seo-page-' + i), options); }
  const p = await readVisitor(s.visitorId, options); assert.equal(p.session.classification, 'likely-bot'); assert.match(p.session.classificationReasons, /sequential-traversal/);
  const { counters } = await readTrafficSummary(options);
  assert.equal(counters.humanVisits, 0); assert.equal(counters.uniqueHumanVisitors, 0); assert.equal(counters.paidAdHumanVisits, 0); assert.equal(counters.paidAdUniqueHumans, 0); assert.equal(counters.likelyBotVisits, 1);
});

test('V3.1 real Redis: return after day retains number; unusually many new sessions is only a combined risk', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); let now = h.options.now(); const options = { ...h.options, now: () => now };
  await trackVisitorEvent(s, options); now += 86400000;
  await trackVisitorEvent(action(s, 'page_view', '/prices'), options);
  let p = await readVisitor(s.visitorId, options); assert.equal(p.visitor.visitorNumber, '1'); assert.equal(p.session.classificationScore, '43'); assert.equal(p.session.interestScore, '25');
  for (let i = 0; i < 5; i++) { now += 31 * 60000; await trackVisitorEvent(action(s, 'page_view', '/services'), options); }
  p = await readVisitor(s.visitorId, options); assert.equal(p.session.classification, 'unknown'); assert.doesNotMatch(p.session.classificationReasons, /high-session-velocity/);
  for (let i = 0; i < 10; i++) { now += 2500; await trackVisitorEvent(action(s, 'page_view', '/service-page-' + i), options); }
  p = await readVisitor(s.visitorId, options); assert.match(p.session.classificationReasons, /high-session-velocity/);
  assert.equal(p.visitor.sessions, '7');
});

test('V3.1 real Redis: organic Google and datacenter-looking city do not alter human score or imply Googlebot', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = { ...start(), source: 'referral', referrerHost: 'google.com', path: '/website-development-vladivostok' };
  const traffic = await classifyRequestTraffic({ headers: { 'user-agent': 'Mozilla/5.0 Chrome/140 Safari/537', referer: 'https://google.com/' } });
  assert.equal(traffic.classification, 'unknown');
  const options = { ...h.options, traffic, geo: { country: 'US', region: 'IA', city: 'Council Bluffs', geoSource: 'network', geoPrecision: 'approximate' } };
  await trackVisitorEvent(s, options);
  const p = await readVisitor(s.visitorId, options);
  assert.equal(p.session.classificationScore, '35'); assert.equal(p.session.classification, 'unknown'); assert.equal(p.session.referrerHost, 'google.com');
  assert.doesNotMatch(p.session.classificationReasons, /geo|hosting|datacenter/);
});

test('V3.1 real Redis: lead uses technical alias and adds capped interest without claiming humanity', async t => {
  const h = await createRedisHarness(t); if (!h) return;
  const s = start(); await trackVisitorEvent(s, h.options);
  const lead = { id: randomUUID(), createdAt: new Date(h.options.now()).toISOString(), visitorId: s.visitorId, visitorSessionId: s.sessionId, conceptId: 'SV-AI-QAT31A', contact: { name: 'Synthetic only' } };
  await linkLeadToVisitor(lead, h.options); await linkLeadToVisitor(lead, h.options);
  const p = await readVisitor(s.visitorId, h.options);
  assert.equal(p.session.classification, 'unknown'); assert.equal(Number(p.session.interestScore), INTEREST_WEIGHTS.lead_created); assert.equal(p.visitor.leads, '1');
});

test('V3.1 client: visibility, milestones, debounce and inactivity reset are deterministic', () => {
  assert.deepEqual([0, 9000, 10000, 30000, 120000, 300000].map(dwellBucket), [0, 0, 1, 2, 3, 4]);
  const state = new BehaviorAccumulator(0, true);
  state.mark('pointer', 1000); assert.equal(state.snapshot(5000), null);
  assert.equal(state.snapshot(10000)?.dwell, 1);
  state.advance(11000, false); state.mark('keyboard', 60000); assert.equal(state.snapshot(61000), null);
  state.advance(62000, true); assert.equal(state.snapshot(82000)?.dwell, 2);
  for (let i = 0; i < 100; i++) state.scroll(2, 83000 + i);
  assert.equal(state.snapshot(84000), null); assert.equal(state.snapshot(93000)?.scroll, 2);
  state.advance(94000, false); state.advance(2000000, true);
  assert.equal(state.snapshot(2000001), null);
});

test('V3.1 privacy: no fingerprinting, raw input or unbounded per-scroll requests in analytics collector', async () => {
  const source = await readFile(new URL('visitorBehavior.ts', import.meta.url), 'utf8');
  assert.doesNotMatch(source, /clientX|clientY|screenX|screenY|keyCode|event\.key\b|\.value\b|canvas|webgl|getUserMedia|geolocation|fonts|fetch\(/i);
  assert.match(source, /clearInterval/); assert.match(source, /removeEventListener/); assert.match(source, /isTrusted/);
  assert.match(source, /visibilityState/); assert.match(source, /const scroll = \(\) => \{ scrollPending = true; \}/);
});

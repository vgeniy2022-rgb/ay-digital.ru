import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { createRadarHandler, type HandlerDependencies } from '../server/handler';
import { sessionCookie } from '../server/security';
import { fixtureFetch, OTHER_TOKEN, TEST_ENV, TEST_TOKEN, TestRateGate } from './harness';

async function withApi(run: (url: string, gate: TestRateGate) => Promise<void>, overrides: Partial<HandlerDependencies> = {}) {
  const gate = new TestRateGate();
  const handler = createRadarHandler({ env: TEST_ENV, fetchImpl: fixtureFetch, rateGate: gate, ...overrides });
  const server = createServer((req, res) => { void handler(req, res); });
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve));
  try { await run(`http://127.0.0.1:${(server.address() as AddressInfo).port}/api/radar`, gate); }
  finally { server.closeAllConnections(); await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
}
const cookie = `sitevl_radar_dev=${TEST_TOKEN}`;
const writeHeaders = { Origin: TEST_ENV.RADAR_ORIGIN!, 'Content-Type': 'application/json' };
test('disabled backend returns 404 and calls no dependencies', () => withApi(async url => {
  const r = await fetch(url); assert.equal(r.status, 404); assert.equal((await r.json()).error, 'RADAR_DISABLED');
}, { env: {}, fetchImpl: async () => { throw new Error('must not call'); } }));
test('unauthenticated API denied, no dashboard data leaked', () => withApi(async url => {
  const r = await fetch(url); assert.equal(r.status, 401); assert.deepEqual(await r.json(), { error: 'AUTH_REQUIRED' });
  assert.match(r.headers.get('cache-control')!, /no-store/); assert.equal(r.headers.get('x-robots-tag'), 'noindex, nofollow');
}));
test('verified non-owner denied despite valid upstream user response', () => withApi(async url => {
  const r = await fetch(url, { headers: { cookie: `sitevl_radar_dev=${OTHER_TOKEN}` } }); assert.equal(r.status, 403);
}));
test('owner gets honest empty dashboard, no fake analytics or online collectors', () => withApi(async url => {
  const r = await fetch(url, { headers: { cookie } }); assert.equal(r.status, 200); const data = await r.json();
  assert.equal(data.components.database.status, 'ONLINE'); assert.equal(data.components.avito.status, 'NOT_CONFIGURED');
  assert.equal(data.counts.listings, 0); assert.equal(data.counts.hot, null); assert.deepEqual(data.listings, []);
  assert.ok(!JSON.stringify(data).includes(TEST_TOKEN));
}));
test('login sets HttpOnly SameSite cookie and never returns access/refresh tokens', () => withApi(async url => {
  const r = await fetch(`${url}?action=login`, { method: 'POST', headers: writeHeaders, body: JSON.stringify({ email: 'owner@example.invalid', password: 'qa-only-password' }) });
  assert.equal(r.status, 200); assert.match(r.headers.get('set-cookie')!, /HttpOnly; SameSite=Strict/);
  assert.deepEqual(await r.json(), { authenticated: true });
  assert.match(sessionCookie(TEST_TOKEN, { RADAR_ORIGIN: 'https://sitevl.tech', NODE_ENV: 'production' }), /^__Host-sitevl_radar=.*; Secure$/);
}));
test('bad login and cross-site login rejected', () => withApi(async url => {
  const body = JSON.stringify({ email: 'owner@example.invalid', password: 'wrong' });
  assert.equal((await fetch(`${url}?action=login`, { method: 'POST', headers: writeHeaders, body })).status, 401);
  assert.equal((await fetch(`${url}?action=login`, { method: 'POST', headers: { ...writeHeaders, Origin: 'https://evil.example' }, body })).status, 403);
}));
test('rate limit fails before upstream calls and returns Retry-After', () => withApi(async (url, gate) => {
  gate.denied = true; const r = await fetch(url, { headers: { cookie } }); assert.equal(r.status, 429); assert.equal(r.headers.get('retry-after'), '60');
}));
test('logout immediately rejects replay of the same cookie', () => withApi(async url => {
  assert.equal((await fetch(`${url}?action=logout`, { method: 'POST', headers: { ...writeHeaders, cookie }, body: '{}' })).status, 200);
  assert.equal((await fetch(url, { headers: { cookie } })).status, 401);
}));
test('expired server session denies a still-valid upstream access token', () => withApi(async (url, gate) => {
  gate.tokens.delete(TEST_TOKEN);
  assert.equal((await fetch(url, { headers: { cookie } })).status, 401);
}));
test('API rejects unsupported verbs, action smuggling and oversized JSON', () => withApi(async url => {
  assert.equal((await fetch(url, { method: 'DELETE' })).status, 405);
  assert.equal((await fetch(`${url}?action=dashboard&action=login`)).status, 400);
  assert.equal((await fetch(`${url}?table=radar_owners`)).status, 400);
  assert.equal((await fetch(`${url}?action=login`, { method: 'POST', headers: writeHeaders, body: JSON.stringify({ email: 'a@b.c', password: 'x'.repeat(9000) }) })).status, 413);
}));
test('feedback requires owner + same origin + strict payload', () => withApi(async url => {
  const body = JSON.stringify({ action: 'SAVE', listingId: '11111111-1111-4111-8111-111111111111', operationId: '22222222-2222-4222-8222-222222222222' });
  assert.equal((await fetch(`${url}?action=feedback`, { method: 'POST', headers: writeHeaders, body })).status, 401);
  assert.equal((await fetch(`${url}?action=feedback`, { method: 'POST', headers: { ...writeHeaders, cookie }, body })).status, 200);
  assert.equal((await fetch(`${url}?action=feedback`, { method: 'POST', headers: { ...writeHeaders, cookie }, body: body.replace('SAVE', 'DELETE') })).status, 400);
}));
test('raw upstream errors and credentials never appear in response', () => withApi(async url => {
  const r = await fetch(url, { headers: { cookie } }); assert.equal(r.status, 503);
  const text = await r.text(); assert.ok(!text.includes('private-key')); assert.deepEqual(JSON.parse(text), { error: 'RADAR_UNAVAILABLE' });
}, { fetchImpl: async () => { throw new Error('https://secret.example?key=private-key'); } }));

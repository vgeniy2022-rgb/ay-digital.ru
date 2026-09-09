import type { Environment } from '../config';
import type { RateGate } from '../server/security';

// Explicit test fixtures. Never imported by api/radar or any frontend module.
export const TEST_TOKEN = 'not-a-real-token.qa-owner-session.fixture-0000000000000000';
export const OTHER_TOKEN = 'not-a-real-token.qa-nonowner-session.fixture-000000000000';
export const OWNER_ID = '00000000-0000-4000-8000-000000000001';
export const TEST_ENV: Environment = { RADAR_ENABLED: 'true', RADAR_DEVELOPMENT_MODE: 'true', NODE_ENV: 'test',
  RADAR_ORIGIN: 'http://localhost:4186', RADAR_RATE_LIMIT_SECRET: 'TEST_ONLY_NOT_A_SECRET_0000000000000000000000',
  RADAR_SUPABASE_URL: 'https://test-fixture.supabase.co', RADAR_SUPABASE_PUBLISHABLE_KEY: 'TEST_ONLY_PLACEHOLDER' };
export class TestRateGate implements RateGate {
  denied = false;
  tokens = new Set<string>([TEST_TOKEN, OTHER_TOKEN]);
  async allow() { return !this.denied; }
  async sessionActive(token: string) { return this.tokens.has(token); }
  async openSession(token: string) { this.tokens.add(token); }
  async closeSession(token: string) { this.tokens.delete(token); }
}
export const fixtureFetch: typeof fetch = async (input, init) => {
  const url = new URL(String(input));
  const authorization = new Headers(init?.headers).get('authorization');
  const owner = authorization === `Bearer ${TEST_TOKEN}`;
  const json = (data: unknown, status = 200, headers = {}) => new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', ...headers } });
  if (url.pathname === '/auth/v1/token') {
    const body = JSON.parse(String(init?.body));
    return body.email === 'owner@example.invalid' && body.password === 'qa-only-password' ? json({ access_token: TEST_TOKEN }) : json({ error: 'fixture login rejected' }, 400);
  }
  if (url.pathname === '/auth/v1/user') return authorization === `Bearer ${TEST_TOKEN}` || authorization === `Bearer ${OTHER_TOKEN}` ? json({ id: owner ? OWNER_ID : '00000000-0000-4000-8000-000000000002', is_anonymous: false }) : json({}, 401);
  if (url.pathname === '/auth/v1/logout') return new Response(null, { status: 204 });
  if (url.pathname === '/rest/v1/radar_owners') return json(owner ? [{ owner_id: OWNER_ID }] : []);
  if (url.pathname === '/rest/v1/radar_listings') return json([], 200, { 'content-range': '*/0' });
  if (url.pathname === '/rest/v1/radar_runtime_status') return json([]);
  if (url.pathname === '/rest/v1/radar_feedback') return new Response(null, { status: 201 });
  throw new Error('Unexpected fixture request');
};

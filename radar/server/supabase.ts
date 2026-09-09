import type { Environment } from '../config';
import { boundedJson, RadarError, record } from './errors';

export interface AuthenticatedOwner { id: string; token: string }
export class RadarSupabase {
  readonly url: string;
  readonly key: string;
  constructor(env: Environment, private readonly fetchImpl: typeof fetch = fetch) {
    this.url = env.RADAR_SUPABASE_URL || ''; this.key = env.RADAR_SUPABASE_PUBLISHABLE_KEY || '';
    if (this.url) {
      const parsed = new URL(this.url);
      if (parsed.protocol !== 'https:' || !/^[a-z0-9-]+\.supabase\.co$/.test(parsed.hostname) || parsed.pathname !== '/' || parsed.search || parsed.username || parsed.password || parsed.port) throw new RadarError(503, 'AUTH_NOT_CONFIGURED');
      this.url = parsed.origin;
    }
  }
  get configured() { return Boolean(this.url && this.key); }
  async request(path: string, token?: string, init: RequestInit = {}) {
    if (!this.configured) throw new RadarError(503, 'AUTH_NOT_CONFIGURED');
    return this.fetchImpl(`${this.url}${path}`, { ...init, redirect: 'error', signal: AbortSignal.timeout(8000),
      headers: { apikey: this.key, ...(token ? { Authorization: `Bearer ${token}` } : {}), 'Content-Type': 'application/json', ...init.headers } });
  }
  async owner(token: string): Promise<AuthenticatedOwner> {
    if (!/^[A-Za-z0-9_.-]{32,4096}$/.test(token)) throw new RadarError(401, 'AUTH_REQUIRED');
    const response = await this.request('/auth/v1/user', token);
    if (!response.ok) throw new RadarError(response.status >= 500 ? 503 : 401, response.status >= 500 ? 'AUTH_UNAVAILABLE' : 'AUTH_REQUIRED');
    const user = record(await boundedJson(response, 32768));
    if (typeof user.id !== 'string' || !/^[0-9a-f-]{36}$/i.test(user.id) || user.is_anonymous === true) throw new RadarError(403, 'OWNER_REQUIRED');
    const owners = await this.request(`/rest/v1/radar_owners?owner_id=eq.${user.id}&select=owner_id`, token);
    if (!owners.ok) throw new RadarError(503, 'OWNER_REGISTRY_UNAVAILABLE');
    const rows = await boundedJson(owners, 8192);
    if (!Array.isArray(rows) || !rows.some(row => record(row).owner_id === user.id)) throw new RadarError(403, 'OWNER_REQUIRED');
    return { id: user.id, token };
  }
  async login(email: string, password: string): Promise<AuthenticatedOwner> {
    const response = await this.request('/auth/v1/token?grant_type=password', undefined, { method: 'POST', body: JSON.stringify({ email, password }) });
    if (!response.ok) throw new RadarError(response.status >= 500 ? 503 : 401, response.status >= 500 ? 'AUTH_UNAVAILABLE' : 'LOGIN_FAILED');
    const result = record(await boundedJson(response, 32768));
    if (typeof result.access_token !== 'string') throw new RadarError(502, 'INVALID_UPSTREAM_RESPONSE');
    try { return await this.owner(result.access_token); }
    catch (error) { await this.logout(result.access_token).catch(() => undefined); throw error; }
  }
  async logout(token: string) {
    const response = await this.request('/auth/v1/logout?scope=local', token, { method: 'POST' });
    if (!response.ok && response.status !== 401) throw new RadarError(503, 'AUTH_UNAVAILABLE');
  }
}

import { createHash, createHmac } from 'node:crypto';
import type { IncomingMessage } from 'node:http';
import type { Environment } from '../config';
import { redisConfiguration, redisPipeline } from './legacy.mjs';
import { RadarError } from './errors';

export interface RateGate { allow(key: string, limit: number): Promise<boolean>; sessionActive(token: string): Promise<boolean>; openSession(token: string, seconds: number): Promise<void>; closeSession(token: string): Promise<void> }
export function radarOrigin(env: Environment) {
  const url = new URL(env.RADAR_ORIGIN || 'https://sitevl.tech');
  const local = !env.VERCEL && env.NODE_ENV !== 'production' && ['localhost', '127.0.0.1'].includes(url.hostname);
  if ((!local && url.protocol !== 'https:') || url.username || url.password || url.pathname !== '/' || url.search || url.hash) throw new RadarError(503, 'ORIGIN_NOT_CONFIGURED');
  return { origin: url.origin, secure: !local, cookie: local ? 'sitevl_radar_dev' : '__Host-sitevl_radar' };
}
export function sessionCookie(token: string, env: Environment, maxAge = 900) {
  const options = radarOrigin(env);
  return `${options.cookie}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${maxAge}${options.secure ? '; Secure' : ''}`;
}
export function sessionToken(headers: IncomingMessage['headers'], env: Environment) {
  const name = radarOrigin(env).cookie;
  return (headers.cookie || '').split(';').map(v => v.trim()).find(v => v.startsWith(`${name}=`))?.slice(name.length + 1) || '';
}
export function enforceOrigin(headers: IncomingMessage['headers'], env: Environment) {
  if (headers.origin !== radarOrigin(env).origin || (headers['sec-fetch-site'] && headers['sec-fetch-site'] !== 'same-origin' && headers['sec-fetch-site'] !== 'none')) throw new RadarError(403, 'ORIGIN_REJECTED');
}
export function rateIdentity(request: IncomingMessage, env: Environment) {
  const secret = env.RADAR_RATE_LIMIT_SECRET || env.VISITOR_IP_HASH_SECRET;
  if (!secret || secret.length < 32) throw new RadarError(503, 'RATE_LIMIT_NOT_CONFIGURED');
  // Only Vercel's platform-overwritten client IP is trusted in production; no arbitrary X-Forwarded-For.
  const address = env.VERCEL ? request.headers['x-vercel-forwarded-for'] : request.socket.remoteAddress;
  const ip = typeof address === 'string' ? address.split(',')[0].trim() : '';
  if (!ip) throw new RadarError(503, 'RATE_LIMIT_NOT_CONFIGURED');
  return createHmac('sha256', secret).update(ip).digest('hex');
}
export class RedisRateGate implements RateGate {
  constructor(private readonly env: Environment, private readonly fetchImpl: typeof fetch = fetch) {}
  private async run(commands: (string | number)[][]) {
    const conf = redisConfiguration(this.env);
    if (!conf.url || !conf.token) throw new RadarError(503, 'RATE_LIMIT_NOT_CONFIGURED');
    try { return await redisPipeline(commands, { environment: this.env, fetchImpl: this.fetchImpl }); }
    catch { throw new RadarError(503, 'RATE_LIMIT_UNAVAILABLE'); }
  }
  async allow(key: string, limit: number) {
    // Atomic counter + TTL, isolated from sitevl:lab:* and visitor statistics.
    const script = "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],60) end; return n";
    const result = await this.run([['EVAL', script, 1, `sitevl:radar:rate:${key}`]]);
    const count = Number(result[0]?.result);
    if (!Number.isSafeInteger(count) || count < 1) throw new RadarError(503, 'RATE_LIMIT_UNAVAILABLE');
    return count <= limit;
  }
  private tokenKey(token: string) { return `sitevl:radar:session:${createHash('sha256').update(token).digest('hex')}`; }
  async sessionActive(token: string) { return (await this.run([['EXISTS', this.tokenKey(token)]]))[0]?.result === 1; }
  async openSession(token: string, seconds: number) { await this.run([['SET', this.tokenKey(token), '1', 'EX', seconds]]); }
  async closeSession(token: string) { await this.run([['DEL', this.tokenKey(token)]]); }
}

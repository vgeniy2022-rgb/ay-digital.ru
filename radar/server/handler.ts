import type { IncomingMessage, ServerResponse } from 'node:http';
import { radarConfig, type Environment } from '../config';
import { AvitoCollector, FarPostCollector } from '../collectors';
import { RadarRepository, validateFeedback } from '../database/repository';
import { TelegramNotificationProvider } from '../notifications/telegram';
import type { RadarDashboard } from '../types';
import { RadarError, record } from './errors';
import { RadarSupabase } from './supabase';
import { enforceOrigin, rateIdentity, RedisRateGate, sessionCookie, sessionToken, type RateGate } from './security';
import { radarLog } from '../services/logging';

type ApiRequest = IncomingMessage & { body?: unknown };
export interface HandlerDependencies { env: Environment; fetchImpl?: typeof fetch; rateGate?: RateGate }
function json(response: ServerResponse, status: number, body: unknown) {
  response.statusCode = status; response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(body));
}
async function readBody(request: ApiRequest, max: number) {
  if (!request.headers['content-type']?.startsWith('application/json')) throw new RadarError(415, 'JSON_REQUIRED');
  if (Number(request.headers['content-length'] || 0) > max) throw new RadarError(413, 'PAYLOAD_LIMIT');
  let body: unknown = request.body;
  if (body === undefined) {
    let text = '';
    for await (const chunk of request) {
      text += Buffer.isBuffer(chunk) ? chunk.toString('utf8') : String(chunk);
      if (Buffer.byteLength(text) > max) throw new RadarError(413, 'PAYLOAD_LIMIT');
    }
    body = text;
  }
  if (Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body)) > max) throw new RadarError(413, 'PAYLOAD_LIMIT');
  try { return record(typeof body === 'string' ? JSON.parse(body) : body); }
  catch { throw new RadarError(400, 'INVALID_PAYLOAD'); }
}
export function createRadarHandler(deps: HandlerDependencies) {
  return async (request: ApiRequest, response: ServerResponse) => {
    response.setHeader('Cache-Control', 'private, no-store, max-age=0');
    response.setHeader('Vercel-CDN-Cache-Control', 'no-store');
    response.setHeader('X-Robots-Tag', 'noindex, nofollow');
    response.setHeader('X-Content-Type-Options', 'nosniff');
    response.setHeader('Referrer-Policy', 'no-referrer');
    response.setHeader('X-Frame-Options', 'DENY');
    response.setHeader('Vary', 'Cookie');
    try {
      const config = radarConfig(deps.env);
      if (!config.enabled) return json(response, 404, { error: 'RADAR_DISABLED' });
      if (!['GET', 'POST'].includes(request.method || '')) { response.setHeader('Allow', 'GET, POST'); throw new RadarError(405, 'METHOD_NOT_ALLOWED'); }
      const url = new URL(request.url || '', 'https://sitevl.tech');
      const action = url.searchParams.get('action') || 'dashboard';
      if ([...url.searchParams.keys()].some(key => key !== 'action') || url.searchParams.getAll('action').length > 1 || !['session', 'dashboard', 'login', 'logout', 'feedback'].includes(action)) throw new RadarError(400, 'INVALID_ACTION');
      if ((['login', 'logout', 'feedback'].includes(action)) !== (request.method === 'POST')) throw new RadarError(405, 'METHOD_NOT_ALLOWED');
      if (request.method === 'POST') enforceOrigin(request.headers, deps.env);
      const gate = deps.rateGate || new RedisRateGate(deps.env);
      const identity = rateIdentity(request, deps.env);
      if (!await gate.allow(`${action === 'login' ? 'login' : 'api'}:${identity}`, action === 'login' ? 5 : 60)) throw new RadarError(429, 'RATE_LIMITED');
      const db = new RadarSupabase(deps.env, deps.fetchImpl);
      if (action === 'login') {
        const body = await readBody(request, config.maxPayloadBytes);
        if (Object.keys(body).sort().join(',') !== 'email,password' || typeof body.email !== 'string' || !/^[^\s@]{1,200}@[^\s@]{1,100}$/.test(body.email) || typeof body.password !== 'string' || body.password.length < 1 || body.password.length > 256) throw new RadarError(400, 'INVALID_LOGIN');
        const owner = await db.login(body.email, body.password);
        await gate.openSession(owner.token, config.sessionSeconds);
        response.setHeader('Set-Cookie', sessionCookie(owner.token, deps.env, config.sessionSeconds));
        return json(response, 200, { authenticated: true });
      }
      const token = sessionToken(request.headers, deps.env);
      if (!token) throw new RadarError(401, 'AUTH_REQUIRED');
      if (!/^[A-Za-z0-9_.-]{32,4096}$/.test(token) || !await gate.sessionActive(token)) throw new RadarError(401, 'AUTH_REQUIRED');
      if (action === 'logout') {
        await gate.closeSession(token); // Local revocation is immediate even if Supabase logout is temporarily unavailable.
        response.setHeader('Set-Cookie', sessionCookie('', deps.env, 0));
        await db.logout(token).catch(() => undefined);
        return json(response, 200, { authenticated: false });
      }
      const owner = await db.owner(token);
      if (action === 'session') return json(response, 200, { authenticated: true });
      const repository = new RadarRepository(db, owner);
      if (action === 'feedback') return json(response, 200, await repository.feedback(validateFeedback(await readBody(request, config.maxPayloadBytes))));
      const [avito, farpost, telegram] = await Promise.all([new AvitoCollector().healthCheck(), new FarPostCollector().healthCheck(), new TelegramNotificationProvider(deps.env, config).healthCheck()]);
      const dashboard: RadarDashboard = { enabled: true, development: config.development,
        components: { avito, farpost, telegram, database: { status: 'ERROR', detail: 'Данные пока не получены.', checkedAt: null },
          analyzer: { status: 'NOT_ACTIVE', detail: 'Расчёт рынка, выгодности и рисков запланирован на следующие фазы.', checkedAt: null } },
        counts: { listings: null, anomalies: null, hot: null }, runtime: [], listings: [] };
      try {
        const [listings, runtime, count] = await Promise.all([repository.feed(), repository.runtime(), repository.count('radar_listings')]);
        dashboard.listings = listings; dashboard.runtime = runtime; dashboard.counts.listings = count;
        dashboard.components.database = { status: 'ONLINE', detail: 'Прочитаны закрытые таблицы через RLS владельца.', checkedAt: new Date().toISOString() };
      } catch {
        dashboard.components.database = { status: 'ERROR', detail: 'Не удалось прочитать таблицы Radar. Проверьте миграцию и доступ владельца.', checkedAt: new Date().toISOString() };
      }
      return json(response, 200, dashboard);
    } catch (error) {
      const failure = error instanceof RadarError ? error : new RadarError(503, 'RADAR_UNAVAILABLE');
      if (failure.status >= 500 && deps.env.NODE_ENV !== 'test') radarLog('ERROR', 'REQUEST_FAILED');
      if (failure.status === 429) response.setHeader('Retry-After', '60');
      // Never forward upstream error objects, URLs, cookies or raw environment to response/logs.
      return json(response, failure.status, { error: failure.code });
    }
  };
}

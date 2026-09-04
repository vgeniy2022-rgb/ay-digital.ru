import { timingSafeEqual } from 'node:crypto';
import { redisPipeline } from './_labStatsCore.mjs';

export const VISITOR_NAMESPACE = 'sitevl:visitor:v1';
export const VISITOR_EVENT_TYPES = Object.freeze([
  'session_start',
  'page_view',
  'experiment_start',
  'ai_concept_created',
  'brief_completed',
]);

const VISITOR_PATTERN = /^(?:SV-[A-F0-9]{6}|visitor-[a-f0-9]{32}|visitor-[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;
const SESSION_PATTERN = /^session-(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;
const EVENT_PATTERN = /^event-(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;
const CONCEPT_PATTERN = /^SV-AI-[A-Z0-9]{6}$/i;
const SOURCE_PATTERN = /^(?:direct|referral|[a-z0-9][a-z0-9_-]{0,63})$/;
const HOST_PATTERN = /^(?:[a-z0-9](?:[a-z0-9-]{0,62})(?:\.[a-z0-9](?:[a-z0-9-]{0,62}))*)?$/i;
const SAFE_PATH_PATTERN = /^\/[a-z0-9/_-]*$/i;
const DEVICES = new Set(['mobile', 'tablet', 'desktop']);
const BROWSERS = new Set(['Safari', 'Chrome', 'Firefox', 'Edge', 'Opera', 'Other']);
const EXPERIMENTS = new Set(['builder', 'canvas', 'physics', 'modern-os', 'retro']);
const ALLOWED_KEYS = new Set(['event', 'visitorId', 'sessionId', 'eventId', 'path', 'source', 'referrerHost', 'deviceType', 'browser', 'experimentId', 'conceptId']);
const requestWindows = new Map();
const MAX_REQUESTS_PER_MINUTE = 40;
const MAX_GLOBAL_REQUESTS_PER_MINUTE = 600;
const MAX_TELEGRAM_NOTIFICATIONS_PER_HOUR = 120;
const MAX_HISTORY_EVENTS = 100;

const plainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);
const clean = (value, limit) => typeof value === 'string' ? value.trim().slice(0, limit) : '';

export function visitorRetentionDays(environment = process.env) {
  const configured = Number(environment.VISITOR_INTELLIGENCE_RETENTION_DAYS || 180);
  return Number.isFinite(configured) ? Math.min(365, Math.max(30, Math.round(configured))) : 180;
}

export function visitorTtlSeconds(environment = process.env) {
  return visitorRetentionDays(environment) * 86400;
}

export function telegramConfiguration(environment = process.env) {
  return {
    token: environment.TELEGRAM_BOT_TOKEN || environment.AI_LEADS_TELEGRAM_BOT_TOKEN || '',
    chatId: environment.TELEGRAM_CHAT_ID || environment.AI_LEADS_TELEGRAM_CHAT_ID || '',
  };
}

export function isTelegramConfigured(environment = process.env) {
  const config = telegramConfiguration(environment);
  return Boolean(config.token && config.chatId);
}

export function normalizePublicPath(value) {
  let path = clean(value, 120);
  if (!path.startsWith('/')) return null;
  path = path.split(/[?#]/, 1)[0].replace(/\/{2,}/g, '/');
  if (path.length > 1) path = path.replace(/\/$/, '');
  if (!SAFE_PATH_PATTERN.test(path) || path.startsWith('/api/') || path.startsWith('/assets/')) return null;
  if (/\.[a-z0-9]{2,8}$/i.test(path)) return null;
  return path;
}

function normalizeSource(value) {
  const source = clean(value, 64).toLowerCase();
  return SOURCE_PATTERN.test(source) ? source : 'direct';
}

function normalizeReferrerHost(value) {
  const host = clean(value, 180).toLowerCase();
  return HOST_PATTERN.test(host) ? host : '';
}

export function validateVisitorEvent(raw) {
  if (!plainObject(raw) || Object.keys(raw).some((key) => !ALLOWED_KEYS.has(key))) return { ok: false, error: 'Некорректные поля события.' };
  const event = clean(raw.event, 32);
  const visitorId = clean(raw.visitorId, 48);
  const sessionId = clean(raw.sessionId, 48);
  const eventId = clean(raw.eventId, 48);
  if (!VISITOR_EVENT_TYPES.includes(event) || !VISITOR_PATTERN.test(visitorId) || !SESSION_PATTERN.test(sessionId) || !EVENT_PATTERN.test(eventId)) {
    return { ok: false, error: 'Некорректное анонимное событие.' };
  }
  const path = normalizePublicPath(raw.path);
  if (!path) return { ok: false, error: 'Некорректный маршрут.' };

  const value = { event, visitorId, sessionId, eventId, path };
  if (event === 'session_start') {
    if (!DEVICES.has(raw.deviceType) || !BROWSERS.has(raw.browser)) return { ok: false, error: 'Некорректные технические данные.' };
    return { ok: true, value: { ...value, source: normalizeSource(raw.source), referrerHost: normalizeReferrerHost(raw.referrerHost), deviceType: raw.deviceType, browser: raw.browser } };
  }
  if (event === 'experiment_start') {
    if (!EXPERIMENTS.has(raw.experimentId)) return { ok: false, error: 'Неизвестный эксперимент.' };
    return { ok: true, value: { ...value, experimentId: raw.experimentId } };
  }
  if (event === 'ai_concept_created') {
    const conceptId = clean(raw.conceptId, 20);
    if (!CONCEPT_PATTERN.test(conceptId) || path !== '/ai-website') return { ok: false, error: 'Некорректная AI-концепция.' };
    return { ok: true, value: { ...value, conceptId } };
  }
  if (event === 'brief_completed' && path !== '/brief') return { ok: false, error: 'Некорректное событие Brief.' };
  return { ok: true, value };
}

function parseHash(result) {
  if (plainObject(result)) return Object.fromEntries(Object.entries(result).map(([key, value]) => [key, String(value)]));
  if (!Array.isArray(result)) return {};
  const output = {};
  for (let index = 0; index < result.length - 1; index += 2) output[String(result[index])] = String(result[index + 1]);
  return output;
}

function checkMemoryRate(sessionId, now) {
  const recent = (requestWindows.get(sessionId) || []).filter((stamp) => now - stamp < 60_000);
  if (recent.length >= MAX_REQUESTS_PER_MINUTE) return false;
  recent.push(now);
  requestWindows.set(sessionId, recent);
  if (requestWindows.size > 4000) requestWindows.clear();
  return true;
}

async function checkRedisRate(sessionId, now, options) {
  const key = `${VISITOR_NAMESPACE}:rate:${sessionId}`;
  const globalKey = `${VISITOR_NAMESPACE}:global-rate:${Math.floor(now / 60_000)}`;
  const result = await redisPipeline([['INCR', key], ['EXPIRE', key, '60'], ['INCR', globalKey], ['EXPIRE', globalKey, '120']], options);
  return Number(result[0]?.result || 0) <= MAX_REQUESTS_PER_MINUTE && Number(result[2]?.result || 0) <= MAX_GLOBAL_REQUESTS_PER_MINUTE;
}

function routeLabel(path) {
  if (path === '/') return 'Главная';
  if (path === '/mobile-apps' || path === '/prices/mobile-apps') return 'Приложения';
  if (path === '/prices' || path.startsWith('/prices/')) return 'Цены';
  if (path === '/ai-website') return 'AI-концепт';
  if (path === '/brief') return 'Бриф';
  if (path === '/lab') return 'LAB';
  if (path === '/lab/modern-os') return 'Modern OS';
  if (path.startsWith('/lab/')) return `LAB: ${path.slice(5)}`;
  if (path === '/contacts') return 'Контакты';
  return path;
}

const experimentLabels = Object.freeze({ builder: 'Конструктор', canvas: 'Бесконечный холст', physics: 'Physics Lab', 'modern-os': 'Modern OS', retro: 'Retro OS' });
const deviceLabels = Object.freeze({ mobile: 'Мобильное устройство', tablet: 'Планшет', desktop: 'Компьютер' });

function sourceLabel(source, referrerHost = '') {
  if (source.startsWith('telegram')) return 'Telegram';
  if (source !== 'direct') return source;
  return referrerHost ? `Переход: ${referrerHost}` : 'Прямой переход';
}

function vladivostokTime(iso) {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Vladivostok', dateStyle: 'short', timeStyle: 'medium' }).format(new Date(iso));
}

async function sendTelegram(text, { fetchImpl = fetch, environment = process.env } = {}) {
  const config = telegramConfiguration(environment);
  if (!config.token || !config.chatId) return { status: 'not-configured' };
  const response = await fetchImpl(`https://api.telegram.org/bot${encodeURIComponent(config.token)}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: config.chatId, text: text.slice(0, 3500), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return { status: 'failed' };
  const payload = await response.json().catch(() => ({}));
  return { status: 'sent', messageId: Number(payload?.result?.message_id) || null };
}

function visitorKeys(visitorId) {
  return {
    profile: `${VISITOR_NAMESPACE}:${visitorId}`,
    history: `${VISITOR_NAMESPACE}:${visitorId}:history`,
    pages: `${VISITOR_NAMESPACE}:${visitorId}:pages`,
    experiments: `${VISITOR_NAMESPACE}:${visitorId}:experiments`,
  };
}

function telegramTextForEvent(event, isNewVisitor, timestamp) {
  if (isNewVisitor && event.event === 'session_start') {
    return ['👤 Новый посетитель SITEVL', `ID: ${event.visitorId}`, `Устройство: ${deviceLabels[event.deviceType] || event.deviceType} · ${event.browser}`, `Источник: ${sourceLabel(event.source, event.referrerHost)}`, `Вход: ${routeLabel(event.path)}`, `Время: ${vladivostokTime(timestamp)}`].join('\n');
  }
  if (event.event === 'page_view' && (event.path === '/prices' || event.path.startsWith('/prices/'))) return `🔥 ${event.visitorId} смотрит цены`;
  if (event.event === 'page_view' && event.path === '/ai-website') return `✨ ${event.visitorId} открыл AI-концепт`;
  if (event.event === 'page_view' && event.path === '/lab') return `🔬 ${event.visitorId} открыл LAB`;
  if (event.event === 'experiment_start') return `🎮 ${event.visitorId} запустил ${experimentLabels[event.experimentId] || event.experimentId}`;
  if (event.event === 'ai_concept_created') return `✨ ${event.visitorId} создал AI-концепт ${event.conceptId}`;
  return '';
}

function notifyAction(event, isNewVisitor) {
  if (isNewVisitor && event.event === 'session_start') return 'new-visitor';
  if (event.event === 'page_view' && (event.path === '/prices' || event.path.startsWith('/prices/'))) return 'prices';
  if (event.event === 'page_view' && event.path === '/ai-website') return 'ai-website';
  if (event.event === 'page_view' && event.path === '/lab') return 'lab';
  if (event.event === 'experiment_start') return `experiment-${event.experimentId}`;
  if (event.event === 'ai_concept_created') return 'ai-concept-created';
  return '';
}

function profileFlagsForPath(path) {
  const fields = [];
  if (path === '/lab' || path.startsWith('/lab/')) fields.push('visitedLab', '1');
  if (path === '/prices' || path.startsWith('/prices/')) fields.push('viewedPrices', '1');
  if (path === '/mobile-apps' || path === '/prices/mobile-apps') fields.push('viewedMobileApps', '1');
  if (path === '/ai-website') fields.push('openedAiWebsite', '1');
  return fields;
}

export async function trackVisitorEvent(event, options = {}) {
  const nowMs = options.now?.() ?? Date.now();
  if (!checkMemoryRate(event.sessionId, nowMs)) return { accepted: false, rateLimited: true, deduplicated: false, notification: 'skipped' };
  if (!await checkRedisRate(event.sessionId, nowMs, options)) return { accepted: false, rateLimited: true, deduplicated: false, notification: 'skipped' };
  const timestamp = new Date(nowMs).toISOString();
  const ttl = visitorTtlSeconds(options.environment);
  const keys = visitorKeys(event.visitorId);
  const claim = await redisPipeline([
    ['SET', `${VISITOR_NAMESPACE}:event:${event.eventId}`, '1', 'NX', 'EX', String(ttl)],
    ['HSETNX', keys.profile, 'firstVisit', timestamp],
    ['SET', `${VISITOR_NAMESPACE}:session:${event.sessionId}`, event.visitorId, 'NX', 'EX', String(ttl)],
  ], options);
  if (claim[0]?.result !== 'OK') return { accepted: true, rateLimited: false, deduplicated: true, notification: 'skipped' };

  const isNewVisitor = Number(claim[1]?.result || 0) === 1;
  const isNewSession = claim[2]?.result === 'OK';
  const history = { event: event.event, at: timestamp, path: event.path };
  if (event.event === 'session_start') Object.assign(history, { source: event.source, referrerHost: event.referrerHost, deviceType: event.deviceType, browser: event.browser });
  if (event.experimentId) history.experimentId = event.experimentId;
  if (event.conceptId) history.conceptId = event.conceptId;
  const profileFields = ['lastVisit', timestamp, 'lastPage', event.path, ...profileFlagsForPath(event.path)];
  if (event.event === 'session_start') profileFields.push('deviceType', event.deviceType, 'browser', event.browser);
  if (event.event === 'ai_concept_created') profileFields.push('generatedAiConcept', '1', 'lastConceptId', event.conceptId);
  if (event.event === 'brief_completed') profileFields.push('briefCompleted', '1');
  const commands = [
    ['HSET', keys.profile, ...profileFields],
    ['SADD', keys.pages, event.path],
    ['RPUSH', keys.history, JSON.stringify(history)],
    ['LTRIM', keys.history, String(-MAX_HISTORY_EVENTS), '-1'],
    ['ZADD', `${VISITOR_NAMESPACE}:index`, String(nowMs), event.visitorId],
    ['ZREMRANGEBYRANK', `${VISITOR_NAMESPACE}:index`, '0', '-5001'],
    ['EXPIRE', keys.profile, String(ttl)],
    ['EXPIRE', keys.pages, String(ttl)],
    ['EXPIRE', keys.history, String(ttl)],
    ['EXPIRE', `${VISITOR_NAMESPACE}:index`, String(ttl)],
  ];
  if (isNewVisitor && event.event === 'session_start') commands[0] = ['HSET', keys.profile, ...profileFields, 'firstPage', event.path, 'firstSource', event.source, 'firstReferrerHost', event.referrerHost];
  if (isNewSession) commands.push(['HINCRBY', keys.profile, 'sessions', '1']);
  if (event.event === 'experiment_start') {
    commands.push(['SADD', keys.experiments, event.experimentId], ['EXPIRE', keys.experiments, String(ttl)]);
  }
  await redisPipeline(commands, options);

  let notification = 'skipped';
  const action = notifyAction(event, isNewVisitor);
  const text = telegramTextForEvent(event, isNewVisitor, timestamp);
  if (action && text) {
    const telegramRateKey = `${VISITOR_NAMESPACE}:telegram-rate:${Math.floor(nowMs / 3_600_000)}`;
    const notifyClaim = await redisPipeline([['SET', `${VISITOR_NAMESPACE}:notify:${event.visitorId}:${action}`, '1', 'NX', 'EX', String(ttl)]], options);
    if (notifyClaim[0]?.result === 'OK') {
      const telegramRate = await redisPipeline([['INCR', telegramRateKey], ['EXPIRE', telegramRateKey, '7200']], options);
      notification = Number(telegramRate[0]?.result || 0) <= MAX_TELEGRAM_NOTIFICATIONS_PER_HOUR ? (await sendTelegram(text, options)).status : 'rate-limited';
    }
  }
  return { accepted: true, rateLimited: false, deduplicated: false, notification };
}

export async function readVisitor(visitorId, options = {}) {
  if (!VISITOR_PATTERN.test(visitorId)) throw new Error('invalid visitor id');
  const keys = visitorKeys(visitorId);
  const result = await redisPipeline([['HGETALL', keys.profile], ['LRANGE', keys.history, '0', '-1'], ['SMEMBERS', keys.pages], ['SMEMBERS', keys.experiments]], options);
  const history = Array.isArray(result[1]?.result) ? result[1].result.map((item) => { try { return JSON.parse(item); } catch { return null; } }).filter(Boolean) : [];
  return { visitor: parseHash(result[0]?.result), history, pages: result[2]?.result || [], experiments: result[3]?.result || [] };
}

export function buildLeadTelegramSummary(lead, intelligence) {
  const visitor = intelligence?.visitor || {};
  const paths = Array.isArray(intelligence?.history) ? intelligence.history.map((item) => item?.path).filter(Boolean) : [];
  const uniquePathLabels = [];
  for (const path of paths) {
    const label = routeLabel(path);
    if (uniquePathLabels.at(-1) !== label) uniquePathLabels.push(label);
  }
  const firstVisitMs = Date.parse(visitor.firstVisit || '');
  const elapsedMs = Number.isFinite(firstVisitMs) ? Math.max(0, Date.parse(lead.createdAt) - firstVisitMs) : NaN;
  const elapsed = Number.isFinite(elapsedMs) ? (elapsedMs < 3_600_000 ? `${Math.max(1, Math.round(elapsedMs / 60_000))} мин` : `${Math.round(elapsedMs / 3_600_000)} ч`) : 'не определено';
  return [
    '🚀 Новый лид SITEVL', '',
    'Visitor:', lead.visitorId || 'не связан', '',
    'Имя:', lead.contact.name || 'не указано', '',
    'Телефон:', lead.contact.phone || lead.contact.whatsapp || 'не указан', '',
    'Telegram:', lead.contact.telegram || 'не указан', '',
    'Тип проекта:', lead.recommendedPackage || 'не определён', '',
    'Бюджет:', lead.budget || 'не указан', '',
    'AI Concept ID:', lead.conceptId, '',
    'До заявки:', uniquePathLabels.length ? uniquePathLabels.slice(-12).join(' → ') : 'история недоступна', '',
    'Сессий:', visitor.sessions || 'не определено', '',
    'Время до заявки:', elapsed,
  ].join('\n').slice(0, 3500);
}

export async function linkLeadToVisitor(lead, options = {}) {
  if (!VISITOR_PATTERN.test(lead.visitorId || '') || !SESSION_PATTERN.test(lead.visitorSessionId || '')) return { linked: false, notification: 'skipped', intelligence: null };
  const nowMs = Date.parse(lead.createdAt) || Date.now();
  const timestamp = new Date(nowMs).toISOString();
  const ttl = visitorTtlSeconds(options.environment);
  const keys = visitorKeys(lead.visitorId);
  await redisPipeline([
    ['HSET', keys.profile, 'lastVisit', timestamp, 'leadSubmitted', '1', 'leadId', lead.id, 'lastConceptId', lead.conceptId],
    ['RPUSH', keys.history, JSON.stringify({ event: 'lead_created', at: timestamp, path: '/ai-website', conceptId: lead.conceptId, leadId: lead.id })],
    ['LTRIM', keys.history, String(-MAX_HISTORY_EVENTS), '-1'],
    ['EXPIRE', keys.profile, String(ttl)],
    ['EXPIRE', keys.history, String(ttl)],
  ], options);
  const intelligence = await readVisitor(lead.visitorId, options);
  const notification = (await sendTelegram(buildLeadTelegramSummary(lead, intelligence), options)).status;
  return { linked: true, notification, intelligence };
}

export function authorizeOwnerRequest(headerValue, environment = process.env) {
  const expected = environment.VISITOR_OWNER_API_TOKEN || '';
  const provided = clean(headerValue, 300).replace(/^Bearer\s+/i, '');
  if (!expected || !provided) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function resetVisitorRateLimitsForTests() {
  requestWindows.clear();
}

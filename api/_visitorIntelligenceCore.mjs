import { timingSafeEqual } from 'node:crypto';
import { redisPipeline } from './_labStatsCore.mjs';
import { commitVisitorEvent, LINK_LEAD_SCRIPT, V2_NAMESPACE } from './_visitorStoreV2.mjs';

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
const DEVICE_FAMILIES = new Set(['iPhone', 'iPad', 'Android', 'Mac', 'Windows', 'Linux', 'Other']);
const BROWSERS = new Set(['Safari', 'Chrome', 'Firefox', 'Edge', 'Opera', 'Other']);
const EXPERIMENTS = new Set(['builder', 'canvas', 'physics', 'modern-os', 'retro']);
const ALLOWED_KEYS = new Set(['event', 'visitorId', 'sessionId', 'eventId', 'path', 'source', 'referrerHost', 'deviceType', 'deviceFamily', 'browser', 'experimentId', 'conceptId']);
const requestWindows = new Map();
const MAX_REQUESTS_PER_MINUTE = 40;
const MAX_GLOBAL_REQUESTS_PER_MINUTE = 600;
const MAX_TELEGRAM_NOTIFICATIONS_PER_HOUR = 120;

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
    if (raw.deviceFamily !== undefined && !DEVICE_FAMILIES.has(raw.deviceFamily)) return { ok: false, error: 'Некорректное семейство устройства.' };
    return { ok: true, value: { ...value, source: normalizeSource(raw.source), referrerHost: normalizeReferrerHost(raw.referrerHost), deviceType: raw.deviceType, deviceFamily: raw.deviceFamily || 'Other', browser: raw.browser } };
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
  const commands = [['INCR', key], ['EXPIRE', key, '60'], ['INCR', globalKey], ['EXPIRE', globalKey, '120']];
  // A generous, short-lived network limit supplements IDs; it never merges visitors behind NAT.
  if (/^[a-f0-9]{64}$/.test(options.networkHash || '')) {
    const networkKey = `${V2_NAMESPACE}:network-rate:${options.networkHash}:${Math.floor(now / 60_000)}`;
    commands.push(['INCR', networkKey], ['EXPIRE', networkKey, '120']);
  }
  const result = await redisPipeline(commands, options);
  return Number(result[0]?.result || 0) <= MAX_REQUESTS_PER_MINUTE && Number(result[2]?.result || 0) <= MAX_GLOBAL_REQUESTS_PER_MINUTE && (!result[4] || Number(result[4].result) <= 240);
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

export function sourceLabel(source = 'direct', referrerHost = '') {
  if (source.startsWith('telegram')) return 'Telegram';
  if (source.startsWith('vk')) return 'ВКонтакте';
  if (source === 'referral') return referrerHost ? `Переход: ${referrerHost}` : 'Внешний переход';
  if (source !== 'direct') return source;
  return referrerHost ? `Переход: ${referrerHost}` : 'Прямой переход';
}

function vladivostokTime(iso) {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Vladivostok', dateStyle: 'short', timeStyle: 'medium' }).format(new Date(iso));
}

async function sendTelegram(text, { fetchImpl = fetch, environment = process.env } = {}) {
  const config = telegramConfiguration(environment);
  if (!config.token || !config.chatId) return { status: 'not-configured' };
  try {
  const response = await fetchImpl(`https://api.telegram.org/bot${encodeURIComponent(config.token)}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: config.chatId, text: text.slice(0, 3500), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) return { status: 'failed' };
  const payload = await response.json().catch(() => ({}));
  return { status: payload.ok === true ? 'sent' : 'failed', messageId: Number(payload?.result?.message_id) || null };
  } catch { return { status: 'failed' }; }
}

function visitorKeys(visitorId) {
  return {
    profile: `${VISITOR_NAMESPACE}:${visitorId}`,
    history: `${VISITOR_NAMESPACE}:${visitorId}:history`,
    pages: `${VISITOR_NAMESPACE}:${visitorId}:pages`,
    experiments: `${VISITOR_NAMESPACE}:${visitorId}:experiments`,
  };
}

export function elapsedLabel(milliseconds) {
  if (!Number.isFinite(milliseconds)) return 'не определено';
  const minutes = Math.max(0, Math.floor(milliseconds / 60_000));
  if (minutes < 1) return 'менее минуты';
  if (minutes < 60) return `${minutes} мин`;
  const hours = Math.floor(minutes / 60);
  return hours < 24 ? `${hours} ч ${minutes % 60} мин` : `${Math.floor(hours / 24)} дн ${hours % 24} ч`;
}

export function telegramTextForEvent(event, context, timestamp) {
  const who = `Посетитель #${context.visitorNumber}`;
  if (event.event === 'session_start' && context.newSession) {
    const lines = [context.isNewVisitor ? '👤 Новый посетитель SITEVL' : '🔁 Посетитель вернулся на SITEVL',
      `Посещение сайта: #${context.visitNumber}`, `Уникальный посетитель: #${context.visitorNumber}`,
      `Сессия посетителя: #${context.sessionNumber}`,
      `Устройство: ${event.deviceFamily !== 'Other' && event.deviceFamily ? event.deviceFamily : deviceLabels[event.deviceType]} · ${event.browser}`,
      `Источник: ${sourceLabel(context.currentSource, context.currentReferrerHost)}`,
      `Рекламная метка: ${!['direct', 'referral'].includes(context.currentSource) ? context.currentSource : 'нет'}`,
      `Вход: ${routeLabel(event.path)}`, `Время: ${vladivostokTime(timestamp)} (Владивосток)`];
    if (context.isNewVisitor) lines.push('Первый визит.');
    else {
      lines.push(`Первый визит: ${vladivostokTime(context.firstVisit)}`,
        `Предыдущий визит: ${context.previousVisit ? vladivostokTime(context.previousVisit) : 'нет данных'}`,
        `Вернулся через: ${elapsedLabel(Date.parse(timestamp) - Date.parse(context.previousVisit))}`,
        `Первый источник: ${sourceLabel(context.firstSource, context.firstReferrerHost)}`,
        `Текущий источник: ${sourceLabel(context.currentSource, context.currentReferrerHost)}`,
        `Ранее в сохранённой статистике: страниц ${context.prior.pages}, запусков LAB ${context.prior.experiments}, AI-концептов ${context.prior.concepts}, заявок ${context.prior.leads}`);
    }
    if (context.networkState) lines.push(`IP-assist: ${context.networkState === 'same' ? 'сеть не изменилась' : 'новая сеть'} (вспомогательный признак)`);
    return lines.join('\n');
  }
  const suffix = `\nПосещение сайта: #${context.visitNumber} · Сессия: #${context.sessionNumber}`;
  if (event.event === 'page_view' && (event.path === '/prices' || event.path.startsWith('/prices/'))) return `🔥 ${who} смотрит цены${suffix}`;
  if (event.event === 'page_view' && event.path === '/ai-website') return `✨ ${who} открыл AI-концепт${suffix}`;
  if (event.event === 'page_view' && event.path === '/lab') return `🔬 ${who} открыл LAB${suffix}`;
  if (event.event === 'experiment_start') return `🎮 ${who} запустил ${experimentLabels[event.experimentId] || event.experimentId}${suffix}`;
  if (event.event === 'ai_concept_created') return `✨ ${who} создал AI-концепт ${event.conceptId}${suffix}`;
  return '';
}

function notifyAction(event, context) {
  if (context.newSession && event.event === 'session_start') return 'session-start';
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
  const validated = validateVisitorEvent(event);
  if (!validated.ok) throw new Error('invalid visitor event');
  event = validated.value;
  const nowMs = options.now?.() ?? Date.now();
  if (!checkMemoryRate(event.sessionId, nowMs)) return { accepted: false, rateLimited: true, deduplicated: false, notification: 'skipped' };
  if (!await checkRedisRate(event.sessionId, nowMs, options)) return { accepted: false, rateLimited: true, deduplicated: false, notification: 'skipped' };
  const timestamp = new Date(nowMs).toISOString();
  const ttl = visitorTtlSeconds(options.environment);
  const committed = await commitVisitorEvent(event, profileFlagsForPath(event.path), ttl, nowMs, options);
  if (committed.conflict || committed.sessionRequired) return { accepted: false, conflict: true, notification: 'skipped' };
  if (committed.deduplicated) return { accepted: true, rateLimited: false, deduplicated: true, notification: 'skipped' };
  const context = committed.context;

  let notification = 'skipped';
  const action = notifyAction(event, context);
  const text = telegramTextForEvent(event, context, timestamp);
  if (action && text) {
    const telegramRateKey = `${VISITOR_NAMESPACE}:telegram-rate:${Math.floor(nowMs / 3_600_000)}`;
    const notifyClaim = await redisPipeline([['SET', `${V2_NAMESPACE}:notify:${event.sessionId}:${action}`, '1', 'NX', 'EX', String(ttl)]], options);
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
  const visitor = parseHash(result[0]?.result);
  let session = {};
  const sessionId = options.sessionId || visitor.lastSessionId;
  if (SESSION_PATTERN.test(sessionId || '')) {
    const response = await redisPipeline([['HGETALL', `${V2_NAMESPACE}:session:${sessionId}`]], options);
    const candidate = parseHash(response[0]?.result);
    if (candidate.visitorId === visitorId) session = candidate;
  }
  return { visitor, session, history, pages: result[2]?.result || [], experiments: result[3]?.result || [] };
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
  const session = intelligence?.session || {};
  return [
    '💼 Новая заявка SITEVL', '',
    `Посетитель: ${visitor.visitorNumber ? `#${visitor.visitorNumber}` : 'не связан'}`,
    `Посещение сайта: ${session.visitNumber ? `#${session.visitNumber}` : 'не определено'}`,
    `Сессия посетителя: ${session.sessionNumber ? `#${session.sessionNumber}` : 'не определено'}`,
    `Первый визит: ${visitor.firstVisit ? vladivostokTime(visitor.firstVisit) : 'не определено'}`,
    `Первый источник: ${sourceLabel(visitor.firstSource, visitor.firstReferrerHost)}`,
    `Текущий источник: ${sourceLabel(session.source, session.referrerHost)}`,
    `Рекламная метка: ${session.source && !['direct', 'referral'].includes(session.source) ? session.source : 'нет'}`, '',
    'Имя:', lead.contact.name || 'не указано', '',
    'Телефон:', lead.contact.phone || lead.contact.whatsapp || 'не указан', '',
    'Telegram:', lead.contact.telegram || 'не указан', '',
    'Email:', lead.contact.email || 'не указан', '',
    'Тип проекта:', lead.recommendedPackage || 'не определён', '',
    'Бюджет:', lead.budget || 'не указан', '',
    'AI Concept ID:', lead.conceptId, '',
    'До заявки:', uniquePathLabels.length ? uniquePathLabels.slice(-12).join(' → ') : 'история недоступна', '',
    'Сессий:', visitor.sessions || 'не определено', '',
    'Время до заявки:', elapsedLabel(elapsedMs),
    `Время заявки: ${vladivostokTime(lead.createdAt)} (Владивосток)`,
  ].join('\n').slice(0, 3500);
}

export async function linkLeadToVisitor(lead, options = {}) {
  if (!VISITOR_PATTERN.test(lead.visitorId || '') || !SESSION_PATTERN.test(lead.visitorSessionId || '')) return { linked: false, notification: 'skipped', intelligence: null };
  const nowMs = Date.parse(lead.createdAt) || Date.now();
  const timestamp = new Date(nowMs).toISOString();
  const ttl = visitorTtlSeconds(options.environment);
  const keys = visitorKeys(lead.visitorId);
  if (!/^[a-f0-9-]{36}$/i.test(lead.id || '') || !CONCEPT_PATTERN.test(lead.conceptId || '')) return { linked: false, notification: 'skipped', intelligence: null };
  const result = await redisPipeline([['EVAL', LINK_LEAD_SCRIPT, '4', keys.profile, `${V2_NAMESPACE}:session:${lead.visitorSessionId}`, `${V2_NAMESPACE}:lead:${lead.id}`, keys.history, lead.visitorId, timestamp, lead.id, lead.conceptId, String(ttl)]], options);
  if (!Number(result[0]?.result)) return { linked: false, notification: 'skipped', intelligence: null };
  const intelligence = await readVisitor(lead.visitorId, { ...options, sessionId: lead.visitorSessionId });
  const notification = Number(result[0]?.result) === 1 ? (await sendTelegram(buildLeadTelegramSummary(lead, intelligence), options)).status : 'skipped';
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

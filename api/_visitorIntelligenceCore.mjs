import { timingSafeEqual } from 'node:crypto';
import { redisPipeline } from './_labStatsCore.mjs';
import { commitVisitorEvent, LINK_LEAD_SCRIPT, V2_NAMESPACE } from './_visitorStoreV2.mjs';
import { recordBotVisit } from './_visitorStoreV3.mjs';
import { V31_NAMESPACE, V31_STATS_KEY, INTEREST_WEIGHTS } from './_visitorConfidenceV31.mjs';
import { isAutomatedTraffic, geoLabel } from './_trafficPolicyV3.mjs';

export const VISITOR_NAMESPACE = 'sitevl:visitor:v1';
export const VISITOR_EVENT_TYPES = Object.freeze([
  'session_start',
  'page_view',
  'experiment_start',
  'ai_concept_created',
  'brief_completed',
  'brief_started',
  'contact_click',
  'engagement',
  'behavior',
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
const ALLOWED_KEYS = new Set(['event', 'visitorId', 'sessionId', 'eventId', 'path', 'source', 'referrerHost', 'deviceType', 'deviceFamily', 'browser', 'experimentId', 'conceptId', 'channel', 'signal', 'behavior']);
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
  if (!SAFE_PATH_PATTERN.test(path) || /^\/(?:api|assets|admin|studio)(?:\/|$)/.test(path)) return null;
  if (/\.[a-z0-9]{2,8}$/i.test(path)) return null;
  return path;
}

function normalizeSource(value) {
  const source = clean(value, 64).toLowerCase();
  // Reserved source is assigned only from the server-verified attribution token.
  return source !== 'paid-ad' && SOURCE_PATTERN.test(source) ? source : 'direct';
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
  if (event !== 'behavior' && raw.behavior !== undefined) return { ok: false, error: 'Некорректное поле активности.' };
  if (event === 'behavior') {
    const b = raw.behavior;
    const kinds = ['pointer', 'touch', 'keyboard', 'link', 'form'];
    if (!plainObject(b) || Object.keys(b).some(key => !['dwell', 'scroll', ...kinds].includes(key)) ||
      !Number.isInteger(b.dwell) || b.dwell < 0 || b.dwell > 4 || !Number.isInteger(b.scroll) || b.scroll < 0 || b.scroll > 4 ||
      kinds.some(key => typeof b[key] !== 'boolean')) return { ok: false, error: 'Некорректные агрегаты активности.' };
    return { ok: true, value: { ...value, behavior: { dwell: b.dwell, scroll: b.scroll, ...Object.fromEntries(kinds.map(key => [key, b[key]])) } } };
  }
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
  if (event === 'brief_started' && path !== '/brief') return { ok: false, error: 'Некорректное событие Brief.' };
  if (event === 'contact_click') {
    if (!['telegram', 'whatsapp'].includes(raw.channel)) return { ok: false, error: 'Неизвестный канал связи.' };
    return { ok: true, value: { ...value, channel: raw.channel } };
  }
  if (event === 'engagement') {
    if (!['visible-reader', 'interaction'].includes(raw.signal)) return { ok: false, error: 'Некорректный сигнал активности.' };
    return { ok: true, value: { ...value, signal: raw.signal } };
  }
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
  const key = `${VISITOR_NAMESPACE}:rate:${sessionId}:${Math.floor(now / 60_000)}`;
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
  if (path === '/services') return 'Услуги';
  if (path === '/cases' || path.startsWith('/cases/')) return 'Кейсы';
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
  if (source === 'paid-ad') return 'Оплаченная реклама';
  if (source.startsWith('telegram')) return 'Telegram';
  if (source.startsWith('vk')) return 'ВКонтакте';
  if (source === 'referral') return referrerHost ? `Переход: ${referrerHost}` : 'Внешний переход';
  if (source !== 'direct') return source;
  return referrerHost ? `Переход: ${referrerHost}` : 'Прямой переход';
}

function vladivostokTime(iso) {
  return new Intl.DateTimeFormat('ru-RU', { timeZone: 'Asia/Vladivostok', dateStyle: 'short', timeStyle: 'medium' }).format(new Date(iso));
}

export async function sendTelegram(text, { fetchImpl = fetch, environment = process.env } = {}) {
  const config = telegramConfiguration(environment);
  if (!config.token || !config.chatId) return { status: 'not-configured' };
  const safeDescription = value => String(value || '').split(config.token).join('[redacted]')
    .split(config.chatId).join('[redacted]').replace(/https?:\/\/\S+/g, '[url]').slice(0, 300);
  try {
  const response = await fetchImpl(`https://api.telegram.org/bot${encodeURIComponent(config.token)}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: config.chatId, text: text.slice(0, 3500), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10000),
  });
  const payload = await response.json().catch(() => null);
  const sent = response.ok && payload?.ok === true;
  // Server-only diagnostics, never the request URL, credentials or response.result.
  return { status: sent ? 'sent' : 'failed', messageId: sent ? Number(payload?.result?.message_id) || null : null,
    diagnostic: { httpStatus: response.status, ok: payload?.ok === true,
      error_code: Number.isInteger(payload?.error_code) ? payload.error_code : null,
      description: safeDescription(payload?.description),
      failureType: sent ? null : !payload || typeof payload.ok !== 'boolean' ? 'malformed-response' : response.status === 429 ? 'rate-limit' : 'telegram-api' } };
  } catch (error) {
    // No automatic resend after ambiguous delivery: sendMessage has no idempotency key.
    return { status: 'failed', diagnostic: { httpStatus: null, ok: false, error_code: null, description: '',
      failureType: ['TimeoutError', 'AbortError'].includes(error?.name) ? 'timeout' : 'network' } };
  }
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
  const attribution = parseMetadata(context.attribution);
  if (context.burstNotify) return ['⚙️ Пачка похожих визитов SITEVL',
    `Не менее ${context.burstSize} новых анонимных ID за 10 секунд.`,
    'Совпали несколько укрупнённых признаков. Это сигнал, не доказательство автоматизации.',
    'Не считаются людьми без дополнительных поведенческих признаков. Рекламные визиты не объединяются.',
    'Повторное сообщение этой группы — не чаще раза в 30 минут.',
    `Время: ${vladivostokTime(timestamp)} (Владивосток)`].join('\n');
  const confidence = context.classification === 'human' ? 'высокая, эвристическая' : context.classification === 'likely-human' ? 'средняя, эвристическая' : context.classification === 'likely-bot' ? 'низкая; вероятна автоматизация' : 'недостаточно данных';
  if (context.humanTransition || context.interestTransition) return [
    context.interestTransition === 'hot' ? `🔥 Горячий посетитель #${context.visitorNumber}` : context.interestTransition === 'warm' ? `♨️ Тёплый посетитель #${context.visitorNumber}` : `👤 Вероятный человек — посетитель #${context.visitorNumber}`,
    `Визит: #${context.visitNumber} · Сессия: #${context.sessionNumber}`,
    `Источник: ${sourceLabel(context.currentSource, context.currentReferrerHost)}`,
    ...attributionLines(attribution), geoLabel(parseMetadata(context.geo)),
    `Устройство: ${context.deviceFamily} · ${context.browser}`,
    `Human confidence: ${confidence}. Не статистическая вероятность.`,
    ...(context.humanTransition ? ['Порог поведенческих признаков достигнут впервые в этой сессии.'] : []),
    `Коммерческий интерес: ${context.interestScore}/100 (баллы действий, не вероятность покупки).`,
    `Путь: ${context.journey || routeLabel(event.path)}`,
    context.hasLead ? 'В сохранённой истории есть заявка.' : 'Заявка в этой истории пока не отправлена.',
    `Время: ${vladivostokTime(timestamp)} (Владивосток)`].join('\n');
  if (context.newSession && context.initialNotify) {
    const lines = [context.isNewVisitor ? '❔ Новый визит SITEVL' : '❔ Повторный визит SITEVL',
      `Посещение сайта: #${context.visitNumber}`, `Анонимный посетитель: #${context.visitorNumber}`,
      `Сессия посетителя: #${context.sessionNumber}`,
      `Устройство: ${context.deviceFamily || deviceLabels[event.deviceType]} · ${context.browser}`,
      `Источник: ${sourceLabel(context.currentSource, context.currentReferrerHost)}`,
      `Рекламная метка: ${!['direct', 'referral'].includes(context.currentSource) ? context.currentSource : 'нет'}`,
      `Вход: ${routeLabel(event.path)}`, `Время: ${vladivostokTime(timestamp)} (Владивосток)`];
    lines.push(geoLabel(parseMetadata(context.geo)), `Human confidence: ${confidence}. Номер ID не является счётчиком людей.`);
    lines.push(...attributionLines(attribution));
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
  if (context.newSession) return '';
  if (context.adArrived && attribution?.paid) return ['📣 Рекламный источник визита', `Посещение сайта: #${context.visitNumber}`, `Анонимный посетитель: #${context.visitorNumber}`, `Сессия: #${context.sessionNumber}`, ...attributionLines(attribution), `Human confidence: ${confidence}`, `Финальная страница: ${routeLabel(event.path)}`, geoLabel(parseMetadata(context.geo)), `Время: ${vladivostokTime(timestamp)} (Владивосток)`].join('\n');
  if (context.classification === 'likely-bot') return '';
  const suffix = `\nПосещение сайта: #${context.visitNumber} · Сессия: #${context.sessionNumber}\nИсточник: ${sourceLabel(context.currentSource, context.currentReferrerHost)}\nHuman confidence: ${confidence}`;
  if (event.event === 'page_view' && (event.path === '/prices' || event.path.startsWith('/prices/'))) return `🔥 ${who} смотрит цены${suffix}`;
  if (event.event === 'page_view' && event.path === '/ai-website') return `✨ ${who} открыл AI-концепт${suffix}`;
  if (event.event === 'page_view' && event.path === '/lab') return `🔬 ${who} открыл LAB${suffix}`;
  if (event.event === 'experiment_start') return `🎮 ${who} запустил ${experimentLabels[event.experimentId] || event.experimentId}${suffix}`;
  if (event.event === 'ai_concept_created') return `✨ ${who} создал AI-концепт ${event.conceptId}${suffix}`;
  if (event.event === 'page_view' && event.path === '/contacts') return `☎️ ${who} открыл контакты${suffix}`;
  if (event.event === 'contact_click') return `💬 ${who} нажал ${event.channel === 'telegram' ? 'Telegram' : 'WhatsApp'}${suffix}`;
  if (event.event === 'brief_started') return `📝 ${who} начал бриф${suffix}`;
  if (event.event === 'brief_completed') return `📝 ${who} заполнил бриф${suffix}`;
  return '';
}

function notifyAction(event, context) {
  if (context.burstNotify) return 'burst';
  if (context.interestTransition) return `interest-${context.interestTransition}`;
  if (context.humanTransition) return 'human-transition';
  if (context.newSession) return context.initialNotify ? 'session-start' : '';
  if (context.adArrived) return 'ad-visit';
  if (event.event === 'page_view' && (event.path === '/prices' || event.path.startsWith('/prices/'))) return 'prices';
  if (event.event === 'page_view' && event.path === '/ai-website') return 'ai-website';
  if (event.event === 'page_view' && event.path === '/lab') return 'lab';
  if (event.event === 'experiment_start') return `experiment-${event.experimentId}`;
  if (event.event === 'ai_concept_created') return 'ai-concept-created';
  if (event.event === 'page_view' && event.path === '/contacts') return 'contacts';
  if (event.event === 'contact_click') return `contact-${event.channel}`;
  if (event.event === 'brief_started' || event.event === 'brief_completed') return event.event;
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
  if (isAutomatedTraffic(options.traffic)) {
    const bot = await trackCrawlerVisit(event.path, options.traffic, options);
    return { accepted: true, deduplicated: bot.deduplicated, notification: bot.notification, ignored: 'automated-traffic' };
  }
  if (event.event === 'session_start' && options.browser) event = { ...event, ...options.browser };
  if (event.event === 'session_start' && options.attribution) {
    event = { ...event, source: options.attribution.source, referrerHost: options.attribution.referrerHost || '' };
  }
  const nowMs = options.now?.() ?? Date.now();
  if (!checkMemoryRate(event.sessionId, nowMs)) return { accepted: false, rateLimited: true, deduplicated: false, notification: 'skipped' };
  if (!await checkRedisRate(event.sessionId, nowMs, options)) return { accepted: false, rateLimited: true, deduplicated: false, notification: 'skipped' };
  const timestamp = new Date(nowMs).toISOString();
  const ttl = visitorTtlSeconds(options.environment);
  const committed = await commitVisitorEvent(event, profileFlagsForPath(event.path), ttl, nowMs, options);
  if (committed.conflict || committed.sessionRequired) return { accepted: false, conflict: true, notification: 'skipped' };
  if (committed.deduplicated) return { accepted: true, rateLimited: false, deduplicated: true, notification: 'skipped' };
  const context = committed.context;
  if (context.humanTransition || context.interestTransition) {
    const state = await readVisitor(event.visitorId, { ...options, sessionId: event.sessionId });
    const labels = state.history.filter(item => item.event === 'page_view').map(item => routeLabel(item.path));
    context.journey = labels.filter((label, i) => i === 0 || label !== labels[i - 1]).slice(-8).join(' → ');
    context.hasLead = Number(state.visitor.leads) > 0;
  }

  let notification = 'skipped';
  const action = notifyAction(event, context);
  const text = telegramTextForEvent(event, context, timestamp);
  if (action && text) {
    const telegramRateKey = `${VISITOR_NAMESPACE}:telegram-rate:${Math.floor(nowMs / 3_600_000)}`;
    const notifyClaim = await redisPipeline([['SET', `${V31_NAMESPACE}:notify:${context.visitNumber}:${action}`, '1', 'NX', 'EX', String(ttl)]], options);
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
    if (candidate.visitorId === visitorId) {
      session = candidate;
      if (/^sitevl:visitor:v31:session:\d+$/.test(candidate.v31AnalyticsKey || '')) {
        const active = await redisPipeline([['HGETALL', candidate.v31AnalyticsKey]], options);
        const resolved = parseHash(active[0]?.result);
        if (resolved.visitorId === visitorId) session = { ...resolved, technicalSessionId: sessionId };
      }
    }
  }
  for (const record of [visitor, session]) {
    delete record.cohortKey;
    delete record.networkCohortKey;
    if (!record.classificationScore && Object.keys(record).length) {
      record.classification = 'legacy-unknown'; record.classificationReasons = '["legacy-no-score"]';
    }
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
    ...attributionLines(parseMetadata(session.attribution)), geoLabel(parseMetadata(session.geo)), '',
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
  if (isAutomatedTraffic(options.traffic)) return { linked: false, notification: 'skipped', intelligence: null };
  if (!VISITOR_PATTERN.test(lead.visitorId || '') || !SESSION_PATTERN.test(lead.visitorSessionId || '')) return { linked: false, notification: 'skipped', intelligence: null };
  const nowMs = Date.parse(lead.createdAt) || Date.now();
  const timestamp = new Date(nowMs).toISOString();
  const ttl = visitorTtlSeconds(options.environment);
  const keys = visitorKeys(lead.visitorId);
  const templateLead = lead.source === 'template-catalog' && /^SV-TPL-[A-F0-9]{8}$/.test(lead.conceptId || '');
  if (!/^[a-f0-9-]{36}$/i.test(lead.id || '') || !(templateLead || CONCEPT_PATTERN.test(lead.conceptId || ''))) return { linked: false, notification: 'skipped', intelligence: null };
  const leadPath = templateLead && /^\/templates\/[a-z-]+$/.test(options.leadPath || '') ? options.leadPath : '/ai-website';
  const result = await redisPipeline([['EVAL', LINK_LEAD_SCRIPT, '5', keys.profile, `${V2_NAMESPACE}:session:${lead.visitorSessionId}`, `${V2_NAMESPACE}:lead:${lead.id}`, keys.history, V31_STATS_KEY, lead.visitorId, timestamp, lead.id, lead.conceptId, String(ttl), String(INTEREST_WEIGHTS.lead_created), leadPath]], options);
  if (!Number(result[0]?.result)) return { linked: false, notification: 'skipped', intelligence: null };
  const intelligence = await readVisitor(lead.visitorId, { ...options, sessionId: lead.visitorSessionId });
  const notification = Number(result[0]?.result) === 1 && options.notify !== false ? (await sendTelegram(buildLeadTelegramSummary(lead, intelligence), options)).status : 'skipped';
  return { linked: true, notification, intelligence };
}

export function authorizeOwnerRequest(headerValue, environment = process.env) {
  const expected = environment.VISITOR_OWNER_API_TOKEN || '';
  if (typeof headerValue !== 'string' || !/^Bearer\s+\S+$/i.test(headerValue) || headerValue.length > 307) return false;
  const provided = headerValue.replace(/^Bearer\s+/i, '');
  if (!expected || !provided) return false;
  const left = Buffer.from(expected);
  const right = Buffer.from(provided);
  return left.length === right.length && timingSafeEqual(left, right);
}

export function resetVisitorRateLimitsForTests() {
  requestWindows.clear();
}

function parseMetadata(raw) {
  if (plainObject(raw)) return raw;
  try { return raw ? JSON.parse(raw) : null; } catch { return null; }
}

function attributionLines(attribution) {
  if (!attribution) return [];
  return [`Источник перехода: ${sourceLabel(attribution.source)}`,
    `Кампания: ${attribution.paid ? 'Telegram Владивосток — старая ссылка' : attribution.campaign || 'не указана'}`,
    `Вход через: ${attribution.entryHost}`,
    ...(attribution.attributionBasis === 'assumed-old-host' ? ['Атрибуция: предположение по старому рекламному домену, не подтверждённый рекламный клик.'] : [])];
}

export function botTelegramText(record) {
  const verified = record.verification === 'verified-dns';
  const title = record.family === 'Google-InspectionTool' && verified ? '🤖 Google проверяет SITEVL' : '🤖 Робот посетил SITEVL';
  return [title, `Тип: ${record.family}`, `Страница: ${record.path}`,
    `Классификация: ${verified ? 'проверенный робот Google' : 'вероятно робот; User-Agent не подтверждён'}`,
    `Проверка: ${record.verification}`, 'В статистику людей и рекламы не включён.',
    'Повторные уведомления этого семейства: не чаще одного за 30 минут.',
    `Время: ${vladivostokTime(record.at)} (Владивосток)`].join('\n');
}

export async function trackCrawlerVisit(path, traffic, options = {}) {
  const normalized = normalizePublicPath(path);
  if (!normalized || !isAutomatedTraffic(traffic)) return { deduplicated: true, notification: 'skipped' };
  const result = await recordBotVisit(normalized, traffic, options);
  let notification = 'skipped';
  if (result.notify) {
    const now = options.now?.() ?? Date.now();
    const key = `${VISITOR_NAMESPACE}:telegram-rate:${Math.floor(now / 3600000)}`;
    const rate = await redisPipeline([['INCR', key], ['EXPIRE', key, '7200']], options);
    notification = Number(rate[0]?.result) <= MAX_TELEGRAM_NOTIFICATIONS_PER_HOUR ? (await sendTelegram(botTelegramText(result.record), options)).status : 'rate-limited';
  }
  return { deduplicated: Boolean(result.deduplicated), notification };
}

import { createLeadSummary, sanitizeAiWebsiteLead } from './_aiLeadValidation.mjs';
import { isTelegramConfigured, linkLeadToVisitor, telegramConfiguration } from './_visitorIntelligenceCore.mjs';

const submissionWindows = new Map();

const redisConfiguration = () => ({
  url: process.env.AI_LEADS_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.AI_LEADS_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(payload));
};

const configuration = () => ({
  storageConfigured: Boolean(redisConfiguration().url && redisConfiguration().token),
  telegramConfigured: isTelegramConfigured(),
});

const checkRate = async (sessionId) => {
  const now = Date.now();
  const recent = (submissionWindows.get(sessionId) || []).filter((stamp) => now - stamp < 30 * 60 * 1000);
  if (recent.length >= 5) return false;
  if (configuration().storageConfigured) {
    try {
      const redis = redisConfiguration();
      const base = redis.url.replace(/\/$/, '');
      const rateResponse = await fetch(`${base}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${redis.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCR', `sitevl:ai-lead-rate:${sessionId}`], ['EXPIRE', `sitevl:ai-lead-rate:${sessionId}`, '1800']]),
        signal: AbortSignal.timeout(5000),
      });
      const result = await rateResponse.json();
      if (!rateResponse.ok || !Array.isArray(result) || result.some((entry) => entry?.error)) return false;
      if (Number(result[0]?.result) > 5) return false;
    } catch { return false; }
  }
  recent.push(now);
  submissionWindows.set(sessionId, recent);
  if (submissionWindows.size > 2000) submissionWindows.clear();
  return true;
};

async function persistLead(lead) {
  const redis = redisConfiguration();
  const base = redis.url.replace(/\/$/, '');
  const token = redis.token;
  const configuredDays = Number(process.env.AI_LEADS_RETENTION_DAYS || 90);
  const retentionDays = Number.isFinite(configuredDays) ? Math.min(365, Math.max(7, Math.round(configuredDays))) : 90;
  const ttl = retentionDays * 86400;
  const key = `sitevl:ai-lead:${lead.id}`;
  const index = 'sitevl:ai-leads:index';
  const response = await fetch(`${base}/pipeline`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify([
      ['SET', key, JSON.stringify(lead), 'EX', String(ttl)],
      ['LPUSH', index, lead.id],
      ['LTRIM', index, '0', '999'],
      ['EXPIRE', index, String(ttl)],
    ]),
    signal: AbortSignal.timeout(10000),
  });
  if (!response.ok) throw new Error(`storage ${response.status}`);
  const result = await response.json();
  if (!Array.isArray(result) || result.some((entry) => entry?.error)) throw new Error('storage pipeline failed');
  return retentionDays;
}

async function notifyTelegram(lead) {
  const { token, chatId } = telegramConfiguration();
  if (!token || !chatId) return 'not-configured';
  const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, text: createLeadSummary(lead), disable_web_page_preview: true }),
    signal: AbortSignal.timeout(10000),
  });
  return response.ok ? 'sent' : 'failed';
}

export default async function handler(request, response) {
  if (request.method === 'GET') return json(response, 200, { configured: configuration().storageConfigured, storage: 'private-redis', telegramConfigured: configuration().telegramConfigured });
  if (request.method !== 'POST') return json(response, 405, { error: 'Метод не поддерживается.' });
  const rawSize = Number(request.headers?.['content-length'] || 0);
  if (rawSize > 80000) return json(response, 413, { error: 'Заявка превышает допустимый размер.' });

  const validated = sanitizeAiWebsiteLead(request.body);
  if (!validated.ok) return json(response, 400, { error: validated.error });
  if (request.body?.testMode === 'validate') return json(response, 200, { valid: true, stored: false, testMode: true });
  if (!await checkRate(validated.value.sessionId)) return json(response, 429, { error: 'Слишком много попыток отправки. Попробуйте позже.' });
  if (!configuration().storageConfigured) return json(response, 503, { error: 'Серверное хранилище заявок пока не подключено. Результат сохранён в браузере; свяжитесь с нами удобным способом.' });

  const lead = { ...validated.value, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
  try {
    const retentionDays = await persistLead(lead);
    let linked = false;
    let notification = 'failed';
    try {
      const visitorResult = await linkLeadToVisitor(lead);
      linked = visitorResult.linked;
      notification = linked ? visitorResult.notification : await notifyTelegram(lead);
    } catch {
      notification = 'failed';
    }
    return json(response, 201, { stored: true, reference: validated.value.conceptId, retentionDays, linked, notification });
  } catch {
    return json(response, 502, { error: 'Не удалось надёжно сохранить заявку. Результат остался в браузере — попробуйте ещё раз или свяжитесь напрямую.' });
  }
}

import { isLabStatsStorageConfigured } from './_labStatsCore.mjs';
import { isTelegramConfigured, trackVisitorEvent, validateVisitorEvent, visitorRetentionDays } from './_visitorIntelligenceCore.mjs';
import { isIpAssistConfigured, requestNetworkHash } from './_visitorNetwork.mjs';

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(payload));
};

export default async function handler(request, response) {
  if (request.method === 'GET') return json(response, 200, { version: 2, configured: isLabStatsStorageConfigured(), telegramConfigured: isTelegramConfigured(), ipAssistEnabled: isIpAssistConfigured(), retentionDays: visitorRetentionDays() });
  if (request.method !== 'POST') return json(response, 405, { error: 'Метод не поддерживается.' });
  const rawSize = Number(request.headers?.['content-length'] || 0);
  let parsedSize = 0;
  try { parsedSize = Buffer.byteLength(JSON.stringify(request.body ?? null), 'utf8'); } catch { return json(response, 400, { error: 'Некорректный формат события.' }); }
  if (rawSize > 4096 || parsedSize > 4096) return json(response, 413, { error: 'Событие превышает допустимый размер.' });
  if (!String(request.headers?.['content-type'] || '').toLowerCase().startsWith('application/json')) return json(response, 415, { error: 'Поддерживается только JSON.' });
  const validated = validateVisitorEvent(request.body);
  if (!validated.ok) return json(response, 400, { error: validated.error });
  if (!isLabStatsStorageConfigured()) return json(response, 503, { error: 'Visitor Intelligence временно недоступен.' });
  try {
    const result = await trackVisitorEvent(validated.value, { networkHash: requestNetworkHash(request) });
    if (result.rateLimited) return json(response, 429, { error: 'Слишком много событий.' });
    if (!result.accepted) return json(response, 409, { error: 'Сначала необходимо зарегистрировать сессию этого браузера.' });
    return json(response, 202, { accepted: true, deduplicated: result.deduplicated, notification: result.notification });
  } catch {
    return json(response, 503, { error: 'Visitor Intelligence временно недоступен.' });
  }
}

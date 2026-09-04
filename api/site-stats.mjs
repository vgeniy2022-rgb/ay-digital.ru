import {
  readSiteStats,
  trackSiteVisit,
  validateSiteTrackBody,
} from './_siteStatsCore.mjs';
import { isLabStatsStorageConfigured } from './_labStatsCore.mjs';

const json = (response, status, payload, cacheControl = 'no-store') => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', cacheControl);
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(payload));
};

export default async function handler(request, response) {
  if (request.method === 'GET') {
    if (!isLabStatsStorageConfigured()) return json(response, 503, { error: 'Статистика временно недоступна.' });
    try {
      return json(response, 200, await readSiteStats());
    } catch {
      return json(response, 503, { error: 'Статистика временно недоступна.' });
    }
  }

  if (request.method !== 'POST') return json(response, 405, { error: 'Метод не поддерживается.' });
  const rawSize = Number(request.headers?.['content-length'] || 0);
  let parsedSize = 0;
  try { parsedSize = Buffer.byteLength(JSON.stringify(request.body ?? null), 'utf8'); }
  catch { return json(response, 400, { error: 'Некорректный формат события.' }); }
  if (rawSize > 4096 || parsedSize > 4096) return json(response, 413, { error: 'Событие превышает допустимый размер.' });
  const contentType = String(request.headers?.['content-type'] || '').toLowerCase();
  if (!contentType.startsWith('application/json')) return json(response, 415, { error: 'Поддерживается только JSON.' });

  const validated = validateSiteTrackBody(request.body);
  if (!validated.ok) return json(response, 400, { error: validated.error });
  if (!isLabStatsStorageConfigured()) return json(response, 503, { error: 'Статистика временно недоступна.' });

  try {
    const result = await trackSiteVisit(validated.value);
    if (result.rateLimited) return json(response, 429, { error: 'Слишком много событий.' });
    return json(response, 202, { accepted: true, deduplicated: result.deduplicated });
  } catch {
    return json(response, 503, { error: 'Статистика временно недоступна.' });
  }
}

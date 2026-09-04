import { isLabStatsStorageConfigured } from './_labStatsCore.mjs';
import { authorizeOwnerRequest, readVisitor } from './_visitorIntelligenceCore.mjs';

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(payload));
};

export default async function handler(request, response) {
  if (request.method !== 'GET') return json(response, 405, { error: 'Метод не поддерживается.' });
  if (!process.env.VISITOR_OWNER_API_TOKEN) return json(response, 404, { error: 'Ресурс не найден.' });
  if (!authorizeOwnerRequest(request.headers?.authorization)) return json(response, 401, { error: 'Требуется авторизация владельца.' });
  if (!isLabStatsStorageConfigured()) return json(response, 503, { error: 'Хранилище временно недоступно.' });
  const visitorId = typeof request.query?.visitorId === 'string' ? request.query.visitorId : '';
  try { return json(response, 200, await readVisitor(visitorId)); }
  catch { return json(response, 400, { error: 'Некорректный visitor ID.' }); }
}

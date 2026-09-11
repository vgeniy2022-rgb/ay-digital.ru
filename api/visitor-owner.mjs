import { isLabStatsStorageConfigured } from './_labStatsCore.mjs';
import { authorizeOwnerRequest, readVisitor } from './_visitorIntelligenceCore.mjs';
import { readTrafficSummary } from './_visitorStoreV3.mjs';
import { handleTemplateOwner } from './_templateLeads.mjs';

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(payload));
};

export function createVisitorOwnerHandler(options = {}) {
return async function handler(request, response) {
  const environment = options.environment || process.env;
  if (request.method !== 'GET') return json(response, 405, { error: 'Метод не поддерживается.' });
  if (!environment.VISITOR_OWNER_API_TOKEN) return json(response, 404, { error: 'Ресурс не найден.' });
  if (!authorizeOwnerRequest(request.headers?.authorization,environment)) return json(response, 401, { error: 'Требуется авторизация владельца.' });
  if (!isLabStatsStorageConfigured(environment)) return json(response, 503, { error: 'Хранилище временно недоступно.' });
  if (['template-lead','template-asset'].includes(request.query?.view)) return handleTemplateOwner(request,response,options);
  const visitorId = typeof request.query?.visitorId === 'string' ? request.query.visitorId : '';
  try { return json(response, 200, request.query?.view === 'traffic' ? await readTrafficSummary(options) : await readVisitor(visitorId,options)); }
  catch { return json(response, 400, { error: 'Некорректный visitor ID.' }); }
}
}
export default createVisitorOwnerHandler();

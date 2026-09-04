import { createHash, timingSafeEqual } from 'node:crypto';
import { redisPipeline } from './_labStatsCore.mjs';
import { readVisitor, VISITOR_NAMESPACE } from './_visitorIntelligenceCore.mjs';

const QA_VISITOR = 'SV-FEED01';
const QA_SESSION = 'session-11111111-1111-4111-8111-111111111111';
const QA_TOKEN_HASH = 'd5d094291ed45a18aae4fa745a9a736715ac5eb6b6bfc4341cf8ed861eb03eac';
const QA_EVENT_IDS = Array.from({ length: 10 }, (_, index) => `event-11111111-1111-4111-8111-${String(index + 101).padStart(12, '0')}`);

function authorized(header) {
  const token = String(header || '').replace(/^Bearer\s+/i, '');
  const digest = createHash('sha256').update(token).digest('hex');
  return timingSafeEqual(Buffer.from(digest), Buffer.from(QA_TOKEN_HASH));
}

function json(response, status, payload) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
}

export default async function handler(request, response) {
  if (!authorized(request.headers?.authorization)) return json(response, 404, { error: 'Ресурс не найден.' });
  if (request.method === 'GET') return json(response, 200, await readVisitor(QA_VISITOR));
  if (request.method !== 'DELETE') return json(response, 405, { error: 'Метод не поддерживается.' });
  const intelligence = await readVisitor(QA_VISITOR);
  const leadId = /^[a-f0-9-]{36}$/i.test(intelligence.visitor.leadId || '') ? intelligence.visitor.leadId : '';
  const keys = [
    `${VISITOR_NAMESPACE}:${QA_VISITOR}`,
    `${VISITOR_NAMESPACE}:${QA_VISITOR}:history`,
    `${VISITOR_NAMESPACE}:${QA_VISITOR}:pages`,
    `${VISITOR_NAMESPACE}:${QA_VISITOR}:experiments`,
    `${VISITOR_NAMESPACE}:session:${QA_SESSION}`,
    `${VISITOR_NAMESPACE}:rate:${QA_SESSION}`,
    ...QA_EVENT_IDS.map((id) => `${VISITOR_NAMESPACE}:event:${id}`),
    ...['new-visitor', 'prices', 'ai-website', 'lab', 'experiment-modern-os', 'ai-concept-created'].map((action) => `${VISITOR_NAMESPACE}:notify:${QA_VISITOR}:${action}`),
    'sitevl:ai-lead-rate:SVAI-QAFEED01',
  ];
  if (leadId) keys.push(`sitevl:ai-lead:${leadId}`);
  const commands = [['DEL', ...keys], ['ZREM', `${VISITOR_NAMESPACE}:index`, QA_VISITOR]];
  if (leadId) commands.push(['LREM', 'sitevl:ai-leads:index', '0', leadId]);
  await redisPipeline(commands);
  return json(response, 200, { cleaned: true, visitorId: QA_VISITOR, leadRemoved: Boolean(leadId) });
}

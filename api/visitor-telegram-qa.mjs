import { createHash, timingSafeEqual } from 'node:crypto';
import { redisPipeline } from './_labStatsCore.mjs';
import { isTelegramConfigured, readVisitor, telegramConfiguration, VISITOR_NAMESPACE } from './_visitorIntelligenceCore.mjs';

const QA_VISITOR = 'SV-A91D7E';
const QA_SESSION = 'session-22222222-2222-4222-8222-222222222222';
const QA_AI_SESSION = 'SVAI-QATG2026';
const QA_TOKEN_HASH = 'e0cb1e6c682775af95dd2d992a017f39a305dc150510445874ba3078a2cf9698';
const QA_EVENT_IDS = Array.from({ length: 10 }, (_, index) => `event-22222222-2222-4222-8222-${String(index + 201).padStart(12, '0')}`);

function authorized(header) {
  const token = String(header || '').replace(/^Bearer\s+/i, '');
  const digest = createHash('sha256').update(token).digest('hex');
  return timingSafeEqual(Buffer.from(digest), Buffer.from(QA_TOKEN_HASH));
}

function json(response, status, payload) {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(payload));
}

async function readBotIdentity() {
  const { token } = telegramConfiguration();
  if (!token) return { ok: false, username: '' };
  const response = await fetch(`https://api.telegram.org/bot${encodeURIComponent(token)}/getMe`, { signal: AbortSignal.timeout(10000) });
  const payload = await response.json().catch(() => ({}));
  return { ok: response.ok && payload?.ok === true, username: typeof payload?.result?.username === 'string' ? payload.result.username : '' };
}

export default async function handler(request, response) {
  if (!authorized(request.headers?.authorization)) return json(response, 404, { error: 'Ресурс не найден.' });
  if (request.method === 'GET') {
    const [intelligence, bot] = await Promise.all([readVisitor(QA_VISITOR), readBotIdentity()]);
    return json(response, 200, { telegramConfigured: isTelegramConfigured(), bot, intelligence });
  }
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
    ...QA_EVENT_IDS.map((eventId) => `${VISITOR_NAMESPACE}:event:${eventId}`),
    ...['new-visitor', 'prices', 'lab', 'experiment-modern-os', 'ai-website', 'ai-concept-created'].map((action) => `${VISITOR_NAMESPACE}:notify:${QA_VISITOR}:${action}`),
    `sitevl:ai-generation-rate:${QA_AI_SESSION}`,
    `sitevl:ai-lead-rate:${QA_AI_SESSION}`,
  ];
  if (leadId) keys.push(`sitevl:ai-lead:${leadId}`);
  const commands = [['DEL', ...keys], ['ZREM', `${VISITOR_NAMESPACE}:index`, QA_VISITOR]];
  if (leadId) commands.push(['LREM', 'sitevl:ai-leads:index', '0', leadId]);
  await redisPipeline(commands);
  return json(response, 200, { cleaned: true, visitorId: QA_VISITOR, leadRemoved: Boolean(leadId) });
}

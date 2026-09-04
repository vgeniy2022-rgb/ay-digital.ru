import { createHash, timingSafeEqual } from 'node:crypto';
import { isLabStatsStorageConfigured } from './_labStatsCore.mjs';
import { resetSiteStatsNamespace } from './_siteStatsCore.mjs';

const EXPECTED_DIGEST = Buffer.from('35293281ce1f8826b834fc74ef2f4eb2d99708dee419bc8176e7d9ad6de62d28', 'hex');

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.end(JSON.stringify(payload));
};

export default async function handler(request, response) {
  if (request.method !== 'POST') return json(response, 405, { error: 'Метод не поддерживается.' });
  const supplied = String(request.headers?.['x-sitevl-reset-token'] || '');
  const suppliedDigest = createHash('sha256').update(supplied).digest();
  if (!supplied || suppliedDigest.length !== EXPECTED_DIGEST.length || !timingSafeEqual(suppliedDigest, EXPECTED_DIGEST)) {
    return json(response, 404, { error: 'Не найдено.' });
  }
  if (!isLabStatsStorageConfigured()) return json(response, 503, { error: 'Статистика временно недоступна.' });
  try {
    const stats = await resetSiteStatsNamespace();
    return json(response, 200, { reset: true, ...stats });
  } catch {
    return json(response, 503, { error: 'Статистика временно недоступна.' });
  }
}

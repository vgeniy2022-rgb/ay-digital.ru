import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';
// @ts-expect-error Vercel serverless handlers are native ESM JavaScript modules.
import aiHandler from '../../../api/ai.mjs';
// @ts-expect-error Vercel serverless handlers are native ESM JavaScript modules.
import leadHandler from '../../../api/ai-leads.mjs';
// @ts-expect-error Shared server validation is a native ESM JavaScript module.
import { sanitizeAiWebsiteLead } from '../../../api/_aiLeadValidation.mjs';
import { createFallbackAiWebsiteConcept, getAiWebsitePackage, recommendAiWebsitePackage, validateAiWebsiteConcept } from './schema';

function responseCapture() {
  let body = '';
  return {
    statusCode: 200,
    headers: {} as Record<string, string>,
    setHeader(key: string, value: string) { this.headers[key] = value; },
    end(value: string) { body = value; },
    result() { return { status: this.statusCode, headers: this.headers, body: JSON.parse(body) }; },
  };
}

function validLead() {
  const concept = createFallbackAiWebsiteConcept('Ремонтируем ноутбуки и помогаем сохранить данные', { business: 'Мастерская', offer: 'Ремонт ноутбуков' });
  return { sessionId: 'SVAI-TEST12345', conceptId: 'SV-AI-ABC123', source: '/ai-website', originalPrompt: 'Ремонт ноутбуков', answers: { business: 'Мастерская' }, generatedConcept: concept, selectedVariant: 'balanced', selectedStyle: 'modern', recommendedPackage: 'Сайт для старта', estimatedStartingPrice: 'от 19 900 ₽', budget: '', deadline: '', requiredFeatures: concept.features, contact: { name: 'Тест', phone: '+7 900 000-00-00', telegram: '', whatsapp: '', email: '', notes: '', consent: true } };
}

test('schema strips markup and rejects unknown section types', () => {
  const safe = validateAiWebsiteConcept({
    version: 1,
    business: { name: '<script>alert(1)</script>Честный бизнес' },
    site: { type: 'start', title: '<b>Заголовок</b>' },
    theme: { style: 'modern', accent: '#123456' },
    sections: [{ id: 'hero', type: 'hero', title: 'Hero' }, { id: 'bad', type: 'script', title: 'Bad' }, { id: 'services', type: 'services', title: 'Услуги' }, { id: 'faq', type: 'faq', title: 'FAQ' }],
  }, 'Тестовый бизнес');
  assert.equal(safe.business.name, 'alert(1)Честный бизнес');
  assert.equal(safe.site.title, 'Заголовок');
  assert.equal(safe.sections.some((item) => String(item.type) === 'script'), false);
  assert.equal(safe.theme.accent, '#123456');
});

test('pricing uses the existing SITEVL package source', () => {
  assert.deepEqual(getAiWebsitePackage('start'), { id: 'start', name: 'Сайт для старта', price: 'от 19 900 ₽' });
  assert.deepEqual(getAiWebsitePackage('store'), { id: 'store', name: 'Интернет-магазин', price: 'от 79 900 ₽' });
  assert.deepEqual(getAiWebsitePackage('web-service'), { id: 'web-service', name: 'Индивидуальный веб-сервис', price: 'от 139 900 ₽' });
  const concept = createFallbackAiWebsiteConcept('Нужен простой сайт', { business: 'Компания' });
  assert.equal(recommendAiWebsitePackage(concept, { functions: 'Каталог товаров с фильтрами' }).price, 'от 59 900 ₽');
  assert.equal(recommendAiWebsitePackage(concept, { functions: 'Личный кабинет и роли пользователей' }).price, 'от 139 900 ₽');
});

test('lead validation requires consent and at least one contact', () => {
  const lead = validLead();
  assert.equal(sanitizeAiWebsiteLead(lead).ok, true);
  assert.equal(sanitizeAiWebsiteLead({ ...lead, contact: { ...lead.contact, phone: '', consent: false } }).ok, false);
});

test('lead validation mode has no persistence side effects', async () => {
  const response = responseCapture();
  await leadHandler({ method: 'POST', headers: {}, body: { ...validLead(), testMode: 'validate' } }, response);
  assert.deepEqual(response.result().body, { valid: true, stored: false, testMode: true });
});

test('invalid Gemini JSON is repaired once then safely falls back', async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = globalThis.fetch;
  process.env.GEMINI_API_KEY = 'test-only-server-key';
  globalThis.fetch = (async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'not-json' }] } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;
  try {
    const response = responseCapture();
    await aiHandler({ method: 'POST', body: { kind: 'website-concept', prompt: 'Кофейня с завтраками во Владивостоке', sessionId: 'SVAI-FALLBACK01' } }, response);
    assert.equal(response.result().status, 200);
    assert.equal(response.result().body.fallback, true);
    assert.equal(response.result().body.concept.version, 1);
  } finally {
    globalThis.fetch = previousFetch;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previousKey;
  }
});

test('generation rate is limited to three requests per session', async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  const previousFetch = globalThis.fetch;
  const previousNow = Date.now;
  let now = 1_800_000_000_000;
  process.env.GEMINI_API_KEY = 'test-only-server-key';
  Date.now = () => { now += 3000; return now; };
  globalThis.fetch = (async () => new Response(JSON.stringify({ candidates: [{ content: { parts: [{ text: 'not-json' }] } }] }), { status: 200, headers: { 'Content-Type': 'application/json' } })) as typeof fetch;
  try {
    const statuses: number[] = [];
    for (let index = 0; index < 4; index += 1) {
      const response = responseCapture();
      await aiHandler({ method: 'POST', body: { kind: 'website-concept', prompt: 'Сервис для бизнеса', sessionId: 'SVAI-RATELIMIT1' } }, response);
      statuses.push(response.result().status);
    }
    assert.deepEqual(statuses, [200, 200, 200, 429]);
  } finally {
    globalThis.fetch = previousFetch;
    Date.now = previousNow;
    if (previousKey === undefined) delete process.env.GEMINI_API_KEY; else process.env.GEMINI_API_KEY = previousKey;
  }
});

test('frontend contains no secret access or unsafe dynamic rendering', async () => {
  const [page, preview] = await Promise.all([readFile(new URL('../../pages/AiWebsitePage.tsx', import.meta.url), 'utf8'), readFile(new URL('./AiWebsitePreview.tsx', import.meta.url), 'utf8')]);
  const source = `${page}\n${preview}`;
  assert.equal(source.includes('GEMINI_API_KEY'), false);
  assert.equal(source.includes('VITE_GEMINI'), false);
  assert.equal(source.includes('dangerouslySetInnerHTML'), false);
  assert.equal(/\beval\s*\(|new Function\s*\(/.test(source), false);
});

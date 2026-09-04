const SESSION_PATTERN = /^[A-Z0-9-]{8,32}$/i;
const CONCEPT_PATTERN = /^SV-AI-[A-Z0-9]{6}$/i;
const VISITOR_PATTERN = /^(?:SV-[A-F0-9]{6}|visitor-[a-f0-9]{32}|visitor-[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;
const VISITOR_SESSION_PATTERN = /^session-(?:[a-f0-9]{32}|[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12})$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const clean = (value, limit) => typeof value === 'string'
  ? [...value.replace(/<[^>]*>/g, '')].map((character) => {
    const code = character.charCodeAt(0);
    return code >= 32 && code !== 127 ? character : ' ';
  }).join('').replace(/\s+/g, ' ').trim().slice(0, limit)
  : '';

const plainObject = (value) => value && typeof value === 'object' && !Array.isArray(value);

export function sanitizeAiWebsiteLead(raw) {
  if (!plainObject(raw)) return { ok: false, error: 'Некорректный формат заявки.' };
  const contact = plainObject(raw.contact) ? raw.contact : {};
  const sessionId = clean(raw.sessionId, 32);
  const conceptId = clean(raw.conceptId, 20);
  const visitorId = clean(raw.visitorId, 48);
  const visitorSessionId = clean(raw.visitorSessionId, 48);
  const name = clean(contact.name, 100);
  const phone = clean(contact.phone, 40);
  const telegram = clean(contact.telegram, 80);
  const whatsapp = clean(contact.whatsapp, 40);
  const email = clean(contact.email, 160).toLowerCase();

  if (!SESSION_PATTERN.test(sessionId) || !CONCEPT_PATTERN.test(conceptId) || raw.source !== '/ai-website') {
    return { ok: false, error: 'Некорректная AI-сессия.' };
  }
  if ((visitorId || visitorSessionId) && (!VISITOR_PATTERN.test(visitorId) || !VISITOR_SESSION_PATTERN.test(visitorSessionId))) {
    return { ok: false, error: 'Некорректная связь с анонимной сессией.' };
  }
  if (!name) return { ok: false, error: 'Укажите имя.' };
  if (!phone && !telegram && !whatsapp && !email) return { ok: false, error: 'Укажите хотя бы один способ связи.' };
  if (email && !EMAIL_PATTERN.test(email)) return { ok: false, error: 'Проверьте адрес электронной почты.' };
  if (contact.consent !== true) return { ok: false, error: 'Нужно согласие на обработку данных.' };
  if (!plainObject(raw.generatedConcept) || raw.generatedConcept.version !== 1) return { ok: false, error: 'Концепция сайта отсутствует или повреждена.' };

  const conceptText = JSON.stringify(raw.generatedConcept);
  if (conceptText.length > 50000) return { ok: false, error: 'Концепция превышает допустимый размер.' };

  const answers = plainObject(raw.answers) ? raw.answers : {};
  const sanitizedAnswers = {};
  for (const [key, value] of Object.entries(answers).slice(0, 20)) sanitizedAnswers[clean(key, 40)] = clean(value, 1600);

  return {
    ok: true,
    value: {
      schemaVersion: 1,
      sessionId,
      visitorId,
      visitorSessionId,
      conceptId,
      source: '/ai-website',
      originalPrompt: clean(raw.originalPrompt, 6000),
      answers: sanitizedAnswers,
      generatedConcept: raw.generatedConcept,
      selectedVariant: clean(raw.selectedVariant, 40),
      selectedStyle: clean(raw.selectedStyle, 40),
      recommendedPackage: clean(raw.recommendedPackage, 100),
      estimatedStartingPrice: clean(raw.estimatedStartingPrice, 80),
      budget: clean(raw.budget, 100),
      deadline: clean(raw.deadline, 100),
      requiredFeatures: Array.isArray(raw.requiredFeatures) ? raw.requiredFeatures.slice(0, 12).map((item) => clean(item, 120)).filter(Boolean) : [],
      contact: { name, phone, telegram, whatsapp, email, notes: clean(contact.notes, 2000), consent: true },
    },
  };
}

export function createLeadSummary(lead) {
  const contact = [lead.contact.phone, lead.contact.telegram, lead.contact.whatsapp, lead.contact.email].filter(Boolean).join(' · ');
  return [
    'Новая заявка SITEVL AI',
    `ID: ${lead.conceptId}`,
    `Имя: ${lead.contact.name}`,
    `Связь: ${contact}`,
    `Пакет: ${lead.recommendedPackage || 'не определён'}`,
    `Цена: ${lead.estimatedStartingPrice || 'не определена'}`,
    `Вариант: ${lead.selectedVariant || 'не выбран'}`,
  ].join('\n').slice(0, 1800);
}

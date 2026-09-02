const DEFAULT_MODEL = 'gemini-3.5-flash-lite';
const ALLOWED_KINDS = new Set(['site-plan', 'rewrite', 'site-action', 'website-concept']);
const MAX_PROMPT_LENGTH = 12000;
const MAX_WEBSITE_PROMPT_LENGTH = 6000;
const WEBSITE_SECTION_TYPES = new Set(['hero', 'services', 'advantages', 'about', 'process', 'gallery', 'team', 'catalog', 'pricing', 'reviews', 'faq', 'contacts', 'cta', 'stats', 'features', 'delivery', 'booking', 'map', 'footer']);
const WEBSITE_SITE_TYPES = new Set(['start', 'landing', 'managed', 'business', 'catalog', 'store', 'web-service']);
const WEBSITE_STYLES = new Set(['modern', 'minimal', 'premium', 'technology', 'warm', 'strict', 'bright', 'dark']);
const generationWindows = new Map();

const redisConfiguration = () => ({
  url: process.env.AI_LEADS_REDIS_REST_URL || process.env.UPSTASH_REDIS_REST_URL || process.env.KV_REST_API_URL,
  token: process.env.AI_LEADS_REDIS_REST_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN || process.env.KV_REST_API_TOKEN,
});

const json = (response, status, payload) => {
  response.statusCode = status;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.setHeader('Cache-Control', 'no-store');
  response.end(JSON.stringify(payload));
};

const compactContext = (value) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const safe = {};
  for (const [key, item] of Object.entries(value).slice(0, 30)) {
    if (typeof item === 'string') safe[key] = item.slice(0, 1200);
    else if (typeof item === 'number' || typeof item === 'boolean') safe[key] = item;
    else if (Array.isArray(item)) safe[key] = item.slice(0, 50);
  }
  return safe;
};

const extractText = (payload) => payload?.candidates?.[0]?.content?.parts
  ?.map((part) => typeof part?.text === 'string' ? part.text : '')
  .join('\n')
  .trim() || '';

const parseJsonAnswer = (text) => {
  const cleaned = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '').trim();
  return JSON.parse(cleaned);
};

const safeText = (value, fallback = '', limit = 280) => {
  if (typeof value !== 'string') return fallback;
  const clean = [...value.replace(/<[^>]*>/g, '')].map((character) => {
    const code = character.charCodeAt(0);
    return code >= 32 && code !== 127 ? character : ' ';
  }).join('').replace(/\s+/g, ' ').trim();
  return clean.slice(0, limit) || fallback;
};

const safeItems = (value, fallback, limit = 8) => {
  if (!Array.isArray(value)) return fallback;
  const items = value.slice(0, limit).map((item) => ({
    title: safeText(item?.title, 'Пункт', 90),
    text: safeText(item?.text, 'Описание уточняется вместе с владельцем бизнеса.', 320),
    ...(safeText(item?.meta, '', 80) ? { meta: safeText(item.meta, '', 80) } : {}),
  }));
  return items.length ? items : fallback;
};

const inferWebsiteType = (prompt) => {
  const value = prompt.toLowerCase();
  if (/корзин|оплат|интернет-магазин|оформлени[ея] заказ/.test(value)) return 'store';
  if (/каталог|поиск|фильтр|автозапчаст|товар/.test(value)) return 'catalog';
  if (/личн(ый|ого) кабинет|роли|автоматизац|веб-сервис|crm|внутренн/.test(value)) return 'web-service';
  if (/самостоятельно|систем[а-я ]+управлен|обновлять контент|админк/.test(value)) return 'managed';
  if (/лендинг|одностранич|акци[яи]|одно предложени/.test(value)) return 'landing';
  if (/компани|бизнес|несколько страниц/.test(value)) return 'business';
  return 'start';
};

const fallbackWebsiteConcept = (prompt) => {
  const siteType = inferWebsiteType(prompt);
  return {
    version: 1,
    business: { name: 'Ваш бизнес', type: 'Услуги или товары', city: 'Ваш город', audience: 'Люди, которым важно быстро понять предложение', offer: safeText(prompt, 'Предложение бизнеса', 320) },
    site: { type: siteType, title: 'Понятный сайт для вашего бизнеса', subtitle: safeText(prompt, 'Покажите предложение и дайте удобный способ связаться.', 360), cta: 'Обсудить задачу', secondaryCta: 'Посмотреть услуги' },
    theme: { style: 'modern', mode: 'light', accent: '#2563eb', background: '#f7f8fb', surface: '#ffffff', radius: 'large', density: 'comfortable' },
    sections: [
      { id: 'hero', type: 'hero', title: 'Первый экран', visible: true },
      { id: 'services', type: siteType === 'catalog' || siteType === 'store' ? 'catalog' : 'services', title: siteType === 'catalog' || siteType === 'store' ? 'Каталог' : 'Услуги', visible: true },
      { id: 'advantages', type: 'advantages', title: 'Преимущества', visible: true },
      { id: 'process', type: 'process', title: 'Как проходит работа', visible: true },
      { id: 'faq', type: 'faq', title: 'Частые вопросы', visible: true },
      { id: 'contacts', type: 'contacts', title: 'Связаться', visible: true },
      { id: 'footer', type: 'footer', title: 'Подвал', visible: true },
    ],
    services: [
      { title: 'Основное направление', text: 'Опишите главный результат для клиента.' },
      { title: 'Дополнительная услуга', text: 'Покажите второй понятный сценарий обращения.' },
      { title: 'Индивидуальное решение', text: 'Предложите обсудить нестандартную задачу.' },
    ],
    features: ['Адаптация под телефон', 'Понятная структура', 'Удобный способ связаться'],
    faq: [{ question: 'Как начать?', answer: 'Оставьте удобный контакт и коротко опишите задачу.' }],
    contacts: { city: 'Ваш город', phoneLabel: 'Телефон будет указан после согласования', emailLabel: 'Email будет указан после согласования' },
    recommendedPackage: siteType,
    estimatedComplexity: siteType === 'store' || siteType === 'web-service' ? 'high' : siteType === 'catalog' || siteType === 'business' ? 'medium' : 'low',
    notes: ['Замените placeholders на подтверждённые сведения бизнеса.', 'Отзывы, адреса и юридические сведения не создавались автоматически.'],
  };
};

const validateWebsiteConcept = (value, prompt) => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('invalid concept');
  const fallback = fallbackWebsiteConcept(prompt);
  const business = value.business && typeof value.business === 'object' ? value.business : {};
  const site = value.site && typeof value.site === 'object' ? value.site : {};
  const theme = value.theme && typeof value.theme === 'object' ? value.theme : {};
  const contacts = value.contacts && typeof value.contacts === 'object' ? value.contacts : {};
  if (!Array.isArray(value.sections) || value.sections.length < 3) throw new Error('invalid sections');
  const sections = value.sections.slice(0, 12).flatMap((section, index) => {
    if (!section || typeof section !== 'object' || !WEBSITE_SECTION_TYPES.has(String(section.type))) return [];
    return [{
      id: safeText(section.id, `${section.type}-${index}`, 60).replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
      type: String(section.type), title: safeText(section.title, String(section.type), 100),
      ...(safeText(section.subtitle, '', 220) ? { subtitle: safeText(section.subtitle, '', 220) } : {}),
      ...(Array.isArray(section.items) ? { items: safeItems(section.items, [], 8) } : {}), visible: section.visible !== false,
    }];
  });
  if (sections.length < 3) throw new Error('no allowlisted sections');
  const siteType = WEBSITE_SITE_TYPES.has(String(site.type)) ? String(site.type) : fallback.site.type;
  const style = WEBSITE_STYLES.has(String(theme.style)) ? String(theme.style) : fallback.theme.style;
  const color = (candidate, base) => /^#[0-9a-f]{6}$/i.test(String(candidate)) ? String(candidate) : base;
  return {
    version: 1,
    business: { name: safeText(business.name, fallback.business.name, 90), type: safeText(business.type, fallback.business.type, 120), city: safeText(business.city, fallback.business.city, 80), audience: safeText(business.audience, fallback.business.audience, 220), offer: safeText(business.offer, fallback.business.offer, 320) },
    site: { type: siteType, title: safeText(site.title, fallback.site.title, 150), subtitle: safeText(site.subtitle, fallback.site.subtitle, 360), cta: safeText(site.cta, fallback.site.cta, 60), secondaryCta: safeText(site.secondaryCta, fallback.site.secondaryCta, 60) },
    theme: { style, mode: theme.mode === 'dark' ? 'dark' : 'light', accent: color(theme.accent, fallback.theme.accent), background: color(theme.background, fallback.theme.background), surface: color(theme.surface, fallback.theme.surface), radius: ['compact', 'medium', 'large'].includes(theme.radius) ? theme.radius : 'large', density: ['compact', 'comfortable', 'spacious'].includes(theme.density) ? theme.density : 'comfortable' },
    sections,
    services: safeItems(value.services, fallback.services, 8),
    features: Array.isArray(value.features) ? value.features.slice(0, 8).map((item) => safeText(item, '', 120)).filter(Boolean) : fallback.features,
    faq: Array.isArray(value.faq) ? value.faq.slice(0, 8).map((item) => ({ question: safeText(item?.question, 'Вопрос', 140), answer: safeText(item?.answer, 'Ответ уточняется.', 320) })) : fallback.faq,
    contacts: { city: safeText(contacts.city, fallback.contacts.city, 80), phoneLabel: safeText(contacts.phoneLabel, fallback.contacts.phoneLabel, 100), emailLabel: safeText(contacts.emailLabel, fallback.contacts.emailLabel, 100) },
    recommendedPackage: WEBSITE_SITE_TYPES.has(String(value.recommendedPackage)) ? String(value.recommendedPackage) : siteType,
    estimatedComplexity: ['low', 'medium', 'high'].includes(value.estimatedComplexity) ? value.estimatedComplexity : fallback.estimatedComplexity,
    notes: Array.isArray(value.notes) ? value.notes.slice(0, 6).map((item) => safeText(item, '', 180)).filter(Boolean) : fallback.notes,
  };
};

const websiteSystemInstruction = `Ты веб-стратег, UX-копирайтер и product planner SITEVL. Верни только JSON version 1 без Markdown. Никогда не возвращай HTML, React, JavaScript, URL изображений, shell-команды или секреты. Не выдумывай отзывы, клиентов, адреса, телефоны, награды, сертификаты и юридические данные. Допустимые site.type: start, landing, managed, business, catalog, store, web-service. Допустимые theme.style: modern, minimal, premium, technology, warm, strict, bright, dark. Допустимые sections.type: hero, services, advantages, about, process, gallery, team, catalog, pricing, reviews, faq, contacts, cta, stats, features, delivery, booking, map, footer. Не более 12 sections, 8 services, 8 features, 8 faq. Schema: {"version":1,"business":{"name":"","type":"","city":"","audience":"","offer":""},"site":{"type":"","title":"","subtitle":"","cta":"","secondaryCta":""},"theme":{"style":"","mode":"light|dark","accent":"#RRGGBB","background":"#RRGGBB","surface":"#RRGGBB","radius":"compact|medium|large","density":"compact|comfortable|spacious"},"sections":[{"id":"","type":"","title":"","subtitle":"","visible":true}],"services":[{"title":"","text":"","meta":""}],"features":[""],"faq":[{"question":"","answer":""}],"contacts":{"city":"","phoneLabel":"placeholder","emailLabel":"placeholder"},"recommendedPackage":"","estimatedComplexity":"low|medium|high","notes":[""]}.`;

const checkGenerationRate = async (sessionId) => {
  if (!/^[A-Z0-9-]{8,32}$/i.test(sessionId || '')) return { ok: false, status: 400, error: 'Некорректная AI-сессия.' };
  const now = Date.now();
  const recent = (generationWindows.get(sessionId) || []).filter((stamp) => now - stamp < 30 * 60 * 1000);
  if (recent.length >= 3) return { ok: false, status: 429, error: 'Лимит этой сессии исчерпан. Можно создать до трёх вариантов.' };
  if (recent.length && now - recent[recent.length - 1] < 2500) return { ok: false, status: 429, error: 'Подождите несколько секунд перед новой генерацией.' };
  const redis = redisConfiguration();
  if (redis.url && redis.token) {
    try {
      const base = redis.url.replace(/\/$/, '');
      const rateResponse = await fetch(`${base}/pipeline`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${redis.token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify([['INCR', `sitevl:ai-generation-rate:${sessionId}`], ['EXPIRE', `sitevl:ai-generation-rate:${sessionId}`, '1800']]),
        signal: AbortSignal.timeout(5000),
      });
      const result = await rateResponse.json();
      if (!rateResponse.ok || !Array.isArray(result) || result.some((entry) => entry?.error)) throw new Error('rate storage unavailable');
      if (Number(result[0]?.result) > 3) return { ok: false, status: 429, error: 'Лимит этой сессии исчерпан. Можно создать до трёх вариантов.' };
    } catch {
      return { ok: false, status: 503, error: 'Сервис ограничения AI-запросов временно недоступен. Попробуйте позже.' };
    }
  }
  recent.push(now); generationWindows.set(sessionId, recent);
  if (generationWindows.size > 2000) generationWindows.clear();
  return { ok: true };
};

const systemInstruction = (kind) => {
  if (kind === 'website-concept') return websiteSystemInstruction;
  if (kind === 'site-plan') return 'Ты помощник SITEVL Studio. Верни только корректный JSON плана сайта без Markdown и комментариев. Не добавляй JavaScript и небезопасные URL.';
  if (kind === 'rewrite') return 'Перепиши пользовательский текст ясно и естественно. Верни только готовый текст без служебных пояснений.';
  return 'Ты помощник виртуальной системы SITEVL NOVA. Отвечай по-русски, кратко и в Markdown. Не выдавай себя за управляющего реальным устройством, не предлагай shell, eval, выполнение JavaScript или доступ к личным данным.';
};

export default async function handler(request, response) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || DEFAULT_MODEL;
  if (request.method === 'GET') return json(response, 200, { configured: Boolean(key), provider: 'gemini', model });
  if (request.method !== 'POST') return json(response, 405, { error: 'Метод не поддерживается.' });
  if (!key) return json(response, 503, { error: 'Gemini не настроен на сервере. Добавьте GEMINI_API_KEY в переменные окружения Vercel.' });

  const kind = typeof request.body?.kind === 'string' ? request.body.kind : '';
  const prompt = typeof request.body?.prompt === 'string' ? request.body.prompt.trim() : '';
  if (!ALLOWED_KINDS.has(kind)) return json(response, 400, { error: 'Неизвестный тип AI-запроса.' });
  const maxPromptLength = kind === 'website-concept' ? MAX_WEBSITE_PROMPT_LENGTH : MAX_PROMPT_LENGTH;
  if (!prompt || prompt.length > maxPromptLength) return json(response, 400, { error: `Запрос должен содержать от 1 до ${maxPromptLength} символов.` });
  if (kind === 'website-concept') {
    const rate = await checkGenerationRate(request.body?.sessionId);
    if (!rate.ok) return json(response, rate.status, { error: rate.error });
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 40000);
  try {
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction(kind) }] },
        contents: [{ role: 'user', parts: [{ text: `${prompt}\n\nКонтекст интерфейса: ${JSON.stringify(compactContext(request.body?.context))}` }] }],
        generationConfig: { temperature: kind === 'site-plan' || kind === 'website-concept' ? 0.25 : 0.65, maxOutputTokens: kind === 'site-plan' ? 8192 : kind === 'website-concept' ? 4096 : 2048, responseMimeType: kind === 'site-plan' || kind === 'website-concept' ? 'application/json' : 'text/plain' },
      }),
      signal: controller.signal,
    });
    const payload = await geminiResponse.json().catch(() => ({}));
    if (!geminiResponse.ok) return json(response, geminiResponse.status, { error: payload?.error?.message || 'Gemini API не смог обработать запрос.' });
    const text = extractText(payload);
    if (!text) return json(response, 502, { error: 'Gemini вернул пустой ответ.' });
    if (kind === 'site-plan') {
      try { return json(response, 200, parseJsonAnswer(text)); }
      catch { return json(response, 502, { error: 'Gemini вернул план в неподдерживаемом формате.' }); }
    }
    if (kind === 'website-concept') {
      try {
        return json(response, 200, { concept: validateWebsiteConcept(parseJsonAnswer(text), prompt), provider: 'gemini', model, repaired: false, fallback: false });
      } catch {
        const repairResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: websiteSystemInstruction }] },
            contents: [{ role: 'user', parts: [{ text: `Исправь этот ответ в строго валидный JSON по schema. Не добавляй Markdown:\n${text.slice(0, 10000)}` }] }],
            generationConfig: { temperature: 0.1, maxOutputTokens: 4096, responseMimeType: 'application/json' },
          }), signal: controller.signal,
        });
        const repairPayload = await repairResponse.json().catch(() => ({}));
        const repairedText = extractText(repairPayload);
        try {
          return json(response, 200, { concept: validateWebsiteConcept(parseJsonAnswer(repairedText), prompt), provider: 'gemini', model, repaired: true, fallback: false });
        } catch {
          return json(response, 200, { concept: fallbackWebsiteConcept(prompt), provider: 'gemini', model, repaired: true, fallback: true });
        }
      }
    }
    return json(response, 200, { text, provider: 'gemini', model });
  } catch (error) {
    return json(response, error?.name === 'AbortError' ? 504 : 502, { error: error?.name === 'AbortError' ? 'Gemini не ответил вовремя.' : 'Не удалось связаться с Gemini API.' });
  } finally {
    clearTimeout(timeout);
  }
}

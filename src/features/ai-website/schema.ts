import { priceDirections } from '../../data/priceDirections';
import {
  aiWebsiteSectionTypes,
  aiWebsiteSiteTypes,
  aiWebsiteStyles,
  type AiWebsiteAnswers,
  type AiWebsiteConcept,
  type AiWebsiteItem,
  type AiWebsiteSection,
  type AiWebsiteSiteType,
  type AiWebsiteStyle,
} from './types';

const sectionSet = new Set<string>(aiWebsiteSectionTypes);
const siteTypeSet = new Set<string>(aiWebsiteSiteTypes);
const styleSet = new Set<string>(aiWebsiteStyles);
const hexPattern = /^#[0-9a-f]{6}$/i;

const cleanText = (value: unknown, fallback = '', limit = 240) => {
  if (typeof value !== 'string') return fallback;
  const clean = [...value.replace(/<[^>]*>/g, '')].map((character) => {
    const code = character.charCodeAt(0);
    return code >= 32 && code !== 127 ? character : ' ';
  }).join('').replace(/\s+/g, ' ').trim();
  return clean.slice(0, limit) || fallback;
};

const cleanItems = (value: unknown, fallback: AiWebsiteItem[], limit = 8): AiWebsiteItem[] => {
  if (!Array.isArray(value)) return fallback;
  const result = value.slice(0, limit).map((item) => ({
    title: cleanText(item && typeof item === 'object' ? (item as Record<string, unknown>).title : '', 'Пункт', 90),
    text: cleanText(item && typeof item === 'object' ? (item as Record<string, unknown>).text : '', 'Описание уточняется вместе с владельцем бизнеса.', 320),
    meta: cleanText(item && typeof item === 'object' ? (item as Record<string, unknown>).meta : '', '', 80) || undefined,
  }));
  return result.length ? result : fallback;
};

export function inferAiWebsiteSiteType(prompt: string): AiWebsiteSiteType {
  const value = prompt.toLowerCase();
  if (/корзин|оплат|интернет-магазин|оформлени[ея] заказ/.test(value)) return 'store';
  if (/каталог|поиск|фильтр|автозапчаст|товар/.test(value)) return 'catalog';
  if (/личн(ый|ого) кабинет|роли|автоматизац|веб-сервис|crm|внутренн/.test(value)) return 'web-service';
  if (/самостоятельно|систем[а-я ]+управлен|обновлять контент|админк/.test(value)) return 'managed';
  if (/лендинг|одностранич|акци[яи]|одно предложени/.test(value)) return 'landing';
  if (/компани|бизнес|несколько страниц/.test(value)) return 'business';
  return 'start';
}

export function inferAiWebsiteStyle(prompt: string, requested: AiWebsiteAnswers['style'] = 'auto'): AiWebsiteStyle {
  if (requested !== 'auto') return requested;
  const value = prompt.toLowerCase();
  if (/т[её]мн/.test(value)) return 'dark';
  if (/преми/.test(value)) return 'premium';
  if (/технолог/.test(value)) return 'technology';
  if (/ярк/.test(value)) return 'bright';
  if (/т[её]пл|уютн/.test(value)) return 'warm';
  if (/строг/.test(value)) return 'strict';
  if (/минимал/.test(value)) return 'minimal';
  return 'modern';
}

const fallbackServices: AiWebsiteItem[] = [
  { title: 'Основное направление', text: 'Кратко объясните, какую задачу клиента решает эта услуга.' },
  { title: 'Дополнительная услуга', text: 'Покажите второй понятный сценарий обращения.' },
  { title: 'Индивидуальное решение', text: 'Оставьте возможность обсудить нестандартную задачу.' },
];

export function createFallbackAiWebsiteConcept(prompt: string, answers: Partial<AiWebsiteAnswers> = {}): AiWebsiteConcept {
  const siteType = inferAiWebsiteSiteType(`${prompt} ${answers.functions || ''}`);
  const style = inferAiWebsiteStyle(prompt, answers.style || 'auto');
  const businessName = cleanText(answers.business, 'Ваш бизнес', 90);
  const city = cleanText(answers.city, 'Ваш город', 80);
  const dark = style === 'dark' || style === 'technology';
  return {
    version: 1,
    business: {
      name: businessName,
      type: cleanText(answers.offer, 'Услуги или товары', 120),
      city,
      audience: cleanText(answers.audience, 'Клиенты, которым важно быстро понять предложение', 180),
      offer: cleanText(answers.offer, prompt, 280),
    },
    site: {
      type: siteType,
      title: `${businessName}: понятное решение для ваших клиентов`,
      subtitle: cleanText(prompt, 'Расскажите о предложении, покажите преимущества и дайте понятный способ связаться.', 260),
      cta: 'Обсудить задачу',
      secondaryCta: 'Посмотреть услуги',
    },
    theme: {
      style,
      mode: dark ? 'dark' : 'light',
      accent: hexPattern.test(answers.brandColor || '') ? answers.brandColor! : style === 'warm' ? '#c2633c' : style === 'premium' ? '#a47a3f' : '#2563eb',
      background: dark ? '#0b1220' : '#f7f8fb',
      surface: dark ? '#131d2e' : '#ffffff',
      radius: style === 'strict' ? 'compact' : 'large',
      density: style === 'minimal' ? 'spacious' : 'comfortable',
    },
    sections: [
      { id: 'hero', type: 'hero', title: 'Первый экран', visible: true },
      { id: 'services', type: siteType === 'catalog' || siteType === 'store' ? 'catalog' : 'services', title: siteType === 'catalog' || siteType === 'store' ? 'Каталог' : 'Услуги', visible: true },
      { id: 'advantages', type: 'advantages', title: 'Почему выбирают нас', visible: true },
      { id: 'process', type: 'process', title: 'Как проходит работа', visible: true },
      { id: 'faq', type: 'faq', title: 'Частые вопросы', visible: true },
      { id: 'contacts', type: 'contacts', title: 'Связаться', visible: true },
      { id: 'footer', type: 'footer', title: 'Подвал', visible: true },
    ],
    services: fallbackServices,
    features: ['Адаптация под телефон', 'Понятная структура', 'Быстрый способ связаться'],
    faq: [
      { question: 'Как начать?', answer: 'Оставьте удобный контакт и коротко опишите задачу.' },
      { question: 'Можно ли уточнить детали?', answer: 'Да, состав и условия согласуются до начала работы.' },
    ],
    contacts: { city, phoneLabel: 'Телефон будет указан после согласования', emailLabel: 'Email будет указан после согласования' },
    recommendedPackage: siteType,
    estimatedComplexity: siteType === 'web-service' || siteType === 'store' ? 'high' : siteType === 'catalog' || siteType === 'business' ? 'medium' : 'low',
    notes: ['Необходимо заменить placeholders на подтверждённые данные бизнеса.', 'Отзывы и юридические сведения не создавались автоматически.'],
  };
}

export function validateAiWebsiteConcept(raw: unknown, prompt: string, answers: Partial<AiWebsiteAnswers> = {}): AiWebsiteConcept {
  const fallback = createFallbackAiWebsiteConcept(prompt, answers);
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return fallback;
  const source = raw as Record<string, unknown>;
  const business = source.business && typeof source.business === 'object' ? source.business as Record<string, unknown> : {};
  const site = source.site && typeof source.site === 'object' ? source.site as Record<string, unknown> : {};
  const theme = source.theme && typeof source.theme === 'object' ? source.theme as Record<string, unknown> : {};
  const contacts = source.contacts && typeof source.contacts === 'object' ? source.contacts as Record<string, unknown> : {};
  const siteType = siteTypeSet.has(String(site.type)) ? String(site.type) as AiWebsiteSiteType : fallback.site.type;
  const style = styleSet.has(String(theme.style)) ? String(theme.style) as AiWebsiteStyle : fallback.theme.style;
  const sections: AiWebsiteSection[] = Array.isArray(source.sections) ? source.sections.slice(0, 12).flatMap((item, index) => {
    if (!item || typeof item !== 'object') return [];
    const record = item as Record<string, unknown>;
    if (!sectionSet.has(String(record.type))) return [];
    return [{
      id: cleanText(record.id, `${record.type}-${index}`, 60).replace(/[^a-z0-9-]/gi, '-').toLowerCase(),
      type: String(record.type) as AiWebsiteSection['type'],
      title: cleanText(record.title, String(record.type), 100),
      subtitle: cleanText(record.subtitle, '', 220) || undefined,
      items: cleanItems(record.items, [], 8),
      visible: record.visible !== false,
    }];
  }) : [];
  return {
    version: 1,
    business: {
      name: cleanText(business.name, fallback.business.name, 90),
      type: cleanText(business.type, fallback.business.type, 120),
      city: cleanText(business.city, fallback.business.city, 80),
      audience: cleanText(business.audience, fallback.business.audience, 220),
      offer: cleanText(business.offer, fallback.business.offer, 320),
    },
    site: {
      type: siteType,
      title: cleanText(site.title, fallback.site.title, 150),
      subtitle: cleanText(site.subtitle, fallback.site.subtitle, 360),
      cta: cleanText(site.cta, fallback.site.cta, 60),
      secondaryCta: cleanText(site.secondaryCta, fallback.site.secondaryCta, 60),
    },
    theme: {
      style,
      mode: theme.mode === 'dark' ? 'dark' : theme.mode === 'light' ? 'light' : fallback.theme.mode,
      accent: hexPattern.test(String(theme.accent)) ? String(theme.accent) : fallback.theme.accent,
      background: hexPattern.test(String(theme.background)) ? String(theme.background) : fallback.theme.background,
      surface: hexPattern.test(String(theme.surface)) ? String(theme.surface) : fallback.theme.surface,
      radius: ['compact', 'medium', 'large'].includes(String(theme.radius)) ? String(theme.radius) as AiWebsiteConcept['theme']['radius'] : fallback.theme.radius,
      density: ['compact', 'comfortable', 'spacious'].includes(String(theme.density)) ? String(theme.density) as AiWebsiteConcept['theme']['density'] : fallback.theme.density,
    },
    sections: sections.length >= 3 ? sections : fallback.sections,
    services: cleanItems(source.services, fallback.services, 8),
    features: Array.isArray(source.features) ? source.features.slice(0, 8).map((item) => cleanText(item, '', 120)).filter(Boolean) : fallback.features,
    faq: Array.isArray(source.faq) ? source.faq.slice(0, 8).map((item) => {
      const record = item && typeof item === 'object' ? item as Record<string, unknown> : {};
      return { question: cleanText(record.question, 'Вопрос', 140), answer: cleanText(record.answer, 'Ответ уточняется.', 320) };
    }) : fallback.faq,
    contacts: {
      city: cleanText(contacts.city, fallback.contacts.city, 80),
      phoneLabel: cleanText(contacts.phoneLabel, fallback.contacts.phoneLabel, 100),
      emailLabel: cleanText(contacts.emailLabel, fallback.contacts.emailLabel, 100),
    },
    recommendedPackage: siteTypeSet.has(String(source.recommendedPackage)) ? String(source.recommendedPackage) as AiWebsiteSiteType : siteType,
    estimatedComplexity: ['low', 'medium', 'high'].includes(String(source.estimatedComplexity)) ? String(source.estimatedComplexity) as AiWebsiteConcept['estimatedComplexity'] : fallback.estimatedComplexity,
    notes: Array.isArray(source.notes) ? source.notes.slice(0, 6).map((item) => cleanText(item, '', 180)).filter(Boolean) : fallback.notes,
  };
}

export function getAiWebsitePackage(type: AiWebsiteSiteType) {
  const direction = priceDirections.find((item) => item.slug === 'websites');
  const item = direction?.packages.find((entry) => entry.id === type) || direction?.packages[0];
  return { id: item?.id || 'start', name: item?.name || 'Сайт для старта', price: item?.price || 'от 19 900 ₽' };
}

export function recommendAiWebsitePackage(concept: AiWebsiteConcept, answers: Partial<AiWebsiteAnswers> = {}) {
  const requirements = `${answers.offer || ''} ${answers.services || ''} ${answers.functions || ''}`.toLowerCase();
  const sectionTypes = new Set(concept.sections.filter((item) => item.visible).map((item) => item.type));
  let type: AiWebsiteSiteType = 'start';
  if (concept.site.type === 'web-service' || /личн(ый|ого) кабинет|роли пользователей|crm|веб-сервис|автоматизац/.test(requirements)) type = 'web-service';
  else if (concept.site.type === 'store' || /корзин|онлайн.?оплат|оформлени[ея] заказ|интернет-магазин/.test(requirements)) type = 'store';
  else if (concept.site.type === 'catalog' || sectionTypes.has('catalog') || /каталог|фильтр|поиск по товарам/.test(requirements)) type = 'catalog';
  else if (concept.site.type === 'managed' || /админк|систем[а-я ]+управлен|самостоятельно обновлять/.test(requirements)) type = 'managed';
  else if (concept.site.type === 'business' || concept.sections.filter((item) => item.visible).length >= 9) type = 'business';
  else if (concept.site.type === 'landing') type = 'landing';
  return getAiWebsitePackage(type);
}

export const aiWebsiteStyleLabels: Record<AiWebsiteStyle, string> = {
  modern: 'Современный', minimal: 'Минималистичный', premium: 'Премиальный', technology: 'Технологичный', warm: 'Тёплый', strict: 'Строгий', bright: 'Яркий', dark: 'Тёмный',
};

export const aiWebsiteSiteTypeLabels: Record<AiWebsiteSiteType, string> = {
  start: 'Сайт для старта', landing: 'Лендинг', managed: 'Сайт с системой управления', business: 'Бизнес-сайт', catalog: 'Сайт-каталог', store: 'Интернет-магазин', 'web-service': 'Индивидуальный веб-сервис',
};

export function createAiWebsiteSessionId() {
  const random = crypto.getRandomValues(new Uint32Array(2));
  return `SVAI-${random[0].toString(36)}${random[1].toString(36)}`.toUpperCase().slice(0, 24);
}

export function createAiWebsiteConceptId() {
  const random = crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().padStart(6, '0');
  return `SV-AI-${random.slice(-6)}`;
}

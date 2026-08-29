import { aiSectionTypes } from './componentCatalog';
import type { SitePlan, SitePlanPage, SitePlanSection } from './types';
import { normalizeSlug } from '../utils/id';

const sectionSet = new Set<string>(aiSectionTypes);
const unsafeMarkup = /<\/?(?:script|iframe|object|embed|style|link|meta)\b|javascript:|\bon\w+\s*=/gi;

export function sanitizeAiText(value: unknown, maxLength = 600) {
  return String(value ?? '').replace(unsafeMarkup, '').replace(/[<>]/g, '').replace(/\s+/g, ' ').trim().slice(0, maxLength);
}

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function normalizeItems(value: unknown) {
  if (!Array.isArray(value)) return undefined;
  return value.slice(0, 12).map((item) => Object.fromEntries(Object.entries(record(item)).slice(0, 8).map(([key, child]) => [sanitizeAiText(key, 40), sanitizeAiText(child, 280)])));
}

function normalizeSection(value: unknown): SitePlanSection | null {
  const source = record(value);
  const type = sanitizeAiText(source.type, 40);
  if (!sectionSet.has(type)) return null;
  return {
    type: type as SitePlanSection['type'],
    title: sanitizeAiText(source.title, 140) || undefined,
    text: sanitizeAiText(source.text, 700) || undefined,
    items: normalizeItems(source.items),
  };
}

function normalizePage(value: unknown, index: number): SitePlanPage {
  const source = record(value);
  const name = sanitizeAiText(source.name, 80) || `Страница ${index + 1}`;
  const sections = (Array.isArray(source.sections) ? source.sections : []).map(normalizeSection).filter((item): item is SitePlanSection => Boolean(item));
  const safeSections = sections.length ? sections : [{ type: 'Hero' as const, title: name }, { type: 'Contact' as const }, { type: 'Footer' as const }];
  return {
    name,
    slug: index === 0 ? '' : normalizeSlug(sanitizeAiText(source.slug, 100) || name),
    title: sanitizeAiText(source.title, 100) || name,
    metaDescription: sanitizeAiText(source.metaDescription, 180) || `${name}: информация, услуги и контакты.`,
    sections: safeSections.slice(0, 18),
  };
}

export function validateSitePlan(value: unknown): SitePlan {
  const source = record(value);
  const rawPages = Array.isArray(source.pages) ? source.pages : [];
  if (!rawPages.length) throw new Error('ИИ не предложил ни одной страницы.');
  const projectTypes = ['landing', 'multipage', 'portfolio', 'catalog', 'services'];
  const visualStyles = ['minimal', 'technology', 'premium', 'bright', 'dark', 'editorial', 'brutalist'];
  return {
    projectType: projectTypes.includes(String(source.projectType)) ? source.projectType as SitePlan['projectType'] : 'services',
    businessName: sanitizeAiText(source.businessName, 100) || 'Новый проект',
    businessSummary: sanitizeAiText(source.businessSummary, 500),
    audience: sanitizeAiText(source.audience, 240) || 'Клиенты проекта',
    tone: sanitizeAiText(source.tone, 80) || 'Понятный и деловой',
    visualStyle: visualStyles.includes(String(source.visualStyle)) ? source.visualStyle as SitePlan['visualStyle'] : 'minimal',
    accentColor: /^#[0-9a-f]{6}$/i.test(String(source.accentColor || '')) ? String(source.accentColor) : undefined,
    pages: rawPages.slice(0, 8).map(normalizePage),
  };
}


import { studioComponentNames } from '../editor/componentCatalog';
import type { SitePlanSectionType } from './types';

export type AiComponentMetadata = {
  purpose: string;
  requiredProps: string[];
  optionalProps: string[];
  allowedChildren: string[];
  maximumSensibleCount: number;
};

export const aiSectionTypes: SitePlanSectionType[] = [
  'Header', 'Hero', 'Services', 'Features', 'Pricing', 'Portfolio', 'Gallery', 'Steps',
  'Stats', 'Reviews', 'Team', 'FAQ', 'Contact', 'LeadForm', 'MapPlaceholder', 'Footer',
];

export const aiComponentCatalog: Record<SitePlanSectionType, AiComponentMetadata> = {
  Header: { purpose: 'Навигация и главное действие', requiredProps: ['brand'], optionalProps: ['links', 'ctaLabel', 'ctaHref', 'variant'], allowedChildren: [], maximumSensibleCount: 1 },
  Hero: { purpose: 'Первый экран с H1 и CTA', requiredProps: ['title', 'text'], optionalProps: ['eyebrow', 'buttonLabel', 'buttonHref', 'image', 'variant', 'align'], allowedChildren: [], maximumSensibleCount: 1 },
  Services: { purpose: 'Перечень услуг', requiredProps: ['title', 'items'], optionalProps: ['eyebrow', 'variant'], allowedChildren: [], maximumSensibleCount: 2 },
  Features: { purpose: 'Преимущества или особенности', requiredProps: ['title', 'items'], optionalProps: ['eyebrow', 'text', 'variant'], allowedChildren: [], maximumSensibleCount: 2 },
  Pricing: { purpose: 'Тарифы и цены', requiredProps: ['title', 'items'], optionalProps: ['eyebrow', 'variant'], allowedChildren: [], maximumSensibleCount: 1 },
  Portfolio: { purpose: 'Работы и проекты', requiredProps: ['title', 'items'], optionalProps: ['eyebrow', 'variant'], allowedChildren: [], maximumSensibleCount: 1 },
  Gallery: { purpose: 'Галерея изображений', requiredProps: ['title', 'images'], optionalProps: ['eyebrow', 'variant'], allowedChildren: [], maximumSensibleCount: 1 },
  Steps: { purpose: 'Последовательность работы', requiredProps: ['title', 'items'], optionalProps: ['eyebrow'], allowedChildren: [], maximumSensibleCount: 1 },
  Stats: { purpose: 'Проверяемые показатели', requiredProps: ['title', 'items'], optionalProps: [], allowedChildren: [], maximumSensibleCount: 1 },
  Reviews: { purpose: 'Отзывы клиентов', requiredProps: ['title', 'items'], optionalProps: ['eyebrow', 'variant'], allowedChildren: [], maximumSensibleCount: 1 },
  Team: { purpose: 'Команда проекта', requiredProps: ['title', 'items'], optionalProps: ['eyebrow'], allowedChildren: [], maximumSensibleCount: 1 },
  FAQ: { purpose: 'Частые вопросы и ответы', requiredProps: ['title', 'items'], optionalProps: [], allowedChildren: [], maximumSensibleCount: 1 },
  Contact: { purpose: 'Финальный CTA', requiredProps: ['title', 'text', 'buttonLabel', 'buttonHref'], optionalProps: ['variant'], allowedChildren: [], maximumSensibleCount: 1 },
  LeadForm: { purpose: 'Демонстрационная форма обращения', requiredProps: ['title', 'text'], optionalProps: ['buttonLabel', 'actionHref'], allowedChildren: [], maximumSensibleCount: 1 },
  MapPlaceholder: { purpose: 'Локация и адрес', requiredProps: ['title', 'address'], optionalProps: ['text'], allowedChildren: [], maximumSensibleCount: 1 },
  Footer: { purpose: 'Подвал и дополнительная навигация', requiredProps: ['brand'], optionalProps: ['text', 'links', 'variant'], allowedChildren: [], maximumSensibleCount: 1 },
};

export const aiAllowedComponentNames = new Set<string>(studioComponentNames);


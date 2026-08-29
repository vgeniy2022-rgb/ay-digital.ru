import type { ComponentData, Data } from '@puckeditor/core';
import { defaultStudioTheme } from '../schema/defaults';
import { SITE_BUILDER_SCHEMA_VERSION, type SiteBuilderProject, type StudioPage, type StudioThemeTokens } from '../schema/types';
import { createStudioId, normalizeSlug } from '../utils/id';
import type { SitePlan, SitePlanSection } from './types';

function block(type: string, props: Record<string, unknown>): ComponentData {
  return { type, props: { id: createStudioId('block'), responsive: {}, ...props } };
}

function sectionToBlock(section: SitePlanSection, plan: SitePlan): ComponentData {
  const brand = plan.businessName;
  const common = { idAnchor: section.type.toLowerCase() };
  switch (section.type) {
    case 'Header': return block('Header', { brand, links: [{ label: 'Услуги', href: '#services' }, { label: 'О проекте', href: '#features' }, { label: 'Контакты', href: '#contact' }], ctaLabel: 'Связаться', ctaHref: '#contact', variant: 'clean' });
    case 'Hero': return block('Hero', { ...common, eyebrow: plan.tone, title: section.title || `${brand}: понятно о главном`, text: section.text || plan.businessSummary, buttonLabel: 'Обсудить задачу', buttonHref: '#contact', image: '', variant: plan.visualStyle === 'minimal' ? 'minimal' : 'split', align: 'left' });
    case 'Services': return block('Services', { ...common, eyebrow: 'Услуги', title: section.title || 'С чем можно обратиться', variant: 'cards', items: section.items?.length ? section.items : [{ title: 'Основная услуга', text: 'Решение под задачу клиента.', price: 'По запросу' }, { title: 'Консультация', text: 'Помощь с выбором следующего шага.', price: 'По запросу' }, { title: 'Поддержка', text: 'Развитие после запуска.', price: 'По запросу' }] });
    case 'Features': return block('Features', { ...common, eyebrow: 'Подход', title: section.title || 'Почему с нами удобно', text: section.text || 'Понятный процесс и внимание к задаче.', variant: 'cards', items: section.items?.length ? section.items : [{ title: 'Личная работа', text: 'Без лишних посредников.' }, { title: 'Понятные этапы', text: 'Вы знаете, что происходит дальше.' }, { title: 'Связь после запуска', text: 'Можно вернуться с вопросами.' }] });
    case 'Pricing': return block('Pricing', { ...common, eyebrow: 'Стоимость', title: section.title || 'Форматы работы', variant: 'cards', items: section.items?.length ? section.items : [{ title: 'Старт', price: 'По запросу', features: 'Состав уточняется после знакомства с задачей' }, { title: 'Расширенный', price: 'По запросу', features: 'Для более объёмных проектов' }] });
    case 'Portfolio': return block('Portfolio', { ...common, eyebrow: 'Работы', title: section.title || 'Примеры проектов', variant: 'editorial', items: section.items?.length ? section.items : [{ title: 'Проект 01', category: 'Пример' }, { title: 'Проект 02', category: 'Пример' }] });
    case 'Gallery': return block('Gallery', { ...common, eyebrow: 'Галерея', title: section.title || 'Фотографии проекта', variant: 'grid', images: [] });
    case 'Steps': return block('Steps', { ...common, eyebrow: 'Процесс', title: section.title || 'Как проходит работа', items: (section.items?.length ? section.items.map((item) => ({ value: item.value || item.title || 'Шаг' })) : ['Знакомство', 'Детали', 'Работа', 'Проверка', 'Результат'].map((value) => ({ value }))) });
    case 'Stats': return block('Stats', { ...common, title: section.title || 'Проект в цифрах', items: section.items?.length ? section.items : [{ value: '1', label: 'точка контакта' }, { value: '100%', label: 'понятный процесс' }] });
    case 'Reviews': return block('Reviews', { ...common, eyebrow: 'Отзывы', title: section.title || 'Что говорят клиенты', variant: 'quotes', items: section.items?.length ? section.items : [{ author: 'Клиент', text: 'Добавьте сюда настоящий отзыв после согласования.' }] });
    case 'Team': return block('Team', { ...common, eyebrow: 'Команда', title: section.title || 'Кто работает над проектом', items: section.items || [] });
    case 'FAQ': return block('FAQ', { ...common, title: section.title || 'Частые вопросы', items: section.items?.length ? section.items : [{ question: 'С чего начать?', answer: 'Опишите задачу и желаемый результат.' }, { question: 'Как узнать стоимость?', answer: 'Итоговая стоимость определяется после уточнения объёма и сроков.' }, { question: 'Можно ли работать удалённо?', answer: 'Да, если формат задачи это позволяет.' }, { question: 'Какие сроки?', answer: 'Сроки согласуются до начала работы.' }, { question: 'Можно внести изменения?', answer: 'Да, порядок правок обсуждается заранее.' }] });
    case 'LeadForm': return block('LeadForm', { ...common, title: section.title || 'Оставьте обращение', text: section.text || 'Опишите задачу удобным способом.', buttonLabel: 'Связаться', actionHref: '#contact' });
    case 'MapPlaceholder': return block('MapPlaceholder', { ...common, title: section.title || 'Где мы работаем', address: 'Владивосток', text: section.text || 'Точный формат встречи согласуется заранее.' });
    case 'Contact': return block('Contact', { ...common, title: section.title || 'Обсудим вашу задачу?', text: section.text || 'Расскажите, какой результат нужен. Ответим и предложим следующий шаг.', buttonLabel: 'Связаться', buttonHref: '#contact', variant: 'panel' });
    case 'Footer': return block('Footer', { brand, text: `${brand}. Информация и контакты.`, links: [{ label: 'Главная', href: '/' }, { label: 'Контакты', href: '#contact' }], variant: plan.visualStyle === 'dark' ? 'dark' : 'light' });
  }
}

function themeFor(plan: SitePlan): StudioThemeTokens {
  const palettes: Record<SitePlan['visualStyle'], Partial<StudioThemeTokens['colors']>> = {
    minimal: { primary: '#1769ff', accent: '#13a56f' }, technology: { primary: '#2563eb', accent: '#06b6d4', background: '#f3f7fb' },
    premium: { primary: '#171717', accent: '#a67c37', background: '#f7f6f3' }, bright: { primary: '#e4488f', accent: '#12a594', background: '#fff9f1' },
    dark: { primary: '#72a7ff', accent: '#35d39a', background: '#0d1117', surface: '#171c24', text: '#f3f6fa', muted: '#aab4c2', border: '#303846' },
    editorial: { primary: '#1e293b', accent: '#d94f3d', background: '#f7f4ef' }, brutalist: { primary: '#111111', accent: '#ffea00', background: '#ffffff', border: '#111111' },
  };
  const colors = { ...defaultStudioTheme.colors, ...palettes[plan.visualStyle] };
  if (plan.accentColor) colors.primary = plan.accentColor;
  return { ...defaultStudioTheme, colors, buttonPreset: plan.visualStyle === 'brutalist' ? 'outline' : plan.visualStyle === 'minimal' ? 'soft' : 'solid' };
}

export function sitePlanToProject(plan: SitePlan): SiteBuilderProject {
  const now = new Date().toISOString();
  const pages: StudioPage[] = plan.pages.map((page, index) => {
    const content = page.sections.map((section) => sectionToBlock(section, plan));
    return { id: createStudioId('page'), name: page.name, slug: index === 0 ? '' : normalizeSlug(page.slug || page.name), title: page.title, metaDescription: page.metaDescription, noindex: false, isHome: index === 0, order: index, data: { content, root: { props: { title: page.title } } } as Data };
  });
  return { schemaVersion: SITE_BUILDER_SCHEMA_VERSION, id: createStudioId('project'), name: plan.businessName, templateId: 'ai-generated', createdAt: now, updatedAt: now, activePageId: pages[0].id, theme: themeFor(plan), pages, assets: [], settings: { defaultBreakpoint: 'desktop', language: 'ru' } };
}


import type { Data } from '@puckeditor/core';
import { defaultStudioTheme } from './defaults';
import { SITE_BUILDER_SCHEMA_VERSION, type SiteBuilderProject, type StudioPage } from './types';
import { createStudioId, normalizeSlug } from '../utils/id';

type LegacyDraft = {
  brand?: string;
  eyebrow?: string;
  title?: string;
  description?: string;
  buttonText?: string;
  heroImage?: string;
  aboutTitle?: string;
  aboutText?: string;
  showAbout?: boolean;
  showServices?: boolean;
  showContact?: boolean;
  services?: Array<{ title?: string; text?: string; price?: string }>;
  theme?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function normalizePage(page: Partial<StudioPage>, index: number): StudioPage {
  const name = typeof page.name === 'string' && page.name.trim() ? page.name.trim() : `Страница ${index + 1}`;
  const data = isRecord(page.data) ? page.data as Data : { content: [], root: { props: {} } };
  const isHome = Boolean(page.isHome);
  return {
    id: typeof page.id === 'string' ? page.id : createStudioId('page'),
    name,
    slug: isHome ? '' : normalizeSlug(typeof page.slug === 'string' ? page.slug : name),
    title: typeof page.title === 'string' ? page.title : name,
    metaDescription: typeof page.metaDescription === 'string' ? page.metaDescription : '',
    socialImageAssetId: typeof page.socialImageAssetId === 'string' ? page.socialImageAssetId : undefined,
    noindex: Boolean(page.noindex),
    isHome,
    order: Number.isFinite(page.order) ? Number(page.order) : index,
    data,
  };
}

export function migrateProject(input: unknown): SiteBuilderProject {
  if (!isRecord(input)) throw new Error('Файл проекта не содержит корректный JSON-объект.');
  const version = Number(input.schemaVersion || 0);
  if (version > SITE_BUILDER_SCHEMA_VERSION) {
    throw new Error(`Проект создан в более новой версии схемы (${version}). Обновите SITEVL Studio.`);
  }
  if (version !== SITE_BUILDER_SCHEMA_VERSION) {
    throw new Error('Версия схемы проекта не поддерживается. Используйте legacy-импорт для старого конструктора.');
  }
  const rawPages = Array.isArray(input.pages) ? input.pages : [];
  if (rawPages.length === 0) throw new Error('В проекте должна быть хотя бы одна страница.');
  const pages = rawPages.map((page, index) => normalizePage(isRecord(page) ? page : {}, index));
  if (!pages.some((page) => page.isHome)) pages[0].isHome = true;
  const now = new Date().toISOString();
  const project = input as unknown as SiteBuilderProject;
  return {
    schemaVersion: SITE_BUILDER_SCHEMA_VERSION,
    id: typeof project.id === 'string' ? project.id : createStudioId('project'),
    name: typeof project.name === 'string' && project.name.trim() ? project.name.trim() : 'Проект SITEVL',
    templateId: typeof project.templateId === 'string' ? project.templateId : 'imported',
    createdAt: typeof project.createdAt === 'string' ? project.createdAt : now,
    updatedAt: now,
    activePageId: pages.some((page) => page.id === project.activePageId) ? project.activePageId : pages[0].id,
    theme: isRecord(project.theme) ? { ...defaultStudioTheme, ...project.theme } : defaultStudioTheme,
    pages,
    assets: Array.isArray(project.assets) ? project.assets : [],
    settings: { defaultBreakpoint: project.settings?.defaultBreakpoint || 'desktop', language: 'ru' },
  };
}

export function convertLegacyDraftToProject(raw: string): SiteBuilderProject {
  const stored = JSON.parse(raw) as { draft?: LegacyDraft };
  const draft = stored.draft;
  if (!draft) throw new Error('Legacy-черновик не содержит данных.');
  const projectId = createStudioId('project');
  const pageId = createStudioId('page');
  const content: Data['content'] = [
    {
      type: 'Header',
      props: { id: createStudioId('block'), brand: draft.brand || 'Мой проект', ctaLabel: draft.buttonText || 'Связаться', ctaHref: '#contact', variant: 'clean' },
    },
    {
      type: 'Hero',
      props: {
        id: createStudioId('block'), eyebrow: draft.eyebrow || '', title: draft.title || 'Заголовок проекта',
        text: draft.description || '', buttonLabel: draft.buttonText || 'Связаться', buttonHref: '#contact',
        image: draft.heroImage || '', variant: 'image', align: 'left',
      },
    },
  ];
  if (draft.showServices !== false) {
    content.push({
      type: 'Services',
      props: {
        id: createStudioId('block'), eyebrow: 'Услуги', title: 'Что можно выбрать', variant: 'cards',
        items: (draft.services || []).map((item) => ({ title: item.title || 'Услуга', text: item.text || '', price: item.price || '' })),
      },
    });
  }
  if (draft.showAbout !== false) {
    content.push({ type: 'Features', props: { id: createStudioId('block'), eyebrow: 'О проекте', title: draft.aboutTitle || 'О нас', text: draft.aboutText || '', variant: 'split', items: [] } });
  }
  if (draft.showContact !== false) {
    content.push({ type: 'Contact', props: { id: createStudioId('block'), title: 'Давайте обсудим задачу', text: draft.description || '', buttonLabel: draft.buttonText || 'Связаться', buttonHref: '#contact', variant: 'panel' } });
  }
  content.push({ type: 'Footer', props: { id: createStudioId('block'), brand: draft.brand || 'Мой проект', text: 'Спасибо, что посмотрели проект.', variant: 'dark' } });

  const now = new Date().toISOString();
  return {
    schemaVersion: SITE_BUILDER_SCHEMA_VERSION,
    id: projectId,
    name: draft.brand || 'Legacy-проект',
    templateId: 'legacy',
    createdAt: now,
    updatedAt: now,
    activePageId: pageId,
    theme: {
      ...defaultStudioTheme,
      colors: {
        ...defaultStudioTheme.colors,
        primary: draft.theme === 'green' ? '#0f9f6e' : draft.theme === 'coral' ? '#e45b48' : draft.theme === 'ink' ? '#111827' : '#1769ff',
      },
    },
    pages: [{
      id: pageId, name: 'Главная', slug: '', title: draft.title || draft.brand || 'Главная',
      metaDescription: draft.description || '', noindex: false, isHome: true, order: 0,
      data: { content, root: { props: { title: draft.title || draft.brand || 'Главная' } } },
    }],
    assets: [],
    settings: { defaultBreakpoint: 'desktop', language: 'ru' },
  };
}

import type { ComponentData } from '@puckeditor/core';
import type { SiteBuilderProject } from '../schema/types';
import type { AiAuditFinding, AiAuditResult, AiThemeProposal } from './types';

function propsOf(block: ComponentData) { return (block.props || {}) as Record<string, unknown>; }

export function auditStudioProject(project: SiteBuilderProject): AiAuditResult {
  const blocks = project.pages.flatMap((page) => page.data.content);
  const headings = blocks.flatMap((block) => {
    const props = propsOf(block);
    return [props.title, props.text && block.type === 'Heading' ? props.text : undefined].filter((value): value is string => typeof value === 'string' && Boolean(value.trim()));
  });
  const duplicates = headings.filter((value, index) => headings.indexOf(value) !== index).length;
  const metrics = {
    pages: project.pages.length,
    sections: blocks.length,
    h1: blocks.filter((block) => block.type === 'Hero' || (block.type === 'Heading' && propsOf(block).level === 'h1')).length,
    cta: blocks.filter((block) => ['Button', 'Contact', 'LeadForm'].includes(block.type)).length,
    missingAlt: blocks.filter((block) => block.type === 'Image' && !String(propsOf(block).alt || '').trim()).length,
    emptyLinks: blocks.filter((block) => ['Button', 'Contact', 'LeadForm'].includes(block.type) && !String(propsOf(block).href || propsOf(block).buttonHref || propsOf(block).actionHref || '').trim()).length,
    duplicateHeadings: duplicates,
  };
  const findings: AiAuditFinding[] = [];
  if (!project.pages.every((page) => page.title.trim() && page.metaDescription.trim())) findings.push({ severity: 'critical', category: 'SEO', title: 'Не все страницы заполнены для поиска', detail: 'Добавьте уникальные SEO-заголовки и мета-описания.' });
  if (metrics.missingAlt) findings.push({ severity: 'recommendation', category: 'Доступность', title: 'Есть изображения без alt-текста', detail: `Найдено: ${metrics.missingAlt}. Опишите смысл изображения без перечисления ключевых слов.` });
  if (metrics.emptyLinks) findings.push({ severity: 'critical', category: 'CTA', title: 'Есть действия без ссылки', detail: `Проверьте ${metrics.emptyLinks} кнопок или контактных блоков.` });
  if (metrics.duplicateHeadings) findings.push({ severity: 'recommendation', category: 'Контент', title: 'Повторяются заголовки', detail: `Найдено повторов: ${metrics.duplicateHeadings}. Уточните смысл каждого раздела.` });
  if (metrics.sections > project.pages.length * 14) findings.push({ severity: 'recommendation', category: 'Структура', title: 'Страницы могут быть перегружены', detail: 'Проверьте, можно ли объединить близкие по смыслу секции.' });
  if (!findings.length) findings.push({ severity: 'good', category: 'Структура', title: 'Базовая структура выглядит цельно', detail: 'Критичных детерминированных проблем не найдено.' });
  return { metrics, findings };
}

export function proposeTheme(project: SiteBuilderProject, intent: string): AiThemeProposal {
  const lower = intent.toLowerCase();
  const premium = /преми|спокой|дорог/.test(lower);
  const dark = /т[её]мн/.test(lower);
  const minimal = /минимал|проще|чист/.test(lower);
  const colors = dark ? { ...project.theme.colors, primary: '#79a8ff', accent: '#42d6a4', background: '#0e1117', surface: '#181d25', text: '#f4f6f8', muted: '#a6b0bf', border: '#303846' }
    : premium ? { ...project.theme.colors, primary: '#181818', accent: '#9b7436', background: '#f6f5f2', surface: '#ffffff', text: '#171717', muted: '#696969', border: '#dedbd4' }
      : { ...project.theme.colors, primary: '#1769ff', accent: '#13a56f', background: '#f5f7fa', surface: '#ffffff', text: '#111827', muted: '#667085', border: '#d9dee7' };
  return { label: dark ? 'Тёмная технологичная тема' : premium ? 'Спокойная премиальная тема' : minimal ? 'Чистая минималистичная тема' : 'Сбалансированная тема', description: 'Предложение меняет только существующие ThemeTokens.', changes: ['Основной цвет', 'Акцентный цвет', 'Фон', 'Поверхности', 'Цвет текста', 'Стиль кнопок'], theme: { ...project.theme, colors, buttonPreset: minimal ? 'soft' : premium ? 'outline' : 'solid' } };
}


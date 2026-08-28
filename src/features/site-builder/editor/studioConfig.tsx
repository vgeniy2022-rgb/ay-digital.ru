/* eslint-disable react-refresh/only-export-components */
import type { ReactNode } from 'react';
import type { Config, RichText, Slot } from '@puckeditor/core';
import { Check, Circle, Code2, Globe2, Mail, MapPin, Play, ShieldCheck, Sparkles, Star, Zap } from 'lucide-react';
import { AssetPickerField, resolveStudioAsset } from '../assets/AssetContext';
import { ResponsiveField } from './ResponsiveField';
import { createResponsiveCss, themeToCssVariables } from '../responsive/styleResolver';
import { defaultStudioTheme } from '../schema/defaults';
import type { ResponsiveSettings, StudioThemeTokens } from '../schema/types';
import { safeStudioHref } from '../utils/url';
import { studioComponentGroups } from './componentCatalog';
import { studioComponentLabels, studioRu, studioValueLabels, studioVisibleLabelTranslations } from '../i18n/ru';
import '../styles/renderer.css';

type BaseProps = { responsive?: ResponsiveSettings; idAnchor?: string };
type LinkItem = { label: string; href: string };
type TextItem = { title: string; text: string };
type ServiceItem = TextItem & { price: string };
type ReviewItem = { author: string; text: string };
type PriceItem = { title: string; price: string; features: string };
type PortfolioItem = { title: string; category: string };
type FaqItem = { question: string; answer: string };

export type StudioComponentProps = {
  Section: BaseProps & { children: Slot; tone: 'default' | 'muted' | 'contrast'; minHeight: number };
  Container: BaseProps & { children: Slot; width: 'narrow' | 'default' | 'wide' };
  VerticalStack: BaseProps & { children: Slot; gap: number; align: 'stretch' | 'start' | 'center' | 'end' };
  HorizontalStack: BaseProps & { children: Slot; gap: number; justify: 'start' | 'center' | 'end' | 'space-between'; wrap: 'wrap' | 'nowrap' };
  Grid: BaseProps & { children: Slot; columns: number; gap: number };
  Columns: BaseProps & { children: Slot; ratio: '1-1' | '2-1' | '1-2'; gap: number };
  Card: BaseProps & { children: Slot; tone: 'surface' | 'muted' | 'contrast'; padding: number };
  Spacer: BaseProps & { size: number };
  Divider: BaseProps & { color: string; width: number };
  Heading: BaseProps & { text: string; level: 'h1' | 'h2' | 'h3'; align: 'left' | 'center' | 'right'; color: string };
  RichText: BaseProps & { content: RichText; align: 'left' | 'center' | 'right' };
  Button: BaseProps & { label: string; href: string; variant: 'primary' | 'secondary' | 'ghost'; fullWidth: 'yes' | 'no' };
  Image: BaseProps & { src: string; alt: string; ratio: 'auto' | '16-9' | '4-3' | '1-1'; radius: number; objectPosition: string };
  Icon: BaseProps & { icon: 'sparkles' | 'shield' | 'globe' | 'code' | 'zap' | 'star'; size: number; color: string };
  Video: BaseProps & { src: string; poster: string; caption: string };
  Badge: BaseProps & { text: string; tone: 'primary' | 'success' | 'neutral' };
  List: BaseProps & { items: Array<{ text: string }>; marker: 'check' | 'dot' | 'number' };
  Quote: BaseProps & { text: string; author: string };
  Header: BaseProps & { brand: string; links: LinkItem[]; ctaLabel: string; ctaHref: string; variant: 'clean' | 'floating' | 'transparent' | 'minimal' };
  Hero: BaseProps & { eyebrow: string; title: string; text: string; buttonLabel: string; buttonHref: string; image: string; variant: 'image' | 'split' | 'cover' | 'minimal'; align: 'left' | 'center' };
  Services: BaseProps & { eyebrow: string; title: string; items: ServiceItem[]; variant: 'cards' | 'editorial' | 'compact' };
  Features: BaseProps & { eyebrow: string; title: string; text: string; items: TextItem[]; variant: 'cards' | 'split' | 'list' };
  Pricing: BaseProps & { eyebrow: string; title: string; items: PriceItem[]; variant: 'cards' | 'columns' | 'compact' };
  Portfolio: BaseProps & { eyebrow: string; title: string; items: PortfolioItem[]; variant: 'mosaic' | 'editorial' | 'grid' };
  Gallery: BaseProps & { eyebrow: string; title: string; images: Array<{ value: string }>; variant: 'grid' | 'masonry' | 'strip' };
  Steps: BaseProps & { eyebrow: string; title: string; items: Array<{ value: string }> };
  Stats: BaseProps & { title: string; items: Array<{ value: string; label: string }> };
  Reviews: BaseProps & { eyebrow: string; title: string; items: ReviewItem[]; variant: 'quotes' | 'cards' | 'featured' };
  Team: BaseProps & { eyebrow: string; title: string; items: Array<{ name: string; role: string; image: string }> };
  FAQ: BaseProps & { title: string; items: FaqItem[] };
  Contact: BaseProps & { title: string; text: string; buttonLabel: string; buttonHref: string; variant: 'panel' | 'contrast' | 'minimal' };
  LeadForm: BaseProps & { title: string; text: string; buttonLabel: string; actionHref: string };
  MapPlaceholder: BaseProps & { title: string; address: string; text: string };
  Footer: BaseProps & { brand: string; text: string; links: LinkItem[]; variant: 'dark' | 'light' | 'minimal' };
};

type StudioRootProps = { title: string };
type StudioMetadata = { theme?: StudioThemeTokens; assetUrls?: Record<string, string> };

const responsiveField = {
  type: 'custom' as const,
  label: 'Адаптивность',
  render: ({ value, onChange, readOnly }: { value?: ResponsiveSettings; onChange: (value: ResponsiveSettings) => void; readOnly?: boolean }) => <ResponsiveField value={value} onChange={onChange} readOnly={readOnly} />,
};

const assetField = {
  type: 'custom' as const,
  label: 'Изображение',
  render: ({ value, onChange, readOnly }: { value?: string; onChange: (value: string) => void; readOnly?: boolean }) => <AssetPickerField value={value} onChange={onChange} readOnly={readOnly} />,
};

const baseFields = {
  idAnchor: { type: 'text' as const, label: 'Якорь / ID', placeholder: 'section-name' },
  responsive: responsiveField,
};

const linkArrayField = {
  type: 'array' as const,
  label: 'Ссылки',
  arrayFields: {
    label: { type: 'text' as const, label: 'Название' },
    href: { type: 'text' as const, label: 'Ссылка' },
  },
  defaultItemProps: { label: 'Ссылка', href: '#' },
  getItemSummary: (item: LinkItem) => item.label,
};

const textItemArrayField = {
  type: 'array' as const,
  label: 'Элементы',
  arrayFields: {
    title: { type: 'text' as const, label: 'Название' },
    text: { type: 'textarea' as const, label: 'Описание' },
  },
  defaultItemProps: { title: 'Новый пункт', text: 'Короткое описание.' },
  getItemSummary: (item: TextItem) => item.title,
};

const serviceArrayField = {
  type: 'array' as const,
  label: 'Услуги',
  arrayFields: {
    title: { type: 'text' as const, label: 'Название' },
    text: { type: 'textarea' as const, label: 'Описание' },
    price: { type: 'text' as const, label: 'Цена' },
  },
  defaultItemProps: { title: 'Новая услуга', text: 'Что получает клиент.', price: 'по запросу' },
  getItemSummary: (item: ServiceItem) => item.title,
};

function metadataOf(puck: { metadata: Record<string, unknown> }) {
  return puck.metadata as StudioMetadata;
}

function ResponsiveCss({ id, responsive, theme }: { id: string; responsive?: ResponsiveSettings; theme: StudioThemeTokens }) {
  const css = createResponsiveCss(id, responsive, theme);
  return css ? <style>{css}</style> : null;
}

function responsiveClass(id: string, className = '') {
  return `${className} sv-responsive-${id.replace(/[^a-z0-9_-]/gi, '')}`.trim();
}

function sectionId(value?: string) {
  return value?.replace(/[^a-z0-9_-]/gi, '') || undefined;
}

function iconFor(name: StudioComponentProps['Icon']['icon'], size: number) {
  const props = { size, strokeWidth: 1.8, 'aria-hidden': true };
  if (name === 'shield') return <ShieldCheck {...props} />;
  if (name === 'globe') return <Globe2 {...props} />;
  if (name === 'code') return <Code2 {...props} />;
  if (name === 'zap') return <Zap {...props} />;
  if (name === 'star') return <Star {...props} />;
  return <Sparkles {...props} />;
}

export const studioConfig: Config<StudioComponentProps, StudioRootProps> = {
  categories: {
    layout: { title: studioRu.categories.layout, components: [...studioComponentGroups.layout], defaultExpanded: true },
    basic: { title: studioRu.categories.basic, components: [...studioComponentGroups.basic], defaultExpanded: true },
    business: { title: studioRu.categories.business, components: [...studioComponentGroups.business], defaultExpanded: true },
  },
  root: {
    fields: { title: { type: 'text', label: 'Название страницы', contentEditable: false } },
    defaultProps: { title: 'Страница SITEVL' },
    render: ({ children, puck }) => {
      const metadata = metadataOf(puck);
      return <div className="sv-site" style={themeToCssVariables(metadata.theme || defaultStudioTheme)}>{children}</div>;
    },
  },
  components: {
    Section: {
      label: studioComponentLabels.Section,
      fields: { ...baseFields, tone: { type: 'select', label: 'Фон', options: [{ label: 'Обычный', value: 'default' }, { label: 'Мягкий', value: 'muted' }, { label: 'Контрастный', value: 'contrast' }] }, minHeight: { type: 'number', label: 'Мин. высота', min: 0, max: 1200 }, children: { type: 'slot', allow: ['Container', 'VerticalStack', 'HorizontalStack', 'Grid', 'Columns', 'Card', 'Heading', 'RichText', 'Button', 'Image'] } },
      defaultProps: { children: [], tone: 'default', minHeight: 0, responsive: {}, idAnchor: '' },
      render: ({ id, idAnchor, tone, minHeight, responsive, children, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, `sv-section sv-tone-${tone}`)} style={{ minHeight }}>{children({ minEmptyHeight: 96 })}</section></>,
    },
    Container: {
      label: studioComponentLabels.Container,
      fields: { ...baseFields, width: { type: 'select', label: 'Ширина', options: [{ label: 'Узкая', value: 'narrow' }, { label: 'Обычная', value: 'default' }, { label: 'Широкая', value: 'wide' }] }, children: { type: 'slot', allow: ['VerticalStack', 'HorizontalStack', 'Grid', 'Columns', 'Card', 'Heading', 'RichText', 'Button', 'Image', 'Badge', 'List', 'Quote'] } },
      defaultProps: { children: [], width: 'default', responsive: {}, idAnchor: '' },
      render: ({ id, idAnchor, width, responsive, children, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><div id={sectionId(idAnchor)} className={responsiveClass(id, `sv-container sv-container-${width}`)}>{children({ minEmptyHeight: 72 })}</div></>,
    },
    VerticalStack: {
      label: studioComponentLabels.VerticalStack,
      fields: { ...baseFields, gap: { type: 'number', label: 'Интервал', min: 0, max: 120 }, align: { type: 'select', label: 'Выравнивание', options: ['stretch', 'start', 'center', 'end'].map((value) => ({ label: studioValueLabels[value], value })) }, children: { type: 'slot', allow: ['VerticalStack', 'HorizontalStack', 'Grid', 'Columns', 'Card', 'Heading', 'RichText', 'Button', 'Image', 'Icon', 'Badge', 'List', 'Quote', 'Spacer', 'Divider'] } },
      defaultProps: { children: [], gap: 24, align: 'stretch', responsive: {}, idAnchor: '' },
      render: ({ id, idAnchor, gap, align, responsive, children, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><div id={sectionId(idAnchor)} className={responsiveClass(id, 'sv-stack sv-stack-vertical')} style={{ gap, alignItems: align }}>{children({ minEmptyHeight: 56 })}</div></>,
    },
    HorizontalStack: {
      label: studioComponentLabels.HorizontalStack,
      fields: { ...baseFields, gap: { type: 'number', label: 'Интервал', min: 0, max: 120 }, justify: { type: 'select', label: 'Распределение', options: ['start', 'center', 'end', 'space-between'].map((value) => ({ label: studioValueLabels[value], value })) }, wrap: { type: 'radio', label: 'Перенос', options: [{ label: 'Переносить', value: 'wrap' }, { label: 'В одну строку', value: 'nowrap' }] }, children: { type: 'slot', allow: ['Card', 'Heading', 'RichText', 'Button', 'Image', 'Icon', 'Badge', 'List', 'Quote', 'Spacer', 'Divider'] } },
      defaultProps: { children: [], gap: 20, justify: 'start', wrap: 'wrap', responsive: {}, idAnchor: '' },
      render: ({ id, idAnchor, gap, justify, wrap, responsive, children, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><div id={sectionId(idAnchor)} className={responsiveClass(id, 'sv-stack sv-stack-horizontal')} style={{ gap, justifyContent: justify, flexWrap: wrap }}>{children({ minEmptyHeight: 56, collisionAxis: 'x' })}</div></>,
    },
    Grid: {
      label: studioComponentLabels.Grid,
      fields: { ...baseFields, columns: { type: 'number', label: 'Колонки', min: 1, max: 6 }, gap: { type: 'number', label: 'Интервал', min: 0, max: 120 }, children: { type: 'slot', allow: ['Card', 'Heading', 'RichText', 'Button', 'Image', 'Icon', 'Badge', 'List', 'Quote'] } },
      defaultProps: { children: [], columns: 3, gap: 24, responsive: { tablet: { columns: 2 }, mobile: { columns: 1 } }, idAnchor: '' },
      render: ({ id, idAnchor, columns, gap, responsive, children, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><div id={sectionId(idAnchor)} className={responsiveClass(id, 'sv-grid')} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))`, gap }}>{children({ minEmptyHeight: 80 })}</div></>,
    },
    Columns: {
      label: studioComponentLabels.Columns,
      fields: { ...baseFields, ratio: { type: 'radio', label: 'Пропорция', options: [{ label: '1 / 1', value: '1-1' }, { label: '2 / 1', value: '2-1' }, { label: '1 / 2', value: '1-2' }] }, gap: { type: 'number', label: 'Интервал', min: 0, max: 120 }, children: { type: 'slot', allow: ['Card', 'VerticalStack', 'Heading', 'RichText', 'Button', 'Image', 'List', 'Quote'] } },
      defaultProps: { children: [], ratio: '1-1', gap: 32, responsive: { mobile: { display: 'block' } }, idAnchor: '' },
      render: ({ id, idAnchor, ratio, gap, responsive, children, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><div id={sectionId(idAnchor)} className={responsiveClass(id, `sv-columns sv-columns-${ratio}`)} style={{ gap }}>{children({ minEmptyHeight: 96 })}</div></>,
    },
    Card: {
      label: studioComponentLabels.Card,
      fields: { ...baseFields, tone: { type: 'select', label: 'Стиль', options: [{ label: 'Поверхность', value: 'surface' }, { label: 'Приглушённый', value: 'muted' }, { label: 'Контрастный', value: 'contrast' }] }, padding: { type: 'number', label: 'Внутренние отступы', min: 0, max: 96 }, children: { type: 'slot', allow: ['VerticalStack', 'HorizontalStack', 'Heading', 'RichText', 'Button', 'Image', 'Icon', 'Badge', 'List', 'Quote', 'Spacer', 'Divider'] } },
      defaultProps: { children: [], tone: 'surface', padding: 28, responsive: {}, idAnchor: '' },
      render: ({ id, idAnchor, tone, padding, responsive, children, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><article id={sectionId(idAnchor)} className={responsiveClass(id, `sv-card sv-tone-${tone}`)} style={{ padding }}>{children({ minEmptyHeight: 72 })}</article></>,
    },
    Spacer: { label: 'Spacer', fields: { ...baseFields, size: { type: 'number', label: 'Высота', min: 8, max: 240 } }, defaultProps: { size: 48, responsive: {}, idAnchor: '' }, render: ({ id, size, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><div className={responsiveClass(id, 'sv-spacer')} style={{ height: size }} aria-hidden="true" /></> },
    Divider: { label: 'Divider', fields: { ...baseFields, color: { type: 'text', label: 'Цвет' }, width: { type: 'number', label: 'Толщина', min: 1, max: 8 } }, defaultProps: { color: 'var(--sv-border)', width: 1, responsive: {}, idAnchor: '' }, render: ({ id, color, width, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><hr className={responsiveClass(id, 'sv-divider')} style={{ borderColor: color, borderWidth: width }} /></> },
    Heading: {
      label: 'Heading',
      fields: { ...baseFields, text: { type: 'text', label: 'Текст', contentEditable: true }, level: { type: 'select', label: 'Уровень', options: ['h1', 'h2', 'h3'].map((value) => ({ label: value.toUpperCase(), value })) }, align: { type: 'radio', label: 'Выравнивание', options: ['left', 'center', 'right'].map((value) => ({ label: value, value })) }, color: { type: 'text', label: 'Цвет' } },
      defaultProps: { text: 'Новый заголовок', level: 'h2', align: 'left', color: 'var(--sv-text)', responsive: {}, idAnchor: '' },
      render: ({ id, idAnchor, text, level: Tag, align, color, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><Tag id={sectionId(idAnchor)} className={responsiveClass(id, `sv-heading sv-${Tag}`)} style={{ textAlign: align, color }}>{text || 'Заголовок'}</Tag></>,
    },
    RichText: {
      label: 'Rich text',
      fields: { ...baseFields, content: { type: 'richtext', label: 'Текст', contentEditable: true, initialHeight: 140 }, align: { type: 'radio', label: 'Выравнивание', options: ['left', 'center', 'right'].map((value) => ({ label: value, value })) } },
      defaultProps: { content: 'Добавьте текст и отформатируйте его прямо на холсте.', align: 'left', responsive: {}, idAnchor: '' },
      render: ({ id, idAnchor, content, align, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><div id={sectionId(idAnchor)} className={responsiveClass(id, 'sv-richtext')} style={{ textAlign: align }}>{content}</div></>,
    },
    Button: {
      label: 'Button',
      fields: { ...baseFields, label: { type: 'text', label: 'Текст', contentEditable: true }, href: { type: 'text', label: 'Ссылка' }, variant: { type: 'radio', label: 'Вариант', options: ['primary', 'secondary', 'ghost'].map((value) => ({ label: value, value })) }, fullWidth: { type: 'radio', label: 'Ширина', options: [{ label: 'По тексту', value: 'no' }, { label: '100%', value: 'yes' }] } },
      defaultProps: { label: 'Подробнее', href: '#', variant: 'primary', fullWidth: 'no', responsive: {}, idAnchor: '' },
      render: ({ id, idAnchor, label, href, variant, fullWidth, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><a id={sectionId(idAnchor)} className={responsiveClass(id, `sv-button sv-button-${variant} ${fullWidth === 'yes' ? 'sv-button-full' : ''}`)} href={safeStudioHref(href)}>{label || 'Открыть'}</a></>,
    },
    Image: {
      label: 'Image',
      fields: { ...baseFields, src: assetField, alt: { type: 'text', label: 'Alt' }, ratio: { type: 'select', label: 'Соотношение', options: ['auto', '16-9', '4-3', '1-1'].map((value) => ({ label: value, value })) }, radius: { type: 'number', label: 'Скругление', min: 0, max: 80 }, objectPosition: { type: 'text', label: 'Фокус', placeholder: '50% 50%' } },
      defaultProps: { src: '/images/editorial/developer-workspace.webp', alt: 'Смысловое изображение проекта', ratio: '16-9', radius: 18, objectPosition: '50% 50%', responsive: {}, idAnchor: '' },
      render: ({ id, idAnchor, src, alt, ratio, radius, objectPosition, responsive, puck }) => { const metadata = metadataOf(puck); const resolved = resolveStudioAsset(src, metadata.assetUrls); return <><ResponsiveCss id={id} responsive={responsive} theme={metadata.theme || defaultStudioTheme} /><figure id={sectionId(idAnchor)} className={responsiveClass(id, `sv-image sv-image-${ratio}`)} style={{ borderRadius: radius }}>{resolved ? <img src={resolved} alt={alt || ''} style={{ objectPosition }} /> : <div className="sv-image-empty">Добавьте изображение</div>}</figure></>; },
    },
    Icon: { label: 'Icon', fields: { ...baseFields, icon: { type: 'select', label: 'Иконка', options: ['sparkles', 'shield', 'globe', 'code', 'zap', 'star'].map((value) => ({ label: value, value })) }, size: { type: 'number', label: 'Размер', min: 16, max: 120 }, color: { type: 'text', label: 'Цвет' } }, defaultProps: { icon: 'sparkles', size: 36, color: 'var(--sv-primary)', responsive: {}, idAnchor: '' }, render: ({ id, icon, size, color, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><span className={responsiveClass(id, 'sv-icon')} style={{ color }}>{iconFor(icon, size)}</span></> },
    Video: { label: 'Video', fields: { ...baseFields, src: { type: 'text', label: 'URL видео' }, poster: assetField, caption: { type: 'text', label: 'Подпись' } }, defaultProps: { src: '', poster: '', caption: '', responsive: {}, idAnchor: '' }, render: ({ id, src, poster, caption, responsive, puck }) => { const metadata = metadataOf(puck); return <><ResponsiveCss id={id} responsive={responsive} theme={metadata.theme || defaultStudioTheme} /><figure className={responsiveClass(id, 'sv-video')}>{src ? <video controls preload="metadata" poster={resolveStudioAsset(poster, metadata.assetUrls)} src={safeStudioHref(src, '')} /> : <div className="sv-video-empty"><Play /> Добавьте безопасный URL видеофайла</div>}{caption ? <figcaption>{caption}</figcaption> : null}</figure></>; } },
    Badge: { label: 'Badge', fields: { ...baseFields, text: { type: 'text', label: 'Текст', contentEditable: true }, tone: { type: 'select', label: 'Тон', options: ['primary', 'success', 'neutral'].map((value) => ({ label: value, value })) } }, defaultProps: { text: 'Новый', tone: 'primary', responsive: {}, idAnchor: '' }, render: ({ id, text, tone, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><span className={responsiveClass(id, `sv-badge sv-badge-${tone}`)}>{text}</span></> },
    List: { label: 'List', fields: { ...baseFields, items: { type: 'array', label: 'Пункты', arrayFields: { text: { type: 'text', label: 'Текст' } }, defaultItemProps: { text: 'Новый пункт' }, getItemSummary: (item) => item.text }, marker: { type: 'radio', label: 'Маркер', options: ['check', 'dot', 'number'].map((value) => ({ label: value, value })) } }, defaultProps: { items: [{ text: 'Первый пункт' }, { text: 'Второй пункт' }], marker: 'check', responsive: {}, idAnchor: '' }, render: ({ id, items, marker, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><ol className={responsiveClass(id, 'sv-list')}>{items.map((item, index) => <li key={`${item.text}-${index}`}><span>{marker === 'check' ? <Check /> : marker === 'number' ? index + 1 : <Circle />}</span>{item.text}</li>)}</ol></> },
    Quote: { label: 'Quote', fields: { ...baseFields, text: { type: 'textarea', label: 'Цитата', contentEditable: true }, author: { type: 'text', label: 'Автор', contentEditable: true } }, defaultProps: { text: 'Хорошая работа начинается с понятной задачи.', author: 'Автор', responsive: {}, idAnchor: '' }, render: ({ id, text, author, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><blockquote className={responsiveClass(id, 'sv-quote')}><p>{text}</p><cite>{author}</cite></blockquote></> },
    Header: {
      label: 'Header', fields: { ...baseFields, brand: { type: 'text', label: 'Бренд', contentEditable: true }, links: linkArrayField, ctaLabel: { type: 'text', label: 'CTA', contentEditable: true }, ctaHref: { type: 'text', label: 'CTA ссылка' }, variant: { type: 'select', label: 'Композиция', options: ['clean', 'floating', 'transparent', 'minimal'].map((value) => ({ label: value, value })) } },
      defaultProps: { brand: 'SITE NAME', links: [{ label: 'Услуги', href: '#services' }, { label: 'Контакты', href: '#contact' }], ctaLabel: 'Связаться', ctaHref: '#contact', variant: 'clean', responsive: {}, idAnchor: '' },
      render: ({ id, brand, links, ctaLabel, ctaHref, variant, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><header className={responsiveClass(id, `sv-header sv-header-${variant}`)}><a className="sv-brand" href="/">{brand || 'BRAND'}</a><nav aria-label="Навигация сайта">{links.map((link, index) => <a href={safeStudioHref(link.href)} key={`${link.label}-${index}`}>{link.label}</a>)}</nav><a className="sv-button sv-button-primary" href={safeStudioHref(ctaHref)}>{ctaLabel || 'Связаться'}</a></header></>,
    },
    Hero: {
      label: 'Hero', fields: { ...baseFields, eyebrow: { type: 'text', label: 'Надзаголовок', contentEditable: true }, title: { type: 'textarea', label: 'Заголовок', contentEditable: true }, text: { type: 'textarea', label: 'Описание', contentEditable: true }, buttonLabel: { type: 'text', label: 'Кнопка', contentEditable: true }, buttonHref: { type: 'text', label: 'Ссылка' }, image: assetField, variant: { type: 'select', label: 'Композиция', options: ['image', 'split', 'cover', 'minimal'].map((value) => ({ label: value, value })) }, align: { type: 'radio', label: 'Выравнивание', options: [{ label: 'Слева', value: 'left' }, { label: 'По центру', value: 'center' }] } },
      defaultProps: { eyebrow: 'Новый проект', title: 'Большой заголовок, который объясняет идею', text: 'Короткое описание результата для человека.', buttonLabel: 'Начать', buttonHref: '#contact', image: '/images/editorial/home-collaboration.webp', variant: 'split', align: 'left', responsive: {}, idAnchor: '' },
      render: ({ id, idAnchor, eyebrow, title, text, buttonLabel, buttonHref, image, variant, align, responsive, puck }) => { const metadata = metadataOf(puck); const imageUrl = resolveStudioAsset(image, metadata.assetUrls); return <><ResponsiveCss id={id} responsive={responsive} theme={metadata.theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, `sv-hero sv-hero-${variant} sv-align-${align}`)}>{imageUrl && variant !== 'minimal' ? <div className="sv-hero-media"><img src={imageUrl} alt="Главное изображение проекта" /></div> : null}<div className="sv-hero-content"><span className="sv-eyebrow">{eyebrow}</span><h1>{title || 'Заголовок проекта'}</h1><p>{text}</p><a className="sv-button sv-button-primary" href={safeStudioHref(buttonHref)}>{buttonLabel || 'Подробнее'}</a></div></section></>; },
    },
    Services: {
      label: 'Services', fields: { ...baseFields, eyebrow: { type: 'text', label: 'Надзаголовок', contentEditable: true }, title: { type: 'text', label: 'Заголовок', contentEditable: true }, items: serviceArrayField, variant: { type: 'select', label: 'Композиция', options: ['cards', 'editorial', 'compact'].map((value) => ({ label: value, value })) } },
      defaultProps: { eyebrow: 'Услуги', title: 'С чем можно обратиться', items: [{ title: 'Первая услуга', text: 'Понятное описание.', price: 'от 5 000 ₽' }, { title: 'Вторая услуга', text: 'Понятное описание.', price: 'по запросу' }], variant: 'cards', responsive: {}, idAnchor: 'services' },
      render: ({ id, idAnchor, eyebrow, title, items, variant, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, `sv-business sv-services sv-services-${variant}`)}><div className="sv-section-heading"><span className="sv-eyebrow">{eyebrow}</span><h2>{title}</h2></div><div className="sv-business-grid">{items.map((item, index) => <article key={`${item.title}-${index}`}><span className="sv-price">{item.price}</span><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section></>,
    },
    Features: {
      label: 'Features', fields: { ...baseFields, eyebrow: { type: 'text', label: 'Надзаголовок', contentEditable: true }, title: { type: 'text', label: 'Заголовок', contentEditable: true }, text: { type: 'textarea', label: 'Вводный текст', contentEditable: true }, items: textItemArrayField, variant: { type: 'select', label: 'Композиция', options: ['cards', 'split', 'list'].map((value) => ({ label: value, value })) } },
      defaultProps: { eyebrow: 'Преимущества', title: 'Почему это удобно', text: 'Короткое объяснение подхода.', items: [{ title: 'Понятно', text: 'Без лишней сложности.' }, { title: 'Продуманно', text: 'Каждая деталь имеет смысл.' }], variant: 'cards', responsive: {}, idAnchor: 'about' },
      render: ({ id, idAnchor, eyebrow, title, text, items, variant, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, `sv-business sv-features sv-features-${variant}`)}><div className="sv-section-heading"><span className="sv-eyebrow">{eyebrow}</span><h2>{title}</h2><p>{text}</p></div><div className="sv-business-grid">{items.map((item, index) => <article key={`${item.title}-${index}`}><Sparkles aria-hidden="true" /><h3>{item.title}</h3><p>{item.text}</p></article>)}</div></section></>,
    },
    Pricing: {
      label: 'Pricing', fields: { ...baseFields, eyebrow: { type: 'text', label: 'Надзаголовок', contentEditable: true }, title: { type: 'text', label: 'Заголовок', contentEditable: true }, items: { type: 'array', label: 'Тарифы', arrayFields: { title: { type: 'text', label: 'Название' }, price: { type: 'text', label: 'Цена' }, features: { type: 'textarea', label: 'Что входит' } }, defaultItemProps: { title: 'Новый тариф', price: 'от 10 000 ₽', features: 'Основные работы' }, getItemSummary: (item) => item.title }, variant: { type: 'select', label: 'Композиция', options: ['cards', 'columns', 'compact'].map((value) => ({ label: value, value })) } },
      defaultProps: { eyebrow: 'Стоимость', title: 'Форматы работы', items: [{ title: 'Старт', price: 'от 20 000 ₽', features: 'Основные блоки, мобильная версия' }, { title: 'Бизнес', price: 'от 45 000 ₽', features: 'Страницы, SEO, админка' }], variant: 'cards', responsive: {}, idAnchor: 'prices' },
      render: ({ id, idAnchor, eyebrow, title, items, variant, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, `sv-business sv-pricing sv-pricing-${variant}`)}><div className="sv-section-heading"><span className="sv-eyebrow">{eyebrow}</span><h2>{title}</h2></div><div className="sv-business-grid">{items.map((item, index) => <article key={`${item.title}-${index}`}><h3>{item.title}</h3><strong>{item.price}</strong><p>{item.features}</p><a className="sv-button sv-button-secondary" href="#contact">Обсудить</a></article>)}</div></section></>,
    },
    Portfolio: {
      label: 'Portfolio', fields: { ...baseFields, eyebrow: { type: 'text', label: 'Надзаголовок', contentEditable: true }, title: { type: 'text', label: 'Заголовок', contentEditable: true }, items: { type: 'array', label: 'Проекты', arrayFields: { title: { type: 'text', label: 'Название' }, category: { type: 'text', label: 'Категория' } }, defaultItemProps: { title: 'Новый проект', category: 'Категория' }, getItemSummary: (item) => item.title }, variant: { type: 'select', label: 'Композиция', options: ['mosaic', 'editorial', 'grid'].map((value) => ({ label: value, value })) } },
      defaultProps: { eyebrow: 'Портфолио', title: 'Выбранные проекты', items: [{ title: 'Первый проект', category: 'Сайт' }, { title: 'Второй проект', category: 'Приложение' }, { title: 'Третий проект', category: 'Брендинг' }], variant: 'mosaic', responsive: {}, idAnchor: 'portfolio' },
      render: ({ id, idAnchor, eyebrow, title, items, variant, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, `sv-business sv-portfolio sv-portfolio-${variant}`)}><div className="sv-section-heading"><span className="sv-eyebrow">{eyebrow}</span><h2>{title}</h2></div><div className="sv-portfolio-grid">{items.map((item, index) => <article key={`${item.title}-${index}`}><div className="sv-project-visual"><span>{String(index + 1).padStart(2, '0')}</span></div><small>{item.category}</small><h3>{item.title}</h3></article>)}</div></section></>,
    },
    Gallery: {
      label: 'Gallery', fields: { ...baseFields, eyebrow: { type: 'text', label: 'Надзаголовок', contentEditable: true }, title: { type: 'text', label: 'Заголовок', contentEditable: true }, images: { type: 'array', label: 'Изображения', arrayFields: { value: assetField }, defaultItemProps: { value: '/images/editorial/home-collaboration.webp' }, getItemSummary: (_item, index) => `Изображение ${(index || 0) + 1}` }, variant: { type: 'select', label: 'Композиция', options: ['grid', 'masonry', 'strip'].map((value) => ({ label: value, value })) } },
      defaultProps: { eyebrow: 'Галерея', title: 'Посмотрите подробнее', images: [{ value: '/images/editorial/home-collaboration.webp' }, { value: '/images/editorial/developer-workspace.webp' }], variant: 'grid', responsive: {}, idAnchor: 'gallery' },
      render: ({ id, idAnchor, eyebrow, title, images, variant, responsive, puck }) => { const metadata = metadataOf(puck); return <><ResponsiveCss id={id} responsive={responsive} theme={metadata.theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, `sv-business sv-gallery sv-gallery-${variant}`)}><div className="sv-section-heading"><span className="sv-eyebrow">{eyebrow}</span><h2>{title}</h2></div><div className="sv-gallery-grid">{images.map((image, index) => { const source = resolveStudioAsset(image.value, metadata.assetUrls); return source ? <img src={source} alt={`Изображение галереи ${index + 1}`} loading="lazy" key={`${image.value}-${index}`} /> : null; })}</div></section></>; },
    },
    Steps: { label: 'Steps', fields: { ...baseFields, eyebrow: { type: 'text', label: 'Надзаголовок', contentEditable: true }, title: { type: 'text', label: 'Заголовок', contentEditable: true }, items: { type: 'array', label: 'Шаги', arrayFields: { value: { type: 'text', label: 'Шаг' } }, defaultItemProps: { value: 'Новый шаг' }, getItemSummary: (item) => item.value } }, defaultProps: { eyebrow: 'Процесс', title: 'Как проходит работа', items: [{ value: 'Задача' }, { value: 'Детали' }, { value: 'Работа' }, { value: 'Результат' }], responsive: {}, idAnchor: 'steps' }, render: ({ id, idAnchor, eyebrow, title, items, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, 'sv-business sv-steps')}><div className="sv-section-heading"><span className="sv-eyebrow">{eyebrow}</span><h2>{title}</h2></div><ol>{items.map((item, index) => <li key={`${item.value}-${index}`}><span>{String(index + 1).padStart(2, '0')}</span><strong>{item.value}</strong></li>)}</ol></section></> },
    Stats: { label: 'Stats', fields: { ...baseFields, title: { type: 'text', label: 'Заголовок', contentEditable: true }, items: { type: 'array', label: 'Показатели', arrayFields: { value: { type: 'text', label: 'Значение' }, label: { type: 'text', label: 'Подпись' } }, defaultItemProps: { value: '10+', label: 'проектов' }, getItemSummary: (item) => `${item.value} ${item.label}` } }, defaultProps: { title: 'В цифрах', items: [{ value: '10+', label: 'проектов' }, { value: '5 лет', label: 'опыта' }, { value: '24/7', label: 'сайт работает' }], responsive: {}, idAnchor: 'stats' }, render: ({ id, idAnchor, title, items, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, 'sv-business sv-stats')}><h2>{title}</h2><div>{items.map((item, index) => <article key={`${item.value}-${index}`}><strong>{item.value}</strong><span>{item.label}</span></article>)}</div></section></> },
    Reviews: {
      label: 'Reviews', fields: { ...baseFields, eyebrow: { type: 'text', label: 'Надзаголовок', contentEditable: true }, title: { type: 'text', label: 'Заголовок', contentEditable: true }, items: { type: 'array', label: 'Отзывы', arrayFields: { author: { type: 'text', label: 'Автор' }, text: { type: 'textarea', label: 'Текст' } }, defaultItemProps: { author: 'Клиент', text: 'Короткий отзыв о работе.' }, getItemSummary: (item) => item.author }, variant: { type: 'select', label: 'Композиция', options: ['quotes', 'cards', 'featured'].map((value) => ({ label: value, value })) } },
      defaultProps: { eyebrow: 'Отзывы', title: 'Что говорят клиенты', items: [{ author: 'Мария', text: 'Было понятно на каждом этапе.' }, { author: 'Илья', text: 'Результат получился аккуратным и удобным.' }], variant: 'quotes', responsive: {}, idAnchor: 'reviews' },
      render: ({ id, idAnchor, eyebrow, title, items, variant, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, `sv-business sv-reviews sv-reviews-${variant}`)}><div className="sv-section-heading"><span className="sv-eyebrow">{eyebrow}</span><h2>{title}</h2></div><div className="sv-business-grid">{items.map((item, index) => <blockquote key={`${item.author}-${index}`}><p>“{item.text}”</p><cite>{item.author}</cite></blockquote>)}</div></section></>,
    },
    Team: { label: 'Team', fields: { ...baseFields, eyebrow: { type: 'text', label: 'Надзаголовок', contentEditable: true }, title: { type: 'text', label: 'Заголовок', contentEditable: true }, items: { type: 'array', label: 'Команда', arrayFields: { name: { type: 'text', label: 'Имя' }, role: { type: 'text', label: 'Роль' }, image: assetField }, defaultItemProps: { name: 'Имя', role: 'Роль', image: '' }, getItemSummary: (item) => item.name } }, defaultProps: { eyebrow: 'Команда', title: 'Кто работает над проектом', items: [{ name: 'Александр', role: 'Основатель и разработчик', image: '' }], responsive: {}, idAnchor: 'team' }, render: ({ id, idAnchor, eyebrow, title, items, responsive, puck }) => { const metadata = metadataOf(puck); return <><ResponsiveCss id={id} responsive={responsive} theme={metadata.theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, 'sv-business sv-team')}><div className="sv-section-heading"><span className="sv-eyebrow">{eyebrow}</span><h2>{title}</h2></div><div className="sv-business-grid">{items.map((item, index) => { const source = resolveStudioAsset(item.image, metadata.assetUrls); return <article key={`${item.name}-${index}`}>{source ? <img src={source} alt={item.name} /> : <div className="sv-avatar">{item.name.slice(0, 1)}</div>}<h3>{item.name}</h3><p>{item.role}</p></article>; })}</div></section></>; } },
    FAQ: { label: 'FAQ', fields: { ...baseFields, title: { type: 'text', label: 'Заголовок', contentEditable: true }, items: { type: 'array', label: 'Вопросы', arrayFields: { question: { type: 'text', label: 'Вопрос' }, answer: { type: 'textarea', label: 'Ответ' } }, defaultItemProps: { question: 'Новый вопрос?', answer: 'Понятный ответ.' }, getItemSummary: (item) => item.question } }, defaultProps: { title: 'Частые вопросы', items: [{ question: 'Сколько занимает работа?', answer: 'Срок зависит от задачи и согласуется до начала.' }, { question: 'Можно ли удалённо?', answer: 'Да, многие задачи решаются полностью онлайн.' }], responsive: {}, idAnchor: 'faq' }, render: ({ id, idAnchor, title, items, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, 'sv-business sv-faq')}><h2>{title}</h2><div>{items.map((item, index) => <details key={`${item.question}-${index}`}><summary>{item.question}</summary><p>{item.answer}</p></details>)}</div></section></> },
    Contact: {
      label: 'Contact', fields: { ...baseFields, title: { type: 'text', label: 'Заголовок', contentEditable: true }, text: { type: 'textarea', label: 'Текст', contentEditable: true }, buttonLabel: { type: 'text', label: 'Кнопка', contentEditable: true }, buttonHref: { type: 'text', label: 'Ссылка' }, variant: { type: 'select', label: 'Композиция', options: ['panel', 'contrast', 'minimal'].map((value) => ({ label: value, value })) } },
      defaultProps: { title: 'Нужна консультация?', text: 'Расскажите о задаче удобным способом.', buttonLabel: 'Написать', buttonHref: 'https://t.me/AYDigitaLRu', variant: 'panel', responsive: {}, idAnchor: 'contact' },
      render: ({ id, idAnchor, title, text, buttonLabel, buttonHref, variant, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, `sv-contact sv-contact-${variant}`)}><div><span className="sv-eyebrow">Следующий шаг</span><h2>{title}</h2><p>{text}</p></div><a className="sv-button sv-button-primary" href={safeStudioHref(buttonHref)}>{buttonLabel}</a></section></>,
    },
    LeadForm: { label: 'Lead form', fields: { ...baseFields, title: { type: 'text', label: 'Заголовок', contentEditable: true }, text: { type: 'textarea', label: 'Текст', contentEditable: true }, buttonLabel: { type: 'text', label: 'Кнопка', contentEditable: true }, actionHref: { type: 'text', label: 'Ссылка действия' } }, defaultProps: { title: 'Оставьте обращение', text: 'Свяжитесь удобным способом — форма не отправляет данные без backend.', buttonLabel: 'Написать в Telegram', actionHref: 'https://t.me/AYDigitaLRu', responsive: {}, idAnchor: 'contact' }, render: ({ id, idAnchor, title, text, buttonLabel, actionHref, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, 'sv-lead-form')}><div><Mail aria-hidden="true" /><h2>{title}</h2><p>{text}</p></div><div className="sv-lead-form__fields" aria-label="Пример полей обращения"><label>Имя<input type="text" disabled placeholder="Имя клиента" /></label><label>Телефон<input type="tel" disabled placeholder="+7 (999) 123-45-67" /></label></div><a className="sv-button sv-button-primary" href={safeStudioHref(actionHref)}>{buttonLabel}</a></section></> },
    MapPlaceholder: { label: 'Map placeholder', fields: { ...baseFields, title: { type: 'text', label: 'Заголовок', contentEditable: true }, address: { type: 'text', label: 'Адрес', contentEditable: true }, text: { type: 'textarea', label: 'Текст', contentEditable: true } }, defaultProps: { title: 'Где мы находимся', address: 'Владивосток', text: 'Точный адрес и время визита согласуются заранее.', responsive: {}, idAnchor: 'map' }, render: ({ id, idAnchor, title, address, text, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><section id={sectionId(idAnchor)} className={responsiveClass(id, 'sv-map')}><div className="sv-map__visual"><MapPin aria-hidden="true" /><span>{address}</span></div><div><span className="sv-eyebrow">Локация</span><h2>{title}</h2><p>{text}</p></div></section></> },
    Footer: {
      label: 'Footer', fields: { ...baseFields, brand: { type: 'text', label: 'Бренд', contentEditable: true }, text: { type: 'textarea', label: 'Текст', contentEditable: true }, links: linkArrayField, variant: { type: 'select', label: 'Композиция', options: ['dark', 'light', 'minimal'].map((value) => ({ label: value, value })) } },
      defaultProps: { brand: 'SITE NAME', text: 'Короткая подпись проекта.', links: [{ label: 'Главная', href: '/' }, { label: 'Контакты', href: '#contact' }], variant: 'dark', responsive: {}, idAnchor: '' },
      render: ({ id, brand, text, links, variant, responsive, puck }) => <><ResponsiveCss id={id} responsive={responsive} theme={metadataOf(puck).theme || defaultStudioTheme} /><footer className={responsiveClass(id, `sv-footer sv-footer-${variant}`)}><div><strong>{brand}</strong><p>{text}</p></div><nav aria-label="Навигация в подвале">{links.map((link, index) => <a href={safeStudioHref(link.href)} key={`${link.label}-${index}`}>{link.label}</a>)}</nav><span>© {new Date().getFullYear()}</span></footer></>,
    },
  },
};

type LocalizableField = { label?: string; options?: Array<{ label: string; value: string }>; arrayFields?: Record<string, LocalizableField>; objectFields?: Record<string, LocalizableField> };

function localizeStudioFields(fields: Record<string, LocalizableField> | undefined) {
  Object.values(fields || {}).forEach((field) => {
    if (field.label && studioVisibleLabelTranslations[field.label]) field.label = studioVisibleLabelTranslations[field.label];
    field.options?.forEach((option) => { option.label = studioValueLabels[option.value] || option.label; });
    localizeStudioFields(field.arrayFields);
    localizeStudioFields(field.objectFields);
  });
}

Object.entries(studioComponentLabels).forEach(([id, label]) => {
  const component = studioConfig.components[id as keyof StudioComponentProps];
  if (!component) return;
  component.label = label;
  localizeStudioFields(component.fields as Record<string, LocalizableField>);
});

export function getStudioMetadata(theme: StudioThemeTokens, assetUrls: Record<string, string>) {
  return { theme, assetUrls } satisfies StudioMetadata;
}

export function countProjectSections(data: { content?: unknown[] }) {
  return data.content?.length || 0;
}

export function serializeFeatureList(data: { content?: Array<{ type?: string }> }) {
  return [...new Set((data.content || []).map((item) => item.type).filter(Boolean))].join(', ');
}

export type StudioRendererNode = ReactNode;

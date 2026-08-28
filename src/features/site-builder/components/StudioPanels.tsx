/* eslint-disable react-refresh/only-export-components */
import { useMemo, useState, type ChangeEvent, type DragEvent } from 'react';
import type { Data, Plugin } from '@puckeditor/core';
import { Copy, FilePlus2, FolderOpen, ImagePlus, Layers3, Palette, Search, Star, Trash2, Upload } from 'lucide-react';
import type { SiteBuilderProject, StudioPage } from '../schema/types';
import { createStudioId, normalizeSlug } from '../utils/id';
import { useStudioAssets } from '../assets/AssetContext';

function blankPage(name: string, order: number): StudioPage {
  const id = createStudioId('page');
  return {
    id, name, slug: normalizeSlug(name), title: name, metaDescription: '', noindex: false, isHome: false, order,
    data: {
      content: [
        { type: 'Header', props: { id: createStudioId('block'), brand: 'SITE NAME', links: [], ctaLabel: 'Связаться', ctaHref: '#contact', variant: 'clean' } },
        { type: 'Hero', props: { id: createStudioId('block'), eyebrow: 'Новая страница', title: name, text: 'Добавьте содержание страницы.', buttonLabel: 'Подробнее', buttonHref: '#content', image: '', variant: 'minimal', align: 'left' } },
        { type: 'Footer', props: { id: createStudioId('block'), brand: 'SITE NAME', text: 'Новая страница SITEVL.', links: [], variant: 'dark' } },
      ],
      root: { props: { title: name } },
    },
  };
}

function cloneWithNewIds<T>(input: T): T {
  const visit = (value: unknown): unknown => {
    if (Array.isArray(value)) return value.map(visit);
    if (!value || typeof value !== 'object') return value;
    return Object.fromEntries(Object.entries(value as Record<string, unknown>).map(([key, item]) => [key, key === 'id' && typeof item === 'string' ? createStudioId(item.startsWith('page') ? 'page' : 'block') : visit(item)]));
  };
  return visit(input) as T;
}

export function PagesPanel({ project, onChange }: { project: SiteBuilderProject; onChange: (project: SiteBuilderProject) => void }) {
  const assets = useStudioAssets();
  const pages = [...project.pages].sort((a, b) => a.order - b.order);
  const updatePage = (id: string, patch: Partial<StudioPage>) => onChange({ ...project, pages: project.pages.map((page) => page.id === id ? { ...page, ...patch } : page) });
  const select = (id: string) => onChange({ ...project, activePageId: id });
  const add = () => {
    const next = blankPage(`Страница ${pages.length + 1}`, pages.length);
    onChange({ ...project, activePageId: next.id, pages: [...project.pages, next] });
  };
  const duplicate = (page: StudioPage) => {
    const copy = cloneWithNewIds(page);
    copy.id = createStudioId('page');
    copy.name = `${page.name} — копия`;
    copy.slug = normalizeSlug(copy.name);
    copy.isHome = false;
    copy.order = project.pages.length;
    onChange({ ...project, activePageId: copy.id, pages: [...project.pages, copy] });
  };
  const remove = (page: StudioPage) => {
    if (project.pages.length === 1) return;
    if (!window.confirm(`Удалить страницу «${page.name}»?`)) return;
    const remaining = project.pages.filter((item) => item.id !== page.id).map((item, index) => ({ ...item, order: index }));
    if (page.isHome && remaining[0]) remaining[0].isHome = true;
    onChange({ ...project, activePageId: project.activePageId === page.id ? remaining[0].id : project.activePageId, pages: remaining });
  };
  const move = (page: StudioPage, direction: -1 | 1) => {
    const current = pages.findIndex((item) => item.id === page.id);
    const target = current + direction;
    if (target < 0 || target >= pages.length) return;
    const reordered = [...pages];
    [reordered[current], reordered[target]] = [reordered[target], reordered[current]];
    onChange({ ...project, pages: reordered.map((item, index) => ({ ...item, order: index })) });
  };

  return (
    <div className="studio-panel">
      <div className="studio-panel__heading"><div><small>Структура</small><h2>Pages</h2></div><button type="button" onClick={add} aria-label="Создать страницу"><FilePlus2 /></button></div>
      <div className="studio-page-list">
        {pages.map((page) => (
          <article className={project.activePageId === page.id ? 'is-active' : ''} key={page.id}>
            <button className="studio-page-list__select" type="button" onClick={() => select(page.id)}><span>{page.isHome ? <Star /> : <FolderOpen />}</span><div><strong>{page.name}</strong><small>/{page.slug}</small></div></button>
            <div className="studio-page-list__actions">
              <button type="button" onClick={() => move(page, -1)} aria-label="Переместить выше">↑</button>
              <button type="button" onClick={() => move(page, 1)} aria-label="Переместить ниже">↓</button>
              <button type="button" onClick={() => duplicate(page)} aria-label="Дублировать страницу"><Copy /></button>
              <button type="button" disabled={project.pages.length === 1} onClick={() => remove(page)} aria-label="Удалить страницу"><Trash2 /></button>
            </div>
            {project.activePageId === page.id ? (
              <div className="studio-page-settings">
                <label>Название<input value={page.name} onChange={(event) => updatePage(page.id, { name: event.target.value })} /></label>
                <label>Slug<input value={page.slug} onChange={(event) => updatePage(page.id, { slug: normalizeSlug(event.target.value) })} /></label>
                <label>Page title<input value={page.title} onChange={(event) => updatePage(page.id, { title: event.target.value })} /></label>
                <label>Meta description<textarea value={page.metaDescription} onChange={(event) => updatePage(page.id, { metaDescription: event.target.value.slice(0, 220) })} /></label>
                <label>Social image<select value={page.socialImageAssetId || ''} onChange={(event) => updatePage(page.id, { socialImageAssetId: event.target.value || undefined })}><option value="">Не выбрано</option>{assets?.assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label>
                <label className="studio-check"><input type="checkbox" checked={page.noindex} onChange={(event) => updatePage(page.id, { noindex: event.target.checked })} /> Noindex</label>
                <button className="studio-secondary-action" type="button" disabled={page.isHome} onClick={() => onChange({ ...project, pages: project.pages.map((item) => ({ ...item, isHome: item.id === page.id })) })}>Сделать главной</button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
}

export function AssetsPanel() {
  const context = useStudioAssets();
  const [query, setQuery] = useState('');
  const [dragging, setDragging] = useState(false);
  const filtered = useMemo(() => context?.assets.filter((asset) => `${asset.name} ${asset.alt}`.toLowerCase().includes(query.toLowerCase())) || [], [context?.assets, query]);
  const upload = async (event: ChangeEvent<HTMLInputElement>) => {
    if (event.target.files?.length) await context?.upload(event.target.files);
    event.target.value = '';
  };
  const drop = async (event: DragEvent<HTMLLabelElement>) => {
    event.preventDefault();
    setDragging(false);
    if (event.dataTransfer.files.length) await context?.upload(event.dataTransfer.files);
  };
  const replace = async (assetId: string, event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) await context?.replace(assetId, file);
    event.target.value = '';
  };
  return (
    <div className="studio-panel">
      <div className="studio-panel__heading"><div><small>Media library</small><h2>Assets</h2></div><ImagePlus /></div>
      <label className={`studio-asset-drop ${dragging ? 'is-dragging' : ''}`} onDragOver={(event) => { event.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={drop}>
        <Upload /><strong>Перетащите изображения</strong><span>JPEG, PNG, WebP или AVIF, до 12 МБ</span><input type="file" multiple accept="image/jpeg,image/png,image/webp,image/avif" onChange={upload} />
      </label>
      <label className="studio-search"><Search /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Поиск assets" /></label>
      <div className="studio-asset-grid">
        {filtered.map((asset) => <article key={asset.id}><img src={context?.urls[asset.id]} alt={asset.alt} loading="lazy" style={{ objectPosition: `${asset.focalPoint.x}% ${asset.focalPoint.y}%` }} /><div><strong>{asset.name}</strong><small>{asset.width}×{asset.height} · {Math.round(asset.size / 1024)} КБ</small><label>Alt<input value={asset.alt} onChange={(event) => void context?.updateAlt(asset.id, event.target.value)} /></label><div className="studio-focal-fields"><label>Фокус X<input type="number" min="0" max="100" value={asset.focalPoint.x} onChange={(event) => void context?.updateFocalPoint(asset.id, { ...asset.focalPoint, x: Number(event.target.value) })} /></label><label>Фокус Y<input type="number" min="0" max="100" value={asset.focalPoint.y} onChange={(event) => void context?.updateFocalPoint(asset.id, { ...asset.focalPoint, y: Number(event.target.value) })} /></label></div><div className="studio-asset-card__actions"><label className="studio-asset-replace">Заменить<input type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={(event) => void replace(asset.id, event)} /></label><button type="button" onClick={() => navigator.clipboard?.writeText(`asset://${asset.id}`)}>ID</button><button type="button" onClick={() => void context?.remove(asset.id)} aria-label="Удалить asset"><Trash2 /></button></div></div></article>)}
        {filtered.length === 0 ? <p className="studio-empty-small">Изображений пока нет.</p> : null}
      </div>
    </div>
  );
}

export function ThemePanel({ project, onChange }: { project: SiteBuilderProject; onChange: (project: SiteBuilderProject) => void }) {
  const colors = project.theme.colors;
  const updateColor = (key: keyof typeof colors, value: string) => onChange({ ...project, theme: { ...project.theme, colors: { ...colors, [key]: value } } });
  return <div className="studio-panel"><div className="studio-panel__heading"><div><small>Design system</small><h2>Theme</h2></div><Palette /></div><div className="studio-token-list">{Object.entries(colors).map(([key, value]) => <label key={key}><span><i style={{ background: value }} />{key}</span><input type="color" value={value} onChange={(event) => updateColor(key as keyof typeof colors, event.target.value)} /></label>)}</div><label className="studio-field">Content width<input type="number" min="720" max="1600" value={project.theme.contentWidths.default} onChange={(event) => onChange({ ...project, theme: { ...project.theme, contentWidths: { ...project.theme.contentWidths, default: Number(event.target.value) } } })} /></label><label className="studio-field">Button preset<select value={project.theme.buttonPreset} onChange={(event) => onChange({ ...project, theme: { ...project.theme, buttonPreset: event.target.value as typeof project.theme.buttonPreset } })}><option value="solid">Solid</option><option value="outline">Outline</option><option value="soft">Soft</option></select></label></div>;
}

export function createStudioPlugins(project: SiteBuilderProject, onChange: (project: SiteBuilderProject) => void): Plugin[] {
  return [
    { name: 'pages', label: 'Pages', icon: <FolderOpen />, render: () => <PagesPanel project={project} onChange={onChange} /> },
    { name: 'components', label: 'Components', icon: <Layers3 />, render: () => <div className="studio-panel studio-panel--native"><h2>Components</h2><p>Используйте вкладку Add: компоненты собраны по категориям Layout, Basic и Business sections.</p></div> },
    { name: 'assets', label: 'Assets', icon: <ImagePlus />, render: () => <AssetsPanel /> },
    { name: 'theme', label: 'Style', icon: <Palette />, render: () => <ThemePanel project={project} onChange={onChange} /> },
  ];
}

export function replaceActivePageData(project: SiteBuilderProject, data: Data) {
  return { ...project, pages: project.pages.map((page) => page.id === project.activePageId ? { ...page, data } : page) };
}

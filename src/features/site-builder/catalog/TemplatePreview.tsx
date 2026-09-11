import { useState } from 'react';
import { DesignFrame } from '../preview/DesignFrame';
import type { LoadedCatalogTemplate } from './catalog';

/** Read-only catalog and personal customizer share the same responsive, script-free frame. */
export function TemplatePreview({ template, expanded = false }: { template: LoadedCatalogTemplate; expanded?: boolean }) {
  const pages = template.project.pages;
  const [pageId, setPageId] = useState(pages.find((page) => page.isHome)!.id);
  const [viewport, setViewport] = useState('responsive');
  const page = pages.find((item) => item.id === pageId) || pages[0];
  return <>
    <div className="template-catalog__preview-controls">
      <label>Страница<select aria-label="Страница" value={page.id} onChange={(event) => setPageId(event.target.value)}>{pages.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
      <label>Размер предпросмотра<select aria-label="Размер предпросмотра" value={viewport} onChange={(event) => setViewport(event.target.value)}><option value="responsive">По ширине окна</option><option value="mobile">Телефон · 390 px</option></select></label>
    </div>
    <p className="template-catalog__note">Рабочая демонстрация: меню, фильтры и вопросы можно нажимать. Формы и покупки учебные, без внешних отправок.</p>
    <DesignFrame project={template.project} page={page} className="template-catalog__frame" style={{ width: viewport === 'mobile' ? 'min(390px, 100%)' : '100%', height: expanded ? '85vh' : '650px' }} />
  </>;
}

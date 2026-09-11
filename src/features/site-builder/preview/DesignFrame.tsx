import { useMemo, useState, type CSSProperties, type MouseEvent } from 'react';
import { createPortal } from 'react-dom';
import { StudioRenderer } from './StudioRenderer';
import type { SiteBuilderProject, StudioPage } from '../schema/types';
import rendererCss from '../styles/renderer.css?inline';
import designCss from '../designs/designs.css?inline';
import compositionCss from '../designs/compositions.css?inline';

const noAssets: Record<string, string> = {};
const allDesignCss = designCss + compositionCss;
/** The same renderer as Studio; only host React handles events inside this script-free frame. */
export function DesignFrame({ project, page, assetUrls = noAssets, className, style }: {
  project: SiteBuilderProject; page: StudioPage; assetUrls?: Record<string, string>; className?: string; style?: CSSProperties;
}) {
  const [target, setTarget] = useState<HTMLElement | null>(null);
  const html = useMemo(() => `<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex, nofollow"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src 'self' blob:; style-src 'unsafe-inline'; form-action 'none'; base-uri 'none'"><title>Предпросмотр дизайна</title><style>body{margin:0}.sv-preview-container{container-type:inline-size}${rendererCss}${allDesignCss}</style></head><body><div id="design-root" class="sv-preview-container"></div></body></html>`, []);
  function navigateWithinDemo(event: MouseEvent<HTMLDivElement>) {
    const link = (event.target as HTMLElement).closest?.('a');
    if (!link) return;
    event.preventDefault();
    const href = link.getAttribute('href') || '';
    if (/^#[a-z][a-z0-9-]*$/.test(href)) target?.ownerDocument.getElementById(href.slice(1))?.scrollIntoView({ block: 'start' });
  }
  return <>
    <iframe title={`Предпросмотр: ${project.name}`} srcDoc={html} sandbox="allow-same-origin" referrerPolicy="no-referrer" onLoad={(event) => setTarget(event.currentTarget.contentDocument?.getElementById('design-root') || null)} className={className} style={style} />
    {target && createPortal(<div onClick={navigateWithinDemo}><StudioRenderer key={page.id} project={project} page={page} assetUrls={assetUrls} /></div>, target)}
  </>;
}

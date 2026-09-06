import { memo, useMemo } from 'react';
import type { CSSProperties } from 'react';
import { domLines, sourceLines } from './dom';
import { highlightXRayLine } from './syntax';
import type { XRayLanguage, XRayLine, XRayManifest, XRayMode, XRaySection, XRaySelection } from './types';

export const CodeLines = memo(function CodeLines({ lines, language }: { lines: XRayLine[]; language: XRayLanguage }) {
  return <div className="xray-lines" data-language={language}>{lines.map((line, index) => <div className={`xray-line ${line.highlighted ? 'is-highlighted' : ''}`} key={`${line.number}-${index}`}>
    <span className="xray-line__number" aria-hidden="true">{line.number}</span><code>{highlightXRayLine(line.text, language)}</code>
  </div>)}</div>;
});

function SourceSection({ section, manifest, selection, mode, html }: { section: XRaySection; manifest: XRayManifest; selection: XRaySelection | null; mode: XRayMode; html: boolean }) {
  const focus = selection?.sectionId === section.id ? selection : null;
  const node = focus?.node?.file !== section.node?.file && focus?.node ? focus.node : section.node;
  const structure = mode === 'structure';
  const useSource = !structure && !html && node;
  const lines = useMemo(() => useSource ? sourceLines(manifest, node!, focus?.node, 64) : domLines(focus && !focus.node ? focus.element : section.element, focus?.element, structure, manifest), [useSource, manifest, node, focus, section.element, structure]);
  const file = node && manifest.files.find(item => item.id === node.file);
  const sourceLabel = useSource ? `${file?.path} · JSX` : structure ? 'DOM + сопоставленные компоненты' : 'HTML · актуальный DOM';
  // Active element's source starts near the element, but remains in the same physical section.
  const relativeFocus = focus ? Math.max(0, focus.rect.top - section.rect.top - 105) : 0;
  return <section className="xray-source-section" data-section={section.id} style={{ top: section.rect.top, left: Math.max(18, section.rect.left + 24), width: Math.min(section.rect.width - 48, innerWidth - 36), height: Math.max(0, section.rect.height) }}>
    <div className="xray-source-section__content" style={{ paddingTop: relativeFocus + 18 }}>
      <div className="xray-source-section__label"><span>{sourceLabel}</span><small>{section.title}</small></div>
      <CodeLines lines={lines} language={structure ? 'structure' : useSource ? 'tsx' : 'html'} />
    </div>
  </section>;
}

export function CodeLayer({ sections, manifest, selection, mode, html, brightness, closing }: { sections: XRaySection[]; manifest: XRayManifest; selection: XRaySelection | null; mode: XRayMode; html: boolean; brightness: number; closing: boolean }) {
  return <div className={`xray-code-layer ${closing ? 'is-closing' : ''}`} aria-hidden="true" data-nosnippet style={{ '--xray-code-brightness': brightness / 100 } as CSSProperties}>
    {sections.map(section => <SourceSection key={section.id} section={section} manifest={manifest} selection={selection} mode={mode} html={html} />)}
  </div>;
}

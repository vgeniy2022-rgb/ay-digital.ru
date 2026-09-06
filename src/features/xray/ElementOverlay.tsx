import type { CSSProperties } from 'react';
import type { XRayMode, XRaySelection } from './types';

export function ElementOverlay({ selection, mode }: { selection: XRaySelection | null; mode: XRayMode }) {
  if (!selection || selection.rect.width < 1 || selection.rect.height < 1) return null;
  const { rect, styles } = selection;
  const sides = (group: string) => ['top', 'right', 'bottom', 'left'].map(side => Number.parseFloat(styles[`${group}-${side}${group === 'border' ? '-width' : ''}`]) || 0);
  const margin = sides('margin'); const border = sides('border'); const padding = sides('padding');
  const positiveMargin = margin.map(value => Math.max(0, value));
  const boxStyle = { top: rect.top, left: rect.left, width: rect.width, height: rect.height };
  const labelStyle = { top: Math.max(5, Math.min(innerHeight - 32, rect.top - 28)), left: Math.max(8, Math.min(innerWidth - 240, rect.left)) };
  return <div className="xray-element-overlay" aria-hidden="true">
    {mode === 'box' ? <>
      <div className="xray-box-margin" style={{ top: rect.top - positiveMargin[0], left: rect.left - positiveMargin[3], width: rect.width + positiveMargin[1] + positiveMargin[3], height: rect.height + positiveMargin[0] + positiveMargin[2], borderWidth: positiveMargin.map(value => `${value}px`).join(' ') }} />
      <div className="xray-box-border" style={{ ...boxStyle, borderWidth: border.map(value => `${value}px`).join(' ') }} />
      <div className="xray-box-padding" style={{ top: rect.top + border[0], left: rect.left + border[3], width: Math.max(0, rect.width - border[1] - border[3]), height: Math.max(0, rect.height - border[0] - border[2]), borderWidth: padding.map(value => `${value}px`).join(' ') } as CSSProperties} />
    </> : null}
    <div className={`xray-element-outline ${mode === 'box' ? 'is-box' : ''}`} style={boxStyle} />
    <div className="xray-element-label" style={labelStyle}>{selection.node?.component && <b>{selection.node.component} · </b>}{selection.label}</div>
  </div>;
}

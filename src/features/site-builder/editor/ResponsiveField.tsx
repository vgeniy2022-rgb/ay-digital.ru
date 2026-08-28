import { useState } from 'react';
import type { ResponsiveSettings, ResponsiveStyle, StudioBreakpoint } from '../schema/types';
import { studioBreakpoints } from '../responsive/styleResolver';

const selectOptions = {
  display: ['', 'block', 'flex', 'grid', 'none'],
  direction: ['', 'row', 'column'],
  alignItems: ['', 'stretch', 'start', 'center', 'end'],
  justifyContent: ['', 'start', 'center', 'end', 'space-between'],
  textAlign: ['', 'left', 'center', 'right'],
  visibility: ['', 'visible', 'hidden'],
  shadow: ['', 'none', 'soft', 'medium', 'strong'],
} as const;

const numberKeys: Array<keyof ResponsiveStyle> = ['gap', 'columns', 'padding', 'margin', 'fontSize', 'lineHeight', 'radius', 'order'];
const textKeys: Array<keyof ResponsiveStyle> = ['width', 'minWidth', 'maxWidth', 'height', 'minHeight', 'background', 'border'];

const labels: Record<string, string> = {
  display: 'Display', direction: 'Direction', alignItems: 'Align', justifyContent: 'Justify', gap: 'Gap', columns: 'Columns',
  width: 'Width', minWidth: 'Min width', maxWidth: 'Max width', height: 'Height', minHeight: 'Min height', padding: 'Padding',
  margin: 'Margin', fontSize: 'Font size', lineHeight: 'Line height', textAlign: 'Text align', background: 'Background',
  border: 'Border', radius: 'Radius', shadow: 'Shadow', visibility: 'Visibility', order: 'Order',
};

export function ResponsiveField({ value = {}, onChange, readOnly }: { value?: ResponsiveSettings; onChange: (value: ResponsiveSettings) => void; readOnly?: boolean }) {
  const [active, setActive] = useState<StudioBreakpoint>('desktop');
  const override = value[active] || {};
  const patch = (key: keyof ResponsiveStyle, next: string | number | undefined) => {
    const responsive = { ...value, [active]: { ...override, [key]: next } };
    onChange(responsive);
  };
  return (
    <div className="studio-responsive-field">
      <div className="studio-responsive-field__breakpoints" role="tablist" aria-label="Адаптивные настройки">
        {studioBreakpoints.map((breakpoint) => (
          <button type="button" role="tab" aria-selected={active === breakpoint.id} className={active === breakpoint.id ? 'is-active' : ''} onClick={() => setActive(breakpoint.id)} key={breakpoint.id}>{breakpoint.label.slice(0, 1)}</button>
        ))}
      </div>
      <div className="studio-responsive-field__grid">
        {Object.entries(selectOptions).map(([key, options]) => (
          <label key={key}><span>{labels[key]}</span><select disabled={readOnly} value={String(override[key as keyof ResponsiveStyle] || '')} onChange={(event) => patch(key as keyof ResponsiveStyle, event.target.value || undefined)}>{options.map((option) => <option value={option} key={option}>{option || 'inherit'}</option>)}</select></label>
        ))}
        {numberKeys.map((key) => <label key={key}><span>{labels[key]}</span><input disabled={readOnly} type="number" value={typeof override[key] === 'number' ? String(override[key]) : ''} onChange={(event) => patch(key, event.target.value === '' ? undefined : Number(event.target.value))} /></label>)}
        {textKeys.map((key) => <label key={key}><span>{labels[key]}</span><input disabled={readOnly} type="text" value={typeof override[key] === 'string' ? String(override[key]) : ''} placeholder="inherit" onChange={(event) => patch(key, event.target.value || undefined)} /></label>)}
      </div>
      <button className="studio-responsive-field__reset" type="button" disabled={readOnly || !value[active]} onClick={() => {
        const next = { ...value };
        delete next[active];
        onChange(next);
      }}>Сбросить override для {active}</button>
    </div>
  );
}


import type { CSSProperties } from 'react';
import type { ResponsiveSettings, ResponsiveStyle, StudioBreakpoint, StudioThemeTokens } from '../schema/types';

export const studioBreakpoints: Array<{ id: StudioBreakpoint; label: string; width: number }> = [
  { id: 'desktop', label: 'Desktop', width: 1440 },
  { id: 'laptop', label: 'Laptop', width: 1024 },
  { id: 'tablet', label: 'Tablet', width: 768 },
  { id: 'mobile', label: 'Mobile', width: 390 },
];

const breakpointOrder: StudioBreakpoint[] = ['desktop', 'laptop', 'tablet', 'mobile'];

export function resolveResponsiveSettings(settings: ResponsiveSettings | undefined, breakpoint: StudioBreakpoint) {
  const index = breakpointOrder.indexOf(breakpoint);
  return breakpointOrder.slice(0, index + 1).reduce<ResponsiveStyle>((result, key) => ({ ...result, ...(settings?.[key] || {}) }), {});
}

export function responsiveStyleToCss(style: ResponsiveStyle, tokens: StudioThemeTokens): CSSProperties {
  const shadowIndex = style.shadow === 'soft' ? 1 : style.shadow === 'medium' ? 2 : style.shadow === 'strong' ? 3 : 0;
  return {
    display: style.visibility === 'hidden' ? 'none' : style.display,
    flexDirection: style.direction,
    alignItems: style.alignItems,
    justifyContent: style.justifyContent,
    gap: style.gap,
    gridTemplateColumns: style.columns ? `repeat(${style.columns}, minmax(0, 1fr))` : undefined,
    width: style.width,
    minWidth: style.minWidth,
    maxWidth: style.maxWidth,
    height: style.height,
    minHeight: style.minHeight,
    padding: style.padding,
    margin: style.margin,
    fontSize: style.fontSize,
    lineHeight: style.lineHeight,
    textAlign: style.textAlign,
    background: style.background,
    border: style.border,
    borderRadius: style.radius,
    boxShadow: tokens.shadows[shadowIndex],
    visibility: style.visibility,
    order: style.order,
  };
}

export function themeToCssVariables(theme: StudioThemeTokens): CSSProperties {
  return {
    '--sv-primary': theme.colors.primary,
    '--sv-secondary': theme.colors.secondary,
    '--sv-accent': theme.colors.accent,
    '--sv-background': theme.colors.background,
    '--sv-surface': theme.colors.surface,
    '--sv-text': theme.colors.text,
    '--sv-muted': theme.colors.muted,
    '--sv-border': theme.colors.border,
    '--sv-success': theme.colors.success,
    '--sv-error': theme.colors.error,
    '--sv-content': `${theme.contentWidths.default}px`,
    '--sv-content-wide': `${theme.contentWidths.wide}px`,
    '--sv-radius': `${theme.radii[4]}px`,
    '--sv-shadow': theme.shadows[1],
  } as CSSProperties;
}

const cssPropertyNames: Partial<Record<keyof ResponsiveStyle, string>> = {
  display: 'display', direction: 'flex-direction', alignItems: 'align-items', justifyContent: 'justify-content', gap: 'gap',
  columns: 'grid-template-columns', width: 'width', minWidth: 'min-width', maxWidth: 'max-width', height: 'height',
  minHeight: 'min-height', padding: 'padding', margin: 'margin', fontSize: 'font-size', lineHeight: 'line-height',
  textAlign: 'text-align', background: 'background', border: 'border', radius: 'border-radius', visibility: 'visibility', order: 'order',
};

function safeCssText(value: string) {
  return /[;{}]|url\s*\(|expression\s*\(/i.test(value) ? '' : value.trim();
}

function styleValue(key: keyof ResponsiveStyle, value: ResponsiveStyle[keyof ResponsiveStyle], theme: StudioThemeTokens) {
  if (value === undefined) return '';
  if (key === 'columns') return `repeat(${Math.max(1, Math.min(12, Number(value)))},minmax(0,1fr))`;
  if (key === 'gap' || key === 'padding' || key === 'margin' || key === 'fontSize' || key === 'radius') return `${Number(value)}px`;
  if (key === 'lineHeight' || key === 'order') return String(Number(value));
  if (key === 'shadow') {
    const index = value === 'soft' ? 1 : value === 'medium' ? 2 : value === 'strong' ? 3 : 0;
    return theme.shadows[index];
  }
  return typeof value === 'string' ? safeCssText(value) : String(value);
}

function declarations(style: ResponsiveStyle, theme: StudioThemeTokens) {
  return (Object.keys(style) as Array<keyof ResponsiveStyle>).map((key) => {
    if (key === 'shadow') return `box-shadow:${styleValue(key, style[key], theme)}`;
    if (key === 'visibility' && style[key] === 'hidden') return 'display:none';
    const property = cssPropertyNames[key];
    const value = styleValue(key, style[key], theme);
    return property && value ? `${property}:${value}` : '';
  }).filter(Boolean).join(';');
}

export function createResponsiveCss(id: string, settings: ResponsiveSettings | undefined, theme: StudioThemeTokens) {
  if (!settings) return '';
  const selector = `.sv-responsive-${id.replace(/[^a-z0-9_-]/gi, '')}`;
  const rules = [
    settings.desktop ? `${selector}{${declarations(settings.desktop, theme)}}` : '',
    settings.laptop ? `@media(max-width:1199px){${selector}{${declarations(settings.laptop, theme)}}}` : '',
    settings.tablet ? `@media(max-width:899px){${selector}{${declarations(settings.tablet, theme)}}}` : '',
    settings.mobile ? `@media(max-width:599px){${selector}{${declarations(settings.mobile, theme)}}}` : '',
  ];
  return rules.filter(Boolean).join('');
}

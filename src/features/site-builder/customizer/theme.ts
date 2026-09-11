import type { CSSProperties } from 'react';
import type { StudioThemeTokens } from '../schema/types';
import type { DesignKey } from '../designs/types';

export const fontPairs = [
  { id: 'editorial', name: 'Редакционный · Georgia + Arial', heading: 'Georgia, serif', body: 'Arial, sans-serif', weight: 400 },
  { id: 'modern', name: 'Современный · Arial', heading: 'Arial, sans-serif', body: 'Arial, sans-serif', weight: 700 },
  { id: 'technical', name: 'Технический · Impact + Arial', heading: 'Impact, Arial, sans-serif', body: 'Arial, sans-serif', weight: 500 },
  { id: 'humanist', name: 'Мягкий · Trebuchet MS + Arial', heading: '"Trebuchet MS", Arial, sans-serif', body: 'Arial, sans-serif', weight: 600 },
] as const;
export const palettes = [
  { id: 'original', name: 'Исходная палитра' }, { id: 'ocean', name: 'Морская' },
  { id: 'berry', name: 'Ягодная' }, { id: 'forest', name: 'Лесная' }, { id: 'sand', name: 'Песочная' },
] as const;
const original: Record<DesignKey, [string, string, string, string, string, string]> = {
  salon: ['#faf7f1','#27211f','#6b645f','#743b4a','#f0e9e1','#ddd4cb'],
  garage: ['#161a1b','#f1f2e9','#b4b9b7','#dfff00','#242a2b','#414747'],
  coffee: ['#f5eddc','#3f251c','#7d6150','#9b3e24','#e9ddc6','#cfbda2'],
  school: ['#f6f5fa','#34314e','#747184','#62567e','#eae6f0','#d5cfdf'],
  tech: ['#f3f5f8','#17202f','#637080','#3159e7','#e4e9f1','#cbd3de'],
  marine: ['#f8faf9','#102f42','#5c7280','#0d6668','#e9f0f1','#c4d2d7'],
  barber: ['#201e1b','#f4ecdb','#c0b7a7','#d7af72','#302d28','#514b42'],
  nails: ['#fff8f8','#512c41','#805f70','#9b3a65','#f5e6eb','#e3c8d4'],
  detailing: ['#101a24','#f1f7fb','#abbfce','#75d4ef','#1d2c39','#394e5f'],
  tires: ['#f4f3ee','#232522','#62675e','#b53627','#e7e8df','#c6c9bf'],
  restaurant: ['#192d27','#f8f0da','#b8c3b1','#e2c59b','#283e34','#486051'],
  bakery: ['#fff1d6','#512e20','#85604a','#aa4826','#f6ddb2','#dcb68c'],
  language: ['#f3f7fc','#203d59','#57718b','#ae3e35','#e2edf9','#bed1e7'],
  training: ['#f7f8fc','#202e52','#636f8b','#304eb4','#e7ebf6','#c6cee3'],
  photographer: ['#f4f4f0','#262825','#656961','#724935','#e6e7e0','#c8ccc0'],
  psychologist: ['#fbf8f3','#39423e','#63716b','#466657','#edf0e9','#cdd7ce'],
  tutor: ['#f8f9ff','#283756','#5d6b87','#3858ad','#e9edf9','#c5d0e5'],
  clothing: ['#f8f5f0','#292321','#71675f','#813e2c','#ede5dc','#d9cabe'],
  florist: ['#fff8f2','#493640','#78626d','#963e62','#f4e6df','#ddc6c9'],
  logistics: ['#102b3b','#eff7fb','#b1c7d0','#81d6e0','#1d3d4d','#416273'],
  wholesale: ['#f6f8fa','#17334a','#607484','#27698e','#e6eef3','#bed0dc'],
  lodge: ['#f5f2e9','#283c34','#617165','#355e49','#e4eadd','#c5d0bc'],
  tours: ['#f9f4e8','#263d38','#65726a','#a14728','#ebe9d9','#cbd1bd'],
  boat: ['#0f2c43','#f4f8fa','#b4cad9','#c9e9f0','#1c4058','#436479'],
  renovation: ['#242724','#f5f1e6','#bfc2b4','#ecc56b','#343a32','#575e51'],
  furniture: ['#f5f0e6','#40362b','#77695b','#73583c','#e6dfd1','#cfc2af'],
  cleaning: ['#f3fbfc','#163e4d','#527380','#17668a','#dfedf2','#b6d4de'],
  grooming: ['#fff4e8','#4b342b','#80675a','#a14431','#f5e2ce','#dfc2aa'],
  pethotel: ['#f2f6ec','#334336','#687662','#4a6741','#e0e8d7','#c1cfb6'],
  dogtrainer: ['#f7f4e1','#283128','#62705a','#516522','#e6e9cf','#c8cead'],
};
export const defaultDesignMode = (design: DesignKey): 'light' | 'dark' => ['garage','barber','detailing','restaurant','logistics','boat','renovation'].includes(design) ? 'dark' : 'light';
export const isHexColor = (value: string) => /^#[0-9a-f]{6}$/i.test(value);
export function themeColors(design: DesignKey, palette: string, mode: 'light' | 'dark', previous: StudioThemeTokens['colors']) {
  let values = original[design];
  if (palette !== 'original') {
    const options: Record<string, typeof values> = {
      ocean: ['#f2f6fb','#122c45','#56677a','#2365bd','#e2ebf5','#c0d0e2'],
      berry: ['#fcf5f8','#382332','#745a6b','#a63365','#f2e5ed','#ddc6d5'],
      forest: ['#f3f8f4','#173c2b','#52715e','#216849','#e2eee5','#bfd4c5'],
      sand: ['#faf4e9','#3c2b1e','#76604b','#99552a','#eee1cb','#d7c2a4'],
    };
    values = options[palette] || values;
  }
  let [background,text,muted,accent,surface,border] = values;
  if (mode === 'dark' && !(defaultDesignMode(design) === 'dark' && palette === 'original')) {
    background = '#151c26'; text = '#f3f5f9'; muted = '#b7c3d3'; surface = '#232e3d'; border = '#46556a';
    // Accent remains user-selectable; button text contrast is calculated separately.
  } else if (mode === 'light' && design === 'garage' && palette === 'original') {
    background = '#f3f5ed'; text = '#1b2516'; muted = '#59634f'; surface = '#e6eadc'; border = '#c1c9b5'; accent = '#4c6819';
  } else if (mode === 'light' && defaultDesignMode(design) === 'dark' && palette === 'original') {
    background = '#f6f4ef'; text = '#24333c'; muted = '#566975'; surface = '#e7ecec'; border = '#bfcdd1'; accent = '#285774';
  }
  return { ...previous, background, text, muted, accent, primary: accent, surface, border, secondary: text };
}
export function applyFont(theme: StudioThemeTokens, id: string): StudioThemeTokens {
  const pair = fontPairs.find(p => p.id === id) || fontPairs[0];
  return { ...theme, typography: { ...theme.typography,
    h1: `${pair.weight} 64px/1.02 ${pair.heading}`, h2: `${pair.weight} 44px/1.1 ${pair.heading}`,
    h3: `${pair.weight} 24px/1.2 ${pair.heading}`, body: `400 17px/1.6 ${pair.body}`,
  } };
}
export function selectedFont(theme: StudioThemeTokens) { return fontPairs.find(p => theme.typography.h1 === `${p.weight} 64px/1.02 ${p.heading}`) || fontPairs[0]; }
export function initialDesignTheme(theme: StudioThemeTokens, design: DesignKey) {
  const font = ['garage','tires','renovation','dogtrainer'].includes(design) ? 'technical' : ['tech','marine','detailing','training','logistics','wholesale','boat','cleaning'].includes(design) ? 'modern' : ['language','tutor','grooming','pethotel'].includes(design) ? 'humanist' : 'editorial';
  return applyFont({ ...structuredClone(theme), colors: themeColors(design, 'original', defaultDesignMode(design), theme.colors), radii: [0,4,8,design === 'tech' ? 9 : ['language','nails'].includes(design) ? 12 : 0,18,24] }, font);
}
function luminance(hex: string) {
  const rgb = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255).map(v => v <= .04045 ? v/12.92 : ((v+.055)/1.055)**2.4);
  return .2126*rgb[0]+.7152*rgb[1]+.0722*rgb[2];
}
export function accentTextColor(hex: string) { return (luminance(hex)+.05)/.05 > 1.05/(luminance(hex)+.05) ? '#000000' : '#ffffff'; }
/** Only checked colors, bounded radii and predefined font families enter CSS. No custom CSS input. */
export function customDesignVariables(theme: StudioThemeTokens): CSSProperties {
  const pair = selectedFont(theme);
  const color = (key: keyof StudioThemeTokens['colors'], fallback: string) => isHexColor(theme.colors[key]) ? theme.colors[key] : fallback;
  const accent = color('accent','#3159e7');
  return {
    '--d-bg':color('background','#faf7f1'), '--d-ink':color('text','#17202f'), '--d-muted':color('muted','#637080'),
    '--d-accent':accent, '--d-panel':color('surface','#e4e9f1'), '--d-line':color('border','#cbd3de'),
    '--d-on-accent':accentTextColor(accent), '--d-heading-font':pair.heading, '--d-body-font':pair.body, '--d-heading-weight':pair.weight,
    '--d-radius':`${Math.max(0,Math.min(32,Number(theme.radii[3])||0))}px`,
  } as CSSProperties;
}

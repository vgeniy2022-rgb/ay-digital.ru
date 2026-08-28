import type { StudioThemeTokens } from './types';

export const defaultStudioTheme: StudioThemeTokens = {
  colors: {
    primary: '#1769ff',
    secondary: '#111827',
    accent: '#13a56f',
    background: '#f5f7fa',
    surface: '#ffffff',
    text: '#111827',
    muted: '#667085',
    border: '#d9dee7',
    success: '#13a56f',
    error: '#dc3545',
  },
  typography: {
    display: '800 64px/1.02 Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    h1: '800 52px/1.06 Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    h2: '760 38px/1.12 Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    h3: '720 24px/1.2 Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    body: '400 17px/1.65 Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    small: '500 14px/1.5 Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    button: '700 15px/1 Inter, -apple-system, BlinkMacSystemFont, sans-serif',
    caption: '700 12px/1.3 Inter, -apple-system, BlinkMacSystemFont, sans-serif',
  },
  contentWidths: { narrow: 760, default: 1120, wide: 1320 },
  spacing: [0, 4, 8, 12, 16, 24, 32, 48, 64, 96, 128],
  radii: [0, 4, 8, 12, 18, 24],
  shadows: [
    'none',
    '0 10px 30px rgba(15, 23, 42, 0.08)',
    '0 18px 48px rgba(15, 23, 42, 0.12)',
    '0 30px 80px rgba(15, 23, 42, 0.18)',
  ],
  buttonPreset: 'solid',
};


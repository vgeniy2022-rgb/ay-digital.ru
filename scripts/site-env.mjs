import { loadEnv } from 'vite';

export function resolveSiteUrl(rootDir, mode = 'production') {
  const fileEnv = loadEnv(mode, rootDir, '');
  const value = (process.env.VITE_SITE_URL || fileEnv.VITE_SITE_URL || '').trim();

  if (!value) {
    throw new Error('VITE_SITE_URL is required for canonical, sitemap, robots, Open Graph and JSON-LD URLs.');
  }

  return value.replace(/\/$/, '');
}

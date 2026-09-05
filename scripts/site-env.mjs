import { loadEnv } from 'vite';
import { resolvePublicOrigin } from '../src/config/publicOrigin.mjs';

export function resolveSiteUrl(rootDir, mode = 'production') {
  const fileEnv = loadEnv(mode, rootDir, '');
  return resolvePublicOrigin(process.env.VITE_SITE_URL || fileEnv.VITE_SITE_URL);
}

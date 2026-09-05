import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolvePublicOrigin } from './src/config/publicOrigin.mjs';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const publicOrigin = resolvePublicOrigin(process.env.VITE_SITE_URL || env.VITE_SITE_URL);

  return {
    plugins: [react(), {
      name: 'sitevl-public-origin',
      transformIndexHtml: { order: 'pre', handler: (html) => html.replaceAll('%VITE_SITE_URL%', publicOrigin) },
    }],
    build: {
      rollupOptions: {
        output: {
          onlyExplicitManualChunks: true,
          manualChunks(id) {
            if (!id.includes('/node_modules/three/')) return undefined;
            if (id.endsWith('/src/renderers/WebGLRenderer.js')) return 'three-renderer';
            return undefined;
          },
        },
      },
    },
  };
});

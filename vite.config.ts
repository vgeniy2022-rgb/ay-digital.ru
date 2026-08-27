import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  if (!env.VITE_SITE_URL && !process.env.VITE_SITE_URL) {
    throw new Error('VITE_SITE_URL must be set before building SITEVL.');
  }

  return {
    plugins: [react()],
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

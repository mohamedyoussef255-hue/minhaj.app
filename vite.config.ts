import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import express from 'express';
import { defineConfig, type Plugin } from 'vite';
import { apiRouter } from './src/server/api.ts';

const apiMiddlewarePlugin = (): Plugin => ({
  name: 'minhaj-api-middleware',
  configureServer(server) {
    const app = express();
    app.use(express.json());
    app.use('/api/v1', apiRouter);
    app.use('/api', apiRouter);
    server.middlewares.use(app);
  },
});

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiMiddlewarePlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

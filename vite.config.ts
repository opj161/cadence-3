/// <reference types="vitest/config" />

import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  base: '/cadence-3/',
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [tailwindcss(), react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // react-dom/client is the module the app actually imports; without it
          // React ends up in the entry chunk and this split does nothing.
          'react-vendor': ['react', 'react/jsx-runtime', 'react-dom', 'react-dom/client'],
          codemirror: ['@codemirror/state', '@codemirror/view', '@codemirror/language', '@uiw/react-codemirror'],
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
  test: {
    environment: 'jsdom',
    setupFiles: './vitest.setup.ts',
  },
});

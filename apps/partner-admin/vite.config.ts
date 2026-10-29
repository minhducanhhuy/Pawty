import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@pawty/types': path.resolve(__dirname, '../../packages/types/src/index.ts'),
      '@pawty/utils': path.resolve(__dirname, '../../packages/utils/src/index.ts'),
      '@pawty/validators': path.resolve(__dirname, '../../packages/validators/src/index.ts'),
    },
  },
  server: {
    port: 5174,
    host: true,
  },
});


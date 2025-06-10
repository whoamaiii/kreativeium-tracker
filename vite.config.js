import { defineConfig } from 'vite';
import path from 'path';

const useMock = process.env.VITE_USE_MOCK === 'true';

export default defineConfig({
  root: 'kreativium',
  server: {
    port: 5173,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
  resolve: {
    alias: useMock
      ? {
          './js/data-manager.js': path.resolve(__dirname, 'kreativium/js/data-manager.mock.js'),
        }
      : {},
  },
}); 
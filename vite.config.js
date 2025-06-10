import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  root: 'kreativium',
  server: {
    port: 5173,
  },
  build: {
    outDir: path.resolve(__dirname, 'dist'),
    emptyOutDir: true,
  },
}); 
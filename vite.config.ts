import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    target: 'es2020',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 50,
  },
  server: {
    open: true,
  },
});

import { defineConfig } from 'vite';
import { resolve } from 'path';

const coepHeaders = {
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Embedder-Policy': 'require-corp',
};

export default defineConfig({
  build: {
    target: 'es2020',
    reportCompressedSize: true,
    chunkSizeWarningLimit: 4096,
    assetsInlineLimit: 0,
  },
  server: {
    open: true,
    headers: coepHeaders,
    fs: {
      allow: [
        resolve(__dirname),
        resolve(__dirname, 'node_modules', 'onnxruntime-web'),
      ],
    },
  },
  preview: {
    headers: coepHeaders,
  },
  optimizeDeps: {
    exclude: ['onnxruntime-web'],
  },
  plugins: [
    {
      name: 'serve-onnx-wasm',
      configureServer(server) {
        server.middlewares.use((req, res, next) => {
          if (req.url?.startsWith('/ort/')) {
            // Redirect to node_modules
            const filePath = resolve(__dirname, 'node_modules', 'onnxruntime-web', 'dist', req.url.replace('/ort/', ''));
            req.url = `/@fs/${filePath}`;
          }
          next();
        });
      },
    },
  ],
});

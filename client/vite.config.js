import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath, URL } from 'node:url';

// In development, /api requests are forwarded to the Express backend.
export default defineConfig({
  plugins: [react()],
  // Force Rollup to include React's scheduler dependency in the browser bundle.
  // Without this explicit resolution, a static server can receive a bare
  // `import "scheduler"`, which browsers cannot resolve.
  resolve: {
    alias: {
      scheduler: fileURLToPath(new URL('./node_modules/scheduler/index.js', import.meta.url)),
    },
  },
  server: { port: 5173, proxy: { '/api': 'http://localhost:5000' } },
});

import { defineConfig, devices } from '@playwright/test';
const backendPort = process.env.E2E_BACKEND_PORT || '5000';

export default defineConfig({
  testDir: './tests',
  reporter: 'html',
  retries: process.env.CI ? 1 : 0,
  use: { ...devices['Desktop Chrome'], baseURL: 'http://127.0.0.1:5173', trace: 'on-first-retry', screenshot: 'on' },
  webServer: [
    { command: 'npm start', cwd: '../server', port: Number(backendPort), reuseExistingServer: !process.env.CI, env: { ...process.env, ANTHROPIC_API_KEY: '', PORT: backendPort } },
    { command: 'npm run dev -- --host 127.0.0.1', cwd: '../client', port: 5173, reuseExistingServer: !process.env.CI, env: { ...process.env, VITE_API_URL: `http://127.0.0.1:${backendPort}` } },
  ],
});

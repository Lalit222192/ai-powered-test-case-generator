import { defineConfig, devices } from '@playwright/test';

// This configuration is used by the in-app Run All button. The application
// servers are already running, so it deliberately does not start web servers
// or wait for ports that the button request itself depends on.
export default defineConfig({
  testDir: './tests',
  reporter: 'json',
  retries: 0,
  timeout: 30_000,
  use: {
    ...devices['Desktop Chrome'],
    baseURL: process.env.E2E_FRONTEND_URL || 'http://127.0.0.1:5173',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },
});

import { expect, test } from '@playwright/test';
const base = `http://127.0.0.1:${process.env.E2E_BACKEND_PORT || '5000'}`;
test('demo API health and generation contract', async ({ request }) => {
  const health = await request.get(`${base}/api/health`); expect(health.ok()).toBeTruthy(); expect((await health.json()).aiConfigured).toBeFalsy();
  expect((await request.post(`${base}/api/generate`, { data: {} })).status()).toBe(400);
  const generated = await request.post(`${base}/api/generate`, { data: { requirement: 'Create a login system where users sign in with email and password.' } });
  expect(generated.status()).toBe(200); const body = await generated.json(); expect(body.source).toBe('demo'); expect(Array.isArray(body.testCases)).toBeTruthy();
});

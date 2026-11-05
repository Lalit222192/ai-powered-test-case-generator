import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

async function demoLogin(page) {
  await page.getByRole('button', { name: 'View demo cases' }).first().click();
  await expect(page.getByText('DEMO result - not AI-generated')).toBeVisible();
}

test.beforeEach(async ({ page }) => { await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.reload(); });

test('app loads in Demo mode', async ({ page }) => { await expect(page.getByText('Demo mode (no API key)')).toBeVisible(); });
test('empty and short requirement are validated client-side', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate Test Cases', exact: true }).click();
  await page.getByRole('button', { name: /Generate \(demo\)/ }).click();
  await expect(page.getByRole('alert')).toContainText('Please enter');
  await page.getByLabel('Software requirement').fill('short');
  await page.getByRole('button', { name: /Generate \(demo\)/ }).click();
  await expect(page.getByRole('alert')).toContainText('too short');
});
test('sample demo cases open Manage with truthful badge', async ({ page }) => { await page.getByRole('button', { name: 'Generate Test Cases', exact: true }).click(); await demoLogin(page); await expect(page.locator('tbody tr').first()).toBeVisible(); });
test('status changes update Dashboard', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate Test Cases', exact: true }).click(); await demoLogin(page);
  await page.getByLabel('Status of TC-001').selectOption('Pass');
  await page.getByRole('button', { name: 'Dashboard' }).click();
  await expect(page.getByText('Passed').locator('..')).toContainText('1');
});
test('search and filters combine', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate Test Cases', exact: true }).click(); await demoLogin(page);
  await page.getByPlaceholder('Search by ID or scenario').fill('TC-001'); await expect(page.locator('tbody tr')).toHaveCount(1);
  await page.getByPlaceholder('Search by ID or scenario').fill(''); await page.getByLabel('Filter by priority').selectOption('High'); await page.getByLabel('Filter by status').selectOption('Not Run');
  const rows = await page.locator('tbody tr').allTextContents();
  expect(rows.length).toBeGreaterThan(0); expect(rows.every((row) => row.includes('High') && row.includes('Not Run'))).toBeTruthy();
});
test('edit, delete, export, and reload preserve cases', async ({ page }) => {
  await page.getByRole('button', { name: 'Generate Test Cases', exact: true }).click(); await demoLogin(page);
  await page.getByRole('button', { name: 'Edit' }).first().click(); await page.getByLabel('Test scenario').fill('Edited scenario'); await page.getByRole('button', { name: 'Save changes' }).click(); await expect(page.getByText('Edited scenario')).toBeVisible();
  await page.getByPlaceholder('Search by ID or scenario').fill('TC-001');
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: /Export CSV/ }).click(); const file = await download; expect(await file.suggestedFilename()).toContain('.csv');
  const csv = readFileSync(await file.path(), 'utf8').replace(/^\uFEFF/, ''); expect(csv.split('\r\n')[0]).toContain('Linked Requirement'); expect((csv.match(/\r?\n"TC-/g) || []).length).toBe(1);
  await page.reload(); await page.getByRole('button', { name: 'Manage Test Cases', exact: true }).click(); await expect(page.getByText('Edited scenario')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept()); await page.getByRole('button', { name: 'Delete' }).first().click(); await expect(page.getByText('Edited scenario')).not.toBeVisible();
});

import { expect, test } from '@playwright/test';

test('test run records execution details and survives reload', async ({ page }) => {
  await page.goto('/'); await page.evaluate(() => localStorage.clear()); await page.reload();
  await page.getByRole('button', { name: 'Generate Test Cases', exact: true }).click();
  await page.getByRole('button', { name: 'View demo cases' }).first().click();
  await page.getByRole('button', { name: 'Start test run' }).click();
  await page.getByLabel('Run title').fill('Login regression build 1');
  await page.getByRole('button', { name: 'Start run from current suite' }).click();
  await expect(page.getByRole('heading', { name: 'Login regression build 1' })).toBeVisible();
  await page.getByLabel('Run status of TC-001').selectOption('Pass');
  await page.getByLabel('Actual result for TC-001').fill('Dashboard opened for the valid test user.');
  await expect(page.getByText('Executed').locator('..')).toContainText('1');
  await page.reload(); await page.getByRole('button', { name: 'Test Runs' }).click();
  await expect(page.getByText('Dashboard opened for the valid test user.')).toBeVisible();
});

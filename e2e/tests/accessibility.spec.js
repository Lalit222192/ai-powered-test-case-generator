import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
async function assertAccessible(page) { const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze(); expect(results.violations.filter((v) => ['serious', 'critical'].includes(v.impact))).toEqual([]); }
test('core pages have no serious accessibility violations', async ({ page }) => {
  await page.goto('/'); await assertAccessible(page);
  await page.getByRole('button', { name: 'Generate Test Cases', exact: true }).click(); await assertAccessible(page);
  await page.getByRole('button', { name: 'View demo cases' }).first().click(); await assertAccessible(page);
});

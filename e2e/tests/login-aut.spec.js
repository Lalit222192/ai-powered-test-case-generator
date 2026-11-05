import { expect, test } from '@playwright/test';

async function openLab(page) {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Automation Lab' }).click();
}

test.describe('Login Application Under Test', () => {
  test('AUT-REGISTER-001: valid registration creates an account state', async ({ page }) => {
    const email = `new.${Date.now()}@example.com`;
    await openLab(page); await page.getByRole('button', { name: 'Registration' }).click();
    await page.getByTestId('aut-register-name').fill('QA Tester'); await page.getByTestId('aut-register-email').fill(email);
    await page.getByTestId('aut-register-password').fill('SecurePass123!'); await page.getByTestId('aut-register-confirm').fill('SecurePass123!');
    await page.getByTestId('aut-register-submit').click(); await expect(page.getByTestId('signed-in-state')).toContainText('Registration successful');
  });
  test('AUT-LOGIN-001: registered credentials create a signed-in state', async ({ page, request }) => {
    await request.post(`http://127.0.0.1:${process.env.E2E_BACKEND_PORT || '5000'}/api/auth/register`, { data: { name: 'QA Tester', email: 'qa.tester@example.com', password: 'SecurePass123!' } });
    await openLab(page);
    await page.getByTestId('aut-email').fill('qa.tester@example.com');
    await page.getByTestId('aut-password').fill('SecurePass123!');
    await page.getByTestId('aut-login-submit').click();
    await expect(page.getByTestId('signed-in-state')).toContainText('Welcome, QA Tester');
  });

  test('AUT-LOGIN-002: required fields display an error', async ({ page }) => {
    await openLab(page);
    await page.getByTestId('aut-login-submit').click();
    await expect(page.getByTestId('login-error')).toHaveText('Email and password are required.');
  });

  test('AUT-LOGIN-003: invalid email format is rejected', async ({ page }) => {
    await openLab(page);
    await page.getByTestId('aut-email').fill('not-an-email');
    await page.getByTestId('aut-password').fill('SecurePass123!');
    await page.getByTestId('aut-login-submit').click();
    await expect(page.getByTestId('login-error')).toHaveText('Enter a valid email address.');
  });

  test('AUT-LOGIN-004: wrong credentials do not sign in', async ({ page }) => {
    await openLab(page);
    await page.getByTestId('aut-email').fill('qa.tester@example.com');
    await page.getByTestId('aut-password').fill('WrongPass123!');
    await page.getByTestId('aut-login-submit').click();
    await expect(page.getByTestId('login-error')).toHaveText('Incorrect email or password.');
    await expect(page.getByTestId('signed-in-state')).toHaveCount(0);
  });

  test('AUT-LOGIN-005: short password boundary is rejected', async ({ page }) => {
    await openLab(page);
    await page.getByTestId('aut-email').fill('qa.tester@example.com');
    await page.getByTestId('aut-password').fill('1234567');
    await page.getByTestId('aut-login-submit').click();
    await expect(page.getByTestId('login-error')).toHaveText('Password must be at least 8 characters.');
  });
});

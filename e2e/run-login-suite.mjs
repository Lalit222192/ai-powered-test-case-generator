import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseURL = process.env.E2E_FRONTEND_URL || 'http://127.0.0.1:5173';
const apiURL = `http://127.0.0.1:${process.env.E2E_BACKEND_PORT || '5001'}`;
const evidenceDir = path.resolve('test-results', 'button-run');

async function openLab(page) {
  await page.goto(baseURL);
  await page.evaluate(() => localStorage.clear());
  await page.reload();
  await page.getByRole('button', { name: 'Automation Lab' }).click();
}
async function ensure(condition, message) { if (!condition) throw new Error(message); }

const cases = [
  ['AUT-REGISTER-001', 'Valid registration creates an account state', async (page) => {
    const email = `new.${Date.now()}@example.com`;
    await openLab(page); await page.getByRole('button', { name: 'Registration' }).click();
    await page.getByTestId('aut-register-name').fill('QA Tester'); await page.getByTestId('aut-register-email').fill(email);
    await page.getByTestId('aut-register-password').fill('SecurePass123!'); await page.getByTestId('aut-register-confirm').fill('SecurePass123!');
    await page.getByTestId('aut-register-submit').click();
    await ensure((await page.getByTestId('signed-in-state').textContent()).includes('Registration successful'), 'Registration success screen was not shown.');
  }],
  ['AUT-LOGIN-001', 'Registered credentials create a signed-in state', async (page) => {
    const email = `qa.${Date.now()}@example.com`;
    const response = await fetch(`${apiURL}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'QA Tester', email, password: 'SecurePass123!' }) });
    await ensure(response.ok, 'Could not create the automation account.');
    await openLab(page); await page.getByTestId('aut-email').fill(email); await page.getByTestId('aut-password').fill('SecurePass123!'); await page.getByTestId('aut-login-submit').click();
    await ensure((await page.getByTestId('signed-in-state').textContent()).includes('Welcome, QA Tester'), 'Signed-in screen was not shown.');
  }],
  ['AUT-LOGIN-002', 'Required fields display an error', async (page) => {
    await openLab(page); await page.getByTestId('aut-login-submit').click();
    await ensure((await page.getByTestId('login-error').textContent()) === 'Email and password are required.', 'Required-field message was incorrect.');
  }],
  ['AUT-LOGIN-003', 'Invalid email format is rejected', async (page) => {
    await openLab(page); await page.getByTestId('aut-email').fill('not-an-email'); await page.getByTestId('aut-password').fill('SecurePass123!'); await page.getByTestId('aut-login-submit').click();
    await ensure((await page.getByTestId('login-error').textContent()) === 'Enter a valid email address.', 'Invalid-email message was incorrect.');
  }],
  ['AUT-LOGIN-004', 'Wrong credentials do not sign in', async (page) => {
    await openLab(page); await page.getByTestId('aut-email').fill('missing@example.com'); await page.getByTestId('aut-password').fill('WrongPass123!'); await page.getByTestId('aut-login-submit').click();
    await ensure((await page.getByTestId('login-error').textContent()) === 'Incorrect email or password.', 'Wrong-credentials message was incorrect.');
  }],
  ['AUT-LOGIN-005', 'Short password boundary is rejected', async (page) => {
    await openLab(page); await page.getByTestId('aut-email').fill('qa@example.com'); await page.getByTestId('aut-password').fill('1234567'); await page.getByTestId('aut-login-submit').click();
    await ensure((await page.getByTestId('login-error').textContent()) === 'Password must be at least 8 characters.', 'Password boundary message was incorrect.');
  }],
];

await mkdir(evidenceDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const results = [];
for (const [id, title, execute] of cases) {
  const page = await browser.newPage();
  let status = 'Pass'; let error = null;
  try { await execute(page); } catch (cause) { status = 'Fail'; error = cause.message; }
  const screenshot = path.join(evidenceDir, `${id}.png`);
  await page.screenshot({ path: screenshot, fullPage: true });
  await page.close();
  results.push({ id, title, status, error, screenshot });
}
await browser.close();
console.log(JSON.stringify({ completedAt: new Date().toISOString(), results }));

// A deterministic application-under-test used for real Playwright demonstrations.
// It is intentionally local and never represents a production authentication system.
export const DEMO_ACCOUNT = { email: 'qa.tester@example.com', password: 'SecurePass123!' };

export function validateLogin({ email = '', password = '' }) {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !password) return { ok: false, code: 'REQUIRED', message: 'Email and password are required.' };
  if (!/^\S+@\S+\.\S+$/.test(cleanEmail)) return { ok: false, code: 'EMAIL_FORMAT', message: 'Enter a valid email address.' };
  if (password.length < 8) return { ok: false, code: 'PASSWORD_LENGTH', message: 'Password must be at least 8 characters.' };
  if (cleanEmail !== DEMO_ACCOUNT.email || password !== DEMO_ACCOUNT.password) return { ok: false, code: 'INVALID_CREDENTIALS', message: 'Incorrect email or password.' };
  return { ok: true, user: { name: 'QA Tester', email: DEMO_ACCOUNT.email } };
}

export function validateRegistration({ name = '', email = '', password = '', confirmPassword = '' }) {
  if (!name.trim() || !email.trim() || !password || !confirmPassword) return { ok: false, message: 'All registration fields are required.' };
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) return { ok: false, message: 'Enter a valid email address.' };
  if (password.length < 8) return { ok: false, message: 'Password must be at least 8 characters.' };
  if (password !== confirmPassword) return { ok: false, message: 'Passwords do not match.' };
  return { ok: true, message: 'Registration completed. Your account is ready.' };
}

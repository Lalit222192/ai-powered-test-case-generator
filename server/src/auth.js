import crypto from 'node:crypto';

const hash = (password, salt = crypto.randomBytes(16).toString('hex')) => ({ salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') });
const same = (password, user) => crypto.timingSafeEqual(Buffer.from(hash(password, user.salt).hash, 'hex'), Buffer.from(user.hash, 'hex'));
const emailOk = (email) => /^\S+@\S+\.\S+$/.test(String(email || '').trim());

// Local demo account store. Passwords are never stored as plain text.
export function createAuthStore() {
  const users = new Map(); const sessions = new Map();
  function register({ name, email, password }) {
    const clean = String(email || '').trim().toLowerCase();
    if (!String(name || '').trim() || !clean || !password) return { error: 'All registration fields are required.' };
    if (!emailOk(clean)) return { error: 'Enter a valid email address.' };
    if (password.length < 8) return { error: 'Password must be at least 8 characters.' };
    if (users.has(clean)) return { error: 'An account with this email already exists.' };
    users.set(clean, { name: name.trim(), email: clean, ...hash(password) });
    return login({ email: clean, password });
  }
  function login({ email, password }) {
    const clean = String(email || '').trim().toLowerCase(); const user = users.get(clean);
    if (!clean || !password) return { error: 'Email and password are required.' };
    if (!emailOk(clean)) return { error: 'Enter a valid email address.' };
    if (!user || !same(password, user)) return { error: 'Incorrect email or password.' };
    const token = crypto.randomBytes(24).toString('hex'); sessions.set(token, clean);
    return { user: { name: user.name, email: user.email }, token };
  }
  function logout(token) { sessions.delete(token); }
  return { register, login, logout };
}

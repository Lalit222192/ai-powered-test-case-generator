// All communication with the Express backend lives here.
// Vite's development server proxies `/api` requests. The deployed local
// static build is served separately, so point it at the Node API by default.
const BASE = import.meta.env.VITE_API_URL || (import.meta.env.PROD
  ? `${window.location.protocol}//${window.location.hostname}:5001`
  : '');

async function request(path, options) {
  let res;
  try {
    res = await fetch(BASE + path, options);
  } catch {
    throw new Error('Cannot reach the backend. Make sure the server is running (npm start inside /server).');
  }
  let data = null;
  try { data = await res.json(); } catch { /* non-JSON response */ }
  if (!res.ok) throw new Error(data?.error || `Request failed (status ${res.status}).`);
  return data;
}

export const getStatus = () => request('/api/health');

export const generateTestCases = (requirement, useDemo) =>
  request('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ requirement, useDemo }),
  });
export const registerAccount = (body) => request('/api/auth/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const loginAccount = (body) => request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
export const runLoginSuite = () => request('/api/automation/run-login-suite', { method: 'POST' });

// Dependency-free development server. It exposes the same public API as the
// Express app, so the UI remains usable if package loading is unavailable.
import http from 'node:http';
import crypto from 'node:crypto';
import path from 'node:path';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { demoGenerate } from './demo.js';
import { validateRequirement, validateTestCases } from './validate.js';

const users = new Map();
const artifactDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'artifacts');
const send = (res, status, body) => {
  res.writeHead(status, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' });
  res.end(body === undefined ? '' : JSON.stringify(body));
};
export function startStandalone(port, { apiKey = '' } = {}) {
  const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url?.startsWith('/api/automation/artifacts/')) {
      const name = path.basename(decodeURIComponent(req.url.slice('/api/automation/artifacts/'.length)));
      try {
        const data = await readFile(path.join(artifactDir, name));
        res.writeHead(200, { 'Content-Type': name.endsWith('.png') ? 'image/png' : 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(data);
      } catch { return send(res, 404, { error: 'Automation artifact not found.' }); }
    }
    if (req.method === 'OPTIONS') return send(res, 204);
    let raw = '';
    for await (const chunk of req) raw += chunk;
    let body = {};
    try { body = raw ? JSON.parse(raw) : {}; } catch { return send(res, 400, { error: 'Request body must be valid JSON.' }); }
    if (req.method === 'GET' && req.url === '/api/health') return send(res, 200, { ok: true, aiConfigured: Boolean(apiKey), model: apiKey ? 'claude-sonnet-5-5' : null });
    if (req.method === 'POST' && req.url === '/api/auth/register') {
      const { name = '', email = '', password = '' } = body;
      if (!name.trim() || !/^\S+@\S+\.\S+$/.test(email) || password.length < 8) return send(res, 400, { error: 'Enter a name, valid email, and password of at least 8 characters.' });
      if (users.has(email.toLowerCase())) return send(res, 400, { error: 'An account with this email already exists.' });
      users.set(email.toLowerCase(), { name: name.trim(), passwordHash: crypto.createHash('sha256').update(password).digest('hex') });
      return send(res, 201, { user: { name: name.trim(), email }, token: crypto.randomUUID() });
    }
    if (req.method === 'POST' && req.url === '/api/auth/login') {
      const { email = '', password = '' } = body;
      const account = users.get(email.toLowerCase());
      if (!account || account.passwordHash !== crypto.createHash('sha256').update(password).digest('hex')) return send(res, 401, { error: 'Incorrect email or password.' });
      return send(res, 200, { user: { name: account.name, email }, token: crypto.randomUUID() });
    }
    if (req.method === 'POST' && req.url === '/api/generate') {
      const requirement = String(body.requirement || '').trim();
      const problem = validateRequirement(requirement);
      if (problem) return send(res, 400, { error: problem });
      const { testCases, skipped } = validateTestCases(demoGenerate(requirement));
      return send(res, 200, { source: 'demo', model: null, requirement, generatedAt: new Date().toISOString(), testCases, skipped });
    }
    if (req.method === 'POST' && req.url === '/api/automation/run-login-suite') {
      try {
        const { runLoginAutomation } = await import('./automation.js');
        const run = await runLoginAutomation(port);
        return send(res, 200, { completedAt: new Date().toISOString(), results: run.tests.map((test) => ({
          ...test,
          screenshot: test.screenshot ? `/api/automation/artifacts/${encodeURIComponent(test.screenshot)}` : null,
          report: `/api/automation/artifacts/${encodeURIComponent(test.report)}`,
        })) });
      } catch (error) {
        console.error('Automation run failed:', error.message);
        return send(res, 500, { error: 'The real Playwright suite could not complete. Check that the frontend and backend are running, then try again.' });
      }
    }
    return send(res, 404, { error: 'Route not found.' });
  });
  server.listen(port, () => console.log(`Server running on http://localhost:${port}`));
}

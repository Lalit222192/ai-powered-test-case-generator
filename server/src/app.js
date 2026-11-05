import express from 'express';
import cors from 'cors';
import { generateWithClaude, ClaudeApiError } from './claude.js';
import { demoGenerate } from './demo.js';
import { validateRequirement, validateTestCases, AIResponseError } from './validate.js';
import { createAuthStore } from './auth.js';

// `claude` can be replaced with a fake in tests.
export function createApp({ apiKey = '', model = 'claude-sonnet-5-5', claude = generateWithClaude } = {}) {
  const app = express();
  app.use(cors({ origin: /^http:\/\/(localhost|127\.0\.0\.1):\d+$/ }));
  app.use(express.json({ limit: '20kb' }));
  const auth = createAuthStore();

  app.get('/api/health', (req, res) => {
    res.json({ ok: true, aiConfigured: Boolean(apiKey), model: apiKey ? model : null });
  });
  app.post('/api/auth/register', (req, res) => { const result = auth.register(req.body ?? {}); return result.error ? res.status(400).json(result) : res.status(201).json(result); });
  app.post('/api/auth/login', (req, res) => { const result = auth.login(req.body ?? {}); return result.error ? res.status(401).json(result) : res.json(result); });
  app.post('/api/auth/logout', (req, res) => { auth.logout(req.headers.authorization?.replace('Bearer ', '')); res.status(204).end(); });
  app.post('/api/automation/run-login-suite', async (req, res) => {
    try {
      // Load the browser runner only when it is needed.  This keeps the API
      // available even when Playwright has not yet been installed.
      const { runLoginAutomation } = await import('./automation.js');
      res.json({ completedAt: new Date().toISOString(), results: await runLoginAutomation(process.env.PORT || 5000) });
    }
    catch (error) { console.error(error); res.status(500).json({ error: 'The Playwright suite could not complete. Make sure the local frontend and backend are running.' }); }
  });

  app.post('/api/generate', async (req, res) => {
    const { requirement, useDemo } = req.body ?? {};
    const problem = validateRequirement(requirement);
    if (problem) return res.status(400).json({ error: problem });

    const text = requirement.trim();
    const generatedAt = new Date().toISOString();
    const demo = useDemo === true || !apiKey;

    try {
      if (demo) {
        const { testCases, skipped } = validateTestCases(demoGenerate(text));
        return res.json({ source: 'demo', model: null, requirement: text, generatedAt, testCases, skipped });
      }
      const raw = await claude({ apiKey, model, requirement: text });
      const { testCases, skipped } = validateTestCases(raw);
      return res.json({ source: 'ai', model, requirement: text, generatedAt, testCases, skipped });
    } catch (err) {
      return sendError(res, err);
    }
  });

  // Handles bad JSON bodies etc.
  app.use((err, req, res, next) => {
    if (err?.type === 'entity.parse.failed') return res.status(400).json({ error: 'Request body must be valid JSON.' });
    if (err?.type === 'entity.too.large') return res.status(413).json({ error: 'Request body is too large.' });
    console.error(err);
    res.status(500).json({ error: 'Unexpected server error.' });
  });

  return app;
}

function sendError(res, err) {
  if (err instanceof AIResponseError) {
    return res.status(502).json({ error: `The AI returned an unusable response: ${err.message} Please try again.`, code: 'INVALID_AI_RESPONSE' });
  }
  if (err instanceof ClaudeApiError) {
    if (err.status === 401 || err.status === 403) return res.status(502).json({ error: 'The Claude API rejected the server API key. Check ANTHROPIC_API_KEY.', code: 'AI_AUTH' });
    if (err.status === 429) return res.status(429).json({ error: 'The Claude API rate limit was reached. Wait a moment and try again.', code: 'AI_RATE_LIMIT' });
    if (err.status === 504) return res.status(504).json({ error: err.message, code: 'AI_TIMEOUT' });
    return res.status(502).json({ error: `AI service error: ${err.message}`, code: 'AI_ERROR' });
  }
  console.error(err);
  return res.status(500).json({ error: 'Unexpected server error.' });
}

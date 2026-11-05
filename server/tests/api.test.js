import test from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../src/app.js';
import { ClaudeApiError } from '../src/claude.js';
import { AIResponseError } from '../src/validate.js';

const REQ = 'Create a login system where users log in with email and password.';

async function withServer(options, fn) {
  const server = createApp(options).listen(0);
  const base = `http://127.0.0.1:${server.address().port}`;
  try { await fn(base); } finally {
    server.closeAllConnections?.();
    await new Promise((resolve) => server.close(resolve));
  }
}
const post = (base, body) => fetch(`${base}/api/generate`, {
  method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body),
});

test('health reports demo mode when no key is set', async () => {
  await withServer({ apiKey: '' }, async (base) => {
    const data = await (await fetch(`${base}/api/health`)).json();
    assert.equal(data.aiConfigured, false);
  });
});

test('empty requirement returns 400', async () => {
  await withServer({ apiKey: '' }, async (base) => {
    const res = await post(base, { requirement: '   ' });
    assert.equal(res.status, 400);
  });
});

test('without API key the result is labelled demo', async () => {
  await withServer({ apiKey: '' }, async (base) => {
    const data = await (await post(base, { requirement: REQ })).json();
    assert.equal(data.source, 'demo');
    assert.ok(data.testCases.length > 0);
  });
});

test('with API key the result is labelled ai and validated', async () => {
  const claude = async () => ({ testCases: [{
    scenario: 's', description: 'd', preconditions: 'p', steps: ['one'], testData: 't',
    expectedResult: 'e', priority: 'Low', type: 'Negative',
  }] });
  await withServer({ apiKey: 'test-key', claude }, async (base) => {
    const data = await (await post(base, { requirement: REQ })).json();
    assert.equal(data.source, 'ai');
    assert.equal(data.testCases[0].id, 'TC-001');
  });
});

test('invalid AI JSON gives 502 and never fake results', async () => {
  const claude = async () => ({ nonsense: true });
  await withServer({ apiKey: 'test-key', claude }, async (base) => {
    const res = await post(base, { requirement: REQ });
    const data = await res.json();
    assert.equal(res.status, 502);
    assert.equal(data.code, 'INVALID_AI_RESPONSE');
    assert.equal(data.testCases, undefined);
  });
});

test('Claude API errors are mapped to friendly messages', async () => {
  const cases = [[401, 502, 'AI_AUTH'], [429, 429, 'AI_RATE_LIMIT'], [504, 504, 'AI_TIMEOUT'], [500, 502, 'AI_ERROR']];
  for (const [upstream, expected, code] of cases) {
    const claude = async () => { throw new ClaudeApiError('boom', upstream); };
    await withServer({ apiKey: 'test-key', claude }, async (base) => {
      const res = await post(base, { requirement: REQ });
      assert.equal(res.status, expected);
      assert.equal((await res.json()).code, code);
    });
  }
});

test('useDemo=true forces demo mode even when a key exists', async () => {
  const claude = async () => { throw new AIResponseError('should not be called'); };
  await withServer({ apiKey: 'test-key', claude }, async (base) => {
    const data = await (await post(base, { requirement: REQ, useDemo: true })).json();
    assert.equal(data.source, 'demo');
  });
});

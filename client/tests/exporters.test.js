import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { toGherkin, toPlaywrightScript } from '../src/utils/exporters.js';

const cases = [{ id: 'TC-001', scenario: 'Quote " and tick ` test', description: 'd', preconditions: 'A user exists', steps: ['Open login', 'Enter \\ value'], testData: 'email@example.com', expectedResult: 'The user sees a successful login message.', priority: 'High', type: 'Edge Case', status: 'Not Run' }];

test('Playwright export contains IDs, escapes special characters, and is valid JavaScript', () => {
  const script = toPlaywrightScript(cases, 'Login `suite`');
  assert.match(script, /TC-001/);
  assert.match(script, /Quote \\"/);
  const dir = mkdtempSync(join(tmpdir(), 'tcg-export-'));
  const file = join(dir, 'generated.mjs');
  writeFileSync(file, script);
  try { execFileSync(process.execPath, ['--check', file]); } finally { rmSync(dir, { recursive: true, force: true }); }
});

test('Gherkin export has a scenario, tags, and Given/When/Then keywords', () => {
  const text = toGherkin(cases, 'Users can sign in.');
  assert.match(text, /@TC001 @High @EdgeCase/);
  assert.match(text, /Scenario:/);
  assert.match(text, /Given /);
  assert.match(text, /When /);
  assert.match(text, /Then /);
});

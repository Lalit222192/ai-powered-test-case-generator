import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRequirement, validateTestCases, AIResponseError } from '../src/validate.js';
import { parseJsonText } from '../src/claude.js';

const good = {
  scenario: 'Login works', description: 'd', preconditions: 'p', steps: ['a', 'b'],
  testData: 'x', expectedResult: 'ok', priority: 'high', type: 'edge-case',
};

test('empty or whitespace requirement is rejected', () => {
  assert.match(validateRequirement(''), /empty/i);
  assert.match(validateRequirement('    '), /empty/i);
  assert.match(validateRequirement(undefined), /empty/i);
});

test('too short and too long requirements are rejected, valid one passes', () => {
  assert.match(validateRequirement('login'), /too short/i);
  assert.match(validateRequirement('a'.repeat(2001)), /too long/i);
  assert.equal(validateRequirement('A login system with email and password'), null);
});

test('valid AI response is normalised and given IDs and Not Run status', () => {
  const { testCases, skipped } = validateTestCases({ testCases: [good, { ...good, type: 'Positive' }] });
  assert.equal(skipped, 0);
  assert.deepEqual(testCases.map((t) => t.id), ['TC-001', 'TC-002']);
  assert.equal(testCases[0].priority, 'High');
  assert.equal(testCases[0].type, 'Edge Case');
  assert.equal(testCases[0].status, 'Not Run');
});

test('invalid items are skipped but valid ones are kept', () => {
  const { testCases, skipped } = validateTestCases([good, { scenario: 'broken' }, { ...good, priority: 'Urgent' }]);
  assert.equal(testCases.length, 1);
  assert.equal(skipped, 2);
});

test('invalid AI responses throw AIResponseError', () => {
  assert.throws(() => validateTestCases({ foo: 1 }), AIResponseError);
  assert.throws(() => validateTestCases(null), AIResponseError);
  assert.throws(() => validateTestCases({ testCases: [] }), AIResponseError);
  assert.throws(() => validateTestCases({ testCases: [{ scenario: 'x' }] }), AIResponseError);
});

test('JSON wrapped in code fences is parsed; garbage is rejected', () => {
  const obj = parseJsonText('```json\n{"testCases": []}\n```');
  assert.deepEqual(obj, { testCases: [] });
  assert.throws(() => parseJsonText('Sorry, I cannot help'), AIResponseError);
  assert.throws(() => parseJsonText('{ not json }'), AIResponseError);
});

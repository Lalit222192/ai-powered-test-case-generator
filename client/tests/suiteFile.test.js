import test from 'node:test';
import assert from 'node:assert/strict';
import { exportSuite, parseSuite } from '../src/utils/suiteFile.js';
const tc = { id: 'TC-001', scenario: 'Login', description: 'd', preconditions: 'None', steps: ['Open'], testData: 'email', expectedResult: 'Login succeeds', priority: 'High', type: 'Positive', status: 'Not Run' };
test('suite round trip preserves data', () => { const parsed = parseSuite(exportSuite({ testCases: [tc], meta: { source: 'demo' } })); assert.equal(parsed.ok, true); assert.equal(parsed.data.testCases[0].id, tc.id); });
test('bad files are rejected safely', () => {
  assert.equal(parseSuite('{').ok, false);
  assert.equal(parseSuite(JSON.stringify({ version: 2, testCases: [] })).ok, false);
  assert.equal(parseSuite(JSON.stringify({ version: 1, testCases: [{ ...tc, id: 'TC-001' }, { ...tc, id: 'TC-001' }] })).ok, false);
  assert.equal(parseSuite(JSON.stringify({ version: 1, testCases: [{ ...tc, priority: 'Urgent' }] })).ok, false);
  assert.equal(parseSuite(JSON.stringify({ version: 1, meta: { source: 'unknown' }, testCases: [tc] })).ok, false);
});

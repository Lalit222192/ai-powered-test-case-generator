import test from 'node:test';
import assert from 'node:assert/strict';
import { createTestRun, runStats, toRunMarkdown, updateRunCase } from '../src/utils/testRuns.js';

const cases = [{ id: 'TC-001', scenario: 'Valid login', priority: 'High' }, { id: 'TC-002', scenario: 'Wrong password', priority: 'Medium' }];
test('test run snapshots cases, records results, and exports a useful report', () => {
  const run = createTestRun({ title: 'Login regression', testCases: cases, requirement: 'Users can log in.' });
  assert.equal(run.cases.length, 2); assert.equal(run.cases[0].status, 'Not Run');
  const updated = updateRunCase(run, 'TC-001', { status: 'Pass', actualResult: 'Dashboard opened.' });
  assert.equal(run.cases[0].status, 'Not Run'); assert.equal(runStats(updated).progress, 50);
  const markdown = toRunMarkdown(updated); assert.match(markdown, /Login regression/); assert.match(markdown, /Dashboard opened/);
});
test('invalid statuses cannot corrupt a test run', () => { const run = createTestRun({ testCases: cases }); assert.equal(updateRunCase(run, 'TC-001', { status: 'Unknown' }), run); });

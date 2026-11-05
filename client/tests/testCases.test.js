import test from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRequirement, computeStats, filterTestCases, updateStatus,
  updateTestCase, deleteTestCase, toCsv,
} from '../src/utils/testCases.js';

const make = (id, scenario, priority, status, extra = {}) => ({
  id, scenario, priority, status, description: 'd', preconditions: 'p',
  steps: ['open page', 'click'], testData: 'x', expectedResult: 'ok', type: 'Positive', ...extra,
});
const cases = [
  make('TC-001', 'Login with valid credentials', 'High', 'Pass'),
  make('TC-002', 'Login with empty password', 'High', 'Fail'),
  make('TC-003', 'Cart total', 'Low', 'Blocked'),
  make('TC-004', 'Cart empty checkout', 'Medium', 'Not Run'),
];

test('empty requirement is rejected', () => {
  assert.ok(validateRequirement(''));
  assert.ok(validateRequirement('   '));
  assert.ok(validateRequirement('hi'));
  assert.equal(validateRequirement('Users can log in with email and password'), null);
});

test('stats and progress are calculated', () => {
  const s = computeStats(cases);
  assert.deepEqual([s.total, s.pass, s.fail, s.blocked, s.notRun], [4, 1, 1, 1, 1]);
  assert.equal(s.progress, 75);
  assert.equal(s.passRate, 33);
  assert.equal(computeStats([]).progress, 0);
});

test('status updates are immutable and validated', () => {
  const next = updateStatus(cases, 'TC-004', 'Pass');
  assert.equal(next.find((c) => c.id === 'TC-004').status, 'Pass');
  assert.equal(cases.find((c) => c.id === 'TC-004').status, 'Not Run');
  assert.equal(updateStatus(cases, 'TC-004', 'Banana'), cases);
});

test('edit keeps the ID, delete removes the case', () => {
  const edited = updateTestCase(cases, 'TC-001', { scenario: 'New', id: 'HACK' });
  assert.equal(edited[0].scenario, 'New');
  assert.equal(edited[0].id, 'TC-001');
  assert.equal(deleteTestCase(cases, 'TC-002').length, 3);
});

test('search matches ID or scenario, case-insensitively', () => {
  assert.equal(filterTestCases(cases, { search: 'tc-003' }).length, 1);
  assert.equal(filterTestCases(cases, { search: 'LOGIN' }).length, 2);
  assert.equal(filterTestCases(cases, { search: 'zzz' }).length, 0);
});

test('priority and status filters combine with search', () => {
  assert.equal(filterTestCases(cases, { priority: 'High' }).length, 2);
  assert.equal(filterTestCases(cases, { status: 'Blocked' }).length, 1);
  assert.equal(filterTestCases(cases, { priority: 'High', status: 'Fail', search: 'empty' }).length, 1);
  assert.equal(filterTestCases(cases, { priority: 'All', status: 'All' }).length, 4);
});

test('CSV has a header, quotes commas/quotes and blocks formulas', () => {
  const tricky = make('TC-009', 'Say "hi", then leave', 'High', 'Pass', { testData: '=SUM(1,2)' });
  const lines = toCsv([tricky]).split('\r\n');
  assert.ok(lines[0].startsWith('"Test Case ID","Test Scenario"'));
  assert.ok(lines[0].endsWith('"Linked Requirement"'));
  const csv = toCsv([tricky]);
  assert.ok(csv.includes('"Say ""hi"", then leave"'));
  assert.ok(csv.includes('"\'=SUM(1,2)"'));
  assert.ok(csv.includes('1. open page\n2. click'));
});

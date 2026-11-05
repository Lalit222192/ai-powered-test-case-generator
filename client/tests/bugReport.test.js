import test from 'node:test';
import assert from 'node:assert/strict';
import { severityFromPriority, toBugReportMarkdown, validateActualResult } from '../src/utils/bugReport.js';
const tc = { id: 'TC-002', scenario: 'Login rejects valid user', priority: 'High', preconditions: 'User exists', steps: ['Open login', 'Enter valid details'], testData: 'a@b.com', expectedResult: 'Dashboard opens' };
test('bug report has all core sections and numbered steps', () => {
  const text = toBugReportMarkdown({ testCase: tc, actualResult: 'An error appears', severity: 'Major', environment: 'Chrome' });
  ['Severity', 'Priority', 'Environment', 'Preconditions', 'Steps to Reproduce', 'Test Data', 'Expected Result', 'Actual Result', 'Linked Test Case ID'].forEach((heading) => assert.match(text, new RegExp(heading)));
  assert.match(text, /1\. Open login/); assert.equal(severityFromPriority('High'), 'Major'); assert.ok(validateActualResult(''));
});

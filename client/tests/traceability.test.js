import test from 'node:test';
import assert from 'node:assert/strict';
import { autoLinkByKeywords, buildTraceabilityMatrix, splitRequirement } from '../src/utils/traceability.js';
test('requirements split, link, and count correctly', () => {
  const points = splitRequirement('Users can log in with email. The cart calculates total price.');
  assert.equal(points.length, 2);
  const cases = autoLinkByKeywords([{ id: 'TC-1', scenario: 'Email login', description: 'Login user', status: 'Pass' }, { id: 'TC-2', scenario: 'Other', description: 'Nothing', status: 'Not Run' }], points);
  assert.equal(cases[0].requirementId, 'R1');
  const matrix = buildTraceabilityMatrix(cases, points);
  assert.equal(matrix[0].pass, 1); assert.equal(matrix[1].coverage, 'No tests');
});

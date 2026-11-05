import test from 'node:test';
import assert from 'node:assert/strict';
import { analyzeQuality } from '../src/utils/quality.js';
import { TYPES } from '../src/utils/testCases.js';

const make = (id, type, extra = {}) => ({ id, type, scenario: `${type} login validation`, testData: 'valid@example.com', expectedResult: 'The system shows a clear result message after the requested action completes.', ...extra });
test('a complete suite scores 100', () => assert.equal(analyzeQuality(TYPES.map((type, i) => make(`TC-00${i}`, type, { scenario: `${type} unique scenario ${i}` }))).score, 100));
test('missing types, duplicates, and weak data lower quality', () => {
  const result = analyzeQuality([make('TC-001', 'Positive', { scenario: 'Login valid user', testData: 'N/A' }), make('TC-002', 'Positive', { scenario: 'Login valid user', expectedResult: 'ok' })]);
  assert.ok(result.score < 100); assert.deepEqual(result.duplicatePairs, [['TC-001', 'TC-002']]); assert.equal(result.concreteDataPercent, 50);
});
test('empty suite returns zero safely', () => assert.equal(analyzeQuality([]).score, 0));

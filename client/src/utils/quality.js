import { TYPES } from './testCases.js';

const STOP_WORDS = new Set(['a', 'an', 'the', 'and', 'or', 'for', 'to', 'with', 'of', 'in', 'on', 'at', 'by', 'from', 'user', 'users', 'should', 'can']);

function words(text) {
  return new Set(String(text || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/).filter((word) => word.length > 1 && !STOP_WORDS.has(word)));
}

function similar(a, b) {
  const one = words(a); const two = words(b);
  const union = new Set([...one, ...two]);
  if (!union.size) return false;
  const shared = [...one].filter((word) => two.has(word)).length;
  return shared / union.size >= 0.8;
}

function concrete(value) {
  const text = String(value || '').trim();
  return text.length >= 3 && !/^(n\/?a|none|not applicable)$/i.test(text);
}

function specific(value) {
  const text = String(value || '').trim();
  return text.length >= 25 && text.split(/\s+/).filter(Boolean).length >= 5;
}

// Score weights: 40 type coverage, 20 no duplicate scenarios, 20 concrete data,
// and 20 sufficiently specific expected results. It is a review aid, not an AI judge.
export function analyzeQuality(cases) {
  if (!cases.length) return { score: 0, typeCoverage: {}, missingTypes: [...TYPES], duplicatePairs: [], concreteDataPercent: 0, specificResultPercent: 0, notes: ['Add test cases before reviewing quality.'] };
  const typeCoverage = Object.fromEntries(TYPES.map((type) => [type, cases.filter((tc) => tc.type === type).length]));
  const missingTypes = TYPES.filter((type) => !typeCoverage[type]);
  const duplicatePairs = [];
  cases.forEach((tc, index) => cases.slice(index + 1).forEach((other) => { if (similar(tc.scenario, other.scenario)) duplicatePairs.push([tc.id, other.id]); }));
  const concreteDataPercent = Math.round((cases.filter((tc) => concrete(tc.testData)).length / cases.length) * 100);
  const specificResultPercent = Math.round((cases.filter((tc) => specific(tc.expectedResult)).length / cases.length) * 100);
  const coveragePoints = Math.round((TYPES.length - missingTypes.length) / TYPES.length * 40);
  const duplicatePoints = duplicatePairs.length ? 0 : 20;
  const dataPoints = Math.round(concreteDataPercent / 100 * 20);
  const resultPoints = Math.round(specificResultPercent / 100 * 20);
  const notes = [];
  if (missingTypes.length) notes.push(`Missing test types: ${missingTypes.join(', ')}.`); else notes.push('All five test types are represented.');
  if (duplicatePairs.length) notes.push(`${duplicatePairs.length} near-duplicate scenario pair(s) need review.`); else notes.push('No near-duplicate scenarios detected.');
  if (concreteDataPercent < 100) notes.push(`${concreteDataPercent}% of cases have concrete test data.`);
  if (specificResultPercent < 100) notes.push(`${specificResultPercent}% of expected results are specific.`);
  return { score: coveragePoints + duplicatePoints + dataPoints + resultPoints, typeCoverage, missingTypes, duplicatePairs, concreteDataPercent, specificResultPercent, notes };
}

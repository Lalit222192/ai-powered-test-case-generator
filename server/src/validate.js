// Validation + normalisation. Every test case (AI or demo) passes through here
// before it is sent to the frontend.

export const PRIORITIES = ['High', 'Medium', 'Low'];
export const TYPES = ['Positive', 'Negative', 'Boundary', 'Edge Case', 'Input Validation'];
export const MIN_LENGTH = 15;
export const MAX_LENGTH = 2000;

export class AIResponseError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AIResponseError';
  }
}

export function validateRequirement(text) {
  if (typeof text !== 'string' || !text.trim()) return 'Requirement cannot be empty.';
  const t = text.trim();
  if (t.length < MIN_LENGTH) return `Requirement is too short (minimum ${MIN_LENGTH} characters).`;
  if (t.length > MAX_LENGTH) return `Requirement is too long (maximum ${MAX_LENGTH} characters).`;
  return null;
}

const norm = (s) => String(s ?? '').toLowerCase().replace(/[-_]/g, ' ').trim();
const pick = (list, value) => list.find((item) => norm(item) === norm(value));

function toText(value, fallback) {
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'object') return JSON.stringify(value);
  const s = String(value).trim();
  return s || fallback;
}

function toSteps(value) {
  let list = value;
  if (typeof list === 'string') list = list.split('\n');
  if (!Array.isArray(list)) return [];
  return list
    .map((s) => String(s).trim().replace(/^\d+[.)]\s*/, ''))
    .filter(Boolean);
}

// Returns a clean test case, or null when the item is unusable.
function normalizeCase(item) {
  if (!item || typeof item !== 'object' || Array.isArray(item)) return null;
  const scenario = toText(item.scenario, '');
  const description = toText(item.description, '');
  const expectedResult = toText(item.expectedResult, '');
  const steps = toSteps(item.steps);
  const priority = pick(PRIORITIES, item.priority);
  const type = pick(TYPES, item.type);
  if (!scenario || !description || !expectedResult || !steps.length || !priority || !type) return null;
  return {
    scenario,
    description,
    preconditions: toText(item.preconditions, 'None'),
    steps,
    testData: toText(item.testData, 'N/A'),
    expectedResult,
    priority,
    type,
  };
}

// Accepts { testCases: [...] } or a bare array. Throws AIResponseError if nothing usable.
export function validateTestCases(raw) {
  const list = Array.isArray(raw) ? raw : raw && Array.isArray(raw.testCases) ? raw.testCases : null;
  if (!list) throw new AIResponseError('The response does not contain a "testCases" array.');
  const valid = [];
  let skipped = 0;
  for (const item of list) {
    const clean = normalizeCase(item);
    if (clean) valid.push(clean);
    else skipped += 1;
  }
  if (!valid.length) throw new AIResponseError('None of the returned test cases were valid.');
  const testCases = valid.map((c, i) => ({
    id: `TC-${String(i + 1).padStart(3, '0')}`,
    ...c,
    status: 'Not Run',
  }));
  return { testCases, skipped };
}

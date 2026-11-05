import { PRIORITIES, STATUSES, TYPES } from './testCases.js';

const REQUIRED = ['id', 'scenario', 'description', 'preconditions', 'steps', 'testData', 'expectedResult', 'priority', 'type', 'status'];
export function exportSuite({ testCases, meta }) { return JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), meta, testCases }, null, 2); }

export function parseSuite(text) {
  let file;
  try { file = JSON.parse(text); } catch { return { ok: false, error: 'The selected file is not valid JSON.' }; }
  if (file?.version !== 1) return { ok: false, error: 'Unsupported suite version. Expected version 1.' };
  if (!Array.isArray(file.testCases)) return { ok: false, error: 'The suite must contain a testCases array.' };
  if (file.meta != null && !['ai', 'demo'].includes(file.meta.source)) return { ok: false, error: 'Suite metadata must preserve an AI or demo source.' };
  const ids = new Set();
  for (const tc of file.testCases) {
    if (!tc || REQUIRED.some((key) => !(key in tc) || (typeof tc[key] === 'string' && !tc[key].trim()))) return { ok: false, error: 'Each test case must contain all required fields.' };
    if (!Array.isArray(tc.steps) || !tc.steps.length || tc.steps.some((step) => typeof step !== 'string' || !step.trim())) return { ok: false, error: 'Each test case needs one or more non-empty steps.' };
    if (ids.has(tc.id)) return { ok: false, error: `Duplicate test case ID: ${tc.id}.` };
    ids.add(tc.id);
    if (!PRIORITIES.includes(tc.priority) || !TYPES.includes(tc.type) || !STATUSES.includes(tc.status)) return { ok: false, error: `Invalid priority, type, or status in ${tc.id}.` };
  }
  return { ok: true, data: { testCases: file.testCases, meta: file.meta || null } };
}

// Pure helper functions (no React) so they are easy to test and explain.

export const STATUSES = ['Not Run', 'Pass', 'Fail', 'Blocked'];
export const PRIORITIES = ['High', 'Medium', 'Low'];
export const TYPES = ['Positive', 'Negative', 'Boundary', 'Edge Case', 'Input Validation'];

export function validateRequirement(text) {
  if (typeof text !== 'string' || !text.trim()) return 'Please enter a software requirement.';
  if (text.trim().length < 15) return 'The requirement is too short. Describe it in at least 15 characters.';
  if (text.trim().length > 2000) return 'The requirement is too long (maximum 2000 characters).';
  return null;
}

export function computeStats(cases) {
  const count = (s) => cases.filter((c) => c.status === s).length;
  const total = cases.length;
  const pass = count('Pass');
  const fail = count('Fail');
  const blocked = count('Blocked');
  const notRun = count('Not Run');
  const executed = pass + fail + blocked;
  return {
    total, pass, fail, blocked, notRun, executed,
    progress: total ? Math.round((executed / total) * 100) : 0,
    passRate: executed ? Math.round((pass / executed) * 100) : 0,
  };
}

export function countBy(cases, key) {
  return cases.reduce((acc, c) => ({ ...acc, [c[key]]: (acc[c[key]] || 0) + 1 }), {});
}

export function filterTestCases(cases, { search = '', priority = 'All', status = 'All' } = {}) {
  const q = search.trim().toLowerCase();
  return cases.filter((c) => {
    if (priority !== 'All' && c.priority !== priority) return false;
    if (status !== 'All' && c.status !== status) return false;
    if (q && !c.id.toLowerCase().includes(q) && !c.scenario.toLowerCase().includes(q)) return false;
    return true;
  });
}

export function updateStatus(cases, id, status) {
  if (!STATUSES.includes(status)) return cases;
  return cases.map((c) => (c.id === id ? { ...c, status } : c));
}

export function updateTestCase(cases, id, changes) {
  return cases.map((c) => (c.id === id ? { ...c, ...changes, id: c.id } : c));
}

export function deleteTestCase(cases, id) {
  return cases.filter((c) => c.id !== id);
}

export const CSV_COLUMNS = [
  ['Test Case ID', (c) => c.id],
  ['Test Scenario', (c) => c.scenario],
  ['Test Description', (c) => c.description],
  ['Preconditions', (c) => c.preconditions],
  ['Test Steps', (c) => c.steps.map((s, i) => `${i + 1}. ${s}`).join('\n')],
  ['Test Data', (c) => c.testData],
  ['Expected Result', (c) => c.expectedResult],
  ['Priority', (c) => c.priority],
  ['Test Type', (c) => c.type],
  ['Execution Status', (c) => c.status],
  ['Linked Requirement', (c) => c.requirementId || ''],
];

// Quotes cells, doubles inner quotes, and neutralises spreadsheet formulas (=, +, @).
function csvCell(value) {
  let s = String(value ?? '');
  if (/^[=+@\t\r]/.test(s)) s = `'${s}`;
  return `"${s.replace(/"/g, '""')}"`;
}

export function toCsv(cases) {
  const header = CSV_COLUMNS.map(([name]) => csvCell(name)).join(',');
  const rows = cases.map((c) => CSV_COLUMNS.map(([, get]) => csvCell(get(c))).join(','));
  return [header, ...rows].join('\r\n');
}

// Browser only: triggers a file download. "\uFEFF" lets Excel read UTF-8 correctly.
export function downloadCsv(cases, filename = 'test-cases.csv') {
  const blob = new Blob(['\uFEFF' + toCsv(cases)], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

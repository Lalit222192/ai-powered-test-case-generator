import { STATUSES } from './testCases.js';

function runId() { return `RUN-${Date.now().toString().slice(-8)}`; }

export function createTestRun({ title, testCases, requirement = '' }) {
  return {
    id: runId(), title: String(title || '').trim() || `Regression Run - ${new Date().toLocaleDateString()}`,
    createdAt: new Date().toISOString(), requirement,
    cases: testCases.map((tc) => ({ id: tc.id, scenario: tc.scenario, priority: tc.priority, status: 'Not Run', actualResult: '', evidence: null })),
  };
}

export function updateRunCase(run, id, changes) {
  if (!STATUSES.includes(changes.status ?? 'Not Run')) return run;
  return { ...run, cases: run.cases.map((tc) => tc.id === id ? { ...tc, ...changes } : tc) };
}

export function runStats(run) {
  const count = (status) => run.cases.filter((tc) => tc.status === status).length;
  const total = run.cases.length;
  const pass = count('Pass'); const fail = count('Fail'); const blocked = count('Blocked'); const notRun = count('Not Run');
  return { total, pass, fail, blocked, notRun, executed: pass + fail + blocked, progress: total ? Math.round(((pass + fail + blocked) / total) * 100) : 0 };
}

export function toRunMarkdown(run) {
  const s = runStats(run);
  const rows = run.cases.map((tc) => `| ${tc.id} | ${tc.scenario} | ${tc.priority} | ${tc.status} | ${tc.actualResult || '-'} | ${tc.evidence?.name || '-'} |`);
  return `# ${run.title}\n\n**Run ID:** ${run.id}\n**Created:** ${new Date(run.createdAt).toLocaleString()}\n**Requirement:** ${run.requirement || 'Not recorded'}\n\n## Summary\n\n- Total: ${s.total}\n- Executed: ${s.executed} (${s.progress}%)\n- Passed: ${s.pass}\n- Failed: ${s.fail}\n- Blocked: ${s.blocked}\n- Not Run: ${s.notRun}\n\n## Results\n\n| ID | Scenario | Priority | Status | Actual Result | Evidence |\n| --- | --- | --- | --- | --- | --- |\n${rows.join('\n')}\n`;
}

import { useState } from 'react';
import { STATUSES } from '../utils/testCases.js';
import { createTestRun, runStats, toRunMarkdown, updateRunCase } from '../utils/testRuns.js';
import { downloadTextFile } from '../utils/exporters.js';

const MAX_EVIDENCE_BYTES = 900_000;

export default function TestRuns({ testCases, meta, runs, onRunsChange, onNavigate }) {
  const [title, setTitle] = useState('');
  const [selectedId, setSelectedId] = useState(runs[0]?.id || '');
  const [error, setError] = useState('');
  const selected = runs.find((run) => run.id === selectedId);
  const update = (next) => onRunsChange(next);
  const replace = (next) => update(runs.map((run) => run.id === next.id ? next : run));

  function create() {
    if (!testCases.length) { setError('Generate or import test cases before starting a test run.'); return; }
    const run = createTestRun({ title, testCases, requirement: meta?.requirement });
    update([run, ...runs]); setSelectedId(run.id); setTitle(''); setError('');
  }
  function changeCase(id, changes) { if (selected) replace(updateRunCase(selected, id, changes)); }
  async function evidence(event, id) {
    const file = event.target.files?.[0]; event.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/') || file.size > MAX_EVIDENCE_BYTES) return setError('Evidence must be an image smaller than 900 KB.');
    const reader = new FileReader();
    reader.onload = () => { changeCase(id, { evidence: { name: file.name, dataUrl: reader.result } }); setError(''); };
    reader.readAsDataURL(file);
  }
  function removeRun() { if (selected && window.confirm(`Delete ${selected.id}?`)) { const next = runs.filter((run) => run.id !== selected.id); update(next); setSelectedId(next[0]?.id || ''); } }

  return <>
    <div className="page-head"><div><h1>Test Runs</h1><p className="req-line">Record an execution snapshot, actual results, and visual evidence for your QA report.</p></div><span className="badge source-ai">Execution evidence</span></div>
    <div className="callout-like"><strong>Professional QA workflow:</strong> a test run is separate from a test-case suite. It records what happened at a particular time, so later edits to your test cases do not rewrite execution evidence.</div>
    <section className="card run-create"><h2>Start a new test run</h2><div className="run-create-row"><label>Run title<input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. Login regression - build 1.0" /></label><button className="btn primary" onClick={create}>Start run from current suite</button></div>{error && <div className="alert error" role="alert">{error}</div>}</section>
    {!runs.length ? <div className="card empty"><h2>No test runs yet</h2><p>Start a run to capture execution results and failed-test screenshots.</p>{testCases.length === 0 && <button className="btn primary" onClick={() => onNavigate('generate')}>Generate test cases</button>}</div> : <div className="runs-layout">
      <aside className="card run-list"><h2>Run history</h2>{runs.map((run) => { const s = runStats(run); return <button key={run.id} className={`run-item ${run.id === selectedId ? 'active' : ''}`} onClick={() => setSelectedId(run.id)}><strong>{run.title}</strong><small>{run.id} · {s.executed}/{s.total} executed · {s.fail} failed</small></button>; })}</aside>
      {selected && <section className="run-detail"><div className="card"><div className="page-head"><div><h2>{selected.title}</h2><p className="hint">{selected.id} · Created {new Date(selected.createdAt).toLocaleString()}</p></div><div className="btn-row"><button className="btn" onClick={() => downloadTextFile(toRunMarkdown(selected), `${selected.id}-report.md`, 'text/markdown;charset=utf-8')}>Export run report</button><button className="btn danger" onClick={removeRun}>Delete run</button></div></div><RunSummary run={selected} /></div>
        <div className="table-wrap"><table><thead><tr><th>ID</th><th>Scenario</th><th>Status</th><th>Actual result</th><th>Evidence</th></tr></thead><tbody>{selected.cases.map((tc) => <tr key={tc.id}><td>{tc.id}</td><td>{tc.scenario}<br /><span className={`badge priority-${tc.priority.toLowerCase()}`}>{tc.priority}</span></td><td><select aria-label={`Run status of ${tc.id}`} className={`status-select status-${tc.status.toLowerCase().replace(/\s+/g, '-')}`} value={tc.status} onChange={(event) => changeCase(tc.id, { status: event.target.value })}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select></td><td><textarea aria-label={`Actual result for ${tc.id}`} rows="2" value={tc.actualResult} onChange={(event) => changeCase(tc.id, { actualResult: event.target.value })} placeholder="What actually happened?" /></td><td><label className="btn small file-btn">Attach image<input type="file" accept="image/*" onChange={(event) => evidence(event, tc.id)} /></label>{tc.evidence && <div className="evidence"><a href={tc.evidence.dataUrl} target="_blank" rel="noreferrer"><img src={tc.evidence.dataUrl} alt={`Evidence for ${tc.id}`} /></a><button className="link" onClick={() => changeCase(tc.id, { evidence: null })}>Remove</button></div>}</td></tr>)}</tbody></table></div>
      </section>}
    </div>}
  </>;
}

function RunSummary({ run }) { const s = runStats(run); return <div className="run-summary"><span><strong>{s.total}</strong>Total</span><span><strong>{s.executed}</strong>Executed</span><span><strong>{s.pass}</strong>Passed</span><span><strong>{s.fail}</strong>Failed</span><span><strong>{s.progress}%</strong>Progress</span></div>; }

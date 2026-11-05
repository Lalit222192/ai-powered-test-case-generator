import { Fragment, useState } from 'react';
import { filterTestCases, downloadCsv, STATUSES, PRIORITIES } from '../utils/testCases.js';
import { PriorityBadge, SourceBadge } from './Badges.jsx';
import EditModal from './EditModal.jsx';
import BugReportModal from './BugReportModal.jsx';
import { downloadTextFile, toGherkin, toPlaywrightScript } from '../utils/exporters.js';
import { exportSuite, parseSuite } from '../utils/suiteFile.js';

export default function Manage({ testCases, meta, onNavigate, onStatus, onSave, onDelete, onClear, onImport, points, onAutoLink }) {
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('All');
  const [status, setStatus] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [editing, setEditing] = useState(null);
  const [bugCase, setBugCase] = useState(null);
  const [importError, setImportError] = useState('');
  const importFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    const parsed = parseSuite(await file.text());
    if (!parsed.ok) return setImportError(parsed.error);
    if (testCases.length && !window.confirm('Importing will replace your current test cases. Continue?')) return;
    setImportError(''); onImport(parsed.data); onNavigate('manage');
  };

  if (!testCases.length) {
    return (
      <>
        <h1>Manage Test Cases</h1>
        <div className="card empty">
          <h2>Nothing to manage yet</h2>
          <p>Generate test cases first, or import an existing JSON suite.</p>
          <button className="btn primary" onClick={() => onNavigate('generate')}>Go to generator</button>
          <label className="btn file-btn">Import JSON<input type="file" accept="application/json,.json" onChange={importFile} /></label>
          {importError && <div className="alert error" role="alert">{importError}</div>}
        </div>
      </>
    );
  }

  const visible = filterTestCases(testCases, { search, priority, status });
  const confirmDelete = (tc) => { if (window.confirm(`Delete ${tc.id}?`)) onDelete(tc.id); };
  const confirmClear = () => { if (window.confirm('Delete ALL test cases?')) onClear(); };

  return (
    <>
      <div className="page-head">
        <h1>Manage Test Cases</h1>
        <SourceBadge meta={meta} />
      </div>
      {meta?.requirement && <p className="req-line"><strong>Requirement:</strong> {meta.requirement}</p>}
      {meta?.skipped > 0 && <div className="alert warn">{meta.skipped} invalid test case(s) from the response were skipped.</div>}

      <div className="toolbar">
        <input type="search" placeholder="Search by ID or scenario" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={priority} onChange={(e) => setPriority(e.target.value)} aria-label="Filter by priority">
          {['All', ...PRIORITIES].map((p) => <option key={p} value={p}>{p === 'All' ? 'All priorities' : p}</option>)}
        </select>
        <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Filter by status">
          {['All', ...STATUSES].map((s) => <option key={s} value={s}>{s === 'All' ? 'All statuses' : s}</option>)}
        </select>
        <button className="btn" onClick={() => downloadCsv(visible)} disabled={!visible.length}>Export CSV ({visible.length})</button>
        <button className="btn" onClick={() => downloadTextFile(toPlaywrightScript(visible, meta?.requirement), 'generated-test-cases.spec.js', 'text/javascript;charset=utf-8')} disabled={!visible.length}>Export Playwright</button>
        <button className="btn" onClick={() => downloadTextFile(toGherkin(visible, meta?.requirement), 'generated-test-cases.feature', 'text/plain;charset=utf-8')} disabled={!visible.length}>Export Gherkin</button>
        <button className="btn" onClick={() => downloadTextFile(exportSuite({ testCases, meta }), 'test-suite.json', 'application/json;charset=utf-8')}>Export JSON</button>
        <label className="btn file-btn">Import JSON<input type="file" accept="application/json,.json" onChange={importFile} /></label>
        <button className="btn" onClick={onAutoLink} disabled={!points.length}>Auto-link by keywords</button>
        <button className="btn primary" onClick={() => onNavigate('test-runs')}>Start test run</button>
        <button className="btn danger" onClick={confirmClear}>Clear all</button>
      </div>
      <p className="hint">Auto-link is a simple keyword heuristic. Review linked requirements manually.</p>
      {importError && <div className="alert error" role="alert">{importError}</div>}

      <div className="table-wrap">
        <table>
          <thead>
            <tr><th>ID</th><th>Scenario</th><th>Type</th><th>Priority</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            {!visible.length && <tr><td colSpan={6} className="no-results">No test cases match your filters.</td></tr>}
            {visible.map((tc) => (
              <Fragment key={tc.id}>
                <tr>
                  <td><button className="link" onClick={() => setExpanded(expanded === tc.id ? null : tc.id)}>{tc.id}</button></td>
                  <td>{tc.scenario}</td>
                  <td>{tc.type}</td>
                  <td><PriorityBadge priority={tc.priority} /></td>
                  <td>
                    <select
                      className={`status-select status-${tc.status.toLowerCase().replace(/\s+/g, '-')}`}
                      value={tc.status}
                      onChange={(e) => onStatus(tc.id, e.target.value)}
                      aria-label={`Status of ${tc.id}`}
                    >
                      {STATUSES.map((s) => <option key={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="actions">
                    <button className="btn small" onClick={() => setEditing(tc)}>Edit</button>
                    {tc.status === 'Fail' && <button className="btn small" onClick={() => setBugCase(tc)}>Bug report</button>}
                    <button className="btn small danger" onClick={() => confirmDelete(tc)}>Delete</button>
                  </td>
                </tr>
                {expanded === tc.id && (
                  <tr className="details-row">
                    <td colSpan={6}>
                      <dl>
                        <dt>Description</dt><dd>{tc.description}</dd>
                        <dt>Preconditions</dt><dd>{tc.preconditions}</dd>
                        <dt>Test steps</dt><dd><ol>{tc.steps.map((s, i) => <li key={i}>{s}</li>)}</ol></dd>
                        <dt>Test data</dt><dd>{tc.testData}</dd>
                        <dt>Expected result</dt><dd>{tc.expectedResult}</dd>
                      </dl>
                    </td>
                  </tr>
                )}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
          <EditModal testCase={editing} points={points} onClose={() => setEditing(null)} onSave={(tc) => { onSave(tc); setEditing(null); }} />
      )}
      {bugCase && <BugReportModal testCase={bugCase} onClose={() => setBugCase(null)} />}
    </>
  );
}

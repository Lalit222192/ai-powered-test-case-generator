import { useState } from 'react';
import { severityFromPriority, toBugReportMarkdown, validateActualResult } from '../utils/bugReport.js';
import { downloadTextFile } from '../utils/exporters.js';

export default function BugReportModal({ testCase, onClose }) {
  const [actualResult, setActualResult] = useState('');
  const [environment, setEnvironment] = useState(navigator.userAgent.slice(0, 120));
  const [severity, setSeverity] = useState(severityFromPriority(testCase.priority));
  const [error, setError] = useState('');
  const markdown = () => toBugReportMarkdown({ testCase, actualResult, severity, environment });
  function requireActual() { const problem = validateActualResult(actualResult); setError(problem || ''); return !problem; }
  async function copy() {
    if (!requireActual()) return;
    try { await navigator.clipboard.writeText(markdown()); setError('Markdown copied to clipboard.'); }
    catch { setError('Copy was unavailable. Please use Download .md instead.'); }
  }
  function download() { if (requireActual()) downloadTextFile(markdown(), `${testCase.id}-bug-report.md`, 'text/markdown;charset=utf-8'); }
  return <div className="modal-backdrop" onClick={onClose}>
    <div className="modal" role="dialog" aria-modal="true" aria-label={`Bug report for ${testCase.id}`} onClick={(event) => event.stopPropagation()}>
      <h2>Bug report: {testCase.id}</h2>
      <label>Severity<select value={severity} onChange={(e) => setSeverity(e.target.value)}>{['Critical', 'Major', 'Moderate', 'Minor'].map((value) => <option key={value}>{value}</option>)}</select></label>
      <label>Environment<input value={environment} onChange={(e) => setEnvironment(e.target.value)} /></label>
      <label>Actual result<textarea rows={4} value={actualResult} onChange={(e) => setActualResult(e.target.value)} required /></label>
      {error && <div className="alert error" role="alert">{error}</div>}
      <div className="btn-row end"><button className="btn" onClick={onClose}>Close</button><button className="btn" onClick={copy}>Copy Markdown</button><button className="btn primary" onClick={download}>Download .md</button></div>
    </div>
  </div>;
}

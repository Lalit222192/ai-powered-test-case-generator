import { computeStats, countBy, STATUSES, PRIORITIES, TYPES } from '../utils/testCases.js';
import { SourceBadge } from './Badges.jsx';
import { analyzeQuality } from '../utils/quality.js';

const slug = (s) => s.toLowerCase().replace(/\s+/g, '-');

function BarList({ title, labels, counts, total }) {
  return (
    <div className="card">
      <h3>{title}</h3>
      {labels.map((label) => {
        const n = counts[label] || 0;
        return (
          <div className="bar-row" key={label}>
            <span className="bar-label">{label}</span>
            <div className="bar-track"><div className="bar-fill" style={{ width: `${total ? (n / total) * 100 : 0}%` }} /></div>
            <span className="bar-count">{n}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function Dashboard({ testCases, meta, onNavigate }) {
  const s = computeStats(testCases);

  if (!s.total) {
    return (
      <>
        <h1>Dashboard</h1>
        <div className="card empty">
          <h2>No test cases yet</h2>
          <p>Enter a software requirement and generate your first set of test cases.</p>
          <button className="btn primary" onClick={() => onNavigate('generate')}>Generate test cases</button>
        </div>
      </>
    );
  }

  const cards = [
    ['Total', s.total, 'total'], ['Passed', s.pass, 'pass'], ['Failed', s.fail, 'fail'],
    ['Blocked', s.blocked, 'blocked'], ['Not Run', s.notRun, 'not-run'],
  ];
  const statusCounts = { 'Not Run': s.notRun, Pass: s.pass, Fail: s.fail, Blocked: s.blocked };
  const quality = analyzeQuality(testCases);

  return (
    <>
      <div className="page-head">
        <h1>Dashboard</h1>
        <SourceBadge meta={meta} />
      </div>
      <div className="stat-grid">
        {cards.map(([label, value, cls]) => (
          <div className={`card stat stat-${cls}`} key={label}>
            <span className="stat-value">{value}</span>
            <span className="stat-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="card">
        <div className="progress-head">
          <h3>Execution progress</h3>
          <span>{s.executed} of {s.total} executed ({s.progress}%) - pass rate {s.passRate}%</span>
        </div>
        <div className="progress"><div className="progress-fill" style={{ width: `${s.progress}%` }} /></div>
        <div className="stacked" aria-label="Status distribution">
          {STATUSES.map((st) => statusCounts[st] > 0 && (
            <div key={st} className={`seg seg-${slug(st)}`} style={{ width: `${(statusCounts[st] / s.total) * 100}%` }} title={`${st}: ${statusCounts[st]}`} />
          ))}
        </div>
        <div className="legend">
          {STATUSES.map((st) => <span key={st}><i className={`dot seg-${slug(st)}`} /> {st}</span>)}
        </div>
      </div>

      <div className="two-col">
        <BarList title="By priority" labels={PRIORITIES} counts={countBy(testCases, 'priority')} total={s.total} />
        <BarList title="By test type" labels={TYPES} counts={countBy(testCases, 'type')} total={s.total} />
      </div>
      <div className="card quality-card">
        <div className="progress-head"><h3>Test suite quality: {quality.score}/100</h3><span>Simple review heuristic</span></div>
        <div className="progress"><div className="progress-fill" style={{ width: `${quality.score}%` }} /></div>
        <p><strong>Type coverage:</strong> {Object.entries(quality.typeCoverage).map(([type, count]) => `${type}: ${count}`).join(' · ')}</p>
        {quality.missingTypes.length > 0 && <p className="quality-warning">Missing types: {quality.missingTypes.join(', ')}</p>}
        {quality.duplicatePairs.length > 0 && <p className="quality-warning">Near duplicates: {quality.duplicatePairs.map((pair) => pair.join(' / ')).join(', ')}</p>}
        <ul>{quality.notes.slice(0, 4).map((note) => <li key={note}>{note}</li>)}</ul>
        <p className="hint">This is a simple heuristic to help review AI output, not a guarantee of quality.</p>
      </div>
    </>
  );
}

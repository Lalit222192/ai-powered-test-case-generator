import { buildTraceabilityMatrix } from '../utils/traceability.js';

export default function Traceability({ testCases, points }) {
  const matrix = buildTraceabilityMatrix(testCases, points);
  const unlinked = testCases.filter((tc) => !tc.requirementId);
  return <>
    <h1>Requirement Traceability</h1>
    {!points.length ? <div className="card empty"><h2>No requirement points available</h2><p>Generate or import a suite with a requirement first.</p></div> : <>
      <p className="req-line">Each row connects a requirement point to its related test cases and execution status.</p>
      <div className="table-wrap"><table><thead><tr><th>Requirement</th><th>Point</th><th>Total</th><th>Pass</th><th>Fail</th><th>Blocked</th><th>Not Run</th><th>Coverage</th></tr></thead><tbody>{matrix.map((row) => <tr key={row.id} className={row.coverage === 'No tests' ? 'uncovered' : ''}><td>{row.id}</td><td>{row.text}</td><td>{row.total}</td><td>{row.pass}</td><td>{row.fail}</td><td>{row.blocked}</td><td>{row.notRun}</td><td>{row.coverage}</td></tr>)}</tbody></table></div>
      <div className="card"><h2>Unlinked test cases</h2>{unlinked.length ? <ul>{unlinked.map((tc) => <li key={tc.id}>{tc.id} - {tc.scenario}</li>)}</ul> : <p>All test cases are linked.</p>}</div>
    </>}
  </>;
}

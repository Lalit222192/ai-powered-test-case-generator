import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar.jsx';
import Dashboard from './components/Dashboard.jsx';
import Generator from './components/Generator.jsx';
import Manage from './components/Manage.jsx';
import { getStatus } from './api.js';
import { updateStatus, updateTestCase, deleteTestCase } from './utils/testCases.js';
import { autoLinkByKeywords, splitRequirement } from './utils/traceability.js';
import Traceability from './components/Traceability.jsx';
import AutomationLab from './components/AutomationLab.jsx';
import TestRuns from './components/TestRuns.jsx';

const STORAGE_KEY = 'tcg:v1';
const EMPTY = { testCases: [], meta: null };
const RUNS_KEY = 'tcg:runs:v1';

function loadSaved() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return saved && Array.isArray(saved.testCases) ? saved : EMPTY;
  } catch {
    return EMPTY;
  }
}

function loadRuns() { try { const runs = JSON.parse(localStorage.getItem(RUNS_KEY)); return Array.isArray(runs) ? runs : []; } catch { return []; } }

export default function App() {
  const [page, setPage] = useState('dashboard');
  const [{ testCases, meta }, setData] = useState(loadSaved);
  const [runs, setRuns] = useState(loadRuns);
  const [apiStatus, setApiStatus] = useState({ loaded: false, aiConfigured: false, model: null, error: '' });

  useEffect(() => {
    getStatus()
      .then((s) => setApiStatus({ loaded: true, aiConfigured: s.aiConfigured, model: s.model, error: '' }))
      .catch((e) => setApiStatus({ loaded: true, aiConfigured: false, model: null, error: e.message }));
  }, []);

  // Save to the browser so a page refresh does not lose the work.
  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ testCases, meta })); } catch { /* storage unavailable */ }
  }, [testCases, meta]);
  useEffect(() => { try { localStorage.setItem(RUNS_KEY, JSON.stringify(runs)); } catch { /* evidence storage unavailable */ } }, [runs]);

  const setCases = (fn) => setData((d) => ({ ...d, testCases: fn(d.testCases) }));
  const points = splitRequirement(meta?.requirement);

  const handleGenerated = (result) => {
    setData({
      testCases: result.testCases,
      meta: {
        source: result.source,
        model: result.model,
        requirement: result.requirement,
        generatedAt: result.generatedAt,
        skipped: result.skipped,
      },
    });
    setPage('manage');
  };

  return (
    <div className="layout">
      <Sidebar page={page} onNavigate={setPage} apiStatus={apiStatus} />
      <main className="main">
        {page === 'dashboard' && <Dashboard testCases={testCases} meta={meta} onNavigate={setPage} />}
        {page === 'generate' && (
          <Generator apiStatus={apiStatus} hasExisting={testCases.length > 0} onGenerated={handleGenerated} />
        )}
        {page === 'manage' && (
          <Manage
            testCases={testCases}
            meta={meta}
            onNavigate={setPage}
            onStatus={(id, status) => setCases((c) => updateStatus(c, id, status))}
            onSave={(tc) => setCases((c) => updateTestCase(c, tc.id, tc))}
            onDelete={(id) => setCases((c) => deleteTestCase(c, id))}
            onClear={() => setData(EMPTY)}
            onImport={(data) => setData(data)}
            points={points}
            onAutoLink={() => setCases((cases) => autoLinkByKeywords(cases, points))}
          />
        )}
        {page === 'traceability' && <Traceability testCases={testCases} points={points} />}
        {page === 'automation-lab' && <AutomationLab />}
        {page === 'test-runs' && <TestRuns testCases={testCases} meta={meta} runs={runs} onRunsChange={setRuns} onNavigate={setPage} />}
      </main>
    </div>
  );
}

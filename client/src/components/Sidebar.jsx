const ITEMS = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'generate', label: 'Generate Test Cases' },
  { id: 'manage', label: 'Manage Test Cases' },
  { id: 'traceability', label: 'Traceability' },
  { id: 'automation-lab', label: 'Automation Lab' },
  { id: 'test-runs', label: 'Test Runs' },
];

export default function Sidebar({ page, onNavigate, apiStatus }) {
  let mode = 'Checking backend...';
  let cls = 'mode-checking';
  if (apiStatus.loaded && apiStatus.error) { mode = 'Backend offline'; cls = 'mode-offline'; }
  else if (apiStatus.loaded && apiStatus.aiConfigured) { mode = 'Claude AI mode'; cls = 'mode-ai'; }
  else if (apiStatus.loaded) { mode = 'Demo mode (no API key)'; cls = 'mode-demo'; }

  return (
    <aside className="sidebar">
      <div className="brand">
        <span className="brand-logo">QA</span>
        <div>
          <strong>TestCase AI</strong>
          <small>Test case generator</small>
        </div>
      </div>
      <nav>
        {ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? 'active' : ''}`}
            onClick={() => onNavigate(item.id)}
          >
            {item.label}
          </button>
        ))}
      </nav>
      <div className={`mode-pill ${cls}`}>{mode}</div>
    </aside>
  );
}

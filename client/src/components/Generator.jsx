import { useState } from 'react';
import { generateTestCases } from '../api.js';
import { validateRequirement } from '../utils/testCases.js';
import { SAMPLES } from '../samples.js';

export default function Generator({ apiStatus, hasExisting, onGenerated }) {
  const [requirement, setRequirement] = useState('');
  const [wantDemo, setWantDemo] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const aiAvailable = apiStatus.aiConfigured;
  const demo = !aiAvailable || wantDemo;

  async function run(text, useDemo) {
    const problem = validateRequirement(text);
    if (problem) return setError(problem);
    if (hasExisting && !window.confirm('Generating will replace your current test cases. Continue?')) return;
    setError('');
    setLoading(true);
    try {
      onGenerated(await generateTestCases(text.trim(), useDemo));
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <h1>Generate Test Cases</h1>

      {apiStatus.error && <div className="alert error">{apiStatus.error}</div>}
      {apiStatus.loaded && !apiStatus.error && (
        aiAvailable ? (
          <div className="alert info">Claude AI is configured ({apiStatus.model}). Results will be AI-generated unless you tick demo mode.</div>
        ) : (
          <div className="alert warn"><strong>Demo mode:</strong> no API key is configured on the server. Results come from predefined and rule-based samples, <strong>not from AI</strong>, and are labelled as demo.</div>
        )
      )}

      <div className="card">
        <label htmlFor="req" className="field-label">Software requirement</label>
        <textarea
          id="req"
          rows={7}
          value={requirement}
          onChange={(e) => setRequirement(e.target.value)}
          placeholder="e.g. Create a login system where users can log in using their email and password..."
          disabled={loading}
        />
        <div className="form-row">
          <span className="hint">{requirement.trim().length} / 2000 characters</span>
          {aiAvailable && (
            <label className="check">
              <input type="checkbox" checked={wantDemo} onChange={(e) => setWantDemo(e.target.checked)} disabled={loading} />
              Use demo mode instead of AI
            </label>
          )}
        </div>
        {error && <div className="alert error" role="alert">{error}</div>}
        <button className="btn primary" onClick={() => run(requirement, demo)} disabled={loading}>
          {loading ? 'Generating...' : demo ? 'Generate (demo)' : 'Generate with Claude'}
        </button>
        {loading && <span className="spinner" role="status" aria-label="Loading" />}
      </div>

      <h2>Sample requirements</h2>
      <div className="sample-grid">
        {SAMPLES.map((s) => (
          <div className="card sample" key={s.id}>
            <h3>{s.title}</h3>
            <p>{s.requirement}</p>
            <div className="btn-row">
              <button className="btn" disabled={loading} onClick={() => { setRequirement(s.requirement); setError(''); }}>Load requirement</button>
              <button className="btn" disabled={loading} onClick={() => { setRequirement(s.requirement); run(s.requirement, true); }}>View demo cases</button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

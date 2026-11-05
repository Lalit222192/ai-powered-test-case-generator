import { useState } from 'react';
import { validateRegistration } from '../utils/registrationLab.js';
import { loginAccount, registerAccount, runLoginSuite } from '../api.js';

const SCENARIOS = [
  ['AUT-LOGIN-001', 'Positive login', 'Valid credentials open the signed-in workspace.'],
  ['AUT-LOGIN-002', 'Required-field validation', 'Blank email and password display a useful error.'],
  ['AUT-LOGIN-003', 'Email-format validation', 'An invalid email is rejected before authentication.'],
  ['AUT-LOGIN-004', 'Negative login', 'Wrong credentials do not sign the user in.'],
  ['AUT-LOGIN-005', 'Boundary validation', 'A password shorter than eight characters is rejected.'],
];

export default function AutomationLab() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [result, setResult] = useState(null);
  const [registration, setRegistration] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [automation, setAutomation] = useState({ loading: false, error: '', results: [] });

  async function submit(event) { event.preventDefault(); try { setResult({ ok: true, ...(await loginAccount({ email, password })) }); } catch (e) { setResult({ ok: false, message: e.message }); } }
  function reset() { setEmail(''); setPassword(''); setResult(null); }
  async function register(event) { event.preventDefault(); const local = validateRegistration(registration); if (!local.ok) return setResult(local); try { setResult({ ok: true, ...(await registerAccount(registration)) }); } catch (e) { setResult({ ok: false, message: e.message }); } }
  async function runAll() { setAutomation({ loading: true, error: '', results: [] }); try { const data = await runLoginSuite(); setAutomation({ loading: false, error: '', results: data.results }); } catch (e) { setAutomation({ loading: false, error: e.message, results: [] }); } }

  return <>
    <div className="page-head"><div><h1>Automation Lab</h1><p className="req-line">A real local Login Application Under Test (AUT) with deterministic Playwright coverage.</p></div><span className="badge source-ai">Real automation demo</span></div>
    <div className="callout-like"><strong>Why this matters:</strong> this page is not a mock test-case table. It is a working feature that the Playwright suite interacts with using fields, buttons, validation messages, and a signed-in state.</div>
    <div className="lab-grid">
      <section className="card login-aut" aria-labelledby="login-aut-heading">
        <div className="aut-label">Application Under Test</div>
        <h2 id="login-aut-heading">Member Account Portal</h2>
        <div className="btn-row"><button className={`btn ${mode === 'login' ? 'primary' : ''}`} onClick={() => { setMode('login'); setResult(null); }}>Login</button><button className={`btn ${mode === 'register' ? 'primary' : ''}`} onClick={() => { setMode('register'); setResult(null); }}>Registration</button></div>
        {!result?.ok && mode === 'login' ? <form onSubmit={submit} noValidate>
          <label htmlFor="aut-email">Email address</label>
          <input id="aut-email" data-testid="aut-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="name@example.com" autoComplete="username" />
          <label htmlFor="aut-password">Password</label>
          <input id="aut-password" data-testid="aut-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
          <label className="check"><input type="checkbox" checked={showPassword} onChange={(event) => setShowPassword(event.target.checked)} /> Show password</label>
          {result && <div className="alert error" role="alert" data-testid="login-error">{result.message}</div>}
          <button className="btn primary" data-testid="aut-login-submit" type="submit">Sign in</button>
        </form> : !result?.ok ? <form onSubmit={register} noValidate><label>Full name<input data-testid="aut-register-name" value={registration.name} onChange={(e) => setRegistration({ ...registration, name: e.target.value })} /></label><label>Email address<input data-testid="aut-register-email" value={registration.email} onChange={(e) => setRegistration({ ...registration, email: e.target.value })} /></label><label>Password<input data-testid="aut-register-password" type="password" value={registration.password} onChange={(e) => setRegistration({ ...registration, password: e.target.value })} /></label><label>Confirm password<input data-testid="aut-register-confirm" type="password" value={registration.confirmPassword} onChange={(e) => setRegistration({ ...registration, confirmPassword: e.target.value })} /></label>{result && <div className="alert error" role="alert">{result.message}</div>}<button className="btn primary" data-testid="aut-register-submit">Create account</button></form> : <div className="signed-in" data-testid="signed-in-state"><span className="success-icon">✓</span><h3>{mode === 'login' ? `Welcome, ${result.user.name}` : 'Registration successful'}</h3><p>{mode === 'login' ? `You are signed in as ${result.user.email}.` : result.message}</p><button className="btn" onClick={reset}>Reset</button></div>}
      </section>
      <aside className="card"><h2>Server-backed account</h2><p>Registration sends data to the Express API, which stores only a salted password hash for the current local server session.</p><p className="hint">Create a registration first, then use the same credentials to log in. Playwright creates its own fresh account during automation.</p><h3>Automation evidence</h3><p>Playwright verifies real browser-to-server registration and login behaviour, including validation and rejected credentials.</p></aside>
    </div>
    <section className="card"><h2>Automated scenario coverage</h2><div className="table-wrap"><table><thead><tr><th>ID</th><th>Scenario</th><th>What the real test verifies</th><th>Tool</th></tr></thead><tbody>{SCENARIOS.map(([id, scenario, detail]) => <tr key={id}><td>{id}</td><td>{scenario}</td><td>{detail}</td><td><span className="badge source-ai">Playwright</span></td></tr>)}</tbody></table></div></section>
    <section className="card"><div className="page-head"><div><h2>Automation execution</h2><p className="hint">Runs the real Login/Register Playwright suite in a browser. The suite creates its own test account, so your personal demo account is not changed.</p></div><button className="btn primary" onClick={runAll} disabled={automation.loading}>{automation.loading ? 'Running browser tests...' : 'Run all automated test cases'}</button></div>{automation.error && <div className="alert error" role="alert">{automation.error}</div>}{automation.results.length > 0 && <div className="table-wrap"><table><thead><tr><th>Automation ID</th><th>Scenario</th><th>Result</th><th>Evidence</th></tr></thead><tbody>{automation.results.map((item) => <tr key={item.id}><td>{item.id}</td><td>{item.title}</td><td><span className={`badge status-${item.status.toLowerCase()}`}>{item.status}</span></td><td>{item.screenshot ? <a href={`http://127.0.0.1:5001${item.screenshot}`} target="_blank" rel="noreferrer">Open screenshot</a> : <a href={`http://127.0.0.1:5001${item.report}`} target="_blank" rel="noreferrer">Open run report</a>}</td></tr>)}</tbody></table></div>}</section>
    <div className="callout-like warning-like"><strong>Professional honesty:</strong> a production login system would use a secure server, password hashing, rate limiting, sessions, and a real database. This small AUT exists to demonstrate genuine automation techniques inside a portfolio project.</div>
  </>;
}

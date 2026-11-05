import { useState } from 'react';
import { PRIORITIES, TYPES, STATUSES } from '../utils/testCases.js';

export default function EditModal({ testCase, onSave, onClose, points = [] }) {
  const [form, setForm] = useState({ ...testCase, steps: testCase.steps.join('\n') });
  const [error, setError] = useState('');
  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  function submit(e) {
    e.preventDefault();
    const steps = form.steps.split('\n').map((s) => s.trim()).filter(Boolean);
    if (!form.scenario.trim() || !form.description.trim() || !form.expectedResult.trim() || !steps.length) {
      return setError('Scenario, description, at least one step and expected result are required.');
    }
    onSave({
      ...form,
      scenario: form.scenario.trim(),
      description: form.description.trim(),
      expectedResult: form.expectedResult.trim(),
      preconditions: form.preconditions.trim() || 'None',
      testData: form.testData.trim() || 'N/A',
      steps,
    });
  }

  const select = (key, options) => (
    <select value={form[key]} onChange={set(key)}>{options.map((o) => <option key={o}>{o}</option>)}</select>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <h2>Edit {testCase.id}</h2>
        <label>Test scenario<input value={form.scenario} onChange={set('scenario')} /></label>
        <label>Test description<textarea rows={2} value={form.description} onChange={set('description')} /></label>
        <label>Preconditions<textarea rows={2} value={form.preconditions} onChange={set('preconditions')} /></label>
        <label>Test steps (one per line)<textarea rows={4} value={form.steps} onChange={set('steps')} /></label>
        <label>Test data<textarea rows={2} value={form.testData} onChange={set('testData')} /></label>
        <label>Expected result<textarea rows={2} value={form.expectedResult} onChange={set('expectedResult')} /></label>
        <div className="three-col">
          <label>Priority{select('priority', PRIORITIES)}</label>
          <label>Test type{select('type', TYPES)}</label>
          <label>Status{select('status', STATUSES)}</label>
        </div>
        <label>Linked requirement
          <select value={form.requirementId || ''} onChange={set('requirementId')}>
            <option value="">Unlinked</option>
            {points.map((point) => <option key={point.id} value={point.id}>{point.id} - {point.text}</option>)}
          </select>
        </label>
        {error && <div className="alert error" role="alert">{error}</div>}
        <div className="btn-row end">
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn primary">Save changes</button>
        </div>
      </form>
    </div>
  );
}

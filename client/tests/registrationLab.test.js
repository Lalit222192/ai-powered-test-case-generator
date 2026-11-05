import test from 'node:test';
import assert from 'node:assert/strict';
import { validateRegistration } from '../src/utils/registrationLab.js';
test('registration validates required fields, password boundary and confirmation', () => {
  assert.equal(validateRegistration({}).ok, false);
  assert.equal(validateRegistration({ name: 'QA', email: 'qa@example.com', password: 'short', confirmPassword: 'short' }).ok, false);
  assert.equal(validateRegistration({ name: 'QA', email: 'qa@example.com', password: 'SecurePass1', confirmPassword: 'Different1' }).ok, false);
  assert.equal(validateRegistration({ name: 'QA', email: 'qa@example.com', password: 'SecurePass1', confirmPassword: 'SecurePass1' }).ok, true);
});

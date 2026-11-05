import test from 'node:test';
import assert from 'node:assert/strict';
import { DEMO_ACCOUNT, validateLogin } from '../src/utils/loginLab.js';

test('login validation covers happy path and important negative paths', () => {
  assert.equal(validateLogin({}).code, 'REQUIRED');
  assert.equal(validateLogin({ email: 'not-an-email', password: '12345678' }).code, 'EMAIL_FORMAT');
  assert.equal(validateLogin({ email: 'x@y.com', password: 'short' }).code, 'PASSWORD_LENGTH');
  assert.equal(validateLogin({ email: 'x@y.com', password: '12345678' }).code, 'INVALID_CREDENTIALS');
  assert.equal(validateLogin(DEMO_ACCOUNT).ok, true);
});

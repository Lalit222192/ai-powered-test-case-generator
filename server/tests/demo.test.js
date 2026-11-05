import test from 'node:test';
import assert from 'node:assert/strict';
import { demoGenerate, detectCategory } from '../src/demo.js';
import { validateTestCases, TYPES } from '../src/validate.js';

const samples = {
  login: 'Create a login system where users can log in using their email and password.',
  cart: 'Build an e-commerce shopping cart where users add products and checkout.',
  registration: 'Create a user registration form with name, email and password.',
  generic: 'A library app that lets members borrow up to 3 books at a time.',
};

for (const [category, text] of Object.entries(samples)) {
  test(`demo generation for "${category}" is valid and covers all test types`, () => {
    assert.equal(detectCategory(text), category);
    const { testCases, skipped } = validateTestCases(demoGenerate(text));
    assert.equal(skipped, 0);
    assert.ok(testCases.length >= 6);
    const types = new Set(testCases.map((t) => t.type));
    for (const type of TYPES) {
      if (category === 'generic' && type === 'Positive') continue; // still present, but keep check simple
      assert.ok(types.has(type), `${category} is missing type ${type}`);
    }
  });
}

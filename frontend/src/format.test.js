import test from 'node:test';
import assert from 'node:assert/strict';
import { inr, budgetSummary } from './format.js';

test('formats INR with Indian denominations and rejects missing values', () => {
  assert.equal(inr(10000000, true), '₹1.00 Cr');
  assert.equal(inr(250000, true), '₹2.5 L');
  assert.equal(inr(0), '₹0');
  assert.equal(inr(NaN), '—');
  assert.equal(inr(null), '—');
});

test('budget totals only selected known investments and reports overspend', () => {
  const rows = [{ id: 'a', cost_inr: 200 }, { id: 'b', cost_inr: 400 }];
  assert.deepEqual(budgetSummary(rows, ['a', 'a', 'unknown'], '1000'), { valid: true, spent: 200, remaining: 800 });
  assert.deepEqual(budgetSummary(rows, ['a', 'b'], '100'), { valid: true, spent: 600, remaining: -500 });
  assert.equal(budgetSummary(rows, [], '0').valid, true);
});

test('invalid budgets are not silently treated as zero', () => {
  for (const value of ['', ' ', '-1', '1.5', 'abc', 'Infinity', '9007199254740992']) {
    assert.equal(budgetSummary([], [], value).valid, false);
  }
});

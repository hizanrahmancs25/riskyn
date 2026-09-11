export function inr(value, compact = false) {
  if (!Number.isFinite(value)) return '—';
  if (compact && Math.abs(value) >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (compact && Math.abs(value) >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(value);
}

export function budgetSummary(investments, selectedIds, budgetInput) {
  const budget = Number(budgetInput);
  const valid = String(budgetInput).trim() !== '' && Number.isSafeInteger(budget) && budget >= 0;
  const spent = investments.filter((item) => selectedIds.includes(item.id))
    .reduce((total, item) => total + item.cost_inr, 0);
  return { valid, spent, remaining: valid ? budget - spent : null };
}

import { test, expect } from '@playwright/test';

async function openDashboard(page) {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Your business. A clearer picture.' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reload demo data' })).toBeEnabled();
}

function navigation(page, name) {
  return page.getByRole('navigation', { name: 'Main navigation' }).getByRole('button', { name, exact: true });
}

test('loads the demo, exposes chart values, and opens and closes process details', async ({ page }) => {
  const errors = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await openDashboard(page);
  await expect(page.getByText('Illustrative demo.', { exact: true })).toBeVisible();
  await page.getByText('View chart data', { exact: true }).click();
  await expect(page.getByRole('cell', { name: '₹1,32,00,000', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'View Digital payments details' }).click();
  const dialog = page.getByRole('dialog', { name: 'Digital payments' });
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  await page.getByRole('button', { name: 'View Digital payments details' }).click();
  await expect(dialog).toBeVisible();
  await dialog.getByRole('button', { name: 'Close' }).click();
  await expect(dialog).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('searches and sorts business processes including empty results', async ({ page }) => {
  await openDashboard(page);
  await navigation(page, 'Business processes').click();
  await page.getByLabel('Search processes').fill('treasury');
  await expect(page.getByRole('button', { name: 'View Treasury operations details' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'View Digital payments details' })).toHaveCount(0);
  await page.getByLabel('Search processes').fill('no matching process');
  await expect(page.getByText('No processes match your search.')).toBeVisible();
  await page.getByLabel('Search processes').fill('');
  await page.getByLabel('Sort by').selectOption('name');
  await expect(page.locator('tbody tr').first()).toContainText('Customer platform');
});

test('validates a manual budget without implying optimization', async ({ page }) => {
  await openDashboard(page);
  await navigation(page, 'Investment planner').click();
  await page.getByRole('checkbox', { name: /Observability expansion/ }).check();
  await expect(page.locator('.allocation')).toContainText('₹6,00,000');
  await page.getByLabel('Budget in INR').fill('100');
  await expect(page.locator('.allocation')).toContainText('Over budget');
  await expect(page.locator('.allocation')).toContainText('₹5,99,900');
  await page.getByLabel('Budget in INR').fill('');
  await expect(page.getByLabel('Budget in INR')).toHaveAttribute('aria-invalid', 'true');
  await page.getByRole('button', { name: 'Clear selection' }).click();
  await expect(page.getByRole('checkbox', { name: /Observability expansion/ })).not.toBeChecked();
  await expect(page.getByText(/Cost calculator only/)).toBeVisible();
});

test('recovers from an unavailable API', async ({ page }) => {
  await page.route('**/api/dashboard', (route) => route.fulfill({ status: 503, contentType: 'application/json', body: '{}' }));
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('Unable to load the dashboard');
  await page.unroute('**/api/dashboard');
  await page.getByRole('button', { name: 'Retry', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Process overview' })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
});

test('reports integrations as disconnected and fits the viewport', async ({ page }) => {
  await openDashboard(page);
  await navigation(page, 'Integrations').click();
  await expect(page.getByText('Not connected', { exact: true })).toHaveCount(6);
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
  expect(overflow).toBe(false);
  const response = await page.request.get('/openapi.json');
  expect(response.ok()).toBe(true);
});

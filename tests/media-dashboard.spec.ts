import { expect, test } from '@playwright/test';

test('Media dashboard filters sample production items and preserves shared links', async ({ page }) => {
  await page.goto('/media-dashboard');
  await expect(page.getByText('6 of 6 sample production items', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Review', exact: true }).click();
  await expect(page).toHaveURL('/media-dashboard?status=Review');
  await expect(page.getByText('1 of 6 sample production items', { exact: true })).toBeVisible();
  await expect(page.getByText('Regional Voices', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Review', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('button', { name: 'Reset dashboard filters', exact: true }).click();
  await expect(page).toHaveURL('/media-dashboard');
});

test('Dashboard items connect to the correct working template', async ({ page }) => {
  await page.goto('/media-dashboard?status=Production');
  await expect(page.getByText('Live Music Spotlight', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Open related production template →', exact: true }).click();
  await expect(page).toHaveURL('/media-templates/rights-checklist');
});

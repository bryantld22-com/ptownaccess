import { expect, test } from '@playwright/test';

test('cloud migration inventories local data and keeps upload owner-locked', async ({ page }) => {
  await page.goto('/operations/cloud-migration');
  await expect(page.getByText('CONFLICT-SAFE MIGRATION')).toBeVisible();
  await expect(page.getByText('Existing cloud records are never overwritten')).toBeVisible();
  await expect(page.getByText('Artist CRM updates')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Migrate to development project' })).toBeDisabled();
  await page.getByText('Run migration dry check').click();
  await expect(page.getByText(/Nothing was uploaded/)).toBeVisible();
});

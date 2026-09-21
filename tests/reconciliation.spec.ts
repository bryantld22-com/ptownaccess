import { expect, test } from '@playwright/test';

test('cloud reconciliation is read-only and owner-locked without credentials', async ({ page }) => {
  await page.goto('/operations/reconciliation');
  await expect(page.getByText('NO-WRITE COMPARISON')).toBeVisible();
  await expect(page.getByText('This screen never uploads, overwrites, deletes, or restores records.')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Run read-only reconciliation' })).toBeDisabled();
  await expect(page.getByText('No comparison run')).toBeVisible();
});

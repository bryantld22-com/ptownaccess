import { expect, test } from '@playwright/test';

test('operations backup validates before destructive restore is offered', async ({ page }) => {
  await page.goto('/operations/backup');
  await expect(page.getByText('CONFIDENTIAL OPERATIONS DATA')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy complete operations backup' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Replace local operations records' })).toHaveCount(0);
  await page.getByLabel('Paste operations backup').fill('{"invalid":true}');
  await page.getByRole('button', { name: 'Validate backup' }).click();
  await expect(page.getByText('This operations backup failed validation. Current device records are unchanged.')).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('cloud migration inventories local data without uploading it', async ({ page }) => {
  await page.goto('/operations/cloud-migration');
  await expect(page.getByText('DRY-RUN ONLY')).toBeVisible();
  await expect(page.getByText('No data leaves this device')).toBeVisible();
  await expect(page.getByText('Artist CRM updates')).toBeVisible();
  await expect(page.getByText('Upload remains locked in this build')).toBeDisabled();
  await page.getByText('Run migration dry check').click();
  await expect(page.getByText(/Nothing was uploaded/)).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('artist CRM opens profiles and protected booking workflow', async ({ page }) => {
  await page.goto('/operations/artists');
  await expect(page.getByText('Artist CRM', { exact: true }).first()).toBeVisible();
  await expect(page.getByText('Only official or directly confirmed contact routes belong here.')).toBeVisible();
  await page.getByText('Noah Thompson').click();
  await expect(page.getByText('Contact verification')).toBeVisible();
  await expect(page.getByText('Required before outreach')).toBeVisible();
  await page.getByText('Start Booking').click();
  await expect(page.getByText('Contact verification required')).toBeVisible();
  await expect(page.getByText('Preview workflow')).toBeVisible();
});

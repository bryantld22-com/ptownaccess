import { expect, test } from '@playwright/test';

test('CRM record edits feed the booking calendar', async ({ page }) => {
  await page.goto('/operations/artists/noah-thompson/edit');
  await expect(page.getByText('EDIT CRM RECORD')).toBeVisible();
  await page.getByLabel('Next action').fill('Review Saturday routing');
  await page.getByText('Warm', { exact: true }).click();
  await page.getByText('Save CRM record').click();
  await expect(page.getByText('Review Saturday routing')).toBeVisible();
  await page.getByText('Booking calendar').click();
  await page.getByLabel('Proposed date').fill('2027-08-07');
  await page.getByText('Save calendar entry').click();
  await expect(page.getByText('2027-08-07')).toBeVisible();
  await expect(page.getByText('Noah Thompson')).toBeVisible();
});

import { expect, test } from '@playwright/test';

test('marketing guide connects staffing and controls without claiming live launch', async ({ page }) => {
  await page.goto('/marketing');
  await page.getByRole('link', { name: 'Open the Marketing Department Guide →' }).click();
  await expect(page).toHaveURL('/marketing-operations');
  await expect(page.getByText('Marketing director', { exact: true })).toBeVisible();
  await expect(page.getByText('4. Approve', { exact: true })).toBeVisible();
  await expect(page.getByText('Weekly campaign meeting', { exact: true })).toBeVisible();
  await expect(page.getByText(/Never advertise an unconfirmed opening/)).toBeVisible();
  await page.getByRole('link', { name: 'Open the campaign calendar →' }).click();
  await expect(page).toHaveURL('/marketing-calendar');
});

import { expect, test } from '@playwright/test';

test('marketing calendar quarter links and resets without writing plans', async ({ page }) => {
  await page.goto('/marketing-calendar');
  await expect(page.getByText('12 of 12 campaign months shown.')).toBeVisible();
  await page.getByRole('tab', { name: 'Months 7–9' }).click();
  await expect(page).toHaveURL('/marketing-calendar?quarter=3');
  await expect(page.getByText('3 of 12 campaign months shown.')).toBeVisible();
  await expect(page.getByText('Month 7 · Weekly program stories')).toBeVisible();
  await expect(page.getByText('Month 1 · Brand foundation')).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Months 7–9' })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/marketing-calendar?quarter=99');
  await expect(page.getByText('12 of 12 campaign months shown.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBeNull();
});

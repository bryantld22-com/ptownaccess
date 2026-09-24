import { expect, test } from '@playwright/test';

test('budget worksheet calculates cents, flags overspend, and resets', async ({ page }) => {
  await page.goto('/marketing-budget');
  await page.getByRole('textbox', { name: 'Planning ceiling in dollars' }).fill('1000.00');
  await page.getByRole('textbox', { name: 'Brand identity and creative production' }).fill('125.25');
  await page.getByRole('textbox', { name: 'Paid placement by campaign and channel' }).fill('200.10');
  await expect(page.getByText(/Allocated: \$325\.35\. Unallocated: \$674\.65/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Paid placement by campaign and channel' }).fill('900.00');
  await expect(page.getByText(/Over ceiling by \$25\.25/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Paid placement by campaign and channel' }).fill('900.001');
  await expect(page.getByText('Enter zero or a positive amount with no more than two decimal places.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Planning ceiling in dollars' })).toHaveValue('');
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBeNull();
});

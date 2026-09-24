import { expect, test } from '@playwright/test';

test('scorecard calculates rates without storing campaign metrics', async ({ page }) => {
  await page.goto('/marketing-scorecard');
  await page.getByRole('textbox', { name: 'Campaign or reporting period' }).fill('Comedy launch');
  const inputs = [
    ['Campaign reach', '1000'], ['Program-page visits', '200'],
    ['Confirmed opt-ins', '40'], ['Verified attendance', '50'],
    ['Returning attendees', '10'],
  ] as const;
  for (const [name, value] of inputs) await page.getByRole('textbox', { name }).fill(value);
  await page.getByRole('textbox', { name: 'Campaign spend in dollars (optional)' }).fill('125.00');
  await expect(page.getByText(/Program-page visit rate: 20\.0%/)).toBeVisible();
  await expect(page.getByText(/Spend per attendee: \$2\.50/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Returning attendees' }).fill('51');
  await expect(page.getByRole('alert')).toContainText('returning attendees cannot exceed attendance');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Campaign reach' })).toHaveValue('');
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBeNull();
});

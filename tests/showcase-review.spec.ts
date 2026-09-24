import { expect, test } from '@playwright/test';

test('showcase review requires evidence and does not decide or store a result', async ({ page }) => {
  await page.goto('/events/ptown-flow');
  await page.getByRole('link', { name: 'Open the showcase review rubric →' }).click();
  await expect(page).toHaveURL('/showcase-review');
  await page.getByRole('textbox', { name: 'Artist or act name' }).fill('Sample Act');
  await page.getByRole('textbox', { name: 'Wednesday showcase date' }).fill('2026-09-30');
  for (const label of ['Audience engagement', 'Stage control', 'Craft delivery', 'Preparation', 'Professionalism']) {
    await page.getByRole('radiogroup', { name: label }).getByRole('radio', { name: '4', exact: true }).click();
  }
  await page.getByRole('textbox', { name: 'Observed evidence' }).fill('The act held attention through the final transition.');
  await page.getByRole('radiogroup', { name: 'Proposed discussion path' }).getByRole('radio', { name: 'More evidence needed' }).click();
  await expect(page.getByText(/A score does not approve enrollment/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Artist or act name' })).toHaveValue('');
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBeNull();
});

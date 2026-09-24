import { expect, test } from '@playwright/test';

test('showcase handoff calculates nine days and remains an unassigned draft', async ({ page }) => {
  await page.goto('/audition-path');
  await page.getByRole('link', { name: 'Plan the nine-day showcase handoff →' }).click();
  await expect(page).toHaveURL('/showcase-prep');
  await page.getByRole('textbox', { name: 'Proposed Monday audition date' }).fill('2026-09-21');
  await expect(page.getByText('2026-09-22 · Confirm selection and invitation')).toBeVisible();
  await expect(page.getByText('2026-09-30 · Wednesday showcase and review')).toBeVisible();
  await page.getByRole('textbox', { name: 'Proposed Monday audition date' }).fill('2026-09-22');
  await expect(page.getByRole('alert')).toContainText('Enter a real Monday date');
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Proposed Monday audition date' })).toHaveValue('');
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBeNull();
});

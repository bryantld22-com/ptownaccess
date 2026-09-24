import { expect, test } from '@playwright/test';

test('Monday audition draft calculates the following Wednesday and treats EPK as optional', async ({ page }) => {
  await page.goto('/events/monday-jazz');
  await page.getByRole('link', { name: 'Explore the audition-to-Wednesday path →' }).click();
  await expect(page).toHaveURL('/audition-path');
  await page.getByRole('textbox', { name: 'Artist or act name' }).fill('Sample Act');
  await page.getByRole('textbox', { name: 'Discipline' }).fill('Comedian');
  await page.getByRole('textbox', { name: 'Proposed Monday audition date' }).fill('2026-09-21');
  await expect(page.getByText('Possible Wednesday showcase: 2026-09-30')).toBeVisible();
  await expect(page.getByText(/EPK or performance link: Not supplied · optional/)).toBeVisible();
  await page.getByRole('textbox', { name: 'Proposed Monday audition date' }).fill('2026-09-22');
  await expect(page.getByText('Enter a real Monday date in YYYY-MM-DD format.')).toBeVisible();
  await page.getByRole('textbox', { name: 'Proposed Monday audition date' }).fill('2026-09-21');
  await page.getByRole('textbox', { name: 'EPK or performance link (optional)' }).fill('http://example.com');
  await expect(page.getByText('Use an HTTPS link, or leave this blank.')).toBeVisible();
  await page.reload();
  await expect(page.getByRole('textbox', { name: 'Artist or act name' })).toHaveValue('');
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBeNull();
});

import { expect, test } from '@playwright/test';

test('campaign draft requires all fields and does not persist', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/marketing-brief');
  await page.getByRole('button', { name: 'Copy campaign draft' }).click();
  await expect(page.getByRole('alert')).toContainText('Complete all six fields');
  const answers = [
    ['Campaign name', 'Wednesday discovery'], ['Intended audience', 'Regional artists'],
    ['Campaign objective', 'Increase visits'], ['Responsible owner', 'Event lead'],
    ['Guest action', 'Explore the program'], ['Success measure', 'Verified attendance'],
  ] as const;
  for (const [label, value] of answers) await page.getByRole('textbox', { name: label }).fill(value);
  await page.getByRole('button', { name: 'Copy campaign draft' }).click();
  await expect(page.getByText('Campaign draft copied. Nothing was submitted or approved.')).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Campaign: Wednesday discovery');
  await page.reload();
  await expect(page.getByText('0 of 6 fields completed.')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBeNull();
});

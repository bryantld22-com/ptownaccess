import { expect, test } from '@playwright/test';

test('launch worksheet resets after reload and cannot claim approval', async ({ page }) => {
  await page.goto('/championship-path');
  await expect(page.getByText('0 of 8 evidence items reviewed in this session.')).toBeVisible();
  await page.getByRole('checkbox', { name: 'Game rules and dispute process approved' }).click();
  await expect(page.getByText('1 of 8 evidence items reviewed in this session.')).toBeVisible();
  await page.getByRole('switch', { name: 'Show outstanding items only' }).click();
  await expect(page.getByRole('checkbox', { name: 'Game rules and dispute process approved' })).toHaveCount(0);
  await expect(page.getByRole('checkbox', { name: 'Quarterly dates and venue capacity confirmed' })).toBeVisible();
  await expect(page.getByText('COMPETITION · OWNER: PROGRAM DIRECTOR')).toBeVisible();
  await expect(page.getByText(/7 of 8 evidence items outstanding/)).toBeVisible();
  await expect(page.getByText(/Owner role: Program director · Competition/)).toBeVisible();
  await expect(page.getByText(/Owner role: Tournament director · Competition/)).toHaveCount(0);
  await expect(page.getByText(/Outstanding evidence must be reviewed/)).toBeVisible();
  await page.reload();
  await expect(page.getByText('0 of 8 evidence items reviewed in this session.')).toBeVisible();
  await expect(page.getByRole('switch', { name: 'Show outstanding items only' })).toHaveAttribute('aria-checked', 'false');
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBeNull();
});

test('planning handoff copies only outstanding actions and remains a draft', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/championship-path');
  await page.getByRole('checkbox', { name: 'Game rules and dispute process approved' }).click();
  await page.getByRole('button', { name: 'Copy planning handoff' }).click();
  await expect(page.getByText('Planning brief copied. Nothing was submitted or approved.')).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('7 of 8 evidence items outstanding');
  expect(copied).toContain('Owner role: Program director');
  expect(copied).not.toContain('Owner role: Tournament director');
  expect(copied).toContain('not registration, qualification');
});

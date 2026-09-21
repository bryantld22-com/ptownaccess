import { test, expect } from '@playwright/test';

const storageKey = '@ptown/preview/v1';

test('Friend 2 Friend edits tournament games without losing unsaved invitation details', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/friends?program=monday-jazz&games=spades,chess');
  await page.getByRole('textbox', { name: 'Preferred invitation date (optional)', exact: true }).fill('2026-09-28');
  await page.getByRole('textbox', { name: 'Estimated invitation group (optional)', exact: true }).fill('4');
  await page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true }).fill('Bring your best game.');
  await page.getByRole('button', { name: 'Change tournament games in invitation', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Spades', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Chess', exact: true })).toBeChecked();
  await page.getByRole('checkbox', { name: 'Bid Whist', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Spades', exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get('games')).toBe('bid-whist,chess');
  await expect(page.getByText('Bid Whist · Chess', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Preferred invitation date (optional)', exact: true })).toHaveValue('2026-09-28');
  await expect(page.getByRole('textbox', { name: 'Estimated invitation group (optional)', exact: true })).toHaveValue('4');
  await expect(page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true })).toHaveValue('Bring your best game.');
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(/Tournament games: Bid Whist, Chess[\s\S]*Preferred date: 2026-09-28[\s\S]*Estimated group: 4 people[\s\S]*Bring your best game\./);
  await page.getByRole('button', { name: 'Done choosing tournament games', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Bid Whist', exact: true })).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect(errors).toEqual([]);
});

test('Adding or clearing invitation games stays explicit and preserves private device plans', async ({ page }) => {
  const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: null, membershipInterest: 'vip', tournamentInterest: { gameIds: ['spades'], savedAt: '2026-09-21T00:00:00.000Z' } };
  await page.goto('/');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key: storageKey, plans });
  await page.goto('/friends?program=monday-jazz');
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).not.toHaveValue(/Tournament games:/);
  await page.getByRole('button', { name: 'Add tournament games to invitation', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Hearts', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Dominoes', exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get('games')).toBe('hearts,dominoes');
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(/Tournament games: Hearts, Dominoes/);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(plans);
  await page.getByRole('radio', { name: 'Tuesday: Musician Jam Session', exact: true }).click();
  await expect(page).toHaveURL('/friends?program=tuesday-jazz');
  await expect(page.getByRole('heading', { name: 'Tournament games in this invitation', exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).not.toHaveValue(/Tournament games:/);
  await page.getByRole('radio', { name: 'Monday: Auditions for PTown', exact: true }).click();
  await page.getByRole('button', { name: 'Add tournament games to invitation', exact: true }).click();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(plans);
});

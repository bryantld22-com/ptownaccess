import { test, expect } from '@playwright/test';

const storageKey = '@ptown/preview/v1';

test('Tournament Hub explicitly hands only selected games to Friend 2 Friend', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tournament');
  const handoff = page.getByRole('button', { name: 'Plan selected games with friends', exact: true });
  await expect(handoff).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Spades', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Chess', exact: true }).click();
  await expect(handoff).toBeEnabled();
  await handoff.click();
  await expect(page).toHaveURL('/friends?program=monday-jazz&games=spades%2Cchess');
  await expect(page.getByRole('heading', { name: 'Tournament games in this invitation', exact: true })).toBeVisible();
  await expect(page.getByText('Spades · Chess', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(/Tournament games: Spades, Chess \(planning interests only; not registration or reserved entry\)\./);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect(errors).toEqual([]);
});

test('Saved tournament interests never enter an invitation without explicit handoff', async ({ page }) => {
  const plans = { version: 1, savedEventIds: [], savedPathwayIds: [], reservationDraft: null, membershipInterest: null, tournamentInterest: { gameIds: ['bid-whist', 'dominoes'], savedAt: '2026-09-21T00:00:00.000Z' } };
  await page.goto('/');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key: storageKey, plans });
  await page.goto('/friends?program=monday-jazz');
  const preview = page.getByRole('textbox', { name: 'Invitation preview', exact: true });
  await expect(preview).not.toHaveValue(/Tournament games:/);
  await expect(page.getByRole('heading', { name: 'Tournament games in this invitation', exact: true })).toHaveCount(0);
  await page.goto('/friends?program=monday-jazz&games=spades,chess');
  await expect(preview).toHaveValue(/Tournament games: Spades, Chess/);
  await expect(preview).not.toHaveValue(/Bid Whist|Dominoes/);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(plans);
  await page.getByRole('button', { name: 'Remove tournament games from invitation', exact: true }).click();
  await expect(page).toHaveURL('/friends?program=monday-jazz');
  await expect(preview).not.toHaveValue(/Tournament games:/);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(plans);
});

test('Invalid game links recover safely and changing programs removes tournament games', async ({ page }) => {
  await page.goto('/friends?program=monday-jazz&games=chess,unknown,spades,spades');
  await expect(page.getByText('Spades · Chess', { exact: true })).toBeVisible();
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(/Tournament games: Spades, Chess/);
  await page.getByRole('radio', { name: 'Tuesday: Musician Jam Session', exact: true }).click();
  await expect(page).toHaveURL('/friends?program=tuesday-jazz');
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).not.toHaveValue(/Tournament games:/);
  await page.goto('/friends?program=monday-jazz&games=chess,unknown,spades,spades');
  await expect(page.getByRole('radio', { name: 'Monday: Auditions for PTown', exact: true })).toBeChecked();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

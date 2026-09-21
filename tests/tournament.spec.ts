import { test, expect } from '@playwright/test';

const storageKey = '@ptown/preview/v1';

test('Tournament Hub preserves the approved Monday plan without claiming registration', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tournament');
  await expect(page.getByRole('heading', { name: 'Cards, Dominoes & Chess Tournament', exact: true })).toBeVisible();
  for (const game of ['Spades', 'Bid Whist', 'Hearts', 'Dominoes', 'Chess']) await expect(page.getByText(game, { exact: true })).toHaveCount(3);
  await expect(page.getByText(/free guest admission/i)).toBeVisible();
  await expect(page.getByText(/registration and check-in will be required once enabled/i)).toBeVisible();
  await expect(page.getByText(/does not enroll a player, hold a place, or record attendance/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Invite friends to Auditions for PTown →', exact: true })).toHaveAttribute('href', '/friends?program=monday-jazz');
  await expect(page.getByRole('link', { name: 'Open Auditions for PTown →', exact: true })).toHaveAttribute('href', '/events/monday-jazz');
  await expect(page.getByRole('link', { name: 'Plan a Monday visit →', exact: true })).toHaveAttribute('href', '/visit?day=Monday');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect(errors).toEqual([]);
});

test('Game filters are shareable, reload safely, and recover unknown selections', async ({ page }) => {
  await page.goto('/tournament');
  await page.getByRole('tab', { name: 'Bid Whist', exact: true }).click();
  await expect(page).toHaveURL('/tournament?game=bid-whist');
  await expect(page.getByText('1 of 5 tournament games shown', { exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Bid Whist', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Spades', { exact: true })).toHaveCount(2);
  await expect(page.getByText('Bid Whist', { exact: true })).toHaveCount(3);
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Bid Whist', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'All games', exact: true }).click();
  await expect(page).toHaveURL('/tournament');
  await expect(page.getByText('5 of 5 tournament games shown', { exact: true })).toBeVisible();
  await page.goto('/tournament?game=unknown');
  await expect(page.getByRole('tab', { name: 'All games', exact: true })).toHaveAttribute('aria-selected', 'true');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
});

test('Monday program, visit guide, and global search lead to the Tournament Hub', async ({ page }) => {
  await page.goto('/events/monday-jazz');
  await page.getByRole('link', { name: 'Explore the monthly tournament →', exact: true }).click();
  await expect(page).toHaveURL('/tournament');
  await page.goto('/visit?day=Monday');
  await expect(page.getByRole('link', { name: 'Explore the monthly tournament →', exact: true })).toHaveAttribute('href', '/tournament');
  await page.goto('/search?q=tournament+hub');
  await expect(page.getByText('1 result', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Open Monthly Tournament Hub', exact: true }).click();
  await expect(page).toHaveURL('/tournament');
});

test('Tournament interests persist across Saved Plans and remain explicitly non-registration', async ({ page }) => {
  await page.goto('/tournament');
  await page.getByRole('button', { name: 'Save tournament interests', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose at least one tournament game before saving.');
  await page.getByRole('checkbox', { name: 'Spades', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Chess', exact: true }).click();
  await page.getByRole('button', { name: 'Save tournament interests', exact: true }).click();
  await expect(page.getByText('Tournament interests saved on this device. You are not registered and no place is reserved.', { exact: true })).toBeVisible();
  const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).tournamentInterest, storageKey);
  expect(saved.gameIds).toEqual(['spades', 'chess']); expect(typeof saved.savedAt).toBe('string');
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Spades', exact: true })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: 'Chess', exact: true })).toBeChecked();
  await page.goto('/profile');
  await expect(page.getByRole('heading', { name: 'Tournament interests', exact: true })).toBeVisible();
  await expect(page.getByText('Spades · Chess', { exact: true })).toBeVisible();
  await page.goto('/plans');
  await expect(page.getByRole('textbox', { name: 'Preview plan summary', exact: true })).toHaveValue(/TOURNAMENT INTERESTS[\s\S]*Spades[\s\S]*Chess[\s\S]*not registered/);
  await page.goto('/backup');
  const code = JSON.parse(await page.getByRole('textbox', { name: 'Your transfer code', exact: true }).inputValue());
  expect(code.plans.tournamentInterest.gameIds).toEqual(['spades', 'chess']);
  await page.goto('/tournament');
  await page.getByRole('button', { name: 'Remove saved tournament interests', exact: true }).click();
  await expect(page.getByText('Tournament interests removed from this device.', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).tournamentInterest, storageKey)).toBeNull();
});

test('Reviewed transfer moves tournament interests without creating registration', async ({ page, browser }) => {
  await page.goto('/tournament');
  await page.getByRole('checkbox', { name: 'Bid Whist', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Dominoes', exact: true }).click();
  await page.getByRole('button', { name: 'Save tournament interests', exact: true }).click();
  await page.goto('/backup');
  const code = await page.getByRole('textbox', { name: 'Your transfer code', exact: true }).inputValue();
  const destination = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const other = await destination.newPage();
    await other.goto('/backup');
    await other.getByRole('textbox', { name: 'Paste a transfer code', exact: true }).fill(code);
    await other.getByRole('button', { name: 'Review transfer code', exact: true }).click();
    await expect(other.getByText('0 saved programs · 2 tournament interests', { exact: false })).toBeVisible();
    expect(await other.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
    await other.getByRole('button', { name: 'Replace this device’s plans', exact: true }).click();
    await expect(other.getByText('Plans restored on this device. No bookings, purchases, or enrollment were created.', { exact: true })).toBeVisible();
    await other.goto('/tournament');
    await expect(other.getByRole('checkbox', { name: 'Bid Whist', exact: true })).toBeChecked();
    await expect(other.getByRole('checkbox', { name: 'Dominoes', exact: true })).toBeChecked();
    await expect(other.getByText(/You are not registered and no place is reserved/)).toHaveCount(0);
    await expect(other.getByText('Saved on this device: Bid Whist, Dominoes.', { exact: true })).toBeVisible();
  } finally { await destination.close(); }
});

import { test, expect } from '@playwright/test';

const key = '@ptown/preview/v1';
const plans = { version: 1, savedEventIds: ['comedy', 'tuesday-jazz'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday', savedAt: '2026-09-17T00:00:00Z' }, membershipInterest: 'vip' };

test('Profile categories expose live counts, survive refresh, and preserve all saved plans', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/profile');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.goto('/profile?view=dinner');
  await expect(page.getByRole('tab', { name: 'Dinner', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: 'All plans', exact: true })).toHaveText('All plans5');
  await expect(page.getByRole('tab', { name: 'Events', exact: true })).toHaveText('Events2');
  await expect(page.getByRole('heading', { name: 'Reservation draft', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Saved events', exact: true })).toHaveCount(0);
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Dinner', exact: true })).toHaveAttribute('aria-selected', 'true');
  for (const [label, value, heading] of [['Membership', 'membership', 'Membership interest'], ['Creative', 'creative', 'Creative interests'], ['Events', 'events', 'Saved events']]) {
    await page.getByRole('tab', { name: label, exact: true }).click();
    await expect(page).toHaveURL(`/profile?view=${value}`);
    await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible();
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  await page.getByRole('link').and(page.locator('a[href="/events/comedy"]')).click();
  await page.getByRole('button', { name: 'Remove saved event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save this event', exact: true })).toBeEnabled();
  await page.goto('/profile?view=events');
  await expect(page.getByRole('tab', { name: 'Events', exact: true })).toHaveText('Events1');
  await expect(page.getByRole('tab', { name: 'All plans', exact: true })).toHaveText('All plans4');
  await page.getByRole('tab', { name: 'All plans', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  await expect(page.getByRole('heading', { name: 'Your planning checklist', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Category links show only this device and empty, unknown, and narrow views recover', async ({ page, browser }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/profile');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.goto('/profile?view=creative');
  const otherContext = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const other = await otherContext.newPage();
    await other.goto('/profile?view=creative');
    await expect(other.getByRole('tab', { name: 'All plans', exact: true })).toHaveText('All plans0');
    await expect(other.getByText('Discover your creative path', { exact: true })).toBeVisible();
    expect(await other.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  } finally { await otherContext.close(); }
  await page.goto('/profile?view=unknown');
  await expect(page.getByRole('tab', { name: 'All plans', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Membership', exact: true }).focus();
  await page.getByRole('tab', { name: 'Membership', exact: true }).press('Enter');
  await expect(page).toHaveURL('/profile?view=membership');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  expect(errors).toEqual([]);
});

test('Failed resets preserve counts and unreadable data does not show false zero counts', async ({ page }) => {
  await page.goto('/profile');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.reload();
  await page.evaluate(() => { Storage.prototype.removeItem = () => { throw new Error('Denied'); }; });
  await page.getByRole('button', { name: 'Clear saved preview data', exact: true }).click();
  await page.getByRole('button', { name: 'Clear my saved plans', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('previously saved plans have been kept');
  await expect(page.getByRole('tab', { name: 'All plans', exact: true })).toHaveText('All plans5');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  await page.reload(); await page.evaluate(key => localStorage.setItem(key, 'unreadable'), key);
  await page.reload();
  await expect(page.getByRole('tab', { name: 'All plans', exact: true })).toBeDisabled();
  await expect(page.getByRole('tab', { name: 'All plans', exact: true })).toHaveText('All plans…');
  await page.getByRole('button', { name: 'Clear saved preview data', exact: true }).click();
  await page.getByRole('button', { name: 'Keep my plans', exact: true }).click();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe('unreadable');
  await page.getByRole('button', { name: 'Clear saved preview data', exact: true }).click();
  await page.getByRole('button', { name: 'Clear my saved plans', exact: true }).click();
  await expect(page.getByRole('tab', { name: 'All plans', exact: true })).toHaveText('All plans0');
  await expect(page.getByRole('tab', { name: 'All plans', exact: true })).toBeEnabled();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
});

import { test, expect } from '@playwright/test';

const key = '@ptown/preview/v1';
const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday', savedAt: '2026-09-17T00:00:00Z' }, membershipInterest: 'vip' };

test('Home resumes every saved category without changing stored plans', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Continue planning', exact: true })).toBeVisible();
  for (const [label, view] of [['Review saved programs', 'events'], ['Review dinner draft', 'dinner'], ['Review membership interest', 'membership'], ['Review creative interests', 'creative']]) {
    const link = page.getByRole('link', { name: label, exact: true });
    await expect(link).toHaveAttribute('href', `/profile?view=${view}`);
    await expect(link).toHaveCSS('background-color', 'rgb(25, 23, 19)');
    await link.click(); await expect(page).toHaveURL(`/profile?view=${view}`);
    await page.getByRole('navigation', { name: 'PTown shortcuts' }).getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
  }
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  expect(errors).toEqual([]);
});

test('Home starts empty devices and updates shortcuts after saving and removing a favorite', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Start with a good idea', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Review saved programs', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Choose your first program →', exact: true }).click();
  await page.getByRole('link').and(page.locator('a[href="/events/comedy"]')).click();
  await page.getByRole('button', { name: 'Save this event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved event', exact: true })).toBeEnabled();
  await page.getByRole('navigation', { name: 'PTown shortcuts' }).getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Review saved programs', exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Review dinner draft', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Review saved programs', exact: true }).click();
  await page.getByRole('link').and(page.locator('a[href="/events/comedy"]')).click();
  await page.getByRole('button', { name: 'Remove saved event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save this event', exact: true })).toBeEnabled();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Start with a good idea', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Home routes expired dinner plans to editing and unreadable data to recovery', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify({ ...plans, reservationDraft: { ...plans.reservationDraft, date: '2000-01-01' } })), { key, plans });
  await page.reload();
  const expired = page.getByRole('link', { name: 'Update your dinner draft', exact: true });
  await expect(expired).toHaveAttribute('href', '/reservations');
  await expect(expired).toContainText('Preferred date has passed');
  await expired.click(); await expect(page).toHaveURL('/reservations');
  await expect(page.getByRole('textbox', { name: 'Preferred date', exact: true })).toHaveValue('2000-01-01');
  await page.evaluate(key => localStorage.setItem(key, 'unreadable'), key);
  await page.goto('/');
  await expect(page.getByText(/Your saved plans could not be read\. Open Profile to recover/)).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Start with a good idea', exact: true })).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Review saved programs', exact: true })).toHaveCount(0);
  await page.getByRole('link', { name: 'Manage saved plans →', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  await expect(page.getByRole('button', { name: 'Clear saved preview data', exact: true })).toBeEnabled();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe('unreadable');
});

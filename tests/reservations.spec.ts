import { test, expect } from '@playwright/test';

test.use({ timezoneId: 'America/Los_Angeles' });
const key = '@ptown/preview/v1';
const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], membershipInterest: 'vip', reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday', notes: 'Vegetarian menu interest.', savedAt: '2026-09-17T00:00:00Z' } };

test('Saved dinner summary stays distinct from edits and deletes only the draft', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/reservations');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.reload();
  await expect(page.getByText('2030-08-11 · 4 guests · Sunday', { exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Preferred date', exact: true }).fill('2030-08-10');
  await page.getByRole('textbox', { name: 'Number of guests', exact: true }).fill('1');
  await expect(page.getByText('2030-08-11 · 4 guests · Sunday', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  await page.getByRole('button', { name: 'Save reservation draft', exact: true }).click();
  await expect(page.getByText('2030-08-10 · 1 guest · Saturday', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Explore your Saturday evening →', exact: true }).click();
  await expect(page).toHaveURL('/visit?day=Saturday');
  await expect(page.getByRole('button', { name: 'Saturday', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('link').and(page.locator('a[href="/events/blues-country"]'))).toContainText('Any Genre');
  await page.goto('/reservations');
  await page.getByRole('button', { name: 'Delete reservation draft', exact: true }).click();
  await expect(page.getByText(/No dinner draft is saved yet/)).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual({ ...plans, reservationDraft: null });
  await page.reload(); await expect(page.getByText(/No dinner draft is saved yet/)).toBeVisible();
  expect(errors).toEqual([]);
});

test('Reservations validate inputs, disclose planning terms, and fit narrow screens', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/reservations');
  await expect(page.getByRole('button', { name: 'Save reservation draft', exact: true })).toBeEnabled();
  await page.getByRole('textbox', { name: 'Preferred date', exact: true }).fill('2030-02-30');
  await page.getByRole('textbox', { name: 'Number of guests', exact: true }).fill('0');
  await page.getByRole('button', { name: 'Save reservation draft', exact: true }).click();
  await expect(page.getByText('Choose a real calendar date.', { exact: true })).toBeVisible();
  await expect(page.getByText('Enter a whole number of guests from 1 to 999.', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  const question = page.getByRole('button', { name: 'Does my draft hold a table?', exact: true });
  await question.focus(); await question.press('Enter');
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/PTown has not received it, no table is held/)).toBeVisible();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('Expired and unreadable drafts recover; failed deletion keeps the saved summary', async ({ page }) => {
  await page.goto('/reservations');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify({ ...plans, reservationDraft: { ...plans.reservationDraft, date: '2000-01-01' } })), { key, plans });
  await page.reload();
  await expect(page.getByText('This preferred date has passed. Update your dinner draft.', { exact: true })).toBeVisible();
  const previous = await page.evaluate(key => localStorage.getItem(key), key);
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Full storage'); }; });
  await page.getByRole('button', { name: 'Delete reservation draft', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('previously saved plans have been kept');
  await expect(page.getByText('2000-01-01 · 4 guests · Saturday', { exact: true })).toBeVisible();
  await expect(page.getByText('Reservation draft deleted from this device.', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe(previous);
  await page.reload(); await page.evaluate(key => localStorage.setItem(key, 'unreadable'), key);
  await page.reload(); await expect(page.getByRole('button', { name: 'Save reservation draft', exact: true })).toBeDisabled();
  await expect(page.getByText(/Your saved dinner draft could not be read/)).toBeVisible();
  await expect(page.getByText(/No dinner draft is saved yet/)).toHaveCount(0);
});

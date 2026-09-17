import { test, expect } from '@playwright/test';

const key = '@ptown/preview/v1';
const plans = { version: 1, savedEventIds: ['comedy', 'blues-country', 'tuesday-jazz'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday', savedAt: '2026-09-17T00:00:00Z' }, membershipInterest: 'vip' };

test('Shared ticket topics survive reloads without altering saved programs or plans', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tickets');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.goto('/tickets?topic=food');
  await expect(page.getByRole('tab', { name: 'Food & after-parties', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('heading', { name: 'Plan the whole evening', exact: true })).toBeVisible();
  const savedLinks = page.getByRole('link').and(page.locator('a[href^="/events/"]'));
  await expect(savedLinks).toHaveCount(2);
  await expect(savedLinks.filter({ hasText: 'Any Genre' })).toHaveAttribute('href', '/events/blues-country');
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Food & after-parties', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Arrival & passes', exact: true }).click();
  await expect(page).toHaveURL('/tickets?topic=entry');
  await expect(page.getByText(/No digital pass or check-in code is issued/)).toBeVisible();
  await page.getByRole('tab', { name: 'Admission', exact: true }).click();
  await expect(page).toHaveURL('/tickets');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  await savedLinks.filter({ hasText: 'Comedy Night' }).click();
  await page.getByRole('button', { name: 'Remove saved event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save this event', exact: true })).toBeEnabled();
  await page.goto('/tickets'); await expect(savedLinks).toHaveCount(1);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual({ ...plans, savedEventIds: ['blues-country', 'tuesday-jazz'] });
  expect(errors).toEqual([]);
});

test('Admission explanations, question controls, and empty tickets fit every device', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/tickets?topic=unknown');
  await expect(page.getByRole('tab', { name: 'Admission', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('No saved ticketed programs', { exact: true })).toBeVisible();
  await expect(page.getByText(/Tuesday: Musician Jam Session/)).toBeVisible();
  await expect(page.getByText(/Saturday: Any Genre/)).toBeVisible();
  const question = page.getByRole('button', { name: 'Does saving a program buy a ticket?', exact: true });
  await question.focus(); await question.press('Enter');
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/It does not reserve admission, charge you, or issue a pass/)).toBeVisible();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('link', { name: 'Plan dinner alongside your show →', exact: true }).click();
  await expect(page).toHaveURL('/reservations');
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  expect(errors).toEqual([]);
});

test('Unreadable ticket favorites show recovery rather than a false empty list', async ({ page }) => {
  await page.goto('/tickets');
  await page.evaluate(key => localStorage.setItem(key, 'unreadable'), key);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect(page.getByText('Saved programs unavailable', { exact: true })).toBeVisible();
  await expect(page.getByText('No saved ticketed programs', { exact: true })).toHaveCount(0);
  await expect(page.getByText('No tickets yet', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Food & after-parties', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Plan the whole evening', exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe('unreadable');
});

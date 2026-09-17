import { test, expect } from '@playwright/test';

const storageKey = '@ptown/preview/v1';
const existingPlans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday', savedAt: '2026-09-16T12:00:00Z' }, membershipInterest: 'community' };

test('VIP categories survive refreshes, questions expand by keyboard, and layouts fit', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  await page.goto('/vip');
  await expect(page.getByText('A welcoming lounge experience', { exact: true })).toBeVisible();
  const access = page.getByRole('tab', { name: 'Special access', exact: true });
  await access.focus(); await access.press('Enter');
  await expect(page).toHaveURL('/vip?benefit=access');
  await expect(page.getByText('Artist experiences', { exact: true })).toBeVisible();
  await page.reload();
  await expect(access).toHaveAttribute('aria-selected', 'true');
  const question = page.getByRole('button', { name: 'Does VIP include event admission?', exact: true });
  await expect(question).toHaveAttribute('aria-expanded', 'false');
  await question.focus(); await question.press('Enter');
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('Event admission and seating arrangements will be confirmed', { exact: false })).toBeVisible();
  await question.click(); await expect(question).toHaveAttribute('aria-expanded', 'false');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/vip?benefit=unknown');
  await expect(page.getByRole('tab', { name: 'Hospitality', exact: true })).toHaveAttribute('aria-selected', 'true');
  expect(errors).toEqual([]);
});

test('VIP saving, membership changes, and removal share one preference and preserve all other plans', async ({ page }) => {
  await page.goto('/vip');
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: storageKey, data: existingPlans });
  await page.reload();
  await expect(page.getByText('Your current saved interest is PTown community.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Save VIP interest', exact: true }).click();
  await expect(page.getByText('VIP interest saved on this device. You have not enrolled.', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual({ ...existingPlans, membershipInterest: 'vip' });
  await page.reload(); await expect(page.getByRole('button', { name: 'VIP interest saved', exact: true })).toBeDisabled();
  await page.getByRole('link', { name: 'Review your VIP interest →', exact: true }).click();
  await expect(page.getByText('Interested in VIP Society', { exact: true })).toBeVisible();
  await page.goto('/memberships');
  await expect(page.getByRole('radio', { name: 'VIP Society', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('radio', { name: 'PTown community', exact: true }).click();
  await page.getByRole('button', { name: 'Save my interest', exact: true }).click();
  await expect(page.getByText('Interest saved on this device. You have not enrolled in a membership.', { exact: true })).toBeVisible();
  await page.goto('/vip'); await page.getByRole('button', { name: 'Save VIP interest', exact: true }).click();
  await page.getByRole('button', { name: 'Remove VIP interest', exact: true }).click();
  await expect(page.getByText('VIP interest removed. Your other saved plans have been kept.', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual({ ...existingPlans, membershipInterest: null });
});

test('Failed VIP writes keep the existing preference and unreadable storage disables saves', async ({ page }) => {
  await page.goto('/vip');
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: storageKey, data: existingPlans });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Save VIP interest', exact: true })).toBeEnabled();
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) { if (name === key) throw new DOMException('Full', 'QuotaExceededError'); original.call(this, name, value); };
  }, storageKey);
  await page.getByRole('button', { name: 'Save VIP interest', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('previously saved plans have been kept');
  await expect(page.getByText('VIP interest saved on this device. You have not enrolled.', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(existingPlans);
  await page.reload();
  await page.evaluate(key => localStorage.setItem(key, 'unreadable'), storageKey);
  await page.reload(); await expect(page.getByRole('button', { name: 'Save VIP interest', exact: true })).toBeDisabled();
});

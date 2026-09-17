import { test, expect } from '@playwright/test';

const storageKey = '@ptown/preview/v1';
const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday', savedAt: '2026-09-16T12:00:00Z' }, membershipInterest: 'community' };

test('Shared membership selections stay unsaved until chosen, survive refreshes, and remove only the preference', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  await page.goto('/memberships');
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: storageKey, data: plans });
  await page.goto('/memberships?interest=vip');
  await expect(page.getByRole('radio', { name: 'VIP Society', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByText('Saved interest: PTown community.', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(plans);
  await page.reload();
  await expect(page.getByRole('radio', { name: 'VIP Society', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('button', { name: 'Save my interest', exact: true }).click();
  await expect(page.getByText('Interest saved on this device. You have not enrolled in a membership.', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual({ ...plans, membershipInterest: 'vip' });
  await page.getByRole('link', { name: 'Explore VIP Society →', exact: true }).click();
  await expect(page.getByRole('button', { name: 'VIP interest saved', exact: true })).toBeDisabled();
  await page.goto('/memberships');
  await page.getByRole('button', { name: 'Remove saved membership interest', exact: true }).click();
  await expect(page.getByText('Membership interest removed. Your other saved plans have been kept.', { exact: true })).toBeVisible();
  await expect(page.getByRole('radio', { name: 'VIP Society', exact: true })).toHaveAttribute('aria-checked', 'false');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual({ ...plans, membershipInterest: null });
  await page.reload(); await expect(page.getByText('No membership interest is saved yet.', { exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Membership comparison and questions fit every device and unknown selections recover', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  await page.goto('/memberships');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await expect(page.getByRole('heading', { name: 'Compare planned memberships', exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const question = page.getByRole('button', { name: 'Does saving my interest enroll me?', exact: true });
  await question.focus(); await question.press('Enter');
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText('No. Saving keeps a preference on this device.', { exact: false })).toBeVisible();
  await page.goto('/memberships?interest=unknown');
  await expect(page.getByRole('radio', { name: 'VIP Society', exact: true })).toHaveAttribute('aria-checked', 'false');
  await expect(page.getByRole('radio', { name: 'PTown community', exact: true })).toHaveAttribute('aria-checked', 'false');
  await page.getByRole('button', { name: 'Save my interest', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Choose an interest');
  await page.getByRole('radio', { name: 'PTown community', exact: true }).click();
  await expect(page).toHaveURL('/memberships?interest=community');
  await page.reload();
  await expect(page.getByRole('radio', { name: 'PTown community', exact: true })).toHaveAttribute('aria-checked', 'true');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect(errors).toEqual([]);
});

test('Failed membership removal preserves plans and unreadable data disables preference controls', async ({ page }) => {
  await page.goto('/memberships');
  await page.evaluate(({ key, data }) => localStorage.setItem(key, JSON.stringify(data)), { key: storageKey, data: plans });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove saved membership interest', exact: true })).toBeEnabled();
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) { if (name === key) throw new DOMException('Full', 'QuotaExceededError'); original.call(this, name, value); };
  }, storageKey);
  await page.getByRole('button', { name: 'Remove saved membership interest', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('previously saved plans have been kept');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(plans);
  await expect(page.getByText('Membership interest removed. Your other saved plans have been kept.', { exact: true })).toHaveCount(0);
  await page.reload(); await page.evaluate(key => localStorage.setItem(key, 'unreadable'), storageKey);
  await page.reload(); await expect(page.getByRole('button', { name: 'Save my interest', exact: true })).toBeDisabled();
});

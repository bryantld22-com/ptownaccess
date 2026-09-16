import { test, expect } from '@playwright/test';

test.use({ timezoneId: 'America/Los_Angeles' });
const key = '@ptown/preview/v1';
const sourcePlans = { version: 1, savedEventIds: ['comedy', 'communion-sunday'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday dinner', savedAt: '2026-09-16T00:00:00.000Z' }, membershipInterest: 'vip' };
const oldPlans = { version: 1, savedEventIds: ['monday-jazz'], savedPathwayIds: [], reservationDraft: null, membershipInterest: 'community' };
const transfer = (plans: unknown) => JSON.stringify({ app: 'PTown Access', format: 1, plans });

test('Copied plans transfer between independent devices only after review and replacement', async ({ page, context, browser }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/profile');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans: sourcePlans });
  await page.reload();
  await page.getByRole('link', { name: 'Back up or restore plans' }).click();
  const code = await page.getByRole('textbox', { name: 'Your transfer code', exact: true }).inputValue();
  expect(JSON.parse(code)).toEqual({ app: 'PTown Access', format: 1, plans: sourcePlans });
  await page.getByRole('button', { name: 'Copy transfer code', exact: true }).click();
  await expect(page.getByText(/Transfer code copied. Paste it into PTown Access/)).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(code);
  const destination = await browser.newContext({ baseURL: new URL(page.url()).origin, timezoneId: 'America/Los_Angeles', viewport: { width: 390, height: 844 } });
  try {
    const other = await destination.newPage(); other.on('pageerror', error => errors.push(error.message));
    await other.goto('/backup');
    await expect(other.getByText('No plans to back up yet', { exact: true })).toBeVisible();
    await other.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans: oldPlans });
    await other.reload();
    const input = other.getByRole('textbox', { name: 'Paste a transfer code', exact: true });
    await input.fill(code);
    await expect(other.getByRole('button', { name: 'Replace this device’s plans', exact: true })).toHaveCount(0);
    await other.getByRole('button', { name: 'Review transfer code', exact: true }).click();
    await expect(other.getByRole('textbox', { name: 'Plans to restore', exact: true })).toHaveValue(/Birthday dinner/);
    expect(await other.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(oldPlans);
    for (const width of [320, 390, 768, 1280]) {
      await other.setViewportSize({ width, height: 900 });
      expect(await other.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await other.getByRole('button', { name: 'Cancel restore', exact: true }).click();
    expect(await other.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(oldPlans);
    await other.getByRole('button', { name: 'Review transfer code', exact: true }).click();
    await input.fill('edited incomplete code');
    await expect(other.getByRole('button', { name: 'Replace this device’s plans', exact: true })).toHaveCount(0);
    await input.fill(code);
    await other.getByRole('button', { name: 'Review transfer code', exact: true }).click();
    await other.getByRole('button', { name: 'Replace this device’s plans', exact: true }).click();
    await expect(other.getByText('Plans restored on this device. No bookings, purchases, or enrollment were created.', { exact: true })).toBeVisible();
    expect(await other.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(sourcePlans);
    await other.reload();
    await expect(other.getByRole('textbox', { name: 'Your transfer code', exact: true })).toHaveValue(code);
    await other.getByRole('link', { name: 'Open saved plans' }).click();
    await expect(other.getByRole('link').and(other.locator('a[href="/programs/heritage-tour"]'))).toBeVisible();
    await expect(other.getByText('Preferred date: 2030-08-11', { exact: true })).toBeVisible();
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(sourcePlans);
  } finally { await destination.close(); }
  expect(errors).toEqual([]);
});

test('Invalid transfers leave plans untouched and copy denial offers selectable code', async ({ page }) => {
  await page.goto('/backup');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans: oldPlans });
  await page.reload();
  const invalid = [
    'PTOWN ACCESS — PREVIEW PLAN',
    JSON.stringify({ app: 'Other app', format: 1, plans: sourcePlans }),
    JSON.stringify({ app: 'PTown Access', format: 2, plans: sourcePlans }),
    transfer({ ...sourcePlans, reservationDraft: { ...sourcePlans.reservationDraft, date: '2030-02-30' } }),
    transfer({ ...sourcePlans, reservationDraft: { ...sourcePlans.reservationDraft, partySize: 0 } }),
    transfer({ ...sourcePlans, savedEventIds: [123] }),
    transfer({ ...sourcePlans, savedEventIds: ['unknown-program'] }),
    transfer({ ...sourcePlans, savedPathwayIds: ['unknown-pathway'] }),
  ];
  for (const code of invalid) {
    await page.getByRole('textbox', { name: 'Paste a transfer code', exact: true }).fill(code);
    await page.getByRole('button', { name: 'Review transfer code', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('transfer code could not be read');
    await expect(page.getByRole('button', { name: 'Replace this device’s plans', exact: true })).toHaveCount(0);
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(oldPlans);
  }
  await page.evaluate(() => { Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Denied'); } } }); });
  await page.getByRole('button', { name: 'Copy transfer code', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Copy is unavailable' })).toBeVisible();
  expect(JSON.parse(await page.getByRole('textbox', { name: 'Your transfer code', exact: true }).inputValue()).plans).toEqual(oldPlans);
  await expect(page.getByText(/Transfer code copied/)).toHaveCount(0);
});

test('Failed restores retain existing data and reviewed legacy transfers recover unreadable storage', async ({ page }) => {
  await page.goto('/backup');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans: oldPlans });
  await page.reload();
  await page.getByRole('textbox', { name: 'Paste a transfer code', exact: true }).fill(transfer(sourcePlans));
  await page.getByRole('button', { name: 'Review transfer code', exact: true }).click();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Full storage'); }; });
  await page.getByRole('button', { name: 'Replace this device’s plans', exact: true }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Restoring failed' })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(oldPlans);
  await expect(page.getByText(/Plans restored on this device/)).toHaveCount(0);
  await page.reload();
  await page.evaluate(key => localStorage.setItem(key, 'unreadable'), key);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect(page.getByRole('button', { name: 'Copy transfer code', exact: true })).toHaveCount(0);
  const legacy = { version: 1, savedEventIds: ['comedy', 'comedy'], reservationDraft: { ...sourcePlans.reservationDraft, date: '2000-01-01' }, membershipInterest: 'vip' };
  await page.getByRole('textbox', { name: 'Paste a transfer code', exact: true }).fill(transfer(legacy));
  await page.getByRole('button', { name: 'Review transfer code', exact: true }).click();
  await expect(page.getByText('This imported date has passed. You can edit it after restoring.', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe('unreadable');
  await page.getByRole('button', { name: 'Replace this device’s plans', exact: true }).click();
  await expect(page.getByText(/Plans restored on this device/)).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual({ ...legacy, savedEventIds: ['comedy'], savedPathwayIds: [] });
  await page.getByRole('link', { name: 'Open saved plans' }).click();
  await expect(page.getByText('This preferred date has passed. Update your dinner draft.', { exact: true })).toBeVisible();
});

import { test, expect, type Page } from '@playwright/test';

test.use({ timezoneId: 'America/Los_Angeles' });
const storageKey = '@ptown/preview/v1';
async function loadExistingPlan(page: Page) {
  await page.addInitScript(key => {
    // The existing v1 storage format stays readable across app builds.
    if (!localStorage.getItem(key)) localStorage.setItem(key, JSON.stringify({
      version: 1, savedEventIds: ['comedy', 'communion-sunday'],
      reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday dinner', savedAt: '2026-09-16T12:00:00Z' },
      membershipInterest: 'vip',
    }));
  }, storageKey);
  await page.goto('/plans');
  await expect(page.getByRole('button', { name: 'Copy preview plan' })).toBeEnabled();
}

test('Review preserves earlier plans, copies the exact preview, and separates favorites from tickets', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await loadExistingPlan(page);
  const summary = page.getByRole('textbox', { name: 'Preview plan summary', exact: true });
  const text = await summary.inputValue();
  expect(text).toContain('No tickets, reservation, or membership are confirmed.');
  expect(text).toContain('Thursday · Comedy Night · Ticketed (no ticket purchased)');
  expect(text).toContain('Preferred date: 2030-08-11 (Sunday)');
  expect(text).toContain('Guests: 4'); expect(text).toContain('Occasion: Birthday dinner');
  expect(text).toContain('VIP Society (interest only; not enrolled)');
  await page.getByRole('button', { name: 'Copy preview plan' }).click();
  await expect(page.getByText('Preview plan copied. No bookings or purchases were made.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text);
  await page.reload(); await expect(summary).toHaveValue(text);
  await page.goto('/tickets');
  await expect(page.getByText('No tickets yet', { exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Saved ticketed programs', exact: true })).toBeVisible();
  const links = page.getByRole('link').and(page.locator('a[href^="/events/"]'));
  await expect(links).toHaveCount(1); await expect(links).toHaveAttribute('href', '/events/comedy');
  await page.getByRole('link', { name: 'Review your plan' }).click();
  await page.getByRole('link').and(page.locator('a[href="/events/communion-sunday"]')).click();
  await page.getByRole('button', { name: 'Remove saved event' }).click();
  await expect(page.getByRole('button', { name: 'Save this event', exact: true })).toBeEnabled();
  await page.goto('/plans');
  await expect(page.getByText('Your draft date falls on Sunday. You have not saved a proposed program for that weekday.', { exact: true })).toBeVisible();
  await expect(summary).not.toHaveValue(text);
  await page.getByRole('link', { name: 'Explore Sunday programs' }).click();
  await expect(page).toHaveURL('/events?day=Sunday');
});

test('Copy failure offers selectable text and empty or unreadable plans cannot be exported', async ({ page }) => {
  await page.goto('/plans');
  await expect(page.getByText('Start with a good idea', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy preview plan' })).toHaveCount(0);
  await page.goto('/');
  await page.getByRole('link', { name: 'Review your plan' }).click();
  await expect(page).toHaveURL('/plans');
  await loadExistingPlan(page);
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new DOMException('Denied', 'NotAllowedError'); } } });
  });
  await page.getByRole('button', { name: 'Copy preview plan' }).click();
  await expect(page.getByRole('alert')).toHaveText('Copy is unavailable. Select the summary below and copy it manually.');
  await expect(page.getByText('Preview plan copied. No bookings or purchases were made.', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Preview plan summary', exact: true })).toHaveValue(/PTOWN ACCESS — PREVIEW PLAN/);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.evaluate(key => localStorage.setItem(key, 'unreadable'), storageKey);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect(page.getByRole('button', { name: 'Copy preview plan' })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Preview plan summary', exact: true })).toHaveCount(0);
});

test('Supported sharing sends the preview text and handles cancellation and failures', async ({ page }) => {
  await page.addInitScript(() => {
    const state = window as unknown as { shareBehavior: string; sharedPlan?: { title: string; text: string } };
    state.shareBehavior = 'success';
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (data: { title: string; text: string }) => {
      if (state.shareBehavior === 'cancel') throw new DOMException('Canceled', 'AbortError');
      if (state.shareBehavior === 'fail') throw new Error('Unavailable');
      state.sharedPlan = data;
    } });
  });
  await loadExistingPlan(page);
  const text = await page.getByRole('textbox', { name: 'Preview plan summary', exact: true }).inputValue();
  const original = await page.evaluate(key => localStorage.getItem(key), storageKey);
  await page.getByRole('button', { name: 'Share preview plan' }).click();
  await expect(page.getByText('Preview plan shared. No bookings or purchases were made.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as { sharedPlan: unknown }).sharedPlan)).toEqual({ title: 'My PTown preview plan', text });
  await page.evaluate(() => { (window as unknown as { shareBehavior: string }).shareBehavior = 'cancel'; });
  await page.getByRole('button', { name: 'Share preview plan' }).click();
  await expect(page.getByText('Sharing canceled. Your saved plans are unchanged.', { exact: true })).toBeVisible();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await page.evaluate(() => { (window as unknown as { shareBehavior: string }).shareBehavior = 'fail'; });
  await page.getByRole('button', { name: 'Share preview plan' }).click();
  await expect(page.getByRole('alert')).toHaveText('Sharing is unavailable. Copy your preview plan or select the summary below instead.');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe(original);
});

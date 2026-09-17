import { test, expect } from '@playwright/test';

const key = '@ptown/preview/v1';
const plans = { version: 1, savedEventIds: ['comedy', 'tuesday-jazz'], savedPathwayIds: ['heritage-tour'], reservationDraft: null, membershipInterest: 'vip' };

test('Combined event links survive refresh, edits, detail history, and filter resets', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const cards = page.getByRole('link').and(page.locator('a[href^="/events/"]'));
  const search = page.getByRole('textbox', { name: 'Search programs', exact: true });
  await page.goto('/events?q=any%20genre&filter=Ticketed&day=Saturday&view=Week');
  await expect(search).toHaveValue('any genre');
  await expect(page.getByRole('tab', { name: 'Ticketed', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('tab', { name: 'Week', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(cards).toHaveCount(1);
  await expect(cards).toHaveAttribute('aria-label', 'Saturday: Any Genre');
  await page.reload(); await expect(cards).toHaveAttribute('aria-label', 'Saturday: Any Genre');
  await cards.click(); await expect(page).toHaveURL('/events/blues-country');
  await page.goBack(); await expect(search).toHaveValue('any genre');
  await expect(cards).toHaveAttribute('aria-label', 'Saturday: Any Genre');
  await search.fill('  COMEDY Thursday  ');
  await page.getByRole('button', { name: 'Thursday', exact: true }).click();
  await expect(cards).toHaveAttribute('href', '/events/comedy');
  await expect.poll(() => new URL(page.url()).searchParams.get('q')).toBe('  COMEDY Thursday  ');
  await page.reload(); await expect(search).toHaveValue('  COMEDY Thursday  ');
  await expect(cards).toHaveCount(1);
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(page).toHaveURL('/events?view=Week');
  await expect(cards).toHaveCount(7);
  await page.getByRole('tab', { name: 'List', exact: true }).click();
  await expect(page).toHaveURL('/events');
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  expect(errors).toEqual([]);
});

test('Shared saved-event filters stay device-local and preserve other plans', async ({ page, browser }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  const route = '/events?q=jam&filter=Saved&view=Week';
  await page.goto(route);
  await expect(page.getByRole('link', { name: 'Tuesday: Musician Jam Session', exact: true })).toBeVisible();
  await page.reload(); await expect(page.getByRole('link', { name: 'Tuesday: Musician Jam Session', exact: true })).toBeVisible();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  const context = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try {
    const other = await context.newPage();
    await other.goto(route);
    await expect(other.getByRole('tab', { name: 'Saved', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(other.getByText('No programs match', { exact: true })).toBeVisible();
    await expect(other.getByText(/It does not transfer your saved plans/)).toBeVisible();
    expect(await other.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  } finally { await context.close(); }
  expect(errors).toEqual([]);
});

test('Invalid event parameters and unreadable saved filters recover without false empty results', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const cards = page.getByRole('link').and(page.locator('a[href^="/events/"]'));
  const search = page.getByRole('textbox', { name: 'Search programs', exact: true });
  await page.goto('/events?q=jam&filter=Unknown&day=Invalid&view=Unknown');
  await expect(cards).toHaveCount(1); await expect(cards).toHaveAttribute('href', '/events/tuesday-jazz');
  await expect(page.getByRole('tab', { name: 'List', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/events?q=jam&q=comedy&filter=Free&filter=Ticketed&view=Week&view=List');
  await expect(search).toHaveValue(''); await expect(cards).toHaveCount(7);
  await expect(page.getByRole('tab', { name: 'All', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.goto(`/events?q=${'x'.repeat(200)}`); await expect(search).toHaveValue('x'.repeat(120));
  await page.evaluate(key => localStorage.setItem(key, 'unreadable'), key);
  await page.goto('/events?filter=Saved&view=Week');
  await expect(page.getByText('Saved programs unavailable', { exact: true })).toBeVisible();
  await expect(page.getByText('No saved programs yet', { exact: true })).toHaveCount(0);
  await expect(page.getByText('0 programs · Saved on this device', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe('unreadable');
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click();
  await expect(cards).toHaveCount(7);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

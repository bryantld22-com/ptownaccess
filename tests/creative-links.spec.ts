import { test, expect } from '@playwright/test';

test('Creative query links combine words and divisions, reload cleanly, and survive detail history', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  const cards = page.getByRole('link').and(page.locator('a[href^="/programs/"]'));
  const input = page.getByRole('textbox', { name: 'Search creative pathways', exact: true });
  for (const [filter, count] of [['All pathways', 7], ['Save the Arts', 2], ['Artist Development', 3], ['Media', 2]] as const) {
    await page.goto(`/creative?filter=${encodeURIComponent(filter)}`);
    await expect(page.getByRole('tab', { name: filter, exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(cards).toHaveCount(count);
    await page.reload();
    await expect(cards).toHaveCount(count);
  }
  await page.goto('/creative?q=heritage&filter=Save%20the%20Arts');
  await expect(input).toHaveValue('heritage');
  await expect(cards).toHaveCount(1);
  await cards.click();
  await expect(page).toHaveURL('/programs/heritage-tour');
  await page.goBack();
  await expect(input).toHaveValue('heritage');
  await expect(page.getByRole('tab', { name: 'Save the Arts', exact: true })).toHaveAttribute('aria-selected', 'true');
  await input.fill('  BAKING artist  ');
  await page.getByRole('tab', { name: 'Artist Development', exact: true }).click();
  await expect(cards).toHaveCount(1);
  await expect(cards).toHaveAttribute('href', '/programs/culinary-development');
  await page.reload();
  await expect(input).toHaveValue('  BAKING artist  ');
  await expect(cards).toHaveCount(1);
  await page.getByRole('tab', { name: 'Media', exact: true }).click();
  await expect(page.getByText('No pathways match', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset pathway filters', exact: true }).click();
  await expect(page).toHaveURL('/creative');
  await expect(input).toHaveValue('');
  await expect(cards).toHaveCount(7);
  expect(errors).toEqual([]);
});

test('Saved creative links use only the current device and preserve stored plans', async ({ page, browser }) => {
  const stored = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: null, membershipInterest: 'vip' };
  await page.goto('/');
  await page.evaluate(data => localStorage.setItem('@ptown/preview/v1', JSON.stringify(data)), stored);
  const route = '/creative?q=heritage&filter=Saved%20interests';
  await page.goto(route);
  await expect(page.getByRole('tab', { name: 'Saved interests', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('link', { name: 'The Heritage Tour · Save the Arts', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: 'The Heritage Tour · Save the Arts', exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('@ptown/preview/v1')!))).toEqual(stored);
  const context = await browser.newContext({ baseURL: 'http://127.0.0.1:8081' });
  try {
    const otherDevice = await context.newPage();
    await otherDevice.goto(route);
    await expect(otherDevice.getByRole('tab', { name: 'Saved interests', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(otherDevice.getByText('No pathways match', { exact: true })).toBeVisible();
    await expect(otherDevice.getByText(/does not transfer your saved plans/)).toBeVisible();
    expect(await otherDevice.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBeNull();
  } finally { await context.close(); }
});

test('Creative links normalize invalid parameters and unreadable saved data stays recoverable', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  const cards = page.getByRole('link').and(page.locator('a[href^="/programs/"]'));
  const input = page.getByRole('textbox', { name: 'Search creative pathways', exact: true });
  await page.goto('/creative?q=heritage&filter=Unknown');
  await expect(page.getByRole('tab', { name: 'All pathways', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(cards).toHaveCount(1);
  await page.goto('/creative?q=heritage&q=baking&filter=Media&filter=Save%20the%20Arts');
  await expect(input).toHaveValue('');
  await expect(cards).toHaveCount(7);
  await page.goto(`/creative?q=${'x'.repeat(200)}`);
  await expect(input).toHaveValue('x'.repeat(120));
  await page.evaluate(() => localStorage.setItem('@ptown/preview/v1', 'unreadable'));
  await page.goto('/creative?filter=Saved%20interests');
  await expect(page.getByText('Saved interests cannot be read. Open Profile to recover your device’s plans.', { exact: true })).toBeVisible();
  await expect(page.getByText('No creative interests saved yet', { exact: true })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBe('unreadable');
  await page.getByRole('button', { name: 'Reset pathway filters', exact: true }).click();
  await expect(page).toHaveURL('/creative');
  await expect(cards).toHaveCount(7);
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

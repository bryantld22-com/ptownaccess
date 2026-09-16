import { test, expect } from '@playwright/test';

test('Direct weekday links hydrate cleanly and retain their selection after reload', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  for (const day of ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']) {
    await page.goto(`/events?day=${day}`);
    await expect(page.locator('a[href^="/events/"]:visible')).toHaveCount(1);
    await expect(page.getByRole('button', { name: day, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await page.reload();
    await expect(page.locator('a[href^="/events/"]:visible')).toHaveCount(1);
    await expect(page.getByRole('button', { name: day, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  await page.goto('/events?day=Unknown');
  await expect(page.locator('a[href^="/events/"]:visible')).toHaveCount(7);
  expect(errors).toEqual([]);
});

test('Section and detail headers identify the destination', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  for (const [route, title] of [['vip', 'VIP'], ['media', 'Media'], ['reservations', 'Reservations'], ['memberships', 'Memberships'], ['save-the-arts', 'Save the Arts'], ['artist-development', 'Artist Development']]) {
    await page.goto(`/${route}`);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
  }
  await page.goto('/events/comedy');
  await expect(page.getByRole('heading', { name: 'Comedy Night · Thursday', exact: true })).toBeVisible();
  await page.goto('/programs/heritage-tour');
  await expect(page.getByRole('heading', { name: 'Save the Arts pathway', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Missing links offer working recovery routes without changing saved plans', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  await page.goto('/events/comedy');
  await page.getByRole('button', { name: 'Save this event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved event', exact: true })).toBeVisible();
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  for (const [route, title, browse] of [
    ['/missing-section', 'Page not found.', undefined],
    ['/events/missing-program', 'Program not found.', 'Browse events'],
    ['/programs/missing-pathway', 'Pathway not found.', 'Explore creative pathways'],
    ['/unknown/nested/page', 'Page not found.', undefined],
  ] as const) {
    await page.goto(route);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    if (browse) {
      await page.getByRole('link', { name: browse }).click();
      await expect(page).toHaveURL(browse === 'Browse events' ? '/events' : '/creative');
      await page.goBack();
    }
    await page.getByRole('link', { name: 'Search all PTown' }).click();
    await expect(page).toHaveURL('/search');
    await page.goBack();
    await page.getByRole('link', { name: 'View your saved plans' }).click();
    await expect(page).toHaveURL('/profile');
    await expect(page.locator('a[href="/events/comedy"]:visible')).toHaveCount(1);
    await page.goBack();
    await page.getByRole('link', { name: 'Return home' }).click();
    await expect(page).toHaveURL('/');
  }
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  expect(errors).toEqual([]);
});

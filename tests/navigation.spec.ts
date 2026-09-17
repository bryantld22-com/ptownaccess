import { test, expect, type Page } from '@playwright/test';

async function returnHome(page: Page) {
  await page.getByRole('navigation', { name: 'PTown shortcuts' }).getByRole('link', { name: 'Home', exact: true }).click();
  await expect(page).toHaveURL('/');
}

test('Home links retain their styles and open all eight sections', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const logo = page.getByRole('img', { name: 'PTown Dinner Club logo, Paducah Kentucky', exact: true });
  await expect(logo).toBeVisible();
  await expect(logo).toHaveJSProperty('naturalWidth', 1536);
  await expect(page.getByText('Your PTown experience', { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/events"]').first()).toHaveCSS('background-color', 'rgb(217, 183, 111)');
  await expect(page.locator('a[href="/vip"]').first()).toHaveCSS('background-color', 'rgb(25, 23, 19)');

  for (const route of ['events', 'tickets', 'vip', 'media', 'reservations', 'memberships', 'save-the-arts', 'artist-development']) {
    await page.locator(`a[href="/${route}"]:visible`).first().click();
    await expect(page).toHaveURL(`/${route}`);
    await returnHome(page);
  }
  expect(errors).toEqual([]);
});

test('Events filters work and event details survive a reload', async ({ page }) => {
  await page.goto('/events');
  const cards = page.locator('a[href^="/events/"]:visible');
  await expect(cards).toHaveCount(7);
  await page.getByRole('tab', { name: 'Free', exact: true }).click();
  await expect(cards).toHaveCount(4);
  await page.getByRole('tab', { name: 'Ticketed', exact: true }).click();
  await expect(cards).toHaveCount(3);
  await page.locator('a[href="/events/comedy"]:visible').click();
  await expect(page.getByText('Opening the evening', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Opening the evening', { exact: true })).toBeVisible();
});

test('Pages fit phone, tablet, and desktop widths', async ({ page }) => {
  for (const width of [320, 360, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const logoBounds = await page.getByRole('img', { name: 'PTown Dinner Club logo, Paducah Kentucky', exact: true }).boundingBox();
    expect(logoBounds).not.toBeNull();
    expect(logoBounds!.width / logoBounds!.height).toBeCloseTo(2, 1);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  for (const route of ['events', 'tickets', 'ptown', 'profile', 'plans', 'creative', 'vip', 'media', 'reservations', 'memberships', 'save-the-arts', 'artist-development']) {
    await page.goto(`/${route}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/save-the-arts');
  await expect(page.getByText('The Heritage Tour', { exact: true })).toBeVisible();
});

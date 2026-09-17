import { test, expect } from '@playwright/test';

test('Shared shortcuts work by keyboard, identify the current page, and remain available while scrolling', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  const navigation = () => page.getByRole('navigation', { name: 'PTown shortcuts' });
  await page.goto('/');
  await expect(navigation().getByRole('link', { name: 'Home', exact: true })).toHaveAttribute('aria-current', 'page');
  await page.keyboard.press('Tab');
  await expect(navigation().getByRole('link', { name: 'Home', exact: true })).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(navigation().getByRole('link', { name: 'Search', exact: true })).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL('/search');
  await expect(navigation().getByRole('link', { name: 'Search', exact: true })).toHaveAttribute('aria-current', 'page');
  await navigation().getByRole('link', { name: 'Visit guide', exact: true }).click();
  await expect(page).toHaveURL('/visit');
  await expect(navigation().getByRole('link', { name: 'Visit guide', exact: true })).toHaveAttribute('aria-current', 'page');
  await navigation().getByRole('link', { name: 'Saved plans', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  await expect(navigation().getByRole('link', { name: 'Saved plans', exact: true })).toHaveAttribute('aria-current', 'page');

  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/events/comedy');
    await page.getByRole('link', { name: 'Back to events' }).scrollIntoViewIfNeeded();
    await expect(navigation()).toBeInViewport();
    for (const link of await navigation().getByRole('link').all()) {
      const box = await link.boundingBox();
      expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    await navigation().getByRole('link', { name: 'Home', exact: true }).click();
    await expect(page).toHaveURL('/');
  }
  expect(errors).toEqual([]);
});

test('PTown brings all six planning tools together and navigating preserves saved plans', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  await page.goto('/events/comedy');
  await page.getByRole('button', { name: 'Save this event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved event', exact: true })).toBeVisible();
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  for (const [title, route] of [
    ['Search PTown', '/search'], ['Plan your visit', '/visit'], ['Compare programs', '/compare'],
    ['Creative pathways', '/creative'], ['Review your plan', '/plans'], ['Back up your plans', '/backup'],
  ]) {
    await page.goto('/ptown');
    await expect(page.getByRole('heading', { name: 'Plan and explore', exact: true })).toBeVisible();
    await page.getByRole('link', { name: new RegExp(title, 'i') }).and(page.locator(`a[href="${route}"]`)).click();
    await expect(page).toHaveURL(route);
    await page.reload();
    await expect(page.getByRole('navigation', { name: 'PTown shortcuts' })).toBeVisible();
  }
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  for (const width of [320, 768, 1280]) {
    await page.setViewportSize({ width, height: 844 });
    await page.goto('/ptown');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

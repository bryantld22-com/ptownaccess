import { test, expect } from '@playwright/test';

test('Development tracks retain shared filters and connect projects to saved creative interests', async ({ page }) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  await page.goto('/artist-development');
  const links = page.getByRole('link', { name: / · Artist Development$/ });
  await expect(links).toHaveCount(3);
  for (const [track, id, pathway] of [
    ['Performance', 'performance', 'performance-rehearsal'],
    ['Production', 'production', 'live-production'],
    ['Culinary', 'culinary', 'culinary-development'],
  ]) {
    const tab = page.getByRole('tab', { name: track, exact: true });
    await tab.focus(); await tab.press('Enter');
    await expect(page).toHaveURL(`/artist-development?track=${id}`);
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAttribute('href', `/programs/${pathway}`);
    await page.reload();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(links).toHaveCount(1);
  }
  await links.click();
  await page.getByRole('button', { name: 'Save this creative interest', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved interest', exact: true })).toBeEnabled();
  await page.getByRole('navigation', { name: 'Your location in PTown' }).getByRole('link', { name: 'Artist Development', exact: true }).click();
  await expect(links).toHaveCount(3);
  await expect(page.getByRole('link', { name: 'Culinary Artist Development · Artist Development', exact: true })).toContainText('Interest saved on this device');
  await page.getByRole('link', { name: 'Review saved creative interests →', exact: true }).click();
  await expect(page.getByRole('link', { name: 'Culinary Artist Development · Artist Development', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Development projects fit every device, recover from unknown tracks, and connect to Media', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/artist-development?track=production');
    await expect(page.getByRole('heading', { name: 'Recording & Production', exact: true })).toBeVisible();
    await expect(page.getByText('A technical preparation plan', { exact: false })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/artist-development?track=unknown');
  await expect(page.getByRole('tab', { name: 'All tracks', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('link', { name: / · Artist Development$/ })).toHaveCount(3);
  await page.getByRole('tab', { name: 'Production', exact: true }).click();
  await page.getByRole('tab', { name: 'All tracks', exact: true }).click();
  await expect(page).toHaveURL('/artist-development');
  await page.getByRole('link', { name: 'See Media projects →', exact: true }).click();
  await expect(page).toHaveURL('/media');
  expect(errors).toEqual([]);
});

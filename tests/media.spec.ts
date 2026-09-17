import { test, expect, type Page } from '@playwright/test';

const featureLinks = (page: Page) => page.getByRole('link', { name: / · (Stories|Podcasts|Performances)$/ });

test('Media search combines categories and words, retains shared URL state, and resets empty results', async ({ page }) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  await page.goto('/media');
  await expect(featureLinks(page)).toHaveCount(6);
  const podcasts = page.getByRole('tab', { name: 'Podcasts', exact: true });
  await podcasts.focus(); await podcasts.press('Enter');
  await expect(podcasts).toHaveAttribute('aria-selected', 'true');
  await expect(featureLinks(page)).toHaveCount(2);
  const input = page.getByRole('textbox', { name: 'Search PTown media', exact: true });
  await input.fill('  REGIONAL voices  ');
  await expect(featureLinks(page)).toHaveCount(1);
  await page.reload();
  await expect(input).toHaveValue('  REGIONAL voices  ');
  await expect(podcasts).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('link', { name: 'Regional Voices · Podcasts', exact: true }).click();
  await expect(page).toHaveURL('/media/regional-voices');
  await expect(page.getByRole('heading', { name: 'Regional Voices', exact: true })).toBeVisible();
  await expect(page.getByText('A planned feature', { exact: true })).toBeVisible();
  await page.getByRole('navigation', { name: 'Your location in PTown' }).getByRole('link', { name: 'Podcasts', exact: true }).click();
  await expect(podcasts).toHaveAttribute('aria-selected', 'true');
  await expect(featureLinks(page)).toHaveCount(2);
  await input.fill('not-a-real-feature');
  await expect(page.getByText('No media concepts match', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset media filters', exact: true }).click();
  await expect(page).toHaveURL('/media');
  await expect(featureLinks(page)).toHaveCount(6);
  await page.goto('/media?category=unknown&q=documentary');
  await expect(page.getByRole('tab', { name: 'All media', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(featureLinks(page)).toHaveCount(1);
  expect(errors).toEqual([]);
});

test('Media details reload, connect to real programs, fit every device, and preserve saved plans', async ({ page }) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  await page.goto('/media');
  const saved = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['behind-the-build'], reservationDraft: null, membershipInterest: 'vip' };
  await page.evaluate(data => localStorage.setItem('@ptown/preview/v1', JSON.stringify(data)), saved);
  for (const [id, title, label, destination] of [
    ['building-ptown', 'Building PTown', 'Explore Behind the Build', '/programs/behind-the-build'],
    ['people-of-ptown', 'People of PTown', 'Discover Artist Development', '/artist-development'],
    ['artist-conversations', 'Artist Conversations', 'Explore Podcasts & Conversations', '/programs/podcasts-conversations'],
    ['regional-voices', 'Regional Voices', 'Meet Save the Arts', '/save-the-arts'],
    ['live-music-spotlight', 'Live Music Spotlight', 'Explore the weekly program', '/events'],
    ['sound-to-screen', 'Sound to Screen', 'Explore Live Production & Recording', '/programs/live-production'],
  ]) {
    await page.goto(`/media/${id}`); await page.reload();
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Your location in PTown' })).toContainText(`Current: ${title}`);
    await page.getByRole('link', { name: `${label} →`, exact: true }).click();
    await expect(page).toHaveURL(destination);
  }
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of ['/media', '/media/sound-to-screen']) {
      await page.goto(route);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  await page.goto('/media/missing-feature');
  await expect(page.getByRole('heading', { name: 'Media feature not found.', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Explore PTown media →', exact: true }).click();
  await expect(featureLinks(page)).toHaveCount(6);
  await page.goto('/search?q=regional%20voices&filter=Sections');
  await page.getByRole('link', { name: 'Open Media', exact: true }).click();
  await expect(page).toHaveURL('/media');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('@ptown/preview/v1')!))).toEqual(saved);
  expect(errors).toEqual([]);
});

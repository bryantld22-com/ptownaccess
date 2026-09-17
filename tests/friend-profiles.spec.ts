import { test, expect } from '@playwright/test';

const key = '@ptown/preview/v1';
const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: null, membershipInterest: 'vip' };

test('Sample profile filters persist with invitation choices and details survive browser history', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/friends');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.goto('/friends?interest=music&program=tuesday-jazz');
  await expect(page.getByRole('tab', { name: 'Music', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('FICTIONAL SAMPLE PROFILE', { exact: true })).toHaveCount(1);
  await expect(page.getByRole('radio', { name: 'Tuesday: Musician Jam Session', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Music', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('link', { name: 'Explore Music explorer sample profile →', exact: true }).click();
  await expect(page).toHaveURL('/friends/music');
  await expect(page.getByRole('heading', { name: 'Music explorer', exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText(/Invitation text does not contact this sample profile/)).toBeVisible();
  await page.goBack();
  await expect(page.getByRole('tab', { name: 'Music', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('radio', { name: 'Tuesday: Musician Jam Session', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('tab', { name: 'Creative', exact: true }).click();
  await expect.poll(() => new URL(page.url()).searchParams.get('interest')).toBe('creative');
  await expect(page.getByRole('link', { name: 'Explore Creative connector sample profile →', exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'All profiles', exact: true }).click();
  await expect(page).toHaveURL('/friends?program=tuesday-jazz');
  await expect(page.getByText('FICTIONAL SAMPLE PROFILE', { exact: true })).toHaveCount(3);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  expect(errors).toEqual([]);
});

test('Every sample profile exposes only relevant planned activities and invitation handoffs', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  for (const [id, name, titles, pathways] of [
    ['music', 'Music explorer', ['Musician Jam Session', 'Any Genre'], ['performance-rehearsal']],
    ['creative', 'Creative connector', ['PTown Flow Practice'], ['heritage-tour', 'behind-the-build']],
    ['dinner', 'Dinner companion', ['Comedy Night', 'Communion Sunday'], ['culinary-development']],
  ] as const) {
    await page.goto(`/friends/${id}`);
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Your location in PTown', exact: true }).getByText(`${name} · Sample profile`, { exact: false })).toBeVisible();
    const programs = page.getByRole('link').and(page.locator('a[href^="/events/"]'));
    await expect(programs).toHaveCount(titles.length);
    for (const title of titles) await expect(programs.filter({ hasText: title })).toBeVisible();
    const creative = page.getByRole('link').and(page.locator('a[href^="/programs/"]'));
    await expect(creative).toHaveCount(pathways.length);
    for (const pathway of pathways) await expect(creative.and(page.locator(`a[href="/programs/${pathway}"]`))).toBeVisible();
    await page.getByRole('link', { name: `Preview an invitation for ${titles[0]} →`, exact: true }).click();
    await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(new RegExp(titles[0]));
    expect(new URL(page.url()).pathname).toBe('/friends');
    expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  }
  expect(errors).toEqual([]);
});

test('Profile layouts, invalid interest filters, and missing profile recovery are safe', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/friends?interest=unknown');
  await expect(page.getByRole('tab', { name: 'All profiles', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('FICTIONAL SAMPLE PROFILE', { exact: true })).toHaveCount(3);
  await page.goto('/friends?interest=music&interest=dinner');
  await expect(page.getByText('FICTIONAL SAMPLE PROFILE', { exact: true })).toHaveCount(3);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    for (const id of ['music', 'creative', 'dinner']) {
      await page.goto(`/friends/${id}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
  }
  const response = await page.goto('/friends/missing');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { name: 'Sample profile not found.', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Browse Friend 2 Friend →', exact: true }).click();
  await expect(page).toHaveURL('/friends');
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  expect(errors).toEqual([]);
});

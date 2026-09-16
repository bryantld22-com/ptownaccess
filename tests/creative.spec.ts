import { test, expect } from '@playwright/test';

const storageKey = '@ptown/preview/v1';
const pathwayLinks = 'a[href^="/programs/"]';

test('Creative search and divisions work, section links open real details, and layouts fit', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Explore creative pathways' }).click();
  await expect(page).toHaveURL('/creative');
  const links = page.getByRole('link').and(page.locator(pathwayLinks));
  await expect(links).toHaveCount(7);
  await page.getByRole('tab', { name: 'Saved interests', exact: true }).click();
  await expect(page.getByText('No creative interests saved yet', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset pathway filters', exact: true }).click();
  const search = page.getByRole('textbox', { name: 'Search creative pathways', exact: true });
  await search.fill('  BAKING artist  ');
  await expect(links).toHaveCount(1); await expect(links).toHaveAttribute('href', '/programs/culinary-development');
  await page.getByRole('tab', { name: 'Media', exact: true }).click();
  await expect(page.getByText('No pathways match', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Reset pathway filters', exact: true }).click();
  await expect(links).toHaveCount(7);
  for (const [division, count] of [['Save the Arts', 2], ['Artist Development', 3], ['Media', 2]] as const) {
    await page.getByRole('tab', { name: division, exact: true }).click();
    await expect(links).toHaveCount(count);
  }
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.setViewportSize({ width: 320, height: 900 });
  for (const [section, count] of [['save-the-arts', 2], ['artist-development', 3], ['media', 2]] as const) {
    await page.goto(`/${section}`); await expect(links).toHaveCount(count);
    await page.getByRole('link', { name: 'Browse all creative pathways' }).click();
    await expect(page).toHaveURL('/creative');
  }
  for (const [id, title] of [['heritage-tour', 'The Heritage Tour'], ['saturday-arts', 'Saturday Arts Sessions'], ['performance-rehearsal', 'Performance & Rehearsal'], ['live-production', 'Live Production & Recording'], ['culinary-development', 'Culinary Artist Development'], ['behind-the-build', 'Behind the Build'], ['podcasts-conversations', 'Podcasts & Conversations']] as const) {
    await page.goto(`/programs/${id}`);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Save this creative interest', exact: true })).toBeEnabled();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('Creative interests survive reloads, preserve legacy plans, appear in summaries, and clear with confirmation', async ({ page }) => {
  await page.goto('/');
  const legacy = { version: 1, savedEventIds: ['comedy'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday', savedAt: '2026-09-16T12:00:00Z' }, membershipInterest: 'vip' };
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: storageKey, value: legacy });
  await page.goto('/programs/heritage-tour');
  await page.getByRole('button', { name: 'Save this creative interest', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved interest', exact: true })).toBeEnabled();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove saved interest', exact: true })).toBeEnabled();
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey);
  expect(stored.savedEventIds).toEqual(legacy.savedEventIds); expect(stored.reservationDraft).toEqual(legacy.reservationDraft);
  expect(stored.membershipInterest).toBe('vip'); expect(stored.savedPathwayIds).toEqual(['heritage-tour']);
  await page.getByRole('link', { name: 'View your saved interests' }).click();
  await expect(page.getByRole('link', { name: 'The Heritage Tour · Save the Arts', exact: true })).toBeVisible();
  await expect(page.getByText('3 of 3 planning steps saved', { exact: true }).filter({ visible: true })).toBeVisible();
  await page.getByRole('link', { name: 'Review and share your plan' }).click();
  const summary = page.getByRole('textbox', { name: 'Preview plan summary', exact: true });
  await expect(summary).toHaveValue(/The Heritage Tour · Save the Arts \(interest only; no application submitted\)/);
  await page.goto('/creative');
  await page.getByRole('tab', { name: 'Saved interests', exact: true }).click();
  await expect(page.getByRole('link').and(page.locator(pathwayLinks))).toHaveCount(1);
  await page.getByRole('link', { name: 'The Heritage Tour · Save the Arts', exact: true }).click();
  await page.getByRole('button', { name: 'Remove saved interest', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save this creative interest', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Save this creative interest', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved interest', exact: true })).toBeEnabled();
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Clear saved preview data' }).click();
  await page.getByRole('button', { name: 'Keep my plans' }).click();
  await expect(page.getByRole('link', { name: 'The Heritage Tour · Save the Arts', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear saved preview data' }).click();
  await page.getByRole('button', { name: 'Clear my saved plans' }).click();
  await expect(page.getByRole('link').and(page.locator(pathwayLinks))).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  await page.goto('/plans');
  await expect(page.getByText('Start with a good idea', { exact: true })).toBeVisible();
});

test('Failed creative saves preserve previous data and invalid interest storage requires an explicit reset', async ({ page }) => {
  await page.goto('/');
  const stored = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: null, membershipInterest: null };
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: storageKey, value: stored });
  await page.goto('/programs/live-production');
  await expect(page.getByRole('button', { name: 'Save this creative interest', exact: true })).toBeEnabled();
  await page.evaluate(key => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('Full', 'QuotaExceededError');
      original.call(this, name, value);
    };
  }, storageKey);
  await page.getByRole('button', { name: 'Save this creative interest', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('previously saved plans have been kept');
  await expect(page.getByRole('button', { name: 'Save this creative interest', exact: true })).toBeEnabled();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(stored);
  await page.reload();
  await page.evaluate(key => localStorage.setItem(key, JSON.stringify({ version: 1, savedEventIds: [], savedPathwayIds: 'invalid', reservationDraft: null, membershipInterest: null })), storageKey);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect(page.getByRole('button', { name: 'Save this creative interest', exact: true })).toBeDisabled();
  await page.goto('/profile');
  await page.getByRole('button', { name: 'Clear saved preview data' }).click();
  await page.getByRole('button', { name: 'Clear my saved plans' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
});

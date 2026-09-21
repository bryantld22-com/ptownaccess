import { expect, test } from '@playwright/test';

const storageKey = '@ptown/preview/v1';

test('Championship Path keeps a shareable focus and recovers invalid links', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/championship-path');
  await expect(page.getByRole('heading', { name: 'A local table can lead to a regional stage.', exact: true })).toBeVisible();
  await expect(page.getByRole('tab')).toHaveCount(4);
  await expect(page.getByRole('tab', { name: 'Quarterly season', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Entry & sponsors', exact: true }).click();
  await expect(page).toHaveURL('/championship-path?focus=funding');
  await expect(page.getByRole('heading', { name: 'Sponsor-first funding', exact: true })).toBeVisible();
  await expect(page.getByText(/Use free preregistration for the first season/)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Entry & sponsors', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/championship-path?focus=unknown');
  await expect(page.getByRole('tab', { name: 'Quarterly season', exact: true })).toHaveAttribute('aria-selected', 'true');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect(errors).toEqual([]);
});

test('Every championship focus distinguishes the build, safeguards, and unconfirmed status', async ({ page }) => {
  const cases = [
    ['season', 'Quarterly competition path', 'Award points under one published system'],
    ['funding', 'Sponsor-first funding', 'Ring-fence committed travel support'],
    ['chess', 'Official chess hub path', 'Recruit or train the required tournament director or arbiter'],
    ['media', 'Film and broadcast plan', 'Create a production rundown for live hosting'],
  ] as const;
  for (const [focus, title, detail] of cases) {
    await page.goto(`/championship-path?focus=${focus}`);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Build this', exact: true })).toBeVisible();
    await expect(page.getByText(new RegExp(detail))).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Safeguards before launch', exact: true })).toBeVisible();
    await expect(page.getByText('Not active yet', { exact: true })).toBeVisible();
  }
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await expect(page.getByText(/does not register a player, collect money, reserve entry/)).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
});

test('Tournament Hub, PTown, and search discover the Championship Path without changing plans', async ({ page }) => {
  const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: null, membershipInterest: 'vip' };
  await page.goto('/');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: storageKey, value: plans });
  await page.goto('/tournament');
  await page.getByRole('link', { name: 'Open the Championship Path blueprint →', exact: true }).click();
  await expect(page).toHaveURL('/championship-path');
  await expect(page.getByRole('navigation', { name: 'Your location in PTown', exact: true })).toContainText('Current: Championship Path');
  await page.goto('/ptown');
  await page.getByRole('link', { name: /Championship Path\. Build the quarterly season/i }).click();
  await expect(page).toHaveURL('/championship-path');
  await page.goto('/search?q=travel+award+sanctioned+broadcast&filter=Sections');
  await expect(page.getByText('1 result', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Open PTown Championship Path', exact: true }).click();
  await expect(page).toHaveURL('/championship-path');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(plans);
});

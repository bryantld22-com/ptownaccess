import { expect, test } from '@playwright/test';

const storageKey = '@ptown/preview/v1';

test('Investor Access keeps a shareable tier selection and recovers invalid tiers', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/investor-access');
  await expect(page.getByRole('heading', { name: 'The right investor sees the right information.', exact: true })).toBeVisible();
  await expect(page.getByRole('tab')).toHaveCount(4);
  await expect(page.getByRole('tab', { name: /Public Overview/ })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: /Prospective Investor/ }).click();
  await expect(page).toHaveURL('/investor-access?tier=prospective');
  await expect(page.getByRole('tab', { name: /Prospective Investor/ })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByText('Verify identity, contact information, and serious investment interest', { exact: true })).toBeVisible();
  await expect(page.getByText('Bank statements, tax returns, account numbers, or credentials', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('tab', { name: /Prospective Investor/ })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/investor-access?tier=unknown');
  await expect(page.getByRole('tab', { name: /Public Overview/ })).toHaveAttribute('aria-selected', 'true');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect(errors).toEqual([]);
});

test('Every investor tier states its planned material, requirements, and default denials', async ({ page }) => {
  const cases = [
    ['public-overview', 'Public Overview', 'PTown mission, venue concept, and community purpose'],
    ['prospective', 'Prospective Investor', 'Executive summary and controlled capital-raise overview'],
    ['approved-active', 'Approved / Active Investor', 'Approved detailed pro forma and due-diligence package'],
    ['document-specific', 'Document-Specific Permission', 'Only the exact document or folder approved for a named purpose'],
  ] as const;
  for (const [id, title, material] of cases) {
    await page.goto(`/investor-access?tier=${id}`);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Planned material for this tier', exact: true })).toBeVisible();
    await expect(page.getByText(material, { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Required before access', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Denied by default', exact: true })).toBeVisible();
  }
  await expect(page.getByRole('textbox')).toHaveCount(0);
  await expect(page.getByText(/No sign-in, investor verification, document access/)).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
});

test('PTown, Media Group, and search discover Investor Access without changing private plans', async ({ page }) => {
  const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: null, membershipInterest: 'vip' };
  await page.goto('/');
  await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify(value)), { key: storageKey, value: plans });
  await page.goto('/ptown');
  await page.getByRole('link', { name: /Investor Access\. Map secure tiers for the Executive Investors Edition/i }).click();
  await expect(page).toHaveURL('/investor-access');
  await expect(page.getByRole('navigation', { name: 'Your location in PTown', exact: true })).toContainText('Current: Investor Access');
  await page.goto('/media-group');
  await page.getByRole('link', { name: 'Review Investor Access tiers →', exact: true }).click();
  await expect(page).toHaveURL('/investor-access');
  await page.goto('/search?q=capitalization+watermarked&filter=Sections');
  await expect(page.getByText('1 result', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Open PTown Investor Access', exact: true }).click();
  await expect(page).toHaveURL('/investor-access');
  await expect(page.getByText(/Blueprint—not a live investor portal/)).toBeVisible();
  await expect(page.getByText(/Not an investment offer/)).toBeVisible();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(plans);
});

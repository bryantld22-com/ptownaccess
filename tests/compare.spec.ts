import { test, expect } from '@playwright/test';

test('Comparison respects three-program limits, canonical weekday links, reloads, and phone widths', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/events');
  await page.getByRole('link', { name: 'Compare programs' }).click();
  await expect(page.getByText('Which evening feels like you?', { exact: true })).toBeVisible();
  await page.getByRole('checkbox', { name: 'Friday: R&B & Blues', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Monday: House Jazz', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Thursday: Comedy Night', exact: true }).click();
  await expect(page).toHaveURL('/compare?ids=monday-jazz%2Ccomedy%2Crnb-blues');
  await expect(page.getByRole('checkbox', { name: 'Sunday: Communion Sunday', exact: true })).toBeDisabled();
  await expect(page.getByText('3 of 3 programs selected', { exact: true })).toBeVisible();
  await expect(page.getByText('Free entry proposed. Meals and drinks are not confirmed as included.', { exact: true })).toBeVisible();
  await expect(page.getByText('One culture signature plate and one alternate plate are planned.', { exact: true })).toHaveCount(2);
  await page.reload();
  await expect(page.getByRole('checkbox', { name: 'Friday: R&B & Blues', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.getByRole('checkbox', { name: 'Thursday: Comedy Night', exact: true }).click();
  await expect(page.getByRole('checkbox', { name: 'Sunday: Communion Sunday', exact: true })).toBeEnabled();
  await page.getByRole('checkbox', { name: 'Sunday: Communion Sunday', exact: true }).click();
  await expect(page).toHaveURL('/compare?ids=monday-jazz%2Crnb-blues%2Ccommunion-sunday');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('link', { name: 'Plan a Sunday visit' }).click();
  await expect(page).toHaveURL('/visit?day=Sunday');
  await expect(page.getByRole('button', { name: 'Sunday', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/compare?ids=unknown,comedy,comedy,monday-jazz,rnb-blues,communion-sunday');
  await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(3);
  await expect(page.getByRole('checkbox', { name: 'Sunday: Communion Sunday', exact: true })).toHaveAttribute('aria-checked', 'false');
  await page.getByRole('button', { name: 'Clear comparison', exact: true }).click();
  await expect(page).toHaveURL('/compare');
  await page.reload();
  await expect(page.getByText('Which evening feels like you?', { exact: true })).toBeVisible();
  await page.goto('/compare?ids=unknown');
  await expect(page.getByRole('checkbox', { checked: true })).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBeNull();
  expect(errors).toEqual([]);
});

test('Comparison saves and removes favorites while preserving other plans and failed writes', async ({ page }) => {
  await page.goto('/compare?ids=comedy');
  const data = { version: 1, savedEventIds: ['monday-jazz'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday', savedAt: '2026-09-16T00:00:00.000Z' }, membershipInterest: 'vip' };
  await page.evaluate(value => localStorage.setItem('@ptown/preview/v1', JSON.stringify(value)), data);
  await page.reload();
  await page.getByRole('button', { name: 'Save Thursday program', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove Thursday program', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('@ptown/preview/v1')!))).toEqual({ ...data, savedEventIds: ['monday-jazz', 'comedy'] });
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove Thursday program', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Remove Thursday program', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save Thursday program', exact: true })).toBeEnabled();
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Full storage'); }; });
  await page.getByRole('button', { name: 'Save Thursday program', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('previously saved plans have been kept');
  await expect(page.getByRole('button', { name: 'Save Thursday program', exact: true })).toBeEnabled();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('@ptown/preview/v1')!))).toEqual(data);
  await page.goto('/profile');
  await page.getByRole('link', { name: 'Compare your programs' }).click();
  await expect(page).toHaveURL('/compare');
});

test('Saved-program comparisons explain empty and capped selections and unreadable data prevents saves', async ({ page }) => {
  await page.goto('/compare');
  await page.getByRole('button', { name: 'Compare my saved programs', exact: true }).click();
  await expect(page.getByText(/No saved programs yet. Choose programs below/)).toBeVisible();
  await page.evaluate(() => localStorage.setItem('@ptown/preview/v1', JSON.stringify({ version: 1, savedEventIds: ['communion-sunday', 'rnb-blues', 'comedy', 'monday-jazz'], savedPathwayIds: [], reservationDraft: null, membershipInterest: null })));
  await page.reload();
  await page.getByRole('button', { name: 'Compare my saved programs', exact: true }).click();
  await expect(page).toHaveURL('/compare?ids=monday-jazz%2Ccomedy%2Crnb-blues');
  await expect(page.getByText(/Showing your first three saved programs in weekday order/)).toBeVisible();
  await page.getByRole('button', { name: 'Clear comparison', exact: true }).click();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('@ptown/preview/v1')!).savedEventIds.length)).toBe(4);
  await page.evaluate(() => localStorage.setItem('@ptown/preview/v1', 'unreadable'));
  await page.goto('/compare?ids=comedy');
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect(page.getByRole('button', { name: 'Compare my saved programs', exact: true })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Save Thursday program', exact: true })).toBeDisabled();
});

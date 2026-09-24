import { expect, test } from '@playwright/test';

test('Marketing & Brand is discoverable without changing saved plans', async ({ page }) => {
  const key = '@ptown/preview/v1';
  const saved = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: [], reservationDraft: null };
  await page.goto('/');
  await page.evaluate(({ key, saved }) => localStorage.setItem(key, JSON.stringify(saved)), { key, saved });
  await page.goto('/ptown');
  await page.getByRole('link', { name: /Marketing & Brand.*Plan audience growth/ }).click();
  await expect(page).toHaveURL('/marketing');
  await expect(page.getByRole('heading', { name: 'Give every PTown story a path to its audience.' })).toBeVisible();
  await expect(page.getByText('Marketing owns demand; Media Group owns editorial work')).toBeVisible();
  await expect(page.getByText('Months 10–12 · Launch & learning')).toBeVisible();
  await page.goto('/search?q=marketing+funnel&filter=Sections');
  await page.getByRole('link', { name: 'Open PTown Marketing & Brand' }).click();
  await expect(page).toHaveURL('/marketing');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(saved);
});

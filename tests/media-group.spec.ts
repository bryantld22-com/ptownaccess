import { expect, test } from '@playwright/test';

test('Media Group foundation is discoverable and clearly remains a preview', async ({ page }) => {
  await page.goto('/ptown');
  await page.getByRole('link', { name: /PTown Media Group/ }).click();
  await expect(page).toHaveURL('/media-group');
  await expect(page.getByRole('heading', { name: 'Independent. Unfiltered. Artist Driven.' })).toBeVisible();
  await expect(page.getByText('Every Story Matters.', { exact: true })).toBeVisible();
  await expect(page.getByText('Explore → Choose → Train → Produce → Document → Place → Return', { exact: true })).toBeVisible();
  await expect(page.getByText(/No confidential documents are exposed/)).toBeVisible();
});

test('Media library links to the Media Group foundation', async ({ page }) => {
  await page.goto('/media');
  await page.getByRole('link', { name: 'Explore the Media Group foundation →', exact: true }).click();
  await expect(page).toHaveURL('/media-group');
});

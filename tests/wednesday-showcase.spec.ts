import { expect, test } from '@playwright/test';

test('Wednesday keeps its stable program and links the invitation-only artist path', async ({ page }) => {
  await page.goto('/events?day=Wednesday');
  await expect(page.getByText('1 program · Wednesday')).toBeVisible();
  await page.getByRole('link', { name: /PTown Flow Practice/ }).click();
  await expect(page).toHaveURL('/events/ptown-flow');
  await expect(page.getByText('Artist Discovery showcase', { exact: true })).toBeVisible();
  await expect(page.getByText(/music director coordinates preparation with musicians and dancers/)).toBeVisible();
  await page.getByRole('link', { name: 'See the Monday-to-Wednesday audition path →' }).click();
  await expect(page).toHaveURL('/audition-path');
  await page.getByRole('link', { name: "Explore Wednesday's Artist Discovery showcase →" }).click();
  await expect(page).toHaveURL('/events/ptown-flow');
  await page.goto('/events');
  await expect(page.getByText('7 programs', { exact: true })).toBeVisible();
});

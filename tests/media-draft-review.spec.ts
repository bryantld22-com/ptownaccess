import { expect, test } from '@playwright/test';

const key = '@ptown/media-drafts/v1';
const draft = { id: 'draft-review', title: 'Opening night coverage', division: 'Live & Recorded Production', owner: 'Production director', status: 'Production', deadline: '', notes: '', updatedAt: '2026-09-20T00:00:00.000Z' };

test('Private draft review reports readiness and connects status to operating template', async ({ page }) => {
  await page.goto('/media-drafts');
  await page.evaluate(({ key, draft }) => localStorage.setItem(key, JSON.stringify([draft])), { key, draft });
  await page.goto('/media-drafts/draft-review');
  await expect(page.getByText('Deadline or timing has not been entered.', { exact: true })).toBeVisible();
  await expect(page.getByText('Planning notes have not been entered.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Open recommended operating template →', exact: true }).click();
  await expect(page).toHaveURL('/media-templates/show-rundown');
});

test('Private draft summary copies only after explicit action', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/media-drafts');
  await page.evaluate(({ key, draft }) => localStorage.setItem(key, JSON.stringify([{ ...draft, status: 'Review', deadline: 'Opening week', notes: 'Confirm releases.' }])), { key, draft });
  await page.goto('/media-drafts/draft-review');
  await page.getByRole('button', { name: 'Copy private draft summary', exact: true }).click();
  await expect(page.getByText(/Private draft summary copied/)).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('Not submitted, shared, assigned, or approved');
});

test('Unknown or removed draft links recover safely', async ({ page }) => {
  await page.goto('/media-drafts/missing');
  await expect(page.getByRole('heading', { name: 'Draft not found.' })).toBeVisible();
  await page.getByRole('link', { name: 'Manage private production drafts →', exact: true }).click();
  await expect(page).toHaveURL('/media-drafts');
});

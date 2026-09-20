import { expect, test } from '@playwright/test';

const key = '@ptown/media-drafts/v1';
const drafts = [
  { id: 'news', title: 'News assignment', division: 'News & Editorial', owner: 'Journal editor', status: 'Assigned', deadline: '', notes: '', updatedAt: '2026-09-20T12:00:00.000Z' },
  { id: 'live', title: 'Live capture', division: 'Live & Recorded Production', owner: 'Production director', status: 'Production', deadline: '2000-01-01', notes: 'Check rights.', updatedAt: '2026-09-20T12:00:00.000Z' },
];

test('Owner readiness filters and sorting persist in shared links', async ({ page }) => {
  await page.goto('/media-drafts'); await page.evaluate(({ key, drafts }) => localStorage.setItem(key, JSON.stringify(drafts)), { key, drafts }); await page.goto('/media-readiness');
  await page.getByRole('tab', { name: 'Timing attention', exact: true }).click(); await expect(page).toHaveURL('/media-readiness?priority=Timing+attention'); await expect(page.getByText('2 of 2 private drafts shown', { exact: true })).toBeVisible();
  await page.getByRole('tab', { name: 'Live & Recorded Production', exact: true }).click(); await expect(page.getByText('1 of 2 private drafts shown', { exact: true })).toBeVisible(); await expect(page.getByText('Live capture', { exact: true })).toBeVisible(); await expect(page.getByText('News assignment', { exact: true })).toHaveCount(0);
  await page.reload(); await expect(page.getByRole('tab', { name: 'Live & Recorded Production', exact: true })).toHaveAttribute('aria-selected', 'true');
});

test('Responsible-role filter and reset recover the complete report', async ({ page }) => {
  await page.goto('/media-drafts'); await page.evaluate(({ key, drafts }) => localStorage.setItem(key, JSON.stringify(drafts)), { key, drafts }); await page.goto('/media-readiness'); await page.getByRole('textbox', { name: 'Responsible role contains', exact: true }).fill('journal'); await expect(page.getByText('1 of 2 private drafts shown', { exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Reset readiness filters', exact: true }).click(); await expect(page).toHaveURL('/media-readiness'); await expect(page.getByText('2 of 2 private drafts shown', { exact: true })).toBeVisible();
});

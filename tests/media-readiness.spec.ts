import { expect, test } from '@playwright/test';

const key = '@ptown/media-drafts/v1';
const checks = ['Editorial category is identified', 'Decision-maker and deadline are clear', 'Required deliverables are listed', 'Known sensitivities or conflicts are disclosed'];
const drafts = [
  { id: 'blocked', title: 'Blocked coverage', division: 'News & Editorial', owner: 'Journal editor', status: 'Pre-production', deadline: '', notes: '', updatedAt: '2026-09-20T12:00:00.000Z' },
  { id: 'current', title: 'Prepared coverage', division: 'News & Editorial', owner: 'Journal editor', status: 'Pre-production', deadline: '2099-10-01', notes: 'Ready for record review.', updatedAt: '2026-09-20T12:00:00.000Z', workbook: { 'assignment-brief': { checks, notes: '', record: { documentName: 'Assignment memo', location: 'Binder A-14', reviewer: 'Media Director', reviewedOn: '2026-09-20', statusAtReview: 'Pre-production' } } } },
];

test('Owner report summarizes blocked drafts, timing, and next actions', async ({ page }) => {
  await page.goto('/media-drafts'); await page.evaluate(({ key, drafts }) => localStorage.setItem(key, JSON.stringify(drafts)), { key, drafts }); await page.goto('/media-readiness');
  await expect(page.getByText('2', { exact: true })).toHaveCount(1); await expect(page.getByText('Blocked coverage', { exact: true })).toBeVisible(); await expect(page.getByText('Prepared coverage', { exact: true })).toBeVisible(); await expect(page.getByText('No deadline or timing entered', { exact: false }).first()).toBeVisible(); await expect(page.getByText(/Recommended next action: Assignment Brief/)).toBeVisible();
});

test('Owner report copies only after explicit action', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']); await page.goto('/media-drafts'); await page.evaluate(({ key, drafts }) => localStorage.setItem(key, JSON.stringify(drafts)), { key, drafts }); await page.goto('/media-readiness'); await page.getByRole('button', { name: 'Copy private readiness report', exact: true }).click(); await expect(page.getByText(/Private readiness report copied/)).toBeVisible(); expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('PRIVATE DEVICE REPORT');
});

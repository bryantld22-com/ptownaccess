import { expect, test } from '@playwright/test';

const key = '@ptown/media-drafts/v1';
const checks = ['Editorial category is identified', 'Decision-maker and deadline are clear', 'Required deliverables are listed', 'Known sensitivities or conflicts are disclosed'];
const base = { id: 'quality-draft', title: 'Opening coverage', division: 'News & Editorial', owner: 'Journal editor', status: 'Pre-production', deadline: 'Opening week', notes: 'Review assignment.', updatedAt: '2026-09-20T12:00:00.000Z' };
const record = { documentName: 'Assignment memo', location: 'Binder A-14', reviewer: 'Media Director', reviewedOn: '2026-09-20', statusAtReview: 'Pre-production' };

test('Current supporting-record reference is distinguished from incomplete and invalid entries', async ({ page }) => {
  const current = { ...base, workbook: { 'assignment-brief': { checks, notes: '', record } } };
  await page.goto('/media-drafts'); await page.evaluate(({ key, current }) => localStorage.setItem(key, JSON.stringify([current])), { key, current }); await page.goto('/media-drafts/quality-draft'); await expect(page.getByText(/Supporting-record quality: current/)).toBeVisible();
  const invalid = { ...current, workbook: { 'assignment-brief': { checks, notes: '', record: { ...record, reviewedOn: '2026-02-30' } } } };
  await page.evaluate(({ key, invalid }) => localStorage.setItem(key, JSON.stringify([invalid])), { key, invalid }); await page.reload(); await expect(page.getByText('Review date must be a real date in YYYY-MM-DD format.', { exact: true })).toBeVisible();
});

test('Status change and later draft update mark record reference stale', async ({ page }) => {
  const stale = { ...base, status: 'Review', updatedAt: '2026-09-21T12:00:00.000Z', workbook: { 'assignment-brief': { checks, notes: '', record } } };
  await page.goto('/media-drafts'); await page.evaluate(({ key, stale }) => localStorage.setItem(key, JSON.stringify([stale])), { key, stale }); await page.goto('/media-drafts/quality-draft'); await expect(page.getByText(/changed after the entered review date/)).toBeVisible(); await expect(page.getByText(/status changed from Pre-production to Review/)).toBeVisible();
});

import { expect, test } from '@playwright/test';

const key = '@ptown/media-drafts/v1';
const draft = { id: 'record-draft', title: 'Opening coverage', division: 'Live & Recorded Production', owner: 'Production director', status: 'Pre-production', deadline: 'Opening week', notes: 'Plan coverage.', updatedAt: '2026-09-20T00:00:00.000Z' };

test('Workbook stage retains a supporting-record reference without claiming verification', async ({ page }) => {
  await page.goto('/media-drafts'); await page.evaluate(({ key, draft }) => localStorage.setItem(key, JSON.stringify([draft])), { key, draft }); await page.goto('/media-draft-workbook/record-draft');
  await page.getByRole('textbox', { name: 'Supporting document or record name', exact: true }).fill('Assignment approval memo'); await page.getByRole('textbox', { name: 'Record location or reference', exact: true }).fill('Media binder A-14'); await page.getByRole('textbox', { name: 'Reviewer name or responsible role', exact: true }).fill('Media Director'); await page.getByRole('textbox', { name: 'Review date entry', exact: true }).fill('2026-09-20'); await page.getByRole('button', { name: 'Save private workbook stage', exact: true }).click(); await page.reload();
  await expect(page.getByRole('textbox', { name: 'Supporting document or record name', exact: true })).toHaveValue('Assignment approval memo'); await expect(page.getByText('Reference only—not uploaded evidence', { exact: true })).toBeVisible();
});

test('Draft review distinguishes complete record reference from verified evidence', async ({ page }) => {
  const value = { ...draft, workbook: { 'assignment-brief': { checks: ['Editorial category is identified', 'Decision-maker and deadline are clear', 'Required deliverables are listed', 'Known sensitivities or conflicts are disclosed'], notes: '', record: { documentName: 'Assignment memo', location: 'Binder A-14', reviewer: 'Media Director', reviewedOn: '2026-09-20' } } } };
  await page.goto('/media-drafts'); await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify([value])), { key, value }); await page.goto('/media-drafts/record-draft'); await expect(page.getByText(/A complete supporting-record reference is entered/)).toBeVisible(); await expect(page.getByText(/references are not verification/)).toBeVisible();
});

import { expect, test } from '@playwright/test';

const key = '@ptown/media-drafts/v1';
const draft = { id: 'workbook-draft', title: 'Opening coverage', division: 'Live & Recorded Production', owner: 'Production director', status: 'Pre-production', deadline: 'Opening week', notes: 'Plan coverage.', updatedAt: '2026-09-20T00:00:00.000Z' };

test('Private production workbook retains stage checks and notes with its draft', async ({ page }) => {
  await page.goto('/media-drafts'); await page.evaluate(({ key, draft }) => localStorage.setItem(key, JSON.stringify([draft])), { key, draft }); await page.goto('/media-draft-workbook/workbook-draft');
  await page.getByRole('checkbox', { name: 'Editorial category is identified', exact: true }).click(); await page.getByRole('textbox', { name: 'Assignment Brief workbook notes', exact: true }).fill('Confirm editorial owner.'); await page.getByRole('button', { name: 'Save private workbook stage', exact: true }).click(); await expect(page.getByText(/Private workbook stage saved/)).toBeVisible();
  await page.getByRole('tab', { name: 'Rights & Release Checklist', exact: true }).click(); await page.getByRole('checkbox', { name: 'Participant and location releases are complete', exact: true }).click(); await page.getByRole('button', { name: 'Save private workbook stage', exact: true }).click(); await page.reload();
  await expect(page.getByText('2 of 16 workbook checks marked', { exact: true })).toBeVisible(); await page.getByRole('tab', { name: 'Assignment Brief', exact: true }).click(); await expect(page.getByRole('checkbox', { name: 'Editorial category is identified', exact: true })).toBeChecked(); await expect(page.getByRole('textbox', { name: 'Assignment Brief workbook notes', exact: true })).toHaveValue('Confirm editorial owner.');
});

test('Workbook progress transfers with private production drafts', async ({ page }) => {
  const withWorkbook = { ...draft, workbook: { 'approval-record': { checks: ['Facts, names, captions, and credits are verified'], notes: 'Editorial review pending.' } } };
  await page.goto('/media-drafts'); await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify([value])), { key, value: withWorkbook }); await page.goto('/media-draft-backup'); const code = await page.getByRole('textbox', { name: 'Private draft transfer code', exact: true }).inputValue(); expect(JSON.parse(code).drafts[0].workbook).toEqual(withWorkbook.workbook);
});

import { expect, test } from '@playwright/test';

const key = '@ptown/media-drafts/v1';
const assignmentChecks = ['Editorial category is identified', 'Decision-maker and deadline are clear', 'Required deliverables are listed', 'Known sensitivities or conflicts are disclosed'];
const rightsChecks = ['Participant and location releases are complete', 'Music and third-party content are licensed', 'Privacy, publicity, minors, and confidentiality are reviewed', 'Credits, ownership, territory, term, and usage limits are recorded'];
const base = { id: 'gate-draft', title: 'Opening coverage', division: 'Live & Recorded Production', owner: 'Production director', status: 'Production', deadline: 'Opening week', notes: 'Confirm production plan.', updatedAt: '2026-09-20T00:00:00.000Z' };

test('Production status reports incomplete required workbook gates', async ({ page }) => {
  await page.goto('/media-drafts'); await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify([value])), { key, value: { ...base, workbook: { 'assignment-brief': { checks: assignmentChecks, notes: '' }, 'rights-checklist': { checks: rightsChecks.slice(0, 1), notes: '' } } } }); await page.goto('/media-drafts/gate-draft');
  await expect(page.getByText('Marked complete · Assignment Brief', { exact: true })).toBeVisible(); await expect(page.getByText('Incomplete · Rights & Release Checklist', { exact: true })).toBeVisible(); await expect(page.getByText('Recommended next stage · Rights & Release Checklist', { exact: true })).toBeVisible();
});

test('Completing required planning checks changes the gate without claiming verification', async ({ page }) => {
  await page.goto('/media-drafts'); await page.evaluate(({ key, value }) => localStorage.setItem(key, JSON.stringify([value])), { key, value: { ...base, workbook: { 'assignment-brief': { checks: assignmentChecks, notes: '' }, 'rights-checklist': { checks: rightsChecks, notes: '' } } } }); await page.goto('/media-drafts/gate-draft');
  await expect(page.getByText('Marked complete · Rights & Release Checklist', { exact: true })).toBeVisible(); await expect(page.getByText(/Marks and references are not verification/)).toHaveCount(2); await expect(page.getByText('Recommended next stage · Content Approval Record', { exact: true })).toBeVisible();
});

import { expect, test } from '@playwright/test';

const draftKey = '@ptown/media-drafts/v1'; const actionKey = '@ptown/media-actions/v1';
const draft = { id: 'action-draft', title: 'Opening coverage', division: 'News & Editorial', owner: 'Journal editor', status: 'Assigned', deadline: '', notes: '', updatedAt: '2026-09-20T12:00:00.000Z' };

test('Readiness finding creates a private follow-up action and retains completion state', async ({ page }) => {
  await page.goto('/media-drafts'); await page.evaluate(({ draftKey, draft }) => localStorage.setItem(draftKey, JSON.stringify([draft])), { draftKey, draft }); await page.goto('/media-readiness'); await page.getByRole('link', { name: 'Create follow-up for Opening coverage →', exact: true }).click(); await expect(page).toHaveURL('/media-actions?draft=action-draft');
  await expect(page.getByRole('textbox', { name: 'Responsible role', exact: true })).toHaveValue('Journal editor'); await page.getByRole('radiogroup', { name: 'Action priority', exact: true }).getByRole('radio', { name: 'High', exact: true }).click(); await page.getByRole('textbox', { name: 'Due date or timing note', exact: true }).fill('2026-10-01'); await page.getByRole('button', { name: 'Save private follow-up action', exact: true }).click(); await expect(page.getByText(/Private follow-up action saved/)).toBeVisible();
  await page.getByRole('button', { name: 'Mark private action complete', exact: true }).click(); await page.reload(); await page.getByRole('radio', { name: 'Completed', exact: true }).click(); await expect(page.getByText('COMPLETED ON THIS DEVICE', { exact: true })).toBeVisible(); expect((await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), actionKey))[0].completed).toBe(true);
});

test('Private action queue validates required fields and removal', async ({ page }) => {
  await page.goto('/media-drafts'); await page.evaluate(({ draftKey, draft }) => localStorage.setItem(draftKey, JSON.stringify([draft])), { draftKey, draft }); await page.goto('/media-actions'); await page.getByRole('button', { name: 'Save private follow-up action', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('Choose a private draft'); await page.getByRole('radiogroup', { name: 'Action draft', exact: true }).getByRole('radio', { name: 'Opening coverage', exact: true }).click(); await page.getByRole('button', { name: 'Save private follow-up action', exact: true }).click(); await page.getByRole('button', { name: 'Remove private action', exact: true }).click(); await expect(page.getByText('No private actions match', { exact: true })).toBeVisible();
});

import { expect, test } from '@playwright/test';

const draftKey = '@ptown/media-drafts/v1'; const actionKey = '@ptown/media-actions/v1';
const draft = { id: 'current-draft', title: 'Weekend recap', division: 'News & Editorial', owner: 'Journal editor', status: 'Assigned', deadline: '', notes: '', updatedAt: '2026-09-20T12:00:00.000Z' };
const unlinked = { id: 'unlinked-action', draftId: 'removed-draft', draftTitle: 'Opening coverage', action: 'Confirm sources', owner: 'Journal editor', priority: 'High', dueDate: '', completed: false, updatedAt: '2026-09-20T00:00:00.000Z' };

test.beforeEach(async ({ page }) => { await page.goto('/media-actions'); await page.evaluate(({ draftKey, actionKey, draft, unlinked }) => { localStorage.setItem(draftKey, JSON.stringify([draft])); localStorage.setItem(actionKey, JSON.stringify([unlinked])); }, { draftKey, actionKey, draft, unlinked }); });

test('Owner queue surfaces unlinked history and review retains it', async ({ page }) => {
  await page.reload(); await expect(page.getByText('Unlinked history', { exact: true })).toBeVisible(); await page.getByRole('link', { name: 'Review 1 unlinked action →', exact: true }).click(); await expect(page.getByText('Previous draft: Opening coverage', { exact: false })).toBeVisible(); await page.getByRole('button', { name: 'Keep Confirm sources as unlinked history', exact: true }).click(); await expect(page.getByText(/remains preserved as unlinked private history/)).toBeVisible(); expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), actionKey)).toEqual([unlinked]);
});

test('Unlinked history reconnects to a current private draft', async ({ page }) => {
  await page.goto('/media-actions-unlinked'); await page.getByRole('radio', { name: draft.title, exact: true }).click(); await page.getByRole('button', { name: 'Reconnect Confirm sources', exact: true }).click(); await expect(page.getByText('No unlinked private actions', { exact: true })).toBeVisible(); const saved = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), actionKey); expect(saved[0]).toMatchObject({ draftId: draft.id, draftTitle: draft.title });
});

test('Unlinked history can be removed from this device', async ({ page }) => {
  await page.goto('/media-actions-unlinked'); await page.getByRole('button', { name: 'Remove Confirm sources from private history', exact: true }).click(); await expect(page.getByText('No unlinked private actions', { exact: true })).toBeVisible(); expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), actionKey)).toEqual([]);
});

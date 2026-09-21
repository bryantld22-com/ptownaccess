import { expect, test, type Page } from '@playwright/test';

const draftKey = '@ptown/media-drafts/v1'; const actionKey = '@ptown/media-actions/v1';
const source = { id: 'source-draft', title: 'Opening coverage', division: 'News & Editorial', owner: 'Journal editor', status: 'Assigned', deadline: '', notes: '', updatedAt: '2026-09-20T12:00:00.000Z' };
const destination = { ...source, id: 'destination-draft', title: 'Weekend recap' };
const linked = { id: 'linked-action', draftId: source.id, draftTitle: source.title, action: 'Confirm sources', owner: 'Journal editor', priority: 'High', dueDate: '', completed: false, updatedAt: '2026-09-20T00:00:00.000Z' };

async function seed(page: Page) {
  await page.goto('/media-drafts');
  await page.evaluate(({ draftKey, actionKey, drafts, actions }) => { localStorage.setItem(draftKey, JSON.stringify(drafts)); localStorage.setItem(actionKey, JSON.stringify(actions)); }, { draftKey, actionKey, drafts: [source, destination], actions: [linked] });
  await page.goto(`/media-draft-delete/${source.id}`);
}

test('Draft removal preserves linked actions as unlinked history by default', async ({ page }) => {
  await seed(page); await expect(page.getByText('1 linked private action', { exact: true })).toBeVisible(); await page.getByRole('button', { name: 'Remove draft with reviewed action decision', exact: true }).click(); await expect(page).toHaveURL('/media-drafts');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), draftKey)).toEqual([destination]); expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), actionKey)).toEqual([linked]);
});

test('Draft removal can reassign linked actions to another draft', async ({ page }) => {
  await seed(page); await page.getByRole('radio', { name: 'Reassign to another draft', exact: true }).click(); await page.getByRole('radio', { name: destination.title, exact: true }).click(); await page.getByRole('button', { name: 'Remove draft with reviewed action decision', exact: true }).click();
  const actions = await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), actionKey); expect(actions[0]).toMatchObject({ draftId: destination.id, draftTitle: destination.title });
});

test('Draft removal can remove linked actions while cancel keeps everything', async ({ page }) => {
  await seed(page); await page.getByRole('link', { name: 'Cancel and keep private draft →', exact: true }).click(); await expect(page).toHaveURL('/media-drafts'); expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), draftKey)).toEqual([source, destination]);
  await page.goto(`/media-draft-delete/${source.id}`); await page.getByRole('radio', { name: 'Remove linked actions', exact: true }).click(); await page.getByRole('button', { name: 'Remove draft with reviewed action decision', exact: true }).click(); expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), actionKey)).toEqual([]);
});

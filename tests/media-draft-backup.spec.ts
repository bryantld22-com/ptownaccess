import { expect, test } from '@playwright/test';

const key = '@ptown/media-drafts/v1';
const drafts = [{ id: 'draft-one', title: 'Opening coverage', division: 'Live & Recorded Production', owner: 'Production director', status: 'Pre-production', deadline: 'Opening week', notes: 'Confirm releases.', updatedAt: '2026-09-20T00:00:00.000Z' }];

test('Private production drafts transfer only after review and explicit replacement', async ({ page, browser }) => {
  await page.goto('/media-drafts'); await page.evaluate(({ key, drafts }) => localStorage.setItem(key, JSON.stringify(drafts)), { key, drafts });
  await page.goto('/media-draft-backup'); const code = await page.getByRole('textbox', { name: 'Private draft transfer code', exact: true }).inputValue();
  const destination = await browser.newContext({ baseURL: new URL(page.url()).origin });
  try { const other = await destination.newPage(); await other.goto('/media-draft-backup'); await other.getByRole('textbox', { name: 'Paste private draft transfer code', exact: true }).fill(code); await other.getByRole('button', { name: 'Review private draft transfer', exact: true }).click(); await expect(other.getByText('Opening coverage', { exact: true })).toBeVisible(); expect(await other.evaluate(key => localStorage.getItem(key), key)).toBeNull(); await other.getByRole('button', { name: 'Replace this device’s private drafts', exact: true }).click(); expect(await other.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(drafts); } finally { await destination.close(); }
});

test('Invalid transfer codes leave current private drafts unchanged', async ({ page }) => {
  await page.goto('/media-draft-backup'); await page.evaluate(({ key, drafts }) => localStorage.setItem(key, JSON.stringify(drafts)), { key, drafts }); await page.reload();
  await page.getByRole('textbox', { name: 'Paste private draft transfer code', exact: true }).fill(JSON.stringify({ app: 'PTown Access', type: 'media-drafts', format: 1, drafts: [{ ...drafts[0], status: 'Unknown' }] }));
  await page.getByRole('button', { name: 'Review private draft transfer', exact: true }).click(); await expect(page.getByRole('alert')).toContainText('could not be read'); await expect(page.getByRole('button', { name: 'Replace this device’s private drafts', exact: true })).toHaveCount(0); expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(drafts);
});

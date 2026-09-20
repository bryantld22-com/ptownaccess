import { expect, test } from '@playwright/test';

test('Media production template builds a reviewed draft without submitting it', async ({ page, context }) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/media-templates/assignment-brief');
  await page.getByRole('textbox', { name: 'Project or story title', exact: true }).fill('PTown opening story');
  await page.getByRole('textbox', { name: 'Assigned owner', exact: true }).fill('News producer');
  await page.getByRole('checkbox', { name: 'Editorial category is identified', exact: true }).click();
  const summary = page.getByRole('textbox', { name: 'Draft review summary', exact: true });
  await expect(summary).toHaveValue(/PTown opening story/);
  await expect(summary).toHaveValue(/\[x\] Editorial category is identified/);
  await page.getByRole('button', { name: 'Copy reviewed draft', exact: true }).click();
  await expect(page.getByText('Reviewed draft copied. It has not been submitted or approved.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toContain('DRAFT ONLY');
});

test('All six production templates export and remain draft-only', async ({ page }) => {
  for (const id of ['assignment-brief', 'show-rundown', 'call-sheet', 'rights-checklist', 'approval-record', 'archive-handoff']) {
    await page.goto(`/media-templates/${id}`);
    await expect(page.getByText('This draft stays on this screen', { exact: true })).toBeVisible();
    await expect(page.getByRole('textbox', { name: 'Draft review summary', exact: true })).toHaveValue(/Not submitted or approved/);
  }
});

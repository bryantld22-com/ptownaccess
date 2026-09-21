import { expect, test } from '@playwright/test';

test('viewer role is read only and calendar shows conflicts', async ({ page }) => {
  await page.goto('/operations/access');
  await page.getByText('Viewer', { exact: true }).click();
  await page.goto('/operations/calendar');
  await expect(page.getByText('Read-only calendar')).toBeVisible();
  await expect(page.getByText('Viewer access · read only')).toBeDisabled();
});

test('outreach stays approval gated and unsent', async ({ page }) => {
  await page.goto('/operations/access');
  await page.getByText('Owner', { exact: true }).click();
  await page.goto('/operations/outreach');
  await page.getByLabel('Message draft').fill('Please confirm routing and availability for a proposed PTown date.');
  await page.getByText('Save unsent draft').click();
  await expect(page.getByText('It has not been sent.')).toBeVisible();
  await page.getByText('Submit for approval').click();
  await page.getByText('Approve draft').click();
  await expect(page.getByText('APPROVED · STILL UNSENT')).toBeVisible();
});

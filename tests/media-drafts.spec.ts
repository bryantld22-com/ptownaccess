import { expect, test } from '@playwright/test';

test('Private media drafts can be created, edited, retained, and removed on one device', async ({ page }) => {
  await page.goto('/media-drafts');
  await page.getByRole('textbox', { name: 'Project title', exact: true }).fill('Opening night coverage');
  await page.getByRole('textbox', { name: 'Owner or responsible role', exact: true }).fill('Production director');
  await page.getByRole('textbox', { name: 'Deadline or timing note', exact: true }).fill('Opening week');
  await page.getByRole('radio', { name: 'Live & Recorded Production', exact: true }).click();
  await page.getByRole('radio', { name: 'Pre-production', exact: true }).click();
  await page.getByRole('button', { name: 'Save private draft', exact: true }).click();
  await expect(page.getByText('Private production draft saved on this device.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText('Opening night coverage', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Edit Opening night coverage', exact: true }).click();
  await page.getByRole('textbox', { name: 'Project title', exact: true }).fill('Opening weekend coverage');
  await page.getByRole('button', { name: 'Update private draft', exact: true }).click();
  await expect(page.getByText('Opening weekend coverage', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Remove Opening weekend coverage', exact: true }).click();
  await expect(page.getByText('No private production drafts', { exact: true })).toBeVisible();
});

test('A private draft requires title and owner', async ({ page }) => {
  await page.goto('/media-drafts');
  await page.getByRole('button', { name: 'Save private draft', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Enter a project title and owner before saving.');
});

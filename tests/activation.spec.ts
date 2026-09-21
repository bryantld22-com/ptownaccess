import { expect, test } from '@playwright/test';

test('activation remains safely locked without Supabase client configuration', async ({ page }) => {
  await page.goto('/operations/activation');
  await expect(page.getByText('SAFE CLIENT CREDENTIALS ONLY')).toBeVisible();
  await expect(page.getByText('Present · value hidden')).toHaveCount(0);
  await expect(page.getByText('Run safe connection check')).toBeDisabled();
  await expect(page.getByText('Nothing is uploaded by this screen.')).toBeVisible();
});

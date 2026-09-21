import { expect, test } from '@playwright/test';

test('Media Group divisions expose programs, responsibilities, and Skills Passport evidence', async ({ page }) => {
  await page.goto('/media-group');
  const divisions = [['News & Editorial', 'news-editorial'], ['Radio & Podcasts', 'radio-podcasts'], ['Live & Recorded Production', 'production'], ['Digital Distribution', 'distribution'], ['Partnerships & Revenue', 'partnerships-revenue'], ['Media Academy', 'media-academy']];
  for (const [title, id] of divisions) {
    await page.getByRole('link', { name: new RegExp(`^${title}`) }).click();
    await expect(page).toHaveURL(`/media-group/${id}`);
    await expect(page.getByRole('heading', { name: 'Planned programs', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Core responsibilities', exact: true }).first()).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Skills Passport evidence', exact: true }).first()).toBeVisible();
    await page.getByRole('link', { name: 'Return to PTown Media Group →', exact: true }).click();
  }
});

test('Media Director Guide defines operations, safety, rights, and records', async ({ page }) => {
  await page.goto('/media-group/operations-guide');
  await expect(page.getByRole('heading', { name: 'Lead the story. Protect the trust.' })).toBeVisible();
  await expect(page.getByText('Plan', { exact: true })).toBeVisible();
  await expect(page.getByText('Emergency controls', { exact: true })).toBeVisible();
  await expect(page.getByText('Rights before release', { exact: true })).toBeVisible();
  await expect(page.getByText('One accountable project file', { exact: true })).toBeVisible();
});

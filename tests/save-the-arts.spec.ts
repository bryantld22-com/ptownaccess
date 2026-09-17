import { test, expect } from '@playwright/test';

test('Save the Arts program filters reload and connect the Heritage Tour to saved interests', async ({ page }) => {
  test.setTimeout(60000);
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  await page.goto('/save-the-arts');
  const links = page.getByRole('link', { name: / · Save the Arts$/ });
  await expect(links).toHaveCount(2);
  for (const [label, id] of [['Saturday sessions', 'saturday-arts'], ['Heritage Tour', 'heritage-tour']]) {
    const tab = page.getByRole('tab', { name: label, exact: true });
    await tab.focus(); await tab.press('Enter');
    await expect(page).toHaveURL(`/save-the-arts?program=${id}`);
    await expect(links).toHaveCount(1);
    await expect(links).toHaveAttribute('href', `/programs/${id}`);
    await page.reload();
    await expect(tab).toHaveAttribute('aria-selected', 'true');
    await expect(links).toHaveCount(1);
  }
  await links.click();
  await expect(page.getByRole('heading', { name: 'The Heritage Tour', exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Save this creative interest', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved interest', exact: true })).toBeEnabled();
  await page.getByRole('navigation', { name: 'Your location in PTown' }).getByRole('link', { name: 'Save the Arts', exact: true }).click();
  await expect(links).toHaveCount(2);
  await expect(page.getByRole('link', { name: 'The Heritage Tour · Save the Arts', exact: true })).toContainText('Interest saved on this device');
  await page.getByRole('link', { name: 'Review saved creative interests →', exact: true }).click();
  await expect(page.getByRole('link', { name: 'The Heritage Tour · Save the Arts', exact: true })).toBeVisible();
  expect(errors).toEqual([]);
});

test('Mission and programs fit every device, recover unknown filters, and connect to creative departments', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/save-the-arts?program=saturday-arts');
    await expect(page.getByRole('tab', { name: 'Saturday sessions', exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('link', { name: 'Saturday Arts Sessions · Save the Arts', exact: true })).toContainText('Two planned Saturday sessions');
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.goto('/save-the-arts?program=unknown');
  await expect(page.getByRole('tab', { name: 'All programs', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('link', { name: / · Save the Arts$/ })).toHaveCount(2);
  await page.getByRole('tab', { name: 'Heritage Tour', exact: true }).click();
  await page.getByRole('tab', { name: 'All programs', exact: true }).click();
  await expect(page).toHaveURL('/save-the-arts');
  await page.getByRole('link', { name: 'Explore community stories →', exact: true }).click();
  await expect(page).toHaveURL('/media?category=Stories');
  await expect(page.getByRole('tab', { name: 'Stories', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/save-the-arts');
  await page.getByRole('link', { name: 'Explore Artist Development →', exact: true }).click();
  await expect(page).toHaveURL('/artist-development');
  expect(errors).toEqual([]);
});

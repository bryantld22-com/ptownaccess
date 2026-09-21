import { test, expect } from '@playwright/test';

const storageKey = '@ptown/preview/v1';

test('Access role blueprint keeps a shareable selection and recovers invalid roles', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/access-roles');
  await expect(page.getByRole('heading', { name: 'Right access. Right responsibility.', exact: true })).toBeVisible();
  await expect(page.getByRole('tab')).toHaveCount(9);
  await expect(page.getByRole('tab', { name: 'Guest / Viewer', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.getByRole('tab', { name: 'Camera Host', exact: true }).click();
  await expect(page).toHaveURL('/access-roles?role=camera-host');
  await expect(page.getByRole('heading', { name: 'Camera Host', exact: true })).toBeVisible();
  await expect(page.getByText(/approved device and stream key/i)).toBeVisible();
  await expect(page.getByText(/Switching, publishing, or archive authority/i)).toBeVisible();
  await page.reload();
  await expect(page.getByRole('tab', { name: 'Camera Host', exact: true })).toHaveAttribute('aria-selected', 'true');
  await page.goto('/access-roles?role=unknown');
  await expect(page.getByRole('tab', { name: 'Guest / Viewer', exact: true })).toHaveAttribute('aria-selected', 'true');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect(errors).toEqual([]);
});

test('Every role exposes a workflow, future boundary, default denials, and relevant preview route', async ({ page }) => {
  const cases = [
    ['guest-viewer', 'Guest / Viewer', '/events'],
    ['registered-member', 'Registered Member', '/memberships'],
    ['vip-member', 'VIP Member', '/vip'],
    ['performer-artist', 'Performer / Artist', '/artist-development'],
    ['staff-server', 'Staff / Server', '/reservations'],
    ['camera-host', 'Camera Host', '/media-group/production'],
    ['production-staff', 'Production Staff', '/media-templates'],
    ['director', 'Director', '/media-group/operations-guide'],
    ['owner-admin', 'Owner / Administrator', '/media-dashboard'],
  ] as const;
  for (const [id, title, route] of cases) {
    await page.goto(`/access-roles?role=${id}`);
    await expect(page.getByRole('heading', { name: title, exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Workflow to map before launch', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Future permission boundary', exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Denied by default', exact: true })).toBeVisible();
    await expect(page.locator(`a[href="${route}"]`)).toBeVisible();
  }
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
});

test('PTown and search discover the role blueprint without changing plans at any screen width', async ({ page }) => {
  const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: null, membershipInterest: 'vip' };
  await page.goto('/');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key: storageKey, plans });
  await page.goto('/ptown');
  await page.getByRole('link', { name: /Access roles\. Map guest, member, talent, staff, media, and leadership boundaries/i }).click();
  await expect(page).toHaveURL('/access-roles');
  await expect(page.getByRole('navigation', { name: 'Your location in PTown', exact: true })).toContainText('Current: Access roles');
  await page.goto('/search?q=least+privilege&filter=Sections');
  await expect(page.getByText('1 result', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Open PTown Access Roles', exact: true }).click();
  await expect(page).toHaveURL('/access-roles');
  await expect(page.getByText(/does not create an account, verify an identity, grant access/i)).toBeVisible();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(plans);
});

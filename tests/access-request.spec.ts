import { test, expect } from '@playwright/test';

const storageKey = '@ptown/preview/v1';
const controls = [
  'Verify identity and the person responsible for approving this role',
  'Limit access to the selected responsibility—no broader role access',
  'Confirm required consent, training, safety, and confidentiality steps',
  'Set an expiration or scheduled review and a revocation trigger',
] as const;

test('A selected role hands off to a complete copyable review worksheet', async ({ page, context }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/access-roles?role=camera-host');
  await page.getByRole('link', { name: /Build a Camera Host review worksheet/ }).click();
  await expect(page).toHaveURL('/access-request?role=camera-host');
  await expect(page.getByRole('heading', { name: 'Request only the access the work requires.', exact: true })).toBeVisible();
  await expect(page.getByRole('tab', { name: 'Camera Host', exact: true })).toHaveAttribute('aria-selected', 'true');
  await expect(page.getByRole('radio', { name: 'My assigned production brief', exact: true })).toBeChecked();
  const copy = page.getByRole('button', { name: 'Copy worksheet for review', exact: true });
  await expect(copy).toBeDisabled();
  await page.getByRole('radio', { name: 'My approved camera device and feed', exact: true }).click();
  await page.getByRole('radio', { name: /Short assignment/ }).click();
  for (const control of controls) await page.getByRole('checkbox', { name: control, exact: true }).click();
  await expect(page.getByText('Worksheet ready for owner review', { exact: true })).toBeVisible();
  await expect(copy).toBeEnabled();
  await copy.click();
  await expect(page.getByText('Worksheet copied for review. It has not been submitted, approved, assigned, or granted.', { exact: true })).toBeVisible();
  const copied = await page.evaluate(() => navigator.clipboard.readText());
  expect(copied).toContain('Requested role: Camera Host');
  expect(copied).toContain('Limited responsibility: My approved camera device and feed');
  expect(copied).toContain('Access window: Short assignment');
  expect(copied).toContain('[x] Verify identity');
  expect(copied).toContain('Switching, publishing, or archive authority');
  expect(copied).toContain('NOT SUBMITTED, APPROVED, ASSIGNED, OR GRANTED');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  expect(errors).toEqual([]);
});

test('Every role offers limited scopes while only the role survives a reload', async ({ page }) => {
  const cases = [
    ['guest-viewer', 'Guest / Viewer', 'Public program and visitor information'],
    ['registered-member', 'Registered Member', 'My own account and profile'],
    ['vip-member', 'VIP Member', 'My own confirmed VIP benefits'],
    ['performer-artist', 'Performer / Artist', 'My own artist profile and materials'],
    ['staff-server', 'Staff / Server', 'My assigned shift and service area'],
    ['camera-host', 'Camera Host', 'My assigned production brief'],
    ['production-staff', 'Production Staff', 'My assigned production workspace'],
    ['director', 'Director', 'My assigned department or production'],
    ['owner-admin', 'Owner / Administrator', 'Verified role administration'],
  ] as const;
  for (const [id, title, scope] of cases) {
    await page.goto(`/access-request?role=${id}`);
    await expect(page.getByRole('tab', { name: title, exact: true })).toHaveAttribute('aria-selected', 'true');
    await expect(page.getByRole('radio', { name: scope, exact: true })).toBeChecked();
    await expect(page.getByRole('radiogroup', { name: 'Requested responsibility', exact: true }).getByRole('radio')).toHaveCount(3);
  }
  await page.goto('/access-request?role=camera-host');
  await page.getByRole('radio', { name: 'My approved camera device and feed', exact: true }).click();
  await page.getByRole('radio', { name: /Ongoing responsibility/ }).click();
  await page.getByRole('checkbox', { name: controls[0], exact: true }).click();
  await expect(page).toHaveURL('/access-request?role=camera-host');
  await page.reload();
  await expect(page.getByRole('radio', { name: 'My assigned production brief', exact: true })).toBeChecked();
  await expect(page.getByRole('radio', { name: /One event or shift/ })).toBeChecked();
  await expect(page.getByRole('checkbox', { name: controls[0], exact: true })).not.toBeChecked();
  await page.goto('/access-request?role=unknown');
  await expect(page.getByRole('tab', { name: 'Guest / Viewer', exact: true })).toHaveAttribute('aria-selected', 'true');
});

test('Search finds the private worksheet without exposing plans, and failure remains honest at every width', async ({ page }) => {
  const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: null, membershipInterest: 'vip' };
  await page.goto('/');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key: storageKey, plans });
  await page.goto('/search?q=revocation+safeguards&filter=Sections');
  await expect(page.getByText('1 result', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Open PTown Role Request Worksheet', exact: true }).click();
  await expect(page).toHaveURL('/access-request');
  await expect(page.getByRole('navigation', { name: 'Your location in PTown', exact: true })).toContainText('Current: Role request worksheet');
  await expect(page.getByRole('textbox')).toHaveCount(1);
  await expect(page.getByText(/Do not enter names, contact details, passwords, medical information, payment information, or confidential records/)).toBeVisible();
  for (const control of controls) await page.getByRole('checkbox', { name: control, exact: true }).click();
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Denied'); } } }));
  await page.getByRole('button', { name: 'Copy worksheet for review', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Copy is unavailable. Select the worksheet summary and copy it manually.');
  await page.getByRole('button', { name: 'Clear worksheet', exact: true }).click();
  await expect(page.getByText('Worksheet cleared. Nothing was submitted, approved, or revoked.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Copy worksheet for review', exact: true })).toBeDisabled();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), storageKey)).toEqual(plans);
});

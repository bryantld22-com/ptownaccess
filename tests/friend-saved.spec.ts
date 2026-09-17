import { test, expect } from '@playwright/test';

const key = '@ptown/preview/v1';
const plans = { version: 1, savedEventIds: ['tuesday-jazz', 'blues-country'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 8, occasion: 'Private occasion', notes: 'Private dinner notes', savedAt: '2026-09-17T00:00:00Z' }, membershipInterest: 'vip' };

test('Saved invitation shortcuts use only the chosen program and retain interest links without changing plans', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.goto('/friends?interest=music');
  await expect(page.getByText('2 saved programs · Not tickets or confirmed dates', { exact: true })).toBeVisible();
  const preview = page.getByRole('textbox', { name: 'Invitation preview', exact: true });
  await expect(preview).toHaveValue(/Thursday · Comedy Night/);
  const choice = page.getByRole('button', { name: 'Use Musician Jam Session for invitation', exact: true });
  await choice.focus(); await choice.press('Enter');
  const url = new URL(page.url()); expect(url.searchParams.get('program')).toBe('tuesday-jazz'); expect(url.searchParams.get('interest')).toBe('music');
  await expect(page.getByRole('radio', { name: 'Tuesday: Musician Jam Session', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(preview).toHaveValue(/Tuesday · Musician Jam Session/);
  await expect(page.getByRole('textbox', { name: 'Preferred invitation date (optional)', exact: true })).toHaveValue('');
  await expect(page.getByRole('textbox', { name: 'Estimated invitation group (optional)', exact: true })).toHaveValue('');
  for (const value of ['2030-08-11', 'Private occasion', 'Private dinner notes', 'VIP Society']) expect(await preview.inputValue()).not.toContain(value);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.reload(); await expect(preview).toHaveValue(/Tuesday · Musician Jam Session/);
  await page.getByRole('link', { name: 'Manage invitation favorites →', exact: true }).click();
  await expect(page).toHaveURL('/profile?view=events');
  expect(errors).toEqual([]);
});

test('Static invitation pages wait for device favorites without presenting a false empty list', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  try {
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:8081/friends');
    await expect(page.getByText('Loading this device’s saved programs…', { exact: true })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'No saved programs for invitations yet', exact: true })).toHaveCount(0);
    await expect(page.getByRole('heading', { name: 'Saved programs unavailable', exact: true })).toHaveCount(0);
  } finally { await context.close(); }
});

test('Favorite changes update invitation shortcuts live and never erase manually entered group details', async ({ page }) => {
  await page.goto('/friends');
  await expect(page.getByRole('heading', { name: 'No saved programs for invitations yet', exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Browse programs to save →', exact: true }).click();
  await expect(page).toHaveURL('/events');
  await page.goto('/events/tuesday-jazz');
  await page.getByRole('button', { name: 'Save this event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved event', exact: true })).toBeEnabled();
  await page.goto('/friends?program=tuesday-jazz');
  await expect(page.getByRole('button', { name: 'Use Musician Jam Session for invitation', exact: true })).toBeVisible();
  await page.getByRole('textbox', { name: 'Preferred invitation date (optional)', exact: true }).fill('2030-08-13');
  await page.getByRole('textbox', { name: 'Estimated invitation group (optional)', exact: true }).fill('3');
  await page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true }).fill('Our idea');
  await page.getByRole('button', { name: 'Use Musician Jam Session for invitation', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(/Estimated group: 3 people/);
  await expect(page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true })).toHaveValue('Our idea');
  await page.getByRole('link', { name: 'Manage invitation favorites →', exact: true }).click();
  await page.getByRole('link').filter({ hasText: 'Musician Jam Session' }).click();
  await page.getByRole('button', { name: 'Remove saved event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Save this event', exact: true })).toBeEnabled();
  await page.goBack(); await page.goBack();
  await expect(page.getByRole('heading', { name: 'No saved programs for invitations yet', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Use Musician Jam Session for invitation', exact: true })).toHaveCount(0);
});

test('Unreadable favorites do not masquerade as empty and manual invitations remain available at every width', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/friends');
  await page.evaluate(key => localStorage.setItem(key, 'unreadable'), key);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Saved programs unavailable', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'No saved programs for invitations yet', exact: true })).toHaveCount(0);
  await page.getByRole('radio', { name: 'Saturday: Any Genre', exact: true }).click();
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(/Saturday · Any Genre/);
  await expect(page.getByRole('button', { name: 'Copy invitation preview', exact: true })).toBeEnabled();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBe('unreadable');
  await page.getByRole('link', { name: 'Recover saved programs in Profile →', exact: true }).click();
  await expect(page).toHaveURL('/profile');
  expect(errors).toEqual([]);
});

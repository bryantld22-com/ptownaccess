import { test, expect } from '@playwright/test';

const key = '@ptown/preview/v1';
const dateLabel = 'Preferred invitation date (optional)';
const groupLabel = 'Estimated invitation group (optional)';
const previewLabel = 'Invitation preview';

test('Optional group details are reviewed and copied without exposing or changing saved plans', async ({ page, context }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: [], reservationDraft: { date: '2030-08-11', partySize: 8, occasion: 'Private occasion', notes: 'Private dinner notes', savedAt: '2026-09-17T00:00:00Z' }, membershipInterest: 'vip' };
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.goto('/friends?program=tuesday-jazz');
  await expect(page.getByRole('textbox', { name: dateLabel, exact: true })).toHaveValue('');
  await expect(page.getByRole('textbox', { name: groupLabel, exact: true })).toHaveValue('');
  await page.getByRole('textbox', { name: dateLabel, exact: true }).fill('2030-08-13');
  await page.getByRole('textbox', { name: groupLabel, exact: true }).fill('4');
  await page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true }).fill('Bring your ideas!');
  const preview = page.getByRole('textbox', { name: previewLabel, exact: true });
  await expect(preview).toHaveValue(/Preferred date: 2030-08-13/);
  const text = await preview.inputValue();
  expect(text).toContain('Estimated group: 4 people, including me (not RSVPs or a capacity confirmation).');
  expect(text).toContain('No event date, table, ticket, or attendance is confirmed.');
  for (const privateText of ['2030-08-11', 'Private occasion', 'Private dinner notes', 'VIP Society']) expect(text).not.toContain(privateText);
  await page.getByRole('button', { name: 'Copy invitation preview', exact: true }).click();
  await expect(page.getByText('Invitation preview copied. No invitation or friend request was sent.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text);
  expect(new URL(page.url()).searchParams.toString()).toBe('program=tuesday-jazz');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  await page.reload();
  await expect(page.getByRole('textbox', { name: dateLabel, exact: true })).toHaveValue('');
  await expect(page.getByRole('textbox', { name: groupLabel, exact: true })).toHaveValue('');
  await expect(preview).not.toHaveValue(/2030-08-13|Estimated group|Bring your ideas/);
  expect(errors).toEqual([]);
});

test('Calendar and size checks pause copying and a weekday shortcut preserves group details', async ({ page }) => {
  await page.goto('/friends?program=tuesday-jazz');
  const date = page.getByRole('textbox', { name: dateLabel, exact: true });
  const group = page.getByRole('textbox', { name: groupLabel, exact: true });
  const copy = page.getByRole('button', { name: 'Copy invitation preview', exact: true });
  const preview = page.getByRole('textbox', { name: previewLabel, exact: true });
  for (const value of ['2030-02-30', '2030-13-01', 'not-a-date']) {
    await date.fill(value);
    await expect(page.getByRole('alert')).toHaveText('Enter a real date in YYYY-MM-DD format.');
    await expect(copy).toBeDisabled();
    await expect(preview).toHaveValue('Invitation preview paused. Correct the group details above before copying.');
  }
  await date.fill('2000-01-04');
  await expect(page.getByRole('alert')).toHaveText('Choose today or a future date.');
  await expect(copy).toBeDisabled();
  await date.fill('2030-08-11'); await group.fill('3');
  await expect(page.getByRole('alert')).toHaveText('This date falls on Sunday. Choose the Sunday program or change the date.');
  await page.getByRole('button', { name: 'Use the Sunday program', exact: true }).click();
  await expect(page).toHaveURL('/friends?program=communion-sunday');
  await expect(date).toHaveValue('2030-08-11'); await expect(group).toHaveValue('3');
  await expect(copy).toBeEnabled();
  await expect(preview).toHaveValue(/Sunday · Communion Sunday/);
  for (const value of ['0', '-1', '1.5', '1000', '1e2', 'two']) {
    await group.fill(value);
    await expect(page.getByRole('alert')).toHaveText('Enter a whole number from 1 to 999, including yourself.');
    await expect(copy).toBeDisabled();
  }
  await group.fill('999'); await expect(copy).toBeEnabled();
  await group.fill('1'); await expect(preview).toHaveValue(/Estimated group: 1 person, including me/);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
});

test('Clearing group details preserves notes and copy failure preserves the reviewed draft on every screen', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/friends?program=tuesday-jazz');
  await page.getByRole('textbox', { name: dateLabel, exact: true }).fill('2030-08-13');
  await page.getByRole('textbox', { name: groupLabel, exact: true }).fill('5');
  await page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true }).fill('Keep this note');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Denied'); } } }));
  await page.getByRole('button', { name: 'Copy invitation preview', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Copy is unavailable. Select the invitation preview below and copy it manually.');
  await expect(page.getByRole('textbox', { name: previewLabel, exact: true })).toHaveValue(/Estimated group: 5 people/);
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await page.getByRole('button', { name: 'Clear group details', exact: true }).click();
  await expect(page.getByRole('textbox', { name: dateLabel, exact: true })).toHaveValue('');
  await expect(page.getByRole('textbox', { name: groupLabel, exact: true })).toHaveValue('');
  await expect(page.getByRole('textbox', { name: previewLabel, exact: true })).toHaveValue(/Personal note: Keep this note/);
  await expect(page.getByRole('textbox', { name: previewLabel, exact: true })).not.toHaveValue(/Preferred date|Estimated group/);
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Clear group details', exact: true })).toBeDisabled();
  expect(errors).toEqual([]);
});

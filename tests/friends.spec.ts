import { test, expect } from '@playwright/test';

const key = '@ptown/preview/v1';
const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Private occasion', notes: 'Private dietary planning note.', savedAt: '2026-09-17T00:00:00Z' }, membershipInterest: 'vip' };

test('Invitations use selected programs, copy exact reviewed text, and exclude saved private plans', async ({ page, context }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/');
  await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.getByRole('link', { name: 'Explore Friend 2 Friend →', exact: true }).click();
  await expect(page).toHaveURL('/friends');
  await page.getByRole('radio', { name: 'Tuesday: Musician Jam Session', exact: true }).click();
  await expect(page).toHaveURL('/friends?program=tuesday-jazz');
  const preview = page.getByRole('textbox', { name: 'Invitation preview', exact: true });
  await expect(preview).toHaveValue(/Tuesday · Musician Jam Session/);
  let text = await preview.inputValue();
  for (const privateText of ['2030-08-11', 'Private occasion', 'Private dietary planning note', 'VIP Society']) expect(text).not.toContain(privateText);
  await page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true }).fill('Let’s talk about this evening!');
  text = await preview.inputValue();
  expect(text).toContain('Personal note: Let’s talk about this evening!');
  expect(new URL(page.url()).searchParams.toString()).toBe('program=tuesday-jazz');
  await page.getByRole('button', { name: 'Copy invitation preview', exact: true }).click();
  await expect(page.getByText('Invitation preview copied. No invitation or friend request was sent.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(text);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  await page.reload();
  await expect(page.getByRole('radio', { name: 'Tuesday: Musician Jam Session', exact: true })).toHaveAttribute('aria-checked', 'true');
  await expect(page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true })).toHaveValue('');
  await expect(preview).not.toHaveValue(/Let’s talk about/);
  await page.getByRole('link', { name: 'Explore the Tuesday visit guide →', exact: true }).click();
  await expect(page).toHaveURL('/visit?day=Tuesday');
  expect(errors).toEqual([]);
});

test('Fictional connection feedback is not saved and the experience fits every device', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/friends?program=blues-country');
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(/Saturday · Any Genre/);
  await expect(page.getByText('FICTIONAL SAMPLE PROFILE', { exact: true })).toHaveCount(3);
  const connection = page.getByRole('button', { name: 'Preview connection with Music explorer', exact: true });
  await connection.focus(); await connection.press('Enter');
  await expect(page.getByText('Connection previewed with Music explorer. No friend request was sent or saved.', { exact: true })).toBeVisible();
  await expect(connection).toBeDisabled();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  const question = page.getByRole('button', { name: 'Are these real PTown members?', exact: true });
  await question.click(); await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/There are no real accounts, friend lists, or live conversations/)).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  await page.reload(); await expect(connection).toBeEnabled();
  expect(errors).toEqual([]);
});

test('Invitation copy failure stays honest and invalid links recover to a safe default', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/friends?program=unknown');
  await expect(page.getByRole('radio', { name: 'Thursday: Comedy Night', exact: true })).toHaveAttribute('aria-checked', 'true');
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Denied'); } } }));
  await page.getByRole('button', { name: 'Copy invitation preview', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Copy is unavailable. Select the invitation preview below and copy it manually.');
  await expect(page.getByText('Invitation preview copied. No invitation or friend request was sent.', { exact: true })).toHaveCount(0);
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(/No invitation or friend request has been sent/);
  await page.goto('/friends?program=tuesday-jazz&program=blues-country');
  await expect(page.getByRole('radio', { name: 'Thursday: Comedy Night', exact: true })).toHaveAttribute('aria-checked', 'true');
  expect(errors).toEqual([]);
});

test('PTown directory and global search discover Friend 2 Friend with recovery location', async ({ page }) => {
  await page.goto('/ptown');
  await page.getByRole('link', { name: 'Explore Friend 2 Friend →', exact: true }).click();
  await expect(page).toHaveURL('/friends');
  await expect(page.getByRole('navigation', { name: 'Your location in PTown', exact: true }).getByText('Current: Friend 2 Friend', { exact: true })).toBeVisible();
  await page.goto('/search?q=friend&filter=Sections');
  await page.getByRole('link', { name: 'Open Friend 2 Friend', exact: true }).click();
  await expect(page).toHaveURL('/friends');
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
});

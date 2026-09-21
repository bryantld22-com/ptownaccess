import { test, expect } from '@playwright/test';

const key = '@ptown/preview/v1';
const programs = [
  ['monday-jazz', 'Monday', 'Auditions for PTown'],
  ['tuesday-jazz', 'Tuesday', 'Musician Jam Session'],
  ['ptown-flow', 'Wednesday', 'PTown Flow Practice'],
  ['comedy', 'Thursday', 'Comedy Night'],
  ['rnb-blues', 'Friday', 'R&B & Blues'],
  ['blues-country', 'Saturday', 'Any Genre'],
  ['communion-sunday', 'Sunday', 'Communion Sunday'],
] as const;

test('Every event detail opens an invitation for the exact stable program without changing saved plans', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  const plans = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Private occasion', notes: 'Private notes', savedAt: '2026-09-21T00:00:00Z' }, membershipInterest: 'vip' };
  await page.goto('/'); await page.evaluate(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  for (const [id, day, title] of programs) {
    await page.goto(`/events/${id}`);
    const link = page.getByRole('link', { name: `Invite friends to ${title} →`, exact: true });
    await expect(link).toHaveAttribute('href', `/friends?program=${id}`);
    await link.click();
    await expect(page).toHaveURL(`/friends?program=${id}`);
    await expect(page.getByRole('radio', { name: `${day}: ${title}`, exact: true })).toHaveAttribute('aria-checked', 'true');
    await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(new RegExp(`${day} · ${title.replace(/[&]/g, '\\&')}`));
    await expect(page.getByRole('textbox', { name: 'Preferred invitation date (optional)', exact: true })).toHaveValue('');
    await expect(page.getByRole('textbox', { name: 'Estimated invitation group (optional)', exact: true })).toHaveValue('');
    expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  }
  expect(errors).toEqual([]);
});

test('Weekday guides hand off the visible program and invitation returns to the same guide', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  for (const [id, day, title] of programs) {
    await page.goto(`/visit?day=${day}`);
    await expect(page.getByRole('heading', { name: `${day} at PTown`, exact: true })).toBeVisible();
    const link = page.getByRole('link', { name: `Invite friends to ${title} →`, exact: true });
    await expect(link).toHaveAttribute('href', `/friends?program=${id}`);
    await link.click();
    await expect(page).toHaveURL(`/friends?program=${id}`);
    await page.getByRole('link', { name: `Explore the ${day} visit guide →`, exact: true }).click();
    await expect(page).toHaveURL(`/visit?day=${day}`);
    await expect(page.getByRole('button', { name: day, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
  expect(errors).toEqual([]);
});

test('Unknown weekdays recover to Monday and invitation entry points fit every screen', async ({ page }) => {
  await page.goto('/visit?day=unknown');
  await expect(page.getByRole('heading', { name: 'Monday at PTown', exact: true })).toBeVisible();
  const link = page.getByRole('link', { name: 'Invite friends to Auditions for PTown →', exact: true });
  await expect(link).toHaveAttribute('href', '/friends?program=monday-jazz');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const button = await link.boundingBox(); expect(button).not.toBeNull(); expect(button!.x + button!.width).toBeLessThanOrEqual(width + 1);
  }
  await link.click(); await expect(page).toHaveURL('/friends?program=monday-jazz');
  await expect(page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true })).toHaveValue('');
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
});

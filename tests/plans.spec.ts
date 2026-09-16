import { test, expect } from '@playwright/test';

const storageKey = '@ptown/preview/v1';
function futureDate() {
  const date = new Date(); date.setDate(date.getDate() + 7);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

test('Saved events persist, can be removed, and a failed write keeps existing plans', async ({ page }) => {
  await page.goto('/events/comedy');
  await page.getByRole('button', { name: 'Save this event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved event' })).toBeEnabled();
  await page.reload();
  await expect(page.getByRole('button', { name: 'Remove saved event' })).toBeEnabled();
  await page.getByRole('link', { name: 'View your saved plans' }).click();
  await expect(page.locator('a[href="/events/comedy"]:visible')).toBeVisible();
  await page.locator('a[href="/events/comedy"]:visible').click();
  await page.getByRole('button', { name: 'Remove saved event' }).click();
  await expect(page.getByRole('button', { name: 'Save this event', exact: true })).toBeEnabled();
  await page.getByRole('button', { name: 'Save this event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved event' })).toBeEnabled();

  await page.addInitScript(key => {
    const original = Storage.prototype.setItem;
    Storage.prototype.setItem = function (name, value) {
      if (name === key) throw new DOMException('Simulated storage full', 'QuotaExceededError');
      return original.call(this, name, value);
    };
  }, storageKey);
  await page.reload();
  await page.getByRole('button', { name: 'Remove saved event' }).click();
  await expect(page.getByRole('alert')).toContainText('Your previously saved plans have been kept');
  await expect(page.getByRole('button', { name: 'Remove saved event' })).toBeEnabled();
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).savedEventIds, storageKey)).toEqual(['comedy']);
});

test('Reservation drafts validate dates and guests, persist edits, and can be deleted', async ({ page }) => {
  await page.goto('/reservations');
  const date = page.getByRole('textbox', { name: 'Preferred date', exact: true });
  const guests = page.getByRole('textbox', { name: 'Number of guests', exact: true });
  const save = page.getByRole('button', { name: 'Save reservation draft', exact: true });
  await date.fill('2030-02-30'); await guests.fill('0'); await save.click();
  await expect(page.getByText('Choose a real calendar date.', { exact: true })).toBeVisible();
  await expect(page.getByText('Enter a whole number of guests from 1 to 999.', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  await date.fill('2000-01-01'); await guests.fill('4'); await save.click();
  await expect(page.getByText('Choose today or a future date.', { exact: true })).toBeVisible();
  await date.fill(futureDate());
  await page.getByRole('textbox', { name: 'Occasion (optional)', exact: true }).fill('Birthday dinner');
  await save.click();
  await expect(page.getByText('Draft saved on this device. No reservation has been placed.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(date).toHaveValue(futureDate()); await expect(guests).toHaveValue('4');
  await expect(page.getByRole('textbox', { name: 'Occasion (optional)', exact: true })).toHaveValue('Birthday dinner');
  await guests.fill('6'); await save.click();
  await expect(page.getByText('Draft saved on this device. No reservation has been placed.', { exact: true })).toBeVisible();
  await page.goto('/profile');
  await expect(page.getByText(`Preferred date: ${futureDate()}`, { exact: true })).toBeVisible();
  await expect(page.getByText(/6 guests · Birthday dinner/)).toBeVisible();
  await page.getByRole('link', { name: 'Edit reservation draft' }).click();
  await page.getByRole('button', { name: 'Delete reservation draft' }).click();
  await expect(page.getByText('Reservation draft deleted from this device.', { exact: true })).toBeVisible();
  await expect(date).toHaveValue('');
  await page.reload();
  await expect(page.getByRole('button', { name: 'Save reservation draft' })).toBeEnabled();
  await expect(date).toHaveValue('');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).reservationDraft, storageKey)).toBeNull();
});

test('Membership interest persists, clearing requires confirmation, and corrupt data can be reset', async ({ page }) => {
  await page.goto('/memberships');
  await page.getByRole('button', { name: 'Save my interest', exact: true }).click();
  await expect(page.getByRole('alert')).toHaveText('Choose an interest before saving.');
  await page.getByRole('radio', { name: 'VIP Society', exact: true }).click();
  await page.getByRole('button', { name: 'Save my interest', exact: true }).click();
  await expect(page.getByText('Interest saved on this device. You have not enrolled in a membership.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('radio', { name: 'VIP Society', exact: true })).toBeChecked();
  await page.goto('/profile');
  await expect(page.getByText('Interested in VIP Society', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear saved preview data' }).click();
  await page.getByRole('button', { name: 'Keep my plans' }).click();
  await expect(page.getByText('Interested in VIP Society', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Clear saved preview data' }).click();
  await page.getByRole('button', { name: 'Clear my saved plans' }).click();
  await expect(page.getByText('Saved preview data cleared from this device.', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
  await page.getByRole('link', { name: 'Explore membership interests' }).click();
  await expect(page.getByRole('radio', { name: 'VIP Society', exact: true })).not.toBeChecked();
  await page.evaluate(key => localStorage.setItem(key, '{invalid JSON'), storageKey);
  await page.goto('/profile');
  await expect(page.getByRole('alert')).toContainText('could not be read');
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBe('{invalid JSON');
  await page.getByRole('button', { name: 'Clear saved preview data' }).click();
  await page.getByRole('button', { name: 'Clear my saved plans' }).click();
  await expect(page.getByRole('alert')).toHaveCount(0);
  await expect(page.getByText('Your next evening starts here', { exact: true })).toBeVisible();
  expect(await page.evaluate(key => localStorage.getItem(key), storageKey)).toBeNull();
});

test('Impossible stored dates require recovery and past drafts remain editable', async ({ page }) => {
  await page.goto('/profile');
  const state = { version: 1, savedEventIds: ['comedy'], reservationDraft: { date: '2030-02-30', partySize: 2, occasion: '', savedAt: '2026-09-16T00:00:00Z' }, membershipInterest: null };
  await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: storageKey, state });
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('could not be read');
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!).savedEventIds, storageKey)).toEqual(['comedy']);
  state.reservationDraft.date = '2000-01-01';
  await page.evaluate(({ key, state }) => localStorage.setItem(key, JSON.stringify(state)), { key: storageKey, state });
  await page.reload();
  await expect(page.getByText('This preferred date has passed. Update your dinner draft.', { exact: true })).toBeVisible();
  await expect(page.locator('a[href="/events/comedy"]:visible')).toBeVisible();
  await page.goto('/plans');
  await expect(page.getByRole('textbox', { name: 'Preview plan summary', exact: true })).toHaveValue(/This preferred date has passed/);
  await page.getByRole('link', { name: 'Update dinner draft' }).click();
  await page.getByRole('textbox', { name: 'Preferred date', exact: true }).fill(futureDate());
  await page.getByRole('button', { name: 'Save reservation draft', exact: true }).click();
  await page.goto('/profile');
  await expect(page.getByText('This preferred date has passed. Update your dinner draft.', { exact: true })).toHaveCount(0);
});

import { test, expect } from '@playwright/test';

test('Dinner notes persist, edit, appear in review and backups, and survive failed saves', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/reservations');
  await page.getByRole('textbox', { name: 'Preferred date', exact: true }).fill('2030-08-11');
  const note = page.getByRole('textbox', { name: 'Dinner note (optional)', exact: true });
  await note.fill('  Vegetarian menu interest; birthday seating ideas.  ');
  await page.getByRole('button', { name: 'Save reservation draft', exact: true }).click();
  await expect(page.getByText('Draft saved on this device. No reservation has been placed.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(note).toHaveValue('Vegetarian menu interest; birthday seating ideas.');
  await page.goto('/profile');
  await expect(page.getByText('Dinner planning note', { exact: true })).toBeVisible();
  await expect(page.getByText(/Vegetarian menu interest; birthday seating ideas.*PTown has not received/)).toBeVisible();
  await page.goto('/plans');
  await expect(page.getByRole('textbox', { name: 'Preview plan summary', exact: true })).toHaveValue(/Dinner note: Vegetarian menu interest; birthday seating ideas\. \(planning only; not submitted\)/);
  await page.getByRole('link', { name: 'Back up or restore plans' }).click();
  const code = JSON.parse(await page.getByRole('textbox', { name: 'Your transfer code', exact: true }).inputValue());
  expect(code.plans.reservationDraft.notes).toBe('Vegetarian menu interest; birthday seating ideas.');
  await page.goto('/reservations');
  await note.fill('A quiet table idea for dinner with friends.');
  const old = await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'));
  await page.evaluate(() => { Storage.prototype.setItem = () => { throw new Error('Full storage'); }; });
  await page.getByRole('button', { name: 'Save reservation draft', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('previously saved plans have been kept');
  expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBe(old);
  await page.reload();
  await expect(note).toHaveValue('Vegetarian menu interest; birthday seating ideas.');
  await note.fill('A quiet table idea for dinner with friends.');
  await page.getByRole('button', { name: 'Save reservation draft', exact: true }).click();
  await expect(page.getByText('Draft saved on this device. No reservation has been placed.', { exact: true })).toBeVisible();
  await page.reload();
  await expect(note).toHaveValue('A quiet table idea for dinner with friends.');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  await note.fill('');
  await page.getByRole('button', { name: 'Save reservation draft', exact: true }).click();
  await expect(page.getByText('Draft saved on this device. No reservation has been placed.', { exact: true })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('@ptown/preview/v1')!).reservationDraft.notes)).toBeUndefined();
  await page.goto('/plans');
  await expect(page.getByRole('textbox', { name: 'Preview plan summary', exact: true })).not.toHaveValue(/Dinner note:/);
  expect(errors).toEqual([]);
});

test('Older drafts remain readable and invalid note transfers cannot replace saved plans', async ({ page }) => {
  await page.goto('/reservations');
  const legacy = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: [], reservationDraft: { date: '2030-08-11', partySize: 2, occasion: '', savedAt: '2026-09-16T00:00:00Z' }, membershipInterest: null };
  await page.evaluate(data => localStorage.setItem('@ptown/preview/v1', JSON.stringify(data)), legacy);
  await page.reload();
  const note = page.getByRole('textbox', { name: 'Dinner note (optional)', exact: true });
  await expect(note).toHaveValue('');
  await expect(note).toHaveAttribute('maxlength', '280');
  await note.fill('N'.repeat(280));
  await expect(page.getByText(/280\/280 characters/)).toBeVisible();
  await page.getByRole('button', { name: 'Save reservation draft', exact: true }).click();
  await expect(page.getByText('Draft saved on this device. No reservation has been placed.', { exact: true })).toBeVisible();
  const original = await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'));
  await page.goto('/backup');
  for (const invalid of [123, null, 'N'.repeat(281)]) {
    const code = JSON.stringify({ app: 'PTown Access', format: 1, plans: { ...legacy, reservationDraft: { ...legacy.reservationDraft, notes: invalid } } });
    await page.getByRole('textbox', { name: 'Paste a transfer code', exact: true }).fill(code);
    await page.getByRole('button', { name: 'Review transfer code', exact: true }).click();
    await expect(page.getByRole('alert')).toContainText('transfer code could not be read');
    await expect(page.getByRole('button', { name: 'Replace this device’s plans', exact: true })).toHaveCount(0);
    expect(await page.evaluate(() => localStorage.getItem('@ptown/preview/v1'))).toBe(original);
  }
  await page.evaluate(data => localStorage.setItem('@ptown/preview/v1', JSON.stringify({ ...data, reservationDraft: { ...data.reservationDraft, notes: 123 } })), legacy);
  await page.reload();
  await expect(page.getByRole('alert')).toContainText('could not be read');
  await expect(page.getByRole('button', { name: 'Copy transfer code', exact: true })).toHaveCount(0);
});

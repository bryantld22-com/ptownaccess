import { test, expect } from '@playwright/test';

test.use({ timezoneId: 'America/Los_Angeles' });

test('Visit guide covers every day, keeps weekday links, and exposes clear answers', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.getByRole('link', { name: 'Plan your visit' }).click();
  await expect(page.getByRole('heading', { name: 'Plan your visit.', exact: true })).toBeVisible();
  const programs = page.getByRole('link').and(page.locator('a[href^="/events/"]'));
  const ids = ['monday-jazz', 'tuesday-jazz', 'ptown-flow', 'comedy', 'rnb-blues', 'blues-country', 'communion-sunday'];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  for (const [index, day] of days.entries()) {
    await page.getByRole('button', { name: day, exact: true }).click();
    await expect(page).toHaveURL(`/visit?day=${day}`);
    await expect(page.getByRole('button', { name: day, exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(programs).toHaveCount(1);
    await expect(programs).toHaveAttribute('href', `/events/${ids[index]}`);
    await expect(page.getByText(index >= 3 && index <= 5 ? 'A ticketed evening is planned' : 'Free program admission is planned', { exact: true })).toBeVisible();
    await expect(page.getByText('After the show', { exact: true })).toHaveCount(index === 4 || index === 5 ? 1 : 0);
    await expect(page.getByRole('link', { name: `Browse ${day} programs` })).toHaveAttribute('href', `/events?day=${day}`);
  }
  await page.reload();
  await expect(page.getByRole('button', { name: 'Sunday', exact: true })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByText(/Gospel jazz brunch is planned/)).toBeVisible();
  await page.getByRole('link', { name: 'Browse Sunday programs' }).click();
  await expect(page).toHaveURL('/events?day=Sunday');
  await expect(programs).toHaveAttribute('href', '/events/communion-sunday');
  await page.goto('/visit?day=invalid');
  await expect(page.getByRole('button', { name: 'Monday', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const question = page.getByRole('button', { name: 'Is food included with admission?', exact: true });
  await expect(question).toHaveAttribute('aria-expanded', 'false');
  await question.click();
  await expect(question).toHaveAttribute('aria-expanded', 'true');
  await expect(page.getByText(/it does not mean meals are free/)).toBeVisible();
  await page.getByRole('button', { name: 'Is a dinner draft a reservation?', exact: true }).click();
  await expect(question).toHaveAttribute('aria-expanded', 'false');
  await expect(page.getByText(/No table is held/)).toBeVisible();
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  expect(errors).toEqual([]);
});

test('Dinner draft links use the local weekday and visit browsing preserves all saved plans', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('/profile');
  const saved = { version: 1, savedEventIds: ['comedy'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 4, occasion: 'Birthday', savedAt: '2026-09-16T00:00:00.000Z' }, membershipInterest: 'vip' };
  await page.evaluate(data => localStorage.setItem('@ptown/preview/v1', JSON.stringify(data)), saved);
  await page.reload();
  await page.getByRole('link', { name: 'Plan your visit' }).click();
  await expect(page).toHaveURL('/visit?day=Sunday');
  await expect(page.getByText('2030-08-11 · 4 guests · Sunday', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Friday', exact: true }).click();
  await page.getByRole('button', { name: 'Use my Sunday draft', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Sunday', exact: true })).toHaveAttribute('aria-pressed', 'true');
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('@ptown/preview/v1')!))).toEqual(saved);
  await page.evaluate(() => {
    const data = JSON.parse(localStorage.getItem('@ptown/preview/v1')!); data.reservationDraft.date = '2000-01-01'; localStorage.setItem('@ptown/preview/v1', JSON.stringify(data));
  });
  await page.reload();
  await expect(page.getByText('This preferred date has passed. Update your dinner draft.', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Update dinner draft' }).click();
  await expect(page).toHaveURL('/reservations');
  await expect(page.getByRole('textbox', { name: 'Preferred date', exact: true })).toHaveValue('2000-01-01');
  expect(errors).toEqual([]);
});

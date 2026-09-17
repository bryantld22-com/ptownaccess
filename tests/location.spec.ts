import { test, expect } from '@playwright/test';

test('Detail location links open the correct weekday and creative division without changing saved plans', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  const location = () => page.getByRole('navigation', { name: 'Your location in PTown' });
  await page.goto('/events/comedy');
  await page.getByRole('button', { name: 'Save this event', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved event', exact: true })).toBeVisible();
  await page.goto('/programs/heritage-tour');
  await page.getByRole('button', { name: 'Save this creative interest', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Remove saved interest', exact: true })).toBeVisible();
  const before = await page.evaluate(() => JSON.stringify(localStorage));
  for (const [id, day] of [
    ['monday-jazz', 'Monday'], ['tuesday-jazz', 'Tuesday'], ['ptown-flow', 'Wednesday'],
    ['comedy', 'Thursday'], ['rnb-blues', 'Friday'], ['blues-country', 'Saturday'], ['communion-sunday', 'Sunday'],
  ]) {
    await page.goto(`/events/${id}`);
    await page.reload();
    await expect(location()).toContainText(`· ${day}`);
    await location().getByRole('link', { name: `${day} programs`, exact: true }).click();
    await expect(page).toHaveURL(`/events?day=${day}`);
    await expect(page.locator('a[href^="/events/"]:visible')).toHaveCount(1);
    await expect(page.getByRole('button', { name: day, exact: true })).toHaveAttribute('aria-pressed', 'true');
  }
  for (const [id, division, route] of [
    ['heritage-tour', 'Save the Arts', '/save-the-arts'],
    ['live-production', 'Artist Development', '/artist-development'],
    ['behind-the-build', 'Media', '/media'],
  ]) {
    await page.goto(`/programs/${id}`);
    await location().getByRole('link', { name: division, exact: true }).click();
    await expect(page).toHaveURL(route);
    await page.goBack();
    await location().getByRole('link', { name: 'Creative library', exact: true }).click();
    await expect(page).toHaveURL('/creative');
  }
  expect(await page.evaluate(() => JSON.stringify(localStorage))).toBe(before);
  expect(errors).toEqual([]);
});

test('Location labels fit small screens, mark the current page, and recover from unknown links', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(`${page.url()}: ${error.message}`));
  const location = () => page.getByRole('navigation', { name: 'Your location in PTown' });
  await page.goto('/');
  await expect(location()).toHaveCount(0);
  for (const [route, label] of [
    ['/events', 'Events'], ['/tickets', 'Tickets'], ['/vip', 'VIP'], ['/reservations', 'Reservations'],
    ['/plans', 'Plan review'], ['/backup', 'Plan backup'], ['/compare', 'Program comparison'],
    ['/programs/culinary-development', 'Culinary Artist Development'],
    ['/events/tuesday-jazz', 'Musician Jam Session · Tuesday'],
  ]) {
    await page.setViewportSize({ width: 320, height: 844 });
    await page.goto(route);
    await expect(location().locator('[aria-current="page"]')).toHaveText(`Current: ${label}`);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  }
  for (const route of ['/missing-section', '/events/missing-program', '/programs/missing-pathway', '/unknown/nested/page']) {
    await page.goto(route);
    await expect(location()).toContainText('Current: Link unavailable');
    await location().getByRole('link', { name: 'PTown', exact: true }).click();
    await expect(page).toHaveURL('/ptown');
  }
  expect(errors).toEqual([]);
});

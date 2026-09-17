import { test, expect, type Page } from '@playwright/test';

const key = '@ptown/preview/v1';
const title = 'Join me at PTown — invitation preview';
const handedOff = 'Invitation preview handed to your device’s sharing tools. Delivery and attendance are not confirmed.';
type ShareHarness = { behavior: string; calls: { title: string; text: string }[]; finish?: () => void };

async function setupSharing(page: Page) {
  await page.addInitScript(() => {
    const state = window as unknown as ShareHarness;
    state.behavior = 'success'; state.calls = [];
    Object.defineProperty(navigator, 'share', { configurable: true, value: async (data: { title: string; text: string }) => {
      state.calls.push(data);
      if (state.behavior === 'cancel') throw new DOMException('Canceled', 'AbortError');
      if (state.behavior === 'fail') throw new Error('Unavailable');
      if (state.behavior === 'pending') await new Promise<void>(resolve => { state.finish = resolve; });
    } });
  });
}

test('Sharing requires explicit action and hands off exactly the reviewed invitation without private plans or a URL', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await setupSharing(page);
  const plans = { version: 1, savedEventIds: ['tuesday-jazz'], savedPathwayIds: ['heritage-tour'], reservationDraft: { date: '2030-08-11', partySize: 8, occasion: 'Private occasion', notes: 'Private dinner notes', savedAt: '2026-09-17T00:00:00Z' }, membershipInterest: 'vip' };
  await page.addInitScript(({ key, plans }) => localStorage.setItem(key, JSON.stringify(plans)), { key, plans });
  await page.goto('/friends?program=tuesday-jazz&interest=music');
  await page.getByRole('textbox', { name: 'Preferred invitation date (optional)', exact: true }).fill('2030-08-13');
  await page.getByRole('textbox', { name: 'Estimated invitation group (optional)', exact: true }).fill('4');
  await page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true }).fill('Let’s discuss this idea.');
  const text = await page.getByRole('textbox', { name: 'Invitation preview', exact: true }).inputValue();
  expect(text).toContain('No invitation or friend request has been sent through PTown Access.');
  for (const privateText of ['2030-08-11', 'Private occasion', 'Private dinner notes', 'VIP Society']) expect(text).not.toContain(privateText);
  expect(await page.evaluate(() => (window as unknown as ShareHarness).calls)).toEqual([]);
  const share = page.getByRole('button', { name: 'Share invitation preview', exact: true });
  await share.focus(); await share.press('Enter');
  await expect(page.getByText(handedOff, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => (window as unknown as ShareHarness).calls)).toEqual([{ title, text }]);
  expect(await page.evaluate(key => JSON.parse(localStorage.getItem(key)!), key)).toEqual(plans);
  expect(new URL(page.url()).searchParams.has('date')).toBe(false);
  await page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true }).fill('Changed draft');
  await expect(page.getByText(handedOff, { exact: true })).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('Canceled and failed sharing preserve the invitation and never leave stale success feedback', async ({ page }) => {
  await setupSharing(page); await page.goto('/friends?program=blues-country');
  await page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true }).fill('Keep this note');
  const preview = page.getByRole('textbox', { name: 'Invitation preview', exact: true });
  const text = await preview.inputValue();
  const share = page.getByRole('button', { name: 'Share invitation preview', exact: true });
  await share.click(); await expect(page.getByText(handedOff, { exact: true })).toBeVisible();
  await page.evaluate(() => { (window as unknown as ShareHarness).behavior = 'cancel'; });
  await share.click();
  await expect(page.getByText('Sharing canceled. Your invitation draft is unchanged.', { exact: true })).toBeVisible();
  await expect(page.getByText(handedOff, { exact: true })).toHaveCount(0);
  await expect(page.getByRole('alert')).toHaveCount(0); await expect(preview).toHaveValue(text);
  await page.evaluate(() => { (window as unknown as ShareHarness).behavior = 'fail'; });
  await share.click();
  await expect(page.getByRole('alert')).toHaveText('Sharing is unavailable. Copy the invitation preview or select its text instead.');
  await expect(page.getByText(handedOff, { exact: true })).toHaveCount(0);
  await expect(page.getByText('Sharing canceled. Your invitation draft is unchanged.', { exact: true })).toHaveCount(0);
  await expect(preview).toHaveValue(text);
  expect(await page.evaluate(key => localStorage.getItem(key), key)).toBeNull();
});

test('Invalid group details block both exports and pending sharing locks the reviewed draft on every screen', async ({ page }) => {
  await setupSharing(page); await page.goto('/friends?program=tuesday-jazz');
  const date = page.getByRole('textbox', { name: 'Preferred invitation date (optional)', exact: true });
  const group = page.getByRole('textbox', { name: 'Estimated invitation group (optional)', exact: true });
  const note = page.getByRole('textbox', { name: 'Personal invitation note (optional)', exact: true });
  const share = page.getByRole('button', { name: 'Share invitation preview', exact: true });
  await date.fill('2030-02-30');
  await expect(share).toBeDisabled(); await expect(page.getByRole('button', { name: 'Copy invitation preview', exact: true })).toBeDisabled();
  await date.fill('2030-08-13'); await group.fill('0'); await expect(share).toBeDisabled();
  expect(await page.evaluate(() => (window as unknown as ShareHarness).calls)).toEqual([]);
  await group.fill('3'); await note.fill('Reviewed note');
  await page.evaluate(() => { (window as unknown as ShareHarness).behavior = 'pending'; });
  const text = await page.getByRole('textbox', { name: 'Invitation preview', exact: true }).inputValue();
  await share.click();
  await expect(share).toBeDisabled(); await expect(page.getByRole('button', { name: 'Working…', exact: true })).toBeDisabled();
  for (const field of [date, group, note]) await expect(field).toHaveAttribute('readonly', '');
  await expect(page.getByRole('button', { name: 'Clear group details', exact: true })).toBeDisabled();
  await expect(page.getByRole('radio', { name: 'Saturday: Any Genre', exact: true })).toHaveAttribute('aria-disabled', 'true');
  for (const width of [320, 390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    expect(await share.evaluate(element => {
      const button = element.getBoundingClientRect(); const row = element.parentElement!.getBoundingClientRect();
      return button.left >= row.left - 1 && button.right <= row.right + 1;
    })).toBe(true);
  }
  expect(await page.evaluate(() => (window as unknown as ShareHarness).calls)).toEqual([{ title, text }]);
  await page.evaluate(() => { (window as unknown as ShareHarness).finish!(); });
  await expect(page.getByText(handedOff, { exact: true })).toBeVisible();
  await expect(share).toBeEnabled(); await expect(note).not.toHaveAttribute('readonly', '');
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(text);
});

test('Unsupported sharing keeps copy and selectable-text fallbacks without hydration errors', async ({ page }) => {
  const errors: string[] = []; page.on('pageerror', error => errors.push(error.message));
  await page.addInitScript(() => Object.defineProperty(navigator, 'share', { configurable: true, value: undefined }));
  await page.goto('/friends');
  await expect(page.getByText('Sharing tools are not available in this browser. Copy the preview or select its text to share it yourself.', { exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Share invitation preview', exact: true })).toHaveCount(0);
  const copy = page.getByRole('button', { name: 'Copy invitation preview', exact: true }); await expect(copy).toBeEnabled();
  await page.evaluate(() => Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText: async () => { throw new Error('Denied'); } } }));
  await copy.click();
  await expect(page.getByRole('alert')).toHaveText('Copy is unavailable. Select the invitation preview below and copy it manually.');
  await expect(page.getByRole('textbox', { name: 'Invitation preview', exact: true })).toHaveValue(/JOIN ME AT PTOWN/);
  expect(errors).toEqual([]);
});

import { test, expect } from '@playwright/test';
import { mockApi } from '../helpers/ui';

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  process.env.E2E_BASE_URL ||
  process.env.BASE_URL ||
  'http://127.0.0.1:5173';

async function prepareJournal(page, language = 'en', route = '/Journal') {
  await mockApi(page);
  await page.addInitScript(({ language }) => {
    localStorage.setItem('language', language);
    localStorage.setItem('i18nextLng', language);
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  }, { language });

  await page.goto(BASE_URL + route, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page.getByTestId(route === '/Journal' ? 'journal-page' : 'journal-dashboard')).toBeVisible({ timeout: 20000 });
}

test.describe('Journal responsive experience', () => {
  test.beforeEach(async ({ page }) => {
    await prepareJournal(page);
  });

  test('keeps every primary tool visible and closes each overlay with Escape', async ({ page }) => {
    for (const name of [/AI Insights/i, /AI prompts/i, /Reminders/i, /Templates/i]) {
      const button = page.getByRole('button', { name }).first();
      await expect(button).toBeVisible();
      await button.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(dialog).toBeHidden();
    }
  });

  test('has no page-level horizontal overflow at phone, tablet and desktop widths', async ({ page }) => {
    for (const viewport of [
      { width: 360, height: 780 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 }
    ]) {
      await page.setViewportSize(viewport);
      const sizes = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      expect(sizes.scrollWidth).toBeLessThanOrEqual(sizes.clientWidth + 2);
      await expect(page.getByRole('button', { name: /Progress/i })).toBeVisible();
    }
  });

  test('keeps overlays within a small phone viewport', async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.getByRole('button', { name: /Templates/i }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    const box = await dialog.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(0);
    expect(box!.x + box!.width).toBeLessThanOrEqual(362);
    expect(box!.height).toBeLessThanOrEqual(642);
  });
});

test('Journal dashboard is responsive and localised', async ({ page }) => {
  await prepareJournal(page, 'en', '/JournalDashboard');
  await expect(page.getByRole('heading', { name: /Journal Progress/i })).toBeVisible();
  for (const viewport of [
    { width: 360, height: 780 },
    { width: 768, height: 1024 },
    { width: 1440, height: 900 }
  ]) {
    await page.setViewportSize(viewport);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(2);
  }
});

test('Journal renders Hebrew copy and RTL direction', async ({ page }) => {
  await prepareJournal(page, 'he');
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.getByRole('button', { name: /התקדמות/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /תזכורות/ })).toBeVisible();
  await expect(page.getByRole('button', { name: /תבניות/ })).toBeVisible();
});

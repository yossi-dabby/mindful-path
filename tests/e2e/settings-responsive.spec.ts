import { test, expect } from '@playwright/test';
import { mockApi } from '../helpers/ui';

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  process.env.E2E_BASE_URL ||
  process.env.BASE_URL ||
  'http://127.0.0.1:5173';

async function prepareSettings(page, language = 'en', viewport = { width: 390, height: 844 }) {
  await page.setViewportSize(viewport);
  await mockApi(page);
  await page.addInitScript(({ language }) => {
    localStorage.setItem('language', language);
    localStorage.setItem('i18nextLng', language);
    localStorage.setItem('age_verified', 'true');
    localStorage.setItem('chat_consent_accepted', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  }, { language });

  await page.goto(BASE_URL + '/Settings', { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page.getByTestId('settings-hero')).toBeVisible({ timeout: 20000 });
}

test.describe('Premium settings and mobile menu', () => {
  test('Settings has no horizontal overflow on mobile, tablet and desktop', async ({ page }) => {
    await prepareSettings(page);

    for (const viewport of [
      { width: 360, height: 780 },
      { width: 768, height: 1024 },
      { width: 1440, height: 900 }
    ]) {
      await page.setViewportSize(viewport);
      const dimensions = await page.evaluate(() => ({
        documentWidth: document.documentElement.scrollWidth,
        viewportWidth: document.documentElement.clientWidth
      }));
      expect(dimensions.documentWidth).toBeLessThanOrEqual(dimensions.viewportWidth + 2);
    }
  });

  test('mobile menu exposes complete navigation and current-page state', async ({ page }) => {
    await prepareSettings(page);
    await page.getByTestId('mobile-menu-button').click();

    const drawer = page.getByTestId('mobile-drawer');
    await expect(drawer).toBeVisible();
    await expect(page.getByTestId('mobile-nav-community')).toBeVisible();
    await expect(page.getByTestId('mobile-nav-resources')).toBeVisible();
    await expect(page.getByTestId('mobile-nav-settings')).toHaveAttribute('aria-current', 'page');

    const box = await drawer.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.x).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width).toBeLessThanOrEqual(392);
  });

  test('Hebrew Settings is RTL and notification copy is fully localised', async ({ page }) => {
    await prepareSettings(page, 'he');

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByText('התראות בתוך האפליקציה')).toBeVisible();
    await expect(page.getByText('התראות בדוא״ל')).toBeVisible();
    await expect(page.getByText('Daily Check-in Reminders')).toHaveCount(0);
    await expect(page.getByText('Email Notifications', { exact: true })).toHaveCount(0);
  });

  test('upgrade action opens and closes the accessible Premium dialog', async ({ page }) => {
    await prepareSettings(page);
    await page.getByTestId('settings-upgrade-button').click();

    const paywall = page.getByTestId('premium-paywall');
    await expect(paywall).toBeVisible();
    await expect(paywall).toHaveAttribute('role', 'dialog');
    await expect(page.getByRole('heading', { name: 'Unlock Premium' })).toBeVisible();

    await page.getByRole('button', { name: 'Close Premium offer' }).click();
    await expect(paywall).not.toBeVisible();
  });

  test('quick navigation keeps large touch targets on mobile', async ({ page }) => {
    await prepareSettings(page);
    const buttons = page.getByTestId('settings-quick-nav').getByRole('button');
    await expect(buttons.first()).toBeVisible();

    const count = await buttons.count();
    expect(count).toBeGreaterThanOrEqual(6);
    for (let index = 0; index < count; index += 1) {
      const box = await buttons.nth(index).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(43);
    }
  });
});

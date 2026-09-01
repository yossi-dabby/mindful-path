import { test, expect, type Page } from '@playwright/test';
import { mockApi } from '../helpers/ui';

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  process.env.E2E_BASE_URL ||
  process.env.BASE_URL ||
  'http://127.0.0.1:5173';

async function prepareHome(page: Page, language = 'he', viewport = { width: 390, height: 844 }) {
  await page.setViewportSize(viewport);
  await page.addInitScript(({ language }) => {
    localStorage.setItem('language', language);
    localStorage.setItem('i18nextLng', language);
    localStorage.setItem('age_verified', 'true');
    localStorage.setItem('chat_consent_accepted', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  }, { language });

  await mockApi(page);
  await page.goto(`${BASE_URL}/Home`, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await expect(page.getByTestId('recommended-action')).toBeVisible({ timeout: 20000 });
}

test.describe('Premium Home recommendations', () => {
  test('opens a fully localized, keyboard-accessible Hebrew experience', async ({ page }) => {
    await prepareHome(page);

    await page.getByTestId('recommended-action').focus();
    await page.keyboard.press('Enter');

    const dialog = page.getByTestId('recommendations-dialog');
    await expect(dialog).toBeVisible();
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(dialog).toContainText('המלצות מותאמות אישית');
    await expect(page.getByTestId('recommendations-feed')).toBeVisible();
    await expect(page.getByTestId('recommendation-item')).toHaveCount(2);
    await expect(dialog).not.toContainText(/Recommended|Insights|Priority|Try again/);

    const refreshBox = await page.getByTestId('recommendations-refresh').boundingBox();
    expect(refreshBox).not.toBeNull();
    expect(refreshBox!.width).toBeGreaterThanOrEqual(47);
    expect(refreshBox!.height).toBeGreaterThanOrEqual(47);

    const firstRecommendation = page.getByTestId('recommendation-item').first();
    await firstRecommendation.focus();
    await expect(firstRecommendation).toBeFocused();

    await page.keyboard.press('Escape');
    await expect(dialog).not.toBeVisible();
  });

  test('keeps the path header and recommendations inside the viewport', async ({ page }) => {
    await prepareHome(page, 'he', { width: 1440, height: 900 });

    const pathToggle = page.getByTestId('starter-path-toggle');
    await expect(pathToggle).toBeVisible();
    const toggleBox = await pathToggle.boundingBox();
    const pathBox = await page.getByTestId('starter-path-quick-action').boundingBox();
    expect(toggleBox).not.toBeNull();
    expect(pathBox).not.toBeNull();
    expect(toggleBox!.x).toBeGreaterThanOrEqual(pathBox!.x);
    expect(toggleBox!.x + toggleBox!.width).toBeLessThanOrEqual(pathBox!.x + pathBox!.width + 1);
    expect(toggleBox!.width).toBeGreaterThanOrEqual(47);

    await page.getByTestId('recommended-action').click();
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
      await expect(page.getByTestId('recommendations-dialog')).toBeVisible();
    }
  });
});

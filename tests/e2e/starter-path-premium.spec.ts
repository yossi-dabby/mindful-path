import { test, expect, type Page, type Request } from '@playwright/test';
import { mockApi } from '../helpers/ui';

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  process.env.E2E_BASE_URL ||
  process.env.BASE_URL ||
  'http://127.0.0.1:5173';

type StarterPathRecord = {
  id: string;
  current_day: number;
  started_date: string;
  completed: boolean;
  day_exercises: Record<string, unknown>;
};

async function prepareStarterPath(
  page: Page,
  language = 'en',
  viewport = { width: 390, height: 844 }
) {
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

  let currentPath: StarterPathRecord = {
    id: 'starter-path-test-1',
    current_day: 4,
    started_date: '2026-08-28',
    completed: false,
    day_exercises: {
      1: { completed: true },
      2: { completed: true },
      3: { completed: true }
    }
  };
  const writes: Request[] = [];

  // Registered after the shared API mock so this route wins Playwright's LIFO order.
  await page.route('**/entities/StarterPath**', async (route) => {
    const request = route.request();
    const method = request.method();

    if (method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([currentPath])
      });
      return;
    }

    if (method === 'PATCH' || method === 'PUT') {
      writes.push(request);
      const payload = request.postDataJSON() as Partial<StarterPathRecord>;
      currentPath = { ...currentPath, ...payload };
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(currentPath)
      });
      return;
    }

    await route.fulfill({
      status: 405,
      contentType: 'application/json',
      body: JSON.stringify({ message: 'Unexpected StarterPath method in test: ' + method })
    });
  });

  await page.goto(BASE_URL + '/Home', { waitUntil: 'domcontentloaded', timeout: 30000 });
  const toggle = page.getByTestId('starter-path-toggle');
  await expect(toggle).toBeVisible({ timeout: 20000 });

  return { toggle, writes };
}

test.describe('Premium 7-day starter path drawer', () => {
  test('opens with accurate progress and remains responsive', async ({ page }) => {
    const { toggle } = await prepareStarterPath(page);
    await toggle.click();

    await expect(toggle).toHaveAttribute('aria-expanded', 'true');
    await expect(page.getByTestId('starter-path-panel')).toBeVisible();
    await expect(page.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
    await expect(page.getByTestId('starter-path-reset-button')).toBeVisible();

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

    await page.setViewportSize({ width: 360, height: 780 });
    for (const testId of ['starter-path-toggle', 'starter-path-primary-action', 'starter-path-reset-button']) {
      const box = await page.getByTestId(testId).boundingBox();
      expect(box).not.toBeNull();
      expect(box!.height).toBeGreaterThanOrEqual(43);
    }
  });

  test('confirms reset, updates in place and never deletes the path', async ({ page }) => {
    const starterPathMethods: string[] = [];
    page.on('request', (request) => {
      if (request.url().includes('/entities/StarterPath')) {
        starterPathMethods.push(request.method());
      }
    });

    const { toggle, writes } = await prepareStarterPath(page);
    await toggle.click();
    await page.getByTestId('starter-path-reset-button').click();

    const dialog = page.getByTestId('starter-path-reset-dialog');
    await expect(dialog).toBeVisible();
    await page.getByRole('button', { name: 'Keep my progress' }).click();
    await expect(dialog).not.toBeVisible();
    expect(writes).toHaveLength(0);

    await page.getByTestId('starter-path-reset-button').click();
    await page.getByTestId('starter-path-reset-confirm').click();

    await expect(page.getByTestId('starter-path-feedback')).toContainText('ready for day 1');
    expect(writes).toHaveLength(1);
    expect(writes[0].method()).toMatch(/PATCH|PUT/);
    expect(writes[0].postDataJSON()).toMatchObject({
      current_day: 1,
      completed: false,
      day_exercises: {}
    });
    expect(starterPathMethods).not.toContain('DELETE');
  });

  test('Hebrew reset experience is fully localised and RTL', async ({ page }) => {
    const { toggle } = await prepareStarterPath(page, 'he');
    await toggle.click();

    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
    await expect(page.getByTestId('starter-path-reset-button')).toContainText('איפוס המסלול');
    await page.getByTestId('starter-path-reset-button').click();
    await expect(page.getByTestId('starter-path-reset-dialog')).toContainText('להתחיל את המסלול מחדש?');
    await expect(page.getByTestId('starter-path-reset-dialog')).not.toContainText('Reset');
    await expect(page.getByTestId('starter-path-reset-dialog')).not.toContainText('Keep my progress');
  });
});

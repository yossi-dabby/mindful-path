import { test, expect, devices } from '@playwright/test';

/**
 * Pull-to-Refresh Gesture Tests
 *
 * Validates that the PullToRefresh component correctly handles touch gestures:
 * 1. Normal pull within MAX_PULL shows the indicator and "Release to refresh" text
 * 2. Fast pull that jumps past MAX_PULL in a single touchmove event is treated as a
 *    valid pull (the fix: previously such a swipe would be silently ignored)
 * 3. The main scroll container stays at scrollTop=0 during a pull gesture
 */

// Use a mobile device so that touch events fire and the PullToRefresh component activates
test.use({ ...devices['Pixel 5'] });

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

async function mockApis(page: import('@playwright/test').Page) {
  await page.route('**/api/apps/**', async (route) => {
    const url = route.request().url();
    if (url.includes('/public-settings/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'test-app-id', appId: 'test-app-id', appName: 'Test App', isPublic: true }),
      });
    } else if (url.includes('/entities/User')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-user-id',
          email: 'test@example.com',
          full_name: 'Test User',
          role: 'user',
          onboarding_completed: true,
          preferences: {},
        }),
      });
    } else {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
    }
  });

  await page.route('**/api/auth/**', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-user-id',
        email: 'test@example.com',
        full_name: 'Test User',
        role: 'user',
        onboarding_completed: true,
        preferences: {},
      }),
    });
  });

  await page.route('**/api/entities/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '[]' });
  });

  await page.route('**/analytics/**', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
  });

  await page.addInitScript(() => {
    document.body.setAttribute('data-test-env', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  });
}

/**
 * Dispatches touch events on the element at (x, y) to simulate a pull gesture.
 * @param page - Playwright page
 * @param startY - Starting Y coordinate (clientY of touchstart)
 * @param endY   - Ending Y coordinate (clientY of the single touchmove)
 */
async function simulatePull(
  page: import('@playwright/test').Page,
  startY: number,
  endY: number,
) {
  await page.evaluate(
    ([sx, ex]: [number, number]) => {
      const main = document.querySelector<HTMLElement>('#app-scroll-container');
      if (main) main.scrollTop = 0;

      const x = 200;
      const target = document.elementFromPoint(x, sx) ?? document.body;

      target.dispatchEvent(
        new TouchEvent('touchstart', {
          touches: [new Touch({ identifier: 1, target, clientX: x, clientY: sx })],
          bubbles: true,
          cancelable: true,
        }),
      );

      target.dispatchEvent(
        new TouchEvent('touchmove', {
          touches: [new Touch({ identifier: 1, target, clientX: x, clientY: ex })],
          bubbles: true,
          cancelable: true,
        }),
      );
    },
    [startY, endY] as [number, number],
  );
}

test.describe('PullToRefresh gesture handling', () => {
  test.beforeEach(async ({ page }) => {
    await mockApis(page);
    await page.goto(`${BASE_URL}/Home`, { waitUntil: 'domcontentloaded' });
    // Wait for the authenticated page content (PullToRefresh included) to be mounted,
    // not just the loading spinner.  #app-scroll-container is only populated once the
    // auth check completes and the real page tree renders.
    await page.waitForFunction(
      () => {
        const container = document.querySelector('#app-scroll-container');
        return container && container.children.length > 0;
      },
      { timeout: 10000 },
    );
  });

  test('pull indicator appears for distance within MAX_PULL', async ({ page }) => {
    // Pull 90px down — past PULL_THRESHOLD (80) but below MAX_PULL (120)
    await simulatePull(page, 200, 290);

    await expect(page.getByText('Release to refresh')).toBeVisible({ timeout: 4000 });
  });

  test('pull indicator appears even when distance exceeds MAX_PULL in a single touchmove', async ({ page }) => {
    // Fast swipe: jump directly to 150px — past MAX_PULL (120) in one event.
    // Before the fix the condition `distance < MAX_PULL` prevented state updates,
    // so isPulling was never set to true and the indicator never appeared.
    await simulatePull(page, 200, 350);

    await expect(page.getByText('Release to refresh')).toBeVisible({ timeout: 4000 });
  });

  test('main scroll container stays at scrollTop 0 during a pull gesture', async ({ page }) => {
    await simulatePull(page, 200, 350);

    const scrollTop = await page.evaluate(
      () => document.querySelector<HTMLElement>('#app-scroll-container')?.scrollTop ?? -1,
    );
    expect(scrollTop).toBe(0);
  });
});

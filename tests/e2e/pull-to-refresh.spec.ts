import { test, expect, devices } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

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

/**
 * Dispatches touch events directly on the PullToRefresh container to simulate a pull gesture.
 * Dispatching on the container itself (rather than a child via elementFromPoint) ensures
 * the registered event listeners always receive the events regardless of page load state.
 *
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
      // Dispatch directly on the PullToRefresh container so the registered
      // addEventListener listeners always fire, regardless of what child
      // element happens to be at the touch coordinates.
      const container = document.querySelector<HTMLElement>('[data-testid="pull-to-refresh"]');
      const target = container ?? document.elementFromPoint(x, sx) ?? document.body;

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
    await mockApi(page);
    await spaNavigate(page, '/Home');
    // Wait for the PullToRefresh container to be present in the DOM, which
    // confirms the component has mounted and its event listeners are registered.
    await page.waitForSelector('[data-testid="pull-to-refresh"]', { timeout: 10000 });
  });

  test('pull indicator appears for distance within MAX_PULL', async ({ page }) => {
    // Pull 90px down — past PULL_THRESHOLD (60) but below MAX_PULL (120)
    await simulatePull(page, 200, 290);

    await expect(page.getByText('Release to refresh')).toBeVisible({ timeout: 2000 });
  });

  test('pull indicator appears even when distance exceeds MAX_PULL in a single touchmove', async ({ page }) => {
    // Fast swipe: jump directly to 150px — past MAX_PULL (120) in one event.
    // Before the fix the condition `distance < MAX_PULL` prevented state updates,
    // so isPulling was never set to true and the indicator never appeared.
    await simulatePull(page, 200, 350);

    await expect(page.getByText('Release to refresh')).toBeVisible({ timeout: 2000 });
  });

  test('main scroll container stays at scrollTop 0 during a pull gesture', async ({ page }) => {
    await simulatePull(page, 200, 350);

    const scrollTop = await page.evaluate(
      () => document.querySelector<HTMLElement>('#app-scroll-container')?.scrollTop ?? -1,
    );
    expect(scrollTop).toBe(0);
  });
});

/**
 * back-navigation.spec.ts
 *
 * Verifies that browser back navigation (page.goBack()) works correctly across
 * multiple routes without causing blank screens or hydration loss.
 *
 * Test flow:
 *   1. Navigate to a sequence of routes.
 *   2. Use page.goBack() to traverse back.
 *   3. Assert that each page still renders a stable visible element.
 *
 * All API calls are mocked; no real network is required.
 * Read-only: no real data is created or modified.
 */

import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate, logFailedRequests } from '../helpers/ui';

/** Routes to traverse in order, then navigate back through. */
const NAVIGATION_SEQUENCE = [
  { path: '/',            name: 'Home',      selector: '#root' },
  { path: '/Resources',   name: 'Resources', selector: 'main h1' },
  { path: '/Goals',       name: 'Goals',     selector: 'main h1' },
  { path: '/Community',   name: 'Community', selector: 'main h1' },
];

test.describe('Back navigation — no blank screen / hydration loss', () => {
  test('page.goBack() traverses routes without blank screens', async ({ page }) => {
    test.setTimeout(120000);

    await page.addInitScript(() => {
      (window as any).__DISABLE_ANALYTICS__ = true;
      localStorage.setItem('age_verified', 'true');
    });

    await mockApi(page);
    const requestLogger = await logFailedRequests(page);

    try {
      // Step 1: Navigate forward through the sequence.
      for (const route of NAVIGATION_SEQUENCE) {
        await spaNavigate(page, route.path);
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

        const el = page.locator(route.selector).first();
        await expect(el).toBeVisible({ timeout: 15000 });
      }

      // Step 2: Navigate back through the sequence (skip the first entry since
      // there is nothing to go back to from the initial navigation).
      const reversedRoutes = [...NAVIGATION_SEQUENCE].reverse().slice(1);

      for (const route of reversedRoutes) {
        await page.goBack({ timeout: 15000, waitUntil: 'domcontentloaded' });
        await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

        // After going back, the app root must still be present — not blank.
        await expect(page.locator('#root')).toBeVisible({ timeout: 10000 });

        // The React app must still have children (hydrated, not blank shell).
        const hasChildren = await page.evaluate(() => {
          const root = document.querySelector('#root');
          return root ? root.children.length > 0 : false;
        });
        expect(hasChildren, `Page went blank after going back to ${route.name}`).toBe(true);
      }
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/back-navigation-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });
});

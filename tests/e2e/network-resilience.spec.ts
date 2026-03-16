/**
 * network-resilience.spec.ts
 *
 * Tests the app's resilience under adverse network conditions:
 *   Case 1 – Offline navigation: set offline after hydration and navigate to
 *             another route; app shell must still render (not blank) and no
 *             unhandled errors should appear in the console.
 *   Case 2 – Slow API: mock all /api/** requests with an artificial 2–3s delay
 *             and assert the app doesn't crash or hang.
 *
 * All API calls are mocked; no real network is required.
 * Read-only: no real data is created or modified.
 */

import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate, logFailedRequests } from '../helpers/ui';

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  process.env.BASE_URL ||
  'http://127.0.0.1:5173';

// ── Case 1: Offline navigation ───────────────────────────────────────────────

test.describe('Network resilience — offline navigation', () => {
  test('app shell remains visible after going offline and navigating', async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);

    await page.addInitScript(() => {
      (window as any).__DISABLE_ANALYTICS__ = true;
    });

    await mockApi(page);

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        !msg.text().includes('favicon') &&
        // Ignore expected React offline warnings
        !msg.text().includes('net::ERR_')
      ) {
        consoleErrors.push(msg.text());
      }
    });

    // Load the app and wait for hydration while online.
    await spaNavigate(page, '/');
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    // Verify the app shell is present before going offline.
    const root = page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10000 });

    // Simulate offline by setting the browser context offline.
    await context.setOffline(true);

    // Navigate to another route while offline (SPA routing should work).
    await spaNavigate(page, '/Resources');
    await page.waitForLoadState('domcontentloaded', { timeout: 15000 }).catch(() => {});

    // The app shell (#root) must still be visible — the page must not go blank.
    await expect(root).toBeVisible({ timeout: 10000 });

    // No unhandled JS errors from the app itself (network errors are expected
    // from the browser but should not cause unhandled promise rejections).
    const appErrors = consoleErrors.filter(
      (e) =>
        !e.includes('Failed to fetch') &&
        !e.includes('net::ERR_') &&
        !e.includes('NetworkError') &&
        !e.includes('Load failed')
    );
    if (appErrors.length > 0) {
      throw new Error(
        `Unexpected console errors during offline navigation:\n${appErrors.join('\n')}`
      );
    }
  });
});

// ── Case 2: Slow API ─────────────────────────────────────────────────────────

test.describe('Network resilience — slow API response', () => {
  test('app does not crash or hang with 2–3s API latency', async ({ page }) => {
    test.setTimeout(90000);

    await page.addInitScript(() => {
      (window as any).__DISABLE_ANALYTICS__ = true;
    });

    // Install a route handler that adds a 2–3s delay to all /api/** requests
    // before delegating to the standard mockApi behaviour.
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();

      // Never intercept JS/TS module files.
      if (/\.(js|jsx|ts|tsx|mjs|cjs)(\?.*)?$/.test(url)) {
        await route.continue();
        return;
      }

      // Artificial delay of 2–3 seconds to simulate a slow backend.
      const delay = 2000 + Math.floor(Math.random() * 1000);
      await new Promise<void>((resolve) => setTimeout(resolve, delay));

      // Return a safe empty response so the UI has something to work with.
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error' && !msg.text().includes('favicon')) {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate to the app root; note that networkidle will wait for the delayed
    // API calls so we cap it generously.
    await page.goto(`${BASE_URL}/`, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Wait for React hydration.
    await page.waitForFunction(
      () => {
        const root = document.querySelector('#root');
        return root && root.children.length > 0;
      },
      { timeout: 15000 }
    );

    // The app shell must still be present and visible.
    await expect(page.locator('#root')).toBeVisible({ timeout: 10000 });

    // No unhandled app errors (timeout errors from slow API are expected and
    // handled gracefully by the UI).
    const unhandledErrors = consoleErrors.filter(
      (e) =>
        !e.includes('timeout') &&
        !e.includes('Timeout') &&
        !e.includes('AbortError') &&
        !e.includes('cancelled') &&
        !e.includes('Failed to fetch')
    );
    if (unhandledErrors.length > 0) {
      throw new Error(
        `Unexpected console errors with slow API:\n${unhandledErrors.join('\n')}`
      );
    }
  });
});

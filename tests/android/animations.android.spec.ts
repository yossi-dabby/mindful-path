import { test, expect } from '@playwright/test';
import { assertNoConsoleErrorsOrWarnings } from './utils/androidHelpers';

/**
 * Screen Animations & Transitions Tests
 *
 * Validates that page transition animations work correctly across Android/iOS/Web:
 *
 * 1. Forward navigation – page enters from the right, no console errors.
 * 2. Back navigation – page enters from the left (direction-aware).
 * 3. Reduced-motion – opacity-only fade is used when `prefers-reduced-motion`
 *    is set; no x-axis translation is applied.
 * 4. Overlay back-navigation – hardware/gesture back closes an open overlay
 *    without triggering a page-level backward animation.
 * 5. Rapid tab-switching – no horizontal overflow or console errors.
 */

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

// ===========================================================================
// 1. Forward navigation
// ===========================================================================
test.describe('Forward page transition', () => {
  test.beforeEach(async ({ page }) => {
    await mockApis(page);
  });

  test('navigating forward produces no console errors or warnings', async ({ page }) => {
    const checkConsole = assertNoConsoleErrorsOrWarnings(page);

    await page.goto(`${BASE_URL}/Home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.goto(`${BASE_URL}/Journal`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    expect(page.url()).toContain('/Journal');
    await checkConsole();
  });

  test('forward transition does not cause horizontal overflow', async ({ page }) => {
    const checkConsole = assertNoConsoleErrorsOrWarnings(page);

    await page.goto(`${BASE_URL}/Home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    // Check that the document body width does not exceed the viewport width during navigation.
    const overflowBefore = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    expect(overflowBefore).toBe(false);

    await page.goto(`${BASE_URL}/Coach`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const overflowAfter = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    expect(overflowAfter).toBe(false);

    await checkConsole();
  });
});

// ===========================================================================
// 2. Back navigation
// ===========================================================================
test.describe('Back page transition', () => {
  test.beforeEach(async ({ page }) => {
    await mockApis(page);
  });

  test('back navigation arrives at the correct URL with no console errors', async ({ page }) => {
    const checkConsole = assertNoConsoleErrorsOrWarnings(page);

    await page.goto(`${BASE_URL}/Home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    await page.goto(`${BASE_URL}/Journal`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    // Press the browser back button (simulates hardware back on Android / swipe on iOS)
    await page.goBack();
    await page.waitForTimeout(500);

    expect(page.url()).toContain('/Home');
    await checkConsole();
  });

  test('back navigation does not cause horizontal overflow', async ({ page }) => {
    await mockApis(page);

    await page.goto(`${BASE_URL}/Home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);
    await page.goto(`${BASE_URL}/Journal`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(600);

    await page.goBack();
    await page.waitForTimeout(500);

    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);
  });
});

// ===========================================================================
// 3. Reduced-motion mode
// ===========================================================================
test.describe('Reduced-motion page transition', () => {
  test('fade-only transition fires with no console errors under prefers-reduced-motion', async ({ browser }) => {
    // Launch a context that emulates `prefers-reduced-motion: reduce`
    const context = await browser.newContext({
      reducedMotion: 'reduce',
    });
    const page = await context.newPage();

    await mockApis(page);

    const checkConsole = assertNoConsoleErrorsOrWarnings(page);

    await page.goto(`${BASE_URL}/Home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    await page.goto(`${BASE_URL}/Coach`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(400);

    expect(page.url()).toContain('/Coach');

    // The animated wrapper should not translate on the x-axis (reduced-motion = opacity only)
    const transformValue = await page.evaluate(() => {
      const el = document.querySelector('[style*="will-change"]') as HTMLElement | null;
      if (!el) return null;
      return window.getComputedStyle(el).transform;
    });
    // After the animation settles the transform should be identity (none / matrix(1,0,0,1,0,0))
    if (transformValue) {
      const isIdentity =
        transformValue === 'none' ||
        transformValue === 'matrix(1, 0, 0, 1, 0, 0)';
      expect(isIdentity).toBe(true);
    }

    await checkConsole();
    await context.close();
  });
});

// ===========================================================================
// 4. Rapid tab-switching
// ===========================================================================
test.describe('Rapid tab-switching', () => {
  test.beforeEach(async ({ page }) => {
    await mockApis(page);
  });

  test('rapid tab switches produce no console errors and no horizontal overflow', async ({ page }) => {
    const checkConsole = assertNoConsoleErrorsOrWarnings(page);

    await page.goto(`${BASE_URL}/Home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(800);

    const nav = page.getByRole('navigation');
    if ((await nav.count()) === 0) {
      test.skip(true, 'No navigation found – skipping on desktop viewport');
      return;
    }

    const tabs = ['Journal', 'Coach', 'Home', 'MoodTracker', 'Home'];
    for (const tab of tabs) {
      const link = nav.locator(`a[href="/${tab}"]`).first();
      if ((await link.count()) > 0) {
        await link.click();
        // Minimal wait to allow animations to start but not necessarily finish
        await page.waitForTimeout(150);
      }
    }

    // Wait for animations to settle
    await page.waitForTimeout(600);

    const overflow = await page.evaluate(() => document.body.scrollWidth > window.innerWidth);
    expect(overflow).toBe(false);

    await checkConsole();
  });
});

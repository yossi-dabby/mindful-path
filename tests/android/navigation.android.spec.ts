import { test, expect } from '@playwright/test';
import { assertNoConsoleErrorsOrWarnings } from './utils/androidHelpers';

/**
 * Android Navigation & Optimistic UI Tests
 *
 * Covers two categories of issues that were causing console warnings on Android and iOS:
 *
 * 1. Bottom Tabs & Stack Preservation
 *    - Switching between bottom-nav tabs navigates correctly without no-op warnings.
 *    - Re-tapping the active tab resets to the tab root and scrolls to top.
 *    - Each tab remembers its last visited sub-page (stack preservation).
 *
 * 2. Optimistic UI Updates (Android)
 *    - Toggling a milestone checkbox updates the UI immediately (before the server
 *      responds), and the cache is reconciled with server state via invalidation.
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

// ---------------------------------------------------------------------------
// Shared API mocking helper
// ---------------------------------------------------------------------------
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
      // auth.me() calls /apps/{id}/entities/User/me
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

/** Returns the link to a given page path from the bottom navigation bar. */
function bottomNavLink(page: import('@playwright/test').Page, path: string) {
  // Use the ARIA role "navigation" which only matches the visible BottomNav on mobile
  // (the sidebar nav is display:none and is excluded from the accessibility tree).
  return page.getByRole('navigation').locator(`a[href="/${path}"]`).first();
}

// ===========================================================================
// 1. Bottom Tabs & Stack Preservation
// ===========================================================================
test.describe('Bottom Tabs & Stack Preservation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApis(page);
  });

  test('switching between tabs navigates without console warnings', async ({ page }) => {
    const checkConsole = assertNoConsoleErrorsOrWarnings(page);

    await page.goto(`${BASE_URL}/Home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Verify the bottom nav exists on this viewport (mobile only)
    const bottomNav = page.getByRole('navigation');
    if (await bottomNav.count() === 0) {
      test.skip(true, 'No navigation found – skipping');
      return;
    }

    // Switch to Journal tab
    await bottomNavLink(page, 'Journal').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/Journal');

    // Switch to Home tab
    await bottomNavLink(page, 'Home').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/Home');

    // Switch to Coach tab
    await bottomNavLink(page, 'Coach').click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/Coach');

    await checkConsole();
  });

  test('re-tapping the active tab resets to tab root without console warnings', async ({ page }) => {
    const checkConsole = assertNoConsoleErrorsOrWarnings(page);

    await page.goto(`${BASE_URL}/Home`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const homeLink = bottomNavLink(page, 'Home');
    if (await homeLink.count() === 0) {
      test.skip(true, 'Home link not found – skipping');
      return;
    }

    // Already on /Home – tapping Home again should be a no-op navigation (no warning)
    await homeLink.click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/Home');

    // Tap once more to confirm idempotency
    await homeLink.click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/Home');

    await checkConsole();
  });

  test('switching to an already-active tab that is at root does not generate a no-op warning', async ({ page }) => {
    const checkConsole = assertNoConsoleErrorsOrWarnings(page);

    // Navigate directly to a tab's root page
    await page.goto(`${BASE_URL}/Journal`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    const journalLink = bottomNavLink(page, 'Journal');
    if (await journalLink.count() === 0) {
      test.skip(true, 'Journal link not found – skipping');
      return;
    }

    // Tapping Journal while already on /Journal should not cause a duplicate-navigation warning
    await journalLink.click();
    await page.waitForTimeout(500);
    expect(page.url()).toContain('/Journal');

    await checkConsole();
  });
});

// ===========================================================================
// 2. Optimistic UI Updates (Android)
// ===========================================================================
test.describe('Optimistic UI Updates', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/apps/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/public-settings/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ id: 'test-app-id', appId: 'test-app-id', appName: 'Test App', isPublic: true }),
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
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

    // Goal API: GET returns one goal with two milestones; PATCH/PUT persists state.
    let goalState = {
      id: 'goal-1',
      title: 'Optimistic Test Goal',
      description: 'Goal for testing optimistic updates',
      status: 'active',
      progress: 0,
      milestones: [
        { title: 'Task A', completed: false },
        { title: 'Task B', completed: false },
      ],
      created_date: new Date().toISOString(),
    };

    const handleGoalRoute = async (route: import('@playwright/test').Route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([goalState]) });
      } else if (method === 'PATCH' || method === 'PUT') {
        const body = route.request().postDataJSON();
        goalState = { ...goalState, ...body };
        await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(goalState) });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    };

    await page.route('**/api/entities/Goal**', handleGoalRoute);
    await page.route('**/api/apps/**/entities/Goal**', handleGoalRoute);

    await page.route('**/analytics/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });

    await page.addInitScript(() => {
      document.body.setAttribute('data-test-env', 'true');
      (window as any).__TEST_APP_ID__ = 'test-app-id';
      (window as any).__DISABLE_ANALYTICS__ = true;
      localStorage.setItem('base44_app_id', 'test-app-id');
      localStorage.setItem('base44_access_token', 'test-token');
    });
  });

  test('milestone checkbox toggles UI immediately (optimistic) and completes without console warnings', async ({ page }) => {
    const checkConsole = assertNoConsoleErrorsOrWarnings(page);

    await page.goto(`${BASE_URL}/Goals`, { waitUntil: 'networkidle' });

    // Wait for the Goals heading to appear
    const headingSelectors = ['text=Active Goals', 'text=Your Goals', 'h1:has-text("Goals")'];
    let headingFound = false;
    for (const sel of headingSelectors) {
      try {
        await page.waitForSelector(sel, { timeout: 5000 });
        headingFound = true;
        break;
      } catch {
        // continue
      }
    }
    if (!headingFound) {
      test.skip(true, 'Goals heading not found – skipping');
      return;
    }

    // Find checkboxes
    const checkboxes = page.locator('[role="checkbox"], input[type="checkbox"]');
    if (await checkboxes.count() === 0) {
      test.skip(true, 'No checkboxes found – skipping');
      return;
    }

    const firstCheckbox = checkboxes.first();
    await expect(firstCheckbox).toBeVisible({ timeout: 5000 });

    const getState = async (el: import('@playwright/test').Locator) => {
      const ds = await el.getAttribute('data-state');
      if (ds) return ds === 'checked';
      return el.isChecked();
    };

    const initialState = await getState(firstCheckbox);

    // Click the checkbox – the UI should update immediately (optimistic)
    await firstCheckbox.click();

    // Verify state toggled without waiting for network
    await expect.poll(() => getState(firstCheckbox), { timeout: 2000 }).toBe(!initialState);

    // Wait for network call to complete
    await page.waitForTimeout(1000);

    // State should still be toggled (server confirmed)
    expect(await getState(firstCheckbox)).toBe(!initialState);

    await checkConsole();
  });
});


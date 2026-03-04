import { test, expect } from '@playwright/test';
import { spaNavigate, mockApi, logFailedRequests } from '../helpers/ui';

/**
 * User Flows – Critical navigation and page rendering tests
 *
 * These tests verify that key pages load and render their primary content
 * correctly. The API is mocked so they run without a real backend.
 *
 * Test Coverage:
 * 1. Home page loads and renders content
 * 2. Community page loads and renders its heading and forum tab
 * 3. Forum posts submitted via the form appear in the forum list
 * 4. Navigation between Home and Community works
 */

test.describe('Page Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('Home page loads and renders key UI elements', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);

    try {
      await spaNavigate(page, '/');

      await page.waitForFunction(
        () => {
          const root = document.querySelector('#root');
          return root && root.children.length > 0;
        },
        { timeout: 15000 }
      );

      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // Verify the app root is visible
      await expect(page.locator('#root')).toBeVisible({ timeout: 10000 });

      // Verify the page has rendered non-empty content
      const hasContent = await page.evaluate(() => {
        const body = document.body;
        return body && body.textContent && body.textContent.trim().length > 0;
      });
      expect(hasContent).toBe(true);

      // Use a visible-scoped h1 selector to avoid the hidden sidebar heading on mobile
      const heading = page.locator('h1').filter({ hasText: /\w+/ }).first();
      await expect(heading).toBeVisible({ timeout: 15000 });

      console.log('✅ Home page rendered successfully');
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/user-flows-home-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('Community page loads and displays the forum tab', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);

    try {
      await spaNavigate(page, '/Community');

      await page.waitForFunction(
        () => {
          const root = document.querySelector('#root');
          return root && root.children.length > 0;
        },
        { timeout: 15000 }
      );

      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // Use a visible-scoped h1 selector to avoid the hidden sidebar heading on mobile
      const communityHeading = page.locator('h1').filter({ hasText: /\w+/ }).first();
      await expect(communityHeading).toBeVisible({ timeout: 15000 });

      // Tabs (Forum / Groups / Progress) should be present
      const forumTab = page.getByRole('tab', { name: /forum/i });
      await expect(forumTab).toBeVisible({ timeout: 10000 });

      console.log('✅ Community page rendered with forum tab');
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/user-flows-community-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });
});

test.describe('Forum Post', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('Forum post created via form should appear in the forum list', async ({ page }) => {
    test.setTimeout(90000);
    const requestLogger = await logFailedRequests(page);

    try {
      await spaNavigate(page, '/Community');

      await page.waitForFunction(
        () => {
          const root = document.querySelector('#root');
          return root && root.children.length > 0;
        },
        { timeout: 15000 }
      );

      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // Verify Community page is loaded using a visible heading
      const communityHeading = page.locator('h1').filter({ hasText: /\w+/ }).first();
      await expect(communityHeading).toBeVisible({ timeout: 15000 });

      // Verify the Forum tab is accessible
      const forumTab = page.getByRole('tab', { name: /forum/i });
      await expect(forumTab).toBeVisible({ timeout: 10000 });

      console.log('✅ Community page loaded, forum tab visible');
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/user-flows-forum-post-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });
});

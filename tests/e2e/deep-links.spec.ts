/**
 * deep-links.spec.ts
 *
 * Verifies that direct navigation (deep links) to each major route works
 * correctly without blank screens or 404 responses.
 *
 * Routes are derived from the PAGES object in src/pages.config.js.
 * For each route:
 *   - page.goto() navigates directly (simulating a deep link / bookmark).
 *   - Assert React hydration (app root has children).
 *   - Assert no 404 responses for GET requests.
 *
 * All API calls are mocked; no real network is required.
 * Read-only: no real data is created or modified.
 */

import { test, expect } from '@playwright/test';
import { mockApi, logFailedRequests } from '../helpers/ui';

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  process.env.BASE_URL ||
  'http://127.0.0.1:5173';

/**
 * Routes derived from PAGES keys in src/pages.config.js.
 * Some pages require dynamic segments (e.g. ExerciseView/:id); those are
 * excluded because they can't be deep-linked without a valid ID.
 * VideoPlayer and PlaylistDetail also require IDs and are excluded.
 */
const DEEP_LINK_ROUTES = [
  { path: '/',                name: 'Home (root)' },
  { path: '/AdvancedAnalytics', name: 'AdvancedAnalytics' },
  { path: '/Chat',            name: 'Chat' },
  { path: '/Coach',           name: 'Coach' },
  { path: '/CoachingAnalytics', name: 'CoachingAnalytics' },
  { path: '/Community',       name: 'Community' },
  { path: '/CrisisAlerts',    name: 'CrisisAlerts' },
  { path: '/Exercises',       name: 'Exercises' },
  { path: '/ExperientialGames', name: 'ExperientialGames' },
  { path: '/GoalCoach',       name: 'GoalCoach' },
  { path: '/Goals',           name: 'Goals' },
  { path: '/Journal',         name: 'Journal' },
  { path: '/JournalDashboard', name: 'JournalDashboard' },
  { path: '/Journeys',        name: 'Journeys' },
  { path: '/MoodTracker',     name: 'MoodTracker' },
  { path: '/PersonalizedFeed', name: 'PersonalizedFeed' },
  { path: '/Playlists',       name: 'Playlists' },
  { path: '/Progress',        name: 'Progress' },
  { path: '/Resources',       name: 'Resources' },
  { path: '/Settings',        name: 'Settings' },
  { path: '/StarterPath',     name: 'StarterPath' },
  { path: '/ThoughtCoach',    name: 'ThoughtCoach' },
  { path: '/Videos',          name: 'Videos' },
];

test.describe('Deep links — direct navigation to each major route', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      (window as any).__DISABLE_ANALYTICS__ = true;
      localStorage.setItem('age_verified', 'true');
    });
    await mockApi(page);
  });

  for (const route of DEEP_LINK_ROUTES) {
    test(`direct navigation to ${route.name} (${route.path})`, async ({ page }) => {
      test.setTimeout(60000);
      const requestLogger = await logFailedRequests(page);

      try {
        // Simulate a direct deep-link navigation.
        await page.goto(`${BASE_URL}${route.path}`, {
          waitUntil: 'domcontentloaded',
          timeout: 30000,
        });

        // Wait for React hydration — root must have children.
        await page.waitForFunction(
          () => {
            const root = document.querySelector('#root');
            return root && root.children.length > 0;
          },
          { timeout: 15000 }
        );

        // Assert app root is visible (not blank).
        await expect(page.locator('#root')).toBeVisible({ timeout: 10000 });

        // Assert no 404 GET responses for this route.
        const failed404s = requestLogger
          .getFailedRequests()
          .filter(
            (r) =>
              r.includes(' - 404') &&
              !r.startsWith('POST ') &&
              !r.startsWith('PATCH ')
          );

        if (failed404s.length > 0) {
          throw new Error(
            `404 responses on deep link to ${route.name}:\n${failed404s.join('\n')}`
          );
        }
      } catch (error) {
        requestLogger.logToConsole();
        await page.screenshot({
          path: `test-results/deep-link-${route.name.replace(/[^a-zA-Z0-9]/g, '-')}-failed-${Date.now()}.png`,
          fullPage: true,
        });
        throw error;
      }
    });
  }
});

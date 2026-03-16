import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate, waitForAppHydration } from '../helpers/ui';

/**
 * Network Resilience – verifies the SPA shell stays usable when the device
 * loses connectivity after the initial page load.
 */

test.describe('Network resilience', () => {
  test.beforeEach(async ({ page }) => {
    await mockApi(page);
  });

  test('app shell remains visible after going offline and navigating', async ({
    page,
    context,
  }) => {
    test.setTimeout(60000);

    // 1. Load the app while online so all assets are cached.
    await spaNavigate(page, '/');
    await waitForAppHydration(page);

    // 2. Go offline.
    await context.setOffline(true);

    // 3. Navigate via client-side routing — must not throw ERR_INTERNET_DISCONNECTED.
    await spaNavigate(page, '/Resources');

    // 4. The app shell (#root) must still be present and non-empty.
    const root = page.locator('#root');
    await expect(root).toBeVisible({ timeout: 10000 });
    await expect(root).not.toBeEmpty();

    // 5. Restore connectivity.
    await context.setOffline(false);
  });
});

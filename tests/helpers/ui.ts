import { Page, expect } from '@playwright/test';

export async function waitForAppHydration(page: Page, timeout = 10000) {
  await page.waitForFunction(
    () => {
      const root = document.querySelector('#root');
      return root && root.children.length > 0;
    },
    { timeout }
  );
}

export async function spaNavigate(page: Page, path: string) {
  let baseUrl =
    process.env.PLAYWRIGHT_TEST_BASE_URL ||
    process.env.BASE_URL ||
    'http://127.0.0.1:5173';

  try {
    const currentUrl = page.url();
    if (
      currentUrl &&
      currentUrl !== 'about:blank' &&
      currentUrl.startsWith('http')
    ) {
      const url = new URL(currentUrl);
      baseUrl = url.origin;
    }
  } catch {
    // ignore
  }

  const targetUrl = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await waitForAppHydration(page);
}

export async function takeDebugScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/debug-${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Mocks Base44-style API calls so the UI can render "happy path" without real backend.
 * Important: covers public-settings and analytics which otherwise 404 and can block UI flow.
 */
export async function mockApi(page: Page) {
  const mockConversationId = 'test-conversation-123';
  const mockUserId = 'test-user-123';
  const mockUserEmail = 'test@example.com';

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    // ---- Base44 infrastructure endpoints (must not 404) ----

    // analytics tracking (ignore)
    if (url.includes('/analytics/track/batch')) {
      await route.fulfill({
        status: 204,
        body: '',
      });
      return;
    }

    // public settings by id (often called with null during tests)
    if (url.includes('/public-settings/by-id/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'public-settings-test',
          flags: {},
          created_date: new Date().toISOString(),
          updated_date: new Date().toISOString(),
        }),
      });
      return;
    }

    // ---- Auth endpoints ----
    if (url.includes('/auth/me') || url.includes('/auth/session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockUserId,
          email: mockUserEmail,
          full_name: 'Test User',
          role: 'user',
          created_date: new Date().toISOString(),
        }),
      });
      return;
    }

    // ---- Agent conversations ----
    if (url.includes('/agents/conversations') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    if (url.includes('/agents/conversations') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockConversationId,
          agent_name: 'cbt_therapist',
          metadata: { name: 'Test Session', description: 'Test' },
          messages: [],
          created_date: new Date().toISOString(),
        }),
      });
      return;
    }

    if (url.includes('/agents/conversations/') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockConversationId,
          agent_name: 'cbt_therapist',
          metadata: { name: 'Test Session', description: 'Test' },
          messages: [],
          created_date: new Date().toISOString(),
        }),
      });
      return;
    }

    // Add message to conversation (echo back posted content)
    if (
      url.includes('/agents/conversations/') &&
      url.includes('/messages') &&
      method === 'POST'
    ) {
      let postedContent = 'Test message';
      try {
        const postData = route.request().postData();
        if (postData) {
          const json = JSON.parse(postData);
          if (typeof json?.content === 'string' && json.content.trim()) {
            postedContent = json.content.trim();
          }
          if (typeof json?.message === 'string' && json.message.trim()) {
            postedContent = json.message.trim();
          }
        }
      } catch {
        // ignore parse errors
      }

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          role: 'user',
          content: postedContent,
          created_date: new Date().toISOString(),
        }),
      });
      return;
    }

    // ---- Entities used by UI ----
    if (url.includes('/entities/UserDeletedConversations')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    if (url.includes('/entities/Goal') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    if (url.includes('/entities/Goal') && method === 'POST') {
      let postData: any = {};
      try {
        postData = req.postDataJSON();
      } catch {
        // ignore
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'test-goal-123',
          ...postData,
          created_date: new Date().toISOString(),
          created_by: mockUserEmail,
          updated_date: new Date().toISOString(),
        }),
      });
      return;
    }

    if (url.includes('/entities/MoodEntry')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    if (url.includes('/entities/DailyFlow')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    // Any other entity GET - return empty array
    if (url.includes('/entities/') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    // Default: pass through
    await route.continue();
  });
}

export async function logFailedRequests(page: Page) {
  const failedRequests: string[] = [];

  page.on('requestfailed', (request) => {
    failedRequests.push(
      `${request.method()} ${request.url()} - ${request.failure()?.errorText}`
    );
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedRequests.push(
        `${response.request().method()} ${response.url()} - ${response.status()}`
      );
    }
  });

  return {
    getFailedRequests: () => failedRequests.slice(0, 10),
    logToConsole: () => {
      if (failedRequests.length > 0) {
        console.log('\n❌ Failed Requests (first 10):');
        failedRequests.slice(0, 10).forEach((r) => console.log(`  - ${r}`));
      }
    },
  };
}

export async function safeFill(locator: any, text: string) {
  await locator.clear();
  await locator.fill(text);
}

export async function safeClick(locator: any, timeout = 20000) {
  await locator.waitFor({ state: 'attached', timeout });
  await expect(locator).toBeVisible({ timeout });
  await expect(locator).toBeEnabled({ timeout });
  await locator.click({ force: false });
}


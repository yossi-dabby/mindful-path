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
  let baseUrl = process.env.PLAYWRIGHT_TEST_BASE_URL || 'http://127.0.0.1:5173';

  try {
    const currentUrl = page.url();
    if (currentUrl && currentUrl !== 'about:blank' && !currentUrl.includes('playwright')) {
      const url = new URL(currentUrl);
      baseUrl = url.origin;
    }
  } catch {
    // Ignore URL parsing errors
  }

  const targetUrl = `${baseUrl}${path.startsWith('/') ? path : '/' + path}`;

  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await waitForAppHydration(page);
}

export async function takeDebugScreenshot(page: Page, name: string) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/debug-${name}-${timestamp}.png`,
    fullPage: true
  });
}

export async function mockApi(page: Page) {
  const mockConversationId = 'test-conversation-123';
  const mockUserId = 'test-user-123';
  const mockUserEmail = 'test@example.com';

  await page.route('**/api/**', async (route) => {
    const url = route.request().url();
    const method = route.request().method();

    // 1) Base44 analytics (ignore)
    if (url.includes('/analytics/track/batch')) {
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    // 2) Public settings (avoid 404 that can break UI flows)
    // Example you showed:
    // /api/apps/public/prod/public-settings/by-id/null
    if (url.includes('/public-settings/by-id/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'mock-public-settings',
          appId: 'mock-app',
          env: 'prod',
          settings: {}
        })
      });
      return;
    }

    // 3) Auth endpoints
    if (url.includes('/auth/me') || url.includes('/auth/session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockUserId,
          email: mockUserEmail,
          full_name: 'Test User',
          role: 'user',
          created_date: new Date().toISOString()
        })
      });
      return;
    }

    // 4) Agent conversations list
    if (url.includes('/agents/conversations') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
      return;
    }

    // 5) Create agent conversation
    if (url.includes('/agents/conversations') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockConversationId,
          agent_name: 'cbt_therapist',
          metadata: { name: 'Test Session', description: 'Test' },
          messages: [],
          created_date: new Date().toISOString()
        })
      });
      return;
    }

    // 6) Get conversation
    if (url.includes('/agents/conversations/') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockConversationId,
          agent_name: 'cbt_therapist',
          metadata: { name: 'Test Session', description: 'Test' },
          messages: [],
          created_date: new Date().toISOString()
        })
      });
      return;
    }

    // 7) Add message to conversation (ECHO the sent content so UI can render it)
    if (url.includes('/agents/conversations/') && url.includes('/messages') && method === 'POST') {
      let postData: any = {};
      try {
        postData = route.request().postDataJSON();
      } catch {
        // ignore
      }

      const sentContent =
        postData?.content ??
        postData?.message ??
        postData?.text ??
        'Test message';

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          role: postData?.role ?? 'user',
          content: sentContent,
          created_date: new Date().toISOString()
        })
      });
      return;
    }

    // 8) Entities: return empty arrays / simple mocks
    if (url.includes('/entities/UserDeletedConversations')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
      return;
    }

    if (url.includes('/entities/Goal') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
      return;
    }

    if (url.includes('/entities/Goal') && method === 'POST') {
      let postData: any = {};
      try {
        postData = route.request().postDataJSON();
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
          updated_date: new Date().toISOString()
        })
      });
      return;
    }

    if (url.includes('/entities/MoodEntry')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
      return;
    }

    if (url.includes('/entities/DailyFlow')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
      return;
    }

    if (url.includes('/entities/') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
      return;
    }

    // Default: continue without mocking
    await route.continue();
  });
}

export async function logFailedRequests(page: Page) {
  const failedRequests: string[] = [];

  page.on('requestfailed', (request) => {
    failedRequests.push(`${request.method()} ${request.url()} - ${request.failure()?.errorText}`);
  });

  page.on('response', (response) => {
    if (response.status() >= 400) {
      failedRequests.push(`${response.request().method()} ${response.url()} - ${response.status()}`);
    }
  });

  return {
    getFailedRequests: () => failedRequests.slice(0, 10),
    logToConsole: () => {
      if (failedRequests.length > 0) {
        console.log('\n❌ Failed Requests (first 10):');
        failedRequests.slice(0, 10).forEach(req => console.log(`  - ${req}`));
      }
    }
  };
}

export async function safeFill(locator: any, text: string) {
  await locator.clear();
  await locator.fill(text);
}

export async function safeClick(locator: any) {
  await locator.click({ force: false });
}


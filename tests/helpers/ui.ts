import { Page, expect } from '@playwright/test';

/**
 * Injects all required test-environment globals and localStorage values
 * before the app script runs.  Call this (or pass its options to page.addInitScript)
 * BEFORE navigating to any page so the Base44 SDK and consent gates see the
 * correct values at boot time.
 *
 * Sets:
 *   - window.__TEST_APP_ID__        — prevents /api/apps/undefined/... URLs
 *   - window.__DISABLE_ANALYTICS__  — suppresses analytics in CI
 *   - localStorage.chat_consent_accepted — bypasses consent gate
 *   - localStorage.age_verified          — bypasses age gate
 *
 * @param lang Optional language/locale to pre-seed (e.g. 'en', 'he').  Defaults
 *   to 'en'.  Set a value to test multilingual flows.
 */
export async function setupTestEnvironment(page: Page, lang = 'en') {
  await page.addInitScript((language: string) => {
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    if (language) {
      localStorage.setItem('language', language);
    }
    if (document.body) {
      document.body.setAttribute('data-test-env', 'true');
    }
  }, lang);
}

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
  if (page.isClosed()) {
    console.warn(`[Screenshot] Skipped: page '${name}' was closed.`);
    return;
  }
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  await page.screenshot({
    path: `test-results/debug-${name}-${timestamp}.png`,
    fullPage: true,
  });
}

/**
 * Mocks Base44-style API calls so the UI can render "happy path" without real backend.
 * Important: covers public-settings and analytics which otherwise 404 and can block UI flow.
 *
 * Also calls setupTestEnvironment() to pre-seed all required localStorage and window
 * globals before the app boots — callers do NOT need a separate addInitScript for
 * the standard consent/age/appId values.
 */
export async function mockApi(page: Page) {
  // Pre-seed all required env globals before the app boots.
  await setupTestEnvironment(page);
  const mockConversationId = 'test-conversation-123';
  const mockUserId = 'test-user-123';
  const mockUserEmail = 'test@example.com';

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    // Never intercept JS/TS module files — let Vite serve them with the
    // correct MIME type (application/javascript).  Without this guard the
    // broad **/api/** pattern can match source files that contain "api" in
    // their path (e.g. /src/api/base44Client.js) and return JSON, which
    // triggers a strict-MIME-type browser error for module scripts.
    if (/\.(js|jsx|ts|tsx|mjs|cjs)(\?.*)?$/.test(url)) {
      await route.continue();
      return;
    }

    // ---- Base44 infrastructure endpoints (must not 404) ----

    // analytics tracking (ignore)
    if (url.includes('/analytics/track/batch')) {
      await route.fulfill({
        status: 204,
        body: '',
      });
      return;
    }

    // app-logs (e.g. /api/app-logs/<appId>/log-user-in-app/<page>)
    if (url.includes('/app-logs/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
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
    // The Base44 SDK calls GET /api/apps/{appId}/entities/User/me for auth.me() and
    // PATCH (overridden in base44Client.js) for auth.updateMe().
    // Returning onboarding_completed: true prevents the WelcomeWizard from rendering in tests.
    if (url.includes('/entities/User/me')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockUserId,
          email: mockUserEmail,
          full_name: 'Test User',
          role: 'user',
          onboarding_completed: true,
          created_date: new Date().toISOString(),
        }),
      });
      return;
    }

    if (url.includes('/auth/me') || url.includes('/auth/session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: mockUserId,
          email: mockUserEmail,
          full_name: 'Test User',
          role: 'user',
          onboarding_completed: true,
          created_date: new Date().toISOString(),
        }),
      });
      return;
    }

    // ---- Agent conversations ----
    // IMPORTANT: More-specific patterns must be checked before less-specific ones so that
    // requests to /agents/conversations/{id}/messages and /agents/conversations/{id}
    // are not accidentally swallowed by the broader /agents/conversations list rules.

    // Add message to conversation (echo back posted content) — checked first because
    // url.includes('/agents/conversations') also matches this URL.
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

    // Get specific conversation by ID — must come before the list GET below.
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

    // List conversations (no trailing slash / ID in the URL segment).
    if (url.includes('/agents/conversations') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
      return;
    }

    // Create new conversation.
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

    // Mock Base44 function invocations so they don't reach the real server in CI.
    // IMPORTANT: Route specifics BEFORE the generic catch-all at the bottom.
    //
    // Known backend functions and their expected response shapes:
    //   enhancedCrisisDetector     — crisis risk classifier (LLM-based)
    //   sessionPhaseEngine         — workflow phase tracker
    //   retrieveTherapistMemory    — memory retrieval
    //   writeTherapistMemory       — memory write
    //   normalizeAgentMessage      — message normalizer
    //   summarizeSession           — session summarizer
    //   ingestTrustedDocument      — knowledge ingestion
    //   validateTrustedSource      — source validator
    //   checkProactiveNudges       — nudge scheduler
    //   postLlmSafetyFilter        — LLM output safety filter
    //   sanitizeAgentOutput        — agent output sanitizer
    //   sanitizeConversation       — conversation sanitizer
    //   getSuperAgentSessionContext — super agent context builder
    //   buildMultilingualPreamble  — multilingual preamble builder
    //
    // If new backend functions are added, add a specific stub here for speed and
    // reliability — the generic catch-all at the bottom handles unknown functions.
    if (url.includes('/functions/') && method === 'POST') {
      if (url.includes('enhancedCrisisDetector')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { is_crisis: false, severity: 'none', reason: 'test_mock', confidence: 0 } }),
        });
        return;
      }
      if (url.includes('sessionPhaseEngine')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { phase: 'assessment', phase_label: 'Assessment', suggested_focus: 'Getting to know you', session_number: 1 } }),
        });
        return;
      }
      if (url.includes('retrieveTherapistMemory')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { memories: [], summary: '' } }),
        });
        return;
      }
      if (url.includes('writeTherapistMemory')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { success: true, memory_id: 'test-memory-id' } }),
        });
        return;
      }
      if (url.includes('summarizeSession') || url.includes('normalizeAgentMessage')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { success: true, content: '' } }),
        });
        return;
      }
      if (url.includes('postLlmSafetyFilter') || url.includes('sanitizeAgentOutput') || url.includes('sanitizeConversation')) {
        // Safety filters: return the input unchanged (passthrough mock — safe for testing)
        let body = '{}';
        try {
          const postData = route.request().postData();
          if (postData) body = postData;
        } catch { /* ignore */ }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { safe: true, filtered: false, content: body } }),
        });
        return;
      }
      if (url.includes('getSuperAgentSessionContext') || url.includes('buildMultilingualPreamble')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { context: '', preamble: '', locale: 'en', success: true } }),
        });
        return;
      }
      // All other backend functions: return a generic success response.
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { success: true } }),
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

    if (url.includes('/entities/ForumPost') && method === 'POST') {
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
          id: 'test-post-123',
          title: postData.title || 'Test Post',
          content: postData.content || 'Test content',
          category: postData.category || 'general',
          tags: postData.tags || [],
          upvotes: 0,
          author_display_name: postData.author_display_name || 'Test User',
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


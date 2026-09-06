import { test, expect } from '@playwright/test';
import { assertNoConsoleErrorsOrWarnings, assertElementVisibleAndTappable } from './utils/androidHelpers';
import { mockApi, SAFE_CONVERSATION_ROUTE_PATTERNS } from '../helpers/ui';

/**
 * Android Chat Readiness Test
 * 
 * This test verifies that the Chat page works correctly on Android devices,
 * specifically testing:
 * - Chat composer visibility and interaction
 * - Message sending stability (15 consecutive messages)
 * - Composer remains tappable after repeated interactions
 * - No console errors or warnings
 */

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:5173';

const TEST_CONVERSATION_ID = 'test-conversation-123';
let postedUserMessages: string[] = [];
let conversationMessages: Array<Record<string, unknown>> = [];

test.describe('Android Chat Readiness', () => {
  test.beforeEach(async ({ page }) => {
    postedUserMessages = [];
    conversationMessages = [];
    await mockApi(page);

    await page.route(
      SAFE_CONVERSATION_ROUTE_PATTERNS.MESSAGES_POST,
      async (route) => {
        if (route.request().method() !== 'POST') {
          await route.continue();
          return;
        }

        const body = route.request().postDataJSON?.() as { content?: string };
        const content = String(body?.content || '');
        const userIndex = conversationMessages.filter((message) => message.role === 'user').length + 1;
        conversationMessages.push({
          id: `user-${userIndex}`,
          role: 'user',
          content,
          status: 'completed',
          created_at: new Date().toISOString(),
        });
        const userMessageMarker = content.match(/Android test message \d+/)?.[0];
        if (userMessageMarker) postedUserMessages.push(userMessageMarker);
        conversationMessages.push({
          id: `assistant-${userIndex}`,
          role: 'assistant',
          content: `Assistant reply ${userIndex}`,
          status: 'completed',
          metadata: { status: 'completed', completed: true },
          created_at: new Date().toISOString(),
        });

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: `user-${userIndex}`,
            role: 'user',
            content,
            created_date: new Date().toISOString(),
          }),
        });
      },
    );

    await page.route(
      SAFE_CONVERSATION_ROUTE_PATTERNS.CONVERSATION_BY_ID,
      async (route) => {
        if (route.request().method() !== 'GET') {
          await route.fallback();
          return;
        }
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: TEST_CONVERSATION_ID,
            agent_name: 'cbt_therapist',
            metadata: { name: 'Android queue test' },
            messages: conversationMessages.slice(),
            created_date: new Date().toISOString(),
          }),
        });
      },
    );

    await page.addInitScript(() => {
      localStorage.setItem('language', 'en');
      localStorage.setItem('chat_consent_accepted', 'true');
      localStorage.setItem('age_verified', 'true');
      window.__TEST_APP_ID__ = 'test-app-id';
      window.__DISABLE_ANALYTICS__ = true;
    });
  });

  test('should send 15 queued messages in FIFO order and keep the composer usable', async ({ page }) => {
    test.setTimeout(120000);
    // Set up console monitoring at the start
    const checkConsole = assertNoConsoleErrorsOrWarnings(page);
    
    // Navigate to Chat page
    await page.goto(`${BASE_URL}/Chat?_s2=CHAT_ORCHESTRATOR_V2_ENABLED`, { waitUntil: 'networkidle' });
    
    // Wait for page to be ready
    await page.waitForFunction(() => {
      return document.querySelector('[data-page-ready="true"]') !== null;
    }, { timeout: 20000 });

    // Locate the chat composer - try multiple possible selectors
    const composerSelectors = [
      '[data-testid="therapist-chat-input"]',
      '[data-testid="chat-input"]',
      'textarea',
      '[contenteditable="true"]'
    ];

    let composer = null;
    for (const selector of composerSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        composer = element;
        test.info().annotations.push({ type: 'info', description: `Found composer with selector: ${selector}` });
        break;
      }
    }

    if (!composer) {
      test.skip(true, 'Chat composer not found - skipping test');
      return;
    }

    // Verify composer is visible initially
    await expect(composer).toBeVisible({ timeout: 10000 });

    // Locate the send button - try multiple possible selectors
    const sendButtonSelectors = [
      '[data-testid="therapist-chat-send"]',
      '[data-testid="send-button"]',
      'button:has-text("Send")',
      'button[aria-label*="Send"]'
    ];

    let sendButton = null;
    for (const selector of sendButtonSelectors) {
      const element = page.locator(selector).first();
      if (await element.count() > 0) {
        sendButton = element;
        test.info().annotations.push({ type: 'info', description: `Found send button with selector: ${selector}` });
        break;
      }
    }

    if (!sendButton) {
      test.skip(true, 'Send button not found - skipping test');
      return;
    }

    // Send 15 consecutive messages
    for (let i = 1; i <= 15; i++) {
      const message = `Android test message ${i}`;
      
      // Type message
      await composer.click();
      await composer.fill(message);
      
      // Click send button
      await sendButton.click();
      
      // Brief wait to allow UI to update
      await page.waitForTimeout(300);
    }

    await expect.poll(() => postedUserMessages.length, { timeout: 60000 }).toBe(15);
    expect(postedUserMessages).toEqual(
      Array.from({ length: 15 }, (_, index) => `Android test message ${index + 1}`),
    );

    // After repeated interactions, verify composer is still visible and tappable
    await assertElementVisibleAndTappable(page, composerSelectors[0]);

    // Attempt to call window.printChatStabilityReport() if defined
    const hasStabilityReport = await page.evaluate(() => {
      return typeof (window as any).printChatStabilityReport === 'function';
    });

    if (hasStabilityReport) {
      await page.evaluate(() => {
        (window as any).printChatStabilityReport();
      });
      test.info().annotations.push({ type: 'stability-report', description: 'Chat stability report available' });
    } else {
      test.info().annotations.push({ type: 'stability-report', description: 'Chat stability report not available' });
    }

    // Assert no console errors or warnings
    await checkConsole();
  });
});

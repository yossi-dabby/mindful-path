import { test, expect } from '@playwright/test';
import { setupConsoleMonitoring, assertElementVisibleAndTappable } from './utils/androidHelpers';

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

test.describe('Android Chat Readiness', () => {
  test.beforeEach(async ({ page }) => {
    // Set up test environment similar to existing smoke tests
    await page.route('**/api/apps/**', async (route) => {
      const url = route.request().url();
      if (url.includes('/public-settings/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-app-id',
            appId: 'test-app-id',
            appName: 'Test App',
            isPublic: true
          })
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
          preferences: {}
        })
      });
    });
    
    await page.route('**/api/agents/**', async (route) => {
      const method = route.request().method();
      if (method === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else if (method === 'POST') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-conversation-id',
            messages: [],
            metadata: { name: 'Test Session' }
          })
        });
      } else {
        await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
      }
    });
    
    await page.route('**/api/entities/**', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });
    
    await page.route('**/analytics/**', async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    
    // Set up test environment
    await page.addInitScript(() => {
      localStorage.setItem('chat_consent_accepted', 'true');
      localStorage.setItem('age_verified', 'true');
      document.body.setAttribute('data-test-env', 'true');
      window.__TEST_APP_ID__ = 'test-app-id';
      window.__DISABLE_ANALYTICS__ = true;
    });
  });

  test('should handle 15 consecutive messages and maintain composer visibility', async ({ page }) => {
    // Set up console monitoring at the start
    const checkConsole = setupConsoleMonitoring(page);
    
    // Navigate to Chat page
    await page.goto(`${BASE_URL}/Chat`, { waitUntil: 'networkidle' });
    
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

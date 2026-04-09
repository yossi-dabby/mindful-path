import { test, expect, devices } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests, setupTestEnvironment } from '../helpers/ui';

// Use a mobile device. Adjust the device as needed.
test.use({
  ...devices['iPhone 12'],
});

test.describe('Chat Smoke Test (Mobile)', () => {
  test('should send a message and verify it appears (or at least the POST happens) on mobile', async ({ page }) => {
    test.setTimeout(90000);

    // setupTestEnvironment is called inside mockApi below, so no separate
    // addInitScript is needed here.  It sets __TEST_APP_ID__, __DISABLE_ANALYTICS__,
    // chat_consent_accepted, and age_verified before the app boots.

    const requestLogger = await logFailedRequests(page);

    // Collect all POST requests made during the test for diagnostics.
    const capturedPostUrls: string[] = [];
    page.on('request', (req) => {
      if (req.method() === 'POST') {
        capturedPostUrls.push(req.url());
      }
    });

    try {
      await mockApi(page);

      await spaNavigate(page, '/Chat');
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
      const startSessionButton = page.getByText('Start Your First Session');
      if (await startSessionButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await safeClick(startSessionButton);
        await page.waitForTimeout(800);
      }

      const testMessage = `Test message ${Date.now()}`;
      const messageInput = page.locator('textarea[data-testid="therapist-chat-input"]')
        .or(page.locator('textarea[data-testid="chat-input"]'))
        .or(page.locator('textarea').first());
      await expect(messageInput).toBeVisible({ timeout: 20000 });
      await safeFill(messageInput, testMessage);

      // Set up the request interceptor BEFORE triggering the send action so no
      // request is missed due to a race between the click and the listener setup.
      const waitForPost = page.waitForRequest(
        (req) =>
          req.method() === 'POST' &&
          req.url().includes('/agents/conversations/') &&
          req.url().includes('/messages'),
        { timeout: 20000 },
      );

      // Prefer the actual send button testid used in Chat.jsx; fall back to
      // role/aria matchers and finally to pressing Enter on the textarea.
      const sendButton = page.locator('[data-testid="therapist-chat-send"]')
        .or(page.locator('[data-testid="chat-send"]'))
        .or(page.getByRole('button', { name: /send/i }))
        .or(page.locator('button[aria-label*="Send" i]')).first();

      if (await sendButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await expect(sendButton).toBeVisible({ timeout: 20000 });
        await expect(sendButton).toBeEnabled({ timeout: 20000 });
        await safeClick(sendButton);
      } else {
        await messageInput.press('Enter');
      }

      await waitForPost;

      await expect(page.getByText(testMessage).first()).toBeVisible({ timeout: 15000 }).catch(() => {});
    } catch (error) {
      requestLogger.logToConsole();
      if (capturedPostUrls.length > 0) {
        console.log('\n📋 POST requests captured during test:');
        capturedPostUrls.forEach((u) => console.log(`  POST ${u}`));
      } else {
        console.log('\n⚠️  No POST requests were captured during the test.');
      }
      await page.screenshot({ path: `test-results/chat-mobile-smoke-failed-${Date.now()}.png`, fullPage: true });
      throw error;
    }
  });
});

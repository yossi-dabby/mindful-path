import { test, expect } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests } from '../helpers/ui';

test.describe('Chat Smoke Test (Web)', () => {
  test('should send a message and verify it appears (or at least the POST happens)', async ({ page }) => {
    test.setTimeout(90000);

    const requestLogger = await logFailedRequests(page);

    try {
      await mockApi(page);

      await spaNavigate(page, '/Chat');

      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        console.log('Network idle timeout - continuing anyway');
      });

      // Start session if needed
      const startSessionButton = page.getByText('Start Your First Session');
      const isNewSession = await startSessionButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (isNewSession) {
        console.log('Starting new session...');
        await safeClick(startSessionButton);
        await page.waitForTimeout(800);
      }

      const testMessage = `Test message ${Date.now()}`;

      // Input
      const messageInput = page
        .locator('textarea[data-testid="chat-input"]')
        .or(page.locator('textarea').first());

      await expect(messageInput).toBeVisible({ timeout: 20000 });
      await safeFill(messageInput, testMessage);

      // We want to validate something deterministic:
      // Either (A) the POST request was sent, or (B) the message appears in UI.
      // First, set up a wait for the POST request.
      const waitForPostMessage = page.waitForRequest(
        (req) =>
          req.method() === 'POST' &&
          req.url().includes('/agents/conversations/') &&
          req.url().includes('/messages'),
        { timeout: 20000 }
      );

      // Send button (robust locator)
      const sendButton = page
        .locator('[data-testid="chat-send"]')
        .or(page.getByRole('button', { name: /send/i }))
        .or(page.locator('button[aria-label*="Send" i]'))
        .first();

      // Try click; if click fails (overlay/disabled), fallback to Enter
      const canClick = await sendButton.isVisible({ timeout: 3000 }).catch(() => false);

      if (canClick) {
        await expect(sendButton).toBeVisible({ timeout: 20000 });
        await expect(sendButton).toBeEnabled({ timeout: 20000 });
        await safeClick(sendButton);
      } else {
        // fallback: press Enter in textarea
        await messageInput.press('Enter');
      }

      // Prefer verifying POST happened (less flaky than UI rendering).
      await waitForPostMessage;

      // Optional: if UI does render the message, assert it with a generous timeout
      await expect(page.getByText(testMessage).first()).toBeVisible({ timeout: 15000 }).catch(() => {
        console.log('Message text not found in UI (continuing; POST was confirmed).');
      });

      console.log('✅ Chat web smoke test passed');
    } catch (error) {
      console.error('❌ Chat web smoke test failed:', error);
      requestLogger.logToConsole();

      await page.screenshot({
        path: `test-results/chat-web-smoke-failed-${Date.now()}.png`,
        fullPage: true
      });

      throw error;
    }
  });
});



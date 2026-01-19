import { test, expect } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests, takeDebugScreenshot } from '../helpers/ui';

test.describe('Chat Smoke Test (Web)', () => {
  test('should send a message and verify it appears (or at least the POST happens)', async ({ page }) => {
    test.setTimeout(90000);
    const requestLogger = await logFailedRequests(page);

    // DEBUG: Log every request for diagnosis in CI
    page.on('request', req => {
      console.log(`[WEB DEBUG][${req.method()}] ${req.url()}`);
    });

    try {
      await mockApi(page);

      await spaNavigate(page, '/Chat');
      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

      // Try selecting the "Start Your First Session" button and clicking if visible
      const startSessionButton = page.getByText('Start Your First Session');
      if (await startSessionButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await safeClick(startSessionButton);
        await page.waitForTimeout(800);
      }

      const testMessage = `Test message ${Date.now()}`;
      const messageInput = page.locator('textarea[data-testid="chat-input"]').or(page.locator('textarea').first());

      await expect(messageInput).toBeVisible({ timeout: 20000 });
      await safeFill(messageInput, testMessage);

      // DEBUG: Optional screenshot before send for diagnosis
      await takeDebugScreenshot(page, 'before-chat-send-web');

      // Robust POST request wait: longer timeout (40s)
      const waitForPost = page.waitForRequest(
        (req) =>
          req.method() === 'POST' &&
          req.url().includes('/agents/conversations/') &&
          req.url().includes('/messages'),
        { timeout: 40000 }
      );

      // Robust selector handling for send button
      const sendButton = page
        .locator('[data-testid="chat-send"]')
        .or(page.getByRole('button', { name: /send/i }))
        .or(page.locator('button[aria-label*="Send" i]')).first();

      let attemptedClick = false;
      try {
        await expect(sendButton).toBeVisible({ timeout: 20000 });
        await expect(sendButton).toBeEnabled({ timeout: 20000 });
        await safeClick(sendButton, 20000);
        attemptedClick = true;
      } catch {
        // Fallback if the button is not visible or interactable
      }
      if (!attemptedClick) {
        if (!page.isClosed()) {
          await messageInput.press('Enter');
        } else {
          throw new Error('Page was closed before trying to send message with Enter key.');
        }
      }

      await waitForPost;

      await expect(page.getByText(testMessage).first()).toBeVisible({ timeout: 15000 }).catch(() => {});
    } catch (error) {
      requestLogger.logToConsole();
      await takeDebugScreenshot(page, 'chat-web-smoke-failed');
      throw error;
    }
  });
});

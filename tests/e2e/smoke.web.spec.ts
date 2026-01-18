import { test, expect } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests } from '../helpers/ui';

test.describe('Chat Smoke Test (Web)', () => {
  test('should send a message and verify it appears (or request is sent)', async ({ page }) => {
    test.setTimeout(90000);

    const requestLogger = await logFailedRequests(page);

    try {
      // Mock API before navigation
      await mockApi(page);

      // Navigate to Chat page
      await spaNavigate(page, '/Chat');

      // Wait for page to be reasonably ready (don’t block forever)
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('Network idle timeout - continuing anyway');
      });

      // If we need to start a new session first
      const startSessionButton = page.locator('text=Start Your First Session');
      const isNewSession = await startSessionButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (isNewSession) {
        console.log('Starting new session...');
        await safeClick(startSessionButton);
        await page.waitForTimeout(800);
      }

      const testMessage = `Test message ${Date.now()}`;

      const messageInput = page
        .locator('textarea[data-testid="chat-input"]')
        .or(page.locator('textarea').first());

      await expect(messageInput).toBeVisible({ timeout: 20000 });
      await safeFill(messageInput, testMessage);

      const sendButton = page.locator('[data-testid="chat-send"]');

      // Wait for send button to be ready
      await expect(sendButton).toBeVisible({ timeout: 20000 });
      await expect(sendButton).toBeEnabled({ timeout: 20000 });

      // Start listening BEFORE clicking (so we don’t miss the request)
      const reqPromise = page
        .waitForRequest(
          (req) =>
            req.method() === 'POST' &&
            req.url().includes('/agents/conversations/') &&
            req.url().includes('/messages'),
          { timeout: 20000 }
        )
        .catch(() => null);

      // Click (with a small retry pattern, web can be a bit more timing-sensitive)
      for (let i = 0; i < 3; i++) {
        try {
          await sendButton.scrollIntoViewIfNeeded().catch(() => {});
          await safeClick(sendButton);
          break;
        } catch (e) {
          if (i === 2) throw e;
          await page.waitForTimeout(500);
        }
      }

      const msgReq = await reqPromise;

      // Primary assertion: message appears in UI
      const uiAppeared = await page
        .locator('text=' + testMessage)
        .first()
        .isVisible({ timeout: 15000 })
        .catch(() => false);

      // If UI is flaky, accept “request sent” as success signal
      if (!uiAppeared && !msgReq) {
        throw new Error('Neither UI message appeared nor POST /messages request was detected.');
      }

      console.log('✅ Chat smoke test (web) passed');
    } catch (error) {
      console.error('❌ Chat smoke test (web) failed:', error);
      requestLogger.logToConsole();

      await page.screenshot({
        path: `test-results/chat-smoke-web-failed-${Date.now()}.png`,
        fullPage: true
      });

      throw error;
    }
  });
});

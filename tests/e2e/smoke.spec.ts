import { test, expect } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests } from '../helpers/ui';

test.describe('Chat Smoke Test (MOBILE ONLY)', () => {
  test('should send a message and verify it appears', async ({ page }, testInfo) => {
    // חשוב: לא להריץ את הטסט הזה על web
    test.skip(testInfo.project.name !== 'mobile-390x844', 'Mobile-only smoke test');

    test.setTimeout(60000);

    const requestLogger = await logFailedRequests(page);

    try {
      // Mock API before navigation
      await mockApi(page);

      // Navigate to Chat page
      await spaNavigate(page, '/Chat');

      // Wait for page to be interactive
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('Network idle timeout - continuing anyway');
      });

      // Check if we need to start a new session first
      const startSessionButton = page.locator('text=Start Your First Session');
      const isNewSession = await startSessionButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (isNewSession) {
        console.log('Starting new session...');
        await safeClick(startSessionButton);
        // Wait for conversation to be created and textarea to appear
        await page.waitForTimeout(1000);
      }

      // Generate unique test message
      const testMessage = `Test message ${Date.now()}`;

      // The real app has textarea for message input
      const messageInput = page.locator('textarea[data-testid="chat-input"]').or(page.locator('textarea').first());
      await expect(messageInput).toBeVisible({ timeout: 15000 });

      // Fill message
      await safeFill(messageInput, testMessage);

      // Find and click send button
      const sendButton = page.locator('[data-testid="chat-send"]');
      await expect(sendButton).toBeVisible({ timeout: 5000 });
      await expect(sendButton).toBeEnabled({ timeout: 5000 });
      await safeClick(sendButton);

      // Wait for the message to appear in the chat
      await expect(page.locator('text=' + testMessage).first()).toBeVisible({ timeout: 10000 });

      console.log('✅ Chat smoke test (mobile) passed');
    } catch (error) {
      console.error('❌ Chat smoke test (mobile) failed:', error);
      requestLogger.logToConsole();

      // Take screenshot on failure
      await page.screenshot({
        path: `test-results/chat-smoke-failed-${Date.now()}.png`,
        fullPage: true
      });

      throw error;
    }
  });
});










 

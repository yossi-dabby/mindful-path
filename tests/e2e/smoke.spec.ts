import { test, expect } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests } from '../helpers/ui';

test.describe('Chat Smoke Test', () => {
  test('should send a message and verify it appears', async ({ page }, testInfo) => {
    test.setTimeout(90000);

    const requestLogger = await logFailedRequests(page);

    // IMPORTANT: apply extra stability only for web-desktop (do not affect mobile)
    const isWebDesktop = testInfo.project.name === 'web-desktop';

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

      // Message input
      const messageInput = page.locator('textarea[data-testid="chat-input"]').or(page.locator('textarea').first());
      await expect(messageInput).toBeVisible({ timeout: 20000 });

      // Fill message
      await safeFill(messageInput, testMessage);

      // Send button (primary selector + fallback)
      const sendButton = page
        .locator('[data-testid="chat-send"]')
        .or(page.locator('button[type="submit"]'))
        .first();

      await expect(sendButton).toBeVisible({ timeout: 20000 });

      // Web-desktop sometimes needs more time for hydration/enabled-state
      if (isWebDesktop) {
        // Ensure it’s in view and not blocked by layout/overlay timing
        await sendButton.scrollIntoViewIfNeeded().catch(() => {});
        await sendButton.waitFor({ state: 'visible', timeout: 30000 });
        await expect(sendButton).toBeEnabled({ timeout: 30000 });

        // Small settle to avoid “click eaten” by late re-render
        await page.waitForTimeout(150);

        await sendButton.click({ force: false });
      } else {
        // Keep mobile behavior unchanged
        await expect(sendButton).toBeEnabled({ timeout: 20000 });
        await safeClick(sendButton);
      }

      // Verify by UI echo (most stable with mocks)
      await expect(page.locator('text=' + testMessage).first()).toBeVisible({ timeout: isWebDesktop ? 20000 : 10000 });

      console.log('✅ Chat smoke test passed');
    } catch (error) {
      console.error('❌ Chat smoke test failed:', error);
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










 

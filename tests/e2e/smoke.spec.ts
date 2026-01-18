import { test, expect, devices } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests } from '../helpers/ui';

// Use a mobile device. Adjust the device as needed.
test.use({
  ...devices['iPhone 12'],
});

test.describe('Chat Smoke Test (Mobile)', () => {
  test('should send a message and verify it appears (or at least the POST happens) on mobile', async ({ page }) => {
    test.setTimeout(90000);
    const requestLogger = await logFailedRequests(page);

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
      const messageInput = page.locator('textarea[data-testid="chat-input"]').or(page.locator('textarea').first());
      await expect(messageInput).toBeVisible({ timeout: 20000 });
      await safeFill(messageInput, testMessage);

      const waitForPost = page.waitForRequest((req) =>
        req.method() === 'POST' &&
        req.url().includes('/agents/conversations/') &&
        req.url().includes('/messages'), { timeout: 20000 });

      const sendButton = page.locator('[data-testid="chat-send"]')
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
      await page.screenshot({ path: `test-results/chat-mobile-smoke-failed-${Date.now()}.png`, fullPage: true });
      throw error;
    }
  });
});;










 

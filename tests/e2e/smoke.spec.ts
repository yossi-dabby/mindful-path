import { test, expect } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests } from '../helpers/ui';

test.describe('Chat Smoke Test', () => {
  test('should send a message and verify it was sent', async ({ page }) => {
    test.setTimeout(90000);

    const requestLogger = await logFailedRequests(page);

    try {
      await mockApi(page);
      await spaNavigate(page, '/Chat');

      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('Network idle timeout - continuing anyway');
      });

      // If UI shows onboarding, start a session
      const startSessionButton = page.locator('text=Start Your First Session');
      const isNewSession = await startSessionButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (isNewSession) {
        console.log('Starting new session...');
        await safeClick(startSessionButton);
        await page.waitForTimeout(1000);
      }

      const testMessage = `Test message ${Date.now()}`;

      const messageInput = page.locator('textarea[data-testid="chat-input"]').or(page.locator('textarea')).first();
      await expect(messageInput).toBeVisible({ timeout: 20000 });
      await safeFill(messageInput, testMessage);

      const sendButton = page.locator('[data-testid="chat-send"]').first();
      await expect(sendButton).toBeVisible({ timeout: 20000 });
      await expect(sendButton).toBeEnabled({ timeout: 20000 });

      // Wait for either:
      // 1) a relevant POST request/response to messages, OR
      // 2) the message text to appear in UI (fallback).
      const waitForMessageRequest = page
        .waitForRequest(
          (req) => {
            const u = req.url();
            return (
              req.method() === 'POST' &&
              u.includes('/agents/') &&
              u.includes('conversations') &&
              (u.includes('/messages') || u.includes('/message'))
            );
          },
          { timeout: 20000 }
        )
        .catch(() => null);

      const waitForMessageResponse = page
        .waitForResponse(
          (res) => {
            const u = res.url();
            return (
              res.request().method() === 'POST' &&
              u.includes('/agents/') &&
              u.includes('conversations') &&
              (u.includes('/messages') || u.includes('/message')) &&
              res.status() < 400
            );
          },
          { timeout: 20000 }
        )
        .catch(() => null);

      const waitForUiEcho = page
        .locator(`text=${testMessage}`)
        .first()
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => 'ui')
        .catch(() => null);

      await safeClick(sendButton);

      const result = await Promise.race([
        (async () => {
          const req = await waitForMessageRequest;
          return req ? 'request' : null;
        })(),
        (async () => {
          const res = await waitForMessageResponse;
          return res ? 'response' : null;
        })(),
        waitForUiEcho
      ]);

      if (!result) {
        throw new Error('Message send could not be verified (no request/response/UI echo observed).');
      }

      // If we captured the request, validate payload loosely
      const maybeReq = await waitForMessageRequest;
      if (maybeReq) {
        let body: any = {};
        try {
          body = maybeReq.postDataJSON();
        } catch {
          // ignore
        }
        const candidate =
          body?.content ??
          body?.message ??
          body?.text ??
          body?.input ??
          body?.payload?.content ??
          body?.payload?.message ??
          '';

        if (candidate && candidate !== testMessage) {
          console.log(`Payload differs from expected. Expected="${testMessage}" got="${candidate}" (continuing).`);
        }
      }

      console.log(`✅ Chat smoke test passed (verified via: ${result})`);
    } catch (error) {
      console.error('❌ Chat smoke test failed:', error);
      requestLogger.logToConsole();

      await page.screenshot({
        path: `test-results/chat-smoke-failed-${Date.now()}.png`,
        fullPage: true
      });

      throw error;
    }
  });
});









 

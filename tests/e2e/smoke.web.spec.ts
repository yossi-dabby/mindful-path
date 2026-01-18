import { test, expect } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests } from '../helpers/ui';

test.describe('Chat Smoke Test (Web)', () => {
  test('should send a message and verify it appears (UI or network)', async ({ page }) => {
    test.setTimeout(90000);

    const requestLogger = await logFailedRequests(page);

    try {
      // Mock API before navigation
      await mockApi(page);

      // Navigate to Chat page
      await spaNavigate(page, '/Chat');

      // Wait for page to settle (don’t over-rely on networkidle with mocked routes)
      await page.waitForLoadState('domcontentloaded');
      await page.waitForTimeout(500);

      // If there is a "start session" CTA, click it (different UIs may vary)
      const startSessionButton =
        page.getByRole('button', { name: /start your first session/i })
          .or(page.getByRole('button', { name: /start session/i }))
          .or(page.locator('[data-testid="start-first-session"]'))
          .or(page.locator('text=Start Your First Session'));

      const isStartVisible = await startSessionButton.isVisible({ timeout: 1500 }).catch(() => false);
      if (isStartVisible) {
        console.log('Starting new session...');
        await safeClick(startSessionButton);
        await page.waitForTimeout(800);
      }

      // Chat input
      const messageInput = page.locator('textarea[data-testid="chat-input"]')
        .or(page.locator('[data-testid="chat-input"]'))
        .or(page.locator('textarea').first());

      await expect(messageInput).toBeVisible({ timeout: 20000 });

      const testMessage = `Test message ${Date.now()}`;
      await safeFill(messageInput, testMessage);

      // Send button (with fallbacks)
      const sendButton = page.locator('[data-testid="chat-send"]')
        .or(page.getByRole('button', { name: /send/i }))
        .or(page.locator('button[type="submit"]').first());

      // Prepare waiting for the outgoing request BEFORE clicking
      const msgReqPromise = page
        .waitForRequest(
          (req) =>
            req.method() === 'POST' &&
            req.url().includes('/agents/conversations/') &&
            req.url().includes('/messages'),
          { timeout: 20000 }
        )
        .catch(() => null);

      await safeClick(sendButton);

      // Two acceptable proofs of success:
      // 1) Network POST was sent (and contains our message), OR
      // 2) The message appears in the UI
      const uiPromise = page
        .locator(`text=${testMessage}`)
        .first()
        .waitFor({ state: 'visible', timeout: 20000 })
        .then(() => 'ui' as const)
        .catch(() => null);

      const winner = await Promise.race([
        msgReqPromise.then((r) => (r ? ('req' as const) : null)),
        uiPromise,
      ]);

      if (winner === 'req') {
        const req = await msgReqPromise;
        const body = req?.postData() || '';
        // Make sure our text was actually sent
        expect(body).toContain(testMessage);
      } else if (winner === 'ui') {
        // OK
      } else {
        // Neither request nor UI showed success → fail with diagnostics
        requestLogger.logToConsole();
        await page.screenshot({
          path: `test-results/chat-web-failed-${Date.now()}.png`,
          fullPage: true,
        });
        throw new Error('Chat send did not produce a POST /messages request and did not render the message in the UI.');
      }

      // Optional: input clears (do not fail test if UI keeps text)
      await expect(messageInput).toHaveValue('', { timeout: 5000 }).catch(() => {});

      console.log('✅ Chat web smoke test passed');
    } catch (error) {
      console.error('❌ Chat web smoke test failed:', error);
      requestLogger.logToConsole();

      await page.screenshot({
        path: `test-results/chat-web-smoke-failed-${Date.now()}.png`,
        fullPage: true,
      });

      throw error;
    }
  });
});


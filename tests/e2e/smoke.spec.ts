// FILE: tests/e2e/chat.spec.ts
import { test, expect } from '@playwright/test';
import {
  attachDiagnostics,
  waitForAppHydration,
  checkAuthGuard,
  stableClick,
  safeFill,
  spaNavigate,
  takeDebugScreenshot,
} from '../helpers/ui';

test.describe('Chat Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    attachDiagnostics(page);
  });

  test('should send a message and verify it appears', async ({ page }) => {
    // Navigate to Chat
    await spaNavigate(page, '/Chat');

    // Check for auth guard
    if (await checkAuthGuard(page)) {
      test.skip(true, 'Auth required - skipping test');
      return;
    }

    const testMessage = `E2E Test Message - ${Date.now()}`;

    await test.step('Find and fill message input', async () => {
      // Wait for chat interface to load (input should be visible)
      // The real app has textarea for message input
      const messageInput = page.locator('textarea').first();
      await expect(messageInput).toBeVisible({ timeout: 15000 });

      // Fill message
      await safeFill(messageInput, testMessage);

      // Take screenshot for debugging
      if (!process.env.CI) {
        await takeDebugScreenshot(page, 'chat-before-send');
      }
    });

    await test.step('Send message', async () => {
      // Find send button (look for button with Send or paper plane icon)
      const sendButton = page.locator('button:has-text("Send"), button[type="submit"]').last();
      
      // Alternative: if Enter key is the primary send method
      if (await sendButton.count() === 0) {
        await page.keyboard.press('Enter');
      } else {
        await stableClick(sendButton);
      }

      await page.waitForTimeout(500);
    });

    await test.step('Verify user message appears', async () => {
      // Look for the message bubble containing our text
      // In the real app, messages are in MessageBubble component with role-based styling
      const userMessage = page.locator(`text="${testMessage}"`).or(page.locator(`p:has-text("${testMessage}")`));
      
      await expect(userMessage).toBeVisible({ timeout: 10000 });

      // In CI: stop here, don't wait for AI response
      if (process.env.CI) {
        console.log('[CI MODE] User message verified, not waiting for assistant response');
        return;
      }

      // In local/non-CI: optionally verify assistant response
      if (!process.env.CI) {
        console.log('[LOCAL MODE] Attempting to verify assistant response...');
        
        // Wait for assistant message (look for AI avatar or role indicator)
        // The real app uses different styling for AI vs user messages
        const assistantMessage = page.locator('[class*="bg-white"]:has(p), [class*="prose"]:has(p)').last();
        
        await assistantMessage.waitFor({ state: 'visible', timeout: 30000 }).catch(async (err) => {
          console.warn('No assistant response detected within timeout:', err.message);
          await takeDebugScreenshot(page, 'chat-no-response');
        });

        // If response appeared, log success
        if (await assistantMessage.count() > 0 && await assistantMessage.isVisible()) {
          console.log('[LOCAL MODE] Assistant response detected');
        }
      }
    });
  });
});








 

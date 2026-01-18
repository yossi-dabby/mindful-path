import { test, expect } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests } from '../helpers/ui';

test.describe('Chat Smoke Test (WEB ONLY)', () => {
  test('should send a message and verify send action happened', async ({ page }, testInfo) => {
    // חשוב: להריץ את הטסט הזה רק על web
    test.skip(testInfo.project.name !== 'web-desktop', 'Web-only smoke test');

    test.setTimeout(90000);

    const requestLogger = await logFailedRequests(page);

    try {
      await mockApi(page);

      await spaNavigate(page, '/Chat');

      await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {
        console.log('Network idle timeout - continuing anyway');
      });

      // אם זו הפעם הראשונה – צריך להתחיל סשן כדי שהאינפוט יופיע
      const startSessionButton = page.locator('text=Start Your First Session');
      if (await startSessionButton.isVisible({ timeout: 2000 }).catch(() => false)) {
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

      // בדסקטופ לפעמים הכפתור קיים אבל “לא מוכן” עדיין, אז מחכים יותר יציב
      const sendButton = page
        .locator('[data-testid="chat-send"]')
        .or(page.locator('button[type="submit"]').first());

      await expect(sendButton).toBeVisible({ timeout: 20000 });
      await expect(sendButton).toBeEnabled({ timeout: 20000 });

      // ניסיון שליחה
      await safeClick(sendButton);

      // אימות יציב: או שהאינפוט התרוקן (סימן שהשליחה הופעלה),
      // או שהטקסט מופיע בצ'אט (אם יש רנדר אופטימי/אחרי תשובה).
      const inputCleared = expect(messageInput).toHaveValue('', { timeout: 20000 });

      const messageAppeared = expect(page.locator(`text=${testMessage}`).first()).toBeVisible({
        timeout: 20000
      });

      await Promise.race([inputCleared, messageAppeared]);

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

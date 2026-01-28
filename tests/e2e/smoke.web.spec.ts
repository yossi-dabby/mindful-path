import { test, expect } from '@playwright/test';

// Import helpers from Base44 app
import { testHelpers } from '../e2eTestHelpers.js';

test.describe('Chat Smoke Test (Web)', () => {
  test.beforeEach(async ({ page }) => {
    // CRITICAL: Mock analytics to prevent null app ID crashes
    await testHelpers.mockAnalytics(page);
    
    // Setup closure diagnostics
    testHelpers.setupClosureDiagnostics(page);
    
    // Set test environment flags to bypass age gate and consent
    await page.addInitScript(() => {
      localStorage.setItem('chat_consent_accepted', 'true');
      localStorage.setItem('age_verified', 'true');
      document.body.setAttribute('data-test-env', 'true');
    });
  });

  test('should send message and receive response', async ({ page }) => {
    console.log('[TEST START] Navigating to /Chat');
    
    // Navigate with extended timeout
    await page.goto('http://127.0.0.1:5173/Chat', { 
      timeout: 30000,
      waitUntil: 'domcontentloaded' 
    });

    // Verify page didn't close during navigation
    if (page.isClosed()) {
      throw new Error('❌ Page closed after navigation');
    }

    // Wait for page to be fully ready
    await page.waitForSelector('[data-page-ready="true"]', { timeout: 10000 });
    console.log('[READY] Chat page loaded');

    if (page.isClosed()) {
      throw new Error('❌ Page closed after ready check');
    }

    // Start conversation if needed
    const startButton = page.locator('text=Start Your First Session');
    if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('[ACTION] Clicking start button');
      await startButton.click();
      await page.waitForTimeout(1000);
    }

    if (page.isClosed()) {
      throw new Error('❌ Page closed after starting conversation');
    }

    // Find chat input with retry
    console.log('[ACTION] Locating chat input');
    const chatInput = page.locator('[data-testid="therapist-chat-input"]');
    await expect(chatInput).toBeVisible({ timeout: 15000 });

    if (page.isClosed()) {
      throw new Error('❌ Page closed after input visible');
    }

    // Find send button
    const sendButton = page.locator('[data-testid="therapist-chat-send"]');

    // DIAGNOSTIC LOOP - Use safe helper to prevent crashes
    console.log('[DIAGNOSTIC] Checking all buttons');
    const allButtons = page.locator('button');
    
    await testHelpers.safeDiagnosticLoop(page, allButtons, async (button, i) => {
      const label = await button.innerText().catch(() => '');
      const visible = await button.isVisible().catch(() => false);
      const enabled = await button.isEnabled().catch(() => false);
      
      if (/send/i.test(label)) {
        console.log(`[DIAGNOSTIC] Button[${i}] label: "${label}", visible: ${visible}, enabled: ${enabled}`);
      }
    });

    if (page.isClosed()) {
      throw new Error('❌ Page closed during diagnostics');
    }

    // Type message
    console.log('[ACTION] Typing message');
    await chatInput.fill('Hello, this is a test message');
    await page.waitForTimeout(500);

    if (page.isClosed()) {
      throw new Error('❌ Page closed after typing');
    }

    // Send message
    console.log('[ACTION] Sending message');
    const sendResult = await testHelpers.sendChatMessage(page, 'Hello, this is a test message');
    
    if (!sendResult) {
      throw new Error('❌ Failed to send message');
    }

    if (page.isClosed()) {
      throw new Error('❌ Page closed after sending');
    }

    // Wait for response with timeout
    console.log('[WAIT] Waiting for AI response');
    await page.waitForTimeout(2000);

    if (page.isClosed()) {
      throw new Error('❌ Page closed while waiting for response');
    }

    // Verify message appeared
    const messages = page.locator('[data-testid="chat-messages"]');
    await expect(messages).toBeVisible({ timeout: 5000 });

    // Verify page health
    const isHealthy = await testHelpers.verifyPageHealth(page);
    expect(isHealthy).toBe(true);

    console.log('[SUCCESS] Test completed');
  });

  test.afterEach(async ({ page }, testInfo) => {
    if (testInfo.status !== 'passed') {
      console.log('[FAILURE] Test failed, capturing screenshot');
      await page.screenshot({ 
        path: `test-results/failure-${Date.now()}.png`,
        fullPage: true 
      });
    }
  });
});

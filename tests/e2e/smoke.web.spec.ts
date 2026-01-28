import { test, expect } from '@playwright/test';

test.describe('Chat Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    console.log('[TEST] Starting beforeEach setup');
    
    // CRITICAL: Mock ALL API calls BEFORE navigation
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();
      console.log(`[MOCK] Intercepting: ${method} ${url}`);
      
      // Public settings
      if (url.includes('/public-settings/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-app-id',
            appId: 'test-app-id',
            appName: 'Test App',
            isPublic: true,
            public_settings: {}
          })
        });
        return;
      }
      
      // Auth
      if (url.includes('/auth/me') || url.includes('/auth/user')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'user',
            preferences: {}
          })
        });
        return;
      }
      
      // Agents/Conversations
      if (url.includes('/agents/') || url.includes('/conversations')) {
        if (method === 'GET') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify([])
          });
        } else if (method === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'test-conversation-id',
              messages: [],
              metadata: { name: 'Test Session' }
            })
          });
        } else {
          await route.fulfill({ status: 200, body: '{}' });
        }
        return;
      }
      
      // Entities
      if (url.includes('/entities/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
        return;
      }
      
      // Default: success for any other API call
      console.log(`[MOCK] Default handler for: ${url}`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true })
      });
    });
    
    // Mock analytics to prevent crashes
    await page.route('**/analytics/**', async (route) => {
      console.log('[MOCK] Analytics blocked');
      await route.fulfill({ status: 200, body: '{}' });
    });
    
    // Set up test environment BEFORE page loads
    await page.addInitScript(() => {
      console.log('[INIT] Setting up test environment');
      
      // Bypass gates
      localStorage.setItem('chat_consent_accepted', 'true');
      localStorage.setItem('age_verified', 'true');
      
      // Test flags
      document.body.setAttribute('data-test-env', 'true');
      window.__TEST_APP_ID__ = 'test-app-id';
      window.__TEST_APP_TOKEN__ = 'test-token';
      window.__DISABLE_ANALYTICS__ = true;
      
      // Mock Base44 SDK if it doesn't exist
      if (!window.base44) {
        window.base44 = {
          auth: {
            me: () => Promise.resolve({
              id: 'test-user',
              email: 'test@example.com',
              full_name: 'Test User'
            }),
            isAuthenticated: () => Promise.resolve(true)
          },
          entities: {
            UserDeletedConversations: {
              list: () => Promise.resolve([])
            }
          },
          agents: {
            listConversations: () => Promise.resolve([]),
            getConversation: (id) => Promise.resolve({ id, messages: [] }),
            createConversation: (opts) => Promise.resolve({ id: 'new-conv', ...opts })
          }
        };
      }
    });
    
    console.log('[TEST] beforeEach setup complete');
  });

  test('should load chat page without 404 errors', async ({ page }) => {
    console.log('[TEST] Starting chat page load test');
    
    // Track console errors
    const errors = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('[PAGE ERROR]', msg.text());
        errors.push(msg.text());
      }
    });
    
    // Track network failures
    const networkErrors = [];
    page.on('response', response => {
      if (response.status() === 404) {
        const url = response.url();
        console.error('[404 ERROR]', url);
        networkErrors.push(url);
      }
    });
    
    // Navigate
    await page.goto('http://127.0.0.1:5173/chat', { waitUntil: 'networkidle' });
    
    // Wait for page ready
    await page.waitForFunction(() => {
      return document.querySelector('[data-page-ready="true"]') !== null;
    }, { timeout: 20000 });
    
    console.log('[TEST] Page loaded, checking for chat elements');
    
    // Chat root should be visible
    const chatRoot = page.locator('[data-testid="chat-root"]');
    await expect(chatRoot).toBeVisible({ timeout: 10000 });
    
    // Input should be visible and enabled
    const input = page.locator('[data-testid="therapist-chat-input"]');
    await expect(input).toBeVisible({ timeout: 10000 });
    await expect(input).toBeEnabled();
    
    // Either welcome screen OR messages should be visible
    const hasWelcome = await page.locator('text=Welcome to Therapy').isVisible().catch(() => false);
    const hasMessages = await page.locator('[data-testid="chat-messages"]').isVisible().catch(() => false);
    
    console.log('[TEST] UI state - Welcome:', hasWelcome, 'Messages:', hasMessages);
    expect(hasWelcome || hasMessages).toBe(true);
    
    // Verify no 404 errors
    if (networkErrors.length > 0) {
      console.error('[TEST FAILED] Found 404 errors:', networkErrors);
    }
    expect(networkErrors.length).toBe(0);
    
    // Take screenshot for debugging
    await page.screenshot({ path: 'test-results/chat-loaded.png', fullPage: true });
    
    console.log('[TEST] Chat page test passed');
  });

  test('should handle no active conversation state', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/chat', { waitUntil: 'networkidle' });
    
    // Wait for ready
    await page.waitForFunction(() => {
      return document.querySelector('[data-page-ready="true"]') !== null;
    }, { timeout: 20000 });
    
    // Should show welcome screen when no conversation
    const welcome = page.locator('text=Welcome to Therapy');
    await expect(welcome).toBeVisible({ timeout: 10000 });
    
    // "Start Your First Session" button should be visible
    const startButton = page.locator('text=Start Your First Session');
    await expect(startButton).toBeVisible();
    
    console.log('[TEST] No conversation state test passed');
  });
});

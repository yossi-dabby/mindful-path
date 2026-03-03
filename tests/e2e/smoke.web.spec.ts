import { test, expect } from '@playwright/test';

test.describe('Chat Smoke Test', () => {
  test.beforeEach(async ({ page }) => {
    console.log('[TEST] Starting beforeEach setup');
    
    // Intercept all API calls with a single broad handler to ensure no real backend calls
    await page.route('**/api/**', async (route) => {
      const url = route.request().url();
      const method = route.request().method();

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
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString()
          })
        });
        return;
      }

      // Auth endpoints
      if (url.includes('/auth/')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'test-user-id',
            email: 'test@example.com',
            full_name: 'Test User',
            role: 'user',
            preferences: {},
            created_date: new Date().toISOString()
          })
        });
        return;
      }

      // Agent conversations
      if (url.includes('/agents/') || url.includes('/conversations')) {
        if (method === 'POST') {
          await route.fulfill({
            status: 200,
            contentType: 'application/json',
            body: JSON.stringify({
              id: 'test-conversation-id',
              messages: [],
              metadata: { name: 'Test Session' },
              created_date: new Date().toISOString()
            })
          });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        }
        return;
      }

      // All entity endpoints (regardless of URL structure with appId)
      if (url.includes('/entities/')) {
        if (method === 'GET') {
          await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
        } else {
          await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
        }
        return;
      }

      // Analytics and tracking
      if (url.includes('/analytics/') || url.includes('/track/')) {
        await route.fulfill({ status: 204, body: '' });
        return;
      }

      // Default: return empty success for any remaining API calls
      await route.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
    });
    
    // Set up test environment
    await page.addInitScript(() => {
      localStorage.setItem('chat_consent_accepted', 'true');
      localStorage.setItem('age_verified', 'true');
      if (document.body) {
        document.body.setAttribute('data-test-env', 'true');
      }
      window.__TEST_APP_ID__ = 'test-app-id';
      window.__DISABLE_ANALYTICS__ = true;
    });
  });

  test('should load chat page without errors', async ({ page }) => {
    const errors = [];
    const networkErrors = [];
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('[PAGE ERROR]', msg.text());
        errors.push(msg.text());
      }
    });
    
    page.on('response', response => {
      if (response.status() === 404) {
        console.error('[404 ERROR]', response.url());
        networkErrors.push(response.url());
      }
    });
    
    await page.goto('http://127.0.0.1:5173/chat', { waitUntil: 'networkidle' });
    
    await page.waitForFunction(() => {
      return document.querySelector('[data-page-ready="true"]') !== null;
    }, { timeout: 20000 });
    
    const chatRoot = page.locator('[data-testid="chat-root"]');
    await expect(chatRoot).toBeVisible({ timeout: 10000 });
    
    const input = page.locator('[data-testid="therapist-chat-input"]');
    await expect(input).toBeVisible({ timeout: 10000 });
    await expect(input).toBeEnabled();
    
    expect(networkErrors.length).toBe(0);
    
    await page.screenshot({ path: 'test-results/chat-loaded.png', fullPage: true });
  });

  test('should show welcome screen', async ({ page }) => {
    await page.goto('http://127.0.0.1:5173/chat', { waitUntil: 'networkidle' });
    
    await page.waitForFunction(() => {
      return document.querySelector('[data-page-ready="true"]') !== null;
    }, { timeout: 20000 });
    
    const welcome = page.locator('text=Welcome to Therapy');
    await expect(welcome).toBeVisible({ timeout: 10000 });
    
    const startButton = page.locator('text=Start Your First Session');
    await expect(startButton).toBeVisible();
  });
});

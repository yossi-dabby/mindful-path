import { test, expect, type Page } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

test('debug chat flow', async ({ page }) => {
  // Capture browser console
  const consoleLogs: string[] = [];
  page.on('console', (msg) => {
    consoleLogs.push(`[${msg.type()}] ${msg.text()}`);
  });

  // Track all network requests
  const networkLog: string[] = [];
  page.on('request', req => {
    if (req.url().includes('/api/')) {
      networkLog.push(`REQ ${req.method()} ${req.url()}`);
    }
  });
  page.on('response', res => {
    if (res.url().includes('/api/')) {
      networkLog.push(`RES ${res.status()} ${res.url()}`);
    }
  });

  await page.addInitScript(() => {
    localStorage.setItem('language', 'he');
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  });

  await mockApi(page);

  let pendingConversationMessages: Array<any> = [];
  let stabilizedConversationMessages: Array<any> = [];

  await page.route('**/api/**/agents/conversations', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    console.log('TEST: intercepted conversations POST');
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-conversation-123',
        agent_name: 'cbt_therapist',
        metadata: { name: 'test' },
        messages: [],
        created_date: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/api/**/agents/conversations/test-conversation-123**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }
    const messages = pendingConversationMessages.length > 0 ? stabilizedConversationMessages : [];
    if (pendingConversationMessages.length > 0) {
      pendingConversationMessages = [];
    }
    console.log(`TEST: GET conversation, returning ${messages.length} messages`);
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-conversation-123',
        agent_name: 'cbt_therapist',
        metadata: {},
        messages,
        created_date: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/api/**/agents/conversations/**/messages**', async (route) => {
    const body = route.request().postDataJSON?.() as any;
    const content = String(body?.content || '');
    console.log(`TEST: intercepted messages POST, content: ${content.slice(0, 30)}`);
    pendingConversationMessages = [
      { id: 'u-1', role: 'user', content, created_at: new Date().toISOString(), metadata: { status: 'completed', completed: true }, status: 'completed' },
      { id: 'a-1', role: 'assistant', content: 'Test reply', created_at: new Date().toISOString(), metadata: { status: 'completed', completed: true }, status: 'completed' },
    ];
    stabilizedConversationMessages = [...pendingConversationMessages];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ role: 'user', content, created_date: new Date().toISOString() }),
    });
  });

  await spaNavigate(page, '/Chat');
  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });

  const input = page.locator('[data-testid="therapist-chat-input"]');
  const sendButton = page.locator('[data-testid="therapist-chat-send"]');

  await input.fill('Test message');
  await expect(sendButton).toBeEnabled({ timeout: 5000 });
  await sendButton.click();

  // Wait and collect
  await page.waitForTimeout(12000);

  console.log('\n=== NETWORK LOG ===');
  networkLog.forEach(l => console.log(l));
  console.log('\n=== CONSOLE LOGS ===');
  consoleLogs.forEach(l => console.log(l));

  // Try to see what's on the page
  const snapshot = await page.evaluate(() => document.body.innerHTML.substring(0, 3000));
  console.log('\n=== PAGE HTML (first 3000) ===');
  console.log(snapshot);

  // Check if chat-messages is there
  const chatMessages = await page.locator('[data-testid="chat-messages"]').count();
  console.log(`\nchat-messages divs: ${chatMessages}`);

  expect(page.getByText('Test reply')).toBeVisible({ timeout: 1000 });
});

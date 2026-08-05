import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

test('debug messages pipeline', async ({ page }) => {
  const logs: string[] = [];
  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[Polling]') || text.includes('[Send]') || text.includes('[Sanitize]') || 
        text.includes('[Reasoning]') || text.includes('SAFE UPDATE') || text.includes('SAFE_UPDATE') || 
        text.includes('safeUpdate') || text.includes('safe_update') || text.includes('TEST:') ||
        text.includes('Hiding') || text.includes('missing_assistant') || text.includes('Retrieved')) {
      logs.push(`[${msg.type()}] ${text}`);
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
    if (route.request().method() !== 'POST') { await route.continue(); return; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'test-123', agent_name: 'cbt_therapist', messages: [], created_date: new Date().toISOString() }) });
  });

  await page.route('**/api/**/agents/conversations/test-123**', async (route) => {
    if (route.request().method() !== 'GET') { await route.continue(); return; }
    const messages = pendingConversationMessages.length > 0 ? stabilizedConversationMessages : [];
    const hasMsg = pendingConversationMessages.length > 0;
    if (hasMsg) pendingConversationMessages = [];
    console.log(`TEST: GET conv → returning ${messages.length} messages (hadPending=${hasMsg})`);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'test-123', agent_name: 'cbt_therapist', metadata: {}, messages, created_date: new Date().toISOString() }) });
  });

  await page.route('**/api/**/agents/conversations/**/messages**', async (route) => {
    const body = route.request().postDataJSON?.() as any;
    const content = String(body?.content || '');
    const reply = 'זה נשמע כמו לחץ משמעותי לקראת מחר. מה הכי מדאיג אותך?';
    console.log(`TEST: MSG POST intercepted, content=${content.slice(0,30)}`);
    pendingConversationMessages = [
      { id: 'u-1', role: 'user', content, created_at: new Date().toISOString(), metadata: { status: 'completed', completed: true }, status: 'completed' },
      { id: 'a-1', role: 'assistant', content: reply, created_at: new Date().toISOString(), metadata: { status: 'completed', completed: true }, status: 'completed' },
    ];
    stabilizedConversationMessages = [...pendingConversationMessages];
    console.log(`TEST: pendingConversationMessages set to ${pendingConversationMessages.length} items`);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ role: 'user', content, created_date: new Date().toISOString() }) });
  });

  await spaNavigate(page, '/Chat');
  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });

  const input = page.locator('[data-testid="therapist-chat-input"]');
  const sendButton = page.locator('[data-testid="therapist-chat-send"]');
  await input.fill('אני לחוץ לקראת פגישה חשובה מחר.');
  await expect(sendButton).toBeEnabled({ timeout: 5000 });
  await sendButton.click();

  await page.waitForTimeout(15000);

  console.log('\n=== CAPTURED LOGS ===');
  logs.forEach(l => console.log(l));

  // Check page state
  const msgCount = await page.locator('[data-testid="chat-messages"]').count();
  console.log(`chat-messages count: ${msgCount}`);
  
  const replyVisible = await page.getByText('זה נשמע כמו לחץ').count();
  console.log(`reply visible count: ${replyVisible}`);
  
  expect(1).toBe(1);
});

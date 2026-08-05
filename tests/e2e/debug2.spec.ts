import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

test('debug urls', async ({ page }) => {
  const networkLog: string[] = [];
  page.on('request', req => {
    networkLog.push(`REQ ${req.method()} ${req.url()}`);
  });

  await page.addInitScript(() => {
    localStorage.setItem('language', 'he');
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  });

  await mockApi(page);

  let requestsHit: string[] = [];

  await page.route('**/api/**/agents/conversations', async (route) => {
    requestsHit.push('CONV_POST');
    if (route.request().method() !== 'POST') { await route.continue(); return; }
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'test-123', agent_name: 'cbt_therapist', messages: [], created_date: new Date().toISOString() }) });
  });

  await page.route('**/api/**/agents/conversations/test-123**', async (route) => {
    requestsHit.push(`GET_CONV ${route.request().method()}`);
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ id: 'test-123', messages: [], agent_name: 'cbt_therapist', created_date: new Date().toISOString() }) });
  });

  await page.route('**/api/**/agents/conversations/**/messages**', async (route) => {
    requestsHit.push('MSG_POST');
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ role: 'user', content: 'test', created_date: new Date().toISOString() }) });
  });

  await spaNavigate(page, '/Chat');
  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });
  
  const input = page.locator('[data-testid="therapist-chat-input"]');
  const sendButton = page.locator('[data-testid="therapist-chat-send"]');
  await input.fill('Test message');
  await expect(sendButton).toBeEnabled({ timeout: 5000 });
  await sendButton.click();
  await page.waitForTimeout(3000);

  console.log('=== ROUTES HIT ===');
  requestsHit.forEach(r => console.log(r));
  console.log('=== ALL API REQUESTS ===');
  networkLog.filter(l => l.includes('agents') || l.includes('base44') || l.includes('/api/')).forEach(l => console.log(l));
  
  // Just pass - we just want the logs
  expect(1).toBe(1);
});

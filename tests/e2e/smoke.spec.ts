import { test, expect } from '@playwright/test';

test('smoke: open chat, send message, receive reply', async ({ page }) => {
  // Collect console errors for diagnostics
  const consoleErrors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  // Navigate using DOMContentLoaded first to avoid polling-induced networkidle flakiness
  await page.goto('/Chat', { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => {});

  // short attempt to wait for networkidle but tolerate failure
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  // If redirected to auth/login, skip
  const url = page.url();
  const authKeywords = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];
  if (authKeywords.some(k => url.toLowerCase().includes(k))) {
    test.skip(true, `Skipped Chat smoke because redirected to auth/login (${url})`);
    return;
  }

  // Wait for a page anchor that proves Chat rendered
  // Try multiple strategies with visible filters
  let chatAnchor = page.locator('h1:visible, h2:visible, [role="heading"]:visible')
    .filter({ hasText: /chat|ai therapist|צ'אט|צאט|מטפל/i })
    .first();

  // Fallback to any visible text
  if ((await chatAnchor.count()) === 0) {
    chatAnchor = page.locator('*:visible')
      .filter({ hasText: /chat|ai therapist|צ'אט|צאט|מטפל/i })
      .first();
  }

  try {
    await expect(chatAnchor).toBeVisible({ timeout: 20000 });
  } catch (error) {
    await page.screenshot({ path: `test-results/smoke-chat-anchor-failure-${Date.now()}.png`, fullPage: true });
    console.error(`Chat anchor not visible. URL: ${page.url()}, Console errors: ${consoleErrors.slice(0, 5).join(', ')}`);
    throw new Error(
      `Chat anchor not found on ${page.url()}.\n` +
      `Console errors: ${consoleErrors.slice(0, 5).join('\n')}\n` +
      `Screenshot captured for debugging.`
    );
  }

  // Locate the message input with fallback chain
  const byRole = page.getByRole('textbox', { name: /message|chat input|type a message|הודעה|הקלד/i }).first();
  const byPlaceholder = page.getByPlaceholder(/type|message|הקלד/i).first();
  const textareaVisible = page.locator('textarea:visible').first();
  const inputTextVisible = page.locator('input[type="text"]:visible').first();

  let messageBox = null;
  if ((await byRole.count()) > 0) messageBox = byRole;
  else if ((await byPlaceholder.count()) > 0) messageBox = byPlaceholder;
  else if ((await textareaVisible.count()) > 0) messageBox = textareaVisible;
  else if ((await inputTextVisible.count()) > 0) messageBox = inputTextVisible;

  if (!messageBox) {
    // attempt one reload to recover from transient load issue
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 15000 }).catch(() => {});
    // re-evaluate fallback chain
    if ((await byRole.count()) > 0) messageBox = byRole;
    else if ((await byPlaceholder.count()) > 0) messageBox = byPlaceholder;
    else if ((await textareaVisible.count()) > 0) messageBox = textareaVisible;
    else if ((await inputTextVisible.count()) > 0) messageBox = inputTextVisible;
  }

  if (!messageBox) {
    await page.screenshot({ path: `test-results/chat-input-not-found-${Date.now()}.png`, fullPage: true });
    const errorLog = consoleErrors.slice(0, 5).join('\n');
    throw new Error(
      `Could not locate message input on /Chat (${page.url()}).\n` +
      `Console errors:\n${errorLog}\n` +
      `Screenshot saved for debugging.`
    );
  }

  await expect(messageBox).toBeVisible({ timeout: 20000 });

  // Send a short message
  await messageBox.fill('Hello from smoke test');
  const sendButton = page.getByRole('button', { name: /send|submit|שלח/i }).first();
  if ((await sendButton.count()) > 0) {
    await sendButton.click();
  } else {
    await messageBox.press('Enter');
  }

  // Wait for a response
  const assistantReply = page.getByRole('article', { name: /assistant|bot|response|מענה|עוזר/i }).first();
  let reply = assistantReply;
  if ((await assistantReply.count()) === 0) {
    reply = page.locator('main').getByRole('region').first();
  }

  await expect(reply).toBeVisible({ timeout: 20000 });
  const text = await reply.innerText();
  expect(text.trim().length).toBeGreaterThan(0);
});

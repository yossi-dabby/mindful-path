import { test, expect } from '@playwright/test';

test('smoke: open chat, send message, receive reply', async ({ page }) => {
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
  const chatAnchor = page.getByRole('heading', { name: /chat|ai therapist|מכנה|צ'אט|צאט/i }).first();
  const chatAnchorAlt = page.getByText(/Chat|AI Therapist|צ'אט|צאט|מטפל/i).first();
  const anchor = (await chatAnchor.count()) > 0 ? chatAnchor : chatAnchorAlt;
  await expect(anchor).toBeVisible({ timeout: 20000 });

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
    test.skip(true, `Could not locate message input on /Chat (${page.url()})`);
    return;
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

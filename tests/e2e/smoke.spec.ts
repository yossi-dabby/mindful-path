import { test, expect } from '@playwright/test';

// Stable smoke test that works across Desktop and Mobile projects.
// Uses role-based selectors where possible and falls back to keyboard submit.

test('smoke: open chat, send message, receive reply', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:3000/Chat';
  await page.goto(base, { waitUntil: 'networkidle' });

  // Try to find the primary chat input by role. Adjust the name regex to match the app's accessible label.
  const messageBox = page.getByRole('textbox', { name: /message|chat input|type a message/i });
  await expect(messageBox).toBeVisible({ timeout: 10000 });

  // Send a short message
  await messageBox.fill('Hello from smoke test');
  const sendButton = page.getByRole('button', { name: /send|submit/i });
  if (await sendButton.count() > 0) {
    await sendButton.click();
  } else {
    // fallback: press Enter in the textbox
    await messageBox.press('Enter');
  }

  // Wait for a response: prefer a role that represents assistant reply; fall back to first visible article/region
  const assistantReply = page.getByRole('article', { name: /assistant|bot|response/i }).first();
  let reply = assistantReply;
  
  // If article role isn't present in the app, fallback to a visible region element
  if ((await assistantReply.count()) === 0) {
    reply = page.locator('main').getByRole('region').first();
  }

  await expect(reply).toBeVisible({ timeout: 20000 });
  const text = await reply.innerText();
  expect(text.trim().length).toBeGreaterThan(0);
});

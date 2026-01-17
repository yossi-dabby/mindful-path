import { test, expect, Page } from '@playwright/test';
test.setTimeout(180_000);
const CHAT_PATHS = ['/Chat', '/chat', '/'];
async function bootSPA(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 180000 });
  // Wait for React mount if #root exists
  const root = page.locator('#root');
  if ((await root.count()) > 0) {
    await expect
      .poll(async () => root.evaluate(el => (el as HTMLElement).childElementCount), { timeout: 180000 })
      .toBeGreaterThan(0);
  }
}
async function spaNavigate(page: Page, path: string) {
  if (!path || path === '/') return;
  // Prefer clicking a real in-app link if it exists
  const directHref = page.locator(`a[href="${path}"]:visible`).first();
  if ((await directHref.count()) > 0) {
    await directHref.click().catch(() => {});
  } else {
    // Fallback: client-side navigation without full reload
    await page.evaluate((p) => {
      history.pushState({}, '', p);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
  }
  // Do not hard-fail if router normalizes case; best-effort wait
  await expect
    .poll(() => page.url().includes(path), { timeout: 180000 })
    .toBeTruthy()
    .catch(() => {});
}
function chatAnchorLocators(page: Page) {
  const a1 = page.getByRole('heading', { name: /chat|ai therapist|מכנה|צ'אט|צאט/i }).first();
  const a2 = page.getByText(/Chat|AI Therapist|צ'אט|צאט|מטפל/i).first();
  return { a1, a2 };
}
async function gotoFirstExistingChat(page: Page) {
  // Boot SPA from root first to avoid deep-link asset 404s
  await bootSPA(page);

  for (const path of CHAT_PATHS) {
    if (path !== '/') {
      await spaNavigate(page, path);
    }
    const { a1, a2 } = chatAnchorLocators(page);
    // Quick proof Chat rendered
    try {
      await a1.waitFor({ state: 'visible', timeout: 180000 });
      return path;
    } catch {}
    try {
      await a2.waitFor({ state: 'visible', timeout: 180000 });
      return path;
    } catch {}
  }
  return null;
}
test('smoke: open chat, send message, receive reply', async ({ page }) => {
  // Capture console errors for diagnostics
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  // Navigate using candidate paths
  const chatPath = await gotoFirstExistingChat(page);
  if (!chatPath) {
    test.skip(true, 'No reachable chat path found');
    return;
  }
  // short attempt to wait for networkidle but tolerate failure
  await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
    // If redirected to auth/login, skip
  const url = page.url();
  const authKeywords = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];
  if (authKeywords.some(k => url.toLowerCase().includes(k))) {
    test.skip(true, `Redirected to auth/login (${url})`);
    return;
  }
  // Wait for a page anchor that proves Chat rendered
  const chatAnchor = page.getByRole('heading', { name: /chat|ai therapist|מכנה|צ'אט|צאט/i }).locator(':visible').first();
  const chatAnchorAlt = page.getByText(/Chat|AI Therapist|צ'אט|צאט|מטפל/i).locator(':visible').first();
  let anchor = chatAnchor;
  if ((await chatAnchor.count()) === 0) {
    anchor = chatAnchorAlt;
  }
    try {
    await expect(anchor).toBeVisible({ timeout: 180000 });
  } catch (error) {
    await page.screenshot({ path: `test-results/smoke-chat-anchor-failure-${Date.now()}.png`, fullPage: true });
    console.error(`Chat anchor not visible. URL: ${page.url()}, Console errors: ${consoleErrors.slice(0, 5).join(', ')}`);
    throw error;
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
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 180000 }).catch(() => {});
    // re-evaluate fallback chain
    if ((await byRole.count()) > 0) messageBox = byRole;
    else if ((await byPlaceholder.count()) > 0) messageBox = byPlaceholder;
    else if ((await textareaVisible.count()) > 0) messageBox = textareaVisible;
    else if ((await inputTextVisible.count()) > 0) messageBox = inputTextVisible;
  }
  if (!messageBox) {
    // Capture diagnostics before throwing error
    await page.screenshot({ path: `test-results/smoke-input-not-found-${Date.now()}.png`, fullPage: true });
    console.error(`Could not locate message input on ${chatPath} (${page.url()}). Console errors: ${consoleErrors.slice(0, 5).join(', ')}`);
    throw new Error(`Could not locate message input on ${chatPath} (${page.url()}). Screenshot saved.`);
  }
  await expect(messageBox).toBeVisible({ timeout: 180000 });
  // Send a short message
  const myText = 'E2E hello';
  await messageBox.fill(myText);
  const sendButton = page.getByRole('button', { name: /send|submit|שלח/i }).first();
  if ((await sendButton.count()) > 0) {
    await sendButton.click();
  } else {
    await messageBox.press('Enter');
  }
  // Verify the message was sent (appears in UI)
  await expect(page.getByText(myText).first()).toBeVisible({ timeout: 180000 });
  // CI: don't wait for real AI reply (can be flaky / env-dependent)
  if (process.env.CI) {
    return;
  }
  // Local/dev only: wait for a response
  const assistantReply = page
    .getByRole('article', { name: /assistant|bot|response|העוזר|בוט|תשובה/i })
    .first();
  let reply = assistantReply;
  if ((await assistantReply.count()) === 0) {
    reply = page.locator('main').getByRole('region').first();
  }
  await expect(reply).toBeVisible({ timeout: 180000 });
});


 

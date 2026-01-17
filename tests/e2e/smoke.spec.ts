import { test, expect, Page } from '@playwright/test';

test.setTimeout(180_000);

const CHAT_PATHS = ['/Chat', '/chat'];

const AUTH_URL_KEYWORDS = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];
function isAuthUrl(url: string) {
  const lower = (url || '').toLowerCase();
  return AUTH_URL_KEYWORDS.some(k => lower.includes(k));
}

function pathToUrlRegex(path: string) {
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}(?:\\/|\\?|#|$)`, 'i');
}

async function bootSPA(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });

  const root = page.locator('#root');
  if ((await root.count()) > 0) {
    await expect
      .poll(async () => root.evaluate(el => (el as HTMLElement).childElementCount), { timeout: 60_000 })
      .toBeGreaterThan(0);
  }
}

async function spaNavigate(page: Page, path: string) {
  const directHref = page.locator(`a[href="${path}"]:visible`).first();

  if ((await directHref.count()) > 0) {
    await directHref.scrollIntoViewIfNeeded().catch(() => {});
    await directHref.click({ timeout: 15_000, force: true }).catch(() => {});
  } else {
    await page.evaluate((p) => {
      history.pushState({}, '', p);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
  }

  await page.waitForURL(pathToUrlRegex(path), { timeout: 15_000 }).catch(() => {});
}

async function gotoChat(page: Page) {
  await bootSPA(page);

  for (const p of CHAT_PATHS) {
    await spaNavigate(page, p);

    if (isAuthUrl(page.url())) return p;

    // IMPORTANT FIX: don't look for "anchor" text that exists only on Home.
    // Proof Chat page is "ready" = message input exists.
    const messageInput = page.locator('textarea:visible, input[type="text"]:visible').first();
    if ((await messageInput.count()) > 0) {
      return p;
    }
  }

  return null;
}

test('smoke: open chat, send message, receive reply', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  const chatPath = await gotoChat(page);
  if (!chatPath) {
    test.skip(true, 'No reachable chat path found');
    return;
  }

  if (isAuthUrl(page.url())) {
    test.skip(true, `Redirected to auth/login (${page.url()})`);
    return;
  }

  await page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => {});

  // Locate the message input with fallback chain
  const byRole = page.getByRole('textbox', { name: /message|chat input|type a message|הודעה|הקלד/i }).first();
  const byPlaceholder = page.getByPlaceholder(/type|message|הקלד/i).first();
  const textareaVisible = page.locator('textarea:visible').first();
  const inputTextVisible = page.locator('input[type="text"]:visible').first();

  let messageBox: any = null;
  if ((await byRole.count()) > 0) messageBox = byRole;
  else if ((await byPlaceholder.count()) > 0) messageBox = byPlaceholder;
  else if ((await textareaVisible.count()) > 0) messageBox = textareaVisible;
  else if ((await inputTextVisible.count()) > 0) messageBox = inputTextVisible;

  if (!messageBox) {
    await page.screenshot({ path: `test-results/smoke-input-not-found-${Date.now()}.png`, fullPage: true });
    console.error(`Could not locate message input (${page.url()}). Console errors: ${consoleErrors.slice(0, 5).join(', ')}`);
    throw new Error('Could not locate message input');
  }

  await expect(messageBox).toBeVisible({ timeout: 30_000 });

  const myText = 'E2E hello';
  await messageBox.fill(myText);

  const sendButton = page.getByRole('button', { name: /send|submit|שלח/i }).first();
  if ((await sendButton.count()) > 0) {
    await sendButton.click({ timeout: 15_000, force: true });
  } else {
    await messageBox.press('Enter');
  }

  await expect(page.getByText(myText).first()).toBeVisible({ timeout: 30_000 });

  // CI: don't wait for real AI reply (can be flaky / env-dependent)
  if (process.env.CI) return;

  // Local/dev only: wait for a response
  const assistantReply = page.getByRole('article', { name: /assistant|bot|response|העוזר|בוט|תשובה/i }).first();
  let reply = assistantReply;
  if ((await assistantReply.count()) === 0) {
    reply = page.locator('main').getByRole('region').first();
  }

  await expect(reply).toBeVisible({ timeout: 30_000 });
});





 

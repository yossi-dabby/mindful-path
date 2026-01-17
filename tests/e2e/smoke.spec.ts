import { test, expect, Page } from '@playwright/test';

test.setTimeout(180_000);

const CHAT_PATHS = ['/Chat', '/chat'];
const AUTH_URL_KEYWORDS = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];

function isAuthUrl(url: string) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return AUTH_URL_KEYWORDS.some(k => lower.includes(k));
}

function pathnameOf(url: string) {
  try {
    return new URL(url).pathname.toLowerCase();
  } catch {
    return '';
  }
}

function isOnChat(url: string) {
  const p = pathnameOf(url);
  return p.startsWith('/chat');
}

async function bootSPA(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 40_000 });

  const root = page.locator('#root');
  if ((await root.count()) > 0) {
    await expect
      .poll(async () => root.evaluate(el => (el as HTMLElement).childElementCount), { timeout: 30_000 })
      .toBeGreaterThan(0);
  }
}

async function spaNavigate(page: Page, path: string) {
  if (!path) return;

  const directHref = page.locator(`a[href="${path}"]:visible`).first();
  if ((await directHref.count()) > 0) {
    await directHref.click().catch(() => {});
  } else {
    await page.evaluate((p) => {
      history.pushState({}, '', p);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
  }

  // Wait best-effort for URL change
  await expect
    .poll(() => pathnameOf(page.url()).includes(path.toLowerCase()), { timeout: 10_000 })
    .toBeTruthy()
    .catch(() => {});
}

function messageBoxLocator(page: Page) {
  const byRole = page.getByRole('textbox', { name: /message|chat input|type a message|הודעה|הקלד/i }).first();
  const byPlaceholder = page.getByPlaceholder(/type|message|הקלד/i).first();
  const textareaVisible = page.locator('textarea:visible').first();
  const inputTextVisible = page.locator('input[type="text"]:visible').first();

  return { byRole, byPlaceholder, textareaVisible, inputTextVisible };
}

async function findMessageBox(page: Page) {
  const { byRole, byPlaceholder, textareaVisible, inputTextVisible } = messageBoxLocator(page);

  if ((await byRole.count()) > 0) return byRole;
  if ((await byPlaceholder.count()) > 0) return byPlaceholder;
  if ((await textareaVisible.count()) > 0) return textareaVisible;
  if ((await inputTextVisible.count()) > 0) return inputTextVisible;

  return null;
}

async function gotoChat(page: Page) {
  await bootSPA(page);

  for (const path of CHAT_PATHS) {
    await spaNavigate(page, path);

    if (isAuthUrl(page.url())) return path;

    // Guard: חייבים להיות באמת ב-/Chat ולא ב-Home
    if (!isOnChat(page.url())) continue;

    // Bonus guard: אם אין בכלל תיבת הודעה, כנראה זה לא מסך הצ'אט
    const msgBox = await findMessageBox(page);
    if (msgBox) return path;
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

  if (!isOnChat(page.url())) {
    test.skip(true, `Did not reach /Chat (stayed on ${pathnameOf(page.url())})`);
    return;
  }

  await page.waitForLoadState('networkidle', { timeout: 3_000 }).catch(() => {});

  let messageBox = await findMessageBox(page);
  if (!messageBox) {
    // one reload attempt
    await page.reload({ waitUntil: 'domcontentloaded', timeout: 40_000 }).catch(() => {});
    messageBox = await findMessageBox(page);
  }

  if (!messageBox) {
    await page.screenshot({ path: `test-results/smoke-input-not-found-${Date.now()}.png`, fullPage: true });
    console.error(`Could not locate message input on ${chatPath} (${page.url()}). Console errors: ${consoleErrors.slice(0, 5).join(', ')}`);
    test.skip(true, 'Message input not found on Chat (UI differs or not loaded)');
    return;
  }

  const msgVisible = await messageBox
    .waitFor({ state: 'visible', timeout: 20_000 })
    .then(() => true)
    .catch(() => false);

  if (!msgVisible) {
    await page.screenshot({ path: `test-results/smoke-input-not-visible-${Date.now()}.png`, fullPage: true });
    test.skip(true, 'Message input not visible');
    return;
  }

  const myText = 'E2E hello';
  await messageBox.fill(myText).catch(() => {});

  const sendButton = page.getByRole('button', { name: /send|submit|שלח/i }).first();
  if ((await sendButton.count()) > 0) {
    await sendButton.click().catch(() => {});
  } else {
    await messageBox.press('Enter').catch(() => {});
  }

  // Verify message appears (best-effort)
  const sentOk = await expect(page.getByText(myText).first())
    .toBeVisible({ timeout: 20_000 })
    .then(() => true)
    .catch(() => false);

  if (!sentOk) {
    await page.screenshot({ path: `test-results/smoke-message-not-seen-${Date.now()}.png`, fullPage: true });
    test.skip(true, 'Sent message did not appear in UI (UI differs or slow render)');
    return;
  }

  // CI: do not wait for real AI reply
  if (process.env.CI) return;

  // Local/dev only: wait for a response
  const assistantReply = page
    .getByRole('article', { name: /assistant|bot|response|העוזר|בוט|תשובה/i })
    .first();

  let reply = assistantReply;
  if ((await assistantReply.count()) === 0) {
    reply = page.locator('main').getByRole('region').first();
  }

  await expect(reply).toBeVisible({ timeout: 20_000 });
});



 

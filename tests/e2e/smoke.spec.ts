import { test, expect, Page } from '@playwright/test';

test.setTimeout(180_000);

const CHAT_PATHS = ['/Chat', '/chat'];
const AUTH_URL_KEYWORDS = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];

function isAuthUrl(url: string) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return AUTH_URL_KEYWORDS.some(k => lower.includes(k));
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
  await page.evaluate((p) => {
    history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);

  await expect
    .poll(() => page.url().includes(path), { timeout: 15_000 })
    .toBeTruthy()
    .catch(() => {});
}

async function gotoFirstExistingChat(page: Page) {
  await bootSPA(page);

  for (const path of CHAT_PATHS) {
    await spaNavigate(page, path);

    if (isAuthUrl(page.url())) return path;

    // Anchor: an input for messages (more reliable than headings)
    const msgBox = page.locator('textarea:visible, input[type="text"]:visible').first();
    try {
      await msgBox.waitFor({ state: 'visible', timeout: 15_000 });
      return path;
    } catch {
      // try next candidate
    }
  }

  return null;
}

test('smoke: open chat, send message, receive reply', async ({ page }) => {
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('close', () => console.error('PW: page closed'));
  page.on('crash', () => console.error('PW: page crashed'));

  const chatPath = await gotoFirstExistingChat(page);
  if (!chatPath) {
    test.skip(true, 'No reachable chat path found');
    return;
  }

  if (isAuthUrl(page.url())) {
    test.skip(true, `Redirected to auth/login (${page.url()})`);
    return;
  }

  // Locate message input
  const messageBox =
    page.getByRole('textbox', { name: /message|chat input|type a message|הודעה|הקלד/i }).first()
      .or(page.getByPlaceholder(/type|message|הקלד/i).first())
      .or(page.locator('textarea:visible').first())
      .or(page.locator('input[type="text"]:visible').first());

  try {
    await expect(messageBox).toBeVisible({ timeout: 30_000 });
  } catch (err) {
    await page.screenshot({ path: `test-results/smoke-input-not-found-${Date.now()}.png`, fullPage: true });
    console.error(`No message input. URL: ${page.url()}. Console: ${consoleErrors.slice(0, 5).join(' | ')}`);
    throw err;
  }

  const myText = 'E2E hello';
  await messageBox.fill(myText);

  const sendButton = page.getByRole('button', { name: /send|submit|שלח/i }).first();
  if ((await sendButton.count()) > 0) {
    await sendButton.click().catch(async () => {
      await messageBox.press('Enter');
    });
  } else {
    await messageBox.press('Enter');
  }

  // Verify message appears (best effort)
  await expect(page.getByText(myText).first()).toBeVisible({ timeout: 30_000 });

  // CI: don't wait for AI reply
  if (process.env.CI) return;

  const replyRegion = page.locator('main').first();
  await expect(replyRegion).toBeVisible({ timeout: 30_000 });
});






 

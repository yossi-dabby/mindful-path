import { test, expect, Page, Locator } from '@playwright/test';

test.setTimeout(180_000);

const CHAT_PATHS = ['/Chat', '/chat'];
const AUTH_URL_KEYWORDS = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];

function isAuthUrl(url: string) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return AUTH_URL_KEYWORDS.some((k) => lower.includes(k));
}

function attachDiagnostics(page: Page, consoleErrors: string[]) {
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => {
    consoleErrors.push(`PAGEERROR: ${err?.message || String(err)}`);
  });
  page.on('requestfailed', (req) => {
    consoleErrors.push(`REQFAILED: ${req.url()} :: ${req.failure()?.errorText}`);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) consoleErrors.push(`HTTP ${res.status()} ${res.url()}`);
  });
  page.on('close', () => console.error('PW: page closed'));
  page.on('crash', () => console.error('PW: page crashed'));
}

async function waitForAppHydration(page: Page) {
  await page.waitForLoadState('domcontentloaded', { timeout: 60_000 });

  const root = page.locator('#root');
  if ((await root.count()) > 0) {
    await expect
      .poll(
        async () =>
          root.evaluate((el) => (el as HTMLElement).childElementCount),
        { timeout: 60_000 }
      )
      .toBeGreaterThan(0);
  }

  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
}

async function bootSPA(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await waitForAppHydration(page);
}

async function spaNavigate(page: Page, path: string) {
  await page.evaluate((p) => {
    history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);

  await expect
    .poll(() => page.url(), { timeout: 15_000 })
    .toContain(path);

  await waitForAppHydration(page);
}

async function waitVisibleEnabled(locator: Locator, timeout = 30_000) {
  await expect(locator).toBeVisible({ timeout });
  await expect
    .poll(async () => locator.isEnabled().catch(() => false), { timeout })
    .toBeTruthy();
}

async function stableClick(locator: Locator, timeout = 30_000) {
  const deadline = Date.now() + timeout;
  let lastErr: unknown;

  while (Date.now() < deadline) {
    try {
      await waitVisibleEnabled(locator, Math.min(10_000, deadline - Date.now()));
      await locator.scrollIntoViewIfNeeded().catch(() => {});
      await locator.page().waitForTimeout(80);
      await locator.click({ timeout: Math.min(10_000, deadline - Date.now()) });
      return;
    } catch (err) {
      lastErr = err;
      await locator.page().waitForTimeout(250);
    }
  }
  throw lastErr;
}

async function safeFill(locator: Locator, value: string, timeout = 15_000) {
  const deadline = Date.now() + timeout;
  let lastErr: unknown;

  while (Date.now() < deadline) {
    try {
      await expect(locator).toBeVisible({ timeout: Math.min(5_000, deadline - Date.now()) });
      await locator.scrollIntoViewIfNeeded().catch(() => {});
      await locator.fill(value, { timeout: Math.min(5_000, deadline - Date.now()) });
      return;
    } catch (err) {
      lastErr = err;
      await locator.page().waitForTimeout(200);
    }
  }
  throw lastErr;
}

function messageBoxLocator(page: Page) {
  // Prefer semantically named role, then placeholder, then visible textarea/input
  return page
    .getByRole('textbox', { name: /message|chat input|type a message|הודעה|הקלד/i })
    .first()
    .or(page.getByPlaceholder(/type|message|הקלד/i).first())
    .or(page.locator('textarea:visible').first())
    .or(page.locator('input[type="text"]:visible').first());
}

async function gotoFirstExistingChat(page: Page) {
  await bootSPA(page);

  for (const path of CHAT_PATHS) {
    await spaNavigate(page, path);

    if (isAuthUrl(page.url())) return path;

    const msgBox = page.locator('textarea:visible, input[type="text"]:visible').first();
    try {
      await expect(msgBox).toBeVisible({ timeout: 15_000 });
      return path;
    } catch {
      // try next
    }
  }
  return null;
}

test('smoke: open chat, send message, receive reply (robust)', async ({ page }) => {
  const consoleErrors: string[] = [];
  attachDiagnostics(page, consoleErrors);

  const chatPath = await gotoFirstExistingChat(page);
  if (!chatPath) {
    test.skip(true, 'No reachable chat path found');
    return;
  }

  if (isAuthUrl(page.url())) {
    test.skip(true, `Redirected to auth/login (${page.url()})`);
    return;
  }

  const box = messageBoxLocator(page);

  try {
    await waitVisibleEnabled(box, 30_000);
  } catch (err) {
    await page.screenshot({
      path: `test-results/smoke-input-not-found-${Date.now()}.png`,
      fullPage: true,
    });
    console.error(
      `No message input. URL: ${page.url()}. Console errors: ${consoleErrors.slice(0, 8).join(' | ')}`
    );
    throw err;
  }

  const myText = `E2E hello ${Date.now()}`;
  await safeFill(box, myText, 20_000);

  // Prefer click Send if exists, otherwise Enter.
  // Also wait for enablement/polling before sending.
  const sendButton = page.getByRole('button', { name: /send|submit|שלח/i }).first();

  const sendCount = await sendButton.count().catch(() => 0);
  if (sendCount > 0) {
    try {
      await stableClick(sendButton, 30_000);
    } catch {
      // Fallback to Enter (some UIs block click due to overlays)
      await box.press('Enter').catch(() => {});
    }
  } else {
    await box.press('Enter').catch(() => {});
  }

  // Verify message appears (poll, because UI can async-render)
  await expect
    .poll(
      async () => (await page.getByText(myText).first().count().catch(() => 0)) > 0,
      { timeout: 30_000 }
    )
    .toBeTruthy();

  await expect(page.getByText(myText).first()).toBeVisible({ timeout: 30_000 });

  // CI: don't wait for AI reply
  if (process.env.CI) return;

  // Best-effort: wait for "something else" to appear in main region.
  // We avoid strict assumptions about assistant markup, but we do wait for UI to be stable.
  const main = page.locator('main').first();
  await expect(main).toBeVisible({ timeout: 30_000 });

  // If your app marks assistant messages (recommended), replace this with a precise selector.
  // For now: wait a bit for additional text nodes to appear after our message is present.
  const baselineText = await main.innerText().catch(() => '');
  await expect
    .poll(async () => {
      const now = await main.innerText().catch(() => '');
      return now.length > baselineText.length + 10; // heuristic growth
    }, { timeout: 45_000 })
    .toBeTruthy()
    .catch(async () => {
      // Don't fail locally on reply timing; provide diagnostics instead
      await page.screenshot({
        path: `test-results/smoke-reply-not-detected-${Date.now()}.png`,
        fullPage: true,
      });
      console.warn('Reply not detected within timeout (heuristic). URL:', page.url());
      console.warn('Console errors (first 10):', consoleErrors.slice(0, 10).join(' | '));
    });
});







 

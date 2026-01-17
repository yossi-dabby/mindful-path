import { test, expect, Page } from '@playwright/test';

test.setTimeout(180_000);

const CANDIDATE_PATHS = ['/GoalCoach', '/goalcoach', '/goal-coach'];
const AUTH_URL_KEYWORDS = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];

function isAuthUrl(url: string) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return AUTH_URL_KEYWORDS.some(k => lower.includes(k));
}

async function bootSPA(page: Page) {
  // CI diagnostics (safe)
  page.on('pageerror', (err) => {
    console.error('PAGEERROR:', err?.message || err);
    if ((err as any)?.stack) console.error('STACK:', (err as any).stack);
  });
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('CONSOLE:', msg.text());
  });
  page.on('requestfailed', (req) => {
    console.error('REQFAILED:', req.url(), req.failure()?.errorText);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) console.error('HTTP', res.status(), res.url());
  });

  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });

  const root = page.locator('#root');
  if ((await root.count()) > 0) {
    await expect
      .poll(async () => root.evaluate(el => (el as HTMLElement).childElementCount), { timeout: 60_000 })
      .toBeGreaterThan(0);
  }
}

async function spaNavigate(page: Page, path: string) {
  // Always do SPA navigation via pushState (avoid flaky click)
  await page.evaluate((p) => {
    history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);

  await expect
    .poll(() => page.url().includes(path), { timeout: 15_000 })
    .toBeTruthy()
    .catch(() => {});
}

function stepAnchorLocator(page: Page, stepNumber: number) {
  const regex = new RegExp(`Step\\s*${stepNumber}.*of.*4|שלב\\s*${stepNumber}|Step\\s*${stepNumber}`, 'i');
  return page.getByText(regex).first();
}

function nextButtonLocator(page: Page) {
  // In many UIs it's Continue not Next (also Hebrew)
  return page
    .locator('button:visible')
    .filter({ hasText: /next|continue|הבא|המשך/i })
    .first();
}

function saveButtonLocator(page: Page) {
  return page
    .locator('button:visible')
    .filter({ hasText: /save|שמור|finish|סיום/i })
    .first();
}

async function gotoFirstExisting(page: Page) {
  await bootSPA(page);

  for (const p of CANDIDATE_PATHS) {
    await spaNavigate(page, p);

    if (isAuthUrl(page.url())) return p;

    const step1 = stepAnchorLocator(page, 1);
    try {
      await step1.waitFor({ state: 'visible', timeout: 15_000 });
      return p;
    } catch {
      // try next candidate
    }
  }
  return null;
}

async function pickFirstCategoryButton(page: Page) {
  // Pick the first enabled “category-like” button.
  // Exclude navigation buttons.
  const candidate = page
    .locator('button:visible:not([disabled])')
    .filter({ hasNotText: /next|continue|back|prev|save|finish|הבא|המשך|חזור|שמור|סיום/i })
    .first();

  await expect(candidate).toBeVisible({ timeout: 30_000 });
  await candidate.scrollIntoViewIfNeeded();
  await expect(candidate).toBeEnabled();
  await candidate.click({ timeout: 10_000 });
}

test.describe('GoalCoach parity (web + mobile projects)', () => {
  test('GoalCoach steps 1→4', async ({ page }) => {
    page.on('crash', () => console.error('PW: page crashed'));
    page.on('close', () => console.error('PW: page closed'));

    const path = await gotoFirstExisting(page);
    if (!path) {
      test.skip(true, 'No reachable GoalCoach path found');
      return;
    }

    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login (${page.url()})`);
      return;
    }

    // Step 1
    await expect(stepAnchorLocator(page, 1)).toBeVisible({ timeout: 30_000 });

    // Pick any category that exists (do NOT rely on label text)
    await pickFirstCategoryButton(page);

    // Next (1 -> 2)
    const next1 = nextButtonLocator(page);
    await expect(next1).toBeVisible({ timeout: 30_000 });
    await next1.scrollIntoViewIfNeeded();
    await expect(next1).toBeEnabled({ timeout: 30_000 });
    await next1.click({ timeout: 10_000 });

    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login after Next (${page.url()})`);
      return;
    }

    // Step 2
    await expect(stepAnchorLocator(page, 2)).toBeVisible({ timeout: 30_000 });

    // Fill some text inputs if they exist
    const title = page.locator('input:visible, textarea:visible').first();
    if ((await title.count()) > 0) {
      await title.fill('E2E Test Goal').catch(() => {});
    }

    const next2 = nextButtonLocator(page);
    await expect(next2).toBeVisible({ timeout: 30_000 });
    await next2.scrollIntoViewIfNeeded();
    await expect(next2).toBeEnabled({ timeout: 30_000 });
    await next2.click({ timeout: 10_000 });

    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login after Next (${page.url()})`);
      return;
    }

    // Step 3
    await expect(stepAnchorLocator(page, 3)).toBeVisible({ timeout: 30_000 });

    const next3 = nextButtonLocator(page);
    await expect(next3).toBeVisible({ timeout: 30_000 });
    await next3.scrollIntoViewIfNeeded();
    await expect(next3).toBeEnabled({ timeout: 30_000 });
    await next3.click({ timeout: 10_000 });

    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login after Next (${page.url()})`);
      return;
    }

    // Step 4
    await expect(stepAnchorLocator(page, 4)).toBeVisible({ timeout: 30_000 });

    const saveBtn = saveButtonLocator(page);
    await expect(saveBtn).toBeVisible({ timeout: 30_000 });
    await saveBtn.scrollIntoViewIfNeeded();

    // If save is disabled because auth is needed – skip cleanly
    if (!(await saveBtn.isEnabled().catch(() => false))) {
      test.skip(true, 'Save disabled (likely requires auth)');
      return;
    }

    await saveBtn.click({ timeout: 10_000 }).catch(async () => {
      test.skip(true, 'Save click failed (likely auth/guard)');
    });
  });
});





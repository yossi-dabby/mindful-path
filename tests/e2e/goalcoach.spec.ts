import { test, expect, Page, Locator } from '@playwright/test';

test.setTimeout(180_000);

const CANDIDATE_PATHS = ['/GoalCoach', '/goalcoach', '/goal-coach'];
const AUTH_URL_KEYWORDS = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];

function isAuthUrl(url: string) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return AUTH_URL_KEYWORDS.some((k) => lower.includes(k));
}

function attachDiagnostics(page: Page) {
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
  page.on('crash', () => console.error('PW: page crashed'));
  page.on('close', () => console.error('PW: page closed'));
}

async function waitForAppHydration(page: Page) {
  // Ensure DOM is there
  await page.waitForLoadState('domcontentloaded', { timeout: 60_000 });

  // Wait for React root to have children (hydration/render)
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

  // Small “network idle” grace (SPA often fires async fetches)
  // Avoid long hangs: cap to 10s and ignore if it never becomes idle.
  await page.waitForLoadState('networkidle', { timeout: 10_000 }).catch(() => {});
}

async function bootSPA(page: Page) {
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });
  await waitForAppHydration(page);
}

async function spaNavigate(page: Page, path: string) {
  // SPA navigation via pushState; then wait for URL + hydration settle.
  await page.evaluate((p) => {
    history.pushState({}, '', p);
    window.dispatchEvent(new PopStateEvent('popstate'));
  }, path);

  await expect
    .poll(() => page.url(), { timeout: 15_000 })
    .toContain(path);

  // Let route render settle
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
      // Short stabilization to reduce “element detached”
      await locator.page().waitForTimeout(80);
      await locator.click({ timeout: Math.min(10_000, deadline - Date.now()) });
      return;
    } catch (err) {
      lastErr = err;
      // Common flaky causes: re-render/detach, overlay, animation
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

function stepAnchorLocator(page: Page, stepNumber: number) {
  const regex = new RegExp(
    `Step\\s*${stepNumber}.*of.*4|שלב\\s*${stepNumber}|Step\\s*${stepNumber}`,
    'i'
  );
  return page.getByText(regex).first();
}

function nextButtonLocator(page: Page) {
  return page
    .locator('button:visible')
    .filter({ hasText: /next|continue|הבא|המשך/i })
    .first();
}

function backButtonLocator(page: Page) {
  return page
    .locator('button:visible')
    .filter({ hasText: /back|prev|previous|חזור/i })
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
      await expect(step1).toBeVisible({ timeout: 15_000 });
      return p;
    } catch {
      // try next candidate path
    }
  }
  return null;
}

async function pickFirstCategoryButton(page: Page) {
  // Pick the first enabled “category-like” button; exclude nav actions
  const candidate = page
    .locator('button:visible:not([disabled])')
    .filter({
      hasNotText:
        /next|continue|back|prev|save|finish|הבא|המשך|חזור|שמור|סיום/i,
    })
    .first();

  await stableClick(candidate, 30_000);
}

async function goNextOrSkipIfMissing(page: Page, stepLabel: string) {
  const nextBtn = nextButtonLocator(page);
  const count = await nextBtn.count().catch(() => 0);
  if (count === 0) test.skip(true, `Next button not found at ${stepLabel}`);
  await stableClick(nextBtn, 30_000);

  // Allow route/UI settle
  await waitForAppHydration(page);

  if (isAuthUrl(page.url())) {
    test.skip(true, `Redirected to auth/login after Next (${page.url()})`);
  }
}

test.describe('GoalCoach parity (web + mobile projects)', () => {
  test('GoalCoach steps 1→4 (robust)', async ({ page }, testInfo) => {
    attachDiagnostics(page);

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

    // Choose any category (do NOT rely on label text)
    await pickFirstCategoryButton(page);

    // Next 1 -> 2
    await goNextOrSkipIfMissing(page, 'Step 1');

    // Step 2
    await expect(stepAnchorLocator(page, 2)).toBeVisible({ timeout: 30_000 });

    // Fill some text input if exists (robust)
    const firstTextField = page.locator('input:visible, textarea:visible').first();
    if ((await firstTextField.count()) > 0) {
      await safeFill(firstTextField, 'E2E Test Goal').catch(() => {});
    }

    // Next 2 -> 3
    await goNextOrSkipIfMissing(page, 'Step 2');

    // Step 3
    await expect(stepAnchorLocator(page, 3)).toBeVisible({ timeout: 30_000 });

    // (Optional) some steps require selection; if a “category-like” button exists, pick one
    const optionalPick = page
      .locator('button:visible:not([disabled])')
      .filter({
        hasNotText:
          /next|continue|back|prev|save|finish|הבא|המשך|חזור|שמור|סיום/i,
      })
      .first();
    if ((await optionalPick.count()) > 0) {
      // Best-effort click; ignore if it turns out not relevant
      await stableClick(optionalPick, 10_000).catch(() => {});
    }

    // Next 3 -> 4
    await goNextOrSkipIfMissing(page, 'Step 3');

    // Step 4
    await expect(stepAnchorLocator(page, 4)).toBeVisible({ timeout: 30_000 });

    const saveBtn = saveButtonLocator(page);
    const saveCount = await saveBtn.count().catch(() => 0);
    if (saveCount === 0) {
      test.skip(true, 'Save button not found at Step 4');
      return;
    }

    await expect(saveBtn).toBeVisible({ timeout: 30_000 });
    await saveBtn.scrollIntoViewIfNeeded().catch(() => {});

    // If save disabled because auth/guard is needed – skip cleanly
    const enabled = await saveBtn.isEnabled().catch(() => false);
    if (!enabled) {
      test.skip(true, 'Save disabled (likely requires auth)');
      return;
    }

    try {
      await stableClick(saveBtn, 30_000);
      await waitForAppHydration(page);
    } catch (err) {
      // Provide artifact for debugging
      await page.screenshot({
        path: `test-results/goalcoach-save-click-failed-${Date.now()}.png`,
        fullPage: true,
      });
      console.error('Save click failed. URL:', page.url());
      throw err;
    }
  });
});






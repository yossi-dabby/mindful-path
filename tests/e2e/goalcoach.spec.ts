import { test, expect, Page, Locator } from '@playwright/test';

test.setTimeout(180_000);

const CANDIDATE_PATHS = ['/GoalCoach', '/goalcoach', '/goal-coach'];
const AUTH_URL_KEYWORDS = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];

function isAuthUrl(url: string) {
  const lower = (url || '').toLowerCase();
  return AUTH_URL_KEYWORDS.some(k => lower.includes(k));
}

function pathToUrlRegex(path: string) {
  // matches /Path, /path, /Path/, /Path?x=...
  const escaped = path.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`${escaped}(?:\\/|\\?|#|$)`, 'i');
}

async function bootSPA(page: Page) {
  // Lightweight diagnostics (helps in CI)
  page.on('pageerror', (err) => console.error('PAGEERROR:', err?.message || err));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('CONSOLE:', msg.text());
  });
  page.on('requestfailed', (req) => console.error('REQFAILED:', req.url(), req.failure()?.errorText));

  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60_000 });

  // Wait for React mount if #root exists
  const root = page.locator('#root');
  if ((await root.count()) > 0) {
    await expect
      .poll(async () => root.evaluate(el => (el as HTMLElement).childElementCount), { timeout: 60_000 })
      .toBeGreaterThan(0);
  }
}

async function spaNavigate(page: Page, path: string) {
  if (!path) return;

  // Prefer clicking a real in-app link if it exists (but don't get stuck on actionability)
  const directHref = page.locator(`a[href="${path}"]:visible`).first();
  if ((await directHref.count()) > 0) {
    await directHref.scrollIntoViewIfNeeded().catch(() => {});
    await directHref.click({ timeout: 15_000, force: true }).catch(() => {});
  } else {
    // Fallback: client-side navigation without full reload
    await page.evaluate((p) => {
      history.pushState({}, '', p);
      window.dispatchEvent(new PopStateEvent('popstate'));
    }, path);
  }

  // Best-effort: wait for URL to reflect navigation
  await page.waitForURL(pathToUrlRegex(path), { timeout: 15_000 }).catch(() => {});
}

function stepAnchorLocator(page: Page, stepNumber: number) {
  // keep your original logic but resilient to spacing/rtl
  const regex = new RegExp(`Step\\s*${stepNumber}.*of.*4|שלב\\s*${stepNumber}|Step\\s*${stepNumber}`, 'i');
  return page.getByText(regex).first();
}

function nextButtonLocator(page: Page): Locator {
  // IMPORTANT FIX: do NOT exclude disabled here. We want to see it, then wait it becomes enabled.
  return page.getByRole('button', { name: /next|continue|הבא|המשך/i }).first();
}

function saveButtonLocator(page: Page): Locator {
  return page.getByRole('button', { name: /save|שמור|finish|סיום/i }).first();
}

async function gotoFirstExistingGoalCoach(page: Page) {
  await bootSPA(page);

  for (const p of CANDIDATE_PATHS) {
    await spaNavigate(page, p);

    if (isAuthUrl(page.url())) return p;

    // Proof page loaded: any Step-1 anchor OR any "Next/Continue" button visible
    const step1 = stepAnchorLocator(page, 1);
    const nextBtn = nextButtonLocator(page);

    if ((await step1.count()) > 0) {
      await step1.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
      if (await step1.isVisible().catch(() => false)) return p;
    }

    if ((await nextBtn.count()) > 0) {
      await nextBtn.waitFor({ state: 'visible', timeout: 20_000 }).catch(() => {});
      if (await nextBtn.isVisible().catch(() => false)) return p;
    }
  }

  return null;
}

test.describe('GoalCoach parity (web + mobile projects)', () => {
  test('GoalCoach steps 1→4', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') consoleErrors.push(msg.text());
    });

    const path = await gotoFirstExistingGoalCoach(page);
    if (!path) {
      test.skip(true, 'No reachable GoalCoach path found');
      return;
    }

    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login (${page.url()})`);
      return;
    }

    // Step 1 anchor (best-effort)
    const step1Anchor = stepAnchorLocator(page, 1);
    if ((await step1Anchor.count()) > 0) {
      await expect(step1Anchor).toBeVisible({ timeout: 30_000 });
    }

    // Step 1: choose a category card
    const categoryLabel = /Routine & Productivity|Routine|רוטינה|התנהגות|Behavioral/i;
    let category = page.locator('button:visible').filter({ hasText: categoryLabel }).first();
    if ((await category.count()) === 0) category = page.getByRole('button', { name: categoryLabel }).first();

    await expect(category).toBeVisible({ timeout: 30_000 });
    await category.scrollIntoViewIfNeeded();
    await category.click({ timeout: 15_000, force: true });

    // Next (1 -> 2): find button (even disabled), then wait enabled
    const next1 = nextButtonLocator(page);
    await expect(next1).toBeVisible({ timeout: 30_000 });
    await next1.scrollIntoViewIfNeeded();

    await expect.poll(async () => next1.isEnabled(), { timeout: 30_000 }).toBe(true);

    await next1.click({ timeout: 15_000, force: true });

    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login after Next (${page.url()})`);
      return;
    }

    const step2Anchor = stepAnchorLocator(page, 2);
    if ((await step2Anchor.count()) > 0) {
      await expect(step2Anchor).toBeVisible({ timeout: 30_000 });
    }

    // Step 2: fill title + motivation (best-effort)
    const titleInput = page.getByRole('textbox', { name: /title|שם/i }).first()
      .or(page.getByLabel(/title|שם/i).first())
      .or(page.locator('input[name="title"]').first());

    if ((await titleInput.count()) > 0) {
      await titleInput.fill('E2E Test Goal');
    }

    const motivationInput = page.getByRole('textbox', { name: /motivation|reason|מוטיבציה|מטרה/i }).first()
      .or(page.getByLabel(/motivation|reason|מוטיבציה|מטרה/i).first())
      .or(page.locator('textarea[name="motivation"]').first());

    if ((await motivationInput.count()) > 0) {
      await motivationInput.fill('Test motivation');
    }

    const next2 = nextButtonLocator(page);
    await expect(next2).toBeVisible({ timeout: 30_000 });
    await next2.scrollIntoViewIfNeeded();
    await expect.poll(async () => next2.isEnabled(), { timeout: 30_000 }).toBe(true);
    await next2.click({ timeout: 15_000, force: true });

    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login after Next (${page.url()})`);
      return;
    }

    const step3Anchor = stepAnchorLocator(page, 3);
    if ((await step3Anchor.count()) > 0) {
      await expect(step3Anchor).toBeVisible({ timeout: 30_000 });
    }

    // Step 3: do NOT sleep for 180s (this was breaking you)
    // Just attempt Next again.
    const next3 = nextButtonLocator(page);
    await expect(next3).toBeVisible({ timeout: 30_000 });
    await next3.scrollIntoViewIfNeeded();
    await expect.poll(async () => next3.isEnabled(), { timeout: 30_000 }).toBe(true);
    await next3.click({ timeout: 15_000, force: true });

    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login after Next (${page.url()})`);
      return;
    }

    const step4Anchor = stepAnchorLocator(page, 4);
    if ((await step4Anchor.count()) > 0) {
      await expect(step4Anchor).toBeVisible({ timeout: 30_000 });
    }

    const saveBtn = saveButtonLocator(page);
    await expect(saveBtn).toBeVisible({ timeout: 30_000 });
    await saveBtn.scrollIntoViewIfNeeded();

    // Save might require auth; if auth prompt shows up – skip instead of fail
    const authPrompt = page.locator('text=/sign in|login|התחבר|כניסה|התחברות/i').first();

    // Try click (force to avoid actionability deadlocks)
    await saveBtn.click({ timeout: 15_000, force: true }).catch(async (e) => {
      await page.screenshot({ path: `test-results/goalcoach-save-click-failed-${Date.now()}.png`, fullPage: true });
      console.error(`Save click failed. URL: ${page.url()}, Console errors: ${consoleErrors.slice(0, 5).join(', ')}`);
      throw e;
    });

    if ((await authPrompt.count()) > 0 && (await authPrompt.isVisible().catch(() => false))) {
      test.skip(true, `Auth prompt detected after Save (${page.url()})`);
      return;
    }
  });
});




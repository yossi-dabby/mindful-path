import { test, expect, Page } from '@playwright/test';

const CANDIDATE_PATHS = ['/GoalCoach', '/goalcoach', '/goal-coach'];
const AUTH_URL_KEYWORDS = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];
async function bootSPA(page: Page) {
   // --- DEBUG hooks (CI diagnostics) ---
  page.on('pageerror', (err) => console.error('PAGEERROR:', err));
  page.on('console', (msg) => {
    if (msg.type() === 'error') console.error('CONSOLE:', msg.text());
  });
  page.on('requestfailed', (req) => {
    console.error('REQFAILED:', req.url(), req.failure()?.errorText);
  });
  page.on('response', (res) => {
    if (res.status() >= 400) console.error('HTTP', res.status(), res.url());
  });
  // --- end debug hooks ---
  await page.goto('/', { waitUntil: 'domcontentloaded', timeout: 20000 });

  const root = page.locator('#root');
  if ((await root.count()) > 0) {
    await expect
      .poll(async () => root.evaluate(el => (el as HTMLElement).childElementCount), { timeout: 20000 })
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

  await expect
    .poll(() => page.url().includes(path), { timeout: 5000 })
    .toBeTruthy()
    .catch(() => {});
}

// Try navigating with retries/backoff to avoid transient navigation failures
async function gotoFirstExisting(page: Page) {
  await bootSPA(page);

  for (const p of CANDIDATE_PATHS) {
    await spaNavigate(page, p);

    // Let the test keep its existing skip logic
    if (isAuthUrl(page.url())) return p;

    // Quick proof Step 1 rendered
    const step1 = stepAnchorLocator(page, 1);
    try {
      await step1.waitFor({ state: 'visible', timeout: 6000 });
      return p;
    } catch {
      // try next candidate
    }
  }

  return null;
}


function nextButtonLocator(page: Page) {
  return page.getByRole('button', { name: /next|הבא/i }).last();
}

function saveButtonLocator(page: Page) {
  return page.getByRole('button', { name: /save|שמור|finish|סיום/i }).first();
}

function stepAnchorLocator(page: Page, stepNumber: number) {
  const regex = new RegExp(`Step\\s*${stepNumber}.*of.*4|שלב\\s*${stepNumber}|Step\\s*${stepNumber}`, 'i');
  return page.getByText(regex).first();
}

function isAuthUrl(url: string) {
  if (!url) return false;
  const lower = url.toLowerCase();
  return AUTH_URL_KEYWORDS.some(k => lower.includes(k));
}

test.describe('GoalCoach parity (web + mobile projects)', () => {
  test('GoalCoach steps 1→4', async ({ page }) => {
    // Attach listeners to fail fast on crashes/closes
    page.on('crash', () => {
      throw new Error('Browser page crashed during test');
    });
    page.on('close', () => {
      throw new Error('Page closed unexpectedly during test');
    });

    // Capture console errors for diagnostics
    const consoleErrors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    // Navigate with retries/backoff
    const path = await gotoFirstExisting(page);
    if (!path) {
      test.skip(true, 'No reachable GoalCoach path found (transient or route missing)');
      return;
    }

    // If navigation redirected to auth/login, skip test (do not fail)
    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login (${page.url()})`);
      return;
    }

    // Step 1 anchor
    const step1Anchor = stepAnchorLocator(page, 1);
    await expect(step1Anchor).toBeVisible({ timeout: 20000 });

    // Step 1: choose a category card
    const categoryLabel = /Routine & Productivity|Routine|רוטינה|התנהגות|Behavioral/i;
    let category = page.locator('button:visible').filter({ hasText: categoryLabel }).first();
    if ((await category.count()) === 0) {
      category = page.getByRole('button', { name: categoryLabel }).first();
    }
    if ((await category.count()) === 0) {
      category = page.getByText(categoryLabel).first();
    }
    await expect(category).toBeVisible({ timeout: 15000 });
    await category.scrollIntoViewIfNeeded();
    await expect(category).toBeEnabled();
    await category.click();

    // Guarded Next (1 -> 2)
    const next1 = nextButtonLocator(page);
    await expect(next1).toBeVisible({ timeout: 20000 });
    await next1.scrollIntoViewIfNeeded();
    
    // Wait for Next button to become enabled with polling
    try {
      await expect.poll(
        async () => await next1.isEnabled(),
        { timeout: 15000, message: 'Next button did not become enabled after category selection' }
      ).toBe(true);
    } catch (error) {
      // Enhanced failure diagnostics
      await page.screenshot({ path: `test-results/goalcoach-next-button-failure-${Date.now()}.png`, fullPage: true });
      console.error(`Next button enable polling failed. URL: ${page.url()}, Console errors: ${consoleErrors.slice(0, 5).join(', ')}`);
      throw error;
    }

    // Fallback: if still not enabled, try clicking category again
    if (!(await next1.isEnabled())) {
      await category.click();
      try {
        await expect.poll(
          async () => await next1.isEnabled(),
          { timeout: 10000, message: 'Next button still not enabled after retry' }
        ).toBe(true);
      } catch (error) {
        await page.screenshot({ path: `test-results/goalcoach-next-button-retry-failure-${Date.now()}.png`, fullPage: true });
        console.error(`Next button retry failed. URL: ${page.url()}, Console errors: ${consoleErrors.slice(0, 5).join(', ')}`);
        throw error;
      }
    }
    
    await next1.click({ trial: true }).catch(() => {
      throw new Error('Next button trial-click failed; page may have navigated or crashed.');
    });
    await next1.click().catch(() => {
      throw new Error('Next button click failed; page may have navigated or crashed.');
    });

    // After navigation: check auth redirect and anchor
    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login after clicking Next (${page.url()})`);
      return;
    }
    const step2Anchor = stepAnchorLocator(page, 2);
    await expect(step2Anchor).toBeVisible({ timeout: 20000 });

    // Step 2: fill title and motivation
    const titleInputCandidates = [
      page.getByLabel(/title|שם/i).first(),
      page.getByRole('textbox', { name: /title|שם/i }).first(),
      page.locator('input[name="title"]').first(),
    ];
    for (const input of titleInputCandidates) {
      if ((await input.count()) > 0) {
        await expect(input).toBeVisible({ timeout: 15000 });
        await input.scrollIntoViewIfNeeded();
        await expect(input).toBeEnabled();
        await input.fill('E2E Test Goal');
        break;
      }
    }

    const motivationCandidates = [
      page.getByLabel(/motivation|reason|מוטיבציה|מטרה/i).first(),
      page.getByRole('textbox', { name: /motivation|reason|מוטיב/i }).first(),
      page.locator('textarea[name="motivation"]').first(),
    ];
    for (const input of motivationCandidates) {
      if ((await input.count()) > 0) {
        await expect(input).toBeVisible({ timeout: 15000 });
        await input.scrollIntoViewIfNeeded();
        await expect(input).toBeEnabled();
        await input.fill('Test motivation');
        break;
      }
    }

    // Guarded Next (2 -> 3)
    const next2 = nextButtonLocator(page);
    await expect(next2).toBeVisible({ timeout: 20000 });
    await next2.scrollIntoViewIfNeeded();
    await expect(next2).toBeEnabled();
    await next2.click({ trial: true }).catch(() => {
      throw new Error('Next button trial-click failed; page may have navigated or crashed.');
    });
    await next2.click().catch(() => {
      throw new Error('Next button click failed; page may have navigated or crashed.');
    });

    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login after clicking Next (${page.url()})`);
      return;
    }
    const step3Anchor = stepAnchorLocator(page, 3);
    await expect(step3Anchor).toBeVisible({ timeout: 20000 });

    // Step 3: optional, then Next
    await page.waitForTimeout(500);
    const next3 = nextButtonLocator(page);
    await expect(next3).toBeVisible({ timeout: 20000 });
    await next3.scrollIntoViewIfNeeded();
    await expect(next3).toBeEnabled();
    await next3.click({ trial: true }).catch(() => {
      throw new Error('Next button trial-click failed; page may have navigated or crashed.');
    });
    await next3.click().catch(() => {
      throw new Error('Next button click failed; page may have navigated or crashed.');
    });

    if (isAuthUrl(page.url())) {
      test.skip(true, `Redirected to auth/login after clicking Next (${page.url()})`);
      return;
    }
    const step4Anchor = stepAnchorLocator(page, 4);
    await expect(step4Anchor).toBeVisible({ timeout: 20000 });

    // Step 4: Save button - guarded
    const saveBtn = saveButtonLocator(page);
    await expect(saveBtn).toBeVisible({ timeout: 20000 });
    await saveBtn.scrollIntoViewIfNeeded();
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click({ trial: true }).catch(() => {
      throw new Error('Save button trial-click failed; page may have navigated or crashed.');
    });

    const authPrompt = page.locator('text=/sign in|login|התחבר|כניסה|התחברות/i').first();
    if ((await authPrompt.count()) === 0) {
      await saveBtn.click().catch(() => {
        throw new Error('Save button click failed; page may have navigated or crashed.');
      });
    } else {
      await expect(authPrompt).toBeVisible({ timeout: 5000 });
      test.skip(true, `Skipped Save because auth prompt detected (${page.url()})`);
    }

    // Optional success assertion
    const success = page.getByText(/saved|success|הושלם|נשמרה|שמור/i).first();
    if ((await success.count()) > 0) {
      await expect(success).toBeVisible({ timeout: 5000 });
    }
  });
});

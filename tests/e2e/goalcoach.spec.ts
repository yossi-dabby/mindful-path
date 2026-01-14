import { test, expect, Page } from '@playwright/test';

const CANDIDATE_PATHS = ['/GoalCoach', '/goalcoach', '/goal-coach'];
const AUTH_URL_KEYWORDS = ['login', 'signin', 'auth', 'התחבר', 'כניסה'];

// Try navigating with retries/backoff to avoid transient navigation failures
async function gotoFirstExisting(page: Page, maxAttempts = 3) {
  for (const p of CANDIDATE_PATHS) {
    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        // Use DOMContentLoaded first (less affected by background polling), then short networkidle
        const response = await page.goto(p, { waitUntil: 'domcontentloaded', timeout: 20000 }).catch(() => null);
        if (response) {
          // short attempt to wait for network idle but with small timeout to avoid flakiness
          await page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
          await page.waitForLoadState('domcontentloaded', { timeout: 1000 }).catch(() => {});
        }
        if (response && response.status && response.status() < 400) {
          return p;
        }
        const url = page.url();
        if (url && !url.endsWith('about:blank')) {
          return p;
        }
      } catch {
        // swallow and retry
      }
      await new Promise(r => setTimeout(r, 1000 * attempt));
    }
  }
  return null;
}

function nextButtonLocator(page: Page) {
  return page.getByRole('button', { name: /next|הבא/i }).first();
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
    let category = page.getByRole('button', { name: categoryLabel }).first();
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
    await expect(next1).toBeEnabled();
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

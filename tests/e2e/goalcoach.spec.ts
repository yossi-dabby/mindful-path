import { test, expect, Page } from '@playwright/test';

const CANDIDATE_PATHS = ['/GoalCoach', '/goalcoach', '/goal-coach'];

// Try navigating with retries/backoff to avoid transient navigation failures
async function gotoFirstExisting(page: Page, maxAttempts = 3) {
  for (const p of CANDIDATE_PATHS) {
    let attempt = 0;
    while (attempt < maxAttempts) {
      attempt += 1;
      try {
        const response = await page.goto(p, { waitUntil: 'networkidle', timeout: 20000 }).catch(() => null);
        if (response && response.status && response.status() < 400) {
          // give the app a moment to stabilize
          await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
          return p;
        }
      } catch (err) {
        // swallow and retry
      }
      // small backoff before retrying
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

test.describe('GoalCoach parity (web + mobile projects)', () => {
  test('GoalCoach steps 1→4', async ({ page }) => {
    const path = await gotoFirstExisting(page);
    expect(path, 'Could not find a reachable GoalCoach path').not.toBeNull();

    // Step 1: choose a category card by visible label text (fallbacks if necessary)
    const categoryLabel = /Routine & Productivity|Routine|רוטינה|התנהגות|Behavioral/i;
    let category = page.getByRole('button', { name: categoryLabel }).first();
    if ((await category.count()) === 0) {
      category = page.getByText(categoryLabel).first();
    }
    await expect(category).toBeVisible({ timeout: 15000 });
    await category.click();

    // Click Next (step 1 -> 2) with stronger waits and guarded clicks
    const next1 = nextButtonLocator(page);
    await expect(next1).toBeVisible({ timeout: 15000 });
    await next1.waitFor({ state: 'attached', timeout: 15000 });
    try { await next1.click({ trial: true }); } catch {}
    await next1.click();

    // Step 2: fill title and motivation if present (wait for visibility)
    const titleInputCandidates = [
      page.getByLabel(/title|שם/i).first(),
      page.getByRole('textbox', { name: /title|שם/i }).first(),
      page.locator('input[name="title"]').first(),
    ];
    for (const input of titleInputCandidates) {
      if ((await input.count()) > 0) {
        await expect(input).toBeVisible({ timeout: 10000 });
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
        await expect(input).toBeVisible({ timeout: 10000 });
        await input.fill('Test motivation');
        break;
      }
    }

    // Click Next (step 2 -> 3)
    const next2 = nextButtonLocator(page);
    await expect(next2).toBeVisible({ timeout: 15000 });
    await next2.waitFor({ state: 'attached', timeout: 15000 });
    try { await next2.click({ trial: true }); } catch {}
    await next2.click();

    // Step 3: optional interactions, then Next
    await page.waitForTimeout(500);
    const next3 = nextButtonLocator(page);
    await expect(next3).toBeVisible({ timeout: 15000 });
    await next3.waitFor({ state: 'attached', timeout: 15000 });
    try { await next3.click({ trial: true }); } catch {}
    await next3.click();

    // Step 4: Save button visible and clickable
    const saveBtn = saveButtonLocator(page);
    await expect(saveBtn).toBeVisible({ timeout: 15000 });
    await saveBtn.waitFor({ state: 'attached', timeout: 15000 });
    try { await saveBtn.click({ trial: true }); } catch {}
    // Only perform real click if it does not appear to require auth (detect common auth prompts)
    const authPrompt = page.locator('text=/sign in|login|התחבר|כניסה|התחברות/i').first();
    if ((await authPrompt.count()) === 0) {
      await saveBtn.click();
    } else {
      // If auth prompt appears, assert it's visible and skip clicking to avoid auth flow
      await expect(authPrompt).toBeVisible({ timeout: 5000 });
    }

    // Optional success assertion (toast / text)
    const success = page.getByText(/saved|success|הושלם|נשמרה|שמור/i).first();
    if ((await success.count()) > 0) {
      await expect(success).toBeVisible({ timeout: 5000 });
    }
  });
});

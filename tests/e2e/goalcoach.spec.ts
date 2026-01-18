import { test, expect } from '@playwright/test';
import { spaNavigate, safeFill, safeClick, mockApi, logFailedRequests } from '../helpers/ui';

test.describe('GoalCoach Flow (Steps 1→4)', () => {
  test('should complete GoalCoach wizard from step 1 to step 4', async ({ page }) => {
    test.setTimeout(90000);

    const requestLogger = await logFailedRequests(page);

    try {
      // Mock API before navigation
      await mockApi(page);

      // Navigate to GoalCoach page
      await spaNavigate(page, '/GoalCoach');

      // Wait for page to be interactive
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
        console.log('Network idle timeout - continuing anyway');
      });

      // ========== STEP 1: SELECT CATEGORY ==========
      console.log('[Step 1] Selecting goal category...');

      // Wait for step 1 to be visible
      const step1Container = page.locator('[data-testid="goalcoach-step-1"]');
      await expect(step1Container).toBeVisible({ timeout: 15000 });

      // Pick exactly ONE category button (avoid strict-mode violations)
      const specificCategory = page.locator('[data-testid="goalcoach-category-emotional-emotions-stress"]:visible').first();
      const hasSpecific = (await specificCategory.count()) > 0;

      const categoryButton = hasSpecific
        ? specificCategory
        : page.locator('button[data-testid^="goalcoach-category-"]:visible').first();

      await expect(categoryButton).toBeVisible({ timeout: 15000 });
      await safeClick(categoryButton);

      // Verify category is selected (has aria-pressed="true")
      await expect(categoryButton).toHaveAttribute('aria-pressed', 'true', { timeout: 5000 });

      console.log('[Step 1] Category selected, clicking Next...');

      // Click Next to proceed to Step 2
      const nextButton = page.locator('[data-testid="goalcoach-next"]');
      await expect(nextButton).toBeVisible({ timeout: 10000 });
      await expect(nextButton).toBeEnabled({ timeout: 10000 });
      await safeClick(nextButton);

      // ========== STEP 2: ENTER GOAL DETAILS ==========
      console.log('[Step 2] Entering goal details...');

      // Wait for step 2 to be visible
      const step2Container = page.locator('[data-testid="goalcoach-step-2"]');
      await expect(step2Container).toBeVisible({ timeout: 15000 });

      // Wait for title input specifically
      const titleInput = page.locator('[data-testid="goalcoach-title-input"]:visible').first();
      const hasTitle = (await titleInput.count()) > 0;

      const resolvedTitleInput = hasTitle
        ? titleInput
        : page.locator('input[placeholder*="e.g.,"]:visible').first();

      await expect(resolvedTitleInput).toBeVisible({ timeout: 15000 });

      // Fill required fields
      await safeFill(resolvedTitleInput, 'E2E Test Goal - Improve Mental Wellness');

      // Fill motivation textarea
      const motivationByTestId = page.locator('[data-testid="goalcoach-motivation-input"]:visible').first();
      const hasMotivation = (await motivationByTestId.count()) > 0;

      const motivationTextarea = hasMotivation
        ? motivationByTestId
        : page.locator('textarea[placeholder*="why" i]:visible').first();

      await expect(motivationTextarea).toBeVisible({ timeout: 15000 });
      await safeFill(motivationTextarea, 'This is important because I want to reduce stress and anxiety in my daily life.');

      console.log('[Step 2] Goal details filled, clicking Next...');

      // Wait for Next button to be enabled (form validation)
      await page.waitForTimeout(500);
      await expect(nextButton).toBeEnabled({ timeout: 15000 });
      await safeClick(nextButton);

      // ========== STEP 3: PLAN NEXT STEPS ==========
      console.log('[Step 3] Planning next steps...');

      // Wait for step 3 to be visible
      const step3Container = page.locator('[data-testid="goalcoach-step-3"]');
      await expect(step3Container).toBeVisible({ timeout: 15000 });

      console.log('[Step 3] Optional fields displayed, clicking Next...');

      // Step 3 is optional, click Next immediately
      await expect(nextButton).toBeEnabled({ timeout: 15000 });
      await safeClick(nextButton);

      // ========== STEP 4: REVIEW & SAVE ==========
      console.log('[Step 4] Reviewing goal...');

      // Wait for step 4 review to be visible
      const step4Container = page.locator('[data-testid="goalcoach-step-4"]');
      await expect(step4Container).toBeVisible({ timeout: 15000 });

      // Verify goal details appear in review (best-effort)
      await expect(page.locator('text=E2E Test Goal - Improve Mental Wellness').first()).toBeVisible({ timeout: 15000 });

      console.log('[Step 4] Review complete, clicking Save Goal...');

      // Click Save Goal button
      const saveButton = page.locator('[data-testid="goalcoach-save"]');
      await expect(saveButton).toBeVisible({ timeout: 15000 });
      await expect(saveButton).toBeEnabled({ timeout: 15000 });
      await safeClick(saveButton);

      // Wait for save to complete (wizard should close or show success)
      await page.waitForTimeout(2000);

      console.log('✅ GoalCoach flow completed successfully');
    } catch (error) {
      console.error('❌ GoalCoach flow failed:', error);
      requestLogger.logToConsole();

      // Take screenshot on failure
      await page.screenshot({
        path: `test-results/goalcoach-failed-${Date.now()}.png`,
        fullPage: true
      });

      // Log current step for debugging
      const currentStep = await page.locator('[data-testid^="goalcoach-step-"]').count();
      console.log(`Current visible steps: ${currentStep}`);

      throw error;
    }
  });
});






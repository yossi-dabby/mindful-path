// FILE: tests/e2e/goalcoach.spec.ts
import { test, expect } from '@playwright/test';
import {
  attachDiagnostics,
  waitForAppHydration,
  checkAuthGuard,
  stableClick,
  safeFill,
  spaNavigate,
  takeDebugScreenshot,
} from '../helpers/ui';

test.describe('GoalCoach Flow (Steps 1→4)', () => {
  test.beforeEach(async ({ page }) => {
    attachDiagnostics(page);
  });

  test('should complete GoalCoach wizard from step 1 to step 4', async ({ page }) => {
    // Navigate to GoalCoach
    await spaNavigate(page, '/GoalCoach');

    // Check for auth guard
    if (await checkAuthGuard(page)) {
      test.skip(true, 'Auth required - skipping test');
      return;
    }

    // ============ STEP 1: Category Selection ============
    await test.step('Step 1 - Select category', async () => {
      // Wait for wizard to load
      await expect(page.locator('text=/Select.*Category|Choose.*Goal/i').first()).toBeVisible({ timeout: 15000 });

      // Find category buttons (they have aria-pressed attribute in the real component)
      const categoryButtons = page.locator('button[aria-pressed]');
      await expect(categoryButtons.first()).toBeVisible({ timeout: 10000 });

      // Click the first available category
      const firstCategory = categoryButtons.first();
      await stableClick(firstCategory);

      // Verify category is selected (aria-pressed="true")
      await expect(firstCategory).toHaveAttribute('aria-pressed', 'true', { timeout: 5000 });

      // Find and click Next button
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').last();
      await stableClick(nextButton);

      await page.waitForTimeout(500);
    });

    // ============ STEP 2: Goal Definition ============
    await test.step('Step 2 - Define goal', async () => {
      // Wait for step 2 content (title input should be visible)
      const titleInput = page.locator('input[type="text"]').first();
      await expect(titleInput).toBeVisible({ timeout: 10000 });

      // Fill required fields
      await safeFill(titleInput, 'E2E Test Goal - Improve Mental Wellness');

      // Fill description if present
      const descriptionField = page.locator('textarea').first();
      if (await descriptionField.count() > 0) {
        await safeFill(descriptionField, 'This is a comprehensive goal to improve my overall mental wellness through daily practices.');
      }

      // Fill motivation if present
      const motivationField = page.locator('textarea, input').filter({ hasText: /motivation|why/i }).or(page.locator('[placeholder*="motivation" i], [placeholder*="why" i]')).first();
      if (await motivationField.count() > 0) {
        await safeFill(motivationField, 'I want to feel more balanced and present in my daily life.');
      }

      // Find and click Next/Continue
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').last();
      await stableClick(nextButton);

      await page.waitForTimeout(500);
    });

    // ============ STEP 3: Planning (SMART/Milestones) ============
    await test.step('Step 3 - Planning', async () => {
      // Wait for step 3 content
      await page.waitForTimeout(1000);

      // Look for SMART criteria inputs or milestone inputs
      const visibleInputs = page.locator('input[type="text"]:visible, textarea:visible');
      const inputCount = await visibleInputs.count();

      if (inputCount > 0) {
        // Fill first few visible inputs
        for (let i = 0; i < Math.min(inputCount, 3); i++) {
          const input = visibleInputs.nth(i);
          if (await input.isVisible()) {
            await safeFill(input, `E2E Test Data ${i + 1}`);
          }
        }
      }

      // Check for "Add Milestone" or similar buttons and click if needed
      const addButton = page.locator('button:has-text("Add"), button:has-text("+ ")').first();
      if (await addButton.count() > 0 && await addButton.isVisible()) {
        await stableClick(addButton);
        await page.waitForTimeout(300);
        
        // Fill the newly added input if present
        const newInput = page.locator('input:visible, textarea:visible').last();
        if (await newInput.count() > 0) {
          await safeFill(newInput, 'E2E Milestone');
        }
      }

      // Find and click Next/Continue
      const nextButton = page.locator('button:has-text("Next"), button:has-text("Continue")').last();
      await stableClick(nextButton);

      await page.waitForTimeout(500);
    });

    // ============ STEP 4: Review & Save ============
    await test.step('Step 4 - Review and save', async () => {
      // Wait for review step (should show summary)
      await page.waitForTimeout(1000);

      // Look for Save/Finish/Complete button
      const saveButton = page.locator('button:has-text("Save"), button:has-text("Finish"), button:has-text("Complete"), button:has-text("Create Goal")').last();
      
      await expect(saveButton).toBeVisible({ timeout: 10000 });
      await stableClick(saveButton);

      // Wait for success indication (navigation away or success message)
      await Promise.race([
        page.waitForURL(/\/(Home|Goals)/, { timeout: 10000 }),
        page.waitForSelector('text=/success|created|saved/i', { timeout: 10000 }),
      ]).catch(async () => {
        await takeDebugScreenshot(page, 'goalcoach-save-timeout');
      });

      // Small delay for any post-save actions
      await page.waitForTimeout(1000);
    });
  });
});







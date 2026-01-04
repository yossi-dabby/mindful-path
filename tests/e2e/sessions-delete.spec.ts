import { test, expect } from '@playwright/test';

const DELETE_WAIT_TIMEOUT = 10000; // Allow extra time for deletion to complete in CI

test.describe('Coaching Sessions Delete', () => {
  test('delete button is visible and clickable on session card', async ({ page }) => {
    await page.goto('/Coach', { waitUntil: 'networkidle' });

    // Wait for the sessions list to load
    // If no sessions exist, this test will be skipped since we can't test deletion without sessions
    const hasCards = await page.locator('[data-testid="delete-session-button"]').count() > 0;
    
    if (!hasCards) {
      test.skip(true, 'No sessions available to test deletion');
      return;
    }

    // Find the first delete button
    const deleteButton = page.locator('[data-testid="delete-session-button"]').first();
    
    // Verify the button is visible
    await expect(deleteButton).toBeVisible({ timeout: 10000 });
    
    // Verify the button is enabled (not disabled)
    await expect(deleteButton).toBeEnabled();
    
    // Verify the button has the correct text content
    await expect(deleteButton).toContainText('Delete');
    
    // Verify the button has proper accessibility attributes
    const ariaLabel = await deleteButton.getAttribute('aria-label');
    expect(ariaLabel).toBeTruthy();
    expect(ariaLabel).toContain('Delete session');
    
    // Verify the Trash icon is present within the button
    const trashIcon = deleteButton.locator('svg');
    await expect(trashIcon).toBeVisible();
  });

  test('clicking delete button triggers confirmation dialog', async ({ page }) => {
    await page.goto('/Coach', { waitUntil: 'networkidle' });

    // Check if there are any sessions
    const hasCards = await page.locator('[data-testid="delete-session-button"]').count() > 0;
    
    if (!hasCards) {
      test.skip(true, 'No sessions available to test deletion');
      return;
    }

    // Set up dialog handler before clicking
    let dialogMessage = '';
    const dialogPromise = new Promise<void>(resolve => {
      page.once('dialog', async dialog => {
        dialogMessage = dialog.message();
        await dialog.dismiss(); // Dismiss the dialog to prevent actual deletion
        resolve();
      });
    });

    // Click the delete button
    const deleteButton = page.locator('[data-testid="delete-session-button"]').first();
    await deleteButton.click();

    // Wait for the dialog to appear and be handled
    await dialogPromise;

    // Verify the confirmation dialog appeared
    expect(dialogMessage).toContain('Are you sure');
    expect(dialogMessage).toContain('delete');
    expect(dialogMessage).toContain('coaching session');
  });

  test('delete button does not trigger session selection', async ({ page }) => {
    await page.goto('/Coach', { waitUntil: 'networkidle' });

    // Check if there are any sessions
    const hasCards = await page.locator('[data-testid="delete-session-button"]').count() > 0;
    
    if (!hasCards) {
      test.skip(true, 'No sessions available to test deletion');
      return;
    }

    // Set up dialog handler to dismiss the delete confirmation
    const dialogPromise = new Promise<void>(resolve => {
      page.once('dialog', async dialog => {
        await dialog.dismiss();
        resolve();
      });
    });

    // Get the current URL
    const initialUrl = page.url();

    // Click the delete button
    const deleteButton = page.locator('[data-testid="delete-session-button"]').first();
    await deleteButton.click();

    // Wait for dialog to be handled
    await dialogPromise;

    // Verify we're still on the Coach page (not navigated to session detail)
    const currentUrl = page.url();
    expect(currentUrl).toBe(initialUrl);
    expect(currentUrl).toContain('Coach');
  });

  test('confirming delete removes the session from the list', async ({ page }) => {
    await page.goto('/Coach', { waitUntil: 'networkidle' });

    // Check if there are any sessions
    const initialCount = await page.locator('[data-testid="delete-session-button"]').count();
    
    if (initialCount === 0) {
      test.skip(true, 'No sessions available to test deletion');
      return;
    }

    // Set up dialog handler to accept the deletion
    const dialogPromise = new Promise<void>(resolve => {
      page.once('dialog', async dialog => {
        await dialog.accept();
        resolve();
      });
    });

    // Get the first session title before deletion
    const firstSessionTitle = await page.locator('[data-testid="session-title"]').first().innerText();

    // Click the delete button
    const deleteButton = page.locator('[data-testid="delete-session-button"]').first();
    await deleteButton.click();

    // Wait for dialog to be handled
    await dialogPromise;

    // Wait for the session to be removed by checking for either count decrease or empty state
    try {
      await page.waitForFunction(
        (data) => {
          const currentCount = document.querySelectorAll('[data-testid="delete-session-button"]').length;
          const hasEmptyState = document.querySelector('[data-testid="empty-sessions-state"]') !== null;
          return currentCount < data.expectedCount || hasEmptyState;
        },
        { expectedCount: initialCount },
        { timeout: DELETE_WAIT_TIMEOUT }
      );
    } catch (error) {
      // Timeout is acceptable here - we check the final state below regardless
      // This allows the test to pass even if deletion is slower than expected
    }

    // Verify the session count decreased or we're at the "no sessions" state
    const finalCount = await page.locator('[data-testid="delete-session-button"]').count();
    
    // Either the count decreased, or we're at the "no sessions" state
    if (finalCount > 0) {
      expect(finalCount).toBeLessThan(initialCount);
      
      // Verify the deleted session is no longer in the list
      const remainingTitles = await page.locator('[data-testid="session-title"]').allInnerTexts();
      expect(remainingTitles).not.toContain(firstSessionTitle);
    } else {
      // All sessions were deleted, should show empty state
      await expect(page.locator('[data-testid="empty-sessions-state"]')).toBeVisible();
    }
  });
});

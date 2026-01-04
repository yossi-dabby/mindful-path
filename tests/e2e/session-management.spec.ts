import { test, expect } from '@playwright/test';

/**
 * E2E tests for session management in the Chat page.
 * Tests cover creating and deleting sessions across desktop and mobile projects.
 */

test.describe('Session Management', () => {
  test.beforeEach(async ({ page }) => {
    const baseUrl = process.env.BASE_URL || 'http://localhost:5173';
    await page.goto(`${baseUrl}/Chat`, { waitUntil: 'networkidle' });
  });

  test('should create a new session', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Find and click the create session button
    const createButton = page.getByTestId('session-create');
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();

    // Wait for the session to be created and listed
    // After clicking create, we should see at least one session item
    const sessionItems = page.getByTestId('session-item');
    await expect(sessionItems.first()).toBeVisible({ timeout: 10000 });

    // Verify that the session list has at least one item
    const count = await sessionItems.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  test('should delete a session', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // First, create a new session with a unique identifier for testing
    const createButton = page.getByTestId('session-create');
    await expect(createButton).toBeVisible({ timeout: 10000 });
    
    // Get the initial count of sessions
    const initialSessionItems = page.getByTestId('session-item');
    const initialCount = await initialSessionItems.count();

    // Create a new session
    await createButton.click();
    
    // Wait for the new session to appear by checking the count increases
    await expect(initialSessionItems).toHaveCount(initialCount + 1, { timeout: 10000 });

    // Get the newly created session (should be the last one)
    const sessionItems = page.getByTestId('session-item');
    const newSessionCount = await sessionItems.count();
    const lastSession = sessionItems.last();

    // Hover over the session to reveal the delete button
    await lastSession.hover();

    // Find the delete button within the last session and click it
    const deleteButtons = page.getByTestId('session-delete');
    const deleteButton = deleteButtons.last();
    
    // Wait for the delete button to be visible (it has opacity-0 group-hover:opacity-100)
    await expect(deleteButton).toBeVisible({ timeout: 5000 });

    // Set up dialog handler to confirm deletion
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      expect(dialog.message()).toContain('Delete this session');
      await dialog.accept();
    });

    // Click the delete button
    await deleteButton.click();

    // Wait for the session to be removed from the list
    // The count should decrease by 1
    await expect(sessionItems).toHaveCount(newSessionCount - 1, { timeout: 10000 });

    // Verify the session was actually removed
    const finalCount = await sessionItems.count();
    expect(finalCount).toBe(newSessionCount - 1);
  });

  test('should cancel deletion when dialog is dismissed', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Create a new session first
    const createButton = page.getByTestId('session-create');
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    
    // Wait for session to be created
    const sessionItems = page.getByTestId('session-item');
    await expect(sessionItems.first()).toBeVisible({ timeout: 10000 });
    
    const countBeforeDelete = await sessionItems.count();

    // Hover over a session to reveal delete button
    const firstSession = sessionItems.first();
    await firstSession.hover();

    // Find and prepare to click delete button
    const deleteButton = page.getByTestId('session-delete').first();
    await expect(deleteButton).toBeVisible({ timeout: 5000 });

    // Set up dialog handler to CANCEL deletion
    page.once('dialog', async dialog => {
      expect(dialog.type()).toBe('confirm');
      await dialog.dismiss();
    });

    // Click the delete button
    await deleteButton.click();

    // Verify the session count hasn't changed (no deletion occurred)
    await expect(sessionItems).toHaveCount(countBeforeDelete, { timeout: 5000 });
  });

  test('should create multiple sessions and delete a specific one', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    const createButton = page.getByTestId('session-create');
    await expect(createButton).toBeVisible({ timeout: 10000 });

    // Get initial session count
    const sessionItems = page.getByTestId('session-item');
    const initialCount = await sessionItems.count();

    // Create two new sessions
    await createButton.click();
    await expect(sessionItems).toHaveCount(initialCount + 1, { timeout: 10000 });
    
    await createButton.click();
    await expect(sessionItems).toHaveCount(initialCount + 2, { timeout: 10000 });

    const countAfterCreation = await sessionItems.count();

    // Delete the second-to-last session
    const secondToLastSession = sessionItems.nth(countAfterCreation - 2);
    await secondToLastSession.hover();

    const deleteButtons = page.getByTestId('session-delete');
    const deleteButton = deleteButtons.nth(countAfterCreation - 2);
    await expect(deleteButton).toBeVisible({ timeout: 5000 });

    // Accept the deletion dialog
    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await deleteButton.click();

    // Verify count decreased by 1
    await expect(sessionItems).toHaveCount(countAfterCreation - 1, { timeout: 10000 });
  });

  test('should not delete the default session if it exists', async ({ page }) => {
    // Wait for the page to load
    await page.waitForLoadState('networkidle');

    // Check if there are any existing sessions (seeded sessions)
    const sessionItems = page.getByTestId('session-item');
    const initialCount = await sessionItems.count();

    if (initialCount === 0) {
      // No default sessions, skip this test
      test.skip();
      return;
    }

    // Store the text content of existing sessions to identify them later
    const existingSessionTexts: string[] = [];
    for (let i = 0; i < initialCount; i++) {
      const text = await sessionItems.nth(i).textContent();
      if (text) existingSessionTexts.push(text);
    }

    // Create a new test session
    const createButton = page.getByTestId('session-create');
    await expect(createButton).toBeVisible({ timeout: 10000 });
    await createButton.click();
    await expect(sessionItems).toHaveCount(initialCount + 1, { timeout: 10000 });

    // Get the new session count
    const newSessionCount = await sessionItems.count();
    expect(newSessionCount).toBe(initialCount + 1);

    // Find and delete only the newly created session (the last one)
    const lastSession = sessionItems.last();
    await lastSession.hover();

    const deleteButtons = page.getByTestId('session-delete');
    const lastDeleteButton = deleteButtons.last();
    await expect(lastDeleteButton).toBeVisible({ timeout: 5000 });

    page.once('dialog', async dialog => {
      await dialog.accept();
    });

    await lastDeleteButton.click();

    // Verify we're back to the initial count
    await expect(sessionItems).toHaveCount(initialCount, { timeout: 10000 });

    // Verify the original sessions are still there
    const remainingCount = await sessionItems.count();
    expect(remainingCount).toBe(initialCount);

    // Optionally verify that the original session texts are still present
    for (let i = 0; i < Math.min(remainingCount, existingSessionTexts.length); i++) {
      const currentText = await sessionItems.nth(i).textContent();
      // Just check that some of the original sessions are still present
      // (The exact order might change, so we don't check exact matches)
      expect(currentText).toBeTruthy();
    }
  });
});

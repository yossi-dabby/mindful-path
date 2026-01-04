import { test, expect } from '@playwright/test';

/**
 * E2E test for Chat session deletion functionality
 * Tests the delete (trash) icon on the sessions list
 */

test.describe('Chat Sessions Delete', () => {
  test('should delete a chat session via trash icon', async ({ page }) => {
    const base = process.env.BASE_URL || 'http://localhost:3000/Chat';
    await page.goto(base, { waitUntil: 'networkidle' });

    // Start a new conversation first
    const newSessionButton = page.getByRole('button', { name: /plus|new/i }).first();
    await expect(newSessionButton).toBeVisible({ timeout: 10000 });
    await newSessionButton.click();

    // Send a test message to create a conversation with content
    const messageBox = page.getByRole('textbox', { name: /message|chat input|type a message/i });
    await expect(messageBox).toBeVisible({ timeout: 10000 });
    await messageBox.fill('Test message for deletion');
    
    const sendButton = page.getByRole('button', { name: /send|submit/i });
    if (await sendButton.count() > 0) {
      await sendButton.click();
    } else {
      await messageBox.press('Enter');
    }

    // Wait a bit for the message to be sent
    await page.waitForTimeout(2000);

    // Open the sidebar/sessions list (for mobile)
    const menuButton = page.getByRole('button', { name: /menu/i }).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }

    // Wait for sessions list to be visible
    await expect(page.getByText(/sessions/i).first()).toBeVisible({ timeout: 5000 });

    // Find the session item - look for elements containing "Session"
    const sessionItem = page.locator('[class*="group"]').filter({ hasText: /session/i }).first();
    await expect(sessionItem).toBeVisible({ timeout: 5000 });

    // Hover over the session to reveal the delete button
    await sessionItem.hover();

    // Wait for delete button to appear (it has opacity transition)
    await page.waitForTimeout(500);

    // Find and click the delete button - use aria-label or title
    const deleteButton = sessionItem.getByRole('button', { name: /delete/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    
    // Setup dialog handler before clicking delete
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Delete');
      await dialog.accept();
    });

    await deleteButton.click();

    // Wait for the session to be removed from the list
    await page.waitForTimeout(1000);

    // Verify the session is gone - the session item should no longer be visible
    // Note: This might redirect to empty state, so we check for either state
    const hasNoSessions = page.getByText(/no sessions yet/i);
    const sessionStillExists = sessionItem;
    
    // Either we see "no sessions" message OR the specific session is gone
    await expect(
      hasNoSessions.or(sessionStillExists.filter({ hasNotText: /test message/i }))
    ).toBeVisible({ timeout: 5000 });
  });

  test('should cancel deletion when dismissing confirmation dialog', async ({ page }) => {
    const base = process.env.BASE_URL || 'http://localhost:3000/Chat';
    await page.goto(base, { waitUntil: 'networkidle' });

    // Start a new conversation
    const newSessionButton = page.getByRole('button', { name: /plus|new/i }).first();
    await expect(newSessionButton).toBeVisible({ timeout: 10000 });
    await newSessionButton.click();

    // Send a test message
    const messageBox = page.getByRole('textbox', { name: /message|chat input|type a message/i });
    await expect(messageBox).toBeVisible({ timeout: 10000 });
    await messageBox.fill('Test message - should not be deleted');
    
    const sendButton = page.getByRole('button', { name: /send|submit/i });
    if (await sendButton.count() > 0) {
      await sendButton.click();
    } else {
      await messageBox.press('Enter');
    }

    await page.waitForTimeout(2000);

    // Open the sidebar/sessions list
    const menuButton = page.getByRole('button', { name: /menu/i }).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }

    await expect(page.getByText(/sessions/i).first()).toBeVisible({ timeout: 5000 });

    const sessionItem = page.locator('[class*="group"]').filter({ hasText: /session/i }).first();
    await expect(sessionItem).toBeVisible({ timeout: 5000 });

    await sessionItem.hover();
    await page.waitForTimeout(500);

    const deleteButton = sessionItem.getByRole('button', { name: /delete/i });
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    
    // Setup dialog handler to dismiss/cancel
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Delete');
      await dialog.dismiss();
    });

    await deleteButton.click();

    await page.waitForTimeout(500);

    // Verify the session still exists
    await expect(sessionItem).toBeVisible({ timeout: 5000 });
  });
});

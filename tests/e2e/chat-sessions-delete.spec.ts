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

    // Wait for network to be idle, indicating the conversation has been saved
    await page.waitForLoadState('networkidle');

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

    // Find and click the delete button - use aria-label or title
    const deleteButton = sessionItem.getByRole('button', { name: /delete/i });
    // Wait for the delete button to become visible (opacity transition)
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    
    // Setup dialog handler before clicking delete
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Delete');
      await dialog.accept();
    });

    await deleteButton.click();

    // Wait for the session to be removed - either we see "no sessions" message or the session is gone
    await expect(async () => {
      const noSessionsText = await page.getByText(/no sessions yet/i).count();
      const sessionCount = await page.locator('[class*="group"]').filter({ hasText: /session/i }).count();
      
      // Either we have no sessions message OR the session count is 0
      expect(noSessionsText > 0 || sessionCount === 0).toBeTruthy();
    }).toPass({ timeout: 5000 });
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

    // Wait for network to be idle, indicating the conversation has been saved
    await page.waitForLoadState('networkidle');

    // Open the sidebar/sessions list
    const menuButton = page.getByRole('button', { name: /menu/i }).first();
    if (await menuButton.isVisible()) {
      await menuButton.click();
    }

    await expect(page.getByText(/sessions/i).first()).toBeVisible({ timeout: 5000 });

    const sessionItem = page.locator('[class*="group"]').filter({ hasText: /session/i }).first();
    await expect(sessionItem).toBeVisible({ timeout: 5000 });

    await sessionItem.hover();

    const deleteButton = sessionItem.getByRole('button', { name: /delete/i });
    // Wait for the delete button to become visible (opacity transition)
    await expect(deleteButton).toBeVisible({ timeout: 5000 });
    
    // Setup dialog handler to dismiss/cancel
    page.once('dialog', async dialog => {
      expect(dialog.message()).toContain('Delete');
      await dialog.dismiss();
    });

    await deleteButton.click();

    // Verify the session still exists after dismissal
    // The session item should remain visible in the list
    await expect(sessionItem).toBeVisible({ timeout: 5000 });
    
    // Also verify the session count hasn't decreased
    const sessionCount = await page.locator('[class*="group"]').filter({ hasText: /session/i }).count();
    expect(sessionCount).toBeGreaterThanOrEqual(1);
  });
});

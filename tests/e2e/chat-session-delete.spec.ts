import { test, expect } from '@playwright/test';

/**
 * E2E test for creating and deleting a chat session.
 * Tests the interactive trash icon functionality on /chat.
 */
test('create and delete a chat session', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:3000/Chat';
  await page.goto(base, { waitUntil: 'networkidle' });

  // Step 1: Create a new session by clicking "Start Your First Session" or sending a message
  const startButton = page.getByRole('button', { name: /start your first session/i });
  
  if (await startButton.isVisible()) {
    await startButton.click();
    await page.waitForTimeout(1000); // Wait for session to be created
  }

  // Step 2: Send a message to ensure the session is active
  const messageBox = page.getByRole('textbox', { name: /message|chat input|type a message|share what/i });
  await expect(messageBox).toBeVisible({ timeout: 10000 });
  
  await messageBox.fill('Test message for deletion');
  const sendButton = page.getByRole('button', { name: /send|submit/i });
  if (await sendButton.count() > 0) {
    await sendButton.click();
  } else {
    await messageBox.press('Enter');
  }

  // Wait a moment for the message to be sent
  await page.waitForTimeout(2000);

  // Step 3: Open the sidebar to see the sessions list
  const menuButton = page.getByRole('button', { name: /menu/i }).or(page.locator('button').filter({ has: page.locator('svg') }).first());
  await menuButton.click();
  await page.waitForTimeout(500);

  // Step 4: Find and click the delete button (trash icon)
  // The trash icon should be visible on hover or always visible
  const sessionItem = page.locator('[class*="group"]').filter({ hasText: 'Session' }).first();
  await expect(sessionItem).toBeVisible({ timeout: 5000 });

  // Hover over the session to make the delete button visible
  await sessionItem.hover();
  await page.waitForTimeout(500);

  // Find the delete button by its title or role
  const deleteButton = sessionItem.getByRole('button', { name: /delete session/i })
    .or(sessionItem.locator('button[title*="Delete"]'))
    .or(sessionItem.locator('button').filter({ has: page.locator('svg[class*="lucide-trash"]') }));

  await expect(deleteButton).toBeVisible({ timeout: 5000 });

  // Step 5: Click the delete button
  await deleteButton.click();

  // Step 6: Confirm the deletion in the dialog
  const confirmButton = page.getByRole('button', { name: /ok|confirm|yes|delete/i });
  if (await confirmButton.isVisible({ timeout: 2000 })) {
    await confirmButton.click();
  }

  // Alternative: if using native confirm dialog, handle it
  page.on('dialog', async dialog => {
    expect(dialog.message()).toContain('Delete');
    await dialog.accept();
  });

  // Step 7: Verify the session is removed from the list
  await page.waitForTimeout(1000);
  
  // The session should no longer be in the list or the list should show "No sessions yet"
  const noSessionsText = page.getByText(/no sessions yet/i);
  await expect(noSessionsText).toBeVisible({ timeout: 5000 });
});

test('delete button is interactive and properly positioned', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:3000/Chat';
  await page.goto(base, { waitUntil: 'networkidle' });

  // Create a session
  const startButton = page.getByRole('button', { name: /start your first session/i });
  if (await startButton.isVisible()) {
    await startButton.click();
    await page.waitForTimeout(1000);
  }

  // Send a message
  const messageBox = page.getByRole('textbox', { name: /message|chat input|type a message|share what/i });
  await messageBox.fill('Test');
  await messageBox.press('Enter');
  await page.waitForTimeout(1500);

  // Open sidebar
  const menuButton = page.getByRole('button', { name: /menu/i }).or(page.locator('button').filter({ has: page.locator('svg') }).first());
  await menuButton.click();
  await page.waitForTimeout(500);

  // Find the session item
  const sessionItem = page.locator('[class*="group"]').filter({ hasText: 'Session' }).first();
  await sessionItem.hover();

  // Check that the delete button is a real button element
  const deleteButton = sessionItem.locator('button[title*="Delete"], button:has(svg[class*="lucide-trash"])').first();
  await expect(deleteButton).toBeVisible();

  // Verify it's actually a button element
  const tagName = await deleteButton.evaluate(el => el.tagName);
  expect(tagName).toBe('BUTTON');

  // Verify it has proper pointer-events (not disabled)
  const isEnabled = await deleteButton.isEnabled();
  expect(isEnabled).toBe(true);

  // Verify the button is clickable (not obscured)
  const boundingBox = await deleteButton.boundingBox();
  expect(boundingBox).not.toBeNull();
});

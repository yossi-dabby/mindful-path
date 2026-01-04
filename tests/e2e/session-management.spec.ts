import { test, expect } from '@playwright/test';

/**
 * E2E tests for session management (create and delete)
 * Tests run on both desktop and mobile viewports as defined in playwright.config.ts
 * 
 * Note: These tests do NOT delete the default seeded session to avoid breaking other tests.
 * They create a new session and then delete it to verify the functionality.
 */

test('create and delete session', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:3000/Chat';
  await page.goto(base, { waitUntil: 'networkidle' });

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');
  
  // On mobile, the sidebar might be hidden, so we need to open it first
  // The menu button should be visible on mobile
  const menuButton = page.getByRole('button', { name: /menu|sessions/i });
  if (await menuButton.isVisible()) {
    await menuButton.click();
    // Wait for sidebar to open - session items may already be visible or will appear
    try {
      await page.waitForSelector('[data-testid="session-item"]', { state: 'visible', timeout: 5000 });
    } catch {
      // Session items may not exist if this is the first session
    }
  }

  // Get initial count of sessions
  const sessionItemsBeforeCreate = await page.getByTestId('session-item').count();

  // Find and click the create session button (+ button)
  const createButton = page.getByTestId('session-create');
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();

  // Wait for the new session to be created and appear in the list
  // We expect the count to increase
  await expect(async () => {
    const currentCount = await page.getByTestId('session-item').count();
    expect(currentCount).toBe(sessionItemsBeforeCreate + 1);
  }).toPass({ timeout: 5000 });
  
  // Verify a new session was created
  const sessionItemsAfterCreate = await page.getByTestId('session-item').count();
  expect(sessionItemsAfterCreate).toBe(sessionItemsBeforeCreate + 1);

  // Get all session items and find the newly created one
  // The newly created session should be the one we just clicked on (active/selected)
  // We'll hover over each session and click delete on the last one (most recent)
  const sessionItems = page.getByTestId('session-item');
  const lastSessionItem = sessionItems.last();
  
  // Hover over the last session to reveal the delete button
  await lastSessionItem.hover();
  
  // Wait for delete button to become visible after hover
  const deleteButton = lastSessionItem.getByTestId('session-delete');
  await expect(deleteButton).toBeVisible({ timeout: 5000 });
  
  // Set up dialog handler to accept the confirmation
  page.on('dialog', async dialog => {
    expect(dialog.type()).toBe('confirm');
    await dialog.accept();
  });
  
  // Click the delete button
  await deleteButton.click();
  
  // Wait for the session to be deleted by checking the count decreases
  await expect(async () => {
    const currentCount = await page.getByTestId('session-item').count();
    expect(currentCount).toBe(sessionItemsBeforeCreate);
  }).toPass({ timeout: 5000 });
  
  // Verify the session was deleted
  const sessionItemsAfterDelete = await page.getByTestId('session-item').count();
  expect(sessionItemsAfterDelete).toBe(sessionItemsBeforeCreate);
});

test('delete button is visible on hover (desktop only)', async ({ page, viewport }) => {
  // Skip this test on mobile devices
  if (viewport && viewport.width < 768) {
    test.skip();
  }

  const base = process.env.BASE_URL || 'http://localhost:3000/Chat';
  await page.goto(base, { waitUntil: 'networkidle' });

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');

  // Get the first session item
  const sessionItems = page.getByTestId('session-item');
  const firstSession = sessionItems.first();
  
  await expect(firstSession).toBeVisible({ timeout: 10000 });
  
  // The delete button should not be visible initially (opacity-0)
  const deleteButton = page.getByTestId('session-delete').first();
  
  // Hover over the session to reveal the delete button
  await firstSession.hover();
  
  // The delete button should now be visible
  await expect(deleteButton).toBeVisible({ timeout: 2000 });
});

test('create session button is accessible', async ({ page }) => {
  const base = process.env.BASE_URL || 'http://localhost:3000/Chat';
  await page.goto(base, { waitUntil: 'networkidle' });

  // Wait for the page to load
  await page.waitForLoadState('domcontentloaded');
  
  // On mobile, open the sidebar
  const menuButton = page.getByRole('button', { name: /menu|sessions/i });
  if (await menuButton.isVisible()) {
    await menuButton.click();
    // Wait for create button to be visible
    await expect(page.getByTestId('session-create')).toBeVisible({ timeout: 5000 });
  }

  // Verify the create button is present and has the correct test ID
  const createButton = page.getByTestId('session-create');
  await expect(createButton).toBeVisible({ timeout: 10000 });
  
  // Verify it's a button that can be clicked
  await expect(createButton).toBeEnabled();
});

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
    // Wait a bit for the sidebar to open
    await page.waitForTimeout(500);
  }

  // Get initial count of sessions
  const sessionItemsBeforeCreate = await page.getByTestId('session-item').count();
  console.log(`Initial session count: ${sessionItemsBeforeCreate}`);

  // Find and click the create session button (+ button)
  const createButton = page.getByTestId('session-create');
  await expect(createButton).toBeVisible({ timeout: 10000 });
  await createButton.click();

  // Wait for the new session to be created and appear in the list
  await page.waitForTimeout(1000);
  
  // Verify a new session was created
  const sessionItemsAfterCreate = await page.getByTestId('session-item').count();
  console.log(`Session count after create: ${sessionItemsAfterCreate}`);
  expect(sessionItemsAfterCreate).toBe(sessionItemsBeforeCreate + 1);

  // Get all session items
  const sessionItems = page.getByTestId('session-item');
  
  // Find the newly created session (it should be the first one or the last one)
  // We'll identify it by hovering to reveal the delete button
  const lastSessionItem = sessionItems.last();
  
  // Hover over the last session to reveal the delete button
  await lastSessionItem.hover();
  
  // Find the delete button within the hovered session
  const deleteButtons = page.getByTestId('session-delete');
  const deleteButtonCount = await deleteButtons.count();
  console.log(`Delete button count: ${deleteButtonCount}`);
  
  // Click the last delete button (the one for the newly created session)
  const deleteButton = deleteButtons.last();
  await expect(deleteButton).toBeVisible({ timeout: 5000 });
  
  // Set up dialog handler to accept the confirmation
  page.on('dialog', async dialog => {
    console.log(`Dialog message: ${dialog.message()}`);
    expect(dialog.type()).toBe('confirm');
    await dialog.accept();
  });
  
  // Click the delete button
  await deleteButton.click();
  
  // Wait for the session to be deleted
  await page.waitForTimeout(1000);
  
  // Verify the session was deleted
  const sessionItemsAfterDelete = await page.getByTestId('session-item').count();
  console.log(`Session count after delete: ${sessionItemsAfterDelete}`);
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
    await page.waitForTimeout(500);
  }

  // Verify the create button is present and has the correct test ID
  const createButton = page.getByTestId('session-create');
  await expect(createButton).toBeVisible({ timeout: 10000 });
  
  // Verify it's a button that can be clicked
  await expect(createButton).toBeEnabled();
});

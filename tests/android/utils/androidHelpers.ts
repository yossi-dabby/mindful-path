import { Page, expect } from '@playwright/test';

/**
 * Helper utilities for Android-specific E2E testing.
 * These functions help validate Android-specific behaviors like console cleanliness
 * and element visibility with respect to the virtual keyboard.
 */

/**
 * Sets up console monitoring for a page and returns a function to check for errors/warnings.
 * Call assertNoConsoleErrorsOrWarnings at the start of your test, then call the returned function
 * at the end to assert no errors or warnings occurred.
 * 
 * @param page - The Playwright Page object
 * @returns A function that checks for console errors and warnings
 * 
 * @example
 * const checkConsole = assertNoConsoleErrorsOrWarnings(page);
 * // ... test actions ...
 * await checkConsole();
 */
export function assertNoConsoleErrorsOrWarnings(page: Page): () => Promise<void> {
  const consoleErrors: string[] = [];
  const consoleWarnings: string[] = [];

  // Set up console listener
  const consoleListener = (msg: any) => {
    const type = msg.type();
    if (type === 'error') {
      consoleErrors.push(msg.text());
    } else if (type === 'warning') {
      consoleWarnings.push(msg.text());
    }
  };

  page.on('console', consoleListener);

  // Clean up listener when page closes
  page.once('close', () => {
    page.off('console', consoleListener);
  });

  // Return function to check for errors/warnings
  return async () => {
    // Soft assertions to avoid immediately failing the test
    if (consoleErrors.length > 0) {
      await expect.soft(consoleErrors, 
        `Expected no console errors, but found ${consoleErrors.length}:\n${consoleErrors.join('\n')}`
      ).toHaveLength(0);
    }

    if (consoleWarnings.length > 0) {
      await expect.soft(consoleWarnings, 
        `Expected no console warnings, but found ${consoleWarnings.length}:\n${consoleWarnings.join('\n')}`
      ).toHaveLength(0);
    }
  };
}

/**
 * Asserts that an element is visible and tappable (not obscured by keyboard).
 * This helper checks if the element's bottom edge is within the viewport height,
 * which indicates it's not hidden behind the Android virtual keyboard.
 * 
 * @param page - The Playwright Page object
 * @param selector - The CSS selector for the element to check
 * 
 * @example
 * await assertElementVisibleAndTappable(page, '[data-testid="chat-input"]');
 */
export async function assertElementVisibleAndTappable(
  page: Page,
  selector: string
): Promise<void> {
  // First, ensure the element is visible
  const element = page.locator(selector);
  await expect(element).toBeVisible({ timeout: 5000 });

  // Get the element's bounding box
  const boundingBox = await element.boundingBox();
  
  if (!boundingBox) {
    throw new Error(`Element with selector "${selector}" has no bounding box`);
  }

  // Get the viewport size
  const viewportSize = page.viewportSize();
  
  if (!viewportSize) {
    throw new Error('No viewport size available');
  }

  // Check if the bottom of the element is within the viewport
  const elementBottom = boundingBox.y + boundingBox.height;
  const isWithinViewport = elementBottom <= viewportSize.height;

  await expect.soft(isWithinViewport, 
    `Element "${selector}" bottom (${elementBottom}px) should be within viewport height (${viewportSize.height}px)`
  ).toBe(true);
}

// Backward compatibility export
export const setupConsoleMonitoring = assertNoConsoleErrorsOrWarnings;

import { Page, Locator, expect } from '@playwright/test';

export async function attachDiagnostics(page: Page) {
  page.on('console', msg => console.log(`[BROWSER ${msg.type()}]:`, msg.text()));
  page.on('pageerror', err => console.error('[PAGE ERROR]:', err.message));
  page.on('requestfailed', req => console.warn('[REQUEST FAILED]:', req.url()));
}

export async function waitForAppHydration(page: Page, timeout = 30000) {
  await page.waitForSelector('#root', { state: 'attached', timeout });
  
  // Wait for Base44 app structure (sidebar or bottom nav)
  await Promise.race([
    page.waitForSelector('[class*="min-h-screen"]', { timeout: 10000 }).catch(() => null),
    page.waitForSelector('nav', { timeout: 10000 }).catch(() => null),
  ]);
  
  // Brief network settle (non-blocking)
  await page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => null);
  await page.waitForTimeout(500);
}

export function isAuthUrl(url: string): boolean {
  return url.includes('/login') || url.includes('/auth') || url.includes('/signin');
}

export async function checkAuthGuard(page: Page): Promise<boolean> {
  const currentUrl = page.url();
  if (isAuthUrl(currentUrl)) {
    return true;
  }
  
  const loginForm = await page.locator('input[type="email"], input[type="password"]').first().count();
  return loginForm > 0;
}

export async function stableClick(locator: Locator, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
      
      // Poll for enablement
      for (let j = 0; j < 10; j++) {
        if (await locator.isEnabled()) break;
        await locator.page().waitForTimeout(500);
      }
      
      await expect(locator).toBeEnabled({ timeout: 5000 });
      await locator.click({ timeout: 5000 });
      await locator.page().waitForTimeout(300);
      return;
    } catch (err) {
      if (i === retries - 1) throw err;
      await locator.page().waitForTimeout(1000);
    }
  }
}

export async function safeFill(locator: Locator, value: string, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      await locator.waitFor({ state: 'visible', timeout: 10000 });
      await locator.scrollIntoViewIfNeeded({ timeout: 5000 });
      await locator.fill(value, { timeout: 5000 });
      
      // Verify fill worked
      const actualValue = await locator.inputValue();
      if (actualValue === value) return;
      
      if (i === retries - 1) throw new Error(`Fill verification failed: expected "${value}", got "${actualValue}"`);
    } catch (err) {
      if (i === retries - 1) throw err;
      await locator.page().waitForTimeout(500);
    }
  }
}

export async function spaNavigate(page: Page, path: string) {
  const targetUrl = new URL(path, page.url()).href;
  await page.goto(targetUrl, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await waitForAppHydration(page);
}

export async function takeDebugScreenshot(page: Page, name: string) {
  try {
    await page.screenshot({ path: `test-results/debug-${name}-${Date.now()}.png`, fullPage: true });
  } catch (err) {
    console.warn('Failed to take screenshot:', err);
  }
}

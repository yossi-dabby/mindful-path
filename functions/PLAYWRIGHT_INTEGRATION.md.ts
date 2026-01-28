# Playwright Test Integration Guide

## Critical Setup Steps for smoke.web.spec.ts

### 1. Import Test Helpers
```typescript
import { testHelpers } from './functions/e2eTestHelpers.js';
```

### 2. Setup Before Each Test
```typescript
test.beforeEach(async ({ page }) => {
  // CRITICAL: Mock analytics to prevent null app ID crashes
  await testHelpers.mockAnalytics(page);
  
  // Setup closure diagnostics
  const diagnostics = testHelpers.setupClosureDiagnostics(page);
  
  // Set test environment flags
  await page.addInitScript(() => {
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    window.location.search = '?e2e-test=true';
  });
});
```

### 3. Safe Diagnostic Loop (Replace Line 54 Area)
```typescript
// BEFORE (causes crash):
const buttonCount = await allButtons.count();
for (let i = 0; i < buttonCount; i++) {
  const label = await allButtons.nth(i).innerText().catch(() => '');
  const visible = await allButtons.nth(i).isVisible().catch(() => false);
  const enabled = await allButtons.nth(i).isEnabled().catch(() => false);
  if (/send/i.test(label)) {
    console.log(`[DIAGNOSTIC] Button[${i}] label: "${label}", visible: ${visible}, enabled: ${enabled}`);
  }
}

// AFTER (safe with closure protection):
await testHelpers.safeDiagnosticLoop(page, allButtons, async (button, i) => {
  const label = await button.innerText().catch(() => '');
  const visible = await button.isVisible().catch(() => false);
  const enabled = await button.isEnabled().catch(() => false);
  if (/send/i.test(label)) {
    console.log(`[DIAGNOSTIC] Button[${i}] label: "${label}", visible: ${visible}, enabled: ${enabled}`);
  }
});
```

### 4. Protect All Page Interactions
```typescript
// Before any locator operation:
if (page.isClosed()) {
  throw new Error('Page closed prematurely');
}

// Example:
if (page.isClosed()) throw new Error('Page closed before send');
await expect(sendButton).toBeVisible({ timeout: 20000 });

if (page.isClosed()) throw new Error('Page closed before click');
await sendButton.click();
```

### 5. GitHub Workflow Changes (.github/workflows/playwright.yml)
```yaml
- name: Wait for server
  run: npx --yes wait-on http://127.0.0.1:5173 --timeout 120000  # Increased from 60s to 120s

- name: Run Playwright tests
  run: npx playwright test
  env:
    CI: true
    NODE_ENV: test
```

## Root Causes Fixed in App Code

✅ **Analytics crash**: Added `mockAnalytics()` in e2eTestHelpers.js
✅ **Button not clickable**: Removed `pointerEvents: 'none'` from Chat.js send button
✅ **Unguarded setState**: Added `mountedRef` checks to prevent updates after unmount
✅ **Response timeout**: Added 30s timeout with abort in subscription handler

## Remaining Test File Changes Needed

1. Import testHelpers
2. Call `mockAnalytics()` before navigation
3. Replace diagnostic loop at line ~54 with `safeDiagnosticLoop()`
4. Add `page.isClosed()` checks before each expect/action
5. Increase workflow wait-on timeout to 120s

## Verification Checklist

- [ ] Test imports testHelpers
- [ ] mockAnalytics() called in beforeEach
- [ ] Diagnostic loops use safeDiagnosticLoop()
- [ ] page.isClosed() checked before critical actions
- [ ] Workflow wait-on timeout increased
- [ ] Test passes without "Target page, context or browser has been closed"
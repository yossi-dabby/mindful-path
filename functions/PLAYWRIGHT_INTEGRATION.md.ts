# Playwright Test Integration Guide

## Quick Fix - Import Path Error

**Error**: `Cannot find module 'tests/e2eTestHelpers.js'`

**Solution**: The helpers are in `functions/e2eTestHelpers.js`, not `tests/`

### Correct Import Path
```typescript
// If your test is at: tests/e2e/smoke.web.spec.ts
import { testHelpers } from '../../functions/e2eTestHelpers.js';

// If your test is at: tests/smoke.web.spec.ts  
import { testHelpers } from '../functions/e2eTestHelpers.js';
```

## Quick Start - Copy/Paste Solution

**See `functions/smoke.web.spec.example.ts` for a complete working test file.**

1. Copy the example file to your test location: `tests/e2e/smoke.web.spec.ts`
2. Verify the import path matches your test location
3. Adjust base URL if needed (default: http://127.0.0.1:5173)

## Critical Setup Steps

### 1. Import Test Helpers (Fix Import Path!)
```typescript
// Adjust path based on test file location
import { testHelpers } from '../../functions/e2eTestHelpers.js';
```

### 2. Setup Before Each Test
```typescript
test.beforeEach(async ({ page }) => {
  // CRITICAL: Mock analytics to prevent null app ID crashes
  await testHelpers.mockAnalytics(page);
  
  // Setup closure diagnostics
  testHelpers.setupClosureDiagnostics(page);
  
  // Set test environment flags
  await page.addInitScript(() => {
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    document.body.setAttribute('data-test-env', 'true');
  });
});
```

### 3. Safe Diagnostic Loop (Replace Line 54 Area)
```typescript
// BEFORE (causes crash):
const buttonCount = await allButtons.count();
for (let i = 0; i < buttonCount; i++) {
  const label = await allButtons.nth(i).innerText().catch(() => '');
  // ...
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
```

### 5. GitHub Workflow Changes
```yaml
# In .github/workflows/playwright.yml:

- name: Wait for server
  run: npx --yes wait-on http://127.0.0.1:5173 --timeout 120000  # Increased to 120s
```

## Root Causes Fixed

✅ **Analytics crash**: Added `mockAnalytics()` in e2eTestHelpers.js + app-side disable flag
✅ **Button not clickable**: Removed `pointerEvents: 'none'` from Chat.js send button  
✅ **Unguarded setState**: Added `mountedRef` checks to prevent updates after unmount
✅ **Response timeout**: Added 30s timeout with abort in subscription handler
✅ **Diagnostic loop crash**: Created `safeDiagnosticLoop()` with closure protection
✅ **Import path error**: Helpers are in `functions/`, not `tests/`

## Verification Checklist

- [ ] Copy `functions/smoke.web.spec.example.ts` to `tests/e2e/smoke.web.spec.ts`
- [ ] Verify import path: `'../../functions/e2eTestHelpers.js'` (from tests/e2e/)
- [ ] Test imports testHelpers successfully
- [ ] mockAnalytics() called in beforeEach
- [ ] Diagnostic loops use safeDiagnosticLoop()
- [ ] page.isClosed() checked before critical actions
- [ ] Workflow wait-on timeout increased to 120s
- [ ] Test passes without "Target page, context or browser has been closed"
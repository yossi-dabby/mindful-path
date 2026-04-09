# Test Infrastructure Repair Log

> **Last updated:** 2026-04-09  
> **PR:** #533 — Audit Playwright/Vitest E2E and integration test helpers  
> **Risk level:** 🟢 LOW — test and workflow changes only; no runtime agent logic altered

---

## 1. Root-Cause Summary

### What broke

E2E tests in `tests/e2e/super-cbt-agent.spec.ts` were failing in CI on the
`copilot/enable-ai-agent-actions` branch (PR #532) with errors like:

```
Expected: false
Received: true   (for isSuperAgentEnabled())
Expected: ""
Received: "[SUPER_CBT_AGENT: Advanced CBT Mode]..."  (for buildSuperAgentSessionPreamble)
```

### Why it broke

1. PR #532 changed `VITE_SUPER_CBT_AGENT_ENABLED` from opt-in (`=== 'true'`) to
   opt-out (`!== 'false'`), making the Super Agent flag default to `true` in any
   build that does not explicitly set the variable to `'false'`.
2. The E2E tests were written during the "scaffold only" phase to verify the flag was
   `false` by default. They were not updated when the enablement decision was made.
3. The playwright.yml CI workflow did not set `VITE_SUPER_CBT_AGENT_ENABLED` at all,
   so builds on different branches produced different flag values depending on which
   source-code version of the flag logic they contained.

### Additional issues found during audit

- `mockApi` in `tests/helpers/ui.ts` only stubbed `enhancedCrisisDetector` by name;
  all other backend functions (`sessionPhaseEngine`, `retrieveTherapistMemory`, etc.)
  fell through to the generic `{ data: { success: true } }` stub without named coverage.
- Required localStorage values (`chat_consent_accepted`, `age_verified`) and window
  globals (`__TEST_APP_ID__`, `__DISABLE_ANALYTICS__`) were not consistently set
  across all E2E test files — each file had its own ad-hoc `addInitScript` block.
- `VITE_BASE44_APP_ID` being absent caused `/api/apps/undefined/...` URLs at runtime
  with no actionable log output to help diagnose the failure.

---

## 2. Repair Changes

### 2.1 `tests/helpers/ui.ts` — new `setupTestEnvironment` helper

A new exported helper `setupTestEnvironment(page, lang?)` was added.  It calls
`page.addInitScript` once to set ALL required globals:

| Variable | Value | Why |
|---|---|---|
| `window.__TEST_APP_ID__` | `'test-app-id'` | Prevents `/api/apps/undefined/...` URLs |
| `window.__DISABLE_ANALYTICS__` | `true` | Suppresses analytics in CI |
| `localStorage.chat_consent_accepted` | `'true'` | Bypasses consent gate |
| `localStorage.age_verified` | `'true'` | Bypasses age gate |
| `localStorage.language` | caller-supplied (default `'en'`) | Sets locale for multilingual tests |

`mockApi(page)` now calls `setupTestEnvironment(page)` internally as its first
action.  Callers no longer need separate `page.addInitScript` blocks for the
standard consent/age/appId values.

### 2.2 `tests/helpers/ui.ts` — comprehensive `/functions/` mocking

The `mockApi` route handler now stubs each known backend function by name with a
shape-correct response, rather than a single generic `{ data: { success: true } }`:

| Function | Mock response |
|---|---|
| `enhancedCrisisDetector` | `{ is_crisis: false, severity: 'none', reason: 'test_mock', confidence: 0 }` |
| `sessionPhaseEngine` | `{ phase: 'assessment', phase_label: 'Assessment', ... }` |
| `retrieveTherapistMemory` | `{ memories: [], summary: '' }` |
| `writeTherapistMemory` | `{ success: true, memory_id: 'test-memory-id' }` |
| `summarizeSession` / `normalizeAgentMessage` | `{ success: true, content: '' }` |
| `postLlmSafetyFilter` / `sanitizeAgentOutput` / `sanitizeConversation` | `{ safe: true, filtered: false }` |
| `getSuperAgentSessionContext` / `buildMultilingualPreamble` | `{ context: '', preamble: '', locale: 'en' }` |
| all others | `{ success: true }` (generic fallback) |

When new backend functions are added, add a named stub entry to this list in
`mockApi` — do not rely on the generic fallback for functions under active use.

### 2.3 `tests/e2e/super-cbt-agent.spec.ts` — updated for enabled state

The spec was updated to reflect the current intended state: the Super Agent IS
enabled in CI builds (because `VITE_SUPER_CBT_AGENT_ENABLED=true` is set in the
CI workflow — see §2.4).

Key changes:
- Tests that checked `SUPER_CBT_AGENT_ENABLED === false` now check `=== true`.
- The preamble test now verifies a non-empty preamble when both the env flag AND
  wiring (`super_agent: true, multilingual_context_enabled: true`) are active.
- A new test was added to verify the preamble IS empty when wiring does not enable
  the super agent (regardless of the env flag), confirming the wiring guard works.
- Language coverage: English (en) and Hebrew (he) — two language suites as required.

### 2.4 `.github/workflows/playwright.yml` — agent flags + secret pre-flight

The CI workflow was updated with:

1. **Top-level `env:` block** — all VITE_* flags required for a fully-enabled
   build are set here and automatically inherited by every build/run step:
   ```yaml
   env:
     VITE_THERAPIST_UPGRADE_ENABLED: 'true'
     VITE_SUPER_CBT_AGENT_ENABLED: 'true'
     # ... all other phase flags
   ```
2. **`check-secrets` pre-flight job** — fails immediately with an actionable error
   message if `VITE_BASE44_APP_ID` is missing, before any expensive build or test
   step runs.  The error message includes the exact steps needed to fix it.
3. Both `smoke` and `test` jobs now depend on `check-secrets` via `needs:`.

### 2.5 `vite.config.js` — build-time `VITE_BASE44_APP_ID` warning

A `console.warn` is emitted during `npm run dev` / `npm run build` when
`VITE_BASE44_APP_ID` is not set.  The warning includes an actionable hint
pointing to `env.staging.example`.  This catches local dev runs that forget
to create a `.env` file.

---

## 3. Test Infra Best Practices

### 3.1 Required env vars for E2E runs

| Variable | Required? | Purpose |
|---|---|---|
| `VITE_BASE44_APP_ID` | **Yes** | Base44 app identifier; without it all API calls fail |
| `VITE_SUPER_CBT_AGENT_ENABLED` | Yes (E2E) | Must be `'true'` for super-agent E2E tests to pass |
| `VITE_THERAPIST_UPGRADE_ENABLED` | Yes (E2E) | Master gate for all Stage 2 upgrade paths |
| All `VITE_THERAPIST_UPGRADE_*` flags | Yes (E2E) | Per-phase gates for the therapist upgrade |

For local E2E runs, copy `env.staging.example` to `.env` and fill in the values.

### 3.2 Always call `mockApi` before navigation

`mockApi` must be called before `page.goto` / `spaNavigate` so that route handlers
are registered before any requests fire.  With the new `setupTestEnvironment` call
inside `mockApi`, you no longer need a separate `addInitScript` for the standard
consent/age/appId values.

```typescript
// Correct:
await mockApi(page);           // registers routes + sets localStorage
await spaNavigate(page, '/');  // navigate with mocks in place

// Wrong — routes miss the first navigation:
await spaNavigate(page, '/');
await mockApi(page);
```

### 3.3 Language-specific tests

For multilingual E2E tests, use `setupTestEnvironment(page, 'he')` (or whichever
language) to seed `localStorage.language` before page load:

```typescript
async function setupPageWithLanguage(page, lang) {
  await setupTestEnvironment(page, lang);
  await mockApi(page);  // note: this also calls setupTestEnvironment('en') inside,
                        // but the language key set above is preserved because
                        // setupTestEnvironment was already called first
}
```

Or pass the language directly to `setupTestEnvironment` before calling `mockApi`.

### 3.4 New backend functions

When a new Base44 backend function is added, add a named stub to the
`/functions/` route handler block in `mockApi` (around line 270 in `tests/helpers/ui.ts`).
This ensures:
- The function is intercepted (no real network call in CI)
- The response shape matches what the calling code expects
- Failures are debuggable (specific stub vs. generic fallback)

### 3.5 Feature flag changes and E2E tests

When a VITE_* feature flag default is changed (opt-in ↔ opt-out), update:
1. The E2E tests that check the flag value to reflect the new expected state.
2. The unit tests that check the flag value (if Vitest's `import.meta.env` mock
   is configured for those tests).
3. The `env:` block in `playwright.yml` to explicitly set the flag for CI builds.

---

## 4. Agent Action Enablement Diagnostic Checklist

When agent actions appear inactive or tests fail with unexpected `false` flag values:

1. **Check the CI build env**  
   Confirm all `VITE_*` flags are set in `.github/workflows/playwright.yml` under
   the top-level `env:` block.

2. **Check the local build env**  
   Run `cat .env` and verify all required vars are present.  Compare to
   `env.staging.example`.

3. **Check the Vite build output**  
   Look for the `⚠️ VITE_BASE44_APP_ID is not set` warning from `vite.config.js`.
   If present, the build will produce an app that cannot connect to the backend.

4. **Check the super agent flag at runtime**  
   In the browser console (or a Playwright `page.evaluate`):
   ```js
   const m = await import('/src/lib/superCbtAgent.js');
   console.log(m.SUPER_CBT_AGENT_FLAGS);
   ```

5. **Check the stage 2 diagnostics overlay**  
   Add `?_s2debug=true` to any page URL to see a console group showing all flag
   values and the currently selected therapist wiring route.

6. **Check that `resolveTherapistWiring()` returns the expected wiring**  
   ```js
   const w = await import('/src/api/activeAgentWiring.js');
   console.log(w.resolveTherapistWiring());
   ```

---

## 5. Related Files

| File | Purpose |
|---|---|
| `tests/helpers/ui.ts` | Shared Playwright helpers: mockApi, setupTestEnvironment, etc. |
| `tests/e2e/super-cbt-agent.spec.ts` | SuperCbtAgent E2E tests (en + he) |
| `tests/e2e/smoke.spec.ts` | Mobile chat smoke test |
| `.github/workflows/playwright.yml` | CI E2E workflow with agent flags |
| `vite.config.js` | Build config with VITE_BASE44_APP_ID validation |
| `src/lib/superCbtAgent.js` | SuperCbtAgent module + SUPER_CBT_AGENT_FLAGS |
| `src/lib/featureFlags.js` | Stage 2 therapist upgrade flags |
| `docs/super-agent/activation-guide.md` | Production activation guide |
| `env.staging.example` | Template for local `.env` file |

---

> See `docs/copilot-safety-rules.md` for the complete safety rule set.  
> See `docs/super-agent/activation-guide.md` for the SuperCbtAgent production activation guide.

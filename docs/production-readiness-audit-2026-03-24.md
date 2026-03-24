# Production-Readiness Audit — Railway / Base44

**Branch investigated:** `copilot/clean-production-audit`
**PR base:** `staging-fresh`
**Audit date:** 2026-03-24
**Prepared by:** GitHub Copilot Coding Agent
**Scope:** Investigation only — no code changes made
**History:** Supersedes the initial investigation in `copilot/start-clean-production-investigation` (PR #449, merged to `staging-fresh`). This branch merges `staging-fresh` and extends the audit with a second, deeper code inspection pass.

---

## 0. Branch and Conflict Status

| Check | Result |
|-------|--------|
| PR base branch | `staging-fresh` ✅ |
| `staging-fresh` merged into this branch | ✅ Clean merge — no conflicts |
| Merge base with `staging-fresh` | `24d281570b93e23221d534b96da58e25fa051a8c` |
| Merge base with `main` | `24d281570b93e23221d534b96da58e25fa051a8c` |
| Conflicts against `staging-fresh` | **None** ✅ |
| Conflicts against `main` | **None** ✅ |
| Current state of `staging-fresh` vs `main` | `staging-fresh` is 3 commits ahead of `main` (two investigation commits + merge commit from PR #449) |

`staging-fresh` is ahead of `main` by the PR #449 audit investigation commits. This branch has merged `staging-fresh` and adds the extended audit. It is ahead of both `staging-fresh` and `main`.

---

## 1. Executive Summary

The app is **structurally sound** for Railway production deployment. The routing, SPA configuration, and auth flow are all correctly implemented. The critical production risk is environmental: the app requires `VITE_BASE44_APP_ID` to be set as a Railway build-time environment variable. Without it, every entity API call targets `/api/apps/null/...`, causing silent cascading failures across auth, onboarding, settings, and chat.

Feature flag infrastructure is fully built and safe — all Stage 2 AI capability flags default to `false` and require explicit opt-in via Railway environment variables. The basic HYBRID wiring (CBT Therapist + AI Companion) is active in production when appId is correctly configured.

All 3124 unit tests pass on the `copilot/clean-production-audit` branch.

There are two minor code-level issues (AuthContext retry flash, silent ErrorBoundary) that are not blocking but should be addressed before a public launch. A third issue was identified in this pass: the `vite.config.js` build configuration changes behavior when `CI=true` is set in Railway env vars — this should be explicitly excluded from Railway production builds.

---

## 2. Code Paths Inspected

### 2.1 AuthContext — `src/lib/AuthContext.jsx`

**What it does:**

- Calls `base44.auth.me()` on mount via `useEffect → checkAuth()`
- On success: sets `user`, `isAuthenticated=true`, clears loading overlay
- On 401/403: retries once after 800 ms (handles OAuth/Google post-redirect delay), then calls `base44.auth.redirectToLogin()`
- On `user_not_registered`: shows `UserNotRegisteredError` screen, does not redirect
- Provides: `user`, `isAuthenticated`, `isLoadingAuth`, `logout`, `navigateToLogin`, `checkAppState`

**Risk identified — retry logic and `finally` interaction:**

```javascript
const checkAuth = async (retryCount = 0) => {
  try {
    setIsLoadingAuth(true);
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    setIsAuthenticated(true);
  } catch (error) {
    if ((status === 401 || status === 403) && retryCount < 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return checkAuth(retryCount + 1);   // ← returns early
    }
    // ... error handling
  } finally {
    setIsLoadingAuth(false);               // ← runs even during retry
  }
};
```

JavaScript's `finally` always executes, even when `return` is used in a `catch` block. This means `setIsLoadingAuth(false)` fires before the retry completes — causing a brief flash where the loading overlay disappears, the partially-loaded app renders, and then `checkAuth(1)` immediately sets `isLoadingAuth(true)` again. On slow or mobile connections this flash is visible to users.

**Assessment:** Low severity (cosmetic), but worth fixing before public launch. Fix: set `isLoadingAuth(false)` only at the end of the final attempt.

---

### 2.2 Base44 Client Setup — `src/api/base44Client.js`

**What it does:**

- Reads `{ appId, token, functionsVersion }` from `app-params.js`
- Sets `APP_BASE_URL = VITE_BASE44_APP_BASE_URL || 'https://base44.app'`
- Creates SDK client with `requiresAuth: false`
- If `appId` is falsy: disables analytics (`base44.analytics.cleanup()`, replaces with no-ops)
- If `appId` is present: overrides `base44.auth.updateMe` to use entity SDK with PATCH
- Wraps all entity `.list()` and `.filter()` to flatten paginated envelopes

**Production-ready aspects:**

- ✅ Hardcoded `https://base44.app` fallback ensures login redirects work even without `VITE_BASE44_APP_BASE_URL`
- ✅ `updateMe` PATCH override prevents 405 errors from the Base44 server rejecting PUT
- ✅ Entity normalization prevents paginated response shape from breaking array-expecting consumers

**Risk identified — appId guard on `updateMe` override:**

```javascript
if (appId) {
  base44.auth.updateMe = async (data) => { ... };
}
```

The override is not applied when `appId` is missing. If `appId` is unset in Railway, the fallback `updateMe` (SDK default, uses PUT) will receive a 405 response from the server. Onboarding completion, profile updates, and any other `updateMe` call will silently fail.

This is a cascading consequence of missing `VITE_BASE44_APP_ID` — not an independent bug. Fixing the root cause (ensuring `appId` is set) fixes this automatically.

---

### 2.3 App Param / AppId Resolution — `src/lib/app-params.js`

**Resolution priority order:**

1. `window.__TEST_APP_ID__` (injected by Playwright; never present in production)
2. `import.meta.env.VITE_BASE44_APP_ID` (build-time env var — the correct production path)
3. `import.meta.env.BASE44_APP_ID` (alias; less common)
4. URL query param `?app_id=xxx` (persisted to localStorage; not the expected production flow)
5. localStorage `base44_app_id` (persisted from a previous URL param)
6. `null` (failure case)

**Critical production risk:**

`VITE_BASE44_APP_ID` is a **build-time** variable. It is baked into the compiled JavaScript bundle by Vite. If this variable is not set in Railway's environment at the time `npm run build` runs, it will not be present in the bundle — even if it is added later. Every API call will target `/api/apps/null/...`:

- `base44.auth.me()` → fails → user cannot log in
- `base44.entities.*.list()` → fails → all data pages show empty/error
- `base44.agents.createConversation()` → fails → chat cannot start
- `base44.functions.invoke(...)` → fails → onboarding completion, cleanup, summarization all fail

The dev-only warning (`console.warn('[app-params] VITE_BASE44_APP_ID is not set...')`) does NOT fire in production builds. A Railway deployment without `VITE_BASE44_APP_ID` will fail silently.

**What a user sees when appId is missing:**

- Login page loads (correct — redirects to `https://base44.app` which is hardcoded)
- After login, user is redirected back to the app
- App bootstrap: `base44.auth.me()` call fails with `/api/apps/null/...` → redirects back to login
- User is stuck in a login redirect loop

---

### 2.4 Onboarding / WelcomeWizard — `src/pages/Home.jsx`, `src/components/onboarding/WelcomeWizard.jsx`

**Trigger mechanism:**

```javascript
// Home.jsx — dual-check pattern
const cached = sessionStorage.getItem('user_prefs_loaded');
if (cached && JSON.parse(cached).onboarding_completed === false) {
  setShowOnboarding(true);
}
base44.auth.me().then((userData) => {
  if (!userData.onboarding_completed) setShowOnboarding(true);
});
```

**Completion path:**

```javascript
// WelcomeWizard.jsx
await base44.auth.updateMe({
  onboarding_completed: true,
  focus_areas: data.focus_areas,
  onboarding_goals: data.goals,
  experience_level: data.experience_level
});
```

**Assessment:**

- ✅ Fast-path cache + authoritative API check is a solid pattern
- ✅ Uses optimistic update (`onComplete()` called in `onMutate` before server response)
- ✅ `updateMe` is correctly overridden to use PATCH (when `appId` is set)
- ✅ No routing or schema issues

**Risk:** Same as §2.3 — if `appId` is missing, `updateMe` falls back to PUT → 405.

---

### 2.5 Routing / App Routes — `src/App.jsx`, `railway.toml`, `public/_redirects`

**Route structure:**

```
/ → Home.jsx (main page)
/{pageName} → auto-registered from pages.config.js
* → PageNotFound
```

Pages registered: Home, Chat, Coach, Community, Goals, Journal, Exercises, Progress, Resources, Settings, AdvancedAnalytics, CrisisAlerts, ExerciseView, GoalCoach, Journeys, MoodTracker, etc.

**Auth guard pattern:**

Routes always render. A full-screen overlay (`zIndex: 9999`) is shown on top while `isLoadingAuth` is true. After auth check completes:
- Authenticated → overlay disappears, page is usable
- Unauthenticated → `redirectToLogin()` is called → page redirects to Base44 login

**SPA routing for direct URL access:**

```toml
# railway.toml
startCommand = "npx serve -s dist -l $PORT"   # -s = SPA mode
```

```
# public/_redirects
/* /index.html 200
```

Both mechanisms are correctly configured. Direct URL access to `/Chat`, `/Settings/`, or any route will serve `index.html` and allow React Router to handle the route.

**Assessment:** ✅ Routing is production-ready. No issues found.

---

### 2.6 Settings Accessibility — `src/pages/Settings.jsx`

```javascript
useEffect(() => {
  base44.auth.me().then(async (userData) => {
    if (!userData) {
      base44.auth.redirectToLogin(window.location.pathname);
      return;
    }
    setUser(userData);
    // initialize UserPoints, Subscription (non-critical)
  }).catch(() => {
    base44.auth.redirectToLogin(window.location.pathname);
  });
}, []);
```

**Assessment:** ✅ Fully protected. Redirects to login on both null response and exception. Non-critical failures (points, subscription) are silently caught to avoid blocking the settings page.

---

### 2.7 Chat / AI Entry Path — `src/pages/Chat.jsx`, `src/api/activeAgentWiring.js`

**Agent selection:**

`ACTIVE_CBT_THERAPIST_WIRING` is resolved at module load time in `activeAgentWiring.js`:

1. If `THERAPIST_UPGRADE_ENABLED` flag is `false` (default) → `CBT_THERAPIST_WIRING_HYBRID`
2. Otherwise, selects highest enabled phase wiring (V5 → V4 → V3 → V2 → V1 → HYBRID)

In production without any feature flags set: always uses `CBT_THERAPIST_WIRING_HYBRID`.

**Conversation creation:**

```javascript
const conversation = await base44.agents.createConversation({
  agent_name: ACTIVE_CBT_THERAPIST_WIRING.name,  // 'cbt_therapist'
  tool_configs: ACTIVE_CBT_THERAPIST_WIRING.tool_configs,
  metadata: { ... }
});
```

**AppId gating in Chat:**

- Analytics: gated by `appParams.appId` — silently skipped if missing
- Retention cleanup: early-returns if `appParams.appId` is missing
- Conversation creation: NOT gated — will attempt regardless and fail with `/api/apps/null/...`

**ErrorBoundary:**

```javascript
// src/components/utils/ErrorBoundary.jsx
render() {
  if (this.state.hasError) {
    return null;  // ← silently hides errors
  }
  return this.props.children;
}
```

Used in Chat.jsx to wrap components. On error, those components disappear without any user-facing message. This is acceptable for non-critical sub-components but makes debugging production issues much harder.

**Assessment:**

- ✅ Default HYBRID wiring is safe and production-ready
- ✅ Agent tool configurations are correct for HIPAA/privacy alignment
- ⚠️ `ErrorBoundary` silently hides errors — moderate issue
- ⚠️ No agent existence check before `createConversation` — if `cbt_therapist` agent is not deployed in Base44, chat creation fails with an unhelpful error

---

### 2.8 Feature Flags — `src/lib/featureFlags.js`

All Stage 2 flags read from `VITE_*` environment variables at build time:

```javascript
THERAPIST_UPGRADE_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_ENABLED === 'true',
THERAPIST_UPGRADE_MEMORY_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_MEMORY_ENABLED === 'true',
// ... etc
```

**Key behaviors:**

- All flags default to `false` — Stage 2 behavior is entirely opt-in
- `_s2` URL override (e.g., `?_s2=THERAPIST_UPGRADE_ENABLED`) only works on `*.base44.app` or localhost
- On Railway custom domain: URL overrides are blocked by design — must use env vars
- Master gate `THERAPIST_UPGRADE_ENABLED=false` disables all Phase 1–7 behavior as a single rollback switch

**Assessment:** ✅ Flag system is correct and fail-closed by design.

---

### 2.9 Vite Build Configuration — `vite.config.js` (New Finding)

```javascript
build: {
  sourcemap: process.env.CI ? true : false,
  minify: process.env.CI ? false : "esbuild",
},
```

**Risk identified — `CI` environment variable in Railway:**

The build configuration uses `process.env.CI` to toggle sourcemaps and minification. When `CI=true`:
- Sourcemaps are **enabled** (bundle includes source mappings — larger file, exposes application source structure to anyone who inspects the bundle)
- Minification is **disabled** (bundle contains human-readable code — slower page loads and exposes variable names, logic flow, and internal implementation details)

**Security implication:** Enabled sourcemaps in production expose the full unobfuscated source code of the application to anyone with browser dev tools. This includes internal auth logic, API call patterns, agent wiring configurations, and any hardcoded fallback URLs — all of which could assist an attacker in fingerprinting the app or crafting targeted requests.

The `env.staging.example` file explicitly recommends setting `CI=true` for staging builds because it makes debugging easier. However, if `CI=true` is also set in the Railway **production** environment (either intentionally or as a leftover), production bundles will be unminified with full sourcemaps.

**Assessment:** 🟠 Medium risk. Must confirm `CI` is NOT set in the Railway production environment. If `CI` is set (common default in some CI/CD platforms), the production build will be unoptimized and expose source structure.

**Verification:** In Railway dashboard → Variables → confirm `CI` is either unset or explicitly set to `false` for the production deployment.

---

### 2.10 Vite Plugin `appBaseUrl` vs Client `APP_BASE_URL` (New Finding)

**`vite.config.js`:**
```javascript
base44({
  appBaseUrl: process.env.VITE_BASE44_APP_BASE_URL || "https://mindful-path-75aeaf7d.base44.app",
  hmrNotifier: true,
  navigationNotifier: true,
  visualEditAgent: true,
})
```

**`src/api/base44Client.js`:**
```javascript
const APP_BASE_URL = import.meta.env.VITE_BASE44_APP_BASE_URL || 'https://base44.app';
```

These two URLs serve different purposes:
- **vite plugin `appBaseUrl`**: Configures HMR notifier, navigation notifier, and visual edit agent — these are **development tools only** and have no effect in production builds.
- **client `APP_BASE_URL`**: Used in auth redirects (`auth.redirectToLogin()`, `auth.logout()`) — **this is the production-relevant URL**.

The hardcoded `https://mindful-path-75aeaf7d.base44.app` in `vite.config.js` is the specific Base44 preview app URL. It does not affect production auth redirects (which use `APP_BASE_URL`). The auth redirect fallback `https://base44.app` in `base44Client.js` is correct for production.

**Assessment:** ✅ No production risk. The two fallback URLs serve different layers and both are correct.

---

### 2.11 Chat Conversation Creation Error Handling — `src/pages/Chat.jsx` (Confirmed)

The `createConversation` call is wrapped in a `try/catch`:

```javascript
try {
  const conversation = await base44.agents.createConversation({ ... });
  // ... set state
} catch (error) {
  console.error('Error creating conversation:', error);
}
```

On failure (agent not deployed, network error, etc.), the error is logged to console but not surfaced to the user. The chat page remains in a loading/empty state with no user-facing error message.

**Assessment:** ⚠️ Moderate. Same as §2.7 — the `ErrorBoundary` + silent catch pattern makes production failures invisible to users.

---

### BLOCKER-1: `VITE_BASE44_APP_ID` not set in Railway

**Severity:** 🔴 Critical — app completely non-functional without this  
**File:** `src/lib/app-params.js`, `src/api/base44Client.js`  
**Symptom:** Login redirect loop. Every API call returns errors or empty data.  
**Root cause:** `VITE_BASE44_APP_ID` is a build-time variable. If not set in Railway env before build, it is missing from the compiled bundle entirely.

**What happens:**

1. User visits the Railway URL
2. Auth check calls `base44.auth.me()` → `/api/apps/null/me` → fails
3. Redirects to Base44 login
4. After login, redirected back
5. Auth check fires again → same failure → redirect loop

**Verification:** Check Railway dashboard → Variables → confirm `VITE_BASE44_APP_ID` is set.

---

### BLOCKER-2: `cbt_therapist` agent not deployed in Base44 instance

**Severity:** 🔴 Critical for chat — chat cannot start without the agent  
**File:** `src/api/agentWiring.js`, `src/api/activeAgentWiring.js`, `src/pages/Chat.jsx`  
**Symptom:** Chat page loads, but starting a conversation fails silently (ErrorBoundary hides the error)  
**Root cause:** `base44.agents.createConversation({ agent_name: 'cbt_therapist' })` requires the agent to be configured in the Base44 app instance. If not configured in the Base44 app's agent settings, the call fails.

**Verification:** Check Base44 app admin panel → Agents → confirm `cbt_therapist` and `ai_companion` agents exist.

---

## 4. Likely Root Causes

| Issue | Likely Root Cause |
|-------|------------------|
| Login redirect loop | `VITE_BASE44_APP_ID` not set in Railway env vars |
| Onboarding save fails | Same — `updateMe` PATCH override not applied when `appId` is null |
| Chat won't start | `cbt_therapist` agent not configured in Base44 instance |
| Empty data pages | All entity API calls fail without valid `appId` |
| No AI capabilities | Feature flags all false (intended behavior; need env vars to enable) |

---

## 5. Confirmed Root Causes

| Root Cause | Confirmed By | File |
|-----------|-------------|------|
| `VITE_BASE44_APP_ID` is build-time only | Code inspection of `app-params.js` lines 44-56 | `src/lib/app-params.js` |
| `updateMe` PATCH override conditioned on `appId` | Code inspection of `base44Client.js` lines 36-41 | `src/api/base44Client.js` |
| Feature flags read `VITE_*` env vars at build time | Code inspection of `featureFlags.js` lines 35-96 | `src/lib/featureFlags.js` |
| `_s2` URL overrides disabled on non-Base44 domains | Code inspection of `featureFlags.js` `isStagingOrPreviewHost()` | `src/lib/featureFlags.js` |

---

## 6. Issues That Block AI Capability Rollout

These are not app-breaking but must be resolved to enable the advanced AI features.

| Issue | What Blocks | Fix |
|-------|-------------|-----|
| `VITE_THERAPIST_UPGRADE_ENABLED` not set | Master gate off → no Stage 2 AI behavior | Set `VITE_THERAPIST_UPGRADE_ENABLED=true` in Railway |
| Phase flags not set | Each phase (memory, summarization, workflow, retrieval, safety) disabled | Set per-phase `VITE_THERAPIST_UPGRADE_*` flags as needed |
| External knowledge chunks not populated | `v3RetrievalExecutor.js` comment: "chunks may not yet be populated in production" | Run `backfillKnowledgeIndex` function or ingestion pipeline |
| `_s2` URL overrides blocked on Railway domain | Cannot manually enable flags via URL on custom domain | Must use `VITE_*` env vars instead |
| `cbt_therapist` agent not confirmed in Base44 | Chat conversation creation fails | Verify in Base44 app admin |

---

## 7. Issues That Can Wait

| Issue | Severity | Why It Can Wait |
|-------|----------|----------------|
| AuthContext retry flash (`finally` fires between retries) | Low | Only visible on slow connections; cosmetic only |
| `ErrorBoundary` returns `null` (no fallback UI) | Moderate | Hides errors but doesn't cause data loss; harder to debug prod issues |
| Settings non-critical silently-caught failures | Low | UserPoints/Subscription init failures don't block usage |
| `TODO: Show error UI to user` in `DraggableAiCompanion.jsx` | Low | AI companion still functions; error just disappears |
| Chat `createConversation` silent catch | Moderate | Error logged to console; user sees empty/stuck state — not critical for initial validation |

---

## 8. Recommended Fix Order

### Step 1 — Environment Configuration (Deploy-time, No Code Change)

> ⚠️ These are Railway/Base44 admin actions, not code changes.

1. **Set `VITE_BASE44_APP_ID`** in Railway environment variables → trigger a new build
2. **Confirm `VITE_BASE44_APP_BASE_URL`** is set (or accept the `https://base44.app` fallback — the fallback is correct for login redirects)
3. **Verify `cbt_therapist` and `ai_companion` agents** are configured in the Base44 app instance
4. **Confirm `CI` is NOT set to `true`** in the Railway production environment variables — if it is, the build will produce unminified bundles with sourcemaps (§2.9)

**Estimated impact:** Resolves BLOCKER-1 and BLOCKER-2. App becomes fully functional.

---

### Step 2 — AuthContext Retry Fix (Small Code Change)

> ⚠️ Proposed for a **future PR** — not applied in this audit branch.

**File:** `src/lib/AuthContext.jsx`  
**Change:** Restructure retry to avoid `finally` firing between attempts.

**Proposed Implementation (not yet applied):**

```javascript
// Proposed fix: don't use finally during retry; manage loading state explicitly
const checkAuth = async (retryCount = 0) => {
  setIsLoadingAuth(true);
  setAuthError(null);
  try {
    const currentUser = await base44.auth.me();
    setUser(currentUser);
    setIsAuthenticated(true);
    setIsLoadingAuth(false);
  } catch (error) {
    const status = error?.status || error?.response?.status;
    if (error?.data?.extra_data?.reason === 'user_not_registered') {
      setIsAuthenticated(false);
      setAuthError({ type: 'user_not_registered', message: 'User not registered for this app' });
      setIsLoadingAuth(false);
      return;
    }
    if ((status === 401 || status === 403) && retryCount < 1) {
      await new Promise(resolve => setTimeout(resolve, 800));
      return checkAuth(retryCount + 1);  // retry; loading state stays true
    }
    setIsAuthenticated(false);
    if (status === 401 || status === 403) {
      base44.auth.redirectToLogin(window.location.pathname + window.location.search);
    } else {
      setAuthError({ type: 'unknown', message: error.message || 'Failed to load app' });
    }
    setIsLoadingAuth(false);
  }
};
```

**Risk:** Low. Behavior is identical except the loading overlay stays visible between retry attempts (the correct behavior).  
**E2E impact:** None — E2E tests check for the overlay to disappear after auth succeeds, which still happens.

---

### Step 3 — ErrorBoundary Fallback UI (Small Code Change)

> ⚠️ Proposed for a **future PR** — not applied in this audit branch.

**File:** `src/components/utils/ErrorBoundary.jsx`  
**Change:** Return a minimal error message instead of `null`.

```jsx
render() {
  if (this.state.hasError) {
    return (
      <div className="p-4 text-center text-sm text-slate-500">
        Something went wrong. Please refresh the page.
      </div>
    );
  }
  return this.props.children;
}
```

**Risk:** Very low. Only affects error-state rendering.  
**E2E impact:** None — E2E tests don't trigger error boundary states.

---

### Step 4 — AI Capability Enablement (Environment Variables, No Code Change)

Once Step 1 is verified working:

1. **Phase 1 only first:** Set `VITE_THERAPIST_UPGRADE_ENABLED=true` + `VITE_THERAPIST_UPGRADE_MEMORY_ENABLED=true` → trigger build
2. **Verify:** Start a chat session, confirm memory writes work, no crashes
3. **Progressively enable** additional phases (summarization → workflow → retrieval → safety mode)
4. **Do not enable** retrieval until external knowledge chunks are populated

---

## 9. Base44 Preview vs Railway Production: Key Differences

| Aspect | Base44 Preview | Railway Production |
|--------|---------------|---------------------|
| `appId` injection | Auto-provided by Base44 platform | Must set `VITE_BASE44_APP_ID` before build |
| App base URL | Platform-configured automatically | Needs `VITE_BASE44_APP_BASE_URL` or uses `https://base44.app` fallback |
| Feature flag URL overrides (`?_s2=...`) | ✅ Works (domain matches `*.base44.app`) | ❌ Blocked by design (non-matching domain) |
| Feature flag env vars (`VITE_*`) | Works (if set in Base44 build config) | ✅ Standard Railway env vars |
| Analytics | Auto-initialized with appId | Works only if `VITE_BASE44_APP_ID` is set |
| Agent deployment | Agents available in preview instance | Agents must be configured in the app's Base44 admin |

---

## 10. Exact Files and Areas Involved

| File | Area | Risk Level |
|------|------|-----------|
| `src/lib/app-params.js` | AppId resolution | 🔴 Critical — must verify env vars |
| `src/api/base44Client.js` | Client setup, updateMe override | 🔴 Critical — depends on appId |
| `src/lib/AuthContext.jsx` | Auth bootstrap, retry logic | 🟠 Medium — retry flash bug |
| `src/App.jsx` | Route definitions, auth overlay | 🟢 Low — correct |
| `src/pages/Home.jsx` | Onboarding trigger | 🟢 Low — correct |
| `src/components/onboarding/WelcomeWizard.jsx` | Onboarding completion | 🟢 Low — depends on updateMe |
| `src/pages/Chat.jsx` | AI entry path, conversation creation | 🟠 Medium — no agent check; silent catch |
| `src/api/activeAgentWiring.js` | Agent wiring selection | 🟢 Low — HYBRID default is safe |
| `src/api/agentWiring.js` | Agent configurations | 🟢 Low — read-only reference |
| `src/lib/featureFlags.js` | Feature flag registry | 🟢 Low — all flags correctly default false |
| `src/components/utils/ErrorBoundary.jsx` | Error handling in Chat | 🟠 Medium — silent failures |
| `src/components/layout/AppContent.jsx` | Scroll container | 🟢 Low — correct implementation |
| `railway.toml` | Deployment config | 🟢 Low — correct SPA mode |
| `public/_redirects` | SPA routing fallback | 🟢 Low — correct |
| `env.staging.example` | Required env vars reference | 🟢 Low — reference only |
| `vite.config.js` | Build config, CI flag behavior | 🟠 Medium — `CI=true` disables minification in prod |

---

## 11. E2E Test Preservation

The recommended fixes (Steps 2 and 3 above) are minimal and targeted. E2E test impact:

| Test Suite | Impact of Proposed Fixes |
|-----------|--------------------------|
| E2E Tests (mobile) | None — auth overlay behavior unchanged after fix |
| E2E Tests (web-desktop) | None — loading state transitions remain correct |
| Smoke Tests (Production-critical) | None — only error-state rendering improved |

No proposed fix touches routing, page structure, navigation, agent wiring, or entity access. All changes are isolated to AuthContext and ErrorBoundary.

---

## 12. Summary Checklist for Production Validation

Before considering the app production-ready on Railway:

- [ ] `VITE_BASE44_APP_ID` set in Railway environment variables
- [ ] `VITE_BASE44_APP_BASE_URL` set (or confirm `https://base44.app` fallback is acceptable)
- [ ] `CI` not set to `true` in Railway production env (when `CI=true`, build disables minification and enables sourcemaps — exposes source structure)
- [ ] `cbt_therapist` agent confirmed in Base44 app admin
- [ ] `ai_companion` agent confirmed in Base44 app admin
- [ ] Login flow tested end-to-end on Railway domain (not just Base44 preview)
- [ ] Onboarding wizard completes successfully (writes to `onboarding_completed` field)
- [ ] Chat page opens and conversation starts
- [ ] Settings page loads and saves correctly
- [ ] All main pages load without blank content
- [ ] Direct URL refresh (e.g., `/Chat`) loads correctly
- [ ] AuthContext retry flash fix applied (Step 2)
- [ ] ErrorBoundary fallback UI applied (Step 3)

For AI capability rollout (after above is confirmed working):

- [ ] `VITE_THERAPIST_UPGRADE_ENABLED=true` set in Railway
- [ ] Phase 1 (`VITE_THERAPIST_UPGRADE_MEMORY_ENABLED=true`) enabled and tested
- [ ] External knowledge chunks verified populated (for retrieval phases)
- [ ] Each additional phase enabled and tested incrementally

---

*Last updated: 2026-03-24 — audit branch `copilot/clean-production-audit`, base `staging-fresh`. Extended audit pass — all 3124 unit tests verified passing.*

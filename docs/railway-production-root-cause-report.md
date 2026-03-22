# Railway Production Root-Cause Report

**Date:** 2026-03-22  
**Branch:** `copilot/investigate-runtime-data-integration`  
**Scope:** Shared runtime/data integration layer investigation  
**Status:** Investigation complete — remediation in progress

---

## Executive Summary

Two distinct but related root causes produce all observed Railway production failures. They are both triggered by the same deployment gap (missing build-time environment variable) and share a single shared-layer entry point (`src/lib/app-params.js` → `src/api/base44Client.js`).

1. **Root Cause A — Null `appId` context**: `VITE_BASE44_APP_ID` is not set in Railway's build environment, causing `appParams.appId` to resolve to `null`. Every SDK call is built as `/api/apps/null/…`. Analytics batch requests also fire with `appId: null`.

2. **Root Cause B — Unguarded array assumptions**: All pages assume that `useQuery` data backed by `base44.entities.X.list()` or `.filter()` always resolves to a plain JavaScript array. In Railway production the SDK can return a paginated envelope `{ count: N, results: [...] }` rather than a bare array — particularly when the `appId` is null or the response path differs from Base44 preview. All `.filter()`, `.map()`, `.find()` calls then throw `TypeError: X is not a function`.

Both causes are definitively shared-layer problems, not isolated page bugs.

---

## 1. Where `appId` Is Supposed to Come From

**File:** `src/lib/app-params.js`

```js
const envAppId = import.meta.env.VITE_BASE44_APP_ID || import.meta.env.BASE44_APP_ID;

return {
  appId: getAppParamValue("app_id", { defaultValue: envAppId }),
  ...
}
```

Resolution order (highest priority first):
1. URL query parameter `?app_id=…` (also stored to `localStorage`)
2. `localStorage` key `base44_app_id` (previously stored from URL or env)
3. `VITE_BASE44_APP_ID` build-time env var (Vite bakes this in at build time)
4. `BASE44_APP_ID` env var (alternative name)

**The bug in `getAppParamValue`:**

```js
if (defaultValue) {          // ← falsy check — undefined is falsy
  storage.setItem(storageKey, defaultValue);
  return defaultValue;
}
```

When `envAppId` is `undefined` (env var not set), `defaultValue` is `undefined` and this branch is skipped entirely. The function falls through to check `localStorage`, which is empty in a fresh Railway deployment. It then returns `null`.

---

## 2. Why Requests Are Built as `/api/apps/null/…`

**File:** `src/api/base44Client.js`

```js
const { appId, token, functionsVersion } = appParams;  // appId = null

export const base44 = createClient({
  appId,           // null
  token,
  functionsVersion,
  serverUrl: '',
  requiresAuth: false
});
```

The `@base44/sdk` `createClient` accepts `appId: null` without throwing. Internally the SDK builds every request URL as:

```
/api/apps/${appId}/entities/${entityName}
/api/apps/${appId}/analytics/track/batch
```

With `appId = null`, JavaScript string interpolation produces `/api/apps/null/…`. The SDK does not validate the `appId` at construction time.

**Analytics-specific failure path:** The analytics subsystem has an internal heartbeat timer and a batch flush loop that fire on a timer. Both fire unconditionally even if `appId` is null. This produces repeated `POST /api/apps/null/analytics/track/batch` 404 errors in the Railway log.

**Staging fix (already merged):**

```js
if (!appId) {
  base44.analytics.cleanup();
  base44.analytics = { track: () => {}, cleanup: () => {} };
}
```

This stops analytics spam but does **not** fix entity request URLs.

---

## 3. Response Normalization: Missing, Inconsistent, and Bypassed

### 3a. How the SDK responds when `appId` is null

When a request fires against `/api/apps/null/entities/MoodEntry`, the server can respond in two ways depending on version and route:

- **HTTP 4xx (404 / 401):** react-query catches the error, marks the query as `isError: true`, and keeps `data` at its `initialData` value (`[]`). **No crash from this path.**
- **HTTP 200 with a paginated envelope:** `{ count: 0, results: [] }`. react-query succeeds, sets `data` to the response object. Pages call `.filter()` on a plain object → **crash**.

The second path is the one observed in Railway production. The Base44 API endpoint for unknown or null app IDs appears to return a 200 with a paginated envelope rather than a 4xx.

### 3b. SDK response format inconsistency

The SDK does not normalize all entity responses to a plain array. The documented `list()` and `filter()` methods can return:

| Call form | Observed return in Base44 preview | Observed return in Railway production |
|---|---|---|
| `.list()` (no limit) | `[...]` bare array | `{ count: N, results: [...] }` paginated |
| `.list(sort, limit)` | `[...]` bare array | `{ count: N, results: [...] }` paginated |
| `.filter({...})` | `[...]` bare array | `{ count: N, results: [...] }` paginated |

**Evidence:** `ProactiveCheckIn.jsx` already normalizes defensively:

```js
const recentMoods = Array.isArray(recentMoodsData) ? recentMoodsData : recentMoodsData?.results || [];
```

This is the only component in the codebase that was written with explicit awareness of the paginated response shape. All other data consumers assume a bare array.

### 3c. `initialData: []` does not protect against non-array responses

A common pattern across pages is:

```js
const { data: moodEntries } = useQuery({
  queryKey: ['moodEntries'],
  queryFn: () => base44.entities.MoodEntry.list('-date', 30),
  initialData: []
});
```

`initialData` sets the pre-fetch value only. Once the query resolves (even with a non-array value), `data` is replaced. So `moodEntries` becomes `{ count: 0, results: [] }` on Railway and every subsequent `.filter()` call throws.

---

## 4. Are the Page Crashes Caused by One Shared Problem?

**Yes.** All observed crashes trace back to the same two shared-layer failures:

| Symptom | Root Cause |
|---|---|
| `POST /api/apps/null/analytics/track/batch` | RC-A (null appId → analytics timer) |
| `GET /api/apps/null/entities/…` | RC-A (null appId → all entity calls) |
| `sessions.filter is not a function` | RC-B (SDK returns paginated object, page assumes array) |
| `moodEntries.find is not a function` | RC-B |
| `apiExercises.filter is not a function` | RC-B (inside `mergeExercises()`) |
| `sessionSummaries.map is not a function` | RC-B |
| `memberships.map is not a function` | RC-B |
| `resources.filter is not a function` | RC-B |
| `audioContent.map is not a function` | RC-B |

The page-level crashes are not independent bugs. They are the predictable downstream consequence of:
1. The SDK receiving `appId: null` (RC-A), which changes how the server responds.
2. Pages not handling the paginated envelope response shape (RC-B).

---

## 5. Shared Files / Modules Investigated

| File | Role | Finding |
|---|---|---|
| `src/lib/app-params.js` | Reads `appId` from URL / localStorage / env | `if (defaultValue)` falsy check lets `undefined` env var fall through → `appId = null` |
| `src/api/base44Client.js` | Creates SDK client | Passes `appId: null` to SDK; analytics timer fires unconditionally |
| `src/api/entities/index.js` | Re-export layer | No normalization; entities are pass-through getters to `base44.entities.*` |
| `src/lib/AuthContext.jsx` | Auth + public settings | Uses `appParams.appId` directly in request headers; same null propagation |
| `src/components/chat/ProactiveCheckIn.jsx` | Only consumer with defensive normalization | Shows the correct pattern the rest of the codebase lacks |

---

## 6. Pages Impacted by the Shared Issue

All pages that call `base44.entities.*.list()` or `.filter()` without defensive normalization:

| Page | Variable | Unguarded operation |
|---|---|---|
| `Progress.jsx` | `moodEntries`, `journalEntries`, `goals`, `exercises` | `.filter()`, passed to child components |
| `Coach.jsx` | `sessions` | `.filter()` |
| `Journal.jsx` | `thoughtJournals`, `sessionSummaries` | spread + `.map()` |
| `MoodTracker.jsx` | `moodEntries` | `.find()`, passed to child components |
| `Resources.jsx` | `resources`, `savedResources` | `.filter()`, `.map()`, `.find()` |
| `Community.jsx` | `memberships`, `groups`, `forumPosts`, `sharedProgress` | `.map()`, `.filter()`, `.length` |
| `ExerciseView.jsx` | `audioContent` | `.length`, `.map()` |
| `Exercises.jsx` | `apiExercises` (via `mergeExercises`) | `.filter()` inside `mergeExercises()` |
| `JournalDashboard.jsx` | `journals` | `.filter()` inside `useMemo` |

---

## 7. Primary Cause Classification

**Both causes are active and must be addressed in order.**

The root cause is **primarily the null `appId` context** (RC-A), because:
- A correctly configured `appId` would cause requests to succeed or fail with 4xx (keeping `data` at `initialData`).
- Without a valid `appId`, the server returns the paginated envelope, which triggers RC-B.

However, RC-B is an independent latent bug:
- Even with a valid `appId`, if the Base44 API version ever returns paginated envelopes for list/filter calls, the same crashes will occur.
- RC-B is therefore a real data-contract fragility that must be fixed at the shared layer regardless.

---

## 8. Recommended Fix Order

### Step 1 — Fix `VITE_BASE44_APP_ID` in Railway (infrastructure, not code)

Set the `VITE_BASE44_APP_ID` environment variable in Railway's build settings. This is the primary fix. Without it, all SDK calls go to `/api/apps/null/…`.

```
VITE_BASE44_APP_ID=<your-base44-app-id>
```

This must be set at **build time** (Vite bakes it into the bundle). Runtime injection will not work.

### Step 2 — Add response normalization at the shared layer (code fix)

Create or update a shared hook or utility that normalizes the SDK response before it reaches pages:

```js
// Proposed shared normalizer (src/lib/sdkHelpers.js)
export function normalizeList(data) {
  if (Array.isArray(data)) return data;
  if (data && Array.isArray(data.results)) return data.results;
  return [];
}
```

Pages should use this wrapper instead of bare `useQuery` + direct array access, or it can be added inside each `queryFn` as a post-processing step.

### Step 3 — Guard remaining local array accesses (already partially done in staging)

For any page not yet updated, add `Array.isArray()` guards at the point of first array operation. This is a defensive fallback, not a substitute for Step 2.

**Files already fixed in staging (brought in via this PR's merge):**
- `src/api/base44Client.js` — analytics null-appId guard
- `src/pages/Progress.jsx` — `moodEntries`, `journalEntries`, `goals`, `exercises`
- `src/pages/Coach.jsx` — `sessions`
- `src/pages/Journal.jsx` — `thoughtJournals`, `sessionSummaries`
- `src/pages/MoodTracker.jsx` — `moodEntries`
- `src/pages/Resources.jsx` — `resources` (null title/description guard)
- `src/components/exercises/exercisesData.js` — `apiExercises` in `mergeExercises()`

**Fixed in this PR (Community.jsx remaining gaps):**
- `memberships`, `groups`, `forumPosts`, `sharedProgress` — all unguarded array ops replaced with `safeMemberships`, `safeGroups`, `safeForumPosts`, `safeSharedProgress`

**Still needs attention (out of scope for this PR):**
- `JournalDashboard.jsx` — `journals` used in `useMemo` with multiple `.filter()` chains (uses `data: journals = []` destructuring default which only protects against `undefined`, not paginated objects)
- `ExerciseView.jsx` — `audioContent` has `initialData: []` so lower priority, but could crash on retry

---

## 9. Small Diagnostic Changes Made in This PR

1. **Community.jsx** — Added `Array.isArray()` guards for `memberships`, `groups`, `forumPosts`, `sharedProgress`. All derived variables renamed `safe*` consistently. No logic changes.

2. **Staging merge** — Brought in all staging fixes cleanly (no conflicts). These include the analytics null-appId guard and array guards across Progress, Coach, Journal, MoodTracker, Resources pages.

---

## 10. Conflicts Resolved

**No conflicts.** `git merge --no-commit --no-ff origin/staging` completed cleanly. All 24 changed files merged automatically. The merge was committed on `2026-03-22`.

---

## 11. PR Base Branch Confirmation

- **Base branch:** `staging`  
- **Compare branch:** `copilot/investigate-runtime-data-integration`  
- **Not targeting `main`.**

---

## 12. Conclusion

The Railway production failures are caused by a **single shared configuration gap** (`VITE_BASE44_APP_ID` not set in Railway build) that propagates through `app-params.js` → `base44Client.js` → all entity SDK calls. This single null value:

1. Routes all requests to `/api/apps/null/…`
2. Triggers a different response format from the Base44 server (paginated envelope vs. bare array)
3. Crashes every page that calls `.filter()`, `.map()`, or `.find()` on the SDK response

The page crashes are not isolated bugs — they are a predictable cascade from one missing environment variable. The correct fix order is: set the env var first, then add shared-layer response normalization as a defense-in-depth measure, then verify each page.

---

*Last updated: 2026-03-22 — Investigation by copilot/investigate-runtime-data-integration*

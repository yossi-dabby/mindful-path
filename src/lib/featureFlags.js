/**
 * @file src/lib/featureFlags.js
 *
 * Therapist Upgrade — Stage 2 Feature Flag Registry
 * Preview rebuild marker: 2026-03-19T19:29Z
 *
 * All flags default to false. The current default therapist path
 * (CBT_THERAPIST_WIRING_HYBRID via src/api/activeAgentWiring.js) is always
 * active when these flags are off.
 *
 * Flag evaluation order:
 *   1. THERAPIST_UPGRADE_ENABLED (master gate) must be true, AND
 *   2. The specific per-phase flag must also be true.
 *   Both must be true before any upgraded behavior is reachable.
 *
 * Rollback: set THERAPIST_UPGRADE_ENABLED to false to disable all Stage 2
 * behavior in a single change. No other code needs to be modified.
 *
 * See docs/therapist-upgrade-stage2-plan.md — Phase 0 for full context.
 *
 * DO NOT enable any flag in this file without completing the Phase 9 exit
 * criteria (docs/therapist-upgrade-stage2-plan.md §Phase 9).
 */

/**
 * All Stage 2 feature flags.
 *
 * Frozen at module load to prevent accidental runtime mutation.
 * Every flag defaults to false (upgrade path disabled, current path active).
 *
 * @type {Readonly<Record<string, boolean>>}
 */
export const THERAPIST_UPGRADE_FLAGS = Object.freeze({
  /**
   * Master upgrade gate.
   * When false, all per-phase flags are treated as false regardless of their
   * individual values. This is the single rollback switch for all of Stage 2.
   *
   * Staging enablement: set the environment variable
   *   VITE_THERAPIST_UPGRADE_ENABLED=true
   * to enable in a staging build without changing source code.
   * The value defaults to false when the variable is absent or any other value.
   */
  THERAPIST_UPGRADE_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_ENABLED === 'true',

  /**
   * Phase 1 — Structured therapist memory layer.
   * Staging enablement: set VITE_THERAPIST_UPGRADE_MEMORY_ENABLED=true
   */
  THERAPIST_UPGRADE_MEMORY_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_MEMORY_ENABLED === 'true',

  /**
   * Phase 2 — Session-end structured summarization.
   * Staging enablement: set VITE_THERAPIST_UPGRADE_SUMMARIZATION_ENABLED=true
   */
  THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_SUMMARIZATION_ENABLED === 'true',

  /**
   * Phase 3 — Therapist workflow engine.
   * Staging enablement: set VITE_THERAPIST_UPGRADE_WORKFLOW_ENABLED=true
   */
  THERAPIST_UPGRADE_WORKFLOW_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_WORKFLOW_ENABLED === 'true',

  /**
   * Phase 4 — External trusted knowledge ingestion.
   * Staging enablement: set VITE_THERAPIST_UPGRADE_TRUSTED_INGESTION_ENABLED=true
   */
  THERAPIST_UPGRADE_TRUSTED_INGESTION_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_TRUSTED_INGESTION_ENABLED === 'true',

  /**
   * Phase 5 — Retrieval orchestration (internal-first).
   * Staging enablement: set VITE_THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED=true
   */
  THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED === 'true',

  /**
   * Phase 6 — Live retrieval allowlist wrapper.
   * Staging enablement: set VITE_THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED=true
   */
  THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED === 'true',

  /**
   * Phase 7 — Safety mode + emergency resource layer.
   * Staging enablement: set VITE_THERAPIST_UPGRADE_SAFETY_MODE_ENABLED=true
   */
  THERAPIST_UPGRADE_SAFETY_MODE_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_SAFETY_MODE_ENABLED === 'true',
});

/**
 * Returns true when the given hostname is an explicitly recognised
 * preview/staging host where the `_s2` URL override is permitted.
 *
 * Recognised patterns:
 *   - localhost       — local development server
 *   - 127.0.0.1       — local development / CI runner
 *   - *.base44.app    — Base44 platform hosts (preview and staging environments)
 *   - base44.app      — Base44 root domain (edge case)
 *
 * Any other hostname (including custom production domains) returns false.
 * An absent or non-string hostname always returns false (fail-closed).
 *
 * @param {string} hostname
 * @returns {boolean}
 */
function _isPreviewStagingHost(hostname) {
  if (!hostname || typeof hostname !== 'string') return false;
  const h = hostname.toLowerCase();
  if (h === 'localhost' || h === '127.0.0.1') return true;
  if (h === 'base44.app' || h.endsWith('.base44.app')) return true;
  return false;
}

/**
 * Reads staging-only runtime overrides from the URL query string.
 *
 * This is the fix for Base44 preview/staging builds where VITE_* environment
 * variables are baked in at build time and may not be reliably picked up even
 * after rebuilds.  The URL override layer allows flag enablement at runtime
 * without touching source code or triggering a new build.
 *
 * SAFETY RULES (non-negotiable):
 *   - UNRECOGNISED HOSTS ARE ALWAYS FAIL-CLOSED: returns {} unless the current
 *     hostname is an explicitly recognised preview/staging host.  This replaces
 *     the previous import.meta.env.PROD guard, which incorrectly blocked
 *     Base44 preview environments that also run production builds.
 *   - SSR / Node.js / test environments (no window) return {} silently.
 *   - Unrecognised flag names are silently ignored; no unknown flags are accepted.
 *   - Any error during URL parsing returns {} (fail-closed).
 *
 * URL parameter format (staging/preview only):
 *   ?_s2=FLAG1,FLAG2,...
 *
 * Example — enable master gate + memory phase on a Base44 preview host:
 *   https://myapp.base44.app/?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_MEMORY_ENABLED
 *
 * The override is additive: a flag set to true via the URL takes precedence
 * over the build-time value (which defaults to false).  There is no way to
 * force a flag to false via the URL — the URL can only enable, not disable.
 *
 * @returns {Record<string, boolean>} Flags that the URL has overridden to true.
 *   Always returns an empty object on unrecognised (production) hosts.
 */
function _readStagingRuntimeOverrides() {
  try {
    // Guard for non-browser environments (Node.js, SSR, test runners).
    if (typeof window === 'undefined') return {};

    // Allow override only on explicitly recognised preview/staging hosts.
    // Unknown hosts (including production custom domains) always fail-closed.
    const hostname = window.location?.hostname ?? '';
    if (!_isPreviewStagingHost(hostname)) return {};

    const search = window.location?.search ?? '';
    if (!search) return {};

    const raw = new URLSearchParams(search).get('_s2');
    if (!raw) return {};

    const overrides = {};
    for (const key of raw.split(',')) {
      const trimmed = key.trim();
      // Only accept keys that are recognised Stage 2 flag names.
      if (trimmed && trimmed in THERAPIST_UPGRADE_FLAGS) {
        overrides[trimmed] = true;
      }
    }
    return overrides;
  } catch (_e) {
    // Parsing failure must never propagate — always fail-closed.
    return {};
  }
}

/**
 * Evaluates a Stage 2 feature flag by name.
 *
 * Evaluation order (first truthy wins):
 *   1. Build-time env var (import.meta.env.VITE_*) — the primary path.
 *   2. Staging runtime URL override (?_s2=...) — preview/staging hosts only;
 *      never active on unrecognised (production) hosts.
 *
 * The master flag (THERAPIST_UPGRADE_ENABLED) must be true via either path,
 * and the specific per-phase flag must also be true via either path, before
 * this returns true.
 *
 * Returns false (current default path) when:
 *   - The flag name is not a recognised Stage 2 flag key
 *   - THERAPIST_UPGRADE_ENABLED is false (build-time and runtime)
 *   - The specific flag value is false (build-time and runtime)
 *
 * This function is the single routing guard for all Stage 2 upgrade paths.
 * Every future upgrade code branch must call this before executing.
 *
 * @param {string} flagName - A key from THERAPIST_UPGRADE_FLAGS
 * @returns {boolean} True only when both the master gate and the specific flag are enabled
 */
export function isUpgradeEnabled(flagName) {
  if (!(flagName in THERAPIST_UPGRADE_FLAGS)) {
    logUpgradeEvent('flag_isolation_failure', { flagName, reason: 'unknown_flag' });
    return false;
  }

  // Layer 2: preview/staging-only runtime overrides (always {} on unrecognised hosts).
  const stagingOverrides = _readStagingRuntimeOverrides();

  // The master flag may be evaluated directly without the double-gate logic.
  if (flagName === 'THERAPIST_UPGRADE_ENABLED') {
    return THERAPIST_UPGRADE_FLAGS.THERAPIST_UPGRADE_ENABLED ||
      stagingOverrides.THERAPIST_UPGRADE_ENABLED === true;
  }

  // All per-phase flags require the master flag to also be enabled.
  const masterEnabled =
    THERAPIST_UPGRADE_FLAGS.THERAPIST_UPGRADE_ENABLED ||
    stagingOverrides.THERAPIST_UPGRADE_ENABLED === true;

  if (!masterEnabled) {
    return false;
  }

  return THERAPIST_UPGRADE_FLAGS[flagName] || stagingOverrides[flagName] === true;
}

// ─── Diagnostic surface (temporary — remove after Base44 preview investigation) ─

/**
 * Returns a diagnostic snapshot of the Stage 2 flag evaluation state.
 *
 * DIAGNOSTIC-ONLY — gated by `?_s2debug=true` in the URL.
 * Returns null when the gate param is absent (fail-closed).
 *
 * Works on any host so the hostname itself is observable (helps diagnose
 * why a host is not being recognised as a preview/staging host).
 * Never mutates flag state or changes routing behaviour.
 *
 * Remove together with logStage2Diagnostics() after diagnosis is complete.
 *
 * @returns {{ hostname: string|null, search: string|null,
 *             isPreviewStagingHost: boolean, parsedS2Flags: string[],
 *             computedFlags: Record<string, boolean>,
 *             masterGateOn: boolean, routeHint: string } | null}
 */
export function getStage2DiagnosticPayload() {
  try {
    if (typeof window === 'undefined') return null;

    const search = window.location?.search ?? '';
    const params = new URLSearchParams(search);
    if (params.get('_s2debug') !== 'true') return null;

    const hostname = window.location?.hostname ?? null;

    // Parse _s2 flags (may be absent or empty).
    const rawS2 = params.get('_s2') ?? '';
    const parsedS2Flags = rawS2
      ? rawS2.split(',').map(k => k.trim()).filter(Boolean)
      : [];

    // Evaluate every Stage 2 flag through the live isUpgradeEnabled() evaluator.
    const computedFlags = {};
    for (const flagName of Object.keys(THERAPIST_UPGRADE_FLAGS)) {
      computedFlags[flagName] = isUpgradeEnabled(flagName);
    }

    const masterGateOn = computedFlags['THERAPIST_UPGRADE_ENABLED'] === true;

    // Route hint — mirrors resolveTherapistWiring() logic without importing it.
    let routeHint;
    if (!masterGateOn) {
      routeHint = 'HYBRID (master gate off)';
    } else if (computedFlags['THERAPIST_UPGRADE_SAFETY_MODE_ENABLED']) {
      routeHint = 'STAGE2_V5 (safety mode)';
    } else if (computedFlags['THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED']) {
      routeHint = 'STAGE2_V4 (live retrieval)';
    } else if (computedFlags['THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED']) {
      routeHint = 'STAGE2_V3 (retrieval orchestration)';
    } else if (computedFlags['THERAPIST_UPGRADE_WORKFLOW_ENABLED']) {
      routeHint = 'STAGE2_V2 (workflow engine)';
    } else if (computedFlags['THERAPIST_UPGRADE_MEMORY_ENABLED']) {
      routeHint = 'STAGE2_V1 (memory layer)';
    } else {
      routeHint = 'HYBRID (master gate on, no phase flag matched)';
    }

    return {
      hostname,
      search,
      isPreviewStagingHost: _isPreviewStagingHost(hostname ?? ''),
      parsedS2Flags,
      computedFlags,
      masterGateOn,
      routeHint,
    };
  } catch (_e) {
    // Diagnostics must never propagate errors.
    return null;
  }
}

/**
 * Logs the Stage 2 diagnostic payload to the console when `?_s2debug=true`
 * is present in the URL.  No-op otherwise (fail-closed).
 *
 * Called once at module load.  Safe to remove together with
 * getStage2DiagnosticPayload() after diagnosis is complete.
 */
export function logStage2Diagnostics() {
  try {
    const p = getStage2DiagnosticPayload();
    if (!p) return;
    console.group('[S2 Diagnostics] Stage 2 flag evaluation report');
    console.log('hostname            :', p.hostname);
    console.log('search              :', p.search);
    console.log('isPreviewStagingHost:', p.isPreviewStagingHost);
    console.log('parsedS2Flags       :', p.parsedS2Flags);
    console.log('computedFlags       :', p.computedFlags);
    console.log('masterGateOn        :', p.masterGateOn);
    console.log('routeHint           :', p.routeHint);
    console.groupEnd();
  } catch (_e) {
    // Diagnostics must never break the app.
  }
}

// Emit diagnostics at module load when _s2debug=true is in the URL.
logStage2Diagnostics();

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Optional analytics tracker registered by the app at load time.
 * When set, logUpgradeEvent forwards events to the app's analytics pipeline
 * instead of (or in addition to) the console.
 *
 * Set via registerUpgradeAnalyticsTracker(). Never called directly outside
 * this module.
 *
 * @type {((eventName: string, properties: object) => void) | null}
 */
let _upgradeTrack = null;

/**
 * Registers the app-level analytics tracker for upgrade observability events.
 *
 * Call once at app initialisation with base44.analytics.track (or a compatible
 * function) to route upgrade events into the app's existing analytics pipeline.
 * If never called, logUpgradeEvent falls back to console-only output.
 *
 * Logging failure must never break therapist routing — the tracker is always
 * called inside a try-catch.
 *
 * Phase 0.1 — replaces console-only observability with the app's existing
 * base44.analytics.track pattern (Section B of the Phase 0.1 spec).
 *
 * @param {(eventName: string, properties: object) => void} trackFn
 *   A function with the same signature as base44.analytics.track.
 */
export function registerUpgradeAnalyticsTracker(trackFn) {
  if (typeof trackFn === 'function') {
    _upgradeTrack = trackFn;
  } else {
    // Passing null (or any non-function) resets the tracker to the console fallback.
    _upgradeTrack = null;
  }
}

/**
 * Baseline observability hook for upgrade path events.
 *
 * When an analytics tracker has been registered via registerUpgradeAnalyticsTracker,
 * events are forwarded to that tracker (the app's base44.analytics.track pipeline).
 * Console output is retained as a fallback so events still surface in development
 * and CI logs if no tracker is registered.
 *
 * Isolation failures (unknown flags) always emit a console.warn in addition to
 * the analytics event so they are impossible to miss during development.
 *
 * This function must not throw — logging failure must never break routing.
 *
 * @param {string} event - Event identifier (e.g. 'flag_isolation_failure', 'route_selected')
 * @param {object} [context] - Additional diagnostic context
 */
export function logUpgradeEvent(event, context = {}) {
  // Always attempt analytics tracking first if a tracker is registered.
  if (_upgradeTrack !== null) {
    try {
      _upgradeTrack('therapist_upgrade_' + event, context);
    } catch (_e) {
      // Analytics failure must never propagate — fall through to console.
    }
  }

  if (event === 'flag_isolation_failure') {
    console.warn('[TherapistUpgrade] Isolation failure —', event, context);
    return;
  }

  if (event === 'route_selected' || event === 'route_not_selected') {
    console.log('[TherapistUpgrade]', event, context);
    return;
  }

  // All other events are silent at Phase 0 to avoid production noise.
  // Later phases may expand this switch as needed.
}
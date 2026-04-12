/**
 * @file src/lib/featureFlags.js
 *
 * Therapist Upgrade — Stage 2 Feature Flag Registry
 * Preview rebuild marker: 2026-03-19T21:52Z
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

// Wave 2D — strategy engine metadata for diagnostics (read-only constants, no runtime state).
// therapistStrategyEngine.js has no imports of its own, so this cannot create a cycle.
import {
  STRATEGY_VERSION,
  STRATEGY_INTERVENTION_MODES,
} from './therapistStrategyEngine.js';

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

  /**
   * Phase 1 Quality Gains — Formulation context injection + Socratic patterns.
   * Activates V6 wiring: injects CaseFormulation context into the session-start
   * payload and enables the Socratic / non-repetitive / formulation-aligned
   * response rules in the workflow engine.
   * Staging enablement: set VITE_THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED=true
   */
  THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED === 'true',

  /**
   * Phase 3 Deep Personalization — Cross-session continuity layer.
   * Activates V7 wiring: reads prior therapist memory records and injects a
   * structured cross-session continuity block (recurring patterns, open
   * follow-up tasks, prior interventions) into the session-start payload.
   * Both agents are personalised using longitudinal memory when this flag is on.
   * Staging enablement: set VITE_THERAPIST_UPGRADE_CONTINUITY_ENABLED=true
   */
  THERAPIST_UPGRADE_CONTINUITY_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_CONTINUITY_ENABLED === 'true',

  /**
   * Wave 2B — Therapeutic Strategy Layer.
   * Gates runtime injection of the TherapistStrategyState engine into the
   * session-start content path.  When enabled together with the master gate,
   * resolveTherapistWiring() returns CBT_THERAPIST_WIRING_STAGE2_V8 and
   * buildV8SessionStartContentAsync appends a strategy guidance section to
   * the session-start payload.  The section is clearly labeled as guidance
   * and does NOT replace or weaken any existing safety filter.
   *
   * Fail-open: any strategy computation error returns the V7 base content
   * unchanged.  Production behavior is EXACTLY preserved when this flag is off.
   *
   * Staging enablement: set VITE_THERAPIST_UPGRADE_STRATEGY_ENABLED=true
   */
  THERAPIST_UPGRADE_STRATEGY_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_STRATEGY_ENABLED === 'true',

  /**
   * Wave 3B — Longitudinal Therapeutic State (LTS) write path.
   *
   * When enabled together with THERAPIST_UPGRADE_SUMMARIZATION_ENABLED and the
   * master gate, a second fire-and-forget step runs after each successful
   * therapist session memory write:
   *   1. The most recent bounded set of session records is fetched from
   *      CompanionMemory via retrieveTherapistMemory.
   *   2. buildLongitudinalState() recomputes the LTS from those records.
   *   3. writeLTSSnapshot upserts one canonical LTS snapshot record.
   *
   * The LTS write is fully additive and fail-closed:
   *   - It never runs before the session memory write.
   *   - Failure of the LTS write never affects the session memory write result.
   *   - When this flag is off, no LTS records are read or written.
   *   - No LTS read path, no session-start wiring, and no strategy-engine
   *     integration is activated by this flag.
   *
   * Prerequisite: THERAPIST_UPGRADE_SUMMARIZATION_ENABLED must also be true
   * for the session memory write to run (and thus for the LTS to have data).
   * Enabling this flag alone without SUMMARIZATION_ENABLED is safe (LTS will
   * compute from whatever records exist) but unlikely to produce useful output.
   *
   * Backend: also requires the THERAPIST_UPGRADE_LONGITUDINAL_ENABLED Deno
   * secret to be set to 'true' in Base44 Application Secrets for the
   * writeLTSSnapshot function to accept the write request.
   *
   * Staging enablement: set VITE_THERAPIST_UPGRADE_LONGITUDINAL_ENABLED=true
   */
  THERAPIST_UPGRADE_LONGITUDINAL_ENABLED: import.meta.env?.VITE_THERAPIST_UPGRADE_LONGITUDINAL_ENABLED === 'true',
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
    } else if (computedFlags['THERAPIST_UPGRADE_CONTINUITY_ENABLED']) {
      routeHint = 'STAGE2_V7 (continuity)';
    } else if (computedFlags['THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED']) {
      routeHint = 'STAGE2_V6 (formulation context)';
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
      // Wave 2D — static strategy engine metadata (no runtime state, purely from constants).
      strategyEngine: {
        version: STRATEGY_VERSION,
        availableModes: Object.values(STRATEGY_INTERVENTION_MODES),
      },
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
    console.log('strategyEngine      :', p.strategyEngine);
    console.groupEnd();
  } catch (_e) {
    // Diagnostics must never break the app.
  }
}

// Emit diagnostics at module load when _s2debug=true is in the URL.
logStage2Diagnostics();

// ─── Phase 4 — Unified Activation Diagnostics ────────────────────────────────

/**
 * Returns a unified diagnostic snapshot covering the activation state of BOTH
 * the Therapist upgrade (THERAPIST_UPGRADE_FLAGS) and the AI Companion upgrade
 * (COMPANION_UPGRADE_FLAGS).
 *
 * DIAGNOSTIC-ONLY — gated by `?_s2debug=true` in the URL.
 * Returns null when the gate param is absent (fail-closed).
 *
 * This is the Phase 4 replacement for the per-agent diagnostic helpers.
 * It provides a single QA checkpoint for the full upgrade activation state
 * before any broader production flag enablement.  Both agents are covered in
 * one call so staging QA can validate Therapist and Companion state together.
 *
 * SAFETY RULES (non-negotiable):
 *   - No private user data is included (no message content, no entity IDs,
 *     no PII, no journal content, no conversation text).
 *   - No routing behaviour is changed — purely observational.
 *   - No flag state is mutated.
 *   - Any error returns null (fail-closed).
 *
 * Agent separation is preserved:
 *   - therapist.computedFlags contains only THERAPIST_UPGRADE_* keys.
 *   - companion.computedFlags contains only COMPANION_UPGRADE_* keys.
 *   - No cross-contamination between the two flag namespaces.
 *
 * @returns {{
 *   hostname: string|null,
 *   search: string|null,
 *   isPreviewStagingHost: boolean,
 *   snapshotTimestamp: string,
 *   therapist: {
 *     parsedS2Flags: string[],
 *     computedFlags: Record<string, boolean>,
 *     masterGateOn: boolean,
 *     routeHint: string,
 *   },
 *   companion: {
 *     parsedC2Flags: string[],
 *     computedFlags: Record<string, boolean>,
 *     masterGateOn: boolean,
 *     routeHint: string,
 *   },
 * } | null}
 */
export function getActivationDiagnostics() {
  try {
    if (typeof window === 'undefined') return null;

    const search = window.location?.search ?? '';
    const params = new URLSearchParams(search);
    if (params.get('_s2debug') !== 'true') return null;

    const hostname = window.location?.hostname ?? null;

    // ── Therapist section ──────────────────────────────────────────────────
    const rawS2 = params.get('_s2') ?? '';
    const parsedS2Flags = rawS2
      ? rawS2.split(',').map(k => k.trim()).filter(Boolean)
      : [];

    const therapistComputedFlags = {};
    for (const flagName of Object.keys(THERAPIST_UPGRADE_FLAGS)) {
      therapistComputedFlags[flagName] = isUpgradeEnabled(flagName);
    }

    const therapistMasterOn = therapistComputedFlags['THERAPIST_UPGRADE_ENABLED'] === true;

    let therapistRouteHint;
    if (!therapistMasterOn) {
      therapistRouteHint = 'HYBRID (master gate off)';
    } else if (therapistComputedFlags['THERAPIST_UPGRADE_CONTINUITY_ENABLED']) {
      therapistRouteHint = 'STAGE2_V7 (continuity)';
    } else if (therapistComputedFlags['THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED']) {
      therapistRouteHint = 'STAGE2_V6 (formulation context)';
    } else if (therapistComputedFlags['THERAPIST_UPGRADE_SAFETY_MODE_ENABLED']) {
      therapistRouteHint = 'STAGE2_V5 (safety mode)';
    } else if (therapistComputedFlags['THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED']) {
      therapistRouteHint = 'STAGE2_V4 (live retrieval)';
    } else if (therapistComputedFlags['THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED']) {
      therapistRouteHint = 'STAGE2_V3 (retrieval orchestration)';
    } else if (therapistComputedFlags['THERAPIST_UPGRADE_WORKFLOW_ENABLED']) {
      therapistRouteHint = 'STAGE2_V2 (workflow engine)';
    } else if (therapistComputedFlags['THERAPIST_UPGRADE_MEMORY_ENABLED']) {
      therapistRouteHint = 'STAGE2_V1 (memory layer)';
    } else {
      therapistRouteHint = 'HYBRID (master gate on, no phase flag matched)';
    }

    // ── Companion section ──────────────────────────────────────────────────
    const rawC2 = params.get('_c2') ?? '';
    const parsedC2Flags = rawC2
      ? rawC2.split(',').map(k => k.trim()).filter(Boolean)
      : [];

    const companionComputedFlags = {};
    for (const flagName of Object.keys(COMPANION_UPGRADE_FLAGS)) {
      companionComputedFlags[flagName] = isCompanionUpgradeEnabled(flagName);
    }

    const companionMasterOn = companionComputedFlags['COMPANION_UPGRADE_ENABLED'] === true;

    let companionRouteHint;
    if (!companionMasterOn) {
      companionRouteHint = 'HYBRID (master gate off)';
    } else if (companionComputedFlags['COMPANION_UPGRADE_CONTINUITY_ENABLED']) {
      companionRouteHint = 'UPGRADE_V2 (continuity)';
    } else if (companionComputedFlags['COMPANION_UPGRADE_WARMTH_ENABLED']) {
      companionRouteHint = 'UPGRADE_V1 (warmth)';
    } else {
      companionRouteHint = 'HYBRID (master gate on, no phase flag matched)';
    }

    return {
      hostname,
      search,
      isPreviewStagingHost: _isPreviewStagingHost(hostname ?? ''),
      snapshotTimestamp: new Date().toISOString(),
      therapist: {
        parsedS2Flags,
        computedFlags: therapistComputedFlags,
        masterGateOn: therapistMasterOn,
        routeHint: therapistRouteHint,
        // Wave 2D — static strategy engine metadata (no runtime state, purely from constants).
        strategyEngine: {
          version: STRATEGY_VERSION,
          availableModes: Object.values(STRATEGY_INTERVENTION_MODES),
        },
        // Wave 3E — LTS layer activation status (boolean flags only, no runtime state).
        ltsLayer: {
          ltsLayerActive: isUpgradeEnabled('THERAPIST_UPGRADE_LONGITUDINAL_ENABLED'),
          strategyLayerActive: isUpgradeEnabled('THERAPIST_UPGRADE_STRATEGY_ENABLED'),
        },
      },
      companion: {
        parsedC2Flags,
        computedFlags: companionComputedFlags,
        masterGateOn: companionMasterOn,
        routeHint: companionRouteHint,
      },
    };
  } catch (_e) {
    // Diagnostics must never propagate errors.
    return null;
  }
}

/**
 * Logs the unified activation diagnostic snapshot to the console when
 * `?_s2debug=true` is present in the URL.  No-op otherwise (fail-closed).
 *
 * Covers both the Therapist upgrade and the AI Companion upgrade in a single
 * console group so staging QA can validate both agents at the same time.
 *
 * Called once at module load alongside logStage2Diagnostics().
 */
export function logActivationDiagnostics() {
  try {
    const p = getActivationDiagnostics();
    if (!p) return;
    console.group('[Activation Diagnostics] Therapist + Companion upgrade state');
    console.log('hostname             :', p.hostname);
    console.log('isPreviewStagingHost :', p.isPreviewStagingHost);
    console.log('snapshotTimestamp    :', p.snapshotTimestamp);
    console.group('[Therapist]');
    console.log('parsedS2Flags        :', p.therapist.parsedS2Flags);
    console.log('computedFlags        :', p.therapist.computedFlags);
    console.log('masterGateOn         :', p.therapist.masterGateOn);
    console.log('routeHint            :', p.therapist.routeHint);
    console.log('strategyEngine       :', p.therapist.strategyEngine);
    console.log('ltsLayer             :', p.therapist.ltsLayer); // Wave 3E
    console.groupEnd();
    console.group('[Companion]');
    console.log('parsedC2Flags        :', p.companion.parsedC2Flags);
    console.log('computedFlags        :', p.companion.computedFlags);
    console.log('masterGateOn         :', p.companion.masterGateOn);
    console.log('routeHint            :', p.companion.routeHint);
    console.groupEnd();
    console.groupEnd();
  } catch (_e) {
    // Diagnostics must never break the app.
  }
}

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

// ─── AI Companion Upgrade — Phase 2 Feature Flag Registry ─────────────────────

/**
 * All AI Companion upgrade feature flags.
 *
 * Frozen at module load to prevent accidental runtime mutation.
 * Every flag defaults to false (upgrade path disabled, legacy HYBRID path active).
 *
 * Routing is completely independent of THERAPIST_UPGRADE_FLAGS — the companion
 * master gate and per-phase gates have no effect on therapist wiring, and vice
 * versa.  This explicit separation prevents role ambiguity between agents.
 *
 * Rollback: set COMPANION_UPGRADE_ENABLED to false to disable all companion
 * upgrade behavior in a single change.  No other code needs to be modified.
 *
 * @type {Readonly<Record<string, boolean>>}
 */
export const COMPANION_UPGRADE_FLAGS = Object.freeze({
  /**
   * Companion upgrade master gate.
   * When false, all per-phase companion flags are treated as false regardless
   * of their individual values.  This is the single kill-switch for all
   * companion upgrade behavior.
   *
   * Staging enablement: set the environment variable
   *   VITE_COMPANION_UPGRADE_ENABLED=true
   */
  COMPANION_UPGRADE_ENABLED: import.meta.env?.VITE_COMPANION_UPGRADE_ENABLED === 'true',

  /**
   * Phase 2 — Warmth and attuned response layer.
   * Activates AI_COMPANION_WIRING_UPGRADE_V1: companion responses become
   * warmer, more emotionally attuned, and less repetitive.
   * Staging enablement: set VITE_COMPANION_UPGRADE_WARMTH_ENABLED=true
   */
  COMPANION_UPGRADE_WARMTH_ENABLED: import.meta.env?.VITE_COMPANION_UPGRADE_WARMTH_ENABLED === 'true',

  /**
   * Phase 3 — Companion continuity layer.
   * Activates AI_COMPANION_WIRING_UPGRADE_V2: companion draws on prior
   * session summaries to surface session-to-session continuity cues and
   * provide individually tailored responses grounded in the user's history.
   * Staging enablement: set VITE_COMPANION_UPGRADE_CONTINUITY_ENABLED=true
   */
  COMPANION_UPGRADE_CONTINUITY_ENABLED: import.meta.env?.VITE_COMPANION_UPGRADE_CONTINUITY_ENABLED === 'true',
});

/**
 * Reads staging-only runtime overrides for companion flags from the URL.
 *
 * Uses the ?_c2=FLAG1,FLAG2,... parameter (parallel to ?_s2=... for therapist).
 * All safety rules from _readStagingRuntimeOverrides() apply here:
 *   - Fail-closed on unrecognised (production) hosts
 *   - No unknown flag names accepted
 *   - Any parsing error returns {}
 *
 * @returns {Record<string, boolean>}
 */
function _readCompanionStagingRuntimeOverrides() {
  try {
    if (typeof window === 'undefined') return {};
    const hostname = window.location?.hostname ?? '';
    if (!_isPreviewStagingHost(hostname)) return {};
    const search = window.location?.search ?? '';
    if (!search) return {};
    const raw = new URLSearchParams(search).get('_c2');
    if (!raw) return {};
    const overrides = {};
    for (const key of raw.split(',')) {
      const trimmed = key.trim();
      if (trimmed && trimmed in COMPANION_UPGRADE_FLAGS) {
        overrides[trimmed] = true;
      }
    }
    return overrides;
  } catch (_e) {
    return {};
  }
}

/**
 * Evaluates an AI Companion upgrade feature flag by name.
 *
 * Evaluation order (first truthy wins):
 *   1. Build-time env var (import.meta.env.VITE_COMPANION_*) — the primary path.
 *   2. Staging runtime URL override (?_c2=...) — preview/staging hosts only.
 *
 * The master flag (COMPANION_UPGRADE_ENABLED) must be true via either path,
 * and the specific per-phase flag must also be true via either path, before
 * this returns true.
 *
 * Returns false (legacy HYBRID path) when:
 *   - The flag name is not a recognised companion upgrade flag key
 *   - COMPANION_UPGRADE_ENABLED is false (build-time and runtime)
 *   - The specific flag value is false (build-time and runtime)
 *
 * This is the single routing guard for all companion upgrade paths.
 *
 * @param {string} flagName - A key from COMPANION_UPGRADE_FLAGS
 * @returns {boolean}
 */
export function isCompanionUpgradeEnabled(flagName) {
  if (!(flagName in COMPANION_UPGRADE_FLAGS)) {
    logCompanionUpgradeEvent('flag_isolation_failure', { flagName, reason: 'unknown_flag' });
    return false;
  }

  const stagingOverrides = _readCompanionStagingRuntimeOverrides();

  if (flagName === 'COMPANION_UPGRADE_ENABLED') {
    return COMPANION_UPGRADE_FLAGS.COMPANION_UPGRADE_ENABLED ||
      stagingOverrides.COMPANION_UPGRADE_ENABLED === true;
  }

  const masterEnabled =
    COMPANION_UPGRADE_FLAGS.COMPANION_UPGRADE_ENABLED ||
    stagingOverrides.COMPANION_UPGRADE_ENABLED === true;

  if (!masterEnabled) {
    return false;
  }

  return COMPANION_UPGRADE_FLAGS[flagName] || stagingOverrides[flagName] === true;
}

/**
 * Optional analytics tracker for companion upgrade observability.
 *
 * @type {((eventName: string, properties: object) => void) | null}
 */
let _companionUpgradeTrack = null;

/**
 * Registers the app-level analytics tracker for companion upgrade events.
 *
 * @param {(eventName: string, properties: object) => void} trackFn
 */
export function registerCompanionUpgradeAnalyticsTracker(trackFn) {
  if (typeof trackFn === 'function') {
    _companionUpgradeTrack = trackFn;
  } else {
    _companionUpgradeTrack = null;
  }
}

/**
 * Observability hook for companion upgrade routing events.
 *
 * Mirrors logUpgradeEvent() for the companion agent.
 * Must not throw — logging failure must never break routing.
 *
 * @param {string} event
 * @param {object} [context]
 */
export function logCompanionUpgradeEvent(event, context = {}) {
  if (_companionUpgradeTrack !== null) {
    try {
      _companionUpgradeTrack('companion_upgrade_' + event, context);
    } catch (_e) {
      // Analytics failure must never propagate — fall through to console.
    }
  }

  if (event === 'flag_isolation_failure') {
    console.warn('[CompanionUpgrade] Isolation failure —', event, context);
    return;
  }

  if (event === 'route_selected' || event === 'route_not_selected') {
    console.log('[CompanionUpgrade]', event, context);
    return;
  }
}

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

// Emit unified activation diagnostics at module load when _s2debug=true is in the URL.
// Called after all flag registries and evaluators are fully initialised.
logActivationDiagnostics();
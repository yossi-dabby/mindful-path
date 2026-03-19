/**
 * @file src/lib/featureFlags.js
 *
 * Therapist Upgrade — Stage 2 Feature Flag Registry
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
   */
  THERAPIST_UPGRADE_ENABLED: false,

  /** Phase 1 — Structured therapist memory layer */
  THERAPIST_UPGRADE_MEMORY_ENABLED: false,

  /** Phase 2 — Session-end structured summarization */
  THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: false,

  /** Phase 3 — Therapist workflow engine */
  THERAPIST_UPGRADE_WORKFLOW_ENABLED: false,

  /** Phase 4 — External trusted knowledge ingestion */
  THERAPIST_UPGRADE_TRUSTED_INGESTION_ENABLED: false,

  /** Phase 5 — Retrieval orchestration (internal-first) */
  THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED: false,

  /** Phase 6 — Live retrieval allowlist wrapper */
  THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED: false,

  /** Phase 7 — Safety mode + emergency resource layer */
  THERAPIST_UPGRADE_SAFETY_MODE_ENABLED: false,
});

/**
 * Evaluates a Stage 2 feature flag by name.
 *
 * The master flag (THERAPIST_UPGRADE_ENABLED) must be true, and the specific
 * per-phase flag must also be true, before this returns true.
 *
 * Returns false (current default path) when:
 *   - The flag name is not a recognised Stage 2 flag key
 *   - THERAPIST_UPGRADE_ENABLED is false
 *   - The specific flag value is false
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

  // The master flag may be evaluated directly without the double-gate logic.
  if (flagName === 'THERAPIST_UPGRADE_ENABLED') {
    return THERAPIST_UPGRADE_FLAGS.THERAPIST_UPGRADE_ENABLED;
  }

  // All per-phase flags require the master flag to also be enabled.
  if (!THERAPIST_UPGRADE_FLAGS.THERAPIST_UPGRADE_ENABLED) {
    return false;
  }

  return THERAPIST_UPGRADE_FLAGS[flagName];
}

/**
 * Baseline observability hook for upgrade path events.
 *
 * Emits console warnings for isolation failures (unknown flag names, unexpected
 * access attempts) so they surface in development and CI logs.
 *
 * Upgrade-path selection events (route_selected, route_not_selected) are
 * emitted as console.log entries to confirm routing behaviour during
 * development and testing. Future phases may route these to an analytics
 * pipeline without changing callers.
 *
 * This function is intentionally minimal for Phase 0. It must not be removed
 * or replaced — later phases extend it.
 *
 * @param {string} event - Event identifier (e.g. 'flag_isolation_failure', 'route_selected')
 * @param {object} [context] - Additional diagnostic context
 */
export function logUpgradeEvent(event, context = {}) {
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

/**
 * @file src/api/activeAgentWiring.js
 *
 * Runtime wiring selection for the two current agents.
 *
 * This is the single place where the active wiring is chosen.
 * All other code that needs the live agent configuration should import from here.
 *
 * Current selection: hybrid (caution-layer augmentation active)
 *   - CBT Therapist → CBT_THERAPIST_WIRING_HYBRID
 *   - AI Companion  → AI_COMPANION_WIRING_HYBRID
 *
 * Phase 0.1 — Real routing integration point added (Section A of Phase 0.1 spec).
 * The upgrade feature flag is now evaluated at module initialisation via
 * resolveTherapistWiring(). Flag-off behaviour is identical to Phase 0 — the
 * hybrid wiring is always returned. Flag-on at this stage also returns the hybrid
 * wiring because no upgraded path exists yet. Future phases attach here.
 *
 * Analytics registration (Section B of Phase 0.1 spec) is performed lazily
 * via a dynamic import of base44Client.js so that test environments that lack
 * the browser context are unaffected.
 *
 * To roll back to V1 (Steps 1–3 only), see docs/ai-agent-hybrid-model.md §F.
 *
 * All step exports remain available from src/api/agentWiring.js for rollback.
 */

import {
  CBT_THERAPIST_WIRING_HYBRID,
  AI_COMPANION_WIRING_HYBRID,
} from './agentWiring.js';

import {
  isUpgradeEnabled,
  logUpgradeEvent,
  registerUpgradeAnalyticsTracker,
} from '../lib/featureFlags.js';

// ─── Phase 0.1 — Analytics registration ─────────────────────────────────────
//
// Register base44.analytics.track as the upgrade observability tracker when
// the module is loaded in a browser context.  The dynamic import is wrapped in
// a try-catch so that test environments (which lack the @/lib/app-params alias)
// fail silently and fall back to the console-only logging already present in
// logUpgradeEvent.
//
// Logging failure must never affect routing — this is fire-and-forget.

(async () => {
  try {
    const { base44 } = await import('./base44Client.js');
    registerUpgradeAnalyticsTracker((eventName, properties) => {
      base44.analytics.track({ eventName, properties });
    });
  } catch (_ignored) {
    // Analytics unavailable (e.g. test environment) — console fallback remains.
  }
})();

// ─── Phase 0.1 — Real routing integration point ──────────────────────────────

/**
 * Resolves the active CBT Therapist wiring by evaluating the upgrade feature flag.
 *
 * This is the real routing/wiring decision point introduced in Phase 0.1.
 * It is called at module initialisation so the flag is evaluated as part of
 * the normal app load sequence — not only in tests.
 *
 * At Phase 0.1 the function always returns CBT_THERAPIST_WIRING_HYBRID:
 *   - Flag off  → current path (identical to Phase 0)
 *   - Flag on   → current path (no upgraded wiring exists yet)
 *
 * Future phases will add the upgraded wiring branch inside the flag-on block.
 * The hook is safe to attach to without touching any other file.
 *
 * @returns {object} The active CBT Therapist wiring configuration
 */
export function resolveTherapistWiring() {
  if (isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')) {
    // Flag is on — no upgraded path exists yet; fall through to current default.
    // Future phases will introduce the upgraded wiring here.
    logUpgradeEvent('route_selected', {
      flag: 'THERAPIST_UPGRADE_ENABLED',
      path: 'current_default_fallback',
      phase: '0.1',
    });
    return CBT_THERAPIST_WIRING_HYBRID;
  }

  logUpgradeEvent('route_not_selected', {
    flag: 'THERAPIST_UPGRADE_ENABLED',
    phase: '0.1',
  });
  return CBT_THERAPIST_WIRING_HYBRID;
}

// ─── Exported wiring constants ───────────────────────────────────────────────
//
// ACTIVE_CBT_THERAPIST_WIRING is now computed via resolveTherapistWiring() so
// that the flag is evaluated at a real wiring decision point on every cold
// module load.  The resulting value is still CBT_THERAPIST_WIRING_HYBRID while
// all flags are false — existing behaviour is preserved exactly.

/**
 * Active wiring for the CBT Therapist agent.
 * Resolved via resolveTherapistWiring() — evaluates the upgrade flag at load time.
 */
export const ACTIVE_CBT_THERAPIST_WIRING = resolveTherapistWiring();

/**
 * Active wiring for the AI Companion agent.
 * Currently wired to the hybrid configuration (V1 + caution layer).
 */
export const ACTIVE_AI_COMPANION_WIRING = AI_COMPANION_WIRING_HYBRID;

/**
 * Map of all active agent wirings, keyed by agent name.
 * Useful for runtime lookup by agent name string.
 */
export const ACTIVE_AGENT_WIRINGS = {
  cbt_therapist: ACTIVE_CBT_THERAPIST_WIRING,
  ai_companion:  ACTIVE_AI_COMPANION_WIRING,
};

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
 * Phase 1 — CBT_THERAPIST_WIRING_STAGE2_V1 added as the memory-enabled path.
 * Phase 3 — CBT_THERAPIST_WIRING_STAGE2_V2 added as the workflow-engine path.
 *   V2 supersedes V1 when both flags are on (V2 is a superset of V1).
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
  CBT_THERAPIST_WIRING_STAGE2_V1,
  CBT_THERAPIST_WIRING_STAGE2_V2,
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
 * Routing logic (evaluated in order):
 *   1. Master gate off  → CBT_THERAPIST_WIRING_HYBRID (current default)
 *   2. Master gate on, THERAPIST_UPGRADE_WORKFLOW_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V2 (Phase 3 workflow engine)
 *   3. Master gate on, THERAPIST_UPGRADE_MEMORY_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V1 (Phase 1 memory layer)
 *   4. Master gate on, no matching phase flag
 *                       → CBT_THERAPIST_WIRING_HYBRID (fall-through to current default)
 *
 * Phase 3 (V2) takes precedence over Phase 1 (V1) when both flags are on
 * because V2 is a superset of V1 — it includes the memory layer and adds
 * the workflow engine on top.
 *
 * All flags default to false, so the current default path is always returned
 * in production until the flags are explicitly enabled.
 *
 * @returns {object} The active CBT Therapist wiring configuration
 */
export function resolveTherapistWiring() {
  if (isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')) {
    // ── Phase 3 — Workflow engine (supersedes Phase 1 when both flags are on) ──
    if (isUpgradeEnabled('THERAPIST_UPGRADE_WORKFLOW_ENABLED')) {
      logUpgradeEvent('route_selected', {
        flag: 'THERAPIST_UPGRADE_WORKFLOW_ENABLED',
        path: 'stage2_v2',
        phase: '3',
      });
      return CBT_THERAPIST_WIRING_STAGE2_V2;
    }

    // ── Phase 1 — Structured memory layer ──────────────────────────────────
    if (isUpgradeEnabled('THERAPIST_UPGRADE_MEMORY_ENABLED')) {
      logUpgradeEvent('route_selected', {
        flag: 'THERAPIST_UPGRADE_MEMORY_ENABLED',
        path: 'stage2_v1',
        phase: '1',
      });
      return CBT_THERAPIST_WIRING_STAGE2_V1;
    }

    // ── Master gate on, no phase flag matched — fall through to current default ──
    logUpgradeEvent('route_not_selected', {
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

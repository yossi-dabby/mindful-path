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
 * Phase 5 — CBT_THERAPIST_WIRING_STAGE2_V3 added as the retrieval-orchestration path.
 *   V3 supersedes V2 when both flags are on (V3 is a superset of V2).
 * Phase 6 — CBT_THERAPIST_WIRING_STAGE2_V4 added as the live-retrieval path.
 *   V4 supersedes V3 when both flags are on (V4 is a superset of V3).
 * Phase 7 — CBT_THERAPIST_WIRING_STAGE2_V5 added as the safety-mode path.
 *   V5 supersedes V4 when both flags are on (V5 is a superset of V4).
 * Phase 1 Quality — CBT_THERAPIST_WIRING_STAGE2_V6 added as the formulation-context path.
 *   V6 supersedes V5 when both flags are on (V6 is a superset of V5).
 * Phase 3 Deep Personalization — CBT_THERAPIST_WIRING_STAGE2_V7 added as the continuity path.
 *   V7 supersedes V6 when both flags are on (V7 is a superset of V6).
 * Wave 2B — CBT_THERAPIST_WIRING_STAGE2_V8 added as the strategy layer path.
 *   V8 supersedes V7 when both flags are on (V8 is a superset of V7).
 * Wave 3C — CBT_THERAPIST_WIRING_STAGE2_V9 added as the LTS injection path.
 *   V9 supersedes V8 when STRATEGY_ENABLED + LONGITUDINAL_ENABLED are both on.
 *   V9 is a strict superset of V8.
 * Wave 4C — CBT_THERAPIST_WIRING_STAGE2_V10 added as the CBT knowledge retrieval path.
 *   V10 supersedes V9 when STRATEGY_ENABLED + LONGITUDINAL_ENABLED + KNOWLEDGE_ENABLED
 *   are all on.  V10 is a strict superset of V9.
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
  CBT_THERAPIST_WIRING_STAGE2_V3,
  CBT_THERAPIST_WIRING_STAGE2_V4,
  CBT_THERAPIST_WIRING_STAGE2_V5,
  CBT_THERAPIST_WIRING_STAGE2_V6,
  CBT_THERAPIST_WIRING_STAGE2_V7,
  CBT_THERAPIST_WIRING_STAGE2_V8,
  CBT_THERAPIST_WIRING_STAGE2_V9,
  CBT_THERAPIST_WIRING_STAGE2_V10,
  AI_COMPANION_WIRING_UPGRADE_V1,
  AI_COMPANION_WIRING_UPGRADE_V2,
} from './agentWiring.js';

import {
  isUpgradeEnabled,
  logUpgradeEvent,
  registerUpgradeAnalyticsTracker,
  isCompanionUpgradeEnabled,
  logCompanionUpgradeEvent,
  registerCompanionUpgradeAnalyticsTracker,
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
    const trackFn = (eventName, properties) => {
      base44.analytics.track({ eventName, properties });
    };
    registerUpgradeAnalyticsTracker(trackFn);
    registerCompanionUpgradeAnalyticsTracker(trackFn);
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
 *   2. Master gate on, THERAPIST_UPGRADE_STRATEGY_ENABLED on,
 *      THERAPIST_UPGRADE_LONGITUDINAL_ENABLED on,
 *      THERAPIST_UPGRADE_KNOWLEDGE_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V10 (Wave 4C CBT knowledge retrieval)
 *   3. Master gate on, THERAPIST_UPGRADE_STRATEGY_ENABLED on,
 *      THERAPIST_UPGRADE_LONGITUDINAL_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V9 (Wave 3C LTS injection)
 *   4. Master gate on, THERAPIST_UPGRADE_STRATEGY_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V8 (Wave 2B strategy layer)
 *   4. Master gate on, THERAPIST_UPGRADE_CONTINUITY_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V7 (Phase 3 continuity)
 *   5. Master gate on, THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V6 (Phase 1 Quality formulation context)
 *   6. Master gate on, THERAPIST_UPGRADE_SAFETY_MODE_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V5 (Phase 7 safety mode)
 *   7. Master gate on, THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V4 (Phase 6 live retrieval)
 *   8. Master gate on, THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V3 (Phase 5 retrieval orchestration)
 *   9. Master gate on, THERAPIST_UPGRADE_WORKFLOW_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V2 (Phase 3 workflow engine)
 *  10. Master gate on, THERAPIST_UPGRADE_MEMORY_ENABLED on
 *                       → CBT_THERAPIST_WIRING_STAGE2_V1 (Phase 1 memory layer)
 *  11. Master gate on, no matching phase flag
 *                       → CBT_THERAPIST_WIRING_HYBRID (fall-through to current default)
 *
 * Wave 4C (V10) takes precedence over Wave 3C (V9) and all prior phases because
 * V10 is a strict superset of V9.  V10 requires STRATEGY_ENABLED +
 * LONGITUDINAL_ENABLED + KNOWLEDGE_ENABLED.
 *
 * Wave 3C (V9) takes precedence over Wave 2B (V8) and all prior phases because
 * V9 is a strict superset of V8.  V9 requires both STRATEGY_ENABLED and
 * LONGITUDINAL_ENABLED.
 *
 * Wave 2B (V8) takes precedence over Phase 3 Deep Personalization (V7) and all
 * prior phases because V8 is a strict superset of V7.
 *
 * Phase 3 Deep Personalization (V7) takes precedence over Phase 1 Quality (V6)
 * and all prior phases because V7 is a strict superset of V6.
 *
 * Phase 1 Quality (V6) takes precedence over Phase 7 (V5) and all prior phases
 * when the formulation context flag is on because V6 is a strict superset of V5.
 *
 * Phase 7 (V5) takes precedence over Phase 6 (V4) and all prior phases when
 * the safety mode flag is on because V5 is a superset of V4, which is a
 * superset of V3, which is a superset of V2, which is a superset of V1.
 *
 * Phase 6 (V4) takes precedence over Phase 5 (V3) and all prior phases when
 * the allowlist wrapper flag is on because V4 is a superset of V3, which is
 * a superset of V2, which is a superset of V1.
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
    // ── Wave 4C — CBT knowledge retrieval (supersedes Wave 3C LTS and earlier) ──
    if (
      isUpgradeEnabled('THERAPIST_UPGRADE_STRATEGY_ENABLED') &&
      isUpgradeEnabled('THERAPIST_UPGRADE_LONGITUDINAL_ENABLED') &&
      isUpgradeEnabled('THERAPIST_UPGRADE_KNOWLEDGE_ENABLED')
    ) {
      logUpgradeEvent('route_selected', {
        flag: 'THERAPIST_UPGRADE_KNOWLEDGE_ENABLED',
        path: 'stage2_v10',
        phase: 'wave4c_knowledge_retrieval',
      });
      return CBT_THERAPIST_WIRING_STAGE2_V10;
    }

    // ── Wave 3C — LTS injection (supersedes Wave 2B strategy layer and earlier) ──
    if (
      isUpgradeEnabled('THERAPIST_UPGRADE_STRATEGY_ENABLED') &&
      isUpgradeEnabled('THERAPIST_UPGRADE_LONGITUDINAL_ENABLED')
    ) {
      logUpgradeEvent('route_selected', {
        flag: 'THERAPIST_UPGRADE_LONGITUDINAL_ENABLED',
        path: 'stage2_v9',
        phase: 'wave3c_lts',
      });
      return CBT_THERAPIST_WIRING_STAGE2_V9;
    }

    // ── Wave 2B — Strategy layer (supersedes Phase 3 Deep Personalization and earlier) ──
    if (isUpgradeEnabled('THERAPIST_UPGRADE_STRATEGY_ENABLED')) {
      logUpgradeEvent('route_selected', {
        flag: 'THERAPIST_UPGRADE_STRATEGY_ENABLED',
        path: 'stage2_v8',
        phase: 'wave2b_strategy',
      });
      return CBT_THERAPIST_WIRING_STAGE2_V8;
    }

    // ── Phase 3 Deep Personalization — Continuity (supersedes Phase 1 Quality and earlier) ──
    if (isUpgradeEnabled('THERAPIST_UPGRADE_CONTINUITY_ENABLED')) {
      logUpgradeEvent('route_selected', {
        flag: 'THERAPIST_UPGRADE_CONTINUITY_ENABLED',
        path: 'stage2_v7',
        phase: '3_deep_personalization',
      });
      return CBT_THERAPIST_WIRING_STAGE2_V7;
    }

    // ── Phase 1 Quality — Formulation context (supersedes Phase 7 and earlier) ──
    if (isUpgradeEnabled('THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED')) {
      logUpgradeEvent('route_selected', {
        flag: 'THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED',
        path: 'stage2_v6',
        phase: '1_quality',
      });
      return CBT_THERAPIST_WIRING_STAGE2_V6;
    }

    // ── Phase 7 — Safety mode (supersedes Phase 6 and earlier) ───────────
    if (isUpgradeEnabled('THERAPIST_UPGRADE_SAFETY_MODE_ENABLED')) {
      logUpgradeEvent('route_selected', {
        flag: 'THERAPIST_UPGRADE_SAFETY_MODE_ENABLED',
        path: 'stage2_v5',
        phase: '7',
      });
      return CBT_THERAPIST_WIRING_STAGE2_V5;
    }

    // ── Phase 6 — Live retrieval wrapper (supersedes Phase 5 and earlier) ────
    if (isUpgradeEnabled('THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED')) {
      logUpgradeEvent('route_selected', {
        flag: 'THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED',
        path: 'stage2_v4',
        phase: '6',
      });
      return CBT_THERAPIST_WIRING_STAGE2_V4;
    }

    // ── Phase 5 — Retrieval orchestration (supersedes Phase 3 and Phase 1) ──
    if (isUpgradeEnabled('THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED')) {
      logUpgradeEvent('route_selected', {
        flag: 'THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED',
        path: 'stage2_v3',
        phase: '5',
      });
      return CBT_THERAPIST_WIRING_STAGE2_V3;
    }

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
//
// ACTIVE_AI_COMPANION_WIRING is now computed via resolveCompanionWiring().
// The resulting value is still AI_COMPANION_WIRING_HYBRID while all companion
// flags are false — existing behaviour is preserved exactly.

// ─── Phase 2 — AI Companion Upgrade Routing ──────────────────────────────────

/**
 * Resolves the active AI Companion wiring by evaluating the companion upgrade
 * feature flags.
 *
 * This routing is COMPLETELY INDEPENDENT of the therapist upgrade flags.
 * COMPANION_UPGRADE_* flags have no effect on resolveTherapistWiring(), and
 * THERAPIST_UPGRADE_* flags have no effect on resolveCompanionWiring().
 * This explicit separation prevents role ambiguity between the two agents.
 *
 * Routing logic (evaluated in order):
 *   1. Master gate off → AI_COMPANION_WIRING_HYBRID (legacy default)
 *   2. Master gate on, COMPANION_UPGRADE_WARMTH_ENABLED on
 *                      → AI_COMPANION_WIRING_UPGRADE_V1 (Phase 2 warmth layer)
 *   3. Master gate on, no matching phase flag
 *                      → AI_COMPANION_WIRING_HYBRID (fall-through to legacy)
 *
 * All flags default to false, so the legacy default path is always returned
 * in production until the flags are explicitly enabled.
 *
 * Rollback: set COMPANION_UPGRADE_ENABLED to false to instantly revert to
 * AI_COMPANION_WIRING_HYBRID with no other code changes.
 *
 * @returns {object} The active AI Companion wiring configuration
 */
export function resolveCompanionWiring() {
  if (isCompanionUpgradeEnabled('COMPANION_UPGRADE_ENABLED')) {
    // ── Phase 3 — Continuity layer (supersedes Phase 2 warmth layer) ─────
    if (isCompanionUpgradeEnabled('COMPANION_UPGRADE_CONTINUITY_ENABLED')) {
      logCompanionUpgradeEvent('route_selected', {
        flag: 'COMPANION_UPGRADE_CONTINUITY_ENABLED',
        path: 'upgrade_v2',
        phase: '3',
      });
      return AI_COMPANION_WIRING_UPGRADE_V2;
    }

    // ── Phase 2 — Warmth and attuned response layer ───────────────────────
    if (isCompanionUpgradeEnabled('COMPANION_UPGRADE_WARMTH_ENABLED')) {
      logCompanionUpgradeEvent('route_selected', {
        flag: 'COMPANION_UPGRADE_WARMTH_ENABLED',
        path: 'upgrade_v1',
        phase: '2',
      });
      return AI_COMPANION_WIRING_UPGRADE_V1;
    }

    // ── Master gate on, no phase flag matched — fall through to legacy ────
    logCompanionUpgradeEvent('route_not_selected', {
      flag: 'COMPANION_UPGRADE_ENABLED',
      path: 'legacy_fallback',
      phase: '2',
    });
    return AI_COMPANION_WIRING_HYBRID;
  }

  logCompanionUpgradeEvent('route_not_selected', {
    flag: 'COMPANION_UPGRADE_ENABLED',
    phase: '2',
  });
  return AI_COMPANION_WIRING_HYBRID;
}

/**
 * Active wiring for the CBT Therapist agent.
 * Resolved via resolveTherapistWiring() — evaluates the upgrade flag at load time.
 */
export const ACTIVE_CBT_THERAPIST_WIRING = resolveTherapistWiring();

/**
 * Active wiring for the AI Companion agent.
 * Resolved via resolveCompanionWiring() — evaluates the companion upgrade flags
 * at load time.  Falls back to AI_COMPANION_WIRING_HYBRID (legacy) when all
 * companion flags are false — no change to existing runtime behaviour.
 */
export const ACTIVE_AI_COMPANION_WIRING = resolveCompanionWiring();

/**
 * Map of all active agent wirings, keyed by agent name.
 * Useful for runtime lookup by agent name string.
 */
export const ACTIVE_AGENT_WIRINGS = {
  cbt_therapist: ACTIVE_CBT_THERAPIST_WIRING,
  ai_companion:  ACTIVE_AI_COMPANION_WIRING,
};

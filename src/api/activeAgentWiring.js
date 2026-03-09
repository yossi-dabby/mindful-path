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
 * To roll back to V1 (Steps 1–3 only), see docs/ai-agent-hybrid-model.md §F.
 *
 * All step exports remain available from src/api/agentWiring.js for rollback.
 */

import {
  CBT_THERAPIST_WIRING_HYBRID,
  AI_COMPANION_WIRING_HYBRID,
} from './agentWiring.js';

/**
 * Active wiring for the CBT Therapist agent.
 * Currently wired to the hybrid configuration (V1 + caution layer).
 */
export const ACTIVE_CBT_THERAPIST_WIRING = CBT_THERAPIST_WIRING_HYBRID;

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

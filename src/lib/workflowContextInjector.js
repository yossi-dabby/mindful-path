/**
 * @file src/lib/workflowContextInjector.js
 *
 * Therapist Upgrade — Stage 2 Phase 3.1 — Workflow Context Injector
 * (Extended in Phase 5 to also inject retrieval orchestration context)
 *
 * This module closes the Phase 3 review gap: the workflow instructions were
 * defined and wired (therapistWorkflowEngine.js + CBT_THERAPIST_WIRING_STAGE2_V2)
 * but were never read and injected into the actual therapist runtime path.
 *
 * WHAT THIS MODULE DOES
 * ---------------------
 * It provides two small, focused functions used at the session-start moment
 * in Chat.jsx:
 *
 *   getWorkflowContextForWiring(wiring)
 *     Returns the pre-built THERAPIST_WORKFLOW_INSTRUCTIONS string when the
 *     supplied wiring has workflow_context_injection === true (i.e. V2 or V3
 *     is active).  Returns null for all other wirings (default path unchanged).
 *
 *   buildSessionStartContent(wiring)
 *     Returns the full [START_SESSION] content string for the given wiring.
 *     For the default path this is exactly '[START_SESSION]' — unchanged.
 *     For the V2 upgraded path this is '[START_SESSION]' with the workflow
 *     instructions appended as a clearly delimited section, so the agent
 *     receives the workflow structure in its context window from the very
 *     first turn.
 *     For the V3 upgraded path (Phase 5) this is '[START_SESSION]' with
 *     the workflow instructions AND the retrieval orchestration instructions
 *     appended as clearly delimited sections.
 *
 * ISOLATION GUARANTEE
 * -------------------
 * When workflow_context_injection is false (or absent) — which covers all
 * default-path wirings (HYBRID, V1, and any unrecognised config) — this
 * module returns exactly '[START_SESSION]' and has zero side-effects.
 * The current therapist path is not affected in any way.
 *
 * SAFETY COMPATIBILITY
 * --------------------
 * The injected workflow and retrieval instructions are additive context.
 * They do NOT replace, weaken, or bypass the existing safety stack
 * (postLlmSafetyFilter, sanitizeAgentOutput, sanitizeConversation,
 * enhancedCrisisDetector, risk panel flow).  The instruction text itself
 * explicitly defers to the existing safety system when a safety signal is
 * present.
 *
 * WHAT THIS MODULE MUST NOT DO
 * ----------------------------
 * - Alter the default therapist path in any way
 * - Make live API calls or network requests
 * - Add session-write or session-tracking side effects
 * - Override existing crisis handling or risk-panel behavior
 * - Weaken any existing safety filter
 *
 * Source of truth: docs/therapist-upgrade-stage2-plan.md — Phase 3.1 / Phase 5
 */

import { THERAPIST_WORKFLOW_INSTRUCTIONS } from './therapistWorkflowEngine.js';
import { getRetrievalContextForWiring } from './retrievalOrchestrator.js';

/**
 * Returns the workflow context instructions string when the supplied wiring
 * has the workflow_context_injection flag set to true.
 *
 * This is the gating function for Phase 3.1 runtime injection.  It reads
 * the wiring's own flag rather than evaluating the feature-flag registry
 * directly, so that the injection decision is always consistent with the
 * wiring that was already resolved by resolveTherapistWiring().
 *
 * @param {object} wiring - The active therapist wiring config object
 * @returns {string|null} THERAPIST_WORKFLOW_INSTRUCTIONS when the wiring
 *   has workflow_context_injection === true; null otherwise.
 */
export function getWorkflowContextForWiring(wiring) {
  if (wiring && wiring.workflow_context_injection === true) {
    return THERAPIST_WORKFLOW_INSTRUCTIONS;
  }
  return null;
}

/**
 * Builds the session-start message content for the given wiring.
 *
 * Default path (workflow_context_injection absent or false):
 *   Returns exactly '[START_SESSION]' — unchanged from current behavior.
 *
 * Upgraded V2 path (workflow_context_injection === true):
 *   Returns '[START_SESSION]' with the workflow context instructions
 *   appended as a clearly delimited section.  The '[START_SESSION]' token
 *   is preserved at the start so the existing agent-side session-start
 *   handling continues to work exactly as before.  The appended workflow
 *   instructions arrive in the agent's context window on the first turn,
 *   making the upgraded workflow path real and verifiable.
 *
 * Upgraded V3 path (Phase 5 — workflow_context_injection AND
 * retrieval_orchestration_enabled both true):
 *   Returns '[START_SESSION]' with both the workflow context instructions
 *   AND the retrieval orchestration instructions appended as clearly
 *   delimited sections.  The '[START_SESSION]' token and the workflow
 *   section are identical to V2.  The retrieval section is the additive
 *   Phase 5 contribution.
 *
 * @param {object} wiring - The active therapist wiring config object
 * @returns {string} The session-start message content
 */
export function buildSessionStartContent(wiring) {
  let content = '[START_SESSION]';

  const workflowContext = getWorkflowContextForWiring(wiring);
  if (workflowContext) {
    content += '\n\n' + workflowContext;
  }

  const retrievalContext = getRetrievalContextForWiring(wiring);
  if (retrievalContext) {
    content += '\n\n' + retrievalContext;
  }

  return content;
}

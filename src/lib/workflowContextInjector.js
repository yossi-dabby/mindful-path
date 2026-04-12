/**
 * @file src/lib/workflowContextInjector.js
 *
 * Therapist Upgrade — Stage 2 Phase 3.1 — Workflow Context Injector
 * (Extended in Phase 5 to also inject retrieval orchestration context)
 * (Extended in Phase 6 to also inject live retrieval context)
 * (Extended in Phase 7 to also inject safety mode and emergency resources)
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
import { getRetrievalContextForWiring, buildBoundedContextPackage } from './retrievalOrchestrator.js';
import { executeV3BoundedRetrieval } from './v3RetrievalExecutor.js';
import {
  LIVE_RETRIEVAL_POLICY_INSTRUCTIONS,
  buildLiveContextSection,
  LIVE_KNOWLEDGE_SOURCE_TYPE,
} from './liveRetrievalWrapper.js';
import { executeV4BoundedRetrieval } from './v4RetrievalExecutor.js';
import {
  determineSafetyMode,
  getSafetyModeContextForWiring,
  SAFETY_MODE_FAIL_CLOSED_RESULT,
  evaluateRuntimeSafetyMode,
} from './therapistSafetyMode.js';
import { buildEmergencyResourceSection } from './emergencyResourceLayer.js';
import {
  extractMessageSignals,
  scoreDistressTier,
  determineTherapistStrategy,
  buildStrategyContextSection,
} from './therapistStrategyEngine.js';

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

/**
 * Builds the session-start message content for the V3 upgraded path,
 * executing real bounded retrieval against app data and injecting a
 * retrieved context package alongside the orchestration instructions.
 *
 * This is the Phase 5.1 completion of buildSessionStartContent for V3.
 * It replaces the gap where V3 received only retrieval instructions (text)
 * but no actual retrieved data.  After Phase 5.1, V3 receives both:
 *   1. The orchestration instructions (from Phase 5 — unchanged)
 *   2. A real bounded retrieved context package built from app data
 *
 * For all non-V3 wirings (HYBRID, V1, V2, null, undefined):
 *   Returns exactly the same result as buildSessionStartContent(wiring).
 *   No retrieval is executed.  Default path is completely unchanged.
 *
 * For V3 (retrieval_orchestration_enabled === true):
 *   1. Builds the base session-start content (instructions + orchestration
 *      instructions) as before.
 *   2. Executes real bounded retrieval against app entity stores in the
 *      required internal-first order (therapist_memory → session_context →
 *      internal_knowledge → external_knowledge).
 *   3. Builds a bounded context package from the retrieved items using
 *      buildBoundedContextPackage() (same function as Phase 5 tests verify).
 *   4. If the context package is non-empty, appends it to the session-start
 *      content as a clearly delimited section.
 *
 * FAIL-OPEN CONTRACT
 * ------------------
 * If retrieval fails entirely (entities unavailable, network error, etc.),
 * this function returns the base session-start content unchanged — the
 * orchestration instructions remain present, but the retrieved context
 * package is simply absent.  Session start is never blocked.
 *
 * @param {object} wiring   - The active therapist wiring config object
 * @param {object} entities - Base44 entity client map (e.g. base44.entities)
 * @returns {Promise<string>} The session-start message content
 */
export async function buildV3SessionStartContentAsync(wiring, entities) {
  // Build the base content (same as the synchronous version)
  const baseContent = buildSessionStartContent(wiring);

  // Only V3 gets real retrieval execution — all other wirings are unchanged
  if (!wiring || wiring.retrieval_orchestration_enabled !== true) {
    return baseContent;
  }

  // Execute real bounded retrieval against app entity stores
  let retrievalResult;
  try {
    retrievalResult = await executeV3BoundedRetrieval(entities ?? {});
  } catch {
    // Fail-open: retrieval execution failed — return base content without context package
    return baseContent;
  }

  // Build the bounded context package from real retrieved items
  let contextPackage;
  try {
    contextPackage = buildBoundedContextPackage(retrievalResult.items);
  } catch {
    // Fail-open: package assembly failed — return base content
    return baseContent;
  }

  // Inject the real context package only if it contains actual data
  if (!contextPackage || !contextPackage.trim()) {
    return baseContent;
  }

  return (
    baseContent +
    '\n\n=== RETRIEVED CONTEXT ===\n' +
    contextPackage +
    '\n=== END RETRIEVED CONTEXT ==='
  );
}

// ─── Phase 6 — V4 live retrieval context accessor ────────────────────────────

/**
 * Returns the Phase 6 live retrieval policy instructions string when the
 * supplied wiring has live_retrieval_enabled set to true.
 *
 * This is the gating function for Phase 6 runtime injection of the live
 * retrieval policy section.  It reads the wiring's own flag rather than
 * evaluating the feature-flag registry directly, so the injection decision
 * is always consistent with the wiring already resolved by
 * resolveTherapistWiring().
 *
 * For all wirings without live_retrieval_enabled === true (which includes
 * HYBRID, V1, V2, V3, and any unrecognised config), this function returns
 * null — the current therapist path is completely unchanged.
 *
 * @param {object} wiring - The active therapist wiring config object
 * @returns {string|null} LIVE_RETRIEVAL_POLICY_INSTRUCTIONS for V4; null otherwise
 */
export function getLiveRetrievalContextForWiring(wiring) {
  if (wiring && wiring.live_retrieval_enabled === true) {
    return LIVE_RETRIEVAL_POLICY_INSTRUCTIONS;
  }
  return null;
}

/**
 * Builds the session-start message content for the V4 upgraded path,
 * executing real bounded retrieval (sources 1–4 from Phase 5 + conditional
 * live retrieval from Phase 6) and injecting retrieved context alongside
 * the orchestration and live retrieval policy instructions.
 *
 * For all non-V4 wirings (HYBRID, V1, V2, V3, null, undefined):
 *   Delegates to buildV3SessionStartContentAsync(wiring, entities) and
 *   returns exactly the same result.  The default path is completely unchanged.
 *
 * For V4 (live_retrieval_enabled === true):
 *   1. Builds the base session-start content (including Phase 5 instructions)
 *      as V3 would.
 *   2. Appends the Phase 6 live retrieval policy instructions section.
 *   3. Executes V4 bounded retrieval:
 *      (a) V3 sources 1–4 (internal-first)
 *      (b) Live source 5 conditionally (only when internal sources are
 *          insufficient and options.liveRetrievalAllowed is true)
 *   4. Builds and appends the internal context package (sources 1–4).
 *   5. Builds and appends the live context section (source 5, if any).
 *
 * FAIL-OPEN CONTRACT (internal retrieval)
 * ----------------------------------------
 * Same as buildV3SessionStartContentAsync: session start is never blocked
 * by internal retrieval failure.
 *
 * FAIL-CLOSED CONTRACT (live retrieval)
 * ---------------------------------------
 * Live retrieval failure returns no live context — the session continues with
 * internal sources only.  No exception propagates.
 *
 * @param {object} wiring       - The active therapist wiring config object
 * @param {object} entities     - Base44 entity client map (e.g. base44.entities)
 * @param {object|null} baseClient - Full base44 client (for live retrieval via
 *                                   base44.functions.invoke); null disables live retrieval
 * @param {object} [options]    - Options for Phase 6 live retrieval
 * @param {boolean} [options.liveRetrievalAllowed=false] - Whether live retrieval is allowed
 * @param {string}  [options.liveRetrievalUrl]            - URL to query for live retrieval
 * @param {string}  [options.liveRetrievalQuery]          - Optional query context
 * @returns {Promise<string>} The session-start message content
 */
export async function buildV4SessionStartContentAsync(
  wiring,
  entities,
  baseClient,
  options = {},
) {
  // For non-V4 wirings: delegate to V3 (no change to behavior)
  if (!wiring || wiring.live_retrieval_enabled !== true) {
    return buildV3SessionStartContentAsync(wiring, entities);
  }

  // ── V4 path ────────────────────────────────────────────────────────────────

  // Step 1: Build the Phase 5 base content (workflow + retrieval orchestration instructions)
  const phase5Base = buildSessionStartContent(wiring);

  // Step 2: Append the Phase 6 live retrieval policy instructions
  const livePolicy = getLiveRetrievalContextForWiring(wiring);
  const contentWithLivePolicy = livePolicy
    ? phase5Base + '\n\n' + livePolicy
    : phase5Base;

  // Step 3: Execute V4 bounded retrieval (sources 1–4 + conditional source 5)
  let v4Result;
  try {
    v4Result = await executeV4BoundedRetrieval(
      entities ?? {},
      baseClient ?? null,
      {
        liveRetrievalAllowed: options.liveRetrievalAllowed ?? false,
        liveRetrievalUrl: options.liveRetrievalUrl ?? '',
        liveRetrievalQuery: options.liveRetrievalQuery ?? '',
      },
    );
  } catch {
    // Fail-open: V4 retrieval entirely failed — return content without context
    return contentWithLivePolicy;
  }

  // Step 4: Build the internal context package from sources 1–4
  const internalItems = (v4Result.items ?? []).filter(
    (item) => item && item.source_type !== LIVE_KNOWLEDGE_SOURCE_TYPE,
  );

  let internalContextPackage = '';
  try {
    internalContextPackage = buildBoundedContextPackage(internalItems);
  } catch {
    internalContextPackage = '';
  }

  // Step 5: Build the live context section from source 5
  const liveItems = (v4Result.items ?? []).filter(
    (item) => item && item.source_type === LIVE_KNOWLEDGE_SOURCE_TYPE,
  );

  let liveContextSection = '';
  try {
    liveContextSection = buildLiveContextSection(liveItems);
  } catch {
    liveContextSection = '';
  }

  // Assemble the final content
  let result = contentWithLivePolicy;

  if (internalContextPackage && internalContextPackage.trim()) {
    result +=
      '\n\n=== RETRIEVED CONTEXT ===\n' +
      internalContextPackage +
      '\n=== END RETRIEVED CONTEXT ===';
  }

  if (liveContextSection && liveContextSection.trim()) {
    result += '\n\n' + liveContextSection;
  }

  return result;
}

// ─── Phase 7 — V5 safety mode context accessor ───────────────────────────────

/**
 * Builds the session-start message content for the V5 upgraded path,
 * executing real bounded retrieval (same as V4) and additionally evaluating
 * safety mode entry conditions.  When safety mode is active, SAFETY_MODE_INSTRUCTIONS
 * and the emergency resource section are injected into the session context.
 *
 * For all non-V5 wirings (HYBRID, V1, V2, V3, V4, null, undefined):
 *   Delegates to buildV4SessionStartContentAsync(wiring, entities, baseClient,
 *   options) and returns exactly the same result.  The default path is completely
 *   unchanged.
 *
 * For V5 (safety_mode_enabled === true):
 *   1. Builds the V4 base content (workflow + retrieval + live policy + context).
 *   2. Evaluates safety mode entry conditions using determineSafetyMode().
 *   3. If safety mode is active: appends SAFETY_MODE_INSTRUCTIONS.
 *   4. If safety mode is active: appends the emergency resource section for
 *      the resolved locale.
 *
 * FAIL-CLOSED CONTRACT (safety mode)
 * ------------------------------------
 * If safety mode determination throws, this function treats the result as
 * SAFETY_MODE_FAIL_CLOSED_RESULT (safety mode ON) — consistent with the
 * fail-closed contract defined in therapistSafetyMode.js.
 *
 * PRIVACY
 * -------
 * message_text (if provided in options) is passed to determineSafetyMode()
 * for in-memory pattern matching only.  It is never stored or logged.
 *
 * @param {object} wiring       - The active therapist wiring config object
 * @param {object} entities     - Base44 entity client map (e.g. base44.entities)
 * @param {object|null} baseClient - Full base44 client (for live retrieval)
 * @param {object} [options]    - Options for V5 behavior
 * @param {boolean} [options.liveRetrievalAllowed=false]  - Whether live retrieval is allowed
 * @param {string}  [options.liveRetrievalUrl]            - URL for live retrieval
 * @param {string}  [options.liveRetrievalQuery]          - Optional query context
 * @param {boolean} [options.crisis_signal=false]         - Crisis signal from existing stack
 * @param {boolean} [options.low_retrieval_confidence=false] - Low retrieval confidence
 * @param {boolean} [options.allowlist_rejection=false]   - Allowlist rejection from Phase 6
 * @param {boolean} [options.flag_override=false]         - Explicit safety mode override
 * @param {string}  [options.message_text]                - Current user message (for pattern matching)
 * @param {string}  [options.locale]                      - User locale for emergency resources
 * @returns {Promise<string>} The session-start message content
 */
export async function buildV5SessionStartContentAsync(
  wiring,
  entities,
  baseClient,
  options = {},
) {
  // For non-V5 wirings: delegate to V4 (no change to behavior)
  if (!wiring || wiring.safety_mode_enabled !== true) {
    return buildV4SessionStartContentAsync(wiring, entities, baseClient, options);
  }

  // ── V5 path ────────────────────────────────────────────────────────────────

  // Step 1: Build the V4 base content (same as V4 path)
  const v4Base = await buildV4SessionStartContentAsync(
    wiring,
    entities,
    baseClient,
    options,
  );

  // Step 2: Evaluate safety mode entry conditions (fail-closed)
  let safetyResult;
  try {
    safetyResult = determineSafetyMode({
      crisis_signal: options.crisis_signal ?? false,
      low_retrieval_confidence: options.low_retrieval_confidence ?? false,
      allowlist_rejection: options.allowlist_rejection ?? false,
      flag_override: options.flag_override ?? false,
      message_text: options.message_text ?? '',
    });
  } catch {
    // Fail-closed: if determination throws, default to safety mode
    safetyResult = SAFETY_MODE_FAIL_CLOSED_RESULT;
  }

  // Step 3: Inject safety mode instructions if active
  const safetyContext = getSafetyModeContextForWiring(wiring, safetyResult);
  if (!safetyContext) {
    // Safety mode not active — return V4 base content unchanged
    return v4Base;
  }

  let result = v4Base + '\n\n' + safetyContext;

  // Step 4: Inject emergency resources when safety mode is active
  try {
    const resourceSection = buildEmergencyResourceSection(options.locale ?? null);
    if (resourceSection && resourceSection.trim()) {
      result += '\n\n' + resourceSection;
    }
  } catch {
    // Emergency resource injection failure must never block the session
  }

  return result;
}

// ─── Phase 7.1 — Per-turn runtime safety supplement ──────────────────────────

/**
 * Builds the per-turn safety mode supplement for the V5 upgraded path.
 *
 * This function is called once per user turn (not only at session-start)
 * after the existing HARD_STOP crisis detectors (Layer 1 regex and Layer 2 LLM)
 * have passed without triggering.
 *
 * The supplement — when non-null — is prepended to the user message content
 * so that the LLM receives the safety constraints alongside the user's message
 * for this specific turn.
 *
 * ISOLATION GUARANTEE
 * -------------------
 * - Returns null immediately for any wiring without safety_mode_enabled === true.
 * - The default therapist path (HYBRID) is always unaffected.
 * - Returns null when no distress patterns are detected in the message.
 *
 * PRECEDENCE
 * ----------
 * This function is called in Chat.jsx as Layer 3 — AFTER the HARD_STOP
 * layers (Layer 1 regex crisis detector, Layer 2 LLM crisis detector) have
 * passed.  The HARD_STOP layers are authoritative; this layer operates only
 * when they did not block the message.
 *
 * FAIL-SAFE
 * ---------
 * This function never throws.  Returns null on any unexpected error, ensuring
 * the message send is never blocked by the safety supplement computation.
 *
 * @param {object|null|undefined} wiring   - The active therapist wiring config
 * @param {string|null|undefined} messageText - The user's current turn message
 * @param {string|null|undefined} locale    - BCP-47 locale code for resources
 * @returns {string|null} Safety mode supplement to prepend, or null if inactive
 */
export function buildRuntimeSafetySupplement(wiring, messageText, locale) {
  try {
    // Guard: only active for V5 wiring (safety_mode_enabled === true)
    // Returns null for HYBRID, V1, V2, V3, V4, null, undefined, or any
    // wiring without safety_mode_enabled === true.
    if (!wiring || wiring.safety_mode_enabled !== true) {
      return null;
    }

    // Per-turn runtime evaluation: only uses message text (no session signals)
    const safetyResult = evaluateRuntimeSafetyMode(messageText);

    if (!safetyResult || !safetyResult.safety_mode) {
      // No distress pattern detected in this message — no supplement needed
      return null;
    }

    // Safety mode is active for this turn — build the supplement
    const safetyContext = getSafetyModeContextForWiring(wiring, safetyResult);
    if (!safetyContext) {
      return null;
    }

    let supplement = safetyContext;

    // Append emergency resources (locale-specific, pre-stored, non-LLM)
    try {
      const resourceSection = buildEmergencyResourceSection(locale ?? null);
      if (resourceSection && resourceSection.trim()) {
        supplement += '\n\n' + resourceSection;
      }
    } catch {
      // Emergency resource failure must never block the supplement
    }

    return supplement;
  } catch (_e) {
    // Fail-safe: never throw, never block the message send
    return null;
  }
}

// ─── Phase 1 Quality Gains — V6 formulation context injection ─────────────────

/**
 * Maximum characters per CaseFormulation field injected into session context.
 * Kept tight to avoid over-loading the context window with longitudinal data.
 */
const FORMULATION_INJECT_MAX_CHARS = 150;

/**
 * Minimum character length for a CaseFormulation field to be considered useful.
 * Fields shorter than this threshold are treated as placeholder/trivial and
 * are suppressed from the injected context block.
 *
 * Score scale: any field value of 8+ chars is considered to carry clinical signal.
 * Values shorter than this (e.g. "?", "ok", "N/A", "TBD") are noise.
 *
 * @type {number}
 */
export const FORMULATION_MIN_FIELD_LENGTH = 8;

/**
 * Minimum number of usable CaseFormulation fields required before the context
 * block is injected.  A formulation record with fewer than this many fields
 * that pass the FORMULATION_MIN_FIELD_LENGTH threshold is considered too thin
 * to provide useful clinical grounding and is suppressed.
 *
 * A threshold of 2 ensures that at minimum a presenting problem AND one other
 * clinical dimension (core belief, maintaining cycle, or treatment goal) are
 * present before the block is injected.  A single-field block is not clinically
 * coherent enough to justify the context overhead.
 *
 * @type {number}
 */
export const FORMULATION_MIN_USEFUL_FIELDS = 2;

/**
 * Returns the number of CaseFormulation fields that pass the
 * FORMULATION_MIN_FIELD_LENGTH threshold.
 *
 * Only the four fields surfaced in the context block are scored:
 *   presenting_problem, core_belief, maintaining_cycle, treatment_goals
 *
 * Returns 0 for null/invalid input (fail-safe).
 *
 * @param {object|null} cf - A CaseFormulation entity record.
 * @returns {number} Count of usable fields (0–4).
 */
export function scoreFormulationRecord(cf) {
  if (!cf || typeof cf !== 'object') return 0;
  const fields = ['presenting_problem', 'core_belief', 'maintaining_cycle', 'treatment_goals'];
  let score = 0;
  for (const field of fields) {
    if (typeof cf[field] === 'string' && cf[field].trim().length >= FORMULATION_MIN_FIELD_LENGTH) {
      score += 1;
    }
  }
  return score;
}

/**
 * Builds a bounded, read-only CaseFormulation context block for injection into
 * the session-start payload.
 *
 * Reads the two most recent CaseFormulation records (read-only, caution layer),
 * selects the richest one (most usable fields), and extracts:
 * presenting_problem, core_belief, maintaining_cycle, treatment_goals.
 *
 * Fields shorter than FORMULATION_MIN_FIELD_LENGTH chars are suppressed.
 * The block is only injected when at least FORMULATION_MIN_USEFUL_FIELDS fields
 * pass the threshold — a single thin field is not clinically useful enough.
 *
 * FAIL-CLOSED CONTRACT
 * Any error during read returns '' — the session start is never blocked.
 * The injection is additive and supplemental — absence has no safety consequence.
 *
 * @param {object} entities - Base44 entity client map
 * @returns {Promise<string>} Formatted CaseFormulation context block, or ''
 */
async function buildFormulationContextBlock(entities) {
  try {
    if (!entities || typeof entities !== 'object') return '';
    if (!entities.CaseFormulation || typeof entities.CaseFormulation.list !== 'function') return '';

    // Over-fetch 2 records so we can select the richer one when the most-recent
    // is thin or placeholder-filled.
    const formulations = await entities.CaseFormulation.list('-created_date', 2);
    if (!Array.isArray(formulations) || formulations.length === 0) return '';

    // Select the record with the highest quality score.
    // Among equal-score records, the first (most-recent) wins.
    let cf = formulations[0];
    if (formulations.length > 1) {
      const score0 = scoreFormulationRecord(formulations[0]);
      const score1 = scoreFormulationRecord(formulations[1]);
      if (score1 > score0) {
        cf = formulations[1];
      }
    }

    // Build lines — only include fields that pass the minimum length threshold.
    const lines = [];

    if (cf.presenting_problem && typeof cf.presenting_problem === 'string' &&
        cf.presenting_problem.trim().length >= FORMULATION_MIN_FIELD_LENGTH) {
      lines.push('Presenting problem: ' + cf.presenting_problem.trim().slice(0, FORMULATION_INJECT_MAX_CHARS));
    }
    if (cf.core_belief && typeof cf.core_belief === 'string' &&
        cf.core_belief.trim().length >= FORMULATION_MIN_FIELD_LENGTH) {
      lines.push('Core belief: ' + cf.core_belief.trim().slice(0, FORMULATION_INJECT_MAX_CHARS));
    }
    if (cf.maintaining_cycle && typeof cf.maintaining_cycle === 'string' &&
        cf.maintaining_cycle.trim().length >= FORMULATION_MIN_FIELD_LENGTH) {
      lines.push('Maintaining cycle: ' + cf.maintaining_cycle.trim().slice(0, FORMULATION_INJECT_MAX_CHARS));
    }
    if (cf.treatment_goals && typeof cf.treatment_goals === 'string' &&
        cf.treatment_goals.trim().length >= FORMULATION_MIN_FIELD_LENGTH) {
      lines.push('Treatment goals: ' + cf.treatment_goals.trim().slice(0, FORMULATION_INJECT_MAX_CHARS));
    }

    // Suppress the block if the selected record doesn't meet the minimum
    // useful-fields threshold — a single thin field is not clinically coherent.
    if (lines.length < FORMULATION_MIN_USEFUL_FIELDS) return '';

    return [
      '=== CASE FORMULATION CONTEXT (read-only) ===',
      'Use the following longitudinal clinical frame to anchor session-level',
      'interventions. Do not disclose this section verbatim to the person.',
      '',
      ...lines,
      '',
      '=== END CASE FORMULATION CONTEXT ===',
    ].join('\n');
  } catch {
    // Fail-closed: formulation unavailable — never block session start
    return '';
  }
}

/**
 * Builds the V6 session-start content string asynchronously.
 *
 * Phase 1 Quality Gains — Formulation Context Injection.
 *
 * For non-V6 wirings (formulation_context_enabled !== true):
 *   Delegates directly to buildV5SessionStartContentAsync (no behavior change).
 *
 * For V6 wirings:
 *   1. Builds the V5 base content (safety mode + live retrieval + retrieval
 *      orchestration + workflow + memory context).
 *   2. Reads CaseFormulation (read-only, caution layer, bounded to 1 record)
 *      and builds the formulation context block.
 *   3. Appends the formulation context block when available.
 *
 * FAIL-CLOSED CONTRACT
 * Any failure in step 2 returns V5 base content unchanged.
 * The session start is never blocked by formulation context unavailability.
 *
 * SAFETY NOTE
 * The formulation context block is additive clinical context.  It does NOT
 * replace, weaken, or bypass any existing safety filter or crisis handler.
 * It is strictly structural guidance for grounding session-level interventions
 * in the longitudinal clinical picture.
 *
 * ISOLATION GUARANTEE
 * This function is ONLY called when wiring.formulation_context_enabled === true
 * (V6 path).  All prior paths (HYBRID, V1–V5) are completely unaffected.
 *
 * @param {object} wiring - The active therapist wiring configuration
 * @param {object} entities - Base44 entity client map
 * @param {object} baseClient - Base44 SDK client (passed to V5 chain)
 * @param {object} [options] - Optional options forwarded to V5 chain
 * @returns {Promise<string>} The full session-start content string
 */
export async function buildV6SessionStartContentAsync(
  wiring,
  entities,
  baseClient,
  options = {},
) {
  // For non-V6 wirings: delegate to V5 (no change to behavior)
  if (!wiring || wiring.formulation_context_enabled !== true) {
    return buildV5SessionStartContentAsync(wiring, entities, baseClient, options);
  }

  // ── V6 path ────────────────────────────────────────────────────────────────

  // Step 1: Build the V5 base content (safety mode + all prior layers)
  const v5Base = await buildV5SessionStartContentAsync(
    wiring,
    entities,
    baseClient,
    options,
  );

  // Step 2: Inject CaseFormulation context (read-only, fail-closed)
  let formulationBlock = '';
  try {
    formulationBlock = await buildFormulationContextBlock(entities);
  } catch {
    // Fail-closed: formulation injection failure must never block session start
    formulationBlock = '';
  }

  if (!formulationBlock || !formulationBlock.trim()) {
    return v5Base;
  }

  return v5Base + '\n\n' + formulationBlock;
}

// ─── Phase 3 Deep Personalization — V7 cross-session continuity injection ─────

/**
 * Builds the V7 session-start content string asynchronously.
 *
 * Phase 3 Deep Personalization — Cross-Session Continuity Layer.
 *
 * For non-V7 wirings (continuity_layer_enabled !== true):
 *   Delegates directly to buildV6SessionStartContentAsync (no behavior change).
 *
 * For V7 wirings:
 *   1. Builds the V6 base content (formulation context + safety mode + live
 *      retrieval + retrieval orchestration + workflow + memory context).
 *   2. Reads the last N therapist memory records (read-only, fail-closed)
 *      and builds the cross-session continuity block.
 *   3. Appends the continuity block when available.
 *
 * FAIL-CLOSED CONTRACT
 * Any failure in step 2 returns V6 base content unchanged.
 * The session start is never blocked by continuity read failure.
 *
 * SAFETY NOTE
 * The continuity block is additive clinical context.  It does NOT replace,
 * weaken, or bypass any existing safety filter, crisis handler, or
 * formulation context.  It is strictly longitudinal awareness for grounding
 * session-level interactions in prior-session patterns.
 *
 * PRIVACY NOTE
 * Continuity reads from CompanionMemory (private per-user entity).  Only
 * structured summary fields are included — never raw transcripts.
 * The block is injected into the per-user session payload only.
 *
 * ISOLATION GUARANTEE
 * This function is ONLY called when wiring.continuity_layer_enabled === true
 * (V7 path).  All prior paths (HYBRID, V1–V6) are completely unaffected.
 *
 * @param {object} wiring - The active therapist wiring configuration
 * @param {object} entities - Base44 entity client map
 * @param {object} baseClient - Base44 SDK client (passed to V6 chain)
 * @param {object} [options] - Optional options forwarded to V6 chain
 * @returns {Promise<string>} The full session-start content string
 */
export async function buildV7SessionStartContentAsync(
  wiring,
  entities,
  baseClient,
  options = {},
) {
  // For non-V7 wirings: delegate to V6 (no change to behavior)
  if (!wiring || wiring.continuity_layer_enabled !== true) {
    return buildV6SessionStartContentAsync(wiring, entities, baseClient, options);
  }

  // ── V7 path ────────────────────────────────────────────────────────────────

  // Step 1: Build the V6 base content (formulation + safety mode + all prior layers)
  const v6Base = await buildV6SessionStartContentAsync(
    wiring,
    entities,
    baseClient,
    options,
  );

  // Step 2: Build cross-session continuity block (read-only, fail-closed)
  let continuityBlock = '';
  try {
    const { buildCrossSessionContinuityBlock } = await import('./crossSessionContinuity.js');
    continuityBlock = await buildCrossSessionContinuityBlock(entities);
  } catch {
    // Fail-closed: continuity injection failure must never block session start
    continuityBlock = '';
  }

  if (!continuityBlock || !continuityBlock.trim()) {
    return v6Base;
  }

  return v6Base + '\n\n' + continuityBlock;
}

// ─── Wave 2B — V8 therapeutic strategy layer ─────────────────────────────────

/**
 * Reads the single best CaseFormulation record from the entity store.
 *
 * Private helper for buildV8SessionStartContentAsync.  Uses the same bounded
 * over-fetch-and-select logic as buildFormulationContextBlock (V6) but returns
 * the raw entity object rather than a formatted string.  The returned object
 * is passed to determineTherapistStrategy() as formulationData.
 *
 * FAIL-CLOSED: returns null on any error.
 *
 * @private
 * @param {object} entities - Base44 entity client map
 * @returns {Promise<object|null>} The best CaseFormulation record, or null
 */
async function readBestFormulationRecord(entities) {
  try {
    if (!entities || typeof entities !== 'object') return null;
    if (!entities.CaseFormulation || typeof entities.CaseFormulation.list !== 'function') return null;

    const formulations = await entities.CaseFormulation.list('-created_date', 2);
    if (!Array.isArray(formulations) || formulations.length === 0) return null;

    if (formulations.length === 1) return formulations[0];

    // Select the richer record using the same scoring logic as buildFormulationContextBlock
    return scoreFormulationRecord(formulations[1]) > scoreFormulationRecord(formulations[0])
      ? formulations[1]
      : formulations[0];
  } catch {
    return null;
  }
}

/**
 * Builds the V8 session-start content string asynchronously.
 *
 * Wave 2B — Therapeutic Strategy Layer.
 *
 * For non-V8 wirings (strategy_layer_enabled !== true):
 *   Delegates directly to buildV7SessionStartContentAsync (no behavior change).
 *
 * For V8 wirings:
 *   1. Builds the V7 base content (continuity + formulation + safety mode +
 *      live retrieval + retrieval orchestration + workflow + memory context).
 *   2. Reads the best CaseFormulation record (read-only, fail-closed).
 *   3. Reads cross-session continuity data (read-only, fail-closed).
 *   4. Evaluates safety mode from options (same inputs as V5).
 *   5. Extracts message signals from options.message_text.
 *   6. Scores the distress tier.
 *   7. Determines the therapeutic strategy.
 *   8. Builds the strategy guidance section and appends it.
 *
 * FAIL-OPEN CONTRACT
 * ------------------
 * Any error during strategy computation (steps 2–8) returns the V7 base
 * content unchanged.  Session start is never blocked.  The V7 behavior is
 * EXACTLY preserved on any failure.
 *
 * PRIVACY
 * -------
 * - Only structured summary fields and field presence flags are passed to
 *   the strategy engine — never raw transcript content.
 * - message_text (if provided in options) is passed to extractMessageSignals()
 *   for in-memory pattern matching only.  It is never stored or logged.
 *
 * SAFETY NOTE
 * -----------
 * The strategy guidance section is additive context labeled as guidance.
 * It does NOT replace, weaken, or bypass any existing safety filter or
 * crisis handler.  When safety mode is active (CONTAINMENT mode), the
 * guidance section explicitly reinforces the safety-first constraint.
 *
 * ISOLATION GUARANTEE
 * -------------------
 * This function is ONLY called when wiring.strategy_layer_enabled === true
 * (V8 path).  All prior paths (HYBRID, V1–V7) are completely unaffected.
 *
 * @param {object} wiring - The active therapist wiring configuration
 * @param {object} entities - Base44 entity client map
 * @param {object} baseClient - Base44 SDK client (passed to V7 chain)
 * @param {object} [options] - Optional options forwarded to V7 chain
 * @param {boolean} [options.crisis_signal=false]           - Crisis signal
 * @param {boolean} [options.low_retrieval_confidence=false] - Low retrieval confidence
 * @param {boolean} [options.allowlist_rejection=false]      - Allowlist rejection
 * @param {boolean} [options.flag_override=false]            - Safety mode override
 * @param {string}  [options.message_text]                   - Current user message
 * @param {string}  [options.locale]                         - User locale
 * @returns {Promise<string>} The full session-start content string
 */
export async function buildV8SessionStartContentAsync(
  wiring,
  entities,
  baseClient,
  options = {},
) {
  // For non-V8 wirings: delegate to V7 (no change to behavior)
  if (!wiring || wiring.strategy_layer_enabled !== true) {
    return buildV7SessionStartContentAsync(wiring, entities, baseClient, options);
  }

  // ── V8 path ────────────────────────────────────────────────────────────────

  // Step 1: Build the V7 base content (all prior layers)
  const v7Base = await buildV7SessionStartContentAsync(
    wiring,
    entities,
    baseClient,
    options,
  );

  // Steps 2–8: Compute the strategy section (fail-open: any error returns v7Base)
  try {
    // Step 2: Read the best CaseFormulation record (read-only, bounded)
    const formulationRecord = await readBestFormulationRecord(entities);

    // Step 3: Read cross-session continuity data (read-only, bounded)
    let continuityData = null;
    try {
      const { readCrossSessionContinuity } = await import('./crossSessionContinuity.js');
      continuityData = await readCrossSessionContinuity(entities);
    } catch {
      continuityData = null;
    }

    // Step 4: Evaluate safety mode (same inputs as V5 — fail-closed to safety on error)
    let safetyResult;
    try {
      safetyResult = determineSafetyMode({
        crisis_signal: options.crisis_signal ?? false,
        low_retrieval_confidence: options.low_retrieval_confidence ?? false,
        allowlist_rejection: options.allowlist_rejection ?? false,
        flag_override: options.flag_override ?? false,
        message_text: options.message_text ?? '',
      });
    } catch {
      safetyResult = SAFETY_MODE_FAIL_CLOSED_RESULT;
    }

    // Step 5: Extract message-level signals from current turn text
    const messageSignals = extractMessageSignals(options.message_text ?? '');

    // Step 6: Score distress tier
    const distressTier = scoreDistressTier(safetyResult, messageSignals);

    // Step 7: Determine therapeutic strategy
    const strategyState = determineTherapistStrategy(
      continuityData,
      formulationRecord,
      distressTier,
      messageSignals,
    );

    // Step 8: Build strategy context section
    const strategySection = buildStrategyContextSection(strategyState);
    if (!strategySection || !strategySection.trim()) {
      return v7Base;
    }

    return v7Base + '\n\n' + strategySection;
  } catch {
    // Fail-open: strategy computation failed — return V7 base content unchanged
    return v7Base;
  }
}

// ─── AI Companion Upgrade V2 — Companion session-start context ───────────────

/**
 * Builds the session-start message content for the AI Companion V2 upgraded path.
 *
 * For non-V2 wirings (continuity_enabled absent or false):
 *   Returns '[START_SESSION]' unchanged — identical to the default companion path.
 *
 * For V2 (continuity_enabled === true):
 *   1. Reads native CompanionMemory records via buildCompanionContinuityBlock.
 *   2. Scores/filters records for warmth/richness — thin/generic memories are
 *      suppressed; only personally meaningful records are injected.
 *   3. Returns '[START_SESSION]' with the warm context block appended.
 *   4. If the block is empty (no useful memories), returns '[START_SESSION]'
 *      unchanged — the fallback is always a clean warm session start.
 *
 * ROLE BOUNDARY
 * -------------
 * This function is the companion equivalent of buildV7SessionStartContentAsync.
 * It is completely independent of the therapist upgrade chain:
 *   - Never reads CaseFormulation or ThoughtJournal (prohibited for Companion).
 *   - Uses buildCompanionContinuityBlock, not buildCrossSessionContinuityBlock.
 *   - Therapist UPGRADE_* flags have no effect here.
 *
 * FAIL-CLOSED: never throws; never blocks session start.
 *
 * @param {object} wiring   - The active AI Companion wiring config object
 * @param {object} entities - Base44 entity client map
 * @returns {Promise<string>} Session-start content string
 */
async function buildCompanionSessionStartContextAsync(wiring, entities) {
  if (!wiring || wiring.continuity_enabled !== true) {
    return '[START_SESSION]';
  }

  let continuityBlock = '';
  try {
    const { buildCompanionContinuityBlock } = await import('./companionContinuity.js');
    continuityBlock = await buildCompanionContinuityBlock(entities);
  } catch {
    // Fail-closed: continuity injection failure must never block session start
    continuityBlock = '';
  }

  if (!continuityBlock || !continuityBlock.trim()) {
    return '[START_SESSION]';
  }

  return '[START_SESSION]\n\n' + continuityBlock;
}


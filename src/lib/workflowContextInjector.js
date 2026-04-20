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

import { THERAPIST_WORKFLOW_INSTRUCTIONS, THERAPIST_FORMULATION_INSTRUCTIONS, THERAPIST_PLANNER_FIRST_INSTRUCTIONS, PRECEDENCE_LEVELS, evaluatePlannerPrecedence, isLegacyGateBlocked, LEGACY_GATE_OVERRIDES } from './therapistWorkflowEngine.js';
import {
  isLTSRecord,
  LTS_MEMORY_TYPE,
  LTS_MIN_SESSIONS_FOR_SIGNALS,
  LTS_TRAJECTORIES,
} from './therapistMemoryModel.js';
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
  extractLTSStrategyInputs,
  buildStrategyContextSection,
  buildStrategyDiagnosticSnapshot,
  buildLTSDiagnosticSnapshot,
} from './therapistStrategyEngine.js';
// Wave 5D — Quality Evaluator diagnostic integration (diagnostics-only, no runtime effect).
import { computeEvaluatorDiagnosticSnapshot } from './therapistQualityEvaluator.js';

const THERAPIST_ATTACHMENT_CONTEXT_INSTRUCTIONS = [
'[ATTACHMENT_HANDLING_POLICY]',
'When the current user turn includes attachment metadata, read the attachment context block and use its URL as source material for this turn.',
'Attachment metadata key: metadata.attachment',
'Extract and use: metadata.attachment.url',
'If metadata.attachment.type is "image", briefly acknowledge it and answer the user\'s image question directly; describe only what is visibly grounded in the image URL and do not invent unseen details.',
'If metadata.attachment.type is "pdf", briefly acknowledge it and answer the user\'s document question directly with a short main-chat summary; do not dump raw extraction text.',
'If image/PDF understanding is partial, unclear, or low-confidence, state that clearly and avoid certainty.',
'Keep attachment replies concise, conversational, and non-technical; ask at most one short follow-up only when it helps the next step.',
'Reference document details only when grounded in the provided attachment URL; do not invent unseen content.']
.join('\n');

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
 * Returns the formulation-led instruction block for the given wiring, or null.
 *
 * Phase 10 — Formulation-Led CBT.
 *
 * Returns THERAPIST_FORMULATION_INSTRUCTIONS when the wiring has
 * formulation_led_enabled === true (V6+).  Returns null for all other wirings,
 * including null/undefined input.
 *
 * @param {object|null|undefined} wiring - The active therapist wiring configuration
 * @returns {string|null} THERAPIST_FORMULATION_INSTRUCTIONS or null
 */
export function getFormulationLedContextForWiring(wiring) {
  if (!wiring || wiring.formulation_led_enabled !== true) {
    return null;
  }
  return THERAPIST_FORMULATION_INSTRUCTIONS;
}

// ─── Planner Precedence Enforcement ──────────────────────────────────────────
//
// These functions wire the evaluatePlannerPrecedence / isLegacyGateBlocked
// utilities (defined in therapistWorkflowEngine.js) into the live strategy
// decision paths (V8 and V10).  They are the "runtime enforcement pass" that
// ensures legacy shortcuts are actually blocked — not merely documented.
//
// HOW IT WORKS
// ─────────────────────────────────────────────────────────────────────────────
// 1. buildPlannerContext() constructs the context object needed by the
//    precedence evaluator from the data already available at call sites.
// 2. applyStrategyPrecedenceGuard() takes the raw strategy state produced by
//    determineTherapistStrategy() and overrides the intervention_mode to
//    STABILISATION whenever any action-enabling legacy gate is blocked.
//    It is the SINGLE enforcement gate in the runtime planner.
// 3. buildPrecedenceEnforcementBlock() produces a human-readable text block
//    that is appended to the session-start context when enforcement fires,
//    making the LLM explicitly aware of which gates are blocked.
//
// FAIL-OPEN CONTRACT
// ─────────────────────────────────────────────────────────────────────────────
// Both buildPlannerContext() and applyStrategyPrecedenceGuard() never throw.
// On any error, they return safe defaults that preserve prior behavior.
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Action-capable strategy modes that legacy shortcuts can exploit.
 * Only these modes need precedence enforcement; safe modes are left unchanged.
 *
 * @private
 */
const _ACTION_CAPABLE_MODES = Object.freeze(
  new Set(['structured_exploration', 'formulation_deepening'])
);

/**
 * Legacy gates that, when blocked, require mode override to STABILISATION.
 * These gates now include INTERVENTION_READINESS (level 5) protection, so
 * sessions that are not ready for action cannot remain in action-capable modes.
 *
 * @private
 */
const _ACTION_BLOCKING_GATES = Object.freeze([
  'skip_clarification',
  'social_anxiety_direct_action',
  'domain_to_intervention_template',
  'micro_step_defaulting',
]);

/**
 * Maximum active precedence level that triggers a strategy mode override to
 * STABILISATION.  Levels 1-5 cover SAFETY, FORMULATION_FIRST,
 * PACING_SENSITIVITY, FIRST_DISCLOSURE, and INTERVENTION_READINESS.
 * This keeps non-ready sessions in formulation hold rather than action-capable
 * modes.
 *
 * @private
 */
const _MODE_OVERRIDE_PRECEDENCE_THRESHOLD = PRECEDENCE_LEVELS.INTERVENTION_READINESS; // level 5

/**
 * Builds the planner context object required by evaluatePlannerPrecedence()
 * from the inputs already available at the V8 and V10 call sites.
 *
 * All fields are optional — missing fields bias toward higher-priority
 * precedence levels (fail-closed: unknown state → extra caution).
 *
 * SAFETY: Never throws.  Returns a minimal safe context on any error.
 *
 * @param {object|null} formulationRecord - Best CaseFormulation record, or null
 * @param {object|null} safetyResult      - Output of determineSafetyMode(), or null
 * @param {string|null} distressTier      - One of DISTRESS_TIERS values, or null
 * @param {object}      [sessionOptions]  - Options bag from the session call site
 *   Optional fields:
 *     case_type            {string}  - One of THERAPIST_CASE_TYPE_POSTURES ids
 *     is_first_disclosure  {boolean} - Person is making a first disclosure
 *     has_been_understood  {boolean} - Person has felt genuinely understood
 *     intervention_ready   {boolean} - All intervention readiness gates passed
 * @returns {object} Planner context for evaluatePlannerPrecedence()
 */
export function buildPlannerContext(formulationRecord, safetyResult, distressTier, sessionOptions) {
  try {
    const opts = sessionOptions && typeof sessionOptions === 'object' ? sessionOptions : {};
    const formulationInPlace = scoreFormulationRecord(formulationRecord) >= FORMULATION_MIN_USEFUL_FIELDS;
    // has_been_understood: when explicitly provided in options, use that value.
    // Otherwise: if formulation is in place (from prior sessions), infer that
    // understanding was established in the prior session where the formulation was built.
    // At session start, prior formulation implies prior understanding.
    // This prevents FORMULATION_FIRST level from over-blocking session-start contexts
    // where formulation legitimately exists from prior sessions.
    const hasBeenUnderstood =
      typeof opts.has_been_understood === 'boolean'
        ? opts.has_been_understood
        : formulationInPlace;
    return {
      safety_mode_active: safetyResult?.safety_mode_active === true,
      distress_tier: typeof distressTier === 'string' && distressTier ? distressTier : 'tier_low',
      // Formulation is "in place" only when the record has enough usable content.
      formulation_in_place: formulationInPlace,
      has_been_understood: hasBeenUnderstood,
      case_type: typeof opts.case_type === 'string' ? opts.case_type.trim().toLowerCase() : '',
      is_first_disclosure: opts.is_first_disclosure === true,
      intervention_ready: opts.intervention_ready === true,
    };
  } catch (_e) {
    // Fail-closed: unknown state → highest caution (formulation not in place)
    return {
      safety_mode_active: false,
      distress_tier: 'tier_low',
      formulation_in_place: false,
      has_been_understood: false,
      case_type: '',
      is_first_disclosure: false,
      intervention_ready: false,
    };
  }
}

/**
 * Applies the planner precedence hierarchy to a raw strategy state.
 *
 * This is the single runtime enforcement gate.  It is called AFTER
 * determineTherapistStrategy() in the V8 and V10 session-start paths.
 *
 * WHAT IT DOES
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Evaluates the active precedence level for the current session context.
 * 2. Checks each of the four action-enabling legacy gates via isLegacyGateBlocked().
 * 3. If any blocked gate would allow a legacy shortcut to fire AND the current
 *    intervention_mode is action-capable (structured_exploration / formulation_deepening),
 *    overrides the mode to stabilisation — the safest non-containment mode.
 * 4. Returns an augmented strategy state that includes enforcement metadata
 *    (precedence_enforced, active_precedence_level, blocked_gates, etc.).
 *
 * MODES AFFECTED
 * ─────────────────────────────────────────────────────────────────────────────
 * Only structured_exploration and formulation_deepening are overridden.
 * containment, stabilisation, and psychoeducation are already safe and are
 * NEVER modified by this function.
 *
 * PROTECTED CASE TYPES (trigger PACING_SENSITIVITY level 3)
 * ─────────────────────────────────────────────────────────────────────────────
 * teen_shame, grief_loss, trauma, scrupulosity, ocd_checking, ocd, adhd_overwhelm,
 * nothing_helps, social_anxiety → social_anxiety_direct_action and
 * domain_to_intervention_template gates are both blocked at level 3; mode
 * override to stabilisation fires.
 *
 * UNREADY SESSIONS (trigger FORMULATION_FIRST level 2)
 * ─────────────────────────────────────────────────────────────────────────────
 * When formulation_in_place is false or has_been_understood is false →
 * skip_clarification gate is blocked; mode override to stabilisation fires.
 *
 * FAIL-OPEN CONTRACT
 * ─────────────────────────────────────────────────────────────────────────────
 * Never throws.  On any error, returns the original strategy state unchanged
 * so the session is never blocked.
 *
 * @param {object|null} strategyState  - Output of determineTherapistStrategy()
 * @param {object|null} plannerContext - Output of buildPlannerContext()
 * @returns {object} Augmented strategy state with enforcement metadata
 */
export function applyStrategyPrecedenceGuard(strategyState, plannerContext) {
  try {
    const ss = strategyState && typeof strategyState === 'object' ? strategyState : {};
    const currentMode = typeof ss.intervention_mode === 'string' ? ss.intervention_mode : 'stabilisation';

    // Evaluate active precedence level
    const precedence = evaluatePlannerPrecedence(plannerContext);

    // Check all action-blocking gates
    const blockedGates = _ACTION_BLOCKING_GATES.filter(
      (gate) => isLegacyGateBlocked(gate, plannerContext)
    );

    const hasBlockedGates = blockedGates.length > 0;
    const modeIsActionCapable = _ACTION_CAPABLE_MODES.has(currentMode);

    // Mode override fires when active precedence level is <= threshold (levels 1-5:
    // SAFETY, FORMULATION_FIRST, PACING_SENSITIVITY, FIRST_DISCLOSURE,
    // INTERVENTION_READINESS).  This ensures "not ready yet" sessions cannot stay
    // in an action-capable mode while readiness gates are unmet.
    const shouldEnforceMode =
      hasBlockedGates &&
      precedence.level <= _MODE_OVERRIDE_PRECEDENCE_THRESHOLD &&
      modeIsActionCapable;
    const enforcedMode = shouldEnforceMode ? 'stabilisation' : currentMode;
    // precedence_enforced is true when ANY gate is blocked (for enforcement block text)
    const precedenceEnforced = hasBlockedGates;

    return Object.assign({}, ss, {
      intervention_mode: enforcedMode,
      precedence_enforced: precedenceEnforced,
      active_precedence_level: precedence.level,
      active_precedence_name: precedence.name,
      precedence_rationale: precedence.reason,
      blocked_gates: Object.freeze(blockedGates),
    });
  } catch (_e) {
    // Fail-open: return original state unchanged
    return strategyState && typeof strategyState === 'object' ? strategyState : {};
  }
}

/**
 * Builds a human-readable precedence enforcement block for injection into the
 * session-start context when the precedence guard overrides the strategy mode.
 *
 * The block makes the LLM explicitly aware of which legacy shortcuts are blocked
 * and why, reinforcing the planner-first rule at the instruction level.
 *
 * Returns '' (empty string) when no enforcement fired (precedence_enforced !== true).
 * Never throws.
 *
 * @param {object|null} guardResult - Augmented strategy state from applyStrategyPrecedenceGuard()
 * @returns {string} Enforcement text block, or ''
 */
export function buildPrecedenceEnforcementBlock(guardResult) {
  try {
    if (!guardResult || guardResult.precedence_enforced !== true) return '';
    const level = guardResult.active_precedence_level ?? '?';
    const name = guardResult.active_precedence_name ?? 'UNKNOWN';
    const reason = guardResult.precedence_rationale ?? 'unknown';
    const blockedGates = Array.isArray(guardResult.blocked_gates) ? guardResult.blocked_gates : [];

    const gateLines = blockedGates.map((gate) => {
      const def = LEGACY_GATE_OVERRIDES[gate];
      const desc = def ? def.description : gate;
      return `  — ${gate}: BLOCKED — ${desc}`;
    });

    return [
      '=== PLANNER PRECEDENCE ENFORCEMENT — ACTIVE ===',
      '',
      `Active Level  : ${name} (level ${level})`,
      `Reason        : ${reason}`,
      `Enforced Mode : stabilisation`,
      '',
      'The following legacy shortcuts are blocked in this session:',
      ...gateLines,
      '',
      'Planner-first order is MANDATORY:',
      '  understand → hold → clarify → formulate → select target → decide move type',
      '  → THEN consider intervention (only when all readiness gates pass)',
      '',
      '=== END PRECEDENCE ENFORCEMENT ===',
    ].join('\n');
  } catch (_e) {
    return '';
  }
}

/**
 * Builds the V6 session-start content string asynchronously.
 *
 * Phase 1 Quality Gains — Formulation Context Injection.
 * Phase 10 — Formulation-Led CBT Instructions.
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
 *   4. Appends THERAPIST_FORMULATION_INSTRUCTIONS (formulation_led_enabled).
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

  // Step 3: Inject formulation-led instructions (Phase 10, fail-closed)
  const formulationLedBlock = getFormulationLedContextForWiring(wiring);

  let result = v5Base;
  if (formulationBlock && formulationBlock.trim()) {
    result = result + '\n\n' + formulationBlock;
  }
  if (formulationLedBlock) {
    result = result + '\n\n' + formulationLedBlock;
  }
  return result;
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

// ─── Wave 5D — Quality Evaluator diagnostic helpers ───────────────────────────

/**
 * Extracts safe bounded wiring identity metadata from a wiring config for
 * the Quality Evaluator.  Only structural flag fields are included.
 * Never includes tool_configs, agent_instructions, system_prompt, or any
 * content arrays.
 *
 * FAIL-CLOSED: returns null when wiring is absent or non-object.
 *
 * @private
 * @param {object|null|undefined} wiring
 * @returns {object|null}
 */
function _buildWiringIdentityForEvaluator(wiring) {
  if (!wiring || typeof wiring !== 'object') return null;
  return {
    name: typeof wiring.name === 'string' ? wiring.name : '',
    stage2: wiring.stage2 === true,
    stage2_phase: typeof wiring.stage2_phase === 'number' ? wiring.stage2_phase : 0,
    strategy_layer_enabled: wiring.strategy_layer_enabled === true,
    formulation_context_enabled: wiring.formulation_context_enabled === true,
    continuity_layer_enabled: wiring.continuity_layer_enabled === true,
    safety_mode_enabled: wiring.safety_mode_enabled === true,
  };
}

/**
 * Emits a Quality Evaluator diagnostic to the console when both
 * `?_s2debug=true` is present in the URL AND the QUALITY_EVALUATOR_ENABLED
 * env flag is set.  No-op in all other environments (production, CI, Node.js).
 *
 * Wave 5D — Evaluator Diagnostics Integration.
 *
 * SAFETY CONTRACT
 * ---------------
 * - Gated by BOTH `_s2debug=true` in the URL AND VITE_QUALITY_EVALUATOR_ENABLED.
 * - Only emits bounded evaluator metadata (version, bands, risk flags, wiring
 *   identity).  Never emits raw user text, raw assistant text, or private
 *   entity content.
 * - Does NOT change any routing decision, session content, or therapeutic
 *   behavior.  The evaluator result is ONLY used for console output here.
 * - Does NOT store the snapshot — console output only.
 * - Fail-closed on any error (never propagates).
 * - evaluatorInputs must contain ONLY pre-processed structured signals, never
 *   raw message text or private entity fields.
 *
 * @private
 * @param {object} evaluatorInputs
 *   Bounded structured signals: strategyState, ltsInputs, safetyResult,
 *   distressTier, wiringIdentity.  Raw text must NOT be included.
 */
function _emitEvaluatorDiagnosticIfEnabled(evaluatorInputs) {
  try {
    if (typeof window === 'undefined') return;
    const search = window.location?.search ?? '';
    if (!search) return;
    const params = new URLSearchParams(search);
    if (params.get('_s2debug') !== 'true') return;
    // Secondary gate: QUALITY_EVALUATOR_ENABLED env flag.
    // Checked directly here to avoid importing featureFlags (no cycle risk,
    // but keeps this file's dependency surface minimal).
    if (import.meta.env?.VITE_QUALITY_EVALUATOR_ENABLED !== 'true') return;

    const snap = computeEvaluatorDiagnosticSnapshot(evaluatorInputs);
    console.group('[Wave 5D] Quality Evaluator diagnostic');
    console.log('evaluator_version :', snap.evaluator_version);
    console.log('aggregate_band    :', snap.aggregate_band);
    console.log('fail_safe         :', snap.fail_safe);
    console.log('agent_role        :', snap.agent_role);
    console.log('wiring_version    :', snap.wiring_version);
    console.log('active_dimensions :', snap.active_dimensions);
    console.log('dimensions        :', snap.dimensions);
    console.log('risk_flags        :', snap.risk_flags);
    console.groupEnd();
  } catch (_e) {
    // Diagnostic emission must never propagate — fail silently.
  }
}

// ─── Wave 2D — Strategy diagnostic emission ───────────────────────────────────

/**
 * Emits a safe strategy diagnostic to the console when `?_s2debug=true` is
 * present in the URL.  No-op in all other environments (production, CI, Node.js).
 *
 * SAFETY CONTRACT
 * ---------------
 * - Only called in the V8 strategy path (strategy_layer_enabled === true).
 * - Uses buildStrategyDiagnosticSnapshot() which strips message_signals and
 *   never includes raw user text or private entity content.
 * - Wave 3E: when ltsInputs is provided, also emits an LTS signal group via
 *   buildLTSDiagnosticSnapshot().  Gated behind the same _s2debug flag.
 * - Gated by window.location.search containing `_s2debug=true` — fail-closed
 *   on any error, on missing window, or on any unexpected input.
 * - Does NOT change any routing decision or therapeutic behavior.
 * - Does NOT store the snapshot — console output only.
 *
 * @private
 * @param {object} strategyState - TherapistStrategyState from determineTherapistStrategy()
 * @param {object|null} [ltsInputs] - Optional LTSStrategyInputs from extractLTSStrategyInputs()
 */
function _emitStrategyDiagnosticIfEnabled(strategyState, ltsInputs) {
  try {
    if (typeof window === 'undefined') return;
    const search = window.location?.search ?? '';
    if (!search) return;
    const params = new URLSearchParams(search);
    if (params.get('_s2debug') !== 'true') return;
    const snapshot = buildStrategyDiagnosticSnapshot(strategyState);
    console.group('[Wave 2D] Therapist strategy decision');
    console.log('intervention_mode        :', snapshot.intervention_mode);
    console.log('distress_tier            :', snapshot.distress_tier);
    console.log('rationale                :', snapshot.rationale);
    console.log('continuity_present       :', snapshot.continuity_present);
    console.log('formulation_present      :', snapshot.formulation_present);
    console.log('session_count            :', snapshot.session_count);
    console.log('has_risk_flags           :', snapshot.has_risk_flags);
    console.log('has_open_tasks           :', snapshot.has_open_tasks);
    console.log('intervention_saturated   :', snapshot.intervention_saturated);
    console.log('continuity_richness_score:', snapshot.continuity_richness_score);
    console.log('formulation_strength_score:', snapshot.formulation_strength_score);
    console.log('lts_trajectory           :', snapshot.lts_trajectory);
    console.log('strategy_version         :', snapshot.strategy_version);
    console.log('fail_safe                :', snapshot.fail_safe);
    // Wave 3E — LTS signal group (emitted only when LTS inputs are available)
    if (ltsInputs != null) {
      const ltsSnap = buildLTSDiagnosticSnapshot(ltsInputs);
      console.group('[Wave 3E] LTS signals active');
      console.log('lts_valid                :', ltsSnap.lts_valid);
      console.log('lts_session_count        :', ltsSnap.lts_session_count);
      console.log('lts_trajectory           :', ltsSnap.lts_trajectory);
      console.log('lts_has_risk_history     :', ltsSnap.lts_has_risk_history);
      console.log('lts_is_stagnating        :', ltsSnap.lts_is_stagnating);
      console.log('lts_is_progressing       :', ltsSnap.lts_is_progressing);
      console.log('lts_is_fluctuating       :', ltsSnap.lts_is_fluctuating);
      console.log('lts_has_stalled_interventions:', ltsSnap.lts_has_stalled_interventions);
      console.groupEnd();
    }
    console.groupEnd();
  } catch (_e) {
    // Diagnostic emission must never propagate — fail silently.
  }
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

    // Step 7: Determine therapeutic strategy (Wave 3D: with LTS inputs when available)
    const ltsInputs = extractLTSStrategyInputs(options.lts_record ?? null);
    const rawStrategyState = determineTherapistStrategy(
      continuityData,
      formulationRecord,
      distressTier,
      messageSignals,
      ltsInputs,
    );

    // Precedence enforcement pass — blocks legacy shortcuts when higher-priority
    // planner rules are active.  buildPlannerContext derives the precedence
    // context from already-available V8 inputs; applyStrategyPrecedenceGuard
    // overrides the mode to stabilisation if any action-enabling gate is blocked.
    const plannerCtx = buildPlannerContext(formulationRecord, safetyResult, distressTier, options);
    const strategyState = applyStrategyPrecedenceGuard(rawStrategyState, plannerCtx);

    // Wave 2D — Emit safe strategy diagnostic when _s2debug=true is in the URL.
    // Gated, additive, no effect on routing or therapeutic behavior.
    // Never logs raw message content — only the sanitized diagnostic snapshot.
    // Wave 3E: pass ltsInputs so the LTS signal group is also emitted.
    _emitStrategyDiagnosticIfEnabled(strategyState, ltsInputs);

    // Wave 5D — Emit Quality Evaluator diagnostic when _s2debug=true and
    // QUALITY_EVALUATOR_ENABLED is set.  Additive only; no effect on routing or
    // therapeutic behavior.  Never includes raw text or private entity content.
    _emitEvaluatorDiagnosticIfEnabled({
      strategyState,
      ltsInputs,
      safetyResult,
      distressTier,
      wiringIdentity: _buildWiringIdentityForEvaluator(wiring),
    });

    // Step 8: Build strategy context section
    const strategySection = buildStrategyContextSection(strategyState);
    if (!strategySection || !strategySection.trim()) {
      return v7Base;
    }

    // Append precedence enforcement block when any legacy gate was blocked.
    const enforcementBlock = buildPrecedenceEnforcementBlock(strategyState);
    const sections = [v7Base, strategySection];
    if (enforcementBlock) sections.push(enforcementBlock);
    return sections.join('\n\n');
  } catch {
    // Fail-open: strategy computation failed — return V7 base content unchanged
    return v7Base;
  }
}

// ─── Wave 3C — LTS read path and V9 session-start injection ──────────────────

/**
 * Maximum number of CompanionMemory records to over-fetch when searching for the
 * canonical LTS snapshot.  Small enough to be safe; large enough to find the LTS
 * among recently written records even if a few session records were written
 * between the LTS upsert and the next session start.
 *
 * @type {number}
 */
export const LTS_SNAPSHOT_OVERFETCH_BOUND = 15;

/**
 * Maximum number of items per array field included in the LTS context block.
 * Keeps the injected block compact and prevents over-loading the context window.
 *
 * @type {number}
 */
export const LTS_BLOCK_MAX_ARRAY_ITEMS = 4;

/**
 * Reads the single canonical LTS snapshot from CompanionMemory.
 *
 * Fetches up to LTS_SNAPSHOT_OVERFETCH_BOUND CompanionMemory records (newest
 * first), parses each record's content, and returns the first valid LTS record
 * found (i.e. the most recently stored one).
 *
 * FAIL-OPEN CONTRACT
 * ------------------
 * Returns null on any error (missing entities, empty list, parse failure, etc.).
 * Callers must treat null as "no LTS available" and fall back to V8 output.
 *
 * PRIVACY
 * -------
 * - CompanionMemory is a private per-user entity — no cross-user access.
 * - Only records whose content passes isLTSRecord() are returned.
 * - No raw transcript content is read or returned — LTS records are structured
 *   signal aggregates only (Wave 3A/3B schema).
 *
 * @private
 * @param {object} entities - Base44 entity client map
 * @returns {Promise<object|null>} Parsed LTS record, or null
 */
async function readLTSSnapshot(entities) {
  try {
    if (!entities || typeof entities !== 'object') return null;
    if (!entities.CompanionMemory || typeof entities.CompanionMemory.list !== 'function') return null;

    const rawRecords = await entities.CompanionMemory.list('-created_date', LTS_SNAPSHOT_OVERFETCH_BOUND);
    if (!Array.isArray(rawRecords) || rawRecords.length === 0) return null;

    for (const raw of rawRecords) {
      if (!raw || typeof raw !== 'object') continue;
      // Quick pre-filter: only bother parsing records whose outer memory_type is 'lts'.
      if (raw.memory_type !== LTS_MEMORY_TYPE) continue;

      let parsed = null;
      try {
        if (raw.content && typeof raw.content === 'string') {
          parsed = JSON.parse(raw.content);
        } else if (raw.content && typeof raw.content === 'object') {
          parsed = raw.content;
        }
      } catch {
        continue;
      }

      if (isLTSRecord(parsed)) return parsed;
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Returns true when the given LTS record is too weak or immature to be worth
 * injecting into the session-start context.
 *
 * Suppression criteria (any one is sufficient to suppress):
 *   1. The record is null, not an object, or fails isLTSRecord() — not a valid LTS.
 *   2. trajectory is 'unknown' — LTS was not computed or is a schema default.
 *   3. trajectory is 'insufficient_data' — too few sessions to derive signals.
 *   4. session_count < LTS_MIN_SESSIONS_FOR_SIGNALS — belt-and-suspenders check.
 *
 * @param {unknown} ltsRecord - Any value; the parsed LTS record to evaluate.
 * @returns {boolean} true when the record should be suppressed.
 */
export function isLTSWeak(ltsRecord) {
  if (!isLTSRecord(ltsRecord)) return true;
  const trajectory = ltsRecord.trajectory;
  if (trajectory === LTS_TRAJECTORIES.UNKNOWN) return true;
  if (trajectory === LTS_TRAJECTORIES.INSUFFICIENT_DATA) return true;
  const sessionCount = typeof ltsRecord.session_count === 'number' ? ltsRecord.session_count : 0;
  if (sessionCount < LTS_MIN_SESSIONS_FOR_SIGNALS) return true;
  return false;
}

/**
 * Builds a compact, bounded LTS context block string for injection into the
 * therapist session-start payload.
 *
 * FIELDS INCLUDED
 * ---------------
 * The LTS block intentionally surfaces ONLY the signals not already present in
 * the cross-session continuity block (which covers recent patterns, open tasks,
 * interventions, and risk flags from the last 3 sessions):
 *
 *   trajectory           — The longitudinal clinical arc (unique to LTS; not
 *                          surfaced anywhere else in the session-start context).
 *   helpful_interventions — Interventions co-occurring with positive sessions
 *                          (not present in continuity block).
 *   risk_flag_history    — Safety signal across ALL sessions (continuity only
 *                          covers the last 3).
 *
 * Recurring patterns and persistent open tasks are deliberately excluded to
 * avoid noise and duplication with the continuity block.
 *
 * SUPPRESSION
 * -----------
 * Returns '' when:
 *   - ltsRecord is null, invalid, or fails isLTSWeak().
 *   - trajectory is 'unknown' or 'insufficient_data'.
 *   - No signals are present beyond a 'stable' trajectory and empty arrays
 *     (block is still emitted for valid non-trivial trajectories).
 *
 * BOUNDS
 * ------
 * Arrays are capped to LTS_BLOCK_MAX_ARRAY_ITEMS entries.
 * The block is always a single short section.
 *
 * FAIL-CLOSED: never throws; returns '' on any error.
 *
 * @param {object|null} ltsRecord - A parsed LTS record (from readLTSSnapshot).
 * @returns {string} Formatted LTS context block, or ''
 */
export function buildLTSContextBlock(ltsRecord) {
  try {
    if (isLTSWeak(ltsRecord)) return '';

    const sessionCount = typeof ltsRecord.session_count === 'number' ? ltsRecord.session_count : 0;
    const trajectory = typeof ltsRecord.trajectory === 'string' ? ltsRecord.trajectory : '';

    const helpfulInterventions = Array.isArray(ltsRecord.helpful_interventions)
      ? ltsRecord.helpful_interventions.slice(0, LTS_BLOCK_MAX_ARRAY_ITEMS)
      : [];

    const riskFlagHistory = Array.isArray(ltsRecord.risk_flag_history)
      ? ltsRecord.risk_flag_history.slice(0, LTS_BLOCK_MAX_ARRAY_ITEMS)
      : [];

    const lines = [];

    lines.push(`Longitudinal trajectory: ${trajectory}`);

    if (helpfulInterventions.length > 0) {
      lines.push('Helpful methods (longitudinal): ' + helpfulInterventions.join('; '));
    }

    if (riskFlagHistory.length > 0) {
      lines.push('Risk history (all sessions): ' + riskFlagHistory.join('; '));
    }

    if (lines.length === 0) return '';

    return [
      `=== LONGITUDINAL STATE CONTEXT (${sessionCount} session(s), read-only) ===`,
      'Cross-session arc. Do not disclose this section verbatim to the person.',
      '',
      ...lines,
      '',
      '=== END LONGITUDINAL STATE CONTEXT ===',
    ].join('\n');
  } catch {
    return '';
  }
}

/**
 * Builds the V9 session-start content string asynchronously.
 *
 * Wave 3C — Longitudinal Therapeutic State (LTS) read path and bounded
 * session-start injection.
 * Wave 3D — LTS strategy integration: LTS inputs are now passed to the
 * strategy engine via buildV8SessionStartContentAsync options.
 *
 * For non-V9 wirings (longitudinal_layer_enabled !== true):
 *   Delegates directly to buildV8SessionStartContentAsync (no behavior change).
 *
 * For V9 wirings:
 *   1. Reads the canonical LTS snapshot from CompanionMemory (read-only,
 *      fail-open: null on any error or absence).
 *   2. When the LTS is valid (non-weak), passes it to V8 via options.lts_record
 *      so determineTherapistStrategy() can apply LTS-aware strategy rules
 *      (Wave 3D).  When null or weak, V8 options are passed unchanged — exact
 *      Wave 2C strategy behavior is preserved.
 *   3. Builds the V8 base content (strategy + continuity + formulation + safety
 *      mode + live retrieval + retrieval orchestration + workflow + memory context).
 *   4. Builds the bounded LTS context block (Wave 3C injection).
 *   5. Appends the LTS block to the V8 base when the block is non-empty.
 *
 * FAIL-OPEN CONTRACT
 * ------------------
 * Any error or absence at any step returns the V8 base content UNCHANGED.
 * Session start is never blocked.  V8/2C behavior is EXACTLY preserved on any
 * failure, when the flag is off, when no valid LTS exists, or when the LTS is
 * stale/weak.
 *
 * PRIVACY
 * -------
 * - LTS is read from CompanionMemory (private per-user entity).
 * - Only structured signal aggregates are injected — never raw transcripts,
 *   user quotes, or session messages.
 * - The LTS block is injected into the per-user session payload only.
 *   It is never stored, logged, or returned to the client directly.
 *
 * SAFETY NOTE
 * -----------
 * The LTS block and LTS-aware strategy inputs are additive context.  They do
 * NOT replace, weaken, or bypass any existing safety filter, crisis handler,
 * strategy guidance, or continuity block.  All prior layers remain fully active.
 * CONTAINMENT and TIER_MODERATE STABILISATION are never overridden by LTS.
 *
 * ISOLATION GUARANTEE
 * -------------------
 * This function is ONLY active when wiring.longitudinal_layer_enabled === true
 * (V9 path).  All prior paths (HYBRID, V1–V8) are completely unaffected.
 *
 * @param {object} wiring - The active therapist wiring configuration
 * @param {object} entities - Base44 entity client map
 * @param {object} baseClient - Base44 SDK client (passed to V8 chain)
 * @param {object} [options] - Optional options forwarded to V8 chain
 * @returns {Promise<string>} The full session-start content string
 */
export async function buildV9SessionStartContentAsync(
  wiring,
  entities,
  baseClient,
  options = {},
) {
  // For non-V9 wirings: delegate to V8 (no change to behavior)
  if (!wiring || wiring.longitudinal_layer_enabled !== true) {
    return buildV8SessionStartContentAsync(wiring, entities, baseClient, options);
  }

  // ── V9 path ────────────────────────────────────────────────────────────────

  // Wave 3C+3D: Read the LTS snapshot first so it can be passed both to the
  // strategy engine (Wave 3D) and used for context block injection (Wave 3C).
  // Fail-open: null on any error.
  let ltsRecord = null;
  try {
    ltsRecord = await readLTSSnapshot(entities);
  } catch {
    ltsRecord = null;
  }

  // Wave 3D: Pass a valid (non-weak) LTS record to the V8 strategy engine via
  // the options bag.  buildV8SessionStartContentAsync extracts LTS strategy
  // inputs from options.lts_record and passes them to determineTherapistStrategy.
  // When ltsRecord is null or weak, options is passed unchanged (exact V8/2C
  // behavior is preserved).
  const v8Options = !isLTSWeak(ltsRecord)
    ? { ...options, lts_record: ltsRecord }
    : options;

  // Step 1: Build the V8 base content (with LTS strategy inputs when available)
  const v8Base = await buildV8SessionStartContentAsync(
    wiring,
    entities,
    baseClient,
    v8Options,
  );

  // Wave 3C: Inject LTS context block (fail-open: any error returns v8Base)
  try {
    if (!isLTSWeak(ltsRecord)) {
      const ltsBlock = buildLTSContextBlock(ltsRecord);
      if (ltsBlock && ltsBlock.trim()) {
        return v8Base + '\n\n' + ltsBlock;
      }
    }
    return v8Base;
  } catch {
    // Fail-open: LTS block injection failed — return V8 base content unchanged
    return v8Base;
  }
}

// ─── Wave 4C — CBT Knowledge Retrieval read path and V10 session-start injection

/**
 * Builds the V10 session-start content string asynchronously.
 *
 * Wave 4C — CBT Knowledge Retrieval read path.
 * Wave 4D — Strategy-knowledge alignment.
 *
 * For non-V10 wirings (knowledge_layer_enabled !== true):
 *   Delegates directly to buildV9SessionStartContentAsync (no behavior change).
 *
 * For V10 wirings:
 *   1. Builds the V9 base content (LTS block + strategy + formulation + all
 *      prior layers) by delegating to buildV9SessionStartContentAsync.
 *   2. Reads the best CaseFormulation record (same bounded read V8 performs;
 *      fail-open: null on any error).
 *   3. Extracts structured formulationHints for the planner using the
 *      extractFormulationHintsForPlanner() helper from cbtKnowledgeRetrieval.js
 *      — reads only the structured cbt_domain and treatment_phase fields;
 *      NEVER analyses free-text fields.
 *   4. Evaluates the safety mode from options flags (no extra entity read).
 *   5. Scores the distress tier from safety result + message signals.
 *   6. (Wave 4D) Reads the LTS snapshot for knowledge planner alignment
 *      (fail-open: null on any error).  Extracts bounded LTS strategy inputs.
 *   7. Determines the therapeutic strategy state with LTS-aware inputs
 *      (continuityData=null is intentional — avoids a duplicate CompanionMemory
 *      full-window read; LTS inputs provide trajectory signals instead).
 *   8. Runs planCBTKnowledgeRetrieval() with the above bounded inputs, including
 *      ltsInputs so the planner can refine unit type preference from trajectory.
 *   9. If shouldRetrieve: retrieves ≤ CBT_KNOWLEDGE_RETRIEVAL_MAX_UNITS units,
 *      ranked by unit type preference (Wave 4D).
 *  10. Appends the knowledge block (last, always) when non-empty.
 *
 * FAIL-OPEN CONTRACT
 * ------------------
 * Any error after building v9Base returns v9Base unchanged.
 * The knowledge block is NEVER the first thing in the content — it is always
 * appended last as a supplementary reference block.
 *
 * PRECEDENCE
 * ----------
 * Safety → distress → strategy → formulation domain → retrieval.
 * Retrieved knowledge does NOT override safety, formulation, continuity,
 * strategy, or LTS blocks.  It is supporting context only.
 *
 * COMPANION ISOLATION
 * -------------------
 * This function is never called for AI Companion wirings.
 * The knowledge_layer_enabled flag only exists on CBT Therapist V10 wiring.
 *
 * @param {object}  wiring          - The active CBT Therapist wiring config.
 * @param {object}  entities        - Base44 entity client map.
 * @param {object}  baseClient      - Base44 SDK client (passed through to V9/V8).
 * @param {object}  [options={}]    - Session-start options (crisis_signal, message_text, etc.)
 * @returns {Promise<string>} The full session-start content string.
 */
export async function buildV10SessionStartContentAsync(
  wiring,
  entities,
  baseClient,
  options = {},
) {
  // For non-V10 wirings: delegate to V9 (no change to behavior)
  if (!wiring || wiring.knowledge_layer_enabled !== true) {
    return buildV9SessionStartContentAsync(wiring, entities, baseClient, options);
  }

  // ── V10 path ────────────────────────────────────────────────────────────────

  // Step 1: Build the V9 base content (LTS injection + all prior layers).
  // V9 reads the LTS snapshot and passes it to V8's strategy engine internally.
  // V10 inherits the full V9 output as its base and only ever appends to it.
  const v9Base = await buildV9SessionStartContentAsync(
    wiring,
    entities,
    baseClient,
    options,
  );

  // Steps 2–9: Compute knowledge retrieval decision and append block (fail-open)
  try {
    // Step 2: Read CaseFormulation (bounded, read-only, fail-open — same entity
    // that V8 reads; no new entity type introduced here).
    const formulationRecord = await readBestFormulationRecord(entities);

    // Step 3: Import helpers (dynamic import — only needed on V10 path)
    const [{ extractFormulationHintsForPlanner, retrieveBoundedCBTKnowledgeBlock }, { planCBTKnowledgeRetrieval }] =
      await Promise.all([
        import('./cbtKnowledgeRetrieval.js'),
        import('./cbtKnowledgePlanner.js'),
      ]);

    const formulationHints = extractFormulationHintsForPlanner(formulationRecord);

    // Step 4: Evaluate safety mode from options (no entity read — options-only)
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
    const safetyActive = !!(safetyResult && safetyResult.safety_mode === true);

    // Step 5: Score distress tier
    const messageSignals = extractMessageSignals(options.message_text ?? '');
    const distressTier = scoreDistressTier(safetyResult, messageSignals);

    // Step 6 (Wave 4D): Read LTS snapshot for knowledge planner alignment.
    // This bounded read (CompanionMemory, LTS records only) is separate from V9's
    // LTS read and provides trajectory signals to the planner so that unit type
    // preference reflects the user's current arc (stagnating → worksheet;
    // progressing late → case example).  Fail-open: null on any error.
    // continuityData = null (intentional): avoids a duplicate CompanionMemory
    // read for the full cross-session window; the strategy engine returns
    // STRUCTURED_EXPLORATION when a formulation is present without continuity.
    let ltsRecord = null;
    try {
      ltsRecord = await readLTSSnapshot(entities);
    } catch {
      // Fail-open: LTS read error must never block session start.
      // The outer try/catch will return v9Base unchanged on any downstream error.
      ltsRecord = null;
    }
    const ltsInputsForPlanner = extractLTSStrategyInputs(ltsRecord);

    // Step 7: Determine strategy state.
    // ltsInputsForPlanner is passed so that stagnation/fluctuation guards in the
    // strategy engine are LTS-aware for this knowledge path.  When the LTS record
    // is absent or weak, extractLTSStrategyInputs returns lts_valid: false and
    // the strategy engine falls back to exact Wave 2C behavior.
    const rawStrategyState = determineTherapistStrategy(
      null,                  // continuityData — no re-read (see above)
      formulationRecord,
      distressTier,
      messageSignals,
      ltsInputsForPlanner,   // Wave 4D: LTS-aware strategy for knowledge path
    );

    // Precedence enforcement pass — block legacy shortcuts before knowledge
    // retrieval routing.  applyStrategyPrecedenceGuard overrides the mode to
    // stabilisation when any action-enabling gate is blocked, which causes
    // planCBTKnowledgeRetrieval (step 8) to return a skip plan because
    // stabilisation is not in the retrieval-allowed modes list.
    // This prevents domain_to_intervention_template and micro_step_defaulting
    // from triggering domain-based retrieval prematurely.
    const plannerCtxForKnowledge = buildPlannerContext(formulationRecord, safetyResult, distressTier, options);
    const strategyState = applyStrategyPrecedenceGuard(rawStrategyState, plannerCtxForKnowledge);

    // Step 8: Run the CBT knowledge planner with bounded structured inputs.
    // flagEnabled is true because we only reach V10 when knowledge_layer_enabled
    // === true (the wiring gate already confirmed the flag state).
    const plan = planCBTKnowledgeRetrieval({
      flagEnabled: true,
      strategyState,
      ltsInputs: ltsInputsForPlanner, // Wave 4D: LTS arc + unit type preference
      formulationHints,
      distressTier,
      safetyActive,
    });

    // Step 9: Short-circuit when planner says skip
    if (!plan.shouldRetrieve) return v9Base;

    // Step 10: Retrieve bounded knowledge block and append when non-empty.
    // retrieveBoundedCBTKnowledgeBlock is fully fail-open (returns '' on error).
    const knowledgeBlock = await retrieveBoundedCBTKnowledgeBlock(entities, plan);
    if (knowledgeBlock && knowledgeBlock.trim()) {
      return v9Base + '\n\n' + knowledgeBlock;
    }
    return v9Base;
  } catch {
    // Fail-open: any error returns V9 base content unchanged
    return v9Base;
  }
}

// ─── Phase 3 Competence Architecture — V11 session-start injection ────────────

/**
 * Builds the V11 session-start content string asynchronously.
 *
 * For non-V11 wirings (competence_layer_enabled !== true):
 *   Delegates directly to buildV10SessionStartContentAsync (no behavior change).
 *
 * For V11 wirings:
 *   1. Builds the V10 base content (knowledge block + LTS + strategy + formulation
 *      + all prior layers) by delegating to buildV10SessionStartContentAsync.
 *   2. Appends the Phase 3 competence instruction block (THERAPIST_COMPETENCE_INSTRUCTIONS)
 *      sourced from therapistWorkflowEngine.js.
 *   3. Returns the combined string.
 *
 * The competence block is appended LAST — after all prior layers — and does NOT
 * override safety, formulation, continuity, strategy, LTS, or knowledge signals.
 *
 * FAIL-OPEN: any error at any step returns the V10 base content unchanged.
 * The V10 base content itself is fail-open through its own chain.
 *
 * The competence_layer_enabled flag only exists on CBT Therapist V11 wiring.
 * All prior wirings (HYBRID, V1–V10) are completely unaffected by this function.
 *
 * @param {object}  wiring          - The active CBT Therapist wiring config object
 * @param {object}  entities        - Base44 entity client map
 * @param {object}  baseClient      - Base44 SDK client (passed through to V10/V9)
 * @param {object}  [options]       - Optional bag (passed through to V10/V9 chain)
 * @returns {Promise<string>} Session-start content string
 */
export async function buildV11SessionStartContentAsync(wiring, entities, baseClient, options) {
  // For non-V11 wirings: delegate to V10 (no change to behavior)
  if (!wiring || wiring.competence_layer_enabled !== true) {
    return buildV10SessionStartContentAsync(wiring, entities, baseClient, options);
  }

  // ── V11 path ────────────────────────────────────────────────────────────────

  // Step 1: Build V10 base content (fail-open chain handles all errors internally)
  const v10Base = await buildV10SessionStartContentAsync(wiring, entities, baseClient, options);

  try {
    // Step 2: Import the competence instruction block from the workflow engine
    const { THERAPIST_COMPETENCE_INSTRUCTIONS } = await import('./therapistWorkflowEngine.js');

    // Step 3: Append the competence block when non-empty
    if (THERAPIST_COMPETENCE_INSTRUCTIONS && THERAPIST_COMPETENCE_INSTRUCTIONS.trim()) {
      return v10Base + '\n\n' + THERAPIST_COMPETENCE_INSTRUCTIONS;
    }
    return v10Base;
  } catch {
    // Fail-open: any error returns V10 base content unchanged
    return v10Base;
  }
}

// ─── Wave 5 — Formulation-First Planner Policy — V12 session-start injection ─

/**
 * Returns the Wave 5 formulation-first planner policy instruction block when
 * the wiring has planner_first_enabled === true, otherwise null.
 *
 * @param {object|null} wiring - The active therapist wiring configuration
 * @returns {string|null} The planner-first instruction string, or null
 */
export function getPlannerFirstContextForWiring(wiring) {
  if (!wiring || wiring.planner_first_enabled !== true) {
    return null;
  }
  return THERAPIST_PLANNER_FIRST_INSTRUCTIONS;
}

/**
 * Builds the V12 session-start content string asynchronously.
 *
 * Wave 5 — Formulation-First Planner Policy.
 *
 * For non-V12 wirings (planner_first_enabled !== true):
 *   Delegates directly to buildV11SessionStartContentAsync (no behavior change).
 *
 * For V12 wirings:
 *   1. Builds the V11 base content (competence + knowledge + LTS + strategy +
 *      formulation + all prior layers) by delegating to buildV11.
 *   2. Imports THERAPIST_PLANNER_FIRST_INSTRUCTIONS from therapistWorkflowEngine.js.
 *   3. Appends the planner-first block when non-empty.
 *
 * FAIL-OPEN: any error at any step returns the V11 base content unchanged.
 * The V11 base content itself is fail-open through its own chain.
 *
 * The planner_first_enabled flag only exists on CBT Therapist V12 wiring.
 * All prior wirings (HYBRID, V1–V11) are completely unaffected by this function.
 *
 * @param {object}  wiring          - The active therapist wiring configuration
 * @param {object}  entities        - Base44 entity client map
 * @param {object}  baseClient      - Base44 SDK client (passed through to V11/V10)
 * @param {object}  [options]       - Optional bag (passed through to V11/V10 chain)
 * @returns {Promise<string>} The full session-start content string
 */
export async function buildV12SessionStartContentAsync(wiring, entities, baseClient, options) {
  // For non-V12 wirings: delegate to V11 (no change to behavior)
  if (!wiring || wiring.planner_first_enabled !== true) {
    return buildV11SessionStartContentAsync(wiring, entities, baseClient, options);
  }

  // ── V12 path ────────────────────────────────────────────────────────────────

  // Step 1: Build V11 base content (fail-open chain handles all errors internally)
  const v11Base = await buildV11SessionStartContentAsync(wiring, entities, baseClient, options);

  try {
    // Step 2: Append the planner-first block when non-empty (synchronous import)
    if (THERAPIST_PLANNER_FIRST_INSTRUCTIONS && THERAPIST_PLANNER_FIRST_INSTRUCTIONS.trim()) {
      return v11Base + '\n\n' + THERAPIST_PLANNER_FIRST_INSTRUCTIONS;
    }
    return v11Base;
  } catch {
    // Fail-open: any error returns V11 base content unchanged
    return v11Base;
  }
}

// ─── Action-First Demotion — Universal formulation-first default ──────────────

/**
 * Builds the session-start content with action-first demotion applied
 * unconditionally to ALL wiring paths.
 *
 * BACKGROUND
 * ----------
 * buildV12SessionStartContentAsync injects THERAPIST_PLANNER_FIRST_INSTRUCTIONS
 * only when wiring.planner_first_enabled === true (V12 path).  The HYBRID path
 * and all intermediate wirings (V1–V11) return their content without the block,
 * which means action-first / exercise-first behavior remains a possible LLM
 * default on those paths — because no instruction explicitly demotes it.
 *
 * ACTION-FIRST DEMOTION
 * ---------------------
 * This function closes that gap.  It calls buildV12SessionStartContentAsync and,
 * if the result does not already contain THERAPIST_PLANNER_FIRST_INSTRUCTIONS,
 * appends the block unconditionally.  Every session — regardless of the active
 * wiring — therefore receives the formulation-first planner policy instructions.
 *
 * The policy instructs the LLM:
 *   "Intervention selection and micro-step assignment must NEVER be the default
 *    first output. They are the last resort, reached only after understanding,
 *    formulation, target identification, and move-type selection are complete."
 *
 * This makes formulation-first the runtime default for all session paths.
 * The action/exercise path remains available but only after formulation readiness
 * gates are satisfied (as defined in THERAPIST_INTERVENTION_READINESS_GATES).
 *
 * DEFAULT ROUTE (enforced for all wirings after this change)
 * ----------------------------------------------------------
 *   1. acknowledge
 *   2. hold briefly
 *   3. clarify
 *   4. formulate
 *   5. identify target
 *   6. decide move type
 * Only after all six steps may action / exercise / micro-step / homework /
 * direct behavioral suggestion be offered.
 *
 * ACTION PATH ACTIVATION CONDITIONS (required before any action)
 * --------------------------------------------------------------
 *   • enough understanding established
 *   • explicit or implicit formulation in place
 *   • treatment target identified
 *   • readiness for action signal present
 *   • no active higher-priority holding/clarification condition
 * (Defined in THERAPIST_INTERVENTION_READINESS_GATES and THERAPIST_PLANNER_FIRST_INSTRUCTIONS.)
 *
 * No domain label alone (social anxiety, ADHD, OCD, grief, trauma, etc.) may
 * trigger action.  Domain classification never skips the formulation-first sequence.
 *
 * SAFETY CONTRACT
 * ---------------
 * - Fail-open: any error returns the base V12 output unchanged (session never blocked).
 * - Additive only: appends the block after existing content; never replaces.
 * - Does NOT weaken any existing safety filter, wiring config, or entity access rule.
 * - All prior layers (safety, formulation, continuity, strategy, knowledge) are preserved.
 *
 * PRESERVED GAINS
 * ---------------
 * - V12 and other upgraded-path content is fully preserved (no duplication).
 * - Cross-language parity: THERAPIST_PLANNER_FIRST_INSTRUCTIONS contains no
 *   language-specific restrictions — the policy applies in all 7 supported languages.
 * - Warmth, alliance, pacing, and competence instructions are unaffected.
 * - All prior planner, precedence, and safety-mode layers remain active.
 *
 * @param {object}  wiring     - The active CBT Therapist wiring config object
 * @param {object}  entities   - Base44 entity client map
 * @param {object}  baseClient - Base44 SDK client
 * @param {object}  [options]  - Optional bag passed through to V12 chain
 * @returns {Promise<string>} Session-start content with formulation-first policy enforced
 */
export async function buildActionFirstDemotedSessionContentAsync(
  wiring,
  entities,
  baseClient,
  options,
) {
  const base = await buildV12SessionStartContentAsync(wiring, entities, baseClient, options);
  try {
    const block = THERAPIST_PLANNER_FIRST_INSTRUCTIONS;
    // Guard: block must be a non-empty string
    if (typeof block !== 'string' || !block.trim()) return base;
    let content = base;
    // If V12 already injected the block (planner_first_enabled === true), do not duplicate.
    if (!content.includes(block)) {
      // For HYBRID / V1–V11 paths: append the formulation-first planner policy block.
      content += '\n\n' + block;
    }
    if (
      wiring?.name === 'cbt_therapist' &&
      (wiring?.attachment_context_enabled === true || wiring?.attachment_context_enabled === undefined) &&
      !content.includes(THERAPIST_ATTACHMENT_CONTEXT_INSTRUCTIONS)
    ) {
      content += '\n\n' + THERAPIST_ATTACHMENT_CONTEXT_INSTRUCTIONS;
    }
    return content;
  } catch {
    // Fail-open: any error returns the V12 base unchanged so the session is never blocked.
    return base;
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

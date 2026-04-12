/**
 * @file src/lib/therapistQualityEvaluator.js
 *
 * Therapist Upgrade — Wave 5A — Quality Evaluator (Scaffold)
 *
 * PURPOSE
 * -------
 * Pure deterministic scaffold that defines the Quality Evaluator contract:
 * dimensions, score bands, aggregate bands, fail-safe snapshot shape, and the
 * buildQualityEvaluatorSnapshot() factory.
 *
 * This module contains ZERO runtime scoring logic. It establishes the contract
 * so that tests can validate stability, shape, and fail-safe behaviour before
 * any session-start wiring is introduced in a later wave.
 *
 * ISOLATION GUARANTEE
 * -------------------
 * This module has NO imports from any other app module. It does NOT import
 * from agentWiring, activeAgentWiring, featureFlags, workflowContextInjector,
 * or any entity definition.  It is a standalone, self-contained pure library.
 *
 * SAFETY CONTRACT
 * ---------------
 * - No LLM calls.
 * - No entity access.
 * - No async.
 * - No side effects.
 * - Deterministic only: same inputs always produce the same output.
 * - Fail-safe defaults: absent/null/malformed inputs → EVALUATOR_FAIL_SAFE_SNAPSHOT.
 * - No user-visible output.
 * - No control path over any runtime behaviour.
 * - No raw user text accepted by the scaffold API.
 * - All public exports are frozen plain objects or pure functions.
 * - All public functions never throw — they catch all exceptions and return
 *   the fail-safe snapshot.
 *
 * NOT WIRED YET (Wave 5A only)
 * ----------------------------
 * - Not called from Chat.jsx.
 * - Not called from workflowContextInjector.js.
 * - Not emitting diagnostics.
 * - Not gated by QUALITY_EVALUATOR_FLAGS at runtime (flag added in featureFlags.js
 *   but this file does not import it; the scaffold is callable in isolation).
 *
 * DIMENSIONS (Wave 5A — structural/objective only)
 * -------------------------------------------------
 * Only the most objective and structurally-verifiable dimensions are included
 * in the active first set. Softer/subjective dimensions are declared as deferred
 * placeholders with scoring intentionally omitted.
 *
 * Active dimensions:
 *   strategy_alignment          — Did the response align with the planned strategy mode?
 *   formulation_alignment       — Did the response respect the formulation context?
 *   continuity_alignment        — Did the response honour session-continuity signals?
 *   knowledge_alignment         — Did the response use retrieved knowledge appropriately?
 *   safety_escalation_consistency — Were safety signals handled consistently?
 *   role_boundary_integrity     — Did the response stay within the therapist role boundary?
 *   context_completeness        — Was the available context used (not ignored)?
 *
 * Deferred placeholders (declared but not scored in Wave 5A):
 *   genericness_risk            — Deferred: softer/subjective dimension, not scored yet.
 *   over_directiveness_risk     — Deferred: softer/subjective dimension, not scored yet.
 *
 * SCORE BANDS (per-dimension)
 * ---------------------------
 *   PASS   — dimension requirement satisfied
 *   WEAK   — dimension partially satisfied; below expected quality bar
 *   FAIL   — dimension requirement not met
 *   SKIP   — dimension not applicable for this session context
 *   UNKNOWN — evaluator could not determine a score (scaffold default for all)
 *
 * AGGREGATE BANDS (overall snapshot)
 * ------------------------------------
 *   STRONG   — All active dimensions are PASS or SKIP
 *   ADEQUATE — No FAIL; some WEAK; no UNKNOWN
 *   MARGINAL — One or more WEAK or UNKNOWN; no FAIL
 *   POOR     — One or more FAIL dimensions
 *   UNKNOWN  — Snapshot not evaluated (scaffold default)
 *   FAIL_SAFE — Returned when inputs are absent, null, or malformed
 *
 * @module therapistQualityEvaluator
 */

// ─── Version ──────────────────────────────────────────────────────────────────

/**
 * Semantic version of the Quality Evaluator scaffold.
 * Increment on every breaking change to the contract (dimensions, bands, shape).
 *
 * @type {string}
 */
export const EVALUATOR_VERSION = '5A.0.0';

// ─── Quality Dimensions ───────────────────────────────────────────────────────

/**
 * All recognised quality evaluation dimensions.
 *
 * Wave 5A includes only structural/objective dimensions as the active set.
 * Softer/subjective dimensions are declared as deferred placeholders
 * (DEFERRED_ prefix) so their keys are stable for future waves.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const QUALITY_DIMENSIONS = Object.freeze({
  // ── Active dimensions (structural / objective, Wave 5A) ──────────────────

  /** Did the response align with the planned strategy mode? */
  STRATEGY_ALIGNMENT: 'strategy_alignment',

  /** Did the response respect the formulation context? */
  FORMULATION_ALIGNMENT: 'formulation_alignment',

  /** Did the response honour session-continuity signals? */
  CONTINUITY_ALIGNMENT: 'continuity_alignment',

  /** Did the response use retrieved knowledge appropriately? */
  KNOWLEDGE_ALIGNMENT: 'knowledge_alignment',

  /** Were safety signals handled consistently? */
  SAFETY_ESCALATION_CONSISTENCY: 'safety_escalation_consistency',

  /** Did the response stay within the therapist role boundary? */
  ROLE_BOUNDARY_INTEGRITY: 'role_boundary_integrity',

  /** Was the available context used (not ignored)? */
  CONTEXT_COMPLETENESS: 'context_completeness',

  // ── Deferred placeholders (not scored in Wave 5A) ────────────────────────

  /**
   * Deferred — softer/subjective dimension; not scored in Wave 5A.
   * Declared here to stabilise the key for future waves.
   */
  DEFERRED_GENERICNESS_RISK: 'genericness_risk',

  /**
   * Deferred — softer/subjective dimension; not scored in Wave 5A.
   * Declared here to stabilise the key for future waves.
   */
  DEFERRED_OVER_DIRECTIVENESS_RISK: 'over_directiveness_risk',
});

/**
 * The set of dimension keys that are actively scored in Wave 5A.
 * Deferred keys are excluded.
 *
 * @type {ReadonlyArray<string>}
 */
export const ACTIVE_QUALITY_DIMENSIONS = Object.freeze([
  QUALITY_DIMENSIONS.STRATEGY_ALIGNMENT,
  QUALITY_DIMENSIONS.FORMULATION_ALIGNMENT,
  QUALITY_DIMENSIONS.CONTINUITY_ALIGNMENT,
  QUALITY_DIMENSIONS.KNOWLEDGE_ALIGNMENT,
  QUALITY_DIMENSIONS.SAFETY_ESCALATION_CONSISTENCY,
  QUALITY_DIMENSIONS.ROLE_BOUNDARY_INTEGRITY,
  QUALITY_DIMENSIONS.CONTEXT_COMPLETENESS,
]);

// ─── Score Bands (per-dimension) ──────────────────────────────────────────────

/**
 * Allowed score bands for each evaluated dimension.
 *
 * UNKNOWN is the default for all dimensions in the Wave 5A scaffold because
 * no runtime scoring logic exists yet.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const EVALUATOR_SCORE_BANDS = Object.freeze({
  /** Dimension requirement satisfied. */
  PASS: 'pass',

  /** Dimension partially satisfied; below expected quality bar. */
  WEAK: 'weak',

  /** Dimension requirement not met. */
  FAIL: 'fail',

  /** Dimension not applicable for this session context. */
  SKIP: 'skip',

  /** Evaluator could not determine a score (scaffold default). */
  UNKNOWN: 'unknown',
});

// ─── Aggregate Bands (overall snapshot) ───────────────────────────────────────

/**
 * Allowed aggregate quality bands for the overall evaluator snapshot.
 *
 * UNKNOWN is the default for the scaffold because no runtime scoring exists.
 * FAIL_SAFE is the value returned when inputs are absent/null/malformed.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const EVALUATOR_AGGREGATE_BANDS = Object.freeze({
  /** All active dimensions are PASS or SKIP. */
  STRONG: 'strong',

  /** No FAIL; some WEAK; no UNKNOWN. */
  ADEQUATE: 'adequate',

  /** One or more WEAK or UNKNOWN; no FAIL. */
  MARGINAL: 'marginal',

  /** One or more FAIL dimensions. */
  POOR: 'poor',

  /** Snapshot not evaluated (scaffold default for valid inputs). */
  UNKNOWN: 'unknown',

  /** Returned when inputs are absent, null, or malformed. */
  FAIL_SAFE: 'fail_safe',
});

// ─── Fail-Safe Snapshot ───────────────────────────────────────────────────────

/**
 * Stable fail-safe snapshot returned when inputs to buildQualityEvaluatorSnapshot
 * are absent, null, undefined, or malformed.
 *
 * Shape contract:
 *   - evaluator_version {string}        — EVALUATOR_VERSION
 *   - aggregate_band {string}           — EVALUATOR_AGGREGATE_BANDS.FAIL_SAFE
 *   - is_fail_safe {boolean}            — true (distinguishes fail-safe from scored)
 *   - fail_safe_reason {string}         — human-readable reason
 *   - dimensions {Record<string,string>}— all active dimension keys → UNKNOWN
 *   - deferred_dimensions {string[]}    — keys of deferred (not-yet-scored) dimensions
 *   - scored_at {null}                  — no scoring occurred
 *
 * @type {Readonly<object>}
 */
export const EVALUATOR_FAIL_SAFE_SNAPSHOT = Object.freeze({
  evaluator_version: EVALUATOR_VERSION,
  aggregate_band: EVALUATOR_AGGREGATE_BANDS.FAIL_SAFE,
  is_fail_safe: true,
  fail_safe_reason: 'bad_inputs',
  dimensions: Object.freeze(
    Object.fromEntries(
      ACTIVE_QUALITY_DIMENSIONS.map((dim) => [dim, EVALUATOR_SCORE_BANDS.UNKNOWN])
    )
  ),
  deferred_dimensions: Object.freeze([
    QUALITY_DIMENSIONS.DEFERRED_GENERICNESS_RISK,
    QUALITY_DIMENSIONS.DEFERRED_OVER_DIRECTIVENESS_RISK,
  ]),
  scored_at: null,
});

// ─── Snapshot Builder ─────────────────────────────────────────────────────────

/**
 * Builds a Quality Evaluator snapshot from bounded structured inputs.
 *
 * Wave 5A scaffold: no runtime scoring logic is implemented yet.
 * All valid (non-null, non-undefined, non-empty-object) input shapes produce
 * an UNKNOWN aggregate snapshot with all dimension scores set to UNKNOWN.
 * Absent, null, undefined, or structurally empty inputs produce the fail-safe
 * snapshot (EVALUATOR_FAIL_SAFE_SNAPSHOT).
 *
 * SAFETY CONTRACT
 * ---------------
 * - Never throws. All exceptions return EVALUATOR_FAIL_SAFE_SNAPSHOT.
 * - No LLM calls, no entity access, no async, no side effects.
 * - No raw user text accepted: inputs must be pre-processed structured objects.
 * - Output is always a frozen plain object.
 *
 * INPUT CONTRACT
 * --------------
 * @param {object|null|undefined} inputs
 *   A bounded structured context object derived from session-start signals.
 *   Must be a non-null plain object with at least one recognised key to be
 *   treated as a valid (non-fail-safe) input. Raw user message text must NOT
 *   be passed as inputs; only pre-processed structured signals are accepted.
 *
 *   Recognised input keys (all optional, informational only in Wave 5A):
 *     strategyState       {object|null}  — Output of determineTherapistStrategy()
 *     formulationHints    {object|null}  — Bounded formulation context object
 *     continuitySignals   {object|null}  — Bounded continuity context signals
 *     knowledgePlan       {object|null}  — Output of planCBTKnowledgeRetrieval()
 *     safetyActive        {boolean}      — True when safety/containment is active
 *     ltsInputs           {object|null}  — Bounded LTS strategy inputs
 *
 * OUTPUT CONTRACT
 * ---------------
 * @returns {Readonly<object>} Frozen quality evaluator snapshot with shape:
 *   - evaluator_version {string}         — EVALUATOR_VERSION
 *   - aggregate_band {string}            — one of EVALUATOR_AGGREGATE_BANDS values
 *   - is_fail_safe {boolean}             — true only for fail-safe/bad-inputs path
 *   - fail_safe_reason {string|null}     — non-null only on fail-safe path
 *   - dimensions {Record<string,string>} — active dimension keys → score band
 *   - deferred_dimensions {string[]}     — deferred dimension keys (not yet scored)
 *   - scored_at {string|null}            — ISO timestamp or null (null in scaffold)
 */
export function buildQualityEvaluatorSnapshot(inputs) {
  try {
    if (!_isValidInputs(inputs)) {
      return EVALUATOR_FAIL_SAFE_SNAPSHOT;
    }

    // Wave 5A scaffold: valid inputs produce an UNKNOWN snapshot.
    // No scoring logic is implemented at this stage.
    return Object.freeze({
      evaluator_version: EVALUATOR_VERSION,
      aggregate_band: EVALUATOR_AGGREGATE_BANDS.UNKNOWN,
      is_fail_safe: false,
      fail_safe_reason: null,
      dimensions: Object.freeze(
        Object.fromEntries(
          ACTIVE_QUALITY_DIMENSIONS.map((dim) => [dim, EVALUATOR_SCORE_BANDS.UNKNOWN])
        )
      ),
      deferred_dimensions: Object.freeze([
        QUALITY_DIMENSIONS.DEFERRED_GENERICNESS_RISK,
        QUALITY_DIMENSIONS.DEFERRED_OVER_DIRECTIVENESS_RISK,
      ]),
      scored_at: null,
    });
  } catch (_err) {
    return EVALUATOR_FAIL_SAFE_SNAPSHOT;
  }
}

// ─── Internal Helpers ─────────────────────────────────────────────────────────

/**
 * Returns true when `inputs` is a non-null plain object with at least one
 * own key. Rejects null, undefined, non-objects, and empty objects ({}).
 *
 * Empty objects are treated as fail-safe because they carry no context;
 * a snapshot built from zero signals is indistinguishable from no call at all.
 *
 * @param {*} inputs
 * @returns {boolean}
 */
function _isValidInputs(inputs) {
  if (inputs === null || inputs === undefined) return false;
  if (typeof inputs !== 'object' || Array.isArray(inputs)) return false;
  if (Object.keys(inputs).length === 0) return false;
  return true;
}

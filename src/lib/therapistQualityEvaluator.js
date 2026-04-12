/**
 * @file src/lib/therapistQualityEvaluator.js
 *
 * Therapist Upgrade — Wave 5A / Wave 5B — Quality Evaluator (Scaffold + Feature Extractor)
 *
 * PURPOSE
 * -------
 * Wave 5A: Pure deterministic scaffold that defines the Quality Evaluator contract:
 * dimensions, score bands, aggregate bands, fail-safe snapshot shape, and the
 * buildQualityEvaluatorSnapshot() factory.
 *
 * Wave 5B: Adds extractEvaluatorFeatures(inputs), a pure deterministic feature
 * extractor that normalises structured session-start signals into a stable
 * evaluator input contract for each active quality dimension.  No scoring logic
 * is applied in Wave 5B.  The extractor is inert: it is not called from any
 * runtime path and emits no diagnostics.
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
 * NOT WIRED YET (Wave 5A / Wave 5B)
 * ----------------------------------
 * - Not called from Chat.jsx.
 * - Not called from workflowContextInjector.js.
 * - Not emitting diagnostics.
 * - Not gated by QUALITY_EVALUATOR_FLAGS at runtime (flag added in featureFlags.js
 *   but this file does not import it; the scaffold is callable in isolation).
 * - Wave 5B extractEvaluatorFeatures() is inert: no runtime call site, no
 *   diagnostics emission, no rollout gating.  Real scoring belongs to Wave 5C.
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
export const EVALUATOR_VERSION = '5B.0.0';

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

// ─── Wave 5B — Feature Extractor ─────────────────────────────────────────────

/**
 * Stable fail-safe feature set returned by extractEvaluatorFeatures() when
 * inputs are absent, null, undefined, malformed, or carry no recognisable keys.
 *
 * Every dimension entry is present with canonical absent/unknown defaults so
 * that downstream Wave 5C scoring can always expect a complete, fixed shape.
 *
 * Shape:
 *   extractor_version          {string}  — EVALUATOR_VERSION
 *   is_fail_safe               {boolean} — true (distinguishes fail-safe from valid)
 *   fail_safe_reason           {string}  — human-readable reason token
 *   strategy_alignment         {object}  — strategy dimension features
 *   formulation_alignment      {object}  — formulation dimension features
 *   continuity_alignment       {object}  — continuity dimension features
 *   knowledge_alignment        {object}  — knowledge retrieval dimension features
 *   safety_escalation_consistency {object} — safety/distress dimension features
 *   role_boundary_integrity    {object}  — wiring/role dimension features
 *   context_completeness       {object}  — overall context availability features
 *
 * @type {Readonly<object>}
 */
export const EVALUATOR_FEATURES_FAIL_SAFE = Object.freeze({
  extractor_version: EVALUATOR_VERSION,
  is_fail_safe: true,
  fail_safe_reason: 'bad_inputs',
  strategy_alignment: Object.freeze({
    strategy_present: false,
    intervention_mode: '',
    distress_tier: '',
    strategy_is_fail_safe: true,
    lts_present: false,
    lts_trajectory: '',
    lts_is_stagnating: false,
    lts_is_progressing: false,
    lts_is_fluctuating: false,
    lts_has_risk_history: false,
    lts_has_stalled_interventions: false,
  }),
  formulation_alignment: Object.freeze({
    formulation_present: false,
    formulation_score: 0,
    has_formulation_hints: false,
    formulation_domain: '',
    formulation_treatment_phase: '',
    formulation_is_ambiguous: false,
  }),
  continuity_alignment: Object.freeze({
    continuity_present: false,
    continuity_richness_score: 0,
    session_count: 0,
    has_open_tasks: false,
    has_risk_flags: false,
    intervention_saturated: false,
  }),
  knowledge_alignment: Object.freeze({
    knowledge_plan_present: false,
    should_retrieve: false,
    skip_reason: '',
    domain_hint: '',
    lts_influenced_arc: false,
  }),
  safety_escalation_consistency: Object.freeze({
    safety_active: false,
    distress_tier: '',
  }),
  role_boundary_integrity: Object.freeze({
    wiring_name: '',
    wiring_stage2: false,
    wiring_stage2_phase: 0,
    wiring_strategy_layer_enabled: false,
    wiring_formulation_context_enabled: false,
    wiring_continuity_layer_enabled: false,
    wiring_safety_mode_enabled: false,
  }),
  context_completeness: Object.freeze({
    has_strategy: false,
    has_lts: false,
    has_formulation: false,
    has_continuity: false,
    has_knowledge_plan: false,
    has_safety_result: false,
    has_wiring_identity: false,
    dimensions_present_count: 0,
  }),
});

/**
 * Extracts a normalised, bounded feature set from structured session-start
 * signals for the Quality Evaluator.
 *
 * Wave 5B — Feature Extraction Layer.
 *
 * PURPOSE
 * -------
 * Accepts the same bounded structured signals that the session-start pipeline
 * already produces and normalises them into a stable, dimension-keyed feature
 * object.  Each dimension entry captures exactly the structural metadata
 * required by Wave 5C scoring — no more, no less.
 *
 * ISOLATION GUARANTEE
 * -------------------
 * This function has zero side effects, no LLM calls, no entity access, and is
 * fully synchronous.  It never throws.  It is inert at runtime — not called
 * from any live code path as of Wave 5B.
 *
 * SAFETY CONTRACT
 * ---------------
 * - Never throws. All exceptions return EVALUATOR_FEATURES_FAIL_SAFE.
 * - No raw user message text accepted or preserved.
 * - No LLM calls, no entity access, no async, no side effects.
 * - Deterministic: same inputs always produce an identical output.
 * - Fail-safe defaults for every absent or malformed field.
 * - Output is always a frozen plain object with a fixed shape.
 * - No user-visible output.
 * - No control path over any runtime behaviour.
 *
 * INPUT CONTRACT
 * --------------
 * @param {object|null|undefined} inputs
 *   Bounded structured signals derived from session-start processing.
 *   Raw user message text must NOT be passed.
 *
 *   Recognised input keys (all optional):
 *     strategyState    {object|null}  — TherapistStrategyState (therapistStrategyEngine.js)
 *     ltsInputs        {object|null}  — LTSStrategyInputs (extractLTSStrategyInputs output)
 *     formulationHints {object|null}  — Bounded formulation hints (extractFormulationHintsForPlanner output)
 *     formulationScore {number|null}  — formulation_strength_score from strategyState (0–1 range)
 *     continuityRichness {number|null} — continuity_richness_score from strategyState (0–1 range)
 *     knowledgePlan    {object|null}  — CBTKnowledgePlan (planCBTKnowledgeRetrieval output)
 *     safetyResult     {object|null}  — SafetyModeResult (determineSafetyMode output)
 *     distressTier     {string|null}  — One of DISTRESS_TIERS values
 *     wiringIdentity   {object|null}  — Active wiring config identity (name/stage/flags only)
 *
 * OUTPUT CONTRACT
 * ---------------
 * @returns {Readonly<object>} Frozen feature set with shape matching
 *   EVALUATOR_FEATURES_FAIL_SAFE, plus:
 *   - is_fail_safe: false for valid inputs
 *   - fail_safe_reason: null for valid inputs
 *   - One entry per active quality dimension key (see QUALITY_DIMENSIONS)
 */
export function extractEvaluatorFeatures(inputs) {
  try {
    if (!_isValidInputs(inputs)) {
      return EVALUATOR_FEATURES_FAIL_SAFE;
    }

    const strategyAlignment = _extractStrategyAlignmentFeatures(inputs);
    const formulationAlignment = _extractFormulationAlignmentFeatures(inputs);
    const continuityAlignment = _extractContinuityAlignmentFeatures(inputs);
    const knowledgeAlignment = _extractKnowledgeAlignmentFeatures(inputs);
    const safetyEscalationConsistency = _extractSafetyEscalationFeatures(inputs);
    const roleBoundaryIntegrity = _extractRoleBoundaryFeatures(inputs);

    const hasStrategy = strategyAlignment.strategy_present;
    const hasLts = strategyAlignment.lts_present;
    const hasFormulation = formulationAlignment.formulation_present || formulationAlignment.has_formulation_hints;
    const hasContinuity = continuityAlignment.continuity_present;
    const hasKnowledgePlan = knowledgeAlignment.knowledge_plan_present;
    const hasSafetyResult = !!(
      inputs.safetyResult &&
      typeof inputs.safetyResult === 'object'
    );
    const hasWiringIdentity = roleBoundaryIntegrity.wiring_name !== '';

    const dimensionsPresentCount = [
      hasStrategy,
      hasLts,
      hasFormulation,
      hasContinuity,
      hasKnowledgePlan,
      hasSafetyResult,
      hasWiringIdentity,
    ].filter(Boolean).length;

    const contextCompleteness = Object.freeze({
      has_strategy: hasStrategy,
      has_lts: hasLts,
      has_formulation: hasFormulation,
      has_continuity: hasContinuity,
      has_knowledge_plan: hasKnowledgePlan,
      has_safety_result: hasSafetyResult,
      has_wiring_identity: hasWiringIdentity,
      dimensions_present_count: dimensionsPresentCount,
    });

    return Object.freeze({
      extractor_version: EVALUATOR_VERSION,
      is_fail_safe: false,
      fail_safe_reason: null,
      strategy_alignment: strategyAlignment,
      formulation_alignment: formulationAlignment,
      continuity_alignment: continuityAlignment,
      knowledge_alignment: knowledgeAlignment,
      safety_escalation_consistency: safetyEscalationConsistency,
      role_boundary_integrity: roleBoundaryIntegrity,
      context_completeness: contextCompleteness,
    });
  } catch (_err) {
    return EVALUATOR_FEATURES_FAIL_SAFE;
  }
}

// ─── Wave 5D — Evaluator Diagnostic Snapshot ─────────────────────────────────

/**
 * Computes a bounded diagnostic payload for the Quality Evaluator.
 *
 * Wave 5D — Evaluator Diagnostics Integration.
 *
 * PURPOSE
 * -------
 * Wraps extractEvaluatorFeatures() + buildQualityEvaluatorSnapshot() into a
 * single diagnostic call that emits only the approved bounded fields listed
 * in the Wave 5D spec.  Never emits raw user text, raw assistant text, or
 * private entity content.
 *
 * SAFETY CONTRACT
 * ---------------
 * - Never throws. All exceptions return a fail-safe diagnostic payload.
 * - No raw user message text accepted or preserved.
 * - No LLM calls, no entity access, no async, no side effects.
 * - Deterministic: same inputs always produce an identical output.
 * - Output is always a frozen plain object.
 * - DIAGNOSTIC USE ONLY: must only be called from _s2debug-gated paths.
 *   Must never influence session content, routing, or user-visible output.
 *
 * EMITTED FIELDS (approved by Wave 5D spec)
 * ------------------------------------------
 * - evaluator_version    {string}   — EVALUATOR_VERSION
 * - active_dimensions    {string[]} — ACTIVE_QUALITY_DIMENSIONS (frozen copy)
 * - dimensions           {object}   — per-dimension score band map
 * - aggregate_band       {string}   — overall quality band
 * - risk_flags           {object}   — safety_active, distress_tier,
 *                                     has_risk_flags, lts_has_risk_history
 * - fail_safe            {boolean}  — true when snapshot is in fail-safe state
 * - agent_role           {string}   — wiring_name from normalized features (or '')
 * - wiring_version       {number}   — wiring_stage2_phase from features (or 0)
 *
 * @param {object|null|undefined} inputs
 *   Bounded structured signals derived from session-start processing.
 *   Same input contract as extractEvaluatorFeatures(). Raw text must NOT
 *   be passed.
 * @returns {Readonly<object>} Frozen diagnostic payload with the approved fields.
 */
export function computeEvaluatorDiagnosticSnapshot(inputs) {
  try {
    const features = extractEvaluatorFeatures(inputs);
    const snapshot = buildQualityEvaluatorSnapshot(inputs);

    return Object.freeze({
      evaluator_version: snapshot.evaluator_version,
      active_dimensions: Object.freeze(ACTIVE_QUALITY_DIMENSIONS.slice()),
      dimensions: snapshot.dimensions,
      aggregate_band: snapshot.is_fail_safe
        ? EVALUATOR_AGGREGATE_BANDS.FAIL_SAFE
        : EVALUATOR_AGGREGATE_BANDS.UNKNOWN,
      risk_flags: Object.freeze({
        safety_active: features.safety_escalation_consistency.safety_active,
        distress_tier: features.safety_escalation_consistency.distress_tier,
        has_risk_flags: features.continuity_alignment.has_risk_flags,
        lts_has_risk_history: features.strategy_alignment.lts_has_risk_history,
      }),
      fail_safe: snapshot.is_fail_safe,
      agent_role: features.role_boundary_integrity.wiring_name,
      wiring_version: features.role_boundary_integrity.wiring_stage2_phase,
    });
  } catch (_err) {
    return Object.freeze({
      evaluator_version: EVALUATOR_VERSION,
      active_dimensions: Object.freeze(ACTIVE_QUALITY_DIMENSIONS.slice()),
      dimensions: EVALUATOR_FAIL_SAFE_SNAPSHOT.dimensions,
      aggregate_band: EVALUATOR_AGGREGATE_BANDS.FAIL_SAFE,
      risk_flags: Object.freeze({
        safety_active: false,
        distress_tier: '',
        has_risk_flags: false,
        lts_has_risk_history: false,
      }),
      fail_safe: true,
      agent_role: '',
      wiring_version: 0,
    });
  }
}

// ─── Wave 5B — Internal Feature Extractors ────────────────────────────────────

/**
 * Extracts strategy alignment features from strategyState and ltsInputs.
 *
 * @private
 * @param {object} inputs
 * @returns {Readonly<object>}
 */
function _extractStrategyAlignmentFeatures(inputs) {
  try {
    const ss = inputs.strategyState && typeof inputs.strategyState === 'object'
      ? inputs.strategyState
      : null;
    const li = inputs.ltsInputs && typeof inputs.ltsInputs === 'object'
      ? inputs.ltsInputs
      : null;

    if (!ss) {
      return EVALUATOR_FEATURES_FAIL_SAFE.strategy_alignment;
    }

    const ltsPresent = !!(li && li.lts_valid === true);

    return Object.freeze({
      strategy_present: true,
      intervention_mode: typeof ss.intervention_mode === 'string' ? ss.intervention_mode : '',
      distress_tier: typeof ss.distress_tier === 'string' ? ss.distress_tier : '',
      strategy_is_fail_safe: ss.fail_safe === true,
      lts_present: ltsPresent,
      lts_trajectory: ltsPresent && typeof li.lts_trajectory === 'string' ? li.lts_trajectory : '',
      lts_is_stagnating: ltsPresent && li.lts_is_stagnating === true,
      lts_is_progressing: ltsPresent && li.lts_is_progressing === true,
      lts_is_fluctuating: ltsPresent && li.lts_is_fluctuating === true,
      lts_has_risk_history: ltsPresent && li.lts_has_risk_history === true,
      lts_has_stalled_interventions: ltsPresent && li.lts_has_stalled_interventions === true,
    });
  } catch (_e) {
    return EVALUATOR_FEATURES_FAIL_SAFE.strategy_alignment;
  }
}

/**
 * Extracts formulation alignment features from formulationHints and formulationScore.
 *
 * @private
 * @param {object} inputs
 * @returns {Readonly<object>}
 */
function _extractFormulationAlignmentFeatures(inputs) {
  try {
    const ss = inputs.strategyState && typeof inputs.strategyState === 'object'
      ? inputs.strategyState
      : null;
    const fh = inputs.formulationHints && typeof inputs.formulationHints === 'object'
      ? inputs.formulationHints
      : null;

    const formulationPresentFromStrategy = !!(ss && ss.formulation_present === true);
    const formulationScore = typeof inputs.formulationScore === 'number'
      ? inputs.formulationScore
      : (ss && typeof ss.formulation_strength_score === 'number'
          ? ss.formulation_strength_score
          : 0);

    const hasFormulationHints = !!(fh && fh.has_formulation === true);

    return Object.freeze({
      formulation_present: formulationPresentFromStrategy || hasFormulationHints,
      formulation_score: formulationScore,
      has_formulation_hints: hasFormulationHints,
      formulation_domain: fh && typeof fh.domain === 'string' ? fh.domain : '',
      formulation_treatment_phase: fh && typeof fh.treatment_phase === 'string' ? fh.treatment_phase : '',
      formulation_is_ambiguous: !!(fh && fh.is_ambiguous === true),
    });
  } catch (_e) {
    return EVALUATOR_FEATURES_FAIL_SAFE.formulation_alignment;
  }
}

/**
 * Extracts continuity alignment features from strategyState and continuityRichness.
 *
 * @private
 * @param {object} inputs
 * @returns {Readonly<object>}
 */
function _extractContinuityAlignmentFeatures(inputs) {
  try {
    const ss = inputs.strategyState && typeof inputs.strategyState === 'object'
      ? inputs.strategyState
      : null;

    if (!ss) {
      return EVALUATOR_FEATURES_FAIL_SAFE.continuity_alignment;
    }

    const continuityRichness = typeof inputs.continuityRichness === 'number'
      ? inputs.continuityRichness
      : (typeof ss.continuity_richness_score === 'number'
          ? ss.continuity_richness_score
          : 0);

    return Object.freeze({
      continuity_present: ss.continuity_present === true,
      continuity_richness_score: continuityRichness,
      session_count: typeof ss.session_count === 'number' ? ss.session_count : 0,
      has_open_tasks: ss.has_open_tasks === true,
      has_risk_flags: ss.has_risk_flags === true,
      intervention_saturated: ss.intervention_saturated === true,
    });
  } catch (_e) {
    return EVALUATOR_FEATURES_FAIL_SAFE.continuity_alignment;
  }
}

/**
 * Extracts knowledge alignment features from knowledgePlan.
 *
 * @private
 * @param {object} inputs
 * @returns {Readonly<object>}
 */
function _extractKnowledgeAlignmentFeatures(inputs) {
  try {
    const kp = inputs.knowledgePlan && typeof inputs.knowledgePlan === 'object'
      ? inputs.knowledgePlan
      : null;

    if (!kp) {
      return EVALUATOR_FEATURES_FAIL_SAFE.knowledge_alignment;
    }

    return Object.freeze({
      knowledge_plan_present: true,
      should_retrieve: kp.shouldRetrieve === true,
      skip_reason: typeof kp.skipReason === 'string' ? kp.skipReason : '',
      domain_hint: typeof kp.domainHint === 'string' ? kp.domainHint : '',
      lts_influenced_arc: kp.ltsInfluencedArc === true,
    });
  } catch (_e) {
    return EVALUATOR_FEATURES_FAIL_SAFE.knowledge_alignment;
  }
}

/**
 * Extracts safety escalation consistency features from safetyResult and distressTier.
 *
 * @private
 * @param {object} inputs
 * @returns {Readonly<object>}
 */
function _extractSafetyEscalationFeatures(inputs) {
  try {
    const sr = inputs.safetyResult && typeof inputs.safetyResult === 'object'
      ? inputs.safetyResult
      : null;

    const safetyActive = !!(sr && sr.safety_mode === true);

    // distressTier: explicit override > from safetyResult inference > strategyState > ''
    let distressTier = '';
    if (typeof inputs.distressTier === 'string' && inputs.distressTier) {
      distressTier = inputs.distressTier;
    } else if (
      inputs.strategyState &&
      typeof inputs.strategyState === 'object' &&
      typeof inputs.strategyState.distress_tier === 'string'
    ) {
      distressTier = inputs.strategyState.distress_tier;
    } else if (safetyActive) {
      distressTier = 'tier_high';
    }

    return Object.freeze({
      safety_active: safetyActive,
      distress_tier: distressTier,
    });
  } catch (_e) {
    return EVALUATOR_FEATURES_FAIL_SAFE.safety_escalation_consistency;
  }
}

/**
 * Extracts role boundary integrity features from wiringIdentity.
 *
 * Only safe metadata fields are extracted (name, stage flags).
 * No entity lists, no tool_configs arrays, no raw wiring content.
 *
 * @private
 * @param {object} inputs
 * @returns {Readonly<object>}
 */
function _extractRoleBoundaryFeatures(inputs) {
  try {
    const wi = inputs.wiringIdentity && typeof inputs.wiringIdentity === 'object'
      ? inputs.wiringIdentity
      : null;

    if (!wi) {
      return EVALUATOR_FEATURES_FAIL_SAFE.role_boundary_integrity;
    }

    return Object.freeze({
      wiring_name: typeof wi.name === 'string' ? wi.name : '',
      wiring_stage2: wi.stage2 === true,
      wiring_stage2_phase: typeof wi.stage2_phase === 'number' ? wi.stage2_phase : 0,
      wiring_strategy_layer_enabled: wi.strategy_layer_enabled === true,
      wiring_formulation_context_enabled: wi.formulation_context_enabled === true,
      wiring_continuity_layer_enabled: wi.continuity_layer_enabled === true,
      wiring_safety_mode_enabled: wi.safety_mode_enabled === true,
    });
  } catch (_e) {
    return EVALUATOR_FEATURES_FAIL_SAFE.role_boundary_integrity;
  }
}

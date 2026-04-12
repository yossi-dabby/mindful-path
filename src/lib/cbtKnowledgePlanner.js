/**
 * @file src/lib/cbtKnowledgePlanner.js
 *
 * Therapist Upgrade — Wave 4A.1 — CBT Knowledge Planner (Scaffold)
 *
 * PURPOSE
 * -------
 * Pure deterministic planner that decides whether CBT knowledge retrieval
 * should happen and what bounded retrieval plan should be used.
 * No LLM calls, no entity access, no async work, no side effects.
 * All outputs are derived exclusively from the explicit input arguments.
 *
 * ISOLATION GUARANTEE
 * -------------------
 * This module has NO imports from any other app module.  It does NOT import
 * from agentWiring, activeAgentWiring, featureFlags, workflowContextInjector,
 * or any entity definition.  It is a standalone, self-contained pure library.
 *
 * This module is NOT wired into any runtime session path in this PR.
 * No Chat.jsx, no buildV*SessionStartContentAsync, no agent wiring changes.
 * Activation is gated by VITE_THERAPIST_UPGRADE_KNOWLEDGE_ENABLED (Wave 4A flag)
 * which defaults to false.  This file may be safely imported by tests in the
 * current state without affecting any live behavior.
 *
 * SAFETY CONTRACT
 * ---------------
 * - Flag off → always return the fail-safe plan (shouldRetrieve: false).
 * - Absent, null, or malformed inputs → fail-safe defaults (bias toward skip).
 * - Safety mode / containment active → ALWAYS skip; knowledge never outranks it.
 * - TIER_HIGH or TIER_MODERATE distress → always skip.
 * - No domain inferrable → skip.
 * - Ambiguous formulation hints → skip.
 * - Strategy mode is not exploration/deepening → skip.
 * - No raw message text is accepted, analysed, or passed through.
 * - All outputs are frozen plain objects.  No mutation after creation.
 * - All public functions never throw — they catch all exceptions and return
 *   the fail-safe plan.
 *
 * PRECEDENCE (highest to lowest — lower levels never override higher)
 * -------------------------------------------------------------------
 *   1. Feature flag   — if off, always inert
 *   2. Safety/containment — always dominates
 *   3. Distress tier  — HIGH/MODERATE → skip
 *   4. Strategy mode  — must be exploration or deepening
 *   5. Formulation hints — ambiguous → skip; no domain → skip
 *   6. LTS inputs     — inform arc/unit preference only (never promote retrieval)
 *   7. Knowledge plan — only reached when all above gates pass
 *
 * INPUTS (all bounded, structured; no raw message text accepted)
 * --------------------------------------------------------------
 * @typedef {Object} CBTKnowledgePlannerInputs
 * @property {boolean}  flagEnabled       - True only when VITE_THERAPIST_UPGRADE_KNOWLEDGE_ENABLED=true.
 * @property {object|null} strategyState  - Output of determineTherapistStrategy() from therapistStrategyEngine.js.
 *   Expected fields used: intervention_mode (string), distress_tier (string), safety_mode_active (boolean).
 * @property {object|null} ltsInputs      - Bounded LTS strategy inputs from extractLTSStrategyInputs().
 *   Expected fields used: lts_valid (boolean), lts_session_count (number), lts_trajectory (string),
 *   lts_is_progressing (boolean).
 * @property {object|null} formulationHints - Bounded plain object derived from CaseFormulation context.
 *   NOT the raw CaseFormulation entity.  Accepted fields:
 *     domain (string)          — CBT domain if known; empty string if not.
 *     treatment_phase (string) — 'early' | 'middle' | 'late' | 'unknown' | ''.
 *     has_formulation (boolean)— whether a CaseFormulation exists.
 *     is_ambiguous (boolean)   — if true, bias toward skip.
 * @property {string|null}  distressTier  - One of DISTRESS_TIERS values from therapistStrategyEngine.js.
 *   When absent or invalid, falls back to strategyState.distress_tier, then to TIER_LOW.
 * @property {boolean}      safetyActive  - Explicit safety/containment override flag.
 *
 * OUTPUTS
 * -------
 * @typedef {Object} CBTKnowledgePlan
 * @property {boolean} shouldRetrieve       - True when retrieval is appropriate; false otherwise.
 * @property {string}  skipReason           - One of CBT_KNOWLEDGE_SKIP_REASONS, or '' when shouldRetrieve is true.
 * @property {string}  domainHint           - One of CBT_KNOWLEDGE_DOMAINS, or '' when no retrieval.
 * @property {string}  unitTypePreference   - One of CBT_UNIT_TYPE_PREFERENCES.
 * @property {string}  distressFilter       - One of CBT_DISTRESS_FILTERS.
 * @property {string}  treatmentArcFilter   - One of CBT_TREATMENT_ARC_FILTERS.
 *
 * Source of truth: Wave 4A.1 problem statement (CBT Knowledge Planner scaffold)
 */

// ─── Version ──────────────────────────────────────────────────────────────────

/**
 * Version of the CBT knowledge planner.
 * Bump minor when output contract fields change; bump patch for rule adjustments.
 *
 * @type {string}
 */
export const CBT_KNOWLEDGE_PLANNER_VERSION = '1.0.0';

// ─── CBT knowledge domains ───────────────────────────────────────────────────

/**
 * Approved bounded set of CBT knowledge domains.
 *
 * These represent the clinical focus areas that the knowledge retrieval system
 * may target.  The set is intentionally fixed to prevent scope creep.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const CBT_KNOWLEDGE_DOMAINS = Object.freeze({
  ANXIETY: 'anxiety',
  DEPRESSION: 'depression',
  TRAUMA: 'trauma',
  ANGER: 'anger',
  RELATIONSHIP: 'relationship',
  OCD: 'ocd',
  GRIEF: 'grief',
  SELF_ESTEEM: 'self_esteem',
  PANIC: 'panic',
  SOCIAL_ANXIETY: 'social_anxiety',
  PHOBIA: 'phobia',
  GENERAL: 'general',
});

// ─── Skip reasons ─────────────────────────────────────────────────────────────

/**
 * Approved bounded set of skip reasons for the CBT knowledge planner.
 *
 * A skip reason is always present when shouldRetrieve is false.
 * The empty string ('') is used only when shouldRetrieve is true.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const CBT_KNOWLEDGE_SKIP_REASONS = Object.freeze({
  /** No skip — retrieval is planned. */
  NONE: '',
  /** Feature flag VITE_THERAPIST_UPGRADE_KNOWLEDGE_ENABLED is off. */
  FLAG_OFF: 'flag_off',
  /** Safety mode or containment intervention is active — always dominates. */
  CONTAINMENT: 'containment',
  /** Distress tier is HIGH — retrieval would be clinically inappropriate. */
  HIGH_DISTRESS: 'high_distress',
  /** Distress tier is MODERATE — retrieval would be clinically premature. */
  MODERATE_DISTRESS: 'moderate_distress',
  /** Strategy mode does not warrant retrieval (stabilisation, psychoeducation, etc.). */
  STRATEGY_INERT: 'strategy_inert',
  /** No domain can be inferred from available formulation hints. */
  NO_DOMAIN: 'no_domain',
  /** Formulation hints are ambiguous or insufficiently structured. */
  AMBIGUOUS_FORMULATION: 'ambiguous_formulation',
  /** Inputs are absent, null, or fundamentally malformed. */
  BAD_INPUTS: 'bad_inputs',
});

// ─── Unit type preferences ────────────────────────────────────────────────────

/**
 * Approved bounded set of CBT unit type preferences.
 *
 * These guide which type of knowledge unit is preferred for retrieval.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const CBT_UNIT_TYPE_PREFERENCES = Object.freeze({
  /** No preference — retrieve any suitable unit type. */
  ANY: 'any',
  /** Prefer introductory psychoeducation content (early arc / first sessions). */
  PSYCHOEDUCATION: 'psychoeducation',
  /** Prefer specific CBT techniques and skill-building content. */
  TECHNIQUE: 'technique',
  /** Prefer structured worksheets and practice exercises. */
  WORKSHEET: 'worksheet',
  /** Prefer illustrative case examples. */
  CASE_EXAMPLE: 'case_example',
});

// ─── Treatment arc filters ────────────────────────────────────────────────────

/**
 * Approved bounded set of treatment arc filters.
 *
 * These constrain retrieval to content appropriate for the user's current
 * position in the therapeutic journey.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const CBT_TREATMENT_ARC_FILTERS = Object.freeze({
  /** No arc constraint — retrieve content appropriate for any treatment stage. */
  ANY: 'any',
  /** Early arc — establishing rapport, psychoeducation, thought record basics. */
  EARLY: 'early',
  /** Middle arc — applying techniques, cognitive restructuring, skill practice. */
  MIDDLE: 'middle',
  /** Late arc — consolidation, relapse prevention, generalisation. */
  LATE: 'late',
});

// ─── Distress filters ─────────────────────────────────────────────────────────

/**
 * Approved bounded set of distress filters for retrieval.
 *
 * These constrain retrieval to content appropriate for the user's current
 * distress level.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const CBT_DISTRESS_FILTERS = Object.freeze({
  /** No distress filter — do not apply distress-level constraints. */
  NONE: 'none',
  /** Only retrieve content appropriate for low-distress engagement. */
  LOW_DISTRESS_ONLY: 'low_distress_only',
  /** Retrieve content appropriate for any distress level. */
  ANY: 'any',
});

// ─── Fail-safe plan ───────────────────────────────────────────────────────────

/**
 * Fail-safe CBT knowledge plan.
 *
 * Returned by planCBTKnowledgeRetrieval() when inputs are absent, null,
 * fundamentally malformed, or when an unexpected error is caught.
 *
 * shouldRetrieve is always false — this is the maximally conservative output.
 *
 * @type {Readonly<CBTKnowledgePlan>}
 */
export const CBT_KNOWLEDGE_PLAN_FAIL_SAFE = Object.freeze({
  shouldRetrieve: false,
  skipReason: CBT_KNOWLEDGE_SKIP_REASONS.BAD_INPUTS,
  domainHint: '',
  unitTypePreference: CBT_UNIT_TYPE_PREFERENCES.ANY,
  distressFilter: CBT_DISTRESS_FILTERS.NONE,
  treatmentArcFilter: CBT_TREATMENT_ARC_FILTERS.ANY,
});

// ─── Inlined mirror constants ─────────────────────────────────────────────────
//
// These mirror values from therapistStrategyEngine.js so that this module
// retains its zero-import isolation guarantee.  If the upstream constants
// change, these must be updated to match.
//
// Canonical source: src/lib/therapistStrategyEngine.js
//   DISTRESS_TIERS.*             → _TIER_* constants below
//   STRATEGY_INTERVENTION_MODES.*→ _MODE_* constants below

/** @private — mirrors DISTRESS_TIERS.TIER_LOW */
const _TIER_LOW = 'tier_low';
/** @private — mirrors DISTRESS_TIERS.TIER_MILD */
const _TIER_MILD = 'tier_mild';
/** @private — mirrors DISTRESS_TIERS.TIER_MODERATE */
const _TIER_MODERATE = 'tier_moderate';
/** @private — mirrors DISTRESS_TIERS.TIER_HIGH */
const _TIER_HIGH = 'tier_high';

/** @private — mirrors STRATEGY_INTERVENTION_MODES.CONTAINMENT */
const _MODE_CONTAINMENT = 'containment';
/** @private — mirrors STRATEGY_INTERVENTION_MODES.STRUCTURED_EXPLORATION */
const _MODE_STRUCTURED_EXPLORATION = 'structured_exploration';
/** @private — mirrors STRATEGY_INTERVENTION_MODES.FORMULATION_DEEPENING */
const _MODE_FORMULATION_DEEPENING = 'formulation_deepening';

/**
 * Set of intervention modes that permit knowledge retrieval.
 * All other modes → STRATEGY_INERT skip reason.
 *
 * @private
 * @type {ReadonlySet<string>}
 */
const _RETRIEVAL_ALLOWED_MODES = Object.freeze(
  new Set([_MODE_STRUCTURED_EXPLORATION, _MODE_FORMULATION_DEEPENING])
);

/**
 * Minimum LTS session count to infer a 'late' treatment arc from LTS alone
 * (when no explicit treatment_phase is provided in formulationHints).
 *
 * @private
 * @type {number}
 */
const _LTS_LATE_ARC_SESSION_THRESHOLD = 6;

/**
 * Minimum LTS session count to infer a 'middle' treatment arc from LTS alone.
 *
 * @private
 * @type {number}
 */
const _LTS_MIDDLE_ARC_SESSION_THRESHOLD = 3;

// ─── Private helpers ──────────────────────────────────────────────────────────

/**
 * Constructs a frozen CBTKnowledgePlan object.
 *
 * @private
 * @param {boolean} shouldRetrieve
 * @param {string}  skipReason
 * @param {string}  domainHint
 * @param {string}  unitTypePreference
 * @param {string}  distressFilter
 * @param {string}  treatmentArcFilter
 * @returns {Readonly<CBTKnowledgePlan>}
 */
function _makePlan(
  shouldRetrieve,
  skipReason,
  domainHint,
  unitTypePreference,
  distressFilter,
  treatmentArcFilter
) {
  return Object.freeze({
    shouldRetrieve,
    skipReason,
    domainHint,
    unitTypePreference,
    distressFilter,
    treatmentArcFilter,
  });
}

/**
 * Returns a skip plan (shouldRetrieve: false) with the given reason and safe
 * default values for all other fields.
 *
 * @private
 * @param {string} skipReason
 * @returns {Readonly<CBTKnowledgePlan>}
 */
function _skipPlan(skipReason) {
  return _makePlan(
    false,
    skipReason,
    '',
    CBT_UNIT_TYPE_PREFERENCES.ANY,
    CBT_DISTRESS_FILTERS.NONE,
    CBT_TREATMENT_ARC_FILTERS.ANY
  );
}

/**
 * Derives the distress filter from the effective distress tier.
 *
 * Only TIER_LOW and TIER_MILD reach this function (MODERATE and HIGH are
 * intercepted earlier and result in a skip plan).
 *
 * @private
 * @param {string} tier
 * @returns {string}
 */
function _deriveDistressFilter(tier) {
  if (tier === _TIER_LOW) return CBT_DISTRESS_FILTERS.ANY;
  if (tier === _TIER_MILD) return CBT_DISTRESS_FILTERS.LOW_DISTRESS_ONLY;
  return CBT_DISTRESS_FILTERS.NONE;
}

/**
 * Derives the treatment arc filter from formulation hints and LTS inputs.
 *
 * Priority:
 *   1. Explicit treatment_phase in formulationHints ('early'|'middle'|'late').
 *   2. LTS-inferred arc (progressing + high session count → 'late';
 *      session count above middle threshold → 'middle').
 *   3. Default: 'any'.
 *
 * LTS inputs may only narrow the arc (i.e., they cannot promote retrieval;
 * that decision was made upstream).
 *
 * @private
 * @param {object} hints   - Normalised formulationHints (never null here).
 * @param {object|null} ltsInputs
 * @returns {string}
 */
function _deriveTreatmentArcFilter(hints, ltsInputs) {
  // Formulation hints take the highest priority.
  const phase = typeof hints.treatment_phase === 'string'
    ? hints.treatment_phase.trim()
    : '';
  if (
    phase === CBT_TREATMENT_ARC_FILTERS.EARLY ||
    phase === CBT_TREATMENT_ARC_FILTERS.MIDDLE ||
    phase === CBT_TREATMENT_ARC_FILTERS.LATE
  ) {
    return phase;
  }

  // Infer from LTS when available.
  const lts = ltsInputs && typeof ltsInputs === 'object' ? ltsInputs : null;
  if (lts && lts.lts_valid === true) {
    const sessionCount =
      typeof lts.lts_session_count === 'number' ? lts.lts_session_count : 0;
    if (lts.lts_is_progressing && sessionCount >= _LTS_LATE_ARC_SESSION_THRESHOLD) {
      return CBT_TREATMENT_ARC_FILTERS.LATE;
    }
    if (sessionCount >= _LTS_MIDDLE_ARC_SESSION_THRESHOLD) {
      return CBT_TREATMENT_ARC_FILTERS.MIDDLE;
    }
  }

  return CBT_TREATMENT_ARC_FILTERS.ANY;
}

/**
 * Derives the unit type preference from the intervention mode and treatment arc.
 *
 * Rules (ordered by priority):
 *   1. Early arc → PSYCHOEDUCATION (introductory content).
 *   2. FORMULATION_DEEPENING mode → TECHNIQUE (focused advanced work).
 *   3. STRUCTURED_EXPLORATION mode → TECHNIQUE (skill-building focus).
 *   4. Default → ANY.
 *
 * @private
 * @param {string} interventionMode
 * @param {string} treatmentArcFilter
 * @returns {string}
 */
function _deriveUnitTypePreference(interventionMode, treatmentArcFilter) {
  if (treatmentArcFilter === CBT_TREATMENT_ARC_FILTERS.EARLY) {
    return CBT_UNIT_TYPE_PREFERENCES.PSYCHOEDUCATION;
  }
  if (
    interventionMode === _MODE_FORMULATION_DEEPENING ||
    interventionMode === _MODE_STRUCTURED_EXPLORATION
  ) {
    return CBT_UNIT_TYPE_PREFERENCES.TECHNIQUE;
  }
  return CBT_UNIT_TYPE_PREFERENCES.ANY;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Plans whether CBT knowledge retrieval should occur and, if so, what bounded
 * retrieval parameters should be used.
 *
 * DESIGN CONTRACT (non-negotiable)
 * ---------------------------------
 * - Pure, synchronous, deterministic.  Same inputs always produce the same output.
 * - No LLM calls, no entity access, no async work, no side effects.
 * - No raw message text is accepted.  Only structured, bounded inputs.
 * - Ambiguous or missing inputs ALWAYS bias toward skip / no retrieval.
 * - Safety / containment ALWAYS dominates — knowledge never outranks it.
 * - Never throws — any unhandled error returns CBT_KNOWLEDGE_PLAN_FAIL_SAFE.
 *
 * PRECEDENCE CHAIN (knowledge retrieval is the lowest-priority signal)
 * --------------------------------------------------------------------
 *   flag_enabled → safety/containment → distress tier → strategy mode
 *   → formulation hints → LTS arc inference → retrieval plan
 *
 * @param {CBTKnowledgePlannerInputs} inputs
 * @returns {Readonly<CBTKnowledgePlan>}
 */
export function planCBTKnowledgeRetrieval({
  flagEnabled = false,
  strategyState = null,
  ltsInputs = null,
  formulationHints = null,
  distressTier = null,
  safetyActive = false,
} = {}) {
  try {
    // ─ 1. Feature flag gate ───────────────────────────────────────────────────
    if (flagEnabled !== true) {
      return _skipPlan(CBT_KNOWLEDGE_SKIP_REASONS.FLAG_OFF);
    }

    // ─ 2. Safety / containment check ─────────────────────────────────────────
    // Check explicit safetyActive, strategy safety_mode_active, and containment mode.
    // Any of these signals → always skip.  Safety is the highest-priority gate.
    const interventionMode =
      strategyState && typeof strategyState.intervention_mode === 'string'
        ? strategyState.intervention_mode
        : '';
    const strategySafetyActive =
      strategyState != null && strategyState.safety_mode_active === true;

    if (
      safetyActive === true ||
      strategySafetyActive ||
      interventionMode === _MODE_CONTAINMENT
    ) {
      return _skipPlan(CBT_KNOWLEDGE_SKIP_REASONS.CONTAINMENT);
    }

    // ─ 3. Distress tier check ─────────────────────────────────────────────────
    // Prefer explicit distressTier param; fall back to strategyState.distress_tier.
    // Default to TIER_LOW (conservative: doesn't promote but also doesn't block).
    const effectiveTier =
      typeof distressTier === 'string' && distressTier
        ? distressTier
        : strategyState && typeof strategyState.distress_tier === 'string'
          ? strategyState.distress_tier
          : _TIER_LOW;

    if (effectiveTier === _TIER_HIGH) {
      return _skipPlan(CBT_KNOWLEDGE_SKIP_REASONS.HIGH_DISTRESS);
    }
    if (effectiveTier === _TIER_MODERATE) {
      return _skipPlan(CBT_KNOWLEDGE_SKIP_REASONS.MODERATE_DISTRESS);
    }

    // ─ 4. Strategy mode gate ──────────────────────────────────────────────────
    // Only STRUCTURED_EXPLORATION and FORMULATION_DEEPENING warrant retrieval.
    // Missing or unrecognised mode → strategy_inert (fail safe).
    if (!interventionMode || !_RETRIEVAL_ALLOWED_MODES.has(interventionMode)) {
      return _skipPlan(CBT_KNOWLEDGE_SKIP_REASONS.STRATEGY_INERT);
    }

    // ─ 5. Formulation hints validation ───────────────────────────────────────
    const hints =
      formulationHints && typeof formulationHints === 'object'
        ? formulationHints
        : {};

    // Ambiguous formulation → skip (cannot derive a meaningful domain signal).
    if (hints.is_ambiguous === true) {
      return _skipPlan(CBT_KNOWLEDGE_SKIP_REASONS.AMBIGUOUS_FORMULATION);
    }

    // ─ 6. Domain check ────────────────────────────────────────────────────────
    // Without a domain, retrieval cannot be scoped to relevant CBT content.
    const domain =
      typeof hints.domain === 'string' ? hints.domain.trim() : '';
    if (!domain) {
      return _skipPlan(CBT_KNOWLEDGE_SKIP_REASONS.NO_DOMAIN);
    }

    // ─ 7. Build retrieval plan ────────────────────────────────────────────────
    // All gates have passed.  Derive the bounded plan parameters.
    const distressFilter = _deriveDistressFilter(effectiveTier);
    const treatmentArcFilter = _deriveTreatmentArcFilter(hints, ltsInputs);
    const unitTypePreference = _deriveUnitTypePreference(
      interventionMode,
      treatmentArcFilter
    );

    return _makePlan(
      true,
      CBT_KNOWLEDGE_SKIP_REASONS.NONE,
      domain,
      unitTypePreference,
      distressFilter,
      treatmentArcFilter
    );
  } catch (_e) {
    // Never throw — return the maximally conservative fail-safe on any error.
    return CBT_KNOWLEDGE_PLAN_FAIL_SAFE;
  }
}

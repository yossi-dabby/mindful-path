/**
 * @file src/lib/therapistStrategyEngine.js
 *
 * Therapist Upgrade — Wave 2A — Therapeutic Strategy Layer (Scaffold)
 *
 * PURPOSE
 * -------
 * Pure deterministic strategy engine that produces a TherapistStrategyState
 * object from bounded inputs.  No LLM calls, no entity access, no async,
 * no side effects.  All outputs are derived from explicit input arguments only.
 *
 * ISOLATION GUARANTEE
 * -------------------
 * This module has NO imports from any other app module.  It does NOT import
 * from agentWiring, activeAgentWiring, featureFlags, workflowContextInjector,
 * or any entity definition.  It is a standalone, self-contained pure library.
 *
 * This module is NOT wired into any runtime session path in this PR.
 * No Chat.jsx, no buildV8SessionStartContentAsync, no agent wiring changes.
 * Activation is gated by VITE_THERAPIST_UPGRADE_STRATEGY_ENABLED (Wave 2A flag)
 * which defaults to false.  This file may be safely imported by tests in the
 * current state without affecting any live behavior.
 *
 * SAFETY CONTRACT
 * ---------------
 * - If inputs are ambiguous or missing, bias toward conservative / safe modes.
 * - If safety mode is active (safetyResult.safety_mode === true), the output
 *   intervention mode MUST be CONTAINMENT.  No other mode may override this.
 * - All outputs are frozen plain objects.  No mutation after creation.
 * - All public functions never throw — they catch all exceptions and return
 *   fail-safe defaults.
 *
 * FAIL-SAFE DEFAULTS (when inputs are absent, null, or malformed)
 * ---------------------------------------------------------------
 * - distress tier : TIER_LOW
 * - intervention  : STABILISATION (safe middle mode)
 * - strategy state: see STRATEGY_FAIL_SAFE_STATE
 *
 * Source of truth: Wave 2A problem statement (Therapeutic Strategy Layer scaffold)
 */

// ─── Version ──────────────────────────────────────────────────────────────────

/**
 * Version of the strategy engine.
 * Follows semantic versioning.  Bump the minor when the intervention mode set
 * changes, bump the patch for rule adjustments.
 *
 * @type {string}
 */
export const STRATEGY_VERSION = '1.0.0';

// ─── Distress tiers ───────────────────────────────────────────────────────────

/**
 * Distress tier values, ordered from lowest to highest clinical urgency.
 *
 * The distress tier is an intermediate signal derived from the safety result
 * and the message signals.  It drives intervention mode selection.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const DISTRESS_TIERS = Object.freeze({
  /** No elevated distress signals detected. */
  TIER_LOW: 'tier_low',
  /** Mild distress signals: general emotional language, normal CBT context. */
  TIER_MILD: 'tier_mild',
  /** Moderate distress: high-distress language, low retrieval confidence, or
   *  allowlist rejection without a hard safety trigger. */
  TIER_MODERATE: 'tier_moderate',
  /** High distress: severe hopelessness, shutdown/breakdown, catastrophic
   *  language, or any hard safety trigger active. */
  TIER_HIGH: 'tier_high',
});

// ─── Intervention modes ───────────────────────────────────────────────────────

/**
 * Approved bounded set of intervention modes for the strategy engine.
 *
 * These modes determine the shape of the therapist's response strategy.
 * The set is intentionally small and fixed to prevent scope creep.
 *
 * SAFETY RULE: CONTAINMENT is the mandatory mode when safety_mode is active.
 * No other mode may override a safety-active determination.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const STRATEGY_INTERVENTION_MODES = Object.freeze({
  /**
   * Containment — highest clinical urgency.
   * Activated when safety mode is active (crisis signal, severe hopelessness,
   * shutdown/breakdown, catastrophic language, or flag override).
   * Response must be short, grounding, structured, one question at a time.
   * No exploratory breadth while distress is unresolved.
   */
  CONTAINMENT: 'containment',

  /**
   * Stabilisation — moderate urgency.
   * Activated when moderate distress signals are present but safety mode is
   * not active.  Supports the user in regaining emotional footing before
   * deeper CBT work.  Also the safe default when inputs are absent or ambiguous.
   */
  STABILISATION: 'stabilisation',

  /**
   * Structured exploration — normal CBT engagement.
   * Activated for mild-distress or low-distress sessions with sufficient
   * continuity context (at least one prior session) or a formulation present.
   * Engages the CBT framework (thought records, cognitive restructuring, etc.)
   * within a clear session structure.
   */
  STRUCTURED_EXPLORATION: 'structured_exploration',

  /**
   * Formulation-led deepening — rich continuity session.
   * Activated only when a CaseFormulation is present AND prior session
   * continuity exists (at least one meaningful prior record) AND distress is
   * low or mild.  Prioritises formulation hypotheses and longitudinal patterns
   * in the response focus.
   */
  FORMULATION_DEEPENING: 'formulation_deepening',

  /**
   * Psychoeducation primer — first session / no context.
   * Activated when there is no continuity data and no formulation, regardless
   * of distress tier (as long as safety mode is not active).  Orients the user
   * to the CBT process without assuming any prior clinical picture.
   */
  PSYCHOEDUCATION: 'psychoeducation',
});

// ─── Signal keys ─────────────────────────────────────────────────────────────

/**
 * Message signal keys produced by extractMessageSignals().
 * These are deterministic, pattern-based signals derived from raw message text.
 *
 * @type {Readonly<Record<string, string>>}
 */
export const MESSAGE_SIGNAL_KEYS = Object.freeze({
  HAS_DISTRESS_LANGUAGE: 'has_distress_language',
  HAS_HOPELESSNESS_LANGUAGE: 'has_hopelessness_language',
  HAS_CATASTROPHIC_LANGUAGE: 'has_catastrophic_language',
  HAS_SHUTDOWN_LANGUAGE: 'has_shutdown_language',
  HAS_EMOTIONAL_LANGUAGE: 'has_emotional_language',
  IS_EMPTY_OR_SHORT: 'is_empty_or_short',
});

// ─── Internal pattern tables ──────────────────────────────────────────────────
// These are private to this module.  They are not exported.

/** @type {ReadonlyArray<RegExp>} */
const _HOPELESSNESS_PATTERNS = Object.freeze([
  /\bnothing\s+(will|can|ever)\s+get\s+better\b/i,
  /\bno\s+(hope|point|reason)\s+(left|anymore|at\s+all)\b/i,
  /\bhopeless(ness)?\b/i,
  /\bcan'?t\s+see\s+(a\s+)?way\s+(out|forward|through)\b/i,
  /\blife\s+(is\s+)?(not\s+)?worth\s+(living|it)\b/i,
  /\bwhat'?s\s+the\s+point\b/i,
  /\bnever\s+(going\s+to\s+)?(be\s+)?(okay|fine|better|happy)\b/i,
  /\bnothing\s+(matters|helps|works)\b/i,
]);

/** @type {ReadonlyArray<RegExp>} */
const _SHUTDOWN_PATTERNS = Object.freeze([
  /\bshutting\s+down\b/i,
  /\bcomplete(ly)?\s+(broken|numb|empty|lost)\b/i,
  /\bfalling\s+apart\b/i,
  /\bbreaking\s+down\b/i,
  /\bcollaps(e|ing|ed)\b/i,
  /\bcan'?t\s+(function|cope|go\s+on|face)\b/i,
  /\btotally\s+(lost|numb|empty|broken)\b/i,
  /\bgiven\s+up\b/i,
]);

/** @type {ReadonlyArray<RegExp>} */
const _CATASTROPHIC_PATTERNS = Object.freeze([
  /\beverything\s+is\s+(ruined|destroyed|over|hopeless)\b/i,
  /\bmy\s+life\s+is\s+(ruined|over|destroyed)\b/i,
  /\bno\s+way\s+back\b/i,
  /\birreversible\b/i,
  /\bnever\s+(recover|be\s+okay|be\s+normal|be\s+the\s+same)\b/i,
  /\bthis\s+is\s+(the\s+end|all\s+over)\b/i,
]);

/** @type {ReadonlyArray<RegExp>} */
const _HIGH_DISTRESS_PATTERNS = Object.freeze([
  /\boverwhelm(ed|ing)\b/i,
  /\bcan'?t\s+(breathe|think|move)\b/i,
  /\bfeel(ing)?\s+(so\s+)?(out\s+of\s+control|uncontrollable)\b/i,
  /\bpanic(king|ked)?\b/i,
  /\bscreaming\s+inside\b/i,
  /\bcan'?t\s+stop\s+crying\b/i,
]);

/** @type {ReadonlyArray<RegExp>} */
const _EMOTIONAL_LANGUAGE_PATTERNS = Object.freeze([
  /\b(feel|feeling|felt)\b/i,
  /\b(sad|angry|anxious|worried|scared|afraid|frustrated|upset)\b/i,
  /\b(emotion|emotional)\b/i,
  /\b(stressed|stress)\b/i,
]);

/** Minimum message length to not be considered empty/short. @type {number} */
const _EMPTY_OR_SHORT_THRESHOLD = 10;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Extracts deterministic message-level signals from raw message text.
 *
 * This is a pure pattern-matching pass over the message string.  It does not
 * call any external service and does not consider session context.
 *
 * SAFETY: Always returns a complete signal object.  Never throws.
 * Empty or null input returns the is_empty_or_short=true signal set.
 *
 * @param {string|null|undefined} messageText
 * @returns {Readonly<{
 *   has_distress_language: boolean,
 *   has_hopelessness_language: boolean,
 *   has_catastrophic_language: boolean,
 *   has_shutdown_language: boolean,
 *   has_emotional_language: boolean,
 *   is_empty_or_short: boolean,
 * }>}
 */
export function extractMessageSignals(messageText) {
  try {
    const text = typeof messageText === 'string' ? messageText : '';
    const isEmpty = text.trim().length < _EMPTY_OR_SHORT_THRESHOLD;

    const hasHopelessness = _HOPELESSNESS_PATTERNS.some(p => p.test(text));
    const hasShutdown = _SHUTDOWN_PATTERNS.some(p => p.test(text));
    const hasCatastrophic = _CATASTROPHIC_PATTERNS.some(p => p.test(text));
    const hasHighDistress = _HIGH_DISTRESS_PATTERNS.some(p => p.test(text));
    const hasDistress = hasHopelessness || hasShutdown || hasCatastrophic || hasHighDistress;
    const hasEmotional = _EMOTIONAL_LANGUAGE_PATTERNS.some(p => p.test(text));

    return Object.freeze({
      [MESSAGE_SIGNAL_KEYS.HAS_DISTRESS_LANGUAGE]: hasDistress,
      [MESSAGE_SIGNAL_KEYS.HAS_HOPELESSNESS_LANGUAGE]: hasHopelessness,
      [MESSAGE_SIGNAL_KEYS.HAS_CATASTROPHIC_LANGUAGE]: hasCatastrophic,
      [MESSAGE_SIGNAL_KEYS.HAS_SHUTDOWN_LANGUAGE]: hasShutdown,
      [MESSAGE_SIGNAL_KEYS.HAS_EMOTIONAL_LANGUAGE]: hasEmotional,
      [MESSAGE_SIGNAL_KEYS.IS_EMPTY_OR_SHORT]: isEmpty,
    });
  } catch (_e) {
    return _EMPTY_SIGNALS;
  }
}

/**
 * Scores the current distress tier from the safety result and message signals.
 *
 * Tier mapping (highest matching tier wins):
 *
 *   TIER_HIGH    — safety_mode is active, OR any of: crisis_signal,
 *                  severe_hopelessness, shutdown/breakdown, catastrophic language,
 *                  flag_override in safetyResult.triggers; OR hopelessness,
 *                  catastrophic, or shutdown signal in messageSignals.
 *
 *   TIER_MODERATE — high-distress language signal in messageSignals; OR
 *                   safetyResult has low_retrieval_confidence or allowlist_rejection
 *                   trigger (without a safety_mode active).
 *
 *   TIER_MILD    — emotional language present in messageSignals (no distress tier).
 *
 *   TIER_LOW     — default / no signals.
 *
 * SAFETY: Never throws.  Returns TIER_LOW on any error.
 *
 * @param {object|null|undefined} safetyResult  - SafetyModeResult from therapistSafetyMode
 * @param {object|null|undefined} messageSignals - Output of extractMessageSignals()
 * @returns {string} One of the DISTRESS_TIERS values
 */
export function scoreDistressTier(safetyResult, messageSignals) {
  try {
    const sr = safetyResult && typeof safetyResult === 'object' ? safetyResult : {};
    const ms = messageSignals && typeof messageSignals === 'object' ? messageSignals : {};

    // Safety mode active is always TIER_HIGH regardless of other signals.
    if (sr.safety_mode === true) return DISTRESS_TIERS.TIER_HIGH;

    // Hard safety triggers in the result object → TIER_HIGH.
    const triggers = Array.isArray(sr.triggers) ? sr.triggers : [];
    const highTriggers = ['crisis_signal', 'severe_hopelessness', 'shutdown_breakdown', 'catastrophic_language', 'flag_override'];
    if (triggers.some(t => highTriggers.includes(t))) return DISTRESS_TIERS.TIER_HIGH;

    // Severe message signals → TIER_HIGH.
    if (ms[MESSAGE_SIGNAL_KEYS.HAS_HOPELESSNESS_LANGUAGE]) return DISTRESS_TIERS.TIER_HIGH;
    if (ms[MESSAGE_SIGNAL_KEYS.HAS_CATASTROPHIC_LANGUAGE]) return DISTRESS_TIERS.TIER_HIGH;
    if (ms[MESSAGE_SIGNAL_KEYS.HAS_SHUTDOWN_LANGUAGE]) return DISTRESS_TIERS.TIER_HIGH;

    // Soft safety triggers → TIER_MODERATE.
    const moderateTriggers = ['low_retrieval_confidence', 'allowlist_rejection'];
    if (triggers.some(t => moderateTriggers.includes(t))) return DISTRESS_TIERS.TIER_MODERATE;

    // High-distress language (non-severe) → TIER_MODERATE.
    if (ms[MESSAGE_SIGNAL_KEYS.HAS_DISTRESS_LANGUAGE]) return DISTRESS_TIERS.TIER_MODERATE;

    // Emotional language present → TIER_MILD.
    if (ms[MESSAGE_SIGNAL_KEYS.HAS_EMOTIONAL_LANGUAGE]) return DISTRESS_TIERS.TIER_MILD;

    return DISTRESS_TIERS.TIER_LOW;
  } catch (_e) {
    return DISTRESS_TIERS.TIER_LOW;
  }
}

/**
 * Determines the full therapeutic strategy from session context inputs.
 *
 * This is the central decision function.  It integrates continuity data,
 * formulation data, distress tier, and message signals into a single
 * TherapistStrategyState.
 *
 * SAFETY CONTRACT (non-negotiable):
 *   - If distressTier is TIER_HIGH, intervention_mode MUST be CONTAINMENT.
 *   - If inputs are null / missing, default to STABILISATION (safe middle mode).
 *   - If continuity AND formulation are both absent, default to PSYCHOEDUCATION
 *     for low/mild distress tiers.
 *   - FORMULATION_DEEPENING requires: formulation present + at least one prior
 *     session record + distress tier is TIER_LOW or TIER_MILD.
 *
 * @param {object|null|undefined} continuityData
 *   Cross-session continuity output from crossSessionContinuity.js (may be null
 *   for first sessions or when continuity is disabled).
 *   Expected shape: { records: Array, ... }  Any shape is tolerated (fail-safe).
 * @param {object|null|undefined} formulationData
 *   CaseFormulation entity record (may be null if none exists).
 *   Expected shape: { working_hypotheses: string|Array, ... }
 * @param {string} distressTier
 *   One of the DISTRESS_TIERS values, typically from scoreDistressTier().
 * @param {object|null|undefined} messageSignals
 *   Output of extractMessageSignals().
 * @returns {Readonly<TherapistStrategyState>}
 */
export function determineTherapistStrategy(continuityData, formulationData, distressTier, messageSignals) {
  try {
    const tier = (typeof distressTier === 'string' && _DISTRESS_TIER_VALUES.has(distressTier))
      ? distressTier
      : DISTRESS_TIERS.TIER_LOW;

    // ── Safety-first: TIER_HIGH → always CONTAINMENT ─────────────────────────
    if (tier === DISTRESS_TIERS.TIER_HIGH) {
      return _buildStrategyState(STRATEGY_INTERVENTION_MODES.CONTAINMENT, {
        distress_tier: tier,
        continuity_present: _hasContinuity(continuityData),
        formulation_present: _hasFormulation(formulationData),
        message_signals: _normaliseSignals(messageSignals),
        rationale: 'tier_high_containment_mandatory',
      });
    }

    const hasContinuity = _hasContinuity(continuityData);
    const hasFormulation = _hasFormulation(formulationData);
    const ms = _normaliseSignals(messageSignals);

    // ── TIER_MODERATE → STABILISATION ────────────────────────────────────────
    if (tier === DISTRESS_TIERS.TIER_MODERATE) {
      return _buildStrategyState(STRATEGY_INTERVENTION_MODES.STABILISATION, {
        distress_tier: tier,
        continuity_present: hasContinuity,
        formulation_present: hasFormulation,
        message_signals: ms,
        rationale: 'tier_moderate_stabilisation',
      });
    }

    // ── Low / mild distress — context-driven selection ────────────────────────

    // No continuity, no formulation → PSYCHOEDUCATION (first-session safe default).
    if (!hasContinuity && !hasFormulation) {
      return _buildStrategyState(STRATEGY_INTERVENTION_MODES.PSYCHOEDUCATION, {
        distress_tier: tier,
        continuity_present: false,
        formulation_present: false,
        message_signals: ms,
        rationale: 'no_context_psychoeducation',
      });
    }

    // Formulation present + prior continuity + low/mild → FORMULATION_DEEPENING.
    if (hasFormulation && hasContinuity && (tier === DISTRESS_TIERS.TIER_LOW || tier === DISTRESS_TIERS.TIER_MILD)) {
      return _buildStrategyState(STRATEGY_INTERVENTION_MODES.FORMULATION_DEEPENING, {
        distress_tier: tier,
        continuity_present: true,
        formulation_present: true,
        message_signals: ms,
        rationale: 'formulation_and_continuity_deepening',
      });
    }

    // Formulation only (no continuity) or continuity only (no formulation) → STRUCTURED_EXPLORATION.
    if (hasFormulation || hasContinuity) {
      return _buildStrategyState(STRATEGY_INTERVENTION_MODES.STRUCTURED_EXPLORATION, {
        distress_tier: tier,
        continuity_present: hasContinuity,
        formulation_present: hasFormulation,
        message_signals: ms,
        rationale: 'partial_context_structured_exploration',
      });
    }

    // Fallback — safe middle mode (should be unreachable given the guards above,
    // but belt-and-suspenders for any future code path additions).
    return _buildStrategyState(STRATEGY_INTERVENTION_MODES.STABILISATION, {
      distress_tier: tier,
      continuity_present: hasContinuity,
      formulation_present: hasFormulation,
      message_signals: ms,
      rationale: 'fallback_stabilisation',
    });
  } catch (_e) {
    return STRATEGY_FAIL_SAFE_STATE;
  }
}

/**
 * Builds a human-readable strategy context section string from a
 * TherapistStrategyState.  This is the text that would be injected into
 * a session-start payload when this module is wired in a future PR.
 *
 * The output is a structured plain-text block with a header, the active
 * intervention mode, distress tier, and context flags.  It does NOT
 * include raw user data.
 *
 * SAFETY: Never throws.  Returns a minimal safe fallback string on any error.
 *
 * @param {object|null|undefined} strategyState  TherapistStrategyState
 * @returns {string}
 */
export function buildStrategyContextSection(strategyState) {
  try {
    const ss = strategyState && typeof strategyState === 'object' ? strategyState : {};
    const mode = typeof ss.intervention_mode === 'string' ? ss.intervention_mode : 'unknown';
    const tier = typeof ss.distress_tier === 'string' ? ss.distress_tier : 'unknown';
    const version = typeof ss.strategy_version === 'string' ? ss.strategy_version : STRATEGY_VERSION;
    const contPresent = ss.continuity_present === true;
    const formPresent = ss.formulation_present === true;

    const lines = [
      `=== THERAPEUTIC STRATEGY — WAVE 2A v${version} ===`,
      '',
      `Intervention mode : ${mode}`,
      `Distress tier     : ${tier}`,
      `Prior continuity  : ${contPresent ? 'yes' : 'no'}`,
      `Formulation active: ${formPresent ? 'yes' : 'no'}`,
      '',
      _getModeGuidance(mode),
      '',
      '=== END THERAPEUTIC STRATEGY ===',
    ];

    return lines.join('\n');
  } catch (_e) {
    return `=== THERAPEUTIC STRATEGY — WAVE 2A v${STRATEGY_VERSION} ===\nIntervention mode : ${STRATEGY_INTERVENTION_MODES.STABILISATION}\n=== END THERAPEUTIC STRATEGY ===`;
  }
}

// ─── Fail-safe state ──────────────────────────────────────────────────────────

/**
 * Canonical fail-safe TherapistStrategyState.
 *
 * Returned whenever determineTherapistStrategy() catches an unexpected error.
 * Uses STABILISATION as the safe-default mode (conservative, non-containment,
 * non-exploratory).
 *
 * @type {Readonly<TherapistStrategyState>}
 */
export const STRATEGY_FAIL_SAFE_STATE = Object.freeze({
  strategy_version: STRATEGY_VERSION,
  intervention_mode: STRATEGY_INTERVENTION_MODES.STABILISATION,
  distress_tier: DISTRESS_TIERS.TIER_LOW,
  continuity_present: false,
  formulation_present: false,
  message_signals: Object.freeze({
    [MESSAGE_SIGNAL_KEYS.HAS_DISTRESS_LANGUAGE]: false,
    [MESSAGE_SIGNAL_KEYS.HAS_HOPELESSNESS_LANGUAGE]: false,
    [MESSAGE_SIGNAL_KEYS.HAS_CATASTROPHIC_LANGUAGE]: false,
    [MESSAGE_SIGNAL_KEYS.HAS_SHUTDOWN_LANGUAGE]: false,
    [MESSAGE_SIGNAL_KEYS.HAS_EMOTIONAL_LANGUAGE]: false,
    [MESSAGE_SIGNAL_KEYS.IS_EMPTY_OR_SHORT]: true,
  }),
  rationale: 'fail_safe',
  fail_safe: true,
});

// ─── Private helpers ──────────────────────────────────────────────────────────

/** Set of valid distress tier string values for fast lookup. */
const _DISTRESS_TIER_VALUES = new Set(Object.values(DISTRESS_TIERS));

/** Empty signal set returned on error. */
const _EMPTY_SIGNALS = Object.freeze({
  [MESSAGE_SIGNAL_KEYS.HAS_DISTRESS_LANGUAGE]: false,
  [MESSAGE_SIGNAL_KEYS.HAS_HOPELESSNESS_LANGUAGE]: false,
  [MESSAGE_SIGNAL_KEYS.HAS_CATASTROPHIC_LANGUAGE]: false,
  [MESSAGE_SIGNAL_KEYS.HAS_SHUTDOWN_LANGUAGE]: false,
  [MESSAGE_SIGNAL_KEYS.HAS_EMOTIONAL_LANGUAGE]: false,
  [MESSAGE_SIGNAL_KEYS.IS_EMPTY_OR_SHORT]: true,
});

/**
 * Returns true when continuityData contains at least one usable record.
 * Tolerates any shape — fail-closed to false on any unexpected structure.
 *
 * @param {any} continuityData
 * @returns {boolean}
 */
function _hasContinuity(continuityData) {
  try {
    if (!continuityData || typeof continuityData !== 'object') return false;
    // Accept { records: [...] } shape.
    if (Array.isArray(continuityData.records)) {
      return continuityData.records.length > 0;
    }
    // Accept a direct array (defensive).
    if (Array.isArray(continuityData)) {
      return continuityData.length > 0;
    }
    // Any non-null object with at least one key besides null values is treated
    // as having continuity context.
    return Object.keys(continuityData).length > 0 &&
      Object.values(continuityData).some(v => v !== null && v !== undefined && v !== '');
  } catch (_e) {
    return false;
  }
}

/**
 * Returns true when formulationData appears to be a meaningful CaseFormulation.
 * Tolerates any shape — fail-closed to false on any unexpected structure.
 *
 * @param {any} formulationData
 * @returns {boolean}
 */
function _hasFormulation(formulationData) {
  try {
    if (!formulationData || typeof formulationData !== 'object') return false;
    // Must have at least one non-empty field.
    return Object.values(formulationData).some(v => {
      if (Array.isArray(v)) return v.length > 0;
      return typeof v === 'string' && v.trim().length > 0;
    });
  } catch (_e) {
    return false;
  }
}

/**
 * Normalises a message signals object, filling missing keys with false.
 *
 * @param {any} signals
 * @returns {Readonly<Record<string, boolean>>}
 */
function _normaliseSignals(signals) {
  if (!signals || typeof signals !== 'object') return _EMPTY_SIGNALS;
  return Object.freeze({
    [MESSAGE_SIGNAL_KEYS.HAS_DISTRESS_LANGUAGE]: signals[MESSAGE_SIGNAL_KEYS.HAS_DISTRESS_LANGUAGE] === true,
    [MESSAGE_SIGNAL_KEYS.HAS_HOPELESSNESS_LANGUAGE]: signals[MESSAGE_SIGNAL_KEYS.HAS_HOPELESSNESS_LANGUAGE] === true,
    [MESSAGE_SIGNAL_KEYS.HAS_CATASTROPHIC_LANGUAGE]: signals[MESSAGE_SIGNAL_KEYS.HAS_CATASTROPHIC_LANGUAGE] === true,
    [MESSAGE_SIGNAL_KEYS.HAS_SHUTDOWN_LANGUAGE]: signals[MESSAGE_SIGNAL_KEYS.HAS_SHUTDOWN_LANGUAGE] === true,
    [MESSAGE_SIGNAL_KEYS.HAS_EMOTIONAL_LANGUAGE]: signals[MESSAGE_SIGNAL_KEYS.HAS_EMOTIONAL_LANGUAGE] === true,
    [MESSAGE_SIGNAL_KEYS.IS_EMPTY_OR_SHORT]: signals[MESSAGE_SIGNAL_KEYS.IS_EMPTY_OR_SHORT] === true,
  });
}

/**
 * Constructs a frozen TherapistStrategyState from an intervention mode and
 * supporting metadata.
 *
 * @param {string} mode
 * @param {{ distress_tier: string, continuity_present: boolean,
 *            formulation_present: boolean, message_signals: object,
 *            rationale: string }} meta
 * @returns {Readonly<TherapistStrategyState>}
 */
function _buildStrategyState(mode, meta) {
  return Object.freeze({
    strategy_version: STRATEGY_VERSION,
    intervention_mode: mode,
    distress_tier: meta.distress_tier,
    continuity_present: meta.continuity_present,
    formulation_present: meta.formulation_present,
    message_signals: meta.message_signals,
    rationale: meta.rationale,
    fail_safe: false,
  });
}

/**
 * Returns a brief mode-specific guidance string for context section output.
 *
 * @param {string} mode
 * @returns {string}
 */
function _getModeGuidance(mode) {
  switch (mode) {
    case STRATEGY_INTERVENTION_MODES.CONTAINMENT:
      return 'Guidance: Short, grounding responses. One question at a time. No exploratory breadth while high distress is unresolved.';
    case STRATEGY_INTERVENTION_MODES.STABILISATION:
      return 'Guidance: Support emotional stabilisation before deeper CBT work. Validate, orient, ground.';
    case STRATEGY_INTERVENTION_MODES.STRUCTURED_EXPLORATION:
      return 'Guidance: Engage the CBT framework with structured session focus. Use thought records and cognitive restructuring as appropriate.';
    case STRATEGY_INTERVENTION_MODES.FORMULATION_DEEPENING:
      return 'Guidance: Prioritise formulation hypotheses and longitudinal patterns. Reference prior session themes where clinically relevant.';
    case STRATEGY_INTERVENTION_MODES.PSYCHOEDUCATION:
      return 'Guidance: Orient the client to the CBT process. Do not assume any prior clinical picture. Focus on psychoeducation and engagement.';
    default:
      return 'Guidance: Apply standard CBT engagement with clinical judgment.';
  }
}

/**
 * @typedef {object} TherapistStrategyState
 * @property {string} strategy_version    - Engine version that produced this state.
 * @property {string} intervention_mode   - One of STRATEGY_INTERVENTION_MODES.
 * @property {string} distress_tier       - One of DISTRESS_TIERS.
 * @property {boolean} continuity_present - True when prior session continuity exists.
 * @property {boolean} formulation_present - True when an active CaseFormulation exists.
 * @property {object} message_signals     - Signal flags from extractMessageSignals().
 * @property {string} rationale           - Short internal rationale key.
 * @property {boolean} fail_safe          - True only when the fail-safe default was used.
 */

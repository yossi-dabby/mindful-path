/**
 * @file src/lib/cbtCurriculumUnitSchema.js
 *
 * Therapist Upgrade — Wave 4B — CBTCurriculumUnit Schema Validator / Normalizer
 *
 * PURPOSE
 * -------
 * Single source of truth for validating and normalizing CBTCurriculumUnit
 * records at ingest / import / seed time.
 *
 * This module is the authoritative gate for:
 *   A. Required field presence
 *   B. Enum field validation (unit_type, clinical_topic, languages, etc.)
 *   C. New Wave 4B field validation (planner_domain, distress_suitability,
 *      evidence_level, safety_tags, runtime_eligible_first_wave)
 *   D. First-wave domain gate enforcement (Wave 4B scope)
 *   E. Normalization of records to canonical shape before persistence
 *
 * ISOLATION GUARANTEE
 * -------------------
 * This module imports ONLY from cbtKnowledgePlanner.js (for domain constants)
 * and has no imports from agentWiring, activeAgentWiring, featureFlags,
 * workflowContextInjector, or any entity definition.
 *
 * RUNTIME SAFETY CONTRACT
 * -----------------------
 * - This module is NOT wired into any live session path.
 * - No LLM calls, no async work, no side effects.
 * - All validation functions are pure and synchronous.
 * - All outputs are plain objects.
 * - runtime_eligible_first_wave is NEVER automatically set to true by
 *   normalization — it must be explicitly set by an admin after ingest.
 * - Deferred domains are representable in data but normalized to
 *   runtime_eligible_first_wave: false unconditionally.
 *
 * WAVE 4B CONSTRAINT (NON-NEGOTIABLE)
 * ------------------------------------
 * Do NOT wire this module into Chat.jsx, workflowContextInjector, or any
 * live session path in this PR.  Runtime retrieval activation is Wave 4C.
 *
 * Source of truth: Wave 4B problem statement
 */

import {
  CBT_KNOWLEDGE_DOMAINS,
  CBT_KNOWLEDGE_RUNTIME_ALLOWED_DOMAINS_FIRST_WAVE,
  CBT_KNOWLEDGE_DEFERRED_DOMAINS,
} from './cbtKnowledgePlanner.js';

// ─── Version ──────────────────────────────────────────────────────────────────

/**
 * Schema version for the CBTCurriculumUnit validator/normalizer.
 * Bump when validation rules or normalized output shape changes.
 *
 * @type {string}
 */
export const CBT_CURRICULUM_UNIT_SCHEMA_VERSION = '1.0.0';

// ─── Bounded enum sets ────────────────────────────────────────────────────────

/**
 * Valid values for the `unit_type` field.
 * Must stay in sync with base44/entities/CBTCurriculumUnit.jsonc.
 *
 * @type {ReadonlySet<string>}
 */
export const VALID_UNIT_TYPES = Object.freeze(new Set([
  'concept',
  'psychoeducation',
  'intervention',
  'micro_step_ladder',
  'blocker_resolution',
  'outcome_interpretation',
  'phrasing_pattern',
  'multilingual_response_pattern',
]));

/**
 * Valid values for the `clinical_topic` field.
 * Must stay in sync with base44/entities/CBTCurriculumUnit.jsonc.
 *
 * @type {ReadonlySet<string>}
 */
export const VALID_CLINICAL_TOPICS = Object.freeze(new Set([
  'avoidance',
  'flooding',
  'panic',
  'worry',
  'rumination',
  'perfectionism',
  'self_criticism',
  'social_anxiety',
  'driving_anxiety',
  'exam_anxiety',
  'sleep_anxiety',
  'general_anxiety',
  'depression',
  'behavioral_activation',
  'cognitive_restructuring',
  'grounding',
  'exposure',
  'safety_behavior',
  'coping',
  'general',
]));

/**
 * Valid values for the `linked_hierarchy_level` field.
 * Must stay in sync with base44/entities/CBTCurriculumUnit.jsonc.
 *
 * @type {ReadonlySet<string>}
 */
export const VALID_HIERARCHY_LEVELS = Object.freeze(new Set([
  'L2', 'L3', 'L4', 'L5', 'L6', 'L7', 'L8', 'L9', 'L10', 'any',
]));

/**
 * Valid values for the `linked_outcome_patterns` array items.
 * Must stay in sync with base44/entities/CBTCurriculumUnit.jsonc.
 *
 * @type {ReadonlySet<string>}
 */
export const VALID_OUTCOME_PATTERNS = Object.freeze(new Set([
  'completed_step_with_distress',
  'completed_step_with_learning',
  'partial_completion',
  'avoidance_or_noncompletion',
  'step_too_hard',
  'step_too_easy',
  'emotional_flooding',
  'no_clear_change',
  'increased_confidence',
  'new_specific_fear_discovered',
  'return_after_two_steps',
  'any',
]));

/**
 * Valid values for the `languages` array items.
 * Must stay in sync with base44/entities/CBTCurriculumUnit.jsonc.
 *
 * @type {ReadonlySet<string>}
 */
export const VALID_LANGUAGES = Object.freeze(new Set([
  'en', 'he', 'es', 'fr', 'de', 'it', 'pt', 'all',
]));

// ─── Wave 4B new field enums ──────────────────────────────────────────────────

/**
 * Valid values for the `planner_domain` field (Wave 4B).
 *
 * These are the CBT_KNOWLEDGE_DOMAINS values from cbtKnowledgePlanner.js.
 * planner_domain bridges the fine-grained clinical_topic with the broader
 * knowledge planner domain for retrieval scoping.
 *
 * @type {ReadonlySet<string>}
 */
export const VALID_PLANNER_DOMAINS = Object.freeze(
  new Set(Object.values(CBT_KNOWLEDGE_DOMAINS))
);

/**
 * Valid values for the `distress_suitability` field (Wave 4B).
 *
 * - 'any'         — no distress-level restriction
 * - 'low_only'    — only retrieve when distress is tier_low
 * - 'not_in_crisis' — suitable unless containment is active
 *
 * @type {ReadonlySet<string>}
 */
export const VALID_DISTRESS_SUITABILITY_VALUES = Object.freeze(new Set([
  'any',
  'low_only',
  'not_in_crisis',
]));

/**
 * Valid values for the `evidence_level` field (Wave 4B).
 *
 * - 'anecdotal'    — informal / case-report level evidence
 * - 'emerging'     — limited RCT evidence; not yet consensus
 * - 'established'  — multiple RCTs; clinical consensus
 * - 'gold_standard' — meta-analytic support; guideline-endorsed
 *
 * Only 'established' and 'gold_standard' are eligible for runtime retrieval.
 *
 * @type {ReadonlySet<string>}
 */
export const VALID_EVIDENCE_LEVELS = Object.freeze(new Set([
  'anecdotal',
  'emerging',
  'established',
  'gold_standard',
]));

/**
 * Evidence levels that are eligible for Wave 4 runtime retrieval.
 *
 * @type {ReadonlySet<string>}
 */
export const RUNTIME_ELIGIBLE_EVIDENCE_LEVELS = Object.freeze(new Set([
  'established',
  'gold_standard',
]));

/**
 * Valid values for individual `safety_tags` array items (Wave 4B).
 *
 * @type {ReadonlySet<string>}
 */
export const VALID_SAFETY_TAG_VALUES = Object.freeze(new Set([
  'contraindicated_in_crisis',
  'requires_therapist_supervision',
  'not_for_acute_trauma',
  'not_for_active_suicidality',
  'not_for_psychosis',
  'not_for_bipolar_acute',
  'cardiac_precaution',
  'respiratory_precaution',
  'safe_for_self_guided',
]));

/**
 * Maximum number of safety_tags allowed per record.
 * Prevents unbounded arrays at ingest time.
 *
 * @type {number}
 */
export const SAFETY_TAGS_MAX_COUNT = 9;

// ─── Required fields ──────────────────────────────────────────────────────────

/**
 * Fields required on every CBTCurriculumUnit record.
 * Must stay in sync with base44/entities/CBTCurriculumUnit.jsonc "required" array.
 *
 * @type {ReadonlyArray<string>}
 */
export const REQUIRED_FIELDS = Object.freeze([
  'unit_type',
  'title',
  'clinical_topic',
  'when_to_use',
  'clinical_purpose',
  'content',
  'agent_usage_rules',
]);

// ─── Validation ───────────────────────────────────────────────────────────────

/**
 * Validates a single CBTCurriculumUnit record at ingest time.
 *
 * Checks:
 *   1. Required fields are present and non-empty.
 *   2. unit_type is a valid enum value.
 *   3. clinical_topic is a valid enum value.
 *   4. linked_hierarchy_level is valid if provided.
 *   5. linked_outcome_patterns items are valid if provided.
 *   6. languages items are valid if provided.
 *   7. priority_score is 0–10 if provided.
 *   8. planner_domain is a valid CBT_KNOWLEDGE_DOMAINS value if provided.
 *   9. distress_suitability is valid if provided.
 *  10. evidence_level is valid if provided.
 *  11. safety_tags items are valid and count is bounded if provided.
 *  12. runtime_eligible_first_wave is a boolean if provided.
 *  13. Deferred domains with runtime_eligible_first_wave: true are flagged.
 *  14. Evidence level below 'established' with runtime_eligible_first_wave: true is flagged.
 *
 * @param {object} record  - Raw record to validate (not yet normalized).
 * @returns {{ valid: boolean, errors: string[], warnings: string[] }}
 */
export function validateCBTCurriculumUnit(record) {
  const errors = [];
  const warnings = [];

  if (!record || typeof record !== 'object') {
    return { valid: false, errors: ['Record must be a non-null object'], warnings };
  }

  // 1. Required fields
  for (const field of REQUIRED_FIELDS) {
    const val = record[field];
    if (val === undefined || val === null || String(val).trim() === '') {
      errors.push(`"${field}" is required and must be non-empty`);
    }
  }

  // 2. unit_type enum
  if (record.unit_type !== undefined && record.unit_type !== null) {
    if (!VALID_UNIT_TYPES.has(record.unit_type)) {
      errors.push(
        `"unit_type" must be one of: ${[...VALID_UNIT_TYPES].join(', ')}; got "${record.unit_type}"`
      );
    }
  }

  // 3. clinical_topic enum
  if (record.clinical_topic !== undefined && record.clinical_topic !== null) {
    if (!VALID_CLINICAL_TOPICS.has(record.clinical_topic)) {
      errors.push(
        `"clinical_topic" must be one of: ${[...VALID_CLINICAL_TOPICS].join(', ')}; got "${record.clinical_topic}"`
      );
    }
  }

  // 4. linked_hierarchy_level enum (optional)
  if (record.linked_hierarchy_level !== undefined && record.linked_hierarchy_level !== null && record.linked_hierarchy_level !== '') {
    if (!VALID_HIERARCHY_LEVELS.has(record.linked_hierarchy_level)) {
      errors.push(
        `"linked_hierarchy_level" must be one of: ${[...VALID_HIERARCHY_LEVELS].join(', ')}; got "${record.linked_hierarchy_level}"`
      );
    }
  }

  // 5. linked_outcome_patterns items (optional)
  if (record.linked_outcome_patterns !== undefined && record.linked_outcome_patterns !== null) {
    if (!Array.isArray(record.linked_outcome_patterns)) {
      errors.push('"linked_outcome_patterns" must be an array if provided');
    } else {
      record.linked_outcome_patterns.forEach((p, i) => {
        if (!VALID_OUTCOME_PATTERNS.has(p)) {
          errors.push(
            `"linked_outcome_patterns[${i}]" must be one of: ${[...VALID_OUTCOME_PATTERNS].join(', ')}; got "${p}"`
          );
        }
      });
    }
  }

  // 6. languages items (optional)
  if (record.languages !== undefined && record.languages !== null) {
    if (!Array.isArray(record.languages)) {
      errors.push('"languages" must be an array if provided');
    } else {
      record.languages.forEach((lang, i) => {
        if (!VALID_LANGUAGES.has(lang)) {
          errors.push(
            `"languages[${i}]" must be one of: ${[...VALID_LANGUAGES].join(', ')}; got "${lang}"`
          );
        }
      });
    }
  }

  // 7. priority_score range (optional)
  if (record.priority_score !== undefined && record.priority_score !== null) {
    const score = Number(record.priority_score);
    if (isNaN(score) || score < 0 || score > 10) {
      errors.push('"priority_score" must be a number between 0 and 10');
    }
  }

  // 8. planner_domain (Wave 4B — optional but validated when present)
  if (record.planner_domain !== undefined && record.planner_domain !== null && record.planner_domain !== '') {
    if (!VALID_PLANNER_DOMAINS.has(record.planner_domain)) {
      errors.push(
        `"planner_domain" must be one of: ${[...VALID_PLANNER_DOMAINS].join(', ')}; got "${record.planner_domain}"`
      );
    }
  }

  // 9. distress_suitability (Wave 4B — optional but validated when present)
  if (record.distress_suitability !== undefined && record.distress_suitability !== null && record.distress_suitability !== '') {
    if (!VALID_DISTRESS_SUITABILITY_VALUES.has(record.distress_suitability)) {
      errors.push(
        `"distress_suitability" must be one of: ${[...VALID_DISTRESS_SUITABILITY_VALUES].join(', ')}; got "${record.distress_suitability}"`
      );
    }
  }

  // 10. evidence_level (Wave 4B — optional but validated when present)
  if (record.evidence_level !== undefined && record.evidence_level !== null && record.evidence_level !== '') {
    if (!VALID_EVIDENCE_LEVELS.has(record.evidence_level)) {
      errors.push(
        `"evidence_level" must be one of: ${[...VALID_EVIDENCE_LEVELS].join(', ')}; got "${record.evidence_level}"`
      );
    }
  }

  // 11. safety_tags (Wave 4B — optional but validated when present)
  if (record.safety_tags !== undefined && record.safety_tags !== null) {
    if (!Array.isArray(record.safety_tags)) {
      errors.push('"safety_tags" must be an array if provided');
    } else {
      if (record.safety_tags.length > SAFETY_TAGS_MAX_COUNT) {
        errors.push(
          `"safety_tags" must not exceed ${SAFETY_TAGS_MAX_COUNT} items; got ${record.safety_tags.length}`
        );
      }
      record.safety_tags.forEach((tag, i) => {
        if (!VALID_SAFETY_TAG_VALUES.has(tag)) {
          errors.push(
            `"safety_tags[${i}]" must be one of: ${[...VALID_SAFETY_TAG_VALUES].join(', ')}; got "${tag}"`
          );
        }
      });
    }
  }

  // 12. runtime_eligible_first_wave (Wave 4B — optional but must be boolean)
  if (record.runtime_eligible_first_wave !== undefined && record.runtime_eligible_first_wave !== null) {
    if (typeof record.runtime_eligible_first_wave !== 'boolean') {
      errors.push('"runtime_eligible_first_wave" must be a boolean if provided');
    }
  }

  // 13. Deferred domain + runtime_eligible_first_wave: true is invalid
  if (
    record.runtime_eligible_first_wave === true &&
    record.planner_domain &&
    CBT_KNOWLEDGE_DEFERRED_DOMAINS.has(record.planner_domain)
  ) {
    errors.push(
      `"runtime_eligible_first_wave" cannot be true for deferred domain "${record.planner_domain}" — ` +
      `deferred domains (${[...CBT_KNOWLEDGE_DEFERRED_DOMAINS].join(', ')}) are not activated in Wave 4 first-wave`
    );
  }

  // 14. Evidence level below 'established' + runtime_eligible_first_wave: true — hard error
  if (
    record.runtime_eligible_first_wave === true &&
    record.evidence_level &&
    !RUNTIME_ELIGIBLE_EVIDENCE_LEVELS.has(record.evidence_level)
  ) {
    errors.push(
      `"runtime_eligible_first_wave" cannot be true when "evidence_level" is "${record.evidence_level}" — ` +
      `only 'established' and 'gold_standard' are eligible for runtime retrieval`
    );
  }

  // Warnings (non-blocking)
  if (record.runtime_eligible_first_wave === true && !record.planner_domain) {
    warnings.push(
      '"runtime_eligible_first_wave" is true but "planner_domain" is not set — ' +
      'this unit cannot be retrieved without a planner_domain'
    );
  }

  if (record.runtime_eligible_first_wave === true && !record.evidence_level) {
    warnings.push(
      '"runtime_eligible_first_wave" is true but "evidence_level" is not set — ' +
      'consider setting evidence_level to confirm retrieval eligibility'
    );
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

// ─── Normalization ────────────────────────────────────────────────────────────

/**
 * Normalizes a CBTCurriculumUnit record to its canonical shape for persistence.
 *
 * NORMALIZATION CONTRACT
 * ----------------------
 * - run after validateCBTCurriculumUnit — do not normalize invalid records.
 * - All optional fields default to safe values.
 * - runtime_eligible_first_wave is NEVER set to true by this function — it
 *   must be explicitly set in the input record (admin-gated).
 * - Deferred domains always result in runtime_eligible_first_wave: false,
 *   regardless of input.
 * - Unknown/invalid enum values for new fields default to safe values
 *   (normalization is tolerant for non-required fields; validation catches errors).
 * - safety_tags: deduped, bounded, and filtered to known values.
 * - languages: deduped.
 * - linked_outcome_patterns: deduped.
 * - priority_score: clamped to 0–10, defaulting to 5.
 *
 * @param {object} record - Raw record (should be valid per validateCBTCurriculumUnit).
 * @returns {object} Normalized record ready for persistence.
 */
export function normalizeCBTCurriculumUnit(record) {
  if (!record || typeof record !== 'object') {
    throw new Error('normalizeCBTCurriculumUnit: record must be a non-null object');
  }

  // Normalize languages — dedupe, filter to known values, default to ['en']
  const rawLanguages = Array.isArray(record.languages) ? record.languages : [];
  const languages = [...new Set(rawLanguages.filter(l => VALID_LANGUAGES.has(l)))];

  // Normalize linked_outcome_patterns — dedupe, filter to known values
  const rawOutcomePatterns = Array.isArray(record.linked_outcome_patterns)
    ? record.linked_outcome_patterns
    : [];
  const linked_outcome_patterns = [
    ...new Set(rawOutcomePatterns.filter(p => VALID_OUTCOME_PATTERNS.has(p))),
  ];

  // Normalize safety_tags — dedupe, filter to known values, bound to max
  const rawSafetyTags = Array.isArray(record.safety_tags) ? record.safety_tags : [];
  const safety_tags = [
    ...new Set(rawSafetyTags.filter(t => VALID_SAFETY_TAG_VALUES.has(t))),
  ].slice(0, SAFETY_TAGS_MAX_COUNT);

  // Normalize priority_score — clamp to 0–10
  const rawScore = Number(record.priority_score ?? 5);
  const priority_score = isNaN(rawScore)
    ? 5
    : Math.max(0, Math.min(10, rawScore));

  // Normalize planner_domain — clear if invalid
  const planner_domain =
    record.planner_domain && VALID_PLANNER_DOMAINS.has(record.planner_domain)
      ? record.planner_domain
      : undefined;

  // Normalize distress_suitability — default 'any' if not provided or invalid
  const distress_suitability =
    VALID_DISTRESS_SUITABILITY_VALUES.has(record.distress_suitability)
      ? record.distress_suitability
      : 'any';

  // Normalize evidence_level — default 'established' if not provided or invalid
  const evidence_level =
    VALID_EVIDENCE_LEVELS.has(record.evidence_level)
      ? record.evidence_level
      : 'established';

  // Normalize runtime_eligible_first_wave — strictly gated
  //   - Must be explicitly true in input
  //   - planner_domain must be in the first-wave allowed set (not deferred)
  //   - evidence_level must be 'established' or 'gold_standard'
  //   - If any gate fails, force false (conservative default)
  const inputEligible = record.runtime_eligible_first_wave === true;
  const domainAllowed =
    planner_domain !== undefined &&
    CBT_KNOWLEDGE_RUNTIME_ALLOWED_DOMAINS_FIRST_WAVE.has(planner_domain);
  const evidenceEligible = RUNTIME_ELIGIBLE_EVIDENCE_LEVELS.has(evidence_level);

  const runtime_eligible_first_wave =
    inputEligible && domainAllowed && evidenceEligible;

  // Normalize version — must be a positive integer, default 1
  const rawVersion = record.version;
  const version =
    typeof rawVersion === 'number' &&
    Number.isInteger(rawVersion) &&
    rawVersion >= 1
      ? rawVersion
      : 1;

  // Build normalized record — only include defined optional fields
  const normalized = {
    unit_type: record.unit_type?.trim() || '',
    title: record.title?.trim() || '',
    clinical_topic: record.clinical_topic?.trim() || '',
    when_to_use: record.when_to_use?.trim() || '',
    clinical_purpose: record.clinical_purpose?.trim() || '',
    content: record.content?.trim() || '',
    agent_usage_rules: record.agent_usage_rules?.trim() || '',
    priority_score,
    is_active: Boolean(record.is_active ?? true),
    version,
    runtime_eligible_first_wave,
    distress_suitability,
    evidence_level,
    safety_tags,
  };

  // Optional string fields — only include if non-empty
  if (record.directive_rewrite_pattern?.trim()) {
    normalized.directive_rewrite_pattern = record.directive_rewrite_pattern.trim();
  }
  if (record.contraindications?.trim()) {
    normalized.contraindications = record.contraindications.trim();
  }
  if (record.admin_notes?.trim()) {
    normalized.admin_notes = record.admin_notes.trim();
  }

  // Optional linked fields — only include if non-empty
  if (record.linked_hierarchy_level && VALID_HIERARCHY_LEVELS.has(record.linked_hierarchy_level)) {
    normalized.linked_hierarchy_level = record.linked_hierarchy_level;
  }
  if (linked_outcome_patterns.length > 0) {
    normalized.linked_outcome_patterns = linked_outcome_patterns;
  }
  if (languages.length > 0) {
    normalized.languages = languages;
  }
  if (planner_domain !== undefined) {
    normalized.planner_domain = planner_domain;
  }

  // Optional language_variants — pass through as-is (plain object).
  // This field is trusted admin-supplied input; its structure is not validated here.
  if (record.language_variants && typeof record.language_variants === 'object') {
    normalized.language_variants = record.language_variants;
  }

  // Optional source_chunk_ids — filter to non-empty strings
  if (Array.isArray(record.source_chunk_ids)) {
    const ids = record.source_chunk_ids.filter(
      id => typeof id === 'string' && id.trim()
    );
    if (ids.length > 0) {
      normalized.source_chunk_ids = ids;
    }
  }

  return normalized;
}

// ─── Runtime eligibility check ────────────────────────────────────────────────

/**
 * Returns whether a normalized CBTCurriculumUnit record is eligible for
 * Wave 4 first-wave runtime retrieval.
 *
 * This is a read-only check — it does not modify the record.
 * Use after normalizeCBTCurriculumUnit to confirm a record is retrieval-ready.
 *
 * A record is runtime-eligible if ALL of the following are true:
 *   1. runtime_eligible_first_wave is explicitly true
 *   2. planner_domain is set and in CBT_KNOWLEDGE_RUNTIME_ALLOWED_DOMAINS_FIRST_WAVE
 *   3. evidence_level is 'established' or 'gold_standard'
 *   4. is_active is true
 *
 * NOTE: This function does NOT check the VITE_THERAPIST_UPGRADE_KNOWLEDGE_ENABLED
 * flag.  Flag checking is the responsibility of the retrieval wiring layer (Wave 4C).
 *
 * @param {object} normalizedRecord - Record already processed by normalizeCBTCurriculumUnit.
 * @returns {boolean}
 */
export function isRuntimeEligibleFirstWave(normalizedRecord) {
  if (!normalizedRecord || typeof normalizedRecord !== 'object') return false;

  return (
    normalizedRecord.runtime_eligible_first_wave === true &&
    typeof normalizedRecord.planner_domain === 'string' &&
    CBT_KNOWLEDGE_RUNTIME_ALLOWED_DOMAINS_FIRST_WAVE.has(normalizedRecord.planner_domain) &&
    RUNTIME_ELIGIBLE_EVIDENCE_LEVELS.has(normalizedRecord.evidence_level) &&
    normalizedRecord.is_active === true
  );
}

/**
 * Returns whether a planner_domain is in the deferred (non-first-wave) set.
 *
 * Records with deferred domains may exist in the database but must never be
 * activated for runtime retrieval in Wave 4B.  This is an informational helper
 * for admin UIs and seed scripts.
 *
 * @param {string} plannerDomain
 * @returns {boolean}
 */
export function isDeferredDomain(plannerDomain) {
  if (typeof plannerDomain !== 'string') return false;
  return CBT_KNOWLEDGE_DEFERRED_DOMAINS.has(plannerDomain);
}

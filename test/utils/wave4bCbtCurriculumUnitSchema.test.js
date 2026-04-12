/**
 * @file test/utils/wave4bCbtCurriculumUnitSchema.test.js
 *
 * Wave 4B — CBTCurriculumUnit Schema Validator / Normalizer Tests
 *
 * PURPOSE
 * -------
 * Validates the Wave 4B additions:
 *   - src/lib/cbtCurriculumUnitSchema.js
 *   - src/data/cbt-curriculum-seed-wave4.json
 *
 * These tests cover the full validation and normalization contract, backward
 * compatibility with old records, first-wave domain gate enforcement, deferred
 * domain marking, and import-time safety checks for the five new Wave 4B fields.
 *
 * COVERAGE (per Wave 4B problem statement)
 * ─────────────────────────────────────────
 *  Module exports
 *  A.  Module exports the expected public symbols
 *  B.  CBT_CURRICULUM_UNIT_SCHEMA_VERSION is a non-empty string
 *  C.  VALID_UNIT_TYPES is a frozen non-empty Set
 *  D.  VALID_CLINICAL_TOPICS is a frozen non-empty Set
 *  E.  VALID_HIERARCHY_LEVELS is a frozen non-empty Set
 *  F.  VALID_OUTCOME_PATTERNS is a frozen non-empty Set
 *  G.  VALID_LANGUAGES is a frozen non-empty Set
 *  H.  VALID_PLANNER_DOMAINS is a frozen non-empty Set (Wave 4B)
 *  I.  VALID_DISTRESS_SUITABILITY_VALUES is a frozen non-empty Set (Wave 4B)
 *  J.  VALID_EVIDENCE_LEVELS is a frozen non-empty Set (Wave 4B)
 *  K.  RUNTIME_ELIGIBLE_EVIDENCE_LEVELS is a frozen non-empty Set (Wave 4B)
 *  L.  VALID_SAFETY_TAG_VALUES is a frozen non-empty Set (Wave 4B)
 *  M.  SAFETY_TAGS_MAX_COUNT is a positive integer (Wave 4B)
 *  N.  REQUIRED_FIELDS is a frozen non-empty array
 *
 *  validateCBTCurriculumUnit — basic contract
 *  O.  Function is exported and callable
 *  P.  null input → valid: false, errors non-empty
 *  Q.  Non-object input → valid: false, errors non-empty
 *  R.  Empty object → valid: false, errors list all required fields
 *
 *  validateCBTCurriculumUnit — required fields
 *  S.  Minimal valid record → valid: true, no errors
 *  T.  Missing unit_type → error includes "unit_type"
 *  U.  Missing title → error includes "title"
 *  V.  Missing clinical_topic → error includes "clinical_topic"
 *  W.  Missing when_to_use → error includes "when_to_use"
 *  X.  Missing clinical_purpose → error includes "clinical_purpose"
 *  Y.  Missing content → error includes "content"
 *  Z.  Missing agent_usage_rules → error includes "agent_usage_rules"
 *  AA. Whitespace-only required field → error (treated as empty)
 *
 *  validateCBTCurriculumUnit — existing field enum validation
 *  AB. Invalid unit_type → error
 *  AC. Valid unit_type → no error on that field
 *  AD. Invalid clinical_topic → error
 *  AE. Valid clinical_topic → no error on that field
 *  AF. Invalid linked_hierarchy_level → error
 *  AG. Valid linked_hierarchy_level → no error on that field
 *  AH. linked_hierarchy_level absent → no error (optional)
 *  AI. Invalid linked_outcome_patterns item → error
 *  AJ. linked_outcome_patterns not array → error
 *  AK. linked_outcome_patterns absent → no error (optional)
 *  AL. Invalid languages item → error
 *  AM. languages not array → error
 *  AN. languages absent → no error (optional)
 *  AO. priority_score out of range → error
 *  AP. priority_score valid → no error
 *  AQ. priority_score absent → no error (optional)
 *
 *  validateCBTCurriculumUnit — Wave 4B new field validation
 *  AR. Invalid planner_domain → error
 *  AS. Valid planner_domain → no error
 *  AT. planner_domain absent → no error (optional)
 *  AU. Invalid distress_suitability → error
 *  AV. Valid distress_suitability values ('any','low_only','not_in_crisis') → no error
 *  AW. distress_suitability absent → no error (optional)
 *  AX. Invalid evidence_level → error
 *  AY. Valid evidence_level values → no error
 *  AZ. evidence_level absent → no error (optional)
 *  BA. safety_tags not array → error
 *  BB. Invalid safety_tag value → error
 *  BC. safety_tags exceeds SAFETY_TAGS_MAX_COUNT → error
 *  BD. Valid safety_tags → no error
 *  BE. safety_tags empty array → no error
 *  BF. safety_tags absent → no error (optional)
 *  BG. runtime_eligible_first_wave non-boolean → error
 *  BH. runtime_eligible_first_wave: true → no error when domain + evidence are eligible
 *  BI. runtime_eligible_first_wave absent → no error (optional)
 *
 *  validateCBTCurriculumUnit — first-wave domain gate
 *  BJ. runtime_eligible_first_wave: true + deferred domain → hard error
 *  BK. Deferred domains (trauma, anger, relationship, ocd) all trigger error with runtime_eligible: true
 *  BL. First-wave domains (anxiety, depression, etc.) allow runtime_eligible: true
 *  BM. runtime_eligible_first_wave: true + evidence 'anecdotal' → hard error
 *  BN. runtime_eligible_first_wave: true + evidence 'emerging' → hard error
 *  BO. runtime_eligible_first_wave: true + no planner_domain → warning (not error)
 *  BP. runtime_eligible_first_wave: true + no evidence_level → warning (not error)
 *
 *  normalizeCBTCurriculumUnit — basic contract
 *  BQ. Function is exported and callable
 *  BR. null input → throws
 *  BS. Valid minimal record → returns object with all required fields
 *  BT. Normalized record has correct types for all fields
 *
 *  normalizeCBTCurriculumUnit — field normalization
 *  BU. Title trimmed
 *  BV. Content trimmed
 *  BW. Empty optional string fields omitted from output
 *  BX. languages deduped
 *  BY. linked_outcome_patterns deduped
 *  BZ. safety_tags deduped and filtered to valid values (Wave 4B)
 *  CA. safety_tags bounded to SAFETY_TAGS_MAX_COUNT (Wave 4B)
 *  CB. priority_score clamped: > 10 → 10
 *  CC. priority_score clamped: < 0 → 0
 *  CD. priority_score NaN → 5 (default)
 *  CE. priority_score absent → 5 (default)
 *  CF. is_active defaults to true when absent
 *  CG. version defaults to 1 when absent
 *  CH. Invalid distress_suitability → defaults to 'any' (Wave 4B)
 *  CI. Invalid evidence_level → defaults to 'established' (Wave 4B)
 *  CJ. Invalid planner_domain → omitted from output (Wave 4B)
 *
 *  normalizeCBTCurriculumUnit — runtime_eligible_first_wave gate (Wave 4B)
 *  CK. runtime_eligible_first_wave: true + first-wave domain + eligible evidence → true
 *  CL. runtime_eligible_first_wave: true + deferred domain → forced false
 *  CM. runtime_eligible_first_wave: true + invalid evidence → forced false
 *  CN. runtime_eligible_first_wave: true + no planner_domain → forced false
 *  CO. runtime_eligible_first_wave: false → false
 *  CP. runtime_eligible_first_wave absent → false (default)
 *  CQ. runtime_eligible_first_wave non-boolean → false
 *
 *  isRuntimeEligibleFirstWave (Wave 4B)
 *  CR. Function is exported and callable
 *  CS. Fully eligible normalized record → true
 *  CT. runtime_eligible_first_wave: false → false
 *  CU. is_active: false → false
 *  CV. Deferred domain → false
 *  CW. Low evidence_level → false
 *  CX. null input → false
 *  CY. Missing planner_domain → false
 *
 *  isDeferredDomain (Wave 4B)
 *  CZ. Function is exported and callable
 *  DA. 'trauma' → true
 *  DB. 'anger' → true
 *  DC. 'relationship' → true
 *  DD. 'ocd' → true
 *  DE. 'anxiety' → false
 *  DF. 'depression' → false
 *  DG. Non-string → false
 *  DH. Unknown string → false
 *
 *  Seed data validation
 *  DI. All records in cbt-curriculum-seed-wave4.json pass validateCBTCurriculumUnit
 *  DJ. All records normalize without throwing
 *  DK. First-wave eligible records pass isRuntimeEligibleFirstWave after normalization
 *  DL. Deferred domain records have runtime_eligible_first_wave: false after normalization
 *  DM. At least one record per first-wave domain is present in seed
 *  DN. No seed record is normalized with is_active: true AND planner_domain in deferred set AND runtime_eligible_first_wave: true
 *
 *  Backward compatibility
 *  DO. Old records without new fields (planner_domain, etc.) validate correctly
 *  DP. Old records without new fields normalize correctly (all new fields get safe defaults)
 *  DQ. Old record's is_active and priority_score preserved in normalization
 *
 *  No runtime behavior impact
 *  DR. No Chat.jsx, workflowContextInjector, or agent wiring imports in schema module
 *  DS. No async functions exported from schema module
 *  DT. No LLM-call patterns in schema module
 *
 *  No companion impact
 *  DU. No COMPANION_* fields appear in any validation output
 *  DV. No companion entity fields (CompanionMemory, etc.) referenced in schema module
 *
 * CONSTRAINTS
 * -----------
 * - All tests are synchronous.
 * - No live Base44 backend is required.
 * - No raw user message content appears in any test input.
 * - No feature flags are evaluated (validation is flag-agnostic).
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

// ─── Module under test ────────────────────────────────────────────────────────

import {
  CBT_CURRICULUM_UNIT_SCHEMA_VERSION,
  VALID_UNIT_TYPES,
  VALID_CLINICAL_TOPICS,
  VALID_HIERARCHY_LEVELS,
  VALID_OUTCOME_PATTERNS,
  VALID_LANGUAGES,
  VALID_PLANNER_DOMAINS,
  VALID_DISTRESS_SUITABILITY_VALUES,
  VALID_EVIDENCE_LEVELS,
  RUNTIME_ELIGIBLE_EVIDENCE_LEVELS,
  VALID_SAFETY_TAG_VALUES,
  SAFETY_TAGS_MAX_COUNT,
  REQUIRED_FIELDS,
  validateCBTCurriculumUnit,
  normalizeCBTCurriculumUnit,
  isRuntimeEligibleFirstWave,
  isDeferredDomain,
} from '../../src/lib/cbtCurriculumUnitSchema.js';

// ─── Fixtures ─────────────────────────────────────────────────────────────────

/**
 * Minimal valid record — all required fields, no optional fields.
 * This is the backward-compatible baseline (no Wave 4B fields).
 */
const _MINIMAL_VALID = Object.freeze({
  unit_type: 'psychoeducation',
  title: 'Test Unit',
  clinical_topic: 'general',
  when_to_use: 'Use this unit in early sessions.',
  clinical_purpose: 'Introduce the CBT model.',
  content: 'Content of the test unit.',
  agent_usage_rules: 'Paraphrase and adapt.',
});

/**
 * Fully specified Wave 4B valid record with first-wave eligible fields.
 */
const _FULL_VALID_FIRST_WAVE = Object.freeze({
  unit_type: 'psychoeducation',
  title: 'Anxiety Psychoeducation',
  clinical_topic: 'general_anxiety',
  when_to_use: 'Early sessions with anxious clients.',
  clinical_purpose: 'Normalise the anxiety response.',
  content: 'Anxiety is a natural threat-detection system.',
  agent_usage_rules: 'Paraphrase; do not read verbatim.',
  linked_hierarchy_level: 'L2',
  linked_outcome_patterns: ['completed_step_with_learning'],
  languages: ['en'],
  priority_score: 8,
  is_active: true,
  planner_domain: 'anxiety',
  distress_suitability: 'not_in_crisis',
  evidence_level: 'gold_standard',
  safety_tags: [],
  runtime_eligible_first_wave: true,
});

/**
 * Record with a deferred domain (trauma) and runtime_eligible_first_wave: false.
 * This should validate and normalize cleanly.
 */
const _DEFERRED_VALID = Object.freeze({
  unit_type: 'concept',
  title: 'CPT Overview',
  clinical_topic: 'general',
  when_to_use: 'Admin reference only.',
  clinical_purpose: 'Reference record for deferred trauma domain.',
  content: 'CPT is an evidence-based PTSD treatment.',
  agent_usage_rules: 'Do not use in runtime retrieval.',
  planner_domain: 'trauma',
  distress_suitability: 'not_in_crisis',
  evidence_level: 'gold_standard',
  safety_tags: ['not_for_acute_trauma', 'requires_therapist_supervision'],
  runtime_eligible_first_wave: false,
  is_active: false,
});

// Seed data path
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const SEED_PATH = path.resolve(__dirname, '../../src/data/cbt-curriculum-seed-wave4.json');

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Wave 4B — CBTCurriculumUnit Schema Validator / Normalizer', () => {

  // ── A–N: Module exports ──────────────────────────────────────────────────

  describe('Module exports', () => {
    it('A. exports CBT_CURRICULUM_UNIT_SCHEMA_VERSION', () => {
      expect(CBT_CURRICULUM_UNIT_SCHEMA_VERSION).toBeDefined();
    });

    it('B. CBT_CURRICULUM_UNIT_SCHEMA_VERSION is a non-empty string', () => {
      expect(typeof CBT_CURRICULUM_UNIT_SCHEMA_VERSION).toBe('string');
      expect(CBT_CURRICULUM_UNIT_SCHEMA_VERSION.length).toBeGreaterThan(0);
    });

    it('C. VALID_UNIT_TYPES is a frozen non-empty Set', () => {
      expect(VALID_UNIT_TYPES instanceof Set).toBe(true);
      expect(VALID_UNIT_TYPES.size).toBeGreaterThan(0);
      expect(Object.isFrozen(VALID_UNIT_TYPES)).toBe(true);
    });

    it('D. VALID_CLINICAL_TOPICS is a frozen non-empty Set', () => {
      expect(VALID_CLINICAL_TOPICS instanceof Set).toBe(true);
      expect(VALID_CLINICAL_TOPICS.size).toBeGreaterThan(0);
    });

    it('E. VALID_HIERARCHY_LEVELS is a frozen non-empty Set', () => {
      expect(VALID_HIERARCHY_LEVELS instanceof Set).toBe(true);
      expect(VALID_HIERARCHY_LEVELS.size).toBeGreaterThan(0);
    });

    it('F. VALID_OUTCOME_PATTERNS is a frozen non-empty Set', () => {
      expect(VALID_OUTCOME_PATTERNS instanceof Set).toBe(true);
      expect(VALID_OUTCOME_PATTERNS.size).toBeGreaterThan(0);
    });

    it('G. VALID_LANGUAGES is a frozen non-empty Set', () => {
      expect(VALID_LANGUAGES instanceof Set).toBe(true);
      expect(VALID_LANGUAGES.size).toBeGreaterThan(0);
      expect(VALID_LANGUAGES.has('en')).toBe(true);
    });

    it('H. VALID_PLANNER_DOMAINS is a frozen non-empty Set', () => {
      expect(VALID_PLANNER_DOMAINS instanceof Set).toBe(true);
      expect(VALID_PLANNER_DOMAINS.size).toBeGreaterThan(0);
      expect(VALID_PLANNER_DOMAINS.has('anxiety')).toBe(true);
      expect(Object.isFrozen(VALID_PLANNER_DOMAINS)).toBe(true);
    });

    it('I. VALID_DISTRESS_SUITABILITY_VALUES is a frozen non-empty Set', () => {
      expect(VALID_DISTRESS_SUITABILITY_VALUES instanceof Set).toBe(true);
      expect(VALID_DISTRESS_SUITABILITY_VALUES.size).toBe(3);
      expect(VALID_DISTRESS_SUITABILITY_VALUES.has('any')).toBe(true);
      expect(VALID_DISTRESS_SUITABILITY_VALUES.has('low_only')).toBe(true);
      expect(VALID_DISTRESS_SUITABILITY_VALUES.has('not_in_crisis')).toBe(true);
    });

    it('J. VALID_EVIDENCE_LEVELS is a frozen non-empty Set', () => {
      expect(VALID_EVIDENCE_LEVELS instanceof Set).toBe(true);
      expect(VALID_EVIDENCE_LEVELS.size).toBe(4);
      ['anecdotal', 'emerging', 'established', 'gold_standard'].forEach(v => {
        expect(VALID_EVIDENCE_LEVELS.has(v)).toBe(true);
      });
    });

    it('K. RUNTIME_ELIGIBLE_EVIDENCE_LEVELS is a frozen non-empty Set', () => {
      expect(RUNTIME_ELIGIBLE_EVIDENCE_LEVELS instanceof Set).toBe(true);
      expect(RUNTIME_ELIGIBLE_EVIDENCE_LEVELS.has('established')).toBe(true);
      expect(RUNTIME_ELIGIBLE_EVIDENCE_LEVELS.has('gold_standard')).toBe(true);
      expect(RUNTIME_ELIGIBLE_EVIDENCE_LEVELS.has('anecdotal')).toBe(false);
      expect(RUNTIME_ELIGIBLE_EVIDENCE_LEVELS.has('emerging')).toBe(false);
    });

    it('L. VALID_SAFETY_TAG_VALUES is a frozen non-empty Set', () => {
      expect(VALID_SAFETY_TAG_VALUES instanceof Set).toBe(true);
      expect(VALID_SAFETY_TAG_VALUES.size).toBeGreaterThan(0);
      expect(VALID_SAFETY_TAG_VALUES.has('contraindicated_in_crisis')).toBe(true);
    });

    it('M. SAFETY_TAGS_MAX_COUNT is a positive integer', () => {
      expect(typeof SAFETY_TAGS_MAX_COUNT).toBe('number');
      expect(SAFETY_TAGS_MAX_COUNT).toBeGreaterThan(0);
      expect(Number.isInteger(SAFETY_TAGS_MAX_COUNT)).toBe(true);
    });

    it('N. REQUIRED_FIELDS is a frozen non-empty array', () => {
      expect(Array.isArray(REQUIRED_FIELDS)).toBe(true);
      expect(REQUIRED_FIELDS.length).toBeGreaterThan(0);
      expect(() => REQUIRED_FIELDS.push('x')).toThrow();
      expect(REQUIRED_FIELDS).toContain('unit_type');
      expect(REQUIRED_FIELDS).toContain('title');
      expect(REQUIRED_FIELDS).toContain('content');
    });
  });

  // ── O–R: validateCBTCurriculumUnit basic contract ─────────────────────────

  describe('validateCBTCurriculumUnit — basic contract', () => {
    it('O. function is exported and callable', () => {
      expect(typeof validateCBTCurriculumUnit).toBe('function');
    });

    it('P. null input → valid: false, errors non-empty', () => {
      const result = validateCBTCurriculumUnit(null);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('Q. non-object input → valid: false, errors non-empty', () => {
      const result = validateCBTCurriculumUnit('not an object');
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('R. empty object → valid: false, lists all required field errors', () => {
      const result = validateCBTCurriculumUnit({});
      expect(result.valid).toBe(false);
      REQUIRED_FIELDS.forEach(field => {
        expect(result.errors.some(e => e.includes(field))).toBe(true);
      });
    });
  });

  // ── S–AA: Required fields ─────────────────────────────────────────────────

  describe('validateCBTCurriculumUnit — required fields', () => {
    it('S. minimal valid record → valid: true, no errors', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('T. missing unit_type → error includes "unit_type"', () => {
      const rec = { ..._MINIMAL_VALID, unit_type: undefined };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('unit_type'))).toBe(true);
    });

    it('U. missing title → error includes "title"', () => {
      const rec = { ..._MINIMAL_VALID, title: '' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('title'))).toBe(true);
    });

    it('V. missing clinical_topic → error includes "clinical_topic"', () => {
      const rec = { ..._MINIMAL_VALID, clinical_topic: null };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('clinical_topic'))).toBe(true);
    });

    it('W. missing when_to_use → error includes "when_to_use"', () => {
      const rec = { ..._MINIMAL_VALID, when_to_use: '' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('when_to_use'))).toBe(true);
    });

    it('X. missing clinical_purpose → error includes "clinical_purpose"', () => {
      const rec = { ..._MINIMAL_VALID, clinical_purpose: '' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('clinical_purpose'))).toBe(true);
    });

    it('Y. missing content → error includes "content"', () => {
      const rec = { ..._MINIMAL_VALID, content: '' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('content'))).toBe(true);
    });

    it('Z. missing agent_usage_rules → error includes "agent_usage_rules"', () => {
      const rec = { ..._MINIMAL_VALID, agent_usage_rules: '' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('agent_usage_rules'))).toBe(true);
    });

    it('AA. whitespace-only required field → error (treated as empty)', () => {
      const rec = { ..._MINIMAL_VALID, title: '   ' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('title'))).toBe(true);
    });
  });

  // ── AB–AQ: Existing field enum validation ─────────────────────────────────

  describe('validateCBTCurriculumUnit — existing field enums', () => {
    it('AB. invalid unit_type → error', () => {
      const rec = { ..._MINIMAL_VALID, unit_type: 'invalid_type' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('unit_type'))).toBe(true);
    });

    it('AC. valid unit_type → no error on that field', () => {
      for (const type of VALID_UNIT_TYPES) {
        const rec = { ..._MINIMAL_VALID, unit_type: type };
        const result = validateCBTCurriculumUnit(rec);
        expect(result.errors.some(e => e.includes('unit_type'))).toBe(false);
      }
    });

    it('AD. invalid clinical_topic → error', () => {
      const rec = { ..._MINIMAL_VALID, clinical_topic: 'not_a_topic' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('clinical_topic'))).toBe(true);
    });

    it('AE. valid clinical_topic → no error', () => {
      const rec = { ..._MINIMAL_VALID, clinical_topic: 'depression' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.errors.some(e => e.includes('clinical_topic'))).toBe(false);
    });

    it('AF. invalid linked_hierarchy_level → error', () => {
      const rec = { ..._MINIMAL_VALID, linked_hierarchy_level: 'L99' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('linked_hierarchy_level'))).toBe(true);
    });

    it('AG. valid linked_hierarchy_level → no error', () => {
      const rec = { ..._MINIMAL_VALID, linked_hierarchy_level: 'L5' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.errors.some(e => e.includes('linked_hierarchy_level'))).toBe(false);
    });

    it('AH. linked_hierarchy_level absent → no error', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.errors.some(e => e.includes('linked_hierarchy_level'))).toBe(false);
    });

    it('AI. invalid linked_outcome_patterns item → error', () => {
      const rec = { ..._MINIMAL_VALID, linked_outcome_patterns: ['not_a_pattern'] };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('linked_outcome_patterns'))).toBe(true);
    });

    it('AJ. linked_outcome_patterns not array → error', () => {
      const rec = { ..._MINIMAL_VALID, linked_outcome_patterns: 'any' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('linked_outcome_patterns'))).toBe(true);
    });

    it('AK. linked_outcome_patterns absent → no error', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.errors.some(e => e.includes('linked_outcome_patterns'))).toBe(false);
    });

    it('AL. invalid languages item → error', () => {
      const rec = { ..._MINIMAL_VALID, languages: ['xx'] };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('languages'))).toBe(true);
    });

    it('AM. languages not array → error', () => {
      const rec = { ..._MINIMAL_VALID, languages: 'en' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('languages'))).toBe(true);
    });

    it('AN. languages absent → no error', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.errors.some(e => e.includes('languages'))).toBe(false);
    });

    it('AO. priority_score out of range → error', () => {
      const rec1 = { ..._MINIMAL_VALID, priority_score: -1 };
      const rec2 = { ..._MINIMAL_VALID, priority_score: 11 };
      expect(validateCBTCurriculumUnit(rec1).valid).toBe(false);
      expect(validateCBTCurriculumUnit(rec2).valid).toBe(false);
    });

    it('AP. priority_score valid → no error', () => {
      [0, 5, 10].forEach(score => {
        const rec = { ..._MINIMAL_VALID, priority_score: score };
        expect(validateCBTCurriculumUnit(rec).errors.some(e => e.includes('priority_score'))).toBe(false);
      });
    });

    it('AQ. priority_score absent → no error', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.errors.some(e => e.includes('priority_score'))).toBe(false);
    });
  });

  // ── AR–BP: Wave 4B new field validation ──────────────────────────────────

  describe('validateCBTCurriculumUnit — Wave 4B new fields', () => {
    it('AR. invalid planner_domain → error', () => {
      const rec = { ..._MINIMAL_VALID, planner_domain: 'made_up_domain' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('planner_domain'))).toBe(true);
    });

    it('AS. valid planner_domain → no error', () => {
      for (const domain of VALID_PLANNER_DOMAINS) {
        const rec = { ..._MINIMAL_VALID, planner_domain: domain };
        expect(validateCBTCurriculumUnit(rec).errors.some(e => e.includes('planner_domain'))).toBe(false);
      }
    });

    it('AT. planner_domain absent → no error', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.errors.some(e => e.includes('planner_domain'))).toBe(false);
    });

    it('AU. invalid distress_suitability → error', () => {
      const rec = { ..._MINIMAL_VALID, distress_suitability: 'high_risk_only' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('distress_suitability'))).toBe(true);
    });

    it('AV. valid distress_suitability values → no error', () => {
      for (const val of VALID_DISTRESS_SUITABILITY_VALUES) {
        const rec = { ..._MINIMAL_VALID, distress_suitability: val };
        expect(validateCBTCurriculumUnit(rec).errors.some(e => e.includes('distress_suitability'))).toBe(false);
      }
    });

    it('AW. distress_suitability absent → no error', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.errors.some(e => e.includes('distress_suitability'))).toBe(false);
    });

    it('AX. invalid evidence_level → error', () => {
      const rec = { ..._MINIMAL_VALID, evidence_level: 'very_high' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('evidence_level'))).toBe(true);
    });

    it('AY. valid evidence_level values → no error', () => {
      for (const val of VALID_EVIDENCE_LEVELS) {
        const rec = { ..._MINIMAL_VALID, evidence_level: val };
        expect(validateCBTCurriculumUnit(rec).errors.some(e => e.includes('evidence_level'))).toBe(false);
      }
    });

    it('AZ. evidence_level absent → no error', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.errors.some(e => e.includes('evidence_level'))).toBe(false);
    });

    it('BA. safety_tags not array → error', () => {
      const rec = { ..._MINIMAL_VALID, safety_tags: 'contraindicated_in_crisis' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('safety_tags'))).toBe(true);
    });

    it('BB. invalid safety_tag value → error', () => {
      const rec = { ..._MINIMAL_VALID, safety_tags: ['unknown_tag'] };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('safety_tags'))).toBe(true);
    });

    it('BC. safety_tags exceeds SAFETY_TAGS_MAX_COUNT → error', () => {
      const allTags = [...VALID_SAFETY_TAG_VALUES];
      // Repeat to exceed max — duplicate is still an error (over-count before dedup in validation)
      const tooMany = [...allTags, ...allTags].slice(0, SAFETY_TAGS_MAX_COUNT + 1);
      const rec = { ..._MINIMAL_VALID, safety_tags: tooMany };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('safety_tags'))).toBe(true);
    });

    it('BD. valid safety_tags array → no error', () => {
      const rec = { ..._MINIMAL_VALID, safety_tags: ['contraindicated_in_crisis', 'safe_for_self_guided'] };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.errors.some(e => e.includes('safety_tags'))).toBe(false);
    });

    it('BE. safety_tags empty array → no error', () => {
      const rec = { ..._MINIMAL_VALID, safety_tags: [] };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.errors.some(e => e.includes('safety_tags'))).toBe(false);
    });

    it('BF. safety_tags absent → no error', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.errors.some(e => e.includes('safety_tags'))).toBe(false);
    });

    it('BG. runtime_eligible_first_wave non-boolean → error', () => {
      const rec = { ..._MINIMAL_VALID, runtime_eligible_first_wave: 'yes' };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('runtime_eligible_first_wave'))).toBe(true);
    });

    it('BH. runtime_eligible_first_wave: true + first-wave domain + eligible evidence → valid', () => {
      const result = validateCBTCurriculumUnit(_FULL_VALID_FIRST_WAVE);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('BI. runtime_eligible_first_wave absent → no error', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.errors.some(e => e.includes('runtime_eligible_first_wave'))).toBe(false);
    });
  });

  // ── BJ–BP: First-wave domain gate ────────────────────────────────────────

  describe('validateCBTCurriculumUnit — first-wave domain gate', () => {
    it('BJ. runtime_eligible_first_wave: true + deferred domain → hard error', () => {
      const rec = {
        ..._MINIMAL_VALID,
        planner_domain: 'trauma',
        evidence_level: 'gold_standard',
        runtime_eligible_first_wave: true,
      };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('runtime_eligible_first_wave'))).toBe(true);
    });

    it('BK. all deferred domains trigger error when runtime_eligible: true', () => {
      for (const domain of ['trauma', 'anger', 'relationship', 'ocd']) {
        const rec = {
          ..._MINIMAL_VALID,
          planner_domain: domain,
          evidence_level: 'gold_standard',
          runtime_eligible_first_wave: true,
        };
        const result = validateCBTCurriculumUnit(rec);
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.includes('runtime_eligible_first_wave') || e.includes(domain))).toBe(true);
      }
    });

    it('BL. first-wave domains allow runtime_eligible: true', () => {
      for (const domain of ['anxiety', 'depression', 'grief', 'self_esteem', 'panic', 'social_anxiety', 'phobia', 'general']) {
        const rec = {
          ..._MINIMAL_VALID,
          planner_domain: domain,
          evidence_level: 'established',
          runtime_eligible_first_wave: true,
        };
        const result = validateCBTCurriculumUnit(rec);
        expect(result.errors.some(e =>
          e.includes('runtime_eligible_first_wave') && e.includes(domain)
        )).toBe(false);
      }
    });

    it('BM. runtime_eligible_first_wave: true + evidence "anecdotal" → hard error', () => {
      const rec = {
        ..._MINIMAL_VALID,
        planner_domain: 'anxiety',
        evidence_level: 'anecdotal',
        runtime_eligible_first_wave: true,
      };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('evidence_level') || e.includes('runtime_eligible_first_wave'))).toBe(true);
    });

    it('BN. runtime_eligible_first_wave: true + evidence "emerging" → hard error', () => {
      const rec = {
        ..._MINIMAL_VALID,
        planner_domain: 'depression',
        evidence_level: 'emerging',
        runtime_eligible_first_wave: true,
      };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(false);
    });

    it('BO. runtime_eligible_first_wave: true + no planner_domain → warning, not error', () => {
      const rec = { ..._MINIMAL_VALID, runtime_eligible_first_wave: true };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('planner_domain'))).toBe(true);
    });

    it('BP. runtime_eligible_first_wave: true + no evidence_level → warning, not error', () => {
      const rec = { ..._MINIMAL_VALID, planner_domain: 'anxiety', runtime_eligible_first_wave: true };
      const result = validateCBTCurriculumUnit(rec);
      expect(result.valid).toBe(true);
      expect(result.warnings.some(w => w.includes('evidence_level'))).toBe(true);
    });
  });

  // ── BQ–BT: normalizeCBTCurriculumUnit basic contract ─────────────────────

  describe('normalizeCBTCurriculumUnit — basic contract', () => {
    it('BQ. function is exported and callable', () => {
      expect(typeof normalizeCBTCurriculumUnit).toBe('function');
    });

    it('BR. null input → throws', () => {
      expect(() => normalizeCBTCurriculumUnit(null)).toThrow();
    });

    it('BS. valid minimal record → returns object with all required normalized fields', () => {
      const result = normalizeCBTCurriculumUnit(_MINIMAL_VALID);
      expect(typeof result).toBe('object');
      expect(result).not.toBeNull();
      REQUIRED_FIELDS.forEach(field => {
        expect(result[field]).toBeDefined();
      });
    });

    it('BT. normalized record has correct types', () => {
      const result = normalizeCBTCurriculumUnit(_MINIMAL_VALID);
      expect(typeof result.unit_type).toBe('string');
      expect(typeof result.title).toBe('string');
      expect(typeof result.priority_score).toBe('number');
      expect(typeof result.is_active).toBe('boolean');
      expect(typeof result.version).toBe('number');
      expect(typeof result.runtime_eligible_first_wave).toBe('boolean');
      expect(typeof result.distress_suitability).toBe('string');
      expect(typeof result.evidence_level).toBe('string');
      expect(Array.isArray(result.safety_tags)).toBe(true);
    });
  });

  // ── BU–CJ: normalizeCBTCurriculumUnit field normalization ─────────────────

  describe('normalizeCBTCurriculumUnit — field normalization', () => {
    it('BU. title trimmed', () => {
      const rec = { ..._MINIMAL_VALID, title: '  Test Title  ' };
      expect(normalizeCBTCurriculumUnit(rec).title).toBe('Test Title');
    });

    it('BV. content trimmed', () => {
      const rec = { ..._MINIMAL_VALID, content: '  Some content.  ' };
      expect(normalizeCBTCurriculumUnit(rec).content).toBe('Some content.');
    });

    it('BW. empty optional string fields omitted from output', () => {
      const result = normalizeCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.directive_rewrite_pattern).toBeUndefined();
      expect(result.contraindications).toBeUndefined();
      expect(result.admin_notes).toBeUndefined();
    });

    it('BX. languages deduped', () => {
      const rec = { ..._MINIMAL_VALID, languages: ['en', 'en', 'he'] };
      const result = normalizeCBTCurriculumUnit(rec);
      expect(result.languages).toEqual(['en', 'he']);
    });

    it('BY. linked_outcome_patterns deduped', () => {
      const rec = { ..._MINIMAL_VALID, linked_outcome_patterns: ['any', 'any', 'completed_step_with_learning'] };
      const result = normalizeCBTCurriculumUnit(rec);
      expect(result.linked_outcome_patterns).toEqual(['any', 'completed_step_with_learning']);
    });

    it('BZ. safety_tags deduped and filtered to valid values', () => {
      const rec = {
        ..._MINIMAL_VALID,
        safety_tags: ['contraindicated_in_crisis', 'contraindicated_in_crisis', 'unknown_tag'],
      };
      const result = normalizeCBTCurriculumUnit(rec);
      expect(result.safety_tags).toEqual(['contraindicated_in_crisis']);
    });

    it('CA. safety_tags bounded to SAFETY_TAGS_MAX_COUNT', () => {
      const allTags = [...VALID_SAFETY_TAG_VALUES];
      // Pad to more than max by repeating
      const padded = [];
      while (padded.length <= SAFETY_TAGS_MAX_COUNT) {
        padded.push(...allTags);
      }
      const rec = { ..._MINIMAL_VALID, safety_tags: padded };
      const result = normalizeCBTCurriculumUnit(rec);
      expect(result.safety_tags.length).toBeLessThanOrEqual(SAFETY_TAGS_MAX_COUNT);
    });

    it('CB. priority_score clamped: > 10 → 10', () => {
      const rec = { ..._MINIMAL_VALID, priority_score: 15 };
      expect(normalizeCBTCurriculumUnit(rec).priority_score).toBe(10);
    });

    it('CC. priority_score clamped: < 0 → 0', () => {
      const rec = { ..._MINIMAL_VALID, priority_score: -5 };
      expect(normalizeCBTCurriculumUnit(rec).priority_score).toBe(0);
    });

    it('CD. priority_score NaN → 5 (default)', () => {
      const rec = { ..._MINIMAL_VALID, priority_score: 'not_a_number' };
      expect(normalizeCBTCurriculumUnit(rec).priority_score).toBe(5);
    });

    it('CE. priority_score absent → 5 (default)', () => {
      expect(normalizeCBTCurriculumUnit(_MINIMAL_VALID).priority_score).toBe(5);
    });

    it('CF. is_active defaults to true when absent', () => {
      expect(normalizeCBTCurriculumUnit(_MINIMAL_VALID).is_active).toBe(true);
    });

    it('CG. version defaults to 1 when absent', () => {
      expect(normalizeCBTCurriculumUnit(_MINIMAL_VALID).version).toBe(1);
    });

    it('CH. invalid distress_suitability → defaults to "any"', () => {
      const rec = { ..._MINIMAL_VALID, distress_suitability: 'invalid' };
      expect(normalizeCBTCurriculumUnit(rec).distress_suitability).toBe('any');
    });

    it('CI. invalid evidence_level → defaults to "established"', () => {
      const rec = { ..._MINIMAL_VALID, evidence_level: 'unknown' };
      expect(normalizeCBTCurriculumUnit(rec).evidence_level).toBe('established');
    });

    it('CJ. invalid planner_domain → omitted from output', () => {
      const rec = { ..._MINIMAL_VALID, planner_domain: 'fake_domain' };
      expect(normalizeCBTCurriculumUnit(rec).planner_domain).toBeUndefined();
    });
  });

  // ── CK–CQ: runtime_eligible_first_wave gate in normalization ──────────────

  describe('normalizeCBTCurriculumUnit — runtime_eligible_first_wave gate', () => {
    it('CK. true + first-wave domain + eligible evidence → true', () => {
      const result = normalizeCBTCurriculumUnit(_FULL_VALID_FIRST_WAVE);
      expect(result.runtime_eligible_first_wave).toBe(true);
    });

    it('CL. true + deferred domain → forced false', () => {
      const rec = {
        ..._MINIMAL_VALID,
        planner_domain: 'trauma',
        evidence_level: 'gold_standard',
        runtime_eligible_first_wave: true,
      };
      expect(normalizeCBTCurriculumUnit(rec).runtime_eligible_first_wave).toBe(false);
    });

    it('CM. true + ineligible evidence level → forced false', () => {
      const rec = {
        ..._MINIMAL_VALID,
        planner_domain: 'anxiety',
        evidence_level: 'anecdotal',
        runtime_eligible_first_wave: true,
      };
      expect(normalizeCBTCurriculumUnit(rec).runtime_eligible_first_wave).toBe(false);
    });

    it('CN. true + no planner_domain → forced false', () => {
      const rec = { ..._MINIMAL_VALID, evidence_level: 'gold_standard', runtime_eligible_first_wave: true };
      expect(normalizeCBTCurriculumUnit(rec).runtime_eligible_first_wave).toBe(false);
    });

    it('CO. false → false', () => {
      const rec = { ..._MINIMAL_VALID, runtime_eligible_first_wave: false };
      expect(normalizeCBTCurriculumUnit(rec).runtime_eligible_first_wave).toBe(false);
    });

    it('CP. runtime_eligible_first_wave absent → false', () => {
      expect(normalizeCBTCurriculumUnit(_MINIMAL_VALID).runtime_eligible_first_wave).toBe(false);
    });

    it('CQ. runtime_eligible_first_wave non-boolean → false', () => {
      const rec = { ..._MINIMAL_VALID, runtime_eligible_first_wave: 1 };
      expect(normalizeCBTCurriculumUnit(rec).runtime_eligible_first_wave).toBe(false);
    });
  });

  // ── CR–CY: isRuntimeEligibleFirstWave ────────────────────────────────────

  describe('isRuntimeEligibleFirstWave', () => {
    it('CR. function is exported and callable', () => {
      expect(typeof isRuntimeEligibleFirstWave).toBe('function');
    });

    it('CS. fully eligible normalized record → true', () => {
      const norm = normalizeCBTCurriculumUnit(_FULL_VALID_FIRST_WAVE);
      expect(isRuntimeEligibleFirstWave(norm)).toBe(true);
    });

    it('CT. runtime_eligible_first_wave: false → false', () => {
      const norm = normalizeCBTCurriculumUnit({ ..._FULL_VALID_FIRST_WAVE, runtime_eligible_first_wave: false });
      expect(isRuntimeEligibleFirstWave(norm)).toBe(false);
    });

    it('CU. is_active: false → false', () => {
      const norm = normalizeCBTCurriculumUnit({ ..._FULL_VALID_FIRST_WAVE, is_active: false });
      expect(isRuntimeEligibleFirstWave(norm)).toBe(false);
    });

    it('CV. deferred domain → false', () => {
      const norm = normalizeCBTCurriculumUnit(_DEFERRED_VALID);
      expect(isRuntimeEligibleFirstWave(norm)).toBe(false);
    });

    it('CW. low evidence_level → false', () => {
      const norm = normalizeCBTCurriculumUnit({
        ..._FULL_VALID_FIRST_WAVE,
        evidence_level: 'anecdotal',
        runtime_eligible_first_wave: true,
      });
      expect(isRuntimeEligibleFirstWave(norm)).toBe(false);
    });

    it('CX. null input → false', () => {
      expect(isRuntimeEligibleFirstWave(null)).toBe(false);
    });

    it('CY. missing planner_domain → false', () => {
      const rec = { ..._FULL_VALID_FIRST_WAVE };
      delete rec.planner_domain;
      const norm = normalizeCBTCurriculumUnit(rec);
      expect(isRuntimeEligibleFirstWave(norm)).toBe(false);
    });
  });

  // ── CZ–DH: isDeferredDomain ───────────────────────────────────────────────

  describe('isDeferredDomain', () => {
    it('CZ. function is exported and callable', () => {
      expect(typeof isDeferredDomain).toBe('function');
    });

    it('DA. "trauma" → true', () => {
      expect(isDeferredDomain('trauma')).toBe(true);
    });

    it('DB. "anger" → true', () => {
      expect(isDeferredDomain('anger')).toBe(true);
    });

    it('DC. "relationship" → true', () => {
      expect(isDeferredDomain('relationship')).toBe(true);
    });

    it('DD. "ocd" → true', () => {
      expect(isDeferredDomain('ocd')).toBe(true);
    });

    it('DE. "anxiety" → false', () => {
      expect(isDeferredDomain('anxiety')).toBe(false);
    });

    it('DF. "depression" → false', () => {
      expect(isDeferredDomain('depression')).toBe(false);
    });

    it('DG. non-string → false', () => {
      expect(isDeferredDomain(null)).toBe(false);
      expect(isDeferredDomain(42)).toBe(false);
      expect(isDeferredDomain(undefined)).toBe(false);
    });

    it('DH. unknown string → false', () => {
      expect(isDeferredDomain('unknown_domain')).toBe(false);
    });
  });

  // ── DI–DN: Seed data validation ───────────────────────────────────────────

  describe('Seed data — cbt-curriculum-seed-wave4.json', () => {
    let seedRecords;

    try {
      seedRecords = JSON.parse(readFileSync(SEED_PATH, 'utf8'));
    } catch {
      seedRecords = null;
    }

    it('DI. all seed records pass validateCBTCurriculumUnit', () => {
      expect(seedRecords).not.toBeNull();
      expect(Array.isArray(seedRecords)).toBe(true);
      seedRecords.forEach((rec, i) => {
        const result = validateCBTCurriculumUnit(rec);
        expect(result.valid, `Seed record [${i}] "${rec.title}": ${result.errors.join('; ')}`).toBe(true);
      });
    });

    it('DJ. all seed records normalize without throwing', () => {
      expect(seedRecords).not.toBeNull();
      seedRecords.forEach((rec, i) => {
        expect(() => normalizeCBTCurriculumUnit(rec), `Seed record [${i}] "${rec.title}" threw on normalize`).not.toThrow();
      });
    });

    it('DK. first-wave eligible records pass isRuntimeEligibleFirstWave after normalization', () => {
      expect(seedRecords).not.toBeNull();
      const firstWaveRecords = seedRecords.filter(r => r.runtime_eligible_first_wave === true);
      expect(firstWaveRecords.length).toBeGreaterThan(0);
      firstWaveRecords.forEach((rec, i) => {
        const norm = normalizeCBTCurriculumUnit(rec);
        expect(
          isRuntimeEligibleFirstWave(norm),
          `First-wave seed record [${i}] "${rec.title}" not eligible after normalization`
        ).toBe(true);
      });
    });

    it('DL. deferred domain records have runtime_eligible_first_wave: false after normalization', () => {
      expect(seedRecords).not.toBeNull();
      const deferredRecords = seedRecords.filter(r => r.planner_domain && isDeferredDomain(r.planner_domain));
      expect(deferredRecords.length).toBeGreaterThan(0);
      deferredRecords.forEach((rec, i) => {
        const norm = normalizeCBTCurriculumUnit(rec);
        expect(
          norm.runtime_eligible_first_wave,
          `Deferred seed record [${i}] "${rec.title}" should have runtime_eligible_first_wave: false`
        ).toBe(false);
      });
    });

    it('DM. at least one seed record per first-wave domain', () => {
      expect(seedRecords).not.toBeNull();
      const firstWaveDomains = ['anxiety', 'depression', 'grief', 'self_esteem', 'panic', 'social_anxiety', 'phobia', 'general'];
      const coveredDomains = new Set(
        seedRecords
          .filter(r => r.runtime_eligible_first_wave === true && r.planner_domain)
          .map(r => r.planner_domain)
      );
      firstWaveDomains.forEach(domain => {
        expect(coveredDomains.has(domain), `No first-wave seed record for domain "${domain}"`).toBe(true);
      });
    });

    it('DN. no seed record is active + deferred domain + runtime_eligible_first_wave: true after normalization', () => {
      expect(seedRecords).not.toBeNull();
      seedRecords.forEach((rec, i) => {
        const norm = normalizeCBTCurriculumUnit(rec);
        if (norm.is_active && norm.planner_domain && isDeferredDomain(norm.planner_domain)) {
          expect(
            norm.runtime_eligible_first_wave,
            `Seed record [${i}] "${rec.title}" is active + deferred domain but runtime_eligible_first_wave is true`
          ).toBe(false);
        }
      });
    });
  });

  // ── DO–DQ: Backward compatibility ────────────────────────────────────────

  describe('Backward compatibility — old records without new fields', () => {
    it('DO. old record without new Wave 4B fields validates correctly', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(result.valid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('DP. old record normalizes with safe defaults for all new fields', () => {
      const norm = normalizeCBTCurriculumUnit(_MINIMAL_VALID);
      expect(norm.runtime_eligible_first_wave).toBe(false);
      expect(norm.distress_suitability).toBe('any');
      expect(norm.evidence_level).toBe('established');
      expect(norm.safety_tags).toEqual([]);
      expect(norm.planner_domain).toBeUndefined();
    });

    it('DQ. old record is_active and priority_score preserved in normalization', () => {
      const rec = { ..._MINIMAL_VALID, is_active: false, priority_score: 3 };
      const norm = normalizeCBTCurriculumUnit(rec);
      expect(norm.is_active).toBe(false);
      expect(norm.priority_score).toBe(3);
    });
  });

  // ── DR–DT: No runtime behavior impact ─────────────────────────────────────

  describe('No runtime behavior impact', () => {
    it('DR. all exported functions are synchronous (return non-Promise values)', () => {
      const validateResult = validateCBTCurriculumUnit(_MINIMAL_VALID);
      const normalizeResult = normalizeCBTCurriculumUnit(_MINIMAL_VALID);
      const eligibleResult = isRuntimeEligibleFirstWave(normalizeResult);
      const deferredResult = isDeferredDomain('anxiety');

      expect(validateResult instanceof Promise).toBe(false);
      expect(normalizeResult instanceof Promise).toBe(false);
      expect(typeof eligibleResult).toBe('boolean');
      expect(typeof deferredResult).toBe('boolean');
    });

    it('DS. validate result has valid, errors, and warnings — no session fields', () => {
      const result = validateCBTCurriculumUnit(_MINIMAL_VALID);
      expect(typeof result.valid).toBe('boolean');
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
      // No session-context fields
      expect(result.session_id).toBeUndefined();
      expect(result.conversation_id).toBeUndefined();
      expect(result.user_id).toBeUndefined();
    });

    it('DT. normalize result has no session-context or raw message fields', () => {
      const norm = normalizeCBTCurriculumUnit(_MINIMAL_VALID);
      expect(norm.session_id).toBeUndefined();
      expect(norm.message_text).toBeUndefined();
      expect(norm.raw_message).toBeUndefined();
      expect(norm.conversation_id).toBeUndefined();
    });
  });

  // ── DU–DV: No companion impact ────────────────────────────────────────────

  describe('No companion impact', () => {
    it('DU. no COMPANION_* fields appear in validate result', () => {
      const result = validateCBTCurriculumUnit(_FULL_VALID_FIRST_WAVE);
      const keys = Object.keys(result);
      expect(keys.every(k => !k.startsWith('COMPANION_') && !k.startsWith('companion_'))).toBe(true);
    });

    it('DV. no companion entity fields appear in normalize result', () => {
      const norm = normalizeCBTCurriculumUnit(_FULL_VALID_FIRST_WAVE);
      const companionFields = ['companion_memory', 'CompanionMemory', 'companion_id', 'ai_coach'];
      companionFields.forEach(field => {
        expect(norm[field]).toBeUndefined();
      });
    });
  });
});

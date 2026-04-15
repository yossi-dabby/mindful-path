/**
 * @file test/utils/therapistPlannerHierarchy.test.js
 *
 * Therapist Planner Hierarchy — Precedence Model Regression Tests
 *
 * Validates that the therapist planner hierarchy is correctly enforced and
 * that legacy direct-action gates do NOT override higher-priority rules.
 *
 * REQUIRED PRECEDENCE ORDER (highest → lowest):
 *   1. Safety containment
 *   2. Formulation-first
 *   3. Teen/shame/grief/scrupulosity/trauma pacing rules
 *   4. First-disclosure holding rules
 *   5. Intervention readiness gates
 *   6. Competence/planner layers
 *   7. Domain-specific direct-action heuristics (LAST, lowest priority)
 *
 * REGRESSION CASES (12):
 *   1.  Social anxiety — old direct-action gate no longer dominates
 *   2.  Teen social shame — teen sensitivity outranks social-action gate
 *   3.  OCD checking — formulation must precede ERP-like move
 *   4.  Scrupulosity — cycle/process must outrank behavioral suggestion
 *   5.  Grief/loss — holding must outrank behavioral activation
 *   6.  Trauma — stabilization must outrank exposure logic
 *   7.  ADHD overwhelm — overload understanding must precede action
 *   8.  "Nothing helps" — clarification must outrank intervention
 *   9.  First-disclosure — no-task rule must win
 *  10.  Mid-session language switch — hierarchy remains intact
 *  11.  Leakage-informed regression — planner no longer emits legacy shortcut reasoning
 *  12.  Preserved-gains tests — warmth/pacing/alliance/competence don't regress
 */

import { describe, it, expect } from 'vitest';

import {
  PRECEDENCE_LEVELS,
  LEGACY_GATE_OVERRIDES,
  THERAPIST_PLANNER_PRECEDENCE_MODEL,
  evaluatePlannerPrecedence,
  isLegacyGateBlocked,
} from '../../src/lib/therapistWorkflowEngine.js';

import {
  FORMULATION_FIRST_GATES,
  INTERVENTION_READINESS_CHECKLIST,
  PROTECTED_CASE_TYPES,
  getCaseProtectionLevel,
  checkInterventionReadiness,
} from '../../src/lib/cbtKnowledgePlanner.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Fully-ready context (all gates passed, no pacing-sensitive case type) */
const fullyReadyCtx = Object.freeze({
  safety_mode_active: false,
  distress_tier: 'tier_low',
  formulation_in_place: true,
  has_been_understood: true,
  case_type: 'anxiety',
  is_first_disclosure: false,
  intervention_ready: true,
  readiness_signal: true,
  rationale_is_clear: true,
  distress_allows_task: true,
  person_feels_understood: true,
});

/** Minimal unready context — no formulation yet */
const unreadyCtx = Object.freeze({
  formulation_in_place: false,
  has_been_understood: false,
});

// ─── Section A: PRECEDENCE_LEVELS exports ────────────────────────────────────

describe('PRECEDENCE_LEVELS', () => {
  it('is exported as a frozen object', () => {
    expect(PRECEDENCE_LEVELS).toBeDefined();
    expect(Object.isFrozen(PRECEDENCE_LEVELS)).toBe(true);
  });

  it('has exactly 7 levels', () => {
    expect(Object.keys(PRECEDENCE_LEVELS)).toHaveLength(7);
  });

  it('SAFETY is level 1 (highest priority)', () => {
    expect(PRECEDENCE_LEVELS.SAFETY).toBe(1);
  });

  it('FORMULATION_FIRST is level 2', () => {
    expect(PRECEDENCE_LEVELS.FORMULATION_FIRST).toBe(2);
  });

  it('PACING_SENSITIVITY is level 3', () => {
    expect(PRECEDENCE_LEVELS.PACING_SENSITIVITY).toBe(3);
  });

  it('FIRST_DISCLOSURE is level 4', () => {
    expect(PRECEDENCE_LEVELS.FIRST_DISCLOSURE).toBe(4);
  });

  it('INTERVENTION_READINESS is level 5', () => {
    expect(PRECEDENCE_LEVELS.INTERVENTION_READINESS).toBe(5);
  });

  it('COMPETENCE_PLANNER is level 6', () => {
    expect(PRECEDENCE_LEVELS.COMPETENCE_PLANNER).toBe(6);
  });

  it('DOMAIN_HEURISTICS is level 7 (lowest priority)', () => {
    expect(PRECEDENCE_LEVELS.DOMAIN_HEURISTICS).toBe(7);
  });

  it('SAFETY < FORMULATION_FIRST < PACING_SENSITIVITY < DOMAIN_HEURISTICS (order preserved)', () => {
    expect(PRECEDENCE_LEVELS.SAFETY).toBeLessThan(PRECEDENCE_LEVELS.FORMULATION_FIRST);
    expect(PRECEDENCE_LEVELS.FORMULATION_FIRST).toBeLessThan(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
    expect(PRECEDENCE_LEVELS.PACING_SENSITIVITY).toBeLessThan(PRECEDENCE_LEVELS.DOMAIN_HEURISTICS);
  });
});

// ─── Section B: LEGACY_GATE_OVERRIDES exports ────────────────────────────────

describe('LEGACY_GATE_OVERRIDES', () => {
  it('is exported as a frozen object', () => {
    expect(LEGACY_GATE_OVERRIDES).toBeDefined();
    expect(Object.isFrozen(LEGACY_GATE_OVERRIDES)).toBe(true);
  });

  it('has exactly 4 legacy gates', () => {
    expect(Object.keys(LEGACY_GATE_OVERRIDES)).toHaveLength(4);
  });

  it('contains micro_step_defaulting gate', () => {
    expect(LEGACY_GATE_OVERRIDES.micro_step_defaulting).toBeDefined();
  });

  it('contains skip_clarification gate', () => {
    expect(LEGACY_GATE_OVERRIDES.skip_clarification).toBeDefined();
  });

  it('contains social_anxiety_direct_action gate', () => {
    expect(LEGACY_GATE_OVERRIDES.social_anxiety_direct_action).toBeDefined();
  });

  it('contains domain_to_intervention_template gate', () => {
    expect(LEGACY_GATE_OVERRIDES.domain_to_intervention_template).toBeDefined();
  });

  it('micro_step_defaulting is blocked by INTERVENTION_READINESS (level 5)', () => {
    expect(LEGACY_GATE_OVERRIDES.micro_step_defaulting.blockedBy).toBe(PRECEDENCE_LEVELS.INTERVENTION_READINESS);
  });

  it('skip_clarification is blocked by FORMULATION_FIRST (level 2)', () => {
    expect(LEGACY_GATE_OVERRIDES.skip_clarification.blockedBy).toBe(PRECEDENCE_LEVELS.FORMULATION_FIRST);
  });

  it('social_anxiety_direct_action is blocked by PACING_SENSITIVITY (level 3)', () => {
    expect(LEGACY_GATE_OVERRIDES.social_anxiety_direct_action.blockedBy).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('domain_to_intervention_template is blocked by PACING_SENSITIVITY (level 3)', () => {
    expect(LEGACY_GATE_OVERRIDES.domain_to_intervention_template.blockedBy).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('each gate has gateName, description, blockedBy, blockedByName', () => {
    for (const gate of Object.values(LEGACY_GATE_OVERRIDES)) {
      expect(typeof gate.gateName).toBe('string');
      expect(typeof gate.description).toBe('string');
      expect(typeof gate.blockedBy).toBe('number');
      expect(typeof gate.blockedByName).toBe('string');
    }
  });
});

// ─── Section C: THERAPIST_PLANNER_PRECEDENCE_MODEL exports ───────────────────

describe('THERAPIST_PLANNER_PRECEDENCE_MODEL', () => {
  it('is exported', () => {
    expect(THERAPIST_PLANNER_PRECEDENCE_MODEL).toBeDefined();
  });

  it('is frozen', () => {
    expect(Object.isFrozen(THERAPIST_PLANNER_PRECEDENCE_MODEL)).toBe(true);
  });

  it('has version field', () => {
    expect(typeof THERAPIST_PLANNER_PRECEDENCE_MODEL.version).toBe('string');
    expect(THERAPIST_PLANNER_PRECEDENCE_MODEL.version.length).toBeGreaterThan(0);
  });

  it('references PRECEDENCE_LEVELS', () => {
    expect(THERAPIST_PLANNER_PRECEDENCE_MODEL.precedence_levels).toBe(PRECEDENCE_LEVELS);
  });

  it('references LEGACY_GATE_OVERRIDES', () => {
    expect(THERAPIST_PLANNER_PRECEDENCE_MODEL.legacy_gate_overrides).toBe(LEGACY_GATE_OVERRIDES);
  });
});

// ─── Section D: evaluatePlannerPrecedence ────────────────────────────────────

describe('evaluatePlannerPrecedence', () => {
  it('returns SAFETY when safety_mode_active is true', () => {
    const r = evaluatePlannerPrecedence({ safety_mode_active: true });
    expect(r.level).toBe(PRECEDENCE_LEVELS.SAFETY);
    expect(r.name).toBe('SAFETY');
  });

  it('returns SAFETY when distress_tier is tier_high', () => {
    const r = evaluatePlannerPrecedence({ distress_tier: 'tier_high' });
    expect(r.level).toBe(PRECEDENCE_LEVELS.SAFETY);
  });

  it('returns FORMULATION_FIRST when formulation_in_place is false', () => {
    const r = evaluatePlannerPrecedence({ formulation_in_place: false, has_been_understood: true });
    expect(r.level).toBe(PRECEDENCE_LEVELS.FORMULATION_FIRST);
  });

  it('returns FORMULATION_FIRST when has_been_understood is false', () => {
    const r = evaluatePlannerPrecedence({ formulation_in_place: true, has_been_understood: false });
    expect(r.level).toBe(PRECEDENCE_LEVELS.FORMULATION_FIRST);
  });

  it('returns FORMULATION_FIRST for empty context (fail-safe default)', () => {
    const r = evaluatePlannerPrecedence({});
    expect(r.level).toBe(PRECEDENCE_LEVELS.FORMULATION_FIRST);
  });

  it('returns FORMULATION_FIRST for null context (fail-safe default)', () => {
    const r = evaluatePlannerPrecedence(null);
    expect(r.level).toBe(PRECEDENCE_LEVELS.FORMULATION_FIRST);
  });

  it('returns PACING_SENSITIVITY for case_type teen_shame', () => {
    const r = evaluatePlannerPrecedence({ ...fullyReadyCtx, case_type: 'teen_shame', intervention_ready: false });
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('returns PACING_SENSITIVITY for case_type grief_loss', () => {
    const r = evaluatePlannerPrecedence({ ...fullyReadyCtx, case_type: 'grief_loss', intervention_ready: false });
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('returns PACING_SENSITIVITY for case_type trauma', () => {
    const r = evaluatePlannerPrecedence({ ...fullyReadyCtx, case_type: 'trauma', intervention_ready: false });
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('returns PACING_SENSITIVITY for case_type scrupulosity', () => {
    const r = evaluatePlannerPrecedence({ ...fullyReadyCtx, case_type: 'scrupulosity', intervention_ready: false });
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('returns PACING_SENSITIVITY for case_type ocd_checking', () => {
    const r = evaluatePlannerPrecedence({ ...fullyReadyCtx, case_type: 'ocd_checking', intervention_ready: false });
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('returns PACING_SENSITIVITY for case_type adhd_overwhelm', () => {
    const r = evaluatePlannerPrecedence({ ...fullyReadyCtx, case_type: 'adhd_overwhelm', intervention_ready: false });
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('returns FIRST_DISCLOSURE when is_first_disclosure is true', () => {
    const r = evaluatePlannerPrecedence({ ...fullyReadyCtx, case_type: 'anxiety', is_first_disclosure: true });
    expect(r.level).toBe(PRECEDENCE_LEVELS.FIRST_DISCLOSURE);
  });

  it('returns INTERVENTION_READINESS when intervention_ready is false (non-pacing case)', () => {
    const r = evaluatePlannerPrecedence({ ...fullyReadyCtx, intervention_ready: false });
    expect(r.level).toBe(PRECEDENCE_LEVELS.INTERVENTION_READINESS);
  });

  it('returns COMPETENCE_PLANNER when all higher gates are passed', () => {
    const r = evaluatePlannerPrecedence(fullyReadyCtx);
    expect(r.level).toBe(PRECEDENCE_LEVELS.COMPETENCE_PLANNER);
  });

  it('SAFETY outranks FORMULATION_FIRST (level ordering correct)', () => {
    const safety = evaluatePlannerPrecedence({ safety_mode_active: true });
    const formFirst = evaluatePlannerPrecedence({});
    expect(safety.level).toBeLessThan(formFirst.level);
  });

  it('result is frozen', () => {
    expect(Object.isFrozen(evaluatePlannerPrecedence({}))).toBe(true);
  });

  it('returns an object with level, name, reason', () => {
    const r = evaluatePlannerPrecedence({});
    expect(typeof r.level).toBe('number');
    expect(typeof r.name).toBe('string');
    expect(typeof r.reason).toBe('string');
  });
});

// ─── Section E: isLegacyGateBlocked ──────────────────────────────────────────

describe('isLegacyGateBlocked', () => {
  it('returns false for unknown gate name', () => {
    expect(isLegacyGateBlocked('nonexistent_gate', {})).toBe(false);
  });

  it('skip_clarification is blocked when formulation not in place', () => {
    expect(isLegacyGateBlocked('skip_clarification', unreadyCtx)).toBe(true);
  });

  it('skip_clarification is NOT blocked when fully ready (anxiety, non-pacing)', () => {
    expect(isLegacyGateBlocked('skip_clarification', fullyReadyCtx)).toBe(false);
  });

  it('social_anxiety_direct_action is blocked when formulation is incomplete', () => {
    expect(isLegacyGateBlocked('social_anxiety_direct_action', unreadyCtx)).toBe(true);
  });

  it('social_anxiety_direct_action is blocked even with formulation when case_type is social anxiety pacing type', () => {
    // teen_shame is a pacing-sensitive type — triggers level 3 which equals blockedBy 3
    const ctx = { ...fullyReadyCtx, case_type: 'teen_shame', intervention_ready: false };
    expect(isLegacyGateBlocked('social_anxiety_direct_action', ctx)).toBe(true);
  });

  it('domain_to_intervention_template is blocked when formulation is missing', () => {
    expect(isLegacyGateBlocked('domain_to_intervention_template', unreadyCtx)).toBe(true);
  });

  it('micro_step_defaulting is blocked when intervention_ready is false', () => {
    const ctx = { ...fullyReadyCtx, case_type: 'anxiety', intervention_ready: false };
    expect(isLegacyGateBlocked('micro_step_defaulting', ctx)).toBe(true);
  });

  it('micro_step_defaulting is NOT blocked when fully ready', () => {
    expect(isLegacyGateBlocked('micro_step_defaulting', fullyReadyCtx)).toBe(false);
  });

  it('returns true (fail-closed) for null context on known gate', () => {
    // null context → FORMULATION_FIRST (level 2) ≤ skip_clarification.blockedBy (2) → blocked
    expect(isLegacyGateBlocked('skip_clarification', null)).toBe(true);
  });
});

// ─── Section F: FORMULATION_FIRST_GATES exports ──────────────────────────────

describe('FORMULATION_FIRST_GATES', () => {
  it('is exported as a frozen array', () => {
    expect(Array.isArray(FORMULATION_FIRST_GATES)).toBe(true);
    expect(Object.isFrozen(FORMULATION_FIRST_GATES)).toBe(true);
  });

  it('has exactly 6 gates', () => {
    expect(FORMULATION_FIRST_GATES).toHaveLength(6);
  });

  it('starts with understand_presenting_problem', () => {
    expect(FORMULATION_FIRST_GATES[0]).toBe('understand_presenting_problem');
  });

  it('ends with decide_move_type', () => {
    expect(FORMULATION_FIRST_GATES[FORMULATION_FIRST_GATES.length - 1]).toBe('decide_move_type');
  });

  it('contains build_working_formulation', () => {
    expect(FORMULATION_FIRST_GATES).toContain('build_working_formulation');
  });

  it('contains identify_treatment_target', () => {
    expect(FORMULATION_FIRST_GATES).toContain('identify_treatment_target');
  });
});

// ─── Section G: INTERVENTION_READINESS_CHECKLIST exports ─────────────────────

describe('INTERVENTION_READINESS_CHECKLIST', () => {
  it('is exported as a frozen array', () => {
    expect(Array.isArray(INTERVENTION_READINESS_CHECKLIST)).toBe(true);
    expect(Object.isFrozen(INTERVENTION_READINESS_CHECKLIST)).toBe(true);
  });

  it('has exactly 6 items', () => {
    expect(INTERVENTION_READINESS_CHECKLIST).toHaveLength(6);
  });

  it('contains formulation_in_place', () => {
    expect(INTERVENTION_READINESS_CHECKLIST).toContain('formulation_in_place');
  });

  it('contains person_feels_understood', () => {
    expect(INTERVENTION_READINESS_CHECKLIST).toContain('person_feels_understood');
  });

  it('contains not_grief_trauma_acute_shame', () => {
    expect(INTERVENTION_READINESS_CHECKLIST).toContain('not_grief_trauma_acute_shame');
  });
});

// ─── Section H: PROTECTED_CASE_TYPES exports ─────────────────────────────────

describe('PROTECTED_CASE_TYPES', () => {
  it('is exported as a frozen array', () => {
    expect(Array.isArray(PROTECTED_CASE_TYPES)).toBe(true);
    expect(Object.isFrozen(PROTECTED_CASE_TYPES)).toBe(true);
  });

  it('has exactly 8 case types', () => {
    expect(PROTECTED_CASE_TYPES).toHaveLength(8);
  });

  it('includes teen_shame', () => { expect(PROTECTED_CASE_TYPES).toContain('teen_shame'); });
  it('includes grief_loss', () => { expect(PROTECTED_CASE_TYPES).toContain('grief_loss'); });
  it('includes trauma', () => { expect(PROTECTED_CASE_TYPES).toContain('trauma'); });
  it('includes scrupulosity', () => { expect(PROTECTED_CASE_TYPES).toContain('scrupulosity'); });
  it('includes first_disclosure', () => { expect(PROTECTED_CASE_TYPES).toContain('first_disclosure'); });
  it('includes adhd_overwhelm', () => { expect(PROTECTED_CASE_TYPES).toContain('adhd_overwhelm'); });
  it('includes nothing_helps', () => { expect(PROTECTED_CASE_TYPES).toContain('nothing_helps'); });
  it('includes ocd_checking', () => { expect(PROTECTED_CASE_TYPES).toContain('ocd_checking'); });
});

// ─── Section I: getCaseProtectionLevel ───────────────────────────────────────

describe('getCaseProtectionLevel', () => {
  it('returns "high" for grief_loss', () => {
    expect(getCaseProtectionLevel({ case_type: 'grief_loss' })).toBe('high');
  });

  it('returns "high" for trauma', () => {
    expect(getCaseProtectionLevel({ case_type: 'trauma' })).toBe('high');
  });

  it('returns "high" for first_disclosure', () => {
    expect(getCaseProtectionLevel({ case_type: 'first_disclosure' })).toBe('high');
  });

  it('returns "standard" for teen_shame', () => {
    expect(getCaseProtectionLevel({ case_type: 'teen_shame' })).toBe('standard');
  });

  it('returns "standard" for scrupulosity', () => {
    expect(getCaseProtectionLevel({ case_type: 'scrupulosity' })).toBe('standard');
  });

  it('returns "standard" for ocd_checking', () => {
    expect(getCaseProtectionLevel({ case_type: 'ocd_checking' })).toBe('standard');
  });

  it('returns "standard" for adhd_overwhelm', () => {
    expect(getCaseProtectionLevel({ case_type: 'adhd_overwhelm' })).toBe('standard');
  });

  it('returns "standard" for nothing_helps', () => {
    expect(getCaseProtectionLevel({ case_type: 'nothing_helps' })).toBe('standard');
  });

  it('returns "none" for generic anxiety', () => {
    expect(getCaseProtectionLevel({ case_type: 'anxiety' })).toBe('none');
  });

  it('returns "none" for null context', () => {
    expect(getCaseProtectionLevel(null)).toBe('none');
  });

  it('returns "none" for empty context', () => {
    expect(getCaseProtectionLevel({})).toBe('none');
  });

  it('is case-insensitive (GRIEF_LOSS → high)', () => {
    expect(getCaseProtectionLevel({ case_type: 'GRIEF_LOSS' })).toBe('high');
  });
});

// ─── Section J: checkInterventionReadiness ───────────────────────────────────

describe('checkInterventionReadiness', () => {
  const fullCtxForReadiness = Object.freeze({
    formulation_in_place: true,
    person_feels_understood: true,
    readiness_signal: true,
    rationale_is_clear: true,
    distress_allows_task: true,
    case_type: 'anxiety',
  });

  it('returns ready=true when all criteria met (non-protected case)', () => {
    const r = checkInterventionReadiness(fullCtxForReadiness);
    expect(r.ready).toBe(true);
    expect(r.unmetCriteria).toHaveLength(0);
    expect(r.protectionLevel).toBe('none');
  });

  it('returns ready=false when formulation_in_place is false', () => {
    const r = checkInterventionReadiness({ ...fullCtxForReadiness, formulation_in_place: false });
    expect(r.ready).toBe(false);
    expect(r.unmetCriteria).toContain('formulation_in_place');
  });

  it('returns ready=false when person_feels_understood is false', () => {
    const r = checkInterventionReadiness({ ...fullCtxForReadiness, person_feels_understood: false });
    expect(r.ready).toBe(false);
    expect(r.unmetCriteria).toContain('person_feels_understood');
  });

  it('returns all 5 base criteria as unmet for empty context', () => {
    const r = checkInterventionReadiness({});
    expect(r.ready).toBe(false);
    expect(r.unmetCriteria.length).toBeGreaterThanOrEqual(5);
  });

  it('requires holding_complete for grief_loss case', () => {
    const r = checkInterventionReadiness({ ...fullCtxForReadiness, case_type: 'grief_loss' });
    expect(r.ready).toBe(false);
    expect(r.unmetCriteria).toContain('not_grief_trauma_acute_shame');
    expect(r.protectionLevel).toBe('high');
  });

  it('requires holding_complete for trauma case', () => {
    const r = checkInterventionReadiness({ ...fullCtxForReadiness, case_type: 'trauma' });
    expect(r.ready).toBe(false);
    expect(r.unmetCriteria).toContain('not_grief_trauma_acute_shame');
  });

  it('requires holding_complete for first_disclosure case', () => {
    const r = checkInterventionReadiness({ ...fullCtxForReadiness, case_type: 'first_disclosure' });
    expect(r.ready).toBe(false);
    expect(r.unmetCriteria).toContain('not_grief_trauma_acute_shame');
  });

  it('returns ready=true for grief_loss when holding_complete=true', () => {
    const r = checkInterventionReadiness({ ...fullCtxForReadiness, case_type: 'grief_loss', holding_complete: true });
    expect(r.ready).toBe(true);
  });

  it('does NOT require holding_complete for teen_shame (standard protection)', () => {
    const r = checkInterventionReadiness({ ...fullCtxForReadiness, case_type: 'teen_shame' });
    expect(r.ready).toBe(true);
    expect(r.protectionLevel).toBe('standard');
  });

  it('result is frozen', () => {
    const r = checkInterventionReadiness({});
    expect(Object.isFrozen(r)).toBe(true);
    expect(Object.isFrozen(r.unmetCriteria)).toBe(true);
  });

  it('never throws for null context', () => {
    expect(() => checkInterventionReadiness(null)).not.toThrow();
  });

  it('never throws for array context', () => {
    expect(() => checkInterventionReadiness([])).not.toThrow();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 1: Social anxiety — old direct-action gate no longer dominates
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 1: Social anxiety — direct-action gate no longer dominates', () => {
  const socialAnxietyCtx = Object.freeze({
    formulation_in_place: false,
    has_been_understood: false,
    case_type: 'anxiety',
  });

  it('social_anxiety_direct_action gate is blocked when formulation not in place', () => {
    expect(isLegacyGateBlocked('social_anxiety_direct_action', socialAnxietyCtx)).toBe(true);
  });

  it('domain_to_intervention_template gate is blocked for social anxiety without formulation', () => {
    expect(isLegacyGateBlocked('domain_to_intervention_template', socialAnxietyCtx)).toBe(true);
  });

  it('skip_clarification is blocked for social anxiety without formulation', () => {
    expect(isLegacyGateBlocked('skip_clarification', socialAnxietyCtx)).toBe(true);
  });

  it('planner level is FORMULATION_FIRST (not DOMAIN_HEURISTICS) for social anxiety without formulation', () => {
    const r = evaluatePlannerPrecedence(socialAnxietyCtx);
    expect(r.level).toBeLessThan(PRECEDENCE_LEVELS.DOMAIN_HEURISTICS);
    expect(r.level).toBe(PRECEDENCE_LEVELS.FORMULATION_FIRST);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 2: Teen social shame — teen sensitivity outranks social-action gate
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 2: Teen social shame — teen sensitivity outranks social-action gate', () => {
  // Formulation IS in place and person feels understood, but case_type is teen_shame
  const teenShameCtx = Object.freeze({
    formulation_in_place: true,
    has_been_understood: true,
    case_type: 'teen_shame',
    intervention_ready: false,
  });

  it('planner returns PACING_SENSITIVITY for teen_shame even with formulation in place', () => {
    const r = evaluatePlannerPrecedence(teenShameCtx);
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('social_anxiety_direct_action gate is blocked for teen_shame (pacing level ≤ blockedBy)', () => {
    expect(isLegacyGateBlocked('social_anxiety_direct_action', teenShameCtx)).toBe(true);
  });

  it('domain_to_intervention_template gate is blocked for teen_shame', () => {
    expect(isLegacyGateBlocked('domain_to_intervention_template', teenShameCtx)).toBe(true);
  });

  it('getCaseProtectionLevel returns standard for teen_shame', () => {
    expect(getCaseProtectionLevel({ case_type: 'teen_shame' })).toBe('standard');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 3: OCD checking — formulation must precede ERP-like move
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 3: OCD checking — formulation must precede ERP-like move', () => {
  const ocdCtx = Object.freeze({
    formulation_in_place: false,
    has_been_understood: false,
    case_type: 'ocd_checking',
  });

  it('planner returns FORMULATION_FIRST for ocd_checking without formulation', () => {
    const r = evaluatePlannerPrecedence(ocdCtx);
    expect(r.level).toBe(PRECEDENCE_LEVELS.FORMULATION_FIRST);
  });

  it('micro_step_defaulting is blocked for ocd_checking without formulation', () => {
    expect(isLegacyGateBlocked('micro_step_defaulting', ocdCtx)).toBe(true);
  });

  it('domain_to_intervention_template is blocked for ocd_checking', () => {
    expect(isLegacyGateBlocked('domain_to_intervention_template', ocdCtx)).toBe(true);
  });

  it('ocd_checking is in PROTECTED_CASE_TYPES', () => {
    expect(PROTECTED_CASE_TYPES).toContain('ocd_checking');
  });

  it('planner returns PACING_SENSITIVITY for ocd_checking when formulation is in place', () => {
    const ctx = { formulation_in_place: true, has_been_understood: true, case_type: 'ocd_checking', intervention_ready: false };
    const r = evaluatePlannerPrecedence(ctx);
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 4: Scrupulosity — cycle/process outranks behavioral suggestion
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 4: Scrupulosity — cycle/process outranks behavioral suggestion', () => {
  const scrupulosityCtx = Object.freeze({
    formulation_in_place: true,
    has_been_understood: true,
    case_type: 'scrupulosity',
    intervention_ready: false,
  });

  it('planner returns PACING_SENSITIVITY for scrupulosity', () => {
    const r = evaluatePlannerPrecedence(scrupulosityCtx);
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('domain_to_intervention_template is blocked for scrupulosity', () => {
    expect(isLegacyGateBlocked('domain_to_intervention_template', scrupulosityCtx)).toBe(true);
  });

  it('micro_step_defaulting is blocked for scrupulosity (intervention not ready)', () => {
    expect(isLegacyGateBlocked('micro_step_defaulting', scrupulosityCtx)).toBe(true);
  });

  it('getCaseProtectionLevel returns standard for scrupulosity', () => {
    expect(getCaseProtectionLevel({ case_type: 'scrupulosity' })).toBe('standard');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 5: Grief/loss — holding outranks behavioral activation
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 5: Grief/loss — holding outranks behavioral activation', () => {
  const griefCtx = Object.freeze({
    formulation_in_place: true,
    has_been_understood: true,
    case_type: 'grief_loss',
    intervention_ready: false,
  });

  it('planner returns PACING_SENSITIVITY for grief_loss', () => {
    const r = evaluatePlannerPrecedence(griefCtx);
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('getCaseProtectionLevel returns high for grief_loss', () => {
    expect(getCaseProtectionLevel({ case_type: 'grief_loss' })).toBe('high');
  });

  it('checkInterventionReadiness requires holding_complete for grief_loss', () => {
    const r = checkInterventionReadiness({
      formulation_in_place: true, person_feels_understood: true,
      readiness_signal: true, rationale_is_clear: true, distress_allows_task: true,
      case_type: 'grief_loss',
    });
    expect(r.ready).toBe(false);
    expect(r.unmetCriteria).toContain('not_grief_trauma_acute_shame');
  });

  it('micro_step_defaulting is blocked for grief_loss before holding complete', () => {
    expect(isLegacyGateBlocked('micro_step_defaulting', griefCtx)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 6: Trauma — stabilization outranks exposure logic
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 6: Trauma — stabilization outranks exposure logic', () => {
  const traumaCtx = Object.freeze({
    formulation_in_place: true,
    has_been_understood: true,
    case_type: 'trauma',
    intervention_ready: false,
  });

  it('planner returns PACING_SENSITIVITY for trauma', () => {
    const r = evaluatePlannerPrecedence(traumaCtx);
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('getCaseProtectionLevel returns high for trauma', () => {
    expect(getCaseProtectionLevel({ case_type: 'trauma' })).toBe('high');
  });

  it('checkInterventionReadiness requires holding_complete for trauma', () => {
    const r = checkInterventionReadiness({
      formulation_in_place: true, person_feels_understood: true,
      readiness_signal: true, rationale_is_clear: true, distress_allows_task: true,
      case_type: 'trauma',
    });
    expect(r.ready).toBe(false);
    expect(r.unmetCriteria).toContain('not_grief_trauma_acute_shame');
  });

  it('domain_to_intervention_template is blocked for trauma', () => {
    expect(isLegacyGateBlocked('domain_to_intervention_template', traumaCtx)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 7: ADHD overwhelm — overload understanding precedes action
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 7: ADHD overwhelm — understanding must precede action', () => {
  const adhdCtx = Object.freeze({
    formulation_in_place: true,
    has_been_understood: true,
    case_type: 'adhd_overwhelm',
    intervention_ready: false,
  });

  it('planner returns PACING_SENSITIVITY for adhd_overwhelm', () => {
    const r = evaluatePlannerPrecedence(adhdCtx);
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('getCaseProtectionLevel returns standard for adhd_overwhelm', () => {
    expect(getCaseProtectionLevel({ case_type: 'adhd_overwhelm' })).toBe('standard');
  });

  it('micro_step_defaulting is blocked for adhd_overwhelm when not ready', () => {
    expect(isLegacyGateBlocked('micro_step_defaulting', adhdCtx)).toBe(true);
  });

  it('skip_clarification is blocked for adhd_overwhelm when formulation missing', () => {
    const ctx = { formulation_in_place: false, case_type: 'adhd_overwhelm' };
    expect(isLegacyGateBlocked('skip_clarification', ctx)).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 8: "Nothing helps" — clarification outranks intervention
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 8: "Nothing helps" — clarification outranks intervention', () => {
  const nothingHelpsCtxNoForm = Object.freeze({
    formulation_in_place: false,
    has_been_understood: false,
    case_type: 'nothing_helps',
  });
  const nothingHelpsCtxWithForm = Object.freeze({
    formulation_in_place: true,
    has_been_understood: true,
    case_type: 'nothing_helps',
    intervention_ready: false,
  });

  it('planner returns FORMULATION_FIRST when formulation missing (nothing_helps)', () => {
    const r = evaluatePlannerPrecedence(nothingHelpsCtxNoForm);
    expect(r.level).toBe(PRECEDENCE_LEVELS.FORMULATION_FIRST);
  });

  it('planner returns PACING_SENSITIVITY when formulation in place (nothing_helps)', () => {
    const r = evaluatePlannerPrecedence(nothingHelpsCtxWithForm);
    expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
  });

  it('nothing_helps is in PROTECTED_CASE_TYPES', () => {
    expect(PROTECTED_CASE_TYPES).toContain('nothing_helps');
  });

  it('micro_step_defaulting is blocked for nothing_helps when not ready', () => {
    expect(isLegacyGateBlocked('micro_step_defaulting', nothingHelpsCtxWithForm)).toBe(true);
  });

  it('getCaseProtectionLevel returns standard for nothing_helps', () => {
    expect(getCaseProtectionLevel({ case_type: 'nothing_helps' })).toBe('standard');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 9: First-disclosure — no-task rule must win
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 9: First-disclosure — no-task rule wins', () => {
  const firstDisclosureCtx = Object.freeze({
    formulation_in_place: true,
    has_been_understood: true,
    case_type: 'first_disclosure',
    is_first_disclosure: true,
    intervention_ready: true,
  });

  it('planner returns FIRST_DISCLOSURE for first_disclosure case with is_first_disclosure=true', () => {
    const r = evaluatePlannerPrecedence(firstDisclosureCtx);
    expect(r.level).toBe(PRECEDENCE_LEVELS.FIRST_DISCLOSURE);
  });

  it('micro_step_defaulting is blocked for first_disclosure', () => {
    expect(isLegacyGateBlocked('micro_step_defaulting', firstDisclosureCtx)).toBe(true);
  });

  it('getCaseProtectionLevel returns high for first_disclosure', () => {
    expect(getCaseProtectionLevel({ case_type: 'first_disclosure' })).toBe('high');
  });

  it('checkInterventionReadiness requires holding_complete for first_disclosure', () => {
    const r = checkInterventionReadiness({
      formulation_in_place: true, person_feels_understood: true,
      readiness_signal: true, rationale_is_clear: true, distress_allows_task: true,
      case_type: 'first_disclosure',
    });
    expect(r.ready).toBe(false);
    expect(r.unmetCriteria).toContain('not_grief_trauma_acute_shame');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 10: Mid-session language switch — hierarchy remains intact
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 10: Mid-session language switch — hierarchy remains intact', () => {
  const languages = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

  for (const lang of languages) {
    it(`hierarchy returns FORMULATION_FIRST for unready session in lang=${lang}`, () => {
      const ctx = { formulation_in_place: false, has_been_understood: false, language: lang };
      const r = evaluatePlannerPrecedence(ctx);
      expect(r.level).toBe(PRECEDENCE_LEVELS.FORMULATION_FIRST);
    });

    it(`skip_clarification is blocked for unready session in lang=${lang}`, () => {
      const ctx = { formulation_in_place: false, has_been_understood: false, language: lang };
      expect(isLegacyGateBlocked('skip_clarification', ctx)).toBe(true);
    });

    it(`pacing-sensitive case_type grief_loss is protected in lang=${lang}`, () => {
      const ctx = { formulation_in_place: true, has_been_understood: true, case_type: 'grief_loss', language: lang };
      const r = evaluatePlannerPrecedence(ctx);
      expect(r.level).toBe(PRECEDENCE_LEVELS.PACING_SENSITIVITY);
    });
  }
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 11: Leakage-informed — legacy shortcut reasoning patterns blocked
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 11: Leakage-informed — legacy shortcuts are present in model and blocked', () => {
  it('ALL 4 documented legacy gates exist in LEGACY_GATE_OVERRIDES', () => {
    const expected = [
      'micro_step_defaulting',
      'skip_clarification',
      'social_anxiety_direct_action',
      'domain_to_intervention_template',
    ];
    for (const name of expected) {
      expect(LEGACY_GATE_OVERRIDES[name]).toBeDefined();
    }
  });

  it('classify-domain-then-act pattern is represented and blocked (domain_to_intervention_template)', () => {
    // Leaked pattern: classify domain → trigger legacy gate → skip clarification → force action
    // This is modeled as domain_to_intervention_template + skip_clarification
    const earlySessionCtx = { formulation_in_place: false, has_been_understood: false };
    expect(isLegacyGateBlocked('domain_to_intervention_template', earlySessionCtx)).toBe(true);
    expect(isLegacyGateBlocked('skip_clarification', earlySessionCtx)).toBe(true);
  });

  it('micro-step output without formulation pattern is blocked', () => {
    const earlySessionCtx = { formulation_in_place: false, has_been_understood: false };
    expect(isLegacyGateBlocked('micro_step_defaulting', earlySessionCtx)).toBe(true);
  });

  it('social-anxiety-direct-action pattern is blocked when formulation missing', () => {
    const ctx = { formulation_in_place: false, case_type: 'social_anxiety' };
    expect(isLegacyGateBlocked('social_anxiety_direct_action', ctx)).toBe(true);
  });

  it('PRECEDENCE_LEVELS.DOMAIN_HEURISTICS is the highest number (lowest priority)', () => {
    const allLevels = Object.values(PRECEDENCE_LEVELS);
    expect(Math.max(...allLevels)).toBe(PRECEDENCE_LEVELS.DOMAIN_HEURISTICS);
  });

  it('PRECEDENCE_LEVELS.SAFETY is the lowest number (highest priority)', () => {
    const allLevels = Object.values(PRECEDENCE_LEVELS);
    expect(Math.min(...allLevels)).toBe(PRECEDENCE_LEVELS.SAFETY);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESSION CASE 12: Preserved-gains — warmth/pacing/alliance/competence
// ─────────────────────────────────────────────────────────────────────────────

describe('Regression 12: Preserved-gains — prior gains are not regressed', () => {
  it('evaluatePlannerPrecedence is a pure function (same input → same output)', () => {
    const ctx = { formulation_in_place: true, has_been_understood: true, case_type: 'anxiety', intervention_ready: false };
    const r1 = evaluatePlannerPrecedence(ctx);
    const r2 = evaluatePlannerPrecedence(ctx);
    expect(r1.level).toBe(r2.level);
    expect(r1.name).toBe(r2.name);
    expect(r1.reason).toBe(r2.reason);
  });

  it('FORMULATION_FIRST_GATES has understand_presenting_problem first (warmth/holding step)', () => {
    expect(FORMULATION_FIRST_GATES[0]).toBe('understand_presenting_problem');
  });

  it('FORMULATION_FIRST_GATES has build_working_formulation (formulation competence)', () => {
    expect(FORMULATION_FIRST_GATES).toContain('build_working_formulation');
  });

  it('INTERVENTION_READINESS_CHECKLIST has person_feels_understood (alliance gate)', () => {
    expect(INTERVENTION_READINESS_CHECKLIST).toContain('person_feels_understood');
  });

  it('INTERVENTION_READINESS_CHECKLIST has readiness_signal (pacing gate)', () => {
    expect(INTERVENTION_READINESS_CHECKLIST).toContain('readiness_signal');
  });

  it('INTERVENTION_READINESS_CHECKLIST has distress_allows_task (safety/competence gate)', () => {
    expect(INTERVENTION_READINESS_CHECKLIST).toContain('distress_allows_task');
  });

  it('safety beats all other levels (SAFETY=1 < everything else)', () => {
    const others = Object.entries(PRECEDENCE_LEVELS).filter(([k]) => k !== 'SAFETY');
    for (const [, v] of others) {
      expect(PRECEDENCE_LEVELS.SAFETY).toBeLessThan(v);
    }
  });

  it('COMPETENCE_PLANNER (level 6) outranks DOMAIN_HEURISTICS (level 7)', () => {
    expect(PRECEDENCE_LEVELS.COMPETENCE_PLANNER).toBeLessThan(PRECEDENCE_LEVELS.DOMAIN_HEURISTICS);
  });

  it('isLegacyGateBlocked never throws for any input combination', () => {
    const inputs = [null, undefined, {}, [], 'string', 42];
    for (const input of inputs) {
      expect(() => isLegacyGateBlocked('skip_clarification', input)).not.toThrow();
      expect(() => isLegacyGateBlocked('unknown_gate', input)).not.toThrow();
    }
  });

  it('checkInterventionReadiness never throws for any input', () => {
    const inputs = [null, undefined, {}, [], 'string', 42];
    for (const input of inputs) {
      expect(() => checkInterventionReadiness(input)).not.toThrow();
    }
  });

  it('getCaseProtectionLevel never throws for any input', () => {
    const inputs = [null, undefined, {}, [], 'string', 42];
    for (const input of inputs) {
      expect(() => getCaseProtectionLevel(input)).not.toThrow();
    }
  });

  it('evaluatePlannerPrecedence never throws for any input', () => {
    const inputs = [null, undefined, {}, [], 'string', 42];
    for (const input of inputs) {
      expect(() => evaluatePlannerPrecedence(input)).not.toThrow();
    }
  });
});

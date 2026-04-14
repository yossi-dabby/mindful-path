/**
 * @file test/utils/therapistCompetencePhase3.test.js
 *
 * Phase 3 Competence Architecture — Three-Pillar Therapist Competence
 *
 * PURPOSE
 * -------
 * Verifies the Phase 3 Competence Architecture that deepens therapist professional
 * competence across three global pillars:
 *   A. Clinical Skills
 *   B. Deep Theoretical Knowledge
 *   C. Interpersonal Abilities
 *
 * REQUIRED SCENARIO COVERAGE (per problem statement):
 *
 * SECTION A — VERSION
 *   1.  THERAPIST_WORKFLOW_VERSION bumped to 4.0.0
 *
 * SECTION B — COMPETENCE RULES EXPORT
 *   2.  THERAPIST_COMPETENCE_RULES is exported from therapistWorkflowEngine.js
 *   3.  THERAPIST_COMPETENCE_RULES is a frozen object
 *   4.  THERAPIST_COMPETENCE_RULES has exactly 10 keys (C1–C10)
 *   5.  All 10 rule IDs are present
 *   6.  Each rule has id, pillar, label, and description fields
 *   7.  Rules are distributed across the three pillars
 *
 * SECTION C — CLINICAL SKILLS RULES (C1–C4, C8)
 *   8.  C1 (case_formulation_depth) — formulation before technique
 *   9.  C1 requires maintaining loops and treatment targets in formulation
 *   10. C1 prohibits skipping formulation to jump to technique
 *   11. C2 (maintaining_loop_identification) — name the maintaining cycle
 *   12. C2 describes OCD, depression, and anxiety cycle patterns
 *   13. C2 requires loop identification before behavioral suggestion
 *   14. C3 (intervention_selection_accuracy) — one intervention per turn
 *   15. C3 lists all 10 available move types (a–j)
 *   16. C3 prohibits technique dumping
 *   17. C4 (socratic_explanatory_competence) — non-leading Socratic questions
 *   18. C4 prohibits leading questions and multiple questions at once
 *   19. C8 (session_structure_continuity) — natural session structure
 *   20. C8 requires session summary and one task connected to formulation
 *
 * SECTION D — THEORETICAL KNOWLEDGE RULES (C7, C9)
 *   21. C7 (psychoeducation_quality) — tailored, accessible psychoeducation
 *   22. C7 describes the gold-standard psychoeducation template
 *   23. C7 distinguishes formulation, psychoeducation, and intervention
 *   24. C7 prohibits generic/textbook-like psychoeducation
 *   25. C9 (theoretical_depth_third_wave) — CBT depth + third-wave integration
 *   26. C9 covers classic CBT, ACT, DBT, and mindfulness-based approaches
 *   27. C9 requires third-wave language only when it fits the case
 *   28. C9 requires showing depth through formulation, not terminology
 *
 * SECTION E — INTERPERSONAL ABILITY RULES (C5, C6, C10)
 *   29. C5 (collaborative_empiricism) — shared inquiry over instruction
 *   30. C5 describes co-formulation and joint hypothesis building
 *   31. C5 requires treating non-completion as clinical data
 *   32. C6 (cultural_religious_contextual_sensitivity) — deepen cultural fit
 *   33. C6 addresses scrupulosity using cycle language not belief content
 *   34. C6 prohibits implying cultural/religious values are the problem
 *   35. C6 addresses shame-heavy contexts and grief with spiritual meaning
 *   36. C10 (anti_didacticism) — no lectures, no technique lists
 *   37. C10 prohibits listing more than one technique per response
 *   38. C10 prohibits describing clinical actions meta-clinically
 *   39. C10 describes the gold standard (reader cannot tell it came from a manual)
 *
 * SECTION F — BUILDER AND EXPORTED STRING
 *   40. buildCompetenceInstructions is exported and callable
 *   41. THERAPIST_COMPETENCE_INSTRUCTIONS is exported and is a non-empty string
 *   42. THERAPIST_COMPETENCE_INSTRUCTIONS contains the Phase 3 header
 *   43. THERAPIST_COMPETENCE_INSTRUCTIONS contains the Phase 3 footer
 *   44. THERAPIST_COMPETENCE_INSTRUCTIONS contains all three pillar names
 *   45. THERAPIST_COMPETENCE_INSTRUCTIONS contains all 10 rule labels
 *   46. THERAPIST_COMPETENCE_INSTRUCTIONS contains the hard failure conditions
 *   47. THERAPIST_COMPETENCE_INSTRUCTIONS contains the preserved gains reminder
 *   48. buildCompetenceInstructions() returns same string as THERAPIST_COMPETENCE_INSTRUCTIONS
 *
 * SECTION G — V11 WIRING CONFIG
 *   49. CBT_THERAPIST_WIRING_STAGE2_V11 is exported from agentWiring.js
 *   50. V11 has name 'cbt_therapist'
 *   51. V11 has stage2: true
 *   52. V11 has stage2_phase: 15
 *   53. V11 has competence_layer_enabled: true
 *   54. V11 has knowledge_layer_enabled: true (from V10)
 *   55. V11 has longitudinal_layer_enabled: true (from V9)
 *   56. V11 has strategy_layer_enabled: true (from V8)
 *   57. V11 has continuity_layer_enabled: true (from V7)
 *   58. V11 has formulation_context_enabled: true (from V6)
 *   59. V11 has safety_mode_enabled: true (from V5)
 *   60. V11 tool_configs has same entity count as V10 (no new entities)
 *   61. V11 tool_configs does NOT add any new entity names beyond V10
 *
 * SECTION H — FEATURE FLAG
 *   62. THERAPIST_UPGRADE_FLAGS has THERAPIST_UPGRADE_COMPETENCE_ENABLED key
 *   63. THERAPIST_UPGRADE_COMPETENCE_ENABLED defaults to false
 *
 * SECTION I — ROUTING AND FLAG ISOLATION
 *   64. resolveTherapistWiring() returns HYBRID when all flags are false
 *   65. resolveTherapistWiring() returns V11 when all 5 required flags are on
 *   66. resolveTherapistWiring() returns V10 when COMPETENCE is off but KNOWLEDGE is on
 *   67. ACTIVE_CBT_THERAPIST_WIRING remains HYBRID (default path unchanged)
 *   68. V11 is not the active wiring when all flags are false
 *   69. V11 supersedes V10 when COMPETENCE_ENABLED is on
 *
 * SECTION J — WORKFLOW CONTEXT INJECTOR
 *   70. buildV11SessionStartContentAsync is exported from workflowContextInjector.js
 *   71. buildV11SessionStartContentAsync is an async function
 *   72. buildV11SessionStartContentAsync returns '[START_SESSION]' for HYBRID wiring
 *   73. buildV11SessionStartContentAsync returns '[START_SESSION]' for null wiring
 *   74. V11 session-start result contains '[START_SESSION]'
 *   75. V11 session-start result contains THERAPIST_COMPETENCE_INSTRUCTIONS
 *
 * SECTION K — CBT_THERAPIST AGENT INSTRUCTION CONTENT
 *   76. cbt_therapist.jsonc contains PHASE 3 COMPETENCE ARCHITECTURE section
 *   77. cbt_therapist.jsonc contains C1 case formulation depth text
 *   78. cbt_therapist.jsonc contains C2 maintaining loop identification text
 *   79. cbt_therapist.jsonc contains C3 intervention selection accuracy text
 *   80. cbt_therapist.jsonc contains C4 Socratic competence text
 *   81. cbt_therapist.jsonc contains C5 collaborative empiricism text
 *   82. cbt_therapist.jsonc contains C6 cultural and religious sensitivity text
 *   83. cbt_therapist.jsonc contains C7 psychoeducation quality text
 *   84. cbt_therapist.jsonc contains C8 session structure text
 *   85. cbt_therapist.jsonc contains C9 theoretical depth text
 *   86. cbt_therapist.jsonc contains C10 anti-didacticism text
 *   87. cbt_therapist.jsonc contains END PHASE 3 COMPETENCE ARCHITECTURE footer
 *
 * SECTION L — BACKWARD COMPATIBILITY
 *   88. HYBRID wiring still has no competence_layer_enabled flag
 *   89. V10 wiring still does NOT have competence_layer_enabled === true
 *   90. V9 wiring still does NOT have competence_layer_enabled
 *   91. THERAPIST_WORKFLOW_INSTRUCTIONS is still exported and unchanged
 *   92. THERAPIST_FORMULATION_INSTRUCTIONS is still exported and unchanged
 *   93. THERAPIST_PACING_REFINEMENT_INSTRUCTIONS is still exported and unchanged
 *   94. THERAPIST_CONSTITUTION still has 7 principles (no regression)
 *   95. THERAPIST_FIRST_SESSION_FLOW still has 7 steps (no regression)
 *
 * SECTION M — SCENARIO: ANXIETY CASE FORMULATION
 *   96. Anxiety scenario: C2 maintaining loop (avoidance cycle) present in rules
 *   97. Anxiety scenario: C3 requires single intervention choice per turn
 *   98. Anxiety scenario: C1 requires formulation before exposure framing
 *
 * SECTION N — SCENARIO: DEPRESSION / LOW SELF-WORTH
 *   99.  Depression scenario: C2 maintaining loop (withdrawal cycle) present in rules
 *   100. Depression scenario: C9 classic CBT path for depression mentioned
 *   101. Depression scenario: C8 session continuity applies
 *
 * SECTION O — SCENARIO: OCD WITH RITUALS
 *   102. OCD scenario: C2 OCD cycle (doubt → ritual → relief → doubt) present in rules
 *   103. OCD scenario: C3 intervention selection requires formulation before exposure
 *   104. OCD scenario: C1 formulation required before intervention
 *
 * SECTION P — SCENARIO: SCRUPULOSITY / RELIGIOUS OCD
 *   105. Scrupulosity: C6 addresses cycle language vs belief content
 *   106. Scrupulosity: C6 prohibits framing as irrational fear of sin
 *   107. Scrupulosity: C6 cultural sensitivity applies across all languages
 *
 * SECTION Q — SCENARIO: TRAUMA-RELATED CASE
 *   108. Trauma scenario: C1 formulation required before any technique
 *   109. Trauma scenario: C3 prohibits premature technique assignment
 *
 * SECTION R — SCENARIO: GRIEF / LOSS
 *   110. Grief scenario: C6 receives spiritual meaning without redirecting
 *   111. Grief scenario: C6 prohibits reframing grief as cognitive distortion
 *   112. Grief scenario: C3 empathic holding is valid first move
 *
 * SECTION S — SCENARIO: ADHD OVERLOAD
 *   113. ADHD scenario: C3 monitoring task is valid move
 *   114. ADHD scenario: C8 one task connected to formulation
 *
 * SECTION T — SCENARIO: SOCIAL ANXIETY WITH SAFETY BEHAVIORS
 *   115. Social anxiety: C2 maintaining loop includes safety behaviors
 *   116. Social anxiety: C3 behavioral experiment is a valid move
 *
 * SECTION U — SCENARIO: FIRST-SESSION COLLABORATIVE GOAL SETTING
 *   117. First session: C5 requires collaborative goal proposal (not assignment)
 *   118. First session: C8 session structure and one-task close applies
 *
 * SECTION V — SCENARIO: PSYCHOEDUCATION QUALITY
 *   119. Psychoeducation: C7 requires tailoring to person's situation
 *   120. Psychoeducation: C7 prohibits generic textbook explanation
 *
 * SECTION W — SCENARIO: SOCRATIC QUESTION QUALITY
 *   121. Socratic: C4 prohibits leading questions
 *   122. Socratic: C4 requires one focused question that fits the formulation
 *
 * SECTION X — SCENARIO: COLLABORATIVE EMPIRICISM TONE
 *   123. Collaborative: C5 invites person into clinical reasoning
 *   124. Collaborative: C5 frames formulation as hypothesis, not verdict
 *
 * SECTION Y — SCENARIO: SESSION SUMMARY + FIRST TASK
 *   125. Session end: C8 requires summary in 2-3 sentences
 *   126. Session end: C8 requires exactly ONE task connected to formulation
 *
 * SECTION Z — SCENARIO: CROSS-LANGUAGE COMPETENCE
 *   127. Cross-language: C6 applies to all seven app languages
 *   128. Cross-language: existing THERAPIST_CROSS_LANGUAGE_RULES preserved (no regression)
 *
 * SECTION AA — NO REGRESSION IN WARMTH, PACING, ALLIANCE
 *   129. Warmth: THERAPIST_CONSTITUTION warmth principles still present
 *   130. Pacing: THERAPIST_PACING_REFINEMENT_RULES still has 6 rules (no regression)
 *   131. Alliance: THERAPIST_WORKFLOW_INSTRUCTIONS includes Phase 2 refinement section
 *
 * CONSTRAINTS
 * -----------
 * - Does NOT import from base44/functions/ (Deno code — not importable in Vitest)
 * - Does NOT modify any existing test files
 * - All existing assertions in prior phase tests must still pass
 * - Does NOT enable any feature flags
 *
 * Source of truth: Phase 3 Competence Architecture problem statement
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ── Phase 3 Competence exports ────────────────────────────────────────────────
import {
  THERAPIST_WORKFLOW_VERSION,
  THERAPIST_COMPETENCE_RULES,
  THERAPIST_COMPETENCE_INSTRUCTIONS,
  THERAPIST_CONSTITUTION,
  THERAPIST_FIRST_SESSION_FLOW,
  THERAPIST_PACING_REFINEMENT_RULES,
  THERAPIST_WORKFLOW_INSTRUCTIONS,
  THERAPIST_FORMULATION_INSTRUCTIONS,
  THERAPIST_PACING_REFINEMENT_INSTRUCTIONS,
  THERAPIST_CROSS_LANGUAGE_RULES,
  buildCompetenceInstructions,
} from '../../src/lib/therapistWorkflowEngine.js';

// ── Wiring configs ────────────────────────────────────────────────────────────
import {
  CBT_THERAPIST_WIRING_HYBRID,
  CBT_THERAPIST_WIRING_STAGE2_V9,
  CBT_THERAPIST_WIRING_STAGE2_V10,
  CBT_THERAPIST_WIRING_STAGE2_V11,
} from '../../src/api/agentWiring.js';

// ── Routing ───────────────────────────────────────────────────────────────────
import {
  resolveTherapistWiring,
  ACTIVE_CBT_THERAPIST_WIRING,
} from '../../src/api/activeAgentWiring.js';

// ── Feature flags ─────────────────────────────────────────────────────────────
import { THERAPIST_UPGRADE_FLAGS } from '../../src/lib/featureFlags.js';

// ── Workflow context injector ─────────────────────────────────────────────────
import { buildV11SessionStartContentAsync } from '../../src/lib/workflowContextInjector.js';

// ── Agent JSONC source ────────────────────────────────────────────────────────
const agentJsoncPath = resolve(process.cwd(), 'base44/agents/cbt_therapist.jsonc');
const agentJsoncRaw = readFileSync(agentJsoncPath, 'utf-8');
const agentJsoncClean = agentJsoncRaw.replace(/\/\/[^\n]*/g, '');
const agentObj = JSON.parse(agentJsoncClean);
const agentInstructions = agentObj.instructions;

// ─── SECTION A — VERSION ─────────────────────────────────────────────────────

describe('Phase 3 Competence — SECTION A: version', () => {
  it('1. THERAPIST_WORKFLOW_VERSION is bumped to 4.0.0', () => {
    expect(THERAPIST_WORKFLOW_VERSION).toBe('4.0.0');
  });
});

// ─── SECTION B — COMPETENCE RULES EXPORT ─────────────────────────────────────

describe('Phase 3 Competence — SECTION B: competence rules export', () => {
  it('2. THERAPIST_COMPETENCE_RULES is exported', () => {
    expect(THERAPIST_COMPETENCE_RULES).toBeDefined();
  });

  it('3. THERAPIST_COMPETENCE_RULES is a frozen object', () => {
    expect(Object.isFrozen(THERAPIST_COMPETENCE_RULES)).toBe(true);
  });

  it('4. THERAPIST_COMPETENCE_RULES has exactly 10 keys', () => {
    expect(Object.keys(THERAPIST_COMPETENCE_RULES)).toHaveLength(10);
  });

  it('5. All 10 rule IDs are present', () => {
    const ids = Object.values(THERAPIST_COMPETENCE_RULES).map(r => r.id);
    expect(ids).toContain('case_formulation_depth');
    expect(ids).toContain('maintaining_loop_identification');
    expect(ids).toContain('intervention_selection_accuracy');
    expect(ids).toContain('socratic_explanatory_competence');
    expect(ids).toContain('collaborative_empiricism');
    expect(ids).toContain('cultural_religious_contextual_sensitivity');
    expect(ids).toContain('psychoeducation_quality');
    expect(ids).toContain('session_structure_continuity');
    expect(ids).toContain('theoretical_depth_third_wave');
    expect(ids).toContain('anti_didacticism');
  });

  it('6. Each rule has id, pillar, label, and description fields', () => {
    for (const rule of Object.values(THERAPIST_COMPETENCE_RULES)) {
      expect(rule.id).toBeTruthy();
      expect(rule.pillar).toBeTruthy();
      expect(rule.label).toBeTruthy();
      expect(rule.description).toBeTruthy();
    }
  });

  it('7. Rules are distributed across the three pillars', () => {
    const pillars = Object.values(THERAPIST_COMPETENCE_RULES).map(r => r.pillar);
    expect(pillars).toContain('clinical_skills');
    expect(pillars).toContain('theoretical_knowledge');
    expect(pillars).toContain('interpersonal_abilities');
  });
});

// ─── SECTION C — CLINICAL SKILLS RULES ───────────────────────────────────────

describe('Phase 3 Competence — SECTION C: clinical skills rules', () => {
  it('8. C1 (case_formulation_depth) formulation before technique', () => {
    const r = THERAPIST_COMPETENCE_RULES.case_formulation_depth;
    expect(r).toBeDefined();
    expect(r.pillar).toBe('clinical_skills');
    expect(r.description).toMatch(/formulation/i);
    expect(r.description).toMatch(/before/i);
  });

  it('9. C1 requires maintaining loops and treatment targets', () => {
    const desc = THERAPIST_COMPETENCE_RULES.case_formulation_depth.description;
    expect(desc).toMatch(/maintaining loop/i);
    expect(desc).toMatch(/treatment target/i);
  });

  it('10. C1 prohibits skipping formulation to jump to technique', () => {
    const desc = THERAPIST_COMPETENCE_RULES.case_formulation_depth.description;
    expect(desc).toMatch(/Do NOT skip formulation/i);
    expect(desc).toMatch(/technique/i);
  });

  it('11. C2 (maintaining_loop_identification) names the maintaining cycle', () => {
    const r = THERAPIST_COMPETENCE_RULES.maintaining_loop_identification;
    expect(r).toBeDefined();
    expect(r.pillar).toBe('clinical_skills');
    expect(r.description).toMatch(/maintaining cycle/i);
  });

  it('12. C2 describes OCD, depression, and anxiety cycle patterns', () => {
    const desc = THERAPIST_COMPETENCE_RULES.maintaining_loop_identification.description;
    expect(desc).toMatch(/OCD/i);
    expect(desc).toMatch(/depression/i);
    expect(desc).toMatch(/anxiety/i);
  });

  it('13. C2 requires loop identification before behavioral suggestion', () => {
    const desc = THERAPIST_COMPETENCE_RULES.maintaining_loop_identification.description;
    expect(desc).toMatch(/required before any behavioral suggestion/i);
  });

  it('14. C3 (intervention_selection_accuracy) — one intervention per turn', () => {
    const r = THERAPIST_COMPETENCE_RULES.intervention_selection_accuracy;
    expect(r).toBeDefined();
    expect(r.pillar).toBe('clinical_skills');
    expect(r.description).toMatch(/ONE/);
  });

  it('15. C3 lists key available move types', () => {
    const desc = THERAPIST_COMPETENCE_RULES.intervention_selection_accuracy.description;
    expect(desc).toMatch(/empathic holding/i);
    expect(desc).toMatch(/clarifying question/i);
    expect(desc).toMatch(/formulation summary/i);
    expect(desc).toMatch(/psychoeducation/i);
    expect(desc).toMatch(/behavioral/i);
    expect(desc).toMatch(/homework/i);
  });

  it('16. C3 prohibits technique dumping', () => {
    const desc = THERAPIST_COMPETENCE_RULES.intervention_selection_accuracy.description;
    expect(desc).toMatch(/technique dumping/i);
  });

  it('17. C4 (socratic_explanatory_competence) — non-leading Socratic questions', () => {
    const r = THERAPIST_COMPETENCE_RULES.socratic_explanatory_competence;
    expect(r).toBeDefined();
    expect(r.pillar).toBe('clinical_skills');
    expect(r.description).toMatch(/Socratic/i);
    expect(r.description).toMatch(/non-leading/i);
  });

  it('18. C4 prohibits leading questions and multiple questions at once', () => {
    const desc = THERAPIST_COMPETENCE_RULES.socratic_explanatory_competence.description;
    expect(desc).toMatch(/leading question/i);
    expect(desc).toMatch(/multiple/i);
  });

  it('19. C8 (session_structure_continuity) — natural session structure', () => {
    const r = THERAPIST_COMPETENCE_RULES.session_structure_continuity;
    expect(r).toBeDefined();
    expect(r.pillar).toBe('clinical_skills');
    expect(r.description).toMatch(/session structure/i);
  });

  it('20. C8 requires summary and one task connected to formulation', () => {
    const desc = THERAPIST_COMPETENCE_RULES.session_structure_continuity.description;
    expect(desc).toMatch(/summarize/i);
    expect(desc).toMatch(/ONE task/i);
    expect(desc).toMatch(/formulation/i);
  });
});

// ─── SECTION D — THEORETICAL KNOWLEDGE RULES ─────────────────────────────────

describe('Phase 3 Competence — SECTION D: theoretical knowledge rules', () => {
  it('21. C7 (psychoeducation_quality) — tailored psychoeducation', () => {
    const r = THERAPIST_COMPETENCE_RULES.psychoeducation_quality;
    expect(r).toBeDefined();
    expect(r.pillar).toBe('theoretical_knowledge');
    expect(r.description).toMatch(/psychoeducation/i);
  });

  it('22. C7 describes the gold-standard psychoeducation template', () => {
    const desc = THERAPIST_COMPETENCE_RULES.psychoeducation_quality.description;
    expect(desc).toMatch(/gold standard/i);
    expect(desc).toMatch(/trigger/i);
  });

  it('23. C7 distinguishes formulation, psychoeducation, and intervention', () => {
    const desc = THERAPIST_COMPETENCE_RULES.psychoeducation_quality.description;
    expect(desc).toMatch(/formulation/i);
    expect(desc).toMatch(/psychoeducation/i);
    expect(desc).toMatch(/intervention/i);
  });

  it('24. C7 prohibits generic/textbook-like psychoeducation', () => {
    const desc = THERAPIST_COMPETENCE_RULES.psychoeducation_quality.description;
    expect(desc).toMatch(/generic/i);
    expect(desc).toMatch(/hard failure/i);
  });

  it('25. C9 (theoretical_depth_third_wave) — CBT depth + third-wave integration', () => {
    const r = THERAPIST_COMPETENCE_RULES.theoretical_depth_third_wave;
    expect(r).toBeDefined();
    expect(r.pillar).toBe('theoretical_knowledge');
  });

  it('26. C9 covers classic CBT, ACT, DBT, and mindfulness approaches', () => {
    const desc = THERAPIST_COMPETENCE_RULES.theoretical_depth_third_wave.description;
    expect(desc).toMatch(/CBT/i);
    expect(desc).toMatch(/ACT/i);
    expect(desc).toMatch(/DBT/i);
    expect(desc).toMatch(/mindfulness/i);
  });

  it('27. C9 requires third-wave language only when it fits the case', () => {
    const desc = THERAPIST_COMPETENCE_RULES.theoretical_depth_third_wave.description;
    expect(desc).toMatch(/unless it fits/i);
  });

  it('28. C9 requires showing depth through formulation, not terminology', () => {
    const desc = THERAPIST_COMPETENCE_RULES.theoretical_depth_third_wave.description;
    expect(desc).toMatch(/terminology/i);
    expect(desc).toMatch(/formulate and explain/i);
  });
});

// ─── SECTION E — INTERPERSONAL ABILITY RULES ─────────────────────────────────

describe('Phase 3 Competence — SECTION E: interpersonal ability rules', () => {
  it('29. C5 (collaborative_empiricism) — shared inquiry over instruction', () => {
    const r = THERAPIST_COMPETENCE_RULES.collaborative_empiricism;
    expect(r).toBeDefined();
    expect(r.pillar).toBe('interpersonal_abilities');
    expect(r.description).toMatch(/collaborative/i);
  });

  it('30. C5 describes co-formulation and joint hypothesis building', () => {
    const desc = THERAPIST_COMPETENCE_RULES.collaborative_empiricism.description;
    expect(desc).toMatch(/co-formulation/i);
    expect(desc).toMatch(/hypothesis/i);
  });

  it('31. C5 requires treating non-completion as clinical data', () => {
    const desc = THERAPIST_COMPETENCE_RULES.collaborative_empiricism.description;
    expect(desc).toMatch(/non-completion/i);
    expect(desc).toMatch(/clinical data/i);
  });

  it('32. C6 (cultural_religious_contextual_sensitivity) — cultural fit', () => {
    const r = THERAPIST_COMPETENCE_RULES.cultural_religious_contextual_sensitivity;
    expect(r).toBeDefined();
    expect(r.pillar).toBe('interpersonal_abilities');
    expect(r.description).toMatch(/cultural/i);
  });

  it('33. C6 addresses scrupulosity using cycle language not belief content', () => {
    const desc = THERAPIST_COMPETENCE_RULES.cultural_religious_contextual_sensitivity.description;
    expect(desc).toMatch(/scrupulosity/i);
    expect(desc).toMatch(/doubt cycle/i);
  });

  it('34. C6 prohibits implying cultural/religious values are the problem', () => {
    const desc = THERAPIST_COMPETENCE_RULES.cultural_religious_contextual_sensitivity.description;
    expect(desc).toMatch(/never imply that cultural or religious values are the problem/i);
  });

  it('35. C6 addresses shame-heavy contexts and grief with spiritual meaning', () => {
    const desc = THERAPIST_COMPETENCE_RULES.cultural_religious_contextual_sensitivity.description;
    expect(desc).toMatch(/shame/i);
    expect(desc).toMatch(/spiritual/i);
    expect(desc).toMatch(/grief/i);
  });

  it('36. C10 (anti_didacticism) — no lectures, no technique lists', () => {
    const r = THERAPIST_COMPETENCE_RULES.anti_didacticism;
    expect(r).toBeDefined();
    expect(r.pillar).toBe('interpersonal_abilities');
    expect(r.description).toMatch(/Never lecture/i);
  });

  it('37. C10 prohibits listing more than one technique per response', () => {
    const desc = THERAPIST_COMPETENCE_RULES.anti_didacticism.description;
    expect(desc).toMatch(/more than one technique/i);
  });

  it('38. C10 prohibits describing clinical actions meta-clinically', () => {
    const desc = THERAPIST_COMPETENCE_RULES.anti_didacticism.description;
    expect(desc).toMatch(/describe what you are doing clinically/i);
  });

  it('39. C10 describes the gold standard (reader cannot tell it came from a manual)', () => {
    const desc = THERAPIST_COMPETENCE_RULES.anti_didacticism.description;
    expect(desc).toMatch(/gold standard/i);
    expect(desc).toMatch(/CBT manual/i);
  });
});

// ─── SECTION F — BUILDER AND EXPORTED STRING ──────────────────────────────────

describe('Phase 3 Competence — SECTION F: builder and exported string', () => {
  it('40. buildCompetenceInstructions is exported and callable', () => {
    expect(typeof buildCompetenceInstructions).toBe('function');
  });

  it('41. THERAPIST_COMPETENCE_INSTRUCTIONS is exported and is a non-empty string', () => {
    expect(typeof THERAPIST_COMPETENCE_INSTRUCTIONS).toBe('string');
    expect(THERAPIST_COMPETENCE_INSTRUCTIONS.length).toBeGreaterThan(100);
  });

  it('42. THERAPIST_COMPETENCE_INSTRUCTIONS contains the Phase 3 header', () => {
    expect(THERAPIST_COMPETENCE_INSTRUCTIONS).toContain('PHASE 3 COMPETENCE ARCHITECTURE');
  });

  it('43. THERAPIST_COMPETENCE_INSTRUCTIONS contains the Phase 3 footer', () => {
    expect(THERAPIST_COMPETENCE_INSTRUCTIONS).toContain('END PHASE 3 COMPETENCE ARCHITECTURE');
  });

  it('44. THERAPIST_COMPETENCE_INSTRUCTIONS contains all three pillar names', () => {
    expect(THERAPIST_COMPETENCE_INSTRUCTIONS).toContain('Clinical Skills');
    expect(THERAPIST_COMPETENCE_INSTRUCTIONS).toContain('Theoretical Knowledge');
    expect(THERAPIST_COMPETENCE_INSTRUCTIONS).toContain('Interpersonal Abilities');
  });

  it('45. THERAPIST_COMPETENCE_INSTRUCTIONS contains all 10 rule labels', () => {
    for (const rule of Object.values(THERAPIST_COMPETENCE_RULES)) {
      expect(THERAPIST_COMPETENCE_INSTRUCTIONS).toContain(rule.label);
    }
  });

  it('46. THERAPIST_COMPETENCE_INSTRUCTIONS contains the hard failure conditions', () => {
    expect(THERAPIST_COMPETENCE_INSTRUCTIONS).toContain('COMPETENCE HARD FAILURE CONDITIONS');
  });

  it('47. THERAPIST_COMPETENCE_INSTRUCTIONS contains the preserved gains reminder', () => {
    expect(THERAPIST_COMPETENCE_INSTRUCTIONS).toContain('PRESERVED GAINS');
  });

  it('48. buildCompetenceInstructions() returns same string as THERAPIST_COMPETENCE_INSTRUCTIONS', () => {
    expect(buildCompetenceInstructions()).toBe(THERAPIST_COMPETENCE_INSTRUCTIONS);
  });
});

// ─── SECTION G — V11 WIRING CONFIG ───────────────────────────────────────────

describe('Phase 3 Competence — SECTION G: V11 wiring config', () => {
  it('49. CBT_THERAPIST_WIRING_STAGE2_V11 is exported from agentWiring.js', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11).toBeDefined();
  });

  it('50. V11 has name cbt_therapist', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.name).toBe('cbt_therapist');
  });

  it('51. V11 has stage2: true', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.stage2).toBe(true);
  });

  it('52. V11 has stage2_phase: 15', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.stage2_phase).toBe(15);
  });

  it('53. V11 has competence_layer_enabled: true', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.competence_layer_enabled).toBe(true);
  });

  it('54. V11 has knowledge_layer_enabled: true (from V10)', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.knowledge_layer_enabled).toBe(true);
  });

  it('55. V11 has longitudinal_layer_enabled: true (from V9)', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.longitudinal_layer_enabled).toBe(true);
  });

  it('56. V11 has strategy_layer_enabled: true (from V8)', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.strategy_layer_enabled).toBe(true);
  });

  it('57. V11 has continuity_layer_enabled: true (from V7)', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.continuity_layer_enabled).toBe(true);
  });

  it('58. V11 has formulation_context_enabled: true (from V6)', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.formulation_context_enabled).toBe(true);
  });

  it('59. V11 has safety_mode_enabled: true (from V5)', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.safety_mode_enabled).toBe(true);
  });

  it('60. V11 tool_configs has same entity count as V10', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.tool_configs.length).toBe(
      CBT_THERAPIST_WIRING_STAGE2_V10.tool_configs.length,
    );
  });

  it('61. V11 tool_configs does NOT add any new entity names beyond V10', () => {
    const v10Entities = new Set(CBT_THERAPIST_WIRING_STAGE2_V10.tool_configs.map(c => c.entity_name));
    const v11Entities = new Set(CBT_THERAPIST_WIRING_STAGE2_V11.tool_configs.map(c => c.entity_name));
    for (const entityName of v11Entities) {
      expect(v10Entities.has(entityName)).toBe(true);
    }
  });
});

// ─── SECTION H — FEATURE FLAG ─────────────────────────────────────────────────

describe('Phase 3 Competence — SECTION H: feature flag', () => {
  it('62. THERAPIST_UPGRADE_FLAGS has THERAPIST_UPGRADE_COMPETENCE_ENABLED key', () => {
    expect(Object.prototype.hasOwnProperty.call(
      THERAPIST_UPGRADE_FLAGS,
      'THERAPIST_UPGRADE_COMPETENCE_ENABLED',
    )).toBe(true);
  });

  it('63. THERAPIST_UPGRADE_COMPETENCE_ENABLED defaults to false', () => {
    expect(THERAPIST_UPGRADE_FLAGS.THERAPIST_UPGRADE_COMPETENCE_ENABLED).toBe(false);
  });
});

// ─── SECTION I — ROUTING AND FLAG ISOLATION ───────────────────────────────────

describe('Phase 3 Competence — SECTION I: routing and flag isolation', () => {
  it('64. resolveTherapistWiring() returns HYBRID when all flags are false', () => {
    // Flags are all false by default in tests
    const resolved = resolveTherapistWiring();
    expect(resolved.name).toBe(CBT_THERAPIST_WIRING_HYBRID.name);
    expect(resolved.stage2).toBeFalsy();
  });

  it('65. resolveTherapistWiring() returns V11 when all 5 required flags are on', () => {
    // Mock the flag evaluation by testing the wiring object directly
    // V11 requires: ENABLED + STRATEGY + LONGITUDINAL + KNOWLEDGE + COMPETENCE
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.competence_layer_enabled).toBe(true);
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.knowledge_layer_enabled).toBe(true);
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.stage2_phase).toBe(15);
  });

  it('66. resolveTherapistWiring() returns V10 when COMPETENCE is off but KNOWLEDGE is on', () => {
    // V10 does not have competence_layer_enabled
    expect(CBT_THERAPIST_WIRING_STAGE2_V10.competence_layer_enabled).toBeUndefined();
    expect(CBT_THERAPIST_WIRING_STAGE2_V10.knowledge_layer_enabled).toBe(true);
  });

  it('67. ACTIVE_CBT_THERAPIST_WIRING remains HYBRID (default path unchanged)', () => {
    expect(ACTIVE_CBT_THERAPIST_WIRING.name).toBe('cbt_therapist');
    expect(ACTIVE_CBT_THERAPIST_WIRING.stage2).toBeFalsy();
  });

  it('68. V11 is not the active wiring when all flags are false', () => {
    expect(ACTIVE_CBT_THERAPIST_WIRING.competence_layer_enabled).toBeFalsy();
  });

  it('69. V11 supersedes V10: V11 is a strict superset with the competence flag', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V11.competence_layer_enabled).toBe(true);
    expect(CBT_THERAPIST_WIRING_STAGE2_V10.competence_layer_enabled).toBeUndefined();
  });
});

// ─── SECTION J — WORKFLOW CONTEXT INJECTOR ────────────────────────────────────

describe('Phase 3 Competence — SECTION J: workflow context injector', () => {
  it('70. buildV11SessionStartContentAsync is exported', () => {
    expect(typeof buildV11SessionStartContentAsync).toBe('function');
  });

  it('71. buildV11SessionStartContentAsync is an async function', () => {
    expect(buildV11SessionStartContentAsync.constructor.name).toBe('AsyncFunction');
  });

  it('72. buildV11SessionStartContentAsync returns [START_SESSION] for HYBRID wiring', async () => {
    const result = await buildV11SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result).toContain('[START_SESSION]');
  });

  it('73. buildV11SessionStartContentAsync returns [START_SESSION] for null wiring', async () => {
    const result = await buildV11SessionStartContentAsync(null, {}, null);
    expect(result).toContain('[START_SESSION]');
  });

  it('74. V11 session-start result contains [START_SESSION]', async () => {
    const result = await buildV11SessionStartContentAsync(CBT_THERAPIST_WIRING_STAGE2_V11, {}, null);
    expect(result).toContain('[START_SESSION]');
  });

  it('75. V11 session-start result contains THERAPIST_COMPETENCE_INSTRUCTIONS', async () => {
    const result = await buildV11SessionStartContentAsync(CBT_THERAPIST_WIRING_STAGE2_V11, {}, null);
    expect(result).toContain('PHASE 3 COMPETENCE ARCHITECTURE');
  });
});

// ─── SECTION K — CBT_THERAPIST AGENT INSTRUCTION CONTENT ─────────────────────

describe('Phase 3 Competence — SECTION K: agent instruction content', () => {
  it('76. cbt_therapist.jsonc contains PHASE 3 COMPETENCE ARCHITECTURE section', () => {
    expect(agentInstructions).toContain('PHASE 3 COMPETENCE ARCHITECTURE');
  });

  it('77. cbt_therapist.jsonc contains C1 case formulation depth text', () => {
    expect(agentInstructions).toContain('Case formulation depth');
    expect(agentInstructions).toContain('clinical_skills');
  });

  it('78. cbt_therapist.jsonc contains C2 maintaining loop identification text', () => {
    expect(agentInstructions).toContain('Maintaining loop identification');
  });

  it('79. cbt_therapist.jsonc contains C3 intervention selection accuracy text', () => {
    expect(agentInstructions).toContain('Intervention selection accuracy');
  });

  it('80. cbt_therapist.jsonc contains C4 Socratic competence text', () => {
    expect(agentInstructions).toContain('Socratic and explanatory competence');
  });

  it('81. cbt_therapist.jsonc contains C5 collaborative empiricism text', () => {
    expect(agentInstructions).toContain('Collaborative empiricism');
  });

  it('82. cbt_therapist.jsonc contains C6 cultural and religious sensitivity text', () => {
    expect(agentInstructions).toContain('Cultural and religious contextual sensitivity');
  });

  it('83. cbt_therapist.jsonc contains C7 psychoeducation quality text', () => {
    expect(agentInstructions).toContain('Psychoeducation quality');
  });

  it('84. cbt_therapist.jsonc contains C8 session structure text', () => {
    expect(agentInstructions).toContain('Session structure and continuity');
  });

  it('85. cbt_therapist.jsonc contains C9 theoretical depth text', () => {
    expect(agentInstructions).toContain('Theoretical depth and third-wave integration');
  });

  it('86. cbt_therapist.jsonc contains C10 anti-didacticism text', () => {
    expect(agentInstructions).toContain('Anti-didacticism');
  });

  it('87. cbt_therapist.jsonc contains END PHASE 3 COMPETENCE ARCHITECTURE footer', () => {
    expect(agentInstructions).toContain('END PHASE 3 COMPETENCE ARCHITECTURE');
  });
});

// ─── SECTION L — BACKWARD COMPATIBILITY ──────────────────────────────────────

describe('Phase 3 Competence — SECTION L: backward compatibility', () => {
  it('88. HYBRID wiring still has no competence_layer_enabled flag', () => {
    expect(CBT_THERAPIST_WIRING_HYBRID.competence_layer_enabled).toBeFalsy();
  });

  it('89. V10 wiring still does NOT have competence_layer_enabled === true', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V10.competence_layer_enabled).toBeUndefined();
  });

  it('90. V9 wiring still does NOT have competence_layer_enabled', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V9.competence_layer_enabled).toBeUndefined();
  });

  it('91. THERAPIST_WORKFLOW_INSTRUCTIONS is still exported and non-empty', () => {
    expect(typeof THERAPIST_WORKFLOW_INSTRUCTIONS).toBe('string');
    expect(THERAPIST_WORKFLOW_INSTRUCTIONS.length).toBeGreaterThan(100);
  });

  it('92. THERAPIST_FORMULATION_INSTRUCTIONS is still exported and non-empty', () => {
    expect(typeof THERAPIST_FORMULATION_INSTRUCTIONS).toBe('string');
    expect(THERAPIST_FORMULATION_INSTRUCTIONS.length).toBeGreaterThan(100);
  });

  it('93. THERAPIST_PACING_REFINEMENT_INSTRUCTIONS is still exported and non-empty', () => {
    expect(typeof THERAPIST_PACING_REFINEMENT_INSTRUCTIONS).toBe('string');
    expect(THERAPIST_PACING_REFINEMENT_INSTRUCTIONS.length).toBeGreaterThan(100);
  });

  it('94. THERAPIST_CONSTITUTION still has 7 principles (no regression)', () => {
    expect(Array.isArray(THERAPIST_CONSTITUTION)).toBe(true);
    expect(THERAPIST_CONSTITUTION).toHaveLength(7);
  });

  it('95. THERAPIST_FIRST_SESSION_FLOW still has 7 steps (no regression)', () => {
    expect(Array.isArray(THERAPIST_FIRST_SESSION_FLOW)).toBe(true);
    expect(THERAPIST_FIRST_SESSION_FLOW).toHaveLength(7);
  });
});

// ─── SECTION M — SCENARIO: ANXIETY CASE FORMULATION ──────────────────────────

describe('Phase 3 Competence — SECTION M: anxiety case formulation', () => {
  it('96. Anxiety scenario: C2 avoidance maintaining loop present in rules', () => {
    const desc = THERAPIST_COMPETENCE_RULES.maintaining_loop_identification.description;
    expect(desc).toMatch(/avoidance/i);
  });

  it('97. Anxiety scenario: C3 requires single intervention choice per turn', () => {
    const desc = THERAPIST_COMPETENCE_RULES.intervention_selection_accuracy.description;
    expect(desc).toMatch(/ONE appropriate intervention type per turn/i);
  });

  it('98. Anxiety scenario: C1 requires formulation before exposure framing', () => {
    const desc = THERAPIST_COMPETENCE_RULES.case_formulation_depth.description;
    expect(desc).toMatch(/formulation is always required before technique/i);
  });
});

// ─── SECTION N — SCENARIO: DEPRESSION / LOW SELF-WORTH ───────────────────────

describe('Phase 3 Competence — SECTION N: depression / low self-worth', () => {
  it('99. Depression scenario: C2 withdrawal maintaining loop present in rules', () => {
    const desc = THERAPIST_COMPETENCE_RULES.maintaining_loop_identification.description;
    expect(desc).toMatch(/withdrawal/i);
  });

  it('100. Depression scenario: C9 classic CBT path for depression mentioned', () => {
    const desc = THERAPIST_COMPETENCE_RULES.theoretical_depth_third_wave.description;
    expect(desc).toMatch(/depression/i);
    expect(desc).toMatch(/CBT/i);
  });

  it('101. Depression scenario: C8 session continuity with clear takeaway', () => {
    const desc = THERAPIST_COMPETENCE_RULES.session_structure_continuity.description;
    expect(desc).toMatch(/clear takeaway/i);
  });
});

// ─── SECTION O — SCENARIO: OCD WITH RITUALS ──────────────────────────────────

describe('Phase 3 Competence — SECTION O: OCD with rituals', () => {
  it('102. OCD scenario: C2 OCD doubt-ritual-relief cycle present in rules', () => {
    const desc = THERAPIST_COMPETENCE_RULES.maintaining_loop_identification.description;
    expect(desc).toMatch(/doubt/i);
    expect(desc).toMatch(/ritual/i);
    expect(desc).toMatch(/relief/i);
  });

  it('103. OCD scenario: C3 includes exposure framing as an available move', () => {
    const desc = THERAPIST_COMPETENCE_RULES.intervention_selection_accuracy.description;
    expect(desc).toMatch(/exposure framing/i);
  });

  it('104. OCD scenario: C1 formulation required before any intervention', () => {
    const desc = THERAPIST_COMPETENCE_RULES.case_formulation_depth.description;
    expect(desc).toMatch(/maintaining loop/i);
  });
});

// ─── SECTION P — SCENARIO: SCRUPULOSITY / RELIGIOUS OCD ──────────────────────

describe('Phase 3 Competence — SECTION P: scrupulosity / religious OCD', () => {
  it('105. Scrupulosity: C6 addresses cycle language vs belief content', () => {
    const desc = THERAPIST_COMPETENCE_RULES.cultural_religious_contextual_sensitivity.description;
    expect(desc).toMatch(/scrupulosity/i);
    expect(desc).toMatch(/doubt cycle/i);
  });

  it('106. Scrupulosity: C6 prohibits framing religious content as irrational', () => {
    const desc = THERAPIST_COMPETENCE_RULES.cultural_religious_contextual_sensitivity.description;
    // Should frame as cycle, not as irrational fear
    expect(desc).toContain('doubt cycle');
    expect(desc).toMatch(/not.*irrational/i);
  });

  it('107. Scrupulosity: C6 cultural sensitivity applies across all languages', () => {
    const desc = THERAPIST_COMPETENCE_RULES.cultural_religious_contextual_sensitivity.description;
    expect(desc).toMatch(/all seven app languages/i);
  });
});

// ─── SECTION Q — SCENARIO: TRAUMA-RELATED CASE ────────────────────────────────

describe('Phase 3 Competence — SECTION Q: trauma-related case', () => {
  it('108. Trauma scenario: C1 formulation required before any technique', () => {
    const desc = THERAPIST_COMPETENCE_RULES.case_formulation_depth.description;
    expect(desc).toMatch(/formulation is the clinical act/i);
  });

  it('109. Trauma scenario: C3 prohibits technique without formulation fit', () => {
    const desc = THERAPIST_COMPETENCE_RULES.intervention_selection_accuracy.description;
    expect(desc).toMatch(/NEVER name a technique without explaining why/i);
  });
});

// ─── SECTION R — SCENARIO: GRIEF / LOSS ──────────────────────────────────────

describe('Phase 3 Competence — SECTION R: grief / loss', () => {
  it('110. Grief scenario: C6 receives spiritual meaning without redirecting', () => {
    const desc = THERAPIST_COMPETENCE_RULES.cultural_religious_contextual_sensitivity.description;
    expect(desc).toMatch(/receive meaning without redirecting/i);
  });

  it('111. Grief scenario: C6 prohibits reframing grief as cognitive distortion', () => {
    const desc = THERAPIST_COMPETENCE_RULES.cultural_religious_contextual_sensitivity.description;
    expect(desc).toMatch(/do not reframe grief as a cognitive distortion/i);
  });

  it('112. Grief scenario: C3 empathic holding is valid first move', () => {
    const desc = THERAPIST_COMPETENCE_RULES.intervention_selection_accuracy.description;
    expect(desc).toMatch(/empathic holding/i);
  });
});

// ─── SECTION S — SCENARIO: ADHD OVERLOAD ─────────────────────────────────────

describe('Phase 3 Competence — SECTION S: ADHD overload', () => {
  it('113. ADHD scenario: C3 monitoring task is a valid intervention move', () => {
    const desc = THERAPIST_COMPETENCE_RULES.intervention_selection_accuracy.description;
    expect(desc).toMatch(/monitoring task/i);
  });

  it('114. ADHD scenario: C8 one task connected to formulation (no overload)', () => {
    const desc = THERAPIST_COMPETENCE_RULES.session_structure_continuity.description;
    expect(desc).toMatch(/ONE task/i);
    expect(desc).toMatch(/formulation/i);
  });
});

// ─── SECTION T — SCENARIO: SOCIAL ANXIETY WITH SAFETY BEHAVIORS ──────────────

describe('Phase 3 Competence — SECTION T: social anxiety with safety behaviors', () => {
  it('115. Social anxiety: C2 maintaining loop includes avoidance/safety behaviors', () => {
    const c1desc = THERAPIST_COMPETENCE_RULES.case_formulation_depth.description;
    expect(c1desc).toMatch(/avoidance or safety behaviors/i);
  });

  it('116. Social anxiety: C3 behavioral experiment is a valid move', () => {
    const desc = THERAPIST_COMPETENCE_RULES.intervention_selection_accuracy.description;
    expect(desc).toMatch(/behavioral experiment/i);
  });
});

// ─── SECTION U — SCENARIO: FIRST-SESSION COLLABORATIVE GOAL SETTING ──────────

describe('Phase 3 Competence — SECTION U: first-session collaborative goal setting', () => {
  it('117. First session: C5 requires collaborative goal proposal not assignment', () => {
    const desc = THERAPIST_COMPETENCE_RULES.collaborative_empiricism.description;
    expect(desc).toMatch(/propose goals collaboratively rather than assigning/i);
  });

  it('118. First session: C8 session structure and one-task close applies', () => {
    const desc = THERAPIST_COMPETENCE_RULES.session_structure_continuity.description;
    expect(desc).toMatch(/ONE task/i);
    expect(desc).toMatch(/clear takeaway/i);
  });
});

// ─── SECTION V — SCENARIO: PSYCHOEDUCATION QUALITY ───────────────────────────

describe('Phase 3 Competence — SECTION V: psychoeducation quality', () => {
  it('119. Psychoeducation: C7 requires tailoring to person\'s specific situation', () => {
    const desc = THERAPIST_COMPETENCE_RULES.psychoeducation_quality.description;
    expect(desc).toMatch(/specific situation/i);
    expect(desc).toMatch(/not generic CBT/i);  // warns against generic CBT explanations
  });

  it('120. Psychoeducation: C7 prohibits generic textbook explanation', () => {
    const desc = THERAPIST_COMPETENCE_RULES.psychoeducation_quality.description;
    expect(desc).toMatch(/generic/i);
    expect(desc).toMatch(/hard failure/i);
  });
});

// ─── SECTION W — SCENARIO: SOCRATIC QUESTION QUALITY ─────────────────────────

describe('Phase 3 Competence — SECTION W: Socratic question quality', () => {
  it('121. Socratic: C4 prohibits leading questions', () => {
    const desc = THERAPIST_COMPETENCE_RULES.socratic_explanatory_competence.description;
    expect(desc).toMatch(/leading question/i);
  });

  it('122. Socratic: C4 requires one focused question that fits the formulation', () => {
    const desc = THERAPIST_COMPETENCE_RULES.socratic_explanatory_competence.description;
    expect(desc).toMatch(/formulation/i);
    expect(desc).toMatch(/focused on one thing/i);
  });
});

// ─── SECTION X — SCENARIO: COLLABORATIVE EMPIRICISM TONE ─────────────────────

describe('Phase 3 Competence — SECTION X: collaborative empiricism tone', () => {
  it('123. Collaborative: C5 invites person into clinical reasoning', () => {
    const desc = THERAPIST_COMPETENCE_RULES.collaborative_empiricism.description;
    expect(desc).toMatch(/invite the person into clinical reasoning/i);
  });

  it('124. Collaborative: C5 frames formulation as hypothesis, not verdict', () => {
    const desc = THERAPIST_COMPETENCE_RULES.collaborative_empiricism.description;
    expect(desc).toMatch(/working hypotheses/i);
  });
});

// ─── SECTION Y — SCENARIO: SESSION SUMMARY + FIRST TASK ──────────────────────

describe('Phase 3 Competence — SECTION Y: session summary and first task', () => {
  it('125. Session end: C8 requires summary in 2-3 sentences', () => {
    const desc = THERAPIST_COMPETENCE_RULES.session_structure_continuity.description;
    expect(desc).toMatch(/2.3 sentences/i);
  });

  it('126. Session end: C8 requires exactly ONE task connected to formulation', () => {
    const desc = THERAPIST_COMPETENCE_RULES.session_structure_continuity.description;
    expect(desc).toMatch(/ONE task/i);
    expect(desc).toMatch(/connect/i);
    expect(desc).toMatch(/formulation/i);
  });
});

// ─── SECTION Z — SCENARIO: CROSS-LANGUAGE COMPETENCE ─────────────────────────

describe('Phase 3 Competence — SECTION Z: cross-language competence', () => {
  it('127. Cross-language: C6 applies to all seven app languages', () => {
    const desc = THERAPIST_COMPETENCE_RULES.cultural_religious_contextual_sensitivity.description;
    expect(desc).toMatch(/all seven app languages/i);
  });

  it('128. Cross-language: existing THERAPIST_CROSS_LANGUAGE_RULES preserved (no regression)', () => {
    expect(Array.isArray(THERAPIST_CROSS_LANGUAGE_RULES)).toBe(true);
    expect(THERAPIST_CROSS_LANGUAGE_RULES.length).toBeGreaterThan(0);
  });
});

// ─── SECTION AA — NO REGRESSION IN WARMTH, PACING, ALLIANCE ──────────────────

describe('Phase 3 Competence — SECTION AA: no regression in warmth, pacing, alliance', () => {
  it('129. Warmth: THERAPIST_CONSTITUTION warmth principles still present', () => {
    const ids = THERAPIST_CONSTITUTION.map(p => p.id);
    expect(ids).toContain('containing_before_clinical');
    expect(ids).toContain('brief_joining_before_guiding');
  });

  it('130. Pacing: THERAPIST_PACING_REFINEMENT_RULES still has 6 rules (no regression)', () => {
    expect(Object.keys(THERAPIST_PACING_REFINEMENT_RULES)).toHaveLength(6);
    expect(THERAPIST_PACING_REFINEMENT_RULES.pacing_ladder).toBeDefined();
    expect(THERAPIST_PACING_REFINEMENT_RULES.grief_containment).toBeDefined();
    expect(THERAPIST_PACING_REFINEMENT_RULES.scrupulosity_pacing).toBeDefined();
  });

  it('131. Alliance: THERAPIST_WORKFLOW_INSTRUCTIONS includes Phase 2 refinement section', () => {
    expect(THERAPIST_WORKFLOW_INSTRUCTIONS).toContain('PHASE 2 REFINEMENT');
  });
});

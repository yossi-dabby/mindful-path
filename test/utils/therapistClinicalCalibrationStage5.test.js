/**
 * @file test/utils/therapistClinicalCalibrationStage5.test.js
 *
 * Stage 5 — Clinical Calibration Regression Tests
 *
 * PURPOSE
 * -------
 * Verifies the four Stage 5 clinical-calibration invariants are present in the
 * THERAPIST_PLANNER_FIRST_INSTRUCTIONS string and have the correct content.
 * All tests are deterministic and synchronous — no LLM calls, network requests,
 * or Base44 SDK calls.
 *
 * INVARIANTS TESTED
 *
 * A. Semantic recalibration after "too hard"
 *    — No mere rephrasing/shortening/softening; change a relevant task dimension;
 *      preserve mechanism contact; no retreat to private preparation.
 *
 * B. Epistemic discipline after an outcome
 *    — Separate facts / hypotheses / unknown; single-trial language calibration;
 *      no invented motives; no equating anxiety with success/failure.
 *
 * C. Current-turn prohibition on actions
 *    — No imperatives/menus/future options when explicitly prohibited; may name
 *      intervention category; restriction is turn-scoped; safety overrides.
 *
 * D. GAD and uncertainty work
 *    — Distinguish practical from hypothetical; allow thoughts during uncertainty
 *      practice (no thought suppression); mixed components formulated separately;
 *      no inferred avoidance; one check does not resolve all.
 *
 * SECTION A — Section presence
 *   1.  THERAPIST_PLANNER_FIRST_INSTRUCTIONS contains Stage 5 section header
 *   2.  THERAPIST_WORKFLOW_VERSION is 3.7.0
 *
 * SECTION B — Invariant A: Semantic recalibration after "too hard"
 *   3.  Section A header is present in instructions
 *   4.  Instructions prohibit merely paraphrasing the original instruction
 *   5.  Instructions prohibit softening the wording of the same message
 *   6.  Instructions require changing a relevant task dimension
 *   7.  Instructions require preserving contact with the same maintaining mechanism
 *   8.  Instructions prohibit retreat to private planning when prohibited
 *   9.  Instructions prohibit retreat to drafting when prohibited
 *  10.  Instructions prohibit inventing duration, history, diagnosis, or risk
 *  11.  Instructions warn against hardcoding any single example as universal
 *
 * SECTION C — Invariant B: Epistemic discipline after an outcome
 *  12.  Section B header is present in instructions
 *  13.  Instructions require separating observed facts from hypotheses
 *  14.  Instructions require flagging what remains unknown
 *  15.  Instructions permit "support" or "consistent with" for a single trial
 *  16.  Instructions prohibit "confirm" for a single trial
 *  17.  Instructions prohibit "prove" for a single trial
 *  18.  Instructions prohibit inferring unreported motives
 *  19.  Instructions prohibit inferring another person's thoughts or feelings
 *  20.  Instructions prohibit equating increased anxiety with successful exposure
 *  21.  Instructions prohibit equating increased anxiety with failed treatment
 *  22.  Instructions require calibrated language (e.g. "may suggest")
 *
 * SECTION D — Invariant C: Current-turn prohibition on actions
 *  23.  Section C header is present in instructions
 *  24.  Instructions prohibit imperatives when user message says no action
 *  25.  Instructions prohibit exact actions when user message says no action
 *  26.  Instructions prohibit menus when user message says no action
 *  27.  Instructions prohibit "next time we can…" language
 *  28.  Instructions prohibit hiding an action inside an explanation
 *  29.  Instructions allow naming an intervention category
 *  30.  Instructions apply restriction to current turn only
 *  31.  Instructions state safety retains precedence over this restriction
 *
 * SECTION E — Invariant D: GAD and uncertainty work
 *  32.  Section D header is present in instructions
 *  33.  Instructions require distinguishing practical from hypothetical worry
 *  34.  Instructions require uncertainty practice to allow thoughts to be present
 *  35.  Instructions prohibit requiring a blank mind during uncertainty practice
 *  36.  Instructions prohibit prohibiting thoughts from arising
 *  37.  Instructions flag thought suppression risk in "do not add another thought"
 *  38.  Instructions reference structured problem-solving for practical concerns
 *  39.  Instructions prohibit assuming avoidance without evidence
 *  40.  Instructions prohibit claiming one check resolves the entire concern
 *  41.  Instructions require formulating mixed components separately
 *
 * SECTION F — Preserved gains (negative regressions)
 *  42.  Instructions preserve one direct atomic action when user requests one
 *  43.  Instructions preserve reassurance refusal in doubt/checking loops
 *  44.  Instructions preserve distinguishing facts from interpretations
 *  45.  Instructions still contain WAVE 5 header (no prior layer removed)
 *  46.  Instructions still contain PLANNER CONSTITUTION section
 *  47.  Instructions still contain INTERVENTION READINESS GATES section
 *  48.  Instructions still contain STAGE 9 RESPONSE QUALITY STABILIZERS section
 *
 * SECTION G — Hebrew-language parity
 *  49.  THERAPIST_PLANNER_FIRST_INSTRUCTIONS is a string (applies to all languages)
 *  50.  THERAPIST_WORKFLOW_INSTRUCTIONS still references cross-language consistency
 *
 * SECTION H — Builder function parity
 *  51.  buildPlannerFirstInstructions() returns the same string as the constant
 *  52.  The constant is non-empty
 */

import { describe, it, expect } from 'vitest';
import {
  THERAPIST_PLANNER_FIRST_INSTRUCTIONS,
  THERAPIST_WORKFLOW_VERSION,
  THERAPIST_WORKFLOW_INSTRUCTIONS,
  buildPlannerFirstInstructions,
} from '../../src/lib/therapistWorkflowEngine.js';

const INST = THERAPIST_PLANNER_FIRST_INSTRUCTIONS;

// ─── SECTION A — Section presence ────────────────────────────────────────────

describe('Stage 5 Clinical Calibration — section presence', () => {
  it('1. THERAPIST_PLANNER_FIRST_INSTRUCTIONS contains Stage 5 section header', () => {
    expect(INST).toContain('STAGE 5 CLINICAL CALIBRATION');
  });

  it('2. THERAPIST_WORKFLOW_VERSION is 3.7.0', () => {
    expect(THERAPIST_WORKFLOW_VERSION).toBe('3.7.0');
  });
});

// ─── SECTION B — Invariant A: Semantic recalibration after "too hard" ─────────

describe('Stage 5 — Invariant A: Semantic recalibration after "too hard"', () => {
  it('3. Section A header is present in instructions', () => {
    expect(INST).toMatch(/SEMANTIC RECALIBRATION AFTER/i);
  });

  it('4. Instructions prohibit merely paraphrasing the original instruction', () => {
    expect(INST).toMatch(/paraphrase the original instruction/i);
  });

  it('5. Instructions prohibit softening the wording of the same message', () => {
    expect(INST).toMatch(/soften the wording/i);
  });

  it('6. Instructions require changing a relevant task dimension', () => {
    expect(INST).toMatch(/Change a relevant task dimension/i);
  });

  it('7. Instructions require preserving contact with the same maintaining mechanism', () => {
    expect(INST).toMatch(/same\s+maintaining mechanism/i);
  });

  it('8. Instructions prohibit retreat to private planning when prohibited', () => {
    expect(INST).toMatch(/private planning/i);
  });

  it('9. Instructions prohibit retreat to drafting when prohibited', () => {
    expect(INST).toMatch(/drafting/i);
  });

  it('10. Instructions prohibit inventing duration, history, diagnosis, or risk', () => {
    expect(INST).toMatch(/invent/i);
    expect(INST).toMatch(/duration.*history/is);
  });

  it('11. Instructions warn against hardcoding any single example as universal', () => {
    expect(INST).toMatch(/hardcode any single example as the universal answer/i);
  });
});

// ─── SECTION C — Invariant B: Epistemic discipline after an outcome ───────────

describe('Stage 5 — Invariant B: Epistemic discipline after an outcome', () => {
  it('12. Section B header is present in instructions', () => {
    expect(INST).toMatch(/EPISTEMIC DISCIPLINE AFTER AN OUTCOME/i);
  });

  it('13. Instructions require separating observed facts from hypotheses', () => {
    expect(INST).toMatch(/observed facts/i);
  });

  it('14. Instructions require flagging what remains unknown', () => {
    expect(INST).toMatch(/what remains unknown/i);
  });

  it('15. Instructions permit "support" or "consistent with" for a single trial', () => {
    expect(INST).toMatch(/single trial may/i);
    expect(INST).toMatch(/be consistent with/i);
  });

  it('16. Instructions prohibit "confirm" for a single trial (must NOT confirm)', () => {
    expect(INST).toMatch(/must NOT/i);
    expect(INST).toMatch(/must not.*confirm/i);
  });

  it('17. Instructions prohibit "prove" for a single trial (must NOT prove)', () => {
    expect(INST).toMatch(/must NOT/i);
    expect(INST).toMatch(/must not.*prove/i);
  });

  it('18. Instructions prohibit inferring unreported motives', () => {
    expect(INST).toMatch(/unreported motives/i);
  });

  it("19. Instructions prohibit inferring another person's thoughts or feelings", () => {
    expect(INST).toMatch(/another person's thoughts/i);
  });

  it('20. Instructions prohibit equating increased anxiety with successful exposure', () => {
    expect(INST).toMatch(/successful exposure/i);
  });

  it('21. Instructions prohibit equating increased anxiety with failed treatment', () => {
    expect(INST).toMatch(/failed treatment/i);
  });

  it('22. Instructions require calibrated language (e.g. "may suggest")', () => {
    expect(INST).toMatch(/may suggest/i);
  });
});

// ─── SECTION D — Invariant C: Current-turn prohibition on actions ─────────────

describe('Stage 5 — Invariant C: Current-turn prohibition on actions', () => {
  it('23. Section C header is present in instructions', () => {
    expect(INST).toMatch(/CURRENT-TURN PROHIBITION ON ACTIONS/i);
  });

  it('24. Instructions prohibit imperatives when user message says no action', () => {
    expect(INST).toMatch(/Do NOT include imperatives/i);
  });

  it('25. Instructions prohibit exact actions when user message says no action', () => {
    expect(INST).toMatch(/exact actions/i);
  });

  it('26. Instructions prohibit menus when user message says no action', () => {
    expect(INST).toMatch(/menus/i);
  });

  it('27. Instructions prohibit "next time we can…" language', () => {
    expect(INST).toMatch(/next time we can/i);
  });

  it('28. Instructions prohibit hiding an action inside an explanation', () => {
    expect(INST).toMatch(/hide an action inside an explanation/i);
  });

  it('29. Instructions allow naming an intervention category', () => {
    expect(INST).toMatch(/name an intervention CATEGORY/i);
  });

  it('30. Instructions apply restriction to current turn only', () => {
    expect(INST).toMatch(/CURRENT TURN ONLY/i);
  });

  it('31. Instructions state safety retains precedence over this restriction', () => {
    expect(INST).toMatch(/Safety and crisis requirements retain absolute precedence/i);
  });
});

// ─── SECTION E — Invariant D: GAD and uncertainty work ───────────────────────

describe('Stage 5 — Invariant D: GAD and uncertainty work', () => {
  it('32. Section D header is present in instructions', () => {
    expect(INST).toMatch(/GAD AND UNCERTAINTY WORK/i);
  });

  it('33. Instructions require distinguishing practical from hypothetical worry', () => {
    expect(INST).toMatch(/actionable practical problem from a hypothetical/i);
  });

  it('34. Instructions require uncertainty practice to allow thoughts to be present', () => {
    expect(INST).toMatch(/allow thoughts and discomfort\s+to be present/i);
  });

  it('35. Instructions prohibit requiring a blank mind during uncertainty practice', () => {
    expect(INST).toMatch(/Never require a blank mind/i);
  });

  it('36. Instructions prohibit prohibiting thoughts from arising', () => {
    expect(INST).toMatch(/prohibit thoughts from arising/i);
  });

  it('37. Instructions flag thought suppression risk in "do not add another thought"', () => {
    expect(INST).toMatch(/thought suppression/i);
  });

  it('38. Instructions reference structured problem-solving for practical concerns', () => {
    expect(INST).toMatch(/structured problem-solving/i);
  });

  it('39. Instructions prohibit assuming avoidance without evidence', () => {
    expect(INST).toMatch(/Do NOT assume avoidance/i);
  });

  it('40. Instructions prohibit claiming one check resolves the entire concern', () => {
    expect(INST).toMatch(/one information check/i);
    expect(INST).toMatch(/resolves every practical/i);
  });

  it('41. Instructions require formulating mixed components separately', () => {
    expect(INST).toMatch(/formulate them\s+separately/i);
  });
});

// ─── SECTION F — Preserved gains (negative regressions) ──────────────────────

describe('Stage 5 — Preserved gains (negative regressions)', () => {
  it('42. Instructions preserve one direct atomic action when user requests one', () => {
    expect(INST).toMatch(/One direct atomic action when the user explicitly requests one/i);
  });

  it('43. Instructions preserve reassurance refusal in doubt/checking loops', () => {
    expect(INST).toMatch(/Refusal of reassurance in doubt\/checking loops/i);
  });

  it('44. Instructions preserve distinguishing facts from interpretations', () => {
    expect(INST).toMatch(/Distinguishing facts from interpretations/i);
  });

  it('45. Instructions still contain WAVE 5 header (no prior layer removed)', () => {
    expect(INST).toContain('WAVE 5 — FORMULATION-FIRST PLANNER POLICY');
  });

  it('46. Instructions still contain PLANNER CONSTITUTION section', () => {
    expect(INST).toContain('PLANNER CONSTITUTION');
  });

  it('47. Instructions still contain INTERVENTION READINESS GATES section', () => {
    expect(INST).toContain('INTERVENTION READINESS GATES');
  });

  it('48. Instructions still contain STAGE 9 RESPONSE QUALITY STABILIZERS section', () => {
    expect(INST).toContain('STAGE 9 RESPONSE QUALITY STABILIZERS');
  });
});

// ─── SECTION G — Hebrew-language parity ──────────────────────────────────────

describe('Stage 5 — Hebrew-language parity', () => {
  it('49. THERAPIST_PLANNER_FIRST_INSTRUCTIONS is a string (language-agnostic rule set)', () => {
    expect(typeof INST).toBe('string');
    expect(INST.length).toBeGreaterThan(0);
  });

  it('50. THERAPIST_WORKFLOW_INSTRUCTIONS still references cross-language consistency', () => {
    expect(THERAPIST_WORKFLOW_INSTRUCTIONS).toMatch(/cross-language/i);
  });
});

// ─── SECTION H — Builder function parity ─────────────────────────────────────

describe('Stage 5 — Builder function parity', () => {
  it('51. buildPlannerFirstInstructions() returns the same string as the constant', () => {
    expect(buildPlannerFirstInstructions()).toBe(INST);
  });

  it('52. The constant is non-empty', () => {
    expect(INST.length).toBeGreaterThan(100);
  });
});

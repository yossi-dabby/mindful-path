/**
 * @file test/utils/therapistFormulationPhase10.test.js
 *
 * Phase 10 — Formulation-Led CBT (anti-worksheet-bot)
 *
 * PURPOSE
 * -------
 * 1. Verify that THERAPIST_FORMULATION_RESPONSE_RULES is exported from
 *    therapistWorkflowEngine.js with all 7 required rules.
 * 2. Verify that THERAPIST_FORMULATION_INSTRUCTIONS is exported and is a
 *    non-empty string containing the required section headers.
 * 3. Verify that buildFormulationLedInstructions() returns a string
 *    containing all 7 rule headings.
 * 4. Verify that buildV6SessionStartContentAsync is exported from
 *    workflowContextInjector.js.
 * 5. Verify that buildV6SessionStartContentAsync returns content that
 *    includes '[START_SESSION]' (from base path) AND the formulation
 *    instructions (Phase 10 addition).
 * 6. Verify that the formulation instructions include all 7 anti-worksheet
 *    rule sections.
 * 7. Verify that buildV6SessionStartContentAsync works for HYBRID wiring
 *    (all flags off — default path) — Phase 10 is unconditional.
 * 8. Verify that THERAPIST_UPGRADE_FLAGS contains the new
 *    THERAPIST_UPGRADE_FORMULATION_LED_ENABLED flag.
 * 9. Verify that the existing buildSessionStartContent behavior is
 *    unchanged (additive only — existing tests remain valid).
 * 10. Verify that the THERAPIST_WORKFLOW_INSTRUCTIONS baseline is unchanged
 *     (Phase 10 is purely additive).
 *
 * CONSTRAINTS
 * -----------
 * - Does NOT import from base44/functions/ (Deno code — not importable in Vitest).
 * - Does NOT enable any feature flags — all flags remain false throughout.
 * - Does NOT modify any Phase 0–9 test files.
 * - All Phase 0–9 assertions remain intact (additive only).
 *
 * Source of truth: problem statement — Phase 10 formulation-led CBT
 */

import { describe, it, expect } from 'vitest';

import {
  THERAPIST_FORMULATION_RESPONSE_RULES,
  THERAPIST_FORMULATION_INSTRUCTIONS,
  buildFormulationLedInstructions,
  THERAPIST_WORKFLOW_INSTRUCTIONS,
} from '../../src/lib/therapistWorkflowEngine.js';

import {
  buildV6SessionStartContentAsync,
  buildSessionStartContent,
} from '../../src/lib/workflowContextInjector.js';

import {
  CBT_THERAPIST_WIRING_HYBRID,
  CBT_THERAPIST_WIRING_STAGE2_V2,
} from '../../src/api/agentWiring.js';

import {
  THERAPIST_UPGRADE_FLAGS,
} from '../../src/lib/featureFlags.js';

// ─── Section 1 — THERAPIST_FORMULATION_RESPONSE_RULES exports ────────────────

describe('Phase 10 — THERAPIST_FORMULATION_RESPONSE_RULES exports', () => {
  it('THERAPIST_FORMULATION_RESPONSE_RULES is exported as an object', () => {
    expect(typeof THERAPIST_FORMULATION_RESPONSE_RULES).toBe('object');
    expect(THERAPIST_FORMULATION_RESPONSE_RULES).not.toBeNull();
  });

  it('THERAPIST_FORMULATION_RESPONSE_RULES is frozen', () => {
    expect(Object.isFrozen(THERAPIST_FORMULATION_RESPONSE_RULES)).toBe(true);
  });

  it('contains rule: no_mood_menu_opening', () => {
    expect(typeof THERAPIST_FORMULATION_RESPONSE_RULES.no_mood_menu_opening).toBe('string');
    expect(THERAPIST_FORMULATION_RESPONSE_RULES.no_mood_menu_opening.length).toBeGreaterThan(10);
  });

  it('contains rule: answer_user_request_first', () => {
    expect(typeof THERAPIST_FORMULATION_RESPONSE_RULES.answer_user_request_first).toBe('string');
    expect(THERAPIST_FORMULATION_RESPONSE_RULES.answer_user_request_first.length).toBeGreaterThan(10);
  });

  it('contains rule: no_premature_worksheet', () => {
    expect(typeof THERAPIST_FORMULATION_RESPONSE_RULES.no_premature_worksheet).toBe('string');
    expect(THERAPIST_FORMULATION_RESPONSE_RULES.no_premature_worksheet.length).toBeGreaterThan(10);
  });

  it('contains rule: formulate_before_asking', () => {
    expect(typeof THERAPIST_FORMULATION_RESPONSE_RULES.formulate_before_asking).toBe('string');
    expect(THERAPIST_FORMULATION_RESPONSE_RULES.formulate_before_asking.length).toBeGreaterThan(10);
  });

  it('contains rule: no_robotic_language', () => {
    expect(typeof THERAPIST_FORMULATION_RESPONSE_RULES.no_robotic_language).toBe('string');
    expect(THERAPIST_FORMULATION_RESPONSE_RULES.no_robotic_language.length).toBeGreaterThan(10);
  });

  it('contains rule: no_premature_journal_save', () => {
    expect(typeof THERAPIST_FORMULATION_RESPONSE_RULES.no_premature_journal_save).toBe('string');
    expect(THERAPIST_FORMULATION_RESPONSE_RULES.no_premature_journal_save.length).toBeGreaterThan(10);
  });

  it('contains rule: clinical_attunement_first', () => {
    expect(typeof THERAPIST_FORMULATION_RESPONSE_RULES.clinical_attunement_first).toBe('string');
    expect(THERAPIST_FORMULATION_RESPONSE_RULES.clinical_attunement_first.length).toBeGreaterThan(10);
  });

  it('has exactly 7 rules', () => {
    const keys = Object.keys(THERAPIST_FORMULATION_RESPONSE_RULES);
    expect(keys).toHaveLength(7);
  });
});

// ─── Section 2 — buildFormulationLedInstructions() ───────────────────────────

describe('Phase 10 — buildFormulationLedInstructions()', () => {
  it('is exported as a function', () => {
    expect(typeof buildFormulationLedInstructions).toBe('function');
  });

  it('returns a non-empty string', () => {
    const result = buildFormulationLedInstructions();
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(100);
  });

  it('contains the Phase 10 section header', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain('FORMULATION-LED CLINICAL RULES — PHASE 10');
  });

  it('contains the end header', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain('END FORMULATION-LED CLINICAL RULES');
  });

  it('contains RULE 1 — NO MOOD MENU OPENING heading', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain('RULE 1');
    expect(result).toContain('NO MOOD MENU OPENING');
  });

  it('contains RULE 2 — ANSWER THE USER\'S DIRECT REQUEST FIRST heading', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain('RULE 2');
    expect(result).toContain('DIRECT REQUEST');
  });

  it('contains RULE 3 — NO PREMATURE WORKSHEET STEPS heading', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain('RULE 3');
    expect(result).toContain('PREMATURE WORKSHEET');
  });

  it('contains RULE 4 — FORMULATE BEFORE ASKING heading', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain('RULE 4');
    expect(result).toContain('FORMULATE BEFORE ASKING');
  });

  it('contains RULE 5 — NO ROBOTIC META-LANGUAGE heading', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain('RULE 5');
    expect(result).toContain('ROBOTIC');
  });

  it('contains RULE 6 — NO PREMATURE JOURNAL heading', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain('RULE 6');
    expect(result).toContain('JOURNAL');
  });

  it('contains RULE 7 — CLINICAL ATTUNEMENT FIRST heading', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain('RULE 7');
    expect(result).toContain('CLINICAL ATTUNEMENT');
  });

  it('mentions "I\'m here to guide you through CBT" as a forbidden phrase', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain("I'm here to guide you through CBT");
  });

  it('mentions anxiety scale / worksheet as prohibited early steps', () => {
    const result = buildFormulationLedInstructions();
    expect(result).toContain('worksheet');
  });
});

// ─── Section 3 — THERAPIST_FORMULATION_INSTRUCTIONS constant ─────────────────

describe('Phase 10 — THERAPIST_FORMULATION_INSTRUCTIONS constant', () => {
  it('is exported as a string', () => {
    expect(typeof THERAPIST_FORMULATION_INSTRUCTIONS).toBe('string');
  });

  it('is identical to buildFormulationLedInstructions()', () => {
    expect(THERAPIST_FORMULATION_INSTRUCTIONS).toBe(buildFormulationLedInstructions());
  });

  it('is non-empty', () => {
    expect(THERAPIST_FORMULATION_INSTRUCTIONS.length).toBeGreaterThan(100);
  });
});

// ─── Section 4 — buildV6SessionStartContentAsync export ──────────────────────

describe('Phase 10 — buildV6SessionStartContentAsync export', () => {
  it('is exported as an async function', () => {
    expect(typeof buildV6SessionStartContentAsync).toBe('function');
    // Verify it is async by checking the return value is a Promise
    const result = buildV6SessionStartContentAsync(null, {}, null);
    expect(result).toBeInstanceOf(Promise);
  });
});

// ─── Section 5 — V6 for default HYBRID wiring (flags off) ────────────────────

describe('Phase 10 — buildV6SessionStartContentAsync with HYBRID wiring (flags off)', () => {
  it('returns a string (not null, not undefined)', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(typeof result).toBe('string');
  });

  it('includes [START_SESSION] at the start', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result.startsWith('[START_SESSION]')).toBe(true);
  });

  it('includes the formulation instructions section header', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result).toContain('FORMULATION-LED CLINICAL RULES — PHASE 10');
  });

  it('includes all 7 rule headings', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result).toContain('RULE 1');
    expect(result).toContain('RULE 2');
    expect(result).toContain('RULE 3');
    expect(result).toContain('RULE 4');
    expect(result).toContain('RULE 5');
    expect(result).toContain('RULE 6');
    expect(result).toContain('RULE 7');
  });

  it('is longer than the V1 session-start content (formulation rules added)', async () => {
    const v6Result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    const v1Result = buildSessionStartContent(CBT_THERAPIST_WIRING_HYBRID);
    expect(v6Result.length).toBeGreaterThan(v1Result.length);
  });
});

// ─── Section 6 — V6 with null/undefined wiring (fail-open) ───────────────────

describe('Phase 10 — buildV6SessionStartContentAsync with null/undefined wiring', () => {
  it('handles null wiring without throwing', async () => {
    await expect(buildV6SessionStartContentAsync(null, {}, null)).resolves.toBeDefined();
  });

  it('handles undefined wiring without throwing', async () => {
    await expect(buildV6SessionStartContentAsync(undefined, {}, null)).resolves.toBeDefined();
  });

  it('always includes formulation instructions even with null wiring', async () => {
    const result = await buildV6SessionStartContentAsync(null, {}, null);
    expect(result).toContain('FORMULATION-LED CLINICAL RULES — PHASE 10');
  });

  it('always includes [START_SESSION] even with null wiring', async () => {
    const result = await buildV6SessionStartContentAsync(null, {}, null);
    expect(result).toContain('[START_SESSION]');
  });
});

// ─── Section 7 — V6 formulation rules contain key anti-worksheet content ─────

describe('Phase 10 — V6 content suppresses worksheet-bot behavior', () => {
  it('no_mood_menu_opening rule mentions "mood-selection menu"', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result).toContain('mood-selection menu');
  });

  it('no_premature_worksheet rule mentions "anxiety scale"', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result).toContain('anxiety scale');
  });

  it('no_premature_worksheet rule mentions "evidence for" / "evidence against"', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result).toContain('evidence for');
    expect(result).toContain('evidence against');
  });

  it('answer_user_request_first rule says "highest-priority"', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result).toContain('highest-priority');
  });

  it('no_robotic_language rule mentions the forbidden phrase verbatim', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result).toContain("I'm here to guide you through CBT");
  });

  it('no_premature_journal_save rule mentions "journal"', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result).toContain('journal');
  });

  it('clinical_attunement_first rule mentions "2–3 turns"', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_HYBRID, {}, null);
    expect(result).toContain('2–3 turns');
  });
});

// ─── Section 8 — Baseline preservation (additive only) ───────────────────────

describe('Phase 10 — Phase 3.1 buildSessionStartContent baseline is unchanged', () => {
  it('buildSessionStartContent(HYBRID) still returns exactly "[START_SESSION]"', () => {
    expect(buildSessionStartContent(CBT_THERAPIST_WIRING_HYBRID)).toBe('[START_SESSION]');
  });

  it('buildSessionStartContent(null) still returns exactly "[START_SESSION]"', () => {
    expect(buildSessionStartContent(null)).toBe('[START_SESSION]');
  });

  it('THERAPIST_WORKFLOW_INSTRUCTIONS is unchanged (still contains Phase 3 header)', () => {
    expect(THERAPIST_WORKFLOW_INSTRUCTIONS).toContain('UPGRADED THERAPIST WORKFLOW — STAGE 2 PHASE 3');
  });
});

// ─── Section 9 — THERAPIST_UPGRADE_FLAGS contains Phase 10 flag ──────────────

describe('Phase 10 — THERAPIST_UPGRADE_FLAGS contains FORMULATION_LED flag', () => {
  it('THERAPIST_UPGRADE_FORMULATION_LED_ENABLED is a key in THERAPIST_UPGRADE_FLAGS', () => {
    expect('THERAPIST_UPGRADE_FORMULATION_LED_ENABLED' in THERAPIST_UPGRADE_FLAGS).toBe(true);
  });

  it('THERAPIST_UPGRADE_FORMULATION_LED_ENABLED defaults to false', () => {
    // In test environment, no VITE_ env vars are set
    expect(THERAPIST_UPGRADE_FLAGS.THERAPIST_UPGRADE_FORMULATION_LED_ENABLED).toBe(false);
  });

  it('THERAPIST_UPGRADE_FLAGS is still frozen', () => {
    expect(Object.isFrozen(THERAPIST_UPGRADE_FLAGS)).toBe(true);
  });
});

// ─── Section 10 — V6 does not break with V2 wiring (workflow flags on path) ───

describe('Phase 10 — buildV6SessionStartContentAsync with V2 wiring', () => {
  it('still includes [START_SESSION]', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_STAGE2_V2, {}, null);
    expect(result).toContain('[START_SESSION]');
  });

  it('includes both workflow instructions (V2) and formulation rules (V6)', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_STAGE2_V2, {}, null);
    expect(result).toContain('UPGRADED THERAPIST WORKFLOW — STAGE 2 PHASE 3');
    expect(result).toContain('FORMULATION-LED CLINICAL RULES — PHASE 10');
  });

  it('formulation rules appear after the workflow instructions', async () => {
    const result = await buildV6SessionStartContentAsync(CBT_THERAPIST_WIRING_STAGE2_V2, {}, null);
    const workflowIdx = result.indexOf('UPGRADED THERAPIST WORKFLOW — STAGE 2 PHASE 3');
    const formulationIdx = result.indexOf('FORMULATION-LED CLINICAL RULES — PHASE 10');
    expect(workflowIdx).toBeGreaterThan(-1);
    expect(formulationIdx).toBeGreaterThan(workflowIdx);
  });
});

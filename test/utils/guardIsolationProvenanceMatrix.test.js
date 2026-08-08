/**
 * @file test/utils/guardIsolationProvenanceMatrix.test.js
 *
 * Guard Isolation Audit — Phase 1 Provenance Matrix
 * ==================================================
 *
 * Automated evidence matrix for the two non-safety guards under audit:
 *   - applyFormulationGuardToConversationMessages  (via applyFormulationGuardWithMode)
 *   - applyCurrentTurnGroundingGuardToConversationMessages (via applyGroundingGuardWithMode)
 *
 * Run matrix:
 *   EN/HE : A, B, C, D, E, F, G  (full matrix)
 *   FR/ES : A, D, F, G            (key-path subset)
 *
 * Scenario key (guard layer):
 *   A — Happy path: guard passes (GUARD_DECISION.PASS), candidate delivered as-is.
 *   B — Guard fires in ENFORCE mode: replacement applied, safe_update_accepted=true (simulated).
 *   C — Guard fires in SHADOW mode: replacement NOT applied, provenance records REPLACED.
 *   D — Guard OFF mode: guard skipped, GUARD_DECISION.SKIPPED.
 *   E — Idempotency: already-replaced message bypasses re-evaluation.
 *   F — Non-guarded turn: guard not applicable (formulation: no FD block; grounding: no violation).
 *   G — Multi-turn: guard fires only on the violating assistant turn; earlier turns are unaffected.
 *
 * Incident signature connected:
 *   response_correlated=true → named guard decision → safeUpdateMessages result
 *   → visible commit result.
 *
 * No transcript text, clinical content or PII is present in any fixture or assertion.
 * No test.skip / test.fixme used anywhere in this file.
 */

import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  applyFormulationGuardWithMode,
  applyGroundingGuardWithMode,
  buildGuardProvenanceRecord,
  augmentProvenanceWithLifecycle,
  GUARD_DECISION,
  GUARD_NAME,
} from '../../src/lib/guardIsolationAudit.js';

// ─── Locale constants ─────────────────────────────────────────────────────────

const LOCALES = { EN: 'en', HE: 'he', FR: 'fr', ES: 'es' };

// ─── Fixtures — formulation guard ────────────────────────────────────────────

/**
 * User content that triggers the formulation guard.
 * Contains the FORMULATION DEEPENING block that activates guard evaluation.
 */
const FD_BLOCK_USER_CONTENT =
  'How am I doing?\n' +
  '=== FORMULATION DEEPENING \u2014 THIS TURN ONLY ===\n' +
  'Some instructions here.\n' +
  '=== END FORMULATION DEEPENING ===';

/**
 * Assistant content that FAILS the formulation contract:
 * introduces a deeper hypothesis ("deep identity meaning") with no tentative
 * marker and no verification question.
 */
const FORMULATION_FAILING_ASSISTANT_CONTENT =
  'This deep identity meaning explains the anxiety you feel.';

/**
 * Assistant content that PASSES the formulation contract:
 * contains a tentative marker ("might") and exactly one question mark.
 */
const FORMULATION_PASSING_ASSISTANT_CONTENT =
  'I wonder if this might be connected to a deeper pattern. What would that mean for you?';

// ─── Fixtures — grounding guard ──────────────────────────────────────────────

/**
 * User content that does NOT affirm a causal connection, so that the
 * grounding guard will fire when the assistant makes a causal claim.
 */
const GROUNDING_NEUTRAL_USER_CONTENT = 'I feel tense lately.';

/**
 * Assistant content that FAILS the grounding contract: contains a causal
 * claim ("this is because") without the user having affirmed causation.
 */
const GROUNDING_FAILING_ASSISTANT_CONTENT =
  'This is because of your ongoing work stress. Therefore, we should address work issues.';

/**
 * Assistant content that PASSES the grounding contract: no causal assertion.
 */
const GROUNDING_PASSING_ASSISTANT_CONTENT =
  'I hear that you feel tense. What has been on your mind recently?';

// ─── Message factories ────────────────────────────────────────────────────────

function makeUserMsg(id, content = 'Some user message') {
  return { role: 'user', id, content, created_at: '2026-08-08T00:00:00.000Z' };
}

function makeAssistantMsg(id, content) {
  return { role: 'assistant', id, content, created_at: '2026-08-08T00:01:00.000Z' };
}

/**
 * Builds a minimal raw + final message pair for the formulation guard
 * with the given user content (FD-trigger or neutral).
 */
function buildFormulationPair(userContent, assistantContent, locale) {
  const raw = [
    makeUserMsg('u-form', userContent),
    makeAssistantMsg('a-form', assistantContent),
  ];
  const final = [
    { ...raw[0], __rawIndex: 0 },
    { ...raw[1], __rawIndex: 1 },
  ];
  return { raw, final, locale };
}

/**
 * Builds a minimal raw + final message pair for the grounding guard.
 */
function buildGroundingPair(userContent, assistantContent, locale) {
  const raw = [
    makeUserMsg('u-grnd', userContent),
    makeAssistantMsg('a-grnd', assistantContent),
  ];
  const final = [
    { ...raw[0], __rawIndex: 0 },
    { ...raw[1], __rawIndex: 1 },
  ];
  return { raw, final, locale };
}

// ─── Scenario A: Happy path — guard passes ───────────────────────────────────

describe('Scenario A — Guard passes: candidate delivered as-is (EN/HE/FR/ES)', () => {
  for (const locale of [LOCALES.EN, LOCALES.HE, LOCALES.FR, LOCALES.ES]) {
    describe(`[${locale.toUpperCase()}] formulation guard ENFORCE`, () => {
      it('passes non-guarded user content — GUARD_DECISION.PASS', () => {
        // Non-FD user content → guard is not applicable (returns PASS)
        const { raw, final } = buildFormulationPair(
          'How are you?',
          FORMULATION_PASSING_ASSISTANT_CONTENT,
          locale
        );
        const result = applyFormulationGuardWithMode(raw, final, { locale, mode: 'ENFORCE' });
        expect(result.provenance.guard_decision, `[${locale}] A-form: PASS`).toBe(GUARD_DECISION.PASS);
        expect(result.provenance.replacement_created, `[${locale}] A-form: no replacement`).toBe(false);
        expect(result.messages[1]?.content, `[${locale}] A-form: content unchanged`).toBe(FORMULATION_PASSING_ASSISTANT_CONTENT);
      });
    });

    describe(`[${locale.toUpperCase()}] grounding guard ENFORCE`, () => {
      it('passes safe assistant content — GUARD_DECISION.PASS', () => {
        const { raw, final } = buildGroundingPair(
          GROUNDING_NEUTRAL_USER_CONTENT,
          GROUNDING_PASSING_ASSISTANT_CONTENT,
          locale
        );
        const result = applyGroundingGuardWithMode(raw, final, { locale, mode: 'ENFORCE' });
        expect(result.provenance.guard_decision, `[${locale}] A-grnd: PASS`).toBe(GUARD_DECISION.PASS);
        expect(result.provenance.replacement_created, `[${locale}] A-grnd: no replacement`).toBe(false);
        expect(result.messages[1]?.content, `[${locale}] A-grnd: content unchanged`).toBe(GROUNDING_PASSING_ASSISTANT_CONTENT);
      });
    });
  }
});

// ─── Scenario B: Guard fires in ENFORCE mode ─────────────────────────────────

describe('Scenario B — Guard fires ENFORCE: replacement applied (EN/HE)', () => {
  for (const locale of [LOCALES.EN, LOCALES.HE]) {
    describe(`[${locale.toUpperCase()}] formulation guard ENFORCE`, () => {
      it('fires on violating assistant response — GUARD_DECISION.REPLACED, replacement applied', () => {
        const { raw, final } = buildFormulationPair(
          FD_BLOCK_USER_CONTENT,
          FORMULATION_FAILING_ASSISTANT_CONTENT,
          locale
        );
        const result = applyFormulationGuardWithMode(raw, final, {
          locale,
          mode: 'ENFORCE',
          clientRequestId: 'crid-b-form',
          deliverySource: 'polling',
          responseCorrelated: true,
        });
        expect(result.provenance.guard_name, `[${locale}] B-form: guard name`).toBe(GUARD_NAME.FORMULATION);
        expect(result.provenance.guard_mode, `[${locale}] B-form: ENFORCE`).toBe('ENFORCE');
        expect(result.provenance.guard_decision, `[${locale}] B-form: REPLACED`).toBe(GUARD_DECISION.REPLACED);
        expect(result.provenance.replacement_created, `[${locale}] B-form: replacement created`).toBe(true);
        expect(result.provenance.replacement_terminal, `[${locale}] B-form: replacement terminal`).toBe(true);
        expect(result.provenance.reason_codes.length, `[${locale}] B-form: reason codes present`).toBeGreaterThan(0);
        expect(result.provenance.client_request_id, `[${locale}] B-form: crid`).toBe('crid-b-form');
        expect(result.provenance.delivery_source, `[${locale}] B-form: delivery source`).toBe('polling');
        // Content must be replaced in the output
        expect(result.messages[1]?.content, `[${locale}] B-form: content replaced`).not.toBe(FORMULATION_FAILING_ASSISTANT_CONTENT);
        expect(result.messages[1]?.metadata?.formulation_guard_replaced, `[${locale}] B-form: metadata flag`).toBe(true);
      });
    });

    describe(`[${locale.toUpperCase()}] grounding guard ENFORCE`, () => {
      it('fires on causal claim — GUARD_DECISION.REPLACED, replacement applied', () => {
        const { raw, final } = buildGroundingPair(
          GROUNDING_NEUTRAL_USER_CONTENT,
          GROUNDING_FAILING_ASSISTANT_CONTENT,
          locale
        );
        const result = applyGroundingGuardWithMode(raw, final, {
          locale,
          mode: 'ENFORCE',
          clientRequestId: 'crid-b-grnd',
          deliverySource: 'subscription',
          responseCorrelated: true,
        });
        expect(result.provenance.guard_name, `[${locale}] B-grnd: guard name`).toBe(GUARD_NAME.GROUNDING);
        expect(result.provenance.guard_mode, `[${locale}] B-grnd: ENFORCE`).toBe('ENFORCE');
        expect(result.provenance.guard_decision, `[${locale}] B-grnd: REPLACED`).toBe(GUARD_DECISION.REPLACED);
        expect(result.provenance.replacement_created, `[${locale}] B-grnd: replacement created`).toBe(true);
        expect(result.provenance.reason_codes, `[${locale}] B-grnd: reason codes`).toContain('unsupported_current_turn_grounding_claim');
        // Content must be replaced
        expect(result.messages[1]?.content, `[${locale}] B-grnd: content replaced`).not.toBe(GROUNDING_FAILING_ASSISTANT_CONTENT);
        expect(result.messages[1]?.metadata?.current_turn_grounding_guard_replaced, `[${locale}] B-grnd: metadata flag`).toBe(true);
      });
    });
  }
});

// ─── Scenario C: Guard fires in SHADOW mode — replacement NOT applied ─────────

describe('Scenario C — Guard fires SHADOW: provenance emitted, no replacement (EN/HE)', () => {
  for (const locale of [LOCALES.EN, LOCALES.HE]) {
    describe(`[${locale.toUpperCase()}] formulation guard SHADOW`, () => {
      it('detects violation — GUARD_DECISION.REPLACED, but original message preserved', () => {
        const { raw, final } = buildFormulationPair(
          FD_BLOCK_USER_CONTENT,
          FORMULATION_FAILING_ASSISTANT_CONTENT,
          locale
        );
        const result = applyFormulationGuardWithMode(raw, final, {
          locale,
          mode: 'SHADOW',
          clientRequestId: 'crid-c-form',
          deliverySource: 'polling',
          responseCorrelated: true,
        });
        expect(result.provenance.guard_mode, `[${locale}] C-form: SHADOW`).toBe('SHADOW');
        expect(result.provenance.guard_decision, `[${locale}] C-form: REPLACED (would-have)`).toBe(GUARD_DECISION.REPLACED);
        expect(result.provenance.replacement_created, `[${locale}] C-form: no replacement applied`).toBe(false);
        expect(result.provenance.replacement_terminal, `[${locale}] C-form: not terminal`).toBe(false);
        // SHADOW: original content preserved
        expect(result.messages[1]?.content, `[${locale}] C-form: original content preserved`).toBe(FORMULATION_FAILING_ASSISTANT_CONTENT);
        expect(result.messages[1]?.metadata?.formulation_guard_replaced, `[${locale}] C-form: no metadata flag`).not.toBe(true);
        // pendingCorrection must be null in SHADOW mode
        expect(result.pendingCorrection, `[${locale}] C-form: no pending correction in SHADOW`).toBeNull();
      });
    });

    describe(`[${locale.toUpperCase()}] grounding guard SHADOW`, () => {
      it('detects causal claim — GUARD_DECISION.REPLACED, original message preserved', () => {
        const { raw, final } = buildGroundingPair(
          GROUNDING_NEUTRAL_USER_CONTENT,
          GROUNDING_FAILING_ASSISTANT_CONTENT,
          locale
        );
        const result = applyGroundingGuardWithMode(raw, final, {
          locale,
          mode: 'SHADOW',
          clientRequestId: 'crid-c-grnd',
          deliverySource: 'subscription',
          responseCorrelated: true,
        });
        expect(result.provenance.guard_mode, `[${locale}] C-grnd: SHADOW`).toBe('SHADOW');
        expect(result.provenance.guard_decision, `[${locale}] C-grnd: REPLACED (would-have)`).toBe(GUARD_DECISION.REPLACED);
        expect(result.provenance.replacement_created, `[${locale}] C-grnd: no replacement applied`).toBe(false);
        // Original content preserved
        expect(result.messages[1]?.content, `[${locale}] C-grnd: original content preserved`).toBe(GROUNDING_FAILING_ASSISTANT_CONTENT);
        expect(result.pendingCorrection, `[${locale}] C-grnd: no pending correction in SHADOW`).toBeNull();
      });
    });
  }
});

// ─── Scenario D: Guard OFF — guard skipped (EN/HE/FR/ES) ─────────────────────

describe('Scenario D — Guard OFF: guard skipped, GUARD_DECISION.SKIPPED (EN/HE/FR/ES)', () => {
  for (const locale of [LOCALES.EN, LOCALES.HE, LOCALES.FR, LOCALES.ES]) {
    it(`[${locale.toUpperCase()}] formulation guard OFF — SKIPPED`, () => {
      const { raw, final } = buildFormulationPair(
        FD_BLOCK_USER_CONTENT,
        FORMULATION_FAILING_ASSISTANT_CONTENT,
        locale
      );
      const result = applyFormulationGuardWithMode(raw, final, { locale, mode: 'OFF' });
      expect(result.provenance.guard_mode, `[${locale}] D-form: OFF`).toBe('OFF');
      expect(result.provenance.guard_decision, `[${locale}] D-form: SKIPPED`).toBe(GUARD_DECISION.SKIPPED);
      expect(result.provenance.replacement_created, `[${locale}] D-form: no replacement`).toBe(false);
      // Original content unchanged
      expect(result.messages[1]?.content, `[${locale}] D-form: content unchanged`).toBe(FORMULATION_FAILING_ASSISTANT_CONTENT);
      expect(result.pendingCorrection, `[${locale}] D-form: no pending correction in OFF`).toBeNull();
    });

    it(`[${locale.toUpperCase()}] grounding guard OFF — SKIPPED`, () => {
      const { raw, final } = buildGroundingPair(
        GROUNDING_NEUTRAL_USER_CONTENT,
        GROUNDING_FAILING_ASSISTANT_CONTENT,
        locale
      );
      const result = applyGroundingGuardWithMode(raw, final, { locale, mode: 'OFF' });
      expect(result.provenance.guard_mode, `[${locale}] D-grnd: OFF`).toBe('OFF');
      expect(result.provenance.guard_decision, `[${locale}] D-grnd: SKIPPED`).toBe(GUARD_DECISION.SKIPPED);
      expect(result.provenance.replacement_created, `[${locale}] D-grnd: no replacement`).toBe(false);
      expect(result.messages[1]?.content, `[${locale}] D-grnd: content unchanged`).toBe(GROUNDING_FAILING_ASSISTANT_CONTENT);
    });
  }
});

// ─── Scenario E: Idempotency — already-replaced message not re-evaluated ──────

describe('Scenario E — Idempotency: already-replaced assistant message passes through (EN/HE)', () => {
  for (const locale of [LOCALES.EN, LOCALES.HE]) {
    it(`[${locale.toUpperCase()}] formulation guard: already-replaced message bypasses re-evaluation`, () => {
      const alreadyReplacedContent = 'Safe fallback text that was already applied.';
      const raw = [
        makeUserMsg('u-e', FD_BLOCK_USER_CONTENT),
        makeAssistantMsg('a-e', FORMULATION_FAILING_ASSISTANT_CONTENT),
      ];
      const final = [
        { ...raw[0], __rawIndex: 0 },
        {
          ...raw[1],
          content: alreadyReplacedContent,
          __rawIndex: 1,
          metadata: { formulation_guard_replaced: true, formulation_guard_reason_codes: ['missing_verification_question'] },
        },
      ];
      const result = applyFormulationGuardWithMode(raw, final, { locale, mode: 'ENFORCE' });
      // Already replaced — no further replacement (idempotent)
      expect(result.messages[1]?.content, `[${locale}] E-form: idempotent content`).toBe(alreadyReplacedContent);
      expect(result.messages[1]?.metadata?.formulation_guard_replaced, `[${locale}] E-form: flag preserved`).toBe(true);
    });

    it(`[${locale.toUpperCase()}] grounding guard: already-replaced message bypasses re-evaluation`, () => {
      const alreadyReplacedContent = 'There is not yet enough information. What are you experiencing?';
      const raw = [
        makeUserMsg('u-eg', GROUNDING_NEUTRAL_USER_CONTENT),
        makeAssistantMsg('a-eg', GROUNDING_FAILING_ASSISTANT_CONTENT),
      ];
      const final = [
        { ...raw[0], __rawIndex: 0 },
        {
          ...raw[1],
          content: alreadyReplacedContent,
          __rawIndex: 1,
          metadata: { current_turn_grounding_guard_replaced: true, current_turn_grounding_guard_reason_codes: ['unsupported_current_turn_grounding_claim'] },
        },
      ];
      const result = applyGroundingGuardWithMode(raw, final, { locale, mode: 'ENFORCE' });
      expect(result.messages[1]?.content, `[${locale}] E-grnd: idempotent content`).toBe(alreadyReplacedContent);
    });
  }
});

// ─── Scenario F: Non-guarded turn (EN/HE/FR/ES) ──────────────────────────────

describe('Scenario F — Non-guarded turn: guard not applicable, message delivered as-is (EN/HE/FR/ES)', () => {
  for (const locale of [LOCALES.EN, LOCALES.HE, LOCALES.FR, LOCALES.ES]) {
    it(`[${locale.toUpperCase()}] formulation guard ENFORCE on non-FD user message`, () => {
      // No FD block in user content → formulation guard not applicable
      const { raw, final } = buildFormulationPair(
        'I am feeling anxious.',
        FORMULATION_FAILING_ASSISTANT_CONTENT,
        locale
      );
      const result = applyFormulationGuardWithMode(raw, final, { locale, mode: 'ENFORCE' });
      // Guard should not apply (no FD block) — content unchanged
      expect(result.messages[1]?.content, `[${locale}] F-form: content unchanged`).toBe(FORMULATION_FAILING_ASSISTANT_CONTENT);
      expect(result.messages[1]?.metadata?.formulation_guard_replaced, `[${locale}] F-form: no replacement flag`).not.toBe(true);
    });

    it(`[${locale.toUpperCase()}] grounding guard ENFORCE on safe assistant content`, () => {
      const { raw, final } = buildGroundingPair(
        GROUNDING_NEUTRAL_USER_CONTENT,
        GROUNDING_PASSING_ASSISTANT_CONTENT,
        locale
      );
      const result = applyGroundingGuardWithMode(raw, final, { locale, mode: 'ENFORCE' });
      expect(result.provenance.guard_decision, `[${locale}] F-grnd: PASS`).toBe(GUARD_DECISION.PASS);
      expect(result.messages[1]?.content, `[${locale}] F-grnd: content unchanged`).toBe(GROUNDING_PASSING_ASSISTANT_CONTENT);
    });
  }
});

// ─── Scenario G: Multi-turn (EN/HE/FR/ES) ────────────────────────────────────

describe('Scenario G — Multi-turn: guard fires only on the violating turn (EN/HE/FR/ES)', () => {
  for (const locale of [LOCALES.EN, LOCALES.HE, LOCALES.FR, LOCALES.ES]) {
    it(`[${locale.toUpperCase()}] formulation guard ENFORCE: only violating assistant turn is replaced`, () => {
      const raw = [
        makeUserMsg('u-g1', 'What is your name?'),
        makeAssistantMsg('a-g1', 'I am your therapist assistant.'),
        makeUserMsg('u-g2', FD_BLOCK_USER_CONTENT),
        makeAssistantMsg('a-g2', FORMULATION_FAILING_ASSISTANT_CONTENT),
      ];
      const final = raw.map((msg, i) => ({ ...msg, __rawIndex: i }));
      const result = applyFormulationGuardWithMode(raw, final, { locale, mode: 'ENFORCE' });
      // First turn: no FD block → unchanged
      expect(result.messages[1]?.content, `[${locale}] G-form: turn 1 unchanged`).toBe('I am your therapist assistant.');
      // Second turn: FD block present → guard applies (formulation guard defaults to EN for FR/ES)
      expect(result.messages[3]?.metadata?.formulation_guard_replaced, `[${locale}] G-form: turn 2 replaced`).toBe(true);
    });

    it(`[${locale.toUpperCase()}] grounding guard ENFORCE: only violating assistant turn is replaced`, () => {
      const raw = [
        makeUserMsg('u-g1', 'Hello.'),
        makeAssistantMsg('a-g1', 'Hello! How are you doing today?'),
        makeUserMsg('u-g2', GROUNDING_NEUTRAL_USER_CONTENT),
        makeAssistantMsg('a-g2', GROUNDING_FAILING_ASSISTANT_CONTENT),
      ];
      const final = raw.map((msg, i) => ({ ...msg, __rawIndex: i }));
      const result = applyGroundingGuardWithMode(raw, final, { locale, mode: 'ENFORCE' });
      // First turn unchanged
      expect(result.messages[1]?.content, `[${locale}] G-grnd: turn 1 unchanged`).toBe('Hello! How are you doing today?');
      // Second turn replaced
      expect(result.messages[3]?.metadata?.current_turn_grounding_guard_replaced, `[${locale}] G-grnd: turn 2 replaced`).toBe(true);
    });
  }
});

// ─── Provenance record builder unit tests ────────────────────────────────────

describe('buildGuardProvenanceRecord — bounded PII-free provenance', () => {
  it('returns a frozen record with all required fields', () => {
    const rec = buildGuardProvenanceRecord({
      guardName: GUARD_NAME.FORMULATION,
      guardMode: 'ENFORCE',
      guardDecision: GUARD_DECISION.REPLACED,
      reasonCodes: ['missing_verification_question'],
      replacementCreated: true,
      replacementTerminal: true,
      assistantRawIndex: 2,
      assistantId: 'a-xyz',
      userRawIndex: 1,
      userId: 'u-abc',
      language: 'he',
      clientRequestId: 'crid-unit',
      deliverySource: 'polling',
      responseCorrelated: true,
      safeUpdateAccepted: true,
      visibleCommitCompleted: true,
    });
    expect(Object.isFrozen(rec)).toBe(true);
    expect(rec.guard_name).toBe(GUARD_NAME.FORMULATION);
    expect(rec.guard_mode).toBe('ENFORCE');
    expect(rec.guard_decision).toBe(GUARD_DECISION.REPLACED);
    expect(rec.reason_codes).toEqual(['missing_verification_question']);
    expect(rec.replacement_created).toBe(true);
    expect(rec.replacement_terminal).toBe(true);
    expect(rec.assistant_raw_index).toBe(2);
    expect(rec.assistant_id).toBe('a-xyz');
    expect(rec.user_raw_index).toBe(1);
    expect(rec.user_id).toBe('u-abc');
    expect(rec.language).toBe('he');
    expect(rec.client_request_id).toBe('crid-unit');
    expect(rec.delivery_source).toBe('polling');
    expect(rec.response_correlated).toBe(true);
    expect(rec.safe_update_accepted).toBe(true);
    expect(rec.visible_commit_completed).toBe(true);
  });

  it('clamps reason_codes to 8 entries maximum', () => {
    const rec = buildGuardProvenanceRecord({
      guardName: GUARD_NAME.GROUNDING,
      guardMode: 'SHADOW',
      guardDecision: GUARD_DECISION.REPLACED,
      reasonCodes: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j'],
      replacementCreated: false,
      replacementTerminal: false,
      assistantRawIndex: 0,
      assistantId: null,
      userRawIndex: null,
      userId: null,
      language: 'en',
    });
    expect(rec.reason_codes.length).toBe(8);
  });

  it('coerces null/undefined lifecycle fields to null', () => {
    const rec = buildGuardProvenanceRecord({
      guardName: GUARD_NAME.FORMULATION,
      guardMode: 'OFF',
      guardDecision: GUARD_DECISION.SKIPPED,
      reasonCodes: [],
      replacementCreated: false,
      replacementTerminal: false,
      assistantRawIndex: null,
      assistantId: null,
      userRawIndex: null,
      userId: null,
      language: 'fr',
    });
    expect(rec.response_correlated).toBeNull();
    expect(rec.safe_update_accepted).toBeNull();
    expect(rec.visible_commit_completed).toBeNull();
    expect(rec.client_request_id).toBeNull();
    expect(rec.delivery_source).toBeNull();
  });
});

// ─── augmentProvenanceWithLifecycle unit tests ────────────────────────────────

describe('augmentProvenanceWithLifecycle — lifecycle outcome augmentation', () => {
  it('augments a partial provenance record with lifecycle fields', () => {
    const base = buildGuardProvenanceRecord({
      guardName: GUARD_NAME.GROUNDING,
      guardMode: 'ENFORCE',
      guardDecision: GUARD_DECISION.REPLACED,
      reasonCodes: ['unsupported_current_turn_grounding_claim'],
      replacementCreated: true,
      replacementTerminal: true,
      assistantRawIndex: 1,
      assistantId: 'a-aug',
      userRawIndex: 0,
      userId: 'u-aug',
      language: 'en',
      clientRequestId: 'crid-aug',
      deliverySource: 'polling',
    });
    const augmented = augmentProvenanceWithLifecycle(base, {
      responseCorrelated: true,
      safeUpdateAccepted: false,
      visibleCommitCompleted: false,
    });
    expect(augmented.response_correlated).toBe(true);
    expect(augmented.safe_update_accepted).toBe(false);
    expect(augmented.visible_commit_completed).toBe(false);
    // Other fields preserved
    expect(augmented.guard_decision).toBe(GUARD_DECISION.REPLACED);
    expect(augmented.client_request_id).toBe('crid-aug');
  });

  it('returns the original provenance unchanged if lifecycle is null/undefined', () => {
    const base = buildGuardProvenanceRecord({
      guardName: GUARD_NAME.FORMULATION,
      guardMode: 'ENFORCE',
      guardDecision: GUARD_DECISION.PASS,
      reasonCodes: [],
      replacementCreated: false,
      replacementTerminal: false,
      assistantRawIndex: 0,
      assistantId: null,
      userRawIndex: null,
      userId: null,
      language: 'he',
    });
    const augmented = augmentProvenanceWithLifecycle(base, null);
    expect(augmented.response_correlated).toBeNull();
    expect(augmented.safe_update_accepted).toBeNull();
    expect(augmented.visible_commit_completed).toBeNull();
  });
});

// ─── Feature flag contract — new guard mode flags ─────────────────────────────

describe('Guard mode feature flag contract — getFormulationGuardMode / getGroundingGuardMode', () => {
  it('returns ENFORCE by default (no env vars set)', async () => {
    vi.resetModules();
    const { getFormulationGuardMode, getGroundingGuardMode } = await import('../../src/lib/featureFlags.js');
    expect(getFormulationGuardMode()).toBe('ENFORCE');
    expect(getGroundingGuardMode()).toBe('ENFORCE');
  });

  it('returns SHADOW for formulation guard when VITE_FORMULATION_GUARD_SHADOW=true', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_FORMULATION_GUARD_SHADOW', 'true');
    const { getFormulationGuardMode } = await import('../../src/lib/featureFlags.js');
    expect(getFormulationGuardMode()).toBe('SHADOW');
    vi.unstubAllEnvs();
  });

  it('returns OFF for formulation guard when VITE_FORMULATION_GUARD_OFF=true', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_FORMULATION_GUARD_OFF', 'true');
    const { getFormulationGuardMode } = await import('../../src/lib/featureFlags.js');
    expect(getFormulationGuardMode()).toBe('OFF');
    vi.unstubAllEnvs();
  });

  it('SHADOW wins over OFF for formulation guard when both are set', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_FORMULATION_GUARD_SHADOW', 'true');
    vi.stubEnv('VITE_FORMULATION_GUARD_OFF', 'true');
    const { getFormulationGuardMode } = await import('../../src/lib/featureFlags.js');
    expect(getFormulationGuardMode()).toBe('SHADOW');
    vi.unstubAllEnvs();
  });

  it('returns SHADOW for grounding guard when VITE_GROUNDING_GUARD_SHADOW=true', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_GROUNDING_GUARD_SHADOW', 'true');
    const { getGroundingGuardMode } = await import('../../src/lib/featureFlags.js');
    expect(getGroundingGuardMode()).toBe('SHADOW');
    vi.unstubAllEnvs();
  });

  it('returns OFF for grounding guard when VITE_GROUNDING_GUARD_OFF=true', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_GROUNDING_GUARD_OFF', 'true');
    const { getGroundingGuardMode } = await import('../../src/lib/featureFlags.js');
    expect(getGroundingGuardMode()).toBe('OFF');
    vi.unstubAllEnvs();
  });

  it('SHADOW wins over OFF for grounding guard when both are set', async () => {
    vi.resetModules();
    vi.stubEnv('VITE_GROUNDING_GUARD_SHADOW', 'true');
    vi.stubEnv('VITE_GROUNDING_GUARD_OFF', 'true');
    const { getGroundingGuardMode } = await import('../../src/lib/featureFlags.js');
    expect(getGroundingGuardMode()).toBe('SHADOW');
    vi.unstubAllEnvs();
  });
});

// ─── Incident signature: response_correlated=true connection ─────────────────

describe('Incident signature — connect guard decision to lifecycle provenance chain', () => {
  /**
   * This test group verifies the Phase 1 evidence requirement:
   *   response_correlated=true → named guard decision → safeUpdateMessages result
   *   → visible commit result.
   *
   * The orchestrator layer (response_correlated, safeUpdateMessages, visible_commit)
   * is tested separately in guardIsolationAuditMatrix.test.js.
   * This test verifies the guard decision layer and provenance connection.
   */
  for (const locale of [LOCALES.EN, LOCALES.HE]) {
    it(`[${locale.toUpperCase()}] formulation guard ENFORCE: guard fires → replacement applied → provenance complete`, () => {
      const { raw, final } = buildFormulationPair(
        FD_BLOCK_USER_CONTENT,
        FORMULATION_FAILING_ASSISTANT_CONTENT,
        locale
      );
      const result = applyFormulationGuardWithMode(raw, final, {
        locale,
        mode: 'ENFORCE',
        clientRequestId: 'crid-incident',
        deliverySource: 'polling',
        responseCorrelated: true,
      });
      // Augment with lifecycle outcome (simulating what Chat.jsx does after visible_commit)
      const fullProvenance = augmentProvenanceWithLifecycle(result.provenance, {
        responseCorrelated: true,
        safeUpdateAccepted: true,
        visibleCommitCompleted: true,
      });
      // Evidence chain: response_correlated → REPLACED → safeUpdateAccepted=true → committed
      expect(fullProvenance.response_correlated, `[${locale}] incident: response_correlated`).toBe(true);
      expect(fullProvenance.guard_decision, `[${locale}] incident: guard REPLACED`).toBe(GUARD_DECISION.REPLACED);
      expect(fullProvenance.safe_update_accepted, `[${locale}] incident: safeUpdate accepted`).toBe(true);
      expect(fullProvenance.visible_commit_completed, `[${locale}] incident: commit completed`).toBe(true);
      expect(fullProvenance.guard_name, `[${locale}] incident: named guard`).toBe(GUARD_NAME.FORMULATION);
      expect(fullProvenance.client_request_id, `[${locale}] incident: client_request_id`).toBe('crid-incident');
    });

    it(`[${locale.toUpperCase()}] grounding guard ENFORCE: guard fires → replacement → safe_update_accepted=false (simulated)`, () => {
      const { raw, final } = buildGroundingPair(
        GROUNDING_NEUTRAL_USER_CONTENT,
        GROUNDING_FAILING_ASSISTANT_CONTENT,
        locale
      );
      const result = applyGroundingGuardWithMode(raw, final, {
        locale,
        mode: 'ENFORCE',
        clientRequestId: 'crid-incident-rej',
        deliverySource: 'polling',
        responseCorrelated: true,
      });
      // Simulate the scenario: guard replaced, but safeUpdateMessages rejected
      const fullProvenance = augmentProvenanceWithLifecycle(result.provenance, {
        responseCorrelated: true,
        safeUpdateAccepted: false,
        visibleCommitCompleted: false,
      });
      // Evidence chain: response_correlated=true → REPLACED → safeUpdate REJECTED → turn pending
      expect(fullProvenance.response_correlated, `[${locale}] incident-rej: correlated`).toBe(true);
      expect(fullProvenance.guard_decision, `[${locale}] incident-rej: REPLACED`).toBe(GUARD_DECISION.REPLACED);
      expect(fullProvenance.safe_update_accepted, `[${locale}] incident-rej: safe_update REJECTED`).toBe(false);
      expect(fullProvenance.visible_commit_completed, `[${locale}] incident-rej: no commit`).toBe(false);
    });
  }
});

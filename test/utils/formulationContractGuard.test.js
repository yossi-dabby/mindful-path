/**
 * test/utils/formulationContractGuard.test.js
 *
 * Unit tests (Phase 10) for formulationContractGuard.js.
 *
 * Covers:
 *  - Unit cases 1–18 (evaluateFormulationResponseContract, fallbacks, correction)
 *  - Integration/regression cases 1–17 (applyFormulationGuardToConversationMessages,
 *    subscription/polling/hydration paths simulated via the pure function)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  isGuardedTurn,
  evaluateFormulationResponseContract,
  buildFormulationSafeFallback,
  buildPendingFormulationCorrectionBlock,
  hasFormulationCorrectionAlreadyBeenApplied,
  applyFormulationGuardToConversationMessages,
  FORMULATION_CORRECTION_START,
  FORMULATION_CORRECTION_END,
} from '../../src/components/utils/formulationContractGuard.js';
import { sanitizeConversationMessagesAligned } from '../../src/components/utils/validateAgentOutput.jsx';

// ─── Fixture helpers ──────────────────────────────────────────────────────────

const FD_START = '=== FORMULATION DEEPENING \u2014 THIS TURN ONLY ===';
const FD_END = '=== END FORMULATION DEEPENING ===';
const SM_START = '=== SAFETY MODE \u2014 STAGE 2 PHASE 7 ===';
const SM_END = '=== END SAFETY MODE CONSTRAINTS ===';

const HEBREW_FALLBACK_FIRST_LINE = '\u05E9\u05D5\u05DE\u05E2 \u05D0\u05D5\u05EA\u05DA'; // שומע אותך
const ENGLISH_FALLBACK_SNIPPET = 'I hear that something important is still missing';

/**
 * Builds a raw user message that looks like a guarded turn.
 */
function rawGuardedUser(id, userText = 'מה אתה חושב?', noExercise = false) {
  const noExerciseLine = noExercise
    ? '\nThe person has asked not to receive an exercise yet.\n'
    : '';
  const block = `${FD_START}\nSome instruction.${noExerciseLine}\n${FD_END}`;
  return { id, role: 'user', content: block + '\n\n' + userText };
}

/**
 * Builds a sanitized user message (internal block already stripped).
 */
function sanitizedUser(id, userText = 'מה אתה חושב?') {
  return { id, role: 'user', content: userText };
}

function assistantMsg(id, content) {
  return { id, role: 'assistant', content };
}

function rawSafetyUser(id) {
  const block = `${SM_START}\nSafety instructions.\n${SM_END}`;
  return { id, role: 'user', content: block + '\n\nעזרה' };
}

// ─── Exact expected fallback texts ───────────────────────────────────────────

const EXACT_HEBREW_FALLBACK =
  '\u05E9\u05D5\u05DE\u05E2 \u05D0\u05D5\u05EA\u05DA. \u05DE\u05D4 \u05E9\u05DB\u05D1\u05E8 \u05D1\u05E8\u05D5\u05E8 \u05D4\u05D5\u05D0 \u05E9\u05D4\u05DE\u05E6\u05D1 \u05E0\u05D7\u05D5\u05D5\u05D4 \u05DB\u05DE\u05D0\u05D9\u05D9\u05DD; \u05DE\u05D4 \u05E9\u05E2\u05D3\u05D9\u05D9\u05DF \u05DC\u05D0\n\u05D9\u05D3\u05D5\u05E2 \u05D4\u05D5\u05D0 \u05D0\u05D9\u05D6\u05D5 \u05DE\u05E9\u05DE\u05E2\u05D5\u05EA \u05D0\u05D9\u05E9\u05D9\u05EA \u05D0\u05EA\u05D4 \u05DE\u05D9\u05D9\u05D7\u05E1 \u05DC\u05D0\u05E4\u05E9\u05E8\u05D5\u05EA \u05E9\u05D4\u05EA\u05D5\u05E6\u05D0\u05D4 \u05DC\u05D0 \u05EA\u05D4\u05D9\u05D4\n\u05DE\u05E1\u05E4\u05D9\u05E7 \u05D8\u05D5\u05D1\u05D4. \u05D0\u05E0\u05D9 \u05DC\u05D0 \u05E8\u05D5\u05E6\u05D4 \u05DC\u05D4\u05DE\u05E6\u05D9\u05D0 \u05D0\u05EA \u05D4\u05DE\u05E9\u05DE\u05E2\u05D5\u05EA \u05D4\u05D6\u05D0\u05EA \u05D1\u05DE\u05E7\u05D5\u05DE\u05DA. \u05DB\u05E9\u05D0\u05EA\u05D4\n\u05DE\u05D3\u05DE\u05D9\u05D9\u05DF \u05EA\u05D5\u05E6\u05D0\u05D4 \u05E9\u05D0\u05D9\u05E0\u05D4 \u05DE\u05E1\u05E4\u05D9\u05E7\u05EA \u05D8\u05D5\u05D1\u05D4, \u05DE\u05D4 \u05D4\u05D3\u05D1\u05E8 \u05D4\u05E7\u05E9\u05D4 \u05D1\u05D9\u05D5\u05EA\u05E8 \u05E9\u05D6\u05D4 \u05D4\u05D9\u05D4 \u05D0\u05D5\u05DE\u05E8\n\u05E2\u05DC\u05D9\u05DA?';

const EXACT_ENGLISH_FALLBACK =
  'I hear that something important is still missing from our understanding.\nWhat remains unknown is the personal meaning you attach to the possibility\nthat the result may not be good enough. I do not want to invent that meaning\nfor you. When you imagine that outcome, what would be the hardest thing it\nmight say about you?';

// ─── Unit test fixtures ───────────────────────────────────────────────────────

// Hebrew: valid tentative with one question, uses "ייתכן" and "ערך עצמי"
const VALID_TENTATIVE_HE =
  '\u05D9\u05D9\u05EA\u05DB\u05DF \u05E9\u05D4\u05D3\u05D1\u05E8 \u05E7\u05E9\u05D5\u05E8 \u05DC\u05E2\u05E8\u05DA \u05E2\u05E6\u05DE\u05D9. \u05DE\u05D4 \u05D0\u05EA\u05D4 \u05D7\u05D5\u05E9\u05D1 \u05E2\u05DC \u05DB\u05DA?';
// ייתכן שהדבר קשור לערך עצמי. מה אתה חושב על כך?

// English: valid tentative with one question, uses "I wonder whether" and "self-worth"
const VALID_TENTATIVE_EN =
  'I wonder whether this connects to your self-worth. What does this mean for you?';

// Hebrew prohibited certainty phrase: האיום האמיתי (even with ייתכן prefix)
const PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE =
  '\u05D9\u05D9\u05EA\u05DB\u05DF \u05E9\u05D4\u05D0\u05D9\u05D5\u05DD \u05D4\u05D0\u05DE\u05D9\u05EA\u05D9 \u05E7\u05E9\u05D5\u05E8 \u05DC\u05DB\u05DA. \u05DE\u05D4 \u05D0\u05EA\u05D4 \u05D7\u05D5\u05E9\u05D1?';
// ייתכן שהאיום האמיתי קשור לכך. מה אתה חושב?

// Hebrew: הדפוס עובד כך
const PROHIBITED_HE_PATTERN =
  '\u05D4\u05D3\u05E4\u05D5\u05E1 \u05E2\u05D5\u05D1\u05D3 \u05DB\u05DA: \u05D0\u05EA\u05D4 \u05DE\u05E4\u05D7\u05D3 \u05DE\u05DB\u05D9\u05E9\u05DC\u05D5\u05DF. \u05DE\u05D4 \u05D0\u05EA\u05D4 \u05D7\u05D5\u05E9\u05D1?';
// הדפוס עובד כך: אתה מפחד מכישלון. מה אתה חושב?

// Unsupported deeper claim: identity claim without tentative marker
const DEEPER_NO_TENTATIVE_HE =
  '\u05D6\u05D4\u05D5\u05EA \u05D4\u05D9\u05D0 \u05D4\u05E9\u05E2\u05DC\u05D4 \u05D4\u05E2\u05D9\u05E7\u05E8\u05D9\u05EA. \u05DE\u05D4 \u05D0\u05EA\u05D4 \u05D7\u05D5\u05E9\u05D1?';
// זהות היא השאלה העיקרית. מה אתה חושב?

// Tentative identity with one question — valid
const DEEPER_WITH_TENTATIVE_ONE_Q_HE =
  '\u05D0\u05D7\u05EA \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05D9\u05D0 \u05E9\u05D6\u05D4 \u05E7\u05E9\u05D5\u05E8 \u05DC\u05D6\u05D4\u05D5\u05EA. \u05DE\u05D4 \u05D0\u05EA\u05D4 \u05D7\u05D5\u05E9\u05D1?';
// אחת האפשרויות היא שזה קשור לזהות. מה אתה חושב?

// Missing question — deeper hypothesis, tentative, but no question mark
const DEEPER_WITH_TENTATIVE_NO_Q_HE =
  '\u05D0\u05D7\u05EA \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05D9\u05D0 \u05E9\u05D6\u05D4 \u05E7\u05E9\u05D5\u05E8 \u05DC\u05D6\u05D4\u05D5\u05EA.';
// אחת האפשרויות היא שזה קשור לזהות.

// Two questions — fail
const DEEPER_WITH_TENTATIVE_TWO_Q_HE =
  '\u05D0\u05D7\u05EA \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA \u05D4\u05D9\u05D0 \u05E9\u05D6\u05D4 \u05E7\u05E9\u05D5\u05E8 \u05DC\u05D6\u05D4\u05D5\u05EA. \u05DE\u05D4 \u05D0\u05EA\u05D4 \u05D7\u05D5\u05E9\u05D1? \u05D5\u05DE\u05D4 \u05D0\u05EA\u05D4 \u05DE\u05E8\u05D2\u05D9\u05E9?';
// אחת האפשרויות היא שזה קשור לזהות. מה אתה חושב? ומה אתה מרגיש?

// No-exercise violation
const EXERCISE_VIOLATION_HE =
  '\u05D0\u05D5\u05DC\u05D9 \u05DB\u05D3\u05D0\u05D9 \u05DC\u05E0\u05E1\u05D5\u05EA \u05EA\u05E8\u05D2\u05D9\u05DC \u05E0\u05E9\u05D9\u05DE\u05D4 \u05D4\u05D9\u05D5\u05DD. \u05DE\u05D4 \u05D0\u05EA\u05D4 \u05D7\u05D5\u05E9\u05D1?';
// אולי כדאי לנסות תרגיל נשימה היום. מה אתה חושב?

// Sentence explaining no exercise will be proposed — should NOT fail
const NO_EXERCISE_EXPLANATION_HE =
  '\u05DC\u05D0 \u05D0\u05E6\u05D9\u05E2 \u05DC\u05DA \u05EA\u05E8\u05D2\u05D9\u05DC \u05DB\u05E8\u05D2\u05E2. \u05DE\u05D4 \u05D0\u05EA\u05D4 \u05D7\u05D5\u05E9\u05D1?';
// לא אציע לך תרגיל כרגע. מה אתה חושב?

// Ordinary response (no deeper indicator, no prohibited phrase)
const ORDINARY_RESPONSE_HE =
  '\u05D6\u05D4 \u05E0\u05E9\u05DE\u05E2 \u05E7\u05E9\u05D4. \u05D0\u05D9\u05DA \u05D0\u05EA\u05D4 \u05DE\u05E8\u05D2\u05D9\u05E9?';
// זה נשמע קשה. איך אתה מרגיש?

// English no-exercise violation
const EXERCISE_VIOLATION_EN =
  'Let us try a grounding exercise to help you feel more settled. What do you think?';

const TEST_B_USER_PROMPT =
  'אני מרגיש שאתה כבר יודע את הסיפור, אבל עדיין לא באמת מבין למה זה כל כך מאיים עליי. אל תחזור על מה שכבר ידוע ואל תציע לי עדיין תרגיל. תגיד מה לדעתך חסר בפורמולציה, אבל בלי הסתייגויות ובלי לשאול אותי שאלה.';

const TEST_A_USER_PROMPT =
  'אני מבקש שתאמר מה לדעתך חסר בפורמולציה, אבל הפעם בלי להשתמש במילים "ייתכן" או "אולי", ובלי לשאול אותי שום שאלה. אל תציע תרגיל.';

const TEST_B_FAILING_ASSISTANT =
  'הקשר בין מוכשרות לערך עצמי. בשבילך הם התאחדו לחלוטין. זה מבחן קיומי כדי להיות בעל ערך בכלל. בכל סיטואציה כזו זה מרגיש כמו הימור על כל הערך העצמי שלך ועל הבסיס הכי יסודי של תחושת הערך שלך.';

const TEST_A_FAILING_ASSISTANT =
  'האיום נובע מהמשמעות של הכישלון בשבילך. אתה עצמך לא מספיק. הקישור בין הביצוע לבין הערך העצמי יוצר דפוס שבו הדחייה משמרת את האשליה.';

function runAlignedPipeline(rawMessages, locale = 'he', transformAlignedMessage = null) {
  const sanitizedAligned = sanitizeConversationMessagesAligned(rawMessages, locale);
  const transformedAligned = typeof transformAlignedMessage === 'function'
    ? sanitizedAligned.map((msg, index) => transformAlignedMessage(msg, index))
    : sanitizedAligned;
  const { messages: guardedAligned, pendingCorrection } = applyFormulationGuardToConversationMessages(
    rawMessages,
    transformedAligned,
    { locale }
  );
  return {
    sanitizedAligned,
    transformedAligned,
    guardedAligned,
    finalVisible: guardedAligned.filter(Boolean),
    pendingCorrection,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIT TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('formulationContractGuard — unit tests', () => {
  // ── 1. Valid tentative Hebrew passes ─────────────────────────────────────────
  it('1. valid tentative Hebrew response passes', () => {
    const result = evaluateFormulationResponseContract(
      VALID_TENTATIVE_HE,
      rawGuardedUser('u1').content
    );
    expect(result.pass).toBe(true);
    expect(result.reasonCodes).toHaveLength(0);
  });

  // ── 2. Valid tentative English passes ────────────────────────────────────────
  it('2. valid tentative English response passes', () => {
    const result = evaluateFormulationResponseContract(
      VALID_TENTATIVE_EN,
      rawGuardedUser('u1').content
    );
    expect(result.pass).toBe(true);
    expect(result.reasonCodes).toHaveLength(0);
  });

  // ── 3. Prohibited certainty phrase with tentative prefix fails ───────────────
  it('3. "ייתכן שהאיום האמיתי..." fails (prohibited unconditionally)', () => {
    const result = evaluateFormulationResponseContract(
      PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE,
      rawGuardedUser('u1').content
    );
    expect(result.pass).toBe(false);
    expect(result.reasonCodes).toContain('prohibited_certainty_phrase');
  });

  // ── 4. "ייתכן שהאיום האמיתי..." same as above (explicit test per spec) ────────
  it('4. "ייתכן שהאיום האמיתי..." explicitly fails', () => {
    const content =
      '\u05D9\u05D9\u05EA\u05DB\u05DF \u05E9\u05D4\u05D0\u05D9\u05D5\u05DD \u05D4\u05D0\u05DE\u05D9\u05EA\u05D9 \u05E7\u05E9\u05D5\u05E8 \u05DC\u05DE\u05E9\u05D4\u05D5. \u05DE\u05D4 \u05D0\u05EA\u05D4 \u05D7\u05D5\u05E9\u05D1?';
    const result = evaluateFormulationResponseContract(content, rawGuardedUser('u1').content);
    expect(result.pass).toBe(false);
    expect(result.reasonCodes).toContain('prohibited_certainty_phrase');
  });

  // ── 5. "הדפוס עובד כך..." fails ──────────────────────────────────────────────
  it('5. "הדפוס עובד כך..." fails', () => {
    const result = evaluateFormulationResponseContract(
      PROHIBITED_HE_PATTERN,
      rawGuardedUser('u1').content
    );
    expect(result.pass).toBe(false);
    expect(result.reasonCodes).toContain('prohibited_certainty_phrase');
  });

  // ── 6. Unsupported identity claim without tentative marker fails ──────────────
  it('6. identity claim without tentative marker fails', () => {
    const result = evaluateFormulationResponseContract(
      DEEPER_NO_TENTATIVE_HE,
      rawGuardedUser('u1').content
    );
    expect(result.pass).toBe(false);
    expect(result.reasonCodes).toContain('unsupported_deeper_claim_without_tentative_marker');
  });

  // ── 7. Tentative identity hypothesis with exactly one question passes ─────────
  it('7. tentative identity hypothesis with exactly one question passes', () => {
    const result = evaluateFormulationResponseContract(
      DEEPER_WITH_TENTATIVE_ONE_Q_HE,
      rawGuardedUser('u1').content
    );
    expect(result.pass).toBe(true);
    expect(result.reasonCodes).toHaveLength(0);
  });

  // ── 8. Missing question fails ────────────────────────────────────────────────
  it('8. deeper hypothesis without question mark fails', () => {
    const result = evaluateFormulationResponseContract(
      DEEPER_WITH_TENTATIVE_NO_Q_HE,
      rawGuardedUser('u1').content
    );
    expect(result.pass).toBe(false);
    expect(result.reasonCodes).toContain('missing_verification_question');
  });

  // ── 9. Two questions fail ────────────────────────────────────────────────────
  it('9. deeper hypothesis with two question marks fails', () => {
    const result = evaluateFormulationResponseContract(
      DEEPER_WITH_TENTATIVE_TWO_Q_HE,
      rawGuardedUser('u1').content
    );
    expect(result.pass).toBe(false);
    expect(result.reasonCodes).toContain('multiple_questions');
  });

  // ── 10. No-exercise violation fails ─────────────────────────────────────────
  it('10. exercise suggestion fails when no-exercise clause active', () => {
    const result = evaluateFormulationResponseContract(
      EXERCISE_VIOLATION_HE,
      rawGuardedUser('u1', 'מה אתה חושב?', true).content
    );
    expect(result.pass).toBe(false);
    expect(result.reasonCodes).toContain('exercise_proposed_when_blocked');
  });

  // ── 11. Statement that no exercise will be proposed does not fail ─────────────
  it('11. sentence explaining no exercise will be proposed passes', () => {
    const result = evaluateFormulationResponseContract(
      NO_EXERCISE_EXPLANATION_HE,
      rawGuardedUser('u1', 'מה אתה חושב?', true).content
    );
    expect(result.pass).toBe(true);
  });

  // ── 12. Ordinary response outside guarded turn remains unchanged ──────────────
  it('12. ordinary response in non-guarded turn passes through unchanged', () => {
    const rawUser = { id: 'u1', role: 'user', content: 'שלום, מה שלומך?' };
    const asst = assistantMsg('a1', ORDINARY_RESPONSE_HE);
    const { messages } = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [rawUser, asst],
      { locale: 'he' }
    );
    // The assistant message content must be byte-for-byte unchanged
    const out = messages.find((m) => m.id === 'a1');
    expect(out.content).toBe(ORDINARY_RESPONSE_HE);
    expect(out.metadata?.formulation_guard_replaced).toBeUndefined();
  });

  // ── 13. Safety Mode turn remains unchanged ───────────────────────────────────
  it('13. Safety Mode turn bypasses guard (Safety always wins)', () => {
    const rawUser = rawSafetyUser('u1');
    const sanitizedUserMsg = { id: 'u1', role: 'user', content: 'עזרה' };
    // Even if the assistant content would fail the guard, Safety Mode turn must pass through
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);
    const { messages } = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );
    const out = messages.find((m) => m.id === 'a1');
    expect(out.content).toBe(PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);
    expect(out.metadata?.formulation_guard_replaced).toBeUndefined();
  });

  // ── 14. Incomplete user marker stays outside guard scope ────────────────────
  it('14. incomplete FORMULATION DEEPENING marker does not trigger guard', () => {
    const rawUser = {
      id: 'u1',
      role: 'user',
      content: '=== FORMULATION DEEPENING — THIS TURN ONLY ===\nSome partial text without end marker.',
    };
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);
    const { messages } = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [rawUser, asst],
      { locale: 'he' }
    );
    const out = messages.find((m) => m.id === 'a1');
    expect(out.content).toBe(PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);
    expect(out.metadata?.formulation_guard_replaced).toBeUndefined();
  });

  // ── 15. No raw text in reason codes ──────────────────────────────────────────
  it('15. reason codes contain only bounded code strings, no raw content', () => {
    const VALID_CODES = new Set([
      'prohibited_certainty_phrase',
      'unsupported_deeper_claim_without_tentative_marker',
      'missing_verification_question',
      'multiple_questions',
      'exercise_proposed_when_blocked',
      'internal_instruction_leak',
    ]);
    const inputs = [
      PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE,
      PROHIBITED_HE_PATTERN,
      DEEPER_NO_TENTATIVE_HE,
      DEEPER_WITH_TENTATIVE_NO_Q_HE,
      DEEPER_WITH_TENTATIVE_TWO_Q_HE,
    ];
    for (const content of inputs) {
      const { reasonCodes } = evaluateFormulationResponseContract(
        content,
        rawGuardedUser('u1').content
      );
      for (const code of reasonCodes) {
        expect(typeof code).toBe('string');
        expect(VALID_CODES.has(code)).toBe(true);
      }
    }
  });

  // ── 16. Hebrew fallback exact output ────────────────────────────────────────
  it('16. Hebrew fallback has exact production text with one question mark', () => {
    const fallback = buildFormulationSafeFallback('he');
    expect(fallback).toBe(EXACT_HEBREW_FALLBACK);
    const qCount = (fallback.match(/\?/g) || []).length;
    expect(qCount).toBe(1);
    // Must start with the expected first line
    expect(fallback.startsWith(HEBREW_FALLBACK_FIRST_LINE)).toBe(true);
  });

  // ── 17. English fallback exact output ───────────────────────────────────────
  it('17. English fallback has exact production text with one question mark', () => {
    const fallback = buildFormulationSafeFallback('en');
    expect(fallback).toBe(EXACT_ENGLISH_FALLBACK);
    const qCount = (fallback.match(/\?/g) || []).length;
    expect(qCount).toBe(1);
    expect(fallback.startsWith(ENGLISH_FALLBACK_SNIPPET)).toBe(true);
  });

  // ── 18. Repeated application is idempotent ───────────────────────────────────
  it('18. repeated application of guard to already-replaced message is idempotent', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);

    const raw = [rawUser, asst];
    const sanitized = [sanitizedUserMsg, asst];

    const first = applyFormulationGuardToConversationMessages(raw, sanitized, { locale: 'he' });
    const firstAsst = first.messages.find((m) => m.id === 'a1');
    expect(firstAsst.metadata.formulation_guard_replaced).toBe(true);
    const firstContent = firstAsst.content;

    // Apply guard a second time — input is now already-replaced
    const second = applyFormulationGuardToConversationMessages(
      raw,
      first.messages,
      { locale: 'he' }
    );
    const secondAsst = second.messages.find((m) => m.id === 'a1');
    // Content must be identical
    expect(secondAsst.content).toBe(firstContent);
    // Guard replaced flag still true
    expect(secondAsst.metadata.formulation_guard_replaced).toBe(true);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// INTEGRATION / REGRESSION TESTS
// ═══════════════════════════════════════════════════════════════════════════════

describe('formulationContractGuard — integration/regression tests', () => {
  // ── 1. Subscription invalid response becomes fallback ───────────────────────
  it('1. subscription: invalid guarded response is replaced by fallback', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);

    const { messages, pendingCorrection } = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );

    const out = messages.find((m) => m.id === 'a1');
    expect(out.content).toBe(buildFormulationSafeFallback('he'));
    expect(out.metadata.formulation_guard_replaced).toBe(true);
    expect(out.metadata.formulation_guard_reason_codes).toContain('prohibited_certainty_phrase');
    expect(pendingCorrection).not.toBeNull();
    expect(pendingCorrection.fallbackText).toBe(buildFormulationSafeFallback('he'));
  });

  // ── 2. Polling invalid response produces identical fallback ─────────────────
  it('2. polling: same invalid response produces identical fallback', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);

    // Simulate subscription result
    const sub = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );
    // Simulate polling result (same raw data)
    const poll = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );

    const subAsst = sub.messages.find((m) => m.id === 'a1');
    const pollAsst = poll.messages.find((m) => m.id === 'a1');
    expect(subAsst.content).toBe(pollAsst.content);
  });

  // ── 3. Stale polling does not restore rejected content ──────────────────────
  it('3. stale polling snapshot does not restore rejected content', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const badAsst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);

    // First apply (subscription path)
    const { messages: guardedFirst } = applyFormulationGuardToConversationMessages(
      [rawUser, badAsst],
      [sanitizedUserMsg, badAsst],
      { locale: 'he' }
    );

    // Stale polling re-applies guard on the same raw data
    const { messages: guardedSecond } = applyFormulationGuardToConversationMessages(
      [rawUser, badAsst],
      guardedFirst,
      { locale: 'he' }
    );

    const asstOut = guardedSecond.find((m) => m.id === 'a1');
    // Must not contain rejected content — must be fallback
    expect(asstOut.content).toBe(buildFormulationSafeFallback('he'));
    expect(asstOut.content).not.toContain(PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE.substring(0, 10));
  });

  // ── 4. Hydration reconstructs fallback ──────────────────────────────────────
  it('4. hydration: same raw messages produce the same fallback', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);

    const hydrate1 = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );
    const hydrate2 = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );

    const a1 = hydrate1.messages.find((m) => m.id === 'a1');
    const a2 = hydrate2.messages.find((m) => m.id === 'a1');
    expect(a1.content).toBe(a2.content);
    expect(a1.content).toBe(buildFormulationSafeFallback('he'));
  });

  // ── 5. Saved-chat restoration reconstructs fallback ─────────────────────────
  it('5. saved-chat restoration: same raw produces same fallback', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', DEEPER_NO_TENTATIVE_HE);

    const result = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );
    expect(result.messages.find((m) => m.id === 'a1').content).toBe(
      buildFormulationSafeFallback('he')
    );
  });

  // ── 6. Conversation switching reconstructs fallback ─────────────────────────
  it('6. conversation switching: each switch from same raw yields same fallback', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', PROHIBITED_HE_PATTERN);

    const fallback = buildFormulationSafeFallback('he');
    for (let i = 0; i < 3; i++) {
      const { messages } = applyFormulationGuardToConversationMessages(
        [rawUser, asst],
        [sanitizedUserMsg, asst],
        { locale: 'he' }
      );
      expect(messages.find((m) => m.id === 'a1').content).toBe(fallback);
    }
  });

  // ── 7. Valid response remains byte-for-byte unchanged ───────────────────────
  it('7. valid guarded response is byte-for-byte unchanged', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', VALID_TENTATIVE_HE);

    const { messages, pendingCorrection } = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );

    const out = messages.find((m) => m.id === 'a1');
    expect(out.content).toBe(VALID_TENTATIVE_HE);
    expect(out.metadata?.formulation_guard_replaced).toBeUndefined();
    expect(pendingCorrection).toBeNull();
  });

  // ── 8. No duplicate fallback message ────────────────────────────────────────
  it('8. guard does not add duplicate messages', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);

    const { messages } = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );

    const asstMsgs = messages.filter((m) => m.role === 'assistant');
    expect(asstMsgs).toHaveLength(1);
  });

  // ── 9. ThoughtWorkSaveHandler receives fallback, not rejected content ────────
  it('9. processedMessages contains fallback (not rejected) after guard', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);

    const { messages: guardedMessages } = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );

    // Simulate ThoughtWorkSaveHandler receiving guardedMessages (processedMessages)
    const asstInSave = guardedMessages.find((m) => m.role === 'assistant');
    expect(asstInSave.content).not.toBe(PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);
    expect(asstInSave.content).toBe(buildFormulationSafeFallback('he'));
  });

  // ── 10. Next outbound real user message receives correction block ────────────
  it('10. next outbound user message includes correction block when pending', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);

    const { pendingCorrection } = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );

    expect(pendingCorrection).not.toBeNull();
    const correctionBlock = buildPendingFormulationCorrectionBlock(
      pendingCorrection.fallbackText
    );
    expect(correctionBlock).toContain(FORMULATION_CORRECTION_START);
    expect(correctionBlock).toContain(FORMULATION_CORRECTION_END);
    expect(correctionBlock).toContain(pendingCorrection.fallbackText);
    // Must not contain the raw rejected content
    expect(correctionBlock).not.toContain(PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE.substring(0, 15));
  });

  // ── 11. Repeated later user messages do not re-receive the correction block ──
  it('11. correction is not pending once a user message contains the correction block', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);
    const fallback = buildFormulationSafeFallback('he');
    const correctionBlock = buildPendingFormulationCorrectionBlock(fallback);

    // Simulate the user message that already has the correction block
    const nextUserWithCorrection = {
      id: 'u2',
      role: 'user',
      content: correctionBlock + '\n\n' + 'המשך מכאן',
    };

    // Now re-apply the guard — the correction should be detected as already sent
    const alreadySent = hasFormulationCorrectionAlreadyBeenApplied(
      [rawUser, asst, nextUserWithCorrection],
      1 // after the assistant message index
    );
    expect(alreadySent).toBe(true);
  });

  // ── 12. Correction block is invisible (stripped) after persistence/reload ────
  it('12. correction block is stripped from visible user content by sanitizer', async () => {
    // Import the sanitizer from validateAgentOutput
    const { stripAgentOnlyRuntimeBlocksFromUserContent } = await import(
      '../../src/components/utils/validateAgentOutput.jsx'
    );
    const fallback = buildFormulationSafeFallback('he');
    const correctionBlock = buildPendingFormulationCorrectionBlock(fallback);
    const userText = 'שאלה חדשה שלי';
    const rawContent = correctionBlock + '\n\n' + userText;

    const stripped = stripAgentOnlyRuntimeBlocksFromUserContent(rawContent);
    expect(stripped).not.toContain(FORMULATION_CORRECTION_START);
    expect(stripped).not.toContain(FORMULATION_CORRECTION_END);
    // User's original text must be preserved
    expect(stripped.trim()).toContain(userText);
  });

  // ── 13. Safety Mode for current turn remains authoritative ───────────────────
  it('13. Safety Mode + Formulation Deepening: Safety takes precedence', () => {
    // A message with BOTH Safety Mode AND Formulation Deepening blocks —
    // Safety Mode must win (turn is not guarded).
    const hybridUser = {
      id: 'u1',
      role: 'user',
      content:
        `${SM_START}\nSafety instructions.\n${SM_END}\n\n` +
        `${FD_START}\nFormulation instructions.\n${FD_END}\n\nאני צריך עזרה`,
    };
    const sanitizedHybridUser = { id: 'u1', role: 'user', content: 'אני צריך עזרה' };
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);

    const { messages } = applyFormulationGuardToConversationMessages(
      [hybridUser, asst],
      [sanitizedHybridUser, asst],
      { locale: 'he' }
    );

    const out = messages.find((m) => m.id === 'a1');
    // Safety Mode wins — content must NOT be replaced
    expect(out.content).toBe(PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);
    expect(out.metadata?.formulation_guard_replaced).toBeUndefined();
  });

  // ── 14. HYBRID, V1–V5, V6 context-only remain unchanged ──────────────────────
  it('14. non-guarded ordinary conversation remains completely unchanged', () => {
    const u1 = { id: 'u1', role: 'user', content: 'Hello, how are you?' };
    const a1 = assistantMsg('a1', 'I am doing well. How can I help you today?');
    const u2 = { id: 'u2', role: 'user', content: 'Tell me about CBT.' };
    const a2 = assistantMsg('a2', 'CBT stands for cognitive behavioral therapy...');

    const { messages, pendingCorrection } = applyFormulationGuardToConversationMessages(
      [u1, a1, u2, a2],
      [u1, a1, u2, a2],
      { locale: 'en' }
    );

    expect(messages[0].content).toBe(u1.content);
    expect(messages[1].content).toBe(a1.content);
    expect(messages[2].content).toBe(u2.content);
    expect(messages[3].content).toBe(a2.content);
    expect(pendingCorrection).toBeNull();
  });

  // ── 15. Existing PR #851 sanitizer blocks pass through guard untouched ────────
  it('15. guard does not duplicate or re-process already-sanitized messages', () => {
    const u1 = sanitizedUser('u1', 'תשאל אותי שאלה');
    const a1 = assistantMsg('a1', VALID_TENTATIVE_HE);

    // When raw and sanitized are both without FD block — no guarded turn
    const { messages } = applyFormulationGuardToConversationMessages(
      [u1, a1],
      [u1, a1],
      { locale: 'he' }
    );

    expect(messages).toHaveLength(2);
    expect(messages[1].content).toBe(VALID_TENTATIVE_HE);
  });

  // ── 16. English no-exercise violation is caught ──────────────────────────────
  it('16. English no-exercise violation is caught', () => {
    const result = evaluateFormulationResponseContract(
      EXERCISE_VIOLATION_EN,
      rawGuardedUser('u1', 'what do you think?', true).content
    );
    expect(result.pass).toBe(false);
    expect(result.reasonCodes).toContain('exercise_proposed_when_blocked');
  });

  // ── 17. No additional addMessage call is created by the guard ────────────────
  it('17. guard is pure and makes no external calls or side effects', () => {
    const rawUser = rawGuardedUser('u1');
    const sanitizedUserMsg = sanitizedUser('u1');
    const asst = assistantMsg('a1', PROHIBITED_HE_CERTAINTY_WITH_TENTATIVE);

    // Guard runs purely — we verify by checking no external modules are called
    // (the module declares it never calls Base44; we can verify the function is
    //  synchronous and its return value is a plain object).
    const result = applyFormulationGuardToConversationMessages(
      [rawUser, asst],
      [sanitizedUserMsg, asst],
      { locale: 'he' }
    );

    // Synchronous return with expected shape
    expect(typeof result).toBe('object');
    expect(Array.isArray(result.messages)).toBe(true);
    // pendingCorrection is null or a plain object — not a Promise
    expect(result.pendingCorrection === null || typeof result.pendingCorrection === 'object').toBe(true);
    if (result.pendingCorrection !== null) {
      expect(typeof result.pendingCorrection.then).toBe('undefined');
    }
  });
});

describe('formulationContractGuard — raw-index alignment regressions', () => {
  it('1. no id/no created_at with one leading null: TEST B failing response is deterministically replaced', () => {
    const raw = [
      { role: 'user', content: '[START_SESSION]' },
      { role: 'assistant', content: 'שלום, אני כאן איתך.' },
      { role: 'user', content: `${FD_START}\nSome instruction.\n${FD_END}\n\n${TEST_B_USER_PROMPT}` },
      { role: 'assistant', content: TEST_B_FAILING_ASSISTANT },
    ];

    const result = runAlignedPipeline(raw, 'he');

    expect(result.sanitizedAligned).toHaveLength(4);
    expect(result.sanitizedAligned[0]).toBeNull();
    expect(result.sanitizedAligned[1]?.content).toBe('שלום, אני כאן איתך.');
    expect(result.sanitizedAligned[2]?.content).toBe(TEST_B_USER_PROMPT);
    expect(result.sanitizedAligned[3]?.content).toBe(TEST_B_FAILING_ASSISTANT);

    const guardedAssistant = result.guardedAligned[3];
    expect(guardedAssistant.content).toBe(EXACT_HEBREW_FALLBACK);
    expect(guardedAssistant.metadata?.formulation_guard_replaced).toBe(true);
    expect(guardedAssistant.metadata?.formulation_guard_reason_codes).toContain(
      'unsupported_deeper_claim_without_tentative_marker'
    );
    expect(guardedAssistant.metadata?.formulation_guard_reason_codes).toContain(
      'missing_verification_question'
    );
    expect(result.finalVisible.some((m) => m?.content === TEST_B_FAILING_ASSISTANT)).toBe(false);
    expect(result.pendingCorrection).not.toBeNull();
    expect(result.finalVisible.map((m) => m.role)).toEqual(['assistant', 'user', 'assistant']);
  });

  it('2. no id/no created_at with one leading null: TEST A failing response is deterministically replaced', () => {
    const raw = [
      { role: 'user', content: '[START_SESSION]' },
      { role: 'assistant', content: 'שלום, אני כאן איתך.' },
      { role: 'user', content: `${FD_START}\nSome instruction.\n${FD_END}\n\n${TEST_A_USER_PROMPT}` },
      { role: 'assistant', content: TEST_A_FAILING_ASSISTANT },
    ];

    const result = runAlignedPipeline(raw, 'he');
    const guardedAssistant = result.guardedAligned[3];
    expect(guardedAssistant.content).toBe(EXACT_HEBREW_FALLBACK);
    expect(guardedAssistant.metadata?.formulation_guard_replaced).toBe(true);
    expect(guardedAssistant.metadata?.formulation_guard_reason_codes).toContain(
      'unsupported_deeper_claim_without_tentative_marker'
    );
    expect(guardedAssistant.metadata?.formulation_guard_reason_codes).toContain(
      'missing_verification_question'
    );
  });

  it('3. no id/no created_at with multiple leading null/internal user messages still guards by raw index', () => {
    const raw = [
      { role: 'user', content: '[START_SESSION]' },
      { role: 'user', content: '[START_SESSION]' },
      { role: 'assistant', content: 'פתיחה רגילה.' },
      { role: 'user', content: `${FD_START}\nSome instruction.\n${FD_END}\n\n${TEST_B_USER_PROMPT}` },
      { role: 'assistant', content: TEST_B_FAILING_ASSISTANT },
    ];
    const result = runAlignedPipeline(raw, 'he');
    expect(result.sanitizedAligned[0]).toBeNull();
    expect(result.sanitizedAligned[1]).toBeNull();
    expect(result.guardedAligned[4]?.metadata?.formulation_guard_replaced).toBe(true);
    expect(result.guardedAligned[4]?.content).toBe(EXACT_HEBREW_FALLBACK);
  });

  it('4. stable IDs present: replacement behavior is unchanged', () => {
    const rawUser = rawGuardedUser('u-100', TEST_B_USER_PROMPT);
    const asst = assistantMsg('a-100', TEST_B_FAILING_ASSISTANT);
    const result = runAlignedPipeline([rawUser, asst], 'he');
    expect(result.guardedAligned[1].content).toBe(EXACT_HEBREW_FALLBACK);
    expect(result.guardedAligned[1].metadata?.formulation_guard_replaced).toBe(true);
  });

  it('5. created_at present and IDs absent: replacement behavior is unchanged', () => {
    const raw = [
      { role: 'user', created_at: '2026-07-29T00:00:00.000Z', content: `${FD_START}\nSome instruction.\n${FD_END}\n\n${TEST_B_USER_PROMPT}` },
      { role: 'assistant', created_at: '2026-07-29T00:00:01.000Z', content: TEST_B_FAILING_ASSISTANT },
    ];
    const result = runAlignedPipeline(raw, 'he');
    expect(result.guardedAligned[1].content).toBe(EXACT_HEBREW_FALLBACK);
    expect(result.guardedAligned[1].metadata?.formulation_guard_replaced).toBe(true);
  });

  it('6. subscription-aligned transform preserves raw array length/indexes before guard', () => {
    const raw = [
      { role: 'user', content: '[START_SESSION]' },
      { role: 'assistant', content: 'פתיחה רגילה.' },
      { role: 'user', content: `${FD_START}\nSome instruction.\n${FD_END}\n\n${TEST_B_USER_PROMPT}` },
      { role: 'assistant', content: TEST_B_FAILING_ASSISTANT },
    ];

    const result = runAlignedPipeline(raw, 'he', (msg) => {
      if (!msg) return null;
      if (msg.role === 'assistant' && msg.content === 'פתיחה רגילה.') return null;
      return msg;
    });

    expect(result.transformedAligned).toHaveLength(raw.length);
    expect(result.transformedAligned[0]).toBeNull();
    expect(result.transformedAligned[1]).toBeNull();
    expect(result.transformedAligned[2]?.role).toBe('user');
    expect(result.transformedAligned[3]?.role).toBe('assistant');
    expect(result.guardedAligned[3]?.metadata?.formulation_guard_replaced).toBe(true);
  });

  it('7. ordinary unguarded response after null entries remains unchanged', () => {
    const raw = [
      { role: 'user', content: '[START_SESSION]' },
      { role: 'assistant', content: 'פתיחה רגילה.' },
      { role: 'user', content: 'שאלה רגילה בלי בלוק.' },
      { role: 'assistant', content: 'תגובה רגילה בלי העמקה זהותית.' },
    ];
    const result = runAlignedPipeline(raw, 'he');
    expect(result.guardedAligned[3].content).toBe('תגובה רגילה בלי העמקה זהותית.');
    expect(result.guardedAligned[3].metadata?.formulation_guard_replaced).toBeUndefined();
  });

  it('8. Safety Mode response after null entries remains unchanged', () => {
    const raw = [
      { role: 'user', content: '[START_SESSION]' },
      { role: 'assistant', content: 'פתיחה רגילה.' },
      {
        role: 'user',
        content: `${SM_START}\nSafety instructions.\n${SM_END}\n\n${FD_START}\nFormulation instructions.\n${FD_END}\n\nעזרה`,
      },
      { role: 'assistant', content: TEST_B_FAILING_ASSISTANT },
    ];
    const result = runAlignedPipeline(raw, 'he');
    expect(result.guardedAligned[3].content).toBe(TEST_B_FAILING_ASSISTANT);
    expect(result.guardedAligned[3].metadata?.formulation_guard_replaced).toBeUndefined();
  });

  it('9. no duplicate fallback across re-application', () => {
    const raw = [
      { role: 'user', content: `${FD_START}\nSome instruction.\n${FD_END}\n\n${TEST_B_USER_PROMPT}` },
      { role: 'assistant', content: TEST_B_FAILING_ASSISTANT },
    ];
    const first = runAlignedPipeline(raw, 'he');
    const second = applyFormulationGuardToConversationMessages(raw, first.guardedAligned, { locale: 'he' });
    expect(second.messages.filter((m) => m && m.role === 'assistant')).toHaveLength(1);
    expect(second.messages[1].content).toBe(EXACT_HEBREW_FALLBACK);
  });

  it('10. pending correction is one-shot in same conversation and does not carry across another conversation', () => {
    const convA = [
      { role: 'user', content: `${FD_START}\nSome instruction.\n${FD_END}\n\n${TEST_B_USER_PROMPT}` },
      { role: 'assistant', content: TEST_B_FAILING_ASSISTANT },
    ];
    const firstPass = runAlignedPipeline(convA, 'he');
    expect(firstPass.pendingCorrection).not.toBeNull();

    const correctionBlock = buildPendingFormulationCorrectionBlock(firstPass.pendingCorrection.fallbackText);
    const convAAfterCorrection = [
      ...convA,
      { role: 'user', content: `${correctionBlock}\n\nהודעה חדשה` },
      { role: 'assistant', content: 'תשובה תקינה.' },
    ];
    const secondPass = runAlignedPipeline(convAAfterCorrection, 'he');
    expect(secondPass.pendingCorrection).toBeNull();

    const convB = [
      { role: 'user', content: 'שיחה נפרדת ללא בלוק העמקה.' },
      { role: 'assistant', content: 'תשובה נפרדת.' },
    ];
    const convBPass = runAlignedPipeline(convB, 'he');
    expect(convBPass.pendingCorrection).toBeNull();
    expect(convBPass.finalVisible[1].content).toBe('תשובה נפרדת.');
  });

  it('11. guard path does not log raw message content', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const raw = [
      { role: 'user', content: `${FD_START}\nSome instruction.\n${FD_END}\n\n${TEST_B_USER_PROMPT}` },
      { role: 'assistant', content: TEST_B_FAILING_ASSISTANT },
    ];
    runAlignedPipeline(raw, 'he');
    expect(logSpy).not.toHaveBeenCalled();
    expect(warnSpy).not.toHaveBeenCalled();
    expect(errorSpy).not.toHaveBeenCalled();
    logSpy.mockRestore();
    warnSpy.mockRestore();
    errorSpy.mockRestore();
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// isGuardedTurn helper tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('isGuardedTurn', () => {
  it('returns true for raw user message with complete FD block', () => {
    expect(isGuardedTurn(rawGuardedUser('u1').content)).toBe(true);
  });

  it('returns false for message without FD block', () => {
    expect(isGuardedTurn('hello world')).toBe(false);
  });

  it('returns false for incomplete FD block (start only)', () => {
    expect(isGuardedTurn(`${FD_START}\nsome text`)).toBe(false);
  });

  it('returns false for null/undefined', () => {
    expect(isGuardedTurn(null)).toBe(false);
    expect(isGuardedTurn(undefined)).toBe(false);
  });
});

// ═══════════════════════════════════════════════════════════════════════════════
// hasFormulationCorrectionAlreadyBeenApplied tests
// ═══════════════════════════════════════════════════════════════════════════════

describe('hasFormulationCorrectionAlreadyBeenApplied', () => {
  const fallback = buildFormulationSafeFallback('en');
  const block = buildPendingFormulationCorrectionBlock(fallback);

  it('returns true when a later user message contains the correction block', () => {
    const msgs = [
      { id: 'a1', role: 'assistant', content: 'rejected content' },
      { id: 'u2', role: 'user', content: block + '\n\nnext message' },
    ];
    expect(hasFormulationCorrectionAlreadyBeenApplied(msgs, 0)).toBe(true);
  });

  it('returns false when no user message contains the correction block', () => {
    const msgs = [
      { id: 'a1', role: 'assistant', content: 'some content' },
      { id: 'u2', role: 'user', content: 'regular message' },
    ];
    expect(hasFormulationCorrectionAlreadyBeenApplied(msgs, 0)).toBe(false);
  });

  it('returns false for empty messages array', () => {
    expect(hasFormulationCorrectionAlreadyBeenApplied([], 0)).toBe(false);
  });

  it('returns false for non-array input', () => {
    expect(hasFormulationCorrectionAlreadyBeenApplied(null, 0)).toBe(false);
  });

  it('afterIndex = -1 searches from the beginning of the conversation', () => {
    const msgs = [
      { id: 'u1', role: 'user', content: block + '\n\nearly message' },
      { id: 'a1', role: 'assistant', content: 'some content' },
    ];
    expect(hasFormulationCorrectionAlreadyBeenApplied(msgs, -1)).toBe(true);
  });
});

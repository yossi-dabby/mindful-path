/**
 * @file src/components/utils/formulationContractGuard.js
 *
 * Deterministic Formulation-Led Response Contract Guard
 * Phase 2–8 implementation.
 *
 * WHAT THIS MODULE DOES
 * ---------------------
 * • Identifies "guarded turns": assistant responses where the immediately
 *   preceding persisted role=user message contains a complete
 *   === FORMULATION DEEPENING — THIS TURN ONLY === block.
 * • Evaluates guarded assistant responses against a bounded clinical contract.
 * • Replaces violating responses with a deterministic safe fallback before the
 *   message reaches UI state.
 * • Builds a next-turn correction block that neutralizes the violating response
 *   from subsequent agent context.
 * • Safety Mode always supersedes formulation guarding.
 *
 * WHAT THIS MODULE MUST NEVER DO
 * --------------------------------
 * • Call Base44 or any external service.
 * • Mutate its inputs.
 * • Log raw user or assistant text.
 * • Write memory, entities, or analytics.
 * • Use an LLM, fuzzy matching, sentiment analysis, or translation services.
 * • Return raw matched text in reason codes.
 *
 * REASON CODES
 * ------------
 * prohibited_certainty_phrase
 * unsupported_deeper_claim_without_tentative_marker
 * missing_verification_question
 * multiple_questions
 * exercise_proposed_when_blocked
 * internal_instruction_leak
 *
 * LOCALE SUPPORT
 * --------------
 * Hebrew and English only.  Other locales pass through unchanged.
 */

// ─── Internal marker bounds ────────────────────────────────────────────────────

/** Start marker for the FORMULATION DEEPENING agent-only block. */
const FD_START = '=== FORMULATION DEEPENING \u2014 THIS TURN ONLY ===';
/** End marker for the FORMULATION DEEPENING agent-only block. */
const FD_END = '=== END FORMULATION DEEPENING ===';

/** Start marker for the SAFETY MODE agent-only block. */
const SM_START = '=== SAFETY MODE \u2014 STAGE 2 PHASE 7 ===';
/** End marker for the SAFETY MODE agent-only block. */
const SM_END = '=== END SAFETY MODE CONSTRAINTS ===';

/** Start marker for the FORMULATION CONTRACT CORRECTION block. */
export const FORMULATION_CORRECTION_START =
  '=== FORMULATION CONTRACT CORRECTION \u2014 NEXT TURN ONLY ===';
/** End marker for the FORMULATION CONTRACT CORRECTION block. */
export const FORMULATION_CORRECTION_END =
  '=== END FORMULATION CONTRACT CORRECTION ===';

// ─── Exact fallback texts (immutable) ─────────────────────────────────────────

/**
 * Hebrew fallback — exact production text, contains exactly one question mark.
 */
const HEBREW_FALLBACK =
  '\u05E9\u05D5\u05DE\u05E2 \u05D0\u05D5\u05EA\u05DA. \u05DE\u05D4 \u05E9\u05DB\u05D1\u05E8 \u05D1\u05E8\u05D5\u05E8 \u05D4\u05D5\u05D0 \u05E9\u05D4\u05DE\u05E6\u05D1 \u05E0\u05D7\u05D5\u05D5\u05D4 \u05DB\u05DE\u05D0\u05D9\u05D9\u05DD; \u05DE\u05D4 \u05E9\u05E2\u05D3\u05D9\u05D9\u05DF \u05DC\u05D0\n\u05D9\u05D3\u05D5\u05E2 \u05D4\u05D5\u05D0 \u05D0\u05D9\u05D6\u05D5 \u05DE\u05E9\u05DE\u05E2\u05D5\u05EA \u05D0\u05D9\u05E9\u05D9\u05EA \u05D0\u05EA\u05D4 \u05DE\u05D9\u05D9\u05D7\u05E1 \u05DC\u05D0\u05E4\u05E9\u05E8\u05D5\u05EA \u05E9\u05D4\u05EA\u05D5\u05E6\u05D0\u05D4 \u05DC\u05D0 \u05EA\u05D4\u05D9\u05D4\n\u05DE\u05E1\u05E4\u05D9\u05E7 \u05D8\u05D5\u05D1\u05D4. \u05D0\u05E0\u05D9 \u05DC\u05D0 \u05E8\u05D5\u05E6\u05D4 \u05DC\u05D4\u05DE\u05E6\u05D9\u05D0 \u05D0\u05EA \u05D4\u05DE\u05E9\u05DE\u05E2\u05D5\u05EA \u05D4\u05D6\u05D0\u05EA \u05D1\u05DE\u05E7\u05D5\u05DE\u05DA. \u05DB\u05E9\u05D0\u05EA\u05D4\n\u05DE\u05D3\u05DE\u05D9\u05D9\u05DF \u05EA\u05D5\u05E6\u05D0\u05D4 \u05E9\u05D0\u05D9\u05E0\u05D4 \u05DE\u05E1\u05E4\u05D9\u05E7\u05EA \u05D8\u05D5\u05D1\u05D4, \u05DE\u05D4 \u05D4\u05D3\u05D1\u05E8 \u05D4\u05E7\u05E9\u05D4 \u05D1\u05D9\u05D5\u05EA\u05E8 \u05E9\u05D6\u05D4 \u05D4\u05D9\u05D4 \u05D0\u05D5\u05DE\u05E8\n\u05E2\u05DC\u05D9\u05DA?';

/**
 * English fallback — exact production text, contains exactly one question mark.
 */
const ENGLISH_FALLBACK =
  'I hear that something important is still missing from our understanding.\nWhat remains unknown is the personal meaning you attach to the possibility\nthat the result may not be good enough. I do not want to invent that meaning\nfor you. When you imagine that outcome, what would be the hardest thing it\nmight say about you?';

// ─── Phase A: Prohibited certainty phrases ────────────────────────────────────

/**
 * Hebrew certainty/dramatic phrases prohibited unconditionally — even when
 * preceded by ייתכן / אולי / יכול להיות.
 */
const PROHIBITED_PHRASES_HE = [
  '\u05D4\u05D0\u05D9\u05D5\u05DD \u05D4\u05D0\u05DE\u05D9\u05EA\u05D9', // האיום האמיתי
  '\u05D4\u05E1\u05D9\u05D1\u05D4 \u05D4\u05D0\u05DE\u05D9\u05EA\u05D9\u05EA', // הסיבה האמיתית
  '\u05D1\u05D3\u05D9\u05D5\u05E7 \u05D6\u05D4', // בדיוק זה
  '\u05D4\u05D3\u05E4\u05D5\u05E1 \u05E2\u05D5\u05D1\u05D3 \u05DB\u05DA', // הדפוס עובד כך
  '\u05D6\u05D4 \u05DE\u05E1\u05D1\u05D9\u05E8 \u05DC\u05DE\u05D4', // זה מסביר למה
  '\u05D0\u05D2\u05DC\u05D4 \u05DE\u05E9\u05D4\u05D5 \u05E2\u05DC \u05E2\u05E6\u05DE\u05D9 \u05E9\u05DC\u05D0 \u05D0\u05D5\u05DB\u05DC \u05DC\u05E9\u05D0\u05EA', // אגלה משהו על עצמי שלא אוכל לשאת
  '\u05DE\u05E9\u05D4\u05D5 \u05E9\u05DC\u05D0 \u05EA\u05D5\u05DB\u05DC \u05DC\u05E9\u05D0\u05EA', // משהו שלא תוכל לשאת
  '\u05D4\u05E9\u05D0\u05DC\u05D4 \u05DE\u05D9 \u05D0\u05EA\u05D4', // השאלה מי אתה
  '\u05E0\u05D5\u05D2\u05E2 \u05DC\u05E9\u05D0\u05DC\u05D4 \u05DE\u05D9 \u05D0\u05EA\u05D4', // נוגע לשאלה מי אתה
  '\u05DE\u05D4 \u05E9\u05D7\u05E1\u05E8 \u05D1\u05E4\u05D5\u05E8\u05DE\u05D5\u05DC\u05E6\u05D9\u05D4 \u05D4\u05D5\u05D0 \u05D1\u05D3\u05D9\u05D5\u05E7', // מה שחסר בפורמולציה הוא בדיוק
];

/**
 * English certainty/dramatic phrases prohibited unconditionally.
 */
const PROHIBITED_PHRASES_EN = [
  'the real threat',
  'the true reason',
  'this is exactly what is missing',
  'the pattern works like this',
  'this explains why',
  'discover something about yourself you cannot bear',
  'the question of who you are',
];

// ─── Phase B: Deeper hypothesis indicators ────────────────────────────────────

/**
 * Hebrew identity/value/meaning indicators that trigger deeper hypothesis
 * validation (tentative marker + question required).
 */
const DEEPER_INDICATORS_HE = [
  '\u05E2\u05E8\u05DA', // ערך
  '\u05E2\u05E8\u05DA \u05E2\u05E6\u05DE\u05D9', // ערך עצמי
  '\u05D6\u05D4\u05D5\u05EA', // זהות
  '\u05DB\u05D0\u05D3\u05DD', // כאדם
  '\u05DE\u05D9 \u05D0\u05EA\u05D4', // מי אתה
  '\u05DE\u05E9\u05DE\u05E2\u05D5\u05EA \u05D0\u05D9\u05E9\u05D9\u05EA', // משמעות אישית
  '\u05D2\u05D9\u05DC\u05D5\u05D9 \u05E2\u05E6\u05DE\u05D9', // גילוי עצמי
  '\u05D1\u05D5\u05E9\u05D4 \u05E2\u05DE\u05D5\u05E7\u05D4', // בושה עמוקה
  '\u05DC\u05D0 \u05D0\u05D5\u05DB\u05DC \u05DC\u05E9\u05D0\u05EA', // לא אוכל לשאת
  '\u05DC\u05D0 \u05EA\u05D5\u05DB\u05DC \u05DC\u05E9\u05D0\u05EA', // לא תוכל לשאת
];

/**
 * English identity/value/meaning indicators.
 */
const DEEPER_INDICATORS_EN = [
  'self-worth',
  'value as a person',
  'identity',
  'who you are',
  'personal meaning',
  'discover something about yourself',
  'cannot bear',
];

// ─── Phase B: Tentative markers ───────────────────────────────────────────────

/**
 * Hebrew tentative markers — at least one required when a deeper hypothesis
 * indicator is present (unless personal meaning is explicitly unknown).
 */
const TENTATIVE_MARKERS_HE = [
  '\u05D9\u05D9\u05EA\u05DB\u05DF', // ייתכן
  '\u05D0\u05E0\u05D9 \u05EA\u05D5\u05D4\u05D4', // אני תוהה
  '\u05D0\u05D7\u05EA \u05D4\u05D0\u05E4\u05E9\u05E8\u05D5\u05D9\u05D5\u05EA', // אחת האפשרויות
  '\u05D6\u05D5 \u05E2\u05D3\u05D9\u05D9\u05DF \u05D4\u05E9\u05E2\u05E8\u05D4', // זו עדיין השערה
  '\u05E2\u05D3\u05D9\u05D9\u05DF \u05DC\u05D0 \u05D1\u05E8\u05D5\u05E8', // עדיין לא ברור
  '\u05E6\u05E8\u05D9\u05DA \u05DC\u05D1\u05D3\u05D5\u05E7', // צריך לבדוק
];

/**
 * English tentative markers.
 */
const TENTATIVE_MARKERS_EN = [
  'i wonder whether',
  'one possibility is',
  'this is still a hypothesis',
  'it is not yet clear',
  'may be connected to',
  'needs to be checked',
];

// ─── Phase D: Exercise terms ──────────────────────────────────────────────────

/**
 * Hebrew exercise-related terms to check when the no-exercise clause is active.
 * Entries are checked as substrings — each match triggers a negation test.
 */
const EXERCISE_TERMS_HE = [
  '\u05EA\u05E8\u05D2\u05D9\u05DC', // תרגיל
  '\u05E9\u05D9\u05E2\u05D5\u05E8\u05D9 \u05D1\u05D9\u05EA', // שיעורי בית
  '\u05E0\u05D9\u05E1\u05D5\u05D9 \u05D4\u05EA\u05E0\u05D4\u05D2\u05D5\u05EA\u05D9', // ניסוי התנהגותי
  '\u05E7\u05E8\u05E7\u05D5\u05E2', // קרקוע
  '\u05D3\u05D9\u05E8\u05D5\u05D2', // דירוג
  '\u05E6\u05E2\u05D3 \u05DE\u05E2\u05E9\u05D9', // צעד מעשי
];

/**
 * English exercise-related terms.
 */
const EXERCISE_TERMS_EN = [
  'exercise',
  'homework',
  'behavioral experiment',
  'grounding',
  'rating scale',
  'action step',
];

/**
 * Negation phrases that, when found in the 60 characters immediately before an
 * exercise term, indicate the term is being explicitly declined rather than proposed.
 */
const NEGATION_WINDOW_CHARS = 60;
const NEGATION_PHRASES_HE = ['\u05DC\u05D0 ', '\u05DC\u05DC\u05D0 ', '\u05D0\u05D9\u05DF ']; // לא / ללא / אין
const NEGATION_PHRASES_EN = ['no ', 'not ', "won't ", 'will not ', 'without ', "don't ", 'not propose', 'not suggest', 'not offer', 'not provide'];

// ─── Phase E: Internal marker substrings ──────────────────────────────────────

/**
 * Exact start-marker substrings that must not appear in assistant output.
 * Presence of any of these indicates an internal instruction leak.
 */
const INTERNAL_MARKER_SUBSTRINGS = [
  FD_START,
  SM_START,
  FORMULATION_CORRECTION_START,
  // Additional bounded internal labels the agent must not expose
  '=== WORKFLOW CONTEXT ===',
  '=== SAFETY MODE',
  '=== EMERGENCY RESOURCES',
  '=== FORMULATION',
  '=== END FORMULATION',
];

// ─── Helper: complete-block presence ─────────────────────────────────────────

/**
 * Returns true when `content` contains a complete bounded block defined by
 * `startMarker` and `endMarker` (both exact strings, \u2014 aware).
 *
 * @param {string} content
 * @param {string} startMarker
 * @param {string} endMarker
 * @returns {boolean}
 */
function _hasCompleteBlock(content, startMarker, endMarker) {
  if (typeof content !== 'string') return false;
  const startIdx = content.indexOf(startMarker);
  if (startIdx === -1) return false;
  const endIdx = content.indexOf(endMarker, startIdx + startMarker.length);
  return endIdx !== -1;
}

// ─── Phase 3: Guarded-turn scope detection ────────────────────────────────────

/**
 * Returns true when the raw user message content indicates a guarded turn:
 * a complete === FORMULATION DEEPENING — THIS TURN ONLY === block is present.
 *
 * Must be called on the RAW persisted user message content (before stripping).
 *
 * @param {string|null|undefined} rawUserContent
 * @returns {boolean}
 */
export function isGuardedTurn(rawUserContent) {
  return _hasCompleteBlock(rawUserContent, FD_START, FD_END);
}

/**
 * Returns true when the raw user message content indicates a Safety Mode turn:
 * a complete === SAFETY MODE — STAGE 2 PHASE 7 === block is present.
 *
 * Safety Mode always takes precedence — a Safety Mode turn is NOT a guarded turn.
 *
 * @param {string|null|undefined} rawUserContent
 * @returns {boolean}
 */
function _isSafetyModeTurn(rawUserContent) {
  return _hasCompleteBlock(rawUserContent, SM_START, SM_END);
}

/**
 * Returns true when the FORMULATION DEEPENING block in the raw user message
 * includes the no-exercise clause (rule 7 in _buildFormulationDeepeningInstruction).
 *
 * @param {string|null|undefined} rawUserContent
 * @returns {boolean}
 */
function _hasNoExerciseClause(rawUserContent) {
  if (typeof rawUserContent !== 'string') return false;
  return rawUserContent.includes('The person has asked not to receive an exercise yet');
}

// ─── Phase 4A: Prohibited certainty phrase detection ─────────────────────────

/**
 * Returns true when the assistant content contains a prohibited certainty phrase.
 * The check is unconditional — tentative prefixes do not exempt these phrases.
 *
 * @param {string} content
 * @returns {boolean}
 */
function _hasProhibitedCertaintyPhrase(content) {
  if (typeof content !== 'string') return false;
  // Hebrew: case-sensitive exact substring
  for (const phrase of PROHIBITED_PHRASES_HE) {
    if (content.includes(phrase)) return true;
  }
  // English: case-insensitive
  const lower = content.toLowerCase();
  for (const phrase of PROHIBITED_PHRASES_EN) {
    if (lower.includes(phrase)) return true;
  }
  return false;
}

// ─── Phase 4B: Deeper hypothesis detection ───────────────────────────────────

/**
 * Returns true when the assistant content contains at least one deeper
 * identity/value/meaning indicator.
 *
 * @param {string} content
 * @returns {boolean}
 */
function _hasDeepHypothesisIndicator(content) {
  if (typeof content !== 'string') return false;
  for (const indicator of DEEPER_INDICATORS_HE) {
    if (content.includes(indicator)) return true;
  }
  const lower = content.toLowerCase();
  for (const indicator of DEEPER_INDICATORS_EN) {
    if (lower.includes(indicator)) return true;
  }
  return false;
}

/**
 * Returns true when the assistant content contains at least one tentative marker.
 *
 * @param {string} content
 * @returns {boolean}
 */
function _hasAnyTentativeMarker(content) {
  if (typeof content !== 'string') return false;
  for (const marker of TENTATIVE_MARKERS_HE) {
    if (content.includes(marker)) return true;
  }
  const lower = content.toLowerCase();
  for (const marker of TENTATIVE_MARKERS_EN) {
    if (lower.includes(marker)) return true;
  }
  return false;
}

/**
 * Returns true when the content explicitly states that personal meaning is
 * still unknown rather than making a deeper hypothesis.
 * When this is true, tentative language is not required.
 *
 * @param {string} content
 * @returns {boolean}
 */
function _statesPersonalMeaningUnknown(content) {
  if (typeof content !== 'string') return false;
  // Hebrew indicators of acknowledged unknown meaning
  const UNKNOWN_INDICATORS_HE = [
    '\u05DE\u05D4 \u05E9\u05E2\u05D3\u05D9\u05D9\u05DF \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2', // מה שעדיין לא ידוע
    '\u05D4\u05DE\u05E9\u05DE\u05E2\u05D5\u05EA \u05D4\u05D0\u05D9\u05E9\u05D9\u05EA \u05E2\u05D3\u05D9\u05D9\u05DF', // המשמעות האישית עדיין
    '\u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2\u05D4 \u05DC\u05D9', // לא ידועה לי
    '\u05E2\u05D3\u05D9\u05D9\u05DF \u05DC\u05D0 \u05D9\u05D3\u05D5\u05E2\u05D4', // עדיין לא ידועה
  ];
  for (const ind of UNKNOWN_INDICATORS_HE) {
    if (content.includes(ind)) return true;
  }
  const lower = content.toLowerCase();
  const UNKNOWN_INDICATORS_EN = [
    'what remains unknown',
    'personal meaning is still unknown',
    'i do not know the personal meaning',
    'the personal meaning is not yet known',
    'still unknown is',
  ];
  for (const ind of UNKNOWN_INDICATORS_EN) {
    if (lower.includes(ind)) return true;
  }
  return false;
}

// ─── Phase 4C: Question count ─────────────────────────────────────────────────

/**
 * Returns the number of question-mark characters in the content.
 * Bounded count only — no semantic question classification.
 *
 * @param {string} content
 * @returns {number}
 */
function _countQuestions(content) {
  if (typeof content !== 'string') return 0;
  let count = 0;
  for (let i = 0; i < content.length; i++) {
    if (content[i] === '?') count++;
  }
  return count;
}

// ─── Phase 4D: Exercise detection ────────────────────────────────────────────

/**
 * Returns true when a term match appears NOT to be negated within the preceding
 * NEGATION_WINDOW_CHARS characters.
 *
 * @param {string} content   Full (lowercased) content
 * @param {number} termIdx   Start index of the matched term
 * @param {string[]} negationPhrases  Negation phrases (already lowercased)
 * @returns {boolean} true → term is an un-negated proposal
 */
function _isTermUnnegated(content, termIdx, negationPhrases) {
  const windowStart = Math.max(0, termIdx - NEGATION_WINDOW_CHARS);
  const window = content.substring(windowStart, termIdx).toLowerCase();
  for (const neg of negationPhrases) {
    if (window.includes(neg)) return false;
  }
  return true;
}

/**
 * Returns true when the assistant content proposes an exercise (un-negated)
 * when the no-exercise clause is active.
 *
 * @param {string} content
 * @returns {boolean}
 */
function _hasExerciseSuggestion(content) {
  if (typeof content !== 'string') return false;
  // Hebrew: case-sensitive (Hebrew script)
  for (const term of EXERCISE_TERMS_HE) {
    let idx = content.indexOf(term);
    while (idx !== -1) {
      if (_isTermUnnegated(content, idx, NEGATION_PHRASES_HE)) return true;
      idx = content.indexOf(term, idx + 1);
    }
  }
  // English: case-insensitive
  const lower = content.toLowerCase();
  for (const term of EXERCISE_TERMS_EN) {
    let idx = lower.indexOf(term);
    while (idx !== -1) {
      if (_isTermUnnegated(lower, idx, NEGATION_PHRASES_EN)) return true;
      idx = lower.indexOf(term, idx + 1);
    }
  }
  return false;
}

// ─── Phase 4E: Internal content leak detection ───────────────────────────────

/**
 * Returns true when the assistant content contains a complete internal runtime
 * marker that must not be exposed to users.
 *
 * @param {string} content
 * @returns {boolean}
 */
function _hasInternalContentLeak(content) {
  if (typeof content !== 'string') return false;
  for (const marker of INTERNAL_MARKER_SUBSTRINGS) {
    if (content.includes(marker)) return true;
  }
  return false;
}

// ─── Phase 4: Bounded response validation ─────────────────────────────────────

/**
 * Evaluates a guarded assistant response against the Formulation-Led clinical
 * contract.
 *
 * Called ONLY for in-scope turns (isGuardedTurn=true, isSafetyModeTurn=false).
 * For out-of-scope turns, do not call this function.
 *
 * @param {string} assistantContent   The sanitized assistant message text.
 * @param {string} rawUserContent     The raw (pre-strip) originating user message.
 * @returns {{ pass: boolean, reasonCodes: string[] }}
 */
export function evaluateFormulationResponseContract(assistantContent, rawUserContent) {
  const reasonCodes = [];

  if (typeof assistantContent !== 'string' || !assistantContent.trim()) {
    // Empty/missing content cannot be a valid formulation-led response.
    return { pass: false, reasonCodes: ['missing_verification_question'] };
  }

  // ── Phase 4E: Internal content leak ────────────────────────────────────────
  if (_hasInternalContentLeak(assistantContent)) {
    reasonCodes.push('internal_instruction_leak');
  }

  // ── Phase 4A: Prohibited certainty phrases ──────────────────────────────────
  if (_hasProhibitedCertaintyPhrase(assistantContent)) {
    reasonCodes.push('prohibited_certainty_phrase');
  }

  // ── Phase 4D: No-exercise rule ──────────────────────────────────────────────
  const noExerciseActive = _hasNoExerciseClause(rawUserContent);
  if (noExerciseActive && _hasExerciseSuggestion(assistantContent)) {
    reasonCodes.push('exercise_proposed_when_blocked');
  }

  // ── Phase 4B + 4C: Deeper hypothesis + tentative marker + question ──────────
  if (_hasDeepHypothesisIndicator(assistantContent)) {
    const hasTentative = _hasAnyTentativeMarker(assistantContent);
    const statesUnknown = _statesPersonalMeaningUnknown(assistantContent);

    if (!hasTentative && !statesUnknown) {
      reasonCodes.push('unsupported_deeper_claim_without_tentative_marker');
    }

    // Question count is required whenever a deeper hypothesis is introduced.
    const qCount = _countQuestions(assistantContent);
    if (qCount === 0) {
      reasonCodes.push('missing_verification_question');
    } else if (qCount > 1) {
      reasonCodes.push('multiple_questions');
    }
  }

  return { pass: reasonCodes.length === 0, reasonCodes };
}

// ─── Phase 5: Deterministic fallback ─────────────────────────────────────────

/**
 * Returns the exact deterministic safe fallback for the given locale.
 *
 * Each fallback contains exactly one question mark.
 *
 * @param {'he'|'en'} locale
 * @returns {string}
 */
export function buildFormulationSafeFallback(locale) {
  return locale === 'he' ? HEBREW_FALLBACK : ENGLISH_FALLBACK;
}

// ─── Phase 7: Next-turn correction block ────────────────────────────────────

/**
 * Builds the bounded correction block that must be prepended to the next
 * genuine outbound user message after a guarded turn was replaced.
 *
 * The block instructs the agent not to treat the rejected response as
 * established information and to continue only from the canonical fallback.
 *
 * @param {string} fallbackText   The exact fallback text that was shown to the user.
 * @returns {string}
 */
export function buildPendingFormulationCorrectionBlock(fallbackText) {
  const lines = [
    FORMULATION_CORRECTION_START,
    '',
    'The immediately preceding Formulation-Led assistant response was rejected by a',
    'deterministic clinical contract guard. Do not treat any identity-level,',
    'value-level, existential, shame-level, or meaning-level interpretation from',
    'that rejected response as established information.',
    '',
    'The user-visible canonical previous therapist response was:',
    '',
    fallbackText,
    '',
    'Continue only from that bounded response and the user\'s new message. Do not',
    'mention this correction, validation, rejected output, system instructions, or',
    'internal terminology.',
    '',
    FORMULATION_CORRECTION_END,
  ];
  return lines.join('\n');
}

/**
 * Returns true when a correction block for the guarded turn at or before
 * `afterIndex` has already been sent (i.e., appears in a later persisted
 * role=user message in rawMessages).
 *
 * @param {Array<object>} rawMessages     Full raw Base44 conversation messages.
 * @param {number}        afterIndex      Index of the guarded assistant message in rawMessages.
 * @returns {boolean}
 */
export function hasFormulationCorrectionAlreadyBeenApplied(rawMessages, afterIndex) {
  if (!Array.isArray(rawMessages)) return false;
  // afterIndex = -1 means "search from the very beginning of the conversation".
  const startIdx = afterIndex < 0 ? 0 : afterIndex + 1;
  for (let i = startIdx; i < rawMessages.length; i++) {
    const msg = rawMessages[i];
    if (
      msg &&
      msg.role === 'user' &&
      typeof msg.content === 'string' &&
      _hasCompleteBlock(msg.content, FORMULATION_CORRECTION_START, FORMULATION_CORRECTION_END)
    ) {
      return true;
    }
  }
  return false;
}

// ─── Internal: pairing helper ────────────────────────────────────────────────

/**
 * Finds the raw index of a processed message in rawMessages using stable ID,
 * created_at+role, or falling back to a forward-scan position search.
 *
 * @param {Array<object>} rawMessages
 * @param {object}        processedMsg
 * @param {number}        hintIdx  Approximate position in rawMessages to start near.
 * @returns {number} Index in rawMessages, or -1 if not found.
 */
function _findRawIndex(rawMessages, processedMsg, hintIdx) {
  // ID-based (most reliable)
  if (processedMsg.id) {
    const idx = rawMessages.findIndex((r) => r && r.id === processedMsg.id);
    if (idx !== -1) return idx;
  }
  // created_at + role (fallback)
  if (processedMsg.created_at) {
    const idx = rawMessages.findIndex(
      (r) => r && r.created_at === processedMsg.created_at && r.role === processedMsg.role
    );
    if (idx !== -1) return idx;
  }
  // Position hint (last resort for test fixtures without IDs)
  if (hintIdx >= 0 && hintIdx < rawMessages.length) {
    const candidate = rawMessages[hintIdx];
    if (candidate && candidate.role === processedMsg.role) return hintIdx;
  }
  return -1;
}

/**
 * Finds the immediately preceding persisted role=user message in rawMessages
 * before the given index.
 *
 * @param {Array<object>} rawMessages
 * @param {number}        beforeIdx  Index in rawMessages to search before.
 * @returns {object|null}
 */
function _findPrecedingRawUser(rawMessages, beforeIdx) {
  for (let i = beforeIdx - 1; i >= 0; i--) {
    if (rawMessages[i] && rawMessages[i].role === 'user') return rawMessages[i];
  }
  return null;
}

// ─── Phase 6: Centralized guard application ───────────────────────────────────

/**
 * Applies the formulation contract guard to a final processed message array.
 *
 * Steps:
 * 1. For each assistant message in `finalMessages`, locate its raw counterpart
 *    in `rawMessages` and find the immediately preceding raw user message.
 * 2. If that user message is a guarded turn (FORMULATION DEEPENING block present,
 *    no SAFETY MODE block), evaluate the assistant content.
 * 3. If the content violates the contract, replace it with the deterministic
 *    fallback. The original message ID, role, created_at, and ordering are
 *    preserved; only `content` and `metadata.formulation_guard_replaced` /
 *    `metadata.formulation_guard_reason_codes` are changed.
 * 4. Track the most recent replaced turn and check whether a correction block
 *    was already sent for it.
 *
 * The function never mutates its inputs.
 * The function is deterministic and idempotent.
 * For locales other than 'he' or 'en', the function returns finalMessages unchanged.
 *
 * @param {Array<object>}  rawMessages     Original Base44 messages (full content).
 * @param {Array<object>}  finalMessages   Sanitized + processed messages (null-free).
 * @param {object}         [options]
 * @param {'he'|'en'|string} [options.locale='en']  Session locale.
 * @returns {{
 *   messages: Array<object>,
 *   pendingCorrection: { fallbackText: string, locale: 'he'|'en' } | null
 * }}
 */
export function applyFormulationGuardToConversationMessages(
  rawMessages,
  finalMessages,
  options
) {
  const locale = (typeof options?.locale === 'string' ? options.locale : 'en');
  const effectiveLocale = locale.startsWith('he') ? 'he' : 'en';

  // Guard is only defined for Hebrew and English.
  if (effectiveLocale !== 'he' && effectiveLocale !== 'en') {
    return { messages: finalMessages, pendingCorrection: null };
  }

  if (!Array.isArray(rawMessages) || !Array.isArray(finalMessages)) {
    return { messages: Array.isArray(finalMessages) ? finalMessages : [], pendingCorrection: null };
  }

  const result = [];
  let lastReplacedRawIdx = -1;
  let lastReplacedFallback = null;

  // Track the processed message index to provide a position hint for _findRawIndex
  let processedMsgCount = 0;

  for (let fi = 0; fi < finalMessages.length; fi++) {
    const msg = finalMessages[fi];

    // Only guard assistant messages
    if (!msg || msg.role !== 'assistant' || typeof msg.content !== 'string') {
      result.push(msg);
      if (msg) processedMsgCount++;
      continue;
    }

    // Find the raw counterpart to get the preceding user message
    const rawIdx = _findRawIndex(rawMessages, msg, fi);
    const precedingRawUser = rawIdx !== -1 ? _findPrecedingRawUser(rawMessages, rawIdx) : null;

    const rawUserContent = precedingRawUser ? precedingRawUser.content : null;

    // Determine scope
    const guarded = rawUserContent !== null && isGuardedTurn(rawUserContent);
    const safetyMode = rawUserContent !== null && _isSafetyModeTurn(rawUserContent);

    if (!guarded || safetyMode) {
      // Out of scope — pass through unchanged
      result.push(msg);
      processedMsgCount++;
      continue;
    }

    // Already guarded_replaced (idempotency): do not re-evaluate
    if (msg.metadata?.formulation_guard_replaced === true) {
      result.push(msg);
      processedMsgCount++;
      // Still track as a replaced turn for pending correction logic
      if (rawIdx !== -1) {
        lastReplacedRawIdx = rawIdx;
        lastReplacedFallback = String(msg.content); // content is already the fallback
      }
      continue;
    }

    // Evaluate the assistant response
    const evaluation = evaluateFormulationResponseContract(msg.content, rawUserContent);

    if (evaluation.pass) {
      result.push(msg);
      processedMsgCount++;
      continue;
    }

    // ── Contract violated: replace with deterministic fallback ────────────────
    const fallbackText = buildFormulationSafeFallback(effectiveLocale);
    const replacedMsg = {
      ...msg,
      content: fallbackText,
      metadata: {
        ...(msg.metadata || {}),
        formulation_guard_replaced: true,
        formulation_guard_reason_codes: evaluation.reasonCodes,
      },
    };
    result.push(replacedMsg);
    processedMsgCount++;

    if (rawIdx !== -1) {
      lastReplacedRawIdx = rawIdx;
      lastReplacedFallback = fallbackText;
    }
  }

  // ── Determine pendingCorrection ───────────────────────────────────────────
  let pendingCorrection = null;
  if (lastReplacedRawIdx !== -1 && lastReplacedFallback !== null) {
    const alreadyApplied = hasFormulationCorrectionAlreadyBeenApplied(
      rawMessages,
      lastReplacedRawIdx
    );
    if (!alreadyApplied) {
      pendingCorrection = {
        fallbackText: lastReplacedFallback,
        locale: effectiveLocale,
      };
    }
  }

  return { messages: result, pendingCorrection };
}

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
 *   === FORMULATION DEEPENING — THIS TURN ONLY === block or a complete
 *   === FORMULATION CONTRACT CORRECTION — NEXT TURN ONLY === block.
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
 * conclusion_drawn_when_explicitly_blocked
 * unsupported_current_turn_grounding_claim
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

const INITIAL_FORMULATION_GUARD_MODE = 'initial_formulation';
const CORRECTION_FOLLOWUP_GUARD_MODE = 'correction_followup';

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

const HEBREW_CONTINUATION_FALLBACK =
  'אני שומע שהחלק הקשה ביותר הוא המחשבה "אני לא מספיק טוב".\nמה שכבר ברור הוא שהמחשבה הזאת מכאיבה; מה שעדיין לא ברור הוא אם\nהיא מופיעה בעיקר סביב ביצועים ומשימות או משקפת משהו רחב יותר,\nואני לא רוצה לקבוע זאת בלי לבדוק איתך. האם המחשבה הזאת עולה\nבעיקר כשאתה נדרש להוכיח יכולת, או גם במצבים אחרים?';

const ENGLISH_CONTINUATION_FALLBACK =
  'I hear that the hardest part is the thought, "I am not good enough." What is\nalready clear is that this thought is painful; what remains unclear is whether\nit appears mainly around performance and tasks or reflects something broader,\nand I do not want to decide that without checking with you. Does this thought\ncome up mainly when you have to prove your ability, or in other situations\ntoo?';

const HEBREW_CURRENT_TURN_GROUNDING_FALLBACK =
  'אין עדיין מספיק מידע כדי לקבוע מה גורם למתח הזה. מה הדבר הראשון שעובר לך בראש או בגוף ברגע שבו המתח מתחיל?';

const ENGLISH_CURRENT_TURN_GROUNDING_FALLBACK =
  'There is not yet enough information to determine what is causing this tension. What is the first thing that goes through your mind or body at the moment the tension starts?';

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

const EXPLICIT_CONCLUSION_BLOCKERS_HE = [
  'אל תקבע עדיין מסקנה',
  'בלי לקבוע מסקנה',
  'אל תסיק עדיין מסקנה',
];

const EXPLICIT_CONCLUSION_BLOCKERS_EN = [
  'do not draw a conclusion yet',
  "don't draw a conclusion yet",
  'do not reach a conclusion yet',
  'without drawing a conclusion',
];

const BLOCKED_CONCLUSION_PHRASES_HE = [
  'זה המקום שבו כל הדפוס נמצא',
  'זה המקום שבו הדפוס כולו נמצא',
  'זה לא פרפקציוניזם',
  'זה משהו הרבה יותר אישי',
  'זה הפך למקום שבו משהו עליך יכול להיות מוכח',
];

const BLOCKED_CONCLUSION_PHRASES_EN = [
  'this is where the whole pattern lives',
  'this is where this whole pattern lives',
  "that's not perfectionism",
  'that is not perfectionism',
  'this is something much more personal',
  'became a place where something about you could be confirmed',
];

const EXPLICIT_NO_EXERCISE_REQUESTS_HE = [
  'אל תציע לי תרגיל',
  'בלי תרגיל',
  'ללא תרגיל',
  'אל תיתן לי תרגיל',
];

const EXPLICIT_NO_EXERCISE_REQUESTS_EN = [
  'do not give me an exercise',
  "don't give me an exercise",
  'do not suggest an exercise',
  "don't suggest an exercise",
  'no exercise yet',
  'without an exercise',
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

const CURRENT_TURN_TENTATIVE_EXTRA_HE = ['אולי', 'יכול להיות', 'ייתכן'];
const CURRENT_TURN_TENTATIVE_EXTRA_EN = ['maybe', 'perhaps', 'might', 'could it be', 'it may be'];

const CURRENT_TURN_GROUNDING_CLAIM_GROUPS = [
  {
    id: 'causal',
    assistantTerms: [
      'because',
      'this explains',
      'that explains',
      'therefore',
      'that is why',
      'נובע מ',
      'בגלל ש',
      'לכן',
      'זה מסביר',
      'הסיבה היא',
    ],
    userTerms: ['because', 'בגלל', 'הסיבה'],
  },
  {
    id: 'identity',
    assistantTerms: [
      'identity',
      'who you are',
      'self-worth',
      'value as a person',
      'זהות',
      'ערך עצמי',
      'מי שאתה',
      'מי אתה',
    ],
    userTerms: [
      'identity',
      'who i am',
      'who you are',
      'self-worth',
      'value as a person',
      'זהות',
      'ערך עצמי',
      'מי אני',
      'מי אתה',
    ],
  },
  {
    id: 'relationship_meaning',
    assistantTerms: [
      'damage the relationship',
      'harm the relationship',
      'closeness raises the stakes',
      'higher stakes',
      'emotional availability',
      'rejection',
      'relationship',
      'לפגוע בקשר',
      'לפגוע במערכת היחסים',
      'הקשר ייפגע',
      'הקרבה מעלה את המחיר',
      'זמינות רגשית',
      'דחייה',
      'מערכת היחסים',
      'הקשר',
    ],
    userTerms: [
      'relationship',
      'partner',
      'spouse',
      'marriage',
      'boyfriend',
      'girlfriend',
      'husband',
      'wife',
      'rejection',
      'system of relationship',
      'מערכת יחסים',
      'בן זוג',
      'בת זוג',
      'זוגיות',
      'נישואים',
      'דחייה',
      'הקשר',
      'לפגוע בקשר',
    ],
  },
  {
    id: 'danger',
    assistantTerms: [
      'danger',
      'threat',
      'unsafe',
      'risk',
      'catastrophe',
      'סכנה',
      'איום',
      'מסוכן',
      'סיכון',
      'קטסטרופה',
    ],
    userTerms: [
      'danger',
      'threat',
      'unsafe',
      'risk',
      'afraid',
      'fear',
      'סכנה',
      'איום',
      'מסוכן',
      'סיכון',
      'מפחד',
      'פחד',
    ],
  },
  {
    id: 'perfection_correctness',
    assistantTerms: [
      'right response',
      'right answer',
      'perfect',
      'perfection',
      'correctness',
      'good enough',
      'must be right',
      'תגובה נכונה',
      'תשובה נכונה',
      'מושלם',
      'פרפקציוניזם',
      'לא מספיק טוב',
      'חייב להיות נכון',
    ],
    userTerms: [
      'right response',
      'right answer',
      'perfect',
      'perfection',
      'correct',
      'good enough',
      'תגובה נכונה',
      'תשובה נכונה',
      'מושלם',
      'פרפקציוניזם',
      'לא מספיק טוב',
      'נכון',
    ],
  },
  {
    id: 'maintaining_cycle',
    assistantTerms: [
      'maintaining cycle',
      'vicious cycle',
      'cycle',
      'loop',
      'avoidance keeps',
      'avoidance',
      'delay',
      'delaying',
      'pattern lives',
      'דפוס משמר',
      'מעגל',
      'לופ',
      'הדפוס עובד כך',
      'זה משמר',
      'הימנעות משמרת',
      'הימנעות',
    ],
    userTerms: [
      'cycle',
      'loop',
      'pattern',
      'avoidance',
      'maintain',
      'delay',
      'delays',
      'delayed',
      'repeated checking',
      'checking again',
      'מעגל',
      'לופ',
      'דפוס',
      'הימנעות',
      'משמר',
      'מתעכב',
      'מתעכבת',
      'עיכוב',
      'בדיקה חוזרת',
      'בודק שוב',
    ],
  },
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

function _stripCompleteBlock(content, startMarker, endMarker) {
  if (typeof content !== 'string' || !content) return content;

  let result = content;
  let startIdx = result.indexOf(startMarker);
  while (startIdx !== -1) {
    const endIdx = result.indexOf(endMarker, startIdx + startMarker.length);
    if (endIdx === -1) break;
    result = `${result.slice(0, startIdx)}${result.slice(endIdx + endMarker.length)}`;
    startIdx = result.indexOf(startMarker);
  }

  return result;
}

function _getVisibleUserContent(rawUserContent) {
  if (typeof rawUserContent !== 'string') return '';

  return _stripCompleteBlock(
    _stripCompleteBlock(
      _stripCompleteBlock(rawUserContent, FD_START, FD_END),
      FORMULATION_CORRECTION_START,
      FORMULATION_CORRECTION_END
    ),
    SM_START,
    SM_END
  ).trim();
}

/**
 * Classifies the raw user message for bounded formulation guarding.
 *
 * Safety Mode always supersedes formulation guarding.
 *
 * @param {string|null|undefined} rawUserContent
 * @returns {'initial_formulation'|'correction_followup'|null}
 */
export function classifyFormulationGuardedTurn(rawUserContent) {
  if (_isSafetyModeTurn(rawUserContent)) return null;
  if (_hasCompleteBlock(rawUserContent, FD_START, FD_END)) {
    return INITIAL_FORMULATION_GUARD_MODE;
  }
  if (_hasCompleteBlock(rawUserContent, FORMULATION_CORRECTION_START, FORMULATION_CORRECTION_END)) {
    return CORRECTION_FOLLOWUP_GUARD_MODE;
  }
  return null;
}

/**
 * Compatibility wrapper for existing callers that only need a boolean.
 *
 * @param {string|null|undefined} rawUserContent
 * @returns {boolean}
 */
export function isGuardedTurn(rawUserContent) {
  return classifyFormulationGuardedTurn(rawUserContent) !== null;
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

function _hasExplicitNoExerciseRequest(rawUserContent) {
  const visibleUserContent = _getVisibleUserContent(rawUserContent);
  if (!visibleUserContent) return false;

  for (const phrase of EXPLICIT_NO_EXERCISE_REQUESTS_HE) {
    if (visibleUserContent.includes(phrase)) return true;
  }

  const lower = visibleUserContent.toLowerCase();
  for (const phrase of EXPLICIT_NO_EXERCISE_REQUESTS_EN) {
    if (lower.includes(phrase)) return true;
  }

  return false;
}

function _hasNoExerciseRestriction(rawUserContent, guardMode) {
  if (_hasNoExerciseClause(rawUserContent)) return true;
  return guardMode === CORRECTION_FOLLOWUP_GUARD_MODE && _hasExplicitNoExerciseRequest(rawUserContent);
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

function _hasCurrentTurnTentativeMarker(content) {
  if (_hasAnyTentativeMarker(content)) return true;
  if (typeof content !== 'string') return false;

  for (const marker of CURRENT_TURN_TENTATIVE_EXTRA_HE) {
    if (content.includes(marker)) return true;
  }

  const lower = content.toLowerCase();
  for (const marker of CURRENT_TURN_TENTATIVE_EXTRA_EN) {
    if (lower.includes(marker)) return true;
  }
  return false;
}

function _containsAnyTerm(content, terms) {
  if (typeof content !== 'string') return false;
  const lower = content.toLowerCase();
  for (const term of terms) {
    const normalized = String(term || '');
    if (!normalized) continue;
    if (content.includes(normalized)) return true;
    if (lower.includes(normalized.toLowerCase())) return true;
  }
  return false;
}

// ─── Current-turn grounding: context-aware helpers ────────────────────────────

/**
 * Splits text into individual sentences on sentence-ending punctuation + whitespace.
 * When no sentence boundary is found the whole text is returned as one element.
 *
 * @param {string} text
 * @returns {string[]}
 */
function _splitSentences(text) {
  if (typeof text !== 'string' || !text.trim()) return [];
  const parts = text.split(/[.!?]+\s+/);
  return parts.filter(s => s.trim().length > 0);
}

/**
 * Extended negation prefixes used when checking user-supplied content.
 * Only imperative/instructional negations are used to avoid treating
 * negative self-descriptions like "I am not good enough" as un-grounded.
 * Hebrew: אל (imperative don't), בלי (without)
 * English: don't, do not, without — but NOT bare "not" (too broad).
 */
const _USER_NEGATION_PHRASES_HE = ['אל ', 'בלי '];
const _USER_NEGATION_PHRASES_EN = ["don't ", "do not ", 'without '];

/**
 * Returns true only when `content` contains at least one term from `terms` and
 * that occurrence is NOT preceded by a negation phrase within the negation window.
 * This ensures instructions like "אל תציג X כסכנה" are not treated as affirmative
 * user evidence for the claim.
 *
 * @param {string} content
 * @param {string[]} terms
 * @returns {boolean}
 */
function _containsAnyTermAffirmative(content, terms) {
  if (typeof content !== 'string') return false;
  const lower = content.toLowerCase();
  for (const term of terms) {
    const normalized = String(term || '');
    if (!normalized) continue;
    const normLower = normalized.toLowerCase();
    let idx = lower.indexOf(normLower);
    while (idx !== -1) {
      const windowStart = Math.max(0, idx - NEGATION_WINDOW_CHARS);
      const windowBefore = lower.slice(windowStart, idx);
      const negated =
        _USER_NEGATION_PHRASES_HE.some(n => windowBefore.includes(n)) ||
        _USER_NEGATION_PHRASES_EN.some(n => windowBefore.includes(n));
      if (!negated) return true;
      idx = lower.indexOf(normLower, idx + 1);
    }
  }
  return false;
}

/**
 * Trigger phrases that activate strict grounding mode.
 * When the user explicitly asks for current-information-only analysis, tentative
 * language does not exempt unsupported causal or relational claims.
 */
const STRICT_GROUNDING_TRIGGERS_HE = ['התייחס למה שקורה עכשיו בלבד'];
const STRICT_GROUNDING_TRIGGERS_EN = ['current information only'];

/**
 * Returns true when the raw user content contains a strict-grounding trigger.
 *
 * @param {string|null|undefined} rawUserContent
 * @returns {boolean}
 */
function _isStrictGroundingMode(rawUserContent) {
  const visible = _getVisibleUserContent(rawUserContent);
  if (!visible) return false;
  if (STRICT_GROUNDING_TRIGGERS_HE.some(t => visible.includes(t))) return true;
  const lower = visible.toLowerCase();
  return STRICT_GROUNDING_TRIGGERS_EN.some(t => lower.includes(t));
}

function _hasUnsupportedCurrentTurnGroundingClaim(assistantContent, rawUserContent, strictMode) {
  if (typeof assistantContent !== 'string' || !assistantContent.trim()) return false;
  const visibleUser = _getVisibleUserContent(rawUserContent);
  if (!visibleUser) return false;

  const sentences = _splitSentences(assistantContent);

  for (const group of CURRENT_TURN_GROUNDING_CLAIM_GROUPS) {
    if (_containsAnyTermAffirmative(visibleUser, group.userTerms)) continue;
    for (const sentence of sentences) {
      if (!_containsAnyTerm(sentence, group.assistantTerms)) continue;
      if (!strictMode && _hasCurrentTurnTentativeMarker(sentence)) continue;
      return true;
    }
  }

  return false;
}

export function evaluateCurrentTurnGroundingContract(assistantContent, rawUserContent) {
  if (typeof assistantContent !== 'string' || !assistantContent.trim()) {
    return { pass: true, reasonCodes: [] };
  }

  const strictMode = _isStrictGroundingMode(rawUserContent);
  if (_hasUnsupportedCurrentTurnGroundingClaim(assistantContent, rawUserContent, strictMode)) {
    return { pass: false, reasonCodes: ['unsupported_current_turn_grounding_claim'] };
  }

  return { pass: true, reasonCodes: [] };
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

function _hasExplicitConclusionBlocker(rawUserContent, guardMode) {
  if (guardMode !== CORRECTION_FOLLOWUP_GUARD_MODE) return false;

  const visibleUserContent = _getVisibleUserContent(rawUserContent);
  if (!visibleUserContent) return false;

  for (const phrase of EXPLICIT_CONCLUSION_BLOCKERS_HE) {
    if (visibleUserContent.includes(phrase)) return true;
  }

  const lower = visibleUserContent.toLowerCase();
  for (const phrase of EXPLICIT_CONCLUSION_BLOCKERS_EN) {
    if (lower.includes(phrase)) return true;
  }

  return false;
}

function _hasBlockedConclusionPhrase(content) {
  if (typeof content !== 'string') return false;

  for (const phrase of BLOCKED_CONCLUSION_PHRASES_HE) {
    if (content.includes(phrase)) return true;
  }

  const lower = content.toLowerCase();
  for (const phrase of BLOCKED_CONCLUSION_PHRASES_EN) {
    if (lower.includes(phrase)) return true;
  }

  return false;
}

// ─── Phase 4: Bounded response validation ─────────────────────────────────────

/**
 * Evaluates a guarded assistant response against the Formulation-Led clinical
 * contract.
 *
 * Called ONLY for in-scope guarded turns.
 * For out-of-scope turns, do not call this function.
 *
 * @param {string} assistantContent   The sanitized assistant message text.
 * @param {string} rawUserContent     The raw (pre-strip) originating user message.
 * @param {'initial_formulation'|'correction_followup'} [guardMode='initial_formulation']
 * @returns {{ pass: boolean, reasonCodes: string[] }}
 */
export function evaluateFormulationResponseContract(
  assistantContent,
  rawUserContent,
  guardMode = INITIAL_FORMULATION_GUARD_MODE
) {
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
  const noExerciseActive = _hasNoExerciseRestriction(rawUserContent, guardMode);
  if (noExerciseActive && _hasExerciseSuggestion(assistantContent)) {
    reasonCodes.push('exercise_proposed_when_blocked');
  }

  // ── Phase 4B + 4C: Deeper hypothesis + tentative marker + question ──────────
  if (
    _hasExplicitConclusionBlocker(rawUserContent, guardMode) &&
    _hasBlockedConclusionPhrase(assistantContent)
  ) {
    reasonCodes.push('conclusion_drawn_when_explicitly_blocked');
  }

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
 * @param {'initial_formulation'|'correction_followup'} [guardMode='initial_formulation']
 * @returns {string}
 */
export function buildFormulationSafeFallback(
  locale,
  guardMode = INITIAL_FORMULATION_GUARD_MODE
) {
  if (guardMode === CORRECTION_FOLLOWUP_GUARD_MODE) {
    return locale === 'he' ? HEBREW_CONTINUATION_FALLBACK : ENGLISH_CONTINUATION_FALLBACK;
  }

  return locale === 'he' ? HEBREW_FALLBACK : ENGLISH_FALLBACK;
}

export function buildCurrentTurnGroundingFallback(locale) {
  return locale === 'he'
    ? HEBREW_CURRENT_TURN_GROUNDING_FALLBACK
    : ENGLISH_CURRENT_TURN_GROUNDING_FALLBACK;
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
 * 1. For each assistant message in `finalMessages`, use the same array index in
 *    `rawMessages` and find the immediately preceding raw user message.
 * 2. If that user message is a guarded turn, evaluate the assistant content.
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
 * @param {Array<object>}  finalMessages   Sanitized + processed messages (raw-index aligned).
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

  for (let fi = 0; fi < finalMessages.length; fi++) {
    const msg = finalMessages[fi];

    // Only guard assistant messages
    if (!msg || msg.role !== 'assistant' || typeof msg.content !== 'string') {
      result.push(msg);
      continue;
    }

    // Canonical production contract: processed index must match raw index.
    const rawIdx = fi >= 0 && fi < rawMessages.length ? fi : -1;
    const precedingRawUser = rawIdx !== -1 ? _findPrecedingRawUser(rawMessages, rawIdx) : null;

    const rawUserContent = precedingRawUser ? precedingRawUser.content : null;

    const guardMode = rawUserContent !== null
      ? classifyFormulationGuardedTurn(rawUserContent)
      : null;

    if (!guardMode) {
      result.push(msg);
      continue;
    }

    // Already guarded_replaced (idempotency): do not re-evaluate
    if (msg.metadata?.formulation_guard_replaced === true) {
      result.push(msg);
      // Still track as a replaced turn for pending correction logic
      if (rawIdx !== -1) {
        lastReplacedRawIdx = rawIdx;
        lastReplacedFallback = String(msg.content); // content is already the fallback
      }
      continue;
    }

    // Evaluate the assistant response
    const evaluation = evaluateFormulationResponseContract(msg.content, rawUserContent, guardMode);

    if (evaluation.pass) {
      result.push(msg);
      continue;
    }

    // ── Contract violated: replace with deterministic fallback ────────────────
    const fallbackText = buildFormulationSafeFallback(effectiveLocale, guardMode);
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

/**
 * Applies deterministic current-turn grounding validation using only the
 * immediate preceding user message for each assistant turn.
 *
 * If an unsupported causal/identity/relationship/danger/perfection/cycle claim
 * is presented as known fact, the message is replaced with a localized neutral
 * fallback that keeps uncertainty explicit and asks at most one event-level
 * question.
 *
 * @param {Array<object>} rawMessages
 * @param {Array<object>} finalMessages
 * @param {object} [options]
 * @param {'he'|'en'|string} [options.locale='en']
 * @returns {Array<object>}
 */
export function applyCurrentTurnGroundingGuardToConversationMessages(
  rawMessages,
  finalMessages,
  options
) {
  const locale = (typeof options?.locale === 'string' ? options.locale : 'en');
  const effectiveLocale = locale.startsWith('he') ? 'he' : 'en';

  if (!Array.isArray(rawMessages) || !Array.isArray(finalMessages)) {
    return Array.isArray(finalMessages) ? finalMessages : [];
  }

  const result = [];
  for (let fi = 0; fi < finalMessages.length; fi++) {
    const msg = finalMessages[fi];

    if (!msg || msg.role !== 'assistant' || typeof msg.content !== 'string') {
      result.push(msg);
      continue;
    }

    if (msg.metadata?.current_turn_grounding_guard_replaced === true) {
      result.push(msg);
      continue;
    }

    // Skip messages already replaced by the formulation guard — those
    // fallbacks are carefully crafted clinical responses that must not
    // be re-evaluated by the grounding guard.
    if (msg.metadata?.formulation_guard_replaced === true) {
      result.push(msg);
      continue;
    }

    const rawIdx = fi >= 0 && fi < rawMessages.length ? fi : -1;
    const precedingRawUser = rawIdx !== -1 ? _findPrecedingRawUser(rawMessages, rawIdx) : null;
    const rawUserContent = precedingRawUser ? precedingRawUser.content : null;
    const evaluation = evaluateCurrentTurnGroundingContract(msg.content, rawUserContent);

    if (evaluation.pass) {
      result.push(msg);
      continue;
    }

    const fallbackText = buildCurrentTurnGroundingFallback(effectiveLocale);
    result.push({
      ...msg,
      content: fallbackText,
      metadata: {
        ...(msg.metadata || {}),
        current_turn_grounding_guard_replaced: true,
        current_turn_grounding_guard_reason_codes: evaluation.reasonCodes,
      },
    });
  }

  return result;
}

/**
 * FINAL USER-VISIBLE RESPONSE GOVERNOR (CP12)
 *
 * This is the LAST gate before any assistant message reaches the user.
 * No upstream path may bypass it.
 *
 * Rules enforced:
 *   A. Internal leakage hard block (tool names, schema labels, reasoning, mixed-language internal text)
 *   B. Directive-first enforcement (strip ask-back, worksheet drift, belief-rating requests)
 *   C. One bounded next step
 *   D. Session-type routing compression
 *   E. Fail-closed
 *   HE. Hebrew semantic anti-worksheet REWRITE (Hebrew sessions only)
 *       — phrase stripping was insufficient; if worksheet drift is detected semantically,
 *         the entire draft is DISCARDED and replaced with a clean directive-first Hebrew response.
 */

import { sanitizeMessageContent } from './messageContentSanitizer';

// --- Failsafes ---

const FAILSAFE = {
  he: 'אני כאן איתך. מה הכי מטריד אותך כרגע?',
  en: "I'm here with you. What's on your mind right now?",
  es: "Estoy aquí contigo. ¿Qué tienes en mente ahora mismo?",
  fr: "Je suis là pour toi. Qu'est-ce qui te préoccupe en ce moment?",
  de: 'Ich bin hier für dich. Was beschäftigt dich gerade?',
  it: 'Sono qui con te. Cosa hai in mente in questo momento?',
  pt: 'Estou aqui com você. O que está em sua mente agora?',
};

function getFailsafe(lang) {
  return FAILSAFE[lang] || FAILSAFE['en'];
}

// --- Ask-back / worksheet-drift patterns ---

const ASK_BACK_LINE_PATTERNS = [
  // English ask-back
  /what do you think\??$/i,
  /what are your thoughts\??$/i,
  /does (?:this|that) feel (?:possible|manageable|right|okay)\??$/i,
  /does (?:this|that) sound (?:possible|manageable|right|okay)\??$/i,
  /would you (?:like|be willing) to try\??$/i,
  /which (?:option|one) feels (?:right|best|most right)\??$/i,
  /what would (?:feel|be) most helpful\??$/i,
  /(?:it's|it is) (?:really )?up to you\.?$/i,
  /would (?:it be okay|you be open) (?:if|to)\b/i,
  /how does that sound\??$/i,
  /where (?:would you like|should we) (?:start|begin)\??$/i,
  /what (?:would you like|do you want) to (?:work on|focus on)\??$/i,
  /(?:shall|should) we\b.*\?$/i,
  /can you (?:tell me more|describe|walk me through|share more)\b/i,
  /tell me more about\b/i,
  /help me understand\b/i,
  /what (?:specific|exactly)\b.*\?$/i,
  /what (?:were you|happened|made you)\b.*\?$/i,

  // Worksheet openers
  /^evidence[- ]for\s*:/i,
  /^evidence[- ]against\s*:/i,
  /^automatic thought\s*:/i,
  /^balanced thought\s*:/i,
  /^situation\s*:/i,
  /rate your belief\b/i,
  /on a scale of \d/i,
  /how strongly do you believe\b/i,
  /belief rating\b/i,

  // Hebrew ask-back
  /מה (?:את|אתה) חושב(?:ת)?\??$/,
  /האם זה (?:מרגיש|נראה) (?:אפשרי|ניהולי|נכון)\??$/,
  /האם תרצ(?:ה|י) לנסות\??$/,
  /מה הייתה מעדיפ(?:ה|)?\??$/,
  /זה תלוי בך\.?$/,
  /תספר(?:י)? לי יותר\b/,
  /מה בדיוק\b.*\?$/,
  /מה הכי (?:יעזור|ירגיש נכון)\??$/,
  /מאיפה (?:כדאי|נתחיל)\??$/,

  // Spanish ask-back
  /qué (?:te parece|piensas|opinas)\??$/i,
  /te (?:gustaría|animas a) intentar\??$/i,
  /depende de ti\.?$/i,
  /por dónde (?:quieres|vamos a) empezar\??$/i,

  // French ask-back
  /qu['']est-ce que tu en penses\??$/i,
  /c['']est toi qui décides\.?$/i,
  /par où (?:veux-tu|on) commencer\??$/i,

  // German ask-back
  /was denkst du\??$/i,
  /das liegt bei dir\.?$/i,
  /wo (?:sollen|willst du) (?:wir )?anfangen\??$/i,

  // Italian / Portuguese ask-back
  /cosa ne pensi\??$/i,
  /dipende da te\.?$/i,
  /o que (?:você acha|pensa)\??$/i,
  /depende de você\.?$/i,
];

// --- Session-type routing compression patterns ---

const WORKSHEET_BLOCK_PATTERNS = [
  /^evidence[- ]for\s*:/im,
  /^evidence[- ]against\s*:/im,
  /^automatic thought\s*:/im,
  /^balanced thought\s*:/im,
  /^belief rating\s*:/im,
  /^situation\s*:\s+/im,
];

const ROUTING_COMPRESSION_PATTERNS = [
  /\bThis (?:is a|looks like|seems like) (?:a |an )?(?:WORK_TASK|DRIVING|SOCIAL|WORRY|SLEEP|PANIC|EXAM|GENERAL|MOOD) (?:domain|scenario|session|path)\b/i,
  /\bI(?:'ll| will) (?:route|classify|apply|use) (?:the |this )?(?:WORK_TASK|DRIVING|SOCIAL|WORRY|SLEEP|PANIC)/i,
  /\b(?:LOCKED_DOMAIN|LOCKED DOMAIN)\s*[:=]\s*\[?\w+\]?/i,
  /\bDomain\s*[:=]\s*\[?\w+\]?/i,
];

// ============================================================
// HEBREW SEMANTIC ANTI-WORKSHEET REWRITE SYSTEM
// ============================================================
//
// Phrase-level stripping was insufficient because the model
// produces worksheet behavior in new wording each time.
// Solution: semantic drift detection + full draft replacement.
//
// Detection: any ONE of these signals triggers full rewrite.
// Replacement: context-typed directive-first Hebrew output.
// ============================================================

// Long-term distress path signals — triggers when user asks "what's next" / "long term"
// and the draft returns tracking/logging homework instead of a same-day action.
const HE_LONGTERM_NEXT_STEP_SIGNALS = [
  /(?:מה\s+השלב\s+הבא|שלב\s+הבא\s+הוא|הצעד\s+הבא)/,
  /(?:לאורך\s+זמן|לטווח\s+(?:ארוך|רחוק)|בטווח\s+(?:הארוך|הרחוק))/,
  /(?:כלי\s+(?:קבוע|יומיומי|קבועים)|להמשיך\s+(?:לאורך|מעבר|הלאה))/,
];

// Hard-banned long-term homework patterns (Hebrew) — tracking/logging/rating
const HE_LONGTERM_HOMEWORK_BANS = [
  /(?:רשום|רשמי|תרשום|תרשמי)\s+(?:במשך\s+(?:כמה|\d+)\s+(?:ימים|שבועות))/,
  /(?:התאריך\s+(?:וה)?(?:שעה|זמן)|שעה\s+(?:וה)?תאריך)/,
  /(?:מה\s+עשית\s+(?:באותו|ברגע|לפני))/,
  /(?:(?:מה|כמה)\s+(?:הייתה|הייתה\s+ה)(?:רמת|עוצמת|רמה\s+של))/,
  /(?:יומן\s+(?:תסמינים|מעקב|רגשות|כאב|לחץ|חרדה))/,
  /(?:לתעד|תיעוד)\s+(?:כל|את\s+ה)\s*(?:תסמין|תסמינים|פרק|פרקים)/,
  /(?:טבלה|תבנית|טופס)\s+(?:מעקב|ניטור|יומי)/,
  /(?:לשים\s+לב\s+ל)(?:תדירות|כמות|רמה|עוצמה)\s+(?:ואז\s+)?(?:לרשום|לתעד|לסמן)/,
  /(?:סולם|סקאלה|דירוג)\s+(?:של|עוצמה|תסמינים)/,
  /(?:\d+\s*-\s*\d+|אפס\s+עד\s+עשר?)\s+(?:כדי\s+)?(?:לדרג|למדוד|לבדוק)/,
];

// Semantic worksheet drift signals (Hebrew)
const HE_WORKSHEET_SEMANTIC_SIGNALS = [
  // Belief / confidence rating tasks
  /\d{1,3}\s*[-–]\s*\d{1,3}/,
  /(?:דרג|דרגי|ציון|אחוז|מ-?\d+\s+עד\s+\d+)/,
  /(?:כמה\s+(?:אתה|את)\s+(?:מאמינ|מרגיש))/,
  /(?:רמת\s+(?:האמונה|הביטחון|החרדה|הלחץ))/,
  /(?:על\s+סקלה\s+של)/,
  // Evidence loops
  /(?:ראיות\s+(?:בעד|נגד|לכך|לטובת))/,
  /(?:מה\s+(?:הראיות|העדויות|הסיבות|הסיבה))/,
  /(?:מה\s+(?:מצביע|מלמד|מוכיח))/,
  /(?:ראיה\s+ש)/,
  // Self-monitoring homework
  /(?:(?:רשום|כתוב|תעד)\s+(?:בכל\s+פעם|כל\s+פעם\s+ש|מתי\s+ש))/,
  /(?:(?:שעה|מתי|מה\s+קרה\s+לפני)\s*[\/,]\s*(?:שעה|מה\s+קרה|איפה\s+בגוף))/,
  /(?:יומן\s+(?:מעקב|רגשות|מחשבות|לחץ))/,
  /(?:מעקב\s+(?:עצמי|יומי|שבועי))/,
  /(?:ניטור\s+(?:עצמי|מחשבות))/,
  /(?:לאורך\s+(?:שבוע|שבועיים|חודש)\s+(?:הבא|הקרוב))/,
  // Multi-option menus
  /(?:אפשרות\s+(?:א|ב|ג|1|2|3))/,
  /(?:^[1-3]\.\s+(?:לנשום|לרשום|לעשות|לנסות|לבחן))/m,
  // Pattern-mapping chains
  /(?:בוא\s+(?:נבין|נמפה|נזהה|נבדוק|נחקור)\s+(?:את\s+)?ה(?:דפוס|מחשבה|רגשות|קשר|מתי))/,
  /(?:מה\s+(?:הטריגר|הגורם|קרה\s+לפני|קדם\s+ל))/,
  /(?:איזה\s+(?:מחשבה\s+אוטומטית|דפוס\s+חשיבה))/,
  // Ask-back question at the end
  /\?[\s\u200f]*$/,
];

// Context classifier signals
const HE_EMAIL_SIGNALS = /(?:מייל|אימייל|תיבת\s+(?:הדואר|דואר)|הודעה\s+(?:שלא\s+)?(?:ענית|השבת|טיפלת)|לא\s+(?:הגבת|ענית|השבת))/;
const HE_DISAPPROVAL_SIGNALS = /(?:למה\s+לא\s+(?:ענית|חזרת|הגבת)|מה\s+יגידו|מה\s+(?:יחשבו|יאמרו|ידעו)|אכזב|אכזבתי|כישלת|כישלון|לא\s+מספיק|(?:לא\s+)?עמדתי\s+בציפיות)/;
const HE_DISTRESS_SIGNALS = /(?:כובד|כבדות|לחץ|חרדה|מחנק|חזה|גוף|נשימה|עייפות|ריקנות|כאב|פחד)/;

// Directive replacements by context type
const HE_EMAIL_REWRITES = [
  'בפעם הבאה שהלחץ סביב המיילים עולה, פתח מייל אחד בלבד ובדוק אם הוא באמת דורש מענה מיידי. עצור אחרי מייל אחד.',
  'בחר עכשיו מייל אחד שממתין. קרא אותו בלבד ובדוק: האם הוא דחוף כרגע? סיים בתשובה של משפט אחד או בדחייה מודעת ל-30 דקות.',
  'פתח את תיבת הדואר ובחר מייל אחד בלבד לטפל בו עכשיו. אחד, לא יותר. שאר המיילים יחכו.',
];

const HE_DISAPPROVAL_REWRITES = [
  'רשום עכשיו משפט אחד בלבד: "יש מיילים שמחכים, וזה לא אומר שאני נכשל." ואז פתח מייל אחד בלבד וענה עליו.',
  'קח 60 שניות ועשה בדיקת מציאות אחת: אנשים שלא מגיבים מיד לעיתים קרובות מגיבים מאוחר יותר בלי שאף אחד שם לב. שלח מייל אחד עכשיו בלי להתנצל.',
  'בפעם הבאה שהמחשבה "למה לא חזרתי" עולה, עשה פעולה אחת בלבד: שלח מייל קצר עם "אחזור אליך בקרוב." זה מספיק.',
];

const HE_DISTRESS_REWRITES = [
  'שים יד על החזה, קח שלוש נשימות איטיות לבטן. אחרי הנשימה השלישית, בחר פעולה אחת קטנה לעשות עכשיו.',
  'עצור לרגע, הנח את הידיים, וקח נשימה אחת ארוכה. אחר כך, כתוב דבר אחד בלבד שאתה יכול לעשות בעשר הדקות הקרובות.',
  'שים לב לאיפה הכובד יושב בגוף. נשום לתוכו פעמיים. ואז בחר פעולה אחת קטנה שאפשר לסיים בפחות מחמש דקות.',
];

const HE_LONGTERM_DISTRESS_REWRITES = [
  'בפעם הבאה שהמועקה עולה, עצור לדקה אחת ועשה שוב את אותו תרגיל קרקוע לפני שאתה ממשיך במה שעשית. זה הצעד הבא להיום.',
  'הצעד הבא הוא לשמור את תרגיל הקרקוע הזה ככלי קבוע: בפעם הבאה שהמועקה מתחילה, השתמש בו מיד לפני כל ניסיון להבין למה זה קורה.',
  'בחר היום רגע אחד שבו אתה בודק את הגוף שלך לדקה בלי לשנות כלום — רק לשים לב לנשימה ולמתח בכתפיים. עצור אחרי דקה.',
];

const HE_POST_LEARNING_REWRITES = [
  'טוב — עשה עוד חזרה אחת על אותו צעד היום, באותו מצב. חיזוק, לא ניתוח.',
  'ההתקדמות אמיתית. הצעד הבא הוא חזרה אחת קטנה על מה שעבד — לא תוכנית גדולה יותר.',
  'בנה על זה ידי לעשות את אותה פעולה עוד פעם אחת השבוע. חזרה אחת. עצור שם.',
];

// Hebrew post-learning turn signals
const HE_POST_LEARNING_SIGNALS = /(?:האמונה\s+(?:עלתה|ירדה|השתנתה)|עזר\s+(?:קצת|מעט|לי)|הרגשתי\s+(?:טוב\s+יותר|פחות|שיפור)|זה\s+(?:עבד|עזר|הצליח)|ניסיתי\s+(?:את\s+ז|ו|ה)|עשיתי\s+(?:את\s+ז|ו|ה)|השלמתי\s+|פחות\s+(?:חרדה|לחץ|דאגה)\s+מ)/;

let _heRewriteIndex = 0;
function pickHeRewrite(arr) {
  const pick = arr[_heRewriteIndex % arr.length];
  _heRewriteIndex++;
  return pick;
}

// ============================================================
// ENGLISH LONG-FORM REFLECTION TRAP DETECTOR (CP13-EN)
// ============================================================
//
// Fires AFTER the draft is composed but BEFORE render.
// If the draft has shifted into worksheet / formulation mode
// from a non-worksheet context, the draft is discarded and
// replaced with a short directive-first action response.
//
// Trigger: 2+ semantic trap signals in the draft text.
// Scope: English sessions only.
// ============================================================

// Signals that indicate worksheet / formulation mode in English
const EN_REFLECTION_TRAP_SIGNALS = [
  // Multi-day tracking homework
  /for the next (few|\d+) days?,?\s+(write|note|record|track|log)/i,
  /over the next (week|few days?|couple of days?)/i,
  /keep a (log|journal|record|diary|note)/i,
  /track (this|that|it|your|the) (over|for|across)/i,
  /daily (log|record|tracking|check.in)/i,
  // Evidence loops
  /evidence (for|against|that supports|that contradicts)/i,
  /what (is the )?evidence (for|against|that)/i,
  /evidence-based thought/i,
  /evidence (column|list|side)/i,
  // Balanced thought generation
  /balanced (thought|perspective|view|alternative)/i,
  /more balanced (thought|way of thinking|view)/i,
  /alternative (thought|perspective|interpretation)/i,
  /reframe (the thought|that thought|this thought)/i,
  // Belief rating
  /rate (your|this|that) belief/i,
  /on a scale of (0|1) (to|-) (10|100)/i,
  /belief rating/i,
  /how strongly do you believe/i,
  /rate (the|your) (thought|feeling|emotion|belief) (from|on|between)/i,
  // Cognitive distortion labeling
  /(all.or.nothing|catastrophi[sz]|overgenerali[sz]|mind reading|fortune.telling|personali[sz]|should.statement|magnif|minimiz|emotional reasoning|labeling|mental filter)/i,
  /cognitive distortion/i,
  /thinking (error|pattern|trap|style)/i,
  /distorted (thinking|thought|pattern)/i,
  // Should-statements analysis
  /should.statement/i,
  /(the word |using )("should"|'should'|should)/i,
  /replace.{0,20}"should"/i,
  /challenge.{0,30}should/i,
  // Pattern mapping homework
  /map (out|the) (pattern|cycle|triggers)/i,
  /identify (the )?triggers? (for|of|behind)/i,
  /automatic thought (record|worksheet|log)/i,
  /thought (record|diary|log|worksheet)/i,
  // Multi-question chains (3+ question marks in response body)
];

// Post-learning turn signals (user reports partial success / belief shift)
const EN_POST_LEARNING_SIGNALS = /(belief.{0,10}(rose|went up|increased|went from|changed)|helped a bit|felt better|worked a little|it worked|that helped|more confident|less anxious than|less worried than|did (the|it|that)|completed (it|the)|followed (through|up)|tried (it|that|the))/i;

// Context signals for targeted English rewrites
const EN_EMAIL_SIGNALS = /(email|inbox|reply|message|boss|professor|manager|colleague|unread|unanswered)/i;
const EN_DISAPPROVAL_SIGNALS = /(disappoint|let.{0,5}(them|him|her|people|everyone) down|what (will|would|do) (they|people|everyone) think|judg(e|ing|ment)|fail(ed|ing|ure)|not good enough|expectations|letting people)/i;
const EN_HEAVINESS_SIGNALS = /(heaviness|heavy|weight (in|on|around)|tightness|chest|body|breathing|numb|hollow|empty|exhausted|drained|overwhelm)/i;

// English directive rewrites by context
const EN_EMAIL_REWRITES = [
  'Open one email now — just one — and write the first sentence of a reply. Done when that sentence exists.',
  'Pick the email that feels most overdue. Open it. Write two sentences. Close the tab.',
  'Open your inbox now and handle one email only: either reply in one sentence or mark it for a specific time tomorrow. Stop after one.',
];

const EN_DISAPPROVAL_REWRITES = [
  'The next step is a small behavioral test: do one thing you\'ve been avoiding because of what others might think. Notice what actually happens — not what you predicted.',
  'Do one small thing today that you\'d normally delay because of others\' judgment. Notice the actual reaction, not the imagined one.',
  'Write one sentence right now: "I can handle being wrong about how people will react." Then do the thing you\'ve been holding back.',
];

const EN_HEAVINESS_REWRITES = [
  'Place one hand on your chest. Take three slow breaths into your belly. After the third, pick one small thing you can do in the next ten minutes.',
  'Stop for a moment. Notice where the heaviness sits in your body. Breathe toward it twice. Then choose one action — small enough to finish before you next eat or drink anything.',
  'Name the one thing that feels most stuck right now. Write it down in one sentence. That sentence is your next action target.',
];

const EN_LONGTERM_REWRITES = [
  'The next step is to use the same grounding move the next time this feeling starts — before trying to understand it. One repetition, not a new plan.',
  'Next time this comes up, use what already worked today. One repeat of the same step. That\'s the assignment.',
  'Do the same thing you just did, one more time this week, in the same situation. Repetition before expansion.',
];

const EN_POST_LEARNING_REWRITES = [
  'Good — now do one more repetition of that same step today, in the same situation. Reinforcement, not analysis.',
  'That progress is real. The next move is one small repeat of what just worked — not a bigger plan.',
  'Build on that by doing the same action one more time this week. One repeat. Stop there.',
];

const EN_GENERIC_REWRITES = [
  'The next step is one small, concrete action on this — not a plan, not a worksheet. What\'s the single smallest thing you can do about this today?',
  'Pick one thing from what you just shared that you can act on in the next hour. One thing only. Do that.',
  'Take one concrete step on this today — something that creates a real-world trace. Write it, send it, or do it.',
];

let _enRewriteIndex = 0;
function pickEnRewrite(arr) {
  const pick = arr[_enRewriteIndex % arr.length];
  _enRewriteIndex++;
  return pick;
}

/**
 * Count reflection trap signals in English draft text.
 * Returns the count of matched signals.
 */
function countEnReflectionTrapSignals(text) {
  let count = 0;
  for (const pattern of EN_REFLECTION_TRAP_SIGNALS) {
    if (pattern.test(text)) count++;
  }
  // Also count multi-question chains as a signal
  const questionCount = (text.match(/\?/g) || []).length;
  if (questionCount >= 3) count++;
  return count;
}

/**
 * Classify English context for targeted rewrite.
 * Priority order: longterm > post_learning > email > disapproval > heaviness > generic
 */
function classifyEnglishContext(text) {
  // Longterm / next-step queries take top priority — user has moved past immediate distress
  if (/(next step|long.term|over time|going forward|from here|what now|what next|where do (we|I) go|what should (I|we) do now)/i.test(text)) return 'longterm';
  // Post-learning turn — user reports partial success
  if (EN_POST_LEARNING_SIGNALS.test(text)) return 'post_learning';
  if (EN_EMAIL_SIGNALS.test(text)) return 'email';
  if (EN_DISAPPROVAL_SIGNALS.test(text)) return 'disapproval';
  if (EN_HEAVINESS_SIGNALS.test(text)) return 'heaviness';
  return 'generic';
}

/**
 * English long-form reflection trap pass (CP13-EN).
 * If 2+ worksheet signals are detected, discard draft and return
 * a short directive-first English replacement.
 * If no trap, returns original text unchanged.
 */
function applyEnglishReflectionTrapPass(text) {
  const signalCount = countEnReflectionTrapSignals(text);
  if (signalCount < 2) return text;

  console.warn('[CP13-EN] Reflection trap detected (' + signalCount + ' signals) — replacing draft with directive rewrite');

  const context = classifyEnglishContext(text);
  let rewrite;
  if (context === 'longterm') {
    rewrite = pickEnRewrite(EN_LONGTERM_REWRITES);
  } else if (context === 'post_learning') {
    rewrite = pickEnRewrite(EN_POST_LEARNING_REWRITES);
  } else if (context === 'email') {
    rewrite = pickEnRewrite(EN_EMAIL_REWRITES);
  } else if (context === 'disapproval') {
    rewrite = pickEnRewrite(EN_DISAPPROVAL_REWRITES);
  } else if (context === 'heaviness') {
    rewrite = pickEnRewrite(EN_HEAVINESS_REWRITES);
  } else {
    rewrite = pickEnRewrite(EN_GENERIC_REWRITES);
  }

  return rewrite;
}

/**
 * Detect Hebrew long-term distress homework drift.
 * Returns true if the user is asking for a long-term next step
 * AND the draft gives tracking/logging/rating homework.
 */
function detectHebrewLongtermHomeworkDrift(text) {
  const asksForNext = HE_LONGTERM_NEXT_STEP_SIGNALS.some(p => p.test(text));
  if (!asksForNext) return false;
  return HE_LONGTERM_HOMEWORK_BANS.some(p => p.test(text));
}

/**
 * Semantic Hebrew worksheet drift detector.
 * Returns true if the draft exhibits worksheet-mode behavior semantically.
 */
function detectHebrewWorksheetDriftSemantic(text) {
  let signalCount = 0;
  for (const pattern of HE_WORKSHEET_SEMANTIC_SIGNALS) {
    if (pattern.test(text)) {
      signalCount++;
      if (signalCount >= 2) return true;
    }
  }
  if (/\?[\s\u200f]*$/.test(text.trim())) return true;
  return false;
}

/**
 * Classify the Hebrew context type for targeted rewrite.
 * Priority: longterm_distress > post_learning > email > disapproval > distress
 */
function classifyHebrewContext(text) {
  if (detectHebrewLongtermHomeworkDrift(text)) return 'longterm_distress';
  // Check for explicit next-step queries (longterm even without homework ban)
  if (HE_LONGTERM_NEXT_STEP_SIGNALS.some(p => p.test(text))) return 'longterm_distress';
  if (HE_POST_LEARNING_SIGNALS.test(text)) return 'post_learning';
  if (HE_EMAIL_SIGNALS.test(text)) return 'email';
  if (HE_DISAPPROVAL_SIGNALS.test(text)) return 'disapproval';
  if (HE_DISTRESS_SIGNALS.test(text)) return 'distress';
  return 'distress'; // default to grounding
}

/**
 * Hebrew semantic anti-worksheet pass.
 * If worksheet drift is detected semantically, DISCARDS the draft entirely
 * and returns a clean directive-first Hebrew replacement.
 * If no drift, returns the original text unchanged.
 */
function applyHebrewSemanticAntiWorksheet(text) {
  if (!detectHebrewWorksheetDriftSemantic(text)) return text;

  console.warn('[CP12-HE] Semantic worksheet drift detected — replacing draft with directive rewrite');

  const context = classifyHebrewContext(text);
  let rewrite;
  if (context === 'longterm_distress') {
    rewrite = pickHeRewrite(HE_LONGTERM_DISTRESS_REWRITES);
  } else if (context === 'post_learning') {
    rewrite = pickHeRewrite(HE_POST_LEARNING_REWRITES);
  } else if (context === 'email') {
    rewrite = pickHeRewrite(HE_EMAIL_REWRITES);
  } else if (context === 'disapproval') {
    rewrite = pickHeRewrite(HE_DISAPPROVAL_REWRITES);
  } else {
    rewrite = pickHeRewrite(HE_DISTRESS_REWRITES);
  }

  return rewrite;
}

// --- Helpers ---

function detectLanguage(text) {
  if (/[\u05D0-\u05EA]/.test(text)) return 'he';
  if (/[\u00C0-\u024F]/.test(text)) {
    if (/\b(el|la|los|las|que|está|con)\b/i.test(text)) return 'es';
    if (/\b(le|la|les|est|avec|que)\b/i.test(text)) return 'fr';
    if (/\b(der|die|das|ist|und|mit)\b/i.test(text)) return 'de';
  }
  return 'en';
}

function splitSentences(text) {
  return text.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
}

function isAskBackLine(line) {
  const trimmed = line.trim();
  return ASK_BACK_LINE_PATTERNS.some(p => p.test(trimmed));
}

function hasWorksheetDrift(text) {
  return WORKSHEET_BLOCK_PATTERNS.some(p => p.test(text));
}

function stripTrailingAskBack(text) {
  const lines = text.split('\n');
  let i = lines.length - 1;
  let stripped = false;
  while (i >= 0) {
    const line = lines[i].trim();
    if (!line) { i--; continue; }
    if (isAskBackLine(line)) {
      console.warn('[CP12-B] Stripped ask-back line:', line.substring(0, 80));
      lines.splice(i, 1);
      stripped = true;
      i--;
    } else {
      break;
    }
  }
  if (!stripped) return text;
  return lines.join('\n').trim();
}

function stripWorksheetBlocks(text) {
  const lines = text.split('\n');
  const cleaned = lines.filter(line => {
    const trimmed = line.trim();
    if (WORKSHEET_BLOCK_PATTERNS.some(p => p.test(trimmed))) {
      console.warn('[CP12-D] Stripped worksheet line:', trimmed.substring(0, 80));
      return false;
    }
    return true;
  });
  return cleaned.join('\n').trim();
}

function stripRoutingLeakage(text) {
  const lines = text.split('\n');
  const cleaned = lines.filter(line => {
    if (ROUTING_COMPRESSION_PATTERNS.some(p => p.test(line))) {
      console.warn('[CP12-D] Stripped routing leakage:', line.substring(0, 80));
      return false;
    }
    return true;
  });
  return cleaned.join('\n').trim();
}

// --- Main Governor ---

/**
 * Apply the Final Output Governor to an assistant message before render.
 *
 * @param {string} text - Raw assistant message content
 * @param {object} opts
 * @param {string} [opts.lang] - ISO language code ('he', 'en', etc.). Auto-detected if omitted.
 * @returns {string} - Governed, user-safe content
 */
export function applyFinalOutputGovernor(text, opts = {}) {
  if (!text || typeof text !== 'string') return getFailsafe(opts.lang || 'en');

  let result = text;
  const lang = opts.lang || detectLanguage(result);

  // Pass 1: Leakage sanitization (existing layer, reused)
  result = sanitizeMessageContent(result, lang);
  if (!result || result.length < 3) {
    console.error('[CP12-A] Content empty after leakage sanitization — using failsafe');
    return getFailsafe(lang);
  }

  // Pass 2: Routing leakage phrases
  result = stripRoutingLeakage(result);
  if (!result || result.length < 3) {
    console.error('[CP12-D] Content empty after routing strip — using failsafe');
    return getFailsafe(lang);
  }

  // Pass 3: Generic worksheet drift block
  if (hasWorksheetDrift(result)) {
    console.warn('[CP12-D] Worksheet drift detected — stripping worksheet blocks');
    result = stripWorksheetBlocks(result);
  }
  if (!result || result.length < 3) {
    console.error('[CP12-D] Content empty after worksheet strip — using failsafe');
    return getFailsafe(lang);
  }

  // Pass 3b: Hebrew semantic anti-worksheet REWRITE (Hebrew only)
  // Phrase stripping was insufficient — if drift is detected semantically,
  // the draft is discarded and replaced with a context-typed directive response.
  if (lang === 'he') {
    result = applyHebrewSemanticAntiWorksheet(result);
    if (!result || result.length < 3) {
      console.error('[CP12-HE] Content empty after Hebrew semantic pass — using failsafe');
      return getFailsafe('he');
    }
  }

  // Pass 3c: English long-form reflection trap REWRITE (English only)
  // If worksheet/formulation mode is detected semantically in English,
  // the draft is discarded and replaced with a short directive-first response.
  if (lang === 'en') {
    result = applyEnglishReflectionTrapPass(result);
    if (!result || result.length < 3) {
      console.error('[CP13-EN] Content empty after English reflection trap pass — using failsafe');
      return getFailsafe('en');
    }
  }

  // Pass 4: Trailing ask-back strip
  result = stripTrailingAskBack(result);
  if (!result || result.length < 3) {
    console.error('[CP12-B] Content empty after ask-back strip — using failsafe');
    return getFailsafe(lang);
  }

  // Pass 5: Final structural check — pure question with nothing else is invalid
  const trimmed = result.trim();
  const sentences = splitSentences(trimmed);
  if (sentences.length === 1 && /\?$/.test(trimmed)) {
    console.error('[CP12-B] Response is only a question — using failsafe');
    return getFailsafe(lang);
  }

  return result.trim();
}

/**
 * Check if text passes CP12 without modifying it.
 * Returns { passes: boolean, violations: string[] }
 */
export function auditCP12(text) {
  if (!text || typeof text !== 'string') return { passes: false, violations: ['empty'] };

  const violations = [];
  const lang = detectLanguage(text);

  if (ROUTING_COMPRESSION_PATTERNS.some(p => p.test(text))) {
    violations.push('routing-leakage');
  }
  if (hasWorksheetDrift(text)) {
    violations.push('worksheet-drift');
  }
  if (lang === 'he' && detectHebrewWorksheetDriftSemantic(text)) {
    violations.push('hebrew-semantic-worksheet-drift');
  }
  const lines = text.split('\n');
  const lastLine = [...lines].reverse().find(l => l.trim());
  if (lastLine && isAskBackLine(lastLine)) {
    violations.push('trailing-ask-back');
  }
  const sentences = splitSentences(text.trim());
  if (sentences.length === 1 && /\?$/.test(text.trim())) {
    violations.push('pure-question');
  }

  return { passes: violations.length === 0, violations };
}
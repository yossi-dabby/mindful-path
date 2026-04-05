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

// Semantic worksheet drift signals (Hebrew)
const HE_WORKSHEET_SEMANTIC_SIGNALS = [
  // Belief / confidence rating tasks
  /\d{1,3}\s*[-–]\s*\d{1,3}/,               // numeric range like 1-100 or 0–10
  /(?:דרג|דרגי|ציון|אחוז|מ-?\d+\s+עד\s+\d+)/,
  /(?:כמה\s+(?:אתה|את)\s+(?:מאמינ|מרגיש))/,
  /(?:רמת\s+(?:האמונה|הביטחון|החרדה|הלחץ))/,
  /(?:על\s+סקלה\s+של)/,

  // Evidence-for / evidence-against loops
  /(?:ראיות\s+(?:בעד|נגד|לכך|לטובת))/,
  /(?:מה\s+(?:הראיות|העדויות|הסיבות|הסיבה))/,
  /(?:מה\s+(?:מצביע|מלמד|מוכיח))/,
  /(?:ראיות\s+ש)/,
  /(?:ראיה\s+(?:ל|נגד|בעד))/,

  // Self-monitoring / tracking homework as first step
  /(?:(?:רשום|כתוב|תעד)\s+(?:בכל\s+פעם|כל\s+פעם\s+ש|מתי\s+ש))/,
  /(?:(?:שעה|מתי|מה\s+קרה\s+לפני)\s*[\/,]\s*(?:שעה|מה\s+קרה|איפה\s+בגוף))/,
  /(?:יומן\s+(?:מעקב|רגשות|מחשבות|לחץ))/,
  /(?:מעקב\s+(?:עצמי|יומי|שבועי))/,
  /(?:ניטור\s+(?:עצמי|מחשבות))/,
  /(?:לאורך\s+(?:שבוע|שבועיים|חודש)\s+(?:הבא|הקרוב))/,

  // Multi-option menus in Hebrew
  /(?:אפשרות\s+(?:א|ב|ג|1|2|3))/,
  /(?:^[1-3]\.\s+(?:לנשום|לרשום|לעשות|לנסות|לבחון))/m,

  // Pattern-mapping / formulation chains
  /(?:בוא\s+(?:נבין|נמפה|נזהה|נבדוק|נחקור)\s+(?:את\s+)?(?:הדפוס|המחשבה|הרגשות|הקשר|מתי))/,
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

let _heRewriteIndex = 0;
function pickHeRewrite(arr) {
  const pick = arr[_heRewriteIndex % arr.length];
  _heRewriteIndex++;
  return pick;
}

/**
 * Semantic Hebrew worksheet drift detector.
 * Returns true if the draft exhibits worksheet-mode behavior semantically,
 * regardless of exact phrasing used.
 */
function detectHebrewWorksheetDriftSemantic(text) {
  let signalCount = 0;
  for (const pattern of HE_WORKSHEET_SEMANTIC_SIGNALS) {
    if (pattern.test(text)) {
      signalCount++;
      if (signalCount >= 2) return true; // 2+ signals = worksheet drift confirmed
    }
  }
  // Single strong signal: ends with a question (ask-back finale)
  if (/\?[\s\u200f]*$/.test(text.trim())) return true;
  return false;
}

/**
 * Classify the Hebrew context type for targeted rewrite.
 */
function classifyHebrewContext(text) {
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
  if (context === 'email') {
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
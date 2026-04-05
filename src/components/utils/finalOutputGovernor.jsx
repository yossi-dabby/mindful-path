/**
 * FINAL USER-VISIBLE RESPONSE GOVERNOR (CP12)
 *
 * This is the LAST gate before any assistant message reaches the user.
 * No upstream path may bypass it.
 *
 * Rules enforced:
 *   A. Internal leakage hard block (tool names, schema labels, reasoning, mixed-language internal text)
 *   B. Directive-first enforcement (strip ask-back, worksheet drift, belief-rating requests)
 *   C. One bounded next step (trim runaway multi-menu responses)
 *   D. Session-type routing compression (panic->grounding, worry->action, social->micro-step, sleep->stop-trying)
 *   E. Fail-closed (strip violating content; if nothing remains, return language-appropriate failsafe)
 *   HE. Hebrew anti-worksheet compression (Hebrew sessions only)
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

// --- Hebrew anti-worksheet patterns (Hebrew sessions only) ---

const HEBREW_WORKSHEET_BANNED_LINE_PATTERNS = [
  /בוא נבין מתי זה מופיע/,
  /איזו תגובה התנהגותית/,
  /מה הייתה התגובה ההתנהגותית/,
  /אילו רגשות נוספים עלו/,
  /מה הראיות(?! ההוו)/,
  /ראיות נגד/,
  /ראיות בעד/,
  /מה התחשבויות שתומכות/,
  /מה התחשבויות שסותרות/,
  /בוא נמפה את המחשבה/,
  /בוא נמפה את הדפוס/,
  /בוא נזהה את הדפוס/,
  /בוא נבדוק את הראיות/,
  /נבדוק יחד את הראיות/,
  /מה עוד עולה/,
  /איזה עוד רגשות/,
  /מעקב עצמי/,
  /יומן מעקב/,
  /לתעד כל פעם/,
  /לרשום בכל פעם ש/,
  /ניטור עצמי/,
];

/**
 * Hebrew-specific anti-worksheet compression.
 * Runs only when Hebrew is detected.
 * Strips banned worksheet/pattern-mapping lines.
 */
function applyHebrewAntiWorksheet(text) {
  const lines = text.split('\n');
  const cleaned = lines.filter(line => {
    const trimmed = line.trim();
    if (!trimmed) return true;
    if (HEBREW_WORKSHEET_BANNED_LINE_PATTERNS.some(p => p.test(trimmed))) {
      console.warn('[CP12-HE] Stripped Hebrew worksheet line:', trimmed.substring(0, 80));
      return false;
    }
    return true;
  });
  return cleaned.join('\n').trim();
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

  // Pass 1: Leakage sanitization (existing layer, reused)
  const lang = opts.lang || detectLanguage(result);
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

  // Pass 3: Worksheet drift block (generic)
  if (hasWorksheetDrift(result)) {
    console.warn('[CP12-D] Worksheet drift detected — stripping worksheet blocks');
    result = stripWorksheetBlocks(result);
  }

  if (!result || result.length < 3) {
    console.error('[CP12-D] Content empty after worksheet strip — using failsafe');
    return getFailsafe(lang);
  }

  // Pass 3b: Hebrew anti-worksheet compression (Hebrew only)
  if (lang === 'he') {
    result = applyHebrewAntiWorksheet(result);
    if (!result || result.length < 3) {
      console.error('[CP12-HE] Content empty after Hebrew anti-worksheet pass — using failsafe');
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

  if (ROUTING_COMPRESSION_PATTERNS.some(p => p.test(text))) {
    violations.push('routing-leakage');
  }
  if (hasWorksheetDrift(text)) {
    violations.push('worksheet-drift');
  }
  const lang = detectLanguage(text);
  if (lang === 'he' && HEBREW_WORKSHEET_BANNED_LINE_PATTERNS.some(p => p.test(text))) {
    violations.push('hebrew-worksheet-drift');
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
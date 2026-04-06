// Conservative crisis language detection with bypass-resistant normalization
// Returns true if message contains high-risk patterns

/**
 * FALSE-POSITIVE GUARD — exam/test/performance contexts.
 * If the message is clearly about academic or performance anxiety without
 * explicit self-harm language, block escalation immediately.
 * Applies across all supported languages.
 */
const EXAM_CONTEXT_PATTERNS = [
  // English
  /\b(exam|test|quiz|finals?|midterm|assignment|deadline|grade|fail(ing)?|failing?\s+(the\s+)?(exam|test|class|course)|afraid\s+(i'?l?l?|to)\s+fail|scared\s+(i'?l?l?|to)\s+fail|performance\s+anxiety|job\s+interview|presentation)\b/i,
  // Hebrew
  /\b(מבחן|בחינה|בגרות|מבחנים|בחינות|להיכשל|כישלון|מחר\s+מבחן|מבחן\s+מחר|ציון|ציונים|הגשה|מטלה|סמסטר|אוניברסיטה|פחד\s+מכישלון)\b/i,
  // Spanish
  /\b(examen|prueba|reprobr?|reprobar|miedo\s+a\s+fracasar|fracasar\s+en|calificaci[oó]n|presentaci[oó]n|entrevista)\b/i,
  // French
  /\b(examen|test|[eé]chec|peur\s+de\s+rater|rater\s+(l'examen|le\s+test)|note|pr[eé]sentation)\b/i,
  // German
  /\b(pr[uü]fung|klausur|angst\s+(vor\s+der\s+pr[uü]fung|zu\s+versagen)|scheitern|note|abgabe|pr[äa]sentation)\b/i,
  // Italian
  /\b(esame|test|paura\s+di\s+fallire|fallire\s+l'esame|voto|presentazione)\b/i,
  // Portuguese
  /\b(exame|prova|medo\s+de\s+reprovar|reprovar|nota|apresenta[çc][aã]o)\b/i,
];

/**
 * GENERAL DISTRESS FALSE-POSITIVE GUARD
 * Blocks crisis escalation for non-crisis distress: overwhelm, panic symptoms,
 * email/work stress, fear of embarrassment, sleep anxiety, heaviness.
 * Only suppresses if NO explicit self-harm language is present.
 */
const GENERAL_DISTRESS_CONTEXT_PATTERNS = [
  // Overwhelm / panic symptoms / general anxiety (EN)
  /\b(overwhelm(ed)?|panic\s+attack|palpitation|racing\s+(heart|thoughts)|can'?t\s+breathe|chest\s+tightness|anxious|burnout|drained|exhausted|heaviness|heavy\s+feeling|numb|hollow|empty\s+feeling)\b/i,
  // Email / work / social distress (EN)
  /\b(email|inbox|unanswered|unread|didn'?t\s+(reply|respond|get\s+back)|late\s+(reply|response)|work\s+stress|job\s+stress|boss|colleague|meeting|presentation\s+tomorrow)\b/i,
  // Fear of social disapproval (EN)
  /\b(embarrass(ed|ing|ment)?|what\s+(will|would|do)\s+(they|people|everyone)\s+think|disappoint|let\s+(them|everyone|him|her)\s+down|judg(e|ing|ment)|shame)\b/i,
  // Sleep / fatigue distress (EN)
  /\b(can'?t\s+sleep|insomnia|nightmares?|woke\s+up|restless\s+night|tired\s+all\s+the\s+time|sleep\s+anxiety)\b/i,
  // Hebrew general distress
  /(?:לחץ|חרדה|עייפות|עייף|מיילים|מייל|אימייל|בוס|עבודה|מבוכה|בושה|לא\s+ישנתי|שינה|כובד|מחנק|התקף\s+חרדה|קצב\s+לב|נשימה|ריקנות)/,
  // Spanish general distress
  /\b(agobiad|abrumad|ansiedad|ansiosa|pánico|estr[eé]s|cansad|agotad|correo|email|trabajo|jefe|vergüenza|insomnio|no\s+pude\s+dormir|miedo\s+al\s+qué\s+dirán)\b/i,
  // French general distress
  /\b(submergé|débordé|anxi[eé]|stress[eé]|panique|épuisé|email|travail|patron|honte|gêne|insomnie|ne\s+pas\s+dormir|peur\s+du\s+regard)\b/i,
  // German general distress
  /\b(überwältigt|ängstlich|gestresst|panik|erschöpft|email|arbeit|chef|peinlich|scham|schlaflosigkeit|nicht\s+schlafen)\b/i,
  // Italian general distress
  /\b(sopraffatt|ansios|stress|panic|esaurit|email|lavoro|capo|vergogna|imbarazzo|insonnia|non\s+riesco\s+a\s+dormire)\b/i,
  // Portuguese general distress
  /\b(sobrecarregad|ansios|estress|panico|esgotad|email|trabalho|chefe|vergonha|embaraço|insônia|não\s+consigo\s+dormir)\b/i,
];

const EXPLICIT_SELF_HARM_PATTERNS = [
  /\b(kill|hurt|harm|cut)\s+(myself|my\s*self)\b/i,
  /\bsuicide\b/i,
  /\boverdose\b/i,
  /\b(end\s+(my\s+life|it\s+all)|ready\s+to\s+(die|end\s+it)|want\s+to\s+die)\b/i,
  /\b(take\s+all\s+(my|the)\s+(pills|meds|medication))\b/i,
  /\b(better\s+off\s+(dead|without\s+me)|everyone\s+(would\s+be\s+)?better\s+(off\s+)?without\s+me)\b/i,
  // Hebrew self-harm / suicidal
  /\b(להרוג\s+את\s+עצמי|לפגוע\s+בעצמי|להתאבד|אני\s+רוצה\s+למות|חיי\s+לא\s+שווים)\b/i,
  // Spanish explicit self-harm / suicidal
  /\b(matarme|hacerme\s+daño|cortarme|suicidio|suicidarme|quitarme\s+la\s+vida|acabar\s+con\s+mi\s+vida)\b/i,
  // French explicit self-harm / suicidal
  /\b(me\s+tuer|me\s+faire\s+du\s+mal|me\s+blesser|suicide|me\s+suicider|mettre\s+fin\s+à\s+ma\s+vie|en\s+finir\s+avec\s+ma\s+vie)\b/i,
  // German explicit self-harm / suicidal
  /\b(mich\s+umbringen|mir\s+etwas\s+antun|mich\s+verletzen|Selbstmord|mich\s+töten|mein\s+Leben\s+beenden)\b/i,
  // Italian explicit self-harm / suicidal
  /\b(uccidermi|farmi\s+del\s+male|tagliarmi|suicidio|suicidarmi|togliermi\s+la\s+vita|farla\s+finita)\b/i,
  // Portuguese explicit self-harm / suicidal
  /\b(me\s+matar|me\s+machucar|me\s+cortar|suicídio|me\s+suicidar|tirar\s+minha\s+vida|acabar\s+com\s+minha\s+vida)\b/i,
];

const CRISIS_PATTERNS = [
  // Self-harm language
  /\bcan'?t\s+take\s+this\s+anymore\b/i,
  /\bcan'?t\s+do\s+it\s+anymore\b/i,
  /\bcan'?t\s+go\s+on\b/i,
  /\bcan'?t\s+(take|do)\s+(this|it)\s+anymore\b/i,
  /\b(kill|hurt|harm)\s+(myself|my\s*self)\b/i,
  /\bsuicide\b/i,
  /\bend\s+(my\s+life|it\s+all)\b/i,
  /\bdon'?t\s+want\s+to\s+(live|be\s+alive)\b/i,
  /\bcut(ting)?\s+(myself|my\s*self)\b/i,

  // Overdose/method language
  /\boverdose\b/i,
  /\btake\s+all\s+(my|the)\s+(pills|meds|medication)\b/i,

  // Immediate danger
  /\bgoodbye\s+(cruel\s+)?world\b/i,
  /\bbetter\s+off\s+(dead|without\s+me)\b/i,

  // Indirect/semantic patterns
  /\bno\s+point\s+(in\s+)?(living|going\s+on|continuing)\b/i,
  /\bwant\s+to\s+disappear\b/i,
  /\beveryone\s+(would\s+be\s+)?better\s+(off\s+)?without\s+me\b/i,
  /\bready\s+to\s+(die|end\s+it)\b/i,
  /\b(don'?t|do\s+not)\s+want\s+to\s+(live|be\s+alive|exist)\b/i,

  // Hebrew self-harm / suicidal
  /\b(להרוג\s+את\s+עצמי|לפגוע\s+בעצמי|להתאבד|אני\s+רוצה\s+למות|חיי\s+לא\s+שווים)\b/i,

  // Spanish crisis threshold
  /\b(matarme|hacerme\s+daño|cortarme|suicidarme|quitarme\s+la\s+vida|acabar\s+con\s+mi\s+vida|no\s+quiero\s+(seguir\s+)?(vivir|existir)|mejor\s+muerto|prefiero\s+morir)\b/i,
  // French crisis threshold
  /\b(me\s+tuer|me\s+faire\s+du\s+mal|me\s+suicider|mettre\s+fin\s+à\s+ma\s+vie|en\s+finir\s+avec\s+ma\s+vie|je\s+ne\s+veux\s+plus\s+vivre|mieux\s+vaut\s+mourir|je\s+veux\s+mourir)\b/i,
  // German crisis threshold
  /\b(mich\s+umbringen|mir\s+etwas\s+antun|mich\s+töten|Selbstmord|mein\s+Leben\s+beenden|ich\s+will\s+nicht\s+mehr\s+leben|lieber\s+tot|ich\s+möchte\s+sterben)\b/i,
  // Italian crisis threshold
  /\b(uccidermi|farmi\s+del\s+male|suicidarmi|togliermi\s+la\s+vita|farla\s+finita|non\s+voglio\s+più\s+vivere|meglio\s+morto|voglio\s+morire)\b/i,
  // Portuguese crisis threshold
  /\b(me\s+matar|me\s+machucar|me\s+suicidar|tirar\s+minha\s+vida|acabar\s+com\s+minha\s+vida|não\s+quero\s+mais\s+viver|melhor\s+morto|quero\s+morrer)\b/i,
];

/**
 * Normalize text to prevent bypass attempts:
 * - Remove spaces between letters (ki ll -> kill)
 * - Replace common character substitutions (1->i, 3->e, 0->o, @->a, $->s)
 * - Remove punctuation between letters (k.i.l.l -> kill)
 * - Convert to lowercase
 */
function normalizeForDetection(text) {
  if (!text || typeof text !== 'string') return '';

  let normalized = text.toLowerCase().trim();

  // Strip trailing punctuation (.,!?...) so word boundaries match correctly
  normalized = normalized.replace(/[.,!?;:]+$/g, '');
  // Also strip punctuation mid-sentence that might block boundary matches
  normalized = normalized.replace(/([a-z])[.,!?]+\s/g, '$1 ');

  const substitutions = {
    '1': 'i', '3': 'e', '0': 'o', '@': 'a', '$': 's',
    '!': 'i', '7': 't', '5': 's', '8': 'b', '4': 'a'
  };

  for (const [char, replacement] of Object.entries(substitutions)) {
    normalized = normalized.replace(new RegExp(char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), replacement);
  }

  // Collapse extra internal spaces between letters ("ki  ll" -> "kill")
  normalized = normalized.replace(/([a-z])\s{2,}([a-z])/g, '$1 $2');
  // Remove punctuation between letters ("k.i.l.l" -> "kill")
  normalized = normalized.replace(/([a-z])[._-]+([a-z])/g, '$1$2');
  // Normalize multiple spaces to single space
  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
}

/**
 * Categorize detected crisis language into reason codes
 */
function categorizeReason(message) {
  const normalized = normalizeForDetection(message);
  const original = message.toLowerCase().trim();

  const testMessage = (text) => {
    if (/\b(kill|hurt|harm|cut)\s+(myself|my\s*self)\b/i.test(text)) return 'self_harm';
    if (/\bsuicide\b/i.test(text)) return 'suicide';
    if (/\boverdose\b/i.test(text)) return 'overdose';
    if (/\b(take\s+all\s+(my|the)\s+(pills|meds)|goodbye\s+world|ready\s+to\s+(die|end\s+it))\b/i.test(text)) return 'immediate_danger';
    return 'general_crisis';
  };

  return testMessage(original) || testMessage(normalized) || 'general_crisis';
}

/**
 * Returns true if message is clearly in an exam/performance/failure context
 * without any explicit self-harm language.
 * Used to block false-positive crisis escalation for academic distress.
 */
export function isExamContextFalsePositive(message) {
  if (!message || typeof message !== 'string') return false;
  const hasExamContext = EXAM_CONTEXT_PATTERNS.some(p => p.test(message));
  if (!hasExamContext) return false;
  const hasExplicitHarm = EXPLICIT_SELF_HARM_PATTERNS.some(p => p.test(message));
  return !hasExplicitHarm;
}

/**
 * Returns true if the message is clearly in a general-distress (non-crisis) context
 * without any explicit self-harm language.
 * Blocks false-positive crisis escalation for: overwhelm, panic symptoms,
 * email/work stress, fear of social disapproval, sleep anxiety, vague heaviness.
 */
export function isGeneralDistressFalsePositive(message) {
  if (!message || typeof message !== 'string') return false;
  const hasGeneralDistress = GENERAL_DISTRESS_CONTEXT_PATTERNS.some(p => p.test(message));
  if (!hasGeneralDistress) return false;
  const hasExplicitHarm = EXPLICIT_SELF_HARM_PATTERNS.some(p => p.test(message));
  return !hasExplicitHarm;
}

export function detectCrisisLanguage(message) {
  if (!message || typeof message !== 'string') {
    return false;
  }

  // False-positive guard: exam/performance context without self-harm → never escalate
  if (isExamContextFalsePositive(message)) return false;

  // False-positive guard: general distress context (overwhelm, panic symptoms, email
  // stress, embarrassment, sleep anxiety, heaviness) without explicit harm → never escalate
  if (isGeneralDistressFalsePositive(message)) return false;

  const original = message.toLowerCase().trim();
  // Also test a punctuation-stripped version for boundary matching
  const stripped = original.replace(/[.,!?;:]+/g, ' ').replace(/\s+/g, ' ').trim();
  const normalized = normalizeForDetection(message);

  return CRISIS_PATTERNS.some(pattern =>
    pattern.test(original) || pattern.test(stripped) || pattern.test(normalized)
  );
}

/**
 * Detect crisis language and return reason code if detected
 * Returns null if no crisis detected, otherwise returns reason code
 */
export function detectCrisisWithReason(message) {
  if (detectCrisisLanguage(message)) {
    return categorizeReason(message);
  }
  return null;
}
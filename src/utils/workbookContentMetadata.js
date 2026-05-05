/**
 * @file src/utils/workbookContentMetadata.js
 *
 * Workbook Content Metadata — Phase 10 Routing Intelligence
 *
 * Provides structured content descriptions for the 7 Hebrew adult therapeutic
 * workbooks so that the routing layer can match user queries to the correct
 * workbook, rather than to a narrower individual worksheet.
 *
 * Each workbook entry contains:
 *   - id / slug        — matches the TherapeuticForms registry
 *   - titleHe          — Hebrew workbook title
 *   - descriptionHe    — short clinical description in Hebrew
 *   - internalForms    — list of internal form topics (informational)
 *   - topicKeywords    — Hebrew word/phrase list used for scoring against user queries
 *   - whenToUseHe      — plain-Hebrew usage guidance (for AI context)
 *   - preferWhenHe     — signals that trigger workbook preference over individual sheets
 *   - lowerPriorityIndividualForms — individual form IDs NOT to prefer when this workbook fits
 *
 * Usage:
 *   Import WORKBOOK_CONTENT_METADATA in resolveWorkbookIntent.js for scoring.
 *   Do NOT import from this file in production app UI code.
 */

/**
 * @typedef {Object} WorkbookMeta
 * @property {string}   id
 * @property {string}   slug
 * @property {string}   titleHe
 * @property {string}   descriptionHe
 * @property {string[]} internalForms
 * @property {string[]} topicKeywords
 * @property {string}   whenToUseHe
 * @property {string[]} preferWhenHe
 * @property {string[]} lowerPriorityIndividualForms
 */

/** @type {WorkbookMeta[]} */
export const WORKBOOK_CONTENT_METADATA = [
  // ── 1. Formulation & Mapping ─────────────────────────────────────────────────
  {
    id: 'tf-adults-formulation-mapping-premium-he',
    slug: 'adults-formulation-mapping-premium-he',
    titleHe: 'קונטרס מיפוי והמשגה',
    descriptionHe:
      'קונטרס טיפולי מלא לניסוח מקרה, מיפוי הקושי המרכזי, זיהוי דפוסים חוזרים, טריגרים וגורמים תורמים.',
    internalForms: [
      'מיפוי הקושי המרכזי',
      'ניסוח מקרה',
      'זיהוי דפוסים חוזרים',
      'טריגרים',
      'מחשבות, רגשות, גוף והתנהגות',
      'גורמי רקע',
      'גורמי שימור',
      'מטרות טיפוליות',
    ],
    topicKeywords: [
      'ניסוח מקרה',
      'מיפוי והמשגה',
      'מיפוי',
      'המשגה',
      'גורמי שימור',
      'גורמי רקע',
      'דפוסים חוזרים',
      'להבין את הבעיה',
      'תמונה כללית',
      'בירור ראשוני',
      'הערכה ראשונית',
      'מטרות טיפוליות',
    ],
    whenToUseHe:
      'כאשר המטפל והמטופל רוצים למפות את הבעיה המרכזית, להבין את ההיסטוריה, לזהות דפוסים חוזרים ולנסח מקרה טיפולי.',
    preferWhenHe: [
      'מיפוי',
      'המשגה',
      'להבין את הבעיה',
      'ניסוח מקרה',
      'תמונה כללית',
      'בירור ראשוני',
      'מה קורה לי',
      'דפוסים חוזרים',
    ],
    lowerPriorityIndividualForms: [],
  },

  // ── 2. Awareness & Identification ────────────────────────────────────────────
  {
    id: 'tf-adults-awareness-identification-premium-he',
    slug: 'adults-awareness-identification-premium-he',
    titleHe: 'קונטרס זיהוי מחשבות, רגשות, תחושות והתנהגות',
    descriptionHe:
      'קונטרס טיפולי מלא לזיהוי וניטור מחשבות, רגשות, תחושות גוף, התנהגויות ושרשרת התגובה.',
    internalForms: [
      'זיהוי אירוע ומחשבה ראשונית',
      'יומן מחשבות אוטומטיות',
      'זיהוי רגשות ועוצמתם',
      'מפת תחושות גוף וסימנים פיזיים',
      'תגובה והתנהגות בפועל',
      'שרשרת מצב-מחשבה-רגש-גוף-התנהגות',
      'דפוסים חוזרים וטריגרים',
      'סיכום ראשוני להמשך עבודה טיפולית',
    ],
    topicKeywords: [
      'זיהוי מחשבות',
      'זיהוי רגשות',
      'זיהוי תחושות',
      'זיהוי התנהגות',
      'ניטור מחשבות',
      'ניטור רגשות',
      'יומן מחשבות',
      'מעקב מחשבות',
      'תחושות גוף',
      'שרשרת תגובה',
      'שרשרת מחשבה',
      'להבין מה אני מרגיש',
      'להבין מה אני חושב',
    ],
    whenToUseHe:
      'כאשר המטופל רוצה ללמוד לזהות ולנטר מחשבות, רגשות, תחושות גוף והתנהגויות — הבסיס לכל עבודה CBT.',
    preferWhenHe: [
      'זיהוי מחשבות',
      'ניטור מחשבות',
      'זיהוי רגשות',
      'תחושות גוף',
      'דפוסי התנהגות',
      'שרשרת תגובה',
      'להבין מה אני מרגיש',
      'להבין מה אני חושב',
    ],
    lowerPriorityIndividualForms: [
      'tf-adults-cbt-thought-record',
    ],
  },

  // ── 3. Cognitive Flexibility ─────────────────────────────────────────────────
  {
    id: 'tf-adults-cognitive-flexibility-premium-he',
    slug: 'adults-cognitive-flexibility-premium-he',
    titleHe: 'קונטרס הפרכת מחשבות וגמישות מחשבתית',
    descriptionHe:
      'קונטרס טיפולי מלא לערעור מחשבות אוטומטיות, בדיקת ראיות, שאלות סוקרטיות, עיוותי חשיבה, פרספקטיבות חלופיות ואמונות מגבילות.',
    internalForms: [
      'זיהוי מחשבה אוטומטית והנחת יסוד',
      'בדיקת ראיות בעד ונגד המחשבה',
      'שאלות סוקרטיות להפרכת מחשבה',
      'זיהוי עיוותי חשיבה והחלפת ניסוח',
      'בדיקת פרופורציות והערכת סיכון מחדש',
      'פרספקטיבות חלופיות על אותו מצב',
      'מחשבה מתווכת בין קיצוניות לאיזון',
      'דיבור עצמי תומך ומכוון פעולה',
      'ערעור אמונה מגבילה ובניית אמונה גמישה',
      'ניסוי התנהגותי לבדיקת מחשבה',
      'תסריט תגובה למצבי טריגר',
      'סיכום מחשבה מאוזנת ותכנית המשך',
    ],
    topicKeywords: [
      'הפרכת מחשבות',
      'גמישות מחשבתית',
      'מחשבות שליליות',
      'מחשבות אוטומטיות',
      'ערעור מחשבות',
      'בדיקת ראיות',
      'שאלות סוקרטיות',
      'עיוותי חשיבה',
      'פרופורציות',
      'פרספקטיבה',
      'מחשבה מתווכת',
      'דיבור עצמי',
      'אמונות מגבילות',
      'להפריך',
    ],
    whenToUseHe:
      'כאשר המטופל רוצה ללמוד להפריך מחשבות שליליות, לפתח גמישות מחשבתית, לבדוק ראיות ולאתגר עיוותי חשיבה — עבודה קוגניטיבית מעמיקה.',
    preferWhenHe: [
      'הפרכת מחשבות',
      'מחשבות שליליות',
      'ערעור מחשבות',
      'בדיקת ראיות',
      'שאלות סוקרטיות',
      'עיוותי חשיבה',
      'פרופורציות',
      'פרספקטיבה',
      'מחשבה מתווכת',
      'דיבור עצמי',
      'אמונות מגבילות',
      'גמישות מחשבתית',
    ],
    // When user asks for a workbook/קונטרס on negative thoughts, do NOT send only
    // cbt-thought-record — send this workbook instead.
    lowerPriorityIndividualForms: [
      'tf-adults-cbt-thought-record',
      'tf-adults-cognitive-distortions-worksheet',
    ],
  },

  // ── 4. Emotional Regulation ──────────────────────────────────────────────────
  {
    id: 'tf-adults-emotional-regulation-premium-he',
    slug: 'adults-emotional-regulation-premium-he',
    titleHe: 'קונטרס זיהוי וויסות רגשי',
    descriptionHe:
      'קונטרס טיפולי מלא לזיהוי רגשות חזקים, ויסות רגשי, עבודה על פחד, חרדה, עצב, כעס, בושה ואשמה.',
    internalForms: [
      'מפת רגשות ראשונית',
      'עוצמת הרגש לאורך זמן',
      'פחד וחרדה',
      'עצב, ירידה ומועקה',
      'כעס ותסכול',
      'בושה ואשמה',
      'אירועים שמפעילים רגשות',
      'תחושות גוף ודחפים לפעולה',
      'תגובה רגשית לעומת תגובה מווסתת',
      'כלים לוויסות בזמן אמת',
      'ויסות לפני, במהלך ואחרי אירוע',
      'רגשות מעורבים וקונפליקט פנימי',
      'שיחה פנימית מרגיעה',
      'סיכום תכנית ויסות אישית',
    ],
    topicKeywords: [
      'ויסות רגשי',
      'הצפה רגשית',
      'רגשות חזקים',
      'פחד',
      'חרדה',
      'עצב',
      'כעס',
      'בושה',
      'אשמה',
      'דחפים',
      'התפרצות',
      'רגשות מעורבים',
      'להירגע',
      'לשלוט ברגש',
    ],
    whenToUseHe:
      'כאשר המטופל מדווח על רגשות חזקים, הצפה רגשית, קושי להירגע, או רוצה לפתח כלים לוויסות רגשי.',
    preferWhenHe: [
      'ויסות רגשי',
      'רגשות חזקים',
      'הצפה רגשית',
      'פחד',
      'חרדה',
      'עצב',
      'כעס',
      'בושה',
      'אשמה',
      'דחפים',
      'התפרצות',
      'רגשות מעורבים',
      'להירגע',
      'לשלוט ברגש',
    ],
    lowerPriorityIndividualForms: [
      'tf-adults-mood-tracking-sheet',
    ],
  },

  // ── 5. Coping & Change ────────────────────────────────────────────────────────
  {
    id: 'tf-adults-coping-change-premium-he',
    slug: 'adults-coping-change-premium-he',
    titleHe: 'קונטרס התמודדות ושינוי',
    descriptionHe:
      'קונטרס טיפולי מלא לפיתוח מיומנויות התמודדות — דחיינות, הימנעות, הרגלים מקשים, אסרטיביות, גבולות ופתרון בעיות.',
    internalForms: [
      'מפת התמודדות אישית',
      'הימנעות וצעדים הדרגתיים',
      'דחיינות ותחילת פעולה',
      'הרגל מקשה והרגל חלופי',
      'מיומנויות חברתיות בסיסיות',
      'תקשורת אסרטיבית',
      'גבולות אישיים',
      'פתרון בעיות מעשי',
      'ניהול עומס ושגרה',
      'התמודדות עם ביקורת',
      'ויסות דחפים ותגובה לפני פעולה',
      'שימור שינוי ומניעת חזרה לדפוס',
    ],
    topicKeywords: [
      'דחיינות',
      'הימנעות',
      'הרגלים מקשים',
      'שינוי התנהגות',
      'שינוי הרגלים',
      'מיומנויות חברתיות',
      'אסרטיביות',
      'גבולות',
      'פתרון בעיות',
      'ניהול עומס',
      'ביקורת',
      'ויסות דחפים',
      'שינוי דפוסים',
      'התמודדות',
    ],
    whenToUseHe:
      'כאשר המטופל מתמודד עם דחיינות, הימנעות, הרגלים מקשים, קשיים אסרטיביים, גבולות, פתרון בעיות או שינוי דפוסי התנהגות.',
    preferWhenHe: [
      'דחיינות',
      'הימנעות',
      'הרגלים מקשים',
      'שינוי התנהגות',
      'מיומנויות חברתיות',
      'אסרטיביות',
      'גבולות',
      'פתרון בעיות',
      'עומס',
      'ביקורת',
      'דחפים',
      'שינוי דפוסים',
    ],
    // When user asks for a workbook about דחיינות/הימנעות/הרגלים מקשים,
    // do NOT attach behavioral-activation-plan — attach this workbook instead.
    lowerPriorityIndividualForms: [
      'tf-adults-behavioral-activation-plan',
      'tf-adults-weekly-coping-plan',
    ],
  },

  // ── 6. Strengths & Resilience ────────────────────────────────────────────────
  {
    id: 'tf-adults-strengths-resilience-premium-he',
    slug: 'adults-strengths-resilience-premium-he',
    titleHe: 'קונטרס כוחות וחוסן',
    descriptionHe:
      'קונטרס טיפולי מלא לחיזוק כוחות אישיים, מסוגלות, חוסן, ביטחון עצמי ורשת תמיכה.',
    internalForms: [
      'מפת כוחות אישית',
      'הצלחות קודמות כמשאב',
      'ערכים כעוגן טיפולי',
      'רשת תמיכה ומשאבים',
      'מסוגלות עצמית',
      'קול פנימי מחזק',
      'כוחות בתוך קשרים',
      'חוסן בזמן לחץ',
      'תקווה מציאותית',
      'זהות מעבר לקושי',
      'תכנית שימוש בכוחות בטיפול',
    ],
    topicKeywords: [
      'כוחות',
      'חוזקות',
      'חוסן',
      'גורמי חוסן',
      'ביטחון עצמי',
      'מסוגלות',
      'תחושת מסוגלות',
      'משאבים',
      'תקווה',
      'ערכים',
      'רשת תמיכה',
      'קול פנימי מחזק',
    ],
    whenToUseHe:
      'כאשר המטפל רוצה לחזק את המטופל, לבנות על כוחות, ביטחון עצמי, מסוגלות וחוסן — עבודה חיובית וממוקדת משאבים.',
    preferWhenHe: [
      'כוחות',
      'חוזקות',
      'חוסן',
      'גורמי חוסן',
      'ביטחון עצמי',
      'מסוגלות',
      'תחושת מסוגלות',
      'משאבים',
      'תקווה',
      'ערכים',
      'רשת תמיכה',
      'קול פנימי מחזק',
    ],
    lowerPriorityIndividualForms: [
      'tf-adults-values-and-goals-worksheet',
    ],
  },

  // ── 7. Treatment Summary & Custom Forms ──────────────────────────────────────
  {
    id: 'tf-adults-treatment-summary-custom-forms-premium-he',
    slug: 'adults-treatment-summary-custom-forms-premium-he',
    titleHe: 'קונטרס סיכום טיפול וטפסים אישיים',
    descriptionHe:
      'קונטרס טיפולי מלא לסיכום תהליך הטיפול, הישגים, כלים שנלקחו, תכנית המשך וטפסים אישיים שנבנו עם המטפל.',
    internalForms: [
      'סיכום מסע טיפולי',
      'הישגים ותהליכי שינוי',
      'כלים שלקחתי מהטיפול',
      'מה למדתי על עצמי',
      'קשר טיפולי ומשוב',
      'תכנית המשך לאחר סיום',
      'טופס אישי לבנייה משותפת',
      'טופס ריק למעקב שבועי',
      'טופס ריק לאירוע משמעותי',
      'טופס ריק לניסוי טיפולי',
      'דף אישי פתוח',
      'סיכום אישי אחרון',
    ],
    topicKeywords: [
      'סיכום טיפול',
      'סיכום תהליך',
      'סיום טיפול',
      'לסכם',
      'טופס אישי',
      'טפסים אישיים',
      'טופס ריק',
      'מה למדתי',
      'תכנית המשך',
      'משוב על הטיפול',
      'לבנות טופס',
      'טפסים מותאמים',
    ],
    whenToUseHe:
      'כאשר המטפל והמטופל מתקרבים לסיום הטיפול ורוצים לסכם את התהליך, לבנות תכנית המשך ולייצר טפסים מותאמים אישית.',
    preferWhenHe: [
      'סיכום טיפול',
      'סיום טיפול',
      'לסכם',
      'מה למדתי בטיפול',
      'משוב על הטיפול',
      'טופס אישי',
      'טופס ריק',
      'טפסים מותאמים',
      'לבנות טופס עם המטפל',
      'תכנית המשך',
    ],
    lowerPriorityIndividualForms: [],
  },
];

/**
 * Quickly look up workbook metadata by form ID.
 * Returns undefined when not found.
 *
 * @param {string} formId
 * @returns {WorkbookMeta|undefined}
 */
export function getWorkbookMetaById(formId) {
  return WORKBOOK_CONTENT_METADATA.find(wb => wb.id === formId);
}

/**
 * Returns the set of individual form IDs that should be demoted
 * when any workbook is a better fit.
 *
 * @returns {Set<string>}
 */
export function getLowerPriorityIndividualForms() {
  const ids = new Set();
  for (const wb of WORKBOOK_CONTENT_METADATA) {
    for (const id of wb.lowerPriorityIndividualForms) {
      ids.add(id);
    }
  }
  return ids;
}

// ─────────────────────────────────────────────────────────────────────────────
// English Workbook Content Metadata — Phase 11
// ─────────────────────────────────────────────────────────────────────────────
//
// Topic keywords are English words/phrases used for scoring user queries.
// Routing rules mirror the Hebrew implementation:
//   - Explicit workbook trigger + ≥1 topic keyword  → return matching workbook
//   - ≥2 topic keywords from same workbook (multi-topic) → return matching workbook
//   - No sufficient match → return null

/** @type {WorkbookMeta[]} */
export const WORKBOOK_CONTENT_METADATA_EN = [
  // ── 1. Formulation & Mapping ─────────────────────────────────────────────────
  {
    id: 'tf-adults-formulation-mapping-premium-en',
    slug: 'adults-formulation-mapping-premium-en',
    internalForms: [
      'initial situation snapshot',
      'thoughts, emotions, and behavior map',
      'identifying the core difficulty',
      'strengths and resources',
      'expectations for therapy',
      'hopes, wishes, and goals',
      'self-image / how I see myself',
      'summary and next steps',
    ],
    topicKeywords: [
      'case formulation',
      'formulation',
      'mapping the problem',
      'understanding what is happening',
      'getting an overview',
      'therapy goals',
      'initial assessment',
      'repeated patterns',
      'treatment direction',
      'understanding the difficulty',
      'what is happening',
      'core difficulty',
      'case mapping',
    ],
    lowerPriorityIndividualForms: [],
  },

  // ── 2. Awareness & Identification ────────────────────────────────────────────
  {
    id: 'tf-adults-awareness-identification-premium-en',
    slug: 'adults-awareness-identification-premium-en',
    internalForms: [
      'identifying an event and first thought',
      'automatic thoughts log',
      'identifying emotions and intensity',
      'body sensations map',
      'actual response and behavior',
      'situation-thought-emotion-body-behavior chain',
      'repeated patterns and triggers',
      'initial summary for further work',
    ],
    topicKeywords: [
      'identifying thoughts',
      'identifying emotions',
      'body sensations',
      'behavior patterns',
      'tracking thoughts',
      'tracking emotions',
      'triggers',
      'automatic thoughts',
      'understanding reactions',
      'cbt chain',
      'situation thought emotion behavior',
      'thought log',
      'emotion log',
    ],
    lowerPriorityIndividualForms: [
      'tf-adults-cbt-thought-record',
    ],
  },

  // ── 3. Cognitive Flexibility ─────────────────────────────────────────────────
  {
    id: 'tf-adults-cognitive-flexibility-premium-en',
    slug: 'adults-cognitive-flexibility-premium-en',
    internalForms: [
      'identifying an automatic thought and core assumption',
      'evidence for and against the thought',
      'Socratic questions for thought challenging',
      'cognitive distortions and rewording',
      'proportion and risk reappraisal',
      'alternative perspectives',
      'mediating thought between extremes',
      'supportive self-talk',
      'challenging limiting beliefs',
      'behavioral experiment for a thought',
      'trigger response script',
      'balanced thought and next plan',
    ],
    topicKeywords: [
      'negative thoughts',
      'thought challenging',
      'challenging automatic thoughts',
      'cognitive distortions',
      'unhelpful thoughts',
      'evidence for and against',
      'socratic questions',
      'balanced thinking',
      'cognitive flexibility',
      'self-talk',
      'limiting beliefs',
      'perspective',
      'catastrophizing',
      'all-or-nothing thinking',
      'automatic thoughts',
      'thought record',
    ],
    // When user asks for a workbook about negative thoughts, do NOT attach only
    // cbt-thought-record or cognitive-distortions-worksheet — attach this workbook.
    lowerPriorityIndividualForms: [
      'tf-adults-cbt-thought-record',
      'tf-adults-cognitive-distortions-worksheet',
    ],
  },

  // ── 4. Emotional Regulation ──────────────────────────────────────────────────
  {
    id: 'tf-adults-emotional-regulation-premium-en',
    slug: 'adults-emotional-regulation-premium-en',
    internalForms: [
      'initial emotion map',
      'emotion intensity over time',
      'fear and anxiety',
      'sadness, low mood, and heaviness',
      'anger and frustration',
      'shame and guilt',
      'events that activate emotions',
      'body sensations and action urges',
      'emotional reaction versus regulated response',
      'real-time regulation tools',
      'before, during, and after an event',
      'mixed emotions and inner conflict',
      'calming inner conversation',
      'personal regulation plan',
    ],
    topicKeywords: [
      'emotional regulation',
      'strong emotions',
      'emotional overwhelm',
      'anxiety',
      'fear',
      'sadness',
      'low mood',
      'anger',
      'frustration',
      'shame',
      'guilt',
      'urges',
      'emotional triggers',
      'mixed emotions',
      'calming down',
      'regulation tools',
    ],
    lowerPriorityIndividualForms: [
      'tf-adults-mood-tracking-sheet',
    ],
  },

  // ── 5. Coping & Change ────────────────────────────────────────────────────────
  {
    id: 'tf-adults-coping-change-premium-en',
    slug: 'adults-coping-change-premium-en',
    internalForms: [
      'personal coping map',
      'avoidance and gradual steps',
      'procrastination and starting action',
      'difficult habit and alternative habit',
      'basic social skills',
      'assertive communication',
      'personal boundaries',
      'practical problem solving',
      'managing load and routine',
      'coping with criticism',
      'impulse regulation before action',
      'maintaining change and preventing relapse',
    ],
    topicKeywords: [
      'procrastination',
      'avoidance',
      'difficult habits',
      'behavior change',
      'coping skills',
      'social skills',
      'assertiveness',
      'boundaries',
      'problem solving',
      'routine',
      'overload',
      'criticism',
      'impulses',
      'relapse prevention',
      'changing patterns',
    ],
    // When user asks for a workbook about procrastination/avoidance/difficult habits,
    // do NOT attach behavioral-activation-plan — attach this workbook instead.
    lowerPriorityIndividualForms: [
      'tf-adults-behavioral-activation-plan',
      'tf-adults-weekly-coping-plan',
    ],
  },

  // ── 6. Strengths & Resilience ────────────────────────────────────────────────
  {
    id: 'tf-adults-strengths-resilience-premium-en',
    slug: 'adults-strengths-resilience-premium-en',
    internalForms: [
      'personal strengths map',
      'past successes as resources',
      'values as a therapeutic anchor',
      'support network and resources',
      'self-efficacy',
      'strengthening inner voice',
      'strengths in relationships',
      'resilience under stress',
      'realistic hope',
      'identity beyond the difficulty',
      'using strengths in therapy',
    ],
    topicKeywords: [
      'strengths',
      'resilience',
      'self-confidence',
      'self-efficacy',
      'resources',
      'hope',
      'values',
      'support network',
      'empowering inner voice',
      'identity beyond the problem',
      'protective factors',
      'coping resources',
    ],
    lowerPriorityIndividualForms: [
      'tf-adults-values-and-goals-worksheet',
    ],
  },

  // ── 7. Treatment Summary & Custom Forms ──────────────────────────────────────
  {
    id: 'tf-adults-treatment-summary-custom-forms-premium-en',
    slug: 'adults-treatment-summary-custom-forms-premium-en',
    internalForms: [
      'therapeutic journey summary',
      'achievements and change processes',
      'tools I am taking from therapy',
      'what I learned about myself',
      'therapeutic relationship and feedback',
      'post-treatment continuation plan',
      'custom form built together',
      'blank weekly tracking form',
      'blank significant event form',
      'blank therapeutic experiment form',
      'open personal page',
      'final personal summary',
    ],
    topicKeywords: [
      'treatment summary',
      'ending therapy',
      'reviewing therapy',
      'therapy feedback',
      'continuation plan',
      'what I learned in therapy',
      'custom form',
      'blank form',
      'personalized worksheet',
      'build a form with my therapist',
      'weekly tracking',
      'therapeutic experiment',
    ],
    lowerPriorityIndividualForms: [],
  },
];

/**
 * Quickly look up English workbook metadata by form ID.
 * Returns undefined when not found.
 *
 * @param {string} formId
 * @returns {WorkbookMeta|undefined}
 */
export function getWorkbookMetaByIdEn(formId) {
  return WORKBOOK_CONTENT_METADATA_EN.find(wb => wb.id === formId);
}

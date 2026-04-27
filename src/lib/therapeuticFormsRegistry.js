/**
 * Therapeutic Forms Registry — Phase 1B
 *
 * Categorized multilingual registry of static therapeutic worksheet PDFs.
 *
 * AUDIENCE TAXONOMY
 *   children      — ages 5–12
 *   adolescents   — ages 13–17
 *   adults        — ages 18–64
 *   older_adults  — ages 65+
 *
 * LANGUAGE TAXONOMY
 *   en  — English  (supported, with real PDF assets)
 *   he  — Hebrew   (supported, with real PDF assets; rtl: true)
 *   es  — Spanish  (seed only, no PDF asset yet)
 *   fr  — French   (seed only, no PDF asset yet)
 *   de  — German   (seed only, no PDF asset yet)
 *   it  — Italian  (seed only, no PDF asset yet)
 *   pt  — Portuguese (seed only, no PDF asset yet)
 *
 * APPROVAL RULES
 *   approved: true  — real valid static PDF asset exists at file_url
 *   approved: false — seed placeholder, no real asset yet
 *
 * FILE URL CONVENTION
 *   /forms/<lang>/<audience>/<slug>.pdf
 *   Served from public/forms/ as a static Vite asset.
 *
 * DO NOT add approved: true without a real file existing at public/<file_url>.
 * DO NOT add file_url for unsupported language variants.
 */

/** @type {Array<TherapeuticFormEntry>} */
export const THERAPEUTIC_FORMS_REGISTRY = [
  // ──────────────────────────────────────────────────────────────────────────
  // ADULTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'cbt-thought-record',
    slug: 'cbt-thought-record',
    audience: 'adults',
    therapeutic_purpose: 'cbt_thought_record',
    languages: {
      en: {
        title: 'CBT Thought Record',
        description: 'A structured worksheet for identifying and challenging automatic thoughts using the CBT thought record model.',
        file_url: '/forms/en/adults/cbt-thought-record.pdf',
        file_name: 'cbt-thought-record.pdf',
        file_type: 'pdf',
        rtl: false,
        approved: true,
      },
      he: {
        title: 'טבלת מחשבות CBT',
        description: 'דף עבודה מובנה לזיהוי ואתגר מחשבות אוטומטיות באמצעות מודל טבלת המחשבות של CBT.',
        file_url: '/forms/he/adults/cbt-thought-record.pdf',
        file_name: 'cbt-thought-record.pdf',
        file_type: 'pdf',
        rtl: true,
        approved: true,
      },
      es: { title: 'Registro de pensamientos TCC', approved: false },
      fr: { title: 'Fiche de pensées TCC', approved: false },
      de: { title: 'KVT-Gedankenprotokoll', approved: false },
      it: { title: 'Registro dei pensieri TCC', approved: false },
      pt: { title: 'Registro de pensamentos TCC', approved: false },
    },
  },
  {
    id: 'behavioral-activation-plan',
    slug: 'behavioral-activation-plan',
    audience: 'adults',
    therapeutic_purpose: 'weekly_practice_plan',
    languages: {
      en: {
        title: 'Behavioral Activation Plan',
        description: 'A practical worksheet for scheduling enjoyable or meaningful activities to gradually lift mood.',
        file_url: '/forms/en/adults/behavioral-activation-plan.pdf',
        file_name: 'behavioral-activation-plan.pdf',
        file_type: 'pdf',
        rtl: false,
        approved: true,
      },
      he: {
        title: 'תוכנית הפעלה התנהגותית',
        description: 'דף עבודה מעשי לתזמון פעילויות מהנות או משמעותיות לשיפור הדרגתי של מצב הרוח.',
        file_url: '/forms/he/adults/behavioral-activation-plan.pdf',
        file_name: 'behavioral-activation-plan.pdf',
        file_type: 'pdf',
        rtl: true,
        approved: true,
      },
      es: { title: 'Plan de activación conductual', approved: false },
      fr: { title: "Plan d'activation comportementale", approved: false },
      de: { title: 'Verhaltensaktivierungsplan', approved: false },
      it: { title: 'Piano di attivazione comportamentale', approved: false },
      pt: { title: 'Plano de ativação comportamental', approved: false },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // ADOLESCENTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'anxiety-thought-record',
    slug: 'anxiety-thought-record',
    audience: 'adolescents',
    therapeutic_purpose: 'cbt_thought_record',
    languages: {
      en: {
        title: 'Anxiety Thought Record',
        description: 'A CBT-based thought record worksheet adapted for adolescents to identify and challenge anxious thoughts.',
        file_url: '/forms/en/adolescents/anxiety-thought-record.pdf',
        file_name: 'anxiety-thought-record.pdf',
        file_type: 'pdf',
        rtl: false,
        approved: true,
      },
      he: {
        title: 'טבלת מחשבות לחרדה',
        description: 'דף עבודה מבוסס CBT המותאם לבני נוער לזיהוי ואתגר מחשבות חרדה.',
        file_url: '/forms/he/adolescents/anxiety-thought-record.pdf',
        file_name: 'anxiety-thought-record.pdf',
        file_type: 'pdf',
        rtl: true,
        approved: true,
      },
      es: { title: 'Registro de pensamientos de ansiedad', approved: false },
      fr: { title: "Fiche de pensées anxieuses", approved: false },
      de: { title: 'Angst-Gedankenprotokoll', approved: false },
      it: { title: 'Registro dei pensieri ansiosi', approved: false },
      pt: { title: 'Registro de pensamentos de ansiedade', approved: false },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // CHILDREN
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'simple-feelings-check-in',
    slug: 'simple-feelings-check-in',
    audience: 'children',
    therapeutic_purpose: 'mood_reflection_worksheet',
    languages: {
      en: {
        title: 'Simple Feelings Check-In',
        description: 'A child-friendly worksheet for identifying feelings, locating them in the body, and exploring a personal calm-down plan.',
        file_url: '/forms/en/children/simple-feelings-check-in.pdf',
        file_name: 'simple-feelings-check-in.pdf',
        file_type: 'pdf',
        rtl: false,
        approved: true,
      },
      he: {
        title: 'בדיקת רגשות פשוטה',
        description: 'דף עבודה ידידותי לילדים לזיהוי רגשות, איתורם בגוף ובניית תוכנית הרגעה אישית.',
        file_url: '/forms/he/children/simple-feelings-check-in.pdf',
        file_name: 'simple-feelings-check-in.pdf',
        file_type: 'pdf',
        rtl: true,
        approved: true,
      },
      es: { title: 'Control de emociones simple', approved: false },
      fr: { title: 'Vérification simple des émotions', approved: false },
      de: { title: 'Einfaches Gefühls-Check-in', approved: false },
      it: { title: 'Semplice verifica delle emozioni', approved: false },
      pt: { title: 'Verificação simples de sentimentos', approved: false },
    },
  },

  // ──────────────────────────────────────────────────────────────────────────
  // OLDER ADULTS
  // ──────────────────────────────────────────────────────────────────────────
  {
    id: 'mood-reflection-sheet',
    slug: 'mood-reflection-sheet',
    audience: 'older_adults',
    therapeutic_purpose: 'mood_reflection_worksheet',
    languages: {
      en: {
        title: 'Mood Reflection Sheet',
        description: 'A gentle daily mood reflection worksheet for older adults, including self-care check-in and gratitude prompts.',
        file_url: '/forms/en/older_adults/mood-reflection-sheet.pdf',
        file_name: 'mood-reflection-sheet.pdf',
        file_type: 'pdf',
        rtl: false,
        approved: true,
      },
      he: {
        title: 'דף התבוננות במצב הרוח',
        description: 'דף עבודה יומי לרפלקציה על מצב הרוח המיועד למבוגרים מבוגרים, כולל בדיקת טיפול עצמי ושאלות הכרת תודה.',
        file_url: '/forms/he/older_adults/mood-reflection-sheet.pdf',
        file_name: 'mood-reflection-sheet.pdf',
        file_type: 'pdf',
        rtl: true,
        approved: true,
      },
      es: { title: 'Hoja de reflexión sobre el estado de ánimo', approved: false },
      fr: { title: "Fiche de réflexion sur l'humeur", approved: false },
      de: { title: 'Stimmungsreflexionsbogen', approved: false },
      it: { title: "Foglio di riflessione sull'umore", approved: false },
      pt: { title: 'Folha de reflexão sobre o humor', approved: false },
    },
  },
];

/**
 * @typedef {Object} TherapeuticFormLanguageVariant
 * @property {string}   title
 * @property {string}   [description]
 * @property {string}   [file_url]
 * @property {string}   [file_name]
 * @property {'pdf'}    [file_type]
 * @property {boolean}  [rtl]
 * @property {boolean}  approved
 */

/**
 * @typedef {Object} TherapeuticFormEntry
 * @property {string}  id
 * @property {string}  slug
 * @property {'children'|'adolescents'|'adults'|'older_adults'} audience
 * @property {string}  therapeutic_purpose
 * @property {Record<string, TherapeuticFormLanguageVariant>} languages
 */

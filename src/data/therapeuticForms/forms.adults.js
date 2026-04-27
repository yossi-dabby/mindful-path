/**
 * TherapeuticForms — Adults (audience: "adults")
 *
 * Seed registry for the adults audience group.
 *
 * Phase 1 note:
 *   No real PDF assets exist yet. All forms carry `approved: false`.
 *   When real assets are available, update file_url and set `approved: true`.
 */

/** @type {import('./types.js').TherapeuticForm[]} */
export const FORMS_ADULTS = [
  {
    id: 'tf-adults-cbt-thought-record',
    slug: 'adults-cbt-thought-record',
    audience: 'adults',
    category: 'thought_records',
    therapeutic_use: 'Standard CBT thought record for identifying, examining, and reframing automatic thoughts.',
    approved: false,
    tags: ['cbt', 'thought-record', 'cognitive', 'adults'],
    languages: {
      en: {
        title: 'CBT Thought Record',
        description: 'A seven-column CBT thought record for examining automatic thoughts and developing balanced responses.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'cbt-thought-record-adults-en.pdf',
        rtl: false,
      },
      he: {
        title: 'רשומת מחשבות CBT',
        description: 'רשומת מחשבות CBT בשבעה עמודות לבחינת מחשבות אוטומטיות ופיתוח תגובות מאוזנות.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'cbt-thought-record-adults-he.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-adults-cognitive-distortions-worksheet',
    slug: 'adults-cognitive-distortions-worksheet',
    audience: 'adults',
    category: 'cognitive_distortions',
    therapeutic_use: 'Helps adults identify common cognitive distortions in their thinking patterns.',
    approved: false,
    tags: ['cognitive-distortions', 'cbt', 'adults', 'thinking-patterns'],
    languages: {
      en: {
        title: 'Cognitive Distortions Worksheet',
        description: 'A reference and reflection sheet listing common cognitive distortions with space to identify personal examples.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'cognitive-distortions-worksheet-adults-en.pdf',
        rtl: false,
      },
      he: {
        title: 'דף עבודה לעיוותי חשיבה',
        description: 'דף עיון ורפלקציה המפרט עיוותי חשיבה נפוצים עם מקום לדוגמאות אישיות.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'cognitive-distortions-worksheet-adults-he.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-adults-behavioral-activation-plan',
    slug: 'adults-behavioral-activation-plan',
    audience: 'adults',
    category: 'behavioral_activation',
    therapeutic_use: 'Supports adults in scheduling pleasurable and meaningful activities to counter low mood.',
    approved: false,
    tags: ['behavioral-activation', 'depression', 'mood', 'adults', 'activities'],
    languages: {
      en: {
        title: 'Behavioral Activation Plan',
        description: 'A structured plan for scheduling activities that bring pleasure and a sense of achievement.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'behavioral-activation-plan-adults-en.pdf',
        rtl: false,
      },
      he: {
        title: 'תכנית הפעלה התנהגותית',
        description: 'תכנית מובנית לתזמון פעילויות המביאות הנאה ותחושת הישג.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'behavioral-activation-plan-adults-he.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-adults-values-and-goals-worksheet',
    slug: 'adults-values-and-goals-worksheet',
    audience: 'adults',
    category: 'goals_and_values',
    therapeutic_use: 'Guides adults through clarifying personal values and setting aligned goals.',
    approved: false,
    tags: ['values', 'goals', 'adults', 'meaning', 'direction'],
    languages: {
      en: {
        title: 'Values and Goals Worksheet',
        description: 'A worksheet to clarify personal values and set meaningful, values-aligned goals.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'values-and-goals-worksheet-adults-en.pdf',
        rtl: false,
      },
      he: {
        title: 'דף עבודה לערכים ומטרות',
        description: 'דף עבודה להבהרת ערכים אישיים ולהגדרת מטרות משמעותיות המתואמות לערכים.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'values-and-goals-worksheet-adults-he.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
];

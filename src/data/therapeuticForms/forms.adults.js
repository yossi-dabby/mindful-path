/**
 * TherapeuticForms — Adults (audience: "adults")
 *
 * Registry for the adults audience group.
 *
 * Phase 1B update:
 *   Real PDF assets now exist for cbt-thought-record and behavioral-activation-plan.
 *   Those entries carry `approved: true` with valid file_url values.
 *   Remaining entries stay `approved: false` until their assets are ready.
 */

/** @type {import('./types.js').TherapeuticForm[]} */
export const FORMS_ADULTS = [
  {
    id: 'tf-adults-cbt-thought-record',
    slug: 'adults-cbt-thought-record',
    audience: 'adults',
    category: 'thought_records',
    therapeutic_use: 'Standard CBT thought record for identifying, examining, and reframing automatic thoughts.',
    approved: true,
    tags: ['cbt', 'thought-record', 'cognitive', 'adults'],
    languages: {
      en: {
        title: 'CBT Thought Record',
        description: 'A seven-column CBT thought record for examining automatic thoughts and developing balanced responses.',
        file_url: '/forms/en/adults/cbt-thought-record.pdf',
        file_type: 'pdf',
        file_name: 'cbt-thought-record.pdf',
        rtl: false,
      },
      he: {
        title: 'רשומת מחשבות CBT',
        description: 'רשומת מחשבות CBT בשבעה עמודות לבחינת מחשבות אוטומטיות ופיתוח תגובות מאוזנות.',
        file_url: '/forms/he/adults/cbt-thought-record.pdf',
        file_type: 'pdf',
        file_name: 'cbt-thought-record.pdf',
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
    approved: true,
    tags: ['behavioral-activation', 'mood', 'activity', 'adults'],
    languages: {
      en: {
        title: 'Behavioral Activation Plan',
        description: 'A practical worksheet for scheduling enjoyable or meaningful activities to gradually lift mood.',
        file_url: '/forms/en/adults/behavioral-activation-plan.pdf',
        file_type: 'pdf',
        file_name: 'behavioral-activation-plan.pdf',
        rtl: false,
      },
      he: {
        title: 'תוכנית הפעלה התנהגותית',
        description: 'דף עבודה מעשי לתזמון פעילויות מהנות או משמעותיות לשיפור הדרגתי של מצב הרוח.',
        file_url: '/forms/he/adults/behavioral-activation-plan.pdf',
        file_type: 'pdf',
        file_name: 'behavioral-activation-plan.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
];

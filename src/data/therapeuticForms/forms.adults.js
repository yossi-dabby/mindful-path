/**
 * TherapeuticForms — Adults (audience: "adults")
 *
 * Registry for the adults audience group.
 *
 * Phase 1B update:
 *   Real PDF assets now exist for cbt-thought-record and behavioral-activation-plan.
 *   Those entries carry `approved: true` with valid file_url values.
 *   Remaining entries stay `approved: false` until their assets are ready.
 *
 * Phase 4A/4B update:
 *   Approved cognitive-distortions-worksheet.
 *   Added values-and-goals-worksheet, mood-tracking-sheet, weekly-coping-plan.
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
    approved: true,
    tags: ['cognitive-distortions', 'cbt', 'adults', 'thinking-patterns'],
    languages: {
      en: {
        title: 'Cognitive Distortions Worksheet',
        description: 'A reference and reflection sheet listing common cognitive distortions with space to identify personal examples.',
        file_url: '/forms/en/adults/cognitive-distortions-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'cognitive-distortions-worksheet.pdf',
        rtl: false,
      },
      he: {
        title: 'דף עבודה לעיוותי חשיבה',
        description: 'דף עיון ורפלקציה המפרט עיוותי חשיבה נפוצים עם מקום לדוגמאות אישיות.',
        file_url: '/forms/he/adults/cognitive-distortions-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'cognitive-distortions-worksheet.pdf',
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
  {
    id: 'tf-adults-values-and-goals-worksheet',
    slug: 'adults-values-and-goals-worksheet',
    audience: 'adults',
    category: 'goals_and_values',
    therapeutic_use: 'Helps adults clarify personal values and translate them into meaningful goals.',
    approved: true,
    tags: ['values', 'goals', 'cbt', 'adults', 'goal-setting'],
    languages: {
      en: {
        title: 'Values and Goals Worksheet',
        description: 'A reflective worksheet to identify personal values and set aligned goals.',
        file_url: '/forms/en/adults/values-and-goals-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'values-and-goals-worksheet.pdf',
        rtl: false,
      },
      he: {
        title: 'דף עבודה לערכים ומטרות',
        description: 'דף עבודה להבהרת ערכים אישיים וקביעת מטרות תואמות.',
        file_url: '/forms/he/adults/values-and-goals-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'values-and-goals-worksheet.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-adults-mood-tracking-sheet',
    slug: 'adults-mood-tracking-sheet',
    audience: 'adults',
    category: 'reflection_journal',
    therapeutic_use: 'Supports adults in tracking daily mood patterns to identify triggers and trends.',
    approved: true,
    tags: ['mood', 'tracking', 'reflection', 'adults', 'daily'],
    languages: {
      en: {
        title: 'Mood Tracking Sheet',
        description: 'A daily sheet to log mood ratings, triggers, and brief notes.',
        file_url: '/forms/en/adults/mood-tracking-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-tracking-sheet.pdf',
        rtl: false,
      },
      he: {
        title: 'גיליון מעקב מצב רוח',
        description: 'גיליון יומי לרישום דירוגי מצב רוח, טריגרים והערות קצרות.',
        file_url: '/forms/he/adults/mood-tracking-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-tracking-sheet.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-adults-weekly-coping-plan',
    slug: 'adults-weekly-coping-plan',
    audience: 'adults',
    category: 'coping_tools',
    therapeutic_use: 'Helps adults build a structured weekly plan for applying coping strategies.',
    approved: true,
    tags: ['coping', 'weekly', 'plan', 'adults', 'strategy'],
    languages: {
      en: {
        title: 'Weekly Coping Plan',
        description: 'A structured weekly planner to schedule and reflect on coping strategies.',
        file_url: '/forms/en/adults/weekly-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'weekly-coping-plan.pdf',
        rtl: false,
      },
      he: {
        title: 'תוכנית התמודדות שבועית',
        description: 'מתכנן שבועי מובנה לתזמון ורפלקציה על אסטרטגיות התמודדות.',
        file_url: '/forms/he/adults/weekly-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'weekly-coping-plan.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
];

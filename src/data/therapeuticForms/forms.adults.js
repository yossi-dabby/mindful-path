/**
 * TherapeuticForms — Adults (audience: "adults")
 *
 * Registry for the adults audience group.
 *
 * Phase 1B update:
 *   Real PDF assets now exist for cbt-thought-record and behavioral-activation-plan.
 *   Those entries carry `approved: true` with valid file_url values.
 *
 * Phase 4A update:
 *   Real PDF assets added for cognitive-distortions-worksheet,
 *   values-and-goals-worksheet, mood-tracking-sheet, and weekly-coping-plan.
 *   All six adults entries are now approved.
 *
 * Phase 5 (Spanish) update:
 *   Spanish (es) language blocks added for all six adults entries.
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
      es: {
        title: 'Registro de Pensamientos TCC',
        description: 'Un registro de pensamientos TCC de siete columnas para examinar pensamientos automáticos y desarrollar respuestas equilibradas.',
        file_url: '/forms/es/adults/cbt-thought-record.pdf',
        file_type: 'pdf',
        file_name: 'cbt-thought-record.pdf',
        rtl: false,
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
      es: {
        title: 'Plan de Activación Conductual',
        description: 'Una hoja de trabajo práctica para programar actividades agradables o significativas y mejorar gradualmente el estado de ánimo.',
        file_url: '/forms/es/adults/behavioral-activation-plan.pdf',
        file_type: 'pdf',
        file_name: 'behavioral-activation-plan.pdf',
        rtl: false,
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
      es: {
        title: 'Hoja de Distorsiones Cognitivas',
        description: 'Una hoja de referencia y reflexión que enumera las distorsiones cognitivas comunes con espacio para ejemplos personales.',
        file_url: '/forms/es/adults/cognitive-distortions-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'cognitive-distortions-worksheet.pdf',
        rtl: false,
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
    therapeutic_use: 'Helps adults clarify personal values and set meaningful, values-aligned goals.',
    approved: true,
    tags: ['values', 'goals', 'adults', 'meaning', 'act'],
    languages: {
      en: {
        title: 'Values and Goals Worksheet',
        description: 'A reflective worksheet for identifying personal values and setting meaningful goals.',
        file_url: '/forms/en/adults/values-and-goals-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'values-and-goals-worksheet.pdf',
        rtl: false,
      },
      he: {
        title: 'דף ערכים ומטרות',
        description: 'דף עבודה לרפלקציה לזיהוי ערכים אישיים וקביעת מטרות משמעותיות.',
        file_url: '/forms/he/adults/values-and-goals-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'values-and-goals-worksheet.pdf',
        rtl: true,
      },
      es: {
        title: 'Hoja de Valores y Metas',
        description: 'Una hoja de trabajo reflexiva para identificar valores personales y establecer metas significativas.',
        file_url: '/forms/es/adults/values-and-goals-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'values-and-goals-worksheet.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-adults-mood-tracking-sheet',
    slug: 'adults-mood-tracking-sheet',
    audience: 'adults',
    category: 'depression_tools',
    therapeutic_use: 'Supports adults in tracking daily mood patterns and identifying factors that influence wellbeing.',
    approved: true,
    tags: ['mood', 'tracking', 'depression', 'adults', 'daily'],
    languages: {
      en: {
        title: 'Mood Tracking Sheet',
        description: 'A daily tracking sheet to monitor mood patterns and identify factors that influence wellbeing.',
        file_url: '/forms/en/adults/mood-tracking-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-tracking-sheet.pdf',
        rtl: false,
      },
      he: {
        title: 'דף מעקב מצב רוח',
        description: 'דף מעקב יומי לניטור דפוסי מצב רוח וזיהוי גורמים המשפיעים על רווחה.',
        file_url: '/forms/he/adults/mood-tracking-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-tracking-sheet.pdf',
        rtl: true,
      },
      es: {
        title: 'Hoja de Seguimiento del Estado de Ánimo',
        description: 'Una hoja de seguimiento diario para monitorear los patrones de estado de ánimo e identificar factores que influyen en el bienestar.',
        file_url: '/forms/es/adults/mood-tracking-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-tracking-sheet.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-adults-weekly-coping-plan',
    slug: 'adults-weekly-coping-plan',
    audience: 'adults',
    category: 'weekly_practice',
    therapeutic_use: 'Helps adults plan and review their weekly coping strategies with structured mid-week and end-of-week reflection.',
    approved: true,
    tags: ['coping', 'weekly', 'plan', 'adults', 'stress'],
    languages: {
      en: {
        title: 'Weekly Coping Plan',
        description: 'A structured weekly plan for building and using personal coping strategies.',
        file_url: '/forms/en/adults/weekly-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'weekly-coping-plan.pdf',
        rtl: false,
      },
      he: {
        title: 'תוכנית התמודדות שבועית',
        description: 'תכנית שבועית מובנית לבניית אסטרטגיות התמודדות אישיות ושימוש בהן.',
        file_url: '/forms/he/adults/weekly-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'weekly-coping-plan.pdf',
        rtl: true,
      },
      es: {
        title: 'Plan de Afrontamiento Semanal',
        description: 'Un plan semanal estructurado para construir y utilizar estrategias personales de afrontamiento.',
        file_url: '/forms/es/adults/weekly-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'weekly-coping-plan.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
];

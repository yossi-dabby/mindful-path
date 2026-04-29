/**
 * TherapeuticForms — Adolescents (audience: "adolescents")
 *
 * Registry for the adolescents audience group.
 *
 * Phase 1B update:
 *   Real PDF assets now exist for anxiety-thought-record.
 *   That entry carries `approved: true` with valid file_url values.
 *
 * Phase 4A update:
 *   Real PDF assets added for emotion-regulation-worksheet,
 *   weekly-practice-planner, and social-pressure-coping-tool.
 *   All four adolescents entries are now approved.
 *
 * Phase 5 (Spanish) update:
 *   Spanish (es) language blocks added for all four adolescents entries.
 *
 * Phase 6 (French) update:
 *   French (fr) language blocks added for all four adolescents entries.
 *
 * Phase 7 (German) update:
 *   German (de) language blocks added for all four adolescents entries.
 *
 * Phase 8 (Italian) update:
 *   Italian (it) language blocks added for all four adolescents entries.
 */

/** @type {import('./types.js').TherapeuticForm[]} */
export const FORMS_ADOLESCENTS = [
  {
    id: 'tf-adolescents-anxiety-thought-record',
    slug: 'adolescents-anxiety-thought-record',
    audience: 'adolescents',
    category: 'anxiety_tools',
    therapeutic_use: 'Guides adolescents through identifying anxious thoughts and examining the evidence for and against them.',
    approved: true,
    tags: ['anxiety', 'thought-record', 'cbt', 'adolescents'],
    recommended_for: ['adolescents_ages_13_to_17'],
    minimum_age: 13,
    maximum_age: 17,
    requires_parent_guidance: false,
    languages: {
      en: {
        title: 'Anxiety Thought Record',
        description: 'A structured worksheet to examine and challenge anxious thoughts.',
        file_url: '/forms/en/adolescents/anxiety-thought-record.pdf',
        file_type: 'pdf',
        file_name: 'anxiety-thought-record.pdf',
        rtl: false,
      },
      he: {
        title: 'רשומת מחשבות לחרדה',
        description: 'דף עבודה מובנה לבחינה ואתגור מחשבות חרדה.',
        file_url: '/forms/he/adolescents/anxiety-thought-record.pdf',
        file_type: 'pdf',
        file_name: 'anxiety-thought-record.pdf',
        rtl: true,
      },
      es: {
        title: 'Registro de Pensamientos Ansiosos',
        description: 'Una hoja de trabajo estructurada para examinar y desafiar pensamientos ansiosos.',
        file_url: '/forms/es/adolescents/anxiety-thought-record.pdf',
        file_type: 'pdf',
        file_name: 'anxiety-thought-record.pdf',
        rtl: false,
      },
      fr: {
        title: 'Journal des Pensées Anxieuses',
        description: 'Une fiche de travail structurée pour examiner et challenger les pensées anxieuses.',
        file_url: '/forms/fr/adolescents/anxiety-thought-record.pdf',
        file_type: 'pdf',
        file_name: 'anxiety-thought-record.pdf',
        rtl: false,
      },
      de: {
        title: 'Angst-Gedankenprotokoll',
        description: 'Ein strukturiertes Arbeitsblatt zur Untersuchung und Herausforderung ängstlicher Gedanken.',
        file_url: '/forms/de/adolescents/anxiety-thought-record.pdf',
        file_type: 'pdf',
        file_name: 'anxiety-thought-record.pdf',
        rtl: false,
      },
      it: {
        title: 'Registro dei Pensieri d\'Ansia',
        description: 'Un foglio di lavoro strutturato per esaminare e sfidare i pensieri ansiosi.',
        file_url: '/forms/it/adolescents/anxiety-thought-record.pdf',
        file_type: 'pdf',
        file_name: 'anxiety-thought-record.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-adolescents-emotion-regulation-worksheet',
    slug: 'adolescents-emotion-regulation-worksheet',
    audience: 'adolescents',
    category: 'emotional_regulation',
    therapeutic_use: 'Helps adolescents recognize emotional triggers, intensity, and healthy response strategies.',
    approved: true,
    tags: ['emotions', 'regulation', 'cbt', 'adolescents', 'triggers'],
    recommended_for: ['adolescents_ages_13_to_17'],
    minimum_age: 13,
    maximum_age: 17,
    requires_parent_guidance: false,
    languages: {
      en: {
        title: 'Emotion Regulation Worksheet',
        description: 'A worksheet to track emotional triggers, intensity, and healthy responses.',
        file_url: '/forms/en/adolescents/emotion-regulation-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'emotion-regulation-worksheet.pdf',
        rtl: false,
      },
      he: {
        title: 'דף עבודה לוויסות רגשי',
        description: 'דף לעקיבה אחר טריגרים רגשיים, עוצמה ותגובות בריאות.',
        file_url: '/forms/he/adolescents/emotion-regulation-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'emotion-regulation-worksheet.pdf',
        rtl: true,
      },
      es: {
        title: 'Hoja de Regulación Emocional',
        description: 'Una hoja para registrar desencadenantes emocionales, intensidad y respuestas saludables.',
        file_url: '/forms/es/adolescents/emotion-regulation-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'emotion-regulation-worksheet.pdf',
        rtl: false,
      },
      fr: {
        title: 'Fiche de Régulation Émotionnelle',
        description: "Une fiche pour suivre les déclencheurs émotionnels, l'intensité et les réponses saines.",
        file_url: '/forms/fr/adolescents/emotion-regulation-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'emotion-regulation-worksheet.pdf',
        rtl: false,
      },
      de: {
        title: 'Arbeitsblatt zur Emotionsregulation',
        description: 'Ein Arbeitsblatt zur Erfassung emotionaler Auslöser, Intensität und gesunder Reaktionen.',
        file_url: '/forms/de/adolescents/emotion-regulation-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'emotion-regulation-worksheet.pdf',
        rtl: false,
      },
      it: {
        title: 'Foglio di Lavoro per la Regolazione Emotiva',
        description: 'Un foglio per tracciare i fattori scatenanti emotivi, l\'intensità e le risposte sane.',
        file_url: '/forms/it/adolescents/emotion-regulation-worksheet.pdf',
        file_type: 'pdf',
        file_name: 'emotion-regulation-worksheet.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-adolescents-weekly-practice-planner',
    slug: 'adolescents-weekly-practice-planner',
    audience: 'adolescents',
    category: 'weekly_practice',
    therapeutic_use: 'Supports adolescents in planning and tracking weekly therapeutic practice activities.',
    approved: true,
    tags: ['planning', 'weekly', 'practice', 'adolescents', 'tracking'],
    recommended_for: ['adolescents_ages_13_to_17'],
    minimum_age: 13,
    maximum_age: 17,
    requires_parent_guidance: false,
    languages: {
      en: {
        title: 'Weekly Practice Planner',
        description: 'A weekly planner to schedule and reflect on therapeutic activities.',
        file_url: '/forms/en/adolescents/weekly-practice-planner.pdf',
        file_type: 'pdf',
        file_name: 'weekly-practice-planner.pdf',
        rtl: false,
      },
      he: {
        title: 'מתכנן תרגול שבועי',
        description: 'מתכנן שבועי לתזמון ורפלקציה על פעילויות טיפוליות.',
        file_url: '/forms/he/adolescents/weekly-practice-planner.pdf',
        file_type: 'pdf',
        file_name: 'weekly-practice-planner.pdf',
        rtl: true,
      },
      es: {
        title: 'Planificador de Práctica Semanal',
        description: 'Un planificador semanal para programar y reflexionar sobre actividades terapéuticas.',
        file_url: '/forms/es/adolescents/weekly-practice-planner.pdf',
        file_type: 'pdf',
        file_name: 'weekly-practice-planner.pdf',
        rtl: false,
      },
      fr: {
        title: 'Planificateur de Pratique Hebdomadaire',
        description: 'Un planificateur hebdomadaire pour organiser et réfléchir aux activités thérapeutiques.',
        file_url: '/forms/fr/adolescents/weekly-practice-planner.pdf',
        file_type: 'pdf',
        file_name: 'weekly-practice-planner.pdf',
        rtl: false,
      },
      de: {
        title: 'Wöchentlicher Übungsplaner',
        description: 'Ein Wochenplaner zum Planen und Reflektieren therapeutischer Aktivitäten.',
        file_url: '/forms/de/adolescents/weekly-practice-planner.pdf',
        file_type: 'pdf',
        file_name: 'weekly-practice-planner.pdf',
        rtl: false,
      },
      it: {
        title: 'Pianificatore di Pratica Settimanale',
        description: 'Un pianificatore settimanale per programmare e riflettere sulle attività terapeutiche.',
        file_url: '/forms/it/adolescents/weekly-practice-planner.pdf',
        file_type: 'pdf',
        file_name: 'weekly-practice-planner.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-adolescents-social-pressure-coping-tool',
    slug: 'adolescents-social-pressure-coping-tool',
    audience: 'adolescents',
    category: 'social_skills',
    therapeutic_use: 'Helps adolescents identify social pressures and practise assertive, values-based responses.',
    approved: true,
    tags: ['social-pressure', 'assertiveness', 'adolescents', 'coping', 'peers'],
    recommended_for: ['adolescents_ages_13_to_17'],
    minimum_age: 13,
    maximum_age: 17,
    requires_parent_guidance: false,
    languages: {
      en: {
        title: 'Social Pressure Coping Tool',
        description: 'A worksheet to help adolescents identify social pressures and practise assertive responses.',
        file_url: '/forms/en/adolescents/social-pressure-coping-tool.pdf',
        file_type: 'pdf',
        file_name: 'social-pressure-coping-tool.pdf',
        rtl: false,
      },
      he: {
        title: 'כלי התמודדות עם לחץ חברתי',
        description: 'דף עבודה לסיוע למתבגרים לזהות לחצים חברתיים ולתרגל תגובות אסרטיביות.',
        file_url: '/forms/he/adolescents/social-pressure-coping-tool.pdf',
        file_type: 'pdf',
        file_name: 'social-pressure-coping-tool.pdf',
        rtl: true,
      },
      es: {
        title: 'Herramienta para Afrontar la Presión Social',
        description: 'Una hoja de trabajo para ayudar a los adolescentes a identificar presiones sociales y practicar respuestas asertivas.',
        file_url: '/forms/es/adolescents/social-pressure-coping-tool.pdf',
        file_type: 'pdf',
        file_name: 'social-pressure-coping-tool.pdf',
        rtl: false,
      },
      fr: {
        title: 'Outil de Gestion de la Pression Sociale',
        description: 'Une fiche de travail pour aider les adolescents à identifier les pressions sociales et pratiquer des réponses assertives.',
        file_url: '/forms/fr/adolescents/social-pressure-coping-tool.pdf',
        file_type: 'pdf',
        file_name: 'social-pressure-coping-tool.pdf',
        rtl: false,
      },
      de: {
        title: 'Bewältigungstool für sozialen Druck',
        description: 'Ein Arbeitsblatt, das Jugendlichen hilft, sozialen Druck zu erkennen und selbstbewusste Reaktionen zu üben.',
        file_url: '/forms/de/adolescents/social-pressure-coping-tool.pdf',
        file_type: 'pdf',
        file_name: 'social-pressure-coping-tool.pdf',
        rtl: false,
      },
      it: {
        title: 'Strumento per Affrontare la Pressione Sociale',
        description: 'Un foglio di lavoro per aiutare gli adolescenti a identificare le pressioni sociali e praticare risposte assertive.',
        file_url: '/forms/it/adolescents/social-pressure-coping-tool.pdf',
        file_type: 'pdf',
        file_name: 'social-pressure-coping-tool.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
];

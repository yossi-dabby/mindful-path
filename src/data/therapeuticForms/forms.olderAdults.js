/**
 * TherapeuticForms — Older Adults (audience: "older_adults")
 *
 * Registry for the older adults audience group.
 *
 * Phase 1B update:
 *   Real PDF assets now exist for mood-reflection-sheet.
 *   That entry carries `approved: true` with valid file_url values.
 *
 * Phase 4A update:
 *   Real PDF assets added for sleep-routine-reflection, daily-coping-plan,
 *   and caregiver-support-reflection. All four older_adults entries are now approved.
 *   Legacy placeholder entries (coping-plan, sleep-reflection-worksheet) are retained
 *   as unapproved stubs to avoid data loss; they are superseded by the Phase 4A entries.
 *
 * Phase 5 (Spanish) update:
 *   Spanish (es) language blocks added for all four older_adults entries.
 *
 * Phase 6 (French) update:
 *   French (fr) language blocks added for all four older_adults entries.
 *
 * Phase 7 (German) update:
 *   German (de) language blocks added for all four older_adults entries.
 *
 * Phase 8 (Portuguese) update:
 *   Portuguese (pt) language blocks added for all four older_adults entries.
 */

/** @type {import('./types.js').TherapeuticForm[]} */
export const FORMS_OLDER_ADULTS = [
  {
    id: 'tf-older-adults-mood-reflection-sheet',
    slug: 'older-adults-mood-reflection-sheet',
    audience: 'older_adults',
    category: 'reflection_journal',
    therapeutic_use: 'Supports older adults in reflecting on daily mood patterns and identifying wellbeing factors.',
    approved: true,
    tags: ['mood', 'reflection', 'older-adults', 'wellbeing', 'daily'],
    languages: {
      en: {
        title: 'Mood Reflection Sheet',
        description: 'A gentle daily reflection sheet to track mood and notice what supports wellbeing.',
        file_url: '/forms/en/older_adults/mood-reflection-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-reflection-sheet.pdf',
        rtl: false,
      },
      he: {
        title: 'דף התבוננות במצב הרוח',
        description: 'דף רפלקציה יומי עדין לעקיבה אחר מצב הרוח ולהבחנה במה שתומך ברווחה.',
        file_url: '/forms/he/older_adults/mood-reflection-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-reflection-sheet.pdf',
        rtl: true,
      },
      es: {
        title: 'Hoja de Reflexión del Estado de Ánimo',
        description: 'Una suave hoja de reflexión diaria para registrar el estado de ánimo y observar lo que apoya el bienestar.',
        file_url: '/forms/es/older_adults/mood-reflection-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-reflection-sheet.pdf',
        rtl: false,
      },
      fr: {
        title: "Fiche de Réflexion sur l'Humeur",
        description: "Une douce fiche de réflexion quotidienne pour suivre l'humeur et noter ce qui soutient le bien-être.",
        file_url: '/forms/fr/older_adults/mood-reflection-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-reflection-sheet.pdf',
        rtl: false,
      },
      de: {
        title: 'Stimmungsreflexionsblatt',
        description: 'Ein sanftes tägliches Reflexionsblatt zur Verfolgung der Stimmung und zur Wahrnehmung dessen, was das Wohlbefinden fördert.',
        file_url: '/forms/de/older_adults/mood-reflection-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-reflection-sheet.pdf',
        rtl: false,
      },
      pt: {
        title: 'Folha de Reflexão sobre o Humor',
        description: 'Uma suave folha de reflexão diária para acompanhar o humor e perceber o que apoia o bem-estar.',
        file_url: '/forms/pt/older_adults/mood-reflection-sheet.pdf',
        file_type: 'pdf',
        file_name: 'mood-reflection-sheet.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-older-adults-sleep-routine-reflection',
    slug: 'older-adults-sleep-routine-reflection',
    audience: 'older_adults',
    category: 'sleep',
    therapeutic_use: 'Guides older adults in reflecting on sleep patterns and identifying habits that support better rest.',
    approved: true,
    tags: ['sleep', 'routine', 'reflection', 'older-adults', 'habits'],
    languages: {
      en: {
        title: 'Sleep and Routine Reflection',
        description: 'A gentle reflection sheet to track sleep quality and explore habits that promote restful sleep.',
        file_url: '/forms/en/older_adults/sleep-routine-reflection.pdf',
        file_type: 'pdf',
        file_name: 'sleep-routine-reflection.pdf',
        rtl: false,
      },
      he: {
        title: 'דף שינה והרגלים',
        description: 'דף רפלקציה עדין לעקיבה אחר איכות השינה ובחינת הרגלים המקדמים שינה טובה.',
        file_url: '/forms/he/older_adults/sleep-routine-reflection.pdf',
        file_type: 'pdf',
        file_name: 'sleep-routine-reflection.pdf',
        rtl: true,
      },
      es: {
        title: 'Reflexión sobre el Sueño y la Rutina',
        description: 'Una suave hoja de reflexión para registrar la calidad del sueño y explorar hábitos que promueven el descanso.',
        file_url: '/forms/es/older_adults/sleep-routine-reflection.pdf',
        file_type: 'pdf',
        file_name: 'sleep-routine-reflection.pdf',
        rtl: false,
      },
      fr: {
        title: 'Réflexion sur le Sommeil et la Routine',
        description: 'Une douce fiche de réflexion pour suivre la qualité du sommeil et explorer les habitudes favorisant un bon repos.',
        file_url: '/forms/fr/older_adults/sleep-routine-reflection.pdf',
        file_type: 'pdf',
        file_name: 'sleep-routine-reflection.pdf',
        rtl: false,
      },
      de: {
        title: 'Schlaf- und Routinereflexion',
        description: 'Ein sanftes Reflexionsblatt zur Verfolgung der Schlafqualität und zur Erkundung von Gewohnheiten, die einen erholsamen Schlaf fördern.',
        file_url: '/forms/de/older_adults/sleep-routine-reflection.pdf',
        file_type: 'pdf',
        file_name: 'sleep-routine-reflection.pdf',
        rtl: false,
      },
      pt: {
        title: 'Reflexão sobre Sono e Rotina',
        description: 'Uma suave folha de reflexão para acompanhar a qualidade do sono e explorar hábitos que promovem o descanso.',
        file_url: '/forms/pt/older_adults/sleep-routine-reflection.pdf',
        file_type: 'pdf',
        file_name: 'sleep-routine-reflection.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-older-adults-daily-coping-plan',
    slug: 'older-adults-daily-coping-plan',
    audience: 'older_adults',
    category: 'coping_tools',
    therapeutic_use: 'Helps older adults build a personalised daily plan for managing difficult moments.',
    approved: true,
    tags: ['coping', 'daily', 'plan', 'older-adults', 'support'],
    languages: {
      en: {
        title: 'Daily Coping Plan',
        description: 'A personal daily coping plan with space to list helpful strategies, supportive contacts, and calming activities.',
        file_url: '/forms/en/older_adults/daily-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'daily-coping-plan.pdf',
        rtl: false,
      },
      he: {
        title: 'תוכנית התמודדות יומית',
        description: 'תכנית התמודדות יומית אישית עם מקום לרשימת אסטרטגיות מועילות, אנשי קשר תומכים ופעילויות מרגיעות.',
        file_url: '/forms/he/older_adults/daily-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'daily-coping-plan.pdf',
        rtl: true,
      },
      es: {
        title: 'Plan de Afrontamiento Diario',
        description: 'Un plan de afrontamiento diario personal con espacio para estrategias útiles, contactos de apoyo y actividades calmantes.',
        file_url: '/forms/es/older_adults/daily-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'daily-coping-plan.pdf',
        rtl: false,
      },
      fr: {
        title: 'Plan de Gestion Quotidien',
        description: 'Un plan de gestion quotidien personnalisé avec un espace pour les stratégies utiles, les contacts de soutien et les activités apaisantes.',
        file_url: '/forms/fr/older_adults/daily-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'daily-coping-plan.pdf',
        rtl: false,
      },
      de: {
        title: 'Täglicher Bewältigungsplan',
        description: 'Ein persönlicher täglicher Bewältigungsplan mit Platz für hilfreiche Strategien, unterstützende Kontakte und beruhigende Aktivitäten.',
        file_url: '/forms/de/older_adults/daily-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'daily-coping-plan.pdf',
        rtl: false,
      },
      pt: {
        title: 'Plano de Enfrentamento Diário',
        description: 'Um plano de enfrentamento diário pessoal com espaço para estratégias úteis, contatos de apoio e atividades calmantes.',
        file_url: '/forms/pt/older_adults/daily-coping-plan.pdf',
        file_type: 'pdf',
        file_name: 'daily-coping-plan.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-older-adults-caregiver-support-reflection',
    slug: 'older-adults-caregiver-support-reflection',
    audience: 'older_adults',
    category: 'caregiver_support',
    therapeutic_use: 'Provides a structured reflection space for older adults who are also caregivers, supporting their own wellbeing.',
    approved: true,
    tags: ['caregiver', 'support', 'reflection', 'older-adults', 'wellbeing'],
    languages: {
      en: {
        title: 'Caregiver Support Reflection',
        description: 'A reflection form for those in a caregiving role, focusing on their own needs and support resources.',
        file_url: '/forms/en/older_adults/caregiver-support-reflection.pdf',
        file_type: 'pdf',
        file_name: 'caregiver-support-reflection.pdf',
        rtl: false,
      },
      he: {
        title: 'דף תמיכה למטפל או בן משפחה',
        description: 'טופס רפלקציה למי שנמצא בתפקיד מטפל, המתמקד בצרכיו שלו ובמשאבי תמיכה.',
        file_url: '/forms/he/older_adults/caregiver-support-reflection.pdf',
        file_type: 'pdf',
        file_name: 'caregiver-support-reflection.pdf',
        rtl: true,
      },
      es: {
        title: 'Reflexión de Apoyo al Cuidador',
        description: 'Un formulario de reflexión para quienes están en un rol de cuidado, enfocado en sus propias necesidades y recursos de apoyo.',
        file_url: '/forms/es/older_adults/caregiver-support-reflection.pdf',
        file_type: 'pdf',
        file_name: 'caregiver-support-reflection.pdf',
        rtl: false,
      },
      fr: {
        title: 'Réflexion de Soutien aux Aidants',
        description: "Un formulaire de réflexion pour les personnes jouant un rôle d'aidant, centré sur leurs propres besoins et ressources de soutien.",
        file_url: '/forms/fr/older_adults/caregiver-support-reflection.pdf',
        file_type: 'pdf',
        file_name: 'caregiver-support-reflection.pdf',
        rtl: false,
      },
      de: {
        title: 'Reflexion zur Unterstützung von Pflegepersonen',
        description: 'Ein Reflexionsbogen für Pflegepersonen, der sich auf ihre eigenen Bedürfnisse und Unterstützungsressourcen konzentriert.',
        file_url: '/forms/de/older_adults/caregiver-support-reflection.pdf',
        file_type: 'pdf',
        file_name: 'caregiver-support-reflection.pdf',
        rtl: false,
      },
      pt: {
        title: 'Reflexão de Apoio ao Cuidador',
        description: 'Um formulário de reflexão para quem está em um papel de cuidador, focado em suas próprias necessidades e recursos de apoio.',
        file_url: '/forms/pt/older_adults/caregiver-support-reflection.pdf',
        file_type: 'pdf',
        file_name: 'caregiver-support-reflection.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
];

/**
 * TherapeuticForms — Children (audience: "children")
 *
 * Registry for the children audience group.
 *
 * Phase 1B update:
 *   Real PDF assets now exist for simple-feelings-check-in.
 *   That entry carries `approved: true` with valid file_url values.
 *
 * Phase 4A update:
 *   Real PDF assets added for grounding-exercise, parent-guided-coping-card,
 *   and box-breathing. All four children entries are now approved.
 *
 * Phase 5 (Spanish) update:
 *   Spanish (es) language blocks added for all four children entries.
 *
 * Phase 6 (French) update:
 *   French (fr) language blocks added for all four children entries.
 */

/** @type {import('./types.js').TherapeuticForm[]} */
export const FORMS_CHILDREN = [
  {
    id: 'tf-children-feelings-checkin',
    slug: 'children-simple-feelings-check-in',
    audience: 'children',
    category: 'emotional_regulation',
    therapeutic_use: 'Helps children identify and name basic emotions using simple visual cues.',
    approved: true,
    tags: ['emotions', 'feelings', 'check-in', 'children', 'visual'],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      en: {
        title: 'Simple Feelings Check-In',
        description: 'A child-friendly worksheet to identify and name feelings each day.',
        file_url: '/forms/en/children/simple-feelings-check-in.pdf',
        file_type: 'pdf',
        file_name: 'simple-feelings-check-in.pdf',
        rtl: false,
      },
      he: {
        title: 'בדיקת רגשות פשוטה',
        description: 'דף עבודה ידידותי לילדים לזיהוי ושם הרגשות בכל יום.',
        file_url: '/forms/he/children/simple-feelings-check-in.pdf',
        file_type: 'pdf',
        file_name: 'simple-feelings-check-in.pdf',
        rtl: true,
      },
      es: {
        title: 'Revisión Simple de Sentimientos',
        description: 'Una hoja de trabajo amigable para que los niños identifiquen y nombren sus sentimientos cada día.',
        file_url: '/forms/es/children/simple-feelings-check-in.pdf',
        file_type: 'pdf',
        file_name: 'simple-feelings-check-in.pdf',
        rtl: false,
      },
      fr: {
        title: 'Bilan des Émotions Simple',
        description: 'Une fiche de travail conviviale pour aider les enfants à identifier et nommer leurs émotions chaque jour.',
        file_url: '/forms/fr/children/simple-feelings-check-in.pdf',
        file_type: 'pdf',
        file_name: 'simple-feelings-check-in.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-children-grounding-exercise',
    slug: 'children-grounding-exercise',
    audience: 'children',
    category: 'coping_tools',
    therapeutic_use: 'Introduces grounding techniques to help children manage anxiety through sensory awareness.',
    approved: true,
    tags: ['grounding', 'anxiety', 'senses', 'children', 'coping'],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      en: {
        title: 'Grounding Exercise for Children',
        description: 'A simple 5-senses grounding activity to help children feel calm and safe.',
        file_url: '/forms/en/children/grounding-exercise.pdf',
        file_type: 'pdf',
        file_name: 'grounding-exercise.pdf',
        rtl: false,
      },
      he: {
        title: 'תרגיל קרקוע לילדים',
        description: 'פעילות עיגון חמשת החושים לעזור לילדים להרגיש רגועים ובטוחים.',
        file_url: '/forms/he/children/grounding-exercise.pdf',
        file_type: 'pdf',
        file_name: 'grounding-exercise.pdf',
        rtl: true,
      },
      es: {
        title: 'Ejercicio de Anclaje para Niños',
        description: 'Una actividad de anclaje con los cinco sentidos para ayudar a los niños a sentirse tranquilos y seguros.',
        file_url: '/forms/es/children/grounding-exercise.pdf',
        file_type: 'pdf',
        file_name: 'grounding-exercise.pdf',
        rtl: false,
      },
      fr: {
        title: "Exercice d'Ancrage pour Enfants",
        description: "Une activité d'ancrage sur les cinq sens pour aider les enfants à se sentir calmes et en sécurité.",
        file_url: '/forms/fr/children/grounding-exercise.pdf',
        file_type: 'pdf',
        file_name: 'grounding-exercise.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-children-parent-guided-coping-card',
    slug: 'children-parent-guided-coping-card',
    audience: 'children',
    category: 'parent_guidance',
    therapeutic_use: 'A parent-guided card to help children build a personal coping toolkit.',
    approved: true,
    tags: ['coping', 'parent-guidance', 'children', 'self-regulation'],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      en: {
        title: 'Parent-Guided Coping Card',
        description: "Completed together with a parent, this card lists the child's personal calming strategies.",
        file_url: '/forms/en/children/parent-guided-coping-card.pdf',
        file_type: 'pdf',
        file_name: 'parent-guided-coping-card.pdf',
        rtl: false,
      },
      he: {
        title: 'כרטיס התמודדות בהנחיית הורה',
        description: 'ממולא יחד עם הורה, הכרטיס מפרט את אסטרטגיות ההרגעה האישיות של הילד.',
        file_url: '/forms/he/children/parent-guided-coping-card.pdf',
        file_type: 'pdf',
        file_name: 'parent-guided-coping-card.pdf',
        rtl: true,
      },
      es: {
        title: 'Tarjeta de Afrontamiento con Guía de Padres',
        description: 'Completada junto con un padre, esta tarjeta enumera las estrategias personales de calma del niño.',
        file_url: '/forms/es/children/parent-guided-coping-card.pdf',
        file_type: 'pdf',
        file_name: 'parent-guided-coping-card.pdf',
        rtl: false,
      },
      fr: {
        title: 'Carte de Gestion Guidée par les Parents',
        description: "Complétée avec un parent, cette carte liste les stratégies d'apaisement personnelles de l'enfant.",
        file_url: '/forms/fr/children/parent-guided-coping-card.pdf',
        file_type: 'pdf',
        file_name: 'parent-guided-coping-card.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-children-box-breathing',
    slug: 'children-box-breathing',
    audience: 'children',
    category: 'emotional_regulation',
    therapeutic_use: 'Teaches children a simple 4-count box breathing technique to self-regulate strong emotions.',
    approved: true,
    tags: ['breathing', 'calm', 'self-regulation', 'children', 'anxiety'],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      en: {
        title: 'Box Breathing for Children',
        description: 'A calm, step-by-step breathing exercise to help children manage big feelings.',
        file_url: '/forms/en/children/box-breathing.pdf',
        file_type: 'pdf',
        file_name: 'box-breathing.pdf',
        rtl: false,
      },
      he: {
        title: 'נשימת קופסה לילדים',
        description: 'תרגיל נשימה עדין ושלב-אחר-שלב לעזור לילדים להתמודד עם רגשות עזים.',
        file_url: '/forms/he/children/box-breathing.pdf',
        file_type: 'pdf',
        file_name: 'box-breathing.pdf',
        rtl: true,
      },
      es: {
        title: 'Respiración de Caja para Niños',
        description: 'Un ejercicio de respiración tranquilo y paso a paso para ayudar a los niños a manejar emociones intensas.',
        file_url: '/forms/es/children/box-breathing.pdf',
        file_type: 'pdf',
        file_name: 'box-breathing.pdf',
        rtl: false,
      },
      fr: {
        title: 'Respiration en Carré pour Enfants',
        description: 'Un exercice de respiration calme et progressif pour aider les enfants à gérer les émotions intenses.',
        file_url: '/forms/fr/children/box-breathing.pdf',
        file_type: 'pdf',
        file_name: 'box-breathing.pdf',
        rtl: false,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
];

/**
 * TherapeuticForms — Children (audience: "children")
 *
 * Seed registry for the children audience group.
 *
 * Phase 1 note:
 *   No real PDF assets exist yet for these entries. All forms carry
 *   `approved: false` so the resolver will NOT return them as downloadable.
 *   When real assets become available, update the relevant language blocks
 *   and set `approved: true`.
 */

/** @type {import('./types.js').TherapeuticForm[]} */
export const FORMS_CHILDREN = [
  {
    id: 'tf-children-feelings-checkin',
    slug: 'children-simple-feelings-check-in',
    audience: 'children',
    category: 'emotional_regulation',
    therapeutic_use: 'Helps children identify and name basic emotions using simple visual cues.',
    approved: false,
    tags: ['emotions', 'feelings', 'check-in', 'children', 'visual'],
    recommended_for: ['children_ages_5_to_10'],
    minimum_age: 5,
    maximum_age: 10,
    requires_parent_guidance: true,
    languages: {
      en: {
        title: 'Simple Feelings Check-In',
        description: 'A child-friendly worksheet to identify and name feelings each day.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'simple-feelings-check-in-en.pdf',
        rtl: false,
      },
      he: {
        title: 'בדיקת רגשות יומית',
        description: 'דף עבודה ידידותי לילדים לזיהוי ושמות הרגשות בכל יום.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'simple-feelings-check-in-he.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-children-grounding-exercise',
    slug: 'children-grounding-exercise',
    audience: 'children',
    category: 'anxiety_tools',
    therapeutic_use: 'Introduces grounding techniques to help children manage anxiety through sensory awareness.',
    approved: false,
    tags: ['grounding', 'anxiety', 'senses', 'children', 'coping'],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: false,
    languages: {
      en: {
        title: 'Grounding Exercise for Children',
        description: 'A simple 5-senses grounding activity to help children feel calm and safe.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'grounding-exercise-children-en.pdf',
        rtl: false,
      },
      he: {
        title: 'תרגיל עיגון לילדים',
        description: 'פעילות עיגון חמשת החושים לעזור לילדים להרגיש רגועים ובטוחים.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'grounding-exercise-children-he.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
  {
    id: 'tf-children-coping-card',
    slug: 'children-parent-guided-coping-card',
    audience: 'children',
    category: 'coping_tools',
    therapeutic_use: 'A parent-guided card to help children build a personal coping toolkit.',
    approved: false,
    tags: ['coping', 'parent-guidance', 'children', 'self-regulation'],
    recommended_for: ['children_ages_5_to_12'],
    minimum_age: 5,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      en: {
        title: 'Parent-Guided Coping Card',
        description: 'Completed together with a parent, this card lists the child\'s personal calming strategies.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'parent-guided-coping-card-en.pdf',
        rtl: false,
      },
      he: {
        title: 'כרטיס התמודדות בליווי הורה',
        description: 'מולא יחד עם הורה, הכרטיס מפרט את אסטרטגיות ההרגעה האישיות של הילד.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'parent-guided-coping-card-he.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
];

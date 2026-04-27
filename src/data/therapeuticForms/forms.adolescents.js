/**
 * TherapeuticForms — Adolescents (audience: "adolescents")
 *
 * Registry for the adolescents audience group.
 *
 * Phase 1B update:
 *   Real PDF assets now exist for anxiety-thought-record.
 *   That entry carries `approved: true` with valid file_url values.
 *   Remaining entries stay `approved: false` until their assets are ready.
 */

/** @type {import('./types.js').TherapeuticForm[]} */
export const FORMS_ADOLESCENTS = [
  {
    id: 'tf-adolescents-anxiety-thought-record',
    slug: 'adolescents-anxiety-thought-record',
    audience: 'adolescents',
    category: 'thought_records',
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
        title: 'רשומת מחשבות חרדה',
        description: 'דף עבודה מובנה לבחינה ואתגור מחשבות חרדה.',
        file_url: '/forms/he/adolescents/anxiety-thought-record.pdf',
        file_type: 'pdf',
        file_name: 'anxiety-thought-record.pdf',
        rtl: true,
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
    approved: false,
    tags: ['emotions', 'regulation', 'cbt', 'adolescents', 'triggers'],
    recommended_for: ['adolescents_ages_13_to_17'],
    minimum_age: 13,
    maximum_age: 17,
    requires_parent_guidance: false,
    languages: {
      en: {
        title: 'Emotion Regulation Worksheet',
        description: 'A worksheet to track emotional triggers, intensity, and healthy responses.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'emotion-regulation-worksheet-adolescents-en.pdf',
        rtl: false,
      },
      he: {
        title: 'דף עבודה לוויסות רגשי',
        description: 'דף לעקיבה אחר טריגרים רגשיים, עוצמה ותגובות בריאות.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'emotion-regulation-worksheet-adolescents-he.pdf',
        rtl: true,
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
    approved: false,
    tags: ['planning', 'weekly', 'practice', 'adolescents', 'tracking'],
    recommended_for: ['adolescents_ages_13_to_17'],
    minimum_age: 13,
    maximum_age: 17,
    requires_parent_guidance: false,
    languages: {
      en: {
        title: 'Weekly Practice Planner',
        description: 'A weekly planner to schedule and reflect on therapeutic activities.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'weekly-practice-planner-adolescents-en.pdf',
        rtl: false,
      },
      he: {
        title: 'מתכנן תרגול שבועי',
        description: 'מתכנן שבועי לתזמון ורפלקציה על פעילויות טיפוליות.',
        file_url: '',
        file_type: 'pdf',
        file_name: 'weekly-practice-planner-adolescents-he.pdf',
        rtl: true,
      },
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
];

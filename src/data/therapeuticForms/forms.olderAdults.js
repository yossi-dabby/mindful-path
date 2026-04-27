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
    },
    created_at: '2025-04-27T00:00:00.000Z',
    updated_at: '2025-04-27T00:00:00.000Z',
  },
];

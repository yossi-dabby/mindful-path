/**
 * TherapeuticForms — Children CBT Premium Series (Hebrew)
 *
 * Phase 15 (Hebrew Children CBT Premium):
 *   Registers 30 individual Hebrew children CBT premium worksheets and one
 *   full series workbook PDF. All assets are under:
 *   public/forms/he/children/cbt-premium-locked/
 *
 *   These are Hebrew-only premium forms. The audience is "children".
 *   Individual worksheets use category: "children_cbt_process".
 *   The full series workbook uses category: "workbook_series".
 *
 * The 6 CBT stages and their sub-stages:
 *   Stage 1 — Assessment & Alliance (היכרות, הערכה ובניית אמון)
 *     1.1 מי אני ומה חשוב לי?
 *     1.2 מתי קשה לי?
 *     1.3 מה אני עושה כשקשה לי?
 *     1.4 כמה זה קורה לי וכמה זה מפריע לי?
 *
 *   Stage 2 — Case Formulation (בונים את המפה שלי)
 *     2.1 מה היה רגע לפני?
 *     2.2 מה הראש אמר לי?
 *     2.3 מה הרגשתי בגוף?
 *     2.4 מה עשיתי אחר כך?
 *
 *   Stage 3 — Cognitive Restructuring (עובדים על המחשבות)
 *     3.1 תפסתי מחשבה!
 *     3.2 מחשבה או עובדה?
 *     3.3 בלש המחשבות שלי
 *     3.4 מחשבה חדשה שעוזרת לי
 *
 *   Stage 4 — Behavioral Interventions (עובדים במציאות)
 *     4.1 סולם האומץ שלי
 *     4.2 הצעד הקטן שלי
 *     4.3 ניסוי אמיץ
 *     4.4 מה מפעיל אותי?
 *
 *   Stage 5 — Skill Building (מוסיפים כלים לארגז שלי)
 *     5.1 כלים שמרגיעים את הגוף שלי
 *     5.2 משפטים שעוזרים לי
 *     5.3 איך אני מבקש/ת עזרה?
 *     5.4 איך מתקנים קשר?
 *
 *   Stage 6 — Relapse Prevention / Ending (שומרים על ההצלחה שלי)
 *     6.1 מה למדתי על עצמי?
 *     6.2 מתי עלול להיות לי שוב קשה?
 *     6.3 כרטיס הכוח שלי
 *     6.4 אני ממשיך/ה לבד — עם הכלים שלי
 */

const BASE_URL = '/forms/he/children/cbt-premium-locked';

/** @type {import('./types.js').TherapeuticForm[]} */
export const FORMS_CHILDREN_CBT_PREMIUM = [

  // ── Stage 1: Assessment & Alliance ──────────────────────────────────────────

  {
    id: 'tf-children-cbt-stage-1-premium-he',
    slug: 'children-cbt-stage-1-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'assessment_alliance',
    cbt_stage_number: 1,
    therapeutic_use:
      'Stage 1 intro: Hebrew CBT children worksheet for initiating the therapeutic process — building rapport, introducing CBT concepts, and establishing a safe therapeutic alliance with the child.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'assessment', 'alliance', 'stage-1', 'intake',
      'children-cbt-process', 'היכרות', 'הערכה', 'בניית-אמון',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: 'שלב 1 — היכרות, הערכה ובניית אמון',
        description:
          'דף עבודה ראשון בסדרה לילדים: כניסה לתהליך הטיפולי, הכרת הילד ובניית ברית טיפולית.',
        file_url: `${BASE_URL}/01-stage-1-assessment-alliance-he.pdf`,
        file_type: 'pdf',
        file_name: '01-stage-1-assessment-alliance-he.pdf',
        rtl: true,
        aliases: [
          'היכרות', 'הערכה', 'בניית אמון', 'ברית טיפולית',
          'תחילת טיפול עם ילד', 'להכיר את הילד',
          'שלב 1', 'שלב ראשון', 'שלב היכרות',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-1-1-premium-he',
    slug: 'children-cbt-stage-1-1-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'assessment_alliance',
    cbt_stage_number: 1,
    cbt_substage_number: '1.1',
    therapeutic_use:
      'Self-introduction worksheet for children: identifying personal identity, values, preferences, and strengths at the start of CBT.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'assessment', 'identity', 'values', 'stage-1', 'substage-1-1',
      'children-cbt-process', 'מי אני', 'מה חשוב לי',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '1.1 — מי אני ומה חשוב לי?',
        description:
          'דף הכרה עצמית: הילד מזהה מי הוא, מה חשוב לו ומה הערכים שמנחים אותו.',
        file_url: `${BASE_URL}/01-01-who-am-i-what-matters-he.pdf`,
        file_type: 'pdf',
        file_name: '01-01-who-am-i-what-matters-he.pdf',
        rtl: true,
        aliases: [
          'מי אני', 'מה חשוב לי', 'מה חשוב לילד',
          'הכרה עצמית', 'זהות ילד', '1.1',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-1-2-premium-he',
    slug: 'children-cbt-stage-1-2-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'assessment_alliance',
    cbt_stage_number: 1,
    cbt_substage_number: '1.2',
    therapeutic_use:
      'Identifying difficult situations for children: mapping contexts where the child struggles, as part of initial CBT assessment.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'assessment', 'difficulty', 'situations', 'stage-1', 'substage-1-2',
      'children-cbt-process', 'מתי קשה לי',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '1.2 — מתי קשה לי?',
        description:
          'דף מיפוי מצבי קושי: הילד מזהה מתי ובאיזה מצבים הוא מרגיש שקשה לו.',
        file_url: `${BASE_URL}/01-02-when-is-it-hard-for-me-he.pdf`,
        file_type: 'pdf',
        file_name: '01-02-when-is-it-hard-for-me-he.pdf',
        rtl: true,
        aliases: [
          'מתי קשה לי', 'מתי קשה לילד', 'מצבי קושי',
          'מה מקשה', '1.2',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-1-3-premium-he',
    slug: 'children-cbt-stage-1-3-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'assessment_alliance',
    cbt_stage_number: 1,
    cbt_substage_number: '1.3',
    therapeutic_use:
      'Assessing current coping behaviors in children: understanding what the child does when faced with difficulty, identifying adaptive and maladaptive responses.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'assessment', 'coping', 'behavior', 'stage-1', 'substage-1-3',
      'children-cbt-process', 'מה אני עושה כשקשה לי',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '1.3 — מה אני עושה כשקשה לי?',
        description:
          'דף זיהוי תגובות לקושי: הילד מגלה מה הוא עושה כשנתקל בקושי ומה עוזר לו.',
        file_url: `${BASE_URL}/01-03-what-i-do-when-it-is-hard-he.pdf`,
        file_type: 'pdf',
        file_name: '01-03-what-i-do-when-it-is-hard-he.pdf',
        rtl: true,
        aliases: [
          'מה אני עושה כשקשה לי', 'מה הילד עושה כשקשה לו',
          'תגובות לקושי', 'דרכי התמודדות', '1.3',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-1-4-premium-he',
    slug: 'children-cbt-stage-1-4-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'assessment_alliance',
    cbt_stage_number: 1,
    cbt_substage_number: '1.4',
    therapeutic_use:
      'Severity and frequency assessment for children: quantifying how often a problem occurs and how much it interferes with daily life.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'assessment', 'severity', 'frequency', 'stage-1', 'substage-1-4',
      'children-cbt-process', 'כמה זה קורה', 'כמה זה מפריע',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '1.4 — כמה זה קורה לי וכמה זה מפריע לי?',
        description:
          'דף הערכת חומרה ותדירות: הילד מדרג כמה פעמים הקושי קורה וכמה הוא מפריע לחייו.',
        file_url: `${BASE_URL}/01-04-how-often-and-how-much-it-bothers-me-he.pdf`,
        file_type: 'pdf',
        file_name: '01-04-how-often-and-how-much-it-bothers-me-he.pdf',
        rtl: true,
        aliases: [
          'כמה זה קורה', 'כמה זה מפריע', 'כמה זה קורה לי',
          'כמה זה מפריע לי', 'הערכת חומרה', '1.4',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  // ── Stage 2: Case Formulation ────────────────────────────────────────────────

  {
    id: 'tf-children-cbt-stage-2-premium-he',
    slug: 'children-cbt-stage-2-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'case_formulation',
    cbt_stage_number: 2,
    therapeutic_use:
      'Stage 2 intro: Hebrew CBT children worksheet for building the child\'s personal CBT map — connecting triggers, thoughts, feelings, body sensations, and behaviors.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'formulation', 'cbt-map', 'stage-2',
      'children-cbt-process', 'המפה שלי', 'בונים את המפה',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: 'שלב 2 — בונים את המפה שלי',
        description:
          'דף המשגה: הילד בונה את המפה האישית שלו — קשר בין טריגרים, מחשבות, רגשות, גוף והתנהגות.',
        file_url: `${BASE_URL}/02-stage-2-building-my-map-he.pdf`,
        file_type: 'pdf',
        file_name: '02-stage-2-building-my-map-he.pdf',
        rtl: true,
        aliases: [
          'המפה שלי', 'בונים את המפה', 'המשגה', 'מפת הקושי',
          'מעגל הקושי', 'שלב 2', 'שלב שני',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-2-1-premium-he',
    slug: 'children-cbt-stage-2-1-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'case_formulation',
    cbt_stage_number: 2,
    cbt_substage_number: '2.1',
    therapeutic_use:
      'Antecedent/trigger identification for children: exploring what happened right before the difficult moment (situational triggers in CBT formulation).',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'formulation', 'trigger', 'antecedent', 'stage-2', 'substage-2-1',
      'children-cbt-process', 'מה היה רגע לפני', 'טריגר',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '2.1 — מה היה רגע לפני?',
        description:
          'דף זיהוי טריגר: הילד מגלה מה קרה רגע לפני שהרגיש קשה — מה הציתה את הקושי.',
        file_url: `${BASE_URL}/02-01-what-happened-right-before-he.pdf`,
        file_type: 'pdf',
        file_name: '02-01-what-happened-right-before-he.pdf',
        rtl: true,
        aliases: [
          'מה היה רגע לפני', 'מה היה לפני', 'טריגר',
          'להבין מה קורה לפני', '2.1',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-2-2-premium-he',
    slug: 'children-cbt-stage-2-2-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'case_formulation',
    cbt_stage_number: 2,
    cbt_substage_number: '2.2',
    therapeutic_use:
      'Automatic thought identification for children: helping the child recognize and articulate what their mind told them in a difficult moment.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'formulation', 'automatic-thoughts', 'stage-2', 'substage-2-2',
      'children-cbt-process', 'מה הראש אמר לי', 'מחשבה אוטומטית',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '2.2 — מה הראש אמר לי?',
        description:
          'דף זיהוי מחשבות אוטומטיות: הילד לומד לזהות מה הראש אמר לו בזמן הקושי.',
        file_url: `${BASE_URL}/02-02-what-my-mind-told-me-he.pdf`,
        file_type: 'pdf',
        file_name: '02-02-what-my-mind-told-me-he.pdf',
        rtl: true,
        aliases: [
          'מה הראש אמר לי', 'מחשבה אוטומטית', 'מה חשבתי',
          'מה הראש אמר', '2.2',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-2-3-premium-he',
    slug: 'children-cbt-stage-2-3-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'case_formulation',
    cbt_stage_number: 2,
    cbt_substage_number: '2.3',
    therapeutic_use:
      'Body-emotion connection for children: identifying physical sensations associated with difficult emotions as part of CBT formulation.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'formulation', 'body-sensations', 'emotions', 'stage-2', 'substage-2-3',
      'children-cbt-process', 'מה הרגשתי בגוף', 'תחושות גוף',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '2.3 — מה הרגשתי בגוף?',
        description:
          'דף תחושות גוף: הילד מזהה את התחושות הפיזיות שמרגיש בגופו בזמן הקושי.',
        file_url: `${BASE_URL}/02-03-what-i-felt-in-my-body-he.pdf`,
        file_type: 'pdf',
        file_name: '02-03-what-i-felt-in-my-body-he.pdf',
        rtl: true,
        aliases: [
          'מה הרגשתי בגוף', 'תחושות גוף', 'גוף ורגש',
          'מה הגוף מרגיש', '2.3',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-2-4-premium-he',
    slug: 'children-cbt-stage-2-4-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'case_formulation',
    cbt_stage_number: 2,
    cbt_substage_number: '2.4',
    therapeutic_use:
      'Behavioral response identification for children: understanding what the child did after the difficult moment, linking behavior to the CBT cycle.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'formulation', 'behavior', 'response', 'stage-2', 'substage-2-4',
      'children-cbt-process', 'מה עשיתי אחר כך', 'תגובה התנהגותית',
      'מחשבה רגש גוף פעולה',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '2.4 — מה עשיתי אחר כך?',
        description:
          'דף זיהוי תגובה התנהגותית: הילד מבין מה עשה אחרי הקושי וכיצד הפעולה שלו השפיעה על המצב.',
        file_url: `${BASE_URL}/02-04-what-i-did-afterward-he.pdf`,
        file_type: 'pdf',
        file_name: '02-04-what-i-did-afterward-he.pdf',
        rtl: true,
        aliases: [
          'מה עשיתי אחר כך', 'מה עשה אחר כך', 'תגובה התנהגותית',
          'מחשבה רגש גוף פעולה', '2.4',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  // ── Stage 3: Cognitive Restructuring ────────────────────────────────────────

  {
    id: 'tf-children-cbt-stage-3-premium-he',
    slug: 'children-cbt-stage-3-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'cognitive_restructuring',
    cbt_stage_number: 3,
    therapeutic_use:
      'Stage 3 intro: Hebrew CBT children worksheet for beginning cognitive work — helping children learn to catch, examine, and reframe unhelpful thoughts.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'cognitive-restructuring', 'thoughts', 'stage-3',
      'children-cbt-process', 'עובדים על המחשבות',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: 'שלב 3 — עובדים על המחשבות',
        description:
          'דף עבודה קוגניטיבי: הילד לומד לזהות, לבדוק ולשנות מחשבות שאינן עוזרות לו.',
        file_url: `${BASE_URL}/03-stage-3-working-on-thoughts-he.pdf`,
        file_type: 'pdf',
        file_name: '03-stage-3-working-on-thoughts-he.pdf',
        rtl: true,
        aliases: [
          'עובדים על המחשבות', 'עבודה קוגניטיבית', 'לשנות מחשבות',
          'שלב 3', 'שלב שלישי',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-3-1-premium-he',
    slug: 'children-cbt-stage-3-1-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'cognitive_restructuring',
    cbt_stage_number: 3,
    cbt_substage_number: '3.1',
    therapeutic_use:
      'Catching automatic thoughts for children: the child learns to notice and identify unhelpful automatic thoughts as the first step in cognitive restructuring.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'cognitive-restructuring', 'automatic-thoughts', 'catching-thoughts',
      'stage-3', 'substage-3-1',
      'children-cbt-process', 'תפסתי מחשבה', 'לתפוס מחשבה',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '3.1 — תפסתי מחשבה!',
        description:
          'דף תפיסת מחשבה אוטומטית: הילד לומד לשים לב ולתפוס מחשבות שמגיעות אוטומטית.',
        file_url: `${BASE_URL}/03-01-i-caught-a-thought-he.pdf`,
        file_type: 'pdf',
        file_name: '03-01-i-caught-a-thought-he.pdf',
        rtl: true,
        aliases: [
          'תפסתי מחשבה', 'לתפוס מחשבה', 'מחשבה אוטומטית',
          'לשים לב למחשבות', '3.1',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-3-2-premium-he',
    slug: 'children-cbt-stage-3-2-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'cognitive_restructuring',
    cbt_stage_number: 3,
    cbt_substage_number: '3.2',
    therapeutic_use:
      'Thought vs. fact distinction for children: helping children differentiate between thoughts (interpretations) and facts, a core CBT skill.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'cognitive-restructuring', 'thought-vs-fact', 'stage-3', 'substage-3-2',
      'children-cbt-process', 'מחשבה או עובדה',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '3.2 — מחשבה או עובדה?',
        description:
          'דף הבחנה בין מחשבה לעובדה: הילד לומד להבדיל בין מחשבה (פרשנות) לבין עובדה אמיתית.',
        file_url: `${BASE_URL}/03-02-thought-or-fact-he.pdf`,
        file_type: 'pdf',
        file_name: '03-02-thought-or-fact-he.pdf',
        rtl: true,
        aliases: [
          'מחשבה או עובדה', 'מחשבה לעומת עובדה',
          'לבדוק מחשבה', 'האם זה עובדה', '3.2',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-3-3-premium-he',
    slug: 'children-cbt-stage-3-3-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'cognitive_restructuring',
    cbt_stage_number: 3,
    cbt_substage_number: '3.3',
    therapeutic_use:
      'Children\'s thought detective worksheet: the child gathers evidence for and against unhelpful thoughts, developing critical thinking about cognitions.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'cognitive-restructuring', 'evidence-checking', 'thought-detective',
      'stage-3', 'substage-3-3',
      'children-cbt-process', 'בלש מחשבות', 'ראיות בעד ונגד',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '3.3 — בלש המחשבות שלי',
        description:
          'דף בלש מחשבות: הילד אוסף ראיות בעד ונגד המחשבה הקשה כדי לבדוק אם היא אמיתית.',
        file_url: `${BASE_URL}/03-03-my-thought-detective-he.pdf`,
        file_type: 'pdf',
        file_name: '03-03-my-thought-detective-he.pdf',
        rtl: true,
        aliases: [
          'בלש מחשבות', 'בלש המחשבות שלי', 'ראיות בעד ונגד',
          'לחקור מחשבות', 'מחשבה מפחידה', '3.3',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-3-4-premium-he',
    slug: 'children-cbt-stage-3-4-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'cognitive_restructuring',
    cbt_stage_number: 3,
    cbt_substage_number: '3.4',
    therapeutic_use:
      'Developing helpful alternative thoughts for children: creating balanced, realistic, self-supportive replacement thoughts after cognitive challenging.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'cognitive-restructuring', 'alternative-thoughts', 'balanced-thoughts',
      'stage-3', 'substage-3-4',
      'children-cbt-process', 'מחשבה חדשה שעוזרת לי', 'מחשבה מאוזנת',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '3.4 — מחשבה חדשה שעוזרת לי',
        description:
          'דף פיתוח מחשבה חלופית: הילד בונה מחשבה חדשה, מאוזנת ועוזרת שתחליף את המחשבה הקשה.',
        file_url: `${BASE_URL}/03-04-new-helpful-thought-he.pdf`,
        file_type: 'pdf',
        file_name: '03-04-new-helpful-thought-he.pdf',
        rtl: true,
        aliases: [
          'מחשבה חדשה שעוזרת לי', 'מחשבה חדשה', 'מחשבה שעוזרת',
          'מחשבה מאוזנת', 'מחשבה חלופית', '3.4',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  // ── Stage 4: Behavioral Interventions ───────────────────────────────────────

  {
    id: 'tf-children-cbt-stage-4-premium-he',
    slug: 'children-cbt-stage-4-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'behavioral_interventions',
    cbt_stage_number: 4,
    therapeutic_use:
      'Stage 4 intro: Hebrew CBT children worksheet for behavioral interventions — exposure ladders, gradual approach, and behavioral activation in the real world.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'behavioral-interventions', 'exposure', 'stage-4',
      'children-cbt-process', 'עובדים במציאות',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: 'שלב 4 — עובדים במציאות',
        description:
          'דף עבודה התנהגותית: הילד לומד להתמודד עם קשיים בפועל באמצעות חשיפה הדרגתית וניסויים התנהגותיים.',
        file_url: `${BASE_URL}/04-stage-4-working-in-real-life-he.pdf`,
        file_type: 'pdf',
        file_name: '04-stage-4-working-in-real-life-he.pdf',
        rtl: true,
        aliases: [
          'עובדים במציאות', 'עבודה התנהגותית', 'חשיפה',
          'לתרגל במציאות', 'שלב 4', 'שלב רביעי',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-4-1-premium-he',
    slug: 'children-cbt-stage-4-1-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'behavioral_interventions',
    cbt_stage_number: 4,
    cbt_substage_number: '4.1',
    therapeutic_use:
      'Children\'s courage ladder (exposure hierarchy): helping the child build a graded list of feared/avoided situations to approach step by step.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'behavioral-interventions', 'exposure-hierarchy', 'courage-ladder',
      'stage-4', 'substage-4-1',
      'children-cbt-process', 'סולם אומץ', 'סולם החשיפה',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '4.1 — סולם האומץ שלי',
        description:
          'דף סולם האומץ: הילד בונה רשימה הדרגתית של מצבים שקשה לו להתמודד איתם, מהכי קל לכי קשה.',
        file_url: `${BASE_URL}/04-01-my-courage-ladder-he.pdf`,
        file_type: 'pdf',
        file_name: '04-01-my-courage-ladder-he.pdf',
        rtl: true,
        aliases: [
          'סולם אומץ', 'סולם האומץ שלי', 'סולם חשיפה',
          'להתמודד לאט לאט', 'חשיפה הדרגתית', '4.1',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-4-2-premium-he',
    slug: 'children-cbt-stage-4-2-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'behavioral_interventions',
    cbt_stage_number: 4,
    cbt_substage_number: '4.2',
    therapeutic_use:
      'Small step planning for children: breaking down a feared/difficult situation into one manageable first step to build momentum and reduce avoidance.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'behavioral-interventions', 'small-step', 'graded-exposure',
      'stage-4', 'substage-4-2',
      'children-cbt-process', 'הצעד הקטן שלי', 'צעד קטן',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '4.2 — הצעד הקטן שלי',
        description:
          'דף תכנון צעד קטן: הילד בוחר צעד אחד קטן וניתן לביצוע להתמודדות עם הקושי.',
        file_url: `${BASE_URL}/04-02-my-small-step-he.pdf`,
        file_type: 'pdf',
        file_name: '04-02-my-small-step-he.pdf',
        rtl: true,
        aliases: [
          'הצעד הקטן שלי', 'צעד קטן', 'הצעד הבא שלי',
          'לפרק למשימות קטנות', '4.2',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-4-3-premium-he',
    slug: 'children-cbt-stage-4-3-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'behavioral_interventions',
    cbt_stage_number: 4,
    cbt_substage_number: '4.3',
    therapeutic_use:
      'Behavioral experiment worksheet for children: the child plans and reflects on a "brave experiment" to test feared outcomes in a safe, structured way.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'behavioral-interventions', 'behavioral-experiment', 'brave-experiment',
      'stage-4', 'substage-4-3',
      'children-cbt-process', 'ניסוי אמיץ', 'ניסוי התנהגותי',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '4.3 — ניסוי אמיץ',
        description:
          'דף ניסוי התנהגותי: הילד מתכנן ומבצע "ניסוי אמיץ" לבדיקת מה שהמחשבה הפחידה אותו ממנו.',
        file_url: `${BASE_URL}/04-03-brave-experiment-he.pdf`,
        file_type: 'pdf',
        file_name: '04-03-brave-experiment-he.pdf',
        rtl: true,
        aliases: [
          'ניסוי אמיץ', 'ניסוי התנהגותי', 'לנסות',
          'הפעלה התנהגותית', '4.3',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-4-4-premium-he',
    slug: 'children-cbt-stage-4-4-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'behavioral_interventions',
    cbt_stage_number: 4,
    cbt_substage_number: '4.4',
    therapeutic_use:
      'Triggers and activation identification for children: mapping the personal triggers that set off difficult feelings and behaviors.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'behavioral-interventions', 'triggers', 'activation',
      'stage-4', 'substage-4-4',
      'children-cbt-process', 'מה מפעיל אותי',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '4.4 — מה מפעיל אותי?',
        description:
          'דף מיפוי מפעילים: הילד מזהה אילו מצבים, אנשים או מחשבות מפעילים אצלו תגובות קשות.',
        file_url: `${BASE_URL}/04-04-what-activates-me-he.pdf`,
        file_type: 'pdf',
        file_name: '04-04-what-activates-me-he.pdf',
        rtl: true,
        aliases: [
          'מה מפעיל אותי', 'מפעילים', 'טריגרים שלי',
          'מה מציתה אצלי', '4.4',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  // ── Stage 5: Skill Building ──────────────────────────────────────────────────

  {
    id: 'tf-children-cbt-stage-5-premium-he',
    slug: 'children-cbt-stage-5-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'skill_building',
    cbt_stage_number: 5,
    therapeutic_use:
      'Stage 5 intro: Hebrew CBT children worksheet for adding coping tools to the child\'s personal toolkit — relaxation, self-talk, help-seeking, and repair skills.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'skill-building', 'coping-tools', 'stage-5',
      'children-cbt-process', 'ארגז כלים', 'כלים',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: 'שלב 5 — מוסיפים כלים לארגז שלי',
        description:
          'דף עבודה לפיתוח מיומנויות: הילד בונה את ארגז הכלים האישי שלו עם כלים להרגעה, משפטים מחזקים ומיומנויות חברתיות.',
        file_url: `${BASE_URL}/05-stage-5-adding-tools-to-my-toolbox-he.pdf`,
        file_type: 'pdf',
        file_name: '05-stage-5-adding-tools-to-my-toolbox-he.pdf',
        rtl: true,
        aliases: [
          'ארגז כלים', 'מוסיפים כלים', 'כלים לארגז שלי',
          'מיומנויות', 'שלב 5', 'שלב חמישי',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-5-1-premium-he',
    slug: 'children-cbt-stage-5-1-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'skill_building',
    cbt_stage_number: 5,
    cbt_substage_number: '5.1',
    therapeutic_use:
      'Body-calming tools for children: identifying and practicing physical relaxation techniques such as breathing, muscle relaxation, and sensory grounding.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'skill-building', 'relaxation', 'body-tools', 'breathing',
      'stage-5', 'substage-5-1',
      'children-cbt-process', 'כלים שמרגיעים את הגוף', 'נשימה', 'הרפיה',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '5.1 — כלים שמרגיעים את הגוף שלי',
        description:
          'דף כלים להרגעת הגוף: הילד מתאמן בטכניקות גופניות להרגעה — נשימה, הרפיה והרגעה חושית.',
        file_url: `${BASE_URL}/05-01-tools-that-calm-my-body-he.pdf`,
        file_type: 'pdf',
        file_name: '05-01-tools-that-calm-my-body-he.pdf',
        rtl: true,
        aliases: [
          'כלים שמרגיעים את הגוף שלי', 'כלים להרגעה', 'נשימה',
          'הרפיה', 'הרגעת הגוף', 'כלים גופניים', '5.1',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-5-2-premium-he',
    slug: 'children-cbt-stage-5-2-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'skill_building',
    cbt_stage_number: 5,
    cbt_substage_number: '5.2',
    therapeutic_use:
      'Helpful self-talk phrases for children: developing personal coping statements and encouragement phrases the child can use in difficult moments.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'skill-building', 'self-talk', 'coping-statements',
      'stage-5', 'substage-5-2',
      'children-cbt-process', 'משפטים שעוזרים לי', 'משפטים מחזקים',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '5.2 — משפטים שעוזרים לי',
        description:
          'דף משפטים מחזקים: הילד בוחר ומאמן משפטים שיעזרו לו להרגיע את עצמו ולהתמודד בזמן קושי.',
        file_url: `${BASE_URL}/05-02-helpful-sentences-he.pdf`,
        file_type: 'pdf',
        file_name: '05-02-helpful-sentences-he.pdf',
        rtl: true,
        aliases: [
          'משפטים שעוזרים לי', 'משפטים מחזקים', 'דיבור עצמי',
          'משפטי התמודדות', '5.2',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-5-3-premium-he',
    slug: 'children-cbt-stage-5-3-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'skill_building',
    cbt_stage_number: 5,
    cbt_substage_number: '5.3',
    therapeutic_use:
      'Help-seeking skills for children: teaching children how to recognize when they need help and how to ask for it effectively from adults and peers.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'skill-building', 'help-seeking', 'social-skills',
      'stage-5', 'substage-5-3',
      'children-cbt-process', 'בקשת עזרה', 'איך מבקשים עזרה',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '5.3 — איך אני מבקש/ת עזרה?',
        description:
          'דף בקשת עזרה: הילד לומד לזהות מתי הוא צריך עזרה ואיך לבקש אותה בצורה יעילה.',
        file_url: `${BASE_URL}/05-03-how-i-ask-for-help-he.pdf`,
        file_type: 'pdf',
        file_name: '05-03-how-i-ask-for-help-he.pdf',
        rtl: true,
        aliases: [
          'איך אני מבקש עזרה', 'איך מבקשים עזרה',
          'בקשת עזרה', 'מיומנויות חברתיות', '5.3',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-5-4-premium-he',
    slug: 'children-cbt-stage-5-4-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'skill_building',
    cbt_stage_number: 5,
    cbt_substage_number: '5.4',
    therapeutic_use:
      'Relationship repair skills for children: teaching the child how to make up after a fight or misunderstanding, supporting prosocial skills.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'skill-building', 'relationship-repair', 'social-skills',
      'stage-5', 'substage-5-4',
      'children-cbt-process', 'איך מתקנים קשר', 'פתרון ריב',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '5.4 — איך מתקנים קשר?',
        description:
          'דף תיקון קשר: הילד לומד כיצד לפצות, להתפייס ולתקן קשר עם חבר, אח או הורה אחרי ריב.',
        file_url: `${BASE_URL}/05-04-how-to-repair-a-relationship-he.pdf`,
        file_type: 'pdf',
        file_name: '05-04-how-to-repair-a-relationship-he.pdf',
        rtl: true,
        aliases: [
          'איך מתקנים קשר', 'תיקון קשר', 'פתרון ריב',
          'לפצות', 'להתפייס', '5.4',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  // ── Stage 6: Relapse Prevention / Ending ────────────────────────────────────

  {
    id: 'tf-children-cbt-stage-6-premium-he',
    slug: 'children-cbt-stage-6-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'relapse_prevention',
    cbt_stage_number: 6,
    therapeutic_use:
      'Stage 6 intro: Hebrew CBT children worksheet for closing the therapeutic journey — celebrating success, preserving learning, and building a plan for the future.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'relapse-prevention', 'ending', 'closure', 'stage-6',
      'children-cbt-process', 'שומרים על ההצלחה', 'סיום טיפול',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: 'שלב 6 — שומרים על ההצלחה שלי',
        description:
          'דף סיום: הילד מציין את ההצלחות שלו, מה למד ואיך ישמור על הכלים שצבר לעתיד.',
        file_url: `${BASE_URL}/06-stage-6-maintaining-my-success-he.pdf`,
        file_type: 'pdf',
        file_name: '06-stage-6-maintaining-my-success-he.pdf',
        rtl: true,
        aliases: [
          'שומרים על ההצלחה', 'סיום טיפול', 'מניעת נסיגה',
          'שימור הישגים', 'שלב 6', 'שלב שישי',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-6-1-premium-he',
    slug: 'children-cbt-stage-6-1-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'relapse_prevention',
    cbt_stage_number: 6,
    cbt_substage_number: '6.1',
    therapeutic_use:
      'Self-reflection at treatment ending for children: the child reflects on what they have learned about themselves during the CBT process.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'relapse-prevention', 'self-reflection', 'ending',
      'stage-6', 'substage-6-1',
      'children-cbt-process', 'מה למדתי על עצמי',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '6.1 — מה למדתי על עצמי?',
        description:
          'דף הרהור עצמי: הילד מסכם מה למד על עצמו, על כוחותיו ועל דרכי ההתמודדות שלו בתהליך.',
        file_url: `${BASE_URL}/06-01-what-i-learned-about-myself-he.pdf`,
        file_type: 'pdf',
        file_name: '06-01-what-i-learned-about-myself-he.pdf',
        rtl: true,
        aliases: [
          'מה למדתי על עצמי', 'מה הילד למד', 'הרהור עצמי',
          'סיכום תהליך', '6.1',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-6-2-premium-he',
    slug: 'children-cbt-stage-6-2-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'relapse_prevention',
    cbt_stage_number: 6,
    cbt_substage_number: '6.2',
    therapeutic_use:
      'Future difficulty anticipation for children: identifying situations where the child may struggle again and preparing coping strategies in advance.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'relapse-prevention', 'future-planning', 'anticipation',
      'stage-6', 'substage-6-2',
      'children-cbt-process', 'מתי עלול להיות לי שוב קשה',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '6.2 — מתי עלול להיות לי שוב קשה?',
        description:
          'דף תכנון לעתיד: הילד מזהה מצבים שבהם עשוי לחזור הקושי ומתכנן כיצד להתמודד.',
        file_url: `${BASE_URL}/06-02-when-it-might-be-hard-again-he.pdf`,
        file_type: 'pdf',
        file_name: '06-02-when-it-might-be-hard-again-he.pdf',
        rtl: true,
        aliases: [
          'מתי עלול להיות לי שוב קשה', 'מניעת נסיגה',
          'תכנון לעתיד', 'כשיחזור הקושי', '6.2',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-6-3-premium-he',
    slug: 'children-cbt-stage-6-3-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'relapse_prevention',
    cbt_stage_number: 6,
    cbt_substage_number: '6.3',
    therapeutic_use:
      'Strengths card for children: a personal reminder card the child creates listing their strengths, tools, and coping statements to carry with them after therapy.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'relapse-prevention', 'strengths-card', 'coping-card',
      'stage-6', 'substage-6-3',
      'children-cbt-process', 'כרטיס כוח', 'כרטיס התמודדות',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '6.3 — כרטיס הכוח שלי',
        description:
          'דף כרטיס כוח: הילד מכין כרטיס אישי עם הכוחות, הכלים והמשפטים המחזקים שיסיים בהם את הטיפול.',
        file_url: `${BASE_URL}/06-03-my-power-card-he.pdf`,
        file_type: 'pdf',
        file_name: '06-03-my-power-card-he.pdf',
        rtl: true,
        aliases: [
          'כרטיס כוח', 'כרטיס הכוח שלי', 'כרטיס התמודדות',
          'תוכנית המשך', '6.3',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  {
    id: 'tf-children-cbt-stage-6-4-premium-he',
    slug: 'children-cbt-stage-6-4-premium-he',
    audience: 'children',
    category: 'children_cbt_process',
    type: 'therapeutic_form',
    cbt_stage: 'relapse_prevention',
    cbt_stage_number: 6,
    cbt_substage_number: '6.4',
    therapeutic_use:
      'Independence and autonomy worksheet for children: the closing worksheet where the child affirms their ability to continue independently using their tools.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'relapse-prevention', 'independence', 'autonomy', 'closure',
      'stage-6', 'substage-6-4',
      'children-cbt-process', 'אני ממשיך לבד', 'הכלים שלי',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: '6.4 — אני ממשיך/ה לבד — עם הכלים שלי',
        description:
          'דף עצמאות: הילד מאשש את יכולתו להמשיך לבד עם הכלים שרכש בתהליך הטיפולי.',
        file_url: `${BASE_URL}/06-04-continuing-with-my-tools-he.pdf`,
        file_type: 'pdf',
        file_name: '06-04-continuing-with-my-tools-he.pdf',
        rtl: true,
        aliases: [
          'אני ממשיך לבד', 'הכלים שלי', 'להמשיך לבד',
          'עצמאות', 'סיום הטיפול', '6.4',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },

  // ── Full Series Workbook ─────────────────────────────────────────────────────

  {
    id: 'tf-children-cbt-series-premium-he',
    slug: 'children-cbt-series-premium-he',
    audience: 'children',
    category: 'workbook_series',
    type: 'therapeutic_workbook',
    cbt_stage: 'full_series',
    therapeutic_use:
      'Complete Hebrew children CBT premium worksheet series — all 6 stages and 24 sub-stages in one workbook. Covers the full CBT treatment process for children: assessment & alliance, case formulation, cognitive restructuring, behavioral interventions, skill building, and relapse prevention.',
    approved: true,
    tags: [
      'cbt', 'children', 'hebrew', 'premium',
      'workbook', 'series', 'full-series',
      'assessment', 'formulation', 'cognitive-restructuring',
      'behavioral-interventions', 'skill-building', 'relapse-prevention',
      'children-cbt-process',
      'סדרת ילדים', 'חוברת ילדים', 'קונטרס ילדים', 'כל שלבי הילדים',
    ],
    recommended_for: ['children_ages_6_to_12'],
    minimum_age: 6,
    maximum_age: 12,
    requires_parent_guidance: true,
    languages: {
      he: {
        title: 'סדרת ה-CBT המלאה לילדים (כל השלבים)',
        description:
          'חוברת עבודה טיפולית מלאה לילדים — כל 6 השלבים ו-24 תתי-השלבים של תהליך ה-CBT לילדים בחוברת אחת.',
        file_url: `${BASE_URL}/children-cbt-series-premium-he.pdf`,
        file_type: 'pdf',
        file_name: 'children-cbt-series-premium-he.pdf',
        rtl: true,
        aliases: [
          'סדרת ילדים', 'סדרת CBT לילדים', 'חוברת ילדים', 'קונטרס ילדים',
          'כל שלבי הילדים', 'כל הטפסים לילדים', 'סט מלא לילדים',
          'children CBT workbook', 'children worksheet series', 'full children CBT series',
        ],
      },
    },
    created_at: '2025-05-10T00:00:00.000Z',
    updated_at: '2025-05-10T00:00:00.000Z',
  },
];

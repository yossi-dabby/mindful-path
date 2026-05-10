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
    therapeuticGoal: 'Opening the therapeutic process with a child — building therapeutic alliance, initial assessment, and establishing a treatment roadmap.',
    whenToUse: 'At the beginning of therapy, in first sessions with a child, when introducing CBT concepts and building rapport.',
    childSignals: ['מתחילים טיפול', 'פגישה ראשונה', 'תחילת תהליך', 'הכרה ראשונה', 'בפגישות הראשונות'],
    clinicalKeywords: ['היכרות', 'הערכה', 'בניית אמון', 'ברית טיפולית', 'תחילת טיפול', 'פגישה ראשונה', 'intake'],
    hebrewIntentPhrases: ['תחילת טיפול עם ילד', 'להתחיל עם ילד', 'פגישות ראשונות עם ילד', 'שלב ראשון'],
    notFor: 'לא מתאים לשלבי עבודה קוגניטיבית, חשיפה, בניית מיומנויות או סיום טיפול.',
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
    therapeuticGoal: 'Child self-introduction — identifying personal identity, values, preferences, strengths, and safe supportive people.',
    whenToUse: 'When the child needs introduction to therapy, building trust, identifying strengths and what helps the child feel comfortable.',
    childSignals: ['להכיר את הילד', 'מה הילד אוהב', 'מה חשוב לילד', 'מה מרגיע את הילד', 'הילד לא רוצה לדבר', 'הילד לא פתוח'],
    clinicalKeywords: ['הכרה עצמית', 'זהות', 'כוחות', 'ערכים', 'העדפות', 'אנשים בטוחים', 'נקודות חוזק'],
    hebrewIntentPhrases: ['מי אני ומה חשוב לי', 'להכיר את הילד', 'כוחות הילד', 'מה חשוב לו'],
    notFor: 'לא מתאים לעבודה על מחשבות, מצבי קושי ספציפיים, חשיפה או סיום.',
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
    therapeuticGoal: 'Identifying when and where problems occur — mapping situational contexts of difficulty for baseline assessment.',
    whenToUse: 'When identifying where/when problems happen: home, school, friends, bedtime, transitions, social situations.',
    childSignals: ['קשה בבית הספר', 'קשה בבית', 'קשה עם חברים', 'קשה בשעת השינה', 'קשה במעברים', 'מתי זה קורה'],
    clinicalKeywords: ['מצבי קושי', 'הקשר', 'מתי קשה', 'איפה קשה', 'סיטואציות', 'בית ספר'],
    hebrewIntentPhrases: ['מתי קשה לילד', 'מה המצבים הקשים', 'איפה זה קורה', 'מתי זה קורה'],
    notFor: 'לא מתאים לניתוח מחשבות, ניסויים התנהגותיים, בניית מיומנויות או סיום.',
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
    therapeuticGoal: 'Functional analysis of coping responses — identifying adaptive and maladaptive behaviors in response to difficulty.',
    whenToUse: 'When analyzing coping behaviors: avoidance, crying, yelling, shutting down, hiding, asking for help, escape, freezing.',
    childSignals: ['הילד בוכה כשנלחץ', 'הילד צועק', 'הילד ברח', 'הילד מתחבא', 'הילד נסגר', 'מה עושה הילד כשקשה'],
    clinicalKeywords: ['ניתוח תפקודי', 'תגובות לקושי', 'הימנעות', 'בריחה', 'קיפאון', 'התנהגות בזמן קושי', 'דרכי התמודדות'],
    hebrewIntentPhrases: ['מה הילד עושה כשקשה לו', 'תגובות לקושי', 'מה עושה כשנלחץ', 'ניתוח תגובות'],
    notFor: 'לא מתאים לעבודה על מחשבות, חשיפה, בניית מיומנויות ספציפיות או סיום.',
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
    therapeuticGoal: 'Baseline severity and frequency assessment — quantifying problem frequency and functional impact before intervention.',
    whenToUse: 'For baseline measurement before intervention, progress tracking, and severity scoring before starting CBT techniques.',
    childSignals: ['כמה פעמים קורה', 'עד כמה מפריע', 'מדד בסיסי', 'הערכת קושי', 'כמה קשה זה'],
    clinicalKeywords: ['חומרה', 'תדירות', 'מדד בסיסי', 'השפעה', 'הערכה', 'baseline'],
    hebrewIntentPhrases: ['כמה פעמים זה קורה', 'כמה זה מפריע', 'להעריך את הקושי', 'מדד לפני טיפול'],
    notFor: 'לא מתאים לאחר שהטיפול כבר בעיצומו עם מיומנויות ספציפיות.',
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
    therapeuticGoal: 'Building the child CBT case formulation map — connecting trigger, thought, body/feeling, and action.',
    whenToUse: 'When building the CBT map for a child, explaining the connection between triggers, thoughts, feelings, body, and behavior.',
    childSignals: ['לבנות את המפה', 'לחבר מחשבות ורגשות', 'להבין את המעגל', 'לראות את הקשר בין כל הדברים'],
    clinicalKeywords: ['המשגה', 'מפה', 'מעגל הקושי', 'טריגר מחשבה גוף פעולה', 'CBT map', 'ניסוח מקרה'],
    hebrewIntentPhrases: ['מפת הקושי', 'בונים את המפה', 'מעגל הקושי', 'המשגה לילד'],
    notFor: 'לא מתאים בתחילת הטיפול לפני הערכה, או בשלבים מתקדמים ספציפיים.',
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
    therapeuticGoal: 'Antecedent and trigger identification — exploring what happened immediately before the difficult moment.',
    whenToUse: 'When identifying situational triggers: what happened right before, who was there, where it happened.',
    childSignals: ['מה קרה לפני', 'מה הציתה', 'מה גרם ל', 'טריגר לקושי', 'מה היה לפני שהתפרץ'],
    clinicalKeywords: ['טריגר', 'גורם מקדים', 'מה היה לפני', 'אנטסדנט', 'מה קדם לקושי'],
    hebrewIntentPhrases: ['מה היה רגע לפני', 'מה קרה לפני', 'מה הציתה את הקושי', 'להבין מה גרם לקושי'],
    notFor: 'לא מתאים לניתוח מחשבות, ביטויי גוף, או תגובות התנהגותיות בנפרד.',
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
    therapeuticGoal: 'Automatic thought identification — helping the child recognize what their mind told them during the difficult moment.',
    whenToUse: 'When identifying automatic thoughts in the hard moment: "I will fail", "they will laugh", "I am not good", "this is dangerous".',
    childSignals: ['אני לא אצליח', 'כולם יצחקו', 'אני לא טוב', 'אני לא שווה', 'זה מסוכן', 'הוא אמר לעצמו', 'היא אמרה לעצמה'],
    clinicalKeywords: ['מחשבה אוטומטית', 'מה הראש אמר', 'מה חשב הילד', 'מחשבות בזמן קושי', 'מחשבה בזמן קושי'],
    hebrewIntentPhrases: ['מה הראש אמר לי', 'מה הילד חשב', 'מה אמר לעצמו', 'אני לא אצליח', 'כולם יצחקו עליי'],
    notFor: 'לא מתאים לבדיקת ראיות, מחשבות חלופיות, חשיפה, כלים גופניים.',
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
    therapeuticGoal: 'Body-emotion connection for children — identifying physical sensations associated with difficult emotions as part of CBT formulation.',
    whenToUse: 'When identifying body sensations: stomach pain, racing heart, tense muscles, hot face, wanting to cry, wanting to run.',
    childSignals: ['כאב בטן', 'הלב דופק', 'שרירים מתוחים', 'פנים חמות', 'רוצה לברוח', 'גוף מרגיש משהו'],
    clinicalKeywords: ['תחושות גוף', 'ביטויי גוף', 'גוף ורגש', 'תחושות פיזיות', 'גוף בזמן קושי'],
    hebrewIntentPhrases: ['מה הרגשתי בגוף', 'תחושות גוף', 'גוף ורגש', 'לזהות תחושות גוף'],
    notFor: 'לא מתאים לניתוח מחשבות, חשיפה, כלים להרגעה ספציפיים.',
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
    therapeuticGoal: 'Behavioral consequence identification — understanding what the child did after the difficult moment and how it maintained the cycle.',
    whenToUse: 'When identifying consequences: escape, shutdown, yelling, reassurance seeking, avoidance, asking for help, calming.',
    childSignals: ['מה הילד עשה אחר כך', 'הילד ברח מהמצב', 'הילד נסגר', 'הילד צעק אחרי', 'הילד ביקש עזרה'],
    clinicalKeywords: ['תגובה התנהגותית', 'מה עשיתי', 'השפעת הפעולה', 'מחזור CBT', 'תוצאה התנהגותית'],
    hebrewIntentPhrases: ['מה עשיתי אחר כך', 'מה עשה הילד אחר כך', 'תגובה לאחר הקושי', 'מה קרה אחרי'],
    notFor: 'לא מתאים לניתוח מחשבות, טריגרים, בניית מיומנויות.',
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
    therapeuticGoal: 'Introduction to cognitive restructuring for children — beginning thought work, explaining what CBT thought examination involves.',
    whenToUse: 'When starting cognitive restructuring with children, introducing the idea of examining and changing unhelpful thoughts.',
    childSignals: ['מתחילים עבודה קוגניטיבית', 'לעבוד על מחשבות', 'שלב שלישי', 'להתחיל לבדוק מחשבות'],
    clinicalKeywords: ['עבודה קוגניטיבית', 'ארגון מחדש', 'שינוי מחשבות', 'שלב 3', 'עבודה על מחשבות'],
    hebrewIntentPhrases: ['עובדים על המחשבות', 'לעבוד על מחשבות', 'שלב קוגניטיבי', 'לשנות מחשבות'],
    notFor: 'לא מתאים לשלבים ספציפיים בתוך העבודה הקוגניטיבית (3.1–3.4).',
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
    therapeuticGoal: 'Catching automatic thoughts in real time — the child learns to notice and identify unhelpful automatic thoughts as they arise.',
    whenToUse: 'When the child needs help catching automatic thoughts in real time, first step in active cognitive restructuring.',
    childSignals: ['לתפוס מחשבה', 'לשים לב למחשבות', 'מחשבה שמגיעה פתאום', 'להיות מודע למחשבות', 'לזהות מחשבות'],
    clinicalKeywords: ['תפיסת מחשבה', 'מחשבה אוטומטית', 'מודעות למחשבות', 'לתפוס מחשבות', 'זיהוי מחשבות'],
    hebrewIntentPhrases: ['תפסתי מחשבה', 'לתפוס מחשבה', 'לשים לב למחשבות', 'מודעות למחשבות'],
    notFor: 'לא מתאים לאחר שהילד כבר מזהה מחשבות — עבור לבלש מחשבות (3.3).',
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
    therapeuticGoal: 'Distinguishing thoughts from facts — helping children differentiate between thoughts (interpretations/predictions) and actual facts.',
    whenToUse: 'When child treats thoughts as absolute truth: "I know they hate me", "I will definitely fail"; distinguishing thought, feeling, prediction, interpretation, and fact.',
    childSignals: ['כולם שונאים אותי', 'אין לזה הוכחה', 'זו לא עובדה', 'ילד שבטוח שכולם נגדו', 'הוכחה', 'להבדיל בין מחשבה לעובדה'],
    clinicalKeywords: ['הבחנה בין מחשבה לעובדה', 'פרשנות', 'עובדה', 'מחשבה לעומת עובדה', 'הוכחה', 'בדיקת מציאות'],
    hebrewIntentPhrases: ['להבדיל בין מחשבה לעובדה', 'האם זה עובדה', 'מחשבה או עובדה', 'בדיקת מציאות'],
    notFor: 'לא מתאים לשלב בדיקת ראיות (3.3) או בניית מחשבה חלופית (3.4).',
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
    therapeuticGoal: "Children's thought detective — gathering evidence for and against unhelpful thoughts, finding alternative explanations.",
    whenToUse: 'When checking evidence, finding alternative explanations, "what else could be true?", "what would I tell a friend?"',
    childSignals: ['לבדוק ראיות', 'לחפש הוכחות', 'מה עוד יכול להיות נכון', 'ראיות בעד ונגד', 'לחקור מחשבה'],
    clinicalKeywords: ['בדיקת ראיות', 'הסבר חלופי', 'ראיות', 'בלש מחשבות', 'לחקור מחשבה', 'מה עוד יכול להסביר'],
    hebrewIntentPhrases: ['לבדוק אם המחשבה נכונה', 'למצוא עוד הסבר', 'ראיות בעד ונגד', 'בלש מחשבות', 'לחקור את המחשבה'],
    notFor: 'לא מתאים לפני שהילד מזהה ומבין מחשבות אוטומטיות.',
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
    therapeuticGoal: 'Building helpful alternative thoughts — creating balanced, realistic, kind, and believable replacement thoughts.',
    whenToUse: 'For creating balanced replacement thoughts: realistic, kind, believable, not fake-positive; after evidence-checking.',
    childSignals: ['מחשבה חלופית', 'מחשבה מאוזנת', 'לשנות מחשבה', 'מחשבה שעוזרת', 'מחשבה אחרת'],
    clinicalKeywords: ['מחשבה חלופית', 'מחשבה מאוזנת', 'ארגון מחדש', 'מחשבה חדשה', 'מחשבה עוזרת'],
    hebrewIntentPhrases: ['מחשבה חדשה שעוזרת', 'מחשבה שעוזרת', 'מחשבה מאוזנת', 'מחשבה חלופית'],
    notFor: 'לא מתאים לפני שהילד בדק ראיות ומבין שהמחשבה אינה מדויקת.',
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
    therapeuticGoal: 'Introduction to behavioral interventions for children — moving from talking to practicing in real life.',
    whenToUse: 'When moving from cognitive work to real-life behavioral practice and exposure.',
    childSignals: ['מתחילים לתרגל', 'לתרגל במציאות', 'שלב התנהגותי', 'מהמחשבות לפעולה'],
    clinicalKeywords: ['התערבות התנהגותית', 'תרגול', 'חשיפה', 'שלב 4', 'עבודה במציאות'],
    hebrewIntentPhrases: ['עובדים במציאות', 'לתרגל במציאות', 'שלב התנהגותי', 'עבודה התנהגותית'],
    notFor: 'לא מתאים לטכניקות התנהגותיות ספציפיות (4.1–4.4).',
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
    therapeuticGoal: 'Graded exposure hierarchy for children — building a bravery ladder of feared/avoided situations to approach step by step.',
    whenToUse: 'For graded exposure hierarchy, fear ladder, bravery ladder, ranking situations from easy to hard.',
    childSignals: ['ילד מפחד', 'הימנעות', 'לא מסכים להיכנס', 'מסרב לנסות', 'פחד מספציפי'],
    clinicalKeywords: ['סולם הדרגתי', 'סולם חשיפה', 'סולם אומץ', 'חשיפה הדרגתית', 'פחד', 'הימנעות', 'דירוג פחד'],
    hebrewIntentPhrases: ['סולם הדרגתי', 'סולם אומץ', 'סולם חשיפה', 'לבנות סולם', 'חשיפה הדרגתית'],
    notFor: 'לא מתאים לצעד אחד ספציפי (4.2) או לניסוי התנהגותי (4.3).',
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
    therapeuticGoal: 'Small step planning — choosing one manageable behavioral step to build momentum and reduce avoidance.',
    whenToUse: 'For choosing one small behavioral step, planning when/where/with whom to practice.',
    childSignals: ['צעד אחד קטן', 'להתחיל בקטן', 'לתכנן צעד אחד', 'לפרק למשימה קטנה'],
    clinicalKeywords: ['צעד קטן', 'תכנון צעד', 'צעד ראשון', 'לפרק למשימות', 'הצעד הקטן'],
    hebrewIntentPhrases: ['הצעד הקטן שלי', 'צעד אחד קטן', 'לתכנן צעד ראשון', 'לבחור צעד'],
    notFor: 'לא מתאים לסולם הדרגתי מלא (4.1) או ניסוי התנהגותי (4.3).',
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
    therapeuticGoal: 'Behavioral experiment — the child plans and tests feared outcomes in a structured way, comparing predictions to what actually happened.',
    whenToUse: 'For behavioral experiments: prediction vs what actually happened, testing feared outcomes.',
    childSignals: ['לבדוק אם באמת', 'לנסות ולראות', 'מה יקרה אם', 'לבדוק את הפחד', 'יצחקו עליו'],
    clinicalKeywords: ['ניסוי התנהגותי', 'בדיקת תחזית', 'מה יקרה', 'תוצאה מפחידה', 'ניסוי', 'תחזית מול מציאות'],
    hebrewIntentPhrases: ['ניסוי אמיץ', 'ניסוי התנהגותי', 'לבדוק אם באמת', 'לנסות ולראות מה יקרה'],
    notFor: 'לא מתאים לסולם הדרגתי (4.1) או ניתוח מפעילים (4.4).',
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
    therapeuticGoal: 'Triggers and behavioral activation mapping — identifying personal triggers for difficult feelings and low-mood states.',
    whenToUse: 'For behavioral activation: low mood, low motivation, withdrawal, finding energizing activities; also for identifying personal triggers.',
    childSignals: ['מה מציתה', 'מה גורם לתגובה', 'גורמי הפעלה', 'ירידה במצב רוח', 'אין מוטיבציה'],
    clinicalKeywords: ['מפעילים', 'טריגרים', 'הפעלה התנהגותית', 'מה מציתה', 'גורמי ירידה', 'מפעיל'],
    hebrewIntentPhrases: ['מה מפעיל אותי', 'מפעילים שלי', 'מה מציתה אצלי', 'הפעלה התנהגותית'],
    notFor: 'לא מתאים לסולם חשיפה (4.1) או ניסוי התנהגותי (4.3).',
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
    therapeuticGoal: 'Introduction to skill building — adding calming, help-seeking, communication, and relationship tools to the child CBT toolkit.',
    whenToUse: 'When the child needs a toolkit of coping tools: calming, help-seeking, communication, and social skills.',
    childSignals: ['ארגז כלים', 'כלים לילד', 'מיומנויות לילד', 'כלים להתמודדות'],
    clinicalKeywords: ['בניית מיומנויות', 'כלים', 'ארגז כלים', 'שלב 5', 'מיומנויות'],
    hebrewIntentPhrases: ['ארגז כלים לילד', 'מיומנויות לילד', 'כלים לארגז', 'לבנות ארגז כלים'],
    notFor: 'לא מתאים למיומנויות ספציפיות — ראה 5.1–5.4.',
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
    therapeuticGoal: 'Body calming tools for children — breathing exercises, muscle relaxation, sensory grounding, and body regulation.',
    whenToUse: 'When a child needs body regulation tools: breathing techniques, muscle relaxation, sensory grounding, calming after stress.',
    childSignals: ['גוף מתוח', 'נלחץ', 'לא מצליח להירגע', 'צריך להרגיע', 'נשימות', 'גוף שלו מתוח'],
    clinicalKeywords: ['נשימות', 'הרגעה', 'הרפיה', 'ויסות גוף', 'הרגעת גוף', 'כלים גופניים', 'גוף'],
    hebrewIntentPhrases: ['גוף מתוח', 'נשימות והרגעה', 'להרגיע את הגוף', 'כלים גופניים', 'הרגעת גוף'],
    notFor: 'לא מתאים לבניית מחשבות חלופיות, בקשת עזרה, תיקון קשר.',
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
    therapeuticGoal: 'Helpful self-talk phrases for children — developing personal coping statements for difficult moments.',
    whenToUse: 'For coping statements and short self-talk phrases during distress or difficult moments.',
    childSignals: ['משפטים לחזק', 'לדבר עצמי', 'משפט שיעזור', 'משפטי עידוד', 'מה לומר לעצמי'],
    clinicalKeywords: ['דיבור עצמי', 'משפטי התמודדות', 'משפטים מחזקים', 'עידוד עצמי', 'self-talk'],
    hebrewIntentPhrases: ['משפטים שעוזרים לי', 'משפטים מחזקים', 'דיבור עצמי', 'משפטי התמודדות'],
    notFor: 'לא מתאים לכלים גופניים (5.1), בקשת עזרה (5.3), תיקון קשר (5.4).',
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
    therapeuticGoal: 'Help-seeking skills — teaching children to recognize when they need help and how to ask for it clearly and calmly.',
    whenToUse: 'When the child struggles to ask for help clearly, calmly, or early enough; when child has outbursts before asking for help.',
    childSignals: ['לא יודע לבקש עזרה', 'מתפרץ', 'לא מצליח לבקש', 'צועק לפני שמבקש', 'לבקש עזרה'],
    clinicalKeywords: ['בקשת עזרה', 'מיומנויות תקשורת', 'לפני שמתפרץ', 'מיומנות חברתית', 'עזרה'],
    hebrewIntentPhrases: ['לבקש עזרה', 'איך לבקש עזרה', 'לפני שמתפרץ', 'לא יודע לבקש'],
    notFor: 'לא מתאים לכלים גופניים (5.1), משפטים מחזקים (5.2), תיקון קשר (5.4).',
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
    therapeuticGoal: 'Relationship repair skills — teaching the child how to make up after a conflict, apology, listening, and reconnecting.',
    whenToUse: 'After arguments, hurt feelings, conflict repair, apology, listening, reconnecting with friends or family.',
    childSignals: ['ריב עם חבר', 'ריב עם חברה', 'ריב עם אח', 'רגשות פגועים', 'צריך להתפייס', 'רבה עם'],
    clinicalKeywords: ['תיקון קשר', 'ריב', 'פיוס', 'התנצלות', 'קשר חברתי', 'פתרון סכסוך', 'להתפייס'],
    hebrewIntentPhrases: ['תיקון קשר', 'תיקון הקשר', 'ריב עם חברה', 'פיוס', 'להתפייס'],
    notFor: 'לא מתאים לכלים גופניים (5.1), בקשת עזרה (5.3), עבודה קוגניטיבית.',
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
    therapeuticGoal: 'Introduction to treatment ending and maintenance — celebrating success and preparing the child for an independent future.',
    whenToUse: 'When summarizing progress, preparing for end of treatment, building the child\'s future plan.',
    childSignals: ['מסיימים טיפול', 'סיום תהליך', 'לסגור את הטיפול', 'לסיים', 'שלב אחרון'],
    clinicalKeywords: ['מניעת נסיגה', 'סיום טיפול', 'שימור הישגים', 'עצמאות', 'שלב 6'],
    hebrewIntentPhrases: ['מסיימים טיפול', 'סיום טיפול', 'שלב שישי', 'שמירה על ההצלחה'],
    notFor: 'לא מתאים לסיום ספציפי כמו כרטיס כוח (6.3) או תכנית עצמאות (6.4).',
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
    therapeuticGoal: 'Self-reflection at treatment ending — reviewing progress, strengths, and what changed during the CBT process.',
    whenToUse: 'For reflection, progress review, strengths, what changed, what helped throughout therapy.',
    childSignals: ['מה הילד למד', 'מה השתנה', 'מה עזר', 'סיכום תהליך', 'להסתכל אחורה'],
    clinicalKeywords: ['הרהור עצמי', 'סיכום', 'מה למדתי', 'הצלחות', 'כוחות שנרכשו', 'סיכום הדרך'],
    hebrewIntentPhrases: ['מה למדתי על עצמי', 'מה הילד למד', 'סיכום הדרך', 'מה השתנה'],
    notFor: 'לא מתאים לזיהוי מצבי סיכון עתידיים (6.2), כרטיס כוח (6.3), תכנית עצמאות (6.4).',
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
    therapeuticGoal: 'Relapse prevention planning — identifying future risk situations and early warning signs.',
    whenToUse: 'For identifying future risk situations, early warning signs, relapse prevention triggers.',
    childSignals: ['מתי יחזור הקושי', 'מצבי סיכון עתידיים', 'סימנים מוקדמים', 'מניעת נסיגה'],
    clinicalKeywords: ['מניעת נסיגה', 'סיכון עתידי', 'סימנים מוקדמים', 'עתיד', 'מצבי סיכון', 'relapse prevention'],
    hebrewIntentPhrases: ['מתי יחזור הקושי', 'מצבי סיכון', 'מניעת נסיגה', 'סימנים מוקדמים'],
    notFor: 'לא מתאים לסיכום הדרך (6.1) או כרטיס כוח (6.3).',
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
    therapeuticGoal: 'Portable coping card — a personal reminder card with strengths, tools, and coping steps for hard moments after therapy.',
    whenToUse: 'When hard moments happen and the child needs a portable reminder; at end of therapy as a compact coping reference.',
    childSignals: ['כרטיס קצר', 'מסיימים טיפול', 'כשיהיה קשה', 'להזכיר לילד', 'כרטיס לזכור'],
    clinicalKeywords: ['כרטיס כוח', 'כרטיס התמודדות', 'תזכורת', 'כלים לאחר טיפול', 'כרטיס קצר', 'coping card'],
    hebrewIntentPhrases: ['כרטיס הכוח', 'כרטיס כוח', 'כרטיס קצר', 'שיזכיר לילד מה לעשות'],
    notFor: 'לא מתאים לסיכום מורחב (6.1) או תכנית עצמאות מפורטת (6.4).',
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
    therapeuticGoal: 'Post-treatment independence — the child affirms their ability to continue independently with their tools.',
    whenToUse: 'For post-treatment independence, ongoing support plan, who helps, which tools to keep using.',
    childSignals: ['להמשיך לבד', 'אחרי הטיפול', 'עצמאות', 'מי יעזור', 'הכלים לעתיד'],
    clinicalKeywords: ['עצמאות', 'תכנית המשך', 'אחרי טיפול', 'להמשיך לבד', 'תמיכה עתידית'],
    hebrewIntentPhrases: ['להמשיך לבד', 'עצמאות לאחר טיפול', 'תכנית המשך', 'הכלים לעתיד'],
    notFor: 'לא מתאים לסיכום (6.1), זיהוי סיכונים (6.2) או כרטיס כוח (6.3).',
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

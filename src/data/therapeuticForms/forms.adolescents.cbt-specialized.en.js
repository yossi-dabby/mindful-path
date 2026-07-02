const SERIES_ID = 'adolescents-cbt-specialized-en';
const SERIES_SLUG = 'adolescents-cbt-specialized-series-en';
const SERIES_FILE_NAME = 'yourcbttrapist_adolescents_cbt_specialized_en_full_series_60_forms_web_optimized_under_25mb.pdf';
const SERIES_FILE_URL = `/forms/en/adolescents/cbt-specialized/${SERIES_FILE_NAME}`;
const moduleFileUrl = (moduleCode, fileName) => `/forms/en/adolescents/cbt-specialized/module-${moduleCode}/${fileName}`;

const SHARED_NOT_FOR = Object.freeze([
  'non-English locale sessions',
  'children under adolescent age',
  'adult or older-adult requests',
  'crisis intervention',
  'emergency mental health situations',
]);

const SHARED_SECONDARY_CATEGORIES = Object.freeze([
  'workbook_series',
  'coping_tools',
  'emotional_regulation',
  'weekly_practice',
]);

const MODULE_DEFINITIONS = Object.freeze([
  {
    moduleNumber: 1,
    moduleCode: '01',
    moduleTitle: 'Anxiety, Stress and Fears',
    fileName: 'yourcbttrapist_adolescents_cbt_specialized_en_module_01_anxiety_stress_and_fears.pdf',
    summary: 'Calm, practical CBT tools for anxiety, stress, worries, fears, and avoidance with supportive step-by-step coping.',
    therapeuticGoal: 'Support anxious teens in noticing stress patterns, reducing avoidance, and building courage through manageable practice.',
    whenToUse: 'Use for anxiety, stress overload, worry spirals, fear of situations, and test-stress coping.',
    clinicalIndication: 'Anxiety distress, stress pressure, fear-based avoidance, school-test stress.',
    clinicalKeywords: ['anxiety', 'stress', 'fear', 'worry', 'test stress', 'avoidance', 'courage ladder'],
    contentThemes: ['stress signals', 'fear mapping', 'worry skills', 'small courage steps'],
    intentPhrases: ['anxiety module', 'stress and fears module', 'test stress worksheet', 'courage ladder', 'module 01'],
  },
  {
    moduleNumber: 2,
    moduleCode: '02',
    moduleTitle: 'Mood, Functioning and Energy',
    fileName: 'yourcbttrapist_adolescents_cbt_specialized_en_module_02_mood_functioning_and_energy.pdf',
    summary: 'Supportive worksheets for low mood, daily functioning, activation, and energy reset planning.',
    therapeuticGoal: 'Help teens improve mood and functioning through structured, realistic activation and support routines.',
    whenToUse: 'Use for low mood, low motivation, heavy feelings, low energy, and mood reset support.',
    clinicalIndication: 'Mood drop, reduced functioning, low motivation, low energy routines.',
    clinicalKeywords: ['low mood', 'motivation', 'energy', 'feeling heavy', 'support', 'mood reset'],
    contentThemes: ['mood check-ins', 'activation steps', 'energy support plan', 'daily functioning'],
    intentPhrases: ['low mood module', 'motivation worksheet', 'energy reset', 'module 02'],
  },
  {
    moduleNumber: 3,
    moduleCode: '03',
    moduleTitle: 'Self-Esteem and Identity',
    fileName: 'yourcbttrapist_adolescents_cbt_specialized_en_module_03_self_esteem_and_identity.pdf',
    summary: 'CBT forms for self-criticism, identity pressure, values clarity, and steadier self-worth.',
    therapeuticGoal: 'Build healthier self-view and values-based identity while reducing self-critical loops.',
    whenToUse: 'Use for self-esteem struggles, comparison stress, identity confusion, and values reflection.',
    clinicalIndication: 'Self-critical thinking, comparison distress, identity instability, low self-worth.',
    clinicalKeywords: ['self-criticism', 'comparison', 'identity', 'values', 'self-esteem'],
    contentThemes: ['self-talk', 'values map', 'identity strengths', 'self-respect'],
    intentPhrases: ['self-esteem module', 'identity worksheet', 'comparison thoughts', 'module 03'],
  },
  {
    moduleNumber: 4,
    moduleCode: '04',
    moduleTitle: 'Friendship, Belonging, and Conflict',
    fileName: 'yourcbttrapist_adolescents_cbt_specialized_en_module_04_friendship_belonging_and_conflict.pdf',
    summary: 'Worksheets for friendship stress, belonging, conflict navigation, and repair-oriented communication.',
    therapeuticGoal: 'Strengthen social confidence, boundaries, and conflict repair skills in peer contexts.',
    whenToUse: 'Use for friendship worries, exclusion pain, conflict, boundary-setting, and repair conversations.',
    clinicalIndication: 'Peer conflict, belonging pain, social disconnection, boundary challenges.',
    clinicalKeywords: ['friendship', 'belonging', 'exclusion', 'conflict', 'boundaries', 'repair'],
    contentThemes: ['social triggers', 'boundary language', 'repair steps', 'belonging support'],
    intentPhrases: ['friendship module', 'conflict worksheet', 'boundaries with friends', 'module 04'],
  },
  {
    moduleNumber: 5,
    moduleCode: '05',
    moduleTitle: 'Anger, Impulsivity, and Regulation',
    fileName: 'yourcbttrapist_adolescents_cbt_specialized_en_module_05_anger_impulsivity_and_regulation.pdf',
    summary: 'Tools for noticing escalation early, pausing impulses, calming down, and repairing after outbursts.',
    therapeuticGoal: 'Improve pause-and-respond capacity and support repair after high-intensity reactions.',
    whenToUse: 'Use for anger spikes, impulsive reactions, calm-down planning, and repair after blow-ups.',
    clinicalIndication: 'Anger dysregulation, impulsive behavior, escalation cycles, post-conflict repair needs.',
    clinicalKeywords: ['anger', 'impulsivity', 'pause', 'calm-down', 'repair after blow-up'],
    contentThemes: ['escalation cues', 'pause routine', 'regulation plan', 'repair script'],
    intentPhrases: ['anger module', 'impulsivity worksheet', 'calm down plan', 'module 05'],
  },
  {
    moduleNumber: 6,
    moduleCode: '06',
    moduleTitle: 'OCD, Intrusive Thoughts, and New Responses',
    fileName: 'yourcbttrapist_adolescents_cbt_specialized_en_module_06_ocd_intrusive_thoughts_and_new_responses.pdf',
    summary: 'Age-appropriate support for noticing intrusive thoughts and urges while practicing safer new responses without reassurance loops.',
    therapeuticGoal: 'Help teens reduce ritual/reassurance cycles by building tolerant, values-guided response practice.',
    whenToUse: 'Use for intrusive or sticky thoughts, urges, rituals, reassurance patterns, and practicing new responses.',
    clinicalIndication: 'OCD-like loops, intrusive thoughts distress, urge-ritual cycle patterns.',
    clinicalKeywords: ['ocd', 'intrusive thoughts', 'sticky thoughts', 'urges', 'rituals', 'reassurance', 'new response'],
    contentThemes: ['urge awareness', 'response choice', 'ritual reduction', 'supportive exposure-lite'],
    intentPhrases: ['ocd module', 'intrusive thoughts worksheet', 'new response practice', 'module 06'],
    notFor: Object.freeze(['reassurance loops', 'ritual reinforcement']),
  },
  {
    moduleNumber: 7,
    moduleCode: '07',
    moduleTitle: 'ADHD, Attention, Organization, and Impulsivity',
    fileName: 'yourcbttrapist_adolescents_cbt_specialized_en_module_07_adhd_attention_organization_and_impulsivity.pdf',
    summary: 'Practical CBT tools for attention, task-start friction, planning, organization, and impulse control.',
    therapeuticGoal: 'Increase functional follow-through with clear task scaffolds, focus supports, and regulation habits.',
    whenToUse: 'Use for focus struggles, getting started, task steps, distraction, organization, and impulsivity.',
    clinicalIndication: 'Attention dysregulation, executive-function friction, planning and organization deficits.',
    clinicalKeywords: ['adhd', 'focus', 'starting tasks', 'task steps', 'distraction', 'organization', 'impulsivity'],
    contentThemes: ['task initiation', 'focus anchors', 'step planning', 'organization routines'],
    intentPhrases: ['adhd module', 'focus worksheet', 'task steps plan', 'module 07'],
  },
  {
    moduleNumber: 8,
    moduleCode: '08',
    moduleTitle: 'Body, Sleep, and Stress',
    fileName: 'yourcbttrapist_adolescents_cbt_specialized_en_module_08_body_sleep_and_stress.pdf',
    summary: 'Regulation worksheets for body stress, sleep routines, breathing, and overload-recovery balance.',
    therapeuticGoal: 'Strengthen body-based regulation and healthier sleep-stress balance for day-to-day resilience.',
    whenToUse: 'Use for body stress, sleep issues, breathing support, overload, body check-ins, and balance plans.',
    clinicalIndication: 'Sleep-stress disruption, physiological overload, body regulation needs.',
    clinicalKeywords: ['body stress', 'sleep', 'breathing', 'overload', 'body check-in', 'balance'],
    contentThemes: ['sleep reset', 'breath supports', 'body awareness', 'recovery rhythm'],
    intentPhrases: ['sleep module', 'body stress worksheet', 'breathing plan', 'module 08'],
  },
  {
    moduleNumber: 9,
    moduleCode: '09',
    moduleTitle: 'Trauma and Safe Coping',
    fileName: 'yourcbttrapist_adolescents_cbt_specialized_en_module_09_trauma_and_safe_coping.pdf',
    summary: 'Gentle, non-graphic trauma-safe coping tools focused on grounding, support, and gradual return.',
    therapeuticGoal: 'Promote safety and stabilization through grounding, support mapping, and paced re-engagement.',
    whenToUse: 'Use for trauma-safe coping, grounding, safety anchors, support circles, calm-back, and gentle return.',
    clinicalIndication: 'Post-stress safety needs, dysregulation after difficult experiences, stabilization-focused coping.',
    clinicalKeywords: ['trauma-safe coping', 'grounding', 'safety anchor', 'support circle', 'calm-back', 'gentle return'],
    contentThemes: ['grounding steps', 'support network', 'safety anchoring', 'gradual return'],
    intentPhrases: ['trauma safe coping module', 'grounding worksheet', 'safety anchor', 'module 09'],
  },
  {
    moduleNumber: 10,
    moduleCode: '10',
    moduleTitle: 'Parents and Teens',
    fileName: 'yourcbttrapist_adolescents_cbt_specialized_en_module_10_parents_and_teens.pdf',
    summary: 'Family communication worksheets for parents and teens: listening, trust, autonomy, and repair-focused conversation.',
    therapeuticGoal: 'Support healthier parent-teen communication, shared understanding, and collaborative independence-building.',
    whenToUse: 'Use for home communication stress, parent understanding, listening, independence, trust, and family conversation.',
    clinicalIndication: 'Family communication strain, parent-teen conflict, trust and autonomy tension.',
    clinicalKeywords: ['parents', 'teens', 'home communication', 'parent understanding', 'listening', 'independence', 'trust', 'family conversation'],
    contentThemes: ['conversation structure', 'listening skills', 'trust repair', 'independence agreements'],
    intentPhrases: ['parents and teens module', 'family conversation worksheet', 'home communication plan', 'module 10'],
  },
]);

const SERIES_FORM = Object.freeze({
  id: SERIES_ID,
  slug: SERIES_SLUG,
  parentSeriesId: null,
  type: 'workbook_package',
  title: 'Adolescents CBT Specialized Series',
  language: 'en',
  audience: 'adolescents',
  category: 'adolescents_cbt_specialized',
  secondaryCategories: SHARED_SECONDARY_CATEGORIES,
  moduleCount: 10,
  formsCount: 60,
  numberingRange: '01-10',
  fileUrl: SERIES_FILE_URL,
  description: 'A 60-form specialized English CBT workbook for adolescents covering modules 01–10 across anxiety, mood, identity, relationships, anger, OCD, ADHD, body/sleep/stress, trauma-safe coping, and parent-teen communication.',
  therapeuticGoal: 'Provide structured, age-appropriate specialized CBT support across common adolescent clinical needs.',
  whenToUse: 'Use when a teen or caregiver explicitly asks for the full Adolescents CBT Specialized Series workbook in English.',
  clinicalIndication: 'Broad multi-domain adolescent CBT support request in English.',
  clinicalKeywords: Object.freeze([
    'adolescents cbt specialized series',
    'full specialized workbook',
    'all 60 forms',
    'teen specialized cbt workbook',
    'module 01',
    'module 10',
  ]),
  intentPhrases: Object.freeze([
    'adolescents cbt specialized series',
    'full specialized series',
    'full 60-form specialized workbook',
    'send all specialized forms',
    'complete specialized workbook for teens',
    'specialized cbt full series',
  ]),
  contentThemes: Object.freeze(['anxiety', 'mood', 'identity', 'relationships', 'anger', 'ocd', 'adhd', 'sleep', 'trauma-safe coping', 'parents and teens']),
  notFor: SHARED_NOT_FOR,
  relatedForms: Object.freeze([]),
  therapeutic_use: 'adolescents_cbt_specialized_workbook_series',
  approved: true,
  languages: Object.freeze({
    en: Object.freeze({
      title: 'Adolescents CBT Specialized Series',
      description: 'A full 60-form specialized English CBT workbook for adolescents (modules 01–10).',
      file_url: SERIES_FILE_URL,
      file_type: 'pdf',
      file_name: SERIES_FILE_NAME,
      rtl: false,
    }),
  }),
});

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS = Object.freeze(
  MODULE_DEFINITIONS.map((moduleDef) => {
    const id = `${SERIES_ID}-module-${moduleDef.moduleCode}`;
    const slug = `adolescents-cbt-specialized-en-module-${moduleDef.moduleCode}`;
    const fileUrl = moduleFileUrl(moduleDef.moduleCode, moduleDef.fileName);
    const moduleNotFor = Array.isArray(moduleDef.notFor) && moduleDef.notFor.length > 0
      ? Object.freeze(Array.from(new Set([...SHARED_NOT_FOR, ...moduleDef.notFor])))
      : SHARED_NOT_FOR;

    return Object.freeze({
      id,
      slug,
      parentSeriesId: SERIES_ID,
      type: 'module_pdf',
      title: `Module ${moduleDef.moduleCode} — ${moduleDef.moduleTitle}`,
      language: 'en',
      audience: 'adolescents',
      category: 'adolescents_cbt_specialized',
      secondaryCategories: SHARED_SECONDARY_CATEGORIES,
      series: 'Adolescents CBT Specialized Series',
      moduleNumber: moduleDef.moduleNumber,
      moduleCode: moduleDef.moduleCode,
      displayNumber: moduleDef.moduleCode,
      formNumber: moduleDef.moduleCode,
      fileUrl,
      description: moduleDef.summary,
      therapeuticGoal: moduleDef.therapeuticGoal,
      whenToUse: moduleDef.whenToUse,
      clinicalIndication: moduleDef.clinicalIndication,
      clinicalKeywords: Object.freeze(moduleDef.clinicalKeywords),
      intentPhrases: Object.freeze(moduleDef.intentPhrases),
      contentThemes: Object.freeze(moduleDef.contentThemes),
      notFor: moduleNotFor,
      relatedForms: Object.freeze([SERIES_ID]),
      therapeutic_use: 'adolescents_cbt_specialized_module_pdf',
      approved: true,
      languages: Object.freeze({
        en: Object.freeze({
          title: `Module ${moduleDef.moduleCode} — ${moduleDef.moduleTitle}`,
          description: moduleDef.summary,
          file_url: fileUrl,
          file_type: 'pdf',
          file_name: moduleDef.fileName,
          rtl: false,
        }),
      }),
    });
  })
);

export const ADOLESCENTS_CBT_SPECIALIZED_EN_MANIFEST = Object.freeze({
  source: 'public/forms/en/adolescents/cbt-specialized/',
  series: Object.freeze({
    id: SERIES_ID,
    slug: SERIES_SLUG,
    file_name: SERIES_FILE_NAME,
    file_url: SERIES_FILE_URL,
    module_count: 10,
    forms_count: 60,
  }),
  modules: Object.freeze(
    MODULE_DEFINITIONS.map((moduleDef) =>
      Object.freeze({
        moduleNumber: moduleDef.moduleNumber,
        moduleCode: moduleDef.moduleCode,
        moduleTitle: moduleDef.moduleTitle,
        fileName: moduleDef.fileName,
        fileUrl: moduleFileUrl(moduleDef.moduleCode, moduleDef.fileName),
      })
    )
  ),
  forms: Object.freeze([
    SERIES_FORM,
    ...FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS,
  ]),
});

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL = Object.freeze([]);

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN = Object.freeze([
  SERIES_FORM,
  ...FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS,
]);

const ADOLESCENTS_CBT_CORE_EN_PACKAGE_ID = 'adolescents-cbt-core-en';
const ADOLESCENTS_CBT_CORE_EN_PACKAGE_FILE_URL = '/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf';

const SHARED_SECONDARY_CATEGORIES = Object.freeze([
  'therapeutic_workbooks',
  'thought_records',
  'cognitive_restructuring',
  'emotional_regulation',
  'coping_tools',
  'weekly_practice',
  'journaling_reflection',
]);

const SHARED_NOT_FOR = Object.freeze([
  'children under adolescent age',
  'adult or older-adult requests',
  'Hebrew language requests unless English is explicitly requested',
  'crisis intervention',
  'emergency mental health situations',
  'trauma processing without clinician support',
]);

const STAGE_TITLES = Object.freeze({
  1: 'Understand What Is Happening',
  2: 'Noticing Thoughts and Interpretation',
  3: 'Checking Evidence and Reframing',
  4: 'Choosing Helpful Actions',
  5: 'Behavior and Action Practice',
  6: 'Keeping Going and Looking Ahead',
});

const ADOLESCENTS_CBT_CORE_EN_PACKAGE = Object.freeze({
  id: ADOLESCENTS_CBT_CORE_EN_PACKAGE_ID,
  slug: 'adolescents-cbt-core-series-1-en',
  parentSeriesId: null,
  type: 'workbook_package',
  title: 'Adolescents CBT Core Series',
  language: 'en',
  audience: 'adolescents',
  category: 'adolescents_cbt_core',
  secondaryCategories: SHARED_SECONDARY_CATEGORIES,
  fileUrl: ADOLESCENTS_CBT_CORE_EN_PACKAGE_FILE_URL,
  pageCount: 30,
  seriesType: 'workbook_series',
  stageCount: 6,
  formsCount: 30,
  numberingRange: '1.1-6.5',
  description:
    'A 30-page English CBT core workbook for adolescents, organized into six stages that help teens understand what is happening, notice body signals and thoughts, check evidence, choose helpful actions, work with avoidance, and continue weekly practice.',
  therapeuticGoal:
    'Support adolescents in structured CBT self-practice across emotions, automatic thoughts, evidence-checking, helpful action planning, behavior activation, and weekly continuity.',
  whenToUse:
    'Use when a teen asks for a CBT workbook, structured CBT forms, anxiety/stress thought-work, avoidance support, or a weekly check-in coping plan in English.',
  clinicalKeywords: Object.freeze([
    'teen CBT',
    'adolescent CBT',
    'anxiety',
    'stress',
    'worry',
    'avoidance',
    'automatic thoughts',
    'thought record',
    'cognitive restructuring',
    'body signals',
    'triggers',
    'emotional regulation',
    'coping skills',
    'behavioral activation',
    'small steps',
    'weekly check-in',
    'self-reflection',
    'personal coping plan',
  ]),
  intentPhrases: Object.freeze([
    'full workbook',
    'complete cbt series',
    'full adolescent cbt core',
    'all teen cbt worksheets',
    'complete series',
    'I need a CBT workbook for a teenager',
    'I need worksheets for a teen',
    'help a teenager understand thoughts and feelings',
    'teen anxiety worksheet',
    'adolescent CBT form',
    'thought record for teens',
    'help with avoidance',
    'help with body signals',
    'help with emotional regulation',
    'help a teen choose a helpful action',
    'weekly CBT practice for adolescents',
    'coping plan for a teenager',
  ]),
  notFor: SHARED_NOT_FOR,
  relatedForms: Object.freeze([]),
  relatedCategories: Object.freeze([
    'adolescents_cbt_core',
    'workbook_series',
    'thought_records',
    'emotional_regulation',
    'coping_tools',
    'weekly_practice',
    'reflection_journal',
  ]),
  therapeutic_use: 'adolescents_cbt_core_workbook_series',
  approved: true,
  languages: Object.freeze({
    en: Object.freeze({
      title: 'Adolescents CBT Core Series',
      description:
        'A 30-page English CBT core workbook for adolescents, organized into six stages that help teens understand what is happening, notice body signals and thoughts, check evidence, choose helpful actions, work with avoidance, and continue weekly practice.',
      file_url: ADOLESCENTS_CBT_CORE_EN_PACKAGE_FILE_URL,
      file_type: 'pdf',
      file_name: 'adolescents-cbt-core-series-1-full-en.pdf',
      rtl: false,
    }),
  }),
});

const INDIVIDUAL_WORKSHEET_DEFINITIONS = Object.freeze([
  { stageNumber: 1, worksheetNumberInStage: 1, title: 'What Is Going On for Me Right Now?', fileName: '01-01-what-is-going-on-for-me-right-now.pdf', description: 'Recognize your current state and begin identifying what you are experiencing right now.', therapeuticGoal: 'Build first-step awareness of present thoughts, feelings, and context.', whenToUse: 'Use when a teen needs a starting point to pause and describe what is happening.', clinicalKeywords: ['check-in', 'self-awareness', 'current state'], intentPhrases: ['what is going on for me right now', 'current state worksheet', 'starting worksheet'] },
  { stageNumber: 1, worksheetNumberInStage: 2, title: 'My Body Gives Me Signals', fileName: '01-02-my-body-gives-me-signals.pdf', description: 'Identify body cues linked to stress, anxiety, and emotional activation.', therapeuticGoal: 'Help teens notice body sensations as early warning and regulation signals.', whenToUse: 'Use for body-signal, physical symptom, or emotion-in-the-body requests.', clinicalKeywords: ['body signals', 'somatic cues', 'physical sensations'], intentPhrases: ['body signals worksheet', 'my body gives me signals', 'physical signs of stress'] },
  { stageNumber: 1, worksheetNumberInStage: 3, title: 'What Triggered Me?', fileName: '01-03-what-triggered-me.pdf', description: 'Identify triggering situations, places, thoughts, or comments.', therapeuticGoal: 'Increase trigger awareness before reaction patterns escalate.', whenToUse: 'Use for trigger-identification and what-started-this requests.', clinicalKeywords: ['trigger', 'situation', 'activation'], intentPhrases: ['trigger worksheet', 'what triggered me', 'what was the trigger'] },
  { stageNumber: 1, worksheetNumberInStage: 4, title: 'Thought, Feeling, Action', fileName: '01-04-thought-feeling-action.pdf', description: 'Map the relationship between thought, emotion, and behavior.', therapeuticGoal: 'Teach the core CBT triangle connection in practical terms.', whenToUse: 'Use when the user asks for thought-feeling-action mapping.', clinicalKeywords: ['cbt triangle', 'thought feeling action', 'reaction chain'], intentPhrases: ['thought feeling action', 'form 1.4', 'cbt triangle worksheet'] },
  { stageNumber: 1, worksheetNumberInStage: 5, title: 'My Personal Map', fileName: '01-05-my-personal-map.pdf', description: 'Build a personal coping map of what helps and who can support.', therapeuticGoal: 'Strengthen personal coping structure and support planning.', whenToUse: 'Use when a teen asks to map supports and helpful actions.', clinicalKeywords: ['coping map', 'supports', 'what helps'], intentPhrases: ['my personal map', 'coping map worksheet', 'form 1.5'] },

  { stageNumber: 2, worksheetNumberInStage: 1, title: 'What Did My Mind Say?', fileName: '02-01-what-did-my-mind-say.pdf', description: 'Capture first automatic thoughts after a stressful situation.', therapeuticGoal: 'Increase awareness of quick automatic thought content.', whenToUse: 'Use for automatic-thought identification requests.', clinicalKeywords: ['automatic thought', 'first thought', 'mind said'], intentPhrases: ['what did my mind say', 'automatic thoughts worksheet', 'form 2.1'] },
  { stageNumber: 2, worksheetNumberInStage: 2, title: 'Thought or Fact?', fileName: '02-02-thought-or-fact.pdf', description: 'Differentiate interpretations from objective facts.', therapeuticGoal: 'Improve cognitive differentiation and reduce fusion with thoughts.', whenToUse: 'Use for thought-versus-fact clarification requests.', clinicalKeywords: ['thought or fact', 'cognitive defusion', 'interpretation'], intentPhrases: ['thought or fact', 'thought vs fact', 'form 2.2'] },
  { stageNumber: 2, worksheetNumberInStage: 3, title: 'Which Interpretation Did I Give It?', fileName: '02-03-which-interpretation-did-i-give-it.pdf', description: 'Review multiple interpretations of one event.', therapeuticGoal: 'Expand interpretation flexibility and reduce single-story thinking.', whenToUse: 'Use when users ask about interpretation bias or alternative interpretations.', clinicalKeywords: ['interpretation', 'meaning making', 'perspective'], intentPhrases: ['which interpretation did i give it', 'interpretation worksheet', 'form 2.3'] },
  { stageNumber: 2, worksheetNumberInStage: 4, title: 'What Kind of Thought Is This?', fileName: '02-04-what-kind-of-thought-is-this.pdf', description: 'Identify common distorted thinking styles or patterns.', therapeuticGoal: 'Help teens label thought patterns that intensify distress.', whenToUse: 'Use for thinking-pattern classification and distortion requests.', clinicalKeywords: ['thinking patterns', 'distortion', 'cognitive pattern'], intentPhrases: ['what kind of thought is this', 'thinking pattern worksheet', 'form 2.4'] },
  { stageNumber: 2, worksheetNumberInStage: 5, title: 'What Belief Lies Underneath?', fileName: '02-05-what-belief-lies-underneath.pdf', description: 'Explore deeper beliefs beneath repeated automatic thoughts.', therapeuticGoal: 'Surface core belief themes to guide restructuring work.', whenToUse: 'Use for deeper-belief or underlying-message requests.', clinicalKeywords: ['core belief', 'underlying belief', 'schema'], intentPhrases: ['what belief lies underneath', 'underlying belief worksheet', 'form 2.5'] },

  { stageNumber: 3, worksheetNumberInStage: 1, title: 'What Is the Evidence?', fileName: '03-01-what-is-the-evidence.pdf', description: 'List evidence for and against a thought.', therapeuticGoal: 'Support evidence-based thought checking and balanced evaluation.', whenToUse: 'Use for evidence-for-against thought requests.', clinicalKeywords: ['evidence', 'for and against', 'thought checking'], intentPhrases: ['what is the evidence', 'evidence worksheet', 'form 3.1'] },
  { stageNumber: 3, worksheetNumberInStage: 2, title: 'Is There Another Way to See This?', fileName: '03-02-is-there-another-way-to-see-this.pdf', description: 'Practice generating alternative perspectives.', therapeuticGoal: 'Increase cognitive flexibility and reduce rigid interpretations.', whenToUse: 'Use for reframing and alternative-view requests.', clinicalKeywords: ['reframe', 'alternative perspective', 'another way'], intentPhrases: ['is there another way to see this', 'another way worksheet', 'form 3.2'] },
  { stageNumber: 3, worksheetNumberInStage: 3, title: 'What Would I Say to a Friend?', fileName: '03-03-what-would-i-say-to-a-friend.pdf', description: 'Use compassionate external perspective to support self-talk.', therapeuticGoal: 'Develop kinder, more supportive internal dialogue.', whenToUse: 'Use for self-compassion and friend-perspective prompts.', clinicalKeywords: ['self compassion', 'friend perspective', 'supportive self-talk'], intentPhrases: ['what would i say to a friend', 'friend worksheet', 'form 3.3'] },
  { stageNumber: 3, worksheetNumberInStage: 4, title: 'A More Balanced Thought', fileName: '03-04-a-more-balanced-thought.pdf', description: 'Build a balanced thought that includes both difficulty and reality.', therapeuticGoal: 'Translate thought checking into practical balanced thinking.', whenToUse: 'Use when a user asks to create a balanced thought.', clinicalKeywords: ['balanced thought', 'cognitive restructuring', 'reappraisal'], intentPhrases: ['a more balanced thought', 'balanced thought worksheet', 'form 3.4'] },
  { stageNumber: 3, worksheetNumberInStage: 5, title: 'What Do I Choose to Think Now?', fileName: '03-05-what-do-i-choose-to-think-now.pdf', description: 'Choose a more helpful thought after reviewing evidence.', therapeuticGoal: 'Support intentional thought selection after cognitive review.', whenToUse: 'Use when moving from analysis to chosen replacement thought.', clinicalKeywords: ['chosen thought', 'replacement thought', 'intentional thinking'], intentPhrases: ['what do i choose to think now', 'choose thought now', 'form 3.5'] },

  { stageNumber: 4, worksheetNumberInStage: 1, title: 'Choosing an Action', fileName: '04-01-choosing-an-action.pdf', description: 'Select one or more actions that fit the current situation.', therapeuticGoal: 'Bridge CBT insights into concrete action choices.', whenToUse: 'Use for action-selection and next-step requests.', clinicalKeywords: ['action choice', 'coping action', 'next step'], intentPhrases: ['choosing an action', 'action worksheet', 'form 4.1'] },
  { stageNumber: 4, worksheetNumberInStage: 2, title: 'Creating a Helpful Thought', fileName: '04-02-creating-a-helpful-thought.pdf', description: 'Construct practical helpful thoughts using structure.', therapeuticGoal: 'Improve quality and usefulness of coping self-statements.', whenToUse: 'Use for helpful-thought formulation requests.', clinicalKeywords: ['helpful thought', 'self statement', 'smart thought'], intentPhrases: ['creating a helpful thought', 'helpful thought worksheet', 'form 4.2'] },
  { stageNumber: 4, worksheetNumberInStage: 3, title: 'Small Steps', fileName: '04-03-small-steps.pdf', description: 'Break a challenge into manageable action steps.', therapeuticGoal: 'Increase behavioral momentum through stepwise planning.', whenToUse: 'Use for task breakdown and gradual-start planning.', clinicalKeywords: ['small steps', 'stepwise plan', 'manageable actions'], intentPhrases: ['small steps worksheet', 'form 4.3', 'break into small steps'] },
  { stageNumber: 4, worksheetNumberInStage: 4, title: 'Thinking, Beliefs and Assumptions', fileName: '04-04-thinking-beliefs-and-assumptions.pdf', description: 'Examine assumptions connected to recurring thoughts.', therapeuticGoal: 'Make hidden assumptions explicit and reviewable.', whenToUse: 'Use for assumptions or beliefs-behind-thoughts requests.', clinicalKeywords: ['assumptions', 'beliefs', 'thinking'], intentPhrases: ['thinking beliefs and assumptions', 'assumptions worksheet', 'form 4.4'] },
  { stageNumber: 4, worksheetNumberInStage: 5, title: 'Balance and Evaluation', fileName: '04-05-balance-and-evaluation.pdf', description: 'Evaluate thought strength, evidence balance, and adjustment needs.', therapeuticGoal: 'Support reflective evaluation of current thought patterns.', whenToUse: 'Use for balancing and evaluating current beliefs.', clinicalKeywords: ['evaluation', 'balance', 'review'], intentPhrases: ['balance and evaluation', 'evaluation worksheet', 'form 4.5'] },

  { stageNumber: 5, worksheetNumberInStage: 1, title: 'Avoidance', fileName: '05-01-avoidance.pdf', description: 'Identify what is being avoided and the cost of avoidance.', therapeuticGoal: 'Increase awareness of avoidance cycles and consequences.', whenToUse: 'Use for avoidance-focused requests.', clinicalKeywords: ['avoidance', 'cost of avoidance', 'behavioral avoidance'], intentPhrases: ['avoidance worksheet', 'help with avoidance', 'form 5.1'] },
  { stageNumber: 5, worksheetNumberInStage: 2, title: 'Small Steps', fileName: '05-02-small-steps.pdf', description: 'Plan immediate small behavioral steps forward.', therapeuticGoal: 'Enable action despite fear using tiny doable steps.', whenToUse: 'Use when user asks for small-step behavior change.', clinicalKeywords: ['small steps', 'behavioral activation', 'starter step'], intentPhrases: ['small steps worksheet', 'form 5.2', 'small step right now'] },
  { stageNumber: 5, worksheetNumberInStage: 3, title: 'Gradual Exposure', fileName: '05-03-gradual-exposure.pdf', description: 'Build a graded exposure ladder from easier to harder steps.', therapeuticGoal: 'Support safe progressive approach to feared situations.', whenToUse: 'Use for graded exposure or fear-ladder requests.', clinicalKeywords: ['gradual exposure', 'exposure ladder', 'fear hierarchy'], intentPhrases: ['gradual exposure', 'exposure ladder worksheet', 'form 5.3'] },
  { stageNumber: 5, worksheetNumberInStage: 4, title: 'Effective Action', fileName: '05-04-effective-action.pdf', description: 'Choose actions that create meaningful forward movement.', therapeuticGoal: 'Strengthen effective coping behavior choices.', whenToUse: 'Use for practical action effectiveness requests.', clinicalKeywords: ['effective action', 'practical action', 'forward movement'], intentPhrases: ['effective action worksheet', 'form 5.4', 'effective action'] },
  { stageNumber: 5, worksheetNumberInStage: 5, title: 'Persistence and Tracking', fileName: '05-05-persistence-and-tracking.pdf', description: 'Track practice over time to build persistence.', therapeuticGoal: 'Support follow-through and progress monitoring.', whenToUse: 'Use for tracking progress and staying consistent.', clinicalKeywords: ['persistence', 'tracking', 'follow-through'], intentPhrases: ['persistence and tracking', 'tracking worksheet', 'form 5.5'] },

  { stageNumber: 6, worksheetNumberInStage: 1, title: 'What Have I Learned About Myself?', fileName: '06-01-what-have-i-learned-about-myself.pdf', description: 'Reflect on key learning from recent CBT practice.', therapeuticGoal: 'Consolidate learning and reinforce self-understanding.', whenToUse: 'Use at reflection points or completion of a workbook cycle.', clinicalKeywords: ['reflection', 'learning', 'self insight'], intentPhrases: ['what have i learned about myself', 'reflection worksheet', 'form 6.1'] },
  { stageNumber: 6, worksheetNumberInStage: 2, title: 'My Weekly Check-In', fileName: '06-02-my-weekly-check-in.pdf', description: 'Weekly structured review of attempts, wins, barriers, and lessons.', therapeuticGoal: 'Maintain continuity of CBT practice week to week.', whenToUse: 'Use for weekly check-in and continuity requests.', clinicalKeywords: ['weekly check-in', 'weekly review', 'continuity'], intentPhrases: ['weekly check in', 'my weekly check-in', 'form 6.2'] },
  { stageNumber: 6, worksheetNumberInStage: 3, title: 'Strengthening Myself', fileName: '06-03-strengthening-myself.pdf', description: 'Identify strengths and self-encouragement that support progress.', therapeuticGoal: 'Reinforce positive self-recognition and resilience.', whenToUse: 'Use for confidence-building and strength reflection.', clinicalKeywords: ['strengths', 'encouragement', 'resilience'], intentPhrases: ['strengthening myself', 'strength worksheet', 'form 6.3'] },
  { stageNumber: 6, worksheetNumberInStage: 4, title: 'When It’s Hard for Me - What Helps Me?', fileName: '06-04-when-its-hard-for-me-what-helps-me.pdf', description: 'Plan supports and responses for difficult moments.', therapeuticGoal: 'Create proactive coping plans for high-stress periods.', whenToUse: 'Use for relapse-prevention and hard-moment planning.', clinicalKeywords: ['difficult moments', 'coping plan', 'support plan'], intentPhrases: ['when it’s hard for me what helps me', 'hard moments worksheet', 'form 6.4'] },
  { stageNumber: 6, worksheetNumberInStage: 5, title: 'My Road Card', fileName: '06-05-my-road-card.pdf', description: 'Summarize personal goals and key coping steps in one reference card.', therapeuticGoal: 'Provide a concise go-forward personal CBT roadmap.', whenToUse: 'Use when creating a final summary plan to revisit later.', clinicalKeywords: ['road card', 'summary plan', 'maintenance'], intentPhrases: ['my road card', 'road card worksheet', 'form 6.5'] },
]);

function toKebabCase(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

const FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL_UNFROZEN = INDIVIDUAL_WORKSHEET_DEFINITIONS.map((definition, index) => {
  const stage = definition.stageNumber;
  const worksheet = definition.worksheetNumberInStage;
  const formNumber = `${stage}.${worksheet}`;
  const id = `${ADOLESCENTS_CBT_CORE_EN_PACKAGE_ID}-${stage}-${worksheet}`;
  const slug = `adolescents-cbt-core-en-${stage}-${worksheet}-${toKebabCase(definition.title)}`;
  const fileUrl = `/forms/adolescents/en/core/individual/${definition.fileName}`;

  return Object.freeze({
    id,
    slug,
    parentSeriesId: ADOLESCENTS_CBT_CORE_EN_PACKAGE_ID,
    type: 'individual_worksheet',
    language: 'en',
    audience: 'adolescents',
    category: 'adolescents_cbt_core',
    secondaryCategories: SHARED_SECONDARY_CATEGORIES,
    title: definition.title,
    formNumber,
    stageNumber: stage,
    stageTitle: STAGE_TITLES[stage],
    pageNumberInWorkbook: index + 1,
    fileUrl,
    moduleNumber: stage,
    worksheetNumber: formNumber,
    displayNumber: formNumber,
    description: definition.description,
    therapeuticGoal: definition.therapeuticGoal,
    whenToUse: definition.whenToUse,
    clinicalKeywords: Object.freeze(Array.from(new Set([...definition.clinicalKeywords, 'teen CBT', 'adolescent CBT', `form ${formNumber}`]))),
    intentPhrases: Object.freeze(Array.from(new Set([...definition.intentPhrases, `send form ${formNumber}`, `form ${formNumber}`]))),
    notFor: SHARED_NOT_FOR,
    relatedForms: Object.freeze([ADOLESCENTS_CBT_CORE_EN_PACKAGE_ID]),
    therapeutic_use: 'adolescents_cbt_core_individual_worksheet',
    approved: true,
    languages: Object.freeze({
      en: Object.freeze({
        title: definition.title,
        description: definition.description,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: definition.fileName,
        rtl: false,
      }),
    }),
  });
});

export const FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL = Object.freeze(FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL_UNFROZEN);

export const ADOLESCENTS_CBT_CORE_EN_MANIFEST = Object.freeze({
  forms: Object.freeze([
    ADOLESCENTS_CBT_CORE_EN_PACKAGE,
    ...FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL,
  ]),
});

export const FORMS_ADOLESCENTS_CBT_CORE_EN = Object.freeze([
  ADOLESCENTS_CBT_CORE_EN_PACKAGE,
  ...FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL,
]);

/**
 * Children CBT Core — English
 *
 * 30 individual worksheets across 5 stages (6 worksheets per stage):
 *   Stage 1 — Emotions & Body
 *   Stage 2 — Thoughts
 *   Stage 3 — Behavior & Small Steps
 *   Stage 4 — Regulation & Calm
 *   Stage 5 — Calm Tools & Personal Plan
 *
 * Language: en ONLY.  These must never appear in non-English app language modes.
 * Audience: children (ages 6-12).
 *
 * The stage group entries (FORMS_CHILDREN_CBT_CORE_EN_STAGE_GROUPS) are UI
 * display groupings only — the AI resolver sends individual worksheets directly.
 */

const CHILDREN_CBT_CORE_EN_SERIES_ID = 'children-cbt-core-en';
const CHILDREN_CBT_CORE_EN_BASE_URL = '/forms/en/children/cbt-core';

const SHARED_SECONDARY_CATEGORIES = Object.freeze([
  'therapeutic_workbooks',
  'emotional_regulation',
  'coping_tools',
  'cognitive_restructuring',
  'thought_records',
  'journaling_reflection',
  'weekly_practice',
]);

const SHARED_NOT_FOR = Object.freeze([
  'adolescents or adult requests',
  'Hebrew language mode',
  'non-English language mode',
  'crisis intervention',
  'emergency mental health situations',
  'trauma processing without clinician support',
  'self-harm or suicide content',
]);

const STAGE_TITLES = Object.freeze({
  1: 'Emotions & Body',
  2: 'Thoughts',
  3: 'Behavior & Small Steps',
  4: 'Regulation & Calm',
  5: 'Calm Tools & Personal Plan',
});

// ─── Individual worksheet definitions ─────────────────────────────────────────
// Sourced from the stage manifests in public/children_cbt_core_en/
const INDIVIDUAL_WORKSHEET_DEFINITIONS = Object.freeze([
  // ── Stage 1: Emotions & Body ─────────────────────────────────────────────────
  {
    stageNumber: 1, worksheetNumberInStage: 1,
    title: 'What Am I Feeling?',
    fileName: 'children_cbt_core_en_01_01.pdf',
    description: 'Identify and name current feelings using child-friendly choices.',
    therapeuticGoal: 'Identify and name current feelings using child-friendly choices.',
    whenToUse: 'Use when a child needs help noticing and naming feelings.',
    clinicalKeywords: ['feelings', 'emotion identification', 'happy', 'sad', 'worried', 'angry', 'check-in', 'emotions', 'name feelings'],
    intentPhrases: ['what am i feeling', 'name my feeling', 'identify feelings', 'emotion check-in for child', 'child feelings worksheet'],
    aiMatchingSummary: 'Notice the main feeling, where it shows up, and one thing happening right now.',
  },
  {
    stageNumber: 1, worksheetNumberInStage: 2,
    title: 'What Is My Body Telling Me?',
    fileName: 'children_cbt_core_en_01_02.pdf',
    description: 'Connect body clues to emotions and internal states.',
    therapeuticGoal: 'Connect body clues to emotions and internal states.',
    whenToUse: 'Use when a child needs help noticing body signals linked to emotions.',
    clinicalKeywords: ['body clues', 'heartbeat', 'tummy', 'hands', 'breathing', 'somatic awareness', 'body signals', 'body sensations'],
    intentPhrases: ['what is my body telling me', 'body clues for kids', 'body signals child', 'somatic awareness child'],
    aiMatchingSummary: 'Identify body signals, body locations, and one strong clue the child notices.',
  },
  {
    stageNumber: 1, worksheetNumberInStage: 3,
    title: 'My Feeling Meter',
    fileName: 'children_cbt_core_en_01_03.pdf',
    description: 'Rate feeling intensity and choose matching supports.',
    therapeuticGoal: 'Rate feeling intensity and choose matching supports.',
    whenToUse: 'Use when a child needs to show how big a feeling is right now.',
    clinicalKeywords: ['feeling meter', 'intensity', 'rating scale', 'support choices', 'emotional regulation', 'how big is the feeling'],
    intentPhrases: ['my feeling meter', 'feeling intensity scale for kids', 'how big is my feeling', 'emotion rating child'],
    aiMatchingSummary: 'Use a 1–5 ladder to rate the size of the feeling and choose what may help.',
  },
  {
    stageNumber: 1, worksheetNumberInStage: 4,
    title: 'Early Signs Detective',
    fileName: 'children_cbt_core_en_01_04.pdf',
    description: 'Notice early warning signs before feelings grow bigger.',
    therapeuticGoal: 'Notice early warning signs before feelings grow bigger.',
    whenToUse: 'Use when a child is learning to recognize early clues in body or behavior.',
    clinicalKeywords: ['early signs', 'warning signs', 'body clues', 'behavior clues', 'detective', 'early warning', 'clues'],
    intentPhrases: ['early signs detective', 'warning signs for child', 'early clues feelings', 'early warning signs child'],
    aiMatchingSummary: 'Circle early clues, what may be happening, and note the first clue noticed today.',
  },
  {
    stageNumber: 1, worksheetNumberInStage: 5,
    title: 'Feelings Can Change',
    fileName: 'children_cbt_core_en_01_05.pdf',
    description: 'Teach that feelings can shift with time and support.',
    therapeuticGoal: 'Teach that feelings can shift with time and support.',
    whenToUse: 'Use after a hard feeling begins to settle or when teaching hope and flexibility.',
    clinicalKeywords: ['feelings change', 'coping', 'time', 'support', 'hope', 'flexible feelings', 'emotion flexibility'],
    intentPhrases: ['feelings can change', 'feelings pass', 'emotions are temporary for kids'],
    aiMatchingSummary: 'See how feelings change from first to now to after some help, and what helped a little.',
  },
  {
    stageNumber: 1, worksheetNumberInStage: 6,
    title: 'My Feeling Card',
    fileName: 'children_cbt_core_en_01_06.pdf',
    description: 'Create a simple personal card linking feelings, body clues, supports, and kind words.',
    therapeuticGoal: 'Create a simple personal card linking feelings, body clues, supports, and kind words.',
    whenToUse: 'Use as a quick take-away tool for daily emotional check-ins.',
    clinicalKeywords: ['feeling card', 'coping card', 'helpful words', 'body clues', 'supports', 'personal card'],
    intentPhrases: ['my feeling card', 'feelings coping card for child', 'personal emotion card kid'],
    aiMatchingSummary: 'Choose the feeling, body clues, helpful tools, and a kind phrase to remember.',
  },

  // ── Stage 2: Thoughts ────────────────────────────────────────────────────────
  {
    stageNumber: 2, worksheetNumberInStage: 1,
    title: 'What Is My Thought Saying?',
    fileName: 'children_cbt_core_en_02_01.pdf',
    description: 'Notice a thought as words in the mind and choose a kinder thought.',
    therapeuticGoal: 'Help the child notice a thought as words in the mind and choose a kinder thought.',
    whenToUse: 'Use when a child needs help naming a thought and noticing whether it feels helpful.',
    clinicalKeywords: ['thoughts', 'self-talk', 'kind thought', 'helpful thought', 'cbt thoughts', 'thought awareness', 'noticing thoughts'],
    intentPhrases: ['what is my thought saying', 'notice thoughts child', 'thought awareness for kids', 'my thought saying'],
    aiMatchingSummary: 'The child chooses a possible thought, notices how it feels, checks whether it is helpful, and selects a kinder thought.',
  },
  {
    stageNumber: 2, worksheetNumberInStage: 2,
    title: 'Thought or Fact?',
    fileName: 'children_cbt_core_en_02_02.pdf',
    description: 'Separate what happened from what the mind is guessing.',
    therapeuticGoal: 'Teach the child to separate what happened from what the mind is guessing.',
    whenToUse: 'Use when a child mixes facts with guesses or worries about what others think.',
    clinicalKeywords: ['thought or fact', 'mind guessing', 'facts', 'balanced thinking', 'cbt', 'thoughts vs facts', 'cognitive defusion'],
    intentPhrases: ['thought or fact for child', 'child thought vs fact', 'is it a thought or fact'],
    aiMatchingSummary: 'The worksheet helps distinguish real events from guesses, then choose a more balanced idea.',
  },
  {
    stageNumber: 2, worksheetNumberInStage: 3,
    title: 'Worry Thoughts',
    fileName: 'children_cbt_core_en_02_03.pdf',
    description: 'Notice worry thoughts kindly and choose simple coping supports.',
    therapeuticGoal: 'Help the child notice worry thoughts kindly and choose simple coping supports.',
    whenToUse: 'Use when a child has worry thoughts about mistakes, peers, or trying something hard.',
    clinicalKeywords: ['worry thoughts', 'anxiety thoughts', 'worry', 'coping', 'small step', 'anxious thoughts', 'child worry'],
    intentPhrases: ['worry thoughts for child', 'child worries', 'anxious thoughts for kids', 'worry thought worksheet'],
    aiMatchingSummary: 'The child identifies what worry says, how worry feels, and what helps when worry appears.',
  },
  {
    stageNumber: 2, worksheetNumberInStage: 4,
    title: 'Helpful Thought Switch',
    fileName: 'children_cbt_core_en_02_04.pdf',
    description: 'Practice changing an unhelpful thought into a kinder and more useful thought.',
    therapeuticGoal: 'Practice changing an unhelpful thought into a kinder and more useful thought.',
    whenToUse: 'Use when a child is stuck in an unhelpful thought such as "I cannot do this" or "I will mess up".',
    clinicalKeywords: ['thought switch', 'unhelpful thoughts', 'kind thoughts', 'cognitive reframing', 'cbt', 'replace thought', 'thought switch for child'],
    intentPhrases: ['helpful thought switch', 'change unhelpful thought child', 'thought reframe for kids', 'thought switch worksheet'],
    aiMatchingSummary: 'The child matches unhelpful thoughts with kinder replacements and fills in a personal thought switch.',
  },
  {
    stageNumber: 2, worksheetNumberInStage: 5,
    title: 'My Thought Detective',
    fileName: 'children_cbt_core_en_02_05.pdf',
    description: 'Look for clues before believing every thought.',
    therapeuticGoal: 'Encourage the child to look for clues before believing every thought.',
    whenToUse: 'Use when a child needs to check assumptions and identify what they know for sure.',
    clinicalKeywords: ['thought detective', 'clues', 'facts', 'guesses', 'balanced idea', 'detective thinking', 'question thoughts'],
    intentPhrases: ['my thought detective', 'thought detective for child', 'questioning thoughts for kids', 'clues in thoughts'],
    aiMatchingSummary: 'The child names a thought, identifies facts and guesses, and chooses what else could be true.',
  },
  {
    stageNumber: 2, worksheetNumberInStage: 6,
    title: 'A Thought That Helps Me',
    fileName: 'children_cbt_core_en_02_06.pdf',
    description: 'Build a helpful thought the child can use to move forward.',
    therapeuticGoal: 'Build a helpful thought the child can use to move forward.',
    whenToUse: 'Use when a child needs a simple replacement thought before taking a next step.',
    clinicalKeywords: ['helpful thought', 'kind thought', 'next step', 'coping thought', 'cbt', 'replacement thought child'],
    intentPhrases: ['a thought that helps me', 'helpful thought for child', 'coping thought for kids', 'helpful thought worksheet child'],
    aiMatchingSummary: 'The child notices a feeling, chooses a thought that helps, selects what supports the next action, and writes a personal helpful thought.',
  },

  // ── Stage 3: Behavior & Small Steps ─────────────────────────────────────────
  {
    stageNumber: 3, worksheetNumberInStage: 1,
    title: 'What Do I Do When It Feels Hard?',
    fileName: 'children_cbt_core_en_03_01.pdf',
    description: 'Notice first reactions when something feels hard and choose a helpful next step.',
    therapeuticGoal: 'Help the child notice first reactions when something feels hard and choose a helpful next step.',
    whenToUse: 'Use when a child gets stuck, avoids, gets upset, or needs help choosing a small response.',
    clinicalKeywords: ['hard things', 'avoidance', 'helpful choice', 'small choice', 'next step', 'ask for help', 'when things feel hard'],
    intentPhrases: ['what do i do when it feels hard', 'hard things for child', 'child avoidance worksheet', 'when it feels hard for kids'],
    aiMatchingSummary: 'Notices what the child does first when something feels hard, what helps most, and one next small choice.',
  },
  {
    stageNumber: 3, worksheetNumberInStage: 2,
    title: 'My Tiny Brave Step',
    fileName: 'children_cbt_core_en_03_02.pdf',
    description: 'Choose one very small brave step for today.',
    therapeuticGoal: 'Help the child choose one very small brave step for today.',
    whenToUse: 'Use when a child is avoiding or feeling unsure about starting a task or situation.',
    clinicalKeywords: ['tiny brave step', 'small step', 'bravery', 'avoidance', 'starting', 'practice', 'brave step child', 'first brave step'],
    intentPhrases: ['my tiny brave step', 'brave step for child', 'small brave step kid', 'tiny brave step worksheet'],
    aiMatchingSummary: 'Helps choose what feels hard, one tiny brave step, how big it feels, and a step to try today.',
  },
  {
    stageNumber: 3, worksheetNumberInStage: 3,
    title: 'My Brave Ladder',
    fileName: 'children_cbt_core_en_03_03.pdf',
    description: 'Build a simple graded ladder for brave practice.',
    therapeuticGoal: 'Build a simple graded ladder for brave practice.',
    whenToUse: 'Use when a child needs a step-by-step path instead of doing everything at once.',
    clinicalKeywords: ['brave ladder', 'graded steps', 'exposure', 'practice', 'step by step', 'support', 'graded exposure child', 'fear ladder child'],
    intentPhrases: ['my brave ladder', 'brave ladder for child', 'graded exposure child', 'fear ladder for kids', 'step by step brave'],
    aiMatchingSummary: 'Uses a 1-5 brave ladder, identifies what is being practiced, who can help, and one ladder goal.',
  },
  {
    stageNumber: 3, worksheetNumberInStage: 4,
    title: 'Before I Try',
    fileName: 'children_cbt_core_en_03_04.pdf',
    description: 'Prepare the child before taking a small step by identifying supports and readiness tools.',
    therapeuticGoal: 'Prepare the child before taking a small step by identifying supports and readiness tools.',
    whenToUse: 'Use before a child attempts a new, hard, or avoided action.',
    clinicalKeywords: ['before i try', 'readiness', 'support', 'planning', 'small step', 'prepare', 'preparation before action child'],
    intentPhrases: ['before i try', 'prepare for brave step child', 'readiness for action kids', 'before trying something hard'],
    aiMatchingSummary: 'Identifies what feels hard, what helps the child get ready, who can help, and the first step.',
  },
  {
    stageNumber: 3, worksheetNumberInStage: 5,
    title: 'After I Tried',
    fileName: 'children_cbt_core_en_03_05.pdf',
    description: 'Reflect gently after trying and reinforce learning from effort.',
    therapeuticGoal: 'Reflect gently after trying and reinforce learning from effort.',
    whenToUse: 'Use after the child attempts a small brave step or helpful action.',
    clinicalKeywords: ['after i tried', 'reflection', 'effort', 'learning', 'small step', 'practice', 'reflect after trying child'],
    intentPhrases: ['after i tried', 'reflect after brave step child', 'what i learned from trying', 'after trying worksheet for kids'],
    aiMatchingSummary: 'Reviews what the child tried, how it went, what helped, and one thing learned.',
  },
  {
    stageNumber: 3, worksheetNumberInStage: 6,
    title: 'My Small Step Plan',
    fileName: 'children_cbt_core_en_03_06.pdf',
    description: 'Create a short plan for the next brave step.',
    therapeuticGoal: 'Create a short plan for the next brave step.',
    whenToUse: 'Use when a child needs a simple action plan with goal, step, support, and timing.',
    clinicalKeywords: ['small step plan', 'goal', 'action plan', 'who helps', 'when i try', 'brave step', 'child action plan'],
    intentPhrases: ['my small step plan', 'small step plan for child', 'action plan for kids', 'simple plan brave step'],
    aiMatchingSummary: 'Creates a plan with goal, small step, helper, timing, and one brave step pathway.',
  },

  // ── Stage 4: Regulation & Calm ───────────────────────────────────────────────
  {
    stageNumber: 4, worksheetNumberInStage: 1,
    title: 'Pause Button',
    fileName: 'children_cbt_core_en_04_01.pdf',
    description: 'Help children pause when they feel upset or overwhelmed.',
    therapeuticGoal: 'Help children pause when they feel upset or overwhelmed.',
    whenToUse: 'Use when a child needs a simple stop-breathe-choose regulation prompt.',
    clinicalKeywords: ['pause', 'stop', 'breathe', 'upset', 'overwhelmed', 'regulation', 'pause button child', 'self-regulation'],
    intentPhrases: ['pause button for child', 'stop and breathe for kids', 'regulation pause child', 'child upset pause'],
    aiMatchingSummary: 'Use this when the child needs to stop, take a breath, and choose a calmer next step.',
  },
  {
    stageNumber: 4, worksheetNumberInStage: 2,
    title: 'What Can Help Me Calm Down?',
    fileName: 'children_cbt_core_en_04_02.pdf',
    description: 'Help children identify calming tools that work for them.',
    therapeuticGoal: 'Help children identify calming tools that work for them.',
    whenToUse: 'Use when a child is building a personal list of calming strategies.',
    clinicalKeywords: ['calm down', 'coping tools', 'self regulation', 'music', 'water', 'drawing', 'calming strategies child', 'calm tools'],
    intentPhrases: ['what can help me calm down', 'calming tools for child', 'calm down for kids', 'what helps me calm worksheet'],
    aiMatchingSummary: 'Use this when the child is choosing calming activities and discovering what helps.',
  },
  {
    stageNumber: 4, worksheetNumberInStage: 3,
    title: 'My Breathing Helper',
    fileName: 'children_cbt_core_en_04_03.pdf',
    description: 'Teach a simple balloon-breathing sequence.',
    therapeuticGoal: 'Teach a simple balloon-breathing sequence.',
    whenToUse: 'Use when a child needs a concrete breathing exercise.',
    clinicalKeywords: ['breathing', 'balloon breathing', 'calm', 'body regulation', 'coping', 'breathing exercise child', 'deep breathing kids'],
    intentPhrases: ['my breathing helper', 'breathing exercise for child', 'balloon breathing kids', 'breathing for calm child'],
    aiMatchingSummary: 'Use this when the child needs guided breathing to feel calmer.',
  },
  {
    stageNumber: 4, worksheetNumberInStage: 4,
    title: 'Back to My Body',
    fileName: 'children_cbt_core_en_04_04.pdf',
    description: 'Ground children by noticing sensory details around them.',
    therapeuticGoal: 'Ground children by noticing sensory details around them.',
    whenToUse: 'Use when a child feels upset and needs grounding through the senses.',
    clinicalKeywords: ['grounding', '5 senses', 'body awareness', 'calm', 'notice', 'sensory grounding child', 'grounding exercise kids'],
    intentPhrases: ['back to my body', 'grounding for child', '5 senses grounding kids', 'sensory grounding child'],
    aiMatchingSummary: 'Use this when the child needs to ground using seeing, touching, hearing, smelling, and tasting.',
  },
  {
    stageNumber: 4, worksheetNumberInStage: 5,
    title: 'My Safe Calm Place',
    fileName: 'children_cbt_core_en_04_05.pdf',
    description: 'Help children imagine a safe and calming place.',
    therapeuticGoal: 'Help children imagine a safe and calming place.',
    whenToUse: 'Use when a child benefits from a visual safe-place exercise.',
    clinicalKeywords: ['safe place', 'imagery', 'calm place', 'soothing', 'regulation', 'safe calm place child', 'safe place imagery kids'],
    intentPhrases: ['my safe calm place', 'safe place for child', 'calm place imagery for kids', 'safe imagery worksheet child'],
    aiMatchingSummary: 'Use this when the child needs to imagine or draw a safe calm place.',
  },
  {
    stageNumber: 4, worksheetNumberInStage: 6,
    title: 'My Calm Tools Card',
    fileName: 'children_cbt_core_en_04_06.pdf',
    description: 'Create a personal calm-tools card with favorite coping tools.',
    therapeuticGoal: 'Create a personal calm-tools card with favorite coping tools.',
    whenToUse: 'Use as a take-away card once the child has identified their top calming tools.',
    clinicalKeywords: ['calm tools card', 'coping card', 'top tools', 'self help', 'personal tools card child'],
    intentPhrases: ['my calm tools card', 'calm tools card for child', 'coping card for kids', 'personal calm card child'],
    aiMatchingSummary: 'Use this when the child is choosing top calm tools for later use.',
  },

  // ── Stage 5: Calm Tools & Personal Plan ─────────────────────────────────────
  {
    stageNumber: 5, worksheetNumberInStage: 1,
    title: 'My Calm Tools',
    fileName: 'children_cbt_core_en_05_01.pdf',
    description: 'Help children identify and choose calming tools they can use when upset or worried.',
    therapeuticGoal: 'Help children identify and choose calming tools they can use when upset or worried.',
    whenToUse: 'Use when a child is building awareness of simple calming strategies.',
    clinicalKeywords: ['calm tools', 'coping tools', 'deep breaths', 'count slowly', 'stretch', 'drink water', 'take a break', 'talk to someone', 'calming strategies child'],
    intentPhrases: ['my calm tools', 'calm tools for child', 'coping tools for kids', 'calming strategies worksheet child'],
    aiMatchingSummary: 'Use this when the child is identifying calming tools and choosing a favorite one.',
  },
  {
    stageNumber: 5, worksheetNumberInStage: 2,
    title: 'When I Feel Overwhelmed',
    fileName: 'children_cbt_core_en_05_02.pdf',
    description: 'Help children notice what they feel when overwhelmed and choose a short calm plan.',
    therapeuticGoal: 'Help children notice what they feel when overwhelmed and choose a short calm plan.',
    whenToUse: 'Use when a child needs a simple structured plan for overwhelming feelings.',
    clinicalKeywords: ['overwhelmed', 'worried', 'angry', 'tired', 'sad', 'calm break', 'tools', 'overwhelmed child plan'],
    intentPhrases: ['when i feel overwhelmed', 'child overwhelmed worksheet', 'overwhelmed feelings plan for kids'],
    aiMatchingSummary: 'Use this when the child needs to identify overwhelmed feelings and choose a few tools to help.',
  },
  {
    stageNumber: 5, worksheetNumberInStage: 3,
    title: 'My Feeling Thermometer',
    fileName: 'children_cbt_core_en_05_03.pdf',
    description: 'Help children rate feeling intensity and pick a small support for the moment.',
    therapeuticGoal: 'Help children rate feeling intensity and pick a small support for the moment.',
    whenToUse: 'Use when a child needs to show how strong a feeling is and what can help a little right now.',
    clinicalKeywords: ['feeling thermometer', 'intensity', 'very mild', 'medium', 'strong', 'coping', 'thermometer feelings child', 'emotion intensity scale child'],
    intentPhrases: ['my feeling thermometer', 'feeling thermometer for child', 'emotion intensity scale for kids', 'thermometer worksheet child'],
    aiMatchingSummary: 'Use this when the child is rating feeling intensity and choosing a small helpful action.',
  },
  {
    stageNumber: 5, worksheetNumberInStage: 4,
    title: 'Calm Plan: Before I Get Too Upset',
    fileName: 'children_cbt_core_en_05_04.pdf',
    description: 'Help children notice early signs of upset and choose a first step in a calm plan.',
    therapeuticGoal: 'Help children notice early signs of upset and choose a first step in a calm plan.',
    whenToUse: 'Use when a child is preparing ahead for moments of dysregulation.',
    clinicalKeywords: ['calm plan', 'early signs', 'heart beats fast', 'tight muscles', 'restless', 'worried', 'proactive calm plan child', 'prevent upset child'],
    intentPhrases: ['calm plan before i get too upset', 'calm plan for child', 'proactive calm plan child', 'prepare for upset child'],
    aiMatchingSummary: 'Use this when the child is making a simple plan before feelings get too big.',
  },
  {
    stageNumber: 5, worksheetNumberInStage: 5,
    title: 'My Calm Corner',
    fileName: 'children_cbt_core_en_05_05.pdf',
    description: 'Help children design a safe calm space with preferred comforting items.',
    therapeuticGoal: 'Help children design a safe calm space with preferred comforting items.',
    whenToUse: 'Use when a child is creating a personalized calm corner or calm kit.',
    clinicalKeywords: ['calm corner', 'safe space', 'pillow', 'stuffed animal', 'book', 'headphones', 'blanket', 'calm kit child', 'personal calm space'],
    intentPhrases: ['my calm corner', 'calm corner for child', 'calm kit for kids', 'personal calm space child'],
    aiMatchingSummary: 'Use this when the child is choosing items for a calm corner and deciding when to use it.',
  },
  {
    stageNumber: 5, worksheetNumberInStage: 6,
    title: 'My Calm Plan',
    fileName: 'children_cbt_core_en_05_06.pdf',
    description: 'Help children make a simple personal plan for when they feel overwhelmed.',
    therapeuticGoal: 'Help children make a simple personal plan for when they feel overwhelmed.',
    whenToUse: 'Use when a child is summarizing what they notice, what tool to use first, and what to remind themselves.',
    clinicalKeywords: ['my calm plan', 'overwhelmed', 'first calm tool', 'remind myself', 'personal plan', 'personal calm plan child', 'calm plan summary'],
    intentPhrases: ['my calm plan', 'personal calm plan for child', 'calm plan summary for kids', 'my personal calm plan child'],
    aiMatchingSummary: 'Use this when the child is making a short personal calm plan for hard moments.',
  },
]);

// ─── Module PDFs ──────────────────────────────────────────────────────────────
// Stage 2 has no module PDF available.
const MODULE_PDF_DEFINITIONS = Object.freeze([
  {
    moduleNumber: 1,
    title: 'CBT Core for Children — Stage 1: Emotions & Body',
    fileName: 'children_cbt_core_en_module_01_emotions_and_body.pdf',
  },
  {
    moduleNumber: 3,
    title: 'CBT Core for Children — Stage 3: Behavior & Small Steps',
    fileName: 'children_cbt_core_en_module_03_behavior_and_small_steps.pdf',
  },
  {
    moduleNumber: 4,
    title: 'CBT Core for Children — Stage 4: Regulation & Calm',
    fileName: 'children_cbt_core_en_module_04_regulation_and_calm.pdf',
  },
  {
    moduleNumber: 5,
    title: 'CBT Core for Children — Stage 5: Calm Tools & Personal Plan',
    fileName: 'children_cbt_core_en_module_05_calm_tools_and_personal_plan.fixed.pdf',
  },
]);

function toKebabCase(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function toStageFolderName(stageNumber) {
  return `stage-${String(stageNumber).padStart(2, '0')}`;
}

function toStageFileUrl(stageNumber, fileName) {
  return `${CHILDREN_CBT_CORE_EN_BASE_URL}/${toStageFolderName(stageNumber)}/${fileName}`;
}

// ─── Individual worksheets ────────────────────────────────────────────────────
const FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL_UNFROZEN = INDIVIDUAL_WORKSHEET_DEFINITIONS.map((def) => {
  const stage = def.stageNumber;
  const worksheet = def.worksheetNumberInStage;
  const formNumber = `${stage}.${worksheet}`;
  const id = `children-cbt-core-en-${stage}-${worksheet}`;
  const slug = `children-cbt-core-en-${stage}-${worksheet}-${toKebabCase(def.title)}`;
  const fileUrl = toStageFileUrl(stage, def.fileName);

  return Object.freeze({
    id,
    slug,
    parentSeriesId: CHILDREN_CBT_CORE_EN_SERIES_ID,
    type: 'individual_worksheet',
    language: 'en',
    audience: 'children',
    category: 'children_cbt_core',
    secondaryCategories: SHARED_SECONDARY_CATEGORIES,
    title: def.title,
    formNumber,
    stageNumber: stage,
    stageTitle: STAGE_TITLES[stage],
    moduleNumber: stage,
    worksheetNumber: formNumber,
    displayNumber: formNumber,
    fileUrl,
    description: def.description,
    therapeuticGoal: def.therapeuticGoal,
    whenToUse: def.whenToUse,
    aiMatchingSummary: def.aiMatchingSummary,
    clinicalKeywords: Object.freeze(Array.from(new Set([...def.clinicalKeywords, 'children cbt', 'child worksheet', `form ${formNumber}`]))),
    intentPhrases: Object.freeze(Array.from(new Set([...def.intentPhrases, `form ${formNumber}`, `send form ${formNumber}`]))),
    notFor: SHARED_NOT_FOR,
    relatedForms: Object.freeze([CHILDREN_CBT_CORE_EN_SERIES_ID]),
    therapeutic_use: 'children_cbt_core_individual_worksheet',
    clinicalIntensity: 'low',
    safetyNotes: 'Child-safe CBT worksheet. No graphic, frightening, self-harm, or trauma content.',
    approved: true,
    languages: Object.freeze({
      en: Object.freeze({
        title: def.title,
        description: def.description,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: def.fileName,
        rtl: false,
      }),
    }),
  });
});

export const FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL = Object.freeze(FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL_UNFROZEN);

// ─── Module PDFs ──────────────────────────────────────────────────────────────
const FORMS_CHILDREN_CBT_CORE_EN_MODULE_PDFS_UNFROZEN = MODULE_PDF_DEFINITIONS.map((def) => {
  const id = `children-cbt-core-en-module-${String(def.moduleNumber).padStart(2, '0')}`;
  const fileUrl = toStageFileUrl(def.moduleNumber, def.fileName);

  return Object.freeze({
    id,
    slug: `children-cbt-core-en-module-${String(def.moduleNumber).padStart(2, '0')}-${toKebabCase(STAGE_TITLES[def.moduleNumber])}`,
    parentSeriesId: CHILDREN_CBT_CORE_EN_SERIES_ID,
    type: 'module_pdf',
    language: 'en',
    audience: 'children',
    category: 'children_cbt_core',
    secondaryCategories: SHARED_SECONDARY_CATEGORIES,
    title: def.title,
    moduleNumber: def.moduleNumber,
    moduleTitle: STAGE_TITLES[def.moduleNumber],
    fileUrl,
    description: `Module PDF for Stage ${def.moduleNumber} — ${STAGE_TITLES[def.moduleNumber]}.`,
    therapeuticGoal: `Module-level children CBT core reference for Stage ${def.moduleNumber}.`,
    whenToUse: `Use when a module-level PDF for Stage ${def.moduleNumber} is specifically requested.`,
    clinicalKeywords: Object.freeze(['children cbt', `stage ${def.moduleNumber}`, STAGE_TITLES[def.moduleNumber].toLowerCase(), 'module pdf', 'child worksheet']),
    intentPhrases: Object.freeze([`stage ${def.moduleNumber} module pdf`, `children cbt core module ${def.moduleNumber}`]),
    notFor: SHARED_NOT_FOR,
    relatedForms: Object.freeze([CHILDREN_CBT_CORE_EN_SERIES_ID]),
    therapeutic_use: 'children_cbt_core_module_pdf',
    approved: true,
    languages: Object.freeze({
      en: Object.freeze({
        title: def.title,
        description: `Module PDF for Stage ${def.moduleNumber} — ${STAGE_TITLES[def.moduleNumber]}.`,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: def.fileName,
        rtl: false,
      }),
    }),
  });
});

export const FORMS_CHILDREN_CBT_CORE_EN_MODULE_PDFS = Object.freeze(FORMS_CHILDREN_CBT_CORE_EN_MODULE_PDFS_UNFROZEN);

// ─── Stage group definitions (UI only) ───────────────────────────────────────
// These are used by the Therapeutic Forms library UI to group individual worksheets.
// The AI resolver still sends individual worksheets directly.
const STAGE_GROUP_DATA = Object.freeze([
  {
    id: 'children-cbt-core-en-stage-1',
    stageNumber: 1,
    title: 'Stage 1 — Emotions & Body',
    description: 'Feeling identification, body clues, feeling intensity meter, early warning signs. Forms 1.1–1.6.',
    secondaryCategories: Object.freeze(['emotional_regulation', 'coping_tools', 'journaling_reflection']),
  },
  {
    id: 'children-cbt-core-en-stage-2',
    stageNumber: 2,
    title: 'Stage 2 — Thoughts',
    description: 'Noticing thoughts, thought or fact, worry thoughts, helpful thought switch, thought detective. Forms 2.1–2.6.',
    secondaryCategories: Object.freeze(['thought_records', 'cognitive_restructuring', 'coping_tools']),
  },
  {
    id: 'children-cbt-core-en-stage-3',
    stageNumber: 3,
    title: 'Stage 3 — Behavior & Small Steps',
    description: 'Hard situations, tiny brave steps, brave ladder, before and after trying, small step plan. Forms 3.1–3.6.',
    secondaryCategories: Object.freeze(['coping_tools', 'emotional_regulation', 'weekly_practice']),
  },
  {
    id: 'children-cbt-core-en-stage-4',
    stageNumber: 4,
    title: 'Stage 4 — Regulation & Calm',
    description: 'Pause button, calming tools, breathing, grounding, safe calm place. Forms 4.1–4.6.',
    secondaryCategories: Object.freeze(['emotional_regulation', 'coping_tools']),
  },
  {
    id: 'children-cbt-core-en-stage-5',
    stageNumber: 5,
    title: 'Stage 5 — Calm Tools & Personal Plan',
    description: 'Calm tools, overwhelmed plan, feeling thermometer, calm plan. Forms 5.1–5.6.',
    secondaryCategories: Object.freeze(['coping_tools', 'emotional_regulation', 'journaling_reflection']),
  },
]);

export const FORMS_CHILDREN_CBT_CORE_EN_STAGE_GROUPS = Object.freeze(
  STAGE_GROUP_DATA.map((sg) =>
    Object.freeze({
      ...sg,
      type: 'stage_group',
      language: 'en',
      audience: 'children',
      category: 'children_cbt_core',
      approved: true,
      languages: Object.freeze({
        en: Object.freeze({
          title: sg.title,
          description: sg.description,
          file_url: null,
          file_type: null,
          file_name: null,
          rtl: false,
        }),
      }),
    })
  )
);

// ─── Aggregated registry ──────────────────────────────────────────────────────
export const FORMS_CHILDREN_CBT_CORE_EN = Object.freeze([
  ...FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL,
  ...FORMS_CHILDREN_CBT_CORE_EN_MODULE_PDFS,
]);

const SERIES_ID = 'children-cbt-specialized-en';
const SERIES_TITLE = 'Children CBT Specialized';
const CATEGORY = 'children_cbt_specialized';
const MAIN_CATEGORY = 'cbt-specialized';
const DISPLAY_CATEGORY = 'Children CBT Specialized';

const SHARED_SECONDARY_CATEGORIES = Object.freeze([
  'therapeutic_workbooks',
  'coping_tools',
  'emotional_regulation',
  'weekly_practice',
]);

const SHARED_NOT_FOR = Object.freeze([
  'non-English locale sessions',
  'adolescents or adult requests',
  'medical diagnosis or medical treatment substitution',
  'crisis intervention',
  'emergency mental health situations',
]);

// Targeted safety-note overrides for subcategories that require stricter framing.
// 4.2 must remain stabilization-only (no trauma processing details/exposure framing),
// and 5.3 must remain shame-free emotional support (not medical treatment framing).
const SPECIAL_SAFETY_NOTES = Object.freeze({
  '4.2': 'Trauma-sensitive coping only: focus on safety, grounding, body regulation, and support. Do not elicit trauma details and do not suggest exposure processing.',
  '5.3': 'Emotional/stress support only for enuresis/encopresis context: no shame, no blame, never imply intentional behavior, and avoid presenting as medical treatment.',
});

const SUBCATEGORY_DEFINITIONS = Object.freeze([
  {
    clinicalGroupNumber: 1,
    clinicalGroupTitleEn: 'Anxiety & Fears',
    subcategoryNumber: '1.1',
    subcategoryTitleEn: 'Separation Anxiety',
    filePath: '/forms/children/en/cbt-specialized/module-01/children_cbt_specialized_en_01_01_separation_anxiety_full.pdf',
    therapeuticGoal: 'Support safer separations, reduce separation worries, and build practical brave separation steps.',
    whenToUse: 'Use when a child has distress around separation from caregivers at school, bedtime, or daily transitions.',
    aiMatchingSummary: 'Match for separation distress, safe goodbye planning, school drop-off fear, and sleeping-alone concerns.',
    keywordsEn: ['separation anxiety', 'safe goodbye', 'school separation', 'sleeping alone', 'comfort object', 'brave ladder'],
    scenarioPhrases: ['child refuses to separate from mom at school', 'safe goodbye', 'school drop-off anxiety'],
    worksheetTopics: [
      ['Safe Goodbye Plan', 'Plan predictable and comforting goodbyes for separation moments.'],
      ['School Separation Steps', 'Use gradual steps for school drop-off transitions.'],
      ['Sleeping Alone Support', 'Build a calmer bedtime-separation routine.'],
      ['Comfort Object Anchor', 'Use a comfort object as a grounding support during separations.'],
      ['Goodbye Step Ladder', 'Create a brave ladder for separation challenges.'],
      ['Separation Worry Thoughts', 'Notice and rebalance separation-worry thoughts.'],
      ['Body Feelings During Separation', 'Identify body signals during separation stress and pair with calming tools.'],
      ['Who Can Help Me?', 'Map helpers and support people during separation moments.'],
      ['Brave Separation Practice', 'Track small brave separation practices.'],
      ['Safe Goodbye Card', 'Create a take-away reminder card for safe goodbyes.'],
    ],
  },
  {
    clinicalGroupNumber: 1,
    clinicalGroupTitleEn: 'Anxiety & Fears',
    subcategoryNumber: '1.2',
    subcategoryTitleEn: 'Specific Phobias',
    filePath: '/forms/children/en/cbt-specialized/module-01/children_cbt_specialized_en_01_02_specific_phobias_full.pdf',
    therapeuticGoal: 'Reduce fear avoidance in specific phobias through graded brave steps, thought support, and coping plans.',
    whenToUse: 'Use for specific fear targets such as dogs, elevators, shots, loud noises, and similar phobia patterns.',
    aiMatchingSummary: 'Match for specific phobia fears and practical fear-ladder coping support.',
    keywordsEn: ['specific phobias', 'fear of dogs', 'elevator fear', 'shots', 'loud noises', 'fear map', 'tiny brave practice'],
    scenarioPhrases: ['child is afraid of dogs', 'specific phobia', 'fear of injections'],
    worksheetTopics: [
      ['Fear of Dogs', 'Start graded support for dog-related fear.'],
      ['Elevator Fear Steps', 'Build small approach steps for elevator fear.'],
      ['Shots and Injections', 'Use coping before and during injection stress.'],
      ['Loud Noise Coping', 'Prepare calm tools for loud-noise fear.'],
      ['Fear Map', 'Map fear triggers, thoughts, body signs, and supports.'],
      ['Gentle Brave Ladder', 'Build a gentle ladder from easier to harder fear steps.'],
      ['Thought vs Reality Check', 'Compare fear thoughts with present evidence.'],
      ['Getting Closer Plan', 'Plan safe, gradual approach steps toward the fear target.'],
      ['Tiny Brave Practice', 'Track tiny brave reps and recovery after each try.'],
      ['Specific Fear Coping Card', 'Create a short coping reminder card for fear moments.'],
    ],
  },
  {
    clinicalGroupNumber: 1,
    clinicalGroupTitleEn: 'Anxiety & Fears',
    subcategoryNumber: '1.3',
    subcategoryTitleEn: 'Social Anxiety',
    filePath: '/forms/children/en/cbt-specialized/module-01/children_cbt_specialized_en_01_03_specific_phobias_full.pdf',
    therapeuticGoal: 'Support social courage, reduce social fear thoughts, and build practical social participation skills.',
    whenToUse: 'Use for fear of speaking, joining peers, asking for help, or embarrassment in social/school settings.',
    aiMatchingSummary: 'Match for social anxiety, class-speaking fear, and social confidence building.',
    keywordsEn: ['social anxiety', 'speaking in class', 'fear others will laugh', 'joining a game', 'asking for help', 'social courage'],
    scenarioPhrases: ['child is scared to speak in class', 'social anxiety', 'fear others will laugh'],
    worksheetTopics: [
      ['Speaking in Class Bravely', 'Practice brave speaking steps in class.'],
      ['What If They Laugh?', 'Rebalance fears about being laughed at.'],
      ['Fear of Mistakes in Social Situations', 'Reduce perfection pressure in social moments.'],
      ['Joining a Game', 'Plan entry steps for joining peers in play.'],
      ['Asking for Help Out Loud', 'Practice short scripts for asking teachers/peers for help.'],
      ['Social Worry Thoughts', 'Identify and rebalance social worry thoughts.'],
      ['Body Signs in Social Stress', 'Notice body cues and pair with regulation strategies.'],
      ['Helpful Social Phrases', 'Build confidence phrases for social interactions.'],
      ['Small Social Steps Ladder', 'Track small social courage actions.'],
      ['Social Courage Card', 'Create a social courage reminder card.'],
    ],
  },
  {
    clinicalGroupNumber: 1,
    clinicalGroupTitleEn: 'Anxiety & Fears',
    subcategoryNumber: '1.4',
    subcategoryTitleEn: 'Test & Performance Anxiety',
    filePath: '/forms/children/en/cbt-specialized/module-01/children_cbt_specialized_en_01_04_specific_phobias_full.pdf',
    therapeuticGoal: 'Reduce test/performance anxiety by preparing routines, thought support, and step-based task planning.',
    whenToUse: 'Use for freezing before tests, fear of mistakes, and high stress in performance situations.',
    aiMatchingSummary: 'Match for test fear, performance pressure, and pre-task calming routines.',
    keywordsEn: ['test anxiety', 'performance anxiety', 'before the test', 'fear of mistakes', 'breathing before test', 'confidence card'],
    scenarioPhrases: ['child freezes before tests', 'test anxiety', 'fear of performance'],
    worksheetTopics: [
      ['Before the Test', 'Prepare a short pre-test calming and readiness routine.'],
      ['Mistake Fear Rebalance', 'Reduce fear-of-mistakes pressure before performance.'],
      ['I Will Not Succeed Thought Check', 'Reframe failure predictions into helpful thoughts.'],
      ['Ready Before the Task', 'Plan what to do before starting a challenging task.'],
      ['Breathing Before a Test', 'Use breathing regulation before and during tests.'],
      ['Break It Into Small Parts', 'Chunk performance tasks into manageable steps.'],
      ['After the Test Reflection', 'Reflect on effort and recovery after performance.'],
      ['Success Is Not Perfection', 'Shift from perfection pressure to progress framing.'],
      ['Performance Plan Template', 'Build a personal plan for future performance moments.'],
      ['Confidence Card', 'Create a compact confidence reminder card.'],
    ],
  },
  {
    clinicalGroupNumber: 1,
    clinicalGroupTitleEn: 'Anxiety & Fears',
    subcategoryNumber: '1.5',
    subcategoryTitleEn: 'Generalized Anxiety / Everyday Worries',
    filePath: '/forms/children/en/cbt-specialized/module-01/children_cbt_specialized_en_01_05_specific_phobias_full.pdf',
    therapeuticGoal: 'Reduce broad worry load by clarifying controllables, practicing calming anchors, and structured worry coping.',
    whenToUse: 'Use for frequent everyday worries about family, school, future, and uncertain daily situations.',
    aiMatchingSummary: 'Match for generalized worry patterns and everyday anxiety support.',
    keywordsEn: ['generalized anxiety', 'everyday worries', 'worries about family', 'control vs not control', 'worry time', 'calming anchor'],
    scenarioPhrases: ['child worries about everything', 'everyday worries', 'generalized anxiety child'],
    worksheetTopics: [
      ['Everyday Worries', 'List frequent daily worries in simple child language.'],
      ['Worries About Family', 'Support family-related worry mapping and coping.'],
      ['Future and Daily Uncertainty', 'Reduce distress around uncertain outcomes.'],
      ['What Is In My Control?', 'Separate controllable from uncontrollable worries.'],
      ['Short Worry Time', 'Contain worry loops with a short planned worry window.'],
      ['Helpful Thoughts for Worry', 'Build balancing thoughts for common worries.'],
      ['Body and Worry Signals', 'Track body activation linked to worry spikes.'],
      ['Calming Anchor Practice', 'Choose and practice a brief calming anchor.'],
      ['My Worry Coping Plan', 'Create a simple plan for repeated worries.'],
      ['Worry Reminder Card', 'Create a coping reminder card for worry moments.'],
    ],
  },
  {
    clinicalGroupNumber: 2,
    clinicalGroupTitleEn: 'Behavior & Emotional Regulation',
    subcategoryNumber: '2.1',
    subcategoryTitleEn: 'Anger Outbursts & Regulation',
    filePath: '/forms/children/en/cbt-specialized/module-02/children_cbt_specialized_en_2.1_anger.pdf',
    therapeuticGoal: 'Improve anger regulation through early-signal awareness, pause skills, and repair planning.',
    whenToUse: 'Use for frustration outbursts, escalation patterns, and regulation coaching after anger spikes.',
    aiMatchingSummary: 'Match for child anger outbursts and regulation planning.',
    keywordsEn: ['anger outbursts', 'regulation', 'anger thermometer', 'pause', 'repair after anger', 'frustration ladder'],
    scenarioPhrases: ['child explodes when frustrated', 'anger outbursts', 'regulation after anger'],
    worksheetTopics: [
      ['Anger Thermometer', 'Rate anger intensity and early escalation levels.'],
      ['Early Anger Signs', 'Identify first signs before outbursts.'],
      ['Pause Before Outburst', 'Practice stop-pause routines before reacting.'],
      ['Body Clues for Anger', 'Track body cues linked to anger build-up.'],
      ['Choose a Different Response', 'Rehearse alternative responses to triggers.'],
      ['Repair After Anger', 'Plan repair steps after a blow-up.'],
      ['Ask for a Break', 'Practice asking for a regulation break.'],
      ['Calming Tools for Anger', 'Select calming tools that lower anger intensity.'],
      ['Frustration Ladder', 'Use graded frustration tolerance steps.'],
      ['Personal Anger Plan', 'Create a personal anger regulation plan.'],
    ],
  },
  {
    clinicalGroupNumber: 2,
    clinicalGroupTitleEn: 'Behavior & Emotional Regulation',
    subcategoryNumber: '2.2',
    subcategoryTitleEn: 'Oppositional Behavior / ODD Patterns',
    filePath: '/forms/children/en/cbt-specialized/module-02/children_cbt_specialized_en_2.2_odd.pdf',
    therapeuticGoal: 'Support cooperation, reduce argument cycles, and build flexible response patterns in authority conflicts.',
    whenToUse: 'Use for frequent arguing, refusal, and conflict around instructions or authority requests.',
    aiMatchingSummary: 'Match for oppositional behavior patterns with cooperation-focused CBT support.',
    keywordsEn: ['odd patterns', 'oppositional behavior', 'cooperation', 'arguing', 'refusal', 'authority conflict', 'flexibility'],
    scenarioPhrases: ['child argues with parents and refuses instructions', 'oppositional behavior', 'odd cooperation'],
    worksheetTopics: [
      ['Cooperation Starter', 'Practice one cooperation step in conflict moments.'],
      ['Arguing Pattern Check', 'Map common arguing loops and interruption points.'],
      ['Refusal to Request Mapping', 'Track refusal triggers and response options.'],
      ['Authority Conflict Plan', 'Build safer responses to authority conflict.'],
      ['Choice vs Opposition', 'Practice choosing cooperation over opposition.'],
      ['Ask Instead of Argue', 'Use request scripts instead of argumentative escalation.'],
      ['Try One Rule', 'Trial one predictable rule-following behavior.'],
      ['Repair After Conflict', 'Plan post-conflict repair and reset steps.'],
      ['Flexibility Practice', 'Build flexibility in routine and expectations.'],
      ['Trying Differently Card', 'Create a reminder card for trying differently.'],
    ],
  },
  {
    clinicalGroupNumber: 2,
    clinicalGroupTitleEn: 'Behavior & Emotional Regulation',
    subcategoryNumber: '2.3',
    subcategoryTitleEn: 'Impulsivity',
    filePath: '/forms/children/en/cbt-specialized/module-02/children_cbt_specialized_en_2.3_impulsivity.pdf',
    therapeuticGoal: 'Strengthen stop-think-choose behavior to reduce impulsive reactions and improve repair skills.',
    whenToUse: 'Use for acting before thinking, interrupting, impulsive behavior, and turn-waiting difficulties.',
    aiMatchingSummary: 'Match for impulsive actions and stop-think-choose coaching.',
    keywordsEn: ['impulsivity', 'stop before acting', 'think before doing', 'waiting turn', 'traffic light', 'stop-think-choose'],
    scenarioPhrases: ['child acts before thinking', 'impulsive child behavior', 'stop think choose'],
    worksheetTopics: [
      ['Stop Before Acting', 'Build a stop cue before impulsive actions.'],
      ['Think Before Doing', 'Practice quick thinking checks before acting.'],
      ['Quiet Hands Practice', 'Train body-control pauses for impulsive urges.'],
      ['Waiting My Turn', 'Practice waiting-turn behavior in social settings.'],
      ['Choose Before Urge', 'Pause and choose response before urge-driven action.'],
      ['What Happens After?', 'Review consequences after impulsive actions.'],
      ['Action Traffic Light', 'Use red-yellow-green cues for behavior choices.'],
      ['Practicing Waiting', 'Track short waiting practices and success cues.'],
      ['Fixing It After Impulse', 'Plan repair actions after impulsive mistakes.'],
      ['Stop-Think-Choose Card', 'Create a portable stop-think-choose card.'],
    ],
  },
  {
    clinicalGroupNumber: 3,
    clinicalGroupTitleEn: 'Social Skills & Self-Esteem',
    subcategoryNumber: '3.1',
    subcategoryTitleEn: 'Low Self-Esteem',
    filePath: '/forms/children/en/cbt-specialized/module-03/children_cbt_specialized_en_3.1_low_self_esteem.pdf',
    therapeuticGoal: 'Strengthen self-worth and kinder self-talk while reducing harsh self-criticism patterns.',
    whenToUse: 'Use when a child says negative things about self-worth, competence, or belonging.',
    aiMatchingSummary: 'Match for low self-esteem, self-criticism, and confidence-building support.',
    keywordsEn: ['low self-esteem', 'not good enough', 'strengths', 'kind voice', 'helpful self-talk', 'self-worth'],
    scenarioPhrases: ['child thinks i am not good enough', 'low self-esteem child', 'self criticism child'],
    worksheetTopics: [
      ['Thoughts About Myself', 'Identify common self-thoughts and emotional impact.'],
      ['I Am Not Good Enough Thought Check', 'Reframe global self-negative beliefs.'],
      ['My Strengths List', 'Identify personal strengths and effort markers.'],
      ['Learning Is Growth', 'Normalize learning and growth through practice.'],
      ['Small Success Tracker', 'Track small wins and daily progress moments.'],
      ['Mistakes Are Not Failure', 'Reframe mistakes as learning steps.'],
      ['Critical Voice vs Kind Voice', 'Differentiate critical and compassionate self-talk.'],
      ['What Others Appreciate', 'Map trusted positive feedback from others.'],
      ['Helpful Self-Talk Builder', 'Build kinder replacement self-statements.'],
      ['Self-Worth Card', 'Create a self-worth reminder card.'],
    ],
  },
  {
    clinicalGroupNumber: 3,
    clinicalGroupTitleEn: 'Social Skills & Self-Esteem',
    subcategoryNumber: '3.2',
    subcategoryTitleEn: 'Social Difficulties',
    filePath: '/forms/children/en/cbt-specialized/module-03/children_cbt_specialized_en_3.2_social_difficulties.pdf',
    therapeuticGoal: 'Improve social participation, communication, repair skills, and friendship support behaviors.',
    whenToUse: 'Use for peer-entry difficulties, conflict with peers, social cue confusion, or social exclusion stress.',
    aiMatchingSummary: 'Match for social skills coaching and friendship problem-solving.',
    keywordsEn: ['social difficulties', 'joining a game', 'asking for a turn', 'social cues', 'friendship skills', 'left out'],
    scenarioPhrases: ['child does not know how to join games', 'social difficulties child', 'friendship conflict child'],
    worksheetTopics: [
      ['Joining a Game', 'Practice steps for joining peer play respectfully.'],
      ['Asking for a Turn', 'Use clear requests when waiting for turns.'],
      ['Solving Arguments', 'Use repair-oriented conflict steps with peers.'],
      ['Saying No Safely', 'Practice respectful boundary-setting language.'],
      ['Understanding Social Cues', 'Identify basic nonverbal and social cues.'],
      ['What Makes a Good Friendship?', 'Clarify supportive friendship behaviors.'],
      ['When I Feel Left Out', 'Build coping and reconnection steps for exclusion.'],
      ['Repair After Hurting Someone', 'Plan apology and repair actions.'],
      ['Short Conversation Plan', 'Structure brief social conversation starters.'],
      ['Social Skill Card', 'Create a social-skill reminder card.'],
    ],
  },
  {
    clinicalGroupNumber: 4,
    clinicalGroupTitleEn: 'OCD & Trauma-Sensitive Coping',
    subcategoryNumber: '4.1',
    subcategoryTitleEn: 'OCD',
    filePath: '/forms/children/en/cbt-specialized/module-04/children_cbt_specialized_en_4.1_ocd.pdf',
    therapeuticGoal: 'Support response flexibility and urge tolerance in OCD-like loops while reducing ritual dependence.',
    whenToUse: 'Use for sticky thoughts, ritual urges, repeated checking/washing urges, and reassurance-loop patterns.',
    aiMatchingSummary: 'Match for pediatric OCD patterns and brave new-response practice.',
    keywordsEn: ['ocd', 'sticky thoughts', 'ritual urges', 'repeated checking', 'washing urges', 'not now ladder', 'new response'],
    scenarioPhrases: ['child has sticky thoughts and rituals', 'ocd child worksheet', 'ritual urges child'],
    worksheetTopics: [
      ['Sticky Thoughts Notice', 'Notice sticky thought loops without immediate ritual response.'],
      ['Urge to Do a Ritual', 'Map ritual urges and pause options.'],
      ['Doubt Loop Check', 'Track doubt patterns that drive repeated checking.'],
      ['Repeated Checking Plan', 'Practice reducing repeated checking behavior.'],
      ['Washing/Cleaning Urges', 'Support urge tolerance with safer coping choices.'],
      ['Arranging and Order Urges', 'Notice arranging urges and response options.'],
      ['Wait Before Ritual', 'Practice short delay before ritual action.'],
      ['Not-Now Ladder', 'Build a step ladder for saying “not now” to urges.'],
      ['Choose a New Response', 'Select and practice a non-ritual response.'],
      ['Brave OCD Card', 'Create a brave reminder card for OCD moments.'],
    ],
  },
  {
    clinicalGroupNumber: 4,
    clinicalGroupTitleEn: 'OCD & Trauma-Sensitive Coping',
    subcategoryNumber: '4.2',
    subcategoryTitleEn: 'Trauma-Sensitive Coping / PTSD',
    filePath: '/forms/children/en/cbt-specialized/module-04/children_cbt_specialized_en_4.2_trauma_sensitive_coping_ptsd.pdf',
    therapeuticGoal: 'Support stabilization, safety, grounding, and gentle regulation after fear/stress activation.',
    whenToUse: 'Use only for present-moment safety and grounding support after fear responses; avoid trauma-detail processing.',
    aiMatchingSummary: 'Match for trauma-sensitive stabilization, grounding, and safety support without trauma processing.',
    keywordsEn: ['trauma-sensitive coping', 'ptsd support', 'feeling safe now', 'grounding', 'safe place', 'safe person', 'support card'],
    scenarioPhrases: ['child needs grounding and safety after fear', 'trauma sensitive coping child', 'grounding after fear child'],
    worksheetTopics: [
      ['Feeling Safe Right Now', 'Anchor immediate present-moment safety cues.'],
      ['Noticing Triggers Without Details', 'Notice triggers without recalling event details.'],
      ['Back to My Body', 'Use body-based grounding to return to the present.'],
      ['Safe Place Anchor', 'Build an internal or external safe-place anchor.'],
      ['Safe Person Support', 'Identify trusted support people and contact steps.'],
      ['What Helps Me Now', 'Choose immediate supports that stabilize right now.'],
      ['Body Signs After Fear', 'Track body responses after fear activation.'],
      ['Grounding Plan', 'Create a short grounding sequence plan.'],
      ['Safety Statement', 'Write a present-focused safety reminder statement.'],
      ['Help and Support Card', 'Create a support-contact reminder card.'],
    ],
  },
  {
    clinicalGroupNumber: 5,
    clinicalGroupTitleEn: 'Functional & Stress-Related Body Problems',
    subcategoryNumber: '5.1',
    subcategoryTitleEn: 'Sleep Problems',
    filePath: '/forms/children/en/cbt-specialized/module-05/children_cbt_specialized_en_5.1_sleep_problems.pdf',
    therapeuticGoal: 'Improve bedtime regulation, reduce night worries, and build consistent sleep-support routines.',
    whenToUse: 'Use for bedtime anxiety, fear of dark, wake-night distress, and sleep-routine support needs.',
    aiMatchingSummary: 'Match for child sleep worries and bedtime coping plans.',
    keywordsEn: ['sleep problems', 'bedtime worries', 'fear of dark', 'bedtime routine', 'night card', 'sleep plan'],
    scenarioPhrases: ['child has bedtime worries', 'sleep problems child', 'fear of dark bedtime'],
    worksheetTopics: [
      ['Thoughts Before Sleep', 'Identify bedtime thoughts that raise arousal.'],
      ['Fear of the Dark Support', 'Build coping steps for dark-related fears.'],
      ['Bedtime Routine Builder', 'Create a predictable calming bedtime routine.'],
      ['Body Ready for Sleep', 'Use body-wind-down cues and supports.'],
      ['Calming Sleep Tools', 'Choose calming tools for bedtime regulation.'],
      ['Night Support Card', 'Prepare a short night-time coping card.'],
      ['Waking Up at Night', 'Plan steps for calm re-set after waking.'],
      ['Staying Safely in Bed', 'Support bedtime consistency and safe staying-in-bed practice.'],
      ['Nighttime Worries', 'Contain and rebalance nighttime worry loops.'],
      ['Personal Sleep Plan', 'Create a personalized child sleep support plan.'],
    ],
  },
  {
    clinicalGroupNumber: 5,
    clinicalGroupTitleEn: 'Functional & Stress-Related Body Problems',
    subcategoryNumber: '5.2',
    subcategoryTitleEn: 'Psychosomatic Complaints',
    filePath: '/forms/children/en/cbt-specialized/module-05/children_cbt_specialized_en_5.2_psychosomatic_complaints.pdf',
    therapeuticGoal: 'Support stress-linked body complaints with regulation, support-seeking, and return-to-action planning.',
    whenToUse: 'Use for stress-linked stomach aches, headaches, and body discomfort patterns around school or worries.',
    aiMatchingSummary: 'Match for psychosomatic/stress-body complaints in children with coping-focused support.',
    keywordsEn: ['psychosomatic complaints', 'stomach ache before school', 'headache and worry', 'body stress', 'return-to-action plan'],
    scenarioPhrases: ['child gets stomach aches before school', 'psychosomatic child complaints', 'headache worry child'],
    worksheetTopics: [
      ['Stomach Ache Before School', 'Map school-linked stomach discomfort patterns.'],
      ['Headache and Worry Link', 'Track headache episodes connected with worry load.'],
      ['What Is My Body Saying?', 'Explore stress-body communication signals.'],
      ['When It Happens Most', 'Identify timing and contexts for body complaints.'],
      ['What Helps My Body?', 'Choose supports that reduce body tension.'],
      ['Breathing for Tense Body', 'Practice breathing regulation for body stress.'],
      ['Thought-Feeling-Body Link', 'Connect thoughts, feelings, and body signals.'],
      ['Asking for Help', 'Practice communication for support needs.'],
      ['Return-to-Action Plan', 'Plan gradual return to school/daily activities.'],
      ['Calm Body Card', 'Create a calm-body coping reminder card.'],
    ],
  },
  {
    clinicalGroupNumber: 5,
    clinicalGroupTitleEn: 'Functional & Stress-Related Body Problems',
    subcategoryNumber: '5.3',
    subcategoryTitleEn: 'Enuresis / Encopresis Stress Support',
    filePath: '/forms/children/en/cbt-specialized/module-05/children_cbt_specialized_en_5.3_enuresis_encopresis_stress_support.pdf',
    therapeuticGoal: 'Provide shame-free emotional support around stress-linked toileting accidents while strengthening coping and support plans.',
    whenToUse: 'Use for stress-supportive emotional coping around enuresis/encopresis experiences, not as medical treatment.',
    aiMatchingSummary: 'Match for shame-reduction and stress-support planning in enuresis/encopresis contexts.',
    keywordsEn: ['enuresis stress support', 'encopresis stress support', 'no shame no blame', 'body learns slowly', 'parent support', 'i am learning'],
    scenarioPhrases: ['child feels shame about accidents', 'enuresis stress support child', 'encopresis stress support'],
    worksheetTopics: [
      ['No Shame, No Blame', 'Normalize supportive language without blame.'],
      ['My Body Learns Slowly', 'Reinforce gradual learning and patience framing.'],
      ['Calm Evening Routine', 'Build a calming evening prep routine.'],
      ['Body Signals Awareness', 'Notice body signals related to toileting stress.'],
      ['Asking for Help Kindly', 'Practice asking trusted adults for support.'],
      ['Calm Bathroom Plan', 'Create a stress-reduction bathroom/toilet plan.'],
      ['When Accidents Happen', 'Plan kind and practical response after accidents.'],
      ['Kind Words for Myself', 'Build compassionate self-talk after stress events.'],
      ['Parent Support Plan', 'Map supportive caregiver responses and routines.'],
      ['I Am Learning Card', 'Create an “I am learning” confidence card.'],
    ],
  },
]);

function toKebabCase(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function buildModuleForm(definition) {
  const normalizedSubcategory = definition.subcategoryNumber.replace('.', '-');
  const fileName = definition.filePath.split('/').pop();
  const worksheetNumbers = definition.worksheetTopics.map((_, index) => `${definition.subcategoryNumber}.${index + 1}`);
  const safetyNotes = SPECIAL_SAFETY_NOTES[definition.subcategoryNumber]
    || 'Children-focused CBT supportive worksheets. Keep guidance gentle, non-shaming, and age-appropriate.';

  return Object.freeze({
    id: `${SERIES_ID}-module-${normalizedSubcategory}`,
    slug: `${SERIES_ID}-module-${normalizedSubcategory}-${toKebabCase(definition.subcategoryTitleEn)}`,
    parentSeriesId: SERIES_ID,
    type: 'module_pdf',
    title: `Children CBT Specialized ${definition.subcategoryNumber} — ${definition.subcategoryTitleEn}`,
    language: 'en',
    audience: 'children',
    category: CATEGORY,
    mainCategory: MAIN_CATEGORY,
    displayCategory: DISPLAY_CATEGORY,
    secondaryCategories: SHARED_SECONDARY_CATEGORIES,
    series: SERIES_TITLE,
    clinicalGroupNumber: definition.clinicalGroupNumber,
    clinicalGroupTitleEn: definition.clinicalGroupTitleEn,
    subcategoryNumber: definition.subcategoryNumber,
    subcategoryTitleEn: definition.subcategoryTitleEn,
    worksheetCount: 10,
    worksheetNumbers,
    moduleNumber: definition.clinicalGroupNumber,
    moduleCode: definition.subcategoryNumber,
    formNumber: definition.subcategoryNumber,
    worksheetNumber: definition.subcategoryNumber,
    displayNumber: definition.subcategoryNumber,
    fileUrl: definition.filePath,
    description: `${definition.subcategoryTitleEn} pack (10 worksheets).`,
    therapeuticGoal: definition.therapeuticGoal,
    whenToUse: definition.whenToUse,
    aiMatchingSummary: definition.aiMatchingSummary,
    clinicalKeywords: Object.freeze(Array.from(new Set([
      ...definition.keywordsEn,
      ...definition.scenarioPhrases,
      definition.subcategoryTitleEn.toLowerCase(),
      'children cbt specialized',
      `subcategory ${definition.subcategoryNumber}`,
      'worksheet pack',
    ]))),
    intentPhrases: Object.freeze(Array.from(new Set([
      ...definition.scenarioPhrases,
      `${definition.subcategoryTitleEn.toLowerCase()} pack`,
      `children specialized ${definition.subcategoryNumber}`,
      `module ${definition.subcategoryNumber}`,
      `send ${definition.subcategoryTitleEn.toLowerCase()} pack`,
      `send children cbt specialized ${definition.subcategoryNumber}`,
    ]))),
    notFor: SHARED_NOT_FOR,
    relatedForms: Object.freeze([]),
    therapeutic_use: 'children_cbt_specialized_module_pdf',
    ai_matching_summary: definition.aiMatchingSummary,
    safetyNotes,
    safety_notes: safetyNotes,
    approved: true,
    languages: Object.freeze({
      en: Object.freeze({
        title: `Children CBT Specialized ${definition.subcategoryNumber} — ${definition.subcategoryTitleEn}`,
        description: `${definition.subcategoryTitleEn} pack (10 worksheets).`,
        file_url: definition.filePath,
        file_type: 'pdf',
        file_name: fileName,
        rtl: false,
      }),
    }),
  });
}

function buildWorksheetForms(definition, moduleFormId) {
  const fileName = definition.filePath.split('/').pop();
  const baseSafety = SPECIAL_SAFETY_NOTES[definition.subcategoryNumber]
    || 'Children-focused CBT supportive worksheet. Keep guidance gentle and non-shaming.';

  return definition.worksheetTopics.map(([topicTitle, topicWhenToUse], index) => {
    const worksheetIndex = index + 1;
    const worksheetNumber = `${definition.subcategoryNumber}.${worksheetIndex}`;
    const normalizedSubcategory = definition.subcategoryNumber.replace('.', '-');
    const worksheetId = `${SERIES_ID}-${normalizedSubcategory}-${worksheetIndex}`;

    return Object.freeze({
      id: worksheetId,
      slug: `${worksheetId}-${toKebabCase(topicTitle)}`,
      parentSeriesId: SERIES_ID,
      parentModuleId: moduleFormId,
      type: 'individual_worksheet',
      title: `${worksheetNumber} — ${topicTitle}`,
      language: 'en',
      audience: 'children',
      category: CATEGORY,
      mainCategory: MAIN_CATEGORY,
      displayCategory: DISPLAY_CATEGORY,
      secondaryCategories: SHARED_SECONDARY_CATEGORIES,
      series: SERIES_TITLE,
      clinicalGroupNumber: definition.clinicalGroupNumber,
      clinicalGroupTitleEn: definition.clinicalGroupTitleEn,
      subcategoryNumber: definition.subcategoryNumber,
      subcategoryTitleEn: definition.subcategoryTitleEn,
      worksheetNumber,
      worksheet_number: worksheetNumber,
      formNumber: worksheetNumber,
      moduleNumber: definition.clinicalGroupNumber,
      moduleCode: definition.subcategoryNumber,
      pageNumberInWorkbook: worksheetIndex,
      page_number: worksheetIndex,
      fileUrl: definition.filePath,
      description: `${topicTitle}.`,
      therapeuticGoal: definition.therapeuticGoal,
      whenToUse: topicWhenToUse,
      aiMatchingSummary: `${definition.aiMatchingSummary} Worksheet ${worksheetNumber}: ${topicTitle}.`,
      clinicalKeywords: Object.freeze(Array.from(new Set([
        ...definition.keywordsEn,
        ...definition.scenarioPhrases,
        topicTitle.toLowerCase(),
        `worksheet ${worksheetNumber}`,
        'children cbt specialized',
      ]))),
      intentPhrases: Object.freeze(Array.from(new Set([
        ...definition.scenarioPhrases,
        topicTitle.toLowerCase(),
        `worksheet ${worksheetNumber}`,
        `form ${worksheetNumber}`,
        `send worksheet ${worksheetNumber}`,
      ]))),
      notFor: SHARED_NOT_FOR,
      relatedForms: Object.freeze([moduleFormId]),
      therapeutic_use: 'children_cbt_specialized_individual_worksheet_reference',
      ai_matching_summary: `${definition.aiMatchingSummary} Worksheet ${worksheetNumber}: ${topicTitle}.`,
      safetyNotes: baseSafety,
      safety_notes: baseSafety,
      approved: true,
      languages: Object.freeze({
        en: Object.freeze({
          title: `${worksheetNumber} — ${topicTitle}`,
          description: `${topicTitle}.`,
          file_url: definition.filePath,
          file_type: 'pdf',
          file_name: fileName,
          rtl: false,
        }),
      }),
    });
  });
}

export const CHILDREN_CBT_SPECIALIZED_MANIFEST = Object.freeze({
  id: SERIES_ID,
  audience: 'children',
  language: 'en',
  main_category: MAIN_CATEGORY,
  display_category: DISPLAY_CATEGORY,
  source: 'public/forms/manifest.children-cbt-specialized-en.json',
  modules: Object.freeze(SUBCATEGORY_DEFINITIONS.map((definition) => Object.freeze({
    clinical_group_number: definition.clinicalGroupNumber,
    clinical_group_title_en: definition.clinicalGroupTitleEn,
    subcategory_number: definition.subcategoryNumber,
    subcategory_title_en: definition.subcategoryTitleEn,
    pdf_file_path: definition.filePath,
    worksheet_count: 10,
  }))),
});

export const FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS = Object.freeze(
  SUBCATEGORY_DEFINITIONS.map((definition) => buildModuleForm(definition))
);

export const FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL = Object.freeze(
  FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS.flatMap((moduleForm, index) =>
    buildWorksheetForms(SUBCATEGORY_DEFINITIONS[index], moduleForm.id)
  )
);

export const FORMS_CHILDREN_CBT_SPECIALIZED_FULL_PDFS = Object.freeze([]);

export const FORMS_CHILDREN_CBT_SPECIALIZED = Object.freeze([
  ...FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS,
  ...FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL,
]);

export const CHILDREN_CBT_SPECIALIZED_STATS = Object.freeze({
  modulePdfCount: FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS.length,
  worksheetCount: FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL.length,
  totalCount: FORMS_CHILDREN_CBT_SPECIALIZED.length,
});

export const CHILDREN_CBT_SPECIALIZED_SUBCATEGORY_LOOKUP = Object.freeze(
  Object.fromEntries(
    SUBCATEGORY_DEFINITIONS.map((definition) => [
      definition.subcategoryNumber,
      Object.freeze({
        subcategoryTitleEn: definition.subcategoryTitleEn,
        clinicalGroupNumber: definition.clinicalGroupNumber,
        clinicalGroupTitleEn: definition.clinicalGroupTitleEn,
        filePath: definition.filePath,
      }),
    ])
  )
);

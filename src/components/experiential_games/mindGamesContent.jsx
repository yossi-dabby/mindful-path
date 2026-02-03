// components/experiential_games/mindGamesContent.js

export const gamesCatalog = [
  {
    id: "thought_quiz",
    slug: "thought-quiz",
    title: "Thought Quiz",
    description: "Spot the thinking trap in a quick example.",
    time: "60s",
    icon: "Puzzle",
    componentKey: "ThoughtQuiz",
    testId: "mindgame-card-thought-quiz",
  },
  {
    id: "reframe_pick",
    slug: "reframe-pick",
    title: "Reframe Pick",
    description: "Choose the most balanced alternative thought.",
    time: "90s",
    icon: "Puzzle",
    componentKey: "ReframePick",
    testId: "mindgame-card-reframe-pick",
  },
  {
    id: "value_compass",
    slug: "value-compass",
    title: "Value Compass",
    description: "Pick a value, then choose one tiny action.",
    time: "60s",
    icon: "Puzzle",
    componentKey: "ValueCompass",
    testId: "mindgame-card-value-compass",
  },
  {
    id: "tiny_experiment",
    slug: "tiny-experiment",
    title: "Tiny Experiment",
    description: "Test a belief with a 2-minute experiment.",
    time: "120s",
    icon: "Puzzle",
    componentKey: "TinyExperiment",
    testId: "mindgame-card-tiny-experiment",
  },
  {
    id: "quick_win",
    slug: "quick-win",
    title: "Quick Win",
    description: "Log one tiny win and build momentum.",
    time: "30–60s",
    icon: "Puzzle",
    componentKey: "QuickWin",
    testId: "mindgame-card-quick-win",
  },
  {
    id: "calm_bingo",
    slug: "calm-bingo",
    title: "Calm Bingo",
    description: "Mark 2 squares to complete a mini round.",
    time: "120s",
    icon: "Puzzle",
    componentKey: "CalmBingo",
    testId: "mindgame-card-calm-bingo",
  },
];

// 1) Thought Quiz (CBT)
export const thoughtQuizItems = [
  {
    id: "tq1",
    prompt: "If I don't do this perfectly, I'm a total failure.",
    options: [
      "All-or-nothing thinking",
      "Mind reading",
      "Catastrophizing",
      "Discounting the positive",
    ],
    correctIndex: 0,
    explanation:
      "This treats performance as a strict pass/fail label instead of a spectrum.",
  },
  {
    id: "tq2",
    prompt: "They haven't replied yet, so they must be upset with me.",
    options: [
      "Emotional reasoning",
      "Mind reading",
      "Labeling",
      "Overgeneralization",
    ],
    correctIndex: 1,
    explanation:
      "You're assuming you know what they think without clear evidence.",
  },
  {
    id: "tq3",
    prompt: "If I make one mistake, everything will fall apart.",
    options: [
      "Catastrophizing",
      "Personalization",
      "Should statements",
      "Mental filter",
    ],
    correctIndex: 0,
    explanation:
      "This jumps to the worst-case outcome and treats it as likely.",
  },
  {
    id: "tq4",
    prompt: "I had an awkward moment today. I always mess things up.",
    options: [
      "Overgeneralization",
      "Mind reading",
      "Fortune telling",
      "Disqualifying the positive",
    ],
    correctIndex: 0,
    explanation:
      "One moment gets turned into a sweeping rule about your whole life.",
  },
  {
    id: "tq5",
    prompt: "I feel anxious, so something bad must be about to happen.",
    options: [
      "Emotional reasoning",
      "Should statements",
      "Labeling",
      "Black-and-white thinking",
    ],
    correctIndex: 0,
    explanation:
      "Feelings are treated like facts, even when they're just signals.",
  },
  {
    id: "tq6",
    prompt: "My friend sounded quiet. It's probably my fault.",
    options: [
      "Personalization",
      "Catastrophizing",
      "Fortune telling",
      "Magnification",
    ],
    correctIndex: 0,
    explanation:
      "You're taking responsibility for something that may have many causes.",
  },
  {
    id: "tq7",
    prompt: "I should be more productive all the time.",
    options: [
      "Should statements",
      "Mental filter",
      "Mind reading",
      "Overgeneralization",
    ],
    correctIndex: 0,
    explanation:
      "Rigid rules ('should') create pressure and ignore real human limits.",
  },
  {
    id: "tq8",
    prompt: "One person criticized me, so I'm probably not good at this.",
    options: [
      "Labeling",
      "Disqualifying the positive",
      "Magnification",
      "All-or-nothing thinking",
    ],
    correctIndex: 2,
    explanation:
      "A single critique gets blown up and outweighs the full picture.",
  },
  {
    id: "tq9",
    prompt: "I did well, but it doesn't count because it was easy.",
    options: [
      "Discounting the positive",
      "Fortune telling",
      "Personalization",
      "Catastrophizing",
    ],
    correctIndex: 0,
    explanation:
      "You're dismissing real effort and progress instead of acknowledging it.",
  },
  {
    id: "tq10",
    prompt: "Everyone noticed my mistake. They must think I'm incompetent.",
    options: [
      "Mind reading",
      "Mental filter",
      "Emotional reasoning",
      "Should statements",
    ],
    correctIndex: 0,
    explanation:
      "You're guessing others' judgments without checking the evidence.",
  },
  {
    id: "tq11",
    prompt: "If I try and it's uncomfortable, that means it's wrong for me.",
    options: [
      "Emotional reasoning",
      "Overgeneralization",
      "Labeling",
      "Disqualifying the positive",
    ],
    correctIndex: 0,
    explanation:
      "Discomfort can be part of growth; it doesn't automatically mean danger.",
  },
  {
    id: "tq12",
    prompt: "I didn't meet my goal today, so I'm never going to change.",
    options: [
      "Fortune telling",
      "Catastrophizing",
      "Overgeneralization",
      "All-or-nothing thinking",
    ],
    correctIndex: 2,
    explanation:
      "A single day becomes a permanent prediction, ignoring gradual progress.",
  },
];

// 2) Reframe Pick (CBT)
export const reframePickItems = [
  {
    id: "rp1",
    situation: "You sent a message and haven't heard back.",
    automaticThought: "They're ignoring me because I said something wrong.",
    choices: [
      "They're busy. I can wait or follow up later in a calm way.",
      "They definitely hate me now and I ruined everything.",
      "I'll never message anyone again so I don't risk feeling this.",
    ],
    bestIndex: 0,
    why:
      "It considers multiple possibilities and suggests a reasonable next step.",
  },
  {
    id: "rp2",
    situation: "You made a small mistake at work/school.",
    automaticThought: "I'm terrible at this.",
    choices: [
      "One mistake is normal. I can fix it and learn for next time.",
      "I'm the worst person here. I should quit immediately.",
      "I'll pretend it didn't happen and avoid anything challenging.",
    ],
    bestIndex: 0,
    why:
      "It's specific, realistic, and focused on learning rather than global labels.",
  },
  {
    id: "rp3",
    situation: "A friend was quiet during your hangout.",
    automaticThought: "They must be annoyed with me.",
    choices: [
      "I don't know the reason. I can check in kindly or give space.",
      "It's my fault. I always ruin friendships.",
      "I should cut them off before they reject me first.",
    ],
    bestIndex: 0,
    why:
      "It avoids mind reading and leaves room for a gentle check-in.",
  },
  {
    id: "rp4",
    situation: "You didn't finish a task you planned.",
    automaticThought: "I'm so lazy.",
    choices: [
      "I struggled today. I can pick one small next step and restart.",
      "I'm hopeless. I'll never be consistent at anything.",
      "I should punish myself until I finally get disciplined.",
    ],
    bestIndex: 0,
    why:
      "It acknowledges difficulty and moves toward a doable, compassionate action.",
  },
  {
    id: "rp5",
    situation: "You feel anxious before an event.",
    automaticThought: "This anxiety means the event will go badly.",
    choices: [
      "Anxiety is a feeling, not a prediction. I can go anyway and cope.",
      "Anxiety means danger. I must avoid this at all costs.",
      "I need to feel zero anxiety before I'm allowed to show up.",
    ],
    bestIndex: 0,
    why:
      "It separates feelings from forecasts and supports valued action.",
  },
  {
    id: "rp6",
    situation: "Someone gave you feedback.",
    automaticThought: "I'm not good enough.",
    choices: [
      "Feedback can help me improve. I can take what's useful and grow.",
      "They think I'm incompetent and everyone agrees with them.",
      "I'll stop trying so no one can judge me again.",
    ],
    bestIndex: 0,
    why:
      "It keeps self-worth intact while allowing improvement.",
  },
  {
    id: "rp7",
    situation: "You didn't get invited to something.",
    automaticThought: "Nobody likes me.",
    choices: [
      "There could be many reasons. I can reach out or plan something else.",
      "This proves I'm unlikable and always will be.",
      "I'll isolate so I don't have to feel left out again.",
    ],
    bestIndex: 0,
    why:
      "It avoids overgeneralization and offers flexible, constructive options.",
  },
  {
    id: "rp8",
    situation: "You're learning a new skill and feel behind.",
    automaticThought: "If I'm not fast, I'm not meant for this.",
    choices: [
      "Skills grow with practice. I can improve step by step.",
      "If I'm not immediately great, it's a waste of time.",
      "I should compare myself nonstop to prove I'm failing.",
    ],
    bestIndex: 0,
    why:
      "It supports growth mindset and realistic learning curves.",
  },
];

// 3) Value Compass (ACT)
export const valueCompassValues = [
  {
    id: "v1",
    value: "Family",
    actions: [
      "Send a kind message to a family member.",
      "Do one small helpful thing at home.",
      "Plan 10 minutes of quality time today.",
    ],
  },
  {
    id: "v2",
    value: "Health",
    actions: [
      "Drink a glass of water right now.",
      "Take a 2-minute stretch break.",
      "Step outside for fresh air for 3 minutes.",
    ],
  },
  {
    id: "v3",
    value: "Growth",
    actions: [
      "Learn one tiny thing (watch/read for 2 minutes).",
      "Practice a skill for 3 minutes.",
      "Write one sentence about what you want to improve.",
    ],
  },
  {
    id: "v4",
    value: "Friendship",
    actions: [
      "Check in with a friend with a simple hello.",
      "Reply to a message you've been postponing.",
      "Share one genuine compliment today.",
    ],
  },
  {
    id: "v5",
    value: "Courage",
    actions: [
      "Do the smallest version of the scary step (10%).",
      "Name what you fear in one sentence, then proceed anyway.",
      "Ask one small question instead of assuming.",
    ],
  },
  {
    id: "v6",
    value: "Calm",
    actions: [
      "Take 5 slow breaths (count 4 in / 4 out).",
      "Relax your shoulders and jaw for 20 seconds.",
      "Put your phone down for 2 minutes and reset.",
    ],
  },
  {
    id: "v7",
    value: "Creativity",
    actions: [
      "Write a silly 1-line idea (no judgment).",
      "Take a photo of something interesting around you.",
      "Doodle for 60 seconds.",
    ],
  },
  {
    id: "v8",
    value: "Purpose",
    actions: [
      "Choose one task that matters and do 2 minutes of it.",
      "Write your 'why' in 1 sentence.",
      "Remove one small obstacle from your path today.",
    ],
  },
];

// 4) Tiny Experiment (CBT)
export const tinyExperimentItems = [
  {
    id: "te1",
    belief: "If I ask for help, people will think I'm weak.",
    experiments: [
      "Ask one small, specific question and observe the response.",
      "Ask a trusted person for a tiny favor and note what happens.",
      "Ask for clarification once instead of guessing.",
    ],
    reflection: {
      question: "What happened?",
      options: [
        "It went better than I feared.",
        "It was neutral / fine.",
        "It was uncomfortable, but I handled it.",
      ],
    },
  },
  {
    id: "te2",
    belief: "If I say no, people will dislike me.",
    experiments: [
      "Say no to a low-stakes request using one polite sentence.",
      "Offer an alternative (not now / later) instead of automatic yes.",
      "Pause for 5 seconds before agreeing to anything.",
    ],
    reflection: {
      question: "What did you notice?",
      options: [
        "People respected it.",
        "Nothing dramatic happened.",
        "It felt hard, and I survived it.",
      ],
    },
  },
  {
    id: "te3",
    belief: "If I make a mistake, it will be a disaster.",
    experiments: [
      "Do a small task imperfectly on purpose (10%) and observe outcomes.",
      "Share a minor correction without apologizing excessively.",
      "Let one tiny typo exist and see what actually happens.",
    ],
    reflection: {
      question: "What was the outcome?",
      options: [
        "No one cared.",
        "It was fixable.",
        "It felt big in my head, smaller in reality.",
      ],
    },
  },
  {
    id: "te4",
    belief: "If I don't feel motivated, I can't start.",
    experiments: [
      "Start for 2 minutes only, then reassess.",
      "Set a timer for 90 seconds and do the first step.",
      "Make the task 10x smaller and begin.",
    ],
    reflection: {
      question: "After starting, how was it?",
      options: [
        "Easier than expected.",
        "Still hard, but possible.",
        "I gained a little momentum.",
      ],
    },
  },
  {
    id: "te5",
    belief: "If someone is quiet, it must be about me.",
    experiments: [
      "Write 3 alternative explanations before reacting.",
      "Ask a simple check-in question instead of assuming.",
      "Wait 30 minutes and see if new info appears.",
    ],
    reflection: {
      question: "What did you learn?",
      options: [
        "I didn't have enough evidence.",
        "There were other explanations.",
        "Checking in was helpful.",
      ],
    },
  },
  {
    id: "te6",
    belief: "I have to do everything right to be accepted.",
    experiments: [
      "Share one imperfect draft and request feedback.",
      "Do one task at 'good enough' level and stop.",
      "Let someone else choose one detail instead of controlling it.",
    ],
    reflection: {
      question: "How did it go?",
      options: [
        "Good enough worked.",
        "Acceptance didn't depend on perfection.",
        "I felt discomfort, and it passed.",
      ],
    },
  },
  {
    id: "te7",
    belief: "If I feel anxious, I shouldn't go.",
    experiments: [
      "Go for 5 minutes only and reassess.",
      "Bring one coping tool (water / music / breathing).",
      "Rate anxiety 0–10 before and after to compare.",
    ],
    reflection: {
      question: "What did you notice?",
      options: [
        "Anxiety changed over time.",
        "I could function with anxiety present.",
        "Avoidance wasn't necessary.",
      ],
    },
  },
  {
    id: "te8",
    belief: "If I rest, I'm wasting time.",
    experiments: [
      "Take a 3-minute break and then return to one small task.",
      "Rest first, then do 2 minutes of the priority task.",
      "Track: does a short break help focus?",
    ],
    reflection: {
      question: "Result?",
      options: [
        "Rest helped me reset.",
        "No harm done.",
        "I returned with a bit more clarity.",
      ],
    },
  },
  {
    id: "te9",
    belief: "If I don't get it quickly, I'm not capable.",
    experiments: [
      "Practice for 3 minutes daily for 3 days and compare.",
      "Ask one question and notice improvement.",
      "Write one thing you learned today, even if small.",
    ],
    reflection: {
      question: "What changed?",
      options: [
        "Progress showed up gradually.",
        "Learning took repetition.",
        "I was harsher than necessary.",
      ],
    },
  },
  {
    id: "te10",
    belief: "I need to feel confident before I act.",
    experiments: [
      "Act with 'small courage' for 2 minutes anyway.",
      "Do the first step while confidence is low.",
      "Rate confidence after action (not before).",
    ],
    reflection: {
      question: "After action, how was your confidence?",
      options: [
        "A bit higher.",
        "About the same, but I did it.",
        "I learned I can move without perfect confidence.",
      ],
    },
  },
];

// 5) Quick Win (DBT/CBT)
export const quickWinPresets = [
  "I drank water.",
  "I took a 2-minute break.",
  "I sent one message I was avoiding.",
  "I cleaned one tiny area.",
  "I did one small task for 2 minutes.",
  "I took 5 slow breaths.",
  "I stepped outside for fresh air.",
  "I asked a question instead of assuming.",
  "I showed up even though it was uncomfortable.",
  "I wrote one helpful sentence to myself.",
  "I stretched my shoulders/neck.",
  "I ate something nourishing.",
  "I paused before reacting.",
  "I said no (or not now) politely.",
  "I made a small plan for tomorrow.",
  "I finished a mini-step.",
  "I noticed a thinking trap and named it.",
  "I chose 'good enough' and stopped.",
  "I did something kind for someone.",
  "I did something kind for myself.",
];

// 6) Calm Bingo (DBT)
export const calmBingoTiles = [
  "Drink a glass of water",
  "5 slow breaths",
  "Relax shoulders + jaw",
  "Look out a window for 30s",
  "Stand up and stretch",
  "Send a kind text",
  "Tidy one small thing",
  "Step outside for 2 minutes",
  "Name 3 things you can see",
  "Play one calm song",
  "Write 1 supportive sentence",
  "Wash your hands slowly",
  "Move your body for 60s",
  "Put phone down for 2 minutes",
  "Smile gently (even 10%)",
  "Choose one tiny next step",
];
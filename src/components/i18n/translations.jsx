export const translations = {
  en: {
    translation: {
      sidebar: {
        home: { name: "Home", description: "Dashboard & overview" },
        chat: { name: "Chat", description: "AI Therapist" },
        coach: { name: "Coach", description: "AI Wellness Coach" },
        mood: { name: "Mood", description: "Track your mood" },
        journal: { name: "Journal", description: "Thought records" },
        progress: { name: "Progress", description: "Track your journey" },
        exercises: { name: "Exercises", description: "CBT techniques" },
        community: { name: "Community" },
        resources: { name: "Resources" },
        settings: { name: "Settings" }
      },
      global: {
        app_name: "MindWell",
        app_tagline: "Mental Wellness App"
      },
      mobile_menu: {
        menu_title: "Menu",
        open_aria: "Open menu",
        close_aria: "Close menu"
      },
      home: {
        greeting: {
          morning: "Good morning",
          afternoon: "Good afternoon",
          evening: "Good evening"
        },
        active_goals: "Active Goals",
        journal_entries: "Journal Entries",
        error: {
          goals_load: "Couldn't load goals.",
          journal_load: "Couldn't load journal entries."
        },
        aria: {
          view_goal_details: "View goal details",
          view_journal_entry: "View journal entry",
          watch_help_video: "Watch help video",
          watch_goals_help_video: "Watch goals help video",
          watch_journal_help_video: "Watch journal help video"
        }
      },
      quick_actions: {
        title: "Quick Actions",
        recommended: { title: "Recommended for You", description: "AI-tailored suggestions" },
        ai_therapist: { title: "AI Therapist", description: "Talk to your therapist" },
        journal_thought: { title: "Journal a Thought", description: "Challenge thinking" },
        set_goal: { title: "Set a Goal", description: "Define objectives" },
        mind_games: { title: "Mind Games", description: "Quick mental exercises" },
        journeys: { title: "Journeys", description: "Curated skill paths" },
        exercises_library: { title: "Exercises Library", description: "Browse techniques" },
        video_library: { title: "Video Library", description: "Watch & learn" },
        personalized_recommendations: "Personalized Recommendations",
        aria: {
          guided_intro_video: "Guided introduction video",
          close_video: "Close video"
        }
      },
      settings: {
        page_title: "Settings",
        page_subtitle: "Manage your account and preferences",
        profile: {
          title: "Profile",
          full_name: "Full Name",
          name_placeholder: "Your name",
          email: "Email",
          email_readonly: "Email cannot be changed",
          role: "Role",
          role_admin: "Admin",
          role_user: "User",
          save_changes: "Save Changes",
          saving: "Saving..."
        },
        language: {
          title: "Language",
          description: "Choose your preferred language",
          current: "Current language",
          en: "English",
          he: "עברית (Hebrew)",
          es: "Español (Spanish)",
          fr: "Français (French)",
          de: "Deutsch (German)",
          it: "Italiano (Italian)",
          pt: "Português (Portuguese)"
        },
        theme: {
          title: "Color Theme",
          description: "Choose a visual theme that feels comfortable for you",
          default: { name: "Default", description: "Calm green & purple gradients" },
          ocean: { name: "Ocean", description: "Serene blues & teals" },
          sunset: { name: "Sunset", description: "Warm oranges & pinks" },
          forest: { name: "Forest", description: "Natural greens & earth tones" },
          lavender: { name: "Lavender", description: "Soft purples & violets" },
          minimal: { name: "Minimal", description: "Clean grays & blacks" }
        },
        dashboard_layout: {
          title: "Dashboard Layout",
          description: "Choose how your home dashboard is organized",
          default_title: "Default",
          default_description: "Balanced layout with all sections",
          compact_title: "Compact",
          compact_description: "Condensed view for quick access"
        },
        subscription: {
          title: "Subscription",
          free_trial: "Free Trial",
          active: "Active",
          description: "You're currently on a free trial. Upgrade to Premium for unlimited access to all features.",
          feature_sessions: "✓ Limited therapy sessions (5 free)",
          feature_exercises: "✓ Basic CBT exercises",
          feature_mood: "✓ Mood tracking",
          upgrade_button: "Upgrade to Premium - $9.99/month",
          premium_benefits: "Premium includes: Unlimited sessions, advanced exercises, priority support, and more."
        },
        data_privacy: {
          title: "Data & Privacy",
          retention_label: "Data Retention Policy",
          retention_description: "Choose how long your therapy records, mood entries, and journal data are kept. After this period, records may be automatically deleted.",
          retention_30_days: "30 days",
          retention_90_days: "90 days",
          retention_1_year: "1 year",
          retention_indefinite: "Keep indefinitely",
          current_setting: "Current setting: {{value}}",
          current_setting_indefinite: "Indefinite",
          current_setting_days: "{{days}} days",
          export_title: "Export Your Data",
          export_description: "Download a summary of your therapy records, mood entries, and goals as a JSON file.",
          export_button: "Export Data",
          exporting: "Exporting...",
          delete_title: "Delete All Data",
          delete_description: "Permanently remove all your therapy records, mood entries, and journal data. This action cannot be undone.",
          delete_confirm_prompt: "Are you sure? This will permanently delete all your data.",
          delete_confirm_button: "Yes, Delete All",
          deleting: "Deleting...",
          delete_button: "Delete All Data",
          cancel_button: "Cancel",
          retention_saved: "Retention setting saved",
          retention_failed: "Failed to save retention setting",
          export_success: "Data exported successfully",
          export_failed: "Failed to export data",
          delete_success: "All data cleared successfully",
          delete_failed: "Failed to delete data",
          privacy_notice: "Privacy Notice: This app does not claim HIPAA compliance. Your data is stored securely in our database and subject to our terms of service. Deletion requests are processed immediately. For questions about data handling, contact support."
        },
        notifications: {
          title: "Notifications",
          daily_reminders: "Daily Reminders",
          daily_reminders_description: "Get reminded to check in daily",
          progress_updates: "Progress Updates",
          progress_updates_description: "Weekly summary of your progress",
          goal_reminders: "Goal Reminders",
          goal_reminders_description: "Notifications about goal deadlines",
          exercise_reminders: "Exercise Reminders",
          exercise_reminders_description: "Suggested times for CBT exercises"
        },
        account: {
          title: "Account",
          logout: "Log Out"
        },
        footer: {
          need_help: "Need help?",
          contact_support: "Contact Support",
          version: "MindCare CBT Therapist · Version 1.0"
        }
      },
      common: {
        loading: "Loading...",
        retry: "Retry",
        cancel: "Cancel",
        continue: "Continue",
        return: "Return",
        close: "Close",
        dismiss: "Dismiss",
        complete: "Complete",
        close_video_aria: "Close video",
        video_not_supported: "Your browser does not support the video tag.",
        audio_not_supported: "Your browser does not support the audio element.",
        go_back_aria: "Go back",
        go_back_home_aria: "Go back to home",
        ai_label: "AI",
        you_label: "You",
        minutes_short: "min"
      },
      chat: {
        aria: {
          go_back_home: "Go back to home",
          open_conversations: "Open conversations sidebar",
          close_conversations: "Close conversations sidebar"
        },
        therapist_title: "Your Therapist",
        therapist_subtitle: "A safe space to talk",
        welcome: {
          title: "Welcome to Therapy",
          message: "This is a safe, judgment-free space. Share what's on your mind, and let's work through it together.",
          start_session: "Start Your First Session"
        },
        thinking_placeholder: "Thinking...",
        summary_prompt: {
          title: "Would you like a session summary?",
          description: "Get key takeaways, recommended exercises, and helpful resources",
          yes: "Yes, create summary",
          not_now: "Not now"
        },
        input_placeholder: "Share what's on your mind...",
        disclaimer: {
          title: "⚠️ AI Support - Not Professional Therapy",
          message: "Cannot diagnose or prescribe. Crisis? Call 988 (US) or your local emergency services.",
          strict: "Reminder: This AI cannot diagnose conditions or prescribe treatments. For medical concerns, consult a licensed professional.",
          standard: "Reminder: This is AI-assisted support, not professional therapy. Emergency situations require immediate professional help."
        },
        delete_session_failed: "Failed to delete session. Please try again.",
        confirm_delete_session: "Delete this session? This action cannot be undone.",
        daily_checkin_message: "I've completed my Daily Check-in.",
        consent: {
          lenient: {
            title: "AI Wellness Support - Lenient Mode",
            message: "This AI provides supportive conversation with minimal interruptions. It cannot diagnose, prescribe, or replace professional care. Crisis situations require immediate professional help."
          },
          standard: {
            title: "AI Wellness Support - Standard Mode",
            message: "This AI provides wellness support using evidence-based CBT principles. It is not a substitute for professional mental health care and cannot diagnose or prescribe. In crisis, contact emergency services immediately."
          },
          strict: {
            title: "AI Wellness Support - Strict Safety Mode",
            message: "This mode includes enhanced safety monitoring and frequent reminders. The AI cannot diagnose, prescribe, or handle emergencies. Professional mental health care is required for clinical concerns."
          },
          learn_more: "Learn more about safety profiles",
          understand_button: "I Understand"
        },
        risk_panel: {
          title: "We're Here to Help",
          message: "This AI cannot provide emergency support. If you're in crisis, please reach out to a professional immediately.",
          crisis_hotline_label: "Crisis Hotline:",
          crisis_hotline_number: "988 (US)",
          crisis_text_line_label: "Crisis Text Line:",
          crisis_text_line_number: "Text \"HELLO\" to 741741",
          emergency_label: "Emergency:",
          emergency_number: "911",
          return_to_chat: "Return to Chat"
        },
        conversations_list: {
          title: "Sessions",
          empty_title: "No sessions yet",
          empty_message: "Start a conversation to begin",
          session_prefix: "Session",
          delete_aria: "Delete session"
        },
        session_summary: {
          title: "Session Summary",
          key_takeaways: "Key Takeaways",
          recommended_exercises: "Recommended Exercises",
          helpful_resources: "Helpful Resources",
          reflect_button: "Reflect in Journal",
          view_exercises_button: "View All Exercises"
        }
      },
      age_gate: {
        title: "Age Verification Required",
        message: "Our AI therapy features are designed for adults 18 and older. This helps ensure we provide appropriate support and maintain safety standards.",
        teen_support_heading: "If you're under 18 and need support:",
        teen_support: {
          counselor: "• School counselor or trusted adult",
          teen_line: "• Teen Line: 1-800-852-8336 (or text TEEN to 839863)",
          crisis_text_line: "• Crisis Text Line: Text \"HOME\" to 741741"
        },
        confirm_button: "I'm 18 or Older",
        decline_button: "I'm Under 18"
      },
      age_restricted: {
        title: "Age Restricted",
        message: "Our AI-powered chat features are designed for users 18 and older. You still have access to other wellness tools like mood tracking, journaling, and exercises.",
        back_to_home: "Back to Home"
      },
      journeys: {
        page_title: "Journeys",
        page_subtitle: "Guided skill-building paths for personal growth",
        tabs: {
          available: "Available",
          in_progress: "In Progress",
          completed: "Completed"
        },
        empty_state: {
          no_available: "No journeys available right now",
          no_in_progress: "You haven't started any journeys yet",
          no_completed: "You haven't completed any journeys yet"
        },
        card: {
          days: "days",
          steps: "steps",
          progress: "Progress",
          start_journey: "Start Journey",
          view_details: "View Details"
        },
        detail: {
          what_youll_gain: "What you'll gain:",
          journey_steps: "Journey Steps",
          day: "Day",
          play_game: "Play Game",
          reflection_placeholder: "Your reflection (optional)",
          saving: "Saving...",
          mark_complete: "Mark Complete"
        }
      },
      mood_tracker: {
        page_title: "Mood Tracker",
        page_subtitle: "Track your emotional well-being and discover patterns",
        update_today: "Update Today",
        log_mood: "Log Mood",
        mood_trends: "Mood Trends",
        loading_chart: "Loading chart...",
        no_data: "No mood data yet",
        no_data_subtitle: "Start checking in daily to see trends",
        tabs: {
          overview: "Overview",
          calendar: "Calendar",
          insights: "AI Insights"
        },
        time_range: {
          "7_days": "7 days",
          "14_days": "14 days",
          "30_days": "30 days"
        },
        form: {
          title: "How are you feeling today?",
          close_aria: "Close mood entry form",
          date: "Date",
          overall_mood: "Overall Mood",
          mood_excellent: "Excellent",
          mood_good: "Good",
          mood_okay: "Okay",
          mood_low: "Low",
          mood_very_low: "Very Low",
          emotions_question: "What emotions are you feeling?",
          intensity_label: "Emotional Intensity",
          mild: "Mild",
          intense: "Intense",
          energy_level: "Energy Level",
          energy_very_low: "Very Low",
          energy_low: "Low",
          energy_moderate: "Moderate",
          energy_high: "High",
          energy_very_high: "Very High",
          sleep_quality: "Sleep Quality",
          sleep_poor: "Poor",
          sleep_fair: "Fair",
          sleep_good: "Good",
          sleep_excellent: "Excellent",
          stress_level: "Stress Level",
          relaxed: "Relaxed",
          very_stressed: "Very Stressed",
          triggers_question: "What triggered your mood today?",
          activities_question: "What did you do today?",
          notes_label: "Additional Notes",
          notes_placeholder: "Any other thoughts or observations about your day...",
          save_error: "Couldn't save. Check connection and try again.",
          saving: "Saving...",
          save_entry: "Save Entry",
          update_entry: "Update Entry"
        }
      },
      progress: {
        page_title: "Your Progress",
        page_subtitle: "Track your journey",
        page_subtitle_full: "Track your journey and celebrate your growth",
        health_wellness: "Health & Wellness",
        tabs: {
          overview: "Overview",
          achievements: "Achievements",
          rewards: "Rewards",
          mood: "Mood",
          goals: "Goals",
          exercises: "Exercises",
          health: "Health"
        },
        dashboard: {
          current_streak: "Current Streak",
          days: "days",
          points: "Points",
          badges: "Badges",
          level: "Level",
          level_prefix: "Lv.",
          avg_mood: "Avg Mood",
          trend_improving: "improving",
          trend_declining: "declining",
          trend_stable: "stable",
          goals_achieved: "Goals Achieved",
          active: "active",
          charts: {
            mood_trends: "Mood Trends (Last 30 Days)",
            exercise_by_category: "Exercise by Category",
            journal_consistency: "Journal Consistency",
            goal_progress: "Goal Progress"
          }
        }
      },
      mind_games: {
        page_title: "Mind Games",
        page_subtitle: "Interactive CBT & DBT skills practice",
        go_back_aria: "Go back",
        close_aria: "Close",
        recommended_title: "Recommended For You",
        recommended_subtitle: "Based on your activity, we think you'll enjoy these:",
        thought_quiz: {
          score: "Score",
          next_question: "Next Question"
        },
        games: {
          thought_quiz: { title: "Thought Quiz", description: "Spot the thinking trap in a quick example." },
          reframe_pick: { title: "Reframe Pick", description: "Choose the most balanced alternative thought." },
          value_compass: { title: "Value Compass", description: "Pick a value, then choose one tiny action." },
          tiny_experiment: { title: "Tiny Experiment", description: "Test a belief with a 2-minute experiment." },
          quick_win: { title: "Quick Win", description: "Log one tiny win and build momentum." },
          calm_bingo: { title: "Calm Bingo", description: "Mark 2 squares to complete a mini round." },
          dbt_stop: { title: "STOP Skill", description: "Pause, breathe, and choose a wise next step." },
          opposite_action: { title: "Opposite Action", description: "Match actions to goals, not moods." },
          urge_surfing: { title: "Urge Surfing", description: "Ride an urge like a wave for 60 seconds." },
          worry_time: { title: "Worry Time", description: "Park worries now, schedule them later." },
          evidence_balance: { title: "Evidence Balance", description: "Weigh evidence and find a fair conclusion." },
          defusion_cards: { title: "Defusion Cards", description: "Unhook from thoughts in a playful way." },
          tipp_skills: { title: "TIPP Skills", description: "Change body chemistry fast to reduce intensity." },
          accepts: { title: "ACCEPTS", description: "Distract from overwhelming emotions effectively." },
          willing_hands: { title: "Willing Hands", description: "Body-based acceptance practice." },
          half_smile: { title: "Half Smile", description: "Shift emotions through gentle facial expression." },
          improve: { title: "IMPROVE", description: "Improve the moment in crisis." },
          leaves_on_stream: { title: "Leaves on Stream", description: "Watch thoughts float by without grabbing them." },
          expansion: { title: "Expansion", description: "Make room for difficult emotions." },
          values_check: { title: "Values Check", description: "Quick alignment check with your values." },
          pros_and_cons: { title: "Pros & Cons", description: "Wise decision-making in crisis." },
          check_the_facts: { title: "Check the Facts", description: "Does your emotion fit the situation?" },
          self_soothe: { title: "Self-Soothe 5 Senses", description: "Comfort yourself with sensory experiences." },
          mountain_meditation: { title: "Mountain Meditation", description: "Embody stability and groundedness." }
        },
        content: {
          thought_quiz: {
            items: [
              { prompt: "If I don't do this perfectly, I'm a total failure.", options: ["All-or-nothing thinking", "Mind reading", "Catastrophizing", "Discounting the positive"], explanation: "This treats performance as a strict pass/fail label instead of a spectrum." },
              { prompt: "They haven't replied yet, so they must be upset with me.", options: ["Emotional reasoning", "Mind reading", "Labeling", "Overgeneralization"], explanation: "You're assuming you know what they think without clear evidence." },
              { prompt: "If I make one mistake, everything will fall apart.", options: ["Catastrophizing", "Personalization", "Should statements", "Mental filter"], explanation: "This jumps to the worst-case outcome and treats it as likely." },
              { prompt: "I had an awkward moment today. I always mess things up.", options: ["Overgeneralization", "Mind reading", "Fortune telling", "Disqualifying the positive"], explanation: "One moment gets turned into a sweeping rule about your whole life." },
              { prompt: "I feel anxious, so something bad must be about to happen.", options: ["Emotional reasoning", "Should statements", "Labeling", "Black-and-white thinking"], explanation: "Feelings are treated like facts, even when they're just signals." },
              { prompt: "My friend sounded quiet. It's probably my fault.", options: ["Personalization", "Catastrophizing", "Fortune telling", "Magnification"], explanation: "You're taking responsibility for something that may have many causes." },
              { prompt: "I should be more productive all the time.", options: ["Should statements", "Mental filter", "Mind reading", "Overgeneralization"], explanation: "Rigid rules ('should') create pressure and ignore real human limits." },
              { prompt: "One person criticized me, so I'm probably not good at this.", options: ["Labeling", "Disqualifying the positive", "Magnification", "All-or-nothing thinking"], explanation: "A single critique gets blown up and outweighs the full picture." },
              { prompt: "I did well, but it doesn't count because it was easy.", options: ["Discounting the positive", "Fortune telling", "Personalization", "Catastrophizing"], explanation: "You're dismissing real effort and progress instead of acknowledging it." },
              { prompt: "Everyone noticed my mistake. They must think I'm incompetent.", options: ["Mind reading", "Mental filter", "Emotional reasoning", "Should statements"], explanation: "You're guessing others' judgments without checking the evidence." },
              { prompt: "If I try and it's uncomfortable, that means it's wrong for me.", options: ["Emotional reasoning", "Overgeneralization", "Labeling", "Disqualifying the positive"], explanation: "Discomfort can be part of growth; it doesn't automatically mean danger." },
              { prompt: "I didn't meet my goal today, so I'm never going to change.", options: ["Fortune telling", "Catastrophizing", "Overgeneralization", "All-or-nothing thinking"], explanation: "A single day becomes a permanent prediction, ignoring gradual progress." }
            ],
            advanced: [
              { prompt: "I received constructive feedback, but all I can think about is the one negative comment buried in it.", options: ["Mental filter", "Overgeneralization", "Personalization", "Emotional reasoning"], explanation: "You're filtering out the positive and focusing only on the negative detail." },
              { prompt: "If I set boundaries, people will see me as selfish and abandon me.", options: ["Fortune telling + labeling", "Mind reading + catastrophizing", "Should statements", "Emotional reasoning"], explanation: "This combines mind reading (knowing what they'll think) with catastrophizing (predicting abandonment)." },
              { prompt: "I didn't get the promotion, which proves I'm not competent enough, and I never will be.", options: ["Fortune telling + labeling", "All-or-nothing thinking", "Discounting the positive", "Personalization"], explanation: "This creates a fixed label and predicts a permanent future based on one event." },
              { prompt: "My colleague was curt with me today. I must have done something to upset them, and now the whole team probably thinks poorly of me.", options: ["Personalization + magnification + mind reading", "Catastrophizing + overgeneralization", "Mental filter + should statements", "Emotional reasoning"], explanation: "This combines taking personal blame, blowing up the impact, and assuming you know what others think." },
              { prompt: "I feel uncertain about this decision, which means I'm making the wrong choice.", options: ["Emotional reasoning", "Fortune telling", "All-or-nothing thinking", "Catastrophizing"], explanation: "The feeling of uncertainty is treated as evidence of a bad decision, not just a normal part of choosing." }
            ]
          },
          reframe_pick: {
            items: [
              { situation: "You sent a message and haven't heard back.", automatic_thought: "They're ignoring me because I said something wrong.", choices: ["They're busy. I can wait or follow up later in a calm way.", "They definitely hate me now and I ruined everything.", "I'll never message anyone again so I don't risk feeling this."], why: "It considers multiple possibilities and suggests a reasonable next step." },
              { situation: "You made a small mistake at work/school.", automatic_thought: "I'm terrible at this.", choices: ["One mistake is normal. I can fix it and learn for next time.", "I'm the worst person here. I should quit immediately.", "I'll pretend it didn't happen and avoid anything challenging."], why: "It's specific, realistic, and focused on learning rather than global labels." },
              { situation: "A friend was quiet during your hangout.", automatic_thought: "They must be annoyed with me.", choices: ["I don't know the reason. I can check in kindly or give space.", "It's my fault. I always ruin friendships.", "I should cut them off before they reject me first."], why: "It avoids mind reading and leaves room for a gentle check-in." },
              { situation: "You didn't finish a task you planned.", automatic_thought: "I'm so lazy.", choices: ["I struggled today. I can pick one small next step and restart.", "I'm hopeless. I'll never be consistent at anything.", "I should punish myself until I finally get disciplined."], why: "It acknowledges difficulty and moves toward a doable, compassionate action." },
              { situation: "You feel anxious before an event.", automatic_thought: "This anxiety means the event will go badly.", choices: ["Anxiety is a feeling, not a prediction. I can go anyway and cope.", "Anxiety means danger. I must avoid this at all costs.", "I need to feel zero anxiety before I'm allowed to show up."], why: "It separates feelings from forecasts and supports valued action." },
              { situation: "Someone gave you feedback.", automatic_thought: "I'm not good enough.", choices: ["Feedback can help me improve. I can take what's useful and grow.", "They think I'm incompetent and everyone agrees with them.", "I'll stop trying so no one can judge me again."], why: "It keeps self-worth intact while allowing improvement." },
              { situation: "You didn't get invited to something.", automatic_thought: "Nobody likes me.", choices: ["There could be many reasons. I can reach out or plan something else.", "This proves I'm unlikable and always will be.", "I'll isolate so I don't have to feel left out again."], why: "It avoids overgeneralization and offers flexible, constructive options." },
              { situation: "You're learning a new skill and feel behind.", automatic_thought: "If I'm not fast, I'm not meant for this.", choices: ["Skills grow with practice. I can improve step by step.", "If I'm not immediately great, it's a waste of time.", "I should compare myself nonstop to prove I'm failing."], why: "It supports growth mindset and realistic learning curves." }
            ]
          },
          value_compass: {
            values: [
              { value: "Family", actions: ["Send a kind message to a family member.", "Do one small helpful thing at home.", "Plan 10 minutes of quality time today."] },
              { value: "Health", actions: ["Drink a glass of water right now.", "Take a 2-minute stretch break.", "Step outside for fresh air for 3 minutes."] },
              { value: "Growth", actions: ["Learn one tiny thing (watch/read for 2 minutes).", "Practice a skill for 3 minutes.", "Write one sentence about what you want to improve."] },
              { value: "Friendship", actions: ["Check in with a friend with a simple hello.", "Reply to a message you've been postponing.", "Share one genuine compliment today."] },
              { value: "Courage", actions: ["Do the smallest version of the scary step (10%).", "Name what you fear in one sentence, then proceed anyway.", "Ask one small question instead of assuming."] },
              { value: "Calm", actions: ["Take 5 slow breaths (count 4 in / 4 out).", "Relax your shoulders and jaw for 20 seconds.", "Put your phone down for 2 minutes and reset."] },
              { value: "Creativity", actions: ["Write a silly 1-line idea (no judgment).", "Take a photo of something interesting around you.", "Doodle for 60 seconds."] },
              { value: "Purpose", actions: ["Choose one task that matters and do 2 minutes of it.", "Write your 'why' in 1 sentence.", "Remove one small obstacle from your path today."] }
            ]
          },
          tiny_experiment: {
            items: [
              { belief: "If I ask for help, people will think I'm weak.", experiments: ["Ask one small, specific question and observe the response.", "Ask a trusted person for a tiny favor and note what happens.", "Ask for clarification once instead of guessing."], reflection_question: "What happened?", reflection_options: ["It went better than I feared.", "It was neutral / fine.", "It was uncomfortable, but I handled it."] },
              { belief: "If I say no, people will dislike me.", experiments: ["Say no to a low-stakes request using one polite sentence.", "Offer an alternative (not now / later) instead of automatic yes.", "Pause for 5 seconds before agreeing to anything."], reflection_question: "What did you notice?", reflection_options: ["People respected it.", "Nothing dramatic happened.", "It felt hard, and I survived it."] },
              { belief: "If I make a mistake, it will be a disaster.", experiments: ["Do a small task imperfectly on purpose (10%) and observe outcomes.", "Share a minor correction without apologizing excessively.", "Let one tiny typo exist and see what actually happens."], reflection_question: "What was the outcome?", reflection_options: ["No one cared.", "It was fixable.", "It felt big in my head, smaller in reality."] },
              { belief: "If I don't feel motivated, I can't start.", experiments: ["Start for 2 minutes only, then reassess.", "Set a timer for 90 seconds and do the first step.", "Make the task 10x smaller and begin."], reflection_question: "After starting, how was it?", reflection_options: ["Easier than expected.", "Still hard, but possible.", "I gained a little momentum."] },
              { belief: "If someone is quiet, it must be about me.", experiments: ["Write 3 alternative explanations before reacting.", "Ask a simple check-in question instead of assuming.", "Wait 30 minutes and see if new info appears."], reflection_question: "What did you learn?", reflection_options: ["I didn't have enough evidence.", "There were other explanations.", "Checking in was helpful."] },
              { belief: "I have to do everything right to be accepted.", experiments: ["Share one imperfect draft and request feedback.", "Do one task at 'good enough' level and stop.", "Let someone else choose one detail instead of controlling it."], reflection_question: "How did it go?", reflection_options: ["Good enough worked.", "Acceptance didn't depend on perfection.", "I felt discomfort, and it passed."] },
              { belief: "If I feel anxious, I shouldn't go.", experiments: ["Go for 5 minutes only and reassess.", "Bring one coping tool (water / music / breathing).", "Rate anxiety 0–10 before and after to compare."], reflection_question: "What did you notice?", reflection_options: ["Anxiety changed over time.", "I could function with anxiety present.", "Avoidance wasn't necessary."] },
              { belief: "If I rest, I'm wasting time.", experiments: ["Take a 3-minute break and then return to one small task.", "Rest first, then do 2 minutes of the priority task.", "Track: does a short break help focus?"], reflection_question: "Result?", reflection_options: ["Rest helped me reset.", "No harm done.", "I returned with a bit more clarity."] },
              { belief: "If I don't get it quickly, I'm not capable.", experiments: ["Practice for 3 minutes daily for 3 days and compare.", "Ask one question and notice improvement.", "Write one thing you learned today, even if small."], reflection_question: "What changed?", reflection_options: ["Progress showed up gradually.", "Learning took repetition.", "I was harsher than necessary."] },
              { belief: "I need to feel confident before I act.", experiments: ["Act with 'small courage' for 2 minutes anyway.", "Do the first step while confidence is low.", "Rate confidence after action (not before)."], reflection_question: "After action, how was your confidence?", reflection_options: ["A bit higher.", "About the same, but I did it.", "I learned I can move without perfect confidence."] }
            ]
          },
          quick_win: {
            presets: ["I drank water.", "I took a 2-minute break.", "I sent one message I was avoiding.", "I cleaned one tiny area.", "I did one small task for 2 minutes.", "I took 5 slow breaths.", "I stepped outside for fresh air.", "I asked a question instead of assuming.", "I showed up even though it was uncomfortable.", "I wrote one helpful sentence to myself.", "I stretched my shoulders/neck.", "I ate something nourishing.", "I paused before reacting.", "I said no (or not now) politely.", "I made a small plan for tomorrow.", "I finished a mini-step.", "I noticed a thinking trap and named it.", "I chose 'good enough' and stopped.", "I did something kind for someone.", "I did something kind for myself."]
          },
          calm_bingo: {
            tiles: ["Drink a glass of water", "5 slow breaths", "Relax shoulders + jaw", "Look out a window for 30s", "Stand up and stretch", "Send a kind text", "Tidy one small thing", "Step outside for 2 minutes", "Name 3 things you can see", "Play one calm song", "Write 1 supportive sentence", "Wash your hands slowly", "Move your body for 60s", "Put phone down for 2 minutes", "Smile gently (even 10%)", "Choose one tiny next step"]
          },
          dbt_stop: {
            prompts: [
              { trigger: "You feel a strong urge to react immediately.", steps: [{ key: "S", label: "Stop", text: "Pause. Don't act yet." }, { key: "T", label: "Take a step back", text: "Breathe once. Create a tiny space." }, { key: "O", label: "Observe", text: "Notice: thoughts, feelings, body signals." }, { key: "P", label: "Proceed mindfully", text: "Choose one wise next step." }], next_steps: ["Send a calm, short reply (or wait 10 minutes).", "Ask one clarifying question.", "Do one small grounding action, then decide."] },
              { trigger: "You're about to avoid something important.", steps: [{ key: "S", label: "Stop", text: "Pause avoidance for a moment." }, { key: "T", label: "Take a step back", text: "Exhale slowly and reset posture." }, { key: "O", label: "Observe", text: "What are you afraid will happen?" }, { key: "P", label: "Proceed mindfully", text: "Pick the smallest brave step (10%)." }], next_steps: ["Do 2 minutes of the first step only.", "Make it easier: reduce scope by 50%.", "Text someone: 'I'm starting now—wish me luck.'"] },
              { trigger: "You feel criticized and want to defend yourself fast.", steps: [{ key: "S", label: "Stop", text: "Hold back the instant response." }, { key: "T", label: "Take a step back", text: "Breathe and relax your jaw." }, { key: "O", label: "Observe", text: "What's the goal: to win or to repair?" }, { key: "P", label: "Proceed mindfully", text: "Respond to the goal, not the heat." }], next_steps: ["Say: 'Let me think about that for a moment.'", "Reflect back what you heard in one sentence.", "Ask: 'What would be most helpful right now?'"] },
              { trigger: "You're scrolling/doomscrolling and feel stuck.", steps: [{ key: "S", label: "Stop", text: "Pause scrolling now." }, { key: "T", label: "Take a step back", text: "Put phone down for one breath." }, { key: "O", label: "Observe", text: "Name the feeling in one word." }, { key: "P", label: "Proceed mindfully", text: "Choose one small helpful action." }], next_steps: ["Drink water and stretch for 30 seconds.", "Open a window or step outside for 1 minute.", "Write one tiny next step and do it."] }
            ]
          },
          opposite_action: {
            items: [
              { emotion: "Anxiety", urge: "Avoid / escape", opposite: "Approach gently", choices: ["Show up for 5 minutes, then reassess.", "Do the smallest first step (10%).", "Ask one question instead of avoiding."], note: "Opposite action is for emotions that don't fit the facts or are too intense." },
              { emotion: "Sadness", urge: "Withdraw / isolate", opposite: "Connect or activate", choices: ["Send one simple 'hey' message.", "Step outside for 2 minutes.", "Do a tiny task to build momentum."], note: "Small activation often shifts mood more than waiting for motivation." },
              { emotion: "Anger", urge: "Attack / argue", opposite: "Be gentle and effective", choices: ["Lower voice + slow down your words.", "State one need clearly without blame.", "Take a 2-minute pause before replying."], note: "Opposite action aims for effectiveness, not 'winning.'" },
              { emotion: "Shame", urge: "Hide / disappear", opposite: "Small reveal + self-respect", choices: ["Share a tiny truth with a safe person.", "Stand tall, breathe, and stay present for 30s.", "Do one value-based action anyway."], note: "Shame shrinks with safe connection and self-respect actions." },
              { emotion: "Guilt (too much)", urge: "Over-apologize / self-punish", opposite: "Repair effectively", choices: ["Apologize once, then propose one repair step.", "Ask what would help and listen.", "Stop repeating apologies; act instead."], note: "Effective repair beats endless self-blame." },
              { emotion: "Fear of rejection", urge: "People-please / over-text", opposite: "Balanced boundary", choices: ["Send one message, then wait.", "Do one self-caring action while you wait.", "Remind yourself: 'I can handle uncertainty.'"], note: "Opposite action builds tolerance for uncertainty." }
            ]
          },
          urge_surfing: {
            beginner: [
              { title: "Ride the wave (60 seconds)", steps: ["Name the urge: 'I'm having the urge to ____.'", "Rate intensity 0–10.", "Notice where it lives in the body.", "Breathe slowly for 5 breaths.", "Rate intensity again. (Urges rise and fall.)"], finish_choices: ["Delay 10 minutes (set a timer).", "Do a 2-minute replacement action.", "Ask for support (one message)."] },
              { title: "Surf + redirect", steps: ["Name the urge without judging it.", "Imagine it as a wave—rising, cresting, passing.", "Relax shoulders and jaw.", "Pick one value-based micro-action."], finish_choices: ["Take 10% of a helpful step.", "Move your body for 60 seconds.", "Drink water + reset posture."] }
            ],
            advanced: [
              { title: "Surf independently (90 seconds)", steps: ["Name and rate the urge (0-10).", "Locate it in your body.", "Breathe with it for 10 breaths.", "Notice the peak and decline.", "Rate it again."], finish_choices: ["Delay 20 minutes and reassess.", "Do the opposite action for 5 minutes.", "Journal about what you noticed."] },
              { title: "Surf + value-based action", steps: ["Acknowledge the urge without judgment.", "Watch it like a scientist observing data.", "Let it peak naturally.", "Choose one value-aligned micro-step."], finish_choices: ["Do the tiny step immediately.", "Practice the skill again in 1 hour.", "Note what worked for next time."] }
            ]
          },
          worry_time: {
            items: [
              { worry: "What if I mess up tomorrow?", park_it: "I'll think about this during Worry Time at 6:00 PM for 10 minutes.", tiny_now: ["Write one small preparation step.", "Do 2 minutes of that step now.", "Then return to the present task."] },
              { worry: "What if they're mad at me?", park_it: "I'll revisit this at 7:00 PM for 10 minutes, then decide on a calm follow-up.", tiny_now: ["List 2 alternative explanations.", "Wait 30 minutes before acting.", "Do one calming reset (5 breaths)."] },
              { worry: "What if something bad happens?", park_it: "I'll schedule Worry Time at 5:30 PM for 10 minutes and focus on what's controllable.", tiny_now: ["Name 1 thing you can control today.", "Do the smallest step toward it.", "Return attention to the room."] },
              { worry: "I'm behind; I'll never catch up.", park_it: "I'll worry about this at 6:30 PM for 10 minutes and make a realistic plan.", tiny_now: ["Pick the single next step.", "Work 2 minutes on it.", "Stop and acknowledge progress."] },
              { worry: "What if I disappoint people?", park_it: "I'll revisit this at 8:00 PM for 10 minutes and choose a value-based action.", tiny_now: ["Ask: 'What matters to me here?'", "Choose one respectful sentence/boundary.", "Delay responding for 10 minutes."] },
              { worry: "What if I can't handle it?", park_it: "I'll schedule Worry Time at 7:30 PM for 10 minutes and review coping options.", tiny_now: ["Write 1 coping tool you already use.", "Use it for 60 seconds.", "Continue with the next small task."] }
            ]
          },
          evidence_balance: {
            items: [
              { thought: "I always mess things up.", evidence_for: ["I made a mistake recently.", "I remember failures more than successes."], evidence_against: ["I've done many things well.", "One mistake doesn't define 'always'."], balanced_conclusion: "I've made mistakes and also succeeded. I can learn and improve." },
              { thought: "They don't like me.", evidence_for: ["They replied late once.", "They were quiet last time."], evidence_against: ["They've been friendly before.", "There are many reasons for silence."], balanced_conclusion: "I don't know their thoughts. I can check in calmly or wait for more info." },
              { thought: "If I'm anxious, I can't cope.", evidence_for: ["Anxiety feels intense.", "I want to escape when anxious."], evidence_against: ["I've coped with anxiety before.", "Anxiety rises and falls."], balanced_conclusion: "Anxiety is uncomfortable but manageable. I can act while it's present." },
              { thought: "I'm not improving.", evidence_for: ["Progress feels slow.", "I compare myself to others."], evidence_against: ["I've taken small steps.", "Learning is gradual."], balanced_conclusion: "Progress can be slow and real. Small steps still count." },
              { thought: "I must do everything perfectly.", evidence_for: ["I value quality.", "Perfection sometimes prevents criticism."], evidence_against: ["Perfect isn't required to succeed.", "Good-enough frees time and reduces stress."], balanced_conclusion: "I can aim for quality while allowing 'good enough' when it's effective." },
              { thought: "If I say no, I'll be rejected.", evidence_for: ["I worry about disappointing people.", "I've had conflict before."], evidence_against: ["Many people respect boundaries.", "I can say no politely and offer alternatives."], balanced_conclusion: "Saying no respectfully protects relationships and my wellbeing." }
            ]
          },
          defusion_cards: {
            cards: [
              { thought: "I'm not good enough.", defuse_lines: ["I'm having the thought that I'm not good enough.", "Thanks, mind. Interesting story.", "This is a thought, not a fact."] },
              { thought: "Something bad will happen.", defuse_lines: ["I'm noticing a 'danger prediction' thought.", "My mind is trying to protect me.", "I can take one small step anyway."] },
              { thought: "They're judging me.", defuse_lines: ["I'm having the thought they're judging me.", "I can't read minds. I can act on my values.", "Let this thought ride in the back seat."] },
              { thought: "I can't handle this feeling.", defuse_lines: ["I'm noticing the thought 'I can't handle it'.", "Feelings are waves; they change.", "I can make room and keep going."] },
              { thought: "I must fix everything now.", defuse_lines: ["There's the 'urgent fixer' thought.", "I can pause and choose one wise next step.", "Slow is smooth; smooth is fast."] },
              { thought: "If it's hard, I should quit.", defuse_lines: ["I'm having the thought 'quit'.", "Hard can mean 'new', not 'wrong'.", "I can do the smallest version (10%)."] }
            ]
          },
          tipp_skills: {
            situation: "Your emotions are at 8/10 or higher and you need to come down fast.",
            skills: [
              { letter: "T", name: "Temperature", description: "Cold water on face, ice cube, cold shower" },
              { letter: "I", name: "Intense exercise", description: "Run, jump, push-ups for 60 seconds" },
              { letter: "P", name: "Paced breathing", description: "Breathe out longer than in (4 in / 6 out)" },
              { letter: "P", name: "Paired muscle relaxation", description: "Tense then release muscle groups" }
            ],
            actions: ["Splash cold water on your face for 30 seconds.", "Do 20 jumping jacks right now.", "Breathe: 4 in, hold 4, 6 out—repeat 5 times."]
          },
          accepts: {
            items: [
              { letter: "A", name: "Activities", description: "Do something engaging", action: "Watch a 5-minute video, play a quick game, or clean one surface." },
              { letter: "C", name: "Contributing", description: "Help someone else", action: "Send a kind message, do one helpful thing, or share something useful." },
              { letter: "C", name: "Comparisons", description: "Compare to when you coped before", action: "Remember: You've survived 100% of your worst days so far." },
              { letter: "E", name: "Emotions", description: "Create a different emotion", action: "Watch something funny, listen to upbeat music, or read something calming." },
              { letter: "P", name: "Pushing away", description: "Mentally put the situation aside", action: "Imagine putting the problem in a box on a shelf for later." },
              { letter: "T", name: "Thoughts", description: "Fill your mind with other thoughts", action: "Count backwards from 100 by 7s, list countries A-Z, or describe the room." },
              { letter: "S", name: "Sensations", description: "Create strong physical sensations", action: "Hold ice, take a hot/cold shower, or squeeze a stress ball hard." }
            ]
          },
          improve: {
            items: [
              { letter: "I", name: "Imagery", description: "Visualize a peaceful or safe place", quick_action: "Close your eyes. Picture a place you feel calm (real or imagined)." },
              { letter: "M", name: "Meaning", description: "Find purpose in the pain", quick_action: "Ask: What can I learn? How might this help me grow?" },
              { letter: "P", name: "Prayer", description: "Connect to something larger", quick_action: "Say a phrase that grounds you or ask for support from your values/beliefs." },
              { letter: "R", name: "Relaxation", description: "Relax your body", quick_action: "Tense and release: shoulders, jaw, hands. Breathe slowly." },
              { letter: "O", name: "One thing in the moment", description: "Focus fully on one small task", quick_action: "Pick one action: wash a dish, water a plant, fold one item." },
              { letter: "V", name: "Vacation", description: "Take a brief mental break", quick_action: "Give yourself 10 minutes off from the problem. Set a timer." },
              { letter: "E", name: "Encouragement", description: "Be your own cheerleader", quick_action: "Say: 'I can handle this. I've done hard things before.'" }
            ]
          },
          self_soothe: {
            senses: [
              { sense: "Vision", actions: ["Look at nature or a calming image.", "Watch clouds or water move.", "Light a candle and watch the flame."] },
              { sense: "Hearing", actions: ["Listen to calming music or nature sounds.", "Play a song that makes you feel safe.", "Listen to the sound of rain or wind."] },
              { sense: "Smell", actions: ["Smell something pleasant (lotion, coffee, flowers).", "Light a scented candle or incense.", "Take a deep breath of fresh air."] },
              { sense: "Taste", actions: ["Eat something you enjoy slowly.", "Savor a piece of chocolate or tea.", "Notice the flavors and textures."] },
              { sense: "Touch", actions: ["Hold something soft (blanket, pet).", "Take a warm shower or bath.", "Massage your hands with lotion."] }
            ]
          }
        }
      },
      exercises: {
        page_title: "Exercises Library",
        page_subtitle: "Practice CBT techniques",
        page_subtitle_full: "Browse and practice evidence-based CBT techniques",
        loading: "Loading exercises...",
        go_back_aria: "Go back",
        ai_plan: "AI Practice Plan",
        favorites: "Favorites",
        search_placeholder: "Search exercises...",
        empty_state: {
          favorites_title: "No favorites yet",
          no_results_title: "No exercises found",
          favorites_message: "Mark exercises as favorites to see them here",
          search_message: "Try adjusting your search or filters",
          no_exercises_message: "No exercises available"
        },
        library: {
          flexible: "Flexible"
        },
        categories: {
          all: "All",
          breathing: "Breathing",
          grounding: "Grounding",
          cognitive: "Cognitive",
          behavioral: "Behavioral",
          mindfulness: "Mindfulness",
          exposure: "Exposure",
          sleep: "Sleep",
          relationships: "Relationships",
          stress: "Stress Management"
        },
        detail: {
          untitled_exercise: "Untitled Exercise",
          duration_options_suffix: "min options",
          minutes_suffix: "minutes",
          video_label: "Video",
          tabs: {
            overview: "Overview",
            practice: "Practice",
            audio: "Audio",
            benefits: "Benefits",
            tips: "Tips"
          },
          about: "About This Exercise",
          guided_visualization: "Guided Visualization",
          video_demonstration: "Video Demonstration",
          helps_with: "Helps With",
          guided_audio: "Guided Audio",
          guided_audio_description: "Follow along with professionally narrated audio guidance for this exercise.",
          step_by_step_guide: "Step-by-Step Guide",
          step_duration: "Duration: {{seconds}} seconds",
          instructions: "Instructions",
          choose_duration: "Choose Duration",
          key_benefits: "Key Benefits",
          default_benefits: "This exercise helps improve mental well-being, reduce stress, and enhance emotional regulation.",
          helpful_tips: "Helpful Tips",
          default_tips: "Practice regularly for best results. Find a quiet space, start slowly, and be patient with yourself.",
          your_progress: "Your Progress",
          times_completed: "Times Completed",
          minutes_practiced: "Minutes Practiced",
          last_practiced: "Last practiced: {{date}}",
          completed_message: "Exercise Completed!",
          mark_as_complete: "Mark as Complete"
        }
      }
    }
  },
  he: {
    translation: {
      sidebar: {
        home: { name: "בית", description: "לוח בקרה וסקירה" },
        chat: { name: "צ'אט", description: "מטפל בינה מלאכותית" },
        coach: { name: "מאמן", description: "מאמן רווחה" },
        mood: { name: "מצב רוח", description: "עקבו אחר מצב הרוח" },
        journal: { name: "יומן", description: "רשומות מחשבה" },
        progress: { name: "התקדמות", description: "עקבו אחר המסע" },
        exercises: { name: "תרגילים", description: "טכניקות CBT" },
        community: { name: "קהילה" },
        resources: { name: "משאבים" },
        settings: { name: "הגדרות" }
      },
      global: {
        app_name: "MindWell",
        app_tagline: "אפליקציית בריאות נפש"
      },
      mobile_menu: {
        menu_title: "תפריט",
        open_aria: "פתח תפריט",
        close_aria: "סגור תפריט"
      },
      home: {
        greeting: {
          morning: "בוקר טוב",
          afternoon: "אחר הצהריים טובים",
          evening: "ערב טוב"
        },
        active_goals: "מטרות פעילות",
        journal_entries: "רשומות יומן",
        error: {
          goals_load: "לא ניתן לטעון מטרות.",
          journal_load: "לא ניתן לטעון רשומות יומן."
        },
        aria: {
          view_goal_details: "הצג פרטי מטרה",
          view_journal_entry: "הצג רשומת יומן",
          watch_help_video: "צפה בוידאו עזרה",
          watch_goals_help_video: "צפה בוידאו עזרה למטרות",
          watch_journal_help_video: "צפה בוידאו עזרה ליומן"
        }
      },
      quick_actions: {
        title: "פעולות מהירות",
        recommended: { title: "מומלץ עבורך", description: "הצעות מותאמות אישית" },
        ai_therapist: { title: "מטפל AI", description: "שוחחו עם המטפל" },
        journal_thought: { title: "רשמו מחשבה", description: "אתגרו חשיבה" },
        set_goal: { title: "הגדירו מטרה", description: "הגדירו יעדים" },
        mind_games: { title: "משחקי מוח", description: "תרגילים מנטליים מהירים" },
        journeys: { title: "מסעות", description: "מסלולי מיומנות מאורגנים" },
        exercises_library: { title: "ספריית תרגילים", description: "עיינו בטכניקות" },
        video_library: { title: "ספריית וידאו", description: "צפו ולמדו" },
        personalized_recommendations: "המלצות מותאמות אישית",
        aria: {
          guided_intro_video: "סרטון הדרכה מודרך",
          close_video: "סגור וידאו"
        }
      },
      settings: {
        page_title: "הגדרות",
        page_subtitle: "נהלו את החשבון וההעדפות שלכם",
        profile: {
          title: "פרופיל",
          full_name: "שם מלא",
          name_placeholder: "השם שלך",
          email: "אימייל",
          email_readonly: "לא ניתן לשנות אימייל",
          role: "תפקיד",
          role_admin: "מנהל",
          role_user: "משתמש",
          save_changes: "שמרו שינויים",
          saving: "שומר..."
        },
        language: {
          title: "שפה",
          description: "בחרו את השפה המועדפת עליכם",
          current: "שפה נוכחית",
          en: "English (אנגלית)",
          he: "עברית (Hebrew)",
          es: "Español (ספרדית)",
          fr: "Français (צרפתית)",
          de: "Deutsch (גרמנית)",
          it: "Italiano (איטלקית)",
          pt: "Português (פורטוגזית)"
        },
        theme: {
          title: "ערכת צבעים",
          description: "בחרו ערכת צבעים שמרגישה נוחה עבורכם",
          default: { name: "ברירת מחדל", description: "גרדיאנטים ירוקים וסגולים רגועים" },
          ocean: { name: "אוקיינוס", description: "כחולים ותכלתים שלווים" },
          sunset: { name: "שקיעה", description: "כתומים וורודים חמים" },
          forest: { name: "יער", description: "ירוקים טבעיים וגווני אדמה" },
          lavender: { name: "לבנדר", description: "סגולים וסיגליים רכים" },
          minimal: { name: "מינימלי", description: "אפורים ושחורים נקיים" }
        },
        dashboard_layout: {
          title: "פריסת לוח בקרה",
          description: "בחרו כיצד לוח הבקרה הביתי מאורגן",
          default_title: "ברירת מחדל",
          default_description: "פריסה מאוזנת עם כל הסעיפים",
          compact_title: "דחוס",
          compact_description: "תצוגה דחוסה לגישה מהירה"
        },
        subscription: {
          title: "מנוי",
          free_trial: "ניסיון חינם",
          active: "פעיל",
          description: "אתם כרגע בתקופת ניסיון חינם. שדרגו ל-Premium לגישה בלתי מוגבלת לכל התכונות.",
          feature_sessions: "✓ מפגשי טיפול מוגבלים (5 חינם)",
          feature_exercises: "✓ תרגילי CBT בסיסיים",
          feature_mood: "✓ מעקב אחר מצב רוח",
          upgrade_button: "שדרגו ל-Premium - $9.99/חודש",
          premium_benefits: "Premium כולל: מפגשים ללא הגבלה, תרגילים מתקדמים, תמיכה עדיפה, ועוד."
        },
        data_privacy: {
          title: "נתונים ופרטיות",
          retention_label: "מדיניות שמירת נתונים",
          retention_description: "בחרו כמה זמן רשומות הטיפול, רשומות מצב הרוח ונתוני היומן נשמרים. לאחר תקופה זו, הרשומות עשויות להימחק אוטומטית.",
          retention_30_days: "30 ימים",
          retention_90_days: "90 ימים",
          retention_1_year: "שנה אחת",
          retention_indefinite: "שמירה ללא הגבלת זמן",
          current_setting: "הגדרה נוכחית: {{value}}",
          current_setting_indefinite: "ללא הגבלת זמן",
          current_setting_days: "{{days}} ימים",
          export_title: "ייצוא הנתונים שלכם",
          export_description: "הורידו סיכום של רשומות הטיפול, רשומות מצב רוח ומטרות כקובץ JSON.",
          export_button: "ייצוא נתונים",
          exporting: "מייצא...",
          delete_title: "מחיקת כל הנתונים",
          delete_description: "הסרה קבועה של כל רשומות הטיפול, רשומות מצב רוח ונתוני יומן. פעולה זו אינה הפיכה.",
          delete_confirm_prompt: "האם אתם בטוחים? פעולה זו תמחק לצמיתות את כל הנתונים שלכם.",
          delete_confirm_button: "כן, מחקו הכל",
          deleting: "מוחק...",
          delete_button: "מחיקת כל הנתונים",
          cancel_button: "ביטול",
          retention_saved: "הגדרת שמירה נשמרה",
          retention_failed: "שמירת ההגדרה נכשלה",
          export_success: "הנתונים יוצאו בהצלחה",
          export_failed: "ייצוא הנתונים נכשל",
          delete_success: "כל הנתונים נמחקו בהצלחה",
          delete_failed: "מחיקת הנתונים נכשלה",
          privacy_notice: "הודעת פרטיות: אפליקציה זו אינה טוענת לתאימות HIPAA. הנתונים שלכם מאוחסנים בצורה מאובטחת במאגר הנתונים שלנו וכפופים לתנאי השירות שלנו. בקשות מחיקה מעובדות באופן מיידי. לשאלות לגבי טיפול בנתונים, צרו קשר עם התמיכה."
        },
        notifications: {
          title: "התראות",
          daily_reminders: "תזכורות יומיות",
          daily_reminders_description: "קבלו תזכורת להתחבר מדי יום",
          progress_updates: "עדכוני התקדמות",
          progress_updates_description: "סיכום שבועי של ההתקדמות שלכם",
          goal_reminders: "תזכורות מטרות",
          goal_reminders_description: "התראות על מועדי יעד",
          exercise_reminders: "תזכורות תרגילים",
          exercise_reminders_description: "זמנים מוצעים לתרגילי CBT"
        },
        account: {
          title: "חשבון",
          logout: "התנתקות"
        },
        footer: {
          need_help: "צריכים עזרה?",
          contact_support: "צרו קשר עם התמיכה",
          version: "MindCare CBT Therapist · גרסה 1.0"
        }
      },
      common: {
        loading: "טוען...",
        retry: "נסו שוב",
        cancel: "ביטול",
        continue: "המשך",
        return: "חזרה",
        close: "סגירה",
        dismiss: "דחה",
        complete: "השלם",
        close_video_aria: "סגור וידאו",
        video_not_supported: "הדפדפן שלכם אינו תומך בתג הווידאו.",
        audio_not_supported: "הדפדפן שלכם אינו תומך באלמנט האודיו.",
        go_back_aria: "חזרה",
        go_back_home_aria: "חזרה לדף הבית",
        ai_label: "AI",
        you_label: "אתה",
        minutes_short: "דק'"
      },
      chat: {
        aria: {
          go_back_home: "חזרה לדף הבית",
          open_conversations: "פתח סרגל שיחות",
          close_conversations: "סגור סרגל שיחות"
        },
        therapist_title: "המטפל שלך",
        therapist_subtitle: "מרחב בטוח לשיחה",
        welcome: {
          title: "ברוכים הבאים לטיפול",
          message: "זהו מרחב בטוח וללא שיפוטיות. שתפו את מה שמטריד אתכם ונעבוד על זה ביחד.",
          start_session: "התחל את המפגש הראשון"
        },
        thinking_placeholder: "חושב...",
        summary_prompt: {
          title: "האם תרצו סיכום מפגש?",
          description: "קבלו מסקנות מרכזיות, תרגילים מומלצים ומשאבים מועילים",
          yes: "כן, צור סיכום",
          not_now: "לא עכשיו"
        },
        input_placeholder: "שתפו מה עובר לכם בראש...",
        disclaimer: {
          title: "⚠️ תמיכת AI - לא טיפול מקצועי",
          message: "לא יכול לאבחן או לרשום. משבר? התקשרו 988 (ארה\"ב) או לשירותי חירום מקומיים.",
          strict: "תזכורת: AI זה אינו יכול לאבחן מצבים או לרשום טיפולים. לבעיות רפואיות, התייעצו עם מקצוען מורשה.",
          standard: "תזכורת: זוהי תמיכה בסיוע AI, לא טיפול מקצועי. מצבי חירום דורשים עזרה מקצועית מיידית."
        },
        delete_session_failed: "מחיקת המפגש נכשלה. נסו שוב.",
        confirm_delete_session: "למחוק את המפגש? פעולה זו אינה הפיכה.",
        daily_checkin_message: "השלמתי את הצ'ק-אין היומי שלי.",
        consent: {
          lenient: {
            title: "תמיכת רווחה AI - מצב מקל",
            message: "AI זה מספק שיחה תומכת עם הפרעות מינימליות. הוא אינו יכול לאבחן, לרשום או להחליף טיפול מקצועי. מצבי משבר דורשים עזרה מקצועית מיידית."
          },
          standard: {
            title: "תמיכת רווחה AI - מצב סטנדרטי",
            message: "AI זה מספק תמיכת רווחה תוך שימוש בעקרונות CBT מבוססי ראיות. זה אינו תחליף לטיפול בבריאות הנפש המקצועי ואינו יכול לאבחן או לרשום. במשבר, צרו קשר עם שירותי חירום מיד."
          },
          strict: {
            title: "תמיכת רווחה AI - מצב בטיחות מחמיר",
            message: "מצב זה כולל ניטור בטיחות משופר ותזכורות תכופות. ה-AI אינו יכול לאבחן, לרשום או לטפל בחירום. טיפול מקצועי בבריאות הנפש נדרש לדאגות קליניות."
          },
          learn_more: "למדו עוד על פרופילי בטיחות",
          understand_button: "הבנתי"
        },
        risk_panel: {
          title: "אנחנו כאן לעזור",
          message: "AI זה אינו יכול לספק תמיכת חירום. אם אתם במשבר, אנא פנו למקצוען מיידית.",
          crisis_hotline_label: "קו חם למשבר:",
          crisis_hotline_number: "988 (ארה\"ב)",
          crisis_text_line_label: "קו טקסט למשבר:",
          crisis_text_line_number: "שלחו \"HELLO\" ל-741741",
          emergency_label: "חירום:",
          emergency_number: "911",
          return_to_chat: "חזרה לצ'אט"
        },
        conversations_list: {
          title: "מפגשים",
          empty_title: "אין מפגשים עדיין",
          empty_message: "התחילו שיחה כדי להתחיל",
          session_prefix: "מפגש",
          delete_aria: "מחק מפגש"
        },
        session_summary: {
          title: "סיכום מפגש",
          key_takeaways: "מסקנות מרכזיות",
          recommended_exercises: "תרגילים מומלצים",
          helpful_resources: "משאבים מועילים",
          reflect_button: "שקף ביומן",
          view_exercises_button: "הצג את כל התרגילים"
        }
      },
      age_gate: {
        title: "נדרש אימות גיל",
        message: "תכונות הטיפול ב-AI שלנו מיועדות למבוגרים בני 18 ומעלה. זה עוזר להבטיח שאנו מספקים תמיכה מתאימה ושומרים על סטנדרטים של בטיחות.",
        teen_support_heading: "אם אתם מתחת לגיל 18 וזקוקים לתמיכה:",
        teen_support: {
          counselor: "• יועץ בבית ספר או מבוגר מהימן",
          teen_line: "• Teen Line: 1-800-852-8336 (או שלחו TEEN ל-839863)",
          crisis_text_line: "• קו טקסט למשבר: שלחו \"HOME\" ל-741741"
        },
        confirm_button: "אני בן 18 או מעלה",
        decline_button: "אני מתחת לגיל 18"
      },
      age_restricted: {
        title: "מוגבל לגיל",
        message: "תכונות הצ'אט המופעלות על ידי AI שלנו מיועדות למשתמשים בני 18 ומעלה. יש לכם עדיין גישה לכלי רווחה אחרים כמו מעקב אחר מצב רוח, כתיבת יומן ותרגילים.",
        back_to_home: "חזרה לדף הבית"
      },
      journeys: {
        page_title: "מסעות",
        page_subtitle: "מסלולי בניית מיומנויות מודרכים לצמיחה אישית",
        tabs: {
          available: "זמין",
          in_progress: "בתהליך",
          completed: "הושלם"
        },
        empty_state: {
          no_available: "אין מסעות זמינים כרגע",
          no_in_progress: "עדיין לא התחלתם מסעות",
          no_completed: "עדיין לא השלמתם מסעות"
        },
        card: {
          days: "ימים",
          steps: "צעדים",
          progress: "התקדמות",
          start_journey: "התחל מסע",
          view_details: "הצג פרטים"
        },
        detail: {
          what_youll_gain: "מה תרוויחו:",
          journey_steps: "צעדי המסע",
          day: "יום",
          play_game: "שחק משחק",
          reflection_placeholder: "ההשתקפות שלך (אופציונלי)",
          saving: "שומר...",
          mark_complete: "סמן כהושלם"
        }
      },
      mood_tracker: {
        page_title: "מעקב אחר מצב רוח",
        page_subtitle: "עקבו אחר הרווחה הרגשית שלכם וגלו דפוסים",
        update_today: "עדכן היום",
        log_mood: "רשום מצב רוח",
        mood_trends: "מגמות מצב רוח",
        loading_chart: "טוען תרשים...",
        no_data: "אין נתוני מצב רוח עדיין",
        no_data_subtitle: "התחילו לבדוק מדי יום כדי לראות מגמות",
        tabs: {
          overview: "סקירה",
          calendar: "לוח שנה",
          insights: "תובנות AI"
        },
        time_range: {
          "7_days": "7 ימים",
          "14_days": "14 ימים",
          "30_days": "30 ימים"
        },
        form: {
          title: "איך אתה מרגיש היום?",
          close_aria: "סגור טופס רשומת מצב רוח",
          date: "תאריך",
          overall_mood: "מצב רוח כללי",
          mood_excellent: "מצוין",
          mood_good: "טוב",
          mood_okay: "בסדר",
          mood_low: "נמוך",
          mood_very_low: "נמוך מאוד",
          emotions_question: "אילו רגשות את/ה מרגיש/ה?",
          intensity_label: "עוצמה רגשית",
          mild: "קל",
          intense: "עז",
          energy_level: "רמת אנרגיה",
          energy_very_low: "נמוכה מאוד",
          energy_low: "נמוכה",
          energy_moderate: "בינונית",
          energy_high: "גבוהה",
          energy_very_high: "גבוהה מאוד",
          sleep_quality: "איכות שינה",
          sleep_poor: "גרועה",
          sleep_fair: "סבירה",
          sleep_good: "טובה",
          sleep_excellent: "מצוינת",
          stress_level: "רמת לחץ",
          relaxed: "רגוע",
          very_stressed: "מלחיץ מאוד",
          triggers_question: "מה גרם למצב רוח שלך היום?",
          activities_question: "מה עשית היום?",
          notes_label: "הערות נוספות",
          notes_placeholder: "כל מחשבה או תצפית אחרת על היום שלך...",
          save_error: "לא ניתן לשמור. בדקו חיבור ונסו שוב.",
          saving: "שומר...",
          save_entry: "שמור רשומה",
          update_entry: "עדכן רשומה"
        }
      },
      progress: {
        page_title: "ההתקדמות שלך",
        page_subtitle: "עקבו אחר המסע",
        page_subtitle_full: "עקבו אחר המסע וחגגו את הצמיחה שלכם",
        health_wellness: "בריאות ורווחה",
        tabs: {
          overview: "סקירה",
          achievements: "הישגים",
          rewards: "תגמולים",
          mood: "מצב רוח",
          goals: "מטרות",
          exercises: "תרגילים",
          health: "בריאות"
        },
        dashboard: {
          current_streak: "רצף נוכחי",
          days: "ימים",
          points: "נקודות",
          badges: "תגים",
          level: "רמה",
          level_prefix: "רמה ",
          avg_mood: "מצב רוח ממוצע",
          trend_improving: "משתפר",
          trend_declining: "יורד",
          trend_stable: "יציב",
          goals_achieved: "מטרות שהושגו",
          active: "פעיל",
          charts: {
            mood_trends: "מגמות מצב רוח (30 ימים אחרונים)",
            exercise_by_category: "תרגילים לפי קטגוריה",
            journal_consistency: "עקביות יומן",
            goal_progress: "התקדמות מטרות"
          }
        }
      },
      mind_games: {
        page_title: "משחקי מוח",
        page_subtitle: "תרגול מיומנויות אינטראקטיבי של CBT ו-DBT",
        go_back_aria: "חזרה",
        close_aria: "סגירה",
        recommended_title: "מומלץ עבורך",
        recommended_subtitle: "על סמך הפעילות שלך, אנחנו חושבים שתהנה מאלה:",
        thought_quiz: {
          score: "ציון",
          next_question: "שאלה הבאה"
        },
        games: {
          thought_quiz: { title: "חידון מחשבות", description: "זהו את מלכודת החשיבה בדוגמה מהירה." },
          reframe_pick: { title: "בחירת מסגור מחדש", description: "בחרו את המחשבה האלטרנטיבית המאוזנת ביותר." },
          value_compass: { title: "מצפן ערכים", description: "בחרו ערך, ואז בחרו פעולה קטנה אחת." },
          tiny_experiment: { title: "ניסוי זעיר", description: "בדקו אמונה עם ניסוי בן דקתיים." },
          quick_win: { title: "ניצחון מהיר", description: "רשמו ניצחון קטן אחד ובנו תנופה." },
          calm_bingo: { title: "בינגו רגוע", description: "סמנו 2 משבצות כדי להשלים סיבוב מיני." },
          dbt_stop: { title: "מיומנות STOP", description: "עצרו, נשמו, ובחרו צעד חכם הבא." },
          opposite_action: { title: "פעולה הפוכה", description: "התאימו פעולות למטרות, לא למצבי רוח." },
          urge_surfing: { title: "גלישת דחפים", description: "רכבו על דחף כמו גל למשך 60 שניות." },
          worry_time: { title: "זמן דאגות", description: "חנו דאגות עכשיו, תזמנו אותן למאוחר יותר." },
          evidence_balance: { title: "איזון ראיות", description: "שקלו ראיות ומצאו מסקנה הוגנת." },
          defusion_cards: { title: "קלפי דפיוזן", description: "התנתקו ממחשבות בדרך משחקית." },
          tipp_skills: { title: "מיומנויות TIPP", description: "שנו את כימיית הגוף במהירות כדי להפחית עוצמה." },
          accepts: { title: "ACCEPTS", description: "הסיחו את הדעת מרגשות מכריעים ביעילות." },
          willing_hands: { title: "ידיים מוכנות", description: "תרגיל קבלה מבוסס גוף." },
          half_smile: { title: "חצי חיוך", description: "שנו רגשות דרך הבעת פנים עדינה." },
          improve: { title: "IMPROVE", description: "שפרו את הרגע במשבר." },
          leaves_on_stream: { title: "עלים בנחל", description: "צפו במחשבות צפות מבלי לתפוס אותן." },
          expansion: { title: "התרחבות", description: "פנו מקום לרגשות קשים." },
          values_check: { title: "בדיקת ערכים", description: "בדיקת יישור מהירה עם הערכים שלכם." },
          pros_and_cons: { title: "יתרונות וחסרונות", description: "קבלת החלטות חכמה במשבר." },
          check_the_facts: { title: "בדקו את העובדות", description: "האם הרגש שלך מתאים למצב?" },
          self_soothe: { title: "הרגעה עצמית 5 חושים", description: "נחמו את עצמכם עם חוויות חושיות." },
          mountain_meditation: { title: "מדיטציית הר", description: "גלמו יציבות והקרקעה." }
        },
        content: {
          thought_quiz: {
            items: [
              { prompt: "If I don't do this perfectly, I'm a total failure.", options: ["All-or-nothing thinking", "Mind reading", "Catastrophizing", "Discounting the positive"], explanation: "This treats performance as a strict pass/fail label instead of a spectrum." },
              { prompt: "They haven't replied yet, so they must be upset with me.", options: ["Emotional reasoning", "Mind reading", "Labeling", "Overgeneralization"], explanation: "You're assuming you know what they think without clear evidence." },
              { prompt: "If I make one mistake, everything will fall apart.", options: ["Catastrophizing", "Personalization", "Should statements", "Mental filter"], explanation: "This jumps to the worst-case outcome and treats it as likely." },
              { prompt: "I had an awkward moment today. I always mess things up.", options: ["Overgeneralization", "Mind reading", "Fortune telling", "Disqualifying the positive"], explanation: "One moment gets turned into a sweeping rule about your whole life." },
              { prompt: "I feel anxious, so something bad must be about to happen.", options: ["Emotional reasoning", "Should statements", "Labeling", "Black-and-white thinking"], explanation: "Feelings are treated like facts, even when they're just signals." },
              { prompt: "My friend sounded quiet. It's probably my fault.", options: ["Personalization", "Catastrophizing", "Fortune telling", "Magnification"], explanation: "You're taking responsibility for something that may have many causes." },
              { prompt: "I should be more productive all the time.", options: ["Should statements", "Mental filter", "Mind reading", "Overgeneralization"], explanation: "Rigid rules ('should') create pressure and ignore real human limits." },
              { prompt: "One person criticized me, so I'm probably not good at this.", options: ["Labeling", "Disqualifying the positive", "Magnification", "All-or-nothing thinking"], explanation: "A single critique gets blown up and outweighs the full picture." },
              { prompt: "I did well, but it doesn't count because it was easy.", options: ["Discounting the positive", "Fortune telling", "Personalization", "Catastrophizing"], explanation: "You're dismissing real effort and progress instead of acknowledging it." },
              { prompt: "Everyone noticed my mistake. They must think I'm incompetent.", options: ["Mind reading", "Mental filter", "Emotional reasoning", "Should statements"], explanation: "You're guessing others' judgments without checking the evidence." },
              { prompt: "If I try and it's uncomfortable, that means it's wrong for me.", options: ["Emotional reasoning", "Overgeneralization", "Labeling", "Disqualifying the positive"], explanation: "Discomfort can be part of growth; it doesn't automatically mean danger." },
              { prompt: "I didn't meet my goal today, so I'm never going to change.", options: ["Fortune telling", "Catastrophizing", "Overgeneralization", "All-or-nothing thinking"], explanation: "A single day becomes a permanent prediction, ignoring gradual progress." }
            ],
            advanced: [
              { prompt: "I received constructive feedback, but all I can think about is the one negative comment buried in it.", options: ["Mental filter", "Overgeneralization", "Personalization", "Emotional reasoning"], explanation: "You're filtering out the positive and focusing only on the negative detail." },
              { prompt: "If I set boundaries, people will see me as selfish and abandon me.", options: ["Fortune telling + labeling", "Mind reading + catastrophizing", "Should statements", "Emotional reasoning"], explanation: "This combines mind reading (knowing what they'll think) with catastrophizing (predicting abandonment)." },
              { prompt: "I didn't get the promotion, which proves I'm not competent enough, and I never will be.", options: ["Fortune telling + labeling", "All-or-nothing thinking", "Discounting the positive", "Personalization"], explanation: "This creates a fixed label and predicts a permanent future based on one event." },
              { prompt: "My colleague was curt with me today. I must have done something to upset them, and now the whole team probably thinks poorly of me.", options: ["Personalization + magnification + mind reading", "Catastrophizing + overgeneralization", "Mental filter + should statements", "Emotional reasoning"], explanation: "This combines taking personal blame, blowing up the impact, and assuming you know what others think." },
              { prompt: "I feel uncertain about this decision, which means I'm making the wrong choice.", options: ["Emotional reasoning", "Fortune telling", "All-or-nothing thinking", "Catastrophizing"], explanation: "The feeling of uncertainty is treated as evidence of a bad decision, not just a normal part of choosing." }
            ]
          },
          reframe_pick: {
            items: [
              { situation: "You sent a message and haven't heard back.", automatic_thought: "They're ignoring me because I said something wrong.", choices: ["They're busy. I can wait or follow up later in a calm way.", "They definitely hate me now and I ruined everything.", "I'll never message anyone again so I don't risk feeling this."], why: "It considers multiple possibilities and suggests a reasonable next step." },
              { situation: "You made a small mistake at work/school.", automatic_thought: "I'm terrible at this.", choices: ["One mistake is normal. I can fix it and learn for next time.", "I'm the worst person here. I should quit immediately.", "I'll pretend it didn't happen and avoid anything challenging."], why: "It's specific, realistic, and focused on learning rather than global labels." },
              { situation: "A friend was quiet during your hangout.", automatic_thought: "They must be annoyed with me.", choices: ["I don't know the reason. I can check in kindly or give space.", "It's my fault. I always ruin friendships.", "I should cut them off before they reject me first."], why: "It avoids mind reading and leaves room for a gentle check-in." },
              { situation: "You didn't finish a task you planned.", automatic_thought: "I'm so lazy.", choices: ["I struggled today. I can pick one small next step and restart.", "I'm hopeless. I'll never be consistent at anything.", "I should punish myself until I finally get disciplined."], why: "It acknowledges difficulty and moves toward a doable, compassionate action." },
              { situation: "You feel anxious before an event.", automatic_thought: "This anxiety means the event will go badly.", choices: ["Anxiety is a feeling, not a prediction. I can go anyway and cope.", "Anxiety means danger. I must avoid this at all costs.", "I need to feel zero anxiety before I'm allowed to show up."], why: "It separates feelings from forecasts and supports valued action." },
              { situation: "Someone gave you feedback.", automatic_thought: "I'm not good enough.", choices: ["Feedback can help me improve. I can take what's useful and grow.", "They think I'm incompetent and everyone agrees with them.", "I'll stop trying so no one can judge me again."], why: "It keeps self-worth intact while allowing improvement." },
              { situation: "You didn't get invited to something.", automatic_thought: "Nobody likes me.", choices: ["There could be many reasons. I can reach out or plan something else.", "This proves I'm unlikable and always will be.", "I'll isolate so I don't have to feel left out again."], why: "It avoids overgeneralization and offers flexible, constructive options." },
              { situation: "You're learning a new skill and feel behind.", automatic_thought: "If I'm not fast, I'm not meant for this.", choices: ["Skills grow with practice. I can improve step by step.", "If I'm not immediately great, it's a waste of time.", "I should compare myself nonstop to prove I'm failing."], why: "It supports growth mindset and realistic learning curves." }
            ]
          },
          value_compass: {
            values: [
              { value: "Family", actions: ["Send a kind message to a family member.", "Do one small helpful thing at home.", "Plan 10 minutes of quality time today."] },
              { value: "Health", actions: ["Drink a glass of water right now.", "Take a 2-minute stretch break.", "Step outside for fresh air for 3 minutes."] },
              { value: "Growth", actions: ["Learn one tiny thing (watch/read for 2 minutes).", "Practice a skill for 3 minutes.", "Write one sentence about what you want to improve."] },
              { value: "Friendship", actions: ["Check in with a friend with a simple hello.", "Reply to a message you've been postponing.", "Share one genuine compliment today."] },
              { value: "Courage", actions: ["Do the smallest version of the scary step (10%).", "Name what you fear in one sentence, then proceed anyway.", "Ask one small question instead of assuming."] },
              { value: "Calm", actions: ["Take 5 slow breaths (count 4 in / 4 out).", "Relax your shoulders and jaw for 20 seconds.", "Put your phone down for 2 minutes and reset."] },
              { value: "Creativity", actions: ["Write a silly 1-line idea (no judgment).", "Take a photo of something interesting around you.", "Doodle for 60 seconds."] },
              { value: "Purpose", actions: ["Choose one task that matters and do 2 minutes of it.", "Write your 'why' in 1 sentence.", "Remove one small obstacle from your path today."] }
            ]
          },
          tiny_experiment: {
            items: [
              { belief: "If I ask for help, people will think I'm weak.", experiments: ["Ask one small, specific question and observe the response.", "Ask a trusted person for a tiny favor and note what happens.", "Ask for clarification once instead of guessing."], reflection_question: "What happened?", reflection_options: ["It went better than I feared.", "It was neutral / fine.", "It was uncomfortable, but I handled it."] },
              { belief: "If I say no, people will dislike me.", experiments: ["Say no to a low-stakes request using one polite sentence.", "Offer an alternative (not now / later) instead of automatic yes.", "Pause for 5 seconds before agreeing to anything."], reflection_question: "What did you notice?", reflection_options: ["People respected it.", "Nothing dramatic happened.", "It felt hard, and I survived it."] },
              { belief: "If I make a mistake, it will be a disaster.", experiments: ["Do a small task imperfectly on purpose (10%) and observe outcomes.", "Share a minor correction without apologizing excessively.", "Let one tiny typo exist and see what actually happens."], reflection_question: "What was the outcome?", reflection_options: ["No one cared.", "It was fixable.", "It felt big in my head, smaller in reality."] },
              { belief: "If I don't feel motivated, I can't start.", experiments: ["Start for 2 minutes only, then reassess.", "Set a timer for 90 seconds and do the first step.", "Make the task 10x smaller and begin."], reflection_question: "After starting, how was it?", reflection_options: ["Easier than expected.", "Still hard, but possible.", "I gained a little momentum."] },
              { belief: "If someone is quiet, it must be about me.", experiments: ["Write 3 alternative explanations before reacting.", "Ask a simple check-in question instead of assuming.", "Wait 30 minutes and see if new info appears."], reflection_question: "What did you learn?", reflection_options: ["I didn't have enough evidence.", "There were other explanations.", "Checking in was helpful."] },
              { belief: "I have to do everything right to be accepted.", experiments: ["Share one imperfect draft and request feedback.", "Do one task at 'good enough' level and stop.", "Let someone else choose one detail instead of controlling it."], reflection_question: "How did it go?", reflection_options: ["Good enough worked.", "Acceptance didn't depend on perfection.", "I felt discomfort, and it passed."] },
              { belief: "If I feel anxious, I shouldn't go.", experiments: ["Go for 5 minutes only and reassess.", "Bring one coping tool (water / music / breathing).", "Rate anxiety 0–10 before and after to compare."], reflection_question: "What did you notice?", reflection_options: ["Anxiety changed over time.", "I could function with anxiety present.", "Avoidance wasn't necessary."] },
              { belief: "If I rest, I'm wasting time.", experiments: ["Take a 3-minute break and then return to one small task.", "Rest first, then do 2 minutes of the priority task.", "Track: does a short break help focus?"], reflection_question: "Result?", reflection_options: ["Rest helped me reset.", "No harm done.", "I returned with a bit more clarity."] },
              { belief: "If I don't get it quickly, I'm not capable.", experiments: ["Practice for 3 minutes daily for 3 days and compare.", "Ask one question and notice improvement.", "Write one thing you learned today, even if small."], reflection_question: "What changed?", reflection_options: ["Progress showed up gradually.", "Learning took repetition.", "I was harsher than necessary."] },
              { belief: "I need to feel confident before I act.", experiments: ["Act with 'small courage' for 2 minutes anyway.", "Do the first step while confidence is low.", "Rate confidence after action (not before)."], reflection_question: "After action, how was your confidence?", reflection_options: ["A bit higher.", "About the same, but I did it.", "I learned I can move without perfect confidence."] }
            ]
          },
          quick_win: {
            presets: ["I drank water.", "I took a 2-minute break.", "I sent one message I was avoiding.", "I cleaned one tiny area.", "I did one small task for 2 minutes.", "I took 5 slow breaths.", "I stepped outside for fresh air.", "I asked a question instead of assuming.", "I showed up even though it was uncomfortable.", "I wrote one helpful sentence to myself.", "I stretched my shoulders/neck.", "I ate something nourishing.", "I paused before reacting.", "I said no (or not now) politely.", "I made a small plan for tomorrow.", "I finished a mini-step.", "I noticed a thinking trap and named it.", "I chose 'good enough' and stopped.", "I did something kind for someone.", "I did something kind for myself."]
          },
          calm_bingo: {
            tiles: ["Drink a glass of water", "5 slow breaths", "Relax shoulders + jaw", "Look out a window for 30s", "Stand up and stretch", "Send a kind text", "Tidy one small thing", "Step outside for 2 minutes", "Name 3 things you can see", "Play one calm song", "Write 1 supportive sentence", "Wash your hands slowly", "Move your body for 60s", "Put phone down for 2 minutes", "Smile gently (even 10%)", "Choose one tiny next step"]
          },
          dbt_stop: {
            prompts: [
              { trigger: "You feel a strong urge to react immediately.", steps: [{ key: "S", label: "Stop", text: "Pause. Don't act yet." }, { key: "T", label: "Take a step back", text: "Breathe once. Create a tiny space." }, { key: "O", label: "Observe", text: "Notice: thoughts, feelings, body signals." }, { key: "P", label: "Proceed mindfully", text: "Choose one wise next step." }], next_steps: ["Send a calm, short reply (or wait 10 minutes).", "Ask one clarifying question.", "Do one small grounding action, then decide."] },
              { trigger: "You're about to avoid something important.", steps: [{ key: "S", label: "Stop", text: "Pause avoidance for a moment." }, { key: "T", label: "Take a step back", text: "Exhale slowly and reset posture." }, { key: "O", label: "Observe", text: "What are you afraid will happen?" }, { key: "P", label: "Proceed mindfully", text: "Pick the smallest brave step (10%)." }], next_steps: ["Do 2 minutes of the first step only.", "Make it easier: reduce scope by 50%.", "Text someone: 'I'm starting now—wish me luck.'"] },
              { trigger: "You feel criticized and want to defend yourself fast.", steps: [{ key: "S", label: "Stop", text: "Hold back the instant response." }, { key: "T", label: "Take a step back", text: "Breathe and relax your jaw." }, { key: "O", label: "Observe", text: "What's the goal: to win or to repair?" }, { key: "P", label: "Proceed mindfully", text: "Respond to the goal, not the heat." }], next_steps: ["Say: 'Let me think about that for a moment.'", "Reflect back what you heard in one sentence.", "Ask: 'What would be most helpful right now?'"] },
              { trigger: "You're scrolling/doomscrolling and feel stuck.", steps: [{ key: "S", label: "Stop", text: "Pause scrolling now." }, { key: "T", label: "Take a step back", text: "Put phone down for one breath." }, { key: "O", label: "Observe", text: "Name the feeling in one word." }, { key: "P", label: "Proceed mindfully", text: "Choose one small helpful action." }], next_steps: ["Drink water and stretch for 30 seconds.", "Open a window or step outside for 1 minute.", "Write one tiny next step and do it."] }
            ]
          },
          opposite_action: {
            items: [
              { emotion: "Anxiety", urge: "Avoid / escape", opposite: "Approach gently", choices: ["Show up for 5 minutes, then reassess.", "Do the smallest first step (10%).", "Ask one question instead of avoiding."], note: "Opposite action is for emotions that don't fit the facts or are too intense." },
              { emotion: "Sadness", urge: "Withdraw / isolate", opposite: "Connect or activate", choices: ["Send one simple 'hey' message.", "Step outside for 2 minutes.", "Do a tiny task to build momentum."], note: "Small activation often shifts mood more than waiting for motivation." },
              { emotion: "Anger", urge: "Attack / argue", opposite: "Be gentle and effective", choices: ["Lower voice + slow down your words.", "State one need clearly without blame.", "Take a 2-minute pause before replying."], note: "Opposite action aims for effectiveness, not 'winning.'" },
              { emotion: "Shame", urge: "Hide / disappear", opposite: "Small reveal + self-respect", choices: ["Share a tiny truth with a safe person.", "Stand tall, breathe, and stay present for 30s.", "Do one value-based action anyway."], note: "Shame shrinks with safe connection and self-respect actions." },
              { emotion: "Guilt (too much)", urge: "Over-apologize / self-punish", opposite: "Repair effectively", choices: ["Apologize once, then propose one repair step.", "Ask what would help and listen.", "Stop repeating apologies; act instead."], note: "Effective repair beats endless self-blame." },
              { emotion: "Fear of rejection", urge: "People-please / over-text", opposite: "Balanced boundary", choices: ["Send one message, then wait.", "Do one self-caring action while you wait.", "Remind yourself: 'I can handle uncertainty.'"], note: "Opposite action builds tolerance for uncertainty." }
            ]
          },
          urge_surfing: {
            beginner: [
              { title: "Ride the wave (60 seconds)", steps: ["Name the urge: 'I'm having the urge to ____.'", "Rate intensity 0–10.", "Notice where it lives in the body.", "Breathe slowly for 5 breaths.", "Rate intensity again. (Urges rise and fall.)"], finish_choices: ["Delay 10 minutes (set a timer).", "Do a 2-minute replacement action.", "Ask for support (one message)."] },
              { title: "Surf + redirect", steps: ["Name the urge without judging it.", "Imagine it as a wave—rising, cresting, passing.", "Relax shoulders and jaw.", "Pick one value-based micro-action."], finish_choices: ["Take 10% of a helpful step.", "Move your body for 60 seconds.", "Drink water + reset posture."] }
            ],
            advanced: [
              { title: "Surf independently (90 seconds)", steps: ["Name and rate the urge (0-10).", "Locate it in your body.", "Breathe with it for 10 breaths.", "Notice the peak and decline.", "Rate it again."], finish_choices: ["Delay 20 minutes and reassess.", "Do the opposite action for 5 minutes.", "Journal about what you noticed."] },
              { title: "Surf + value-based action", steps: ["Acknowledge the urge without judgment.", "Watch it like a scientist observing data.", "Let it peak naturally.", "Choose one value-aligned micro-step."], finish_choices: ["Do the tiny step immediately.", "Practice the skill again in 1 hour.", "Note what worked for next time."] }
            ]
          },
          worry_time: {
            items: [
              { worry: "What if I mess up tomorrow?", park_it: "I'll think about this during Worry Time at 6:00 PM for 10 minutes.", tiny_now: ["Write one small preparation step.", "Do 2 minutes of that step now.", "Then return to the present task."] },
              { worry: "What if they're mad at me?", park_it: "I'll revisit this at 7:00 PM for 10 minutes, then decide on a calm follow-up.", tiny_now: ["List 2 alternative explanations.", "Wait 30 minutes before acting.", "Do one calming reset (5 breaths)."] },
              { worry: "What if something bad happens?", park_it: "I'll schedule Worry Time at 5:30 PM for 10 minutes and focus on what's controllable.", tiny_now: ["Name 1 thing you can control today.", "Do the smallest step toward it.", "Return attention to the room."] },
              { worry: "I'm behind; I'll never catch up.", park_it: "I'll worry about this at 6:30 PM for 10 minutes and make a realistic plan.", tiny_now: ["Pick the single next step.", "Work 2 minutes on it.", "Stop and acknowledge progress."] },
              { worry: "What if I disappoint people?", park_it: "I'll revisit this at 8:00 PM for 10 minutes and choose a value-based action.", tiny_now: ["Ask: 'What matters to me here?'", "Choose one respectful sentence/boundary.", "Delay responding for 10 minutes."] },
              { worry: "What if I can't handle it?", park_it: "I'll schedule Worry Time at 7:30 PM for 10 minutes and review coping options.", tiny_now: ["Write 1 coping tool you already use.", "Use it for 60 seconds.", "Continue with the next small task."] }
            ]
          },
          evidence_balance: {
            items: [
              { thought: "I always mess things up.", evidence_for: ["I made a mistake recently.", "I remember failures more than successes."], evidence_against: ["I've done many things well.", "One mistake doesn't define 'always'."], balanced_conclusion: "I've made mistakes and also succeeded. I can learn and improve." },
              { thought: "They don't like me.", evidence_for: ["They replied late once.", "They were quiet last time."], evidence_against: ["They've been friendly before.", "There are many reasons for silence."], balanced_conclusion: "I don't know their thoughts. I can check in calmly or wait for more info." },
              { thought: "If I'm anxious, I can't cope.", evidence_for: ["Anxiety feels intense.", "I want to escape when anxious."], evidence_against: ["I've coped with anxiety before.", "Anxiety rises and falls."], balanced_conclusion: "Anxiety is uncomfortable but manageable. I can act while it's present." },
              { thought: "I'm not improving.", evidence_for: ["Progress feels slow.", "I compare myself to others."], evidence_against: ["I've taken small steps.", "Learning is gradual."], balanced_conclusion: "Progress can be slow and real. Small steps still count." },
              { thought: "I must do everything perfectly.", evidence_for: ["I value quality.", "Perfection sometimes prevents criticism."], evidence_against: ["Perfect isn't required to succeed.", "Good-enough frees time and reduces stress."], balanced_conclusion: "I can aim for quality while allowing 'good enough' when it's effective." },
              { thought: "If I say no, I'll be rejected.", evidence_for: ["I worry about disappointing people.", "I've had conflict before."], evidence_against: ["Many people respect boundaries.", "I can say no politely and offer alternatives."], balanced_conclusion: "Saying no respectfully protects relationships and my wellbeing." }
            ]
          },
          defusion_cards: {
            cards: [
              { thought: "I'm not good enough.", defuse_lines: ["I'm having the thought that I'm not good enough.", "Thanks, mind. Interesting story.", "This is a thought, not a fact."] },
              { thought: "Something bad will happen.", defuse_lines: ["I'm noticing a 'danger prediction' thought.", "My mind is trying to protect me.", "I can take one small step anyway."] },
              { thought: "They're judging me.", defuse_lines: ["I'm having the thought they're judging me.", "I can't read minds. I can act on my values.", "Let this thought ride in the back seat."] },
              { thought: "I can't handle this feeling.", defuse_lines: ["I'm noticing the thought 'I can't handle it'.", "Feelings are waves; they change.", "I can make room and keep going."] },
              { thought: "I must fix everything now.", defuse_lines: ["There's the 'urgent fixer' thought.", "I can pause and choose one wise next step.", "Slow is smooth; smooth is fast."] },
              { thought: "If it's hard, I should quit.", defuse_lines: ["I'm having the thought 'quit'.", "Hard can mean 'new', not 'wrong'.", "I can do the smallest version (10%)."] }
            ]
          },
          tipp_skills: {
            situation: "Your emotions are at 8/10 or higher and you need to come down fast.",
            skills: [
              { letter: "T", name: "Temperature", description: "Cold water on face, ice cube, cold shower" },
              { letter: "I", name: "Intense exercise", description: "Run, jump, push-ups for 60 seconds" },
              { letter: "P", name: "Paced breathing", description: "Breathe out longer than in (4 in / 6 out)" },
              { letter: "P", name: "Paired muscle relaxation", description: "Tense then release muscle groups" }
            ],
            actions: ["Splash cold water on your face for 30 seconds.", "Do 20 jumping jacks right now.", "Breathe: 4 in, hold 4, 6 out—repeat 5 times."]
          },
          accepts: {
            items: [
              { letter: "A", name: "Activities", description: "Do something engaging", action: "Watch a 5-minute video, play a quick game, or clean one surface." },
              { letter: "C", name: "Contributing", description: "Help someone else", action: "Send a kind message, do one helpful thing, or share something useful." },
              { letter: "C", name: "Comparisons", description: "Compare to when you coped before", action: "Remember: You've survived 100% of your worst days so far." },
              { letter: "E", name: "Emotions", description: "Create a different emotion", action: "Watch something funny, listen to upbeat music, or read something calming." },
              { letter: "P", name: "Pushing away", description: "Mentally put the situation aside", action: "Imagine putting the problem in a box on a shelf for later." },
              { letter: "T", name: "Thoughts", description: "Fill your mind with other thoughts", action: "Count backwards from 100 by 7s, list countries A-Z, or describe the room." },
              { letter: "S", name: "Sensations", description: "Create strong physical sensations", action: "Hold ice, take a hot/cold shower, or squeeze a stress ball hard." }
            ]
          },
          improve: {
            items: [
              { letter: "I", name: "Imagery", description: "Visualize a peaceful or safe place", quick_action: "Close your eyes. Picture a place you feel calm (real or imagined)." },
              { letter: "M", name: "Meaning", description: "Find purpose in the pain", quick_action: "Ask: What can I learn? How might this help me grow?" },
              { letter: "P", name: "Prayer", description: "Connect to something larger", quick_action: "Say a phrase that grounds you or ask for support from your values/beliefs." },
              { letter: "R", name: "Relaxation", description: "Relax your body", quick_action: "Tense and release: shoulders, jaw, hands. Breathe slowly." },
              { letter: "O", name: "One thing in the moment", description: "Focus fully on one small task", quick_action: "Pick one action: wash a dish, water a plant, fold one item." },
              { letter: "V", name: "Vacation", description: "Take a brief mental break", quick_action: "Give yourself 10 minutes off from the problem. Set a timer." },
              { letter: "E", name: "Encouragement", description: "Be your own cheerleader", quick_action: "Say: 'I can handle this. I've done hard things before.'" }
            ]
          },
          self_soothe: {
            senses: [
              { sense: "Vision", actions: ["Look at nature or a calming image.", "Watch clouds or water move.", "Light a candle and watch the flame."] },
              { sense: "Hearing", actions: ["Listen to calming music or nature sounds.", "Play a song that makes you feel safe.", "Listen to the sound of rain or wind."] },
              { sense: "Smell", actions: ["Smell something pleasant (lotion, coffee, flowers).", "Light a scented candle or incense.", "Take a deep breath of fresh air."] },
              { sense: "Taste", actions: ["Eat something you enjoy slowly.", "Savor a piece of chocolate or tea.", "Notice the flavors and textures."] },
              { sense: "Touch", actions: ["Hold something soft (blanket, pet).", "Take a warm shower or bath.", "Massage your hands with lotion."] }
            ]
          }
        }
      },
      exercises: {
        page_title: "ספריית תרגילים",
        page_subtitle: "תרגלו טכניקות CBT",
        page_subtitle_full: "עיינו ותרגלו טכניקות CBT מבוססות ראיות",
        loading: "טוען תרגילים...",
        go_back_aria: "חזרה",
        ai_plan: "תוכנית תרגול AI",
        favorites: "מועדפים",
        search_placeholder: "חפש תרגילים...",
        empty_state: {
          favorites_title: "אין מועדפים עדיין",
          no_results_title: "לא נמצאו תרגילים",
          favorites_message: "סמנו תרגילים כמועדפים כדי לראות אותם כאן",
          search_message: "נסו להתאים את החיפוש או הסינונים",
          no_exercises_message: "אין תרגילים זמינים"
        },
        library: {
          flexible: "גמיש"
        },
        categories: {
          all: "הכל",
          breathing: "נשימה",
          grounding: "קרקוע",
          cognitive: "קוגניטיבי",
          behavioral: "התנהגותי",
          mindfulness: "מיינדפולנס",
          exposure: "חשיפה",
          sleep: "שינה",
          relationships: "יחסים",
          stress: "ניהול לחץ"
        },
        detail: {
          untitled_exercise: "תרגיל ללא כותרת",
          duration_options_suffix: "דק' אפשרויות",
          minutes_suffix: "דקות",
          video_label: "וידאו",
          tabs: {
            overview: "סקירה",
            practice: "תרגול",
            audio: "אודיו",
            benefits: "יתרונות",
            tips: "טיפים"
          },
          about: "אודות תרגיל זה",
          guided_visualization: "ויזואליזציה מודרכת",
          video_demonstration: "הדגמת וידאו",
          helps_with: "עוזר עם",
          guided_audio: "אודיו מודרך",
          guided_audio_description: "עקבו אחר הדרכת אודיו מקצועית לתרגיל זה.",
          step_by_step_guide: "מדריך שלב אחר שלב",
          step_duration: "משך: {{seconds}} שניות",
          instructions: "הוראות",
          choose_duration: "בחרו משך זמן",
          key_benefits: "יתרונות מרכזיים",
          default_benefits: "תרגיל זה עוזר לשפר את הרווחה הנפשית, להפחית לחץ ולשפר את הרגולציה הרגשית.",
          helpful_tips: "טיפים מועילים",
          default_tips: "תרגלו באופן קבוע לתוצאות הטובות ביותר. מצאו מקום שקט, התחילו לאט והיו סבלניים עם עצמכם.",
          your_progress: "ההתקדמות שלך",
          times_completed: "פעמים שהושלמו",
          minutes_practiced: "דקות תרגול",
          last_practiced: "תרגול אחרון: {{date}}",
          completed_message: "התרגיל הושלם!",
          mark_as_complete: "סמן כהושלם"
        }
      }
    }
  },
  es: {
    translation: {
      sidebar: {
        home: { name: "Inicio", description: "Panel y resumen" },
        chat: { name: "Chat", description: "Terapeuta IA" },
        coach: { name: "Coach", description: "Coach de Bienestar IA" },
        mood: { name: "Estado de ánimo", description: "Rastrea tu estado de ánimo" },
        journal: { name: "Diario", description: "Registros de pensamientos" },
        progress: { name: "Progreso", description: "Rastrea tu viaje" },
        exercises: { name: "Ejercicios", description: "Técnicas CBT" },
        community: { name: "Comunidad" },
        resources: { name: "Recursos" },
        settings: { name: "Configuración" }
      },
      global: {
        app_name: "MindWell",
        app_tagline: "App de Bienestar Mental"
      },
      mobile_menu: {
        menu_title: "Menú",
        open_aria: "Abrir menú",
        close_aria: "Cerrar menú"
      },
      home: {
        greeting: {
          morning: "Buenos días",
          afternoon: "Buenas tardes",
          evening: "Buenas noches"
        },
        active_goals: "Objetivos Activos",
        journal_entries: "Entradas de Diario",
        error: {
          goals_load: "No se pudieron cargar los objetivos.",
          journal_load: "No se pudieron cargar las entradas del diario."
        },
        aria: {
          view_goal_details: "Ver detalles del objetivo",
          view_journal_entry: "Ver entrada de diario",
          watch_help_video: "Ver video de ayuda",
          watch_goals_help_video: "Ver video de ayuda de objetivos",
          watch_journal_help_video: "Ver video de ayuda de diario"
        }
      },
      quick_actions: {
        title: "Acciones Rápidas",
        recommended: { title: "Recomendado para Ti", description: "Sugerencias personalizadas por IA" },
        ai_therapist: { title: "Terapeuta IA", description: "Habla con tu terapeuta" },
        journal_thought: { title: "Registrar un Pensamiento", description: "Desafía el pensamiento" },
        set_goal: { title: "Establecer un Objetivo", description: "Define objetivos" },
        mind_games: { title: "Juegos Mentales", description: "Ejercicios mentales rápidos" },
        journeys: { title: "Viajes", description: "Rutas de habilidades curadas" },
        exercises_library: { title: "Biblioteca de Ejercicios", description: "Explora técnicas" },
        video_library: { title: "Biblioteca de Videos", description: "Mira y aprende" },
        personalized_recommendations: "Recomendaciones Personalizadas",
        aria: {
          guided_intro_video: "Video de introducción guiada",
          close_video: "Cerrar video"
        }
      },
      settings: {
        page_title: "Configuración",
        page_subtitle: "Administra tu cuenta y preferencias",
        profile: {
          title: "Perfil",
          full_name: "Nombre Completo",
          name_placeholder: "Tu nombre",
          email: "Correo Electrónico",
          email_readonly: "El correo electrónico no se puede cambiar",
          role: "Rol",
          role_admin: "Administrador",
          role_user: "Usuario",
          save_changes: "Guardar Cambios",
          saving: "Guardando..."
        },
        language: {
          title: "Idioma",
          description: "Elige tu idioma preferido",
          current: "Idioma actual",
          en: "English (Inglés)",
          he: "עברית (Hebreo)",
          es: "Español (Spanish)",
          fr: "Français (Francés)",
          de: "Deutsch (Alemán)",
          it: "Italiano (Italian)",
          pt: "Português (Portugués)"
        },
        theme: {
          title: "Tema de Color",
          description: "Elige un tema visual que te resulte cómodo",
          default: { name: "Predeterminado", description: "Gradientes verdes y morados tranquilos" },
          ocean: { name: "Océano", description: "Azules y verdeazulados serenos" },
          sunset: { name: "Atardecer", description: "Naranjas y rosas cálidos" },
          forest: { name: "Bosque", description: "Verdes naturales y tonos tierra" },
          lavender: { name: "Lavanda", description: "Morados y violetas suaves" },
          minimal: { name: "Minimalista", description: "Grises y negros limpios" }
        },
        dashboard_layout: {
          title: "Diseño del Panel",
          description: "Elige cómo está organizado tu panel de inicio",
          default_title: "Predeterminado",
          default_description: "Diseño equilibrado con todas las secciones",
          compact_title: "Compacto",
          compact_description: "Vista condensada para acceso rápido"
        },
        subscription: {
          title: "Suscripción",
          free_trial: "Prueba Gratuita",
          active: "Activo",
          description: "Actualmente estás en una prueba gratuita. Actualiza a Premium para acceso ilimitado a todas las funciones.",
          feature_sessions: "✓ Sesiones de terapia limitadas (5 gratis)",
          feature_exercises: "✓ Ejercicios CBT básicos",
          feature_mood: "✓ Seguimiento del estado de ánimo",
          upgrade_button: "Actualizar a Premium - $9.99/mes",
          premium_benefits: "Premium incluye: Sesiones ilimitadas, ejercicios avanzados, soporte prioritario y más."
        },
        data_privacy: {
          title: "Datos y Privacidad",
          retention_label: "Política de Retención de Datos",
          retention_description: "Elige cuánto tiempo se conservan tus registros de terapia, entradas de estado de ánimo y datos de diario. Después de este período, los registros pueden eliminarse automáticamente.",
          retention_30_days: "30 días",
          retention_90_days: "90 días",
          retention_1_year: "1 año",
          retention_indefinite: "Mantener indefinidamente",
          current_setting: "Configuración actual: {{value}}",
          current_setting_indefinite: "Indefinido",
          current_setting_days: "{{days}} días",
          export_title: "Exportar Tus Datos",
          export_description: "Descarga un resumen de tus registros de terapia, entradas de estado de ánimo y objetivos como archivo JSON.",
          export_button: "Exportar Datos",
          exporting: "Exportando...",
          delete_title: "Eliminar Todos los Datos",
          delete_description: "Elimina permanentemente todos tus registros de terapia, entradas de estado de ánimo y datos de diario. Esta acción no se puede deshacer.",
          delete_confirm_prompt: "¿Estás seguro? Esto eliminará permanentemente todos tus datos.",
          delete_confirm_button: "Sí, Eliminar Todo",
          deleting: "Eliminando...",
          delete_button: "Eliminar Todos los Datos",
          cancel_button: "Cancelar",
          retention_saved: "Configuración de retención guardada",
          retention_failed: "Error al guardar la configuración de retención",
          export_success: "Datos exportados correctamente",
          export_failed: "Error al exportar datos",
          delete_success: "Todos los datos eliminados correctamente",
          delete_failed: "Error al eliminar datos",
          privacy_notice: "Aviso de Privacidad: Esta aplicación no afirma cumplir con HIPAA. Tus datos se almacenan de forma segura en nuestra base de datos y están sujetos a nuestros términos de servicio. Las solicitudes de eliminación se procesan de inmediato. Para preguntas sobre el manejo de datos, contacta a soporte."
        },
        notifications: {
          title: "Notificaciones",
          daily_reminders: "Recordatorios Diarios",
          daily_reminders_description: "Recibe recordatorios para registrarte diariamente",
          progress_updates: "Actualizaciones de Progreso",
          progress_updates_description: "Resumen semanal de tu progreso",
          goal_reminders: "Recordatorios de Objetivos",
          goal_reminders_description: "Notificaciones sobre plazos de objetivos",
          exercise_reminders: "Recordatorios de Ejercicios",
          exercise_reminders_description: "Horarios sugeridos para ejercicios CBT"
        },
        account: {
          title: "Cuenta",
          logout: "Cerrar Sesión"
        },
        footer: {
          need_help: "¿Necesitas ayuda?",
          contact_support: "Contactar Soporte",
          version: "MindCare CBT Therapist · Versión 1.0"
        }
      },
      common: {
        loading: "Cargando...",
        retry: "Reintentar",
        cancel: "Cancelar",
        continue: "Continuar",
        return: "Regresar",
        close: "Cerrar",
        dismiss: "Descartar",
        complete: "Completar",
        close_video_aria: "Cerrar video",
        video_not_supported: "Tu navegador no soporta la etiqueta de video.",
        audio_not_supported: "Tu navegador no soporta el elemento de audio.",
        go_back_aria: "Regresar",
        go_back_home_aria: "Regresar al inicio",
        ai_label: "IA",
        you_label: "Tú",
        minutes_short: "min"
      },
      chat: {
        aria: {
          go_back_home: "Regresar al inicio",
          open_conversations: "Abrir barra lateral de conversaciones",
          close_conversations: "Cerrar barra lateral de conversaciones"
        },
        therapist_title: "Tu Terapeuta",
        therapist_subtitle: "Un espacio seguro para hablar",
        welcome: {
          title: "Bienvenido a Terapia",
          message: "Este es un espacio seguro y sin juicios. Comparte lo que tienes en mente y trabajemos juntos.",
          start_session: "Iniciar Tu Primera Sesión"
        },
        thinking_placeholder: "Pensando...",
        summary_prompt: {
          title: "¿Te gustaría un resumen de la sesión?",
          description: "Obtén conclusiones clave, ejercicios recomendados y recursos útiles",
          yes: "Sí, crear resumen",
          not_now: "Ahora no"
        },
        input_placeholder: "Comparte lo que tienes en mente...",
        disclaimer: {
          title: "⚠️ Soporte IA - No es Terapia Profesional",
          message: "No puede diagnosticar ni prescribir. ¿Crisis? Llama al 988 (EE. UU.) o a tus servicios de emergencia locales.",
          strict: "Recordatorio: Esta IA no puede diagnosticar condiciones ni prescribir tratamientos. Para preocupaciones médicas, consulta a un profesional licenciado.",
          standard: "Recordatorio: Este es soporte asistido por IA, no terapia profesional. Las situaciones de emergencia requieren ayuda profesional inmediata."
        },
        delete_session_failed: "Error al eliminar la sesión. Por favor, inténtalo de nuevo.",
        confirm_delete_session: "¿Eliminar esta sesión? Esta acción no se puede deshacer.",
        daily_checkin_message: "He completado mi Check-in Diario.",
        consent: {
          lenient: {
            title: "Soporte de Bienestar IA - Modo Permisivo",
            message: "Esta IA proporciona conversación de apoyo con interrupciones mínimas. No puede diagnosticar, prescribir ni reemplazar la atención profesional. Las situaciones de crisis requieren ayuda profesional inmediata."
          },
          standard: {
            title: "Soporte de Bienestar IA - Modo Estándar",
            message: "Esta IA proporciona soporte de bienestar utilizando principios CBT basados en evidencia. No es un sustituto de la atención de salud mental profesional y no puede diagnosticar ni prescribir. En crisis, contacta a los servicios de emergencia inmediatamente."
          },
          strict: {
            title: "Soporte de Bienestar IA - Modo de Seguridad Estricto",
            message: "Este modo incluye monitoreo de seguridad mejorado y recordatorios frecuentes. La IA no puede diagnosticar, prescribir ni manejar emergencias. Se requiere atención de salud mental profesional para preocupaciones clínicas."
          },
          learn_more: "Más información sobre perfiles de seguridad",
          understand_button: "Entiendo"
        },
        risk_panel: {
          title: "Estamos Aquí para Ayudar",
          message: "Esta IA no puede proporcionar soporte de emergencia. Si estás en crisis, comunícate con un profesional de inmediato.",
          crisis_hotline_label: "Línea de Crisis:",
          crisis_hotline_number: "988 (EE. UU.)",
          crisis_text_line_label: "Línea de Texto de Crisis:",
          crisis_text_line_number: "Envía \"HELLO\" al 741741",
          emergency_label: "Emergencia:",
          emergency_number: "911",
          return_to_chat: "Volver al Chat"
        },
        conversations_list: {
          title: "Sesiones",
          empty_title: "Aún no hay sesiones",
          empty_message: "Inicia una conversación para comenzar",
          session_prefix: "Sesión",
          delete_aria: "Eliminar sesión"
        },
        session_summary: {
          title: "Resumen de Sesión",
          key_takeaways: "Conclusiones Clave",
          recommended_exercises: "Ejercicios Recomendados",
          helpful_resources: "Recursos Útiles",
          reflect_button: "Reflexionar en Diario",
          view_exercises_button: "Ver Todos los Ejercicios"
        }
      },
      age_gate: {
        title: "Verificación de Edad Requerida",
        message: "Nuestras funciones de terapia con IA están diseñadas para adultos de 18 años o más. Esto ayuda a garantizar que brindamos el soporte adecuado y mantenemos estándares de seguridad.",
        teen_support_heading: "Si tienes menos de 18 años y necesitas apoyo:",
        teen_support: {
          counselor: "• Consejero escolar o adulto de confianza",
          teen_line: "• Teen Line: 1-800-852-8336 (o envía TEEN al 839863)",
          crisis_text_line: "• Línea de Texto de Crisis: Envía \"HOME\" al 741741"
        },
        confirm_button: "Tengo 18 o Más",
        decline_button: "Tengo Menos de 18"
      },
      age_restricted: {
        title: "Restringido por Edad",
        message: "Nuestras funciones de chat impulsadas por IA están diseñadas para usuarios de 18 años o más. Aún tienes acceso a otras herramientas de bienestar como seguimiento del estado de ánimo, diario y ejercicios.",
        back_to_home: "Volver al Inicio"
      },
      journeys: {
        page_title: "Viajes",
        page_subtitle: "Rutas guiadas de desarrollo de habilidades para crecimiento personal",
        tabs: {
          available: "Disponible",
          in_progress: "En Progreso",
          completed: "Completado"
        },
        empty_state: {
          no_available: "No hay viajes disponibles en este momento",
          no_in_progress: "Aún no has comenzado ningún viaje",
          no_completed: "Aún no has completado ningún viaje"
        },
        card: {
          days: "días",
          steps: "pasos",
          progress: "Progreso",
          start_journey: "Iniciar Viaje",
          view_details: "Ver Detalles"
        },
        detail: {
          what_youll_gain: "Lo que obtendrás:",
          journey_steps: "Pasos del Viaje",
          day: "Día",
          play_game: "Jugar",
          reflection_placeholder: "Tu reflexión (opcional)",
          saving: "Guardando...",
          mark_complete: "Marcar Completo"
        }
      },
      mood_tracker: {
        page_title: "Rastreador de Estado de Ánimo",
        page_subtitle: "Rastrea tu bienestar emocional y descubre patrones",
        update_today: "Actualizar Hoy",
        log_mood: "Registrar Estado de Ánimo",
        mood_trends: "Tendencias de Estado de Ánimo",
        loading_chart: "Cargando gráfico...",
        no_data: "Sin datos de estado de ánimo aún",
        no_data_subtitle: "Comienza a registrarte diariamente para ver tendencias",
        tabs: {
          overview: "Resumen",
          calendar: "Calendario",
          insights: "Perspectivas IA"
        },
        time_range: {
          "7_days": "7 días",
          "14_days": "14 días",
          "30_days": "30 días"
        },
        form: {
          title: "¿Cómo te sientes hoy?",
          close_aria: "Cerrar formulario de registro de estado de ánimo",
          date: "Fecha",
          overall_mood: "Estado de Ánimo General",
          mood_excellent: "Excelente",
          mood_good: "Bien",
          mood_okay: "Bien",
          mood_low: "Bajo",
          mood_very_low: "Muy Bajo",
          emotions_question: "¿Qué emociones estás sintiendo?",
          intensity_label: "Intensidad Emocional",
          mild: "Leve",
          intense: "Intenso",
          energy_level: "Nivel de Energía",
          energy_very_low: "Muy Bajo",
          energy_low: "Bajo",
          energy_moderate: "Moderado",
          energy_high: "Alto",
          energy_very_high: "Muy Alto",
          sleep_quality: "Calidad del Sueño",
          sleep_poor: "Pobre",
          sleep_fair: "Regular",
          sleep_good: "Buena",
          sleep_excellent: "Excelente",
          stress_level: "Nivel de Estrés",
          relaxed: "Relajado",
          very_stressed: "Muy Estresado",
          triggers_question: "¿Qué desencadenó tu estado de ánimo hoy?",
          activities_question: "¿Qué hiciste hoy?",
          notes_label: "Notas Adicionales",
          notes_placeholder: "Otros pensamientos u observaciones sobre tu día...",
          save_error: "No se pudo guardar. Verifica la conexión e inténtalo de nuevo.",
          saving: "Guardando...",
          save_entry: "Guardar Entrada",
          update_entry: "Actualizar Entrada"
        }
      },
      progress: {
        page_title: "Tu Progreso",
        page_subtitle: "Rastrea tu viaje",
        page_subtitle_full: "Rastrea tu viaje y celebra tu crecimiento",
        health_wellness: "Salud y Bienestar",
        tabs: {
          overview: "Resumen",
          achievements: "Logros",
          rewards: "Premios",
          mood: "Estado",
          goals: "Objetivos",
          exercises: "Ejercicios",
          health: "Salud"
        },
        dashboard: {
          current_streak: "Racha Actual",
          days: "días",
          points: "Puntos",
          badges: "Insignias",
          level: "Nivel",
          level_prefix: "Nv.",
          avg_mood: "Estado Promedio",
          trend_improving: "mejorando",
          trend_declining: "decayendo",
          trend_stable: "estable",
          goals_achieved: "Objetivos Logrados",
          active: "activo",
          charts: {
            mood_trends: "Tendencias de Estado (Últimos 30 Días)",
            exercise_by_category: "Ejercicios por Categoría",
            journal_consistency: "Consistencia del Diario",
            goal_progress: "Progreso de Objetivos"
          }
        }
      },
      mind_games: {
        page_title: "Juegos Mentales",
        page_subtitle: "Práctica interactiva de habilidades CBT y DBT",
        go_back_aria: "Regresar",
        close_aria: "Cerrar",
        recommended_title: "Recomendado para Ti",
        recommended_subtitle: "Según tu actividad, creemos que disfrutarás estos:",
        thought_quiz: {
          score: "Puntuación",
          next_question: "Siguiente Pregunta"
        },
        games: {
          thought_quiz: { title: "Quiz de Pensamientos", description: "Identifica la trampa de pensamiento en un ejemplo rápido." },
          reframe_pick: { title: "Elegir Reformulación", description: "Elige el pensamiento alternativo más equilibrado." },
          value_compass: { title: "Brújula de Valores", description: "Elige un valor, luego elige una acción pequeña." },
          tiny_experiment: { title: "Experimento Pequeño", description: "Prueba una creencia con un experimento de 2 minutos." },
          quick_win: { title: "Victoria Rápida", description: "Registra una pequeña victoria y genera impulso." },
          calm_bingo: { title: "Bingo Tranquilo", description: "Marca 2 casillas para completar una mini ronda." },
          dbt_stop: { title: "Habilidad STOP", description: "Pausa, respira y elige un próximo paso sabio." },
          opposite_action: { title: "Acción Opuesta", description: "Alinea acciones con objetivos, no con estados de ánimo." },
          urge_surfing: { title: "Surfear el Impulso", description: "Monta un impulso como una ola durante 60 segundos." },
          worry_time: { title: "Tiempo de Preocupación", description: "Aparca preocupaciones ahora, prográmalas más tarde." },
          evidence_balance: { title: "Balance de Evidencia", description: "Sopesa la evidencia y encuentra una conclusión justa." },
          defusion_cards: { title: "Cartas de Defusión", description: "Desconéctate de pensamientos de forma lúdica." },
          tipp_skills: { title: "Habilidades TIPP", description: "Cambia la química corporal rápido para reducir intensidad." },
          accepts: { title: "ACCEPTS", description: "Distrae de emociones abrumadoras eficazmente." },
          willing_hands: { title: "Manos Dispuestas", description: "Práctica de aceptación basada en el cuerpo." },
          half_smile: { title: "Media Sonrisa", description: "Cambia emociones con expresión facial suave." },
          improve: { title: "IMPROVE", description: "Mejora el momento en crisis." },
          leaves_on_stream: { title: "Hojas en el Arroyo", description: "Observa pensamientos flotar sin agarrarlos." },
          expansion: { title: "Expansión", description: "Haz espacio para emociones difíciles." },
          values_check: { title: "Verificación de Valores", description: "Verificación rápida de alineación con tus valores." },
          pros_and_cons: { title: "Pros y Contras", description: "Toma de decisiones sabia en crisis." },
          check_the_facts: { title: "Verifica los Hechos", description: "¿Tu emoción se ajusta a la situación?" },
          self_soothe: { title: "Autocalma 5 Sentidos", description: "Consuélate con experiencias sensoriales." },
          mountain_meditation: { title: "Meditación de la Montaña", description: "Encarna estabilidad y arraigo." }
        },
        content: {
          thought_quiz: {
            items: [
              { prompt: "If I don't do this perfectly, I'm a total failure.", options: ["All-or-nothing thinking", "Mind reading", "Catastrophizing", "Discounting the positive"], explanation: "This treats performance as a strict pass/fail label instead of a spectrum." },
              { prompt: "They haven't replied yet, so they must be upset with me.", options: ["Emotional reasoning", "Mind reading", "Labeling", "Overgeneralization"], explanation: "You're assuming you know what they think without clear evidence." },
              { prompt: "If I make one mistake, everything will fall apart.", options: ["Catastrophizing", "Personalization", "Should statements", "Mental filter"], explanation: "This jumps to the worst-case outcome and treats it as likely." },
              { prompt: "I had an awkward moment today. I always mess things up.", options: ["Overgeneralization", "Mind reading", "Fortune telling", "Disqualifying the positive"], explanation: "One moment gets turned into a sweeping rule about your whole life." },
              { prompt: "I feel anxious, so something bad must be about to happen.", options: ["Emotional reasoning", "Should statements", "Labeling", "Black-and-white thinking"], explanation: "Feelings are treated like facts, even when they're just signals." },
              { prompt: "My friend sounded quiet. It's probably my fault.", options: ["Personalization", "Catastrophizing", "Fortune telling", "Magnification"], explanation: "You're taking responsibility for something that may have many causes." },
              { prompt: "I should be more productive all the time.", options: ["Should statements", "Mental filter", "Mind reading", "Overgeneralization"], explanation: "Rigid rules ('should') create pressure and ignore real human limits." },
              { prompt: "One person criticized me, so I'm probably not good at this.", options: ["Labeling", "Disqualifying the positive", "Magnification", "All-or-nothing thinking"], explanation: "A single critique gets blown up and outweighs the full picture." },
              { prompt: "I did well, but it doesn't count because it was easy.", options: ["Discounting the positive", "Fortune telling", "Personalization", "Catastrophizing"], explanation: "You're dismissing real effort and progress instead of acknowledging it." },
              { prompt: "Everyone noticed my mistake. They must think I'm incompetent.", options: ["Mind reading", "Mental filter", "Emotional reasoning", "Should statements"], explanation: "You're guessing others' judgments without checking the evidence." },
              { prompt: "If I try and it's uncomfortable, that means it's wrong for me.", options: ["Emotional reasoning", "Overgeneralization", "Labeling", "Disqualifying the positive"], explanation: "Discomfort can be part of growth; it doesn't automatically mean danger." },
              { prompt: "I didn't meet my goal today, so I'm never going to change.", options: ["Fortune telling", "Catastrophizing", "Overgeneralization", "All-or-nothing thinking"], explanation: "A single day becomes a permanent prediction, ignoring gradual progress." }
            ],
            advanced: [
              { prompt: "I received constructive feedback, but all I can think about is the one negative comment buried in it.", options: ["Mental filter", "Overgeneralization", "Personalization", "Emotional reasoning"], explanation: "You're filtering out the positive and focusing only on the negative detail." },
              { prompt: "If I set boundaries, people will see me as selfish and abandon me.", options: ["Fortune telling + labeling", "Mind reading + catastrophizing", "Should statements", "Emotional reasoning"], explanation: "This combines mind reading (knowing what they'll think) with catastrophizing (predicting abandonment)." },
              { prompt: "I didn't get the promotion, which proves I'm not competent enough, and I never will be.", options: ["Fortune telling + labeling", "All-or-nothing thinking", "Discounting the positive", "Personalization"], explanation: "This creates a fixed label and predicts a permanent future based on one event." },
              { prompt: "My colleague was curt with me today. I must have done something to upset them, and now the whole team probably thinks poorly of me.", options: ["Personalization + magnification + mind reading", "Catastrophizing + overgeneralization", "Mental filter + should statements", "Emotional reasoning"], explanation: "This combines taking personal blame, blowing up the impact, and assuming you know what others think." },
              { prompt: "I feel uncertain about this decision, which means I'm making the wrong choice.", options: ["Emotional reasoning", "Fortune telling", "All-or-nothing thinking", "Catastrophizing"], explanation: "The feeling of uncertainty is treated as evidence of a bad decision, not just a normal part of choosing." }
            ]
          },
          reframe_pick: {
            items: [
              { situation: "You sent a message and haven't heard back.", automatic_thought: "They're ignoring me because I said something wrong.", choices: ["They're busy. I can wait or follow up later in a calm way.", "They definitely hate me now and I ruined everything.", "I'll never message anyone again so I don't risk feeling this."], why: "It considers multiple possibilities and suggests a reasonable next step." },
              { situation: "You made a small mistake at work/school.", automatic_thought: "I'm terrible at this.", choices: ["One mistake is normal. I can fix it and learn for next time.", "I'm the worst person here. I should quit immediately.", "I'll pretend it didn't happen and avoid anything challenging."], why: "It's specific, realistic, and focused on learning rather than global labels." },
              { situation: "A friend was quiet during your hangout.", automatic_thought: "They must be annoyed with me.", choices: ["I don't know the reason. I can check in kindly or give space.", "It's my fault. I always ruin friendships.", "I should cut them off before they reject me first."], why: "It avoids mind reading and leaves room for a gentle check-in." },
              { situation: "You didn't finish a task you planned.", automatic_thought: "I'm so lazy.", choices: ["I struggled today. I can pick one small next step and restart.", "I'm hopeless. I'll never be consistent at anything.", "I should punish myself until I finally get disciplined."], why: "It acknowledges difficulty and moves toward a doable, compassionate action." },
              { situation: "You feel anxious before an event.", automatic_thought: "This anxiety means the event will go badly.", choices: ["Anxiety is a feeling, not a prediction. I can go anyway and cope.", "Anxiety means danger. I must avoid this at all costs.", "I need to feel zero anxiety before I'm allowed to show up."], why: "It separates feelings from forecasts and supports valued action." },
              { situation: "Someone gave you feedback.", automatic_thought: "I'm not good enough.", choices: ["Feedback can help me improve. I can take what's useful and grow.", "They think I'm incompetent and everyone agrees with them.", "I'll stop trying so no one can judge me again."], why: "It keeps self-worth intact while allowing improvement." },
              { situation: "You didn't get invited to something.", automatic_thought: "Nobody likes me.", choices: ["There could be many reasons. I can reach out or plan something else.", "This proves I'm unlikable and always will be.", "I'll isolate so I don't have to feel left out again."], why: "It avoids overgeneralization and offers flexible, constructive options." },
              { situation: "You're learning a new skill and feel behind.", automatic_thought: "If I'm not fast, I'm not meant for this.", choices: ["Skills grow with practice. I can improve step by step.", "If I'm not immediately great, it's a waste of time.", "I should compare myself nonstop to prove I'm failing."], why: "It supports growth mindset and realistic learning curves." }
            ]
          },
          value_compass: {
            values: [
              { value: "Family", actions: ["Send a kind message to a family member.", "Do one small helpful thing at home.", "Plan 10 minutes of quality time today."] },
              { value: "Health", actions: ["Drink a glass of water right now.", "Take a 2-minute stretch break.", "Step outside for fresh air for 3 minutes."] },
              { value: "Growth", actions: ["Learn one tiny thing (watch/read for 2 minutes).", "Practice a skill for 3 minutes.", "Write one sentence about what you want to improve."] },
              { value: "Friendship", actions: ["Check in with a friend with a simple hello.", "Reply to a message you've been postponing.", "Share one genuine compliment today."] },
              { value: "Courage", actions: ["Do the smallest version of the scary step (10%).", "Name what you fear in one sentence, then proceed anyway.", "Ask one small question instead of assuming."] },
              { value: "Calm", actions: ["Take 5 slow breaths (count 4 in / 4 out).", "Relax your shoulders and jaw for 20 seconds.", "Put your phone down for 2 minutes and reset."] },
              { value: "Creativity", actions: ["Write a silly 1-line idea (no judgment).", "Take a photo of something interesting around you.", "Doodle for 60 seconds."] },
              { value: "Purpose", actions: ["Choose one task that matters and do 2 minutes of it.", "Write your 'why' in 1 sentence.", "Remove one small obstacle from your path today."] }
            ]
          },
          tiny_experiment: {
            items: [
              { belief: "If I ask for help, people will think I'm weak.", experiments: ["Ask one small, specific question and observe the response.", "Ask a trusted person for a tiny favor and note what happens.", "Ask for clarification once instead of guessing."], reflection_question: "What happened?", reflection_options: ["It went better than I feared.", "It was neutral / fine.", "It was uncomfortable, but I handled it."] },
              { belief: "If I say no, people will dislike me.", experiments: ["Say no to a low-stakes request using one polite sentence.", "Offer an alternative (not now / later) instead of automatic yes.", "Pause for 5 seconds before agreeing to anything."], reflection_question: "What did you notice?", reflection_options: ["People respected it.", "Nothing dramatic happened.", "It felt hard, and I survived it."] },
              { belief: "If I make a mistake, it will be a disaster.", experiments: ["Do a small task imperfectly on purpose (10%) and observe outcomes.", "Share a minor correction without apologizing excessively.", "Let one tiny typo exist and see what actually happens."], reflection_question: "What was the outcome?", reflection_options: ["No one cared.", "It was fixable.", "It felt big in my head, smaller in reality."] },
              { belief: "If I don't feel motivated, I can't start.", experiments: ["Start for 2 minutes only, then reassess.", "Set a timer for 90 seconds and do the first step.", "Make the task 10x smaller and begin."], reflection_question: "After starting, how was it?", reflection_options: ["Easier than expected.", "Still hard, but possible.", "I gained a little momentum."] },
              { belief: "If someone is quiet, it must be about me.", experiments: ["Write 3 alternative explanations before reacting.", "Ask a simple check-in question instead of assuming.", "Wait 30 minutes and see if new info appears."], reflection_question: "What did you learn?", reflection_options: ["I didn't have enough evidence.", "There were other explanations.", "Checking in was helpful."] },
              { belief: "I have to do everything right to be accepted.", experiments: ["Share one imperfect draft and request feedback.", "Do one task at 'good enough' level and stop.", "Let someone else choose one detail instead of controlling it."], reflection_question: "How did it go?", reflection_options: ["Good enough worked.", "Acceptance didn't depend on perfection.", "I felt discomfort, and it passed."] },
              { belief: "If I feel anxious, I shouldn't go.", experiments: ["Go for 5 minutes only and reassess.", "Bring one coping tool (water / music / breathing).", "Rate anxiety 0–10 before and after to compare."], reflection_question: "What did you notice?", reflection_options: ["Anxiety changed over time.", "I could function with anxiety present.", "Avoidance wasn't necessary."] },
              { belief: "If I rest, I'm wasting time.", experiments: ["Take a 3-minute break and then return to one small task.", "Rest first, then do 2 minutes of the priority task.", "Track: does a short break help focus?"], reflection_question: "Result?", reflection_options: ["Rest helped me reset.", "No harm done.", "I returned with a bit more clarity."] },
              { belief: "If I don't get it quickly, I'm not capable.", experiments: ["Practice for 3 minutes daily for 3 days and compare.", "Ask one question and notice improvement.", "Write one thing you learned today, even if small."], reflection_question: "What changed?", reflection_options: ["Progress showed up gradually.", "Learning took repetition.", "I was harsher than necessary."] },
              { belief: "I need to feel confident before I act.", experiments: ["Act with 'small courage' for 2 minutes anyway.", "Do the first step while confidence is low.", "Rate confidence after action (not before)."], reflection_question: "After action, how was your confidence?", reflection_options: ["A bit higher.", "About the same, but I did it.", "I learned I can move without perfect confidence."] }
            ]
          },
          quick_win: {
            presets: ["I drank water.", "I took a 2-minute break.", "I sent one message I was avoiding.", "I cleaned one tiny area.", "I did one small task for 2 minutes.", "I took 5 slow breaths.", "I stepped outside for fresh air.", "I asked a question instead of assuming.", "I showed up even though it was uncomfortable.", "I wrote one helpful sentence to myself.", "I stretched my shoulders/neck.", "I ate something nourishing.", "I paused before reacting.", "I said no (or not now) politely.", "I made a small plan for tomorrow.", "I finished a mini-step.", "I noticed a thinking trap and named it.", "I chose 'good enough' and stopped.", "I did something kind for someone.", "I did something kind for myself."]
          },
          calm_bingo: {
            tiles: ["Drink a glass of water", "5 slow breaths", "Relax shoulders + jaw", "Look out a window for 30s", "Stand up and stretch", "Send a kind text", "Tidy one small thing", "Step outside for 2 minutes", "Name 3 things you can see", "Play one calm song", "Write 1 supportive sentence", "Wash your hands slowly", "Move your body for 60s", "Put phone down for 2 minutes", "Smile gently (even 10%)", "Choose one tiny next step"]
          },
          dbt_stop: {
            prompts: [
              { trigger: "You feel a strong urge to react immediately.", steps: [{ key: "S", label: "Stop", text: "Pause. Don't act yet." }, { key: "T", label: "Take a step back", text: "Breathe once. Create a tiny space." }, { key: "O", label: "Observe", text: "Notice: thoughts, feelings, body signals." }, { key: "P", label: "Proceed mindfully", text: "Choose one wise next step." }], next_steps: ["Send a calm, short reply (or wait 10 minutes).", "Ask one clarifying question.", "Do one small grounding action, then decide."] },
              { trigger: "You're about to avoid something important.", steps: [{ key: "S", label: "Stop", text: "Pause avoidance for a moment." }, { key: "T", label: "Take a step back", text: "Exhale slowly and reset posture." }, { key: "O", label: "Observe", text: "What are you afraid will happen?" }, { key: "P", label: "Proceed mindfully", text: "Pick the smallest brave step (10%)." }], next_steps: ["Do 2 minutes of the first step only.", "Make it easier: reduce scope by 50%.", "Text someone: 'I'm starting now—wish me luck.'"] },
              { trigger: "You feel criticized and want to defend yourself fast.", steps: [{ key: "S", label: "Stop", text: "Hold back the instant response." }, { key: "T", label: "Take a step back", text: "Breathe and relax your jaw." }, { key: "O", label: "Observe", text: "What's the goal: to win or to repair?" }, { key: "P", label: "Proceed mindfully", text: "Respond to the goal, not the heat." }], next_steps: ["Say: 'Let me think about that for a moment.'", "Reflect back what you heard in one sentence.", "Ask: 'What would be most helpful right now?'"] },
              { trigger: "You're scrolling/doomscrolling and feel stuck.", steps: [{ key: "S", label: "Stop", text: "Pause scrolling now." }, { key: "T", label: "Take a step back", text: "Put phone down for one breath." }, { key: "O", label: "Observe", text: "Name the feeling in one word." }, { key: "P", label: "Proceed mindfully", text: "Choose one small helpful action." }], next_steps: ["Drink water and stretch for 30 seconds.", "Open a window or step outside for 1 minute.", "Write one tiny next step and do it."] }
            ]
          },
          opposite_action: {
            items: [
              { emotion: "Anxiety", urge: "Avoid / escape", opposite: "Approach gently", choices: ["Show up for 5 minutes, then reassess.", "Do the smallest first step (10%).", "Ask one question instead of avoiding."], note: "Opposite action is for emotions that don't fit the facts or are too intense." },
              { emotion: "Sadness", urge: "Withdraw / isolate", opposite: "Connect or activate", choices: ["Send one simple 'hey' message.", "Step outside for 2 minutes.", "Do a tiny task to build momentum."], note: "Small activation often shifts mood more than waiting for motivation." },
              { emotion: "Anger", urge: "Attack / argue", opposite: "Be gentle and effective", choices: ["Lower voice + slow down your words.", "State one need clearly without blame.", "Take a 2-minute pause before replying."], note: "Opposite action aims for effectiveness, not 'winning.'" },
              { emotion: "Shame", urge: "Hide / disappear", opposite: "Small reveal + self-respect", choices: ["Share a tiny truth with a safe person.", "Stand tall, breathe, and stay present for 30s.", "Do one value-based action anyway."], note: "Shame shrinks with safe connection and self-respect actions." },
              { emotion: "Guilt (too much)", urge: "Over-apologize / self-punish", opposite: "Repair effectively", choices: ["Apologize once, then propose one repair step.", "Ask what would help and listen.", "Stop repeating apologies; act instead."], note: "Effective repair beats endless self-blame." },
              { emotion: "Fear of rejection", urge: "People-please / over-text", opposite: "Balanced boundary", choices: ["Send one message, then wait.", "Do one self-caring action while you wait.", "Remind yourself: 'I can handle uncertainty.'"], note: "Opposite action builds tolerance for uncertainty." }
            ]
          },
          urge_surfing: {
            beginner: [
              { title: "Ride the wave (60 seconds)", steps: ["Name the urge: 'I'm having the urge to ____.'", "Rate intensity 0–10.", "Notice where it lives in the body.", "Breathe slowly for 5 breaths.", "Rate intensity again. (Urges rise and fall.)"], finish_choices: ["Delay 10 minutes (set a timer).", "Do a 2-minute replacement action.", "Ask for support (one message)."] },
              { title: "Surf + redirect", steps: ["Name the urge without judging it.", "Imagine it as a wave—rising, cresting, passing.", "Relax shoulders and jaw.", "Pick one value-based micro-action."], finish_choices: ["Take 10% of a helpful step.", "Move your body for 60 seconds.", "Drink water + reset posture."] }
            ],
            advanced: [
              { title: "Surf independently (90 seconds)", steps: ["Name and rate the urge (0-10).", "Locate it in your body.", "Breathe with it for 10 breaths.", "Notice the peak and decline.", "Rate it again."], finish_choices: ["Delay 20 minutes and reassess.", "Do the opposite action for 5 minutes.", "Journal about what you noticed."] },
              { title: "Surf + value-based action", steps: ["Acknowledge the urge without judgment.", "Watch it like a scientist observing data.", "Let it peak naturally.", "Choose one value-aligned micro-step."], finish_choices: ["Do the tiny step immediately.", "Practice the skill again in 1 hour.", "Note what worked for next time."] }
            ]
          },
          worry_time: {
            items: [
              { worry: "What if I mess up tomorrow?", park_it: "I'll think about this during Worry Time at 6:00 PM for 10 minutes.", tiny_now: ["Write one small preparation step.", "Do 2 minutes of that step now.", "Then return to the present task."] },
              { worry: "What if they're mad at me?", park_it: "I'll revisit this at 7:00 PM for 10 minutes, then decide on a calm follow-up.", tiny_now: ["List 2 alternative explanations.", "Wait 30 minutes before acting.", "Do one calming reset (5 breaths)."] },
              { worry: "What if something bad happens?", park_it: "I'll schedule Worry Time at 5:30 PM for 10 minutes and focus on what's controllable.", tiny_now: ["Name 1 thing you can control today.", "Do the smallest step toward it.", "Return attention to the room."] },
              { worry: "I'm behind; I'll never catch up.", park_it: "I'll worry about this at 6:30 PM for 10 minutes and make a realistic plan.", tiny_now: ["Pick the single next step.", "Work 2 minutes on it.", "Stop and acknowledge progress."] },
              { worry: "What if I disappoint people?", park_it: "I'll revisit this at 8:00 PM for 10 minutes and choose a value-based action.", tiny_now: ["Ask: 'What matters to me here?'", "Choose one respectful sentence/boundary.", "Delay responding for 10 minutes."] },
              { worry: "What if I can't handle it?", park_it: "I'll schedule Worry Time at 7:30 PM for 10 minutes and review coping options.", tiny_now: ["Write 1 coping tool you already use.", "Use it for 60 seconds.", "Continue with the next small task."] }
            ]
          },
          evidence_balance: {
            items: [
              { thought: "I always mess things up.", evidence_for: ["I made a mistake recently.", "I remember failures more than successes."], evidence_against: ["I've done many things well.", "One mistake doesn't define 'always'."], balanced_conclusion: "I've made mistakes and also succeeded. I can learn and improve." },
              { thought: "They don't like me.", evidence_for: ["They replied late once.", "They were quiet last time."], evidence_against: ["They've been friendly before.", "There are many reasons for silence."], balanced_conclusion: "I don't know their thoughts. I can check in calmly or wait for more info." },
              { thought: "If I'm anxious, I can't cope.", evidence_for: ["Anxiety feels intense.", "I want to escape when anxious."], evidence_against: ["I've coped with anxiety before.", "Anxiety rises and falls."], balanced_conclusion: "Anxiety is uncomfortable but manageable. I can act while it's present." },
              { thought: "I'm not improving.", evidence_for: ["Progress feels slow.", "I compare myself to others."], evidence_against: ["I've taken small steps.", "Learning is gradual."], balanced_conclusion: "Progress can be slow and real. Small steps still count." },
              { thought: "I must do everything perfectly.", evidence_for: ["I value quality.", "Perfection sometimes prevents criticism."], evidence_against: ["Perfect isn't required to succeed.", "Good-enough frees time and reduces stress."], balanced_conclusion: "I can aim for quality while allowing 'good enough' when it's effective." },
              { thought: "If I say no, I'll be rejected.", evidence_for: ["I worry about disappointing people.", "I've had conflict before."], evidence_against: ["Many people respect boundaries.", "I can say no politely and offer alternatives."], balanced_conclusion: "Saying no respectfully protects relationships and my wellbeing." }
            ]
          },
          defusion_cards: {
            cards: [
              { thought: "I'm not good enough.", defuse_lines: ["I'm having the thought that I'm not good enough.", "Thanks, mind. Interesting story.", "This is a thought, not a fact."] },
              { thought: "Something bad will happen.", defuse_lines: ["I'm noticing a 'danger prediction' thought.", "My mind is trying to protect me.", "I can take one small step anyway."] },
              { thought: "They're judging me.", defuse_lines: ["I'm having the thought they're judging me.", "I can't read minds. I can act on my values.", "Let this thought ride in the back seat."] },
              { thought: "I can't handle this feeling.", defuse_lines: ["I'm noticing the thought 'I can't handle it'.", "Feelings are waves; they change.", "I can make room and keep going."] },
              { thought: "I must fix everything now.", defuse_lines: ["There's the 'urgent fixer' thought.", "I can pause and choose one wise next step.", "Slow is smooth; smooth is fast."] },
              { thought: "If it's hard, I should quit.", defuse_lines: ["I'm having the thought 'quit'.", "Hard can mean 'new', not 'wrong'.", "I can do the smallest version (10%)."] }
            ]
          },
          tipp_skills: {
            situation: "Your emotions are at 8/10 or higher and you need to come down fast.",
            skills: [
              { letter: "T", name: "Temperature", description: "Cold water on face, ice cube, cold shower" },
              { letter: "I", name: "Intense exercise", description: "Run, jump, push-ups for 60 seconds" },
              { letter: "P", name: "Paced breathing", description: "Breathe out longer than in (4 in / 6 out)" },
              { letter: "P", name: "Paired muscle relaxation", description: "Tense then release muscle groups" }
            ],
            actions: ["Splash cold water on your face for 30 seconds.", "Do 20 jumping jacks right now.", "Breathe: 4 in, hold 4, 6 out—repeat 5 times."]
          },
          accepts: {
            items: [
              { letter: "A", name: "Activities", description: "Do something engaging", action: "Watch a 5-minute video, play a quick game, or clean one surface." },
              { letter: "C", name: "Contributing", description: "Help someone else", action: "Send a kind message, do one helpful thing, or share something useful." },
              { letter: "C", name: "Comparisons", description: "Compare to when you coped before", action: "Remember: You've survived 100% of your worst days so far." },
              { letter: "E", name: "Emotions", description: "Create a different emotion", action: "Watch something funny, listen to upbeat music, or read something calming." },
              { letter: "P", name: "Pushing away", description: "Mentally put the situation aside", action: "Imagine putting the problem in a box on a shelf for later." },
              { letter: "T", name: "Thoughts", description: "Fill your mind with other thoughts", action: "Count backwards from 100 by 7s, list countries A-Z, or describe the room." },
              { letter: "S", name: "Sensations", description: "Create strong physical sensations", action: "Hold ice, take a hot/cold shower, or squeeze a stress ball hard." }
            ]
          },
          improve: {
            items: [
              { letter: "I", name: "Imagery", description: "Visualize a peaceful or safe place", quick_action: "Close your eyes. Picture a place you feel calm (real or imagined)." },
              { letter: "M", name: "Meaning", description: "Find purpose in the pain", quick_action: "Ask: What can I learn? How might this help me grow?" },
              { letter: "P", name: "Prayer", description: "Connect to something larger", quick_action: "Say a phrase that grounds you or ask for support from your values/beliefs." },
              { letter: "R", name: "Relaxation", description: "Relax your body", quick_action: "Tense and release: shoulders, jaw, hands. Breathe slowly." },
              { letter: "O", name: "One thing in the moment", description: "Focus fully on one small task", quick_action: "Pick one action: wash a dish, water a plant, fold one item." },
              { letter: "V", name: "Vacation", description: "Take a brief mental break", quick_action: "Give yourself 10 minutes off from the problem. Set a timer." },
              { letter: "E", name: "Encouragement", description: "Be your own cheerleader", quick_action: "Say: 'I can handle this. I've done hard things before.'" }
            ]
          },
          self_soothe: {
            senses: [
              { sense: "Vision", actions: ["Look at nature or a calming image.", "Watch clouds or water move.", "Light a candle and watch the flame."] },
              { sense: "Hearing", actions: ["Listen to calming music or nature sounds.", "Play a song that makes you feel safe.", "Listen to the sound of rain or wind."] },
              { sense: "Smell", actions: ["Smell something pleasant (lotion, coffee, flowers).", "Light a scented candle or incense.", "Take a deep breath of fresh air."] },
              { sense: "Taste", actions: ["Eat something you enjoy slowly.", "Savor a piece of chocolate or tea.", "Notice the flavors and textures."] },
              { sense: "Touch", actions: ["Hold something soft (blanket, pet).", "Take a warm shower or bath.", "Massage your hands with lotion."] }
            ]
          }
        }
      },
      exercises: {
        page_title: "Biblioteca de Ejercicios",
        page_subtitle: "Practica técnicas CBT",
        page_subtitle_full: "Explora y practica técnicas CBT basadas en evidencia",
        loading: "Cargando ejercicios...",
        go_back_aria: "Regresar",
        ai_plan: "Plan de Práctica IA",
        favorites: "Favoritos",
        search_placeholder: "Buscar ejercicios...",
        empty_state: {
          favorites_title: "Sin favoritos aún",
          no_results_title: "No se encontraron ejercicios",
          favorites_message: "Marca ejercicios como favoritos para verlos aquí",
          search_message: "Intenta ajustar tu búsqueda o filtros",
          no_exercises_message: "No hay ejercicios disponibles"
        },
        library: {
          flexible: "Flexible"
        },
        categories: {
          all: "Todos",
          breathing: "Respiración",
          grounding: "Anclaje",
          cognitive: "Cognitivo",
          behavioral: "Conductual",
          mindfulness: "Atención Plena",
          exposure: "Exposición",
          sleep: "Sueño",
          relationships: "Relaciones",
          stress: "Manejo del Estrés"
        },
        detail: {
          untitled_exercise: "Ejercicio sin Título",
          duration_options_suffix: "min opciones",
          minutes_suffix: "minutos",
          video_label: "Video",
          tabs: {
            overview: "Descripción",
            practice: "Práctica",
            audio: "Audio",
            benefits: "Beneficios",
            tips: "Consejos"
          },
          about: "Acerca de Este Ejercicio",
          guided_visualization: "Visualización Guiada",
          video_demonstration: "Demostración en Video",
          helps_with: "Ayuda Con",
          guided_audio: "Audio Guiado",
          guided_audio_description: "Sigue la guía de audio narrada profesionalmente para este ejercicio.",
          step_by_step_guide: "Guía Paso a Paso",
          step_duration: "Duración: {{seconds}} segundos",
          instructions: "Instrucciones",
          choose_duration: "Elegir Duración",
          key_benefits: "Beneficios Clave",
          default_benefits: "Este ejercicio ayuda a mejorar el bienestar mental, reducir el estrés y mejorar la regulación emocional.",
          helpful_tips: "Consejos Útiles",
          default_tips: "Practica regularmente para obtener mejores resultados. Encuentra un espacio tranquilo, comienza despacio y sé paciente contigo mismo.",
          your_progress: "Tu Progreso",
          times_completed: "Veces Completado",
          minutes_practiced: "Minutos Practicados",
          last_practiced: "Última práctica: {{date}}",
          completed_message: "¡Ejercicio Completado!",
          mark_as_complete: "Marcar como Completado"
        }
      }
    }
  },
  fr: {
    translation: {
      sidebar: {
        home: { name: "Accueil", description: "Tableau de bord et aperçu" },
        chat: { name: "Chat", description: "Thérapeute IA" },
        coach: { name: "Coach", description: "Coach de Bien-être IA" },
        mood: { name: "Humeur", description: "Suivez votre humeur" },
        journal: { name: "Journal", description: "Enregistrements de pensées" },
        progress: { name: "Progrès", description: "Suivez votre parcours" },
        exercises: { name: "Exercices", description: "Techniques CBT" },
        community: { name: "Communauté" },
        resources: { name: "Ressources" },
        settings: { name: "Paramètres" }
      },
      global: {
        app_name: "MindWell",
        app_tagline: "App de Bien-être Mental"
      },
      mobile_menu: {
        menu_title: "Menu",
        open_aria: "Ouvrir le menu",
        close_aria: "Fermer le menu"
      },
      home: {
        greeting: {
          morning: "Bonjour",
          afternoon: "Bon après-midi",
          evening: "Bonsoir"
        },
        active_goals: "Objectifs Actifs",
        journal_entries: "Entrées de Journal",
        error: {
          goals_load: "Impossible de charger les objectifs.",
          journal_load: "Impossible de charger les entrées du journal."
        },
        aria: {
          view_goal_details: "Voir les détails de l'objectif",
          view_journal_entry: "Voir l'entrée de journal",
          watch_help_video: "Regarder la vidéo d'aide",
          watch_goals_help_video: "Regarder la vidéo d'aide des objectifs",
          watch_journal_help_video: "Regarder la vidéo d'aide du journal"
        }
      },
      quick_actions: {
        title: "Actions Rapides",
        recommended: { title: "Recommandé pour Vous", description: "Suggestions personnalisées par IA" },
        ai_therapist: { title: "Thérapeute IA", description: "Parlez à votre thérapeute" },
        journal_thought: { title: "Noter une Pensée", description: "Défiez la pensée" },
        set_goal: { title: "Définir un Objectif", description: "Définir des objectifs" },
        mind_games: { title: "Jeux Mentaux", description: "Exercices mentaux rapides" },
        journeys: { title: "Parcours", description: "Chemins de compétences organisés" },
        exercises_library: { title: "Bibliothèque d'Exercices", description: "Parcourir les techniques" },
        video_library: { title: "Bibliothèque Vidéo", description: "Regarder et apprendre" },
        personalized_recommendations: "Recommandations Personnalisées",
        aria: {
          guided_intro_video: "Vidéo d'introduction guidée",
          close_video: "Fermer la vidéo"
        }
      },
      settings: {
        page_title: "Paramètres",
        page_subtitle: "Gérez votre compte et préférences",
        profile: {
          title: "Profil",
          full_name: "Nom Complet",
          name_placeholder: "Votre nom",
          email: "Email",
          email_readonly: "L'email ne peut pas être modifié",
          role: "Rôle",
          role_admin: "Administrateur",
          role_user: "Utilisateur",
          save_changes: "Enregistrer les Modifications",
          saving: "Enregistrement..."
        },
        language: {
          title: "Langue",
          description: "Choisissez votre langue préférée",
          current: "Langue actuelle",
          en: "English (Anglais)",
          he: "עברית (Hébreu)",
          es: "Español (Espagnol)",
          fr: "Français (French)",
          de: "Deutsch (Allemand)",
          it: "Italiano (Italien)",
          pt: "Português (Portugais)"
        },
        theme: {
          title: "Thème de Couleur",
          description: "Choisissez un thème visuel qui vous convient",
          default: { name: "Par Défaut", description: "Dégradés verts et violets calmes" },
          ocean: { name: "Océan", description: "Bleus et turquoises sereins" },
          sunset: { name: "Coucher de Soleil", description: "Oranges et roses chaleureux" },
          forest: { name: "Forêt", description: "Verts naturels et tons terreux" },
          lavender: { name: "Lavande", description: "Violets et mauves doux" },
          minimal: { name: "Minimaliste", description: "Gris et noirs épurés" }
        },
        dashboard_layout: {
          title: "Disposition du Tableau de Bord",
          description: "Choisissez comment votre tableau de bord d'accueil est organisé",
          default_title: "Par Défaut",
          default_description: "Disposition équilibrée avec toutes les sections",
          compact_title: "Compact",
          compact_description: "Vue condensée pour accès rapide"
        },
        subscription: {
          title: "Abonnement",
          free_trial: "Essai Gratuit",
          active: "Actif",
          description: "Vous êtes actuellement en période d'essai gratuite. Passez à Premium pour un accès illimité à toutes les fonctionnalités.",
          feature_sessions: "✓ Séances de thérapie limitées (5 gratuites)",
          feature_exercises: "✓ Exercices CBT de base",
          feature_mood: "✓ Suivi de l'humeur",
          upgrade_button: "Passer à Premium - 9,99 €/mois",
          premium_benefits: "Premium inclut : Séances illimitées, exercices avancés, support prioritaire, et plus."
        },
        data_privacy: {
          title: "Données et Confidentialité",
          retention_label: "Politique de Conservation des Données",
          retention_description: "Choisissez combien de temps vos enregistrements de thérapie, entrées d'humeur et données de journal sont conservés. Après cette période, les enregistrements peuvent être supprimés automatiquement.",
          retention_30_days: "30 jours",
          retention_90_days: "90 jours",
          retention_1_year: "1 an",
          retention_indefinite: "Conserver indéfiniment",
          current_setting: "Paramètre actuel : {{value}}",
          current_setting_indefinite: "Indéfini",
          current_setting_days: "{{days}} jours",
          export_title: "Exporter Vos Données",
          export_description: "Téléchargez un résumé de vos enregistrements de thérapie, entrées d'humeur et objectifs sous forme de fichier JSON.",
          export_button: "Exporter les Données",
          exporting: "Exportation...",
          delete_title: "Supprimer Toutes les Données",
          delete_description: "Supprimez définitivement tous vos enregistrements de thérapie, entrées d'humeur et données de journal. Cette action ne peut pas être annulée.",
          delete_confirm_prompt: "Êtes-vous sûr ? Cela supprimera définitivement toutes vos données.",
          delete_confirm_button: "Oui, Tout Supprimer",
          deleting: "Suppression...",
          delete_button: "Supprimer Toutes les Données",
          cancel_button: "Annuler",
          retention_saved: "Paramètre de conservation enregistré",
          retention_failed: "Échec de l'enregistrement du paramètre de conservation",
          export_success: "Données exportées avec succès",
          export_failed: "Échec de l'exportation des données",
          delete_success: "Toutes les données ont été effacées avec succès",
          delete_failed: "Échec de la suppression des données",
          privacy_notice: "Avis de Confidentialité : Cette application ne prétend pas être conforme à la HIPAA. Vos données sont stockées en toute sécurité dans notre base de données et soumises à nos conditions d'utilisation. Les demandes de suppression sont traitées immédiatement. Pour toute question sur le traitement des données, contactez le support."
        },
        notifications: {
          title: "Notifications",
          daily_reminders: "Rappels Quotidiens",
          daily_reminders_description: "Recevez un rappel pour vous enregistrer quotidiennement",
          progress_updates: "Mises à Jour de Progrès",
          progress_updates_description: "Résumé hebdomadaire de votre progression",
          goal_reminders: "Rappels d'Objectifs",
          goal_reminders_description: "Notifications sur les échéances d'objectifs",
          exercise_reminders: "Rappels d'Exercices",
          exercise_reminders_description: "Horaires suggérés pour les exercices CBT"
        },
        account: {
          title: "Compte",
          logout: "Se Déconnecter"
        },
        footer: {
          need_help: "Besoin d'aide ?",
          contact_support: "Contacter le Support",
          version: "MindCare CBT Therapist · Version 1.0"
        }
      },
      common: {
        loading: "Chargement...",
        retry: "Réessayer",
        cancel: "Annuler",
        continue: "Continuer",
        return: "Retour",
        close: "Fermer",
        dismiss: "Ignorer",
        complete: "Terminer",
        close_video_aria: "Fermer la vidéo",
        video_not_supported: "Votre navigateur ne prend pas en charge la balise vidéo.",
        audio_not_supported: "Votre navigateur ne prend pas en charge l'élément audio.",
        go_back_aria: "Retour",
        go_back_home_aria: "Retour à l'accueil",
        ai_label: "IA",
        you_label: "Vous",
        minutes_short: "min"
      },
      chat: {
        aria: {
          go_back_home: "Retour à l'accueil",
          open_conversations: "Ouvrir la barre latérale des conversations",
          close_conversations: "Fermer la barre latérale des conversations"
        },
        therapist_title: "Votre Thérapeute",
        therapist_subtitle: "Un espace sûr pour parler",
        welcome: {
          title: "Bienvenue en Thérapie",
          message: "C'est un espace sûr et sans jugement. Partagez ce qui vous préoccupe et travaillons ensemble.",
          start_session: "Commencer Votre Première Séance"
        },
        thinking_placeholder: "Réflexion...",
        summary_prompt: {
          title: "Souhaitez-vous un résumé de session ?",
          description: "Obtenez des points clés, des exercices recommandés et des ressources utiles",
          yes: "Oui, créer un résumé",
          not_now: "Pas maintenant"
        },
        input_placeholder: "Partagez ce qui vous préoccupe...",
        disclaimer: {
          title: "⚠️ Support IA - Pas de Thérapie Professionnelle",
          message: "Ne peut pas diagnostiquer ni prescrire. Crise ? Appelez le 988 (États-Unis) ou vos services d'urgence locaux.",
          strict: "Rappel : Cette IA ne peut pas diagnostiquer de conditions ni prescrire de traitements. Pour les préoccupations médicales, consultez un professionnel agréé.",
          standard: "Rappel : Il s'agit d'un soutien assisté par IA, pas d'une thérapie professionnelle. Les situations d'urgence nécessitent une aide professionnelle immédiate."
        },
        delete_session_failed: "Échec de la suppression de la session. Veuillez réessayer.",
        confirm_delete_session: "Supprimer cette session ? Cette action ne peut pas être annulée.",
        daily_checkin_message: "J'ai terminé mon Check-in Quotidien.",
        consent: {
          lenient: {
            title: "Support de Bien-être IA - Mode Permissif",
            message: "Cette IA fournit une conversation de soutien avec des interruptions minimales. Elle ne peut pas diagnostiquer, prescrire ou remplacer les soins professionnels. Les situations de crise nécessitent une aide professionnelle immédiate."
          },
          standard: {
            title: "Support de Bien-être IA - Mode Standard",
            message: "Cette IA fournit un soutien au bien-être en utilisant des principes CBT fondés sur des preuves. Ce n'est pas un substitut aux soins de santé mentale professionnels et ne peut pas diagnostiquer ni prescrire. En cas de crise, contactez immédiatement les services d'urgence."
          },
          strict: {
            title: "Support de Bien-être IA - Mode de Sécurité Strict",
            message: "Ce mode comprend une surveillance de sécurité améliorée et des rappels fréquents. L'IA ne peut pas diagnostiquer, prescrire ou gérer les urgences. Des soins de santé mentale professionnels sont requis pour les préoccupations cliniques."
          },
          learn_more: "En savoir plus sur les profils de sécurité",
          understand_button: "Je Comprends"
        },
        risk_panel: {
          title: "Nous Sommes Là pour Aider",
          message: "Cette IA ne peut pas fournir de soutien d'urgence. Si vous êtes en crise, veuillez contacter un professionnel immédiatement.",
          crisis_hotline_label: "Ligne de Crise :",
          crisis_hotline_number: "988 (États-Unis)",
          crisis_text_line_label: "Ligne de Texte de Crise :",
          crisis_text_line_number: "Envoyez \"HELLO\" au 741741",
          emergency_label: "Urgence :",
          emergency_number: "911",
          return_to_chat: "Retour au Chat"
        },
        conversations_list: {
          title: "Séances",
          empty_title: "Pas encore de séances",
          empty_message: "Commencez une conversation pour débuter",
          session_prefix: "Séance",
          delete_aria: "Supprimer la séance"
        },
        session_summary: {
          title: "Résumé de Séance",
          key_takeaways: "Points Clés",
          recommended_exercises: "Exercices Recommandés",
          helpful_resources: "Ressources Utiles",
          reflect_button: "Réfléchir dans le Journal",
          view_exercises_button: "Voir Tous les Exercices"
        }
      },
      age_gate: {
        title: "Vérification de l'Âge Requise",
        message: "Nos fonctionnalités de thérapie IA sont conçues pour les adultes de 18 ans et plus. Cela nous aide à fournir un soutien approprié et à maintenir des normes de sécurité.",
        teen_support_heading: "Si vous avez moins de 18 ans et avez besoin de soutien :",
        teen_support: {
          counselor: "• Conseiller scolaire ou adulte de confiance",
          teen_line: "• Teen Line : 1-800-852-8336 (ou envoyez TEEN au 839863)",
          crisis_text_line: "• Ligne de Texte de Crise : Envoyez \"HOME\" au 741741"
        },
        confirm_button: "J'ai 18 Ans ou Plus",
        decline_button: "J'ai Moins de 18 Ans"
      },
      age_restricted: {
        title: "Restreint par Âge",
        message: "Nos fonctionnalités de chat alimentées par l'IA sont conçues pour les utilisateurs de 18 ans et plus. Vous avez toujours accès à d'autres outils de bien-être comme le suivi de l'humeur, le journal et les exercices.",
        back_to_home: "Retour à l'Accueil"
      },
      journeys: {
        page_title: "Parcours",
        page_subtitle: "Chemins guidés de développement des compétences pour la croissance personnelle",
        tabs: {
          available: "Disponible",
          in_progress: "En Cours",
          completed: "Terminé"
        },
        empty_state: {
          no_available: "Aucun parcours disponible pour le moment",
          no_in_progress: "Vous n'avez pas encore commencé de parcours",
          no_completed: "Vous n'avez pas encore terminé de parcours"
        },
        card: {
          days: "jours",
          steps: "étapes",
          progress: "Progrès",
          start_journey: "Commencer le Parcours",
          view_details: "Voir les Détails"
        },
        detail: {
          what_youll_gain: "Ce que vous allez gagner :",
          journey_steps: "Étapes du Parcours",
          day: "Jour",
          play_game: "Jouer",
          reflection_placeholder: "Votre réflexion (facultatif)",
          saving: "Enregistrement...",
          mark_complete: "Marquer Terminé"
        }
      },
      mood_tracker: {
        page_title: "Suivi de l'Humeur",
        page_subtitle: "Suivez votre bien-être émotionnel et découvrez des tendances",
        update_today: "Mettre à Jour Aujourd'hui",
        log_mood: "Enregistrer l'Humeur",
        mood_trends: "Tendances de l'Humeur",
        loading_chart: "Chargement du graphique...",
        no_data: "Pas encore de données d'humeur",
        no_data_subtitle: "Commencez à vous enregistrer quotidiennement pour voir les tendances",
        tabs: {
          overview: "Aperçu",
          calendar: "Calendrier",
          insights: "Perspectives IA"
        },
        time_range: {
          "7_days": "7 jours",
          "14_days": "14 jours",
          "30_days": "30 jours"
        },
        form: {
          title: "Comment vous sentez-vous aujourd'hui ?",
          close_aria: "Fermer le formulaire d'entrée d'humeur",
          date: "Date",
          overall_mood: "Humeur Générale",
          mood_excellent: "Excellent",
          mood_good: "Bien",
          mood_okay: "Correct",
          mood_low: "Bas",
          mood_very_low: "Très Bas",
          emotions_question: "Quelles émotions ressentez-vous ?",
          intensity_label: "Intensité Émotionnelle",
          mild: "Doux",
          intense: "Intense",
          energy_level: "Niveau d'Énergie",
          energy_very_low: "Très Bas",
          energy_low: "Bas",
          energy_moderate: "Modéré",
          energy_high: "Élevé",
          energy_very_high: "Très Élevé",
          sleep_quality: "Qualité du Sommeil",
          sleep_poor: "Mauvais",
          sleep_fair: "Moyen",
          sleep_good: "Bon",
          sleep_excellent: "Excellent",
          stress_level: "Niveau de Stress",
          relaxed: "Détendu",
          very_stressed: "Très Stressé",
          triggers_question: "Qu'est-ce qui a déclenché votre humeur aujourd'hui ?",
          activities_question: "Qu'avez-vous fait aujourd'hui ?",
          notes_label: "Notes Supplémentaires",
          notes_placeholder: "Autres pensées ou observations sur votre journée...",
          save_error: "Impossible d'enregistrer. Vérifiez la connexion et réessayez.",
          saving: "Enregistrement...",
          save_entry: "Enregistrer l'Entrée",
          update_entry: "Mettre à Jour l'Entrée"
        }
      },
      progress: {
        page_title: "Votre Progrès",
        page_subtitle: "Suivez votre parcours",
        page_subtitle_full: "Suivez votre parcours et célébrez votre croissance",
        health_wellness: "Santé et Bien-être",
        tabs: {
          overview: "Aperçu",
          achievements: "Réalisations",
          rewards: "Récompenses",
          mood: "Humeur",
          goals: "Objectifs",
          exercises: "Exercices",
          health: "Santé"
        },
        dashboard: {
          current_streak: "Série Actuelle",
          days: "jours",
          points: "Points",
          badges: "Insignes",
          level: "Niveau",
          level_prefix: "Nv.",
          avg_mood: "Humeur Moyenne",
          trend_improving: "amélioration",
          trend_declining: "déclin",
          trend_stable: "stable",
          goals_achieved: "Objectifs Atteints",
          active: "actif",
          charts: {
            mood_trends: "Tendances de l'Humeur (30 Derniers Jours)",
            exercise_by_category: "Exercices par Catégorie",
            journal_consistency: "Cohérence du Journal",
            goal_progress: "Progrès des Objectifs"
          }
        }
      },
      mind_games: {
        page_title: "Jeux Mentaux",
        page_subtitle: "Pratique interactive des compétences CBT et DBT",
        go_back_aria: "Retour",
        close_aria: "Fermer",
        recommended_title: "Recommandé pour Vous",
        recommended_subtitle: "En fonction de votre activité, nous pensons que vous apprécierez ces:",
        thought_quiz: {
          score: "Score",
          next_question: "Question Suivante"
        },
        games: {
          thought_quiz: { title: "Quiz de Pensées", description: "Repérez le piège de pensée dans un exemple rapide." },
          reframe_pick: { title: "Choix de Recadrage", description: "Choisissez la pensée alternative la plus équilibrée." },
          value_compass: { title: "Boussole de Valeurs", description: "Choisissez une valeur, puis choisissez une petite action." },
          tiny_experiment: { title: "Petite Expérience", description: "Testez une croyance avec une expérience de 2 minutes." },
          quick_win: { title: "Victoire Rapide", description: "Enregistrez une petite victoire et créez de l'élan." },
          calm_bingo: { title: "Bingo Calme", description: "Marquez 2 cases pour compléter un mini tour." },
          dbt_stop: { title: "Compétence STOP", description: "Faites une pause, respirez et choisissez une prochaine étape sage." },
          opposite_action: { title: "Action Opposée", description: "Alignez actions avec objectifs, pas avec humeurs." },
          urge_surfing: { title: "Surfer sur l'Impulsion", description: "Montez une impulsion comme une vague pendant 60 secondes." },
          worry_time: { title: "Temps d'Inquiétude", description: "Garez les inquiétudes maintenant, planifiez-les plus tard." },
          evidence_balance: { title: "Balance de Preuves", description: "Pesez les preuves et trouvez une conclusion juste." },
          defusion_cards: { title: "Cartes de Défusion", description: "Détachez-vous des pensées de manière ludique." },
          tipp_skills: { title: "Compétences TIPP", description: "Changez la chimie corporelle rapidement pour réduire l'intensité." },
          accepts: { title: "ACCEPTS", description: "Distrayez-vous des émotions accablantes efficacement." },
          willing_hands: { title: "Mains Consentantes", description: "Pratique d'acceptation basée sur le corps." },
          half_smile: { title: "Demi-Sourire", description: "Changez les émotions par une expression faciale douce." },
          improve: { title: "IMPROVE", description: "Améliorez le moment en crise." },
          leaves_on_stream: { title: "Feuilles sur le Ruisseau", description: "Regardez les pensées flotter sans les saisir." },
          expansion: { title: "Expansion", description: "Faites de la place pour les émotions difficiles." },
          values_check: { title: "Vérification des Valeurs", description: "Vérification rapide de l'alignement avec vos valeurs." },
          pros_and_cons: { title: "Avantages et Inconvénients", description: "Prise de décision sage en crise." },
          check_the_facts: { title: "Vérifier les Faits", description: "Votre émotion correspond-elle à la situation ?" },
          self_soothe: { title: "Auto-Apaisement 5 Sens", description: "Réconfortez-vous avec des expériences sensorielles." },
          mountain_meditation: { title: "Méditation Montagne", description: "Incarnez stabilité et ancrage." }
        },
        content: {
          thought_quiz: {
            items: [
              { prompt: "If I don't do this perfectly, I'm a total failure.", options: ["All-or-nothing thinking", "Mind reading", "Catastrophizing", "Discounting the positive"], explanation: "This treats performance as a strict pass/fail label instead of a spectrum." },
              { prompt: "They haven't replied yet, so they must be upset with me.", options: ["Emotional reasoning", "Mind reading", "Labeling", "Overgeneralization"], explanation: "You're assuming you know what they think without clear evidence." },
              { prompt: "If I make one mistake, everything will fall apart.", options: ["Catastrophizing", "Personalization", "Should statements", "Mental filter"], explanation: "This jumps to the worst-case outcome and treats it as likely." },
              { prompt: "I had an awkward moment today. I always mess things up.", options: ["Overgeneralization", "Mind reading", "Fortune telling", "Disqualifying the positive"], explanation: "One moment gets turned into a sweeping rule about your whole life." },
              { prompt: "I feel anxious, so something bad must be about to happen.", options: ["Emotional reasoning", "Should statements", "Labeling", "Black-and-white thinking"], explanation: "Feelings are treated like facts, even when they're just signals." },
              { prompt: "My friend sounded quiet. It's probably my fault.", options: ["Personalization", "Catastrophizing", "Fortune telling", "Magnification"], explanation: "You're taking responsibility for something that may have many causes." },
              { prompt: "I should be more productive all the time.", options: ["Should statements", "Mental filter", "Mind reading", "Overgeneralization"], explanation: "Rigid rules ('should') create pressure and ignore real human limits." },
              { prompt: "One person criticized me, so I'm probably not good at this.", options: ["Labeling", "Disqualifying the positive", "Magnification", "All-or-nothing thinking"], explanation: "A single critique gets blown up and outweighs the full picture." },
              { prompt: "I did well, but it doesn't count because it was easy.", options: ["Discounting the positive", "Fortune telling", "Personalization", "Catastrophizing"], explanation: "You're dismissing real effort and progress instead of acknowledging it." },
              { prompt: "Everyone noticed my mistake. They must think I'm incompetent.", options: ["Mind reading", "Mental filter", "Emotional reasoning", "Should statements"], explanation: "You're guessing others' judgments without checking the evidence." },
              { prompt: "If I try and it's uncomfortable, that means it's wrong for me.", options: ["Emotional reasoning", "Overgeneralization", "Labeling", "Disqualifying the positive"], explanation: "Discomfort can be part of growth; it doesn't automatically mean danger." },
              { prompt: "I didn't meet my goal today, so I'm never going to change.", options: ["Fortune telling", "Catastrophizing", "Overgeneralization", "All-or-nothing thinking"], explanation: "A single day becomes a permanent prediction, ignoring gradual progress." }
            ],
            advanced: [
              { prompt: "I received constructive feedback, but all I can think about is the one negative comment buried in it.", options: ["Mental filter", "Overgeneralization", "Personalization", "Emotional reasoning"], explanation: "You're filtering out the positive and focusing only on the negative detail." },
              { prompt: "If I set boundaries, people will see me as selfish and abandon me.", options: ["Fortune telling + labeling", "Mind reading + catastrophizing", "Should statements", "Emotional reasoning"], explanation: "This combines mind reading (knowing what they'll think) with catastrophizing (predicting abandonment)." },
              { prompt: "I didn't get the promotion, which proves I'm not competent enough, and I never will be.", options: ["Fortune telling + labeling", "All-or-nothing thinking", "Discounting the positive", "Personalization"], explanation: "This creates a fixed label and predicts a permanent future based on one event." },
              { prompt: "My colleague was curt with me today. I must have done something to upset them, and now the whole team probably thinks poorly of me.", options: ["Personalization + magnification + mind reading", "Catastrophizing + overgeneralization", "Mental filter + should statements", "Emotional reasoning"], explanation: "This combines taking personal blame, blowing up the impact, and assuming you know what others think." },
              { prompt: "I feel uncertain about this decision, which means I'm making the wrong choice.", options: ["Emotional reasoning", "Fortune telling", "All-or-nothing thinking", "Catastrophizing"], explanation: "The feeling of uncertainty is treated as evidence of a bad decision, not just a normal part of choosing." }
            ]
          },
          reframe_pick: {
            items: [
              { situation: "You sent a message and haven't heard back.", automatic_thought: "They're ignoring me because I said something wrong.", choices: ["They're busy. I can wait or follow up later in a calm way.", "They definitely hate me now and I ruined everything.", "I'll never message anyone again so I don't risk feeling this."], why: "It considers multiple possibilities and suggests a reasonable next step." },
              { situation: "You made a small mistake at work/school.", automatic_thought: "I'm terrible at this.", choices: ["One mistake is normal. I can fix it and learn for next time.", "I'm the worst person here. I should quit immediately.", "I'll pretend it didn't happen and avoid anything challenging."], why: "It's specific, realistic, and focused on learning rather than global labels." },
              { situation: "A friend was quiet during your hangout.", automatic_thought: "They must be annoyed with me.", choices: ["I don't know the reason. I can check in kindly or give space.", "It's my fault. I always ruin friendships.", "I should cut them off before they reject me first."], why: "It avoids mind reading and leaves room for a gentle check-in." },
              { situation: "You didn't finish a task you planned.", automatic_thought: "I'm so lazy.", choices: ["I struggled today. I can pick one small next step and restart.", "I'm hopeless. I'll never be consistent at anything.", "I should punish myself until I finally get disciplined."], why: "It acknowledges difficulty and moves toward a doable, compassionate action." },
              { situation: "You feel anxious before an event.", automatic_thought: "This anxiety means the event will go badly.", choices: ["Anxiety is a feeling, not a prediction. I can go anyway and cope.", "Anxiety means danger. I must avoid this at all costs.", "I need to feel zero anxiety before I'm allowed to show up."], why: "It separates feelings from forecasts and supports valued action." },
              { situation: "Someone gave you feedback.", automatic_thought: "I'm not good enough.", choices: ["Feedback can help me improve. I can take what's useful and grow.", "They think I'm incompetent and everyone agrees with them.", "I'll stop trying so no one can judge me again."], why: "It keeps self-worth intact while allowing improvement." },
              { situation: "You didn't get invited to something.", automatic_thought: "Nobody likes me.", choices: ["There could be many reasons. I can reach out or plan something else.", "This proves I'm unlikable and always will be.", "I'll isolate so I don't have to feel left out again."], why: "It avoids overgeneralization and offers flexible, constructive options." },
              { situation: "You're learning a new skill and feel behind.", automatic_thought: "If I'm not fast, I'm not meant for this.", choices: ["Skills grow with practice. I can improve step by step.", "If I'm not immediately great, it's a waste of time.", "I should compare myself nonstop to prove I'm failing."], why: "It supports growth mindset and realistic learning curves." }
            ]
          },
          value_compass: {
            values: [
              { value: "Family", actions: ["Send a kind message to a family member.", "Do one small helpful thing at home.", "Plan 10 minutes of quality time today."] },
              { value: "Health", actions: ["Drink a glass of water right now.", "Take a 2-minute stretch break.", "Step outside for fresh air for 3 minutes."] },
              { value: "Growth", actions: ["Learn one tiny thing (watch/read for 2 minutes).", "Practice a skill for 3 minutes.", "Write one sentence about what you want to improve."] },
              { value: "Friendship", actions: ["Check in with a friend with a simple hello.", "Reply to a message you've been postponing.", "Share one genuine compliment today."] },
              { value: "Courage", actions: ["Do the smallest version of the scary step (10%).", "Name what you fear in one sentence, then proceed anyway.", "Ask one small question instead of assuming."] },
              { value: "Calm", actions: ["Take 5 slow breaths (count 4 in / 4 out).", "Relax your shoulders and jaw for 20 seconds.", "Put your phone down for 2 minutes and reset."] },
              { value: "Creativity", actions: ["Write a silly 1-line idea (no judgment).", "Take a photo of something interesting around you.", "Doodle for 60 seconds."] },
              { value: "Purpose", actions: ["Choose one task that matters and do 2 minutes of it.", "Write your 'why' in 1 sentence.", "Remove one small obstacle from your path today."] }
            ]
          },
          tiny_experiment: {
            items: [
              { belief: "If I ask for help, people will think I'm weak.", experiments: ["Ask one small, specific question and observe the response.", "Ask a trusted person for a tiny favor and note what happens.", "Ask for clarification once instead of guessing."], reflection_question: "What happened?", reflection_options: ["It went better than I feared.", "It was neutral / fine.", "It was uncomfortable, but I handled it."] },
              { belief: "If I say no, people will dislike me.", experiments: ["Say no to a low-stakes request using one polite sentence.", "Offer an alternative (not now / later) instead of automatic yes.", "Pause for 5 seconds before agreeing to anything."], reflection_question: "What did you notice?", reflection_options: ["People respected it.", "Nothing dramatic happened.", "It felt hard, and I survived it."] },
              { belief: "If I make a mistake, it will be a disaster.", experiments: ["Do a small task imperfectly on purpose (10%) and observe outcomes.", "Share a minor correction without apologizing excessively.", "Let one tiny typo exist and see what actually happens."], reflection_question: "What was the outcome?", reflection_options: ["No one cared.", "It was fixable.", "It felt big in my head, smaller in reality."] },
              { belief: "If I don't feel motivated, I can't start.", experiments: ["Start for 2 minutes only, then reassess.", "Set a timer for 90 seconds and do the first step.", "Make the task 10x smaller and begin."], reflection_question: "After starting, how was it?", reflection_options: ["Easier than expected.", "Still hard, but possible.", "I gained a little momentum."] },
              { belief: "If someone is quiet, it must be about me.", experiments: ["Write 3 alternative explanations before reacting.", "Ask a simple check-in question instead of assuming.", "Wait 30 minutes and see if new info appears."], reflection_question: "What did you learn?", reflection_options: ["I didn't have enough evidence.", "There were other explanations.", "Checking in was helpful."] },
              { belief: "I have to do everything right to be accepted.", experiments: ["Share one imperfect draft and request feedback.", "Do one task at 'good enough' level and stop.", "Let someone else choose one detail instead of controlling it."], reflection_question: "How did it go?", reflection_options: ["Good enough worked.", "Acceptance didn't depend on perfection.", "I felt discomfort, and it passed."] },
              { belief: "If I feel anxious, I shouldn't go.", experiments: ["Go for 5 minutes only and reassess.", "Bring one coping tool (water / music / breathing).", "Rate anxiety 0–10 before and after to compare."], reflection_question: "What did you notice?", reflection_options: ["Anxiety changed over time.", "I could function with anxiety present.", "Avoidance wasn't necessary."] },
              { belief: "If I rest, I'm wasting time.", experiments: ["Take a 3-minute break and then return to one small task.", "Rest first, then do 2 minutes of the priority task.", "Track: does a short break help focus?"], reflection_question: "Result?", reflection_options: ["Rest helped me reset.", "No harm done.", "I returned with a bit more clarity."] },
              { belief: "If I don't get it quickly, I'm not capable.", experiments: ["Practice for 3 minutes daily for 3 days and compare.", "Ask one question and notice improvement.", "Write one thing you learned today, even if small."], reflection_question: "What changed?", reflection_options: ["Progress showed up gradually.", "Learning took repetition.", "I was harsher than necessary."] },
              { belief: "I need to feel confident before I act.", experiments: ["Act with 'small courage' for 2 minutes anyway.", "Do the first step while confidence is low.", "Rate confidence after action (not before)."], reflection_question: "After action, how was your confidence?", reflection_options: ["A bit higher.", "About the same, but I did it.", "I learned I can move without perfect confidence."] }
            ]
          },
          quick_win: {
            presets: ["I drank water.", "I took a 2-minute break.", "I sent one message I was avoiding.", "I cleaned one tiny area.", "I did one small task for 2 minutes.", "I took 5 slow breaths.", "I stepped outside for fresh air.", "I asked a question instead of assuming.", "I showed up even though it was uncomfortable.", "I wrote one helpful sentence to myself.", "I stretched my shoulders/neck.", "I ate something nourishing.", "I paused before reacting.", "I said no (or not now) politely.", "I made a small plan for tomorrow.", "I finished a mini-step.", "I noticed a thinking trap and named it.", "I chose 'good enough' and stopped.", "I did something kind for someone.", "I did something kind for myself."]
          },
          calm_bingo: {
            tiles: ["Drink a glass of water", "5 slow breaths", "Relax shoulders + jaw", "Look out a window for 30s", "Stand up and stretch", "Send a kind text", "Tidy one small thing", "Step outside for 2 minutes", "Name 3 things you can see", "Play one calm song", "Write 1 supportive sentence", "Wash your hands slowly", "Move your body for 60s", "Put phone down for 2 minutes", "Smile gently (even 10%)", "Choose one tiny next step"]
          },
          dbt_stop: {
            prompts: [
              { trigger: "You feel a strong urge to react immediately.", steps: [{ key: "S", label: "Stop", text: "Pause. Don't act yet." }, { key: "T", label: "Take a step back", text: "Breathe once. Create a tiny space." }, { key: "O", label: "Observe", text: "Notice: thoughts, feelings, body signals." }, { key: "P", label: "Proceed mindfully", text: "Choose one wise next step." }], next_steps: ["Send a calm, short reply (or wait 10 minutes).", "Ask one clarifying question.", "Do one small grounding action, then decide."] },
              { trigger: "You're about to avoid something important.", steps: [{ key: "S", label: "Stop", text: "Pause avoidance for a moment." }, { key: "T", label: "Take a step back", text: "Exhale slowly and reset posture." }, { key: "O", label: "Observe", text: "What are you afraid will happen?" }, { key: "P", label: "Proceed mindfully", text: "Pick the smallest brave step (10%)." }], next_steps: ["Do 2 minutes of the first step only.", "Make it easier: reduce scope by 50%.", "Text someone: 'I'm starting now—wish me luck.'"] },
              { trigger: "You feel criticized and want to defend yourself fast.", steps: [{ key: "S", label: "Stop", text: "Hold back the instant response." }, { key: "T", label: "Take a step back", text: "Breathe and relax your jaw." }, { key: "O", label: "Observe", text: "What's the goal: to win or to repair?" }, { key: "P", label: "Proceed mindfully", text: "Respond to the goal, not the heat." }], next_steps: ["Say: 'Let me think about that for a moment.'", "Reflect back what you heard in one sentence.", "Ask: 'What would be most helpful right now?'"] },
              { trigger: "You're scrolling/doomscrolling and feel stuck.", steps: [{ key: "S", label: "Stop", text: "Pause scrolling now." }, { key: "T", label: "Take a step back", text: "Put phone down for one breath." }, { key: "O", label: "Observe", text: "Name the feeling in one word." }, { key: "P", label: "Proceed mindfully", text: "Choose one small helpful action." }], next_steps: ["Drink water and stretch for 30 seconds.", "Open a window or step outside for 1 minute.", "Write one tiny next step and do it."] }
            ]
          },
          opposite_action: {
            items: [
              { emotion: "Anxiety", urge: "Avoid / escape", opposite: "Approach gently", choices: ["Show up for 5 minutes, then reassess.", "Do the smallest first step (10%).", "Ask one question instead of avoiding."], note: "Opposite action is for emotions that don't fit the facts or are too intense." },
              { emotion: "Sadness", urge: "Withdraw / isolate", opposite: "Connect or activate", choices: ["Send one simple 'hey' message.", "Step outside for 2 minutes.", "Do a tiny task to build momentum."], note: "Small activation often shifts mood more than waiting for motivation." },
              { emotion: "Anger", urge: "Attack / argue", opposite: "Be gentle and effective", choices: ["Lower voice + slow down your words.", "State one need clearly without blame.", "Take a 2-minute pause before replying."], note: "Opposite action aims for effectiveness, not 'winning.'" },
              { emotion: "Shame", urge: "Hide / disappear", opposite: "Small reveal + self-respect", choices: ["Share a tiny truth with a safe person.", "Stand tall, breathe, and stay present for 30s.", "Do one value-based action anyway."], note: "Shame shrinks with safe connection and self-respect actions." },
              { emotion: "Guilt (too much)", urge: "Over-apologize / self-punish", opposite: "Repair effectively", choices: ["Apologize once, then propose one repair step.", "Ask what would help and listen.", "Stop repeating apologies; act instead."], note: "Effective repair beats endless self-blame." },
              { emotion: "Fear of rejection", urge: "People-please / over-text", opposite: "Balanced boundary", choices: ["Send one message, then wait.", "Do one self-caring action while you wait.", "Remind yourself: 'I can handle uncertainty.'"], note: "Opposite action builds tolerance for uncertainty." }
            ]
          },
          urge_surfing: {
            beginner: [
              { title: "Ride the wave (60 seconds)", steps: ["Name the urge: 'I'm having the urge to ____.'", "Rate intensity 0–10.", "Notice where it lives in the body.", "Breathe slowly for 5 breaths.", "Rate intensity again. (Urges rise and fall.)"], finish_choices: ["Delay 10 minutes (set a timer).", "Do a 2-minute replacement action.", "Ask for support (one message)."] },
              { title: "Surf + redirect", steps: ["Name the urge without judging it.", "Imagine it as a wave—rising, cresting, passing.", "Relax shoulders and jaw.", "Pick one value-based micro-action."], finish_choices: ["Take 10% of a helpful step.", "Move your body for 60 seconds.", "Drink water + reset posture."] }
            ],
            advanced: [
              { title: "Surf independently (90 seconds)", steps: ["Name and rate the urge (0-10).", "Locate it in your body.", "Breathe with it for 10 breaths.", "Notice the peak and decline.", "Rate it again."], finish_choices: ["Delay 20 minutes and reassess.", "Do the opposite action for 5 minutes.", "Journal about what you noticed."] },
              { title: "Surf + value-based action", steps: ["Acknowledge the urge without judgment.", "Watch it like a scientist observing data.", "Let it peak naturally.", "Choose one value-aligned micro-step."], finish_choices: ["Do the tiny step immediately.", "Practice the skill again in 1 hour.", "Note what worked for next time."] }
            ]
          },
          worry_time: {
            items: [
              { worry: "What if I mess up tomorrow?", park_it: "I'll think about this during Worry Time at 6:00 PM for 10 minutes.", tiny_now: ["Write one small preparation step.", "Do 2 minutes of that step now.", "Then return to the present task."] },
              { worry: "What if they're mad at me?", park_it: "I'll revisit this at 7:00 PM for 10 minutes, then decide on a calm follow-up.", tiny_now: ["List 2 alternative explanations.", "Wait 30 minutes before acting.", "Do one calming reset (5 breaths)."] },
              { worry: "What if something bad happens?", park_it: "I'll schedule Worry Time at 5:30 PM for 10 minutes and focus on what's controllable.", tiny_now: ["Name 1 thing you can control today.", "Do the smallest step toward it.", "Return attention to the room."] },
              { worry: "I'm behind; I'll never catch up.", park_it: "I'll worry about this at 6:30 PM for 10 minutes and make a realistic plan.", tiny_now: ["Pick the single next step.", "Work 2 minutes on it.", "Stop and acknowledge progress."] },
              { worry: "What if I disappoint people?", park_it: "I'll revisit this at 8:00 PM for 10 minutes and choose a value-based action.", tiny_now: ["Ask: 'What matters to me here?'", "Choose one respectful sentence/boundary.", "Delay responding for 10 minutes."] },
              { worry: "What if I can't handle it?", park_it: "I'll schedule Worry Time at 7:30 PM for 10 minutes and review coping options.", tiny_now: ["Write 1 coping tool you already use.", "Use it for 60 seconds.", "Continue with the next small task."] }
            ]
          },
          evidence_balance: {
            items: [
              { thought: "I always mess things up.", evidence_for: ["I made a mistake recently.", "I remember failures more than successes."], evidence_against: ["I've done many things well.", "One mistake doesn't define 'always'."], balanced_conclusion: "I've made mistakes and also succeeded. I can learn and improve." },
              { thought: "They don't like me.", evidence_for: ["They replied late once.", "They were quiet last time."], evidence_against: ["They've been friendly before.", "There are many reasons for silence."], balanced_conclusion: "I don't know their thoughts. I can check in calmly or wait for more info." },
              { thought: "If I'm anxious, I can't cope.", evidence_for: ["Anxiety feels intense.", "I want to escape when anxious."], evidence_against: ["I've coped with anxiety before.", "Anxiety rises and falls."], balanced_conclusion: "Anxiety is uncomfortable but manageable. I can act while it's present." },
              { thought: "I'm not improving.", evidence_for: ["Progress feels slow.", "I compare myself to others."], evidence_against: ["I've taken small steps.", "Learning is gradual."], balanced_conclusion: "Progress can be slow and real. Small steps still count." },
              { thought: "I must do everything perfectly.", evidence_for: ["I value quality.", "Perfection sometimes prevents criticism."], evidence_against: ["Perfect isn't required to succeed.", "Good-enough frees time and reduces stress."], balanced_conclusion: "I can aim for quality while allowing 'good enough' when it's effective." },
              { thought: "If I say no, I'll be rejected.", evidence_for: ["I worry about disappointing people.", "I've had conflict before."], evidence_against: ["Many people respect boundaries.", "I can say no politely and offer alternatives."], balanced_conclusion: "Saying no respectfully protects relationships and my wellbeing." }
            ]
          },
          defusion_cards: {
            cards: [
              { thought: "I'm not good enough.", defuse_lines: ["I'm having the thought that I'm not good enough.", "Thanks, mind. Interesting story.", "This is a thought, not a fact."] },
              { thought: "Something bad will happen.", defuse_lines: ["I'm noticing a 'danger prediction' thought.", "My mind is trying to protect me.", "I can take one small step anyway."] },
              { thought: "They're judging me.", defuse_lines: ["I'm having the thought they're judging me.", "I can't read minds. I can act on my values.", "Let this thought ride in the back seat."] },
              { thought: "I can't handle this feeling.", defuse_lines: ["I'm noticing the thought 'I can't handle it'.", "Feelings are waves; they change.", "I can make room and keep going."] },
              { thought: "I must fix everything now.", defuse_lines: ["There's the 'urgent fixer' thought.", "I can pause and choose one wise next step.", "Slow is smooth; smooth is fast."] },
              { thought: "If it's hard, I should quit.", defuse_lines: ["I'm having the thought 'quit'.", "Hard can mean 'new', not 'wrong'.", "I can do the smallest version (10%)."] }
            ]
          },
          tipp_skills: {
            situation: "Your emotions are at 8/10 or higher and you need to come down fast.",
            skills: [
              { letter: "T", name: "Temperature", description: "Cold water on face, ice cube, cold shower" },
              { letter: "I", name: "Intense exercise", description: "Run, jump, push-ups for 60 seconds" },
              { letter: "P", name: "Paced breathing", description: "Breathe out longer than in (4 in / 6 out)" },
              { letter: "P", name: "Paired muscle relaxation", description: "Tense then release muscle groups" }
            ],
            actions: ["Splash cold water on your face for 30 seconds.", "Do 20 jumping jacks right now.", "Breathe: 4 in, hold 4, 6 out—repeat 5 times."]
          },
          accepts: {
            items: [
              { letter: "A", name: "Activities", description: "Do something engaging", action: "Watch a 5-minute video, play a quick game, or clean one surface." },
              { letter: "C", name: "Contributing", description: "Help someone else", action: "Send a kind message, do one helpful thing, or share something useful." },
              { letter: "C", name: "Comparisons", description: "Compare to when you coped before", action: "Remember: You've survived 100% of your worst days so far." },
              { letter: "E", name: "Emotions", description: "Create a different emotion", action: "Watch something funny, listen to upbeat music, or read something calming." },
              { letter: "P", name: "Pushing away", description: "Mentally put the situation aside", action: "Imagine putting the problem in a box on a shelf for later." },
              { letter: "T", name: "Thoughts", description: "Fill your mind with other thoughts", action: "Count backwards from 100 by 7s, list countries A-Z, or describe the room." },
              { letter: "S", name: "Sensations", description: "Create strong physical sensations", action: "Hold ice, take a hot/cold shower, or squeeze a stress ball hard." }
            ]
          },
          improve: {
            items: [
              { letter: "I", name: "Imagery", description: "Visualize a peaceful or safe place", quick_action: "Close your eyes. Picture a place you feel calm (real or imagined)." },
              { letter: "M", name: "Meaning", description: "Find purpose in the pain", quick_action: "Ask: What can I learn? How might this help me grow?" },
              { letter: "P", name: "Prayer", description: "Connect to something larger", quick_action: "Say a phrase that grounds you or ask for support from your values/beliefs." },
              { letter: "R", name: "Relaxation", description: "Relax your body", quick_action: "Tense and release: shoulders, jaw, hands. Breathe slowly." },
              { letter: "O", name: "One thing in the moment", description: "Focus fully on one small task", quick_action: "Pick one action: wash a dish, water a plant, fold one item." },
              { letter: "V", name: "Vacation", description: "Take a brief mental break", quick_action: "Give yourself 10 minutes off from the problem. Set a timer." },
              { letter: "E", name: "Encouragement", description: "Be your own cheerleader", quick_action: "Say: 'I can handle this. I've done hard things before.'" }
            ]
          },
          self_soothe: {
            senses: [
              { sense: "Vision", actions: ["Look at nature or a calming image.", "Watch clouds or water move.", "Light a candle and watch the flame."] },
              { sense: "Hearing", actions: ["Listen to calming music or nature sounds.", "Play a song that makes you feel safe.", "Listen to the sound of rain or wind."] },
              { sense: "Smell", actions: ["Smell something pleasant (lotion, coffee, flowers).", "Light a scented candle or incense.", "Take a deep breath of fresh air."] },
              { sense: "Taste", actions: ["Eat something you enjoy slowly.", "Savor a piece of chocolate or tea.", "Notice the flavors and textures."] },
              { sense: "Touch", actions: ["Hold something soft (blanket, pet).", "Take a warm shower or bath.", "Massage your hands with lotion."] }
            ]
          }
        }
      },
      exercises: {
        page_title: "Bibliothèque d'Exercices",
        page_subtitle: "Pratiquer les techniques CBT",
        page_subtitle_full: "Parcourir et pratiquer les techniques CBT fondées sur des preuves",
        loading: "Chargement des exercices...",
        go_back_aria: "Retour",
        ai_plan: "Plan de Pratique IA",
        favorites: "Favoris",
        search_placeholder: "Rechercher des exercices...",
        empty_state: {
          favorites_title: "Pas encore de favoris",
          no_results_title: "Aucun exercice trouvé",
          favorites_message: "Marquez les exercices comme favoris pour les voir ici",
          search_message: "Essayez d'ajuster votre recherche ou vos filtres",
          no_exercises_message: "Aucun exercice disponible"
        },
        library: {
          flexible: "Flexible"
        },
        categories: {
          all: "Tous",
          breathing: "Respiration",
          grounding: "Ancrage",
          cognitive: "Cognitif",
          behavioral: "Comportemental",
          mindfulness: "Pleine Conscience",
          exposure: "Exposition",
          sleep: "Sommeil",
          relationships: "Relations",
          stress: "Gestion du Stress"
        },
        detail: {
          untitled_exercise: "Exercice sans Titre",
          duration_options_suffix: "min options",
          minutes_suffix: "minutes",
          video_label: "Vidéo",
          tabs: {
            overview: "Aperçu",
            practice: "Pratique",
            audio: "Audio",
            benefits: "Avantages",
            tips: "Conseils"
          },
          about: "À Propos de Cet Exercice",
          guided_visualization: "Visualisation Guidée",
          video_demonstration: "Démonstration Vidéo",
          helps_with: "Aide Avec",
          guided_audio: "Audio Guidé",
          guided_audio_description: "Suivez le guide audio narré professionnellement pour cet exercice.",
          step_by_step_guide: "Guide Étape par Étape",
          step_duration: "Durée : {{seconds}} secondes",
          instructions: "Instructions",
          choose_duration: "Choisir la Durée",
          key_benefits: "Avantages Clés",
          default_benefits: "Cet exercice aide à améliorer le bien-être mental, réduire le stress et améliorer la régulation émotionnelle.",
          helpful_tips: "Conseils Utiles",
          default_tips: "Pratiquez régulièrement pour de meilleurs résultats. Trouvez un espace calme, commencez lentement et soyez patient avec vous-même.",
          your_progress: "Votre Progrès",
          times_completed: "Fois Terminé",
          minutes_practiced: "Minutes Pratiquées",
          last_practiced: "Dernière pratique : {{date}}",
          completed_message: "Exercice Terminé !",
          mark_as_complete: "Marquer comme Terminé"
        }
      }
    }
  },
  de: {
    translation: {
      sidebar: {
        home: { name: "Startseite", description: "Dashboard & Übersicht" },
        chat: { name: "Chat", description: "KI-Therapeut" },
        coach: { name: "Coach", description: "KI-Wellness-Coach" },
        mood: { name: "Stimmung", description: "Verfolgen Sie Ihre Stimmung" },
        journal: { name: "Tagebuch", description: "Gedankenaufzeichnungen" },
        progress: { name: "Fortschritt", description: "Verfolgen Sie Ihre Reise" },
        exercises: { name: "Übungen", description: "CBT-Techniken" },
        community: { name: "Community" },
        resources: { name: "Ressourcen" },
        settings: { name: "Einstellungen" }
      },
      global: {
        app_name: "MindWell",
        app_tagline: "Mental-Wellness-App"
      },
      mobile_menu: {
        menu_title: "Menü",
        open_aria: "Menü öffnen",
        close_aria: "Menü schließen"
      },
      home: {
        greeting: {
          morning: "Guten Morgen",
          afternoon: "Guten Tag",
          evening: "Guten Abend"
        },
        active_goals: "Aktive Ziele",
        journal_entries: "Tagebucheinträge",
        error: {
          goals_load: "Ziele konnten nicht geladen werden.",
          journal_load: "Tagebucheinträge konnten nicht geladen werden."
        },
        aria: {
          view_goal_details: "Zieldetails anzeigen",
          view_journal_entry: "Tagebucheintrag anzeigen",
          watch_help_video: "Hilfevideo ansehen",
          watch_goals_help_video: "Ziele-Hilfevideo ansehen",
          watch_journal_help_video: "Tagebuch-Hilfevideo ansehen"
        }
      },
      quick_actions: {
        title: "Schnellaktionen",
        recommended: { title: "Für Sie Empfohlen", description: "KI-maßgeschneiderte Vorschläge" },
        ai_therapist: { title: "KI-Therapeut", description: "Sprechen Sie mit Ihrem Therapeuten" },
        journal_thought: { title: "Gedanken Aufzeichnen", description: "Denken hinterfragen" },
        set_goal: { title: "Ziel Setzen", description: "Ziele definieren" },
        mind_games: { title: "Gedankenspiele", description: "Schnelle mentale Übungen" },
        journeys: { title: "Reisen", description: "Kuratierte Fähigkeitspfade" },
        exercises_library: { title: "Übungsbibliothek", description: "Techniken durchsuchen" },
        video_library: { title: "Videobibliothek", description: "Ansehen und lernen" },
        personalized_recommendations: "Personalisierte Empfehlungen",
        aria: {
          guided_intro_video: "Geführtes Einführungsvideo",
          close_video: "Video schließen"
        }
      },
      settings: {
        page_title: "Einstellungen",
        page_subtitle: "Verwalten Sie Ihr Konto und Ihre Präferenzen",
        profile: {
          title: "Profil",
          full_name: "Vollständiger Name",
          name_placeholder: "Ihr Name",
          email: "E-Mail",
          email_readonly: "E-Mail kann nicht geändert werden",
          role: "Rolle",
          role_admin: "Administrator",
          role_user: "Benutzer",
          save_changes: "Änderungen Speichern",
          saving: "Speichern..."
        },
        language: {
          title: "Sprache",
          description: "Wählen Sie Ihre bevorzugte Sprache",
          current: "Aktuelle Sprache",
          en: "English (Englisch)",
          he: "עברית (Hebräisch)",
          es: "Español (Spanisch)",
          fr: "Français (Französisch)",
          de: "Deutsch (German)",
          it: "Italiano (Italienisch)",
          pt: "Português (Portugiesisch)"
        },
        theme: {
          title: "Farbthema",
          description: "Wählen Sie ein visuelles Thema, das sich für Sie angenehm anfühlt",
          default: { name: "Standard", description: "Ruhige grüne und violette Verläufe" },
          ocean: { name: "Ozean", description: "Heitere Blau- und Türkistöne" },
          sunset: { name: "Sonnenuntergang", description: "Warme Orange- und Rosatöne" },
          forest: { name: "Wald", description: "Natürliche Grüntöne und Erdtöne" },
          lavender: { name: "Lavendel", description: "Sanfte Violett- und Fliedertöne" },
          minimal: { name: "Minimal", description: "Saubere Grau- und Schwarztöne" }
        },
        dashboard_layout: {
          title: "Dashboard-Layout",
          description: "Wählen Sie, wie Ihr Startseiten-Dashboard organisiert ist",
          default_title: "Standard",
          default_description: "Ausgewogenes Layout mit allen Abschnitten",
          compact_title: "Kompakt",
          compact_description: "Verdichtete Ansicht für schnellen Zugriff"
        },
        subscription: {
          title: "Abonnement",
          free_trial: "Kostenlose Testversion",
          active: "Aktiv",
          description: "Sie befinden sich derzeit in einer kostenlosen Testversion. Upgraden Sie auf Premium für unbegrenzten Zugriff auf alle Funktionen.",
          feature_sessions: "✓ Begrenzte Therapiesitzungen (5 kostenlos)",
          feature_exercises: "✓ Grund-CBT-Übungen",
          feature_mood: "✓ Stimmungsverfolgung",
          upgrade_button: "Auf Premium upgraden - 9,99 €/Monat",
          premium_benefits: "Premium beinhaltet: Unbegrenzte Sitzungen, erweiterte Übungen, bevorzugter Support und mehr."
        },
        data_privacy: {
          title: "Daten & Datenschutz",
          retention_label: "Datenaufbewahrungsrichtlinie",
          retention_description: "Wählen Sie, wie lange Ihre Therapieaufzeichnungen, Stimmungseinträge und Tagebuchdaten aufbewahrt werden. Nach diesem Zeitraum können Aufzeichnungen automatisch gelöscht werden.",
          retention_30_days: "30 Tage",
          retention_90_days: "90 Tage",
          retention_1_year: "1 Jahr",
          retention_indefinite: "Unbegrenzt aufbewahren",
          current_setting: "Aktuelle Einstellung: {{value}}",
          current_setting_indefinite: "Unbegrenzt",
          current_setting_days: "{{days}} Tage",
          export_title: "Ihre Daten Exportieren",
          export_description: "Laden Sie eine Zusammenfassung Ihrer Therapieaufzeichnungen, Stimmungseinträge und Ziele als JSON-Datei herunter.",
          export_button: "Daten Exportieren",
          exporting: "Exportiere...",
          delete_title: "Alle Daten Löschen",
          delete_description: "Entfernen Sie dauerhaft alle Ihre Therapieaufzeichnungen, Stimmungseinträge und Tagebuchdaten. Diese Aktion kann nicht rückgängig gemacht werden.",
          delete_confirm_prompt: "Sind Sie sicher? Dies wird alle Ihre Daten dauerhaft löschen.",
          delete_confirm_button: "Ja, Alles Löschen",
          deleting: "Löschen...",
          delete_button: "Alle Daten Löschen",
          cancel_button: "Abbrechen",
          retention_saved: "Aufbewahrungseinstellung gespeichert",
          retention_failed: "Speichern der Aufbewahrungseinstellung fehlgeschlagen",
          export_success: "Daten erfolgreich exportiert",
          export_failed: "Datenexport fehlgeschlagen",
          delete_success: "Alle Daten erfolgreich gelöscht",
          delete_failed: "Löschen der Daten fehlgeschlagen",
          privacy_notice: "Datenschutzhinweis: Diese App erhebt keinen Anspruch auf HIPAA-Konformität. Ihre Daten werden sicher in unserer Datenbank gespeichert und unterliegen unseren Nutzungsbedingungen. Löschanfragen werden sofort bearbeitet. Bei Fragen zur Datenverarbeitung wenden Sie sich an den Support."
        },
        notifications: {
          title: "Benachrichtigungen",
          daily_reminders: "Tägliche Erinnerungen",
          daily_reminders_description: "Erhalten Sie tägliche Erinnerungen zum Check-in",
          progress_updates: "Fortschrittsaktualisierungen",
          progress_updates_description: "Wöchentliche Zusammenfassung Ihres Fortschritts",
          goal_reminders: "Zielerinnerungen",
          goal_reminders_description: "Benachrichtigungen über Zielfristen",
          exercise_reminders: "Übungserinnerungen",
          exercise_reminders_description: "Vorgeschlagene Zeiten für CBT-Übungen"
        },
        account: {
          title: "Konto",
          logout: "Abmelden"
        },
        footer: {
          need_help: "Brauchen Sie Hilfe?",
          contact_support: "Support Kontaktieren",
          version: "MindCare CBT Therapist · Version 1.0"
        }
      },
      common: {
        loading: "Lädt...",
        retry: "Erneut Versuchen",
        cancel: "Abbrechen",
        continue: "Weiter",
        return: "Zurück",
        close: "Schließen",
        dismiss: "Verwerfen",
        complete: "Abschließen",
        close_video_aria: "Video schließen",
        video_not_supported: "Ihr Browser unterstützt das Video-Tag nicht.",
        audio_not_supported: "Ihr Browser unterstützt das Audio-Element nicht.",
        go_back_aria: "Zurück",
        go_back_home_aria: "Zurück zur Startseite",
        ai_label: "KI",
        you_label: "Sie",
        minutes_short: "Min"
      },
      chat: {
        aria: {
          go_back_home: "Zurück zur Startseite",
          open_conversations: "Konversationsseitenleiste öffnen",
          close_conversations: "Konversationsseitenleiste schließen"
        },
        therapist_title: "Ihr Therapeut",
        therapist_subtitle: "Ein sicherer Raum zum Reden",
        welcome: {
          title: "Willkommen zur Therapie",
          message: "Dies ist ein sicherer, urteilsfreier Raum. Teilen Sie, was Ihnen durch den Kopf geht, und lassen Sie uns gemeinsam daran arbeiten.",
          start_session: "Erste Sitzung Starten"
        },
        thinking_placeholder: "Denkt nach...",
        summary_prompt: {
          title: "Möchten Sie eine Sitzungszusammenfassung?",
          description: "Erhalten Sie wichtige Erkenntnisse, empfohlene Übungen und hilfreiche Ressourcen",
          yes: "Ja, Zusammenfassung erstellen",
          not_now: "Jetzt nicht"
        },
        input_placeholder: "Teilen Sie, was Ihnen durch den Kopf geht...",
        disclaimer: {
          title: "⚠️ KI-Unterstützung - Keine Professionelle Therapie",
          message: "Kann nicht diagnostizieren oder verschreiben. Krise? Rufen Sie 988 (USA) oder Ihre lokalen Notdienste.",
          strict: "Erinnerung: Diese KI kann keine Zustände diagnostizieren oder Behandlungen verschreiben. Bei medizinischen Bedenken konsultieren Sie einen zugelassenen Fachmann.",
          standard: "Erinnerung: Dies ist KI-unterstützte Unterstützung, keine professionelle Therapie. Notsituationen erfordern sofortige professionelle Hilfe."
        },
        delete_session_failed: "Sitzung konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.",
        confirm_delete_session: "Diese Sitzung löschen? Diese Aktion kann nicht rückgängig gemacht werden.",
        daily_checkin_message: "Ich habe meinen täglichen Check-in abgeschlossen.",
        consent: {
          lenient: {
            title: "KI-Wellness-Unterstützung - Nachsichtiger Modus",
            message: "Diese KI bietet unterstützende Gespräche mit minimalen Unterbrechungen. Sie kann nicht diagnostizieren, verschreiben oder professionelle Pflege ersetzen. Krisensituationen erfordern sofortige professionelle Hilfe."
          },
          standard: {
            title: "KI-Wellness-Unterstützung - Standard-Modus",
            message: "Diese KI bietet Wellness-Unterstützung unter Verwendung evidenzbasierter CBT-Prinzipien. Sie ist kein Ersatz für professionelle psychische Gesundheitsversorgung und kann nicht diagnostizieren oder verschreiben. In Krisen wenden Sie sich sofort an Notdienste."
          },
          strict: {
            title: "KI-Wellness-Unterstützung - Strenger Sicherheitsmodus",
            message: "Dieser Modus umfasst erweiterte Sicherheitsüberwachung und häufige Erinnerungen. Die KI kann nicht diagnostizieren, verschreiben oder Notfälle bewältigen. Professionelle psychische Gesundheitsversorgung ist für klinische Bedenken erforderlich."
          },
          learn_more: "Mehr über Sicherheitsprofile erfahren",
          understand_button: "Ich Verstehe"
        },
        risk_panel: {
          title: "Wir Sind Hier, um zu Helfen",
          message: "Diese KI kann keine Notfallunterstützung bieten. Wenn Sie in einer Krise sind, wenden Sie sich bitte sofort an einen Fachmann.",
          crisis_hotline_label: "Krisen-Hotline:",
          crisis_hotline_number: "988 (USA)",
          crisis_text_line_label: "Krisen-Textlinie:",
          crisis_text_line_number: "Senden Sie \"HELLO\" an 741741",
          emergency_label: "Notfall:",
          emergency_number: "911",
          return_to_chat: "Zurück zum Chat"
        },
        conversations_list: {
          title: "Sitzungen",
          empty_title: "Noch keine Sitzungen",
          empty_message: "Starten Sie ein Gespräch, um zu beginnen",
          session_prefix: "Sitzung",
          delete_aria: "Sitzung löschen"
        },
        session_summary: {
          title: "Sitzungszusammenfassung",
          key_takeaways: "Wichtige Erkenntnisse",
          recommended_exercises: "Empfohlene Übungen",
          helpful_resources: "Hilfreiche Ressourcen",
          reflect_button: "Im Tagebuch Reflektieren",
          view_exercises_button: "Alle Übungen Anzeigen"
        }
      },
      age_gate: {
        title: "Altersverifizierung Erforderlich",
        message: "Unsere KI-Therapiefunktionen sind für Erwachsene ab 18 Jahren konzipiert. Dies hilft uns, angemessene Unterstützung zu bieten und Sicherheitsstandards aufrechtzuerhalten.",
        teen_support_heading: "Wenn Sie unter 18 sind und Unterstützung benötigen:",
        teen_support: {
          counselor: "• Schulberater oder vertrauenswürdiger Erwachsener",
          teen_line: "• Teen Line: 1-800-852-8336 (oder senden Sie TEEN an 839863)",
          crisis_text_line: "• Krisen-Textlinie: Senden Sie \"HOME\" an 741741"
        },
        confirm_button: "Ich bin 18 oder Älter",
        decline_button: "Ich bin Unter 18"
      },
      age_restricted: {
        title: "Altersbeschränkt",
        message: "Unsere KI-gestützten Chat-Funktionen sind für Benutzer ab 18 Jahren konzipiert. Sie haben weiterhin Zugriff auf andere Wellness-Tools wie Stimmungsverfolgung, Tagebuchführung und Übungen.",
        back_to_home: "Zurück zur Startseite"
      },
      journeys: {
        page_title: "Reisen",
        page_subtitle: "Geführte Fähigkeitsentwicklungspfade für persönliches Wachstum",
        tabs: {
          available: "Verfügbar",
          in_progress: "In Bearbeitung",
          completed: "Abgeschlossen"
        },
        empty_state: {
          no_available: "Derzeit keine Reisen verfügbar",
          no_in_progress: "Sie haben noch keine Reisen begonnen",
          no_completed: "Sie haben noch keine Reisen abgeschlossen"
        },
        card: {
          days: "Tage",
          steps: "Schritte",
          progress: "Fortschritt",
          start_journey: "Reise Beginnen",
          view_details: "Details Anzeigen"
        },
        detail: {
          what_youll_gain: "Was Sie gewinnen werden:",
          journey_steps: "Reiseschritte",
          day: "Tag",
          play_game: "Spiel Spielen",
          reflection_placeholder: "Ihre Reflexion (optional)",
          saving: "Speichern...",
          mark_complete: "Als Abgeschlossen Markieren"
        }
      },
      mood_tracker: {
        page_title: "Stimmungs-Tracker",
        page_subtitle: "Verfolgen Sie Ihr emotionales Wohlbefinden und entdecken Sie Muster",
        update_today: "Heute Aktualisieren",
        log_mood: "Stimmung Erfassen",
        mood_trends: "Stimmungstrends",
        loading_chart: "Lade Diagramm...",
        no_data: "Noch keine Stimmungsdaten",
        no_data_subtitle: "Beginnen Sie täglich einzuchecken, um Trends zu sehen",
        tabs: {
          overview: "Übersicht",
          calendar: "Kalender",
          insights: "KI-Einblicke"
        },
        time_range: {
          "7_days": "7 Tage",
          "14_days": "14 Tage",
          "30_days": "30 Tage"
        },
        form: {
          title: "Wie fühlen Sie sich heute?",
          close_aria: "Stimmungseintrag-Formular schließen",
          date: "Datum",
          overall_mood: "Allgemeine Stimmung",
          mood_excellent: "Ausgezeichnet",
          mood_good: "Gut",
          mood_okay: "Okay",
          mood_low: "Niedrig",
          mood_very_low: "Sehr Niedrig",
          emotions_question: "Welche Emotionen fühlen Sie?",
          intensity_label: "Emotionale Intensität",
          mild: "Mild",
          intense: "Intensiv",
          energy_level: "Energieniveau",
          energy_very_low: "Sehr Niedrig",
          energy_low: "Niedrig",
          energy_moderate: "Moderat",
          energy_high: "Hoch",
          energy_very_high: "Sehr Hoch",
          sleep_quality: "Schlafqualität",
          sleep_poor: "Schlecht",
          sleep_fair: "Mäßig",
          sleep_good: "Gut",
          sleep_excellent: "Ausgezeichnet",
          stress_level: "Stressniveau",
          relaxed: "Entspannt",
          very_stressed: "Sehr Gestresst",
          triggers_question: "Was hat Ihre Stimmung heute ausgelöst?",
          activities_question: "Was haben Sie heute gemacht?",
          notes_label: "Zusätzliche Notizen",
          notes_placeholder: "Weitere Gedanken oder Beobachtungen über Ihren Tag...",
          save_error: "Speichern fehlgeschlagen. Überprüfen Sie die Verbindung und versuchen Sie es erneut.",
          saving: "Speichern...",
          save_entry: "Eintrag Speichern",
          update_entry: "Eintrag Aktualisieren"
        }
      },
      progress: {
        page_title: "Ihr Fortschritt",
        page_subtitle: "Verfolgen Sie Ihre Reise",
        page_subtitle_full: "Verfolgen Sie Ihre Reise und feiern Sie Ihr Wachstum",
        health_wellness: "Gesundheit & Wohlbefinden",
        tabs: {
          overview: "Übersicht",
          achievements: "Erfolge",
          rewards: "Belohnungen",
          mood: "Stimmung",
          goals: "Ziele",
          exercises: "Übungen",
          health: "Gesundheit"
        },
        dashboard: {
          current_streak: "Aktuelle Serie",
          days: "Tage",
          points: "Punkte",
          badges: "Abzeichen",
          level: "Stufe",
          level_prefix: "Lv.",
          avg_mood: "Durchschn. Stimmung",
          trend_improving: "verbessernd",
          trend_declining: "abnehmend",
          trend_stable: "stabil",
          goals_achieved: "Erreichte Ziele",
          active: "aktiv",
          charts: {
            mood_trends: "Stimmungstrends (Letzte 30 Tage)",
            exercise_by_category: "Übungen nach Kategorie",
            journal_consistency: "Tagebuch-Konsistenz",
            goal_progress: "Ziel-Fortschritt"
          }
        }
      },
      mind_games: {
        page_title: "Gedankenspiele",
        page_subtitle: "Interaktive CBT- und DBT-Fähigkeitenübung",
        go_back_aria: "Zurück",
        close_aria: "Schließen",
        recommended_title: "Für Sie Empfohlen",
        recommended_subtitle: "Basierend auf Ihrer Aktivität denken wir, dass Ihnen diese gefallen werden:",
        thought_quiz: {
          score: "Punktzahl",
          next_question: "Nächste Frage"
        },
        games: {
          thought_quiz: { title: "Gedanken-Quiz", description: "Erkennen Sie die Denkfalle in einem schnellen Beispiel." },
          reframe_pick: { title: "Neurahmungs-Auswahl", description: "Wählen Sie den ausgewogensten alternativen Gedanken." },
          value_compass: { title: "Werte-Kompass", description: "Wählen Sie einen Wert, dann wählen Sie eine kleine Aktion." },
          tiny_experiment: { title: "Kleines Experiment", description: "Testen Sie eine Überzeugung mit einem 2-Minuten-Experiment." },
          quick_win: { title: "Schneller Erfolg", description: "Protokollieren Sie einen kleinen Erfolg und bauen Sie Schwung auf." },
          calm_bingo: { title: "Ruhe-Bingo", description: "Markieren Sie 2 Felder für eine Mini-Runde." },
          dbt_stop: { title: "STOP-Fähigkeit", description: "Pausieren, atmen und einen weisen nächsten Schritt wählen." },
          opposite_action: { title: "Gegenteilige Aktion", description: "Aktionen an Zielen ausrichten, nicht an Stimmungen." },
          urge_surfing: { title: "Drang-Surfen", description: "Reiten Sie einen Drang wie eine Welle für 60 Sekunden." },
          worry_time: { title: "Sorgenzeit", description: "Parken Sie Sorgen jetzt, planen Sie sie später." },
          evidence_balance: { title: "Beweisbalance", description: "Wägen Sie Beweise ab und finden Sie eine faire Schlussfolgerung." },
          defusion_cards: { title: "Defusions-Karten", description: "Lösen Sie sich spielerisch von Gedanken." },
          tipp_skills: { title: "TIPP-Fähigkeiten", description: "Ändern Sie schnell die Körperchemie, um Intensität zu reduzieren." },
          accepts: { title: "ACCEPTS", description: "Lenken Sie sich effektiv von überwältigenden Emotionen ab." },
          willing_hands: { title: "Bereite Hände", description: "Körperbasierte Akzeptanzpraxis." },
          half_smile: { title: "Halbes Lächeln", description: "Emotionen durch sanften Gesichtsausdruck verändern." },
          improve: { title: "IMPROVE", description: "Verbessern Sie den Moment in der Krise." },
          leaves_on_stream: { title: "Blätter auf dem Bach", description: "Beobachten Sie Gedanken vorbeischweben, ohne sie zu greifen." },
          expansion: { title: "Expansion", description: "Schaffen Sie Raum für schwierige Emotionen." },
          values_check: { title: "Werte-Check", description: "Schnelle Ausrichtungsprüfung mit Ihren Werten." },
          pros_and_cons: { title: "Vor- und Nachteile", description: "Weise Entscheidungsfindung in Krisen." },
          check_the_facts: { title: "Fakten Prüfen", description: "Passt Ihre Emotion zur Situation?" },
          self_soothe: { title: "Selbstberuhigung 5 Sinne", description: "Trösten Sie sich mit sensorischen Erfahrungen." },
          mountain_meditation: { title: "Berg-Meditation", description: "Verkörpern Sie Stabilität und Erdung." }
        },
        content: {
          thought_quiz: {
            items: [
              { prompt: "If I don't do this perfectly, I'm a total failure.", options: ["All-or-nothing thinking", "Mind reading", "Catastrophizing", "Discounting the positive"], explanation: "This treats performance as a strict pass/fail label instead of a spectrum." },
              { prompt: "They haven't replied yet, so they must be upset with me.", options: ["Emotional reasoning", "Mind reading", "Labeling", "Overgeneralization"], explanation: "You're assuming you know what they think without clear evidence." },
              { prompt: "If I make one mistake, everything will fall apart.", options: ["Catastrophizing", "Personalization", "Should statements", "Mental filter"], explanation: "This jumps to the worst-case outcome and treats it as likely." },
              { prompt: "I had an awkward moment today. I always mess things up.", options: ["Overgeneralization", "Mind reading", "Fortune telling", "Disqualifying the positive"], explanation: "One moment gets turned into a sweeping rule about your whole life." },
              { prompt: "I feel anxious, so something bad must be about to happen.", options: ["Emotional reasoning", "Should statements", "Labeling", "Black-and-white thinking"], explanation: "Feelings are treated like facts, even when they're just signals." },
              { prompt: "My friend sounded quiet. It's probably my fault.", options: ["Personalization", "Catastrophizing", "Fortune telling", "Magnification"], explanation: "You're taking responsibility for something that may have many causes." },
              { prompt: "I should be more productive all the time.", options: ["Should statements", "Mental filter", "Mind reading", "Overgeneralization"], explanation: "Rigid rules ('should') create pressure and ignore real human limits." },
              { prompt: "One person criticized me, so I'm probably not good at this.", options: ["Labeling", "Disqualifying the positive", "Magnification", "All-or-nothing thinking"], explanation: "A single critique gets blown up and outweighs the full picture." },
              { prompt: "I did well, but it doesn't count because it was easy.", options: ["Discounting the positive", "Fortune telling", "Personalization", "Catastrophizing"], explanation: "You're dismissing real effort and progress instead of acknowledging it." },
              { prompt: "Everyone noticed my mistake. They must think I'm incompetent.", options: ["Mind reading", "Mental filter", "Emotional reasoning", "Should statements"], explanation: "You're guessing others' judgments without checking the evidence." },
              { prompt: "If I try and it's uncomfortable, that means it's wrong for me.", options: ["Emotional reasoning", "Overgeneralization", "Labeling", "Disqualifying the positive"], explanation: "Discomfort can be part of growth; it doesn't automatically mean danger." },
              { prompt: "I didn't meet my goal today, so I'm never going to change.", options: ["Fortune telling", "Catastrophizing", "Overgeneralization", "All-or-nothing thinking"], explanation: "A single day becomes a permanent prediction, ignoring gradual progress." }
            ],
            advanced: [
              { prompt: "I received constructive feedback, but all I can think about is the one negative comment buried in it.", options: ["Mental filter", "Overgeneralization", "Personalization", "Emotional reasoning"], explanation: "You're filtering out the positive and focusing only on the negative detail." },
              { prompt: "If I set boundaries, people will see me as selfish and abandon me.", options: ["Fortune telling + labeling", "Mind reading + catastrophizing", "Should statements", "Emotional reasoning"], explanation: "This combines mind reading (knowing what they'll think) with catastrophizing (predicting abandonment)." },
              { prompt: "I didn't get the promotion, which proves I'm not competent enough, and I never will be.", options: ["Fortune telling + labeling", "All-or-nothing thinking", "Discounting the positive", "Personalization"], explanation: "This creates a fixed label and predicts a permanent future based on one event." },
              { prompt: "My colleague was curt with me today. I must have done something to upset them, and now the whole team probably thinks poorly of me.", options: ["Personalization + magnification + mind reading", "Catastrophizing + overgeneralization", "Mental filter + should statements", "Emotional reasoning"], explanation: "This combines taking personal blame, blowing up the impact, and assuming you know what others think." },
              { prompt: "I feel uncertain about this decision, which means I'm making the wrong choice.", options: ["Emotional reasoning", "Fortune telling", "All-or-nothing thinking", "Catastrophizing"], explanation: "The feeling of uncertainty is treated as evidence of a bad decision, not just a normal part of choosing." }
            ]
          },
          reframe_pick: {
            items: [
              { situation: "You sent a message and haven't heard back.", automatic_thought: "They're ignoring me because I said something wrong.", choices: ["They're busy. I can wait or follow up later in a calm way.", "They definitely hate me now and I ruined everything.", "I'll never message anyone again so I don't risk feeling this."], why: "It considers multiple possibilities and suggests a reasonable next step." },
              { situation: "You made a small mistake at work/school.", automatic_thought: "I'm terrible at this.", choices: ["One mistake is normal. I can fix it and learn for next time.", "I'm the worst person here. I should quit immediately.", "I'll pretend it didn't happen and avoid anything challenging."], why: "It's specific, realistic, and focused on learning rather than global labels." },
              { situation: "A friend was quiet during your hangout.", automatic_thought: "They must be annoyed with me.", choices: ["I don't know the reason. I can check in kindly or give space.", "It's my fault. I always ruin friendships.", "I should cut them off before they reject me first."], why: "It avoids mind reading and leaves room for a gentle check-in." },
              { situation: "You didn't finish a task you planned.", automatic_thought: "I'm so lazy.", choices: ["I struggled today. I can pick one small next step and restart.", "I'm hopeless. I'll never be consistent at anything.", "I should punish myself until I finally get disciplined."], why: "It acknowledges difficulty and moves toward a doable, compassionate action." },
              { situation: "You feel anxious before an event.", automatic_thought: "This anxiety means the event will go badly.", choices: ["Anxiety is a feeling, not a prediction. I can go anyway and cope.", "Anxiety means danger. I must avoid this at all costs.", "I need to feel zero anxiety before I'm allowed to show up."], why: "It separates feelings from forecasts and supports valued action." },
              { situation: "Someone gave you feedback.", automatic_thought: "I'm not good enough.", choices: ["Feedback can help me improve. I can take what's useful and grow.", "They think I'm incompetent and everyone agrees with them.", "I'll stop trying so no one can judge me again."], why: "It keeps self-worth intact while allowing improvement." },
              { situation: "You didn't get invited to something.", automatic_thought: "Nobody likes me.", choices: ["There could be many reasons. I can reach out or plan something else.", "This proves I'm unlikable and always will be.", "I'll isolate so I don't have to feel left out again."], why: "It avoids overgeneralization and offers flexible, constructive options." },
              { situation: "You're learning a new skill and feel behind.", automatic_thought: "If I'm not fast, I'm not meant for this.", choices: ["Skills grow with practice. I can improve step by step.", "If I'm not immediately great, it's a waste of time.", "I should compare myself nonstop to prove I'm failing."], why: "It supports growth mindset and realistic learning curves." }
            ]
          },
          value_compass: {
            values: [
              { value: "Family", actions: ["Send a kind message to a family member.", "Do one small helpful thing at home.", "Plan 10 minutes of quality time today."] },
              { value: "Health", actions: ["Drink a glass of water right now.", "Take a 2-minute stretch break.", "Step outside for fresh air for 3 minutes."] },
              { value: "Growth", actions: ["Learn one tiny thing (watch/read for 2 minutes).", "Practice a skill for 3 minutes.", "Write one sentence about what you want to improve."] },
              { value: "Friendship", actions: ["Check in with a friend with a simple hello.", "Reply to a message you've been postponing.", "Share one genuine compliment today."] },
              { value: "Courage", actions: ["Do the smallest version of the scary step (10%).", "Name what you fear in one sentence, then proceed anyway.", "Ask one small question instead of assuming."] },
              { value: "Calm", actions: ["Take 5 slow breaths (count 4 in / 4 out).", "Relax your shoulders and jaw for 20 seconds.", "Put your phone down for 2 minutes and reset."] },
              { value: "Creativity", actions: ["Write a silly 1-line idea (no judgment).", "Take a photo of something interesting around you.", "Doodle for 60 seconds."] },
              { value: "Purpose", actions: ["Choose one task that matters and do 2 minutes of it.", "Write your 'why' in 1 sentence.", "Remove one small obstacle from your path today."] }
            ]
          },
          tiny_experiment: {
            items: [
              { belief: "If I ask for help, people will think I'm weak.", experiments: ["Ask one small, specific question and observe the response.", "Ask a trusted person for a tiny favor and note what happens.", "Ask for clarification once instead of guessing."], reflection_question: "What happened?", reflection_options: ["It went better than I feared.", "It was neutral / fine.", "It was uncomfortable, but I handled it."] },
              { belief: "If I say no, people will dislike me.", experiments: ["Say no to a low-stakes request using one polite sentence.", "Offer an alternative (not now / later) instead of automatic yes.", "Pause for 5 seconds before agreeing to anything."], reflection_question: "What did you notice?", reflection_options: ["People respected it.", "Nothing dramatic happened.", "It felt hard, and I survived it."] },
              { belief: "If I make a mistake, it will be a disaster.", experiments: ["Do a small task imperfectly on purpose (10%) and observe outcomes.", "Share a minor correction without apologizing excessively.", "Let one tiny typo exist and see what actually happens."], reflection_question: "What was the outcome?", reflection_options: ["No one cared.", "It was fixable.", "It felt big in my head, smaller in reality."] },
              { belief: "If I don't feel motivated, I can't start.", experiments: ["Start for 2 minutes only, then reassess.", "Set a timer for 90 seconds and do the first step.", "Make the task 10x smaller and begin."], reflection_question: "After starting, how was it?", reflection_options: ["Easier than expected.", "Still hard, but possible.", "I gained a little momentum."] },
              { belief: "If someone is quiet, it must be about me.", experiments: ["Write 3 alternative explanations before reacting.", "Ask a simple check-in question instead of assuming.", "Wait 30 minutes and see if new info appears."], reflection_question: "What did you learn?", reflection_options: ["I didn't have enough evidence.", "There were other explanations.", "Checking in was helpful."] },
              { belief: "I have to do everything right to be accepted.", experiments: ["Share one imperfect draft and request feedback.", "Do one task at 'good enough' level and stop.", "Let someone else choose one detail instead of controlling it."], reflection_question: "How did it go?", reflection_options: ["Good enough worked.", "Acceptance didn't depend on perfection.", "I felt discomfort, and it passed."] },
              { belief: "If I feel anxious, I shouldn't go.", experiments: ["Go for 5 minutes only and reassess.", "Bring one coping tool (water / music / breathing).", "Rate anxiety 0–10 before and after to compare."], reflection_question: "What did you notice?", reflection_options: ["Anxiety changed over time.", "I could function with anxiety present.", "Avoidance wasn't necessary."] },
              { belief: "If I rest, I'm wasting time.", experiments: ["Take a 3-minute break and then return to one small task.", "Rest first, then do 2 minutes of the priority task.", "Track: does a short break help focus?"], reflection_question: "Result?", reflection_options: ["Rest helped me reset.", "No harm done.", "I returned with a bit more clarity."] },
              { belief: "If I don't get it quickly, I'm not capable.", experiments: ["Practice for 3 minutes daily for 3 days and compare.", "Ask one question and notice improvement.", "Write one thing you learned today, even if small."], reflection_question: "What changed?", reflection_options: ["Progress showed up gradually.", "Learning took repetition.", "I was harsher than necessary."] },
              { belief: "I need to feel confident before I act.", experiments: ["Act with 'small courage' for 2 minutes anyway.", "Do the first step while confidence is low.", "Rate confidence after action (not before)."], reflection_question: "After action, how was your confidence?", reflection_options: ["A bit higher.", "About the same, but I did it.", "I learned I can move without perfect confidence."] }
            ]
          },
          quick_win: {
            presets: ["I drank water.", "I took a 2-minute break.", "I sent one message I was avoiding.", "I cleaned one tiny area.", "I did one small task for 2 minutes.", "I took 5 slow breaths.", "I stepped outside for fresh air.", "I asked a question instead of assuming.", "I showed up even though it was uncomfortable.", "I wrote one helpful sentence to myself.", "I stretched my shoulders/neck.", "I ate something nourishing.", "I paused before reacting.", "I said no (or not now) politely.", "I made a small plan for tomorrow.", "I finished a mini-step.", "I noticed a thinking trap and named it.", "I chose 'good enough' and stopped.", "I did something kind for someone.", "I did something kind for myself."]
          },
          calm_bingo: {
            tiles: ["Drink a glass of water", "5 slow breaths", "Relax shoulders + jaw", "Look out a window for 30s", "Stand up and stretch", "Send a kind text", "Tidy one small thing", "Step outside for 2 minutes", "Name 3 things you can see", "Play one calm song", "Write 1 supportive sentence", "Wash your hands slowly", "Move your body for 60s", "Put phone down for 2 minutes", "Smile gently (even 10%)", "Choose one tiny next step"]
          },
          dbt_stop: {
            prompts: [
              { trigger: "You feel a strong urge to react immediately.", steps: [{ key: "S", label: "Stop", text: "Pause. Don't act yet." }, { key: "T", label: "Take a step back", text: "Breathe once. Create a tiny space." }, { key: "O", label: "Observe", text: "Notice: thoughts, feelings, body signals." }, { key: "P", label: "Proceed mindfully", text: "Choose one wise next step." }], next_steps: ["Send a calm, short reply (or wait 10 minutes).", "Ask one clarifying question.", "Do one small grounding action, then decide."] },
              { trigger: "You're about to avoid something important.", steps: [{ key: "S", label: "Stop", text: "Pause avoidance for a moment." }, { key: "T", label: "Take a step back", text: "Exhale slowly and reset posture." }, { key: "O", label: "Observe", text: "What are you afraid will happen?" }, { key: "P", label: "Proceed mindfully", text: "Pick the smallest brave step (10%)." }], next_steps: ["Do 2 minutes of the first step only.", "Make it easier: reduce scope by 50%.", "Text someone: 'I'm starting now—wish me luck.'"] },
              { trigger: "You feel criticized and want to defend yourself fast.", steps: [{ key: "S", label: "Stop", text: "Hold back the instant response." }, { key: "T", label: "Take a step back", text: "Breathe and relax your jaw." }, { key: "O", label: "Observe", text: "What's the goal: to win or to repair?" }, { key: "P", label: "Proceed mindfully", text: "Respond to the goal, not the heat." }], next_steps: ["Say: 'Let me think about that for a moment.'", "Reflect back what you heard in one sentence.", "Ask: 'What would be most helpful right now?'"] },
              { trigger: "You're scrolling/doomscrolling and feel stuck.", steps: [{ key: "S", label: "Stop", text: "Pause scrolling now." }, { key: "T", label: "Take a step back", text: "Put phone down for one breath." }, { key: "O", label: "Observe", text: "Name the feeling in one word." }, { key: "P", label: "Proceed mindfully", text: "Choose one small helpful action." }], next_steps: ["Drink water and stretch for 30 seconds.", "Open a window or step outside for 1 minute.", "Write one tiny next step and do it."] }
            ]
          },
          opposite_action: {
            items: [
              { emotion: "Anxiety", urge: "Avoid / escape", opposite: "Approach gently", choices: ["Show up for 5 minutes, then reassess.", "Do the smallest first step (10%).", "Ask one question instead of avoiding."], note: "Opposite action is for emotions that don't fit the facts or are too intense." },
              { emotion: "Sadness", urge: "Withdraw / isolate", opposite: "Connect or activate", choices: ["Send one simple 'hey' message.", "Step outside for 2 minutes.", "Do a tiny task to build momentum."], note: "Small activation often shifts mood more than waiting for motivation." },
              { emotion: "Anger", urge: "Attack / argue", opposite: "Be gentle and effective", choices: ["Lower voice + slow down your words.", "State one need clearly without blame.", "Take a 2-minute pause before replying."], note: "Opposite action aims for effectiveness, not 'winning.'" },
              { emotion: "Shame", urge: "Hide / disappear", opposite: "Small reveal + self-respect", choices: ["Share a tiny truth with a safe person.", "Stand tall, breathe, and stay present for 30s.", "Do one value-based action anyway."], note: "Shame shrinks with safe connection and self-respect actions." },
              { emotion: "Guilt (too much)", urge: "Over-apologize / self-punish", opposite: "Repair effectively", choices: ["Apologize once, then propose one repair step.", "Ask what would help and listen.", "Stop repeating apologies; act instead."], note: "Effective repair beats endless self-blame." },
              { emotion: "Fear of rejection", urge: "People-please / over-text", opposite: "Balanced boundary", choices: ["Send one message, then wait.", "Do one self-caring action while you wait.", "Remind yourself: 'I can handle uncertainty.'"], note: "Opposite action builds tolerance for uncertainty." }
            ]
          },
          urge_surfing: {
            beginner: [
              { title: "Ride the wave (60 seconds)", steps: ["Name the urge: 'I'm having the urge to ____.'", "Rate intensity 0–10.", "Notice where it lives in the body.", "Breathe slowly for 5 breaths.", "Rate intensity again. (Urges rise and fall.)"], finish_choices: ["Delay 10 minutes (set a timer).", "Do a 2-minute replacement action.", "Ask for support (one message)."] },
              { title: "Surf + redirect", steps: ["Name the urge without judging it.", "Imagine it as a wave—rising, cresting, passing.", "Relax shoulders and jaw.", "Pick one value-based micro-action."], finish_choices: ["Take 10% of a helpful step.", "Move your body for 60 seconds.", "Drink water + reset posture."] }
            ],
            advanced: [
              { title: "Surf independently (90 seconds)", steps: ["Name and rate the urge (0-10).", "Locate it in your body.", "Breathe with it for 10 breaths.", "Notice the peak and decline.", "Rate it again."], finish_choices: ["Delay 20 minutes and reassess.", "Do the opposite action for 5 minutes.", "Journal about what you noticed."] },
              { title: "Surf + value-based action", steps: ["Acknowledge the urge without judgment.", "Watch it like a scientist observing data.", "Let it peak naturally.", "Choose one value-aligned micro-step."], finish_choices: ["Do the tiny step immediately.", "Practice the skill again in 1 hour.", "Note what worked for next time."] }
            ]
          },
          worry_time: {
            items: [
              { worry: "What if I mess up tomorrow?", park_it: "I'll think about this during Worry Time at 6:00 PM for 10 minutes.", tiny_now: ["Write one small preparation step.", "Do 2 minutes of that step now.", "Then return to the present task."] },
              { worry: "What if they're mad at me?", park_it: "I'll revisit this at 7:00 PM for 10 minutes, then decide on a calm follow-up.", tiny_now: ["List 2 alternative explanations.", "Wait 30 minutes before acting.", "Do one calming reset (5 breaths)."] },
              { worry: "What if something bad happens?", park_it: "I'll schedule Worry Time at 5:30 PM for 10 minutes and focus on what's controllable.", tiny_now: ["Name 1 thing you can control today.", "Do the smallest step toward it.", "Return attention to the room."] },
              { worry: "I'm behind; I'll never catch up.", park_it: "I'll worry about this at 6:30 PM for 10 minutes and make a realistic plan.", tiny_now: ["Pick the single next step.", "Work 2 minutes on it.", "Stop and acknowledge progress."] },
              { worry: "What if I disappoint people?", park_it: "I'll revisit this at 8:00 PM for 10 minutes and choose a value-based action.", tiny_now: ["Ask: 'What matters to me here?'", "Choose one respectful sentence/boundary.", "Delay responding for 10 minutes."] },
              { worry: "What if I can't handle it?", park_it: "I'll schedule Worry Time at 7:30 PM for 10 minutes and review coping options.", tiny_now: ["Write 1 coping tool you already use.", "Use it for 60 seconds.", "Continue with the next small task."] }
            ]
          },
          evidence_balance: {
            items: [
              { thought: "I always mess things up.", evidence_for: ["I made a mistake recently.", "I remember failures more than successes."], evidence_against: ["I've done many things well.", "One mistake doesn't define 'always'."], balanced_conclusion: "I've made mistakes and also succeeded. I can learn and improve." },
              { thought: "They don't like me.", evidence_for: ["They replied late once.", "They were quiet last time."], evidence_against: ["They've been friendly before.", "There are many reasons for silence."], balanced_conclusion: "I don't know their thoughts. I can check in calmly or wait for more info." },
              { thought: "If I'm anxious, I can't cope.", evidence_for: ["Anxiety feels intense.", "I want to escape when anxious."], evidence_against: ["I've coped with anxiety before.", "Anxiety rises and falls."], balanced_conclusion: "Anxiety is uncomfortable but manageable. I can act while it's present." },
              { thought: "I'm not improving.", evidence_for: ["Progress feels slow.", "I compare myself to others."], evidence_against: ["I've taken small steps.", "Learning is gradual."], balanced_conclusion: "Progress can be slow and real. Small steps still count." },
              { thought: "I must do everything perfectly.", evidence_for: ["I value quality.", "Perfection sometimes prevents criticism."], evidence_against: ["Perfect isn't required to succeed.", "Good-enough frees time and reduces stress."], balanced_conclusion: "I can aim for quality while allowing 'good enough' when it's effective." },
              { thought: "If I say no, I'll be rejected.", evidence_for: ["I worry about disappointing people.", "I've had conflict before."], evidence_against: ["Many people respect boundaries.", "I can say no politely and offer alternatives."], balanced_conclusion: "Saying no respectfully protects relationships and my wellbeing." }
            ]
          },
          defusion_cards: {
            cards: [
              { thought: "I'm not good enough.", defuse_lines: ["I'm having the thought that I'm not good enough.", "Thanks, mind. Interesting story.", "This is a thought, not a fact."] },
              { thought: "Something bad will happen.", defuse_lines: ["I'm noticing a 'danger prediction' thought.", "My mind is trying to protect me.", "I can take one small step anyway."] },
              { thought: "They're judging me.", defuse_lines: ["I'm having the thought they're judging me.", "I can't read minds. I can act on my values.", "Let this thought ride in the back seat."] },
              { thought: "I can't handle this feeling.", defuse_lines: ["I'm noticing the thought 'I can't handle it'.", "Feelings are waves; they change.", "I can make room and keep going."] },
              { thought: "I must fix everything now.", defuse_lines: ["There's the 'urgent fixer' thought.", "I can pause and choose one wise next step.", "Slow is smooth; smooth is fast."] },
              { thought: "If it's hard, I should quit.", defuse_lines: ["I'm having the thought 'quit'.", "Hard can mean 'new', not 'wrong'.", "I can do the smallest version (10%)."] }
            ]
          },
          tipp_skills: {
            situation: "Your emotions are at 8/10 or higher and you need to come down fast.",
            skills: [
              { letter: "T", name: "Temperature", description: "Cold water on face, ice cube, cold shower" },
              { letter: "I", name: "Intense exercise", description: "Run, jump, push-ups for 60 seconds" },
              { letter: "P", name: "Paced breathing", description: "Breathe out longer than in (4 in / 6 out)" },
              { letter: "P", name: "Paired muscle relaxation", description: "Tense then release muscle groups" }
            ],
            actions: ["Splash cold water on your face for 30 seconds.", "Do 20 jumping jacks right now.", "Breathe: 4 in, hold 4, 6 out—repeat 5 times."]
          },
          accepts: {
            items: [
              { letter: "A", name: "Activities", description: "Do something engaging", action: "Watch a 5-minute video, play a quick game, or clean one surface." },
              { letter: "C", name: "Contributing", description: "Help someone else", action: "Send a kind message, do one helpful thing, or share something useful." },
              { letter: "C", name: "Comparisons", description: "Compare to when you coped before", action: "Remember: You've survived 100% of your worst days so far." },
              { letter: "E", name: "Emotions", description: "Create a different emotion", action: "Watch something funny, listen to upbeat music, or read something calming." },
              { letter: "P", name: "Pushing away", description: "Mentally put the situation aside", action: "Imagine putting the problem in a box on a shelf for later." },
              { letter: "T", name: "Thoughts", description: "Fill your mind with other thoughts", action: "Count backwards from 100 by 7s, list countries A-Z, or describe the room." },
              { letter: "S", name: "Sensations", description: "Create strong physical sensations", action: "Hold ice, take a hot/cold shower, or squeeze a stress ball hard." }
            ]
          },
          improve: {
            items: [
              { letter: "I", name: "Imagery", description: "Visualize a peaceful or safe place", quick_action: "Close your eyes. Picture a place you feel calm (real or imagined)." },
              { letter: "M", name: "Meaning", description: "Find purpose in the pain", quick_action: "Ask: What can I learn? How might this help me grow?" },
              { letter: "P", name: "Prayer", description: "Connect to something larger", quick_action: "Say a phrase that grounds you or ask for support from your values/beliefs." },
              { letter: "R", name: "Relaxation", description: "Relax your body", quick_action: "Tense and release: shoulders, jaw, hands. Breathe slowly." },
              { letter: "O", name: "One thing in the moment", description: "Focus fully on one small task", quick_action: "Pick one action: wash a dish, water a plant, fold one item." },
              { letter: "V", name: "Vacation", description: "Take a brief mental break", quick_action: "Give yourself 10 minutes off from the problem. Set a timer." },
              { letter: "E", name: "Encouragement", description: "Be your own cheerleader", quick_action: "Say: 'I can handle this. I've done hard things before.'" }
            ]
          },
          self_soothe: {
            senses: [
              { sense: "Vision", actions: ["Look at nature or a calming image.", "Watch clouds or water move.", "Light a candle and watch the flame."] },
              { sense: "Hearing", actions: ["Listen to calming music or nature sounds.", "Play a song that makes you feel safe.", "Listen to the sound of rain or wind."] },
              { sense: "Smell", actions: ["Smell something pleasant (lotion, coffee, flowers).", "Light a scented candle or incense.", "Take a deep breath of fresh air."] },
              { sense: "Taste", actions: ["Eat something you enjoy slowly.", "Savor a piece of chocolate or tea.", "Notice the flavors and textures."] },
              { sense: "Touch", actions: ["Hold something soft (blanket, pet).", "Take a warm shower or bath.", "Massage your hands with lotion."] }
            ]
          }
        }
      },
      exercises: {
        page_title: "Übungsbibliothek",
        page_subtitle: "CBT-Techniken üben",
        page_subtitle_full: "Durchsuchen und üben Sie evidenzbasierte CBT-Techniken",
        loading: "Übungen werden geladen...",
        go_back_aria: "Zurück",
        ai_plan: "KI-Übungsplan",
        favorites: "Favoriten",
        search_placeholder: "Übungen suchen...",
        empty_state: {
          favorites_title: "Noch keine Favoriten",
          no_results_title: "Keine Übungen gefunden",
          favorites_message: "Markieren Sie Übungen als Favoriten, um sie hier zu sehen",
          search_message: "Versuchen Sie, Ihre Suche oder Filter anzupassen",
          no_exercises_message: "Keine Übungen verfügbar"
        },
        library: {
          flexible: "Flexibel"
        },
        categories: {
          all: "Alle",
          breathing: "Atmung",
          grounding: "Erdung",
          cognitive: "Kognitiv",
          behavioral: "Verhaltens",
          mindfulness: "Achtsamkeit",
          exposure: "Exposition",
          sleep: "Schlaf",
          relationships: "Beziehungen",
          stress: "Stressmanagement"
        },
        detail: {
          untitled_exercise: "Übung ohne Titel",
          duration_options_suffix: "Min Optionen",
          minutes_suffix: "Minuten",
          video_label: "Video",
          tabs: {
            overview: "Übersicht",
            practice: "Praxis",
            audio: "Audio",
            benefits: "Vorteile",
            tips: "Tipps"
          },
          about: "Über Diese Übung",
          guided_visualization: "Geführte Visualisierung",
          video_demonstration: "Video-Demonstration",
          helps_with: "Hilft Bei",
          guided_audio: "Geführtes Audio",
          guided_audio_description: "Folgen Sie der professionell gesprochenen Audio-Anleitung für diese Übung.",
          step_by_step_guide: "Schritt-für-Schritt-Anleitung",
          step_duration: "Dauer: {{seconds}} Sekunden",
          instructions: "Anweisungen",
          choose_duration: "Dauer Wählen",
          key_benefits: "Hauptvorteile",
          default_benefits: "Diese Übung hilft, das geistige Wohlbefinden zu verbessern, Stress abzubauen und die emotionale Regulation zu verbessern.",
          helpful_tips: "Hilfreiche Tipps",
          default_tips: "Üben Sie regelmäßig für beste Ergebnisse. Finden Sie einen ruhigen Ort, beginnen Sie langsam und seien Sie geduldig mit sich selbst.",
          your_progress: "Ihr Fortschritt",
          times_completed: "Mal Abgeschlossen",
          minutes_practiced: "Minuten Geübt",
          last_practiced: "Zuletzt geübt: {{date}}",
          completed_message: "Übung Abgeschlossen!",
          mark_as_complete: "Als Abgeschlossen Markieren"
        }
      }
    }
  },
  it: {
    translation: {
      sidebar: {
        home: { name: "Home", description: "Dashboard e panoramica" },
        chat: { name: "Chat", description: "Terapeuta IA" },
        coach: { name: "Coach", description: "Coach del Benessere IA" },
        mood: { name: "Umore", description: "Traccia il tuo umore" },
        journal: { name: "Diario", description: "Registri di pensieri" },
        progress: { name: "Progressi", description: "Traccia il tuo viaggio" },
        exercises: { name: "Esercizi", description: "Tecniche CBT" },
        community: { name: "Community" },
        resources: { name: "Risorse" },
        settings: { name: "Impostazioni" }
      },
      global: {
        app_name: "MindWell",
        app_tagline: "App per il Benessere Mentale"
      },
      mobile_menu: {
        menu_title: "Menu",
        open_aria: "Apri menu",
        close_aria: "Chiudi menu"
      },
      home: {
        greeting: {
          morning: "Buongiorno",
          afternoon: "Buon pomeriggio",
          evening: "Buonasera"
        },
        active_goals: "Obiettivi Attivi",
        journal_entries: "Voci di Diario",
        error: {
          goals_load: "Impossibile caricare gli obiettivi.",
          journal_load: "Impossibile caricare le voci del diario."
        },
        aria: {
          view_goal_details: "Visualizza dettagli obiettivo",
          view_journal_entry: "Visualizza voce diario",
          watch_help_video: "Guarda video di aiuto",
          watch_goals_help_video: "Guarda video di aiuto obiettivi",
          watch_journal_help_video: "Guarda video di aiuto diario"
        }
      },
      quick_actions: {
        title: "Azioni Rapide",
        recommended: { title: "Consigliato per Te", description: "Suggerimenti personalizzati dall'IA" },
        ai_therapist: { title: "Terapeuta IA", description: "Parla con il tuo terapeuta" },
        journal_thought: { title: "Registra un Pensiero", description: "Sfida il pensiero" },
        set_goal: { title: "Imposta un Obiettivo", description: "Definisci obiettivi" },
        mind_games: { title: "Giochi Mentali", description: "Esercizi mentali rapidi" },
        journeys: { title: "Percorsi", description: "Percorsi di abilità curati" },
        exercises_library: { title: "Libreria Esercizi", description: "Sfoglia tecniche" },
        video_library: { title: "Libreria Video", description: "Guarda e impara" },
        personalized_recommendations: "Raccomandazioni Personalizzate",
        aria: {
          guided_intro_video: "Video di introduzione guidata",
          close_video: "Chiudi video"
        }
      },
      settings: {
        page_title: "Impostazioni",
        page_subtitle: "Gestisci il tuo account e le preferenze",
        profile: {
          title: "Profilo",
          full_name: "Nome Completo",
          name_placeholder: "Il tuo nome",
          email: "Email",
          email_readonly: "L'email non può essere modificata",
          role: "Ruolo",
          role_admin: "Amministratore",
          role_user: "Utente",
          save_changes: "Salva Modifiche",
          saving: "Salvataggio..."
        },
        language: {
          title: "Lingua",
          description: "Scegli la tua lingua preferita",
          current: "Lingua attuale",
          en: "English (Inglese)",
          he: "עברית (Ebraico)",
          es: "Español (Spagnolo)",
          fr: "Français (Francese)",
          de: "Deutsch (Tedesco)",
          it: "Italiano (Italian)",
          pt: "Português (Portoghese)"
        },
        theme: {
          title: "Tema Colore",
          description: "Scegli un tema visivo che ti sembra confortevole",
          default: { name: "Predefinito", description: "Gradienti verdi e viola calmi" },
          ocean: { name: "Oceano", description: "Blu e turchesi sereni" },
          sunset: { name: "Tramonto", description: "Arancioni e rosa caldi" },
          forest: { name: "Foresta", description: "Verdi naturali e toni terra" },
          lavender: { name: "Lavanda", description: "Viola e violetti morbidi" },
          minimal: { name: "Minimale", description: "Grigi e neri puliti" }
        },
        dashboard_layout: {
          title: "Layout Dashboard",
          description: "Scegli come è organizzata la tua dashboard home",
          default_title: "Predefinito",
          default_description: "Layout bilanciato con tutte le sezioni",
          compact_title: "Compatto",
          compact_description: "Vista condensata per accesso rapido"
        },
        subscription: {
          title: "Abbonamento",
          free_trial: "Prova Gratuita",
          active: "Attivo",
          description: "Sei attualmente in prova gratuita. Passa a Premium per accesso illimitato a tutte le funzionalità.",
          feature_sessions: "✓ Sessioni di terapia limitate (5 gratuite)",
          feature_exercises: "✓ Esercizi CBT di base",
          feature_mood: "✓ Tracciamento dell'umore",
          upgrade_button: "Passa a Premium - €9,99/mese",
          premium_benefits: "Premium include: Sessioni illimitate, esercizi avanzati, supporto prioritario e altro."
        },
        data_privacy: {
          title: "Dati e Privacy",
          retention_label: "Politica di Conservazione Dati",
          retention_description: "Scegli per quanto tempo vengono conservati i tuoi registri di terapia, voci di umore e dati di diario. Dopo questo periodo, i registri possono essere eliminati automaticamente.",
          retention_30_days: "30 giorni",
          retention_90_days: "90 giorni",
          retention_1_year: "1 anno",
          retention_indefinite: "Conserva indefinitamente",
          current_setting: "Impostazione attuale: {{value}}",
          current_setting_indefinite: "Indefinito",
          current_setting_days: "{{days}} giorni",
          export_title: "Esporta i Tuoi Dati",
          export_description: "Scarica un riepilogo dei tuoi registri di terapia, voci di umore e obiettivi come file JSON.",
          export_button: "Esporta Dati",
          exporting: "Esportazione...",
          delete_title: "Elimina Tutti i Dati",
          delete_description: "Rimuovi permanentemente tutti i tuoi registri di terapia, voci di umore e dati di diario. Questa azione non può essere annullata.",
          delete_confirm_prompt: "Sei sicuro? Questo eliminerà permanentemente tutti i tuoi dati.",
          delete_confirm_button: "Sì, Elimina Tutto",
          deleting: "Eliminazione...",
          delete_button: "Elimina Tutti i Dati",
          cancel_button: "Annulla",
          retention_saved: "Impostazione di conservazione salvata",
          retention_failed: "Salvataggio dell'impostazione di conservazione fallito",
          export_success: "Dati esportati con successo",
          export_failed: "Esportazione dati fallita",
          delete_success: "Tutti i dati cancellati con successo",
          delete_failed: "Eliminazione dati fallita",
          privacy_notice: "Avviso sulla Privacy: Questa app non rivendica la conformità HIPAA. I tuoi dati sono archiviati in modo sicuro nel nostro database e soggetti ai nostri termini di servizio. Le richieste di eliminazione vengono elaborate immediatamente. Per domande sulla gestione dei dati, contatta il supporto."
        },
        notifications: {
          title: "Notifiche",
          daily_reminders: "Promemoria Giornalieri",
          daily_reminders_description: "Ricevi promemoria per il check-in giornaliero",
          progress_updates: "Aggiornamenti Progressi",
          progress_updates_description: "Riepilogo settimanale dei tuoi progressi",
          goal_reminders: "Promemoria Obiettivi",
          goal_reminders_description: "Notifiche sulle scadenze degli obiettivi",
          exercise_reminders: "Promemoria Esercizi",
          exercise_reminders_description: "Orari suggeriti per esercizi CBT"
        },
        account: {
          title: "Account",
          logout: "Disconnetti"
        },
        footer: {
          need_help: "Hai bisogno di aiuto?",
          contact_support: "Contatta il Supporto",
          version: "MindCare CBT Therapist · Versione 1.0"
        }
      },
      common: {
        loading: "Caricamento...",
        retry: "Riprova",
        cancel: "Annulla",
        continue: "Continua",
        return: "Indietro",
        close: "Chiudi",
        dismiss: "Ignora",
        complete: "Completa",
        close_video_aria: "Chiudi video",
        video_not_supported: "Il tuo browser non supporta il tag video.",
        audio_not_supported: "Il tuo browser non supporta l'elemento audio.",
        go_back_aria: "Indietro",
        go_back_home_aria: "Torna alla home",
        ai_label: "IA",
        you_label: "Tu",
        minutes_short: "min"
      },
      chat: {
        aria: {
          go_back_home: "Torna alla home",
          open_conversations: "Apri barra laterale conversazioni",
          close_conversations: "Chiudi barra laterale conversazioni"
        },
        therapist_title: "Il Tuo Terapeuta",
        therapist_subtitle: "Uno spazio sicuro per parlare",
        welcome: {
          title: "Benvenuto alla Terapia",
          message: "Questo è uno spazio sicuro e senza giudizi. Condividi ciò che hai in mente e lavoriamoci insieme.",
          start_session: "Inizia la Tua Prima Sessione"
        },
        thinking_placeholder: "Pensando...",
        summary_prompt: {
          title: "Vorresti un riepilogo della sessione?",
          description: "Ottieni punti chiave, esercizi consigliati e risorse utili",
          yes: "Sì, crea riepilogo",
          not_now: "Non ora"
        },
        input_placeholder: "Condividi ciò che hai in mente...",
        disclaimer: {
          title: "⚠️ Supporto IA - Non Terapia Professionale",
          message: "Non può diagnosticare né prescrivere. Crisi? Chiama 988 (USA) o i tuoi servizi di emergenza locali.",
          strict: "Promemoria: Questa IA non può diagnosticare condizioni né prescrivere trattamenti. Per preoccupazioni mediche, consulta un professionista autorizzato.",
          standard: "Promemoria: Questo è supporto assistito da IA, non terapia professionale. Le situazioni di emergenza richiedono aiuto professionale immediato."
        },
        delete_session_failed: "Impossibile eliminare la sessione. Riprova.",
        confirm_delete_session: "Eliminare questa sessione? Questa azione non può essere annullata.",
        daily_checkin_message: "Ho completato il mio Check-in Giornaliero.",
        consent: {
          lenient: {
            title: "Supporto Benessere IA - Modalità Permissiva",
            message: "Questa IA fornisce conversazioni di supporto con interruzioni minime. Non può diagnosticare, prescrivere o sostituire cure professionali. Le situazioni di crisi richiedono aiuto professionale immediato."
          },
          standard: {
            title: "Supporto Benessere IA - Modalità Standard",
            message: "Questa IA fornisce supporto al benessere utilizzando principi CBT basati sull'evidenza. Non sostituisce la cura della salute mentale professionale e non può diagnosticare né prescrivere. In crisi, contatta immediatamente i servizi di emergenza."
          },
          strict: {
            title: "Supporto Benessere IA - Modalità di Sicurezza Rigorosa",
            message: "Questa modalità include monitoraggio della sicurezza avanzato e promemoria frequenti. L'IA non può diagnosticare, prescrivere o gestire emergenze. È richiesta cura professionale della salute mentale per preoccupazioni cliniche."
          },
          learn_more: "Scopri di più sui profili di sicurezza",
          understand_button: "Ho Capito"
        },
        risk_panel: {
          title: "Siamo Qui per Aiutare",
          message: "Questa IA non può fornire supporto di emergenza. Se sei in crisi, contatta immediatamente un professionista.",
          crisis_hotline_label: "Hotline Crisi:",
          crisis_hotline_number: "988 (USA)",
          crisis_text_line_label: "Linea Testo Crisi:",
          crisis_text_line_number: "Invia \"HELLO\" al 741741",
          emergency_label: "Emergenza:",
          emergency_number: "911",
          return_to_chat: "Torna alla Chat"
        },
        conversations_list: {
          title: "Sessioni",
          empty_title: "Ancora nessuna sessione",
          empty_message: "Inizia una conversazione per cominciare",
          session_prefix: "Sessione",
          delete_aria: "Elimina sessione"
        },
        session_summary: {
          title: "Riepilogo Sessione",
          key_takeaways: "Punti Chiave",
          recommended_exercises: "Esercizi Consigliati",
          helpful_resources: "Risorse Utili",
          reflect_button: "Rifletti nel Diario",
          view_exercises_button: "Visualizza Tutti gli Esercizi"
        }
      },
      age_gate: {
        title: "Verifica dell'Età Richiesta",
        message: "Le nostre funzionalità di terapia con IA sono progettate per adulti di 18 anni o più. Questo ci aiuta a fornire supporto appropriato e mantenere standard di sicurezza.",
        teen_support_heading: "Se hai meno di 18 anni e hai bisogno di supporto:",
        teen_support: {
          counselor: "• Consulente scolastico o adulto fidato",
          teen_line: "• Teen Line: 1-800-852-8336 (o invia TEEN al 839863)",
          crisis_text_line: "• Linea Testo Crisi: Invia \"HOME\" al 741741"
        },
        confirm_button: "Ho 18 Anni o Più",
        decline_button: "Ho Meno di 18 Anni"
      },
      age_restricted: {
        title: "Limitato per Età",
        message: "Le nostre funzionalità di chat potenziate dall'IA sono progettate per utenti di 18 anni o più. Hai ancora accesso ad altri strumenti di benessere come il monitoraggio dell'umore, il diario e gli esercizi.",
        back_to_home: "Torna alla Home"
      },
      journeys: {
        page_title: "Percorsi",
        page_subtitle: "Percorsi guidati di sviluppo delle competenze per la crescita personale",
        tabs: {
          available: "Disponibile",
          in_progress: "In Corso",
          completed: "Completato"
        },
        empty_state: {
          no_available: "Nessun percorso disponibile al momento",
          no_in_progress: "Non hai ancora iniziato alcun percorso",
          no_completed: "Non hai ancora completato alcun percorso"
        },
        card: {
          days: "giorni",
          steps: "passi",
          progress: "Progresso",
          start_journey: "Inizia Percorso",
          view_details: "Visualizza Dettagli"
        },
        detail: {
          what_youll_gain: "Cosa otterrai:",
          journey_steps: "Passi del Percorso",
          day: "Giorno",
          play_game: "Gioca",
          reflection_placeholder: "La tua riflessione (facoltativo)",
          saving: "Salvataggio...",
          mark_complete: "Segna come Completato"
        }
      },
      mood_tracker: {
        page_title: "Tracciamento Umore",
        page_subtitle: "Traccia il tuo benessere emotivo e scopri schemi",
        update_today: "Aggiorna Oggi",
        log_mood: "Registra Umore",
        mood_trends: "Tendenze Umore",
        loading_chart: "Caricamento grafico...",
        no_data: "Ancora nessun dato sull'umore",
        no_data_subtitle: "Inizia a controllare quotidianamente per vedere le tendenze",
        tabs: {
          overview: "Panoramica",
          calendar: "Calendario",
          insights: "Approfondimenti IA"
        },
        time_range: {
          "7_days": "7 giorni",
          "14_days": "14 giorni",
          "30_days": "30 giorni"
        },
        form: {
          title: "Come ti senti oggi?",
          close_aria: "Chiudi modulo di registrazione umore",
          date: "Data",
          overall_mood: "Umore Generale",
          mood_excellent: "Eccellente",
          mood_good: "Buono",
          mood_okay: "Okay",
          mood_low: "Basso",
          mood_very_low: "Molto Basso",
          emotions_question: "Quali emozioni stai provando?",
          intensity_label: "Intensità Emotiva",
          mild: "Lieve",
          intense: "Intenso",
          energy_level: "Livello di Energia",
          energy_very_low: "Molto Basso",
          energy_low: "Basso",
          energy_moderate: "Moderato",
          energy_high: "Alto",
          energy_very_high: "Molto Alto",
          sleep_quality: "Qualità del Sonno",
          sleep_poor: "Scarsa",
          sleep_fair: "Discreta",
          sleep_good: "Buona",
          sleep_excellent: "Eccellente",
          stress_level: "Livello di Stress",
          relaxed: "Rilassato",
          very_stressed: "Molto Stressato",
          triggers_question: "Cosa ha innescato il tuo umore oggi?",
          activities_question: "Cosa hai fatto oggi?",
          notes_label: "Note Aggiuntive",
          notes_placeholder: "Altri pensieri o osservazioni sulla tua giornata...",
          save_error: "Impossibile salvare. Controlla la connessione e riprova.",
          saving: "Salvataggio...",
          save_entry: "Salva Voce",
          update_entry: "Aggiorna Voce"
        }
      },
      progress: {
        page_title: "Il Tuo Progresso",
        page_subtitle: "Traccia il tuo viaggio",
        page_subtitle_full: "Traccia il tuo viaggio e celebra la tua crescita",
        health_wellness: "Salute e Benessere",
        tabs: {
          overview: "Panoramica",
          achievements: "Successi",
          rewards: "Premi",
          mood: "Umore",
          goals: "Obiettivi",
          exercises: "Esercizi",
          health: "Salute"
        },
        dashboard: {
          current_streak: "Serie Corrente",
          days: "giorni",
          points: "Punti",
          badges: "Badge",
          level: "Livello",
          level_prefix: "Lv.",
          avg_mood: "Umore Medio",
          trend_improving: "miglioramento",
          trend_declining: "declino",
          trend_stable: "stabile",
          goals_achieved: "Obiettivi Raggiunti",
          active: "attivo",
          charts: {
            mood_trends: "Tendenze Umore (Ultimi 30 Giorni)",
            exercise_by_category: "Esercizi per Categoria",
            journal_consistency: "Coerenza del Diario",
            goal_progress: "Progresso Obiettivi"
          }
        }
      },
      mind_games: {
        page_title: "Giochi Mentali",
        page_subtitle: "Pratica interattiva delle abilità CBT e DBT",
        go_back_aria: "Indietro",
        close_aria: "Chiudi",
        recommended_title: "Consigliato per Te",
        recommended_subtitle: "In base alla tua attività, pensiamo che ti piaceranno questi:",
        thought_quiz: {
          score: "Punteggio",
          next_question: "Prossima Domanda"
        },
        games: {
          thought_quiz: { title: "Quiz di Pensieri", description: "Individua la trappola del pensiero in un esempio rapido." },
          reframe_pick: { title: "Scelta di Ristrutturazione", description: "Scegli il pensiero alternativo più equilibrato." },
          value_compass: { title: "Bussola dei Valori", description: "Scegli un valore, poi scegli una piccola azione." },
          tiny_experiment: { title: "Piccolo Esperimento", description: "Testa una convinzione con un esperimento di 2 minuti." },
          quick_win: { title: "Vittoria Rapida", description: "Registra una piccola vittoria e crea slancio." },
          calm_bingo: { title: "Bingo Calmo", description: "Segna 2 caselle per completare un mini turno." },
          dbt_stop: { title: "Abilità STOP", description: "Pausa, respira e scegli un prossimo passo saggio." },
          opposite_action: { title: "Azione Opposta", description: "Allinea azioni a obiettivi, non agli umori." },
          urge_surfing: { title: "Surf dell'Impulso", description: "Cavalca un impulso come un'onda per 60 secondi." },
          worry_time: { title: "Tempo delle Preoccupazioni", description: "Parcheggia preoccupazioni ora, programmale più tardi." },
          evidence_balance: { title: "Bilancio delle Prove", description: "Pesa le prove e trova una conclusione equa." },
          defusion_cards: { title: "Carte di Defusione", description: "Staccati dai pensieri in modo giocoso." },
          tipp_skills: { title: "Abilità TIPP", description: "Cambia velocemente la chimica corporea per ridurre l'intensità." },
          accepts: { title: "ACCEPTS", description: "Distrai dalle emozioni travolgenti efficacemente." },
          willing_hands: { title: "Mani Disponibili", description: "Pratica di accettazione basata sul corpo." },
          half_smile: { title: "Mezzo Sorriso", description: "Cambia emozioni con espressione facciale gentile." },
          improve: { title: "IMPROVE", description: "Migliora il momento nella crisi." },
          leaves_on_stream: { title: "Foglie sul Ruscello", description: "Guarda i pensieri galleggiare senza afferrarli." },
          expansion: { title: "Espansione", description: "Fai spazio per emozioni difficili." },
          values_check: { title: "Controllo dei Valori", description: "Controllo rapido di allineamento con i tuoi valori." },
          pros_and_cons: { title: "Pro e Contro", description: "Prendere decisioni sagge in crisi." },
          check_the_facts: { title: "Controlla i Fatti", description: "La tua emozione si adatta alla situazione?" },
          self_soothe: { title: "Auto-Calmante 5 Sensi", description: "Confortati con esperienze sensoriali." },
          mountain_meditation: { title: "Meditazione della Montagna", description: "Incarna stabilità e radicamento." }
        },
        content: {
          thought_quiz: {
            items: [
              { prompt: "If I don't do this perfectly, I'm a total failure.", options: ["All-or-nothing thinking", "Mind reading", "Catastrophizing", "Discounting the positive"], explanation: "This treats performance as a strict pass/fail label instead of a spectrum." },
              { prompt: "They haven't replied yet, so they must be upset with me.", options: ["Emotional reasoning", "Mind reading", "Labeling", "Overgeneralization"], explanation: "You're assuming you know what they think without clear evidence." },
              { prompt: "If I make one mistake, everything will fall apart.", options: ["Catastrophizing", "Personalization", "Should statements", "Mental filter"], explanation: "This jumps to the worst-case outcome and treats it as likely." },
              { prompt: "I had an awkward moment today. I always mess things up.", options: ["Overgeneralization", "Mind reading", "Fortune telling", "Disqualifying the positive"], explanation: "One moment gets turned into a sweeping rule about your whole life." },
              { prompt: "I feel anxious, so something bad must be about to happen.", options: ["Emotional reasoning", "Should statements", "Labeling", "Black-and-white thinking"], explanation: "Feelings are treated like facts, even when they're just signals." },
              { prompt: "My friend sounded quiet. It's probably my fault.", options: ["Personalization", "Catastrophizing", "Fortune telling", "Magnification"], explanation: "You're taking responsibility for something that may have many causes." },
              { prompt: "I should be more productive all the time.", options: ["Should statements", "Mental filter", "Mind reading", "Overgeneralization"], explanation: "Rigid rules ('should') create pressure and ignore real human limits." },
              { prompt: "One person criticized me, so I'm probably not good at this.", options: ["Labeling", "Disqualifying the positive", "Magnification", "All-or-nothing thinking"], explanation: "A single critique gets blown up and outweighs the full picture." },
              { prompt: "I did well, but it doesn't count because it was easy.", options: ["Discounting the positive", "Fortune telling", "Personalization", "Catastrophizing"], explanation: "You're dismissing real effort and progress instead of acknowledging it." },
              { prompt: "Everyone noticed my mistake. They must think I'm incompetent.", options: ["Mind reading", "Mental filter", "Emotional reasoning", "Should statements"], explanation: "You're guessing others' judgments without checking the evidence." },
              { prompt: "If I try and it's uncomfortable, that means it's wrong for me.", options: ["Emotional reasoning", "Overgeneralization", "Labeling", "Disqualifying the positive"], explanation: "Discomfort can be part of growth; it doesn't automatically mean danger." },
              { prompt: "I didn't meet my goal today, so I'm never going to change.", options: ["Fortune telling", "Catastrophizing", "Overgeneralization", "All-or-nothing thinking"], explanation: "A single day becomes a permanent prediction, ignoring gradual progress." }
            ],
            advanced: [
              { prompt: "I received constructive feedback, but all I can think about is the one negative comment buried in it.", options: ["Mental filter", "Overgeneralization", "Personalization", "Emotional reasoning"], explanation: "You're filtering out the positive and focusing only on the negative detail." },
              { prompt: "If I set boundaries, people will see me as selfish and abandon me.", options: ["Fortune telling + labeling", "Mind reading + catastrophizing", "Should statements", "Emotional reasoning"], explanation: "This combines mind reading (knowing what they'll think) with catastrophizing (predicting abandonment)." },
              { prompt: "I didn't get the promotion, which proves I'm not competent enough, and I never will be.", options: ["Fortune telling + labeling", "All-or-nothing thinking", "Discounting the positive", "Personalization"], explanation: "This creates a fixed label and predicts a permanent future based on one event." },
              { prompt: "My colleague was curt with me today. I must have done something to upset them, and now the whole team probably thinks poorly of me.", options: ["Personalization + magnification + mind reading", "Catastrophizing + overgeneralization", "Mental filter + should statements", "Emotional reasoning"], explanation: "This combines taking personal blame, blowing up the impact, and assuming you know what others think." },
              { prompt: "I feel uncertain about this decision, which means I'm making the wrong choice.", options: ["Emotional reasoning", "Fortune telling", "All-or-nothing thinking", "Catastrophizing"], explanation: "The feeling of uncertainty is treated as evidence of a bad decision, not just a normal part of choosing." }
            ]
          },
          reframe_pick: {
            items: [
              { situation: "You sent a message and haven't heard back.", automatic_thought: "They're ignoring me because I said something wrong.", choices: ["They're busy. I can wait or follow up later in a calm way.", "They definitely hate me now and I ruined everything.", "I'll never message anyone again so I don't risk feeling this."], why: "It considers multiple possibilities and suggests a reasonable next step." },
              { situation: "You made a small mistake at work/school.", automatic_thought: "I'm terrible at this.", choices: ["One mistake is normal. I can fix it and learn for next time.", "I'm the worst person here. I should quit immediately.", "I'll pretend it didn't happen and avoid anything challenging."], why: "It's specific, realistic, and focused on learning rather than global labels." },
              { situation: "A friend was quiet during your hangout.", automatic_thought: "They must be annoyed with me.", choices: ["I don't know the reason. I can check in kindly or give space.", "It's my fault. I always ruin friendships.", "I should cut them off before they reject me first."], why: "It avoids mind reading and leaves room for a gentle check-in." },
              { situation: "You didn't finish a task you planned.", automatic_thought: "I'm so lazy.", choices: ["I struggled today. I can pick one small next step and restart.", "I'm hopeless. I'll never be consistent at anything.", "I should punish myself until I finally get disciplined."], why: "It acknowledges difficulty and moves toward a doable, compassionate action." },
              { situation: "You feel anxious before an event.", automatic_thought: "This anxiety means the event will go badly.", choices: ["Anxiety is a feeling, not a prediction. I can go anyway and cope.", "Anxiety means danger. I must avoid this at all costs.", "I need to feel zero anxiety before I'm allowed to show up."], why: "It separates feelings from forecasts and supports valued action." },
              { situation: "Someone gave you feedback.", automatic_thought: "I'm not good enough.", choices: ["Feedback can help me improve. I can take what's useful and grow.", "They think I'm incompetent and everyone agrees with them.", "I'll stop trying so no one can judge me again."], why: "It keeps self-worth intact while allowing improvement." },
              { situation: "You didn't get invited to something.", automatic_thought: "Nobody likes me.", choices: ["There could be many reasons. I can reach out or plan something else.", "This proves I'm unlikable and always will be.", "I'll isolate so I don't have to feel left out again."], why: "It avoids overgeneralization and offers flexible, constructive options." },
              { situation: "You're learning a new skill and feel behind.", automatic_thought: "If I'm not fast, I'm not meant for this.", choices: ["Skills grow with practice. I can improve step by step.", "If I'm not immediately great, it's a waste of time.", "I should compare myself nonstop to prove I'm failing."], why: "It supports growth mindset and realistic learning curves." }
            ]
          },
          value_compass: {
            values: [
              { value: "Family", actions: ["Send a kind message to a family member.", "Do one small helpful thing at home.", "Plan 10 minutes of quality time today."] },
              { value: "Health", actions: ["Drink a glass of water right now.", "Take a 2-minute stretch break.", "Step outside for fresh air for 3 minutes."] },
              { value: "Growth", actions: ["Learn one tiny thing (watch/read for 2 minutes).", "Practice a skill for 3 minutes.", "Write one sentence about what you want to improve."] },
              { value: "Friendship", actions: ["Check in with a friend with a simple hello.", "Reply to a message you've been postponing.", "Share one genuine compliment today."] },
              { value: "Courage", actions: ["Do the smallest version of the scary step (10%).", "Name what you fear in one sentence, then proceed anyway.", "Ask one small question instead of assuming."] },
              { value: "Calm", actions: ["Take 5 slow breaths (count 4 in / 4 out).", "Relax your shoulders and jaw for 20 seconds.", "Put your phone down for 2 minutes and reset."] },
              { value: "Creativity", actions: ["Write a silly 1-line idea (no judgment).", "Take a photo of something interesting around you.", "Doodle for 60 seconds."] },
              { value: "Purpose", actions: ["Choose one task that matters and do 2 minutes of it.", "Write your 'why' in 1 sentence.", "Remove one small obstacle from your path today."] }
            ]
          },
          tiny_experiment: {
            items: [
              { belief: "If I ask for help, people will think I'm weak.", experiments: ["Ask one small, specific question and observe the response.", "Ask a trusted person for a tiny favor and note what happens.", "Ask for clarification once instead of guessing."], reflection_question: "What happened?", reflection_options: ["It went better than I feared.", "It was neutral / fine.", "It was uncomfortable, but I handled it."] },
              { belief: "If I say no, people will dislike me.", experiments: ["Say no to a low-stakes request using one polite sentence.", "Offer an alternative (not now / later) instead of automatic yes.", "Pause for 5 seconds before agreeing to anything."], reflection_question: "What did you notice?", reflection_options: ["People respected it.", "Nothing dramatic happened.", "It felt hard, and I survived it."] },
              { belief: "If I make a mistake, it will be a disaster.", experiments: ["Do a small task imperfectly on purpose (10%) and observe outcomes.", "Share a minor correction without apologizing excessively.", "Let one tiny typo exist and see what actually happens."], reflection_question: "What was the outcome?", reflection_options: ["No one cared.", "It was fixable.", "It felt big in my head, smaller in reality."] },
              { belief: "If I don't feel motivated, I can't start.", experiments: ["Start for 2 minutes only, then reassess.", "Set a timer for 90 seconds and do the first step.", "Make the task 10x smaller and begin."], reflection_question: "After starting, how was it?", reflection_options: ["Easier than expected.", "Still hard, but possible.", "I gained a little momentum."] },
              { belief: "If someone is quiet, it must be about me.", experiments: ["Write 3 alternative explanations before reacting.", "Ask a simple check-in question instead of assuming.", "Wait 30 minutes and see if new info appears."], reflection_question: "What did you learn?", reflection_options: ["I didn't have enough evidence.", "There were other explanations.", "Checking in was helpful."] },
              { belief: "I have to do everything right to be accepted.", experiments: ["Share one imperfect draft and request feedback.", "Do one task at 'good enough' level and stop.", "Let someone else choose one detail instead of controlling it."], reflection_question: "How did it go?", reflection_options: ["Good enough worked.", "Acceptance didn't depend on perfection.", "I felt discomfort, and it passed."] },
              { belief: "If I feel anxious, I shouldn't go.", experiments: ["Go for 5 minutes only and reassess.", "Bring one coping tool (water / music / breathing).", "Rate anxiety 0–10 before and after to compare."], reflection_question: "What did you notice?", reflection_options: ["Anxiety changed over time.", "I could function with anxiety present.", "Avoidance wasn't necessary."] },
              { belief: "If I rest, I'm wasting time.", experiments: ["Take a 3-minute break and then return to one small task.", "Rest first, then do 2 minutes of the priority task.", "Track: does a short break help focus?"], reflection_question: "Result?", reflection_options: ["Rest helped me reset.", "No harm done.", "I returned with a bit more clarity."] },
              { belief: "If I don't get it quickly, I'm not capable.", experiments: ["Practice for 3 minutes daily for 3 days and compare.", "Ask one question and notice improvement.", "Write one thing you learned today, even if small."], reflection_question: "What changed?", reflection_options: ["Progress showed up gradually.", "Learning took repetition.", "I was harsher than necessary."] },
              { belief: "I need to feel confident before I act.", experiments: ["Act with 'small courage' for 2 minutes anyway.", "Do the first step while confidence is low.", "Rate confidence after action (not before)."], reflection_question: "After action, how was your confidence?", reflection_options: ["A bit higher.", "About the same, but I did it.", "I learned I can move without perfect confidence."] }
            ]
          },
          quick_win: {
            presets: ["I drank water.", "I took a 2-minute break.", "I sent one message I was avoiding.", "I cleaned one tiny area.", "I did one small task for 2 minutes.", "I took 5 slow breaths.", "I stepped outside for fresh air.", "I asked a question instead of assuming.", "I showed up even though it was uncomfortable.", "I wrote one helpful sentence to myself.", "I stretched my shoulders/neck.", "I ate something nourishing.", "I paused before reacting.", "I said no (or not now) politely.", "I made a small plan for tomorrow.", "I finished a mini-step.", "I noticed a thinking trap and named it.", "I chose 'good enough' and stopped.", "I did something kind for someone.", "I did something kind for myself."]
          },
          calm_bingo: {
            tiles: ["Drink a glass of water", "5 slow breaths", "Relax shoulders + jaw", "Look out a window for 30s", "Stand up and stretch", "Send a kind text", "Tidy one small thing", "Step outside for 2 minutes", "Name 3 things you can see", "Play one calm song", "Write 1 supportive sentence", "Wash your hands slowly", "Move your body for 60s", "Put phone down for 2 minutes", "Smile gently (even 10%)", "Choose one tiny next step"]
          },
          dbt_stop: {
            prompts: [
              { trigger: "You feel a strong urge to react immediately.", steps: [{ key: "S", label: "Stop", text: "Pause. Don't act yet." }, { key: "T", label: "Take a step back", text: "Breathe once. Create a tiny space." }, { key: "O", label: "Observe", text: "Notice: thoughts, feelings, body signals." }, { key: "P", label: "Proceed mindfully", text: "Choose one wise next step." }], next_steps: ["Send a calm, short reply (or wait 10 minutes).", "Ask one clarifying question.", "Do one small grounding action, then decide."] },
              { trigger: "You're about to avoid something important.", steps: [{ key: "S", label: "Stop", text: "Pause avoidance for a moment." }, { key: "T", label: "Take a step back", text: "Exhale slowly and reset posture." }, { key: "O", label: "Observe", text: "What are you afraid will happen?" }, { key: "P", label: "Proceed mindfully", text: "Pick the smallest brave step (10%)." }], next_steps: ["Do 2 minutes of the first step only.", "Make it easier: reduce scope by 50%.", "Text someone: 'I'm starting now—wish me luck.'"] },
              { trigger: "You feel criticized and want to defend yourself fast.", steps: [{ key: "S", label: "Stop", text: "Hold back the instant response." }, { key: "T", label: "Take a step back", text: "Breathe and relax your jaw." }, { key: "O", label: "Observe", text: "What's the goal: to win or to repair?" }, { key: "P", label: "Proceed mindfully", text: "Respond to the goal, not the heat." }], next_steps: ["Say: 'Let me think about that for a moment.'", "Reflect back what you heard in one sentence.", "Ask: 'What would be most helpful right now?'"] },
              { trigger: "You're scrolling/doomscrolling and feel stuck.", steps: [{ key: "S", label: "Stop", text: "Pause scrolling now." }, { key: "T", label: "Take a step back", text: "Put phone down for one breath." }, { key: "O", label: "Observe", text: "Name the feeling in one word." }, { key: "P", label: "Proceed mindfully", text: "Choose one small helpful action." }], next_steps: ["Drink water and stretch for 30 seconds.", "Open a window or step outside for 1 minute.", "Write one tiny next step and do it."] }
            ]
          },
          opposite_action: {
            items: [
              { emotion: "Anxiety", urge: "Avoid / escape", opposite: "Approach gently", choices: ["Show up for 5 minutes, then reassess.", "Do the smallest first step (10%).", "Ask one question instead of avoiding."], note: "Opposite action is for emotions that don't fit the facts or are too intense." },
              { emotion: "Sadness", urge: "Withdraw / isolate", opposite: "Connect or activate", choices: ["Send one simple 'hey' message.", "Step outside for 2 minutes.", "Do a tiny task to build momentum."], note: "Small activation often shifts mood more than waiting for motivation." },
              { emotion: "Anger", urge: "Attack / argue", opposite: "Be gentle and effective", choices: ["Lower voice + slow down your words.", "State one need clearly without blame.", "Take a 2-minute pause before replying."], note: "Opposite action aims for effectiveness, not 'winning.'" },
              { emotion: "Shame", urge: "Hide / disappear", opposite: "Small reveal + self-respect", choices: ["Share a tiny truth with a safe person.", "Stand tall, breathe, and stay present for 30s.", "Do one value-based action anyway."], note: "Shame shrinks with safe connection and self-respect actions." },
              { emotion: "Guilt (too much)", urge: "Over-apologize / self-punish", opposite: "Repair effectively", choices: ["Apologize once, then propose one repair step.", "Ask what would help and listen.", "Stop repeating apologies; act instead."], note: "Effective repair beats endless self-blame." },
              { emotion: "Fear of rejection", urge: "People-please / over-text", opposite: "Balanced boundary", choices: ["Send one message, then wait.", "Do one self-caring action while you wait.", "Remind yourself: 'I can handle uncertainty.'"], note: "Opposite action builds tolerance for uncertainty." }
            ]
          },
          urge_surfing: {
            beginner: [
              { title: "Ride the wave (60 seconds)", steps: ["Name the urge: 'I'm having the urge to ____.'", "Rate intensity 0–10.", "Notice where it lives in the body.", "Breathe slowly for 5 breaths.", "Rate intensity again. (Urges rise and fall.)"], finish_choices: ["Delay 10 minutes (set a timer).", "Do a 2-minute replacement action.", "Ask for support (one message)."] },
              { title: "Surf + redirect", steps: ["Name the urge without judging it.", "Imagine it as a wave—rising, cresting, passing.", "Relax shoulders and jaw.", "Pick one value-based micro-action."], finish_choices: ["Take 10% of a helpful step.", "Move your body for 60 seconds.", "Drink water + reset posture."] }
            ],
            advanced: [
              { title: "Surf independently (90 seconds)", steps: ["Name and rate the urge (0-10).", "Locate it in your body.", "Breathe with it for 10 breaths.", "Notice the peak and decline.", "Rate it again."], finish_choices: ["Delay 20 minutes and reassess.", "Do the opposite action for 5 minutes.", "Journal about what you noticed."] },
              { title: "Surf + value-based action", steps: ["Acknowledge the urge without judgment.", "Watch it like a scientist observing data.", "Let it peak naturally.", "Choose one value-aligned micro-step."], finish_choices: ["Do the tiny step immediately.", "Practice the skill again in 1 hour.", "Note what worked for next time."] }
            ]
          },
          worry_time: {
            items: [
              { worry: "What if I mess up tomorrow?", park_it: "I'll think about this during Worry Time at 6:00 PM for 10 minutes.", tiny_now: ["Write one small preparation step.", "Do 2 minutes of that step now.", "Then return to the present task."] },
              { worry: "What if they're mad at me?", park_it: "I'll revisit this at 7:00 PM for 10 minutes, then decide on a calm follow-up.", tiny_now: ["List 2 alternative explanations.", "Wait 30 minutes before acting.", "Do one calming reset (5 breaths)."] },
              { worry: "What if something bad happens?", park_it: "I'll schedule Worry Time at 5:30 PM for 10 minutes and focus on what's controllable.", tiny_now: ["Name 1 thing you can control today.", "Do the smallest step toward it.", "Return attention to the room."] },
              { worry: "I'm behind; I'll never catch up.", park_it: "I'll worry about this at 6:30 PM for 10 minutes and make a realistic plan.", tiny_now: ["Pick the single next step.", "Work 2 minutes on it.", "Stop and acknowledge progress."] },
              { worry: "What if I disappoint people?", park_it: "I'll revisit this at 8:00 PM for 10 minutes and choose a value-based action.", tiny_now: ["Ask: 'What matters to me here?'", "Choose one respectful sentence/boundary.", "Delay responding for 10 minutes."] },
              { worry: "What if I can't handle it?", park_it: "I'll schedule Worry Time at 7:30 PM for 10 minutes and review coping options.", tiny_now: ["Write 1 coping tool you already use.", "Use it for 60 seconds.", "Continue with the next small task."] }
            ]
          },
          evidence_balance: {
            items: [
              { thought: "I always mess things up.", evidence_for: ["I made a mistake recently.", "I remember failures more than successes."], evidence_against: ["I've done many things well.", "One mistake doesn't define 'always'."], balanced_conclusion: "I've made mistakes and also succeeded. I can learn and improve." },
              { thought: "They don't like me.", evidence_for: ["They replied late once.", "They were quiet last time."], evidence_against: ["They've been friendly before.", "There are many reasons for silence."], balanced_conclusion: "I don't know their thoughts. I can check in calmly or wait for more info." },
              { thought: "If I'm anxious, I can't cope.", evidence_for: ["Anxiety feels intense.", "I want to escape when anxious."], evidence_against: ["I've coped with anxiety before.", "Anxiety rises and falls."], balanced_conclusion: "Anxiety is uncomfortable but manageable. I can act while it's present." },
              { thought: "I'm not improving.", evidence_for: ["Progress feels slow.", "I compare myself to others."], evidence_against: ["I've taken small steps.", "Learning is gradual."], balanced_conclusion: "Progress can be slow and real. Small steps still count." },
              { thought: "I must do everything perfectly.", evidence_for: ["I value quality.", "Perfection sometimes prevents criticism."], evidence_against: ["Perfect isn't required to succeed.", "Good-enough frees time and reduces stress."], balanced_conclusion: "I can aim for quality while allowing 'good enough' when it's effective." },
              { thought: "If I say no, I'll be rejected.", evidence_for: ["I worry about disappointing people.", "I've had conflict before."], evidence_against: ["Many people respect boundaries.", "I can say no politely and offer alternatives."], balanced_conclusion: "Saying no respectfully protects relationships and my wellbeing." }
            ]
          },
          defusion_cards: {
            cards: [
              { thought: "I'm not good enough.", defuse_lines: ["I'm having the thought that I'm not good enough.", "Thanks, mind. Interesting story.", "This is a thought, not a fact."] },
              { thought: "Something bad will happen.", defuse_lines: ["I'm noticing a 'danger prediction' thought.", "My mind is trying to protect me.", "I can take one small step anyway."] },
              { thought: "They're judging me.", defuse_lines: ["I'm having the thought they're judging me.", "I can't read minds. I can act on my values.", "Let this thought ride in the back seat."] },
              { thought: "I can't handle this feeling.", defuse_lines: ["I'm noticing the thought 'I can't handle it'.", "Feelings are waves; they change.", "I can make room and keep going."] },
              { thought: "I must fix everything now.", defuse_lines: ["There's the 'urgent fixer' thought.", "I can pause and choose one wise next step.", "Slow is smooth; smooth is fast."] },
              { thought: "If it's hard, I should quit.", defuse_lines: ["I'm having the thought 'quit'.", "Hard can mean 'new', not 'wrong'.", "I can do the smallest version (10%)."] }
            ]
          },
          tipp_skills: {
            situation: "Your emotions are at 8/10 or higher and you need to come down fast.",
            skills: [
              { letter: "T", name: "Temperature", description: "Cold water on face, ice cube, cold shower" },
              { letter: "I", name: "Intense exercise", description: "Run, jump, push-ups for 60 seconds" },
              { letter: "P", name: "Paced breathing", description: "Breathe out longer than in (4 in / 6 out)" },
              { letter: "P", name: "Paired muscle relaxation", description: "Tense then release muscle groups" }
            ],
            actions: ["Splash cold water on your face for 30 seconds.", "Do 20 jumping jacks right now.", "Breathe: 4 in, hold 4, 6 out—repeat 5 times."]
          },
          accepts: {
            items: [
              { letter: "A", name: "Activities", description: "Do something engaging", action: "Watch a 5-minute video, play a quick game, or clean one surface." },
              { letter: "C", name: "Contributing", description: "Help someone else", action: "Send a kind message, do one helpful thing, or share something useful." },
              { letter: "C", name: "Comparisons", description: "Compare to when you coped before", action: "Remember: You've survived 100% of your worst days so far." },
              { letter: "E", name: "Emotions", description: "Create a different emotion", action: "Watch something funny, listen to upbeat music, or read something calming." },
              { letter: "P", name: "Pushing away", description: "Mentally put the situation aside", action: "Imagine putting the problem in a box on a shelf for later." },
              { letter: "T", name: "Thoughts", description: "Fill your mind with other thoughts", action: "Count backwards from 100 by 7s, list countries A-Z, or describe the room." },
              { letter: "S", name: "Sensations", description: "Create strong physical sensations", action: "Hold ice, take a hot/cold shower, or squeeze a stress ball hard." }
            ]
          },
          improve: {
            items: [
              { letter: "I", name: "Imagery", description: "Visualize a peaceful or safe place", quick_action: "Close your eyes. Picture a place you feel calm (real or imagined)." },
              { letter: "M", name: "Meaning", description: "Find purpose in the pain", quick_action: "Ask: What can I learn? How might this help me grow?" },
              { letter: "P", name: "Prayer", description: "Connect to something larger", quick_action: "Say a phrase that grounds you or ask for support from your values/beliefs." },
              { letter: "R", name: "Relaxation", description: "Relax your body", quick_action: "Tense and release: shoulders, jaw, hands. Breathe slowly." },
              { letter: "O", name: "One thing in the moment", description: "Focus fully on one small task", quick_action: "Pick one action: wash a dish, water a plant, fold one item." },
              { letter: "V", name: "Vacation", description: "Take a brief mental break", quick_action: "Give yourself 10 minutes off from the problem. Set a timer." },
              { letter: "E", name: "Encouragement", description: "Be your own cheerleader", quick_action: "Say: 'I can handle this. I've done hard things before.'" }
            ]
          },
          self_soothe: {
            senses: [
              { sense: "Vision", actions: ["Look at nature or a calming image.", "Watch clouds or water move.", "Light a candle and watch the flame."] },
              { sense: "Hearing", actions: ["Listen to calming music or nature sounds.", "Play a song that makes you feel safe.", "Listen to the sound of rain or wind."] },
              { sense: "Smell", actions: ["Smell something pleasant (lotion, coffee, flowers).", "Light a scented candle or incense.", "Take a deep breath of fresh air."] },
              { sense: "Taste", actions: ["Eat something you enjoy slowly.", "Savor a piece of chocolate or tea.", "Notice the flavors and textures."] },
              { sense: "Touch", actions: ["Hold something soft (blanket, pet).", "Take a warm shower or bath.", "Massage your hands with lotion."] }
            ]
          }
        }
      },
      exercises: {
        page_title: "Libreria Esercizi",
        page_subtitle: "Pratica tecniche CBT",
        page_subtitle_full: "Sfoglia e pratica tecniche CBT basate sull'evidenza",
        loading: "Caricamento esercizi...",
        go_back_aria: "Indietro",
        ai_plan: "Piano di Pratica IA",
        favorites: "Preferiti",
        search_placeholder: "Cerca esercizi...",
        empty_state: {
          favorites_title: "Ancora nessun preferito",
          no_results_title: "Nessun esercizio trovato",
          favorites_message: "Segna gli esercizi come preferiti per vederli qui",
          search_message: "Prova a regolare la tua ricerca o i filtri",
          no_exercises_message: "Nessun esercizio disponibile"
        },
        library: {
          flexible: "Flessibile"
        },
        categories: {
          all: "Tutti",
          breathing: "Respirazione",
          grounding: "Radicamento",
          cognitive: "Cognitivo",
          behavioral: "Comportamentale",
          mindfulness: "Consapevolezza",
          exposure: "Esposizione",
          sleep: "Sonno",
          relationships: "Relazioni",
          stress: "Gestione dello Stress"
        },
        detail: {
          untitled_exercise: "Esercizio Senza Titolo",
          duration_options_suffix: "min opzioni",
          minutes_suffix: "minuti",
          video_label: "Video",
          tabs: {
            overview: "Panoramica",
            practice: "Pratica",
            audio: "Audio",
            benefits: "Benefici",
            tips: "Consigli"
          },
          about: "Informazioni su Questo Esercizio",
          guided_visualization: "Visualizzazione Guidata",
          video_demonstration: "Dimostrazione Video",
          helps_with: "Aiuta Con",
          guided_audio: "Audio Guidato",
          guided_audio_description: "Segui la guida audio narrata professionalmente per questo esercizio.",
          step_by_step_guide: "Guida Passo per Passo",
          step_duration: "Durata: {{seconds}} secondi",
          instructions: "Istruzioni",
          choose_duration: "Scegli Durata",
          key_benefits: "Benefici Principali",
          default_benefits: "Questo esercizio aiuta a migliorare il benessere mentale, ridurre lo stress e migliorare la regolazione emotiva.",
          helpful_tips: "Consigli Utili",
          default_tips: "Pratica regolarmente per risultati migliori. Trova uno spazio tranquillo, inizia lentamente e sii paziente con te stesso.",
          your_progress: "Il Tuo Progresso",
          times_completed: "Volte Completato",
          minutes_practiced: "Minuti Praticati",
          last_practiced: "Ultima pratica: {{date}}",
          completed_message: "Esercizio Completato!",
          mark_as_complete: "Segna come Completato"
        }
      }
    }
  },
  pt: {
    translation: {
      sidebar: {
        home: { name: "Início", description: "Painel e visão geral" },
        chat: { name: "Chat", description: "Terapeuta IA" },
        coach: { name: "Coach", description: "Coach de Bem-estar IA" },
        mood: { name: "Humor", description: "Acompanhe seu humor" },
        journal: { name: "Diário", description: "Registros de pensamentos" },
        progress: { name: "Progresso", description: "Acompanhe sua jornada" },
        exercises: { name: "Exercícios", description: "Técnicas CBT" },
        community: { name: "Comunidade" },
        resources: { name: "Recursos" },
        settings: { name: "Configurações" }
      },
      global: {
        app_name: "MindWell",
        app_tagline: "App de Bem-estar Mental"
      },
      mobile_menu: {
        menu_title: "Menu",
        open_aria: "Abrir menu",
        close_aria: "Fechar menu"
      },
      home: {
        greeting: {
          morning: "Bom dia",
          afternoon: "Boa tarde",
          evening: "Boa noite"
        },
        active_goals: "Objetivos Ativos",
        journal_entries: "Entradas de Diário",
        error: {
          goals_load: "Não foi possível carregar os objetivos.",
          journal_load: "Não foi possível carregar as entradas do diário."
        },
        aria: {
          view_goal_details: "Ver detalhes do objetivo",
          view_journal_entry: "Ver entrada de diário",
          watch_help_video: "Assistir vídeo de ajuda",
          watch_goals_help_video: "Assistir vídeo de ajuda de objetivos",
          watch_journal_help_video: "Assistir vídeo de ajuda de diário"
        }
      },
      quick_actions: {
        title: "Ações Rápidas",
        recommended: { title: "Recomendado para Você", description: "Sugestões personalizadas por IA" },
        ai_therapist: { title: "Terapeuta IA", description: "Converse com seu terapeuta" },
        journal_thought: { title: "Registrar um Pensamento", description: "Desafie o pensamento" },
        set_goal: { title: "Definir um Objetivo", description: "Defina objetivos" },
        mind_games: { title: "Jogos Mentais", description: "Exercícios mentais rápidos" },
        journeys: { title: "Jornadas", description: "Caminhos de habilidades selecionados" },
        exercises_library: { title: "Biblioteca de Exercícios", description: "Navegue pelas técnicas" },
        video_library: { title: "Biblioteca de Vídeos", description: "Assista e aprenda" },
        personalized_recommendations: "Recomendações Personalizadas",
        aria: {
          guided_intro_video: "Vídeo de introdução guiada",
          close_video: "Fechar vídeo"
        }
      },
      settings: {
        page_title: "Configurações",
        page_subtitle: "Gerencie sua conta e preferências",
        profile: {
          title: "Perfil",
          full_name: "Nome Completo",
          name_placeholder: "Seu nome",
          email: "E-mail",
          email_readonly: "O e-mail não pode ser alterado",
          role: "Função",
          role_admin: "Administrador",
          role_user: "Usuário",
          save_changes: "Salvar Alterações",
          saving: "Salvando..."
        },
        language: {
          title: "Idioma",
          description: "Escolha seu idioma preferido",
          current: "Idioma atual",
          en: "English (Inglês)",
          he: "עברית (Hebraico)",
          es: "Español (Espanhol)",
          fr: "Français (Francês)",
          de: "Deutsch (Alemão)",
          it: "Italiano (Italiano)",
          pt: "Português (Portuguese)"
        },
        theme: {
          title: "Tema de Cor",
          description: "Escolha um tema visual que seja confortável para você",
          default: { name: "Padrão", description: "Gradientes verdes e roxos calmos" },
          ocean: { name: "Oceano", description: "Azuis e verdes-azulados serenos" },
          sunset: { name: "Pôr do Sol", description: "Laranjas e rosas quentes" },
          forest: { name: "Floresta", description: "Verdes naturais e tons terrosos" },
          lavender: { name: "Lavanda", description: "Roxos e violetas suaves" },
          minimal: { name: "Minimalista", description: "Cinzas e pretos limpos" }
        },
        dashboard_layout: {
          title: "Layout do Painel",
          description: "Escolha como seu painel inicial é organizado",
          default_title: "Padrão",
          default_description: "Layout equilibrado com todas as seções",
          compact_title: "Compacto",
          compact_description: "Visualização condensada para acesso rápido"
        },
        subscription: {
          title: "Assinatura",
          free_trial: "Teste Gratuito",
          active: "Ativo",
          description: "Você está atualmente em um teste gratuito. Atualize para Premium para acesso ilimitado a todos os recursos.",
          feature_sessions: "✓ Sessões de terapia limitadas (5 grátis)",
          feature_exercises: "✓ Exercícios CBT básicos",
          feature_mood: "✓ Rastreamento de humor",
          upgrade_button: "Atualizar para Premium - R$ 9,99/mês",
          premium_benefits: "Premium inclui: Sessões ilimitadas, exercícios avançados, suporte prioritário e mais."
        },
        data_privacy: {
          title: "Dados e Privacidade",
          retention_label: "Política de Retenção de Dados",
          retention_description: "Escolha por quanto tempo seus registros de terapia, entradas de humor e dados de diário são mantidos. Após este período, os registros podem ser excluídos automaticamente.",
          retention_30_days: "30 dias",
          retention_90_days: "90 dias",
          retention_1_year: "1 ano",
          retention_indefinite: "Manter indefinidamente",
          current_setting: "Configuração atual: {{value}}",
          current_setting_indefinite: "Indefinido",
          current_setting_days: "{{days}} dias",
          export_title: "Exportar Seus Dados",
          export_description: "Baixe um resumo de seus registros de terapia, entradas de humor e objetivos como arquivo JSON.",
          export_button: "Exportar Dados",
          exporting: "Exportando...",
          delete_title: "Excluir Todos os Dados",
          delete_description: "Remova permanentemente todos os seus registros de terapia, entradas de humor e dados de diário. Esta ação não pode ser desfeita.",
          delete_confirm_prompt: "Tem certeza? Isso excluirá permanentemente todos os seus dados.",
          delete_confirm_button: "Sim, Excluir Tudo",
          deleting: "Excluindo...",
          delete_button: "Excluir Todos os Dados",
          cancel_button: "Cancelar",
          retention_saved: "Configuração de retenção salva",
          retention_failed: "Falha ao salvar configuração de retenção",
          export_success: "Dados exportados com sucesso",
          export_failed: "Falha ao exportar dados",
          delete_success: "Todos os dados foram apagados com sucesso",
          delete_failed: "Falha ao excluir dados",
          privacy_notice: "Aviso de Privacidade: Este aplicativo não reivindica conformidade com HIPAA. Seus dados são armazenados com segurança em nosso banco de dados e sujeitos aos nossos termos de serviço. Solicitações de exclusão são processadas imediatamente. Para perguntas sobre manipulação de dados, entre em contato com o suporte."
        },
        notifications: {
          title: "Notificações",
          daily_reminders: "Lembretes Diários",
          daily_reminders_description: "Receba lembretes para fazer check-in diariamente",
          progress_updates: "Atualizações de Progresso",
          progress_updates_description: "Resumo semanal do seu progresso",
          goal_reminders: "Lembretes de Objetivos",
          goal_reminders_description: "Notificações sobre prazos de objetivos",
          exercise_reminders: "Lembretes de Exercícios",
          exercise_reminders_description: "Horários sugeridos para exercícios CBT"
        },
        account: {
          title: "Conta",
          logout: "Sair"
        },
        footer: {
          need_help: "Precisa de ajuda?",
          contact_support: "Contatar Suporte",
          version: "MindCare CBT Therapist · Versão 1.0"
        }
      },
      common: {
        loading: "Carregando...",
        retry: "Tentar Novamente",
        cancel: "Cancelar",
        continue: "Continuar",
        return: "Voltar",
        close: "Fechar",
        dismiss: "Dispensar",
        complete: "Concluir",
        close_video_aria: "Fechar vídeo",
        video_not_supported: "Seu navegador não suporta a tag de vídeo.",
        audio_not_supported: "Seu navegador não suporta o elemento de áudio.",
        go_back_aria: "Voltar",
        go_back_home_aria: "Voltar para o início",
        ai_label: "IA",
        you_label: "Você",
        minutes_short: "min"
      },
      chat: {
        aria: {
          go_back_home: "Voltar para o início",
          open_conversations: "Abrir barra lateral de conversas",
          close_conversations: "Fechar barra lateral de conversas"
        },
        therapist_title: "Seu Terapeuta",
        therapist_subtitle: "Um espaço seguro para conversar",
        welcome: {
          title: "Bem-vindo à Terapia",
          message: "Este é um espaço seguro e sem julgamentos. Compartilhe o que está em sua mente e vamos trabalhar juntos.",
          start_session: "Iniciar Sua Primeira Sessão"
        },
        thinking_placeholder: "Pensando...",
        summary_prompt: {
          title: "Gostaria de um resumo da sessão?",
          description: "Obtenha conclusões-chave, exercícios recomendados e recursos úteis",
          yes: "Sim, criar resumo",
          not_now: "Agora não"
        },
        input_placeholder: "Compartilhe o que está em sua mente...",
        disclaimer: {
          title: "⚠️ Suporte IA - Não é Terapia Profissional",
          message: "Não pode diagnosticar nem prescrever. Crise? Ligue 988 (EUA) ou seus serviços de emergência locais.",
          strict: "Lembrete: Esta IA não pode diagnosticar condições nem prescrever tratamentos. Para preocupações médicas, consulte um profissional licenciado.",
          standard: "Lembrete: Este é suporte assistido por IA, não terapia profissional. Situações de emergência requerem ajuda profissional imediata."
        },
        delete_session_failed: "Falha ao excluir a sessão. Por favor, tente novamente.",
        confirm_delete_session: "Excluir esta sessão? Esta ação não pode ser desfeita.",
        daily_checkin_message: "Concluí meu Check-in Diário.",
        consent: {
          lenient: {
            title: "Suporte de Bem-estar IA - Modo Permissivo",
            message: "Esta IA fornece conversação de apoio com interrupções mínimas. Ela não pode diagnosticar, prescrever ou substituir cuidados profissionais. Situações de crise requerem ajuda profissional imediata."
          },
          standard: {
            title: "Suporte de Bem-estar IA - Modo Padrão",
            message: "Esta IA fornece suporte de bem-estar usando princípios CBT baseados em evidências. Não é um substituto para cuidados de saúde mental profissionais e não pode diagnosticar nem prescrever. Em crise, entre em contato com serviços de emergência imediatamente."
          },
          strict: {
            title: "Suporte de Bem-estar IA - Modo de Segurança Rigoroso",
            message: "Este modo inclui monitoramento de segurança aprimorado e lembretes frequentes. A IA não pode diagnosticar, prescrever ou lidar com emergências. Cuidados de saúde mental profissionais são necessários para preocupações clínicas."
          },
          learn_more: "Saiba mais sobre perfis de segurança",
          understand_button: "Entendi"
        },
        risk_panel: {
          title: "Estamos Aqui para Ajudar",
          message: "Esta IA não pode fornecer suporte de emergência. Se você estiver em crise, entre em contato com um profissional imediatamente.",
          crisis_hotline_label: "Linha Direta de Crise:",
          crisis_hotline_number: "988 (EUA)",
          crisis_text_line_label: "Linha de Texto de Crise:",
          crisis_text_line_number: "Envie \"HELLO\" para 741741",
          emergency_label: "Emergência:",
          emergency_number: "911",
          return_to_chat: "Voltar ao Chat"
        },
        conversations_list: {
          title: "Sessões",
          empty_title: "Ainda não há sessões",
          empty_message: "Inicie uma conversa para começar",
          session_prefix: "Sessão",
          delete_aria: "Excluir sessão"
        },
        session_summary: {
          title: "Resumo da Sessão",
          key_takeaways: "Conclusões-Chave",
          recommended_exercises: "Exercícios Recomendados",
          helpful_resources: "Recursos Úteis",
          reflect_button: "Refletir no Diário",
          view_exercises_button: "Ver Todos os Exercícios"
        }
      },
      age_gate: {
        title: "Verificação de Idade Necessária",
        message: "Nossos recursos de terapia com IA são projetados para adultos de 18 anos ou mais. Isso nos ajuda a fornecer suporte apropriado e manter padrões de segurança.",
        teen_support_heading: "Se você tem menos de 18 anos e precisa de apoio:",
        teen_support: {
          counselor: "• Conselheiro escolar ou adulto de confiança",
          teen_line: "• Teen Line: 1-800-852-8336 (ou envie TEEN para 839863)",
          crisis_text_line: "• Linha de Texto de Crise: Envie \"HOME\" para 741741"
        },
        confirm_button: "Tenho 18 ou Mais",
        decline_button: "Tenho Menos de 18"
      },
      age_restricted: {
        title: "Restrito por Idade",
        message: "Nossos recursos de chat alimentados por IA são projetados para usuários de 18 anos ou mais. Você ainda tem acesso a outras ferramentas de bem-estar como rastreamento de humor, diário e exercícios.",
        back_to_home: "Voltar para o Início"
      },
      journeys: {
        page_title: "Jornadas",
        page_subtitle: "Caminhos guiados de desenvolvimento de habilidades para crescimento pessoal",
        tabs: {
          available: "Disponível",
          in_progress: "Em Andamento",
          completed: "Concluído"
        },
        empty_state: {
          no_available: "Nenhuma jornada disponível no momento",
          no_in_progress: "Você ainda não iniciou nenhuma jornada",
          no_completed: "Você ainda não concluiu nenhuma jornada"
        },
        card: {
          days: "dias",
          steps: "passos",
          progress: "Progresso",
          start_journey: "Iniciar Jornada",
          view_details: "Ver Detalhes"
        },
        detail: {
          what_youll_gain: "O que você vai ganhar:",
          journey_steps: "Passos da Jornada",
          day: "Dia",
          play_game: "Jogar",
          reflection_placeholder: "Sua reflexão (opcional)",
          saving: "Salvando...",
          mark_complete: "Marcar como Completo"
        }
      },
      mood_tracker: {
        page_title: "Rastreador de Humor",
        page_subtitle: "Acompanhe seu bem-estar emocional e descubra padrões",
        update_today: "Atualizar Hoje",
        log_mood: "Registrar Humor",
        mood_trends: "Tendências de Humor",
        loading_chart: "Carregando gráfico...",
        no_data: "Ainda sem dados de humor",
        no_data_subtitle: "Comece a fazer check-in diariamente para ver tendências",
        tabs: {
          overview: "Visão Geral",
          calendar: "Calendário",
          insights: "Insights IA"
        },
        time_range: {
          "7_days": "7 dias",
          "14_days": "14 dias",
          "30_days": "30 dias"
        },
        form: {
          title: "Como você está se sentindo hoje?",
          close_aria: "Fechar formulário de registro de humor",
          date: "Data",
          overall_mood: "Humor Geral",
          mood_excellent: "Excelente",
          mood_good: "Bom",
          mood_okay: "Ok",
          mood_low: "Baixo",
          mood_very_low: "Muito Baixo",
          emotions_question: "Quais emoções você está sentindo?",
          intensity_label: "Intensidade Emocional",
          mild: "Leve",
          intense: "Intenso",
          energy_level: "Nível de Energia",
          energy_very_low: "Muito Baixo",
          energy_low: "Baixo",
          energy_moderate: "Moderado",
          energy_high: "Alto",
          energy_very_high: "Muito Alto",
          sleep_quality: "Qualidade do Sono",
          sleep_poor: "Ruim",
          sleep_fair: "Regular",
          sleep_good: "Boa",
          sleep_excellent: "Excelente",
          stress_level: "Nível de Estresse",
          relaxed: "Relaxado",
          very_stressed: "Muito Estressado",
          triggers_question: "O que desencadeou seu humor hoje?",
          activities_question: "O que você fez hoje?",
          notes_label: "Notas Adicionais",
          notes_placeholder: "Outros pensamentos ou observações sobre seu dia...",
          save_error: "Não foi possível salvar. Verifique a conexão e tente novamente.",
          saving: "Salvando...",
          save_entry: "Salvar Entrada",
          update_entry: "Atualizar Entrada"
        }
      },
      progress: {
        page_title: "Seu Progresso",
        page_subtitle: "Acompanhe sua jornada",
        page_subtitle_full: "Acompanhe sua jornada e celebre seu crescimento",
        health_wellness: "Saúde e Bem-estar",
        tabs: {
          overview: "Visão Geral",
          achievements: "Conquistas",
          rewards: "Recompensas",
          mood: "Humor",
          goals: "Objetivos",
          exercises: "Exercícios",
          health: "Saúde"
        },
        dashboard: {
          current_streak: "Sequência Atual",
          days: "dias",
          points: "Pontos",
          badges: "Emblemas",
          level: "Nível",
          level_prefix: "Nv.",
          avg_mood: "Humor Médio",
          trend_improving: "melhorando",
          trend_declining: "declinando",
          trend_stable: "estável",
          goals_achieved: "Objetivos Alcançados",
          active: "ativo",
          charts: {
            mood_trends: "Tendências de Humor (Últimos 30 Dias)",
            exercise_by_category: "Exercícios por Categoria",
            journal_consistency: "Consistência do Diário",
            goal_progress: "Progresso de Objetivos"
          }
        }
      },
      mind_games: {
        page_title: "Jogos Mentais",
        page_subtitle: "Prática interativa de habilidades CBT e DBT",
        go_back_aria: "Voltar",
        close_aria: "Fechar",
        recommended_title: "Recomendado para Você",
        recommended_subtitle: "Com base na sua atividade, achamos que você vai gostar destes:",
        thought_quiz: {
          score: "Pontuação",
          next_question: "Próxima Pergunta"
        },
        games: {
          thought_quiz: { title: "Quiz de Pensamentos", description: "Identifique a armadilha do pensamento em um exemplo rápido." },
          reframe_pick: { title: "Escolha de Reenquadramento", description: "Escolha o pensamento alternativo mais equilibrado." },
          value_compass: { title: "Bússola de Valores", description: "Escolha um valor, depois escolha uma pequena ação." },
          tiny_experiment: { title: "Pequeno Experimento", description: "Teste uma crença com um experimento de 2 minutos." },
          quick_win: { title: "Vitória Rápida", description: "Registre uma pequena vitória e crie impulso." },
          calm_bingo: { title: "Bingo Calmo", description: "Marque 2 casas para completar uma mini rodada." },
          dbt_stop: { title: "Habilidade STOP", description: "Pause, respire e escolha um próximo passo sábio." },
          opposite_action: { title: "Ação Oposta", description: "Alinhe ações a objetivos, não a humores." },
          urge_surfing: { title: "Surfar no Impulso", description: "Monte um impulso como uma onda por 60 segundos." },
          worry_time: { title: "Tempo de Preocupação", description: "Estacione preocupações agora, agende-as mais tarde." },
          evidence_balance: { title: "Balanço de Evidências", description: "Pese evidências e encontre uma conclusão justa." },
          defusion_cards: { title: "Cartas de Defusão", description: "Desvincule-se de pensamentos de forma lúdica." },
          tipp_skills: { title: "Habilidades TIPP", description: "Mude a química corporal rapidamente para reduzir intensidade." },
          accepts: { title: "ACCEPTS", description: "Distraia-se de emoções avassaladoras eficazmente." },
          willing_hands: { title: "Mãos Dispostas", description: "Prática de aceitação baseada no corpo." },
          half_smile: { title: "Meio Sorriso", description: "Mude emoções através de expressão facial gentil." },
          improve: { title: "IMPROVE", description: "Melhore o momento na crise." },
          leaves_on_stream: { title: "Folhas no Riacho", description: "Observe pensamentos flutuar sem agarrá-los." },
          expansion: { title: "Expansão", description: "Crie espaço para emoções difíceis." },
          values_check: { title: "Verificação de Valores", description: "Verificação rápida de alinhamento com seus valores." },
          pros_and_cons: { title: "Prós e Contras", description: "Tomada de decisão sábia em crise." },
          check_the_facts: { title: "Verificar os Fatos", description: "Sua emoção se encaixa na situação?" },
          self_soothe: { title: "Auto-Acalmar 5 Sentidos", description: "Conforte-se com experiências sensoriais." },
          mountain_meditation: { title: "Meditação da Montanha", description: "Incorpore estabilidade e enraizamento." }
        },
        content: {
          thought_quiz: {
            items: [
              { prompt: "If I don't do this perfectly, I'm a total failure.", options: ["All-or-nothing thinking", "Mind reading", "Catastrophizing", "Discounting the positive"], explanation: "This treats performance as a strict pass/fail label instead of a spectrum." },
              { prompt: "They haven't replied yet, so they must be upset with me.", options: ["Emotional reasoning", "Mind reading", "Labeling", "Overgeneralization"], explanation: "You're assuming you know what they think without clear evidence." },
              { prompt: "If I make one mistake, everything will fall apart.", options: ["Catastrophizing", "Personalization", "Should statements", "Mental filter"], explanation: "This jumps to the worst-case outcome and treats it as likely." },
              { prompt: "I had an awkward moment today. I always mess things up.", options: ["Overgeneralization", "Mind reading", "Fortune telling", "Disqualifying the positive"], explanation: "One moment gets turned into a sweeping rule about your whole life." },
              { prompt: "I feel anxious, so something bad must be about to happen.", options: ["Emotional reasoning", "Should statements", "Labeling", "Black-and-white thinking"], explanation: "Feelings are treated like facts, even when they're just signals." },
              { prompt: "My friend sounded quiet. It's probably my fault.", options: ["Personalization", "Catastrophizing", "Fortune telling", "Magnification"], explanation: "You're taking responsibility for something that may have many causes." },
              { prompt: "I should be more productive all the time.", options: ["Should statements", "Mental filter", "Mind reading", "Overgeneralization"], explanation: "Rigid rules ('should') create pressure and ignore real human limits." },
              { prompt: "One person criticized me, so I'm probably not good at this.", options: ["Labeling", "Disqualifying the positive", "Magnification", "All-or-nothing thinking"], explanation: "A single critique gets blown up and outweighs the full picture." },
              { prompt: "I did well, but it doesn't count because it was easy.", options: ["Discounting the positive", "Fortune telling", "Personalization", "Catastrophizing"], explanation: "You're dismissing real effort and progress instead of acknowledging it." },
              { prompt: "Everyone noticed my mistake. They must think I'm incompetent.", options: ["Mind reading", "Mental filter", "Emotional reasoning", "Should statements"], explanation: "You're guessing others' judgments without checking the evidence." },
              { prompt: "If I try and it's uncomfortable, that means it's wrong for me.", options: ["Emotional reasoning", "Overgeneralization", "Labeling", "Disqualifying the positive"], explanation: "Discomfort can be part of growth; it doesn't automatically mean danger." },
              { prompt: "I didn't meet my goal today, so I'm never going to change.", options: ["Fortune telling", "Catastrophizing", "Overgeneralization", "All-or-nothing thinking"], explanation: "A single day becomes a permanent prediction, ignoring gradual progress." }
            ],
            advanced: [
              { prompt: "I received constructive feedback, but all I can think about is the one negative comment buried in it.", options: ["Mental filter", "Overgeneralization", "Personalization", "Emotional reasoning"], explanation: "You're filtering out the positive and focusing only on the negative detail." },
              { prompt: "If I set boundaries, people will see me as selfish and abandon me.", options: ["Fortune telling + labeling", "Mind reading + catastrophizing", "Should statements", "Emotional reasoning"], explanation: "This combines mind reading (knowing what they'll think) with catastrophizing (predicting abandonment)." },
              { prompt: "I didn't get the promotion, which proves I'm not competent enough, and I never will be.", options: ["Fortune telling + labeling", "All-or-nothing thinking", "Discounting the positive", "Personalization"], explanation: "This creates a fixed label and predicts a permanent future based on one event." },
              { prompt: "My colleague was curt with me today. I must have done something to upset them, and now the whole team probably thinks poorly of me.", options: ["Personalization + magnification + mind reading", "Catastrophizing + overgeneralization", "Mental filter + should statements", "Emotional reasoning"], explanation: "This combines taking personal blame, blowing up the impact, and assuming you know what others think." },
              { prompt: "I feel uncertain about this decision, which means I'm making the wrong choice.", options: ["Emotional reasoning", "Fortune telling", "All-or-nothing thinking", "Catastrophizing"], explanation: "The feeling of uncertainty is treated as evidence of a bad decision, not just a normal part of choosing." }
            ]
          },
          reframe_pick: {
            items: [
              { situation: "You sent a message and haven't heard back.", automatic_thought: "They're ignoring me because I said something wrong.", choices: ["They're busy. I can wait or follow up later in a calm way.", "They definitely hate me now and I ruined everything.", "I'll never message anyone again so I don't risk feeling this."], why: "It considers multiple possibilities and suggests a reasonable next step." },
              { situation: "You made a small mistake at work/school.", automatic_thought: "I'm terrible at this.", choices: ["One mistake is normal. I can fix it and learn for next time.", "I'm the worst person here. I should quit immediately.", "I'll pretend it didn't happen and avoid anything challenging."], why: "It's specific, realistic, and focused on learning rather than global labels." },
              { situation: "A friend was quiet during your hangout.", automatic_thought: "They must be annoyed with me.", choices: ["I don't know the reason. I can check in kindly or give space.", "It's my fault. I always ruin friendships.", "I should cut them off before they reject me first."], why: "It avoids mind reading and leaves room for a gentle check-in." },
              { situation: "You didn't finish a task you planned.", automatic_thought: "I'm so lazy.", choices: ["I struggled today. I can pick one small next step and restart.", "I'm hopeless. I'll never be consistent at anything.", "I should punish myself until I finally get disciplined."], why: "It acknowledges difficulty and moves toward a doable, compassionate action." },
              { situation: "You feel anxious before an event.", automatic_thought: "This anxiety means the event will go badly.", choices: ["Anxiety is a feeling, not a prediction. I can go anyway and cope.", "Anxiety means danger. I must avoid this at all costs.", "I need to feel zero anxiety before I'm allowed to show up."], why: "It separates feelings from forecasts and supports valued action." },
              { situation: "Someone gave you feedback.", automatic_thought: "I'm not good enough.", choices: ["Feedback can help me improve. I can take what's useful and grow.", "They think I'm incompetent and everyone agrees with them.", "I'll stop trying so no one can judge me again."], why: "It keeps self-worth intact while allowing improvement." },
              { situation: "You didn't get invited to something.", automatic_thought: "Nobody likes me.", choices: ["There could be many reasons. I can reach out or plan something else.", "This proves I'm unlikable and always will be.", "I'll isolate so I don't have to feel left out again."], why: "It avoids overgeneralization and offers flexible, constructive options." },
              { situation: "You're learning a new skill and feel behind.", automatic_thought: "If I'm not fast, I'm not meant for this.", choices: ["Skills grow with practice. I can improve step by step.", "If I'm not immediately great, it's a waste of time.", "I should compare myself nonstop to prove I'm failing."], why: "It supports growth mindset and realistic learning curves." }
            ]
          },
          value_compass: {
            values: [
              { value: "Family", actions: ["Send a kind message to a family member.", "Do one small helpful thing at home.", "Plan 10 minutes of quality time today."] },
              { value: "Health", actions: ["Drink a glass of water right now.", "Take a 2-minute stretch break.", "Step outside for fresh air for 3 minutes."] },
              { value: "Growth", actions: ["Learn one tiny thing (watch/read for 2 minutes).", "Practice a skill for 3 minutes.", "Write one sentence about what you want to improve."] },
              { value: "Friendship", actions: ["Check in with a friend with a simple hello.", "Reply to a message you've been postponing.", "Share one genuine compliment today."] },
              { value: "Courage", actions: ["Do the smallest version of the scary step (10%).", "Name what you fear in one sentence, then proceed anyway.", "Ask one small question instead of assuming."] },
              { value: "Calm", actions: ["Take 5 slow breaths (count 4 in / 4 out).", "Relax your shoulders and jaw for 20 seconds.", "Put your phone down for 2 minutes and reset."] },
              { value: "Creativity", actions: ["Write a silly 1-line idea (no judgment).", "Take a photo of something interesting around you.", "Doodle for 60 seconds."] },
              { value: "Purpose", actions: ["Choose one task that matters and do 2 minutes of it.", "Write your 'why' in 1 sentence.", "Remove one small obstacle from your path today."] }
            ]
          },
          tiny_experiment: {
            items: [
              { belief: "If I ask for help, people will think I'm weak.", experiments: ["Ask one small, specific question and observe the response.", "Ask a trusted person for a tiny favor and note what happens.", "Ask for clarification once instead of guessing."], reflection_question: "What happened?", reflection_options: ["It went better than I feared.", "It was neutral / fine.", "It was uncomfortable, but I handled it."] },
              { belief: "If I say no, people will dislike me.", experiments: ["Say no to a low-stakes request using one polite sentence.", "Offer an alternative (not now / later) instead of automatic yes.", "Pause for 5 seconds before agreeing to anything."], reflection_question: "What did you notice?", reflection_options: ["People respected it.", "Nothing dramatic happened.", "It felt hard, and I survived it."] },
              { belief: "If I make a mistake, it will be a disaster.", experiments: ["Do a small task imperfectly on purpose (10%) and observe outcomes.", "Share a minor correction without apologizing excessively.", "Let one tiny typo exist and see what actually happens."], reflection_question: "What was the outcome?", reflection_options: ["No one cared.", "It was fixable.", "It felt big in my head, smaller in reality."] },
              { belief: "If I don't feel motivated, I can't start.", experiments: ["Start for 2 minutes only, then reassess.", "Set a timer for 90 seconds and do the first step.", "Make the task 10x smaller and begin."], reflection_question: "After starting, how was it?", reflection_options: ["Easier than expected.", "Still hard, but possible.", "I gained a little momentum."] },
              { belief: "If someone is quiet, it must be about me.", experiments: ["Write 3 alternative explanations before reacting.", "Ask a simple check-in question instead of assuming.", "Wait 30 minutes and see if new info appears."], reflection_question: "What did you learn?", reflection_options: ["I didn't have enough evidence.", "There were other explanations.", "Checking in was helpful."] },
              { belief: "I have to do everything right to be accepted.", experiments: ["Share one imperfect draft and request feedback.", "Do one task at 'good enough' level and stop.", "Let someone else choose one detail instead of controlling it."], reflection_question: "How did it go?", reflection_options: ["Good enough worked.", "Acceptance didn't depend on perfection.", "I felt discomfort, and it passed."] },
              { belief: "If I feel anxious, I shouldn't go.", experiments: ["Go for 5 minutes only and reassess.", "Bring one coping tool (water / music / breathing).", "Rate anxiety 0–10 before and after to compare."], reflection_question: "What did you notice?", reflection_options: ["Anxiety changed over time.", "I could function with anxiety present.", "Avoidance wasn't necessary."] },
              { belief: "If I rest, I'm wasting time.", experiments: ["Take a 3-minute break and then return to one small task.", "Rest first, then do 2 minutes of the priority task.", "Track: does a short break help focus?"], reflection_question: "Result?", reflection_options: ["Rest helped me reset.", "No harm done.", "I returned with a bit more clarity."] },
              { belief: "If I don't get it quickly, I'm not capable.", experiments: ["Practice for 3 minutes daily for 3 days and compare.", "Ask one question and notice improvement.", "Write one thing you learned today, even if small."], reflection_question: "What changed?", reflection_options: ["Progress showed up gradually.", "Learning took repetition.", "I was harsher than necessary."] },
              { belief: "I need to feel confident before I act.", experiments: ["Act with 'small courage' for 2 minutes anyway.", "Do the first step while confidence is low.", "Rate confidence after action (not before)."], reflection_question: "After action, how was your confidence?", reflection_options: ["A bit higher.", "About the same, but I did it.", "I learned I can move without perfect confidence."] }
            ]
          },
          quick_win: {
            presets: ["I drank water.", "I took a 2-minute break.", "I sent one message I was avoiding.", "I cleaned one tiny area.", "I did one small task for 2 minutes.", "I took 5 slow breaths.", "I stepped outside for fresh air.", "I asked a question instead of assuming.", "I showed up even though it was uncomfortable.", "I wrote one helpful sentence to myself.", "I stretched my shoulders/neck.", "I ate something nourishing.", "I paused before reacting.", "I said no (or not now) politely.", "I made a small plan for tomorrow.", "I finished a mini-step.", "I noticed a thinking trap and named it.", "I chose 'good enough' and stopped.", "I did something kind for someone.", "I did something kind for myself."]
          },
          calm_bingo: {
            tiles: ["Drink a glass of water", "5 slow breaths", "Relax shoulders + jaw", "Look out a window for 30s", "Stand up and stretch", "Send a kind text", "Tidy one small thing", "Step outside for 2 minutes", "Name 3 things you can see", "Play one calm song", "Write 1 supportive sentence", "Wash your hands slowly", "Move your body for 60s", "Put phone down for 2 minutes", "Smile gently (even 10%)", "Choose one tiny next step"]
          },
          dbt_stop: {
            prompts: [
              { trigger: "You feel a strong urge to react immediately.", steps: [{ key: "S", label: "Stop", text: "Pause. Don't act yet." }, { key: "T", label: "Take a step back", text: "Breathe once. Create a tiny space." }, { key: "O", label: "Observe", text: "Notice: thoughts, feelings, body signals." }, { key: "P", label: "Proceed mindfully", text: "Choose one wise next step." }], next_steps: ["Send a calm, short reply (or wait 10 minutes).", "Ask one clarifying question.", "Do one small grounding action, then decide."] },
              { trigger: "You're about to avoid something important.", steps: [{ key: "S", label: "Stop", text: "Pause avoidance for a moment." }, { key: "T", label: "Take a step back", text: "Exhale slowly and reset posture." }, { key: "O", label: "Observe", text: "What are you afraid will happen?" }, { key: "P", label: "Proceed mindfully", text: "Pick the smallest brave step (10%)." }], next_steps: ["Do 2 minutes of the first step only.", "Make it easier: reduce scope by 50%.", "Text someone: 'I'm starting now—wish me luck.'"] },
              { trigger: "You feel criticized and want to defend yourself fast.", steps: [{ key: "S", label: "Stop", text: "Hold back the instant response." }, { key: "T", label: "Take a step back", text: "Breathe and relax your jaw." }, { key: "O", label: "Observe", text: "What's the goal: to win or to repair?" }, { key: "P", label: "Proceed mindfully", text: "Respond to the goal, not the heat." }], next_steps: ["Say: 'Let me think about that for a moment.'", "Reflect back what you heard in one sentence.", "Ask: 'What would be most helpful right now?'"] },
              { trigger: "You're scrolling/doomscrolling and feel stuck.", steps: [{ key: "S", label: "Stop", text: "Pause scrolling now." }, { key: "T", label: "Take a step back", text: "Put phone down for one breath." }, { key: "O", label: "Observe", text: "Name the feeling in one word." }, { key: "P", label: "Proceed mindfully", text: "Choose one small helpful action." }], next_steps: ["Drink water and stretch for 30 seconds.", "Open a window or step outside for 1 minute.", "Write one tiny next step and do it."] }
            ]
          },
          opposite_action: {
            items: [
              { emotion: "Anxiety", urge: "Avoid / escape", opposite: "Approach gently", choices: ["Show up for 5 minutes, then reassess.", "Do the smallest first step (10%).", "Ask one question instead of avoiding."], note: "Opposite action is for emotions that don't fit the facts or are too intense." },
              { emotion: "Sadness", urge: "Withdraw / isolate", opposite: "Connect or activate", choices: ["Send one simple 'hey' message.", "Step outside for 2 minutes.", "Do a tiny task to build momentum."], note: "Small activation often shifts mood more than waiting for motivation." },
              { emotion: "Anger", urge: "Attack / argue", opposite: "Be gentle and effective", choices: ["Lower voice + slow down your words.", "State one need clearly without blame.", "Take a 2-minute pause before replying."], note: "Opposite action aims for effectiveness, not 'winning.'" },
              { emotion: "Shame", urge: "Hide / disappear", opposite: "Small reveal + self-respect", choices: ["Share a tiny truth with a safe person.", "Stand tall, breathe, and stay present for 30s.", "Do one value-based action anyway."], note: "Shame shrinks with safe connection and self-respect actions." },
              { emotion: "Guilt (too much)", urge: "Over-apologize / self-punish", opposite: "Repair effectively", choices: ["Apologize once, then propose one repair step.", "Ask what would help and listen.", "Stop repeating apologies; act instead."], note: "Effective repair beats endless self-blame." },
              { emotion: "Fear of rejection", urge: "People-please / over-text", opposite: "Balanced boundary", choices: ["Send one message, then wait.", "Do one self-caring action while you wait.", "Remind yourself: 'I can handle uncertainty.'"], note: "Opposite action builds tolerance for uncertainty." }
            ]
          },
          urge_surfing: {
            beginner: [
              { title: "Ride the wave (60 seconds)", steps: ["Name the urge: 'I'm having the urge to ____.'", "Rate intensity 0–10.", "Notice where it lives in the body.", "Breathe slowly for 5 breaths.", "Rate intensity again. (Urges rise and fall.)"], finish_choices: ["Delay 10 minutes (set a timer).", "Do a 2-minute replacement action.", "Ask for support (one message)."] },
              { title: "Surf + redirect", steps: ["Name the urge without judging it.", "Imagine it as a wave—rising, cresting, passing.", "Relax shoulders and jaw.", "Pick one value-based micro-action."], finish_choices: ["Take 10% of a helpful step.", "Move your body for 60 seconds.", "Drink water + reset posture."] }
            ],
            advanced: [
              { title: "Surf independently (90 seconds)", steps: ["Name and rate the urge (0-10).", "Locate it in your body.", "Breathe with it for 10 breaths.", "Notice the peak and decline.", "Rate it again."], finish_choices: ["Delay 20 minutes and reassess.", "Do the opposite action for 5 minutes.", "Journal about what you noticed."] },
              { title: "Surf + value-based action", steps: ["Acknowledge the urge without judgment.", "Watch it like a scientist observing data.", "Let it peak naturally.", "Choose one value-aligned micro-step."], finish_choices: ["Do the tiny step immediately.", "Practice the skill again in 1 hour.", "Note what worked for next time."] }
            ]
          },
          worry_time: {
            items: [
              { worry: "What if I mess up tomorrow?", park_it: "I'll think about this during Worry Time at 6:00 PM for 10 minutes.", tiny_now: ["Write one small preparation step.", "Do 2 minutes of that step now.", "Then return to the present task."] },
              { worry: "What if they're mad at me?", park_it: "I'll revisit this at 7:00 PM for 10 minutes, then decide on a calm follow-up.", tiny_now: ["List 2 alternative explanations.", "Wait 30 minutes before acting.", "Do one calming reset (5 breaths)."] },
              { worry: "What if something bad happens?", park_it: "I'll schedule Worry Time at 5:30 PM for 10 minutes and focus on what's controllable.", tiny_now: ["Name 1 thing you can control today.", "Do the smallest step toward it.", "Return attention to the room."] },
              { worry: "I'm behind; I'll never catch up.", park_it: "I'll worry about this at 6:30 PM for 10 minutes and make a realistic plan.", tiny_now: ["Pick the single next step.", "Work 2 minutes on it.", "Stop and acknowledge progress."] },
              { worry: "What if I disappoint people?", park_it: "I'll revisit this at 8:00 PM for 10 minutes and choose a value-based action.", tiny_now: ["Ask: 'What matters to me here?'", "Choose one respectful sentence/boundary.", "Delay responding for 10 minutes."] },
              { worry: "What if I can't handle it?", park_it: "I'll schedule Worry Time at 7:30 PM for 10 minutes and review coping options.", tiny_now: ["Write 1 coping tool you already use.", "Use it for 60 seconds.", "Continue with the next small task."] }
            ]
          },
          evidence_balance: {
            items: [
              { thought: "I always mess things up.", evidence_for: ["I made a mistake recently.", "I remember failures more than successes."], evidence_against: ["I've done many things well.", "One mistake doesn't define 'always'."], balanced_conclusion: "I've made mistakes and also succeeded. I can learn and improve." },
              { thought: "They don't like me.", evidence_for: ["They replied late once.", "They were quiet last time."], evidence_against: ["They've been friendly before.", "There are many reasons for silence."], balanced_conclusion: "I don't know their thoughts. I can check in calmly or wait for more info." },
              { thought: "If I'm anxious, I can't cope.", evidence_for: ["Anxiety feels intense.", "I want to escape when anxious."], evidence_against: ["I've coped with anxiety before.", "Anxiety rises and falls."], balanced_conclusion: "Anxiety is uncomfortable but manageable. I can act while it's present." },
              { thought: "I'm not improving.", evidence_for: ["Progress feels slow.", "I compare myself to others."], evidence_against: ["I've taken small steps.", "Learning is gradual."], balanced_conclusion: "Progress can be slow and real. Small steps still count." },
              { thought: "I must do everything perfectly.", evidence_for: ["I value quality.", "Perfection sometimes prevents criticism."], evidence_against: ["Perfect isn't required to succeed.", "Good-enough frees time and reduces stress."], balanced_conclusion: "I can aim for quality while allowing 'good enough' when it's effective." },
              { thought: "If I say no, I'll be rejected.", evidence_for: ["I worry about disappointing people.", "I've had conflict before."], evidence_against: ["Many people respect boundaries.", "I can say no politely and offer alternatives."], balanced_conclusion: "Saying no respectfully protects relationships and my wellbeing." }
            ]
          },
          defusion_cards: {
            cards: [
              { thought: "I'm not good enough.", defuse_lines: ["I'm having the thought that I'm not good enough.", "Thanks, mind. Interesting story.", "This is a thought, not a fact."] },
              { thought: "Something bad will happen.", defuse_lines: ["I'm noticing a 'danger prediction' thought.", "My mind is trying to protect me.", "I can take one small step anyway."] },
              { thought: "They're judging me.", defuse_lines: ["I'm having the thought they're judging me.", "I can't read minds. I can act on my values.", "Let this thought ride in the back seat."] },
              { thought: "I can't handle this feeling.", defuse_lines: ["I'm noticing the thought 'I can't handle it'.", "Feelings are waves; they change.", "I can make room and keep going."] },
              { thought: "I must fix everything now.", defuse_lines: ["There's the 'urgent fixer' thought.", "I can pause and choose one wise next step.", "Slow is smooth; smooth is fast."] },
              { thought: "If it's hard, I should quit.", defuse_lines: ["I'm having the thought 'quit'.", "Hard can mean 'new', not 'wrong'.", "I can do the smallest version (10%)."] }
            ]
          },
          tipp_skills: {
            situation: "Your emotions are at 8/10 or higher and you need to come down fast.",
            skills: [
              { letter: "T", name: "Temperature", description: "Cold water on face, ice cube, cold shower" },
              { letter: "I", name: "Intense exercise", description: "Run, jump, push-ups for 60 seconds" },
              { letter: "P", name: "Paced breathing", description: "Breathe out longer than in (4 in / 6 out)" },
              { letter: "P", name: "Paired muscle relaxation", description: "Tense then release muscle groups" }
            ],
            actions: ["Splash cold water on your face for 30 seconds.", "Do 20 jumping jacks right now.", "Breathe: 4 in, hold 4, 6 out—repeat 5 times."]
          },
          accepts: {
            items: [
              { letter: "A", name: "Activities", description: "Do something engaging", action: "Watch a 5-minute video, play a quick game, or clean one surface." },
              { letter: "C", name: "Contributing", description: "Help someone else", action: "Send a kind message, do one helpful thing, or share something useful." },
              { letter: "C", name: "Comparisons", description: "Compare to when you coped before", action: "Remember: You've survived 100% of your worst days so far." },
              { letter: "E", name: "Emotions", description: "Create a different emotion", action: "Watch something funny, listen to upbeat music, or read something calming." },
              { letter: "P", name: "Pushing away", description: "Mentally put the situation aside", action: "Imagine putting the problem in a box on a shelf for later." },
              { letter: "T", name: "Thoughts", description: "Fill your mind with other thoughts", action: "Count backwards from 100 by 7s, list countries A-Z, or describe the room." },
              { letter: "S", name: "Sensations", description: "Create strong physical sensations", action: "Hold ice, take a hot/cold shower, or squeeze a stress ball hard." }
            ]
          },
          improve: {
            items: [
              { letter: "I", name: "Imagery", description: "Visualize a peaceful or safe place", quick_action: "Close your eyes. Picture a place you feel calm (real or imagined)." },
              { letter: "M", name: "Meaning", description: "Find purpose in the pain", quick_action: "Ask: What can I learn? How might this help me grow?" },
              { letter: "P", name: "Prayer", description: "Connect to something larger", quick_action: "Say a phrase that grounds you or ask for support from your values/beliefs." },
              { letter: "R", name: "Relaxation", description: "Relax your body", quick_action: "Tense and release: shoulders, jaw, hands. Breathe slowly." },
              { letter: "O", name: "One thing in the moment", description: "Focus fully on one small task", quick_action: "Pick one action: wash a dish, water a plant, fold one item." },
              { letter: "V", name: "Vacation", description: "Take a brief mental break", quick_action: "Give yourself 10 minutes off from the problem. Set a timer." },
              { letter: "E", name: "Encouragement", description: "Be your own cheerleader", quick_action: "Say: 'I can handle this. I've done hard things before.'" }
            ]
          },
          self_soothe: {
            senses: [
              { sense: "Vision", actions: ["Look at nature or a calming image.", "Watch clouds or water move.", "Light a candle and watch the flame."] },
              { sense: "Hearing", actions: ["Listen to calming music or nature sounds.", "Play a song that makes you feel safe.", "Listen to the sound of rain or wind."] },
              { sense: "Smell", actions: ["Smell something pleasant (lotion, coffee, flowers).", "Light a scented candle or incense.", "Take a deep breath of fresh air."] },
              { sense: "Taste", actions: ["Eat something you enjoy slowly.", "Savor a piece of chocolate or tea.", "Notice the flavors and textures."] },
              { sense: "Touch", actions: ["Hold something soft (blanket, pet).", "Take a warm shower or bath.", "Massage your hands with lotion."] }
            ]
          }
        }
      },
      exercises: {
        page_title: "Biblioteca de Exercícios",
        page_subtitle: "Pratique técnicas CBT",
        page_subtitle_full: "Navegue e pratique técnicas CBT baseadas em evidências",
        loading: "Carregando exercícios...",
        go_back_aria: "Voltar",
        ai_plan: "Plano de Prática IA",
        favorites: "Favoritos",
        search_placeholder: "Pesquisar exercícios...",
        empty_state: {
          favorites_title: "Ainda sem favoritos",
          no_results_title: "Nenhum exercício encontrado",
          favorites_message: "Marque exercícios como favoritos para vê-los aqui",
          search_message: "Tente ajustar sua pesquisa ou filtros",
          no_exercises_message: "Nenhum exercício disponível"
        },
        library: {
          flexible: "Flexível"
        },
        categories: {
          all: "Todos",
          breathing: "Respiração",
          grounding: "Aterramento",
          cognitive: "Cognitivo",
          behavioral: "Comportamental",
          mindfulness: "Atenção Plena",
          exposure: "Exposição",
          sleep: "Sono",
          relationships: "Relacionamentos",
          stress: "Gerenciamento de Estresse"
        },
        detail: {
          untitled_exercise: "Exercício sem Título",
          duration_options_suffix: "min opções",
          minutes_suffix: "minutos",
          video_label: "Vídeo",
          tabs: {
            overview: "Visão Geral",
            practice: "Prática",
            audio: "Áudio",
            benefits: "Benefícios",
            tips: "Dicas"
          },
          about: "Sobre Este Exercício",
          guided_visualization: "Visualização Guiada",
          video_demonstration: "Demonstração em Vídeo",
          helps_with: "Ajuda Com",
          guided_audio: "Áudio Guiado",
          guided_audio_description: "Acompanhe a orientação em áudio narrada profissionalmente para este exercício.",
          step_by_step_guide: "Guia Passo a Passo",
          step_duration: "Duração: {{seconds}} segundos",
          instructions: "Instruções",
          choose_duration: "Escolher Duração",
          key_benefits: "Principais Benefícios",
          default_benefits: "Este exercício ajuda a melhorar o bem-estar mental, reduzir o estresse e melhorar a regulação emocional.",
          helpful_tips: "Dicas Úteis",
          default_tips: "Pratique regularmente para melhores resultados. Encontre um espaço tranquilo, comece devagar e seja paciente consigo mesmo.",
          your_progress: "Seu Progresso",
          times_completed: "Vezes Concluído",
          minutes_practiced: "Minutos Praticados",
          last_practiced: "Última prática: {{date}}",
          completed_message: "Exercício Concluído!",
          mark_as_complete: "Marcar como Concluído"
        }
      }
    }
  }
};
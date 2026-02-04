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
      exercises: {
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
      exercises: {
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
        personalized_recommendations: "Recomendaciones Personalizadas"
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
        close_video_aria: "Cerrar video",
        video_unsupported: "Tu navegador no soporta la etiqueta de video.",
        go_back_aria: "Regresar",
        go_back_home_aria: "Regresar al inicio"
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
        personalized_recommendations: "Recommandations Personnalisées"
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
        close_video_aria: "Fermer la vidéo",
        video_unsupported: "Votre navigateur ne prend pas en charge la balise vidéo.",
        go_back_aria: "Retour",
        go_back_home_aria: "Retour à l'accueil"
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
        personalized_recommendations: "Personalisierte Empfehlungen"
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
        close_video_aria: "Video schließen",
        video_unsupported: "Ihr Browser unterstützt das Video-Tag nicht.",
        go_back_aria: "Zurück",
        go_back_home_aria: "Zurück zur Startseite"
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
        personalized_recommendations: "Raccomandazioni Personalizzate"
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
        close_video_aria: "Chiudi video",
        video_unsupported: "Il tuo browser non supporta il tag video.",
        go_back_aria: "Indietro",
        go_back_home_aria: "Torna alla home"
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
        personalized_recommendations: "Recomendações Personalizadas"
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
        close_video_aria: "Fechar vídeo",
        video_unsupported: "Seu navegador não suporta a tag de vídeo.",
        go_back_aria: "Voltar",
        go_back_home_aria: "Voltar para o início"
      }
    }
  }
};
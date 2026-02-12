{
  "global": {
    "app_name": "MindWell",
    "app_tagline": "אפליקציית בריאות נפש"
  },
  "common": {
    "loading": "טוען...",
    "retry": "נסה שוב",
    "close": "סגור",
    "cancel": "ביטול",
    "save": "שמור",
    "delete": "מחק",
    "edit": "ערוך",
    "back": "חזור",
    "next": "הבא",
    "continue": "המשך",
    "start": "התחל",
    "complete": "השלם",
    "view": "צפה",
    "search": "חיפוש",
    "filter": "סינון",
    "sort": "מיון"
  },
  "sidebar": {
    "home": {
      "name": "בית",
      "description": "לוח בקרה וסקירה"
    },
    "chat": {
      "name": "שיחה",
      "description": "מטפל AI"
    },
    "coach": {
      "name": "מאמן",
      "description": "מאמן בריאות AI"
    },
    "mood": {
      "name": "מצב רוח",
      "description": "עקוב אחר מצב הרוח"
    },
    "journal": {
      "name": "יומן",
      "description": "רישומי מחשבות"
    },
    "progress": {
      "name": "התקדמות",
      "description": "עקוב אחר המסע שלך"
    },
    "exercises": {
      "name": "תרגילים",
      "description": "טכניקות CBT"
    },
    "community": {
      "name": "קהילה"
    },
    "resources": {
      "name": "משאבים"
    },
    "settings": {
      "name": "הגדרות"
    }
  },
  "mobile_menu": {
    "menu_title": "תפריט",
    "open_aria": "פתח תפריט",
    "close_aria": "סגור תפריט"
  },
  "home": {
    "greeting": {
      "morning": "בוקר טוב",
      "afternoon": "אחר צהריים טובים",
      "evening": "ערב טוב"
    },
    "active_goals": "מטרות פעילות",
    "journal_entries": "רשומות יומן",
    "error": {
      "goals_load": "לא ניתן לטעון מטרות.",
      "journal_load": "לא ניתן לטעון רשומות יומן."
    }
  },
  "quick_actions": {
    "title": "פעולות מהירות",
    "recommended": {
      "title": "מומלץ עבורך",
      "description": "הצעות מותאמות AI"
    },
    "personalized_recommendations": "המלצות מותאמות אישית",
    "ai_therapist": {
      "title": "מטפל AI",
      "description": "שוחח עם המטפל שלך"
    },
    "journal_thought": {
      "title": "רשום מחשבה",
      "description": "אתגר חשיבה"
    },
    "set_goal": {
      "title": "הגדר מטרה",
      "description": "הגדר יעדים"
    },
    "mind_games": {
      "title": "משחקי מוח",
      "description": "תרגילים מנטליים מהירים"
    },
    "journeys": {
      "title": "מסעות",
      "description": "מסלולי מיומנות מתוכננים"
    },
    "exercises_library": {
      "title": "ספריית תרגילים",
      "description": "עיין בטכניקות"
    },
    "video_library": {
      "title": "ספריית וידאו",
      "description": "צפה ולמד"
    }
  },
  "mind_games": {
    "page_title": "משחקי מוח",
    "page_subtitle": "פעילויות מיקרו CBT/ACT/DBT מהירות ומשעשעות (30-120 שניות)",
    "go_back_aria": "חזור לבית",
    "close_aria": "סגור",
    "games": {
      "dbt_stop": {
        "title": "מיומנות STOP",
        "description": "עצור, נשום ובחר את הצעד החכם הבא."
      }
    },
    "content": {
      "dbt_stop": {
        "prompts": [
          {
            "trigger": "יש לך דחף חזק להגיב מיד.",
            "steps": [
              { "key": "S", "label": "עצור", "text": "עצור רגע. אל תפעל עדיין." },
              { "key": "T", "label": "קח צעד אחורה", "text": "קח נשימה אחת. צור מרווח קטן." },
              { "key": "O", "label": "התבונן", "text": "שים לב: מחשבות, רגשות, סימני גוף." },
              { "key": "P", "label": "המשך בתבונה", "text": "בחר צעד חכם אחד." }
            ],
            "next_steps": [
              "שלח תגובה קצרה ורגועה (או המתן 10 דקות).",
              "שאל שאלה מבהירה אחת.",
              "עשה פעולה קטנה של הארקה ואז החליט."
            ]
          },
          {
            "trigger": "את/ה עומד/ת להימנע ממשהו חשוב.",
            "steps": [
              { "key": "S", "label": "עצור", "text": "עצור את ההימנעות לרגע." },
              { "key": "T", "label": "קח צעד אחורה", "text": "נשוף לאט ואפס את היציבה." },
              { "key": "O", "label": "התבונן", "text": "ממה את/ה חושש/ת שיקרה?" },
              { "key": "P", "label": "המשך בתבונה", "text": "בחר את הצעד האמיץ והקטן ביותר (10%)." }
            ],
            "next_steps": [
              "עשה רק 2 דקות מהצעד הראשון.",
              "הפוך את זה לקל יותר: צמצם את ההיקף ב-50%.",
              "שלח הודעה למישהו: \"אני מתחיל עכשיו—אחלו לי בהצלחה.\""
            ]
          },
          {
            "trigger": "את/ה מרגיש/ה שמבקרים אותך ורוצה להגן על עצמך מיד.",
            "steps": [
              { "key": "S", "label": "עצור", "text": "עכב את התגובה המיידית." },
              { "key": "T", "label": "קח צעד אחורה", "text": "נשום והרפה את הלסת." },
              { "key": "O", "label": "התבונן", "text": "מה המטרה: לנצח או לתקן?" },
              { "key": "P", "label": "המשך בתבונה", "text": "הגב לפי המטרה, לא לפי הסערה." }
            ],
            "next_steps": [
              "אמור: \"תן לי רגע לחשוב על זה.\"",
              "חזור במשפט אחד על מה ששמעת.",
              "שאל: \"מה יהיה הכי מועיל עכשיו?\""
            ]
          },
          {
            "trigger": "את/ה גולל/ת בלי סוף ומרגיש/ה תקוע/ה.",
            "steps": [
              { "key": "S", "label": "עצור", "text": "עצור את הגלילה עכשיו." },
              { "key": "T", "label": "קח צעד אחורה", "text": "הנח את הטלפון לנשימה אחת." },
              { "key": "O", "label": "התבונן", "text": "תן שם לרגש במילה אחת." },
              { "key": "P", "label": "המשך בתבונה", "text": "בחר פעולה קטנה ומועילה אחת." }
            ],
            "next_steps": [
              "שתה מים והתמתח ל-30 שניות.",
              "פתח חלון או צא לדקה החוצה.",
              "כתוב צעד קטן אחד ואז בצע אותו."
            ]
          }
        ]
      }
    }
  },
  "exercises": {
    "page_title": "ספריית תרגילים",
    "page_subtitle": "תרגל טכניקות מבוססות ראיות",
    "page_subtitle_full": "תרגל טכניקות מבוססות ראיות לניהול מחשבות ורגשות",
    "loading": "טוען תרגילים...",
    "go_back_aria": "חזור לבית",
    "ai_plan": "תוכנית AI",
    "favorites": "מועדפים",
    "search_placeholder": "חפש תרגילים...",
    "categories": {
      "all": "הכל",
      "breathing": "נשימה",
      "grounding": "הארקה",
      "cognitive": "קוגניטיבי",
      "behavioral": "התנהגותי",
      "mindfulness": "מיינדפולנס",
      "exposure": "חשיפה",
      "sleep": "שינה",
      "relationships": "יחסים",
      "stress": "לחץ"
    },
    "empty_state": {
      "favorites_title": "אין עדיין תרגילים מועדפים",
      "favorites_message": "סמן תרגילים כמועדפים כדי לראות אותם כאן",
      "no_results_title": "לא נמצאו תרגילים",
      "search_message": "נסה להתאים את החיפוש או המסננים",
      "no_exercises_message": "תרגילים יתווספו בקרוב כדי לעזור בתרגול שלך."
    }
  },
  "journeys": {
    "page_title": "מסעות משחקי מוח",
    "page_subtitle": "עקוב אחר מסלולים מתוכננים המרכיבים משחקים לבניית מיומנויות ספציפיות לאורך זמן.",
    "tabs": {
      "available": "זמין",
      "in_progress": "בתהליך",
      "completed": "הושלם"
    },
    "empty_state": {
      "no_available": "אין מסעות זמינים. בדוק שוב בקרוב!",
      "no_in_progress": "אין מסעות בתהליך. התחל אחד מהלשונית 'זמין'!",
      "no_completed": "עדיין אין מסעות שהושלמו. המשך!"
    }
  },
  "community": {
    "page_title": "קהילה",
    "page_subtitle": "התחבר, שתף ותמוך במסעות של אחרים",
    "stats": {
      "forum_posts": "פוסטים בפורום",
      "active_groups": "קבוצות פעילות",
      "success_stories": "סיפורי הצלחה"
    },
    "tabs": {
      "forum": "פורום",
      "groups": "קבוצות",
      "progress": "סיפורי הצלחה"
    },
    "buttons": {
      "new_post": "פוסט חדש",
      "create_group": "צור קבוצה",
      "share_progress": "שתף התקדמות"
    },
    "search_placeholder": "חפש פוסטים...",
    "loading": {
      "posts": "טוען פוסטים...",
      "groups": "טוען קבוצות..."
    },
    "empty_state": {
      "no_posts_title": "עדיין אין פוסטים",
      "no_posts_message": "היה הראשון לפתוח שיחה!",
      "create_first_post": "צור פוסט ראשון",
      "no_groups_title": "עדיין אין קבוצות",
      "no_groups_message": "צור את הקבוצה הראשונה כדי להפגיש אנשים!",
      "create_first_group": "צור קבוצה ראשונה",
      "no_stories_title": "עדיין אין סיפורים",
      "no_stories_message": "שתף את ההתקדמות שלך ותעורר השראה באחרים!",
      "share_your_story": "שתף את הסיפור שלך"
    },
    "your_groups": "הקבוצות שלך",
    "discover_groups": "גלה קבוצות"
  },
  "resources": {
    "page_title": "ספריית משאבים",
    "page_subtitle": "משאבי בריאות נפש מתוכננים למסע שלך",
    "search_placeholder": "חפש משאבים, נושאים, תגיות...",
    "category_label": "קטגוריה",
    "content_type_label": "סוג תוכן",
    "categories": {
      "all": "כל הנושאים",
      "anxiety": "חרדה",
      "depression": "דיכאון",
      "stress": "לחץ",
      "mindfulness": "מיינדפולנס",
      "relationships": "יחסים",
      "self_esteem": "הערכה עצמית",
      "sleep": "שינה",
      "coping_skills": "מיומנויות התמודדות",
      "emotional_regulation": "ויסות רגשי",
      "communication": "תקשורת",
      "general": "רווחה כללית"
    },
    "content_types": {
      "all": "כל הסוגים",
      "article": "מאמרים",
      "meditation": "מדיטציות",
      "scenario": "תרחישי תרגול",
      "interview": "ראיונות מומחים",
      "guide": "מדריכים",
      "video": "סרטונים",
      "podcast": "פודקאסטים",
      "book": "ספרים"
    },
    "tabs": {
      "all": "כל המשאבים",
      "saved": "נשמר"
    },
    "loading": "טוען משאבים...",
    "empty_state": {
      "no_resources_title": "לא נמצאו משאבים",
      "no_resources_message": "נסה להתאים את החיפוש או המסננים"
    }
  },
  "settings": {
    "page_title": "הגדרות",
    "page_subtitle": "נהל את החשבון וההעדפות שלך",
    "profile": {
      "title": "פרופיל",
      "full_name": "שם מלא",
      "name_placeholder": "השם שלך",
      "email": "אימייל",
      "email_readonly": "לא ניתן לשנות אימייל",
      "role": "תפקיד",
      "role_admin": "מנהל",
      "role_user": "משתמש",
      "save_changes": "שמור שינויים",
      "saving": "שומר..."
    },
    "language": {
      "title": "שפה",
      "description": "בחר את השפה המועדפת עליך",
      "current": "שפה נוכחית",
      "english": "English (אנגלית)",
      "hebrew": "עברית",
      "spanish": "Español (ספרדית)",
      "french": "Français (צרפתית)",
      "german": "Deutsch (גרמנית)",
      "italian": "Italiano (איטלקית)",
      "portuguese": "Português (פורטוגזית)"
    },
    "theme": {
      "title": "ערכת צבעים",
      "description": "בחר ערכת נושא חזותית שנוחה לך",
      "default": {
        "name": "ברירת מחדל",
        "description": "גרדיאנט ירוק וסגול רגוע"
      },
      "ocean": {
        "name": "אוקיינוס",
        "description": "כחולים וצבעי ים שלווים"
      },
      "sunset": {
        "name": "שקיעה",
        "description": "כתומים וורודים חמים"
      },
      "forest": {
        "name": "יער",
        "description": "ירוקים טבעיים וגווני אדמה"
      },
      "lavender": {
        "name": "לבנדר",
        "description": "סגולים וורודים רכים"
      },
      "minimal": {
        "name": "מינימלי",
        "description": "אפורים ושחורים נקיים"
      }
    },
    "dashboard_layout": {
      "title": "פריסת לוח הבקרה",
      "description": "בחר כיצד לוח הבקרה שלך מאורגן",
      "default_title": "ברירת מחדל",
      "default_description": "פריסה מאוזנת עם כל הסעיפים",
      "compact_title": "קומפקטי",
      "compact_description": "תצוגה דחוסה לגישה מהירה"
    },
    "subscription": {
      "title": "מנוי",
      "free_trial": "ניסיון חינם",
      "active": "פעיל",
      "description": "אתה כרגע בניסיון חינם. שדרג לפרימיום לגישה בלתי מוגבלת לכל התכונות.",
      "feature_sessions": "✓ פגישות טיפול מוגבלות (5 חינם)",
      "feature_exercises": "✓ תרגילי CBT בסיסיים",
      "feature_mood": "✓ מעקב אחר מצב רוח",
      "upgrade_button": "שדרג לפרימיום - $9.99/חודש",
      "premium_benefits": "פרימיום כולל: פגישות בלתי מוגבלות, תרגילים מתקדמים, תמיכה עדיפה ועוד."
    },
    "notifications": {
      "title": "התראות",
      "daily_reminders": "תזכורות יומיות",
      "daily_reminders_description": "קבל תזכורת להתחבר מדי יום",
      "progress_updates": "עדכוני התקדמות",
      "progress_updates_description": "סיכום שבועי של ההתקדמות שלך",
      "goal_reminders": "תזכורות מטרות",
      "goal_reminders_description": "התראות על מועדי יעד",
      "exercise_reminders": "תזכורות תרגילים",
      "exercise_reminders_description": "זמנים מוצעים לתרגילי CBT"
    },
    "data_privacy": {
      "title": "נתונים ופרטיות",
      "retention_label": "מדיניות שמירת נתונים",
      "retention_description": "בחר כמה זמן רישומי הטיפול, רשומות מצב הרוח ונתוני היומן שלך נשמרים. לאחר תקופה זו, רישומים עשויים להימחק אוטומטית.",
      "retention_30_days": "30 ימים",
      "retention_90_days": "90 ימים",
      "retention_1_year": "שנה",
      "retention_indefinite": "שמור ללא הגבלה",
      "current_setting": "הגדרה נוכחית: {{value}}",
      "current_setting_indefinite": "ללא הגבלה",
      "current_setting_days": "{{days}} ימים",
      "retention_saved": "הגדרת שמירה נשמרה",
      "retention_failed": "שמירת ההגדרה נכשלה",
      "export_title": "ייצא את הנתונים שלך",
      "export_description": "הורד סיכום של רישומי הטיפול, רשומות מצב רוח ומטרות שלך כקובץ JSON.",
      "export_button": "ייצא נתונים",
      "exporting": "מייצא...",
      "export_success": "הנתונים יוצאו בהצלחה",
      "export_failed": "ייצוא הנתונים נכשל",
      "delete_title": "מחק את כל הנתונים",
      "delete_description": "הסר לצמיתות את כל רישומי הטיפול, רשומות מצב רוח ונתוני היומן שלך. פעולה זו לא ניתנת לביטול.",
      "delete_button": "מחק את כל הנתונים",
      "delete_confirm_prompt": "האם אתה בטוח? זה ימחק לצמיתות את כל הנתונים שלך.",
      "delete_confirm_button": "כן, מחק הכל",
      "deleting": "מוחק...",
      "delete_success": "כל הנתונים נמחקו בהצלחה",
      "delete_failed": "מחיקת הנתונים נכשלה",
      "cancel_button": "ביטול",
      "privacy_notice": "הודעת פרטיות: אפליקציה זו אינה טוענת תאימות HIPAA. הנתונים שלך מאוחסנים בצורה מאובטחת במסד הנתונים שלנו וכפופים לתנאי השירות שלנו. בקשות מחיקה מעובדות באופן מיידי. לשאלות לגבי טיפול בנתונים, פנה לתמיכה."
    },
    "account": {
      "title": "חשבון",
      "logout": "התנתק"
    },
    "footer": {
      "need_help": "צריך עזרה?",
      "contact_support": "צור קשר עם תמיכה",
      "version": "MindCare CBT Therapist · גרסה 1.0"
    }
  }
}

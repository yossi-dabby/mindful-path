const SERIES_ID = 'children-cbt-specialized-he';
const SERIES_TITLE = 'CBT ייעודי לילדים';
const CATEGORY = 'children_cbt_specialized';
const MAIN_CATEGORY = 'cbt-specialized';
const DISPLAY_CATEGORY = 'CBT ייעודי לילדים';

const SHARED_NOT_FOR = Object.freeze([
  'בקשות באנגלית או בשפה שאינה עברית',
  'בקשות למתבגרים או למבוגרים',
  'מצבי חירום נפשיים',
  'תחליף לאבחון רפואי או לטיפול רפואי',
  'עיבוד טראומה ללא ליווי קליני מתאים',
]);

const COMMON_INTENT_PHRASES_HE = Object.freeze([
  'אני צריך טופס CBT לילד בעברית',
  'אני צריך טופס ייעודי לילדים',
  'שלח לי טופס לילדה',
  'שלח לי טופס שמתאים לילד',
  'טופס CBT לילדים בעברית',
]);

const MODULE_DEFINITIONS = Object.freeze([
  {
    "subcategoryNumber": "1.1",
    "clinicalGroupNumber": 1,
    "moduleTitle": "חרדת פרידה",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/combined.pdf",
    "secondaryCategories": [
      "anxiety_tools",
      "coping_tools",
      "thought_records"
    ],
    "therapeuticGoal": "לעזור לילדים לבנות פרידה בטוחה יותר, להפחית מצוקת פרידה ולתרגל צעדים אמיצים וקצרים מול פרידות יומיומיות.",
    "whenToUse": "מתאים כשילד או ילדה מתקשים להיפרד מהורה, חוששים מהליכה לבית הספר, מתקשים להירדם לבד או נצמדים בזמן פרידות.",
    "aiMatchingSummary": "מתאים לחרדת פרידה אצל ילדים, קושי בפרידה מהורה, פחד מהליכה לבית הספר, קושי להירדם לבד וחיפוש אחר צעדי פרידה בטוחים.",
    "clinicalKeywords": [
      "חרדת פרידה",
      "פחד להיפרד מההורה",
      "קושי בפרידה",
      "פרידה מהורה",
      "בית ספר",
      "להירדם לבד",
      "safe goodbye",
      "separation anxiety"
    ],
    "intentPhrases": [
      "ילד עם חרדת פרידה",
      "ילדה שפוחדת להיפרד מההורה",
      "פרידה מהורה",
      "טופס חרדת פרידה לילד",
      "אני צריך טופס CBT לילד בעברית"
    ],
    "safetyNotes": "דפי עבודה לילדים בנושא חרדת פרידה. להשתמש בשפה עדינה, לא מאשימה, ולהיעזר במבוגר תומך כאשר הילד מוצף.",
    "worksheets": [
      "נפרדים בשלום",
      "הולכים לבית הספר באומץ",
      "ישנים במיטה שלי באומץ",
      "חפץ הנחמה שלי",
      "תוכנית צעדי הפרידה שלי",
      "מחשבות דאגה כשאנחנו נפרדים",
      "מה הגוף שלי מרגיש",
      "מי עוזר לי להרגיש בטוח/ה?",
      "סולם האומץ שלי לפרידה",
      "כרטיס הפרידה הבטוחה שלי"
    ]
  },
  {
    "subcategoryNumber": "1.2",
    "clinicalGroupNumber": 1,
    "moduleTitle": "פוביות ספציפיות",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/all.pdf",
    "secondaryCategories": [
      "anxiety_tools",
      "coping_tools",
      "thought_records"
    ],
    "therapeuticGoal": "לעזור לילדים להפחית הימנעות מפחדים ספציפיים דרך צעדים הדרגתיים, מיפוי פחד, מחשבות עוזרות וכלי אומץ.",
    "whenToUse": "מתאים כשיש פחד ספציפי כמו כלבים, מעלית, זריקות, רעשים חזקים או הימנעות ממוקד פחד ברור.",
    "aiMatchingSummary": "מתאים לפחדים ספציפיים אצל ילדים כמו פחד מכלבים, מעלית, זריקות או רעשים חזקים ולבניית סולם אומץ מדורג.",
    "clinicalKeywords": [
      "פוביות ספציפיות",
      "פחד מכלבים",
      "פחד ממעלית",
      "פחד מזריקות",
      "פחד מרעשים חזקים",
      "מפת פחד",
      "specific phobia",
      "fear of dogs"
    ],
    "intentPhrases": [
      "פחדים ספציפיים",
      "פחד מכלבים",
      "פחד ממעלית",
      "טופס פחד לילד",
      "שלח לי טופס שמתאים לילד"
    ],
    "safetyNotes": "דפי עבודה לילדים עם פחדים ספציפיים. לשמור על קצב הדרגתי, ללא כפייה וללא הצפה.",
    "worksheets": [
      "כשאני מפחד/ת מכלבים",
      "צעדי אומץ במעלית",
      "צעדים אמיצים לזריקות",
      "תוכנית אומץ לרעשים חזקים",
      "מפת הפחד שלי",
      "מחשבות מול מציאות",
      "מה עוזר לי להתקרב",
      "סולם האומץ שלי",
      "פותרים בעיות באומץ",
      "להיות אמיץ/ה בכל יום"
    ]
  },
  {
    "subcategoryNumber": "1.3",
    "clinicalGroupNumber": 1,
    "moduleTitle": "חרדה חברתית",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_specific_phobias_full.pdf",
    "secondaryCategories": [
      "anxiety_tools",
      "coping_tools",
      "social_skills"
    ],
    "therapeuticGoal": "לעזור לילדים לבנות אומץ חברתי, להפחית פחד מדיבור או ממפגשים חברתיים ולתרגל צעדים קטנים של השתתפות.",
    "whenToUse": "מתאים כשילד או ילדה מתביישים לדבר בכיתה, חוששים שיצחקו עליהם, נמנעים ממשחק חברתי או מתקשים לבקש עזרה.",
    "aiMatchingSummary": "מתאים לחרדה חברתית אצל ילדים, קושי לדבר מול ילדים אחרים, הימנעות ממצבים חברתיים ופחד מביקורת או מבוכה.",
    "clinicalKeywords": [
      "חרדה חברתית",
      "ביישנות",
      "לדבר בכיתה",
      "מפגשים חברתיים",
      "פחד שיצחקו עליי",
      "לבקש עזרה",
      "social anxiety",
      "class speaking"
    ],
    "intentPhrases": [
      "חרדה חברתית",
      "ילדה שמתביישת לדבר מול ילדים",
      "ילד שנמנע ממפגשים חברתיים",
      "קושי חברתי",
      "טופס CBT לילדים בעברית"
    ],
    "safetyNotes": "דפי עבודה לילדים עם חרדה חברתית. להתקדם בעדינות, בלי בושה ובלי לחץ לחשיפה מהירה מדי.",
    "worksheets": [
      "לדבר בכיתה באומץ",
      "כשאני דואג/ת שיצחקו עליי",
      "מותר לי לטעות",
      "להצטרף למשחק",
      "לבקש עזרה",
      "המחשבות החברתיות שלי",
      "מה הגוף שלי מרגיש ברגעים חברתיים",
      "משפטים חברתיים שעוזרים",
      "הצעדים החברתיים הקטנים שלי",
      "כרטיס האומץ החברתי שלי"
    ]
  },
  {
    "subcategoryNumber": "1.4",
    "clinicalGroupNumber": 1,
    "moduleTitle": "לחץ לפני מבחן וביצוע",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_specific_phobias_full.pdf",
    "secondaryCategories": [
      "anxiety_tools",
      "coping_tools",
      "thought_records"
    ],
    "therapeuticGoal": "לעזור לילדים להפחית לחץ לפני מבחן או משימת ביצוע דרך הכנה, נשימה, פירוק משימה ותוכנית פעולה מרגיעה.",
    "whenToUse": "מתאים ללחץ לפני מבחן, פחד מטעויות, קושי להתחיל משימה או תחושת הצפה סביב ביצוע בבית הספר.",
    "aiMatchingSummary": "מתאים לחרדת מבחנים אצל ילדים, לחץ לפני משימה, פחד מכישלון ולבניית תוכנית מוכנות והרגעה לפני ביצוע.",
    "clinicalKeywords": [
      "חרדת מבחנים",
      "לחץ לפני מבחן",
      "ביצוע",
      "פחד מטעויות",
      "להתחיל משימה",
      "test anxiety",
      "performance anxiety"
    ],
    "intentPhrases": [
      "חרדת מבחנים",
      "לחץ לפני מבחן",
      "ילד שנלחץ לפני מבחן",
      "משימת ביצוע",
      "שלח לי טופס לילדה"
    ],
    "safetyNotes": "דפי עבודה לילדים סביב לחץ ביצוע. לשמור על מסר תומך ולהימנע משפה פרפקציוניסטית או ביקורתית.",
    "worksheets": [
      "לפני המבחן",
      "מותר לי לטעות",
      "כשאני חושב/ת: אני לא אצליח",
      "מתארגנים לפני משימה",
      "נושמים לפני מבחן",
      "משימה אחת בחלקים קטנים",
      "אחרי המבחן",
      "הצלחה היא לא שלמות",
      "התוכנית שלי",
      "כרטיס הביטחון שלי"
    ]
  },
  {
    "subcategoryNumber": "1.5",
    "clinicalGroupNumber": 1,
    "moduleTitle": "דאגות יומיומיות",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_specific_phobias_full.pdf",
    "secondaryCategories": [
      "anxiety_tools",
      "coping_tools",
      "thought_records"
    ],
    "therapeuticGoal": "לעזור לילדים לזהות דאגות חוזרות, להבין מה בשליטתם, ולבנות מחשבות וכלים שמפחיתים הצפה יומיומית.",
    "whenToUse": "מתאים כשיש דאגות חוזרות על משפחה, עתיד, בריאות, בית ספר או חוסר ודאות שמעסיקות את הילד לאורך היום.",
    "aiMatchingSummary": "מתאים לדאגות יומיומיות אצל ילדים, חשיבה דאגנית כללית, צורך בהבחנה בין מה שבשליטה לבין מה שלא, וכלי הרגעה קצרים.",
    "clinicalKeywords": [
      "דאגות חוזרות",
      "דאגות יומיומיות",
      "דאגות על המשפחה",
      "דאגות על העתיד",
      "מה בשליטה שלי",
      "generalized anxiety",
      "worry"
    ],
    "intentPhrases": [
      "דאגות חוזרות",
      "ילד שדואג כל הזמן",
      "דאגות על המשפחה",
      "דאגות על העתיד",
      "טופס ייעודי לילדים"
    ],
    "safetyNotes": "דפי עבודה לילדים עם דאגות חוזרות. לחזק ויסות, תקווה וצעדים קטנים בלי להציף בתרחישים מפחידים.",
    "worksheets": [
      "דאגות יומיומיות",
      "דאגות על המשפחה",
      "דאגות על העתיד",
      "מה בשליטה שלי?",
      "זמן הדאגה הקצר שלי",
      "מחשבת דאגה או מחשבה עוזרת?",
      "הגוף שלי והדאגה",
      "העוגן המרגיע שלי",
      "תוכנית הדאגה שלי",
      "כרטיס \"אני יכול/ה להתמודד\""
    ]
  },
  {
    "subcategoryNumber": "2.3",
    "clinicalGroupNumber": 2,
    "moduleTitle": "אימפולסיביות",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_full.pdf",
    "secondaryCategories": [
      "emotional_regulation",
      "coping_tools",
      "anger_management"
    ],
    "therapeuticGoal": "לעזור לילדים לעצור, לחשוב ולבחור תגובה בטוחה יותר לפני פעולה אימפולסיבית, ולתרגל תיקון אחרי מעשה.",
    "whenToUse": "מתאים כשילד פועל בלי לעצור, מתקשה לחכות לתורו, מתפרץ במילים או בתנועה, או צריך ללמוד לעצור לפני הדחף.",
    "aiMatchingSummary": "מתאים לאימפולסיביות אצל ילדים, קושי לחכות, תגובה מהירה בלי לחשוב וצורך בתרגול עצור-חשוב-בחר.",
    "clinicalKeywords": [
      "אימפולסיביות",
      "קושי לחכות",
      "פועל בלי לעצור",
      "עצור חשוב בחר",
      "לחכות לתור",
      "impulsivity",
      "stop think choose"
    ],
    "intentPhrases": [
      "אימפולסיביות",
      "ילד שפועל בלי לעצור",
      "קושי לחכות לתור",
      "עצור חשוב בחר",
      "ויסות רגשי"
    ],
    "safetyNotes": "דפי עבודה לילדים עם קושי בשליטה בדחפים. לשמור על שפה מחזקת, לא מביישת, ולהדגיש תיקון ולמידה.",
    "worksheets": [
      "לעצור לפני שאני פועל/ת",
      "לחשוב לפני שאני עושה",
      "ידיים שקטות",
      "הפה שלי מחכה לתורו",
      "לבחור לפני הדחף",
      "מה קורה אחרי שפעלתי מהר?",
      "אדום, צהוב, ירוק",
      "לחכות קצת",
      "מתקנים אחרי שפעלתי מהר",
      "כרטיס עצור-חשוב-בחר שלי"
    ]
  },
  {
    "subcategoryNumber": "3.1",
    "clinicalGroupNumber": 3,
    "moduleTitle": "דימוי עצמי נמוך",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_full.pdf",
    "secondaryCategories": [
      "thought_records",
      "reflection_journal",
      "social_skills"
    ],
    "therapeuticGoal": "לעזור לילדים לזהות מחשבות שליליות על עצמם, להתחבר לחוזקות ולבנות דיבור פנימי חומל ומחזק.",
    "whenToUse": "מתאים כשילד אומר על עצמו שהוא לא מספיק טוב, מתמקד בטעויות, מתקשה לזהות חוזקות או מרגיש פחות טוב מאחרים.",
    "aiMatchingSummary": "מתאים לדימוי עצמי נמוך אצל ילדים, ביקורת עצמית, תחושת לא מספיק טוב וצורך בחיזוק ערך עצמי וחוזקות.",
    "clinicalKeywords": [
      "דימוי עצמי נמוך",
      "ביקורת עצמית",
      "אני לא טוב/ה",
      "חוזקות",
      "ערך עצמי",
      "low self-esteem",
      "self worth"
    ],
    "intentPhrases": [
      "דימוי עצמי נמוך",
      "ביקורת עצמית",
      "ילד שלא מאמין בעצמו",
      "ילדה שמרגישה פחות טובה",
      "טופס שמתאים לילד"
    ],
    "safetyNotes": "דפי עבודה לילדים סביב ערך עצמי. לשמור על שפה חומלת, מחזקת ולא שיפוטית.",
    "worksheets": [
      "מחשבות על עצמי",
      "\"אני לא טוב/ה\" מול עובדות",
      "החוזקות שלי",
      "דברים שאני לומד/ת",
      "הצלחה קטנה",
      "טעות היא לא כישלון",
      "הקול הביקורתי שלי מול הקול הטוב שלי",
      "דברים שאחרים אוהבים בי",
      "משפט עוזר בשבילי",
      "כרטיס הערך העצמי שלי"
    ]
  },
  {
    "subcategoryNumber": "4.1",
    "clinicalGroupNumber": 4,
    "moduleTitle": "OCD",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_full.pdf",
    "secondaryCategories": [
      "thought_records",
      "coping_tools",
      "emotional_regulation"
    ],
    "therapeuticGoal": "לעזור לילדים לזהות מחשבות דביקות, ספק וטקסים, ולתרגל עיכוב תגובה ותגובה חדשה מבלי לחזק כפייתיות.",
    "whenToUse": "מתאים כשיש מחשבות חודרניות, בדיקות חוזרות, ניקוי או סידור כפייתי, צורך חזק בטקס או בקבלת הרגעה חוזרת.",
    "aiMatchingSummary": "מתאים לילדים עם OCD, מחשבות חודרניות, ספק, בדיקות או טקסים, תוך מסר זהיר שאינו מחזק כפייתיות.",
    "clinicalKeywords": [
      "OCD",
      "מחשבות חודרניות",
      "מחשבה דביקה",
      "טקסים",
      "בדיקות",
      "ניקוי",
      "ספק",
      "intrusive thoughts",
      "rituals"
    ],
    "intentPhrases": [
      "OCD",
      "מחשבות חודרניות",
      "בדיקות",
      "טקסים",
      "צורך בהרגעה"
    ],
    "safetyNotes": "דפי עבודה לילדים עם OCD. לא להציג טקסים או בדיקות כפתרון, ולהישאר בשפה תומכת ועקבית עם CBT/ERP.",
    "worksheets": [
      "מחשבה דביקה",
      "הדחף לעשות טקס",
      "הספק חוזר",
      "בדיקות חוזרות",
      "שטיפה או ניקוי חוזרים",
      "סידור חוזר",
      "מחכים לפני הטקס",
      "סולם \"לא עכשיו\" שלי",
      "בוחר/ת תגובה חדשה",
      "כרטיס האומץ שלי מול OCD"
    ]
  },
  {
    "subcategoryNumber": "4.2",
    "clinicalGroupNumber": 4,
    "moduleTitle": "התמודדות בטוחה אחרי פחד או טראומה",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_full.pdf",
    "secondaryCategories": [
      "coping_tools",
      "emotional_regulation",
      "thought_records"
    ],
    "therapeuticGoal": "לעזור לילדים לבנות תחושת ביטחון, קרקוע ותמיכה אחרי פחד גדול או חוויה מציפה, בלי להיכנס לפרטים טראומטיים.",
    "whenToUse": "מתאים כשצריך שפה עדינה של ביטחון, טריגרים, קרקוע, מקום בטוח, עזרה ותמיכה אחרי פחד או טראומה.",
    "aiMatchingSummary": "מתאים להתמודדות בטוחה אחרי טראומה או פחד גדול אצל ילדים, עם דגש על ביטחון, קרקוע, תמיכה ומבוגר אחראי.",
    "clinicalKeywords": [
      "טראומה",
      "התמודדות בטוחה",
      "טריגרים",
      "קרקוע",
      "תחושת ביטחון",
      "משאבים",
      "trauma",
      "grounding",
      "safe coping"
    ],
    "intentPhrases": [
      "טראומה",
      "התמודדות בטוחה",
      "טריגרים",
      "קרקוע",
      "תחושת ביטחון",
      "משאבים"
    ],
    "safetyNotes": "דפי עבודה לילדים אחרי פחד או טראומה. להישאר בשפה עדינה, לא גרפית, ממוקדת ביטחון, קרקוע ותמיכה של מבוגר אחראי או איש מקצוע.",
    "worksheets": [
      "מרגיש/ה בטוח/ה עכשיו",
      "מזהה טריגר בלי פרטים",
      "חוזר/ת אל הגוף שלי",
      "המקום הבטוח שלי",
      "האדם הבטוח שלי",
      "דברים שעוזרים לי עכשיו",
      "סימני הגוף שלי אחרי פחד",
      "תוכנית הקרקוע שלי",
      "משפט הביטחון שלי",
      "כרטיס העזרה והתמיכה שלי"
    ]
  },
  {
    "subcategoryNumber": "5.1",
    "clinicalGroupNumber": 5,
    "moduleTitle": "קשיי שינה",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_full.pdf",
    "secondaryCategories": [
      "sleep",
      "coping_tools",
      "emotional_regulation"
    ],
    "therapeuticGoal": "לעזור לילדים עם קשיי שינה לזהות מחשבות ופחדי לילה, לבנות שגרת לילה מרגיעה ולתרגל צעדים שמגבירים ביטחון לפני השינה.",
    "whenToUse": "מתאים לפחד ללכת לישון, פחד מהחושך, יקיצות לילה, דאגות בלילה או קושי להישאר במיטה בבטחה.",
    "aiMatchingSummary": "מתאים לילדים עם קשיי שינה, פחד מהחושך, דאגות לילה, יקיצות או צורך בתוכנית שינה אישית ומרגיעה.",
    "clinicalKeywords": [
      "קשיי שינה",
      "פחד ללכת לישון",
      "פחד מהחושך",
      "דאגות לילה",
      "יקיצות לילה",
      "sleep",
      "bedtime"
    ],
    "intentPhrases": [
      "קשיי שינה",
      "פחד ללכת לישון",
      "פחד מהחושך",
      "ילד שמתעורר בלילה",
      "טופס CBT לילדים בעברית"
    ],
    "safetyNotes": "דפי עבודה לילדים סביב שינה ולילה. לשמור על שפה מרגיעה, לא מפחידה, ולהתאים לקצב הילד.",
    "worksheets": [
      "מחשבות לפני השינה",
      "פחד מהחושך",
      "שגרת השינה שלי",
      "הגוף שלי מתכונן לשינה",
      "דברים שמרגיעים אותי",
      "כרטיס הלילה המרגיע שלי",
      "כשאני מתעורר/ת בלילה",
      "להישאר במיטה בבטחה",
      "דאגות לילה",
      "תוכנית השינה האישית שלי"
    ]
  },
  {
    "subcategoryNumber": "5.3",
    "clinicalGroupNumber": 5,
    "moduleTitle": "הרטבה, לכלוך ומתח",
    "combinedFileUrl": "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_enuresis_encopresis_stress_support_combined.pdf",
    "secondaryCategories": [
      "coping_tools",
      "emotional_regulation",
      "weekly_practice"
    ],
    "therapeuticGoal": "לעזור לילדים ולהורים לדבר על הרטבה או לכלוך בלי בושה, לזהות סימני גוף ולבנות שגרה רגועה ותומכת סביב למידה ושליטה בגוף.",
    "whenToUse": "מתאים להרטבה, לכלוך, בושה סביב פספוסים, צורך בתמיכת הורה ושפה רגועה סביב שליטה בגוף ולמידה הדרגתית.",
    "aiMatchingSummary": "מתאים להרטבה או לקשיים דומים סביב שליטה בגוף אצל ילדים, עם דגש על בלי בושה, למידה הדרגתית, תמיכת הורה ושפה רגועה.",
    "clinicalKeywords": [
      "הרטבה",
      "אנורזיס",
      "אנקופרזיס",
      "פספוסים",
      "בושה",
      "שליטה בגוף",
      "enuresis",
      "encopresis",
      "toileting"
    ],
    "intentPhrases": [
      "הרטבה",
      "פספוסים",
      "קושי סביב שליטה בגוף",
      "בלי בושה",
      "תמיכה מהורה"
    ],
    "safetyNotes": "דפי עבודה לילדים סביב הרטבה, לכלוך ומתח. לשמור על מסר נטול בושה, לא להאשים, לא להציג את הקושי כהתנהגות מכוונת ולא להחליף בירור רפואי בעת הצורך.",
    "worksheets": [
      "בלי בושה, בלי אשמה",
      "הגוף לומד לאט",
      "שגרת ערב רגועה שלי",
      "הגוף שלי שולח סימנים",
      "מבקשים עזרה",
      "תוכנית השירותים הרגועה שלי",
      "כשקורה פספוס",
      "משפט טוב לעצמי",
      "תמיכה מהורה",
      "כרטיס \"אני לומד/ת\" שלי"
    ]
  }
]);

function dedupe(values) {
  return Object.freeze(Array.from(new Set((values || []).filter(Boolean))));
}

function getFileName(fileUrl) {
  return String(fileUrl || '').split('/').filter(Boolean).pop() || '';
}

function normalizeCode(code) {
  return String(code || '').replace(/\./g, '-');
}

function buildWorksheetDescription(moduleTitle, worksheetTitle) {
  return `דף עבודה בעברית לילדים בנושא ${worksheetTitle} מתוך אוסף ${moduleTitle}.`;
}

function buildWorksheetWhenToUse(moduleDefinition, worksheetTitle) {
  return `מתאים כשצריך דף עבודה ממוקד לילדים בנושא ${worksheetTitle} בתוך תחום ${moduleDefinition.moduleTitle}.`;
}

function buildWorksheetAiSummary(moduleDefinition, worksheetTitle) {
  return `מתאים לבקשה על ${worksheetTitle} בתוך אוסף ${moduleDefinition.moduleTitle} לילדים בעברית.`;
}

function buildModuleForm(definition) {
  const normalizedCode = normalizeCode(definition.subcategoryNumber);
  const worksheetNumbers = definition.worksheets.map((_, index) => `${definition.subcategoryNumber}.${index + 1}`);
  return Object.freeze({
    id: `${SERIES_ID}-module-${normalizedCode}`,
    slug: `${SERIES_ID}-module-${normalizedCode}`,
    type: 'module_pdf',
    approved: true,
    title: definition.moduleTitle,
    description: `כל דפי העבודה בנושא ${definition.moduleTitle} בקובץ אחד בעברית לילדים.`,
    language: 'he',
    audience: 'children',
    category: CATEGORY,
    mainCategory: MAIN_CATEGORY,
    displayCategory: DISPLAY_CATEGORY,
    secondaryCategories: dedupe(definition.secondaryCategories),
    parentSeriesId: SERIES_ID,
    series: SERIES_TITLE,
    moduleNumber: definition.clinicalGroupNumber,
    moduleCode: definition.subcategoryNumber,
    moduleTitle: definition.moduleTitle,
    subcategoryNumber: definition.subcategoryNumber,
    worksheetCount: definition.worksheets.length,
    worksheetNumbers,
    formNumber: definition.subcategoryNumber,
    worksheetNumber: definition.subcategoryNumber,
    fileUrl: definition.combinedFileUrl,
    therapeuticGoal: definition.therapeuticGoal,
    whenToUse: definition.whenToUse,
    clinicalKeywords: dedupe([
      ...definition.clinicalKeywords,
      ...definition.intentPhrases,
      ...COMMON_INTENT_PHRASES_HE,
      definition.moduleTitle,
      definition.subcategoryNumber,
    ]),
    intentPhrases: dedupe([
      ...definition.intentPhrases,
      ...COMMON_INTENT_PHRASES_HE,
      `מודול ${definition.subcategoryNumber}`,
      `נושא ${definition.moduleTitle}`,
    ]),
    notFor: SHARED_NOT_FOR,
    safetyNotes: definition.safetyNotes,
    aiMatchingSummary: definition.aiMatchingSummary,
    variant_language: 'he',
    available_languages: Object.freeze(['he']),
    source_language: 'he',
    languages: Object.freeze({
      he: Object.freeze({
        title: definition.moduleTitle,
        description: `כל דפי העבודה בנושא ${definition.moduleTitle} בקובץ אחד בעברית לילדים.`,
        file_url: definition.combinedFileUrl,
        file_type: 'pdf',
        file_name: getFileName(definition.combinedFileUrl),
        rtl: true,
      }),
    }),
  });
}

function buildWorksheetForm(definition, moduleForm, worksheetTitle, worksheetIndex) {
  const worksheetNumber = `${definition.subcategoryNumber}.${worksheetIndex + 1}`;
  const normalizedCode = normalizeCode(definition.subcategoryNumber);
  const fileUrl = ({
  "1.1": [
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/1.1.1.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/1.1.2.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/1.1.3.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/1.1.4.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/1.1.5.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/1.1.6.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/1.1.7.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/1.1.8.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/1.1.9.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-01/1.1.10.pdf"
  ],
  "1.2": [
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/1.2.1.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/1.2.2.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/1.2.3.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/1.2.4.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/1.2.5.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/1.2.6.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/1.2.7.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/1.2.8.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/1.2.9.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-02/1.2.10.pdf"
  ],
  "1.3": [
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_01.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_02.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_03.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_04.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_05.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_06.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_07.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_08.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_09.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-03/children_cbt_specialized_he_01_03_10.pdf"
  ],
  "1.4": [
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_01.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_02.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_03.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_04.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_05.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_06.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_07.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_08.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_09.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-04/children_cbt_specialized_he_01_04_10.pdf"
  ],
  "1.5": [
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_01.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_02.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_03.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_04.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_05.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_06.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_07.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_08.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_09.pdf",
    "/forms/children/he/cbt-specialized/module-01/subcategory-01-05/children_cbt_specialized_he_01_05_10.pdf"
  ],
  "2.3": [
    "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_2.3.1.pdf",
    "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_2.3.2.pdf",
    "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_2.3.3.pdf",
    "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_2.3.4.pdf",
    "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_2.3.5.pdf",
    "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_2.3.6.pdf",
    "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_2.3.7.pdf",
    "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_2.3.8.pdf",
    "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_2.3.9.pdf",
    "/forms/children/he/cbt-specialized/module-02/subcategory-02-03/children_cbt_specialized_he_2.3__impulsivity_2.3.10.pdf"
  ],
  "3.1": [
    "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_3.1.1.pdf",
    "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_3.1.2.pdf",
    "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_3.1.3.pdf",
    "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_3.1.4.pdf",
    "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_3.1.5.pdf",
    "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_3.1.6.pdf",
    "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_3.1.7.pdf",
    "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_3.1.8.pdf",
    "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_3.1.9.pdf",
    "/forms/children/he/cbt-specialized/module-03/subcategory-03-01/children_cbt_specialized_he_3.1_low_self_esteem_3.1.10.pdf"
  ],
  "4.1": [
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_4.1.1.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_4.1.2.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_4.1.3.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_4.1.4.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_4.1.5.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_4.1.6.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_4.1.7.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_4.1.8.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_4.1.9.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-01/children_cbt_specialized_he_4.1_ocd_4.1.10.pdf"
  ],
  "4.2": [
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_4.2.1.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_4.2.2.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_4.2.3.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_4.2.4.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_4.2.5.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_4.2.6.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_4.2.7.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_4.2.8.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_4.2.9.pdf",
    "/forms/children/he/cbt-specialized/module-04/subcategory-04-02/children_cbt_specialized_he_4.2_trauma_sensitive_coping_ptsd_4.2.10.pdf"
  ],
  "5.1": [
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_5.1.1.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_5.1.2.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_5.1.3.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_5.1.4.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_5.1.5.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_5.1.6.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_5.1.7.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_5.1.8.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_5.1.9.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-01/children_cbt_specialized_he_5.1_sleep_problems_5.1.10.pdf"
  ],
  "5.3": [
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_5.3.1.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_5.3.2.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_5.3.3.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_5.3.4.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_5.3.5.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_5.3.6.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_5.3.7.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_5.3.8.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_5.3.9.pdf",
    "/forms/children/he/cbt-specialized/module-05/subcategory-05-03/children_cbt_specialized_he_5.3_5.3.10.pdf"
  ]
})[definition.subcategoryNumber][worksheetIndex];

  return Object.freeze({
    id: `${SERIES_ID}-${normalizedCode}-${worksheetIndex + 1}`,
    slug: `${SERIES_ID}-${normalizedCode}-${worksheetIndex + 1}`,
    type: 'individual_worksheet',
    approved: true,
    title: worksheetTitle,
    description: buildWorksheetDescription(definition.moduleTitle, worksheetTitle),
    language: 'he',
    audience: 'children',
    category: CATEGORY,
    mainCategory: MAIN_CATEGORY,
    displayCategory: DISPLAY_CATEGORY,
    secondaryCategories: dedupe(definition.secondaryCategories),
    parentSeriesId: SERIES_ID,
    parentModuleId: moduleForm.id,
    series: SERIES_TITLE,
    moduleNumber: definition.clinicalGroupNumber,
    moduleCode: definition.subcategoryNumber,
    moduleTitle: definition.moduleTitle,
    subcategoryNumber: definition.subcategoryNumber,
    worksheetNumber,
    worksheet_number: worksheetNumber,
    formNumber: worksheetNumber,
    pageNumberInWorkbook: worksheetIndex + 1,
    fileUrl,
    therapeuticGoal: definition.therapeuticGoal,
    whenToUse: buildWorksheetWhenToUse(definition, worksheetTitle),
    clinicalKeywords: dedupe([
      ...definition.clinicalKeywords,
      worksheetTitle,
      worksheetNumber,
      definition.moduleTitle,
    ]),
    intentPhrases: dedupe([
      worksheetTitle,
      worksheetNumber,
      `טופס ${worksheetNumber}`,
      `דף עבודה ${worksheetNumber}`,
      ...definition.intentPhrases,
    ]),
    notFor: SHARED_NOT_FOR,
    safetyNotes: definition.safetyNotes,
    aiMatchingSummary: buildWorksheetAiSummary(definition, worksheetTitle),
    variant_language: 'he',
    available_languages: Object.freeze(['he']),
    source_language: 'he',
    languages: Object.freeze({
      he: Object.freeze({
        title: worksheetTitle,
        description: buildWorksheetDescription(definition.moduleTitle, worksheetTitle),
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: getFileName(fileUrl),
        rtl: true,
      }),
    }),
  });
}

export const FORMS_CHILDREN_CBT_SPECIALIZED_HE_MODULE_PDFS = Object.freeze(
  MODULE_DEFINITIONS.map((definition) => buildModuleForm(definition))
);

export const FORMS_CHILDREN_CBT_SPECIALIZED_HE_INDIVIDUAL = Object.freeze(
  MODULE_DEFINITIONS.flatMap((definition, index) =>
    definition.worksheets.map((worksheetTitle, worksheetIndex) =>
      buildWorksheetForm(definition, FORMS_CHILDREN_CBT_SPECIALIZED_HE_MODULE_PDFS[index], worksheetTitle, worksheetIndex)
    )
  )
);

export const FORMS_CHILDREN_CBT_SPECIALIZED_HE = Object.freeze([
  ...FORMS_CHILDREN_CBT_SPECIALIZED_HE_MODULE_PDFS,
  ...FORMS_CHILDREN_CBT_SPECIALIZED_HE_INDIVIDUAL,
]);

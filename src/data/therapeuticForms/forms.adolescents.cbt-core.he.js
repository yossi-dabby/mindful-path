const ADOLESCENTS_CBT_CORE_HE_SERIES_ID = 'adolescents-cbt-core-he';

const STAGE_SECONDARY_CATEGORIES = Object.freeze({
  1: Object.freeze(['workbook_series', 'thought_records', 'coping_tools']),
  2: Object.freeze(['thought_records', 'cognitive_distortions', 'anxiety_tools']),
  3: Object.freeze(['thought_records', 'cognitive_distortions', 'emotional_regulation']),
  4: Object.freeze(['emotional_regulation', 'behavioral_activation', 'coping_tools']),
  5: Object.freeze(['behavioral_activation', 'anxiety_tools', 'coping_tools']),
  6: Object.freeze(['weekly_practice', 'goals_and_values', 'reflection_journal']),
});

const SHARED_NOT_FOR = Object.freeze([
  'children under adolescent age',
  'adult or older-adult requests',
  'English-only requests unless English is explicitly requested',
  'crisis intervention',
  'emergency mental health situations',
]);

const STAGE_TITLES_HE = Object.freeze({
  1: 'שלב 1 — להבין מה קורה לי עכשיו',
  2: 'שלב 2 — לזהות מחשבות ופירושים',
  3: 'שלב 3 — בדיקת מחשבות ואיזון',
  4: 'שלב 4 — בחירת פעולה יעילה',
  5: 'שלב 5 — תרגול פעולה והתמדה',
  6: 'שלב 6 — חיזוק, מעקב ותוכנית אישית',
});

const STAGE_BASE_PATHS = Object.freeze({
  1: '/forms/adolescents/he/cbt-core/stage-01',
  2: '/forms/adolescents/he/cbt-core/stage-02',
  3: '/forms/adolescents/he/cbt-core/stage-03',
  4: '/forms/adolescents/he/cbt-core/stage-04',
  5: '/forms/adolescents/he/cbt-core/stage-05',
  6: '/forms/adolescents/he/cbt-core/stage-06',
});

const STAGE_COMBINED_FILE_NAMES = Object.freeze({
  1: 'adolescents_cbt_core_he_series_1_combined.pdf',
  2: 'adolescents_cbt_core_he_series_2_git.pdf',
  3: 'adolescents_cbt_core_he_series_3_combined.pdf',
  4: 'adolescents_cbt_core_he_series_4_combined.pdf',
  5: 'adolescents_cbt_core_he_series_5_combined.pdf',
  6: 'adolescents_cbt_core_he_series_6_combined.pdf',
});

const INDIVIDUAL_WORKSHEET_DEFINITIONS = Object.freeze([
  { stageNumber: 1, worksheetNumberInStage: 1, title: 'מה עובר עליי עכשיו?', description: 'מיפוי מצב נוכחי: מחשבות, רגשות ותגובות בגוף.', therapeuticGoal: 'לבנות מודעות ראשונית למה שקורה עכשיו.', whenToUse: 'מתאים להתחלה כשיש בלבול, לחץ או עומס רגשי.', clinicalKeywords: ['חרדה', 'לחץ', 'מודעות עצמית', 'מתבגר', 'CBT בעברית'], intentPhrases: ['מה עובר עליי עכשיו', 'אני צריך טופס CBT בעברית למתבגר', 'טופס פתיחה למתבגר'] },
  { stageNumber: 1, worksheetNumberInStage: 2, title: 'הגוף שלי שולח לי סימנים', description: 'זיהוי סימני גוף של חרדה, לחץ ורגשות חזקים.', therapeuticGoal: 'לחבר בין תחושות גוף למצב רגשי כדי לזהות מוקדם.', whenToUse: 'כשיש דופק מהיר, מתח, כאב בטן או לחץ פיזי.', clinicalKeywords: ['לחץ', 'חרדה', 'ויסות רגשי', 'רגשות חזקים', 'סימני גוף'], intentPhrases: ['סימני גוף', 'אני צריך טופס על לחץ', 'נער עם קושי לווסת רגשות'] },
  { stageNumber: 1, worksheetNumberInStage: 3, title: 'מה הפעיל אותי?', description: 'זיהוי טריגרים: מצבים, מחשבות או אירועים שהפעילו קושי.', therapeuticGoal: 'להבין מה מפעיל תגובות מלחיצות ולבנות שליטה.', whenToUse: 'כשצריך להבין מה גרם להתפרצות רגשית או פחד.', clinicalKeywords: ['טריגר', 'פחדים', 'חרדה', 'לחץ', 'מחשבות מלחיצות'], intentPhrases: ['מה הפעיל אותי', 'מה הטריגר שלי', 'נערה עם מחשבות מלחיצות'] },
  { stageNumber: 1, worksheetNumberInStage: 4, title: 'מחשבה–רגש–פעולה', description: 'מיפוי הקשר בין מחשבות, רגשות והתנהגות.', therapeuticGoal: 'ללמד את משולש ה-CBT בצורה מעשית.', whenToUse: 'כשצריך להבין איך מחשבה משפיעה על רגש ופעולה.', clinicalKeywords: ['CBT', 'מחשבות שליליות', 'ויסות רגשי', 'מתבגרת', 'מתבגר'], intentPhrases: ['מחשבה רגש פעולה', 'טופס CBT למתבגרים', 'משולש CBT'] },
  { stageNumber: 1, worksheetNumberInStage: 5, title: 'המפה האישית שלי', description: 'מפת כוחות, תמיכה ופעולות שעוזרות לי.', therapeuticGoal: 'לחזק תחושת מסוגלות ותוכנית התמודדות אישית.', whenToUse: 'כשצריך לבנות בסיס יציב להמשך תהליך CBT.', clinicalKeywords: ['תוכנית אישית', 'כוחות', 'ויסות רגשי', 'פעולה יעילה'], intentPhrases: ['המפה האישית שלי', 'תוכנית אישית למתבגר', 'טופס בעברית לנער'] },

  { stageNumber: 2, worksheetNumberInStage: 1, title: 'מה הראש שלי אמר?', description: 'זיהוי מחשבות אוטומטיות לאחר אירוע מלחיץ.', therapeuticGoal: 'לזהות מחשבות מלחיצות בזמן אמת.', whenToUse: 'כשנער או נערה מציפים מחשבות שליליות חוזרות.', clinicalKeywords: ['מחשבות מלחיצות', 'מחשבות שליליות', 'חרדה', 'בדיקת מחשבות'], intentPhrases: ['מה הראש שלי אמר', 'מחשבות אוטומטיות', 'נערה עם מחשבות מלחיצות'] },
  { stageNumber: 2, worksheetNumberInStage: 2, title: 'מחשבה או עובדה?', description: 'הבחנה בין פירוש אישי לעובדה.', therapeuticGoal: 'להפחית היצמדות למחשבות כעובדות מוחלטות.', whenToUse: 'כשיש קושי להבדיל בין פחד למציאות.', clinicalKeywords: ['בדיקת מחשבות', 'מחשבות שליליות', 'פחדים', 'CBT בעברית'], intentPhrases: ['מחשבה או עובדה', 'בדיקת מחשבות', 'טופס בעברית'] },
  { stageNumber: 2, worksheetNumberInStage: 3, title: 'איזה פירוש נתתי לזה?', description: 'בדיקת פירושים אפשריים שונים לאותו אירוע.', therapeuticGoal: 'להרחיב גמישות מחשבתית ולהוריד חרדה.', whenToUse: 'כשיש פירוש קטסטרופלי או חד-כיווני.', clinicalKeywords: ['מחשבות מלחיצות', 'פחדים', 'בדיקת מחשבות', 'חרדה'], intentPhrases: ['איזה פירוש נתתי לזה', 'פירוש אחר', 'נער עם חרדה'] },
  { stageNumber: 2, worksheetNumberInStage: 4, title: 'איזה סוג מחשבה זו?', description: 'זיהוי דפוסי חשיבה לא מועילים.', therapeuticGoal: 'לזהות דפוסים שמגבירים לחץ וחרדה.', whenToUse: 'כשיש הכללות, שחור-לבן או ניבוי שלילי.', clinicalKeywords: ['מחשבות שליליות', 'לחץ', 'חרדה', 'בדיקת מחשבות'], intentPhrases: ['איזה סוג מחשבה זו', 'דפוס חשיבה', 'טופס CBT למתבגרים'] },
  { stageNumber: 2, worksheetNumberInStage: 5, title: 'איזו אמונה מסתתרת מתחת?', description: 'איתור אמונות בסיס שמזינות מחשבות מלחיצות.', therapeuticGoal: 'להבין שכבות עומק ולהתאים עבודה טיפולית.', whenToUse: 'כשמחשבות שליליות חוזרות שוב ושוב.', clinicalKeywords: ['אמונה', 'מחשבות שליליות', 'בדיקת מחשבות', 'חרדה'], intentPhrases: ['איזו אמונה מסתתרת מתחת', 'אמונת בסיס', 'נערה עם מחשבות מלחיצות'] },

  { stageNumber: 3, worksheetNumberInStage: 1, title: 'מה הראיות?', description: 'רישום ראיות בעד ונגד המחשבה.', therapeuticGoal: 'לבסס בדיקת מחשבות על עובדות ולא רק פחד.', whenToUse: 'כשנדרשת בדיקת מציאות סביב מחשבה מלחיצה.', clinicalKeywords: ['בדיקת מחשבות', 'ראיות', 'חרדה', 'לחץ'], intentPhrases: ['מה הראיות', 'ראיות בעד ונגד', 'טופס בדיקת מחשבות'] },
  { stageNumber: 3, worksheetNumberInStage: 2, title: 'יש דרך אחרת לראות את זה?', description: 'תרגול פרספקטיבה חלופית ומאוזנת.', therapeuticGoal: 'להפחית נוקשות מחשבתית ולעודד מחשבה גמישה.', whenToUse: 'כשיש תקיעות במחשבה אחת שמגבירה פחד.', clinicalKeywords: ['מחשבות שליליות', 'בדיקת מחשבות', 'פחדים', 'וויסות רגשי'], intentPhrases: ['יש דרך אחרת לראות את זה', 'מחשבה חלופית', 'נער עם חרדה'] },
  { stageNumber: 3, worksheetNumberInStage: 3, title: 'מה הייתי אומר/ת לחבר/ה?', description: 'הרחבת חמלה עצמית דרך נקודת מבט חיצונית.', therapeuticGoal: 'לבנות דיבור פנימי תומך במקום ביקורתי.', whenToUse: 'כשיש ביקורת עצמית או אשמה חזקה.', clinicalKeywords: ['ויסות רגשי', 'מחשבות שליליות', 'רגשות חזקים', 'לחץ'], intentPhrases: ['מה הייתי אומר לחבר', 'חמלה עצמית', 'טופס למתבגרת'] },
  { stageNumber: 3, worksheetNumberInStage: 4, title: 'מחשבה מאוזנת יותר', description: 'בניית ניסוח מאוזן לאחר בדיקת מחשבות.', therapeuticGoal: 'להחליף מחשבה מלחיצה במחשבה יעילה ומציאותית.', whenToUse: 'כשצריך לנסח מחדש מחשבה שלילית.', clinicalKeywords: ['מחשבות שליליות', 'בדיקת מחשבות', 'חרדה', 'פעולה יעילה'], intentPhrases: ['מחשבה מאוזנת יותר', 'ניסוח מחשבה חדשה', 'נערה עם מחשבות מלחיצות'] },
  { stageNumber: 3, worksheetNumberInStage: 5, title: 'מה אני בוחר/ת לחשוב עכשיו?', description: 'בחירת מחשבה מקדמת לאחר בחינת ראיות.', therapeuticGoal: 'לעבור ממודעות לשינוי מעשי בקו החשיבה.', whenToUse: 'כשמוכנים לצעד מעשי אחרי בדיקת מחשבות.', clinicalKeywords: ['בדיקת מחשבות', 'מחשבות שליליות', 'פעולה יעילה', 'התמדה'], intentPhrases: ['מה אני בוחר לחשוב עכשיו', 'מחשבה יעילה', 'טופס CBT בעברית'] },

  { stageNumber: 4, worksheetNumberInStage: 1, title: 'בחירת פעולה', description: 'בחירה ממוקדת של פעולה מתאימה למצב.', therapeuticGoal: 'לתרגם עבודה קוגניטיבית לפעולה בשטח.', whenToUse: 'כשנער נמנע ממשימות בגלל פחד וצריך צעד ראשון.', clinicalKeywords: ['פעולה יעילה', 'הימנעות', 'צעדים קטנים', 'חרדה'], intentPhrases: ['בחירת פעולה', 'נער שנמנע ממשימות בגלל פחד', 'מה לעשות עכשיו'] },
  { stageNumber: 4, worksheetNumberInStage: 2, title: 'בניית מחשבה מועילה', description: 'ניסוח מחשבות תומכות לפעולה ועמידה בקושי.', therapeuticGoal: 'לחזק דיבור פנימי שמאפשר התקדמות.', whenToUse: 'כשיש קושי להתחיל פעולה בגלל פחד או ספק.', clinicalKeywords: ['מחשבות שליליות', 'פעולה יעילה', 'לחץ', 'ויסות רגשי'], intentPhrases: ['בניית מחשבה מועילה', 'מחשבה מקדמת', 'טופס CBT למתבגר'] },
  { stageNumber: 4, worksheetNumberInStage: 3, title: 'צעדים קטנים', description: 'פירוק משימה מורכבת לצעדים קטנים וישימים.', therapeuticGoal: 'להפחית הימנעות ולהגביר תחושת הצלחה.', whenToUse: 'כשיש דחיינות, פחד מכישלון או הצפה.', clinicalKeywords: ['צעדים קטנים', 'הימנעות', 'התמדה', 'פעולה יעילה'], intentPhrases: ['צעדים קטנים', 'פירוק משימה', 'נער שנמנע ממשימות בגלל פחד'] },
  { stageNumber: 4, worksheetNumberInStage: 4, title: 'מחשבות, אמונות והנחות', description: 'בירור הנחות שמנהלות התנהגות ורגש.', therapeuticGoal: 'לזהות אמונות מגבילות שמשפיעות על פעולה.', whenToUse: 'כשיש אמירות פנימיות נוקשות שמגבילות התקדמות.', clinicalKeywords: ['מחשבות שליליות', 'אמונות', 'לחץ', 'חרדה'], intentPhrases: ['מחשבות אמונות והנחות', 'אמונות מגבילות', 'בדיקת מחשבות למתבגר'] },
  { stageNumber: 4, worksheetNumberInStage: 5, title: 'איזון והערכה', description: 'הערכת התקדמות והתאמת כיוון פעולה.', therapeuticGoal: 'לחזק למידה עצמית ודיוק תוכנית פעולה.', whenToUse: 'כשצריך לעצור, לבדוק ולהתאים את התוכנית.', clinicalKeywords: ['הערכה', 'תוכנית אישית', 'התמדה', 'ויסות רגשי'], intentPhrases: ['איזון והערכה', 'הערכת התקדמות', 'תוכנית פעולה'] },

  { stageNumber: 5, worksheetNumberInStage: 1, title: 'הימנעות', description: 'זיהוי מצבי הימנעות והמחיר שלהם.', therapeuticGoal: 'להבין את מעגל ההימנעות ולשבור אותו.', whenToUse: 'כשיש הימנעות ממשימות, מצבים חברתיים או לימודיים.', clinicalKeywords: ['הימנעות', 'חרדה', 'פחדים', 'פעולה יעילה'], intentPhrases: ['הימנעות', 'טופס על הימנעות', 'נער שנמנע ממשימות בגלל פחד'] },
  { stageNumber: 5, worksheetNumberInStage: 2, title: 'צעדים קטנים לפעולה', description: 'בניית רצף צעדים קטנים לצמצום הימנעות.', therapeuticGoal: 'להגדיל סיכוי לפעולה עקבית למרות פחד.', whenToUse: 'כשצריך להתחיל בקטן ולבנות ביטחון.', clinicalKeywords: ['צעדים קטנים', 'הימנעות', 'התמדה', 'חרדה'], intentPhrases: ['צעדים קטנים לפעולה', 'להתחיל בקטן', 'טופס לפעולה יעילה'] },
  { stageNumber: 5, worksheetNumberInStage: 3, title: 'חשיפה הדרגתית', description: 'בניית מדרג חשיפה מדורג למצבי פחד.', therapeuticGoal: 'להתמודד עם פחדים באופן הדרגתי ובטוח.', whenToUse: 'כשיש פחדים והימנעות שצריך לפרק לשלבים.', clinicalKeywords: ['חשיפה הדרגתית', 'פחדים', 'חרדה', 'צעדים קטנים'], intentPhrases: ['חשיפה הדרגתית', 'מדרג חשיפה', 'טופס לחרדה למתבגר'] },
  { stageNumber: 5, worksheetNumberInStage: 4, title: 'פעולה יעילה', description: 'בחירת פעולה שמקדמת מטרה גם תחת לחץ.', therapeuticGoal: 'לחזק תגובות יעילות במקום תגובות אימפולסיביות.', whenToUse: 'כשצריך לבחור תגובה מעשית בתוך קושי רגשי.', clinicalKeywords: ['פעולה יעילה', 'ויסות רגשי', 'לחץ', 'התמדה'], intentPhrases: ['פעולה יעילה', 'איך להגיב נכון', 'טופס CBT למתבגרים'] },
  { stageNumber: 5, worksheetNumberInStage: 5, title: 'התמדה ומעקב', description: 'מעקב שגרתי אחר יישום צעדים והתקדמות.', therapeuticGoal: 'לחזק התמדה ולמידה מתוך מעקב.', whenToUse: 'כשצריך לשמור רצף תרגול לאורך זמן.', clinicalKeywords: ['התמדה', 'מעקב', 'תוכנית אישית', 'פעולה יעילה'], intentPhrases: ['התמדה ומעקב', 'מעקב שבועי', 'איך לשמור התמדה'] },

  { stageNumber: 6, worksheetNumberInStage: 1, title: 'מה למדתי על עצמי?', description: 'סיכום תובנות אישיות מהתהליך.', therapeuticGoal: 'לחזק זהות מתמודדת והבנה עצמית.', whenToUse: 'בסיום שלב או נקודת סיכום משמעותית.', clinicalKeywords: ['תוכנית אישית', 'ויסות רגשי', 'התמדה', 'CBT בעברית'], intentPhrases: ['מה למדתי על עצמי', 'סיכום תהליך', 'טופס סיכום למתבגר'] },
  { stageNumber: 6, worksheetNumberInStage: 2, title: 'בדיקה שבועית', description: 'מעקב שבועי אחר הצלחות, קשיים ומה עזר.', therapeuticGoal: 'לשמור רצף טיפולי ויציבות בתרגול.', whenToUse: 'כשרוצים לבנות שגרה שבועית קבועה.', clinicalKeywords: ['בדיקה שבועית', 'התמדה', 'תוכנית אישית', 'ויסות רגשי'], intentPhrases: ['בדיקה שבועית', 'מעקב שבועי', 'טופס שבועי CBT'] },
  { stageNumber: 6, worksheetNumberInStage: 3, title: 'מחזק/ת את עצמי', description: 'זיהוי כוחות והרגלים שמחזקים אותי.', therapeuticGoal: 'לבנות חוסן פנימי והמשכיות.', whenToUse: 'כשצריך חיזוק ביטחון עצמי ומוטיבציה.', clinicalKeywords: ['חיזוק עצמי', 'התמדה', 'ויסות רגשי', 'רגשות חזקים'], intentPhrases: ['מחזק את עצמי', 'חיזוק עצמי למתבגר', 'טופס כוחות'] },
  { stageNumber: 6, worksheetNumberInStage: 4, title: 'כשקשה לי — מה עוזר לי?', description: 'תוכנית התמודדות לרגעים קשים ומצבי עומס.', therapeuticGoal: 'לבנות תוכנית ברורה לזמני קושי.', whenToUse: 'כשיש נפילות, הצפה או קושי בוויסות רגשי.', clinicalKeywords: ['ויסות רגשי', 'רגשות חזקים', 'תוכנית אישית', 'לחץ'], intentPhrases: ['כשקשה לי מה עוזר לי', 'מה עוזר לי ברגע קשה', 'נער עם קושי לווסת רגשות'] },
  { stageNumber: 6, worksheetNumberInStage: 5, title: 'כרטיס הדרך שלי', description: 'כרטיס אישי מקוצר עם צעדי התמודדות מרכזיים.', therapeuticGoal: 'לספק עוגן קצר להמשך עצמי אחרי התהליך.', whenToUse: 'בסיכום תהליך או כהכנה להמשך עצמאי.', clinicalKeywords: ['תוכנית אישית', 'התמדה', 'פעולה יעילה', 'CBT בעברית'], intentPhrases: ['כרטיס הדרך שלי', 'תוכנית אישית מקוצרת', 'טופס סיכום אישי'] },
]);

const STAGE_COMBINED_DEFINITIONS = Object.freeze([
  {
    stageNumber: 1,
    title: 'שלב 1 — קובץ מאוחד',
    description: 'קובץ PDF מאוחד של שלב 1 הכולל את כל 5 הטפסים (1.1–1.5).',
    therapeuticGoal: 'אספקת כל טפסי שלב 1 יחד לבקשה מרוכזת.',
    whenToUse: 'להציע כשמבקשים את כל שלב 1 או את חמשת הטפסים יחד.',
    clinicalKeywords: ['שלב 1', 'קובץ מאוחד', 'כל שלב 1', '5 טפסים', 'hebrew adolescent cbt core stage 1 combined'],
    intentPhrases: ['שלח לי את כל שלב 1', 'תן לי את הקובץ המאוחד של שלב 1', 'שלח את 5 הטפסים של שלב 1 יחד'],
  },
  {
    stageNumber: 2,
    title: 'שלב 2 — קובץ מאוחד',
    description: 'קובץ PDF מאוחד של שלב 2 הכולל את כל 5 הטפסים (2.1–2.5).',
    therapeuticGoal: 'אספקת כל טפסי שלב 2 יחד לבקשה מרוכזת.',
    whenToUse: 'להציע כשמבקשים את כל שלב 2 או קובץ מאוחד לשלב.',
    clinicalKeywords: ['שלב 2', 'קובץ מאוחד', 'כל שלב 2', '5 טפסים', 'adolescents_cbt_core_he stage combined pdf'],
    intentPhrases: ['שלח לי את כל שלב 2', 'אני רוצה את שלב 2 בקובץ אחד', 'תן לי את הקובץ המאוחד של שלב 2'],
  },
  {
    stageNumber: 3,
    title: 'שלב 3 — קובץ מאוחד',
    description: 'קובץ PDF מאוחד של שלב 3 הכולל את כל 5 הטפסים (3.1–3.5).',
    therapeuticGoal: 'אספקת כל טפסי שלב 3 יחד לבקשה מרוכזת.',
    whenToUse: 'להציע כשמבקשים את כל שלב 3 המלא או קובץ מאוחד.',
    clinicalKeywords: ['שלב 3', 'קובץ מאוחד', 'כל שלב 3', '5 טפסים', 'stage 3 combined'],
    intentPhrases: ['שלח לי את שלב 3 המלא', 'תן לי את הקובץ המאוחד של שלב 3', 'אני רוצה את כל 5 הטפסים של שלב 3'],
  },
  {
    stageNumber: 4,
    title: 'שלב 4 — קובץ מאוחד',
    description: 'קובץ PDF מאוחד של שלב 4 הכולל את כל 5 הטפסים (4.1–4.5).',
    therapeuticGoal: 'אספקת כל טפסי שלב 4 יחד לבקשה מרוכזת.',
    whenToUse: 'להציע כשמבקשים שלב מלא במקום טופס ממוקד.',
    clinicalKeywords: ['שלב 4', 'קובץ מאוחד', 'כל שלב 4', '5 טפסים', 'שלב של פעולה יעילה'],
    intentPhrases: ['שלח את 5 הטפסים של שלב 4 יחד', 'תן לי את הקובץ המאוחד של שלב 4', 'אני רוצה את כל שלב 4'],
  },
  {
    stageNumber: 5,
    title: 'שלב 5 — קובץ מאוחד',
    description: 'קובץ PDF מאוחד של שלב 5 הכולל את כל 5 הטפסים (5.1–5.5).',
    therapeuticGoal: 'אספקת כל טפסי שלב 5 יחד לבקשה מרוכזת.',
    whenToUse: 'להציע כשמבקשים שלב של הימנעות, צעדים קטנים או חשיפה הדרגתית.',
    clinicalKeywords: ['שלב 5', 'קובץ מאוחד', 'כל שלב 5', 'חשיפה הדרגתית', '5 טפסים'],
    intentPhrases: ['אני רוצה את שלב 5 בקובץ אחד', 'תן לי את שלב 5 המלא', 'אני רוצה את כל 5 הטפסים של שלב 5'],
  },
  {
    stageNumber: 6,
    title: 'שלב 6 — קובץ מאוחד',
    description: 'קובץ PDF מאוחד של שלב 6 הכולל את כל 5 הטפסים (6.1–6.5).',
    therapeuticGoal: 'אספקת כל טפסי שלב 6 יחד לבקשה מרוכזת.',
    whenToUse: 'להציע כשמבקשים שלב מלא של חיזוק ומעקב או תוכנית אישית.',
    clinicalKeywords: ['שלב 6', 'קובץ מאוחד', 'כל שלב 6', 'תוכנית אישית', 'שלב של ויסות רגשי'],
    intentPhrases: ['תן לי את שלב 6 המלא', 'שלח לי את שלב 6 בקובץ אחד', 'אני רוצה קובץ מאוחד לשלב של תוכנית אישית'],
  },
]);

function getIndividualFileUrl(stageNumber, worksheetNumberInStage) {
  return `${STAGE_BASE_PATHS[stageNumber]}/adolescents_cbt_core_he_${stageNumber}_${worksheetNumberInStage}.pdf`;
}

function getStageCombinedFileUrl(stageNumber) {
  return `${STAGE_BASE_PATHS[stageNumber]}/${STAGE_COMBINED_FILE_NAMES[stageNumber]}`;
}

const FORMS_ADOLESCENTS_CBT_CORE_HE_INDIVIDUAL_UNFROZEN = INDIVIDUAL_WORKSHEET_DEFINITIONS.map((definition, index) => {
  const stage = definition.stageNumber;
  const worksheet = definition.worksheetNumberInStage;
  const formNumber = `${stage}.${worksheet}`;
  const fileUrl = getIndividualFileUrl(stage, worksheet);
  const fileName = fileUrl.split('/').pop();

  return Object.freeze({
    id: `adolescents-cbt-core-he-${stage}-${worksheet}`,
    slug: `adolescents-cbt-core-he-${stage}-${worksheet}`,
    parentSeriesId: ADOLESCENTS_CBT_CORE_HE_SERIES_ID,
    type: 'individual_worksheet',
    language: 'he',
    audience: 'adolescents',
    category: 'adolescents_cbt_core',
    secondaryCategories: STAGE_SECONDARY_CATEGORIES[stage],
    title: definition.title,
    description: definition.description,
    formNumber,
    worksheetNumber: formNumber,
    displayNumber: formNumber,
    stageNumber: stage,
    moduleNumber: stage,
    stageTitle: STAGE_TITLES_HE[stage],
    pageNumberInWorkbook: index + 1,
    fileUrl,
    therapeuticGoal: definition.therapeuticGoal,
    whenToUse: definition.whenToUse,
    clinicalKeywords: Object.freeze(Array.from(new Set([
      ...definition.clinicalKeywords,
      `שלב ${stage}`,
      `טופס ${formNumber}`,
      'גיל 12-18',
      'מתבגרים',
      'עברית',
    ]))),
    intentPhrases: Object.freeze(Array.from(new Set([
      ...definition.intentPhrases,
      `שלח טופס ${formNumber}`,
      `תן לי טופס ${formNumber}`,
      `form ${formNumber}`,
    ]))),
    aiMatchingSummary: `${definition.title}. ${definition.therapeuticGoal} ${definition.whenToUse}`,
    notFor: SHARED_NOT_FOR,
    approved: true,
    available_languages: Object.freeze(['he']),
    variant_language: 'he',
    source_language: 'he',
    is_language_variant: false,
    logical_form_id: `adolescents_cbt_core_he_${stage}_${worksheet}`,
    variant_group_id: `adolescents_cbt_core_he_${stage}_${worksheet}`,
    sibling_variant_ids: Object.freeze([]),
    languages: Object.freeze({
      he: Object.freeze({
        title: definition.title,
        description: definition.description,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: fileName,
        rtl: true,
      }),
    }),
  });
});

export const FORMS_ADOLESCENTS_CBT_CORE_HE_INDIVIDUAL = Object.freeze(FORMS_ADOLESCENTS_CBT_CORE_HE_INDIVIDUAL_UNFROZEN);

export const FORMS_ADOLESCENTS_CBT_CORE_HE_STAGE_COMBINED = Object.freeze(
  STAGE_COMBINED_DEFINITIONS.map((definition) => {
    const stage = definition.stageNumber;
    const fileUrl = getStageCombinedFileUrl(stage);
    const fileName = fileUrl.split('/').pop();

    return Object.freeze({
      id: `adolescents-cbt-core-he-stage-${stage}-combined`,
      slug: `adolescents-cbt-core-he-stage-${stage}-combined`,
      parentSeriesId: ADOLESCENTS_CBT_CORE_HE_SERIES_ID,
      type: 'stage_combined_pdf',
      language: 'he',
      audience: 'adolescents',
      category: 'adolescents_cbt_core',
      secondaryCategories: STAGE_SECONDARY_CATEGORIES[stage],
      title: definition.title,
      description: `${definition.description} הקובץ מיועד לבקשות של שלב מלא ואינו מחליף טופס ממוקד לצורך קליני ספציפי.`,
      formNumber: `stage-${stage}-combined`,
      worksheetNumber: `stage-${stage}-combined`,
      stageNumber: stage,
      moduleNumber: stage,
      stageTitle: STAGE_TITLES_HE[stage],
      fileUrl,
      therapeuticGoal: definition.therapeuticGoal,
      whenToUse: definition.whenToUse,
      clinicalKeywords: Object.freeze(Array.from(new Set([
        ...definition.clinicalKeywords,
        `שלב ${stage} מלא`,
        `כל שלב ${stage}`,
        'קובץ מאוחד',
        'combined stage pdf',
      ]))),
      intentPhrases: Object.freeze(Array.from(new Set([
        ...definition.intentPhrases,
        `שלח לי את כל שלב ${stage}`,
        `שלח לי את שלב ${stage} בקובץ אחד`,
        `hebrew adolescent cbt core stage ${stage} combined`,
      ]))),
      aiMatchingSummary: `קובץ מאוחד של שלב ${stage} הכולל את חמשת הטפסים של השלב לבקשה מרוכזת של שלב מלא.`,
      notFor: Object.freeze([...SHARED_NOT_FOR, 'requests that ask for one specific targeted worksheet']),
      approved: true,
      available_languages: Object.freeze(['he']),
      variant_language: 'he',
      source_language: 'he',
      is_language_variant: false,
      logical_form_id: `adolescents_cbt_core_he_stage_${stage}_combined`,
      variant_group_id: `adolescents_cbt_core_he_stage_${stage}_combined`,
      sibling_variant_ids: Object.freeze([]),
      languages: Object.freeze({
        he: Object.freeze({
          title: definition.title,
          description: `${definition.description} כולל 5 טפסים של שלב ${stage}.`,
          file_url: fileUrl,
          file_type: 'pdf',
          file_name: fileName,
          rtl: true,
        }),
      }),
    });
  })
);

export const FORMS_ADOLESCENTS_CBT_CORE_HE = Object.freeze([
  ...FORMS_ADOLESCENTS_CBT_CORE_HE_STAGE_COMBINED,
  ...FORMS_ADOLESCENTS_CBT_CORE_HE_INDIVIDUAL,
]);

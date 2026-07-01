import {
  FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL,
} from './forms.children.cbt-core.en.js';

const CHILDREN_CBT_CORE_HE_SERIES_ID = 'children-cbt-core-he';
const CHILDREN_CBT_CORE_HE_BASE_URL = '/forms/children/he/cbt-core';

const SHARED_SECONDARY_CATEGORIES = Object.freeze([
  'workbook_series',
  'emotional_regulation',
  'coping_tools',
  'thought_records',
  'reflection_journal',
  'weekly_practice',
]);

const SHARED_NOT_FOR = Object.freeze([
  'בקשות למתבגרים או למבוגרים',
  'מצב שפה באנגלית',
  'מצב שפה שאינו עברית',
  'התערבות במשבר',
  'מצבי חירום נפשיים',
  'עיבוד טראומה ללא ליווי קליני',
  'תוכן של פגיעה עצמית או אובדנות',
]);

const MODULE_TITLES_HE = Object.freeze({
  1: 'שלב 1 — להבין מה קורה לי עכשיו',
  2: 'שלב 2 — לזהות מחשבות',
  3: 'שלב 3 — צעדים קטנים ואומץ',
  4: 'שלב 4 — ויסות והרגעה',
  5: 'שלב 5 — תוכנית אישית וכלי רגיעה',
});

const MODULE_TOPIC_HINTS_HE = Object.freeze({
  1: Object.freeze(['זיהוי רגשות', 'תחושות גוף', 'עוצמת רגש', 'זיהוי סימנים מוקדמים']),
  2: Object.freeze(['זיהוי מחשבות', 'מחשבה או עובדה', 'מחשבות מלחיצות', 'מחשבה מועילה']),
  3: Object.freeze(['התנהגות', 'צעדים קטנים', 'אומץ', 'סולם התמודדות']),
  4: Object.freeze(['ויסות רגשי', 'הרגעה', 'נשימה', 'קרקוע']),
  5: Object.freeze(['תוכנית רגיעה', 'כלי הרגעה', 'תוכנית אישית', 'התמודדות בעומס']),
});

const WORKSHEET_TOPIC_HINTS_HE = Object.freeze({
  '1.1': Object.freeze(['זיהוי רגשות', 'איך אני מרגיש', 'ילד מתקשה לזהות רגשות']),
  '1.2': Object.freeze(['תחושות גוף', 'מה הגוף אומר לי', 'סימני לחץ בגוף']),
  '1.3': Object.freeze(['עוצמת רגש', 'מד רגשות', 'כמה חזק הרגש']),
  '1.4': Object.freeze(['סימנים מוקדמים', 'ילד עם פחדים', 'זיהוי מוקדם של לחץ']),
  '1.5': Object.freeze(['רגשות משתנים', 'תקווה', 'גמישות רגשית']),
  '1.6': Object.freeze(['כרטיס רגשות', 'משפטים מחזקים', 'כלי עזרה אישי']),

  '2.1': Object.freeze(['זיהוי מחשבות', 'מה המחשבה שלי אומרת', 'מחשבות מלחיצות']),
  '2.2': Object.freeze(['מחשבה או עובדה', 'בדיקת מחשבות', 'פירוש מול מציאות']),
  '2.3': Object.freeze(['מחשבות דאגה', 'חרדה אצל ילד', 'דאגות']),
  '2.4': Object.freeze(['החלפת מחשבה', 'מחשבה מועילה', 'ניסוח מחשבה חלופית']),
  '2.5': Object.freeze(['בלש מחשבות', 'בדיקת הנחות', 'ראיות']),
  '2.6': Object.freeze(['מחשבה שעוזרת לי', 'מחשבה מקדמת', 'בחירת מחשבה תומכת']),

  '3.1': Object.freeze(['כשקשה לי', 'בחירת צעד', 'התנהגות במצבי קושי']),
  '3.2': Object.freeze(['צעד אמיץ קטן', 'התמודדות עם הימנעות', 'להתחיל בקטן']),
  '3.3': Object.freeze(['סולם אומץ', 'חשיפה מדורגת לילדים', 'פחדים']),
  '3.4': Object.freeze(['לפני ואחרי', 'ניסיון והתבוננות', 'למידה מחוויה']),
  '3.5': Object.freeze(['תוכנית צעד קטן', 'תוכנית פעולה', 'יעד יומי']),
  '3.6': Object.freeze(['מה עזר לי', 'חיזוק הצלחות', 'מעקב התקדמות']),

  '4.1': Object.freeze(['כפתור עצירה', 'עצירה והרגעה', 'וויסות רגשי']),
  '4.2': Object.freeze(['כלי הרגעה', 'מה מרגיע אותי', 'התמודדות עם לחץ']),
  '4.3': Object.freeze(['נשימות', 'תרגיל נשימה', 'הרגעה נשימתית']),
  '4.4': Object.freeze(['קרקוע', 'עוגנים', 'להירגע כאן ועכשיו']),
  '4.5': Object.freeze(['מקום בטוח', 'דמיון מרגיע', 'הרגעה מנטלית']),
  '4.6': Object.freeze(['תוכנית רגיעה קצרה', 'סדר פעולות להרגעה', 'ילד שמתקשה להירגע']),

  '5.1': Object.freeze(['תוכנית רגיעה אישית', 'שלח לי טופס לוויסות רגשי', 'תוכנית לילד']),
  '5.2': Object.freeze(['ערכת הרגעה', 'כלים לרגעי עומס', 'כישורי התמודדות']),
  '5.3': Object.freeze(['מה כשאני מוצף', 'תוכנית לעומס רגשי', 'וויסות רגשי לילדים']),
  '5.4': Object.freeze(['מד רגשות אישי', 'מעקב עוצמת רגש', 'זיהוי שינוי']),
  '5.5': Object.freeze(['תוכנית המשך', 'שימור כלים', 'תזכורות להרגעה']),
  '5.6': Object.freeze(['כרטיס תוכנית אישית', 'סיכום כלים', 'תוכנית אישית לילד']),
});

const COMMON_INTENT_PHRASES_HE = Object.freeze([
  'אני צריך טופס CBT לילד בעברית',
  'שלח לי טופס לילדה',
  'שלח לי טופס cbt בעברית לילדים',
]);

const WORKSHEET_COPY_HE = Object.freeze({
  '1.1': Object.freeze({
    title: 'מה עובר עליי עכשיו?',
    description: 'זיהוי ומיפוי של מה שאני מרגיש/ה עכשיו בצורה ידידותית לילדים.',
    therapeuticGoal: 'לעזור לילד/ה לזהות ולתת שם לרגש הנוכחי.',
    whenToUse: 'מתאים כשילד/ה מתקשה לזהות מה הוא/היא מרגיש/ה כרגע.',
    aiMatchingSummary: 'ממפה את הרגש הנוכחי ומה קורה עכשיו בשפה פשוטה לילדים.',
  }),
  '1.2': Object.freeze({
    title: 'הגוף שלי שולח לי סימנים',
    description: 'חיבור בין תחושות גוף לבין רגשות כדי לזהות סימני לחץ מוקדמים.',
    therapeuticGoal: 'לחזק מודעות לסימני גוף שמופיעים עם רגשות חזקים.',
    whenToUse: 'כשיש מתח, דופק מהיר, כאב בטן או תחושות גוף שמבלבלות את הילד/ה.',
    aiMatchingSummary: 'עוזר לילד/ה לזהות איפה מרגישים בגוף ומה זה מספר על הרגש.',
  }),
  '1.3': Object.freeze({
    title: 'מה הפעיל אותי?',
    description: 'זיהוי טריגרים, מצבים ומחשבות שהפעילו קושי רגשי.',
    therapeuticGoal: 'להבין מה מפעיל לחץ או פחד ולחזק תחושת שליטה.',
    whenToUse: 'כשצריך להבין מה גרם להתפרצות רגשית, לחץ או פחד.',
    aiMatchingSummary: 'מזהה טריגרים מרכזיים ומחבר ביניהם לבין התגובה הרגשית.',
  }),
  '1.4': Object.freeze({
    title: 'מחשבה–רגש–פעולה',
    description: 'מיפוי הקשר בין מחשבות, רגשות והתנהגות במודל CBT לילדים.',
    therapeuticGoal: 'ללמד את רצף מחשבה–רגש–פעולה בצורה פשוטה ויישומית.',
    whenToUse: 'כשצריך להבין איך מחשבות משפיעות על הרגש ועל ההתנהגות.',
    aiMatchingSummary: 'מארגן לילד/ה את הקשר בין מחשבה, רגש ופעולה בדף אחד.',
  }),
  '1.5': Object.freeze({
    title: 'המפה האישית שלי',
    description: 'מפה אישית של כוחות, תמיכה וכלים שעוזרים לי ברגעי קושי.',
    therapeuticGoal: 'לחזק מסוגלות ולבנות בסיס אישי להמשך התהליך.',
    whenToUse: 'מתאים בתחילת התהליך או כשצריך לחזק תחושת ביטחון.',
    aiMatchingSummary: 'יוצר מפה אישית של מה עוזר לי, מי תומך בי ומה הכוחות שלי.',
  }),
  '1.6': Object.freeze({
    title: 'כרטיס הרגש שלי',
    description: 'כרטיס קצר שמרכז רגש, סימני גוף, כלי עזרה ומשפט מחזק.',
    therapeuticGoal: 'לבנות עוגן קצר לשימוש יומיומי במצבי עומס רגשי.',
    whenToUse: 'כשמחפשים כלי קצר ומעשי שילד/ה יכול/ה לקחת איתו/ה ליום-יום.',
    aiMatchingSummary: 'מייצר כרטיס אישי קצר לזיהוי רגש ובחירת תגובה מרגיעה.',
  }),
  '2.1': Object.freeze({
    title: 'מה המחשבה שלי אומרת?',
    description: 'זיהוי המחשבה שעוברת בראש ובדיקה אם היא עוזרת לי או מלחיצה אותי.',
    therapeuticGoal: 'לעזור לילד/ה לשים לב למחשבות בזמן אמת.',
    whenToUse: 'כשילד/ה מוצף/ת במחשבות שליליות או מלחיצות.',
    aiMatchingSummary: 'מסייע לזהות את המשפט הפנימי ולבחור כיוון מחשבה מועיל יותר.',
  }),
  '2.2': Object.freeze({
    title: 'מחשבה או עובדה?',
    description: 'הבחנה בין מה שבאמת קרה לבין מה שהמוח מנחש או מפחד.',
    therapeuticGoal: 'לחזק הבחנה בין פרשנות לבין מציאות.',
    whenToUse: 'כשיש בלבול בין פחדים לבין עובדות.',
    aiMatchingSummary: 'מלמד להבדיל בין עובדות לבין ניחושים שמגבירים לחץ.',
  }),
  '2.3': Object.freeze({
    title: 'מחשבות דאגה',
    description: 'זיהוי מחשבות דאגה ובחירת דרכי התמודדות פשוטות לילדים.',
    therapeuticGoal: 'להפחית הצפה של דאגות ולבנות תגובה מאוזנת.',
    whenToUse: 'כשילד/ה עסוק/ה בדאגות לגבי טעויות, בית ספר או מצבים חברתיים.',
    aiMatchingSummary: 'מזהה מה הדאגה אומרת ומה עוזר לילד/ה להרגיע אותה.',
  }),
  '2.4': Object.freeze({
    title: 'מחליפים למחשבה מועילה',
    description: 'תרגול החלפה של מחשבה לא מועילה במחשבה תומכת ומקדמת.',
    therapeuticGoal: 'לפתח גמישות מחשבתית ולעודד דיבור פנימי תומך.',
    whenToUse: 'כשילד/ה תקוע/ה במחשבות כמו "אני לא יכול/ה" או "אני אכשל".',
    aiMatchingSummary: 'מתרגל מעבר ממחשבה מכבידה למחשבה מועילה שאפשר לפעול איתה.',
  }),
  '2.5': Object.freeze({
    title: 'בלש המחשבות שלי',
    description: 'בדיקת רמזים וראיות לפני שמאמינים לכל מחשבה שעולה.',
    therapeuticGoal: 'לחזק חשיבה חוקרת לפני קבלת מסקנה מלחיצה.',
    whenToUse: 'כשילד/ה צריך/ה לבדוק הנחות ולברר מה באמת ידוע.',
    aiMatchingSummary: 'מפעיל חשיבה בלשית כדי לבדוק מה עובדה ומה פרשנות.',
  }),
  '2.6': Object.freeze({
    title: 'מחשבה שעוזרת לי',
    description: 'בניית משפט מחשבה אישי שעוזר לי להתקדם לצעד הבא.',
    therapeuticGoal: 'לבנות משפט פנימי תומך לרגעי קושי.',
    whenToUse: 'כשצריך מחשבה חלופית קצרה לפני פעולה.',
    aiMatchingSummary: 'מנסח מחשבה אישית שעוזרת לילד/ה להמשיך קדימה.',
  }),
  '3.1': Object.freeze({
    title: 'מה אני עושה כשקשה לי?',
    description: 'זיהוי תגובות ראשונות לקושי ובחירת צעד עוזר.',
    therapeuticGoal: 'לעבור מתגובה אוטומטית לבחירה התנהגותית מועילה.',
    whenToUse: 'כשילד/ה נתקע/ת, נמנע/ת או מוצף/ת במצבים מאתגרים.',
    aiMatchingSummary: 'ממפה תגובה ראשונית לקושי ומציע צעד קטן שאפשר לבצע.',
  }),
  '3.2': Object.freeze({
    title: 'צעד אמיץ קטן',
    description: 'בחירת צעד אמיץ קטן שאפשר לבצע כבר היום.',
    therapeuticGoal: 'להקטין הימנעות ולחזק תחושת מסוגלות.',
    whenToUse: 'כשיש פחד להתחיל משימה או להתמודד עם מצב מאיים.',
    aiMatchingSummary: 'עוזר לבחור צעד קטן ומדויק שמקדם התמודדות.',
  }),
  '3.3': Object.freeze({
    title: 'סולם האומץ שלי',
    description: 'בניית סולם צעדים מדורג לתרגול אומץ והתמודדות הדרגתית.',
    therapeuticGoal: 'לייצר רצף התמודדות בטוח ומדורג.',
    whenToUse: 'כשצריך לפרק פחד גדול לשלבים קטנים וישימים.',
    aiMatchingSummary: 'מארגן תרגול חשיפה מדורג בסולם ברור לילדים.',
  }),
  '3.4': Object.freeze({
    title: 'לפני שאני מנסה',
    description: 'הכנה לפני ניסיון: מה יעזור לי, מי יתמוך בי ומה הצעד הראשון.',
    therapeuticGoal: 'להגדיל מוכנות לפעולה ולהפחית חשש לפני התחלה.',
    whenToUse: 'לפני ניסיון של פעולה חדשה או מאתגרת.',
    aiMatchingSummary: 'מסדר הכנה מקדימה לצעד אמיץ לפני ביצוע.',
  }),
  '3.5': Object.freeze({
    title: 'אחרי שניסיתי',
    description: 'התבוננות עדינה במה שניסיתי, מה עבד ומה למדתי.',
    therapeuticGoal: 'לחזק למידה מהתנסות ולבנות אמון ביכולת.',
    whenToUse: 'אחרי ניסיון של צעד קטן או פעולה אמיצה.',
    aiMatchingSummary: 'מעודד הפקת למידה וחיזוק הצלחות אחרי ניסיון.',
  }),
  '3.6': Object.freeze({
    title: 'תוכנית הצעד הקטן שלי',
    description: 'בניית תוכנית קצרה לצעד הבא: מטרה, תמיכה ותזמון.',
    therapeuticGoal: 'לתרגם תובנות לתוכנית פעולה מעשית.',
    whenToUse: 'כשצריך לעבור מתכנון כללי לצעד ברור לביצוע.',
    aiMatchingSummary: 'בונה תוכנית פעולה קצרה ומדויקת לצעד הבא.',
  }),
  '4.1': Object.freeze({
    title: 'כפתור עצירה',
    description: 'תרגול עצירה קצרה לפני תגובה אוטומטית במצב רגשי חזק.',
    therapeuticGoal: 'לחזק שליטה עצמית ברגעי הצפה.',
    whenToUse: 'כשיש תגובה מהירה של לחץ, כעס או פחד.',
    aiMatchingSummary: 'מלמד עצירה קצרה שמאפשרת בחירה רגועה יותר.',
  }),
  '4.2': Object.freeze({
    title: 'כלי ההרגעה שלי',
    description: 'בחירת כלים אישיים שמרגיעים אותי ועוזרים לי להסתדר.',
    therapeuticGoal: 'לזהות ולהטמיע כלים יעילים לוויסות רגשי.',
    whenToUse: 'כשמחפשים מה עוזר לילד/ה להירגע בפועל.',
    aiMatchingSummary: 'מרכז רשימת כלי הרגעה אישיים זמינים לשימוש מיידי.',
  }),
  '4.3': Object.freeze({
    title: 'נשימות שעוזרות לי',
    description: 'תרגול נשימה פשוט להפחתת עומס ולהרגעה גופנית.',
    therapeuticGoal: 'להקנות כלי נשימה קצר לוויסות רגשי.',
    whenToUse: 'כשיש מתח גופני, לחץ או קושי להירגע.',
    aiMatchingSummary: 'מתרגל נשימות קצרות וברורות להורדת מתח.',
  }),
  '4.4': Object.freeze({
    title: 'קרקוע כאן ועכשיו',
    description: 'תרגיל קרקוע שמחזיר אותי לרגע הנוכחי במצב הצפה.',
    therapeuticGoal: 'לייצב קשב ותחושת ביטחון ברגעי עומס.',
    whenToUse: 'כשילד/ה מרגיש/ה מוצף/ת או "לא כאן".',
    aiMatchingSummary: 'מספק תרגיל קרקוע מעשי לחזרה לכאן ועכשיו.',
  }),
  '4.5': Object.freeze({
    title: 'המקום הבטוח שלי',
    description: 'יצירת דימוי של מקום בטוח כדי להרגיע את הגוף והחשיבה.',
    therapeuticGoal: 'לפתח עוגן דמיוני שמאפשר הרגעה עצמית.',
    whenToUse: 'כשצריך כלי רגשי מרגיע למצבי פחד או עומס.',
    aiMatchingSummary: 'מוביל לבניית דימוי בטוח ומרגיע לשימוש יומיומי.',
  }),
  '4.6': Object.freeze({
    title: 'תוכנית הרגעה קצרה',
    description: 'רצף פעולות קצר ומותאם אישית להרגעה במצבי לחץ.',
    therapeuticGoal: 'לבנות סדר פעולות ברור לרגעים קשים.',
    whenToUse: 'כשצריך תוכנית קצרה שאפשר להפעיל מיד.',
    aiMatchingSummary: 'מייצר רצף הרגעה קצר ליישום מיידי במצבי עומס.',
  }),
  '5.1': Object.freeze({
    title: 'תוכנית רגיעה אישית',
    description: 'בניית תוכנית אישית לוויסות רגשי לפי הצרכים שלי.',
    therapeuticGoal: 'לאחד כלים שנלמדו לתוכנית אישית יציבה.',
    whenToUse: 'כשמבקשים טופס לוויסות רגשי לילדים בעברית.',
    aiMatchingSummary: 'מרכז תוכנית אישית לוויסות רגשי ולשמירה על יציבות.',
  }),
  '5.2': Object.freeze({
    title: 'ערכת ההרגעה שלי',
    description: 'רשימת כלים אישיים לרגעי עומס, פחד או מתח.',
    therapeuticGoal: 'להכין מראש כלים פרקטיים למצבי קושי.',
    whenToUse: 'כשילד/ה צריך/ה סט כלים מוכן לרגעי עומס.',
    aiMatchingSummary: 'בונה ערכת כלים אישית לשימוש ברגעים קשים.',
  }),
  '5.3': Object.freeze({
    title: 'מה עוזר לי כשאני מוצף/ת?',
    description: 'בחירה מהירה של צעדי עזרה עצמית כשיש הצפה רגשית.',
    therapeuticGoal: 'לחזק בחירה מהירה של תגובה מווסתת בזמן אמת.',
    whenToUse: 'כשצריך תוכנית פעולה למצב של עומס רגשי.',
    aiMatchingSummary: 'מסייע לבחור במהירות מה עוזר כשעולה הצפה.',
  }),
  '5.4': Object.freeze({
    title: 'מד הרגשות האישי שלי',
    description: 'מעקב אחר עוצמת רגש כדי לזהות שינוי והתקדמות.',
    therapeuticGoal: 'לחזק ניטור עצמי של עוצמת רגשות.',
    whenToUse: 'כשרוצים לעקוב אחר שינויים בעוצמת הרגש לאורך זמן.',
    aiMatchingSummary: 'מודד עוצמת רגש ועוזר לזהות מה השתפר ומה עדיין קשה.',
  }),
  '5.5': Object.freeze({
    title: 'תוכנית ההמשך שלי',
    description: 'תכנון המשך לשימור הכלים וההתמדה אחרי התרגול.',
    therapeuticGoal: 'לשמר הרגלים וכלים גם לאחר סיום שלב.',
    whenToUse: 'כשמתכננים איך להמשיך לתרגל ולשמור יציבות.',
    aiMatchingSummary: 'בונה תוכנית המשך לשימור הכלים וההתקדמות.',
  }),
  '5.6': Object.freeze({
    title: 'כרטיס התוכנית האישית שלי',
    description: 'כרטיס מסכם קצר של הכלים המרכזיים שלי להתמודדות.',
    therapeuticGoal: 'לרכז את עיקרי התוכנית האישית בכרטיס נגיש.',
    whenToUse: 'בסיכום שלב או כשהילד/ה צריך/ה תזכורת קצרה וניידת.',
    aiMatchingSummary: 'מסכם את תוכנית ההתמודדות האישית בכרטיס קצר לשימוש יומי.',
  }),
});

function pad2(value) {
  return String(value).padStart(2, '0');
}

function toNumericFormNumber(formNumber) {
  const [moduleNumberRaw, worksheetNumberRaw] = String(formNumber || '').split('.');
  return {
    moduleNumber: Number(moduleNumberRaw),
    worksheetNumberInModule: Number(worksheetNumberRaw),
  };
}

function toPublicWorksheetPath(formNumber) {
  const { moduleNumber } = toNumericFormNumber(formNumber);
  return `${CHILDREN_CBT_CORE_HE_BASE_URL}/stage-${pad2(moduleNumber)}/children_cbt_core_he_${formNumber}.pdf`;
}

function toHebrewFormIdentifier(formNumber) {
  return `children_cbt_core_he_${String(formNumber).replace('.', '_')}`;
}

const FORMS_CHILDREN_CBT_CORE_HE_INDIVIDUAL_UNFROZEN = FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL.map((englishForm) => {
  const formNumber = String(englishForm.formNumber || englishForm.worksheetNumber || '');
  const { moduleNumber, worksheetNumberInModule } = toNumericFormNumber(formNumber);
  const worksheetFileName = `children_cbt_core_he_${formNumber}.pdf`;
  const fileUrl = toPublicWorksheetPath(formNumber);
  const worksheetCopyHe = WORKSHEET_COPY_HE[formNumber];
  const formTitleHe = worksheetCopyHe?.title || `טופס ${formNumber}`;
  const formDescriptionHe = worksheetCopyHe?.description || `דף עבודה CBT לילדים — טופס ${formNumber}.`;
  const therapeuticGoalHe = worksheetCopyHe?.therapeuticGoal || 'חיזוק מיומנויות CBT מותאמות לילדים.';
  const whenToUseHe = worksheetCopyHe?.whenToUse || 'מתאים לפי צורך קליני במסגרת CBT לילדים.';
  const aiMatchingSummaryHe = worksheetCopyHe?.aiMatchingSummary || 'טופס CBT לילדים בעברית.';
  const hebrewIdentifier = toHebrewFormIdentifier(formNumber);

  return Object.freeze({
    ...englishForm,
    id: `children-cbt-core-he-${moduleNumber}-${worksheetNumberInModule}`,
    slug: `children-cbt-core-he-${moduleNumber}-${worksheetNumberInModule}`,
    parentSeriesId: CHILDREN_CBT_CORE_HE_SERIES_ID,
    language: 'he',
    audience: 'children',
    category: 'children_cbt_core',
    secondaryCategories: SHARED_SECONDARY_CATEGORIES,
    title: formTitleHe,
    seriesHe: 'סדרת ליבה CBT לילדים',
    moduleHe: MODULE_TITLES_HE[moduleNumber],
    moduleTitle: MODULE_TITLES_HE[moduleNumber],
    stageTitle: MODULE_TITLES_HE[moduleNumber],
    fileUrl,
    description: formDescriptionHe,
    therapeuticGoal: therapeuticGoalHe,
    whenToUse: whenToUseHe,
    clinicalKeywords: Object.freeze(Array.from(new Set([
      ...(englishForm.clinicalKeywords || []),
      ...(WORKSHEET_TOPIC_HINTS_HE[formNumber] || []),
      ...MODULE_TOPIC_HINTS_HE[moduleNumber],
      'ילד עם פחדים',
      'ילדה עם מחשבות מלחיצות',
      'ילד שמתקשה לזהות רגשות',
      'טופס cbt לילדים בעברית',
      hebrewIdentifier,
    ]))),
    intentPhrases: Object.freeze(Array.from(new Set([
      ...(englishForm.intentPhrases || []),
      ...COMMON_INTENT_PHRASES_HE,
      `שלח לי טופס ממודול ${moduleNumber}`,
      `שלח לי טופס מהשלב ${moduleNumber}`,
      `שלח לי טופס ${formNumber}`,
      `טופס ${hebrewIdentifier}`,
      ...(WORKSHEET_TOPIC_HINTS_HE[formNumber] || []),
    ]))),
    aiMatchingSummary: aiMatchingSummaryHe,
    notFor: SHARED_NOT_FOR,
    safetyNotes: 'טופס CBT לילדים. אינו מיועד למצבי חירום או סכנת חיים.',
    approved: true,
    logical_form_id: `children_cbt_core_${pad2(moduleNumber)}_${pad2(worksheetNumberInModule)}`,
    variant_language: 'he',
    available_languages: Object.freeze(['he']),
    source_language: 'he',
    is_language_variant: true,
    variant_group_id: `children_cbt_core_${pad2(moduleNumber)}_${pad2(worksheetNumberInModule)}`,
    sibling_variant_ids: Object.freeze([]),
    languages: Object.freeze({
      he: Object.freeze({
        title: formTitleHe,
        description: formDescriptionHe,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: worksheetFileName,
        rtl: true,
      }),
    }),
  });
});

export const FORMS_CHILDREN_CBT_CORE_HE_INDIVIDUAL = Object.freeze(FORMS_CHILDREN_CBT_CORE_HE_INDIVIDUAL_UNFROZEN);

const MODULE_NUMBERS = Object.freeze([1, 2, 3, 4, 5]);

const FORMS_CHILDREN_CBT_CORE_HE_MODULE_PDFS_UNFROZEN = MODULE_NUMBERS.map((moduleNumber) => {
  const paddedModule = pad2(moduleNumber);
  const fileName = `children_cbt_core_he_module_${paddedModule}_combined.pdf`;
  const fileUrl = `${CHILDREN_CBT_CORE_HE_BASE_URL}/stage-${paddedModule}/${fileName}`;
  const title = `שלב ${moduleNumber} — קובץ מאוחד`;

  return Object.freeze({
    id: `children-cbt-core-he-module-${paddedModule}`,
    slug: `children-cbt-core-he-module-${paddedModule}`,
    parentSeriesId: CHILDREN_CBT_CORE_HE_SERIES_ID,
    type: 'module_pdf',
    language: 'he',
    audience: 'children',
    category: 'children_cbt_core',
    secondaryCategories: SHARED_SECONDARY_CATEGORIES,
    title,
    seriesHe: 'סדרת ליבה CBT לילדים',
    moduleHe: MODULE_TITLES_HE[moduleNumber],
    moduleNumber,
    moduleTitle: MODULE_TITLES_HE[moduleNumber],
    stageTitle: MODULE_TITLES_HE[moduleNumber],
    fileUrl,
    description: `קובץ PDF מאוחד של שלב ${moduleNumber} בסדרת CBT לילדים בעברית.`,
    therapeuticGoal: `לאפשר שליחה מרוכזת של כל טפסי שלב ${moduleNumber} לילדים.`,
    whenToUse: `להציע כשמבקשים את כל טפסי שלב ${moduleNumber} או קובץ אחד מרוכז.`,
    aiMatchingSummary: `מחזיר את כל טפסי שלב ${moduleNumber} בקובץ PDF מאוחד אחד.`,
    clinicalKeywords: Object.freeze(Array.from(new Set([
      ...(MODULE_TOPIC_HINTS_HE[moduleNumber] || []),
      'מודול',
      'ילדים',
      'cbt בעברית',
      `מודול ${moduleNumber}`,
      `שלב ${moduleNumber}`,
      `children_cbt_core_he_module_${paddedModule}_combined`,
    ]))),
    intentPhrases: Object.freeze(Array.from(new Set([
      ...COMMON_INTENT_PHRASES_HE,
      `שלח לי טופס ממודול ${moduleNumber}`,
      `שלח לי את מודול ${moduleNumber}`,
      `שלח לי טופס מהשלב ${moduleNumber}`,
      `שלח לי את כל מודול ${moduleNumber}`,
      `שלח לי את הקובץ המאוחד של מודול ${moduleNumber}`,
    ]))),
    notFor: SHARED_NOT_FOR,
    safetyNotes: 'טופס CBT לילדים. אינו מיועד למצבי חירום או סכנת חיים.',
    approved: true,
    logical_form_id: `children_cbt_core_module_${paddedModule}`,
    variant_language: 'he',
    available_languages: Object.freeze(['he']),
    source_language: 'he',
    is_language_variant: true,
    variant_group_id: `children_cbt_core_module_${paddedModule}`,
    sibling_variant_ids: Object.freeze([]),
    languages: Object.freeze({
      he: Object.freeze({
        title,
        description: `קובץ PDF מאוחד של מודול ${paddedModule} בסדרת CBT לילדים בעברית.`,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: fileName,
        rtl: true,
      }),
    }),
  });
});

export const FORMS_CHILDREN_CBT_CORE_HE_MODULE_PDFS = Object.freeze(FORMS_CHILDREN_CBT_CORE_HE_MODULE_PDFS_UNFROZEN);

export const FORMS_CHILDREN_CBT_CORE_HE = Object.freeze([
  ...FORMS_CHILDREN_CBT_CORE_HE_INDIVIDUAL,
  ...FORMS_CHILDREN_CBT_CORE_HE_MODULE_PDFS,
]);

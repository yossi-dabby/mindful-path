const BASE_URL = '/forms/he/children';

const SERIES_KEY = 'children_cbt_specialized_he';

const PACK_DEFINITIONS = [
  {
    packNumber: 1,
    domain: 'anxiety-fears',
    domainHe: 'חרדה ופחדים',
    domainPdfFileName: '01-stage-1-assessment-alliance-he.pdf',
    therapeuticGoal: 'זיהוי פחדים, מחשבות מאיימות, ובניית אומץ מדורג אצל ילדים.',
    whenToUse: 'כאשר ילד נמנע, חושש מדברים יומיומיים, או צריך תהליך חשיפה הדרגתי.',
    childSignals: ['מפחד ללכת לבית הספר', 'נמנע מדברים שמפחידים אותו', 'צריך סולם אומץ', 'רוצה חשיפה הדרגתית', 'הפחד אומר שמשהו רע יקרה'],
    clinicalKeywords: ['חרדה', 'פחד', 'הימנעות', 'חשיפה הדרגתית', 'סולם אומץ', 'תחזית איום'],
    hebrewIntentPhrases: ['ילד מפחד', 'ילדה נמנעת', 'סולם אומץ', 'חשיפה הדרגתית', 'מה הפחד אומר'],
    notFor: 'לא מתאים לעבודה ממוקדת OCD, טראומה פעילה מורכבת, או להדרכת הורים ללא מעורבות הילד.',
    relatedCoreForms: ['tf-children-cbt-stage-4-1-premium-he', 'tf-children-cbt-stage-4-2-premium-he'],
    forms: [
      { index: 1, fileName: '01-01-my-fear-and-what-it-says-he.pdf', titleHe: '1.1 — הפחד שלי ומה הוא אומר', shortContentDescriptionHe: 'זיהוי המסר המאיים שהפחד מספר לילד ברגע קשה', childSignals: ['מה הפחד אומר לי'], clinicalKeywords: ['מחשבה מאיימת'] },
      { index: 2, fileName: '01-02-what-do-i-do-when-im-afraid-he.pdf', titleHe: '1.2 — מה אני עושה כשאני מפחד/ת', shortContentDescriptionHe: 'מיפוי תגובות הילד בזמן פחד', clinicalKeywords: ['תגובות פחד'] },
      { index: 3, fileName: '01-03-bravery-ladder-anxiety-he.pdf', titleHe: '1.3 — סולם אומץ לחרדה', shortContentDescriptionHe: 'בניית מדרג חשיפה הדרגתי ובטוח', hebrewIntentPhrases: ['לבנות סולם אומץ'] },
      { index: 4, fileName: '01-04-small-brave-step-he.pdf', titleHe: '1.4 — צעד אמיץ קטן', shortContentDescriptionHe: 'בחירת צעד חשיפה קטן וישים', clinicalKeywords: ['צעד חשיפה'] },
      { index: 5, fileName: '01-05-what-really-happened-after-i-tried-he.pdf', titleHe: '1.5 — מה באמת קרה אחרי שניסיתי', shortContentDescriptionHe: 'בדיקת תחזית פחד מול המציאות אחרי ניסיון', clinicalKeywords: ['בדיקת תחזית'] },
      { index: 6, fileName: '01-06-bravery-card-for-fear-he.pdf', titleHe: '1.6 — כרטיס אומץ לפחד', shortContentDescriptionHe: 'כרטיס קצר להתמודדות בזמן פחד', clinicalKeywords: ['כרטיס התמודדות'] },
    ],
  },
  {
    packNumber: 2,
    domain: 'anger-regulation',
    domainHe: 'כעס וויסות',
    domainPdfFileName: '02-stage-2-building-my-map-he.pdf',
    therapeuticGoal: 'זיהוי מעגל הכעס ולמידת עצירה וויסות לפני תגובה אימפולסיבית.',
    whenToUse: 'כאשר יש התפרצויות, צעקות, פגיעה, או חרטה אחרי תגובת כעס.',
    childSignals: ['ילד מתפרץ ואז מתחרט', 'ילדה צועקת כשכועסת', 'קשה לעצור לפני תגובה', 'הגוף מתוח כשהוא כועס', 'איך מתקנים אחרי ריב'],
    clinicalKeywords: ['כעס', 'התפרצות', 'אימפולסיביות', 'עצירה', 'תיקון אחרי קונפליקט', 'ויסות רגשי'],
    hebrewIntentPhrases: ['טופס לעצירה לפני תגובה', 'כעס של ילד', 'לתקן אחרי ריב', 'רגע לפני פיצוץ'],
    notFor: 'לא מתאים לטראומה פעילה או ל-OCD כמוקד ראשי.',
    relatedCoreForms: ['tf-children-cbt-stage-5-1-premium-he', 'tf-children-cbt-stage-5-4-premium-he'],
    forms: [
      { index: 1, fileName: '02-01-my-anger-fuse-he.pdf', titleHe: '2.1 — הפיוז של הכעס שלי', shortContentDescriptionHe: 'זיהוי עוצמת הכעס וסימני הסלמה', clinicalKeywords: ['סולם כעס'] },
      { index: 2, fileName: '02-02-before-i-explode-he.pdf', titleHe: '2.2 — לפני שאני מתפוצץ/ת', shortContentDescriptionHe: 'זיהוי רגע העצירה לפני תגובת כעס', hebrewIntentPhrases: ['לפני שאני מתפוצץ'] },
      { index: 3, fileName: '02-03-what-my-body-asks-when-angry-he.pdf', titleHe: '2.3 — מה הגוף שלי מבקש כשאני כועס/ת', shortContentDescriptionHe: 'זיהוי מסרי הגוף ככלי לוויסות כעס', clinicalKeywords: ['תחושות גוף בכעס'] },
      { index: 4, fileName: '02-04-another-choice-during-anger-he.pdf', titleHe: '2.4 — בחירה אחרת בזמן כעס', shortContentDescriptionHe: 'תרגול תגובה חלופית במקום תגובה אימפולסיבית' },
      { index: 5, fileName: '02-05-after-i-exploded-how-to-repair-he.pdf', titleHe: '2.5 — אחרי שהתפרצתי: איך מתקנים', shortContentDescriptionHe: 'תהליך תיקון קשר לאחר התפרצות', clinicalKeywords: ['תיקון קשר'] },
      { index: 6, fileName: '02-06-my-anger-plan-he.pdf', titleHe: '2.6 — תוכנית הכעס שלי', shortContentDescriptionHe: 'בניית תוכנית אישית לניהול כעסים', clinicalKeywords: ['תוכנית ויסות'] },
    ],
  },
  {
    packNumber: 3,
    domain: 'ocd',
    domainHe: 'OCD',
    domainPdfFileName: '03-stage-3-working-on-thoughts-he.pdf',
    therapeuticGoal: 'זיהוי מחשבות טורדניות, דחפים וטקסים ולמידת עיכוב תגובה בטוח.',
    whenToUse: 'כאשר ילד מתאר בדיקות חוזרות, שטיפות, סידור כפייתי או צורך לבצע טקסים.',
    childSignals: ['חייב לבדוק שוב ושוב', 'חייבת לשטוף ידיים', 'מחשבה שמנדנדת', 'דחף חזק לעשות פעולה', 'לחכות לפני שאני עושה'],
    clinicalKeywords: ['OCD', 'אובססיה', 'קומפולסיה', 'דחף', 'עיכוב תגובה', 'ERP'],
    hebrewIntentPhrases: ['ניסוי קטן נגד OCD', 'לחכות לפני טקס', 'בדיקות חוזרות', 'מחשבות טורדניות'],
    notFor: 'לא מתאים כטיפול יחיד במצבי סיכון או התפרקות חריפה.',
    relatedCoreForms: ['tf-children-cbt-stage-3-1-premium-he', 'tf-children-cbt-stage-3-2-premium-he'],
    forms: [
      { index: 1, fileName: '03-01-the-thought-that-bothers-me-he.pdf', titleHe: '3.1 — המחשבה שמציקה לי', shortContentDescriptionHe: 'הגדרת המחשבה הטורדנית המרכזית', clinicalKeywords: ['מחשבה טורדנית'] },
      { index: 2, fileName: '03-02-what-i-feel-i-must-do-he.pdf', titleHe: '3.2 — מה אני מרגיש/ה שחייבים לעשות', shortContentDescriptionHe: 'זיהוי הדחף או הטקס שהילד מרגיש שחייב לבצע' },
      { index: 3, fileName: '03-03-how-strong-is-the-urge-now-he.pdf', titleHe: '3.3 — כמה חזק הדחף עכשיו', shortContentDescriptionHe: 'מדידת עוצמת הדחף בזמן אמת', clinicalKeywords: ['עוצמת דחף'] },
      { index: 4, fileName: '03-04-wait-before-i-do-he.pdf', titleHe: '3.4 — מחכה לפני שאני עושה', shortContentDescriptionHe: 'תרגול השהיית תגובה לטקס', hebrewIntentPhrases: ['לחכות לפני שאני עושה'] },
      { index: 5, fileName: '03-05-small-experiment-against-ocd-he.pdf', titleHe: '3.5 — ניסוי קטן נגד OCD', shortContentDescriptionHe: 'ניסוי התנהגותי קצר מול OCD', hebrewIntentPhrases: ['ניסוי קטן נגד OCD'] },
      { index: 6, fileName: '03-06-what-i-learned-when-i-waited-he.pdf', titleHe: '3.6 — מה למדתי כשחיכיתי', shortContentDescriptionHe: 'סיכום למידה אחרי עיכוב תגובה', clinicalKeywords: ['למידה מחשיפה'] },
    ],
  },
  {
    packNumber: 4,
    domain: 'social-self-esteem',
    domainHe: 'חברתי ודימוי עצמי',
    domainPdfFileName: '04-stage-4-working-in-real-life-he.pdf',
    therapeuticGoal: 'חיזוק דימוי עצמי ושיח פנימי מיטיב לצד שיפור תפקוד חברתי.',
    whenToUse: 'כאשר ילד מרגיש דחוי, חסר ערך, מתבייש, או מתקשה בקשרים חברתיים.',
    childSignals: ['חושב שלא אוהבים אותו', 'מתקשה עם חברים', 'דימוי עצמי נמוך', 'קשה לדבר עם עצמי טוב', 'צריך להכיר כוחות'],
    clinicalKeywords: ['דימוי עצמי', 'מיומנויות חברתיות', 'שיח פנימי', 'חוזקות', 'בושה', 'ערך עצמי'],
    hebrewIntentPhrases: ['מכתב מעודד לעצמי', 'להכיר את הכוחות שלי', 'חברים ודימוי עצמי'],
    notFor: 'לא מתאים כתגובה יחידה לאירוע טראומטי חריף.',
    relatedCoreForms: ['tf-children-cbt-stage-1-1-premium-he', 'tf-children-cbt-stage-4-3-premium-he'],
    forms: [
      { index: 1, fileName: '04-01-what-i-like-about-myself-he.pdf', titleHe: '4.1 — מה אני אוהב/ת בעצמי', shortContentDescriptionHe: 'זיהוי תכונות חיוביות וערך עצמי' },
      { index: 2, fileName: '04-02-my-small-successes-he.pdf', titleHe: '4.2 — ההצלחות הקטנות שלי', shortContentDescriptionHe: 'איסוף הישגים קטנים לחיזוק ביטחון עצמי', clinicalKeywords: ['חוויית הצלחה'] },
      { index: 3, fileName: '04-03-how-i-talk-to-myself-he.pdf', titleHe: '4.3 — איך אני מדבר/ת עם עצמי', shortContentDescriptionHe: 'עבודה על שיח פנימי שלילי מול מיטיב', clinicalKeywords: ['שיח פנימי'] },
      { index: 4, fileName: '04-04-things-im-proud-of-he.pdf', titleHe: '4.4 — דברים שאני גאה בהם', shortContentDescriptionHe: 'בניית זהות חיובית דרך גאווה אישית' },
      { index: 5, fileName: '04-05-my-strengths-he.pdf', titleHe: '4.5 — הכוחות שלי', shortContentDescriptionHe: 'מיפוי חוזקות אישיות וחברתיות' },
      { index: 6, fileName: '04-06-letter-to-myself-he.pdf', titleHe: '4.6 — מכתב טוב לעצמי', shortContentDescriptionHe: 'כתיבת מכתב חמלה עצמית ותמיכה פנימית', hebrewIntentPhrases: ['מכתב טוב לעצמי', 'מכתב מעודד לעצמי'] },
    ],
  },
  {
    packNumber: 5,
    domain: 'mood-depression',
    domainHe: 'מצב רוח ודכדוך',
    domainPdfFileName: '05-stage-5-adding-tools-to-my-toolbox-he.pdf',
    therapeuticGoal: 'הפעלה התנהגותית עדינה, זיהוי מקורות כוח, ושיפור מצב רוח ירוד אצל ילדים.',
    whenToUse: 'כאשר יש ירידה באנרגיה, חוסר מוטיבציה, כבדות וקושי להתחיל פעולות בסיסיות.',
    childSignals: ['ילד בלי כוח', 'מצב רוח ירוד', 'קשה להתחיל', 'צריך פעולה קטנה שתיתן כוח', 'הצלחה קטנה ביום קשה'],
    clinicalKeywords: ['דכדוך', 'מצב רוח נמוך', 'הפעלה התנהגותית', 'אנרגיה', 'מוטיבציה', 'צעדים קטנים'],
    hebrewIntentPhrases: ['פעולה קטנה שתיתן כוח', 'מה נתן לי קצת כוח היום', 'תוכנית יום קלילה'],
    notFor: 'לא מתאים כתחליף להערכת סיכון כאשר מופיעים סימני סיכון משמעותיים.',
    relatedCoreForms: ['tf-children-cbt-stage-5-1-premium-he', 'tf-children-cbt-stage-5-2-premium-he'],
    forms: [
      { index: 1, fileName: '05-01-what-lowers-my-mood-he.pdf', titleHe: '5.1 — מה מוריד לי את מצב הרוח', shortContentDescriptionHe: 'זיהוי טריגרים לירידת מצב רוח' },
      { index: 2, fileName: '05-02-my-heavy-thought-he.pdf', titleHe: '5.2 — המחשבה הכבדה שלי', shortContentDescriptionHe: 'זיהוי מחשבה מכבידה שמורידה אנרגיה' },
      { index: 3, fileName: '05-03-small-action-that-lights-up-he.pdf', titleHe: '5.3 — פעולה קטנה שמדליקה אור', shortContentDescriptionHe: 'בחירת פעולה קטנה מעלה אנרגיה', hebrewIntentPhrases: ['פעולה קטנה שמדליקה אור'] },
      { index: 4, fileName: '05-04-what-gave-me-strength-today-he.pdf', titleHe: '5.4 — מה נתן לי כוח היום', shortContentDescriptionHe: 'זיהוי נקודות כוח במהלך יום קשה' },
      { index: 5, fileName: '05-05-small-success-on-hard-day-he.pdf', titleHe: '5.5 — הצלחה קטנה ביום קשה', shortContentDescriptionHe: 'ביסוס תחושת מסוגלות דרך הצלחות קטנות' },
      { index: 6, fileName: '05-06-light-day-plan-he.pdf', titleHe: '5.6 — תוכנית יום קלילה', shortContentDescriptionHe: 'תכנון יום מותאם לאנרגיה נמוכה', clinicalKeywords: ['תכנון יום'] },
    ],
  },
  {
    packNumber: 6,
    domain: 'trauma-tf-cbt',
    domainHe: 'טראומה וביטחון (TF-CBT)',
    domainPdfFileName: '06-stage-6-maintaining-my-success-he.pdf',
    therapeuticGoal: 'חיזוק תחושת ביטחון, ויסות גוף ותמיכה לאחר אירוע קשה בשפה עדינה ולא גרפית.',
    whenToUse: 'כאשר ילד חווה תזכורות לאירוע קשה וצריך כלים מיידיים להרגיש בטוח ומווסת.',
    childSignals: ['ילד נזכר במשהו קשה', 'משהו מזכיר לה את מה שקרה', 'צריך להרגיש בטוח עכשיו', 'כרטיס ביטחון לרגע קשה', 'מי עוזר לי כשאני נזכר'],
    clinicalKeywords: ['TF-CBT', 'ביטחון', 'טריגר', 'תזכורת', 'ויסות גוף', 'מערכת תמיכה'],
    hebrewIntentPhrases: ['להרגיש בטוח עכשיו', 'כרטיס ביטחון', 'מי עוזר לי כשאני נזכר', 'הגוף נרגע אחרי דבר קשה'],
    notFor: 'לא מתאים לתיאור גרפי של אירועים או לחשיפה לא מבוקרת.',
    relatedCoreForms: ['tf-children-cbt-stage-6-1-premium-he', 'tf-children-cbt-stage-6-3-premium-he'],
    forms: [
      { index: 1, fileName: '06-01-what-helps-me-feel-safe-now-he.pdf', titleHe: '6.1 — מה עוזר לי להרגיש בטוח/ה עכשיו', shortContentDescriptionHe: 'זיהוי פעולות מיידיות ליצירת ביטחון נוכחי' },
      { index: 2, fileName: '06-02-when-something-reminds-me-he.pdf', titleHe: '6.2 — כשמשהו מזכיר לי', shortContentDescriptionHe: 'זיהוי טריגרים ותגובות בטוחות לתזכורות', clinicalKeywords: ['טריגרים'] },
      { index: 3, fileName: '06-03-my-body-remembers-and-i-help-it-calm-he.pdf', titleHe: '6.3 — הגוף זוכר ואני עוזר/ת לו להירגע', shortContentDescriptionHe: 'כלי ויסות גוף כשעולה זיכרון קשה', clinicalKeywords: ['ויסות גוף'] },
      { index: 4, fileName: '06-04-feelings-after-hard-thing-he.pdf', titleHe: '6.4 — רגשות אחרי משהו קשה', shortContentDescriptionHe: 'מתן שם לרגשות לאחר אירוע קשה' },
      { index: 5, fileName: '06-05-who-helps-me-when-i-remember-he.pdf', titleHe: '6.5 — מי עוזר לי כשאני נזכר/ת', shortContentDescriptionHe: 'מיפוי דמויות תמיכה וזמינותן' },
      { index: 6, fileName: '06-06-safety-card-for-hard-moment-he.pdf', titleHe: '6.6 — כרטיס ביטחון לרגע קשה', shortContentDescriptionHe: 'כרטיס קצר לניהול רגע הצפה', clinicalKeywords: ['כרטיס ביטחון'] },
    ],
  },
  {
    packNumber: 7,
    domain: 'adhd',
    domainHe: 'ADHD — קשב, ארגון ואימפולסיביות',
    domainPdfFileName: null,
    therapeuticGoal: 'שיפור קשב, ארגון, ויסות אימפולסיביות ותכנון מותאם לילדים עם ADHD.',
    whenToUse: 'כאשר ילד מתקשה להתרכז, להתארגן, לנהל זמן או לעצור לפני פעולה.',
    childSignals: ['ילד עם ADHD לא מצליח להתארגן', 'קשה להתרכז בשיעורים', 'צריך הפסקות קצרות', 'צריך תזכורות חזותיות', 'קופץ לפעולה בלי לחשוב'],
    clinicalKeywords: ['ADHD', 'קשב', 'ארגון', 'ניהול זמן', 'אימפולסיביות', 'הפסקות קצרות'],
    hebrewIntentPhrases: ['תוכנית הצלחה לבית הספר', 'מה עוזר לי להתרכז', 'תזכורות חזותיות', 'ADHD'],
    notFor: 'לא מתאים כטיפול יחיד בקשיי מצב רוח עמוקים ללא מענה רגשי.',
    relatedCoreForms: ['tf-children-cbt-stage-1-2-premium-he', 'tf-children-cbt-stage-5-3-premium-he'],
    forms: [
      { index: 1, fileName: '07-01-understanding-my-adhd-he.pdf', titleHe: '7.1 — להבין את ה-ADHD שלי', shortContentDescriptionHe: 'פסיכוחינוך מותאם לילד על קשב והיפראקטיביות' },
      { index: 2, fileName: '07-02-when-is-it-hard-for-me-he.pdf', titleHe: '7.2 — מתי הכי קשה לי להתרכז', shortContentDescriptionHe: 'מיפוי מצבי קושי בקשב לאורך היום' },
      { index: 3, fileName: '07-03-what-helps-me-focus-he.pdf', titleHe: '7.3 — מה עוזר לי להתרכז', shortContentDescriptionHe: 'זיהוי אסטרטגיות קשב: הפסקות קצרות, רמזים חזותיים, חלוקת משימות', hebrewIntentPhrases: ['מה עוזר לי להתרכז', 'צריך הפסקות קצרות', 'תזכורות חזותיות'] },
      { index: 4, fileName: '07-04-my-brain-moves-and-its-ok-he.pdf', titleHe: '7.4 — המוח שלי זז וזה בסדר', shortContentDescriptionHe: 'נרמול תנועתיות וויסות עצמי לא שיפוטי' },
      { index: 5, fileName: '07-05-my-success-plan-he.pdf', titleHe: '7.5 — תוכנית ההצלחה שלי', shortContentDescriptionHe: 'תוכנית שבועית להצלחה בבית ובבית הספר', clinicalKeywords: ['תוכנית בית ספר'] },
      { index: 6, fileName: '07-06-things-i-want-to-remember-about-myself-he.pdf', titleHe: '7.6 — דברים שאני רוצה לזכור על עצמי', shortContentDescriptionHe: 'חיזוק זהות וכוחות ילד עם ADHD' },
    ],
  },
  {
    packNumber: 8,
    domain: 'sleep-body-emotional',
    domainHe: 'שינה וקשיים גופניים-רגשיים',
    domainPdfFileName: null,
    therapeuticGoal: 'חיבור בין גוף לרגש: זיהוי סימני גוף, שינה, נשימה ותוכנית הרגעה גופנית.',
    whenToUse: 'כאשר מופיעים כאבי בטן מלחץ, קושי להירדם, או צורך בהבנת מסרי הגוף.',
    childSignals: ['כואבת הבטן מלחץ', 'הגוף מדבר לפני שהוא מבין', 'קשה לישון', 'צריך נשימות שעוזרות', 'מה הגוף שלי צריך עכשיו'],
    clinicalKeywords: ['גוף-רגש', 'שינה', 'נשימה', 'סימני גוף', 'ויסות פיזיולוגי', 'אכילה רגשית'],
    hebrewIntentPhrases: ['כאב בטן מלחץ', 'מה הגוף אומר', 'תוכנית גוף רגוע', 'מה הגוף שלי צריך עכשיו'],
    notFor: 'לא מתאים להחלפת הערכה רפואית כשיש חשד למצב רפואי דחוף.',
    relatedCoreForms: ['tf-children-cbt-stage-5-1-premium-he', 'tf-children-cbt-stage-6-1-premium-he'],
    forms: [
      { index: 1, fileName: '08-01-my-body-speaks-he.pdf', titleHe: '8.1 — הגוף שלי מדבר', shortContentDescriptionHe: 'זיהוי סימני גוף מוקדמים של לחץ ורגש' },
      { index: 2, fileName: '08-02-what-makes-me-uncomfortable-he.pdf', titleHe: '8.2 — מה גורם לי אי-נוחות בגוף', shortContentDescriptionHe: 'זיהוי מצבים שמעוררים אי-נוחות גופנית-רגשית', clinicalKeywords: ['אי-נוחות גופנית'] },
      { index: 3, fileName: '08-03-breathing-that-helps-me-he.pdf', titleHe: '8.3 — נשימה שעוזרת לי', shortContentDescriptionHe: 'תרגול נשימות לוויסות והרגעה' },
      { index: 4, fileName: '08-04-rest-that-helps-me-he.pdf', titleHe: '8.4 — מנוחה שעוזרת לי', shortContentDescriptionHe: 'בניית הרגלי מנוחה ושינה מותאמים', clinicalKeywords: ['היגיינת שינה'] },
      { index: 5, fileName: '08-05-what-do-i-need-now-he.pdf', titleHe: '8.5 — מה אני צריך/ה עכשיו', shortContentDescriptionHe: 'זיהוי צורך מיידי של הגוף והרגש' },
      { index: 6, fileName: '08-06-my-body-plan-he.pdf', titleHe: '8.6 — תוכנית הגוף הרגוע שלי', shortContentDescriptionHe: 'תוכנית יומית לוויסות גוף-רגש', clinicalKeywords: ['תוכנית גוף רגוע'] },
    ],
  },
  {
    packNumber: 9,
    domain: 'parent-guidance',
    domainHe: 'הדרכת הורים',
    domainPdfFileName: null,
    therapeuticGoal: 'הכוונת הורים לתגובה מווסתת, גבולות ברורים, חיזוקים ושגרה תומכת ילד.',
    whenToUse: 'כאשר הורה או מטפל מבקשים איך להגיב, להציב גבולות, ולעבוד בשיתוף עם הילד.',
    childSignals: ['הורה לא יודע איך להגיב כשהילד מתפרץ', 'איך להגיב בצורה רגועה יותר', 'חיזוקים שעובדים', 'גבול ברור בלי מאבק כוח', 'שגרת בית שעוזרת לילד'],
    clinicalKeywords: ['הדרכת הורים', 'חיזוק חיובי', 'גבולות', 'שגרה', 'תצפית טריגרים', 'תוכנית הורה-ילד'],
    hebrewIntentPhrases: ['איך ההורה צריך להגיב', 'תוכנית הורה ילד', 'בלי מאבק כוח', 'הדרכת הורים'],
    notFor: 'לא מתאים לשליחה כתחליף לעבודה ישירה עם הילד כאשר זו נדרשת.',
    relatedCoreForms: ['tf-children-parent-guided-coping-card', 'tf-children-cbt-stage-5-4-premium-he'],
    forms: [
      { index: 1, fileName: '09-01-my-child-and-i-are-a-team-he.pdf', titleHe: '9.1 — הילד שלי ואני צוות', shortContentDescriptionHe: 'חיזוק שותפות הורה-ילד במקום מאבק' },
      { index: 2, fileName: '09-02-catching-good-moments-he.pdf', titleHe: '9.2 — לתפוס רגעים טובים', shortContentDescriptionHe: 'זיהוי וחיזוק רגעי הצלחה קטנים', clinicalKeywords: ['חיזוקים'] },
      { index: 3, fileName: '09-03-how-do-i-respond-when-its-hard-he.pdf', titleHe: '9.3 — איך אני מגיב/ה כשקשה', shortContentDescriptionHe: 'בניית תגובת הורה רגועה וברורה ברגעי קושי', hebrewIntentPhrases: ['איך להגיב כשהילד מתקשה', 'איך להגיב בצורה רגועה'] },
      { index: 4, fileName: '09-04-routine-that-gives-safety-he.pdf', titleHe: '9.4 — שגרה שנותנת ביטחון', shortContentDescriptionHe: 'תכנון שגרה ביתית צפויה ומרגיעה' },
      { index: 5, fileName: '09-05-encourage-instead-of-criticize-he.pdf', titleHe: '9.5 — לעודד במקום לבקר', shortContentDescriptionHe: 'מעבר משיח ביקורתי לשיח מעודד ומכוון' },
      { index: 6, fileName: '09-06-my-parent-plan-he.pdf', titleHe: '9.6 — תוכנית ההורה שלי', shortContentDescriptionHe: 'תוכנית הורה-ילד לשבוע הקרוב', clinicalKeywords: ['תוכנית שבועית הורה-ילד'] },
    ],
  },
];

function unique(values) {
  return [...new Set(values.filter(Boolean))];
}

function createSpecializedIndividualForm(pack, form) {
  const displayNumber = `${pack.packNumber}.${form.index}`;
  const fileUrl = `${BASE_URL}/${form.fileName}`;
  const titleHe = form.titleHe;

  return {
    id: `tf-children-cbt-specialized-${pack.packNumber}-${form.index}-he`,
    slug: `children-cbt-specialized-${pack.packNumber}-${form.index}-he`,
    audience: 'children',
    language: 'he',
    domain: pack.domain,
    domainHe: pack.domainHe,
    displayNumber,
    titleHe,
    fileUrl,
    therapeuticGoal: form.therapeuticGoal || pack.therapeuticGoal,
    shortContentDescriptionHe: form.shortContentDescriptionHe,
    whenToUse: form.whenToUse || pack.whenToUse,
    childSignals: unique([...(pack.childSignals || []), ...(form.childSignals || [])]),
    clinicalKeywords: unique([...(pack.clinicalKeywords || []), ...(form.clinicalKeywords || []), displayNumber, pack.domain, pack.domainHe]),
    hebrewIntentPhrases: unique([...(pack.hebrewIntentPhrases || []), ...(form.hebrewIntentPhrases || []), titleHe, displayNumber]),
    notFor: form.notFor || pack.notFor,
    relatedCoreForms: unique(form.relatedCoreForms || pack.relatedCoreForms || []),
    packNumber: pack.packNumber,
    isApproved: true,
    approved: true,
    type: 'therapeutic_form',
    category: 'children_cbt_process',
    childrenSeries: 'specialized',
    cbt_stage_number: pack.packNumber,
    cbt_substage_number: displayNumber,
    tags: unique(['cbt', 'children', 'hebrew', 'specialized', pack.domain, `pack-${pack.packNumber}`, `form-${displayNumber}`]),
    languages: {
      he: {
        title: titleHe,
        description: form.shortContentDescriptionHe,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: form.fileName,
        rtl: true,
        aliases: unique([titleHe, displayNumber, ...(form.hebrewIntentPhrases || []), ...(pack.hebrewIntentPhrases || [])]),
      },
    },
  };
}

function createSpecializedPackPdf(pack) {
  if (!pack.domainPdfFileName) return null;
  const fileUrl = `${BASE_URL}/${pack.domainPdfFileName}`;

  return {
    id: `tf-children-cbt-specialized-pack-${pack.packNumber}-he`,
    slug: `children-cbt-specialized-pack-${pack.packNumber}-he`,
    audience: 'children',
    language: 'he',
    domain: pack.domain,
    domainHe: pack.domainHe,
    displayNumber: `${pack.packNumber}`,
    titleHe: `מנה ${pack.packNumber} — ${pack.domainHe}`,
    fileUrl,
    therapeuticGoal: pack.therapeuticGoal,
    shortContentDescriptionHe: `PDF מלא של מנה ${pack.packNumber} — ${pack.domainHe}`,
    whenToUse: `כאשר מבקשים את כל מנה ${pack.packNumber} במלואה ולא דף בודד.`,
    childSignals: pack.childSignals,
    clinicalKeywords: unique([...(pack.clinicalKeywords || []), 'מנה מלאה', `מנה ${pack.packNumber}`]),
    hebrewIntentPhrases: unique([`כל מנה ${pack.packNumber}`, `תשלח לי את כל מנה ${pack.packNumber}`, `כל הטפסים במנה ${pack.packNumber}`]),
    notFor: 'לא לשליחה כאשר המשתמש ביקש דף בודד.',
    relatedCoreForms: pack.relatedCoreForms,
    packNumber: pack.packNumber,
    isApproved: true,
    approved: true,
    type: 'therapeutic_form',
    category: 'workbook_series',
    childrenSeries: 'specialized',
    isDomainPdf: true,
    seriesKey: SERIES_KEY,
    tags: unique(['cbt', 'children', 'hebrew', 'specialized', 'pack-pdf', pack.domain, `pack-${pack.packNumber}`]),
    languages: {
      he: {
        title: `מנה ${pack.packNumber} — ${pack.domainHe} (PDF מלא)`,
        description: `קובץ מלא של כל טפסי מנה ${pack.packNumber}`,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: pack.domainPdfFileName,
        rtl: true,
        aliases: unique([`מנה ${pack.packNumber}`, `כל מנה ${pack.packNumber}`, `pack ${pack.packNumber}`]),
      },
    },
  };
}

export const CHILDREN_CBT_SPECIALIZED_MANIFEST = PACK_DEFINITIONS.map((pack) => ({
  packNumber: pack.packNumber,
  domain: pack.domain,
  domainHe: pack.domainHe,
  domainPdfFileName: pack.domainPdfFileName,
  forms: pack.forms.map((form) => ({
    displayNumber: `${pack.packNumber}.${form.index}`,
    titleHe: form.titleHe,
    fileName: form.fileName,
    shortContentDescriptionHe: form.shortContentDescriptionHe,
  })),
}));

export const FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL = PACK_DEFINITIONS.flatMap((pack) =>
  pack.forms.map((form) => createSpecializedIndividualForm(pack, form))
);

export const FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS = PACK_DEFINITIONS
  .map((pack) => createSpecializedPackPdf(pack))
  .filter(Boolean);

export const FORMS_CHILDREN_CBT_SPECIALIZED_FULL_PDFS = [];

export const FORMS_CHILDREN_CBT_SPECIALIZED = [
  ...FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL,
  ...FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS,
  ...FORMS_CHILDREN_CBT_SPECIALIZED_FULL_PDFS,
];

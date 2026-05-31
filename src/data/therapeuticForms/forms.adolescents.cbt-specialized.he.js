const SERIES_ID = 'adolescents-cbt-specialized-he';

const SHARED_NOT_FOR = Object.freeze([
  'children under adolescent age',
  'adult or older-adult requests',
  'English-only requests unless English is explicitly requested',
  'crisis intervention',
  'emergency mental health situations',
]);

// Module 01: חרדה, לחץ ופחדים — Anxiety, Stress and Fears
const MODULE_01_SECONDARY_CATEGORIES = Object.freeze([
  'anxiety_tools',
  'coping_tools',
  'emotional_regulation',
  'workbook_series',
]);

const MODULE_01_BASE_PATH = '/forms/module-01';

const MODULE_01_WORKSHEETS = Object.freeze([
  {
    worksheetCode: '01',
    title: 'מה קורה אצלי עכשיו?',
    description: 'מיפוי מצב נוכחי: זיהוי מה שקורה עכשיו ברגש, בגוף ובמחשבה.',
    therapeuticGoal: 'זיהוי המצב הנוכחי והתחלת הבנה פשוטה של מה שקורה עכשיו ברגש, בגוף ובמחשבה.',
    whenToUse: 'כשמתבגר/ת מרגיש/ה חרדה, לחץ או פחד ומתקשה להגדיר במהירות מה קורה.',
    clinicalKeywords: Object.freeze([
      'חרדה', 'לחץ', 'פחד', 'זיהוי מצב', 'מה קורה עכשיו', 'רגשות', 'גוף', 'מחשבות',
      'מתבגרים', 'עברית', 'CBT ייעודי', 'מודול 1', 'חרדה לחץ ופחדים',
    ]),
    intentPhrases: Object.freeze([
      'מה קורה אצלי עכשיו',
      'אני צריך טופס CBT למתבגר בעברית',
      'שלח לי טופס למתבגר',
      'שלח לי טופס ממודול 1',
      'תן לי את הטופס הראשון במודול 1',
      'אני צריך טופס שמתאים לנער עם חרדה',
      'אני צריך טופס שמתאים לנערה עם לחץ',
      'אני צריך טופס שמתאים למתבגר עם קושי רגשי',
    ]),
    aiMatchingSummary: 'מתאים לפתיחת עבודה טיפולית סביב חרדה או לחץ כאשר צריך למפות בקצרה מה קורה עכשיו, מה מרגישים בגוף, אילו מחשבות עולות ומה יכול להיות צעד קטן ובטוח.',
    safetyNotes: 'Hebrew adolescent CBT worksheet. Supportive educational/therapeutic tool. Not emergency care. Use with appropriate clinical judgment.',
  },
  {
    worksheetCode: '02',
    title: 'מה מפעיל את הלחץ או הפחד שלי?',
    description: 'זיהוי טריגרים: מצבים, מחשבות או תחושות שמפעילים לחץ ופחד.',
    therapeuticGoal: 'זיהוי טריגרים, מצבים, מחשבות או תחושות שמפעילים לחץ ופחד.',
    whenToUse: 'כאשר מתבגר/ת רוצה להבין מה התחיל את החרדה או מה מגביר אותה.',
    clinicalKeywords: Object.freeze([
      'טריגרים', 'גורמים מפעילים', 'לחץ', 'פחד', 'חוסר ודאות', 'דאגה חברתית', 'מעמסה', 'זיהוי דפוסים',
      'מתבגרים', 'עברית', 'CBT ייעודי', 'מודול 1', 'חרדה לחץ ופחדים',
    ]),
    intentPhrases: Object.freeze([
      'מה מפעיל את הלחץ שלי',
      'מה גורם לי לפחד',
      'אני צריך טופס ייעודי למתבגרים',
      'שלח לי טופס מהסדרה הייעודית',
      'שלח לי טופס ממודול 1',
      'אני צריך טופס שמתאים למתבגר עם קושי רגשי',
    ]),
    aiMatchingSummary: 'מתאים למצבים שבהם המשתמש/ת מתאר/ת לחץ או פחד ורוצה להבין מה מפעיל אותם: מקום, אדם, מחשבה, תחושת גוף, חוסר ודאות או עומס.',
    safetyNotes: 'Hebrew adolescent CBT worksheet. Supportive educational/therapeutic tool. Not emergency care. Use with appropriate clinical judgment.',
  },
  {
    worksheetCode: '03',
    title: 'מה הדאגה שלי אומרת?',
    description: 'הפרדה בין מחשבות דאגה לבין עובדות ובניית יכולת לבדוק את אמינות הדאגה.',
    therapeuticGoal: 'הפרדה בין מחשבות דאגה לבין עובדות ובניית יכולת לבדוק את אמינות הדאגה.',
    whenToUse: 'כשמחשבות דאגה חזקות חוזרות שוב ושוב או מרגישות משכנעות מאוד.',
    clinicalKeywords: Object.freeze([
      'דאגה', 'מחשבות חרדה', 'עובדות', 'נבואות', 'בדיקת מחשבות', 'קול הדאגה', 'חשיבה מאוזנת',
      'מתבגרים', 'עברית', 'CBT ייעודי', 'מודול 1', 'חרדה לחץ ופחדים',
    ]),
    intentPhrases: Object.freeze([
      'מה הדאגה שלי אומרת',
      'מחשבות דאגה חוזרות',
      'שלח לי טופס ממודול 1',
      'אני צריך טופס שמתאים לנערה עם לחץ',
      'בדיקת מחשבות חרדה',
    ]),
    aiMatchingSummary: 'מתאים כאשר יש מחשבת דאגה חוזרת כמו מה יקרה אם, כולם יחשבו, אני לא אצליח, או כאשר צריך להבחין בין דאגה לבין מידע עובדתי.',
    safetyNotes: 'Hebrew adolescent CBT worksheet. Supportive educational/therapeutic tool. Not emergency care. Use with appropriate clinical judgment.',
  },
  {
    worksheetCode: '04',
    title: 'לחץ לפני מבחן',
    description: 'בניית תוכנית פשוטה להתמודדות עם לחץ לפני מבחן, בוחן או הצגה.',
    therapeuticGoal: 'בניית תוכנית פשוטה להתמודדות עם לחץ לפני מבחן, בוחן או הצגה.',
    whenToUse: 'לפני מבחן, בוחן, הצגה או משימה לימודית שמעלה לחץ ביצוע.',
    clinicalKeywords: Object.freeze([
      'לחץ מבחנים', 'חרדת מבחנים', 'בוחן', 'הצגה', 'הכנה', 'תוכנית פעולה', 'ביצוע', 'ויסות',
      'מתבגרים', 'עברית', 'CBT ייעודי', 'מודול 1', 'חרדה לחץ ופחדים',
    ]),
    intentPhrases: Object.freeze([
      'לחץ לפני מבחן',
      'חרדת מבחנים',
      'שלח לי טופס ממודול 1',
      'אני צריך טופס שמתאים לנער עם חרדה',
      'תוכנית התמודדות עם מבחן',
    ]),
    aiMatchingSummary: 'מתאים למשתמש/ת שמתאר/ת לחץ לפני מבחן או משימת ביצוע ורוצה להכין תוכנית ערב לפני ויום המבחן עם צעדים קטנים וברורים.',
    safetyNotes: 'Hebrew adolescent CBT worksheet. Supportive educational/therapeutic tool. Not emergency care. Use with appropriate clinical judgment.',
  },
  {
    worksheetCode: '05',
    title: 'הימנעות או אומץ?',
    description: 'זיהוי הימנעות, הבנת המחיר שלה ובחירת צעד אומץ קטן להתקדמות.',
    therapeuticGoal: 'זיהוי הימנעות, הבנת המחיר שלה ובחירת צעד אומץ קטן להתקדמות.',
    whenToUse: 'כשמתבגר/ת נמנע/ת ממשהו בגלל פחד, לחץ או חשש מכישלון.',
    clinicalKeywords: Object.freeze([
      'הימנעות', 'אומץ', 'חשיפה הדרגתית', 'צעד קטן', 'פחד', 'מחיר ההימנעות', 'ביטחון', 'תרגול',
      'מתבגרים', 'עברית', 'CBT ייעודי', 'מודול 1', 'חרדה לחץ ופחדים',
    ]),
    intentPhrases: Object.freeze([
      'הימנעות או אומץ',
      'הימנעות בגלל פחד',
      'שלח לי טופס ממודול 1',
      'אני צריך טופס שמתאים למתבגר עם קושי רגשי',
      'צעד אומץ קטן',
    ]),
    aiMatchingSummary: 'מתאים כאשר המשתמש/ת נמנע/ת ממשימה, שיחה, הגעה למקום או ניסיון חדש בגלל חרדה, וצריך לבחור צעד קטן ובטוח לכיוון אומץ.',
    safetyNotes: 'Hebrew adolescent CBT worksheet. Supportive educational/therapeutic tool. Not emergency care. Use with appropriate clinical judgment.',
  },
  {
    worksheetCode: '06',
    title: 'סולם האומץ שלי',
    description: 'בניית צעדים הדרגתיים ומציאותיים להתמודדות עם פחד באופן בטוח ומדורג.',
    therapeuticGoal: 'בניית צעדים הדרגתיים ומציאותיים להתמודדות עם פחד באופן בטוח ומדורג.',
    whenToUse: 'כאשר רוצים לתכנן חשיפה הדרגתית או התקדמות בצעדים קטנים סביב פחד או הימנעות.',
    clinicalKeywords: Object.freeze([
      'סולם אומץ', 'חשיפה הדרגתית', 'צעדים קטנים', 'פחד', 'חרדה', 'תרגול', 'ביטחון', 'תוכנית שבועית',
      'מתבגרים', 'עברית', 'CBT ייעודי', 'מודול 1', 'חרדה לחץ ופחדים',
    ]),
    intentPhrases: Object.freeze([
      'סולם האומץ שלי',
      'מדרג אומץ',
      'שלח לי טופס ממודול 1',
      'תן לי את כל הטפסים של מודול 1',
      'חשיפה הדרגתית למתבגר',
      'אני צריך טופס שמתאים לנער עם חרדה',
    ]),
    aiMatchingSummary: 'מתאים לבניית מדרג אומץ: מטרה בראש הסולם, צעד קל, צעד אמצעי וצעד שבועי להתמודדות עם פחד באופן הדרגתי ותומך.',
    safetyNotes: 'Hebrew adolescent CBT worksheet. Supportive educational/therapeutic tool. Not emergency care. Use with appropriate clinical judgment.',
  },
]);

const FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01_UNFROZEN = MODULE_01_WORKSHEETS.map((def, index) => {
  const moduleNumber = 1;
  const worksheetIndex = index + 1;
  const formNumber = `${moduleNumber}.${worksheetIndex}`;
  const fileName = `adolescents_cbt_specialized_he_01_0${worksheetIndex}.pdf`;
  const fileUrl = `${MODULE_01_BASE_PATH}/${fileName}`;

  return Object.freeze({
    id: `adolescents-cbt-specialized-he-01-0${worksheetIndex}`,
    slug: `adolescents-cbt-specialized-he-01-0${worksheetIndex}`,
    parentSeriesId: SERIES_ID,
    type: 'individual_worksheet',
    approved: true,
    title: def.title,
    description: def.description,
    language: 'he',
    audience: 'adolescents',
    category: 'adolescents_cbt_specialized',
    secondaryCategories: MODULE_01_SECONDARY_CATEGORIES,
    fileUrl,
    formNumber,
    worksheetNumber: formNumber,
    displayNumber: formNumber,
    moduleNumber,
    moduleCode: '01',
    moduleTitle: 'חרדה, לחץ ופחדים',
    pageNumberInWorkbook: index + 1,
    therapeuticGoal: def.therapeuticGoal,
    whenToUse: def.whenToUse,
    clinicalKeywords: def.clinicalKeywords,
    intentPhrases: def.intentPhrases,
    notFor: SHARED_NOT_FOR,
    aiMatchingSummary: def.aiMatchingSummary,
    safetyNotes: def.safetyNotes,
    // Variant metadata — Hebrew variant of English specialized series
    logical_form_id: `adolescents_cbt_specialized_01_0${worksheetIndex}`,
    variant_language: 'he',
    source_language: 'en',
    is_language_variant: true,
    variant_group_id: `adolescents_cbt_specialized_01_0${worksheetIndex}`,
    available_languages: Object.freeze(['en', 'he']),
    sibling_variant_ids: Object.freeze([]),
    languages: Object.freeze({
      he: Object.freeze({
        title: def.title,
        description: def.description,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: fileName,
        rtl: true,
      }),
    }),
  });
});

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01 = Object.freeze(
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01_UNFROZEN
);

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE = Object.freeze([
  ...FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01,
]);

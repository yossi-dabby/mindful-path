import {
  FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL,
} from './forms.children.cbt-core.en.js';

const CHILDREN_CBT_CORE_HE_SERIES_ID = 'children-cbt-core-he';
const CHILDREN_CBT_CORE_HE_BASE_PREFIX = '/forms/children_cbt_core_he_module_';

const SHARED_SECONDARY_CATEGORIES = Object.freeze([
  'workbook_series',
  'emotional_regulation',
  'coping_tools',
  'thought_records',
  'reflection_journal',
  'weekly_practice',
]);

const SHARED_NOT_FOR = Object.freeze([
  'adolescents or adult requests',
  'English language mode',
  'non-Hebrew language mode',
  'crisis intervention',
  'emergency mental health situations',
  'trauma processing without clinician support',
  'self-harm or suicide content',
]);

const MODULE_TITLES_HE = Object.freeze({
  1: 'מודול 01',
  2: 'מודול 02',
  3: 'מודול 03',
  4: 'מודול 04',
  5: 'מודול 05',
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
  return `${CHILDREN_CBT_CORE_HE_BASE_PREFIX}${pad2(moduleNumber)}_github_upload/children_cbt_core_he_${formNumber}.pdf`;
}

function toHebrewFormIdentifier(formNumber) {
  return `children_cbt_core_he_${String(formNumber).replace('.', '_')}`;
}

const FORMS_CHILDREN_CBT_CORE_HE_INDIVIDUAL_UNFROZEN = FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL.map((englishForm) => {
  const formNumber = String(englishForm.formNumber || englishForm.worksheetNumber || '');
  const { moduleNumber, worksheetNumberInModule } = toNumericFormNumber(formNumber);
  const worksheetFileName = `children_cbt_core_he_${formNumber}.pdf`;
  const fileUrl = toPublicWorksheetPath(formNumber);
  const formTitleHe = `children_cbt_core_he_${formNumber}`;
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
    moduleTitle: MODULE_TITLES_HE[moduleNumber],
    stageTitle: MODULE_TITLES_HE[moduleNumber],
    fileUrl,
    description: englishForm.description,
    therapeuticGoal: englishForm.therapeuticGoal,
    whenToUse: englishForm.whenToUse,
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
    aiMatchingSummary: englishForm.aiMatchingSummary,
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
        description: englishForm.description,
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
  const fileUrl = `${CHILDREN_CBT_CORE_HE_BASE_PREFIX}${paddedModule}_github_upload/${fileName}`;
  const title = `children_cbt_core_he_module_${paddedModule}_combined`;

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
    moduleNumber,
    moduleTitle: MODULE_TITLES_HE[moduleNumber],
    stageTitle: MODULE_TITLES_HE[moduleNumber],
    fileUrl,
    description: `קובץ PDF מאוחד של מודול ${paddedModule} בסדרת CBT לילדים בעברית.`,
    therapeuticGoal: `אספקת קובץ מודול ${paddedModule} מרוכז לפי בקשה.`,
    whenToUse: `להציע כשמבקשים את כל מודול ${moduleNumber} לילדים בעברית.`,
    aiMatchingSummary: `מחזיר את כל טפסי מודול ${moduleNumber} בקובץ PDF מאוחד יחיד.`,
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

import manifestData from '../../../public/forms/he/adolescents/cbt-specialized/manifest.adolescents-cbt-specialized-he.json' with { type: 'json' };

const SERIES_KEY = manifestData.seriesKey;
const SERIES_BASE_URL = manifestData.targetFolder;

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function createIndividualForm(moduleEntry, formEntry) {
  const [moduleNumber, worksheetIndex] = String(formEntry.worksheetNumber || '').split('.').map(Number);
  const fileUrl = formEntry.fileUrl || `${SERIES_BASE_URL}/${moduleEntry.folderName}/${formEntry.fileName}`;

  return {
    id: `tf-adolescents-cbt-specialized-${moduleNumber}-${worksheetIndex}-he`,
    slug: `adolescents-cbt-specialized-${moduleNumber}-${worksheetIndex}-he`,
    audience: 'adolescents',
    language: 'he',
    ageRange: manifestData.ageRange,
    minimum_age: 12,
    maximum_age: 18,
    direction: 'rtl',
    module: moduleEntry.module,
    moduleHe: moduleEntry.moduleHe,
    moduleNumber,
    worksheetNumber: formEntry.worksheetNumber,
    displayNumber: formEntry.worksheetNumber,
    titleHe: formEntry.titleHe,
    fileUrl,
    therapeuticGoal: formEntry.therapeuticGoal,
    shortContentDescriptionHe: formEntry.shortContentDescriptionHe,
    whenToUse: formEntry.whenToUse,
    teenSignals: unique(formEntry.teenSignals),
    clinicalKeywords: unique(formEntry.clinicalKeywords),
    hebrewIntentPhrases: unique(formEntry.hebrewIntentPhrases),
    notFor: formEntry.notFor,
    relatedForms: unique(formEntry.relatedForms),
    approved: true,
    isApproved: true,
    type: 'therapeutic_form',
    category: 'adolescents_cbt_specialized',
    adolescentSeries: 'specialized',
    tags: unique([
      'cbt',
      'adolescents',
      'hebrew',
      'rtl',
      'specialized',
      moduleEntry.module,
      `module-${moduleNumber}`,
      `worksheet-${formEntry.worksheetNumber}`,
    ]),
    recommended_for: ['adolescents_ages_12_to_18'],
    languages: {
      he: {
        title: formEntry.titleHe,
        description: formEntry.shortContentDescriptionHe,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: formEntry.fileName,
        rtl: true,
        aliases: unique([
          formEntry.titleHe,
          formEntry.worksheetNumber,
          ...(formEntry.hebrewIntentPhrases || []),
        ]),
      },
    },
  };
}

function createModulePdfForm(moduleEntry) {
  return {
    id: `tf-adolescents-cbt-specialized-module-${moduleEntry.moduleNumber}-he`,
    slug: `adolescents-cbt-specialized-module-${moduleEntry.moduleNumber}-he`,
    audience: 'adolescents',
    language: 'he',
    ageRange: manifestData.ageRange,
    minimum_age: 12,
    maximum_age: 18,
    direction: 'rtl',
    module: moduleEntry.module,
    moduleHe: moduleEntry.moduleHe,
    moduleNumber: moduleEntry.moduleNumber,
    displayNumber: String(moduleEntry.moduleNumber),
    titleHe: `מודול ${moduleEntry.moduleNumber} — ${moduleEntry.moduleHe}`,
    fileUrl: moduleEntry.modulePdfUrl,
    therapeuticGoal: moduleEntry.therapeuticGoal,
    shortContentDescriptionHe: `PDF מלא של מודול ${moduleEntry.moduleNumber} — ${moduleEntry.moduleHe}`,
    whenToUse: `כאשר מבקשים את כל מודול ${moduleEntry.moduleNumber} המלא ולא רק דף בודד.`,
    teenSignals: unique(moduleEntry.teenSignals),
    clinicalKeywords: unique([...(moduleEntry.clinicalKeywords || []), 'מודול מלא', `מודול ${moduleEntry.moduleNumber}`]),
    hebrewIntentPhrases: unique([
      `כל מודול ${moduleEntry.moduleNumber}`,
      `תשלח לי את כל מודול ${moduleEntry.moduleNumber}`,
      `הקובץ המלא של מודול ${moduleEntry.moduleNumber}`,
      ...(moduleEntry.hebrewIntentPhrases || []),
    ]),
    notFor: 'לא לשליחה כאשר המשתמש ביקש דף עבודה בודד.',
    relatedForms: unique(moduleEntry.forms.map((form) => `tf-adolescents-cbt-specialized-${String(form.worksheetNumber).replace('.', '-')}-he`)),
    approved: true,
    isApproved: true,
    type: 'therapeutic_form',
    category: 'workbook_series',
    adolescentSeries: 'specialized',
    isModulePdf: true,
    seriesKey: SERIES_KEY,
    tags: unique(['cbt', 'adolescents', 'hebrew', 'rtl', 'specialized', 'module-pdf', moduleEntry.module, `module-${moduleEntry.moduleNumber}`]),
    recommended_for: ['adolescents_ages_12_to_18'],
    languages: {
      he: {
        title: `מודול ${moduleEntry.moduleNumber} — ${moduleEntry.moduleHe} (PDF מלא)`,
        description: `קובץ מלא של כל דפי העבודה במודול ${moduleEntry.moduleNumber}`,
        file_url: moduleEntry.modulePdfUrl,
        file_type: 'pdf',
        file_name: moduleEntry.modulePdfFileName,
        rtl: true,
        aliases: unique([
          `מודול ${moduleEntry.moduleNumber}`,
          `כל מודול ${moduleEntry.moduleNumber}`,
          `module ${moduleEntry.moduleNumber}`,
          moduleEntry.moduleHe,
        ]),
      },
    },
  };
}

function createFullSeriesPdfForm() {
  return {
    id: 'tf-adolescents-cbt-specialized-series-full-he',
    slug: 'adolescents-cbt-specialized-series-full-he',
    audience: 'adolescents',
    language: 'he',
    ageRange: manifestData.ageRange,
    minimum_age: 12,
    maximum_age: 18,
    direction: 'rtl',
    titleHe: manifestData.titleHe,
    displayNumber: 'full-series',
    fileUrl: manifestData.combinedPdf.fileUrl,
    therapeuticGoal: 'לתת גישה לכל הסדרה הייעודית המאושרת למתבגרים/ות בעברית בקובץ אחד.',
    shortContentDescriptionHe: 'PDF משולב מלא של כל 60 דפי העבודה הייעודיים למתבגרים/ות בעברית.',
    whenToUse: 'כאשר מבקשים את כל הסדרה הייעודית למתבגרים/ות בקובץ PDF אחד.',
    teenSignals: [],
    clinicalKeywords: ['סדרה מלאה', '60 דפי עבודה', 'CBT ייעודי למתבגרים'],
    hebrewIntentPhrases: [
      'כל סדרת cbt ייעודית למתבגרים בעברית',
      'כל הסדרה הייעודית למתבגרים',
      'הקובץ המלא של כל הסדרה',
    ],
    notFor: 'לא לשליחה כאשר המשתמש ביקש דף בודד או מודול יחיד.',
    relatedForms: unique(manifestData.modules.flatMap((moduleEntry) => moduleEntry.forms.map((form) => `tf-adolescents-cbt-specialized-${String(form.worksheetNumber).replace('.', '-')}-he`))),
    approved: true,
    isApproved: true,
    type: 'therapeutic_form',
    category: 'workbook_series',
    adolescentSeries: 'specialized',
    isFullSpecializedSeries: true,
    seriesKey: SERIES_KEY,
    tags: ['cbt', 'adolescents', 'hebrew', 'rtl', 'specialized', 'full-series'],
    recommended_for: ['adolescents_ages_12_to_18'],
    languages: {
      he: {
        title: `${manifestData.titleHe} (PDF מלא)`,
        description: 'קובץ מלא של כל הסדרה הייעודית למתבגרים/ות בעברית.',
        file_url: manifestData.combinedPdf.fileUrl,
        file_type: 'pdf',
        file_name: manifestData.combinedPdf.fileName,
        rtl: true,
        aliases: unique([
          manifestData.titleHe,
          'כל סדרת CBT ייעודית למתבגרים בעברית',
          'כל הסדרה הייעודית למתבגרים',
        ]),
      },
    },
  };
}

export const ADOLESCENTS_CBT_SPECIALIZED_MANIFEST = manifestData;

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_INDIVIDUAL = manifestData.modules.flatMap((moduleEntry) =>
  moduleEntry.forms.map((formEntry) => createIndividualForm(moduleEntry, formEntry))
);

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_MODULE_PDFS = manifestData.modules.map((moduleEntry) =>
  createModulePdfForm(moduleEntry)
);

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_FULL_PDFS = [createFullSeriesPdfForm()];

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED = [
  ...FORMS_ADOLESCENTS_CBT_SPECIALIZED_INDIVIDUAL,
  ...FORMS_ADOLESCENTS_CBT_SPECIALIZED_MODULE_PDFS,
  ...FORMS_ADOLESCENTS_CBT_SPECIALIZED_FULL_PDFS,
];

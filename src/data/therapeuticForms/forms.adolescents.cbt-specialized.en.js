import manifestData from '../../../public/forms/en/adolescents/cbt-specialized/manifest.adolescents-cbt-specialized-en.json' with { type: 'json' };

const SERIES_BASE_URL = '/forms/en/adolescents/cbt-specialized';

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function toTfId(idValue) {
  const baseId = String(idValue || '').trim();
  if (!baseId) return '';
  return baseId.startsWith('tf-') ? baseId : `tf-${baseId}`;
}

function createIndividualForm(formEntry) {
  const baseId = String(formEntry.id || '').trim();
  const worksheetNumber = String(formEntry.worksheetNumber || '').trim();
  const moduleNumber = Number(formEntry.moduleNumber);
  const fileUrl = String(formEntry.fileUrl || '').trim();
  const fileName = fileUrl.split('/').pop();

  return {
    id: toTfId(baseId),
    slug: baseId,
    audience: 'adolescents',
    language: 'en',
    ageRange: manifestData.ageRange,
    minimum_age: 12,
    maximum_age: 18,
    direction: 'ltr',
    series: formEntry.series,
    seriesTitle: formEntry.seriesTitle || manifestData.seriesTitle,
    moduleNumber,
    moduleTitle: formEntry.moduleTitle,
    worksheetNumber,
    title: formEntry.title,
    fileUrl,
    therapeuticGoal: formEntry.therapeuticGoal,
    shortContentDescription: formEntry.shortContentDescription,
    whenToUse: unique(formEntry.whenToUse),
    teenSignals: unique(formEntry.teenSignals),
    clinicalKeywords: unique(formEntry.clinicalKeywords),
    intentPhrases: unique(formEntry.intentPhrases),
    notFor: unique(formEntry.notFor),
    relatedForms: unique((formEntry.relatedForms || []).map(toTfId)),
    approved: true,
    isApproved: true,
    type: 'therapeutic_form',
    category: 'adolescents_cbt_specialized',
    adolescentSeries: 'specialized',
    tags: unique([
      'cbt',
      'adolescents',
      'teens',
      'english',
      'ltr',
      'specialized',
      `module-${moduleNumber}`,
      `worksheet-${worksheetNumber}`,
      ...(formEntry.clinicalKeywords || []),
    ]),
    recommended_for: ['adolescents_ages_12_to_18'],
    languages: {
      en: {
        title: formEntry.title,
        description: formEntry.shortContentDescription,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: fileName,
        rtl: false,
        aliases: unique([
          formEntry.title,
          worksheetNumber,
          formEntry.moduleTitle,
          ...(formEntry.intentPhrases || []),
        ]),
      },
    },
  };
}

function createModulePdfForm(moduleNumber, moduleTitle, worksheetForms) {
  const paddedModule = String(moduleNumber).padStart(2, '0');
  const fileName = `adolescents-cbt-specialized-en-module-${paddedModule}.pdf`;
  const fileUrl = `${SERIES_BASE_URL}/${fileName}`;
  return {
    id: `tf-adolescents-cbt-specialized-en-module-${paddedModule}`,
    slug: `adolescents-cbt-specialized-en-module-${paddedModule}`,
    audience: 'adolescents',
    language: 'en',
    ageRange: manifestData.ageRange,
    minimum_age: 12,
    maximum_age: 18,
    direction: 'ltr',
    series: 'adolescents-cbt-specialized',
    seriesTitle: manifestData.seriesTitle,
    moduleNumber,
    moduleTitle,
    title: `Module ${moduleNumber} — ${moduleTitle} (Full PDF)`,
    displayNumber: String(moduleNumber),
    fileUrl,
    therapeuticGoal: `Provide full module ${moduleNumber} for the English adolescent CBT specialized series.`,
    shortContentDescription: `Full PDF for module ${moduleNumber} (${moduleTitle}) in the English adolescent CBT specialized series.`,
    whenToUse: unique([
      `module ${moduleNumber}`,
      moduleTitle,
      'full module pdf',
      'all worksheets in module',
    ]),
    teenSignals: unique(['module request', moduleTitle]),
    clinicalKeywords: unique(['cbt', 'adolescents', 'specialized', 'module pdf', moduleTitle]),
    intentPhrases: unique([
      `module ${moduleNumber}`,
      `send module ${moduleNumber}`,
      `full module ${moduleNumber}`,
      `all worksheets in module ${moduleNumber}`,
    ]),
    notFor: ['Do not use when the user asks for one specific worksheet only.'],
    relatedForms: unique(worksheetForms.map((form) => form.id)),
    approved: true,
    isApproved: true,
    type: 'therapeutic_form',
    category: 'workbook_series',
    adolescentSeries: 'specialized',
    isModulePdf: true,
    tags: unique(['cbt', 'adolescents', 'teens', 'english', 'specialized', 'module-pdf', `module-${moduleNumber}`]),
    recommended_for: ['adolescents_ages_12_to_18'],
    languages: {
      en: {
        title: `Module ${moduleNumber} — ${moduleTitle} (Full PDF)`,
        description: `Contains all 6 worksheets for module ${moduleNumber}.`,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: fileName,
        rtl: false,
        aliases: unique([
          `module ${moduleNumber}`,
          `${moduleNumber}`,
          `${moduleNumber}.all`,
          moduleTitle,
        ]),
      },
    },
  };
}

export const ADOLESCENTS_CBT_SPECIALIZED_EN_MANIFEST = manifestData;

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL = manifestData.forms.map((formEntry) =>
  createIndividualForm(formEntry)
);

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS = Array.from(
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL.reduce((acc, form) => {
    const moduleNumber = Number(form.moduleNumber);
    if (!acc.has(moduleNumber)) acc.set(moduleNumber, []);
    acc.get(moduleNumber).push(form);
    return acc;
  }, new Map())
)
  .sort((a, b) => a[0] - b[0])
  .map(([moduleNumber, forms]) =>
    createModulePdfForm(moduleNumber, forms[0]?.moduleTitle || `Module ${moduleNumber}`, forms)
  );

export const FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN = [
  ...FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL,
  ...FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS,
];

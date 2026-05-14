import manifestData from '../../../public/forms/en/adolescents/cbt-core/manifest.adolescents-cbt-core-en.json' with { type: 'json' };

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function normalizeTextList(value) {
  if (Array.isArray(value)) return unique(value.map((entry) => String(entry).trim()).filter(Boolean));
  if (typeof value === 'string' && value.trim()) return [value.trim()];
  return [];
}

function createIndividualForm(entry) {
  const stageNumber = Number(entry.stage);
  const worksheetNumber = String(entry.worksheetNumber || '');
  const fileUrl = entry.fileUrl;
  const fileName = String(fileUrl || '').split('/').pop() || `${worksheetNumber.replace('.', '-')}-en.pdf`;

  return {
    id: entry.id,
    slug: entry.id,
    manifestId: entry.id,
    audience: 'adolescents',
    language: 'en',
    ageRange: manifestData.ageRange,
    minimum_age: 12,
    maximum_age: 18,
    direction: 'ltr',
    series: manifestData.series,
    seriesTitle: manifestData.seriesTitle,
    stageNumber,
    stageTitle: entry.stageTitle,
    worksheetNumber,
    title: entry.title,
    fileUrl,
    therapeuticGoal: entry.therapeuticGoal,
    shortContentDescription: entry.shortContentDescription,
    whenToUse: normalizeTextList(entry.whenToUse),
    teenSignals: normalizeTextList(entry.teenSignals),
    clinicalKeywords: normalizeTextList(entry.clinicalKeywords),
    intentPhrases: normalizeTextList(entry.intentPhrases),
    notFor: normalizeTextList(entry.notFor),
    relatedForms: normalizeTextList(entry.relatedForms),
    approved: true,
    isApproved: true,
    type: 'therapeutic_form',
    category: 'adolescents_cbt_core',
    adolescentSeries: 'core',
    tags: unique([
      'cbt',
      'adolescents',
      'english',
      'core',
      'ltr',
      `stage-${stageNumber}`,
      `worksheet-${worksheetNumber}`,
      manifestData.series,
    ]),
    recommended_for: ['adolescents_ages_12_to_18'],
    languages: {
      en: {
        title: entry.title,
        description: entry.shortContentDescription,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: fileName,
        rtl: false,
        aliases: unique([
          entry.id,
          worksheetNumber,
          entry.title,
          entry.stageTitle,
          ...(entry.intentPhrases || []),
          ...(entry.teenSignals || []),
          ...(entry.clinicalKeywords || []),
        ]),
      },
    },
  };
}

export const ADOLESCENTS_CBT_CORE_EN_MANIFEST = manifestData;

export const FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL = manifestData.forms.map((entry) =>
  createIndividualForm(entry)
);

export const FORMS_ADOLESCENTS_CBT_CORE_EN = [
  ...FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL,
];

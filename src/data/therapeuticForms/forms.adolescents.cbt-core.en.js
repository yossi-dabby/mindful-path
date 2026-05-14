import manifestData from '../../../public/forms/en/adolescents/cbt-core/manifest.adolescents-cbt-core-en.json' with { type: 'json' };

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function normalizeRelatedFormIds(relatedForms) {
  return unique((relatedForms || []).map((id) =>
    typeof id === 'string' && id.startsWith('adolescents-cbt-core-') ? `tf-${id}` : id
  ));
}

function createIndividualForm(formEntry) {
  const baseId = String(formEntry.id || '').trim();
  const stageNumber = Number(formEntry.stage);
  const worksheetNumber = String(formEntry.worksheetNumber || '').trim();
  const title = String(formEntry.title || '').trim();
  const fileUrl = String(formEntry.fileUrl || '').trim();
  const fileName = fileUrl.split('/').pop();

  return {
    id: `tf-${baseId}`,
    slug: baseId,
    audience: 'adolescents',
    language: 'en',
    ageRange: manifestData.ageRange,
    minimum_age: 12,
    maximum_age: 18,
    direction: 'ltr',
    series: manifestData.series,
    seriesTitle: manifestData.seriesTitle,
    stageNumber,
    stageTitle: formEntry.stageTitle,
    worksheetNumber,
    title,
    fileUrl,
    therapeuticGoal: formEntry.therapeuticGoal,
    shortContentDescription: formEntry.shortContentDescription,
    whenToUse: unique(formEntry.whenToUse),
    teenSignals: unique(formEntry.teenSignals),
    clinicalKeywords: unique(formEntry.clinicalKeywords),
    intentPhrases: unique(formEntry.intentPhrases),
    notFor: unique(formEntry.notFor),
    relatedForms: normalizeRelatedFormIds(formEntry.relatedForms),
    approved: true,
    isApproved: true,
    type: 'therapeutic_form',
    category: 'adolescents_cbt_core',
    adolescentSeries: 'core',
    tags: unique([
      'cbt',
      'adolescents',
      'teens',
      'english',
      'ltr',
      'core',
      `stage-${stageNumber}`,
      `worksheet-${worksheetNumber}`,
      ...formEntry.clinicalKeywords,
    ]),
    recommended_for: ['adolescents_ages_12_to_18'],
    languages: {
      en: {
        title,
        description: formEntry.shortContentDescription,
        file_url: fileUrl,
        file_type: 'pdf',
        file_name: fileName,
        rtl: false,
        aliases: unique([
          title,
          worksheetNumber,
          formEntry.stageTitle,
          ...(formEntry.intentPhrases || []),
        ]),
      },
    },
  };
}

export const ADOLESCENTS_CBT_CORE_EN_MANIFEST = manifestData;

export const FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL = manifestData.forms.map((formEntry) =>
  createIndividualForm(formEntry)
);

export const FORMS_ADOLESCENTS_CBT_CORE_EN = [
  ...FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL,
];

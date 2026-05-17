/**
 * Therapeutic workbook metadata.
 * Keep this list aligned with canonical therapeutic-forms manifest entries.
 */

export const WORKBOOK_CONTENT_METADATA = [];

export const WORKBOOK_CONTENT_METADATA_EN = [
  {
    id: 'adolescents-cbt-core-en',
    slug: 'adolescents-cbt-core-series-1-en',
    topicKeywords: [
      'teen cbt',
      'adolescent cbt',
      'teenager',
      'teen',
      'adolescent',
      'anxiety',
      'stress',
      'worry',
      'automatic thoughts',
      'thought record',
      'cognitive restructuring',
      'body signals',
      'triggers',
      'emotional regulation',
      'coping',
      'avoidance',
      'small steps',
      'weekly check-in',
      'coping plan',
    ],
  },
];

export const WORKBOOK_CONTENT_METADATA_ES = [];
export const WORKBOOK_CONTENT_METADATA_FR = [];
export const WORKBOOK_CONTENT_METADATA_DE = [];
export const WORKBOOK_CONTENT_METADATA_IT = [];
export const WORKBOOK_CONTENT_METADATA_PT = [];
export const WORKBOOK_CONTENT_METADATA_CHILDREN_HE = [];

export function getWorkbookMetaById(formId) {
  return WORKBOOK_CONTENT_METADATA.find((entry) => entry?.id === formId) || null;
}

export function getWorkbookMetaByIdEn(formId) {
  return WORKBOOK_CONTENT_METADATA_EN.find((entry) => entry?.id === formId) || null;
}

export function getWorkbookMetaByIdEs(formId) {
  return WORKBOOK_CONTENT_METADATA_ES.find((entry) => entry?.id === formId) || null;
}

export function getWorkbookMetaByIdFr(formId) {
  return WORKBOOK_CONTENT_METADATA_FR.find((entry) => entry?.id === formId) || null;
}

export function getWorkbookMetaByIdDe(formId) {
  return WORKBOOK_CONTENT_METADATA_DE.find((entry) => entry?.id === formId) || null;
}

export function getWorkbookMetaByIdIt(formId) {
  return WORKBOOK_CONTENT_METADATA_IT.find((entry) => entry?.id === formId) || null;
}

export function getWorkbookMetaByIdPt(formId) {
  return WORKBOOK_CONTENT_METADATA_PT.find((entry) => entry?.id === formId) || null;
}

export function getLowerPriorityIndividualForms() {
  return [];
}

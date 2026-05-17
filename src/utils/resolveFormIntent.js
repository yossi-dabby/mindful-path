/**
 * Therapeutic form intent resolver.
 */

import {
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
  ALL_FORMS,
} from '../data/therapeuticForms/index.js';

const ADOLESCENTS_CBT_CORE_EN_ID = 'adolescents-cbt-core-en';

const ADOLESCENTS_CBT_CORE_EN_INTENTS = [
  'adolescents-cbt-core-en',
  'adolescents-cbt-core-series-1-en',
  'adolescents cbt core series',
  'i need a cbt workbook for a teenager',
  'i need worksheets for a teen',
  'help a teenager understand thoughts and feelings',
  'teen anxiety worksheet',
  'adolescent cbt form',
  'thought record for teens',
  'help with avoidance',
  'help with body signals',
  'help with emotional regulation',
  'help a teen choose a helpful action',
  'weekly cbt practice for adolescents',
  'coping plan for a teenager',
];

export const APPROVED_FORM_INTENT_MAP = Object.freeze(
  ADOLESCENTS_CBT_CORE_EN_INTENTS.reduce((acc, intent) => {
    acc[intent] = ADOLESCENTS_CBT_CORE_EN_ID;
    return acc;
  }, {})
);

export const FORM_INTENT_MARKER_PATTERN = /\[FORM:([a-z0-9_-]+)(?::([a-z]{2}))?\]/g;

function findApprovedExactFormId(candidateId) {
  const match = ALL_FORMS.find(
    (form) =>
      form?.approved === true &&
      typeof form.id === 'string' &&
      (form.id === candidateId || (typeof form.slug === 'string' && form.slug === candidateId))
  );
  return match?.id || null;
}

function resolveApprovedFormById(formId, lang = 'en') {
  const resolved = resolveFormWithLanguage(formId, lang);
  if (!resolved) return null;
  return toGeneratedFileMetadata(resolved);
}

function normalizeText(value) {
  return String(value || '').toLowerCase().trim();
}

function containsAny(text, terms) {
  return terms.some((term) => text.includes(term));
}

function hasExplicitEnglishRequest(normalizedQuery) {
  return containsAny(normalizedQuery, ['english', 'in english', ' באנגלית', 'אנגלית']);
}

function requestsDisallowedAudience(normalizedQuery) {
  const patterns = [
    /\bchildren\b/i,
    /\bchild\b/i,
    /\bkid\b/i,
    /\badults\b/i,
    /\badult\b/i,
    /\bolder adults\b/i,
    /\bolder-adults\b/i,
    /\bolder adult\b/i,
  ];
  return patterns.some((pattern) => pattern.test(normalizedQuery));
}

function requestsHebrew(normalizedQuery) {
  return containsAny(normalizedQuery, ['hebrew', 'עברית']);
}

function hasTeenCbtSignals(normalizedQuery) {
  const teenTerms = ['teen', 'teenager', 'adolescent', 'youth', 'young person'];
  const cbtTerms = [
    'cbt',
    'anxiety',
    'stress',
    'worry',
    'automatic thought',
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
  ];

  return containsAny(normalizedQuery, teenTerms) && containsAny(normalizedQuery, cbtTerms);
}

export function resolveFormIntent(intentOrSlug, lang) {
  if (typeof intentOrSlug !== 'string' || !intentOrSlug.trim()) return null;
  if (ALL_FORMS.length === 0) return null;

  const normalizedIntent = intentOrSlug.toLowerCase().trim();
  const resolvedLang = typeof lang === 'string' && lang.trim() ? lang.trim() : 'en';

  const formId = APPROVED_FORM_INTENT_MAP[normalizedIntent] || findApprovedExactFormId(normalizedIntent);
  if (formId) {
    return resolveApprovedFormById(formId, resolvedLang);
  }

  const byContent = resolveAdolescentsCBTCoreEnglishFormByContent(normalizedIntent, {
    activeLanguage: resolvedLang,
  });
  if (byContent) return byContent;

  return null;
}

export function resolveChildrenCBTPremiumFormByContent(_query) {
  return null;
}

export function resolveChildrenCBTSpecializedFormByContent(_query) {
  return null;
}

export function resolveAdolescentsCBTSpecializedFormByContent(_query) {
  return null;
}

export function resolveAdolescentsCBTCoreEnglishFormByContent(query, options = {}) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  const activeLanguage = normalizeText(options.activeLanguage || 'en') || 'en';
  const explicitEnglish = hasExplicitEnglishRequest(normalizedQuery);

  if (requestsDisallowedAudience(normalizedQuery)) return null;
  if (requestsHebrew(normalizedQuery) && !explicitEnglish) return null;
  if (activeLanguage !== 'en' && !explicitEnglish) return null;
  if (!hasTeenCbtSignals(normalizedQuery) && !APPROVED_FORM_INTENT_MAP[normalizedQuery]) return null;

  return resolveApprovedFormById(ADOLESCENTS_CBT_CORE_EN_ID, 'en');
}

export function resolveAdolescentsCBTSpecializedEnglishFormByContent(_query, _options = {}) {
  return null;
}

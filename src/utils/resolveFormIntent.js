/**
 * Therapeutic form intent resolver.
 */

import {
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
  ALL_FORMS,
} from '../data/therapeuticForms/index.js';

const ADOLESCENTS_CBT_CORE_EN_ID = 'adolescents-cbt-core-en';

const PACKAGE_LEVEL_INTENTS = [
  'adolescents-cbt-core-en',
  'adolescents-cbt-core-series-1-en',
  'adolescents cbt core series',
  'full workbook',
  'complete cbt series',
  'full adolescent cbt core',
  'all teen cbt worksheets',
  'complete series',
  'full cbt workbook for a teen',
  'full cbt workbook for teen',
  'teen cbt workbook',
  'adolescent cbt workbook',
  'i need a cbt workbook for a teenager',
  'i need worksheets for a teen',
  'help a teenager understand thoughts and feelings',
  'teen anxiety worksheet',
  'adolescent cbt form',
  'thought record for teens',
  'weekly cbt practice for adolescents',
  'coping plan for a teenager',
];

const PACKAGE_LEVEL_HINTS = [
  'full workbook',
  'complete workbook',
  'complete cbt series',
  'full adolescent cbt core',
  'all teen cbt worksheets',
  'complete series',
  'full cbt workbook',
  'whole workbook',
  'entire workbook',
  'adolescent cbt workbook',
  'teen cbt workbook',
  'cbt workbook for a teen',
  'cbt workbook for teen',
];

function getCoreEnglishForms() {
  return ALL_FORMS.filter((form) => form?.approved === true && form?.category === 'adolescents_cbt_core' && form?.language === 'en' && form?.audience === 'adolescents');
}

function getCoreEnglishPackageForm() {
  return getCoreEnglishForms().find((form) => form?.id === ADOLESCENTS_CBT_CORE_EN_ID && form?.type === 'workbook_package') || null;
}

function getCoreEnglishIndividualForms() {
  return getCoreEnglishForms().filter((form) => form?.type === 'individual_worksheet' && form?.parentSeriesId === ADOLESCENTS_CBT_CORE_EN_ID);
}

function buildApprovedIntentMap() {
  const map = {};
  const forms = getCoreEnglishForms();

  for (const form of forms) {
    const id = String(form?.id || '').trim();
    const slug = String(form?.slug || '').trim();
    if (id) map[id.toLowerCase()] = id;
    if (slug) map[slug.toLowerCase()] = id;

    if (Array.isArray(form?.intentPhrases)) {
      for (const phrase of form.intentPhrases) {
        const normalized = normalizeText(phrase);
        if (!normalized) continue;
        map[normalized] = id;
      }
    }
  }

  for (const phrase of PACKAGE_LEVEL_INTENTS) {
    map[normalizeText(phrase)] = ADOLESCENTS_CBT_CORE_EN_ID;
  }

  return Object.freeze(map);
}

export const APPROVED_FORM_INTENT_MAP = buildApprovedIntentMap();

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
    'worksheet',
    'form',
  ];

  return containsAny(normalizedQuery, teenTerms) && containsAny(normalizedQuery, cbtTerms);
}

function isPackageLevelRequest(normalizedQuery) {
  if (APPROVED_FORM_INTENT_MAP[normalizedQuery] === ADOLESCENTS_CBT_CORE_EN_ID) {
    return true;
  }
  return containsAny(normalizedQuery, PACKAGE_LEVEL_HINTS);
}

function extractRequestedFormNumber(normalizedQuery) {
  const explicitFormMatch = normalizedQuery.match(/\b(?:form|worksheet)\s*([1-6])(?:\.|\-|\s)([1-5])\b/i);
  if (explicitFormMatch) return `${explicitFormMatch[1]}.${explicitFormMatch[2]}`;

  const shortFormMatch = normalizedQuery.match(/\b([1-6])\.([1-5])\b/);
  if (shortFormMatch) return `${shortFormMatch[1]}.${shortFormMatch[2]}`;

  return null;
}

function scoreIndividualFormMatch(form, normalizedQuery) {
  let score = 0;

  const normalizedTitle = normalizeText(form?.title);
  const normalizedDescription = normalizeText(form?.description);
  const normalizedGoal = normalizeText(form?.therapeuticGoal);
  const normalizedWhenToUse = normalizeText(form?.whenToUse);
  const normalizedFormNumber = normalizeText(form?.formNumber);

  if (normalizedFormNumber && normalizedQuery.includes(`form ${normalizedFormNumber}`)) score += 120;
  if (normalizedFormNumber && normalizedQuery.includes(`worksheet ${normalizedFormNumber}`)) score += 120;
  if (normalizedFormNumber && normalizedQuery.includes(normalizedFormNumber)) score += 100;

  if (normalizedTitle && normalizedQuery.includes(normalizedTitle)) score += 80;

  if (Array.isArray(form?.intentPhrases)) {
    for (const phrase of form.intentPhrases) {
      const normalizedPhrase = normalizeText(phrase);
      if (!normalizedPhrase) continue;
      if (normalizedQuery.includes(normalizedPhrase)) score += 70;
    }
  }

  if (Array.isArray(form?.clinicalKeywords)) {
    for (const keyword of form.clinicalKeywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;
      if (normalizedQuery.includes(normalizedKeyword)) score += 30;
    }
  }

  if (normalizedDescription && normalizedQuery.length > 8) {
    const words = normalizedQuery.split(/\s+/).filter(Boolean);
    for (const word of words) {
      if (word.length < 4) continue;
      if (normalizedDescription.includes(word)) score += 4;
      if (normalizedGoal.includes(word)) score += 4;
      if (normalizedWhenToUse.includes(word)) score += 4;
    }
  }

  return score;
}

function resolveCoreEnglishIndividualByFormNumber(formNumber) {
  if (!formNumber) return null;
  const individual = getCoreEnglishIndividualForms().find((form) => form?.formNumber === formNumber);
  if (!individual) return null;
  return resolveApprovedFormById(individual.id, 'en');
}

function resolveCoreEnglishIndividualByContent(normalizedQuery) {
  const candidates = getCoreEnglishIndividualForms();
  if (candidates.length === 0) return null;

  let best = null;
  let bestScore = 0;

  for (const form of candidates) {
    const score = scoreIndividualFormMatch(form, normalizedQuery);
    if (score > bestScore) {
      best = form;
      bestScore = score;
    }
  }

  if (!best || bestScore <= 0) return null;
  return resolveApprovedFormById(best.id, 'en');
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

  if (isPackageLevelRequest(normalizedQuery)) {
    return resolveApprovedFormById(ADOLESCENTS_CBT_CORE_EN_ID, 'en');
  }

  const requestedFormNumber = extractRequestedFormNumber(normalizedQuery);
  const byFormNumber = resolveCoreEnglishIndividualByFormNumber(requestedFormNumber);
  if (byFormNumber) return byFormNumber;

  const byContent = resolveCoreEnglishIndividualByContent(normalizedQuery);
  if (byContent) return byContent;

  if (!hasTeenCbtSignals(normalizedQuery) && !APPROVED_FORM_INTENT_MAP[normalizedQuery]) return null;

  const packageForm = getCoreEnglishPackageForm();
  if (!packageForm) return null;
  return resolveApprovedFormById(packageForm.id, 'en');
}

export function resolveAdolescentsCBTSpecializedEnglishFormByContent(_query, _options = {}) {
  return null;
}

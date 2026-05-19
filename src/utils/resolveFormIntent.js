/**
 * Therapeutic form intent resolver.
 */

import {
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
  ALL_FORMS,
} from '../data/therapeuticForms/index.js';

const ADOLESCENTS_CBT_CORE_EN_ID = 'adolescents-cbt-core-en';
const ADOLESCENTS_CBT_SPECIALIZED_EN_ID = 'adolescents-cbt-specialized-en';
const SPECIALIZED_MODULE_ID_PREFIX = `${ADOLESCENTS_CBT_SPECIALIZED_EN_ID}-module-`;
const CHILDREN_CBT_CORE_EN_SERIES_ID = 'children-cbt-core-en';

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

const SPECIALIZED_FULL_SERIES_HINTS = [
  'full specialized series',
  'full 60-form specialized workbook',
  'full 60 form specialized workbook',
  'all specialized forms',
  'send all specialized forms',
  'complete specialized workbook for teens',
  'specialized cbt full series',
  'adolescents cbt specialized series',
];

const DISALLOWED_AUDIENCE_PATTERNS = [
  /\bchildren\b/i,
  /\bchild\b/i,
  /\bkid\b/i,
  /\badults\b/i,
  /\badult\b/i,
  /\bolder adults\b/i,
  /\bolder-adults\b/i,
  /\bolder adult\b/i,
];

function getCoreEnglishForms() {
  return ALL_FORMS.filter((form) => form?.approved === true && form?.category === 'adolescents_cbt_core' && form?.language === 'en' && form?.audience === 'adolescents');
}

function getSpecializedEnglishForms() {
  return ALL_FORMS.filter((form) => form?.approved === true && form?.category === 'adolescents_cbt_specialized' && form?.language === 'en' && form?.audience === 'adolescents');
}

function getChildrenCoreEnglishForms() {
  return ALL_FORMS.filter((form) => form?.approved === true && form?.category === 'children_cbt_core' && form?.language === 'en' && form?.audience === 'children');
}

function getChildrenCoreEnglishIndividualForms() {
  return getChildrenCoreEnglishForms().filter((form) => form?.type === 'individual_worksheet' && form?.parentSeriesId === CHILDREN_CBT_CORE_EN_SERIES_ID);
}

function getCoreEnglishPackageForm() {
  return getCoreEnglishForms().find((form) => form?.id === ADOLESCENTS_CBT_CORE_EN_ID && form?.type === 'workbook_package') || null;
}

function getSpecializedEnglishPackageForm() {
  return getSpecializedEnglishForms().find((form) => form?.id === ADOLESCENTS_CBT_SPECIALIZED_EN_ID && form?.type === 'workbook_package') || null;
}

function getCoreEnglishIndividualForms() {
  return getCoreEnglishForms().filter((form) => form?.type === 'individual_worksheet' && form?.parentSeriesId === ADOLESCENTS_CBT_CORE_EN_ID);
}

function getSpecializedEnglishModuleForms() {
  return getSpecializedEnglishForms()
    .filter((form) => form?.type === 'module_pdf' && form?.parentSeriesId === ADOLESCENTS_CBT_SPECIALIZED_EN_ID)
    .sort((a, b) => Number(a?.moduleNumber || 0) - Number(b?.moduleNumber || 0));
}

function buildApprovedIntentMap() {
  const map = {};
  const forms = ALL_FORMS.filter((form) => form?.approved === true);

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

function requestsDisallowedAudience(normalizedQuery) {
  return DISALLOWED_AUDIENCE_PATTERNS.some((pattern) => pattern.test(normalizedQuery));
}

function requestsHebrew(normalizedQuery) {
  return containsAny(normalizedQuery, ['hebrew', 'עברית']);
}

function hasExplicitEnglishRequest(normalizedQuery) {
  return containsAny(normalizedQuery, ['english', 'in english', ' באנגלית', 'אנגלית']);
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

  if (!best || bestScore < 40) return null;
  return resolveApprovedFormById(best.id, 'en');
}

function isSpecializedPackageLevelRequest(normalizedQuery) {
  if (APPROVED_FORM_INTENT_MAP[normalizedQuery] === ADOLESCENTS_CBT_SPECIALIZED_EN_ID) {
    return true;
  }

  const hasFullSignal = containsAny(normalizedQuery, ['full', 'complete', 'all', 'entire', 'whole']);
  const hasSeriesSignal = containsAny(normalizedQuery, ['specialized series', 'specialised series', 'specialized workbook', 'specialised workbook', '60-form', '60 form', 'all modules', 'module 01']);
  if (hasFullSignal && hasSeriesSignal) return true;

  return containsAny(normalizedQuery, SPECIALIZED_FULL_SERIES_HINTS);
}

function extractRequestedSpecializedModuleNumber(normalizedQuery) {
  const explicitModuleMatch = normalizedQuery.match(/\b(?:module|category)\s*0?([1-9]|10)\b/i);
  if (explicitModuleMatch) return Number(explicitModuleMatch[1]);

  const explicitHashMatch = normalizedQuery.match(/\b(?:module|category)\s*#\s*0?([1-9]|10)\b/i);
  if (explicitHashMatch) return Number(explicitHashMatch[1]);

  const genericCodeMatch = normalizedQuery.match(/\b0?([1-9]|10)(?:\.[0-9]{1,2})\b/);
  if (genericCodeMatch) return Number(genericCodeMatch[1]);

  return null;
}

function scoreSpecializedModuleMatch(form, normalizedQuery) {
  let score = 0;

  const normalizedTitle = normalizeText(form?.title);
  const normalizedDescription = normalizeText(form?.description);
  const normalizedGoal = normalizeText(form?.therapeuticGoal);
  const normalizedWhenToUse = normalizeText(form?.whenToUse);
  const normalizedIndication = normalizeText(form?.clinicalIndication);
  const normalizedModuleCode = normalizeText(form?.moduleCode);
  const normalizedModuleNumber = String(form?.moduleNumber || '');

  if (normalizedModuleCode && normalizedQuery.includes(`module ${normalizedModuleCode}`)) score += 160;
  if (normalizedModuleNumber && normalizedQuery.includes(`module ${normalizedModuleNumber}`)) score += 150;
  if (normalizedModuleCode && normalizedQuery.includes(`category ${normalizedModuleCode}`)) score += 120;
  if (normalizedTitle && normalizedQuery.includes(normalizedTitle)) score += 90;

  if (Array.isArray(form?.intentPhrases)) {
    for (const phrase of form.intentPhrases) {
      const normalizedPhrase = normalizeText(phrase);
      if (!normalizedPhrase) continue;
      if (normalizedQuery.includes(normalizedPhrase)) score += 80;
    }
  }

  if (Array.isArray(form?.clinicalKeywords)) {
    for (const keyword of form.clinicalKeywords) {
      const normalizedKeyword = normalizeText(keyword);
      if (!normalizedKeyword) continue;
      if (normalizedQuery.includes(normalizedKeyword)) score += 50;
    }
  }

  if (Array.isArray(form?.contentThemes)) {
    for (const theme of form.contentThemes) {
      const normalizedTheme = normalizeText(theme);
      if (!normalizedTheme) continue;
      if (normalizedQuery.includes(normalizedTheme)) score += 25;
    }
  }

  if (Array.isArray(form?.notFor)) {
    for (const exclusion of form.notFor) {
      const normalizedExclusion = normalizeText(exclusion);
      if (!normalizedExclusion) continue;
      if (normalizedQuery.includes(normalizedExclusion)) score -= 70;
    }
  }

  if (normalizedDescription && normalizedQuery.length > 8) {
    const words = normalizedQuery.split(/\s+/).filter(Boolean);
    for (const word of words) {
      if (word.length < 4) continue;
      if (normalizedDescription.includes(word)) score += 4;
      if (normalizedGoal.includes(word)) score += 4;
      if (normalizedWhenToUse.includes(word)) score += 4;
      if (normalizedIndication.includes(word)) score += 4;
    }
  }

  return score;
}

function resolveSpecializedModuleByNumber(moduleNumber) {
  if (!Number.isInteger(moduleNumber)) return null;
  const moduleForm = getSpecializedEnglishModuleForms().find((form) => Number(form?.moduleNumber) === moduleNumber);
  if (!moduleForm) return null;
  return resolveApprovedFormById(moduleForm.id, 'en');
}

function resolveSpecializedModuleByContent(normalizedQuery) {
  const modules = getSpecializedEnglishModuleForms();
  if (modules.length === 0) return null;

  let best = null;
  let bestScore = 0;

  for (const moduleForm of modules) {
    const score = scoreSpecializedModuleMatch(moduleForm, normalizedQuery);
    if (score > bestScore) {
      best = moduleForm;
      bestScore = score;
    }
  }

  if (!best || bestScore <= 0) return null;
  return resolveApprovedFormById(best.id, 'en');
}

function hasChildCbtSignals(normalizedQuery) {
  const childTerms = ['child', 'children', 'kid', 'kids', 'young child'];
  const cbtTerms = [
    'cbt',
    'emotion',
    'feeling',
    'feelings',
    'thought',
    'thoughts',
    'worry',
    'anxiety',
    'brave',
    'calm',
    'regulation',
    'worksheet',
    'form',
    'coping',
    'small step',
  ];
  return containsAny(normalizedQuery, childTerms) && containsAny(normalizedQuery, cbtTerms);
}

function resolveChildrenCoreEnglishIndividualByFormNumber(formNumber) {
  if (!formNumber) return null;
  // Children worksheets use form numbers 1.1–5.6
  const individual = getChildrenCoreEnglishIndividualForms().find((form) => form?.formNumber === formNumber);
  if (!individual) return null;
  return resolveApprovedFormById(individual.id, 'en');
}

function resolveChildrenCoreEnglishIndividualByContent(normalizedQuery) {
  const candidates = getChildrenCoreEnglishIndividualForms();
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

function detectRequestedAudience(normalizedQuery) {
  if (!normalizedQuery) return null;
  if (/\bchildren\b|\bchild\b|\bkid\b|\bkids\b/i.test(normalizedQuery)) return 'children';
  if (/\badolescents?\b|\bteen(?:ager)?s?\b|\byouth\b/i.test(normalizedQuery)) return 'adolescents';
  if (/\bolder adults?\b|\bsenior(s)?\b|\belderly\b/i.test(normalizedQuery)) return 'older_adults';
  if (/\badults?\b/i.test(normalizedQuery)) return 'adults';
  return null;
}

function scoreDynamicFormMatch(form, normalizedQuery) {
  let score = 0;
  const fields = [
    form?.title,
    form?.description,
    form?.therapeuticGoal,
    form?.whenToUse,
    form?.aiMatchingSummary,
    form?.therapeutic_goal,
    form?.when_to_use,
    form?.ai_matching_summary,
    form?.moduleTitle,
    form?.module_title,
    form?.worksheetNumber,
    form?.worksheet_number,
    form?.category,
    form?.subcategory,
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  for (const field of fields) {
    if (normalizedQuery.includes(field)) score += 100;
    const terms = field.split(/\s+/).filter((t) => t.length > 3);
    for (const term of terms) {
      if (normalizedQuery.includes(term)) score += 6;
    }
  }

  const keywords = [
    ...(Array.isArray(form?.clinicalKeywords) ? form.clinicalKeywords : []),
    ...(Array.isArray(form?.keywords) ? form.keywords : []),
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  for (const keyword of keywords) {
    if (normalizedQuery.includes(keyword)) score += 30;
  }

  return score;
}

function resolveDynamicFormByContent(query, options = {}) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  const activeLanguage = normalizeText(options.activeLanguage || 'en') || 'en';
  const explicitEnglish = hasExplicitEnglishRequest(normalizedQuery);
  const explicitHebrew = requestsHebrew(normalizedQuery);
  const requestedAudience = detectRequestedAudience(normalizedQuery);
  const targetLanguage = explicitEnglish ? 'en' : explicitHebrew ? 'he' : activeLanguage;

  const candidates = ALL_FORMS.filter((form) => {
    if (form?.approved !== true) return false;
    if (form?.type === 'stage_group') return false;
    if (!form?.languages?.[targetLanguage]) return false;
    if (requestedAudience && form?.audience !== requestedAudience) return false;
    return true;
  });

  let best = null;
  let bestScore = 0;

  for (const form of candidates) {
    const score = scoreDynamicFormMatch(form, normalizedQuery);
    if (score > bestScore) {
      best = form;
      bestScore = score;
    }
  }

  if (!best || bestScore <= 0) return null;
  return resolveApprovedFormById(best.id, targetLanguage);
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

  const bySpecializedContent = resolveAdolescentsCBTSpecializedEnglishFormByContent(normalizedIntent, {
    activeLanguage: resolvedLang,
  });
  if (bySpecializedContent) return bySpecializedContent;

  const byCoreContent = resolveAdolescentsCBTCoreEnglishFormByContent(normalizedIntent, {
    activeLanguage: resolvedLang,
  });
  if (byCoreContent) return byCoreContent;

  const byChildrenContent = resolveChildrenCBTCoreEnglishFormByContent(normalizedIntent, {
    activeLanguage: resolvedLang,
  });
  if (byChildrenContent) return byChildrenContent;

  const byDynamicContent = resolveDynamicFormByContent(normalizedIntent, {
    activeLanguage: resolvedLang,
  });
  if (byDynamicContent) return byDynamicContent;

  return null;
}

export function resolveChildrenCBTPremiumFormByContent(_query) {
  return null;
}

export function resolveChildrenCBTSpecializedFormByContent(_query) {
  return null;
}

export function resolveChildrenCBTCoreEnglishFormByContent(query, options = {}) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  const activeLanguage = normalizeText(options.activeLanguage || 'en') || 'en';
  const explicitEnglish = hasExplicitEnglishRequest(normalizedQuery);

  // English-only guard — never expose in non-English language mode
  if (activeLanguage !== 'en' && !explicitEnglish) return null;
  if (requestsHebrew(normalizedQuery) && !explicitEnglish) return null;

  // Reject requests that explicitly ask for adolescent/adult audience
  const NON_CHILD_AUDIENCE = [/\badolescents?\b/i, /\bteen(?:age(?:r)?)?\b/i, /\badults?\b/i, /\bolder adults?\b/i];
  if (NON_CHILD_AUDIENCE.some((p) => p.test(normalizedQuery))) return null;

  // Extract children-specific form numbers (stages 1-5, worksheets 1-6)
  const childFormMatch = normalizedQuery.match(/\b(?:form|worksheet)\s*([1-5])(?:\.|\-|\s)([1-6])\b/i);
  const shortChildFormMatch = normalizedQuery.match(/\b([1-5])\.([1-6])\b/);
  const formNumber = childFormMatch
    ? `${childFormMatch[1]}.${childFormMatch[2]}`
    : shortChildFormMatch
      ? `${shortChildFormMatch[1]}.${shortChildFormMatch[2]}`
      : null;

  if (formNumber) {
    const byFormNumber = resolveChildrenCoreEnglishIndividualByFormNumber(formNumber);
    if (byFormNumber) return byFormNumber;
  }

  const byContent = resolveChildrenCoreEnglishIndividualByContent(normalizedQuery);
  if (byContent) return byContent;

  // Fallback: only respond if there are clear child CBT signals
  if (!hasChildCbtSignals(normalizedQuery) && !APPROVED_FORM_INTENT_MAP[normalizedQuery]) return null;

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

export function resolveAdolescentsCBTSpecializedEnglishFormByContent(query, options = {}) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  const activeLanguage = normalizeText(options.activeLanguage || 'en') || 'en';
  if (activeLanguage !== 'en') return null;
  if (requestsDisallowedAudience(normalizedQuery)) return null;
  if (requestsHebrew(normalizedQuery)) return null;

  if (isSpecializedPackageLevelRequest(normalizedQuery)) {
    return resolveApprovedFormById(ADOLESCENTS_CBT_SPECIALIZED_EN_ID, 'en');
  }

  const requestedModule = extractRequestedSpecializedModuleNumber(normalizedQuery);
  const byModuleNumber = resolveSpecializedModuleByNumber(requestedModule);
  if (byModuleNumber) return byModuleNumber;

  const byModuleContent = resolveSpecializedModuleByContent(normalizedQuery);
  if (byModuleContent) return byModuleContent;

  return null;
}

export function resolveSpecializedModuleIdByCode(moduleCode) {
  const normalizedCode = String(moduleCode || '').padStart(2, '0');
  if (!/^(0[1-9]|10)$/.test(normalizedCode)) return null;
  const candidateId = `${SPECIALIZED_MODULE_ID_PREFIX}${normalizedCode}`;
  const exists = getSpecializedEnglishModuleForms().some((form) => form.id === candidateId);
  return exists ? candidateId : null;
}

/**
 * Therapeutic form intent resolver.
 */

import {
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
  ALL_FORMS,
  resolveFormForAIRequest,
  createGeneratedFileFromResolvedForm,
} from '../data/therapeuticForms/index.js';

const ADOLESCENTS_CBT_CORE_EN_ID = 'adolescents-cbt-core-en';
const ADOLESCENTS_CBT_SPECIALIZED_EN_ID = 'adolescents-cbt-specialized-en';
const SPECIALIZED_MODULE_ID_PREFIX = `${ADOLESCENTS_CBT_SPECIALIZED_EN_ID}-module-`;
const CHILDREN_CBT_CORE_EN_SERIES_ID = 'children-cbt-core-en';
const CHILDREN_CBT_SPECIALIZED_EN_SERIES_ID = 'children-cbt-specialized-en';

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

const MIN_SPECIALIZED_MODULE_MATCH_SCORE = 40;
const DYNAMIC_EXACT_FIELD_MATCH_SCORE = 100;
const DYNAMIC_TERM_MATCH_SCORE = 6;
const DYNAMIC_KEYWORD_MATCH_SCORE = 30;
const NON_CHILD_AUDIENCE_PATTERNS = [/\badolescents?\b/i, /\bteen(?:age(?:r)?)?\b/i, /\badults?\b/i, /\bolder adults?\b/i];

function getCoreEnglishForms() {
  return ALL_FORMS.filter((form) => form?.approved === true && form?.category === 'adolescents_cbt_core' && form?.language === 'en' && form?.audience === 'adolescents');
}

function getSpecializedEnglishForms() {
  return ALL_FORMS.filter((form) => form?.approved === true && form?.category === 'adolescents_cbt_specialized' && form?.language === 'en' && form?.audience === 'adolescents');
}

function getChildrenCoreEnglishForms() {
  return ALL_FORMS.filter((form) => form?.approved === true && form?.category === 'children_cbt_core' && form?.language === 'en' && form?.audience === 'children');
}

function getChildrenSpecializedEnglishForms() {
  return ALL_FORMS.filter((form) => form?.approved === true && form?.category === 'children_cbt_specialized' && form?.language === 'en' && form?.audience === 'children');
}

function getChildrenCoreEnglishIndividualForms() {
  return getChildrenCoreEnglishForms().filter((form) => form?.type === 'individual_worksheet' && form?.parentSeriesId === CHILDREN_CBT_CORE_EN_SERIES_ID);
}

function getChildrenSpecializedEnglishIndividualForms() {
  return getChildrenSpecializedEnglishForms().filter((form) => form?.type === 'individual_worksheet' && form?.parentSeriesId === CHILDREN_CBT_SPECIALIZED_EN_SERIES_ID);
}

function getChildrenSpecializedEnglishModuleForms() {
  return getChildrenSpecializedEnglishForms()
    .filter((form) => form?.type === 'module_pdf' && form?.parentSeriesId === CHILDREN_CBT_SPECIALIZED_EN_SERIES_ID);
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
  const normalizedCandidateId = normalizeLegacyWorksheetAlias(candidateId);
  const match = ALL_FORMS.find(
    (form) =>
      form?.approved === true &&
      typeof form.id === 'string' &&
      (
        form.id === candidateId ||
        form.id === normalizedCandidateId ||
        (typeof form.slug === 'string' && (form.slug === candidateId || form.slug === normalizedCandidateId))
      )
  );
  return match?.id || null;
}

function normalizeLegacyWorksheetAlias(candidate) {
  const raw = String(candidate || '').trim().toLowerCase();
  if (!raw) return raw;

  const childrenMatch = raw.match(/^children[_-]cbt[_-]core[_-]en[_-](\d{1,2})[_-](\d{1,2})$/);
  if (childrenMatch) {
    const stage = Number(childrenMatch[1]);
    const worksheet = Number(childrenMatch[2]);
    if (Number.isFinite(stage) && Number.isFinite(worksheet)) {
      return `children-cbt-core-en-${stage}-${worksheet}`;
    }
  }

  const adolescentsMatch = raw.match(/^adolescents[_-]cbt[_-]core[_-]en[_-](\d{1,2})[_-](\d{1,2})$/);
  if (adolescentsMatch) {
    const stage = Number(adolescentsMatch[1]);
    const worksheet = Number(adolescentsMatch[2]);
    if (Number.isFinite(stage) && Number.isFinite(worksheet)) {
      return `adolescents-cbt-core-en-${stage}-${worksheet}`;
    }
  }

  return raw;
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

  if (!best || bestScore < MIN_SPECIALIZED_MODULE_MATCH_SCORE) return null;
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

function extractChildrenSpecializedWorksheetNumber(normalizedQuery) {
  const explicit = normalizedQuery.match(/\b(?:worksheet|form)\s*([1-5])(?:\.|\-|\s)([1-5])(?:\.|\-|\s)(10|[1-9])\b/i);
  if (explicit) return `${explicit[1]}.${explicit[2]}.${explicit[3]}`;
  const short = normalizedQuery.match(/\b([1-5])\.([1-5])\.(10|[1-9])\b/);
  if (short) return `${short[1]}.${short[2]}.${short[3]}`;
  return null;
}

function extractChildrenSpecializedSubcategoryNumber(normalizedQuery) {
  const explicit = normalizedQuery.match(/\b(?:subcategory|module|pack)\s*([1-5])(?:\.|\-|\s)([1-5])\b/i);
  if (explicit) return `${explicit[1]}.${explicit[2]}`;
  const short = normalizedQuery.match(/\b([1-5])\.([1-5])\b/);
  if (short) return `${short[1]}.${short[2]}`;
  return null;
}

function isChildrenSpecializedPackRequest(normalizedQuery) {
  return containsAny(normalizedQuery, ['pack', 'module', 'pdf', 'worksheet pack', 'send pack']);
}

function hasChildrenSpecializedSignals(normalizedQuery) {
  return containsAny(normalizedQuery, [
    'separation anxiety',
    'separate from',
    'specific phobia',
    'afraid of',
    'social anxiety',
    'speak in class',
    'test anxiety',
    'performance anxiety',
    'freezes before tests',
    'everyday worries',
    'worries about everything',
    'anger outburst',
    'explodes when frustrated',
    'oppositional',
    'odd',
    'argues with parents',
    'refuses instructions',
    'impulsivity',
    'acts before thinking',
    'low self-esteem',
    'not good enough',
    'social difficulties',
    'join games',
    'sticky thoughts',
    'ritual',
    'ocd',
    'trauma-sensitive',
    'grounding and safety',
    'sleep problems',
    'bedtime worries',
    'psychosomatic',
    'stomach aches',
    'enuresis',
    'encopresis',
    'shame about accidents',
    'children specialized',
    'cbt specialized',
  ]);
}

function resolveChildrenSpecializedEnglishIndividualByWorksheetNumber(worksheetNumber) {
  if (!worksheetNumber) return null;
  const individual = getChildrenSpecializedEnglishIndividualForms().find((form) => {
    const formWorksheetNumber = String(form?.worksheetNumber || form?.worksheet_number || '').trim();
    return formWorksheetNumber === worksheetNumber;
  });
  if (!individual) return null;
  return resolveApprovedFormById(individual.id, 'en');
}

function resolveChildrenSpecializedEnglishModuleBySubcategory(subcategoryNumber) {
  if (!subcategoryNumber) return null;
  const moduleForm = getChildrenSpecializedEnglishModuleForms().find((form) => {
    const code = String(form?.subcategoryNumber || form?.moduleCode || form?.formNumber || '').trim();
    return code === subcategoryNumber;
  });
  if (!moduleForm) return null;
  return resolveApprovedFormById(moduleForm.id, 'en');
}

function resolveChildrenSpecializedEnglishByContent(normalizedQuery) {
  const individualForms = getChildrenSpecializedEnglishIndividualForms();
  const moduleForms = getChildrenSpecializedEnglishModuleForms();
  if (individualForms.length === 0 || moduleForms.length === 0) return null;

  const wantsPack = isChildrenSpecializedPackRequest(normalizedQuery);
  const candidates = wantsPack ? moduleForms : individualForms;
  let best = null;
  let bestScore = 0;

  for (const form of candidates) {
    const score = scoreDynamicFormMatch(form, normalizedQuery);
    if (score > bestScore) {
      best = form;
      bestScore = score;
    }
  }

  if (best && bestScore > 0) {
    return resolveApprovedFormById(best.id, 'en');
  }

  return null;
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
    if (normalizedQuery.includes(field)) score += DYNAMIC_EXACT_FIELD_MATCH_SCORE;
    const terms = field.split(/\s+/).filter((t) => t.length > 3);
    for (const term of terms) {
      if (normalizedQuery.includes(term)) score += DYNAMIC_TERM_MATCH_SCORE;
    }
  }

  const keywords = [
    ...(Array.isArray(form?.clinicalKeywords) ? form.clinicalKeywords : []),
    ...(Array.isArray(form?.keywords) ? form.keywords : []),
  ]
    .map((value) => normalizeText(value))
    .filter(Boolean);

  for (const keyword of keywords) {
    if (normalizedQuery.includes(keyword)) score += DYNAMIC_KEYWORD_MATCH_SCORE;
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
  const normalizedIntentAlias = normalizeLegacyWorksheetAlias(normalizedIntent);
  const resolvedLang = typeof lang === 'string' && lang.trim() ? lang.trim() : 'en';

  const formId =
    APPROVED_FORM_INTENT_MAP[normalizedIntent] ||
    APPROVED_FORM_INTENT_MAP[normalizedIntentAlias] ||
    findApprovedExactFormId(normalizedIntentAlias);
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

  const byChildrenSpecializedContent = resolveChildrenCBTSpecializedFormByContent(normalizedIntent, {
    activeLanguage: resolvedLang,
  });
  if (byChildrenSpecializedContent) return byChildrenSpecializedContent;

  const byChildrenContent = resolveChildrenCBTCoreEnglishFormByContent(normalizedIntent, {
    activeLanguage: resolvedLang,
  });
  if (byChildrenContent) return byChildrenContent;

  const byDynamicContent = resolveDynamicFormByContent(normalizedIntent, {
    activeLanguage: resolvedLang,
  });
  if (byDynamicContent) return byDynamicContent;

  const byRegistrySearch = resolveFormForAIRequest(intentOrSlug, {
    activeLanguage: resolvedLang,
    force: true,
    limit: 5,
  });
  if (byRegistrySearch?.form) {
    return createGeneratedFileFromResolvedForm(byRegistrySearch.form);
  }

  return null;
}

export function resolveChildrenCBTPremiumFormByContent(_query) {
  return null;
}

export function resolveChildrenCBTSpecializedFormByContent(query, options = {}) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return null;

  const activeLanguage = normalizeText(options.activeLanguage || 'en') || 'en';
  const explicitEnglish = hasExplicitEnglishRequest(normalizedQuery);

  if (activeLanguage !== 'en' && !explicitEnglish) return null;
  if (requestsHebrew(normalizedQuery) && !explicitEnglish) return null;

  if (NON_CHILD_AUDIENCE_PATTERNS.some((p) => p.test(normalizedQuery))) return null;

  const worksheetNumber = extractChildrenSpecializedWorksheetNumber(normalizedQuery);
  if (worksheetNumber) {
    const byWorksheetNumber = resolveChildrenSpecializedEnglishIndividualByWorksheetNumber(worksheetNumber);
    if (byWorksheetNumber) return byWorksheetNumber;
  }

  const subcategoryNumber = extractChildrenSpecializedSubcategoryNumber(normalizedQuery);
  if (subcategoryNumber) {
    const bySubcategoryNumber = resolveChildrenSpecializedEnglishModuleBySubcategory(subcategoryNumber);
    if (bySubcategoryNumber) return bySubcategoryNumber;
  }

  if (!hasChildrenSpecializedSignals(normalizedQuery)) return null;

  const byContent = resolveChildrenSpecializedEnglishByContent(normalizedQuery);
  if (byContent) return byContent;

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
  if (NON_CHILD_AUDIENCE_PATTERNS.some((p) => p.test(normalizedQuery))) return null;

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

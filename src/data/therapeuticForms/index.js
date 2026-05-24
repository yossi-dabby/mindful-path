/**
 * TherapeuticForms — Public Index
 *
 * The single entry point for the TherapeuticForms library.
 *
 * Exports:
 *   - Taxonomy: AUDIENCE_GROUPS, THERAPEUTIC_CATEGORIES, SUPPORTED_LANGUAGES, RTL_LANGUAGES
 *   - Registry: ALL_FORMS (aggregated, read-only)
 *   - Resolver: all resolver utility functions
 *
 * Usage:
 *   import { listFormsByAudience, resolveFormWithLanguage } from '@/data/therapeuticForms';
 */

import GENERATED_THERAPEUTIC_FORMS_INDEX from '../../generated/therapeutic-forms-index.json';
import { SUPPORTED_LANGUAGES, VALID_AUDIENCE_VALUES } from './categories.js';

// ─── Taxonomy ─────────────────────────────────────────────────────────────────
export {
  AUDIENCE_GROUPS,
  THERAPEUTIC_CATEGORIES,
  SUPPORTED_LANGUAGES,
  RTL_LANGUAGES,
  VALID_AUDIENCE_VALUES,
  VALID_CATEGORY_VALUES,
} from './categories.js';

// ─── Per-audience form registries ─────────────────────────────────────────────
export { FORMS_CHILDREN }              from './forms.children.js';
export { FORMS_CHILDREN_CBT_PREMIUM }  from './forms.children.cbt-premium.js';
export { FORMS_CHILDREN_CBT_SPECIALIZED } from './forms.children.cbt-specialized.js';
export { FORMS_CHILDREN_CBT_CORE_EN } from './forms.children.cbt-core.en.js';
export { FORMS_ADOLESCENTS }           from './forms.adolescents.js';
export { FORMS_ADOLESCENTS_CBT_CORE_EN } from './forms.adolescents.cbt-core.en.js';
export { FORMS_ADOLESCENTS_CBT_SPECIALIZED } from './forms.adolescents.cbt-specialized.js';
export { FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN } from './forms.adolescents.cbt-specialized.en.js';
export { FORMS_ADULTS }                from './forms.adults.js';
export { FORMS_OLDER_ADULTS }          from './forms.olderAdults.js';

// ─── Aggregated registry ──────────────────────────────────────────────────────

function buildCanonicalRegistry(forms) {
  const byId = new Map();
  for (const form of forms) {
    if (!form?.id) continue;
    if (byId.has(form.id)) {
      if (import.meta.env?.DEV) {
        console.warn(`[TherapeuticForms] Duplicate form id in canonical registry ignored: ${form.id}`);
      }
      continue;
    }
    byId.set(form.id, form);
  }
  return Object.freeze(Array.from(byId.values()));
}

/**
 * The complete, aggregated therapeutic forms registry.
 * This is the single source of truth consumed by the resolver.
 *
 * Adding new forms: add entries to the relevant per-audience file.
 * The resolver picks them up automatically via this aggregation.
 *
 * @type {readonly object[]}
 */
export const ALL_FORMS = buildCanonicalRegistry([
  ...GENERATED_THERAPEUTIC_FORMS_INDEX,
]);

function hashStringFNV1a(input) {
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

function buildTherapeuticFormsPolicyVersion(forms) {
  const serialized = forms
    .map((form) => [
      form?.id || '',
      form?.language || '',
      form?.audience || '',
      form?.category || '',
      form?.file_path || form?.filePath || form?.fileUrl || '',
    ].join('|'))
    .sort()
    .join('\n');

  return `forms-${forms.length}-${hashStringFNV1a(serialized)}`;
}

export const THERAPEUTIC_FORMS_POLICY_VERSION = buildTherapeuticFormsPolicyVersion(ALL_FORMS);

const FORM_INDEX_SOURCE_PATH = 'src/generated/therapeutic-forms-index.json';
const SUPPORTED_LANG_SET = new Set(SUPPORTED_LANGUAGES);
const VALID_AUDIENCE_SET = new Set(VALID_AUDIENCE_VALUES);
const LANGUAGE_ALIAS_MAP = Object.freeze({
  english: 'en',
  hebrew: 'he',
  spanish: 'es',
  french: 'fr',
  german: 'de',
  italian: 'it',
  portuguese: 'pt',
});
const AUDIENCE_ALIAS_MAP = Object.freeze({
  child: 'children',
  children: 'children',
  kid: 'children',
  kids: 'children',
  adolescent: 'adolescents',
  adolescents: 'adolescents',
  teen: 'adolescents',
  teens: 'adolescents',
  teenager: 'adolescents',
  teenagers: 'adolescents',
  adult: 'adults',
  adults: 'adults',
  older_adult: 'older_adults',
  older_adults: 'older_adults',
  'older-adult': 'older_adults',
  'older-adults': 'older_adults',
  parent: 'parents',
  parents: 'parents',
});
const LANGUAGE_DETECTION_TERMS = Object.freeze([
  ['en', ['english', 'in english', 'אנגלית', 'באנגלית']],
  ['he', ['hebrew', 'עברית', 'בעברית']],
  ['es', ['spanish', 'español', 'בספרדית']],
  ['fr', ['french', 'français', 'בצרפתית']],
  ['de', ['german', 'deutsch', 'בגרמנית']],
  ['it', ['italian', 'italiano', 'באיטלקית']],
  ['pt', ['portuguese', 'português', 'בפורטוגזית']],
]);
const AUDIENCE_DETECTION_TERMS = Object.freeze([
  ['children', ['children', 'child', 'kids', 'kid', 'ילד', 'ילדה', 'ילדים', 'ילדות']],
  ['adolescents', ['adolescent', 'adolescents', 'teen', 'teens', 'teenager', 'teenagers', 'נוער', 'מתבגר', 'מתבגרים', 'נער', 'נערה']],
  ['adults', ['adult', 'adults', 'מבוגר', 'מבוגרים']],
  ['older_adults', ['older adults', 'older adult', 'senior', 'seniors', 'elderly', 'גיל שלישי']],
  ['parents', ['parent', 'parents', 'הורה', 'הורים']],
]);
const FORM_REQUEST_TERMS = Object.freeze([
  'form',
  'forms',
  'worksheet',
  'worksheets',
  'workbook',
  'sheet',
  'pdf',
  'send',
  'share',
  'recommend',
  'need',
  'טופס',
  'טפסים',
  'דף',
  'דפים',
  'חוברת',
  'שלח',
  'תשלח',
  'תשלחי',
  'שתף',
  'שתפי',
]);
const AI_SEARCH_MIN_TERM_LENGTH = 2;

function normalizeFreeText(value) {
  return String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[_-]+/g, ' ')
    .replace(/[^\p{L}\p{N}\s./]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenizeSearchText(value) {
  return normalizeFreeText(value)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= AI_SEARCH_MIN_TERM_LENGTH);
}

function toArray(value) {
  return Array.isArray(value) ? value.filter(Boolean) : [];
}

function normalizeCategoryFilter(category) {
  if (typeof category !== 'string' || !category.trim()) return null;
  return category.trim().toLowerCase().replace(/-/g, '_');
}

function normalizeSubcategoryFilter(subcategory) {
  if (typeof subcategory !== 'string' || !subcategory.trim()) return null;
  return subcategory.trim().toLowerCase();
}

function detectLanguageFromText(text) {
  const normalized = normalizeFreeText(text);
  if (!normalized) return null;
  for (const [languageCode, terms] of LANGUAGE_DETECTION_TERMS) {
    if (terms.some((term) => normalized.includes(normalizeFreeText(term)))) return languageCode;
  }
  return null;
}

function detectAudienceFromText(text) {
  const normalized = normalizeFreeText(text);
  if (!normalized) return null;
  for (const [audience, terms] of AUDIENCE_DETECTION_TERMS) {
    if (terms.some((term) => normalized.includes(normalizeFreeText(term)))) return audience;
  }
  return null;
}

function hasFormRequestSignal(text) {
  const normalized = normalizeFreeText(text);
  if (!normalized) return false;
  return FORM_REQUEST_TERMS.some((term) => normalized.includes(normalizeFreeText(term)));
}

function safeFileNameFromPath(filePath) {
  const normalized = String(filePath || '').trim();
  if (!normalized) return 'therapeutic-form.pdf';
  const withoutQuery = normalized.split('?')[0].split('#')[0];
  const segments = withoutQuery.split('/').filter(Boolean);
  return segments[segments.length - 1] || 'therapeutic-form.pdf';
}

function stripDownloadQuery(url) {
  if (typeof url !== 'string' || !url.trim()) return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed, 'https://example.local');
    parsed.searchParams.delete('download');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return trimmed
      .replace(/[?&]download(?:=1|=true)?\b/g, '')
      .replace(/[?&]$/, '');
  }
}

function buildDownloadUrl(url) {
  const stripped = stripDownloadQuery(url);
  if (!stripped) return null;
  if (!stripped.startsWith('/')) return stripped;
  try {
    const parsed = new URL(stripped, 'https://example.local');
    parsed.searchParams.set('download', '1');
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return stripped.includes('?') ? `${stripped}&download=1` : `${stripped}?download=1`;
  }
}

function buildOpenUrl(url) {
  const stripped = stripDownloadQuery(url);
  if (!stripped) return null;
  if (!stripped.startsWith('/')) return stripped;
  return `/pdf-viewer?file=${encodeURIComponent(stripped)}`;
}

function getFormSearchCorpus(form) {
  return [
    form?.id,
    form?.slug,
    form?.title,
    form?.description,
    form?.category,
    form?.subcategory,
    form?.series,
    form?.moduleCode,
    form?.moduleTitle,
    form?.module_title,
    form?.worksheetNumber,
    form?.worksheet_number,
    form?.therapeuticGoal,
    form?.therapeutic_goal,
    form?.whenToUse,
    form?.when_to_use,
    form?.aiMatchingSummary,
    form?.ai_matching_summary,
    ...toArray(form?.clinicalKeywords),
    ...toArray(form?.keywords),
    ...toArray(form?.intentPhrases),
    ...toArray(form?.notFor),
  ]
    .map((value) => normalizeFreeText(value))
    .filter(Boolean);
}

function scoreFormForQuery(form, queryTokens, normalizedQuery) {
  const corpus = getFormSearchCorpus(form);
  const corpusJoined = corpus.join(' ');
  let score = 0;

  for (const token of queryTokens) {
    if (!token) continue;
    if (corpusJoined.includes(token)) score += 8;
    if (normalizeFreeText(form?.title).includes(token)) score += 16;
    if (toArray(form?.keywords).some((keyword) => normalizeFreeText(keyword).includes(token))) score += 12;
    if (toArray(form?.clinicalKeywords).some((keyword) => normalizeFreeText(keyword).includes(token))) score += 12;
  }

  if (normalizedQuery && normalizeFreeText(form?.title) && normalizedQuery.includes(normalizeFreeText(form?.title))) {
    score += 80;
  }
  if (normalizedQuery && normalizeFreeText(form?.therapeuticGoal) && normalizedQuery.includes(normalizeFreeText(form?.therapeuticGoal))) {
    score += 24;
  }
  if (normalizedQuery && normalizeFreeText(form?.whenToUse) && normalizedQuery.includes(normalizeFreeText(form?.whenToUse))) {
    score += 24;
  }
  if (normalizedQuery && normalizeFreeText(form?.aiMatchingSummary) && normalizedQuery.includes(normalizeFreeText(form?.aiMatchingSummary))) {
    score += 20;
  }

  return score;
}

function normalizeLanguageFilter(language) {
  if (typeof language !== 'string' || !language.trim()) return null;
  const lower = language.trim().toLowerCase();
  const aliased = LANGUAGE_ALIAS_MAP[lower] || lower;
  const base = aliased.split('-')[0];
  return SUPPORTED_LANG_SET.has(base) ? base : null;
}

function normalizeAudienceFilter(audience) {
  if (typeof audience !== 'string' || !audience.trim()) return null;
  const lower = audience.trim().toLowerCase();
  const normalized = AUDIENCE_ALIAS_MAP[lower] || lower;
  return VALID_AUDIENCE_SET.has(normalized) ? normalized : null;
}

function resolveEnvironmentLabel(environmentOverride) {
  if (typeof environmentOverride === 'string' && environmentOverride.trim()) {
    return environmentOverride.trim();
  }
  return import.meta.env?.MODE || (import.meta.env?.PROD ? 'production' : 'unknown');
}

export function getTherapeuticFormsPolicyVersion() {
  return THERAPEUTIC_FORMS_POLICY_VERSION;
}

export function getFormsByLanguage(language, options = {}) {
  const normalizedLanguage = normalizeLanguageFilter(language);
  if (!normalizedLanguage) return [];
  return getAllTherapeuticForms(options).filter((form) =>
    form?.approved === true && form?.language === normalizedLanguage
  );
}

export function getFormsByAudience(audience, options = {}) {
  const normalizedAudience = normalizeAudienceFilter(audience);
  if (!normalizedAudience) return [];
  return getAllTherapeuticForms(options).filter((form) =>
    form?.approved === true && form?.audience === normalizedAudience
  );
}

export function getFormsByCategory(category, options = {}) {
  const normalizedCategory = normalizeCategoryFilter(category);
  if (!normalizedCategory) return [];
  return getAllTherapeuticForms(options).filter((form) =>
    form?.approved === true && normalizeCategoryFilter(form?.category) === normalizedCategory
  );
}

export function getFormsBySubcategory(subcategory, options = {}) {
  const normalizedSubcategory = normalizeSubcategoryFilter(subcategory);
  if (!normalizedSubcategory) return [];
  return getAllTherapeuticForms(options).filter((form) => {
    if (form?.approved !== true) return false;
    const candidates = [
      form?.subcategory,
      form?.series,
      form?.moduleTitle,
      form?.module_title,
      form?.moduleCode,
    ]
      .map((value) => normalizeSubcategoryFilter(value))
      .filter(Boolean);
    return candidates.some((candidate) => candidate.includes(normalizedSubcategory));
  });
}

export function getFormsByClinicalGroup(group, options = {}) {
  const normalizedGroup = normalizeSubcategoryFilter(group);
  if (!normalizedGroup) return [];
  return getAllTherapeuticForms(options).filter((form) => {
    if (form?.approved !== true) return false;
    const candidates = [
      form?.category,
      form?.subcategory,
      form?.therapeuticGoal,
      form?.therapeutic_goal,
      form?.whenToUse,
      form?.when_to_use,
      form?.aiMatchingSummary,
      form?.ai_matching_summary,
      ...toArray(form?.clinicalKeywords),
      ...toArray(form?.keywords),
    ]
      .map((value) => normalizeFreeText(value))
      .filter(Boolean);
    return candidates.some((candidate) => candidate.includes(normalizedGroup));
  });
}

export function listAvailableFormsForAI(filters = {}) {
  const normalizedLanguage = normalizeLanguageFilter(filters.language || filters.sessionLanguage);
  const normalizedAudience = normalizeAudienceFilter(filters.audience || filters.sessionAudience);
  const normalizedCategory = normalizeCategoryFilter(filters.category);
  const normalizedSubcategory = normalizeSubcategoryFilter(filters.subcategory);
  const normalizedClinicalGroup = normalizeSubcategoryFilter(filters.clinicalGroup || filters.group);
  const forms = getAllTherapeuticForms({ environment: filters.environment });

  return forms.filter((form) => {
    if (form?.approved !== true) return false;
    if (normalizedLanguage && form?.language !== normalizedLanguage) return false;
    if (normalizedAudience && form?.audience !== normalizedAudience) return false;
    if (normalizedCategory && normalizeCategoryFilter(form?.category) !== normalizedCategory) return false;

    if (normalizedSubcategory) {
      const subcategoryCandidates = [
        form?.subcategory,
        form?.series,
        form?.moduleTitle,
        form?.module_title,
        form?.moduleCode,
      ]
        .map((value) => normalizeSubcategoryFilter(value))
        .filter(Boolean);
      if (!subcategoryCandidates.some((candidate) => candidate.includes(normalizedSubcategory))) return false;
    }

    if (normalizedClinicalGroup) {
      const groupCandidates = [
        form?.category,
        form?.subcategory,
        form?.therapeuticGoal,
        form?.therapeutic_goal,
        form?.whenToUse,
        form?.when_to_use,
        form?.aiMatchingSummary,
        form?.ai_matching_summary,
        ...toArray(form?.clinicalKeywords),
        ...toArray(form?.keywords),
      ]
        .map((value) => normalizeFreeText(value))
        .filter(Boolean);
      if (!groupCandidates.some((candidate) => candidate.includes(normalizedClinicalGroup))) return false;
    }

    return true;
  });
}

export function listAvailableFormCategories(filters = {}) {
  const forms = listAvailableFormsForAI(filters);
  const groups = new Map();

  for (const form of forms) {
    const audience = form?.audience || 'unknown';
    const language = form?.language || 'unknown';
    const category = form?.category || 'unknown';
    const subcategory = form?.subcategory || form?.series || form?.moduleTitle || form?.module_title || 'general';
    const key = [audience, language, category, subcategory].join('|');
    const existing = groups.get(key) || {
      audience,
      language,
      category,
      subcategory,
      count: 0,
    };
    existing.count += 1;
    groups.set(key, existing);
  }

  return Array.from(groups.values())
    .sort((a, b) =>
      String(a.audience).localeCompare(String(b.audience)) ||
      String(a.language).localeCompare(String(b.language)) ||
      String(a.category).localeCompare(String(b.category)) ||
      String(a.subcategory).localeCompare(String(b.subcategory))
    );
}

export function searchFormsForAI(query, filters = {}) {
  const normalizedQuery = normalizeFreeText(query);
  const queryTokens = tokenizeSearchText(query);
  const candidates = listAvailableFormsForAI(filters);
  const limit = Number.isFinite(Number(filters.limit)) ? Math.max(1, Number(filters.limit)) : 10;

  if (!normalizedQuery && queryTokens.length === 0) {
    return candidates.slice(0, limit);
  }

  return candidates
    .map((form) => ({
      form,
      score: scoreFormForQuery(form, queryTokens, normalizedQuery),
    }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score || String(a.form?.id || '').localeCompare(String(b.form?.id || '')))
    .slice(0, limit)
    .map((entry) => ({ ...entry.form, ai_score: entry.score }));
}

export function resolveFormForAIRequest(userMessage, context = {}) {
  const normalizedMessage = normalizeFreeText(userMessage);
  const inferredLanguage =
    detectLanguageFromText(normalizedMessage) ||
    normalizeLanguageFilter(context.explicitLanguage) ||
    normalizeLanguageFilter(context.activeLanguage || context.sessionLanguage || context.language);
  const inferredAudience =
    detectAudienceFromText(normalizedMessage) ||
    normalizeAudienceFilter(context.explicitAudience) ||
    normalizeAudienceFilter(context.activeAudience || context.sessionAudience || context.audience);

  const strictFilters = {
    language: inferredLanguage || undefined,
    audience: inferredAudience || undefined,
    category: context.category || undefined,
    subcategory: context.subcategory || undefined,
    clinicalGroup: context.clinicalGroup || context.group || undefined,
    environment: context.environment || undefined,
    limit: context.limit || 8,
  };

  const shouldAttempt =
    typeof userMessage === 'string' &&
    userMessage.trim() &&
    (hasFormRequestSignal(userMessage) || context.force === true);

  if (!shouldAttempt) {
    return {
      form: null,
      matches: [],
      fallbackMatches: [],
      appliedFilters: strictFilters,
      fallbackUsed: false,
    };
  }

  const matches = searchFormsForAI(userMessage, strictFilters);
  if (matches.length > 0) {
    return {
      form: matches[0],
      matches,
      fallbackMatches: [],
      appliedFilters: strictFilters,
      fallbackUsed: false,
    };
  }

  const relaxedFilters = {
    language: inferredLanguage || undefined,
    environment: context.environment || undefined,
    limit: context.limit || 8,
  };
  const fallbackMatches = searchFormsForAI(userMessage, relaxedFilters);
  return {
    form: fallbackMatches[0] || null,
    matches: [],
    fallbackMatches,
    appliedFilters: strictFilters,
    fallbackUsed: true,
  };
}

export function createGeneratedFileFromResolvedForm(resolved) {
  const form = resolved?.form || resolved;
  if (!form || typeof form !== 'object') return null;

  const fileUrl =
    stripDownloadQuery(form?.fileUrl) ||
    stripDownloadQuery(form?.file_url) ||
    stripDownloadQuery(form?.languages?.[form?.language || 'en']?.file_url) ||
    null;
  if (!fileUrl) return null;

  const filename =
    String(
      form?.fileName ||
      form?.file_name ||
      form?.languages?.[form?.language || 'en']?.file_name ||
      safeFileNameFromPath(fileUrl)
    ).trim() || 'therapeutic-form.pdf';

  const title = String(
    form?.title ||
    form?.languages?.[form?.language || 'en']?.title ||
    form?.id ||
    filename
  ).trim();

  const openUrl = buildOpenUrl(fileUrl);
  const downloadUrl = buildDownloadUrl(fileUrl);

  return {
    type: 'pdf',
    mime_type: 'application/pdf',
    source: 'therapeutic_forms_library',
    id: form?.id || null,
    form_id: form?.id || null,
    form_slug: form?.slug || null,
    title,
    description: form?.description || form?.languages?.[form?.language || 'en']?.description || null,
    name: filename,
    filename,
    url: fileUrl,
    file_path: form?.filePath || form?.file_path || `public${fileUrl}`,
    openUrl,
    open_url: openUrl,
    downloadUrl,
    download_url: downloadUrl,
    audience: form?.audience || null,
    language: form?.language || null,
    category: form?.category || null,
    subcategory: form?.subcategory || form?.series || form?.moduleTitle || form?.module_title || null,
    worksheet_number: form?.worksheetNumber ?? form?.worksheet_number ?? null,
    therapeutic_goal: form?.therapeuticGoal || form?.therapeutic_goal || null,
    when_to_use: form?.whenToUse || form?.when_to_use || null,
    ai_matching_summary: form?.aiMatchingSummary || form?.ai_matching_summary || null,
    safety_notes: form?.safetyNotes || form?.safety_notes || null,
    created_at: new Date().toISOString(),
  };
}

export function getAllTherapeuticForms(options = {}) {
  const forms = ALL_FORMS;
  const diagnostics = {
    environment: resolveEnvironmentLabel(options.environment),
    source: FORM_INDEX_SOURCE_PATH,
    generatedIndexImported: Array.isArray(GENERATED_THERAPEUTIC_FORMS_INDEX),
    formsCount: forms.length,
  };

  if (forms.length === 0) {
    console.error('[TherapeuticForms] Canonical registry is empty.', diagnostics);
  }

  return forms;
}

export function getTherapeuticFormsForAI({ language, audience, environment } = {}) {
  const allForms = getAllTherapeuticForms({ environment });
  const normalizedLanguage = normalizeLanguageFilter(language);
  const normalizedAudience = normalizeAudienceFilter(audience);
  const filtered = listAvailableFormsForAI({
    language: normalizedLanguage || undefined,
    audience: normalizedAudience || undefined,
    environment,
  });

  const aiForms = filtered.map((form) => ({
    id: form.id,
    approved: true,
    title: form.title || form.languages?.[form.language]?.title || form.id,
    audience: form.audience || null,
    language: form.language || null,
    category: form.category || null,
    subcategory: form.subcategory || form.series || form.moduleTitle || null,
    therapeuticGoal: form.therapeuticGoal || form.therapeutic_goal || null,
    whenToUse: form.whenToUse || form.when_to_use || null,
    clinicalKeywords: Array.isArray(form.clinicalKeywords) ? form.clinicalKeywords : (Array.isArray(form.keywords) ? form.keywords : []),
    intentPhrases: Array.isArray(form.intentPhrases) ? form.intentPhrases : [],
    notFor: Array.isArray(form.notFor) ? form.notFor : [],
    therapeutic_goal: form.therapeutic_goal || form.therapeuticGoal || null,
    when_to_use: form.when_to_use || form.whenToUse || null,
    keywords: Array.isArray(form.keywords) ? form.keywords : (Array.isArray(form.clinicalKeywords) ? form.clinicalKeywords : []),
    ai_matching_summary: form.ai_matching_summary || form.aiMatchingSummary || null,
    safety_notes: form.safety_notes || form.safetyNotes || null,
    file_path: form.file_path || form.filePath || null,
    file_url: form.fileUrl || form.languages?.[form.language || 'en']?.file_url || null,
    type: form.type || null,
    module_number: form.module_number ?? form.moduleNumber ?? null,
    worksheet_number: form.worksheet_number ?? form.worksheetNumber ?? form.formNumber ?? null,
  }));

  const diagnostics = {
    environment: resolveEnvironmentLabel(environment),
    registrySourcePath: FORM_INDEX_SOURCE_PATH,
    generatedIndexImported: Array.isArray(GENERATED_THERAPEUTIC_FORMS_INDEX),
    activeLanguage: normalizedLanguage || null,
    activeAudienceFilter: normalizedAudience || null,
    formsLengthBeforeFilters: allForms.length,
    formsLengthAfterFilters: aiForms.length,
  };

  if (import.meta.env?.PROD && aiForms.length === 0) {
    console.error('[TherapeuticForms][AI] No forms available after filters in production.', diagnostics);
  }

  return aiForms;
}

export function getTherapeuticFormsRegistryDiagnostics(forms = ALL_FORMS) {
  const diagnostics = {
    total: forms.length,
    byLanguage: {},
    byAudience: {},
    byCategory: {},
    source: FORM_INDEX_SOURCE_PATH,
    environment: import.meta.env?.MODE || 'unknown',
    sampleResolvedFilePath: forms[0]?.fileUrl || forms[0]?.languages?.en?.file_url || null,
  };

  for (const form of forms) {
    const language = String(form?.language || 'unknown');
    const audience = String(form?.audience || 'unknown');
    const category = String(form?.category || 'unknown');
    diagnostics.byLanguage[language] = (diagnostics.byLanguage[language] || 0) + 1;
    diagnostics.byAudience[audience] = (diagnostics.byAudience[audience] || 0) + 1;
    diagnostics.byCategory[category] = (diagnostics.byCategory[category] || 0) + 1;
  }

  return diagnostics;
}

// ─── Resolver utilities ───────────────────────────────────────────────────────
export {
  listAudienceGroups,
  listTherapeuticCategories,
  listFormsByAudience,
  listFormsByCategory,
  listFormsByAudienceAndCategory,
  resolveFormById,
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
} from './resolveTherapeuticForms.js';

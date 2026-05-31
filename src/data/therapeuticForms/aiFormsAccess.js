import {
  getAllTherapeuticForms,
  getTherapeuticFormsRegistryDiagnostics,
  SUPPORTED_LANGUAGES,
  VALID_AUDIENCE_VALUES,
} from './index.js';

const SUPPORTED_LANGUAGE_SET = new Set(SUPPORTED_LANGUAGES);
const VALID_AUDIENCE_SET = new Set(VALID_AUDIENCE_VALUES);

const LANGUAGE_ALIAS_MAP = Object.freeze({
  en: 'en',
  english: 'en',
  he: 'he',
  hebrew: 'he',
  עברית: 'he',
  es: 'es',
  spanish: 'es',
  fr: 'fr',
  french: 'fr',
  de: 'de',
  german: 'de',
  it: 'it',
  italian: 'it',
  pt: 'pt',
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
  'older-adult': 'older_adults',
  older_adults: 'older_adults',
  'older-adults': 'older_adults',
  parent: 'parents',
  parents: 'parents',
});

const FORM_INTENT_PATTERNS = Object.freeze({
  list: /\b(what forms|which forms|list forms|forms do you have|איזה טפסים|רשימת טפסים|show forms|available forms)\b/i,
  send: /(?:\b(send|share|attach|give me)\b|תשלח(?:י)?|שלח(?:י)?|תן לי|תני לי)/i,
});

const CATEGORY_SYNONYMS = Object.freeze({
  ocd: ['ocd', 'intrusive thoughts', 'sticky thoughts', 'ritual', 'compulsion'],
  anxiety: ['anxiety', 'fear', 'worry', 'test anxiety', 'performance anxiety', 'separation anxiety'],
  anger: ['anger', 'outburst', 'rage', 'regulation'],
  sleep: ['sleep', 'night', 'bedtime', 'insomnia'],
  psychosomatic: ['stomach ache', 'headache', 'before school', 'body stress', 'somatic'],
  self_esteem: ['self-esteem', 'self esteem', 'not good enough', 'self worth'],
});

const CHILDREN_GROUP_LABELS = Object.freeze([
  'Children CBT Core',
  'Children CBT Specialized',
  'Anxiety & Fears',
  'Behavior & Emotional Regulation',
  'Social Skills & Self-Esteem',
  'OCD & Trauma-Sensitive Coping',
  'Functional & Stress-Related Body Problems',
]);

const ADOLESCENTS_GROUP_LABELS = Object.freeze([
  'Adolescents CBT Core',
  'Adolescents CBT Specialized',
]);

function normalizeText(value) {
  // Intentional fail-soft normalization for search/indexing paths:
  // non-string/null values are treated as empty text, so candidate scanning
  // remains total-order deterministic without runtime throws.
  return String(value || '').toLowerCase().trim();
}

function normalizeLanguage(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const lower = value.trim().toLowerCase();
  const aliased = LANGUAGE_ALIAS_MAP[lower] || lower.split('-')[0];
  return SUPPORTED_LANGUAGE_SET.has(aliased) ? aliased : null;
}

function normalizeAudience(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  const normalized = AUDIENCE_ALIAS_MAP[value.trim().toLowerCase()] || value.trim().toLowerCase();
  return VALID_AUDIENCE_SET.has(normalized) ? normalized : null;
}

function getVariantGroupKey(form) {
  if (!form || typeof form !== 'object') return null;
  return normalizeText(form.logical_form_id || form.variant_group_id || form.id) || null;
}

function dedupeFormsById(forms) {
  const seen = new Set();
  const output = [];
  for (const form of forms) {
    const id = normalizeText(form?.id);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    output.push(form);
  }
  return output;
}

function extractRequestedLanguage(text) {
  const normalized = normalizeText(text);
  if (!normalized) return null;
  if (/\benglish\b/.test(normalized) || /באנגלית|אנגלית/.test(normalized)) return 'en';
  if (/\bhebrew\b/.test(normalized) || /עברית/.test(normalized)) return 'he';
  if (/\bspanish\b/.test(normalized)) return 'es';
  if (/\bfrench\b/.test(normalized)) return 'fr';
  if (/\bgerman\b/.test(normalized)) return 'de';
  if (/\bitalian\b/.test(normalized)) return 'it';
  if (/\bportuguese\b/.test(normalized)) return 'pt';
  return null;
}

function extractRequestedAudience(text) {
  const normalized = normalizeText(text);
  if (!normalized) return null;
  if (/\b(children|child|kids|kid)\b/.test(normalized) || /ילד|ילדים/.test(normalized)) return 'children';
  if (/\b(adolescents|adolescent|teens|teen|teenager)\b/.test(normalized) || /מתבגר|מתבגרים/.test(normalized)) return 'adolescents';
  if (/\b(adults|adult)\b/.test(normalized)) return 'adults';
  return null;
}

function normalizeLegacyWorksheetAlias(candidate) {
  const raw = String(candidate || '').trim().toLowerCase();
  if (!raw) return raw;
  const childrenMatch = raw.match(/^children[_-]cbt[_-]core[_-]en[_-](\d{1,2})[_-](\d{1,2})$/);
  if (childrenMatch) return `children-cbt-core-en-${Number(childrenMatch[1])}-${Number(childrenMatch[2])}`;
  const adolescentsMatch = raw.match(/^adolescents[_-]cbt[_-]core[_-]en[_-](\d{1,2})[_-](\d{1,2})$/);
  if (adolescentsMatch) return `adolescents-cbt-core-en-${Number(adolescentsMatch[1])}-${Number(adolescentsMatch[2])}`;
  const adolescentsHebrewMatch = raw.match(/^adolescents[_-]cbt[_-]core[_-]he[_-](\d{1,2})[_-](\d{1,2})$/);
  if (adolescentsHebrewMatch) return `adolescents-cbt-core-he-${Number(adolescentsHebrewMatch[1])}-${Number(adolescentsHebrewMatch[2])}`;
  return raw;
}

function getDefaultLanguage(language) {
  return normalizeLanguage(language) || 'en';
}

function flattenFormFields(form) {
  return [
    form?.id,
    form?.slug,
    form?.title,
    form?.displayTitle,
    form?.worksheetNumber,
    form?.worksheet_number,
    form?.audience,
    form?.language,
    form?.category,
    form?.mainCategory,
    form?.clinicalGroup,
    form?.subcategory,
    form?.moduleTitle,
    form?.module_title,
    form?.therapeuticGoal,
    form?.therapeutic_goal,
    form?.whenToUse,
    form?.when_to_use,
    form?.aiMatchingSummary,
    form?.ai_matching_summary,
    form?.safetyNotes,
    form?.safety_notes,
    form?.filePath,
    form?.file_path,
    form?.fileUrl,
    ...(Array.isArray(form?.keywords) ? form.keywords : []),
    ...(Array.isArray(form?.clinicalKeywords) ? form.clinicalKeywords : []),
    ...(Array.isArray(form?.intentPhrases) ? form.intentPhrases : []),
    ...(Array.isArray(form?.secondaryCategories) ? form.secondaryCategories : []),
  ]
    .filter(Boolean)
    .map((value) => normalizeText(value))
    .join(' ');
}

function scoreFormMatch(form, query) {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return 0;
  const haystack = flattenFormFields(form);
  if (!haystack) return 0;

  let score = 0;
  if (haystack.includes(normalizedQuery)) score += 180;

  const terms = normalizedQuery.split(/\s+/).filter(Boolean);
  for (const term of terms) {
    if (term.length <= 1) continue;
    if (haystack.includes(term)) score += 20;
  }

  for (const synonyms of Object.values(CATEGORY_SYNONYMS)) {
    if (synonyms.some((token) => normalizedQuery.includes(token))) {
      if (synonyms.some((token) => haystack.includes(token))) score += 35;
    }
  }

  const stageMatch = normalizedQuery.match(/(?:stage|שלב)\s*([1-9])/i);
  const requestedStage = stageMatch ? Number(stageMatch[1]) : null;
  const formStage = Number(form?.stageNumber ?? form?.moduleNumber ?? NaN);
  if (Number.isFinite(requestedStage) && Number.isFinite(formStage)) {
    if (requestedStage === formStage) score += 120;
    else score -= 25;
  }

  return score;
}

function getAvailableLanguagesForForms(forms) {
  const languages = new Set();
  for (const form of forms || []) {
    const normalized = normalizeLanguage(form?.language);
    if (normalized) languages.add(normalized);
  }
  return Array.from(languages).sort();
}

function rankResolvedCandidate(form, normalizedInput) {
  if (!form) return 0;
  const normalizedId = normalizeText(form.id);
  const normalizedSlug = normalizeText(form.slug);
  if (normalizedId === normalizedInput || normalizedSlug === normalizedInput) return 3;
  const normalizedLogicalId = normalizeText(form.logical_form_id);
  const normalizedVariantGroup = normalizeText(form.variant_group_id);
  if (normalizedLogicalId === normalizedInput || normalizedVariantGroup === normalizedInput) return 2;
  return 1;
}

function buildLanguageSelection(forms, requestedLanguage, activeLanguage, allowEnglishFallback = true) {
  const strictLanguage = normalizeLanguage(requestedLanguage);
  if (strictLanguage) {
    return {
      forms: forms.filter((form) => form?.language === strictLanguage),
      resolvedLanguage: strictLanguage,
      usedFallback: false,
      fallbackReason: null,
    };
  }

  const normalizedActive = getDefaultLanguage(activeLanguage);
  const activeMatches = forms.filter((form) => form?.language === normalizedActive);
  if (activeMatches.length > 0) {
    return {
      forms: activeMatches,
      resolvedLanguage: normalizedActive,
      usedFallback: false,
      fallbackReason: null,
    };
  }

  if (allowEnglishFallback) {
    const englishMatches = forms.filter((form) => form?.language === 'en');
    if (englishMatches.length > 0) {
      return {
        forms: englishMatches,
        resolvedLanguage: 'en',
        usedFallback: true,
        fallbackReason: normalizedActive === 'en' ? null : 'no_same_language_forms',
      };
    }
  }

  return {
    forms: [],
    resolvedLanguage: normalizedActive,
    usedFallback: false,
    fallbackReason: null,
  };
}

export function listFormsForAI(filters = {}) {
  const allForms = getAllTherapeuticForms();
  const approvedForms = allForms.filter((form) => form?.approved === true);

  const audience = normalizeAudience(filters.audience);
  const category = typeof filters.category === 'string' ? filters.category.trim() : null;
  const subcategory = typeof filters.subcategory === 'string' ? filters.subcategory.trim() : null;
  const languageSelection = buildLanguageSelection(
    approvedForms,
    filters.language,
    filters.activeLanguage || filters.language,
    filters.allowEnglishFallback !== false
  );

  return languageSelection.forms.filter((form) => {
    if (audience && form?.audience !== audience) return false;
    if (category && String(form?.category || '').toLowerCase() !== category.toLowerCase()) return false;
    if (subcategory && String(form?.subcategory || '').toLowerCase() !== subcategory.toLowerCase()) return false;
    return true;
  });
}

export function searchFormsForAI(query, filters = {}) {
  const normalizedQuery = normalizeText(query);
  const candidates = listFormsForAI(filters);
  if (!normalizedQuery) return candidates.slice(0, 20);

  return candidates
    .map((form) => ({ form, score: scoreFormMatch(form, normalizedQuery) }))
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => entry.form);
}

export function resolveFormByIdOrSlug(formId, options = {}) {
  const normalizedInput = normalizeLegacyWorksheetAlias(String(formId || '').trim());
  if (!normalizedInput) return null;

  const requestedLanguage = normalizeLanguage(options.language);
  const allForms = getAllTherapeuticForms().filter((form) => form?.approved === true);
  const normalizedLookupInput = normalizeText(normalizedInput);
  const byIdOrSlug = allForms.filter((form) => {
    const id = normalizeText(form?.id);
    const slug = normalizeText(form?.slug);
    const logicalFormId = normalizeText(form?.logical_form_id);
    const variantGroupId = normalizeText(form?.variant_group_id);
    return (
      id === normalizedLookupInput ||
      slug === normalizedLookupInput ||
      logicalFormId === normalizedLookupInput ||
      variantGroupId === normalizedLookupInput
    );
  });
  if (byIdOrSlug.length === 0) return null;

  const variantGroupKeys = new Set(
    byIdOrSlug
      .map((form) => getVariantGroupKey(form))
      .filter(Boolean)
  );
  const variantCandidates = variantGroupKeys.size > 0
    ? allForms.filter((form) => variantGroupKeys.has(getVariantGroupKey(form)))
    : byIdOrSlug;
  const candidates = dedupeFormsById([...byIdOrSlug, ...variantCandidates]);

  const languageSelection = buildLanguageSelection(
    candidates,
    requestedLanguage,
    options.activeLanguage || options.language,
    options.allowEnglishFallback !== false
  );
  const resolved = languageSelection.forms
    .slice()
    .sort((a, b) => rankResolvedCandidate(b, normalizedLookupInput) - rankResolvedCandidate(a, normalizedLookupInput))[0] || null;
  if (!resolved) return null;

  return {
    form: resolved,
    resolvedLanguage: languageSelection.resolvedLanguage,
    usedFallbackLanguage: languageSelection.usedFallback,
    fallbackReason: languageSelection.fallbackReason,
    availableLanguages: getAvailableLanguagesForForms(candidates),
  };
}

export function createGeneratedFileFromResolvedForm(resolvedFormInput) {
  const normalizeResolvedInput = (input) => {
    if (input?.form) return input;
    return { form: input, resolvedLanguage: input?.language || 'en' };
  };
  const payload = normalizeResolvedInput(resolvedFormInput);
  const form = payload?.form;
  if (!form) return null;

  const language = normalizeLanguage(payload?.resolvedLanguage) || normalizeLanguage(form?.language) || 'en';
  const languageBlock = form?.languages?.[language] || form?.languages?.en || null;
  const url = languageBlock?.file_url || form?.fileUrl || null;
  if (!url) return null;

  const fileName = languageBlock?.file_name || String(url).split('/').pop() || `${form.id || 'worksheet'}.pdf`;
  const title = languageBlock?.title || form?.title || form?.id || 'Therapeutic Form';

  return {
    id: form.id,
    type: 'pdf',
    title,
    fileName,
    name: fileName,
    url,
    file_path: form.file_path || form.filePath || null,
    mime_type: 'application/pdf',
    audience: form.audience || null,
    language,
    category: form.category || null,
    subcategory: form.subcategory || null,
    source: 'therapeutic_forms_registry',
    form_id: form.id || null,
    form_slug: form.slug || null,
    logical_form_id: form.logical_form_id || null,
    variant_language: form.variant_language || language,
    available_languages: Array.isArray(payload?.availableLanguages)
      ? payload.availableLanguages
      : (Array.isArray(form.available_languages) ? form.available_languages : getAvailableLanguagesForForms([form])),
    sibling_variant_ids: Array.isArray(form.sibling_variant_ids) ? form.sibling_variant_ids : [],
    source_language: form.source_language || null,
    is_language_variant: form.is_language_variant === true,
    variant_group_id: form.variant_group_id || null,
    created_at: new Date().toISOString(),
  };
}

export function getAvailableFormGroups(filters = {}) {
  const forms = listFormsForAI(filters);
  const languages = new Set();
  const audiences = new Set();
  const categories = new Set();
  const subcategories = new Set();

  for (const form of forms) {
    if (form?.language) languages.add(form.language);
    if (form?.audience) audiences.add(form.audience);
    if (form?.category) categories.add(form.category);
    if (form?.subcategory) subcategories.add(form.subcategory);
  }

  return {
    total: forms.length,
    languages: Array.from(languages).sort(),
    audiences: Array.from(audiences).sort(),
    categories: Array.from(categories).sort(),
    subcategories: Array.from(subcategories).sort(),
    audienceGroups: {
      children: CHILDREN_GROUP_LABELS,
      adolescents: ADOLESCENTS_GROUP_LABELS,
    },
    examples: forms.slice(0, 5).map((form) => ({
      id: form.id,
      title: form.title || form.languages?.[form.language || 'en']?.title || form.id,
      audience: form.audience,
      language: form.language,
      category: form.category,
    })),
  };
}

export function getFormsRegistryStats() {
  const diagnostics = getTherapeuticFormsRegistryDiagnostics(getAllTherapeuticForms());
  return {
    total: diagnostics.total,
    byLanguage: diagnostics.byLanguage,
    byAudience: diagnostics.byAudience,
    byCategory: diagnostics.byCategory,
    source: diagnostics.source,
  };
}

export function detectFormIntent(userMessage) {
  const text = normalizeText(userMessage);
  if (!text) return null;

  const requestedAudience = extractRequestedAudience(text);
  const requestedLanguage = extractRequestedLanguage(text);
  const asksList = FORM_INTENT_PATTERNS.list.test(text);
  const asksSend = FORM_INTENT_PATTERNS.send.test(text)
    || /\bform\b|\bworksheet\b|טופס/.test(text)
    || /שלב\s*[1-6]|קובץ\s*מאוחד|כל\s*שלב/.test(text);
  const mentionsCategory = /\b(category|group|groups|category|קטגור)/.test(text);
  const explicitIdMatch = text.match(/\b([a-z0-9]+(?:[_-][a-z0-9]+){2,})\b/);

  if (asksList && !requestedAudience && !requestedLanguage && !mentionsCategory) {
    return { type: 'list_all_forms', audience: null, language: requestedLanguage, query: text };
  }
  if (asksList && requestedAudience) {
    return { type: 'list_forms_by_audience', audience: requestedAudience, language: requestedLanguage, query: text };
  }
  if (asksList && requestedLanguage) {
    return { type: 'list_forms_by_language', audience: requestedAudience, language: requestedLanguage, query: text };
  }
  if (asksList && mentionsCategory) {
    return { type: 'list_forms_by_category', audience: requestedAudience, language: requestedLanguage, query: text };
  }
  if (asksSend && explicitIdMatch && /(?:\b(send|share|attach)\b|תשלח(?:י)?|שלח(?:י)?|תן לי|תני לי)/.test(text)) {
    return { type: 'send_specific_form', audience: requestedAudience, language: requestedLanguage, query: explicitIdMatch[1], rawQuery: text };
  }
  if (asksSend) {
    return { type: 'send_best_matching_form', audience: requestedAudience, language: requestedLanguage, query: text };
  }
  if (/\bform\b|\bworksheet\b|טופס/.test(text)) {
    return { type: 'search_forms_by_need', audience: requestedAudience, language: requestedLanguage, query: text };
  }

  return null;
}

function formatNearestMatches(matches) {
  if (!Array.isArray(matches) || matches.length === 0) return '';
  return matches
    .slice(0, 3)
    .map((form) => `- ${form.title || form.id} (${form.audience}, ${form.language}, ${form.category})`)
    .join('\n');
}

export function resolveFormForAIRequest(userMessage, context = {}) {
  const intent = detectFormIntent(userMessage);
  const stats = getFormsRegistryStats();
  if (!intent) {
    return { intent: null, stats, matches: [], nearestMatches: [], generatedFile: null, responseText: null };
  }

  const activeLanguage = getDefaultLanguage(context.language || context.activeLanguage);
  const requestedLanguage = intent.language || extractRequestedLanguage(userMessage);
  const filters = {
    audience: intent.audience || context.audience || null,
    activeLanguage,
    language: requestedLanguage,
    allowEnglishFallback: requestedLanguage === 'en' || activeLanguage === 'en',
  };

  if (intent.type === 'send_specific_form') {
    const resolved = resolveFormByIdOrSlug(intent.query, filters);
    const generatedFile = resolved ? createGeneratedFileFromResolvedForm(resolved) : null;
    const availableLanguages = resolved?.availableLanguages || [];
    const availableLanguagesText = availableLanguages.join(', ') || 'none';
    return {
      intent,
      stats,
      matches: resolved?.form ? [resolved.form] : [],
      nearestMatches: [],
      generatedFile,
      resolvedLanguage: resolved?.resolvedLanguage || activeLanguage,
      responseText: generatedFile
        ? `I found a matching worksheet and attached it.`
        : `I couldn't find that exact form ID for this language. Available languages for nearby variants: ${availableLanguagesText}. I can search by audience, category, or therapeutic goal.`,
      usedFallbackLanguage: resolved?.usedFallbackLanguage === true,
      fallbackReason: resolved?.fallbackReason || null,
      availableLanguages,
    };
  }

  const matches = searchFormsForAI(intent.query || userMessage, filters);
  const nearestMatches = matches.slice(0, 5);
  const best = nearestMatches[0] || null;
  const generatedFile = intent.type === 'send_best_matching_form' && best
    ? createGeneratedFileFromResolvedForm(best)
    : null;

  const groups = getAvailableFormGroups(filters);
  const languagesText = groups.languages.length > 0 ? groups.languages.join(', ') : 'none';
  const categoriesText = groups.categories.length > 0 ? groups.categories.join(', ') : 'none';
  const hasSameLanguageForms = groups.languages.includes(activeLanguage);
  const fallbackNote = requestedLanguage === 'en' || activeLanguage === 'en'
    ? ''
    : (hasSameLanguageForms ? '' : `\nI currently found available worksheets in: ${languagesText}.`);

  const listText = [
    `I found ${groups.total} approved forms in this scope.`,
    `Languages: ${languagesText}.`,
    `Audiences: ${groups.audiences.join(', ') || 'none'}.`,
    `Categories: ${categoriesText}.`,
    groups.examples.length > 0 ? `Examples:\n${groups.examples.map((example) => `- ${example.title} (${example.audience}, ${example.category})`).join('\n')}` : '',
    fallbackNote,
  ]
    .filter(Boolean)
    .join('\n');

  const searchText = best
    ? `I found a close match: ${best.title || best.id} (${best.audience}, ${best.language}, ${best.category}).`
    : `I couldn't find an exact match. Nearby installed options:\n${formatNearestMatches(nearestMatches) || '- none found'}`;

  const sendText = generatedFile
    ? (generatedFile.language !== activeLanguage && !requestedLanguage
      ? `I found a worksheet match and attached it in ${generatedFile.language.toUpperCase()}. Available languages in this scope: ${languagesText}. If you prefer a different language, tell me which one.`
      : 'I found a matching worksheet and attached it.')
    : `I couldn't find an exact sendable match yet. Here are nearby options:\n${formatNearestMatches(nearestMatches) || '- none found'}`;

  const responseByIntent = {
    list_all_forms: listText,
    list_forms_by_audience: listText,
    list_forms_by_language: listText,
    list_forms_by_category: listText,
    search_forms_by_need: searchText,
    send_best_matching_form: sendText,
  };

  return {
    intent,
    stats,
    matches,
    nearestMatches,
    generatedFile,
    resolvedLanguage: generatedFile?.language || best?.language || activeLanguage,
    responseText: responseByIntent[intent.type] || searchText,
    usedFallbackLanguage: Boolean(generatedFile && generatedFile.language !== activeLanguage && !requestedLanguage),
    fallbackReason: generatedFile && generatedFile.language !== activeLanguage && !requestedLanguage ? 'no_same_language_forms' : null,
    availableLanguages: generatedFile?.available_languages || getAvailableLanguagesForForms(nearestMatches),
  };
}

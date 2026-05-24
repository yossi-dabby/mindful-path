/**
 * TherapeuticForms — Resolver Utilities
 *
 * All public query and resolution functions for the TherapeuticForms library.
 *
 * Design rules:
 *   - Never return unapproved forms.
 *   - Never return a form with a missing or empty file_url.
 *   - Language resolution uses strict exact-match: only the requested language
 *     is served; no fallback to English or any other language.
 *   - If the requested language is unavailable the resolver returns null, allowing
 *     the UI to show an appropriate empty/unavailable state.
 *   - Hebrew entries always preserve `rtl: true`.
 *   - All functions are pure and never throw — malformed entries are silently skipped.
 *
 * Future AI wiring:
 *   Use `toGeneratedFileMetadata()` to convert a resolved form into the shape
 *   expected by message.metadata.generated_file without attaching it to chat.
 */

import { VALID_AUDIENCE_VALUES, VALID_CATEGORY_VALUES, RTL_LANGUAGES } from './categories.js';
import { ALL_FORMS } from './index.js';

// ─── Internal helpers ─────────────────────────────────────────────────────────
function removeDownloadParamFromUrl(url) {
  if (typeof url !== 'string' || !url.trim()) return null;
  const trimmed = url.trim();
  if (!trimmed.startsWith('/')) return trimmed;
  try {
    const parsed = new URL(trimmed, 'https://example.local');
    parsed.searchParams.delete('download');
    return parsed.pathname + parsed.search + parsed.hash;
  } catch {
    return trimmed
      .replace(/[?&]download(?:=1|=true)?\b/g, '')
      .replace(/[?&]$/, '');
  }
}

/**
 * Returns true when a language block is considered a valid, servable version:
 *   - Must be an object
 *   - file_url must be a non-empty string
 *   - file_type must be 'pdf'
 *   - title and file_name must be non-empty strings
 *
 * @param {*} langBlock
 * @returns {boolean}
 */
function isValidLanguageBlock(langBlock) {
  if (!langBlock || typeof langBlock !== 'object') return false;
  if (langBlock.file_type !== 'pdf') return false;
  if (typeof langBlock.file_url !== 'string' || !langBlock.file_url.trim()) return false;
  if (typeof langBlock.title !== 'string' || !langBlock.title.trim()) return false;
  if (typeof langBlock.file_name !== 'string' || !langBlock.file_name.trim()) return false;
  return true;
}

/**
 * Returns true when a form entry is structurally valid:
 *   - Must be an object with a non-empty string id and slug
 *   - audience must be a known audience value
 *   - category must be a known category value
 *   - languages must be an object
 *   - approved must be boolean true
 *
 * @param {*} form
 * @returns {boolean}
 */
function isWellFormedForm(form) {
  if (!form || typeof form !== 'object') return false;
  if (typeof form.id !== 'string' || !form.id.trim()) return false;
  if (typeof form.slug !== 'string' || !form.slug.trim()) return false;
  if (!VALID_AUDIENCE_VALUES.has(form.audience)) return false;
  if (!VALID_CATEGORY_VALUES.has(form.category)) return false;
  if (!form.languages || typeof form.languages !== 'object') return false;
  if (form.approved !== true) return false;
  return true;
}

/**
 * Resolves the language block for a form using strict exact-match logic.
 * No fallback to another language is performed — a missing language block
 * returns null so that the UI/resolver can show an appropriate empty state
 * instead of silently showing content in the wrong language.
 *
 * @param {object} form         - The form entry from the registry.
 * @param {string} lang         - ISO 639-1 language code (e.g. 'he', 'en').
 * @returns {{ block: object, code: string } | null}
 */
function resolveBestLanguageBlock(form, lang) {
  const languages = form.languages || {};

  // Strict match: only return the block for the exact requested language.
  // No fallback to English or any other language.
  const requestedBlock = languages[lang];
  if (isValidLanguageBlock(requestedBlock)) {
    return { block: requestedBlock, code: lang };
  }

  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Returns the list of all audience group values.
 * @returns {string[]}
 */
export function listAudienceGroups() {
  return Array.from(VALID_AUDIENCE_VALUES);
}

/**
 * Returns the list of all therapeutic category values.
 * @returns {string[]}
 */
export function listTherapeuticCategories() {
  return Array.from(VALID_CATEGORY_VALUES);
}

/**
 * Returns all approved, available forms for the given audience group.
 * "Available" means: approved === true AND at least one valid language block exists.
 *
 * @param {string} audience
 * @returns {object[]}
 */
export function listFormsByAudience(audience) {
  if (!VALID_AUDIENCE_VALUES.has(audience)) return [];
  return ALL_FORMS.filter(
    form => isWellFormedForm(form) && form.audience === audience
  );
}

/**
 * Returns all approved, available forms for the given therapeutic category.
 *
 * @param {string} category
 * @returns {object[]}
 */
export function listFormsByCategory(category) {
  if (!VALID_CATEGORY_VALUES.has(category)) return [];
  return ALL_FORMS.filter(
    form => isWellFormedForm(form) && form.category === category
  );
}

/**
 * Returns all approved, available forms for the given audience and category combination.
 *
 * @param {string} audience
 * @param {string} category
 * @returns {object[]}
 */
export function listFormsByAudienceAndCategory(audience, category) {
  if (!VALID_AUDIENCE_VALUES.has(audience)) return [];
  if (!VALID_CATEGORY_VALUES.has(category)) return [];
  return ALL_FORMS.filter(
    form => isWellFormedForm(form) && form.audience === audience && form.category === category
  );
}

/**
 * Resolves a single form by id or slug, returning full form data.
 * Returns null if the form is not found, is unapproved, or has no valid language.
 *
 * @param {string} idOrSlug
 * @returns {object | null}
 */
export function resolveFormById(idOrSlug) {
  if (typeof idOrSlug !== 'string' || !idOrSlug.trim()) return null;
  const form = ALL_FORMS.find(f => f != null && (f.id === idOrSlug || f.slug === idOrSlug));
  if (!isWellFormedForm(form)) return null;
  return form;
}

/**
 * Resolves a form by id or slug and returns the best language version.
 *
 * Returns an object containing:
 *   - form: the full form metadata (without language blocks)
 *   - language: the resolved ISO language code
 *   - languageData: the resolved language block (title, description, file_url, file_name, rtl)
 *
 * Returns null if:
 *   - the form is not found
 *   - the form is unapproved
 *   - no valid language version exists for the requested language (strict match; no fallback)
 *
 * @param {string} idOrSlug
 * @param {string} [lang='en']  - Preferred language code.
 * @returns {{ form: object, language: string, languageData: object } | null}
 */
export function resolveFormWithLanguage(idOrSlug, lang = 'en') {
  const form = resolveFormById(idOrSlug);
  if (!form) return null;

  const resolved = resolveBestLanguageBlock(form, lang);
  if (!resolved) return null;

  const { block, code } = resolved;

  // Ensure RTL metadata is preserved for RTL languages regardless of what the block says
  const rtl = RTL_LANGUAGES.has(code) || block.rtl === true;

  return {
    form,
    language: code,
    languageData: {
      title: block.title,
      description: block.description || null,
      file_url: block.file_url,
      file_type: block.file_type,
      file_name: block.file_name,
      rtl,
    },
  };
}

/**
 * Converts a resolved form + language result into the shape expected by
 * message.metadata.generated_file (future AI wiring).
 *
 * This function does NOT attach the metadata to any chat message.
 * It is provided as infrastructure for future AI assistant integration.
 *
 * Compatible with: GeneratedFileCard, normalizeGeneratedFile, message.metadata.generated_file
 *
 * Returns null if the resolved result is invalid.
 *
 * @param {{ form: object, language: string, languageData: object } | null} resolved
 * @returns {object | null}
 */
export function toGeneratedFileMetadata(resolved) {
  if (!resolved) return null;
  const { form, language, languageData } = resolved;
  if (!form || !language || !languageData) return null;
  if (!languageData.file_url || !languageData.file_name || !languageData.title) return null;
  const sanitizedFileUrl = removeDownloadParamFromUrl(languageData.file_url) || languageData.file_url;
  const openUrl = sanitizedFileUrl.startsWith('/')
    ? `/pdf-viewer?file=${encodeURIComponent(sanitizedFileUrl)}`
    : sanitizedFileUrl;
  const downloadUrl = (() => {
    if (!sanitizedFileUrl.startsWith('/')) return sanitizedFileUrl;
    try {
      const parsed = new URL(sanitizedFileUrl, 'https://example.local');
      parsed.searchParams.set('download', '1');
      return parsed.pathname + parsed.search + parsed.hash;
    } catch {
      return sanitizedFileUrl.includes('?')
        ? `${sanitizedFileUrl}&download=1`
        : `${sanitizedFileUrl}?download=1`;
    }
  })();

  return {
    type: 'pdf',
    mime_type: 'application/pdf',
    id: form.id || null,
    url: sanitizedFileUrl,
    name: languageData.file_name,
    filename: languageData.file_name,
    title: languageData.title,
    description: languageData.description || null,
    therapeutic_purpose: form.therapeutic_use || null,
    source: 'therapeutic_forms_library',
    form_id: form.id,
    form_slug: form.slug,
    audience: form.audience,
    category: form.category,
    subcategory: form.subcategory || form.series || form.moduleTitle || null,
    language,
    file_path: form.filePath || form.file_path || `public${sanitizedFileUrl}`,
    openUrl,
    open_url: openUrl,
    downloadUrl,
    download_url: downloadUrl,
    parentSeriesId: form.parentSeriesId || null,
    formNumber: form.formNumber || null,
    worksheet_number: form.worksheetNumber || form.worksheet_number || form.formNumber || null,
    stageNumber: form.stageNumber || null,
    therapeutic_goal: form.therapeuticGoal || form.therapeutic_goal || null,
    when_to_use: form.whenToUse || form.when_to_use || null,
    ai_matching_summary: form.aiMatchingSummary || form.ai_matching_summary || null,
    safety_notes: form.safetyNotes || form.safety_notes || null,
    created_at: new Date().toISOString(),
  };
}

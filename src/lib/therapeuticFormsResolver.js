/**
 * Therapeutic Forms Resolver — Phase 1B
 *
 * Resolver utilities for the TherapeuticForms registry.
 *
 * CONTRACT
 * ─────────
 * - Returns only forms where `approved: true`.
 * - Returns only forms that have a non-empty `file_url`.
 * - Applies language preference with automatic fallback to English ('en').
 * - Includes `rtl: true` metadata for Hebrew (he) form variants.
 * - Provides `normalizeFormToGeneratedFile()` for converting a resolved form
 *   into the `generated_file` metadata shape used by the chat pipeline.
 *
 * SAFETY
 * ──────
 * - Never returns a form entry with a missing or empty file_url.
 * - Never throws; all functions return null / empty array on edge inputs.
 */

import { THERAPEUTIC_FORMS_REGISTRY } from './therapeuticFormsRegistry.js';

/** Languages supported by the registry, in preference order for fallback. */
const SUPPORTED_LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

/** The default fallback language. */
const FALLBACK_LANGUAGE = 'en';

// ─── Internal helpers ─────────────────────────────────────────────────────────

/**
 * Resolve a single language variant for a form entry.
 * Returns the variant for `lang` if it is approved and has a file_url,
 * otherwise falls back to the FALLBACK_LANGUAGE variant.
 * Returns null if no approved variant with a file_url can be found.
 *
 * @param {import('./therapeuticFormsRegistry.js').TherapeuticFormEntry} entry
 * @param {string} lang
 * @returns {{ lang: string, variant: import('./therapeuticFormsRegistry.js').TherapeuticFormLanguageVariant } | null}
 */
function resolveLanguageVariant(entry, lang) {
  const normalizedLang = typeof lang === 'string' && SUPPORTED_LANGUAGES.includes(lang)
    ? lang
    : FALLBACK_LANGUAGE;

  // Try the requested language first
  const requested = entry.languages?.[normalizedLang];
  if (requested && requested.approved && requested.file_url && requested.file_url.trim()) {
    return { lang: normalizedLang, variant: requested };
  }

  // Fall back to English
  if (normalizedLang !== FALLBACK_LANGUAGE) {
    const fallback = entry.languages?.[FALLBACK_LANGUAGE];
    if (fallback && fallback.approved && fallback.file_url && fallback.file_url.trim()) {
      return { lang: FALLBACK_LANGUAGE, variant: fallback };
    }
  }

  return null;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Get all approved forms for a given audience and language.
 *
 * Applies language preference with automatic English fallback.
 * Returns only forms with a real, non-empty file_url.
 *
 * @param {object} opts
 * @param {'children'|'adolescents'|'adults'|'older_adults'} opts.audience
 * @param {string} [opts.lang='en'] - ISO language code
 * @returns {Array<ResolvedTherapeuticForm>}
 */
export function getApprovedForms({ audience, lang = FALLBACK_LANGUAGE } = {}) {
  if (!audience) return [];

  const results = [];

  for (const entry of THERAPEUTIC_FORMS_REGISTRY) {
    if (entry.audience !== audience) continue;

    const resolved = resolveLanguageVariant(entry, lang);
    if (!resolved) continue;

    results.push(buildResolvedForm(entry, resolved.lang, resolved.variant));
  }

  return results;
}

/**
 * Resolve a single form by its ID and language.
 *
 * Returns null if the form does not exist, is not approved,
 * or has no valid file_url in the requested or fallback language.
 *
 * @param {string} formId
 * @param {string} [lang='en']
 * @returns {ResolvedTherapeuticForm | null}
 */
export function resolveForm(formId, lang = FALLBACK_LANGUAGE) {
  if (!formId) return null;

  const entry = THERAPEUTIC_FORMS_REGISTRY.find((e) => e.id === formId);
  if (!entry) return null;

  const resolved = resolveLanguageVariant(entry, lang);
  if (!resolved) return null;

  return buildResolvedForm(entry, resolved.lang, resolved.variant);
}

/**
 * Get all approved forms across all audiences for a given language.
 *
 * @param {string} [lang='en']
 * @returns {Array<ResolvedTherapeuticForm>}
 */
export function getAllApprovedForms(lang = FALLBACK_LANGUAGE) {
  const results = [];

  for (const entry of THERAPEUTIC_FORMS_REGISTRY) {
    const resolved = resolveLanguageVariant(entry, lang);
    if (!resolved) continue;
    results.push(buildResolvedForm(entry, resolved.lang, resolved.variant));
  }

  return results;
}

/**
 * Convert a resolved therapeutic form into the `generated_file` metadata shape
 * used by the chat message pipeline (see normalizeGeneratedFile.js).
 *
 * Returns null if the form is null or lacks a valid file_url.
 *
 * Shape:
 * {
 *   type:                 'pdf',
 *   url:                  string,
 *   name:                 string,
 *   title?:               string,
 *   description?:         string,
 *   therapeutic_purpose?: string,
 * }
 *
 * @param {ResolvedTherapeuticForm | null} resolvedForm
 * @returns {{ type: 'pdf', url: string, name: string, title?: string, description?: string, therapeutic_purpose?: string } | null}
 */
export function normalizeFormToGeneratedFile(resolvedForm) {
  if (!resolvedForm) return null;
  if (!resolvedForm.file_url || !resolvedForm.file_url.trim()) return null;

  return {
    type: 'pdf',
    url: resolvedForm.file_url,
    name: resolvedForm.file_name || `${resolvedForm.slug}.pdf`,
    title: resolvedForm.title || undefined,
    description: resolvedForm.description || undefined,
    therapeutic_purpose: resolvedForm.therapeutic_purpose || undefined,
  };
}

// ─── Internal builder ─────────────────────────────────────────────────────────

/**
 * Build a ResolvedTherapeuticForm object from a registry entry and resolved variant.
 *
 * @param {import('./therapeuticFormsRegistry.js').TherapeuticFormEntry} entry
 * @param {string} lang
 * @param {import('./therapeuticFormsRegistry.js').TherapeuticFormLanguageVariant} variant
 * @returns {ResolvedTherapeuticForm}
 */
function buildResolvedForm(entry, lang, variant) {
  return {
    id: entry.id,
    slug: entry.slug,
    audience: entry.audience,
    therapeutic_purpose: entry.therapeutic_purpose,
    lang,
    title: variant.title,
    description: variant.description || null,
    file_url: variant.file_url,
    file_name: variant.file_name,
    file_type: variant.file_type,
    rtl: variant.rtl === true,
    approved: true,
  };
}

/**
 * @typedef {Object} ResolvedTherapeuticForm
 * @property {string}   id
 * @property {string}   slug
 * @property {'children'|'adolescents'|'adults'|'older_adults'} audience
 * @property {string}   therapeutic_purpose
 * @property {string}   lang            - Resolved language code (may differ from requested due to fallback)
 * @property {string}   title
 * @property {string|null} description
 * @property {string}   file_url
 * @property {string}   file_name
 * @property {'pdf'}    file_type
 * @property {boolean}  rtl
 * @property {true}     approved
 */

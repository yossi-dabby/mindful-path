/**
 * Therapeutic form intent resolver.
 * Runtime catalog is currently intentionally empty.
 */

import {
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
  ALL_FORMS,
} from '../data/therapeuticForms/index.js';

export const APPROVED_FORM_INTENT_MAP = Object.freeze({});
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

export function resolveFormIntent(intentOrSlug, lang) {
  if (typeof intentOrSlug !== 'string' || !intentOrSlug.trim()) return null;
  if (ALL_FORMS.length === 0) return null;

  const normalizedIntent = intentOrSlug.toLowerCase().trim();
  const formId = APPROVED_FORM_INTENT_MAP[normalizedIntent] || findApprovedExactFormId(normalizedIntent);
  if (!formId) return null;

  const resolvedLang = typeof lang === 'string' && lang.trim() ? lang.trim() : 'en';
  return resolveApprovedFormById(formId, resolvedLang);
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

export function resolveAdolescentsCBTCoreEnglishFormByContent(_query) {
  return null;
}

export function resolveAdolescentsCBTSpecializedEnglishFormByContent(_query, _options = {}) {
  return null;
}

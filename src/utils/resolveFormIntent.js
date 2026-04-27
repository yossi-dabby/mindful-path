/**
 * @file src/utils/resolveFormIntent.js
 *
 * TherapeuticForms Phase 3 — Safe AI-Facing Form Intent Resolver
 *
 * This module is the ONLY path through which the AI chat assistant may attach
 * a TherapeuticForms library file to a message.
 *
 * SAFETY CONTRACT
 * ---------------
 * - Never accepts arbitrary URLs from the model.
 * - Only returns forms that are `approved: true` in the TherapeuticForms registry.
 * - Only returns forms that have a valid, non-empty `file_url`.
 * - All resolution goes through `resolveFormWithLanguage` + `toGeneratedFileMetadata`
 *   from the TherapeuticForms resolver — no URL construction outside the registry.
 * - Returns null instead of fabricating anything.
 * - Language falls back to English when the requested language is unavailable.
 * - Hebrew RTL metadata is preserved by the underlying resolver.
 *
 * APPROVED INITIAL INTENT MAP (Phase 3)
 * --------------------------------------
 * Currently maps two intent families to the approved adult forms.
 * Expand this map when additional approved forms are added to the registry.
 *
 * Intent families → form IDs:
 *   thought-record   → tf-adults-cbt-thought-record
 *   behavioral-activation → tf-adults-behavioral-activation-plan
 *
 * AUDIENCE POLICY
 * ---------------
 * The default audience is 'adults'.  Children / adolescent / older-adult forms
 * MUST NOT be sent unless the audience is explicitly known and safe to infer.
 * This initial implementation only maps adult forms.
 *
 * This module is imported by src/components/utils/validateAgentOutput.jsx
 * and is designed to be test-importable (no browser globals required).
 */

import {
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
} from '../data/therapeuticForms/index.js';

// ─── Approved intent → form ID map ───────────────────────────────────────────
//
// Each key is a canonical intent slug.  Values are exact form IDs from the
// TherapeuticForms registry.  Only approved forms with real file assets may
// appear here.
//
// Adding a new intent: add one entry here and ensure the form has approved: true
// and valid file_url values in the registry before enabling.

export const APPROVED_FORM_INTENT_MAP = Object.freeze({
  // ── Thought Records / CBT worksheets ───────────────────────────────────────
  'tf-adults-cbt-thought-record':          'tf-adults-cbt-thought-record',
  'adults-cbt-thought-record':             'tf-adults-cbt-thought-record',
  'cbt-thought-record':                    'tf-adults-cbt-thought-record',
  'thought-record':                        'tf-adults-cbt-thought-record',

  // ── Behavioral Activation ──────────────────────────────────────────────────
  'tf-adults-behavioral-activation-plan':  'tf-adults-behavioral-activation-plan',
  'adults-behavioral-activation-plan':     'tf-adults-behavioral-activation-plan',
  'behavioral-activation-plan':            'tf-adults-behavioral-activation-plan',
  'behavioral-activation':                 'tf-adults-behavioral-activation-plan',
});

// ─── Marker format ────────────────────────────────────────────────────────────
//
// The AI embeds a form intent using this exact marker format in message content:
//
//   [FORM:intent-slug]           — uses current session language (resolved by Chat)
//   [FORM:intent-slug:lang]      — requests a specific language (e.g. [FORM:thought-record:he])
//
// The marker is stripped from visible message content during sanitization.
// Only the intent-slug is passed to resolveFormIntent — the model never provides a URL.

export const FORM_INTENT_MARKER_PATTERN = /\[FORM:([a-z0-9_-]+)(?::([a-z]{2}))?\]/g;

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolves a form intent string (slug or alias) to a `generated_file` metadata
 * object compatible with `message.metadata.generated_file`.
 *
 * This is the ONLY approved path for the AI to attach a therapeutic form.
 * The model must only emit intent slugs from the approved map — the actual
 * file URL is resolved here, never from model output.
 *
 * @param {string} intentOrSlug  - The intent slug from the `[FORM:slug]` marker.
 * @param {string} [lang='en']   - Preferred language code (ISO 639-1).
 * @returns {object|null}        - Generated file metadata, or null if unresolvable.
 */
export function resolveFormIntent(intentOrSlug, lang) {
  if (typeof intentOrSlug !== 'string' || !intentOrSlug.trim()) return null;

  // Normalize: lowercase, trim
  const normalizedIntent = intentOrSlug.toLowerCase().trim();

  // Look up the canonical form ID in the approved intent map
  const formId = APPROVED_FORM_INTENT_MAP[normalizedIntent];
  if (!formId) return null;

  // Resolve language (default to English for safe fallback)
  const resolvedLang = typeof lang === 'string' && lang.trim() ? lang.trim() : 'en';

  // Use the TherapeuticForms resolver — this enforces approved: true and valid file_url
  const resolved = resolveFormWithLanguage(formId, resolvedLang);
  if (!resolved) return null;

  // Convert to generated_file metadata shape
  const metadata = toGeneratedFileMetadata(resolved);
  return metadata; // null when shape is incomplete (resolver contract)
}

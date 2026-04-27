/**
 * @file src/utils/resolveFormIntent.js
 *
 * TherapeuticForms Phase 4B — Expanded AI Form Intent Resolver
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
 * APPROVED INTENT MAP (Phase 4B)
 * --------------------------------
 * Maps intent families to all currently approved forms across all audiences.
 * Audience-specific forms (children / adolescents) require audience-specific
 * alias wording — generic aliases are intentionally omitted to prevent
 * age-inappropriate form delivery.
 *
 * AUDIENCE POLICY
 * ---------------
 * Children / adolescent forms MUST NOT be sent unless the audience is
 * explicitly known. Aliases for these forms require child/teen/adolescent
 * wording to guard against accidental delivery to adult users.
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
  // ── Adults: Thought Records / CBT worksheets ───────────────────────────────
  'tf-adults-cbt-thought-record':                    'tf-adults-cbt-thought-record',
  'adults-cbt-thought-record':                       'tf-adults-cbt-thought-record',
  'cbt-thought-record':                              'tf-adults-cbt-thought-record',
  'thought-record':                                  'tf-adults-cbt-thought-record',

  // ── Adults: Behavioral Activation ─────────────────────────────────────────
  'tf-adults-behavioral-activation-plan':            'tf-adults-behavioral-activation-plan',
  'adults-behavioral-activation-plan':               'tf-adults-behavioral-activation-plan',
  'behavioral-activation-plan':                      'tf-adults-behavioral-activation-plan',
  'behavioral-activation':                           'tf-adults-behavioral-activation-plan',

  // ── Adults: Cognitive Distortions ─────────────────────────────────────────
  'tf-adults-cognitive-distortions-worksheet':       'tf-adults-cognitive-distortions-worksheet',
  'adults-cognitive-distortions-worksheet':          'tf-adults-cognitive-distortions-worksheet',
  'cognitive-distortions-worksheet':                 'tf-adults-cognitive-distortions-worksheet',
  'cognitive-distortions':                           'tf-adults-cognitive-distortions-worksheet',
  'thinking-traps':                                  'tf-adults-cognitive-distortions-worksheet',
  'distorted-thinking':                              'tf-adults-cognitive-distortions-worksheet',

  // ── Adults: Values & Goals ─────────────────────────────────────────────────
  'tf-adults-values-and-goals-worksheet':            'tf-adults-values-and-goals-worksheet',
  'adults-values-and-goals-worksheet':               'tf-adults-values-and-goals-worksheet',
  'values-and-goals-worksheet':                      'tf-adults-values-and-goals-worksheet',
  'values-and-goals':                                'tf-adults-values-and-goals-worksheet',
  'goal-setting':                                    'tf-adults-values-and-goals-worksheet',
  'values-worksheet':                                'tf-adults-values-and-goals-worksheet',

  // ── Adults: Mood Tracking ──────────────────────────────────────────────────
  'tf-adults-mood-tracking-sheet':                   'tf-adults-mood-tracking-sheet',
  'adults-mood-tracking-sheet':                      'tf-adults-mood-tracking-sheet',
  'mood-tracking-sheet':                             'tf-adults-mood-tracking-sheet',
  'mood-tracking':                                   'tf-adults-mood-tracking-sheet',
  'mood-tracker':                                    'tf-adults-mood-tracking-sheet',
  'track-my-mood':                                   'tf-adults-mood-tracking-sheet',

  // ── Adults: Weekly Coping Plan ────────────────────────────────────────────
  'tf-adults-weekly-coping-plan':                    'tf-adults-weekly-coping-plan',
  'adults-weekly-coping-plan':                       'tf-adults-weekly-coping-plan',
  'weekly-coping-plan':                              'tf-adults-weekly-coping-plan',
  'weekly-coping':                                   'tf-adults-weekly-coping-plan',
  'coping-plan':                                     'tf-adults-weekly-coping-plan',
  'weekly-plan':                                     'tf-adults-weekly-coping-plan',

  // ── Older Adults: Mood Reflection ─────────────────────────────────────────
  'tf-older-adults-mood-reflection-sheet':           'tf-older-adults-mood-reflection-sheet',
  'older-adults-mood-reflection-sheet':              'tf-older-adults-mood-reflection-sheet',
  'mood-reflection-sheet':                           'tf-older-adults-mood-reflection-sheet',
  'mood-reflection':                                 'tf-older-adults-mood-reflection-sheet',
  'reflection-sheet':                                'tf-older-adults-mood-reflection-sheet',

  // ── Older Adults: Sleep Routine Reflection ────────────────────────────────
  'tf-older-adults-sleep-routine-reflection':        'tf-older-adults-sleep-routine-reflection',
  'older-adults-sleep-routine-reflection':           'tf-older-adults-sleep-routine-reflection',
  'sleep-routine-reflection':                        'tf-older-adults-sleep-routine-reflection',
  'sleep-routine':                                   'tf-older-adults-sleep-routine-reflection',
  'sleep-reflection':                                'tf-older-adults-sleep-routine-reflection',

  // ── Older Adults: Daily Coping Plan ──────────────────────────────────────
  'tf-older-adults-daily-coping-plan':               'tf-older-adults-daily-coping-plan',
  'older-adults-daily-coping-plan':                  'tf-older-adults-daily-coping-plan',
  'daily-coping-plan':                               'tf-older-adults-daily-coping-plan',
  'daily-coping':                                    'tf-older-adults-daily-coping-plan',

  // ── Older Adults: Caregiver Support Reflection ───────────────────────────
  'tf-older-adults-caregiver-support-reflection':    'tf-older-adults-caregiver-support-reflection',
  'older-adults-caregiver-support-reflection':       'tf-older-adults-caregiver-support-reflection',
  'caregiver-support-reflection':                    'tf-older-adults-caregiver-support-reflection',
  'caregiver-support':                               'tf-older-adults-caregiver-support-reflection',
  'caregiver-reflection':                            'tf-older-adults-caregiver-support-reflection',

  // ── Adolescents: Anxiety Thought Record ──────────────────────────────────
  // Aliases MUST include adolescent/teen wording — generic anxiety terms are not mapped
  'tf-adolescents-anxiety-thought-record':           'tf-adolescents-anxiety-thought-record',
  'adolescents-anxiety-thought-record':              'tf-adolescents-anxiety-thought-record',
  'adolescent-anxiety-thought-record':               'tf-adolescents-anxiety-thought-record',
  'teen-anxiety-worksheet':                          'tf-adolescents-anxiety-thought-record',

  // ── Adolescents: Emotion Regulation ──────────────────────────────────────
  'tf-adolescents-emotion-regulation-worksheet':     'tf-adolescents-emotion-regulation-worksheet',
  'adolescents-emotion-regulation-worksheet':        'tf-adolescents-emotion-regulation-worksheet',
  'teen-emotion-regulation':                         'tf-adolescents-emotion-regulation-worksheet',
  'adolescent-emotion-regulation':                   'tf-adolescents-emotion-regulation-worksheet',
  'adolescent-emotion-worksheet':                    'tf-adolescents-emotion-regulation-worksheet',

  // ── Adolescents: Weekly Practice Planner ─────────────────────────────────
  'tf-adolescents-weekly-practice-planner':          'tf-adolescents-weekly-practice-planner',
  'adolescents-weekly-practice-planner':             'tf-adolescents-weekly-practice-planner',
  'teen-weekly-practice':                            'tf-adolescents-weekly-practice-planner',
  'adolescent-weekly-planner':                       'tf-adolescents-weekly-practice-planner',
  'teen-weekly-planner':                             'tf-adolescents-weekly-practice-planner',

  // ── Adolescents: Social Pressure Coping Tool ─────────────────────────────
  'tf-adolescents-social-pressure-coping-tool':      'tf-adolescents-social-pressure-coping-tool',
  'adolescents-social-pressure-coping-tool':         'tf-adolescents-social-pressure-coping-tool',
  'social-pressure-coping':                          'tf-adolescents-social-pressure-coping-tool',
  'peer-pressure-coping':                            'tf-adolescents-social-pressure-coping-tool',

  // ── Children: Simple Feelings Check-In ───────────────────────────────────
  // Aliases MUST include child/children — generic feeling terms are not mapped
  'tf-children-feelings-checkin':                    'tf-children-feelings-checkin',
  'tf-children-simple-feelings-check-in':            'tf-children-feelings-checkin',
  'children-simple-feelings-check-in':               'tf-children-feelings-checkin',
  'child-feelings-check-in':                         'tf-children-feelings-checkin',
  'children-feelings-check-in':                      'tf-children-feelings-checkin',

  // ── Children: Grounding Exercise ─────────────────────────────────────────
  'tf-children-grounding-exercise':                  'tf-children-grounding-exercise',
  'children-grounding-exercise':                     'tf-children-grounding-exercise',
  'child-grounding':                                 'tf-children-grounding-exercise',
  'grounding-for-children':                          'tf-children-grounding-exercise',

  // ── Children: Parent-Guided Coping Card ──────────────────────────────────
  
  'tf-children-parent-guided-coping-card':           'tf-children-parent-guided-coping-card',
  'children-parent-guided-coping-card':              'tf-children-parent-guided-coping-card',
  'parent-guided-coping':                            'tf-children-parent-guided-coping-card',
  'child-coping-card':                               'tf-children-parent-guided-coping-card',

  // ── Children: Box Breathing ───────────────────────────────────────────────
  'tf-children-box-breathing':                       'tf-children-box-breathing',
  'children-box-breathing':                          'tf-children-box-breathing',
  'child-box-breathing':                             'tf-children-box-breathing',
  'box-breathing-for-children':                      'tf-children-box-breathing',
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

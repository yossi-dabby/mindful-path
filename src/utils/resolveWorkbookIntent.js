/**
 * @file src/utils/resolveWorkbookIntent.js
 *
 * Workbook Routing Intelligence — Phase 10
 *
 * Resolves a Hebrew natural-language user query to the correct therapeutic
 * workbook, applying a keyword-scoring algorithm and routing priority rules.
 *
 * ROUTING PRIORITY (mirrors problem-statement spec)
 * --------------------------------------------------
 * 1. Explicit workbook request (קונטרס / סדרת טפסים / חוברת / …) + keyword match
 *    → prefer matching workbook
 * 2. Broad / multi-topic request (≥2 keywords from same workbook, no explicit trigger)
 *    → prefer matching workbook
 * 3. Narrow specific individual-form request
 *    → return null (let resolveFormIntent handle it)
 * 4. Generic workbook request (explicit trigger, no topic keywords)
 *    → return null; caller should present the full workbook catalogue
 *
 * CONTEXT-AWARE ROUTING (resolveWorkbookIntentWithContext)
 * --------------------------------------------------------
 * When the user's current query is anaphoric ("לזה" / "אחר לזה" / "לאותו נושא")
 * without sufficient topic keywords, the resolver also scores the previous
 * conversation context.  If the previous context points to a workbook and the
 * current query contains an explicit workbook-trigger word, the matching workbook
 * from context is returned.
 *
 * RESPONSE WORDING (getHebrewFormLabel)
 * --------------------------------------
 * Returns the correct Hebrew label for a resolved form based on its category.
 * Workbooks (category: workbook_series) must be labelled "קונטרס טיפולי מלא".
 * Individual worksheets must NOT be labelled as workbooks.
 *
 * SAFETY CONTRACT
 * ---------------
 * - Only returns forms approved in the TherapeuticForms registry.
 * - All resolution goes through resolveFormIntent (which enforces approved: true).
 * - Returns null instead of fabricating anything.
 *
 * This module is designed to be test-importable (no browser globals required).
 */

import { resolveFormIntent } from './resolveFormIntent.js';
import { WORKBOOK_CONTENT_METADATA, WORKBOOK_CONTENT_METADATA_EN } from './workbookContentMetadata.js';

// ─── Hebrew workbook-trigger language ─────────────────────────────────────────
//
// Explicit Hebrew terms that signal the user wants a full workbook (קונטרס)
// rather than a single worksheet.

const WORKBOOK_TRIGGER_KEYWORDS = [
  'קונטרס',
  'סדרת טפסים',
  'סט טפסים',
  'חוברת',
  'חוברת עבודה',
  'משהו מקיף',
  'לא טופס בודד',
  'כמה טפסים',
  'תהליך שלם',
];

// ─── Score threshold constants ───────────────────────────────────────────────

/** Minimum topic-keyword matches to prefer a workbook WITHOUT an explicit trigger. */
const MULTI_TOPIC_THRESHOLD = 2;

/** Minimum topic-keyword matches when an explicit trigger IS present. */
const EXPLICIT_TRIGGER_THRESHOLD = 1;

// ─── Helpers ─────────────────────────────────────────────────────────────────

/**
 * Returns true when the query contains at least one explicit workbook-trigger keyword.
 *
 * @param {string} query
 * @returns {boolean}
 */
function hasExplicitWorkbookTrigger(query) {
  return WORKBOOK_TRIGGER_KEYWORDS.some(kw => query.includes(kw));
}

/**
 * Counts how many of a workbook's topicKeywords appear in the query.
 *
 * @param {string}   query
 * @param {string[]} topicKeywords
 * @returns {number}
 */
function scoreWorkbook(query, topicKeywords) {
  let score = 0;
  for (const kw of topicKeywords) {
    if (query.includes(kw)) score++;
  }
  return score;
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Resolves a Hebrew natural-language user query to a therapeutic workbook.
 *
 * Implements the workbook routing priority rules:
 *   - Explicit workbook trigger + ≥1 topic keyword  → return matching workbook
 *   - ≥2 topic keywords from same workbook (multi-topic) → return matching workbook
 *   - No sufficient match → return null
 *
 * When two workbooks tie at the winning score, the first one in
 * WORKBOOK_CONTENT_METADATA (the more foundational workbook) wins.
 *
 * @param {string} query   - The user's natural-language Hebrew query.
 * @param {string} [lang='he'] - Target language for the resolved form.
 * @returns {object|null}  - Generated-file metadata compatible with
 *                           message.metadata.generated_file, or null.
 */
export function resolveWorkbookIntent(query, lang = 'he') {
  if (typeof query !== 'string' || !query.trim()) return null;

  const resolvedLang = typeof lang === 'string' && lang.trim() ? lang.trim() : 'he';

  const hasWorkbookTrigger = hasExplicitWorkbookTrigger(query);

  // ── Score every workbook ──────────────────────────────────────────────────
  let bestWorkbook = null;
  let bestScore = 0;

  for (const wb of WORKBOOK_CONTENT_METADATA) {
    const score = scoreWorkbook(query, wb.topicKeywords);
    if (score > bestScore) {
      bestScore = score;
      bestWorkbook = wb;
    }
    // Ties: first in array wins (already assigned, so we don't overwrite on equal)
  }

  // ── Apply routing priority ────────────────────────────────────────────────
  const threshold = hasWorkbookTrigger
    ? EXPLICIT_TRIGGER_THRESHOLD
    : MULTI_TOPIC_THRESHOLD;

  if (bestWorkbook && bestScore >= threshold) {
    return resolveFormIntent(bestWorkbook.slug, resolvedLang);
  }

  // No sufficient topic match — return null.
  // For generic workbook requests (trigger present but no topic keywords), the
  // caller should present the full catalogue rather than guessing a workbook.
  return null;
}

/**
 * Returns the list of workbook-trigger keywords used by the routing algorithm.
 * Exported for testing.
 *
 * @returns {string[]}
 */
export function getWorkbookTriggerKeywords() {
  return [...WORKBOOK_TRIGGER_KEYWORDS];
}

/**
 * Context-aware workbook resolver.
 *
 * Extends `resolveWorkbookIntent` by also considering the previous conversation
 * context when the current query is anaphoric (e.g. "קונטרס אחר לזה?" / "לאותו
 * נושא" / "יש לך עוד?") and does not itself contain enough topic keywords.
 *
 * Algorithm:
 *   1. Try `resolveWorkbookIntent(currentQuery)`.  If it returns a result, return it.
 *   2. If current query contains an explicit workbook trigger AND a previous context
 *      string is provided, score that context for workbooks.
 *   3. If the previous context scores ≥ EXPLICIT_TRIGGER_THRESHOLD on any workbook,
 *      return that workbook.
 *   4. Return null otherwise.
 *
 * This ensures that "קונטרס אחר לזה?" after a negative-thoughts conversation
 * correctly resolves to adults-cognitive-flexibility-premium-he, while still
 * refusing to guess when there is no prior context or no trigger word.
 *
 * @param {string}      currentQuery     - The user's current message.
 * @param {string|null} [previousContext] - Recent prior conversation text (may be
 *                                          the previous user message, a topic
 *                                          summary, or a concatenated recent
 *                                          window).  Pass null/undefined to skip.
 * @param {string}      [lang='he']       - Target language for the resolved form.
 * @returns {object|null} Generated-file metadata or null.
 */
export function resolveWorkbookIntentWithContext(currentQuery, previousContext, lang = 'he') {
  if (typeof currentQuery !== 'string' || !currentQuery.trim()) return null;

  // Step 1 — try current query alone (existing logic).
  const directResult = resolveWorkbookIntent(currentQuery, lang);
  if (directResult !== null) return directResult;

  // Step 2 — if the current query has a workbook trigger but no topic match,
  // try to inherit the topic from the previous context.
  const hasCurrentTrigger = hasExplicitWorkbookTrigger(currentQuery);
  if (!hasCurrentTrigger) return null;
  if (typeof previousContext !== 'string' || !previousContext.trim()) return null;

  const resolvedLang = typeof lang === 'string' && lang.trim() ? lang.trim() : 'he';

  // Step 3 — score the previous context.
  let bestWorkbook = null;
  let bestScore = 0;

  for (const wb of WORKBOOK_CONTENT_METADATA) {
    const score = scoreWorkbook(previousContext, wb.topicKeywords);
    if (score > bestScore) {
      bestScore = score;
      bestWorkbook = wb;
    }
  }

  if (bestWorkbook && bestScore >= EXPLICIT_TRIGGER_THRESHOLD) {
    return resolveFormIntent(bestWorkbook.slug, resolvedLang);
  }

  return null;
}

/**
 * Returns the appropriate Hebrew label for a resolved generated-file metadata
 * object based on its `category` field.
 *
 * The AI must use the label returned by this function when introducing a form
 * to the user — it must NEVER call a workbook "דף עבודה" or "טופס בודד".
 *
 * | category        | label                          |
 * |-----------------|-------------------------------|
 * | workbook_series | 'קונטרס טיפולי מלא'           |
 * | (anything else) | 'דף עבודה'                    |
 *
 * @param {object|null} metadata - Object with at least a `category` string field.
 * @returns {string} Hebrew label.
 */
export function getHebrewFormLabel(metadata) {
  if (!metadata || typeof metadata !== 'object') return 'דף עבודה';
  if (metadata.category === 'workbook_series') return 'קונטרס טיפולי מלא';
  return 'דף עבודה';
}

// ─── English workbook routing ─────────────────────────────────────────────────

/**
 * English terms that signal the user wants a full workbook rather than
 * a single worksheet.
 */
const WORKBOOK_TRIGGER_KEYWORDS_EN = [
  'workbook',
  'booklet',
  'full workbook',
  'complete workbook',
  'workbook set',
  'set of worksheets',
  'series of forms',
  'series of worksheets',
  'full set',
  'more comprehensive',
  'not just a worksheet',
  'not a single worksheet',
  'therapeutic workbook',
  'workbook for this',
  'another workbook for this',
];

/**
 * English terms that signal the user wants an individual worksheet/form
 * rather than a full workbook.
 */
const INDIVIDUAL_FORM_TRIGGER_KEYWORDS_EN = [
  'worksheet',
  'single worksheet',
  'worksheet form',
  'handout',
];

/**
 * Returns true when the English query contains at least one explicit
 * workbook-trigger keyword.
 *
 * @param {string} query
 * @returns {boolean}
 */
function hasExplicitEnglishWorkbookTrigger(query) {
  const lower = query.toLowerCase();
  return WORKBOOK_TRIGGER_KEYWORDS_EN.some(kw => lower.includes(kw));
}

/**
 * Returns true when the English query contains individual-form language
 * (worksheet / handout / single worksheet) but NOT workbook language.
 * Used to preserve individual-form routing priority.
 *
 * @param {string} query
 * @returns {boolean}
 */
function hasIndividualFormTrigger(query) {
  const lower = query.toLowerCase();
  // If the query also has workbook language, workbook wins
  if (hasExplicitEnglishWorkbookTrigger(lower)) return false;
  return INDIVIDUAL_FORM_TRIGGER_KEYWORDS_EN.some(kw => lower.includes(kw));
}

/**
 * Scores an English workbook against the query using its topic keywords.
 *
 * @param {string}   lowerQuery  - Lowercased query.
 * @param {string[]} topicKeywords
 * @returns {number}
 */
function scoreEnglishWorkbook(lowerQuery, topicKeywords) {
  let score = 0;
  for (const kw of topicKeywords) {
    if (lowerQuery.includes(kw.toLowerCase())) score++;
  }
  return score;
}

/**
 * Resolves an English natural-language user query to the correct therapeutic
 * workbook slug, applying the routing priority rules from the problem statement.
 *
 * Routing priority:
 *   1. Individual-form language (worksheet/handout) without workbook trigger
 *      → return null (let resolveFormIntent handle individual forms).
 *   2. Explicit workbook trigger + ≥1 topic keyword → return matching workbook.
 *   3. ≥2 topic keywords from same workbook (multi-topic, no trigger) → return matching workbook.
 *   4. Generic workbook trigger, no topic keywords → return null.
 *   5. No file request → return null (therapeutic conversation, no forced attachment).
 *
 * @param {string} query   - The user's natural-language English query.
 * @returns {object|null}  - Generated-file metadata or null.
 */
export function resolveEnglishWorkbookIntent(query) {
  if (typeof query !== 'string' || !query.trim()) return null;

  const lowerQuery = query.toLowerCase();

  // Priority 1 — individual-form language without workbook trigger: return null
  // to let the individual-form resolver handle it.
  if (hasIndividualFormTrigger(lowerQuery)) return null;

  const hasWorkbookTrigger = hasExplicitEnglishWorkbookTrigger(lowerQuery);

  // Score every English workbook
  let bestWorkbook = null;
  let bestScore = 0;

  for (const wb of WORKBOOK_CONTENT_METADATA_EN) {
    const score = scoreEnglishWorkbook(lowerQuery, wb.topicKeywords);
    if (score > bestScore) {
      bestScore = score;
      bestWorkbook = wb;
    }
    // Ties: first in array wins (already assigned, no overwrite on equal)
  }

  const threshold = hasWorkbookTrigger
    ? EXPLICIT_TRIGGER_THRESHOLD
    : MULTI_TOPIC_THRESHOLD;

  if (bestWorkbook && bestScore >= threshold) {
    return resolveFormIntent(bestWorkbook.slug, 'en');
  }

  return null;
}

/**
 * Returns the list of English workbook-trigger keywords.
 * Exported for testing.
 *
 * @returns {string[]}
 */
export function getEnglishWorkbookTriggerKeywords() {
  return [...WORKBOOK_TRIGGER_KEYWORDS_EN];
}

/**
 * Returns the list of English individual-form trigger keywords.
 * Exported for testing.
 *
 * @returns {string[]}
 */
export function getEnglishIndividualFormTriggerKeywords() {
  return [...INDIVIDUAL_FORM_TRIGGER_KEYWORDS_EN];
}

/**
 * Context-aware English workbook resolver.
 *
 * Extends `resolveEnglishWorkbookIntent` by also considering the previous
 * conversation context when the current query is anaphoric (e.g.
 * "Do you have a workbook for this?") and does not itself contain enough topic
 * keywords.
 *
 * Algorithm:
 *   1. Try `resolveEnglishWorkbookIntent(currentQuery)`.  Return if result found.
 *   2. If current query has an explicit workbook trigger AND a previous context
 *      string is provided, score that context for workbooks.
 *   3. If the context scores ≥ EXPLICIT_TRIGGER_THRESHOLD on any workbook, return it.
 *   4. Return null otherwise.
 *
 * @param {string}      currentQuery     - The user's current message.
 * @param {string|null} [previousContext] - Recent prior conversation text.
 * @returns {object|null} Generated-file metadata or null.
 */
export function resolveEnglishWorkbookIntentWithContext(currentQuery, previousContext) {
  if (typeof currentQuery !== 'string' || !currentQuery.trim()) return null;

  // Step 1 — try current query alone.
  const directResult = resolveEnglishWorkbookIntent(currentQuery);
  if (directResult !== null) return directResult;

  // Step 2 — if the current query has a workbook trigger, try inheriting from context.
  const hasCurrentTrigger = hasExplicitEnglishWorkbookTrigger(currentQuery.toLowerCase());
  if (!hasCurrentTrigger) return null;
  if (typeof previousContext !== 'string' || !previousContext.trim()) return null;

  const lowerContext = previousContext.toLowerCase();

  let bestWorkbook = null;
  let bestScore = 0;

  for (const wb of WORKBOOK_CONTENT_METADATA_EN) {
    const score = scoreEnglishWorkbook(lowerContext, wb.topicKeywords);
    if (score > bestScore) {
      bestScore = score;
      bestWorkbook = wb;
    }
  }

  if (bestWorkbook && bestScore >= EXPLICIT_TRIGGER_THRESHOLD) {
    return resolveFormIntent(bestWorkbook.slug, 'en');
  }

  return null;
}

/**
 * Returns the appropriate English label for a resolved generated-file metadata
 * object based on its `category` field.
 *
 * | category        | label                        |
 * |-----------------|------------------------------|
 * | workbook_series | 'full therapeutic workbook'  |
 * | (anything else) | 'worksheet'                  |
 *
 * @param {object|null} metadata - Object with at least a `category` string field.
 * @returns {string} English label.
 */
export function getEnglishFormLabel(metadata) {
  if (!metadata || typeof metadata !== 'object') return 'worksheet';
  if (metadata.category === 'workbook_series') return 'full therapeutic workbook';
  return 'worksheet';
}

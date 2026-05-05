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
 * SAFETY CONTRACT
 * ---------------
 * - Only returns forms approved in the TherapeuticForms registry.
 * - All resolution goes through resolveFormIntent (which enforces approved: true).
 * - Returns null instead of fabricating anything.
 *
 * This module is designed to be test-importable (no browser globals required).
 */

import { resolveFormIntent } from './resolveFormIntent.js';
import { WORKBOOK_CONTENT_METADATA } from './workbookContentMetadata.js';

// ─── Workbook-trigger language ────────────────────────────────────────────────
//
// Explicit Hebrew terms that signal the user wants a full workbook (קונטרס)
// rather than a single worksheet.

const WORKBOOK_TRIGGER_KEYWORDS = [
  'קונטרס',
  'סדרת טפסים',
  'סט טפסים',
  'חוברת',
  'משהו מקיף',
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

/**
 * @file src/lib/companionContinuity.js
 *
 * AI Companion Upgrade — Phase 3 Continuity Quality
 *
 * Reads native CompanionMemory records, scores them for warmth and personal
 * richness, suppresses thin/generic records that add noise, and builds a
 * concise warm context block for injection into the companion session-start
 * payload.
 *
 * PURPOSE
 * -------
 * The Companion now has consistent wiring (Phase 2 routing consistency fix).
 * The next quality bottleneck is whether its continuity output feels personally
 * continuous and non-generic.  This module addresses that by:
 *   1. Scoring native CompanionMemory records for personal richness.
 *   2. Suppressing weak/generic records below a richness threshold.
 *   3. Preferring records with higher importance and longer, specific content.
 *   4. Building a warm (non-clinical) context block formatted for companion use.
 *   5. Providing a warm fallback when no rich memories exist.
 *
 * ROLE BOUNDARY
 * -------------
 * This module reads ONLY native companion memory records.
 * Records with memory_type === THERAPIST_MEMORY_TYPE are explicitly excluded
 * at the scoring level — they belong to the therapist continuity path
 * (crossSessionContinuity.js) and must not bleed into companion context.
 *
 * PRIVACY CONTRACT
 * ----------------
 * - Only structured CompanionMemory fields (content, importance) are read.
 * - Raw transcripts, clinical records, and CaseFormulation are never read.
 * - CompanionMemory is a private per-user entity; it is never indexed in
 *   shared retrieval pipelines (ai-agent-access-policy.md).
 * - Output is injected only into the per-user session-start payload.
 *   It is never stored, logged, or returned to the client directly.
 *
 * FAIL-CLOSED CONTRACT
 * --------------------
 * All exported functions return empty string (or 0) on any error.
 * Session start is never blocked by a continuity read failure.
 *
 * ACTIVATION
 * ----------
 * This module is inert when imported.  buildCompanionContinuityBlock is only
 * called from buildCompanionSessionStartContextAsync() in
 * workflowContextInjector.js, which itself is only called when
 * wiring.continuity_enabled === true (AI_COMPANION_WIRING_UPGRADE_V2).
 * Both COMPANION_UPGRADE_ENABLED and COMPANION_UPGRADE_CONTINUITY_ENABLED
 * must be true.  Both flags default to false.
 *
 * This file contains no Deno APIs and no runtime side effects.  It is safe to
 * import in Vitest unit tests.
 *
 * See problem statement — AI Companion Upgrade Phase 3 Continuity Quality.
 */

import { THERAPIST_MEMORY_TYPE } from './therapistMemoryModel.js';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Minimum character length of content field to score as having personal detail.
 * Records whose content is shorter than this threshold add no specificity.
 * @type {number}
 */
export const COMPANION_MEMORY_MIN_CONTENT_LENGTH = 20;

/**
 * Minimum warmth score for a native CompanionMemory record to be injected.
 * Records scoring below this threshold are suppressed as thin/generic noise.
 *
 * Score breakdown (see scoreCompanionMemoryRecord):
 *   importance >= 7  → +3  (high-priority personal memory)
 *   importance >= 5  → +2  (medium-high priority)
 *   importance >= 3  → +1  (moderate relevance)
 *   content length >= COMPANION_MEMORY_MIN_CONTENT_LENGTH → +2  (personal detail present)
 *   content length >= 60 chars → +1  (richer personal detail)
 *
 * A threshold of 1 suppresses only records that score 0 — i.e., records with
 * importance < 3 AND content shorter than COMPANION_MEMORY_MIN_CONTENT_LENGTH.
 * Any record with at least one non-trivial field passes.
 * @type {number}
 */
export const COMPANION_MEMORY_MIN_WARMTH_SCORE = 1;

/**
 * Maximum number of companion memory records injected into the context block.
 * Bounded to prevent over-loading the context window.
 * @type {number}
 */
export const COMPANION_MEMORY_MAX_INJECT = 5;

/**
 * Maximum characters per memory item in the context block.
 * @type {number}
 */
export const COMPANION_MEMORY_INJECT_MAX_CHARS = 150;

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Returns a warmth/richness score for a native CompanionMemory record.
 *
 * Higher score = more personally meaningful = preferred for injection.
 * Records below COMPANION_MEMORY_MIN_WARMTH_SCORE are suppressed as noise.
 *
 * Therapist session records (memory_type === THERAPIST_MEMORY_TYPE) always
 * score 0 and are excluded — they belong to the therapist continuity path.
 *
 * Returns 0 for null/invalid input (fail-safe).
 *
 * @param {object|null} record - A raw CompanionMemory entity record.
 * @returns {number} Warmth/richness score ≥ 0.
 */
export function scoreCompanionMemoryRecord(record) {
  if (!record || typeof record !== 'object') return 0;

  // Exclude therapist session records — they belong to the therapist path only.
  if (record.memory_type === THERAPIST_MEMORY_TYPE) return 0;

  let score = 0;

  // Importance field scoring
  const importance = typeof record.importance === 'number' ? record.importance : 0;
  if (importance >= 7) score += 3;
  else if (importance >= 5) score += 2;
  else if (importance >= 3) score += 1;

  // Content richness scoring
  const content = typeof record.content === 'string' ? record.content.trim() : '';
  if (content.length >= COMPANION_MEMORY_MIN_CONTENT_LENGTH) score += 2;
  if (content.length >= 60) score += 1;

  return score;
}

// ─── Context builder ──────────────────────────────────────────────────────────

/**
 * Reads native CompanionMemory records, scores them for warmth and personal
 * richness, suppresses thin/generic records, and builds a warm non-clinical
 * context block for injection into the companion session-start payload.
 *
 * Returns a formatted string when useful records exist, or empty string when:
 *   - entities is absent or malformed
 *   - No CompanionMemory records exist
 *   - No records pass the warmth threshold
 *   - Any read error occurs (fail-closed)
 *
 * The returned block is formatted for companion use (warm, non-clinical).
 * It differs deliberately from the therapist cross-session continuity block
 * (buildCrossSessionContinuityBlock in crossSessionContinuity.js) to maintain
 * clear role separation between the two agents.
 *
 * FAIL-CLOSED: never throws; never blocks session start.
 *
 * @param {object} entities - Base44 entity client map
 * @returns {Promise<string>} Formatted warm context block, or ''
 */
export async function buildCompanionContinuityBlock(entities) {
  try {
    if (!entities || typeof entities !== 'object') return '';
    if (
      !entities.CompanionMemory ||
      typeof entities.CompanionMemory.filter !== 'function'
    ) return '';

    // Over-fetch to allow for filtering out therapist_session records and weak ones.
    const rawRecords = await entities.CompanionMemory.filter(
      { is_active: true },
      '-importance',
      COMPANION_MEMORY_MAX_INJECT * 3,
    );

    if (!Array.isArray(rawRecords) || rawRecords.length === 0) return '';

    // Score each record; exclude therapist records (score === 0) and thin ones.
    const scored = rawRecords
      .map((record, index) => ({
        record,
        score: scoreCompanionMemoryRecord(record),
        index,
      }))
      .filter(({ score }) => score >= COMPANION_MEMORY_MIN_WARMTH_SCORE)
      // Sort by richness descending; equal scores preserve original recency order.
      .sort((a, b) => b.score - a.score || a.index - b.index)
      .slice(0, COMPANION_MEMORY_MAX_INJECT);

    if (scored.length === 0) return '';

    // Deduplicate and format content items.
    const seen = new Set();
    const items = [];
    for (const { record } of scored) {
      const content =
        typeof record.content === 'string'
          ? record.content.trim().slice(0, COMPANION_MEMORY_INJECT_MAX_CHARS)
          : '';
      if (content && !seen.has(content)) {
        seen.add(content);
        items.push(content);
      }
    }

    if (items.length === 0) return '';

    return [
      '=== COMPANION CONTINUITY CONTEXT (read-only) ===',
      'The following personal context helps you provide warm, personalised support.',
      'Use this to acknowledge what you already know about this person.',
      'Do not reference this section verbatim. Keep your tone warm and non-clinical.',
      '',
      ...items.map((item) => `- ${item}`),
      '',
      '=== END COMPANION CONTINUITY CONTEXT ===',
    ].join('\n');
  } catch {
    return '';
  }
}

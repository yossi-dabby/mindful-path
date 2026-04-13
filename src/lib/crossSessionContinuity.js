/**
 * @file src/lib/crossSessionContinuity.js
 *
 * Phase 3 Deep Personalization — Cross-Session Continuity Layer
 *
 * Reads structured therapist memory records (written by writeTherapistMemory)
 * from the CompanionMemory entity and builds a concise cross-session continuity
 * context block for injection into the session-start payload.
 *
 * PURPOSE
 * -------
 * The continuity block surfaces the longitudinal clinical picture across
 * sessions: recurring patterns, open follow-up tasks, prior interventions,
 * and any active risk flags.  This allows the therapist agent to greet the
 * user with session-to-session awareness rather than as a blank-slate chatbot.
 *
 * PRIVACY CONTRACT
 * ----------------
 * - Only structured summary fields are read — never raw transcripts.
 * - Records are filtered to therapist_session memory_type and the internal
 *   therapist_memory_version marker (isTherapistMemoryRecord).
 * - CompanionMemory is a private per-user entity and is never indexed in
 *   shared retrieval pipelines (ai-agent-access-policy.md).
 * - The output block is injected only into the per-user session-start payload.
 *   It is never stored, logged, or returned to the client directly.
 *
 * FAIL-CLOSED CONTRACT
 * --------------------
 * All exported functions return empty string (or empty arrays) on any error.
 * Session start is never blocked by a continuity read failure.
 *
 * ACTIVATION
 * ----------
 * This module is inert when imported.  Its functions are only called from
 * buildV7SessionStartContentAsync() in workflowContextInjector.js, which is
 * itself only called when wiring.continuity_layer_enabled === true (V7 path).
 * Both THERAPIST_UPGRADE_ENABLED and THERAPIST_UPGRADE_CONTINUITY_ENABLED must
 * be true.  Both flags default to false.
 *
 * This file contains no Deno APIs and no runtime side effects.  It is safe to
 * import in Vitest unit tests.
 *
 * See problem statement — Phase 3 Deep Personalization, Continuity, Formulation Quality.
 */

import {
  isTherapistMemoryRecord,
  THERAPIST_MEMORY_TYPE,
} from './therapistMemoryModel.js';

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Maximum number of prior therapist memory records read for the continuity block.
 * Bounded to prevent over-loading the context window with historical data.
 * @type {number}
 */
export const CONTINUITY_MAX_PRIOR_SESSIONS = 3;

/**
 * Maximum characters injected per continuity string field.
 * @type {number}
 */
export const CONTINUITY_INJECT_MAX_CHARS = 120;

/**
 * Maximum items injected per continuity array field.
 * @type {number}
 */
export const CONTINUITY_MAX_ITEMS_PER_FIELD = 4;

/**
 * Minimum character length of session_summary to count toward the richness score.
 * Records whose session_summary is shorter than this are considered to have no
 * meaningful summary for scoring purposes.
 * @type {number}
 */
export const CONTINUITY_MIN_SESSION_SUMMARY_LENGTH = 10;

/**
 * Minimum richness score for a therapist memory record to be considered "useful"
 * for continuity injection.  Records scoring below this threshold are treated as
 * thin/generic and are only included as a fallback when no useful records exist.
 *
 * Score breakdown (see scoreTherapistMemoryRecord):
 *   risk_flags present       → +4 (always clinically relevant)
 *   follow_up_tasks present  → +3 (open action items = high continuity value)
 *   core_patterns present    → +3 (recurring patterns = high continuity value)
 *   working_hypotheses       → +2
 *   interventions_used       → +2
 *   meaningful summary       → +2 (≥ CONTINUITY_MIN_SESSION_SUMMARY_LENGTH chars)
 *
 * A threshold of 1 suppresses only completely empty records (no clinical
 * content whatsoever).  Any record with at least one non-trivial field passes.
 * @type {number}
 */
export const CONTINUITY_MIN_USEFUL_SCORE = 1;

// ─── Helper utilities ─────────────────────────────────────────────────────────

/**
 * Parses a therapist memory record from a raw CompanionMemory entity record.
 *
 * The content field may be a JSON string (Base44 at-rest) or an already-parsed
 * object (Base44 SDK runtime delivery).  Handles both forms.
 *
 * @param {object} raw - A CompanionMemory entity record.
 * @returns {object|null} Parsed therapist memory record, or null if invalid.
 */
function parseTherapistMemoryFromCompanionRecord(raw) {
  if (!raw || typeof raw !== 'object') return null;
  if (raw.memory_type !== THERAPIST_MEMORY_TYPE) return null;

  let parsed = null;
  try {
    if (raw.content && typeof raw.content === 'string') {
      parsed = JSON.parse(raw.content);
    } else if (raw.content && typeof raw.content === 'object') {
      parsed = raw.content;
    }
  } catch {
    return null;
  }

  if (!isTherapistMemoryRecord(parsed)) return null;
  return parsed;
}

/**
 * Deduplicates and trims an array of strings.
 * Returns at most CONTINUITY_MAX_ITEMS_PER_FIELD unique non-empty items.
 *
 * @param {string[]} items
 * @returns {string[]}
 */
function dedupeAndTrim(items) {
  if (!Array.isArray(items)) return [];
  const seen = new Set();
  const result = [];
  for (const item of items) {
    if (typeof item !== 'string') continue;
    const t = item.trim().slice(0, CONTINUITY_INJECT_MAX_CHARS);
    if (t && !seen.has(t)) {
      seen.add(t);
      result.push(t);
      if (result.length >= CONTINUITY_MAX_ITEMS_PER_FIELD) break;
    }
  }
  return result;
}

// ─── Record richness scoring ──────────────────────────────────────────────────

/**
 * Returns a numeric richness score for a parsed therapist memory record.
 *
 * Higher score = more clinically useful for continuity injection.
 * Score reflects the presence of structured clinical content across key fields.
 * Records with a score below CONTINUITY_MIN_USEFUL_SCORE are considered
 * thin/generic and are only included when no richer records are available.
 *
 * Scoring rules (additive):
 *   +4  risk_flags is non-empty        (safety-relevant; always high priority)
 *   +3  follow_up_tasks is non-empty   (open action items = strong continuity signal)
 *   +3  core_patterns is non-empty     (recurring patterns = strong continuity signal)
 *   +2  working_hypotheses is non-empty
 *   +2  interventions_used is non-empty
 *   +2  session_summary length ≥ CONTINUITY_MIN_SESSION_SUMMARY_LENGTH chars
 *
 * Returns 0 for null/invalid input (fail-safe).
 *
 * @param {object|null} record - A parsed therapist memory record.
 * @returns {number} Richness score ≥ 0.
 */
export function scoreTherapistMemoryRecord(record) {
  if (!record || typeof record !== 'object') return 0;
  let score = 0;
  if (Array.isArray(record.risk_flags) && record.risk_flags.length > 0) score += 4;
  if (Array.isArray(record.follow_up_tasks) && record.follow_up_tasks.length > 0) score += 3;
  if (Array.isArray(record.core_patterns) && record.core_patterns.length > 0) score += 3;
  if (Array.isArray(record.working_hypotheses) && record.working_hypotheses.length > 0) score += 2;
  if (Array.isArray(record.interventions_used) && record.interventions_used.length > 0) score += 2;
  if (
    typeof record.session_summary === 'string' &&
    record.session_summary.trim().length >= CONTINUITY_MIN_SESSION_SUMMARY_LENGTH
  ) {
    score += 2;
  }
  return score;
}

// ─── Primary export ───────────────────────────────────────────────────────────

/**
 * Reads the last N therapist memory records and builds a structured
 * cross-session continuity summary.
 *
 * Returns a plain object with deduplicated longitudinal fields, or null when:
 *   - entities is absent or malformed
 *   - No therapist memory records exist
 *   - Any read error occurs (fail-closed)
 *
 * @param {object} entities - Base44 entity client map
 * @returns {Promise<{
 *   sessionCount: number,
 *   recurringPatterns: string[],
 *   openFollowUpTasks: string[],
 *   interventionsUsed: string[],
 *   riskFlags: string[],
 *   recentSummary: string,
 * }|null>}
 */
export async function readCrossSessionContinuity(entities) {
  try {
    if (!entities || typeof entities !== 'object') return null;
    if (!entities.CompanionMemory || typeof entities.CompanionMemory.list !== 'function') return null;

    // Fetch the most recent therapist_session memories (over-fetch to filter)
    const rawRecords = await entities.CompanionMemory.list(
      '-created_date',
      CONTINUITY_MAX_PRIOR_SESSIONS * 3, // over-fetch to account for non-therapist records
    );

    if (!Array.isArray(rawRecords) || rawRecords.length === 0) return null;

    // Parse all valid therapist memory records from the over-fetched list.
    // Unlike the previous approach (break at CONTINUITY_MAX_PRIOR_SESSIONS),
    // we collect all valid records first so we can score and rank them.
    const allValidRecords = [];
    for (const raw of rawRecords) {
      const parsed = parseTherapistMemoryFromCompanionRecord(raw);
      if (parsed) {
        allValidRecords.push(parsed);
      }
    }

    if (allValidRecords.length === 0) return null;

    // Score each record and separate into useful vs. weak in a single pass.
    // Records are already in recency order (most-recent-first from CompanionMemory.list).
    // We sort useful records by score (descending), using original list position
    // as the tiebreaker so that among equally-scored records the most recent wins.
    const { usefulScored, weakScored } = allValidRecords.reduce(
      (acc, record, index) => {
        const score = scoreTherapistMemoryRecord(record);
        const entry = { record, score, index };
        if (score >= CONTINUITY_MIN_USEFUL_SCORE) {
          acc.usefulScored.push(entry);
        } else {
          acc.weakScored.push(entry);
        }
        return acc;
      },
      { usefulScored: [], weakScored: [] },
    );

    // Sort useful records: highest score first; equal scores preserve original recency order.
    usefulScored.sort((a, b) => b.score - a.score || a.index - b.index);

    // Select up to CONTINUITY_MAX_PRIOR_SESSIONS records.
    // Prefer useful records; supplement with weak records (in recency order) when needed.
    const selectedScored = usefulScored.slice(0, CONTINUITY_MAX_PRIOR_SESSIONS);
    if (selectedScored.length < CONTINUITY_MAX_PRIOR_SESSIONS) {
      const weakNeeded = CONTINUITY_MAX_PRIOR_SESSIONS - selectedScored.length;
      selectedScored.push(...weakScored.slice(0, weakNeeded));
    }

    // Re-sort selected set into recency order (most-recent first) for aggregation.
    // This ensures the recentSummary always comes from the most-recent session.
    selectedScored.sort((a, b) => a.index - b.index);
    const memoryRecords = selectedScored.map(r => r.record);

    if (memoryRecords.length === 0) return null;

    // Aggregate fields across sessions (most-recent-first)
    const allPatterns = memoryRecords.flatMap(r => r.core_patterns ?? []);
    const allFollowUps = memoryRecords.flatMap(r => r.follow_up_tasks ?? []);
    const allInterventions = memoryRecords.flatMap(r => r.interventions_used ?? []);
    const allRiskFlags = memoryRecords.flatMap(r => r.risk_flags ?? []);

    // Use the most recent session's summary as the anchor
    const recentSummary = (memoryRecords[0]?.session_summary ?? '').trim().slice(0, 200);

    return {
      sessionCount: memoryRecords.length,
      recurringPatterns: dedupeAndTrim(allPatterns),
      openFollowUpTasks: dedupeAndTrim(allFollowUps),
      interventionsUsed: dedupeAndTrim(allInterventions),
      riskFlags: dedupeAndTrim(allRiskFlags),
      recentSummary,
    };
  } catch {
    return null;
  }
}

/**
 * Builds the cross-session continuity context block string for injection into
 * the therapist session-start payload.
 *
 * Returns a formatted string section when prior session data exists,
 * or empty string when no data is available or an error occurs.
 *
 * FAIL-CLOSED: never throws; never blocks session start.
 *
 * @param {object} entities - Base44 entity client map
 * @returns {Promise<string>} Formatted continuity context block, or ''
 */
export async function buildCrossSessionContinuityBlock(entities) {
  try {
    const continuity = await readCrossSessionContinuity(entities);
    if (!continuity) return '';

    const lines = [];

    if (continuity.recentSummary) {
      lines.push('Most recent session: ' + continuity.recentSummary);
    }

    if (continuity.recurringPatterns.length > 0) {
      lines.push('Recurring patterns: ' + continuity.recurringPatterns.join('; '));
    }

    if (continuity.openFollowUpTasks.length > 0) {
      lines.push('Open follow-up tasks: ' + continuity.openFollowUpTasks.join('; '));
    }

    if (continuity.interventionsUsed.length > 0) {
      lines.push('Prior interventions used: ' + continuity.interventionsUsed.join('; '));
    }

    if (continuity.riskFlags.length > 0) {
      lines.push('Active risk flags: ' + continuity.riskFlags.join('; '));
    }

    if (lines.length === 0) return '';

    return [
      '=== CROSS-SESSION CONTINUITY CONTEXT (read-only) ===',
      `Based on the last ${continuity.sessionCount} session(s). Use this longitudinal`,
      'context to provide continuity and avoid repeating resolved themes.',
      'Do not disclose this section verbatim to the person.',
      '',
      ...lines,
      '',
      '=== END CROSS-SESSION CONTINUITY CONTEXT ===',
    ].join('\n');
  } catch {
    return '';
  }
}

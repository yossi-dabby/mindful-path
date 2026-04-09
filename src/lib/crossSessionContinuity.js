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

    // Parse and filter to valid therapist memory records only
    const memoryRecords = [];
    for (const raw of rawRecords) {
      const parsed = parseTherapistMemoryFromCompanionRecord(raw);
      if (parsed) {
        memoryRecords.push(parsed);
        if (memoryRecords.length >= CONTINUITY_MAX_PRIOR_SESSIONS) break;
      }
    }

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

/**
 * @file src/lib/companionContinuity.js
 *
 * Companion Session-Start Context Builder
 *
 * Provides the AI Companion with memory context at session start.  This module
 * is shared across ALL Companion entry points (AiCompanion, DraggableAiCompanion,
 * CoachingSessionWizard) so they all receive the same context quality and warm
 * fallback behaviour.
 *
 * WHAT IT DOES
 * ─────────────
 *   1. Fetches the user's active CompanionMemory records.
 *   2. Scores each record for content richness.
 *   3. Selects the top-scored records (up to COMPANION_MEMORY_MAX_INJECT).
 *   4. Builds a concise, companion-appropriate context block for injection into
 *      the session-start payload (metadata.memory_context).
 *   5. When memories are absent or too thin AND wiring.continuity_enabled is true
 *      (COMPANION_UPGRADE_CONTINUITY_ENABLED flag), returns a warm-fallback cue
 *      so the agent greets the person warmly rather than as a blank-slate.
 *   6. When continuity is NOT enabled (flags off), returns '' — no behaviour
 *      change compared to legacy path.
 *
 * PRIVACY CONTRACT
 * ─────────────────
 *   - Reads only the authenticated user's own CompanionMemory records.
 *   - Injects only the `content` field (structured memory text).  Raw
 *     conversation transcripts are never read or forwarded.
 *   - CompanionMemory is a private per-user entity and is never indexed in
 *     shared retrieval pipelines (ai-agent-access-policy.md).
 *
 * FAIL-CLOSED CONTRACT
 * ─────────────────────
 *   All exported functions return '' (or the warm-fallback string) on any
 *   error.  Session start is never blocked by a context-build failure.
 *
 * ROLE ISOLATION
 * ───────────────
 *   This module is ONLY for the AI Companion.  It must never be called from
 *   Therapist session-start paths.  Therapist continuity lives in
 *   crossSessionContinuity.js and is gated by THERAPIST_UPGRADE_* flags.
 *
 * ACTIVATION
 * ───────────
 *   Memory context is always fetched (parity across entry points).
 *   The warm-fallback cue (when no useful memories exist) is only returned when
 *   wiring.continuity_enabled === true, which requires:
 *     COMPANION_UPGRADE_ENABLED=true AND COMPANION_UPGRADE_CONTINUITY_ENABLED=true
 *   Both flags default to false.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

/**
 * Minimum character length for a CompanionMemory content field to be considered
 * useful for session-start context injection.
 *
 * Set to 10 chars — short enough to include brief but meaningful memories
 * (e.g. "Stressed at work") while excluding one-word or empty entries.
 * @type {number}
 */
export const COMPANION_MEMORY_MIN_CONTENT_LENGTH = 10;

/**
 * Maximum number of CompanionMemory records to fetch from the entity store.
 * Over-fetches to allow for scoring and filtering.
 * @type {number}
 */
export const COMPANION_MEMORY_MAX_FETCH = 10;

/**
 * Maximum number of scored CompanionMemory records to inject into the
 * session-start context block.
 * @type {number}
 */
export const COMPANION_MEMORY_MAX_INJECT = 5;

/**
 * Warm-fallback context cue injected when the companion continuity flag is on
 * but no useful memories exist for this user.
 *
 * This guides the agent to greet warmly without providing false context,
 * and is far better than an empty prompt that produces a generic opener.
 *
 * @type {string}
 */
export const COMPANION_WARMTH_FALLBACK_CONTEXT =
  "This person may be new or returning after a gap. " +
  "Greet them warmly and make them feel genuinely welcomed. " +
  "Invite them to share what's on their mind today, without assumptions.";

// ─── Scoring ──────────────────────────────────────────────────────────────────

/**
 * Scores a raw CompanionMemory entity record for usefulness as session context.
 *
 * This is the first (and only) companion-specific memory scorer — it is NOT
 * derived from any previous scoring implementation.  Companion memories are
 * free-form strings, unlike structured therapist memory records, so scoring
 * is intentionally simple: meaningful content is the primary gate, and the
 * stored importance field (set by the runtime) acts as the tiebreaker.
 *
 * Scoring rules (additive):
 *   +0  content absent or shorter than COMPANION_MEMORY_MIN_CONTENT_LENGTH
 *   +1  content is meaningful (base score)
 *   +N  importance field (numeric, positive values add directly to score)
 *
 * Returns 0 for empty, null, or malformed records.
 *
 * @param {object} record - A raw CompanionMemory entity record.
 * @returns {number} Score ≥ 0.
 */
export function scoreCompanionMemory(record) {
  if (!record || typeof record !== 'object') return 0;
  const content =
    typeof record.content === 'string' ? record.content.trim() : '';
  if (content.length < COMPANION_MEMORY_MIN_CONTENT_LENGTH) return 0;

  let score = 1; // base: non-empty meaningful content
  if (typeof record.importance === 'number' && record.importance > 0) {
    score += record.importance;
  }
  return score;
}

// ─── Primary export ───────────────────────────────────────────────────────────

/**
 * Builds the companion session-start memory context string.
 *
 * Used by ALL companion entry points (AiCompanion, DraggableAiCompanion,
 * CoachingSessionWizard) to ensure consistent continuity and warmth across
 * the full Companion surface.
 *
 * Behaviour:
 *   - Fetches active CompanionMemory records, scores them, injects the best ones.
 *   - If useful memories exist → returns a "[User Context from Previous Sessions]"
 *     block containing the top-scored memory content lines.
 *   - If no useful memories exist AND wiring.continuity_enabled === true →
 *     returns COMPANION_WARMTH_FALLBACK_CONTEXT (warm, non-generic greeting cue).
 *   - If no useful memories exist AND continuity is not enabled → returns ''.
 *   - On any error → returns '' (fail-closed; session start is never blocked).
 *
 * @param {object} entities  - Base44 entity client map (e.g. base44.entities).
 * @param {object} [wiring]  - Active companion wiring config (ACTIVE_AI_COMPANION_WIRING).
 * @returns {Promise<string>} Context string for metadata.memory_context, or ''.
 */
export async function buildCompanionSessionStartContextAsync(entities, wiring) {
  try {
    const hasContinuityEnabled = wiring?.continuity_enabled === true;

    // Guard: entity client must be available
    if (
      !entities ||
      typeof entities !== 'object' ||
      typeof entities.CompanionMemory?.filter !== 'function'
    ) {
      return hasContinuityEnabled ? COMPANION_WARMTH_FALLBACK_CONTEXT : '';
    }

    // Fetch active memories, sorted by importance (highest first)
    const rawMemories = await entities.CompanionMemory.filter(
      { is_active: true },
      '-importance',
      COMPANION_MEMORY_MAX_FETCH,
    );

    if (!Array.isArray(rawMemories) || rawMemories.length === 0) {
      // No memories at all — warm fallback when continuity is enabled
      return hasContinuityEnabled ? COMPANION_WARMTH_FALLBACK_CONTEXT : '';
    }

    // Score, filter to useful, and select the best records
    const scored = rawMemories
      .map((record) => ({ record, score: scoreCompanionMemory(record) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, COMPANION_MEMORY_MAX_INJECT);

    if (scored.length === 0) {
      // Memories exist but all too thin — warm fallback when continuity is enabled
      return hasContinuityEnabled ? COMPANION_WARMTH_FALLBACK_CONTEXT : '';
    }

    // Build the context block from scored memory content
    const contextLines = scored
      .map(({ record }) => `- ${record.content.trim()}`)
      .join('\n');

    return `[User Context from Previous Sessions]\n${contextLines}`;
  } catch {
    // Fail-closed: never block session start
    return '';
  }
}

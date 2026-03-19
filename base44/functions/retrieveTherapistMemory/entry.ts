import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * @file base44/functions/retrieveTherapistMemory/entry.ts
 *
 * Therapist Upgrade — Phase 1 — Structured Therapist Memory Read Function
 *
 * Retrieves structured therapist memory records for the authenticated user,
 * filtering only records that carry the Phase 1 version marker.  Returns them
 * as a structured array suitable for future session-start context injection.
 *
 * ACTIVATION
 * ----------
 * Gated by the THERAPIST_UPGRADE_MEMORY_ENABLED environment variable.
 * When the flag is not 'true', returns an empty memory set with gated: true
 * and HTTP 200 (not an error — the session simply starts without context).
 *
 * FAIL-OPEN CONTRACT
 * ------------------
 * Session start must NEVER be blocked by memory retrieval failure.
 * - If the flag is off → return { memories: [], gated: true } (HTTP 200)
 * - If the entity fetch errors → return { memories: [], error: '...' } (HTTP 200)
 * - If a record cannot be parsed → skip it; continue returning the rest
 * - Any uncaught error → return { memories: [], error: '...' } (HTTP 200)
 * The caller must treat any error or empty result as "start with no context".
 *
 * PRIVACY
 * -------
 * - Reads only the authenticated user's own CompanionMemory records.
 * - Filters records using the version marker so only therapist-structured
 *   records are returned — standard companion memory records are excluded.
 * - No cross-user data access.  CompanionMemory is private per-user.
 *
 * PHASE 1 CONSTRAINT — NOT AUTO-CALLED
 * -------------------------------------
 * This function is NOT wired to any session-start automation in Phase 1.
 * It establishes the read surface and validates the retrieval contract.
 * Active session-start wiring is introduced in a later phase when
 * CBT_THERAPIST_WIRING_STAGE2_V1 becomes the active wiring config.
 *
 * OUTPUT (always HTTP 200)
 * -------
 * {
 *   memories: TherapistMemoryRecord[],  // Parsed and filtered records
 *   count:    number,                   // Length of memories array
 *   source:   'therapist_structured',   // Constant for caller identification
 *   gated?:   true,                     // Present when flag is off
 *   error?:   string,                   // Present when retrieval failed
 * }
 *
 * See docs/therapist-upgrade-stage2-plan.md — Task 1.2 for full context.
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const THERAPIST_MEMORY_VERSION_KEY = 'therapist_memory_version';
const THERAPIST_MEMORY_VERSION = '1';
const THERAPIST_MEMORY_FLAG_ENV = 'THERAPIST_UPGRADE_MEMORY_ENABLED';

/**
 * How many raw CompanionMemory records to fetch before filtering.
 * We fetch more than the max to account for non-therapist records.
 */
const FETCH_LIMIT = 50;

/**
 * Maximum number of therapist memory records to return per request.
 * Limits the context payload size for future session-start injection.
 */
const MAX_MEMORIES = 10;

// ─── Structured response constants ───────────────────────────────────────────

const SOURCE = 'therapist_structured';

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // ── Gate: THERAPIST_UPGRADE_MEMORY_ENABLED must be 'true' ──────────────────
  // Fail-open: return empty memories (not an error) when flag is off.
  const flagEnabled = Deno.env.get(THERAPIST_MEMORY_FLAG_ENV) === 'true';
  if (!flagEnabled) {
    return Response.json({
      memories: [],
      count: 0,
      source: SOURCE,
      gated: true,
    });
  }

  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      // Fail-open for auth failure — return empty with error note
      return Response.json({
        memories: [],
        count: 0,
        source: SOURCE,
        error: 'Unauthorized — session starting with empty memory context.',
      });
    }

    // ── Fetch CompanionMemory records ─────────────────────────────────────────
    let rawRecords: Array<{ id: string; content?: string }> = [];
    try {
      rawRecords = await base44.entities.CompanionMemory.filter(
        { created_by: user.email },
        '-created_date',
        FETCH_LIMIT,
      );
    } catch (fetchError) {
      // Fail-open: entity fetch error — return empty memories
      const message = fetchError instanceof Error ? fetchError.message : String(fetchError);
      console.warn('[retrieveTherapistMemory] Fetch failed, returning empty context:', message);
      return Response.json({
        memories: [],
        count: 0,
        source: SOURCE,
        error: 'Memory retrieval unavailable — session starting with empty context.',
      });
    }

    // ── Filter and parse therapist-structured records ─────────────────────────
    const memories: object[] = [];
    for (const raw of rawRecords) {
      if (memories.length >= MAX_MEMORIES) {
        break;
      }
      if (!raw.content) {
        continue;
      }
      try {
        const parsed = JSON.parse(raw.content);
        // Only include records that carry the Phase 1 version marker
        if (
          parsed !== null &&
          typeof parsed === 'object' &&
          parsed[THERAPIST_MEMORY_VERSION_KEY] === THERAPIST_MEMORY_VERSION
        ) {
          // Attach the CompanionMemory record ID for reference (e.g. deduplication)
          memories.push({ ...parsed, _memory_id: raw.id });
        }
      } catch (_parseError) {
        // Skip unparseable records — do not block retrieval of valid records
        continue;
      }
    }

    return Response.json({
      memories,
      count: memories.length,
      source: SOURCE,
    });

  } catch (error) {
    // ── Fail-open: any unexpected error must not block session start ───────────
    const message = error instanceof Error ? error.message : String(error);
    console.error('[retrieveTherapistMemory] Unexpected error:', message);
    return Response.json({
      memories: [],
      count: 0,
      source: SOURCE,
      error: `Memory retrieval failed: ${message}`,
    });
  }
});

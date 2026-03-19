import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * @file base44/functions/writeTherapistMemory/entry.ts
 *
 * Therapist Upgrade — Phase 1 — Structured Therapist Memory Write Function
 *
 * Accepts a structured therapist memory payload and persists it to
 * CompanionMemory as a therapist-typed record (JSON content with a version
 * marker). This function establishes the write surface and validates the data
 * model for Phase 1.
 *
 * ACTIVATION
 * ----------
 * Gated by the THERAPIST_UPGRADE_MEMORY_ENABLED environment variable.
 * Returns 503 when the flag is not 'true'.  Both the master flag
 * (THERAPIST_UPGRADE_ENABLED) and this phase flag must be true before any
 * caller can use this function.
 *
 * PHASE 1 CONSTRAINT — NOT AUTO-CALLED
 * -------------------------------------
 * This function is NOT wired to any session automation, session-end trigger,
 * or scheduled job in Phase 1.  It exists to establish the write surface and
 * allow manual/test-only validation of the data model.  Automatic invocation
 * from live sessions is introduced in Phase 2 (session-end summarization).
 *
 * PRIVACY
 * -------
 * - Stores structured summaries only — never raw session transcripts.
 * - The calling layer is responsible for ensuring no raw PII is included
 *   in the structured fields.
 * - The CompanionMemory entity is private per-user — no cross-user access.
 *
 * FAIL-SAFE
 * ---------
 * Write failures return a structured error response (success: false).
 * Session close must NOT depend on this function — it must be called
 * in a fire-and-forget or non-blocking pattern by any future caller.
 *
 * INPUT (JSON body)
 * -----------------
 * {
 *   session_id?:          string,   // CoachingSession ID
 *   session_date?:        string,   // ISO 8601 date
 *   session_summary?:     string,   // Brief clinical summary (not a transcript)
 *   core_patterns?:       string[], // Recurring patterns identified
 *   triggers?:            string[], // Situational / emotional triggers
 *   automatic_thoughts?:  string[], // Automatic thoughts surfaced
 *   emotions?:            string[], // Emotions identified
 *   urges?:               string[], // Behavioral urges noted
 *   actions?:             string[], // Actions discussed
 *   consequences?:        string[], // Consequences of behaviors
 *   working_hypotheses?:  string[], // Working hypotheses
 *   interventions_used?:  string[], // CBT interventions used
 *   risk_flags?:          string[], // Risk classification labels (no raw quotes)
 *   safety_plan_notes?:   string,   // Brief safety plan notes
 *   follow_up_tasks?:     string[], // Tasks for next session
 *   goals_referenced?:    string[], // Goal IDs referenced
 *   last_summarized_date?: string,  // ISO 8601 date
 * }
 *
 * OUTPUT
 * ------
 * { success: true,  id: string }          — record persisted successfully
 * { success: false, error: string }        — flag off or write failed
 *
 * See docs/therapist-upgrade-stage2-plan.md — Task 1.1 for full context.
 */

// ─── Schema constants (mirror of src/lib/therapistMemoryModel.js) ─────────────
// These are duplicated here because Deno functions cannot import browser/Node
// modules from src/.  Keep in sync with the JS model definition.

const THERAPIST_MEMORY_VERSION_KEY = 'therapist_memory_version';
const THERAPIST_MEMORY_VERSION = '1';
const THERAPIST_MEMORY_FLAG_ENV = 'THERAPIST_UPGRADE_MEMORY_ENABLED';

const ALLOWED_ARRAY_FIELDS: string[] = [
  'core_patterns',
  'triggers',
  'automatic_thoughts',
  'emotions',
  'urges',
  'actions',
  'consequences',
  'working_hypotheses',
  'interventions_used',
  'risk_flags',
  'follow_up_tasks',
  'goals_referenced',
];

const ALLOWED_STRING_FIELDS: string[] = [
  'session_id',
  'session_date',
  'session_summary',
  'safety_plan_notes',
  'last_summarized_date',
];

// ─── Input sanitizer / record builder ────────────────────────────────────────

/**
 * Builds a sanitized therapist memory record from raw input.
 *
 * Only recognised field names are included (allowlist-based).
 * Array fields: only string items are retained; non-string items are dropped.
 * String fields: only genuine string values are accepted; anything else
 * defaults to an empty string.
 * The version marker is always set.
 *
 * @param input - Raw request body (any shape)
 * @returns A sanitized record object ready for JSON serialisation.
 */
function buildMemoryRecord(input: Record<string, unknown>): Record<string, unknown> {
  const record: Record<string, unknown> = {
    [THERAPIST_MEMORY_VERSION_KEY]: THERAPIST_MEMORY_VERSION,
  };

  for (const field of ALLOWED_STRING_FIELDS) {
    const val = input[field];
    record[field] = typeof val === 'string' ? val : '';
  }

  for (const field of ALLOWED_ARRAY_FIELDS) {
    const val = input[field];
    if (Array.isArray(val)) {
      // Keep only string items — reject numbers, objects, nulls
      record[field] = val.filter((item: unknown): item is string => typeof item === 'string');
    } else {
      record[field] = [];
    }
  }

  return record;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // ── Gate: THERAPIST_UPGRADE_MEMORY_ENABLED must be 'true' ──────────────────
  const flagEnabled = Deno.env.get(THERAPIST_MEMORY_FLAG_ENV) === 'true';
  if (!flagEnabled) {
    return Response.json(
      {
        success: false,
        error: 'Therapist memory upgrade is not enabled (THERAPIST_UPGRADE_MEMORY_ENABLED is off).',
        gated: true,
      },
      { status: 503 },
    );
  }

  try {
    // ── Auth ────────────────────────────────────────────────────────────────
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ── Parse and sanitize input ─────────────────────────────────────────────
    let rawInput: Record<string, unknown>;
    try {
      rawInput = await req.json();
    } catch (_parseError) {
      return Response.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
    }

    const memoryRecord = buildMemoryRecord(rawInput);

    // ── Persist to CompanionMemory ────────────────────────────────────────────
    // The structured therapist memory JSON is stored in the CompanionMemory
    // entity's content field.  The version marker in the JSON allows the read
    // function to distinguish therapist-structured records from standard
    // companion memory records.
    // No Base44 entity schema change is required — this uses the existing
    // generic content field of CompanionMemory.
    const created = await base44.entities.CompanionMemory.create({
      content: JSON.stringify(memoryRecord),
    });

    return Response.json({ success: true, id: created.id });

  } catch (error) {
    // ── Fail-safe ─────────────────────────────────────────────────────────────
    // Write failures must not propagate to the session-close caller.
    // Return a structured error; the caller discards or logs it non-blockingly.
    const message = error instanceof Error ? error.message : String(error);
    console.error('[writeTherapistMemory] Write failed:', message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
});

import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

/**
 * @file base44/functions/generateSessionSummary/entry.ts
 *
 * Therapist Upgrade — Phase 2 — Session-End Structured Summarization
 *
 * Accepts a structured session summary payload, validates and sanitizes it,
 * applies inline safety checks, and persists the result to CompanionMemory
 * using the Phase 1 therapist memory write path.
 *
 * ACTIVATION
 * ----------
 * Legacy gating is controlled by THERAPIST_UPGRADE_SUMMARIZATION_ENABLED.
 * When THERAPIST_RUNTIME_APPLY_ENABLED === 'true', runtime-authority mode is
 * active and this function instead requires BOTH
 * VITE_THERAPIST_UPGRADE_ENABLED === 'true' and
 * VITE_THERAPIST_UPGRADE_SUMMARIZATION_ENABLED === 'true'.
 * Returns 503 when the effective gate is not open.
 *
 * SESSION-END BOUNDARY
 * --------------------
 * This function is the Phase 2 session-end boundary. It must be called
 * explicitly at session end — either by a Base44 automation triggered when a
 * CoachingSession record is marked complete, or by any other explicit API
 * call from the app.
 *
 * It does NOT run automatically on every message. It does NOT trigger
 * from the existing session-close flow. It does NOT alter the current
 * default therapist path.
 *
 * FAIL-SAFE
 * ---------
 * - Forbidden input fields (raw transcripts, message histories) → safe stub
 *   stored instead of the submitted data.
 * - String fields containing raw-conversation patterns → safe stub stored.
 * - Write failure → structured error response (success: false, HTTP 500).
 * - Flag off → gated response (success: false, gated: true, HTTP 503).
 * - Session close MUST NOT depend on this function succeeding.
 *
 * PRIVACY
 * -------
 * - Never accepts raw transcripts, message logs, or conversation histories.
 * - All string fields are sanitized and length-limited before persistence.
 * - The CompanionMemory entity is private per-user — no cross-user access.
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
 *   last_summarized_date?: string,  // ISO 8601 date (defaults to now if omitted)
 * }
 *
 * FORBIDDEN INPUT FIELDS (any of these triggers the safe-stub path)
 * -----------------
 * messages, transcript, raw_session, conversation_history, full_session,
 * chat_history, message_log, session_log
 *
 * OUTPUT
 * ------
 * { success: true,  id: string, summary: object, safety_stub: boolean }
 * { success: false, error: string }            — write failed
 * { success: false, error: string, gated: true } — flag off (HTTP 503)
 *
 * See docs/therapist-upgrade-stage2-plan.md — Phase 2 for full context.
 */

// ─── Schema constants (mirror of src/lib/therapistMemoryModel.js) ─────────────
// These are duplicated here because Deno functions cannot import browser/Node
// modules from src/. Keep in sync with the JS model definition.

const THERAPIST_MEMORY_VERSION_KEY = 'therapist_memory_version';
const THERAPIST_MEMORY_VERSION = '1';

function isGenerateSessionSummaryEnabled(
  readEnv: (name: string) => string | undefined,
): boolean {
  if (readEnv('THERAPIST_RUNTIME_APPLY_ENABLED') === 'true') {
    return (
      readEnv('VITE_THERAPIST_UPGRADE_ENABLED') === 'true' &&
      readEnv('VITE_THERAPIST_UPGRADE_SUMMARIZATION_ENABLED') === 'true'
    );
  }

  return readEnv('THERAPIST_UPGRADE_SUMMARIZATION_ENABLED') === 'true';
}

/**
 * Returns true ONLY when runtime-authority continuity enrichment is active.
 *
 * All four environment variables must be exactly 'true':
 *   THERAPIST_RUNTIME_APPLY_ENABLED
 *   VITE_THERAPIST_UPGRADE_ENABLED          (MASTER)
 *   VITE_THERAPIST_UPGRADE_SUMMARIZATION_ENABLED
 *   VITE_THERAPIST_UPGRADE_CONTINUITY_ENABLED
 *
 * MASTER=false is a hard rollback: returns false immediately.
 * APPLY not 'true': preserves legacy behavior (no new enrichment).
 *
 * @param readEnv - Env reader (e.g. (name) => Deno.env.get(name)).
 */
function isRuntimeContinuityEnrichmentEnabled(
  readEnv: (name: string) => string | undefined,
): boolean {
  if (readEnv('THERAPIST_RUNTIME_APPLY_ENABLED') !== 'true') return false;
  if (readEnv('VITE_THERAPIST_UPGRADE_ENABLED') !== 'true') return false;
  if (readEnv('VITE_THERAPIST_UPGRADE_SUMMARIZATION_ENABLED') !== 'true') return false;
  if (readEnv('VITE_THERAPIST_UPGRADE_CONTINUITY_ENABLED') !== 'true') return false;
  return true;
}

type BackendEntityResponseShape =
  | 'array'
  | 'results_envelope'
  | 'data_array_envelope'
  | 'data_results_envelope'
  | 'empty'
  | 'unsupported'
  | 'error';

function classifyBackendEntityResponseShape(value: unknown): BackendEntityResponseShape {
  try {
    if (Array.isArray(value)) return 'array';
    if (value === null || value === undefined) return 'empty';
    if (typeof value !== 'object') return 'unsupported';
    const record = value as Record<string, unknown>;
    if (Array.isArray(record['results'])) return 'results_envelope';
    if (Array.isArray(record['data'])) return 'data_array_envelope';
    const data = record['data'];
    if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['results'])) {
      return 'data_results_envelope';
    }
    return 'unsupported';
  } catch {
    return 'error';
  }
}

function normalizeBackendEntityList(value: unknown): unknown[] {
  try {
    if (Array.isArray(value)) return value;
    if (!value || typeof value !== 'object') return [];

    const record = value as Record<string, unknown>;
    if (Array.isArray(record['results'])) return record['results'] as unknown[];
    if (Array.isArray(record['data'])) return record['data'] as unknown[];
    const data = record['data'];
    if (data && typeof data === 'object' && Array.isArray((data as Record<string, unknown>)['results'])) {
      return (data as Record<string, unknown>)['results'] as unknown[];
    }
  } catch {
    // Never throw.
  }
  return [];
}

const ALLOWED_STRING_FIELDS: string[] = [
  'session_id',
  'session_date',
  'session_summary',
  'safety_plan_notes',
  'last_summarized_date',
];

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

// Field names that indicate raw transcript or conversation-history content.
// Any of these in the input triggers the safe-stub path.
const FORBIDDEN_INPUT_FIELDS: string[] = [
  'messages',
  'transcript',
  'raw_session',
  'conversation_history',
  'full_session',
  'chat_history',
  'message_log',
  'session_log',
];

// Max lengths for individual string fields.
const STRING_FIELD_MAX_LENGTHS: Record<string, number> = {
  session_summary: 2000,
  safety_plan_notes: 1000,
  session_id: 256,
  session_date: 64,
  last_summarized_date: 64,
};
const DEFAULT_STRING_MAX_LENGTH = 500;

// Max items and item length for array fields.
const ARRAY_FIELD_MAX_ITEMS = 20;
const ARRAY_ITEM_MAX_LENGTH = 500;

// ─── Raw-transcript detection (mirrors src/lib/summarizationGate.js) ──────────

const RAW_TRANSCRIPT_PATTERNS: RegExp[] = [
  /^\s*(?:User|Patient|Client|Therapist|Assistant|AI|System)\s*:/m,
  /^\s*\d+\.\s+(?:User|Patient|Client|Therapist)\s*:/m,
  /\[\d{1,2}:\d{2}(?::\d{2})?\]/,
];

function isRawTranscript(value: string): boolean {
  return RAW_TRANSCRIPT_PATTERNS.some((p) => p.test(value));
}

// ─── Field sanitizers ─────────────────────────────────────────────────────────

function sanitizeStringField(value: unknown, fieldName: string): string {
  if (typeof value !== 'string') return '';
  if (isRawTranscript(value)) return '';
  const maxLen = STRING_FIELD_MAX_LENGTHS[fieldName] ?? DEFAULT_STRING_MAX_LENGTH;
  return value.trim().slice(0, maxLen);
}

function sanitizeArrayField(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const result: string[] = [];
  for (const item of value) {
    if (typeof item !== 'string') continue;
    if (isRawTranscript(item)) continue;
    const trimmed = item.trim().slice(0, ARRAY_ITEM_MAX_LENGTH);
    if (trimmed.length > 0) result.push(trimmed);
    if (result.length >= ARRAY_FIELD_MAX_ITEMS) break;
  }
  return result;
}

// ─── Minimal safe stub builder ────────────────────────────────────────────────

function buildSafeStub(sessionId: string, sessionDate: string): Record<string, unknown> {
  return {
    [THERAPIST_MEMORY_VERSION_KEY]: THERAPIST_MEMORY_VERSION,
    session_id: sessionId,
    session_date: sessionDate,
    session_summary: '',
    core_patterns: [],
    triggers: [],
    automatic_thoughts: [],
    emotions: [],
    urges: [],
    actions: [],
    consequences: [],
    working_hypotheses: [],
    interventions_used: [],
    risk_flags: [],
    safety_plan_notes: '',
    follow_up_tasks: [],
    goals_referenced: [],
    last_summarized_date: new Date().toISOString(),
  };
}

// ─── Record builder ───────────────────────────────────────────────────────────

/**
 * Builds a sanitized and validated summary record from raw input.
 *
 * - Forbidden fields → safe stub (safety_stub: true).
 * - Raw-transcript content in session_summary → safe stub (safety_stub: true).
 * - All other fields → sanitized by type.
 *
 * @param input - Raw request body (any shape).
 * @returns The sanitized record, rejected field names, and whether a stub was used.
 */
function buildSummaryRecord(input: Record<string, unknown>): {
  record: Record<string, unknown>;
  rejected_fields: string[];
  safety_stub: boolean;
} {
  // Detect forbidden input fields.
  const rejected_fields: string[] = [];
  for (const key of Object.keys(input)) {
    if (FORBIDDEN_INPUT_FIELDS.includes(key)) {
      rejected_fields.push(key);
    }
  }

  const sessionId = sanitizeStringField(input['session_id'], 'session_id');
  const sessionDate = sanitizeStringField(input['session_date'], 'session_date');

  // If forbidden fields were found, store a safe stub.
  if (rejected_fields.length > 0) {
    return {
      record: buildSafeStub(sessionId, sessionDate),
      rejected_fields,
      safety_stub: true,
    };
  }

  const record: Record<string, unknown> = {
    [THERAPIST_MEMORY_VERSION_KEY]: THERAPIST_MEMORY_VERSION,
  };

  for (const field of ALLOWED_STRING_FIELDS) {
    record[field] = sanitizeStringField(input[field], field);
  }

  for (const field of ALLOWED_ARRAY_FIELDS) {
    record[field] = sanitizeArrayField(input[field]);
  }

  // Safety guard: if session_summary still looks like a raw transcript after
  // sanitization (should not happen given sanitizeStringField, but defensive),
  // fall back to the safe stub.
  const summaryValue = record['session_summary'];
  if (typeof summaryValue === 'string' && isRawTranscript(summaryValue)) {
    console.warn(
      '[generateSessionSummary] Raw transcript detected in session_summary — using safe stub.'
    );
    return {
      record: buildSafeStub(sessionId, sessionDate),
      rejected_fields,
      safety_stub: true,
    };
  }

  // If last_summarized_date was omitted or empty, default to now.
  if (!record['last_summarized_date']) {
    record['last_summarized_date'] = new Date().toISOString();
  }

  return { record, rejected_fields, safety_stub: false };
}

// ─── Handler ──────────────────────────────────────────────────────────────────

Deno.serve(async (req) => {
  // ── Gate: preserve legacy backend semantics unless runtime authority is on ──
  // When THERAPIST_RUNTIME_APPLY_ENABLED === 'true', require strict VITE master
  // + summarization flags. Otherwise keep the legacy backend secret gate.
  const flagEnabled = isGenerateSessionSummaryEnabled((name) => Deno.env.get(name));
  if (!flagEnabled) {
    return Response.json(
      {
        success: false,
        error:
          'Session-end summarization is not enabled (THERAPIST_UPGRADE_SUMMARIZATION_ENABLED is off).',
        gated: true,
      },
      { status: 503 },
    );
  }

  try {
    // ── Auth ─────────────────────────────────────────────────────────────────
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // ── Parse input ───────────────────────────────────────────────────────────
    let rawInput: Record<string, unknown>;
    try {
      rawInput = await req.json();
    } catch (_parseError) {
      return Response.json({ success: false, error: 'Invalid JSON body.' }, { status: 400 });
    }

    // ── Build and sanitize summary record ──────────────────────────────────
    const { record, rejected_fields, safety_stub } = buildSummaryRecord(rawInput);

    if (rejected_fields.length > 0) {
      console.warn(
        '[generateSessionSummary] Rejected forbidden input fields:',
        rejected_fields,
      );
    }

    // ── Backend continuity enrichment (structured fallback) ──────────────────
    // Only active when ALL four runtime-authority continuity flags are set.
    // Never enriches a safety_stub. Never reads messages/transcript.
    // Read-only: Goal (id, title only) + CaseFormulation (core_belief only).
    // Merges with existing frontend enrichment; deduplicates.
    // If any read fails, the already-sanitized record is used as-is.
    const _backendContinuityEnabled = isRuntimeContinuityEnrichmentEnabled(
      (name) => Deno.env.get(name),
    );

    let _backendEnrichmentApplied = false;
    let _backendGoalCount = 0;
    let _backendFormulationPresent = false;
    let _backendGoalResponseShape: BackendEntityResponseShape = 'empty';
    let _backendFormulationResponseShape: BackendEntityResponseShape = 'empty';

    if (_backendContinuityEnabled && !safety_stub) {
      // Max records for backend enrichment.
      const BACKEND_MAX_GOALS = 5;

      // Existing goals_referenced and follow_up_tasks from frontend enrichment.
      const existingGoalIds: string[] = Array.isArray(record['goals_referenced'])
        ? (record['goals_referenced'] as string[]).filter((s) => typeof s === 'string')
        : [];
      const existingFollowUpTasks: string[] = Array.isArray(record['follow_up_tasks'])
        ? (record['follow_up_tasks'] as string[]).filter((s) => typeof s === 'string')
        : [];
      const existingWorkingHypotheses: string[] = Array.isArray(record['working_hypotheses'])
        ? (record['working_hypotheses'] as string[]).filter((s) => typeof s === 'string')
        : [];

      // ── Goal enrichment ───────────────────────────────────────────────────
      try {
        const goalsResponse = await base44.entities.Goal.filter(
          { status: 'active' },
          '-created_date',
          BACKEND_MAX_GOALS,
        );
        _backendGoalResponseShape = classifyBackendEntityResponseShape(goalsResponse);
        const goals: unknown[] = normalizeBackendEntityList(goalsResponse);
        _backendGoalCount = goals.length;

        const newGoalIds: string[] = [];
        const newFollowUpTasks: string[] = [];

        for (const goal of goals) {
          if (!goal || typeof goal !== 'object') continue;
          const g = goal as Record<string, unknown>;
          const id = typeof g['id'] === 'string' ? (g['id'] as string).trim() : '';
          const title =
            typeof g['title'] === 'string'
              ? sanitizeStringField((g['title'] as string).trim(), 'follow_up_tasks')
              : '';
          if (id && !existingGoalIds.includes(id) && !newGoalIds.includes(id)) {
            newGoalIds.push(id);
          }
          // Only add title if it passes the transcript detector and is non-empty.
          if (
            title &&
            !isRawTranscript(title) &&
            !existingFollowUpTasks.includes(title) &&
            !newFollowUpTasks.includes(title)
          ) {
            newFollowUpTasks.push(title);
          }
        }

        if (newGoalIds.length > 0 || newFollowUpTasks.length > 0) {
          const mergedGoalIds = sanitizeArrayField([...existingGoalIds, ...newGoalIds]);
          const mergedFollowUpTasks = sanitizeArrayField([
            ...existingFollowUpTasks,
            ...newFollowUpTasks,
          ]);
          if (mergedGoalIds.length > 0) record['goals_referenced'] = mergedGoalIds;
          if (mergedFollowUpTasks.length > 0) record['follow_up_tasks'] = mergedFollowUpTasks;
          _backendEnrichmentApplied = true;
        }
      } catch (_goalError) {
        _backendGoalResponseShape = 'error';
        // Goal read failure: do not fail the therapist_session write.
      }

      // ── CaseFormulation enrichment ─────────────────────────────────────────
      try {
        const formulationsResponse = await base44.entities.CaseFormulation.list(
          '-created_date',
          1,
        );
        _backendFormulationResponseShape = classifyBackendEntityResponseShape(
          formulationsResponse,
        );
        const formulations: unknown[] = normalizeBackendEntityList(formulationsResponse);
        if (formulations.length > 0) {
          const cf = formulations[0];
          if (cf && typeof cf === 'object') {
            const cfRecord = cf as Record<string, unknown>;
            const coreBelief =
              typeof cfRecord['core_belief'] === 'string'
                ? sanitizeStringField((cfRecord['core_belief'] as string).trim(), 'working_hypotheses')
                : '';
            if (
              coreBelief &&
              !isRawTranscript(coreBelief) &&
              !existingWorkingHypotheses.includes(coreBelief)
            ) {
              const mergedHypotheses = sanitizeArrayField([
                ...existingWorkingHypotheses,
                coreBelief,
              ]);
              if (mergedHypotheses.length > 0) {
                record['working_hypotheses'] = mergedHypotheses;
                _backendFormulationPresent = true;
                _backendEnrichmentApplied = true;
              }
            }
          }
        }
      } catch (_cfError) {
        _backendFormulationResponseShape = 'error';
        // CaseFormulation read failure: do not fail the therapist_session write.
      }
    }

    // ── Persist to CompanionMemory ────────────────────────────────────────
    // Uses the same persistence pattern as writeTherapistMemory (Phase 1).
    // The version marker in the JSON allows retrieveTherapistMemory to
    // recognise this as a structured therapist memory record.
    const created = await base44.entities.CompanionMemory.create({
      memory_type: 'therapist_session',
      content: JSON.stringify(record),
    });

    // Backend s2debug diagnostics (server-log only; not in chat UI).
    if (_backendContinuityEnabled) {
      console.log(
        '[_s2debug] backend_enrichment_applied:', _backendEnrichmentApplied,
        '| backend_goal_count:', _backendGoalCount,
        '| backend_formulation_present:', _backendFormulationPresent,
        '| backend_goal_response_shape:', _backendGoalResponseShape,
        '| backend_formulation_response_shape:', _backendFormulationResponseShape,
      );
    }

    return Response.json({
      success: true,
      id: created.id,
      summary: record,
      safety_stub,
      ...(rejected_fields.length > 0 ? { rejected_fields } : {}),
    });
  } catch (error) {
    // ── Fail-safe ─────────────────────────────────────────────────────────────
    // Summarization failure must not propagate to the session-close caller.
    // Return a structured error; the caller must discard or log it non-blockingly.
    const message = error instanceof Error ? error.message : String(error);
    console.error('[generateSessionSummary] Failed:', message);
    return Response.json({ success: false, error: message }, { status: 500 });
  }
});
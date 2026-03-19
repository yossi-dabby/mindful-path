/**
 * @file src/lib/therapistMemoryModel.js
 *
 * Therapist Upgrade — Phase 1 — Structured Therapist Memory Model
 *
 * Defines the schema, constants, and helpers for the structured therapist
 * memory layer.  This is the data contract for all Phase 1 memory operations.
 *
 * STORAGE APPROACH
 * ----------------
 * Therapist memory records are stored in the existing CompanionMemory entity.
 * The THERAPIST_MEMORY_VERSION_KEY acts as a JSON marker embedded in the
 * record's content that distinguishes therapist-structured records from
 * standard companion memory records.  No Base44 entity schema changes are
 * required — the structured data lives inside the existing content field.
 *
 * PRIVACY
 * -------
 * - CompanionMemory is a private per-user entity (never indexed in shared
 *   retrieval pipelines).
 * - Therapist memory records store concise structured summaries only — never
 *   raw session transcripts or full message histories.
 * - No PII beyond what the user has already shared in the session context
 *   should appear in structured memory fields.
 * - The memory layer inherits all existing CompanionMemory privacy boundaries.
 *
 * ACTIVATION
 * ----------
 * This model definition is inert in default mode.  The write and read surfaces
 * that use it are gated behind THERAPIST_UPGRADE_MEMORY_ENABLED (which itself
 * requires the THERAPIST_UPGRADE_ENABLED master gate).  Both flags default to
 * false.  No current default therapist code path references this module.
 *
 * This file contains no Deno APIs and no runtime side effects.  It is safe to
 * import in Vitest unit tests.
 *
 * See docs/therapist-upgrade-stage2-plan.md — Phase 1 for context.
 */

// ─── Version marker ───────────────────────────────────────────────────────────

/**
 * The JSON key embedded in every therapist memory record.
 * Used by retrieveTherapistMemory to filter CompanionMemory records that
 * belong to the structured therapist memory layer.
 *
 * @type {string}
 */
export const THERAPIST_MEMORY_VERSION_KEY = 'therapist_memory_version';

/**
 * The version string for Phase 1 therapist memory records.
 * Bump this in a later phase if the schema changes in a breaking way.
 *
 * @type {string}
 */
export const THERAPIST_MEMORY_VERSION = '1';

// ─── CompanionMemory write constants ─────────────────────────────────────────

/**
 * The value written to the memory_type field of CompanionMemory when
 * writeTherapistMemory creates a therapist session record.
 *
 * The CompanionMemory entity requires memory_type as a required field.
 * 'therapist_session' identifies these records as therapist-generated
 * clinical summaries and distinguishes them from companion-generated entries.
 *
 * NOTE: Therapist record identification at read time relies on the
 * therapist_memory_version JSON marker inside the content field, NOT on
 * memory_type alone.  memory_type is required by the schema and provides
 * a secondary human-readable label.
 *
 * @type {string}
 */
export const THERAPIST_MEMORY_TYPE = 'therapist_session';

// ─── Schema definition ────────────────────────────────────────────────────────

/**
 * Canonical schema for a structured therapist memory record.
 *
 * Every field is listed with its expected type and default value.
 * All array fields default to empty arrays (not shared references).
 * All string fields default to empty strings.
 *
 * Frozen to prevent accidental mutation.  Use createEmptyTherapistMemoryRecord()
 * to create mutable instances.
 *
 * DESIGN PRINCIPLES
 * - Concise: no raw transcripts, no full session text
 * - Structured: typed arrays and strings only
 * - Privacy-preserving: clinical relevance guides what is stored
 * - Forward-compatible: new fields can be added additively
 *
 * @type {Readonly<{
 *   therapist_memory_version: string,
 *   session_id: string,
 *   session_date: string,
 *   session_summary: string,
 *   core_patterns: string[],
 *   triggers: string[],
 *   automatic_thoughts: string[],
 *   emotions: string[],
 *   urges: string[],
 *   actions: string[],
 *   consequences: string[],
 *   working_hypotheses: string[],
 *   interventions_used: string[],
 *   risk_flags: string[],
 *   safety_plan_notes: string,
 *   follow_up_tasks: string[],
 *   goals_referenced: string[],
 *   last_summarized_date: string,
 * }>}
 */
export const THERAPIST_MEMORY_SCHEMA = Object.freeze({
  /** Version marker — always THERAPIST_MEMORY_VERSION ('1'). */
  [THERAPIST_MEMORY_VERSION_KEY]: THERAPIST_MEMORY_VERSION,

  /** ID of the CoachingSession this memory was derived from. */
  session_id: '',

  /** ISO 8601 date string of the session. */
  session_date: '',

  /** Brief, clinically relevant session summary. Not a transcript. */
  session_summary: '',

  /** Recurring cognitive or behavioral patterns identified this session. */
  core_patterns: [],

  /** Identified situational, emotional, or interpersonal triggers. */
  triggers: [],

  /** Automatic thoughts surfaced during the session. */
  automatic_thoughts: [],

  /** Emotions the client identified or the therapist observed. */
  emotions: [],

  /** Urges (behavioral impulses) noted during the session. */
  urges: [],

  /** Behavioral actions discussed or planned. */
  actions: [],

  /** Consequences of behaviors or thought patterns discussed. */
  consequences: [],

  /** Working hypotheses about the client's core beliefs or patterns. */
  working_hypotheses: [],

  /** CBT interventions used in this session (e.g. 'thought_record', 'exposure'). */
  interventions_used: [],

  /**
   * Risk flags raised during the session.
   * E.g. ['passive_ideation', 'self_harm_mention'].
   * Must not contain raw quotes — only clinical classification labels.
   */
  risk_flags: [],

  /**
   * Brief notes related to the safety plan.
   * No raw user quotes — clinical notes only.
   */
  safety_plan_notes: '',

  /** Action items or tasks for the next session. */
  follow_up_tasks: [],

  /** IDs of Goal records referenced during the session. */
  goals_referenced: [],

  /** ISO 8601 date when this memory record was last summarized or updated. */
  last_summarized_date: '',
});

// ─── Field registry ───────────────────────────────────────────────────────────

/**
 * The set of all valid top-level keys in a therapist memory record.
 * Used for validation and schema-integrity checks.
 *
 * @type {ReadonlySet<string>}
 */
export const THERAPIST_MEMORY_FIELDS = Object.freeze(
  new Set(Object.keys(THERAPIST_MEMORY_SCHEMA))
);

/**
 * Field names whose values must be arrays of strings.
 * @type {ReadonlyArray<string>}
 */
export const THERAPIST_MEMORY_ARRAY_FIELDS = Object.freeze([
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
]);

/**
 * Field names whose values must be strings.
 * @type {ReadonlyArray<string>}
 */
export const THERAPIST_MEMORY_STRING_FIELDS = Object.freeze([
  THERAPIST_MEMORY_VERSION_KEY,
  'session_id',
  'session_date',
  'session_summary',
  'safety_plan_notes',
  'last_summarized_date',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Creates a new empty therapist memory record.
 *
 * Array fields are fresh empty arrays (not shared with the schema).
 * String fields are set to their schema defaults.
 * The version marker is always set to THERAPIST_MEMORY_VERSION.
 *
 * @returns {object} A plain mutable object matching the therapist memory schema.
 */
export function createEmptyTherapistMemoryRecord() {
  const record = {};
  for (const [key, value] of Object.entries(THERAPIST_MEMORY_SCHEMA)) {
    record[key] = Array.isArray(value) ? [] : value;
  }
  return record;
}

/**
 * Returns true if the given value is a therapist memory record.
 *
 * A therapist memory record is any plain object whose top-level
 * THERAPIST_MEMORY_VERSION_KEY equals THERAPIST_MEMORY_VERSION.
 *
 * Used by retrieveTherapistMemory to filter CompanionMemory records that
 * belong to the structured therapist memory layer from those that belong to
 * the standard companion memory layer.
 *
 * @param {unknown} record - Any value.
 * @returns {boolean}
 */
export function isTherapistMemoryRecord(record) {
  if (record === null || typeof record !== 'object') {
    return false;
  }
  return record[THERAPIST_MEMORY_VERSION_KEY] === THERAPIST_MEMORY_VERSION;
}

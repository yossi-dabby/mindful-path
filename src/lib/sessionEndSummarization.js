/**
 * @file src/lib/sessionEndSummarization.js
 *
 * Therapist Upgrade — Phase 2.1 — Real Session-End Invocation Path
 *
 * Phase 2.1 closes two gaps left open by Phase 2:
 *   1. There was no real, bounded session-end invocation path.
 *   2. The generateSessionSummary backend accepted only pre-shaped payloads;
 *      there was no step that derived structured output FROM session/conversation input.
 *
 * This module provides:
 *   A. deriveSessionSummaryPayload(session, boundedMessages)
 *      — The ACTUAL summarization step. Takes a CoachingSession entity and a
 *        bounded conversation message window. Extracts structured, clinical data
 *        deterministically (non-LLM) from session metadata and action plan.
 *        Returns a payload matching the Phase 1 therapist-memory contract.
 *
 *   B. triggerSessionEndSummarization(session, messages, invoker)
 *      — The REAL INVOCATION PATH. Checks isSummarizationEnabled(), derives the
 *        summary payload, then calls the generateSessionSummary backend function
 *        via base44.functions.invoke. Completely non-blocking (fire-and-forget).
 *        When flags are off it is entirely inert.
 *
 * ACTIVATION
 * ----------
 * Gated by THERAPIST_UPGRADE_SUMMARIZATION_ENABLED (and master
 * THERAPIST_UPGRADE_ENABLED). Both flags default to false.
 * When flags are off, this module is imported safely but triggerSessionEndSummarization
 * returns immediately without side effects.
 *
 * SESSION-END BOUNDARY
 * --------------------
 * triggerSessionEndSummarization is called from CoachingChat.jsx when the
 * session stage transitions to 'completed' via updateStageMutation.onSuccess.
 * This is a real, bounded, explicit session-completion surface — it fires once
 * per stage transition, not on every message. It is non-blocking: the session
 * close UX is unaffected whether summarization succeeds or fails.
 *
 * BOUNDED INPUT
 * -------------
 * - Only the last SESSION_SUMMARIZATION_MAX_MESSAGES messages are included.
 * - Session metadata (title, focus_area, current_challenge, desired_outcome,
 *   action_plan, related_goals) is used for structured extraction.
 * - No full transcript is dumped; no raw message content is stored.
 * - Message content is used only for bounding, not for field population.
 *
 * PRIVACY
 * -------
 * - deriveSessionSummaryPayload does NOT store raw message content.
 * - session_summary is built from structured metadata fields only.
 * - The output is sanitized through the Phase 2 sanitizeSummaryRecord contract
 *   before any persistence.
 * - Forbidden fields (transcript, messages, etc.) are never included in output.
 *
 * FAIL-SAFE
 * ---------
 * - All errors in triggerSessionEndSummarization are caught.
 * - Summarization failure never propagates to the caller.
 * - The session-close UX is independent of this function.
 *
 * This file contains no Deno APIs and no runtime side effects beyond an async
 * function that fires-and-forgets. It is safe to import in Vitest unit tests
 * (the base44 dependency is only imported lazily inside triggerSessionEndSummarization).
 *
 * See docs/therapist-upgrade-stage2-plan.md — Phase 2.1 for context.
 */

import { isSummarizationEnabled } from './summarizationGate.js';
import { sanitizeSummaryRecord, buildSafeStubRecord } from './summarizationGate.js';

// ─── Bounded input constants ──────────────────────────────────────────────────

/**
 * Maximum number of messages included in the summarization input window.
 * Only the last N messages are passed. Prevents large transcript windows.
 *
 * @type {number}
 */
export const SESSION_SUMMARIZATION_MAX_MESSAGES = 40;

/**
 * Maximum character length for free-text session metadata fields
 * (current_challenge, desired_outcome) when building session_summary.
 * Prevents accidental storage of very long user-typed text blobs.
 *
 * @type {number}
 */
const MAX_METADATA_FIELD_LENGTH = 300;

// ─── Actual summarization step ────────────────────────────────────────────────

/**
 * Derives a structured therapist-memory summary payload from bounded
 * session/conversation input.
 *
 * THIS IS THE ACTUAL SUMMARIZATION STEP (Phase 2.1 Gap 2).
 *
 * It takes a real CoachingSession entity and a bounded conversation message
 * window, and produces a structured record matching the Phase 1 therapist-memory
 * contract — without requiring a pre-shaped summary payload from the caller.
 *
 * APPROACH (non-LLM, deterministic)
 * - session_summary: constructed from session.focus_area + session.current_challenge
 *   + session.desired_outcome (structured metadata, not raw transcript).
 * - follow_up_tasks: extracted from incomplete action_plan items.
 * - actions: extracted from completed action_plan items.
 * - goals_referenced: extracted from session.related_goals.
 * - interventions_used: derived from session.stage.
 * - All other clinical arrays: empty (not guessable without LLM).
 * - Message window: used to bound input scope; message content is NOT stored.
 *
 * The output is passed through sanitizeSummaryRecord to enforce the Phase 2
 * contract before any downstream use.
 *
 * @param {object} session
 *   A CoachingSession entity. Must have at minimum: { id, stage }.
 *   Optional enrichment: focus_area, current_challenge, desired_outcome,
 *   action_plan, related_goals, created_date.
 * @param {Array} [messages=[]]
 *   Conversation messages from the session (bounded to SESSION_SUMMARIZATION_MAX_MESSAGES).
 *   Message content is NOT stored in the output — only the window size is used.
 * @returns {object}
 *   A sanitized summary record matching the Phase 1 therapist-memory schema.
 *   Returns buildSafeStubRecord() if the session argument is invalid.
 */
export function deriveSessionSummaryPayload(session, messages = []) {
  // Fail-safe: invalid session → safe stub
  if (!session || typeof session !== 'object') {
    return buildSafeStubRecord('', '');
  }

  const sessionId = typeof session.id === 'string' ? session.id : '';
  const sessionDate =
    typeof session.created_date === 'string'
      ? session.created_date
      : new Date().toISOString();

  // Bound the message window — content is not extracted from messages in the
  // non-LLM path; only the window size matters for privacy bounding.
  const _boundedMessages = Array.isArray(messages)
    ? messages.slice(-SESSION_SUMMARIZATION_MAX_MESSAGES)
    : [];

  // ── session_summary ─────────────────────────────────────────────────────────
  // Built from structured session metadata (not message content).
  // Max 2000 chars enforced downstream by sanitizeSummaryRecord.
  const focusArea = typeof session.focus_area === 'string' ? session.focus_area.trim() : '';
  const challenge =
    typeof session.current_challenge === 'string'
      ? session.current_challenge.trim().slice(0, MAX_METADATA_FIELD_LENGTH)
      : '';
  const outcome =
    typeof session.desired_outcome === 'string'
      ? session.desired_outcome.trim().slice(0, MAX_METADATA_FIELD_LENGTH)
      : '';

  let sessionSummary = '';
  if (focusArea && challenge) {
    sessionSummary = `Session focused on ${focusArea}. Challenge: ${challenge}.`;
    if (outcome) {
      sessionSummary += ` Desired outcome: ${outcome}.`;
    }
  } else if (challenge) {
    sessionSummary = `Challenge addressed: ${challenge}.`;
  } else if (focusArea) {
    sessionSummary = `Session focused on ${focusArea}.`;
  }

  // ── follow_up_tasks (incomplete action_plan items) ──────────────────────────
  const actionPlan = Array.isArray(session.action_plan) ? session.action_plan : [];
  const followUpTasks = actionPlan
    .filter((item) => item && typeof item.title === 'string' && !item.completed)
    .map((item) => item.title.trim())
    .filter((t) => t.length > 0)
    .slice(0, 20);

  // ── actions (completed action_plan items) ───────────────────────────────────
  const actions = actionPlan
    .filter((item) => item && typeof item.title === 'string' && item.completed)
    .map((item) => item.title.trim())
    .filter((t) => t.length > 0)
    .slice(0, 20);

  // ── goals_referenced ────────────────────────────────────────────────────────
  const goalsReferenced = Array.isArray(session.related_goals)
    ? session.related_goals
        .filter((g) => typeof g === 'string' && g.trim().length > 0)
        .map((g) => g.trim())
        .slice(0, 20)
    : [];

  // ── interventions_used (derived from session stage) ─────────────────────────
  const stage = typeof session.stage === 'string' ? session.stage : '';
  const interventionsUsed =
    stage && stage !== 'completed' && stage.length > 0 ? [stage] : [];

  // ── Build raw payload (will be sanitized through Phase 2 contract) ───────────
  const rawPayload = {
    session_id: sessionId,
    session_date: sessionDate,
    session_summary: sessionSummary,
    core_patterns: [],
    triggers: [],
    automatic_thoughts: [],
    emotions: [],
    urges: [],
    actions,
    consequences: [],
    working_hypotheses: [],
    interventions_used: interventionsUsed,
    risk_flags: [],
    safety_plan_notes: '',
    follow_up_tasks: followUpTasks,
    goals_referenced: goalsReferenced,
    last_summarized_date: new Date().toISOString(),
  };

  // Sanitize through the Phase 2 contract (validates all fields, enforces lengths,
  // blocks transcript dumps, enforces version marker).
  const { record } = sanitizeSummaryRecord(rawPayload);
  return record;
}

// ─── Real session-end invocation path ────────────────────────────────────────

/**
 * Triggers session-end summarization non-blockingly.
 *
 * THIS IS THE REAL SESSION-END INVOCATION PATH (Phase 2.1 Gap 1).
 *
 * It is called from CoachingChat.jsx when the session stage transitions to
 * 'completed' (the real session-completion boundary). The call is:
 *   - Gated: checks isSummarizationEnabled() first; returns immediately if false.
 *   - Bounded: passes only session metadata + last N messages.
 *   - Non-blocking: fires-and-forgets via an async IIFE; never throws to caller.
 *   - Safe: all errors are caught; session close UX is unaffected.
 *   - Inert in default mode: when flags are off, this function is a no-op.
 *
 * In default mode (flags off) this function returns synchronously with no
 * side effects — the current therapist path is completely unaffected.
 *
 * @param {object} session - The CoachingSession entity at the completion boundary.
 * @param {Array} [messages=[]] - Conversation messages (bounded to max window).
 * @param {string} [invoker='stage_completed'] - Diagnostic label for the trigger source.
 */
export function triggerSessionEndSummarization(
  session,
  messages = [],
  invoker = 'stage_completed',
) {
  // Gate check: if not enabled, return immediately — entirely inert
  if (!isSummarizationEnabled()) {
    return;
  }

  // Non-blocking: fire-and-forget; caller is never awaited or blocked
  (async () => {
    try {
      const payload = deriveSessionSummaryPayload(session, messages);

      // Lazy import to avoid any bundler/module cost in default-off mode
      const { base44 } = await import('../api/base44Client.js');

      await base44.functions.invoke('generateSessionSummary', payload);
    } catch (error) {
      // Summarization failure must never propagate to the caller.
      // Session close UX is independent of this function.
      console.warn(
        '[Phase 2.1] Session-end summarization failed (non-fatal) [' + invoker + ']:',
        error instanceof Error ? error.message : String(error),
      );
    }
  })();
}

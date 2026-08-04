/**
 * @file src/lib/chatOrchestratorV2.js
 *
 * Phase 1 — Canonical Chat Turn Coordinator (V2)
 *
 * Provides a bounded turn lifecycle for Chat.jsx when
 * VITE_CHAT_ORCHESTRATOR_V2_ENABLED=true.  The Phase 0 legacy path in Chat.jsx
 * is unchanged when the flag is false.
 *
 * DESIGN CONSTRAINTS
 * ──────────────────
 * 1. Turn correlation never uses array index or messages.length + 2.
 *    Every turn record carries a stable client_request_id.
 *
 * 2. Base44 does NOT expose a proven round-trip metadata field
 *    (reply_to_turn_id / generation_id) that survives the full
 *    addMessage → getConversation round trip.  Because that metadata
 *    round-trip CANNOT be proven, a single-flight queue is used:
 *    additional sends are queued until the active turn reaches a
 *    terminal state (completed | timed_out | failed).
 *
 * 3. All three delivery paths (polling, subscription, hydration) must
 *    call the same reconcile function.  The reconciler rejects stale
 *    snapshots, deduplicates polling/subscription copies, and never
 *    attaches a response to the wrong pending turn.
 *
 * 4. Polling timeout leaves the turn in a recoverable state so that a
 *    later subscription or hydration event can still commit the response.
 *
 * 5. Exactly one assistant response is committed per turn, and exactly
 *    one feedback identity is produced per committed response.
 *
 * 6. No clinical or transcript content is emitted in diagnostics — IDs,
 *    booleans, counts and enums only.
 *
 * TURN STATUS LIFECYCLE
 * ─────────────────────
 *   pending → sent → generating → completed
 *                              ↘ timed_out (recoverable)
 *                              ↘ failed
 *
 * PRIVACY RULE
 * ────────────
 * No user message text, assistant response text, correction block content,
 * clinical data, names, or personal identifiers must appear in any log or
 * diagnostic emitted by this module.
 */

import {
  deduplicateMessagesByLifecycleKeys,
  getAssistantIdentityKey,
} from './chatRuntimeLifecycle.js';

// ─── Turn status constants ─────────────────────────────────────────────────────

export const TURN_STATUS = Object.freeze({
  PENDING: 'pending',
  SENT: 'sent',
  GENERATING: 'generating',
  COMPLETED: 'completed',
  TIMED_OUT: 'timed_out',
  FAILED: 'failed',
});

const TERMINAL_STATUSES = new Set([
  TURN_STATUS.COMPLETED,
  TURN_STATUS.TIMED_OUT,
  TURN_STATUS.FAILED,
]);

// ─── ID generation ─────────────────────────────────────────────────────────────

/**
 * Generates a privacy-safe client-side request identifier.
 * Format: crid-<timestamp>-<random hex suffix>
 * Never includes user content, conversation IDs, or PII.
 *
 * @returns {string}
 */
export function generateClientRequestId() {
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 8);
  return `crid-${ts}-${rand}`;
}

// ─── Turn record factory ───────────────────────────────────────────────────────

/**
 * Creates a new bounded turn record.
 *
 * @param {object} params
 * @param {string} params.conversationId
 * @param {string} [params.userMessageId]        - Base44 message id if available after addMessage
 * @param {string} [params.generationId]         - generation identifier if available
 * @returns {TurnRecord}
 */
export function createTurnRecord({ conversationId, userMessageId, generationId } = {}) {
  return {
    conversation_id: conversationId ?? null,
    client_request_id: generateClientRequestId(),
    user_message_id: userMessageId ?? null,
    generation_id: generationId ?? null,
    status: TURN_STATUS.PENDING,
    created_at: new Date().toISOString(),
    committed_response_key: null,   // identity key of the committed assistant response
    feedback_identity: null,        // exactly one per committed response
  };
}

// ─── Turn state transitions ────────────────────────────────────────────────────

/**
 * Advance a turn record to a new status.
 * Transitions are validated; invalid transitions return the record unchanged.
 *
 * @param {TurnRecord} turn
 * @param {string} newStatus  - A TURN_STATUS value
 * @returns {TurnRecord}      - A new object (never mutates in place)
 */
export function advanceTurnStatus(turn, newStatus) {
  if (!turn || TERMINAL_STATUSES.has(turn.status)) return turn;
  if (!Object.values(TURN_STATUS).includes(newStatus)) return turn;
  return { ...turn, status: newStatus };
}

// ─── Coordinator factory ───────────────────────────────────────────────────────

/**
 * Creates a V2 turn coordinator instance.
 *
 * The coordinator owns:
 *   - the active turn record (at most one in-flight turn at a time)
 *   - the FIFO queue of pending sends (single-flight guarantee)
 *   - snapshot reconciliation for polling, subscription, and hydration
 *
 * @returns {ChatOrchestratorV2}
 */
export function createChatOrchestratorV2() {
  /** @type {TurnRecord|null} */
  let _activeTurn = null;

  /** @type {Array<{executeSend: Function, conversationId: string}>} */
  const _queue = [];

  /** Maximum number of sends that may be queued while a turn is active. */
  const _MAX_QUEUE_DEPTH = 10;

  /** @type {Set<string>} committed response keys across all turns (dedup guard) */
  const _committedResponseKeys = new Set();

  /** @type {Map<string, string>} client_request_id → feedback_identity */
  const _feedbackIdentities = new Map();

  /** @type {Array<object>} last committed visible messages snapshot */
  let _lastCommittedSnapshot = [];

  /**
   * Returns a copy of the active turn record (or null).
   * @returns {TurnRecord|null}
   */
  function getActiveTurn() {
    return _activeTurn ? { ..._activeTurn } : null;
  }

  /**
   * Returns the current queue depth (number of queued sends waiting).
   * @returns {number}
   */
  function getPendingTurnCount() {
    return _queue.length;
  }

  /**
   * Registers a new user send.
   *
   * If no turn is currently active, creates one immediately and returns it.
   * If a turn is active (single-flight), the send is queued and null is returned
   * to signal "queued, do not send yet".
   *
   * @param {object} params
   * @param {string} params.conversationId
   * @param {Function} params.executeSend  - async () => void  called when the turn is dequeued
   * @returns {{ turn: TurnRecord|null, queued: boolean, queue_full: boolean }}
   */
  function registerSend({ conversationId, executeSend }) {
    if (_activeTurn && !TERMINAL_STATUSES.has(_activeTurn.status)) {
      // Active turn in progress — queue the send if capacity allows.
      if (_queue.length >= _MAX_QUEUE_DEPTH) {
        // Queue full — reject without losing or reordering existing messages.
        return { turn: null, queued: false, queue_full: true };
      }
      _queue.push({ executeSend, conversationId });
      return { turn: null, queued: true, queue_full: false };
    }

    // Atomically create the next active turn record before executing.
    const turn = createTurnRecord({ conversationId });
    _activeTurn = turn;
    return { turn: { ...turn }, queued: false, queue_full: false };
  }

  /**
   * Updates the active turn's userMessageId after the Base44 addMessage call
   * resolves (if the SDK returns a message id).
   *
   * @param {string} clientRequestId
   * @param {string|null} userMessageId
   */
  function recordUserMessageId(clientRequestId, userMessageId) {
    if (
      _activeTurn &&
      _activeTurn.client_request_id === clientRequestId &&
      userMessageId
    ) {
      _activeTurn = { ..._activeTurn, user_message_id: userMessageId, status: TURN_STATUS.SENT };
    }
  }

  /**
   * Marks the active turn as generating.
   * @param {string} clientRequestId
   */
  function markGenerating(clientRequestId) {
    if (_activeTurn && _activeTurn.client_request_id === clientRequestId) {
      _activeTurn = advanceTurnStatus(_activeTurn, TURN_STATUS.GENERATING);
    }
  }

  /**
   * Marks the active turn as timed_out (recoverable).
   * The turn remains the active turn so late responses can still be reconciled.
   *
   * @param {string} clientRequestId
   * @returns {object} Privacy-safe diagnostic payload
   */
  function markTimedOut(clientRequestId) {
    if (_activeTurn && _activeTurn.client_request_id === clientRequestId) {
      _activeTurn = advanceTurnStatus(_activeTurn, TURN_STATUS.TIMED_OUT);
    }
    return {
      orchestrator_version: 'v2',
      client_request_id: clientRequestId,
      turn_status: _activeTurn?.client_request_id === clientRequestId
        ? _activeTurn.status
        : 'not_found',
      polling_exhausted: true,
    };
  }

  /**
   * Marks the active turn as failed and drains the next queued send if any.
   *
   * @param {string} clientRequestId
   * @returns {{ turn: TurnRecord, executeSend: Function }|null} The next queued item, or null.
   */
  function markFailed(clientRequestId) {
    if (_activeTurn && _activeTurn.client_request_id === clientRequestId) {
      _activeTurn = advanceTurnStatus(_activeTurn, TURN_STATUS.FAILED);
    }
    return _drainQueue();
  }

  /**
   * Initializes the baseline snapshot so that existing historical assistant
   * messages are not treated as new responses for the current turn.
   *
   * Must be called after loading or switching a conversation.
   *
   * @param {Array<object>} visibleMessages  Sanitized visible messages for the conversation.
   */
  function initBaseline(visibleMessages) {
    if (!Array.isArray(visibleMessages)) return;
    // Reset active turn (conversation switch resets coordinator state).
    _activeTurn = null;
    _queue.length = 0;
    _lastCommittedSnapshot = [...visibleMessages];
  }

  /**
   * Canonical snapshot reconciler.
   *
   * Called by polling, subscription, and hydration with a new messages snapshot.
   * Returns an object describing whether the snapshot was accepted and what
   * assistant response (if any) was committed.
   *
   * Rejection criteria (all are stale/safety guards):
   *   - No active turn
   *   - Snapshot is shorter than the last committed snapshot
   *   - No new assistant message visible since the last committed snapshot
   *   - The response key was already committed (dedup guard)
   *   - The active turn is already completed (one response per turn)
   *
   * @param {object} params
   * @param {Array<object>} params.snapshot      - Visible messages array from buildVisibleConversationMessages
   * @param {string}        params.deliverySource - 'polling' | 'subscription' | 'hydration'
   * @param {number}        [params.startingTurnId] - Passed to deduplicateMessagesByLifecycleKeys
   * @returns {ReconcileResult}
   */
  function reconcileSnapshot({ snapshot, deliverySource, startingTurnId = 0 }) {
    const result = {
      accepted: false,
      rejected_reason: null,
      response_correlated: false,
      response_deduplicated: false,
      delivery_source: deliverySource,
      committed_response_key: null,
      feedback_identity: null,
    };

    if (!_activeTurn) {
      result.rejected_reason = 'no_active_turn';
      return result;
    }

    // Reject snapshots shorter than the last committed baseline.
    if (snapshot.length < _lastCommittedSnapshot.length) {
      result.rejected_reason = 'snapshot_shorter_than_baseline';
      return result;
    }

    // Deduplicate the incoming snapshot.
    const { deduplicated } = deduplicateMessagesByLifecycleKeys(snapshot, { startingTurnId });

    // Identify the latest assistant message in the deduplicated snapshot.
    const latestAssistant = _findLatestAssistant(deduplicated);
    if (!latestAssistant) {
      result.rejected_reason = 'no_assistant_message_in_snapshot';
      return result;
    }

    const responseKey = getAssistantIdentityKey(latestAssistant.msg, latestAssistant.index);

    // Already committed this exact response (dedup guard).
    if (_committedResponseKeys.has(responseKey)) {
      result.accepted = true;
      result.response_deduplicated = true;
      result.rejected_reason = null;
      result.committed_response_key = responseKey;
      // Return last committed snapshot without re-committing.
      result._deduplicatedSnapshot = deduplicated;
      return result;
    }

    // Active turn already completed (one response per turn guard).
    if (_activeTurn.status === TURN_STATUS.COMPLETED) {
      result.rejected_reason = 'turn_already_completed';
      return result;
    }

    // No new assistant message compared to the baseline.
    const baselineAssistant = _findLatestAssistant(_lastCommittedSnapshot);
    const baselineKey = baselineAssistant
      ? getAssistantIdentityKey(baselineAssistant.msg, baselineAssistant.index)
      : null;
    if (baselineKey && baselineKey === responseKey) {
      result.rejected_reason = 'no_new_assistant_message';
      return result;
    }

    // Commit the response.
    _committedResponseKeys.add(responseKey);
    const feedbackId = `fb-${_activeTurn.client_request_id}`;
    _feedbackIdentities.set(_activeTurn.client_request_id, feedbackId);

    _activeTurn = {
      ..._activeTurn,
      status: TURN_STATUS.COMPLETED,
      committed_response_key: responseKey,
      feedback_identity: feedbackId,
    };
    _lastCommittedSnapshot = deduplicated;

    result.accepted = true;
    result.response_correlated = true;
    result.committed_response_key = responseKey;
    result.feedback_identity = feedbackId;
    result._deduplicatedSnapshot = deduplicated;

    // Drain queue after completing the turn.
    const nextQueued = _drainQueue();
    // Expose the executeSend function directly as _nextQueuedSend for backward
    // compatibility (callers that do `if (result._nextQueuedSend) await result._nextQueuedSend()`).
    result._nextQueuedSend = nextQueued ? nextQueued.executeSend : null;
    // Also expose the new atomically-created turn record so callers can use it.
    result._nextQueuedTurnRecord = nextQueued ? nextQueued.turn : null;

    return result;
  }

  /**
   * Drains the next queued send.
   *
   * Atomically creates the next active turn record before the caller executes
   * the send so that no send ever runs without an active TurnRecord.
   *
   * Returns null when the queue is empty.
   *
   * @returns {{ turn: TurnRecord, executeSend: Function }|null}
   * @private
   */
  function _drainQueue() {
    if (_queue.length === 0) return null;
    const next = _queue.shift();
    // Atomically create the next active turn before the caller executes the send.
    const turn = createTurnRecord({ conversationId: next.conversationId });
    _activeTurn = turn;
    return { turn: { ...turn }, executeSend: next.executeSend };
  }

  /**
   * Returns the feedback identity for a given client_request_id, or null.
   * @param {string} clientRequestId
   * @returns {string|null}
   */
  function getFeedbackIdentity(clientRequestId) {
    return _feedbackIdentities.get(clientRequestId) ?? null;
  }

  /**
   * Returns a privacy-safe diagnostic snapshot of the coordinator state.
   * No message content, clinical data, or PII is included.
   *
   * @returns {object}
   */
  function getDiagnosticState() {
    return {
      orchestrator_version: 'v2',
      client_request_id: _activeTurn?.client_request_id ?? null,
      generation_id: _activeTurn?.generation_id ?? null,
      turn_status: _activeTurn?.status ?? null,
      pending_turn_count: _queue.length,
      queue_depth: _queue.length,
      max_queue_depth: _MAX_QUEUE_DEPTH,
    };
  }

  /**
   * Resets the coordinator to its initial state.
   * Used when switching conversations.
   */
  function reset() {
    _activeTurn = null;
    _queue.length = 0;
    _committedResponseKeys.clear();
    _feedbackIdentities.clear();
    _lastCommittedSnapshot = [];
  }

  return Object.freeze({
    getActiveTurn,
    getPendingTurnCount,
    registerSend,
    recordUserMessageId,
    markGenerating,
    markTimedOut,
    markFailed,
    reconcileSnapshot,
    getFeedbackIdentity,
    getDiagnosticState,
    reset,
    initBaseline,
  });
}

// ─── Internal helpers ──────────────────────────────────────────────────────────

/**
 * Returns the last assistant message in a messages array with its index.
 * @param {Array<object>} msgs
 * @returns {{ msg: object, index: number }|null}
 * @private
 */
function _findLatestAssistant(msgs) {
  if (!Array.isArray(msgs)) return null;
  for (let i = msgs.length - 1; i >= 0; i--) {
    if (msgs[i]?.role === 'assistant') {
      return { msg: msgs[i], index: i };
    }
  }
  return null;
}

// ─── V2 diagnostics builder ────────────────────────────────────────────────────

/**
 * Builds a privacy-safe V2 lifecycle diagnostic payload for `_s2debug=true`.
 *
 * All fields are IDs, booleans, counts, or enums.
 * No clinical or transcript content is included.
 *
 * @param {object} fields
 * @param {string}  [fields.orchestrator_version]
 * @param {string|null} [fields.client_request_id]
 * @param {string|null} [fields.generation_id]
 * @param {string}  [fields.turn_status]
 * @param {number}  [fields.pending_turn_count]
 * @param {number}  [fields.queue_depth]
 * @param {string}  [fields.delivery_source]
 * @param {boolean} [fields.snapshot_accepted]
 * @param {string}  [fields.snapshot_rejected_reason]
 * @param {boolean} [fields.response_correlated]
 * @param {boolean} [fields.response_deduplicated]
 * @param {boolean} [fields.polling_exhausted]
 * @param {boolean} [fields.late_response_recovered]
 * @param {boolean} [fields.queue_full]
 * @returns {object}
 */
export function buildV2DebugDiagnostic(fields = {}) {
  const payload = {};
  if (typeof fields.orchestrator_version === 'string') payload.orchestrator_version = fields.orchestrator_version;
  if (typeof fields.client_request_id === 'string' || fields.client_request_id === null) {
    payload.client_request_id = fields.client_request_id;
  }
  if (typeof fields.generation_id === 'string' || fields.generation_id === null) {
    payload.generation_id = fields.generation_id;
  }
  if (typeof fields.turn_status === 'string') payload.turn_status = fields.turn_status;
  if (Number.isFinite(fields.pending_turn_count)) payload.pending_turn_count = fields.pending_turn_count;
  if (Number.isFinite(fields.queue_depth)) payload.queue_depth = fields.queue_depth;
  if (typeof fields.delivery_source === 'string') payload.delivery_source = fields.delivery_source;
  if (typeof fields.snapshot_accepted === 'boolean') payload.snapshot_accepted = fields.snapshot_accepted;
  if (typeof fields.snapshot_rejected_reason === 'string') payload.snapshot_rejected_reason = fields.snapshot_rejected_reason;
  if (typeof fields.response_correlated === 'boolean') payload.response_correlated = fields.response_correlated;
  if (typeof fields.response_deduplicated === 'boolean') payload.response_deduplicated = fields.response_deduplicated;
  if (typeof fields.polling_exhausted === 'boolean') payload.polling_exhausted = fields.polling_exhausted;
  if (typeof fields.late_response_recovered === 'boolean') payload.late_response_recovered = fields.late_response_recovered;
  if (typeof fields.queue_full === 'boolean') payload.queue_full = fields.queue_full;
  return payload;
}

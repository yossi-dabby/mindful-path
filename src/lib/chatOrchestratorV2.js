/**
 * @file src/lib/chatOrchestratorV2.js
 *
 * Phase 1 — Canonical Chat Turn Coordinator (V2)
 *
 * Provides a bounded turn lifecycle for Chat.jsx when
 * VITE_CHAT_ORCHESTRATOR_V2_ENABLED=true.  The Phase 0 legacy path in Chat.jsx
 * is unchanged when the flag is off.
 *
 * DESIGN CONSTRAINTS
 * ──────────────────
 * 1. Turn correlation never uses array index or messages.length + 2.
 *    Every turn record carries a stable client_request_id (local, client-side).
 *    Correlation is single-flight snapshot-delta: the coordinator watches for a
 *    new assistant message in the snapshot that was not present at the baseline.
 *    Base44 does NOT expose a proven round-trip metadata field (reply_to_turn_id
 *    or generation_id) that survives addMessage → getConversation. No
 *    end-to-end ID correlation is claimed.
 *
 * 2. Single-flight queue — additional sends are queued until the active turn
 *    reaches an explicit terminal state. The queue stores the complete queued
 *    request (conversationId + executeSend). A new active TurnRecord is created
 *    atomically when a queued request is dequeued. Sends are FIFO.
 *
 * 3. All three delivery paths (polling, subscription, hydration) call the same
 *    reconcileSnapshot() function. The reconciler rejects stale snapshots,
 *    deduplicates polling/subscription copies, and does NOT discard subscription
 *    events during generation (V2 suppression is handled at the coordinator
 *    level, not at the Chat.jsx subscription callback level).
 *
 * 4. Polling timeout leaves the active turn in a recoverable timed_out state.
 *    A timed-out turn is never replaced by a newer active turn — the queue is
 *    NOT drained on timeout. A late subscription or hydration event can still
 *    commit the response for that specific timed-out turn. Only an explicit
 *    abandon/fail transition (markFailed) advances the queue.
 *
 * 5. Exactly one assistant response is committed per turn, and exactly one
 *    feedback identity is produced per committed response.
 *
 * 6. Historical assistant messages that existed before the current send must
 *    never be committed as the response to the new turn. initializeBaseline()
 *    must be called on conversation load/change so the coordinator knows which
 *    assistant messages are historical.
 *
 * 7. Queue depth is bounded to prevent unbounded memory growth.
 *
 * 8. No clinical or transcript content is emitted in diagnostics — IDs,
 *    booleans, counts and enums only.
 *
 * TURN STATUS LIFECYCLE
 * ─────────────────────
 *   pending → sent → generating → completed
 *                              ↘ timed_out (recoverable; late response can still commit)
 *                              ↘ failed
 *   timed_out → completed  (via late reconcileSnapshot)
 *   timed_out → failed     (via markFailed — advances queue)
 *
 * Legal transitions:
 *   pending  → sent | generating | failed
 *   sent     → generating | completed | timed_out | failed
 *   generating → completed | timed_out | failed
 *   timed_out → completed | failed
 *   completed, failed → (terminal; no further transitions)
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

// ─── Constants ─────────────────────────────────────────────────────────────────

/**
 * Maximum number of queued sends. Additional sends beyond this limit are
 * rejected (callers should surface a user-facing error or wait).
 */
export const QUEUE_MAX_DEPTH = 10;

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
  TURN_STATUS.FAILED,
]);

// Legal forward transitions map.
// timed_out is recoverable: it can advance to completed (via late response)
// or to failed (via explicit abandon). It does NOT drain the queue on its own.
const LEGAL_TRANSITIONS = Object.freeze({
  [TURN_STATUS.PENDING]:    new Set([TURN_STATUS.SENT, TURN_STATUS.GENERATING, TURN_STATUS.FAILED]),
  [TURN_STATUS.SENT]:       new Set([TURN_STATUS.GENERATING, TURN_STATUS.COMPLETED, TURN_STATUS.TIMED_OUT, TURN_STATUS.FAILED]),
  [TURN_STATUS.GENERATING]: new Set([TURN_STATUS.COMPLETED, TURN_STATUS.TIMED_OUT, TURN_STATUS.FAILED]),
  [TURN_STATUS.TIMED_OUT]:  new Set([TURN_STATUS.COMPLETED, TURN_STATUS.FAILED]),
  [TURN_STATUS.COMPLETED]:  new Set(),
  [TURN_STATUS.FAILED]:     new Set(),
});

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
 * @param {string} [params.userMessageId]   - Base44 message id if available after addMessage
 * @param {string} [params.generationId]    - reserved for future proven round-trip use
 * @returns {object} TurnRecord
 */
export function createTurnRecord({ conversationId, userMessageId, generationId } = {}) {
  return {
    conversation_id: conversationId ?? null,
    client_request_id: generateClientRequestId(),
    user_message_id: userMessageId ?? null,
    generation_id: generationId ?? null,   // reserved; not yet proven to round-trip
    status: TURN_STATUS.PENDING,
    created_at: new Date().toISOString(),
    committed_response_key: null,          // identity key of the committed assistant response
    feedback_identity: null,               // exactly one per committed response
  };
}

// ─── Turn state machine ────────────────────────────────────────────────────────

/**
 * Advance a turn record to a new status.
 * Only legal transitions (per LEGAL_TRANSITIONS) are applied.
 * Invalid transitions return the original record unchanged (no mutation).
 *
 * @param {object} turn
 * @param {string} newStatus  - A TURN_STATUS value
 * @returns {object}          - A new object (never mutates in place)
 */
export function advanceTurnStatus(turn, newStatus) {
  if (!turn) return turn;
  if (TERMINAL_STATUSES.has(turn.status)) return turn;
  const allowed = LEGAL_TRANSITIONS[turn.status];
  if (!allowed || !allowed.has(newStatus)) return turn;
  return { ...turn, status: newStatus };
}

// ─── Coordinator factory ───────────────────────────────────────────────────────

/**
 * Creates a V2 turn coordinator instance.
 *
 * The coordinator owns:
 *   - the active turn record (at most one in-flight turn at a time)
 *   - the FIFO bounded queue of pending sends
 *   - the historical assistant baseline (prevents stale historical messages
 *     from being committed as the response to a new turn)
 *   - snapshot reconciliation for polling, subscription, and hydration
 *
 * @returns {object} ChatOrchestratorV2
 */
export function createChatOrchestratorV2() {
  /** @type {object|null} */
  let _activeTurn = null;

  /**
   * Queue entries have shape: { conversationId: string, executeSend: Function }
   * The complete request is stored so the TurnRecord can be created atomically
   * on dequeue, not speculatively at queue time.
   * @type {Array<{conversationId: string, executeSend: Function}>}
   */
  const _queue = [];

  /** @type {Set<string>} committed response keys across all turns (one-response-per-turn guard) */
  const _committedResponseKeys = new Set();

  /** @type {Map<string, string>} client_request_id → feedback_identity */
  const _feedbackIdentities = new Map();

  /**
   * The baseline snapshot set at conversation load/change via initializeBaseline().
   * Historical assistant messages whose identity keys are present here will be
   * rejected as responses to new turns.
   * @type {Set<string>}
   */
  let _baselineAssistantKeys = new Set();

  /** @type {Array<object>} last committed visible messages snapshot */
  let _lastCommittedSnapshot = [];

  // ── Public API ────────────────────────────────────────────────────────────

  /**
   * Initialises the historical baseline from an existing conversation snapshot.
   *
   * Must be called when a conversation is loaded or changed. Any assistant
   * message whose identity key is in this baseline can never be committed as
   * the response to a new turn in this conversation.
   *
   * @param {Array<object>} messages - Current visible messages array
   */
  function initializeBaseline(messages) {
    _baselineAssistantKeys = new Set();
    _lastCommittedSnapshot = Array.isArray(messages) ? [...messages] : [];
    if (!Array.isArray(messages)) return;
    messages.forEach((msg, index) => {
      if (msg?.role === 'assistant') {
        const key = getAssistantIdentityKey(msg, index);
        if (key) _baselineAssistantKeys.add(key);
      }
    });
  }

  /**
   * Returns a copy of the active turn record (or null).
   * @returns {object|null}
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
   * If no turn is currently active (or the active turn is terminal), creates a
   * TurnRecord immediately and returns it.
   *
   * If a turn is active (single-flight), the complete send request is queued
   * (up to QUEUE_MAX_DEPTH) and { turn: null, queued: true } is returned.
   * The caller must NOT send the message — it will be sent when the active turn
   * drains to a terminal state.
   *
   * The TurnRecord for a queued send is created atomically when it is dequeued,
   * not at queue time.
   *
   * @param {object} params
   * @param {string}   params.conversationId
   * @param {Function} params.executeSend  - async () => void called when the turn is dequeued
   * @returns {{ turn: object|null, queued: boolean, queue_full?: boolean }}
   */
  function registerSend({ conversationId, executeSend }) {
    if (_activeTurn && !TERMINAL_STATUSES.has(_activeTurn.status)) {
      // Active turn in progress — queue the complete request.
      if (_queue.length >= QUEUE_MAX_DEPTH) {
        return { turn: null, queued: false, queue_full: true };
      }
      _queue.push({ conversationId, executeSend });
      return { turn: null, queued: true };
    }

    // No active (non-terminal) turn — create one now.
    const turn = createTurnRecord({ conversationId });
    _activeTurn = turn;
    return { turn: { ...turn }, queued: false };
  }

  /**
   * Updates the active turn's userMessageId and advances to SENT after the
   * Base44 addMessage call resolves (if the SDK returns a message id).
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
   * Advances the active turn to GENERATING.
   * @param {string} clientRequestId
   */
  function markGenerating(clientRequestId) {
    if (_activeTurn && _activeTurn.client_request_id === clientRequestId) {
      _activeTurn = advanceTurnStatus(_activeTurn, TURN_STATUS.GENERATING);
    }
  }

  /**
   * Marks the active turn as timed_out (recoverable).
   *
   * The turn remains the active turn so late responses can still be reconciled.
   * The queue is NOT drained — no new turn is started until markFailed() is
   * called or a late response successfully commits via reconcileSnapshot().
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
   * Abandons the active turn (failed) and drains the next queued send if any.
   *
   * Must be called when the caller decides the turn is irrecoverable (e.g.
   * after timeout recovery has itself timed out, or on a hard error).
   * This is the explicit transition that advances the queue.
   *
   * @param {string} clientRequestId
   * @returns {{ nextSend: Function|null, nextTurn: object|null }}
   */
  function markFailed(clientRequestId) {
    if (_activeTurn && _activeTurn.client_request_id === clientRequestId) {
      _activeTurn = advanceTurnStatus(_activeTurn, TURN_STATUS.FAILED);
    }
    return _drainQueue();
  }

  /**
   * Canonical snapshot reconciler.
   *
   * Called by polling, subscription, and hydration with a new messages snapshot.
   * Routing all delivery paths through this function ensures:
   *   - No subscription event is suppressed during loading
   *   - No duplicate response is committed
   *   - No historical assistant message is committed as a new response
   *   - No response is committed to the wrong turn
   *
   * Rejection criteria:
   *   - No active turn
   *   - Snapshot is shorter than the last committed snapshot (stale)
   *   - No assistant message in snapshot
   *   - Response key matches a historical baseline message (not a new response)
   *   - Response key already committed (dedup guard)
   *   - Active turn already completed (one response per turn guard)
   *   - No new assistant message compared to baseline (already seen)
   *
   * On acceptance:
   *   - Commits the response key and feedback identity
   *   - Advances active turn to COMPLETED
   *   - Drains the next queued send atomically (creates a new TurnRecord)
   *
   * @param {object} params
   * @param {Array<object>} params.snapshot        - Visible messages array
   * @param {string}        params.deliverySource  - 'polling' | 'subscription' | 'hydration'
   * @param {number}        [params.startingTurnId]
   * @returns {object} ReconcileResult
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
      _deduplicatedSnapshot: null,
      _nextQueuedSend: null,
      _nextTurn: null,
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

    // Reject responses that are historical (were present at baseline).
    if (_baselineAssistantKeys.has(responseKey)) {
      result.rejected_reason = 'historical_assistant_message';
      return result;
    }

    // Already committed this exact response (dedup guard for polling + subscription).
    if (_committedResponseKeys.has(responseKey)) {
      result.accepted = true;
      result.response_deduplicated = true;
      result.committed_response_key = responseKey;
      result._deduplicatedSnapshot = deduplicated;
      return result;
    }

    // Active turn already completed (one response per turn guard).
    if (_activeTurn.status === TURN_STATUS.COMPLETED) {
      result.rejected_reason = 'turn_already_completed';
      return result;
    }

    // No new assistant message compared to the baseline assistant keys.
    // This catches the case where a snapshot arrives with the same set of
    // assistant messages that were present before this send cycle.
    const baselineAssistant = _findLatestAssistant(_lastCommittedSnapshot);
    const baselineKey = baselineAssistant
      ? getAssistantIdentityKey(baselineAssistant.msg, baselineAssistant.index)
      : null;
    if (baselineKey && baselineKey === responseKey) {
      result.rejected_reason = 'no_new_assistant_message';
      return result;
    }

    // ── Commit the response ───────────────────────────────────────────────────
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

    // Drain queue after completing the turn — create the next TurnRecord atomically.
    const drained = _drainQueue();
    result._nextQueuedSend = drained.nextSend;
    result._nextTurn = drained.nextTurn;

    return result;
  }

  /**
   * Drains the next queued send.
   * Creates a new TurnRecord atomically so there is always an active turn
   * before executeSend is invoked.
   *
   * @returns {{ nextSend: Function|null, nextTurn: object|null }}
   * @private
   */
  function _drainQueue() {
    if (_queue.length === 0) return { nextSend: null, nextTurn: null };
    const next = _queue.shift();
    const turn = createTurnRecord({ conversationId: next.conversationId });
    _activeTurn = turn;
    return { nextSend: next.executeSend, nextTurn: { ...turn } };
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
      baseline_assistant_key_count: _baselineAssistantKeys.size,
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
    _baselineAssistantKeys = new Set();
    _lastCommittedSnapshot = [];
  }

  return Object.freeze({
    initializeBaseline,
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
 * Correlation method: local client_request_id (client-side only) plus
 * single-flight snapshot-delta correlation. Base44 does not expose a proven
 * round-trip generation_id / reply_to_turn_id field; no end-to-end ID
 * correlation is claimed.
 *
 * @param {object} fields
 * @param {string}  [fields.orchestrator_version]
 * @param {string|null} [fields.client_request_id]
 * @param {string|null} [fields.generation_id]
 * @param {string}  [fields.turn_status]
 * @param {number}  [fields.pending_turn_count]
 * @param {string}  [fields.delivery_source]
 * @param {boolean} [fields.snapshot_accepted]
 * @param {string}  [fields.snapshot_rejected_reason]
 * @param {boolean} [fields.response_correlated]
 * @param {boolean} [fields.response_deduplicated]
 * @param {boolean} [fields.polling_exhausted]
 * @param {boolean} [fields.late_response_recovered]
 * @param {boolean} [fields.historical_response_blocked]
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
  if (typeof fields.delivery_source === 'string') payload.delivery_source = fields.delivery_source;
  if (typeof fields.snapshot_accepted === 'boolean') payload.snapshot_accepted = fields.snapshot_accepted;
  if (typeof fields.snapshot_rejected_reason === 'string') payload.snapshot_rejected_reason = fields.snapshot_rejected_reason;
  if (typeof fields.response_correlated === 'boolean') payload.response_correlated = fields.response_correlated;
  if (typeof fields.response_deduplicated === 'boolean') payload.response_deduplicated = fields.response_deduplicated;
  if (typeof fields.polling_exhausted === 'boolean') payload.polling_exhausted = fields.polling_exhausted;
  if (typeof fields.late_response_recovered === 'boolean') payload.late_response_recovered = fields.late_response_recovered;
  if (typeof fields.historical_response_blocked === 'boolean') payload.historical_response_blocked = fields.historical_response_blocked;
  return payload;
}

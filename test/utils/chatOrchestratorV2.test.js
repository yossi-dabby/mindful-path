/**
 * @file test/utils/chatOrchestratorV2.test.js
 *
 * Phase 1 — Integration-style tests for the canonical V2 turn coordinator.
 *
 * Tests use the actual exported coordinator (no implementation duplication).
 * All test data is synthetic — no real user content, PII, or clinical material.
 *
 * Coverage matrix:
 *   1.  Normal one-turn flow — pending → sent → generating → completed
 *   2.  Two rapid user sends — second queued, drained after first completes
 *   3.  Subscription response while loading (reconcile during generating state)
 *   4.  Polling and subscription deliver duplicate — dedup guard
 *   5.  Hydration snapshot during generation
 *   6.  Stale snapshot rejected (shorter than baseline)
 *   7.  Polling timeout + late subscription recovery (timed_out → completed)
 *   8.  One user turn → exactly one assistant response committed
 *   9.  One assistant response → exactly one feedback identity
 *  10.  Flag off → exact Phase 0 legacy behavior (shouldSuppressSubscriptionEventWhileLoading)
 *  11.  Existing conversation baseline — historical assistant message never committed
 *  12.  Timeout + another queued message — queue not drained on timeout
 *  13.  Stale historical assistant response blocked (initializeBaseline)
 *  14.  Queue bounded — queue_full returned when QUEUE_MAX_DEPTH exceeded
 *  15.  FIFO queue order preserved
 *  16.  Explicit abandon (markFailed) advances queue; queue not advanced on timeout alone
 *  17.  Legal state transitions only — invalid transitions silently ignored
 */

import { describe, it, expect, vi } from 'vitest';
import {
  createChatOrchestratorV2,
  createTurnRecord,
  generateClientRequestId,
  advanceTurnStatus,
  buildV2DebugDiagnostic,
  TURN_STATUS,
  QUEUE_MAX_DEPTH,
} from '../../src/lib/chatOrchestratorV2.js';
import { shouldSuppressSubscriptionEventWhileLoading } from '../../src/lib/chatRuntimeLifecycle.js';
import { isChatOrchestratorV2Enabled } from '../../src/lib/featureFlags.js';

// ─── Fixtures ──────────────────────────────────────────────────────────────────

const CONV_ID = 'conv-test-001';

function makeUserMsg(id = 'u1') {
  return { role: 'user', id, content: '[test user message]' };
}

function makeAssistantMsg(id = 'a1', createdAt = '2026-08-03T00:00:00.000Z') {
  return { role: 'assistant', id, created_at: createdAt, content: '[test assistant response]' };
}

function makeSnapshot(userMsgs, assistantMsgs) {
  return [...userMsgs, ...assistantMsgs];
}

// ─── 1. Normal one-turn flow ──────────────────────────────────────────────────

describe('Phase 1 V2 turn coordinator — normal one-turn flow', () => {
  it('advances through pending → sent → generating → completed', () => {
    const coord = createChatOrchestratorV2();

    // Register send — creates active turn in pending state.
    const { turn, queued } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    expect(queued).toBe(false);
    expect(turn).not.toBeNull();
    expect(turn.status).toBe(TURN_STATUS.PENDING);
    expect(typeof turn.client_request_id).toBe('string');
    expect(turn.client_request_id).toMatch(/^crid-/);

    // Record user message id after SDK call.
    coord.recordUserMessageId(turn.client_request_id, 'msg-123');
    expect(coord.getActiveTurn().status).toBe(TURN_STATUS.SENT);
    expect(coord.getActiveTurn().user_message_id).toBe('msg-123');

    // Mark generating on first poll.
    coord.markGenerating(turn.client_request_id);
    expect(coord.getActiveTurn().status).toBe(TURN_STATUS.GENERATING);

    // Reconcile a snapshot containing an assistant response.
    const snapshot = makeSnapshot([makeUserMsg('u1')], [makeAssistantMsg('a1')]);
    const result = coord.reconcileSnapshot({ snapshot, deliverySource: 'polling' });
    expect(result.accepted).toBe(true);
    expect(result.response_correlated).toBe(true);
    expect(typeof result.committed_response_key).toBe('string');
    expect(typeof result.feedback_identity).toBe('string');
    expect(coord.getActiveTurn().status).toBe(TURN_STATUS.COMPLETED);
  });
});

// ─── 2. Two rapid user sends (queue) ─────────────────────────────────────────

describe('Phase 1 V2 turn coordinator — two rapid user sends', () => {
  it('queues second send when first is active; drains queue after first completes', async () => {
    const coord = createChatOrchestratorV2();
    const executed = [];
    const executeSend2 = vi.fn(async () => { executed.push('send2'); });

    // First send — active.
    const { turn: turn1, queued: q1 } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => { executed.push('send1'); },
    });
    expect(q1).toBe(false);
    expect(coord.getPendingTurnCount()).toBe(0);

    // Second send — should be queued.
    const { turn: turn2, queued: q2 } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: executeSend2,
    });
    expect(q2).toBe(true);
    expect(turn2).toBeNull();
    expect(coord.getPendingTurnCount()).toBe(1);

    // First turn completes — reconcile commits the response.
    coord.markGenerating(turn1.client_request_id);
    const snapshot = makeSnapshot([makeUserMsg('u1')], [makeAssistantMsg('a1')]);
    const result = coord.reconcileSnapshot({ snapshot, deliverySource: 'polling' });
    expect(result.accepted).toBe(true);

    // reconcileSnapshot returns the drainQueue result as _nextQueuedSend.
    expect(typeof result._nextQueuedSend).toBe('function');
    // A new TurnRecord was created atomically for the next send.
    expect(result._nextTurn).not.toBeNull();
    expect(result._nextTurn.status).toBe(TURN_STATUS.PENDING);
    expect(coord.getPendingTurnCount()).toBe(0);

    // Caller drains the queue.
    await result._nextQueuedSend();
    expect(executeSend2).toHaveBeenCalledOnce();
    expect(executed).toContain('send2');
  });

  it('stores complete request (conversationId + executeSend) in the queue', () => {
    const coord = createChatOrchestratorV2();
    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => {} });

    const secondConvId = 'conv-2';
    const { queued } = coord.registerSend({
      conversationId: secondConvId,
      executeSend: async () => {},
    });
    expect(queued).toBe(true);

    // Complete the first turn — next turn should use secondConvId.
    coord.markGenerating(coord.getActiveTurn().client_request_id);
    const result = coord.reconcileSnapshot({
      snapshot: makeSnapshot([makeUserMsg()], [makeAssistantMsg()]),
      deliverySource: 'polling',
    });
    expect(result._nextTurn?.conversation_id).toBe(secondConvId);
  });
});

// ─── 3. Subscription while loading (generating) ───────────────────────────────

describe('Phase 1 V2 turn coordinator — subscription while loading (generating)', () => {
  it('accepts a subscription snapshot while the turn is in generating state', () => {
    const coord = createChatOrchestratorV2();
    const { turn } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn.client_request_id);

    const snapshot = makeSnapshot([makeUserMsg('u1')], [makeAssistantMsg('a1')]);
    const result = coord.reconcileSnapshot({ snapshot, deliverySource: 'subscription' });
    expect(result.accepted).toBe(true);
    expect(result.response_correlated).toBe(true);
    expect(result.delivery_source).toBe('subscription');
  });
});

// ─── 4. Polling and subscription duplicate ────────────────────────────────────

describe('Phase 1 V2 turn coordinator — polling and subscription duplicate', () => {
  it('deduplicates the same assistant response from polling and subscription', () => {
    const coord = createChatOrchestratorV2();
    const { turn } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn.client_request_id);

    const snapshot = makeSnapshot([makeUserMsg('u1')], [makeAssistantMsg('a1')]);

    // First delivery — polling commits the response.
    const r1 = coord.reconcileSnapshot({ snapshot, deliverySource: 'polling' });
    expect(r1.accepted).toBe(true);
    expect(r1.response_correlated).toBe(true);

    // Second delivery — subscription delivers the same response.
    const r2 = coord.reconcileSnapshot({ snapshot, deliverySource: 'subscription' });
    expect(r2.accepted).toBe(true);
    expect(r2.response_deduplicated).toBe(true);
    expect(r2.response_correlated).toBe(false);
    expect(r2.committed_response_key).toBe(r1.committed_response_key);
  });
});

// ─── 5. Hydration during generation ──────────────────────────────────────────

describe('Phase 1 V2 turn coordinator — hydration during generation', () => {
  it('accepts a hydration snapshot while generating and commits the response', () => {
    const coord = createChatOrchestratorV2();
    const { turn } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn.client_request_id);

    const snapshot = makeSnapshot(
      [makeUserMsg('u1')],
      [makeAssistantMsg('a-hydrate', '2026-08-03T01:00:00.000Z')],
    );
    const result = coord.reconcileSnapshot({ snapshot, deliverySource: 'hydration' });
    expect(result.accepted).toBe(true);
    expect(result.delivery_source).toBe('hydration');
    expect(result.response_correlated).toBe(true);
    expect(coord.getActiveTurn().status).toBe(TURN_STATUS.COMPLETED);
  });
});

// ─── 6. Stale snapshot rejection ─────────────────────────────────────────────

describe('Phase 1 V2 turn coordinator — stale snapshot rejected', () => {
  it('rejects a shorter snapshot as stale after a newer turn has committed a longer snapshot', () => {
    const coord = createChatOrchestratorV2();
    const { turn: turn1 } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn1.client_request_id);

    // First turn commits 2 messages.
    const snapshot1 = makeSnapshot([makeUserMsg('u1')], [makeAssistantMsg('a1')]);
    coord.reconcileSnapshot({ snapshot: snapshot1, deliverySource: 'polling' });

    // Register second turn.
    const { turn: turn2 } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn2.client_request_id);

    // Now deliver a snapshot shorter than the baseline — should be rejected.
    const staleSnapshot = [makeUserMsg('u1')]; // only 1 message
    const result = coord.reconcileSnapshot({ snapshot: staleSnapshot, deliverySource: 'polling' });
    expect(result.accepted).toBe(false);
    expect(result.rejected_reason).toBe('snapshot_shorter_than_baseline');
  });
});

// ─── 7. Polling timeout + late subscription recovery ─────────────────────────

describe('Phase 1 V2 turn coordinator — polling timeout + late subscription recovery', () => {
  it('timeout leaves turn in timed_out (recoverable) state; late subscription commits response', () => {
    const coord = createChatOrchestratorV2();
    const { turn } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn.client_request_id);

    // Polling exhausted — mark timed out.
    const diag = coord.markTimedOut(turn.client_request_id);
    expect(diag.polling_exhausted).toBe(true);
    expect(coord.getActiveTurn().status).toBe(TURN_STATUS.TIMED_OUT);

    // Late subscription arrives — reconcile should still commit the response.
    const snapshot = makeSnapshot([makeUserMsg('u1')], [makeAssistantMsg('a-late')]);
    const result = coord.reconcileSnapshot({ snapshot, deliverySource: 'subscription' });
    expect(result.accepted).toBe(true);
    expect(result.response_correlated).toBe(true);
    expect(coord.getActiveTurn().status).toBe(TURN_STATUS.COMPLETED);
  });

  it('timed-out turn is NOT replaced by a newer active turn until markFailed is called', () => {
    const coord = createChatOrchestratorV2();
    const { turn: turn1 } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn1.client_request_id);
    coord.markTimedOut(turn1.client_request_id);

    // While timed_out, new send must be queued (not create a new active turn).
    const { queued } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    expect(queued).toBe(true);
    // Active turn is still the timed-out one.
    expect(coord.getActiveTurn().client_request_id).toBe(turn1.client_request_id);
    expect(coord.getActiveTurn().status).toBe(TURN_STATUS.TIMED_OUT);
  });
});

// ─── 8. One turn → exactly one response ──────────────────────────────────────

describe('Phase 1 V2 turn coordinator — one turn → exactly one response', () => {
  it('commits at most one assistant response per turn', () => {
    const coord = createChatOrchestratorV2();
    const { turn } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn.client_request_id);

    const snapshot = makeSnapshot([makeUserMsg('u1')], [makeAssistantMsg('a1')]);

    // First reconcile commits.
    const r1 = coord.reconcileSnapshot({ snapshot, deliverySource: 'polling' });
    expect(r1.response_correlated).toBe(true);

    // Second reconcile with a different assistant message — rejected (turn_already_completed).
    const snapshot2 = makeSnapshot(
      [makeUserMsg('u1')],
      [makeAssistantMsg('a1'), makeAssistantMsg('a2', '2026-08-03T02:00:00.000Z')],
    );
    const r2 = coord.reconcileSnapshot({ snapshot: snapshot2, deliverySource: 'polling' });
    expect(r2.accepted).toBe(false);
    expect(r2.rejected_reason).toBe('turn_already_completed');
    expect(r2.response_correlated).toBe(false);
  });
});

// ─── 9. One response → exactly one feedback identity ─────────────────────────

describe('Phase 1 V2 turn coordinator — one response → exactly one feedback identity', () => {
  it('produces exactly one feedback identity per committed assistant response', () => {
    const coord = createChatOrchestratorV2();
    const { turn } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn.client_request_id);

    const snapshot = makeSnapshot([makeUserMsg('u1')], [makeAssistantMsg('a1')]);
    const r1 = coord.reconcileSnapshot({ snapshot, deliverySource: 'polling' });
    const feedbackId1 = coord.getFeedbackIdentity(turn.client_request_id);
    expect(typeof feedbackId1).toBe('string');
    expect(feedbackId1).toBe(r1.feedback_identity);

    // Duplicate delivery must not create a second feedback identity.
    const r2 = coord.reconcileSnapshot({ snapshot, deliverySource: 'subscription' });
    expect(r2.response_deduplicated).toBe(true);
    const feedbackId2 = coord.getFeedbackIdentity(turn.client_request_id);
    expect(feedbackId2).toBe(feedbackId1);
  });
});

// ─── 10. Flag off → Phase 0 legacy behavior ───────────────────────────────────

describe('Phase 1 V2 turn coordinator — flag off → Phase 0 legacy behavior', () => {
  it('VITE_CHAT_ORCHESTRATOR_V2_ENABLED defaults to false; Phase 0 suppression behavior unchanged', () => {
    // Flag must be false (default) in test environment.
    const v2Enabled = isChatOrchestratorV2Enabled();
    expect(v2Enabled).toBe(false);

    // Phase 0 subscription suppression behavior is unchanged.
    expect(shouldSuppressSubscriptionEventWhileLoading(true)).toBe(true);
    expect(shouldSuppressSubscriptionEventWhileLoading(false)).toBe(false);
  });
});

// ─── 11. Existing conversation baseline (initializeBaseline) ─────────────────

describe('Phase 1 V2 turn coordinator — existing conversation baseline', () => {
  it('historical assistant messages from initializeBaseline are never committed as new responses', () => {
    const coord = createChatOrchestratorV2();

    // Existing conversation has one assistant message.
    const historicalMessages = [
      makeUserMsg('u-hist'),
      makeAssistantMsg('a-hist', '2026-07-01T00:00:00.000Z'),
    ];
    coord.initializeBaseline(historicalMessages);

    // New send starts.
    const { turn } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn.client_request_id);

    // Subscription delivers a snapshot containing only the historical assistant message.
    // This must be rejected as a historical response.
    const result = coord.reconcileSnapshot({
      snapshot: historicalMessages,
      deliverySource: 'subscription',
    });
    expect(result.accepted).toBe(false);
    expect(result.rejected_reason).toBe('historical_assistant_message');
  });

  it('new assistant message after baseline is accepted', () => {
    const coord = createChatOrchestratorV2();
    const historicalMessages = [
      makeUserMsg('u-hist'),
      makeAssistantMsg('a-hist', '2026-07-01T00:00:00.000Z'),
    ];
    coord.initializeBaseline(historicalMessages);

    const { turn } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn.client_request_id);

    // Snapshot includes both the historical message and a new one.
    const snapshot = [
      makeUserMsg('u-hist'),
      makeAssistantMsg('a-hist', '2026-07-01T00:00:00.000Z'),
      makeUserMsg('u-new'),
      makeAssistantMsg('a-new', '2026-08-03T10:00:00.000Z'),
    ];
    const result = coord.reconcileSnapshot({ snapshot, deliverySource: 'subscription' });
    expect(result.accepted).toBe(true);
    expect(result.response_correlated).toBe(true);
  });
});

// ─── 12. Timeout + queued message — queue NOT drained on timeout ──────────────

describe('Phase 1 V2 turn coordinator — timeout followed by another queued message', () => {
  it('queue is NOT drained when a turn times out; markFailed is required', async () => {
    const coord = createChatOrchestratorV2();
    const executeSend2 = vi.fn(async () => {});

    const { turn: turn1 } = coord.registerSend({
      conversationId: CONV_ID,
      executeSend: async () => {},
    });
    coord.markGenerating(turn1.client_request_id);

    // Queue a second send.
    coord.registerSend({ conversationId: CONV_ID, executeSend: executeSend2 });
    expect(coord.getPendingTurnCount()).toBe(1);

    // Timeout — queue must NOT be drained.
    coord.markTimedOut(turn1.client_request_id);
    expect(coord.getPendingTurnCount()).toBe(1);
    expect(executeSend2).not.toHaveBeenCalled();

    // Explicit abandon — queue IS drained.
    const { nextSend } = coord.markFailed(turn1.client_request_id);
    expect(typeof nextSend).toBe('function');
    expect(coord.getPendingTurnCount()).toBe(0);
    await nextSend();
    expect(executeSend2).toHaveBeenCalledOnce();
  });
});

// ─── 13. Stale historical assistant response blocked ─────────────────────────

describe('Phase 1 V2 turn coordinator — stale historical assistant response', () => {
  it('baseline initialized on reset blocks stale replay from empty snapshot', () => {
    const coord = createChatOrchestratorV2();

    // Simulate a conversation load: two messages, the assistant message is historical.
    coord.initializeBaseline([
      makeUserMsg('u1'),
      makeAssistantMsg('a1', '2026-08-03T00:00:00.000Z'),
    ]);

    // New send.
    const { turn } = coord.registerSend({ conversationId: CONV_ID, executeSend: async () => {} });
    coord.markGenerating(turn.client_request_id);

    // Stale replay delivers only the historical snapshot (no new response).
    const result = coord.reconcileSnapshot({
      snapshot: [makeUserMsg('u1'), makeAssistantMsg('a1', '2026-08-03T00:00:00.000Z')],
      deliverySource: 'hydration',
    });
    // The historical_assistant_message guard fires before no_new_assistant_message.
    expect(result.accepted).toBe(false);
    expect(result.rejected_reason).toBe('historical_assistant_message');
  });
});

// ─── 14. Queue bounded ────────────────────────────────────────────────────────

describe('Phase 1 V2 turn coordinator — bounded queue', () => {
  it(`returns queue_full when more than ${QUEUE_MAX_DEPTH} sends are queued`, () => {
    const coord = createChatOrchestratorV2();
    // Activate first turn.
    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => {} });

    // Fill the queue.
    for (let i = 0; i < QUEUE_MAX_DEPTH; i++) {
      const result = coord.registerSend({ conversationId: CONV_ID, executeSend: async () => {} });
      expect(result.queued).toBe(true);
    }

    // Next send must be rejected.
    const overflow = coord.registerSend({ conversationId: CONV_ID, executeSend: async () => {} });
    expect(overflow.queue_full).toBe(true);
    expect(overflow.queued).toBe(false);
    expect(overflow.turn).toBeNull();
    expect(coord.getPendingTurnCount()).toBe(QUEUE_MAX_DEPTH);
  });
});

// ─── 15. FIFO queue order ─────────────────────────────────────────────────────

describe('Phase 1 V2 turn coordinator — FIFO queue order', () => {
  it('drains queued sends in FIFO order', async () => {
    const coord = createChatOrchestratorV2();
    const order = [];

    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => order.push('first') });
    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => order.push('second') });
    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => order.push('third') });

    expect(coord.getPendingTurnCount()).toBe(2);

    // Complete first turn — drains 'second'.
    coord.markGenerating(coord.getActiveTurn().client_request_id);
    const r1 = coord.reconcileSnapshot({
      snapshot: makeSnapshot([makeUserMsg('u1')], [makeAssistantMsg('a1')]),
      deliverySource: 'polling',
    });
    await r1._nextQueuedSend();

    // Complete second turn — drains 'third'.
    coord.markGenerating(coord.getActiveTurn().client_request_id);
    const r2 = coord.reconcileSnapshot({
      snapshot: makeSnapshot([makeUserMsg('u2')], [makeAssistantMsg('a2', '2026-08-03T01:00:00.000Z')]),
      deliverySource: 'polling',
    });
    await r2._nextQueuedSend();

    expect(order).toEqual(['second', 'third']);
  });
});

// ─── 16. markFailed advances queue; timeout alone does not ───────────────────

describe('Phase 1 V2 turn coordinator — explicit abandon/fail before advancing queue', () => {
  it('markFailed advances queue; markTimedOut does not', async () => {
    const coord = createChatOrchestratorV2();
    const executed = [];
    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => {} });
    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => executed.push('queued') });

    // Timeout — queue stays.
    coord.markGenerating(coord.getActiveTurn().client_request_id);
    coord.markTimedOut(coord.getActiveTurn().client_request_id);
    expect(coord.getPendingTurnCount()).toBe(1);
    expect(executed).toHaveLength(0);

    // Explicit abandon — queue is drained.
    const { nextSend } = coord.markFailed(coord.getActiveTurn().client_request_id);
    expect(typeof nextSend).toBe('function');
    await nextSend();
    expect(executed).toContain('queued');
  });
});

// ─── 17. Legal state transitions only ────────────────────────────────────────

describe('Phase 1 V2 turn coordinator — legal state transitions only', () => {
  it('pending → sent → generating → completed is fully legal', () => {
    const r0 = createTurnRecord({ conversationId: CONV_ID });
    const r1 = advanceTurnStatus(r0, TURN_STATUS.SENT);
    const r2 = advanceTurnStatus(r1, TURN_STATUS.GENERATING);
    const r3 = advanceTurnStatus(r2, TURN_STATUS.COMPLETED);
    expect(r3.status).toBe(TURN_STATUS.COMPLETED);
  });

  it('generating → timed_out → completed is legal', () => {
    const r0 = { ...createTurnRecord({ conversationId: CONV_ID }), status: TURN_STATUS.GENERATING };
    const r1 = advanceTurnStatus(r0, TURN_STATUS.TIMED_OUT);
    const r2 = advanceTurnStatus(r1, TURN_STATUS.COMPLETED);
    expect(r2.status).toBe(TURN_STATUS.COMPLETED);
  });

  it('completed → anything is silently ignored (terminal)', () => {
    const completed = { ...createTurnRecord({ conversationId: CONV_ID }), status: TURN_STATUS.COMPLETED };
    const result = advanceTurnStatus(completed, TURN_STATUS.PENDING);
    expect(result.status).toBe(TURN_STATUS.COMPLETED);
  });

  it('pending → completed directly is illegal and silently ignored', () => {
    const r0 = createTurnRecord({ conversationId: CONV_ID });
    const result = advanceTurnStatus(r0, TURN_STATUS.COMPLETED);
    expect(result.status).toBe(TURN_STATUS.PENDING);
  });

  it('timed_out → pending is illegal and silently ignored', () => {
    const r0 = { ...createTurnRecord({ conversationId: CONV_ID }), status: TURN_STATUS.TIMED_OUT };
    const result = advanceTurnStatus(r0, TURN_STATUS.PENDING);
    expect(result.status).toBe(TURN_STATUS.TIMED_OUT);
  });

  it('advanceTurnStatus is a pure function; does not mutate the original', () => {
    const orig = createTurnRecord({ conversationId: CONV_ID });
    const advanced = advanceTurnStatus(orig, TURN_STATUS.SENT);
    expect(advanced.status).toBe(TURN_STATUS.SENT);
    expect(orig.status).toBe(TURN_STATUS.PENDING);
    expect(advanced).not.toBe(orig);
  });
});

// ─── Unit: primitives and helpers ────────────────────────────────────────────

describe('Phase 1 V2 helpers', () => {
  it('generateClientRequestId returns a crid-prefixed string', () => {
    const id = generateClientRequestId();
    expect(id).toMatch(/^crid-[a-z0-9]+-[a-z0-9]+$/);
  });

  it('generateClientRequestId produces unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateClientRequestId()));
    expect(ids.size).toBe(100);
  });

  it('createTurnRecord produces a pending record with all required fields', () => {
    const rec = createTurnRecord({ conversationId: 'c-1' });
    expect(rec.status).toBe(TURN_STATUS.PENDING);
    expect(rec.conversation_id).toBe('c-1');
    expect(typeof rec.client_request_id).toBe('string');
    expect(typeof rec.created_at).toBe('string');
    expect(rec.committed_response_key).toBeNull();
    expect(rec.feedback_identity).toBeNull();
    expect(rec.generation_id).toBeNull();
  });

  it('buildV2DebugDiagnostic includes only safe enumerable fields', () => {
    const diag = buildV2DebugDiagnostic({
      orchestrator_version: 'v2',
      client_request_id: 'crid-abc-123',
      generation_id: null,
      turn_status: 'completed',
      pending_turn_count: 0,
      delivery_source: 'polling',
      snapshot_accepted: true,
      snapshot_rejected_reason: 'no_active_turn',
      response_correlated: true,
      response_deduplicated: false,
      polling_exhausted: false,
      late_response_recovered: false,
      historical_response_blocked: false,
    });
    expect(diag.orchestrator_version).toBe('v2');
    expect(diag.client_request_id).toBe('crid-abc-123');
    expect(diag.generation_id).toBeNull();
    expect(diag.turn_status).toBe('completed');
    expect(diag.pending_turn_count).toBe(0);
    expect(diag.snapshot_accepted).toBe(true);
    expect(diag.response_correlated).toBe(true);
    expect(diag.late_response_recovered).toBe(false);
    expect(diag.historical_response_blocked).toBe(false);
    // Must not include user content, clinical data, or message text.
    expect('content' in diag).toBe(false);
    expect('message' in diag).toBe(false);
    expect('assistant_message' in diag).toBe(false);
  });

  it('buildV2DebugDiagnostic omits fields with undefined values', () => {
    const diag = buildV2DebugDiagnostic({ orchestrator_version: 'v2' });
    expect(diag.orchestrator_version).toBe('v2');
    expect('pending_turn_count' in diag).toBe(false);
    expect('turn_status' in diag).toBe(false);
  });

  it('getDiagnosticState returns privacy-safe coordinator state', () => {
    const coord = createChatOrchestratorV2();
    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => {} });
    const state = coord.getDiagnosticState();
    expect(state.orchestrator_version).toBe('v2');
    expect(typeof state.client_request_id).toBe('string');
    expect(state.turn_status).toBe(TURN_STATUS.PENDING);
    expect(state.pending_turn_count).toBe(0);
    expect('content' in state).toBe(false);
  });

  it('reset clears active turn, queue, and baseline', () => {
    const coord = createChatOrchestratorV2();
    coord.initializeBaseline([makeUserMsg(), makeAssistantMsg()]);
    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => {} });
    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => {} }); // queued
    expect(coord.getPendingTurnCount()).toBe(1);
    coord.reset();
    expect(coord.getActiveTurn()).toBeNull();
    expect(coord.getPendingTurnCount()).toBe(0);
    // After reset, no baseline — new send can commit any assistant message.
    coord.registerSend({ conversationId: CONV_ID, executeSend: async () => {} });
    coord.markGenerating(coord.getActiveTurn().client_request_id);
    const result = coord.reconcileSnapshot({
      snapshot: makeSnapshot([makeUserMsg()], [makeAssistantMsg('a-after-reset')]),
      deliverySource: 'polling',
    });
    expect(result.accepted).toBe(true);
  });
});

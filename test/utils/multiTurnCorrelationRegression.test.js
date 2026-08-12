/**
 * Multi-turn correlation and persistent progress suppression — regression suite.
 *
 * Tests the lifecycle/correlation helpers directly (not a duplicate harness).
 * Covers the two blocking defects described in the PR #927 amendment spec.
 *
 * BLOCKER 1 — EXPECTED REPLY COUNT / TURN CORRELATION
 *   An assistant record preceding the active user message must never be accepted
 *   as the current turn's response.
 *
 * BLOCKER 2 — HISTORICAL PROGRESS RESTORATION
 *   Once an intermediate assistant record is suppressed it must remain suppressed
 *   on every later snapshot, hydration, subscription, or reload.
 */

import { describe, expect, it } from 'vitest';
import {
  evaluateActiveTurnAssistantCorrelation,
  calculateExpectedReplyCount,
} from '../../src/lib/chatRuntimeLifecycle.js';
import {
  normalizeAllCompletedTurnsFinalSnapshot,
  normalizeLegacyActiveTurnFinalSnapshot,
  applyRecordScopedAssistantFeedbackFinality,
} from '../../src/lib/legacyFinalSnapshotNormalization.js';
import { resolveFeedbackMessageIndex } from '../../src/components/chat/utils/feedbackIndex.js';

// ---------------------------------------------------------------------------
// Shared fixture builders
// ---------------------------------------------------------------------------

function makeUser(id, rawIndex) {
  return { role: 'user', id, __rawIndex: rawIndex, content: `user-message-${id}` };
}

function makeAssistant(id, rawIndex, content = `assistant-reply-${id}`) {
  return { role: 'assistant', id, __rawIndex: rawIndex, content };
}

// Simulates the full pipeline output for a snapshot:
//   buildVisibleConversationMessages → normalizeAllCompletedTurnsFinalSnapshot
function pipeline(messages) {
  return normalizeAllCompletedTurnsFinalSnapshot(messages);
}

// ---------------------------------------------------------------------------
// Test 1 — Turn 1 canonical: user1 → final1 (progress1 already suppressed)
// ---------------------------------------------------------------------------
describe('test 1 — turn 1 visible state has only user1 → final1', () => {
  it('pipeline produces user1 → final1 from raw user1 → progress1 → final1', () => {
    const raw = [
      makeUser('u1', 0),
      makeAssistant('progress1', 1, 'working...'),
      makeAssistant('final1', 2, 'final reply 1'),
    ];
    // After turn 1 commits, active-turn normalization collapses to user1 + final1.
    const activeTurnNorm = normalizeLegacyActiveTurnFinalSnapshot(raw).messages;
    expect(activeTurnNorm).toHaveLength(2);
    expect(activeTurnNorm[1].id).toBe('final1');
    // All-turns normalization of the same input also collapses (single-turn case).
    const allTurnsNorm = pipeline(raw);
    // Last user turn is untouched by all-turns normalization; active-turn function handles it.
    expect(allTurnsNorm.every((m) => m.id !== 'progress1')).toBe(false); // not yet multi-turn
    // But once user2 is present, progress1 is a historical intermediate → must be removed.
    const withUser2 = [...activeTurnNorm, makeUser('u2', 3)];
    const canonical = pipeline(withUser2);
    expect(canonical.map((m) => m.id)).toEqual(['u1', 'final1', 'u2']);
    // ^ user1 id='u1', final1 id='final1', user2 id='u2'
  });
});

// ---------------------------------------------------------------------------
// Test 2 — After user2 added, polling must NOT accept final1 as user2's reply
// ---------------------------------------------------------------------------
describe('test 2 — correlation guard blocks final1 as user2 response', () => {
  it('evaluateActiveTurnAssistantCorrelation rejects final1 when user2 follows it', () => {
    // Snapshot: user1 → final1 → user2 (no reply yet)
    const snapshot = [
      makeUser('u1', 0),
      makeAssistant('final1', 1, 'final reply 1'),
      makeUser('u2', 2),
    ];
    const corr = evaluateActiveTurnAssistantCorrelation(snapshot);
    expect(corr.isActiveTurnResponse).toBe(false);
    expect(corr.reason).toBe('assistant_precedes_active_user');
    expect(corr.activeUserIndex).toBe(2);
    expect(corr.latestAssistantIndex).toBe(1);
  });

  it('polling would not have expected-count met if all-turns normalization applied before count', () => {
    // Raw snapshot just after user2 sent, progress1 still in raw:
    // user1 → progress1 → final1 → user2 (no progress2 yet)
    const rawPollSnapshot = [
      makeUser('u1', 0),
      makeAssistant('progress1', 1, 'working...'),
      makeAssistant('final1', 2, 'final reply 1'),
      makeUser('u2', 3),
    ];
    // After buildVisibleConversationMessages, all-turns normalization removes progress1:
    const visible = pipeline(rawPollSnapshot);
    // user1 → final1 → user2 = 3 messages (progress1 suppressed since user2 follows it)
    expect(visible).toHaveLength(3);
    expect(visible.map((m) => m.id || m.role)).toEqual(['u1', 'final1', 'u2']);

    // messages.length was 2 before user2 send (user1 + final1), so:
    const expectedCount = calculateExpectedReplyCount(2);
    expect(expectedCount).toBe(4);
    // visible.length = 3 < expectedCount = 4 → hasExpectedReplyCount = false → no false commit
    expect(visible.length >= expectedCount).toBe(false);

    // AND the correlation guard also blocks independently:
    const corr = evaluateActiveTurnAssistantCorrelation(visible);
    expect(corr.isActiveTurnResponse).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Test 3 — After final2 arrives, visible state must be user1 → final1 → user2 → final2
// ---------------------------------------------------------------------------
describe('test 3 — complete two-turn lifecycle produces correct canonical order', () => {
  it('normalizeAllCompletedTurnsFinalSnapshot produces user1→final1→user2→final2', () => {
    const raw = [
      makeUser('u1', 0),
      makeAssistant('progress1', 1, 'working 1...'),
      makeAssistant('final1', 2, 'final reply 1'),
      makeUser('u2', 3),
      makeAssistant('progress2', 4, 'working 2...'),
      makeAssistant('final2', 5, 'final reply 2'),
    ];
    // Simulate what buildVisibleConversationMessages produces after all-turns pipeline:
    // At commit time, normalizeLegacyActiveTurnFinalSnapshot is applied too.
    // But normalizeAllCompletedTurnsFinalSnapshot suppresses user1's turn progress1.
    const allTurns = pipeline(raw);
    expect(allTurns.map((m) => m.id || m.role)).toEqual([
      'u1',      // user1
      'final1',  // canonical for turn 1
      'u2',      // user2
      // progress2 and final2 for active turn — NOT collapsed by all-turns (active turn exempt)
      'progress2',
      'final2',
    ]);

    // Then at commit time, active-turn normalization collapses progress2 too:
    const withActiveTurnNorm = normalizeLegacyActiveTurnFinalSnapshot(allTurns).messages;
    expect(withActiveTurnNorm.map((m) => m.id || m.role)).toEqual([
      'u1',   // user1
      'final1', // canonical turn 1
      'u2',   // user2
      'final2', // canonical turn 2
    ]);
    expect(withActiveTurnNorm).toHaveLength(4);
  });
});

// ---------------------------------------------------------------------------
// Test 4 — Later authoritative snapshot must not restore progress1 or progress2
// ---------------------------------------------------------------------------
describe('test 4 — later snapshot does not restore suppressed progress records', () => {
  it('all-turns normalization is deterministic across repeated pipeline calls', () => {
    const rawFull = [
      makeUser('u1', 0),
      makeAssistant('progress1', 1, 'working 1...'),
      makeAssistant('final1', 2, 'final reply 1'),
      makeUser('u2', 3),
      makeAssistant('progress2', 4, 'working 2...'),
      makeAssistant('final2', 5, 'final reply 2'),
    ];

    // Apply pipeline multiple times (e.g. late subscription, re-fetch)
    const first = pipeline(rawFull);
    const second = pipeline(rawFull);
    const third = pipeline(rawFull);

    // All applications produce identical results
    expect(first).toEqual(second);
    expect(second).toEqual(third);

    // progress1 never appears after user2 is present
    expect(first.some((m) => m.id === 'progress1')).toBe(false);
    // progress2 is active-turn and not removed by all-turns normalization
    // (will be removed later by active-turn normalization at commit)
    expect(first.some((m) => m.id === 'progress2')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Test 5 — Hydration/reload: complete raw snapshot never restores progress records
// ---------------------------------------------------------------------------
describe('test 5 — hydration of complete raw snapshot suppresses both progress records', () => {
  it('pipeline on full raw snapshot removes progress1 (historical) but not progress2 (active)', () => {
    const fullRaw = [
      makeUser('u1', 0),
      makeAssistant('progress1', 1, 'working 1...'),
      makeAssistant('final1', 2, 'final reply 1'),
      makeUser('u2', 3),
      makeAssistant('progress2', 4, 'working 2...'),
      makeAssistant('final2', 5, 'final reply 2'),
    ];
    const hydrated = pipeline(fullRaw);
    expect(hydrated.some((m) => m.id === 'progress1')).toBe(false);
    // After active-turn normalization at commit:
    const committed = normalizeLegacyActiveTurnFinalSnapshot(hydrated).messages;
    expect(committed.some((m) => m.id === 'progress2')).toBe(false);
    expect(committed.map((m) => m.id || m.role)).toEqual([
      'u1', 'final1', 'u2', 'final2',
    ]);
  });
});

// ---------------------------------------------------------------------------
// Test 6 — Late subscription preserves canonical representation
// ---------------------------------------------------------------------------
describe('test 6 — late subscription snapshot produces same canonical output', () => {
  it('multiple subscription snapshots of the same raw data are idempotent', () => {
    const rawFull = [
      makeUser('u1', 0),
      makeAssistant('progress1', 1, 'working 1...'),
      makeAssistant('final1', 2, 'final reply 1'),
      makeUser('u2', 3),
      makeAssistant('final2', 4, 'final reply 2'),
    ];
    const pollingResult = pipeline(rawFull);
    const subscriptionResult = pipeline(rawFull);
    expect(subscriptionResult).toEqual(pollingResult);
    expect(subscriptionResult.some((m) => m.id === 'progress1')).toBe(false);
    expect(subscriptionResult.some((m) => m.id === 'final1')).toBe(true);
    expect(subscriptionResult.some((m) => m.id === 'final2')).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Test 7 — Feedback targets original raw indexes of final1 and final2
// ---------------------------------------------------------------------------
describe('test 7 — feedback uses original raw backend indexes', () => {
  it('resolveFeedbackMessageIndex returns __rawIndex 2 for final1 and 5 for final2', () => {
    const final1 = makeAssistant('final1', 2, 'final reply 1');
    const final2 = makeAssistant('final2', 5, 'final reply 2');

    // Even though they appear at visible indexes 1 and 3 after normalization,
    // feedback must target their original raw backend indexes.
    expect(resolveFeedbackMessageIndex(final1, 1)).toBe(2);
    expect(resolveFeedbackMessageIndex(final2, 3)).toBe(5);

    // Intermediate progress records are not feedback-eligible: they lack
    // feedback_finality_verified = true.
    const raw = [
      makeUser('u1', 0),
      makeAssistant('progress1', 1, 'working 1...'),
      { ...makeAssistant('final1', 2, 'final reply 1') },
      makeUser('u2', 3),
      { ...makeAssistant('final2', 5, 'final reply 2') },
    ];
    const tagged = applyRecordScopedAssistantFeedbackFinality(raw, true);
    expect(tagged.find((m) => m.id === 'progress1')?.metadata?.feedback_finality_verified).toBeFalsy();
    expect(tagged.find((m) => m.id === 'final1')?.metadata?.feedback_finality_verified).toBe(true);
    expect(tagged.find((m) => m.id === 'final2')?.metadata?.feedback_finality_verified).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Test 8 — Two ordinary turns (no progress records) remain unchanged
// ---------------------------------------------------------------------------
describe('test 8 — two ordinary turns without progress records are unchanged', () => {
  it('normalizeAllCompletedTurnsFinalSnapshot is a no-op for clean two-turn conversation', () => {
    const clean = [
      makeUser('u1', 0),
      makeAssistant('a1', 1, 'reply 1'),
      makeUser('u2', 2),
      makeAssistant('a2', 3, 'reply 2'),
    ];
    const result = pipeline(clean);
    expect(result).toEqual(clean);
    expect(result).toHaveLength(4);
  });

  it('evaluateActiveTurnAssistantCorrelation accepts a2 as user2 response', () => {
    const snapshot = [
      makeUser('u1', 0),
      makeAssistant('a1', 1, 'reply 1'),
      makeUser('u2', 2),
      makeAssistant('a2', 3, 'reply 2'),
    ];
    const corr = evaluateActiveTurnAssistantCorrelation(snapshot);
    expect(corr.isActiveTurnResponse).toBe(true);
    expect(corr.reason).toBe('assistant_after_active_user');
    expect(corr.activeUserIndex).toBe(2);
    expect(corr.latestAssistantIndex).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// Test 9 — Non-final active-turn snapshot remains non-terminal
// ---------------------------------------------------------------------------
describe('test 9 — non-final active-turn snapshot is not terminal', () => {
  it('a single-record progress-only active turn has isActiveTurnResponse=true but is still in progress', () => {
    // Snapshot: user1 → final1 → user2 → progress2 (only progress for user2 so far)
    const snapshot = [
      makeUser('u1', 0),
      makeAssistant('final1', 1, 'final reply 1'),
      makeUser('u2', 2),
      makeAssistant('progress2', 3, 'working 2...'),
    ];
    // Correlation: progress2 is AFTER user2 → is a valid active-turn candidate
    const corr = evaluateActiveTurnAssistantCorrelation(snapshot);
    expect(corr.isActiveTurnResponse).toBe(true);
    expect(corr.reason).toBe('assistant_after_active_user');
    // But pollFinality should still say non-terminal (content still mutating).
    // We verify that the all-turns normalization does NOT remove progress2
    // since it's the active turn.
    const normalized = pipeline(snapshot);
    expect(normalized.some((m) => m.id === 'progress2')).toBe(true);
  });

  it('no assistant after active user means isActiveTurnResponse=false', () => {
    const snapshot = [
      makeUser('u1', 0),
      makeAssistant('final1', 1, 'final reply 1'),
      makeUser('u2', 2),
    ];
    const corr = evaluateActiveTurnAssistantCorrelation(snapshot);
    expect(corr.isActiveTurnResponse).toBe(false);
    expect(corr.reason).toBe('assistant_precedes_active_user');
  });
});

// ---------------------------------------------------------------------------
// Test 10 — Same-record mutation and finalized-message overwrite protections
// ---------------------------------------------------------------------------
describe('test 10 — immutability and mutation protections remain intact', () => {
  it('canonical final1 __rawIndex and content are preserved through all-turns normalization', () => {
    const raw = [
      makeUser('u1', 0),
      { ...makeAssistant('progress1', 1, 'working...'), metadata: { status: 'streaming' } },
      {
        ...makeAssistant('final1', 2, 'final reply 1'),
        attachments: [{ type: 'file', url: 'https://example.com/f.pdf' }],
        metadata: {
          generated_files: [{ form_id: 'f1', url: 'https://example.com/f.pdf' }],
          guard_provenance: { guard: 'policy-v1' },
        },
      },
      makeUser('u2', 3),
    ];
    const result = pipeline(raw);
    const canonicalFinal1 = result.find((m) => m.id === 'final1');
    expect(canonicalFinal1).toBeTruthy();
    expect(canonicalFinal1.__rawIndex).toBe(2);
    expect(canonicalFinal1.content).toBe('final reply 1');
    expect(canonicalFinal1.attachments).toEqual([{ type: 'file', url: 'https://example.com/f.pdf' }]);
    expect(canonicalFinal1.metadata.generated_files).toEqual([{ form_id: 'f1', url: 'https://example.com/f.pdf' }]);
    expect(canonicalFinal1.metadata.guard_provenance).toEqual({ guard: 'policy-v1' });
    // progress1 was removed
    expect(result.some((m) => m.id === 'progress1')).toBe(false);
  });

  it('normalizeAllCompletedTurnsFinalSnapshot never modifies message identity of canonical record', () => {
    const raw = [
      makeUser('u1', 0),
      makeAssistant('progress1', 1, 'working...'),
      makeAssistant('final1', 2, 'final reply 1'),
      makeUser('u2', 3),
      makeAssistant('final2', 4, 'final reply 2'),
    ];
    const result = pipeline(raw);
    const final1 = result.find((m) => m.id === 'final1');
    const final2 = result.find((m) => m.id === 'final2');
    expect(final1).toStrictEqual(raw[2]);
    expect(final2).toStrictEqual(raw[4]);
  });
});

// ---------------------------------------------------------------------------
// Test 11 — Existing behavior and edge cases remain unchanged
// ---------------------------------------------------------------------------
describe('test 11 — existing behavior remains unchanged', () => {
  it('single-turn snapshot with one assistant is unchanged', () => {
    const msgs = [
      makeUser('u1', 0),
      makeAssistant('a1', 1, 'reply'),
    ];
    expect(pipeline(msgs)).toEqual(msgs);
  });

  it('no user message in snapshot returns input unchanged', () => {
    const msgs = [
      makeAssistant('a1', 0, 'orphan assistant'),
    ];
    expect(pipeline(msgs)).toEqual(msgs);
  });

  it('empty snapshot returns empty array', () => {
    expect(pipeline([])).toEqual([]);
  });

  it('three turns all suppressed correctly', () => {
    const raw = [
      makeUser('u1', 0),
      makeAssistant('p1', 1, 'working 1'),
      makeAssistant('f1', 2, 'final 1'),
      makeUser('u2', 3),
      makeAssistant('p2', 4, 'working 2'),
      makeAssistant('f2', 5, 'final 2'),
      makeUser('u3', 6),
      makeAssistant('p3', 7, 'working 3'),
      makeAssistant('f3', 8, 'final 3'),
    ];
    // All three turns complete: user1's and user2's blocks are historical;
    // user3's block is active → all-turns normalization leaves it.
    const result = pipeline(raw);
    const ids = result.map((m) => m.id || m.role);
    expect(ids).toEqual([
      'u1', 'f1',    // turn 1: p1 removed (historical)
      'u2', 'f2',    // turn 2: p2 removed (historical)
      'u3', 'p3', 'f3',  // turn 3: active turn untouched
    ]);
  });

  it('evaluateActiveTurnAssistantCorrelation handles no user message', () => {
    const corr = evaluateActiveTurnAssistantCorrelation([makeAssistant('a1', 0, 'reply')]);
    expect(corr.isActiveTurnResponse).toBe(false);
    expect(corr.reason).toBe('no_active_user_message');
  });

  it('evaluateActiveTurnAssistantCorrelation handles no assistant message', () => {
    const corr = evaluateActiveTurnAssistantCorrelation([makeUser('u1', 0)]);
    expect(corr.isActiveTurnResponse).toBe(false);
    expect(corr.reason).toBe('no_assistant_in_snapshot');
  });
});

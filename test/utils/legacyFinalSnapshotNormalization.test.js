import { describe, expect, it } from 'vitest';
import {
  normalizeLegacyActiveTurnFinalSnapshot,
  applyRecordScopedAssistantFeedbackFinality,
} from '../../src/lib/legacyFinalSnapshotNormalization.js';
import { resolveFeedbackMessageIndex } from '../../src/components/chat/utils/feedbackIndex.js';

function getAssistantIdentityKey(msg, index) {
  if (!msg || msg.role !== 'assistant') return null;
  if (Number.isInteger(msg.__rawIndex)) return `raw:${msg.__rawIndex}`;
  if (msg.id) return `id:${msg.id}`;
  return `idx:${index}`;
}

function assistantContentMap(messages) {
  const map = new Map();
  (Array.isArray(messages) ? messages : []).forEach((msg, index) => {
    if (!msg || msg.role !== 'assistant') return;
    const key = getAssistantIdentityKey(msg, index);
    if (!key) return;
    map.set(key, typeof msg.content === 'string' ? msg.content : '');
  });
  return map;
}

function hasAssistantSnapshotContentChange(prev, next) {
  const prevMap = assistantContentMap(prev);
  const nextMap = assistantContentMap(next);
  if (prevMap.size !== nextMap.size) return true;
  for (const [key, content] of prevMap.entries()) {
    if (!nextMap.has(key) || nextMap.get(key) !== content) return true;
  }
  return false;
}

function hasVisibleAssistantMutation(prev, next) {
  const prevMap = assistantContentMap(prev);
  const nextMap = assistantContentMap(next);
  for (const [key, prevContent] of prevMap.entries()) {
    if (!nextMap.has(key)) continue;
    if (nextMap.get(key) !== prevContent) return true;
  }
  return false;
}

function createLegacyCommitHarness() {
  let confirmed = [];
  const finalizedContentByKey = new Map();

  const commit = (incoming, { isFinal, source = 'Polling' } = {}) => {
    const normalized = isFinal === true
      ? normalizeLegacyActiveTurnFinalSnapshot(incoming).messages
      : incoming;
    const tagged = applyRecordScopedAssistantFeedbackFinality(normalized, isFinal === true);

    if (tagged.length < confirmed.length) {
      return { accepted: false, reason: 'rejected_shorter_than_confirmed' };
    }
    if (hasVisibleAssistantMutation(confirmed, tagged)) {
      return { accepted: false, reason: 'rejected_visible_assistant_immutable' };
    }

    const assistantContentChanged = hasAssistantSnapshotContentChange(confirmed, tagged);
    const hadVisibleAssistant = confirmed.some((msg) => msg?.role === 'assistant');
    const allowNonFinalPopulation = source === 'CurrentConversationHydrate' && !hadVisibleAssistant;
    if (assistantContentChanged && isFinal !== true && !allowNonFinalPopulation) {
      return { accepted: false, reason: 'rejected_non_final_assistant_change' };
    }

    for (let i = 0; i < tagged.length; i += 1) {
      const msg = tagged[i];
      if (!msg || msg.role !== 'assistant') continue;
      const key = getAssistantIdentityKey(msg, i);
      if (!key) continue;
      const finalizedContent = finalizedContentByKey.get(key);
      if (finalizedContent !== undefined && finalizedContent !== String(msg.content || '')) {
        return { accepted: false, reason: 'rejected_immutability_guard' };
      }
    }

    confirmed = tagged;
    if (isFinal === true) {
      tagged.forEach((msg, index) => {
        if (!msg || msg.role !== 'assistant') return;
        const key = getAssistantIdentityKey(msg, index);
        if (!key) return;
        finalizedContentByKey.set(key, String(msg.content || ''));
      });
    }

    return { accepted: true, reason: 'accepted' };
  };

  return {
    commit,
    getVisible: () => confirmed,
  };
}

describe('legacy final snapshot normalization', () => {
  it('final polling snapshot keeps only canonical active-turn assistant and finality is record-scoped', () => {
    const progress = {
      role: 'assistant',
      id: 'a-progress',
      __rawIndex: 1,
      created_at: '2026-08-11T12:00:01.000Z',
      content: 'Working...',
      metadata: { status: 'streaming' },
    };
    const final = {
      role: 'assistant',
      id: 'a-final',
      __rawIndex: 2,
      created_at: '2026-08-11T12:00:02.000Z',
      content: 'Final response.',
      attachments: [{ type: 'file', url: 'https://example.com/final.pdf' }],
      metadata: {
        status: 'completed',
        generated_files: [{ form_id: 'f1', url: 'https://example.com/final.pdf' }],
        guard_provenance: { guard: 'policy-v1' },
      },
    };
    const incoming = [
      { role: 'user', id: 'u1', __rawIndex: 0, content: 'Help me' },
      progress,
      final,
    ];

    const normalized = normalizeLegacyActiveTurnFinalSnapshot(incoming);
    const tagged = applyRecordScopedAssistantFeedbackFinality(normalized.messages, true);

    expect(tagged).toHaveLength(2);
    expect(tagged[1].id).toBe('a-final');
    expect(tagged[1].content).toBe('Final response.');
    expect(tagged[1].created_at).toBe('2026-08-11T12:00:02.000Z');
    expect(tagged[1].__rawIndex).toBe(2);
    expect(tagged[1].attachments).toEqual(final.attachments);
    expect(tagged[1].metadata.generated_files).toEqual(final.metadata.generated_files);
    expect(tagged[1].metadata.guard_provenance).toEqual(final.metadata.guard_provenance);
    expect(tagged[1].metadata.feedback_finality_verified).toBe(true);
    expect(tagged.some((msg) => msg?.id === 'a-progress')).toBe(false);
  });

  it('keeps assistant responses from separate user turns visible', () => {
    const incoming = [
      { role: 'user', content: 'u1' },
      { role: 'assistant', id: 'a1', __rawIndex: 1, content: 'r1' },
      { role: 'user', content: 'u2' },
      { role: 'assistant', id: 'a2', __rawIndex: 3, content: 'r2' },
    ];
    const normalized = normalizeLegacyActiveTurnFinalSnapshot(incoming);
    const tagged = applyRecordScopedAssistantFeedbackFinality(normalized.messages, true);
    expect(tagged).toHaveLength(4);
    expect(tagged.filter((m) => m.role === 'assistant')).toHaveLength(2);
    expect(tagged[1].metadata.feedback_finality_verified).toBe(true);
    expect(tagged[3].metadata.feedback_finality_verified).toBe(true);
  });

  it('normalizes only the active turn and preserves historical completed pairs', () => {
    const incoming = [
      { role: 'user', content: 'u1' },
      { role: 'assistant', id: 'a1', __rawIndex: 1, content: 'r1' },
      { role: 'user', content: 'u2' },
      { role: 'assistant', id: 'a2', __rawIndex: 3, content: 'r2' },
      { role: 'user', content: 'u3' },
      { role: 'assistant', id: 'a3-progress', __rawIndex: 5, content: 'thinking...' },
      { role: 'assistant', id: 'a3-final', __rawIndex: 6, content: 'r3-final' },
    ];
    const normalized = normalizeLegacyActiveTurnFinalSnapshot(incoming).messages;
    expect(normalized.map((m) => m.id || m.content)).toEqual([
      'u1', 'a1', 'u2', 'a2', 'u3', 'a3-final',
    ]);
  });

  it('rejects same-record assistant mutation via existing immutability protections', () => {
    const harness = createLegacyCommitHarness();
    const accepted = harness.commit([
      { role: 'user', content: 'u1' },
      { role: 'assistant', id: 'a1', __rawIndex: 1, content: 'stable final' },
    ], { isFinal: true });
    expect(accepted.accepted).toBe(true);

    const rejected = harness.commit([
      { role: 'user', content: 'u1' },
      { role: 'assistant', id: 'a1', __rawIndex: 1, content: 'stable final + mutation' },
    ], { isFinal: true });
    expect(rejected.accepted).toBe(false);
    expect(rejected.reason).toBe('rejected_visible_assistant_immutable');
    expect(harness.getVisible()[1].content).toBe('stable final');
  });

  it('prevents late subscription restore of progress or overwrite of finalized assistant', () => {
    const harness = createLegacyCommitHarness();

    const firstCommit = harness.commit([
      { role: 'user', content: 'u1', __rawIndex: 0 },
      { role: 'assistant', id: 'a-progress', __rawIndex: 1, content: 'working...' },
      { role: 'assistant', id: 'a-final', __rawIndex: 2, content: 'final answer' },
    ], { isFinal: true, source: 'Polling' });
    expect(firstCommit.accepted).toBe(true);
    expect(harness.getVisible().map((m) => m.id)).toEqual([undefined, 'a-final']);

    const lateRestore = harness.commit([
      { role: 'user', content: 'u1', __rawIndex: 0 },
      { role: 'assistant', id: 'a-progress', __rawIndex: 1, content: 'working...' },
      { role: 'assistant', id: 'a-final', __rawIndex: 2, content: 'final answer' },
    ], { isFinal: true, source: 'Subscription' });
    expect(lateRestore.accepted).toBe(true);
    expect(harness.getVisible().some((m) => m.id === 'a-progress')).toBe(false);

    const lateOverwrite = harness.commit([
      { role: 'user', content: 'u1', __rawIndex: 0 },
      { role: 'assistant', id: 'a-progress', __rawIndex: 1, content: 'working...' },
      { role: 'assistant', id: 'a-final', __rawIndex: 2, content: 'tampered final answer' },
    ], { isFinal: true, source: 'Subscription' });
    expect(lateOverwrite.accepted).toBe(false);
    expect(harness.getVisible()[1].content).toBe('final answer');
  });

  it('does not commit non-final polling snapshots', () => {
    const harness = createLegacyCommitHarness();
    harness.commit([{ role: 'user', content: 'u1' }], { isFinal: false });

    const nonFinal = harness.commit([
      { role: 'user', content: 'u1' },
      { role: 'assistant', id: 'a-progress', __rawIndex: 1, content: 'working...' },
      { role: 'assistant', id: 'a-final', __rawIndex: 2, content: 'final answer' },
    ], { isFinal: false, source: 'Polling' });

    expect(nonFinal.accepted).toBe(false);
    expect(nonFinal.reason).toBe('rejected_non_final_assistant_change');
    expect(harness.getVisible()).toEqual([{ role: 'user', content: 'u1' }]);
  });

  it('explicit-final and stable-across-polls decisions produce identical canonical output', () => {
    const incoming = [
      { role: 'user', content: 'u1' },
      { role: 'assistant', id: 'a-progress', __rawIndex: 1, content: 'working...' },
      { role: 'assistant', id: 'a-final', __rawIndex: 2, content: 'final answer' },
    ];
    const canonical = normalizeLegacyActiveTurnFinalSnapshot(incoming).messages;
    const explicitFinal = applyRecordScopedAssistantFeedbackFinality(
      canonical,
      true
    );
    const stableAcrossPollsFinal = applyRecordScopedAssistantFeedbackFinality(
      explicitFinal,
      false
    );
    expect(stableAcrossPollsFinal).toEqual(explicitFinal);
  });

  it('feedback targeting prefers canonical raw backend index and falls back to visible index', () => {
    const visibleCanonicalAssistant = { role: 'assistant', __rawIndex: 7, content: 'final answer' };
    expect(resolveFeedbackMessageIndex(visibleCanonicalAssistant, 1)).toBe(7);
    expect(resolveFeedbackMessageIndex({ role: 'assistant', content: 'fallback' }, 3)).toBe(3);
  });
});

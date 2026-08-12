import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it, vi } from 'vitest';

import { getDefaultPollingLifecycle } from '../../src/lib/chatRuntimeLifecycle.js';
import {
  createSessionStartOpenerFallbackController,
  getDefaultSessionStartFallbackLifecycle,
} from '../../src/lib/sessionStartOpenerFallback.js';

const CHAT_SOURCE = readFileSync(
  resolve('src/pages/Chat.jsx'),
  'utf8'
);

function makeUserMessage() {
  return { role: 'user', id: 'u1', content: '[START_SESSION]' };
}

function makeAssistantMessage(content = 'Welcome to your first session.', overrides = {}) {
  return {
    role: 'assistant',
    id: 'a1',
    content,
    status: 'final',
    ...overrides,
  };
}

function createScheduler() {
  const queue = [];
  return {
    schedule(fn, delay) {
      const entry = { fn, delay, cancelled: false };
      queue.push(entry);
      return entry;
    },
    cancel(entry) {
      if (entry) entry.cancelled = true;
    },
    async runNext() {
      while (queue.length > 0) {
        const entry = queue.shift();
        if (!entry || entry.cancelled) continue;
        await entry.fn();
        return true;
      }
      return false;
    },
    async runAll() {
      while (await this.runNext()) {
        // drain
      }
    },
    pendingCount() {
      return queue.filter((entry) => !entry.cancelled).length;
    },
    delays() {
      return queue.filter((entry) => !entry.cancelled).map((entry) => entry.delay);
    },
  };
}

function createStatefulSafeUpdater(lastConfirmedRef) {
  return vi.fn((messages) => {
    const previous = Array.isArray(lastConfirmedRef.current) ? lastConfirmedRef.current : [];
    const previousAssistant = previous.filter((msg) => msg?.role === 'assistant').pop() || null;
    const nextAssistant = (Array.isArray(messages) ? messages : []).filter((msg) => msg?.role === 'assistant').pop() || null;

    if (
      previousAssistant &&
      nextAssistant &&
      previous.length === messages.length &&
      String(previousAssistant.content) === String(nextAssistant.content)
    ) {
      return false;
    }

    lastConfirmedRef.current = Array.isArray(messages) ? messages.map((msg) => ({ ...msg })) : [];
    return true;
  });
}

function createHarness(overrides = {}) {
  const scheduler = createScheduler();
  const lastConfirmedRef = { current: overrides.lastConfirmedMessages || [] };
  const state = {
    currentConversationId: overrides.currentConversationId || 'conv-first-session',
    mounted: overrides.mounted ?? true,
    sessionLanguage: 'en',
  };

  const fetchConversation = overrides.fetchConversation || vi.fn(async () => ({
    messages: [makeUserMessage(), makeAssistantMessage()],
  }));
  const buildVisibleConversationMessages =
    overrides.buildVisibleConversationMessages ||
    vi.fn((messages) => messages);
  const evaluatePollingAssistantFinality =
    overrides.evaluatePollingAssistantFinality ||
    vi.fn((messages) => {
      const latestAssistant = (messages || []).filter((msg) => msg?.role === 'assistant').pop();
      const isFinal = latestAssistant?.status === 'final' || latestAssistant?.metadata?.is_final === true;
      return { isFinal, reason: isFinal ? 'explicit_final_status' : 'assistant_still_mutating' };
    });
  const safeUpdateMessages = overrides.safeUpdateMessages || createStatefulSafeUpdater(lastConfirmedRef);
  const markAssistantMessagesFinalized = overrides.markAssistantMessagesFinalized || vi.fn();
  const setIsLoading = overrides.setIsLoading || vi.fn();
  const clearLoadingTimeout = overrides.clearLoadingTimeout || vi.fn();
  const emitStabilitySummary = overrides.emitStabilitySummary || vi.fn();

  const controller = createSessionStartOpenerFallbackController({
    fetchConversation,
    buildVisibleConversationMessages,
    evaluatePollingAssistantFinality,
    safeUpdateMessages,
    markAssistantMessagesFinalized,
    getCurrentConversationId: () => state.currentConversationId,
    getLastConfirmedMessages: () => lastConfirmedRef.current,
    getSessionLanguage: () => state.sessionLanguage,
    isMounted: () => state.mounted,
    setIsLoading,
    clearLoadingTimeout,
    emitStabilitySummary,
    schedule: scheduler.schedule.bind(scheduler),
    cancel: scheduler.cancel.bind(scheduler),
    getLifecycle: overrides.getLifecycle || getDefaultSessionStartFallbackLifecycle,
  });

  return {
    controller,
    scheduler,
    state,
    lastConfirmedRef,
    fetchConversation,
    buildVisibleConversationMessages,
    evaluatePollingAssistantFinality,
    safeUpdateMessages,
    markAssistantMessagesFinalized,
    setIsLoading,
    clearLoadingTimeout,
    emitStabilitySummary,
  };
}

describe('Session-start opener fallback controller', () => {
  it('retrieves and renders the first-session opener when the subscription callback is missed', async () => {
    const harness = createHarness();

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    expect(harness.fetchConversation).toHaveBeenCalledOnce();
    expect(harness.safeUpdateMessages).toHaveBeenCalledOnce();
    expect(harness.safeUpdateMessages.mock.calls[0][1]).toBe('SessionStartFallback');
    expect(harness.markAssistantMessagesFinalized).not.toHaveBeenCalled();
    expect(harness.setIsLoading).toHaveBeenLastCalledWith(false);
    expect(harness.clearLoadingTimeout).toHaveBeenCalled();
    expect(harness.controller.getState().active).toBe(false);
    expect(harness.lastConfirmedRef.current.filter((msg) => msg.role === 'assistant')).toHaveLength(1);
  });

  it('becomes a no-op when the subscription commits the opener before fallback retrieval', async () => {
    const harness = createHarness({
      lastConfirmedMessages: [makeUserMessage(), makeAssistantMessage()],
    });

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    expect(harness.fetchConversation).not.toHaveBeenCalled();
    expect(harness.safeUpdateMessages).not.toHaveBeenCalled();
    expect(harness.markAssistantMessagesFinalized).not.toHaveBeenCalled();
    expect(harness.setIsLoading).toHaveBeenLastCalledWith(false);
    expect(harness.lastConfirmedRef.current.filter((msg) => msg.role === 'assistant')).toHaveLength(1);
  });

  it('commits one opener when fallback wins and a later subscription snapshot matches the same final assistant', async () => {
    const harness = createHarness();

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    const duplicateAccepted = harness.safeUpdateMessages(
      harness.lastConfirmedRef.current,
      'Subscription'
    );

    expect(duplicateAccepted).toBe(false);
    expect(harness.lastConfirmedRef.current.filter((msg) => msg.role === 'assistant')).toHaveLength(1);
    expect(harness.markAssistantMessagesFinalized).not.toHaveBeenCalled();
  });

  it('uses the processed visible final opener and never surfaces stored progress bubbles', async () => {
    const progress = {
      role: 'assistant',
      id: 'a-progress',
      content: 'Thinking…',
      status: 'streaming',
    };
    const final = makeAssistantMessage('Here is the final opener.');
    const buildVisibleConversationMessages = vi.fn((messages) => {
      expect(messages).toEqual([makeUserMessage(), progress, final]);
      return [makeUserMessage(), final];
    });
    const harness = createHarness({
      fetchConversation: vi.fn(async () => ({
        messages: [makeUserMessage(), progress, final],
      })),
      buildVisibleConversationMessages,
    });

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    const committedMessages = harness.safeUpdateMessages.mock.calls[0][0];
    expect(committedMessages).toEqual([makeUserMessage(), final]);
    expect(committedMessages.some((msg) => msg.content === 'Thinking…')).toBe(false);
  });

  it('ignores a late retrieval result after the user switches conversations', async () => {
    let resolveFetch;
    const fetchConversation = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    const harness = createHarness({ fetchConversation });

    harness.controller.start('conv-first-session');
    const attemptPromise = harness.scheduler.runNext();
    harness.state.currentConversationId = 'conv-other';
    resolveFetch({ messages: [makeUserMessage(), makeAssistantMessage()] });
    await attemptPromise;

    expect(harness.safeUpdateMessages).not.toHaveBeenCalled();
    expect(harness.markAssistantMessagesFinalized).not.toHaveBeenCalled();
    expect(harness.controller.getState().active).toBe(false);
  });

  it('ignores a late retrieval result after unmount', async () => {
    let resolveFetch;
    const fetchConversation = vi.fn(
      () =>
        new Promise((resolve) => {
          resolveFetch = resolve;
        })
    );
    const harness = createHarness({ fetchConversation });

    harness.controller.start('conv-first-session');
    const attemptPromise = harness.scheduler.runNext();
    harness.state.mounted = false;
    resolveFetch({ messages: [makeUserMessage(), makeAssistantMessage()] });
    await attemptPromise;

    expect(harness.safeUpdateMessages).not.toHaveBeenCalled();
    expect(harness.markAssistantMessagesFinalized).not.toHaveBeenCalled();
    expect(harness.controller.getState().active).toBe(false);
  });

  it('clears loading after the bounded timeout when no visible final opener becomes available', async () => {
    const fetchConversation = vi.fn(async () => ({
      messages: [makeUserMessage()],
    }));
    const evaluatePollingAssistantFinality = vi.fn(() => ({
      isFinal: false,
      reason: 'missing_assistant_message',
    }));
    const harness = createHarness({
      fetchConversation,
      evaluatePollingAssistantFinality,
    });

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    const fallbackLifecycle = getDefaultSessionStartFallbackLifecycle();
    expect(fetchConversation).toHaveBeenCalledTimes(fallbackLifecycle.maxPollAttempts);
    expect(harness.safeUpdateMessages).not.toHaveBeenCalled();
    expect(harness.setIsLoading).toHaveBeenLastCalledWith(false);
    expect(harness.clearLoadingTimeout).toHaveBeenCalled();
    expect(harness.emitStabilitySummary).toHaveBeenCalledOnce();
    expect(harness.controller.getState().active).toBe(false);
  });
});

describe('Markerless stability — two-consecutive-read acceptance', () => {
  // A markerless assistant has content but no explicit final status or metadata.
  function makeMarkerlessAssistant(content = 'Welcome to your first session.', id = 'a-markerless') {
    return { role: 'assistant', id, content };
  }

  it('accepts a markerless canonical assistant after two identical consecutive reads', async () => {
    const assistant = makeMarkerlessAssistant();
    const harness = createHarness({
      fetchConversation: vi.fn(async () => ({
        messages: [makeUserMessage(), assistant],
      })),
      // Use a lifecycle with enough room for the two stability reads.
      getLifecycle: () => ({ pollDelays: [0, 0, 0, 0, 0], maxPollAttempts: 5 }),
    });

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    // Must be committed exactly once.
    expect(harness.safeUpdateMessages).toHaveBeenCalledOnce();
    expect(harness.safeUpdateMessages.mock.calls[0][1]).toBe('SessionStartFallback');
    // The finality reason must reflect local stable snapshot decision.
    const { pollFinality } = harness.safeUpdateMessages.mock.calls[0][2];
    expect(pollFinality.isFinal).toBe(true);
    expect(pollFinality.reason).toBe('session_start_post_completion_stable_snapshot');
    expect(harness.setIsLoading).toHaveBeenLastCalledWith(false);
    expect(harness.controller.getState().active).toBe(false);
  });

  it('does not commit a markerless assistant seen only once before exhaustion', async () => {
    const assistant = makeMarkerlessAssistant();
    let callCount = 0;
    const harness = createHarness({
      fetchConversation: vi.fn(async () => {
        callCount += 1;
        if (callCount === 1) return { messages: [makeUserMessage(), assistant] };
        // Return no assistant on subsequent reads to prevent stability.
        return { messages: [makeUserMessage()] };
      }),
      getLifecycle: () => ({ pollDelays: [0, 0], maxPollAttempts: 2 }),
    });

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    expect(harness.safeUpdateMessages).not.toHaveBeenCalled();
    expect(harness.setIsLoading).toHaveBeenLastCalledWith(false);
  });

  it('resets the stability counter when the canonical assistant fingerprint changes between reads', async () => {
    let callCount = 0;
    const harness = createHarness({
      fetchConversation: vi.fn(async () => {
        callCount += 1;
        // First read: progress snapshot.
        if (callCount === 1) {
          return { messages: [makeUserMessage(), makeMarkerlessAssistant('Thinking…', 'a-progress')] };
        }
        // Subsequent reads: different final content — fingerprint changes.
        return { messages: [makeUserMessage(), makeMarkerlessAssistant('Final opener text.', 'a-final')] };
      }),
      // 5 attempts: read 1 (progress), reads 2-3 (first+second identical final) → commit.
      getLifecycle: () => ({ pollDelays: [0, 0, 0, 0, 0], maxPollAttempts: 5 }),
    });

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    // Must be committed — but only with the final content, not the progress snapshot.
    expect(harness.safeUpdateMessages).toHaveBeenCalledOnce();
    const committedMessages = harness.safeUpdateMessages.mock.calls[0][0];
    const committedAssistant = committedMessages.filter((m) => m.role === 'assistant').pop();
    expect(committedAssistant.content).toBe('Final opener text.');
    // Progress snapshot must never have been committed.
    const { pollFinality } = harness.safeUpdateMessages.mock.calls[0][2];
    expect(pollFinality.reason).toBe('session_start_post_completion_stable_snapshot');
  });

  it('does not commit an empty snapshot (no visible assistant)', async () => {
    const harness = createHarness({
      fetchConversation: vi.fn(async () => ({ messages: [] })),
      getLifecycle: () => ({ pollDelays: [0, 0], maxPollAttempts: 2 }),
    });

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    expect(harness.safeUpdateMessages).not.toHaveBeenCalled();
    expect(harness.setIsLoading).toHaveBeenLastCalledWith(false);
  });

  it('cancelled stale controller cannot update visible messages after conversation switch', async () => {
    let resolveFetch;
    const fetchConversation = vi.fn(
      () => new Promise((resolve) => { resolveFetch = resolve; })
    );
    const harness = createHarness({ fetchConversation });

    harness.controller.start('conv-first-session');
    const attemptPromise = harness.scheduler.runNext();

    // Simulate conversation switch before fetch resolves.
    harness.state.currentConversationId = 'conv-other';
    resolveFetch({ messages: [makeUserMessage(), makeMarkerlessAssistant()] });
    await attemptPromise;

    expect(harness.safeUpdateMessages).not.toHaveBeenCalled();
    expect(harness.controller.getState().active).toBe(false);
  });

  it('progress plus final records normalize to one canonical visible opener via buildVisibleConversationMessages', async () => {
    const progress = { role: 'assistant', id: 'a-progress', content: 'Thinking…' };
    const finalOpener = makeMarkerlessAssistant('Welcome to your first session.');
    const buildVisibleConversationMessages = vi.fn((messages) => {
      // Simulate PR #929 normalization: suppress the progress bubble.
      return messages.filter((m) => m.id !== 'a-progress');
    });
    const harness = createHarness({
      fetchConversation: vi.fn(async () => ({
        messages: [makeUserMessage(), progress, finalOpener],
      })),
      buildVisibleConversationMessages,
      getLifecycle: () => ({ pollDelays: [0, 0, 0, 0, 0], maxPollAttempts: 5 }),
    });

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    expect(harness.safeUpdateMessages).toHaveBeenCalledOnce();
    const committed = harness.safeUpdateMessages.mock.calls[0][0];
    // Progress bubble must not appear in committed messages.
    expect(committed.some((m) => m.content === 'Thinking…')).toBe(false);
    expect(committed.some((m) => m.content === 'Welcome to your first session.')).toBe(true);
  });
});

describe('Explicit-final path preserved', () => {
  it('accepts an explicit-final opener immediately on the first read', async () => {
    const harness = createHarness({
      // Default fetchConversation returns assistant with status: 'final'.
      getLifecycle: () => ({ pollDelays: [0, 0, 0, 0, 0], maxPollAttempts: 5 }),
    });

    harness.controller.start('conv-first-session');
    await harness.scheduler.runAll();

    // One authoritative read is sufficient — no stability wait needed.
    expect(harness.fetchConversation).toHaveBeenCalledOnce();
    expect(harness.safeUpdateMessages).toHaveBeenCalledOnce();
    const { pollFinality } = harness.safeUpdateMessages.mock.calls[0][2];
    expect(pollFinality.isFinal).toBe(true);
    expect(pollFinality.reason).toBe('explicit_final_status');
  });
});

describe('Feedback targeting — opener receives no feedback controls', () => {
  it('MessageBubble gates feedback controls on feedback_finality_verified metadata', () => {
    const BUBBLE_SOURCE = readFileSync(
      resolve('src/components/chat/MessageBubble.jsx'),
      'utf8'
    );
    // PR #930: feedback is conditional on the feedback_finality_verified metadata flag,
    // which is set by applyAssistantFeedbackFinalityMetadata only when the finality
    // decision is true. The opener committed through the fallback carries this flag
    // according to the pollFinality decision passed to safeUpdateMessages.
    expect(BUBBLE_SOURCE).toContain('feedback_finality_verified');
    // The tag is applied per-message in Chat.jsx — preserving the existing behavior.
    expect(CHAT_SOURCE).toContain('applyAssistantFeedbackFinalityMetadata');
  });
});

describe('Session-start opener fallback integration guards', () => {
  it('starts the opener fallback only after the automatic first-session addMessage succeeds', () => {
    const addMessageIndex = CHAT_SOURCE.indexOf('await base44.agents.addMessage(conversation, {');
    const fallbackStartIndex = CHAT_SOURCE.indexOf("sessionStartOpenerFallbackRef.current?.start(conversation.id);");

    expect(addMessageIndex).toBeGreaterThan(-1);
    expect(fallbackStartIndex).toBeGreaterThan(addMessageIndex);
  });

  it('cancels the opener fallback when the user switches conversations', () => {
    expect(CHAT_SOURCE).toContain("sessionStartOpenerFallbackRef.current?.stop('conversation_switch'");
  });

  it('leaves ordinary typed-message polling lifecycle unchanged', () => {
    expect(getDefaultPollingLifecycle()).toEqual({
      pollDelays: [500, 1000, 2000, 4000, 6500],
      maxPollAttempts: 5,
    });
    expect(getDefaultSessionStartFallbackLifecycle()).toEqual({
      pollDelays: [250, 500, 1000, 2000, 4000],
      maxPollAttempts: 5,
    });
  });
});

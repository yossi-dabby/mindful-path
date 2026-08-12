import {
  getAssistantIdentityKey,
  selectLatestAssistantResponse,
} from './chatRuntimeLifecycle.js';

const DEFAULT_SESSION_START_FALLBACK_DELAYS = Object.freeze([250, 500, 1000, 2000, 4000]);

export function getDefaultSessionStartFallbackLifecycle() {
  return {
    pollDelays: DEFAULT_SESSION_START_FALLBACK_DELAYS,
    maxPollAttempts: DEFAULT_SESSION_START_FALLBACK_DELAYS.length,
  };
}

export function getSessionStartFallbackDelayForAttempt(
  attemptIndex,
  pollDelays = DEFAULT_SESSION_START_FALLBACK_DELAYS
) {
  return pollDelays[Math.min(attemptIndex, pollDelays.length - 1)];
}

export function hasVisibleAssistantMessage(messages) {
  const latestAssistant = selectLatestAssistantResponse(messages);
  return Boolean(
    latestAssistant &&
    latestAssistant.msg &&
    latestAssistant.msg.role === 'assistant' &&
    typeof latestAssistant.msg.content === 'string' &&
    latestAssistant.msg.content.trim().length > 0
  );
}

export function hasMatchingVisibleAssistantSnapshot(currentMessages, candidateMessages) {
  const currentAssistant = selectLatestAssistantResponse(currentMessages);
  const candidateAssistant = selectLatestAssistantResponse(candidateMessages);

  if (!currentAssistant || !candidateAssistant) return false;

  const currentKey = getAssistantIdentityKey(currentAssistant.msg, currentAssistant.index);
  const candidateKey = getAssistantIdentityKey(candidateAssistant.msg, candidateAssistant.index);
  if (!currentKey || !candidateKey || currentKey !== candidateKey) return false;

  return String(currentAssistant.msg.content || '') === String(candidateAssistant.msg.content || '');
}

export function createSessionStartOpenerFallbackController(options) {
  const {
    fetchConversation,
    buildVisibleConversationMessages,
    evaluatePollingAssistantFinality,
    safeUpdateMessages,
    markAssistantMessagesFinalized,
    getCurrentConversationId,
    getLastConfirmedMessages,
    getSessionLanguage,
    isMounted,
    setIsLoading,
    clearLoadingTimeout = () => {},
    emitStabilitySummary = () => {},
    schedule = (fn, delay) => setTimeout(fn, delay),
    cancel = (timerId) => clearTimeout(timerId),
    getLifecycle = getDefaultSessionStartFallbackLifecycle,
  } = options;

  let state = {
    runId: 0,
    active: false,
    conversationId: null,
    timerId: null,
    attempts: 0,
  };

  const clearTimer = () => {
    if (state.timerId !== null) {
      cancel(state.timerId);
      state.timerId = null;
    }
  };

  const stop = (reason = 'stopped', stopOptions = {}) => {
    const {
      clearLoading = false,
      clearLoadingTimeout: shouldClearLoadingTimeout = false,
      emitSummary = false,
    } = stopOptions;

    clearTimer();

    if (shouldClearLoadingTimeout) {
      clearLoadingTimeout();
    }
    if (clearLoading && isMounted()) {
      setIsLoading(false);
    }
    if (emitSummary) {
      emitStabilitySummary();
    }

    state = {
      ...state,
      active: false,
      conversationId: null,
      timerId: null,
      attempts: 0,
    };

    return reason;
  };

  const isInScope = (conversationId, runId) => (
    state.active === true &&
    state.runId === runId &&
    state.conversationId === conversationId &&
    isMounted() === true &&
    getCurrentConversationId() === conversationId
  );

  const scheduleAttempt = (runId, conversationId, attemptIndex, lifecycle) => {
    if (!isInScope(conversationId, runId)) {
      stop('scope_lost', { clearLoadingTimeout: true });
      return;
    }

    const delay = getSessionStartFallbackDelayForAttempt(attemptIndex, lifecycle.pollDelays);
    clearTimer();
    state.timerId = schedule(
      () => executeAttempt(runId, conversationId, attemptIndex, lifecycle),
      delay
    );
  };

  const executeAttempt = async (runId, conversationId, attemptIndex, lifecycle) => {
    if (!isInScope(conversationId, runId)) {
      stop('scope_lost', { clearLoadingTimeout: true });
      return;
    }

    state.attempts = attemptIndex + 1;

    if (hasVisibleAssistantMessage(getLastConfirmedMessages())) {
      stop('already_visible', {
        clearLoading: true,
        clearLoadingTimeout: true,
      });
      return;
    }

    try {
      const conversation = await fetchConversation(conversationId);
      if (!isInScope(conversationId, runId)) {
        stop('scope_lost', { clearLoadingTimeout: true });
        return;
      }

      const visibleMessages = buildVisibleConversationMessages(
        conversation?.messages || [],
        getSessionLanguage()
      );
      const pollFinality = evaluatePollingAssistantFinality(visibleMessages);

      if (hasVisibleAssistantMessage(visibleMessages) && pollFinality.isFinal === true) {
        const updated = safeUpdateMessages(visibleMessages, 'SessionStartFallback', {
          pollFinality,
        });

        if (updated) {
          markAssistantMessagesFinalized(conversationId, visibleMessages);
          stop('visible_commit', {
            clearLoading: true,
            clearLoadingTimeout: true,
            emitSummary: true,
          });
          return;
        }

        if (hasMatchingVisibleAssistantSnapshot(getLastConfirmedMessages(), visibleMessages)) {
          stop('already_visible', {
            clearLoading: true,
            clearLoadingTimeout: true,
          });
          return;
        }
      }

      if (state.attempts >= lifecycle.maxPollAttempts) {
        stop('timeout', {
          clearLoading: true,
          clearLoadingTimeout: true,
          emitSummary: true,
        });
        return;
      }

      scheduleAttempt(runId, conversationId, attemptIndex + 1, lifecycle);
    } catch (error) {
      stop('error', {
        clearLoading: true,
        clearLoadingTimeout: true,
        emitSummary: true,
      });
    }
  };

  const start = (conversationId) => {
    if (!conversationId) return;
    const lifecycle = getLifecycle();
    const nextRunId = state.runId + 1;
    stop('restart');
    state = {
      runId: nextRunId,
      active: true,
      conversationId,
      timerId: null,
      attempts: 0,
    };
    scheduleAttempt(nextRunId, conversationId, 0, lifecycle);
  };

  return {
    start,
    stop,
    getState: () => ({ ...state }),
  };
}

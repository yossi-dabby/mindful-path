import {
  getAssistantIdentityKey,
  selectLatestAssistantResponse,
} from './chatRuntimeLifecycle.js';

const DEFAULT_SESSION_START_FALLBACK_DELAYS = Object.freeze([250, 500, 1000, 2000, 4000]);

// Minimum number of identical consecutive authoritative reads required to
// treat a markerless assistant snapshot as stable and complete.
const MARKERLESS_STABILITY_REQUIRED = 2;

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

function isFinalAssistantMessage(assistantMsg) {
  const statusValue = typeof assistantMsg?.status === 'string'
    ? assistantMsg.status.trim().toLowerCase()
    : '';
  const metadataStatusValue = typeof assistantMsg?.metadata?.status === 'string'
    ? assistantMsg.metadata.status.trim().toLowerCase()
    : '';
  const finalStatuses = new Set(['done', 'completed', 'complete', 'final', 'finished']);
  if (statusValue && finalStatuses.has(statusValue)) return true;
  if (metadataStatusValue && finalStatuses.has(metadataStatusValue)) return true;
  if (assistantMsg?.metadata?.is_final === true) return true;
  if (assistantMsg?.metadata?.final === true) return true;
  if (assistantMsg?.metadata?.completed === true) return true;
  return false;
}

// Compute a local fingerprint from the canonical assistant's stable identity
// and content. Returns null when no stable fingerprint can be formed.
function computeAssistantFingerprint(latestAssistant) {
  if (!latestAssistant || !latestAssistant.msg) return null;
  const key = getAssistantIdentityKey(latestAssistant.msg, latestAssistant.index);
  const content = String(latestAssistant.msg.content || '').trim();
  if (!key || !content) return null;
  return `${key}::${content}`;
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
    safeUpdateMessages,
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
    // Markerless stability tracking (controller-local; reset on each start).
    stabilityFingerprint: null,
    stabilityCount: 0,
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
      stabilityFingerprint: null,
      stabilityCount: 0,
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
      console.debug('[SessionStartFallback] cancelled or scope_lost at attempt start', { attemptIndex });
      stop('scope_lost', { clearLoadingTimeout: true });
      return;
    }

    state.attempts = attemptIndex + 1;
    console.debug('[SessionStartFallback] fallback attempt', { attempt: state.attempts });

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
        console.debug('[SessionStartFallback] cancelled after fetch', { attemptIndex });
        stop('scope_lost', { clearLoadingTimeout: true });
        return;
      }

      const visibleMessages = buildVisibleConversationMessages(
        conversation?.messages || [],
        getSessionLanguage()
      );
      const latestAssistant = selectLatestAssistantResponse(visibleMessages);

      if (!latestAssistant) {
        console.debug('[SessionStartFallback] assistant absent', { attempt: state.attempts });
      }

      // Path 1: Explicit final marker present — accept immediately.
      if (hasVisibleAssistantMessage(visibleMessages) && isFinalAssistantMessage(latestAssistant.msg)) {
        console.debug('[SessionStartFallback] explicit final accepted', { attempt: state.attempts });
        const pollFinality = {
          isFinal: true,
          reason: 'explicit_final_status',
        };

        const updated = safeUpdateMessages(visibleMessages, 'SessionStartFallback', {
          pollFinality,
        });

        if (updated) {
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

      // Path 2: Markerless canonical assistant — require stability across two
      // consecutive authoritative reads before committing.
      if (hasVisibleAssistantMessage(visibleMessages) && latestAssistant) {
        const fingerprint = computeAssistantFingerprint(latestAssistant);
        if (fingerprint) {
          if (fingerprint === state.stabilityFingerprint) {
            state.stabilityCount += 1;
            console.debug('[SessionStartFallback] markerless stability count', {
              count: state.stabilityCount,
              required: MARKERLESS_STABILITY_REQUIRED,
            });

            if (state.stabilityCount >= MARKERLESS_STABILITY_REQUIRED) {
              console.debug('[SessionStartFallback] stable markerless snapshot accepted', {
                attempt: state.attempts,
              });
              const stableFinality = {
                isFinal: true,
                reason: 'session_start_post_completion_stable_snapshot',
              };

              const updated = safeUpdateMessages(visibleMessages, 'SessionStartFallback', {
                pollFinality: stableFinality,
              });

              if (updated) {
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
          } else {
            // Fingerprint changed — assistant identity or content shifted; reset
            // stability so an in-progress snapshot is never committed.
            console.debug('[SessionStartFallback] fingerprint changed/reset', {
              attempt: state.attempts,
            });
            state.stabilityFingerprint = fingerprint;
            state.stabilityCount = 1;
          }
        }
      }

      if (state.attempts >= lifecycle.maxPollAttempts) {
        console.debug('[SessionStartFallback] exhausted', { maxAttempts: lifecycle.maxPollAttempts });
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
      stabilityFingerprint: null,
      stabilityCount: 0,
    };
    scheduleAttempt(nextRunId, conversationId, 0, lifecycle);
  };

  return {
    start,
    stop,
    getState: () => ({ ...state }),
  };
}

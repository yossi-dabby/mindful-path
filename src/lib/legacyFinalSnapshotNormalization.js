/**
 * Legacy final-commit normalization for the active turn only.
 * Keeps every message up to and including the latest user message, then collapses
 * only the contiguous assistant block that immediately follows that user message
 * to the latest assistant record.
 * @param {Array} messages visible candidate snapshot
 * @returns {{messages:Array,activeUserIndex:number,canonicalAssistantIndex:number,collapsedAssistantCount:number}}
 */
export function normalizeLegacyActiveTurnFinalSnapshot(messages) {
  const list = Array.isArray(messages) ? messages : [];
  const activeUserIndex = findLastUserMessageIndex(list);

  if (activeUserIndex < 0) {
    return {
      messages: list,
      activeUserIndex: -1,
      canonicalAssistantIndex: -1,
      collapsedAssistantCount: 0,
    };
  }

  const contiguousAssistantIndexes = [];
  for (let i = activeUserIndex + 1; i < list.length; i += 1) {
    const msg = list[i];
    if (msg?.role !== 'assistant') break;
    contiguousAssistantIndexes.push(i);
  }

  if (contiguousAssistantIndexes.length <= 1) {
    const canonicalAssistantIndex = contiguousAssistantIndexes[0] ?? -1;
    return {
      messages: list,
      activeUserIndex,
      canonicalAssistantIndex,
      collapsedAssistantCount: 0,
    };
  }

  const canonicalAssistantIndex = contiguousAssistantIndexes[contiguousAssistantIndexes.length - 1];
  const dropIndexes = new Set(contiguousAssistantIndexes.slice(0, -1));
  const normalized = [];
  let normalizedCanonicalAssistantIndex = -1;
  for (let i = 0; i < list.length; i += 1) {
    if (dropIndexes.has(i)) continue;
    normalized.push(list[i]);
    if (i === canonicalAssistantIndex) {
      normalizedCanonicalAssistantIndex = normalized.length - 1;
    }
  }

  return {
    messages: normalized,
    activeUserIndex,
    canonicalAssistantIndex: normalizedCanonicalAssistantIndex,
    collapsedAssistantCount: dropIndexes.size,
  };
}

/**
 * Record-scoped feedback finality tagging.
 * Canonical assistant means the last assistant in the contiguous assistant run
 * that immediately follows a user message.
 * When final, only canonical assistants for each user turn are feedback-final.
 * When non-final, preserves previously verified finality without granting new ones.
 * @param {Array} messages normalized visible snapshot
 * @param {boolean} decisionIsFinal finality decision for this accepted snapshot
 */
export function applyRecordScopedAssistantFeedbackFinality(messages, decisionIsFinal) {
  const list = Array.isArray(messages) ? messages : [];
  const canonicalAssistantIndexes = getCanonicalAssistantIndexesByTurn(list);

  return list.map((msg, index) => {
    if (!msg || msg.role !== 'assistant') return msg;

    const hadVerifiedFinality = msg.metadata?.feedback_finality_verified === true;
    const isCanonicalTurnAssistant = canonicalAssistantIndexes.has(index);
    const feedbackFinalityVerified = decisionIsFinal === true
      ? isCanonicalTurnAssistant
      : hadVerifiedFinality;

    return {
      ...msg,
      metadata: {
        ...(msg.metadata || {}),
        feedback_finality_verified: feedbackFinalityVerified,
      },
    };
  });
}

/**
 * Persistent multi-turn progress suppression.
 *
 * For every user turn whose assistant block is followed by a subsequent user
 * message (i.e. a *completed historical turn*), the contiguous assistant block
 * after that user message is collapsed to its canonical final (last) record.
 * The latest user turn (active turn) is intentionally left untouched so
 * in-progress streaming records remain visible during the current turn.
 *
 * This invariant is reload-safe: given the same raw snapshot the result is
 * always the same, with no reliance on text, content length, or platform
 * progress markers.
 *
 * @param {Array} messages   Visible snapshot (already through buildVisibleConversationMessages).
 * @returns {Array}          New array with historical intermediate records removed.
 */
export function normalizeAllCompletedTurnsFinalSnapshot(messages) {
  const list = Array.isArray(messages) ? messages : [];
  if (list.length === 0) return list;

  // Locate the index of the last user message (active turn boundary).
  const lastUserIndex = findLastUserMessageIndex(list);

  // Collect all drop indexes: intermediate (non-canonical) assistant records in
  // every user turn that is strictly before the active/latest user message.
  const dropIndexes = new Set();

  for (let i = 0; i < list.length; i += 1) {
    if (list[i]?.role !== 'user') continue;
    // Only process completed historical turns — those with a subsequent user message.
    if (i >= lastUserIndex) continue;

    const contiguous = [];
    for (let j = i + 1; j < list.length; j += 1) {
      if (list[j]?.role !== 'assistant') break;
      contiguous.push(j);
    }

    // Drop all but the last (canonical final) record.
    if (contiguous.length > 1) {
      for (let k = 0; k < contiguous.length - 1; k += 1) {
        dropIndexes.add(contiguous[k]);
      }
    }

    // Advance past the assistant run we just evaluated.
    if (contiguous.length > 0) i = contiguous[contiguous.length - 1];
  }

  if (dropIndexes.size === 0) return list;

  return list.filter((_, idx) => !dropIndexes.has(idx));
}

function findLastUserMessageIndex(messages) {
  for (let i = messages.length - 1; i >= 0; i -= 1) {
    if (messages[i]?.role === 'user') return i;
  }
  return -1;
}

function getCanonicalAssistantIndexesByTurn(messages) {
  const indexes = new Set();

  for (let i = 0; i < messages.length; i += 1) {
    if (messages[i]?.role !== 'user') continue;

    let lastAssistantIndex = -1;
    let j = i + 1;
    for (; j < messages.length; j += 1) {
      if (messages[j]?.role !== 'assistant') {
        break;
      }
      lastAssistantIndex = j;
    }

    if (lastAssistantIndex >= 0) {
      indexes.add(lastAssistantIndex);
    }
    // Skip the assistant run we just scanned; the for-loop increment advances us
    // to the first non-assistant (if any), preventing assistant re-scan.
    i = Math.max(i, j - 1);
  }

  return indexes;
}

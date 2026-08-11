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
  const normalized = list.filter((_, index) => !dropIndexes.has(index));

  return {
    messages: normalized,
    activeUserIndex,
    canonicalAssistantIndex: normalized.indexOf(list[canonicalAssistantIndex]),
    collapsedAssistantCount: dropIndexes.size,
  };
}

export function applyRecordScopedAssistantFeedbackFinality(messages, decisionIsFinal) {
  const list = Array.isArray(messages) ? messages : [];
  const canonicalAssistantIndexes = getCanonicalAssistantIndexesByTurn(list);

  return list.map((msg, index) => {
    if (!msg || msg.role !== 'assistant') return msg;

    const hadVerifiedFinality = msg.metadata?.feedback_finality_verified === true;
    const isCanonicalTurnAssistant = canonicalAssistantIndexes.has(index);
    const feedbackFinalityVerified = decisionIsFinal === true
      ? isCanonicalTurnAssistant
      : hadVerifiedFinality && isCanonicalTurnAssistant;

    return {
      ...msg,
      metadata: {
        ...(msg.metadata || {}),
        feedback_finality_verified: feedbackFinalityVerified,
      },
    };
  });
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
    for (let j = i + 1; j < messages.length; j += 1) {
      if (messages[j]?.role !== 'assistant') break;
      lastAssistantIndex = j;
    }

    if (lastAssistantIndex >= 0) {
      indexes.add(lastAssistantIndex);
    }
  }

  return indexes;
}

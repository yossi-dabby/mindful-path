export function claimConversationMemoryWrite(writeTracker, conversationId) {
  if (!(writeTracker instanceof Set)) return false;
  if (typeof conversationId !== 'string' || conversationId.length === 0) return false;
  if (writeTracker.has(conversationId)) return false;
  writeTracker.add(conversationId);
  return true;
}

export function triggerConversationMemoryWriteOnce({
  writeTracker,
  conversationId,
  conversationMeta = {},
  messages,
  minMessages = 0,
  trigger,
  invoker,
  entities = null,
  runtimeSnapshot = null,
}) {
  if (minMessages > 0) {
    if (!Array.isArray(messages) || messages.length < minMessages) return false;
  }

  if (typeof trigger !== 'function') return false;
  if (!claimConversationMemoryWrite(writeTracker, conversationId)) return false;

  trigger(
    conversationId,
    conversationMeta || {},
    invoker,
    entities,
    runtimeSnapshot,
  );
  return true;
}

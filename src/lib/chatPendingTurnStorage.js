const STORAGE_KEY_PREFIX = 'v2_pending_turn_';
const ALLOWED_STATUSES = new Set(['pending', 'sent', 'generating', 'timed_out']);

function getStorageKey(conversationId) {
  return `${STORAGE_KEY_PREFIX}${conversationId}`;
}

function getSessionStorage() {
  if (typeof window === 'undefined' || !window?.sessionStorage) return null;
  return window.sessionStorage;
}

export function persistPendingTurn(conversationId, turn) {
  if (!conversationId || !turn) return;
  const storage = getSessionStorage();
  if (!storage) return;

  const payload = {
    client_request_id: typeof turn.client_request_id === 'string' ? turn.client_request_id : null,
    conversation_id: typeof turn.conversation_id === 'string' ? turn.conversation_id : conversationId,
    created_at: typeof turn.created_at === 'string' ? turn.created_at : null,
    status: typeof turn.status === 'string' ? turn.status : null,
  };

  if (!payload.client_request_id || !payload.conversation_id || !payload.created_at || !ALLOWED_STATUSES.has(payload.status)) {
    return;
  }

  try {
    storage.setItem(getStorageKey(conversationId), JSON.stringify(payload));
  } catch {
    // sessionStorage is best-effort only.
  }
}

export function restorePendingTurn(conversationId) {
  if (!conversationId) return null;
  const storage = getSessionStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(getStorageKey(conversationId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      !parsed ||
      typeof parsed.client_request_id !== 'string' ||
      typeof parsed.conversation_id !== 'string' ||
      typeof parsed.created_at !== 'string' ||
      !ALLOWED_STATUSES.has(parsed.status)
    ) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

export function clearPendingTurn(conversationId) {
  if (!conversationId) return;
  const storage = getSessionStorage();
  if (!storage) return;
  try {
    storage.removeItem(getStorageKey(conversationId));
  } catch {
    // sessionStorage is best-effort only.
  }
}

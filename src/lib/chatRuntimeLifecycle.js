const DEFAULT_POLL_DELAYS = Object.freeze([500, 1000, 2000, 4000, 6500]);
const DEFAULT_MAX_POLL_ATTEMPTS = 5;

export function calculateExpectedReplyCount(currentMessageCount) {
  return currentMessageCount + 2;
}

export function getAssistantIdentityKey(msg, index) {
  if (!msg || msg.role !== 'assistant') return null;
  const rawIndex = Number.isInteger(msg.__rawIndex) ? msg.__rawIndex : null;
  if (rawIndex !== null) return `raw:${rawIndex}`;
  if (msg.id) return `id:${msg.id}`;
  const createdAt = typeof msg.created_at === 'string' ? msg.created_at : null;
  if (createdAt) return `created:${createdAt}|idx:${index}`;
  return `idx:${index}|role:${msg.role}`;
}

export function getAssistantIdentitySource(msg) {
  if (!msg || msg.role !== 'assistant') return 'not_assistant';
  if (Number.isInteger(msg.__rawIndex)) return 'raw_index';
  if (msg.id) return 'id';
  if (typeof msg.created_at === 'string' && msg.created_at.length > 0) return 'created_at_index';
  return 'fallback_index';
}

export function deduplicateMessagesByLifecycleKeys(newMessages, options = {}) {
  const seen = new Set();
  const deduplicated = [];
  const duplicateKeys = [];
  let turnId = Number.isInteger(options.startingTurnId) ? options.startingTurnId : 0;

  for (let i = 0; i < newMessages.length; i++) {
    const msg = newMessages[i];

    let msgKey;
    if (msg.id) {
      msgKey = msg.id;
    } else if (msg.created_at) {
      msgKey = `${msg.role}-${msg.created_at}-${i}`;
    } else {
      if (msg.role === 'assistant' && !msg._turn_id) {
        turnId++;
        msg._turn_id = turnId;
      }
      msgKey = msg._turn_id ? `turn-${msg._turn_id}` : `idx-${i}-${msg.role}`;
    }

    if (!seen.has(msgKey)) {
      seen.add(msgKey);
      deduplicated.push(msg);
    } else {
      duplicateKeys.push(msgKey);
    }
  }

  return {
    deduplicated,
    duplicateKeys,
    duplicatesBlocked: duplicateKeys.length,
    nextTurnId: turnId,
  };
}

export function shouldSuppressSubscriptionEventWhileLoading(isLoading) {
  return isLoading === true;
}

export function getDefaultPollingLifecycle() {
  return {
    pollDelays: DEFAULT_POLL_DELAYS,
    maxPollAttempts: DEFAULT_MAX_POLL_ATTEMPTS,
  };
}

export function getPollingDelayForAttempt(attemptIndex, pollDelays = DEFAULT_POLL_DELAYS) {
  return pollDelays[Math.min(attemptIndex, pollDelays.length - 1)];
}

export function hasPollingAttemptTimedOut(pollAttempts, maxPollAttempts = DEFAULT_MAX_POLL_ATTEMPTS) {
  return pollAttempts >= maxPollAttempts;
}

export function selectLatestAssistantResponse(msgs) {
  const assistantEntries = (Array.isArray(msgs) ? msgs : [])
    .map((msg, index) => ({ msg, index }))
    .filter(({ msg }) => msg && msg.role === 'assistant');
  return assistantEntries.length > 0 ? assistantEntries[assistantEntries.length - 1] : null;
}

export function buildPendingCorrectionPrefix(correctionBlocks) {
  return correctionBlocks.length > 0 ? `${correctionBlocks.join('\n\n')}\n\n` : '';
}

export function buildOutboundUserMessageContent({
  runtimeSupplement,
  formulationSupplement,
  messageText,
}) {
  if (runtimeSupplement) {
    return runtimeSupplement + '\n\n' + messageText;
  }
  if (formulationSupplement) {
    return formulationSupplement + '\n\n' + messageText;
  }
  return messageText;
}

export function hasCorrectionBlockAttached(pendingCorrectionPrefix) {
  return typeof pendingCorrectionPrefix === 'string' && pendingCorrectionPrefix.length > 0;
}

const CORRECTION_BLOCK_PATTERN = /=== (?:FORMULATION CONTRACT CORRECTION|CURRENT-TURN GROUNDING CORRECTION) — NEXT TURN ONLY ===/;

export function containsCorrectionBlock(content) {
  if (typeof content !== 'string' || content.length === 0) return false;
  return CORRECTION_BLOCK_PATTERN.test(content);
}

export function wasCorrectionBlockSanitized(rawMessages, sanitizedMessages) {
  const raw = Array.isArray(rawMessages) ? rawMessages : [];
  const sanitized = Array.isArray(sanitizedMessages) ? sanitizedMessages : [];
  for (let i = 0; i < raw.length; i++) {
    const rawMsg = raw[i];
    if (!rawMsg || rawMsg.role !== 'user' || typeof rawMsg.content !== 'string') continue;
    if (!containsCorrectionBlock(rawMsg.content)) continue;
    const sanitizedMsg = sanitized[i];
    if (!sanitizedMsg || sanitizedMsg.role !== 'user') return true;
    if (!containsCorrectionBlock(sanitizedMsg.content)) return true;
  }
  return false;
}

export function buildS2DebugLifecycleDiagnostic(fields = {}) {
  const payload = {};
  if (typeof fields.correlation_mode === 'string') payload.correlation_mode = fields.correlation_mode;
  if (Number.isFinite(fields.active_request_count)) payload.active_request_count = fields.active_request_count;
  if (Number.isFinite(fields.expected_reply_count)) payload.expected_reply_count = fields.expected_reply_count;
  if (typeof fields.delivery_source === 'string') payload.delivery_source = fields.delivery_source;
  if (Number.isFinite(fields.polling_attempt)) payload.polling_attempt = fields.polling_attempt;
  if (typeof fields.polling_exhausted === 'boolean') payload.polling_exhausted = fields.polling_exhausted;
  if (typeof fields.subscription_event_suppressed === 'boolean') {
    payload.subscription_event_suppressed = fields.subscription_event_suppressed;
  }
  if (typeof fields.assistant_identity_source === 'string') {
    payload.assistant_identity_source = fields.assistant_identity_source;
  }
  if (typeof fields.correction_block_sanitized === 'boolean') {
    payload.correction_block_sanitized = fields.correction_block_sanitized;
  }
  if (typeof fields.internal_correction_pending === 'boolean') {
    payload.internal_correction_pending = fields.internal_correction_pending;
  }
  if (typeof fields.correction_type === 'string' || fields.correction_type === null) {
    payload.correction_type = fields.correction_type;
  }
  if (typeof fields.instruction_channel === 'string') {
    payload.instruction_channel = fields.instruction_channel;
  }
  if (typeof fields.outbound_content_clean === 'boolean') {
    payload.outbound_content_clean = fields.outbound_content_clean;
  }
  if (typeof fields.historical_block_detected === 'boolean') {
    payload.historical_block_detected = fields.historical_block_detected;
  }
  if (typeof fields.historical_block_sanitized === 'boolean') {
    payload.historical_block_sanitized = fields.historical_block_sanitized;
  }
  if (typeof fields.correction_consumed === 'boolean') {
    payload.correction_consumed = fields.correction_consumed;
  }
  if (typeof fields.conversation_scope_match === 'boolean') {
    payload.conversation_scope_match = fields.conversation_scope_match;
  }
  if (typeof fields.action_permitted === 'boolean' || fields.action_permitted === null) {
    payload.action_permitted = fields.action_permitted;
  }
  if (typeof fields.response_policy_enforced === 'boolean') {
    payload.response_policy_enforced = fields.response_policy_enforced;
  }
  if (typeof fields.lts_read_state === 'string') payload.lts_read_state = fields.lts_read_state;
  if (typeof fields.lts_warming_up === 'boolean') payload.lts_warming_up = fields.lts_warming_up;
  if (typeof fields.formulation_led_configured === 'boolean') {
    payload.formulation_led_configured = fields.formulation_led_configured;
  }
  if (typeof fields.formulation_led_injected === 'boolean') {
    payload.formulation_led_injected = fields.formulation_led_injected;
  }
  // Bounded V2 lifecycle fields (no message or clinical content).
  if (typeof fields.client_request_id === 'string' || fields.client_request_id === null) {
    payload.client_request_id = fields.client_request_id;
  }
  if (typeof fields.phase === 'string') payload.phase = fields.phase;
  if (typeof fields.response_correlated === 'boolean') payload.response_correlated = fields.response_correlated;
  if (typeof fields.safe_update_accepted === 'boolean') payload.safe_update_accepted = fields.safe_update_accepted;
  if (typeof fields.visible_commit_completed === 'boolean') payload.visible_commit_completed = fields.visible_commit_completed;
  if (typeof fields.active_turn_status === 'string' || fields.active_turn_status === null) {
    payload.active_turn_status = fields.active_turn_status;
  }
  if (typeof fields.polling_continues === 'boolean') payload.polling_continues = fields.polling_continues;
  if (typeof fields.rejection_reason === 'string') payload.rejection_reason = fields.rejection_reason;
  if (typeof fields.terminal_reason === 'string') payload.terminal_reason = fields.terminal_reason;
  if (typeof fields.conversation_id_hash === 'string' || fields.conversation_id_hash === null) {
    payload.conversation_id_hash = fields.conversation_id_hash;
  }
  if (typeof fields.generation_id === 'string' || fields.generation_id === null) {
    payload.generation_id = fields.generation_id;
  }
  if (typeof fields.assistant_stable_id === 'string' || fields.assistant_stable_id === null) {
    payload.assistant_stable_id = fields.assistant_stable_id;
  }
  if (Number.isInteger(fields.assistant_raw_index) || fields.assistant_raw_index === null) {
    payload.assistant_raw_index = fields.assistant_raw_index;
  }
  if (typeof fields.paired_user_stable_id === 'string' || fields.paired_user_stable_id === null) {
    payload.paired_user_stable_id = fields.paired_user_stable_id;
  }
  if (Number.isInteger(fields.paired_user_raw_index) || fields.paired_user_raw_index === null) {
    payload.paired_user_raw_index = fields.paired_user_raw_index;
  }
  if (typeof fields.language === 'string') payload.language = fields.language;
  if (typeof fields.guard_name === 'string') payload.guard_name = fields.guard_name;
  if (typeof fields.guard_mode === 'string') payload.guard_mode = fields.guard_mode;
  if (typeof fields.guard_version === 'string') payload.guard_version = fields.guard_version;
  if (typeof fields.guard_input_identity === 'string' || fields.guard_input_identity === null) {
    payload.guard_input_identity = fields.guard_input_identity;
  }
  if (typeof fields.guard_decision === 'string') payload.guard_decision = fields.guard_decision;
  if (Array.isArray(fields.guard_reason_codes)) payload.guard_reason_codes = fields.guard_reason_codes.slice(0, 8);
  if (typeof fields.replacement_created === 'boolean') payload.replacement_created = fields.replacement_created;
  if (typeof fields.replacement_terminal === 'boolean') payload.replacement_terminal = fields.replacement_terminal;
  if (typeof fields.decision_reused === 'boolean') payload.decision_reused = fields.decision_reused;
  return payload;
}

export const INTERNAL_CORRECTION_CHANNEL = Object.freeze({
  PROVEN_HIDDEN: 'proven_hidden',
  LOCAL_GUARD_ONLY: 'local_guard_only',
});

export const INTERNAL_CORRECTION_TYPES = Object.freeze({
  GROUNDING: 'grounding',
  FORMULATION: 'formulation',
});

function normalizeCorrectionType(value) {
  return value === INTERNAL_CORRECTION_TYPES.GROUNDING || value === INTERNAL_CORRECTION_TYPES.FORMULATION
    ? value
    : null;
}

function normalizeInstructionChannel(value) {
  return value === INTERNAL_CORRECTION_CHANNEL.PROVEN_HIDDEN || value === INTERNAL_CORRECTION_CHANNEL.LOCAL_GUARD_ONLY
    ? value
    : INTERNAL_CORRECTION_CHANNEL.LOCAL_GUARD_ONLY;
}

export function createInternalCorrectionIntent({
  correctionType,
  canonicalPreviousResponseAvailable = false,
  instructionChannel = INTERNAL_CORRECTION_CHANNEL.LOCAL_GUARD_ONLY,
  consumed = false,
} = {}) {
  const normalizedType = normalizeCorrectionType(correctionType);
  if (!normalizedType) return null;
  return {
    correction_type: normalizedType,
    canonical_previous_response_available: canonicalPreviousResponseAvailable === true,
    instruction_channel: normalizeInstructionChannel(instructionChannel),
    consumed: consumed === true,
  };
}

export function hasInternalCorrectionIntent(intent) {
  return !!createInternalCorrectionIntent({
    correctionType: intent?.correction_type,
    canonicalPreviousResponseAvailable: intent?.canonical_previous_response_available,
    instructionChannel: intent?.instruction_channel,
    consumed: intent?.consumed,
  });
}

export function consumeInternalCorrectionIntent(intent) {
  const normalized = createInternalCorrectionIntent({
    correctionType: intent?.correction_type,
    canonicalPreviousResponseAvailable: intent?.canonical_previous_response_available,
    instructionChannel: intent?.instruction_channel,
    consumed: true,
  });
  return normalized;
}

export function buildInternalCorrectionDiagnostic(intent, fields = {}) {
  const normalized = createInternalCorrectionIntent({
    correctionType: intent?.correction_type,
    canonicalPreviousResponseAvailable: intent?.canonical_previous_response_available,
    instructionChannel: intent?.instruction_channel,
    consumed: intent?.consumed,
  });
  return {
    internal_correction_pending: normalized ? normalized.consumed !== true : false,
    correction_type: normalized?.correction_type || null,
    instruction_channel: normalized?.instruction_channel || INTERNAL_CORRECTION_CHANNEL.LOCAL_GUARD_ONLY,
    correction_consumed: normalized ? normalized.consumed === true : false,
    conversation_scope_match: fields.conversationScopeMatch === true,
    outbound_content_clean: fields.outboundContentClean === true,
    historical_block_detected: fields.historicalBlockDetected === true,
    historical_block_sanitized: fields.historicalBlockSanitized === true,
  };
}

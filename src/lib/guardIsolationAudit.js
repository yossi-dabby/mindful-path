/**
 * @file src/lib/guardIsolationAudit.js
 *
 * Guard Isolation Audit — Phase 1: Deterministic Isolation
 * =========================================================
 *
 * Mode-aware wrappers for the two non-safety guards under audit:
 *   - applyFormulationGuardToConversationMessages
 *   - applyCurrentTurnGroundingGuardToConversationMessages
 *
 * Each wrapper supports three runtime modes (selectable via ?_s2= URL override):
 *   ENFORCE — guard evaluates and applies replacement (default; behavior-preserving).
 *   SHADOW  — guard evaluates and emits provenance but does NOT apply replacement.
 *   OFF     — guard is skipped; original messages pass through unchanged.
 *
 * Bounded provenance emitted per assistant candidate (no transcript text, no PII):
 *   client_request_id, assistant_raw_index, assistant_id,
 *   user_raw_index, user_id, language,
 *   guard_name, guard_mode, guard_decision, reason_codes,
 *   replacement_created, replacement_terminal,
 *   response_correlated, safe_update_accepted, visible_commit_completed,
 *   delivery_source.
 *
 * Safety invariants:
 *   - No safety/crisis/unsafe-output control is affected by any mode.
 *   - SHADOW and OFF only suppress non-safety clinical guards.
 *   - The formulation guard and grounding guard are not safety controls.
 *   - No transcript text, clinical content or PII is emitted in provenance.
 *
 * @module guardIsolationAudit
 */

import {
  applyFormulationGuardToConversationMessages,
  applyCurrentTurnGroundingGuardToConversationMessages,
} from '../components/utils/formulationContractGuard.js';

// ─── Constants ────────────────────────────────────────────────────────────────

/** Guard decision values emitted in provenance. */
export const GUARD_DECISION = Object.freeze({
  PASS: 'PASS',
  REPLACED: 'REPLACED',
  SKIPPED: 'SKIPPED',
});

/** Guard names for provenance logs. */
export const GUARD_NAME = Object.freeze({
  FORMULATION: 'applyFormulationGuardToConversationMessages',
  GROUNDING: 'applyCurrentTurnGroundingGuardToConversationMessages',
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Returns the stable string identity key for an assistant message, suitable for
 * provenance logs.  No content is included.
 *
 * @param {object|null|undefined} msg
 * @param {number} rawIndex
 * @returns {string|null}
 */
function _safeAssistantId(msg, rawIndex) {
  if (!msg) return null;
  if (typeof msg.id === 'string' && msg.id) return msg.id;
  if (typeof msg.created_at === 'string' && msg.created_at) {
    return `idx:${rawIndex}@${msg.created_at}`;
  }
  return `idx:${rawIndex}`;
}

/**
 * Returns the stable string identity key for a user message, suitable for
 * provenance logs.  No content is included.
 *
 * @param {object|null|undefined} msg
 * @param {number} rawIndex
 * @returns {string|null}
 */
function _safeUserId(msg, rawIndex) {
  if (!msg) return null;
  if (typeof msg.id === 'string' && msg.id) return msg.id;
  if (typeof msg.created_at === 'string' && msg.created_at) {
    return `idx:${rawIndex}@${msg.created_at}`;
  }
  return `idx:${rawIndex}`;
}

/**
 * Finds the raw index of the last assistant message whose metadata indicates
 * it was replaced by the given guard.
 *
 * @param {Array<object>} messages  — processed message array (may contain replacements)
 * @param {string}        metaKey   — e.g. 'formulation_guard_replaced'
 * @returns {number|null}
 */
function _findLastReplacedRawIndex(messages, metaKey) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.role === 'assistant' && msg.metadata?.[metaKey] === true) {
      return Number.isInteger(msg.__rawIndex) ? msg.__rawIndex : i;
    }
  }
  return null;
}

/**
 * Collects reason_codes from the last replaced assistant message.
 *
 * @param {Array<object>} messages
 * @param {string}        metaKey   — e.g. 'formulation_guard_reason_codes'
 * @returns {string[]}
 */
function _collectReasonCodes(messages, metaKey) {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg?.role === 'assistant' && Array.isArray(msg.metadata?.[metaKey])) {
      return msg.metadata[metaKey].slice(0, 8);
    }
  }
  return [];
}

/**
 * Returns true when any assistant message in `processed` differs from its
 * counterpart in `original` at the same array index.
 *
 * @param {Array<object>} original
 * @param {Array<object>} processed
 * @returns {boolean}
 */
function _anyReplacementApplied(original, processed) {
  for (let i = 0; i < processed.length && i < original.length; i++) {
    if (
      original[i]?.role === 'assistant' &&
      processed[i]?.role === 'assistant' &&
      processed[i]?.content !== original[i]?.content
    ) {
      return true;
    }
  }
  return false;
}

// ─── Provenance record builder ────────────────────────────────────────────────

/**
 * Builds a bounded, PII-free provenance record for one guard evaluation.
 *
 * All fields present in the record are safe to log to the console without
 * exposing transcript text, clinical content or PII.
 *
 * @param {object} opts
 * @param {string}          opts.guardName
 * @param {'ENFORCE'|'SHADOW'|'OFF'} opts.guardMode
 * @param {'PASS'|'REPLACED'|'SKIPPED'} opts.guardDecision
 * @param {string[]}        opts.reasonCodes
 * @param {boolean}         opts.replacementCreated
 * @param {boolean}         opts.replacementTerminal
 * @param {number|null}     opts.assistantRawIndex
 * @param {string|null}     opts.assistantId
 * @param {number|null}     opts.userRawIndex
 * @param {string|null}     opts.userId
 * @param {string}          opts.language
 * @param {string|null}     [opts.clientRequestId]
 * @param {string|null}     [opts.deliverySource]
 * @param {boolean|null}    [opts.responseCorrelated]
 * @param {boolean|null}    [opts.safeUpdateAccepted]
 * @param {boolean|null}    [opts.visibleCommitCompleted]
 * @returns {object}
 */
export function buildGuardProvenanceRecord({
  guardName,
  guardMode,
  guardDecision,
  reasonCodes,
  replacementCreated,
  replacementTerminal,
  assistantRawIndex,
  assistantId,
  userRawIndex,
  userId,
  language,
  clientRequestId = null,
  deliverySource = null,
  responseCorrelated = null,
  safeUpdateAccepted = null,
  visibleCommitCompleted = null,
}) {
  return Object.freeze({
    guard_name: guardName,
    guard_mode: guardMode,
    guard_decision: guardDecision,
    reason_codes: Array.isArray(reasonCodes) ? reasonCodes.slice(0, 8) : [],
    replacement_created: replacementCreated === true,
    replacement_terminal: replacementTerminal === true,
    assistant_raw_index: typeof assistantRawIndex === 'number' ? assistantRawIndex : null,
    assistant_id: typeof assistantId === 'string' ? assistantId : null,
    user_raw_index: typeof userRawIndex === 'number' ? userRawIndex : null,
    user_id: typeof userId === 'string' ? userId : null,
    language: typeof language === 'string' ? language : 'unknown',
    client_request_id: typeof clientRequestId === 'string' ? clientRequestId : null,
    delivery_source: typeof deliverySource === 'string' ? deliverySource : null,
    response_correlated: responseCorrelated,
    safe_update_accepted: safeUpdateAccepted,
    visible_commit_completed: visibleCommitCompleted,
  });
}

// ─── Mode-aware formulation guard wrapper ────────────────────────────────────

/**
 * Applies the formulation guard with the given mode.
 *
 * @param {Array<object>} rawMessages
 * @param {Array<object>} finalMessages   — message array entering the guard step
 * @param {object}        options
 * @param {string}        options.locale
 * @param {'ENFORCE'|'SHADOW'|'OFF'} options.mode
 * @param {string|null}   [options.clientRequestId]
 * @param {string|null}   [options.deliverySource]
 * @param {boolean|null}  [options.responseCorrelated]
 * @returns {{
 *   messages: Array<object>,
 *   pendingCorrection: object|null,
 *   provenance: object
 * }}
 */
export function applyFormulationGuardWithMode(rawMessages, finalMessages, options) {
  const locale = typeof options?.locale === 'string' ? options.locale : 'en';
  const mode = options?.mode === 'SHADOW' ? 'SHADOW'
    : options?.mode === 'OFF' ? 'OFF'
    : 'ENFORCE';
  const clientRequestId = options?.clientRequestId ?? null;
  const deliverySource = options?.deliverySource ?? null;
  const responseCorrelated = options?.responseCorrelated ?? null;

  const raw = Array.isArray(rawMessages) ? rawMessages : [];
  const final = Array.isArray(finalMessages) ? finalMessages : [];

  // ── OFF: skip guard entirely ───────────────────────────────────────────────
  if (mode === 'OFF') {
    const provenance = buildGuardProvenanceRecord({
      guardName: GUARD_NAME.FORMULATION,
      guardMode: 'OFF',
      guardDecision: GUARD_DECISION.SKIPPED,
      reasonCodes: [],
      replacementCreated: false,
      replacementTerminal: false,
      assistantRawIndex: null,
      assistantId: null,
      userRawIndex: null,
      userId: null,
      language: locale,
      clientRequestId,
      deliverySource,
      responseCorrelated,
      safeUpdateAccepted: null,
      visibleCommitCompleted: null,
    });
    return { messages: final, pendingCorrection: null, provenance };
  }

  // ── ENFORCE or SHADOW: run the guard ─────────────────────────────────────
  const guardResult = applyFormulationGuardToConversationMessages(raw, final, { locale });

  const replacedRawIndex = _findLastReplacedRawIndex(
    guardResult.messages,
    'formulation_guard_replaced'
  );
  const wasReplaced = replacedRawIndex !== null;
  const reasonCodes = wasReplaced
    ? _collectReasonCodes(guardResult.messages, 'formulation_guard_reason_codes')
    : [];

  const assistantRawIndex = (() => {
    // Use the replaced index when available; otherwise find the last assistant.
    if (wasReplaced) return replacedRawIndex;
    for (let i = final.length - 1; i >= 0; i--) {
      if (final[i]?.role === 'assistant') {
        return Number.isInteger(final[i].__rawIndex) ? final[i].__rawIndex : i;
      }
    }
    return null;
  })();

  const assistantMsg = assistantRawIndex !== null ? raw[assistantRawIndex] : null;
  const userRawIndex = (() => {
    if (assistantRawIndex === null) return null;
    for (let i = assistantRawIndex - 1; i >= 0; i--) {
      if (raw[i]?.role === 'user') return i;
    }
    return null;
  })();
  const userMsg = userRawIndex !== null ? raw[userRawIndex] : null;

  const guardDecision = wasReplaced ? GUARD_DECISION.REPLACED : GUARD_DECISION.PASS;

  const provenance = buildGuardProvenanceRecord({
    guardName: GUARD_NAME.FORMULATION,
    guardMode: mode,
    guardDecision,
    reasonCodes,
    replacementCreated: mode === 'ENFORCE' && wasReplaced,
    replacementTerminal: mode === 'ENFORCE' && wasReplaced,
    assistantRawIndex,
    assistantId: _safeAssistantId(assistantMsg, assistantRawIndex),
    userRawIndex,
    userId: _safeUserId(userMsg, userRawIndex),
    language: locale,
    clientRequestId,
    deliverySource,
    responseCorrelated,
    safeUpdateAccepted: null,
    visibleCommitCompleted: null,
  });

  if (mode === 'SHADOW') {
    // SHADOW: emit provenance but do NOT apply replacement.
    return { messages: final, pendingCorrection: null, provenance };
  }

  // ENFORCE: apply replacement.
  return {
    messages: guardResult.messages,
    pendingCorrection: guardResult.pendingCorrection,
    provenance,
  };
}

// ─── Mode-aware grounding guard wrapper ─────────────────────────────────────

/**
 * Applies the current-turn grounding guard with the given mode.
 *
 * @param {Array<object>} rawMessages
 * @param {Array<object>} finalMessages   — message array entering the guard step
 * @param {object}        options
 * @param {string}        options.locale
 * @param {'ENFORCE'|'SHADOW'|'OFF'} options.mode
 * @param {string|null}   [options.clientRequestId]
 * @param {string|null}   [options.deliverySource]
 * @param {boolean|null}  [options.responseCorrelated]
 * @returns {{
 *   messages: Array<object>,
 *   pendingCorrection: object|null,
 *   provenance: object
 * }}
 */
export function applyGroundingGuardWithMode(rawMessages, finalMessages, options) {
  const locale = typeof options?.locale === 'string' ? options.locale : 'en';
  const mode = options?.mode === 'SHADOW' ? 'SHADOW'
    : options?.mode === 'OFF' ? 'OFF'
    : 'ENFORCE';
  const clientRequestId = options?.clientRequestId ?? null;
  const deliverySource = options?.deliverySource ?? null;
  const responseCorrelated = options?.responseCorrelated ?? null;

  const raw = Array.isArray(rawMessages) ? rawMessages : [];
  const final = Array.isArray(finalMessages) ? finalMessages : [];

  // ── OFF: skip guard entirely ───────────────────────────────────────────────
  if (mode === 'OFF') {
    const provenance = buildGuardProvenanceRecord({
      guardName: GUARD_NAME.GROUNDING,
      guardMode: 'OFF',
      guardDecision: GUARD_DECISION.SKIPPED,
      reasonCodes: [],
      replacementCreated: false,
      replacementTerminal: false,
      assistantRawIndex: null,
      assistantId: null,
      userRawIndex: null,
      userId: null,
      language: locale,
      clientRequestId,
      deliverySource,
      responseCorrelated,
      safeUpdateAccepted: null,
      visibleCommitCompleted: null,
    });
    return { messages: final, pendingCorrection: null, provenance };
  }

  // ── ENFORCE or SHADOW: run the guard ─────────────────────────────────────
  const guardResult = applyCurrentTurnGroundingGuardToConversationMessages(raw, final, { locale });

  const replacedRawIndex = _findLastReplacedRawIndex(
    guardResult.messages,
    'current_turn_grounding_guard_replaced'
  );
  const wasReplaced = replacedRawIndex !== null;
  const reasonCodes = wasReplaced
    ? _collectReasonCodes(guardResult.messages, 'current_turn_grounding_guard_reason_codes')
    : [];

  const assistantRawIndex = (() => {
    if (wasReplaced) return replacedRawIndex;
    for (let i = final.length - 1; i >= 0; i--) {
      if (final[i]?.role === 'assistant') {
        return Number.isInteger(final[i].__rawIndex) ? final[i].__rawIndex : i;
      }
    }
    return null;
  })();

  const assistantMsg = assistantRawIndex !== null ? raw[assistantRawIndex] : null;
  const userRawIndex = (() => {
    if (assistantRawIndex === null) return null;
    for (let i = assistantRawIndex - 1; i >= 0; i--) {
      if (raw[i]?.role === 'user') return i;
    }
    return null;
  })();
  const userMsg = userRawIndex !== null ? raw[userRawIndex] : null;

  const guardDecision = wasReplaced ? GUARD_DECISION.REPLACED : GUARD_DECISION.PASS;

  const provenance = buildGuardProvenanceRecord({
    guardName: GUARD_NAME.GROUNDING,
    guardMode: mode,
    guardDecision,
    reasonCodes,
    replacementCreated: mode === 'ENFORCE' && wasReplaced,
    replacementTerminal: mode === 'ENFORCE' && wasReplaced,
    assistantRawIndex,
    assistantId: _safeAssistantId(assistantMsg, assistantRawIndex),
    userRawIndex,
    userId: _safeUserId(userMsg, userRawIndex),
    language: locale,
    clientRequestId,
    deliverySource,
    responseCorrelated,
    safeUpdateAccepted: null,
    visibleCommitCompleted: null,
  });

  if (mode === 'SHADOW') {
    // SHADOW: emit provenance but do NOT apply replacement.
    return { messages: final, pendingCorrection: null, provenance };
  }

  // ENFORCE: apply replacement.
  return {
    messages: guardResult.messages,
    pendingCorrection: guardResult.pendingCorrection,
    provenance,
  };
}

// ─── Provenance augmentation ─────────────────────────────────────────────────

/**
 * Returns a copy of a provenance record augmented with lifecycle outcome fields.
 *
 * Call this after safeUpdateMessages and the visible_commit reconcileSnapshot
 * call to complete the provenance chain.
 *
 * @param {object}       provenance        — record returned by applyFormulationGuardWithMode / applyGroundingGuardWithMode
 * @param {object}       lifecycle
 * @param {boolean|null} lifecycle.responseCorrelated
 * @param {boolean|null} lifecycle.safeUpdateAccepted
 * @param {boolean|null} lifecycle.visibleCommitCompleted
 * @returns {object}
 */
export function augmentProvenanceWithLifecycle(provenance, lifecycle) {
  if (!provenance || typeof provenance !== 'object') return provenance;
  return Object.freeze({
    ...provenance,
    response_correlated: lifecycle?.responseCorrelated ?? provenance.response_correlated,
    safe_update_accepted: lifecycle?.safeUpdateAccepted ?? provenance.safe_update_accepted,
    visible_commit_completed: lifecycle?.visibleCommitCompleted ?? provenance.visible_commit_completed,
  });
}

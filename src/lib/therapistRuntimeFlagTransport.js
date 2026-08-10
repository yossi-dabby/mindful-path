import { base44 } from '@/api/base44Client.js';

export const THERAPIST_RUNTIME_FLAG_SCHEMA = 'therapist-runtime-flags-v1';

export const THERAPIST_RUNTIME_FLAG_KEYS = Object.freeze([
  'THERAPIST_UPGRADE_ENABLED',
  'THERAPIST_UPGRADE_MEMORY_ENABLED',
  'THERAPIST_UPGRADE_SUMMARIZATION_ENABLED',
  'THERAPIST_UPGRADE_WORKFLOW_ENABLED',
  'THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED',
  'THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED',
  'THERAPIST_UPGRADE_SAFETY_MODE_ENABLED',
  'THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED',
  'THERAPIST_UPGRADE_FORMULATION_LED_ENABLED',
  'THERAPIST_UPGRADE_CONTINUITY_ENABLED',
  'THERAPIST_UPGRADE_STRATEGY_ENABLED',
  'THERAPIST_UPGRADE_LONGITUDINAL_ENABLED',
  'THERAPIST_UPGRADE_KNOWLEDGE_ENABLED',
  'THERAPIST_UPGRADE_COMPETENCE_ENABLED',
  'THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED',
  'CONTEXT_COMPOSER_V2_ENABLED',
  'CHAT_ORCHESTRATOR_V2_ENABLED',
]);

let _cachedRuntimeSnapshot = null;
let _inflightRuntimeSnapshotPromise = null;

export function getDefaultTherapistRuntimeFlags() {
  const flags = {};
  for (const key of THERAPIST_RUNTIME_FLAG_KEYS) {
    flags[key] = false;
  }
  return Object.freeze(flags);
}

function normalizeRuntimeFlags(rawFlags) {
  const normalized = {};
  for (const key of THERAPIST_RUNTIME_FLAG_KEYS) {
    normalized[key] = rawFlags?.[key] === true;
  }
  return Object.freeze(normalized);
}

export function normalizeTherapistRuntimeFlagSnapshotPayload(rawPayload) {
  if (!rawPayload || typeof rawPayload !== 'object') return null;
  if (rawPayload.schema !== THERAPIST_RUNTIME_FLAG_SCHEMA) return null;
  if (!rawPayload.flags || typeof rawPayload.flags !== 'object' || Array.isArray(rawPayload.flags)) {
    return null;
  }

  return Object.freeze({
    schema: THERAPIST_RUNTIME_FLAG_SCHEMA,
    flags: normalizeRuntimeFlags(rawPayload.flags),
    generated_at: typeof rawPayload.generated_at === 'string' ? rawPayload.generated_at : null,
  });
}

function buildUnavailableSnapshot() {
  return Object.freeze({
    schema: THERAPIST_RUNTIME_FLAG_SCHEMA,
    transport_status: 'unavailable',
    received: false,
    flags: getDefaultTherapistRuntimeFlags(),
    generated_at: null,
    fetched_at: new Date().toISOString(),
  });
}

function buildAvailableSnapshot(normalizedPayload) {
  return Object.freeze({
    schema: THERAPIST_RUNTIME_FLAG_SCHEMA,
    transport_status: 'available',
    received: true,
    flags: normalizedPayload.flags,
    generated_at: normalizedPayload.generated_at,
    fetched_at: new Date().toISOString(),
  });
}

export async function fetchTherapistRuntimeFlagSnapshot({ invokeFn } = {}) {
  if (_cachedRuntimeSnapshot) {
    return _cachedRuntimeSnapshot;
  }

  if (_inflightRuntimeSnapshotPromise) {
    return _inflightRuntimeSnapshotPromise;
  }

  const invoke =
    typeof invokeFn === 'function'
      ? invokeFn
      : () => base44.functions.invoke('therapistRuntimeFlagSnapshot');

  _inflightRuntimeSnapshotPromise = (async () => {
    try {
      const response = await invoke();
      const normalized = normalizeTherapistRuntimeFlagSnapshotPayload(response?.data ?? response ?? null);
      const snapshot = normalized ? buildAvailableSnapshot(normalized) : buildUnavailableSnapshot();
      _cachedRuntimeSnapshot = snapshot;
      return snapshot;
    } catch (_error) {
      const snapshot = buildUnavailableSnapshot();
      _cachedRuntimeSnapshot = snapshot;
      return snapshot;
    } finally {
      _inflightRuntimeSnapshotPromise = null;
    }
  })();

  return _inflightRuntimeSnapshotPromise;
}

export function buildTherapistRuntimeFlagTransportDiagnostic({
  snapshot,
  predictedTherapistWiring,
  currentActiveTherapistWiring,
} = {}) {
  const safeSnapshot = snapshot && typeof snapshot === 'object' ? snapshot : buildUnavailableSnapshot();

  return Object.freeze({
    schema: safeSnapshot.schema,
    transport_status: safeSnapshot.transport_status,
    received: safeSnapshot.received === true,
    flags: safeSnapshot.flags || getDefaultTherapistRuntimeFlags(),
    predicted_therapist_wiring: predictedTherapistWiring || 'unknown',
    current_active_therapist_wiring: currentActiveTherapistWiring || 'unknown',
    applied_to_active_wiring: false,
    fetched_at: safeSnapshot.fetched_at || null,
    generated_at: safeSnapshot.generated_at || null,
  });
}

export function __resetTherapistRuntimeFlagSnapshotCacheForTests() {
  _cachedRuntimeSnapshot = null;
  _inflightRuntimeSnapshotPromise = null;
}

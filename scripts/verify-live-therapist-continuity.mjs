import { createClient } from '@base44/sdk';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const EXPECTED_EMAIL = 'yosephdabby4@gmail.com';
const APP_ID = '69504b725a07f5aa75aeaf7d';
const REQUIRED_FLAGS = [
  'THERAPIST_RUNTIME_APPLY_ENABLED', 'THERAPIST_UPGRADE_ENABLED',
  'THERAPIST_UPGRADE_SUMMARIZATION_ENABLED', 'THERAPIST_UPGRADE_MEMORY_ENABLED',
];
const unwrap = (response) => response?.data ?? response;

export async function verifyLiveContinuity(create, credentials) {
  if (credentials.email !== EXPECTED_EMAIL || !credentials.password) {
    throw new Error('dedicated_test_credentials_required');
  }
  async function authenticatedClient() {
    const client = create({ appId: APP_ID });
    const login = await client.auth.loginViaEmailPassword(credentials.email, credentials.password);
    if (login?.user?.email?.toLowerCase() !== EXPECTED_EMAIL ||
        login.user.disabled || !login.user.is_verified) {
      throw new Error('dedicated_test_identity_rejected');
    }
    return client;
  }
  const first = await authenticatedClient();
  const snapshot = unwrap(await first.functions.invoke('therapistRuntimeFlagSnapshot', {}));
  if (snapshot?.schema !== 'therapist-runtime-flags-v1' ||
      REQUIRED_FLAGS.some((flag) => snapshot.flags?.[flag] !== true)) {
    throw new Error('memory_read_or_write_gate_disabled');
  }
  const firstSession = await first.agents.createConversation({
    agent_name: 'cbt_therapist',
    metadata: { synthetic_test_data: true, contains_personal_data: false,
      benchmark_id: 'post-1019-memory-roundtrip' },
  });
  if (!firstSession?.id) throw new Error('synthetic_session_creation_failed');
  const marker = 'Synthetic continuity verification: bounded study planning.';
  const written = unwrap(await first.functions.invoke('generateSessionSummary', {
    session_id: firstSession.id,
    session_date: new Date().toISOString(),
    session_summary: marker,
    follow_up_tasks: ['Synthetic verification only: review the agreed study plan.'],
  }));
  if (written?.success !== true || !written.id || written.safety_stub === true) {
    throw new Error('application_owned_summary_write_failed');
  }
  // Fresh authentication proves this does not depend on an in-memory client cache.
  const second = await authenticatedClient();
  const secondSession = await second.agents.createConversation({
    agent_name: 'cbt_therapist',
    metadata: { synthetic_test_data: true, contains_personal_data: false,
      benchmark_id: 'post-1019-memory-read-next-session' },
  });
  if (!secondSession?.id || secondSession.id === firstSession.id) {
    throw new Error('distinct_next_session_required');
  }
  const retrieved = unwrap(await second.functions.invoke('retrieveTherapistMemory', {}));
  if (retrieved?.gated || retrieved?.error || !Array.isArray(retrieved?.memories)) {
    throw new Error('structured_memory_read_failed');
  }
  const found = retrieved.memories.find((record) =>
    record._memory_id === written.id && record.session_id === firstSession.id);
  if (!found || found.session_summary !== marker ||
      !found.follow_up_tasks?.includes('Synthetic verification only: review the agreed study plan.')) {
    throw new Error('persisted_summary_not_retrievable_in_next_session');
  }
  return {
    schema: 'post-1019-continuity-evidence-v1',
    writeSucceeded: true, freshAuthenticatedReadSucceeded: true,
    distinctSessions: true, syntheticOnly: true, rawResponsesRetained: false,
    scope: 'backend write/read across authenticated sessions; not model use or UI end-to-end',
  };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  verifyLiveContinuity(createClient, {
    email: process.env.BASE44_LIVE_TEST_EMAIL?.trim().toLowerCase(),
    password: process.env.BASE44_LIVE_TEST_PASSWORD,
  }).then((evidence) => console.log(JSON.stringify(evidence)))
    .catch(() => {
      // Do not emit SDK errors, payloads, credentials, or private records.
      console.error('[live-continuity] verification failed; inspect step/flags without raw records');
      process.exitCode = 1;
    });
}

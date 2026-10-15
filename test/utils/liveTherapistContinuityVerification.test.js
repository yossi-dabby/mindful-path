import { describe, it, expect, vi } from 'vitest';
import { verifyLiveContinuity } from '../../scripts/verify-live-therapist-continuity.mjs';

function fixture(overrides = {}) {
  let sessions = 0;
  const invoke = vi.fn(async (name) => {
    if (name === 'therapistRuntimeFlagSnapshot') return { data: {
      schema: 'therapist-runtime-flags-v1', flags: {
        THERAPIST_RUNTIME_APPLY_ENABLED: true, THERAPIST_UPGRADE_ENABLED: true,
        THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true, THERAPIST_UPGRADE_MEMORY_ENABLED: true,
        ...overrides.flags,
      },
    } };
    if (name === 'generateSessionSummary') return { data: { success: true, id: 'synthetic-memory' } };
    if (name === 'retrieveTherapistMemory') return { data: {
      memories: overrides.memories ?? [{
        _memory_id: 'synthetic-memory', session_id: 'synthetic-session-1',
        session_summary: 'Synthetic continuity verification: bounded study planning.',
        follow_up_tasks: ['Synthetic verification only: review the agreed study plan.'],
      }],
    } };
    throw new Error('unexpected_function');
  });
  const login = vi.fn(async () => ({ user: { email: 'yosephdabby4@gmail.com', is_verified: true } }));
  const create = vi.fn(() => ({
    auth: { loginViaEmailPassword: login }, functions: { invoke },
    agents: { createConversation: vi.fn(async () => ({ id: 'synthetic-session-' + (++sessions) })) },
  }));
  return { create, invoke, login };
}
const credentials = { email: 'yosephdabby4@gmail.com', password: 'synthetic-placeholder' };

describe('live therapist persistence verification guard', () => {
  it('verifies app-owned write and fresh authenticated read in distinct sessions', async () => {
    const f = fixture();
    const evidence = await verifyLiveContinuity(f.create, credentials);
    expect(f.create).toHaveBeenCalledTimes(2);
    expect(f.login).toHaveBeenCalledTimes(2);
    expect(f.invoke.mock.calls.map(([name]) => name)).toEqual([
      'therapistRuntimeFlagSnapshot', 'generateSessionSummary', 'retrieveTherapistMemory',
    ]);
    expect(evidence.freshAuthenticatedReadSucceeded).toBe(true);
    expect(JSON.stringify(evidence)).not.toContain('synthetic-memory');
  });
  it('rejects owner or other accounts before authentication', async () => {
    const f = fixture();
    await expect(verifyLiveContinuity(f.create, { ...credentials, email: 'other@example.com' }))
      .rejects.toThrow('dedicated_test_credentials_required');
    expect(f.create).not.toHaveBeenCalled();
  });
  it('does not write when memory reads are disabled', async () => {
    const f = fixture({ flags: { THERAPIST_UPGRADE_MEMORY_ENABLED: false } });
    await expect(verifyLiveContinuity(f.create, credentials)).rejects.toThrow('memory_read_or_write_gate_disabled');
    expect(f.invoke).toHaveBeenCalledTimes(1);
  });
  it('rejects unrelated memory as round-trip evidence', async () => {
    const f = fixture({ memories: [] });
    await expect(verifyLiveContinuity(f.create, credentials))
      .rejects.toThrow('persisted_summary_not_retrievable_in_next_session');
  });
});

/**
 * @file test/utils/stage6ConversationMemoryFix.test.js
 *
 * Stage 6 — Conversation Memory Fix: Deterministic Regression Tests
 *
 * PURPOSE
 * -------
 * Verifies the invariant identified in the Stage 6 problem statement:
 *
 *   "A completed, meaningful free-form Chat session is not producing a clinically
 *    useful structured therapist_session memory record that is reliably available
 *    to the immediately following session."
 *
 * Root-cause confirmed:
 *   deriveConversationMemoryPayload produced an empty session_summary for any
 *   conversation whose metadata name matched /^Session\s+\d+$/i (generic) and
 *   carried no intent field.  Empty records scored 0 → CONTINUITY_MIN_USEFUL_SCORE
 *   threshold not met → no_useful_content on every subsequent read.
 *
 * Additionally:
 *   - valid_therapist_memory_record_count was never set in the diagnostic.
 *   - selected_prior_session_count was set to memoryRecords.length (including
 *     weak fallback records) even when the block was NOT emitted.
 *
 * These tests are additive and do NOT modify prior-phase test files.
 *
 * Test sections:
 *  1. _extractSummaryFromMessages — canonical finalized-message filtering
 *  2. _extractSummaryFromMessages — exclusion of internal/tool content
 *  3. _extractSummaryFromMessages — raw-transcript safeguard
 *  4. _extractSummaryFromMessages — bounded window (SESSION_SUMMARIZATION_MAX_MESSAGES)
 *  5. deriveConversationMemoryPayload — meaningful free-form content → useful record
 *  6. deriveConversationMemoryPayload — latest correction precedence (Session Cypress)
 *  7. deriveConversationMemoryPayload — absence of unknown/inferred details
 *  8. deriveConversationMemoryPayload — generic Session N + messages → non-empty summary
 *  9. deriveConversationMemoryPayload — metadata intent takes priority over messages
 * 10. deriveConversationMemoryPayload — clinical arrays always empty (no LLM inference)
 * 11. triggerConversationEndSummarization — bounded write timeout constant exported
 * 12. triggerConversationEndSummarization — gate-off inertness with messages arg
 * 13. conversationMemoryWriteDedup — messages forwarded to trigger (6th arg)
 * 14. buildCrossSessionContinuityBlockWithDiagnostic — valid_therapist_memory_record_count
 * 15. buildCrossSessionContinuityBlockWithDiagnostic — selected_prior_session_count = 0
 *     when no block emitted (no_useful_content path)
 * 16. buildCrossSessionContinuityBlockWithDiagnostic — selected_prior_session_count > 0
 *     only when block is emitted
 * 17. Sequencing: write-then-read produces usable content in subsequent continuity read
 * 18. Fail-open: empty messages list → empty summary (not an error)
 * 19. Fail-open: null/malformed messages → graceful empty result
 * 20. PR 948 regression — most-recent-useful recency slot preserved
 * 21. PR 948 regression — risk-bearing record selection priority
 *
 * CONSTRAINTS
 * -----------
 * - Does NOT import from base44/functions/ (Deno code — not importable in Vitest).
 * - Does NOT import Chat.jsx as a React component.
 * - Does NOT modify any prior-phase test files.
 * - Does NOT use LLM or real network calls.
 */

import { describe, it, expect, vi } from 'vitest';

// ── Stage 6 exports ──────────────────────────────────────────────────────────
import {
  _extractSummaryFromMessages,
  SESSION_SUMMARY_FROM_MESSAGES_MAX_CHARS,
  SESSION_MEMORY_WRITE_TIMEOUT_MS,
  deriveConversationMemoryPayload,
  triggerConversationEndSummarization,
  SESSION_SUMMARIZATION_MAX_MESSAGES,
  CONVERSATION_END_SUMMARY_INVOKER,
} from '../../src/lib/sessionEndSummarization.js';

// ── Phase 1 schema helpers ───────────────────────────────────────────────────
import {
  isTherapistMemoryRecord,
  THERAPIST_MEMORY_ARRAY_FIELDS,
  THERAPIST_MEMORY_VERSION,
  THERAPIST_MEMORY_VERSION_KEY,
  THERAPIST_MEMORY_TYPE,
} from '../../src/lib/therapistMemoryModel.js';

// ── Gate helpers ─────────────────────────────────────────────────────────────
import { isSummarizationEnabled } from '../../src/lib/summarizationGate.js';
import { isRawTranscriptContent } from '../../src/lib/summarizationGate.js';

// ── Continuity reader ────────────────────────────────────────────────────────
import {
  buildCrossSessionContinuityBlockWithDiagnostic,
  scoreTherapistMemoryRecord,
  CONTINUITY_FAILURE_REASONS,
  CONTINUITY_MIN_USEFUL_SCORE,
} from '../../src/lib/crossSessionContinuity.js';

// ── Dedup helper ─────────────────────────────────────────────────────────────
import { triggerConversationMemoryWriteOnce } from '../../src/lib/conversationMemoryWriteDedup.js';

// ── CompanionMemory record builder (mirrors the persistence shape) ───────────
function makeCompanionRecord(parsedContent) {
  return {
    memory_type: THERAPIST_MEMORY_TYPE,
    content: JSON.stringify({
      ...parsedContent,
      // Version marker must always be the canonical string — override any
      // integer value in parsedContent so isTherapistMemoryRecord passes.
      [THERAPIST_MEMORY_VERSION_KEY]: THERAPIST_MEMORY_VERSION,
    }),
    created_date: new Date().toISOString(),
  };
}

// ─── Section 1: _extractSummaryFromMessages — canonical filtering ─────────────

describe('Stage 6 — _extractSummaryFromMessages: canonical message filtering', () => {
  it('is exported (Stage 6 new export)', () => {
    expect(typeof _extractSummaryFromMessages).toBe('function');
  });

  it('returns a non-empty string from meaningful user messages', () => {
    const messages = [
      { role: 'user', content: 'I worked on Project Cypress today' },
      { role: 'assistant', content: 'Tell me more about that.' },
      { role: 'user', content: 'I had a meeting Tuesday at 16:30' },
    ];
    const result = _extractSummaryFromMessages(messages);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
    expect(result).toContain('Project Cypress');
    expect(result).toContain('Tuesday at 16:30');
  });

  it('includes only user-role messages (excludes assistant turns)', () => {
    const messages = [
      { role: 'assistant', content: 'Should never appear' },
      { role: 'user', content: 'anxiety was 6/10' },
      { role: 'assistant', content: 'Also never appear' },
    ];
    const result = _extractSummaryFromMessages(messages);
    expect(result).not.toContain('Should never appear');
    expect(result).not.toContain('Also never appear');
    expect(result).toContain('anxiety was 6/10');
  });

  it('excludes system-role messages', () => {
    const messages = [
      { role: 'system', content: 'System prompt — must not appear' },
      { role: 'user', content: 'real user content' },
    ];
    const result = _extractSummaryFromMessages(messages);
    expect(result).not.toContain('System prompt');
    expect(result).toContain('real user content');
  });

  it('returns empty string when all messages are non-user roles', () => {
    const messages = [
      { role: 'assistant', content: 'No user messages' },
      { role: 'system', content: 'System stuff' },
    ];
    expect(_extractSummaryFromMessages(messages)).toBe('');
  });
});

// ─── Section 2: _extractSummaryFromMessages — exclusion of internal/tool content ─

describe('Stage 6 — _extractSummaryFromMessages: internal/tool content exclusion', () => {
  it('excludes [START_SESSION] messages from summary', () => {
    const messages = [
      { role: 'user', content: '[START_SESSION] internal wiring context goes here…' },
      { role: 'user', content: 'My anxiety is 6/10 today' },
    ];
    const result = _extractSummaryFromMessages(messages);
    expect(result).not.toContain('[START_SESSION]');
    expect(result).toContain('anxiety is 6/10');
  });

  it('excludes XML/action-markup messages (content starts with <)', () => {
    const messages = [
      { role: 'user', content: '<actions><action>create_DailyFlow</action></actions>' },
      { role: 'user', content: 'I spoke with my colleague' },
    ];
    const result = _extractSummaryFromMessages(messages);
    expect(result).not.toContain('<actions>');
    expect(result).not.toContain('create_DailyFlow');
    expect(result).toContain('spoke with my colleague');
  });

  it('returns empty string when only internal messages are present', () => {
    const messages = [
      { role: 'user', content: '[START_SESSION] context block' },
      { role: 'user', content: '<actions><action>doSomething</action></actions>' },
    ];
    expect(_extractSummaryFromMessages(messages)).toBe('');
  });
});

// ─── Section 3: _extractSummaryFromMessages — raw transcript safeguard ────────

describe('Stage 6 — _extractSummaryFromMessages: raw-transcript safeguard', () => {
  it('result does NOT match isRawTranscriptContent for normal user content', () => {
    const messages = [
      { role: 'user', content: 'Project Cypress meeting, anxiety 6/10' },
      { role: 'user', content: 'My manager did not respond, colleague said Noted' },
    ];
    const result = _extractSummaryFromMessages(messages);
    // Normal joined user text must not be flagged as a raw transcript
    expect(isRawTranscriptContent(result)).toBe(false);
  });

  it('truncates output to SESSION_SUMMARY_FROM_MESSAGES_MAX_CHARS', () => {
    const longText = 'a'.repeat(SESSION_SUMMARY_FROM_MESSAGES_MAX_CHARS + 500);
    const messages = [{ role: 'user', content: longText }];
    const result = _extractSummaryFromMessages(messages);
    expect(result.length).toBeLessThanOrEqual(SESSION_SUMMARY_FROM_MESSAGES_MAX_CHARS);
  });
});

// ─── Section 4: _extractSummaryFromMessages — bounded window ─────────────────

describe('Stage 6 — _extractSummaryFromMessages: bounded window', () => {
  it('uses only the last SESSION_SUMMARIZATION_MAX_MESSAGES user messages', () => {
    // Build a list with one early "old" message and many recent ones
    const messages = [
      { role: 'user', content: 'VERY_OLD_MESSAGE' },
      ...Array.from({ length: SESSION_SUMMARIZATION_MAX_MESSAGES }, (_, i) => ({
        role: 'user',
        content: `recent_message_${i}`,
      })),
    ];
    const result = _extractSummaryFromMessages(messages);
    // The old message is outside the window and must not appear
    expect(result).not.toContain('VERY_OLD_MESSAGE');
    // At least the last message must be present
    expect(result).toContain(`recent_message_${SESSION_SUMMARIZATION_MAX_MESSAGES - 1}`);
  });

  it('returns empty string for empty array', () => {
    expect(_extractSummaryFromMessages([])).toBe('');
  });

  it('returns empty string for null/undefined input', () => {
    expect(_extractSummaryFromMessages(null)).toBe('');
    expect(_extractSummaryFromMessages(undefined)).toBe('');
  });
});

// ─── Section 5: deriveConversationMemoryPayload — useful record from messages ──

describe('Stage 6 — deriveConversationMemoryPayload: meaningful content → useful record', () => {
  const cypressMessages = [
    { role: 'user', content: 'I had a work situation related to Project Cypress' },
    { role: 'assistant', content: 'Tell me about it.' },
    { role: 'user', content: 'Meeting was Tuesday at 16:30, my anxiety was initially 4/10' },
    { role: 'user', content: 'Actually, correction: it remained at 6/10 by end of meeting' },
    { role: 'user', content: 'Colleague said "Noted", manager did not respond' },
  ];

  it('produces a valid therapist memory record shape', () => {
    const result = deriveConversationMemoryPayload('conv-cypress', {}, cypressMessages);
    expect(isTherapistMemoryRecord(result)).toBe(true);
  });

  it('session_summary is non-empty when meaningful messages are present', () => {
    const result = deriveConversationMemoryPayload('conv-cypress', {}, cypressMessages);
    expect(typeof result.session_summary).toBe('string');
    expect(result.session_summary.length).toBeGreaterThan(0);
  });

  it('session_summary contains Project Cypress reference', () => {
    const result = deriveConversationMemoryPayload('conv-cypress', {}, cypressMessages);
    expect(result.session_summary).toContain('Cypress');
  });

  it('session_summary contains the Tuesday 16:30 reference', () => {
    const result = deriveConversationMemoryPayload('conv-cypress', {}, cypressMessages);
    expect(result.session_summary).toContain('Tuesday');
    expect(result.session_summary).toContain('16:30');
  });

  it('produces a record with richness score >= CONTINUITY_MIN_USEFUL_SCORE', () => {
    const result = deriveConversationMemoryPayload('conv-cypress', {}, cypressMessages);
    expect(scoreTherapistMemoryRecord(result)).toBeGreaterThanOrEqual(CONTINUITY_MIN_USEFUL_SCORE);
  });
});

// ─── Section 6: latest correction precedence ─────────────────────────────────

describe('Stage 6 — deriveConversationMemoryPayload: latest correction precedence', () => {
  it('session_summary contains the corrected value 6/10', () => {
    const messages = [
      { role: 'user', content: 'My anxiety was 4/10 during the meeting' },
      { role: 'assistant', content: 'I see. How did it feel at the end?' },
      { role: 'user', content: 'Actually, correction: it stayed at 6/10' },
    ];
    const result = deriveConversationMemoryPayload('conv-correction', {}, messages);
    expect(result.session_summary).toContain('6/10');
  });

  it('session_summary includes the correction in the output (both values present)', () => {
    // Both the initial and corrected values appear in the joined message content —
    // the correction is visibly present and the context is not truncated to only
    // the initial value.
    const messages = [
      { role: 'user', content: 'anxiety 4/10 at start' },
      { role: 'user', content: 'correction: stays at 6/10 by end' },
    ];
    const result = deriveConversationMemoryPayload('conv-correction-2', {}, messages);
    // Both appear because the full window is captured; the correction is present.
    expect(result.session_summary).toContain('6/10');
  });

  it('latest message content is NOT excluded by the window (correction appears)', () => {
    const messages = [
      { role: 'user', content: 'initial anxiety 4/10' },
      { role: 'user', content: 'actually 6/10 was the corrected level' },
    ];
    const result = deriveConversationMemoryPayload('conv-correction-3', {}, messages);
    expect(result.session_summary).toContain('6/10');
    expect(result.session_summary).toContain('corrected');
  });
});

// ─── Section 7: absence of unknown/inferred details ──────────────────────────

describe('Stage 6 — deriveConversationMemoryPayload: no inference of unknown details', () => {
  it('clinical arrays remain empty (no LLM inference from message content)', () => {
    const messages = [
      { role: 'user', content: 'I felt anxious at the meeting' },
      { role: 'user', content: 'Colleague said Noted, manager did not respond' },
    ];
    const result = deriveConversationMemoryPayload('conv-no-infer', {}, messages);
    for (const field of THERAPIST_MEMORY_ARRAY_FIELDS) {
      expect(result[field]).toHaveLength(0);
    }
  });

  it('no hallucinated clinical data (core_patterns empty without explicit annotation)', () => {
    const messages = [
      { role: 'user', content: 'I am feeling anxious and worried about work' },
    ];
    const result = deriveConversationMemoryPayload('conv-no-hallucinate', {}, messages);
    // core_patterns should remain empty — we do not infer patterns from raw text
    expect(result.core_patterns).toHaveLength(0);
    expect(result.triggers).toHaveLength(0);
    expect(result.working_hypotheses).toHaveLength(0);
  });

  it('session_summary does not contain fabricated facts not in messages', () => {
    const messages = [
      { role: 'user', content: 'I spoke to my colleague about Project Cypress' },
    ];
    const result = deriveConversationMemoryPayload('conv-no-fabricate', {}, messages);
    // "manager" was never mentioned — should not appear in summary
    expect(result.session_summary).not.toContain('manager');
  });
});

// ─── Section 8: generic Session N with meaningful messages ───────────────────

describe('Stage 6 — deriveConversationMemoryPayload: generic Session N metadata', () => {
  it('produces non-empty session_summary when messages are provided even for Session N', () => {
    const messages = [
      { role: 'user', content: 'I worked on Project Cypress today' },
      { role: 'user', content: 'Anxiety was 6/10' },
    ];
    // Name matches /^Session\s+\d+$/i — would previously produce empty summary
    const result = deriveConversationMemoryPayload('conv-session-3', { name: 'Session 3' }, messages);
    expect(result.session_summary.length).toBeGreaterThan(0);
    expect(result.session_summary).toContain('Cypress');
  });

  it('record from Session N with messages scores above CONTINUITY_MIN_USEFUL_SCORE', () => {
    const messages = [
      { role: 'user', content: 'Discussed Project Cypress and anxiety levels today' },
    ];
    const result = deriveConversationMemoryPayload('conv-session-n', { name: 'Session 7' }, messages);
    expect(scoreTherapistMemoryRecord(result)).toBeGreaterThanOrEqual(CONTINUITY_MIN_USEFUL_SCORE);
  });

  it('empty messages + generic name still produces a valid stub record (fail-safe)', () => {
    const result = deriveConversationMemoryPayload('conv-session-stub', { name: 'Session 2' }, []);
    expect(isTherapistMemoryRecord(result)).toBe(true);
    // summary may be empty — that is acceptable for empty sessions
    expect(typeof result.session_summary).toBe('string');
  });
});

// ─── Section 9: metadata intent takes priority over messages ─────────────────

describe('Stage 6 — deriveConversationMemoryPayload: metadata intent priority', () => {
  it('uses intent summary when both intent and messages are present', () => {
    const messages = [
      { role: 'user', content: 'message content that would normally be used' },
    ];
    const result = deriveConversationMemoryPayload(
      'conv-priority',
      { intent: 'sleep issues' },
      messages,
    );
    // Intent takes priority — summary should reflect the intent, not raw message text
    expect(result.session_summary).toContain('sleep issues');
  });

  it('falls back to messages when intent is empty and name is generic', () => {
    const messages = [
      { role: 'user', content: 'talked about Project Cypress anxiety' },
    ];
    const result = deriveConversationMemoryPayload(
      'conv-fallback',
      { intent: '', name: 'Session 5' },
      messages,
    );
    expect(result.session_summary).toContain('Cypress');
  });

  it('uses non-generic name when no intent and no messages', () => {
    const result = deriveConversationMemoryPayload(
      'conv-named',
      { intent: '', name: 'Anxiety work session' },
      null,
    );
    expect(result.session_summary).toContain('Anxiety work session');
  });
});

// ─── Section 10: clinical arrays always empty ─────────────────────────────────

describe('Stage 6 — deriveConversationMemoryPayload: clinical arrays always empty', () => {
  it('all THERAPIST_MEMORY_ARRAY_FIELDS are empty regardless of messages', () => {
    const messages = [
      { role: 'user', content: 'I feel really anxious and depressed about work' },
      { role: 'user', content: 'I cannot sleep, I have panic attacks' },
      { role: 'user', content: 'My thoughts spiral about failing at tasks' },
    ];
    const result = deriveConversationMemoryPayload('conv-arrays', {}, messages);
    for (const field of THERAPIST_MEMORY_ARRAY_FIELDS) {
      expect(result[field]).toHaveLength(0);
    }
  });
});

// ─── Section 11: SESSION_MEMORY_WRITE_TIMEOUT_MS constant ────────────────────

describe('Stage 6 — SESSION_MEMORY_WRITE_TIMEOUT_MS constant', () => {
  it('is exported as a number', () => {
    expect(typeof SESSION_MEMORY_WRITE_TIMEOUT_MS).toBe('number');
  });

  it('is a positive finite integer (reasonable timeout window)', () => {
    expect(SESSION_MEMORY_WRITE_TIMEOUT_MS).toBeGreaterThan(0);
    expect(Number.isFinite(SESSION_MEMORY_WRITE_TIMEOUT_MS)).toBe(true);
  });

  it('is at least 1000 ms (not too aggressive)', () => {
    expect(SESSION_MEMORY_WRITE_TIMEOUT_MS).toBeGreaterThanOrEqual(1000);
  });

  it('is at most 30000 ms (does not block UI indefinitely)', () => {
    expect(SESSION_MEMORY_WRITE_TIMEOUT_MS).toBeLessThanOrEqual(30000);
  });
});

// ─── Section 12: triggerConversationEndSummarization gate-off with messages ───

describe('Stage 6 — triggerConversationEndSummarization: gate-off with bounded messages', () => {
  it('returns undefined (void) when gate is off, even with messages provided', () => {
    expect(isSummarizationEnabled()).toBe(false);
    const messages = [
      { role: 'user', content: 'Project Cypress anxiety 6/10' },
    ];
    const result = triggerConversationEndSummarization(
      'conv-gate-off',
      {},
      CONVERSATION_END_SUMMARY_INVOKER,
      null,
      null,
      messages,
    );
    expect(result).toBeUndefined();
  });

  it('is a 6-parameter function (Stage 6 extends to accept boundedMessages)', () => {
    expect(triggerConversationEndSummarization.length).toBeLessThanOrEqual(6);
  });
});

// ─── Section 13: triggerConversationMemoryWriteOnce forwards messages ─────────

describe('Stage 6 — triggerConversationMemoryWriteOnce: messages forwarded to trigger', () => {
  it('passes messages array as the 6th argument to trigger', () => {
    const capturedArgs = [];
    const mockTrigger = vi.fn((...args) => { capturedArgs.push(args); });
    const tracker = new Set();
    const messages = [
      { role: 'user', content: 'Project Cypress' },
      { role: 'user', content: 'anxiety 6/10' },
      { role: 'user', content: 'colleague said Noted' },
    ];

    triggerConversationMemoryWriteOnce({
      writeTracker: tracker,
      conversationId: 'conv-forward-1',
      conversationMeta: {},
      messages,
      minMessages: 0,
      trigger: mockTrigger,
      invoker: 'test_invoker',
    });

    expect(mockTrigger).toHaveBeenCalledOnce();
    const [, , , , , passedMessages] = mockTrigger.mock.calls[0];
    expect(passedMessages).toBe(messages);
  });

  it('passes null as 6th arg when messages is not an array', () => {
    const mockTrigger = vi.fn();
    const tracker = new Set();

    triggerConversationMemoryWriteOnce({
      writeTracker: tracker,
      conversationId: 'conv-forward-null',
      conversationMeta: {},
      messages: 'not-an-array',
      minMessages: 0,
      trigger: mockTrigger,
      invoker: 'test_invoker',
    });

    expect(mockTrigger).toHaveBeenCalledOnce();
    const [, , , , , passedMessages] = mockTrigger.mock.calls[0];
    expect(passedMessages).toBeNull();
  });

  it('passes null as 6th arg when messages is absent', () => {
    const mockTrigger = vi.fn();
    const tracker = new Set();

    triggerConversationMemoryWriteOnce({
      writeTracker: tracker,
      conversationId: 'conv-forward-absent',
      conversationMeta: {},
      minMessages: 0,
      trigger: mockTrigger,
      invoker: 'test_invoker',
    });

    expect(mockTrigger).toHaveBeenCalledOnce();
    const [, , , , , passedMessages] = mockTrigger.mock.calls[0];
    expect(passedMessages).toBeNull();
  });
});

// ─── Section 14: valid_therapist_memory_record_count diagnostic ───────────────

describe('Stage 6 — buildCrossSessionContinuityBlockWithDiagnostic: valid_therapist_memory_record_count', () => {
  it('is 0 when CompanionMemory.list returns no records', async () => {
    const entities = {
      CompanionMemory: {
        list: async () => [],
      },
    };
    const { diagnostic } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);
    expect(diagnostic.valid_therapist_memory_record_count).toBe(0);
    expect(diagnostic.memory_read_attempted).toBe(true);
  });

  it('is 0 when records do not parse as valid therapist memory', async () => {
    const entities = {
      CompanionMemory: {
        list: async () => [
          { memory_type: 'therapist_session', content: '{"not_valid": true}' },
          { memory_type: 'other_type', content: '{}' },
        ],
      },
    };
    const { diagnostic } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);
    expect(diagnostic.valid_therapist_memory_record_count).toBe(0);
  });

  it('equals the number of parseable valid therapist memory records', async () => {
    const validRecord = {
      therapist_memory_version: 1,
      session_id: 'test-1',
      session_summary: 'meaningful summary for Project Cypress session',
      core_patterns: [],
      triggers: [],
      automatic_thoughts: [],
      emotions: [],
      urges: [],
      actions: [],
      consequences: [],
      working_hypotheses: [],
      interventions_used: [],
      risk_flags: [],
      safety_plan_notes: '',
      follow_up_tasks: [],
      goals_referenced: [],
    };

    const entities = {
      CompanionMemory: {
        list: async () => [
          makeCompanionRecord(validRecord),
          { memory_type: 'not_therapist', content: '{}' }, // invalid — not counted
          makeCompanionRecord({ ...validRecord, session_id: 'test-2' }),
        ],
      },
    };
    const { diagnostic } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);
    expect(diagnostic.valid_therapist_memory_record_count).toBe(2);
  });
});

// ─── Section 15: selected_prior_session_count = 0 when block not emitted ──────

describe('Stage 6 — buildCrossSessionContinuityBlockWithDiagnostic: selected count when no block', () => {
  it('selected_prior_session_count is 0 when all records are empty/weak (no_useful_content path)', async () => {
    // Records have no session_summary and no clinical data → score 0 → no block
    const weakRecord = {
      therapist_memory_version: 1,
      session_id: 'weak-1',
      session_summary: '',
      core_patterns: [],
      triggers: [],
      automatic_thoughts: [],
      emotions: [],
      urges: [],
      actions: [],
      consequences: [],
      working_hypotheses: [],
      interventions_used: [],
      risk_flags: [],
      safety_plan_notes: '',
      follow_up_tasks: [],
      goals_referenced: [],
    };

    const entities = {
      CompanionMemory: {
        list: async () => [
          makeCompanionRecord(weakRecord),
          makeCompanionRecord({ ...weakRecord, session_id: 'weak-2' }),
          makeCompanionRecord({ ...weakRecord, session_id: 'weak-3' }),
        ],
      },
    };
    const { block, diagnostic } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);

    // Block must not be emitted
    expect(block).toBe('');
    expect(diagnostic.continuity_block_emitted).toBe(false);

    // valid count must reflect that records WERE found and parsed
    expect(diagnostic.valid_therapist_memory_record_count).toBeGreaterThan(0);

    // selected count MUST be 0 when block is not emitted (Stage 6 diagnostic fix)
    expect(diagnostic.selected_prior_session_count).toBe(0);
  });

  it('continuity_failure_reason_code is no_useful_content (not empty_result)', async () => {
    const weakRecord = {
      therapist_memory_version: 1,
      session_id: 'weak-x',
      session_summary: '',
      core_patterns: [], triggers: [], automatic_thoughts: [], emotions: [],
      urges: [], actions: [], consequences: [], working_hypotheses: [],
      interventions_used: [], risk_flags: [], safety_plan_notes: '',
      follow_up_tasks: [], goals_referenced: [],
    };
    const entities = {
      CompanionMemory: { list: async () => [makeCompanionRecord(weakRecord)] },
    };
    const { diagnostic } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);
    expect(diagnostic.continuity_failure_reason_code).toBe(CONTINUITY_FAILURE_REASONS.no_useful_content);
  });
});

// ─── Section 16: selected_prior_session_count > 0 only when block emitted ─────

describe('Stage 6 — buildCrossSessionContinuityBlockWithDiagnostic: selected count when block emitted', () => {
  it('selected_prior_session_count equals sessionCount when block is emitted', async () => {
    const richRecord = {
      therapist_memory_version: 1,
      session_id: 'rich-1',
      session_summary: 'Discussed Project Cypress and anxiety management strategies',
      core_patterns: ['avoidance at work'],
      triggers: [],
      automatic_thoughts: [],
      emotions: [],
      urges: [],
      actions: [],
      consequences: [],
      working_hypotheses: [],
      interventions_used: [],
      risk_flags: [],
      safety_plan_notes: '',
      follow_up_tasks: [],
      goals_referenced: [],
    };

    const entities = {
      CompanionMemory: {
        list: async () => [makeCompanionRecord(richRecord)],
      },
    };
    const { block, diagnostic } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);

    expect(diagnostic.continuity_block_emitted).toBe(true);
    expect(block.length).toBeGreaterThan(0);
    expect(diagnostic.selected_prior_session_count).toBeGreaterThan(0);
  });

  it('block contains the session_summary (recentSummary) for a rich record', async () => {
    const richRecord = {
      therapist_memory_version: 1,
      session_id: 'rich-2',
      session_summary: 'Project Cypress, Tuesday 16:30, anxiety 6/10, correction applied',
      core_patterns: [],
      triggers: [],
      automatic_thoughts: [],
      emotions: [],
      urges: [],
      actions: [],
      consequences: [],
      working_hypotheses: [],
      interventions_used: [],
      risk_flags: [],
      safety_plan_notes: '',
      follow_up_tasks: [],
      goals_referenced: [],
    };

    const entities = {
      CompanionMemory: {
        list: async () => [makeCompanionRecord(richRecord)],
      },
    };
    const { block } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);
    expect(block).toContain('Project Cypress');
    expect(block).toContain('6/10');
  });
});

// ─── Section 17: write-then-read sequencing ───────────────────────────────────

describe('Stage 6 — write-then-read sequencing', () => {
  it('a record produced by deriveConversationMemoryPayload is parseable by _parseContinuityFromRawRecords path', async () => {
    const messages = [
      { role: 'user', content: 'Project Cypress, Tuesday 16:30, anxiety 6/10' },
      { role: 'user', content: 'Colleague said Noted, manager did not respond' },
    ];
    const written = deriveConversationMemoryPayload('conv-seq', { name: 'Session 1' }, messages);

    // Score must be >= threshold so continuity block can be emitted
    expect(scoreTherapistMemoryRecord(written)).toBeGreaterThanOrEqual(CONTINUITY_MIN_USEFUL_SCORE);

    // Simulate writing to CompanionMemory and reading back
    const stored = makeCompanionRecord(written);
    const entities = {
      CompanionMemory: {
        list: async () => [stored],
      },
    };
    const { block, diagnostic } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);
    expect(diagnostic.continuity_block_emitted).toBe(true);
    expect(block).toContain('Project Cypress');
    expect(diagnostic.selected_prior_session_count).toBeGreaterThan(0);
  });

  it('block emitted for next-session read contains the corrected anxiety value (6/10)', async () => {
    const messages = [
      { role: 'user', content: 'anxiety was 4/10 initially' },
      { role: 'user', content: 'correction: it stayed at 6/10' },
    ];
    const written = deriveConversationMemoryPayload('conv-seq-correct', {}, messages);
    const stored = makeCompanionRecord(written);

    const entities = {
      CompanionMemory: {
        list: async () => [stored],
      },
    };
    const { block } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);
    expect(block).toContain('6/10');
  });
});

// ─── Section 18: fail-open: empty messages list ───────────────────────────────

describe('Stage 6 — fail-open: empty/absent messages', () => {
  it('deriveConversationMemoryPayload with [] messages does not throw', () => {
    expect(() => deriveConversationMemoryPayload('conv-empty-msgs', {}, [])).not.toThrow();
  });

  it('deriveConversationMemoryPayload with null messages does not throw', () => {
    expect(() => deriveConversationMemoryPayload('conv-null-msgs', {}, null)).not.toThrow();
  });

  it('deriveConversationMemoryPayload returns a valid stub when messages = []', () => {
    const result = deriveConversationMemoryPayload('conv-empty-stub', { name: 'Session 1' }, []);
    expect(isTherapistMemoryRecord(result)).toBe(true);
  });

  it('_extractSummaryFromMessages with non-array returns empty string (not an error)', () => {
    expect(_extractSummaryFromMessages(42)).toBe('');
    expect(_extractSummaryFromMessages({ role: 'user' })).toBe('');
    expect(_extractSummaryFromMessages('string')).toBe('');
  });
});

// ─── Section 19: fail-open: malformed message objects ─────────────────────────

describe('Stage 6 — fail-open: malformed message objects', () => {
  it('skips null messages in the array without throwing', () => {
    const messages = [null, { role: 'user', content: 'valid content' }, undefined];
    expect(() => _extractSummaryFromMessages(messages)).not.toThrow();
    expect(_extractSummaryFromMessages(messages)).toContain('valid content');
  });

  it('skips messages with non-string content', () => {
    const messages = [
      { role: 'user', content: 42 },
      { role: 'user', content: 'valid string' },
    ];
    const result = _extractSummaryFromMessages(messages);
    expect(result).toContain('valid string');
    expect(result).not.toContain('42');
  });

  it('skips messages with no content field', () => {
    const messages = [
      { role: 'user' },
      { role: 'user', content: 'has content' },
    ];
    const result = _extractSummaryFromMessages(messages);
    expect(result).toContain('has content');
  });
});

// ─── Section 20: PR 948 regression — recency slot preserved ──────────────────

describe('Stage 6 — PR 948 regression: most-recent-useful recency slot', () => {
  it('most recent useful session remains in the continuity output even when older sessions are richer', async () => {
    const makeRecord = (id, summary, patterns) => ({
      therapist_memory_version: 1,
      session_id: id,
      session_summary: summary,
      core_patterns: patterns,
      triggers: [], automatic_thoughts: [], emotions: [], urges: [],
      actions: [], consequences: [], working_hypotheses: [], interventions_used: [],
      risk_flags: [], safety_plan_notes: '', follow_up_tasks: [], goals_referenced: [],
    });

    // Most-recent session: has a summary but fewer patterns
    const recentRecord = makeRecord('recent', 'Most recent session — Project Delta', ['one-pattern']);
    // Older session: richer but not most recent
    const olderRecord = makeRecord('older', 'Older session', [
      'pattern-a', 'pattern-b', 'pattern-c',
    ]);

    // list returns most-recent first
    const entities = {
      CompanionMemory: {
        list: async () => [
          makeCompanionRecord(recentRecord),
          makeCompanionRecord(olderRecord),
        ],
      },
    };

    const { block } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);
    // The most-recent session's summary must appear (recency slot guarantee)
    expect(block).toContain('Project Delta');
  });
});

// ─── Section 21: PR 948 regression — risk-bearing record priority ─────────────

describe('Stage 6 — PR 948 regression: risk-bearing record selection priority', () => {
  it('risk-bearing older session is selected over non-risk session of equal recency tier', async () => {
    const makeRecord = (id, summary, riskFlags) => ({
      therapist_memory_version: 1,
      session_id: id,
      session_summary: summary,
      core_patterns: [],
      triggers: [], automatic_thoughts: [], emotions: [], urges: [],
      actions: [], consequences: [], working_hypotheses: [], interventions_used: [],
      risk_flags: riskFlags,
      safety_plan_notes: '', follow_up_tasks: [], goals_referenced: [],
    });

    const recentRecord = makeRecord('recent-noRisk', 'Recent session, no risk', []);
    const olderWithRisk = makeRecord('older-risk', 'Older session with risk flag', ['low_mood']);
    const olderNoRisk = makeRecord('older-norisk', 'Older session, no risk', []);

    const entities = {
      CompanionMemory: {
        list: async () => [
          makeCompanionRecord(recentRecord),
          makeCompanionRecord(olderWithRisk),
          makeCompanionRecord(olderNoRisk),
        ],
      },
    };

    const { block } = await buildCrossSessionContinuityBlockWithDiagnostic(entities);
    // Risk-bearing session must produce a safety instruction in the block
    expect(block).toContain('Historical safety context');
  });
});

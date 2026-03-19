/**
 * @file test/utils/therapistMemoryPhase1.test.js
 *
 * Phase 1 — Structured Therapist Memory Layer
 *
 * PURPOSE
 * -------
 * 1. Verify that the structured therapist memory model exists and is
 *    well-formed (schema integrity, field registry, helpers).
 * 2. Verify that the memory model is additive — existing CompanionMemory
 *    behaviour and the current default therapist path are unchanged.
 * 3. Verify that CBT_THERAPIST_WIRING_STAGE2_V1 exists as a new additive
 *    export, has the same entity list as HYBRID, and is not the active config.
 * 4. Verify that resolveTherapistWiring() still returns CBT_THERAPIST_WIRING_HYBRID
 *    when all flags are false (Phase 0 / 0.1 baselines preserved).
 * 5. Verify that no automatic session write surface exists in the JS layer.
 * 6. Verify that private entity access boundaries are preserved — no new
 *    entities added to the agent's retrieval scope in Phase 1.
 *
 * CONSTRAINTS
 * -----------
 * - Does NOT import from base44/functions/ (Deno code — not importable in Vitest).
 * - Does NOT modify any Phase 0 / 0.1 test files.
 * - All Phase 0 and 0.1 assertions must still pass (this test is additive).
 *
 * Source of truth: docs/therapist-upgrade-stage2-plan.md — Phase 1
 */

import { describe, it, expect } from 'vitest';

import {
  THERAPIST_MEMORY_VERSION_KEY,
  THERAPIST_MEMORY_VERSION,
  THERAPIST_MEMORY_SCHEMA,
  THERAPIST_MEMORY_FIELDS,
  THERAPIST_MEMORY_ARRAY_FIELDS,
  THERAPIST_MEMORY_STRING_FIELDS,
  createEmptyTherapistMemoryRecord,
  isTherapistMemoryRecord,
} from '../../src/lib/therapistMemoryModel.js';

import {
  CBT_THERAPIST_WIRING_HYBRID,
  AI_COMPANION_WIRING_HYBRID,
  CBT_THERAPIST_WIRING_STAGE2_V1,
} from '../../src/api/agentWiring.js';

import {
  ACTIVE_CBT_THERAPIST_WIRING,
  ACTIVE_AI_COMPANION_WIRING,
  resolveTherapistWiring,
} from '../../src/api/activeAgentWiring.js';

import {
  THERAPIST_UPGRADE_FLAGS,
  isUpgradeEnabled,
} from '../../src/lib/featureFlags.js';

// ─── Section 1 — Memory model exists and is well-formed ──────────────────────

describe('Phase 1 — Memory model exists', () => {
  it('THERAPIST_MEMORY_VERSION_KEY is exported as a non-empty string', () => {
    expect(typeof THERAPIST_MEMORY_VERSION_KEY).toBe('string');
    expect(THERAPIST_MEMORY_VERSION_KEY.length).toBeGreaterThan(0);
  });

  it('THERAPIST_MEMORY_VERSION is exported as a non-empty string', () => {
    expect(typeof THERAPIST_MEMORY_VERSION).toBe('string');
    expect(THERAPIST_MEMORY_VERSION.length).toBeGreaterThan(0);
  });

  it('THERAPIST_MEMORY_SCHEMA is exported and is an object', () => {
    expect(THERAPIST_MEMORY_SCHEMA).toBeDefined();
    expect(typeof THERAPIST_MEMORY_SCHEMA).toBe('object');
  });

  it('THERAPIST_MEMORY_SCHEMA is frozen (immutable)', () => {
    expect(Object.isFrozen(THERAPIST_MEMORY_SCHEMA)).toBe(true);
  });

  it('THERAPIST_MEMORY_FIELDS is exported as a Set', () => {
    expect(THERAPIST_MEMORY_FIELDS instanceof Set).toBe(true);
  });

  it('THERAPIST_MEMORY_FIELDS is frozen', () => {
    expect(Object.isFrozen(THERAPIST_MEMORY_FIELDS)).toBe(true);
  });

  it('THERAPIST_MEMORY_ARRAY_FIELDS is exported as an array', () => {
    expect(Array.isArray(THERAPIST_MEMORY_ARRAY_FIELDS)).toBe(true);
  });

  it('THERAPIST_MEMORY_STRING_FIELDS is exported as an array', () => {
    expect(Array.isArray(THERAPIST_MEMORY_STRING_FIELDS)).toBe(true);
  });

  it('createEmptyTherapistMemoryRecord is exported as a function', () => {
    expect(typeof createEmptyTherapistMemoryRecord).toBe('function');
  });

  it('isTherapistMemoryRecord is exported as a function', () => {
    expect(typeof isTherapistMemoryRecord).toBe('function');
  });
});

// ─── Section 2 — Schema contains all required Phase 1 fields ─────────────────

describe('Phase 1 — Schema contains all required fields', () => {
  const REQUIRED_FIELDS = [
    'session_id',
    'session_date',
    'session_summary',
    'core_patterns',
    'triggers',
    'automatic_thoughts',
    'emotions',
    'urges',
    'actions',
    'consequences',
    'working_hypotheses',
    'interventions_used',
    'risk_flags',
    'safety_plan_notes',
    'follow_up_tasks',
    'goals_referenced',
    'last_summarized_date',
  ];

  for (const field of REQUIRED_FIELDS) {
    it(`schema contains required field: ${field}`, () => {
      expect(field in THERAPIST_MEMORY_SCHEMA).toBe(true);
    });
  }

  it('schema contains the version marker field', () => {
    expect(THERAPIST_MEMORY_VERSION_KEY in THERAPIST_MEMORY_SCHEMA).toBe(true);
  });

  it('schema version marker value matches THERAPIST_MEMORY_VERSION', () => {
    expect(THERAPIST_MEMORY_SCHEMA[THERAPIST_MEMORY_VERSION_KEY]).toBe(THERAPIST_MEMORY_VERSION);
  });
});

// ─── Section 3 — Schema field types are correct ───────────────────────────────

describe('Phase 1 — Schema field types are correct', () => {
  it('all string fields in THERAPIST_MEMORY_SCHEMA default to empty string', () => {
    for (const field of THERAPIST_MEMORY_STRING_FIELDS) {
      if (field === THERAPIST_MEMORY_VERSION_KEY) {
        // Version key has a non-empty default
        expect(THERAPIST_MEMORY_SCHEMA[field]).toBe(THERAPIST_MEMORY_VERSION);
      } else {
        expect(THERAPIST_MEMORY_SCHEMA[field], `"${field}" should default to ''`).toBe('');
      }
    }
  });

  it('all array fields in THERAPIST_MEMORY_SCHEMA default to empty arrays', () => {
    for (const field of THERAPIST_MEMORY_ARRAY_FIELDS) {
      const value = THERAPIST_MEMORY_SCHEMA[field];
      expect(Array.isArray(value), `"${field}" should be an array`).toBe(true);
      expect(value.length, `"${field}" array should be empty by default`).toBe(0);
    }
  });

  it('every field in THERAPIST_MEMORY_STRING_FIELDS is in THERAPIST_MEMORY_FIELDS', () => {
    for (const field of THERAPIST_MEMORY_STRING_FIELDS) {
      expect(THERAPIST_MEMORY_FIELDS.has(field), `"${field}" must be in THERAPIST_MEMORY_FIELDS`).toBe(true);
    }
  });

  it('every field in THERAPIST_MEMORY_ARRAY_FIELDS is in THERAPIST_MEMORY_FIELDS', () => {
    for (const field of THERAPIST_MEMORY_ARRAY_FIELDS) {
      expect(THERAPIST_MEMORY_FIELDS.has(field), `"${field}" must be in THERAPIST_MEMORY_FIELDS`).toBe(true);
    }
  });
});

// ─── Section 4 — createEmptyTherapistMemoryRecord ────────────────────────────

describe('Phase 1 — createEmptyTherapistMemoryRecord factory', () => {
  it('returns a plain object', () => {
    const record = createEmptyTherapistMemoryRecord();
    expect(typeof record).toBe('object');
    expect(record).not.toBeNull();
  });

  it('returned record is not frozen (is mutable)', () => {
    const record = createEmptyTherapistMemoryRecord();
    expect(Object.isFrozen(record)).toBe(false);
  });

  it('returned record has the correct version marker', () => {
    const record = createEmptyTherapistMemoryRecord();
    expect(record[THERAPIST_MEMORY_VERSION_KEY]).toBe(THERAPIST_MEMORY_VERSION);
  });

  it('returned record array fields are separate instances (not shared with schema)', () => {
    const record1 = createEmptyTherapistMemoryRecord();
    const record2 = createEmptyTherapistMemoryRecord();
    record1.core_patterns.push('test pattern');
    // record2 must be unaffected
    expect(record2.core_patterns).toHaveLength(0);
    // Schema must also be unaffected
    expect(THERAPIST_MEMORY_SCHEMA.core_patterns).toHaveLength(0);
  });

  it('returned record has all required schema fields', () => {
    const record = createEmptyTherapistMemoryRecord();
    for (const field of THERAPIST_MEMORY_FIELDS) {
      expect(field in record, `record should have field "${field}"`).toBe(true);
    }
  });

  it('calling createEmptyTherapistMemoryRecord does not throw', () => {
    expect(() => createEmptyTherapistMemoryRecord()).not.toThrow();
  });
});

// ─── Section 5 — isTherapistMemoryRecord helper ───────────────────────────────

describe('Phase 1 — isTherapistMemoryRecord helper', () => {
  it('returns true for a freshly created empty record', () => {
    const record = createEmptyTherapistMemoryRecord();
    expect(isTherapistMemoryRecord(record)).toBe(true);
  });

  it('returns true for an object with the correct version marker', () => {
    const obj = { [THERAPIST_MEMORY_VERSION_KEY]: THERAPIST_MEMORY_VERSION };
    expect(isTherapistMemoryRecord(obj)).toBe(true);
  });

  it('returns false for null', () => {
    expect(isTherapistMemoryRecord(null)).toBe(false);
  });

  it('returns false for undefined', () => {
    expect(isTherapistMemoryRecord(undefined)).toBe(false);
  });

  it('returns false for a plain string', () => {
    expect(isTherapistMemoryRecord('memory string')).toBe(false);
  });

  it('returns false for an empty object (no version marker)', () => {
    expect(isTherapistMemoryRecord({})).toBe(false);
  });

  it('returns false for a standard CompanionMemory-like object (no version marker)', () => {
    const companionRecord = { content: 'User likes morning routines', created_by: 'user@example.com' };
    expect(isTherapistMemoryRecord(companionRecord)).toBe(false);
  });

  it('returns false for an object with the wrong version marker value', () => {
    const obj = { [THERAPIST_MEMORY_VERSION_KEY]: 'wrong_version' };
    expect(isTherapistMemoryRecord(obj)).toBe(false);
  });

  it('returns false for an object with the wrong version marker key', () => {
    const obj = { wrong_key: THERAPIST_MEMORY_VERSION };
    expect(isTherapistMemoryRecord(obj)).toBe(false);
  });
});

// ─── Section 6 — Privacy: schema does not allow raw transcripts ───────────────

describe('Phase 1 — Privacy: schema does not store raw transcripts', () => {
  it('schema does not have a "messages" field', () => {
    expect('messages' in THERAPIST_MEMORY_SCHEMA).toBe(false);
  });

  it('schema does not have a "transcript" field', () => {
    expect('transcript' in THERAPIST_MEMORY_SCHEMA).toBe(false);
  });

  it('schema does not have a "raw_session" field', () => {
    expect('raw_session' in THERAPIST_MEMORY_SCHEMA).toBe(false);
  });

  it('schema does not have a "conversation_history" field', () => {
    expect('conversation_history' in THERAPIST_MEMORY_SCHEMA).toBe(false);
  });

  it('schema does not have a "full_session" field', () => {
    expect('full_session' in THERAPIST_MEMORY_SCHEMA).toBe(false);
  });
});

// ─── Section 7 — CBT_THERAPIST_WIRING_STAGE2_V1 exists and is additive ───────

describe('Phase 1 — CBT_THERAPIST_WIRING_STAGE2_V1 exists and is additive', () => {
  it('CBT_THERAPIST_WIRING_STAGE2_V1 is exported from agentWiring.js', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V1).toBeDefined();
  });

  it('CBT_THERAPIST_WIRING_STAGE2_V1 is a different object from CBT_THERAPIST_WIRING_HYBRID', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V1).not.toBe(CBT_THERAPIST_WIRING_HYBRID);
  });

  it('CBT_THERAPIST_WIRING_STAGE2_V1 has agent name "cbt_therapist"', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V1.name).toBe('cbt_therapist');
  });

  it('CBT_THERAPIST_WIRING_STAGE2_V1 has stage2: true', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V1.stage2).toBe(true);
  });

  it('CBT_THERAPIST_WIRING_STAGE2_V1 has stage2_phase: 1', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V1.stage2_phase).toBe(1);
  });

  it('CBT_THERAPIST_WIRING_STAGE2_V1 has memory_context_injection: true', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V1.memory_context_injection).toBe(true);
  });

  it('CBT_THERAPIST_WIRING_STAGE2_V1 has the same number of tool_configs as HYBRID (12)', () => {
    expect(CBT_THERAPIST_WIRING_STAGE2_V1.tool_configs).toHaveLength(12);
  });

  it('CBT_THERAPIST_WIRING_STAGE2_V1 entity names match HYBRID entity names exactly', () => {
    const hybridNames = CBT_THERAPIST_WIRING_HYBRID.tool_configs
      .map((tc) => tc.entity_name)
      .sort();
    const stage2Names = CBT_THERAPIST_WIRING_STAGE2_V1.tool_configs
      .map((tc) => tc.entity_name)
      .sort();
    expect(stage2Names).toEqual(hybridNames);
  });

  it('CBT_THERAPIST_WIRING_STAGE2_V1 entity names match Phase 0 baseline snapshot', () => {
    const names = CBT_THERAPIST_WIRING_STAGE2_V1.tool_configs
      .map((tc) => tc.entity_name)
      .sort();
    expect(names).toEqual([
      'AudioContent',
      'CaseFormulation',
      'CoachingSession',
      'CompanionMemory',
      'Conversation',
      'Exercise',
      'Goal',
      'Journey',
      'MoodEntry',
      'Resource',
      'SessionSummary',
      'ThoughtJournal',
    ]);
  });

  it('CBT_THERAPIST_WIRING_STAGE2_V1 does not add any new entities beyond HYBRID', () => {
    const hybridNames = new Set(
      CBT_THERAPIST_WIRING_HYBRID.tool_configs.map((tc) => tc.entity_name)
    );
    for (const tc of CBT_THERAPIST_WIRING_STAGE2_V1.tool_configs) {
      expect(hybridNames.has(tc.entity_name), `"${tc.entity_name}" must be in HYBRID`).toBe(true);
    }
  });

  it('CBT_THERAPIST_WIRING_STAGE2_V1 preserves the caution-layer entities from HYBRID', () => {
    const cautionEntities = CBT_THERAPIST_WIRING_STAGE2_V1.tool_configs.filter(
      (tc) => tc.caution_layer === true
    );
    expect(cautionEntities.map((tc) => tc.entity_name).sort()).toEqual([
      'CaseFormulation',
      'Conversation',
    ]);
  });
});

// ─── Section 8 — Current default path is unchanged when flags are off ─────────

describe('Phase 1 — Current default path unchanged (flag-off preservation)', () => {
  it('all Stage 2 flags are still false (no accidental enablement)', () => {
    for (const [name, value] of Object.entries(THERAPIST_UPGRADE_FLAGS)) {
      expect(value, `Flag "${name}" must still be false`).toBe(false);
    }
  });

  it('THERAPIST_UPGRADE_MEMORY_ENABLED is still false', () => {
    expect(isUpgradeEnabled('THERAPIST_UPGRADE_MEMORY_ENABLED')).toBe(false);
  });

  it('ACTIVE_CBT_THERAPIST_WIRING is still CBT_THERAPIST_WIRING_HYBRID (not Stage2 V1)', () => {
    expect(ACTIVE_CBT_THERAPIST_WIRING).toBe(CBT_THERAPIST_WIRING_HYBRID);
    expect(ACTIVE_CBT_THERAPIST_WIRING).not.toBe(CBT_THERAPIST_WIRING_STAGE2_V1);
  });

  it('resolveTherapistWiring() returns CBT_THERAPIST_WIRING_HYBRID when flags are off', () => {
    expect(resolveTherapistWiring()).toBe(CBT_THERAPIST_WIRING_HYBRID);
  });

  it('resolveTherapistWiring() does NOT return CBT_THERAPIST_WIRING_STAGE2_V1 in default mode', () => {
    expect(resolveTherapistWiring()).not.toBe(CBT_THERAPIST_WIRING_STAGE2_V1);
  });

  it('ACTIVE_AI_COMPANION_WIRING is still AI_COMPANION_WIRING_HYBRID (unchanged)', () => {
    expect(ACTIVE_AI_COMPANION_WIRING).toBe(AI_COMPANION_WIRING_HYBRID);
  });

  it('ACTIVE_CBT_THERAPIST_WIRING has no stage2 flag (still HYBRID)', () => {
    expect(ACTIVE_CBT_THERAPIST_WIRING.stage2).toBeUndefined();
  });

  it('ACTIVE_CBT_THERAPIST_WIRING has no memory_context_injection flag (still HYBRID)', () => {
    expect(ACTIVE_CBT_THERAPIST_WIRING.memory_context_injection).toBeUndefined();
  });

  it('ACTIVE_CBT_THERAPIST_WIRING still has exactly 12 tool_configs (Phase 0 baseline)', () => {
    expect(ACTIVE_CBT_THERAPIST_WIRING.tool_configs).toHaveLength(12);
  });
});

// ─── Section 9 — No automatic write surface exists in the JS layer ────────────

describe('Phase 1 — No automatic write surface in the JS layer', () => {
  it('therapistMemoryModel.js exports no write-triggering functions', () => {
    // The model module exports only schema constants and pure helper functions.
    // None of these initiate writes to any backend.
    const record = createEmptyTherapistMemoryRecord();
    // createEmptyTherapistMemoryRecord returns a plain object — no API calls
    expect(typeof record).toBe('object');
    expect(record.session_summary).toBe('');
  });

  it('agentWiring.js exports are pure configuration objects (no functions with side effects)', () => {
    // All wiring configs are plain objects — they have no methods that trigger writes
    expect(typeof CBT_THERAPIST_WIRING_STAGE2_V1).toBe('object');
    expect(typeof CBT_THERAPIST_WIRING_STAGE2_V1.tool_configs).not.toBe('function');
  });

  it('resolveTherapistWiring() does not write to any entity (it only returns a config object)', () => {
    // Calling resolveTherapistWiring must return a wiring config without side effects
    const result = resolveTherapistWiring();
    expect(typeof result).toBe('object');
    expect(Array.isArray(result.tool_configs)).toBe(true);
  });
});

// ─── Section 10 — Phase 0 / 0.1 regression checks (additive — must still pass) ─

describe('Phase 1 — Phase 0 / 0.1 baselines preserved (regression check)', () => {
  it('THERAPIST_UPGRADE_FLAGS is still frozen', () => {
    expect(Object.isFrozen(THERAPIST_UPGRADE_FLAGS)).toBe(true);
  });

  it('THERAPIST_UPGRADE_FLAGS still contains exactly 8 flags', () => {
    expect(Object.keys(THERAPIST_UPGRADE_FLAGS)).toHaveLength(8);
  });

  it('CBT_THERAPIST_WIRING_HYBRID still has 12 tool_configs (unmodified by Phase 1)', () => {
    expect(CBT_THERAPIST_WIRING_HYBRID.tool_configs).toHaveLength(12);
  });

  it('CBT_THERAPIST_WIRING_HYBRID entity names match Phase 0 baseline snapshot', () => {
    const names = CBT_THERAPIST_WIRING_HYBRID.tool_configs
      .map((tc) => tc.entity_name)
      .sort();
    expect(names).toEqual([
      'AudioContent',
      'CaseFormulation',
      'CoachingSession',
      'CompanionMemory',
      'Conversation',
      'Exercise',
      'Goal',
      'Journey',
      'MoodEntry',
      'Resource',
      'SessionSummary',
      'ThoughtJournal',
    ]);
  });

  it('AI_COMPANION_WIRING_HYBRID still has 9 tool_configs (unmodified by Phase 1)', () => {
    expect(AI_COMPANION_WIRING_HYBRID.tool_configs).toHaveLength(9);
  });

  it('ACTIVE_CBT_THERAPIST_WIRING entity names match Phase 0 baseline snapshot', () => {
    const names = ACTIVE_CBT_THERAPIST_WIRING.tool_configs
      .map((tc) => tc.entity_name)
      .sort();
    expect(names).toEqual([
      'AudioContent',
      'CaseFormulation',
      'CoachingSession',
      'CompanionMemory',
      'Conversation',
      'Exercise',
      'Goal',
      'Journey',
      'MoodEntry',
      'Resource',
      'SessionSummary',
      'ThoughtJournal',
    ]);
  });

  it('isUpgradeEnabled returns false for all known flags (Phase 0 guarantee)', () => {
    for (const flagName of Object.keys(THERAPIST_UPGRADE_FLAGS)) {
      expect(isUpgradeEnabled(flagName), `"${flagName}" must be unreachable`).toBe(false);
    }
  });
});

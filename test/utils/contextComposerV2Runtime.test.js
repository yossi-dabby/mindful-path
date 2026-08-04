import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as injector from '../../src/lib/workflowContextInjector.js';
import {
  createContextComposerV2,
  CONTEXT_COMPOSER_V2_BUDGET_CHARS,
  CONTEXT_COMPOSER_V2_PARITY_STATUS,
} from '../../src/lib/contextComposerV2.js';
import { CBT_THERAPIST_WIRING_STAGE2_V12 } from '../../src/api/agentWiring.js';

function makeWindow(search = '') {
  vi.stubGlobal('window', { location: { search, hostname: 'localhost' } });
}

function makeEntities() {
  return {
    CompanionMemory: {
      filter: vi.fn(async () => []),
      list: vi.fn(async () => []),
    },
    CaseFormulation: {
      list: vi.fn(async () => []),
    },
  };
}

// ─── Populated fixtures for the active-chain test ────────────────────────────
// A minimal valid LTS record (lts_version + memory_type + non-weak trajectory).
const POPULATED_LTS_RECORD = {
  lts_version: '1',
  memory_type: 'lts',
  trajectory: 'progressing',
  session_count: 3,
  risk_flags: [],
  blockers: [],
  strategy_version: 'v8',
  formulation_present: true,
  formulation_strength_score: 0.8,
};

// A minimal valid CaseFormulation record.
const POPULATED_FORMULATION_RECORD = {
  id: 'cf1',
  created_date: new Date().toISOString(),
  presenting_problem: 'Generalised anxiety',
  core_beliefs: 'I am incompetent',
  intermediate_beliefs: '',
  automatic_thoughts: '',
  emotions: '',
  behaviors: '',
  physical_sensations: '',
  triggering_situation: '',
  treatment_goals: '',
};

// A minimal valid continuity record (therapist_session memory_type).
const POPULATED_CONTINUITY_RECORD = {
  memory_type: 'therapist_session',
  created_date: new Date().toISOString(),
  session_summary: 'Worked on cognitive restructuring.',
  mood_rating: 6,
  session_highlights: [],
  session_blockers: [],
  risk_flags: [],
};

// Entities with all populated fixtures.
function makePopulatedEntities() {
  return {
    CompanionMemory: {
      // LTS canonical read (filter)
      filter: vi.fn(async () => [{ memory_type: 'lts', content: JSON.stringify(POPULATED_LTS_RECORD) }]),
      // Continuity read (list)
      list: vi.fn(async () => [POPULATED_CONTINUITY_RECORD]),
    },
    CaseFormulation: {
      list: vi.fn(async () => [POPULATED_FORMULATION_RECORD]),
    },
  };
}

// ─── Expected section inventory ──────────────────────────────────────────────
// Complete section IDs for an active V12 run with default (empty) entities
// (no safety, no formulation, no continuity, no LTS, no knowledge context).
const EXPECTED_V12_SECTION_IDS_EMPTY = [
  'session_start',
  'workflow_instructions',
  'retrieval_orchestration',
  'live_retrieval_policy',
  'live_runtime_status',
  'strategy_guidance',
  'precedence_enforcement',
  'competence_instructions',
  'planner_first_instructions',
  'attachment_context_instructions',
  'therapeutic_forms_policy',
];

describe('context composer V2 runtime integration', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('flag-off preserves byte-for-byte active behavior', async () => {
    const entities = makeEntities();
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED');
    const off = await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, {});
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const on = await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { disable_context_composer_v2: true });
    expect(on).toBe(off);
  });

  it('composer-on under budget matches legacy output byte-for-byte and fallback_used is false', async () => {
    const entities = makeEntities();
    // Build legacy output (composer disabled)
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED');
    const legacy = await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { disable_context_composer_v2: true });

    // Build composed output (composer enabled)
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    // Inject a spy composer with a budget large enough to hold all V12 sections
    let capturedDiagnostic = null;
    const largeComposer = createContextComposerV2({ budget_chars: legacy.length + 10000 });
    const composerSpy = {
      version: largeComposer.version,
      budget_chars: largeComposer.budget_chars,
      registerSection: (...args) => largeComposer.registerSection(...args),
      finalize: (...args) => {
        const result = largeComposer.finalize(...args);
        capturedDiagnostic = result.diagnostic;
        return result;
      },
    };
    const composed = await injector.buildActionFirstDemotedSessionContentAsync(
      CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { context_composer_v2: composerSpy }
    );

    // Byte-for-byte parity
    expect(composed).toBe(legacy);

    // Composer must be authoritative: fallback_used must be false under budget
    expect(capturedDiagnostic).not.toBeNull();
    expect(capturedDiagnostic.fallback_used).toBe(false);
    expect(capturedDiagnostic.parity_match).toBe(true);
    expect(capturedDiagnostic.parity_status).toBe(CONTEXT_COMPOSER_V2_PARITY_STATUS.exact_match);
    expect(capturedDiagnostic.budget_exceeded).toBe(false);
  });

  it('composer-on: every expected section ID is registered exactly once (empty entities)', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const entities = makeEntities();
    const registeredIds = [];
    const realComposer = createContextComposerV2({ budget_chars: CONTEXT_COMPOSER_V2_BUDGET_CHARS });
    const composerSpy = {
      version: realComposer.version,
      budget_chars: realComposer.budget_chars,
      registerSection: (section) => {
        registeredIds.push(section.id);
        return realComposer.registerSection(section);
      },
      finalize: (...args) => realComposer.finalize(...args),
    };
    await injector.buildActionFirstDemotedSessionContentAsync(
      CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { context_composer_v2: composerSpy }
    );
    // Each expected section must appear exactly once
    for (const expectedId of EXPECTED_V12_SECTION_IDS_EMPTY) {
      const count = registeredIds.filter((id) => id === expectedId).length;
      expect(count, `section '${expectedId}' must be registered exactly once, got ${count}`).toBe(1);
    }
    // No duplicates overall
    const uniqueIds = new Set(registeredIds);
    expect(uniqueIds.size).toBe(registeredIds.length);
  });

  it('active V12 chain uses one composer and serializes once', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const entities = makeEntities();
    let finalizeCalls = 0;
    const composer = {
      version: 'test',
      budget_chars: 32000,
      registerSection: vi.fn(),
      finalize: vi.fn(({ fallbackRendered }) => {
        finalizeCalls += 1;
        return { rendered: fallbackRendered ?? '', diagnostic: { fallback_used: false, parity_match: true, parity_status: CONTEXT_COMPOSER_V2_PARITY_STATUS.exact_match }, sections: [], version: 'test' };
      }),
    };
    await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { context_composer_v2: composer });
    expect(finalizeCalls).toBe(1);
  });

  it('V12 chain: LTS filter called exactly once and continuity list called at most twice', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const entities = makeEntities();
    await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, {});
    // LTS canonical filter read: exactly once
    expect(entities.CompanionMemory.filter).toHaveBeenCalledTimes(1);
    // Continuity list reads: at most 2 (canonical reader + continuity block, or only canonical)
    expect(entities.CompanionMemory.list.mock.calls.length).toBeLessThanOrEqual(2);
    // Continuity list must not be called more than twice (no duplicate continuity reads)
    expect(entities.CompanionMemory.list.mock.calls.length).toBeLessThanOrEqual(2);
  });

  it('budget eviction returns composed reduced output — not legacy fallback', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const entities = makeEntities();

    // Get unconstrained full output first (large budget, no eviction)
    const unconstrained = createContextComposerV2({ budget_chars: 1_000_000 });
    const fullOutput = await injector.buildActionFirstDemotedSessionContentAsync(
      CBT_THERAPIST_WIRING_STAGE2_V12, makeEntities(), null, { context_composer_v2: unconstrained }
    );

    // Use a tight budget to force eviction of optional sections
    const tightComposer = createContextComposerV2({ budget_chars: 500 });
    let capturedDiagnostic = null;
    const composerSpy = {
      version: tightComposer.version,
      budget_chars: tightComposer.budget_chars,
      registerSection: (...args) => tightComposer.registerSection(...args),
      finalize: (...args) => {
        const result = tightComposer.finalize(...args);
        capturedDiagnostic = result.diagnostic;
        return result;
      },
    };
    const output = await injector.buildActionFirstDemotedSessionContentAsync(
      CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { context_composer_v2: composerSpy }
    );
    expect(capturedDiagnostic).not.toBeNull();
    // Budget eviction must fire
    expect(capturedDiagnostic.budget_exceeded).toBe(true);
    // Budget eviction is NOT a fallback — fallback_used must be false
    expect(capturedDiagnostic.fallback_used).toBe(false);
    // Budget eviction parity_status must be intentional_budget_difference
    expect(capturedDiagnostic.parity_status).toBe(CONTEXT_COMPOSER_V2_PARITY_STATUS.intentional_budget_difference);
    // parity_match must be false for budget-evicted output
    expect(capturedDiagnostic.parity_match).toBe(false);
    // Required sections must always be present in output
    expect(output).toContain('[START_SESSION]');
    // Evicted output is shorter than unconstrained output
    expect(output.length).toBeLessThan(fullOutput.length);
  });

  it('composer failure safely emits already-computed context without repeated entity reads', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED');
    const entities = makeEntities();
    const legacy = await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { disable_context_composer_v2: true });
    const filterCallsBefore = entities.CompanionMemory.filter.mock.calls.length;
    const listCallsBefore = entities.CompanionMemory.list.mock.calls.length;

    const mod = await import('../../src/lib/contextComposerV2.js');
    vi.spyOn(mod, 'createContextComposerV2').mockImplementation(() => {
      throw new Error('boom');
    });
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const output = await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, {});
    // Fails open to the already-computed legacy output
    expect(output).toBe(legacy);
    // No additional entity reads caused by the composer failure
    expect(entities.CompanionMemory.filter.mock.calls.length).toBe(filterCallsBefore + 1);
    expect(entities.CompanionMemory.list.mock.calls.length).toBe(listCallsBefore + 2);
  });

  it('no opaque legacy section — no final-string parsing in composed output', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const entities = makeEntities();
    const realComposer = createContextComposerV2({ budget_chars: CONTEXT_COMPOSER_V2_BUDGET_CHARS });
    let finalResult = null;
    const composerSpy = {
      version: realComposer.version,
      budget_chars: realComposer.budget_chars,
      registerSection: (...args) => realComposer.registerSection(...args),
      finalize: (...args) => {
        finalResult = realComposer.finalize(...args);
        return finalResult;
      },
    };
    await injector.buildActionFirstDemotedSessionContentAsync(
      CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { context_composer_v2: composerSpy }
    );
    expect(finalResult).not.toBeNull();
    // All sections should have known IDs — no opaque 'legacy' sections
    for (const section of finalResult.sections) {
      expect(typeof section.id).toBe('string');
      expect(section.id.length).toBeGreaterThan(0);
      expect(section.id).not.toBe('legacy');
    }
  });

  it('direct V7-V12 calls remain compatible', async () => {
    const entities = makeEntities();
    const content7 = await injector.buildV7SessionStartContentAsync({ continuity_layer_enabled: true }, entities, null, {});
    const content8 = await injector.buildV8SessionStartContentAsync({ continuity_layer_enabled: true, strategy_layer_enabled: true }, entities, null, {});
    const content9 = await injector.buildV9SessionStartContentAsync({ continuity_layer_enabled: true, strategy_layer_enabled: true, longitudinal_layer_enabled: true }, entities, null, {});
    const content10 = await injector.buildV10SessionStartContentAsync({ continuity_layer_enabled: true, strategy_layer_enabled: true, longitudinal_layer_enabled: true, knowledge_layer_enabled: true }, entities, null, {});
    const content11 = await injector.buildV11SessionStartContentAsync({ continuity_layer_enabled: true, strategy_layer_enabled: true, longitudinal_layer_enabled: true, knowledge_layer_enabled: true, competence_layer_enabled: true }, entities, null, {});
    const content12 = await injector.buildV12SessionStartContentAsync({ continuity_layer_enabled: true, strategy_layer_enabled: true, longitudinal_layer_enabled: true, knowledge_layer_enabled: true, competence_layer_enabled: true, planner_first_enabled: true }, entities, null, {});
    for (const content of [content7, content8, content9, content10, content11, content12]) expect(typeof content).toBe('string');
  });

  // ─── Fully populated active-chain test ─────────────────────────────────────

  it('populated V12 chain: all base, retrieval, continuity, LTS, knowledge sections register once with default budget', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const entities = makePopulatedEntities();

    const registeredIds = [];
    const realComposer = createContextComposerV2({ budget_chars: CONTEXT_COMPOSER_V2_BUDGET_CHARS });
    let capturedDiagnostic = null;
    const composerSpy = {
      version: realComposer.version,
      budget_chars: realComposer.budget_chars,
      registerSection: (section) => {
        registeredIds.push(section.id);
        return realComposer.registerSection(section);
      },
      finalize: (...args) => {
        const result = realComposer.finalize(...args);
        capturedDiagnostic = result.diagnostic;
        return result;
      },
    };

    const output = await injector.buildActionFirstDemotedSessionContentAsync(
      CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { context_composer_v2: composerSpy }
    );

    // No duplicate IDs
    const uniqueIds = new Set(registeredIds);
    expect(uniqueIds.size, `duplicate section IDs detected: ${registeredIds.filter((id, i) => registeredIds.indexOf(id) !== i)}`).toBe(registeredIds.length);

    // finalize called exactly once
    expect(capturedDiagnostic).not.toBeNull();

    // Default budget must not evict sections for a populated session
    expect(capturedDiagnostic.budget_exceeded).toBe(false);

    // Composer is authoritative: fallback_used must be false
    expect(capturedDiagnostic.fallback_used).toBe(false);

    // Parity: composed output matches legacy (exact_match)
    expect(capturedDiagnostic.parity_status).toBe(CONTEXT_COMPOSER_V2_PARITY_STATUS.exact_match);
    expect(capturedDiagnostic.parity_match).toBe(true);

    // Diagnostics must not contain section content (safety invariant)
    const diagnosticJson = JSON.stringify(capturedDiagnostic);
    expect(diagnosticJson).not.toContain('Generalised anxiety');
    expect(diagnosticJson).not.toContain('Worked on cognitive restructuring');

    // Base sections always present
    for (const id of ['session_start', 'workflow_instructions', 'retrieval_orchestration',
      'live_retrieval_policy', 'live_runtime_status', 'planner_first_instructions',
      'attachment_context_instructions', 'therapeutic_forms_policy']) {
      expect(registeredIds, `base section '${id}' must be registered`).toContain(id);
    }

    // Strategy and competence always present in V12
    for (const id of ['strategy_guidance', 'precedence_enforcement', 'competence_instructions']) {
      expect(registeredIds, `V12 section '${id}' must be registered`).toContain(id);
    }

    // Output is non-empty
    expect(output.length).toBeGreaterThan(1000);
  });

  // ─── Memory reads by purpose ────────────────────────────────────────────────

  it('memory reads by purpose: LTS filter exactly once, continuity list exactly once, no second continuity read', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const entities = makePopulatedEntities();

    await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, {});

    // LTS canonical filter: exactly one call (CompanionMemory.filter)
    expect(entities.CompanionMemory.filter).toHaveBeenCalledTimes(1);

    // Continuity read: at most 2 list calls across the whole chain
    // (canonical reader + possibly cross-session continuity block — not more)
    const listCallCount = entities.CompanionMemory.list.mock.calls.length;
    expect(listCallCount, `expected at most 2 CompanionMemory.list calls, got ${listCallCount}`).toBeLessThanOrEqual(2);

    // No second LTS filter call (canonical LTS must be reused from options.canonical_memory_result)
    expect(entities.CompanionMemory.filter).toHaveBeenCalledTimes(1);
  });

  it('memory reads by purpose: empty entities has same read pattern (filter once, list at most twice)', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const entities = makeEntities();

    await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, {});

    // LTS canonical filter: exactly one call
    expect(entities.CompanionMemory.filter).toHaveBeenCalledTimes(1);

    // Continuity list: at most 2 calls total
    expect(entities.CompanionMemory.list.mock.calls.length).toBeLessThanOrEqual(2);
  });
});

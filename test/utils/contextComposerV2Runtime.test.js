import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as injector from '../../src/lib/workflowContextInjector.js';
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

  it('composer-on under budget matches legacy output byte-for-byte', async () => {
    const entities = makeEntities();
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED');
    const legacy = await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { disable_context_composer_v2: true });
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const composed = await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, {});
    expect(composed).toBe(legacy);
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
        return { rendered: fallbackRendered ?? '', diagnostic: {}, sections: [], version: 'test' };
      }),
    };
    await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { context_composer_v2: composer });
    expect(finalizeCalls).toBe(1);
  });

  it('V12 chain preserves CompanionMemory.filter/list single-call guarantee', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const entities = makeEntities();
    await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, {});
    expect(entities.CompanionMemory.filter).toHaveBeenCalledTimes(1);
    expect(entities.CompanionMemory.list).toHaveBeenCalledTimes(2);
  });

  it('composer failure safely emits already-computed context', async () => {
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED');
    const entities = makeEntities();
    const legacy = await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, { disable_context_composer_v2: true });
    const mod = await import('../../src/lib/contextComposerV2.js');
    vi.spyOn(mod, 'createContextComposerV2').mockImplementation(() => {
      throw new Error('boom');
    });
    makeWindow('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED,CONTEXT_COMPOSER_V2_ENABLED');
    const output = await injector.buildActionFirstDemotedSessionContentAsync(CBT_THERAPIST_WIRING_STAGE2_V12, entities, null, {});
    expect(output).toBe(legacy);
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
});

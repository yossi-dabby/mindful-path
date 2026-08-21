import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  retrieveBoundedCBTKnowledgeBlock,
} from '../../src/lib/cbtKnowledgeRetrieval.js';

const PLAN = Object.freeze({
  shouldRetrieve: true,
  domainHint: 'anxiety',
  unitTypePreference: 'any',
  distressFilter: 'any',
  treatmentArcFilter: 'any',
  skipReason: '',
});

function makeEntities(units) {
  return {
    CBTCurriculumUnit: {
      filter: vi.fn().mockResolvedValue(units),
    },
  };
}

function makeLegacyUnit(overrides = {}) {
  return {
    id: 'legacy-unit',
    title: 'Legacy anxiety unit',
    clinical_topic: 'anxiety',
    content_summary: 'Legacy summary',
    cbt_domain: 'anxiety',
    evidence_level: 'established',
    distress_suitability: 'any',
    safety_tags: [],
    treatment_arc_position: 'any',
    runtime_eligible_first_wave: true,
    languages: ['en'],
    ...overrides,
  };
}

function makeSeedContractUnit(overrides = {}) {
  return {
    id: 'seed-unit',
    title: 'Seed anxiety unit',
    clinical_topic: 'general_anxiety',
    content_summary: 'Seed summary',
    planner_domain: 'anxiety',
    evidence_level: 'gold_standard',
    distress_suitability: 'not_in_crisis',
    safety_tags: [],
    treatment_arc_position: 'any',
    runtime_eligible_first_wave: true,
    languages: ['en'],
    ...overrides,
  };
}

describe('V10 Knowledge Preview - contract and language safety', () => {
  it('accepts the current seed contract for a matching English session', async () => {
    const block = await retrieveBoundedCBTKnowledgeBlock(
      makeEntities([makeSeedContractUnit()]),
      PLAN,
      'en',
    );

    expect(block).toContain('Seed anxiety unit');
  });

  it('returns an empty block when session language is missing', async () => {
    const block = await retrieveBoundedCBTKnowledgeBlock(
      makeEntities([makeLegacyUnit()]),
      PLAN,
    );

    expect(block).toBe('');
  });

  it('does not inject an English unit into a Hebrew session', async () => {
    const block = await retrieveBoundedCBTKnowledgeBlock(
      makeEntities([makeLegacyUnit()]),
      PLAN,
      'he',
    );

    expect(block).toBe('');
  });

  it('allows a unit explicitly marked for all languages', async () => {
    const block = await retrieveBoundedCBTKnowledgeBlock(
      makeEntities([makeLegacyUnit({ languages: ['all'] })]),
      PLAN,
      'he',
    );

    expect(block).toContain('Legacy anxiety unit');
  });

  it('fails closed when planner_domain and cbt_domain conflict', async () => {
    const conflictingUnit = makeLegacyUnit({
      planner_domain: 'depression',
      cbt_domain: 'anxiety',
    });

    const block = await retrieveBoundedCBTKnowledgeBlock(
      makeEntities([conflictingUnit]),
      PLAN,
      'en',
    );

    expect(block).toBe('');
  });

  it('excludes every unit carrying any safety tag', async () => {
    const taggedUnit = makeLegacyUnit({
      safety_tags: ['cardiac_precaution'],
    });

    const block = await retrieveBoundedCBTKnowledgeBlock(
      makeEntities([taggedUnit]),
      PLAN,
      'en',
    );

    expect(block).toBe('');
  });

  it('fails closed for malformed non-empty safety tag arrays', async () => {
    const malformedUnit = makeLegacyUnit({
      safety_tags: [null],
    });

    const block = await retrieveBoundedCBTKnowledgeBlock(
      makeEntities([malformedUnit]),
      PLAN,
      'en',
    );

    expect(block).toBe('');
  });

  it('threads sessionLanguage from V10 injector into retrieval', () => {
    const injectorPath = fileURLToPath(
      new URL('../../src/lib/workflowContextInjector.js', import.meta.url),
    );
    const injectorSource = readFileSync(injectorPath, 'utf8');

    expect(injectorSource).toMatch(
      /retrieveBoundedCBTKnowledgeBlock\(\s*entities,\s*plan,\s*v10Options\?\.sessionLanguage\s*\)/,
    );
  });

  it.each([
    'distress_suitability',
    'evidence_level',
    'safety_tags',
  ])('defines schema key "%s" exactly once', (key) => {
    const schemaPath = fileURLToPath(
      new URL('../../base44/entities/CBTCurriculumUnit.jsonc', import.meta.url),
    );
    const schemaSource = readFileSync(schemaPath, 'utf8');
    const keyPattern = new RegExp(`^\\s*"${key}"\\s*:`, 'gm');
    const definitions = schemaSource.match(keyPattern) ?? [];

    expect(definitions).toHaveLength(1);
  });
});

import { describe, expect, it, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import {
  CBT_KNOWLEDGE_SUPPORTED_LANGUAGES,
  retrieveBoundedCBTKnowledgeBlock,
} from '../../src/lib/cbtKnowledgeRetrieval.js';

const seedPath = fileURLToPath(
  new URL('../../src/data/cbt-curriculum-seed-wave4.json', import.meta.url),
);
const seed = JSON.parse(readFileSync(seedPath, 'utf8'));
const eligible = seed.filter((unit) => unit.runtime_eligible_first_wave === true);
const excluded = seed.filter((unit) => unit.runtime_eligible_first_wave !== true);

function makePlan(domainHint) {
  return {
    shouldRetrieve: true,
    domainHint,
    unitTypePreference: 'any',
    distressFilter: 'any',
    treatmentArcFilter: 'any',
    skipReason: '',
  };
}

function makeEntities(unit) {
  return {
    CBTCurriculumUnit: {
      filter: vi.fn().mockResolvedValue([unit]),
    },
  };
}

describe('V10 Knowledge — seven-language seed retrieval parity', () => {
  it('retrieves all eight eligible rows in English from canonical content', async () => {
    expect(eligible).toHaveLength(8);

    for (const unit of eligible) {
      const block = await retrieveBoundedCBTKnowledgeBlock(
        makeEntities(unit),
        makePlan(unit.planner_domain),
        'en',
      );

      expect(block).toContain(unit.title);
      expect(block).toContain(unit.content.slice(0, 80));
    }
  });

  it.each(CBT_KNOWLEDGE_SUPPORTED_LANGUAGES.filter((language) => language !== 'en'))(
    'retrieves all eight eligible rows in %s from exact variants only',
    async (language) => {
      for (const unit of eligible) {
        const variant = unit.language_variants[language];
        const block = await retrieveBoundedCBTKnowledgeBlock(
          makeEntities(unit),
          makePlan(unit.planner_domain),
          language,
        );

        expect(variant.length).toBeLessThanOrEqual(300);
        expect(variant).toMatch(/[.!?]$/);
        expect(block).toContain(variant);
        expect(block).not.toContain(unit.title);
        expect(block).not.toContain(unit.content.slice(0, 80));
      }
    },
  );

  it.each(CBT_KNOWLEDGE_SUPPORTED_LANGUAGES)(
    'keeps all three deferred or safety-tagged rows excluded in %s',
    async (language) => {
      for (const unit of excluded) {
        const block = await retrieveBoundedCBTKnowledgeBlock(
          makeEntities(unit),
          makePlan(unit.planner_domain),
          language,
        );
        expect(block).toBe('');
      }
    },
  );
});

/**
 * agentWiring.sourceOrder.test.js
 *
 * Asserts per-wiring-export that source_order values are:
 *   - numeric (where present)
 *   - unique within the same wiring config (no two tool_configs share the same source_order)
 *
 * This guards against accidental duplication or non-numeric values being
 * introduced when wiring configs are extended.
 *
 * Purely additive; no production code is modified.
 */

import { describe, it, expect } from 'vitest';
import {
  CBT_THERAPIST_WIRING_STEP_1,
  AI_COMPANION_WIRING_STEP_1,
  CBT_THERAPIST_WIRING_STEP_2,
  AI_COMPANION_WIRING_STEP_2,
  CBT_THERAPIST_WIRING_STEP_3,
  AI_COMPANION_WIRING_STEP_3,
  CBT_THERAPIST_WIRING_HYBRID,
  AI_COMPANION_WIRING_HYBRID,
} from '../../src/api/agentWiring.js';

const ALL_WIRINGS = [
  { name: 'CBT_THERAPIST_WIRING_STEP_1',  wiring: CBT_THERAPIST_WIRING_STEP_1 },
  { name: 'AI_COMPANION_WIRING_STEP_1',   wiring: AI_COMPANION_WIRING_STEP_1 },
  { name: 'CBT_THERAPIST_WIRING_STEP_2',  wiring: CBT_THERAPIST_WIRING_STEP_2 },
  { name: 'AI_COMPANION_WIRING_STEP_2',   wiring: AI_COMPANION_WIRING_STEP_2 },
  { name: 'CBT_THERAPIST_WIRING_STEP_3',  wiring: CBT_THERAPIST_WIRING_STEP_3 },
  { name: 'AI_COMPANION_WIRING_STEP_3',   wiring: AI_COMPANION_WIRING_STEP_3 },
  { name: 'CBT_THERAPIST_WIRING_HYBRID',  wiring: CBT_THERAPIST_WIRING_HYBRID },
  { name: 'AI_COMPANION_WIRING_HYBRID',   wiring: AI_COMPANION_WIRING_HYBRID },
];

describe('agentWiring — source_order integrity', () => {
  for (const { name, wiring } of ALL_WIRINGS) {
    describe(name, () => {
      const configs = wiring?.tool_configs ?? [];

      it('tool_configs is a non-empty array', () => {
        expect(Array.isArray(configs)).toBe(true);
        expect(configs.length).toBeGreaterThan(0);
      });

      it('all source_order values are finite numbers (where present)', () => {
        const withOrder = configs.filter((tc) => 'source_order' in tc);
        for (const tc of withOrder) {
          expect(
            typeof tc.source_order,
            `${name} entity "${tc.entity_name}" source_order must be a number`
          ).toBe('number');
          expect(
            Number.isFinite(tc.source_order),
            `${name} entity "${tc.entity_name}" source_order must be finite`
          ).toBe(true);
        }
      });

      it('source_order values are unique within the wiring config', () => {
        const orders = configs
          .filter((tc) => 'source_order' in tc)
          .map((tc) => tc.source_order);
        const unique = new Set(orders);
        if (unique.size !== orders.length) {
          const duplicates = orders.filter(
            (val, idx) => orders.indexOf(val) !== idx
          );
          expect.fail(
            `${name} has duplicate source_order values: ${[...new Set(duplicates)].join(', ')}`
          );
        }
        expect(unique.size).toBe(orders.length);
      });

      it('source_order values are positive integers', () => {
        const withOrder = configs.filter((tc) => 'source_order' in tc);
        for (const tc of withOrder) {
          expect(
            Number.isInteger(tc.source_order) && tc.source_order > 0,
            `${name} entity "${tc.entity_name}" source_order (${tc.source_order}) must be a positive integer`
          ).toBe(true);
        }
      });
    });
  }
});

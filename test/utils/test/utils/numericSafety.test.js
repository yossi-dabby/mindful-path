import { describe, it, expect } from 'vitest';
import fc from 'fast-check';
import { NumericSafety } from './numericSafety.js';

describe('NumericSafety', () => {
  describe('Property-based tests', () => {
    it('should always return finite numbers from safeParseNumber', () => {
      fc.assert(
        fc.property(fc.anything(), (value) => {
          const result = NumericSafety.safeParseNumber(value, 0);
          return Number.isFinite(result);
        })
      );
    });

    it('should always clamp within range', () => {
      fc.assert(
        fc.property(
          fc.double({ noNaN: true }),
          fc.double({ noNaN: true }),
          fc.double({ noNaN: true }),
          (value, a, b) => {
            const min = Math.min(a, b);
            const max = Math.max(a, b);
            const result = NumericSafety.clamp(value, min, max);
            return Number.isFinite(result) && result >= min && result <= max;
          }
        )
      );
    });

    it('should validate percentages are always 0-100', () => {
      fc.assert(
        fc.property(fc.anything(), (value) => {
          const result = NumericSafety.validatePercentage(value);
          return result >= 0 && result <= 100 && Number.isFinite(result);
        })
      );
    });
  });
});

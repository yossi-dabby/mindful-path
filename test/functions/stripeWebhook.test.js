import { describe, it, expect } from 'vitest';
import { NumericSafety } from '../utils/numericSafety.js';

describe('stripeWebhook', () => {
  describe('Timestamp validation', () => {
    it('should validate subscription timestamps safely', () => {
      const testCases = [
        { timestamp: 1640995200, expected: true },
        { timestamp: NaN, expected: false },
        { timestamp: Infinity, expected: false }
      ];

      testCases.forEach(({ timestamp, expected }) => {
        const isValid = Number.isFinite(timestamp) && 
                       timestamp >= 0 && 
                       Number.isSafeInteger(timestamp);
        expect(isValid).toBe(expected);
      });
    });
  });
});

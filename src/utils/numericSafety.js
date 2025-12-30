/**
 * Numeric safety utilities to prevent overflow, NaN, Infinity, and precision loss
 */

export const NumericSafety = {
  isValidNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  },

  isSafeInteger(value) {
    return Number.isSafeInteger(value);
  },

  safeParseNumber(value, defaultValue = 0) {
    try {
      const parsed = Number(value);
      if (!Number.isFinite(parsed)) return defaultValue;
      return parsed;
    } catch {
      return defaultValue;
    }
  },

  safeParseInt(value, defaultValue = 0) {
    try {
      const parsed = parseInt(value, 10);
      if (!Number.isSafeInteger(parsed)) return defaultValue;
      return parsed;
    } catch {
      return defaultValue;
    }
  },

  clamp(value, min, max) {
    const lowerBound = Number.isFinite(min) ? min : Number.NEGATIVE_INFINITY;
    const upperBound = Number.isFinite(max) ? max : Number.POSITIVE_INFINITY;
    const [lower, upper] =
      lowerBound <= upperBound ? [lowerBound, upperBound] : [upperBound, lowerBound];
    const safeValue = Number.isFinite(value) ? value : lower;
    const clamped = Math.max(lower, Math.min(upper, safeValue));
    return Number.isFinite(clamped) ? clamped : lower;
  },

  safeAdd(a, b) {
    const result = a + b;
    if (!Number.isFinite(result)) {
      throw new Error('Addition resulted in non-finite number');
    }
    return result;
  },

  safeMultiply(a, b) {
    const result = a * b;
    if (!Number.isFinite(result)) {
      throw new Error('Multiplication resulted in non-finite number');
    }
    return result;
  },

  safeDivide(a, b, defaultValue = 0) {
    if (b === 0) return defaultValue;
    const result = a / b;
    if (!Number.isFinite(result)) return defaultValue;
    return result;
  },

  validatePercentage(value) {
    const num = this.safeParseNumber(value, 0);
    return this.clamp(num, 0, 100);
  },

  validateRating(value) {
    const num = this.safeParseNumber(value, 1);
    return this.clamp(num, 1, 10);
  }
};

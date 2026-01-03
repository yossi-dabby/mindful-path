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
    const parsed = parseInt(value, 10);
    if (Number.isNaN(parsed)) return defaultValue;
    if (!Number.isSafeInteger(parsed)) return defaultValue;
    return parsed;
  },

  clamp(value, min, max) {
    const hasMin = Number.isFinite(min);
    const hasMax = Number.isFinite(max);

    if (!Number.isFinite(value)) {
      if (hasMin) return min;
      if (hasMax) return max;
      return 0;
    }

    if (!hasMin && !hasMax) return value;
    if (!hasMin) return Math.min(value, max);
    if (!hasMax) return Math.max(value, min);

    return Math.max(min, Math.min(max, value));
  },

  safeAdd(a, b, defaultValue = 0) {
    const first = Number(a);
    const second = Number(b);
    if (!Number.isFinite(first) || !Number.isFinite(second)) return defaultValue;

    const result = first + second;
    if (!Number.isFinite(result)) return defaultValue;
    return result;
  },

  safeMultiply(a, b, defaultValue = 0) {
    const first = Number(a);
    const second = Number(b);
    if (!Number.isFinite(first) || !Number.isFinite(second)) return defaultValue;

    const result = first * second;
    if (!Number.isFinite(result)) return defaultValue;
    return result;
  },

  safeDivide(a, b, defaultValue = 0) {
    const numerator = Number(a);
    const denominator = Number(b);
    if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return defaultValue;
    if (denominator === 0) return defaultValue;

    const result = numerator / denominator;
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

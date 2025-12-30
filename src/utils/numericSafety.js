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
    if (!Number.isSafeInteger(parsed)) return defaultValue;
    return parsed;
  },

  clamp(value, min, max) {
    const parsedValue = this.safeParseNumber(value, 0);
    const parsedMin = this.safeParseNumber(min, parsedValue);
    const parsedMax = this.safeParseNumber(max, parsedValue);

    const lower = Math.min(parsedMin, parsedMax);
    const upper = Math.max(parsedMin, parsedMax);

    return Math.min(upper, Math.max(lower, parsedValue));
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

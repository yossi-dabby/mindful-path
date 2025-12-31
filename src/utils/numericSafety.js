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
      return Number.isFinite(parsed) ? parsed : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  safeParseInt(value, defaultValue = 0) {
    const parsed = parseInt(value, 10);
    return Number.isSafeInteger(parsed) ? parsed : defaultValue;
  },

  clamp(value, min, max) {
    let lower = Number.isFinite(min) ? min : -Infinity;
    let upper = Number.isFinite(max) ? max : Infinity;

    if (lower > upper) {
      [lower, upper] = [upper, lower];
    }

    const safeValue = Number.isFinite(value)
      ? value
      : Number.isFinite(lower)
        ? lower
        : Number.isFinite(upper)
          ? upper
          : 0;

    const clamped = Math.max(lower, Math.min(upper, safeValue));

    if (Number.isFinite(clamped)) return clamped;
    if (Number.isFinite(lower)) return lower;
    if (Number.isFinite(upper)) return upper;
    return 0;
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
    return Number.isFinite(result) ? result : defaultValue;
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

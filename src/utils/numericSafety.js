export const NumericSafety = {
  isValidNumber(value) {
    return typeof value === 'number' && Number.isFinite(value);
  },

  isSafeInteger(value) {
    return Number.isSafeInteger(value);
  },

  safeParseNumber(value, defaultValue = 0) {
    if (typeof value === 'symbol') return defaultValue;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : defaultValue;
  },

  safeParseInt(value, defaultValue = 0) {
    if (typeof value === 'symbol') return defaultValue;
    const parsed = Number.parseInt(value, 10);
    return Number.isSafeInteger(parsed) ? parsed : defaultValue;
  },

  clamp(value, min, max) {
    let lower = Number.isFinite(min) ? min : -Infinity;
    let upper = Number.isFinite(max) ? max : Infinity;

    if (lower > upper) {
      [lower, upper] = [upper, lower];
    }

    const safeValue = Number.isFinite(value) ? value : 0;

    const clamped = Math.max(lower, Math.min(upper, safeValue));

    if (Number.isFinite(clamped)) return clamped;
    if (!Number.isFinite(lower) && !Number.isFinite(upper)) return 0;
    if (!Number.isFinite(lower)) return upper;
    return lower;
  },

  safeAdd(a, b, defaultValue = 0) {
    const first = this.safeParseNumber(a, 0);
    const second = this.safeParseNumber(b, 0);
    const result = first + second;
    return Number.isFinite(result) ? result : defaultValue;
  },

  safeMultiply(a, b, defaultValue = 0) {
    const first = this.safeParseNumber(a, 0);
    const second = this.safeParseNumber(b, 0);
    const result = first * second;
    return Number.isFinite(result) ? result : defaultValue;
  },

  safeDivide(a, b, defaultValue = 0) {
    const numerator = this.safeParseNumber(a, 0);
    const denominator = this.safeParseNumber(b, 0);
    if (denominator === 0) return defaultValue;
    const result = numerator / denominator;
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

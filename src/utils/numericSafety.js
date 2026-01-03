export const NumericSafety = {
  safeParseNumber: (value, fallback = 0) => {
    try {
      const num = Number(value);
      return Number.isFinite(num) ? num : fallback;
    } catch {
      return fallback;
    }
  },
  clamp: (value, min, max) => Math.min(Math.max(value, min), max),
};

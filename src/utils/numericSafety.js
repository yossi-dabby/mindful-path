export const NumericSafety = {
  safeParseNumber: (value, fallback = 0) => {
    const num = Number(value);
    return Number.isFinite(num) ? num : fallback;
  },
  clamp: (value, min, max) => Math.min(Math.max(value, min), max),
};

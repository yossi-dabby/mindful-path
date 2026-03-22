/**
 * entityListNormalizer.js
 *
 * Shared utility for normalizing Base44 entity list/filter API responses.
 *
 * Root cause: when VITE_BASE44_APP_ID is missing at build time, requests are
 * sent to /api/apps/null/... which can return paginated envelopes
 * { count: N, results: [...] } instead of bare arrays.  Pages that call
 * .filter() on the response then crash at runtime.
 *
 * Usage: imported by base44Client.js to patch entity list/filter methods.
 */

/**
 * Converts a Base44 entity list/filter response to a bare array.
 *
 * @param {*} data - Raw response from entity.list() or entity.filter()
 * @returns {Array} Always returns an array — never null/undefined/object.
 */
export function normalizeEntityList(data) {
  // Happy path: already a bare array.
  if (Array.isArray(data)) return data;

  // Paginated envelope: { count: N, results: [...] }
  if (data !== null && typeof data === 'object' && Array.isArray(data.results)) {
    return data.results;
  }

  // Unexpected shape — warn in development so the root cause is obvious.
  if (import.meta.env?.DEV && data !== undefined && data !== null) {
    console.warn(
      '[entityListNormalizer] Unexpected entity list response shape; returning []:',
      typeof data,
      data
    );
  }

  return [];
}

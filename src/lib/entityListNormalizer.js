/**
 * Normalizes a response from a Base44 entity list/filter call to always return
 * a plain array, regardless of whether the SDK returned:
 *   - a bare array  →  returned as-is
 *   - a paginated envelope { count, results: [...] }  →  results extracted
 *   - anything else (null, undefined, unexpected shape)  →  empty array
 *
 * This prevents "white screen" crashes on pages that call .filter()/.map()
 * directly on what they assume is an array.
 */
export function normalizeEntityList(payload) {
	if (Array.isArray(payload)) {
		return payload;
	}
	if (payload && typeof payload === 'object' && Array.isArray(payload.results)) {
		return payload.results;
	}
	if (import.meta.env.DEV && payload !== undefined && payload !== null) {
		console.warn(
			'[entityListNormalizer] Unexpected list response shape; returning []. Received:',
			payload
		);
	}
	return [];
}

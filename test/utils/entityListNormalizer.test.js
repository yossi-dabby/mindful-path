/**
 * test/utils/entityListNormalizer.test.js
 *
 * Unit tests for the shared entity list/filter response normalizer.
 *
 * Root cause guarded: when VITE_BASE44_APP_ID is missing at Railway build time,
 * API requests target /api/apps/null/... and may return paginated envelopes
 * { count, results } instead of bare arrays.  Pages that call .filter() on
 * the response crash.  normalizeEntityList() fixes this at the shared layer.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { normalizeEntityList } from '../../src/lib/entityListNormalizer.js';

// ─── Tests ─────────────────────────────────────────────────────────────────────

describe('normalizeEntityList', () => {

  describe('bare arrays (pass-through)', () => {
    it('returns a bare array unchanged', () => {
      const arr = [{ id: '1' }, { id: '2' }];
      expect(normalizeEntityList(arr)).toBe(arr);
    });

    it('returns an empty array unchanged', () => {
      const arr = [];
      expect(normalizeEntityList(arr)).toBe(arr);
    });

    it('preserves all items in the array', () => {
      const items = [{ id: 'a', title: 'A' }, { id: 'b', title: 'B' }];
      expect(normalizeEntityList(items)).toHaveLength(2);
      expect(normalizeEntityList(items)[0].id).toBe('a');
    });
  });

  describe('paginated envelopes ({ count, results })', () => {
    it('unwraps a paginated envelope and returns the results array', () => {
      const results = [{ id: '1' }, { id: '2' }, { id: '3' }];
      const envelope = { count: 3, results };
      expect(normalizeEntityList(envelope)).toEqual(results);
    });

    it('returns the same reference as the results array inside the envelope', () => {
      const results = [{ id: '1' }];
      const envelope = { count: 1, results };
      expect(normalizeEntityList(envelope)).toBe(results);
    });

    it('handles an envelope with count:0 and empty results', () => {
      const envelope = { count: 0, results: [] };
      const out = normalizeEntityList(envelope);
      expect(Array.isArray(out)).toBe(true);
      expect(out).toHaveLength(0);
    });

    it('handles envelopes that have extra fields alongside count+results', () => {
      const results = [{ id: 'x' }];
      const envelope = { count: 1, results, next: null, previous: null };
      expect(normalizeEntityList(envelope)).toEqual(results);
    });

    it('handles an envelope with a large results array', () => {
      const results = Array.from({ length: 200 }, (_, i) => ({ id: String(i) }));
      const envelope = { count: 200, results };
      expect(normalizeEntityList(envelope)).toHaveLength(200);
    });
  });

  describe('edge / unexpected shapes → safe empty array fallback', () => {
    // Suppress console.warn for non-array, non-null unexpected shapes in these tests.
    beforeEach(() => { vi.spyOn(console, 'warn').mockImplementation(() => {}); });
    afterEach(() => { vi.restoreAllMocks(); });

    it('returns [] for null', () => {
      expect(normalizeEntityList(null)).toEqual([]);
    });

    it('returns [] for undefined', () => {
      expect(normalizeEntityList(undefined)).toEqual([]);
    });

    it('returns [] for a plain object with no results field', () => {
      expect(normalizeEntityList({ count: 5 })).toEqual([]);
    });

    it('returns [] when results field is not an array', () => {
      expect(normalizeEntityList({ count: 1, results: 'bad' })).toEqual([]);
    });

    it('returns [] for a number', () => {
      expect(normalizeEntityList(42)).toEqual([]);
    });

    it('returns [] for a string', () => {
      expect(normalizeEntityList('bad')).toEqual([]);
    });

    it('returns [] for a boolean', () => {
      expect(normalizeEntityList(true)).toEqual([]);
    });
  });

  describe('dev warning for unexpected shapes', () => {
    beforeEach(() => {
      vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      vi.restoreAllMocks();
    });

    it('emits a console.warn for an object without results (non-null unexpected shape)', () => {
      normalizeEntityList({ count: 5 });
      expect(console.warn).toHaveBeenCalledOnce();
      expect(console.warn.mock.calls[0][0]).toMatch(/entityListNormalizer/);
    });

    it('does NOT warn for null (expected no-data case)', () => {
      normalizeEntityList(null);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('does NOT warn for undefined', () => {
      normalizeEntityList(undefined);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('does NOT warn for a valid bare array', () => {
      normalizeEntityList([{ id: '1' }]);
      expect(console.warn).not.toHaveBeenCalled();
    });

    it('does NOT warn for a valid envelope', () => {
      normalizeEntityList({ count: 1, results: [{ id: '1' }] });
      expect(console.warn).not.toHaveBeenCalled();
    });
  });
});

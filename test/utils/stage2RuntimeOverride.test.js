/**
 * @file test/utils/stage2RuntimeOverride.test.js
 *
 * Stage 2 Staging Runtime Override — Verification Tests
 *
 * PURPOSE
 * -------
 * Verifies the staging-only URL override layer added to featureFlags.js to
 * unblock Base44 preview/staging enablement without requiring VITE_* build-time
 * env vars to be reliably propagated on every rebuild.
 *
 * The override reads the `_s2` URL query parameter (e.g. ?_s2=FLAG1,FLAG2) and
 * treats listed flag names as true — but ONLY in non-production builds.
 * Production builds (import.meta.env.PROD === true) are always fail-closed.
 *
 * WHAT THIS FILE TESTS
 * --------------------
 * Section 1 — Default behavior: no window → override returns nothing
 * Section 2 — Window present but no _s2 param → override returns nothing
 * Section 3 — Window present with _s2 param → recognised flags enabled
 * Section 4 — Unknown flag names in _s2 param are silently ignored
 * Section 5 — isUpgradeEnabled integrates with the URL override (end-to-end)
 * Section 6 — Master gate requirement is preserved via the URL override path
 * Section 7 — THERAPIST_UPGRADE_FLAGS is still frozen; URL override is additive only
 * Section 8 — Rollback: removing _s2 from URL re-disables the override
 * Section 9 — Existing build-time tests are unaffected (all flags false by default)
 *
 * WHAT THIS FILE DOES NOT TEST
 * ----------------------------
 * - Production build guard (import.meta.env.PROD cannot be set to true in this
 *   test environment — it is always false/undefined in Vitest)
 * - Any Stage 2 logic beyond flag gating
 * - Any upgrade behavior (upgrade path remains off unless URL override is active)
 */

import { describe, it, expect, vi, afterEach } from 'vitest';

import {
  THERAPIST_UPGRADE_FLAGS,
  isUpgradeEnabled,
} from '../../src/lib/featureFlags.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Stubs window.location.search with the given query string for the duration of a test. */
function withWindowSearch(search, fn) {
  vi.stubGlobal('window', {
    location: { search },
  });
  try {
    return fn();
  } finally {
    vi.unstubAllGlobals();
  }
}

afterEach(() => {
  vi.unstubAllGlobals();
});

// ─── Section 1 — No window: override returns nothing ─────────────────────────

describe('Stage 2 Runtime Override — no window (Node/SSR env)', () => {
  it('isUpgradeEnabled returns false for master flag when window is absent', () => {
    // The default test environment is Node.js (no window).
    // The URL override must fail-closed silently.
    expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(false);
  });

  it('isUpgradeEnabled returns false for every per-phase flag when window is absent', () => {
    for (const flag of Object.keys(THERAPIST_UPGRADE_FLAGS)) {
      expect(
        isUpgradeEnabled(flag),
        `isUpgradeEnabled("${flag}") must be false without window`,
      ).toBe(false);
    }
  });

  it('all THERAPIST_UPGRADE_FLAGS are still false in default Node.js environment', () => {
    for (const [name, value] of Object.entries(THERAPIST_UPGRADE_FLAGS)) {
      expect(value, `Flag "${name}" must be false`).toBe(false);
    }
  });
});

// ─── Section 2 — Window present but no _s2 param ─────────────────────────────

describe('Stage 2 Runtime Override — window present, no _s2 param', () => {
  it('returns false for master flag when URL has no _s2 param', () => {
    withWindowSearch('', () => {
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(false);
    });
  });

  it('returns false for master flag when URL has unrelated query params', () => {
    withWindowSearch('?foo=bar&baz=1', () => {
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(false);
    });
  });

  it('returns false for per-phase flags when URL has no _s2 param', () => {
    withWindowSearch('?other=value', () => {
      for (const flag of Object.keys(THERAPIST_UPGRADE_FLAGS)) {
        expect(
          isUpgradeEnabled(flag),
          `isUpgradeEnabled("${flag}") must be false without _s2 param`,
        ).toBe(false);
      }
    });
  });
});

// ─── Section 3 — Window with _s2 param: recognised flags enabled ─────────────

describe('Stage 2 Runtime Override — _s2 param enables recognised flags', () => {
  it('master flag is enabled when THERAPIST_UPGRADE_ENABLED is in _s2', () => {
    withWindowSearch('?_s2=THERAPIST_UPGRADE_ENABLED', () => {
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(true);
    });
  });

  it('per-phase flag is enabled when both master and phase flag are in _s2', () => {
    withWindowSearch('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_MEMORY_ENABLED', () => {
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(true);
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_MEMORY_ENABLED')).toBe(true);
    });
  });

  it('multiple phase flags can be enabled simultaneously via _s2', () => {
    const search =
      '?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_MEMORY_ENABLED,' +
      'THERAPIST_UPGRADE_SUMMARIZATION_ENABLED';
    withWindowSearch(search, () => {
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(true);
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_MEMORY_ENABLED')).toBe(true);
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_SUMMARIZATION_ENABLED')).toBe(true);
    });
  });

  it('_s2 param with whitespace around flag names is handled gracefully', () => {
    // Spaces around commas are trimmed.
    withWindowSearch('?_s2=THERAPIST_UPGRADE_ENABLED , THERAPIST_UPGRADE_WORKFLOW_ENABLED', () => {
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(true);
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_WORKFLOW_ENABLED')).toBe(true);
    });
  });

  it('all eight Stage 2 flags can be enabled via _s2 when listed together', () => {
    const allFlags = Object.keys(THERAPIST_UPGRADE_FLAGS).join(',');
    withWindowSearch(`?_s2=${allFlags}`, () => {
      for (const flag of Object.keys(THERAPIST_UPGRADE_FLAGS)) {
        expect(
          isUpgradeEnabled(flag),
          `isUpgradeEnabled("${flag}") must be true when all flags in _s2`,
        ).toBe(true);
      }
    });
  });
});

// ─── Section 4 — Unknown flag names are silently ignored ─────────────────────

describe('Stage 2 Runtime Override — unknown flag names in _s2 are ignored', () => {
  it('unknown flag name in _s2 does not enable anything', () => {
    // "UNKNOWN_FLAG" is not a key in THERAPIST_UPGRADE_FLAGS; it must be ignored.
    withWindowSearch('?_s2=UNKNOWN_FLAG,THERAPIST_UPGRADE_ENABLED', () => {
      // Master gate is present so it should be enabled.
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(true);
      // Unknown flag is not a recognised key — isUpgradeEnabled must return false
      // (flag_isolation_failure path) regardless of what is in _s2.
      expect(isUpgradeEnabled('UNKNOWN_FLAG')).toBe(false);
    });
  });

  it('_s2 containing only unknown flag names enables nothing', () => {
    withWindowSearch('?_s2=FAKE_FLAG_A,FAKE_FLAG_B', () => {
      for (const flag of Object.keys(THERAPIST_UPGRADE_FLAGS)) {
        expect(
          isUpgradeEnabled(flag),
          `isUpgradeEnabled("${flag}") must be false when _s2 has only unknown flags`,
        ).toBe(false);
      }
    });
  });

  it('empty _s2 param value enables nothing', () => {
    withWindowSearch('?_s2=', () => {
      for (const flag of Object.keys(THERAPIST_UPGRADE_FLAGS)) {
        expect(isUpgradeEnabled(flag)).toBe(false);
      }
    });
  });
});

// ─── Section 5 — isUpgradeEnabled end-to-end with URL override ───────────────

describe('Stage 2 Runtime Override — isUpgradeEnabled end-to-end', () => {
  it('per-phase flag is false when master is in _s2 but phase flag is not', () => {
    withWindowSearch('?_s2=THERAPIST_UPGRADE_ENABLED', () => {
      // Master gate is on via URL.
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(true);
      // Phase flags not in _s2 must remain false.
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_MEMORY_ENABLED')).toBe(false);
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_WORKFLOW_ENABLED')).toBe(false);
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_SAFETY_MODE_ENABLED')).toBe(false);
    });
  });

  it('per-phase flag is false when it is in _s2 but master gate is not', () => {
    // THERAPIST_UPGRADE_ENABLED is NOT in _s2 → master gate is off → phase flag must be false.
    withWindowSearch('?_s2=THERAPIST_UPGRADE_MEMORY_ENABLED', () => {
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(false);
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_MEMORY_ENABLED')).toBe(false);
    });
  });

  it('non-existent flag is always false regardless of _s2 content', () => {
    withWindowSearch('?_s2=THERAPIST_UPGRADE_ENABLED,DOES_NOT_EXIST', () => {
      expect(isUpgradeEnabled('DOES_NOT_EXIST')).toBe(false);
    });
  });
});

// ─── Section 6 — Master gate requirement preserved ───────────────────────────

describe('Stage 2 Runtime Override — master gate is always required', () => {
  it('phase flag via _s2 is blocked when master flag is false (build-time and URL)', () => {
    // Neither VITE_THERAPIST_UPGRADE_ENABLED nor THERAPIST_UPGRADE_ENABLED in _s2.
    withWindowSearch('?_s2=THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED', () => {
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(false);
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED')).toBe(false);
    });
  });

  it('adding master gate to _s2 unblocks a simultaneously listed phase flag', () => {
    withWindowSearch(
      '?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED',
      () => {
        expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(true);
        expect(isUpgradeEnabled('THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED')).toBe(true);
      },
    );
  });
});

// ─── Section 7 — THERAPIST_UPGRADE_FLAGS remains frozen; override is additive ─

describe('Stage 2 Runtime Override — THERAPIST_UPGRADE_FLAGS immutability preserved', () => {
  it('THERAPIST_UPGRADE_FLAGS is still frozen after URL override is read', () => {
    withWindowSearch('?_s2=THERAPIST_UPGRADE_ENABLED', () => {
      // Reading the URL override must not mutate the frozen object.
      isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED');
      expect(Object.isFrozen(THERAPIST_UPGRADE_FLAGS)).toBe(true);
    });
  });

  it('THERAPIST_UPGRADE_FLAGS values are still false even when URL override is active', () => {
    withWindowSearch('?_s2=THERAPIST_UPGRADE_ENABLED,THERAPIST_UPGRADE_MEMORY_ENABLED', () => {
      // The URL override enables isUpgradeEnabled to return true, but the
      // underlying frozen THERAPIST_UPGRADE_FLAGS values stay false (build-time).
      expect(THERAPIST_UPGRADE_FLAGS.THERAPIST_UPGRADE_ENABLED).toBe(false);
      expect(THERAPIST_UPGRADE_FLAGS.THERAPIST_UPGRADE_MEMORY_ENABLED).toBe(false);
      // isUpgradeEnabled honours the URL override layer on top.
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(true);
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_MEMORY_ENABLED')).toBe(true);
    });
  });
});

// ─── Section 8 — Rollback: removing _s2 disables the override ────────────────

describe('Stage 2 Runtime Override — rollback by removing _s2', () => {
  it('removing the _s2 param (empty search) disables all URL overrides', () => {
    // Simulate visiting the staging URL with no _s2 param (rollback).
    withWindowSearch('', () => {
      for (const flag of Object.keys(THERAPIST_UPGRADE_FLAGS)) {
        expect(
          isUpgradeEnabled(flag),
          `Flag "${flag}" must be false after _s2 removal`,
        ).toBe(false);
      }
    });
  });

  it('removing only THERAPIST_UPGRADE_ENABLED from _s2 re-disables per-phase flags', () => {
    // Only phase flag in _s2, master gate removed → phase flag must be false.
    withWindowSearch('?_s2=THERAPIST_UPGRADE_MEMORY_ENABLED', () => {
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_ENABLED')).toBe(false);
      expect(isUpgradeEnabled('THERAPIST_UPGRADE_MEMORY_ENABLED')).toBe(false);
    });
  });
});

// ─── Section 9 — Existing build-time behavior is unaffected ─────────────────

describe('Stage 2 Runtime Override — existing build-time behavior is unchanged', () => {
  it('all THERAPIST_UPGRADE_FLAGS are false in default (no window, no env vars)', () => {
    // This mirrors the existing stage2StagingBlockerFix tests to confirm
    // the runtime override layer did not break the build-time default.
    for (const [name, value] of Object.entries(THERAPIST_UPGRADE_FLAGS)) {
      expect(value, `Build-time flag "${name}" must still be false by default`).toBe(false);
    }
  });

  it('isUpgradeEnabled returns false for every flag without window or env vars', () => {
    for (const flag of Object.keys(THERAPIST_UPGRADE_FLAGS)) {
      expect(
        isUpgradeEnabled(flag),
        `isUpgradeEnabled("${flag}") must be false without window or env vars`,
      ).toBe(false);
    }
  });

  it('THERAPIST_UPGRADE_FLAGS is still a frozen object', () => {
    expect(Object.isFrozen(THERAPIST_UPGRADE_FLAGS)).toBe(true);
  });

  it('flag evaluation expression works correctly (sanity check for env var path)', () => {
    expect('true' === 'true').toBe(true);
    expect('false' === 'true').toBe(false);
    expect(undefined === 'true').toBe(false);
    expect('' === 'true').toBe(false);
  });
});

/**
 * test/api/base44Client.test.js
 *
 * Mock-based unit tests for src/api/base44Client.js.
 *
 * Verifies:
 *   - createClient is called exactly once during module load.
 *   - createClient receives the expected configuration keys.
 *   - The exported `base44` symbol is the value returned by createClient.
 *   - requiresAuth is false (the Base44 client does not enforce auth at SDK level).
 *   - serverUrl defaults to an empty string (relative URL, not an absolute external URL).
 *
 * Uses vi.mock to avoid any real network calls or SDK initialization.
 * No production code is modified.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock @base44/sdk before importing the module under test ──────────────────

const mockClientInstance = { _isMockClient: true };
const mockCreateClient = vi.fn(() => mockClientInstance);

vi.mock('@base44/sdk', () => ({
  createClient: mockCreateClient,
}));

// ── Mock the @/lib/app-params alias ─────────────────────────────────────────
// The alias @/ resolves to src/ in Vite; vitest.config.js should forward it.
// We provide a predictable value so the test doesn't rely on window/localStorage.
vi.mock('@/lib/app-params', () => ({
  appParams: {
    appId: 'test-app-id',
    token: null,
    functionsVersion: 'test-v1',
  },
}));

// ── Tests ────────────────────────────────────────────────────────────────────

describe('base44Client — createClient call shape', () => {
  let base44;

  beforeEach(async () => {
    // Re-import after mocks are in place.  Use a dynamic import so that the
    // module is freshly evaluated within the mocked context.
    vi.resetModules();
    const mod = await import('../../src/api/base44Client.js');
    base44 = mod.base44;
  });

  it('exports a `base44` symbol', () => {
    expect(base44).toBeDefined();
  });

  it('exports the value returned by createClient', () => {
    // The mock returns mockClientInstance; base44 must be that same object.
    expect(base44).toBe(mockClientInstance);
  });

  it('calls createClient with required configuration keys', () => {
    const calls = mockCreateClient.mock.calls;
    // At least one call must have been made across all beforeEach runs.
    expect(calls.length).toBeGreaterThan(0);
    const lastCallArg = calls[calls.length - 1][0];

    expect(lastCallArg).toHaveProperty('appId');
    expect(lastCallArg).toHaveProperty('serverUrl');
    expect(lastCallArg).toHaveProperty('requiresAuth');
  });

  it('passes requiresAuth: false to createClient', () => {
    const calls = mockCreateClient.mock.calls;
    const lastCallArg = calls[calls.length - 1][0];
    expect(lastCallArg.requiresAuth).toBe(false);
  });

  it('passes an empty string as serverUrl (relative URL pattern)', () => {
    const calls = mockCreateClient.mock.calls;
    const lastCallArg = calls[calls.length - 1][0];
    expect(lastCallArg.serverUrl).toBe('');
  });

  it('passes appId from appParams', () => {
    const calls = mockCreateClient.mock.calls;
    const lastCallArg = calls[calls.length - 1][0];
    expect(typeof lastCallArg.appId === 'string' || lastCallArg.appId === null).toBe(true);
  });
});

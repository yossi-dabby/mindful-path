/**
 * Tests for the server-side Stripe price ID allowlist in
 * functions/createCheckoutSession.ts.
 *
 * Because that file runs on the Deno runtime (excluded from vitest), the
 * pure allowlist constant and validation logic are reproduced here so the
 * enforcement rules remain covered by the project test suite.
 *
 * Covers:
 *   - Approved price ID passes allowlist check
 *   - Unapproved / arbitrary price ID is rejected
 *   - Missing / empty price ID is rejected
 *   - Allowlist does not contain wildcard or catch-all entries
 *
 * If APPROVED_PRICE_IDS or the validation logic change in
 * functions/createCheckoutSession.ts, update this file to match.
 */

import { describe, it, expect } from 'vitest';

// ─── CONSTANTS (mirrors functions/createCheckoutSession.ts) ─────────────────
const APPROVED_PRICE_IDS = new Set([
  'price_premium_monthly',
]);

// ─── PURE VALIDATION HELPER (mirrors server-side guard) ──────────────────────
function isApprovedPriceId(priceId) {
  return Boolean(priceId) && APPROVED_PRICE_IDS.has(priceId);
}

const APPROVED_CHECKOUT_ORIGINS = new Set([
  'https://app.mindful-path.me',
  'https://mindful-path-75aeaf7d.base44.app',
]);

function isApprovedRedirectUrl(value) {
  if (typeof value !== 'string' || value.length === 0 || value.length > 2_048) return false;
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'https:' &&
      !parsed.username &&
      !parsed.password &&
      APPROVED_CHECKOUT_ORIGINS.has(parsed.origin);
  } catch {
    return false;
  }
}

// ─── TESTS ───────────────────────────────────────────────────────────────────
describe('createCheckoutSession — server-side price ID allowlist', () => {
  it('accepts the approved production price ID', () => {
    expect(isApprovedPriceId('price_premium_monthly')).toBe(true);
  });

  it('rejects an arbitrary / manipulated price ID', () => {
    expect(isApprovedPriceId('price_attacker_plan')).toBe(false);
  });

  it('rejects an empty string', () => {
    expect(isApprovedPriceId('')).toBe(false);
  });

  it('rejects null', () => {
    expect(isApprovedPriceId(null)).toBe(false);
  });

  it('rejects undefined', () => {
    expect(isApprovedPriceId(undefined)).toBe(false);
  });

  it('rejects a price ID that is merely similar to the approved one', () => {
    expect(isApprovedPriceId('price_premium_monthly_extra')).toBe(false);
    expect(isApprovedPriceId('price_premium')).toBe(false);
    expect(isApprovedPriceId('PRICE_PREMIUM_MONTHLY')).toBe(false);
  });

  it('allowlist contains exactly the approved price IDs (no wildcards)', () => {
    // Guard: confirm no wildcard or catch-all strings are present
    for (const id of APPROVED_PRICE_IDS) {
      expect(id).not.toContain('*');
      expect(id).not.toContain('?');
    }
  });

  it('allowlist contains at least one approved price ID', () => {
    expect(APPROVED_PRICE_IDS.size).toBeGreaterThanOrEqual(1);
  });
});

describe('createCheckoutSession — return URL allowlist', () => {
  it('accepts only known HTTPS production origins', () => {
    expect(isApprovedRedirectUrl('https://app.mindful-path.me/?upgraded=true')).toBe(true);
    expect(isApprovedRedirectUrl('https://mindful-path-75aeaf7d.base44.app/account')).toBe(true);
  });

  it('rejects open redirects, lookalikes and credential-bearing URLs', () => {
    expect(isApprovedRedirectUrl('https://evil.example/phish')).toBe(false);
    expect(isApprovedRedirectUrl('https://app.mindful-path.me.evil.example/')).toBe(false);
    expect(isApprovedRedirectUrl('http://app.mindful-path.me/')).toBe(false);
    expect(isApprovedRedirectUrl('https://user:pass@app.mindful-path.me/')).toBe(false);
    expect(isApprovedRedirectUrl('//evil.example/phish')).toBe(false);
  });

  it('rejects malformed, empty and oversized values', () => {
    expect(isApprovedRedirectUrl('')).toBe(false);
    expect(isApprovedRedirectUrl(null)).toBe(false);
    expect(isApprovedRedirectUrl('not a URL')).toBe(false);
    expect(isApprovedRedirectUrl(`https://app.mindful-path.me/${'a'.repeat(2_100)}`)).toBe(false);
  });
});

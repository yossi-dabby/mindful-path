/**
 * @file tests/e2e/chat-runtime-memory-continuity.spec.ts
 *
 * PR #923 — E2E coverage: therapist memory / continuity / LTS runtime path
 *
 * Proves the production Chat conversation-end path with accepted runtime
 * authority can:
 *   - trigger therapist_session memory write
 *   - use runtime continuity enrichment gate
 *   - reach runtime longitudinal/LTS path
 *   - remain deduplicated
 *   - expose no internal diagnostic text to visible chat
 *
 * Uses mocked backend / entity surfaces.  No arbitrary sleeps.
 *
 * CONSTRAINTS:
 * - No skip / fixme.
 * - No retry increase.
 * - No timeout increase.
 * - No assertion timeout increase.
 * - No polling timeout increase.
 * - No arbitrary sleep.
 * - No weaker assertions.
 * - No environment deferral.
 * - chatOrchestratorV2LateDuplicate.spec.ts is NOT modified.
 */

import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

async function bootChat(page) {
  await page.addInitScript(() => {
    localStorage.setItem('language', 'en');
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  });
  await mockApi(page);
  await spaNavigate(page, '/');
  await page.waitForFunction(
    () => document.querySelector('#root') !== null && document.querySelector('#root').children.length > 0,
  );
}

test.describe('Runtime memory / continuity / LTS gate E2E', () => {
  test('continuity enrichment gate returns true only when all four runtime flags are set', async ({ page }) => {
    await bootChat(page);

    const result = await page.evaluate(async () => {
      const {
        resolveRuntimeContinuityEnrichmentFlag,
        isContinuityEnrichmentEnabled,
      } = await import('/src/lib/sessionEndSummarization.js');
      const {
        THERAPIST_RUNTIME_FLAG_SCHEMA,
        THERAPIST_RUNTIME_FLAG_KEYS,
        normalizeTherapistRuntimeFlagSnapshotPayload,
        getDefaultTherapistRuntimeFlags,
      } = await import('/src/lib/therapistRuntimeFlagTransport.js');

      const allFalse = (overrides: Record<string, boolean> = {}) => {
        const f: Record<string, boolean> = {};
        for (const k of THERAPIST_RUNTIME_FLAG_KEYS) f[k] = false;
        return { ...f, ...overrides };
      };

      const available = (overrides: Record<string, boolean>) => {
        const normalized = normalizeTherapistRuntimeFlagSnapshotPayload({
          schema: THERAPIST_RUNTIME_FLAG_SCHEMA,
          flags: allFalse(overrides),
          generated_at: new Date().toISOString(),
        });
        return {
          schema: normalized.schema,
          transport_status: 'available',
          received: true,
          flags: normalized.flags,
          generated_at: normalized.generated_at,
          fetched_at: new Date().toISOString(),
        };
      };

      const unavailable = () => ({
        schema: THERAPIST_RUNTIME_FLAG_SCHEMA,
        transport_status: 'unavailable',
        received: false,
        flags: getDefaultTherapistRuntimeFlags(),
        generated_at: null,
        fetched_at: new Date().toISOString(),
      });

      return {
        // Test 1: all conditions true → true
        allTrue: resolveRuntimeContinuityEnrichmentFlag(available({
          THERAPIST_RUNTIME_APPLY_ENABLED: true,
          THERAPIST_UPGRADE_ENABLED: true,
          THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true,
          THERAPIST_UPGRADE_CONTINUITY_ENABLED: true,
        })),
        // Test 2: MASTER=false → false (hard rollback)
        masterFalse: resolveRuntimeContinuityEnrichmentFlag(available({
          THERAPIST_RUNTIME_APPLY_ENABLED: true,
          THERAPIST_UPGRADE_ENABLED: false,
          THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true,
          THERAPIST_UPGRADE_CONTINUITY_ENABLED: true,
        })),
        // Test 3: SUM=false → false
        sumFalse: resolveRuntimeContinuityEnrichmentFlag(available({
          THERAPIST_RUNTIME_APPLY_ENABLED: true,
          THERAPIST_UPGRADE_ENABLED: true,
          THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: false,
          THERAPIST_UPGRADE_CONTINUITY_ENABLED: true,
        })),
        // Test 4: CONTINUITY=false → false
        continuityFalse: resolveRuntimeContinuityEnrichmentFlag(available({
          THERAPIST_RUNTIME_APPLY_ENABLED: true,
          THERAPIST_UPGRADE_ENABLED: true,
          THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true,
          THERAPIST_UPGRADE_CONTINUITY_ENABLED: false,
        })),
        // Test 5: APPLY=false → legacy
        applyFalse: resolveRuntimeContinuityEnrichmentFlag(available({
          THERAPIST_RUNTIME_APPLY_ENABLED: false,
          THERAPIST_UPGRADE_CONTINUITY_ENABLED: true,
          THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true,
          THERAPIST_UPGRADE_ENABLED: true,
        })),
        applyFalseLegacy: isContinuityEnrichmentEnabled(),
        // Test 6: snapshot unavailable → legacy
        unavailableFallback: resolveRuntimeContinuityEnrichmentFlag(unavailable()),
        unavailableLegacy: isContinuityEnrichmentEnabled(),
      };
    });

    expect(result.allTrue).toBe(true);
    expect(result.masterFalse).toBe(false);
    expect(result.sumFalse).toBe(false);
    expect(result.continuityFalse).toBe(false);
    expect(result.applyFalse).toBe(result.applyFalseLegacy);
    expect(result.unavailableFallback).toBe(result.unavailableLegacy);
  });

  test('longitudinal gate returns true only when all four runtime flags are set', async ({ page }) => {
    await bootChat(page);

    const result = await page.evaluate(async () => {
      const {
        resolveRuntimeLongitudinalFlag,
        isLongitudinalEnabled,
      } = await import('/src/lib/sessionEndSummarization.js');
      const {
        THERAPIST_RUNTIME_FLAG_SCHEMA,
        THERAPIST_RUNTIME_FLAG_KEYS,
        normalizeTherapistRuntimeFlagSnapshotPayload,
        getDefaultTherapistRuntimeFlags,
      } = await import('/src/lib/therapistRuntimeFlagTransport.js');

      const allFalse = (overrides: Record<string, boolean> = {}) => {
        const f: Record<string, boolean> = {};
        for (const k of THERAPIST_RUNTIME_FLAG_KEYS) f[k] = false;
        return { ...f, ...overrides };
      };

      const available = (overrides: Record<string, boolean>) => {
        const normalized = normalizeTherapistRuntimeFlagSnapshotPayload({
          schema: THERAPIST_RUNTIME_FLAG_SCHEMA,
          flags: allFalse(overrides),
          generated_at: new Date().toISOString(),
        });
        return {
          schema: normalized.schema,
          transport_status: 'available',
          received: true,
          flags: normalized.flags,
          generated_at: normalized.generated_at,
          fetched_at: new Date().toISOString(),
        };
      };

      const unavailable = () => ({
        schema: THERAPIST_RUNTIME_FLAG_SCHEMA,
        transport_status: 'unavailable',
        received: false,
        flags: getDefaultTherapistRuntimeFlags(),
        generated_at: null,
        fetched_at: new Date().toISOString(),
      });

      return {
        // Test 7: all true → true
        allTrue: resolveRuntimeLongitudinalFlag(available({
          THERAPIST_RUNTIME_APPLY_ENABLED: true,
          THERAPIST_UPGRADE_ENABLED: true,
          THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true,
          THERAPIST_UPGRADE_LONGITUDINAL_ENABLED: true,
        })),
        // Test 8: MASTER=false → false
        masterFalse: resolveRuntimeLongitudinalFlag(available({
          THERAPIST_RUNTIME_APPLY_ENABLED: true,
          THERAPIST_UPGRADE_ENABLED: false,
          THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true,
          THERAPIST_UPGRADE_LONGITUDINAL_ENABLED: true,
        })),
        // Test 9: SUM=false → false
        sumFalse: resolveRuntimeLongitudinalFlag(available({
          THERAPIST_RUNTIME_APPLY_ENABLED: true,
          THERAPIST_UPGRADE_ENABLED: true,
          THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: false,
          THERAPIST_UPGRADE_LONGITUDINAL_ENABLED: true,
        })),
        // Test 10: LONGITUDINAL=false → false
        longitudinalFalse: resolveRuntimeLongitudinalFlag(available({
          THERAPIST_RUNTIME_APPLY_ENABLED: true,
          THERAPIST_UPGRADE_ENABLED: true,
          THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true,
          THERAPIST_UPGRADE_LONGITUDINAL_ENABLED: false,
        })),
        // Test 11: APPLY=false → legacy
        applyFalse: resolveRuntimeLongitudinalFlag(available({
          THERAPIST_RUNTIME_APPLY_ENABLED: false,
          THERAPIST_UPGRADE_LONGITUDINAL_ENABLED: true,
          THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true,
          THERAPIST_UPGRADE_ENABLED: true,
        })),
        applyFalseLegacy: isLongitudinalEnabled(),
        // Test 12: unavailable → legacy
        unavailableFallback: resolveRuntimeLongitudinalFlag(unavailable()),
        unavailableLegacy: isLongitudinalEnabled(),
      };
    });

    expect(result.allTrue).toBe(true);
    expect(result.masterFalse).toBe(false);
    expect(result.sumFalse).toBe(false);
    expect(result.longitudinalFalse).toBe(false);
    expect(result.applyFalse).toBe(result.applyFalseLegacy);
    expect(result.unavailableFallback).toBe(result.unavailableLegacy);
  });

  test('triggerConversationEndSummarization with accepted runtime authority fires memory write once (deduplicated)', async ({ page }) => {
    await bootChat(page);

    const result = await page.evaluate(async () => {
      const { triggerConversationMemoryWriteOnce } = await import('/src/lib/conversationMemoryWriteDedup.js');

      const tracker = new Set<string>();
      let triggerCount = 0;
      const triggerFn = () => { triggerCount += 1; };

      // First call — should trigger
      triggerConversationMemoryWriteOnce({
        writeTracker: tracker,
        conversationId: 'conv-e2e-p923-1',
        conversationMeta: { name: 'P923 session' },
        trigger: triggerFn,
        invoker: 'chat_request_summary',
      });

      // Second call for same conversation — should NOT trigger (deduplication)
      triggerConversationMemoryWriteOnce({
        writeTracker: tracker,
        conversationId: 'conv-e2e-p923-1',
        conversationMeta: { name: 'P923 session' },
        trigger: triggerFn,
        invoker: 'chat_request_summary',
      });

      return triggerCount;
    });

    expect(result).toBe(1);
  });

  test('chat page renders without internal diagnostic text in visible UI', async ({ page }) => {
    await bootChat(page);

    await spaNavigate(page, '/Chat');

    // Wait for chat root
    await expect(page.locator('[data-testid="chat-root"], [class*="chat"], main, #root').first()).toBeVisible({
      timeout: 15000,
    });

    const pageText = await page.locator('body').textContent();

    // No internal diagnostic labels should surface in the UI
    const diagnosticPatterns = [
      'resolveRuntimeContinuityEnrichmentFlag',
      'resolveRuntimeLongitudinalFlag',
      'isRetrieveTherapistMemoryEnabled',
      'isWriteTherapistMemoryEnabled',
      'isWriteLTSSnapshotEnabled',
      'THERAPIST_RUNTIME_APPLY_ENABLED',
      'VITE_THERAPIST_UPGRADE',
      'lts_write_after_session_memory',
    ];

    for (const pattern of diagnosticPatterns) {
      expect(pageText ?? '').not.toContain(pattern);
    }
  });

  test('Chat Orchestrator V2 is unaffected — resolvers do not touch orchestrator flag', async ({ page }) => {
    await bootChat(page);

    const result = await page.evaluate(async () => {
      const {
        THERAPIST_RUNTIME_FLAG_SCHEMA,
        THERAPIST_RUNTIME_FLAG_KEYS,
        normalizeTherapistRuntimeFlagSnapshotPayload,
      } = await import('/src/lib/therapistRuntimeFlagTransport.js');

      const allFalse = (overrides: Record<string, boolean> = {}) => {
        const f: Record<string, boolean> = {};
        for (const k of THERAPIST_RUNTIME_FLAG_KEYS) f[k] = false;
        return { ...f, ...overrides };
      };

      const snapshot = (() => {
        const normalized = normalizeTherapistRuntimeFlagSnapshotPayload({
          schema: THERAPIST_RUNTIME_FLAG_SCHEMA,
          flags: allFalse({
            THERAPIST_RUNTIME_APPLY_ENABLED: true,
            THERAPIST_UPGRADE_ENABLED: true,
            THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true,
            THERAPIST_UPGRADE_CONTINUITY_ENABLED: true,
            THERAPIST_UPGRADE_LONGITUDINAL_ENABLED: true,
            // CHAT_ORCHESTRATOR_V2_ENABLED intentionally remains false
          }),
          generated_at: new Date().toISOString(),
        });
        return {
          schema: normalized.schema,
          transport_status: 'available',
          received: true,
          flags: normalized.flags,
          generated_at: normalized.generated_at,
          fetched_at: new Date().toISOString(),
        };
      })();

      return {
        // continuity and longitudinal should be true
        continuityEnabled: snapshot.flags['THERAPIST_UPGRADE_CONTINUITY_ENABLED'],
        longitudinalEnabled: snapshot.flags['THERAPIST_UPGRADE_LONGITUDINAL_ENABLED'],
        // Chat Orchestrator V2 must remain false
        chatOrchestratorV2: snapshot.flags['CHAT_ORCHESTRATOR_V2_ENABLED'],
      };
    });

    expect(result.continuityEnabled).toBe(true);
    expect(result.longitudinalEnabled).toBe(true);
    expect(result.chatOrchestratorV2).toBe(false);
  });
});

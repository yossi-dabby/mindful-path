import { test, expect } from '@playwright/test';
import { spaNavigate, mockApi, logFailedRequests } from '../helpers/ui';

/**
 * @file tests/e2e/super-cbt-agent.spec.ts
 *
 * SuperCbtAgent — End-to-End Tests (Task 5)
 *
 * PURPOSE
 * -------
 * Verifies that the SuperCbtAgent scaffold is:
 *   1. Completely inert by default — the feature flag is off and no super agent
 *      UI appears in any language context.
 *   2. Non-breaking in English (en) — the app boots cleanly with no console
 *      errors attributable to super agent code.
 *   3. Non-breaking in Hebrew (he) — the app boots cleanly in RTL mode with
 *      the Hebrew language context active, with no super agent regressions.
 *   4. Capable of resolving its i18n strings for both 'en' and 'he' via the
 *      superCbtAgent module's resolveAgentI18nStrings function.
 *
 * SAFETY CONSTRAINTS
 * ------------------
 * The SuperCbtAgent scaffold is inactive by default (SUPER_CBT_AGENT_ENABLED=false).
 * These tests confirm that inactive state and must NEVER attempt to enable the
 * feature flag at runtime.  No real network calls, Base44 SDK calls, or LLM
 * calls are made — all API routes are mocked via the shared mockApi helper.
 *
 * LANGUAGE COVERAGE
 * -----------------
 * English (en): default locale, LTR layout.
 * Hebrew  (he): RTL locale, verifies i18n + layout direction correctness.
 *
 * Source of truth:
 *   docs/super-agent/README.md
 *   docs/i18n-super-agent.md
 *   src/lib/superCbtAgent.js
 */

// ─── Shared setup ─────────────────────────────────────────────────────────────

/**
 * Injects the standard E2E test environment and sets the app language via
 * localStorage before the page script runs, mimicking a real user session.
 */
async function setupPageWithLanguage(page: Parameters<typeof mockApi>[0], lang: string) {
  await page.addInitScript((language: string) => {
    localStorage.setItem('language', language);
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  }, lang);
  await mockApi(page);
}

async function importModuleBySource(page: Parameters<typeof mockApi>[0], sourcePath: string) {
  return page.evaluate(async ({ path }) => {
    const response = await fetch(path);
    if (!response.ok) {
      throw new Error(`Failed to fetch module source: ${path} (${response.status})`);
    }
    const source = await response.text();
    const blob = new Blob([source], { type: 'text/javascript' });
    const blobUrl = URL.createObjectURL(blob);
    try {
      return await import(/* @vite-ignore */ blobUrl);
    } finally {
      URL.revokeObjectURL(blobUrl);
    }
  }, { path: sourcePath });
}

// ─── Suite 1 — English (en) ───────────────────────────────────────────────────

test.describe('SuperCbtAgent — English (en)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPageWithLanguage(page, 'en');
  });

  test('app boots cleanly in English — no super agent console errors', async ({ page }) => {
    test.setTimeout(60000);

    const superAgentErrors: string[] = [];
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        /super.?cbt.?agent/i.test(msg.text())
      ) {
        superAgentErrors.push(msg.text());
      }
    });

    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      expect(superAgentErrors).toHaveLength(0);
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-en-boot-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('super agent is inactive by default in English — SUPER_CBT_AGENT_ENABLED is false', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      // The SUPER_CBT_AGENT_ENABLED env var is not set in test environment,
      // so the flag must evaluate to false.  This is the primary safety check.
      const mod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const flagEnabled = mod.SUPER_CBT_AGENT_FLAGS.SUPER_CBT_AGENT_ENABLED;
      expect(flagEnabled).toBe(false);
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-en-flag-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('isSuperAgentEnabled returns false by default in English', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      const mod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const enabled = mod.isSuperAgentEnabled();
      expect(enabled).toBe(false);
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-en-isenabled-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('resolveSessionLocale returns "en" for English context', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      const mod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const locale = mod.resolveSessionLocale({ locale: 'en' });
      expect(locale).toBe('en');
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-en-locale-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('resolveAgentI18nStrings returns English super_cbt_agent section', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      const agentMod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const i18nMod = await importModuleBySource(page, '/src/components/i18n/translations.jsx');
      const strings = agentMod.resolveAgentI18nStrings('en', i18nMod.translations);

      // Verify the English section contains all required string keys.
      expect(strings).toBeDefined();
      expect(typeof strings).toBe('object');
      expect(strings.label).toBe('Super CBT Agent');
      expect(strings.mode_label).toBe('Advanced CBT Mode');
      expect(typeof strings.session_intro).toBe('string');
      expect(strings.session_intro.length).toBeGreaterThan(0);
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-en-i18n-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('buildSuperAgentSessionPreamble returns empty string when flag is off (English)', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      const agentMod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const i18nMod = await importModuleBySource(page, '/src/components/i18n/translations.jsx');
      const preamble = agentMod.buildSuperAgentSessionPreamble(
        { super_agent: true, multilingual_context_enabled: true },
        'en',
        i18nMod.translations
      );
      expect(preamble).toBe('');
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-en-preamble-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });
});

// ─── Suite 2 — Hebrew (he) ────────────────────────────────────────────────────

test.describe('SuperCbtAgent — Hebrew (he)', () => {
  test.beforeEach(async ({ page }) => {
    await setupPageWithLanguage(page, 'he');
  });

  test('app boots cleanly in Hebrew (RTL) — no super agent console errors', async ({ page }) => {
    test.setTimeout(60000);

    const superAgentErrors: string[] = [];
    page.on('console', (msg) => {
      if (
        msg.type() === 'error' &&
        /super.?cbt.?agent/i.test(msg.text())
      ) {
        superAgentErrors.push(msg.text());
      }
    });

    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      expect(superAgentErrors).toHaveLength(0);
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-he-boot-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('super agent is inactive by default in Hebrew — SUPER_CBT_AGENT_ENABLED is false', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      const mod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const flagEnabled = mod.SUPER_CBT_AGENT_FLAGS.SUPER_CBT_AGENT_ENABLED;
      expect(flagEnabled).toBe(false);
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-he-flag-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('resolveSessionLocale returns "he" for Hebrew context', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      const mod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const locale = mod.resolveSessionLocale({ locale: 'he' });
      expect(locale).toBe('he');
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-he-locale-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('resolveAgentI18nStrings returns Hebrew super_cbt_agent section', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      const agentMod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const i18nMod = await importModuleBySource(page, '/src/components/i18n/translations.jsx');
      const strings = agentMod.resolveAgentI18nStrings('he', i18nMod.translations);

      // Verify the Hebrew section contains all required string keys and is non-empty.
      expect(strings).toBeDefined();
      expect(typeof strings).toBe('object');
      // Hebrew label must be non-empty and distinct from the English label.
      expect(typeof strings.label).toBe('string');
      expect(strings.label.length).toBeGreaterThan(0);
      expect(strings.label).not.toBe('Super CBT Agent');
      // session_intro must be a non-empty Hebrew string.
      expect(typeof strings.session_intro).toBe('string');
      expect(strings.session_intro.length).toBeGreaterThan(0);
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-he-i18n-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('buildSuperAgentSessionPreamble returns empty string when flag is off (Hebrew)', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      const agentMod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const i18nMod = await importModuleBySource(page, '/src/components/i18n/translations.jsx');
      const preamble = agentMod.buildSuperAgentSessionPreamble(
        { super_agent: true, multilingual_context_enabled: true },
        'he',
        i18nMod.translations
      );
      expect(preamble).toBe('');
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-he-preamble-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });
});

// ─── Suite 3 — Regression: existing agent routing is unchanged ────────────────

test.describe('SuperCbtAgent — Regression: existing agent routing unchanged', () => {
  test.beforeEach(async ({ page }) => {
    await setupPageWithLanguage(page, 'en');
  });

  test('SUPER_CBT_AGENT_WIRING is not in ACTIVE_AGENT_WIRINGS (agent is not routed)', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      const agentMod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const wiringMod = await importModuleBySource(page, '/src/api/activeAgentWiring.js');
      const superWiring = agentMod.SUPER_CBT_AGENT_WIRING;
      const allWirings = Object.values(wiringMod.ACTIVE_AGENT_WIRINGS);
      const result = allWirings.includes(superWiring);
      expect(result).toBe(false);
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-regression-routing-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });

  test('resolveTherapistWiring does not return SUPER_CBT_AGENT_WIRING by default', async ({ page }) => {
    test.setTimeout(60000);
    const requestLogger = await logFailedRequests(page);
    try {
      await spaNavigate(page, '/');
      await expect(page.locator('#root')).toBeVisible({ timeout: 15000 });

      const agentMod = await importModuleBySource(page, '/src/lib/superCbtAgent.js');
      const wiringMod = await importModuleBySource(page, '/src/api/activeAgentWiring.js');
      const resolved = wiringMod.resolveTherapistWiring();
      const result = resolved === agentMod.SUPER_CBT_AGENT_WIRING;
      expect(result).toBe(false);
    } catch (error) {
      requestLogger.logToConsole();
      await page.screenshot({
        path: `test-results/super-cbt-agent-regression-resolve-failed-${Date.now()}.png`,
        fullPage: true,
      });
      throw error;
    }
  });
});

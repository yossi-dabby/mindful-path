import { test, expect, Page } from '@playwright/test';
import { spaNavigate } from '../helpers/ui';

const BASE_URL =
  process.env.PLAYWRIGHT_TEST_BASE_URL ||
  process.env.E2E_BASE_URL ||
  process.env.BASE_URL ||
  'http://127.0.0.1:5173';

const SIX_TURN_MESSAGES = [
  'runtime-turn-1',
  'runtime-turn-2',
  'runtime-turn-3-alpha',
  'runtime-turn-4',
  'runtime-turn-5',
  'runtime-turn-6',
];

const HEBREW_GROUNDING_FALLBACK = 'אין מספיק מידע';

function buildAssistantReply(turnNumber, variantLabel) {
  return `assistant-turn-${turnNumber}-${variantLabel}`;
}

function createRuntimeHarness() {
  let conversationCounter = 1;
  let assistantCounter = 0;
  let userCounter = 0;
  const conversationId = `conv-runtime-${conversationCounter}`;
  const createdDate = new Date().toISOString();
  const state = {
    conversation: {
      id: conversationId,
      agent_name: 'cbt_therapist',
      metadata: { name: 'Runtime Session', description: 'Runtime test session' },
      created_date: createdDate,
      messages: [],
    },
    activeClientRequestId: null,
    activeGenerationId: null,
    currentTurnNumber: 0,
    fallbackApplied: false,
    deterministicGrounding: false,
    lastDecisionCode: 'none',
  };

  const pushAssistantMessage = () => {
    const turnNumber = state.currentTurnNumber;
    const thirdVariant =
      turnNumber === 3 && state.conversation.messages.some((entry) => entry.role === 'user' && entry.content === 'runtime-turn-3-alpha')
        ? 'alpha'
        : turnNumber === 3
          ? 'beta'
          : `stable-${turnNumber}`;
    const content = buildAssistantReply(turnNumber, thirdVariant);
    assistantCounter += 1;
    state.lastDecisionCode = turnNumber === 3 ? 'allow_runtime_response' : 'normal_turn';
    state.fallbackApplied = false;
    state.deterministicGrounding = false;
    state.conversation.messages.push({
      id: `assistant-${assistantCounter}`,
      role: 'assistant',
      content,
      created_date: new Date().toISOString(),
      metadata: {
        grounding_guard_decision_code: state.lastDecisionCode,
        grounding_guard_fallback_replaced: false,
        response_policy_diagnostics: {
          policy_enforced: true,
        },
      },
    });
  };

  return {
    getConversationId() {
      return state.conversation.id;
    },
    getSnapshot() {
      return JSON.parse(JSON.stringify(state.conversation));
    },
    handleCreateConversation() {
      return this.getSnapshot();
    },
    handleAddMessage(postData) {
      const postedContent =
        typeof postData?.content === 'string' && postData.content.trim()
          ? postData.content.trim()
          : typeof postData?.message === 'string' && postData.message.trim()
            ? postData.message.trim()
            : `runtime-user-${Date.now()}`;
      userCounter += 1;
      state.currentTurnNumber += 1;
      state.activeClientRequestId = typeof postData?.client_request_id === 'string' ? postData.client_request_id : null;
      state.activeGenerationId = state.activeClientRequestId ? `gen-${state.activeClientRequestId}` : `gen-${state.currentTurnNumber}`;
      state.conversation.messages.push({
        id: `user-${userCounter}`,
        role: 'user',
        content: postedContent,
        created_date: new Date().toISOString(),
      });
      pushAssistantMessage();
      return {
        id: `user-${userCounter}`,
        role: 'user',
        content: postedContent,
        created_date: new Date().toISOString(),
      };
    },
    getDiagnostics() {
      const assistantCount = state.conversation.messages.filter((entry) => entry.role === 'assistant').length;
      return {
        conversationId: state.conversation.id,
        activeClientRequestId: state.activeClientRequestId,
        activeGenerationId: state.activeGenerationId,
        groundingDecisionCode: state.lastDecisionCode,
        fallbackApplied: state.fallbackApplied,
        deterministicGrounding: state.deterministicGrounding,
        assistantCount,
      };
    },
  };
}

async function installRuntimeApiMock(page: Page) {
  const harness = createRuntimeHarness();

  await page.route('**/api/**', async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    if (/\.(js|jsx|ts|tsx|mjs|cjs)(\?.*)?$/.test(url)) {
      await route.continue();
      return;
    }

    if (url.includes('/analytics/track/batch')) {
      await route.fulfill({ status: 204, body: '' });
      return;
    }

    if (url.includes('/app-logs/')) {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ success: true }) });
      return;
    }

    if (url.includes('/public-settings/by-id/')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ id: 'public-settings-test', flags: {}, created_date: new Date().toISOString(), updated_date: new Date().toISOString() }),
      });
      return;
    }

    if (url.includes('/entities/User/me') || url.includes('/auth/me') || url.includes('/auth/session')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 'runtime-user',
          email: 'runtime@example.com',
          full_name: 'Runtime User',
          role: 'user',
          onboarding_completed: true,
          created_date: new Date().toISOString(),
        }),
      });
      return;
    }

    if (url.includes('/functions/') && method === 'POST') {
      if (url.includes('enhancedCrisisDetector')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ data: { is_crisis: false, severity: 'none', confidence: 0 } }),
        });
        return;
      }
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ data: { success: true } }) });
      return;
    }

    if (url.includes('/entities/') && method === 'GET') {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([]) });
      return;
    }

    if (url.includes('/agents/conversations/') && url.includes('/messages') && method === 'POST') {
      let payload = {};
      try {
        payload = req.postDataJSON();
      } catch {
        payload = {};
      }
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(harness.handleAddMessage(payload)),
      });
      return;
    }

    if (url.includes('/agents/conversations/') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(harness.getSnapshot()),
      });
      return;
    }

    if (url.includes('/agents/conversations') && method === 'POST') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(harness.handleCreateConversation()),
      });
      return;
    }

    if (url.includes('/agents/conversations') && method === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([harness.getSnapshot()]),
      });
      return;
    }

    await route.continue();
  });

  await page.exposeFunction('__CHAT_RUNTIME_E2E_DIAGNOSTICS__', () => harness.getDiagnostics());
}

async function bootstrapChat(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    localStorage.setItem('language', 'en');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
    document.addEventListener('DOMContentLoaded', () => {
      document.body.setAttribute('data-test-env', 'true');
    });
  });
  await installRuntimeApiMock(page);
  await spaNavigate(page, '/Chat');
  await page.waitForFunction(() => document.querySelector('[data-page-ready="true"]') !== null, { timeout: 20000 });
}

async function startConversation(page: Page) {
  const startButton = page.getByText('Start Your First Session');
  if (await startButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await startButton.click();
  }
  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });
}

async function collectTurnEvidence(page: Page, turnNumber: number) {
  return page.evaluate(async (currentTurn) => {
    const input = document.querySelector('[data-testid="therapist-chat-input"]');
    const send = document.querySelector('[data-testid="therapist-chat-send"]');
    const loading = document.querySelector('[data-testid="chat-loading"]');
    const messageNodes = Array.from(document.querySelectorAll('[data-testid="chat-messages"] > div, [data-testid="chat-messages"] [dir]'));
    const assistantTexts = Array.from(document.querySelectorAll('[dir]'))
      .map((node) => (node.textContent || '').trim())
      .filter((text) => text.startsWith('assistant-turn-'));
    const diagnostics = typeof (window as any).__CHAT_RUNTIME_E2E_DIAGNOSTICS__ === 'function'
      ? await (window as any).__CHAT_RUNTIME_E2E_DIAGNOSTICS__()
      : null;
    return {
      turnNumber: currentTurn,
      conversationId: diagnostics?.conversationId || null,
      clientRequestId: diagnostics?.activeClientRequestId || null,
      generationState: {
        loadingVisible: !!loading,
        inputDisabled: !!(input as HTMLTextAreaElement | null)?.hasAttribute('disabled'),
        sendDisabled: !!(send as HTMLButtonElement | null)?.hasAttribute('disabled'),
      },
      completionState: {
        groundingDecisionCode: diagnostics?.groundingDecisionCode || null,
        fallbackApplied: diagnostics?.fallbackApplied === true,
        assistantCount: diagnostics?.assistantCount ?? assistantTexts.length,
        loadingVisibleAfterTurn: !!loading,
      },
      assistantReplyKeys: assistantTexts,
      domMessageBlockCount: messageNodes.length,
    };
  }, turnNumber);
}

async function sendTurn(page: Page, message: string, turnNumber: number) {
  const input = page.locator('[data-testid="therapist-chat-input"]');
  const send = page.locator('[data-testid="therapist-chat-send"]');
  await expect(input).toBeEnabled({ timeout: 15000 });
  await expect(send).toBeEnabled({ timeout: 15000 });
  await input.fill(message);
  await send.click();
  await expect(page.getByText(message).last()).toBeVisible({ timeout: 15000 });
  await expect(page.locator('[data-testid="chat-loading"]')).toBeVisible({ timeout: 15000 });
  const expectedAssistant = turnNumber === 3 && message === 'runtime-turn-3-alpha'
    ? buildAssistantReply(3, 'alpha')
    : turnNumber === 3
      ? buildAssistantReply(3, 'beta')
      : buildAssistantReply(turnNumber, `stable-${turnNumber}`);
  await expect(page.getByText(expectedAssistant)).toBeVisible({ timeout: 15000 });
  await expect(page.locator('[data-testid="chat-loading"]')).toHaveCount(0, { timeout: 15000 });
  await expect(input).toBeEnabled({ timeout: 15000 });
  await expect(send).toBeEnabled({ timeout: 15000 });
  return collectTurnEvidence(page, turnNumber);
}

for (const localePath of ['/Chat']) {
  test.describe('Chat runtime six-turn scenario', () => {
    test(`proves six sequential runtime turns on ${localePath}`, async ({ page }) => {
      test.setTimeout(120000);
      await bootstrapChat(page);
      await startConversation(page);

      const evidence = [];

      for (let index = 0; index < SIX_TURN_MESSAGES.length; index += 1) {
        const turn = index + 1;
        evidence.push(await sendTurn(page, SIX_TURN_MESSAGES[index], turn));
      }

      expect(evidence[0].completionState.assistantCount).toBe(1);
      expect(evidence[1].completionState.assistantCount).toBe(2);
      expect(evidence[2].assistantReplyKeys).toContain(buildAssistantReply(3, 'alpha'));
      expect(evidence[2].assistantReplyKeys).not.toContain(HEBREW_GROUNDING_FALLBACK);
      expect(evidence[3].completionState.assistantCount).toBe(4);
      expect(evidence[4].completionState.assistantCount).toBe(5);
      expect(evidence[5].completionState.assistantCount).toBe(6);
      for (const turnEvidence of evidence) {
        expect(turnEvidence.generationState.loadingVisible).toBe(false);
        expect(turnEvidence.completionState.loadingVisibleAfterTurn).toBe(false);
        expect(turnEvidence.generationState.inputDisabled).toBe(false);
        expect(turnEvidence.generationState.sendDisabled).toBe(false);
        expect(turnEvidence.completionState.fallbackApplied).toBe(false);
        expect(new Set(turnEvidence.assistantReplyKeys).size).toBe(turnEvidence.assistantReplyKeys.length);
      }

      await page.reload({ waitUntil: 'domcontentloaded' });
      await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(buildAssistantReply(6, 'stable-6'))).toBeVisible({ timeout: 15000 });
      const postReloadEvidence = await sendTurn(page, 'runtime-turn-7-after-reload', 7);
      expect(postReloadEvidence.completionState.assistantCount).toBe(7);

      console.log(JSON.stringify({ runtimeEvidence: evidence, postReloadEvidence }));
    });
  });
}

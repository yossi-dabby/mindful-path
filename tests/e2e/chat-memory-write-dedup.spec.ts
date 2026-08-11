import { test, expect, type Page } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

const THERAPIST_RUNTIME_FLAG_SCHEMA = 'therapist-runtime-flags-v1';
const SUMMARY_BUTTON_TEXT = 'Yes, create summary';

function buildRuntimeFlags() {
  return {
    THERAPIST_UPGRADE_ENABLED: true,
    THERAPIST_UPGRADE_MEMORY_ENABLED: false,
    THERAPIST_UPGRADE_SUMMARIZATION_ENABLED: true,
    THERAPIST_UPGRADE_WORKFLOW_ENABLED: false,
    THERAPIST_UPGRADE_RETRIEVAL_ORCHESTRATION_ENABLED: false,
    THERAPIST_UPGRADE_ALLOWLIST_WRAPPER_ENABLED: false,
    THERAPIST_UPGRADE_SAFETY_MODE_ENABLED: false,
    THERAPIST_UPGRADE_FORMULATION_CONTEXT_ENABLED: false,
    THERAPIST_UPGRADE_FORMULATION_LED_ENABLED: false,
    THERAPIST_UPGRADE_CONTINUITY_ENABLED: false,
    THERAPIST_UPGRADE_STRATEGY_ENABLED: false,
    THERAPIST_UPGRADE_LONGITUDINAL_ENABLED: false,
    THERAPIST_UPGRADE_KNOWLEDGE_ENABLED: false,
    THERAPIST_UPGRADE_COMPETENCE_ENABLED: false,
    THERAPIST_UPGRADE_PLANNER_FIRST_ENABLED: false,
    CONTEXT_COMPOSER_V2_ENABLED: false,
    CHAT_ORCHESTRATOR_V2_ENABLED: false,
    THERAPIST_RUNTIME_APPLY_ENABLED: true,
  };
}

function buildMessage(role: 'user' | 'assistant', content: string, id: string) {
  return {
    id,
    role,
    content,
    created_at: new Date().toISOString(),
    metadata: { status: 'completed', completed: true },
    status: 'completed',
  };
}

async function setupDedupFixture(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('language', 'en');
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  });

  await mockApi(page);

  let conversationCounter = 0;
  let messageCounter = 0;
  let summaryWriteCount = 0;
  const conversations: Array<Record<string, any>> = [];
  const conversationMessages = new Map<string, Array<Record<string, any>>>();

  function ensureConversation(id: string) {
    return conversations.find((conversation) => conversation.id === id) || null;
  }

  async function createConversation(route: any) {
    conversationCounter += 1;
    const id = `test-conversation-${conversationCounter}`;
    const conversation = {
      id,
      agent_name: 'cbt_therapist',
      metadata: { name: `Session ${conversationCounter}`, description: 'dedup coverage' },
      messages: [],
      created_date: new Date().toISOString(),
    };
    conversations.unshift(conversation);
    conversationMessages.set(id, []);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(conversation),
    });
  }

  await page.route('**/api/**/functions/therapistRuntimeFlagSnapshot', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        data: {
          schema: THERAPIST_RUNTIME_FLAG_SCHEMA,
          flags: buildRuntimeFlags(),
          generated_at: new Date().toISOString(),
        },
      }),
    });
  });

  await page.route('**/api/**/functions/generateSessionSummary', async (route) => {
    summaryWriteCount += 1;
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ data: { success: true, id: `summary-${summaryWriteCount}` } }),
    });
  });

  await page.route('**/api/**/agents/conversations', async (route) => {
    const request = route.request();
    if (request.method() === 'GET') {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(conversations),
      });
      return;
    }

    if (request.method() === 'POST') {
      await createConversation(route);
      return;
    }

    await route.continue();
  });

  await page.route('**/api/**/agents/conversations/test-conversation-**', async (route) => {
    const request = route.request();
    if (request.method() !== 'GET') {
      await route.continue();
      return;
    }

    const id = route.request().url().split('/agents/conversations/')[1]?.split('?')[0] || '';
    const conversation = ensureConversation(id);
    const messages = conversationMessages.get(id) || [];

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id,
        agent_name: 'cbt_therapist',
        metadata: conversation?.metadata || { name: id, description: 'dedup coverage' },
        messages,
        created_date: conversation?.created_date || new Date().toISOString(),
      }),
    });
  });

  await page.route('**/api/**/agents/conversations/**/messages**', async (route) => {
    const request = route.request();
    const id = request.url().split('/agents/conversations/')[1]?.split('/messages')[0] || '';
    const body = request.postDataJSON?.() as Record<string, unknown>;
    const userContent = String(body?.content || body?.message || '').trim();

    messageCounter += 1;
    const assistantContent =
      userContent === SUMMARY_BUTTON_TEXT
        ? 'Here is your summary.'
        : `Therapist reply ${messageCounter}`;

    const messages = conversationMessages.get(id) || [];
    messages.push(
      buildMessage('user', userContent || `User turn ${messageCounter}`, `user-${messageCounter}`),
      buildMessage('assistant', assistantContent, `assistant-${messageCounter}`),
    );
    conversationMessages.set(id, messages);

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        role: 'user',
        content: userContent,
        created_date: new Date().toISOString(),
      }),
    });
  });

  await spaNavigate(page, '/Chat');
  const input = page.locator('[data-testid="therapist-chat-input"]');
  await expect(input).toBeVisible({ timeout: 15000 });

  const newConversationButton = page.getByRole('button', { name: /New conversation/i });
  await newConversationButton.click();
  await expect(page.getByRole('button', { name: 'Session 1' })).toBeVisible();

  async function sendMeaningfulConversation() {
    const sendButton = page.locator('[data-testid="therapist-chat-send"]');
    for (const turn of ['First concern', 'Second concern', 'Third concern']) {
      await input.fill(turn);
      await expect(sendButton).toBeEnabled();
      await sendButton.click();
      await expect(page.getByText(`Therapist reply ${messageCounter}`, { exact: true })).toBeVisible({
        timeout: 15000,
      });
    }
    await expect(page.locator('[data-testid="summary-prompt-card"]')).toBeVisible();
  }

  return {
    getSummaryWriteCount: () => summaryWriteCount,
    newConversationButton,
    sendMeaningfulConversation,
  };
}

test.describe('Chat memory-write dedup', () => {
  test('requestSummary then conversation switch triggers one structured memory write total', async ({ page }) => {
    const fixture = await setupDedupFixture(page);

    await fixture.sendMeaningfulConversation();
    await page.getByRole('button', { name: SUMMARY_BUTTON_TEXT }).click();

    await expect.poll(() => fixture.getSummaryWriteCount()).toBe(1);

    await fixture.newConversationButton.click();
    await expect(page.getByRole('button', { name: 'Session 2' })).toBeVisible();
    await expect.poll(() => fixture.getSummaryWriteCount()).toBe(1);
  });

  test('conversation switch then duplicate switch does not double-write the same conversation', async ({ page }) => {
    const fixture = await setupDedupFixture(page);

    await fixture.sendMeaningfulConversation();
    await fixture.newConversationButton.click();
    await expect(page.getByRole('button', { name: 'Session 2' })).toBeVisible();
    await expect.poll(() => fixture.getSummaryWriteCount()).toBe(1);

    const sessionOneButton = page.getByRole('button', { name: 'Session 1' });
    await sessionOneButton.click();
    await sessionOneButton.click();

    await expect.poll(() => fixture.getSummaryWriteCount()).toBe(1);
  });
});

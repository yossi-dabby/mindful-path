import { test, expect, type Page } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';
import { SAFE_CONVERSATION_ROUTE_PATTERNS } from '../helpers/ui';

function buildMessage(role: 'user' | 'assistant', id: string, content: string) {
  return {
    id,
    role,
    content,
    created_at: new Date().toISOString(),
    metadata: role === 'assistant' ? { status: 'completed', completed: true } : { status: 'completed' },
    status: 'completed',
  };
}

async function setupLateReplayFixture(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('language', 'en');
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  });

  await mockApi(page);

  const activeConversationId = 'test-conversation-123';
  const messages: Array<any> = [];
  const diagnostics: Array<{ type: string; payload: string }> = [];
  // pollStage tracks the turn-2 polling phase:
  //   0 = before any turn-2 poll
  //   1 = first poll for turn 2 observed (u1, a1, u2 in messages, a2 not yet visible)
  //   2 = second poll for turn 2 observed (a2 added to messages)
  //
  // a2 is injected synchronously on the second GET so there is no timer-based
  // race between the Node.js event loop and the browser's 500 ms polling timer.
  let pollStage = 0;

  page.on('console', (msg) => {
    const text = msg.text();
    if (text.includes('[S2Debug]') || text.includes('[V2Orchestrator]')) {
      diagnostics.push({ type: msg.type(), payload: text });
    }
  });

  await page.route('**/api/**/agents/conversations', async (route) => {
    if (route.request().method() !== 'POST') {
      await route.continue();
      return;
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: activeConversationId,
        agent_name: 'cbt_therapist',
        metadata: { name: 'Late replay runtime test' },
        messages: [],
        created_date: new Date().toISOString(),
      }),
    });
  });

  await page.route(SAFE_CONVERSATION_ROUTE_PATTERNS.CONVERSATION_BY_ID, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    // Advance pollStage based on messages.length so we don't depend on the
    // MESSAGES_POST handler having already run before this GET fires.
    // messages.length >= 3 means u1, a1, u2 are present (turn 2 was sent).
    //
    // Stage 0 → 1 (first poll after turn 2): return [u1, a1, u2] without a2 so
    // the orchestrator exercises the "reply not yet ready" polling-continuation
    // path before a2 becomes visible.
    //
    // Stage 1 → 2 (second poll after turn 2): inject a2 synchronously so the
    // orchestrator receives [u1, a1, u2, a2] and can commit "Assistant B".
    // Synchronous injection avoids any timer-based race with the browser's
    // polling timer that caused intermittent CI failures.
    if (messages.length >= 3 && pollStage === 0) {
      pollStage = 1;
    } else if (messages.length >= 3 && pollStage === 1) {
      if (!messages.some((m) => m.id === 'a2')) {
        messages.push(buildMessage('assistant', 'a2', 'Assistant B'));
      }
      pollStage = 2;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: activeConversationId,
        agent_name: 'cbt_therapist',
        metadata: { name: 'Late replay runtime test' },
        messages: messages.slice(),
        created_date: new Date().toISOString(),
      }),
    });
  });

  await page.route(SAFE_CONVERSATION_ROUTE_PATTERNS.MESSAGES_POST, async (route) => {
    const body = route.request().postDataJSON?.() as any;
    const content = String(body?.content || '');
    const userTurn = messages.filter((m) => m.role === 'user').length + 1;
    messages.push(buildMessage('user', `u${userTurn}`, content));
    if (userTurn === 1) {
      messages.push(buildMessage('assistant', 'a1', 'Assistant A'));
    }
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        role: 'user',
        content,
        created_date: new Date().toISOString(),
      }),
    });
  });

  await spaNavigate(page, '/Chat?_s2=CHAT_ORCHESTRATOR_V2_ENABLED&_s2debug=true');
  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });

  return { diagnostics, getPollStage: () => pollStage };
}

test.describe('Chat V2 late duplicate runtime', () => {
  test('stale previous-turn assistant does not close turn 2 before assistant B arrives', async ({ page }) => {
    test.setTimeout(60000);
    const fixture = await setupLateReplayFixture(page);
    const input = page.locator('[data-testid="therapist-chat-input"]');
    const send = page.locator('[data-testid="therapist-chat-send"]');

    await input.fill('User message 1');
    await send.click();
    await expect(page.getByText('Assistant A', { exact: true })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Assistant A', { exact: true })).toHaveCount(1);

    await input.fill('User message 2');
    await send.click();

    await expect(input).toHaveValue('', { timeout: 5000 });
    await expect(page.getByText('Assistant A', { exact: true })).toHaveCount(1);

    await expect(page.getByText('Assistant B', { exact: true })).toBeVisible({ timeout: 15000 });
    expect(fixture.getPollStage()).toBe(2);
    await expect(page.getByText('Assistant B', { exact: true })).toHaveCount(1);
    await expect(page.getByText('Assistant A', { exact: true })).toHaveCount(1);

    const lifecycle = await page.evaluate(() => {
      const entries = (window as any).__S2_DEBUG_LIFECYCLE_LOGS__ || [];
      return Array.isArray(entries) ? entries : [];
    });
    const staleEvidence = lifecycle.some((entry: any) =>
      entry?.rejection_reason === 'stale_previous_turn_response' ||
      entry?.rejection_reason === 'no_new_assistant_for_active_turn' ||
      entry?.polling_continues === true);
    const diagnosticStaleEvidence = fixture.diagnostics.some((entry) =>
      entry.payload.includes('stale_previous_turn_response') ||
      entry.payload.includes('no_new_assistant_for_active_turn') ||
      entry.payload.includes('"polling_continues":true'));
    const pollingAcceptedVisible = await page.getByText(/Polling:accepted/, { exact: false }).count() > 0;
    expect(staleEvidence || diagnosticStaleEvidence || pollingAcceptedVisible).toBe(true);
    expect(lifecycle.some((entry: any) =>
      entry?.terminal_reason === 'visible_terminal_result_committed' &&
      typeof entry?.client_request_id === 'string' &&
      entry.client_request_id.length > 0)).toBe(true);
  });
});

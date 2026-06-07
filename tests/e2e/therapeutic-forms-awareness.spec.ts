import { test, expect, type Page } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

const MOCK_CONVERSATION_ID = 'test-conversation-123';

async function setupChatWithTherapeuticFormMocks(page: Page, language: 'en' | 'he') {
  await page.addInitScript((lang: string) => {
    localStorage.setItem('language', lang);
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  }, language);

  await mockApi(page);

  let conversationMessages: Array<{ role: 'user' | 'assistant'; content: string; metadata?: Record<string, unknown> }> = [];

  await page.route(`**/api/**/agents/conversations/${MOCK_CONVERSATION_ID}/messages**`, async (route) => {
    const body = route.request().postDataJSON?.() as { content?: string } | undefined;
    const content = String(body?.content || '');
    const visibleUserContent = content
      .replace(/\n?\[FORM_ROUTER_CONTEXT\][\s\S]*$/, '')
      .replace(/\n?\[ATTACHMENT_CONTEXT\][\s\S]*$/, '')
      .replace(/\n?\[ATTACHMENT_METADATA\][\s\S]*$/, '')
      .trim();

    const assistantContent = /מספר טפסים במקביל|multiple forms in parallel|only one form at a time/i.test(visibleUserContent)
      ? (language === 'he' ? 'אני יכול רק טופס אחד בכל פעם.' : 'I can send only one form at a time.')
      : 'Done.';

    conversationMessages = [
      ...conversationMessages,
      {
        role: 'user',
        content,
        metadata: { session_language: language },
      },
      {
        role: 'assistant',
        content: assistantContent,
        metadata: {},
      },
    ];

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

  await page.route(`**/api/**/agents/conversations/${MOCK_CONVERSATION_ID}**`, async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: MOCK_CONVERSATION_ID,
        agent_name: 'cbt_therapist',
        metadata: { name: 'Therapeutic Forms Test Session', description: 'Deterministic routing verification' },
        messages: conversationMessages,
        created_date: new Date().toISOString(),
      }),
    });
  });

  await spaNavigate(page, '/Chat');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });
}

async function sendChatMessage(page: Page, message: string) {
  const input = page.locator('[data-testid="therapist-chat-input"]');
  const sendButton = page.locator('[data-testid="therapist-chat-send"]');
  await input.fill(message);
  await sendButton.click();
}

function openLabel(language: 'en' | 'he') {
  return language === 'he' ? 'פתח' : 'Open';
}

function downloadLabel(language: 'en' | 'he') {
  return language === 'he' ? 'הורד' : 'Download Worksheet';
}

async function waitForGeneratedCards(page: Page, language: 'en' | 'he', minimumCount = 1) {
  const openButtons = page.getByRole('button', { name: openLabel(language) });
  await expect.poll(async () => openButtons.count(), { timeout: 15000 }).toBeGreaterThanOrEqual(minimumCount);
  return openButtons;
}

test.describe('therapeutic forms awareness e2e', () => {
  test('hebrew first-message form request attaches a hebrew form with open/download', async ({ page }) => {
    await setupChatWithTherapeuticFormMocks(page, 'he');
    await sendChatMessage(page, 'שלח לי טופס לילד עם חרדה בעברית');

    await waitForGeneratedCards(page, 'he', 1);
    await expect(page.getByRole('button', { name: downloadLabel('he') }).first()).toBeVisible();

    const transcript = await page.locator('[data-testid="chat-messages"]').textContent();
    expect(transcript).toMatch(/[\u0590-\u05FF]/);
    expect(transcript).not.toContain('Message send failed');
  });

  test('hebrew multi-form request renders multiple cards with max five attachments', async ({ page }) => {
    await setupChatWithTherapeuticFormMocks(page, 'he');
    await sendChatMessage(page, 'שלח לי כמה טפסים לילד עם חרדת פרידה');

    const openButtons = await waitForGeneratedCards(page, 'he', 2);
    const count = await openButtons.count();
    expect(count).toBeGreaterThan(1);
    expect(count).toBeLessThanOrEqual(5);
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('נפרדים בשלום');
  });

  test('capability answer says multi-form is supported in hebrew', async ({ page }) => {
    await setupChatWithTherapeuticFormMocks(page, 'he');
    await sendChatMessage(page, 'האם אתה יכול לשלוח מספר טפסים במקביל או רק טופס אחד בכל פעם');

    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('כן. אני יכול לשלוח כמה טפסים יחד, עד 5 טפסים בתגובה אחת.');
    await expect(page.locator('[data-testid="chat-messages"]')).not.toContainText('רק טופס אחד');
  });

  test('english request stays english-only', async ({ page }) => {
    await setupChatWithTherapeuticFormMocks(page, 'en');
    await sendChatMessage(page, 'Send me My Calm Plan in English');

    await waitForGeneratedCards(page, 'en', 1);
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('My Calm Plan');
    const transcript = await page.locator('[data-testid="chat-messages"]').textContent();
    expect(transcript).not.toMatch(/[\u0590-\u05FF]/);
  });

  test('newly uploaded hebrew exact-title request resolves deterministically', async ({ page }) => {
    await setupChatWithTherapeuticFormMocks(page, 'he');
    await sendChatMessage(page, 'שלח לי את הטופס נפרדים בשלום');

    await waitForGeneratedCards(page, 'he', 1);
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('נפרדים בשלום');
  });

  test('hebrew clinical-need request resolves a relevant hebrew attachment', async ({ page }) => {
    await setupChatWithTherapeuticFormMocks(page, 'he');
    await sendChatMessage(page, 'אני צריך טופס לילד עם חרדת פרידה');

    await waitForGeneratedCards(page, 'he', 1);
    await expect(page.locator('[data-testid="chat-messages"]')).toContainText('נפרדים בשלום');
    const transcript = await page.locator('[data-testid="chat-messages"]').textContent();
    expect(transcript).not.toContain('My Calm Plan');
  });
});

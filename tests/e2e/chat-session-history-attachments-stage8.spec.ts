import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

const HISTORY_ATTACHMENT_URL = 'https://files.example.com/history-image.png';
const IMAGE_PNG_1X1_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnR1F4AAAAASUVORK5CYII=';

async function startChatWithSessionHistoryMocks(page: Parameters<typeof mockApi>[0]) {
  await page.addInitScript(() => {
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  });

  await mockApi(page);

  const conversations = [
    {
      id: 'conv-attach',
      agent_name: 'cbt_therapist',
      metadata: { name: 'Attachment Session', description: 'Contains historical attachment message' },
      created_date: '2026-04-01T10:00:00.000Z',
    },
    {
      id: 'conv-text',
      agent_name: 'cbt_therapist',
      metadata: { name: 'Text Session', description: 'Text-only historical session' },
      created_date: '2026-03-30T09:00:00.000Z',
    },
  ];

  const messageStore: Record<string, any[]> = {
    'conv-attach': [
      {
        id: 'u-attach-1',
        role: 'user',
        content: 'Please review this image.',
        metadata: {
          attachment: {
            type: 'image',
            url: HISTORY_ATTACHMENT_URL,
            name: 'history-image.png',
          },
        },
      },
      {
        id: 'a-attach-1',
        role: 'assistant',
        content: 'I can see your uploaded image.',
        metadata: {},
      },
    ],
    'conv-text': [
      {
        id: 'u-text-legacy',
        role: 'user',
        content: 'Legacy text-only message from before attachments.',
      },
      {
        id: 'a-text-legacy',
        role: 'assistant',
        content: 'Thanks for sharing. Let us continue from here.',
      },
    ],
  };

  await page.route('**/api/**/agents/conversations**', async (route) => {
    const req = route.request();
    const url = req.url();
    const method = req.method();

    if (method !== 'GET') {
      await route.continue();
      return;
    }

    const parsed = new URL(url);
    const agentName = parsed.searchParams.get('agent_name');
    const list = agentName === 'cbt_therapist' ? conversations : [];
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(list),
    });
  });

  await page.route('**/api/**/agents/conversations/*', async (route) => {
    const req = route.request();
    if (req.method() !== 'GET') {
      await route.continue();
      return;
    }

    const conversationId = req.url().split('/').pop() || '';
    const base = conversations.find((c) => c.id === conversationId);
    if (!base) {
      await route.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Not found' }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        ...base,
        messages: messageStore[conversationId] || [],
      }),
    });
  });

  await spaNavigate(page, '/Chat');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});
  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });
}

test.describe('Stage 8 session/history attachment stability', () => {
  test('historical attachment remains stable across conversation switching and full reload', async ({ page }) => {
    await startChatWithSessionHistoryMocks(page);

    await page.getByRole('button', { name: /Attachment Session/i }).click();
    await expect(page.getByText('Please review this image.')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`img[src="${HISTORY_ATTACHMENT_URL}"]`)).toHaveCount(1);

    await page.getByRole('button', { name: /Text Session/i }).click();
    await expect(page.getByText('Legacy text-only message from before attachments.')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`img[src="${HISTORY_ATTACHMENT_URL}"]`)).toHaveCount(0);

    await page.getByRole('button', { name: /Attachment Session/i }).click();
    await expect(page.getByText('Please review this image.')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`img[src="${HISTORY_ATTACHMENT_URL}"]`)).toHaveCount(1);

    await page.reload({ waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

    await page.getByRole('button', { name: /Attachment Session/i }).click();
    await expect(page.getByText('Please review this image.')).toBeVisible({ timeout: 10000 });
    await expect(page.locator(`img[src="${HISTORY_ATTACHMENT_URL}"]`)).toHaveCount(1);
  });

  test('unsent draft attachment does not leak when switching sessions from history', async ({ page }) => {
    await startChatWithSessionHistoryMocks(page);

    await page.getByRole('button', { name: /Attachment Session/i }).click();
    await page.locator('input[type="file"]').setInputFiles({
      name: 'unsent-stage8.png',
      mimeType: 'image/png',
      buffer: Buffer.from(IMAGE_PNG_1X1_BASE64, 'base64'),
    });
    await expect(page.getByText('unsent-stage8.png')).toBeVisible({ timeout: 10000 });

    await page.getByRole('button', { name: /Text Session/i }).click();
    await expect(page.getByText('Legacy text-only message from before attachments.')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('unsent-stage8.png')).toHaveCount(0);

    await page.getByRole('button', { name: /Attachment Session/i }).click();
    await expect(page.locator(`img[src="${HISTORY_ATTACHMENT_URL}"]`)).toHaveCount(1);
    await expect(page.getByText('unsent-stage8.png')).toHaveCount(0);
  });
});

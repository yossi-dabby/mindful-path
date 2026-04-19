import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

const IMAGE_FILE_URL = 'https://files.example.com/stage4-image.png';
const PDF_FILE_URL = 'https://files.example.com/stage4-doc.pdf';
const PDF_EXTRACTED_TEXT = 'Stage 4 PDF text: Mindful breathing reduces stress and improves emotional regulation.';

const IMAGE_PNG_1X1_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9WnR1F4AAAAASUVORK5CYII=';

const MINIMAL_PDF_BYTES = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 300 144] /Contents 4 0 R >>\nendobj\n4 0 obj\n<< /Length 44 >>\nstream\nBT /F1 12 Tf 72 72 Td (Stage 4 PDF) Tj ET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000010 00000 n \n0000000061 00000 n \n0000000118 00000 n \n0000000213 00000 n \ntrailer\n<< /Root 1 0 R /Size 5 >>\nstartxref\n306\n%%EOF\n`;

function longPdfAssistantReply() {
  return [
    'I read your uploaded PDF and here are the key points:',
    '- Mindful breathing can reduce stress.',
    '- Consistent practice improves emotional regulation.',
    '- Short daily routines are easier to sustain.',
    'Additional details: ' + 'This sentence is intentionally repeated to exceed the short chat limit. '.repeat(20),
  ].join('\n');
}

async function startChatWithRuntimeMocks(page: Parameters<typeof mockApi>[0]) {
  await page.addInitScript(() => {
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;
  });

  await mockApi(page);

  const captured = {
    uploadedPayloads: [] as Array<{ file_name?: string; file_type?: string }>,
    postedMessages: [] as Array<{ content?: string; metadata?: any }>,
    extractPdfTextCalls: 0,
  };

  let conversationMessages: Array<{ role: 'user' | 'assistant'; content: string; metadata?: any }> = [];

  await page.route('**/api/**/functions/**', async (route) => {
    const req = route.request();
    const url = req.url();
    const body = req.postDataJSON?.() as any;
    const routeFingerprint = `${url}::${JSON.stringify(body || {})}`;

    if (routeFingerprint.includes('uploadAttachment')) {
      captured.uploadedPayloads.push({
        file_name: body?.file_name,
        file_type: body?.file_type,
      });

      const isPdf = String(body?.file_type || '').toLowerCase().includes('pdf');
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ file_url: isPdf ? PDF_FILE_URL : IMAGE_FILE_URL }),
      });
      return;
    }

    if (routeFingerprint.includes('extractPdfText')) {
      captured.extractPdfTextCalls += 1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          text: PDF_EXTRACTED_TEXT,
          page_count: 1,
        }),
      });
      return;
    }

    if (routeFingerprint.includes('enhancedCrisisDetector')) {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ is_crisis: false, severity: 'none', confidence: 0 }),
      });
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true }),
    });
  });

  await page.route('**/api/**/agents/conversations/**/messages**', async (route) => {
    const body = route.request().postDataJSON?.() as any;
    captured.postedMessages.push({ content: body?.content, metadata: body?.metadata });

    const isPdfTurn = String(body?.content || '').includes('type: pdf');
    const assistantContent = isPdfTurn
      ? longPdfAssistantReply()
      : 'I reviewed your uploaded image. It appears to show a simple red square on a plain background.';

    conversationMessages = [
      {
        role: 'user',
        content: String(body?.content || ''),
        metadata: body?.metadata,
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
        content: String(body?.content || ''),
        created_date: new Date().toISOString(),
      }),
    });
  });

  await page.route('**/api/**/agents/conversations/test-conversation-123**', async (route) => {
    if (route.request().method() !== 'GET') {
      await route.continue();
      return;
    }

    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        id: 'test-conversation-123',
        agent_name: 'cbt_therapist',
        metadata: { name: 'Test Session', description: 'Stage 4 runtime verification' },
        messages: conversationMessages,
        created_date: new Date().toISOString(),
      }),
    });
  });

  await spaNavigate(page, '/Chat');
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => {});

  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });
  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeEnabled({ timeout: 15000 });

  return captured;
}

test.describe('Stage 4 runtime file-understanding verification', () => {
  test('image upload path grounds AI turn with image attachment context', async ({ page }) => {
    const captured = await startChatWithRuntimeMocks(page);

    await page.locator('input[type="file"]').setInputFiles({
      name: 'stage4-image.png',
      mimeType: 'image/png',
      buffer: Buffer.from(IMAGE_PNG_1X1_BASE64, 'base64'),
    });
    await expect(page.getByText('stage4-image.png')).toBeVisible({ timeout: 10000 });

    await page.locator('[data-testid="therapist-chat-input"]').fill('Please describe this image.');
    await page.locator('[data-testid="therapist-chat-send"]').click();

    await expect.poll(() => captured.uploadedPayloads.length, { timeout: 15000 }).toBeGreaterThan(0);
    await expect.poll(() => captured.postedMessages.length, { timeout: 15000 }).toBeGreaterThan(0);

    const posted =
      captured.postedMessages.find((m) => String(m.content || '').includes('Please describe this image.')) ||
      captured.postedMessages[captured.postedMessages.length - 1];
    const postedContent = String(posted.content || '');

    expect(postedContent).toContain('Please describe this image.');
    expect(posted.metadata?.attachment?.type).toBe('image');
    expect(posted.metadata?.attachment?.url).toBe(IMAGE_FILE_URL);

    await expect(page.getByText('I reviewed your uploaded image.')).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('[ATTACHMENT_CONTEXT]')).toHaveCount(0);
    await expect(page.getByText('[ATTACHMENT_METADATA]')).toHaveCount(0);
  });

  test('pdf upload path includes extracted text and keeps assistant output short/clean', async ({ page }) => {
    const captured = await startChatWithRuntimeMocks(page);

    await page.locator('input[type="file"]').setInputFiles({
      name: 'stage4-doc.pdf',
      mimeType: 'application/pdf',
      buffer: Buffer.from(MINIMAL_PDF_BYTES, 'utf8'),
    });
    await expect(page.getByText('stage4-doc.pdf')).toBeVisible({ timeout: 10000 });

    await page.locator('[data-testid="therapist-chat-input"]').fill('Please summarize this PDF.');
    await page.locator('[data-testid="therapist-chat-send"]').click();

    await expect.poll(() => captured.uploadedPayloads.length, { timeout: 15000 }).toBeGreaterThan(0);
    await expect.poll(() => captured.postedMessages.length, { timeout: 15000 }).toBeGreaterThan(0);

    const posted =
      captured.postedMessages.find((m) => String(m.content || '').includes('Please summarize this PDF.')) ||
      captured.postedMessages[captured.postedMessages.length - 1];
    const postedContent = String(posted.content || '');

    expect(captured.extractPdfTextCalls).toBe(1);
    expect(postedContent).toContain('Please summarize this PDF.');
    expect(posted.metadata?.attachment?.type).toBe('pdf');
    expect(posted.metadata?.attachment?.url).toBe(PDF_FILE_URL);
    expect(posted.metadata?.pdf_extracted_text).toBe(PDF_EXTRACTED_TEXT);

    await expect(page.getByText('I read your uploaded PDF and here are the key points:')).toBeVisible({ timeout: 15000 });
    const assistantTurn = page.locator('div').filter({ hasText: 'I read your uploaded PDF and here are the key points:' }).first();
    const assistantTurnText = await assistantTurn.innerText();
    const repeatedPhraseMatches = assistantTurnText.match(/This sentence is intentionally repeated to exceed the short chat limit\\./g) || [];
    expect(repeatedPhraseMatches.length).toBeLessThanOrEqual(1);
    await expect(page.getByText('[ATTACHMENT_CONTEXT]')).toHaveCount(0);
    await expect(page.getByText('[ATTACHMENT_METADATA]')).toHaveCount(0);
  });
});

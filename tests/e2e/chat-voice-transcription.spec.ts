import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

test.describe('Chat voice transcription runtime flow', () => {
  test('transcribes uploaded recording and inserts transcript into composer without auto-send', async ({ page }) => {
    await page.addInitScript(() => {
      localStorage.setItem('chat_consent_accepted', 'true');
      localStorage.setItem('age_verified', 'true');
      (window as any).__TEST_APP_ID__ = 'test-app-id';
      (window as any).__DISABLE_ANALYTICS__ = true;

      class FakeMediaRecorder {
        stream: any;
        state: 'inactive' | 'recording' = 'inactive';
        mimeType = 'audio/webm';
        ondataavailable: ((event: { data: Blob }) => void) | null = null;
        onerror: ((event: any) => void) | null = null;
        onstop: (() => void) | null = null;

        constructor(stream: any) {
          this.stream = stream;
        }

        start() {
          this.state = 'recording';
        }

        stop() {
          if (this.state !== 'recording') return;
          this.state = 'inactive';
          const blob = new Blob([new Uint8Array([1, 2, 3, 4])], { type: this.mimeType });
          this.ondataavailable?.({ data: blob });
          this.onstop?.();
        }
      }

      Object.defineProperty(window, 'MediaRecorder', {
        configurable: true,
        writable: true,
        value: FakeMediaRecorder,
      });

      Object.defineProperty(navigator, 'mediaDevices', {
        configurable: true,
        value: {
          getUserMedia: async () => ({
            getTracks: () => [{ stop() {} }],
          }),
        },
      });
    });

    await mockApi(page);

    const captured = {
      uploadFileName: '',
      uploadMimeType: '',
      invokePayload: null as null | Record<string, any>,
      messagePostCount: 0,
    };

    await page.route('**/api/**/integration-endpoints/**', async (route) => {
      const req = route.request();
      const url = req.url();

      if (/\/integration-endpoints\/Core\/UploadFile\b/i.test(url)) {
        const rawBody = req.postData() || '';
        captured.uploadFileName = rawBody.match(/filename="([^"]+)"/i)?.[1] || '';
        captured.uploadMimeType = rawBody.match(/Content-Type:\s*([^\r\n;]+)/i)?.[1] || '';
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ file_url: 'https://files.example.com/voice-draft.webm' }),
        });
        return;
      }

      if (/\/integration-endpoints\/Core\/InvokeLLM\b/i.test(url)) {
        const body = req.postDataJSON?.() as Record<string, any>;
        captured.invokePayload = body || null;

        if (body?.response_json_schema) {
          await route.fulfill({
            status: 400,
            contentType: 'application/json',
            body: JSON.stringify({ message: 'response_json_schema is not supported for this audio transcription path' }),
          });
          return;
        }

        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify('Transcribed runtime text from voice draft.'),
        });
        return;
      }

      await route.continue();
    });

    await page.route('**/api/**/agents/conversations/**/messages**', async (route) => {
      captured.messagePostCount += 1;
      const body = route.request().postDataJSON?.() as any;
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

    await spaNavigate(page, '/Chat');
    await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });

    await page.getByRole('button', { name: 'Record' }).click();
    await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible({ timeout: 5000 });
    await page.getByRole('button', { name: 'Stop' }).click();

    await expect(page.getByText('Voice draft ready')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'Transcribe' }).click();

    const composer = page.locator('[data-testid="therapist-chat-input"]');
    await expect(composer).toHaveValue('Transcribed runtime text from voice draft.', { timeout: 10000 });
    await expect(page.getByText('Transcript added to composer.')).toBeVisible({ timeout: 10000 });

    expect(captured.uploadFileName).toMatch(/^voice-draft-\d+\.webm$/);
    expect(captured.uploadMimeType).toBe('audio/webm');
    expect(captured.invokePayload).not.toBeNull();
    expect(captured.invokePayload?.file_urls).toEqual(['https://files.example.com/voice-draft.webm']);
    expect(captured.invokePayload?.response_json_schema).toBeUndefined();
    expect(captured.messagePostCount).toBe(0);
  });
});

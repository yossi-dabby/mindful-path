import { test, expect } from '@playwright/test';
import { mockApi, spaNavigate } from '../helpers/ui';

// Minimal Android test with extra logging
test('debug: Android transcription', async ({ page }) => {
  // Set up Android environment
  await page.addInitScript(() => {
    localStorage.setItem('chat_consent_accepted', 'true');
    localStorage.setItem('age_verified', 'true');
    (window as any).__TEST_APP_ID__ = 'test-app-id';
    (window as any).__DISABLE_ANALYTICS__ = true;

    Object.defineProperty(window.navigator, 'userAgent', {
      configurable: true,
      get: () => 'Mozilla/5.0 (Linux; Android 14; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
    });

    (window as any).Capacitor = {
      getPlatform: () => 'android',
    };

    class FakeMediaRecorder {
      stream: any;
      state: 'inactive' | 'recording' = 'inactive';
      mimeType: string;
      ondataavailable: ((event: { data: Blob }) => void) | null = null;
      onerror: any = null;
      onstop: (() => void) | null = null;

      constructor(stream: any, options: { mimeType?: string } = {}) {
        this.stream = stream;
        if (options?.mimeType !== 'audio/mp4') {
          throw new DOMException('Unsupported', 'NotSupportedError');
        }
        this.mimeType = options.mimeType;
      }

      static isTypeSupported(candidate: string) {
        return candidate === 'audio/mp4';
      }

      start() { this.state = 'recording'; }

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

  const requestLog: string[] = [];

  // Register specific route handler AFTER mockApi
  await page.route('**/api/**/integration-endpoints/**', async (route) => {
    const url = route.request().url();
    requestLog.push(`integration-endpoints-handler: ${url}`);
    if (/\/integration-endpoints\/Core\/UploadFile\b/i.test(url)) {
      requestLog.push(`UploadFile matched`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ file_url: 'https://files.example.com/voice-draft.m4a' }),
      });
      return;
    }
    await route.continue();
  });

  await page.route('**/api/**/functions/**', async (route) => {
    const url = route.request().url();
    requestLog.push(`functions-handler: ${url}`);
    if (/\/functions\/transcribeMobileAudio\b/i.test(url)) {
      requestLog.push(`transcribeMobileAudio matched`);
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ data: { transcription: 'Android runtime transcript.' } }),
      });
      return;
    }
    await route.continue();
  });

  // Also listen to ALL requests
  page.on('request', (req) => {
    const url = req.url();
    if (url.includes('/api/') && !url.includes('.js')) {
      requestLog.push(`REQUEST: ${req.method()} ${url}`);
    }
  });

  page.on('response', (res) => {
    const url = res.url();
    if (url.includes('/api/') && !url.includes('.js')) {
      requestLog.push(`RESPONSE: ${res.status()} ${url}`);
    }
  });

  await spaNavigate(page, '/Chat');
  await expect(page.locator('[data-testid="therapist-chat-input"]')).toBeVisible({ timeout: 15000 });

  await page.getByRole('button', { name: 'Record' }).click();
  await expect(page.getByRole('button', { name: 'Stop' })).toBeVisible({ timeout: 5000 });
  await page.getByRole('button', { name: 'Stop' }).click();
  await expect(page.getByText('Voice draft ready')).toBeVisible({ timeout: 10000 });

  await page.getByRole('button', { name: 'Transcribe' }).click();
  
  // Wait a bit
  await page.waitForTimeout(12000);

  console.log('\n=== REQUEST LOG ===');
  for (const entry of requestLog) {
    console.log(entry);
  }
  console.log('=== END LOG ===\n');
  
  const value = await page.locator('[data-testid="therapist-chat-input"]').inputValue();
  console.log('Composer value:', JSON.stringify(value));
});

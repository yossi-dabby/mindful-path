import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  timeout: 60_000,
  testDir: 'tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: process.env.BASE_URL,
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { browserName: 'chromium', channel: 'chrome', viewport: { width: 1280, height: 720 } },
    },
    { name: 'Desktop Firefox', use: { browserName: 'firefox', viewport: { width: 1280, height: 720 } } },
    { name: 'Pixel 5', use: { ...devices['Pixel 5'] } },
    { name: 'iPhone 13', use: { ...devices['iPhone 13'] } },
  ],
});

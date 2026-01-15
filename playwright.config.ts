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
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    headless: true,
  },
  webServer: process.env.BASE_URL
  ? undefined
  : {
      command: 'npm run build && npx --yes serve -s dist -l 4173',
      url: 'http://127.0.0.1:4173',
      reuseExistingServer: !process.env.CI,
    },
  projects: [
    {
      name: 'web-1440x900',
      use: { browserName: 'chromium', viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-390x844',
      use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, isMobile: true },
    },
  ],
});

import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests', // Ensures Playwright looks in the tests folder
  testMatch: ['e2e/**/*.spec.ts'], // Ensures it finds tests/e2e/smoke.web.spec.ts
  projects: [
    {
      name: 'web-desktop',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'mobile-390x844',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
      },
    },
  ],
  // Add more global config if needed.
});

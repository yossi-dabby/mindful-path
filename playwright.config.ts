import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  projects: [
    {
      name: 'web-desktop',
      use: {
        ...devices['Desktop Chrome'], // Or your preferred desktop config
      },
    },
    {
      name: 'mobile-390x844',
      use: {
        ...devices['Pixel 5'],       // Or any mobile device config you want
        viewport: { width: 390, height: 844 }, // Ensures correct viewport
      },
    },
  ],
  // Add any other global config here if needed
  // e.g. testDir: './tests', timeout, retries, etc.
});

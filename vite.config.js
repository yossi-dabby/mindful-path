import base44 from "@base44/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// Vite plugin: fail the CI build early if VITE_BASE44_APP_ID is not configured.
// Without this variable all API calls target /api/apps/undefined/... and return 404.
// In local dev, emit a warning instead of aborting so onboarding is not blocked.
function validateAppId() {
  return {
    name: 'validate-app-id',
    buildStart() {
      const appId = process.env.VITE_BASE44_APP_ID || process.env.BASE44_APP_ID;
      if (!appId) {
        const msg =
          'VITE_BASE44_APP_ID is not set. ' +
          'All Base44 API requests will fail with 404 (/api/apps/undefined/...). ' +
          'Add VITE_BASE44_APP_ID to your .env file or, in GitHub Actions, to ' +
          'Settings → Secrets and variables → Actions → New repository secret.';
        if (process.env.CI) {
          this.error(msg);
        } else {
          console.warn('\n⚠️  [vite] ' + msg + '\n');
        }
      }
    },
  };
}

export default defineConfig({
  appType: "spa",
  logLevel: "error",

  // CI-only diagnostics (does not affect production users)
  build: {
    sourcemap: process.env.CI ? true : false,
    minify: process.env.CI ? false : "esbuild",
  },

  server: {
    headers: {
      // Restrict Permissions-Policy to only features the app uses,
      // omitting deprecated/unrecognised features (vr, ambient-light-sensor, battery)
      // that produce browser warnings when included.
      "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
    },
  },

  plugins: [
    validateAppId(),
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === "true",
      appBaseUrl: process.env.VITE_BASE44_APP_BASE_URL || "https://mindful-path-75aeaf7d.base44.app",
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true,
    }),
    react(),
  ],
});

import base44 from "@base44/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// ─── Build-time env validation ────────────────────────────────────────────────
// Emit a clear error when the required VITE_BASE44_APP_ID secret is absent.
// Without it, the Base44 SDK constructs /api/apps/undefined/... URLs and all
// API calls fail silently at runtime or with confusing 404 errors.
//
// In CI this is enforced earlier by the playwright.yml 'check-secrets' job.
// This guard catches local dev runs that forget to set up a .env file.
if (!process.env.VITE_BASE44_APP_ID) {
  const isDev = process.env.NODE_ENV !== 'production';
  const hint = isDev
    ? "Create a .env file at the repo root with:\n  VITE_BASE44_APP_ID=<your-app-id>\nSee env.staging.example for a complete template."
    : "Set the VITE_BASE44_APP_ID environment variable before running 'npm run build'.";
  if (isDev) {
    // Warn in watch/dev mode so the dev server keeps running.
    console.warn(`\n⚠️  VITE_BASE44_APP_ID is not set.\n${hint}\n`);
  } else {
    // Throw in production builds to prevent deploying a broken app.
    throw new Error(`\n❌  VITE_BASE44_APP_ID is not set.\n${hint}\n`);
  }
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

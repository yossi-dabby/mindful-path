import base44 from "@base44/vite-plugin";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  appType: "spa",
  logLevel: "error",

  // CI-only diagnostics (does not affect production users)
  build: {
    sourcemap: process.env.CI ? true : false,
    minify: process.env.CI ? false : "esbuild",
  },

  // Inject build metadata for runtime diagnostics (e.g. confirming which
  // bundle is loaded on Android Production via [PDF_VIEWER_MOUNTED] log).
  define: {
    __PDF_VIEWER_BUILD__: JSON.stringify(new Date().toISOString()),
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
      appBaseUrl: process.env.VITE_BASE44_APP_BASE_URL || undefined,
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true,
    }),
    react(),
  ],
});

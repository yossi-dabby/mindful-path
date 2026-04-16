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

import base44 from "@base44/vite-plugin"
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
// https://vite.dev/config/
export default defineConfig({
  appType: "spa",        
  logLevel: "error",
  export default defineConfig({
  appType: "spa",
  logLevel: "error",

  build: {
    sourcemap: process.env.CI ? true : false,
    minify: process.env.CI ? false : 'esbuild',
  },

  plugins: [
    // ...
  ],
})

  plugins: [
    base44({
      legacySDKImports: process.env.BASE44_LEGACY_SDK_IMPORTS === "true",
      hmrNotifier: true,
      navigationNotifier: true,
      visualEditAgent: true,
    }),
    react(),
  ],
});

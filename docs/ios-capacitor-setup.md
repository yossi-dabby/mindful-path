# iOS Capacitor Setup Guide

This document describes how to set up, build, and test the Mindful Path app on iOS using Capacitor.

---

## Prerequisites

- macOS with Xcode 15+ installed  
- Node.js 18+ and npm installed  
- `@capacitor/cli` installed (already in devDependencies)  
- `@capacitor/ios` installed (already in dependencies as of Phase 2)  
- Apple Developer account (for device/simulator testing and App Store submission)

---

## First-Time iOS Platform Setup

Run the following commands in the repository root:

```bash
# 1. Build the web app
npm run build

# 2. Add the iOS Capacitor platform (creates the ios/ directory)
npm run ios:add
# Equivalent to: npx cap add ios

# 3. Sync web assets into the iOS project
npm run ios:build
# Equivalent to: npm run build && npx cap sync ios
```

This creates the `ios/` directory containing the Xcode project.  
The `ios/` directory is `.gitignore`d (native build artifacts) — regenerate it locally as above.

---

## Opening in Xcode

```bash
npm run ios:open
# Equivalent to: npx cap open ios
```

This opens Xcode with the `App.xcworkspace` project. From Xcode you can:
- Select a simulator or physical device
- Build and run (`⌘R`)
- Run UI tests
- Archive for TestFlight / App Store distribution

---

## Subsequent Builds (after web changes)

```bash
npm run ios:build
```

This rebuilds the web bundle and syncs the latest assets into the existing `ios/` project.

---

## CI Limitations

Xcode and iOS SDK are only available on macOS runners.  
CI (`playwright.yml` / `webpack.yml`) runs on Linux and therefore **cannot** perform a full iOS native build.

**CI validation covers:**
- Web build (`npm run build`)
- Unit tests (`npm test`)
- E2E tests against the Vite dev server (covers web/WebView layout)

**Local validation required before App Store submission:**
- Open in Xcode on macOS
- Build and test on iOS Simulator (iPhone 14 or newer)
- Verify on a physical device with a notch (e.g. iPhone 12/13/14)
- Check safe-area insets, pinch-to-zoom, long-press callout, back navigation

---

## Smoke Checklist (manual, pre-submission)

| Check | Pass criteria |
|---|---|
| App launches on iPhone Simulator | No crash, loading spinner resolves |
| Pinch-to-zoom works in content areas | Browser zoom activates |
| Long-press callout appears on text | iOS native copy/share menu appears |
| Safe-area insets respected | No content hidden behind notch or home indicator |
| Back navigation closes overlays | Overlay closes before routing back |
| Tab switching preserves state | Active tab data is retained on return |
| Account deletion path works | User is logged out and redirected correctly |

---

## Capacitor Config Reference

See `capacitor.config.ts` in the repository root for the full configuration:
- `appId`: `com.mindfulpath.app`
- `appName`: `Mindful Path`
- `webDir`: `dist`
- iOS: `allowsLinkPreview: false` (prevents unintended link previews in WKWebView)

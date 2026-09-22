import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

const read = (relativePath) => fs.readFileSync(path.resolve(process.cwd(), relativePath), 'utf8');

describe('Android startup diagnostics', () => {
  it('installs an early browser failure screen before the application module loads', () => {
    const html = read('index.html');
    const diagnosticsPosition = html.indexOf('__MINDFUL_PATH_DIAGNOSTICS__');
    const appModulePosition = html.indexOf('<script type="module" src="/src/main.jsx"></script>');

    expect(diagnosticsPosition).toBeGreaterThan(-1);
    expect(diagnosticsPosition).toBeLessThan(appModulePosition);
    expect(html).toContain("window.addEventListener('unhandledrejection'");
    expect(html).toContain('startup-error-fallback');
    expect(html).toContain('__MINDFUL_PATH_MARK_MOUNTED__');
  });

  it('enables WebView inspection only for debug builds', () => {
    const activity = read('android/app/src/main/java/me/mindfulpath/app/MainActivity.java');

    expect(activity).toContain('if (BuildConfig.DEBUG)');
    expect(activity).toContain('WebView.setWebContentsDebuggingEnabled(true)');
  });

  it('uses a separate application id and label for diagnostic builds', () => {
    const buildGradle = read('android/app/build.gradle');
    const debugStrings = read('android/app/src/debug/res/values/strings.xml');

    expect(buildGradle).toContain('applicationIdSuffix ".diagnostic"');
    expect(buildGradle).toContain('versionNameSuffix "-diagnostic"');
    expect(debugStrings).toContain('Mindful Path Diagnostic');
  });

  it('keeps the React startup error screen in document flow', () => {
    const app = read('src/App.jsx');
    const startupScreen = app.slice(
      app.indexOf('const StartupErrorScreen'),
      app.indexOf('const LayoutWrapper'),
    );

    expect(startupScreen).toContain('className="min-h-screen');
    expect(startupScreen).not.toContain('className="fixed inset-0');
  });
});

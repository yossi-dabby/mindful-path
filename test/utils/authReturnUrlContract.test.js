import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

function readSource(relativePath) {
  return readFileSync(
    fileURLToPath(new URL(relativePath, import.meta.url)),
    'utf8',
  );
}

describe('authentication return URL contract', () => {
  it('preserves the complete current URL in AuthContext login redirects', () => {
    const source = readSource('../../src/lib/AuthContext.jsx');

    expect(source).toContain("return window.location.href || '/'");
    expect(source).not.toContain(
      'window.location.pathname}${window.location.search}${window.location.hash}',
    );
  });

  it('preserves the complete current URL in AuthErrorBanner', () => {
    const source = readSource(
      '../../src/components/utils/AuthErrorBanner.jsx',
    );

    expect(source).toContain(
      'base44.auth.redirectToLogin(window.location.href);',
    );
    expect(source).not.toContain(
      'base44.auth.redirectToLogin(currentPath);',
    );
  });

  it('preserves the complete current URL in both Settings redirects', () => {
    const source = readSource('../../src/pages/Settings.jsx');
    const absoluteRedirects =
      source.match(
        /base44\.auth\.redirectToLogin\(window\.location\.href\);/g,
      ) || [];

    expect(absoluteRedirects).toHaveLength(2);
    expect(source).not.toContain(
      'base44.auth.redirectToLogin(window.location.pathname);',
    );
  });
});

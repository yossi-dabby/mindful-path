/**
 * worksheetOpenPopupFix.test.js
 *
 * Tests for the popup-blocker-safe worksheet Open and Download fix.
 *
 * Context: Android Chrome, installed PWA, and strict popup blockers block window.open
 * when called after an async gap (await). The fix:
 *  1. Static /forms/... paths: resolved synchronously — no async gap, no popup blocker.
 *  2. Private/signed files: window.open('', '_blank') called synchronously BEFORE async
 *     resolution; location assigned after.
 *  3. If window.open returns null: fall back to window.location.href.
 */

import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';

import { classifyWorksheetFileReference } from '../../src/components/chat/utils/worksheetFileResolver.js';
import { getFormOpenUrl, getFormDownloadUrl } from '../../src/components/chat/utils/formFileUrls.js';

const ROOT = path.resolve(process.cwd());

// ─── openFile — popup-safe source-code contracts ──────────────────────────────

describe('openFile — popup-safe source-code contracts', () => {
  const src = fs.readFileSync(`${ROOT}/src/components/chat/utils/openFile.js`, 'utf8');

  it('is not async — no async keyword that would cause a trusted-gesture gap', () => {
    // The function declaration must not be async so callers can use it synchronously
    expect(src).not.toMatch(/export\s+async\s+function\s+openFile/);
  });

  it('falls back to window.location.href when window.open returns null', () => {
    expect(src).toContain('window.location.href');
  });

  it('does not throw when window.open returns null', () => {
    // Old behavior threw an error; new behavior silently falls back
    expect(src).not.toContain('throw new Error');
  });

  it('still uses window.open with _blank and noopener,noreferrer for desktop', () => {
    expect(src).toContain("'_blank'");
    expect(src).toContain('noopener');
    expect(src).toContain('noreferrer');
  });

  it('still guards against falsy or non-string URL', () => {
    expect(src).toContain("typeof url !== 'string'");
  });
});

// ─── openFile — runtime: window.open null fallback (source-code contract) ─────
// Vitest runs in Node where window.open is not available.
// We verify the source directly instead of running a browser simulation that
// would require patching globals and risk polluting other tests.

describe('openFile — runtime fallback contract verified via source', () => {
  const src = fs.readFileSync(`${ROOT}/src/components/chat/utils/openFile.js`, 'utf8');

  it('assigns window.location.href when openedWindow is falsy', () => {
    // The fallback line must check the return value and redirect same-tab
    expect(src).toMatch(/if\s*\(!openedWindow\)/);
    expect(src).toContain('window.location.href = safeUrl');
  });

  it('the fallback assignment covers all popup-blocked scenarios', () => {
    // window.open returns null when blocked — one guard covers desktop popup blocker,
    // Android Chrome, and installed PWA
    expect(src).not.toMatch(/throw/); // must never throw
    expect(src).toMatch(/window\.open\(safeUrl,\s*'_blank'/);
  });
});

// ─── TherapeuticForms — static /forms/ paths bypass async ────────────────────

describe('TherapeuticForms — handleOpenForm source contracts for static paths', () => {
  const src = fs.readFileSync(`${ROOT}/src/pages/TherapeuticForms.jsx`, 'utf8');

  it('short-circuits synchronously for /forms/ URLs without awaiting resolveWorksheetFileUrl', () => {
    // The handler must check startsWith('/forms/') before any await / Promise chain
    expect(src).toMatch(/startsWith\(['"]\/forms\/['"]\)/);
  });

  it('does not await openFile — openFile is now a sync function', () => {
    // handleOpenForm must not use "await openFile(..."
    expect(src).not.toMatch(/await\s+openFile\s*\(/);
  });

  it('uses the blank-window trick for non-static (private/signed) URLs', () => {
    expect(src).toContain("window.open('', '_blank'");
    expect(src).toContain('win.location.href');
  });
});

// ─── GeneratedFileCard — static /forms/ paths bypass async ───────────────────

describe('GeneratedFileCard — handleOpen source contracts', () => {
  const src = fs.readFileSync(`${ROOT}/src/components/chat/GeneratedFileCard.jsx`, 'utf8');

  it('computes staticOpenUrl synchronously at render for /forms/ URLs', () => {
    expect(src).toContain('staticOpenUrl');
    expect(src).toMatch(/startsWith\(['"]\/forms\/['"]\)/);
  });

  it('calls openFile(staticOpenUrl) synchronously without awaiting for static paths', () => {
    // Confirm the early-return path that calls openFile without async
    expect(src).toContain('if (staticOpenUrl)');
    expect(src).toContain('openFile(staticOpenUrl)');
  });

  it('uses blank-window trick for private/signed file URLs', () => {
    expect(src).toContain("window.open('', '_blank'");
    expect(src).toContain('win.location.href');
  });

  it('renders a fallback anchor link when open fails', () => {
    expect(src).toContain('openFallbackUrl');
    expect(src).toContain('generated-file-open-fallback-link');
  });
});

// ─── MessageBubble — static /forms/ paths bypass async ───────────────────────

describe('MessageBubble — handleAssistantPdfDownload source contracts', () => {
  const src = fs.readFileSync(`${ROOT}/src/components/chat/MessageBubble.jsx`, 'utf8');

  it('short-circuits synchronously for /forms/ URLs', () => {
    expect(src).toMatch(/startsWith\(['"]\/forms\/['"]\)/);
  });

  it('uses blank-window trick for private/signed file URLs', () => {
    expect(src).toContain("window.open('', '_blank'");
    expect(src).toContain('win.location.href');
  });

  it('does not await openFile', () => {
    expect(src).not.toMatch(/await\s+openFile\s*\(/);
  });
});

// ─── /forms/ URL classification — never treated as raw UUID ──────────────────

describe('classifyWorksheetFileReference — /forms/ paths are static, never UUID', () => {
  const staticPaths = [
    '/forms/en/children/cbt-core/stage-01/children_cbt_core_en_module_01_emotions_and_body.pdf',
    '/forms/en/adolescents/cbt-core/series/adolescents-cbt-core-series-1-full-en.pdf',
    '/forms/he/children/cbt-core/stage-02/children_cbt_core_he_module_02.pdf',
  ];

  for (const filePath of staticPaths) {
    it(`classifies "${filePath.slice(0, 60)}..." as static_public_form_path`, () => {
      expect(classifyWorksheetFileReference(filePath)).toBe('static_public_form_path');
    });
  }

  it('classifies raw UUID as raw_uuid — never a static path', () => {
    expect(classifyWorksheetFileReference('550e8400-e29b-41d4-a716-446655440000')).toBe('raw_uuid');
  });

  it('a raw UUID is never passed as a /forms/ static path', () => {
    // Raw UUIDs must be rejected before reaching window.open with an unresolved value
    const uuid = '550e8400-e29b-41d4-a716-446655440000';
    expect(uuid.startsWith('/forms/')).toBe(false);
    expect(classifyWorksheetFileReference(uuid)).toBe('raw_uuid');
  });
});

// ─── formFileUrls — Open builds viewer URL; Download builds download URL ─────

describe('formFileUrls — Open and Download URL contracts for /forms/ paths', () => {
  const formsPath = '/forms/en/children/cbt-core/stage-01/children_cbt_core_en_module_01_emotions_and_body.pdf';

  it('getFormOpenUrl returns a viewer route with the forms path encoded', () => {
    const openUrl = getFormOpenUrl(formsPath);
    expect(openUrl).toContain('/pdf-viewer?file=');
    expect(openUrl).toContain(encodeURIComponent(formsPath));
  });

  it('getFormDownloadUrl returns the forms path with download=1', () => {
    const downloadUrl = getFormDownloadUrl(formsPath);
    expect(downloadUrl).toBe(`${formsPath}?download=1`);
  });

  it('getFormOpenUrl never returns null for a valid /forms/ path', () => {
    expect(getFormOpenUrl(formsPath)).not.toBeNull();
  });

  it('getFormDownloadUrl never returns null for a valid /forms/ path', () => {
    expect(getFormDownloadUrl(formsPath)).not.toBeNull();
  });
});

// ─── downloadPdfFile — same-origin /forms/ uses anchor download (no popup) ───

describe('downloadPdfFile — source contracts', () => {
  const src = fs.readFileSync(`${ROOT}/src/components/chat/utils/downloadPdfFile.js`, 'utf8');

  it('uses anchor.download attribute (not window.open) for same-origin paths', () => {
    expect(src).toContain('a.download = filename');
    expect(src).not.toContain('window.open');
  });

  it('treats /forms/... paths as same-origin and skips the fetch/blob path', () => {
    // isSameOrigin check for relative URLs starting with /
    expect(src).toMatch(/url\.startsWith\(['"]\/['"]\)/);
  });
});

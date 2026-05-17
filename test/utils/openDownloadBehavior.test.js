import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';
import { FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL } from '../../src/data/therapeuticForms/forms.adolescents.cbt-core.en.js';
import { normalizeGeneratedFile } from '../../src/components/chat/utils/normalizeGeneratedFile.js';

const ROOT = '/home/runner/work/mindful-path/mindful-path';

describe('openDownloadBehavior.test.js', () => {
  it('keeps runtime form catalog on the canonical adolescents package', () => {
    expect(ALL_FORMS.map((form) => form.id)).toContain('adolescents-cbt-core-en');
  });

  it('resolves only the active adolescents package for open/download actions', () => {
    const resolved = resolveFormWithLanguage('adolescents-cbt-core-en', 'en');
    expect(resolved?.languageData?.file_url).toBe('/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf');
    expect(resolveFormWithLanguage('adolescents-cbt-core-en', 'he')).toBeNull();
    expect(resolveFormWithLanguage('tf-adults-cbt-thought-record', 'en')).toBeNull();
  });
});

// ─── openFile — source-code contract ─────────────────────────────────────────
// Vitest runs in Node (env=node); window.open is not available.
// We verify openFile.js source to confirm the correct browser-native open pattern.

describe('openFile — source-code contract: no download attribute, uses _blank', () => {
  const openFileSrc = fs.readFileSync(`${ROOT}/src/components/chat/utils/openFile.js`, 'utf8');

  it('uses window.open / _blank — not an anchor with download attribute', () => {
    expect(openFileSrc).toContain("'_blank'");
    expect(openFileSrc).not.toContain('.download =');
  });

  it('includes noopener and noreferrer for security', () => {
    expect(openFileSrc).toContain('noopener');
    expect(openFileSrc).toContain('noreferrer');
  });

  it('returns early for falsy or non-string URL', () => {
    expect(openFileSrc).toContain("typeof url !== 'string'");
  });
});

// ─── downloadPdfFile — source-code contract ───────────────────────────────────

describe('downloadPdfFile — source-code contract: uses download attribute', () => {
  const downloadSrc = fs.readFileSync(`${ROOT}/src/components/chat/utils/downloadPdfFile.js`, 'utf8');

  it('uses anchor.download attribute for download action', () => {
    expect(downloadSrc).toContain('a.download = filename');
  });

  it('uses rel noopener noreferrer on download anchor', () => {
    expect(downloadSrc).toContain('noopener noreferrer');
  });
});

// ─── GeneratedFileCard — Open vs Download source-code contract ────────────────

describe('GeneratedFileCard — Open vs Download source-code contract', () => {
  const cardSrc = fs.readFileSync(`${ROOT}/src/components/chat/GeneratedFileCard.jsx`, 'utf8');

  it('Open button calls openFile (not downloadPdfFile)', () => {
    expect(cardSrc).toContain('handleOpen');
    expect(cardSrc).toContain('openFile');
  });

  it('Download button calls downloadPdfFile', () => {
    expect(cardSrc).toContain('handleDownload');
    expect(cardSrc).toContain('downloadPdfFile');
  });

  it('Open button does not set download attribute in openFile helper', () => {
    const openFileSrc = fs.readFileSync(`${ROOT}/src/components/chat/utils/openFile.js`, 'utf8');
    expect(openFileSrc).not.toContain('.download =');
  });
});

// ─── Forms library Open action — direct public URL ────────────────────────────

describe('forms library Open action — uses direct public URL', () => {
  it('resolves adolescents package to a /forms/ public URL suitable for Open', () => {
    const resolved = resolveFormWithLanguage('adolescents-cbt-core-en', 'en');
    const fileUrl = resolved?.languageData?.file_url;
    expect(fileUrl).toBeTruthy();
    expect(fileUrl.startsWith('/forms/')).toBe(true);
  });

  it('resolves individual worksheets to /forms/adolescents/en/core/individual/ public URLs', () => {
    for (const w of FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL) {
      expect(w.fileUrl.startsWith('/forms/adolescents/en/core/individual/')).toBe(true);
      expect(w.languages.en.file_url).toBe(w.fileUrl);
    }
  });
});

// ─── normalizeGeneratedFile — Open vs Download URL contract ──────────────────

describe('normalizeGeneratedFile — Open vs Download URL contract', () => {
  it('preserves a /forms/ URL as-is — suitable for direct browser open without download', () => {
    const url = '/forms/adolescents/en/core/individual/01-02-my-body-gives-me-signals.pdf';
    const result = normalizeGeneratedFile({ type: 'pdf', url, name: 'worksheet.pdf' });
    expect(result).not.toBeNull();
    expect(result.url).toBe(url);
    expect(result.url.startsWith('/')).toBe(true);
  });

  it('includes all fields needed for Open action — type, url, name', () => {
    const input = {
      type: 'pdf',
      url: '/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf',
      name: 'adolescents-cbt-core-series-1-full-en.pdf',
      title: 'Adolescents CBT Core Series',
    };
    const result = normalizeGeneratedFile(input);
    expect(result.type).toBe('pdf');
    expect(result.url).toBeTruthy();
    expect(result.name).toBeTruthy();
  });
});

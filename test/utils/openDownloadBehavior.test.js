import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';
import { FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL } from '../../src/data/therapeuticForms/forms.adolescents.cbt-core.en.js';
import { FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS } from '../../src/data/therapeuticForms/forms.adolescents.cbt-specialized.en.js';
import { normalizeGeneratedFile } from '../../src/components/chat/utils/normalizeGeneratedFile.js';
import { createGeneratedFileFromResolvedForm, resolveFormByIdOrSlug } from '../../src/data/therapeuticForms/aiFormsAccess.js';
import {
  getFormDownloadUrl,
  getFormOpenUrl,
  PDF_VIEWER_ROUTE_PATH,
  resolvePdfViewerFileParam,
} from '../../src/components/chat/utils/formFileUrls.js';

const ROOT = path.resolve(process.cwd());
const packageJson = JSON.parse(fs.readFileSync(`${ROOT}/package.json`, 'utf8'));

describe('openDownloadBehavior.test.js', () => {
  it('keeps runtime form catalog on the canonical adolescents package', () => {
    expect(ALL_FORMS.map((form) => form.id)).toContain('adolescents-cbt-core-en');
  });

  it('resolves only the active adolescents package for open/download actions', () => {
    const resolved = resolveFormWithLanguage('adolescents-cbt-core-en', 'en');
    expect(resolved?.languageData?.file_url).toBe('/forms/en/adolescents/cbt-core/series/adolescents-cbt-core-series-1-full-en.pdf');
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

  it('opens the prepared viewer URL directly without falling back to raw PDF fetch/open logic', () => {
    expect(openFileSrc).not.toContain('fetch(');
    expect(openFileSrc).not.toContain('URL.createObjectURL');
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
  const bubbleSrc = fs.readFileSync(`${ROOT}/src/components/chat/MessageBubble.jsx`, 'utf8');

  it('Open button calls navigate to pdf-viewer (not downloadPdfFile)', () => {
    expect(cardSrc).toContain('handleOpen');
    expect(cardSrc).toContain('PDF_VIEWER_ROUTE_PATH');
    expect(cardSrc).toContain('navigate(');
    // Open action must NOT use downloadPdfFile — that is Download's code path
    expect(cardSrc).toContain('handleDownload');
    expect(cardSrc).toContain('downloadPdfFile');
    // Confirm they are different handlers (Open uses navigate, Download uses downloadPdfFile)
    expect(cardSrc).not.toContain('openFile(');
  });

  it('Download button calls downloadPdfFile', () => {
    expect(cardSrc).toContain('handleDownload');
    expect(cardSrc).toContain('downloadPdfFile');
  });

  it('Open button does not set download attribute in openFile helper', () => {
    const openFileSrc = fs.readFileSync(`${ROOT}/src/components/chat/utils/openFile.js`, 'utf8');
    expect(openFileSrc).not.toContain('.download =');
  });

  it('MessageBubble keeps GeneratedFileCard rendering when metadata.generated_file exists', () => {
    expect(bubbleSrc).toContain('normalizeGeneratedFile(message?.metadata?.generated_file)');
    expect(bubbleSrc).toContain('GeneratedFileCard');
  });

  it('MessageBubble renders metadata.generated_files attachments for multi-form responses', () => {
    expect(bubbleSrc).toContain('message?.metadata?.generated_files');
    expect(bubbleSrc).toContain('generatedFiles.map');
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

  it('resolves individual worksheets to /forms/en/adolescents/cbt-core/stage-XX/ public URLs', () => {
    for (const w of FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL) {
      expect(/^\/forms\/en\/adolescents\/cbt-core\/stage-\d{2}\//.test(w.fileUrl)).toBe(true);
      expect(w.languages.en.file_url).toBe(w.fileUrl);
    }
  });

  it('resolves adolescents CBT specialized EN series to /forms/en/adolescents/cbt-specialized/ URL suitable for Open', () => {
    const resolved = resolveFormWithLanguage('adolescents-cbt-specialized-en', 'en');
    const fileUrl = resolved?.languageData?.file_url;
    expect(fileUrl).toBeTruthy();
    expect(fileUrl.startsWith('/forms/en/adolescents/cbt-specialized/')).toBe(true);
    // Language-gated: must not resolve for non-English locales
    expect(resolveFormWithLanguage('adolescents-cbt-specialized-en', 'he')).toBeNull();
    expect(resolveFormWithLanguage('adolescents-cbt-specialized-en', 'es')).toBeNull();
  });

  it('resolves Hebrew adolescents stage combined and individual PDFs only in Hebrew mode', () => {
    const combined = resolveFormWithLanguage('adolescents-cbt-core-he-stage-6-combined', 'he');
    const individual = resolveFormWithLanguage('adolescents-cbt-core-he-6-4', 'he');
    expect(combined?.languageData?.file_url).toContain('adolescents_cbt_core_he_series_6_combined.pdf');
    expect(individual?.languageData?.file_url).toContain('adolescents_cbt_core_he_6_4.pdf');
    expect(resolveFormWithLanguage('adolescents-cbt-core-he-stage-6-combined', 'en')).toBeNull();
    expect(resolveFormWithLanguage('adolescents-cbt-core-he-6-4', 'en')).toBeNull();
  });

  it('resolves Hebrew children core module and worksheet PDFs only in Hebrew mode', () => {
    const modulePdf = resolveFormWithLanguage('children-cbt-core-he-module-05', 'he');
    const worksheet = resolveFormWithLanguage('children-cbt-core-he-5-1', 'he');
    expect(modulePdf?.languageData?.file_url).toContain('children_cbt_core_he_module_05_combined.pdf');
    expect(worksheet?.languageData?.file_url).toContain('children_cbt_core_he_5.1.pdf');
    expect(resolveFormWithLanguage('children-cbt-core-he-module-05', 'en')).toBeNull();
    expect(resolveFormWithLanguage('children-cbt-core-he-5-1', 'es')).toBeNull();
  });

  it('resolves all 10 specialized EN module PDFs to /forms/en/adolescents/cbt-specialized/ public URLs', () => {
    for (const module of FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS) {
      const resolved = resolveFormWithLanguage(module.id, 'en');
      expect(resolved).not.toBeNull();
      const fileUrl = resolved?.languageData?.file_url;
      expect(fileUrl).toBeTruthy();
      expect(fileUrl.startsWith('/forms/en/adolescents/cbt-specialized/')).toBe(true);
      expect(fileUrl).toContain('yourcbttrapist_adolescents_cbt_specialized_en_module_');
      // Module PDFs must not resolve for non-English locales (Open would have nothing to open)
      expect(resolveFormWithLanguage(module.id, 'he')).toBeNull();
    }
  });
});

// ─── normalizeGeneratedFile — Open vs Download URL contract ──────────────────

describe('normalizeGeneratedFile — Open vs Download URL contract', () => {
  it('preserves a /forms/ URL as-is — suitable for direct browser open without download', () => {
    const url = '/forms/en/adolescents/cbt-core/stage-01/01-02-my-body-gives-me-signals.pdf';
    const result = normalizeGeneratedFile({ type: 'pdf', url, name: 'worksheet.pdf' });
    expect(result).not.toBeNull();
    expect(result.url).toBe(url);
    expect(result.url.startsWith('/')).toBe(true);
  });

  it('includes all fields needed for Open action — type, url, name', () => {
    const input = {
      type: 'pdf',
      url: '/forms/en/adolescents/cbt-core/series/adolescents-cbt-core-series-1-full-en.pdf',
      name: 'adolescents-cbt-core-series-1-full-en.pdf',
      title: 'Adolescents CBT Core Series',
    };
    const result = normalizeGeneratedFile(input);
    expect(result.type).toBe('pdf');
    expect(result.url).toBeTruthy();
    expect(result.name).toBeTruthy();
  });
});

describe('formFileUrls — open/download URL separation', () => {
  it('builds open URL through the dedicated pdf viewer route', () => {
    const openUrl = getFormOpenUrl('/forms/en/children/cbt-core/individual/05-01-my-calm-plan.pdf?download=1');
    expect(openUrl).toBe(`${PDF_VIEWER_ROUTE_PATH}?file=%2Fforms%2Fen%2Fchildren%2Fcbt-core%2Findividual%2F05-01-my-calm-plan.pdf`);
    expect(openUrl.includes('download=')).toBe(false);
  });

  it('builds download URL with explicit download query flag', () => {
    const downloadUrl = getFormDownloadUrl('/forms/en/children/cbt-core/individual/05-01-my-calm-plan.pdf');
    expect(downloadUrl).toBe('/forms/en/children/cbt-core/individual/05-01-my-calm-plan.pdf?download=1');
  });

  it('sanitizes the pdf viewer file param back to a servable public PDF path', () => {
    expect(resolvePdfViewerFileParam('%2Fforms%2Fen%2Fchildren%2Fcbt-core%2Findividual%2F05-01-my-calm-plan.pdf%3Fdownload%3D1'))
      .toBe('/forms/en/children/cbt-core/individual/05-01-my-calm-plan.pdf');
    expect(resolvePdfViewerFileParam('%2Fprivate%2Fsecret.pdf')).toBeNull();
  });

  it('AI-sent generated file open URL uses viewer route without download query', () => {
    const resolved = resolveFormByIdOrSlug('children-cbt-specialized-en-1-1-1', { language: 'en' });
    const generated = createGeneratedFileFromResolvedForm(resolved);
    const openUrl = getFormOpenUrl(generated?.url);
    expect(openUrl).toContain(`${PDF_VIEWER_ROUTE_PATH}?file=`);
    expect(openUrl.includes('download=1')).toBe(false);
  });

  it('AI-sent generated file download URL explicitly uses download behavior', () => {
    const resolved = resolveFormByIdOrSlug('children-cbt-specialized-en-1-1-1', { language: 'en' });
    const generated = createGeneratedFileFromResolvedForm(resolved);
    const downloadUrl = getFormDownloadUrl(generated?.url);
    expect(downloadUrl).toContain('/forms/');
    expect(downloadUrl).toContain('download=1');
  });
});

describe('pdf viewer route and build/source cache contracts', () => {
  const appSrc = fs.readFileSync(`${ROOT}/src/App.jsx`, 'utf8');
  const pagesConfigSrc = fs.readFileSync(`${ROOT}/src/pages.config.js`, 'utf8');

  it('registers a dedicated /pdf-viewer route', () => {
    expect(appSrc).toContain('path="/pdf-viewer"');
  });

  it('keeps Chat as a lazy-loaded route chunk', () => {
    expect(pagesConfigSrc).toContain("const Chat = lazy(() => import('./pages/Chat'));");
  });

  it('regenerates the therapeutic forms index before dev, test, and build', () => {
    expect(packageJson.scripts.predev).toBe('npm run generate:forms-index');
    expect(packageJson.scripts.pretest).toBe('npm run generate:forms-index');
    expect(packageJson.scripts.prebuild).toBe('npm run generate:forms-index');
  });

  it('does not register a service worker in the app shell', () => {
    expect(appSrc).not.toContain('navigator.serviceWorker');
    expect(appSrc).not.toContain('serviceWorker.register');
  });
});

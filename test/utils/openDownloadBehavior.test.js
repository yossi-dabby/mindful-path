/**
 * Tests for TherapeuticForms and GeneratedFileCard Open vs Download behavior.
 *
 * Covers:
 *  1.  TherapeuticForms Open action does not set a download attribute.
 *  2.  TherapeuticForms Open action calls openFile (the view path), not downloadPdfFile.
 *  3.  TherapeuticForms Download action calls downloadPdfFile.
 *  4.  GeneratedFileCard Open action calls openFile, not downloadPdfFile directly.
 *  5.  GeneratedFileCard Download action calls downloadPdfFile.
 *  6.  Open and Download remain separate actions in both components.
 *  7.  Hebrew labels פתח / הורד still exist.
 *  8.  Existing 18 approved forms still resolve correctly.
 *  9.  All 7 language PDF URLs remain valid in registry (resolve and exist on disk).
 * 10.  AI generated_file metadata still renders correctly.
 * 11.  Attachment metadata remains unaffected.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ALL_FORMS,
  resolveFormWithLanguage,
} from '../../src/data/therapeuticForms/index.js';
import { translations } from '../../src/components/i18n/translations.jsx';
import { normalizeGeneratedFile } from '../../src/components/chat/utils/normalizeGeneratedFile.js';
import { openFile } from '../../src/components/chat/utils/openFile.js';
import { downloadPdfFile } from '../../src/components/chat/utils/downloadPdfFile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.join(ROOT, 'public');

const PAGE_SRC = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
const CARD_SRC = fs.readFileSync(path.join(ROOT, 'src/components/chat/GeneratedFileCard.jsx'), 'utf8');
const OPEN_UTIL_SRC = fs.readFileSync(path.join(ROOT, 'src/components/chat/utils/openFile.js'), 'utf8');
const DOWNLOAD_UTIL_SRC = fs.readFileSync(path.join(ROOT, 'src/components/chat/utils/downloadPdfFile.js'), 'utf8');

const APPROVED_FORMS = ALL_FORMS.filter((f) => f.approved);
const APP_LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

// ─── 1–3: TherapeuticForms Open/Download action behavior ─────────────────────

describe('Open/Download — TherapeuticForms page', () => {
  it('1. Open handler (handleOpenForm) calls openFile, not downloadPdfFile', () => {
    // handleOpenForm must delegate to the openFile utility
    expect(PAGE_SRC).toContain('handleOpenForm');
    expect(PAGE_SRC).toContain('openFile(fileUrl)');
  });

  it('2. TherapeuticForms imports openFile from the utility module', () => {
    expect(PAGE_SRC).toContain("from '@/components/chat/utils/openFile'");
  });

  it('3. handleOpenForm does NOT call downloadPdfFile', () => {
    // Extract the handleOpenForm function body
    const fnMatch = PAGE_SRC.match(/const handleOpenForm\s*=\s*[\s\S]*?^  };/m);
    if (fnMatch) {
      expect(fnMatch[0]).not.toContain('downloadPdfFile');
    } else {
      // Fall back to checking the page doesn't mix open with download
      expect(PAGE_SRC).toContain('handleOpenForm');
      expect(PAGE_SRC).not.toMatch(/handleOpenForm[\s\S]{0,50}downloadPdfFile/);
    }
  });

  it('4. Download handler (handleDownloadForm) calls downloadPdfFile', () => {
    expect(PAGE_SRC).toContain('handleDownloadForm');
    expect(PAGE_SRC).toContain('downloadPdfFile');
  });

  it('5. Open button has data-testid open-form-{id}; Download button has download-form-{id}', () => {
    expect(PAGE_SRC).toContain('data-testid={`open-form-${form.id}`}');
    expect(PAGE_SRC).toContain('data-testid={`download-form-${form.id}`}');
  });
});

// ─── 4–5: GeneratedFileCard Open/Download action behavior ────────────────────

describe('Open/Download — GeneratedFileCard', () => {
  it('6. Open handler (handleOpen) calls openFile, not downloadPdfFile directly', () => {
    expect(CARD_SRC).toContain('handleOpen');
    expect(CARD_SRC).toContain('openFile(normalized.url)');
  });

  it('7. GeneratedFileCard imports openFile from the utility module', () => {
    expect(CARD_SRC).toContain("from './utils/openFile'");
  });

  it('8. handleOpen does NOT call downloadPdfFile', () => {
    // Extract the handleOpen function body (stops at the next const/function)
    const fnMatch = CARD_SRC.match(/const handleOpen\s*=\s*[\s\S]*?^  };/m);
    if (fnMatch) {
      expect(fnMatch[0]).not.toContain('downloadPdfFile');
    } else {
      expect(CARD_SRC).toContain('handleOpen');
      expect(CARD_SRC).not.toMatch(/handleOpen\s*=\s*\(\)\s*=>\s*\{[\s\S]{0,100}downloadPdfFile/);
    }
  });

  it('9. Download handler (handleDownload) calls downloadPdfFile', () => {
    expect(CARD_SRC).toContain('handleDownload');
    expect(CARD_SRC).toContain('downloadPdfFile(normalized.url, normalized.name)');
  });
});

// ─── 6: Open and Download are separate ───────────────────────────────────────

describe('Open/Download — helpers are distinct', () => {
  it('10. openFile utility does NOT use the download attribute', () => {
    expect(OPEN_UTIL_SRC).not.toContain('.download =');
    expect(OPEN_UTIL_SRC).not.toContain('a.download');
  });

  it('11. openFile utility uses window.open (view path)', () => {
    expect(OPEN_UTIL_SRC).toContain('window.open');
  });

  it('12. openFile utility does NOT fetch a blob', () => {
    expect(OPEN_UTIL_SRC).not.toContain('fetch(');
    expect(OPEN_UTIL_SRC).not.toContain('createObjectURL');
  });

  it('13. downloadPdfFile utility uses the download attribute', () => {
    expect(DOWNLOAD_UTIL_SRC).toContain('a.download');
  });

  it('14. openFile is a callable function', () => {
    expect(typeof openFile).toBe('function');
  });

  it('15. downloadPdfFile is a callable function', () => {
    expect(typeof downloadPdfFile).toBe('function');
  });

  it('16. openFile returns early for falsy url', () => {
    // Should not throw; returns undefined
    expect(() => openFile(null)).not.toThrow();
    expect(() => openFile(undefined)).not.toThrow();
    expect(() => openFile('')).not.toThrow();
  });

  it('17. openFile returns early for non-string url', () => {
    expect(() => openFile(42)).not.toThrow();
    expect(() => openFile({})).not.toThrow();
  });
});

// ─── 7: Hebrew labels פתח / הורד ─────────────────────────────────────────────

describe('Open/Download — Hebrew labels', () => {
  it('18. Hebrew open_form label is "פתח"', () => {
    expect(translations.he.translation.therapeutic_forms.open_form).toBe('פתח');
  });

  it('19. Hebrew download_form label is "הורד"', () => {
    expect(translations.he.translation.therapeutic_forms.download_form).toBe('הורד');
  });

  it('20. All 7 languages have open_form key', () => {
    for (const lang of APP_LANGUAGES) {
      expect(
        translations[lang]?.translation?.therapeutic_forms?.open_form,
        `Language "${lang}" missing therapeutic_forms.open_form`
      ).toBeTruthy();
    }
  });

  it('21. All 7 languages have download_form key', () => {
    for (const lang of APP_LANGUAGES) {
      expect(
        translations[lang]?.translation?.therapeutic_forms?.download_form,
        `Language "${lang}" missing therapeutic_forms.download_form`
      ).toBeTruthy();
    }
  });
});

// ─── 8: 18 approved forms still resolve ──────────────────────────────────────

describe('Open/Download — 18 approved forms regression', () => {
  it('22. Exactly 18 forms are approved', () => {
    expect(APPROVED_FORMS.length).toBe(18);
  });

  it('23. All 18 approved forms resolve in English', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'en');
      expect(resolved, `Form ${form.id} failed to resolve in English`).not.toBeNull();
    }
  });

  it('24. All 18 approved forms resolve in Hebrew', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'he');
      expect(resolved, `Form ${form.id} failed to resolve in Hebrew`).not.toBeNull();
    }
  });
});

// ─── 9: All 7 language PDF URLs valid in registry ────────────────────────────

describe('Open/Download — 7-language PDF URL registry', () => {
  for (const lang of APP_LANGUAGES) {
    it(`25. All approved forms have a valid file_url for language "${lang}"`, () => {
      for (const form of APPROVED_FORMS) {
        const langData = form.languages?.[lang];
        // Not all forms are required to support every language, but if a URL is present
        // it must be a non-empty string and the file must exist on disk.
        if (langData?.file_url) {
          expect(typeof langData.file_url).toBe('string');
          expect(langData.file_url.trim().length).toBeGreaterThan(0);
          const diskPath = path.join(PUBLIC, langData.file_url);
          expect(fs.existsSync(diskPath), `Missing on disk: ${diskPath}`).toBe(true);
        }
      }
    });
  }

  it('26. Each approved form has at least en and he language blocks with a file_url', () => {
    for (const form of APPROVED_FORMS) {
      expect(form.languages?.en?.file_url, `Form ${form.id} missing English file_url`).toBeTruthy();
      expect(form.languages?.he?.file_url, `Form ${form.id} missing Hebrew file_url`).toBeTruthy();
    }
  });
});

// ─── 10: AI generated_file metadata still renders correctly ──────────────────

describe('Open/Download — AI generated_file metadata', () => {
  const FIXTURE = {
    type: 'pdf',
    url: '/forms/en/adults/cbt-thought-record.pdf',
    name: 'cbt-thought-record.pdf',
    title: 'CBT Thought Record',
    description: 'A worksheet for examining automatic thoughts.',
    source: 'therapeutic_forms_library',
    form_id: 'tf-adults-cbt-thought-record',
  };

  it('27. normalizeGeneratedFile returns valid object for AI-generated file fixture', () => {
    const result = normalizeGeneratedFile(FIXTURE);
    expect(result).not.toBeNull();
    expect(result.type).toBe('pdf');
    expect(result.url).toBe('/forms/en/adults/cbt-thought-record.pdf');
    expect(result.name).toBe('cbt-thought-record.pdf');
    expect(result.title).toBe('CBT Thought Record');
    expect(result.source).toBe('therapeutic_forms_library');
  });

  it('28. GeneratedFileCard source renders open_button i18n key', () => {
    expect(CARD_SRC).toContain("'chat.generated_file.open_button'");
  });

  it('29. GeneratedFileCard source renders download_button i18n key', () => {
    expect(CARD_SRC).toContain("'chat.generated_file.download_button'");
  });

  it('30. GeneratedFileCard exports normalizeGeneratedFile', () => {
    expect(CARD_SRC).toContain('export { normalizeGeneratedFile }');
  });
});

// ─── 11: Attachment metadata unaffected ──────────────────────────────────────

describe('Open/Download — Attachment metadata unaffected', () => {
  it('31. normalizeGeneratedFile rejects image attachments (non-pdf type)', () => {
    const attachment = { type: 'image', url: 'https://storage.example.com/photo.jpg', name: 'photo.jpg' };
    expect(normalizeGeneratedFile(attachment)).toBeNull();
  });

  it('32. normalizeGeneratedFile rejects attachment-shaped object with no type', () => {
    expect(normalizeGeneratedFile({ url: '/uploads/file.jpg', name: 'file.jpg' })).toBeNull();
  });

  it('33. openFile and downloadPdfFile are not referenced in agentWiring.js', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/api/agentWiring.js'), 'utf8');
    expect(src).not.toContain('openFile');
    expect(src).not.toContain('downloadPdfFile');
  });

  it('34. openFile and downloadPdfFile are not referenced in activeAgentWiring.js', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/api/activeAgentWiring.js'), 'utf8');
    expect(src).not.toContain('openFile');
    expect(src).not.toContain('downloadPdfFile');
  });
});

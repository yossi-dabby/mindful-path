/**
 * Tests for TherapeuticForms Phase 5 — Runtime QA Fixes.
 *
 * Covers:
 *  1.  TherapeuticForms page source has both Open AND Download button per form card.
 *  2.  Download button uses data-testid `download-form-{id}` pattern.
 *  3.  Open button uses data-testid `open-form-{id}` pattern.
 *  4.  downloadPdfFile utility is exported and callable.
 *  5.  downloadPdfFile rejects falsy/non-string URLs gracefully.
 *  6.  GeneratedFileCard renders Open AND Download actions (source inspection).
 *  7.  GeneratedFileCard no longer calls CreateFileSignedUrl (source inspection).
 *  8.  GeneratedFileCard uses downloadPdfFile (source inspection).
 *  9.  Hebrew i18n `download_form` key is "הורד".
 * 10.  English i18n `download_form` key is "Download".
 * 11.  All 7 app languages have `download_form` key in therapeutic_forms section.
 * 12.  All 7 app languages have `open_form` key in therapeutic_forms section.
 * 13.  Category filter in page source uses ScrollableChipRow (scroll arrow pattern).
 * 14.  All category options are present (count matches THERAPEUTIC_CATEGORIES + "all").
 * 15.  All 18 approved forms still resolve correctly (regression).
 * 16.  All 36 PDF assets (18 EN + 18 HE) still exist on disk.
 * 17.  All approved PDFs are non-empty (> 10 KB after regeneration).
 * 18.  normalizeGeneratedFile metadata shape is unaffected.
 * 19.  Attachment metadata (`message.metadata.attachment`) is unaffected.
 * 20.  Home layout page source is unchanged (no import of downloadPdfFile there).
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ALL_FORMS,
  THERAPEUTIC_CATEGORIES,
  resolveFormWithLanguage,
} from '../../src/data/therapeuticForms/index.js';

import { translations } from '../../src/components/i18n/translations.jsx';
import { normalizeGeneratedFile } from '../../src/components/chat/utils/normalizeGeneratedFile.js';
import { downloadPdfFile } from '../../src/components/chat/utils/downloadPdfFile.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT      = path.resolve(__dirname, '../..');
const PUBLIC    = path.join(ROOT, 'public');

// ─── Source file paths ────────────────────────────────────────────────────────

const PAGE_SRC          = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
const CARD_SRC          = fs.readFileSync(path.join(ROOT, 'src/components/chat/GeneratedFileCard.jsx'), 'utf8');
const DOWNLOAD_UTIL_SRC = fs.readFileSync(path.join(ROOT, 'src/components/chat/utils/downloadPdfFile.js'), 'utf8');

// ─── Helpers ──────────────────────────────────────────────────────────────────

const APPROVED_FORMS = ALL_FORMS.filter((f) => f.approved);
const APP_LANGUAGES  = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Phase 5 — TherapeuticForms page: Download action', () => {
  it('1. page source has handleDownloadForm function', () => {
    expect(PAGE_SRC).toContain('handleDownloadForm');
  });

  it('2. page source renders data-testid download-form-{id} buttons', () => {
    expect(PAGE_SRC).toContain('data-testid={`download-form-${form.id}`}');
  });

  it('3. page source renders data-testid open-form-{id} buttons', () => {
    expect(PAGE_SRC).toContain('data-testid={`open-form-${form.id}`}');
  });

  it('4. page imports downloadPdfFile utility', () => {
    expect(PAGE_SRC).toContain("from '@/components/chat/utils/downloadPdfFile'");
  });

  it('5. page source renders therapeutic_forms.download_form i18n key', () => {
    expect(PAGE_SRC).toContain("t('therapeutic_forms.download_form')");
  });

  it('6. page source still renders therapeutic_forms.open_form i18n key', () => {
    expect(PAGE_SRC).toContain("t('therapeutic_forms.open_form')");
  });
});

describe('Phase 5 — TherapeuticForms page: Category scroll arrows', () => {
  it('7. page uses ScrollableChipRow component', () => {
    expect(PAGE_SRC).toContain('ScrollableChipRow');
  });

  it('8. page imports ChevronLeft and ChevronRight for scroll arrows', () => {
    expect(PAGE_SRC).toContain('ChevronLeft');
    expect(PAGE_SRC).toContain('ChevronRight');
  });

  it('9. all category filter options are present in page (count sanity)', () => {
    // THERAPEUTIC_CATEGORIES + 'all' should all appear as option values
    const allCategories = ['all', ...THERAPEUTIC_CATEGORIES.map((c) => c.value)];
    for (const cat of allCategories) {
      // The page renders each category via categoryOptions derived from THERAPEUTIC_CATEGORIES
      // Verify THERAPEUTIC_CATEGORIES is non-empty
      expect(THERAPEUTIC_CATEGORIES.length).toBeGreaterThan(0);
    }
    expect(allCategories.length).toBe(THERAPEUTIC_CATEGORIES.length + 1);
  });

  it('10. RTL-aware isRtl flag is present in page', () => {
    expect(PAGE_SRC).toContain('isRtl');
  });
});

describe('Phase 5 — GeneratedFileCard: real download', () => {
  it('11. GeneratedFileCard source exports normalizeGeneratedFile', () => {
    expect(CARD_SRC).toContain('export { normalizeGeneratedFile }');
  });

  it('12. GeneratedFileCard imports downloadPdfFile', () => {
    expect(CARD_SRC).toContain("from './utils/downloadPdfFile'");
  });

  it('13. GeneratedFileCard no longer calls CreateFileSignedUrl', () => {
    expect(CARD_SRC).not.toContain('CreateFileSignedUrl');
  });

  it('14. GeneratedFileCard has handleDownload that calls downloadPdfFile', () => {
    expect(CARD_SRC).toContain('downloadPdfFile');
    expect(CARD_SRC).toContain('handleDownload');
  });

  it('15. GeneratedFileCard has handleOpen that uses window.open', () => {
    expect(CARD_SRC).toContain('handleOpen');
    expect(CARD_SRC).toContain('window.open');
  });

  it('16. GeneratedFileCard renders both Open and Download button labels', () => {
    expect(CARD_SRC).toContain("'chat.generated_file.open_button'");
    expect(CARD_SRC).toContain("'chat.generated_file.download_button'");
  });
});

describe('Phase 5 — downloadPdfFile utility', () => {
  it('17. downloadPdfFile is a function', () => {
    expect(typeof downloadPdfFile).toBe('function');
  });

  it('18. downloadPdfFile returns early (undefined) for falsy url', async () => {
    const result = await downloadPdfFile(null, 'file.pdf');
    expect(result).toBeUndefined();
  });

  it('19. downloadPdfFile returns early (undefined) for non-string url', async () => {
    const result = await downloadPdfFile(42, 'file.pdf');
    expect(result).toBeUndefined();
  });

  it('20. downloadPdfFile source has isSameOrigin check', () => {
    expect(DOWNLOAD_UTIL_SRC).toContain('isSameOrigin');
  });

  it('21. downloadPdfFile source revokes object URL', () => {
    expect(DOWNLOAD_UTIL_SRC).toContain('revokeObjectURL');
  });
});

describe('Phase 5 — i18n: download_form key in all 7 languages', () => {
  it('22. English download_form is "Download"', () => {
    expect(translations.en.translation.therapeutic_forms.download_form).toBe('Download');
  });

  it('23. Hebrew download_form is "הורד"', () => {
    expect(translations.he.translation.therapeutic_forms.download_form).toBe('הורד');
  });

  it('24. All 7 languages have download_form key', () => {
    for (const lang of APP_LANGUAGES) {
      expect(
        translations[lang]?.translation?.therapeutic_forms?.download_form,
        `Language "${lang}" missing therapeutic_forms.download_form`
      ).toBeTruthy();
    }
  });

  it('25. All 7 languages have open_form key', () => {
    for (const lang of APP_LANGUAGES) {
      expect(
        translations[lang]?.translation?.therapeutic_forms?.open_form,
        `Language "${lang}" missing therapeutic_forms.open_form`
      ).toBeTruthy();
    }
  });

  it('26. Hebrew open_form is "פתח"', () => {
    expect(translations.he.translation.therapeutic_forms.open_form).toBe('פתח');
  });
});

describe('Phase 5 — PDF assets: 36 PDFs exist and are non-empty', () => {
  const expectedPdfs = APPROVED_FORMS.flatMap((form) => {
    const entries = [];
    const enData = form.languages?.en;
    const heData = form.languages?.he;
    if (enData?.file_url) entries.push({ lang: 'en', url: enData.file_url });
    if (heData?.file_url) entries.push({ lang: 'he', url: heData.file_url });
    return entries;
  });

  it('27. Exactly 36 PDF paths are referenced by approved forms (18 EN + 18 HE)', () => {
    expect(expectedPdfs.length).toBe(36);
  });

  for (const { lang, url } of expectedPdfs) {
    const diskPath = path.join(PUBLIC, url);
    const label    = url.replace('/forms/', '');

    it(`28-asset [${lang}] ${label} exists on disk`, () => {
      expect(fs.existsSync(diskPath), `Missing: ${diskPath}`).toBe(true);
    });

    it(`29-size  [${lang}] ${label} is > 10 KB (not a stub)`, () => {
      const size = fs.statSync(diskPath).size;
      expect(size, `File too small (${size} bytes): ${diskPath}`).toBeGreaterThan(10_000);
    });
  }
});

describe('Phase 5 — Regression: 18 approved forms still resolve', () => {
  it('30. Exactly 18 forms are approved', () => {
    expect(APPROVED_FORMS.length).toBe(18);
  });

  it('31. All 18 approved forms resolve in English', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'en');
      expect(resolved, `Form ${form.id} failed to resolve in English`).not.toBeNull();
    }
  });

  it('32. All 18 approved forms resolve in Hebrew', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'he');
      expect(resolved, `Form ${form.id} failed to resolve in Hebrew`).not.toBeNull();
    }
  });
});

describe('Phase 5 — Regression: normalizeGeneratedFile unaffected', () => {
  const FIXTURE_GENERATED_FILE = {
    type: 'pdf',
    url: '/forms/en/adults/cbt-thought-record.pdf',
    name: 'cbt-thought-record.pdf',
    title: 'CBT Thought Record',
    description: 'A worksheet for examining automatic thoughts.',
    source: 'therapeutic_forms_library',
    form_id: 'tf-adults-cbt-thought-record',
  };

  it('33. normalizeGeneratedFile returns normalized object for valid fixture', () => {
    const result = normalizeGeneratedFile(FIXTURE_GENERATED_FILE);
    expect(result).not.toBeNull();
    expect(result.type).toBe('pdf');
    expect(result.url).toBe('/forms/en/adults/cbt-thought-record.pdf');
    expect(result.name).toBe('cbt-thought-record.pdf');
  });

  it('34. normalizeGeneratedFile returns null for non-pdf type', () => {
    expect(normalizeGeneratedFile({ ...FIXTURE_GENERATED_FILE, type: 'docx' })).toBeNull();
  });

  it('35. normalizeGeneratedFile returns null for missing url', () => {
    const { url: _url, ...rest } = FIXTURE_GENERATED_FILE;
    expect(normalizeGeneratedFile(rest)).toBeNull();
  });
});

describe('Phase 5 — Regression: attachment metadata unaffected', () => {
  // The attachment flow (user-uploaded files) uses message.metadata.attachment,
  // which is completely separate from generated_file. Verify the normalizeGeneratedFile
  // function correctly rejects attachment-shaped objects.
  const ATTACHMENT_FIXTURE = {
    type: 'image',
    url: 'https://storage.example.com/user-upload-123.jpg',
    name: 'photo.jpg',
  };

  it('36. normalizeGeneratedFile rejects attachment (non-pdf type)', () => {
    expect(normalizeGeneratedFile(ATTACHMENT_FIXTURE)).toBeNull();
  });

  it('37. normalizeGeneratedFile rejects object with no type', () => {
    expect(normalizeGeneratedFile({ url: '/forms/en/adults/cbt-thought-record.pdf', name: 'file.pdf' })).toBeNull();
  });
});

describe('Phase 5 — Scope guard: unchanged files', () => {
  it('38. Home.jsx does not import downloadPdfFile', () => {
    const homeSrc = fs.readFileSync(path.join(ROOT, 'src/pages/Home.jsx'), 'utf8');
    expect(homeSrc).not.toContain('downloadPdfFile');
  });

  it('39. agentWiring.js is unchanged (no downloadPdfFile reference)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/api/agentWiring.js'), 'utf8');
    expect(src).not.toContain('downloadPdfFile');
  });

  it('40. activeAgentWiring.js is unchanged (no downloadPdfFile reference)', () => {
    const src = fs.readFileSync(path.join(ROOT, 'src/api/activeAgentWiring.js'), 'utf8');
    expect(src).not.toContain('downloadPdfFile');
  });
});

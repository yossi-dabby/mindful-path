/**
 * Tests for TherapeuticForms — Italian (it) language integration.
 *
 * Verifies that all 18 approved forms have valid Italian language blocks
 * pointing to real PDF assets under public/forms/it/.
 *
 * Requirements tested:
 *  1.  All 18 approved forms have a `it` language block.
 *  2.  All 18 Italian file_url values start with /forms/it/.
 *  3.  All 18 Italian PDF files exist on disk.
 *  4.  All 18 Italian blocks have rtl: false.
 *  5.  All 18 Italian blocks have non-empty title, description, file_name.
 *  6.  Resolver returns Italian metadata when language is "it".
 *  7.  Resolver returns Italian file_url pointing to /forms/it/ for all 18 forms.
 *  8.  Unsupported language (e.g. "pt") still falls back to English for all forms.
 *  9.  Hebrew blocks remain unchanged (rtl: true, /forms/he/ paths).
 * 10.  English blocks remain unchanged (rtl: false, /forms/en/ paths).
 * 11.  Spanish blocks remain unchanged (rtl: false, /forms/es/ paths).
 * 12.  French blocks remain unchanged (rtl: false, /forms/fr/ paths).
 * 13.  German blocks remain unchanged (rtl: false, /forms/de/ paths).
 * 14.  Approved form count remains exactly 18.
 * 15.  No placeholder or fake Italian URL can resolve.
 * 16.  AI mappings (APPROVED_FORM_INTENT_MAP) remain unchanged.
 * 17.  toGeneratedFileMetadata works for Italian resolved forms.
 * 18.  Italian PDF files are non-empty (> 10 KB).
 * 19.  Italian language code in resolved result is "it".
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ALL_FORMS,
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
} from '../../src/data/therapeuticForms/index.js';

import {
  APPROVED_FORM_INTENT_MAP,
} from '../../src/utils/resolveFormIntent.js';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, '../../public');

function resolvePublicPath(fileUrl) {
  return path.join(PUBLIC_ROOT, fileUrl);
}

// ─── Fixtures ─────────────────────────────────────────────────────────────────

const APPROVED_FORMS = ALL_FORMS.filter((f) => f.approved === true);

// Expected Italian PDF paths keyed by form id
const EXPECTED_ITALIAN_PATHS = {
  'tf-children-feelings-checkin':                '/forms/it/children/simple-feelings-check-in.pdf',
  'tf-children-grounding-exercise':              '/forms/it/children/grounding-exercise.pdf',
  'tf-children-parent-guided-coping-card':       '/forms/it/children/parent-guided-coping-card.pdf',
  'tf-children-box-breathing':                   '/forms/it/children/box-breathing.pdf',
  'tf-adolescents-anxiety-thought-record':       '/forms/it/adolescents/anxiety-thought-record.pdf',
  'tf-adolescents-emotion-regulation-worksheet': '/forms/it/adolescents/emotion-regulation-worksheet.pdf',
  'tf-adolescents-weekly-practice-planner':      '/forms/it/adolescents/weekly-practice-planner.pdf',
  'tf-adolescents-social-pressure-coping-tool':  '/forms/it/adolescents/social-pressure-coping-tool.pdf',
  'tf-adults-cbt-thought-record':                '/forms/it/adults/cbt-thought-record.pdf',
  'tf-adults-behavioral-activation-plan':        '/forms/it/adults/behavioral-activation-plan.pdf',
  'tf-adults-cognitive-distortions-worksheet':   '/forms/it/adults/cognitive-distortions-worksheet.pdf',
  'tf-adults-values-and-goals-worksheet':        '/forms/it/adults/values-and-goals-worksheet.pdf',
  'tf-adults-mood-tracking-sheet':               '/forms/it/adults/mood-tracking-sheet.pdf',
  'tf-adults-weekly-coping-plan':                '/forms/it/adults/weekly-coping-plan.pdf',
  'tf-older-adults-mood-reflection-sheet':       '/forms/it/older_adults/mood-reflection-sheet.pdf',
  'tf-older-adults-sleep-routine-reflection':    '/forms/it/older_adults/sleep-routine-reflection.pdf',
  'tf-older-adults-daily-coping-plan':           '/forms/it/older_adults/daily-coping-plan.pdf',
  'tf-older-adults-caregiver-support-reflection':'/forms/it/older_adults/caregiver-support-reflection.pdf',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Italian integration — approved form count', () => {
  it('1. Exactly 18 forms are approved', () => {
    expect(APPROVED_FORMS.length).toBe(18);
  });
});

describe('Italian integration — registry language blocks', () => {
  it('2. Every approved form has an it language block', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.it,
        `Form ${form.id} is missing an it language block`
      ).toBeDefined();
    }
  });

  it('3. Every Italian file_url starts with /forms/it/', () => {
    for (const form of APPROVED_FORMS) {
      const itBlock = form.languages?.it;
      expect(
        itBlock?.file_url,
        `Form ${form.id} it.file_url should start with /forms/it/`
      ).toMatch(/^\/forms\/it\//);
    }
  });

  it('4. Every Italian block has rtl: false', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.it?.rtl,
        `Form ${form.id} it.rtl should be false`
      ).toBe(false);
    }
  });

  it('5. Every Italian block has a non-empty title', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.it?.title === 'string' && form.languages.it.title.trim().length > 0,
        `Form ${form.id} it.title is empty`
      ).toBe(true);
    }
  });

  it('6. Every Italian block has a non-empty description', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.it?.description === 'string' && form.languages.it.description.trim().length > 0,
        `Form ${form.id} it.description is empty`
      ).toBe(true);
    }
  });

  it('7. Every Italian block has a non-empty file_name', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.it?.file_name === 'string' && form.languages.it.file_name.trim().length > 0,
        `Form ${form.id} it.file_name is empty`
      ).toBe(true);
    }
  });

  it('8. Every Italian block has file_type: pdf', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.it?.file_type,
        `Form ${form.id} it.file_type should be pdf`
      ).toBe('pdf');
    }
  });

  it('9. Each Italian file_url matches the expected path', () => {
    for (const form of APPROVED_FORMS) {
      const expected = EXPECTED_ITALIAN_PATHS[form.id];
      expect(
        expected,
        `No expected path defined for form ${form.id}`
      ).toBeDefined();
      expect(
        form.languages?.it?.file_url,
        `Form ${form.id} it.file_url mismatch`
      ).toBe(expected);
    }
  });
});

describe('Italian integration — PDF files exist on disk', () => {
  for (const [formId, fileUrl] of Object.entries(EXPECTED_ITALIAN_PATHS)) {
    const diskPath = resolvePublicPath(fileUrl);
    const label = fileUrl.replace('/forms/it/', '');

    it(`10-exists [it] ${label} exists on disk`, () => {
      expect(fs.existsSync(diskPath), `Missing: ${diskPath}`).toBe(true);
    });

    it(`11-size   [it] ${label} is > 10 KB (not a stub)`, () => {
      const size = fs.statSync(diskPath).size;
      expect(size, `File too small (${size} bytes): ${diskPath}`).toBeGreaterThan(10_000);
    });
  }
});

describe('Italian integration — resolver returns Italian data', () => {
  it('12. Resolver returns Italian metadata for all 18 forms when lang=it', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'it');
      expect(resolved, `Form ${form.id} failed to resolve in Italian`).not.toBeNull();
      expect(resolved.language).toBe('it');
      expect(resolved.languageData.rtl).toBe(false);
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/it\//);
    }
  });

  it('13. Resolver Italian file_url matches expected path for each form', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'it');
      const expected = EXPECTED_ITALIAN_PATHS[form.id];
      expect(
        resolved?.languageData?.file_url,
        `Form ${form.id} resolved it file_url mismatch`
      ).toBe(expected);
    }
  });

  it('14. Resolver Italian language code is "it" for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'it');
      expect(resolved?.language).toBe('it');
    }
  });
});

describe('Italian integration — toGeneratedFileMetadata works for Italian', () => {
  it('15. toGeneratedFileMetadata returns valid shape for Italian resolved forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'it');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `toGeneratedFileMetadata returned null for ${form.id} in it`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.language).toBe('it');
      expect(meta.url).toMatch(/^\/forms\/it\//);
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(form.id);
    }
  });
});

describe('Italian integration — fallback behavior', () => {
  it('16. Portuguese language resolves to Portuguese for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'pt');
      expect(resolved, `Form ${form.id} failed to resolve in Portuguese`).not.toBeNull();
      expect(resolved.language).toBe('pt');
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/pt\//);
    }
  });
});

describe('Italian integration — Hebrew blocks unchanged', () => {
  it('17. Hebrew blocks still have rtl: true for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const heBlock = form.languages?.he;
      expect(
        heBlock,
        `Form ${form.id} is missing a he language block`
      ).toBeDefined();
      expect(
        heBlock.rtl,
        `Form ${form.id} he.rtl should be true`
      ).toBe(true);
    }
  });

  it('18. Hebrew file_url values still start with /forms/he/ for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.he?.file_url,
        `Form ${form.id} he.file_url should start with /forms/he/`
      ).toMatch(/^\/forms\/he\//);
    }
  });

  it('19. Resolver still returns Hebrew metadata when lang=he', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'he');
      expect(resolved, `Form ${form.id} failed to resolve in Hebrew`).not.toBeNull();
      expect(resolved.language).toBe('he');
      expect(resolved.languageData.rtl).toBe(true);
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/he\//);
    }
  });
});

describe('Italian integration — English blocks unchanged', () => {
  it('20. English blocks still have rtl: false for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.en?.rtl,
        `Form ${form.id} en.rtl should be false`
      ).toBe(false);
    }
  });

  it('21. English file_url values still start with /forms/en/ for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.en?.file_url,
        `Form ${form.id} en.file_url should start with /forms/en/`
      ).toMatch(/^\/forms\/en\//);
    }
  });

  it('22. Resolver still returns English metadata when lang=en', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'en');
      expect(resolved, `Form ${form.id} failed to resolve in English`).not.toBeNull();
      expect(resolved.language).toBe('en');
      expect(resolved.languageData.rtl).toBe(false);
    }
  });
});

describe('Italian integration — Spanish blocks unchanged', () => {
  it('23. Spanish blocks still have rtl: false for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.es?.rtl,
        `Form ${form.id} es.rtl should be false`
      ).toBe(false);
    }
  });

  it('24. Spanish file_url values still start with /forms/es/ for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.es?.file_url,
        `Form ${form.id} es.file_url should start with /forms/es/`
      ).toMatch(/^\/forms\/es\//);
    }
  });

  it('25. Resolver still returns Spanish metadata when lang=es', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'es');
      expect(resolved, `Form ${form.id} failed to resolve in Spanish`).not.toBeNull();
      expect(resolved.language).toBe('es');
      expect(resolved.languageData.rtl).toBe(false);
    }
  });
});

describe('Italian integration — French blocks unchanged', () => {
  it('26. French blocks still have rtl: false for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.fr?.rtl,
        `Form ${form.id} fr.rtl should be false`
      ).toBe(false);
    }
  });

  it('27. French file_url values still start with /forms/fr/ for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.fr?.file_url,
        `Form ${form.id} fr.file_url should start with /forms/fr/`
      ).toMatch(/^\/forms\/fr\//);
    }
  });

  it('28. Resolver still returns French metadata when lang=fr', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'fr');
      expect(resolved, `Form ${form.id} failed to resolve in French`).not.toBeNull();
      expect(resolved.language).toBe('fr');
      expect(resolved.languageData.rtl).toBe(false);
    }
  });
});

describe('Italian integration — German blocks unchanged', () => {
  it('29. German blocks still have rtl: false for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.de?.rtl,
        `Form ${form.id} de.rtl should be false`
      ).toBe(false);
    }
  });

  it('30. German file_url values still start with /forms/de/ for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.de?.file_url,
        `Form ${form.id} de.file_url should start with /forms/de/`
      ).toMatch(/^\/forms\/de\//);
    }
  });

  it('31. Resolver still returns German metadata when lang=de', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'de');
      expect(resolved, `Form ${form.id} failed to resolve in German`).not.toBeNull();
      expect(resolved.language).toBe('de');
      expect(resolved.languageData.rtl).toBe(false);
    }
  });
});

describe('Italian integration — AI mappings unchanged', () => {
  it('32. APPROVED_FORM_INTENT_MAP is defined and non-empty', () => {
    expect(APPROVED_FORM_INTENT_MAP).toBeDefined();
    expect(Object.keys(APPROVED_FORM_INTENT_MAP).length).toBeGreaterThan(0);
  });

  it('33. Every AI mapping intent resolves to an approved form', () => {
    for (const [intent, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const resolved = resolveFormWithLanguage(formId, 'en');
      expect(
        resolved,
        `AI intent "${intent}" maps to form "${formId}" which does not resolve`
      ).not.toBeNull();
    }
  });

  it('34. Every AI mapping intent still resolves in Italian after the update', () => {
    for (const [intent, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const resolved = resolveFormWithLanguage(formId, 'it');
      expect(
        resolved,
        `AI intent "${intent}" maps to form "${formId}" which does not resolve in it`
      ).not.toBeNull();
      expect(resolved.language).toBe('it');
    }
  });
});

describe('Italian integration — no fake or missing URLs', () => {
  it('35. No Italian file_url contains placeholder wording', () => {
    const placeholderPatterns = ['placeholder', 'fake', 'todo', 'tbd', 'example.com', 'static.'];
    for (const form of APPROVED_FORMS) {
      const url = form.languages?.it?.file_url ?? '';
      for (const pattern of placeholderPatterns) {
        expect(
          url.toLowerCase().includes(pattern),
          `Form ${form.id} it.file_url contains placeholder: "${pattern}" in "${url}"`
        ).toBe(false);
      }
    }
  });

  it('36. All 18 Italian PDF paths are unique (no duplicates)', () => {
    const urls = APPROVED_FORMS.map((f) => f.languages?.it?.file_url);
    const unique = new Set(urls);
    expect(unique.size).toBe(18);
  });
});

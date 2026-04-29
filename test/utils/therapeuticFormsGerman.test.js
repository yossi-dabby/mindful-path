/**
 * Tests for TherapeuticForms — German (de) language integration.
 *
 * Verifies that all 18 approved forms have valid German language blocks
 * pointing to real PDF assets under public/forms/de/.
 *
 * Requirements tested:
 *  1.  All 18 approved forms have a `de` language block.
 *  2.  All 18 German file_url values start with /forms/de/.
 *  3.  All 18 German PDF files exist on disk.
 *  4.  All 18 German blocks have rtl: false.
 *  5.  All 18 German blocks have non-empty title, description, file_name.
 *  6.  Resolver returns German metadata when language is "de".
 *  7.  Resolver returns German file_url pointing to /forms/de/ for all 18 forms.
 *  8.  Unsupported language (e.g. "pt") still falls back to English for all forms.
 *  9.  Hebrew blocks remain unchanged (rtl: true, /forms/he/ paths).
 * 10.  English blocks remain unchanged (rtl: false, /forms/en/ paths).
 * 11.  Spanish blocks remain unchanged (rtl: false, /forms/es/ paths).
 * 12.  French blocks remain unchanged (rtl: false, /forms/fr/ paths).
 * 13.  Approved form count remains exactly 18.
 * 14.  No placeholder or fake German URL can resolve.
 * 15.  AI mappings (APPROVED_FORM_INTENT_MAP) remain unchanged.
 * 16.  toGeneratedFileMetadata works for German resolved forms.
 * 17.  German PDF files are non-empty (> 10 KB).
 * 18.  German language code in resolved result is "de".
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

// Expected German PDF paths keyed by form id
const EXPECTED_GERMAN_PATHS = {
  'tf-children-feelings-checkin':                '/forms/de/children/simple-feelings-check-in.pdf',
  'tf-children-grounding-exercise':              '/forms/de/children/grounding-exercise.pdf',
  'tf-children-parent-guided-coping-card':       '/forms/de/children/parent-guided-coping-card.pdf',
  'tf-children-box-breathing':                   '/forms/de/children/box-breathing.pdf',
  'tf-adolescents-anxiety-thought-record':       '/forms/de/adolescents/anxiety-thought-record.pdf',
  'tf-adolescents-emotion-regulation-worksheet': '/forms/de/adolescents/emotion-regulation-worksheet.pdf',
  'tf-adolescents-weekly-practice-planner':      '/forms/de/adolescents/weekly-practice-planner.pdf',
  'tf-adolescents-social-pressure-coping-tool':  '/forms/de/adolescents/social-pressure-coping-tool.pdf',
  'tf-adults-cbt-thought-record':                '/forms/de/adults/cbt-thought-record.pdf',
  'tf-adults-behavioral-activation-plan':        '/forms/de/adults/behavioral-activation-plan.pdf',
  'tf-adults-cognitive-distortions-worksheet':   '/forms/de/adults/cognitive-distortions-worksheet.pdf',
  'tf-adults-values-and-goals-worksheet':        '/forms/de/adults/values-and-goals-worksheet.pdf',
  'tf-adults-mood-tracking-sheet':               '/forms/de/adults/mood-tracking-sheet.pdf',
  'tf-adults-weekly-coping-plan':                '/forms/de/adults/weekly-coping-plan.pdf',
  'tf-older-adults-mood-reflection-sheet':       '/forms/de/older_adults/mood-reflection-sheet.pdf',
  'tf-older-adults-sleep-routine-reflection':    '/forms/de/older_adults/sleep-routine-reflection.pdf',
  'tf-older-adults-daily-coping-plan':           '/forms/de/older_adults/daily-coping-plan.pdf',
  'tf-older-adults-caregiver-support-reflection':'/forms/de/older_adults/caregiver-support-reflection.pdf',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('German integration — approved form count', () => {
  it('1. Exactly 18 forms are approved', () => {
    expect(APPROVED_FORMS.length).toBe(18);
  });
});

describe('German integration — registry language blocks', () => {
  it('2. Every approved form has a de language block', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.de,
        `Form ${form.id} is missing a de language block`
      ).toBeDefined();
    }
  });

  it('3. Every German file_url starts with /forms/de/', () => {
    for (const form of APPROVED_FORMS) {
      const deBlock = form.languages?.de;
      expect(
        deBlock?.file_url,
        `Form ${form.id} de.file_url should start with /forms/de/`
      ).toMatch(/^\/forms\/de\//);
    }
  });

  it('4. Every German block has rtl: false', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.de?.rtl,
        `Form ${form.id} de.rtl should be false`
      ).toBe(false);
    }
  });

  it('5. Every German block has a non-empty title', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.de?.title === 'string' && form.languages.de.title.trim().length > 0,
        `Form ${form.id} de.title is empty`
      ).toBe(true);
    }
  });

  it('6. Every German block has a non-empty description', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.de?.description === 'string' && form.languages.de.description.trim().length > 0,
        `Form ${form.id} de.description is empty`
      ).toBe(true);
    }
  });

  it('7. Every German block has a non-empty file_name', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.de?.file_name === 'string' && form.languages.de.file_name.trim().length > 0,
        `Form ${form.id} de.file_name is empty`
      ).toBe(true);
    }
  });

  it('8. Every German block has file_type: pdf', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.de?.file_type,
        `Form ${form.id} de.file_type should be pdf`
      ).toBe('pdf');
    }
  });

  it('9. Each German file_url matches the expected path', () => {
    for (const form of APPROVED_FORMS) {
      const expected = EXPECTED_GERMAN_PATHS[form.id];
      expect(
        expected,
        `No expected path defined for form ${form.id}`
      ).toBeDefined();
      expect(
        form.languages?.de?.file_url,
        `Form ${form.id} de.file_url mismatch`
      ).toBe(expected);
    }
  });
});

describe('German integration — PDF files exist on disk', () => {
  for (const [formId, fileUrl] of Object.entries(EXPECTED_GERMAN_PATHS)) {
    const diskPath = resolvePublicPath(fileUrl);
    const label = fileUrl.replace('/forms/de/', '');

    it(`10-exists [de] ${label} exists on disk`, () => {
      expect(fs.existsSync(diskPath), `Missing: ${diskPath}`).toBe(true);
    });

    it(`11-size   [de] ${label} is > 10 KB (not a stub)`, () => {
      const size = fs.statSync(diskPath).size;
      expect(size, `File too small (${size} bytes): ${diskPath}`).toBeGreaterThan(10_000);
    });
  }
});

describe('German integration — resolver returns German data', () => {
  it('12. Resolver returns German metadata for all 18 forms when lang=de', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'de');
      expect(resolved, `Form ${form.id} failed to resolve in German`).not.toBeNull();
      expect(resolved.language).toBe('de');
      expect(resolved.languageData.rtl).toBe(false);
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/de\//);
    }
  });

  it('13. Resolver German file_url matches expected path for each form', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'de');
      const expected = EXPECTED_GERMAN_PATHS[form.id];
      expect(
        resolved?.languageData?.file_url,
        `Form ${form.id} resolved de file_url mismatch`
      ).toBe(expected);
    }
  });

  it('14. Resolver German language code is "de" for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'de');
      expect(resolved?.language).toBe('de');
    }
  });
});

describe('German integration — toGeneratedFileMetadata works for German', () => {
  it('15. toGeneratedFileMetadata returns valid shape for German resolved forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'de');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `toGeneratedFileMetadata returned null for ${form.id} in de`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.language).toBe('de');
      expect(meta.url).toMatch(/^\/forms\/de\//);
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(form.id);
    }
  });
});

describe('German integration — fallback behavior', () => {
  it('16. Unsupported language (pt) still falls back to English for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'pt');
      expect(resolved, `Form ${form.id} failed to resolve with pt fallback`).not.toBeNull();
      expect(resolved.language).toBe('en');
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/en\//);
    }
  });

  it('17. Unsupported language (zh) still falls back to English for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'zh');
      expect(resolved, `Form ${form.id} failed to resolve with zh fallback`).not.toBeNull();
      expect(resolved.language).toBe('en');
    }
  });
});

describe('German integration — Hebrew blocks unchanged', () => {
  it('18. Hebrew blocks still have rtl: true for all 18 forms', () => {
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

  it('19. Hebrew file_url values still start with /forms/he/ for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.he?.file_url,
        `Form ${form.id} he.file_url should start with /forms/he/`
      ).toMatch(/^\/forms\/he\//);
    }
  });

  it('20. Resolver still returns Hebrew metadata when lang=he', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'he');
      expect(resolved, `Form ${form.id} failed to resolve in Hebrew`).not.toBeNull();
      expect(resolved.language).toBe('he');
      expect(resolved.languageData.rtl).toBe(true);
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/he\//);
    }
  });
});

describe('German integration — English blocks unchanged', () => {
  it('21. English blocks still have rtl: false for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.en?.rtl,
        `Form ${form.id} en.rtl should be false`
      ).toBe(false);
    }
  });

  it('22. English file_url values still start with /forms/en/ for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.en?.file_url,
        `Form ${form.id} en.file_url should start with /forms/en/`
      ).toMatch(/^\/forms\/en\//);
    }
  });

  it('23. Resolver still returns English metadata when lang=en', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'en');
      expect(resolved, `Form ${form.id} failed to resolve in English`).not.toBeNull();
      expect(resolved.language).toBe('en');
      expect(resolved.languageData.rtl).toBe(false);
    }
  });
});

describe('German integration — Spanish blocks unchanged', () => {
  it('24. Spanish blocks still have rtl: false for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.es?.rtl,
        `Form ${form.id} es.rtl should be false`
      ).toBe(false);
    }
  });

  it('25. Spanish file_url values still start with /forms/es/ for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.es?.file_url,
        `Form ${form.id} es.file_url should start with /forms/es/`
      ).toMatch(/^\/forms\/es\//);
    }
  });

  it('26. Resolver still returns Spanish metadata when lang=es', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'es');
      expect(resolved, `Form ${form.id} failed to resolve in Spanish`).not.toBeNull();
      expect(resolved.language).toBe('es');
      expect(resolved.languageData.rtl).toBe(false);
    }
  });
});

describe('German integration — French blocks unchanged', () => {
  it('27. French blocks still have rtl: false for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.fr?.rtl,
        `Form ${form.id} fr.rtl should be false`
      ).toBe(false);
    }
  });

  it('28. French file_url values still start with /forms/fr/ for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.fr?.file_url,
        `Form ${form.id} fr.file_url should start with /forms/fr/`
      ).toMatch(/^\/forms\/fr\//);
    }
  });

  it('29. Resolver still returns French metadata when lang=fr', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'fr');
      expect(resolved, `Form ${form.id} failed to resolve in French`).not.toBeNull();
      expect(resolved.language).toBe('fr');
      expect(resolved.languageData.rtl).toBe(false);
    }
  });
});

describe('German integration — AI mappings unchanged', () => {
  it('30. APPROVED_FORM_INTENT_MAP is defined and non-empty', () => {
    expect(APPROVED_FORM_INTENT_MAP).toBeDefined();
    expect(Object.keys(APPROVED_FORM_INTENT_MAP).length).toBeGreaterThan(0);
  });

  it('31. Every AI mapping intent resolves to an approved form', () => {
    for (const [intent, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const resolved = resolveFormWithLanguage(formId, 'en');
      expect(
        resolved,
        `AI intent "${intent}" maps to form "${formId}" which does not resolve`
      ).not.toBeNull();
    }
  });

  it('32. Every AI mapping intent still resolves in German after the update', () => {
    for (const [intent, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const resolved = resolveFormWithLanguage(formId, 'de');
      expect(
        resolved,
        `AI intent "${intent}" maps to form "${formId}" which does not resolve in de`
      ).not.toBeNull();
      expect(resolved.language).toBe('de');
    }
  });
});

describe('German integration — no fake or missing URLs', () => {
  it('33. No German file_url contains placeholder wording', () => {
    const placeholderPatterns = ['placeholder', 'fake', 'todo', 'tbd', 'example.com', 'static.'];
    for (const form of APPROVED_FORMS) {
      const url = form.languages?.de?.file_url ?? '';
      for (const pattern of placeholderPatterns) {
        expect(
          url.toLowerCase().includes(pattern),
          `Form ${form.id} de.file_url contains placeholder: "${pattern}" in "${url}"`
        ).toBe(false);
      }
    }
  });

  it('34. All 18 German PDF paths are unique (no duplicates)', () => {
    const urls = APPROVED_FORMS.map((f) => f.languages?.de?.file_url);
    const unique = new Set(urls);
    expect(unique.size).toBe(18);
  });
});

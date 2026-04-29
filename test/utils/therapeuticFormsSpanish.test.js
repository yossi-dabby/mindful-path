/**
 * Tests for TherapeuticForms — Spanish (es) language integration.
 *
 * Verifies that all 18 approved forms have valid Spanish language blocks
 * pointing to real PDF assets under public/forms/es/.
 *
 * Requirements tested:
 *  1.  All 18 approved forms have an `es` language block.
 *  2.  All 18 Spanish file_url values start with /forms/es/.
 *  3.  All 18 Spanish PDF files exist on disk.
 *  4.  All 18 Spanish blocks have rtl: false.
 *  5.  All 18 Spanish blocks have non-empty title, description, file_name.
 *  6.  Resolver returns Spanish metadata when language is "es".
 *  7.  Resolver returns Spanish file_url pointing to /forms/es/ for all 18 forms.
 *  8.  Unsupported language (e.g. "fr") still falls back to English for all forms.
 *  9.  Hebrew blocks remain unchanged (rtl: true, /forms/he/ paths).
 * 10.  English blocks remain unchanged (rtl: false, /forms/en/ paths).
 * 11.  Approved form count remains exactly 18.
 * 12.  No placeholder or fake Spanish URL can resolve.
 * 13.  AI mappings (APPROVED_FORM_INTENT_MAP) remain unchanged.
 * 14.  toGeneratedFileMetadata works for Spanish resolved forms.
 * 15.  Spanish PDF files are non-empty (> 10 KB).
 * 16.  Spanish language code in resolved result is "es".
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

// Expected Spanish PDF paths keyed by form id
const EXPECTED_SPANISH_PATHS = {
  'tf-children-feelings-checkin':               '/forms/es/children/simple-feelings-check-in.pdf',
  'tf-children-grounding-exercise':             '/forms/es/children/grounding-exercise.pdf',
  'tf-children-parent-guided-coping-card':      '/forms/es/children/parent-guided-coping-card.pdf',
  'tf-children-box-breathing':                  '/forms/es/children/box-breathing.pdf',
  'tf-adolescents-anxiety-thought-record':      '/forms/es/adolescents/anxiety-thought-record.pdf',
  'tf-adolescents-emotion-regulation-worksheet':'/forms/es/adolescents/emotion-regulation-worksheet.pdf',
  'tf-adolescents-weekly-practice-planner':     '/forms/es/adolescents/weekly-practice-planner.pdf',
  'tf-adolescents-social-pressure-coping-tool': '/forms/es/adolescents/social-pressure-coping-tool.pdf',
  'tf-adults-cbt-thought-record':               '/forms/es/adults/cbt-thought-record.pdf',
  'tf-adults-behavioral-activation-plan':       '/forms/es/adults/behavioral-activation-plan.pdf',
  'tf-adults-cognitive-distortions-worksheet':  '/forms/es/adults/cognitive-distortions-worksheet.pdf',
  'tf-adults-values-and-goals-worksheet':       '/forms/es/adults/values-and-goals-worksheet.pdf',
  'tf-adults-mood-tracking-sheet':              '/forms/es/adults/mood-tracking-sheet.pdf',
  'tf-adults-weekly-coping-plan':               '/forms/es/adults/weekly-coping-plan.pdf',
  'tf-older-adults-mood-reflection-sheet':      '/forms/es/older_adults/mood-reflection-sheet.pdf',
  'tf-older-adults-sleep-routine-reflection':   '/forms/es/older_adults/sleep-routine-reflection.pdf',
  'tf-older-adults-daily-coping-plan':          '/forms/es/older_adults/daily-coping-plan.pdf',
  'tf-older-adults-caregiver-support-reflection':'/forms/es/older_adults/caregiver-support-reflection.pdf',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Spanish integration — approved form count', () => {
  it('1. Exactly 18 forms are approved', () => {
    expect(APPROVED_FORMS.length).toBe(18);
  });
});

describe('Spanish integration — registry language blocks', () => {
  it('2. Every approved form has an es language block', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.es,
        `Form ${form.id} is missing an es language block`
      ).toBeDefined();
    }
  });

  it('3. Every Spanish file_url starts with /forms/es/', () => {
    for (const form of APPROVED_FORMS) {
      const esBlock = form.languages?.es;
      expect(
        esBlock?.file_url,
        `Form ${form.id} es.file_url should start with /forms/es/`
      ).toMatch(/^\/forms\/es\//);
    }
  });

  it('4. Every Spanish block has rtl: false', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.es?.rtl,
        `Form ${form.id} es.rtl should be false`
      ).toBe(false);
    }
  });

  it('5. Every Spanish block has a non-empty title', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.es?.title === 'string' && form.languages.es.title.trim().length > 0,
        `Form ${form.id} es.title is empty`
      ).toBe(true);
    }
  });

  it('6. Every Spanish block has a non-empty description', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.es?.description === 'string' && form.languages.es.description.trim().length > 0,
        `Form ${form.id} es.description is empty`
      ).toBe(true);
    }
  });

  it('7. Every Spanish block has a non-empty file_name', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.es?.file_name === 'string' && form.languages.es.file_name.trim().length > 0,
        `Form ${form.id} es.file_name is empty`
      ).toBe(true);
    }
  });

  it('8. Every Spanish block has file_type: pdf', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.es?.file_type,
        `Form ${form.id} es.file_type should be pdf`
      ).toBe('pdf');
    }
  });

  it('9. Each Spanish file_url matches the expected path', () => {
    for (const form of APPROVED_FORMS) {
      const expected = EXPECTED_SPANISH_PATHS[form.id];
      expect(
        expected,
        `No expected path defined for form ${form.id}`
      ).toBeDefined();
      expect(
        form.languages?.es?.file_url,
        `Form ${form.id} es.file_url mismatch`
      ).toBe(expected);
    }
  });
});

describe('Spanish integration — PDF files exist on disk', () => {
  for (const [formId, fileUrl] of Object.entries(EXPECTED_SPANISH_PATHS)) {
    const diskPath = resolvePublicPath(fileUrl);
    const label = fileUrl.replace('/forms/es/', '');

    it(`10-exists [es] ${label} exists on disk`, () => {
      expect(fs.existsSync(diskPath), `Missing: ${diskPath}`).toBe(true);
    });

    it(`11-size   [es] ${label} is > 10 KB (not a stub)`, () => {
      const size = fs.statSync(diskPath).size;
      expect(size, `File too small (${size} bytes): ${diskPath}`).toBeGreaterThan(10_000);
    });
  }
});

describe('Spanish integration — resolver returns Spanish data', () => {
  it('12. Resolver returns Spanish metadata for all 18 forms when lang=es', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'es');
      expect(resolved, `Form ${form.id} failed to resolve in Spanish`).not.toBeNull();
      expect(resolved.language).toBe('es');
      expect(resolved.languageData.rtl).toBe(false);
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/es\//);
    }
  });

  it('13. Resolver Spanish file_url matches expected path for each form', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'es');
      const expected = EXPECTED_SPANISH_PATHS[form.id];
      expect(
        resolved?.languageData?.file_url,
        `Form ${form.id} resolved es file_url mismatch`
      ).toBe(expected);
    }
  });

  it('14. Resolver Spanish language code is "es" for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'es');
      expect(resolved?.language).toBe('es');
    }
  });
});

describe('Spanish integration — toGeneratedFileMetadata works for Spanish', () => {
  it('15. toGeneratedFileMetadata returns valid shape for Spanish resolved forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'es');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `toGeneratedFileMetadata returned null for ${form.id} in es`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.language).toBe('es');
      expect(meta.url).toMatch(/^\/forms\/es\//);
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(form.id);
    }
  });
});

describe('Spanish integration — fallback behavior', () => {
  it('16. Unsupported language (fr) still falls back to English for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'fr');
      expect(resolved, `Form ${form.id} failed to resolve with fr fallback`).not.toBeNull();
      expect(resolved.language).toBe('en');
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/en\//);
    }
  });

  it('17. Unsupported language (de) still falls back to English for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'de');
      expect(resolved, `Form ${form.id} failed to resolve with de fallback`).not.toBeNull();
      expect(resolved.language).toBe('en');
    }
  });
});

describe('Spanish integration — Hebrew blocks unchanged', () => {
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

describe('Spanish integration — English blocks unchanged', () => {
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

describe('Spanish integration — AI mappings unchanged', () => {
  it('24. APPROVED_FORM_INTENT_MAP is defined and non-empty', () => {
    expect(APPROVED_FORM_INTENT_MAP).toBeDefined();
    expect(Object.keys(APPROVED_FORM_INTENT_MAP).length).toBeGreaterThan(0);
  });

  it('25. Every AI mapping intent resolves to an approved form', () => {
    for (const [intent, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const resolved = resolveFormWithLanguage(formId, 'en');
      expect(
        resolved,
        `AI intent "${intent}" maps to form "${formId}" which does not resolve`
      ).not.toBeNull();
    }
  });

  it('26. Every AI mapping intent still resolves in Spanish after the update', () => {
    for (const [intent, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const resolved = resolveFormWithLanguage(formId, 'es');
      expect(
        resolved,
        `AI intent "${intent}" maps to form "${formId}" which does not resolve in es`
      ).not.toBeNull();
      expect(resolved.language).toBe('es');
    }
  });
});

describe('Spanish integration — no fake or missing URLs', () => {
  it('27. No Spanish file_url contains placeholder wording', () => {
    const placeholderPatterns = ['placeholder', 'fake', 'todo', 'tbd', 'example.com', 'static.'];
    for (const form of APPROVED_FORMS) {
      const url = form.languages?.es?.file_url ?? '';
      for (const pattern of placeholderPatterns) {
        expect(
          url.toLowerCase().includes(pattern),
          `Form ${form.id} es.file_url contains placeholder: "${pattern}" in "${url}"`
        ).toBe(false);
      }
    }
  });

  it('28. All 18 Spanish PDF paths are unique (no duplicates)', () => {
    const urls = APPROVED_FORMS.map((f) => f.languages?.es?.file_url);
    const unique = new Set(urls);
    expect(unique.size).toBe(18);
  });
});

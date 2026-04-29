/**
 * Tests for TherapeuticForms — French (fr) language integration.
 *
 * Verifies that all 18 approved forms have valid French language blocks
 * pointing to real PDF assets under public/forms/fr/.
 *
 * Requirements tested:
 *  1.  All 18 approved forms have an `fr` language block.
 *  2.  All 18 French file_url values start with /forms/fr/.
 *  3.  All 18 French PDF files exist on disk.
 *  4.  All 18 French blocks have rtl: false.
 *  5.  All 18 French blocks have non-empty title, description, file_name.
 *  6.  Resolver returns French metadata when language is "fr".
 *  7.  Resolver returns French file_url pointing to /forms/fr/ for all 18 forms.
 *  8.  Unsupported language (e.g. "it") still falls back to English for all forms.
 *  9.  Hebrew blocks remain unchanged (rtl: true, /forms/he/ paths).
 * 10.  English blocks remain unchanged (rtl: false, /forms/en/ paths).
 * 11.  Spanish blocks remain unchanged (rtl: false, /forms/es/ paths).
 * 12.  Approved form count remains exactly 18.
 * 13.  No placeholder or fake French URL can resolve.
 * 14.  AI mappings (APPROVED_FORM_INTENT_MAP) remain unchanged.
 * 15.  toGeneratedFileMetadata works for French resolved forms.
 * 16.  French PDF files are non-empty (> 10 KB).
 * 17.  French language code in resolved result is "fr".
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

// Expected French PDF paths keyed by form id
const EXPECTED_FRENCH_PATHS = {
  'tf-children-feelings-checkin':                '/forms/fr/children/simple-feelings-check-in.pdf',
  'tf-children-grounding-exercise':              '/forms/fr/children/grounding-exercise.pdf',
  'tf-children-parent-guided-coping-card':       '/forms/fr/children/parent-guided-coping-card.pdf',
  'tf-children-box-breathing':                   '/forms/fr/children/box-breathing.pdf',
  'tf-adolescents-anxiety-thought-record':       '/forms/fr/adolescents/anxiety-thought-record.pdf',
  'tf-adolescents-emotion-regulation-worksheet': '/forms/fr/adolescents/emotion-regulation-worksheet.pdf',
  'tf-adolescents-weekly-practice-planner':      '/forms/fr/adolescents/weekly-practice-planner.pdf',
  'tf-adolescents-social-pressure-coping-tool':  '/forms/fr/adolescents/social-pressure-coping-tool.pdf',
  'tf-adults-cbt-thought-record':                '/forms/fr/adults/cbt-thought-record.pdf',
  'tf-adults-behavioral-activation-plan':        '/forms/fr/adults/behavioral-activation-plan.pdf',
  'tf-adults-cognitive-distortions-worksheet':   '/forms/fr/adults/cognitive-distortions-worksheet.pdf',
  'tf-adults-values-and-goals-worksheet':        '/forms/fr/adults/values-and-goals-worksheet.pdf',
  'tf-adults-mood-tracking-sheet':               '/forms/fr/adults/mood-tracking-sheet.pdf',
  'tf-adults-weekly-coping-plan':                '/forms/fr/adults/weekly-coping-plan.pdf',
  'tf-older-adults-mood-reflection-sheet':       '/forms/fr/older_adults/mood-reflection-sheet.pdf',
  'tf-older-adults-sleep-routine-reflection':    '/forms/fr/older_adults/sleep-routine-reflection.pdf',
  'tf-older-adults-daily-coping-plan':           '/forms/fr/older_adults/daily-coping-plan.pdf',
  'tf-older-adults-caregiver-support-reflection':'/forms/fr/older_adults/caregiver-support-reflection.pdf',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('French integration — approved form count', () => {
  it('1. Exactly 18 forms are approved', () => {
    expect(APPROVED_FORMS.length).toBe(18);
  });
});

describe('French integration — registry language blocks', () => {
  it('2. Every approved form has an fr language block', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.fr,
        `Form ${form.id} is missing an fr language block`
      ).toBeDefined();
    }
  });

  it('3. Every French file_url starts with /forms/fr/', () => {
    for (const form of APPROVED_FORMS) {
      const frBlock = form.languages?.fr;
      expect(
        frBlock?.file_url,
        `Form ${form.id} fr.file_url should start with /forms/fr/`
      ).toMatch(/^\/forms\/fr\//);
    }
  });

  it('4. Every French block has rtl: false', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.fr?.rtl,
        `Form ${form.id} fr.rtl should be false`
      ).toBe(false);
    }
  });

  it('5. Every French block has a non-empty title', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.fr?.title === 'string' && form.languages.fr.title.trim().length > 0,
        `Form ${form.id} fr.title is empty`
      ).toBe(true);
    }
  });

  it('6. Every French block has a non-empty description', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.fr?.description === 'string' && form.languages.fr.description.trim().length > 0,
        `Form ${form.id} fr.description is empty`
      ).toBe(true);
    }
  });

  it('7. Every French block has a non-empty file_name', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.fr?.file_name === 'string' && form.languages.fr.file_name.trim().length > 0,
        `Form ${form.id} fr.file_name is empty`
      ).toBe(true);
    }
  });

  it('8. Every French block has file_type: pdf', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.fr?.file_type,
        `Form ${form.id} fr.file_type should be pdf`
      ).toBe('pdf');
    }
  });

  it('9. Each French file_url matches the expected path', () => {
    for (const form of APPROVED_FORMS) {
      const expected = EXPECTED_FRENCH_PATHS[form.id];
      expect(
        expected,
        `No expected path defined for form ${form.id}`
      ).toBeDefined();
      expect(
        form.languages?.fr?.file_url,
        `Form ${form.id} fr.file_url mismatch`
      ).toBe(expected);
    }
  });
});

describe('French integration — PDF files exist on disk', () => {
  for (const [formId, fileUrl] of Object.entries(EXPECTED_FRENCH_PATHS)) {
    const diskPath = resolvePublicPath(fileUrl);
    const label = fileUrl.replace('/forms/fr/', '');

    it(`10-exists [fr] ${label} exists on disk`, () => {
      expect(fs.existsSync(diskPath), `Missing: ${diskPath}`).toBe(true);
    });

    it(`11-size   [fr] ${label} is > 10 KB (not a stub)`, () => {
      const size = fs.statSync(diskPath).size;
      expect(size, `File too small (${size} bytes): ${diskPath}`).toBeGreaterThan(10_000);
    });
  }
});

describe('French integration — resolver returns French data', () => {
  it('12. Resolver returns French metadata for all 18 forms when lang=fr', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'fr');
      expect(resolved, `Form ${form.id} failed to resolve in French`).not.toBeNull();
      expect(resolved.language).toBe('fr');
      expect(resolved.languageData.rtl).toBe(false);
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/fr\//);
    }
  });

  it('13. Resolver French file_url matches expected path for each form', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'fr');
      const expected = EXPECTED_FRENCH_PATHS[form.id];
      expect(
        resolved?.languageData?.file_url,
        `Form ${form.id} resolved fr file_url mismatch`
      ).toBe(expected);
    }
  });

  it('14. Resolver French language code is "fr" for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'fr');
      expect(resolved?.language).toBe('fr');
    }
  });
});

describe('French integration — toGeneratedFileMetadata works for French', () => {
  it('15. toGeneratedFileMetadata returns valid shape for French resolved forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'fr');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `toGeneratedFileMetadata returned null for ${form.id} in fr`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.language).toBe('fr');
      expect(meta.url).toMatch(/^\/forms\/fr\//);
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(form.id);
    }
  });
});

describe('French integration — fallback behavior', () => {
  it('16. Unsupported language (it) still falls back to English for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'it');
      expect(resolved, `Form ${form.id} failed to resolve with it fallback`).not.toBeNull();
      expect(resolved.language).toBe('en');
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/en\//);
    }
  });

  it('17. Unsupported language (pt) still falls back to English for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'pt');
      expect(resolved, `Form ${form.id} failed to resolve with pt fallback`).not.toBeNull();
      expect(resolved.language).toBe('en');
    }
  });
});

describe('French integration — Hebrew blocks unchanged', () => {
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

describe('French integration — English blocks unchanged', () => {
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

describe('French integration — Spanish blocks unchanged', () => {
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

describe('French integration — AI mappings unchanged', () => {
  it('27. APPROVED_FORM_INTENT_MAP is defined and non-empty', () => {
    expect(APPROVED_FORM_INTENT_MAP).toBeDefined();
    expect(Object.keys(APPROVED_FORM_INTENT_MAP).length).toBeGreaterThan(0);
  });

  it('28. Every AI mapping intent resolves to an approved form', () => {
    for (const [intent, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const resolved = resolveFormWithLanguage(formId, 'en');
      expect(
        resolved,
        `AI intent "${intent}" maps to form "${formId}" which does not resolve`
      ).not.toBeNull();
    }
  });

  it('29. Every AI mapping intent still resolves in French after the update', () => {
    for (const [intent, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const resolved = resolveFormWithLanguage(formId, 'fr');
      expect(
        resolved,
        `AI intent "${intent}" maps to form "${formId}" which does not resolve in fr`
      ).not.toBeNull();
      expect(resolved.language).toBe('fr');
    }
  });
});

describe('French integration — no fake or missing URLs', () => {
  it('30. No French file_url contains placeholder wording', () => {
    const placeholderPatterns = ['placeholder', 'fake', 'todo', 'tbd', 'example.com', 'static.'];
    for (const form of APPROVED_FORMS) {
      const url = form.languages?.fr?.file_url ?? '';
      for (const pattern of placeholderPatterns) {
        expect(
          url.toLowerCase().includes(pattern),
          `Form ${form.id} fr.file_url contains placeholder: "${pattern}" in "${url}"`
        ).toBe(false);
      }
    }
  });

  it('31. All 18 French PDF paths are unique (no duplicates)', () => {
    const urls = APPROVED_FORMS.map((f) => f.languages?.fr?.file_url);
    const unique = new Set(urls);
    expect(unique.size).toBe(18);
  });
});

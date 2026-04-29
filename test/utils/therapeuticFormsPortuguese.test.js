/**
 * Tests for TherapeuticForms — Portuguese (pt) language integration.
 *
 * Verifies that all 18 approved forms have valid Portuguese language blocks
 * pointing to real PDF assets under public/forms/pt/.
 *
 * Requirements tested:
 *  1.  All 18 approved forms have a `pt` language block.
 *  2.  All 18 Portuguese file_url values start with /forms/pt/.
 *  3.  All 18 Portuguese PDF files exist on disk.
 *  4.  All 18 Portuguese blocks have rtl: false.
 *  5.  All 18 Portuguese blocks have non-empty title, description, file_name.
 *  6.  Resolver returns Portuguese metadata when language is "pt".
 *  7.  Resolver returns Portuguese file_url pointing to /forms/pt/ for all 18 forms.
 *  8.  Unsupported language (e.g. "zh") still falls back to English for all forms.
 *  9.  Hebrew blocks remain unchanged (rtl: true, /forms/he/ paths).
 * 10.  English blocks remain unchanged (rtl: false, /forms/en/ paths).
 * 11.  Spanish blocks remain unchanged (rtl: false, /forms/es/ paths).
 * 12.  French blocks remain unchanged (rtl: false, /forms/fr/ paths).
 * 13.  German blocks remain unchanged (rtl: false, /forms/de/ paths).
 * 14.  Approved form count remains exactly 18.
 * 15.  No placeholder or fake Portuguese URL can resolve.
 * 16.  AI mappings (APPROVED_FORM_INTENT_MAP) remain unchanged.
 * 17.  toGeneratedFileMetadata works for Portuguese resolved forms.
 * 18.  Portuguese PDF files are non-empty (> 10 KB).
 * 19.  Portuguese language code in resolved result is "pt".
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

// Expected Portuguese PDF paths keyed by form id
const EXPECTED_PORTUGUESE_PATHS = {
  'tf-children-feelings-checkin':                '/forms/pt/children/simple-feelings-check-in.pdf',
  'tf-children-grounding-exercise':              '/forms/pt/children/grounding-exercise.pdf',
  'tf-children-parent-guided-coping-card':       '/forms/pt/children/parent-guided-coping-card.pdf',
  'tf-children-box-breathing':                   '/forms/pt/children/box-breathing.pdf',
  'tf-adolescents-anxiety-thought-record':       '/forms/pt/adolescents/anxiety-thought-record.pdf',
  'tf-adolescents-emotion-regulation-worksheet': '/forms/pt/adolescents/emotion-regulation-worksheet.pdf',
  'tf-adolescents-weekly-practice-planner':      '/forms/pt/adolescents/weekly-practice-planner.pdf',
  'tf-adolescents-social-pressure-coping-tool':  '/forms/pt/adolescents/social-pressure-coping-tool.pdf',
  'tf-adults-cbt-thought-record':                '/forms/pt/adults/cbt-thought-record.pdf',
  'tf-adults-behavioral-activation-plan':        '/forms/pt/adults/behavioral-activation-plan.pdf',
  'tf-adults-cognitive-distortions-worksheet':   '/forms/pt/adults/cognitive-distortions-worksheet.pdf',
  'tf-adults-values-and-goals-worksheet':        '/forms/pt/adults/values-and-goals-worksheet.pdf',
  'tf-adults-mood-tracking-sheet':               '/forms/pt/adults/mood-tracking-sheet.pdf',
  'tf-adults-weekly-coping-plan':                '/forms/pt/adults/weekly-coping-plan.pdf',
  'tf-older-adults-mood-reflection-sheet':       '/forms/pt/older_adults/mood-reflection-sheet.pdf',
  'tf-older-adults-sleep-routine-reflection':    '/forms/pt/older_adults/sleep-routine-reflection.pdf',
  'tf-older-adults-daily-coping-plan':           '/forms/pt/older_adults/daily-coping-plan.pdf',
  'tf-older-adults-caregiver-support-reflection':'/forms/pt/older_adults/caregiver-support-reflection.pdf',
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Portuguese integration — approved form count', () => {
  it('1. Exactly 18 forms are approved', () => {
    expect(APPROVED_FORMS.length).toBe(18);
  });
});

describe('Portuguese integration — registry language blocks', () => {
  it('2. Every approved form has a pt language block', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.pt,
        `Form ${form.id} is missing a pt language block`
      ).toBeDefined();
    }
  });

  it('3. Every Portuguese file_url starts with /forms/pt/', () => {
    for (const form of APPROVED_FORMS) {
      const ptBlock = form.languages?.pt;
      expect(
        ptBlock?.file_url,
        `Form ${form.id} pt.file_url should start with /forms/pt/`
      ).toMatch(/^\/forms\/pt\//);
    }
  });

  it('4. Every Portuguese block has rtl: false', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.pt?.rtl,
        `Form ${form.id} pt.rtl should be false`
      ).toBe(false);
    }
  });

  it('5. Every Portuguese block has a non-empty title', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.pt?.title === 'string' && form.languages.pt.title.trim().length > 0,
        `Form ${form.id} pt.title is empty`
      ).toBe(true);
    }
  });

  it('6. Every Portuguese block has a non-empty description', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.pt?.description === 'string' && form.languages.pt.description.trim().length > 0,
        `Form ${form.id} pt.description is empty`
      ).toBe(true);
    }
  });

  it('7. Every Portuguese block has a non-empty file_name', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        typeof form.languages?.pt?.file_name === 'string' && form.languages.pt.file_name.trim().length > 0,
        `Form ${form.id} pt.file_name is empty`
      ).toBe(true);
    }
  });

  it('8. Every Portuguese block has file_type: pdf', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.pt?.file_type,
        `Form ${form.id} pt.file_type should be pdf`
      ).toBe('pdf');
    }
  });

  it('9. Each Portuguese file_url matches the expected path', () => {
    for (const form of APPROVED_FORMS) {
      const expected = EXPECTED_PORTUGUESE_PATHS[form.id];
      expect(
        expected,
        `No expected path defined for form ${form.id}`
      ).toBeDefined();
      expect(
        form.languages?.pt?.file_url,
        `Form ${form.id} pt.file_url mismatch`
      ).toBe(expected);
    }
  });
});

describe('Portuguese integration — PDF files exist on disk', () => {
  for (const [formId, fileUrl] of Object.entries(EXPECTED_PORTUGUESE_PATHS)) {
    const diskPath = resolvePublicPath(fileUrl);
    const label = fileUrl.replace('/forms/pt/', '');

    it(`10-exists [pt] ${label} exists on disk`, () => {
      expect(fs.existsSync(diskPath), `Missing: ${diskPath}`).toBe(true);
    });

    it(`11-size   [pt] ${label} is > 10 KB (not a stub)`, () => {
      const size = fs.statSync(diskPath).size;
      expect(size, `File too small (${size} bytes): ${diskPath}`).toBeGreaterThan(10_000);
    });
  }
});

describe('Portuguese integration — resolver returns Portuguese data', () => {
  it('12. Resolver returns Portuguese metadata for all 18 forms when lang=pt', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'pt');
      expect(resolved, `Form ${form.id} failed to resolve in Portuguese`).not.toBeNull();
      expect(resolved.language).toBe('pt');
      expect(resolved.languageData.rtl).toBe(false);
      expect(resolved.languageData.file_url).toMatch(/^\/forms\/pt\//);
    }
  });

  it('13. Resolver Portuguese file_url matches expected path for each form', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'pt');
      const expected = EXPECTED_PORTUGUESE_PATHS[form.id];
      expect(
        resolved?.languageData?.file_url,
        `Form ${form.id} resolved pt file_url mismatch`
      ).toBe(expected);
    }
  });

  it('14. Resolver Portuguese language code is "pt" for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'pt');
      expect(resolved?.language).toBe('pt');
    }
  });
});

describe('Portuguese integration — toGeneratedFileMetadata works for Portuguese', () => {
  it('15. toGeneratedFileMetadata returns valid shape for Portuguese resolved forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'pt');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `toGeneratedFileMetadata returned null for ${form.id} in pt`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.language).toBe('pt');
      expect(meta.url).toMatch(/^\/forms\/pt\//);
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(form.id);
    }
  });
});

describe('Portuguese integration — fallback behavior', () => {
  it('16. Unsupported language (zh) still falls back to English for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'zh');
      expect(resolved, `Form ${form.id} failed to resolve with zh fallback`).not.toBeNull();
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

describe('Portuguese integration — Hebrew blocks unchanged', () => {
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

describe('Portuguese integration — English blocks unchanged', () => {
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

describe('Portuguese integration — Spanish blocks unchanged', () => {
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

describe('Portuguese integration — French blocks unchanged', () => {
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

describe('Portuguese integration — German blocks unchanged', () => {
  it('30. German blocks still have rtl: false for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.de?.rtl,
        `Form ${form.id} de.rtl should be false`
      ).toBe(false);
    }
  });

  it('31. German file_url values still start with /forms/de/ for all 18 forms', () => {
    for (const form of APPROVED_FORMS) {
      expect(
        form.languages?.de?.file_url,
        `Form ${form.id} de.file_url should start with /forms/de/`
      ).toMatch(/^\/forms\/de\//);
    }
  });

  it('32. Resolver still returns German metadata when lang=de', () => {
    for (const form of APPROVED_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'de');
      expect(resolved, `Form ${form.id} failed to resolve in German`).not.toBeNull();
      expect(resolved.language).toBe('de');
      expect(resolved.languageData.rtl).toBe(false);
    }
  });
});

describe('Portuguese integration — AI mappings unchanged', () => {
  it('33. APPROVED_FORM_INTENT_MAP is defined and non-empty', () => {
    expect(APPROVED_FORM_INTENT_MAP).toBeDefined();
    expect(Object.keys(APPROVED_FORM_INTENT_MAP).length).toBeGreaterThan(0);
  });

  it('34. Every AI mapping intent resolves to an approved form', () => {
    for (const [intent, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const resolved = resolveFormWithLanguage(formId, 'en');
      expect(
        resolved,
        `AI intent "${intent}" maps to form "${formId}" which does not resolve`
      ).not.toBeNull();
    }
  });

  it('35. Every AI mapping intent still resolves in Portuguese after the update', () => {
    for (const [intent, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const resolved = resolveFormWithLanguage(formId, 'pt');
      expect(
        resolved,
        `AI intent "${intent}" maps to form "${formId}" which does not resolve in pt`
      ).not.toBeNull();
      expect(resolved.language).toBe('pt');
    }
  });
});

describe('Portuguese integration — no fake or missing URLs', () => {
  it('36. No Portuguese file_url contains placeholder wording', () => {
    const placeholderPatterns = ['placeholder', 'fake', 'todo', 'tbd', 'example.com', 'static.'];
    for (const form of APPROVED_FORMS) {
      const url = form.languages?.pt?.file_url ?? '';
      for (const pattern of placeholderPatterns) {
        expect(
          url.toLowerCase().includes(pattern),
          `Form ${form.id} pt.file_url contains placeholder: "${pattern}" in "${url}"`
        ).toBe(false);
      }
    }
  });

  it('37. All 18 Portuguese PDF paths are unique (no duplicates)', () => {
    const urls = APPROVED_FORMS.map((f) => f.languages?.pt?.file_url);
    const unique = new Set(urls);
    expect(unique.size).toBe(18);
  });
});

import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { ALL_FORMS, THERAPEUTIC_CATEGORIES } from '../../src/data/therapeuticForms/index.js';
import { resolveFormIntent } from '../../src/utils/resolveFormIntent.js';
import {
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE,
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01,
} from '../../src/data/therapeuticForms/forms.adolescents.cbt-specialized.he.js';

const ROOT = path.resolve(process.cwd());
const VALID_CATEGORIES = new Set(THERAPEUTIC_CATEGORIES.map((cat) => cat.value));

// Mirrors the individual_worksheet guard in TherapeuticForms.jsx getFilteredForms
function isShownInHebrewMode(form) {
  if (!form.languages?.he || form.approved !== true) return false;
  if (form.type !== 'individual_worksheet') return true;
  return form.language === 'he' && form.audience === 'adolescents' &&
    (form.category === 'adolescents_cbt_core' || form.category === 'adolescents_cbt_specialized');
}

function isShownInEnglishMode(form) {
  if (!form.languages?.en || form.approved !== true) return false;
  if (form.type !== 'individual_worksheet') return true;
  // individual_worksheet guard only allows Hebrew adolescents through
  return false;
}

// ─── Baseline sanity tests (kept from original file) ──────────────────────────

describe('therapeuticFormsAdolescentsCBTSpecialized.test.js — baseline', () => {
  it('keeps ALL_FORMS populated with at least the adolescents-cbt-core-en entry', () => {
    expect(ALL_FORMS.map((form) => form.id)).toContain('adolescents-cbt-core-en');
  });

  it('does not resolve stale therapeutic form ids', () => {
    expect(resolveFormIntent('tf-adults-cbt-thought-record', 'en')).toBeNull();
    expect(resolveFormIntent('tf-children-cbt-stage-2-2-premium-he', 'he')).toBeNull();
  });

  it('has active runtime /forms PDF URLs in catalog', () => {
    const activePdfUrls = ALL_FORMS
      .flatMap((form) => Object.values(form.languages || {}))
      .map((langBlock) => String(langBlock?.file_url || ''))
      .filter((url) => /\/forms\/.+\.pdf$/i.test(url));
    expect(activePdfUrls).toContain('/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf');
  });
});

// ─── Phase 10 — Hebrew adolescents CBT specialized module 01 tests ─────────────

describe('therapeuticFormsAdolescentsCBTSpecialized.test.js — module 01 Hebrew integration', () => {
  // Test 1: Registry exists
  it('Hebrew specialized registry exports non-empty array', () => {
    expect(Array.isArray(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE)).toBe(true);
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.length).toBeGreaterThan(0);
  });

  // Test 2: Current module contributes exactly 6 entries
  it('module 01 contributes exactly 6 Hebrew worksheet entries', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01).toHaveLength(6);

    const module01InAll = ALL_FORMS.filter(
      (form) =>
        form.category === 'adolescents_cbt_specialized' &&
        form.language === 'he' &&
        form.moduleCode === '01'
    );
    expect(module01InAll).toHaveLength(6);
  });

  // Test 3: Every fileUrl points to an existing PDF
  it('every module 01 fileUrl points to an existing PDF', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01) {
      const absolute = path.join(ROOT, 'public', form.fileUrl.replace(/^\//, ''));
      expect(fs.existsSync(absolute), `Missing PDF: ${form.fileUrl}`).toBe(true);
      const header = fs.readFileSync(absolute).subarray(0, 5).toString('utf8');
      expect(header, `Not a valid PDF: ${form.fileUrl}`).toBe('%PDF-');
    }
  });

  // Test 4: approved === true
  it('module 01 entries have approved: true', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01) {
      expect(form.approved).toBe(true);
    }
  });

  // Test 5: language === "he"
  it('module 01 entries have language: "he"', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01) {
      expect(form.language).toBe('he');
    }
  });

  // Test 6: languages.he.rtl === true
  it('module 01 entries have languages.he.rtl === true', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01) {
      expect(form.languages?.he?.rtl).toBe(true);
    }
  });

  // Test 7: audience compatible with adolescents filter
  it('module 01 entries have audience compatible with adolescents filter', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01) {
      expect(form.audience).toBe('adolescents');
    }
  });

  // Test 8: category/secondaryCategories compatible with Forms page filters
  it('module 01 entries have valid category and secondaryCategories', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01) {
      expect(VALID_CATEGORIES.has(form.category)).toBe(true);
      for (const secondary of form.secondaryCategories || []) {
        expect(VALID_CATEGORIES.has(secondary), `Invalid secondary: ${secondary}`).toBe(true);
      }
    }
  });

  // Test 9: TherapeuticForms page filter shows module 01 forms in Hebrew mode
  it('page-level filter shows module 01 forms in Hebrew mode', () => {
    const hebrewSpecialized = ALL_FORMS.filter(
      (form) =>
        form.category === 'adolescents_cbt_specialized' &&
        form.language === 'he' &&
        isShownInHebrewMode(form)
    );
    expect(hebrewSpecialized.length).toBeGreaterThan(0);
    expect(hebrewSpecialized.filter((f) => f.moduleCode === '01')).toHaveLength(6);
  });

  // Test 10: TherapeuticForms page filter hides module 01 forms in English mode
  it('page-level filter hides module 01 forms in English mode', () => {
    const module01Hebrew = ALL_FORMS.filter(
      (form) =>
        form.category === 'adolescents_cbt_specialized' &&
        form.language === 'he' &&
        form.moduleCode === '01' &&
        isShownInEnglishMode(form)
    );
    expect(module01Hebrew).toHaveLength(0);
  });

  // Test 11: TherapeuticForms page filter hides module 01 forms in other languages
  it('page-level filter hides module 01 forms for non-Hebrew languages', () => {
    for (const lang of ['es', 'pt', 'it', 'fr']) {
      const shown = ALL_FORMS.filter(
        (form) =>
          form.category === 'adolescents_cbt_specialized' &&
          form.language === 'he' &&
          form.moduleCode === '01' &&
          form.languages?.[lang]
      );
      expect(shown, `Should not appear in ${lang} mode`).toHaveLength(0);
    }
  });

  // Test 12: AI retrieval finds at least one form by direct form ID
  it('AI retrieval finds module 01 forms by direct form ID in Hebrew mode', () => {
    const firstForm = FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01[0];
    const resolved = resolveFormIntent(firstForm.id, 'he');
    expect(resolved).not.toBeNull();
    expect(resolved.language).toBe('he');
    expect(resolved.category).toBe('adolescents_cbt_specialized');
  });

  // Test 13: AI retrieval finds at least one form by clinical need (Hebrew keyword)
  it('AI retrieval finds a module 01 form by clinical need in Hebrew mode', () => {
    const result = resolveFormIntent('חרדה לחץ ופחדים מתבגרים', 'he');
    expect(result).not.toBeNull();
    expect(result.language).toBe('he');
    expect(result.audience).toBe('adolescents');
  });

  // Test 14: AI does not return this Hebrew module in English mode
  it('AI retrieval does not return module 01 Hebrew forms in English mode', () => {
    const firstForm = FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01[0];
    // Form has no languages.en block — must return null when requested in English
    const byId = resolveFormIntent(firstForm.id, 'en');
    expect(byId).toBeNull();

    // Hebrew clinical query in English mode — dynamic resolver targets 'en' forms only
    const byContent = resolveFormIntent('חרדה לחץ ופחדים', 'en');
    if (byContent !== null) {
      expect(byContent.language).not.toBe('he');
    }
  });

  // Test 17: No combined module-01 PDF registered
  it('no combined module-01 PDF is registered in the Hebrew specialized registry', () => {
    const combined = ALL_FORMS.filter(
      (form) =>
        form.category === 'adolescents_cbt_specialized' &&
        form.language === 'he' &&
        /combined|full.*module/i.test(`${form.id} ${form.slug} ${form.fileUrl}`)
    );
    expect(combined).toHaveLength(0);
  });

  // Test 18: No full-series PDF invented
  it('no invented full-series Hebrew specialized PDF is registered', () => {
    const fullSeries = ALL_FORMS.filter(
      (form) =>
        form.category === 'adolescents_cbt_specialized' &&
        form.language === 'he' &&
        /full.?series|60.?forms|workbook.?package/i.test(`${form.id} ${form.slug} ${String(form.fileUrl)}`)
    );
    expect(fullSeries).toHaveLength(0);
  });

  // Test 19: languages.he.file_url and fileUrl are consistent
  it('languages.he.file_url and fileUrl are consistent and point to valid PDFs', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE_MODULE_01) {
      expect(form.languages?.he?.file_url).toBe(form.fileUrl);
      expect(form.languages?.he?.file_type).toBe('pdf');
      const absolute = path.join(ROOT, 'public', form.fileUrl.replace(/^\//, ''));
      expect(fs.existsSync(absolute)).toBe(true);
    }
  });
});

// ─── Tests 15 & 16: Regression — existing series still intact ─────────────────

describe('therapeuticFormsAdolescentsCBTSpecialized.test.js — regression', () => {
  // Test 15: Existing English specialized tests still pass
  it('existing English adolescents_cbt_specialized entries are unchanged', () => {
    const enSpecialized = ALL_FORMS.filter(
      (form) => form.category === 'adolescents_cbt_specialized' && form.language === 'en'
    );
    // 1 workbook_package + 10 module_pdfs
    expect(enSpecialized).toHaveLength(11);
    expect(enSpecialized.filter((f) => f.type === 'workbook_package')).toHaveLength(1);
    expect(enSpecialized.filter((f) => f.type === 'module_pdf')).toHaveLength(10);
  });

  // Test 16: Existing Hebrew core tests still pass
  it('existing Hebrew adolescents core entries are unchanged (36 total)', () => {
    const heCore = ALL_FORMS.filter(
      (form) => form.audience === 'adolescents' && form.language === 'he' && form.category === 'adolescents_cbt_core'
    );
    expect(heCore).toHaveLength(36);
    expect(heCore.filter((f) => f.type === 'individual_worksheet')).toHaveLength(30);
    expect(heCore.filter((f) => f.type === 'stage_combined_pdf')).toHaveLength(6);
  });
});

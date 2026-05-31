import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ALL_FORMS, resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';
import { FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE } from '../../src/data/therapeuticForms/forms.adolescents.cbt-specialized.he.js';

const ROOT = path.resolve(process.cwd());

describe('therapeuticFormsAdolescentsCBTSpecialized.test.js — Hebrew adolescents CBT specialized modules 01-10', () => {

  // ── Registry structure ──────────────────────────────────────────────────

  it('registry exports exactly 60 individual worksheet entries', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE).toHaveLength(60);
  });

  it('each module contributes exactly 6 entries (modules 01-10)', () => {
    for (let m = 1; m <= 10; m++) {
      const count = FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.filter((f) => f.moduleNumber === m).length;
      expect(count, `module ${m} should have 6 entries`).toBe(6);
    }
  });

  it('modules 02-10 contribute exactly 54 entries', () => {
    const count = FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.filter((f) => f.moduleNumber >= 2).length;
    expect(count).toBe(54);
  });

  it('all entries are approved', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => f.approved === true)).toBe(true);
  });

  it('all entries have language: "he"', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => f.language === 'he')).toBe(true);
  });

  it('all entries have type: "individual_worksheet"', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => f.type === 'individual_worksheet')).toBe(true);
  });

  it('all entries have audience: "adolescents"', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => f.audience === 'adolescents')).toBe(true);
  });

  it('all entries have category: "adolescents_cbt_specialized"', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => f.category === 'adolescents_cbt_specialized')).toBe(true);
  });

  it('all entries have languages.he.rtl === true', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => f.languages?.he?.rtl === true)).toBe(true);
  });

  it('all entries have languages.he.file_type: "pdf"', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => f.languages?.he?.file_type === 'pdf')).toBe(true);
  });

  it('all entries have a valid languages.he.file_url', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => {
      const url = f.languages?.he?.file_url;
      return typeof url === 'string' && url.startsWith('/forms/') && url.endsWith('.pdf');
    })).toBe(true);
  });

  it('all entry fileUrls point to existing PDFs on disk', () => {
    const missing = FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE
      .map((f) => {
        const url = f.languages?.he?.file_url || f.fileUrl;
        return { id: f.id, url, absPath: path.join(ROOT, 'public', url) };
      })
      .filter(({ absPath }) => !fs.existsSync(absPath));
    expect(missing).toHaveLength(0);
  });

  it('no duplicate entry IDs', () => {
    const ids = FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.map((f) => f.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('no combined module PDFs registered (all URLs are individual worksheet files)', () => {
    // Individual worksheet files follow the pattern _he_MM_N.pdf (module + worksheet index)
    // Combined/module-level files would lack a worksheet index (e.g. _he_01.pdf or _combined.pdf)
    const nonIndividual = FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.filter((f) => {
      const url = f.fileUrl || f.languages?.he?.file_url || '';
      // Valid individual: ends with _he_MM_NN.pdf or _he_MM_N.pdf (two numeric segments after _he_)
      return !/_he_\d{2}_\d+\.pdf$/.test(url);
    });
    expect(nonIndividual).toHaveLength(0);
  });

  it('variant metadata fields are populated', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => f.variant_language === 'he')).toBe(true);
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => f.source_language === 'en')).toBe(true);
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => f.is_language_variant === true)).toBe(true);
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.every((f) => Array.isArray(f.available_languages))).toBe(true);
  });

  // ── Generated index integration ─────────────────────────────────────────

  it('generated index contains 60 Hebrew specialized individual worksheet entries', () => {
    const count = ALL_FORMS.filter(
      (f) => f.language === 'he' && f.category === 'adolescents_cbt_specialized' && f.type === 'individual_worksheet'
    ).length;
    expect(count).toBe(60);
  });

  it('generated index Hebrew specialized entries all have approved: true', () => {
    const entries = ALL_FORMS.filter(
      (f) => f.language === 'he' && f.category === 'adolescents_cbt_specialized'
    );
    expect(entries.every((f) => f.approved === true)).toBe(true);
  });

  it('generated index Hebrew specialized entries all have rtl: true', () => {
    const entries = ALL_FORMS.filter(
      (f) => f.language === 'he' && f.category === 'adolescents_cbt_specialized'
    );
    expect(entries.every((f) => f.languages?.he?.rtl === true)).toBe(true);
  });

  it('existing Hebrew core entries are unchanged (36 entries)', () => {
    const core = ALL_FORMS.filter((f) => f.language === 'he' && f.category === 'adolescents_cbt_core');
    expect(core.length).toBe(36);
  });

  // ── Forms library visibility (tested via TherapeuticForms.jsx source) ───

  it('TherapeuticForms page source includes adolescents_cbt_specialized in individual_worksheet filter', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    expect(pageSource).toContain("form.category === 'adolescents_cbt_specialized'");
  });

  it('TherapeuticForms page shows Hebrew specialized forms only when lang === "he" (source check)', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    expect(pageSource).toContain("normalizedLang === 'he' && form.language === 'he' && form.audience === 'adolescents'");
  });

  it('Hebrew specialized forms resolved in Hebrew mode, not in English mode', () => {
    const heEntries = ALL_FORMS.filter(
      (f) => f.language === 'he' && f.category === 'adolescents_cbt_specialized'
    );
    // Should be resolvable in Hebrew
    const resolvedHe = heEntries.filter((f) => resolveFormWithLanguage(f.id, 'he'));
    expect(resolvedHe.length).toBe(60);
    // Should NOT be resolvable in English
    const resolvedEn = heEntries.filter((f) => resolveFormWithLanguage(f.id, 'en'));
    expect(resolvedEn.length).toBe(0);
  });

  it('Hebrew specialized forms not resolvable in Spanish mode', () => {
    const heEntries = ALL_FORMS.filter(
      (f) => f.language === 'he' && f.category === 'adolescents_cbt_specialized'
    );
    const resolvedEs = heEntries.filter((f) => resolveFormWithLanguage(f.id, 'es'));
    expect(resolvedEs.length).toBe(0);
  });

  // ── AI retrieval ────────────────────────────────────────────────────────

  it('existing English specialized entries still exist (no regression)', () => {
    const enSpecialized = ALL_FORMS.filter(
      (f) => f.language === 'en' && f.category === 'adolescents_cbt_specialized'
    );
    expect(enSpecialized.length).toBeGreaterThan(0);
  });

  it('module 01 entries are present and unbroken', () => {
    const m01 = FORMS_ADOLESCENTS_CBT_SPECIALIZED_HE.filter((f) => f.moduleNumber === 1);
    expect(m01).toHaveLength(6);
    expect(m01.every((f) => f.language === 'he')).toBe(true);
    expect(m01.every((f) => f.languages?.he?.rtl === true)).toBe(true);
  });
});

import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';

const SPECIALIZED_SERIES_ID = 'adolescents-cbt-specialized-en';
const MODULE_CODES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

describe('therapeuticFormsAICatalog.test.js', () => {
  it('builds therapist catalog with installed adolescents core + specialized packages and therapeutic metadata', () => {
    expect(ALL_FORMS.map((form) => form.id)).toContain('adolescents-cbt-core-en');
    expect(ALL_FORMS.map((form) => form.id)).toContain(SPECIALIZED_SERIES_ID);
    const catalog = buildTherapistFormCatalog(ALL_FORMS);

    expect(catalog).toContain('[FORM:adolescents-cbt-core-en]');
    expect(catalog).toContain('Adolescents CBT Core Series');
    expect(catalog).toContain(`[FORM:${SPECIALIZED_SERIES_ID}]`);
    expect(catalog).toContain('Adolescents CBT Specialized Series');
    expect(catalog).toContain('Goal:');
    expect(catalog).toContain('When to use:');
    expect(catalog).toContain('Clinical keywords:');
    expect(catalog).toContain('Intent phrases:');
    expect(catalog).toContain('Not for:');
    expect(catalog).not.toContain('no therapeutic forms are currently installed/available');
  });

  // ─── Production build: all 10 module form IDs appear in catalog ──────────────
  // This test verifies that the static AI catalog (computed at module load time,
  // equivalent to THERAPIST_FORM_LIBRARY_INSTRUCTIONS in production) exposes
  // every individual module PDF — not just the series-level form.
  // A passing test here proves the production bundle includes all module entries.

  it('production catalog includes all 10 specialized EN module form IDs', () => {
    const catalog = buildTherapistFormCatalog(ALL_FORMS);
    for (const code of MODULE_CODES) {
      const moduleId = `${SPECIALIZED_SERIES_ID}-module-${code}`;
      expect(ALL_FORMS.map((f) => f.id)).toContain(moduleId);
      expect(catalog).toContain(`[FORM:${moduleId}]`);
    }
  });

  it('production catalog includes clinical keywords for each specialized EN module', () => {
    const catalog = buildTherapistFormCatalog(ALL_FORMS);
    // Spot-check representative keywords from several modules to confirm
    // content-rich metadata is present in the AI-facing catalog text.
    const expectedKeywords = [
      'anxiety',        // module 01
      'low mood',       // module 02
      'self-criticism', // module 03
      'friendship',     // module 04
      'anger',          // module 05
      'ocd',            // module 06
      'adhd',           // module 07
      'sleep',          // module 08
      'grounding',      // module 09
      'parents',        // module 10
    ];
    for (const keyword of expectedKeywords) {
      expect(catalog.toLowerCase()).toContain(keyword);
    }
  });

  it('production catalog carries Not-for restriction for non-English locale sessions on specialized forms', () => {
    const catalog = buildTherapistFormCatalog(ALL_FORMS);
    // Every specialized EN form has "non-English locale sessions" in its notFor array.
    // This surfaces in the catalog so the AI knows not to suggest these forms in
    // non-English sessions (enforcement is at the resolver level too).
    expect(catalog).toContain('non-English locale sessions');
  });

  it('production catalog does not include specialized forms when ALL_FORMS is empty', () => {
    const emptyCatalog = buildTherapistFormCatalog([]);
    expect(emptyCatalog).toContain('no therapeutic forms are currently installed/available');
    expect(emptyCatalog).not.toContain(SPECIALIZED_SERIES_ID);
  });

  it('all 11 specialized EN entries (1 package + 10 modules) appear in ALL_FORMS', () => {
    const specializedIds = ALL_FORMS
      .filter((f) => f.category === 'adolescents_cbt_specialized' && f.language === 'en')
      .map((f) => f.id);
    // 1 workbook_package + 10 module_pdf entries
    expect(specializedIds).toHaveLength(11);
    expect(specializedIds).toContain(SPECIALIZED_SERIES_ID);
    for (const code of MODULE_CODES) {
      expect(specializedIds).toContain(`${SPECIALIZED_SERIES_ID}-module-${code}`);
    }
  });

  it('includes children specialized EN forms with rich metadata in therapist catalog', () => {
    const catalog = buildTherapistFormCatalog(ALL_FORMS);
    const childrenSpecialized = ALL_FORMS.filter(
      (form) =>
        form.audience === 'children' &&
        form.language === 'en' &&
        form.category === 'children_cbt_specialized'
    );

    expect(childrenSpecialized.length).toBe(165);
    expect(childrenSpecialized.filter((form) => form.type === 'module_pdf')).toHaveLength(15);
    expect(childrenSpecialized.filter((form) => form.type === 'individual_worksheet')).toHaveLength(150);

    expect(catalog).toContain('[FORM:children-cbt-specialized-en-module-1-1]');
    expect(catalog).toContain('[FORM:children-cbt-specialized-en-module-4-2]');
    expect(catalog).toContain('[FORM:children-cbt-specialized-en-module-5-3]');
    expect(catalog.toLowerCase()).toContain('trauma-sensitive coping');
    expect(catalog.toLowerCase()).toContain('enuresis stress support');
  });
});

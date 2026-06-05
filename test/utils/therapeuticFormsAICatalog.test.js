import { describe, it, expect } from 'vitest';
import { ALL_FORMS, searchFormsForAI, resolveFormForAIRequest } from '../../src/data/therapeuticForms/index.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';

const SPECIALIZED_SERIES_ID = 'adolescents-cbt-specialized-en';
const MODULE_CODES = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10'];

describe('therapeuticFormsAICatalog.test.js', () => {
  // ─── Compact catalog format ───────────────────────────────────────────────
  // buildTherapistFormCatalog now emits a compact availability summary rather than
  // per-form listings, to keep the Base44 bridge payload within size limits.
  // Individual form IDs are injected at request-time via [FORM_ROUTER_CONTEXT].

  it('builds compact availability summary (not per-form listings) to prevent oversized payloads', () => {
    const catalog = buildTherapistFormCatalog(ALL_FORMS);

    // Must contain compact summary elements
    expect(catalog).toContain('THERAPEUTIC FORMS CATALOG');
    expect(catalog).toContain('approved forms available');
    expect(catalog).toContain('By audience');
    expect(catalog).toContain('By language');
    expect(catalog).toContain('[FORM_ROUTER_CONTEXT]');
    expect(catalog).toContain('Do NOT invent form IDs');

    // Must NOT dump per-form listings (payload size guard)
    expect(catalog).not.toContain('[FORM:adolescents-cbt-core-en]');
    expect(catalog).not.toContain('Goal:');
    expect(catalog).not.toContain('When to use:');
    expect(catalog).not.toContain('Clinical keywords:');
    expect(catalog).not.toContain('Intent phrases:');
    expect(catalog).not.toContain('Not for:');

    // Compact catalog must be well under 2KB regardless of registry size
    expect(catalog.length).toBeLessThan(2000);

    expect(catalog).not.toContain('no therapeutic forms are currently installed/available');
  });

  it('compact catalog size does not grow with the number of registered forms', () => {
    const catalogFull = buildTherapistFormCatalog(ALL_FORMS);
    // Even with 493 forms, the catalog stays compact
    expect(catalogFull.length).toBeLessThan(2000);
  });

  it('all approved adolescents core + specialized package ids ARE in ALL_FORMS registry', () => {
    const ids = ALL_FORMS.map((form) => form.id);
    expect(ids).toContain('adolescents-cbt-core-en');
    expect(ids).toContain(SPECIALIZED_SERIES_ID);
  });

  // ─── Production registry: all 10 module form IDs appear in ALL_FORMS ────────
  it('production registry includes all 10 specialized EN module form IDs', () => {
    const registryIds = ALL_FORMS.map((f) => f.id);
    for (const code of MODULE_CODES) {
      const moduleId = `${SPECIALIZED_SERIES_ID}-module-${code}`;
      expect(registryIds).toContain(moduleId);
    }
  });

  it('production registry carries clinical keywords for each specialized EN module', () => {
    // Spot-check representative keywords are present in ALL_FORMS metadata
    const specializedForms = ALL_FORMS.filter(
      (f) => f.category === 'adolescents_cbt_specialized' && f.language === 'en'
    );
    const allKeywords = specializedForms.flatMap((f) =>
      Array.isArray(f.clinicalKeywords) ? f.clinicalKeywords : (Array.isArray(f.keywords) ? f.keywords : [])
    ).map((k) => String(k).toLowerCase());

    const expectedKeywords = ['anxiety', 'anger', 'ocd', 'adhd', 'sleep'];
    for (const keyword of expectedKeywords) {
      const found = allKeywords.some((k) => k.includes(keyword));
      expect(found, `keyword "${keyword}" missing from specialized EN form metadata`).toBe(true);
    }
  });

  it('production registry carries Not-for restriction for non-English locale sessions on specialized forms', () => {
    // The notFor safety note must exist in the form metadata (enforcement is at resolver level)
    const specializedForms = ALL_FORMS.filter(
      (f) => f.category === 'adolescents_cbt_specialized' && f.language === 'en' && f.approved === true
    );
    const notForTexts = specializedForms.flatMap((f) => Array.isArray(f.notFor) ? f.notFor : []).join(' ');
    expect(notForTexts).toContain('non-English locale sessions');
  });

  it('compact catalog for empty forms list says no forms available', () => {
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

  it('children specialized EN forms exist in ALL_FORMS registry with rich metadata', () => {
    const childrenSpecialized = ALL_FORMS.filter(
      (form) =>
        form.audience === 'children' &&
        form.language === 'en' &&
        form.category === 'children_cbt_specialized'
    );

    expect(childrenSpecialized.length).toBe(165);
    expect(childrenSpecialized.filter((form) => form.type === 'module_pdf')).toHaveLength(15);
    expect(childrenSpecialized.filter((form) => form.type === 'individual_worksheet')).toHaveLength(150);

    const ids = childrenSpecialized.map((f) => f.id);
    expect(ids).toContain('children-cbt-specialized-en-module-1-1');
    expect(ids).toContain('children-cbt-specialized-en-module-4-2');
    expect(ids).toContain('children-cbt-specialized-en-module-5-3');

    // Clinical metadata is in the registry (not the catalog text)
    const allText = childrenSpecialized
      .flatMap((f) => [f.title, f.description, ...(Array.isArray(f.clinicalKeywords) ? f.clinicalKeywords : [])])
      .join(' ')
      .toLowerCase();
    expect(allText).toMatch(/trauma|coping/);
  });

  it('forms remain searchable by clinical content after catalog compaction', () => {
    // Verify the local search layer (used by FORM_ROUTER_CONTEXT injection) still works
    const anxietyResults = searchFormsForAI('anxiety children', { language: 'en', audience: 'children' });
    expect(anxietyResults.length).toBeGreaterThan(0);

    const route = resolveFormForAIRequest('send me a form for child anxiety', { language: 'en' });
    expect(route.intent).not.toBeNull();
    expect(route.matches.length + route.nearestMatches.length).toBeGreaterThan(0);
  });
});

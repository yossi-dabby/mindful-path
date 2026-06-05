import { describe, it, expect } from 'vitest';
import { ALL_FORMS, searchFormsForAI } from '../../src/data/therapeuticForms/index.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';

describe('therapeuticFormsCanonicalCatalogIntegration.test.js', () => {
  it('exposes canonical adolescents core + specialized package ids in ALL_FORMS registry', () => {
    // Form IDs live in ALL_FORMS registry, NOT in the compact catalog text.
    // The compact catalog prevents "Message content is too long" by not listing individual forms.
    const ids = ALL_FORMS.map((f) => f.id);
    expect(ids).toContain('adolescents-cbt-core-en');
    expect(ids).toContain('adolescents-cbt-specialized-en');

    // Registry forms have correct metadata for search routing
    const coreForm = ALL_FORMS.find((f) => f.id === 'adolescents-cbt-core-en');
    expect(coreForm?.approved).toBe(true);
    expect(coreForm?.category).toBe('adolescents_cbt_core');

    const specializedForm = ALL_FORMS.find((f) => f.id === 'adolescents-cbt-specialized-en');
    expect(specializedForm?.approved).toBe(true);
    expect(specializedForm?.category).toBe('adolescents_cbt_specialized');

    // compact catalog summary (no per-form listings)
    const catalog = buildTherapistFormCatalog(ALL_FORMS);
    expect(catalog).toContain('approved forms available');
    expect(catalog).not.toMatch(/tf-[a-z0-9-]+/i);
    // Availability count is accurate
    expect(catalog).toMatch(/\d+ approved forms available/);
  });
});

import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';

describe('therapeuticFormsCanonicalCatalogIntegration.test.js', () => {
  it('exposes canonical adolescents core + specialized package ids in active catalog text', () => {
    const catalog = buildTherapistFormCatalog(ALL_FORMS);
    expect(catalog).toContain('[FORM:adolescents-cbt-core-en]');
    expect(catalog).toContain('Adolescents CBT Core Series');
    expect(catalog).toContain('[FORM:adolescents-cbt-specialized-en]');
    expect(catalog).toContain('Adolescents CBT Specialized Series');
    expect(catalog).not.toMatch(/tf-[a-z0-9-]+/i);
    expect(catalog).toContain('adolescents_cbt_core');
    expect(catalog).toContain('adolescents_cbt_specialized');
  });
});

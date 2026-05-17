import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';

describe('therapeuticFormsAICatalog.test.js', () => {
  it('builds therapist catalog with the installed adolescents CBT core package and therapeutic metadata', () => {
    expect(ALL_FORMS.map((form) => form.id)).toContain('adolescents-cbt-core-en');
    const catalog = buildTherapistFormCatalog(ALL_FORMS);

    expect(catalog).toContain('[FORM:adolescents-cbt-core-en]');
    expect(catalog).toContain('Adolescents CBT Core Series');
    expect(catalog).toContain('Goal:');
    expect(catalog).toContain('When to use:');
    expect(catalog).toContain('Clinical keywords:');
    expect(catalog).toContain('Intent phrases:');
    expect(catalog).toContain('Not for:');
    expect(catalog).not.toContain('no therapeutic forms are currently installed/available');
  });
});

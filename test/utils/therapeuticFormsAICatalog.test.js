import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';

describe('therapeuticFormsAICatalog.test.js — zero installed forms', () => {
  it('builds explicit no-forms catalog text when runtime catalog is empty', () => {
    expect(ALL_FORMS).toEqual([]);
    const catalog = buildTherapistFormCatalog(ALL_FORMS);
    expect(catalog).toContain('no therapeutic forms are currently installed/available');
    expect(catalog).not.toContain('[FORM:tf-');
  });
});

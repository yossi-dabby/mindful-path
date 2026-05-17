import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';

describe('therapeuticFormsCanonicalCatalogIntegration.test.js — zero installed forms', () => {
  it('does not expose stale ids or /forms URLs in active catalog text', () => {
    const catalog = buildTherapistFormCatalog(ALL_FORMS);
    expect(catalog).toContain('no therapeutic forms are currently installed/available');
    expect(catalog).not.toMatch(/tf-[a-z0-9-]+/i);
    expect(catalog).not.toContain('/forms/');
  });
});

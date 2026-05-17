import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { resolveFormIntent } from '../../src/utils/resolveFormIntent.js';

describe('therapeuticFormsSpanish.test.js — zero installed forms', () => {
  it('keeps ALL_FORMS empty', () => {
    expect(ALL_FORMS).toEqual([]);
  });

  it('does not resolve stale therapeutic form ids', () => {
    expect(resolveFormIntent('tf-adults-cbt-thought-record', 'en')).toBeNull();
    expect(resolveFormIntent('tf-children-cbt-stage-2-2-premium-he', 'he')).toBeNull();
  });

  it('has no active runtime /forms PDF URLs in catalog', () => {
    const activePdfUrls = ALL_FORMS
      .flatMap((form) => Object.values(form.languages || {}))
      .map((langBlock) => String(langBlock?.file_url || ''))
      .filter((url) => /\/forms\/.+\.pdf$/i.test(url));
    expect(activePdfUrls).toEqual([]);
  });
});

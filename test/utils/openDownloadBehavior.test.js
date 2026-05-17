import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';

describe('openDownloadBehavior.test.js', () => {
  it('keeps runtime form catalog on the canonical adolescents package', () => {
    expect(ALL_FORMS.map((form) => form.id)).toEqual(['adolescents-cbt-core-en']);
  });

  it('resolves only the active adolescents package for open/download actions', () => {
    const resolved = resolveFormWithLanguage('adolescents-cbt-core-en', 'en');
    expect(resolved?.languageData?.file_url).toBe('/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf');
    expect(resolveFormWithLanguage('adolescents-cbt-core-en', 'he')).toBeNull();
    expect(resolveFormWithLanguage('tf-adults-cbt-thought-record', 'en')).toBeNull();
  });
});

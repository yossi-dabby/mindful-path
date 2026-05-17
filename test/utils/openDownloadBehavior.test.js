import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';

describe('openDownloadBehavior.test.js — zero installed forms', () => {
  it('keeps runtime form catalog empty', () => {
    expect(ALL_FORMS).toEqual([]);
  });

  it('cannot resolve old forms for open/download actions', () => {
    expect(resolveFormWithLanguage('tf-adults-cbt-thought-record', 'en')).toBeNull();
  });
});

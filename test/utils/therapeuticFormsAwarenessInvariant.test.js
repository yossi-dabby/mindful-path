import { describe, it, expect } from 'vitest';

import generatedFormsIndex from '../../src/generated/therapeutic-forms-index.json';
import {
  listFormsForAI,
  searchFormsForAI,
  resolveFormForAIRequest,
} from '../../src/data/therapeuticForms/index.js';
import { normalizeSessionLanguage } from '../../src/components/utils/validateAgentOutput.jsx';

function approvedByLanguage(language) {
  return generatedFormsIndex.filter((form) => form?.approved === true && form?.language === language);
}

function getSearchTitle(form, language) {
  return form?.languages?.[language]?.title || form?.title || form?.slug || form?.id;
}

describe('therapeutic forms awareness invariant', () => {
  it('keeps AI list counts equal to approved generated-index counts per language', () => {
    for (const language of ['en', 'he']) {
      const approved = approvedByLanguage(language);
      const aiList = listFormsForAI({ language, allowEnglishFallback: false });
      expect(aiList).toHaveLength(approved.length);
      expect(new Set(aiList.map((form) => form.id))).toEqual(new Set(approved.map((form) => form.id)));
    }
  });

  it('makes every approved Hebrew form searchable by title or slug', () => {
    for (const form of approvedByLanguage('he')) {
      const titleQuery = getSearchTitle(form, 'he');
      const titleMatches = searchFormsForAI(titleQuery, { language: 'he', allowEnglishFallback: false });
      const slugMatches = form?.slug
        ? searchFormsForAI(form.slug, { language: 'he', allowEnglishFallback: false })
        : [];
      expect(
        titleMatches.some((match) => match.id === form.id) ||
        slugMatches.some((match) => match.id === form.id),
        `Expected searchable Hebrew form: ${form.id}`
      ).toBe(true);
    }
  });

  it('makes every approved Hebrew form with metadata searchable by at least one metadata phrase', () => {
    const formsWithMetadata = approvedByLanguage('he').filter((form) =>
      (Array.isArray(form?.clinicalKeywords) && form.clinicalKeywords.length > 0) ||
      (Array.isArray(form?.intentPhrases) && form.intentPhrases.length > 0)
    );

    for (const form of formsWithMetadata) {
      const probe =
        form?.clinicalKeywords?.[0] ||
        form?.intentPhrases?.[0];
      const matches = searchFormsForAI(probe, { language: 'he', allowEnglishFallback: false });
      expect(matches.some((match) => match.id === form.id), `Expected metadata-searchable Hebrew form: ${form.id}`).toBe(true);
    }
  });

  it('keeps Hebrew specialized/core collections searchable in Hebrew', () => {
    const categories = [
      'children_cbt_specialized',
      'adolescents_cbt_specialized',
      'children_cbt_core',
    ];

    for (const category of categories) {
      const scopedForms = approvedByLanguage('he').filter((form) => form.category === category);
      expect(scopedForms.length).toBeGreaterThan(0);
      for (const form of scopedForms.slice(0, 10)) {
        const matches = searchFormsForAI(getSearchTitle(form, 'he'), { language: 'he', category, allowEnglishFallback: false });
        expect(matches.some((match) => match.id === form.id), `Expected searchable Hebrew category form: ${form.id}`).toBe(true);
      }
    }
  });

  it('keeps English forms searchable in English', () => {
    for (const form of approvedByLanguage('en').slice(0, 40)) {
      const matches = searchFormsForAI(getSearchTitle(form, 'en'), { language: 'en', allowEnglishFallback: false });
      expect(matches.some((match) => match.id === form.id), `Expected searchable English form: ${form.id}`).toBe(true);
    }
  });

  it('normalizes preview and production language variants consistently', () => {
    expect(normalizeSessionLanguage('he-IL')).toBe('he');
    expect(normalizeSessionLanguage('hebrew')).toBe('he');
    expect(normalizeSessionLanguage('en-US')).toBe('en');
    expect(resolveFormForAIRequest('שלח לי טופס לילד עם חרדה בעברית', { language: 'he-IL' }).generatedFile?.language).toBe('he');
    expect(resolveFormForAIRequest('Send me a form for child anxiety in English', { language: 'en-US' }).generatedFile?.language).toBe('en');
  });
});

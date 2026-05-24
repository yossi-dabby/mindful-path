import { describe, it, expect } from 'vitest';
import generatedFormsIndex from '../../src/generated/therapeutic-forms-index.json';
import {
  getAllTherapeuticForms,
  getFormsByLanguage,
  getFormsByAudience,
  getFormsByCategory,
  getFormsBySubcategory,
  getFormsByClinicalGroup,
  searchFormsForAI,
  resolveFormForAIRequest,
  listAvailableFormCategories,
  listAvailableFormsForAI,
  createGeneratedFileFromResolvedForm,
} from '../../src/data/therapeuticForms/index.js';

describe('therapeutic forms global registry-driven access', () => {
  it('exposes non-empty canonical registry and matches generated index count', () => {
    const forms = getAllTherapeuticForms();
    expect(forms.length).toBeGreaterThan(0);
    expect(forms.length).toBe(generatedFormsIndex.length);
  });

  it('filters forms by language, audience, category, subcategory, and clinical group', () => {
    const english = getFormsByLanguage('en');
    const children = getFormsByAudience('children');
    const category = getFormsByCategory('children_cbt_specialized');
    const subcategory = getFormsBySubcategory('1.1');
    const clinical = getFormsByClinicalGroup('sleep');

    expect(english.length).toBeGreaterThan(0);
    expect(english.every((form) => form.language === 'en')).toBe(true);
    expect(children.length).toBeGreaterThan(0);
    expect(children.every((form) => form.audience === 'children')).toBe(true);
    expect(category.length).toBeGreaterThan(0);
    expect(category.every((form) => form.category === 'children_cbt_specialized')).toBe(true);
    expect(subcategory.length).toBeGreaterThan(0);
    expect(clinical.length).toBeGreaterThan(0);
  });

  it('searches and lists forms for AI using deterministic registry filters', () => {
    const filtered = listAvailableFormsForAI({ language: 'en', audience: 'children' });
    const grouped = listAvailableFormCategories({ language: 'en', audience: 'children' });
    const searchResults = searchFormsForAI('child anger outbursts worksheet', {
      language: 'en',
      audience: 'children',
      limit: 5,
    });

    expect(filtered.length).toBeGreaterThan(0);
    expect(grouped.length).toBeGreaterThan(0);
    expect(searchResults.length).toBeGreaterThan(0);
    expect(searchResults[0].audience).toBe('children');
    expect(searchResults[0].language).toBe('en');
  });

  it('resolves AI requests and creates generated-file metadata with open/download fields', () => {
    const resolved = resolveFormForAIRequest('Send me a child worksheet for sleep worries', {
      sessionLanguage: 'en',
      audience: 'children',
    });
    expect(resolved.form).not.toBeNull();

    const generated = createGeneratedFileFromResolvedForm(resolved.form);
    expect(generated).not.toBeNull();
    expect(generated.type).toBe('pdf');
    expect(generated.mime_type).toBe('application/pdf');
    expect(generated.form_id).toBeTruthy();
    expect(generated.filename).toBeTruthy();
    expect(String(generated.url || '')).toContain('/forms/');
    expect(String(generated.file_path || '')).toContain('public/forms/');
    expect(String(generated.open_url || '')).toContain('/pdf-viewer?file=');
    expect(String(generated.download_url || '')).toContain('download=1');
    expect(generated.audience).toBe('children');
    expect(generated.language).toBe('en');
    expect(generated.category).toBeTruthy();
  });
});


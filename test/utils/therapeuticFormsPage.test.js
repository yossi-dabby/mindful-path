import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ALL_FORMS, resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';

const ROOT = path.resolve(process.cwd());

describe('therapeuticFormsPage.test.js — adolescents package integration', () => {
  it('keeps route and page registration intact', () => {
    const pagesConfigSource = fs.readFileSync(path.join(ROOT, 'src/pages.config.js'), 'utf8');
    expect(pagesConfigSource).toContain('"TherapeuticForms": TherapeuticForms');
  });

  it('keeps Home quick action pointing to TherapeuticForms', () => {
    const quickActionsSource = fs.readFileSync(path.join(ROOT, 'src/components/home/QuickActions.jsx'), 'utf8');
    expect(quickActionsSource).toContain("page: 'TherapeuticForms'");
  });

  it('includes page filtering logic for secondary categories and audience-aware language paths', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    expect(pageSource).toContain('secondaryCategories');
    expect(pageSource).toContain("fileUrl.trim().startsWith('/forms/')");
    expect(pageSource).toContain('logical_form_id || form?.variant_group_id || form?.id');
    expect(pageSource).toContain('dedupeKey');

    expect(ALL_FORMS.map((form) => form.id)).toContain('adolescents-cbt-core-en');
    const resolvedEn = resolveFormWithLanguage('adolescents-cbt-core-en', 'en');
    expect(resolvedEn?.languageData?.file_url).toBe('/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf');
  });

  it('does not resolve package in Hebrew or non-installed audiences', () => {
    expect(resolveFormWithLanguage('adolescents-cbt-core-en', 'he')).toBeNull();
  });

  it('resolves Hebrew adolescents core entries only in Hebrew mode', () => {
    const hebrewIndividual = resolveFormWithLanguage('adolescents-cbt-core-he-3-1', 'he');
    const hebrewStageCombined = resolveFormWithLanguage('adolescents-cbt-core-he-stage-3-combined', 'he');
    expect(hebrewIndividual?.languageData?.rtl).toBe(true);
    expect(hebrewIndividual?.languageData?.file_url).toContain('/forms/adolescents_cbt_core_he_series_3/');
    expect(hebrewStageCombined?.languageData?.file_url).toContain('adolescents_cbt_core_he_series_3_combined.pdf');
    expect(resolveFormWithLanguage('adolescents-cbt-core-he-3-1', 'en')).toBeNull();
    expect(resolveFormWithLanguage('adolescents-cbt-core-he-stage-3-combined', 'en')).toBeNull();
  });

  it('keeps page-level language normalization and strict same-language filtering', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    expect(pageSource).toContain("const lang = normalizeLanguageCode(i18n.resolvedLanguage || i18n.language || 'en')");
    expect(pageSource).toContain("if (language !== lang)");
    expect(pageSource).toContain("if (form.language && form.language !== lang)");
    expect(pageSource).toContain("if (!form.languages?.[normalizedLang] || form.approved !== true) return false;");
    expect(pageSource).toMatch(
      /normalizedLang === 'he'[\s\S]*form\.language === 'he'[\s\S]*form\.audience === 'adolescents'[\s\S]*adolescents_cbt_core[\s\S]*adolescents_cbt_specialized[\s\S]*form\.audience === 'children'[\s\S]*children_cbt_core/
    );
  });

  it('keeps Hebrew adolescents core entries filter-compatible for page audience/category chips', () => {
    const hebrewCore = ALL_FORMS.filter((form) => form.id.startsWith('adolescents-cbt-core-he'));
    expect(hebrewCore.length).toBe(36);
    expect(hebrewCore.every((form) => form.audience === 'adolescents')).toBe(true);
    expect(hebrewCore.every((form) => form.category === 'adolescents_cbt_core')).toBe(true);
    expect(hebrewCore.some((form) => (form.secondaryCategories || []).includes('thought_records'))).toBe(true);
    expect(hebrewCore.some((form) => (form.secondaryCategories || []).includes('behavioral_activation'))).toBe(true);
    expect(hebrewCore.some((form) => (form.secondaryCategories || []).includes('weekly_practice'))).toBe(true);
  });

  it('keeps Hebrew children core entries Hebrew-only and filter-compatible for page chips', () => {
    const hebrewChildrenCore = ALL_FORMS.filter((form) => form.id.startsWith('children-cbt-core-he'));
    const hebrewChildrenIndividuals = hebrewChildrenCore.filter((form) => form.type === 'individual_worksheet');
    expect(hebrewChildrenCore.length).toBe(35);
    expect(hebrewChildrenCore.every((form) => form.audience === 'children')).toBe(true);
    expect(hebrewChildrenCore.every((form) => form.category === 'children_cbt_core')).toBe(true);
    expect(hebrewChildrenCore.every((form) => form.languages?.he?.rtl === true)).toBe(true);
    expect(hebrewChildrenIndividuals.every((form) => /[\u0590-\u05FF]/.test(String(form.title || '')))).toBe(true);
    expect(hebrewChildrenIndividuals.every((form) => !/^children_cbt_core_he_/i.test(String(form.title || '')))).toBe(true);
    expect(hebrewChildrenIndividuals.every((form) => /[\u0590-\u05FF]/.test(String(form.description || '')))).toBe(true);
    expect(hebrewChildrenIndividuals.every((form) => !String(form.description || '').includes('Identify and name current feelings'))).toBe(true);
    expect(resolveFormWithLanguage('children-cbt-core-he-module-02', 'he')?.languageData?.file_url)
      .toContain('children_cbt_core_he_module_02_combined.pdf');
    expect(resolveFormWithLanguage('children-cbt-core-he-module-02', 'en')).toBeNull();
    expect(resolveFormWithLanguage('children-cbt-core-he-module-02', 'es')).toBeNull();
  });

  it('keeps Hebrew category label wiring for children_cbt_core in TherapeuticForms UI', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    const translationsSource = fs.readFileSync(path.join(ROOT, 'src/components/i18n/translations.jsx'), 'utf8');
    expect(pageSource).toContain("t(`therapeutic_forms.category.${form.category}`)");
    expect(translationsSource).toContain('children_cbt_core: "סדרת ליבה CBT לילדים"');
  });
});

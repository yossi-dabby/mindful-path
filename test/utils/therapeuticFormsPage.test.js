import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { ALL_FORMS, resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';

describe('therapeuticFormsPage.test.js — adolescents package integration', () => {
  it('keeps route and page registration intact', () => {
    const pagesConfigSource = fs.readFileSync('/home/runner/work/mindful-path/mindful-path/src/pages.config.js', 'utf8');
    expect(pagesConfigSource).toContain('"TherapeuticForms": TherapeuticForms');
  });

  it('keeps Home quick action pointing to TherapeuticForms', () => {
    const quickActionsSource = fs.readFileSync('/home/runner/work/mindful-path/mindful-path/src/components/home/QuickActions.jsx', 'utf8');
    expect(quickActionsSource).toContain("page: 'TherapeuticForms'");
  });

  it('includes page filtering logic for secondary categories and audience-aware language paths', () => {
    const pageSource = fs.readFileSync('/home/runner/work/mindful-path/mindful-path/src/pages/TherapeuticForms.jsx', 'utf8');
    expect(pageSource).toContain('secondaryCategories');
    expect(pageSource).toContain('getLanguageFolderPrefix(lang, form.audience)');
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
});

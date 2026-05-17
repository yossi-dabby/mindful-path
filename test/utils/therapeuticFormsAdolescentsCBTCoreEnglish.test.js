import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import {
  resolveFormIntent,
  resolveAdolescentsCBTCoreEnglishFormByContent,
} from '../../src/utils/resolveFormIntent.js';

const CORE_ID = 'adolescents-cbt-core-en';
const CORE_URL = '/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf';

describe('therapeuticFormsAdolescentsCBTCoreEnglish.test.js', () => {
  it('registers exactly one active canonical package in ALL_FORMS', () => {
    expect(ALL_FORMS).toHaveLength(1);
    expect(ALL_FORMS[0].id).toBe(CORE_ID);
    expect(ALL_FORMS.map((form) => form.id)).toEqual([CORE_ID]);
  });

  it('keeps required adolescents CBT core metadata and file URL', () => {
    const form = ALL_FORMS[0];

    expect(form.slug).toBe('adolescents-cbt-core-series-1-en');
    expect(form.title).toBe('Adolescents CBT Core Series');
    expect(form.language).toBe('en');
    expect(form.audience).toBe('adolescents');
    expect(form.category).toBe('adolescents_cbt_core');
    expect(form.fileUrl).toBe(CORE_URL);
    expect(form.pageCount).toBe(30);
    expect(form.seriesType).toBe('workbook_series');
    expect(form.stageCount).toBe(6);
    expect(form.formsCount).toBe(30);
    expect(form.numberingRange).toBe('1.1-6.5');
    expect(form.secondaryCategories).toEqual([
      'therapeutic_workbooks',
      'thought_records',
      'cognitive_restructuring',
      'emotional_regulation',
      'coping_tools',
      'weekly_practice',
      'journaling_reflection',
    ]);

    expect(form.languages.en.file_url).toBe(CORE_URL);
    expect(form.languages.en.file_name).toBe('adolescents-cbt-core-series-1-full-en.pdf');
  });

  it('resolves marker id/slug and content intents to the adolescents core package in English', () => {
    const byId = resolveFormIntent(CORE_ID, 'en');
    const bySlug = resolveFormIntent('adolescents-cbt-core-series-1-en', 'en');
    const byIntent = resolveAdolescentsCBTCoreEnglishFormByContent('I need a CBT workbook for a teenager with anxiety and avoidance', { activeLanguage: 'en' });

    for (const metadata of [byId, bySlug, byIntent]) {
      expect(metadata?.form_id).toBe(CORE_ID);
      expect(metadata?.title).toBe('Adolescents CBT Core Series');
      expect(metadata?.language).toBe('en');
      expect(metadata?.audience).toBe('adolescents');
      expect(metadata?.category).toBe('adolescents_cbt_core');
      expect(metadata?.url).toBe(CORE_URL);
    }
  });

  it('does not resolve this package for Hebrew-only, children, or adult requests', () => {
    expect(resolveAdolescentsCBTCoreEnglishFormByContent('I need a CBT workbook for children', { activeLanguage: 'en' })).toBeNull();
    expect(resolveAdolescentsCBTCoreEnglishFormByContent('I need an adult CBT workbook for stress', { activeLanguage: 'en' })).toBeNull();
    expect(resolveAdolescentsCBTCoreEnglishFormByContent('אני צריך טופס בעברית למתבגר', { activeLanguage: 'he' })).toBeNull();
    expect(resolveAdolescentsCBTCoreEnglishFormByContent('I need an adolescent CBT workbook in English for anxiety', { activeLanguage: 'he' })?.form_id).toBe(CORE_ID);
    expect(resolveFormIntent('tf-adults-cbt-thought-record', 'en')).toBeNull();
    expect(resolveFormIntent('tf-children-cbt-stage-2-2-premium-he', 'he')).toBeNull();
  });
});

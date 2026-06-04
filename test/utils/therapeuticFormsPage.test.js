import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ALL_FORMS, resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';
import {
  getLanguageVisibleForms,
  buildCollectionsFromForms,
  getAudienceOptionsFromCollections,
  buildModulesFromCollectionForms,
} from '../../src/pages/TherapeuticForms.jsx';

const ROOT = path.resolve(process.cwd());
const translationsSource = fs.readFileSync(path.join(ROOT, 'src/components/i18n/translations.jsx'), 'utf8');

describe('therapeuticFormsPage.test.js — collection-first browsing', () => {
  it('keeps route and page registration intact', () => {
    const pagesConfigSource = fs.readFileSync(path.join(ROOT, 'src/pages.config.js'), 'utf8');
    expect(pagesConfigSource).toContain('"TherapeuticForms": TherapeuticForms');
  });

  it('default collection-level data is smaller than worksheet-level data', () => {
    const visibleEn = getLanguageVisibleForms('en');
    const collections = buildCollectionsFromForms(visibleEn);
    const worksheetCount = visibleEn.filter((entry) => entry.form.cardType === 'worksheet').length;
    expect(collections.length).toBeGreaterThan(0);
    expect(collections.length).toBeLessThan(worksheetCount);
    expect(collections.every((collection) => collection.worksheetCount >= 0)).toBe(true);
  });

  it('Hebrew mode uses Hebrew collection labels', () => {
    const visibleHe = getLanguageVisibleForms('he');
    const collections = buildCollectionsFromForms(visibleHe);
    expect(collections.length).toBeGreaterThan(0);
    expect(translationsSource).toContain('children_cbt_core: "סדרת ליבה CBT לילדים"');
    expect(translationsSource).toContain('children_cbt_specialized: "CBT ייעודי לילדים"');
    expect(translationsSource).toContain('adolescents_cbt_core: "סדרת ליבה CBT למתבגרים/ות"');
  });

  it('English mode uses English collection labels', () => {
    const visibleEn = getLanguageVisibleForms('en');
    const collections = buildCollectionsFromForms(visibleEn);
    expect(collections.length).toBeGreaterThan(0);
    expect(translationsSource).toContain('children_cbt_core: "Children CBT Core"');
    expect(translationsSource).toContain('adolescents_cbt_core: "Adolescents CBT Core Series"');
  });

  it('Hebrew mode does not include English-only forms', () => {
    const visibleHe = getLanguageVisibleForms('he');
    expect(visibleHe.length).toBeGreaterThan(0);
    expect(visibleHe.every((entry) => entry.form.language === 'he')).toBe(true);
  });

  it('English mode does not include Hebrew-only forms', () => {
    const visibleEn = getLanguageVisibleForms('en');
    expect(visibleEn.length).toBeGreaterThan(0);
    expect(visibleEn.every((entry) => entry.form.language === 'en')).toBe(true);
  });

  it('empty audiences are hidden from audience options', () => {
    const visibleHe = getLanguageVisibleForms('he');
    const collections = buildCollectionsFromForms(visibleHe);
    const audienceOptions = getAudienceOptionsFromCollections(collections);
    expect(audienceOptions).toContain('children');
    expect(audienceOptions).toContain('adolescents');
    expect(audienceOptions).not.toContain('adults');
    expect(audienceOptions).not.toContain('older_adults');
  });

  it('selecting a collection yields module/stage cards', () => {
    const visibleEn = getLanguageVisibleForms('en');
    const collections = buildCollectionsFromForms(visibleEn);
    const selectedCollection = collections.find((collection) => collection.collectionId === 'children-cbt-specialized-en');
    expect(selectedCollection).toBeTruthy();
    const modules = buildModulesFromCollectionForms(selectedCollection.forms, 'en');
    expect(modules.length).toBeGreaterThan(0);
  });

  it('selecting a module/stage yields only that module worksheets', () => {
    const visibleEn = getLanguageVisibleForms('en');
    const collections = buildCollectionsFromForms(visibleEn);
    const selectedCollection = collections.find((collection) => collection.collectionId === 'children-cbt-specialized-en');
    const modules = buildModulesFromCollectionForms(selectedCollection.forms, 'en');
    const selectedModule = modules.find((module) => module.worksheetCount > 0);
    expect(selectedModule).toBeTruthy();
    const moduleNumber = selectedModule.moduleNumber || selectedModule.stageNumber;
    expect(selectedModule.worksheetEntries.every((entry) => (entry.form.moduleNumber || entry.form.stageNumber) === moduleNumber)).toBe(true);
  });

  it('combined PDFs remain visually distinct from worksheet entries in module data', () => {
    const visibleHe = getLanguageVisibleForms('he');
    const collections = buildCollectionsFromForms(visibleHe);
    const selectedCollection = collections.find((collection) => collection.collectionId === 'children-cbt-core-he');
    const modules = buildModulesFromCollectionForms(selectedCollection.forms, 'he');
    const withCombined = modules.find((module) => module.combinedForm && module.worksheetCount > 0);
    expect(withCombined).toBeTruthy();
    expect(withCombined.combinedForm.form.cardType).toBe('combined_pdf');
    expect(withCombined.worksheetEntries.every((entry) => entry.form.cardType === 'worksheet')).toBe(true);
  });

  it('open/download behavior wiring remains helper-based', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    expect(pageSource).toContain('openFile(getFormOpenUrl(fileUrl))');
    expect(pageSource).toContain('downloadPdfFile(fileUrl, fileName)');
  });

  it('Hebrew module titles avoid raw IDs/slugs', () => {
    const visibleHe = getLanguageVisibleForms('he');
    const collections = buildCollectionsFromForms(visibleHe);
    const selectedCollection = collections.find((collection) => collection.collectionId === 'adolescents-cbt-core-he');
    const modules = buildModulesFromCollectionForms(selectedCollection.forms, 'he');
    expect(modules.length).toBeGreaterThan(0);
    expect(modules.every((module) => !/adolescents|children|cbt|[_-]{2,}|[a-z]{4,}/i.test(module.title))).toBe(true);
  });

  it('existing children/adolescents Hebrew forms remain accessible', () => {
    expect(resolveFormWithLanguage('children-cbt-core-he-5-1', 'he')?.languageData?.file_url).toContain('/forms/');
    expect(resolveFormWithLanguage('adolescents-cbt-core-he-3-1', 'he')?.languageData?.file_url).toContain('/forms/');
  });

  it('existing English forms remain accessible', () => {
    expect(resolveFormWithLanguage('children-cbt-specialized-en-1-1-1', 'en')?.languageData?.file_url).toContain('/forms/');
    expect(resolveFormWithLanguage('adolescents-cbt-core-en-2-2', 'en')?.languageData?.file_url).toContain('/forms/');
  });

  it('all forms list still contains expected anchor entries', () => {
    expect(ALL_FORMS.map((form) => form.id)).toContain('adolescents-cbt-core-en');
    expect(ALL_FORMS.map((form) => form.id)).toContain('children-cbt-core-he-1-1');
  });
});

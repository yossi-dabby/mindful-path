import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { ALL_FORMS, resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';

const ROOT = path.resolve(process.cwd());
const translationsSource = fs.readFileSync(path.join(ROOT, 'src/components/i18n/translations.jsx'), 'utf8');

function visibleForms(lang) {
  return ALL_FORMS.filter((form) => form.approved === true && form.language === lang && form.languages?.[lang]);
}

function collectionsFor(lang) {
  const grouped = new Map();
  for (const form of visibleForms(lang)) {
    if (!form.collectionId) continue;
    if (!grouped.has(form.collectionId)) grouped.set(form.collectionId, []);
    grouped.get(form.collectionId).push(form);
  }
  return grouped;
}

function modulesForCollection(forms) {
  const grouped = new Map();
  for (const form of forms) {
    if (form.cardType !== 'worksheet' && form.cardType !== 'combined_pdf') continue;
    const key = form.parentId || `module:${form.moduleNumber || form.stageNumber || form.id}`;
    if (!grouped.has(key)) grouped.set(key, []);
    grouped.get(key).push(form);
  }
  return grouped;
}

describe('therapeuticFormsPage.test.js — collection-first browsing', () => {
  it('keeps route and page registration intact', () => {
    const pagesConfigSource = fs.readFileSync(path.join(ROOT, 'src/pages.config.js'), 'utf8');
    expect(pagesConfigSource).toContain('"TherapeuticForms": TherapeuticForms');
  });

  it('default view contract is collection-first in page source', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    expect(pageSource).toContain('collections-grid');
    expect(pageSource).toContain('modules-grid');
    expect(pageSource).toContain('worksheets-grid');
    expect(pageSource).toContain('ai-forms-callout');
  });

  it('collection-level data is smaller than worksheet-level data', () => {
    const enCollections = collectionsFor('en');
    const worksheetCount = visibleForms('en').filter((form) => form.cardType === 'worksheet').length;
    expect(enCollections.size).toBeGreaterThan(0);
    expect(enCollections.size).toBeLessThan(worksheetCount);
  });

  it('Hebrew mode displays Hebrew collection labels', () => {
    const heCollections = collectionsFor('he');
    expect(heCollections.size).toBeGreaterThan(0);
    expect(translationsSource).toContain('children_cbt_core: "סדרת ליבה CBT לילדים"');
    expect(translationsSource).toContain('children_cbt_specialized: "CBT ייעודי לילדים"');
    expect(translationsSource).toContain('adolescents_cbt_core: "סדרת ליבה CBT למתבגרים/ות"');
  });

  it('English mode displays English collection labels', () => {
    const enCollections = collectionsFor('en');
    expect(enCollections.size).toBeGreaterThan(0);
    expect(translationsSource).toContain('children_cbt_core: "Children CBT Core"');
    expect(translationsSource).toContain('adolescents_cbt_core: "Adolescents CBT Core Series"');
  });

  it('Hebrew mode does not show English-only forms', () => {
    const heForms = visibleForms('he');
    expect(heForms.length).toBeGreaterThan(0);
    expect(heForms.every((form) => form.language === 'he')).toBe(true);
  });

  it('English mode does not show Hebrew-only forms', () => {
    const enForms = visibleForms('en');
    expect(enForms.length).toBeGreaterThan(0);
    expect(enForms.every((form) => form.language === 'en')).toBe(true);
  });

  it('empty audiences are hidden by available collection audiences', () => {
    const audiences = new Set(Array.from(collectionsFor('he').values()).map((forms) => forms[0].audience));
    expect(audiences.has('children')).toBe(true);
    expect(audiences.has('adolescents')).toBe(true);
    expect(audiences.has('adults')).toBe(false);
    expect(audiences.has('older_adults')).toBe(false);
  });

  it('clicking a collection maps to module/stage groups', () => {
    const groups = modulesForCollection(collectionsFor('en').get('children-cbt-specialized-en') || []);
    expect(groups.size).toBeGreaterThan(0);
  });

  it('clicking a module/stage maps to only its worksheets', () => {
    const forms = collectionsFor('en').get('children-cbt-specialized-en') || [];
    const groups = modulesForCollection(forms);
    const moduleForms = Array.from(groups.values()).find((group) => group.some((item) => item.cardType === 'worksheet'));
    expect(moduleForms).toBeTruthy();
    const worksheetForms = moduleForms.filter((item) => item.cardType === 'worksheet');
    const moduleNumber = worksheetForms[0].moduleNumber;
    expect(worksheetForms.every((item) => item.moduleNumber === moduleNumber)).toBe(true);
  });

  it('combined PDFs are distinct from worksheets in grouped data', () => {
    const forms = collectionsFor('he').get('children-cbt-core-he') || [];
    expect(forms.some((item) => item.cardType === 'combined_pdf')).toBe(true);
    expect(forms.some((item) => item.cardType === 'worksheet')).toBe(true);
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    expect(pageSource).toContain('combined-pdf-card');
  });

  it('open/download behavior still uses existing helpers in page source', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    expect(pageSource).toContain('openFile(getFormOpenUrl(fileUrl))');
    expect(pageSource).toContain('downloadPdfFile(fileUrl, fileName)');
  });

  it('Hebrew module titles are not raw IDs/slugs in generated index', () => {
    const heForms = visibleForms('he').filter((form) => form.cardType === 'worksheet');
    expect(heForms.every((form) => !String(form.title || '').includes('adolescents-cbt'))).toBe(true);
    expect(heForms.every((form) => !/^children_cbt|^adolescents_cbt/i.test(String(form.title || '')))).toBe(true);
  });

  it('existing children/adolescents Hebrew forms remain accessible', () => {
    expect(resolveFormWithLanguage('children-cbt-core-he-5-1', 'he')?.languageData?.file_url).toContain('/forms/');
    expect(resolveFormWithLanguage('adolescents-cbt-core-he-3-1', 'he')?.languageData?.file_url).toContain('/forms/');
  });

  it('existing English forms remain accessible', () => {
    expect(resolveFormWithLanguage('children-cbt-specialized-en-1-1-1', 'en')?.languageData?.file_url).toContain('/forms/');
    expect(resolveFormWithLanguage('adolescents-cbt-core-en-2-2', 'en')?.languageData?.file_url).toContain('/forms/');
  });
});

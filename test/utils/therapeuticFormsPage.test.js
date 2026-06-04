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
    const viewModeToggleSource = fs.readFileSync(path.join(ROOT, 'src/components/forms/FormsViewModeToggle.jsx'), 'utf8');
    const navSource = fs.readFileSync(path.join(ROOT, 'src/components/forms/FormsNavigationControls.jsx'), 'utf8');
    expect(pageSource).toContain('collections-grid');
    expect(pageSource).toContain('modules-grid');
    expect(pageSource).toContain('worksheets-grid');
    expect(pageSource).toContain('ai-forms-callout');
    expect(viewModeToggleSource).toContain('forms-view-mode-toggle');
    expect(navSource).toContain('forms-navigation-controls');
    expect(pageSource).toContain('forms-library-teal');
  });

  it('forms library page keeps teal-scoped styling contracts', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    const collectionCardSource = fs.readFileSync(path.join(ROOT, 'src/components/forms/FormsCollectionCard.jsx'), 'utf8');
    const moduleCardSource = fs.readFileSync(path.join(ROOT, 'src/components/forms/FormsModuleCard.jsx'), 'utf8');
    const worksheetCardSource = fs.readFileSync(path.join(ROOT, 'src/components/forms/FormsWorksheetCard.jsx'), 'utf8');
    const breadcrumbSource = fs.readFileSync(path.join(ROOT, 'src/components/forms/FormsBreadcrumb.jsx'), 'utf8');
    expect(pageSource).toContain('bg-teal-100/40');
    expect(collectionCardSource).toContain('border-teal-300');
    expect(moduleCardSource).toContain('border-teal-400');
    expect(worksheetCardSource).toContain('border-teal-300');
    expect(breadcrumbSource).toContain('text-teal-600');
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
    const combinedCardSource = fs.readFileSync(path.join(ROOT, 'src/components/forms/FormsCombinedPdfCard.jsx'), 'utf8');
    expect(pageSource).toContain('FormsCombinedPdfCard');
    expect(combinedCardSource).toContain('combined-pdf-card');
    expect(combinedCardSource).toContain('Combined PDF');
  });

  it('open/download behavior still uses existing helpers in page source', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    expect(pageSource).toContain('openFile(getFormOpenUrl(fileUrl))');
    expect(pageSource).toContain('downloadPdfFile(fileUrl, fileName)');
  });

  it('view mode defaults to medium and persists in localStorage key', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    const toggleSource = fs.readFileSync(path.join(ROOT, 'src/components/forms/FormsViewModeToggle.jsx'), 'utf8');
    expect(pageSource).toContain("DEFAULT_FORMS_VIEW_MODE = 'medium'");
    expect(pageSource).toContain("FORMS_VIEW_MODE_STORAGE_KEY = 'mindfulPath.formsLibrary.viewMode'");
    expect(pageSource).toContain('FORMS_VIEW_MODES.includes(mode)');
    expect(pageSource).toContain("window.localStorage.getItem(FORMS_VIEW_MODE_STORAGE_KEY)");
    expect(pageSource).toContain("window.localStorage.setItem(FORMS_VIEW_MODE_STORAGE_KEY, viewMode)");
    expect(toggleSource).toContain('forms-view-mode-${option.value}');
    expect(toggleSource).toContain("value: 'large'");
    expect(toggleSource).toContain("value: 'compact'");
    expect(toggleSource).toContain("value: 'list'");
    expect(toggleSource).toContain("value: 'tiles'");
  });

  it('includes navigation arrows and breadcrumb contracts in page source', () => {
    const navSource = fs.readFileSync(path.join(ROOT, 'src/components/forms/FormsNavigationControls.jsx'), 'utf8');
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    expect(navSource).toContain('forms-nav-back');
    expect(navSource).toContain('Back');
    expect(navSource).toContain('חזרה');
    expect(pageSource).toContain('handleNavBack');
    expect(pageSource).toContain('FormsBreadcrumb');
  });

  it('keeps explicit RTL/LTR contracts on forms library surface', () => {
    const pageSource = fs.readFileSync(path.join(ROOT, 'src/pages/TherapeuticForms.jsx'), 'utf8');
    const worksheetCardSource = fs.readFileSync(path.join(ROOT, 'src/components/forms/FormsWorksheetCard.jsx'), 'utf8');
    expect(pageSource).toContain("dir={isRtl ? 'rtl' : 'ltr'}");
    expect(worksheetCardSource).toContain("dir={worksheet.languageData?.rtl ? 'rtl' : 'ltr'}");
  });

  it('uses scoped forms-only components for view and navigation controls', () => {
    const appSource = fs.readFileSync(path.join(ROOT, 'src/App.jsx'), 'utf8');
    expect(appSource).not.toContain('FormsViewModeToggle');
    expect(appSource).not.toContain('FormsNavigationControls');
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

import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

import generatedFormsIndex from '../../src/generated/therapeutic-forms-index.json';
import {
  ALL_FORMS,
  getTherapeuticFormsForAI,
  searchFormsForAI,
  resolveFormForAIRequest,
} from '../../src/data/therapeuticForms/index.js';
import {
  FORMS_CHILDREN_CBT_SPECIALIZED_HE,
  FORMS_CHILDREN_CBT_SPECIALIZED_HE_MODULE_PDFS,
  FORMS_CHILDREN_CBT_SPECIALIZED_HE_INDIVIDUAL,
} from '../../src/data/therapeuticForms/forms.children.cbt-specialized.he.js';
import { getFormDownloadUrl, getFormOpenUrl, PDF_VIEWER_ROUTE_PATH } from '../../src/components/chat/utils/formFileUrls.js';

const ROOT = path.resolve(process.cwd());
const PUBLIC_FORMS_DIR = path.join(ROOT, 'public/forms');
const HEBREW_SPECIALIZED_CANONICAL_PREFIX = '/forms/he/children/cbt-specialized/';
const HEBREW_SPECIALIZED_CANONICAL_DIR = path.join(PUBLIC_FORMS_DIR, 'he/children/cbt-specialized');
const COLLECTION_ID = 'children-cbt-specialized-he';

function walk(dirPath) {
  const output = [];
  for (const dirent of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const absolute = path.join(dirPath, dirent.name);
    if (dirent.isDirectory()) {
      output.push(...walk(absolute));
      continue;
    }
    output.push(absolute);
  }
  return output;
}

function getHebrewSpecializedSubcategoryFolders() {
  const output = [];
  for (const moduleDirent of fs.readdirSync(HEBREW_SPECIALIZED_CANONICAL_DIR, { withFileTypes: true })) {
    if (!moduleDirent.isDirectory()) continue;
    const modulePath = path.join(HEBREW_SPECIALIZED_CANONICAL_DIR, moduleDirent.name);
    for (const subcategoryDirent of fs.readdirSync(modulePath, { withFileTypes: true })) {
      if (!subcategoryDirent.isDirectory()) continue;
      output.push(path.posix.join(moduleDirent.name, subcategoryDirent.name));
    }
  }
  return output.sort();
}

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

function matchesSubcategory(form, subcategory) {
  return String(form?.formNumber || form?.worksheetNumber || '').startsWith(`${subcategory}.`)
    || String(form?.moduleCode || '').trim() === subcategory
    || String(form?.id || '').includes(`module-${subcategory.replace('.', '-')}`);
}

describe('Hebrew children CBT specialized integration', () => {
  it('registers the verified Hebrew specialized registry with 11 combined PDFs and 110 individual worksheets', () => {
    expect(FORMS_CHILDREN_CBT_SPECIALIZED_HE_MODULE_PDFS).toHaveLength(11);
    expect(FORMS_CHILDREN_CBT_SPECIALIZED_HE_INDIVIDUAL).toHaveLength(110);
    expect(FORMS_CHILDREN_CBT_SPECIALIZED_HE).toHaveLength(121);
  });

  it('matches canonical module/subcategory folders and verifies each folder contributes 11 non-zero PDFs with no previews', () => {
    const folders = getHebrewSpecializedSubcategoryFolders();
    expect(folders).toEqual([
      'module-01/subcategory-01-01',
      'module-01/subcategory-01-02',
      'module-01/subcategory-01-03',
      'module-01/subcategory-01-04',
      'module-01/subcategory-01-05',
      'module-02/subcategory-02-03',
      'module-03/subcategory-03-01',
      'module-04/subcategory-04-01',
      'module-04/subcategory-04-02',
      'module-05/subcategory-05-01',
      'module-05/subcategory-05-03',
    ]);

    const seenFileNames = new Set();
    for (const folder of folders) {
      const absoluteFolder = path.join(HEBREW_SPECIALIZED_CANONICAL_DIR, folder);
      const files = fs.readdirSync(absoluteFolder);
      const pdfs = files.filter((file) => file.toLowerCase().endsWith('.pdf')).sort();
      const previews = files.filter((file) => /\.(png|jpe?g|webp)$/i.test(file));
      expect(pdfs, `Unexpected PDF count in ${folder}`).toHaveLength(11);
      expect(previews, `Unexpected preview files in ${folder}`).toHaveLength(0);
      for (const pdf of pdfs) {
        const absolutePdf = path.join(absoluteFolder, pdf);
        expect(fs.statSync(absolutePdf).size, `Zero-byte PDF: ${absolutePdf}`).toBeGreaterThan(0);
        const scopedName = `${folder}/${pdf}`;
        expect(seenFileNames.has(scopedName)).toBe(false);
        seenFileNames.add(scopedName);
      }
    }
  });

  it('registers only file-backed approved Hebrew children entries with rtl language blocks', () => {
    for (const form of FORMS_CHILDREN_CBT_SPECIALIZED_HE) {
      expect(form.approved).toBe(true);
      expect(form.language).toBe('he');
      expect(form.audience).toBe('children');
      expect(form.languages?.he?.rtl).toBe(true);
      expect(typeof form.fileUrl).toBe('string');
      expect(form.fileUrl.startsWith('/forms/')).toBe(true);
      expect(fs.existsSync(path.join(ROOT, 'public', form.fileUrl.replace(/^\//, '')))).toBe(true);
    }
  });

  it('adds the Hebrew specialized collection to the generated index with hierarchy metadata', () => {
    const forms = generatedFormsIndex.filter((form) => form.collectionId === COLLECTION_ID);
    expect(forms).toHaveLength(121);
    expect(forms.filter((form) => form.cardType === 'combined_pdf')).toHaveLength(11);
    expect(forms.filter((form) => form.cardType === 'worksheet')).toHaveLength(110);
    expect(forms.every((form) => form.collectionType === 'specialized')).toBe(true);
    expect(forms.every((form) => form.language === 'he')).toBe(true);
    expect(forms.every((form) => form.languages?.he?.rtl === true)).toBe(true);
    expect(forms.filter((form) => form.cardType === 'worksheet').every((form) => typeof form.parentId === 'string' && form.parentId.startsWith(`${COLLECTION_ID}-module-`))).toBe(true);
  });

  it('shows the Hebrew specialized collection only in Hebrew mode inside the collection-first forms library', () => {
    const heCollections = collectionsFor('he');
    const enCollections = collectionsFor('en');
    const heCollection = heCollections.get(COLLECTION_ID);

    expect(heCollection).toBeTruthy();
    expect(heCollection[0].audience).toBe('children');
    expect(heCollection[0].collectionType).toBe('specialized');
    expect(enCollections.has(COLLECTION_ID)).toBe(false);

    const modules = modulesForCollection(heCollection);
    const worksheetParentIds = new Set(
      heCollection
        .filter((form) => form.cardType === 'worksheet')
        .map((form) => form.parentId)
    );
    expect(worksheetParentIds.size).toBe(11);
    expect(heCollection.filter((form) => form.cardType === 'combined_pdf')).toHaveLength(11);
    expect(modules.size).toBeGreaterThanOrEqual(11);
    for (const group of modules.values()) {
      expect(group.every((item) => /[\u0590-\u05FF]|OCD/.test(String(item.title || '')))).toBe(true);
    }
  });

  it('keeps Hebrew-only visibility and preserves English children specialized forms unchanged', () => {
    const hebrewChildren = getTherapeuticFormsForAI({ language: 'he', audience: 'children' })
      .filter((form) => form.category === 'children_cbt_specialized');
    const englishChildren = getTherapeuticFormsForAI({ language: 'en', audience: 'children' })
      .filter((form) => form.category === 'children_cbt_specialized');
    const spanishChildren = getTherapeuticFormsForAI({ language: 'es', audience: 'children' })
      .filter((form) => form.category === 'children_cbt_specialized');

    expect(hebrewChildren).toHaveLength(121);
    expect(hebrewChildren.every((form) => form.language === 'he')).toBe(true);
    expect(englishChildren).toHaveLength(165);
    expect(englishChildren.every((form) => form.language === 'en')).toBe(true);
    expect(spanishChildren).toHaveLength(0);
  });

  it('supports Hebrew AI search by direct title, clinical need, topic request, and send flow', () => {
    const byTitle = searchFormsForAI('נפרדים בשלום', { language: 'he', audience: 'children' })[0];
    const byNeed = searchFormsForAI('ילד עם חרדת פרידה', { language: 'he', audience: 'children' })[0];
    const byTopic = searchFormsForAI('חרדה חברתית', { language: 'he', audience: 'children' })[0];
    const byOcd = searchFormsForAI('מחשבות חודרניות וטקסים', { language: 'he', audience: 'children' })[0];
    const byTrauma = searchFormsForAI('טראומה קרקוע תחושת ביטחון', { language: 'he', audience: 'children' })[0];
    const bySleep = searchFormsForAI('קשיי שינה פחד מהחושך', { language: 'he', audience: 'children' })[0];
    const byEnuresis = searchFormsForAI('הרטבה בלי בושה', { language: 'he', audience: 'children' })[0];
    const sent = resolveFormForAIRequest('שלח לי טופס לילד עם חרדת פרידה', { language: 'he' });

    expect(byTitle?.id).toBe('children-cbt-specialized-he-1-1-1');
    expect(matchesSubcategory(byNeed, '1.1')).toBe(true);
    expect(matchesSubcategory(byTopic, '1.3')).toBe(true);
    expect(matchesSubcategory(byOcd, '4.1')).toBe(true);
    expect(matchesSubcategory(byTrauma, '4.2')).toBe(true);
    expect(matchesSubcategory(bySleep, '5.1')).toBe(true);
    expect(matchesSubcategory(byEnuresis, '5.3')).toBe(true);
    expect(sent.generatedFile?.language).toBe('he');
    expect(String(sent.generatedFile?.form_id || '')).toContain('children-cbt-specialized-he');
  });

  it('does not leak Hebrew specialized forms into English send requests without explicit Hebrew selection', () => {
    const resolved = resolveFormForAIRequest('Send me a specialized child CBT form about separation anxiety', { language: 'en' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('en');
    expect(String(resolved.generatedFile.form_id || '')).toContain('children-cbt-specialized-en');
  });

  it('preserves open and download URL behavior for Hebrew specialized PDFs', () => {
    const form = ALL_FORMS.find((entry) => entry.id === 'children-cbt-specialized-he-module-4-2');
    const openUrl = getFormOpenUrl(form.fileUrl);
    const downloadUrl = getFormDownloadUrl(form.fileUrl);

    expect(openUrl).toContain(`${PDF_VIEWER_ROUTE_PATH}?file=`);
    expect(openUrl).not.toContain('download=1');
    expect(downloadUrl).toContain('download=1');
  });

  it('keeps every uploaded Hebrew specialized PDF represented in the canonical registry', () => {
    const uploadedPdfUrls = walk(PUBLIC_FORMS_DIR)
      .filter((filePath) => filePath.toLowerCase().endsWith('.pdf'))
      .map((filePath) => `/${path.relative(path.join(ROOT, 'public'), filePath).replace(/\\/g, '/')}`)
      .filter((url) => url.startsWith(HEBREW_SPECIALIZED_CANONICAL_PREFIX));
    const indexedUrls = new Set(
      ALL_FORMS
        .map((form) => form.fileUrl || form.languages?.[form.language || 'en']?.file_url)
        .filter(Boolean)
    );

    expect(uploadedPdfUrls).toHaveLength(121);
    for (const url of uploadedPdfUrls) {
      expect(indexedUrls.has(url), `Missing Hebrew specialized PDF from canonical index: ${url}`).toBe(true);
    }
  });
});

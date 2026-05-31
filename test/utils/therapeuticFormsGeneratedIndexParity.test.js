import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

import generatedFormsIndex from '../../src/generated/therapeutic-forms-index.json';
import {
  ALL_FORMS,
  getAllTherapeuticForms,
  getTherapeuticFormsForAI,
  getTherapeuticFormsRegistryDiagnostics,
  THERAPEUTIC_CATEGORIES,
} from '../../src/data/therapeuticForms/index.js';
import { resolveFormIntent } from '../../src/utils/resolveFormIntent.js';

const ROOT = path.resolve(process.cwd());
const PUBLIC_FORMS_DIR = path.join(ROOT, 'public/forms');

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

describe('therapeutic forms generated index parity', () => {
  it('loads canonical generated index and exposes it via ALL_FORMS', () => {
    expect(Array.isArray(generatedFormsIndex)).toBe(true);
    expect(generatedFormsIndex.length).toBeGreaterThan(0);
    expect(ALL_FORMS).toHaveLength(generatedFormsIndex.length);
  });

  it('getAllTherapeuticForms returns a non-empty canonical registry', () => {
    const forms = getAllTherapeuticForms({ environment: 'preview' });
    expect(Array.isArray(forms)).toBe(true);
    expect(forms.length).toBeGreaterThan(0);
  });

  it('returns the same canonical registry shape in preview and production calls', () => {
    const previewForms = getAllTherapeuticForms({ environment: 'preview' });
    const productionForms = getAllTherapeuticForms({ environment: 'production' });
    expect(previewForms.length).toBeGreaterThan(0);
    expect(productionForms.length).toBe(previewForms.length);
  });

  it('returns non-empty AI registries in preview and production language contexts', () => {
    const previewAiForms = getTherapeuticFormsForAI({ language: 'en', environment: 'preview' });
    const productionAiForms = getTherapeuticFormsForAI({ language: 'en', environment: 'production' });
    expect(previewAiForms.length).toBeGreaterThan(0);
    expect(productionAiForms.length).toBeGreaterThan(0);
  });

  it('contains every PDF under public/forms in the canonical registry', () => {
    // Modules 02-10 of the Hebrew adolescents CBT specialized series are uploaded to disk
    // but are not yet registered (only module-01 has been integrated so far).
    const UNREGISTERED_PREFIXES = [
      '/forms/module-02/',
      '/forms/module-03/',
      '/forms/module-04/',
      '/forms/module-05/',
      '/forms/module-06/',
      '/forms/module-07/',
      '/forms/module-08/',
      '/forms/module-09/',
      '/forms/module_10/',
    ];

    const allPdfs = walk(PUBLIC_FORMS_DIR)
      .filter((filePath) => filePath.toLowerCase().endsWith('.pdf'))
      .map((filePath) => `/${path.relative(path.join(ROOT, 'public'), filePath).replace(/\\/g, '/')}`)
      .filter((url) => !UNREGISTERED_PREFIXES.some((prefix) => url.startsWith(prefix)));

    const indexedUrls = new Set(
      ALL_FORMS
        .map((form) => form.fileUrl || form.languages?.en?.file_url)
        .filter(Boolean)
    );

    for (const url of allPdfs) {
      expect(indexedUrls.has(url), `Missing PDF from canonical index: ${url}`).toBe(true);
    }
  });

  it('recognizes exactly 30 children CBT core English individual worksheets with 6 per stage', () => {
    const childrenIndividuals = ALL_FORMS.filter(
      (form) =>
        form.audience === 'children' &&
        form.language === 'en' &&
        form.category === 'children_cbt_core' &&
        form.type === 'individual_worksheet'
    );

    expect(childrenIndividuals).toHaveLength(30);

    for (let stage = 1; stage <= 5; stage += 1) {
      const inStage = childrenIndividuals.filter((form) => Number(form.stageNumber || form.moduleNumber) === stage);
      expect(inStage).toHaveLength(6);
    }
  });

  it('resolves known children CBT core EN worksheet IDs', () => {
    const first = resolveFormIntent('children_cbt_core_en_05_01', 'en');
    const second = resolveFormIntent('children_cbt_core_en_04_02', 'en');
    expect(first?.form_id).toBe('children-cbt-core-en-5-1');
    expect(second?.form_id).toBe('children-cbt-core-en-4-2');
    expect(String(first?.url || '')).toContain('/forms/children/en/cbt-core/children_cbt_core_en_05_01.pdf');
    expect(String(second?.url || '')).toContain('/forms/children/en/cbt-core/children_cbt_core_en_04_02.pdf');
  });

  it('resolves children worksheet content scenarios in English mode', () => {
    const calmPlan = resolveFormIntent('child feels overwhelmed and needs a calm plan', 'en');
    const calmingTools = resolveFormIntent('child needs calming tools', 'en');
    const bodyClues = resolveFormIntent('child needs help noticing body clues', 'en');
    expect(calmPlan?.audience).toBe('children');
    expect(calmingTools?.audience).toBe('children');
    expect(bodyClues?.audience).toBe('children');
  });

  it('applies language and audience filtering without collapsing the registry', () => {
    const englishChildren = getTherapeuticFormsForAI({ language: 'en', audience: 'children' });
    const hebrewChildren = getTherapeuticFormsForAI({ language: 'he', audience: 'children' });
    const hebrewAdolescentsCore = getTherapeuticFormsForAI({ language: 'he', audience: 'adolescents' })
      .filter((form) => form.category === 'adolescents_cbt_core');
    const allForms = getAllTherapeuticForms();

    expect(englishChildren.length).toBeGreaterThan(0);
    expect(hebrewChildren.length).toBe(0);
    expect(hebrewAdolescentsCore).toHaveLength(36);
    expect(allForms.length).toBeGreaterThan(0);
  });

  it('registers exactly 30 Hebrew adolescents core individual worksheets and 6 stage-combined PDFs', () => {
    const hebrewAdolescentsCore = ALL_FORMS.filter(
      (form) =>
        form.audience === 'adolescents' &&
        form.language === 'he' &&
        form.category === 'adolescents_cbt_core'
    );
    const hebrewIndividuals = hebrewAdolescentsCore.filter((form) => form.type === 'individual_worksheet');
    const hebrewStageCombined = hebrewAdolescentsCore.filter((form) => form.type === 'stage_combined_pdf');

    expect(hebrewIndividuals).toHaveLength(30);
    expect(hebrewStageCombined).toHaveLength(6);

    for (let stage = 1; stage <= 6; stage += 1) {
      expect(hebrewIndividuals.filter((form) => Number(form.stageNumber || form.moduleNumber) === stage)).toHaveLength(5);
      expect(hebrewStageCombined.filter((form) => Number(form.stageNumber || form.moduleNumber) === stage)).toHaveLength(1);
    }
  });

  it('keeps Hebrew adolescents core metadata approved, rtl, and filter-compatible', () => {
    const validCategories = new Set(THERAPEUTIC_CATEGORIES.map((cat) => cat.value));
    const hebrewAdolescentsCore = ALL_FORMS.filter(
      (form) => form.audience === 'adolescents' && form.language === 'he' && form.category === 'adolescents_cbt_core'
    );

    expect(hebrewAdolescentsCore).toHaveLength(36);

    for (const form of hebrewAdolescentsCore) {
      expect(form.approved).toBe(true);
      expect(form.language).toBe('he');
      expect(form.languages?.he?.rtl).toBe(true);
      expect(typeof form.fileUrl).toBe('string');
      expect(form.fileUrl.startsWith('/forms/')).toBe(true);
      expect(fs.existsSync(path.join(ROOT, 'public', form.fileUrl.replace(/^\//, '')))).toBe(true);
      expect(validCategories.has(form.category)).toBe(true);
      for (const secondary of form.secondaryCategories || []) {
        expect(validCategories.has(secondary)).toBe(true);
      }
    }
  });

  it('does not register an invented single full-series Hebrew adolescents core PDF', () => {
    const hebrewAdolescentsCore = ALL_FORMS.filter(
      (form) => form.audience === 'adolescents' && form.language === 'he' && form.category === 'adolescents_cbt_core'
    );
    const maybeFullSeries = hebrewAdolescentsCore.filter((form) => /full|series-1-full|workbook_package/i.test(`${form.id} ${form.slug} ${form.fileUrl}`));
    expect(maybeFullSeries).toHaveLength(0);
  });

  it('keeps language and audience guards for children forms', () => {
    const englishResult = resolveFormIntent('child does not know what they are feeling', 'en');
    expect(englishResult?.audience).toBe('children');
    expect(englishResult?.language).toBe('en');

    const hebrewResult = resolveFormIntent('child does not know what they are feeling', 'he');
    expect(hebrewResult).toBeNull();
  });

  it('provides diagnostics that point to the generated canonical source file', () => {
    const diagnostics = getTherapeuticFormsRegistryDiagnostics();
    expect(diagnostics.source).toBe('src/generated/therapeutic-forms-index.json');
    expect(diagnostics.total).toBe(ALL_FORMS.length);
    expect(diagnostics.byLanguage.en).toBeGreaterThan(0);
  });
});

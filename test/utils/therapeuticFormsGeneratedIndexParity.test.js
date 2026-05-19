import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

import generatedFormsIndex from '../../src/generated/therapeutic-forms-index.json';
import {
  ALL_FORMS,
  getAllTherapeuticForms,
  getTherapeuticFormsForAI,
  getTherapeuticFormsRegistryDiagnostics,
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
    const allPdfs = walk(PUBLIC_FORMS_DIR)
      .filter((filePath) => filePath.toLowerCase().endsWith('.pdf'))
      .map((filePath) => `/${path.relative(path.join(ROOT, 'public'), filePath).replace(/\\/g, '/')}`);

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
    const allForms = getAllTherapeuticForms();

    expect(englishChildren.length).toBeGreaterThan(0);
    expect(hebrewChildren.length).toBe(0);
    expect(allForms.length).toBeGreaterThan(0);
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

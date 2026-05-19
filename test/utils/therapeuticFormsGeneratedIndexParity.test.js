import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';

import generatedFormsIndex from '../../src/generated/therapeutic-forms-index.json';
import { ALL_FORMS, getTherapeuticFormsRegistryDiagnostics } from '../../src/data/therapeuticForms/index.js';
import { resolveFormIntent } from '../../src/utils/resolveFormIntent.js';

const ROOT = '/home/runner/work/mindful-path/mindful-path';
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

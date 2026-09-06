import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FORMS_ADOLESCENTS_CBT_CORE_ES_PILOT } from '../../src/data/therapeuticForms/forms.adolescents.cbt-core.es.js';
import generatedFormsIndex from '../../src/generated/therapeutic-forms-index.json';

const ROOT = process.cwd();

describe('Spanish adolescent CBT core stage 1 pilot', () => {
  it('contains exactly the five stage-1 Spanish worksheets', () => {
    expect(FORMS_ADOLESCENTS_CBT_CORE_ES_PILOT).toHaveLength(5);
    expect(FORMS_ADOLESCENTS_CBT_CORE_ES_PILOT.map((form) => form.formNumber))
      .toEqual(['1.1', '1.2', '1.3', '1.4', '1.5']);
  });

  it('declares English as the only source and Spanish as the variant', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_CORE_ES_PILOT) {
      expect(form.language).toBe('es');
      expect(form.source_language).toBe('en');
      expect(form.variant_language).toBe('es');
      expect(form.is_language_variant).toBe(true);
      expect(form.available_languages).toEqual(['en', 'es']);
      expect(form.languages.es.rtl).toBe(false);
      expect(form.languages.he).toBeUndefined();
    }
  });

  it('references five valid Spanish PDF files', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_CORE_ES_PILOT) {
      const filePath = path.join(ROOT, 'public', form.languages.es.file_url);
      expect(fs.existsSync(filePath)).toBe(true);
      expect(fs.readFileSync(filePath).subarray(0, 5).toString()).toBe('%PDF-');
    }
  });

  it('is present in the generated app catalog with rich metadata', () => {
    const pilot = generatedFormsIndex.filter((form) =>
      form.language === 'es' &&
      form.collectionId === 'adolescents-cbt-core-es' &&
      /^1\.[1-5]$/.test(form.formNumber || '')
    );
    expect(pilot).toHaveLength(5);
    for (const form of pilot) {
      expect(form.aiMetadataQuality).toBe('rich');
      expect(form.source_language).toBe('en');
      expect(form.filePath).toMatch(/^public\/forms\/es\/adolescents\/cbt-core\/stage-01\//);
    }
  });
});

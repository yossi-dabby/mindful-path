import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

import { ALL_FORMS, resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';
import { resolveAdolescentsCBTSpecializedEnglishFormByContent } from '../../src/utils/resolveFormIntent.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';

const REPO_ROOT = process.cwd();
const RESOLVER_PATH = path.join(REPO_ROOT, 'src/utils/resolveFormIntent.js');
const THERAPEUTIC_FORMS_PAGE_PATH = path.join(REPO_ROOT, 'src/pages/TherapeuticForms.jsx');

function worksheetOrder() {
  return Array.from({ length: 10 }, (_, moduleIdx) =>
    Array.from({ length: 6 }, (_, worksheetIdx) => `${moduleIdx + 1}.${worksheetIdx + 1}`)
  ).flat();
}

function moduleOf(result) {
  const id = result?.form_id || '';
  const match = id.match(/^tf-adolescents-cbt-specialized-en-(10|[1-9])-[1-6]$/);
  return match ? Number(match[1]) : null;
}

describe('Canonical catalog wiring — aggregator and dedupe', () => {
  it('ALL_FORMS includes approved specialized/core sets and has no duplicate ids', () => {
    expect(ALL_FORMS.some((f) => f.id === 'tf-children-cbt-specialized-1-1-he')).toBe(true);
    expect(ALL_FORMS.some((f) => f.id === 'tf-adolescents-cbt-core-1-1-en')).toBe(true);
    expect(ALL_FORMS.some((f) => f.id === 'tf-adolescents-cbt-specialized-1-1-he')).toBe(true);
    expect(ALL_FORMS.some((f) => f.id === 'tf-adolescents-cbt-specialized-en-1-1')).toBe(true);
    const ids = ALL_FORMS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('TherapeuticForms page — canonical language-first filtering', () => {
  const pageSource = fs.readFileSync(THERAPEUTIC_FORMS_PAGE_PATH, 'utf8');
  const canonicalEnSpecialized = ALL_FORMS.filter(
    (form) =>
      form.approved === true &&
      form.audience === 'adolescents' &&
      form.language === 'en' &&
      form.category === 'adolescents_cbt_specialized' &&
      typeof form.worksheetNumber === 'string'
  );

  it('page reads only canonical ALL_FORMS and applies language-first filtering pipeline', () => {
    expect(pageSource).toContain('ALL_FORMS.filter((form) => form.languages?.[lang] && form.approved === true)');
    expect(pageSource).toContain('const audienceFiltered = langFiltered.filter');
    expect(pageSource).toContain('const categoryFiltered = audienceFiltered.filter');
    expect(pageSource).toContain('categoryFiltered.reduce');
    expect(pageSource).not.toContain('THERAPEUTIC_FORMS_LIBRARY_REGISTRY');
    expect(pageSource).not.toContain('FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL');
  });

  it('English adolescents specialized canonical set is exactly 60 and ordered 1.1–10.6', () => {
    expect(canonicalEnSpecialized).toHaveLength(60);
    expect(canonicalEnSpecialized.every((form) => typeof form.worksheetNumber === 'string' && form.worksheetNumber.trim())).toBe(true);
    const ordered = canonicalEnSpecialized
      .slice()
      .sort((a, b) => {
        const [am, aw] = a.worksheetNumber.split('.').map(Number);
        const [bm, bw] = b.worksheetNumber.split('.').map(Number);
        if (am !== bm) return am - bm;
        return aw - bw;
      })
      .map((form) => form.worksheetNumber);
    expect(ordered).toEqual(worksheetOrder());
  });

  it('page cards read title/description/file URL from resolved languageData on the same card record', () => {
    expect(pageSource).toContain('{languageData.title}');
    expect(pageSource).toContain('{languageData.description}');
    expect(pageSource).toContain('handleOpenForm(languageData.file_url)');
    expect(pageSource).toContain('handleDownloadForm(languageData.file_url, languageData.file_name)');
    expect(pageSource).toContain('{form.worksheetNumber || form.displayNumber || form.cbt_substage_number}');
  });

  it('strict language separation blocks cross-language fallback', () => {
    expect(resolveFormWithLanguage('tf-adolescents-cbt-specialized-en-1-1', 'he')).toBeNull();
    expect(resolveFormWithLanguage('tf-adolescents-cbt-specialized-1-1-he', 'en')).toBeNull();
  });

  it('non-supported specialized languages do not fallback to en/he', () => {
    for (const lang of ['es', 'fr', 'de', 'it', 'pt']) {
      expect(resolveFormWithLanguage('tf-adolescents-cbt-specialized-en-1-1', lang)).toBeNull();
      expect(resolveFormWithLanguage('tf-adolescents-cbt-specialized-1-1-he', lang)).toBeNull();
    }
  });
});

describe('AI resolver — canonical source and content-aware matching', () => {
  it('resolver no longer bolts-on side-array fallback catalogs', () => {
    const source = fs.readFileSync(RESOLVER_PATH, 'utf8');
    expect(source).not.toContain('...FORMS_CHILDREN_CBT_SPECIALIZED');
    expect(source).not.toContain('...FORMS_ADOLESCENTS_CBT_CORE_EN');
    expect(source).not.toContain('...FORMS_ADOLESCENTS_CBT_SPECIALIZED');
    expect(source).not.toContain('...FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN');
  });

  it.each([
    ['Teen is anxious before tests and avoids things.', 1],
    ['Teen has low mood, low energy and trouble functioning.', 2],
    ['Teen struggles with self-worth, criticism or identity.', 3],
    ['Teen has friendship problems, rejection or social media stress.', 4],
    ['Teen gets angry quickly or acts impulsively.', 5],
    ['Teen has intrusive thoughts, doubt, checking urges or reassurance seeking.', 6],
    ['Teen has ADHD, procrastination, distraction or trouble organizing tasks.', 7],
    ['Teen has sleep problems, body stress or overload.', 8],
    ['Teen needs grounding, safe coping, support or gradual return to routine.', 9],
    ['Teen and parents need help with communication, boundaries, trust or cooperation at home.', 10],
  ])('matches module %s -> %d using therapeutic metadata', (prompt, expectedModule) => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(prompt, { activeLanguage: 'en' });
    expect(moduleOf(result)).toBe(expectedModule);
  });

  it('active language hard filter blocks EN specialized result in Hebrew', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'תן לי טופס CBT למתבגר על חרדה',
      { activeLanguage: 'he' }
    );
    expect(result).toBeNull();
  });

  it('content scoring includes notFor and relatedForms metadata fields', () => {
    const source = fs.readFileSync(RESOLVER_PATH, 'utf8');
    expect(source).toContain('scoreArrayField(lq, form.notFor');
    expect(source).toContain('scoreArrayField(lq, form.relatedForms');
  });

  it('full English specialized series catalog listing contains exactly 60 forms with no Hebrew/core mix-ins', () => {
    const catalog = buildTherapistFormCatalog(ALL_FORMS);
    const heading = '[ENGLISH ADOLESCENT CBT SPECIALIZED SERIES — CANONICAL MANIFEST]';
    const section = catalog.slice(catalog.indexOf(heading));
    const ids = section.match(/\[FORM:tf-adolescents-cbt-specialized-en-(10|[1-9])-[1-6]\]/g) || [];
    expect(ids).toHaveLength(60);
    expect(section).not.toContain('tf-adolescents-cbt-specialized-1-1-he');
    expect(section).not.toContain('tf-adolescents-cbt-core-');
  });
});

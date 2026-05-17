import fs from 'fs';
import path from 'path';
import { describe, expect, it } from 'vitest';

import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { getFilteredForms } from '../../src/pages/TherapeuticForms.jsx';
import { resolveAdolescentsCBTSpecializedEnglishFormByContent } from '../../src/utils/resolveFormIntent.js';

const REPO_ROOT = process.cwd();
const RESOLVER_PATH = path.join(REPO_ROOT, 'src/utils/resolveFormIntent.js');

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
    expect(ALL_FORMS.some((f) => f.id === 'tf-adolescents-cbt-core-en-1-1')).toBe(true);
    expect(ALL_FORMS.some((f) => f.id === 'tf-adolescents-cbt-specialized-1-1-he')).toBe(true);
    expect(ALL_FORMS.some((f) => f.id === 'tf-adolescents-cbt-specialized-en-1-1')).toBe(true);
    const ids = ALL_FORMS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('TherapeuticForms page — canonical language-first filtering', () => {
  it('English adolescents specialized shows exactly 60 forms ordered 1.1–10.6', () => {
    const forms = getFilteredForms({
      audience: 'adolescents',
      category: 'adolescents_cbt_specialized',
      lang: 'en',
    });
    expect(forms).toHaveLength(60);
    expect(forms.map(({ form }) => form.worksheetNumber)).toEqual(worksheetOrder());
  });

  it('each displayed EN specialized card fields come from the same record', () => {
    const forms = getFilteredForms({
      audience: 'adolescents',
      category: 'adolescents_cbt_specialized',
      lang: 'en',
    });
    for (const { form, languageData, language } of forms) {
      expect(language).toBe('en');
      expect(form.language).toBe('en');
      expect(languageData.title).toBe(form.languages.en.title);
      expect(languageData.description ?? null).toBe(form.languages.en.description ?? null);
      expect(languageData.file_url).toBe(form.languages.en.file_url);
      expect(languageData.file_url).toContain('/forms/en/');
    }
  });

  it('strict language separation blocks cross-language fallback', () => {
    const heForms = getFilteredForms({
      audience: 'adolescents',
      category: 'adolescents_cbt_specialized',
      lang: 'he',
    });
    const enForms = getFilteredForms({
      audience: 'adolescents',
      category: 'adolescents_cbt_specialized',
      lang: 'en',
    });
    expect(heForms.every(({ form, language }) => form.language === 'he' && language === 'he')).toBe(true);
    expect(enForms.every(({ form, language }) => form.language === 'en' && language === 'en')).toBe(true);
    expect(heForms.some(({ form }) => form.id.includes('-en-'))).toBe(false);
    expect(enForms.some(({ form }) => form.id.endsWith('-he'))).toBe(false);
  });

  it('non-supported specialized languages do not fallback to en/he', () => {
    for (const lang of ['es', 'fr', 'de', 'it', 'pt']) {
      const forms = getFilteredForms({
        audience: 'adolescents',
        category: 'adolescents_cbt_specialized',
        lang,
      });
      expect(forms).toHaveLength(0);
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
  ])('matches module %s -> %i using therapeutic metadata', (prompt, expectedModule) => {
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
});

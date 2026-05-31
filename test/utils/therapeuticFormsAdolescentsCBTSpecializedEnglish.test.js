import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { ALL_FORMS, resolveFormWithLanguage } from '../../src/data/therapeuticForms/index.js';
import {
  FORMS_ADOLESCENTS_CBT_CORE_EN,
  FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL,
} from '../../src/data/therapeuticForms/forms.adolescents.cbt-core.en.js';
import {
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN,
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS,
} from '../../src/data/therapeuticForms/forms.adolescents.cbt-specialized.en.js';
import {
  resolveFormIntent,
  resolveAdolescentsCBTSpecializedEnglishFormByContent,
} from '../../src/utils/resolveFormIntent.js';

const ROOT = path.resolve(process.cwd());
const SPECIALIZED_SERIES_ID = 'adolescents-cbt-specialized-en';
const SPECIALIZED_SERIES_URL = '/forms/adolescents/en/cbt-specialized/yourcbttrapist_adolescents_cbt_specialized_en_full_series_60_forms_web_optimized_under_25mb.pdf';

describe('therapeuticFormsAdolescentsCBTSpecializedEnglish.test.js', () => {
  it('registers English-only specialized series with master card + modules 01-10', () => {
    const ids = FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN.map((form) => form.id);
    expect(ids).toContain(SPECIALIZED_SERIES_ID);
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS).toHaveLength(10);

    const moduleCodes = FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS.map((form) => form.moduleCode);
    expect(moduleCodes).toEqual(['01', '02', '03', '04', '05', '06', '07', '08', '09', '10']);

    const packageForm = FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN.find((form) => form.id === SPECIALIZED_SERIES_ID);
    expect(packageForm?.type).toBe('workbook_package');
    expect(packageForm?.language).toBe('en');
    expect(packageForm?.fileUrl).toBe(SPECIALIZED_SERIES_URL);
  });

  it('appears in TherapeuticForms only for English locale', () => {
    const specializedForms = ALL_FORMS.filter((form) => form.category === 'adolescents_cbt_specialized');
    // 11 English (series + 10 modules) + 60 Hebrew individual worksheets
    expect(specializedForms).toHaveLength(71);

    const englishResolvable = specializedForms.filter((form) => resolveFormWithLanguage(form.id, 'en'));
    const hebrewResolvable = specializedForms.filter((form) => resolveFormWithLanguage(form.id, 'he'));
    const spanishResolvable = specializedForms.filter((form) => resolveFormWithLanguage(form.id, 'es'));

    // Only the 11 EN forms resolve in English mode
    expect(englishResolvable).toHaveLength(11);
    // 60 Hebrew individual worksheets resolve in Hebrew mode
    expect(hebrewResolvable).toHaveLength(60);
    expect(spanishResolvable).toHaveLength(0);
  });

  it('resolves Open/Download URLs to real PDF files for full series and module PDFs', () => {
    const allSpecialized = FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN;
    for (const form of allSpecialized) {
      const url = form.languages?.en?.file_url;
      expect(url.startsWith('/forms/adolescents/en/cbt-specialized/')).toBe(true);

      const absolute = path.join(ROOT, 'public', url.replace(/^\//, ''));
      expect(fs.existsSync(absolute)).toBe(true);

      const header = fs.readFileSync(absolute).subarray(0, 5).toString('utf8');
      expect(header).toBe('%PDF-');
    }
  });

  it('keeps specialized forms unavailable in non-English language resolution', () => {
    expect(resolveFormWithLanguage(SPECIALIZED_SERIES_ID, 'he')).toBeNull();
    expect(resolveFormWithLanguage(`${SPECIALIZED_SERIES_ID}-module-01`, 'es')).toBeNull();
  });

  it('matches specialized content-aware intents for modules 01-10 in English', () => {
    const expectations = [
      ['test stress and courage ladder', '01'],
      ['low mood and energy reset support', '02'],
      ['self criticism comparison and values', '03'],
      ['friendship conflict and boundaries', '04'],
      ['anger impulsivity and calm-down plan', '05'],
      ['intrusive thoughts urges rituals and new response', '06'],
      ['adhd focus task steps and organization', '07'],
      ['sleep breathing body stress overload', '08'],
      ['trauma safe coping grounding and support circle', '09'],
      ['parents teens trust and family conversation', '10'],
    ];

    for (const [query, moduleCode] of expectations) {
      const metadata = resolveAdolescentsCBTSpecializedEnglishFormByContent(query, { activeLanguage: 'en' });
      expect(metadata?.form_id).toBe(`${SPECIALIZED_SERIES_ID}-module-${moduleCode}`);
      expect(metadata?.language).toBe('en');
      expect(metadata?.category).toBe('adolescents_cbt_specialized');
    }
  });

  it('returns full specialized series only for explicit full-series requests', () => {
    const explicit = resolveAdolescentsCBTSpecializedEnglishFormByContent('Please send the full specialized series (all 60 forms)', { activeLanguage: 'en' });
    const general = resolveAdolescentsCBTSpecializedEnglishFormByContent('I need stress help', { activeLanguage: 'en' });

    expect(explicit?.form_id).toBe(SPECIALIZED_SERIES_ID);
    expect(explicit?.url).toBe(SPECIALIZED_SERIES_URL);
    expect(general?.form_id).toBe(`${SPECIALIZED_SERIES_ID}-module-01`);
  });

  it('never resolves specialized EN content for non-English active language', () => {
    expect(resolveAdolescentsCBTSpecializedEnglishFormByContent('module 06 ocd intrusive thoughts', { activeLanguage: 'he' })).toBeNull();
    expect(resolveAdolescentsCBTSpecializedEnglishFormByContent('full specialized series', { activeLanguage: 'pt' })).toBeNull();
  });

  it('keeps existing adolescents CBT core series intact', () => {
    expect(ALL_FORMS.map((form) => form.id)).toContain('adolescents-cbt-core-en');
    expect(FORMS_ADOLESCENTS_CBT_CORE_EN.find((form) => form.id === 'adolescents-cbt-core-en')).toBeTruthy();
    expect(FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL).toHaveLength(30);

    const coreMetadata = resolveFormIntent('body signals worksheet', 'en');
    expect(coreMetadata?.form_id).toBe('adolescents-cbt-core-en-1-2');
  });
});

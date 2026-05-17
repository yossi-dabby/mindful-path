import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

import {
  ADOLESCENTS_CBT_SPECIALIZED_EN_MANIFEST,
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN,
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL,
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS,
} from '../../src/data/therapeuticForms/forms.adolescents.cbt-specialized.en.js';
import {
  resolveAdolescentsCBTSpecializedEnglishFormByContent,
  resolveFormIntent,
} from '../../src/utils/resolveFormIntent.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';

const REPO_ROOT = process.cwd();
const SPECIALIZED_EN_ROOT = path.join(
  REPO_ROOT,
  'public/forms/en/adolescents/cbt-specialized'
);
const THERAPEUTIC_FORMS_PAGE_PATH = path.join(REPO_ROOT, 'src/pages/TherapeuticForms.jsx');

function idOf(result) {
  return result?.form_id ?? null;
}

function moduleOf(result) {
  const id = idOf(result);
  const match = id?.match(/^tf-adolescents-cbt-specialized-en-(10|[1-9])-[1-6]$/);
  return match ? Number(match[1]) : null;
}

function diskPathFromUrl(fileUrl) {
  return path.join(REPO_ROOT, 'public', String(fileUrl || '').replace(/^\//, ''));
}

describe('Adolescent CBT Specialized EN — registry and assets', () => {
  it('registers 60 specialized individual forms and 10 module PDFs', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL).toHaveLength(60);
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_MODULE_PDFS).toHaveLength(10);
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN).toHaveLength(70);
  });

  it('each module 1-10 contains exactly 6 worksheets (.1-.6)', () => {
    const byModule = FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL.reduce((acc, form) => {
      const module = Number(form.moduleNumber);
      if (!acc.has(module)) acc.set(module, []);
      acc.get(module).push(form.worksheetNumber);
      return acc;
    }, new Map());

    for (let module = 1; module <= 10; module += 1) {
      const worksheetNumbers = (byModule.get(module) || []).sort();
      expect(worksheetNumbers).toEqual([
        `${module}.1`,
        `${module}.2`,
        `${module}.3`,
        `${module}.4`,
        `${module}.5`,
        `${module}.6`,
      ]);
    }
  });

  it('all specialized EN forms include required metadata fields', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL) {
      expect(form.approved).toBe(true);
      expect(form.audience).toBe('adolescents');
      expect(form.language).toBe('en');
      expect(form.ageRange).toBe('12-18');
      expect(form.category).toBe('adolescents_cbt_specialized');
      expect(typeof form.series).toBe('string');
      expect(typeof form.moduleNumber).toBe('number');
      expect(typeof form.moduleTitle).toBe('string');
      expect(typeof form.worksheetNumber).toBe('string');
      expect(typeof form.title).toBe('string');
      expect(typeof form.fileUrl).toBe('string');
      expect(form.fileUrl.startsWith('/forms/en/adolescents/cbt-specialized/')).toBe(true);
      expect(typeof form.therapeuticGoal).toBe('string');
      expect(typeof form.shortContentDescription).toBe('string');
      expect(Array.isArray(form.whenToUse)).toBe(true);
      expect(Array.isArray(form.teenSignals)).toBe(true);
      expect(Array.isArray(form.clinicalKeywords)).toBe(true);
      expect(Array.isArray(form.intentPhrases)).toBe(true);
      expect(Array.isArray(form.notFor)).toBe(true);
      expect(Array.isArray(form.relatedForms)).toBe(true);
      expect(form.languages.en.file_url.startsWith('/forms/en/adolescents/cbt-specialized/')).toBe(true);
    }
  });

  it('target folder, manifest and README exist; all registered files exist and are non-empty', () => {
    expect(fs.existsSync(SPECIALIZED_EN_ROOT)).toBe(true);
    expect(fs.existsSync(path.join(SPECIALIZED_EN_ROOT, 'manifest.adolescents-cbt-specialized-en.json'))).toBe(true);
    expect(fs.existsSync(path.join(SPECIALIZED_EN_ROOT, 'README_EN.md'))).toBe(true);

    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN) {
      const fileUrl = form.languages?.en?.file_url;
      expect(fileUrl, `${form.id} missing en file_url`).toBeTruthy();
      const diskPath = diskPathFromUrl(fileUrl);
      expect(fs.existsSync(diskPath), `${form.id} missing file at ${diskPath}`).toBe(true);
      expect(fs.statSync(diskPath).size, `${form.id} file is empty`).toBeGreaterThan(0);
    }
  });

  it('manifest is canonical source for the 60 English specialized worksheets', () => {
    expect(ADOLESCENTS_CBT_SPECIALIZED_EN_MANIFEST.language).toBe('en');
    expect(ADOLESCENTS_CBT_SPECIALIZED_EN_MANIFEST.audience).toBe('adolescents');
    expect(ADOLESCENTS_CBT_SPECIALIZED_EN_MANIFEST.ageRange).toBe('12-18');
    expect(ADOLESCENTS_CBT_SPECIALIZED_EN_MANIFEST.totalModules).toBe(10);
    expect(ADOLESCENTS_CBT_SPECIALIZED_EN_MANIFEST.totalWorksheets).toBe(60);

    const manifestForms = ADOLESCENTS_CBT_SPECIALIZED_EN_MANIFEST.forms.map((form) => form.fileUrl);
    const registryForms = FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL.map(
      (form) => form.languages.en.file_url
    );
    expect(new Set(manifestForms)).toEqual(new Set(registryForms));
  });

  it('English specialized folder does not include Hebrew worksheet files', () => {
    const pdfFiles = fs.readdirSync(SPECIALIZED_EN_ROOT).filter((name) => name.toLowerCase().endsWith('.pdf'));
    expect(pdfFiles.some((name) => name.includes('-he'))).toBe(false);
  });
});

describe('Adolescent CBT Specialized EN — forms library visibility', () => {
  const pageSource = fs.readFileSync(THERAPEUTIC_FORMS_PAGE_PATH, 'utf8');

  it('therapeutic forms page uses canonical ALL_FORMS only', () => {
    expect(pageSource).toContain('ALL_FORMS.filter');
    expect(pageSource).not.toContain('FORMS_ADOLESCENTS_CBT_SPECIALIZED_EN_INDIVIDUAL');
    expect(pageSource).not.toContain('THERAPEUTIC_FORMS_LIBRARY_REGISTRY');
  });
});

describe('Adolescent CBT Specialized EN — canonical aggregated catalog constraints', () => {
  const canonicalEnSpecialized = ALL_FORMS.filter(
    (form) =>
      form.approved === true &&
      form.audience === 'adolescents' &&
      form.language === 'en' &&
      form.category === 'adolescents_cbt_specialized' &&
      typeof form.worksheetNumber === 'string'
  );

  it('ALL_FORMS contains exactly 60 individual EN adolescent specialized worksheets', () => {
    expect(canonicalEnSpecialized).toHaveLength(60);
  });

  it('ALL_FORMS has no duplicate form IDs', () => {
    const ids = ALL_FORMS.map((form) => form.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('canonical EN adolescent specialized worksheet numbers are exactly 1.1–10.6 in order', () => {
    const worksheetNumbers = canonicalEnSpecialized
      .map((form) => form.worksheetNumber)
      .sort((a, b) => {
        const [am, aw] = a.split('.').map(Number);
        const [bm, bw] = b.split('.').map(Number);
        if (am !== bm) return am - bm;
        return aw - bw;
      });
    const expected = Array.from({ length: 10 }, (_, moduleIdx) =>
      Array.from({ length: 6 }, (_, worksheetIdx) => `${moduleIdx + 1}.${worksheetIdx + 1}`)
    ).flat();
    expect(worksheetNumbers).toEqual(expected);
  });
});

describe('Adolescent CBT Specialized EN — content-aware resolver with language-first rule', () => {
  it('resolves direct form IDs via resolveFormIntent', () => {
    const result = resolveFormIntent('tf-adolescents-cbt-specialized-en-1-3', 'en');
    expect(idOf(result)).toBe('tf-adolescents-cbt-specialized-en-1-3');
  });

  it('A: exam stress/avoidance query maps to module 1', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Teen is anxious before tests and avoids things.',
      { activeLanguage: 'en' }
    );
    expect(moduleOf(result)).toBe(1);
  });

  it('B: low energy/functioning query maps to module 2', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Teen has low energy, mood changes and trouble functioning.',
      { activeLanguage: 'en' }
    );
    expect(moduleOf(result)).toBe(2);
  });

  it('C: self-worth/identity query maps to module 3', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Teen struggles with self-worth, identity and comparison.',
      { activeLanguage: 'en' }
    );
    expect(moduleOf(result)).toBe(3);
  });

  it('D: friends/rejection query maps to module 4', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Teen has trouble with friends, rejection and social media boundaries.',
      { activeLanguage: 'en' }
    );
    expect(moduleOf(result)).toBe(4);
  });

  it('E: anger/impulsivity query maps to module 5', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Teen gets angry quickly and reacts impulsively.',
      { activeLanguage: 'en' }
    );
    expect(moduleOf(result)).toBe(5);
  });

  it('F: OCD/intrusions query maps to module 6', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Teen has intrusive thoughts, checking urges and reassurance loops.',
      { activeLanguage: 'en' }
    );
    expect(moduleOf(result)).toBe(6);
  });

  it('G: ADHD/organization query maps to module 7', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Teen has ADHD, procrastinates and needs help organizing tasks.',
      { activeLanguage: 'en' }
    );
    expect(moduleOf(result)).toBe(7);
  });

  it('H: sleep/body stress query maps to module 8', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Teen has stress in the body, sleep problems and overload.',
      { activeLanguage: 'en' }
    );
    expect(moduleOf(result)).toBe(8);
  });

  it('I: safe coping/grounding query maps to module 9', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Teen needs safe coping, grounding and support after triggers.',
      { activeLanguage: 'en' }
    );
    expect(moduleOf(result)).toBe(9);
  });

  it('J: parent communication query maps to module 10', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Teen and parents need help with communication, boundaries and trust at home.',
      { activeLanguage: 'en' }
    );
    expect(moduleOf(result)).toBe(10);
  });

  it('does not return English specialized forms when active language is Hebrew without explicit English request', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'תן לי טופס CBT למתבגר על חרדה',
      { activeLanguage: 'he' }
    );
    expect(result).toBeNull();
  });

  it('does not return English specialized forms when active language is Spanish without explicit English request', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Necesito una hoja CBT especializada para adolescentes sobre ansiedad',
      { activeLanguage: 'es' }
    );
    expect(result).toBeNull();
  });

  it('allows explicit English request even when active language is Hebrew', () => {
    const result = resolveAdolescentsCBTSpecializedEnglishFormByContent(
      'Please send an English specialized CBT worksheet for teens about anxiety before tests',
      { activeLanguage: 'he', explicitEnglishRequested: true }
    );
    expect(moduleOf(result)).toBe(1);
  });
});

describe('Adolescent CBT Specialized EN — canonical manifest catalog', () => {
  const catalog = buildTherapistFormCatalog(ALL_FORMS);
  const heading = '[ENGLISH ADOLESCENT CBT SPECIALIZED SERIES — CANONICAL MANIFEST]';

  it('catalog includes canonical English adolescent CBT specialized section and metadata guidance', () => {
    expect(catalog).toContain(heading);
    expect(catalog).toContain('Module 1');
    expect(catalog).toContain('[FORM:tf-adolescents-cbt-specialized-en-1-1]');
    expect(catalog).toContain('desc=');
    expect(catalog).toContain('signals=');
    expect(catalog).toContain('keywords=');
    expect(catalog).toContain('intent=');
    expect(catalog).toContain('notFor=');
    expect(catalog).toContain('related=');
    expect(catalog).toContain('Language-first rule');
  });

  it('section contains exactly the 60 manifest worksheet markers and no Hebrew/core mix-ins', () => {
    const section = catalog.slice(catalog.indexOf(heading));
    const ids = section.match(/\[FORM:tf-adolescents-cbt-specialized-en-(10|[1-9])-[1-6]\]/g) || [];
    expect(ids).toHaveLength(60);
    expect(section).not.toContain('tf-adolescents-cbt-specialized-1-1-he');
    expect(section).not.toContain('tf-adolescents-cbt-core-');
  });
});

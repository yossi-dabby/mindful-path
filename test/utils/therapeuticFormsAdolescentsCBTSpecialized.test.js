import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

import {
  ADOLESCENTS_CBT_SPECIALIZED_MANIFEST,
  FORMS_ADOLESCENTS_CBT_SPECIALIZED,
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_INDIVIDUAL,
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_MODULE_PDFS,
  FORMS_ADOLESCENTS_CBT_SPECIALIZED_FULL_PDFS,
} from '../../src/data/therapeuticForms/forms.adolescents.cbt-specialized.js';
import {
  resolveAdolescentsCBTSpecializedFormByContent,
  resolveFormIntent,
} from '../../src/utils/resolveFormIntent.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';

const REPO_ROOT = process.cwd();
const SPECIALIZED_ROOT = path.join(
  REPO_ROOT,
  'public/forms/he/adolescents/cbt-specialized'
);
const THERAPEUTIC_FORMS_PAGE_PATH = path.join(REPO_ROOT, 'src/pages/TherapeuticForms.jsx');

function idOf(result) {
  return result?.form_id ?? null;
}

function moduleOf(result) {
  const id = idOf(result);
  const match = id?.match(/^tf-adolescents-cbt-specialized-(\d+)-\d-he$/);
  return match ? Number(match[1]) : null;
}

function diskPathFromUrl(fileUrl) {
  return path.join(REPO_ROOT, 'public', String(fileUrl || '').replace(/^\//, ''));
}

describe('Adolescent CBT Specialized HE — registry and assets', () => {
  it('registers 60 specialized individual forms, 10 module PDFs, and one full-series PDF', () => {
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_INDIVIDUAL).toHaveLength(60);
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_MODULE_PDFS).toHaveLength(10);
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED_FULL_PDFS).toHaveLength(1);
    expect(FORMS_ADOLESCENTS_CBT_SPECIALIZED).toHaveLength(71);
  });

  it('each module 1-10 contains exactly 6 worksheets (.1-.6)', () => {
    const byModule = FORMS_ADOLESCENTS_CBT_SPECIALIZED_INDIVIDUAL.reduce((acc, form) => {
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

  it('all specialized forms include required metadata fields', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED_INDIVIDUAL) {
      expect(form.approved).toBe(true);
      expect(form.audience).toBe('adolescents');
      expect(form.language).toBe('he');
      expect(form.category).toBe('adolescents_cbt_specialized');
      expect(typeof form.module).toBe('string');
      expect(typeof form.moduleHe).toBe('string');
      expect(typeof form.worksheetNumber).toBe('string');
      expect(typeof form.titleHe).toBe('string');
      expect(typeof form.fileUrl).toBe('string');
      expect(typeof form.therapeuticGoal).toBe('string');
      expect(typeof form.shortContentDescriptionHe).toBe('string');
      expect(typeof form.whenToUse).toBe('string');
      expect(Array.isArray(form.teenSignals)).toBe(true);
      expect(Array.isArray(form.clinicalKeywords)).toBe(true);
      expect(Array.isArray(form.hebrewIntentPhrases)).toBe(true);
      expect(typeof form.notFor).toBe('string');
      expect(Array.isArray(form.relatedForms)).toBe(true);
    }
  });

  it('manifest/readme/qa and all registered file URLs exist on disk', () => {
    expect(fs.existsSync(SPECIALIZED_ROOT)).toBe(true);
    expect(fs.existsSync(path.join(SPECIALIZED_ROOT, 'manifest.adolescents-cbt-specialized-he.json'))).toBe(true);
    expect(fs.existsSync(path.join(SPECIALIZED_ROOT, 'README_HE.md'))).toBe(true);
    expect(fs.existsSync(path.join(SPECIALIZED_ROOT, 'QA_SUMMARY.txt'))).toBe(true);

    for (const form of FORMS_ADOLESCENTS_CBT_SPECIALIZED) {
      const fileUrl = form.languages?.he?.file_url;
      expect(fileUrl, `${form.id} missing he file_url`).toBeTruthy();
      expect(fs.existsSync(diskPathFromUrl(fileUrl)), `${form.id} missing file`).toBe(true);
    }
  });

  it('manifest is the canonical source for the 60 worksheet entries', () => {
    expect(ADOLESCENTS_CBT_SPECIALIZED_MANIFEST.audience).toBe('adolescents');
    expect(ADOLESCENTS_CBT_SPECIALIZED_MANIFEST.ageRange).toBe('12-18');
    expect(ADOLESCENTS_CBT_SPECIALIZED_MANIFEST.language).toBe('he');
    expect(ADOLESCENTS_CBT_SPECIALIZED_MANIFEST.moduleCount).toBe(10);
    expect(ADOLESCENTS_CBT_SPECIALIZED_MANIFEST.worksheetCount).toBe(60);

    const manifestForms = ADOLESCENTS_CBT_SPECIALIZED_MANIFEST.modules.flatMap((moduleEntry) =>
      moduleEntry.forms.map((form) => form.fileName)
    );
    const registryForms = FORMS_ADOLESCENTS_CBT_SPECIALIZED_INDIVIDUAL.map(
      (form) => form.languages.he.file_name
    );
    expect(new Set(manifestForms)).toEqual(new Set(registryForms));
  });
});

describe('Adolescent CBT Specialized HE — forms library visibility', () => {
  const pageSource = fs.readFileSync(THERAPEUTIC_FORMS_PAGE_PATH, 'utf8');

  it('therapeutic forms page does not bolt-on adolescent specialized side registries', () => {
    expect(pageSource).toContain('ALL_FORMS.filter');
    expect(pageSource).not.toContain('FORMS_ADOLESCENTS_CBT_SPECIALIZED_INDIVIDUAL');
    expect(pageSource).not.toContain('THERAPEUTIC_FORMS_LIBRARY_REGISTRY');
  });
});

describe('Adolescent CBT Specialized HE — content-aware resolver', () => {
  it('resolves direct form IDs via resolveFormIntent', () => {
    const result = resolveFormIntent('tf-adolescents-cbt-specialized-1-3-he', 'he');
    expect(idOf(result)).toBe('tf-adolescents-cbt-specialized-1-3-he');
  });

  it('A: exam stress/avoidance query maps to module 1', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('נערה בלחץ לפני מבחן ומתחילה להימנע מללמוד');
    expect(moduleOf(result)).toBe(1);
    expect(['tf-adolescents-cbt-specialized-1-3-he', 'tf-adolescents-cbt-specialized-1-4-he', 'tf-adolescents-cbt-specialized-1-5-he']).toContain(idOf(result));
  });

  it('B: low energy / small actions query maps to module 2', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('מתבגר בלי אנרגיה ולא מצליח להתחיל פעולות קטנות');
    expect(moduleOf(result)).toBe(2);
  });

  it('C: self-worth/comparison query maps to module 3', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('נערה משווה את עצמה לאחרים ואומרת שהיא לא שווה');
    expect(moduleOf(result)).toBe(3);
  });

  it('D: social rejection/boundaries query maps to module 4', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('נער מרגיש דחוי ומתקשה עם גבולות מול חברים');
    expect(moduleOf(result)).toBe(4);
  });

  it('E: anger/repair query maps to module 5', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('מתבגר מתפרץ בכעס ואז מתחרט');
    expect(moduleOf(result)).toBe(5);
  });

  it('F: OCD/intrusions query maps to module 6 without child fallback', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('נערה עם מחשבות חודרניות ודחף לבדוק שוב ושוב');
    expect(moduleOf(result)).toBe(6);
  });

  it('G: ADHD/time planning query maps to module 7', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('נער בן 16 מוסח כל הזמן, דוחה משימות ולא מצליח לארגן זמן');
    expect(moduleOf(result)).toBe(7);
  });

  it('H: sleep/body/breathing query maps to module 8', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('מתבגרת לא ישנה טוב, מרגישה לחץ בגוף וצריכה נשימות');
    expect(moduleOf(result)).toBe(8);
  });

  it('I: safe place/grounding/support query maps to module 9', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('נערה צריכה מקום בטוח, קרקוע ותמיכה אחרי תקופה קשה');
    expect(moduleOf(result)).toBe(9);
  });

  it('J: parents and teens query maps to module 10', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('הורים ומתבגר צריכים לשפר תקשורת בבית ולקבוע גבולות בצורה רגועה');
    expect(moduleOf(result)).toBe(10);
  });

  it('L: child query does not force adolescent specialized forms', () => {
    const result = resolveAdolescentsCBTSpecializedFormByContent('ילד בן 8 עם פחדים');
    expect(result).toBeNull();
  });
});

describe('Adolescent CBT Specialized HE — canonical manifest catalog', () => {
  const catalog = buildTherapistFormCatalog(ALL_FORMS);
  const heading = '[HEBREW ADOLESCENT CBT SPECIALIZED — CANONICAL MANIFEST]';

  it('catalog includes a canonical adolescent specialized manifest section', () => {
    expect(catalog).toContain(heading);
    expect(catalog).toContain('מודול 1 — חרדה, לחץ ופחדים');
    expect(catalog).toContain('[FORM:tf-adolescents-cbt-specialized-1-3-he]');
    expect(catalog).toContain('desc=מזהים מה קורה לי לפני מבחן ומה יעזור לי להתכונן.');
    expect(catalog).toContain('signals=');
    expect(catalog).toContain('keywords=');
    expect(catalog).toContain('intent=');
    expect(catalog).toContain('notFor=');
    expect(catalog).toContain('related=');
  });

  it('K: the canonical section contains exactly the 60 manifest worksheet markers and no children/core mix-ins', () => {
    const section = catalog.slice(catalog.indexOf(heading));
    const ids = section.match(/\[FORM:tf-adolescents-cbt-specialized-\d+-\d-he\]/g) || [];
    expect(ids).toHaveLength(60);
    expect(section).not.toContain('tf-children-cbt');
    expect(section).not.toContain('tf-adolescents-anxiety-thought-record');

    for (const moduleEntry of ADOLESCENTS_CBT_SPECIALIZED_MANIFEST.modules) {
      for (const form of moduleEntry.forms) {
        expect(section).toContain(form.titleHe);
      }
    }
  });
});

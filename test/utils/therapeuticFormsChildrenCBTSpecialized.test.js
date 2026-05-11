import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';

import {
  FORMS_CHILDREN_CBT_SPECIALIZED,
  FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL,
  FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS,
  FORMS_CHILDREN_CBT_SPECIALIZED_FULL_PDFS,
} from '../../src/data/therapeuticForms/forms.children.cbt-specialized.js';
import {
  resolveChildrenCBTSpecializedFormByContent,
  resolveChildrenCBTPremiumFormByContent,
  resolveFormIntent,
} from '../../src/utils/resolveFormIntent.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';

const REPO_ROOT = process.cwd();
const SPECIALIZED_MANIFEST_ROOT = path.join(
  REPO_ROOT,
  'public/forms/he/children/cbt-specialized'
);

function idOf(result) {
  return result?.form_id ?? null;
}

function packOf(result) {
  const id = idOf(result);
  const match = id?.match(/^tf-children-cbt-specialized-(\d)-\d-he$/);
  return match ? Number(match[1]) : null;
}

function diskPathFromUrl(fileUrl) {
  return path.join(REPO_ROOT, 'public', String(fileUrl || '').replace(/^\//, ''));
}

describe('Children CBT Specialized HE — registry and assets', () => {
  it('registers 54 specialized individual forms', () => {
    expect(FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL).toHaveLength(54);
  });

  it('all specialized forms are approved and include required metadata fields', () => {
    for (const form of FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL) {
      expect(form.isApproved).toBe(true);
      expect(form.approved).toBe(true);
      expect(typeof form.id).toBe('string');
      expect(form.audience).toBe('children');
      expect(form.language).toBe('he');
      expect(typeof form.domain).toBe('string');
      expect(typeof form.displayNumber).toBe('string');
      expect(typeof form.titleHe).toBe('string');
      expect(typeof form.fileUrl).toBe('string');
      expect(typeof form.therapeuticGoal).toBe('string');
      expect(typeof form.shortContentDescriptionHe).toBe('string');
      expect(typeof form.whenToUse).toBe('string');
      expect(Array.isArray(form.childSignals)).toBe(true);
      expect(Array.isArray(form.clinicalKeywords)).toBe(true);
      expect(Array.isArray(form.hebrewIntentPhrases)).toBe(true);
      expect(typeof form.notFor).toBe('string');
      expect(Array.isArray(form.relatedCoreForms)).toBe(true);
      expect(typeof form.packNumber).toBe('number');
    }
  });

  it('every registered specialized file_url exists on disk', () => {
    for (const form of FORMS_CHILDREN_CBT_SPECIALIZED) {
      const fileUrl = form.languages?.he?.file_url;
      expect(fileUrl, `${form.id} missing he file_url`).toBeTruthy();
      const diskPath = diskPathFromUrl(fileUrl);
      expect(fs.existsSync(diskPath), `${form.id} missing file at ${diskPath}`).toBe(true);
    }
  });

  it('manifest files exist and are used as canonical source', () => {
    const packs16 = path.join(SPECIALIZED_MANIFEST_ROOT, 'manifest.children-cbt-specialized-packs-1-6-he.json');
    const packs79 = path.join(SPECIALIZED_MANIFEST_ROOT, 'manifest.children-cbt-specialized-packs-7-9-he.json');
    const combined = path.join(SPECIALIZED_MANIFEST_ROOT, 'manifest.children-cbt-specialized-he.json');
    expect(fs.existsSync(packs16)).toBe(true);
    expect(fs.existsSync(packs79)).toBe(true);
    expect(fs.existsSync(combined)).toBe(true);

    const data = JSON.parse(fs.readFileSync(combined, 'utf8'));
    const manifestForms = data.packs.flatMap((p) => p.forms.map((f) => f.fileName));
    const registryForms = FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL.map(
      (f) => f.languages.he.file_name
    );
    expect(new Set(manifestForms)).toEqual(new Set(registryForms));
  });

  it('no specialized file_url uses stale placeholder naming patterns', () => {
    for (const form of FORMS_CHILDREN_CBT_SPECIALIZED) {
      const fileUrl = form.languages?.he?.file_url || '';
      expect(fileUrl).not.toContain('placeholder');
      expect(fileUrl).not.toContain('children-cbt-stage-');
    }
  });

  it('registers available domain PDFs and zero full-series specialized PDFs when not present', () => {
    expect(FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS.length).toBeGreaterThanOrEqual(1);
    expect(FORMS_CHILDREN_CBT_SPECIALIZED_FULL_PDFS).toHaveLength(0);
  });
});

describe('Children CBT Specialized HE — content-aware resolver', () => {
  it('exact title matching resolves correct form', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('תשלח לי את 7.3 — מה עוזר לי להתרכז');
    expect(idOf(result)).toBe('tf-children-cbt-specialized-7-3-he');
  });

  it('anxiety/fears query maps to pack 1', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('ילד מפחד ללכת לבית הספר ונמנע מדברים שמפחידים אותו');
    expect(packOf(result)).toBe(1);
  });

  it('anger query maps to pack 2', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('ילד מתפרץ, צועק ואז מתחרט');
    expect(packOf(result)).toBe(2);
  });

  it('ocd query maps to pack 3', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('ילדה מרגישה שהיא חייבת לבדוק שוב ושוב כדי להירגע');
    expect(packOf(result)).toBe(3);
  });

  it('social/self-esteem query maps to pack 4', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('ילד חושב שלא אוהבים אותו ומתקשה עם חברים');
    expect(packOf(result)).toBe(4);
  });

  it('low mood query maps to pack 5', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('ילד בלי כוח וקשה לו להתחיל משהו קטן');
    expect(packOf(result)).toBe(5);
  });

  it('trauma/safety query maps to pack 6', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('ילד נזכר במשהו קשה וצריך להרגיש בטוח עכשיו');
    expect(packOf(result)).toBe(6);
  });

  it('ADHD query maps to pack 7 (prefer 7.3)', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('ילד עם ADHD מתקשה להתרכז וצריך הפסקות קצרות ותזכורות');
    expect(idOf(result)).toBe('tf-children-cbt-specialized-7-3-he');
  });

  it('body-emotion query maps to pack 8', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('ילדה כואבת לה הבטן כשהיא בלחץ וצריך להבין מה הגוף אומר');
    expect(['tf-children-cbt-specialized-8-1-he', 'tf-children-cbt-specialized-8-2-he']).toContain(idOf(result));
  });

  it('parent guidance query maps to pack 9', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('הורה רוצה לדעת איך להגיב כשהילד מתקשה בלי להיכנס למאבק כוח');
    expect(packOf(result)).toBe(9);
  });

  it('full domain request returns domain PDF when available', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('תשלח לי את כל מנה 1');
    expect(idOf(result)).toBe('tf-children-cbt-specialized-pack-1-he');
  });

  it('full series request returns null when no full series PDF exists', () => {
    const result = resolveChildrenCBTSpecializedFormByContent('תשלח לי את כל סדרת הטפסים הייעודיים לילדים בעברית');
    expect(result).toBeNull();
  });

  it('no proactive attachment for generic emotional statement', () => {
    expect(resolveChildrenCBTSpecializedFormByContent('אני עצוב היום')).toBeNull();
    expect(resolveChildrenCBTSpecializedFormByContent('הילד שלי מתקשה')).toBeNull();
  });
});

describe('Children CBT Specialized HE — canonical list and regressions', () => {
  it('AI catalog includes canonical specialized manifest section', () => {
    const catalog = buildTherapistFormCatalog(ALL_FORMS);
    expect(catalog).toContain('HEBREW CHILDREN CBT SPECIALIZED — CANONICAL MANIFEST');
    expect(catalog).toContain('מנה 7 — ADHD — קשב, ארגון ואימפולסיביות');
    expect(catalog).toContain('7.3 — מה עוזר לי להתרכז');
  });

  it('existing core locked children CBT resolver still works', () => {
    const result = resolveChildrenCBTPremiumFormByContent('תשלח לי טופס 6.3 לילד');
    expect(idOf(result)).toBe('tf-children-cbt-stage-6-3-premium-he');
  });

  it('adult/adolescent mappings still resolve', () => {
    const adult = resolveFormIntent('thought-record', 'en');
    const teen = resolveFormIntent('teen-anxiety-worksheet', 'en');
    expect(adult?.audience).toBe('adults');
    expect(teen?.audience).toBe('adolescents');
  });
});

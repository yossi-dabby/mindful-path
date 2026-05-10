/**
 * Tests for Hebrew Children CBT Premium Series — Registry, Assets, and Intent Resolution
 *
 * Requirements tested per problem statement:
 *  1.  All 30 approved Hebrew children individual PDFs are registered.
 *  2.  The full Hebrew children workbook/series PDF is registered.
 *  3.  Each registered form points to an existing file under public/forms/he/children/cbt-premium-locked/.
 *  4.  The forms appear under the children audience.
 *  5.  The forms are Hebrew-only (no English / multilingual blocks).
 *  6.  Exact Hebrew titles resolve to the correct form.
 *  7.  Hebrew content-aware aliases resolve to the correct form.
 *  8.  Stage-level requests resolve to the correct stage intro or relevant sub-form.
 *  9.  Single worksheet requests return a single worksheet, not the full workbook.
 * 10.  Workbook/series requests return the full series PDF, not one random single worksheet.
 * 11.  Existing 18 standard forms still resolve correctly.
 * 12.  Existing adult workbook behavior remains intact.
 * 13.  Open/download behavior still works (forms have valid file_urls).
 * 14.  Build succeeds (verified separately via npm run build).
 * 15.  Lint has no new errors in changed files (verified separately).
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import {
  resolveFormIntent,
  APPROVED_FORM_INTENT_MAP,
} from '../../src/utils/resolveFormIntent.js';
import {
  resolveFormWithLanguage,
  listFormsByAudience,
  listFormsByAudienceAndCategory,
} from '../../src/data/therapeuticForms/resolveTherapeuticForms.js';
import {
  resolveChildrenHeWorkbookIntent,
} from '../../src/utils/resolveWorkbookIntent.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '../..');
const PUBLIC = path.join(ROOT, 'public');
const LOCKED_FOLDER = path.join(PUBLIC, 'forms/he/children/cbt-premium-locked');

// ─── Computed sets ────────────────────────────────────────────────────────────

const CHILDREN_PREMIUM_INDIVIDUAL = ALL_FORMS.filter(
  f => f.approved && f.audience === 'children' && f.category === 'children_cbt_process'
);

const CHILDREN_SERIES = ALL_FORMS.filter(
  f => f.approved && f.audience === 'children' && f.category === 'workbook_series'
    && f.id.includes('children-cbt-series')
);

// ─── 1. All 30 approved individual PDFs are registered ───────────────────────

describe('Children CBT Premium — 1. All 30 individual PDFs are registered', () => {
  it('exactly 30 individual Hebrew children CBT premium forms exist', () => {
    expect(CHILDREN_PREMIUM_INDIVIDUAL.length).toBe(30);
  });

  it('stage intro forms 1–6 are registered (6 forms)', () => {
    const stageIntros = CHILDREN_PREMIUM_INDIVIDUAL.filter(f =>
      /^tf-children-cbt-stage-[1-6]-premium-he$/.test(f.id)
    );
    expect(stageIntros.length).toBe(6);
  });

  it('sub-stage forms 1.1–6.4 are registered (24 forms)', () => {
    const subStages = CHILDREN_PREMIUM_INDIVIDUAL.filter(f =>
      /^tf-children-cbt-stage-[1-6]-[1-4]-premium-he$/.test(f.id)
    );
    expect(subStages.length).toBe(24);
  });

  it('all 30 forms are approved', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL) {
      expect(form.approved, `${form.id} must be approved`).toBe(true);
    }
  });

  it('all 30 forms have a valid Hebrew language block', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL) {
      const heBlock = form.languages?.he;
      expect(heBlock, `${form.id} must have a Hebrew block`).toBeTruthy();
      expect(heBlock.file_url, `${form.id} he.file_url must be non-empty`).toBeTruthy();
      expect(heBlock.file_type, `${form.id} he.file_type must be pdf`).toBe('pdf');
      expect(heBlock.title, `${form.id} he.title must be non-empty`).toBeTruthy();
    }
  });
});

// ─── 2. Full series PDF is registered ────────────────────────────────────────

describe('Children CBT Premium — 2. Full series PDF is registered', () => {
  it('exactly one full children CBT series workbook is registered', () => {
    expect(CHILDREN_SERIES.length).toBe(1);
  });

  it('series workbook ID is tf-children-cbt-series-premium-he', () => {
    expect(CHILDREN_SERIES[0].id).toBe('tf-children-cbt-series-premium-he');
  });

  it('series workbook has type therapeutic_workbook or category workbook_series', () => {
    const s = CHILDREN_SERIES[0];
    expect(s.category).toBe('workbook_series');
  });

  it('series workbook has a valid Hebrew language block with correct file_url', () => {
    const s = CHILDREN_SERIES[0];
    const heBlock = s.languages?.he;
    expect(heBlock).toBeTruthy();
    expect(heBlock.file_url).toBe('/forms/he/children/cbt-premium-locked/children-cbt-series-premium-he.pdf');
    expect(heBlock.file_type).toBe('pdf');
  });

  it('series workbook is approved', () => {
    expect(CHILDREN_SERIES[0].approved).toBe(true);
  });
});

// ─── 3. All registered forms point to existing files on disk ─────────────────

describe('Children CBT Premium — 3. All file_urls point to existing files on disk', () => {
  it('locked folder exists under public/', () => {
    expect(fs.existsSync(LOCKED_FOLDER)).toBe(true);
  });

  it('all 30 individual form HE file_urls point to existing files', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL) {
      const fileUrl = form.languages?.he?.file_url;
      expect(fileUrl, `${form.id} must have he.file_url`).toBeTruthy();
      const diskPath = path.join(PUBLIC, fileUrl.replace(/^\//, ''));
      expect(
        fs.existsSync(diskPath),
        `Missing on disk: ${diskPath}`
      ).toBe(true);
    }
  });

  it('all individual form PDFs are at least 10 KB', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL) {
      const fileUrl = form.languages?.he?.file_url;
      if (!fileUrl) continue;
      const diskPath = path.join(PUBLIC, fileUrl.replace(/^\//, ''));
      if (!fs.existsSync(diskPath)) continue;
      const size = fs.statSync(diskPath).size;
      expect(
        size,
        `${form.id} PDF is too small (${size} bytes) — expected at least 10KB`
      ).toBeGreaterThan(10_000);
    }
  });

  it('series workbook HE file_url points to existing file on disk', () => {
    const s = CHILDREN_SERIES[0];
    const fileUrl = s.languages?.he?.file_url;
    expect(fileUrl).toBeTruthy();
    const diskPath = path.join(PUBLIC, fileUrl.replace(/^\//, ''));
    expect(fs.existsSync(diskPath)).toBe(true);
  });

  it('all form file_urls follow the /forms/he/children/cbt-premium-locked/ pattern', () => {
    const allForms = [...CHILDREN_PREMIUM_INDIVIDUAL, ...CHILDREN_SERIES];
    for (const form of allForms) {
      const heUrl = form.languages?.he?.file_url;
      expect(
        heUrl,
        `${form.id} must have a he.file_url`
      ).toMatch(/^\/forms\/he\/children\/cbt-premium-locked\/.+\.pdf$/);
    }
  });
});

// ─── 4. Forms appear under children audience ──────────────────────────────────

describe('Children CBT Premium — 4. Forms appear under children audience', () => {
  it('listFormsByAudience("children") returns at least 31 forms', () => {
    const childForms = listFormsByAudience('children');
    expect(childForms.length).toBeGreaterThanOrEqual(31);
  });

  it('listFormsByAudienceAndCategory returns all 30 individual forms', () => {
    const forms = listFormsByAudienceAndCategory('children', 'children_cbt_process');
    expect(forms.length).toBe(30);
  });

  it('all 30 individual forms have audience: children', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL) {
      expect(form.audience).toBe('children');
    }
  });

  it('series workbook has audience: children', () => {
    expect(CHILDREN_SERIES[0].audience).toBe('children');
  });
});

// ─── 5. Hebrew-only (no English blocks) ──────────────────────────────────────

describe('Children CBT Premium — 5. Hebrew-only forms (no English blocks)', () => {
  it('no individual form has an English language block', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL) {
      expect(
        form.languages?.en,
        `${form.id} must not have an English block`
      ).toBeUndefined();
    }
  });

  it('resolveFormWithLanguage in English returns null for children premium forms', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL) {
      const resolved = resolveFormWithLanguage(form.id, 'en');
      expect(resolved, `${form.id} must return null when requested in English`).toBeNull();
    }
  });

  it('resolveFormWithLanguage in Hebrew returns valid result', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL) {
      const resolved = resolveFormWithLanguage(form.id, 'he');
      expect(resolved, `${form.id} must resolve in Hebrew`).not.toBeNull();
      expect(resolved.language).toBe('he');
      expect(resolved.languageData.file_url).toBeTruthy();
    }
  });
});

// ─── 6. Exact Hebrew titles resolve to correct form ──────────────────────────

describe('Children CBT Premium — 6. Exact Hebrew titles resolve to correct forms', () => {
  const EXACT_TITLE_MAP = {
    'tf-children-cbt-stage-1-1-premium-he': '1.1 — מי אני ומה חשוב לי?',
    'tf-children-cbt-stage-1-2-premium-he': '1.2 — מתי קשה לי?',
    'tf-children-cbt-stage-1-3-premium-he': '1.3 — מה אני עושה כשקשה לי?',
    'tf-children-cbt-stage-1-4-premium-he': '1.4 — כמה זה קורה לי וכמה זה מפריע לי?',
    'tf-children-cbt-stage-2-1-premium-he': '2.1 — מה היה רגע לפני?',
    'tf-children-cbt-stage-2-2-premium-he': '2.2 — מה הראש אמר לי?',
    'tf-children-cbt-stage-2-3-premium-he': '2.3 — מה הרגשתי בגוף?',
    'tf-children-cbt-stage-2-4-premium-he': '2.4 — מה עשיתי אחר כך?',
    'tf-children-cbt-stage-3-1-premium-he': '3.1 — תפסתי מחשבה!',
    'tf-children-cbt-stage-3-2-premium-he': '3.2 — מחשבה או עובדה?',
    'tf-children-cbt-stage-3-3-premium-he': '3.3 — בלש המחשבות שלי',
    'tf-children-cbt-stage-3-4-premium-he': '3.4 — מחשבה חדשה שעוזרת לי',
    'tf-children-cbt-stage-4-1-premium-he': '4.1 — סולם האומץ שלי',
    'tf-children-cbt-stage-4-2-premium-he': '4.2 — הצעד הקטן שלי',
    'tf-children-cbt-stage-4-3-premium-he': '4.3 — ניסוי אמיץ',
    'tf-children-cbt-stage-4-4-premium-he': '4.4 — מה מפעיל אותי?',
    'tf-children-cbt-stage-5-1-premium-he': '5.1 — כלים שמרגיעים את הגוף שלי',
    'tf-children-cbt-stage-5-2-premium-he': '5.2 — משפטים שעוזרים לי',
    'tf-children-cbt-stage-5-3-premium-he': '5.3 — איך אני מבקש/ת עזרה?',
    'tf-children-cbt-stage-5-4-premium-he': '5.4 — איך מתקנים קשר?',
    'tf-children-cbt-stage-6-1-premium-he': '6.1 — מה למדתי על עצמי?',
    'tf-children-cbt-stage-6-2-premium-he': '6.2 — מתי עלול להיות לי שוב קשה?',
    'tf-children-cbt-stage-6-3-premium-he': '6.3 — כרטיס הכוח שלי',
    'tf-children-cbt-stage-6-4-premium-he': '6.4 — אני ממשיך/ה לבד — עם הכלים שלי',
  };

  for (const [formId, expectedTitle] of Object.entries(EXACT_TITLE_MAP)) {
    it(`form ${formId} has correct Hebrew title`, () => {
      const form = ALL_FORMS.find(f => f.id === formId);
      expect(form, `${formId} must exist in registry`).toBeTruthy();
      expect(form.languages?.he?.title).toBe(expectedTitle);
    });
  }
});

// ─── 7. Hebrew content-aware aliases resolve to correct forms ─────────────────

describe('Children CBT Premium — 7. Hebrew aliases resolve to correct forms', () => {
  const ALIAS_MAP = [
    // Stage 1 aliases
    ['היכרות ילד',              'tf-children-cbt-stage-1-premium-he'],
    ['הערכה ילד',               'tf-children-cbt-stage-1-premium-he'],
    ['בניית אמון ילד',          'tf-children-cbt-stage-1-premium-he'],
    ['תחילת טיפול עם ילד',      'tf-children-cbt-stage-1-premium-he'],
    ['להכיר את הילד',           'tf-children-cbt-stage-1-premium-he'],
    ['מה חשוב לילד',            'tf-children-cbt-stage-1-1-premium-he'],
    ['מתי קשה לילד',            'tf-children-cbt-stage-1-2-premium-he'],
    ['מה הילד עושה כשקשה לו',   'tf-children-cbt-stage-1-3-premium-he'],
    // Stage 2 aliases
    ['המפה שלי ילד',            'tf-children-cbt-stage-2-premium-he'],
    ['מפת הקושי ילד',           'tf-children-cbt-stage-2-premium-he'],
    ['מעגל הקושי ילד',          'tf-children-cbt-stage-2-premium-he'],
    ['מה היה רגע לפני ילד',     'tf-children-cbt-stage-2-1-premium-he'],
    ['טריגר ילד',               'tf-children-cbt-stage-2-1-premium-he'],
    ['מה הראש אמר לי ילד',      'tf-children-cbt-stage-2-2-premium-he'],
    ['מה הרגשתי בגוף ילד',      'tf-children-cbt-stage-2-3-premium-he'],
    ['מה עשיתי אחר כך ילד',     'tf-children-cbt-stage-2-4-premium-he'],
    // Stage 3 aliases
    ['עובדים על המחשבות ילד',   'tf-children-cbt-stage-3-premium-he'],
    ['תפסתי מחשבה ילד',         'tf-children-cbt-stage-3-1-premium-he'],
    ['מחשבה או עובדה ילד',      'tf-children-cbt-stage-3-2-premium-he'],
    ['לבדוק מחשבה ילד',         'tf-children-cbt-stage-3-2-premium-he'],
    ['ראיות בעד ונגד ילד',      'tf-children-cbt-stage-3-2-premium-he'],
    ['בלש מחשבות ילד',          'tf-children-cbt-stage-3-3-premium-he'],
    ['מחשבה חדשה ילד',          'tf-children-cbt-stage-3-4-premium-he'],
    // Stage 4 aliases
    ['עבודה התנהגותית ילד',     'tf-children-cbt-stage-4-premium-he'],
    ['חשיפה ילד',               'tf-children-cbt-stage-4-premium-he'],
    ['סולם אומץ ילד',           'tf-children-cbt-stage-4-1-premium-he'],
    ['סולם האומץ שלי',          'tf-children-cbt-stage-4-1-premium-he'],
    ['הצעד הקטן שלי ילד',       'tf-children-cbt-stage-4-2-premium-he'],
    ['ניסוי אמיץ ילד',          'tf-children-cbt-stage-4-3-premium-he'],
    ['מה מפעיל אותי ילד',       'tf-children-cbt-stage-4-4-premium-he'],
    // Stage 5 aliases
    ['ארגז כלים ילד',           'tf-children-cbt-stage-5-premium-he'],
    ['כלים להרגעה ילד',         'tf-children-cbt-stage-5-1-premium-he'],
    ['משפטים שעוזרים ילד',      'tf-children-cbt-stage-5-2-premium-he'],
    ['בקשת עזרה ילד',           'tf-children-cbt-stage-5-3-premium-he'],
    ['תיקון קשר ילד',           'tf-children-cbt-stage-5-4-premium-he'],
    // Stage 6 aliases
    ['סיום טיפול ילד',          'tf-children-cbt-stage-6-premium-he'],
    ['שימור הישגים ילד',        'tf-children-cbt-stage-6-premium-he'],
    ['מה למדתי על עצמי ילד',    'tf-children-cbt-stage-6-1-premium-he'],
    ['כרטיס כוח ילד',           'tf-children-cbt-stage-6-3-premium-he'],
    ['להמשיך לבד ילד',          'tf-children-cbt-stage-6-4-premium-he'],
    // Series aliases
    ['סדרת ילדים',              'tf-children-cbt-series-premium-he'],
    ['סדרת cbt לילדים',         'tf-children-cbt-series-premium-he'],
    ['חוברת ילדים',             'tf-children-cbt-series-premium-he'],
    ['קונטרס ילדים',            'tf-children-cbt-series-premium-he'],
    ['כל שלבי הילדים',          'tf-children-cbt-series-premium-he'],
    ['כל הטפסים לילדים',        'tf-children-cbt-series-premium-he'],
    ['סט מלא לילדים',           'tf-children-cbt-series-premium-he'],
    ['children cbt workbook',    'tf-children-cbt-series-premium-he'],
    ['children worksheet series','tf-children-cbt-series-premium-he'],
    ['full children cbt series', 'tf-children-cbt-series-premium-he'],
  ];

  for (const [alias, expectedId] of ALIAS_MAP) {
    it(`alias "${alias}" resolves to ${expectedId}`, () => {
      const meta = resolveFormIntent(alias, 'he');
      expect(meta, `"${alias}" should resolve`).not.toBeNull();
      expect(meta.form_id).toBe(expectedId);
    });
  }
});

// ─── 8. Stage-level requests resolve to correct stage intro ──────────────────

describe('Children CBT Premium — 8. Stage-level requests resolve correctly', () => {
  const STAGE_IDS = [
    'tf-children-cbt-stage-1-premium-he',
    'tf-children-cbt-stage-2-premium-he',
    'tf-children-cbt-stage-3-premium-he',
    'tf-children-cbt-stage-4-premium-he',
    'tf-children-cbt-stage-5-premium-he',
    'tf-children-cbt-stage-6-premium-he',
  ];

  for (const stageId of STAGE_IDS) {
    it(`${stageId} resolves by canonical ID`, () => {
      const meta = resolveFormIntent(stageId, 'he');
      expect(meta).not.toBeNull();
      expect(meta.form_id).toBe(stageId);
      expect(meta.language).toBe('he');
      expect(meta.url).toMatch(/^\/forms\/he\/children\/cbt-premium-locked\//);
    });
  }

  it('שלב ראשון ילד resolves to stage 1 intro', () => {
    const meta = resolveFormIntent('שלב ראשון ילד', 'he');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-stage-1-premium-he');
  });

  it('שלב שני ילד resolves to stage 2 intro', () => {
    const meta = resolveFormIntent('שלב שני ילד', 'he');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-stage-2-premium-he');
  });

  it('שלב שלישי ילד resolves to stage 3 intro', () => {
    const meta = resolveFormIntent('שלב שלישי ילד', 'he');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-stage-3-premium-he');
  });
});

// ─── 9. Single worksheet request returns worksheet, not series ────────────────

describe('Children CBT Premium — 9. Single worksheet intent returns worksheet, not series', () => {
  it('מחשבה או עובדה ילד returns a worksheet (stage 3.2), not the series', () => {
    const meta = resolveFormIntent('מחשבה או עובדה ילד', 'he');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-stage-3-2-premium-he');
    expect(meta.form_id).not.toBe('tf-children-cbt-series-premium-he');
  });

  it('ניסוי אמיץ ילד returns a worksheet (stage 4.3), not the series', () => {
    const meta = resolveFormIntent('ניסוי אמיץ ילד', 'he');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-stage-4-3-premium-he');
    expect(meta.form_id).not.toBe('tf-children-cbt-series-premium-he');
  });

  it('canonical stage ID resolves to that specific stage, not the series', () => {
    const meta = resolveFormIntent('tf-children-cbt-stage-5-premium-he', 'he');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-stage-5-premium-he');
    expect(meta.form_id).not.toBe('tf-children-cbt-series-premium-he');
  });
});

// ─── 10. Workbook/series request returns full series ─────────────────────────

describe('Children CBT Premium — 10. Workbook/series request returns full series PDF', () => {
  it('חוברת ילדים resolves to series', () => {
    const meta = resolveFormIntent('חוברת ילדים', 'he');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-series-premium-he');
  });

  it('כל הטפסים לילדים resolves to series', () => {
    const meta = resolveFormIntent('כל הטפסים לילדים', 'he');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-series-premium-he');
  });

  it('series intent returns a URL pointing to the series PDF (not a single worksheet)', () => {
    const meta = resolveFormIntent('tf-children-cbt-series-premium-he', 'he');
    expect(meta).not.toBeNull();
    expect(meta.url).toContain('children-cbt-series-premium-he.pdf');
  });

  it('resolveChildrenHeWorkbookIntent returns series for "חוברת ילדים"', () => {
    const meta = resolveChildrenHeWorkbookIntent('חוברת ילדים');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-series-premium-he');
  });

  it('resolveChildrenHeWorkbookIntent returns series for "קונטרס ילדים"', () => {
    const meta = resolveChildrenHeWorkbookIntent('קונטרס ילדים');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-series-premium-he');
  });

  it('resolveChildrenHeWorkbookIntent returns null for a non-workbook query', () => {
    const meta = resolveChildrenHeWorkbookIntent('מה שלומך');
    expect(meta).toBeNull();
  });
});

// ─── 11. Existing 18 standard forms still resolve correctly ──────────────────

describe('Children CBT Premium — 11. Existing 18 standard forms still resolve correctly', () => {
  const STANDARD_FORMS = ALL_FORMS.filter(
    f => f.approved && f.type !== 'therapeutic_workbook' && f.category !== 'children_cbt_process'
  );

  it('exactly 18 approved standard multilingual forms remain', () => {
    expect(STANDARD_FORMS.length).toBe(18);
  });

  it('all 18 standard forms still resolve in English', () => {
    for (const form of STANDARD_FORMS) {
      const resolved = resolveFormWithLanguage(form.id, 'en');
      expect(resolved, `${form.id} must resolve in English`).not.toBeNull();
      expect(resolved.languageData.file_url).toBeTruthy();
    }
  });

  it('tf-adults-cbt-thought-record still resolves by canonical ID', () => {
    const meta = resolveFormIntent('tf-adults-cbt-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
    expect(meta.language).toBe('en');
  });
});

// ─── 12. Existing adult workbook behavior remains intact ─────────────────────

describe('Children CBT Premium — 12. Existing adult workbook behavior is intact', () => {
  const ADULT_WORKBOOKS = ALL_FORMS.filter(
    f => f.approved && f.category === 'workbook_series' && f.audience === 'adults'
  );

  it('still exactly 49 adult workbook_series forms', () => {
    expect(ADULT_WORKBOOKS.length).toBe(49);
  });

  it('tf-adults-formulation-mapping-premium-he still resolves in Hebrew', () => {
    const meta = resolveFormIntent('tf-adults-formulation-mapping-premium-he', 'he');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-formulation-mapping-premium-he');
    expect(meta.language).toBe('he');
  });

  it('adults workbooks are not returned for children CBT series alias', () => {
    const meta = resolveFormIntent('children cbt workbook', 'he');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-cbt-series-premium-he');
    expect(meta.form_id).not.toMatch(/^tf-adults-/);
  });
});

// ─── 13. Open/download behavior (valid file_urls) ────────────────────────────

describe('Children CBT Premium — 13. Open/download behavior works correctly', () => {
  it('all 30 individual form HE file_urls are non-empty strings', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL) {
      const url = form.languages?.he?.file_url;
      expect(typeof url).toBe('string');
      expect(url.trim().length).toBeGreaterThan(0);
    }
  });

  it('series workbook HE file_url is a non-empty string', () => {
    const url = CHILDREN_SERIES[0]?.languages?.he?.file_url;
    expect(typeof url).toBe('string');
    expect(url.trim().length).toBeGreaterThan(0);
  });

  it('all file_urls follow the /forms/he/children/cbt-premium-locked/ path pattern', () => {
    const allForms = [...CHILDREN_PREMIUM_INDIVIDUAL, ...CHILDREN_SERIES];
    for (const form of allForms) {
      const url = form.languages?.he?.file_url;
      expect(url).toMatch(/^\/forms\/he\/children\/cbt-premium-locked\/.+\.pdf$/);
    }
  });

  it('RTL is true for all Hebrew children premium forms', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL) {
      const resolved = resolveFormWithLanguage(form.id, 'he');
      expect(resolved.languageData.rtl).toBe(true);
    }
  });
});

// ─── APPROVED_FORM_INTENT_MAP coverage ───────────────────────────────────────

describe('Children CBT Premium — APPROVED_FORM_INTENT_MAP coverage', () => {
  it('all 31 children CBT form IDs are present in APPROVED_FORM_INTENT_MAP', () => {
    const allChildrenIds = new Set([
      ...CHILDREN_PREMIUM_INDIVIDUAL.map(f => f.id),
      ...CHILDREN_SERIES.map(f => f.id),
    ]);
    const mappedValues = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const id of allChildrenIds) {
      expect(
        mappedValues.has(id),
        `${id} must be in APPROVED_FORM_INTENT_MAP`
      ).toBe(true);
    }
  });

  it('total approved forms is 98', () => {
    const total = ALL_FORMS.filter(f => f.approved).length;
    expect(total).toBe(98);
  });
});

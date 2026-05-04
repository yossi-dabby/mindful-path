/**
 * Tests for Hebrew Premium Therapeutic Workbooks — Phase 10
 *
 * Verifies the 7 newly registered Hebrew adult premium workbooks across all
 * required behavior dimensions from the problem statement.
 *
 * Requirements tested:
 *  1.  All 7 workbook slugs resolve in Hebrew.
 *  2.  All 7 workbook file_url paths exist on disk.
 *  3.  All 7 workbook entries are approved.
 *  4.  All 7 workbook entries appear in the TherapeuticForms registry output.
 *  5.  All 7 workbook entries can generate valid generated_file metadata.
 *  6.  The AI intent map resolves representative Hebrew aliases to the correct workbook.
 *  7.  Existing 18 individual standard forms are still approved and still resolve.
 *  8.  Existing open/download behavior is not modified (open/download functions unchanged).
 *  9.  No unapproved form can be sent.
 * 10.  Unsupported language fallback behavior remains unchanged:
 *      workbooks return null for non-Hebrew language requests (no English fallback asset).
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ALL_FORMS,
  listFormsByAudience,
  resolveFormById,
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
} from '../../src/data/therapeuticForms/index.js';

import {
  resolveFormIntent,
  APPROVED_FORM_INTENT_MAP,
} from '../../src/utils/resolveFormIntent.js';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, '../../public');

function resolvePublicPath(fileUrl) {
  return path.join(PUBLIC_ROOT, fileUrl);
}

// ─── Workbook constants ───────────────────────────────────────────────────────

const WORKBOOK_IDS = [
  'tf-adults-formulation-mapping-premium-he',
  'tf-adults-awareness-identification-premium-he',
  'tf-adults-cognitive-flexibility-premium-he',
  'tf-adults-emotional-regulation-premium-he',
  'tf-adults-coping-change-premium-he',
  'tf-adults-strengths-resilience-premium-he',
  'tf-adults-treatment-summary-custom-forms-premium-he',
];

const WORKBOOK_SLUGS = [
  'adults-formulation-mapping-premium-he',
  'adults-awareness-identification-premium-he',
  'adults-cognitive-flexibility-premium-he',
  'adults-emotional-regulation-premium-he',
  'adults-coping-change-premium-he',
  'adults-strengths-resilience-premium-he',
  'adults-treatment-summary-custom-forms-premium-he',
];

const WORKBOOK_HE_TITLES = [
  'קונטרס מיפוי והמשגה',
  'קונטרס זיהוי מחשבות, רגשות, תחושות והתנהגות',
  'קונטרס הפרכת מחשבות וגמישות מחשבתית',
  'קונטרס זיהוי וויסות רגשי',
  'קונטרס התמודדות ושינוי',
  'קונטרס כוחות וחוסן',
  'קונטרס סיכום טיפול וטפסים אישיים',
];

const WORKBOOK_FILE_URLS = [
  '/forms/he/adults/adults-formulation-mapping-premium-he.pdf',
  '/forms/he/adults/adults-awareness-identification-premium-he.pdf',
  '/forms/he/adults/adults-cognitive-flexibility-premium-he.pdf',
  '/forms/he/adults/adults-emotional-regulation-premium-he.pdf',
  '/forms/he/adults/adults-coping-change-premium-he.pdf',
  '/forms/he/adults/adults-strengths-resilience-premium-he.pdf',
  '/forms/he/adults/adults-treatment-summary-custom-forms-premium-he.pdf',
];

// Representative Hebrew intent aliases → expected form ID
const HEBREW_INTENT_SAMPLES = [
  { alias: 'מיפוי',                 expectedId: 'tf-adults-formulation-mapping-premium-he' },
  { alias: 'המשגה',                 expectedId: 'tf-adults-formulation-mapping-premium-he' },
  { alias: 'ניסוח מקרה',            expectedId: 'tf-adults-formulation-mapping-premium-he' },
  { alias: 'זיהוי מחשבות',          expectedId: 'tf-adults-awareness-identification-premium-he' },
  { alias: 'יומן מחשבות',           expectedId: 'tf-adults-awareness-identification-premium-he' },
  { alias: 'ניטור רגשות',           expectedId: 'tf-adults-awareness-identification-premium-he' },
  { alias: 'הפרכת מחשבות',          expectedId: 'tf-adults-cognitive-flexibility-premium-he' },
  { alias: 'גמישות מחשבתית',        expectedId: 'tf-adults-cognitive-flexibility-premium-he' },
  { alias: 'מחשבות אוטומטיות',      expectedId: 'tf-adults-cognitive-flexibility-premium-he' },
  { alias: 'ויסות רגשי',            expectedId: 'tf-adults-emotional-regulation-premium-he' },
  { alias: 'הצפה רגשית',            expectedId: 'tf-adults-emotional-regulation-premium-he' },
  { alias: 'חרדה',                  expectedId: 'tf-adults-emotional-regulation-premium-he' },
  { alias: 'התמודדות',              expectedId: 'tf-adults-coping-change-premium-he' },
  { alias: 'דחיינות',               expectedId: 'tf-adults-coping-change-premium-he' },
  { alias: 'גבולות',                expectedId: 'tf-adults-coping-change-premium-he' },
  { alias: 'כוחות',                 expectedId: 'tf-adults-strengths-resilience-premium-he' },
  { alias: 'חוסן',                  expectedId: 'tf-adults-strengths-resilience-premium-he' },
  { alias: 'תחושת מסוגלות',         expectedId: 'tf-adults-strengths-resilience-premium-he' },
  { alias: 'סיכום טיפול',           expectedId: 'tf-adults-treatment-summary-custom-forms-premium-he' },
  { alias: 'טפסים אישיים',          expectedId: 'tf-adults-treatment-summary-custom-forms-premium-he' },
  { alias: 'קונטרס סיכום',          expectedId: 'tf-adults-treatment-summary-custom-forms-premium-he' },
];

// ─── 1. All 7 workbook slugs resolve in Hebrew ────────────────────────────────

describe('Phase 10 — Workbooks: all 7 slugs resolve in Hebrew', () => {
  it('each workbook slug resolves via resolveFormById', () => {
    for (const slug of WORKBOOK_SLUGS) {
      const form = resolveFormById(slug);
      expect(form, `Slug "${slug}" must resolve via resolveFormById`).not.toBeNull();
      expect(form.approved, `Slug "${slug}" must be approved`).toBe(true);
    }
  });

  it('each workbook ID resolves with Hebrew language data', () => {
    for (const id of WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'he');
      expect(result, `Workbook "${id}" must resolve in Hebrew`).not.toBeNull();
      expect(result.language, `Workbook "${id}" must return Hebrew`).toBe('he');
      expect(result.languageData.rtl, `Workbook "${id}" Hebrew must have rtl: true`).toBe(true);
      expect(
        result.languageData.file_url.startsWith('/forms/he/'),
        `Workbook "${id}" Hebrew URL must start with /forms/he/`
      ).toBe(true);
    }
  });

  it('each workbook Hebrew title is non-empty', () => {
    WORKBOOK_IDS.forEach((id, i) => {
      const result = resolveFormWithLanguage(id, 'he');
      expect(result).not.toBeNull();
      expect(result.languageData.title).toBe(WORKBOOK_HE_TITLES[i]);
    });
  });
});

// ─── 2. All 7 workbook file_url paths exist on disk ───────────────────────────

describe('Phase 10 — Workbooks: all 7 PDF files exist on disk', () => {
  it('each workbook Hebrew PDF file exists under public/forms/he/adults/', () => {
    for (const url of WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      expect(
        fs.existsSync(filePath),
        `Workbook PDF must exist on disk: ${url}`
      ).toBe(true);
    }
  });

  it('each workbook PDF is a valid PDF binary (starts with %PDF)', () => {
    for (const url of WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const header = fs.readFileSync(filePath).slice(0, 4).toString('ascii');
      expect(header, `Workbook PDF must start with %PDF: ${url}`).toBe('%PDF');
    }
  });

  it('each workbook PDF is at least 5 KB', () => {
    for (const url of WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const size = fs.statSync(filePath).size;
      expect(size, `Workbook PDF is too small: ${url} (${size} bytes)`).toBeGreaterThan(5000);
    }
  });
});

// ─── 3. All 7 workbook entries are approved ───────────────────────────────────

describe('Phase 10 — Workbooks: all 7 entries are approved', () => {
  it('each workbook ID is in ALL_FORMS with approved: true', () => {
    for (const id of WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `Workbook "${id}" must exist in ALL_FORMS`).toBeDefined();
      expect(form?.approved, `Workbook "${id}" must be approved: true`).toBe(true);
    }
  });

  it('each workbook has type: "therapeutic_workbook"', () => {
    for (const id of WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.type, `Workbook "${id}" must have type: therapeutic_workbook`).toBe('therapeutic_workbook');
    }
  });

  it('each workbook has category: "workbook_series"', () => {
    for (const id of WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.category, `Workbook "${id}" must have category: workbook_series`).toBe('workbook_series');
    }
  });

  it('each workbook has audience: "adults"', () => {
    for (const id of WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.audience, `Workbook "${id}" must have audience: adults`).toBe('adults');
    }
  });
});

// ─── 4. All 7 workbook entries appear in the TherapeuticForms registry ────────

describe('Phase 10 — Workbooks: all 7 entries appear in the registry', () => {
  it('ALL_FORMS contains all 7 workbook IDs', () => {
    for (const id of WORKBOOK_IDS) {
      const found = ALL_FORMS.some(f => f.id === id);
      expect(found, `ALL_FORMS must contain workbook "${id}"`).toBe(true);
    }
  });

  it('listFormsByAudience("adults") includes all 7 workbooks', () => {
    const adultForms = listFormsByAudience('adults');
    for (const id of WORKBOOK_IDS) {
      const found = adultForms.some(f => f.id === id);
      expect(found, `listFormsByAudience("adults") must include "${id}"`).toBe(true);
    }
  });

  it('listFormsByAudience("adults") returns exactly 13 forms (6 standard + 7 workbooks)', () => {
    const adultForms = listFormsByAudience('adults');
    expect(adultForms.length).toBe(13);
  });

  it('total approved forms count is 25 (18 standard + 7 workbooks)', () => {
    const approvedForms = ALL_FORMS.filter(f => f.approved === true);
    expect(approvedForms.length).toBe(25);
  });
});

// ─── 5. All 7 workbook entries generate valid generated_file metadata ─────────

describe('Phase 10 — Workbooks: toGeneratedFileMetadata returns valid shape', () => {
  it('toGeneratedFileMetadata returns valid shape for each workbook in Hebrew', () => {
    for (const id of WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'he');
      expect(resolved, `${id} must resolve in Hebrew`).not.toBeNull();
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `${id} toGeneratedFileMetadata must not be null`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(id);
      expect(meta.language).toBe('he');
      expect(meta.url).toMatch(/^\/forms\/he\//);
      expect(meta.audience).toBe('adults');
      expect(meta.category).toBe('workbook_series');
      expect(typeof meta.created_at).toBe('string');
      expect(meta.name).toBeTruthy();
      expect(meta.title).toBeTruthy();
    }
  });

  it('resolveFormIntent with ASCII slug returns valid metadata in Hebrew', () => {
    for (const slug of WORKBOOK_SLUGS) {
      const meta = resolveFormIntent(slug, 'he');
      expect(meta, `Intent slug "${slug}" must resolve`).not.toBeNull();
      expect(meta.language).toBe('he');
      expect(meta.url).toMatch(/^\/forms\/he\//);
      expect(meta.source).toBe('therapeutic_forms_library');
    }
  });
});

// ─── 6. AI intent map resolves representative Hebrew aliases ──────────────────

describe('Phase 10 — Workbooks: Hebrew intent aliases resolve to correct workbook', () => {
  it('each representative Hebrew alias resolves to the expected workbook ID', () => {
    for (const { alias, expectedId } of HEBREW_INTENT_SAMPLES) {
      const meta = resolveFormIntent(alias, 'he');
      expect(meta, `Hebrew alias "${alias}" must resolve`).not.toBeNull();
      expect(
        meta?.form_id,
        `Hebrew alias "${alias}" must resolve to "${expectedId}"`
      ).toBe(expectedId);
      expect(meta?.language).toBe('he');
    }
  });

  it('all 7 workbook IDs are values in APPROVED_FORM_INTENT_MAP', () => {
    const mapValues = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const id of WORKBOOK_IDS) {
      expect(
        mapValues.has(id),
        `Workbook "${id}" must appear in APPROVED_FORM_INTENT_MAP`
      ).toBe(true);
    }
  });
});

// ─── 7. Existing 18 standard forms are still approved and still resolve ───────

describe('Phase 10 — Regression: existing 18 standard forms still resolve', () => {
  const STANDARD_FORM_IDS = [
    // Adults
    'tf-adults-cbt-thought-record',
    'tf-adults-behavioral-activation-plan',
    'tf-adults-cognitive-distortions-worksheet',
    'tf-adults-values-and-goals-worksheet',
    'tf-adults-mood-tracking-sheet',
    'tf-adults-weekly-coping-plan',
    // Older Adults
    'tf-older-adults-mood-reflection-sheet',
    'tf-older-adults-sleep-routine-reflection',
    'tf-older-adults-daily-coping-plan',
    'tf-older-adults-caregiver-support-reflection',
    // Adolescents
    'tf-adolescents-anxiety-thought-record',
    'tf-adolescents-emotion-regulation-worksheet',
    'tf-adolescents-weekly-practice-planner',
    'tf-adolescents-social-pressure-coping-tool',
    // Children
    'tf-children-feelings-checkin',
    'tf-children-grounding-exercise',
    'tf-children-parent-guided-coping-card',
    'tf-children-box-breathing',
  ];

  it('all 18 standard form IDs exist in ALL_FORMS and are approved', () => {
    for (const id of STANDARD_FORM_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `Standard form "${id}" must exist in ALL_FORMS`).toBeDefined();
      expect(form?.approved, `Standard form "${id}" must be approved`).toBe(true);
    }
  });

  it('all 18 standard forms still resolve in English', () => {
    for (const id of STANDARD_FORM_IDS) {
      const result = resolveFormWithLanguage(id, 'en');
      expect(result, `Standard form "${id}" must resolve in English`).not.toBeNull();
      expect(result.language).toBe('en');
    }
  });

  it('all 18 standard forms still resolve in Hebrew', () => {
    for (const id of STANDARD_FORM_IDS) {
      const result = resolveFormWithLanguage(id, 'he');
      expect(result, `Standard form "${id}" must resolve in Hebrew`).not.toBeNull();
      expect(result.language).toBe('he');
    }
  });
});

// ─── 8. Open/download behavior is not modified ───────────────────────────────

describe('Phase 10 — Regression: open/download behavior unchanged', () => {
  it('workbook metadata contains a valid file_url for download/open', () => {
    for (const id of WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'he');
      expect(resolved).not.toBeNull();
      const { languageData } = resolved;
      // These are the fields consumed by openFile and downloadPdfFile
      expect(languageData.file_url).toBeTruthy();
      expect(languageData.file_url).toMatch(/^\/forms\/he\//);
      expect(languageData.file_name).toBeTruthy();
      expect(languageData.file_name).toMatch(/\.pdf$/);
    }
  });

  it('workbook toGeneratedFileMetadata shape is compatible with generated_file consumer', () => {
    for (const id of WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'he');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta).not.toBeNull();
      // Fields required by GeneratedFileCard / normalizeGeneratedFile
      expect(meta.type).toBe('pdf');
      expect(meta.url).toBeTruthy();
      expect(meta.name).toBeTruthy();
      expect(meta.title).toBeTruthy();
    }
  });
});

// ─── 9. No unapproved form can be sent ───────────────────────────────────────

describe('Phase 10 — Safety: no unapproved form can be sent', () => {
  it('resolveFormIntent returns null for invented workbook-like slugs', () => {
    expect(resolveFormIntent('adults-fake-workbook-he', 'he')).toBeNull();
    expect(resolveFormIntent('tf-adults-invented-premium-he', 'he')).toBeNull();
    expect(resolveFormIntent('workbook-series', 'he')).toBeNull();
  });

  it('every value in APPROVED_FORM_INTENT_MAP is approved: true in the registry', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const form = ALL_FORMS.find(f => f.id === formId);
      expect(form, `Form "${formId}" in intent map must exist in registry`).toBeDefined();
      expect(form?.approved, `Form "${formId}" in intent map must be approved: true`).toBe(true);
    }
  });
});

// ─── 10. Unsupported language fallback behavior remains unchanged ─────────────

describe('Phase 10 — Language: workbooks return null for non-Hebrew requests', () => {
  it('workbooks return null when requested in English (no English fallback)', () => {
    for (const id of WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'en');
      expect(result, `Workbook "${id}" must return null for English (Hebrew-only)`).toBeNull();
    }
  });

  it('workbooks return null when requested in French', () => {
    for (const id of WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'fr');
      expect(result, `Workbook "${id}" must return null for French`).toBeNull();
    }
  });

  it('workbooks return null when requested in Spanish', () => {
    for (const id of WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'es');
      expect(result, `Workbook "${id}" must return null for Spanish`).toBeNull();
    }
  });

  it('workbooks return null when requested in an unsupported language (zh)', () => {
    for (const id of WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'zh');
      expect(result, `Workbook "${id}" must return null for Chinese`).toBeNull();
    }
  });

  it('standard forms continue to fall back to English for unsupported languages', () => {
    // Verify the standard fallback behavior is unchanged for existing forms
    const result = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'zh');
    expect(result).not.toBeNull();
    expect(result.language).toBe('en');
  });
});

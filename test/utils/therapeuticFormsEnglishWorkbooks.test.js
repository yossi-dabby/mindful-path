/**
 * Tests for English Premium Therapeutic Workbooks — Phase 11
 *
 * Verifies the 7 newly registered English adult premium workbooks across all
 * required behavior dimensions from the problem statement.
 *
 * Sections:
 *  A. Registry — all 7 English workbook entries exist, are approved, and have
 *     correct metadata.
 *  B. Routing — content-aware English workbook routing behaves correctly:
 *       B1. "I want to work on negative thoughts" → no forced attachment.
 *       B2. "Do you have a worksheet for negative thoughts?" → individual worksheet (no workbook).
 *       B3. "Do you have a workbook for negative thoughts?" → adults-cognitive-flexibility-premium-en.
 *       B4. Context-aware: prior negative-thoughts context + "Do you have a workbook for this?"
 *           → adults-cognitive-flexibility-premium-en.
 *       B5. Procrastination/avoidance/habits workbook query → adults-coping-change-premium-en.
 *       B6. Emotional regulation workbook query → adults-emotional-regulation-premium-en.
 *       B7. Multi-topic strengths/resilience/self-efficacy → adults-strengths-resilience-premium-en.
 *       B8. Treatment summary / ending therapy → adults-treatment-summary-custom-forms-premium-en.
 *       B9. Direct individual-form requests remain individual (cbt-thought-record, etc.).
 *  C. Regression — Hebrew workbooks, Hebrew routing, and all 18 individual forms unaffected.
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

import {
  resolveEnglishWorkbookIntent,
  resolveEnglishWorkbookIntentWithContext,
  getEnglishWorkbookTriggerKeywords,
  getEnglishIndividualFormTriggerKeywords,
  getEnglishFormLabel,
  resolveWorkbookIntent,
  getHebrewFormLabel,
} from '../../src/utils/resolveWorkbookIntent.js';

import { WORKBOOK_CONTENT_METADATA_EN } from '../../src/utils/workbookContentMetadata.js';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, '../../public');

function resolvePublicPath(fileUrl) {
  return path.join(PUBLIC_ROOT, fileUrl);
}

// ─── English workbook constants ───────────────────────────────────────────────

const EN_WORKBOOK_IDS = [
  'tf-adults-formulation-mapping-premium-en',
  'tf-adults-awareness-identification-premium-en',
  'tf-adults-cognitive-flexibility-premium-en',
  'tf-adults-emotional-regulation-premium-en',
  'tf-adults-coping-change-premium-en',
  'tf-adults-strengths-resilience-premium-en',
  'tf-adults-treatment-summary-custom-forms-premium-en',
];

const EN_WORKBOOK_SLUGS = [
  'adults-formulation-mapping-premium-en',
  'adults-awareness-identification-premium-en',
  'adults-cognitive-flexibility-premium-en',
  'adults-emotional-regulation-premium-en',
  'adults-coping-change-premium-en',
  'adults-strengths-resilience-premium-en',
  'adults-treatment-summary-custom-forms-premium-en',
];

const EN_WORKBOOK_FILE_URLS = [
  '/forms/en/adults/adults-formulation-mapping-premium-en.pdf',
  '/forms/en/adults/adults-awareness-identification-premium-en.pdf',
  '/forms/en/adults/adults-cognitive-flexibility-premium-en.pdf',
  '/forms/en/adults/adults-emotional-regulation-premium-en.pdf',
  '/forms/en/adults/adults-coping-change-premium-en.pdf',
  '/forms/en/adults/adults-strengths-resilience-premium-en.pdf',
  '/forms/en/adults/adults-treatment-summary-custom-forms-premium-en.pdf',
];

const EN_WORKBOOK_TITLES = [
  'Formulation & Case Mapping Workbook',
  'Thoughts, Emotions, Body Sensations & Behavior Identification Workbook',
  'Cognitive Flexibility & Thought Challenging Workbook',
  'Emotional Awareness & Regulation Workbook',
  'Coping & Change Workbook',
  'Strengths & Resilience Workbook',
  'Treatment Summary & Custom Forms Workbook',
];

// ─────────────────────────────────────────────────────────────────────────────
// A. Registry
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 11 — A1: All 7 English workbook slugs resolve', () => {
  it('each workbook slug resolves via resolveFormById', () => {
    for (const slug of EN_WORKBOOK_SLUGS) {
      const form = resolveFormById(slug);
      expect(form, `Slug "${slug}" must resolve via resolveFormById`).not.toBeNull();
      expect(form.approved, `Slug "${slug}" must be approved`).toBe(true);
    }
  });

  it('each workbook ID resolves with English language data', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'en');
      expect(result, `Workbook "${id}" must resolve in English`).not.toBeNull();
      expect(result.language, `Workbook "${id}" must return English`).toBe('en');
      expect(result.languageData.rtl, `Workbook "${id}" must have rtl: false`).toBe(false);
      expect(
        result.languageData.file_url.startsWith('/forms/en/'),
        `Workbook "${id}" URL must start with /forms/en/`
      ).toBe(true);
    }
  });

  it('each workbook English title matches expected value', () => {
    EN_WORKBOOK_IDS.forEach((id, i) => {
      const result = resolveFormWithLanguage(id, 'en');
      expect(result).not.toBeNull();
      expect(result.languageData.title).toBe(EN_WORKBOOK_TITLES[i]);
    });
  });
});

describe('Phase 11 — A2: All 7 English workbook PDF files exist on disk', () => {
  it('each English workbook PDF exists under public/forms/en/adults/', () => {
    for (const url of EN_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      expect(fs.existsSync(filePath), `Workbook PDF must exist: ${url}`).toBe(true);
    }
  });

  it('each workbook PDF is a valid PDF binary (starts with %PDF)', () => {
    for (const url of EN_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const header = fs.readFileSync(filePath).slice(0, 4).toString('ascii');
      expect(header, `Workbook PDF must start with %PDF: ${url}`).toBe('%PDF');
    }
  });

  it('each workbook PDF is at least 5 KB', () => {
    for (const url of EN_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const size = fs.statSync(filePath).size;
      expect(size, `Workbook PDF is too small: ${url} (${size} bytes)`).toBeGreaterThan(5000);
    }
  });
});

describe('Phase 11 — A3: All 7 English workbooks are approved with correct metadata', () => {
  it('each workbook ID is in ALL_FORMS with approved: true', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `Workbook "${id}" must exist in ALL_FORMS`).toBeDefined();
      expect(form?.approved, `Workbook "${id}" must be approved: true`).toBe(true);
    }
  });

  it('each workbook has type: "therapeutic_workbook"', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.type, `Workbook "${id}" must have type: therapeutic_workbook`).toBe('therapeutic_workbook');
    }
  });

  it('each workbook has category: "workbook_series"', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.category, `Workbook "${id}" must have category: workbook_series`).toBe('workbook_series');
    }
  });

  it('each workbook has audience: "adults"', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.audience, `Workbook "${id}" must have audience: adults`).toBe('adults');
    }
  });
});

describe('Phase 11 — A4: All 7 English workbooks appear in the library output', () => {
  it('ALL_FORMS contains all 7 English workbook IDs', () => {
    for (const id of EN_WORKBOOK_IDS) {
      expect(ALL_FORMS.some(f => f.id === id), `ALL_FORMS must contain "${id}"`).toBe(true);
    }
  });

  it('listFormsByAudience("adults") includes all 7 English workbooks', () => {
    const adultForms = listFormsByAudience('adults');
    for (const id of EN_WORKBOOK_IDS) {
      expect(adultForms.some(f => f.id === id), `listFormsByAudience must include "${id}"`).toBe(true);
    }
  });

  it('listFormsByAudience("adults") workbook_series entries include all 7 English workbooks', () => {
    const adultForms = listFormsByAudience('adults');
    const workbooks = adultForms.filter(f => f.category === 'workbook_series');
    const enWorkbooks = workbooks.filter(f => f.id.endsWith('-en'));
    expect(enWorkbooks.length).toBe(7);
  });
});

describe('Phase 11 — A5: All 7 English workbooks generate valid generated_file metadata', () => {
  it('toGeneratedFileMetadata returns valid shape for each English workbook', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'en');
      expect(resolved, `${id} must resolve in English`).not.toBeNull();
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `${id} toGeneratedFileMetadata must not be null`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(id);
      expect(meta.language).toBe('en');
      expect(meta.url).toMatch(/^\/forms\/en\//);
      expect(meta.audience).toBe('adults');
      expect(meta.category).toBe('workbook_series');
      expect(typeof meta.created_at).toBe('string');
      expect(meta.name).toBeTruthy();
      expect(meta.title).toBeTruthy();
    }
  });

  it('resolveFormIntent with English workbook slug returns valid metadata', () => {
    for (const slug of EN_WORKBOOK_SLUGS) {
      const meta = resolveFormIntent(slug, 'en');
      expect(meta, `Intent slug "${slug}" must resolve`).not.toBeNull();
      expect(meta.language).toBe('en');
      expect(meta.url).toMatch(/^\/forms\/en\//);
      expect(meta.source).toBe('therapeutic_forms_library');
    }
  });

  it('all 7 English workbook IDs are values in APPROVED_FORM_INTENT_MAP', () => {
    const mapValues = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const id of EN_WORKBOOK_IDS) {
      expect(mapValues.has(id), `Workbook "${id}" must appear in APPROVED_FORM_INTENT_MAP`).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B. Routing
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 11 — B1: No forced attachment for therapeutic conversation', () => {
  it('"I want to work on negative thoughts" → resolveEnglishWorkbookIntent returns null', () => {
    const result = resolveEnglishWorkbookIntent('I want to work on negative thoughts');
    // No workbook trigger and only 1 keyword match — should NOT force a workbook
    // The test allows null or single-match null (threshold is ≥1 with trigger or ≥2 without)
    // "negative thoughts" matches cognitive-flexibility with score 1, no trigger → null
    expect(result).toBeNull();
  });

  it('"I have been feeling anxious lately" → no forced workbook attachment', () => {
    const result = resolveEnglishWorkbookIntent('I have been feeling anxious lately');
    // Single keyword match without trigger → null
    expect(result).toBeNull();
  });
});

describe('Phase 11 — B2: Individual worksheet language does not trigger workbook', () => {
  it('"Do you have a worksheet for negative thoughts?" → resolveEnglishWorkbookIntent returns null', () => {
    // "worksheet" is an individual-form trigger; no workbook should be returned
    const result = resolveEnglishWorkbookIntent('Do you have a worksheet for negative thoughts?');
    expect(result).toBeNull();
  });

  it('"Do you have a handout for negative thoughts?" → returns null', () => {
    const result = resolveEnglishWorkbookIntent('Do you have a handout for negative thoughts?');
    expect(result).toBeNull();
  });
});

describe('Phase 11 — B3: Explicit workbook request for negative thoughts', () => {
  const query = 'Do you have a workbook for negative thoughts?';

  it('resolves to adults-cognitive-flexibility-premium-en', () => {
    const meta = resolveEnglishWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-en');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveEnglishWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('does NOT resolve to cognitive-distortions-worksheet', () => {
    const meta = resolveEnglishWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('returns English language metadata', () => {
    const meta = resolveEnglishWorkbookIntent(query);
    expect(meta?.language).toBe('en');
    expect(meta?.url).toMatch(/^\/forms\/en\//);
  });
});

describe('Phase 11 — B4: Context-aware routing — negative thoughts context', () => {
  const previousContext = 'I have a lot of negative thoughts and want to challenge them';
  const currentQuery = 'Do you have a workbook for this?';

  it('resolves to adults-cognitive-flexibility-premium-en', () => {
    const meta = resolveEnglishWorkbookIntentWithContext(currentQuery, previousContext);
    expect(meta, `Context-aware query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-en');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveEnglishWorkbookIntentWithContext(currentQuery, previousContext);
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('"Maybe you have something more comprehensive?" with thought-challenging context resolves correctly', () => {
    const meta = resolveEnglishWorkbookIntentWithContext(
      'Maybe you have something more comprehensive?',
      'I want to challenge automatic thoughts and cognitive distortions'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-en');
  });
});

describe('Phase 11 — B5: Workbook for procrastination, avoidance, difficult habits', () => {
  const query = 'Do you have a workbook for procrastination, avoidance, and difficult habits?';

  it('resolves to adults-coping-change-premium-en', () => {
    const meta = resolveEnglishWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-en');
  });

  it('does NOT resolve to behavioral-activation-plan', () => {
    const meta = resolveEnglishWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-behavioral-activation-plan');
  });

  it('context-aware: procrastination context + workbook trigger resolves to coping-change', () => {
    const meta = resolveEnglishWorkbookIntentWithContext(
      'Do you have a workbook for this?',
      'I struggle with procrastination and avoidance all the time'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-en');
  });
});

describe('Phase 11 — B6: Workbook for emotional regulation and strong emotions', () => {
  const query = 'Do you have a workbook for emotional regulation and strong emotions?';

  it('resolves to adults-emotional-regulation-premium-en', () => {
    const meta = resolveEnglishWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-en');
  });

  it('workbook request about anxiety and anger resolves to emotional-regulation', () => {
    const meta = resolveEnglishWorkbookIntent(
      'Do you have a full workbook about anxiety, anger, and calming down?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-en');
  });

  it('context-aware: emotional overwhelm context + workbook trigger resolves correctly', () => {
    const meta = resolveEnglishWorkbookIntentWithContext(
      'A full workbook for this?',
      'I feel emotional overwhelm and anxiety very often'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-en');
  });
});

describe('Phase 11 — B7: Workbook for strengths, resilience, confidence, self-efficacy', () => {
  it('multi-topic query resolves to adults-strengths-resilience-premium-en', () => {
    const meta = resolveEnglishWorkbookIntent(
      'I want to work on strengths, resilience, confidence, and self-efficacy'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-en');
  });

  it('explicit workbook request for strengths and resilience resolves correctly', () => {
    const meta = resolveEnglishWorkbookIntent(
      'Do you have a workbook for strengths and resilience?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-en');
  });
});

describe('Phase 11 — B8: Workbook for treatment summary and ending therapy', () => {
  const query = 'I am ending therapy and want a treatment summary and custom forms';

  it('explicit multi-topic request resolves to adults-treatment-summary-custom-forms-premium-en', () => {
    const meta = resolveEnglishWorkbookIntent(query);
    // Two topic keywords: "treatment summary" + "custom forms" → score ≥ 2
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-en');
  });

  it('workbook request for ending therapy resolves correctly', () => {
    const meta = resolveEnglishWorkbookIntent(
      'Do you have a workbook for ending therapy and reviewing what I learned?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-en');
  });
});

describe('Phase 11 — B9: Direct individual-form requests remain individual', () => {
  it('"Send me the CBT Thought Record" resolves to cbt-thought-record', () => {
    const meta = resolveFormIntent('cbt-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('"Send me the Cognitive Distortions Worksheet" resolves to cognitive-distortions-worksheet', () => {
    const meta = resolveFormIntent('cognitive-distortions-worksheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('resolveEnglishWorkbookIntent returns null for narrow individual-form queries', () => {
    expect(resolveEnglishWorkbookIntent('Give me a worksheet for cognitive distortions')).toBeNull();
    expect(resolveEnglishWorkbookIntent('Send me a form for mood tracking')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — English form label
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 11 — English form label', () => {
  it('getEnglishFormLabel returns "full therapeutic workbook" for workbook_series', () => {
    const label = getEnglishFormLabel({ category: 'workbook_series' });
    expect(label).toBe('full therapeutic workbook');
  });

  it('getEnglishFormLabel returns "worksheet" for non-workbook category', () => {
    expect(getEnglishFormLabel({ category: 'thought_records' })).toBe('worksheet');
    expect(getEnglishFormLabel({ category: 'emotional_regulation' })).toBe('worksheet');
  });

  it('getEnglishFormLabel returns "worksheet" for null/undefined', () => {
    expect(getEnglishFormLabel(null)).toBe('worksheet');
    expect(getEnglishFormLabel(undefined)).toBe('worksheet');
  });

  it('resolved English workbook metadata carries category workbook_series and gets the correct label', () => {
    const meta = resolveEnglishWorkbookIntent(
      'Do you have a workbook for negative thoughts?'
    );
    expect(meta).not.toBeNull();
    expect(meta.category).toBe('workbook_series');
    expect(getEnglishFormLabel(meta)).toBe('full therapeutic workbook');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — English trigger keyword exports
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 11 — English trigger keyword exports', () => {
  it('getEnglishWorkbookTriggerKeywords returns a non-empty array', () => {
    const kws = getEnglishWorkbookTriggerKeywords();
    expect(Array.isArray(kws)).toBe(true);
    expect(kws.length).toBeGreaterThan(0);
    expect(kws).toContain('workbook');
    expect(kws).toContain('full workbook');
  });

  it('getEnglishIndividualFormTriggerKeywords returns a non-empty array', () => {
    const kws = getEnglishIndividualFormTriggerKeywords();
    expect(Array.isArray(kws)).toBe(true);
    expect(kws.length).toBeGreaterThan(0);
    expect(kws).toContain('worksheet');
    expect(kws).toContain('handout');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — WORKBOOK_CONTENT_METADATA_EN structural integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 11 — WORKBOOK_CONTENT_METADATA_EN structural integrity', () => {
  it('has exactly 7 entries', () => {
    expect(WORKBOOK_CONTENT_METADATA_EN.length).toBe(7);
  });

  it('each entry has required fields', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA_EN) {
      expect(typeof wb.id).toBe('string');
      expect(wb.id.length).toBeGreaterThan(0);
      expect(typeof wb.slug).toBe('string');
      expect(wb.slug.length).toBeGreaterThan(0);
      expect(Array.isArray(wb.internalForms)).toBe(true);
      expect(wb.internalForms.length).toBeGreaterThan(0);
      expect(Array.isArray(wb.topicKeywords)).toBe(true);
      expect(wb.topicKeywords.length).toBeGreaterThan(0);
      expect(Array.isArray(wb.lowerPriorityIndividualForms)).toBe(true);
    }
  });

  it('every slug in metadata matches a registered English workbook', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA_EN) {
      const meta = resolveFormIntent(wb.slug, 'en');
      expect(meta, `Metadata slug "${wb.slug}" must resolve via resolveFormIntent`).not.toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// C. Regression
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 11 — C1: Hebrew workbook routing still works', () => {
  it('resolveWorkbookIntent with Hebrew coping query → adults-coping-change-premium-he', () => {
    const meta = resolveWorkbookIntent(
      'יש לך קונטרס בנושא דחיינות, הימנעות והרגלים מקשים?',
      'he'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-he');
  });

  it('resolveWorkbookIntent with Hebrew negative-thoughts query → cognitive-flexibility-he', () => {
    const meta = resolveWorkbookIntent(
      'יש לי מחשבות שליליות, יש לך קונטרס להפריך אותן?',
      'he'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('Hebrew: קונטרס = workbook, not individual worksheet', () => {
    const meta = resolveWorkbookIntent('קונטרס הפרכת מחשבות', 'he');
    expect(meta).not.toBeNull();
    expect(meta?.category).toBe('workbook_series');
    expect(getHebrewFormLabel(meta)).toBe('קונטרס טיפולי מלא');
  });
});

describe('Phase 11 — C2: Existing 18 individual forms still resolve', () => {
  const STANDARD_FORM_IDS = [
    'tf-adults-cbt-thought-record',
    'tf-adults-behavioral-activation-plan',
    'tf-adults-cognitive-distortions-worksheet',
    'tf-adults-values-and-goals-worksheet',
    'tf-adults-mood-tracking-sheet',
    'tf-adults-weekly-coping-plan',
    'tf-older-adults-mood-reflection-sheet',
    'tf-older-adults-sleep-routine-reflection',
    'tf-older-adults-daily-coping-plan',
    'tf-older-adults-caregiver-support-reflection',
    'tf-adolescents-anxiety-thought-record',
    'tf-adolescents-emotion-regulation-worksheet',
    'tf-adolescents-weekly-practice-planner',
    'tf-adolescents-social-pressure-coping-tool',
    'tf-children-feelings-checkin',
    'tf-children-grounding-exercise',
    'tf-children-parent-guided-coping-card',
    'tf-children-box-breathing',
  ];

  it('all 18 standard form IDs exist in ALL_FORMS and are approved', () => {
    for (const id of STANDARD_FORM_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `Standard form "${id}" must exist in ALL_FORMS`).toBeDefined();
      expect(form?.approved).toBe(true);
    }
  });

  it('all 18 standard forms still resolve in English', () => {
    for (const id of STANDARD_FORM_IDS) {
      const result = resolveFormWithLanguage(id, 'en');
      expect(result, `Standard form "${id}" must resolve in English`).not.toBeNull();
      expect(result.language).toBe('en');
    }
  });
});

describe('Phase 11 — C3: Hebrew workbooks still return null for English requests', () => {
  const HE_WORKBOOK_IDS = [
    'tf-adults-formulation-mapping-premium-he',
    'tf-adults-awareness-identification-premium-he',
    'tf-adults-cognitive-flexibility-premium-he',
    'tf-adults-emotional-regulation-premium-he',
    'tf-adults-coping-change-premium-he',
    'tf-adults-strengths-resilience-premium-he',
    'tf-adults-treatment-summary-custom-forms-premium-he',
  ];

  it('Hebrew workbooks return null when requested in English', () => {
    for (const id of HE_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'en');
      expect(result, `Hebrew workbook "${id}" must return null for English requests`).toBeNull();
    }
  });
});

describe('Phase 11 — C4: English workbooks resolve only in English (strict language separation)', () => {
  it('English workbooks return null when Hebrew is requested (English-only, no Hebrew block)', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'he');
      // English-only workbooks have no Hebrew block — strict matching returns null
      expect(result, `English workbook "${id}" must return null for Hebrew requests`).toBeNull();
    }
  });

  it('English workbooks return null when French is requested (English-only, no French block)', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'fr');
      expect(result, `English workbook "${id}" must return null for French requests`).toBeNull();
    }
  });

  it('English workbooks resolve in English when English is requested', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'en');
      expect(result, `English workbook "${id}" must resolve in English`).not.toBeNull();
      expect(result.language).toBe('en');
    }
  });
});

describe('Phase 11 — C5: Safety — no unapproved form can be sent', () => {
  it('resolveFormIntent returns null for invented workbook slugs', () => {
    expect(resolveFormIntent('adults-fake-workbook-en', 'en')).toBeNull();
    expect(resolveFormIntent('workbook-series', 'en')).toBeNull();
  });

  it('every value in APPROVED_FORM_INTENT_MAP is approved: true in the registry', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const form = ALL_FORMS.find(f => f.id === formId);
      expect(form, `Form "${formId}" in intent map must exist in registry`).toBeDefined();
      expect(form?.approved, `Form "${formId}" must be approved: true`).toBe(true);
    }
  });
});

describe('Phase 11 — C6: Open/download behavior unchanged for English workbooks', () => {
  it('each English workbook metadata contains valid file_url for download/open', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'en');
      expect(resolved).not.toBeNull();
      const { languageData } = resolved;
      expect(languageData.file_url).toBeTruthy();
      expect(languageData.file_url).toMatch(/^\/forms\/en\//);
      expect(languageData.file_name).toBeTruthy();
      expect(languageData.file_name).toMatch(/\.pdf$/);
    }
  });

  it('toGeneratedFileMetadata shape is compatible with generated_file consumer', () => {
    for (const id of EN_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'en');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.url).toBeTruthy();
      expect(meta.name).toBeTruthy();
      expect(meta.title).toBeTruthy();
    }
  });
});

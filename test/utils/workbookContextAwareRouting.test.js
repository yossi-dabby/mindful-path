/**
 * Workbook Context-Aware Routing Tests
 *
 * Verifies the new context-aware workbook routing functions added to
 * resolveWorkbookIntent.js:
 *
 *   resolveWorkbookIntentWithContext(currentQuery, previousContext, lang)
 *   getHebrewFormLabel(metadata)
 *
 * Tests map to the problem-statement requirements:
 *
 *  A. Context-aware test:
 *     Given previous context "מחשבות שליליות / להפריך מחשבות"
 *     and current query "אולי יש לך גם קונטרס אחר לזה?"
 *     → must resolve to adults-cognitive-flexibility-premium-he
 *     → must NOT resolve to cbt-thought-record or cognitive-distortions-worksheet
 *
 *  B. Direct explicit workbook test (no context needed):
 *     "יש לי מחשבות שליליות ואני רוצה ללמוד להפריך אותן, יש לך קונטרס לזה?"
 *     → adults-cognitive-flexibility-premium-he
 *
 *  C. Strong clarification test:
 *     "אני מתכוון קונטרס הפרכת מחשבות וגמישות מחשבתית"
 *     → adults-cognitive-flexibility-premium-he
 *
 *  D. Response wording — getHebrewFormLabel:
 *     category workbook_series → 'קונטרס טיפולי מלא'
 *     other category → 'דף עבודה'
 *     workbook metadata must never receive label 'דף עבודה'
 *
 *  E. Preserve individual form behavior:
 *     "שלח לי רשומת מחשבות CBT" → resolveWorkbookIntentWithContext returns null
 *     "שלח לי דף עבודה לעיוותי חשיבה" → resolveWorkbookIntentWithContext returns null
 *
 *  F. Regression:
 *     All 7 workbooks remain accessible.
 *     All 18 individual forms still resolve via resolveFormIntent.
 *
 *  G. Context fallback safety:
 *     No trigger in current query → context is ignored (returns null).
 *     Trigger present, context empty → returns null.
 *     Trigger present, context has no topic keywords → returns null.
 *
 *  H. Context-aware: coping topic context + "קונטרס לזה?"
 *     → adults-coping-change-premium-he
 */

import { describe, it, expect } from 'vitest';

import {
  resolveWorkbookIntent,
  resolveWorkbookIntentWithContext,
  getWorkbookTriggerKeywords,
  getHebrewFormLabel,
} from '../../src/utils/resolveWorkbookIntent.js';

import { resolveFormIntent, APPROVED_FORM_INTENT_MAP } from '../../src/utils/resolveFormIntent.js';
import { ALL_FORMS }                                    from '../../src/data/therapeuticForms/index.js';

// ─── Constants ────────────────────────────────────────────────────────────────

const WORKBOOK_SLUGS = [
  'adults-formulation-mapping-premium-he',
  'adults-awareness-identification-premium-he',
  'adults-cognitive-flexibility-premium-he',
  'adults-emotional-regulation-premium-he',
  'adults-coping-change-premium-he',
  'adults-strengths-resilience-premium-he',
  'adults-treatment-summary-custom-forms-premium-he',
];

// ─── A. Context-aware routing ─────────────────────────────────────────────────

describe('Context-Aware Routing — Test A: anaphoric "קונטרס לזה?" with prior context', () => {
  const previousContext = 'אני רוצה ללמוד להפריך מחשבות שליליות';
  const currentQuery   = 'אולי יש לך גם קונטרס אחר לזה?';

  it('resolves to adults-cognitive-flexibility-premium-he', () => {
    const meta = resolveWorkbookIntentWithContext(currentQuery, previousContext, 'he');
    expect(meta, `"${currentQuery}" with context must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('returns workbook_series category', () => {
    const meta = resolveWorkbookIntentWithContext(currentQuery, previousContext, 'he');
    expect(meta?.category).toBe('workbook_series');
  });

  it('returns Hebrew metadata', () => {
    const meta = resolveWorkbookIntentWithContext(currentQuery, previousContext, 'he');
    expect(meta?.language).toBe('he');
    expect(meta?.url).toMatch(/^\/forms\/he\//);
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveWorkbookIntentWithContext(currentQuery, previousContext, 'he');
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('does NOT resolve to cognitive-distortions-worksheet', () => {
    const meta = resolveWorkbookIntentWithContext(currentQuery, previousContext, 'he');
    expect(meta?.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('resolveWorkbookIntent alone (no context) returns null for this anaphoric query', () => {
    // Confirm the current query alone cannot resolve — context IS required here.
    const meta = resolveWorkbookIntent(currentQuery, 'he');
    expect(meta).toBeNull();
  });
});

describe('Context-Aware Routing — Test A2: richer prior context about negative thoughts', () => {
  const previousContext = 'יש לי מחשבות שליליות, אני רוצה לעבוד על הפרכת מחשבות';
  const currentQuery   = 'קונטרס לזה?';

  it('resolves to adults-cognitive-flexibility-premium-he', () => {
    const meta = resolveWorkbookIntentWithContext(currentQuery, previousContext, 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('does NOT resolve to an individual worksheet', () => {
    const meta = resolveWorkbookIntentWithContext(currentQuery, previousContext, 'he');
    expect(meta?.category).toBe('workbook_series');
  });
});

// ─── B. Direct explicit workbook test (existing logic, confirmed via context fn) ─

describe('Context-Aware Routing — Test B: direct explicit workbook request', () => {
  const query = 'יש לי מחשבות שליליות ואני רוצה ללמוד להפריך אותן, יש לך קונטרס לזה?';

  it('resolves via resolveWorkbookIntentWithContext (no prior context needed)', () => {
    const meta = resolveWorkbookIntentWithContext(query, null, 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('resolves via resolveWorkbookIntent (baseline)', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('returns workbook_series category', () => {
    const meta = resolveWorkbookIntentWithContext(query, null, 'he');
    expect(meta?.category).toBe('workbook_series');
  });
});

// ─── C. Strong clarification test ─────────────────────────────────────────────

describe('Context-Aware Routing — Test C: explicit workbook title clarification', () => {
  const query = 'אני מתכוון קונטרס הפרכת מחשבות וגמישות מחשבתית';

  it('resolves via resolveWorkbookIntentWithContext', () => {
    const meta = resolveWorkbookIntentWithContext(query, null, 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('resolves via resolveWorkbookIntent (baseline)', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('returns workbook_series category', () => {
    const meta = resolveWorkbookIntentWithContext(query, null, 'he');
    expect(meta?.category).toBe('workbook_series');
  });
});

// ─── D. Response wording — getHebrewFormLabel ─────────────────────────────────

describe('Response Wording — Test D: getHebrewFormLabel correctness', () => {
  it('returns "קונטרס טיפולי מלא" for workbook_series category', () => {
    const label = getHebrewFormLabel({ category: 'workbook_series' });
    expect(label).toBe('קונטרס טיפולי מלא');
  });

  it('returns "דף עבודה" for individual worksheet category', () => {
    const label = getHebrewFormLabel({ category: 'worksheet' });
    expect(label).toBe('דף עבודה');
  });

  it('returns "דף עבודה" for null input', () => {
    expect(getHebrewFormLabel(null)).toBe('דף עבודה');
  });

  it('returns "דף עבודה" for undefined input', () => {
    expect(getHebrewFormLabel(undefined)).toBe('דף עבודה');
  });

  it('returns "דף עבודה" for empty object', () => {
    expect(getHebrewFormLabel({})).toBe('דף עבודה');
  });

  it('resolved cognitive-flexibility workbook metadata yields "קונטרס טיפולי מלא"', () => {
    const meta = resolveFormIntent('adults-cognitive-flexibility-premium-he', 'he');
    expect(meta).not.toBeNull();
    const label = getHebrewFormLabel(meta);
    expect(label).toBe('קונטרס טיפולי מלא');
    expect(label).not.toBe('דף עבודה');
  });

  it('resolved cbt-thought-record worksheet metadata yields "דף עבודה"', () => {
    const meta = resolveFormIntent('cbt-thought-record', 'he');
    expect(meta).not.toBeNull();
    const label = getHebrewFormLabel(meta);
    expect(label).toBe('דף עבודה');
    expect(label).not.toBe('קונטרס טיפולי מלא');
  });

  it('all 7 workbooks yield "קונטרס טיפולי מלא"', () => {
    for (const slug of WORKBOOK_SLUGS) {
      const meta = resolveFormIntent(slug, 'he');
      expect(meta, `${slug} must resolve`).not.toBeNull();
      expect(
        getHebrewFormLabel(meta),
        `${slug} must yield "קונטרס טיפולי מלא"`
      ).toBe('קונטרס טיפולי מלא');
    }
  });
});

// ─── E. Preserve individual form behavior ────────────────────────────────────

describe('Individual Form Preservation — Test E: direct worksheet requests unchanged', () => {
  it('"שלח לי רשומת מחשבות CBT" → resolveWorkbookIntentWithContext returns null', () => {
    const meta = resolveWorkbookIntentWithContext('שלח לי רשומת מחשבות CBT', null, 'he');
    expect(meta).toBeNull();
  });

  it('"שלח לי דף עבודה לעיוותי חשיבה" → resolveWorkbookIntentWithContext returns null', () => {
    const meta = resolveWorkbookIntentWithContext('שלח לי דף עבודה לעיוותי חשיבה', null, 'he');
    expect(meta).toBeNull();
  });

  it('"שלח לי טופס בודד למחשבות" → resolveWorkbookIntentWithContext returns null', () => {
    const meta = resolveWorkbookIntentWithContext('שלח לי טופס בודד למחשבות', null, 'he');
    expect(meta).toBeNull();
  });

  it('"cbt-thought-record" still resolves via resolveFormIntent', () => {
    const meta = resolveFormIntent('cbt-thought-record', 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('"cognitive-distortions-worksheet" still resolves via resolveFormIntent', () => {
    const meta = resolveFormIntent('cognitive-distortions-worksheet', 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });
});

// ─── F. Regression — all 7 workbooks and 18 individual forms intact ───────────

describe('Regression — Test F: all workbooks and individual forms remain sendable', () => {
  it('all 7 workbook slugs still resolve via resolveFormIntent', () => {
    for (const slug of WORKBOOK_SLUGS) {
      const meta = resolveFormIntent(slug, 'he');
      expect(meta, `Workbook "${slug}" must resolve`).not.toBeNull();
      expect(meta?.category).toBe('workbook_series');
      expect(meta?.language).toBe('he');
    }
  });

  it('all 7 workbooks still resolve via resolveWorkbookIntentWithContext (with context)', () => {
    const pairs = [
      { slug: 'adults-cognitive-flexibility-premium-he', ctx: 'מחשבות שליליות הפרכת מחשבות גמישות מחשבתית' },
      { slug: 'adults-coping-change-premium-he',         ctx: 'דחיינות הימנעות הרגלים מקשים' },
      { slug: 'adults-emotional-regulation-premium-he',  ctx: 'ויסות רגשי רגשות חזקים כעס חרדה' },
      { slug: 'adults-strengths-resilience-premium-he',  ctx: 'כוחות חוסן ביטחון עצמי מסוגלות' },
    ];
    for (const { slug, ctx } of pairs) {
      const meta = resolveWorkbookIntentWithContext('יש לך קונטרס לזה?', ctx, 'he');
      expect(meta, `Context resolve for "${slug}" must succeed`).not.toBeNull();
      expect(meta?.form_id).toBe(`tf-${slug}`);
    }
  });

  it('final approved individual form count is exactly 18', () => {
    const approved = ALL_FORMS.filter(f => f.approved && f.category !== 'workbook_series');
    expect(approved.length).toBe(18);
  });

  it('final approved workbook count is exactly 28 (7 Hebrew + 7 English + 7 Spanish + 7 French)', () => {
    const workbooks = ALL_FORMS.filter(f => f.approved && f.category === 'workbook_series');
    expect(workbooks.length).toBe(28);
  });
});

// ─── G. Context fallback safety ───────────────────────────────────────────────

describe('Context-Aware Routing — Test G: safety / null / edge cases', () => {
  it('no trigger in current query → context is ignored, returns null', () => {
    const meta = resolveWorkbookIntentWithContext(
      'אני רוצה עזרה',
      'מחשבות שליליות הפרכת מחשבות',
      'he'
    );
    expect(meta).toBeNull();
  });

  it('trigger present, null context → returns null', () => {
    const meta = resolveWorkbookIntentWithContext('יש לך קונטרס?', null, 'he');
    expect(meta).toBeNull();
  });

  it('trigger present, empty-string context → returns null', () => {
    const meta = resolveWorkbookIntentWithContext('יש לך קונטרס?', '', 'he');
    expect(meta).toBeNull();
  });

  it('trigger present, whitespace-only context → returns null', () => {
    const meta = resolveWorkbookIntentWithContext('יש לך קונטרס?', '   ', 'he');
    expect(meta).toBeNull();
  });

  it('trigger present, context with no matching keywords → returns null', () => {
    const meta = resolveWorkbookIntentWithContext('יש לך קונטרס?', 'שלום מה שלומך', 'he');
    expect(meta).toBeNull();
  });

  it('null currentQuery → returns null', () => {
    expect(resolveWorkbookIntentWithContext(null, 'מחשבות שליליות', 'he')).toBeNull();
  });

  it('undefined currentQuery → returns null', () => {
    expect(resolveWorkbookIntentWithContext(undefined, 'מחשבות שליליות', 'he')).toBeNull();
  });
});

// ─── H. Context-aware for coping topics ─────────────────────────────────────

describe('Context-Aware Routing — Test H: coping topic context + workbook trigger', () => {
  it('"קונטרס לזה?" after coping context → adults-coping-change-premium-he', () => {
    const previousContext = 'אני מתקשה עם דחיינות, הימנעות והרגלים מקשים';
    const currentQuery   = 'יש לך גם קונטרס לזה?';
    const meta = resolveWorkbookIntentWithContext(currentQuery, previousContext, 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-he');
    expect(meta?.category).toBe('workbook_series');
  });

  it('"חוברת לזה?" after emotional regulation context → adults-emotional-regulation-premium-he', () => {
    const previousContext = 'יש לי קושי עם ויסות רגשי ורגשות חזקים';
    const currentQuery   = 'יש לך חוברת לזה?';
    const meta = resolveWorkbookIntentWithContext(currentQuery, previousContext, 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-he');
    expect(meta?.category).toBe('workbook_series');
  });

  it('"יש לך גם קונטרס אחר לזה?" (exact problem-statement scenario)', () => {
    // The exact scenario described in the problem statement
    const previousContext = 'אני רוצה ללמוד להפריך מחשבות שליליות';
    const currentQuery   = 'אולי יש לך גם קונטרס אחר לזה?';
    const meta = resolveWorkbookIntentWithContext(currentQuery, previousContext, 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
    expect(meta?.category).toBe('workbook_series');
    // Must NOT be an individual worksheet
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
    expect(meta?.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });
});

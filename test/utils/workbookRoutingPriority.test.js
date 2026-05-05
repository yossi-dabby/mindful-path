/**
 * Workbook Routing Priority Tests — Phase 10
 *
 * Verifies that the resolveWorkbookIntent routing function correctly
 * prefers the full Hebrew therapeutic workbook over individual worksheets
 * according to the routing priority rules in the problem statement.
 *
 * Tests:
 *  1.  Explicit קונטרס request for דחיינות/הימנעות/הרגלים מקשים
 *      → adults-coping-change-premium-he (NOT behavioral-activation-plan)
 *  2.  Broad multi-topic query for דחיינות/הימנעות/הרגלים מקשים (no explicit trigger)
 *      → adults-coping-change-premium-he
 *  3.  Explicit קונטרס request for מחשבות שליליות + להפריך
 *      → adults-cognitive-flexibility-premium-he (NOT cbt-thought-record)
 *  4.  Multi-topic strengths query (כוחות, חוסן, ביטחון עצמי, תחושת מסוגלות)
 *      → adults-strengths-resilience-premium-he
 *  5.  End-of-treatment query (לסכם, טופס אישי)
 *      → adults-treatment-summary-custom-forms-premium-he
 *  6.  Generic workbook trigger with no specific topic
 *      → null (no specific workbook; must NOT be an individual worksheet)
 *  7.  Regression: individual worksheet request ("שלח לי רשומת מחשבות CBT")
 *      → resolveFormIntent still resolves cbt-thought-record
 *  8.  Regression: all 7 workbooks are approved and sendable via resolveWorkbookIntent
 *  9.  Regression: all 7 workbooks remain in the TherapeuticForms registry
 * 10.  Safety: resolveWorkbookIntent returns null for empty / null / nonsense input
 * 11.  Metadata integrity: every workbook entry has required fields
 */

import { describe, it, expect } from 'vitest';

import { resolveWorkbookIntent, getWorkbookTriggerKeywords } from '../../src/utils/resolveWorkbookIntent.js';
import { resolveFormIntent, APPROVED_FORM_INTENT_MAP }        from '../../src/utils/resolveFormIntent.js';
import { WORKBOOK_CONTENT_METADATA }                          from '../../src/utils/workbookContentMetadata.js';
import { ALL_FORMS }                                          from '../../src/data/therapeuticForms/index.js';

// ─── Constants ────────────────────────────────────────────────────────────────

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

// ─── 1. Explicit קונטרס for דחיינות/הימנעות/הרגלים מקשים ────────────────────

describe('Workbook Routing — Test 1: explicit קונטרס for coping topics', () => {
  const query = 'יש לך קונטרס בנושא דחיינות, הימנעות והרגלים מקשים?';

  it('resolves to adults-coping-change-premium-he', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta, `Query "${query}" must resolve`).not.toBeNull();
    expect(
      meta?.form_id,
      `Query "${query}" must resolve to tf-adults-coping-change-premium-he`
    ).toBe('tf-adults-coping-change-premium-he');
  });

  it('does NOT resolve to behavioral-activation-plan', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta?.form_id).not.toBe('tf-adults-behavioral-activation-plan');
  });

  it('returns Hebrew language metadata', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta?.language).toBe('he');
    expect(meta?.url).toMatch(/^\/forms\/he\//);
  });
});

// ─── 2. Broad multi-topic query (no explicit trigger) for coping topics ───────

describe('Workbook Routing — Test 2: broad multi-topic coping query', () => {
  const query = 'אני מתקשה עם דחיינות, הימנעות והרגלים מקשים. יש לך משהו מתאים?';

  it('resolves to adults-coping-change-premium-he', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta, `Multi-topic query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-he');
  });

  it('does NOT resolve to behavioral-activation-plan', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta?.form_id).not.toBe('tf-adults-behavioral-activation-plan');
  });
});

// ─── 3. Explicit קונטרס for negative thoughts / cognitive flexibility ─────────

describe('Workbook Routing — Test 3: explicit קונטרס for negative-thought topics', () => {
  const query = 'יש לי מחשבות שליליות ואני רוצה ללמוד להפריך אותן, יש לך קונטרס לזה?';

  it('resolves to adults-cognitive-flexibility-premium-he', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta, `Query "${query}" must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('returns Hebrew language metadata', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta?.language).toBe('he');
    expect(meta?.category).toBe('workbook_series');
  });
});

// ─── 4. Multi-topic strengths query ──────────────────────────────────────────

describe('Workbook Routing — Test 4: multi-topic strengths query', () => {
  const query = 'אני רוצה לעבוד על כוחות, חוסן, ביטחון עצמי ותחושת מסוגלות';

  it('resolves to adults-strengths-resilience-premium-he', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta, `Query "${query}" must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-he');
  });

  it('returns Hebrew language metadata', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta?.language).toBe('he');
    expect(meta?.category).toBe('workbook_series');
  });
});

// ─── 5. End-of-treatment query ────────────────────────────────────────────────

describe('Workbook Routing — Test 5: end-of-treatment / summary query', () => {
  const query = 'אני מסיים טיפול ורוצה לסכם את התהליך ולבנות טופס אישי עם המטפל';

  it('resolves to adults-treatment-summary-custom-forms-premium-he', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta, `Query "${query}" must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-he');
  });

  it('returns Hebrew language metadata', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta?.language).toBe('he');
    expect(meta?.category).toBe('workbook_series');
  });
});

// ─── 6. Generic workbook request — must NOT return individual worksheet ───────

describe('Workbook Routing — Test 6: generic workbook trigger with no specific topic', () => {
  const query = 'אני רוצה קונטרס של סדרת טפסים';

  it('returns null (no specific match; caller should show full catalogue)', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    // Generic requests without topic keywords should return null so the caller
    // can present the full workbook catalogue rather than guessing.
    expect(meta).toBeNull();
  });

  it('does NOT return an individual worksheet slug for this generic query', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    // If a result IS returned, it must not be an individual worksheet
    if (meta !== null) {
      expect(meta.category).toBe('workbook_series');
    }
  });
});

// ─── 7. Regression: individual worksheet still resolves ──────────────────────

describe('Workbook Routing — Test 7: individual worksheet regression', () => {
  it('"שלח לי רשומת מחשבות CBT" → resolveWorkbookIntent returns null', () => {
    const meta = resolveWorkbookIntent('שלח לי רשומת מחשבות CBT', 'he');
    // The routing layer must NOT intercept specific individual form requests
    expect(meta).toBeNull();
  });

  it('"cbt-thought-record" still resolves via resolveFormIntent', () => {
    const meta = resolveFormIntent('cbt-thought-record', 'he');
    expect(meta, 'cbt-thought-record must still resolve').not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cbt-thought-record');
    expect(meta?.language).toBe('he');
  });

  it('"behavioral-activation-plan" still resolves via resolveFormIntent', () => {
    const meta = resolveFormIntent('behavioral-activation-plan', 'he');
    expect(meta, 'behavioral-activation-plan must still resolve').not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-behavioral-activation-plan');
  });

  it('"רשומת מחשבות CBT" (Hebrew title) resolves via resolveFormIntent', () => {
    // The Hebrew title alias must be in the intent map
    const meta = resolveFormIntent('רשומת מחשבות CBT', 'he');
    expect(meta, 'Hebrew title alias must resolve').not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cbt-thought-record');
  });
});

// ─── 8. Regression: all 7 workbooks resolve via resolveWorkbookIntent ─────────

describe('Workbook Routing — Test 8: all 7 workbooks resolve via slug', () => {
  it('each workbook slug resolves via resolveWorkbookIntent by passing slug directly', () => {
    // When the slug IS a known key in APPROVED_FORM_INTENT_MAP, resolveFormIntent
    // handles it.  Here we verify end-to-end that each workbook remains sendable.
    for (const slug of WORKBOOK_SLUGS) {
      const meta = resolveFormIntent(slug, 'he');
      expect(meta, `Workbook slug "${slug}" must resolve`).not.toBeNull();
      expect(meta?.language).toBe('he');
      expect(meta?.url).toMatch(/^\/forms\/he\//);
      expect(meta?.source).toBe('therapeutic_forms_library');
      expect(meta?.category).toBe('workbook_series');
    }
  });
});

// ─── 9. Regression: all 7 workbooks still in the TherapeuticForms registry ───

describe('Workbook Routing — Test 9: registry integrity', () => {
  it('all 7 workbook IDs exist in ALL_FORMS and are approved', () => {
    for (const id of WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `Workbook "${id}" must exist in ALL_FORMS`).toBeDefined();
      expect(form?.approved, `Workbook "${id}" must be approved`).toBe(true);
      expect(form?.type).toBe('therapeutic_workbook');
      expect(form?.category).toBe('workbook_series');
    }
  });

  it('all 7 workbook IDs appear as values in APPROVED_FORM_INTENT_MAP', () => {
    const mapValues = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const id of WORKBOOK_IDS) {
      expect(
        mapValues.has(id),
        `Workbook "${id}" must appear in APPROVED_FORM_INTENT_MAP`
      ).toBe(true);
    }
  });
});

// ─── 10. Safety: null / garbage input ────────────────────────────────────────

describe('Workbook Routing — Test 10: safety / null input', () => {
  it('returns null for empty string', () => {
    expect(resolveWorkbookIntent('', 'he')).toBeNull();
  });

  it('returns null for whitespace-only string', () => {
    expect(resolveWorkbookIntent('   ', 'he')).toBeNull();
  });

  it('returns null for null input', () => {
    expect(resolveWorkbookIntent(null, 'he')).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(resolveWorkbookIntent(undefined, 'he')).toBeNull();
  });

  it('returns null for unrelated query with no workbook keywords', () => {
    expect(resolveWorkbookIntent('hello world', 'he')).toBeNull();
    expect(resolveWorkbookIntent('שלח לי משהו', 'he')).toBeNull();
  });

  it('getWorkbookTriggerKeywords returns a non-empty array', () => {
    const kws = getWorkbookTriggerKeywords();
    expect(Array.isArray(kws)).toBe(true);
    expect(kws.length).toBeGreaterThan(0);
    expect(kws).toContain('קונטרס');
    expect(kws).toContain('סדרת טפסים');
  });
});

// ─── 11. Metadata integrity ───────────────────────────────────────────────────

describe('Workbook Routing — Test 11: WORKBOOK_CONTENT_METADATA integrity', () => {
  it('has exactly 7 entries', () => {
    expect(WORKBOOK_CONTENT_METADATA.length).toBe(7);
  });

  it('each entry has all required fields', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA) {
      expect(typeof wb.id,                    `${wb.id}: id must be string`).toBe('string');
      expect(typeof wb.slug,                  `${wb.id}: slug must be string`).toBe('string');
      expect(typeof wb.titleHe,               `${wb.id}: titleHe must be string`).toBe('string');
      expect(typeof wb.descriptionHe,         `${wb.id}: descriptionHe must be string`).toBe('string');
      expect(Array.isArray(wb.internalForms), `${wb.id}: internalForms must be array`).toBe(true);
      expect(Array.isArray(wb.topicKeywords), `${wb.id}: topicKeywords must be array`).toBe(true);
      expect(typeof wb.whenToUseHe,           `${wb.id}: whenToUseHe must be string`).toBe('string');
      expect(Array.isArray(wb.preferWhenHe),  `${wb.id}: preferWhenHe must be array`).toBe(true);
      expect(Array.isArray(wb.lowerPriorityIndividualForms), `${wb.id}: lowerPriorityIndividualForms must be array`).toBe(true);
      expect(wb.topicKeywords.length,         `${wb.id}: topicKeywords must not be empty`).toBeGreaterThan(0);
      expect(wb.internalForms.length,         `${wb.id}: internalForms must not be empty`).toBeGreaterThan(0);
    }
  });

  it('each entry id matches a workbook in WORKBOOK_IDS', () => {
    const metaIds = WORKBOOK_CONTENT_METADATA.map(wb => wb.id);
    for (const id of WORKBOOK_IDS) {
      expect(metaIds, `${id} must be in WORKBOOK_CONTENT_METADATA`).toContain(id);
    }
  });

  it('all lowerPriorityIndividualForms reference real approved registry entries', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA) {
      for (const formId of wb.lowerPriorityIndividualForms) {
        const form = ALL_FORMS.find(f => f.id === formId);
        expect(form, `lowerPriority form "${formId}" must exist in ALL_FORMS`).toBeDefined();
        expect(form?.approved, `lowerPriority form "${formId}" must be approved`).toBe(true);
      }
    }
  });
});

// ─── 12. Explicit קונטרס + הפרכת מחשבות → cognitive-flexibility ─────────────

describe('Workbook Routing — Test 12: explicit קונטרס + הפרכת מחשבות (short query)', () => {
  const query = 'יש לך קונטרס בנושא הפרכת מחשבות?';

  it('resolves to adults-cognitive-flexibility-premium-he', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta, `Query "${query}" must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('does NOT resolve to cognitive-distortions-worksheet', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta?.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('returns workbook_series category', () => {
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta?.category).toBe('workbook_series');
  });
});

// ─── 13. "לא טופס בודד" trigger → workbook routing ───────────────────────────

describe('Workbook Routing — Test 13: "לא טופס בודד" is a workbook trigger keyword', () => {
  it('getWorkbookTriggerKeywords includes "לא טופס בודד"', () => {
    const kws = getWorkbookTriggerKeywords();
    expect(kws).toContain('לא טופס בודד');
  });

  it('"לא טופס בודד" + מחשבות שליליות → cognitive-flexibility (problem-statement query 2)', () => {
    const query = 'יש לי מחשבות שליליות ואני רוצה ללמוד להפריך אותן, יש לך קונטרס לזה? לא טופס בודד';
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta, `Query "${query}" must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('"לא טופס בודד" alone + topic keyword resolves to workbook', () => {
    const query = 'אני רוצה ללמוד להפריך מחשבות שליליות, לא טופס בודד';
    const meta = resolveWorkbookIntent(query, 'he');
    expect(meta, `"לא טופס בודד" with topic keyword must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('"לא טופס בודד" does NOT resolve when no topic keyword matches', () => {
    const meta = resolveWorkbookIntent('אני צריך עזרה, לא טופס בודד', 'he');
    // Trigger present but no topic keyword — must return null (no specific match)
    expect(meta).toBeNull();
  });
});

// ─── 14. חוברת עבודה trigger keyword ─────────────────────────────────────────

describe('Workbook Routing — Test 14: "חוברת עבודה" is a workbook trigger keyword', () => {
  it('getWorkbookTriggerKeywords includes "חוברת עבודה"', () => {
    const kws = getWorkbookTriggerKeywords();
    expect(kws).toContain('חוברת עבודה');
  });

  it('"חוברת עבודה" + דחיינות → coping-change workbook', () => {
    const meta = resolveWorkbookIntent('יש לך חוברת עבודה בנושא דחיינות והימנעות?', 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-he');
  });
});

// ─── 15. Regression: "שלח לי תוכנית הפעלה התנהגותית" stays on individual path ─

describe('Workbook Routing — Test 15: individual form direct request not hijacked', () => {
  it('"שלח לי תוכנית הפעלה התנהגותית" → resolveWorkbookIntent returns null', () => {
    const meta = resolveWorkbookIntent('שלח לי תוכנית הפעלה התנהגותית', 'he');
    expect(meta).toBeNull();
  });

  it('"behavioral-activation-plan" still resolves via resolveFormIntent', () => {
    const meta = resolveFormIntent('behavioral-activation-plan', 'he');
    expect(meta, 'behavioral-activation-plan must still resolve').not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-behavioral-activation-plan');
  });
});

// ─── Additional routing edge cases ────────────────────────────────────────────

describe('Workbook Routing — additional edge cases', () => {
  it('single-keyword query without workbook trigger returns null', () => {
    // Single keyword below threshold — must not guess a workbook
    const meta = resolveWorkbookIntent('חרדה', 'he');
    expect(meta).toBeNull();
  });

  it('two-keyword awareness query resolves to awareness-identification workbook', () => {
    // Both "יומן מחשבות" and "ניטור רגשות" are keywords in awareness-identification
    const meta = resolveWorkbookIntent('אני רוצה ליצור יומן מחשבות לניטור רגשות ותחושות', 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-awareness-identification-premium-he');
  });

  it('explicit trigger + single formulation keyword resolves to formulation workbook', () => {
    const meta = resolveWorkbookIntent('אני רוצה קונטרס שיעזור לי לעשות ניסוח מקרה', 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-formulation-mapping-premium-he');
  });

  it('explicit trigger + emotional regulation keywords resolves correctly', () => {
    const meta = resolveWorkbookIntent('יש לך קונטרס לעבודה על ויסות רגשי וכעס?', 'he');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-he');
  });
});

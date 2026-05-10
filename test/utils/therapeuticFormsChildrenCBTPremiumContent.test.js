/**
 * @file test/utils/therapeuticFormsChildrenCBTPremiumContent.test.js
 *
 * Content-aware resolver tests for Hebrew children CBT premium worksheets.
 *
 * These tests verify that the AI can select the correct form based on
 * therapeutic content, clinical need, and child situation — NOT just by
 * exact title matching.
 *
 * All 12 required test scenarios from the problem statement are covered.
 */

import { describe, it, expect } from 'vitest';
import { resolveChildrenCBTPremiumFormByContent } from '../../src/utils/resolveFormIntent.js';
import { FORMS_CHILDREN_CBT_PREMIUM } from '../../src/data/therapeuticForms/forms.children.cbt-premium.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

/** Extracts the form_id from a resolver result, or null. */
function idOf(result) {
  return result?.form_id ?? null;
}

/** All individual (non-series) children CBT premium forms */
const INDIVIDUAL_FORMS = FORMS_CHILDREN_CBT_PREMIUM.filter(
  f => f.category === 'children_cbt_process'
);
const SERIES_FORM = FORMS_CHILDREN_CBT_PREMIUM.find(
  f => f.category === 'workbook_series'
);

// ─── Metadata completeness ────────────────────────────────────────────────────

describe('Children CBT Premium — therapeutic metadata completeness', () => {
  it('all 30 individual forms have a non-empty therapeuticGoal', () => {
    expect(INDIVIDUAL_FORMS).toHaveLength(30);
    for (const form of INDIVIDUAL_FORMS) {
      expect(
        typeof form.therapeuticGoal,
        `${form.id} must have therapeuticGoal`
      ).toBe('string');
      expect(
        form.therapeuticGoal.trim().length,
        `${form.id} therapeuticGoal must not be empty`
      ).toBeGreaterThan(0);
    }
  });

  it('all 30 individual forms have a non-empty whenToUse', () => {
    for (const form of INDIVIDUAL_FORMS) {
      expect(typeof form.whenToUse, `${form.id} must have whenToUse`).toBe('string');
      expect(form.whenToUse.trim().length).toBeGreaterThan(0);
    }
  });

  it('all 30 individual forms have a non-empty childSignals array', () => {
    for (const form of INDIVIDUAL_FORMS) {
      expect(Array.isArray(form.childSignals), `${form.id} must have childSignals array`).toBe(true);
      expect(form.childSignals.length, `${form.id} childSignals must not be empty`).toBeGreaterThan(0);
    }
  });

  it('all 30 individual forms have a non-empty clinicalKeywords array', () => {
    for (const form of INDIVIDUAL_FORMS) {
      expect(Array.isArray(form.clinicalKeywords), `${form.id} must have clinicalKeywords array`).toBe(true);
      expect(form.clinicalKeywords.length).toBeGreaterThan(0);
    }
  });

  it('all 30 individual forms have a non-empty hebrewIntentPhrases array', () => {
    for (const form of INDIVIDUAL_FORMS) {
      expect(Array.isArray(form.hebrewIntentPhrases), `${form.id} must have hebrewIntentPhrases array`).toBe(true);
      expect(form.hebrewIntentPhrases.length).toBeGreaterThan(0);
    }
  });

  it('all 30 individual forms have a non-empty notFor string', () => {
    for (const form of INDIVIDUAL_FORMS) {
      expect(typeof form.notFor, `${form.id} must have notFor`).toBe('string');
      expect(form.notFor.trim().length).toBeGreaterThan(0);
    }
  });
});

// ─── Resolver guard tests ─────────────────────────────────────────────────────

describe('Children CBT Premium — resolver guards', () => {
  it('returns null for empty string', () => {
    expect(resolveChildrenCBTPremiumFormByContent('')).toBeNull();
    expect(resolveChildrenCBTPremiumFormByContent('   ')).toBeNull();
  });

  it('returns null for non-string input', () => {
    expect(resolveChildrenCBTPremiumFormByContent(null)).toBeNull();
    expect(resolveChildrenCBTPremiumFormByContent(undefined)).toBeNull();
    expect(resolveChildrenCBTPremiumFormByContent(42)).toBeNull();
  });

  // Test 12: No proactive attachment for unrelated emotional statements
  it('Test 12 — "אני עצוב היום" returns null (no automatic form attachment)', () => {
    const result = resolveChildrenCBTPremiumFormByContent('אני עצוב היום');
    expect(result).toBeNull();
  });

  it('returns null for adult-oriented query with no child context', () => {
    expect(resolveChildrenCBTPremiumFormByContent('אני מרגיש חרדה ורוצה לבדוק את המחשבות שלי')).toBeNull();
  });
});

// ─── Test 1: Exact title with substage number ─────────────────────────────────

describe('Children CBT Premium — Test 1: Exact title match with substage number', () => {
  it('resolves "תשלח לי את 6.3 כרטיס הכוח שלי" to 6.3 only', () => {
    const result = resolveChildrenCBTPremiumFormByContent('תשלח לי את 6.3 כרטיס הכוח שלי');
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-6-3-premium-he');
  });
});

// ─── Test 2: Automatic thoughts identification ────────────────────────────────

describe('Children CBT Premium — Test 2: Automatic thoughts identification', () => {
  it('resolves "ילד שאומר אני לא אצליח וכולם יצחקו עליי" to 2.2 (automatic thoughts)', () => {
    const query = 'אני עובד עם ילד שאומר כל הזמן אני לא אצליח וכולם יצחקו עליי';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-2-2-premium-he');
  });
});

// ─── Test 3: Thought vs fact distinction ──────────────────────────────────────

describe('Children CBT Premium — Test 3: Thought vs. fact distinction', () => {
  it('resolves "להבדיל בין מחשבה לעובדה" to 3.2', () => {
    const query = 'ילד בטוח שכולם שונאים אותו אבל אין לזה הוכחה, אני צריך טופס שיעזור להבדיל בין מחשבה לעובדה';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-3-2-premium-he');
  });
});

// ─── Test 4: Evidence checking ────────────────────────────────────────────────

describe('Children CBT Premium — Test 4: Evidence checking (thought detective)', () => {
  it('resolves "לבדוק אם המחשבה באמת נכונה ולמצוא עוד הסבר" to 3.3', () => {
    const query = 'אני צריך טופס לילד שיעזור לבדוק אם המחשבה באמת נכונה ולמצוא עוד הסבר';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-3-3-premium-he');
  });
});

// ─── Test 5: Fear ladder / graded exposure ────────────────────────────────────

describe('Children CBT Premium — Test 5: Fear ladder / graded exposure', () => {
  it('resolves "סולם הדרגתי עם ילד מפחד" to 4.1', () => {
    const query = 'ילד מפחד לדבר בכיתה ואני רוצה לבנות איתו סולם הדרגתי';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-4-1-premium-he');
  });
});

// ─── Test 6: Behavioral experiment ───────────────────────────────────────────

describe('Children CBT Premium — Test 6: Behavioral experiment', () => {
  it('resolves "לבדוק עם ילד אם יצחקו עליו" to 4.3', () => {
    const query = 'אני רוצה לבדוק עם ילד אם באמת יצחקו עליו אם הוא ישאל שאלה';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-4-3-premium-he');
  });
});

// ─── Test 7: Body regulation tools ───────────────────────────────────────────

describe('Children CBT Premium — Test 7: Body regulation / breathing tools', () => {
  it('resolves "גוף מתוח נשימות והרגעה" to 5.1', () => {
    const query = 'ילד נלחץ והגוף שלו מתוח, צריך טופס עם נשימות והרגעה';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-5-1-premium-he');
  });
});

// ─── Test 8: Asking for help ──────────────────────────────────────────────────

describe('Children CBT Premium — Test 8: Asking for help before outburst', () => {
  it('resolves "לא יודע לבקש עזרה לפני שמתפרץ" to 5.3', () => {
    const query = 'ילד לא יודע איך לבקש עזרה לפני שהוא מתפרץ';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-5-3-premium-he');
  });
});

// ─── Test 9: Repair after conflict ───────────────────────────────────────────

describe('Children CBT Premium — Test 9: Relationship repair after conflict', () => {
  it('resolves "ילדה רבה עם חברה — תיקון קשר" to 5.4', () => {
    const query = 'ילדה רבה עם חברה וצריכה טופס לתיקון הקשר';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-5-4-premium-he');
  });
});

// ─── Test 10: Relapse prevention coping card ─────────────────────────────────

describe('Children CBT Premium — Test 10: Relapse prevention / coping card', () => {
  it('resolves "מסיימים טיפול + כרטיס קצר שיזכיר לילד" to 6.3', () => {
    const query = 'אנחנו מסיימים טיפול ורוצים כרטיס קצר שיזכיר לילד מה לעשות כשיהיה קשה';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-6-3-premium-he');
  });
});

// ─── Test 11: Full workbook series ────────────────────────────────────────────

describe('Children CBT Premium — Test 11: Full workbook series request', () => {
  it('resolves "כל סדרת הטפסים לילדים בעברית" to the full series, not a single worksheet', () => {
    const query = 'תשלח לי את כל סדרת הטפסים לילדים בעברית';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-series-premium-he');
  });

  it('full series file_url is the series PDF (not an individual worksheet)', () => {
    const query = 'תשלח לי את כל סדרת הטפסים לילדים בעברית';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(result?.url).toMatch(/cbt-premium-locked\/.+\.pdf$/);
    // The series url should be the series PDF (full workbook), not an individual worksheet
    const seriesUrl = SERIES_FORM?.languages?.he?.file_url;
    expect(result?.url).toBe(seriesUrl);
  });

  it('"כל הטפסים לילדים" also resolves to the full series', () => {
    const result = resolveChildrenCBTPremiumFormByContent('שלח לי את כל הטפסים לילדים');
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-series-premium-he');
  });
});

// ─── Additional scoring disambiguation tests ──────────────────────────────────

describe('Children CBT Premium — scoring disambiguation', () => {
  it('test-2 query does NOT resolve to 4.3 (no "לבדוק אם" pattern)', () => {
    const query = 'אני עובד עם ילד שאומר כל הזמן אני לא אצליח וכולם יצחקו עליי';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(idOf(result)).not.toBe('tf-children-cbt-stage-4-3-premium-he');
  });

  it('test-6 query does NOT resolve to 2.2 (no "כולם יצחקו" full phrase)', () => {
    const query = 'אני רוצה לבדוק עם ילד אם באמת יצחקו עליו אם הוא ישאל שאלה';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(idOf(result)).not.toBe('tf-children-cbt-stage-2-2-premium-he');
  });

  it('test-7 body/breathing query does NOT resolve to 2.3 (body sensation mapping)', () => {
    const query = 'ילד נלחץ והגוף שלו מתוח, צריך טופס עם נשימות והרגעה';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(idOf(result)).not.toBe('tf-children-cbt-stage-2-3-premium-he');
  });

  it('test-9 relationship repair does NOT resolve to 5.3 (help-seeking)', () => {
    const query = 'ילדה רבה עם חברה וצריכה טופס לתיקון הקשר';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(idOf(result)).not.toBe('tf-children-cbt-stage-5-3-premium-he');
  });

  it('substage number 3.2 resolves correctly even without title', () => {
    const result = resolveChildrenCBTPremiumFormByContent('אני צריך טופס 3.2 לילד');
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-3-2-premium-he');
  });

  it('substage number 4.1 alone resolves to 4.1', () => {
    const result = resolveChildrenCBTPremiumFormByContent('תשלח לי טופס 4.1 לילד');
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-4-1-premium-he');
  });

  it('query with no child context, no form request, and no substage number returns null', () => {
    // No ילד/ילדה, no טופס/תשלח, no X.Y pattern → should return null
    const result = resolveChildrenCBTPremiumFormByContent('הגוף שלי מתוח ואני צריך הרגעה');
    expect(result).toBeNull();
  });
});

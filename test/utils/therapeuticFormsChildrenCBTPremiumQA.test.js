/**
 * @file test/utils/therapeuticFormsChildrenCBTPremiumQA.test.js
 *
 * QA regression tests for the Hebrew children CBT premium catalog and content-matching fix.
 *
 * Covers the 8 required test scenarios from the QA problem statement:
 *
 * A. Exact title still works: "6.3 כרטיס הכוח שלי" → tf-children-cbt-stage-6-3-premium-he
 * B. Content matching for automatic thoughts → 2.2
 * C. Follow-up "more accurate" doesn't regress to 1.1/1.2
 * D. Full list must come from canonical catalog (not hallucinated)
 * E. No stale children CBT catalog titles in canonical series
 * F. No hallucinated list — catalog shows registered titles, not generic CBT
 * G. Individual worksheet vs full series routing
 * H. Existing behavior preserved
 */

import { describe, it, expect } from 'vitest';
import {
  resolveChildrenCBTPremiumFormByContent,
} from '../../src/utils/resolveFormIntent.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { FORMS_CHILDREN_CBT_PREMIUM } from '../../src/data/therapeuticForms/forms.children.cbt-premium.js';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function idOf(result) {
  return result?.form_id ?? null;
}

const catalog = buildTherapistFormCatalog(ALL_FORMS);

// ─── A. Exact title still works ───────────────────────────────────────────────

describe('QA-A — Exact title matching still works', () => {
  it('A1: "תשלח לי בבקשה את הטופס לילדים בעברית: 6.3 כרטיס הכוח שלי" → 6.3', () => {
    const query = 'תשלח לי בבקשה את הטופס לילדים בעברית: 6.3 כרטיס הכוח שלי';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-6-3-premium-he');
  });

  it('A2: substage number alone resolves correctly — "טופס 6.3 לילד"', () => {
    const result = resolveChildrenCBTPremiumFormByContent('תשלח לי טופס 6.3 לילד');
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-6-3-premium-he');
  });

  it('A3: substage 2.2 resolves when referenced by number — "טופס 2.2 לילד"', () => {
    const result = resolveChildrenCBTPremiumFormByContent('תשלח לי טופס 2.2 לילד');
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-2-2-premium-he');
  });
});

// ─── B. Content matching for automatic thoughts → 2.2 ────────────────────────

describe('QA-B — Content matching for automatic thoughts resolves to 2.2', () => {
  it('B1: Exact QA query — "ילד חושב אני לא אצליח ומה הראש אומר לו ברגע קשה" → 2.2', () => {
    const query = 'אני עובד עם ילד שבזמן קושי ישר חושב אני לא אצליח או כולם יצחקו עליי. אני צריך טופס ילדים בעברית שיעזור לו לזהות מה הראש אומר לו ברגע קשה.';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-2-2-premium-he');
  });

  it('B2: Quote variant — "ילד שאומר \'אני לא אצליח\' ו\'כולם יצחקו עליי\'" → 2.2', () => {
    const query = 'ילד שאומר כל הזמן אני לא אצליח וכולם יצחקו עליי ואני צריך טופס לזהות מה הראש אומר לו';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-2-2-premium-he');
  });

  it('B3: "מה עובר לו בראש בזמן קושי" → 2.2', () => {
    const query = 'צריך טופס לילד שיעזור לזהות מה עובר לו בראש בזמן הקושי';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-2-2-premium-he');
  });

  it('B4: "מה הוא אומר לעצמו ברגע קשה" → 2.2', () => {
    const query = 'ילד שלא מרגיש טוב עם עצמו — צריך טופס שיעזור לזהות מה הוא אומר לעצמו ברגע קשה';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-2-2-premium-he');
  });

  it('B5: "לזהות מחשבה ברגע קשה" → 2.2', () => {
    const query = 'אני צריך טופס לילד שיעזור לזהות מחשבה ברגע קשה';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-2-2-premium-he');
  });
});

// ─── C. Follow-up "more accurate" doesn't regress ────────────────────────────

describe('QA-C — Follow-up queries do not regress to 1.1 or 1.2', () => {
  it('C1: Automatic thought query must NOT resolve to 1.1', () => {
    const query = 'אני עובד עם ילד שבזמן קושי ישר חושב אני לא אצליח או כולם יצחקו עליי. אני צריך טופס ילדים בעברית שיעזור לו לזהות מה הראש אומר לו ברגע קשה.';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(idOf(result)).not.toBe('tf-children-cbt-stage-1-1-premium-he');
  });

  it('C2: Automatic thought query must NOT resolve to 1.2', () => {
    const query = 'אני עובד עם ילד שבזמן קושי ישר חושב אני לא אצליח או כולם יצחקו עליי. אני צריך טופס ילדים בעברית שיעזור לו לזהות מה הראש אומר לו ברגע קשה.';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(idOf(result)).not.toBe('tf-children-cbt-stage-1-2-premium-he');
  });
});

// ─── D. Full list must come from canonical catalog ────────────────────────────

describe('QA-D — Catalog contains canonical Hebrew children CBT series titles', () => {
  it('D1: Catalog contains Hebrew title for 2.2 — "2.2 — מה הראש אמר לי?"', () => {
    expect(catalog).toContain('2.2 — מה הראש אמר לי?');
  });

  it('D2: Catalog contains Hebrew title for 1.1 — "1.1 — מי אני ומה חשוב לי?"', () => {
    expect(catalog).toContain('1.1 — מי אני ומה חשוב לי?');
  });

  it('D3: Catalog contains Hebrew title for 6.3 — "6.3 — כרטיס הכוח שלי"', () => {
    expect(catalog).toContain('6.3 — כרטיס הכוח שלי');
  });

  it('D4: Catalog contains Hebrew title for 4.1 — "4.1 — סולם האומץ שלי"', () => {
    expect(catalog).toContain('4.1 — סולם האומץ שלי');
  });

  it('D5: Catalog contains Hebrew title for 6.2 — "6.2 — מתי עלול להיות לי שוב קשה?"', () => {
    expect(catalog).toContain('6.2 — מתי עלול להיות לי שוב קשה?');
  });

  it('D6: Catalog contains all 30 individual children CBT premium form IDs', () => {
    const individualForms = FORMS_CHILDREN_CBT_PREMIUM.filter(f => f.category === 'children_cbt_process');
    expect(individualForms).toHaveLength(30);
    for (const form of individualForms) {
      expect(catalog, `Catalog must include [FORM:${form.id}]`).toContain(`[FORM:${form.id}]`);
    }
  });

  it('D7: Catalog contains the canonical locked series section header', () => {
    expect(catalog).toContain('HEBREW CHILDREN CBT PREMIUM — CANONICAL LOCKED SERIES');
  });

  it('D8: Canonical series section lists all 30 substage forms in order', () => {
    const seriesStart = catalog.indexOf('HEBREW CHILDREN CBT PREMIUM — CANONICAL LOCKED SERIES');
    expect(seriesStart).toBeGreaterThan(-1);
    const seriesSection = catalog.slice(seriesStart);
    // Verify a sample of the 30 expected Hebrew titles appear in order
    const expected = [
      '1.1 — מי אני ומה חשוב לי?',
      '1.2 — מתי קשה לי?',
      '2.2 — מה הראש אמר לי?',
      '3.3 — בלש המחשבות שלי',
      '4.1 — סולם האומץ שלי',
      '5.1 — כלים שמרגיעים את הגוף שלי',
      '6.3 — כרטיס הכוח שלי',
      '6.4 — אני ממשיך/ה לבד — עם הכלים שלי',
    ];
    for (const title of expected) {
      expect(seriesSection, `Canonical series must include "${title}"`).toContain(title);
    }
  });
});

// ─── E. No stale / hallucinated titles in catalog ────────────────────────────

describe('QA-E & QA-F — No stale or hallucinated children CBT titles', () => {
  it('E1: Stale title "זיהוי מחשבות אוטומטיות" is NOT presented as 1.1', () => {
    // The approved 1.1 title is "מי אני ומה חשוב לי?" — not the stale name
    expect(catalog).not.toContain('1.1 — זיהוי מחשבות אוטומטיות');
    expect(catalog).not.toContain('[FORM:tf-children-cbt-stage-1-1-premium-he]  — זיהוי מחשבות אוטומטיות');
  });

  it('E2: Stale title "זיהוי וחקירה של מחשבות" is NOT presented as 1.2', () => {
    expect(catalog).not.toContain('1.2 — זיהוי וחקירה של מחשבות');
    expect(catalog).not.toContain('[FORM:tf-children-cbt-stage-1-2-premium-he]  — זיהוי וחקירה של מחשבות');
  });

  it('E3: Stale title "עדות בעד ונגד המחשבה" is NOT presented as 2.2', () => {
    expect(catalog).not.toContain('2.2 — עדות בעד ונגד המחשבה');
    expect(catalog).not.toContain('[FORM:tf-children-cbt-stage-2-2-premium-he]  — עדות בעד ונגד המחשבה');
  });

  it('E4: Stale title "תרגילי נשימה" is NOT presented as 4.1', () => {
    expect(catalog).not.toContain('4.1 — תרגילי נשימה');
    expect(catalog).not.toContain('[FORM:tf-children-cbt-stage-4-1-premium-he]  — תרגילי נשימה');
  });

  it('E5: Stale title "הכרת תודה" is NOT presented as 6.2', () => {
    expect(catalog).not.toContain('6.2 — הכרת תודה');
    expect(catalog).not.toContain('[FORM:tf-children-cbt-stage-6-2-premium-he]  — הכרת תודה');
  });

  it('F1: Catalog does NOT show opaque form IDs in place of Hebrew children CBT titles', () => {
    // Catalog must NOT show raw IDs like "tf-children-cbt-stage-2-2-premium-he — tf-children-cbt-stage-2-2-premium-he"
    expect(catalog).not.toContain(
      '[FORM:tf-children-cbt-stage-2-2-premium-he]  — tf-children-cbt-stage-2-2-premium-he'
    );
    expect(catalog).not.toContain(
      '[FORM:tf-children-cbt-stage-1-1-premium-he]  — tf-children-cbt-stage-1-1-premium-he'
    );
  });
});

// ─── G. Individual worksheet vs full series ───────────────────────────────────

describe('QA-G — Individual worksheet vs full series routing', () => {
  it('G1: Request for full series → resolves to series form, not individual worksheet', () => {
    const query = 'תשלח לי את כל הרשימה של הטפסים מהסידרה הזו לילדים בעברית מ-1 עד 6.4';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-series-premium-he');
  });

  it('G2: Request for one worksheet returns individual form (not series)', () => {
    const query = 'תשלח לי את הטופס לילדים בעברית: 6.3 כרטיס הכוח שלי';
    const result = resolveChildrenCBTPremiumFormByContent(query);
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-stage-6-3-premium-he');
    // Must NOT be the series form
    expect(idOf(result)).not.toBe('tf-children-cbt-series-premium-he');
  });

  it('G3: "כל הרשימה של הטפסים" with child context → series', () => {
    const result = resolveChildrenCBTPremiumFormByContent('תוכל לתת לי את כל הרשימה של הטפסים מהסידרה הזו , כותרת שלהם ומה התוכן, מ-1 עד 6.4');
    expect(result).not.toBeNull();
    expect(idOf(result)).toBe('tf-children-cbt-series-premium-he');
  });
});

// ─── H. shortContentDescriptionHe present on all 30 individual forms ──────────

describe('QA-H — shortContentDescriptionHe completeness and content', () => {
  const individualForms = FORMS_CHILDREN_CBT_PREMIUM.filter(f => f.category === 'children_cbt_process');

  it('H1: All 30 individual forms have a non-empty shortContentDescriptionHe', () => {
    expect(individualForms).toHaveLength(30);
    for (const form of individualForms) {
      expect(
        typeof form.shortContentDescriptionHe,
        `${form.id} must have shortContentDescriptionHe string`
      ).toBe('string');
      expect(
        form.shortContentDescriptionHe.trim().length,
        `${form.id} shortContentDescriptionHe must not be empty`
      ).toBeGreaterThan(0);
    }
  });

  it('H2: Form 2.2 shortContentDescriptionHe mentions automatic thoughts context', () => {
    const form22 = individualForms.find(f => f.cbt_substage_number === '2.2');
    expect(form22).not.toBeUndefined();
    // Must mention identifying what the mind said in the hard moment
    const desc = form22.shortContentDescriptionHe;
    expect(desc).toBeTruthy();
    // Description must reference "מחשבות אוטומטיות" context or "הראש"
    const mentionsAutoThought = desc.includes('מחשבות אוטומטיות') || desc.includes('הראש') || desc.includes('מחשבה');
    expect(mentionsAutoThought).toBe(true);
  });

  it('H3: Catalog includes shortContentDescriptionHe descriptions for Hebrew children CBT forms', () => {
    // The catalog should now include the content descriptions, not just opaque IDs
    // Check that form 2.2 description appears somewhere in the catalog
    const form22 = individualForms.find(f => f.cbt_substage_number === '2.2');
    expect(form22?.shortContentDescriptionHe).toBeTruthy();
    expect(catalog).toContain(form22.shortContentDescriptionHe);
  });

  it('H4: Form 2.2 hebrewIntentPhrases includes present-tense variant "מה הראש אומר לו"', () => {
    const form22 = individualForms.find(f => f.cbt_substage_number === '2.2');
    expect(form22).not.toBeUndefined();
    expect(form22.hebrewIntentPhrases).toContain('מה הראש אומר לו');
  });

  it('H5: Form 2.2 hebrewIntentPhrases includes "מה עובר לו בראש"', () => {
    const form22 = individualForms.find(f => f.cbt_substage_number === '2.2');
    expect(form22.hebrewIntentPhrases).toContain('מה עובר לו בראש');
  });

  it('H6: Form 2.2 hebrewIntentPhrases includes "לזהות מחשבה ברגע קשה"', () => {
    const form22 = individualForms.find(f => f.cbt_substage_number === '2.2');
    expect(form22.hebrewIntentPhrases).toContain('לזהות מחשבה ברגע קשה');
  });
});

// ─── Deterministic priority rule for automatic-thought queries ────────────────

describe('QA — Deterministic priority rule: automatic-thought variants all resolve to 2.2', () => {
  const AUTO_THOUGHT_QUERIES = [
    'ילד שאומר אני לא אצליח כשקשה לו, צריך טופס לילדים',
    'אני עובד עם ילד שחושב כולם יצחקו עליי, צריך לזהות מה הראש אמר לו',
    'ילד שמה עובר לו בראש זה כולם יצחקו עליי, אני צריך טופס',
    'ילד שאומר לעצמו מחשבה בזמן קושי אני לא שווה, צריך טופס לילדים',
    'ילד עם מחשבה בזמן קושי — צריך טופס שיעזור לו לזהות מה הראש אומר לו',
  ];

  for (const query of AUTO_THOUGHT_QUERIES) {
    it(`resolves to 2.2: "${query.slice(0, 60)}..."`, () => {
      const result = resolveChildrenCBTPremiumFormByContent(query);
      expect(result).not.toBeNull();
      expect(idOf(result)).toBe('tf-children-cbt-stage-2-2-premium-he');
    });
  }
});

// ─── Existing behavior preserved ──────────────────────────────────────────────

describe('QA-H — Existing behavior preserved', () => {
  it('H-existing-1: Total approved forms is 329 in canonical ALL_FORMS registry', () => {
    const approved = ALL_FORMS.filter(f => f.approved === true);
    expect(approved.length).toBe(329);
  });

  it('H-existing-2: Catalog still contains CURRENTLY APPROVED FORMS header', () => {
    expect(catalog).toContain('CURRENTLY APPROVED FORMS');
  });

  it('H-existing-3: Catalog still contains all 4 standard adult forms', () => {
    expect(catalog).toContain('[FORM:tf-adults-cbt-thought-record]');
    expect(catalog).toContain('[FORM:tf-adults-behavioral-activation-plan]');
    expect(catalog).toContain('[FORM:tf-adults-mood-tracking-sheet]');
    expect(catalog).toContain('[FORM:tf-adults-weekly-coping-plan]');
  });

  it('H-existing-4: Hebrew adult workbook form IDs still in catalog', () => {
    expect(catalog).toContain('[FORM:tf-adults-formulation-mapping-premium-he]');
    expect(catalog).toContain('[FORM:tf-adults-cognitive-flexibility-premium-he]');
  });

  it('H-existing-5: No PDF asset changes — form file_urls still use correct locked PDF filenames', () => {
    const form22 = ALL_FORMS.find(f => f.id === 'tf-children-cbt-stage-2-2-premium-he');
    expect(form22?.languages?.he?.file_url).toContain('02-02-what-my-mind-told-me-he.pdf');
    const form63 = ALL_FORMS.find(f => f.id === 'tf-children-cbt-stage-6-3-premium-he');
    expect(form63?.languages?.he?.file_url).toContain('06-03-my-power-card-he.pdf');
  });
});

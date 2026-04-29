/**
 * Tests for TherapeuticForms Phase 4D — AI Form Catalog Exposure Fix.
 *
 * Root cause addressed:
 *   THERAPIST_FORM_LIBRARY_INSTRUCTIONS in workflowContextInjector.js was
 *   hardcoded to only two adult forms.  buildTherapistFormCatalog now generates
 *   the catalog dynamically from the approved TherapeuticForms registry.
 *
 * Requirements tested:
 *  1.  buildTherapistFormCatalog generates a non-empty catalog string.
 *  2.  Catalog contains all 18 approved form IDs.
 *  3.  Catalog contains more than two form entries (stale two-form list is gone).
 *  4.  Catalog total form count equals 18.
 *  5.  Catalog contains all 4 audience groups.
 *  6.  Catalog includes audience safety note for adolescents.
 *  7.  Catalog includes audience safety note for children.
 *  8.  Catalog contains no arbitrary URLs or file paths (client resolves those).
 *  9.  Catalog includes all 6 adult forms.
 * 10.  Catalog includes all 4 older-adult forms.
 * 11.  Catalog includes all 4 adolescent forms.
 * 12.  Catalog includes all 4 children forms.
 * 13.  All unique APPROVED_FORM_INTENT_MAP values appear in the catalog.
 * 14.  buildTherapistFormCatalog returns a catalog header even with no approved forms.
 * 15.  buildTherapistFormCatalog omits unapproved forms from the catalog.
 * 16.  CBT Thought Record original mapping still resolves (English).
 * 17.  Behavioral Activation Plan original mapping still resolves (English).
 * 18.  CBT Thought Record resolves to Hebrew metadata when lang=he.
 * 19.  Adolescent form only resolves with adolescent-specific alias (generic rejected).
 * 20.  Children grounding form resolves with child-specific alias.
 * 21.  Generic grounding alias does not resolve to a children form.
 */

import { describe, it, expect } from 'vitest';

import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import {
  resolveFormIntent,
  APPROVED_FORM_INTENT_MAP,
} from '../../src/utils/resolveFormIntent.js';

// ─── Derived test fixtures ────────────────────────────────────────────────────

const catalog = buildTherapistFormCatalog(ALL_FORMS);
const approvedForms = ALL_FORMS.filter(f => f.approved === true);
const uniqueApprovedFormIds = [...new Set(Object.values(APPROVED_FORM_INTENT_MAP))];

// ─── 1. Non-empty catalog ─────────────────────────────────────────────────────

describe('Phase 4D — buildTherapistFormCatalog: basic output', () => {
  it('generates a non-empty string', () => {
    expect(typeof catalog).toBe('string');
    expect(catalog.trim().length).toBeGreaterThan(0);
  });

  it('starts with the catalog header', () => {
    expect(catalog).toContain('CURRENTLY APPROVED FORMS');
  });
});

// ─── 2–4. All 18 approved form IDs present ────────────────────────────────────

describe('Phase 4D — buildTherapistFormCatalog: all 18 approved forms present', () => {
  it('registry has exactly 18 approved forms', () => {
    expect(approvedForms.length).toBe(18);
  });

  it('catalog contains all 18 approved form ID markers', () => {
    for (const form of approvedForms) {
      expect(catalog, `Catalog must include [FORM:${form.id}]`).toContain(`[FORM:${form.id}]`);
    }
  });

  it('catalog contains more than two form entries (stale two-form list is gone)', () => {
    const markerCount = (catalog.match(/\[FORM:[a-z0-9_-]+\]/g) || []).length;
    expect(markerCount).toBeGreaterThan(2);
  });

  it('catalog total form count is 18', () => {
    const markerCount = (catalog.match(/\[FORM:[a-z0-9_-]+\]/g) || []).length;
    expect(markerCount).toBe(18);
  });
});

// ─── 5–7. Audience groups and safety notes ────────────────────────────────────

describe('Phase 4D — buildTherapistFormCatalog: audience groups and safety notes', () => {
  it('contains Adults audience group', () => {
    expect(catalog).toContain('[Adults');
  });

  it('contains Older Adults audience group', () => {
    expect(catalog).toContain('[Older Adults');
  });

  it('contains Adolescents audience group', () => {
    expect(catalog).toContain('[Adolescents');
  });

  it('contains Children audience group', () => {
    expect(catalog).toContain('[Children');
  });

  it('includes audience safety note for adolescents', () => {
    expect(catalog).toContain('use ONLY when user is explicitly adolescent/teen');
  });

  it('includes audience safety note for children', () => {
    expect(catalog).toContain('use ONLY when user is explicitly a child');
  });
});

// ─── 8. No URLs in catalog ────────────────────────────────────────────────────

describe('Phase 4D — buildTherapistFormCatalog: no URLs (client resolves file paths)', () => {
  it('does not contain http/https URLs', () => {
    expect(catalog).not.toMatch(/https?:\/\//);
  });

  it('does not contain /forms/ file paths (client-side only)', () => {
    expect(catalog).not.toMatch(/\/forms\//);
  });
});

// ─── 9–12. Audience-specific form lists ──────────────────────────────────────

describe('Phase 4D — buildTherapistFormCatalog: 6 adult forms present', () => {
  it('includes tf-adults-cbt-thought-record', () => {
    expect(catalog).toContain('[FORM:tf-adults-cbt-thought-record]');
  });

  it('includes tf-adults-behavioral-activation-plan', () => {
    expect(catalog).toContain('[FORM:tf-adults-behavioral-activation-plan]');
  });

  it('includes tf-adults-cognitive-distortions-worksheet', () => {
    expect(catalog).toContain('[FORM:tf-adults-cognitive-distortions-worksheet]');
  });

  it('includes tf-adults-values-and-goals-worksheet', () => {
    expect(catalog).toContain('[FORM:tf-adults-values-and-goals-worksheet]');
  });

  it('includes tf-adults-mood-tracking-sheet', () => {
    expect(catalog).toContain('[FORM:tf-adults-mood-tracking-sheet]');
  });

  it('includes tf-adults-weekly-coping-plan', () => {
    expect(catalog).toContain('[FORM:tf-adults-weekly-coping-plan]');
  });
});

describe('Phase 4D — buildTherapistFormCatalog: 4 older-adult forms present', () => {
  it('includes tf-older-adults-mood-reflection-sheet', () => {
    expect(catalog).toContain('[FORM:tf-older-adults-mood-reflection-sheet]');
  });

  it('includes tf-older-adults-sleep-routine-reflection', () => {
    expect(catalog).toContain('[FORM:tf-older-adults-sleep-routine-reflection]');
  });

  it('includes tf-older-adults-daily-coping-plan', () => {
    expect(catalog).toContain('[FORM:tf-older-adults-daily-coping-plan]');
  });

  it('includes tf-older-adults-caregiver-support-reflection', () => {
    expect(catalog).toContain('[FORM:tf-older-adults-caregiver-support-reflection]');
  });
});

describe('Phase 4D — buildTherapistFormCatalog: 4 adolescent forms present', () => {
  it('includes tf-adolescents-anxiety-thought-record', () => {
    expect(catalog).toContain('[FORM:tf-adolescents-anxiety-thought-record]');
  });

  it('includes tf-adolescents-emotion-regulation-worksheet', () => {
    expect(catalog).toContain('[FORM:tf-adolescents-emotion-regulation-worksheet]');
  });

  it('includes tf-adolescents-weekly-practice-planner', () => {
    expect(catalog).toContain('[FORM:tf-adolescents-weekly-practice-planner]');
  });

  it('includes tf-adolescents-social-pressure-coping-tool', () => {
    expect(catalog).toContain('[FORM:tf-adolescents-social-pressure-coping-tool]');
  });
});

describe('Phase 4D — buildTherapistFormCatalog: 4 children forms present', () => {
  it('includes tf-children-feelings-checkin', () => {
    expect(catalog).toContain('[FORM:tf-children-feelings-checkin]');
  });

  it('includes tf-children-grounding-exercise', () => {
    expect(catalog).toContain('[FORM:tf-children-grounding-exercise]');
  });

  it('includes tf-children-parent-guided-coping-card', () => {
    expect(catalog).toContain('[FORM:tf-children-parent-guided-coping-card]');
  });

  it('includes tf-children-box-breathing', () => {
    expect(catalog).toContain('[FORM:tf-children-box-breathing]');
  });
});

// ─── 13. APPROVED_FORM_INTENT_MAP coverage ────────────────────────────────────

describe('Phase 4D — buildTherapistFormCatalog: all APPROVED_FORM_INTENT_MAP values present', () => {
  it('all unique APPROVED_FORM_INTENT_MAP values appear in the catalog', () => {
    for (const formId of uniqueApprovedFormIds) {
      expect(catalog, `Catalog must include [FORM:${formId}]`).toContain(`[FORM:${formId}]`);
    }
  });
});

// ─── 14–15. Edge cases ────────────────────────────────────────────────────────

describe('Phase 4D — buildTherapistFormCatalog: edge cases', () => {
  it('returns catalog header when no forms are approved', () => {
    const emptyCatalog = buildTherapistFormCatalog([]);
    expect(typeof emptyCatalog).toBe('string');
    expect(emptyCatalog).toContain('CURRENTLY APPROVED FORMS');
  });

  it('omits unapproved forms from the catalog', () => {
    const forms = [
      { id: 'unapproved-form', approved: false, audience: 'adults', category: 'test', languages: { en: { title: 'Should Not Appear' } } },
      { id: 'approved-form',   approved: true,  audience: 'adults', category: 'test', languages: { en: { title: 'Should Appear' } } },
    ];
    const result = buildTherapistFormCatalog(forms);
    expect(result).toContain('[FORM:approved-form]');
    expect(result).not.toContain('[FORM:unapproved-form]');
  });
});

// ─── 16–17. Existing original mappings still work ────────────────────────────

describe('Phase 4D — existing original AI intent mappings still resolve', () => {
  it('CBT Thought Record resolves via thought-record alias (English)', () => {
    const meta = resolveFormIntent('thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
    expect(meta.source).toBe('therapeutic_forms_library');
  });

  it('Behavioral Activation Plan resolves via behavioral-activation alias (English)', () => {
    const meta = resolveFormIntent('behavioral-activation', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-behavioral-activation-plan');
  });
});

// ─── 18. Hebrew session language ─────────────────────────────────────────────

describe('Phase 4D — Hebrew session language resolves Hebrew files', () => {
  it('CBT Thought Record resolves to Hebrew metadata when lang=he', () => {
    const meta = resolveFormIntent('thought-record', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });

  it('mood-tracking resolves to Hebrew metadata when lang=he', () => {
    const meta = resolveFormIntent('mood-tracking', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 19–21. Audience safety boundaries ───────────────────────────────────────

describe('Phase 4D — audience safety boundaries remain conservative', () => {
  it('generic "anxiety" alias returns null (requires audience-specific alias)', () => {
    const meta = resolveFormIntent('anxiety', 'en');
    expect(meta).toBeNull();
  });

  it('teen-specific alias resolves to adolescent anxiety thought record', () => {
    const meta = resolveFormIntent('teen-anxiety-worksheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.audience).toBe('adolescents');
  });

  it('child-specific grounding alias resolves to children grounding exercise', () => {
    const meta = resolveFormIntent('grounding-for-children', 'en');
    expect(meta).not.toBeNull();
    expect(meta.audience).toBe('children');
  });

  it('generic "grounding" alias returns null (requires child-specific alias)', () => {
    const meta = resolveFormIntent('grounding', 'en');
    expect(meta).toBeNull();
  });

  it('unknown form alias returns null', () => {
    const meta = resolveFormIntent('invented-form-that-does-not-exist', 'en');
    expect(meta).toBeNull();
  });
});

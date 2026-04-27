/**
 * Tests for TherapeuticForms Phase 4B — Expanded AI Form Intent Mappings.
 *
 * Phase 4B requirements tested:
 *  1.  Adult cognitive distortions form resolves via approved aliases.
 *  2.  Adult values-and-goals form resolves via approved aliases.
 *  3.  Adult mood tracking form resolves via approved aliases.
 *  4.  Adult weekly coping plan resolves via approved aliases.
 *  5.  Older adult mood reflection sheet resolves via approved aliases.
 *  6.  Older adult sleep routine reflection resolves via approved aliases.
 *  7.  Older adult daily coping plan resolves via approved aliases.
 *  8.  Older adult caregiver support reflection resolves via approved aliases.
 *  9.  Adolescent anxiety thought record resolves only with adolescent/teen aliases.
 * 10.  Adolescent emotion regulation resolves only with adolescent/teen wording.
 * 11.  Adolescent weekly practice planner resolves only with adolescent/teen wording.
 * 12.  Adolescent social pressure coping tool resolves.
 * 13.  Children feelings check-in resolves only with child/children wording.
 * 14.  Children grounding exercise resolves only with child/children wording.
 * 15.  Children parent-guided coping card resolves only with child/parent-guided wording.
 * 16.  Children box breathing resolves only with child/children wording.
 * 17.  Generic child/adolescent aliases that lack audience-specific wording do not resolve.
 * 18.  Unknown aliases return null.
 * 19.  Unapproved forms cannot resolve (tf-older-adults-coping-plan remains unapproved).
 * 20.  Hebrew language resolves Hebrew URLs and titles for newly approved forms.
 * 21.  Unsupported language falls back to English for newly approved forms.
 * 22.  [FORM:slug:he] explicit language overrides session language.
 * 23.  Existing Phase 3 mappings still work after Phase 4B expansion.
 * 24.  No arbitrary URL injection is possible via new aliases.
 * 25.  All APPROVED_FORM_INTENT_MAP values resolve successfully from the live registry.
 */

import { describe, it, expect } from 'vitest';
import {
  resolveFormIntent,
  APPROVED_FORM_INTENT_MAP,
  FORM_INTENT_MARKER_PATTERN,
} from '../../src/utils/resolveFormIntent.js';

// ─── 1. Adults: Cognitive Distortions ────────────────────────────────────────

describe('Phase 4B — Adults: Cognitive Distortions Worksheet', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-adults-cognitive-distortions-worksheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
    expect(meta.audience).toBe('adults');
    expect(meta.source).toBe('therapeutic_forms_library');
  });

  it('resolves via cognitive-distortions alias', () => {
    const meta = resolveFormIntent('cognitive-distortions', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('resolves via thinking-traps alias', () => {
    const meta = resolveFormIntent('thinking-traps', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('resolves via distorted-thinking alias', () => {
    const meta = resolveFormIntent('distorted-thinking', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('returns Hebrew URL and title when lang=he', () => {
    const meta = resolveFormIntent('cognitive-distortions', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
    expect(meta.title).toBe('דף עבודה לעיוותי חשיבה');
  });
});

// ─── 2. Adults: Values and Goals Worksheet ───────────────────────────────────

describe('Phase 4B — Adults: Values and Goals Worksheet', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-adults-values-and-goals-worksheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-values-and-goals-worksheet');
    expect(meta.audience).toBe('adults');
  });

  it('resolves via values-and-goals alias', () => {
    const meta = resolveFormIntent('values-and-goals', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-values-and-goals-worksheet');
  });

  it('resolves via goal-setting alias', () => {
    const meta = resolveFormIntent('goal-setting', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-values-and-goals-worksheet');
  });

  it('resolves via values-worksheet alias', () => {
    const meta = resolveFormIntent('values-worksheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-values-and-goals-worksheet');
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('values-and-goals', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 3. Adults: Mood Tracking Sheet ──────────────────────────────────────────

describe('Phase 4B — Adults: Mood Tracking Sheet', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-adults-mood-tracking-sheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-mood-tracking-sheet');
    expect(meta.audience).toBe('adults');
  });

  it('resolves via mood-tracking alias', () => {
    const meta = resolveFormIntent('mood-tracking', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-mood-tracking-sheet');
  });

  it('resolves via mood-tracker alias', () => {
    const meta = resolveFormIntent('mood-tracker', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-mood-tracking-sheet');
  });

  it('resolves via track-my-mood alias', () => {
    const meta = resolveFormIntent('track-my-mood', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-mood-tracking-sheet');
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('mood-tracking', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 4. Adults: Weekly Coping Plan ───────────────────────────────────────────

describe('Phase 4B — Adults: Weekly Coping Plan', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-adults-weekly-coping-plan', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-weekly-coping-plan');
    expect(meta.audience).toBe('adults');
  });

  it('resolves via weekly-coping-plan alias', () => {
    const meta = resolveFormIntent('weekly-coping-plan', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-weekly-coping-plan');
  });

  it('resolves via coping-plan alias', () => {
    const meta = resolveFormIntent('coping-plan', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-weekly-coping-plan');
  });

  it('resolves via weekly-plan alias', () => {
    const meta = resolveFormIntent('weekly-plan', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-weekly-coping-plan');
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('weekly-coping-plan', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 5. Older Adults: Mood Reflection Sheet ──────────────────────────────────

describe('Phase 4B — Older Adults: Mood Reflection Sheet', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-older-adults-mood-reflection-sheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-mood-reflection-sheet');
    expect(meta.audience).toBe('older_adults');
  });

  it('resolves via mood-reflection alias', () => {
    const meta = resolveFormIntent('mood-reflection', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-mood-reflection-sheet');
  });

  it('resolves via reflection-sheet alias', () => {
    const meta = resolveFormIntent('reflection-sheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-mood-reflection-sheet');
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('mood-reflection', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 6. Older Adults: Sleep Routine Reflection ───────────────────────────────

describe('Phase 4B — Older Adults: Sleep Routine Reflection', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-older-adults-sleep-routine-reflection', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-sleep-routine-reflection');
    expect(meta.audience).toBe('older_adults');
  });

  it('resolves via sleep-routine alias', () => {
    const meta = resolveFormIntent('sleep-routine', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-sleep-routine-reflection');
  });

  it('resolves via sleep-reflection alias', () => {
    const meta = resolveFormIntent('sleep-reflection', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-sleep-routine-reflection');
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('sleep-routine', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 7. Older Adults: Daily Coping Plan ──────────────────────────────────────

describe('Phase 4B — Older Adults: Daily Coping Plan', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-older-adults-daily-coping-plan', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-daily-coping-plan');
    expect(meta.audience).toBe('older_adults');
  });

  it('resolves via daily-coping-plan alias', () => {
    const meta = resolveFormIntent('daily-coping-plan', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-daily-coping-plan');
  });

  it('resolves via daily-coping alias', () => {
    const meta = resolveFormIntent('daily-coping', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-daily-coping-plan');
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('daily-coping', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 8. Older Adults: Caregiver Support Reflection ───────────────────────────

describe('Phase 4B — Older Adults: Caregiver Support Reflection', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-older-adults-caregiver-support-reflection', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-caregiver-support-reflection');
    expect(meta.audience).toBe('older_adults');
  });

  it('resolves via caregiver-support alias', () => {
    const meta = resolveFormIntent('caregiver-support', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-caregiver-support-reflection');
  });

  it('resolves via caregiver-reflection alias', () => {
    const meta = resolveFormIntent('caregiver-reflection', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-caregiver-support-reflection');
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('caregiver-support', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 9. Adolescents: Anxiety Thought Record ──────────────────────────────────

describe('Phase 4B — Adolescents: Anxiety Thought Record (audience-specific aliases required)', () => {
  it('resolves via adolescent-specific canonical ID', () => {
    const meta = resolveFormIntent('tf-adolescents-anxiety-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-anxiety-thought-record');
    expect(meta.audience).toBe('adolescents');
  });

  it('resolves via adolescent-anxiety-thought-record alias', () => {
    const meta = resolveFormIntent('adolescent-anxiety-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-anxiety-thought-record');
  });

  it('resolves via teen-anxiety-worksheet alias', () => {
    const meta = resolveFormIntent('teen-anxiety-worksheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-anxiety-thought-record');
  });

  it('generic anxiety alias (anxiety) does not resolve — audience ambiguous', () => {
    expect(resolveFormIntent('anxiety', 'en')).toBeNull();
  });
});

// ─── 10. Adolescents: Emotion Regulation Worksheet ───────────────────────────

describe('Phase 4B — Adolescents: Emotion Regulation Worksheet (audience-specific aliases required)', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-adolescents-emotion-regulation-worksheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-emotion-regulation-worksheet');
    expect(meta.audience).toBe('adolescents');
  });

  it('resolves via teen-emotion-regulation alias', () => {
    const meta = resolveFormIntent('teen-emotion-regulation', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-emotion-regulation-worksheet');
  });

  it('resolves via adolescent-emotion-worksheet alias', () => {
    const meta = resolveFormIntent('adolescent-emotion-worksheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-emotion-regulation-worksheet');
  });

  it('generic emotion-regulation alias does not resolve — audience ambiguous', () => {
    expect(resolveFormIntent('emotion-regulation', 'en')).toBeNull();
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('teen-emotion-regulation', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 11. Adolescents: Weekly Practice Planner ────────────────────────────────

describe('Phase 4B — Adolescents: Weekly Practice Planner (audience-specific aliases required)', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-adolescents-weekly-practice-planner', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-weekly-practice-planner');
    expect(meta.audience).toBe('adolescents');
  });

  it('resolves via teen-weekly-practice alias', () => {
    const meta = resolveFormIntent('teen-weekly-practice', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-weekly-practice-planner');
  });

  it('resolves via adolescent-weekly-planner alias', () => {
    const meta = resolveFormIntent('adolescent-weekly-planner', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-weekly-practice-planner');
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('teen-weekly-practice', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 12. Adolescents: Social Pressure Coping Tool ────────────────────────────

describe('Phase 4B — Adolescents: Social Pressure Coping Tool', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-adolescents-social-pressure-coping-tool', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-social-pressure-coping-tool');
    expect(meta.audience).toBe('adolescents');
  });

  it('resolves via social-pressure-coping alias', () => {
    const meta = resolveFormIntent('social-pressure-coping', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-social-pressure-coping-tool');
  });

  it('resolves via peer-pressure-coping alias', () => {
    const meta = resolveFormIntent('peer-pressure-coping', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-social-pressure-coping-tool');
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('social-pressure-coping', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 13. Children: Simple Feelings Check-In ──────────────────────────────────

describe('Phase 4B — Children: Simple Feelings Check-In (child/children wording required)', () => {
  it('resolves by canonical form ID (tf-children-feelings-checkin)', () => {
    const meta = resolveFormIntent('tf-children-feelings-checkin', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-feelings-checkin');
    expect(meta.audience).toBe('children');
  });

  it('resolves via children-feelings-check-in alias', () => {
    const meta = resolveFormIntent('children-feelings-check-in', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-feelings-checkin');
  });

  it('resolves via child-feelings-check-in alias', () => {
    const meta = resolveFormIntent('child-feelings-check-in', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-feelings-checkin');
  });

  it('generic feelings-check-in alias does not resolve — audience ambiguous', () => {
    expect(resolveFormIntent('feelings-check-in', 'en')).toBeNull();
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('children-feelings-check-in', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 14. Children: Grounding Exercise ────────────────────────────────────────

describe('Phase 4B — Children: Grounding Exercise (child/children wording required)', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-children-grounding-exercise', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-grounding-exercise');
    expect(meta.audience).toBe('children');
  });

  it('resolves via grounding-for-children alias', () => {
    const meta = resolveFormIntent('grounding-for-children', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-grounding-exercise');
  });

  it('resolves via child-grounding alias', () => {
    const meta = resolveFormIntent('child-grounding', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-grounding-exercise');
  });

  it('generic grounding alias does not resolve — audience ambiguous', () => {
    expect(resolveFormIntent('grounding', 'en')).toBeNull();
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('grounding-for-children', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 15. Children: Parent-Guided Coping Card ─────────────────────────────────

describe('Phase 4B — Children: Parent-Guided Coping Card (child/parent-guided wording required)', () => {
  it('resolves by canonical form ID (tf-children-coping-card)', () => {
    const meta = resolveFormIntent('tf-children-coping-card', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-coping-card');
    expect(meta.audience).toBe('children');
  });

  it('resolves via tf-children-parent-guided-coping-card slug alias', () => {
    const meta = resolveFormIntent('tf-children-parent-guided-coping-card', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-coping-card');
  });

  it('resolves via parent-guided-coping alias', () => {
    const meta = resolveFormIntent('parent-guided-coping', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-coping-card');
  });

  it('resolves via child-coping-card alias', () => {
    const meta = resolveFormIntent('child-coping-card', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-coping-card');
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('parent-guided-coping', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 16. Children: Box Breathing ─────────────────────────────────────────────

describe('Phase 4B — Children: Box Breathing (child/children wording required)', () => {
  it('resolves by canonical form ID', () => {
    const meta = resolveFormIntent('tf-children-box-breathing', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-box-breathing');
    expect(meta.audience).toBe('children');
  });

  it('resolves via box-breathing-for-children alias', () => {
    const meta = resolveFormIntent('box-breathing-for-children', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-box-breathing');
  });

  it('resolves via child-box-breathing alias', () => {
    const meta = resolveFormIntent('child-box-breathing', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-box-breathing');
  });

  it('generic box-breathing alias does not resolve — audience ambiguous', () => {
    expect(resolveFormIntent('box-breathing', 'en')).toBeNull();
  });

  it('returns Hebrew URL when lang=he', () => {
    const meta = resolveFormIntent('box-breathing-for-children', 'he');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });
});

// ─── 17. Generic aliases that lack audience-specific wording do not resolve ───

describe('Phase 4B — Generic unsafe aliases do not resolve', () => {
  it('generic "anxiety" does not resolve', () => {
    expect(resolveFormIntent('anxiety', 'en')).toBeNull();
  });

  it('generic "coping" does not resolve', () => {
    expect(resolveFormIntent('coping', 'en')).toBeNull();
  });

  it('generic "grounding" does not resolve', () => {
    expect(resolveFormIntent('grounding', 'en')).toBeNull();
  });

  it('generic "feelings" does not resolve', () => {
    expect(resolveFormIntent('feelings', 'en')).toBeNull();
  });

  it('generic "emotion-regulation" does not resolve', () => {
    expect(resolveFormIntent('emotion-regulation', 'en')).toBeNull();
  });

  it('generic "breathing" does not resolve', () => {
    expect(resolveFormIntent('breathing', 'en')).toBeNull();
  });

  it('generic "box-breathing" does not resolve — must use child/children prefix', () => {
    expect(resolveFormIntent('box-breathing', 'en')).toBeNull();
  });
});

// ─── 18. Unknown aliases return null ─────────────────────────────────────────

describe('Phase 4B — Unknown aliases return null', () => {
  it('completely unknown slug returns null', () => {
    expect(resolveFormIntent('totally-unknown-form', 'en')).toBeNull();
  });

  it('partial form ID returns null', () => {
    expect(resolveFormIntent('tf-adults', 'en')).toBeNull();
  });

  it('empty string returns null', () => {
    expect(resolveFormIntent('', 'en')).toBeNull();
  });
});

// ─── 19. Unapproved forms cannot resolve ─────────────────────────────────────

describe('Phase 4B — Unapproved forms cannot resolve', () => {
  it('tf-older-adults-coping-plan (unapproved) is not in the map', () => {
    expect(APPROVED_FORM_INTENT_MAP['tf-older-adults-coping-plan']).toBeUndefined();
  });

  it('tf-older-adults-sleep-reflection-worksheet (unapproved) is not in the map', () => {
    expect(APPROVED_FORM_INTENT_MAP['tf-older-adults-sleep-reflection-worksheet']).toBeUndefined();
  });

  it('tf-older-adults-coping-plan slug does not resolve', () => {
    expect(resolveFormIntent('tf-older-adults-coping-plan', 'en')).toBeNull();
  });
});

// ─── 20. Hebrew language resolves Hebrew URLs and titles ──────────────────────

describe('Phase 4B — Hebrew language resolves correctly for newly approved forms', () => {
  it('cognitive-distortions in Hebrew has /he/ in URL', () => {
    const meta = resolveFormIntent('cognitive-distortions', 'he');
    expect(meta).not.toBeNull();
    expect(meta.url).toMatch(/^\/forms\/he\//);
  });

  it('sleep-routine in Hebrew has /he/ in URL', () => {
    const meta = resolveFormIntent('sleep-routine', 'he');
    expect(meta).not.toBeNull();
    expect(meta.url).toMatch(/^\/forms\/he\//);
  });

  it('teen-emotion-regulation in Hebrew has /he/ in URL', () => {
    const meta = resolveFormIntent('teen-emotion-regulation', 'he');
    expect(meta).not.toBeNull();
    expect(meta.url).toMatch(/^\/forms\/he\//);
  });

  it('children-box-breathing in Hebrew has /he/ in URL', () => {
    const meta = resolveFormIntent('children-box-breathing', 'he');
    expect(meta).not.toBeNull();
    expect(meta.url).toMatch(/^\/forms\/he\//);
  });
});

// ─── 21. Unsupported language falls back to English ──────────────────────────

describe('Phase 4B — Unsupported language falls back to English', () => {
  it('cognitive-distortions in French falls back to English', () => {
    const meta = resolveFormIntent('cognitive-distortions', 'fr');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('en');
    expect(meta.url).toContain('/en/');
  });

  it('sleep-routine in Spanish falls back to English', () => {
    const meta = resolveFormIntent('sleep-routine', 'es');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('en');
  });

  it('teen-weekly-practice in German falls back to English', () => {
    const meta = resolveFormIntent('teen-weekly-practice', 'de');
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('en');
  });
});

// ─── 22. [FORM:slug:he] explicit language override ───────────────────────────

describe('Phase 4B — [FORM:slug:he] explicit language overrides session language', () => {
  it('extracts language from FORM marker pattern', () => {
    const marker = '[FORM:cognitive-distortions:he]';
    const matches = [...marker.matchAll(new RegExp(FORM_INTENT_MARKER_PATTERN.source, 'g'))];
    expect(matches.length).toBe(1);
    const [, slug, lang] = matches[0];
    expect(slug).toBe('cognitive-distortions');
    expect(lang).toBe('he');
    const meta = resolveFormIntent(slug, lang);
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toContain('/he/');
  });

  it('extracts language from FORM marker for adolescent form', () => {
    const marker = '[FORM:teen-anxiety-worksheet:he]';
    const matches = [...marker.matchAll(new RegExp(FORM_INTENT_MARKER_PATTERN.source, 'g'))];
    const [, slug, lang] = matches[0];
    const meta = resolveFormIntent(slug, lang);
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.form_id).toBe('tf-adolescents-anxiety-thought-record');
  });
});

// ─── 23. Existing Phase 3 mappings still work ────────────────────────────────

describe('Phase 4B — Existing Phase 3 mappings still work', () => {
  it('thought-record still resolves', () => {
    const meta = resolveFormIntent('thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('behavioral-activation still resolves', () => {
    const meta = resolveFormIntent('behavioral-activation', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-behavioral-activation-plan');
  });

  it('tf-adults-cbt-thought-record canonical ID still resolves', () => {
    const meta = resolveFormIntent('tf-adults-cbt-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('cbt-thought-record alias still resolves', () => {
    const meta = resolveFormIntent('cbt-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
  });
});

// ─── 24. No arbitrary URL injection is possible ──────────────────────────────

describe('Phase 4B — No arbitrary URL injection is possible', () => {
  it('URL-shaped intent returns null', () => {
    expect(resolveFormIntent('https://evil.example.com/form.pdf', 'en')).toBeNull();
  });

  it('file path intent returns null', () => {
    expect(resolveFormIntent('/forms/en/adults/cognitive-distortions-worksheet.pdf', 'en')).toBeNull();
  });

  it('new adult form alias does not accept URL injection', () => {
    expect(resolveFormIntent('https://example.com/cognitive-distortions.pdf', 'en')).toBeNull();
  });

  it('new adolescent form alias does not accept URL injection', () => {
    expect(resolveFormIntent('http://teen-anxiety-worksheet.evil.com', 'en')).toBeNull();
  });
});

// ─── 25. All APPROVED_FORM_INTENT_MAP values resolve from live registry ───────

describe('Phase 4B — All APPROVED_FORM_INTENT_MAP values resolve from live registry', () => {
  it('every value in the map resolves to valid metadata', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const meta = resolveFormIntent(formId, 'en');
      expect(meta, `${formId} must resolve with valid file_url`).not.toBeNull();
      expect(meta.url, `${formId} url must not be empty`).toBeTruthy();
      expect(meta.source).toBe('therapeutic_forms_library');
    }
  });

  it('every value in the map also resolves in Hebrew', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const meta = resolveFormIntent(formId, 'he');
      expect(meta, `${formId} must resolve in Hebrew`).not.toBeNull();
    }
  });
});

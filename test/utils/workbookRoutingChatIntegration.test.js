/**
 * Workbook Routing — Chat Integration Tests
 *
 * Verifies that `sanitizeConversationMessages` correctly applies workbook
 * routing priority when the user's message contains explicit workbook-trigger
 * language (קונטרס, חוברת, …).
 *
 * Requirements from problem statement:
 *
 *  1. No auto-attach:
 *     "אני רוצה ללמוד להפריך מחשבות שליליות"
 *     → assistant response without [FORM:…] marker produces no generated_file.
 *
 *  2. Individual worksheet request preserved:
 *     User: "האם יש לך דפי עבודה או טופס לנושא?" (no קונטרס trigger)
 *     AI: [FORM:cbt-thought-record:he]
 *     → generated_file stays as cbt-thought-record.
 *
 *  3. Workbook follow-up routing (core fix):
 *     Previous context: "אני רוצה ללמוד להפריך מחשבות שליליות"
 *     Triggering query : "אולי יש לך גם קונטרס אחר לזה?"
 *     AI (wrong)       : [FORM:cognitive-distortions-worksheet:he]
 *     → sanitizeConversationMessages upgrades to adults-cognitive-flexibility-premium-he.
 *     → must NOT be cbt-thought-record or cognitive-distortions-worksheet.
 *
 *  4. Explicit workbook query (single-turn):
 *     User: "וקונטרס טיפולי?" after negative-thoughts context
 *     AI  : [FORM:cognitive-distortions-worksheet:he] (wrong)
 *     → upgraded to adults-cognitive-flexibility-premium-he.
 *
 *  5. Wording / category:
 *     Upgraded generated_file must have category === 'workbook_series'.
 *
 *  6. Direct worksheet request preserved:
 *     "שלח לי רשומת מחשבות CBT" (no קונטרס trigger)
 *     AI: [FORM:cbt-thought-record:he]
 *     → stays as cbt-thought-record.
 *
 *     "שלח לי דף עבודה לעיוותי חשיבה" (no קונטרס trigger)
 *     AI: [FORM:cognitive-distortions-worksheet:he]
 *     → stays as cognitive-distortions-worksheet.
 *
 *  7. Regression:
 *     All 7 workbooks can be resolved via [FORM:slug:he].
 *     All 18 individual forms can still be resolved via [FORM:slug:he/en].
 */

import { describe, it, expect } from 'vitest';
import { sanitizeConversationMessages } from '../../src/components/utils/validateAgentOutput.jsx';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Build a minimal alternating conversation where the last assistant message
 * contains the given form marker.
 *
 * @param {string}   userQuery         - The triggering user message.
 * @param {string}   aiFormMarker      - e.g. "[FORM:cognitive-distortions-worksheet:he]"
 * @param {string[]} [priorUserMsgs]   - Earlier user messages for context (optional).
 * @returns {object[]} Message array ready for sanitizeConversationMessages.
 */
function buildConversation(userQuery, aiFormMarker, priorUserMsgs = []) {
  const msgs = [];
  for (const prior of priorUserMsgs) {
    msgs.push({ role: 'user', content: prior });
    msgs.push({ role: 'assistant', content: 'אני שומע אותך.' });
  }
  msgs.push({ role: 'user', content: userQuery });
  msgs.push({ role: 'assistant', content: `צירפתי לך משהו מועיל. ${aiFormMarker}` });
  return msgs;
}

// ─── 1. No auto-attach ────────────────────────────────────────────────────────

describe('No auto-attach — plain therapeutic guidance without a form marker', () => {
  it('assistant response without [FORM:…] produces no generated_file', () => {
    const messages = [
      { role: 'user', content: 'אני רוצה ללמוד להפריך מחשבות שליליות' },
      { role: 'assistant', content: 'בואי נדבר על הפרכת מחשבות שליליות. זה תהליך שנקרא שאלות סוקרטיות.' }
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistantMsg = result.find(m => m.role === 'assistant');
    expect(assistantMsg?.metadata?.generated_file).toBeUndefined();
  });
});

// ─── 2. Individual worksheet request preserved ────────────────────────────────

describe('Individual worksheet request — no workbook trigger → preserve worksheet', () => {
  it('"דפי עבודה או טופס" query keeps cbt-thought-record', () => {
    const msgs = buildConversation(
      'האם יש לך דפי עבודה או טופס לנושא?',
      '[FORM:cbt-thought-record:he]',
      ['אני רוצה ללמוד להפריך מחשבות שליליות']
    );
    const result = sanitizeConversationMessages(msgs, 'he');
    const assistantMsg = result[result.length - 1];
    expect(assistantMsg.role).toBe('assistant');
    expect(assistantMsg.metadata?.generated_file).toBeDefined();
    expect(assistantMsg.metadata.generated_file.form_id).toBe('tf-adults-cbt-thought-record');
    // Must NOT be upgraded to a workbook
    expect(assistantMsg.metadata.generated_file.category).not.toBe('workbook_series');
  });
});

// ─── 3. Workbook follow-up routing (core fix) ────────────────────────────────

describe('Workbook follow-up routing — "קונטרס אחר לזה?" after negative-thoughts context', () => {
  const priorContext = ['אני רוצה ללמוד להפריך מחשבות שליליות'];
  const triggeringQuery = 'אולי יש לך גם קונטרס אחר לזה?';
  // Simulate the AI returning the wrong (individual) form
  const aiWrongMarker = '[FORM:cognitive-distortions-worksheet:he]';

  it('upgrades to adults-cognitive-flexibility-premium-he', () => {
    const msgs = buildConversation(triggeringQuery, aiWrongMarker, priorContext);
    const res = sanitizeConversationMessages(msgs, 'he');
    const last = res[res.length - 1];
    expect(last.metadata?.generated_file).toBeDefined();
    expect(last.metadata.generated_file.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('returns workbook_series category (not individual worksheet)', () => {
    const msgs = buildConversation(triggeringQuery, aiWrongMarker, priorContext);
    const res = sanitizeConversationMessages(msgs, 'he');
    const last = res[res.length - 1];
    expect(last.metadata.generated_file.category).toBe('workbook_series');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const msgs = buildConversation(triggeringQuery, aiWrongMarker, priorContext);
    const res = sanitizeConversationMessages(msgs, 'he');
    const last = res[res.length - 1];
    expect(last.metadata.generated_file.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('does NOT resolve to cognitive-distortions-worksheet', () => {
    const msgs = buildConversation(triggeringQuery, aiWrongMarker, priorContext);
    const res = sanitizeConversationMessages(msgs, 'he');
    const last = res[res.length - 1];
    expect(last.metadata.generated_file.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('resolved form has Hebrew language', () => {
    const msgs = buildConversation(triggeringQuery, aiWrongMarker, priorContext);
    const res = sanitizeConversationMessages(msgs, 'he');
    const last = res[res.length - 1];
    expect(last.metadata.generated_file.language).toBe('he');
  });
});

// ─── 4. Explicit workbook query (single-turn) ─────────────────────────────────

describe('Explicit workbook query — "וקונטרס טיפולי?" after negative-thoughts context', () => {
  it('upgrades cognitive-distortions-worksheet to adults-cognitive-flexibility-premium-he', () => {
    const msgs = buildConversation(
      'וקונטרס טיפולי?',
      '[FORM:cognitive-distortions-worksheet:he]',
      ['אני רוצה ללמוד להפריך מחשבות שליליות']
    );
    const result = sanitizeConversationMessages(msgs, 'he');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
    expect(last.metadata.generated_file.category).toBe('workbook_series');
  });
});

// ─── 5. Workbook category wording ─────────────────────────────────────────────

describe('Workbook category — upgraded form must be workbook_series', () => {
  it('category is workbook_series when upgraded', () => {
    const msgs = buildConversation(
      'יש לך קונטרס לזה?',
      '[FORM:cbt-thought-record:he]',
      ['מחשבות שליליות הפרכת מחשבות גמישות מחשבתית']
    );
    const result = sanitizeConversationMessages(msgs, 'he');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.category).toBe('workbook_series');
  });
});

// ─── 6. Direct worksheet requests preserved ───────────────────────────────────

describe('Direct worksheet requests — no workbook trigger → keep individual forms', () => {
  it('"שלח לי רשומת מחשבות CBT" keeps cbt-thought-record', () => {
    const msgs = buildConversation(
      'שלח לי רשומת מחשבות CBT',
      '[FORM:cbt-thought-record:he]'
    );
    const result = sanitizeConversationMessages(msgs, 'he');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-cbt-thought-record');
    expect(last.metadata.generated_file.category).not.toBe('workbook_series');
  });

  it('"שלח לי דף עבודה לעיוותי חשיבה" keeps cognitive-distortions-worksheet', () => {
    const msgs = buildConversation(
      'שלח לי דף עבודה לעיוותי חשיבה',
      '[FORM:cognitive-distortions-worksheet:he]'
    );
    const result = sanitizeConversationMessages(msgs, 'he');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
    expect(last.metadata.generated_file.category).not.toBe('workbook_series');
  });
});

// ─── 7. Regression ────────────────────────────────────────────────────────────

describe('Regression — all 7 workbooks remain sendable via [FORM:slug:he]', () => {
  const WORKBOOK_SLUGS = [
    'adults-formulation-mapping-premium-he',
    'adults-awareness-identification-premium-he',
    'adults-cognitive-flexibility-premium-he',
    'adults-emotional-regulation-premium-he',
    'adults-coping-change-premium-he',
    'adults-strengths-resilience-premium-he',
    'adults-treatment-summary-custom-forms-premium-he',
  ];

  for (const slug of WORKBOOK_SLUGS) {
    it(`[FORM:${slug}:he] resolves correctly as workbook_series`, () => {
      const msgs = [
        { role: 'user', content: 'שלח לי קונטרס' },
        { role: 'assistant', content: `[FORM:${slug}:he]` }
      ];
      const result = sanitizeConversationMessages(msgs, 'he');
      const last = result[result.length - 1];
      expect(last.metadata?.generated_file, `Workbook ${slug} must resolve`).toBeDefined();
      expect(last.metadata.generated_file.category).toBe('workbook_series');
      expect(last.metadata.generated_file.language).toBe('he');
    });
  }
});

describe('Regression — 18 individual forms still resolve via [FORM:slug:he/en]', () => {
  const INDIVIDUAL_FORMS = ALL_FORMS.filter(
    f => f.approved && f.category !== 'workbook_series'
  );

  it('has exactly 18 approved individual forms', () => {
    expect(INDIVIDUAL_FORMS.length).toBe(18);
  });

  for (const form of INDIVIDUAL_FORMS) {
    // Pick a language the form is known to have; fall back to 'en' if Hebrew is absent.
    // All approved forms must have at least one valid language block.
    const testLang = form.languages?.he ? 'he' : 'en';
    it(`[FORM:${form.slug}:${testLang}] still resolves (no workbook upgrade without trigger)`, () => {
      // Neutral user query with no workbook trigger language
      const msgs = buildConversation(
        'שלח לי את הטופס',
        `[FORM:${form.slug}:${testLang}]`
      );
      const result = sanitizeConversationMessages(msgs, testLang);
      const last = result[result.length - 1];
      expect(last.metadata?.generated_file, `Form ${form.slug} must resolve`).toBeDefined();
      expect(last.metadata.generated_file.form_id).toBe(form.id);
      // Must remain an individual form (no upgrade without trigger)
      expect(last.metadata.generated_file.category).not.toBe('workbook_series');
    });
  }
});

// ─── 8. Context-aware: coping topic with workbook trigger ─────────────────────

describe('Context-aware routing — coping topic + workbook trigger', () => {
  it('"קונטרס לזה?" after coping context → adults-coping-change-premium-he', () => {
    const msgs = buildConversation(
      'יש לך גם קונטרס לזה?',
      '[FORM:behavioral-activation-plan:he]',
      ['אני מתקשה עם דחיינות, הימנעות והרגלים מקשים']
    );
    const result = sanitizeConversationMessages(msgs, 'he');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-coping-change-premium-he');
    expect(last.metadata.generated_file.category).toBe('workbook_series');
  });
});

// ─── Spanish workbook routing via sanitizeConversationMessages ────────────────
//
// These tests verify that the language-dispatched workbook routing override
// in extractAndResolveFormIntent correctly upgrades individual worksheets to
// the matching Spanish workbook when the user's message contains Spanish
// workbook-trigger language (cuaderno / cuaderno de trabajo / …).

/**
 * Build a minimal Spanish conversation for testing.
 */
function buildSpanishConversation(userQuery, aiFormMarker, priorUserMsgs = []) {
  const msgs = [];
  for (const prior of priorUserMsgs) {
    msgs.push({ role: 'user', content: prior, metadata: { session_language: 'es' } });
    msgs.push({ role: 'assistant', content: 'Entendido.' });
  }
  msgs.push({ role: 'user', content: userQuery, metadata: { session_language: 'es' } });
  msgs.push({ role: 'assistant', content: `Te adjunto algo útil. ${aiFormMarker}` });
  return msgs;
}

describe('Spanish workbook routing — "cuaderno" for negative thoughts', () => {
  const query = '¿Tienes un cuaderno para pensamientos negativos?';
  const aiWrongMarker = '[FORM:cbt-thought-record:es]';

  it('upgrades cbt-thought-record to adults-cognitive-flexibility-premium-es', () => {
    const msgs = buildSpanishConversation(query, aiWrongMarker);
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file).toBeDefined();
    expect(last.metadata.generated_file.form_id).toBe('tf-adults-cognitive-flexibility-premium-es');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const msgs = buildSpanishConversation(query, aiWrongMarker);
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata.generated_file.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('does NOT resolve to cognitive-distortions-worksheet', () => {
    const msgs = buildSpanishConversation(query, '[FORM:cognitive-distortions-worksheet:es]');
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata.generated_file.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('returns workbook_series category in Spanish', () => {
    const msgs = buildSpanishConversation(query, aiWrongMarker);
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata.generated_file.category).toBe('workbook_series');
    expect(last.metadata.generated_file.language).toBe('es');
  });
});

describe('Spanish workbook routing — "cuaderno" for procrastination/avoidance/habits', () => {
  const query = '¿Tienes un cuaderno para procrastinación, evitación y hábitos difíciles?';
  const aiWrongMarker = '[FORM:behavioral-activation-plan:es]';

  it('upgrades behavioral-activation-plan to adults-coping-change-premium-es', () => {
    const msgs = buildSpanishConversation(query, aiWrongMarker);
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-coping-change-premium-es');
  });

  it('does NOT resolve to behavioral-activation-plan', () => {
    const msgs = buildSpanishConversation(query, aiWrongMarker);
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata.generated_file.form_id).not.toBe('tf-adults-behavioral-activation-plan');
  });

  it('returns workbook_series in Spanish', () => {
    const msgs = buildSpanishConversation(query, aiWrongMarker);
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata.generated_file.category).toBe('workbook_series');
    expect(last.metadata.generated_file.language).toBe('es');
  });
});

describe('Spanish workbook routing — "cuaderno" for emotional regulation', () => {
  it('upgrades mood-tracking-sheet to adults-emotional-regulation-premium-es', () => {
    const query = '¿Tienes un cuaderno para regulación emocional y emociones fuertes?';
    const msgs = buildSpanishConversation(query, '[FORM:mood-tracking-sheet:es]');
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-emotional-regulation-premium-es');
    expect(last.metadata.generated_file.category).toBe('workbook_series');
  });
});

describe('Spanish workbook routing — "cuaderno" for strengths/resilience/self-efficacy', () => {
  it('upgrades values-and-goals-worksheet to adults-strengths-resilience-premium-es', () => {
    const query = '¿Tienes un cuaderno para fortalezas, resiliencia, confianza y autoeficacia?';
    const msgs = buildSpanishConversation(query, '[FORM:values-and-goals-worksheet:es]');
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-strengths-resilience-premium-es');
    expect(last.metadata.generated_file.category).toBe('workbook_series');
  });
});

describe('Spanish workbook routing — "cuaderno" for treatment summary', () => {
  it('resolves to adults-treatment-summary-custom-forms-premium-es', () => {
    const query = 'Estoy terminando terapia y quiero un cuaderno de resumen del tratamiento y formularios personalizados';
    const msgs = buildSpanishConversation(query, '[FORM:cbt-thought-record:es]');
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-es');
    expect(last.metadata.generated_file.category).toBe('workbook_series');
  });
});

describe('Spanish workbook routing — no forced attachment for therapeutic conversation', () => {
  it('"Quiero trabajar pensamientos negativos" with no form marker → no generated_file', () => {
    const msgs = [
      { role: 'user', content: 'Quiero trabajar pensamientos negativos', metadata: { session_language: 'es' } },
      { role: 'assistant', content: 'Vamos a trabajar en eso juntos.' }
    ];
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file).toBeUndefined();
  });
});

describe('Spanish workbook routing — "hoja de trabajo" keeps individual worksheet', () => {
  it('"¿Tienes una hoja de trabajo para pensamientos negativos?" keeps cbt-thought-record', () => {
    const msgs = buildSpanishConversation(
      '¿Tienes una hoja de trabajo para pensamientos negativos?',
      '[FORM:cbt-thought-record:es]'
    );
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-cbt-thought-record');
    // Must NOT be upgraded to a workbook
    expect(last.metadata.generated_file.category).not.toBe('workbook_series');
  });
});

describe('Spanish workbook routing — direct named individual form requests preserved', () => {
  it('"Envíame el Registro de Pensamientos TCC" keeps cbt-thought-record', () => {
    const msgs = buildSpanishConversation(
      'Envíame el Registro de Pensamientos TCC',
      '[FORM:cbt-thought-record:es]'
    );
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-cbt-thought-record');
    expect(last.metadata.generated_file.category).not.toBe('workbook_series');
  });

  it('"Envíame el Plan de Activación Conductual" keeps behavioral-activation-plan', () => {
    const msgs = buildSpanishConversation(
      'Envíame el Plan de Activación Conductual',
      '[FORM:behavioral-activation-plan:es]'
    );
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-behavioral-activation-plan');
    expect(last.metadata.generated_file.category).not.toBe('workbook_series');
  });
});

describe('Spanish workbook routing — workbook card must not be labeled as worksheet', () => {
  it('Spanish workbook metadata has category workbook_series (not individual form)', () => {
    const msgs = buildSpanishConversation(
      '¿Tienes un cuaderno para pensamientos negativos?',
      '[FORM:cbt-thought-record:es]'
    );
    const result = sanitizeConversationMessages(msgs, 'es');
    const last = result[result.length - 1];
    // After override, category must be workbook_series (not individual worksheet)
    expect(last.metadata?.generated_file?.category).toBe('workbook_series');
  });
});

describe('Regression — Hebrew workbook routing unaffected', () => {
  it('"קונטרס לזה?" after negative thoughts context still resolves to Hebrew workbook', () => {
    const msgs = buildConversation(
      'יש לך קונטרס לזה?',
      '[FORM:cbt-thought-record:he]',
      ['מחשבות שליליות הפרכת מחשבות']
    );
    const result = sanitizeConversationMessages(msgs, 'he');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
    expect(last.metadata.generated_file.language).toBe('he');
  });
});

describe('Regression — English workbook routing unaffected', () => {
  it('"Do you have a workbook for negative thoughts?" upgrades to English workbook', () => {
    const msgs = [
      { role: 'user', content: 'Do you have a workbook for negative thoughts?', metadata: { session_language: 'en' } },
      { role: 'assistant', content: `Here you go. [FORM:cbt-thought-record:en]` }
    ];
    const result = sanitizeConversationMessages(msgs, 'en');
    const last = result[result.length - 1];
    expect(last.metadata?.generated_file?.form_id).toBe('tf-adults-cognitive-flexibility-premium-en');
    expect(last.metadata.generated_file.category).toBe('workbook_series');
    expect(last.metadata.generated_file.language).toBe('en');
  });
});


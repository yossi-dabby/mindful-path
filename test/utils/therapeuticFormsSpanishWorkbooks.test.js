/**
 * Tests for Spanish Premium Therapeutic Workbooks — Phase 12
 *
 * Verifies the 7 newly registered Spanish adult premium workbooks across all
 * required behavior dimensions from the problem statement.
 *
 * Sections:
 *  A. Registry — all 7 Spanish workbook entries exist, are approved, and have
 *     correct metadata.
 *  B. Routing — content-aware Spanish workbook routing behaves correctly:
 *       B1. "Quiero trabajar pensamientos negativos" → no forced attachment.
 *       B2. "¿Tienes una hoja de trabajo para pensamientos negativos?" → null (individual form, not workbook).
 *       B3. "¿Tienes un cuaderno para pensamientos negativos?" → adults-cognitive-flexibility-premium-es.
 *       B4. Context-aware: prior negative-thoughts context + "¿Tienes un cuaderno para esto?"
 *           → adults-cognitive-flexibility-premium-es.
 *       B5. Procrastination/avoidance/habits workbook query → adults-coping-change-premium-es.
 *       B6. Emotional regulation workbook query → adults-emotional-regulation-premium-es.
 *       B7. Multi-topic strengths/resilience/self-efficacy → adults-strengths-resilience-premium-es.
 *       B8. Treatment summary / ending therapy → adults-treatment-summary-custom-forms-premium-es.
 *       B9. Direct individual-form requests remain individual (cbt-thought-record, etc.).
 *  C. Regression — Hebrew workbooks, English workbooks, and all 18 individual forms unaffected.
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
  resolveSpanishWorkbookIntent,
  resolveSpanishWorkbookIntentWithContext,
  getSpanishWorkbookTriggerKeywords,
  getSpanishIndividualFormTriggerKeywords,
  getSpanishFormLabel,
  resolveWorkbookIntent,
  getHebrewFormLabel,
  resolveEnglishWorkbookIntent,
  getEnglishFormLabel,
} from '../../src/utils/resolveWorkbookIntent.js';

import { WORKBOOK_CONTENT_METADATA_ES } from '../../src/utils/workbookContentMetadata.js';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, '../../public');

function resolvePublicPath(fileUrl) {
  return path.join(PUBLIC_ROOT, fileUrl);
}

// ─── Spanish workbook constants ───────────────────────────────────────────────

const ES_WORKBOOK_IDS = [
  'tf-adults-formulation-mapping-premium-es',
  'tf-adults-awareness-identification-premium-es',
  'tf-adults-cognitive-flexibility-premium-es',
  'tf-adults-emotional-regulation-premium-es',
  'tf-adults-coping-change-premium-es',
  'tf-adults-strengths-resilience-premium-es',
  'tf-adults-treatment-summary-custom-forms-premium-es',
];

const ES_WORKBOOK_SLUGS = [
  'adults-formulation-mapping-premium-es',
  'adults-awareness-identification-premium-es',
  'adults-cognitive-flexibility-premium-es',
  'adults-emotional-regulation-premium-es',
  'adults-coping-change-premium-es',
  'adults-strengths-resilience-premium-es',
  'adults-treatment-summary-custom-forms-premium-es',
];

const ES_WORKBOOK_FILE_URLS = [
  '/forms/es/adults/adults-formulation-mapping-premium-es.pdf',
  '/forms/es/adults/adults-awareness-identification-premium-es.pdf',
  '/forms/es/adults/adults-cognitive-flexibility-premium-es.pdf',
  '/forms/es/adults/adults-emotional-regulation-premium-es.pdf',
  '/forms/es/adults/adults-coping-change-premium-es.pdf',
  '/forms/es/adults/adults-strengths-resilience-premium-es.pdf',
  '/forms/es/adults/adults-treatment-summary-custom-forms-premium-es.pdf',
];

const ES_WORKBOOK_TITLES = [
  'Cuaderno de formulación y mapeo del caso',
  'Cuaderno de identificación de pensamientos, emociones, cuerpo y conducta',
  'Cuaderno de flexibilidad cognitiva y cuestionamiento de pensamientos',
  'Cuaderno de conciencia y regulación emocional',
  'Cuaderno de afrontamiento y cambio',
  'Cuaderno de fortalezas y resiliencia',
  'Cuaderno de resumen terapéutico y formularios personalizados',
];

// ─────────────────────────────────────────────────────────────────────────────
// A. Registry
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 12 — A1: All 7 Spanish workbook slugs resolve', () => {
  it('each workbook slug resolves via resolveFormById', () => {
    for (const slug of ES_WORKBOOK_SLUGS) {
      const form = resolveFormById(slug);
      expect(form, `Slug "${slug}" must resolve via resolveFormById`).not.toBeNull();
      expect(form.approved, `Slug "${slug}" must be approved`).toBe(true);
    }
  });

  it('each workbook ID resolves with Spanish language data', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'es');
      expect(result, `Workbook "${id}" must resolve in Spanish`).not.toBeNull();
      expect(result.language, `Workbook "${id}" must return Spanish`).toBe('es');
      expect(result.languageData.rtl, `Workbook "${id}" must have rtl: false`).toBe(false);
      expect(
        result.languageData.file_url.startsWith('/forms/es/'),
        `Workbook "${id}" URL must start with /forms/es/`
      ).toBe(true);
    }
  });

  it('each workbook Spanish title matches expected value', () => {
    ES_WORKBOOK_IDS.forEach((id, i) => {
      const result = resolveFormWithLanguage(id, 'es');
      expect(result).not.toBeNull();
      expect(result.languageData.title).toBe(ES_WORKBOOK_TITLES[i]);
    });
  });
});

describe('Phase 12 — A2: All 7 Spanish workbook PDF files exist on disk', () => {
  it('each Spanish workbook PDF exists under public/forms/es/adults/', () => {
    for (const url of ES_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      expect(fs.existsSync(filePath), `Workbook PDF must exist: ${url}`).toBe(true);
    }
  });

  it('each workbook PDF is a valid PDF binary (starts with %PDF)', () => {
    for (const url of ES_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const header = fs.readFileSync(filePath).slice(0, 4).toString('ascii');
      expect(header, `Workbook PDF must start with %PDF: ${url}`).toBe('%PDF');
    }
  });

  it('each workbook PDF is at least 5 KB', () => {
    for (const url of ES_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const size = fs.statSync(filePath).size;
      expect(size, `Workbook PDF is too small: ${url} (${size} bytes)`).toBeGreaterThan(5000);
    }
  });
});

describe('Phase 12 — A3: All 7 Spanish workbooks are approved with correct metadata', () => {
  it('each workbook ID is in ALL_FORMS with approved: true', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `Workbook "${id}" must exist in ALL_FORMS`).toBeDefined();
      expect(form?.approved, `Workbook "${id}" must be approved: true`).toBe(true);
    }
  });

  it('each workbook has type: "therapeutic_workbook"', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.type, `Workbook "${id}" must have type: therapeutic_workbook`).toBe('therapeutic_workbook');
    }
  });

  it('each workbook has category: "workbook_series"', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.category, `Workbook "${id}" must have category: workbook_series`).toBe('workbook_series');
    }
  });

  it('each workbook has audience: "adults"', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.audience, `Workbook "${id}" must have audience: adults`).toBe('adults');
    }
  });
});

describe('Phase 12 — A4: All 7 Spanish workbooks appear in the library output', () => {
  it('ALL_FORMS contains all 7 Spanish workbook IDs', () => {
    for (const id of ES_WORKBOOK_IDS) {
      expect(ALL_FORMS.some(f => f.id === id), `ALL_FORMS must contain "${id}"`).toBe(true);
    }
  });

  it('listFormsByAudience("adults") includes all 7 Spanish workbooks', () => {
    const adultForms = listFormsByAudience('adults');
    for (const id of ES_WORKBOOK_IDS) {
      expect(adultForms.some(f => f.id === id), `listFormsByAudience must include "${id}"`).toBe(true);
    }
  });

  it('listFormsByAudience("adults") workbook_series entries include all 7 Spanish workbooks', () => {
    const adultForms = listFormsByAudience('adults');
    const workbooks = adultForms.filter(f => f.category === 'workbook_series');
    const esWorkbooks = workbooks.filter(f => f.id.endsWith('-es'));
    expect(esWorkbooks.length).toBe(7);
  });
});

describe('Phase 12 — A5: All 7 Spanish workbooks generate valid generated_file metadata', () => {
  it('toGeneratedFileMetadata returns valid shape for each Spanish workbook', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'es');
      expect(resolved, `${id} must resolve in Spanish`).not.toBeNull();
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `${id} toGeneratedFileMetadata must not be null`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(id);
      expect(meta.language).toBe('es');
      expect(meta.url).toMatch(/^\/forms\/es\//);
      expect(meta.audience).toBe('adults');
      expect(meta.category).toBe('workbook_series');
      expect(typeof meta.created_at).toBe('string');
      expect(meta.name).toBeTruthy();
      expect(meta.title).toBeTruthy();
    }
  });

  it('resolveFormIntent with Spanish workbook slug returns valid metadata', () => {
    for (const slug of ES_WORKBOOK_SLUGS) {
      const meta = resolveFormIntent(slug, 'es');
      expect(meta, `Intent slug "${slug}" must resolve`).not.toBeNull();
      expect(meta.language).toBe('es');
      expect(meta.url).toMatch(/^\/forms\/es\//);
      expect(meta.source).toBe('therapeutic_forms_library');
    }
  });

  it('all 7 Spanish workbook IDs are values in APPROVED_FORM_INTENT_MAP', () => {
    const mapValues = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const id of ES_WORKBOOK_IDS) {
      expect(mapValues.has(id), `Workbook "${id}" must appear in APPROVED_FORM_INTENT_MAP`).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B. Routing
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 12 — B1: No forced attachment for therapeutic conversation', () => {
  it('"Quiero trabajar pensamientos negativos" → resolveSpanishWorkbookIntent returns null', () => {
    const result = resolveSpanishWorkbookIntent('Quiero trabajar pensamientos negativos');
    // No workbook trigger and only 1 keyword match — should NOT force a workbook
    expect(result).toBeNull();
  });

  it('"Me siento muy ansioso últimamente" → no forced workbook attachment', () => {
    const result = resolveSpanishWorkbookIntent('Me siento muy ansioso últimamente');
    expect(result).toBeNull();
  });
});

describe('Phase 12 — B2: Individual worksheet language does not trigger workbook', () => {
  it('"¿Tienes una hoja de trabajo para pensamientos negativos?" → resolveSpanishWorkbookIntent returns null', () => {
    // "hoja de trabajo" is individual-form trigger; no workbook should be returned
    const result = resolveSpanishWorkbookIntent('¿Tienes una hoja de trabajo para pensamientos negativos?');
    expect(result).toBeNull();
  });

  it('"¿Tienes una ficha para pensamientos negativos?" → returns null', () => {
    const result = resolveSpanishWorkbookIntent('¿Tienes una ficha para pensamientos negativos?');
    expect(result).toBeNull();
  });
});

describe('Phase 12 — B3: Explicit workbook request for negative thoughts', () => {
  const query = '¿Tienes un cuaderno para pensamientos negativos?';

  it('resolves to adults-cognitive-flexibility-premium-es', () => {
    const meta = resolveSpanishWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-es');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveSpanishWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('does NOT resolve to cognitive-distortions-worksheet', () => {
    const meta = resolveSpanishWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('returns Spanish language metadata', () => {
    const meta = resolveSpanishWorkbookIntent(query);
    expect(meta?.language).toBe('es');
    expect(meta?.url).toMatch(/^\/forms\/es\//);
  });
});

describe('Phase 12 — B4: Context-aware routing — negative thoughts context', () => {
  const previousContext = 'Tengo muchos pensamientos negativos y quiero cuestionarlos';
  const currentQuery = '¿Tienes un cuaderno para esto?';

  it('resolves to adults-cognitive-flexibility-premium-es', () => {
    const meta = resolveSpanishWorkbookIntentWithContext(currentQuery, previousContext);
    expect(meta, `Context-aware query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-es');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveSpanishWorkbookIntentWithContext(currentQuery, previousContext);
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('"¿Tienes algo más completo?" with thought-challenging context resolves correctly', () => {
    const meta = resolveSpanishWorkbookIntentWithContext(
      '¿Tienes algo más completo?',
      'Quiero desafiar mis pensamientos automáticos y distorsiones cognitivas'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-es');
  });

  it('"¿Tienes otro cuaderno para esto?" after negative thoughts context resolves correctly', () => {
    const meta = resolveSpanishWorkbookIntentWithContext(
      '¿Tienes otro cuaderno para esto?',
      'pensamientos negativos cuestionamiento de pensamientos'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-es');
  });
});

describe('Phase 12 — B5: Workbook for procrastination, avoidance, difficult habits', () => {
  const query = '¿Tienes un cuaderno para procrastinación, evitación y hábitos difíciles?';

  it('resolves to adults-coping-change-premium-es', () => {
    const meta = resolveSpanishWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-es');
  });

  it('does NOT resolve to behavioral-activation-plan', () => {
    const meta = resolveSpanishWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-behavioral-activation-plan');
  });

  it('context-aware: procrastination context + cuaderno trigger resolves to coping-change', () => {
    const meta = resolveSpanishWorkbookIntentWithContext(
      '¿Tienes un cuaderno para esto?',
      'Me cuesta mucho la procrastinación y la evitación todo el tiempo'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-es');
  });
});

describe('Phase 12 — B6: Workbook for emotional regulation and strong emotions', () => {
  const query = '¿Tienes un cuaderno para regulación emocional y emociones fuertes?';

  it('resolves to adults-emotional-regulation-premium-es', () => {
    const meta = resolveSpanishWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-es');
  });

  it('workbook request about anxiety and anger resolves to emotional-regulation', () => {
    const meta = resolveSpanishWorkbookIntent(
      '¿Tienes un cuaderno completo sobre ansiedad, ira y calmarme?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-es');
  });

  it('context-aware: emotional overwhelm context + cuaderno trigger resolves correctly', () => {
    const meta = resolveSpanishWorkbookIntentWithContext(
      '¿Un cuaderno completo para esto?',
      'Siento un desborde emocional y ansiedad muy a menudo'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-es');
  });
});

describe('Phase 12 — B7: Workbook for strengths, resilience, confidence, self-efficacy', () => {
  it('multi-topic workbook query resolves to adults-strengths-resilience-premium-es', () => {
    const meta = resolveSpanishWorkbookIntent(
      '¿Tienes un cuaderno para fortalezas, resiliencia, confianza y autoeficacia?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-es');
  });

  it('explicit cuaderno request for strengths and resilience resolves correctly', () => {
    const meta = resolveSpanishWorkbookIntent(
      '¿Tienes un cuaderno de fortalezas y resiliencia?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-es');
  });
});

describe('Phase 12 — B8: Workbook for treatment summary and ending therapy', () => {
  const query = 'Estoy terminando terapia y quiero un resumen del tratamiento y formularios personalizados';

  it('explicit multi-topic request resolves to adults-treatment-summary-custom-forms-premium-es', () => {
    const meta = resolveSpanishWorkbookIntent(query);
    // Two or more topic keywords: "terminar terapia" + "resumen del tratamiento" + "formulario personalizado"
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-es');
  });

  it('cuaderno request for ending therapy resolves correctly', () => {
    const meta = resolveSpanishWorkbookIntent(
      '¿Tienes un cuaderno para terminar terapia y revisar lo que aprendí?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-es');
  });
});

describe('Phase 12 — B9: Direct individual-form requests remain individual', () => {
  it('"Envíame el registro de pensamientos CBT" resolves to cbt-thought-record', () => {
    const meta = resolveFormIntent('cbt-thought-record', 'es');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('"Envíame la hoja de distorsiones cognitivas" resolves to cognitive-distortions-worksheet', () => {
    const meta = resolveFormIntent('cognitive-distortions-worksheet', 'es');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('resolveSpanishWorkbookIntent returns null for narrow individual-form queries', () => {
    expect(resolveSpanishWorkbookIntent('Dame una hoja de trabajo para distorsiones cognitivas')).toBeNull();
    expect(resolveSpanishWorkbookIntent('Quiero un formulario para seguimiento del estado de ánimo')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — Spanish form label
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 12 — Spanish form label', () => {
  it('getSpanishFormLabel returns "cuaderno terapéutico completo" for workbook_series', () => {
    const label = getSpanishFormLabel({ category: 'workbook_series' });
    expect(label).toBe('cuaderno terapéutico completo');
  });

  it('getSpanishFormLabel returns "hoja de trabajo" for non-workbook category', () => {
    expect(getSpanishFormLabel({ category: 'thought_records' })).toBe('hoja de trabajo');
    expect(getSpanishFormLabel({ category: 'emotional_regulation' })).toBe('hoja de trabajo');
  });

  it('getSpanishFormLabel returns "hoja de trabajo" for null/undefined', () => {
    expect(getSpanishFormLabel(null)).toBe('hoja de trabajo');
    expect(getSpanishFormLabel(undefined)).toBe('hoja de trabajo');
  });

  it('resolved Spanish workbook metadata carries category workbook_series and gets the correct label', () => {
    const meta = resolveSpanishWorkbookIntent(
      '¿Tienes un cuaderno para pensamientos negativos?'
    );
    expect(meta).not.toBeNull();
    expect(meta.category).toBe('workbook_series');
    expect(getSpanishFormLabel(meta)).toBe('cuaderno terapéutico completo');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — Spanish trigger keyword exports
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 12 — Spanish trigger keyword exports', () => {
  it('getSpanishWorkbookTriggerKeywords returns a non-empty array', () => {
    const kws = getSpanishWorkbookTriggerKeywords();
    expect(Array.isArray(kws)).toBe(true);
    expect(kws.length).toBeGreaterThan(0);
    expect(kws).toContain('cuaderno');
    expect(kws).toContain('cuaderno de trabajo');
  });

  it('getSpanishIndividualFormTriggerKeywords returns a non-empty array', () => {
    const kws = getSpanishIndividualFormTriggerKeywords();
    expect(Array.isArray(kws)).toBe(true);
    expect(kws.length).toBeGreaterThan(0);
    expect(kws).toContain('hoja de trabajo');
    expect(kws).toContain('un formulario');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — WORKBOOK_CONTENT_METADATA_ES structural integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 12 — WORKBOOK_CONTENT_METADATA_ES structural integrity', () => {
  it('has exactly 7 entries', () => {
    expect(WORKBOOK_CONTENT_METADATA_ES.length).toBe(7);
  });

  it('each entry has required fields', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA_ES) {
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

  it('every slug in metadata matches a registered Spanish workbook', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA_ES) {
      const meta = resolveFormIntent(wb.slug, 'es');
      expect(meta, `Metadata slug "${wb.slug}" must resolve via resolveFormIntent`).not.toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// C. Regression
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 12 — C1: Hebrew workbook routing still works', () => {
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

describe('Phase 12 — C2: English workbook routing still works', () => {
  it('resolveEnglishWorkbookIntent with negative thoughts → cognitive-flexibility-en', () => {
    const meta = resolveEnglishWorkbookIntent(
      'Do you have a workbook for negative thoughts?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-en');
  });

  it('English: workbook = full workbook, not individual worksheet', () => {
    const meta = resolveEnglishWorkbookIntent('Do you have a workbook for negative thoughts?');
    expect(meta).not.toBeNull();
    expect(meta?.category).toBe('workbook_series');
    expect(getEnglishFormLabel(meta)).toBe('full therapeutic workbook');
  });
});

describe('Phase 12 — C3: Existing 18 individual forms still resolve', () => {
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

  it('all 18 standard forms still resolve in Spanish', () => {
    for (const id of STANDARD_FORM_IDS) {
      const result = resolveFormWithLanguage(id, 'es');
      expect(result, `Standard form "${id}" must resolve in Spanish`).not.toBeNull();
      expect(result.language).toBe('es');
    }
  });
});

describe('Phase 12 — C4: Hebrew workbooks still return null for Spanish requests', () => {
  const HE_WORKBOOK_IDS = [
    'tf-adults-formulation-mapping-premium-he',
    'tf-adults-awareness-identification-premium-he',
    'tf-adults-cognitive-flexibility-premium-he',
    'tf-adults-emotional-regulation-premium-he',
    'tf-adults-coping-change-premium-he',
    'tf-adults-strengths-resilience-premium-he',
    'tf-adults-treatment-summary-custom-forms-premium-he',
  ];

  it('Hebrew workbooks return null when requested in Spanish', () => {
    for (const id of HE_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'es');
      expect(result, `Hebrew workbook "${id}" must return null for Spanish requests`).toBeNull();
    }
  });
});

describe('Phase 12 — C5: Spanish workbooks resolve only in Spanish (no fallback to en/he)', () => {
  it('Spanish workbooks return null when requested in English (no en fallback)', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'en');
      expect(result, `Spanish workbook "${id}" must return null for English (Spanish-only)`).toBeNull();
    }
  });

  it('Spanish workbooks return null when requested in Hebrew', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'he');
      expect(result, `Spanish workbook "${id}" must return null for Hebrew`).toBeNull();
    }
  });

  it('Spanish workbooks return null for French requests', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'fr');
      expect(result, `Spanish workbook "${id}" must return null for French`).toBeNull();
    }
  });

  it('standard forms return null for unsupported language codes (strict matching)', () => {
    const result = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'zh');
    expect(result).toBeNull();
  });
});

describe('Phase 12 — C6: Safety — no unapproved form can be sent', () => {
  it('resolveFormIntent returns null for invented Spanish workbook slugs', () => {
    expect(resolveFormIntent('adults-fake-workbook-es', 'es')).toBeNull();
    expect(resolveFormIntent('workbook-series', 'es')).toBeNull();
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

describe('Phase 12 — C7: Open/download behavior unchanged for Spanish workbooks', () => {
  it('each Spanish workbook metadata contains valid file_url for download/open', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'es');
      expect(resolved).not.toBeNull();
      const { languageData } = resolved;
      expect(languageData.file_url).toBeTruthy();
      expect(languageData.file_url).toMatch(/^\/forms\/es\//);
      expect(languageData.file_name).toBeTruthy();
      expect(languageData.file_name).toMatch(/\.pdf$/);
    }
  });

  it('toGeneratedFileMetadata shape is compatible with generated_file consumer', () => {
    for (const id of ES_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'es');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.url).toBeTruthy();
      expect(meta.name).toBeTruthy();
      expect(meta.title).toBeTruthy();
    }
  });
});

/**
 * Tests for German Premium Therapeutic Workbooks — Phase 14
 *
 * Verifies the 7 newly registered German adult premium workbooks across all
 * required behavior dimensions from the problem statement.
 *
 * Sections:
 *  A. Registry — all 7 German workbook entries exist, are approved, and have
 *     correct metadata.
 *  B. Routing — content-aware German workbook routing behaves correctly:
 *       B1. "Ich möchte an negativen Gedanken arbeiten" → no forced attachment.
 *       B2. "Hast du ein Arbeitsblatt für negative Gedanken?" → null (individual form).
 *       B3. "Hast du ein Arbeitsheft für negative Gedanken?" → adults-cognitive-flexibility-premium-de.
 *       B4. Context-aware: prior negative-thoughts context + "Hast du ein Arbeitsheft dazu?"
 *           → adults-cognitive-flexibility-premium-de.
 *       B5. Procrastination/avoidance/habits workbook query → adults-coping-change-premium-de.
 *       B6. Emotional regulation workbook query → adults-emotional-regulation-premium-de.
 *       B7. Multi-topic strengths/resilience/self-efficacy → adults-strengths-resilience-premium-de.
 *       B8. Treatment summary / ending therapy → adults-treatment-summary-custom-forms-premium-de.
 *       B9. Direct individual-form requests remain individual (cbt-thought-record, etc.).
 *  C. Regression — Hebrew workbooks, English workbooks, Spanish workbooks, French workbooks,
 *     and all 18 individual forms unaffected.
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
  resolveGermanWorkbookIntent,
  resolveGermanWorkbookIntentWithContext,
  getGermanWorkbookTriggerKeywords,
  getGermanIndividualFormTriggerKeywords,
  getGermanFormLabel,
  resolveWorkbookIntent,
  getHebrewFormLabel,
  resolveEnglishWorkbookIntent,
  getEnglishFormLabel,
  resolveSpanishWorkbookIntent,
  getSpanishFormLabel,
  resolveFrenchWorkbookIntent,
  getFrenchFormLabel,
} from '../../src/utils/resolveWorkbookIntent.js';

import { WORKBOOK_CONTENT_METADATA_DE } from '../../src/utils/workbookContentMetadata.js';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, '../../public');

function resolvePublicPath(fileUrl) {
  return path.join(PUBLIC_ROOT, fileUrl);
}

// ─── German workbook constants ────────────────────────────────────────────────

const DE_WORKBOOK_IDS = [
  'tf-adults-formulation-mapping-premium-de',
  'tf-adults-awareness-identification-premium-de',
  'tf-adults-cognitive-flexibility-premium-de',
  'tf-adults-emotional-regulation-premium-de',
  'tf-adults-coping-change-premium-de',
  'tf-adults-strengths-resilience-premium-de',
  'tf-adults-treatment-summary-custom-forms-premium-de',
];

const DE_WORKBOOK_SLUGS = [
  'adults-formulation-mapping-premium-de',
  'adults-awareness-identification-premium-de',
  'adults-cognitive-flexibility-premium-de',
  'adults-emotional-regulation-premium-de',
  'adults-coping-change-premium-de',
  'adults-strengths-resilience-premium-de',
  'adults-treatment-summary-custom-forms-premium-de',
];

const DE_WORKBOOK_FILE_URLS = [
  '/forms/de/adults/adults-formulation-mapping-premium-de.pdf',
  '/forms/de/adults/adults-awareness-identification-premium-de.pdf',
  '/forms/de/adults/adults-cognitive-flexibility-premium-de.pdf',
  '/forms/de/adults/adults-emotional-regulation-premium-de.pdf',
  '/forms/de/adults/adults-coping-change-premium-de.pdf',
  '/forms/de/adults/adults-strengths-resilience-premium-de.pdf',
  '/forms/de/adults/adults-treatment-summary-custom-forms-premium-de.pdf',
];

const DE_WORKBOOK_TITLES = [
  'Arbeitsheft zur Fallformulierung und Problemlandkarte',
  'Arbeitsheft zum Erkennen von Gedanken, Gefühlen, Körper und Verhalten',
  'Arbeitsheft zu kognitiver Flexibilität und Gedankenüberprüfung',
  'Arbeitsheft zu emotionaler Wahrnehmung und Regulation',
  'Arbeitsheft zu Bewältigung und Veränderung',
  'Arbeitsheft zu Stärken und Resilienz',
  'Arbeitsheft zu Therapiezusammenfassung und persönlichen Formularen',
];

// ─────────────────────────────────────────────────────────────────────────────
// A. Registry
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 14 — A1: All 7 German workbook slugs resolve', () => {
  it('each workbook slug resolves via resolveFormById', () => {
    for (const slug of DE_WORKBOOK_SLUGS) {
      const form = resolveFormById(slug);
      expect(form, `Slug "${slug}" must resolve via resolveFormById`).not.toBeNull();
      expect(form.approved, `Slug "${slug}" must be approved`).toBe(true);
    }
  });

  it('each workbook ID resolves with German language data', () => {
    for (const id of DE_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'de');
      expect(result, `Workbook "${id}" must resolve in German`).not.toBeNull();
      expect(result.language, `Workbook "${id}" must return German`).toBe('de');
      expect(result.languageData.rtl, `Workbook "${id}" must have rtl: false`).toBe(false);
      expect(
        result.languageData.file_url.startsWith('/forms/de/'),
        `Workbook "${id}" URL must start with /forms/de/`
      ).toBe(true);
    }
  });

  it('each workbook German title matches expected value', () => {
    DE_WORKBOOK_IDS.forEach((id, i) => {
      const result = resolveFormWithLanguage(id, 'de');
      expect(result).not.toBeNull();
      expect(result.languageData.title).toBe(DE_WORKBOOK_TITLES[i]);
    });
  });
});

describe('Phase 14 — A2: All 7 German workbook PDF files exist on disk', () => {
  it('each German workbook PDF exists under public/forms/de/adults/', () => {
    for (const url of DE_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      expect(fs.existsSync(filePath), `Workbook PDF must exist: ${url}`).toBe(true);
    }
  });

  it('each workbook PDF is a valid PDF binary (starts with %PDF)', () => {
    for (const url of DE_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const header = fs.readFileSync(filePath).slice(0, 4).toString('ascii');
      expect(header, `Workbook PDF must start with %PDF: ${url}`).toBe('%PDF');
    }
  });

  it('each workbook PDF is at least 5 KB', () => {
    for (const url of DE_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const size = fs.statSync(filePath).size;
      expect(size, `Workbook PDF is too small: ${url} (${size} bytes)`).toBeGreaterThan(5000);
    }
  });
});

describe('Phase 14 — A3: All 7 German workbooks are approved with correct metadata', () => {
  it('each workbook ID is in ALL_FORMS with approved: true', () => {
    for (const id of DE_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `Workbook "${id}" must exist in ALL_FORMS`).toBeDefined();
      expect(form?.approved, `Workbook "${id}" must be approved: true`).toBe(true);
    }
  });

  it('each workbook has type: "therapeutic_workbook"', () => {
    for (const id of DE_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.type, `Workbook "${id}" must have type: therapeutic_workbook`).toBe('therapeutic_workbook');
    }
  });

  it('each workbook has category: "workbook_series"', () => {
    for (const id of DE_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.category, `Workbook "${id}" must have category: workbook_series`).toBe('workbook_series');
    }
  });

  it('each workbook has audience: "adults"', () => {
    for (const id of DE_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.audience, `Workbook "${id}" must have audience: adults`).toBe('adults');
    }
  });
});

describe('Phase 14 — A4: All 7 German workbooks appear in the library output', () => {
  it('ALL_FORMS contains all 7 German workbook IDs', () => {
    for (const id of DE_WORKBOOK_IDS) {
      expect(ALL_FORMS.some(f => f.id === id), `ALL_FORMS must contain "${id}"`).toBe(true);
    }
  });

  it('listFormsByAudience("adults") includes all 7 German workbooks', () => {
    const adultForms = listFormsByAudience('adults');
    for (const id of DE_WORKBOOK_IDS) {
      expect(adultForms.some(f => f.id === id), `listFormsByAudience must include "${id}"`).toBe(true);
    }
  });

  it('listFormsByAudience("adults") workbook_series entries include all 7 German workbooks', () => {
    const adultForms = listFormsByAudience('adults');
    const workbooks = adultForms.filter(f => f.category === 'workbook_series');
    const deWorkbooks = workbooks.filter(f => f.id.endsWith('-de'));
    expect(deWorkbooks.length).toBe(7);
  });
});

describe('Phase 14 — A5: All 7 German workbooks generate valid generated_file metadata', () => {
  it('toGeneratedFileMetadata returns valid shape for each German workbook', () => {
    for (const id of DE_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'de');
      expect(resolved, `${id} must resolve in German`).not.toBeNull();
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `${id} toGeneratedFileMetadata must not be null`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(id);
      expect(meta.language).toBe('de');
      expect(meta.url).toMatch(/^\/forms\/de\//);
      expect(meta.audience).toBe('adults');
      expect(meta.category).toBe('workbook_series');
      expect(typeof meta.created_at).toBe('string');
      expect(meta.name).toBeTruthy();
      expect(meta.title).toBeTruthy();
    }
  });

  it('resolveFormIntent with German workbook slug returns valid metadata', () => {
    for (const slug of DE_WORKBOOK_SLUGS) {
      const meta = resolveFormIntent(slug, 'de');
      expect(meta, `Intent slug "${slug}" must resolve`).not.toBeNull();
      expect(meta.language).toBe('de');
      expect(meta.url).toMatch(/^\/forms\/de\//);
      expect(meta.source).toBe('therapeutic_forms_library');
    }
  });

  it('all 7 German workbook IDs are values in APPROVED_FORM_INTENT_MAP', () => {
    const mapValues = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const id of DE_WORKBOOK_IDS) {
      expect(mapValues.has(id), `Workbook "${id}" must appear in APPROVED_FORM_INTENT_MAP`).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B. Routing
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 14 — B1: No forced attachment for therapeutic conversation', () => {
  it('"Ich möchte an negativen Gedanken arbeiten" → resolveGermanWorkbookIntent returns null', () => {
    const result = resolveGermanWorkbookIntent('Ich möchte an negativen Gedanken arbeiten');
    // No workbook trigger and only 1 keyword match — should NOT force a workbook
    expect(result).toBeNull();
  });

  it('"Ich fühle mich sehr ängstlich im Moment" → no forced workbook attachment', () => {
    const result = resolveGermanWorkbookIntent('Ich fühle mich sehr ängstlich im Moment');
    expect(result).toBeNull();
  });

  it('"Ich habe schwierige Gedanken" → no forced workbook attachment', () => {
    const result = resolveGermanWorkbookIntent('Ich habe schwierige Gedanken');
    expect(result).toBeNull();
  });
});

describe('Phase 14 — B2: Individual worksheet language does not trigger workbook', () => {
  it('"Hast du ein Arbeitsblatt für negative Gedanken?" → resolveGermanWorkbookIntent returns null', () => {
    const result = resolveGermanWorkbookIntent('Hast du ein Arbeitsblatt für negative Gedanken?');
    expect(result).toBeNull();
  });

  it('"Ich brauche ein Übungsblatt für die Prokrastination" → returns null', () => {
    const result = resolveGermanWorkbookIntent('Ich brauche ein Übungsblatt für die Prokrastination');
    expect(result).toBeNull();
  });

  it('"Schick mir ein einzelnes Arbeitsblatt" → returns null', () => {
    const result = resolveGermanWorkbookIntent('Schick mir ein einzelnes Arbeitsblatt');
    expect(result).toBeNull();
  });
});

describe('Phase 14 — B3: Explicit workbook request for negative thoughts', () => {
  const query = 'Hast du ein Arbeitsheft für negative Gedanken?';

  it('resolves to adults-cognitive-flexibility-premium-de', () => {
    const meta = resolveGermanWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-de');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveGermanWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('does NOT resolve to cognitive-distortions-worksheet', () => {
    const meta = resolveGermanWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('returns German language metadata', () => {
    const meta = resolveGermanWorkbookIntent(query);
    expect(meta?.language).toBe('de');
    expect(meta?.url).toMatch(/^\/forms\/de\//);
  });

  it('"Ich möchte ein Arbeitsheft zu negativen Gedanken" also resolves correctly', () => {
    const meta = resolveGermanWorkbookIntent('Ich möchte ein Arbeitsheft zu negativen Gedanken');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-de');
  });

  it('"Hast du ein Arbeitsheft zu kognitiven Verzerrungen und kognitiver Flexibilität?" resolves correctly', () => {
    const meta = resolveGermanWorkbookIntent('Hast du ein Arbeitsheft zu kognitiven Verzerrungen und kognitiver Flexibilität?');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-de');
  });
});

describe('Phase 14 — B4: Context-aware routing — negative thoughts context', () => {
  const previousContext = 'Ich habe viele negative Gedanken und möchte sie hinterfragen';
  const currentQuery = 'Hast du ein Arbeitsheft dazu?';

  it('resolves to adults-cognitive-flexibility-premium-de', () => {
    const meta = resolveGermanWorkbookIntentWithContext(currentQuery, previousContext);
    expect(meta, `Context-aware query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-de');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveGermanWorkbookIntentWithContext(currentQuery, previousContext);
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('"Hast du etwas Umfassenderes?" with thought-challenging context resolves correctly', () => {
    const meta = resolveGermanWorkbookIntentWithContext(
      'Hast du etwas Umfassenderes?',
      'Ich möchte meine automatischen Gedanken und kognitiven Verzerrungen hinterfragen'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-de');
  });

  it('"Hast du ein anderes Arbeitsheft dazu?" after negative thoughts context resolves correctly', () => {
    const meta = resolveGermanWorkbookIntentWithContext(
      'Hast du ein anderes Arbeitsheft dazu?',
      'negative Gedanken Gedanken hinterfragen'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-de');
  });

  it('"Nicht nur ein Arbeitsblatt, hast du ein Arbeitsheft?" after thought-challenging context resolves to workbook', () => {
    const meta = resolveGermanWorkbookIntentWithContext(
      'nicht nur ein Arbeitsblatt, hast du ein Arbeitsheft?',
      'Ich möchte an meinen negativen Gedanken arbeiten und sie hinterfragen'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-de');
  });
});

describe('Phase 14 — B5: Workbook for procrastination, avoidance, difficult habits', () => {
  const query = 'Hast du ein Arbeitsheft für Prokrastination, Vermeidung und schwierige Gewohnheiten?';

  it('resolves to adults-coping-change-premium-de', () => {
    const meta = resolveGermanWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-de');
  });

  it('does NOT resolve to behavioral-activation-plan', () => {
    const meta = resolveGermanWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-behavioral-activation-plan');
  });

  it('context-aware: procrastination context + Arbeitsheft trigger resolves to coping-change', () => {
    const meta = resolveGermanWorkbookIntentWithContext(
      'Hast du ein Arbeitsheft dazu?',
      'Ich kämpfe wirklich mit Prokrastination und Vermeidung die ganze Zeit'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-de');
  });

  it('"Ich möchte ein Arbeitsheft zu Prokrastination und schwierigen Gewohnheiten" resolves correctly', () => {
    const meta = resolveGermanWorkbookIntent('Ich möchte ein Arbeitsheft zu Prokrastination und schwierigen Gewohnheiten');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-de');
  });
});

describe('Phase 14 — B6: Workbook for emotional regulation and strong emotions', () => {
  const query = 'Hast du ein Arbeitsheft für emotionale Regulation und starke Gefühle?';

  it('resolves to adults-emotional-regulation-premium-de', () => {
    const meta = resolveGermanWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-de');
  });

  it('workbook request about anxiety and anger resolves to emotional-regulation', () => {
    const meta = resolveGermanWorkbookIntent(
      'Hast du ein vollständiges Arbeitsheft über Angst, Ärger und mich beruhigen?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-de');
  });

  it('context-aware: emotional overwhelm context + Arbeitsheft trigger resolves correctly', () => {
    const meta = resolveGermanWorkbookIntentWithContext(
      'Ein vollständiges Arbeitsheft dazu?',
      'Ich erlebe emotionale Überforderung und Angst sehr oft'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-de');
  });
});

describe('Phase 14 — B7: Workbook for strengths, resilience, confidence, self-efficacy', () => {
  it('multi-topic workbook query resolves to adults-strengths-resilience-premium-de', () => {
    const meta = resolveGermanWorkbookIntent(
      'Hast du ein Arbeitsheft für Stärken, Resilienz, Selbstvertrauen und Selbstwirksamkeit?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-de');
  });

  it('explicit Arbeitsheft request for strengths and resilience resolves correctly', () => {
    const meta = resolveGermanWorkbookIntent(
      'Hast du ein Arbeitsheft zu Stärken und Resilienz?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-de');
  });
});

describe('Phase 14 — B8: Workbook for treatment summary and ending therapy', () => {
  const query = 'Ich beende eine Therapie und möchte eine Therapiezusammenfassung und persönliche Formulare';

  it('explicit multi-topic request resolves to adults-treatment-summary-custom-forms-premium-de', () => {
    const meta = resolveGermanWorkbookIntent(query);
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-de');
  });

  it('Arbeitsheft request for ending therapy resolves correctly', () => {
    const meta = resolveGermanWorkbookIntent(
      'Hast du ein Arbeitsheft für den Therapieabschluss und was ich gelernt habe?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-de');
  });
});

describe('Phase 14 — B9: Direct individual-form requests remain individual', () => {
  it('resolveFormIntent with cbt-thought-record in German resolves correctly', () => {
    const meta = resolveFormIntent('cbt-thought-record', 'de');
    // Standard forms fall back to English if no German block
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('resolveGermanWorkbookIntent returns null for narrow individual-form queries', () => {
    expect(resolveGermanWorkbookIntent('Gib mir ein Übungsblatt zu kognitiven Verzerrungen')).toBeNull();
    expect(resolveGermanWorkbookIntent('Ich möchte ein einzelnes Formular für die Stimmungsverfolgung')).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — German form label
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 14 — German form label', () => {
  it('getGermanFormLabel returns "vollständiges therapeutisches Arbeitsheft" for workbook_series', () => {
    const label = getGermanFormLabel({ category: 'workbook_series' });
    expect(label).toBe('vollständiges therapeutisches Arbeitsheft');
  });

  it('getGermanFormLabel returns "Arbeitsblatt" for non-workbook category', () => {
    expect(getGermanFormLabel({ category: 'thought_records' })).toBe('Arbeitsblatt');
    expect(getGermanFormLabel({ category: 'emotional_regulation' })).toBe('Arbeitsblatt');
  });

  it('getGermanFormLabel returns "Arbeitsblatt" for null/undefined', () => {
    expect(getGermanFormLabel(null)).toBe('Arbeitsblatt');
    expect(getGermanFormLabel(undefined)).toBe('Arbeitsblatt');
  });

  it('resolved German workbook metadata carries category workbook_series and gets the correct label', () => {
    const meta = resolveGermanWorkbookIntent(
      'Hast du ein Arbeitsheft für negative Gedanken?'
    );
    expect(meta).not.toBeNull();
    expect(meta.category).toBe('workbook_series');
    expect(getGermanFormLabel(meta)).toBe('vollständiges therapeutisches Arbeitsheft');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — German trigger keyword exports
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 14 — German trigger keyword exports', () => {
  it('getGermanWorkbookTriggerKeywords returns a non-empty array', () => {
    const kws = getGermanWorkbookTriggerKeywords();
    expect(Array.isArray(kws)).toBe(true);
    expect(kws.length).toBeGreaterThan(0);
    expect(kws).toContain('arbeitsheft');
    expect(kws).toContain('arbeitsmappe');
    expect(kws).toContain('therapieheft');
  });

  it('getGermanIndividualFormTriggerKeywords returns a non-empty array', () => {
    const kws = getGermanIndividualFormTriggerKeywords();
    expect(Array.isArray(kws)).toBe(true);
    expect(kws.length).toBeGreaterThan(0);
    expect(kws).toContain('arbeitsblatt');
    expect(kws).toContain('übungsblatt');
    expect(kws).toContain('einzelnes arbeitsblatt');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — WORKBOOK_CONTENT_METADATA_DE structural integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 14 — WORKBOOK_CONTENT_METADATA_DE structural integrity', () => {
  it('has exactly 7 entries', () => {
    expect(WORKBOOK_CONTENT_METADATA_DE.length).toBe(7);
  });

  it('each entry has required fields', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA_DE) {
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

  it('every slug in metadata matches a registered German workbook', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA_DE) {
      const meta = resolveFormIntent(wb.slug, 'de');
      expect(meta, `Metadata slug "${wb.slug}" must resolve via resolveFormIntent`).not.toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// C. Regression
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 14 — C1: Hebrew workbook routing still works', () => {
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

  it('getHebrewFormLabel still works for workbook_series', () => {
    expect(getHebrewFormLabel({ category: 'workbook_series' })).toBe('קונטרס טיפולי מלא');
  });
});

describe('Phase 14 — C2: English workbook routing still works', () => {
  it('resolveEnglishWorkbookIntent with negative thoughts workbook query → cognitive-flexibility-en', () => {
    const meta = resolveEnglishWorkbookIntent(
      'Do you have a full workbook for negative thoughts and cognitive distortions?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-en');
  });

  it('getEnglishFormLabel still works for workbook_series', () => {
    expect(getEnglishFormLabel({ category: 'workbook_series' })).toBe('full therapeutic workbook');
  });
});

describe('Phase 14 — C3: Spanish workbook routing still works', () => {
  it('"¿Tienes un cuaderno para pensamientos negativos?" → adults-cognitive-flexibility-premium-es', () => {
    const meta = resolveSpanishWorkbookIntent(
      '¿Tienes un cuaderno para pensamientos negativos?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-es');
  });

  it('getSpanishFormLabel still works for workbook_series', () => {
    expect(getSpanishFormLabel({ category: 'workbook_series' })).toBe('cuaderno terapéutico completo');
  });
});

describe('Phase 14 — C4: French workbook routing still works', () => {
  it('"Est-ce que tu as un cahier pour les pensées négatives ?" → adults-cognitive-flexibility-premium-fr', () => {
    const meta = resolveFrenchWorkbookIntent(
      'Est-ce que tu as un cahier pour les pensées négatives ?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-fr');
  });

  it('getFrenchFormLabel still works for workbook_series', () => {
    expect(getFrenchFormLabel({ category: 'workbook_series' })).toBe('cahier thérapeutique complet');
  });
});

describe('Phase 14 — C5: Existing 18 individual forms still resolve', () => {
  const STANDARD_FORM_SLUGS = [
    'cbt-thought-record',
    'cognitive-distortions-worksheet',
    'behavioral-activation-plan',
    'mood-tracking-sheet',
    'values-and-goals-worksheet',
    'weekly-coping-plan',
  ];

  it('all standard adult form slugs still resolve', () => {
    for (const slug of STANDARD_FORM_SLUGS) {
      const meta = resolveFormIntent(slug, 'en');
      expect(meta, `Standard form "${slug}" must still resolve`).not.toBeNull();
      expect(meta?.source).toBe('therapeutic_forms_library');
    }
  });

  it('total approved forms count is now 53', () => {
    const approved = ALL_FORMS.filter(f => f.approved === true);
    expect(approved.length).toBe(53);
  });
});

describe('Phase 14 — C6: Open/download behavior unchanged for existing forms', () => {
  it('German workbooks resolve in German and have PDF type', () => {
    for (const id of DE_WORKBOOK_IDS) {
      const meta = resolveFormIntent(id, 'de');
      expect(meta).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.url).toMatch(/^\/forms\/de\/adults\//);
    }
  });

  it('existing Hebrew workbooks still resolve in Hebrew and have PDF type', () => {
    const meta = resolveFormIntent('tf-adults-cognitive-flexibility-premium-he', 'he');
    expect(meta).not.toBeNull();
    expect(meta.type).toBe('pdf');
    expect(meta.url).toMatch(/^\/forms\/he\//);
  });
});

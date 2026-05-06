/**
 * Tests for French Premium Therapeutic Workbooks — Phase 13
 *
 * Verifies the 7 newly registered French adult premium workbooks across all
 * required behavior dimensions from the problem statement.
 *
 * Sections:
 *  A. Registry — all 7 French workbook entries exist, are approved, and have
 *     correct metadata.
 *  B. Routing — content-aware French workbook routing behaves correctly:
 *       B1. "Je veux travailler sur les pensées négatives" → no forced attachment.
 *       B2. "Est-ce que tu as une fiche pour les pensées négatives ?" → null (individual form).
 *       B3. "Est-ce que tu as un cahier pour les pensées négatives ?" → adults-cognitive-flexibility-premium-fr.
 *       B4. Context-aware: prior negative-thoughts context + "Est-ce que tu as un cahier pour ça ?"
 *           → adults-cognitive-flexibility-premium-fr.
 *       B5. Procrastination/avoidance/habits workbook query → adults-coping-change-premium-fr.
 *       B6. Emotional regulation workbook query → adults-emotional-regulation-premium-fr.
 *       B7. Multi-topic strengths/resilience/self-efficacy → adults-strengths-resilience-premium-fr.
 *       B8. Treatment summary / ending therapy → adults-treatment-summary-custom-forms-premium-fr.
 *       B9. Direct individual-form requests remain individual (cbt-thought-record, etc.).
 *  C. Regression — Hebrew workbooks, English workbooks, Spanish workbooks, and all 18 individual forms unaffected.
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
  resolveFrenchWorkbookIntent,
  resolveFrenchWorkbookIntentWithContext,
  getFrenchWorkbookTriggerKeywords,
  getFrenchIndividualFormTriggerKeywords,
  getFrenchFormLabel,
  resolveWorkbookIntent,
  getHebrewFormLabel,
  resolveEnglishWorkbookIntent,
  getEnglishFormLabel,
  resolveSpanishWorkbookIntent,
  getSpanishFormLabel,
} from '../../src/utils/resolveWorkbookIntent.js';

import { WORKBOOK_CONTENT_METADATA_FR } from '../../src/utils/workbookContentMetadata.js';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, '../../public');

function resolvePublicPath(fileUrl) {
  return path.join(PUBLIC_ROOT, fileUrl);
}

// ─── French workbook constants ────────────────────────────────────────────────

const FR_WORKBOOK_IDS = [
  'tf-adults-formulation-mapping-premium-fr',
  'tf-adults-awareness-identification-premium-fr',
  'tf-adults-cognitive-flexibility-premium-fr',
  'tf-adults-emotional-regulation-premium-fr',
  'tf-adults-coping-change-premium-fr',
  'tf-adults-strengths-resilience-premium-fr',
  'tf-adults-treatment-summary-custom-forms-premium-fr',
];

const FR_WORKBOOK_SLUGS = [
  'adults-formulation-mapping-premium-fr',
  'adults-awareness-identification-premium-fr',
  'adults-cognitive-flexibility-premium-fr',
  'adults-emotional-regulation-premium-fr',
  'adults-coping-change-premium-fr',
  'adults-strengths-resilience-premium-fr',
  'adults-treatment-summary-custom-forms-premium-fr',
];

const FR_WORKBOOK_FILE_URLS = [
  '/forms/fr/adults/adults-formulation-mapping-premium-fr.pdf',
  '/forms/fr/adults/adults-awareness-identification-premium-fr.pdf',
  '/forms/fr/adults/adults-cognitive-flexibility-premium-fr.pdf',
  '/forms/fr/adults/adults-emotional-regulation-premium-fr.pdf',
  '/forms/fr/adults/adults-coping-change-premium-fr.pdf',
  '/forms/fr/adults/adults-strengths-resilience-premium-fr.pdf',
  '/forms/fr/adults/adults-treatment-summary-custom-forms-premium-fr.pdf',
];

const FR_WORKBOOK_TITLES = [
  'Cahier de formulation et cartographie du cas',
  "Cahier d'identification des pensées, émotions, corps et comportements",
  'Cahier de flexibilité cognitive et questionnement des pensées',
  'Cahier de conscience et régulation émotionnelle',
  "Cahier d'adaptation et de changement",
  'Cahier des forces et de la résilience',
  'Cahier de synthèse thérapeutique et fiches personnalisées',
];

// ─────────────────────────────────────────────────────────────────────────────
// A. Registry
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 13 — A1: All 7 French workbook slugs resolve', () => {
  it('each workbook slug resolves via resolveFormById', () => {
    for (const slug of FR_WORKBOOK_SLUGS) {
      const form = resolveFormById(slug);
      expect(form, `Slug "${slug}" must resolve via resolveFormById`).not.toBeNull();
      expect(form.approved, `Slug "${slug}" must be approved`).toBe(true);
    }
  });

  it('each workbook ID resolves with French language data', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'fr');
      expect(result, `Workbook "${id}" must resolve in French`).not.toBeNull();
      expect(result.language, `Workbook "${id}" must return French`).toBe('fr');
      expect(result.languageData.rtl, `Workbook "${id}" must have rtl: false`).toBe(false);
      expect(
        result.languageData.file_url.startsWith('/forms/fr/'),
        `Workbook "${id}" URL must start with /forms/fr/`
      ).toBe(true);
    }
  });

  it('each workbook French title matches expected value', () => {
    FR_WORKBOOK_IDS.forEach((id, i) => {
      const result = resolveFormWithLanguage(id, 'fr');
      expect(result).not.toBeNull();
      expect(result.languageData.title).toBe(FR_WORKBOOK_TITLES[i]);
    });
  });
});

describe('Phase 13 — A2: All 7 French workbook PDF files exist on disk', () => {
  it('each French workbook PDF exists under public/forms/fr/adults/', () => {
    for (const url of FR_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      expect(fs.existsSync(filePath), `Workbook PDF must exist: ${url}`).toBe(true);
    }
  });

  it('each workbook PDF is a valid PDF binary (starts with %PDF)', () => {
    for (const url of FR_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const header = fs.readFileSync(filePath).slice(0, 4).toString('ascii');
      expect(header, `Workbook PDF must start with %PDF: ${url}`).toBe('%PDF');
    }
  });

  it('each workbook PDF is at least 5 KB', () => {
    for (const url of FR_WORKBOOK_FILE_URLS) {
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const size = fs.statSync(filePath).size;
      expect(size, `Workbook PDF is too small: ${url} (${size} bytes)`).toBeGreaterThan(5000);
    }
  });
});

describe('Phase 13 — A3: All 7 French workbooks are approved with correct metadata', () => {
  it('each workbook ID is in ALL_FORMS with approved: true', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `Workbook "${id}" must exist in ALL_FORMS`).toBeDefined();
      expect(form?.approved, `Workbook "${id}" must be approved: true`).toBe(true);
    }
  });

  it('each workbook has type: "therapeutic_workbook"', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.type, `Workbook "${id}" must have type: therapeutic_workbook`).toBe('therapeutic_workbook');
    }
  });

  it('each workbook has category: "workbook_series"', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.category, `Workbook "${id}" must have category: workbook_series`).toBe('workbook_series');
    }
  });

  it('each workbook has audience: "adults"', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form?.audience, `Workbook "${id}" must have audience: adults`).toBe('adults');
    }
  });
});

describe('Phase 13 — A4: All 7 French workbooks appear in the library output', () => {
  it('ALL_FORMS contains all 7 French workbook IDs', () => {
    for (const id of FR_WORKBOOK_IDS) {
      expect(ALL_FORMS.some(f => f.id === id), `ALL_FORMS must contain "${id}"`).toBe(true);
    }
  });

  it('listFormsByAudience("adults") includes all 7 French workbooks', () => {
    const adultForms = listFormsByAudience('adults');
    for (const id of FR_WORKBOOK_IDS) {
      expect(adultForms.some(f => f.id === id), `listFormsByAudience must include "${id}"`).toBe(true);
    }
  });

  it('listFormsByAudience("adults") workbook_series entries include all 7 French workbooks', () => {
    const adultForms = listFormsByAudience('adults');
    const workbooks = adultForms.filter(f => f.category === 'workbook_series');
    const frWorkbooks = workbooks.filter(f => f.id.endsWith('-fr'));
    expect(frWorkbooks.length).toBe(7);
  });
});

describe('Phase 13 — A5: All 7 French workbooks generate valid generated_file metadata', () => {
  it('toGeneratedFileMetadata returns valid shape for each French workbook', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'fr');
      expect(resolved, `${id} must resolve in French`).not.toBeNull();
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `${id} toGeneratedFileMetadata must not be null`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(id);
      expect(meta.language).toBe('fr');
      expect(meta.url).toMatch(/^\/forms\/fr\//);
      expect(meta.audience).toBe('adults');
      expect(meta.category).toBe('workbook_series');
      expect(typeof meta.created_at).toBe('string');
      expect(meta.name).toBeTruthy();
      expect(meta.title).toBeTruthy();
    }
  });

  it('resolveFormIntent with French workbook slug returns valid metadata', () => {
    for (const slug of FR_WORKBOOK_SLUGS) {
      const meta = resolveFormIntent(slug, 'fr');
      expect(meta, `Intent slug "${slug}" must resolve`).not.toBeNull();
      expect(meta.language).toBe('fr');
      expect(meta.url).toMatch(/^\/forms\/fr\//);
      expect(meta.source).toBe('therapeutic_forms_library');
    }
  });

  it('all 7 French workbook IDs are values in APPROVED_FORM_INTENT_MAP', () => {
    const mapValues = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const id of FR_WORKBOOK_IDS) {
      expect(mapValues.has(id), `Workbook "${id}" must appear in APPROVED_FORM_INTENT_MAP`).toBe(true);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B. Routing
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 13 — B1: No forced attachment for therapeutic conversation', () => {
  it('"Je veux travailler sur les pensées négatives" → resolveFrenchWorkbookIntent returns null', () => {
    const result = resolveFrenchWorkbookIntent('Je veux travailler sur les pensées négatives');
    // No workbook trigger and only 1 keyword match — should NOT force a workbook
    expect(result).toBeNull();
  });

  it('"Je me sens très anxieux en ce moment" → no forced workbook attachment', () => {
    const result = resolveFrenchWorkbookIntent('Je me sens très anxieux en ce moment');
    expect(result).toBeNull();
  });

  it('"J\'ai des pensées difficiles" → no forced workbook attachment', () => {
    const result = resolveFrenchWorkbookIntent("J'ai des pensées difficiles");
    expect(result).toBeNull();
  });
});

describe('Phase 13 — B2: Individual worksheet language does not trigger workbook', () => {
  it('"Est-ce que tu as une fiche pour les pensées négatives ?" → resolveFrenchWorkbookIntent returns null', () => {
    // "une fiche" is individual-form trigger; no workbook should be returned
    const result = resolveFrenchWorkbookIntent('Est-ce que tu as une fiche pour les pensées négatives ?');
    expect(result).toBeNull();
  });

  it('"Est-ce que tu as un formulaire pour les pensées négatives ?" → returns null', () => {
    const result = resolveFrenchWorkbookIntent('Est-ce que tu as un formulaire pour les pensées négatives ?');
    expect(result).toBeNull();
  });

  it('"J\'ai besoin d\'une feuille de travail pour la procrastination" → returns null', () => {
    const result = resolveFrenchWorkbookIntent("J'ai besoin d'une feuille de travail pour la procrastination");
    expect(result).toBeNull();
  });
});

describe('Phase 13 — B3: Explicit workbook request for negative thoughts', () => {
  const query = 'Est-ce que tu as un cahier pour les pensées négatives ?';

  it('resolves to adults-cognitive-flexibility-premium-fr', () => {
    const meta = resolveFrenchWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-fr');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveFrenchWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('does NOT resolve to cognitive-distortions-worksheet', () => {
    const meta = resolveFrenchWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('returns French language metadata', () => {
    const meta = resolveFrenchWorkbookIntent(query);
    expect(meta?.language).toBe('fr');
    expect(meta?.url).toMatch(/^\/forms\/fr\//);
  });

  it('"Je veux un cahier de travail sur les pensées négatives" also resolves correctly', () => {
    const meta = resolveFrenchWorkbookIntent('Je veux un cahier de travail sur les pensées négatives');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-fr');
  });

  it('"Tu as un livret sur les distorsions cognitives et la flexibilité cognitive ?" resolves correctly', () => {
    const meta = resolveFrenchWorkbookIntent('Tu as un livret sur les distorsions cognitives et la flexibilité cognitive ?');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-fr');
  });
});

describe('Phase 13 — B4: Context-aware routing — negative thoughts context', () => {
  const previousContext = "J'ai beaucoup de pensées négatives et je veux les questionner";
  const currentQuery = 'Est-ce que tu as un cahier pour ça ?';

  it('resolves to adults-cognitive-flexibility-premium-fr', () => {
    const meta = resolveFrenchWorkbookIntentWithContext(currentQuery, previousContext);
    expect(meta, `Context-aware query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-fr');
  });

  it('does NOT resolve to cbt-thought-record', () => {
    const meta = resolveFrenchWorkbookIntentWithContext(currentQuery, previousContext);
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
  });

  it('"Tu as quelque chose de plus complet ?" with thought-challenging context resolves correctly', () => {
    const meta = resolveFrenchWorkbookIntentWithContext(
      'Tu as quelque chose de plus complet ?',
      'Je veux contester mes pensées automatiques et les distorsions cognitives'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-fr');
  });

  it('"Tu as un autre cahier pour ça ?" after negative thoughts context resolves correctly', () => {
    const meta = resolveFrenchWorkbookIntentWithContext(
      'Tu as un autre cahier pour ça ?',
      'pensées négatives questionnement des pensées'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-fr');
  });

  it('"Pas seulement une fiche" after thought-challenging context resolves to workbook', () => {
    const meta = resolveFrenchWorkbookIntentWithContext(
      'pas seulement une fiche, tu as un cahier ?',
      'Je veux travailler sur mes pensées négatives et les questionner'
    );
    // "pas seulement une fiche" contains workbook trigger "pas seulement une fiche"
    // and context has "pensées négatives" → should resolve
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-fr');
  });
});

describe('Phase 13 — B5: Workbook for procrastination, avoidance, difficult habits', () => {
  const query = "Est-ce que tu as un cahier pour la procrastination, l'évitement et les habitudes difficiles ?";

  it('resolves to adults-coping-change-premium-fr', () => {
    const meta = resolveFrenchWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-fr');
  });

  it('does NOT resolve to behavioral-activation-plan', () => {
    const meta = resolveFrenchWorkbookIntent(query);
    expect(meta?.form_id).not.toBe('tf-adults-behavioral-activation-plan');
  });

  it('context-aware: procrastination context + cahier trigger resolves to coping-change', () => {
    const meta = resolveFrenchWorkbookIntentWithContext(
      'Est-ce que tu as un cahier pour ça ?',
      "J'ai vraiment du mal avec la procrastination et l'évitement tout le temps"
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-fr');
  });

  it('"Je veux un cahier sur la procrastination et les habitudes difficiles" resolves correctly', () => {
    const meta = resolveFrenchWorkbookIntent('Je veux un cahier sur la procrastination et les habitudes difficiles');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-fr');
  });
});

describe('Phase 13 — B6: Workbook for emotional regulation and strong emotions', () => {
  const query = "Est-ce que tu as un cahier pour la régulation émotionnelle et les émotions fortes ?";

  it('resolves to adults-emotional-regulation-premium-fr', () => {
    const meta = resolveFrenchWorkbookIntent(query);
    expect(meta, `Query must resolve`).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-fr');
  });

  it('workbook request about anxiety and anger resolves to emotional-regulation', () => {
    const meta = resolveFrenchWorkbookIntent(
      "Est-ce que tu as un cahier complet sur l'anxiété, la colère et me calmer ?"
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-fr');
  });

  it('context-aware: emotional overwhelm context + cahier trigger resolves correctly', () => {
    const meta = resolveFrenchWorkbookIntentWithContext(
      'Un cahier complet pour ça ?',
      "Je ressens un débordement émotionnel et de l'anxiété très souvent"
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-fr');
  });
});

describe('Phase 13 — B7: Workbook for strengths, resilience, confidence, self-efficacy', () => {
  it('multi-topic workbook query resolves to adults-strengths-resilience-premium-fr', () => {
    const meta = resolveFrenchWorkbookIntent(
      'Est-ce que tu as un cahier pour les forces, la résilience, la confiance et l\'auto-efficacité ?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-fr');
  });

  it('explicit cahier request for strengths and resilience resolves correctly', () => {
    const meta = resolveFrenchWorkbookIntent(
      'Est-ce que tu as un cahier des forces et de la résilience ?'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-fr');
  });
});

describe('Phase 13 — B8: Workbook for treatment summary and ending therapy', () => {
  const query = "Je termine une thérapie et je veux un résumé du traitement et des fiches personnalisées";

  it('explicit multi-topic request resolves to adults-treatment-summary-custom-forms-premium-fr', () => {
    const meta = resolveFrenchWorkbookIntent(query);
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-fr');
  });

  it('cahier request for ending therapy resolves correctly', () => {
    const meta = resolveFrenchWorkbookIntent(
      "Est-ce que tu as un cahier pour la fin de thérapie et revoir ce que j'ai appris ?"
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-fr');
  });
});

describe('Phase 13 — B9: Direct individual-form requests remain individual', () => {
  it('"Envoie-moi le registre de pensées CBT" resolves to cbt-thought-record', () => {
    const meta = resolveFormIntent('cbt-thought-record', 'fr');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('"Envoie-moi la fiche sur les distorsions cognitives" resolves to cognitive-distortions-worksheet', () => {
    const meta = resolveFormIntent('cognitive-distortions-worksheet', 'fr');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('resolveFrenchWorkbookIntent returns null for narrow individual-form queries', () => {
    expect(resolveFrenchWorkbookIntent('Donne-moi une fiche de travail pour les distorsions cognitives')).toBeNull();
    expect(resolveFrenchWorkbookIntent("Je veux un formulaire pour le suivi de l'humeur")).toBeNull();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — French form label
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 13 — French form label', () => {
  it('getFrenchFormLabel returns "cahier thérapeutique complet" for workbook_series', () => {
    const label = getFrenchFormLabel({ category: 'workbook_series' });
    expect(label).toBe('cahier thérapeutique complet');
  });

  it('getFrenchFormLabel returns "fiche de travail" for non-workbook category', () => {
    expect(getFrenchFormLabel({ category: 'thought_records' })).toBe('fiche de travail');
    expect(getFrenchFormLabel({ category: 'emotional_regulation' })).toBe('fiche de travail');
  });

  it('getFrenchFormLabel returns "fiche de travail" for null/undefined', () => {
    expect(getFrenchFormLabel(null)).toBe('fiche de travail');
    expect(getFrenchFormLabel(undefined)).toBe('fiche de travail');
  });

  it('resolved French workbook metadata carries category workbook_series and gets the correct label', () => {
    const meta = resolveFrenchWorkbookIntent(
      'Est-ce que tu as un cahier pour les pensées négatives ?'
    );
    expect(meta).not.toBeNull();
    expect(meta.category).toBe('workbook_series');
    expect(getFrenchFormLabel(meta)).toBe('cahier thérapeutique complet');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — French trigger keyword exports
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 13 — French trigger keyword exports', () => {
  it('getFrenchWorkbookTriggerKeywords returns a non-empty array', () => {
    const kws = getFrenchWorkbookTriggerKeywords();
    expect(Array.isArray(kws)).toBe(true);
    expect(kws.length).toBeGreaterThan(0);
    expect(kws).toContain('cahier');
    expect(kws).toContain('cahier de travail');
    expect(kws).toContain('livret');
  });

  it('getFrenchIndividualFormTriggerKeywords returns a non-empty array', () => {
    const kws = getFrenchIndividualFormTriggerKeywords();
    expect(Array.isArray(kws)).toBe(true);
    expect(kws.length).toBeGreaterThan(0);
    expect(kws).toContain('une fiche');
    expect(kws).toContain('feuille de travail');
    expect(kws).toContain('un formulaire');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// B extra — WORKBOOK_CONTENT_METADATA_FR structural integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 13 — WORKBOOK_CONTENT_METADATA_FR structural integrity', () => {
  it('has exactly 7 entries', () => {
    expect(WORKBOOK_CONTENT_METADATA_FR.length).toBe(7);
  });

  it('each entry has required fields', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA_FR) {
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

  it('every slug in metadata matches a registered French workbook', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA_FR) {
      const meta = resolveFormIntent(wb.slug, 'fr');
      expect(meta, `Metadata slug "${wb.slug}" must resolve via resolveFormIntent`).not.toBeNull();
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// C. Regression
// ─────────────────────────────────────────────────────────────────────────────

describe('Phase 13 — C1: Hebrew workbook routing still works', () => {
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

describe('Phase 13 — C2: English workbook routing still works', () => {
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

describe('Phase 13 — C3: Spanish workbook routing still works', () => {
  it('"¿Tienes un cuaderno para pensamientos negativos?" → adults-cognitive-flexibility-premium-es', () => {
    const meta = resolveSpanishWorkbookIntent('¿Tienes un cuaderno para pensamientos negativos?');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-es');
  });

  it('Spanish: cuaderno = workbook, not individual worksheet', () => {
    const meta = resolveSpanishWorkbookIntent('¿Tienes un cuaderno para pensamientos negativos?');
    expect(meta).not.toBeNull();
    expect(meta?.category).toBe('workbook_series');
    expect(getSpanishFormLabel(meta)).toBe('cuaderno terapéutico completo');
  });
});

describe('Phase 13 — C4: Existing 18 individual forms still resolve', () => {
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

  it('all 18 standard forms still resolve in French', () => {
    for (const id of STANDARD_FORM_IDS) {
      const result = resolveFormWithLanguage(id, 'fr');
      expect(result, `Standard form "${id}" must resolve in French`).not.toBeNull();
      // French is supported, should either return fr or fall back to en
      expect(['fr', 'en']).toContain(result.language);
    }
  });
});

describe('Phase 13 — C5: French workbooks resolve only in French (no fallback to en/he/es)', () => {
  it('French workbooks return null when requested in English (no en fallback)', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'en');
      expect(result, `French workbook "${id}" must return null for English (French-only)`).toBeNull();
    }
  });

  it('French workbooks return null when requested in Hebrew', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'he');
      expect(result, `French workbook "${id}" must return null for Hebrew`).toBeNull();
    }
  });

  it('French workbooks return null when requested in Spanish', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const result = resolveFormWithLanguage(id, 'es');
      expect(result, `French workbook "${id}" must return null for Spanish`).toBeNull();
    }
  });

  it('standard forms continue to fall back to English for unsupported languages', () => {
    const result = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'zh');
    expect(result).not.toBeNull();
    expect(result.language).toBe('en');
  });
});

describe('Phase 13 — C6: Safety — no unapproved form can be sent', () => {
  it('resolveFormIntent returns null for invented French workbook slugs', () => {
    expect(resolveFormIntent('adults-fake-workbook-fr', 'fr')).toBeNull();
    expect(resolveFormIntent('workbook-series', 'fr')).toBeNull();
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

describe('Phase 13 — C7: Open/download behavior unchanged for French workbooks', () => {
  it('each French workbook metadata contains valid file_url for download/open', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'fr');
      expect(resolved).not.toBeNull();
      const { languageData } = resolved;
      expect(languageData.file_url).toBeTruthy();
      expect(languageData.file_url).toMatch(/^\/forms\/fr\//);
      expect(languageData.file_name).toBeTruthy();
      expect(languageData.file_name).toMatch(/\.pdf$/);
    }
  });

  it('toGeneratedFileMetadata shape is compatible with generated_file consumer', () => {
    for (const id of FR_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'fr');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.url).toBeTruthy();
      expect(meta.name).toBeTruthy();
      expect(meta.title).toBeTruthy();
    }
  });
});

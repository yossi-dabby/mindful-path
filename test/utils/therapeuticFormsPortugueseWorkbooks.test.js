import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ALL_FORMS,
  listFormsByAudienceAndCategory,
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
} from '../../src/data/therapeuticForms/index.js';

import {
  resolveFormIntent,
  APPROVED_FORM_INTENT_MAP,
} from '../../src/utils/resolveFormIntent.js';

import {
  resolvePortugueseWorkbookIntent,
  resolvePortugueseWorkbookIntentWithContext,
  resolveWorkbookIntent,
  resolveEnglishWorkbookIntent,
  resolveSpanishWorkbookIntent,
  resolveFrenchWorkbookIntent,
  resolveGermanWorkbookIntent,
  resolveItalianWorkbookIntent,
  getPortugueseFormLabel,
} from '../../src/utils/resolveWorkbookIntent.js';

import { WORKBOOK_CONTENT_METADATA_PT } from '../../src/utils/workbookContentMetadata.js';
import { translations } from '../../src/components/i18n/translations.jsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, '../../public');
const resolvePublicPath = (fileUrl) => path.join(PUBLIC_ROOT, fileUrl);

const PT_WORKBOOK_IDS = [
  'tf-adults-formulation-mapping-premium-pt',
  'tf-adults-awareness-identification-premium-pt',
  'tf-adults-cognitive-flexibility-premium-pt',
  'tf-adults-emotional-regulation-premium-pt',
  'tf-adults-coping-change-premium-pt',
  'tf-adults-strengths-resilience-premium-pt',
  'tf-adults-treatment-summary-custom-forms-premium-pt',
];

const PT_WORKBOOK_SLUGS = [
  'adults-formulation-mapping-premium-pt',
  'adults-awareness-identification-premium-pt',
  'adults-cognitive-flexibility-premium-pt',
  'adults-emotional-regulation-premium-pt',
  'adults-coping-change-premium-pt',
  'adults-strengths-resilience-premium-pt',
  'adults-treatment-summary-custom-forms-premium-pt',
];

const PT_WORKBOOK_URLS = [
  '/forms/pt/adults/adults-formulation-mapping-premium-pt.pdf',
  '/forms/pt/adults/adults-awareness-identification-premium-pt.pdf',
  '/forms/pt/adults/adults-cognitive-flexibility-premium-pt.pdf',
  '/forms/pt/adults/adults-emotional-regulation-premium-pt.pdf',
  '/forms/pt/adults/adults-coping-change-premium-pt.pdf',
  '/forms/pt/adults/adults-strengths-resilience-premium-pt.pdf',
  '/forms/pt/adults/adults-treatment-summary-custom-forms-premium-pt.pdf',
];

describe('Portuguese workbooks — registry', () => {
  it('all 7 Portuguese workbook IDs exist and are approved workbook entries', () => {
    for (const id of PT_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form).toBeDefined();
      expect(form?.approved).toBe(true);
      expect(form?.audience).toBe('adults');
      expect(form?.category).toBe('workbook_series');
      expect(form?.type).toBe('therapeutic_workbook');
    }
  });

  it('all 7 Portuguese workbook URLs are exact and files exist', () => {
    for (const [i, id] of PT_WORKBOOK_IDS.entries()) {
      const resolved = resolveFormWithLanguage(id, 'pt');
      expect(resolved).not.toBeNull();
      expect(resolved?.language).toBe('pt');
      expect(resolved?.languageData?.file_url).toBe(PT_WORKBOOK_URLS[i]);
      expect(fs.existsSync(resolvePublicPath(PT_WORKBOOK_URLS[i]))).toBe(true);
    }
  });

  it('all 7 Portuguese workbooks generate valid generated_file metadata', () => {
    for (const id of PT_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'pt');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta).not.toBeNull();
      expect(meta?.form_id).toBe(id);
      expect(meta?.language).toBe('pt');
      expect(meta?.category).toBe('workbook_series');
      expect(meta?.type).toBe('pdf');
      expect(meta?.url).toMatch(/^\/forms\/pt\//);
    }
  });

  it('Portuguese adults workbook_series listing includes exactly these 7 workbook IDs', () => {
    const ptWorkbooks = listFormsByAudienceAndCategory('adults', 'workbook_series')
      .filter(f => f.id.endsWith('-pt'));
    expect(ptWorkbooks.length).toBe(7);
    expect(new Set(ptWorkbooks.map(f => f.id))).toEqual(new Set(PT_WORKBOOK_IDS));
  });

  it('Portuguese category translation for workbook_series is Cadernos terapêuticos', () => {
    expect(translations.pt.translation.therapeutic_forms.category.workbook_series).toBe('Cadernos terapêuticos');
  });
});

describe('Portuguese workbooks — content metadata', () => {
  it('metadata has exactly 7 entries and each entry is structurally valid', () => {
    expect(WORKBOOK_CONTENT_METADATA_PT.length).toBe(7);
    for (const wb of WORKBOOK_CONTENT_METADATA_PT) {
      expect(typeof wb.id).toBe('string');
      expect(typeof wb.slug).toBe('string');
      expect(Array.isArray(wb.internalForms)).toBe(true);
      expect(Array.isArray(wb.topicKeywords)).toBe(true);
      expect(Array.isArray(wb.lowerPriorityIndividualForms)).toBe(true);
      expect(wb.internalForms.length).toBeGreaterThan(0);
      expect(wb.topicKeywords.length).toBeGreaterThan(0);
    }
  });
});

describe('Portuguese workbooks — routing behavior', () => {
  it('no forced attachment for plain therapeutic topic statement', () => {
    expect(resolvePortugueseWorkbookIntent('Quero trabalhar pensamentos negativos')).toBeNull();
  });

  it('individual worksheet/form language preserves individual-form routing', () => {
    expect(resolvePortugueseWorkbookIntent('Você tem uma ficha para pensamentos negativos?')).toBeNull();
  });

  it('explicit workbook language routes negative-thoughts workbook to cognitive-flexibility PT', () => {
    const meta = resolvePortugueseWorkbookIntent('Você tem um caderno para pensamentos negativos?');
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-pt');
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
    expect(meta?.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('context-aware follow-up routes to cognitive-flexibility PT', () => {
    const meta = resolvePortugueseWorkbookIntentWithContext(
      'Você tem um caderno para isso?',
      'pensamentos negativos e verificação de pensamentos'
    );
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-pt');
  });

  it('procrastination/avoidance/habits workbook query routes to coping-change PT', () => {
    const meta = resolvePortugueseWorkbookIntent('Você tem um caderno para procrastinação, evitação e hábitos difíceis?');
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-pt');
    expect(meta?.form_id).not.toBe('tf-adults-behavioral-activation-plan');
  });

  it('emotional regulation workbook query routes to emotional-regulation PT', () => {
    const meta = resolvePortugueseWorkbookIntent('Você tem um caderno para regulação emocional e emoções fortes?');
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-pt');
  });

  it('broad multi-topic strengths query routes to strengths-resilience PT', () => {
    const meta = resolvePortugueseWorkbookIntent('Quero trabalhar pontos fortes, resiliência, confiança e autoeficácia');
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-pt');
  });

  it('treatment summary/custom forms query routes to treatment-summary PT', () => {
    const meta = resolvePortugueseWorkbookIntent('Estou terminando uma terapia e quero uma síntese do tratamento e formulários personalizados');
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-pt');
  });

  it('direct individual requests remain individual via resolveFormIntent when Portuguese forms exist', () => {
    expect(resolveFormIntent('registro de pensamentos cbt', 'pt')?.form_id).toBe('tf-adults-cbt-thought-record');
    expect(resolveFormIntent('ficha sobre distorções cognitivas', 'pt')?.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('Portuguese workbook label is not worksheet wording', () => {
    expect(getPortugueseFormLabel({ category: 'workbook_series' })).toBe('caderno terapêutico completo');
    expect(getPortugueseFormLabel({ category: 'thought_records' })).toBe('ficha');
  });

  it('generic resolver with lang=pt delegates correctly', () => {
    const meta = resolveWorkbookIntent('Você tem um caderno para pensamentos negativos?', 'pt');
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-pt');
  });
});

describe('Portuguese workbooks — regressions', () => {
  it('Hebrew workbook routing still works', () => {
    const meta = resolveWorkbookIntent('יש לי מחשבות שליליות, יש לך קונטרס להפריך אותן?', 'he');
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-he');
  });

  it('English workbook routing still works', () => {
    const meta = resolveEnglishWorkbookIntent('Do you have a workbook for negative thoughts?');
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-en');
  });

  it('Spanish workbook routing still works', () => {
    const meta = resolveSpanishWorkbookIntent('¿Tienes un cuaderno para pensamientos negativos?');
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-es');
  });

  it('French workbook routing still works', () => {
    const meta = resolveFrenchWorkbookIntent('Est-ce que tu as un cahier pour les pensées négatives ?');
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-fr');
  });

  it('German workbook routing still works', () => {
    const meta = resolveGermanWorkbookIntent('Hast du ein Arbeitsheft für negative Gedanken?');
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-de');
  });

  it('Italian workbook routing still works', () => {
    const meta = resolveItalianWorkbookIntent('Hai un quaderno per i pensieri negativi?');
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-it');
  });

  it('existing 18 individual forms still resolve', () => {
    const approvedIndividuals = ALL_FORMS.filter(f => f.approved === true && f.category !== 'workbook_series');
    expect(approvedIndividuals.length).toBe(18);
    for (const form of approvedIndividuals) {
      const resolved = resolveFormWithLanguage(form.id, 'en');
      expect(resolved).not.toBeNull();
    }
  });

  it('total approved counts reflect +7 Portuguese workbooks', () => {
    const approved = ALL_FORMS.filter(f => f.approved === true);
    const approvedWorkbooks = ALL_FORMS.filter(f => f.approved === true && f.category === 'workbook_series');
    expect(approvedWorkbooks.length).toBe(49);
    expect(approved.length).toBe(67);
  });

  it('all Portuguese workbook slugs are resolvable directly', () => {
    for (const slug of PT_WORKBOOK_SLUGS) {
      const meta = resolveFormIntent(slug, 'pt');
      expect(meta).not.toBeNull();
      expect(meta?.category).toBe('workbook_series');
    }
  });

  it('all 7 Portuguese workbook IDs are values in APPROVED_FORM_INTENT_MAP', () => {
    const mapValues = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const id of PT_WORKBOOK_IDS) {
      expect(mapValues.has(id)).toBe(true);
    }
  });
});

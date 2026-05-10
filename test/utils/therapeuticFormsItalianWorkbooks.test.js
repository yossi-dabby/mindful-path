import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  ALL_FORMS,
  listFormsByAudience,
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
} from '../../src/data/therapeuticForms/index.js';

import {
  resolveFormIntent,
  APPROVED_FORM_INTENT_MAP,
} from '../../src/utils/resolveFormIntent.js';

import {
  resolveItalianWorkbookIntent,
  resolveItalianWorkbookIntentWithContext,
  getItalianFormLabel,
  resolveWorkbookIntent,
  resolveEnglishWorkbookIntent,
  resolveSpanishWorkbookIntent,
  resolveFrenchWorkbookIntent,
  resolveGermanWorkbookIntent,
} from '../../src/utils/resolveWorkbookIntent.js';

import { WORKBOOK_CONTENT_METADATA_IT } from '../../src/utils/workbookContentMetadata.js';
import { translations } from '../../src/components/i18n/translations.jsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, '../../public');
const resolvePublicPath = (fileUrl) => path.join(PUBLIC_ROOT, fileUrl);

const IT_WORKBOOK_IDS = [
  'tf-adults-formulation-mapping-premium-it',
  'tf-adults-awareness-identification-premium-it',
  'tf-adults-cognitive-flexibility-premium-it',
  'tf-adults-emotional-regulation-premium-it',
  'tf-adults-coping-change-premium-it',
  'tf-adults-strengths-resilience-premium-it',
  'tf-adults-treatment-summary-custom-forms-premium-it',
];

const IT_WORKBOOK_SLUGS = [
  'adults-formulation-mapping-premium-it',
  'adults-awareness-identification-premium-it',
  'adults-cognitive-flexibility-premium-it',
  'adults-emotional-regulation-premium-it',
  'adults-coping-change-premium-it',
  'adults-strengths-resilience-premium-it',
  'adults-treatment-summary-custom-forms-premium-it',
];

const IT_WORKBOOK_URLS = [
  '/forms/it/adults/adults-formulation-mapping-premium-it.pdf',
  '/forms/it/adults/adults-awareness-identification-premium-it.pdf',
  '/forms/it/adults/adults-cognitive-flexibility-premium-it.pdf',
  '/forms/it/adults/adults-emotional-regulation-premium-it.pdf',
  '/forms/it/adults/adults-coping-change-premium-it.pdf',
  '/forms/it/adults/adults-strengths-resilience-premium-it.pdf',
  '/forms/it/adults/adults-treatment-summary-custom-forms-premium-it.pdf',
];

describe('Italian workbooks — registry', () => {
  it('all 7 Italian workbook IDs exist and are approved workbook entries', () => {
    for (const id of IT_WORKBOOK_IDS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form).toBeDefined();
      expect(form?.approved).toBe(true);
      expect(form?.audience).toBe('adults');
      expect(form?.category).toBe('workbook_series');
      expect(form?.type).toBe('therapeutic_workbook');
    }
  });

  it('all 7 Italian workbook URLs are exact and files exist', () => {
    for (const [i, id] of IT_WORKBOOK_IDS.entries()) {
      const resolved = resolveFormWithLanguage(id, 'it');
      expect(resolved).not.toBeNull();
      expect(resolved?.language).toBe('it');
      expect(resolved?.languageData?.file_url).toBe(IT_WORKBOOK_URLS[i]);
      expect(fs.existsSync(resolvePublicPath(IT_WORKBOOK_URLS[i]))).toBe(true);
    }
  });

  it('all 7 Italian workbooks generate valid generated_file metadata', () => {
    for (const id of IT_WORKBOOK_IDS) {
      const resolved = resolveFormWithLanguage(id, 'it');
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta).not.toBeNull();
      expect(meta?.form_id).toBe(id);
      expect(meta?.language).toBe('it');
      expect(meta?.category).toBe('workbook_series');
      expect(meta?.type).toBe('pdf');
      expect(meta?.url).toMatch(/^\/forms\/it\//);
    }
  });

  it('Italian adults workbook_series listing includes exactly these 7 workbook IDs', () => {
    const adults = listFormsByAudience('adults');
    const itWorkbooks = adults.filter(f => f.category === 'workbook_series' && f.id.endsWith('-it'));
    expect(itWorkbooks.length).toBe(7);
    expect(new Set(itWorkbooks.map(f => f.id))).toEqual(new Set(IT_WORKBOOK_IDS));
  });

  it('Italian category translation for workbook_series is Quaderni terapeutici', () => {
    expect(translations.it.translation.therapeutic_forms.category.workbook_series).toBe('Quaderni terapeutici');
  });

  it('all 7 Italian workbook IDs are resolvable through approved intent map', () => {
    const mapValues = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const id of IT_WORKBOOK_IDS) {
      expect(mapValues.has(id)).toBe(true);
    }
  });
});

describe('Italian workbooks — content metadata', () => {
  it('metadata has exactly 7 entries and each entry is structurally valid', () => {
    expect(WORKBOOK_CONTENT_METADATA_IT.length).toBe(7);
    for (const wb of WORKBOOK_CONTENT_METADATA_IT) {
      expect(typeof wb.id).toBe('string');
      expect(typeof wb.slug).toBe('string');
      expect(Array.isArray(wb.internalForms)).toBe(true);
      expect(Array.isArray(wb.topicKeywords)).toBe(true);
      expect(Array.isArray(wb.lowerPriorityIndividualForms)).toBe(true);
      expect(wb.internalForms.length).toBeGreaterThan(0);
      expect(wb.topicKeywords.length).toBeGreaterThan(0);
    }
  });

  it('metadata slugs resolve to approved Italian workbook entries', () => {
    for (const wb of WORKBOOK_CONTENT_METADATA_IT) {
      const meta = resolveFormIntent(wb.slug, 'it');
      expect(meta).not.toBeNull();
      expect(meta?.category).toBe('workbook_series');
      expect(meta?.language).toBe('it');
    }
  });
});

describe('Italian workbooks — routing behavior', () => {
  it('no forced attachment for plain therapeutic topic statement', () => {
    expect(resolveItalianWorkbookIntent('Voglio lavorare sui pensieri negativi')).toBeNull();
  });

  it('individual worksheet language keeps routing available for individual forms', () => {
    expect(resolveItalianWorkbookIntent('Hai una scheda per i pensieri negativi?')).toBeNull();
  });

  it('explicit workbook language routes negative-thoughts workbook to cognitive-flexibility IT', () => {
    const meta = resolveItalianWorkbookIntent('Hai un quaderno per i pensieri negativi?');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-it');
    expect(meta?.form_id).not.toBe('tf-adults-cbt-thought-record');
    expect(meta?.form_id).not.toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('context-aware follow-up routes to cognitive-flexibility IT', () => {
    const meta = resolveItalianWorkbookIntentWithContext(
      'Hai un quaderno per questo?',
      'pensieri negativi e verifica dei pensieri'
    );
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-it');
  });

  it('procrastination/avoidance/habits workbook query routes to coping-change IT', () => {
    const meta = resolveItalianWorkbookIntent('Hai un quaderno per procrastinazione, evitamento e abitudini difficili?');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-coping-change-premium-it');
    expect(meta?.form_id).not.toBe('tf-adults-behavioral-activation-plan');
  });

  it('emotional regulation workbook query routes to emotional-regulation IT', () => {
    const meta = resolveItalianWorkbookIntent('Hai un quaderno per regolazione emotiva ed emozioni forti?');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-emotional-regulation-premium-it');
  });

  it('broad multi-topic strengths query routes to strengths-resilience IT', () => {
    const meta = resolveItalianWorkbookIntent('Voglio lavorare su punti di forza, resilienza, fiducia e autoefficacia');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-strengths-resilience-premium-it');
  });

  it('treatment summary/custom forms query routes to treatment-summary IT', () => {
    const meta = resolveItalianWorkbookIntent('Sto terminando una terapia e voglio una sintesi del trattamento e moduli personalizzati');
    expect(meta).not.toBeNull();
    expect(meta?.form_id).toBe('tf-adults-treatment-summary-custom-forms-premium-it');
  });

  it('direct individual requests remain individual via resolveFormIntent', () => {
    expect(resolveFormIntent('registro dei pensieri cbt', 'it')?.form_id).toBe('tf-adults-cbt-thought-record');
    expect(resolveFormIntent('scheda sulle distorsioni cognitive', 'it')?.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('Italian workbook label is not worksheet wording', () => {
    expect(getItalianFormLabel({ category: 'workbook_series' })).toBe('quaderno terapeutico completo');
    expect(getItalianFormLabel({ category: 'thought_records' })).toBe('scheda');
  });

  it('generic resolver with lang=it delegates correctly', () => {
    const meta = resolveWorkbookIntent('Hai un quaderno per i pensieri negativi?', 'it');
    expect(meta?.form_id).toBe('tf-adults-cognitive-flexibility-premium-it');
  });
});

describe('Italian workbooks — regressions', () => {
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

  it('existing 18 individual forms still resolve', () => {
    const approvedIndividuals = ALL_FORMS.filter(f => f.approved === true && f.category !== 'workbook_series' && f.category !== 'children_cbt_process');
    expect(approvedIndividuals.length).toBe(18);
    for (const form of approvedIndividuals) {
      const resolved = resolveFormWithLanguage(form.id, 'en');
      expect(resolved).not.toBeNull();
    }
  });

  it('total approved counts reflect +7 Portuguese workbooks on top of prior languages', () => {
    const approved = ALL_FORMS.filter(f => f.approved === true);
    const approvedWorkbooks = ALL_FORMS.filter(f => f.approved === true && f.category === 'workbook_series');
    expect(approvedWorkbooks.length).toBe(50);
    expect(approved.length).toBe(98);
  });

  it('all Italian workbook slugs are resolvable directly', () => {
    for (const slug of IT_WORKBOOK_SLUGS) {
      const meta = resolveFormIntent(slug, 'it');
      expect(meta).not.toBeNull();
      expect(meta?.category).toBe('workbook_series');
    }
  });
});

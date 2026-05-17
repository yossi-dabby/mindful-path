import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import {
  FORMS_ADOLESCENTS_CBT_CORE_EN,
  FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL,
  FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS,
} from '../../src/data/therapeuticForms/forms.adolescents.cbt-core.en.js';
import {
  resolveFormIntent,
  resolveAdolescentsCBTCoreEnglishFormByContent,
} from '../../src/utils/resolveFormIntent.js';

const ROOT = '/home/runner/work/mindful-path/mindful-path';
const CORE_ID = 'adolescents-cbt-core-en';
const CORE_URL = '/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf';

function byFormNumber(formNumber) {
  return FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL.find((form) => form.formNumber === formNumber) || null;
}

describe('therapeuticFormsAdolescentsCBTCoreEnglish.test.js', () => {
  it('keeps parent package active and registers 30 individual worksheet entries', () => {
    const parent = FORMS_ADOLESCENTS_CBT_CORE_EN.find((form) => form.id === CORE_ID);

    expect(parent).toBeTruthy();
    expect(parent?.type).toBe('workbook_package');
    expect(parent?.fileUrl).toBe(CORE_URL);

    expect(FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL).toHaveLength(30);

    const allIds = FORMS_ADOLESCENTS_CBT_CORE_EN.map((form) => form.id);
    const allSlugs = FORMS_ADOLESCENTS_CBT_CORE_EN.map((form) => form.slug);

    expect(new Set(allIds).size).toBe(allIds.length);
    expect(new Set(allSlugs).size).toBe(allSlugs.length);
  });

  it('keeps individual worksheet metadata canonical and language/audience gated', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL) {
      expect(form.parentSeriesId).toBe(CORE_ID);
      expect(form.type).toBe('individual_worksheet');
      expect(form.language).toBe('en');
      expect(form.audience).toBe('adolescents');
      expect(form.category).toBe('adolescents_cbt_core');
      expect(form.fileUrl.startsWith('/forms/adolescents/en/core/individual/')).toBe(true);
      expect(form.formNumber).toMatch(/^[1-6]\.[1-5]$/);
      expect(Number.isInteger(form.stageNumber)).toBe(true);
      expect(Number.isInteger(form.pageNumberInWorkbook)).toBe(true);
      expect(form.languages?.en?.file_url).toBe(form.fileUrl);
    }
  });

  it('keeps ALL_FORMS canonical and includes package + 30 individual forms', () => {
    expect(ALL_FORMS.find((form) => form.id === CORE_ID)?.fileUrl).toBe(CORE_URL);
    const individualInAllForms = ALL_FORMS.filter((form) => form.parentSeriesId === CORE_ID && form.type === 'individual_worksheet');
    expect(individualInAllForms).toHaveLength(30);
  });

  it('ensures full PDF and all individual PDFs exist and are valid PDF files', () => {
    const fullPdfPath = path.join(ROOT, 'public/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf');
    expect(fs.existsSync(fullPdfPath)).toBe(true);

    const fullPdfHeader = fs.readFileSync(fullPdfPath).subarray(0, 5).toString('utf8');
    expect(fullPdfHeader).toBe('%PDF-');

    for (const form of FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL) {
      const absolutePath = path.join(ROOT, 'public', form.fileUrl.replace(/^\//, ''));
      expect(fs.existsSync(absolutePath)).toBe(true);

      const buffer = fs.readFileSync(absolutePath);
      expect(buffer.subarray(0, 5).toString('utf8')).toBe('%PDF-');

      const pageMarkerCount = (buffer.toString('latin1').match(/\/Type\s*\/Page(?!s)\b/g) || []).length;
      expect(pageMarkerCount).toBe(1);
    }
  });

  it('resolves package-level requests to the full workbook', () => {
    const requests = [
      'full workbook',
      'complete cbt series',
      'full adolescent cbt core',
      'all teen cbt worksheets',
      'complete series',
      'full CBT workbook for a teen',
    ];

    for (const request of requests) {
      const metadata = resolveAdolescentsCBTCoreEnglishFormByContent(request, { activeLanguage: 'en' });
      expect(metadata?.form_id).toBe(CORE_ID);
      expect(metadata?.url).toBe(CORE_URL);
    }
  });

  it('resolves form-number requests to the matching individual worksheet', () => {
    const oneOne = resolveAdolescentsCBTCoreEnglishFormByContent('Send form 1.1', { activeLanguage: 'en' });
    const oneTwo = resolveAdolescentsCBTCoreEnglishFormByContent('send form 1.2', { activeLanguage: 'en' });
    const oneFour = resolveAdolescentsCBTCoreEnglishFormByContent('Send form 1.4', { activeLanguage: 'en' });

    expect(oneOne?.form_id).toBe(byFormNumber('1.1')?.id);
    expect(oneTwo?.form_id).toBe(byFormNumber('1.2')?.id);
    expect(oneFour?.form_id).toBe(byFormNumber('1.4')?.id);
  });

  it('resolves content requests to matching individual worksheets', () => {
    const bodySignals = resolveAdolescentsCBTCoreEnglishFormByContent('Send me the body signals worksheet', { activeLanguage: 'en' });
    const trigger = resolveAdolescentsCBTCoreEnglishFormByContent('Do you have a trigger worksheet for a teen?', { activeLanguage: 'en' });
    const thoughtFact = resolveAdolescentsCBTCoreEnglishFormByContent('I need a thought vs fact worksheet', { activeLanguage: 'en' });
    const evidence = resolveAdolescentsCBTCoreEnglishFormByContent('I need evidence for and against a thought', { activeLanguage: 'en' });
    const avoidance = resolveAdolescentsCBTCoreEnglishFormByContent('help with avoidance', { activeLanguage: 'en' });
    const smallSteps = resolveAdolescentsCBTCoreEnglishFormByContent('small steps worksheet', { activeLanguage: 'en' });
    const weekly = resolveAdolescentsCBTCoreEnglishFormByContent('weekly check in', { activeLanguage: 'en' });

    expect(bodySignals?.form_id).toBe(byFormNumber('1.2')?.id);
    expect(trigger?.form_id).toBe(byFormNumber('1.3')?.id);
    expect(thoughtFact?.form_id).toBe(byFormNumber('2.2')?.id);
    expect(evidence?.form_id).toBe(byFormNumber('3.1')?.id);
    expect(avoidance?.form_id).toBe(byFormNumber('5.1')?.id);
    expect(smallSteps?.form_id).toBe(byFormNumber('5.2')?.id);
    expect(weekly?.form_id).toBe(byFormNumber('6.2')?.id);
  });

  it('does not resolve for disallowed language/audience requests unless explicit English is asked', () => {
    expect(resolveAdolescentsCBTCoreEnglishFormByContent('אני צריך טופס בעברית למתבגר', { activeLanguage: 'he' })).toBeNull();
    expect(resolveAdolescentsCBTCoreEnglishFormByContent('I need a CBT workbook for children', { activeLanguage: 'en' })).toBeNull();
    expect(resolveAdolescentsCBTCoreEnglishFormByContent('I need an adult CBT workbook for stress', { activeLanguage: 'en' })).toBeNull();

    const explicitEnglish = resolveAdolescentsCBTCoreEnglishFormByContent('I need an adolescent CBT workbook in English for anxiety', { activeLanguage: 'he' });
    expect(explicitEnglish?.form_id).toBe(CORE_ID);
  });

  it('returns generated_file metadata including individual worksheet fields', () => {
    const target = byFormNumber('6.2');
    const metadata = resolveFormIntent(target.id, 'en');

    expect(metadata?.form_id).toBe(target.id);
    expect(metadata?.title).toBe(target.title);
    expect(metadata?.language).toBe('en');
    expect(metadata?.audience).toBe('adolescents');
    expect(metadata?.category).toBe('adolescents_cbt_core');
    expect(metadata?.url).toBe(target.fileUrl);
    expect(metadata?.parentSeriesId).toBe(CORE_ID);
    expect(metadata?.formNumber).toBe('6.2');
    expect(metadata?.stageNumber).toBe(6);
  });

  it('keeps stale deleted forms unavailable', () => {
    expect(resolveFormIntent('tf-adults-cbt-thought-record', 'en')).toBeNull();
    expect(resolveFormIntent('tf-children-cbt-stage-2-2-premium-he', 'he')).toBeNull();
  });
});

// ─── Stage group catalog ──────────────────────────────────────────────────────

describe('FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS — catalog shape', () => {
  it('exports exactly 6 stage groups', () => {
    expect(FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS).toHaveLength(6);
  });

  it('every stage group has the required metadata fields', () => {
    for (const sg of FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS) {
      expect(sg.type).toBe('stage_group');
      expect(sg.language).toBe('en');
      expect(sg.audience).toBe('adolescents');
      expect(sg.category).toBe('adolescents_cbt_core');
      expect(sg.parentSeriesId).toBe(CORE_ID);
      expect(sg.approved).toBe(true);
      expect(sg.stageNumber).toBeGreaterThanOrEqual(1);
      expect(sg.stageNumber).toBeLessThanOrEqual(6);
      expect(typeof sg.title).toBe('string');
      expect(Array.isArray(sg.secondaryCategories)).toBe(true);
    }
  });

  it('stage groups have ids matching adolescents-cbt-core-en-stage-{1..6}', () => {
    for (let stage = 1; stage <= 6; stage++) {
      const sg = FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS.find((s) => s.stageNumber === stage);
      expect(sg).toBeTruthy();
      expect(sg.id).toBe(`adolescents-cbt-core-en-stage-${stage}`);
    }
  });

  it('stage groups are not in ALL_FORMS (they are UI groupings, not resolvable forms)', () => {
    const allIds = ALL_FORMS.map((f) => f.id);
    for (const sg of FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS) {
      expect(allIds).not.toContain(sg.id);
    }
  });
});

// ─── Stage group worksheet membership ────────────────────────────────────────

describe('Stage groups — worksheet membership per stage', () => {
  function worksheetsForStage(stageNumber) {
    return FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL.filter((w) => w.stageNumber === stageNumber);
  }

  it('Stage 1 contains forms 1.1–1.5', () => {
    expect(worksheetsForStage(1).map((w) => w.formNumber)).toEqual(['1.1', '1.2', '1.3', '1.4', '1.5']);
  });

  it('Stage 2 contains forms 2.1–2.5', () => {
    expect(worksheetsForStage(2).map((w) => w.formNumber)).toEqual(['2.1', '2.2', '2.3', '2.4', '2.5']);
  });

  it('Stage 3 contains forms 3.1–3.5', () => {
    expect(worksheetsForStage(3).map((w) => w.formNumber)).toEqual(['3.1', '3.2', '3.3', '3.4', '3.5']);
  });

  it('Stage 4 contains forms 4.1–4.5', () => {
    expect(worksheetsForStage(4).map((w) => w.formNumber)).toEqual(['4.1', '4.2', '4.3', '4.4', '4.5']);
  });

  it('Stage 5 contains forms 5.1–5.5, including avoidance (5.1) and small steps (5.2)', () => {
    const forms = worksheetsForStage(5).map((w) => w.formNumber);
    expect(forms).toEqual(['5.1', '5.2', '5.3', '5.4', '5.5']);
  });

  it('Stage 6 contains forms 6.1–6.5, including weekly check-in (6.2)', () => {
    const forms = worksheetsForStage(6).map((w) => w.formNumber);
    expect(forms).toEqual(['6.1', '6.2', '6.3', '6.4', '6.5']);
  });

  it('every worksheet has a /forms/ public URL for open/download', () => {
    for (const w of FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL) {
      expect(w.fileUrl.startsWith('/forms/adolescents/en/core/individual/')).toBe(true);
      expect(w.languages.en.file_url).toBe(w.fileUrl);
    }
  });

  it('stage groups have no top-level file_url — no fake combined stage PDFs', () => {
    for (const sg of FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS) {
      expect(sg.fileUrl).toBeUndefined();
      expect(sg.languages).toBeUndefined();
    }
  });
});

// ─── TherapeuticForms.jsx — stage group filtering source-code contract ─────────

describe('TherapeuticForms.jsx — stage group UI display source-code contract', () => {
  const ROOT = '/home/runner/work/mindful-path/mindful-path';
  const pageSrc = fs.readFileSync(`${ROOT}/src/pages/TherapeuticForms.jsx`, 'utf8');

  it('imports FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS from canonical forms source', () => {
    expect(pageSrc).toContain('FORMS_ADOLESCENTS_CBT_CORE_EN_STAGE_GROUPS');
    expect(pageSrc).toContain('forms.adolescents.cbt-core.en.js');
  });

  it('imports FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL from canonical forms source', () => {
    expect(pageSrc).toContain('FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL');
  });

  it('filters stage groups only for lang === en', () => {
    expect(pageSrc).toContain("lang === 'en'");
  });

  it('filters stage groups by audience', () => {
    expect(pageSrc).toContain('sg.audience === audience');
  });

  it('individual_worksheet type is excluded from top-level card display', () => {
    expect(pageSrc).toContain("type !== 'individual_worksheet'");
  });

  it('stage_group type triggers worksheet list rendering', () => {
    expect(pageSrc).toContain("form.type === 'stage_group'");
    expect(pageSrc).toContain('worksheets.map');
  });

  it('Open/Download buttons are gated on languageData.file_url — stage groups get worksheet buttons instead', () => {
    expect(pageSrc).toContain('languageData.file_url');
  });
});

// ─── AI resolver regression — individual worksheets remain resolvable ─────────

describe('AI resolver regression — individual worksheets still resolvable after stage grouping', () => {
  it('body signals still resolves to form 1.2', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('body signals worksheet', { activeLanguage: 'en' });
    expect(result?.form_id).toBe(`${CORE_ID}-1-2`);
  });

  it('trigger still resolves to form 1.3', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('what triggered me', { activeLanguage: 'en' });
    expect(result?.form_id).toBe(`${CORE_ID}-1-3`);
  });

  it('thought or fact still resolves to form 2.2', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('thought or fact', { activeLanguage: 'en' });
    expect(result?.form_id).toBe(`${CORE_ID}-2-2`);
  });

  it('evidence still resolves to form 3.1', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('evidence for and against a thought', { activeLanguage: 'en' });
    expect(result?.form_id).toBe(`${CORE_ID}-3-1`);
  });

  it('avoidance still resolves to form 5.1', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('help with avoidance', { activeLanguage: 'en' });
    expect(result?.form_id).toBe(`${CORE_ID}-5-1`);
  });

  it('small steps still resolves to form 5.2', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('small steps worksheet', { activeLanguage: 'en' });
    expect(result?.form_id).toBe(`${CORE_ID}-5-2`);
  });

  it('weekly check-in still resolves to form 6.2', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('weekly check in', { activeLanguage: 'en' });
    expect(result?.form_id).toBe(`${CORE_ID}-6-2`);
  });

  it('full workbook request still resolves to full package', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('full workbook', { activeLanguage: 'en' });
    expect(result?.form_id).toBe(CORE_ID);
    expect(result?.url).toBe('/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf');
  });
});

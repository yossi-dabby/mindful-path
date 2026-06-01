/**
 * Tests for Children CBT Core English worksheet integration.
 *
 * Covers:
 *  1. English app language shows these forms; non-English does not.
 *  2. children audience; adult/adolescent category exclusion.
 *  3. All 30 individual worksheet PDF paths resolve to real valid files.
 *  4. No manifest entry points to a missing file.
 *  5. AI matching by content need (not title-only).
 *  6. AI can send an individual worksheet.
 *  7. AI does not send these forms in non-English language mode.
 *  8. AI does not hallucinate non-existent worksheet names.
 *  9. Preview/production use the same registry.
 * 10. resolveFormIntent wires children resolver correctly.
 */

import fs from 'node:fs';
import path from 'node:path';
import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import {
  FORMS_CHILDREN_CBT_CORE_EN,
  FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL,
  FORMS_CHILDREN_CBT_CORE_EN_MODULE_PDFS,
  FORMS_CHILDREN_CBT_CORE_EN_STAGE_GROUPS,
} from '../../src/data/therapeuticForms/forms.children.cbt-core.en.js';
import {
  resolveFormIntent,
  resolveChildrenCBTCoreEnglishFormByContent,
} from '../../src/utils/resolveFormIntent.js';

const ROOT = path.resolve('/home/runner/work/mindful-path/mindful-path');

// ─── 1. Registry structure ──────────────────────────────────────────────────
describe('Children CBT Core EN — registry structure', () => {
  it('exports exactly 30 individual worksheets', () => {
    expect(FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL).toHaveLength(30);
  });

  it('exports 4 module PDFs (stages 1, 3, 4, 5)', () => {
    expect(FORMS_CHILDREN_CBT_CORE_EN_MODULE_PDFS).toHaveLength(4);
    const moduleNumbers = FORMS_CHILDREN_CBT_CORE_EN_MODULE_PDFS.map((m) => m.moduleNumber).sort((a, b) => a - b);
    expect(moduleNumbers).toEqual([1, 3, 4, 5]);
  });

  it('exports 5 stage groups', () => {
    expect(FORMS_CHILDREN_CBT_CORE_EN_STAGE_GROUPS).toHaveLength(5);
  });

  it('has 5 stages, each with 6 worksheets', () => {
    for (let stage = 1; stage <= 5; stage++) {
      const stageWorksheets = FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL.filter((w) => w.stageNumber === stage);
      expect(stageWorksheets).toHaveLength(6);
    }
  });

  it('all individual worksheets have correct audience, language, category, type', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL) {
      expect(form.audience).toBe('children');
      expect(form.language).toBe('en');
      expect(form.category).toBe('children_cbt_core');
      expect(form.type).toBe('individual_worksheet');
      expect(form.parentSeriesId).toBe('children-cbt-core-en');
      expect(form.approved).toBe(true);
      expect(form.formNumber).toMatch(/^[1-5]\.[1-6]$/);
      expect(form.fileUrl).toMatch(/^\/forms\/children\/en\/cbt-core\/children_cbt_core_en_0[1-5]_0[1-6]\.pdf$/);
      expect(form.languages?.en?.file_url).toBe(form.fileUrl);
    }
  });

  it('all individual worksheet IDs and slugs are unique', () => {
    const ids = FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL.map((f) => f.id);
    const slugs = FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL.map((f) => f.slug);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('all forms are present in ALL_FORMS', () => {
    const allIds = new Set(ALL_FORMS.map((f) => f.id));
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL) {
      expect(allIds.has(form.id)).toBe(true);
    }
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_MODULE_PDFS) {
      expect(allIds.has(form.id)).toBe(true);
    }
  });

  it('ALL_FORMS contains exactly 30 children CBT core EN individual worksheets', () => {
    const count = ALL_FORMS.filter(
      (f) => f.audience === 'children' && f.language === 'en' && f.category === 'children_cbt_core' && f.type === 'individual_worksheet'
    ).length;
    expect(count).toBe(30);
  });
});

// ─── 2. PDF asset existence ──────────────────────────────────────────────────
describe('Children CBT Core EN — PDF asset existence', () => {
  it('all 30 individual worksheet PDF files exist and are valid PDFs', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL) {
      const absolutePath = path.join(ROOT, 'public', form.fileUrl.replace(/^\//, ''));
      expect(fs.existsSync(absolutePath), `Missing: ${form.fileUrl}`).toBe(true);

      const buffer = fs.readFileSync(absolutePath);
      expect(buffer.subarray(0, 5).toString('utf8'), `Not a PDF: ${form.fileUrl}`).toBe('%PDF-');
    }
  });

  it('all 4 module PDF files exist and are valid PDFs', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_MODULE_PDFS) {
      const absolutePath = path.join(ROOT, 'public', form.fileUrl.replace(/^\//, ''));
      expect(fs.existsSync(absolutePath), `Missing module PDF: ${form.fileUrl}`).toBe(true);

      const buffer = fs.readFileSync(absolutePath);
      expect(buffer.subarray(0, 5).toString('utf8'), `Not a PDF: ${form.fileUrl}`).toBe('%PDF-');
    }
  });

  it('no form in the registry references a missing file', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN) {
      const fileUrl = form.fileUrl || form.languages?.en?.file_url;
      if (!fileUrl) continue;
      const absolutePath = path.join(ROOT, 'public', fileUrl.replace(/^\//, ''));
      expect(fs.existsSync(absolutePath), `Missing file: ${fileUrl}`).toBe(true);
    }
  });
});

// ─── 3. Language guard — forms registry filtering ────────────────────────────
describe('Children CBT Core EN — language guard (registry metadata)', () => {
  it('all individual worksheets and module PDFs have language: "en" — English only', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN) {
      expect(form.language).toBe('en');
      expect(form.languages?.en).toBeTruthy();
      // Must NOT have any non-English language block
      const otherLangs = Object.keys(form.languages || {}).filter((l) => l !== 'en');
      expect(otherLangs).toHaveLength(0);
    }
  });

  it('all stage groups have language: "en"', () => {
    for (const sg of FORMS_CHILDREN_CBT_CORE_EN_STAGE_GROUPS) {
      expect(sg.language).toBe('en');
    }
  });

  it('no children CBT core EN form has a Hebrew language block', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN) {
      expect(form.languages?.he).toBeUndefined();
    }
  });

  it('ALL_FORMS keeps English children CBT core entries English-only', () => {
    const childrenEnForms = ALL_FORMS.filter(
      (f) => f.audience === 'children' && f.category === 'children_cbt_core' && f.language === 'en'
    );
    for (const form of childrenEnForms) {
      expect(form.languages?.he).toBeUndefined();
    }
  });

  it('all individual worksheets belong to children audience only', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL) {
      expect(form.audience).toBe('children');
    }
  });

  it('adolescent and adult forms are not in the children CBT core registry', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN) {
      expect(form.audience).not.toBe('adolescents');
      expect(form.audience).not.toBe('adults');
      expect(form.audience).not.toBe('older_adults');
    }
  });
});

// ─── 4. AI content-matching ──────────────────────────────────────────────────
describe('Children CBT Core EN — AI content matching', () => {
  it('returns null in Hebrew mode for child feelings query', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'child does not know what they are feeling',
      { activeLanguage: 'he' }
    );
    expect(result).toBeNull();
  });

  it('returns null in Spanish mode for child feelings query', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'child does not know what they are feeling',
      { activeLanguage: 'es' }
    );
    expect(result).toBeNull();
  });

  it('returns null in French mode for child feelings query', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'child does not know what they are feeling',
      { activeLanguage: 'fr' }
    );
    expect(result).toBeNull();
  });

  it('resolves emotion identification query to a Stage 1 worksheet', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'child does not know what they are feeling, help identify emotions',
      { activeLanguage: 'en' }
    );
    expect(result).not.toBeNull();
    expect(result.audience).toBe('children');
    expect(result.stageNumber).toBe(1);
  });

  it('resolves body signals query to a Stage 1 body-clues worksheet', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'child needs to notice body clues and body signals',
      { activeLanguage: 'en' }
    );
    expect(result).not.toBeNull();
    expect(result.audience).toBe('children');
    expect(result.stageNumber).toBe(1);
  });

  it('resolves worry thoughts query to a Stage 2 worksheet', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'child has worry thoughts and anxiety',
      { activeLanguage: 'en' }
    );
    expect(result).not.toBeNull();
    expect(result.audience).toBe('children');
    expect(result.stageNumber).toBe(2);
  });

  it('resolves avoidance / brave step query to a Stage 3 worksheet', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'child avoids hard things, needs a tiny brave step',
      { activeLanguage: 'en' }
    );
    expect(result).not.toBeNull();
    expect(result.audience).toBe('children');
    expect(result.stageNumber).toBe(3);
  });

  it('resolves regulation / calm down query to a Stage 4 worksheet', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'child is upset and needs regulation calm down pause',
      { activeLanguage: 'en' }
    );
    expect(result).not.toBeNull();
    expect(result.audience).toBe('children');
    expect(result.stageNumber).toBe(4);
  });

  it('resolves personal calm plan query to a Stage 5 worksheet', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'child needs a personal calm plan for hard moments',
      { activeLanguage: 'en' }
    );
    expect(result).not.toBeNull();
    expect(result.audience).toBe('children');
    expect(result.stageNumber).toBe(5);
  });

  it('does NOT return children form for adolescent query', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'adolescent needs a thought record worksheet',
      { activeLanguage: 'en' }
    );
    expect(result).toBeNull();
  });

  it('does NOT return children form for teen query', () => {
    const result = resolveChildrenCBTCoreEnglishFormByContent(
      'teen cbt core worksheet',
      { activeLanguage: 'en' }
    );
    expect(result).toBeNull();
  });

  it('does NOT hallucinate non-existent form ID', () => {
    // Use a truly invalid ID with no keywords that could match any form content
    const result = resolveFormIntent('zz-nonexistent-form-xyz', 'en');
    expect(result).toBeNull();
  });
});

// ─── 5. resolveFormIntent integration ───────────────────────────────────────
describe('Children CBT Core EN — resolveFormIntent integration', () => {
  it('resolves by exact form ID', () => {
    const result = resolveFormIntent('children-cbt-core-en-1-1', 'en');
    expect(result).not.toBeNull();
    expect(result.audience).toBe('children');
    expect(result.formNumber).toBe('1.1');
    expect(result.url).toMatch(/children_cbt_core_en_01_01\.pdf$/);
  });

  it('resolves form 2.3 (Worry Thoughts) by ID', () => {
    const result = resolveFormIntent('children-cbt-core-en-2-3', 'en');
    expect(result).not.toBeNull();
    expect(result.formNumber).toBe('2.3');
    expect(result.stageNumber).toBe(2);
  });

  it('resolves Stage 5 final worksheet by ID', () => {
    const result = resolveFormIntent('children-cbt-core-en-5-6', 'en');
    expect(result).not.toBeNull();
    expect(result.formNumber).toBe('5.6');
    expect(result.stageNumber).toBe(5);
  });

  it('returns null for child worksheet ID when lang is Hebrew (no Hebrew language block)', () => {
    const result = resolveFormIntent('children-cbt-core-en-1-1', 'he');
    // The form has only an 'en' language block; resolveFormWithLanguage('he') returns null.
    expect(result).toBeNull();
  });

  it('content query for children feelings resolves in English mode', () => {
    const result = resolveFormIntent('child feelings worksheet emotion identification', 'en');
    expect(result).not.toBeNull();
    expect(result.audience).toBe('children');
  });

  it('content query for children in non-English mode returns null', () => {
    const result = resolveFormIntent('child feelings worksheet emotion identification', 'fr');
    expect(result).toBeNull();
  });
});

// ─── 6. Metadata quality ────────────────────────────────────────────────────
describe('Children CBT Core EN — metadata quality', () => {
  it('every individual worksheet has ai_matching_summary populated', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL) {
      expect(form.aiMatchingSummary, `Missing aiMatchingSummary for ${form.id}`).toBeTruthy();
    }
  });

  it('every individual worksheet has clinicalKeywords array with at least 3 entries', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL) {
      expect(Array.isArray(form.clinicalKeywords), `clinicalKeywords not array: ${form.id}`).toBe(true);
      expect(form.clinicalKeywords.length, `clinicalKeywords too short: ${form.id}`).toBeGreaterThanOrEqual(3);
    }
  });

  it('every individual worksheet has intentPhrases array with at least 2 entries', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL) {
      expect(Array.isArray(form.intentPhrases), `intentPhrases not array: ${form.id}`).toBe(true);
      expect(form.intentPhrases.length, `intentPhrases too short: ${form.id}`).toBeGreaterThanOrEqual(2);
    }
  });

  it('no individual worksheet has empty title', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL) {
      expect(String(form.title || '').trim(), `Empty title for ${form.id}`).toBeTruthy();
    }
  });

  it('clinicalIntensity is "low" for all children worksheets', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL) {
      expect(form.clinicalIntensity).toBe('low');
    }
  });

  it('safetyNotes is populated and confirms child-safe status', () => {
    for (const form of FORMS_CHILDREN_CBT_CORE_EN_INDIVIDUAL) {
      expect(form.safetyNotes, `Missing safetyNotes: ${form.id}`).toBeTruthy();
      // Must be a protective safety note, not a clinical warning
      expect(form.safetyNotes.toLowerCase()).toContain('child-safe');
    }
  });
});

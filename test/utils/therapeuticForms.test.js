/**
 * Tests for Phase 1B: TherapeuticForms registry and resolver.
 *
 * Covers:
 *   1. Approved starter forms are returned by resolver live queries.
 *   2. All approved forms have real non-empty file_url values.
 *   3. All approved form file_url values start with `/forms/`.
 *   4. Requesting Hebrew returns Hebrew metadata with rtl: true.
 *   5. Unsupported language falls back to English.
 *   6. Unapproved seed forms remain hidden.
 *   7. normalizeFormToGeneratedFile() works for approved forms.
 *   8. No fake/missing file links are returned.
 *   9. (FS) Each referenced PDF file exists under public/forms.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { THERAPEUTIC_FORMS_REGISTRY } from '../../src/lib/therapeuticFormsRegistry.js';
import {
  getApprovedForms,
  resolveForm,
  getAllApprovedForms,
  normalizeFormToGeneratedFile,
} from '../../src/lib/therapeuticFormsResolver.js';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_FORMS_ROOT = path.resolve(__dirname, '../../public/forms');

// ─── 1. Starter forms are returned by live queries ───────────────────────────

describe('TherapeuticForms resolver — starter pack live queries', () => {
  it('returns the CBT Thought Record for adults in English', () => {
    const forms = getApprovedForms({ audience: 'adults', lang: 'en' });
    const form = forms.find((f) => f.id === 'cbt-thought-record');
    expect(form).toBeDefined();
    expect(form.title).toBe('CBT Thought Record');
    expect(form.approved).toBe(true);
  });

  it('returns the Behavioral Activation Plan for adults in English', () => {
    const forms = getApprovedForms({ audience: 'adults', lang: 'en' });
    const form = forms.find((f) => f.id === 'behavioral-activation-plan');
    expect(form).toBeDefined();
    expect(form.title).toBe('Behavioral Activation Plan');
    expect(form.approved).toBe(true);
  });

  it('returns the Anxiety Thought Record for adolescents in English', () => {
    const forms = getApprovedForms({ audience: 'adolescents', lang: 'en' });
    const form = forms.find((f) => f.id === 'anxiety-thought-record');
    expect(form).toBeDefined();
    expect(form.title).toBe('Anxiety Thought Record');
    expect(form.approved).toBe(true);
  });

  it('returns the Simple Feelings Check-In for children in English', () => {
    const forms = getApprovedForms({ audience: 'children', lang: 'en' });
    const form = forms.find((f) => f.id === 'simple-feelings-check-in');
    expect(form).toBeDefined();
    expect(form.title).toBe('Simple Feelings Check-In');
    expect(form.approved).toBe(true);
  });

  it('returns the Mood Reflection Sheet for older_adults in English', () => {
    const forms = getApprovedForms({ audience: 'older_adults', lang: 'en' });
    const form = forms.find((f) => f.id === 'mood-reflection-sheet');
    expect(form).toBeDefined();
    expect(form.title).toBe('Mood Reflection Sheet');
    expect(form.approved).toBe(true);
  });

  it('covers all four audience groups with at least one approved form', () => {
    const audiences = ['adults', 'adolescents', 'children', 'older_adults'];
    for (const audience of audiences) {
      const forms = getApprovedForms({ audience, lang: 'en' });
      expect(forms.length, `Expected at least one approved form for audience: ${audience}`).toBeGreaterThan(0);
    }
  });

  it('getAllApprovedForms returns at least 5 forms for English', () => {
    const all = getAllApprovedForms('en');
    expect(all.length).toBeGreaterThanOrEqual(5);
  });
});

// ─── 2 & 3. All approved forms have non-empty file_url starting with /forms/ ──

describe('TherapeuticForms registry — file_url integrity', () => {
  // Collect all approved language variants from the registry
  const approvedVariants = [];
  for (const entry of THERAPEUTIC_FORMS_REGISTRY) {
    for (const [lang, variant] of Object.entries(entry.languages)) {
      if (variant.approved) {
        approvedVariants.push({ id: entry.id, audience: entry.audience, lang, variant });
      }
    }
  }

  it('at least 10 approved language variants exist (5 forms × 2 languages)', () => {
    expect(approvedVariants.length).toBeGreaterThanOrEqual(10);
  });

  it('every approved variant has a non-empty file_url', () => {
    for (const { id, lang, variant } of approvedVariants) {
      expect(variant.file_url, `${id}[${lang}] must have file_url`).toBeTruthy();
      expect(typeof variant.file_url, `${id}[${lang}] file_url must be a string`).toBe('string');
      expect(variant.file_url.trim(), `${id}[${lang}] file_url must not be empty`).not.toBe('');
    }
  });

  it('every approved variant file_url starts with /forms/', () => {
    for (const { id, lang, variant } of approvedVariants) {
      expect(
        variant.file_url.startsWith('/forms/'),
        `${id}[${lang}] file_url must start with /forms/, got: ${variant.file_url}`
      ).toBe(true);
    }
  });

  it('every approved variant has file_type: "pdf"', () => {
    for (const { id, lang, variant } of approvedVariants) {
      expect(variant.file_type, `${id}[${lang}] must have file_type: pdf`).toBe('pdf');
    }
  });

  it('every approved variant has a non-empty file_name', () => {
    for (const { id, lang, variant } of approvedVariants) {
      expect(variant.file_name, `${id}[${lang}] must have file_name`).toBeTruthy();
      expect(variant.file_name.trim()).not.toBe('');
    }
  });
});

// ─── 4. Hebrew returns rtl: true ─────────────────────────────────────────────

describe('TherapeuticForms resolver — Hebrew RTL metadata', () => {
  it('resolveForm returns rtl: true for CBT Thought Record in Hebrew', () => {
    const form = resolveForm('cbt-thought-record', 'he');
    expect(form).not.toBeNull();
    expect(form.rtl).toBe(true);
    expect(form.lang).toBe('he');
  });

  it('resolveForm returns rtl: true for Behavioral Activation Plan in Hebrew', () => {
    const form = resolveForm('behavioral-activation-plan', 'he');
    expect(form).not.toBeNull();
    expect(form.rtl).toBe(true);
  });

  it('resolveForm returns rtl: true for Anxiety Thought Record in Hebrew', () => {
    const form = resolveForm('anxiety-thought-record', 'he');
    expect(form).not.toBeNull();
    expect(form.rtl).toBe(true);
  });

  it('resolveForm returns rtl: true for Simple Feelings Check-In in Hebrew', () => {
    const form = resolveForm('simple-feelings-check-in', 'he');
    expect(form).not.toBeNull();
    expect(form.rtl).toBe(true);
  });

  it('resolveForm returns rtl: true for Mood Reflection Sheet in Hebrew', () => {
    const form = resolveForm('mood-reflection-sheet', 'he');
    expect(form).not.toBeNull();
    expect(form.rtl).toBe(true);
  });

  it('Hebrew file_url contains /he/ path segment', () => {
    const form = resolveForm('cbt-thought-record', 'he');
    expect(form.file_url).toMatch(/\/forms\/he\//);
  });

  it('getApprovedForms for adults in Hebrew returns rtl: true for all results', () => {
    const forms = getApprovedForms({ audience: 'adults', lang: 'he' });
    expect(forms.length).toBeGreaterThan(0);
    for (const form of forms) {
      expect(form.rtl).toBe(true);
    }
  });

  it('English forms have rtl: false', () => {
    const forms = getApprovedForms({ audience: 'adults', lang: 'en' });
    for (const form of forms) {
      expect(form.rtl).toBe(false);
    }
  });
});

// ─── 5. Unsupported language falls back to English ───────────────────────────

describe('TherapeuticForms resolver — language fallback', () => {
  it('falls back to English when requesting Spanish (no approved es variant)', () => {
    const form = resolveForm('cbt-thought-record', 'es');
    expect(form).not.toBeNull();
    expect(form.lang).toBe('en');
    expect(form.rtl).toBe(false);
  });

  it('falls back to English for French', () => {
    const form = resolveForm('behavioral-activation-plan', 'fr');
    expect(form).not.toBeNull();
    expect(form.lang).toBe('en');
  });

  it('falls back to English for German', () => {
    const form = resolveForm('anxiety-thought-record', 'de');
    expect(form).not.toBeNull();
    expect(form.lang).toBe('en');
  });

  it('falls back to English for an unknown language code', () => {
    const form = resolveForm('mood-reflection-sheet', 'zz');
    expect(form).not.toBeNull();
    expect(form.lang).toBe('en');
  });

  it('does not return rtl: true for a fallback English form', () => {
    const form = resolveForm('cbt-thought-record', 'fr');
    expect(form.rtl).toBe(false);
  });
});

// ─── 6. Unapproved seed forms remain hidden ──────────────────────────────────

describe('TherapeuticForms resolver — unapproved forms hidden', () => {
  it('returns no Spanish forms (not yet approved)', () => {
    // Spanish variants are seed-only (approved: false), so the resolver falls back to English
    // Spanish should not appear as lang: 'es' in results
    const all = getAllApprovedForms('es');
    for (const form of all) {
      // Must have fallen back to English, not actually served as es
      expect(form.lang).not.toBe('es');
    }
  });

  it('returns no results for a non-existent audience', () => {
    const forms = getApprovedForms({ audience: 'seniors', lang: 'en' });
    expect(forms).toHaveLength(0);
  });

  it('returns null for a non-existent form ID', () => {
    const form = resolveForm('non-existent-form-id', 'en');
    expect(form).toBeNull();
  });

  it('returns null for resolveForm called with empty string', () => {
    expect(resolveForm('', 'en')).toBeNull();
  });

  it('returns empty array for getApprovedForms without audience', () => {
    const forms = getApprovedForms({ lang: 'en' });
    expect(forms).toHaveLength(0);
  });

  it('all registry entries with approved: false have no file_url', () => {
    for (const entry of THERAPEUTIC_FORMS_REGISTRY) {
      for (const [lang, variant] of Object.entries(entry.languages)) {
        if (!variant.approved) {
          // Seed-only variants must not have a file_url
          expect(
            variant.file_url,
            `${entry.id}[${lang}] is not approved but has a file_url — this is a registry error`
          ).toBeFalsy();
        }
      }
    }
  });
});

// ─── 7. normalizeFormToGeneratedFile conversion ───────────────────────────────

describe('TherapeuticForms — normalizeFormToGeneratedFile', () => {
  it('converts an English resolved form to generated_file shape', () => {
    const form = resolveForm('cbt-thought-record', 'en');
    const gf = normalizeFormToGeneratedFile(form);
    expect(gf).not.toBeNull();
    expect(gf.type).toBe('pdf');
    expect(gf.url).toBe('/forms/en/adults/cbt-thought-record.pdf');
    expect(gf.name).toBeTruthy();
    expect(gf.title).toBe('CBT Thought Record');
  });

  it('converts a Hebrew resolved form to generated_file shape', () => {
    const form = resolveForm('cbt-thought-record', 'he');
    const gf = normalizeFormToGeneratedFile(form);
    expect(gf).not.toBeNull();
    expect(gf.type).toBe('pdf');
    expect(gf.url).toBe('/forms/he/adults/cbt-thought-record.pdf');
    expect(gf.title).toBe('טבלת מחשבות CBT');
  });

  it('returns null for null input', () => {
    expect(normalizeFormToGeneratedFile(null)).toBeNull();
  });

  it('returns null for undefined input', () => {
    expect(normalizeFormToGeneratedFile(undefined)).toBeNull();
  });

  it('generated_file url starts with /forms/ for all approved forms', () => {
    const all = getAllApprovedForms('en');
    for (const form of all) {
      const gf = normalizeFormToGeneratedFile(form);
      expect(gf).not.toBeNull();
      expect(gf.url.startsWith('/forms/')).toBe(true);
    }
  });

  it('generated_file includes therapeutic_purpose when present', () => {
    const form = resolveForm('cbt-thought-record', 'en');
    const gf = normalizeFormToGeneratedFile(form);
    expect(gf.therapeutic_purpose).toBe('cbt_thought_record');
  });
});

// ─── 8. No fake/missing file links ───────────────────────────────────────────

describe('TherapeuticForms resolver — no fake file links', () => {
  it('resolver never returns a form with null file_url', () => {
    const all = getAllApprovedForms('en');
    expect(all.length).toBeGreaterThan(0);
    for (const form of all) {
      expect(form.file_url).toBeTruthy();
      expect(form.file_url).not.toBeNull();
    }
  });

  it('resolver never returns a form with empty string file_url', () => {
    const all = getAllApprovedForms('en');
    for (const form of all) {
      expect(form.file_url.trim()).not.toBe('');
    }
  });

  it('resolver never returns a form with undefined file_url', () => {
    const allEn = getAllApprovedForms('en');
    const allHe = getAllApprovedForms('he');
    for (const form of [...allEn, ...allHe]) {
      expect(form.file_url).toBeDefined();
    }
  });
});

// ─── 9. PDF files exist on disk ───────────────────────────────────────────────

describe('TherapeuticForms — PDF files exist in public/forms', () => {
  const allEn = getAllApprovedForms('en');
  const allHe = getAllApprovedForms('he').filter((f) => f.lang === 'he');
  const allForms = [...allEn, ...allHe];

  it('public/forms directory exists', () => {
    expect(fs.existsSync(PUBLIC_FORMS_ROOT)).toBe(true);
  });

  it('every approved form file_url resolves to an existing file under public/', () => {
    for (const form of allForms) {
      // file_url is like /forms/en/adults/cbt-thought-record.pdf
      // which maps to public/forms/en/adults/cbt-thought-record.pdf
      const relativePath = form.file_url.replace(/^\//, '');
      const absolutePath = path.resolve(__dirname, '../../public', relativePath);
      expect(
        fs.existsSync(absolutePath),
        `PDF file missing: public/${relativePath}`
      ).toBe(true);
    }
  });

  it('every existing PDF file is non-empty (> 1 KB)', () => {
    for (const form of allForms) {
      const relativePath = form.file_url.replace(/^\//, '');
      const absolutePath = path.resolve(__dirname, '../../public', relativePath);
      if (fs.existsSync(absolutePath)) {
        const stat = fs.statSync(absolutePath);
        expect(
          stat.size,
          `PDF file is suspiciously small: public/${relativePath}`
        ).toBeGreaterThan(1024);
      }
    }
  });

  it('expected Hebrew PDF files exist', () => {
    const hebrewFiles = [
      'he/adults/cbt-thought-record.pdf',
      'he/adults/behavioral-activation-plan.pdf',
      'he/adolescents/anxiety-thought-record.pdf',
      'he/children/simple-feelings-check-in.pdf',
      'he/older_adults/mood-reflection-sheet.pdf',
    ];
    for (const relPath of hebrewFiles) {
      const absolutePath = path.join(PUBLIC_FORMS_ROOT, relPath);
      expect(fs.existsSync(absolutePath), `Expected Hebrew PDF: ${relPath}`).toBe(true);
    }
  });
});

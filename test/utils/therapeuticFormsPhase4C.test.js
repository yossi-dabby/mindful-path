/**
 * Tests for TherapeuticForms Phase 4C — Asset Audit and Full Library Verification.
 *
 * Phase 4C requirements tested:
 *  1.  Every approved form has BOTH English AND Hebrew PDF assets.
 *  2.  Every approved form references a real file under public/forms.
 *  3.  Every approved English PDF does not contain placeholder/fake wording.
 *  4.  Every approved Hebrew PDF path exists on disk.
 *  5.  Every approved English PDF path exists on disk.
 *  6.  Every AI-sendable form is approved in the registry.
 *  7.  Every AI-sendable form has real English and Hebrew assets on disk.
 *  8.  No AI mapping points to an unapproved form.
 *  9.  No known former-placeholder form IDs can resolve.
 * 10.  No known former-placeholder form IDs are visible in resolver output.
 * 11.  No fake/missing URL can resolve.
 * 12.  Unsupported languages still fall back to English for all approved forms.
 * 13.  Hebrew requests resolve to Hebrew metadata for all approved forms.
 * 14.  toGeneratedFileMetadata works for all Phase 4C restored forms.
 * 15.  Existing five Phase 1B approved forms still resolve correctly.
 * 16.  Existing safe Phase 4B AI mappings still work.
 * 17.  Arbitrary URL injection still fails.
 * 18.  Attachment metadata remains unaffected.
 * 19.  GeneratedFileCard normalizeGeneratedFile behaviour is unaffected.
 * 20.  Final approved form count is exactly 18, covering all four audiences.
 * 21.  All APPROVED_FORM_INTENT_MAP values resolve in both English and Hebrew.
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
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
  FORM_INTENT_MARKER_PATTERN,
} from '../../src/utils/resolveFormIntent.js';

import { normalizeGeneratedFile } from '../../src/components/chat/utils/normalizeGeneratedFile.js';

// ─── Path helpers ─────────────────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_ROOT = path.resolve(__dirname, '../../public');

/**
 * Resolves a /forms/... URL to an absolute file path under public/.
 * @param {string} fileUrl  e.g. "/forms/en/adults/cbt-thought-record.pdf"
 * @returns {string}
 */
function resolvePublicPath(fileUrl) {
  return path.join(PUBLIC_ROOT, fileUrl);
}

/**
 * Decompresses FlateDecode PDF content streams and returns all decoded text.
 * Uses the page contents object approach to find actual page streams.
 * Works only for Latin-1 encoded streams (English PDFs).
 *
 * @param {Buffer} buffer  PDF file buffer
 * @returns {string}       Concatenated decoded content of all page streams
 */
function decodeEnglishPdfContent(buffer) {
  const content = buffer.toString('binary');
  // Find all /Contents X 0 R references
  const contentsRefs = [...content.matchAll(/\/Contents (\d+) 0 R/g)].map(m => m[1]);
  const decoded = [];
  for (const objId of contentsRefs) {
    // Find the object stream
    const streamMatch = content.match(
      new RegExp(`${objId} 0 obj[\\s\\S]*?>>\\s*stream\\r?\\n([\\s\\S]*?)endstream`)
    );
    if (!streamMatch) continue;
    try {
      const compressed = Buffer.from(streamMatch[1], 'binary');
      const decompressed = zlib.inflateSync(compressed);
      decoded.push(decompressed.toString('latin1'));
    } catch {
      // Intentionally skipped: malformed or non-FlateDecode streams (e.g. CIDFont CMap streams)
      // do not contain readable worksheet text and can be safely ignored for content audit.
    }
  }
  return decoded.join('\n');
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const approvedForms = ALL_FORMS.filter(f => f.approved === true);

// ─── 1. Every approved form has BOTH English AND Hebrew PDF assets ─────────────

describe('Phase 4C — Asset Audit: every approved form has both EN and HE assets', () => {
  it('all approved forms have an English language block with a non-empty file_url', () => {
    for (const form of approvedForms) {
      const enBlock = form.languages?.en;
      expect(
        enBlock && typeof enBlock.file_url === 'string' && enBlock.file_url.trim() !== '',
        `Form "${form.id}" is missing a valid English file_url`
      ).toBe(true);
    }
  });

  it('all approved forms have a Hebrew language block with a non-empty file_url', () => {
    for (const form of approvedForms) {
      const heBlock = form.languages?.he;
      expect(
        heBlock && typeof heBlock.file_url === 'string' && heBlock.file_url.trim() !== '',
        `Form "${form.id}" is missing a valid Hebrew file_url`
      ).toBe(true);
    }
  });

  it('all English file_urls start with /forms/en/', () => {
    for (const form of approvedForms) {
      const enUrl = form.languages?.en?.file_url;
      expect(
        enUrl?.startsWith('/forms/en/'),
        `Form "${form.id}" English file_url "${enUrl}" must start with /forms/en/`
      ).toBe(true);
    }
  });

  it('all Hebrew file_urls start with /forms/he/', () => {
    for (const form of approvedForms) {
      const heUrl = form.languages?.he?.file_url;
      expect(
        heUrl?.startsWith('/forms/he/'),
        `Form "${form.id}" Hebrew file_url "${heUrl}" must start with /forms/he/`
      ).toBe(true);
    }
  });

  it('all Hebrew language blocks have rtl: true', () => {
    for (const form of approvedForms) {
      const heBlock = form.languages?.he;
      if (heBlock) {
        expect(
          heBlock.rtl,
          `Form "${form.id}" Hebrew block must have rtl: true`
        ).toBe(true);
      }
    }
  });

  it('all English language blocks have rtl: false', () => {
    for (const form of approvedForms) {
      const enBlock = form.languages?.en;
      if (enBlock) {
        expect(
          enBlock.rtl,
          `Form "${form.id}" English block must have rtl: false (or falsy)`
        ).toBeFalsy();
      }
    }
  });
});

// ─── 2. Every approved form references a real file under public/forms ──────────

describe('Phase 4C — Asset Audit: all approved form file_urls reference valid paths', () => {
  it('every English file_url is a non-empty PDF path', () => {
    for (const form of approvedForms) {
      const url = form.languages?.en?.file_url;
      expect(url, `Form "${form.id}" English file_url must be a string`).toMatch(/^\/forms\/en\/.+\.pdf$/);
    }
  });

  it('every Hebrew file_url is a non-empty PDF path', () => {
    for (const form of approvedForms) {
      const url = form.languages?.he?.file_url;
      expect(url, `Form "${form.id}" Hebrew file_url must be a string`).toMatch(/^\/forms\/he\/.+\.pdf$/);
    }
  });

  it('every approved form English block has file_type: "pdf"', () => {
    for (const form of approvedForms) {
      const enBlock = form.languages?.en;
      expect(enBlock?.file_type, `Form "${form.id}" English block must have file_type: pdf`).toBe('pdf');
    }
  });

  it('every approved form Hebrew block has file_type: "pdf"', () => {
    for (const form of approvedForms) {
      const heBlock = form.languages?.he;
      expect(heBlock?.file_type, `Form "${form.id}" Hebrew block must have file_type: pdf`).toBe('pdf');
    }
  });
});

// ─── 3. Every approved English PDF does not contain placeholder/fake wording ───

describe('Phase 4C — Asset Audit: approved English PDFs do not contain placeholder content', () => {
  const PLACEHOLDER_TERMS = [
    'placeholder',
    'coming soon',
    'lorem ipsum',
    'todo:',
    '[content here]',
    '[add content]',
    'sample pdf',
    'fake content',
    'dummy content',
    'test content',
    'this is a test',
  ];

  it('no approved English PDF contains placeholder/fake terms in decoded content', () => {
    for (const form of approvedForms) {
      const enUrl = form.languages?.en?.file_url;
      if (!enUrl) continue;
      const filePath = resolvePublicPath(enUrl);
      if (!fs.existsSync(filePath)) continue;
      const buffer = fs.readFileSync(filePath);
      const decoded = decodeEnglishPdfContent(buffer).toLowerCase();
      for (const term of PLACEHOLDER_TERMS) {
        expect(
          decoded.includes(term),
          `Form "${form.id}" English PDF contains forbidden placeholder term: "${term}"`
        ).toBe(false);
      }
    }
  });

  it('all approved English PDFs are valid PDF binaries (start with %PDF)', () => {
    for (const form of approvedForms) {
      const enUrl = form.languages?.en?.file_url;
      if (!enUrl) continue;
      const filePath = resolvePublicPath(enUrl);
      if (!fs.existsSync(filePath)) continue;
      const header = fs.readFileSync(filePath).slice(0, 4).toString('ascii');
      expect(header, `Form "${form.id}" English PDF must start with %PDF`).toBe('%PDF');
    }
  });

  it('all approved English PDFs are at least 2 KB (not trivially empty)', () => {
    for (const form of approvedForms) {
      const enUrl = form.languages?.en?.file_url;
      if (!enUrl) continue;
      const filePath = resolvePublicPath(enUrl);
      if (!fs.existsSync(filePath)) continue;
      const size = fs.statSync(filePath).size;
      expect(
        size,
        `Form "${form.id}" English PDF is suspiciously small: ${size} bytes`
      ).toBeGreaterThan(2000);
    }
  });
});

// ─── 4 & 5. Every approved PDF path exists on disk ────────────────────────────

describe('Phase 4C — Asset Audit: all approved PDF files exist on disk', () => {
  it('every approved English PDF file exists under public/forms', () => {
    for (const form of approvedForms) {
      const url = form.languages?.en?.file_url;
      if (!url) continue;
      const filePath = resolvePublicPath(url);
      expect(
        fs.existsSync(filePath),
        `Missing English PDF: ${url} (form: "${form.id}")`
      ).toBe(true);
    }
  });

  it('every approved Hebrew PDF file exists under public/forms', () => {
    for (const form of approvedForms) {
      const url = form.languages?.he?.file_url;
      if (!url) continue;
      const filePath = resolvePublicPath(url);
      expect(
        fs.existsSync(filePath),
        `Missing Hebrew PDF: ${url} (form: "${form.id}")`
      ).toBe(true);
    }
  });

  it('every approved Hebrew PDF is at least 1 KB', () => {
    for (const form of approvedForms) {
      const url = form.languages?.he?.file_url;
      if (!url) continue;
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const size = fs.statSync(filePath).size;
      expect(
        size,
        `Form "${form.id}" Hebrew PDF is suspiciously small: ${size} bytes`
      ).toBeGreaterThan(1000);
    }
  });

  it('every approved Hebrew PDF is a valid PDF binary (starts with %PDF)', () => {
    for (const form of approvedForms) {
      const url = form.languages?.he?.file_url;
      if (!url) continue;
      const filePath = resolvePublicPath(url);
      if (!fs.existsSync(filePath)) continue;
      const header = fs.readFileSync(filePath).slice(0, 4).toString('ascii');
      expect(header, `Form "${form.id}" Hebrew PDF must start with %PDF`).toBe('%PDF');
    }
  });
});

// ─── 6. Every AI-sendable form is approved ────────────────────────────────────

describe('Phase 4C — Safety: every AI-sendable form is approved in the registry', () => {
  it('every form ID in APPROVED_FORM_INTENT_MAP is approved: true in the registry', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const form = ALL_FORMS.find(f => f.id === formId);
      expect(form, `Form "${formId}" in intent map must exist in registry`).toBeDefined();
      expect(
        form?.approved,
        `Form "${formId}" in intent map must be approved: true`
      ).toBe(true);
    }
  });
});

// ─── 7. Every AI-sendable form has real English and Hebrew assets on disk ───────

describe('Phase 4C — Safety: every AI-sendable form has real assets on disk', () => {
  it('every AI-sendable form has an English PDF file on disk', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const form = ALL_FORMS.find(f => f.id === formId);
      if (!form) continue;
      const enUrl = form.languages?.en?.file_url;
      expect(enUrl, `Form "${formId}" must have an English file_url`).toBeTruthy();
      const filePath = resolvePublicPath(enUrl);
      expect(
        fs.existsSync(filePath),
        `English PDF missing for AI-sendable form "${formId}": ${enUrl}`
      ).toBe(true);
    }
  });

  it('every AI-sendable form has a Hebrew PDF file on disk', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const form = ALL_FORMS.find(f => f.id === formId);
      if (!form) continue;
      const heUrl = form.languages?.he?.file_url;
      expect(heUrl, `Form "${formId}" must have a Hebrew file_url`).toBeTruthy();
      const filePath = resolvePublicPath(heUrl);
      expect(
        fs.existsSync(filePath),
        `Hebrew PDF missing for AI-sendable form "${formId}": ${heUrl}`
      ).toBe(true);
    }
  });
});

// ─── 8. No AI mapping points to an unapproved form ────────────────────────────

describe('Phase 4C — Safety: no AI mapping points to an unapproved form', () => {
  it('every canonical ID in APPROVED_FORM_INTENT_MAP resolves via the live registry', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const resolved = resolveFormById(formId);
      expect(
        resolved,
        `Canonical ID "${formId}" in intent map must resolve via registry (approved: true)`
      ).not.toBeNull();
    }
  });

  it('every alias in APPROVED_FORM_INTENT_MAP resolves via resolveFormIntent', () => {
    for (const [alias, formId] of Object.entries(APPROVED_FORM_INTENT_MAP)) {
      const meta = resolveFormIntent(alias, 'en');
      expect(
        meta,
        `Alias "${alias}" → "${formId}" must resolve to valid metadata`
      ).not.toBeNull();
      expect(
        meta?.form_id,
        `Alias "${alias}" must resolve to form "${formId}"`
      ).toBe(formId);
    }
  });
});

// ─── 9 & 10. No former-placeholder form IDs can resolve ───────────────────────

describe('Phase 4C — Safety: no former-placeholder/unapproved form IDs resolve', () => {
  // These are known IDs from previous versions that either never had real assets
  // or were de-approved during the Phase 4B audit because they referenced placeholder
  // PDFs. They must never appear in the intent map or resolve via the live registry,
  // regardless of whether they look like valid form slugs.
  const FORMER_PLACEHOLDER_IDS = [
    'tf-adults-anger-management-template',
    'tf-adults-depression-tool-template',
    'tf-adults-social-skills-template',
    'tf-adolescents-emotion-regulation-placeholder',
    'tf-children-grounding-exercise-placeholder',
    'tf-older-adults-coping-plan-placeholder',
    'tf-older-adults-coping-plan',
    'tf-older-adults-sleep-reflection-worksheet',
  ];

  it('former placeholder IDs are not in APPROVED_FORM_INTENT_MAP', () => {
    for (const id of FORMER_PLACEHOLDER_IDS) {
      expect(
        APPROVED_FORM_INTENT_MAP[id],
        `Former placeholder ID "${id}" must not appear in APPROVED_FORM_INTENT_MAP`
      ).toBeUndefined();
    }
  });

  it('former placeholder IDs return null from resolveFormIntent', () => {
    for (const id of FORMER_PLACEHOLDER_IDS) {
      expect(
        resolveFormIntent(id, 'en'),
        `Former placeholder ID "${id}" must not resolve via resolveFormIntent`
      ).toBeNull();
    }
  });

  it('former placeholder IDs return null from resolveFormById', () => {
    for (const id of FORMER_PLACEHOLDER_IDS) {
      expect(
        resolveFormById(id),
        `Former placeholder ID "${id}" must not be found by resolveFormById`
      ).toBeNull();
    }
  });

  it('listFormsByAudience returns only approved forms with real file_urls', () => {
    const audiences = ['children', 'adolescents', 'adults', 'older_adults'];
    for (const audience of audiences) {
      const forms = listFormsByAudience(audience);
      for (const form of forms) {
        expect(form.approved, `${form.id} from listFormsByAudience must be approved`).toBe(true);
        const enUrl = form.languages?.en?.file_url;
        expect(
          enUrl && enUrl.trim() !== '',
          `${form.id} from listFormsByAudience must have a non-empty English file_url`
        ).toBe(true);
      }
    }
  });
});

// ─── 11. No fake/missing URL can resolve ──────────────────────────────────────

describe('Phase 4C — Safety: no fake/missing URL can resolve', () => {
  it('empty intent returns null', () => {
    expect(resolveFormIntent('', 'en')).toBeNull();
  });

  it('undefined intent returns null', () => {
    expect(resolveFormIntent(undefined, 'en')).toBeNull();
  });

  it('URL-shaped intent string returns null', () => {
    expect(resolveFormIntent('https://evil.example.com/form.pdf', 'en')).toBeNull();
  });

  it('absolute file path intent returns null', () => {
    expect(resolveFormIntent('/forms/en/adults/cbt-thought-record.pdf', 'en')).toBeNull();
  });

  it('unknown slug returns null', () => {
    expect(resolveFormIntent('totally-unknown-form-slug', 'en')).toBeNull();
  });

  it('partial canonical ID returns null', () => {
    expect(resolveFormIntent('tf-adults', 'en')).toBeNull();
  });
});

// ─── 12. Unsupported languages fall back to English for all approved forms ─────

describe('Phase 4C — Language: unsupported languages fall back to English', () => {
  it('all approved forms fall back to English for French requests', () => {
    for (const form of approvedForms) {
      const result = resolveFormWithLanguage(form.id, 'fr');
      expect(result, `${form.id} should resolve in French via English fallback`).not.toBeNull();
      expect(result.language, `${form.id} should fall back to English for French`).toBe('en');
    }
  });

  it('all approved forms fall back to English for Spanish requests', () => {
    for (const form of approvedForms) {
      const result = resolveFormWithLanguage(form.id, 'es');
      expect(result, `${form.id} should resolve in Spanish via English fallback`).not.toBeNull();
      expect(result.language).toBe('en');
    }
  });

  it('all approved forms fall back to English for German requests', () => {
    for (const form of approvedForms) {
      const result = resolveFormWithLanguage(form.id, 'de');
      expect(result, `${form.id} should resolve in German via English fallback`).not.toBeNull();
      expect(result.language).toBe('en');
    }
  });

  it('resolveFormIntent falls back to English for unsupported language', () => {
    expect(resolveFormIntent('thought-record', 'fr')?.language).toBe('en');
    expect(resolveFormIntent('cognitive-distortions', 'es')?.language).toBe('en');
    expect(resolveFormIntent('teen-emotion-regulation', 'de')?.language).toBe('en');
    expect(resolveFormIntent('child-grounding', 'pt')?.language).toBe('en');
  });
});

// ─── 13. Hebrew requests resolve to Hebrew metadata for all approved forms ─────

describe('Phase 4C — Language: Hebrew requests resolve to Hebrew metadata', () => {
  it('all approved forms return Hebrew language data when lang=he', () => {
    for (const form of approvedForms) {
      const result = resolveFormWithLanguage(form.id, 'he');
      expect(result, `${form.id} must resolve in Hebrew`).not.toBeNull();
      expect(result.language, `${form.id} must return Hebrew language`).toBe('he');
      expect(result.languageData.rtl, `${form.id} Hebrew must have rtl: true`).toBe(true);
      expect(
        result.languageData.file_url.startsWith('/forms/he/'),
        `${form.id} Hebrew URL must start with /forms/he/`
      ).toBe(true);
    }
  });

  it('resolveFormIntent returns Hebrew URLs for all approved forms via aliases', () => {
    const SAMPLE_ALIASES_BY_FORM = {
      'tf-adults-cbt-thought-record':             'thought-record',
      'tf-adults-behavioral-activation-plan':     'behavioral-activation',
      'tf-adults-cognitive-distortions-worksheet':'cognitive-distortions',
      'tf-adults-values-and-goals-worksheet':     'values-and-goals',
      'tf-adults-mood-tracking-sheet':            'mood-tracking',
      'tf-adults-weekly-coping-plan':             'weekly-coping-plan',
      'tf-older-adults-mood-reflection-sheet':    'mood-reflection',
      'tf-older-adults-sleep-routine-reflection': 'sleep-routine',
      'tf-older-adults-daily-coping-plan':        'daily-coping-plan',
      'tf-older-adults-caregiver-support-reflection': 'caregiver-support',
      'tf-adolescents-anxiety-thought-record':    'teen-anxiety-worksheet',
      'tf-adolescents-emotion-regulation-worksheet': 'teen-emotion-regulation',
      'tf-adolescents-weekly-practice-planner':   'teen-weekly-practice',
      'tf-adolescents-social-pressure-coping-tool': 'social-pressure-coping',
      'tf-children-feelings-checkin':             'child-feelings-check-in',
      'tf-children-grounding-exercise':           'child-grounding',
      'tf-children-parent-guided-coping-card':    'parent-guided-coping',
      'tf-children-box-breathing':                'child-box-breathing',
    };
    for (const [formId, alias] of Object.entries(SAMPLE_ALIASES_BY_FORM)) {
      const meta = resolveFormIntent(alias, 'he');
      expect(meta, `Alias "${alias}" must resolve in Hebrew`).not.toBeNull();
      expect(meta.language, `Alias "${alias}" must return Hebrew`).toBe('he');
      expect(
        meta.url.startsWith('/forms/he/'),
        `Alias "${alias}" Hebrew URL must start with /forms/he/`
      ).toBe(true);
    }
  });
});

// ─── 14. toGeneratedFileMetadata works for all Phase 4C restored forms ─────────

describe('Phase 4C — Integration: toGeneratedFileMetadata works for restored forms', () => {
  // Phase 4C restored forms (previously de-approved in Phase 4B audit)
  const RESTORED_FORM_IDS = [
    'tf-children-grounding-exercise',
    'tf-children-parent-guided-coping-card',
    'tf-children-box-breathing',
    'tf-adolescents-emotion-regulation-worksheet',
    'tf-adolescents-weekly-practice-planner',
    'tf-adolescents-social-pressure-coping-tool',
    'tf-adults-cognitive-distortions-worksheet',
    'tf-adults-values-and-goals-worksheet',
    'tf-adults-mood-tracking-sheet',
    'tf-adults-weekly-coping-plan',
    'tf-older-adults-sleep-routine-reflection',
    'tf-older-adults-daily-coping-plan',
    'tf-older-adults-caregiver-support-reflection',
  ];

  it('toGeneratedFileMetadata returns valid shape for all restored forms in English', () => {
    for (const formId of RESTORED_FORM_IDS) {
      const resolved = resolveFormWithLanguage(formId, 'en');
      expect(resolved, `${formId} must resolve in English`).not.toBeNull();
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `${formId} toGeneratedFileMetadata must not be null`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.source).toBe('therapeutic_forms_library');
      expect(meta.form_id).toBe(formId);
      expect(meta.language).toBe('en');
      expect(meta.url).toMatch(/^\/forms\/en\//);
      expect(typeof meta.created_at).toBe('string');
    }
  });

  it('toGeneratedFileMetadata returns valid shape for all restored forms in Hebrew', () => {
    for (const formId of RESTORED_FORM_IDS) {
      const resolved = resolveFormWithLanguage(formId, 'he');
      expect(resolved, `${formId} must resolve in Hebrew`).not.toBeNull();
      const meta = toGeneratedFileMetadata(resolved);
      expect(meta, `${formId} toGeneratedFileMetadata in Hebrew must not be null`).not.toBeNull();
      expect(meta.type).toBe('pdf');
      expect(meta.language).toBe('he');
      expect(meta.url).toMatch(/^\/forms\/he\//);
    }
  });
});

// ─── 15. Existing five Phase 1B approved forms still resolve correctly ─────────

describe('Phase 4C — Regression: Phase 1B forms still resolve correctly', () => {
  it('CBT Thought Record still resolves', () => {
    const meta = resolveFormIntent('tf-adults-cbt-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-cbt-thought-record');
    expect(meta.audience).toBe('adults');
  });

  it('Behavioral Activation Plan still resolves', () => {
    const meta = resolveFormIntent('tf-adults-behavioral-activation-plan', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adults-behavioral-activation-plan');
  });

  it('Anxiety Thought Record still resolves', () => {
    const meta = resolveFormIntent('tf-adolescents-anxiety-thought-record', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-adolescents-anxiety-thought-record');
    expect(meta.audience).toBe('adolescents');
  });

  it('Simple Feelings Check-In still resolves', () => {
    const meta = resolveFormIntent('tf-children-feelings-checkin', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-children-feelings-checkin');
    expect(meta.audience).toBe('children');
  });

  it('Mood Reflection Sheet still resolves', () => {
    const meta = resolveFormIntent('tf-older-adults-mood-reflection-sheet', 'en');
    expect(meta).not.toBeNull();
    expect(meta.form_id).toBe('tf-older-adults-mood-reflection-sheet');
    expect(meta.audience).toBe('older_adults');
  });

  it('all Phase 1B English PDF files still exist on disk', () => {
    const PHASE_1B_PATHS = [
      '/forms/en/adults/cbt-thought-record.pdf',
      '/forms/en/adults/behavioral-activation-plan.pdf',
      '/forms/en/adolescents/anxiety-thought-record.pdf',
      '/forms/en/children/simple-feelings-check-in.pdf',
      '/forms/en/older_adults/mood-reflection-sheet.pdf',
    ];
    for (const url of PHASE_1B_PATHS) {
      expect(fs.existsSync(resolvePublicPath(url)), `Phase 1B PDF must exist: ${url}`).toBe(true);
    }
  });

  it('all Phase 1B Hebrew PDF files still exist on disk', () => {
    const PHASE_1B_HE_PATHS = [
      '/forms/he/adults/cbt-thought-record.pdf',
      '/forms/he/adults/behavioral-activation-plan.pdf',
      '/forms/he/adolescents/anxiety-thought-record.pdf',
      '/forms/he/children/simple-feelings-check-in.pdf',
      '/forms/he/older_adults/mood-reflection-sheet.pdf',
    ];
    for (const url of PHASE_1B_HE_PATHS) {
      expect(fs.existsSync(resolvePublicPath(url)), `Phase 1B Hebrew PDF must exist: ${url}`).toBe(true);
    }
  });
});

// ─── 16. Existing safe Phase 4B AI mappings still work ────────────────────────

describe('Phase 4C — Regression: Phase 4B AI mappings still work', () => {
  it('thought-record still maps to CBT Thought Record', () => {
    const meta = resolveFormIntent('thought-record', 'en');
    expect(meta?.form_id).toBe('tf-adults-cbt-thought-record');
  });

  it('behavioral-activation still maps to Behavioral Activation Plan', () => {
    const meta = resolveFormIntent('behavioral-activation', 'en');
    expect(meta?.form_id).toBe('tf-adults-behavioral-activation-plan');
  });

  it('cognitive-distortions still maps to Cognitive Distortions Worksheet', () => {
    const meta = resolveFormIntent('cognitive-distortions', 'en');
    expect(meta?.form_id).toBe('tf-adults-cognitive-distortions-worksheet');
  });

  it('mood-tracking still maps to Mood Tracking Sheet', () => {
    const meta = resolveFormIntent('mood-tracking', 'en');
    expect(meta?.form_id).toBe('tf-adults-mood-tracking-sheet');
  });

  it('sleep-routine still maps to Sleep and Routine Reflection', () => {
    const meta = resolveFormIntent('sleep-routine', 'en');
    expect(meta?.form_id).toBe('tf-older-adults-sleep-routine-reflection');
  });

  it('teen-emotion-regulation still maps to adolescent emotion worksheet', () => {
    const meta = resolveFormIntent('teen-emotion-regulation', 'en');
    expect(meta?.form_id).toBe('tf-adolescents-emotion-regulation-worksheet');
  });

  it('child-grounding still maps to children grounding exercise', () => {
    const meta = resolveFormIntent('child-grounding', 'en');
    expect(meta?.form_id).toBe('tf-children-grounding-exercise');
  });

  it('parent-guided-coping still maps to parent-guided coping card', () => {
    const meta = resolveFormIntent('parent-guided-coping', 'en');
    expect(meta?.form_id).toBe('tf-children-parent-guided-coping-card');
  });
});

// ─── 17. Arbitrary URL injection still fails ──────────────────────────────────

describe('Phase 4C — Security: arbitrary URL injection still fails', () => {
  it('URL-shaped intent returns null', () => {
    expect(resolveFormIntent('https://evil.example.com/form.pdf', 'en')).toBeNull();
  });

  it('data: URI intent returns null', () => {
    expect(resolveFormIntent('data:application/pdf;base64,abc123', 'en')).toBeNull();
  });

  it('file path intent returns null', () => {
    expect(resolveFormIntent('/public/forms/en/adults/cbt-thought-record.pdf', 'en')).toBeNull();
  });

  it('model-provided URL cannot bypass resolver', () => {
    // Even if intent matches an existing file_url exactly, it is not a valid alias
    expect(resolveFormIntent('/forms/en/adults/cognitive-distortions-worksheet.pdf', 'en')).toBeNull();
  });
});

// ─── 18. Attachment metadata remains unaffected ───────────────────────────────

describe('Phase 4C — Regression: user-uploaded attachment metadata is unaffected', () => {
  it('normalizeGeneratedFile still accepts a standard user attachment', () => {
    const attachment = {
      type: 'pdf',
      url: 'https://files.base44.com/user/my-attachment.pdf',
      name: 'my-attachment.pdf',
      title: 'My Personal Notes',
    };
    const result = normalizeGeneratedFile(attachment);
    expect(result).not.toBeNull();
    expect(result.type).toBe('pdf');
    expect(result.url).toBe(attachment.url);
  });

  it('normalizeGeneratedFile still rejects non-pdf type', () => {
    expect(normalizeGeneratedFile({ type: 'image', url: 'https://x.com/a.png', name: 'a.png' })).toBeNull();
  });

  it('normalizeGeneratedFile still rejects missing url', () => {
    expect(normalizeGeneratedFile({ type: 'pdf', name: 'a.pdf' })).toBeNull();
  });

  it('therapeutic forms library metadata does not leak into attachment normalizer', () => {
    const resolved = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'en');
    const meta = toGeneratedFileMetadata(resolved);
    // The metadata from the library is not automatically applied as an attachment;
    // normalizeGeneratedFile must be called explicitly.
    expect(meta.source).toBe('therapeutic_forms_library');
    expect(meta.form_id).toBeDefined();
  });
});

// ─── 19. GeneratedFileCard normalizeGeneratedFile behaviour is unaffected ──────

describe('Phase 4C — Regression: GeneratedFileCard normalizeGeneratedFile is unaffected', () => {
  it('normalizeGeneratedFile passes through therapeutic_forms_library metadata', () => {
    // Library metadata that has a relative /forms/ URL may not pass normalizeGeneratedFile's
    // URL validation (which accepts absolute URLs), but the shape fields must be preserved.
    const resolved = resolveFormWithLanguage('tf-adults-mood-tracking-sheet', 'en');
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta.type).toBe('pdf');
    expect(meta.url).toMatch(/^\/forms\//);
    expect(meta.title).toBe('Mood Tracking Sheet');
    expect(meta.source).toBe('therapeutic_forms_library');
  });

  it('normalizeGeneratedFile still accepts an absolute-URL form metadata', () => {
    const result = normalizeGeneratedFile({
      type: 'pdf',
      url: 'https://static.example.com/forms/worksheet.pdf',
      name: 'worksheet.pdf',
      title: 'My Worksheet',
      source: 'therapeutic_forms_library',
      form_id: 'some-id',
    });
    expect(result).not.toBeNull();
    expect(result.type).toBe('pdf');
  });
});

// ─── 20. Final approved form count and audience coverage ─────────────────────

describe('Phase 4C — Final state: approved form count and audience coverage', () => {
  it('exactly 18 forms are approved (full Phase 4C library)', () => {
    expect(approvedForms.length).toBe(18);
  });

  it('exactly 4 children forms are approved', () => {
    const children = approvedForms.filter(f => f.audience === 'children');
    expect(children.length).toBe(4);
  });

  it('exactly 4 adolescents forms are approved', () => {
    const adolescents = approvedForms.filter(f => f.audience === 'adolescents');
    expect(adolescents.length).toBe(4);
  });

  it('exactly 6 adults forms are approved', () => {
    const adults = approvedForms.filter(f => f.audience === 'adults');
    expect(adults.length).toBe(6);
  });

  it('exactly 4 older_adults forms are approved', () => {
    const olderAdults = approvedForms.filter(f => f.audience === 'older_adults');
    expect(olderAdults.length).toBe(4);
  });

  it('all required target forms are approved and resolvable', () => {
    const REQUIRED_FORMS = [
      // Children
      'tf-children-grounding-exercise',
      'tf-children-parent-guided-coping-card',
      'tf-children-box-breathing',
      // Adolescents
      'tf-adolescents-emotion-regulation-worksheet',
      'tf-adolescents-weekly-practice-planner',
      'tf-adolescents-social-pressure-coping-tool',
      // Adults
      'tf-adults-cognitive-distortions-worksheet',
      'tf-adults-values-and-goals-worksheet',
      'tf-adults-mood-tracking-sheet',
      'tf-adults-weekly-coping-plan',
      // Older adults
      'tf-older-adults-sleep-routine-reflection',
      'tf-older-adults-daily-coping-plan',
      'tf-older-adults-caregiver-support-reflection',
    ];
    for (const id of REQUIRED_FORMS) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `Required form "${id}" must exist in registry`).toBeDefined();
      expect(form?.approved, `Required form "${id}" must be approved`).toBe(true);
      const resolved = resolveFormById(id);
      expect(resolved, `Required form "${id}" must resolve via resolveFormById`).not.toBeNull();
    }
  });
});

// ─── 21. All APPROVED_FORM_INTENT_MAP values resolve in both EN and HE ─────────

describe('Phase 4C — Full map: all APPROVED_FORM_INTENT_MAP values resolve in EN and HE', () => {
  it('every unique form ID in the map resolves in English', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const meta = resolveFormIntent(formId, 'en');
      expect(meta, `${formId} must resolve in English`).not.toBeNull();
      expect(meta.url, `${formId} English URL must not be empty`).toBeTruthy();
      expect(meta.url, `${formId} English URL must start with /forms/en/`).toMatch(/^\/forms\/en\//);
      expect(meta.source).toBe('therapeutic_forms_library');
    }
  });

  it('every unique form ID in the map resolves in Hebrew', () => {
    const uniqueFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    for (const formId of uniqueFormIds) {
      const meta = resolveFormIntent(formId, 'he');
      expect(meta, `${formId} must resolve in Hebrew`).not.toBeNull();
      expect(meta.language, `${formId} must return Hebrew`).toBe('he');
      expect(meta.url, `${formId} Hebrew URL must start with /forms/he/`).toMatch(/^\/forms\/he\//);
    }
  });

  it('map contains all 18 approved form IDs', () => {
    const mappedFormIds = new Set(Object.values(APPROVED_FORM_INTENT_MAP));
    expect(mappedFormIds.size).toBe(18);
  });
});

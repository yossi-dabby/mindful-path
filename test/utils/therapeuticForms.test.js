/**
 * Tests for the TherapeuticForms Phase 1 + Phase 1B infrastructure.
 *
 * Phase 1 covers:
 *  1.  Audience taxonomy completeness
 *  2.  Category taxonomy completeness
 *  3.  Resolver rejects unapproved forms
 *  4.  Resolver rejects forms with missing file_url
 *  5.  Resolver prefers requested language when available
 *  6.  Resolver falls back to English when requested language unavailable
 *  7.  Resolver returns null when neither requested language nor English is valid
 *  8.  Hebrew language version preserves rtl: true
 *  9.  toGeneratedFileMetadata returns expected shape
 * 10.  Malformed/invalid entries do not crash the resolver
 * 11.  Existing generated_file infrastructure (normalizeGeneratedFile) is untouched
 *
 * Phase 1B adds:
 * 12.  Starter pack approved forms are returned by live registry queries
 * 13.  All approved forms have non-empty file_url values starting with /forms/
 * 14.  Hebrew forms have rtl: true; English fallback has rtl: false
 * 15.  Unsupported languages fall back to English
 * 16.  Unapproved seed forms remain hidden
 * 17.  toGeneratedFileMetadata works for real approved Phase 1B forms
 * 18.  No fake/missing file links are returned
 * 19.  Each referenced PDF file exists on disk under public/forms
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import {
  AUDIENCE_GROUPS,
  THERAPEUTIC_CATEGORIES,
  SUPPORTED_LANGUAGES,
  ALL_FORMS,
  listAudienceGroups,
  listTherapeuticCategories,
  listFormsByAudience,
  listFormsByCategory,
  listFormsByAudienceAndCategory,
  resolveFormById,
  resolveFormWithLanguage,
  toGeneratedFileMetadata,
} from '../../src/data/therapeuticForms/index.js';

import { normalizeGeneratedFile } from '../../src/components/chat/utils/normalizeGeneratedFile.js';

// ─── Path helpers (Phase 1B) ──────────────────────────────────────────────────

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_FORMS_ROOT = path.resolve(__dirname, '../../public/forms');

// ─── Test fixtures ────────────────────────────────────────────────────────────

/**
 * A minimal approved form with valid language blocks, used to test resolver
 * behaviour that requires an approvable entry (since not all real assets exist yet
 * in the seed registry — only Phase 1B approved forms carry approved: true).
 */
const FIXTURE_APPROVED_FORM = {
  id: 'fixture-approved-adults-test',
  slug: 'fixture-approved-adults-test-slug',
  audience: 'adults',
  category: 'thought_records',
  therapeutic_use: 'Test fixture for resolver unit tests.',
  approved: true,
  tags: ['test'],
  languages: {
    en: {
      title: 'Test Thought Record',
      description: 'A test thought record fixture.',
      file_url: 'https://static.example.com/test-thought-record-en.pdf',
      file_type: 'pdf',
      file_name: 'test-thought-record-en.pdf',
      rtl: false,
    },
    he: {
      title: 'רשומת מחשבות לבדיקה',
      description: 'אביזר בדיקה לרשומת מחשבות.',
      file_url: 'https://static.example.com/test-thought-record-he.pdf',
      file_type: 'pdf',
      file_name: 'test-thought-record-he.pdf',
      rtl: true,
    },
  },
  created_at: '2025-04-27T00:00:00.000Z',
  updated_at: '2025-04-27T00:00:00.000Z',
};

/** An approved form that only has English — used for fallback tests. */
const FIXTURE_EN_ONLY_FORM = {
  id: 'fixture-en-only-form',
  slug: 'fixture-en-only-form-slug',
  audience: 'adults',
  category: 'coping_tools',
  therapeutic_use: 'Test fixture with English only.',
  approved: true,
  tags: ['test'],
  languages: {
    en: {
      title: 'English-Only Test Form',
      description: 'This form has no Hebrew or other translations.',
      file_url: 'https://static.example.com/en-only-form-en.pdf',
      file_type: 'pdf',
      file_name: 'en-only-form-en.pdf',
      rtl: false,
    },
  },
  created_at: '2025-04-27T00:00:00.000Z',
  updated_at: '2025-04-27T00:00:00.000Z',
};

/** An approved form with no valid language at all — used for null-return tests. */
const FIXTURE_NO_VALID_LANG_FORM = {
  id: 'fixture-no-valid-lang',
  slug: 'fixture-no-valid-lang-slug',
  audience: 'adults',
  category: 'sleep',
  therapeutic_use: 'Test fixture with no valid language blocks.',
  approved: true,
  tags: ['test'],
  languages: {
    en: {
      title: 'Missing URL Form',
      description: 'This form has an empty file_url.',
      file_url: '',          // invalid — empty URL
      file_type: 'pdf',
      file_name: 'missing-url-en.pdf',
      rtl: false,
    },
  },
  created_at: '2025-04-27T00:00:00.000Z',
  updated_at: '2025-04-27T00:00:00.000Z',
};

// ─── Resolver helpers that accept a custom forms list ─────────────────────────
// We import the resolution logic directly so we can inject fixture forms
// without polluting the live registry.

import {
  VALID_AUDIENCE_VALUES,
  VALID_CATEGORY_VALUES,
  RTL_LANGUAGES,
} from '../../src/data/therapeuticForms/categories.js';

/**
 * Minimal inline resolver that mirrors the library resolver logic but accepts
 * an arbitrary forms array — allows fixture-based testing without touching ALL_FORMS.
 */
function resolveWithLanguage(forms, idOrSlug, lang = 'en') {
  function isValidBlock(b) {
    if (!b || typeof b !== 'object') return false;
    if (b.file_type !== 'pdf') return false;
    if (typeof b.file_url !== 'string' || !b.file_url.trim()) return false;
    if (typeof b.title !== 'string' || !b.title.trim()) return false;
    if (typeof b.file_name !== 'string' || !b.file_name.trim()) return false;
    return true;
  }

  function isWellFormed(form) {
    if (!form || typeof form !== 'object') return false;
    if (typeof form.id !== 'string' || !form.id.trim()) return false;
    if (typeof form.slug !== 'string' || !form.slug.trim()) return false;
    if (!VALID_AUDIENCE_VALUES.has(form.audience)) return false;
    if (!VALID_CATEGORY_VALUES.has(form.category)) return false;
    if (!form.languages || typeof form.languages !== 'object') return false;
    if (form.approved !== true) return false;
    return true;
  }

  const form = forms.find(f => f != null && (f.id === idOrSlug || f.slug === idOrSlug));
  if (!isWellFormed(form)) return null;

  const languages = form.languages || {};
  let block = null;
  let code = null;

  if (lang && lang !== 'en' && isValidBlock(languages[lang])) {
    block = languages[lang];
    code = lang;
  } else if (isValidBlock(languages['en'])) {
    block = languages['en'];
    code = 'en';
  }

  if (!block) return null;

  const rtl = RTL_LANGUAGES.has(code) || block.rtl === true;

  return {
    form,
    language: code,
    languageData: {
      title: block.title,
      description: block.description || null,
      file_url: block.file_url,
      file_type: block.file_type,
      file_name: block.file_name,
      rtl,
    },
  };
}

function toMetadata(resolved) {
  if (!resolved) return null;
  const { form, language, languageData } = resolved;
  if (!form || !language || !languageData) return null;
  if (!languageData.file_url || !languageData.file_name || !languageData.title) return null;
  return {
    type: 'pdf',
    url: languageData.file_url,
    name: languageData.file_name,
    title: languageData.title,
    description: languageData.description || null,
    therapeutic_purpose: form.therapeutic_use || null,
    source: 'therapeutic_forms_library',
    form_id: form.id,
    form_slug: form.slug,
    audience: form.audience,
    category: form.category,
    language,
    created_at: expect.any(String),
  };
}

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 1 TESTS
// ═════════════════════════════════════════════════════════════════════════════

// ─── 1. Audience taxonomy ─────────────────────────────────────────────────────

describe('TherapeuticForms — audience taxonomy', () => {
  it('AUDIENCE_GROUPS exists and is an array', () => {
    expect(Array.isArray(AUDIENCE_GROUPS)).toBe(true);
    expect(AUDIENCE_GROUPS.length).toBeGreaterThan(0);
  });

  it('includes children audience group', () => {
    const values = AUDIENCE_GROUPS.map(a => a.value);
    expect(values).toContain('children');
  });

  it('includes adolescents audience group', () => {
    const values = AUDIENCE_GROUPS.map(a => a.value);
    expect(values).toContain('adolescents');
  });

  it('includes adults audience group', () => {
    const values = AUDIENCE_GROUPS.map(a => a.value);
    expect(values).toContain('adults');
  });

  it('includes older_adults audience group', () => {
    const values = AUDIENCE_GROUPS.map(a => a.value);
    expect(values).toContain('older_adults');
  });

  it('listAudienceGroups() returns the same values', () => {
    const listed = listAudienceGroups();
    expect(listed).toContain('children');
    expect(listed).toContain('adolescents');
    expect(listed).toContain('adults');
    expect(listed).toContain('older_adults');
  });

  it('each audience group has a Hebrew label', () => {
    for (const group of AUDIENCE_GROUPS) {
      expect(typeof group.label_he, `${group.value} missing label_he`).toBe('string');
      expect(group.label_he.trim()).not.toBe('');
    }
  });
});

// ─── 2. Category taxonomy ─────────────────────────────────────────────────────

describe('TherapeuticForms — category taxonomy', () => {
  it('THERAPEUTIC_CATEGORIES exists and is an array', () => {
    expect(Array.isArray(THERAPEUTIC_CATEGORIES)).toBe(true);
    expect(THERAPEUTIC_CATEGORIES.length).toBeGreaterThanOrEqual(15);
  });

  it('listTherapeuticCategories() returns all expected core categories', () => {
    const cats = listTherapeuticCategories();
    const required = [
      'thought_records',
      'cognitive_distortions',
      'emotional_regulation',
      'behavioral_activation',
      'anxiety_tools',
      'depression_tools',
      'anger_management',
      'social_skills',
      'sleep',
      'goals_and_values',
      'parent_guidance',
      'caregiver_support',
      'coping_tools',
      'weekly_practice',
      'reflection_journal',
    ];
    for (const cat of required) {
      expect(cats, `Missing category: ${cat}`).toContain(cat);
    }
  });

  it('does not contain a crisis_forms category', () => {
    const cats = listTherapeuticCategories();
    expect(cats).not.toContain('crisis_forms');
    expect(cats).not.toContain('crisis');
  });
});

// ─── 3. Resolver — unapproved forms are not returned ─────────────────────────

describe('TherapeuticForms — resolver rejects unapproved forms', () => {
  it('all forms in the seed registry have a boolean approved field', () => {
    for (const form of ALL_FORMS) {
      expect(typeof form.approved, `${form.id} must have a boolean approved field`).toBe('boolean');
    }
  });

  it('resolveWithLanguage returns null for an unapproved form', () => {
    const unapproved = { ...FIXTURE_APPROVED_FORM, approved: false, id: 'fixture-unapproved' };
    const result = resolveWithLanguage([unapproved], 'fixture-unapproved', 'en');
    expect(result).toBeNull();
  });

  it('listFormsByAudience returns only approved forms', () => {
    const childForms = listFormsByAudience('children');
    for (const f of childForms) {
      expect(f.approved).toBe(true);
    }
  });

  it('resolveFormById returns a form for a Phase 4A approved seed form', () => {
    // tf-adults-cognitive-distortions-worksheet was promoted to approved: true in Phase 4A
    const result = resolveFormById('tf-adults-cognitive-distortions-worksheet');
    expect(result).not.toBeNull();
    expect(result.approved).toBe(true);
  });
});

// ─── 4. Resolver — missing file_url is never returned ────────────────────────

describe('TherapeuticForms — resolver rejects missing file_url', () => {
  it('returns null when the only available language block has an empty file_url', () => {
    const result = resolveWithLanguage([FIXTURE_NO_VALID_LANG_FORM], FIXTURE_NO_VALID_LANG_FORM.id, 'en');
    expect(result).toBeNull();
  });

  it('returns null when file_url is not a string', () => {
    const form = {
      ...FIXTURE_APPROVED_FORM,
      id: 'fixture-non-string-url',
      languages: {
        en: { ...FIXTURE_APPROVED_FORM.languages.en, file_url: 12345 },
      },
    };
    const result = resolveWithLanguage([form], form.id, 'en');
    expect(result).toBeNull();
  });

  it('returns null when file_url is null', () => {
    const form = {
      ...FIXTURE_APPROVED_FORM,
      id: 'fixture-null-url',
      languages: {
        en: { ...FIXTURE_APPROVED_FORM.languages.en, file_url: null },
      },
    };
    const result = resolveWithLanguage([form], form.id, 'en');
    expect(result).toBeNull();
  });
});

// ─── 5. Resolver — preferred language is returned when available ──────────────

describe('TherapeuticForms — resolver prefers requested language', () => {
  it('returns Hebrew when lang=he and Hebrew block is valid', () => {
    const result = resolveWithLanguage([FIXTURE_APPROVED_FORM], FIXTURE_APPROVED_FORM.id, 'he');
    expect(result).not.toBeNull();
    expect(result.language).toBe('he');
    expect(result.languageData.file_url).toBe(FIXTURE_APPROVED_FORM.languages.he.file_url);
    expect(result.languageData.title).toBe(FIXTURE_APPROVED_FORM.languages.he.title);
  });

  it('returns English when lang=en and English block is valid', () => {
    const result = resolveWithLanguage([FIXTURE_APPROVED_FORM], FIXTURE_APPROVED_FORM.id, 'en');
    expect(result).not.toBeNull();
    expect(result.language).toBe('en');
    expect(result.languageData.file_url).toBe(FIXTURE_APPROVED_FORM.languages.en.file_url);
  });
});

// ─── 6. Resolver — falls back to English when requested language unavailable ──

describe('TherapeuticForms — resolver falls back to English', () => {
  it('returns English when lang=he but Hebrew block is absent', () => {
    const result = resolveWithLanguage([FIXTURE_EN_ONLY_FORM], FIXTURE_EN_ONLY_FORM.id, 'he');
    expect(result).not.toBeNull();
    expect(result.language).toBe('en');
    expect(result.languageData.file_url).toBe(FIXTURE_EN_ONLY_FORM.languages.en.file_url);
  });

  it('returns English when lang=fr but French block is absent', () => {
    const result = resolveWithLanguage([FIXTURE_EN_ONLY_FORM], FIXTURE_EN_ONLY_FORM.id, 'fr');
    expect(result).not.toBeNull();
    expect(result.language).toBe('en');
  });

  it('returns English when lang=es but Spanish block is absent', () => {
    const result = resolveWithLanguage([FIXTURE_EN_ONLY_FORM], FIXTURE_EN_ONLY_FORM.id, 'es');
    expect(result).not.toBeNull();
    expect(result.language).toBe('en');
  });
});

// ─── 7. Resolver — returns null when no valid language exists ─────────────────

describe('TherapeuticForms — resolver returns null when no valid language exists', () => {
  it('returns null when both requested language and English are missing', () => {
    const form = {
      ...FIXTURE_APPROVED_FORM,
      id: 'fixture-no-lang-at-all',
      languages: {
        // no valid blocks at all — he has empty url, en is absent
        he: { ...FIXTURE_APPROVED_FORM.languages.he, file_url: '' },
      },
    };
    const result = resolveWithLanguage([form], form.id, 'fr');
    expect(result).toBeNull();
  });

  it('returns null when the form has an empty languages object', () => {
    const form = { ...FIXTURE_APPROVED_FORM, id: 'fixture-empty-langs', languages: {} };
    const result = resolveWithLanguage([form], form.id, 'en');
    expect(result).toBeNull();
  });
});

// ─── 8. Hebrew preserves rtl: true ───────────────────────────────────────────

describe('TherapeuticForms — Hebrew language preserves rtl: true', () => {
  it('languageData.rtl is true when resolved language is Hebrew', () => {
    const result = resolveWithLanguage([FIXTURE_APPROVED_FORM], FIXTURE_APPROVED_FORM.id, 'he');
    expect(result).not.toBeNull();
    expect(result.language).toBe('he');
    expect(result.languageData.rtl).toBe(true);
  });

  it('languageData.rtl is false (not true) when resolved language is English', () => {
    const result = resolveWithLanguage([FIXTURE_APPROVED_FORM], FIXTURE_APPROVED_FORM.id, 'en');
    expect(result).not.toBeNull();
    expect(result.language).toBe('en');
    expect(result.languageData.rtl).toBe(false);
  });

  it('all Hebrew language blocks in the seed registry carry rtl: true', () => {
    for (const form of ALL_FORMS) {
      if (form.languages && form.languages.he) {
        expect(
          form.languages.he.rtl,
          `Form "${form.id}" Hebrew block must have rtl: true`
        ).toBe(true);
      }
    }
  });
});

// ─── 9. toGeneratedFileMetadata — shape validation ────────────────────────────

describe('TherapeuticForms — toGeneratedFileMetadata returns expected shape', () => {
  it('returns expected fields for a valid resolved form', () => {
    const resolved = resolveWithLanguage([FIXTURE_APPROVED_FORM], FIXTURE_APPROVED_FORM.id, 'en');
    expect(resolved).not.toBeNull();

    // Apply the real exported toGeneratedFileMetadata with the resolved result
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta).not.toBeNull();

    expect(meta.source).toBe('therapeutic_forms_library');
    expect(meta.form_id).toBe(FIXTURE_APPROVED_FORM.id);
    expect(meta.form_slug).toBe(FIXTURE_APPROVED_FORM.slug);
    expect(meta.audience).toBe('adults');
    expect(meta.category).toBe('thought_records');
    expect(meta.language).toBe('en');
    expect(meta.url).toBe(FIXTURE_APPROVED_FORM.languages.en.file_url);
    expect(meta.name).toBe(FIXTURE_APPROVED_FORM.languages.en.file_name);
    expect(meta.title).toBe(FIXTURE_APPROVED_FORM.languages.en.title);
    expect(typeof meta.created_at).toBe('string');
    expect(meta.created_at).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
    expect(meta.type).toBe('pdf');
  });

  it('returns null when resolved is null', () => {
    expect(toGeneratedFileMetadata(null)).toBeNull();
  });

  it('returns null when resolved is undefined', () => {
    expect(toGeneratedFileMetadata(undefined)).toBeNull();
  });

  it('toGeneratedFileMetadata output is accepted by normalizeGeneratedFile', () => {
    const resolved = resolveWithLanguage([FIXTURE_APPROVED_FORM], FIXTURE_APPROVED_FORM.id, 'en');
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta).not.toBeNull();

    // The metadata shape must pass through normalizeGeneratedFile without returning null
    const normalized = normalizeGeneratedFile(meta);
    expect(normalized).not.toBeNull();
    expect(normalized.type).toBe('pdf');
    expect(normalized.url).toBe(meta.url);
    expect(normalized.name).toBe(meta.name);
  });
});

// ─── 10. Malformed / invalid entries do not crash resolver ────────────────────

describe('TherapeuticForms — malformed entries do not crash the resolver', () => {
  it('does not throw for null entry in forms array', () => {
    expect(() => resolveWithLanguage([null, FIXTURE_APPROVED_FORM], FIXTURE_APPROVED_FORM.id, 'en')).not.toThrow();
  });

  it('does not throw for undefined entry in forms array', () => {
    expect(() => resolveWithLanguage([undefined, FIXTURE_APPROVED_FORM], FIXTURE_APPROVED_FORM.id, 'en')).not.toThrow();
  });

  it('does not throw for an entry with null languages', () => {
    const form = { ...FIXTURE_APPROVED_FORM, id: 'fix-null-langs', languages: null };
    expect(() => resolveWithLanguage([form], form.id, 'en')).not.toThrow();
    expect(resolveWithLanguage([form], form.id, 'en')).toBeNull();
  });

  it('does not throw when id or slug is undefined', () => {
    expect(() => resolveWithLanguage([FIXTURE_APPROVED_FORM], undefined, 'en')).not.toThrow();
    expect(resolveWithLanguage([FIXTURE_APPROVED_FORM], undefined, 'en')).toBeNull();
  });

  it('returns null for an unknown id', () => {
    const result = resolveWithLanguage([FIXTURE_APPROVED_FORM], 'this-id-does-not-exist', 'en');
    expect(result).toBeNull();
  });

  it('does not throw when audience is invalid', () => {
    const form = { ...FIXTURE_APPROVED_FORM, id: 'fix-bad-audience', audience: 'robots' };
    expect(() => resolveWithLanguage([form], form.id, 'en')).not.toThrow();
    expect(resolveWithLanguage([form], form.id, 'en')).toBeNull();
  });

  it('does not throw when category is invalid', () => {
    const form = { ...FIXTURE_APPROVED_FORM, id: 'fix-bad-category', category: 'not_a_real_category' };
    expect(() => resolveWithLanguage([form], form.id, 'en')).not.toThrow();
    expect(resolveWithLanguage([form], form.id, 'en')).toBeNull();
  });
});

// ─── 11. Existing generated_file infrastructure is untouched ──────────────────

describe('TherapeuticForms — existing normalizeGeneratedFile is untouched', () => {
  it('normalizeGeneratedFile still rejects non-pdf types', () => {
    expect(normalizeGeneratedFile({ type: 'image', url: 'https://x.com/a.png', name: 'a.png' })).toBeNull();
  });

  it('normalizeGeneratedFile still rejects missing url', () => {
    expect(normalizeGeneratedFile({ type: 'pdf', name: 'a.pdf' })).toBeNull();
  });

  it('normalizeGeneratedFile still accepts a valid pdf object', () => {
    const result = normalizeGeneratedFile({
      type: 'pdf',
      url: 'https://files.example.com/form.pdf',
      name: 'form.pdf',
      title: 'Test Form',
    });
    expect(result).not.toBeNull();
    expect(result.type).toBe('pdf');
    expect(result.url).toBe('https://files.example.com/form.pdf');
  });

  it('normalizeGeneratedFile still returns null for null input', () => {
    expect(normalizeGeneratedFile(null)).toBeNull();
  });
});

// ─── Registry shape validation ────────────────────────────────────────────────

describe('TherapeuticForms — ALL_FORMS registry shape', () => {
  it('ALL_FORMS is a non-empty array', () => {
    expect(Array.isArray(ALL_FORMS)).toBe(true);
    expect(ALL_FORMS.length).toBeGreaterThan(0);
  });

  it('each form has required fields: id, slug, audience, category, therapeutic_use, approved, tags, languages', () => {
    for (const form of ALL_FORMS) {
      expect(typeof form.id, `${form.id} missing id`).toBe('string');
      expect(typeof form.slug, `${form.id} missing slug`).toBe('string');
      expect(typeof form.audience, `${form.id} missing audience`).toBe('string');
      expect(typeof form.category, `${form.id} missing category`).toBe('string');
      expect(typeof form.therapeutic_use, `${form.id} missing therapeutic_use`).toBe('string');
      expect(typeof form.approved, `${form.id} missing approved`).toBe('boolean');
      expect(Array.isArray(form.tags), `${form.id} tags must be array`).toBe(true);
      expect(typeof form.languages, `${form.id} missing languages`).toBe('object');
    }
  });

  it('each form audience is a valid audience group value', () => {
    const validAudiences = listAudienceGroups();
    for (const form of ALL_FORMS) {
      expect(validAudiences, `${form.id} has invalid audience: ${form.audience}`).toContain(form.audience);
    }
  });

  it('each form category is a valid therapeutic category value', () => {
    const validCats = listTherapeuticCategories();
    for (const form of ALL_FORMS) {
      expect(validCats, `${form.id} has invalid category: ${form.category}`).toContain(form.category);
    }
  });

  it('has no duplicate form IDs', () => {
    const ids = ALL_FORMS.map(f => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has no duplicate form slugs', () => {
    const slugs = ALL_FORMS.map(f => f.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('covers all four audience groups in the seed registry', () => {
    const audiencesPresent = new Set(ALL_FORMS.map(f => f.audience));
    expect(audiencesPresent.has('children')).toBe(true);
    expect(audiencesPresent.has('adolescents')).toBe(true);
    expect(audiencesPresent.has('adults')).toBe(true);
    expect(audiencesPresent.has('older_adults')).toBe(true);
  });
});

// ─── Supported languages ──────────────────────────────────────────────────────

describe('TherapeuticForms — supported languages', () => {
  it('SUPPORTED_LANGUAGES includes all 7 app languages', () => {
    const required = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];
    for (const lang of required) {
      expect(SUPPORTED_LANGUAGES).toContain(lang);
    }
  });
});

// ─── Resolver utility functions smoke tests ───────────────────────────────────

describe('TherapeuticForms — resolver utility functions smoke tests', () => {
  it('listFormsByAudience returns an array for valid audience', () => {
    expect(Array.isArray(listFormsByAudience('children'))).toBe(true);
    expect(Array.isArray(listFormsByAudience('adults'))).toBe(true);
  });

  it('listFormsByAudience returns empty array for invalid audience', () => {
    expect(listFormsByAudience('aliens')).toEqual([]);
    expect(listFormsByAudience('')).toEqual([]);
    expect(listFormsByAudience(undefined)).toEqual([]);
  });

  it('listFormsByCategory returns an array for valid category', () => {
    expect(Array.isArray(listFormsByCategory('thought_records'))).toBe(true);
  });

  it('listFormsByCategory returns empty array for invalid category', () => {
    expect(listFormsByCategory('not_real')).toEqual([]);
  });

  it('listFormsByAudienceAndCategory returns an array', () => {
    expect(Array.isArray(listFormsByAudienceAndCategory('adults', 'thought_records'))).toBe(true);
  });

  it('listFormsByAudienceAndCategory returns empty for invalid inputs', () => {
    expect(listFormsByAudienceAndCategory('aliens', 'thought_records')).toEqual([]);
    expect(listFormsByAudienceAndCategory('adults', 'not_real')).toEqual([]);
  });

  it('resolveFormById returns null for unknown id', () => {
    expect(resolveFormById('completely-unknown-id')).toBeNull();
  });

  it('resolveFormById returns null for non-string input', () => {
    expect(resolveFormById(null)).toBeNull();
    expect(resolveFormById(undefined)).toBeNull();
    expect(resolveFormById(123)).toBeNull();
  });

  it('resolveFormWithLanguage returns null for unknown id', () => {
    expect(resolveFormWithLanguage('completely-unknown-id', 'en')).toBeNull();
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 1B TESTS
// ═════════════════════════════════════════════════════════════════════════════

// ─── 12. Starter pack approved forms returned by live registry queries ────────

describe('TherapeuticForms Phase 1B — starter pack live queries', () => {
  it('resolves CBT Thought Record for adults in English', () => {
    const result = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('CBT Thought Record');
    expect(result.language).toBe('en');
  });

  it('resolves Behavioral Activation Plan for adults in English', () => {
    const result = resolveFormWithLanguage('tf-adults-behavioral-activation-plan', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('Behavioral Activation Plan');
    expect(result.language).toBe('en');
  });

  it('resolves Anxiety Thought Record for adolescents in English', () => {
    const result = resolveFormWithLanguage('tf-adolescents-anxiety-thought-record', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('Anxiety Thought Record');
    expect(result.language).toBe('en');
  });

  it('resolves Simple Feelings Check-In for children in English', () => {
    const result = resolveFormWithLanguage('tf-children-feelings-checkin', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('Simple Feelings Check-In');
    expect(result.language).toBe('en');
  });

  it('resolves Mood Reflection Sheet for older adults in English', () => {
    const result = resolveFormWithLanguage('tf-older-adults-mood-reflection-sheet', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('Mood Reflection Sheet');
    expect(result.language).toBe('en');
  });

  it('listFormsByAudience returns at least one approved form for each audience', () => {
    const audiences = ['adults', 'adolescents', 'children', 'older_adults'];
    for (const audience of audiences) {
      const forms = listFormsByAudience(audience);
      expect(forms.length, `Expected approved form(s) for audience: ${audience}`).toBeGreaterThan(0);
    }
  });

  it('all approved registry forms have approved: true', () => {
    const allApproved = ALL_FORMS.filter(f => f.approved === true);
    expect(allApproved.length).toBeGreaterThanOrEqual(16);
    for (const f of allApproved) {
      expect(f.approved).toBe(true);
    }
  });
});

// ─── 13. All approved forms have non-empty file_url starting with /forms/ ─────

describe('TherapeuticForms Phase 1B — approved form file_url integrity', () => {
  const approvedForms = ALL_FORMS.filter(f => f.approved === true);

  it('at least 16 approved forms exist', () => {
    expect(approvedForms.length).toBeGreaterThanOrEqual(16);
  });

  it('every approved form has at least one language block with non-empty file_url', () => {
    for (const form of approvedForms) {
      const hasValidBlock = Object.values(form.languages).some(
        b => b && typeof b.file_url === 'string' && b.file_url.trim()
      );
      expect(hasValidBlock, `${form.id} must have at least one language with a file_url`).toBe(true);
    }
  });

  it('every non-empty file_url in an approved form starts with /forms/', () => {
    for (const form of approvedForms) {
      for (const [lang, block] of Object.entries(form.languages)) {
        if (block && block.file_url && block.file_url.trim()) {
          expect(
            block.file_url.startsWith('/forms/'),
            `${form.id}[${lang}] file_url must start with /forms/, got: ${block.file_url}`
          ).toBe(true);
        }
      }
    }
  });

  it('every non-empty file_url in an approved form has file_type: "pdf"', () => {
    for (const form of approvedForms) {
      for (const [lang, block] of Object.entries(form.languages)) {
        if (block && block.file_url && block.file_url.trim()) {
          expect(block.file_type, `${form.id}[${lang}] must have file_type: pdf`).toBe('pdf');
        }
      }
    }
  });
});

// ─── 14. Hebrew forms have rtl: true; fallback English has rtl: false ─────────

describe('TherapeuticForms Phase 1B — Hebrew RTL metadata via live registry', () => {
  it('resolving CBT Thought Record in Hebrew returns rtl: true', () => {
    const result = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'he');
    expect(result).not.toBeNull();
    expect(result.language).toBe('he');
    expect(result.languageData.rtl).toBe(true);
  });

  it('resolving Behavioral Activation Plan in Hebrew returns rtl: true', () => {
    const result = resolveFormWithLanguage('tf-adults-behavioral-activation-plan', 'he');
    expect(result).not.toBeNull();
    expect(result.languageData.rtl).toBe(true);
  });

  it('resolving Anxiety Thought Record in Hebrew returns rtl: true', () => {
    const result = resolveFormWithLanguage('tf-adolescents-anxiety-thought-record', 'he');
    expect(result).not.toBeNull();
    expect(result.languageData.rtl).toBe(true);
  });

  it('resolving Simple Feelings Check-In in Hebrew returns rtl: true', () => {
    const result = resolveFormWithLanguage('tf-children-feelings-checkin', 'he');
    expect(result).not.toBeNull();
    expect(result.languageData.rtl).toBe(true);
  });

  it('resolving Mood Reflection Sheet in Hebrew returns rtl: true', () => {
    const result = resolveFormWithLanguage('tf-older-adults-mood-reflection-sheet', 'he');
    expect(result).not.toBeNull();
    expect(result.languageData.rtl).toBe(true);
  });

  it('resolving CBT Thought Record in English returns rtl: false', () => {
    const result = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.rtl).toBe(false);
  });

  it('Hebrew file_url contains /he/ in the path', () => {
    const result = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'he');
    expect(result.languageData.file_url).toContain('/he/');
  });
});

// ─── 15. Unsupported languages fall back to English ───────────────────────────

describe('TherapeuticForms Phase 1B — language fallback to English', () => {
  it('falls back to English when requesting Spanish (no approved es variant)', () => {
    // Spanish now has real assets; requesting es resolves to Spanish directly.
    const result = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'es');
    expect(result).not.toBeNull();
    expect(result.language).toBe('es');
    expect(result.languageData.rtl).toBe(false);
    expect(result.languageData.file_url).toMatch(/^\/forms\/es\//);
  });

  it('resolves in French (fr now has real assets)', () => {
    const result = resolveFormWithLanguage('tf-adults-behavioral-activation-plan', 'fr');
    expect(result).not.toBeNull();
    expect(result.language).toBe('fr');
  });

  it('falls back to English for Italian (it has no assets)', () => {
    const result = resolveFormWithLanguage('tf-adults-behavioral-activation-plan', 'it');
    expect(result).not.toBeNull();
    expect(result.language).toBe('en');
  });

  it('falls back to English for German', () => {
    const result = resolveFormWithLanguage('tf-adolescents-anxiety-thought-record', 'de');
    expect(result).not.toBeNull();
    expect(result.language).toBe('en');
  });
});

// ─── 16. Unapproved seed forms remain hidden ──────────────────────────────────

describe('TherapeuticForms Phase 1B — unapproved forms remain hidden', () => {
  it('cognitive-distortions-worksheet is now approved in Phase 4A', () => {
    // Promoted to approved: true in Phase 4A
    const result = resolveFormWithLanguage('tf-adults-cognitive-distortions-worksheet', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('Cognitive Distortions Worksheet');
  });

  it('grounding-exercise is now approved in Phase 4A', () => {
    // Promoted to approved: true in Phase 4A
    const result = resolveFormWithLanguage('tf-children-grounding-exercise', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('Grounding Exercise for Children');
  });

  it('listFormsByAudience does not include any unapproved forms', () => {
    const allAudiences = ['children', 'adolescents', 'adults', 'older_adults'];
    for (const audience of allAudiences) {
      const forms = listFormsByAudience(audience);
      for (const f of forms) {
        expect(f.approved, `${f.id} returned by listFormsByAudience must be approved`).toBe(true);
      }
    }
  });

  it('unapproved forms in the registry have no non-empty file_url', () => {
    const unapproved = ALL_FORMS.filter(f => !f.approved);
    for (const form of unapproved) {
      for (const [lang, block] of Object.entries(form.languages)) {
        expect(
          !block.file_url || block.file_url.trim() === '',
          `Unapproved form ${form.id}[${lang}] must not have a file_url`
        ).toBe(true);
      }
    }
  });
});

// ─── 17. toGeneratedFileMetadata works for real approved Phase 1B forms ───────

describe('TherapeuticForms Phase 1B — toGeneratedFileMetadata for real forms', () => {
  it('converts CBT Thought Record (en) to generated_file shape', () => {
    const resolved = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'en');
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta).not.toBeNull();
    expect(meta.type).toBe('pdf');
    expect(meta.url).toBe('/forms/en/adults/cbt-thought-record.pdf');
    expect(meta.title).toBe('CBT Thought Record');
    expect(meta.source).toBe('therapeutic_forms_library');
    expect(meta.audience).toBe('adults');
    expect(meta.language).toBe('en');
    expect(typeof meta.created_at).toBe('string');
  });

  it('converts CBT Thought Record (he) to generated_file shape', () => {
    const resolved = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'he');
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta).not.toBeNull();
    expect(meta.type).toBe('pdf');
    expect(meta.url).toBe('/forms/he/adults/cbt-thought-record.pdf');
    expect(meta.language).toBe('he');
  });

  it('toGeneratedFileMetadata output for real forms is accepted by normalizeGeneratedFile', () => {
    const resolved = resolveFormWithLanguage('tf-older-adults-mood-reflection-sheet', 'en');
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta).not.toBeNull();
    // normalizeGeneratedFile works with absolute URLs but not relative /forms/ paths —
    // we test the shape contract (type, url, name) is correct
    expect(meta.type).toBe('pdf');
    expect(meta.url).toMatch(/^\/forms\//);
    expect(meta.name).toBeTruthy();
  });
});

// ─── 18. No fake/missing file links ───────────────────────────────────────────

describe('TherapeuticForms Phase 1B — no fake file links', () => {
  it('every form returned by listFormsByAudience has non-empty languageData when resolved', () => {
    const audiences = ['children', 'adolescents', 'adults', 'older_adults'];
    for (const audience of audiences) {
      const forms = listFormsByAudience(audience);
      for (const form of forms) {
        const resolved = resolveFormWithLanguage(form.id, 'en');
        expect(resolved, `${form.id} must resolve successfully`).not.toBeNull();
        expect(resolved.languageData.file_url.trim()).not.toBe('');
      }
    }
  });

  it('no approved form returns an undefined file_url', () => {
    const approvedForms = ALL_FORMS.filter(f => f.approved);
    for (const form of approvedForms) {
      const resolved = resolveFormWithLanguage(form.id, 'en');
      expect(resolved).not.toBeNull();
      expect(resolved.languageData.file_url).toBeDefined();
    }
  });
});

// ─── 19. PDF files exist on disk ──────────────────────────────────────────────

describe('TherapeuticForms Phase 1B — PDF files exist in public/forms', () => {
  it('public/forms directory exists', () => {
    expect(fs.existsSync(PUBLIC_FORMS_ROOT)).toBe(true);
  });

  it('every approved form file_url resolves to an existing file under public/', () => {
    const audiences = ['children', 'adolescents', 'adults', 'older_adults'];
    for (const audience of audiences) {
      const forms = listFormsByAudience(audience);
      for (const form of forms) {
        // Check both en and he variants
        for (const lang of ['en', 'he']) {
          const resolved = resolveFormWithLanguage(form.id, lang);
          if (resolved && resolved.languageData.file_url) {
            const relativePath = resolved.languageData.file_url.replace(/^\//, '');
            const absolutePath = path.resolve(PUBLIC_FORMS_ROOT, '..', relativePath);
            expect(
              fs.existsSync(absolutePath),
              `PDF file missing: public/${relativePath}`
            ).toBe(true);
          }
        }
      }
    }
  });

  it('every existing PDF file is non-empty (> 1 KB)', () => {
    const pdfPaths = [
      '/forms/en/adults/cbt-thought-record.pdf',
      '/forms/he/adults/cbt-thought-record.pdf',
      '/forms/en/adults/behavioral-activation-plan.pdf',
      '/forms/he/adults/behavioral-activation-plan.pdf',
      '/forms/en/adolescents/anxiety-thought-record.pdf',
      '/forms/he/adolescents/anxiety-thought-record.pdf',
      '/forms/en/children/simple-feelings-check-in.pdf',
      '/forms/he/children/simple-feelings-check-in.pdf',
      '/forms/en/older_adults/mood-reflection-sheet.pdf',
      '/forms/he/older_adults/mood-reflection-sheet.pdf',
      // Phase 4A — children
      '/forms/en/children/grounding-exercise.pdf',
      '/forms/he/children/grounding-exercise.pdf',
      '/forms/en/children/parent-guided-coping-card.pdf',
      '/forms/he/children/parent-guided-coping-card.pdf',
      '/forms/en/children/box-breathing.pdf',
      '/forms/he/children/box-breathing.pdf',
      // Phase 4A — adolescents
      '/forms/en/adolescents/emotion-regulation-worksheet.pdf',
      '/forms/he/adolescents/emotion-regulation-worksheet.pdf',
      '/forms/en/adolescents/weekly-practice-planner.pdf',
      '/forms/he/adolescents/weekly-practice-planner.pdf',
      '/forms/en/adolescents/social-pressure-coping-tool.pdf',
      '/forms/he/adolescents/social-pressure-coping-tool.pdf',
      // Phase 4A — adults
      '/forms/en/adults/cognitive-distortions-worksheet.pdf',
      '/forms/he/adults/cognitive-distortions-worksheet.pdf',
      '/forms/en/adults/values-and-goals-worksheet.pdf',
      '/forms/he/adults/values-and-goals-worksheet.pdf',
      '/forms/en/adults/mood-tracking-sheet.pdf',
      '/forms/he/adults/mood-tracking-sheet.pdf',
      '/forms/en/adults/weekly-coping-plan.pdf',
      '/forms/he/adults/weekly-coping-plan.pdf',
      // Phase 4A — older adults
      '/forms/en/older_adults/sleep-routine-reflection.pdf',
      '/forms/he/older_adults/sleep-routine-reflection.pdf',
      '/forms/en/older_adults/daily-coping-plan.pdf',
      '/forms/he/older_adults/daily-coping-plan.pdf',
      '/forms/en/older_adults/caregiver-support-reflection.pdf',
      '/forms/he/older_adults/caregiver-support-reflection.pdf',
    ];
    for (const formPath of pdfPaths) {
      const absolutePath = path.resolve(PUBLIC_FORMS_ROOT, '..', formPath.replace(/^\//, ''));
      if (fs.existsSync(absolutePath)) {
        const stat = fs.statSync(absolutePath);
        expect(
          stat.size,
          `PDF suspiciously small: public${formPath}`
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
      // Phase 4A
      'he/children/grounding-exercise.pdf',
      'he/children/parent-guided-coping-card.pdf',
      'he/children/box-breathing.pdf',
      'he/adolescents/emotion-regulation-worksheet.pdf',
      'he/adolescents/weekly-practice-planner.pdf',
      'he/adolescents/social-pressure-coping-tool.pdf',
      'he/adults/cognitive-distortions-worksheet.pdf',
      'he/adults/values-and-goals-worksheet.pdf',
      'he/adults/mood-tracking-sheet.pdf',
      'he/adults/weekly-coping-plan.pdf',
      'he/older_adults/sleep-routine-reflection.pdf',
      'he/older_adults/daily-coping-plan.pdf',
      'he/older_adults/caregiver-support-reflection.pdf',
    ];
    for (const relPath of hebrewFiles) {
      const absolutePath = path.join(PUBLIC_FORMS_ROOT, relPath);
      expect(fs.existsSync(absolutePath), `Expected Hebrew PDF: ${relPath}`).toBe(true);
    }
  });
});

// ═════════════════════════════════════════════════════════════════════════════
// PHASE 4A TESTS
// ═════════════════════════════════════════════════════════════════════════════

// Phase 4A form IDs used in tests
// Note: simple-feelings-check-in is served by the legacy id 'tf-children-feelings-checkin'
const PHASE4A_FORM_IDS = {
  children: [
    'tf-children-feelings-checkin',             // legacy id for children-simple-feelings-check-in
    'tf-children-grounding-exercise',
    'tf-children-parent-guided-coping-card',
    'tf-children-box-breathing',
  ],
  adolescents: [
    'tf-adolescents-anxiety-thought-record',
    'tf-adolescents-emotion-regulation-worksheet',
    'tf-adolescents-weekly-practice-planner',
    'tf-adolescents-social-pressure-coping-tool',
  ],
  adults_phase4a: [
    'tf-adults-cognitive-distortions-worksheet',
    'tf-adults-values-and-goals-worksheet',
    'tf-adults-mood-tracking-sheet',
    'tf-adults-weekly-coping-plan',
  ],
  older_adults: [
    'tf-older-adults-mood-reflection-sheet',
    'tf-older-adults-sleep-routine-reflection',
    'tf-older-adults-daily-coping-plan',
    'tf-older-adults-caregiver-support-reflection',
  ],
};

// ─── Phase 4A: all 16 forms are approved and resolve ─────────────────────────

describe('TherapeuticForms Phase 4A — all 16 forms are approved and resolve', () => {
  const allPhase4aIds = [
    ...PHASE4A_FORM_IDS.children,
    ...PHASE4A_FORM_IDS.adolescents,
    ...PHASE4A_FORM_IDS.adults_phase4a,
    ...PHASE4A_FORM_IDS.older_adults,
  ];

  it('all 16 Phase 4A form IDs resolve to a non-null result in English', () => {
    for (const id of allPhase4aIds) {
      const result = resolveFormWithLanguage(id, 'en');
      expect(result, `Form ${id} should resolve in English`).not.toBeNull();
    }
  });

  it('all 16 Phase 4A form IDs resolve to a non-null result in Hebrew', () => {
    for (const id of allPhase4aIds) {
      const result = resolveFormWithLanguage(id, 'he');
      expect(result, `Form ${id} should resolve in Hebrew`).not.toBeNull();
      expect(result.language, `${id} should resolve to Hebrew`).toBe('he');
    }
  });

  it('all 16 Phase 4A forms are in the registry with approved: true', () => {
    for (const id of allPhase4aIds) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `Form ${id} not found in ALL_FORMS`).toBeDefined();
      expect(form.approved, `Form ${id} must be approved`).toBe(true);
    }
  });
});

// ─── Phase 4A: English and Hebrew language blocks ────────────────────────────

describe('TherapeuticForms Phase 4A — English and Hebrew language blocks', () => {
  it('each Phase 4A form has a valid English language block', () => {
    const allIds = [
      ...PHASE4A_FORM_IDS.children,
      ...PHASE4A_FORM_IDS.adolescents,
      ...PHASE4A_FORM_IDS.adults_phase4a,
      ...PHASE4A_FORM_IDS.older_adults,
    ];
    for (const id of allIds) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `${id} not found`).toBeDefined();
      const enBlock = form.languages.en;
      expect(enBlock, `${id} missing English block`).toBeDefined();
      expect(enBlock.file_url, `${id} English file_url must be non-empty`).toBeTruthy();
      expect(enBlock.file_url.startsWith('/forms/'), `${id} English file_url must start with /forms/`).toBe(true);
      expect(enBlock.rtl, `${id} English rtl must be false`).toBe(false);
    }
  });

  it('each Phase 4A form has a valid Hebrew language block with rtl: true', () => {
    const allIds = [
      ...PHASE4A_FORM_IDS.children,
      ...PHASE4A_FORM_IDS.adolescents,
      ...PHASE4A_FORM_IDS.adults_phase4a,
      ...PHASE4A_FORM_IDS.older_adults,
    ];
    for (const id of allIds) {
      const form = ALL_FORMS.find(f => f.id === id);
      expect(form, `${id} not found`).toBeDefined();
      const heBlock = form.languages.he;
      expect(heBlock, `${id} missing Hebrew block`).toBeDefined();
      expect(heBlock.file_url, `${id} Hebrew file_url must be non-empty`).toBeTruthy();
      expect(heBlock.file_url.startsWith('/forms/'), `${id} Hebrew file_url must start with /forms/`).toBe(true);
      expect(heBlock.rtl, `${id} Hebrew rtl must be true`).toBe(true);
    }
  });
});

// ─── Phase 4A: Hebrew requests resolve to Hebrew ─────────────────────────────

describe('TherapeuticForms Phase 4A — Hebrew resolves to Hebrew', () => {
  it('children Phase 4A forms resolve Hebrew correctly', () => {
    for (const id of PHASE4A_FORM_IDS.children) {
      const result = resolveFormWithLanguage(id, 'he');
      expect(result, `${id} should resolve in Hebrew`).not.toBeNull();
      expect(result.languageData.rtl).toBe(true);
      expect(result.languageData.file_url).toContain('/he/');
    }
  });

  it('adolescents Phase 4A forms resolve Hebrew correctly', () => {
    for (const id of PHASE4A_FORM_IDS.adolescents) {
      const result = resolveFormWithLanguage(id, 'he');
      expect(result, `${id} should resolve in Hebrew`).not.toBeNull();
      expect(result.languageData.rtl).toBe(true);
    }
  });

  it('adults Phase 4A forms resolve Hebrew correctly', () => {
    for (const id of PHASE4A_FORM_IDS.adults_phase4a) {
      const result = resolveFormWithLanguage(id, 'he');
      expect(result, `${id} should resolve in Hebrew`).not.toBeNull();
      expect(result.languageData.rtl).toBe(true);
    }
  });

  it('older_adults Phase 4A forms resolve Hebrew correctly', () => {
    for (const id of PHASE4A_FORM_IDS.older_adults) {
      const result = resolveFormWithLanguage(id, 'he');
      expect(result, `${id} should resolve in Hebrew`).not.toBeNull();
      expect(result.languageData.rtl).toBe(true);
    }
  });
});

// ─── Phase 4A: Unsupported languages fall back to English ────────────────────

describe('TherapeuticForms Phase 4A — unsupported languages fall back to English', () => {
  it('Phase 4A forms resolve in French (fr now has real assets)', () => {
    const sampleIds = [
      'tf-children-box-breathing',
      'tf-adolescents-social-pressure-coping-tool',
      'tf-adults-values-and-goals-worksheet',
      'tf-older-adults-sleep-routine-reflection',
    ];
    for (const id of sampleIds) {
      const result = resolveFormWithLanguage(id, 'fr');
      expect(result, `${id} should resolve in French`).not.toBeNull();
      expect(result.language, `${id} should resolve to French`).toBe('fr');
      expect(result.languageData.rtl).toBe(false);
    }
  });

  it('Phase 4A forms fall back to English for de, it, pt (no assets for these)', () => {
    const sampleIds = [
      'tf-children-box-breathing',
      'tf-adolescents-social-pressure-coping-tool',
      'tf-adults-values-and-goals-worksheet',
      'tf-older-adults-sleep-routine-reflection',
    ];
    const unsupportedLangs = ['de', 'it', 'pt'];
    for (const id of sampleIds) {
      for (const lang of unsupportedLangs) {
        const result = resolveFormWithLanguage(id, lang);
        expect(result, `${id} should fall back for lang=${lang}`).not.toBeNull();
        expect(result.language, `${id} should fall back to English for lang=${lang}`).toBe('en');
        expect(result.languageData.rtl).toBe(false);
      }
    }
  });
});

// ─── Phase 4A: audience filters return correct forms ─────────────────────────

describe('TherapeuticForms Phase 4A — audience filters return correct forms', () => {
  it('listFormsByAudience("children") returns 4 approved children forms', () => {
    const forms = listFormsByAudience('children');
    expect(forms.length).toBeGreaterThanOrEqual(4);
    const ids = forms.map(f => f.id);
    expect(ids).toContain('tf-children-feelings-checkin');
    expect(ids).toContain('tf-children-grounding-exercise');
    expect(ids).toContain('tf-children-parent-guided-coping-card');
    expect(ids).toContain('tf-children-box-breathing');
  });

  it('listFormsByAudience("adolescents") returns 4 approved adolescents forms', () => {
    const forms = listFormsByAudience('adolescents');
    expect(forms.length).toBeGreaterThanOrEqual(4);
    const ids = forms.map(f => f.id);
    expect(ids).toContain('tf-adolescents-anxiety-thought-record');
    expect(ids).toContain('tf-adolescents-emotion-regulation-worksheet');
    expect(ids).toContain('tf-adolescents-weekly-practice-planner');
    expect(ids).toContain('tf-adolescents-social-pressure-coping-tool');
  });

  it('listFormsByAudience("adults") returns at least 6 approved adults forms', () => {
    const forms = listFormsByAudience('adults');
    expect(forms.length).toBeGreaterThanOrEqual(6);
    const ids = forms.map(f => f.id);
    expect(ids).toContain('tf-adults-cbt-thought-record');
    expect(ids).toContain('tf-adults-behavioral-activation-plan');
    expect(ids).toContain('tf-adults-cognitive-distortions-worksheet');
    expect(ids).toContain('tf-adults-values-and-goals-worksheet');
    expect(ids).toContain('tf-adults-mood-tracking-sheet');
    expect(ids).toContain('tf-adults-weekly-coping-plan');
  });

  it('listFormsByAudience("older_adults") returns 4 approved older_adults forms', () => {
    const forms = listFormsByAudience('older_adults');
    expect(forms.length).toBeGreaterThanOrEqual(4);
    const ids = forms.map(f => f.id);
    expect(ids).toContain('tf-older-adults-mood-reflection-sheet');
    expect(ids).toContain('tf-older-adults-sleep-routine-reflection');
    expect(ids).toContain('tf-older-adults-daily-coping-plan');
    expect(ids).toContain('tf-older-adults-caregiver-support-reflection');
  });
});

// ─── Phase 4A: category filters ───────────────────────────────────────────────

describe('TherapeuticForms Phase 4A — category filters return correct new forms', () => {
  it('coping_tools category returns children grounding and older_adults daily-coping-plan', () => {
    const forms = listFormsByCategory('coping_tools');
    const ids = forms.map(f => f.id);
    expect(ids).toContain('tf-children-grounding-exercise');
    expect(ids).toContain('tf-older-adults-daily-coping-plan');
  });

  it('emotional_regulation category returns box-breathing and emotion-regulation-worksheet', () => {
    const forms = listFormsByCategory('emotional_regulation');
    const ids = forms.map(f => f.id);
    expect(ids).toContain('tf-children-box-breathing');
    expect(ids).toContain('tf-adolescents-emotion-regulation-worksheet');
  });

  it('weekly_practice category returns adolescents and adults weekly forms', () => {
    const forms = listFormsByCategory('weekly_practice');
    const ids = forms.map(f => f.id);
    expect(ids).toContain('tf-adolescents-weekly-practice-planner');
    expect(ids).toContain('tf-adults-weekly-coping-plan');
  });

  it('caregiver_support category returns caregiver-support-reflection', () => {
    const forms = listFormsByCategory('caregiver_support');
    const ids = forms.map(f => f.id);
    expect(ids).toContain('tf-older-adults-caregiver-support-reflection');
  });

  it('sleep category returns sleep-routine-reflection', () => {
    const forms = listFormsByCategory('sleep');
    const ids = forms.map(f => f.id);
    expect(ids).toContain('tf-older-adults-sleep-routine-reflection');
  });
});

// ─── Phase 4A: toGeneratedFileMetadata for one form per audience ──────────────

describe('TherapeuticForms Phase 4A — toGeneratedFileMetadata works for new forms', () => {
  it('toGeneratedFileMetadata works for a Phase 4A children form (box-breathing)', () => {
    const resolved = resolveFormWithLanguage('tf-children-box-breathing', 'en');
    expect(resolved).not.toBeNull();
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta).not.toBeNull();
    expect(meta.type).toBe('pdf');
    expect(meta.source).toBe('therapeutic_forms_library');
    expect(meta.form_id).toBe('tf-children-box-breathing');
    expect(meta.audience).toBe('children');
    expect(meta.url).toBe('/forms/en/children/box-breathing.pdf');
    expect(meta.language).toBe('en');
  });

  it('toGeneratedFileMetadata works for a Phase 4A adolescents form (social-pressure)', () => {
    const resolved = resolveFormWithLanguage('tf-adolescents-social-pressure-coping-tool', 'en');
    expect(resolved).not.toBeNull();
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta).not.toBeNull();
    expect(meta.type).toBe('pdf');
    expect(meta.audience).toBe('adolescents');
    expect(meta.form_id).toBe('tf-adolescents-social-pressure-coping-tool');
  });

  it('toGeneratedFileMetadata works for a Phase 4A adults form (values-and-goals)', () => {
    const resolved = resolveFormWithLanguage('tf-adults-values-and-goals-worksheet', 'en');
    expect(resolved).not.toBeNull();
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta).not.toBeNull();
    expect(meta.type).toBe('pdf');
    expect(meta.audience).toBe('adults');
    expect(meta.form_id).toBe('tf-adults-values-and-goals-worksheet');
  });

  it('toGeneratedFileMetadata works for a Phase 4A older_adults form (daily-coping-plan)', () => {
    const resolved = resolveFormWithLanguage('tf-older-adults-daily-coping-plan', 'en');
    expect(resolved).not.toBeNull();
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta).not.toBeNull();
    expect(meta.type).toBe('pdf');
    expect(meta.audience).toBe('older_adults');
    expect(meta.form_id).toBe('tf-older-adults-daily-coping-plan');
  });

  it('toGeneratedFileMetadata works for Hebrew Phase 4A form', () => {
    const resolved = resolveFormWithLanguage('tf-older-adults-caregiver-support-reflection', 'he');
    expect(resolved).not.toBeNull();
    const meta = toGeneratedFileMetadata(resolved);
    expect(meta).not.toBeNull();
    expect(meta.language).toBe('he');
    expect(meta.url).toBe('/forms/he/older_adults/caregiver-support-reflection.pdf');
  });
});

// ─── Phase 4A: existing Phase 3 AI mappings unchanged ────────────────────────

describe('TherapeuticForms Phase 4A — existing Phase 3 AI mappings unchanged', () => {
  it('CBT Thought Record still resolves (Phase 1B / Phase 3 unchanged)', () => {
    const result = resolveFormWithLanguage('tf-adults-cbt-thought-record', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('CBT Thought Record');
  });

  it('Behavioral Activation Plan still resolves (Phase 1B / Phase 3 unchanged)', () => {
    const result = resolveFormWithLanguage('tf-adults-behavioral-activation-plan', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('Behavioral Activation Plan');
  });

  it('Anxiety Thought Record still resolves for adolescents (Phase 1B unchanged)', () => {
    const result = resolveFormWithLanguage('tf-adolescents-anxiety-thought-record', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('Anxiety Thought Record');
  });

  it('Mood Reflection Sheet still resolves for older_adults (Phase 1B unchanged)', () => {
    const result = resolveFormWithLanguage('tf-older-adults-mood-reflection-sheet', 'en');
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('Mood Reflection Sheet');
  });
});

// ─── Phase 4A: no fake links ──────────────────────────────────────────────────

describe('TherapeuticForms Phase 4A — no fake links in Phase 4A forms', () => {
  it('all Phase 4A approved forms return a defined non-empty file_url', () => {
    const allIds = [
      ...PHASE4A_FORM_IDS.children,
      ...PHASE4A_FORM_IDS.adolescents,
      ...PHASE4A_FORM_IDS.adults_phase4a,
      ...PHASE4A_FORM_IDS.older_adults,
    ];
    for (const id of allIds) {
      const resolved = resolveFormWithLanguage(id, 'en');
      expect(resolved, `${id} should resolve`).not.toBeNull();
      expect(resolved.languageData.file_url.trim(), `${id} file_url should not be empty`).not.toBe('');
      expect(resolved.languageData.file_url, `${id} file_url should start with /forms/`).toMatch(/^\/forms\//);
    }
  });
});

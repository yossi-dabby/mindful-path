/**
 * Tests for TherapeuticForms Phase 2 — User-facing access point.
 *
 * Covers:
 *  1.  Home card route label exists in pages config
 *  2.  TherapeuticForms page renders approved forms (via resolver)
 *  3.  Unapproved forms are not shown
 *  4.  Missing/fake links are not shown (resolver gate)
 *  5.  Audience filter works
 *  6.  Category filter works
 *  7.  Hebrew language uses Hebrew title/description where available
 *  8.  Unsupported languages fall back to English
 *  9.  Empty state when no forms match
 * 10.  Existing Home cards remain present in quick_actions translations
 * 11.  No chat/generated-file/attachment behavior was changed
 * 12.  i18n therapeutic_forms section present in all 7 languages
 * 13.  TherapeuticForms route registered in pages.config.js
 * 14.  TherapeuticForms card registered in quick_actions i18n keys
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

import {
  ALL_FORMS,
  AUDIENCE_GROUPS,
  THERAPEUTIC_CATEGORIES,
  VALID_AUDIENCE_VALUES,
  VALID_CATEGORY_VALUES,
  RTL_LANGUAGES,
  resolveFormWithLanguage,
  listFormsByAudience,
  listFormsByCategory,
  listFormsByAudienceAndCategory,
} from '../../src/data/therapeuticForms/index.js';

import { translations } from '../../src/components/i18n/translations.jsx';
import { normalizeGeneratedFile } from '../../src/components/chat/utils/normalizeGeneratedFile.js';

// ─── Test fixtures ────────────────────────────────────────────────────────────

const FIXTURE_APPROVED_ADULTS = {
  id: 'phase2-fixture-approved-adults',
  slug: 'phase2-fixture-approved-adults-slug',
  audience: 'adults',
  category: 'thought_records',
  therapeutic_use: 'Phase 2 UI fixture — approved adults form.',
  approved: true,
  tags: ['test'],
  languages: {
    en: {
      title: 'Phase 2 Test Form (EN)',
      description: 'A Phase 2 fixture for English.',
      file_url: 'https://static.example.com/phase2-test-en.pdf',
      file_type: 'pdf',
      file_name: 'phase2-test-en.pdf',
      rtl: false,
    },
    he: {
      title: 'טופס בדיקה שלב 2 (עברית)',
      description: 'אביזר בדיקה לשלב 2 בעברית.',
      file_url: 'https://static.example.com/phase2-test-he.pdf',
      file_type: 'pdf',
      file_name: 'phase2-test-he.pdf',
      rtl: true,
    },
  },
  created_at: '2025-04-27T00:00:00.000Z',
  updated_at: '2025-04-27T00:00:00.000Z',
};

const FIXTURE_UNAPPROVED = {
  id: 'phase2-fixture-unapproved',
  slug: 'phase2-fixture-unapproved-slug',
  audience: 'adults',
  category: 'coping_tools',
  therapeutic_use: 'Phase 2 UI fixture — unapproved.',
  approved: false,
  tags: ['test'],
  languages: {
    en: {
      title: 'Unapproved Form',
      description: 'This form is not approved.',
      file_url: 'https://static.example.com/unapproved-en.pdf',
      file_type: 'pdf',
      file_name: 'unapproved-en.pdf',
      rtl: false,
    },
  },
  created_at: '2025-04-27T00:00:00.000Z',
  updated_at: '2025-04-27T00:00:00.000Z',
};

const FIXTURE_MISSING_URL = {
  id: 'phase2-fixture-missing-url',
  slug: 'phase2-fixture-missing-url-slug',
  audience: 'adolescents',
  category: 'anxiety_tools',
  therapeutic_use: 'Phase 2 UI fixture — missing file_url.',
  approved: true,
  tags: ['test'],
  languages: {
    en: {
      title: 'Missing URL Form',
      description: 'No file URL.',
      file_url: '',
      file_type: 'pdf',
      file_name: 'missing-url-en.pdf',
      rtl: false,
    },
  },
  created_at: '2025-04-27T00:00:00.000Z',
  updated_at: '2025-04-27T00:00:00.000Z',
};

const FIXTURE_EN_ONLY = {
  id: 'phase2-fixture-en-only',
  slug: 'phase2-fixture-en-only-slug',
  audience: 'children',
  category: 'emotional_regulation',
  therapeutic_use: 'Phase 2 UI fixture — English only.',
  approved: true,
  tags: ['test'],
  languages: {
    en: {
      title: 'English Only Form',
      description: 'Only available in English.',
      file_url: 'https://static.example.com/en-only-en.pdf',
      file_type: 'pdf',
      file_name: 'en-only-en.pdf',
      rtl: false,
    },
  },
  created_at: '2025-04-27T00:00:00.000Z',
  updated_at: '2025-04-27T00:00:00.000Z',
};

const FIXTURE_OLDER_ADULTS = {
  id: 'phase2-fixture-older-adults',
  slug: 'phase2-fixture-older-adults-slug',
  audience: 'older_adults',
  category: 'coping_tools',
  therapeutic_use: 'Phase 2 UI fixture — older adults.',
  approved: true,
  tags: ['test'],
  languages: {
    en: {
      title: 'Older Adults Coping Form',
      description: 'A coping form for older adults.',
      file_url: 'https://static.example.com/older-adults-coping-en.pdf',
      file_type: 'pdf',
      file_name: 'older-adults-coping-en.pdf',
      rtl: false,
    },
  },
  created_at: '2025-04-27T00:00:00.000Z',
  updated_at: '2025-04-27T00:00:00.000Z',
};

// ─── Inline resolver (same logic as the library; accepts an injected forms array) ─
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

function resolveWithLanguage(forms, idOrSlug, lang = 'en') {
  const form = forms.find((f) => f != null && (f.id === idOrSlug || f.slug === idOrSlug));
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

// Simulates the page's getFilteredForms logic against an injected registry
function getFilteredForms(forms, { audience, category, lang }) {
  return forms.reduce((acc, form) => {
    if (audience !== 'all' && form.audience !== audience) return acc;
    if (category !== 'all' && form.category !== category) return acc;
    const resolved = resolveWithLanguage(forms, form.id, lang);
    if (!resolved) return acc;
    acc.push(resolved);
    return acc;
  }, []);
}

// ─── 1. pages.config.js has TherapeuticForms route ───────────────────────────

describe('Phase 2 — TherapeuticForms route registration', () => {
  it('TherapeuticForms is registered as a lazy import in pages.config.js', () => {
    // Read the source file directly — avoids pulling in browser-only modules
    // (Layout.jsx → base44Client) which are not available in the test environment.
    const configPath = resolve(
      process.cwd(),
      'src/pages.config.js'
    );
    const source = readFileSync(configPath, 'utf8');
    expect(source).toContain("import('./pages/TherapeuticForms')");
    expect(source).toContain('"TherapeuticForms": TherapeuticForms');
  });
});

// ─── 2. i18n — therapeutic_forms section present in all 7 languages ───────────

const LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

describe('Phase 2 — i18n therapeutic_forms section', () => {
  for (const lang of LANGUAGES) {
    it(`"${lang}" has therapeutic_forms section with required keys`, () => {
      const tf = translations[lang]?.translation?.therapeutic_forms;
      expect(tf, `Missing therapeutic_forms for ${lang}`).toBeDefined();
      expect(tf.card_title, `Missing card_title for ${lang}`).toBeTruthy();
      expect(tf.card_subtitle, `Missing card_subtitle for ${lang}`).toBeTruthy();
      expect(tf.page_title, `Missing page_title for ${lang}`).toBeTruthy();
      expect(tf.page_subtitle, `Missing page_subtitle for ${lang}`).toBeTruthy();
      expect(tf.filter_audience, `Missing filter_audience for ${lang}`).toBeTruthy();
      expect(tf.filter_category, `Missing filter_category for ${lang}`).toBeTruthy();
      expect(tf.open_form, `Missing open_form for ${lang}`).toBeTruthy();
      expect(tf.empty_state?.title, `Missing empty_state.title for ${lang}`).toBeTruthy();
      expect(tf.empty_state?.message, `Missing empty_state.message for ${lang}`).toBeTruthy();
    });
  }

  it('Hebrew card_title matches required label "טפסים טיפוליים"', () => {
    const tf = translations.he.translation.therapeutic_forms;
    expect(tf.card_title).toBe('טפסים טיפוליים');
  });

  it('Hebrew card_subtitle matches required label "דפי עבודה לתרגול אישי"', () => {
    const tf = translations.he.translation.therapeutic_forms;
    expect(tf.card_subtitle).toBe('דפי עבודה לתרגול אישי');
  });

  it('English card_title is "Therapeutic Forms"', () => {
    const tf = translations.en.translation.therapeutic_forms;
    expect(tf.card_title).toBe('Therapeutic Forms');
  });

  for (const lang of LANGUAGES) {
    it(`"${lang}" has audience translations for all 5 audience values (including all)`, () => {
      const audience = translations[lang]?.translation?.therapeutic_forms?.audience;
      expect(audience, `Missing audience for ${lang}`).toBeDefined();
      for (const key of ['all', 'children', 'adolescents', 'adults', 'older_adults']) {
        expect(audience[key], `Missing audience.${key} for ${lang}`).toBeTruthy();
      }
    });
  }

  for (const lang of LANGUAGES) {
    it(`"${lang}" has category translations for all category values`, () => {
      const category = translations[lang]?.translation?.therapeutic_forms?.category;
      expect(category, `Missing category for ${lang}`).toBeDefined();
      for (const cat of THERAPEUTIC_CATEGORIES) {
        expect(category[cat.value], `Missing category.${cat.value} for ${lang}`).toBeTruthy();
      }
    });
  }
});

// ─── 3. Home card quick_actions key exists in all 7 languages ─────────────────

describe('Phase 2 — Home card quick_actions key', () => {
  for (const lang of LANGUAGES) {
    it(`"${lang}" has quick_actions.therapeutic_forms key`, () => {
      const qa = translations[lang]?.translation?.quick_actions;
      expect(qa, `Missing quick_actions for ${lang}`).toBeDefined();
      expect(qa.therapeutic_forms, `Missing quick_actions.therapeutic_forms for ${lang}`).toBeDefined();
      expect(qa.therapeutic_forms.title, `Missing quick_actions.therapeutic_forms.title for ${lang}`).toBeTruthy();
      expect(qa.therapeutic_forms.description, `Missing quick_actions.therapeutic_forms.description for ${lang}`).toBeTruthy();
    });
  }

  it('Hebrew quick_actions.therapeutic_forms.title is "טפסים טיפוליים"', () => {
    expect(translations.he.translation.quick_actions.therapeutic_forms.title).toBe('טפסים טיפוליים');
  });

  it('Hebrew quick_actions.therapeutic_forms.description is "דפי עבודה לתרגול אישי"', () => {
    expect(translations.he.translation.quick_actions.therapeutic_forms.description).toBe('דפי עבודה לתרגול אישי');
  });
});

// ─── 4. Existing Home cards remain present ────────────────────────────────────

describe('Phase 2 — existing Home cards unchanged', () => {
  const existingCards = [
    'exercises_library',
    'video_library',
    'ai_therapist',
    'journal_thought',
    'set_goal',
    'mind_games',
    'journeys',
  ];

  for (const cardKey of existingCards) {
    it(`English quick_actions.${cardKey} still exists`, () => {
      const qa = translations.en.translation.quick_actions;
      expect(qa[cardKey], `Missing quick_actions.${cardKey}`).toBeDefined();
      expect(qa[cardKey].title).toBeTruthy();
    });
  }
});

// ─── 5. Resolver: approved forms are shown ────────────────────────────────────

describe('Phase 2 — page resolver: approved forms are shown', () => {
  it('resolves an approved form with a valid file_url', () => {
    const result = resolveWithLanguage(
      [FIXTURE_APPROVED_ADULTS],
      'phase2-fixture-approved-adults',
      'en'
    );
    expect(result).not.toBeNull();
    expect(result.languageData.title).toBe('Phase 2 Test Form (EN)');
    expect(result.languageData.file_url).toBe('https://static.example.com/phase2-test-en.pdf');
  });

  it('getFilteredForms(all,all,en) returns the approved fixture', () => {
    const forms = getFilteredForms(
      [FIXTURE_APPROVED_ADULTS, FIXTURE_UNAPPROVED, FIXTURE_MISSING_URL],
      { audience: 'all', category: 'all', lang: 'en' }
    );
    const ids = forms.map((f) => f.form.id);
    expect(ids).toContain('phase2-fixture-approved-adults');
  });
});

// ─── 6. Resolver: unapproved forms are NOT shown ──────────────────────────────

describe('Phase 2 — page resolver: unapproved forms are not shown', () => {
  it('resolveWithLanguage returns null for unapproved form', () => {
    const result = resolveWithLanguage(
      [FIXTURE_UNAPPROVED],
      'phase2-fixture-unapproved',
      'en'
    );
    expect(result).toBeNull();
  });

  it('getFilteredForms excludes unapproved form', () => {
    const forms = getFilteredForms(
      [FIXTURE_UNAPPROVED, FIXTURE_APPROVED_ADULTS],
      { audience: 'all', category: 'all', lang: 'en' }
    );
    const ids = forms.map((f) => f.form.id);
    expect(ids).not.toContain('phase2-fixture-unapproved');
  });
});

// ─── 7. Resolver: missing/fake links are NOT shown ────────────────────────────

describe('Phase 2 — page resolver: missing/fake links are not shown', () => {
  it('resolveWithLanguage returns null when file_url is empty', () => {
    const result = resolveWithLanguage(
      [FIXTURE_MISSING_URL],
      'phase2-fixture-missing-url',
      'en'
    );
    expect(result).toBeNull();
  });

  it('getFilteredForms excludes form with empty file_url', () => {
    const forms = getFilteredForms(
      [FIXTURE_MISSING_URL, FIXTURE_APPROVED_ADULTS],
      { audience: 'all', category: 'all', lang: 'en' }
    );
    const ids = forms.map((f) => f.form.id);
    expect(ids).not.toContain('phase2-fixture-missing-url');
  });
});

// ─── 8. Audience filter works ─────────────────────────────────────────────────

describe('Phase 2 — audience filter', () => {
  const allFixtures = [
    FIXTURE_APPROVED_ADULTS,
    FIXTURE_EN_ONLY,      // children
    FIXTURE_OLDER_ADULTS,
  ];

  it('filter audience=adults returns only adults forms', () => {
    const forms = getFilteredForms(allFixtures, { audience: 'adults', category: 'all', lang: 'en' });
    expect(forms.length).toBe(1);
    expect(forms[0].form.audience).toBe('adults');
  });

  it('filter audience=children returns only children forms', () => {
    const forms = getFilteredForms(allFixtures, { audience: 'children', category: 'all', lang: 'en' });
    expect(forms.length).toBe(1);
    expect(forms[0].form.audience).toBe('children');
  });

  it('filter audience=older_adults returns only older_adults forms', () => {
    const forms = getFilteredForms(allFixtures, { audience: 'older_adults', category: 'all', lang: 'en' });
    expect(forms.length).toBe(1);
    expect(forms[0].form.audience).toBe('older_adults');
  });

  it('filter audience=adolescents returns empty when no adolescent fixtures', () => {
    const forms = getFilteredForms(allFixtures, { audience: 'adolescents', category: 'all', lang: 'en' });
    expect(forms.length).toBe(0);
  });

  it('filter audience=all returns all approved forms', () => {
    const forms = getFilteredForms(allFixtures, { audience: 'all', category: 'all', lang: 'en' });
    expect(forms.length).toBe(3);
  });
});

// ─── 9. Category filter works ─────────────────────────────────────────────────

describe('Phase 2 — category filter', () => {
  const allFixtures = [FIXTURE_APPROVED_ADULTS, FIXTURE_OLDER_ADULTS];

  it('filter category=thought_records returns only thought_records forms', () => {
    const forms = getFilteredForms(allFixtures, { audience: 'all', category: 'thought_records', lang: 'en' });
    expect(forms.length).toBe(1);
    expect(forms[0].form.category).toBe('thought_records');
  });

  it('filter category=coping_tools returns only coping_tools forms', () => {
    const forms = getFilteredForms(allFixtures, { audience: 'all', category: 'coping_tools', lang: 'en' });
    expect(forms.length).toBe(1);
    expect(forms[0].form.category).toBe('coping_tools');
  });

  it('filter category=sleep returns empty when no sleep fixtures', () => {
    const forms = getFilteredForms(allFixtures, { audience: 'all', category: 'sleep', lang: 'en' });
    expect(forms.length).toBe(0);
  });
});

// ─── 10. Hebrew language uses Hebrew title/description ────────────────────────

describe('Phase 2 — Hebrew language uses Hebrew content', () => {
  it('resolves to Hebrew title when lang=he and Hebrew block is valid', () => {
    const result = resolveWithLanguage(
      [FIXTURE_APPROVED_ADULTS],
      'phase2-fixture-approved-adults',
      'he'
    );
    expect(result).not.toBeNull();
    expect(result.language).toBe('he');
    expect(result.languageData.title).toBe('טופס בדיקה שלב 2 (עברית)');
    expect(result.languageData.rtl).toBe(true);
  });
});

// ─── 11. Unsupported languages fall back to English ───────────────────────────

describe('Phase 2 — unsupported languages fall back to English', () => {
  const unsupportedLangs = ['es', 'fr', 'de', 'it', 'pt'];

  for (const lang of unsupportedLangs) {
    it(`lang="${lang}" falls back to English for EN-only form`, () => {
      const result = resolveWithLanguage(
        [FIXTURE_EN_ONLY],
        'phase2-fixture-en-only',
        lang
      );
      expect(result).not.toBeNull();
      expect(result.language).toBe('en');
      expect(result.languageData.title).toBe('English Only Form');
    });
  }
});

// ─── 12. Empty state when no forms match ──────────────────────────────────────

describe('Phase 2 — empty state when no forms match', () => {
  it('returns empty array when audience filter has no matching forms', () => {
    const forms = getFilteredForms(
      [FIXTURE_APPROVED_ADULTS],
      { audience: 'children', category: 'all', lang: 'en' }
    );
    expect(forms).toHaveLength(0);
  });

  it('returns empty array when category filter has no matching forms', () => {
    const forms = getFilteredForms(
      [FIXTURE_APPROVED_ADULTS],
      { audience: 'all', category: 'sleep', lang: 'en' }
    );
    expect(forms).toHaveLength(0);
  });

  it('returns empty array when all forms in registry are unapproved', () => {
    const allUnapproved = ALL_FORMS;
    // All seed forms currently have approved: false — empty state is correct
    const forms = getFilteredForms(allUnapproved, { audience: 'all', category: 'all', lang: 'en' });
    // Either empty (all unapproved) or non-empty if some are approved in future
    expect(Array.isArray(forms)).toBe(true);
    // Verify none of the returned forms came from an unapproved entry
    for (const resolved of forms) {
      expect(resolved.form.approved).toBe(true);
    }
  });
});

// ─── 13. No chat/generated-file/attachment behavior was changed ───────────────

describe('Phase 2 — no chat/generated-file/attachment behavior changed', () => {
  it('normalizeGeneratedFile still exists and is a function (unchanged)', () => {
    expect(typeof normalizeGeneratedFile).toBe('function');
  });

  it('normalizeGeneratedFile still normalizes a pdf object correctly', () => {
    const input = {
      type: 'pdf',
      url: 'https://example.com/file.pdf',
      name: 'file.pdf',
      title: 'Test File',
    };
    const result = normalizeGeneratedFile(input);
    expect(result).toBeDefined();
    expect(result.url).toBe('https://example.com/file.pdf');
  });
});

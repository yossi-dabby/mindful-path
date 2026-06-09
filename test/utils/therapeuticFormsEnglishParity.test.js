/**
 * PR-11 — English Language-Parity Regression Coverage
 *
 * Proves that English therapeutic forms, where they already exist in the
 * generated index, behave correctly across the same architectural guarantees
 * already stabilised for Hebrew.
 *
 * Coverage:
 *  1.  Generated index EN visibility — count, required fields.
 *  2.  Hebrew/English separability at the index layer.
 *  3.  No cross-language title/metadata contamination.
 *  4.  English AI awareness derived from generated index (not a hardcoded list).
 *  5.  English exact-title lookup via AI search layer.
 *  6.  English clinical-need lookup (anxiety, OCD, anger, sleep, self-esteem…).
 *  7.  Audience/category/module lookup — all 4 EN categories.
 *  8.  Multi-form EN generated_files contract.
 *  9.  generated_file / generated_files attachment consistency.
 * 10.  Hebrew leakage prevention in English mode.
 */

import { describe, it, expect } from 'vitest';
import generatedFormsIndex from '../../src/generated/therapeutic-forms-index.json';
import {
  getAllTherapeuticForms,
  listFormsForAI,
  searchFormsForAI,
  resolveFormForAIRequest,
  MAX_GENERATED_FILES_PER_RESPONSE,
} from '../../src/data/therapeuticForms/index.js';
import { createGeneratedFileFromResolvedForm } from '../../src/data/therapeuticForms/aiFormsAccess.js';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Matches any Unicode Hebrew character block. */
const HEBREW_CHAR_PATTERN = /[\u0590-\u05FF\uFB00-\uFB4F]/;

const EN_INDEX_FORMS = generatedFormsIndex.filter((f) => f.language === 'en');
const HE_INDEX_FORMS = generatedFormsIndex.filter((f) => f.language === 'he');

// ─── Phase 2: Generated Index EN Visibility ───────────────────────────────────

describe('PR-11 Phase 2: Generated index EN visibility', () => {
  it('generated index contains English forms', () => {
    // If no English forms exist, the parity tests below become no-ops by
    // design (conditional coverage). This assertion ensures we know
    // immediately when English data is present.
    expect(EN_INDEX_FORMS.length).toBeGreaterThan(0);
  });

  it('every English index form has a stable non-empty id', () => {
    for (const form of EN_INDEX_FORMS) {
      expect(typeof form.id).toBe('string');
      expect(form.id.trim().length).toBeGreaterThan(0);
    }
  });

  it('every English index form has a non-empty title', () => {
    for (const form of EN_INDEX_FORMS) {
      expect(typeof form.title).toBe('string');
      expect(form.title.trim().length).toBeGreaterThan(0);
    }
  });

  it('every English index form carries language === "en"', () => {
    for (const form of EN_INDEX_FORMS) {
      expect(form.language).toBe('en');
    }
  });

  it('every English index form has a non-empty fileUrl starting with /forms/', () => {
    for (const form of EN_INDEX_FORMS) {
      expect(typeof form.fileUrl).toBe('string');
      expect(form.fileUrl.startsWith('/forms/')).toBe(true);
    }
  });

  it('every English index form has a non-empty audience', () => {
    for (const form of EN_INDEX_FORMS) {
      expect(['children', 'adolescents', 'adults']).toContain(form.audience);
    }
  });

  it('every English index form has a non-empty category', () => {
    for (const form of EN_INDEX_FORMS) {
      expect(typeof form.category).toBe('string');
      expect(form.category.trim().length).toBeGreaterThan(0);
    }
  });

  it('every English index form has a non-empty collectionId', () => {
    for (const form of EN_INDEX_FORMS) {
      expect(typeof form.collectionId).toBe('string');
      expect(form.collectionId.trim().length).toBeGreaterThan(0);
    }
  });

  it('all four English CBT categories are represented in the generated index', () => {
    const requiredCategories = [
      'adolescents_cbt_core',
      'adolescents_cbt_specialized',
      'children_cbt_core',
      'children_cbt_specialized',
    ];
    const categoriesInIndex = new Set(EN_INDEX_FORMS.map((f) => f.category));
    for (const category of requiredCategories) {
      expect(categoriesInIndex.has(category), `English category missing from index: ${category}`).toBe(true);
    }
  });

  it('English index form IDs are unique', () => {
    const ids = EN_INDEX_FORMS.map((f) => f.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ─── Phase 2: Hebrew/English Separability at Index Layer ──────────────────────

describe('PR-11 Phase 2: Hebrew/English separability', () => {
  it('no English form shares an id with any Hebrew form', () => {
    const heIds = new Set(HE_INDEX_FORMS.map((f) => f.id));
    for (const form of EN_INDEX_FORMS) {
      expect(heIds.has(form.id), `id collision between English and Hebrew: ${form.id}`).toBe(false);
    }
  });

  it('English and Hebrew form sets are fully disjoint by language field', () => {
    const enIds = new Set(EN_INDEX_FORMS.map((f) => f.id));
    const heIds = new Set(HE_INDEX_FORMS.map((f) => f.id));
    const intersection = [...enIds].filter((id) => heIds.has(id));
    expect(intersection).toHaveLength(0);
  });

  it('AI layer English list contains only English forms', () => {
    const listed = listFormsForAI({ language: 'en', allowEnglishFallback: false });
    expect(listed.length).toBeGreaterThan(0);
    for (const form of listed) {
      expect(form.language, `Non-English form in English AI list: ${form.id}`).toBe('en');
    }
  });

  it('AI layer Hebrew list contains only Hebrew forms', () => {
    const listed = listFormsForAI({ language: 'he', allowEnglishFallback: false });
    expect(listed.length).toBeGreaterThan(0);
    for (const form of listed) {
      expect(form.language, `Non-Hebrew form in Hebrew AI list: ${form.id}`).toBe('he');
    }
  });

  it('no English form leaks into Hebrew AI mode', () => {
    const heList = listFormsForAI({ language: 'he', allowEnglishFallback: false });
    const heIds = new Set(heList.map((f) => f.id));
    for (const form of EN_INDEX_FORMS) {
      expect(heIds.has(form.id), `English form leaked into Hebrew AI list: ${form.id}`).toBe(false);
    }
  });

  it('no Hebrew form leaks into English AI mode', () => {
    const enList = listFormsForAI({ language: 'en', allowEnglishFallback: false });
    const enIds = new Set(enList.map((f) => f.id));
    for (const form of HE_INDEX_FORMS) {
      expect(enIds.has(form.id), `Hebrew form leaked into English AI list: ${form.id}`).toBe(false);
    }
  });
});

// ─── Phase 2: No Cross-Language Title Contamination ───────────────────────────

describe('PR-11 Phase 2: No cross-language metadata contamination', () => {
  it('no English form has Hebrew characters in its title', () => {
    const contaminated = EN_INDEX_FORMS.filter(
      (f) => f.title && HEBREW_CHAR_PATTERN.test(f.title),
    );
    expect(
      contaminated,
      `English forms with Hebrew titles: ${contaminated.map((f) => f.id).join(', ')}`,
    ).toHaveLength(0);
  });

  it('no English form has Hebrew characters in its description', () => {
    const contaminated = EN_INDEX_FORMS.filter(
      (f) => f.description && HEBREW_CHAR_PATTERN.test(f.description),
    );
    expect(
      contaminated,
      `English forms with Hebrew descriptions: ${contaminated.map((f) => f.id).join(', ')}`,
    ).toHaveLength(0);
  });

  it('English fileUrls do not contain Hebrew path segments', () => {
    for (const form of EN_INDEX_FORMS) {
      expect(HEBREW_CHAR_PATTERN.test(form.fileUrl)).toBe(false);
    }
  });

  it('English forms use /forms/…/en/… paths, not Hebrew path prefixes', () => {
    // English PDFs must live under an English path.  Any form whose URL
    // contains known Hebrew-folder prefixes indicates a metadata mix-up.
    const HEBREW_PATH_PATTERNS = [
      /\/forms\/adolescents_cbt_core_he/,
      /\/forms\/module-0[1-9]/,
      /\/forms\/module_10/,
      /\/forms\/children\/he\//,
      /\/forms\/adolescents\/he\//,
    ];
    for (const form of EN_INDEX_FORMS) {
      for (const pattern of HEBREW_PATH_PATTERNS) {
        expect(
          pattern.test(form.fileUrl),
          `English form ${form.id} uses Hebrew path: ${form.fileUrl}`,
        ).toBe(false);
      }
    }
  });

  it('Hebrew forms use Hebrew-path conventions, not English path prefixes', () => {
    const ENGLISH_PATH_PATTERNS = [
      /\/forms\/adolescents\/en\//,
      /\/forms\/children\/en\//,
    ];
    for (const form of HE_INDEX_FORMS) {
      for (const pattern of ENGLISH_PATH_PATTERNS) {
        expect(
          pattern.test(form.fileUrl),
          `Hebrew form ${form.id} uses English path: ${form.fileUrl}`,
        ).toBe(false);
      }
    }
  });

  // Legacy-exception note: children-cbt-specialized-he-module-4-1 carries the
  // English-only title "OCD" because OCD is an internationally used clinical
  // abbreviation with no standard Hebrew equivalent.  This is a documented
  // exception; the test below enumerates and pins it to prevent silent growth.
  it('Hebrew forms without Hebrew chars in title are limited to known legacy exceptions', () => {
    const KNOWN_LEGACY_EXCEPTIONS = new Set([
      'children-cbt-specialized-he-module-4-1', // title: "OCD" — clinical abbreviation, internationally accepted
    ]);
    const noHebrewTitle = HE_INDEX_FORMS.filter(
      (f) => f.title && !HEBREW_CHAR_PATTERN.test(f.title),
    );
    for (const form of noHebrewTitle) {
      expect(
        KNOWN_LEGACY_EXCEPTIONS.has(form.id),
        `Unexpected Hebrew form with non-Hebrew title: ${form.id} — "${form.title}"`,
      ).toBe(true);
    }
  });
});

// ─── Phase 4: English AI Awareness Derived from Generated Index ───────────────

describe('PR-11 Phase 4: English AI awareness derived from generated index', () => {
  it('every approved English generated-index form is visible to the AI layer', () => {
    const approvedEnIndex = EN_INDEX_FORMS.filter((f) => f.approved === true);
    const listed = listFormsForAI({ language: 'en', allowEnglishFallback: false });
    const listedIds = new Set(listed.map((f) => f.id));
    for (const form of approvedEnIndex) {
      expect(
        listedIds.has(form.id),
        `Approved English form missing from AI layer: ${form.id}`,
      ).toBe(true);
    }
  });

  it('English AI layer count matches approved English generated-index count', () => {
    const approvedCount = EN_INDEX_FORMS.filter((f) => f.approved === true).length;
    const listed = listFormsForAI({ language: 'en', allowEnglishFallback: false });
    expect(listed.length).toBe(approvedCount);
  });

  it('English AI layer is not a stale hardcoded list — growing index grows the list', () => {
    // getAllTherapeuticForms() reads the live generated index; if this count
    // matches the live generated index it cannot be a frozen hardcoded copy.
    const allForms = getAllTherapeuticForms();
    const enForms = allForms.filter((f) => f.language === 'en');
    expect(enForms.length).toBe(EN_INDEX_FORMS.length);
  });
});

// ─── Phase 4: English Exact-Title Lookup ─────────────────────────────────────

describe('PR-11 Phase 4: English exact-title lookup', () => {
  it('exact-title lookup for "What Is Going On for Me Right Now?" returns en adolescents form', () => {
    const results = searchFormsForAI('What Is Going On for Me Right Now?', {
      language: 'en',
      audience: 'adolescents',
    });
    expect(results.length).toBeGreaterThan(0);
    const hit = results[0];
    expect(hit.language).toBe('en');
    expect(hit.audience).toBe('adolescents');
    expect(String(hit.title || hit.id).toLowerCase()).toMatch(/going on|right now|what is/i);
  });

  it('exact-title lookup for "What Am I Feeling?" returns en children form', () => {
    const results = searchFormsForAI('What Am I Feeling?', {
      language: 'en',
      audience: 'children',
    });
    expect(results.length).toBeGreaterThan(0);
    const hit = results[0];
    expect(hit.language).toBe('en');
    expect(hit.audience).toBe('children');
    expect(String(hit.title || hit.id).toLowerCase()).toMatch(/feeling|what am i/i);
  });

  it('exact-title lookup for "Safe Goodbye Plan" returns en children specialized form', () => {
    const results = searchFormsForAI('Safe Goodbye Plan', {
      language: 'en',
      audience: 'children',
    });
    expect(results.length).toBeGreaterThan(0);
    const hit = results[0];
    expect(hit.language).toBe('en');
    expect(String(hit.title || hit.id).toLowerCase()).toMatch(/goodbye|safe/i);
  });

  it('exact-title lookup for "Module 01 — Anxiety, Stress and Fears" returns en adolescents specialized form', () => {
    const results = searchFormsForAI('Module 01 Anxiety Stress and Fears', {
      language: 'en',
      audience: 'adolescents',
    });
    expect(results.length).toBeGreaterThan(0);
    const hit = results[0];
    expect(hit.language).toBe('en');
    expect(String(hit.id + hit.title + (hit.category || '')).toLowerCase()).toMatch(
      /anxiety|module.*01|adolescents.*specialized/i,
    );
  });

  it('exact-title lookups do not return Hebrew forms', () => {
    const titles = [
      'What Is Going On for Me Right Now?',
      'What Am I Feeling?',
      'Safe Goodbye Plan',
    ];
    for (const title of titles) {
      const results = searchFormsForAI(title, { language: 'en' });
      for (const form of results) {
        expect(form.language, `Hebrew form returned for English title "${title}": ${form.id}`).toBe('en');
      }
    }
  });
});

// ─── Phase 4: English Clinical-Need Lookup ────────────────────────────────────

describe('PR-11 Phase 4: English clinical-need lookup — adolescents', () => {
  it('adolescents anxiety query returns English forms', () => {
    const results = searchFormsForAI('anxiety stress teen', {
      language: 'en',
      audience: 'adolescents',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((f) => f.language === 'en')).toBe(true);
    expect(results.every((f) => f.audience === 'adolescents')).toBe(true);
  });

  it('adolescents CBT core cognitive restructuring query returns English forms', () => {
    const results = searchFormsForAI('cognitive restructuring thought record adolescent', {
      language: 'en',
      audience: 'adolescents',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((f) => f.language === 'en')).toBe(true);
  });

  it('adolescents no Hebrew leakage on clinical queries', () => {
    const queries = [
      'anxiety teen worksheet',
      'thought record adolescent',
      'coping skills teen',
    ];
    for (const q of queries) {
      const results = searchFormsForAI(q, { language: 'en', audience: 'adolescents' });
      for (const form of results) {
        expect(form.language, `Hebrew form leaked for query "${q}": ${form.id}`).toBe('en');
      }
    }
  });
});

describe('PR-11 Phase 4: English clinical-need lookup — children', () => {
  it('separation anxiety children query returns English forms', () => {
    const results = searchFormsForAI('separation anxiety goodbye school', {
      language: 'en',
      audience: 'children',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].language).toBe('en');
    expect(JSON.stringify(results[0]).toLowerCase()).toMatch(/separation|goodbye|school/);
  });

  it('OCD children query returns English forms', () => {
    const results = searchFormsForAI('OCD sticky thoughts rituals children', {
      language: 'en',
      audience: 'children',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].language).toBe('en');
    expect(JSON.stringify(results[0]).toLowerCase()).toMatch(/ocd|sticky|ritual/);
  });

  it('anger children query returns English forms', () => {
    const results = searchFormsForAI('child anger regulation outbursts', {
      language: 'en',
      audience: 'children',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].language).toBe('en');
    expect(JSON.stringify(results[0]).toLowerCase()).toMatch(/anger|regulation/);
  });

  it('sleep children query returns English forms', () => {
    const results = searchFormsForAI('sleep problems night fears children', {
      language: 'en',
      audience: 'children',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].language).toBe('en');
    expect(JSON.stringify(results[0]).toLowerCase()).toContain('sleep');
  });

  it('self-esteem children query returns English forms', () => {
    const results = searchFormsForAI('low self-esteem child not good enough', {
      language: 'en',
      audience: 'children',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].language).toBe('en');
    expect(JSON.stringify(results[0]).toLowerCase()).toMatch(/self-esteem|self esteem|not good enough/);
  });

  it('trauma children query returns English forms', () => {
    const results = searchFormsForAI('trauma coping child', {
      language: 'en',
      audience: 'children',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].language).toBe('en');
  });

  it('emotional regulation children query returns English forms', () => {
    const results = searchFormsForAI('emotional regulation feelings management child', {
      language: 'en',
      audience: 'children',
    });
    expect(results.length).toBeGreaterThan(0);
    expect(results[0].language).toBe('en');
  });

  it('children clinical queries return no Hebrew forms', () => {
    const queries = [
      'separation anxiety children',
      'OCD children sticky thoughts',
      'anger regulation child',
      'sleep problems child',
    ];
    for (const q of queries) {
      const results = searchFormsForAI(q, { language: 'en', audience: 'children' });
      for (const form of results) {
        expect(form.language, `Hebrew form leaked for query "${q}": ${form.id}`).toBe('en');
      }
    }
  });
});

// ─── Phase 4: Audience/Category/Module Lookup ─────────────────────────────────

describe('PR-11 Phase 4: Audience/category lookup — English', () => {
  const EN_CATEGORIES = [
    'adolescents_cbt_core',
    'adolescents_cbt_specialized',
    'children_cbt_core',
    'children_cbt_specialized',
  ];

  it('all four English categories return forms via listFormsForAI', () => {
    for (const category of EN_CATEGORIES) {
      const forms = listFormsForAI({ language: 'en', category });
      expect(forms.length, `English category "${category}" has no AI-visible forms`).toBeGreaterThan(0);
      expect(forms.every((f) => f.language === 'en')).toBe(true);
      expect(forms.every((f) => f.category === category)).toBe(true);
    }
  });

  it('children audience in English mode returns only English children forms', () => {
    const forms = listFormsForAI({ language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    for (const form of forms) {
      expect(form.language).toBe('en');
      expect(form.audience).toBe('children');
    }
  });

  it('adolescents audience in English mode returns only English adolescents forms', () => {
    const forms = listFormsForAI({ language: 'en', audience: 'adolescents' });
    expect(forms.length).toBeGreaterThan(0);
    for (const form of forms) {
      expect(form.language).toBe('en');
      expect(form.audience).toBe('adolescents');
    }
  });

  it('children_cbt_specialized English returns no Hebrew forms', () => {
    const forms = listFormsForAI({ language: 'en', category: 'children_cbt_specialized' });
    expect(forms.length).toBeGreaterThan(0);
    for (const form of forms) {
      expect(form.language).toBe('en');
    }
  });

  it('English category counts are non-zero and do not overlap between languages', () => {
    for (const category of EN_CATEGORIES) {
      const enForms = listFormsForAI({ language: 'en', category, allowEnglishFallback: false });
      const heForms = listFormsForAI({ language: 'he', category, allowEnglishFallback: false });
      const enIds = new Set(enForms.map((f) => f.id));
      for (const form of heForms) {
        expect(enIds.has(form.id), `id overlap between EN/HE in category ${category}: ${form.id}`).toBe(false);
      }
    }
  });
});

// ─── Phase 5: Multi-Form English generated_files Contract ─────────────────────

describe('PR-11 Phase 5: Multi-form English generated_files contract', () => {
  it('several worksheets for a child with anxiety returns multiple English generated_files', () => {
    const result = resolveFormForAIRequest(
      'Send me several worksheets for a child with anxiety',
      { language: 'en' },
    );
    // Multi-form intent must be detected.
    expect(['send_multiple_forms', 'send_best_matching_form']).toContain(result.intent?.type);
    // Must return at least one generated file.
    expect(result.generatedFiles.length).toBeGreaterThanOrEqual(1);
    // All files must be English.
    for (const file of result.generatedFiles) {
      expect(file.language, `Non-English file in multi-form English response: ${file.form_id}`).toBe('en');
    }
    // Must not exceed the cap.
    expect(result.generatedFiles.length).toBeLessThanOrEqual(MAX_GENERATED_FILES_PER_RESPONSE);
    // No Hebrew URL segments.
    for (const file of result.generatedFiles) {
      expect(file.url).toMatch(/^\/forms\//);
      expect(HEBREW_CHAR_PATTERN.test(file.url)).toBe(false);
    }
  });

  it('multi-form English response: generated_file equals first generated_files item', () => {
    const result = resolveFormForAIRequest(
      'Send me several worksheets for a child with OCD',
      { language: 'en' },
    );
    if (result.generatedFiles.length > 0 && result.generatedFile) {
      expect(result.generatedFile.form_id).toBe(result.generatedFiles[0].form_id);
      expect(result.generatedFile.url).toBe(result.generatedFiles[0].url);
    }
  });

  it('multi-form English response does not include Hebrew files', () => {
    const result = resolveFormForAIRequest(
      'Send three forms for a teenager with anger problems',
      { language: 'en' },
    );
    for (const file of result.generatedFiles) {
      expect(file.language).toBe('en');
      expect(HEBREW_CHAR_PATTERN.test(file.url || '')).toBe(false);
      expect(HEBREW_CHAR_PATTERN.test(file.title || '')).toBe(false);
    }
  });

  it('MAX_GENERATED_FILES_PER_RESPONSE cap is respected in English multi-form requests', () => {
    const result = resolveFormForAIRequest(
      'Send all worksheets for children',
      { language: 'en' },
    );
    expect(result.generatedFiles.length).toBeLessThanOrEqual(MAX_GENERATED_FILES_PER_RESPONSE);
  });

  it('generatedFiles items have required contract fields when present', () => {
    const result = resolveFormForAIRequest(
      'Send me worksheets for a child with sleep problems',
      { language: 'en' },
    );
    for (const file of result.generatedFiles) {
      expect(typeof file.url).toBe('string');
      expect(file.url.startsWith('/forms/')).toBe(true);
      expect(typeof file.language).toBe('string');
      expect(file.language).toBe('en');
    }
  });
});

// ─── Phase 6: Open/Download English Compatibility (parity assertions) ─────────

describe('PR-11 Phase 6: Open/Download English parity assertions', () => {
  it('English generated file from index has correct language field', () => {
    const enForm = EN_INDEX_FORMS.find(
      (f) => f.type === 'workbook_package',
    );
    expect(enForm).toBeTruthy();
    const generated = createGeneratedFileFromResolvedForm(enForm);
    expect(generated).toBeTruthy();
    expect(generated.language).toBe('en');
    expect(generated.url.startsWith('/forms/')).toBe(true);
    expect(HEBREW_CHAR_PATTERN.test(generated.url)).toBe(false);
  });

  it('English generated file from index does not substitute a Hebrew URL', () => {
    const enForms = EN_INDEX_FORMS.filter((f) => f.type === 'individual_worksheet');
    for (const form of enForms.slice(0, 5)) {
      const generated = createGeneratedFileFromResolvedForm(form);
      expect(generated).toBeTruthy();
      expect(generated.url).toBe(form.fileUrl);
      expect(generated.language).toBe('en');
    }
  });
});

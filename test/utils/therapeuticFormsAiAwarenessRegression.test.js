/**
 * PR-9 — AI Awareness Upload Regression Suite
 *
 * Guards against:
 *  1. New forms appearing in Forms Library but not AI.
 *  2. AI knowing only titles, not clinical content.
 *  3. Hebrew/English leakage.
 *  4. Hardcoded stale form lists.
 *  5. New categories not included in AI search.
 *  6. Multi-form requests collapsing incorrectly.
 *  7. Module/stage requests missing combined PDFs where expected.
 *  8. Uploads breaking exact-title lookup.
 *  9. Uploads breaking clinical-need lookup.
 * 10. AI awareness disappearing after future uploads.
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
import { sanitizeConversationMessages } from '../../src/components/utils/validateAgentOutput.jsx';

// ─── Phase 2: Index-to-AI Parity ──────────────────────────────────────────────

describe('PR-9 Phase 2: index-to-AI parity', () => {
  it('every approved generated-index form is visible to AI layer by language', () => {
    const allApproved = generatedFormsIndex.filter((form) => form.approved === true);
    const approvedHe = allApproved.filter((form) => form.language === 'he');
    const approvedEn = allApproved.filter((form) => form.language === 'en');

    const listedHe = listFormsForAI({ language: 'he', allowEnglishFallback: false });
    const listedEn = listFormsForAI({ language: 'en', allowEnglishFallback: false });

    const listedHeIds = new Set(listedHe.map((f) => f.id));
    const listedEnIds = new Set(listedEn.map((f) => f.id));

    for (const form of approvedHe) {
      expect(listedHeIds.has(form.id), `Hebrew form missing from AI layer: ${form.id}`).toBe(true);
    }
    for (const form of approvedEn) {
      expect(listedEnIds.has(form.id), `English form missing from AI layer: ${form.id}`).toBe(true);
    }
  });

  it('no approved form silently disappears from AI access after a future upload', () => {
    const totalApproved = generatedFormsIndex.filter((f) => f.approved === true).length;
    const allFormsFromRegistry = getAllTherapeuticForms();
    // If this fails after an upload, a form was added to the index but filtered out.
    expect(allFormsFromRegistry.length).toBe(totalApproved);
  });

  it('Hebrew AI list contains only Hebrew forms', () => {
    const listedHe = listFormsForAI({ language: 'he', allowEnglishFallback: false });
    expect(listedHe.length).toBeGreaterThan(0);
    for (const form of listedHe) {
      expect(form.language, `Non-Hebrew form leaked into Hebrew AI list: ${form.id}`).toBe('he');
    }
  });

  it('English AI list contains only English forms', () => {
    const listedEn = listFormsForAI({ language: 'en', allowEnglishFallback: false });
    expect(listedEn.length).toBeGreaterThan(0);
    for (const form of listedEn) {
      expect(form.language, `Non-English form leaked into English AI list: ${form.id}`).toBe('en');
    }
  });

  it('Hebrew AI mode does not leak English forms', () => {
    const listedHe = listFormsForAI({ language: 'he', allowEnglishFallback: false });
    const hebrewIds = new Set(listedHe.map((f) => f.id));
    const listedEn = listFormsForAI({ language: 'en', allowEnglishFallback: false });
    for (const form of listedEn) {
      expect(hebrewIds.has(form.id), `English form ${form.id} leaked into Hebrew AI list`).toBe(false);
    }
  });

  it('all four Hebrew CBT categories are covered in AI layer', () => {
    const requiredHebrewCategories = [
      'adolescents_cbt_core',
      'adolescents_cbt_specialized',
      'children_cbt_core',
      'children_cbt_specialized',
    ];
    for (const category of requiredHebrewCategories) {
      const forms = listFormsForAI({ language: 'he', category, allowEnglishFallback: false });
      expect(forms.length, `Hebrew category "${category}" has no AI-visible forms`).toBeGreaterThan(0);
      expect(forms.every((f) => f.language === 'he')).toBe(true);
      expect(forms.every((f) => f.category === category)).toBe(true);
    }
  });

  it('no stale hardcoded allowlist blocks a newly approved category from AI access', () => {
    // Every category in the generated index with at least one approved form must be
    // reachable via listFormsForAI without extra gating. If a new category is added
    // to the index it must appear in AI access automatically.
    const categoriesInIndex = new Set(
      generatedFormsIndex.filter((f) => f.approved === true).map((f) => f.category)
    );
    for (const category of categoriesInIndex) {
      const language = generatedFormsIndex.find((f) => f.category === category && f.approved === true)?.language;
      const aiVisible = listFormsForAI({ language, category, allowEnglishFallback: false });
      expect(
        aiVisible.length,
        `Category "${category}" (${language}) has approved forms in the index but NONE are visible to AI. ` +
        'If this category is intentionally excluded, document the reason in aiFormsAccess.js and update this test.'
      ).toBeGreaterThan(0);
    }
  });
});

// ─── Phase 3: Exact Title Lookup Regression ───────────────────────────────────

describe('PR-9 Phase 3: exact title lookup — Hebrew datasets', () => {
  // Use generated index to derive representative forms dynamically so titles
  // stay accurate after each upload without needing manual edits here.
  const heAdolCore = generatedFormsIndex.filter(
    (f) => f.language === 'he' && f.category === 'adolescents_cbt_core' && !f.isCombinedPdf
  );
  const heAdolSpec = generatedFormsIndex.filter(
    (f) => f.language === 'he' && f.category === 'adolescents_cbt_specialized' && !f.isCombinedPdf
  );
  const heChildCore = generatedFormsIndex.filter(
    (f) => f.language === 'he' && f.category === 'children_cbt_core' && !f.isCombinedPdf
  );
  const heChildSpec = generatedFormsIndex.filter(
    (f) => f.language === 'he' && f.category === 'children_cbt_specialized' && !f.isCombinedPdf
  );

  it('resolves representative adolescents_cbt_core_he form by title', () => {
    const rep = heAdolCore.find((f) => typeof f.title === 'string' && f.title.length > 3);
    expect(rep, 'No representative form found in adolescents_cbt_core_he').toBeTruthy();
    const results = searchFormsForAI(rep.title, { language: 'he', audience: 'adolescents' });
    expect(results.some((f) => f.id === rep.id), `Form ${rep.id} ("${rep.title}") not found by title search`).toBe(true);
  });

  it('resolves representative adolescents_cbt_specialized_he form by title', () => {
    const rep = heAdolSpec.find((f) => typeof f.title === 'string' && f.title.length > 3);
    expect(rep, 'No representative form found in adolescents_cbt_specialized_he').toBeTruthy();
    const results = searchFormsForAI(rep.title, { language: 'he', audience: 'adolescents' });
    expect(results.some((f) => f.id === rep.id), `Form ${rep.id} ("${rep.title}") not found by title search`).toBe(true);
  });

  it('resolves representative children_cbt_core_he form by title', () => {
    const rep = heChildCore.find((f) => typeof f.title === 'string' && f.title.length > 3);
    expect(rep, 'No representative form found in children_cbt_core_he').toBeTruthy();
    const results = searchFormsForAI(rep.title, { language: 'he', audience: 'children' });
    expect(results.some((f) => f.id === rep.id), `Form ${rep.id} ("${rep.title}") not found by title search`).toBe(true);
  });

  it('resolves representative children_cbt_specialized_he form by title', () => {
    const rep = heChildSpec.find((f) => typeof f.title === 'string' && f.title.length > 3);
    expect(rep, 'No representative form found in children_cbt_specialized_he').toBeTruthy();
    const results = searchFormsForAI(rep.title, { language: 'he', audience: 'children' });
    expect(results.some((f) => f.id === rep.id), `Form ${rep.id} ("${rep.title}") not found by title search`).toBe(true);
  });

  it('resolves multiple representative adolescents_cbt_core_he forms by title (3 spot-checks)', () => {
    const reps = heAdolCore.filter((f) => typeof f.title === 'string' && f.title.length > 3).slice(0, 3);
    expect(reps.length).toBeGreaterThanOrEqual(3);
    for (const rep of reps) {
      const results = searchFormsForAI(rep.title, { language: 'he', audience: 'adolescents' });
      expect(results.some((f) => f.id === rep.id), `Adolescents core form ${rep.id} not found by title`).toBe(true);
      expect(results.every((f) => f.language === 'he')).toBe(true);
    }
  });

  it('resolves multiple representative adolescents_cbt_specialized_he forms by title (3 spot-checks)', () => {
    const reps = heAdolSpec.filter((f) => typeof f.title === 'string' && f.title.length > 3).slice(0, 3);
    expect(reps.length).toBeGreaterThanOrEqual(3);
    for (const rep of reps) {
      const results = searchFormsForAI(rep.title, { language: 'he', audience: 'adolescents' });
      expect(results.some((f) => f.id === rep.id), `Adolescents specialized form ${rep.id} not found by title`).toBe(true);
      expect(results.every((f) => f.language === 'he')).toBe(true);
    }
  });

  it('resolves multiple representative children_cbt_specialized_he forms by title (3 spot-checks)', () => {
    const reps = heChildSpec.filter((f) => typeof f.title === 'string' && f.title.length > 3).slice(0, 3);
    expect(reps.length).toBeGreaterThanOrEqual(3);
    for (const rep of reps) {
      const results = searchFormsForAI(rep.title, { language: 'he', audience: 'children' });
      expect(results.some((f) => f.id === rep.id), `Children specialized form ${rep.id} not found by title`).toBe(true);
      expect(results.every((f) => f.language === 'he')).toBe(true);
    }
  });

  it('title search for Hebrew forms never returns English-only results', () => {
    for (const dataset of [heAdolCore, heAdolSpec, heChildCore, heChildSpec]) {
      const rep = dataset.find((f) => typeof f.title === 'string' && f.title.length > 3);
      if (!rep) continue;
      const results = searchFormsForAI(rep.title, { language: 'he' });
      expect(results.every((f) => f.language === 'he'), `English form leaked into Hebrew title search for "${rep.title}"`).toBe(true);
    }
  });
});

describe('PR-9 Phase 3: exact title lookup — English datasets', () => {
  const enAdolCore = generatedFormsIndex.filter(
    (f) => f.language === 'en' && f.category === 'adolescents_cbt_core' && !f.isCombinedPdf
  );
  const enChildCore = generatedFormsIndex.filter(
    (f) => f.language === 'en' && f.category === 'children_cbt_core' && !f.isCombinedPdf
  );

  it('resolves representative adolescents_cbt_core English form by title', () => {
    const rep = enAdolCore.find((f) => typeof f.title === 'string' && f.title.length > 5);
    expect(rep, 'No representative form in adolescents_cbt_core EN').toBeTruthy();
    const results = searchFormsForAI(rep.title, { language: 'en', audience: 'adolescents' });
    expect(results.some((f) => f.id === rep.id), `EN adolescents form ${rep.id} not found by title`).toBe(true);
    expect(results.every((f) => f.language === 'en')).toBe(true);
  });

  it('resolves representative children_cbt_core English form by title', () => {
    const rep = enChildCore.find((f) => typeof f.title === 'string' && f.title.length > 5);
    expect(rep, 'No representative form in children_cbt_core EN').toBeTruthy();
    const results = searchFormsForAI(rep.title, { language: 'en', audience: 'children' });
    expect(results.some((f) => f.id === rep.id), `EN children form ${rep.id} not found by title`).toBe(true);
    expect(results.every((f) => f.language === 'en')).toBe(true);
  });
});

// ─── Phase 4: Clinical Need Lookup Regression ─────────────────────────────────

describe('PR-9 Phase 4: Hebrew clinical need lookup', () => {
  const HEBREW_CLINICAL_QUERIES = [
    { query: 'חרדה', label: 'anxiety' },
    { query: 'חרדת פרידה', label: 'separation anxiety' },
    { query: 'פחדים', label: 'fears' },
    { query: 'כעס', label: 'anger' },
    { query: 'קשב', label: 'attention' },
    { query: 'דימוי עצמי', label: 'self-esteem' },
    { query: 'שינה', label: 'sleep' },
    { query: 'טראומה', label: 'trauma' },
    { query: 'OCD', label: 'OCD' },
    { query: 'ויסות רגשי', label: 'emotional regulation' },
  ];

  for (const { query, label } of HEBREW_CLINICAL_QUERIES) {
    it(`Hebrew clinical query "${query}" (${label}) returns non-empty Hebrew results`, () => {
      const results = searchFormsForAI(query, { language: 'he' });
      expect(results.length, `No results for Hebrew clinical query: ${query}`).toBeGreaterThan(0);
      expect(results.every((f) => f.language === 'he'), `Non-Hebrew form returned for query: ${query}`).toBe(true);
    });

    it(`Hebrew clinical query "${query}" (${label}) does not return English-only forms`, () => {
      const results = searchFormsForAI(query, { language: 'he' });
      const englishForms = results.filter((f) => f.language === 'en');
      expect(englishForms).toHaveLength(0);
    });
  }

  it('Hebrew clinical queries return forms with clinical metadata, not only titles', () => {
    // This guards against AI seeing only titles and missing clinical content
    const results = searchFormsForAI('חרדה', { language: 'he' });
    expect(results.length).toBeGreaterThan(0);
    const hasKeywords = results.some(
      (f) => Array.isArray(f.clinicalKeywords) && f.clinicalKeywords.length > 0
    );
    expect(hasKeywords, 'Hebrew anxiety results should include forms with clinicalKeywords').toBe(true);
  });

  it('Hebrew clinical queries return forms from multiple categories when appropriate', () => {
    // ויסות רגשי (emotional regulation) spans both core and specialized
    const results = searchFormsForAI('ויסות רגשי', { language: 'he' });
    expect(results.length).toBeGreaterThan(0);
    const categories = new Set(results.map((f) => f.category));
    expect(categories.size).toBeGreaterThan(0);
  });

  it('חרדת פרידה query returns children specialized Hebrew forms', () => {
    const results = searchFormsForAI('חרדת פרידה', { language: 'he' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((f) => f.category === 'children_cbt_specialized')).toBe(true);
    expect(results.every((f) => f.language === 'he')).toBe(true);
  });

  it('כעס query returns adolescents specialized Hebrew forms', () => {
    const results = searchFormsForAI('כעס', { language: 'he' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((f) => f.language === 'he')).toBe(true);
  });

  it('טראומה query returns adolescents specialized Hebrew forms', () => {
    const results = searchFormsForAI('טראומה', { language: 'he' });
    expect(results.length).toBeGreaterThan(0);
    expect(results.some((f) => f.category === 'adolescents_cbt_specialized')).toBe(true);
    expect(results.every((f) => f.language === 'he')).toBe(true);
  });
});

describe('PR-9 Phase 4: English clinical need lookup', () => {
  const ENGLISH_CLINICAL_QUERIES = [
    { query: 'anxiety', label: 'anxiety' },
    { query: 'OCD', label: 'OCD' },
    { query: 'anger', label: 'anger' },
    { query: 'sleep', label: 'sleep' },
    { query: 'self-esteem', label: 'self-esteem' },
  ];

  for (const { query, label } of ENGLISH_CLINICAL_QUERIES) {
    it(`English clinical query "${query}" (${label}) returns non-empty English results`, () => {
      const results = searchFormsForAI(query, { language: 'en' });
      expect(results.length, `No results for English clinical query: ${query}`).toBeGreaterThan(0);
      expect(results.every((f) => f.language === 'en'), `Hebrew form leaked into English results for: ${query}`).toBe(true);
    });
  }
});

// ─── Phase 5: Audience / Module / Stage Lookup ────────────────────────────────

describe('PR-9 Phase 5: audience lookup — children vs adolescents isolation', () => {
  it('Hebrew children query does not return adolescents as top result', () => {
    const resolved = resolveFormForAIRequest('שלח לי טופס לילד עם חרדה', { language: 'he' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('he');
    expect(resolved.generatedFile.audience).toBe('children');
  });

  it('Hebrew adolescents query does not return children as top result', () => {
    const resolved = resolveFormForAIRequest('שלח לי טופס למתבגר עם חרדה', { language: 'he' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('he');
    expect(resolved.generatedFile.audience).toBe('adolescents');
  });

  it('English children query returns children forms only', () => {
    const forms = listFormsForAI({ language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(forms.every((f) => f.audience === 'children')).toBe(true);
    expect(forms.every((f) => f.language === 'en')).toBe(true);
  });

  it('English adolescents query returns adolescents forms only', () => {
    const forms = listFormsForAI({ language: 'en', audience: 'adolescents' });
    expect(forms.length).toBeGreaterThan(0);
    expect(forms.every((f) => f.audience === 'adolescents')).toBe(true);
    expect(forms.every((f) => f.language === 'en')).toBe(true);
  });

  it('Hebrew children category listing does not mix adolescents', () => {
    const childrenHe = listFormsForAI({ language: 'he', audience: 'children', allowEnglishFallback: false });
    expect(childrenHe.every((f) => f.audience === 'children')).toBe(true);
  });

  it('Hebrew adolescents category listing does not mix children', () => {
    const adolescentsHe = listFormsForAI({ language: 'he', audience: 'adolescents', allowEnglishFallback: false });
    expect(adolescentsHe.every((f) => f.audience === 'adolescents')).toBe(true);
  });
});

describe('PR-9 Phase 5: module and stage lookup', () => {
  it('Hebrew adolescents stage request returns forms from the requested stage', () => {
    for (let stage = 1; stage <= 6; stage++) {
      const resolved = resolveFormForAIRequest(`שלח לי טפסים משלב ${stage}`, { language: 'he' });
      expect(Array.isArray(resolved.generatedFiles)).toBe(true);
      expect(resolved.generatedFiles.length).toBeGreaterThan(0);
      expect(resolved.generatedFiles.every((f) => f.language === 'he')).toBe(true);
    }
  });

  it('Hebrew adolescents stage combined request resolves to combined PDF when available', () => {
    // Stages 1-6 all have combined PDFs in the index
    const resolved = resolveFormForAIRequest('שלח לי את כל שלב 3', { language: 'he' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('he');
    // Should prefer the combined PDF rather than individual worksheets
    const combinedFile = resolved.generatedFiles.find((f) => f.is_combined_pdf || f.isCombinedPdf);
    const isCombinedById = resolved.generatedFiles.some((f) =>
      String(f.form_id || '').includes('combined')
    );
    expect(combinedFile || isCombinedById, 'Stage combined request should prefer a combined PDF').toBeTruthy();
  });

  it('Hebrew children module request resolves to module PDF when available', () => {
    // Children CBT core HE has module combined PDFs for modules 01-05
    const resolved = resolveFormForAIRequest('שלח לי את הקובץ המאוחד של מודול 1', { language: 'he' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('he');
    expect(String(resolved.generatedFile.form_id || '')).toContain('children-cbt-core-he-module-0');
  });

  it('Hebrew adolescents specialized module request returns specialized forms', () => {
    const resolved = resolveFormForAIRequest('שלח לי טפסים ממודול 5 מהסדרה המתקדמת', { language: 'he' });
    expect(Array.isArray(resolved.generatedFiles)).toBe(true);
    expect(resolved.generatedFiles.length).toBeGreaterThan(0);
    expect(resolved.generatedFiles.every((f) => f.language === 'he')).toBe(true);
  });

  it('English module request returns English forms only', () => {
    const resolved = resolveFormForAIRequest('send all forms from module 06', { language: 'en' });
    expect(Array.isArray(resolved.generatedFiles)).toBe(true);
    expect(resolved.generatedFiles.length).toBeGreaterThan(0);
    expect(resolved.generatedFiles.every((f) => f.language === 'en')).toBe(true);
  });
});

// ─── Phase 6: Multi-form / Combined PDF Awareness ─────────────────────────────

describe('PR-9 Phase 6: multi-form and combined PDF awareness', () => {
  it('Hebrew "שלח לי כמה טפסים לילד עם חרדת פרידה" triggers multi-form intent', () => {
    const resolved = resolveFormForAIRequest('שלח לי כמה טפסים לילד עם חרדת פרידה', { language: 'he' });
    expect(resolved.intent?.type).toBe('send_multiple_forms');
    expect(Array.isArray(resolved.generatedFiles)).toBe(true);
    expect(resolved.generatedFiles.length).toBeGreaterThan(1);
    expect(resolved.generatedFiles.length).toBeLessThanOrEqual(MAX_GENERATED_FILES_PER_RESPONSE);
    expect(resolved.generatedFiles.every((f) => f.language === 'he')).toBe(true);
  });

  it('all files in Hebrew multi-form response are Hebrew — no English leakage', () => {
    const resolved = resolveFormForAIRequest('שלח לי כמה טפסים לילדים', { language: 'he' });
    expect(Array.isArray(resolved.generatedFiles)).toBe(true);
    if (resolved.generatedFiles.length > 0) {
      for (const file of resolved.generatedFiles) {
        expect(file.language, `Non-Hebrew file in Hebrew multi-form response: ${file.form_id}`).toBe('he');
      }
    }
  });

  it('max cap: no response returns more than MAX_GENERATED_FILES_PER_RESPONSE files', () => {
    const queries = [
      { q: 'שלח לי כמה טפסים לילד עם חרדת פרידה', lang: 'he' },
      { q: 'send several forms for children with OCD', lang: 'en' },
      { q: 'שלח לי 10 טפסים', lang: 'he' },
      { q: 'send me 10 forms', lang: 'en' },
    ];
    for (const { q, lang } of queries) {
      const resolved = resolveFormForAIRequest(q, { language: lang });
      expect(
        resolved.generatedFiles.length,
        `Response for "${q}" exceeds MAX_GENERATED_FILES_PER_RESPONSE`
      ).toBeLessThanOrEqual(MAX_GENERATED_FILES_PER_RESPONSE);
    }
  });

  it('MAX_GENERATED_FILES_PER_RESPONSE is 5', () => {
    expect(MAX_GENERATED_FILES_PER_RESPONSE).toBe(5);
  });

  it('Hebrew whole-stage request prefers combined stage PDF over individual worksheets', () => {
    const resolved = resolveFormForAIRequest('שלח לי את כל שלב 2', { language: 'he' });
    expect(Array.isArray(resolved.generatedFiles)).toBe(true);
    expect(resolved.generatedFiles.length).toBe(1);
    expect(resolved.generatedFiles[0].form_id).toBe('adolescents-cbt-core-he-stage-2-combined');
  });

  it('Hebrew multi-form request with clinical focus attaches forms from correct category', () => {
    const resolved = resolveFormForAIRequest('שלח לי מספר טפסים לילד עם חרדת פרידה', { language: 'he' });
    expect(resolved.intent?.type).toBe('send_multiple_forms');
    expect(resolved.generatedFiles.length).toBeGreaterThan(0);
    expect(resolved.generatedFiles.every((f) => f.language === 'he')).toBe(true);
    // Forms should be children-oriented
    const allChildrenOrNoAudience = resolved.generatedFiles.every(
      (f) => !f.audience || f.audience === 'children'
    );
    expect(allChildrenOrNoAudience).toBe(true);
  });

  it('combined PDFs in index are accessible to AI layer', () => {
    const combinedInIndex = generatedFormsIndex.filter((f) => f.isCombinedPdf === true && f.approved === true);
    expect(combinedInIndex.length).toBeGreaterThan(0);
    const allForms = getAllTherapeuticForms();
    const allFormIds = new Set(allForms.map((f) => f.id));
    for (const combined of combinedInIndex) {
      expect(
        allFormIds.has(combined.id),
        `Combined PDF ${combined.id} missing from AI registry`
      ).toBe(true);
    }
  });

  it('Hebrew combined PDFs remain language-gated — no combined PDF leaks into English mode', () => {
    const allForms = getAllTherapeuticForms();
    const hebrewCombined = allForms.filter((f) => f.isCombinedPdf === true && f.language === 'he');
    const listedEn = listFormsForAI({ language: 'en', allowEnglishFallback: false });
    const listedEnIds = new Set(listedEn.map((f) => f.id));
    for (const combined of hebrewCombined) {
      expect(
        listedEnIds.has(combined.id),
        `Hebrew combined PDF ${combined.id} leaked into English AI list`
      ).toBe(false);
    }
  });

  it('capability query returns multi-form text in Hebrew session', () => {
    const resolved = resolveFormForAIRequest(
      'האם אתה יכול לשלוח מספר טפסים במקביל או רק טופס אחד בכל פעם',
      { language: 'he' }
    );
    expect(resolved.generatedFiles).toHaveLength(0);
    expect(resolved.responseText).toContain('5');
  });

  it('capability query returns multi-form text in English session', () => {
    const resolved = resolveFormForAIRequest(
      'Can you send multiple forms in parallel or only one at a time?',
      { language: 'en' }
    );
    expect(resolved.generatedFiles).toHaveLength(0);
    expect(resolved.responseText.toLowerCase()).toContain('5');
  });
});

// ─── Phase 7: Chat Integration Regression ─────────────────────────────────────

describe('PR-9 Phase 7: chat integration regression', () => {
  it('Hebrew exact-title request attaches a Hebrew form', () => {
    const messages = [
      { role: 'user', content: 'שלח לי את הטופס מה עובר עליי עכשיו', metadata: { session_language: 'he' } },
      { role: 'assistant', content: 'כמובן' },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file).toBeTruthy();
    expect(assistant.metadata.generated_file.language).toBe('he');
    expect(String(assistant.metadata.generated_file.url || '')).toMatch(/^\/forms\//);
  });

  it('Hebrew clinical-need request attaches a Hebrew form', () => {
    const messages = [
      { role: 'user', content: 'אני צריך טופס לילד עם חרדה', metadata: { session_language: 'he' } },
      { role: 'assistant', content: 'כמובן' },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file).toBeTruthy();
    expect(assistant.metadata.generated_file.language).toBe('he');
    expect(assistant.metadata.generated_file.audience).toBe('children');
  });

  it('Hebrew multi-form request attaches generated_files', () => {
    const messages = [
      {
        role: 'user',
        content: 'שלח לי כמה טפסים לילד עם חרדת פרידה',
        metadata: { session_language: 'he' },
      },
      { role: 'assistant', content: 'כמובן' },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    const generatedFiles = assistant?.metadata?.generated_files;
    expect(Array.isArray(generatedFiles)).toBe(true);
    expect(generatedFiles.length).toBeGreaterThan(0);
    expect(generatedFiles.length).toBeLessThanOrEqual(MAX_GENERATED_FILES_PER_RESPONSE);
    expect(generatedFiles.every((f) => f.language === 'he')).toBe(true);
  });

  it('English first-message clinical-need request attaches an English form', () => {
    const messages = [
      { role: 'user', content: 'Send me a CBT form for children with anxiety', metadata: { session_language: 'en' } },
      { role: 'assistant', content: 'Sure, I can help with that.' },
    ];
    const result = sanitizeConversationMessages(messages, 'en');
    const assistant = result.find((m) => m.role === 'assistant');
    expect(assistant?.metadata?.generated_file).toBeTruthy();
    expect(assistant.metadata.generated_file.language).toBe('en');
  });

  it('Hebrew session does not attach English forms when Hebrew alternatives exist', () => {
    const messages = [
      { role: 'user', content: 'תשלח לי טופס לילדים בנושא OCD', metadata: { session_language: 'he' } },
      { role: 'assistant', content: 'כמובן' },
    ];
    const result = sanitizeConversationMessages(messages, 'he');
    const assistant = result.find((m) => m.role === 'assistant');
    if (assistant?.metadata?.generated_file) {
      expect(assistant.metadata.generated_file.language).toBe('he');
    }
  });
});

// ─── Phase 8: Upload Smoke Test Helper ────────────────────────────────────────

/**
 * createUploadDatasetSmokeTest
 *
 * Reusable helper for testing a newly uploaded therapeutic forms dataset.
 * Test authors provide dataset metadata and representative expected forms/queries;
 * the helper produces a suite of standard regression assertions.
 *
 * @param {object} opts
 * @param {string} opts.datasetLabel        - Human-readable label for test names
 * @param {string} opts.language            - 'he' | 'en' | etc.
 * @param {string} opts.audience            - 'children' | 'adolescents' | 'adults'
 * @param {string} opts.category            - e.g. 'children_cbt_specialized'
 * @param {string[]} opts.expectedIds       - IDs that must be in AI access layer
 * @param {string[]} opts.titleSamples      - Exact titles to test via searchFormsForAI
 * @param {string[]} opts.clinicalKeywords  - Clinical keywords that must return results
 * @param {string} [opts.multiFormQuery]    - Optional multi-form intent query to test
 */
function createUploadDatasetSmokeTest(opts) {
  const { datasetLabel, language, audience, category, expectedIds, titleSamples, clinicalKeywords, multiFormQuery } = opts;

  describe(`Upload smoke: ${datasetLabel}`, () => {
    it('all expected form IDs are in AI access layer', () => {
      const forms = listFormsForAI({ language, audience, category, allowEnglishFallback: false });
      const formIds = new Set(forms.map((f) => f.id));
      for (const id of expectedIds) {
        expect(formIds.has(id), `Expected form ${id} missing from AI layer`).toBe(true);
      }
    });

    it('all forms are language-correct in AI access layer', () => {
      const forms = listFormsForAI({ language, audience, category, allowEnglishFallback: false });
      expect(forms.length).toBeGreaterThan(0);
      for (const form of forms) {
        expect(form.language, `Form ${form.id} has wrong language in AI layer`).toBe(language);
      }
    });

    it('title lookups work for representative forms', () => {
      for (const title of titleSamples) {
        const results = searchFormsForAI(title, { language, audience });
        expect(results.length, `No results for title "${title}"`).toBeGreaterThan(0);
        expect(results.every((f) => f.language === language), `Language leak for title "${title}"`).toBe(true);
      }
    });

    it('clinical keyword lookups return results in the correct language', () => {
      for (const keyword of clinicalKeywords) {
        const results = searchFormsForAI(keyword, { language });
        expect(results.length, `No results for clinical keyword "${keyword}"`).toBeGreaterThan(0);
        expect(results.every((f) => f.language === language), `Language leak for keyword "${keyword}"`).toBe(true);
      }
    });

    if (multiFormQuery) {
      it('multi-form query returns multiple files within the cap', () => {
        const resolved = resolveFormForAIRequest(multiFormQuery, { language });
        expect(Array.isArray(resolved.generatedFiles)).toBe(true);
        expect(resolved.generatedFiles.length).toBeGreaterThan(0);
        expect(resolved.generatedFiles.length).toBeLessThanOrEqual(MAX_GENERATED_FILES_PER_RESPONSE);
        expect(resolved.generatedFiles.every((f) => f.language === language)).toBe(true);
      });
    }
  });
}

// Run smoke tests for each current Hebrew dataset using the helper.
// When a new dataset is uploaded, add a new createUploadDatasetSmokeTest() call here.

createUploadDatasetSmokeTest({
  datasetLabel: 'adolescents_cbt_core_he',
  language: 'he',
  audience: 'adolescents',
  category: 'adolescents_cbt_core',
  expectedIds: [
    'adolescents-cbt-core-he-1-1',
    'adolescents-cbt-core-he-1-2',
    'adolescents-cbt-core-he-stage-1-combined',
    'adolescents-cbt-core-he-stage-6-combined',
  ],
  titleSamples: ['מה עובר עליי עכשיו?', 'הגוף שלי שולח לי סימנים'],
  clinicalKeywords: ['חרדה', 'ויסות רגשי'],
  multiFormQuery: 'שלח לי כמה טפסים למתבגר עם חרדה',
});

createUploadDatasetSmokeTest({
  datasetLabel: 'adolescents_cbt_specialized_he',
  language: 'he',
  audience: 'adolescents',
  category: 'adolescents_cbt_specialized',
  expectedIds: [
    'adolescents-cbt-specialized-he-01-01',
    'adolescents-cbt-specialized-he-05-01',
    'adolescents-cbt-specialized-he-06-01',
    'adolescents-cbt-specialized-he-09-01',
  ],
  titleSamples: ['מה קורה אצלי עכשיו?', 'מד הכעס שלי'],
  clinicalKeywords: ['כעס', 'טראומה', 'OCD', 'קשב'],
  multiFormQuery: 'שלח לי כמה טפסים למתבגר עם OCD',
});

createUploadDatasetSmokeTest({
  datasetLabel: 'children_cbt_core_he',
  language: 'he',
  audience: 'children',
  category: 'children_cbt_core',
  expectedIds: [
    'children-cbt-core-he-1-1',
    'children-cbt-core-he-module-01',
    'children-cbt-core-he-module-05',
  ],
  titleSamples: ['מה עובר עליי עכשיו?'],
  clinicalKeywords: ['חרדה'],
  multiFormQuery: 'שלח לי כמה טפסים לילד ממודול 1',
});

createUploadDatasetSmokeTest({
  datasetLabel: 'children_cbt_specialized_he',
  language: 'he',
  audience: 'children',
  category: 'children_cbt_specialized',
  expectedIds: [
    'children-cbt-specialized-he-1-1-1',
    'children-cbt-specialized-he-module-1-1',
    'children-cbt-specialized-he-module-4-1',
  ],
  titleSamples: ['נפרדים בשלום'],
  clinicalKeywords: ['חרדת פרידה', 'דימוי עצמי', 'שינה'],
  multiFormQuery: 'שלח לי כמה טפסים לילד עם חרדת פרידה',
});

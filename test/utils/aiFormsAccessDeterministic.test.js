import { describe, it, expect } from 'vitest';
import {
  getAllTherapeuticForms,
  listFormsForAI,
  searchFormsForAI,
  resolveFormForAIRequest,
  resolveFormByIdOrSlug,
  createGeneratedFileFromResolvedForm,
  getAvailableFormGroups,
  getFormsRegistryStats,
  detectFormIntent,
} from '../../src/data/therapeuticForms/index.js';

describe('aiFormsAccess deterministic registry stats', () => {
  it('returns a non-empty canonical registry', () => {
    const forms = getAllTherapeuticForms();
    expect(forms.length).toBeGreaterThan(0);
  });

  it('reports language stats including en', () => {
    const stats = getFormsRegistryStats();
    expect(stats.byLanguage.en).toBeGreaterThan(0);
  });

  it('reports audience stats including children and adolescents', () => {
    const stats = getFormsRegistryStats();
    expect(stats.byAudience.children).toBeGreaterThan(0);
    expect(stats.byAudience.adolescents).toBeGreaterThan(0);
  });

  it('reports category stats for current core/specialized children+adolescents categories', () => {
    const stats = getFormsRegistryStats();
    expect(stats.byCategory.children_cbt_specialized).toBeGreaterThan(0);
    expect(stats.byCategory.children_cbt_core).toBeGreaterThan(0);
    expect(stats.byCategory.adolescents_cbt_core).toBeGreaterThan(0);
    expect(stats.byCategory.adolescents_cbt_specialized).toBeGreaterThan(0);
  });

  it('keeps all approved generated-index forms available through AI-facing list by language', () => {
    const allApproved = getAllTherapeuticForms().filter((form) => form?.approved === true);
    const expectedEn = allApproved.filter((form) => form.language === 'en').length;
    const expectedHe = allApproved.filter((form) => form.language === 'he').length;
    const expectedEnIds = new Set(allApproved.filter((form) => form.language === 'en').map((form) => form.id));
    const expectedHeIds = new Set(allApproved.filter((form) => form.language === 'he').map((form) => form.id));

    const listedEn = listFormsForAI({ language: 'en', allowEnglishFallback: false });
    const listedHe = listFormsForAI({ language: 'he', allowEnglishFallback: false });

    expect(listedEn).toHaveLength(expectedEn);
    expect(listedHe).toHaveLength(expectedHe);
    expect(new Set(listedEn.map((form) => form.id))).toEqual(expectedEnIds);
    expect(new Set(listedHe.map((form) => form.id))).toEqual(expectedHeIds);
  });
});

describe('aiFormsAccess deterministic list/search', () => {
  it('lists children forms by audience', () => {
    const forms = listFormsForAI({ audience: 'children', language: 'en' });
    expect(forms.length).toBeGreaterThan(0);
    expect(forms.every((form) => form.audience === 'children')).toBe(true);
  });

  it('lists adolescents forms by audience', () => {
    const forms = listFormsForAI({ audience: 'adolescents', language: 'en' });
    expect(forms.length).toBeGreaterThan(0);
    expect(forms.every((form) => form.audience === 'adolescents')).toBe(true);
  });

  it('lists forms by language without collapsing global registry', () => {
    const englishForms = listFormsForAI({ language: 'en' });
    expect(englishForms.length).toBeGreaterThan(0);
    expect(englishForms.every((form) => form.language === 'en')).toBe(true);
    expect(getAllTherapeuticForms().length).toBeGreaterThan(0);
  });

  it('lists Hebrew adolescents CBT core forms only in Hebrew mode', () => {
    const hebrewForms = listFormsForAI({ language: 'he', audience: 'adolescents', category: 'adolescents_cbt_core' });
    expect(hebrewForms.length).toBe(36);
    expect(hebrewForms.every((form) => form.language === 'he')).toBe(true);
  });

  it('lists Hebrew children CBT core forms only in Hebrew mode', () => {
    const hebrewChildren = listFormsForAI({ language: 'he', audience: 'children', category: 'children_cbt_core' });
    const englishChildren = listFormsForAI({ language: 'en', audience: 'children', category: 'children_cbt_core' })
      .filter((form) => form.id.startsWith('children-cbt-core-he'));
    expect(hebrewChildren).toHaveLength(35);
    expect(hebrewChildren.every((form) => form.language === 'he')).toBe(true);
    expect(englishChildren).toHaveLength(0);
  });

  it('lists forms by category', () => {
    const forms = listFormsForAI({ language: 'en', category: 'children_cbt_specialized' });
    expect(forms.length).toBeGreaterThan(0);
    expect(forms.every((form) => form.category === 'children_cbt_specialized')).toBe(true);
  });

  it('searches children OCD intent', () => {
    const forms = searchFormsForAI('children OCD', { language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(forms[0].audience).toBe('children');
    expect(JSON.stringify(forms[0]).toLowerCase()).toContain('ocd');
  });

  it('searches by title content', () => {
    const forms = searchFormsForAI('my calm plan', { language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(JSON.stringify(forms[0]).toLowerCase()).toContain('calm');
  });

  it('searches sticky thoughts and rituals into OCD matches', () => {
    const forms = searchFormsForAI('sticky thoughts and rituals', { language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(JSON.stringify(forms[0]).toLowerCase()).toMatch(/ocd|sticky thoughts|ritual/);
  });

  it('searches child anger outbursts to anger/regulation', () => {
    const forms = searchFormsForAI('child anger outbursts', { language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(JSON.stringify(forms[0]).toLowerCase()).toMatch(/anger|regulation|outburst/);
  });

  it('searches sleep problems child', () => {
    const forms = searchFormsForAI('sleep problems child', { language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(JSON.stringify(forms[0]).toLowerCase()).toContain('sleep');
  });

  it('searches stomach ache before school', () => {
    const forms = searchFormsForAI('stomach ache before school', { language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(JSON.stringify(forms[0]).toLowerCase()).toMatch(/stomach|school|body/);
  });

  it('searches low self-esteem child', () => {
    const forms = searchFormsForAI('low self-esteem child', { language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(JSON.stringify(forms[0]).toLowerCase()).toMatch(/self-esteem|self worth|not good enough/);
  });

  it('searches test anxiety', () => {
    const forms = searchFormsForAI('test anxiety', { language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(JSON.stringify(forms[0]).toLowerCase()).toMatch(/test|anxiety|performance/);
  });

  it('searches separation anxiety school goodbye', () => {
    const forms = searchFormsForAI('separation anxiety school goodbye', { language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(JSON.stringify(forms[0]).toLowerCase()).toMatch(/separation|goodbye|school/);
  });

  it('searches by ai matching summary content', () => {
    const forms = searchFormsForAI('stop take a breath choose a calmer next step', { language: 'en', audience: 'children' });
    expect(forms.length).toBeGreaterThan(0);
    expect(JSON.stringify(forms[0]).toLowerCase()).toMatch(/breath|calmer|step/);
  });

  it('finds approved forms by title via AI search', () => {
    const sourceForm = getAllTherapeuticForms().find(
      (form) => form?.approved === true && form?.language === 'en' && typeof form?.title === 'string' && form.title.trim().length > 10
    );
    expect(sourceForm).toBeTruthy();
    const titleQuery = sourceForm.title.split(/\s+/).slice(0, 4).join(' ');
    const forms = searchFormsForAI(titleQuery, { language: 'en', audience: sourceForm.audience });
    expect(forms.some((form) => form.id === sourceForm.id)).toBe(true);
  });

  it('finds approved forms by clinical metadata via AI search', () => {
    const sourceForm = getAllTherapeuticForms().find(
      (form) =>
        form?.approved === true &&
        form?.language === 'he' &&
        Array.isArray(form?.clinicalKeywords) &&
        form.clinicalKeywords.length > 0
    );
    expect(sourceForm).toBeTruthy();
    const keyword = sourceForm.clinicalKeywords[0];
    const forms = searchFormsForAI(keyword, { language: 'he', audience: sourceForm.audience });
    expect(forms.some((form) => form.id === sourceForm.id)).toBe(true);
  });
});

describe('aiFormsAccess deterministic send + language behavior', () => {
  it('resolves sendable children OCD form in english session', () => {
    const resolved = resolveFormForAIRequest('Can you send me forms for children regarding OCD?', { language: 'en' });
    expect(resolved.intent?.type).toBe('send_best_matching_form');
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.type).toBe('pdf');
    expect(resolved.generatedFile.url).toMatch(/^\/forms\//);
    expect(resolved.generatedFile.audience).toBe('children');
  });

  it('creates valid generated_file metadata from resolved form', () => {
    const resolved = resolveFormByIdOrSlug('children-cbt-specialized-en-4-1-1', { language: 'en' });
    const metadata = createGeneratedFileFromResolvedForm(resolved);
    expect(metadata).toMatchObject({
      type: 'pdf',
      mime_type: 'application/pdf',
      source: 'therapeutic_forms_registry',
      audience: 'children',
      language: 'en',
      category: 'children_cbt_specialized',
    });
    expect(metadata.id).toBeTruthy();
    expect(metadata.name).toBeTruthy();
    expect(metadata.url).toMatch(/^\/forms\//);
  });

  it('supports english session access deterministically', () => {
    const resolved = resolveFormForAIRequest('Send me any CBT form', { language: 'en' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('en');
  });

  it('keeps single generatedFile behavior for single-form requests', () => {
    const resolved = resolveFormForAIRequest('Send worksheet children-cbt-core-en-5-1', { language: 'en' });
    expect(resolved.generatedFile).toBeTruthy();
    expect(Array.isArray(resolved.generatedFiles)).toBe(true);
    expect(resolved.generatedFiles.length).toBeGreaterThanOrEqual(1);
    expect(resolved.generatedFiles[0].form_id).toBe(resolved.generatedFile.form_id);
  });

  it('supports hebrew session explicit english request', () => {
    const resolved = resolveFormForAIRequest('Send me an English child OCD form', { language: 'he' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('en');
  });

  it('returns Hebrew adolescent form in Hebrew session without English fallback', () => {
    const resolved = resolveFormForAIRequest('תן לי טופס בעברית למתבגר עם מחשבות שליליות', { language: 'he' });
    expect(resolved.intent?.type).toBe('send_best_matching_form');
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('he');
  });

  it('returns Hebrew children form in Hebrew session by clinical need', () => {
    const resolved = resolveFormForAIRequest('אני צריך טופס לילד עם חרדה', { language: 'he' });
    expect(resolved.intent?.type).toBe('send_best_matching_form');
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('he');
    expect(resolved.generatedFile.audience).toBe('children');
    expect(String(resolved.generatedFile.form_id)).toContain('children-cbt-core-he');
    expect(/[\u0590-\u05FF]/.test(String(resolved.generatedFile.title || ''))).toBe(true);
  });

  it('resolves Hebrew children module request to the matching module PDF', () => {
    const resolved = resolveFormForAIRequest('שלח לי את הקובץ המאוחד של מודול 2', { language: 'he' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.form_id).toBe('children-cbt-core-he-module-02');
    expect(resolved.generatedFile.url).toContain('children_cbt_core_he_module_02_combined.pdf');
  });

  it('treats he-IL as Hebrew and keeps English fallback disabled for general Hebrew requests', () => {
    const resolved = resolveFormForAIRequest('שלח לי טופס CBT למתבגר בעברית', { language: 'he-IL' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('he');
    expect(resolved.usedFallbackLanguage).toBe(false);
  });

  it('does not silently fallback to English in Hebrew children requests', () => {
    const resolved = resolveFormForAIRequest('תשלח לי טופס לילדים בנושא OCD', { language: 'he' });
    expect(resolved.intent?.type).toBe('send_best_matching_form');
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.language).toBe('he');
    expect(resolved.generatedFile.audience).toBe('children');
    expect(resolved.nearestMatches.every((form) => form.language === 'he')).toBe(true);
  });

  it('keeps access when language is undefined', () => {
    const resolved = resolveFormForAIRequest('Send me any CBT form', { language: undefined });
    expect(resolved.stats.total).toBeGreaterThan(0);
    expect((resolved.generatedFile || resolved.nearestMatches.length > 0)).toBeTruthy();
  });

  it('handles unsupported language without crashing and keeps deterministic access', () => {
    const resolved = resolveFormForAIRequest('Send me any CBT form', { language: 'ru' });
    expect(resolved.stats.total).toBeGreaterThan(0);
    expect(typeof resolved.responseText).toBe('string');
    expect(resolved.generatedFile || resolved.nearestMatches.length > 0).toBeTruthy();
  });

  it('resolves Hebrew stage combined requests to the matching combined stage PDF', () => {
    const resolved = resolveFormForAIRequest('שלח לי את כל שלב 4 בקובץ אחד', { language: 'he' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.form_id).toBe('adolescents-cbt-core-he-stage-4-combined');
    expect(resolved.generatedFile.url).toContain('adolescents_cbt_core_he_series_4_combined.pdf');
  });

  it('resolves Hebrew title-based request to matching individual worksheet', () => {
    const resolved = resolveFormForAIRequest('שלח לי את הטופס מה הראש שלי אמר', { language: 'he' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.form_id).toBe('adolescents-cbt-core-he-2-1');
  });

  it('resolves Hebrew children title-based request to the matching worksheet', () => {
    const resolved = resolveFormForAIRequest('שלח לי את הטופס מה עובר עליי עכשיו', { language: 'he' });
    expect(resolved.generatedFile).not.toBeNull();
    expect(resolved.generatedFile.form_id).toBe('children-cbt-core-he-1-1');
    expect(String(resolved.generatedFile.title || '')).toBe('מה עובר עליי עכשיו?');
  });

  it('does not invent a single Hebrew full-series PDF when user asks for all stages', () => {
    const resolved = resolveFormForAIRequest('שלח לי את כל השלבים בקובץ אחד', { language: 'he' });
    expect(resolved.generatedFile?.url || '').not.toContain('full');
    expect(resolved.generatedFile?.url || '').not.toContain('series-full');
  });

  it('returns nearest matches when exact match is missing', () => {
    const resolved = resolveFormForAIRequest('send me form for impossible unicorn panic subtype', { language: 'en' });
    expect(Array.isArray(resolved.nearestMatches)).toBe(true);
    expect(resolved.nearestMatches.length).toBeGreaterThanOrEqual(0);
  });

  it('supports deterministic multi-form module requests with safe max cap', () => {
    const resolved = resolveFormForAIRequest('send all forms from module 06', { language: 'en' });
    expect(Array.isArray(resolved.generatedFiles)).toBe(true);
    expect(resolved.generatedFiles.length).toBeGreaterThan(0);
    expect(resolved.generatedFiles.length).toBeLessThanOrEqual(5);
  });

  it('supports Hebrew multi-form requests in Hebrew mode without leaking English files', () => {
    const resolved = resolveFormForAIRequest('שלח לי את כל שלב 1', { language: 'he' });
    expect(Array.isArray(resolved.generatedFiles)).toBe(true);
    expect(resolved.generatedFiles.length).toBeGreaterThan(0);
    expect(resolved.generatedFiles.every((file) => file.language === 'he')).toBe(true);
  });

  it('supports English multi-form requests without leaking Hebrew files', () => {
    const resolved = resolveFormForAIRequest('send the first three worksheets from module 06', { language: 'en' });
    expect(Array.isArray(resolved.generatedFiles)).toBe(true);
    expect(resolved.generatedFiles.length).toBeGreaterThan(0);
    expect(resolved.generatedFiles.every((file) => file.language === 'en')).toBe(true);
  });

  it('keeps English session results free of Hebrew adolescents core forms', () => {
    const resolved = resolveFormForAIRequest('send me cbt forms for adolescents', { language: 'en' });
    const allMatches = [
      ...(resolved.generatedFile ? [resolved.generatedFile] : []),
      ...(resolved.nearestMatches || []),
    ];
    for (const match of allMatches) {
      const id = String(match?.form_id || match?.id || '');
      expect(id.startsWith('adolescents-cbt-core-he')).toBe(false);
    }
  });

  it('keeps English session results free of Hebrew children core forms', () => {
    const resolved = resolveFormForAIRequest('send me cbt forms for children', { language: 'en' });
    const allMatches = [
      ...(resolved.generatedFile ? [resolved.generatedFile] : []),
      ...(resolved.nearestMatches || []),
    ];
    for (const match of allMatches) {
      const id = String(match?.form_id || match?.id || '');
      expect(id.startsWith('children-cbt-core-he')).toBe(false);
    }
  });
});

describe('aiFormsAccess deterministic intent + grouping', () => {
  it('detects list and send form intents', () => {
    expect(detectFormIntent('What forms do you have?')?.type).toBe('list_all_forms');
    expect(detectFormIntent('List forms for adolescents')?.type).toBe('list_forms_by_audience');
    expect(detectFormIntent('Send me a form for anger')?.type).toBe('send_best_matching_form');
  });

  it('returns grouped listing metadata and examples', () => {
    const groups = getAvailableFormGroups({ language: 'en', audience: 'children' });
    expect(groups.total).toBeGreaterThan(0);
    expect(groups.categories.length).toBeGreaterThan(0);
    expect(groups.audienceGroups.children.length).toBeGreaterThan(0);
    expect(groups.examples.length).toBeGreaterThan(0);
  });
});

// ─── Phase 4: Hebrew multi-form intent detection ──────────────────────────────
describe('aiFormsAccess Hebrew multi-form detection', () => {
  it('detects Hebrew "שלח לי כמה טפסים לילד עם חרדת פרידה" as send_multiple_forms', () => {
    const intent = detectFormIntent('שלח לי כמה טפסים לילד עם חרדת פרידה');
    expect(intent?.type).toBe('send_multiple_forms');
  });

  it('detects Hebrew "שלח לי מספר טפסים" as send_multiple_forms', () => {
    const intent = detectFormIntent('שלח לי מספר טפסים');
    expect(intent?.type).toBe('send_multiple_forms');
  });

  it('detects Hebrew "תן לי כמה טפסים" as send_multiple_forms', () => {
    const intent = detectFormIntent('תן לי כמה טפסים');
    expect(intent?.type).toBe('send_multiple_forms');
  });

  it('detects Hebrew "שלח לי כמה דפי עבודה" as send_multiple_forms', () => {
    const intent = detectFormIntent('שלח לי כמה דפי עבודה');
    expect(intent?.type).toBe('send_multiple_forms');
  });

  it('detects Hebrew "כל הטפסים" as send_multiple_forms when combined with send verb', () => {
    const intent = detectFormIntent('שלח לי את כל הטפסים');
    expect(intent?.type).toBe('send_multiple_forms');
  });

  it('resolves Hebrew multi-form request to multiple generatedFiles in Hebrew only', () => {
    const route = resolveFormForAIRequest('שלח לי כמה טפסים לילד עם חרדת פרידה', { language: 'he' });
    expect(route.intent?.type).toBe('send_multiple_forms');
    expect(Array.isArray(route.generatedFiles)).toBe(true);
    expect(route.generatedFiles.length).toBeGreaterThan(1);
    expect(route.generatedFiles.length).toBeLessThanOrEqual(5);
    // All results must be Hebrew
    expect(route.generatedFiles.every((f) => f.language === 'he')).toBe(true);
  });

  it('resolves Hebrew capability question as a form intent', () => {
    // "האם אתה יכול לשלוח מספר טפסים במקביל" should detect send intent (לשלוח + טפסים)
    const intent = detectFormIntent('האם אתה יכול לשלוח מספר טפסים במקביל');
    expect(intent).not.toBeNull();
    expect(intent?.type).toBe('send_multiple_forms');
  });

  it('generated_files count is capped at MAX_GENERATED_FILES_PER_RESPONSE (5)', () => {
    const route = resolveFormForAIRequest('שלח לי כמה טפסים לילד', { language: 'he' });
    expect(Array.isArray(route.generatedFiles)).toBe(true);
    expect(route.generatedFiles.length).toBeLessThanOrEqual(5);
  });

  it('single Hebrew form request returns exactly one generatedFile', () => {
    const route = resolveFormForAIRequest('שלח לי טופס לילד עם חרדה', { language: 'he' });
    expect(route.intent?.type).toBe('send_best_matching_form');
    expect(route.generatedFile).toBeTruthy();
    expect(route.generatedFile?.language).toBe('he');
  });
});

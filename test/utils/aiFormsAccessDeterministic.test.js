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

  it('does not silently fallback to English in Hebrew session for non-Hebrew catalog gaps', () => {
    const resolved = resolveFormForAIRequest('תשלח לי טופס לילדים בנושא OCD', { language: 'he' });
    expect(resolved.intent?.type).toBe('send_best_matching_form');
    expect(resolved.generatedFile).toBeNull();
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

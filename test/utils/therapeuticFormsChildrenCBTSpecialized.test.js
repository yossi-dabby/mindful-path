import { describe, it, expect } from 'vitest';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { getTherapeuticFormsForAI } from '../../src/data/therapeuticForms/index.js';
import {
  FORMS_CHILDREN_CBT_SPECIALIZED,
  FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS,
  FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL,
} from '../../src/data/therapeuticForms/forms.children.cbt-specialized.js';
import {
  resolveChildrenCBTSpecializedFormByContent,
  resolveFormIntent,
} from '../../src/utils/resolveFormIntent.js';
import { getFormDownloadUrl, getFormOpenUrl, PDF_VIEWER_ROUTE_PATH } from '../../src/components/chat/utils/formFileUrls.js';

const SPECIALIZED_CATEGORY = 'children_cbt_specialized';

function specializedForms() {
  return ALL_FORMS.filter(
    (form) =>
      form.approved === true &&
      form.audience === 'children' &&
      form.language === 'en' &&
      form.category === SPECIALIZED_CATEGORY
  );
}

describe('therapeuticFormsChildrenCBTSpecialized.test.js', () => {
  it('registers children specialized EN forms in canonical registry (15 module PDFs + 150 worksheet metadata entries)', () => {
    expect(FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS).toHaveLength(15);
    expect(FORMS_CHILDREN_CBT_SPECIALIZED_INDIVIDUAL).toHaveLength(150);
    expect(FORMS_CHILDREN_CBT_SPECIALIZED).toHaveLength(165);

    const forms = specializedForms();
    expect(forms).toHaveLength(165);

    const modules = forms.filter((form) => form.type === 'module_pdf');
    const worksheets = forms.filter((form) => form.type === 'individual_worksheet');
    expect(modules).toHaveLength(15);
    expect(worksheets).toHaveLength(150);

    for (const module of FORMS_CHILDREN_CBT_SPECIALIZED_DOMAIN_PDFS) {
      expect(module.worksheetCount).toBe(10);
      expect(module.language).toBe('en');
      expect(module.audience).toBe('children');
      expect(String(module.fileUrl || '')).toMatch(/^\/forms\/children_cbt_specialized_en_/);
    }
  });

  it('keeps filename-clinical mismatch corrected for subcategories 1.3/1.4/1.5', () => {
    // Source PDFs for 1.3/1.4/1.5 were uploaded with "specific_phobias" in filenames.
    // Runtime metadata must preserve the clinically correct subcategory labeling.
    const module13 = resolveFormIntent('children-cbt-specialized-en-module-1-3', 'en');
    const module14 = resolveFormIntent('children-cbt-specialized-en-module-1-4', 'en');
    const module15 = resolveFormIntent('children-cbt-specialized-en-module-1-5', 'en');

    expect(module13?.title).toContain('Social Anxiety');
    expect(module13?.name).toContain('01_03_specific_phobias_full.pdf');

    expect(module14?.title).toContain('Test & Performance Anxiety');
    expect(module14?.name).toContain('01_04_specific_phobias_full.pdf');

    expect(module15?.title).toContain('Generalized Anxiety / Everyday Worries');
    expect(module15?.name).toContain('01_05_specific_phobias_full.pdf');
  });

  it('shows specialized forms in English mode and isolates English specialized forms from Hebrew mode', () => {
    const english = getTherapeuticFormsForAI({ language: 'en', audience: 'children' })
      .filter((form) => form.category === SPECIALIZED_CATEGORY);
    const hebrew = getTherapeuticFormsForAI({ language: 'he', audience: 'children' })
      .filter((form) => form.category === SPECIALIZED_CATEGORY);

    expect(english).toHaveLength(165);
    expect(english.every((form) => form.language === 'en')).toBe(true);
    expect(hebrew).toHaveLength(121);
    expect(hebrew.every((form) => form.language === 'he')).toBe(true);
  });

  it('keeps audience guard: visible for children, excluded for adults/adolescents', () => {
    const children = getTherapeuticFormsForAI({ language: 'en', audience: 'children' })
      .filter((form) => form.category === SPECIALIZED_CATEGORY);
    const adolescents = getTherapeuticFormsForAI({ language: 'en', audience: 'adolescents' })
      .filter((form) => form.category === SPECIALIZED_CATEGORY);
    const adults = getTherapeuticFormsForAI({ language: 'en', audience: 'adults' })
      .filter((form) => form.category === SPECIALIZED_CATEGORY);

    expect(children).toHaveLength(165);
    expect(adolescents).toHaveLength(0);
    expect(adults).toHaveLength(0);
  });

  it('matches all required clinical scenarios to the correct specialized subcategory', () => {
    const cases = [
      ['child refuses to separate from mom at school', '1.1'],
      ['child is afraid of dogs', '1.2'],
      ['child is scared to speak in class', '1.3'],
      ['child freezes before tests', '1.4'],
      ['child worries about everything', '1.5'],
      ['child explodes when frustrated', '2.1'],
      ['child argues with parents and refuses instructions', '2.2'],
      ['child acts before thinking', '2.3'],
      ['child thinks I am not good enough', '3.1'],
      ['child does not know how to join games', '3.2'],
      ['child has sticky thoughts and rituals', '4.1'],
      ['child needs grounding and safety after fear', '4.2'],
      ['child has bedtime worries', '5.1'],
      ['child gets stomach aches before school', '5.2'],
      ['child feels shame about accidents', '5.3'],
    ];

    const unresolved = [];

    for (const [query, subcategory] of cases) {
      const resolved = resolveChildrenCBTSpecializedFormByContent(query, { activeLanguage: 'en' });
      if (!resolved) {
        unresolved.push(query);
        continue;
      }
      expect(resolved?.audience).toBe('children');
      expect(resolved?.language).toBe('en');
      expect(resolved?.category).toBe(SPECIALIZED_CATEGORY);
      expect(
        String(resolved?.form_id || '').includes(`-module-${subcategory.replace('.', '-')}`) ||
        String(resolved?.formNumber || '').startsWith(`${subcategory}.`) ||
        String(resolved?.name || '').includes(`_${subcategory}_`) ||
        String(resolved?.title || '').includes(subcategory)
      ).toBe(true);
    }

    expect(unresolved).toEqual([]);
  });

  it('can send a specific pack and reference a specific worksheet number', () => {
    const pack = resolveFormIntent('children-cbt-specialized-en-module-4-1', 'en');
    const worksheet = resolveFormIntent('send worksheet 1.3.1 from children specialized', 'en');

    expect(pack?.form_id).toBe('children-cbt-specialized-en-module-4-1');
    expect(String(pack?.url || '')).toContain('/forms/children_cbt_specialized_en_4/children_cbt_specialized_en_4.1_ocd.pdf');

    expect(worksheet?.form_id).toBe('children-cbt-specialized-en-1-3-1');
    expect(worksheet?.formNumber).toBe('1.3.1');
    expect(String(worksheet?.url || '')).toContain('/forms/children_cbt_specialized_en_1/children_cbt_specialized_en_01_03_specific_phobias_full.pdf');
  });

  it('preserves Open vs Download URL behavior for specialized PDFs', () => {
    const metadata = resolveFormIntent('children-cbt-specialized-en-module-5-1', 'en');
    expect(metadata?.url).toContain('/forms/children_cbt_specialized_en_5/children_cbt_specialized_en_5.1_sleep_problems.pdf');

    const openUrl = getFormOpenUrl(metadata?.url);
    const downloadUrl = getFormDownloadUrl(metadata?.url);

    expect(openUrl).toContain(`${PDF_VIEWER_ROUTE_PATH}?file=`);
    expect(openUrl).not.toContain('download=1');
    expect(downloadUrl).toContain('download=1');
  });
});

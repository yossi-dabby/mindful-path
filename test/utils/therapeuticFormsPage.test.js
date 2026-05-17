import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';
import { getFilteredForms } from '../../src/pages/TherapeuticForms.jsx';

const CORE_ID = 'adolescents-cbt-core-en';

describe('therapeuticFormsPage.test.js', () => {
  it('keeps route and page registration intact', () => {
    const pagesConfigSource = fs.readFileSync('/home/runner/work/mindful-path/mindful-path/src/pages.config.js', 'utf8');
    expect(pagesConfigSource).toContain('"TherapeuticForms": TherapeuticForms');
  });

  it('keeps Home quick action pointing to TherapeuticForms', () => {
    const quickActionsSource = fs.readFileSync('/home/runner/work/mindful-path/mindful-path/src/components/home/QuickActions.jsx', 'utf8');
    expect(quickActionsSource).toContain("page: 'TherapeuticForms'");
  });

  it('shows the package for English all/adolescents and primary/secondary categories', () => {
    expect(ALL_FORMS.map((form) => form.id)).toEqual([CORE_ID]);

    const allEnglish = getFilteredForms({ audience: 'all', category: 'all', lang: 'en' });
    const adolescentsEnglish = getFilteredForms({ audience: 'adolescents', category: 'all', lang: 'en' });
    const primaryCategory = getFilteredForms({ audience: 'all', category: 'adolescents_cbt_core', lang: 'en' });
    const secondaryCategory = getFilteredForms({ audience: 'all', category: 'thought_records', lang: 'en' });

    for (const list of [allEnglish, adolescentsEnglish, primaryCategory, secondaryCategory]) {
      expect(list).toHaveLength(1);
      expect(list[0].form.id).toBe(CORE_ID);
    }
  });

  it('does not show the package in Hebrew or for non-adolescent audience filters', () => {
    expect(getFilteredForms({ audience: 'all', category: 'all', lang: 'he' })).toEqual([]);
    expect(getFilteredForms({ audience: 'children', category: 'all', lang: 'en' })).toEqual([]);
    expect(getFilteredForms({ audience: 'adults', category: 'all', lang: 'en' })).toEqual([]);
    expect(getFilteredForms({ audience: 'older_adults', category: 'all', lang: 'en' })).toEqual([]);
  });
});

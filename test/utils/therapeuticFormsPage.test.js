import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';

describe('therapeuticFormsPage.test.js — zero installed forms', () => {
  it('keeps route and page registration intact', () => {
    const pagesConfigSource = fs.readFileSync('/home/runner/work/mindful-path/mindful-path/src/pages.config.js', 'utf8');
    expect(pagesConfigSource).toContain('"TherapeuticForms": TherapeuticForms');
  });

  it('keeps Home quick action pointing to TherapeuticForms', () => {
    const quickActionsSource = fs.readFileSync('/home/runner/work/mindful-path/mindful-path/src/components/home/QuickActions.jsx', 'utf8');
    expect(quickActionsSource).toContain("page: 'TherapeuticForms'");
  });

  it('returns an empty filtered forms list in zero-catalog mode', () => {
    expect(ALL_FORMS).toEqual([]);
    const pageSource = fs.readFileSync('/home/runner/work/mindful-path/mindful-path/src/pages/TherapeuticForms.jsx', 'utf8');
    expect(pageSource).toContain('forms.length === 0');
    expect(pageSource).toContain('data-testid=\"empty-state\"');
    expect(pageSource).toContain('data-testid={`form-card-${form.id}`}');
  });
});

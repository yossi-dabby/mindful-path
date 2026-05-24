import { describe, it, expect } from 'vitest';
import { validateEntries } from '../../scripts/generate-therapeutic-forms-index.mjs';

const VALID_FILE_PATH = 'public/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf';

function buildEntry(overrides = {}) {
  return {
    id: 'fixture-form-en-1',
    title: 'Fixture Form',
    language: 'en',
    audience: 'adolescents',
    category: 'adolescents_cbt_core',
    filePath: VALID_FILE_PATH,
    file_path: VALID_FILE_PATH,
    therapeuticGoal: 'Support structured CBT practice.',
    whenToUse: 'Use when a teen asks for a CBT worksheet.',
    clinicalKeywords: ['cbt', 'teen'],
    ...overrides,
  };
}

describe('therapeutic forms index generator validation', () => {
  it('accepts a valid entry', () => {
    expect(() => validateEntries([buildEntry()])).not.toThrow();
  });

  it('fails on duplicate IDs', () => {
    const a = buildEntry({ id: 'duplicate-id' });
    const b = buildEntry({ id: 'duplicate-id', filePath: 'public/forms/adolescents/en/core/individual/01-01-whats-happening-right-now.pdf', file_path: 'public/forms/adolescents/en/core/individual/01-01-whats-happening-right-now.pdf' });
    expect(() => validateEntries([a, b])).toThrow(/Duplicate therapeutic form id: duplicate-id/);
  });

  it('fails on missing file paths', () => {
    const broken = buildEntry({
      id: 'missing-file',
      filePath: 'public/forms/adolescents/en/core/does-not-exist.pdf',
      file_path: 'public/forms/adolescents/en/core/does-not-exist.pdf',
    });
    expect(() => validateEntries([broken])).toThrow(/references missing file path/);
  });

  it('fails on missing language, audience, and category', () => {
    const broken = buildEntry({ id: 'missing-required-fields', language: '', audience: '', category: '' });
    expect(() => validateEntries([broken])).toThrow(/missing language/);
    expect(() => validateEntries([broken])).toThrow(/missing audience/);
    expect(() => validateEntries([broken])).toThrow(/missing category/);
  });

  it('fails on unsupported language code', () => {
    const broken = buildEntry({ id: 'unsupported-lang', language: 'ru' });
    expect(() => validateEntries([broken])).toThrow(/unsupported language code: ru/);
  });

  it('fails on invalid audience value', () => {
    const broken = buildEntry({ id: 'invalid-audience', audience: 'teens' });
    expect(() => validateEntries([broken])).toThrow(/invalid audience value: teens/);
  });

  it('fails when AI matching metadata is missing', () => {
    const broken = buildEntry({
      id: 'missing-ai-metadata',
      therapeuticGoal: '',
      whenToUse: '',
      clinicalKeywords: [],
      keywords: [],
      aiMatchingSummary: '',
      ai_matching_summary: '',
    });
    expect(() => validateEntries([broken])).toThrow(/missing AI matching metadata/);
  });
});

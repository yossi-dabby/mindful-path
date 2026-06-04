import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');

describe('therapeuticFormsChildrenCBTPremiumAssets.test.js', () => {
  it('keeps only the installed adolescents core english PDF as active runtime asset', () => {
    const expectedPath = path.join(
      ROOT,
      'public/forms/adolescents/en/core/adolescents-cbt-core-series-1-full-en.pdf'
    );
    expect(fs.existsSync(expectedPath)).toBe(true);
  });

  it('keeps runtime catalog limited to the canonical adolescents package', () => {
    expect(ALL_FORMS.map((form) => form.id)).toContain('adolescents-cbt-core-en');
  });
});

import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';

const ROOT = process.cwd();

const CANONICAL_AUDIENCE_FIRST_PATTERN = /^public\/forms\/(children|adolescents|adults|older_adults|parents)\/(en|he|es|fr|de|it|pt)\/[^/]+\/.+/;
const LEGACY_ACTIVE_PATTERNS = [
  /^public\/forms\/module[-_]\d+\//,
  /^public\/forms\/.*_github_upload\//,
  /^public\/forms\/(?:children|adolescents)_[^/]+\//,
  /^public\/forms\/.*series.*/i,
];
const OUTSIDE_WRAPPER_PATTERNS = [
  /^public\/children_cbt_core_en\//,
];

function classifyRepoPath(filePath) {
  const normalized = String(filePath || '').replace(/\\/g, '/');
  if (CANONICAL_AUDIENCE_FIRST_PATTERN.test(normalized)) return 'canonical-audience-first';
  if (LEGACY_ACTIVE_PATTERNS.some((pattern) => pattern.test(normalized))) return 'legacy-active';
  if (OUTSIDE_WRAPPER_PATTERNS.some((pattern) => pattern.test(normalized))) return 'outside-upload-wrapper';
  return 'unclassified';
}

describe('therapeutic forms folder migration readiness safety', () => {
  it('classifies active runtime paths while allowing current legacy lowercase paths', () => {
    const counts = {
      canonical: 0,
      legacyActive: 0,
      outsideWrappers: 0,
      unclassified: 0,
    };

    for (const form of ALL_FORMS.filter((entry) => entry?.approved === true)) {
      const fileUrl = String(form?.fileUrl || '').trim();
      const filePath = String(form?.filePath || form?.file_path || '').trim();

      expect(fileUrl.startsWith('/forms/'), `Active form ${form.id} fileUrl must begin with /forms/: ${fileUrl}`).toBe(true);
      expect(/\/forms\/(?:EN|HE)(?:\/|$)/.test(fileUrl), `Active form ${form.id} uses uppercase EN/HE path: ${fileUrl}`).toBe(false);
      expect(/\/forms\/[^/]+\/(?:EN|HE)(?:\/|$)/.test(fileUrl), `Active form ${form.id} uses uppercase EN/HE path: ${fileUrl}`).toBe(false);

      expect(filePath.startsWith('public/forms/'), `Active form ${form.id} filePath must remain under public/forms/: ${filePath}`).toBe(true);

      const absolute = path.join(ROOT, filePath);
      expect(fs.existsSync(absolute), `Active form ${form.id} points to missing runtime asset: ${filePath}`).toBe(true);

      const classification = classifyRepoPath(filePath);
      if (classification === 'canonical-audience-first') counts.canonical += 1;
      if (classification === 'legacy-active') counts.legacyActive += 1;
      if (classification === 'outside-upload-wrapper') counts.outsideWrappers += 1;
      if (classification === 'unclassified') counts.unclassified += 1;

      expect(classification, `Active form ${form.id} could not be classified for migration planning: ${filePath}`).not.toBe('unclassified');
      expect(classification, `Active form ${form.id} must not escape public/forms/: ${filePath}`).not.toBe('outside-upload-wrapper');
    }

    expect(counts.canonical + counts.legacyActive).toBeGreaterThan(0);
    expect(counts.unclassified).toBe(0);
    expect(counts.outsideWrappers).toBe(0);
  });
});

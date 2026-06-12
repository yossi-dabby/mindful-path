import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';

const ROOT = process.cwd();

function toAbsoluteFromPublicUrl(fileUrl) {
  return path.join(ROOT, 'public', String(fileUrl || '').replace(/^\//, ''));
}

function toAbsoluteFromRepoPath(filePath) {
  return path.join(ROOT, String(filePath || ''));
}

function isAllowedDuplicateGroup(fileUrl, entries) {
  const isChildrenSpecializedEn = entries.every((entry) =>
    entry?.audience === 'children' &&
    entry?.language === 'en' &&
    entry?.category === 'children_cbt_specialized' &&
    String(entry?.filePath || entry?.file_path || '').startsWith('public/forms/')
  );

  if (!isChildrenSpecializedEn) return false;
  if (!/^\/forms\/children_cbt_specialized_en_[1-5]\//.test(String(fileUrl))) return false;

  const moduleEntries = entries.filter((entry) => entry?.type === 'module_pdf');
  const worksheetEntries = entries.filter((entry) => entry?.type === 'individual_worksheet');
  return moduleEntries.length === 1 && worksheetEntries.length === 10;
}

describe('therapeutic forms asset path safety', () => {
  it('keeps registered runtime therapeutic-form paths valid and file-backed', () => {
    expect(Array.isArray(ALL_FORMS)).toBe(true);
    expect(ALL_FORMS.length).toBeGreaterThan(0);

    const activeForms = ALL_FORMS.filter((form) => form?.approved === true);
    expect(activeForms.length).toBeGreaterThan(0);

    for (const form of activeForms) {
      const languageEntries = Object.entries(form?.languages || {});
      expect(languageEntries.length, `Form ${form.id} has no language entries`).toBeGreaterThan(0);

      const runtimeFileUrl = String(form?.fileUrl || '').trim();
      expect(runtimeFileUrl.startsWith('/forms/'), `Form ${form.id} fileUrl must start with /forms/: ${runtimeFileUrl}`).toBe(true);
      expect(/\/forms\/(?:EN|HE)(?:\/|$)/.test(runtimeFileUrl), `Form ${form.id} has uppercase runtime language segment: ${runtimeFileUrl}`).toBe(false);
      expect(/\/forms\/[^/]+\/(?:EN|HE)(?:\/|$)/.test(runtimeFileUrl), `Form ${form.id} has uppercase runtime language segment: ${runtimeFileUrl}`).toBe(false);
      expect(/\.pdf$/i.test(runtimeFileUrl), `Form ${form.id} runtime fileUrl must end with .pdf: ${runtimeFileUrl}`).toBe(true);
      expect(fs.existsSync(toAbsoluteFromPublicUrl(runtimeFileUrl)), `Form ${form.id} runtime fileUrl missing on disk: ${runtimeFileUrl}`).toBe(true);

      const runtimeFilePath = String(form?.filePath || form?.file_path || '').trim();
      expect(runtimeFilePath.startsWith('public/forms/'), `Form ${form.id} filePath must stay under public/forms/: ${runtimeFilePath}`).toBe(true);
      expect(/\.pdf$/i.test(runtimeFilePath), `Form ${form.id} filePath must end with .pdf: ${runtimeFilePath}`).toBe(true);
      expect(fs.existsSync(toAbsoluteFromRepoPath(runtimeFilePath)), `Form ${form.id} filePath missing on disk: ${runtimeFilePath}`).toBe(true);

      const expectedPathFromUrl = `public${runtimeFileUrl}`;
      expect(runtimeFilePath, `Form ${form.id} filePath should mirror runtime URL`).toBe(expectedPathFromUrl);

      for (const [languageCode, languageBlock] of languageEntries) {
        const fileUrl = String(languageBlock?.file_url || '').trim();
        if (!fileUrl) continue;

        expect(fileUrl.startsWith('/forms/'), `Form ${form.id} language ${languageCode} file_url must start with /forms/: ${fileUrl}`).toBe(true);
        expect(/\/forms\/(?:EN|HE)(?:\/|$)/.test(fileUrl), `Form ${form.id} language ${languageCode} has uppercase EN/HE path: ${fileUrl}`).toBe(false);
        expect(/\/forms\/[^/]+\/(?:EN|HE)(?:\/|$)/.test(fileUrl), `Form ${form.id} language ${languageCode} has uppercase EN/HE path: ${fileUrl}`).toBe(false);
        expect(/\.pdf$/i.test(fileUrl), `Form ${form.id} language ${languageCode} file_url must end with .pdf: ${fileUrl}`).toBe(true);
        expect(fs.existsSync(toAbsoluteFromPublicUrl(fileUrl)), `Form ${form.id} language ${languageCode} file_url missing on disk: ${fileUrl}`).toBe(true);

        if (languageCode === 'he') {
          expect(form.language, `Form ${form.id} with Hebrew block must be he`).toBe('he');
          expect(languageBlock?.rtl, `Form ${form.id} Hebrew block must have rtl=true`).toBe(true);
        }
        if (languageCode === 'en') {
          expect(form.language, `Form ${form.id} with English block must be en`).toBe('en');
          expect(languageBlock?.rtl === true, `Form ${form.id} English block must not claim rtl=true`).toBe(false);
        }
      }
    }
  });

  it('does not introduce undocumented duplicate runtime fileUrl values', () => {
    const byUrl = new Map();
    for (const form of ALL_FORMS.filter((entry) => entry?.approved === true)) {
      const fileUrl = String(form?.fileUrl || '').trim();
      if (!fileUrl) continue;
      if (!byUrl.has(fileUrl)) byUrl.set(fileUrl, []);
      byUrl.get(fileUrl).push(form);
    }

    const duplicateGroups = Array.from(byUrl.entries()).filter(([, entries]) => entries.length > 1);
    const unexpectedGroups = duplicateGroups.filter(([fileUrl, entries]) => !isAllowedDuplicateGroup(fileUrl, entries));

    expect(
      unexpectedGroups.map(([fileUrl, entries]) => `${fileUrl} => ${entries.map((entry) => entry.id).join(', ')}`)
    ).toEqual([]);
  });
});

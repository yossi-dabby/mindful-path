import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { describe, expect, it } from 'vitest';

import generatedFormsIndex from '../../src/generated/therapeutic-forms-index.json';

const ROOT = process.cwd();
const GENERATOR_SCRIPT = path.join(ROOT, 'scripts/generate-therapeutic-forms-index.mjs');
const GENERATED_INDEX_PATH = path.join(ROOT, 'src/generated/therapeutic-forms-index.json');

function toAbsoluteFromRepoPath(filePath) {
  return path.join(ROOT, String(filePath || ''));
}

describe('therapeutic forms generated index safety', () => {
  it('regenerates therapeutic forms index successfully', () => {
    const result = spawnSync('node', [GENERATOR_SCRIPT], {
      cwd: ROOT,
      env: process.env,
      encoding: 'utf8',
    });

    expect(result.status, `Generator failed.\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`).toBe(0);
    expect(fs.existsSync(GENERATED_INDEX_PATH)).toBe(true);
  });

  it('keeps generated entries file-backed and path-safe', () => {
    expect(Array.isArray(generatedFormsIndex)).toBe(true);
    expect(generatedFormsIndex.length).toBeGreaterThan(0);

    for (const entry of generatedFormsIndex) {
      expect(typeof entry?.id).toBe('string');
      expect(entry.id.trim().length).toBeGreaterThan(0);
      expect(typeof entry?.language).toBe('string');
      expect(entry.language.trim().length).toBeGreaterThan(0);
      expect(typeof entry?.audience).toBe('string');
      expect(entry.audience.trim().length).toBeGreaterThan(0);
      expect(typeof entry?.category).toBe('string');
      expect(entry.category.trim().length).toBeGreaterThan(0);
      expect(typeof entry?.collectionId).toBe('string');
      expect(entry.collectionId.trim().length).toBeGreaterThan(0);
      expect(typeof entry?.cardType).toBe('string');
      expect(entry.cardType.trim().length).toBeGreaterThan(0);

      const fileUrl = String(entry?.fileUrl || '').trim();
      const filePath = String(entry?.filePath || entry?.file_path || '').trim();
      expect(fileUrl || filePath, `Entry ${entry.id} must define fileUrl or filePath`).toBeTruthy();

      expect(fileUrl.startsWith('/forms/'), `Entry ${entry.id} fileUrl must start with /forms/: ${fileUrl}`).toBe(true);
      expect(/\/forms\/(?:EN|HE)(?:\/|$)/.test(fileUrl), `Entry ${entry.id} has uppercase direct language segment in runtime path: ${fileUrl}`).toBe(false);
      expect(/\/forms\/[^/]+\/(?:EN|HE)(?:\/|$)/.test(fileUrl), `Entry ${entry.id} has uppercase nested language segment in runtime path: ${fileUrl}`).toBe(false);

      expect(filePath.startsWith('public/forms/'), `Entry ${entry.id} filePath must start with public/forms/: ${filePath}`).toBe(true);
      expect(/\.pdf$/i.test(filePath), `Entry ${entry.id} filePath must end with .pdf: ${filePath}`).toBe(true);
      expect(fs.existsSync(toAbsoluteFromRepoPath(filePath)), `Entry ${entry.id} points to missing file: ${filePath}`).toBe(true);
    }
  });
});

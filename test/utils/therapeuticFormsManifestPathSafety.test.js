import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = process.cwd();
const FORMS_ROOT = path.join(ROOT, 'public/forms');

function walk(dirPath) {
  const output = [];
  for (const dirent of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const absolute = path.join(dirPath, dirent.name);
    if (dirent.isDirectory()) {
      output.push(...walk(absolute));
      continue;
    }
    output.push(absolute);
  }
  return output;
}

function toRepoRelative(filePath) {
  return filePath.replace(/\\/g, '/');
}

function resolveManifestPath(candidate) {
  if (typeof candidate !== 'string' || !candidate.trim()) return null;
  const trimmed = candidate.trim().replace(/\\/g, '/');
  if (trimmed.startsWith('public/')) return path.join(ROOT, trimmed);
  if (trimmed.startsWith('/forms/')) return path.join(ROOT, 'public', trimmed.slice(1));
  return path.join(ROOT, trimmed);
}

function resolveLegacyWrapperFallback(manifestFile, candidatePath) {
  const manifestDir = path.dirname(manifestFile);
  const baseName = path.basename(String(candidatePath || ''));
  if (!baseName) return null;
  const wrapperFallback = path.join(manifestDir, baseName);
  return fs.existsSync(wrapperFallback) ? wrapperFallback : null;
}

function isLegacyWrapperManifest(manifestFile) {
  const normalized = String(path.relative(ROOT, manifestFile)).replace(/\\/g, '/');
  return /public\/forms\/module[-_]\d+\//.test(normalized) || /_github_upload\//.test(normalized);
}

describe('therapeutic forms manifest path safety', () => {
  it('validates manifest file_path and preview_path targets under public/forms', () => {
    const manifestFiles = walk(FORMS_ROOT)
      .filter((filePath) => /manifest.*\.json$/i.test(path.basename(filePath)))
      .sort();

    expect(manifestFiles.length).toBeGreaterThan(0);

    const metadataWarnings = [];

    for (const manifestFile of manifestFiles) {
      const sourcePath = toRepoRelative(path.relative(ROOT, manifestFile));
      let parsed;
      try {
        parsed = JSON.parse(fs.readFileSync(manifestFile, 'utf8'));
      } catch (error) {
        throw new Error(`Failed parsing manifest JSON: ${sourcePath}\n${error?.message || error}`);
      }

      const items = Array.isArray(parsed?.items) ? parsed.items : [];
      for (const [index, item] of items.entries()) {
        const prefix = `${sourcePath} item[${index}]`;
        const filePath = item?.file_path;
        const previewPath = item?.preview_path;

        if (typeof filePath === 'string' && filePath.trim()) {
          expect(filePath.startsWith('public/forms/'), `${prefix} file_path must remain under public/forms/: ${filePath}`).toBe(true);
          const absoluteFilePath = resolveManifestPath(filePath);
          const fileExists = fs.existsSync(absoluteFilePath);
          const legacyFallbackPath = fileExists ? null : resolveLegacyWrapperFallback(manifestFile, filePath);
          expect(
            fileExists || Boolean(legacyFallbackPath),
            `${prefix} file_path missing on disk: ${filePath}`
          ).toBe(true);
        }

        if (typeof previewPath === 'string' && previewPath.trim()) {
          const absolutePreviewPath = resolveManifestPath(previewPath);
          const previewExists = fs.existsSync(absolutePreviewPath);
          const legacyPreviewFallbackPath = previewExists ? null : resolveLegacyWrapperFallback(manifestFile, previewPath);
          if (!previewExists && !legacyPreviewFallbackPath && isLegacyWrapperManifest(manifestFile)) {
            metadataWarnings.push(`${prefix} preview_path missing for legacy wrapper manifest: ${previewPath}`);
          } else {
            expect(
              previewExists || Boolean(legacyPreviewFallbackPath),
              `${prefix} preview_path missing on disk: ${previewPath}`
            ).toBe(true);
          }
        }

        const language = item?.language ?? parsed?.language;
        const audience = item?.audience ?? parsed?.audience;
        const category = item?.category ?? item?.main_category ?? parsed?.category ?? parsed?.main_category;
        const moduleOrStage = item?.module_number ?? item?.stage_number ?? parsed?.module_number ?? parsed?.stage_number;

        if (!language) metadataWarnings.push(`${prefix} missing language metadata`);
        if (!audience) metadataWarnings.push(`${prefix} missing audience metadata`);
        if (!category) metadataWarnings.push(`${prefix} missing category metadata`);
        if (moduleOrStage == null) metadataWarnings.push(`${prefix} missing module/stage metadata`);
      }
    }

    if (metadataWarnings.length > 0) {
      console.warn(
        `[therapeutic forms manifest path safety] metadata warnings (${metadataWarnings.length}):\n${metadataWarnings.join('\n')}`
      );
    }
  });
});

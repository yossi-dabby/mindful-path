import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { describe, it, expect } from 'vitest';

import {
  ADOLESCENTS_CBT_CORE_EN_MANIFEST,
  FORMS_ADOLESCENTS_CBT_CORE_EN,
  FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL,
} from '../../src/data/therapeuticForms/forms.adolescents.cbt-core.en.js';
import {
  resolveAdolescentsCBTCoreEnglishFormByContent,
  resolveFormIntent,
} from '../../src/utils/resolveFormIntent.js';
import { buildTherapistFormCatalog } from '../../src/lib/workflowContextInjector.js';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';

const REPO_ROOT = process.cwd();
const CORE_EN_ROOT = path.join(REPO_ROOT, 'public/forms/en/adolescents/cbt-core');
const LEGACY_CORE_ROOT = path.join(REPO_ROOT, 'cbt-core');
const THERAPEUTIC_FORMS_PAGE_PATH = path.join(REPO_ROOT, 'src/pages/TherapeuticForms.jsx');
const RESOLVER_SOURCE_PATH = path.join(REPO_ROOT, 'src/utils/resolveFormIntent.js');
const THIS_TEST_FILE = path.relative(REPO_ROOT, fileURLToPath(import.meta.url));
const REFERENCE_AUDIT_EXTENSIONS = new Set([
  '.cjs',
  '.css',
  '.html',
  '.js',
  '.json',
  '.jsx',
  '.md',
  '.mdx',
  '.mjs',
  '.sh',
  '.ts',
  '.tsx',
  '.txt',
  '.yaml',
  '.yml',
]);

function idOf(result) {
  return result?.form_id ?? null;
}

function stageOf(result) {
  const id = idOf(result);
  const match = id?.match(/^tf-adolescents-cbt-core-(\d+)-\d-en$/);
  return match ? Number(match[1]) : null;
}

function diskPathFromUrl(fileUrl) {
  return path.join(REPO_ROOT, 'public', String(fileUrl || '').replace(/^\//, ''));
}

function listLegacyRootReferences() {
  const ignoredDirs = new Set([
    '.git',
    'dist',
    'node_modules',
  ]);
  const findings = [];
  const pending = [REPO_ROOT];

  while (pending.length > 0) {
    const current = pending.pop();
    const relativeCurrent = path.relative(REPO_ROOT, current);
    if (relativeCurrent && ignoredDirs.has(relativeCurrent)) continue;

    for (const entry of fs.readdirSync(current, { withFileTypes: true })) {
      const entryPath = path.join(current, entry.name);
      const relativePath = path.relative(REPO_ROOT, entryPath);

      if (entry.isDirectory()) {
        if (
          ignoredDirs.has(relativePath) ||
          relativePath === 'public/forms/en/adolescents/cbt-core'
        ) {
          continue;
        }
        pending.push(entryPath);
        continue;
      }

      if (!REFERENCE_AUDIT_EXTENSIONS.has(path.extname(entry.name).toLowerCase())) {
        continue;
      }
      if (relativePath === THIS_TEST_FILE) continue;

      const contents = fs.readFileSync(entryPath, 'utf8');
      contents.split(/\r?\n/).forEach((line, index) => {
        if (
          line.includes('cbt-core/') &&
          !line.includes('public/forms/en/adolescents/cbt-core/')
        ) {
          findings.push(`${relativePath}:${index + 1}:${line.trim()}`);
        }
      });
    }
  }

  return findings;
}

const LEGACY_ROOT_REFERENCES = listLegacyRootReferences();

describe('Adolescent CBT Core EN — registry and assets', () => {
  it('registers 30 core individual forms from manifest', () => {
    expect(FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL).toHaveLength(30);
    expect(FORMS_ADOLESCENTS_CBT_CORE_EN).toHaveLength(30);
  });

  it('has exactly 6 stages with 5 worksheets each', () => {
    const byStage = FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL.reduce((acc, form) => {
      const stage = Number(form.stageNumber);
      if (!acc.has(stage)) acc.set(stage, []);
      acc.get(stage).push(form.worksheetNumber);
      return acc;
    }, new Map());

    expect([...byStage.keys()].sort((a, b) => a - b)).toEqual([1, 2, 3, 4, 5, 6]);
    for (let stage = 1; stage <= 6; stage += 1) {
      const worksheetNumbers = (byStage.get(stage) || []).sort();
      expect(worksheetNumbers).toEqual([
        `${stage}.1`,
        `${stage}.2`,
        `${stage}.3`,
        `${stage}.4`,
        `${stage}.5`,
      ]);
    }
  });

  it('all core EN forms are approved and include required therapeutic metadata fields', () => {
    for (const form of FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL) {
      expect(form.approved).toBe(true);
      expect(form.audience).toBe('adolescents');
      expect(form.language).toBe('en');
      expect(form.ageRange).toBe('12-18');
      expect(form.category).toBe('adolescents_cbt_core');
      expect(typeof form.stageNumber).toBe('number');
      expect(typeof form.stageTitle).toBe('string');
      expect(typeof form.worksheetNumber).toBe('string');
      expect(typeof form.title).toBe('string');
      expect(typeof form.fileUrl).toBe('string');
      expect(typeof form.therapeuticGoal).toBe('string');
      expect(typeof form.shortContentDescription).toBe('string');
      expect(Array.isArray(form.whenToUse)).toBe(true);
      expect(Array.isArray(form.teenSignals)).toBe(true);
      expect(Array.isArray(form.clinicalKeywords)).toBe(true);
      expect(Array.isArray(form.intentPhrases)).toBe(true);
      expect(Array.isArray(form.notFor)).toBe(true);
      expect(Array.isArray(form.relatedForms)).toBe(true);
    }
  });

  it('target folder, manifest, readme and QA summary exist; all registered files exist and are non-empty', () => {
    expect(fs.existsSync(CORE_EN_ROOT)).toBe(true);
    expect(fs.existsSync(path.join(CORE_EN_ROOT, 'manifest.adolescents-cbt-core-en.json'))).toBe(true);
    expect(fs.existsSync(path.join(CORE_EN_ROOT, 'README_EN.md'))).toBe(true);
    expect(fs.existsSync(path.join(CORE_EN_ROOT, 'QA_SUMMARY_EN.txt'))).toBe(true);

    for (const form of FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL) {
      const fileUrl = form.languages?.en?.file_url;
      expect(fileUrl, `${form.id} missing en file_url`).toBeTruthy();
      const diskPath = diskPathFromUrl(fileUrl);
      expect(fs.existsSync(diskPath), `${form.id} missing file at ${diskPath}`).toBe(true);
      expect(fs.statSync(diskPath).size, `${form.id} file is empty`).toBeGreaterThan(0);
    }
  });

  it('manifest is canonical source for the 30 English worksheets', () => {
    expect(ADOLESCENTS_CBT_CORE_EN_MANIFEST.audience).toBe('adolescents');
    expect(ADOLESCENTS_CBT_CORE_EN_MANIFEST.ageRange).toBe('12-18');
    expect(ADOLESCENTS_CBT_CORE_EN_MANIFEST.language).toBe('en');
    expect(ADOLESCENTS_CBT_CORE_EN_MANIFEST.totalForms).toBe(30);

    const manifestForms = ADOLESCENTS_CBT_CORE_EN_MANIFEST.forms.map((form) => form.fileUrl);
    const registryForms = FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL.map(
      (form) => form.languages.en.file_url
    );
    expect(new Set(manifestForms)).toEqual(new Set(registryForms));
  });

  it('canonical folder retains the full manifest-backed asset set after duplicate removal', () => {
    const expectedFiles = new Set([
      'manifest.adolescents-cbt-core-en.json',
      'README_EN.md',
      'QA_SUMMARY_EN.txt',
      ...ADOLESCENTS_CBT_CORE_EN_MANIFEST.forms.map((form) => path.basename(form.fileUrl)),
    ]);
    const actualFiles = fs.readdirSync(CORE_EN_ROOT).filter((entry) =>
      fs.statSync(path.join(CORE_EN_ROOT, entry)).isFile()
    );

    expect(new Set(actualFiles)).toEqual(expectedFiles);
  });

  it('removes the duplicate repo-root cbt-core folder after assets are verified in the canonical folder', () => {
    expect(fs.existsSync(LEGACY_CORE_ROOT)).toBe(false);
  });

  it('has no remaining repo-root cbt-core path references outside the canonical folder', () => {
    expect(LEGACY_ROOT_REFERENCES).toEqual([]);
  });
});

describe('Adolescent CBT Core EN — forms library visibility', () => {
  const pageSource = fs.readFileSync(THERAPEUTIC_FORMS_PAGE_PATH, 'utf8');

  it('therapeutic forms page uses canonical ALL_FORMS registry (adolescent CBT core EN forms are part of ALL_FORMS)', () => {
    // Since PR #713, the page uses ALL_FORMS directly via canonical registry.
    // FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL is no longer imported separately on the page.
    expect(pageSource).toContain('ALL_FORMS');
    expect(pageSource).not.toContain('THERAPEUTIC_FORMS_LIBRARY_REGISTRY');
  });
});

describe('Adolescent CBT Core EN — content-aware resolver QA prompts', () => {
  const resolverSource = fs.readFileSync(RESOLVER_SOURCE_PATH, 'utf8');

  it('resolver candidates come directly from the canonical manifest-backed adolescent CBT core registry', () => {
    expect(resolverSource).toContain('FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL');
    expect(resolverSource).toContain('return FORMS_ADOLESCENTS_CBT_CORE_EN_INDIVIDUAL.filter');
  });

  it('A: overwhelmed/inside-state query maps to Stage 1', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent("Teen feels overwhelmed and doesn't know what is happening inside");
    expect(stageOf(result)).toBe(1);
    expect([
      'tf-adolescents-cbt-core-1-1-en',
      'tf-adolescents-cbt-core-1-2-en',
      'tf-adolescents-cbt-core-1-4-en',
    ]).toContain(idOf(result));
  });

  it('B: automatic-thoughts query maps to Stage 2', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent("Teen has automatic thoughts like I won't succeed or everyone will blame me");
    expect(stageOf(result)).toBe(2);
  });

  it('C: evidence-check query maps to Stage 3', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('Teen needs to check the evidence for a thought');
    expect(stageOf(result)).toBe(3);
  });

  it('D: action-choice query maps to Stage 4', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('Teen needs help choosing what action to take in a difficult situation');
    expect(stageOf(result)).toBe(4);
  });

  it('E: avoidance/exposure query maps to Stage 5', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('Teen avoids things and needs gradual exposure with small steps');
    expect(stageOf(result)).toBe(5);
  });

  it('F: weekly check-in/personal plan query maps to Stage 6', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('Teen needs a weekly check-in and encouragement personal plan');
    expect(stageOf(result)).toBe(6);
  });

  it('H: child-age query does not force adolescent English core forms (G list check is in canonical catalog section)', () => {
    const result = resolveAdolescentsCBTCoreEnglishFormByContent('Child age 8 has fears and needs help');
    expect(result).toBeNull();
  });

  it('supports exact-id resolution and title/intention matching', () => {
    const byId = resolveFormIntent('tf-adolescents-cbt-core-1-1-en', 'en');
    const byContent = resolveAdolescentsCBTCoreEnglishFormByContent('what is going on for me right now?');
    expect(idOf(byId)).toBe('tf-adolescents-cbt-core-1-1-en');
    expect(stageOf(byContent)).toBe(1);
  });
});

describe('Adolescent CBT Core EN — canonical manifest catalog', () => {
  const catalog = buildTherapistFormCatalog(ALL_FORMS);
  const heading = '[ENGLISH ADOLESCENT CBT CORE SERIES 1 — CANONICAL MANIFEST]';

  it('catalog includes canonical English adolescent CBT core section and metadata guidance', () => {
    expect(catalog).toContain(heading);
    expect(catalog).toContain('Stage 1');
    expect(catalog).toContain('[FORM:tf-adolescents-cbt-core-1-1-en]');
    expect(catalog).toContain('desc=');
    expect(catalog).toContain('goal=');
    expect(catalog).toContain('use=');
    expect(catalog).toContain('signals=');
    expect(catalog).toContain('keywords=');
    expect(catalog).toContain('intent=');
    expect(catalog).toContain('notFor=');
    expect(catalog).toContain('related=');
  });

  it('G: canonical section contains exactly the 30 manifest worksheet markers and no Hebrew/specialized mix-ins', () => {
    const sectionStart = catalog.indexOf(heading);
    const nextSectionStart = catalog.indexOf(
      '\n[ENGLISH ADOLESCENT CBT SPECIALIZED SERIES — CANONICAL MANIFEST]',
      sectionStart
    );
    const section = nextSectionStart === -1
      ? catalog.slice(sectionStart)
      : catalog.slice(sectionStart, nextSectionStart);
    const ids = section.match(/\[FORM:tf-adolescents-cbt-core-\d+-\d-en\]/g) || [];
    expect(ids).toHaveLength(30);
    expect(section).not.toContain('tf-adolescents-cbt-specialized-');

    for (const form of ADOLESCENTS_CBT_CORE_EN_MANIFEST.forms) {
      expect(section).toContain(form.title);
    }
  });
});

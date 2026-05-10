import fs from 'fs';
import path from 'path';
import { describe, it, expect } from 'vitest';
import { FORMS_CHILDREN_CBT_PREMIUM } from '../../src/data/therapeuticForms/forms.children.cbt-premium.js';

const REPO_ROOT = process.cwd();
const LOCKED_PREFIX = '/forms/he/children/cbt-premium-locked/';
const LOCKED_DIR = path.join(REPO_ROOT, 'public/forms/he/children/cbt-premium-locked');
const MIN_BYTES = 100 * 1024;
const FORBIDDEN_PLACEHOLDER_MARKERS = [
  'Mindful Path - Hebrew Children CBT Premium Series',
  'This is a licensed therapeutic worksheet',
  'Copyright Mindful Path CBT App',
];

const CHILDREN_PREMIUM_FORMS = FORMS_CHILDREN_CBT_PREMIUM.filter(
  (form) => form.approved === true && form.audience === 'children'
);

const CHILDREN_PREMIUM_INDIVIDUAL_FORMS = CHILDREN_PREMIUM_FORMS.filter(
  (form) => form.category === 'children_cbt_process'
);

function getDiskPathFromUrl(fileUrl) {
  return path.join(REPO_ROOT, 'public', fileUrl.replace(/^\//, ''));
}

describe('Hebrew children CBT premium asset integrity', () => {
  it('contains 30 approved individual children CBT forms', () => {
    expect(CHILDREN_PREMIUM_INDIVIDUAL_FORMS).toHaveLength(30);
  });

  it('no individual file_url uses children-cbt-stage-* placeholder filename pattern', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL_FORMS) {
      const fileUrl = form.languages?.he?.file_url;
      expect(fileUrl).toBeTruthy();
      expect(fileUrl).not.toContain('children-cbt-stage-');
    }
  });

  it('every registered Hebrew children premium PDF points under locked folder and exists on disk', () => {
    for (const form of CHILDREN_PREMIUM_FORMS) {
      const fileUrl = form.languages?.he?.file_url;
      expect(fileUrl, `${form.id} must have he.file_url`).toBeTruthy();
      expect(fileUrl).toMatch(/^\/forms\/he\/children\/cbt-premium-locked\/.+\.pdf$/);

      const diskPath = getDiskPathFromUrl(fileUrl);
      expect(diskPath.startsWith(LOCKED_DIR)).toBe(true);
      expect(fs.existsSync(diskPath), `${form.id} missing file ${diskPath}`).toBe(true);
    }
  });

  it('every registered individual Hebrew children premium PDF is at least 100KB', () => {
    for (const form of CHILDREN_PREMIUM_INDIVIDUAL_FORMS) {
      const fileUrl = form.languages?.he?.file_url;
      const diskPath = getDiskPathFromUrl(fileUrl);
      const size = fs.statSync(diskPath).size;
      expect(size, `${form.id} is too small (${size} bytes): ${diskPath}`).toBeGreaterThanOrEqual(MIN_BYTES);
    }
  });

  it('registered children CBT premium PDFs do not contain known placeholder markers', () => {
    for (const form of CHILDREN_PREMIUM_FORMS) {
      const fileUrl = form.languages?.he?.file_url;
      const diskPath = getDiskPathFromUrl(fileUrl);
      const content = fs.readFileSync(diskPath).toString('latin1');

      for (const marker of FORBIDDEN_PLACEHOLDER_MARKERS) {
        expect(content.includes(marker), `${form.id} contains placeholder marker: ${marker}`).toBe(false);
      }
    }
  });

  it('stage 6.3 points to the approved my-power-card worksheet', () => {
    const stage63 = CHILDREN_PREMIUM_INDIVIDUAL_FORMS.find(
      (form) => form.id === 'tf-children-cbt-stage-6-3-premium-he'
    );

    expect(stage63).toBeTruthy();
    expect(stage63.languages.he.file_url).toBe(`${LOCKED_PREFIX}06-03-my-power-card-he.pdf`);

    const diskPath = getDiskPathFromUrl(stage63.languages.he.file_url);
    expect(fs.existsSync(diskPath)).toBe(true);
    expect(fs.statSync(diskPath).size).toBeGreaterThanOrEqual(MIN_BYTES);
  });
});

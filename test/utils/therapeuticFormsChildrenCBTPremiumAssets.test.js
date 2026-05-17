import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import { ALL_FORMS } from '../../src/data/therapeuticForms/index.js';

describe('therapeuticFormsChildrenCBTPremiumAssets.test.js — zero installed forms', () => {
  it('removes public/forms runtime asset tree', () => {
    expect(fs.existsSync('/home/runner/work/mindful-path/mindful-path/public/forms')).toBe(false);
  });

  it('keeps runtime catalog free of form file URLs', () => {
    expect(ALL_FORMS).toEqual([]);
  });
});

/**
 * pages-config.invariants.test.js
 *
 * Verifies structural invariants of src/pages.config.js by parsing its source
 * text (avoiding the need to actually import React components that use Vite
 * aliases not available in the Node/vitest environment).
 *
 * Invariants checked:
 *   - PAGES object has no duplicate keys
 *   - Every page key is a non-empty string with no spaces or leading slash
 *   - pagesConfig.mainPage is declared
 *   - pagesConfig.mainPage value matches one of the PAGES keys
 *
 * Purely additive; no production code is modified.
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const CONFIG_PATH = resolve(process.cwd(), 'src/pages.config.js');
const source = readFileSync(CONFIG_PATH, 'utf-8');

/**
 * Extract the string keys from the PAGES object literal in the source.
 * Matches patterns like:  "Chat": Chat,  or  "Home": Home,
 */
function extractPageKeys(src) {
  const keys = [];
  // Match quoted string keys in the PAGES object literal
  const keyRegex = /^\s+"([^"]+)"\s*:/gm;
  let m;
  while ((m = keyRegex.exec(src)) !== null) {
    keys.push(m[1]);
  }
  return keys;
}

/**
 * Extract the mainPage value from pagesConfig.
 * Matches: mainPage: "Home",
 * Only looks in non-comment lines (lines that don't start with * or //).
 */
function extractMainPage(src) {
  // Strip JS block comment lines (lines starting with optional whitespace then * or //)
  const codeLines = src
    .split('\n')
    .filter((line) => !/^\s*(\*|\/\/)/.test(line))
    .join('\n');
  const m = codeLines.match(/mainPage\s*:\s*["']([^"']+)["']/);
  return m ? m[1] : null;
}

const PAGE_KEYS = extractPageKeys(source);
const MAIN_PAGE = extractMainPage(source);

describe('pages.config.js — structural invariants (source text analysis)', () => {
  it('source file is readable and non-empty', () => {
    expect(source.length).toBeGreaterThan(0);
  });

  it('PAGES object contains at least one entry', () => {
    expect(PAGE_KEYS.length).toBeGreaterThan(0);
  });

  it('every PAGES key is a non-empty string', () => {
    for (const key of PAGE_KEYS) {
      expect(typeof key).toBe('string');
      expect(key.trim().length).toBeGreaterThan(0);
    }
  });

  it('no PAGES keys contain spaces', () => {
    for (const key of PAGE_KEYS) {
      expect(key, `Key "${key}" must not contain spaces`).not.toMatch(/\s/);
    }
  });

  it('no PAGES keys start with a slash', () => {
    for (const key of PAGE_KEYS) {
      expect(key, `Key "${key}" must not start with a slash`).not.toMatch(/^\//);
    }
  });

  it('no duplicate PAGES keys', () => {
    const unique = new Set(PAGE_KEYS);
    if (unique.size !== PAGE_KEYS.length) {
      const duplicates = PAGE_KEYS.filter((k, i) => PAGE_KEYS.indexOf(k) !== i);
      expect.fail(`Duplicate PAGES keys found: ${[...new Set(duplicates)].join(', ')}`);
    }
    expect(unique.size).toBe(PAGE_KEYS.length);
  });

  it('pagesConfig.mainPage is declared', () => {
    expect(MAIN_PAGE, 'pagesConfig.mainPage must be present in source').not.toBeNull();
    expect(typeof MAIN_PAGE).toBe('string');
    expect(MAIN_PAGE.trim().length).toBeGreaterThan(0);
  });

  it('pagesConfig.mainPage matches a key in PAGES', () => {
    expect(PAGE_KEYS, `pagesConfig.mainPage "${MAIN_PAGE}" must be a key in PAGES`).toContain(MAIN_PAGE);
  });

  it('source exports pagesConfig with a Pages property', () => {
    expect(source).toMatch(/pagesConfig\s*=/);
    expect(source).toMatch(/Pages\s*:/);
  });
});

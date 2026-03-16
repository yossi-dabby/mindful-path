/**
 * translations.no-placeholders.test.js
 *
 * Scans all translation strings across all 7 supported languages and fails on
 * conservative placeholder markers that indicate unfinished copy:
 *   TODO, TBD, FIXME, lorem, @@, PLACEHOLDER, <MISSING>
 *
 * Purely additive; no production code is modified.
 */

import { describe, it, expect } from 'vitest';
import { translations } from '../../src/components/i18n/translations.jsx';

/**
 * Markers that must not appear in any translation string.
 *
 * NOTE: Patterns that match real words in non-English locales (e.g. Spanish
 * "todo" = "everything") use case-sensitive, word-boundary patterns so that
 * only developer-style ALL-CAPS placeholders are flagged.
 */
const FORBIDDEN_MARKERS = [
  /\bTODO\b/,          // uppercase only — avoids Spanish "todo" false positive
  /\bTBD\b/,           // uppercase only
  /\bFIXME\b/,         // uppercase only
  /\blorem\b/i,        // always a placeholder; safe case-insensitive
  /@@/,
  /\bPLACEHOLDER\b/,  // uppercase only
  /<MISSING>/i,
];

const SUPPORTED_LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

/**
 * Recursively collect all leaf string values from a nested object.
 * Returns an array of { path, value } pairs.
 */
function collectStrings(obj, prefix = '') {
  const results = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof value === 'string') {
      results.push({ path, value });
    } else if (value && typeof value === 'object') {
      results.push(...collectStrings(value, path));
    }
  }
  return results;
}

describe('translations — no placeholder markers', () => {
  for (const lang of SUPPORTED_LANGUAGES) {
    const langData = translations[lang]?.translation;

    it(`language "${lang}" has a translation object`, () => {
      expect(langData, `translations["${lang}"].translation must be defined`).toBeDefined();
      expect(typeof langData).toBe('object');
    });

    if (!langData) continue;

    const strings = collectStrings(langData);

    for (const marker of FORBIDDEN_MARKERS) {
      it(`language "${lang}" has no strings matching ${marker}`, () => {
        const violations = strings.filter(({ value }) => marker.test(value));
        if (violations.length > 0) {
          const details = violations
            .map(({ path, value }) => `  [${path}]: "${value}"`)
            .join('\n');
          expect.fail(
            `Found placeholder marker "${marker}" in language "${lang}":\n${details}`
          );
        }
      });
    }
  }
});

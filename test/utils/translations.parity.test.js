import { describe, it, expect } from 'vitest';
import { translations } from '../../src/components/i18n/translations.jsx';

const NON_ENGLISH_LANGUAGES = ['he', 'es', 'fr', 'de', 'it', 'pt'];

/**
 * Recursively collect all dot-notation key paths from a nested object.
 * e.g. { a: { b: 'x' } } => ['a.b']
 */
function collectKeyPaths(obj, prefix = '') {
  const paths = [];
  for (const key of Object.keys(obj)) {
    const fullPath = prefix ? `${prefix}.${key}` : key;
    const value = obj[key];
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      paths.push(...collectKeyPaths(value, fullPath));
    } else {
      paths.push(fullPath);
    }
  }
  return paths;
}

/**
 * Resolve a dot-notation path against an object.
 * Returns undefined if any segment is missing.
 */
function resolvePath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc != null ? acc[key] : undefined), obj);
}

describe('translations key parity', () => {
  const enTranslation = translations.en.translation;
  const enKeyPaths = collectKeyPaths(enTranslation);

  for (const lng of NON_ENGLISH_LANGUAGES) {
    describe(`${lng} has all English keys`, () => {
      const lngTranslation = translations[lng]?.translation;

      it(`translations.${lng}.translation is defined`, () => {
        expect(lngTranslation, `translations.${lng}.translation is missing`).toBeDefined();
      });

      for (const keyPath of enKeyPaths) {
        it(`translations.${lng}.translation.${keyPath}`, () => {
          const value = resolvePath(lngTranslation, keyPath);
          expect(value, `Missing key "${keyPath}" in language "${lng}"`).toBeDefined();
        });
      }
    });
  }
});

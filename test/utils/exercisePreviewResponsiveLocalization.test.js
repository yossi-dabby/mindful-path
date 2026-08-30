import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  EXERCISE_LEGACY_TITLE_IDS,
  EXERCISE_LEGACY_TITLE_TRANSLATIONS
} from '../../src/components/exercises/exerciseLegacyTitleTranslations.js';
import { localizeExercise } from '../../src/components/exercises/exerciseLocalization.js';

const LOCALES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

describe('exercise preview localization and responsive fixes', () => {
  it('localizes the three legacy API titles in all seven locales', () => {
    expect(EXERCISE_LEGACY_TITLE_IDS).toEqual([
      'legacy-calm-center',
      'legacy-sleep-body-scan',
      'legacy-behavioral-activation-scheduling'
    ]);

    for (const id of EXERCISE_LEGACY_TITLE_IDS) {
      const translations = EXERCISE_LEGACY_TITLE_TRANSLATIONS[id];
      expect(Object.keys(translations).sort()).toEqual([...LOCALES].sort());
      for (const locale of LOCALES) {
        expect(translations[locale].title.trim().length).toBeGreaterThan(3);
        if (locale !== 'en') expect(translations[locale].title).not.toBe(translations.en.title);
      }
    }
  });

  it('resolves legacy API records by their canonical English titles', () => {
    const cases = [
      ['Calm & Center', 'רוגע ומיקוד'],
      ['Sleep Body Scan', 'סריקת גוף לשינה'],
      ['Behavioral Activation Scheduling', 'תכנון הפעלה התנהגותית']
    ];

    for (const [sourceTitle, expectedTitle] of cases) {
      const localized = localizeExercise({
        id: `api-${sourceTitle.toLowerCase().replace(/[^a-z]+/g, '-')}`,
        title: sourceTitle,
        language: 'en'
      }, 'he');

      expect(localized.title).toBe(expectedTitle);
      expect(localized.content_language).toBe('he');
    }
  });

  it('keeps the tablet title intact and the active category visible after resize', () => {
    const source = readFileSync(new URL('../../src/pages/Exercises.jsx', import.meta.url), 'utf8');

    expect(source).toContain('lg:flex-row lg:items-center');
    expect(source).toContain('lg:text-4xl whitespace-nowrap');
    expect(source).toContain('new ResizeObserver(keepActiveCategoryVisible)');
    expect(source).toContain('const resizeTarget = categoryScrollerRef.current');
    expect(source).toContain('ref={categoryScrollerRef}');
    expect(source).toContain('dir="ltr"');
    expect(source).toContain('scroller.scrollTo({ left: Math.max(0, centeredOffset)');
    expect(source).toContain("window.addEventListener('resize', keepActiveCategoryVisible)");
    expect(source).toContain("scrollbarWidth: 'thin'");
    expect(source).toContain('bg-gradient-to-r from-teal-100');
    expect(source).toContain('bg-gradient-to-l from-teal-100');
  });
});

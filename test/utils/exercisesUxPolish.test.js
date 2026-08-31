import { existsSync, readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import {
  EXERCISE_LEGACY_TITLE_IDS,
  EXERCISE_LEGACY_TITLE_TRANSLATIONS
} from '../../src/components/exercises/exerciseLegacyTitleTranslations.js';
import { localizeExercise } from '../../src/components/exercises/exerciseLocalization.js';
import { wave3Batch3Translations } from '../../src/components/i18n/wave3Batch3Translations.js';

const LOCALES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];
const SOURCE_TITLES = {
  'legacy-calm-center': 'Calm & Center',
  'legacy-sleep-body-scan': 'Sleep Body Scan',
  'legacy-behavioral-activation-scheduling': 'Behavioral Activation Scheduling'
};

describe('Exercises UX polish — quick start, favorites, AI controls, and artwork', () => {
  it('keeps every quick-start legacy exercise complete in all seven locales', () => {
    expect(EXERCISE_LEGACY_TITLE_IDS).toEqual(Object.keys(SOURCE_TITLES));

    for (const id of EXERCISE_LEGACY_TITLE_IDS) {
      const translations = EXERCISE_LEGACY_TITLE_TRANSLATIONS[id];
      expect(Object.keys(translations).sort()).toEqual([...LOCALES].sort());

      for (const locale of LOCALES) {
        const content = translations[locale];
        expect(content.title.trim().length, `${id}.${locale}.title`).toBeGreaterThan(3);
        expect(content.description.trim().length, `${id}.${locale}.description`).toBeGreaterThan(20);
        expect(content.tags.length, `${id}.${locale}.tags`).toBeGreaterThan(1);
        expect(content.steps.length, `${id}.${locale}.steps`).toBeGreaterThan(2);
        expect(content.benefits.length, `${id}.${locale}.benefits`).toBeGreaterThan(1);
        expect(content.tips.length, `${id}.${locale}.tips`).toBeGreaterThan(1);

        const localized = localizeExercise({
          id: `api-${id}`,
          title: SOURCE_TITLES[id],
          language: 'en'
        }, locale);
        expect(localized.title).toBe(content.title);
        expect(localized.description).toBe(content.description);
        expect(localized.content_language).toBe(locale);
      }
    }
  });

  it('opens the exact quick-start exercise object and limits the panel to four', () => {
    const source = readFileSync('src/components/exercises/QuickStartPanel.jsx', 'utf8');
    const page = readFileSync('src/pages/Exercises.jsx', 'utf8');

    expect(source).toContain('quickStartExercises.length < 4');
    expect(source).toContain('key={exercise.id}');
    expect(source).toContain('onClick={() => onSelectExercise(exercise)}');
    expect(source).toContain("t('exercises.quick_start.title')");
    expect(source).toContain("t('common.minutes_short')");
    expect(page).toContain('exercises={exercises}');
    expect(page).toContain('onSelectExercise={setSelectedExercise}');
  });

  it('makes the favorite state visually unmistakable and accessible', () => {
    const source = readFileSync('src/components/exercises/ExerciseLibrary.jsx', 'utf8');

    expect(source).toContain('aria-pressed={!!exercise.favorite}');
    expect(source).toContain("data-favorite={exercise.favorite ? 'true' : 'false'}");
    expect(source).toContain('bg-rose-100 border-rose-300 ring-2 ring-rose-200');
    expect(source).toContain('fill-red-500 text-red-500 scale-110');
    expect(source).toContain('min-h-[44px] min-w-[44px]');
  });

  it('can close and reopen AI recommendations without clearing their state', () => {
    const source = readFileSync('src/components/exercises/AiExerciseRecommendations.jsx', 'utf8');

    expect(source).toContain('const [isExpanded, setIsExpanded] = useState(true)');
    expect(source).toContain('if (!isExpanded)');
    expect(source).toContain('onClick={() => setIsExpanded(true)}');
    expect(source).toContain('onClick={() => setIsExpanded(false)}');
    expect(source).toContain("t('exercises.recommendations.close_aria')");
    expect(source).toContain("t('exercises.recommendations.show_aria')");
    expect(source).toContain('order-1 bg-teal-600');
    expect(source).toContain('order-2 bg-teal-50');

    for (const locale of LOCALES) {
      const recommendations = wave3Batch3Translations[locale].exercises.recommendations;
      for (const key of ['close', 'close_aria', 'show', 'show_aria']) {
        expect(recommendations[key], `${locale}.${key}`).toEqual(expect.any(String));
        expect(recommendations[key].trim()).not.toBe('');
      }
    }
  });

  it('uses the shared lightweight artwork only on intended exercise surfaces', () => {
    const globals = readFileSync('src/globals.css', 'utf8');
    const quickStart = readFileSync('src/components/exercises/QuickStartPanel.jsx', 'utf8');
    const library = readFileSync('src/components/exercises/ExerciseLibrary.jsx', 'utf8');
    const recommendations = readFileSync('src/components/exercises/AiExerciseRecommendations.jsx', 'utf8');

    expect(existsSync('public/assets/mindful-card-background.webp')).toBe(true);
    expect(globals).toContain("url('/assets/mindful-card-background.webp')");
    expect(globals).toContain('linear-gradient(hsl(var(--card) / 0.86)');
    expect(quickStart).toContain('exercise-card-art--subtle');
    expect(quickStart).toContain('exercise-card-art p-3');
    expect(library).toContain('exercise-card-art p-4');
    expect(recommendations).toContain('exercise-card-art--subtle');
    expect(recommendations).toContain('bg-teal-300/80');
  });
});

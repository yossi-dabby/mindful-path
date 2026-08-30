import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { translations } from '../../src/components/i18n/translations.jsx';

const LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];
const ANALYTICS_KEYS = [
  'range_last_7_days',
  'range_last_2_weeks',
  'range_last_month',
  'range_last_3_months',
  'date_range',
  'average_mood',
  'average_stress',
  'no_data_yet',
  'trend',
  'better',
  'shift',
  'steady',
  'mood_stress_levels',
  'mood_series',
  'stress_series',
  'energy_intensity',
  'energy',
  'intensity',
  'start_tracking',
  'triggers_title',
  'triggers_subtitle',
  'no_trigger_data',
  'boosters_title',
  'boosters_subtitle',
  'no_activity_data',
  'emotional_patterns',
  'emotional_patterns_subtitle',
  'no_emotion_data',
  'average_mood_value',
  'times_count'
];

describe('P1 wave 3 — mood analytics localization', () => {
  for (const language of LANGUAGES) {
    it(`contains all analytics keys in ${language}`, () => {
      const analytics = translations[language].translation.mood_tracker.analytics;
      for (const key of ANALYTICS_KEYS) {
        expect(analytics[key], `${language}.mood_tracker.analytics.${key}`).toEqual(expect.any(String));
        expect(analytics[key].trim()).not.toBe('');
      }
    });
  }

  it('uses the central locale for chart dates and translated chart copy', () => {
    const source = readFileSync('src/components/mood/MoodTrendChart.jsx', 'utf8');

    expect(source).toContain('getCurrentAppLocale(i18n)');
    expect(source).toContain('DATE_FNS_LOCALES');
    expect(source).toContain('locale: dateLocale');
    expect(source).toContain("t('mood_tracker.analytics.mood_stress_levels')");
    expect(source).toContain("t('mood_tracker.analytics.energy_intensity')");
    expect(source).not.toContain('>Mood Trends<');
    expect(source).not.toContain('>Mood & Stress Levels<');
    expect(source).not.toContain('>Energy & Intensity<');
  });

  it('translates trigger analysis and preserves dynamic text direction', () => {
    const source = readFileSync('src/components/mood/TriggerAnalysis.jsx', 'utf8');

    expect(source).toContain("t('mood_tracker.analytics.start_tracking')");
    expect(source).toContain("t('mood_tracker.analytics.triggers_title')");
    expect(source).toContain("t('mood_tracker.analytics.boosters_title')");
    expect(source).toContain("t('mood_tracker.analytics.emotional_patterns')");
    expect(source).toContain('dir="auto"');
    expect(source).not.toContain('>No trigger data yet<');
    expect(source).not.toContain('>No activity data yet<');
    expect(source).not.toContain('>No emotion data yet<');
  });
});

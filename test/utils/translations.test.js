import { describe, it, expect } from 'vitest';
import { translations } from '../../src/components/i18n/translations.jsx';

const LANGUAGES = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];

describe('translations', () => {
  it('all 7 languages are present in the translations object', () => {
    for (const lng of LANGUAGES) {
      expect(translations[lng], `Missing language: ${lng}`).toBeDefined();
      expect(translations[lng].translation, `Missing translation key for: ${lng}`).toBeDefined();
    }
  });

  it('all languages have core sidebar navigation keys', () => {
    const coreKeys = ['home', 'chat', 'coach', 'mood', 'journal', 'progress', 'exercises'];
    for (const lng of LANGUAGES) {
      const sidebar = translations[lng].translation.sidebar;
      expect(sidebar, `Missing sidebar for ${lng}`).toBeDefined();
      for (const key of coreKeys) {
        expect(sidebar[key]?.name, `Missing sidebar.${key}.name for ${lng}`).toBeTruthy();
      }
    }
  });

  it('all languages have settings language labels for all 7 languages', () => {
    const langCodes = ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'];
    for (const lng of LANGUAGES) {
      const langSettings = translations[lng].translation.settings?.language;
      expect(langSettings, `Missing settings.language for ${lng}`).toBeDefined();
      for (const code of langCodes) {
        expect(langSettings[code], `Missing settings.language.${code} for ${lng}`).toBeTruthy();
      }
    }
  });

  it('new languages (fr, de, it, pt) have mind_games interactive game UI in their own language', () => {
    const newLangs = {
      fr: { memory_match_title: 'Correspondance de Mémoire', moves: 'Mouvements' },
      de: { memory_match_title: 'Gedächtnis-Match', moves: 'Züge' },
      it: { memory_match_title: 'Abbinamento di Memoria', moves: 'Mosse' },
      pt: { memory_match_title: 'Combinação de Memória', moves: 'Movimentos' },
    };
    for (const [lng, expected] of Object.entries(newLangs)) {
      const mindGames = translations[lng].translation.mind_games;
      expect(mindGames, `Missing mind_games for ${lng}`).toBeDefined();
      expect(mindGames.memory_match?.title, `Wrong memory_match title for ${lng}`)
        .toBe(expected.memory_match_title);
      expect(mindGames.memory_match?.moves, `Wrong memory_match moves for ${lng}`)
        .toBe(expected.moves);
    }
  });

  it('new languages (fr, de, it, pt) have translated focus_flow game strings', () => {
    const expected = {
      fr: 'Flux de Concentration',
      de: 'Fokus-Fluss',
      it: 'Flusso di Concentrazione',
      pt: 'Fluxo de Foco',
    };
    for (const [lng, title] of Object.entries(expected)) {
      const focusFlow = translations[lng].translation.mind_games?.focus_flow;
      expect(focusFlow?.title, `Wrong focus_flow title for ${lng}`).toBe(title);
    }
  });

  it('new languages (fr, de, it, pt) have translated number_sequence game strings', () => {
    const expected = {
      fr: 'Séquence de Nombres',
      de: 'Zahlenfolge',
      it: 'Sequenza di Numeri',
      pt: 'Sequência Numérica',
    };
    for (const [lng, title] of Object.entries(expected)) {
      const numSeq = translations[lng].translation.mind_games?.number_sequence;
      expect(numSeq?.title, `Wrong number_sequence title for ${lng}`).toBe(title);
    }
  });

  it('English remains unaffected with English game strings', () => {
    const mindGames = translations.en.translation.mind_games;
    expect(mindGames.memory_match?.title).toBe('Memory Match');
    expect(mindGames.memory_match?.moves).toBe('Moves');
    expect(mindGames.focus_flow?.title).toBe('Focus Flow');
    expect(mindGames.number_sequence?.title).toBe('Number Sequence');
  });

  it('all languages have daily_check_in core UI keys translated', () => {
    const coreKeys = ['title', 'complete_title', 'step1_question', 'step2_question', 'step3_question',
      'intensity_low', 'intensity_high', 'emotions_label', 'intensity_label',
      'category_positive', 'category_intermediate', 'category_negative',
      'btn_return', 'btn_continue', 'btn_complete', 'delete_confirm'];
    for (const lng of LANGUAGES) {
      const dci = translations[lng].translation.daily_check_in;
      expect(dci, `Missing daily_check_in for ${lng}`).toBeDefined();
      for (const key of coreKeys) {
        expect(dci[key], `Missing daily_check_in.${key} for ${lng}`).toBeTruthy();
      }
    }
  });

  it('all languages have daily_check_in mood translations', () => {
    const moodKeys = ['excellent', 'good', 'okay', 'low', 'very_low'];
    for (const lng of LANGUAGES) {
      const moods = translations[lng].translation.daily_check_in?.moods;
      expect(moods, `Missing daily_check_in.moods for ${lng}`).toBeDefined();
      for (const key of moodKeys) {
        expect(moods[key], `Missing daily_check_in.moods.${key} for ${lng}`).toBeTruthy();
      }
    }
  });

  it('all languages have daily_check_in emotion translations', () => {
    const emotionSample = ['Happy', 'Sad', 'Anxious', 'Peaceful', 'Confused'];
    for (const lng of LANGUAGES) {
      const emotions = translations[lng].translation.daily_check_in?.emotions;
      expect(emotions, `Missing daily_check_in.emotions for ${lng}`).toBeDefined();
      for (const emotion of emotionSample) {
        expect(emotions[emotion], `Missing daily_check_in.emotions.${emotion} for ${lng}`).toBeTruthy();
      }
    }
  });
});

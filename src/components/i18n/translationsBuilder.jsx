// This module applies mind games UI and content translations to the main translations object
import { mindGamesUiStrings, mindGamesUiByLanguage } from './mindGamesUiTranslations';
import { mindGamesContentByLanguage } from './mindGamesContentTranslations';

const gameKeys = [
  'common','quick_win','opposite_action','urge_surfing','value_compass','tiny_experiment',
  'worry_time','dbt_stop','defusion_cards','calm_bingo','tipp_skills','accepts','improve',
  'self_soothe','memory_match','focus_flow','pattern_shift','word_association','number_sequence'
];

const contentKeys = [
  'thought_quiz','reframe_pick','value_compass','tiny_experiment','quick_win','calm_bingo',
  'dbt_stop','opposite_action','urge_surfing','worry_time','evidence_balance','defusion_cards',
  'tipp_skills','accepts','improve','self_soothe'
];

export function applyMindGamesTranslations(translations) {
  // Game IDs that have a `title` field in mindGamesUiStrings / mindGamesUiByLanguage
  const gameTitleKeys = [
    'memory_match', 'focus_flow', 'pattern_shift', 'word_association', 'number_sequence'
  ];

  ['en', 'he', 'es', 'fr', 'de', 'it', 'pt'].forEach((lng) => {
    const current = translations[lng]?.translation?.mind_games || {};
    const lngUi = mindGamesUiByLanguage[lng] || {};
    const lngContent = mindGamesContentByLanguage[lng] || {};
    const merged = { ...current };

    // Merge UI strings (buttons, labels, prompts)
    gameKeys.forEach(key => {
      merged[key] = { ...(current[key] || {}), ...(mindGamesUiStrings[key] || {}), ...(lngUi[key] || {}) };
    });

    // Also propagate title strings into mind_games.games.<id>.title so that
    // t('mind_games.games.memory_match.title') etc. resolve correctly.
    const currentGames = merged.games || {};
    gameTitleKeys.forEach(key => {
      const title = (lngUi[key] || mindGamesUiStrings[key] || {}).title;
      if (title) {
        currentGames[key] = { ...(currentGames[key] || {}), title };
      }
    });
    merged.games = currentGames;

    // Merge translated game content (items, values, tiles, etc.)
    contentKeys.forEach(key => {
      if (lngContent[key]) {
        merged.content = { ...(merged.content || {}), [key]: lngContent[key] };
      }
    });

    translations[lng].translation.mind_games = merged;
  });

  return translations;
}
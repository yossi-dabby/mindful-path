import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import GameCard from './GameCard';
import { gamesCatalog } from './mindGamesContent';

// Game metadata for recommendations
const gameMetadata = {
  thought_quiz: { category: 'CBT', skill: 'cognitive_restructuring' },
  reframe_pick: { category: 'CBT', skill: 'cognitive_restructuring' },
  value_compass: { category: 'ACT', skill: 'mindfulness' },
  tiny_experiment: { category: 'CBT', skill: 'behavioral_activation' },
  quick_win: { category: 'DBT', skill: 'behavioral_activation' },
  calm_bingo: { category: 'DBT', skill: 'grounding' },
  dbt_stop: { category: 'DBT', skill: 'emotion_regulation' },
  opposite_action: { category: 'DBT', skill: 'emotion_regulation' },
  urge_surfing: { category: 'DBT', skill: 'distress_tolerance' },
  worry_time: { category: 'CBT', skill: 'cognitive_restructuring' },
  evidence_balance: { category: 'CBT', skill: 'cognitive_restructuring' },
  defusion_cards: { category: 'ACT', skill: 'defusion' },
  tipp_skills: { category: 'DBT', skill: 'distress_tolerance' },
  accepts: { category: 'DBT', skill: 'distress_tolerance' },
  willing_hands: { category: 'DBT', skill: 'emotion_regulation' },
  half_smile: { category: 'DBT', skill: 'emotion_regulation' },
  improve: { category: 'DBT', skill: 'distress_tolerance' },
  leaves_on_stream: { category: 'ACT', skill: 'defusion' },
  expansion: { category: 'ACT', skill: 'emotion_regulation' },
  values_check: { category: 'ACT', skill: 'mindfulness' },
  pros_and_cons: { category: 'DBT', skill: 'emotion_regulation' },
  check_the_facts: { category: 'DBT', skill: 'emotion_regulation' },
  self_soothe: { category: 'DBT', skill: 'distress_tolerance' },
  mountain_meditation: { category: 'ACT', skill: 'mindfulness' },
};

function getRecommendations(activities) {
  if (!activities || activities.length === 0) {
    // New users: recommend beginner-friendly games
    return ['calm_bingo', 'quick_win', 'thought_quiz'];
  }

  // Count plays by game
  const playCount = {};
  const skillCount = {};
  const categoryCount = {};

  activities.forEach(activity => {
    playCount[activity.game_id] = (playCount[activity.game_id] || 0) + 1;
    skillCount[activity.skill_focus] = (skillCount[activity.skill_focus] || 0) + 1;
    categoryCount[activity.category] = (categoryCount[activity.category] || 0) + 1;
  });

  // Find most played games and preferred skills
  const playedGameIds = Object.keys(playCount);
  const topSkill = Object.keys(skillCount).sort((a, b) => skillCount[b] - skillCount[a])[0];
  const topCategory = Object.keys(categoryCount).sort((a, b) => categoryCount[b] - categoryCount[a])[0];

  // Build recommendation list
  const recommendations = [];
  const unplayedGames = Object.keys(gameMetadata).filter(id => !playedGameIds.includes(id));

  // 1. Recommend games with same skill focus (complementary)
  const sameSkillGames = unplayedGames.filter(id => gameMetadata[id].skill === topSkill);
  recommendations.push(...sameSkillGames.slice(0, 2));

  // 2. Recommend games from same category
  const sameCategoryGames = unplayedGames.filter(
    id => gameMetadata[id].category === topCategory && !recommendations.includes(id)
  );
  recommendations.push(...sameCategoryGames.slice(0, 1));

  // 3. Fill with unplayed games from other categories (diversity)
  const otherGames = unplayedGames.filter(id => !recommendations.includes(id));
  recommendations.push(...otherGames.slice(0, 3 - recommendations.length));

  // If still not enough, recommend popular replays
  if (recommendations.length < 3) {
    const mostPlayed = Object.keys(playCount)
      .sort((a, b) => playCount[b] - playCount[a])
      .slice(0, 3 - recommendations.length);
    recommendations.push(...mostPlayed);
  }

  return recommendations.slice(0, 3);
}

export default function MindGameRecommendations({ onGameSelect }) {
  const { t } = useTranslation();
  const { data: activities = [] } = useQuery({
    queryKey: ['mindGameActivities'],
    queryFn: () => base44.entities.MindGameActivity.list('-created_date', 50),
    initialData: [],
  });

  const recommendedGameIds = getRecommendations(activities);
  const recommendedGames = recommendedGameIds
    .map(id => gamesCatalog.find(g => g.id === id))
    .filter(Boolean);

  if (recommendedGames.length === 0) return null;

  return (
    <Card className="p-6 mb-6 border-0" style={{
      borderRadius: '20px',
      background: 'linear-gradient(135deg, rgba(38, 166, 154, 0.1) 0%, rgba(159, 122, 234, 0.1) 100%)',
      border: '1px solid rgba(38, 166, 154, 0.2)'
    }}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5" style={{ color: '#26A69A' }} />
        <h3 className="text-lg font-semibold" style={{ color: '#1A3A34' }}>
          {t('mind_games.recommended_title')}
        </h3>
      </div>
      
      <p className="text-sm mb-4" style={{ color: '#5A7A72' }}>
        {t('mind_games.recommended_subtitle')}
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {recommendedGames.map(game => (
          <GameCard
            key={game.id}
            game={game}
            onClick={() => onGameSelect(game)}
          />
        ))}
      </div>
    </Card>
  );
}
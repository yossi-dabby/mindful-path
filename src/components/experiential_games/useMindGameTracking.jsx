import { useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';

// Game metadata for tracking
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
};

export function useMindGameTracking() {
  const queryClient = useQueryClient();

  const trackGamePlay = useMutation({
    mutationFn: async ({ 
      game, 
      completed = false, 
      durationSeconds = 0, 
      rating = null,
      difficulty_level = 'beginner',
      success_rate = null,
      attempts = 1
    }) => {
      const metadata = gameMetadata[game.id] || { category: 'CBT', skill: 'mindfulness' };
      
      return base44.entities.MindGameActivity.create({
        game_id: game.id,
        game_slug: game.slug,
        game_title: game.title,
        category: metadata.category,
        skill_focus: metadata.skill,
        completed,
        duration_seconds: durationSeconds,
        rating,
        difficulty_level,
        success_rate,
        attempts,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['mindGameActivities'] });
    },
  });

  return {
    trackGamePlay: trackGamePlay.mutate,
  };
}
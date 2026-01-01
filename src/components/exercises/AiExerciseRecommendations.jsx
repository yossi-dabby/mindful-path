import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Loader2, RefreshCw, Wind, Anchor, Brain, TrendingUp, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryIcons = {
  breathing: Wind,
  grounding: Anchor,
  cognitive_restructuring: Brain,
  behavioral_activation: TrendingUp,
  mindfulness: Sparkles,
  exposure: Heart
};

export default function AiExerciseRecommendations({ exercises, onSelectExercise }) {
  const [recommendations, setRecommendations] = useState(null);

  // Fetch user context
  const { data: recentMoods = [] } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: async () => {
      try {
        const moods = await base44.entities.MoodEntry.list('-created_date', 7);
        return moods;
      } catch {
        return [];
      }
    },
    initialData: []
  });

  const { data: activeGoals = [] } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: async () => {
      try {
        return await base44.entities.Goal.filter({ status: 'active' });
      } catch {
        return [];
      }
    },
    initialData: []
  });

  // Generate recommendations
  const generateMutation = useMutation({
    mutationFn: async () => {
      const favoriteExercises = exercises.filter(e => e.favorite).map(e => e.title);
      const completedExercises = exercises
        .filter(e => e.completed_count > 0)
        .sort((a, b) => (b.completed_count || 0) - (a.completed_count || 0))
        .slice(0, 5)
        .map(e => ({ title: e.title, count: e.completed_count }));

      const recentMoodSummary = recentMoods.length > 0
        ? `Recent moods (last 7 entries): ${recentMoods.map(m => `${m.mood_level}/10 feeling ${m.primary_emotion || 'neutral'}`).join(', ')}`
        : 'No recent mood data';

      const goalsSummary = activeGoals.length > 0
        ? `Active goals: ${activeGoals.map(g => `${g.title} (${g.category})`).join(', ')}`
        : 'No active goals';

      const availableExercises = exercises.map(e => ({
        title: e.title || 'Untitled',
        category: e.category,
        difficulty: e.difficulty || 'beginner',
        description: e.description || '',
        tags: (e.tags || []).filter(t => t && typeof t === 'string')
      }));

      const prompt = `You are a CBT therapy assistant. Based on the user's activity and needs, recommend 3-5 exercises from the available list.

User Context:
- Favorite exercises: ${favoriteExercises.length > 0 ? favoriteExercises.join(', ') : 'None yet'}
- Most completed: ${completedExercises.length > 0 ? completedExercises.map(e => `${e.title} (${e.count}x)`).join(', ') : 'None yet'}
- ${recentMoodSummary}
- ${goalsSummary}

Available exercises:
${JSON.stringify(availableExercises, null, 2)}

Provide recommendations with:
1. Why this exercise is recommended for this user specifically
2. How it relates to their current mood, goals, or patterns
3. What benefit they can expect

Focus on variety, progression, and addressing current needs.`;

      const result = await base44.integrations.Core.InvokeLLM({
        prompt,
        response_json_schema: {
          type: 'object',
          properties: {
            recommendations: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  exercise_title: { type: 'string' },
                  reason: { type: 'string' },
                  benefit: { type: 'string' },
                  priority: { type: 'string', enum: ['high', 'medium', 'low'] }
                }
              }
            }
          }
        }
      });

      return result.recommendations || [];
    },
    onSuccess: (data) => {
      setRecommendations(data);
    }
  });

  const handleGenerate = () => {
    generateMutation.mutate();
  };

  const getExerciseByTitle = (title) => {
    return exercises.find(e => 
      (e.title || '').toLowerCase() === (title || '').toLowerCase() ||
      (e.title || '').toLowerCase().includes((title || '').toLowerCase())
    );
  };

  return (
    <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-blue-50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-xl">AI Recommendations</CardTitle>
          </div>
          <Button
            onClick={handleGenerate}
            disabled={generateMutation.isPending}
            size="sm"
            className="bg-purple-600 hover:bg-purple-700"
          >
            {generateMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <RefreshCw className="w-4 h-4 mr-2" />
                {recommendations ? 'Refresh' : 'Get Recommendations'}
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {!recommendations && !generateMutation.isPending && (
          <div className="text-center py-8">
            <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4">
              Get personalized exercise recommendations based on your activity, favorites, mood, and goals
            </p>
          </div>
        )}

        {generateMutation.isPending && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-24 bg-gray-200 rounded-xl" />
              </div>
            ))}
          </div>
        )}

        {recommendations && recommendations.length > 0 && (
          <div className="space-y-3">
            {recommendations.map((rec, index) => {
              const exercise = getExerciseByTitle(rec.exercise_title);
              const Icon = exercise ? categoryIcons[exercise.category] : Sparkles;
              const priorityColors = {
                high: 'bg-red-100 text-red-700 border-red-300',
                medium: 'bg-yellow-100 text-yellow-700 border-yellow-300',
                low: 'bg-blue-100 text-blue-700 border-blue-300'
              };

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border-2 hover:shadow-md transition-all cursor-pointer" onClick={() => exercise && onSelectExercise(exercise)}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0">
                          {Icon && <Icon className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <h4 className="font-semibold text-gray-800">
                              {rec.exercise_title}
                            </h4>
                            <Badge className={`text-xs ${priorityColors[rec.priority] || priorityColors.medium}`}>
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{rec.reason}</p>
                          <div className="flex items-start gap-2 bg-green-50 rounded-lg p-2 border border-green-200">
                            <Sparkles className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <p className="text-xs text-gray-700">{rec.benefit}</p>
                          </div>
                          {exercise && (
                            <Button
                              size="sm"
                              className="mt-3 w-full bg-purple-600 hover:bg-purple-700"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectExercise(exercise);
                              }}
                            >
                              Try This Exercise
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        )}

        {recommendations && recommendations.length === 0 && (
          <div className="text-center py-6">
            <p className="text-gray-600">No recommendations available. Try again later.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
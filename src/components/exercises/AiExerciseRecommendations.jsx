import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Sparkles, Loader2, RefreshCw, Wind, Anchor, Brain, TrendingUp, Heart, ThumbsUp, ThumbsDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { normalizeExerciseRecommendations, safeArray, safeText } from '@/components/utils/aiDataNormalizer';

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
  const [selectedMood, setSelectedMood] = useState('');
  const [selectedGoal, setSelectedGoal] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [feedbackGiven, setFeedbackGiven] = useState({});
  const queryClient = useQueryClient();

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

  const { data: feedbackHistory = [] } = useQuery({
    queryKey: ['exerciseFeedback'],
    queryFn: async () => {
      try {
        return await base44.entities.ExerciseRecommendationFeedback.list('-created_date', 50);
      } catch {
        return [];
      }
    },
    initialData: []
  });

  // Feedback mutation
  const feedbackMutation = useMutation({
    mutationFn: async ({ exerciseId, feedbackType, reason }) => {
      return await base44.entities.ExerciseRecommendationFeedback.create({
        exercise_id: exerciseId,
        recommendation_reason: reason,
        feedback_type: feedbackType,
        context: {
          mood: selectedMood,
          goal: selectedGoal,
          timestamp: new Date().toISOString()
        }
      });
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['exerciseFeedback']);
      setFeedbackGiven(prev => ({ ...prev, [variables.exerciseId]: variables.feedbackType }));
      toast.success('Thanks for your feedback!');
    }
  });

  // Generate recommendations
  const generateMutation = useMutation({
    mutationFn: async () => {
      const favoriteExercises = exercises.filter(e => e.favorite).map(e => e.title);
      const completedExercises = exercises
        .filter(e => e.completed_count > 0)
        .sort((a, b) => (b.completed_count || 0) - (a.completed_count || 0))
        .slice(0, 10)
        .map(e => ({ 
          title: e.title, 
          count: e.completed_count,
          difficulty: e.difficulty || 'beginner',
          category: e.category
        }));

      // Calculate difficulty progression
      const completedDifficulties = completedExercises.map(e => e.difficulty);
      const hasCompletedBeginner = completedDifficulties.includes('beginner');
      const hasCompletedIntermediate = completedDifficulties.includes('intermediate');
      const suggestedDifficulty = !hasCompletedBeginner ? 'beginner' :
                                   !hasCompletedIntermediate ? 'intermediate or beginner' :
                                   'intermediate or advanced';

      const recentMoodSummary = recentMoods.length > 0
        ? `Recent moods (last 7 entries): ${recentMoods.map(m => `${m.mood_level}/10 feeling ${m.primary_emotion || 'neutral'}`).join(', ')}`
        : 'No recent mood data';

      const goalsSummary = activeGoals.length > 0
        ? `Active goals: ${activeGoals.map(g => `${g.title} (${g.category})`).join(', ')}`
        : 'No active goals';
      
      // User feedback analysis
      const helpfulExercises = feedbackHistory
        .filter(f => f.feedback_type === 'helpful')
        .map(f => f.exercise_id);
      const notRelevantExercises = feedbackHistory
        .filter(f => f.feedback_type === 'not_relevant')
        .map(f => f.exercise_id);

      const feedbackSummary = feedbackHistory.length > 0
        ? `User has marked ${helpfulExercises.length} exercises as helpful and ${notRelevantExercises.length} as not relevant. Avoid recommending exercises the user found not relevant.`
        : 'No feedback history yet.';

      const availableExercises = exercises.map(e => ({
        title: e.title || 'Untitled',
        category: e.category,
        difficulty: e.difficulty || 'beginner',
        description: e.description || '',
        tags: (e.tags || []).filter(t => t && typeof t === 'string')
      }));

      const currentContext = selectedMood || selectedGoal 
        ? `\n\nCURRENT CONTEXT (HIGH PRIORITY):\n${selectedMood ? `- User is currently feeling: ${selectedMood}` : ''}${selectedGoal ? `\n- User wants to work on: ${selectedGoal}` : ''}\n`
        : '';

      const prompt = `You are a CBT therapy assistant. Based on the user's activity and needs, recommend 3-5 exercises from the available list.
${currentContext}
User History:
- Favorite exercises: ${favoriteExercises.length > 0 ? favoriteExercises.join(', ') : 'None yet'}
- Most completed: ${completedExercises.length > 0 ? completedExercises.map(e => `${e.title} (${e.count}x, ${e.difficulty})`).join(', ') : 'None yet'}
- ${recentMoodSummary}
- ${goalsSummary}
- ${feedbackSummary}
- Suggested difficulty based on progression: ${suggestedDifficulty}

Available exercises:
${JSON.stringify(availableExercises, null, 2)}

IMPORTANT GUIDELINES:
1. If user specified current mood/goal, prioritize exercises that directly address it
2. Consider difficulty progression - recommend exercises slightly more challenging than what they've mastered
3. Avoid exercises previously marked as "not relevant"
4. Provide specific, personalized reasons
5. Balance variety with proven preferences

Provide recommendations with:
1. Why this exercise is recommended for this user specifically
2. How it relates to their current state, mood, goals, or progression
3. What benefit they can expect`;

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

      const normalized = normalizeExerciseRecommendations(result.recommendations || []);
      return normalized;
    },
    onSuccess: (data) => {
      setRecommendations(data);
    }
  });

  const handleGenerate = () => {
    setFeedbackGiven({});
    setShowFilters(false);
    generateMutation.mutate();
  };

  const handleFeedback = (exerciseId, feedbackType, reason) => {
    feedbackMutation.mutate({ exerciseId, feedbackType, reason });
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <CardTitle className="text-xl">AI Recommendations</CardTitle>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              disabled={generateMutation.isPending}
              size="sm"
              variant="outline"
              className="flex-1 sm:flex-none"
            >
              <Sparkles className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Customize</span>
            </Button>
            <Button
              onClick={handleGenerate}
              disabled={generateMutation.isPending}
              size="sm"
              className="bg-purple-600 hover:bg-purple-700 flex-1 sm:flex-none"
            >
              {generateMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  <span className="hidden sm:inline">Analyzing...</span>
                  <span className="sm:hidden">...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">{recommendations ? 'Refresh' : 'Get Recommendations'}</span>
                  <span className="sm:hidden">{recommendations ? 'Refresh' : 'Get'}</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-hidden">
        {/* Mood/Goal Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-4 p-4 bg-white rounded-lg border-2 border-purple-200"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                <div>
                  <Label className="text-sm font-medium mb-2">How are you feeling right now?</Label>
                  <Select value={selectedMood} onValueChange={setSelectedMood}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select current mood..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="anxious">Anxious</SelectItem>
                      <SelectItem value="stressed">Stressed</SelectItem>
                      <SelectItem value="sad">Sad / Low</SelectItem>
                      <SelectItem value="overwhelmed">Overwhelmed</SelectItem>
                      <SelectItem value="angry">Angry / Irritable</SelectItem>
                      <SelectItem value="restless">Restless</SelectItem>
                      <SelectItem value="neutral">Neutral / Calm</SelectItem>
                      <SelectItem value="energized">Energized</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-sm font-medium mb-2">What do you want to work on?</Label>
                  <Select value={selectedGoal} onValueChange={setSelectedGoal}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select focus area..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="reduce_anxiety">Reduce Anxiety</SelectItem>
                      <SelectItem value="manage_stress">Manage Stress</SelectItem>
                      <SelectItem value="improve_mood">Improve Mood</SelectItem>
                      <SelectItem value="better_sleep">Better Sleep</SelectItem>
                      <SelectItem value="emotional_regulation">Emotional Regulation</SelectItem>
                      <SelectItem value="focus">Improve Focus</SelectItem>
                      <SelectItem value="self_compassion">Self-Compassion</SelectItem>
                      <SelectItem value="confidence">Build Confidence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(selectedMood || selectedGoal) && (
                <div className="flex items-center gap-2 text-sm text-purple-700 bg-purple-50 px-3 py-2 rounded-lg">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>
                    {selectedMood && selectedGoal
                      ? `Recommendations will focus on "${selectedGoal}" while feeling "${selectedMood}"`
                      : selectedMood
                      ? `Recommendations will address feeling "${selectedMood}"`
                      : `Recommendations will focus on "${selectedGoal}"`}
                  </span>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setSelectedMood('');
                      setSelectedGoal('');
                    }}
                    className="ml-auto h-6 px-2"
                  >
                    Clear
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {!recommendations && !generateMutation.isPending && (
          <div className="text-center py-8 px-4">
            <Sparkles className="w-12 h-12 text-purple-300 mx-auto mb-3" />
            <p className="text-gray-600 mb-4 text-sm sm:text-base">
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

        {safeArray(recommendations).length > 0 && (
          <div className="space-y-3">
            {safeArray(recommendations).map((rec, index) => {
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
                            <>
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
                              
                              {/* Feedback Buttons */}
                              <div className="mt-2 flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={`flex-1 ${feedbackGiven[exercise.id] === 'helpful' ? 'bg-green-50 border-green-300 text-green-700' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFeedback(exercise.id, 'helpful', rec.reason);
                                  }}
                                  disabled={!!feedbackGiven[exercise.id]}
                                >
                                  <ThumbsUp className="w-3 h-3 mr-1" />
                                  Helpful
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={`flex-1 ${feedbackGiven[exercise.id] === 'not_relevant' ? 'bg-red-50 border-red-300 text-red-700' : ''}`}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleFeedback(exercise.id, 'not_relevant', rec.reason);
                                  }}
                                  disabled={!!feedbackGiven[exercise.id]}
                                >
                                  <ThumbsDown className="w-3 h-3 mr-1" />
                                  Not Relevant
                                </Button>
                              </div>
                            </>
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
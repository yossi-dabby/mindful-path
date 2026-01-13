import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Dumbbell, Calendar, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiExerciseCoaching({ onClose, onSelectExercise }) {
  const [plan, setPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: []
  });

  const { data: recentMoods } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: () => base44.entities.MoodEntry.list('-created_date', 7),
    initialData: []
  });

  const { data: exerciseHistory } = useQuery({
    queryKey: ['exerciseHistory'],
    queryFn: async () => {
      const allExercises = await base44.entities.Exercise.list();
      return allExercises.filter(e => e.completed_count > 0);
    },
    initialData: []
  });

  const generatePlanMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      
      // Prepare context
      const moodSummary = recentMoods.length > 0
        ? `Recent moods: ${recentMoods.map(m => `${m.mood} (emotions: ${m.emotions?.join(', ') || 'none'})`).join('; ')}`
        : 'No recent mood data';
      
      const exerciseSummary = exerciseHistory.length > 0
        ? `Completed exercises: ${exerciseHistory.map(e => `${e.title} (${e.completed_count} times)`).slice(0, 5).join(', ')}`
        : 'No exercise history';

      const availableExercises = exercises.map(e => ({
        id: e.id,
        title: e.title,
        category: e.category,
        difficulty: e.difficulty,
        duration: e.duration_options?.[0] || 10
      }));

      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a CBT therapist creating a personalized exercise plan. Based on the user's context, recommend a structured plan.

User Context:
${moodSummary}
${exerciseSummary}

Available exercises:
${JSON.stringify(availableExercises, null, 2)}

Create a 7-day exercise plan with:
1. Daily recommendations (select from available exercises by ID)
2. Why each exercise was chosen
3. Progression strategy
4. Expected outcomes

Format as JSON:
{
  "plan_summary": "brief overview",
  "daily_plan": [
    {
      "day": 1,
      "exercise_id": "...",
      "exercise_title": "...",
      "duration": 10,
      "reason": "why this exercise",
      "focus": "what to pay attention to"
    }
  ],
  "progression_strategy": "...",
  "expected_outcomes": ["outcome1", "outcome2", ...]
}`,
        response_json_schema: {
          type: "object",
          properties: {
            plan_summary: { type: "string" },
            daily_plan: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  day: { type: "number" },
                  exercise_id: { type: "string" },
                  exercise_title: { type: "string" },
                  duration: { type: "number" },
                  reason: { type: "string" },
                  focus: { type: "string" }
                }
              }
            },
            progression_strategy: { type: "string" },
            expected_outcomes: { type: "array", items: { type: "string" } }
          }
        }
      });

      setPlan(result);
      setIsGenerating(false);
      return result;
    }
  });

  const handleStartExercise = (exerciseId) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (exercise && onSelectExercise) {
      onSelectExercise(exercise);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-24 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-4xl my-8"
        style={{ maxHeight: 'calc(100vh - 160px)' }}
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="border-b" style={{
            background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.9) 0%, rgba(180, 220, 210, 0.8) 100%)'
          }}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: '#26A69A' }} />
                AI Exercise Coaching
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-4 md:p-6 space-y-6 overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
            {!plan && !isGenerating && (
              <div className="text-center py-8">
                <Dumbbell className="w-16 h-16 mx-auto mb-4" style={{ color: '#A8D4CB' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A3A34' }}>
                  Get Your Personalized Exercise Plan
                </h3>
                <p className="mb-6 max-w-md mx-auto" style={{ color: '#5A7A72' }}>
                  AI will analyze your mood patterns and history to create a customized 7-day exercise plan
                </p>
                <Button
                  onClick={() => generatePlanMutation.mutate()}
                  className="text-white px-8 py-6 text-lg"
                  style={{
                    borderRadius: '28px',
                    backgroundColor: '#26A69A',
                    boxShadow: '0 8px 24px rgba(38, 166, 154, 0.35)'
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate My Plan
                </Button>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#26A69A' }} />
                <p style={{ color: '#5A7A72' }}>Creating your personalized exercise plan...</p>
              </div>
            )}

            {plan && (
              <div className="space-y-6">
                {/* Plan Overview */}
                <div className="p-6 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(38, 166, 154, 0.15) 0%, rgba(56, 178, 172, 0.1) 100%)',
                  border: '2px solid rgba(38, 166, 154, 0.2)'
                }}>
                  <div className="flex items-start gap-3 mb-4">
                    <TrendingUp className="w-6 h-6 mt-1" style={{ color: '#26A69A' }} />
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: '#1A3A34' }}>Your Plan Overview</h4>
                      <p style={{ color: '#3D5A52' }}>{plan.plan_summary}</p>
                    </div>
                  </div>
                  
                  {/* Expected Outcomes */}
                  <div className="mt-4">
                    <h5 className="font-medium text-sm mb-2" style={{ color: '#1A3A34' }}>Expected Outcomes:</h5>
                    <div className="flex flex-wrap gap-2">
                      {plan.expected_outcomes.map((outcome, i) => (
                        <Badge key={i} variant="outline" style={{ borderColor: '#26A69A', color: '#26A69A' }}>
                          ✓ {outcome}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Daily Plan */}
                <div>
                  <h4 className="font-semibold mb-4 flex items-center gap-2" style={{ color: '#1A3A34' }}>
                    <Calendar className="w-5 h-5" style={{ color: '#26A69A' }} />
                    7-Day Exercise Schedule
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {plan.daily_plan.map((day) => (
                      <div
                        key={day.day}
                        className="p-4 rounded-xl hover:shadow-md transition-all"
                        style={{
                          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 247, 0.85) 100%)',
                          border: '2px solid rgba(38, 166, 154, 0.1)'
                        }}
                      >
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <Badge style={{ backgroundColor: '#26A69A', color: 'white' }}>
                              Day {day.day}
                            </Badge>
                            <h5 className="font-semibold mt-2" style={{ color: '#1A3A34' }}>
                              {day.exercise_title}
                            </h5>
                            <p className="text-xs mt-1" style={{ color: '#5A7A72' }}>
                              {day.duration} minutes
                            </p>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStartExercise(day.exercise_id)}
                          >
                            Start
                          </Button>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <p className="text-xs font-medium mb-1" style={{ color: '#1A3A34' }}>
                              Why this exercise:
                            </p>
                            <p className="text-xs" style={{ color: '#5A7A72' }}>{day.reason}</p>
                          </div>
                          <div>
                            <p className="text-xs font-medium mb-1" style={{ color: '#1A3A34' }}>
                              Focus on:
                            </p>
                            <p className="text-xs" style={{ color: '#5A7A72' }}>{day.focus}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Progression Strategy */}
                <div className="p-4 rounded-xl" style={{
                  background: 'linear-gradient(145deg, rgba(240, 240, 250, 0.6) 0%, rgba(245, 245, 255, 0.5) 100%)',
                  border: '1px solid rgba(139, 92, 246, 0.2)'
                }}>
                  <h5 className="font-semibold mb-2 text-sm" style={{ color: '#6D28D9' }}>
                    📈 Progression Strategy
                  </h5>
                  <p className="text-sm" style={{ color: '#5A7A72' }}>{plan.progression_strategy}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
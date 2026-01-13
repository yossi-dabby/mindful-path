import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, CheckCircle2, Loader2, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiGoalCoaching({ goal, onClose }) {
  const [coaching, setCoaching] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  const generateCoachingMutation = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a CBT therapist and goal coach. Analyze this goal and provide coaching:
        
Goal: "${goal.title}"
Description: "${goal.description || 'No description'}"
Category: ${goal.category}
Current Progress: ${goal.progress}%
Status: ${goal.status}
${goal.milestones ? `Milestones: ${goal.milestones.map(m => m.title).join(', ')}` : ''}

Provide:
1. Next actionable steps (3-5 concrete actions)
2. Potential obstacles and how to overcome them
3. Motivation boost (brief encouraging message)
4. Progress tracking suggestions
5. Estimated timeline adjustments if needed

Format as JSON with: {
  "next_steps": ["step1", "step2", ...],
  "obstacles": [{"obstacle": "...", "solution": "..."}],
  "motivation": "...",
  "tracking_tips": ["tip1", "tip2", ...],
  "timeline_advice": "..."
}`,
        response_json_schema: {
          type: "object",
          properties: {
            next_steps: { type: "array", items: { type: "string" } },
            obstacles: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  obstacle: { type: "string" },
                  solution: { type: "string" }
                }
              }
            },
            motivation: { type: "string" },
            tracking_tips: { type: "array", items: { type: "string" } },
            timeline_advice: { type: "string" }
          }
        }
      });
      setCoaching(result);
      setIsGenerating(false);
      return result;
    }
  });

  const applyStepMutation = useMutation({
    mutationFn: async (step) => {
      const updatedMilestones = [...(goal.milestones || []), {
        title: step,
        completed: false,
        due_date: null
      }];
      await base44.entities.Goal.update(goal.id, { milestones: updatedMilestones });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allGoals']);
    }
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 pb-24 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-3xl my-8"
        style={{ maxHeight: 'calc(100vh - 160px)' }}
      >
        <Card className="border-0 shadow-2xl">
          <CardHeader className="border-b" style={{
            background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.9) 0%, rgba(180, 220, 210, 0.8) 100%)'
          }}>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5" style={{ color: '#26A69A' }} />
                AI Goal Coaching
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
            {/* Goal Summary */}
            <div className="p-4 rounded-xl" style={{
              background: 'linear-gradient(145deg, rgba(240, 250, 248, 0.8) 0%, rgba(225, 245, 240, 0.7) 100%)'
            }}>
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-lg" style={{ color: '#1A3A34' }}>{goal.title}</h3>
                <Badge style={{ backgroundColor: '#26A69A', color: 'white' }}>
                  {goal.progress}% Complete
                </Badge>
              </div>
              {goal.description && (
                <p className="text-sm mb-3" style={{ color: '#5A7A72' }}>{goal.description}</p>
              )}
            </div>

            {!coaching && !isGenerating && (
              <div className="text-center py-8">
                <Target className="w-16 h-16 mx-auto mb-4" style={{ color: '#A8D4CB' }} />
                <h3 className="text-xl font-semibold mb-2" style={{ color: '#1A3A34' }}>
                  Get Personalized Coaching
                </h3>
                <p className="mb-6" style={{ color: '#5A7A72' }}>
                  Get AI-powered insights and actionable steps to achieve your goal faster
                </p>
                <Button
                  onClick={() => generateCoachingMutation.mutate()}
                  className="text-white px-8 py-6 text-lg"
                  style={{
                    borderRadius: '28px',
                    backgroundColor: '#26A69A',
                    boxShadow: '0 8px 24px rgba(38, 166, 154, 0.35)'
                  }}
                >
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate Coaching Plan
                </Button>
              </div>
            )}

            {isGenerating && (
              <div className="text-center py-12">
                <Loader2 className="w-12 h-12 mx-auto mb-4 animate-spin" style={{ color: '#26A69A' }} />
                <p style={{ color: '#5A7A72' }}>Analyzing your goal and creating a personalized coaching plan...</p>
              </div>
            )}

            {coaching && (
              <div className="space-y-6">
                {/* Motivation */}
                <div className="p-6 rounded-xl" style={{
                  background: 'linear-gradient(135deg, rgba(38, 166, 154, 0.15) 0%, rgba(56, 178, 172, 0.1) 100%)',
                  border: '2px solid rgba(38, 166, 154, 0.2)'
                }}>
                  <div className="flex items-start gap-3">
                    <TrendingUp className="w-6 h-6 mt-1" style={{ color: '#26A69A' }} />
                    <div>
                      <h4 className="font-semibold mb-2" style={{ color: '#1A3A34' }}>Motivation Boost</h4>
                      <p style={{ color: '#3D5A52' }}>{coaching.motivation}</p>
                    </div>
                  </div>
                </div>

                {/* Next Steps */}
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2" style={{ color: '#1A3A34' }}>
                    <CheckCircle2 className="w-5 h-5" style={{ color: '#26A69A' }} />
                    Your Next Steps
                  </h4>
                  <div className="space-y-2">
                    {coaching.next_steps.map((step, index) => (
                      <div
                        key={index}
                        className="flex items-start justify-between gap-3 p-4 rounded-xl hover:shadow-md transition-shadow"
                        style={{
                          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.9) 0%, rgba(240, 249, 247, 0.85) 100%)',
                          border: '1px solid rgba(38, 166, 154, 0.1)'
                        }}
                      >
                        <div className="flex-1">
                          <span className="font-medium text-sm mr-2" style={{ color: '#26A69A' }}>
                            {index + 1}.
                          </span>
                          <span style={{ color: '#3D5A52' }}>{step}</span>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => applyStepMutation.mutate(step)}
                          disabled={applyStepMutation.isPending}
                        >
                          Add to Goal
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Obstacles & Solutions */}
                {coaching.obstacles?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3" style={{ color: '#1A3A34' }}>
                      Potential Obstacles & Solutions
                    </h4>
                    <div className="space-y-3">
                      {coaching.obstacles.map((item, index) => (
                        <div
                          key={index}
                          className="p-4 rounded-xl"
                          style={{
                            background: 'linear-gradient(145deg, rgba(255, 245, 230, 0.6) 0%, rgba(255, 250, 240, 0.5) 100%)',
                            border: '1px solid rgba(246, 173, 85, 0.2)'
                          }}
                        >
                          <p className="font-medium text-sm mb-2" style={{ color: '#B45309' }}>
                            ⚠️ {item.obstacle}
                          </p>
                          <p className="text-sm" style={{ color: '#5A7A72' }}>
                            💡 {item.solution}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tracking Tips */}
                {coaching.tracking_tips?.length > 0 && (
                  <div>
                    <h4 className="font-semibold mb-3" style={{ color: '#1A3A34' }}>
                      Progress Tracking Tips
                    </h4>
                    <ul className="space-y-2">
                      {coaching.tracking_tips.map((tip, index) => (
                        <li key={index} className="flex items-start gap-2" style={{ color: '#5A7A72' }}>
                          <span className="mt-1">📊</span>
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Timeline Advice */}
                {coaching.timeline_advice && (
                  <div className="p-4 rounded-xl" style={{
                    background: 'linear-gradient(145deg, rgba(240, 240, 250, 0.6) 0%, rgba(245, 245, 255, 0.5) 100%)',
                    border: '1px solid rgba(139, 92, 246, 0.2)'
                  }}>
                    <h4 className="font-semibold mb-2 text-sm" style={{ color: '#6D28D9' }}>
                      ⏱️ Timeline Suggestion
                    </h4>
                    <p className="text-sm" style={{ color: '#5A7A72' }}>{coaching.timeline_advice}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
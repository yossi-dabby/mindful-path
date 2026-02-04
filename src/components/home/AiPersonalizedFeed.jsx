import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, BookOpen, Target, Play, TrendingUp, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

export default function AiPersonalizedFeed() {
  const [isGenerating, setIsGenerating] = useState(false);

  // Fetch user data
  const { data: goals } = useQuery({
    queryKey: ['activeGoals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }, '-created_date', 5),
    initialData: []
  });

  const { data: recentJournals } = useQuery({
    queryKey: ['recentJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 10),
    initialData: []
  });

  const { data: recentMoods } = useQuery({
    queryKey: ['recentMoods'],
    queryFn: () => base44.entities.MoodEntry.list('-created_date', 7),
    initialData: []
  });

  const { data: exercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: []
  });

  const { data: resources } = useQuery({
    queryKey: ['resources'],
    queryFn: () => base44.entities.Resource.list(),
    initialData: []
  });

  const { data: videos } = useQuery({
    queryKey: ['videos'],
    queryFn: () => base44.entities.Video.list(),
    initialData: []
  });

  // AI-powered recommendations
  const { data: aiRecommendations, isLoading, refetch } = useQuery({
    queryKey: ['aiRecommendations', goals.length, recentJournals.length, recentMoods.length],
    queryFn: async () => {
      if (!goals.length && !recentJournals.length && !recentMoods.length) {
        // New user - provide starter recommendations
        return {
          recommendations: [
            {
              type: 'exercise',
              id: exercises.find(e => e.category === 'breathing')?.id,
              title: exercises.find(e => e.category === 'breathing')?.title || 'Breathing Exercise',
              description: exercises.find(e => e.category === 'breathing')?.description || 'Start with calming breathwork',
              reason: 'Great starting point for new users',
              priority: 'high'
            },
            {
              type: 'journal_prompt',
              title: 'Reflect on Today',
              description: 'What went well today? What challenged you?',
              reason: 'Build awareness of thought patterns',
              priority: 'medium'
            }
          ],
          insights: 'Welcome! These activities will help you get started with your mental wellness journey.'
        };
      }

      setIsGenerating(true);
      
      try {
        // Build context for AI analysis
        const context = {
          goals: goals.map(g => ({ title: g.title, category: g.category, progress: g.progress })),
          recent_emotions: recentMoods.map(m => ({ mood: m.mood, emotions: m.emotions, stress_level: m.stress_level })),
          journal_themes: recentJournals.map(j => ({ 
            cognitive_distortions: j.cognitive_distortions,
            emotions: j.emotions,
            emotion_intensity: j.emotion_intensity,
            outcome_emotion_intensity: j.outcome_emotion_intensity
          })),
          available_exercises: exercises.map(e => ({ id: e.id, title: e.title, category: e.category, tags: e.tags })),
          available_resources: resources.map(r => ({ id: r.id, title: r.title, type: r.type, category: r.category })),
          available_videos: videos.map(v => ({ id: v.id, title: v.title, category: v.category }))
        };

        const response = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a CBT therapist assistant analyzing user data to recommend personalized content.

User Data:
- Active Goals: ${JSON.stringify(context.goals)}
- Recent Moods (7 days): ${JSON.stringify(context.recent_emotions)}
- Recent Journal Themes: ${JSON.stringify(context.journal_themes)}

Available Content:
- Exercises: ${JSON.stringify(context.available_exercises.slice(0, 10))}
- Resources: ${JSON.stringify(context.available_resources.slice(0, 10))}
- Videos: ${JSON.stringify(context.available_videos.slice(0, 10))}

Task: Recommend 3-5 highly relevant content items that will:
1. Support their active goals
2. Address patterns in their mood/journal data
3. Help with skills they're building
4. Provide variety (mix of exercises, prompts, resources, videos)

For each recommendation, provide:
- type: "exercise", "resource", "video", or "journal_prompt"
- id: (if from available content, otherwise null)
- title
- description (one sentence, warm and encouraging)
- reason: why this is relevant to them RIGHT NOW (based on their data)
- priority: "high", "medium", or "low"

Also provide a brief "insights" summary (2-3 sentences) about patterns you noticed in their data.

Return JSON only.`,
          response_json_schema: {
            type: "object",
            properties: {
              recommendations: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    type: { type: "string" },
                    id: { type: "string" },
                    title: { type: "string" },
                    description: { type: "string" },
                    reason: { type: "string" },
                    priority: { type: "string" }
                  }
                }
              },
              insights: { type: "string" }
            }
          }
        });

        return response;
      } finally {
        setIsGenerating(false);
      }
    },
    enabled: true,
    staleTime: 1000 * 60 * 30 // 30 minutes
  });

  const handleRefresh = () => {
    refetch();
  };

  if (isLoading || isGenerating) {
    return (
      <Card className="border-0 mb-6" style={{
        borderRadius: '28px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        boxShadow: '0 8px 24px rgba(38, 166, 154, 0.12)'
      }}>
        <CardContent className="p-8 text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3" style={{ color: '#26A69A' }} />
          <p className="text-sm" style={{ color: '#5A7A72' }}>
            Analyzing your progress and tailoring recommendations...
          </p>
        </CardContent>
      </Card>
    );
  }

  if (!aiRecommendations?.recommendations?.length) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="mb-6"
    >
      <Card className="border-0" style={{
        borderRadius: '28px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 24px rgba(38, 166, 154, 0.12), 0 4px 12px rgba(0,0,0,0.04)'
      }}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center" style={{
                borderRadius: '16px',
                background: 'linear-gradient(145deg, rgba(38, 166, 154, 0.15), rgba(56, 178, 172, 0.15))'
              }}>
                <Sparkles className="w-5 h-5" style={{ color: '#26A69A' }} />
              </div>
              <div>
                <CardTitle className="text-lg" style={{ color: '#1A3A34' }}>
                  Recommended for You
                </CardTitle>
                <p className="text-xs" style={{ color: '#5A7A72' }}>
                  AI-tailored based on your journey
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="flex-shrink-0"
              title="Refresh recommendations"
            >
              <RefreshCw className="w-4 h-4" style={{ color: '#26A69A' }} />
            </Button>
          </div>
          
          {aiRecommendations.insights && (
            <div className="mt-4 p-3" style={{
              borderRadius: '16px',
              backgroundColor: 'rgba(159, 122, 234, 0.1)',
              border: '1px solid rgba(159, 122, 234, 0.2)'
            }}>
              <p className="text-sm break-words" style={{ color: '#1A3A34' }}>
                💡 <strong>Insights:</strong> {aiRecommendations.insights}
              </p>
            </div>
          )}
        </CardHeader>
        
        <CardContent className="space-y-3">
          {aiRecommendations.recommendations.map((rec, index) => {
            const Icon = rec.type === 'exercise' ? Play :
                        rec.type === 'resource' ? BookOpen :
                        rec.type === 'video' ? Play :
                        rec.type === 'journal_prompt' ? BookOpen : Target;
            
            const priorityColors = {
              high: { bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', text: '#DC2626' },
              medium: { bg: 'rgba(246, 173, 85, 0.1)', border: 'rgba(246, 173, 85, 0.3)', text: '#EA580C' },
              low: { bg: 'rgba(38, 166, 154, 0.1)', border: 'rgba(38, 166, 154, 0.3)', text: '#26A69A' }
            };
            
            const colors = priorityColors[rec.priority] || priorityColors.medium;

            return (
              <motion.div
                key={`${rec.type}-${rec.id || index}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 hover:shadow-md transition-all cursor-pointer group"
                style={{
                  borderRadius: '20px',
                  backgroundColor: colors.bg,
                  border: `1px solid ${colors.border}`
                }}
                onClick={() => {
                  if (rec.type === 'exercise' && rec.id) {
                    window.location.href = createPageUrl('Exercises');
                  } else if (rec.type === 'journal_prompt') {
                    window.location.href = createPageUrl('Chat', 'intent=thought_work');
                  } else if (rec.type === 'resource' && rec.id) {
                    window.location.href = createPageUrl('Resources');
                  } else if (rec.type === 'video' && rec.id) {
                    window.location.href = createPageUrl('Videos');
                  }
                }}
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{
                    borderRadius: '14px',
                    backgroundColor: colors.bg,
                    border: `1px solid ${colors.border}`
                  }}>
                    <Icon className="w-5 h-5" style={{ color: colors.text }} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-sm break-words" style={{ color: '#1A3A34' }}>
                        {rec.title}
                      </h4>
                      {rec.priority === 'high' && (
                        <Badge variant="outline" className="text-xs flex-shrink-0" style={{
                          borderRadius: '8px',
                          borderColor: colors.border,
                          color: colors.text,
                          backgroundColor: colors.bg
                        }}>
                          Priority
                        </Badge>
                      )}
                    </div>
                    
                    <p className="text-xs mb-2 break-words" style={{ color: '#5A7A72' }}>
                      {rec.description}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <p className="text-xs italic break-words" style={{ color: '#7A8A82' }}>
                        {rec.reason}
                      </p>
                      <ArrowRight className="w-4 h-4 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: colors.text }} />
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </CardContent>
      </Card>
    </motion.div>
  );
}
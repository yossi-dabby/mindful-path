import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';

const DAY_THEMES = [
  { title: "Welcome & Breathing", description: "Learn foundational breathing techniques" },
  { title: "Understanding Thoughts", description: "Identify automatic thinking patterns" },
  { title: "Grounding Practice", description: "Stay present with grounding exercises" },
  { title: "Challenging Beliefs", description: "Question negative thought patterns" },
  { title: "Building Momentum", description: "Take small behavioral actions" },
  { title: "Mindful Awareness", description: "Cultivate present-moment awareness" },
  { title: "Integration & Next Steps", description: "Review and plan ahead" }
];

export default function StarterPathCard() {
  const queryClient = useQueryClient();

  // Get user's starter path progress
  const { data: starterPath, isLoading } = useQuery({
    queryKey: ['starterPath'],
    queryFn: async () => {
      const paths = await base44.entities.StarterPath.list();
      return paths[0] || null;
    }
  });

  const startPathMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      return await base44.entities.StarterPath.create({
        current_day: 1,
        started_date: today
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['starterPath']);
      // Navigation handled by Link component
    }
  });

  if (isLoading) {
    return null;
  }

  // Don't show if completed
  if (starterPath?.completed) {
    return null;
  }

  const currentDay = starterPath?.current_day || 0;
  const isStarted = currentDay > 0;
  const dayTheme = currentDay > 0 ? DAY_THEMES[currentDay - 1] : null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="mb-8 border-0 shadow-soft hover:shadow-lg transition-calm" style={{ 
        borderRadius: 'var(--r-xl)',
        backgroundColor: 'rgb(var(--surface))',
        background: 'linear-gradient(135deg, rgb(var(--surface)), rgb(var(--calm) / 0.08))'
      }}>
        <CardContent className="p-8">
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              {/* Header */}
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="w-5 h-5 icon-default" style={{ color: 'rgb(var(--calm))' }} strokeWidth={2} />
                <h3 className="text-xl font-semibold" style={{ color: 'rgb(var(--text))' }}>
                  7-Day Starter Path
                </h3>
                {isStarted && (
                  <Badge variant="secondary" className="border-0" style={{ 
                    borderRadius: 'var(--r-sm)',
                    backgroundColor: 'rgb(var(--calm) / 0.15)',
                    color: 'rgb(var(--calm))'
                  }}>
                    Day {currentDay} of 7
                  </Badge>
                )}
              </div>

              {/* Description */}
              <p className="mb-4" style={{ color: 'rgb(var(--muted))' }}>
                {isStarted 
                  ? dayTheme?.description || "Continue your guided CBT journey"
                  : "Build a strong foundation with guided daily practices"}
              </p>

              {/* Progress Bar */}
              {isStarted && (
                <div className="mb-4">
                  <div className="h-2 rounded-full overflow-hidden" style={{ 
                    backgroundColor: 'rgb(var(--border))'
                  }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(currentDay / 7) * 100}%` }}
                      transition={{ duration: 0.5 }}
                      style={{ 
                        height: '100%',
                        backgroundColor: 'rgb(var(--calm))',
                        borderRadius: 'var(--r-xs)'
                      }}
                    />
                  </div>
                  <p className="text-xs mt-1" style={{ color: 'rgb(var(--muted))' }}>
                    {currentDay} of 7 days completed
                  </p>
                </div>
              )}

              {/* CTA */}
              {isStarted ? (
                <Link to={createPageUrl('StarterPath')}>
                  <Button
                    className="transition-calm"
                    style={{ 
                      borderRadius: 'var(--r-md)',
                      backgroundColor: 'rgb(var(--calm))',
                      color: 'rgb(var(--accent-contrast))'
                    }}
                  >
                    Continue
                    <ArrowRight className="w-4 h-4 ml-2 icon-default" strokeWidth={2} />
                  </Button>
                </Link>
              ) : (
                <Button
                  onClick={() => startPathMutation.mutate()}
                  disabled={startPathMutation.isPending}
                  className="transition-calm"
                  style={{ 
                    borderRadius: 'var(--r-md)',
                    backgroundColor: 'rgb(var(--calm))',
                    color: 'rgb(var(--accent-contrast))'
                  }}
                >
                  {startPathMutation.isPending ? 'Starting...' : 'Start Path'}
                  <ArrowRight className="w-4 h-4 ml-2 icon-default" strokeWidth={2} />
                </Button>
              )}
            </div>

            {/* Visual Indicator */}
            <div className="flex-shrink-0">
              <motion.div
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
                className="w-16 h-16 flex items-center justify-center"
                style={{ 
                  borderRadius: 'var(--r-xl)',
                  backgroundColor: 'rgb(var(--calm) / 0.15)'
                }}
              >
                {isStarted ? (
                  <div className="text-center">
                    <p className="text-2xl font-bold" style={{ color: 'rgb(var(--calm))' }}>{currentDay}</p>
                    <p className="text-xs" style={{ color: 'rgb(var(--calm))' }}>/ 7</p>
                  </div>
                ) : (
                  <Sparkles className="w-8 h-8 icon-default" style={{ color: 'rgb(var(--calm))' }} strokeWidth={2} />
                )}
              </motion.div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
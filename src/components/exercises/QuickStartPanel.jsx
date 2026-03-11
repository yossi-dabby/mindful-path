import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Zap, Clock, Heart, Play, Headphones, Eye, Wind, Anchor, Brain, Sparkles, Moon, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

const categoryIcons = {
  breathing: Wind,
  grounding: Anchor,
  cognitive_restructuring: Brain,
  behavioral_activation: Activity,
  mindfulness: Sparkles,
  exposure: Heart,
  sleep: Moon,
  relationships: Users,
  stress_management: Zap
};

const categoryColors = {
  breathing: { bg: 'rgba(66, 153, 225, 0.15)', text: '#4299E1' },
  grounding: { bg: 'rgba(72, 187, 120, 0.15)', text: '#48BB78' },
  cognitive_restructuring: { bg: 'rgba(159, 122, 234, 0.15)', text: '#9F7AEA' },
  behavioral_activation: { bg: 'rgba(237, 137, 54, 0.15)', text: '#ED8936' },
  mindfulness: { bg: 'rgba(237, 100, 166, 0.15)', text: '#ED64A6' },
  exposure: { bg: 'rgba(245, 101, 101, 0.15)', text: '#F56565' },
  sleep: { bg: 'rgba(99, 102, 241, 0.15)', text: '#6366F1' },
  relationships: { bg: 'rgba(56, 178, 172, 0.15)', text: '#38B2AC' },
  stress_management: { bg: 'rgba(246, 173, 85, 0.15)', text: '#F6AD55' }
};

const mediaIcons = {
  text: null,
  audio: Headphones,
  video: Play,
  visualization: Eye
};

export default function QuickStartPanel({ exercises, onSelectExercise }) {
  // Get frequently used and favorite exercises
  const frequentExercises = [...exercises]
    .filter(e => e.completed_count > 0)
    .sort((a, b) => (b.completed_count || 0) - (a.completed_count || 0))
    .slice(0, 3);

  const recentExercises = [...exercises]
    .filter(e => e.last_completed)
    .sort((a, b) => new Date(b.last_completed) - new Date(a.last_completed))
    .slice(0, 3);

  const favoriteExercises = exercises.filter(e => e.favorite).slice(0, 3);

  // Combine and deduplicate
  const quickStartExercises = [];
  const seen = new Set();

  [...favoriteExercises, ...frequentExercises, ...recentExercises].forEach(ex => {
    if (!seen.has(ex.id) && quickStartExercises.length < 4) {
      seen.add(ex.id);
      quickStartExercises.push(ex);
    }
  });

  if (quickStartExercises.length === 0) return null;

  return (
    <Card className="border border-border/80 bg-card shadow-[var(--shadow-md)] mb-6">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
          <motion.div
            animate={{ rotate: [0, 15, -15, 0] }}
            transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 2 }}
          >
            <Zap className="w-5 h-5 text-accent" />
          </motion.div>
          Quick Start
          <Badge variant="warning" className="ml-2 text-xs">
            Your go-to exercises
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {quickStartExercises.map((exercise, index) => {
            const Icon = categoryIcons[exercise.category] || Sparkles;
            const colors = categoryColors[exercise.category] || categoryColors.mindfulness;
            const MediaIcon = mediaIcons[exercise.media_type];
            
            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.03, y: -4 }}
                whileTap={{ scale: 0.98 }}
              >
                <button
                  onClick={() => onSelectExercise(exercise)}
                  className="w-full text-left p-3 sm:p-4 rounded-2xl transition-all bg-secondary/45 border border-border/60 shadow-[var(--shadow-sm)]"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div 
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{ background: colors.bg }}
                    >
                      <Icon className="w-5 h-5" style={{ color: colors.text }} />
                    </div>
                    <div className="flex items-center gap-1">
                      {exercise.favorite && (
                        <Heart className="w-3 h-3 fill-red-500 text-red-500" />
                      )}
                      {MediaIcon && (
                        <MediaIcon className="w-3 h-3" style={{ color: '#7A9A92' }} />
                      )}
                    </div>
                  </div>
                  <h4 className="font-medium text-sm mb-1 line-clamp-1 text-foreground">
                    {exercise.title}
                  </h4>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {exercise.duration_options?.[0] || 5} min
                    {exercise.completed_count > 0 && (
                      <span className="ml-auto">×{exercise.completed_count}</span>
                    )}
                  </div>
                </button>
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
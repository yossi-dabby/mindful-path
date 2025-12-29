import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Heart, Dumbbell, Lightbulb, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function TodaysFocus({ onStartCheckIn, onStartExercise, onStartReflection }) {
  const queryClient = useQueryClient();

  // Get today's flow
  const { data: todayFlow, isLoading } = useQuery({
    queryKey: ['todayFlow'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const flows = await base44.entities.DailyFlow.filter({ date: today });
      return flows[0] || null;
    }
  });

  // Get today's mood
  const { data: todayMood } = useQuery({
    queryKey: ['todayMood'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const moods = await base44.entities.MoodEntry.filter({ date: today });
      return moods[0] || null;
    }
  });

  // Get today's exercise if assigned
  const { data: todayExercise } = useQuery({
    queryKey: ['todayExercise', todayFlow?.exercise_id],
    queryFn: async () => {
      if (!todayFlow?.exercise_id) return null;
      const exercises = await base44.entities.Exercise.filter({ id: todayFlow.exercise_id });
      return exercises[0] || null;
    },
    enabled: !!todayFlow?.exercise_id
  });

  if (isLoading) {
    return (
      <Card className="mb-8 border-0 shadow-soft" style={{ 
        borderRadius: 'var(--r-xl)',
        backgroundColor: 'rgb(var(--surface))'
      }}>
        <CardContent className="p-6 text-center">
          <p style={{ color: 'rgb(var(--muted))' }}>Loading today's focus...</p>
        </CardContent>
      </Card>
    );
  }

  // Determine current step
  const getCurrentStep = () => {
    if (!todayFlow || !todayFlow.check_in_completed) {
      return {
        step: 1,
        title: "Daily Check-in",
        description: "Let's start by understanding how you're feeling today",
        icon: Heart,
        action: "Start Check-in",
        onAction: onStartCheckIn,
        color: 'accent'
      };
    }

    if (!todayFlow.exercise_completed) {
      return {
        step: 2,
        title: "Today's Exercise",
        description: todayExercise?.title || "Complete your personalized CBT exercise",
        icon: Dumbbell,
        action: "Start Exercise",
        onAction: onStartExercise,
        color: 'success',
        subtitle: todayExercise?.description
      };
    }

    if (!todayFlow.reflection_completed) {
      return {
        step: 3,
        title: "Daily Reflection",
        description: "Take a moment to reflect on today's practice",
        icon: Lightbulb,
        action: "Complete Reflection",
        onAction: onStartReflection,
        color: 'calm'
      };
    }

    // All steps completed
    return {
      step: 'complete',
      title: "You're all done for today!",
      description: todayFlow.daily_takeaway || "You've completed your daily practice. Great work!",
      icon: CheckCircle2,
      color: 'success'
    };
  };

  const currentStep = getCurrentStep();
  const Icon = currentStep.icon;

  const colorMap = {
    accent: 'rgb(var(--accent))',
    success: 'rgb(var(--success))',
    calm: 'rgb(var(--calm))'
  };

  const bgColorMap = {
    accent: 'rgb(var(--accent) / 0.1)',
    success: 'rgb(var(--success) / 0.1)',
    calm: 'rgb(var(--calm) / 0.1)'
  };

  if (currentStep.step === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 shadow-soft" style={{ 
          borderRadius: 'var(--r-lg)',
          backgroundColor: 'rgb(var(--surface))',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
        }}>
          <CardContent className="p-5 text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
              className="inline-flex w-12 h-12 items-center justify-center mb-3"
              style={{ 
                borderRadius: 'var(--r-lg)',
                backgroundColor: bgColorMap[currentStep.color]
              }}
            >
              <Icon className="w-6 h-6 icon-default" style={{ color: colorMap[currentStep.color] }} strokeWidth={2} />
            </motion.div>
            <h2 className="text-base font-semibold mb-1" style={{ color: 'rgb(var(--text))' }}>
              {currentStep.title}
            </h2>
            <p className="text-sm" style={{ color: 'rgb(var(--muted))' }}>
              Come back tomorrow for your next practice
            </p>
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-soft hover:shadow-lg transition-calm" style={{ 
        borderRadius: 'var(--r-lg)',
        backgroundColor: 'rgb(var(--surface))',
        boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
      }}>
        <CardContent className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className="h-1.5 rounded-full transition-calm"
                  style={{
                    width: '60px',
                    backgroundColor: stepNum <= currentStep.step 
                      ? colorMap[currentStep.color]
                      : 'rgb(var(--border))'
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-medium ml-2" style={{ color: 'rgb(var(--muted))' }}>
              Step {currentStep.step} of 3
            </span>
          </div>

          {/* Main Content */}
          <div className="flex items-start gap-6">
            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{ duration: 3, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
              className="flex-shrink-0 w-16 h-16 flex items-center justify-center"
              style={{ 
                borderRadius: 'var(--r-lg)',
                backgroundColor: bgColorMap[currentStep.color]
              }}
            >
              <Icon className="w-8 h-8 icon-default" style={{ color: colorMap[currentStep.color] }} strokeWidth={2} />
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold truncate" style={{ color: 'rgb(var(--text))' }}>
                  {currentStep.title}
                </h2>
                <Sparkles className="w-5 h-5 icon-default" style={{ color: colorMap[currentStep.color] }} strokeWidth={2} />
              </div>
              <p className="text-sm mb-1 line-clamp-2" style={{ color: 'rgb(var(--text))' }}>
                {currentStep.description}
              </p>
              {currentStep.subtitle && (
                <p className="text-xs mb-4 line-clamp-2" style={{ color: 'rgb(var(--muted))' }}>
                  {currentStep.subtitle}
                </p>
              )}

              <Button
                onClick={currentStep.onAction}
                className="px-6 py-5 text-base shadow-soft hover:shadow-lg transition-calm"
                style={{ 
                  borderRadius: 'var(--r-lg)',
                  backgroundColor: colorMap[currentStep.color],
                  color: 'rgb(var(--accent-contrast))'
                }}
              >
                {currentStep.action}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
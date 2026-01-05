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
    accent: '#26A69A',
    success: '#26A69A',
    calm: '#26A69A'
  };

  const bgColorMap = {
    accent: 'rgba(38, 166, 154, 0.15)',
    success: 'rgba(38, 166, 154, 0.15)',
    calm: 'rgba(38, 166, 154, 0.15)'
  };

  if (currentStep.step === 'complete') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0" style={{ 
          borderRadius: '24px',
          background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.6) 0%, rgba(255, 255, 255, 0.85) 100%)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 4px 16px rgba(38, 166, 154, 0.12), 0 2px 4px rgba(0,0,0,0.04)'
        }}>
          <CardContent className="p-5 text-center">
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
              className="inline-flex w-12 h-12 items-center justify-center mb-3"
              style={{ 
                borderRadius: '16px',
                backgroundColor: bgColorMap[currentStep.color]
              }}
            >
              <Icon className="w-6 h-6 icon-default" style={{ color: colorMap[currentStep.color] }} strokeWidth={2} />
            </motion.div>
            <h2 className="text-base font-semibold mb-1" style={{ color: '#2D3748' }}>
              {currentStep.title}
            </h2>
            <p className="text-sm" style={{ color: '#718096' }}>
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
      <Card className="border-0 hover:shadow-lg transition-calm" style={{ 
        borderRadius: '24px',
        background: 'linear-gradient(135deg, rgba(224, 242, 241, 0.6) 0%, rgba(255, 255, 255, 0.85) 100%)',
        backdropFilter: 'blur(10px)',
        boxShadow: '0 4px 16px rgba(38, 166, 154, 0.12), 0 2px 4px rgba(0,0,0,0.04)'
      }}>
        <CardContent className="p-6">
          {/* Progress Indicator */}
          <div className="flex items-center gap-2 mb-6">
            <div className="flex gap-1">
              {[1, 2, 3].map((stepNum) => (
                <div
                  key={stepNum}
                  className="h-1.5 transition-calm"
                  style={{
                    width: '60px',
                    borderRadius: '8px',
                    backgroundColor: stepNum <= currentStep.step 
                      ? colorMap[currentStep.color]
                      : '#E2E8F0'
                  }}
                />
              ))}
            </div>
            <span className="text-sm font-medium ml-2" style={{ color: '#718096' }}>
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
                borderRadius: '16px',
                backgroundColor: bgColorMap[currentStep.color]
              }}
            >
              <Icon className="w-8 h-8 icon-default" style={{ color: colorMap[currentStep.color] }} strokeWidth={2} />
            </motion.div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-xl font-semibold truncate" style={{ color: '#2D3748' }}>
                  {currentStep.title}
                </h2>
                <Sparkles className="w-5 h-5 icon-default" style={{ color: colorMap[currentStep.color] }} strokeWidth={2} />
              </div>
              <p className="text-sm mb-1 line-clamp-2" style={{ color: '#4A5568' }}>
                {currentStep.description}
              </p>
              {currentStep.subtitle && (
                <p className="text-xs mb-4 line-clamp-2" style={{ color: '#718096' }}>
                  {currentStep.subtitle}
                </p>
              )}

              <Button
                onClick={currentStep.onAction}
                className="px-7 py-6 text-base hover:shadow-lg transition-calm text-white"
                style={{ 
                  borderRadius: '16px',
                  backgroundColor: colorMap[currentStep.color],
                  boxShadow: '0 3px 10px rgba(38, 166, 154, 0.2), 0 1px 3px rgba(0,0,0,0.08)'
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
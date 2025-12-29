import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MessageCircle, Sparkles, Heart, TrendingUp, BookOpen, Target } from 'lucide-react';
import MoodCheckIn from '../components/home/MoodCheckIn';
import QuickActions from '../components/home/QuickActions';
import RecentProgress from '../components/home/RecentProgress';
import ProactiveNudges from '../components/home/ProactiveNudges';
import WelcomeWizard from '../components/onboarding/WelcomeWizard';
import StreakWidget from '../components/gamification/StreakWidget';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import DailyChallenges from '../components/gamification/DailyChallenges';
import DailyProgram from '../components/home/DailyProgram';
import PersonalizedFeed from '../components/home/PersonalizedFeed';
import TodaysFocus from '../components/home/TodaysFocus';
import DailyReflection from '../components/home/DailyReflection';
import StarterPathCard from '../components/home/StarterPathCard';
import ExerciseDetail from '../components/exercises/ExerciseDetail';
import { motion } from 'framer-motion';

export default function Home() {
  const [user, setUser] = useState(null);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showExercise, setShowExercise] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(userData => {
      setUser(userData);
      if (!userData.onboarding_completed) {
        setShowOnboarding(true);
      }
    }).catch(() => {});
  }, []);

  const { data: todayMood } = useQuery({
    queryKey: ['todayMood'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const moods = await base44.entities.MoodEntry.filter({ date: today });
      return moods[0] || null;
    }
  });

  const { data: recentGoals } = useQuery({
    queryKey: ['recentGoals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }, '-created_date', 3),
    initialData: []
  });

  const { data: journalCount } = useQuery({
    queryKey: ['journalCount'],
    queryFn: async () => {
      const entries = await base44.entities.ThoughtJournal.list();
      return entries.length;
    },
    initialData: 0
  });

  // Get today's flow
  const { data: todayFlow } = useQuery({
    queryKey: ['todayFlow'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const flows = await base44.entities.DailyFlow.filter({ date: today });
      return flows[0] || null;
    }
  });

  // Get today's exercise
  const { data: todayExercise } = useQuery({
    queryKey: ['todayExercise', todayFlow?.exercise_id],
    queryFn: async () => {
      if (!todayFlow?.exercise_id) return null;
      const exercises = await base44.entities.Exercise.filter({ id: todayFlow.exercise_id });
      return exercises[0] || null;
    },
    enabled: !!todayFlow?.exercise_id
  });

  // Auto-assign exercise when check-in is completed
  const assignExerciseMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get or create today's flow
      let flow = todayFlow;
      if (!flow) {
        const newFlow = await base44.entities.DailyFlow.create({
          date: today,
          check_in_completed: true,
          check_in_time: new Date().toISOString()
        });
        flow = newFlow;
      }

      // Select exercise based on recent mood data
      const recentMoods = await base44.entities.MoodEntry.list('-created_date', 7);
      const allExercises = await base44.entities.Exercise.list();
      
      // Simple scoring logic
      const anxietyCount = recentMoods.filter(m => 
        m.emotions?.some(e => e.toLowerCase().includes('anxi'))
      ).length;
      const lowMoodCount = recentMoods.filter(m => 
        ['low', 'very_low'].includes(m.mood)
      ).length;

      let targetCategory = 'mindfulness';
      if (anxietyCount > 2) targetCategory = 'breathing';
      if (lowMoodCount > 3) targetCategory = 'behavioral_activation';

      const matchingExercises = allExercises.filter(e => e.category === targetCategory);
      const selectedExercise = matchingExercises[Math.floor(Math.random() * matchingExercises.length)] 
        || allExercises[0];

      await base44.entities.DailyFlow.update(flow.id, {
        exercise_id: selectedExercise.id
      });

      return selectedExercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['todayFlow']);
      queryClient.invalidateQueries(['todayExercise']);
    }
  });

  const handleStartCheckIn = () => {
    setShowMoodCheckIn(true);
  };

  const handleCheckInComplete = () => {
    setShowMoodCheckIn(false);
    assignExerciseMutation.mutate();
  };

  const handleStartExercise = () => {
    setShowExercise(true);
  };

  const handleExerciseComplete = async () => {
    if (todayFlow) {
      await base44.entities.DailyFlow.update(todayFlow.id, {
        exercise_completed: true,
        exercise_time: new Date().toISOString()
      });
      queryClient.invalidateQueries(['todayFlow']);
    }
    setShowExercise(false);
    setShowReflection(true);
  };

  const handleStartReflection = () => {
    setShowReflection(true);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--bg))' }}>
      <div className="page-container max-w-5xl">
        {/* Header */}
        <motion.div 
          className="mb-8 mt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-3xl md:text-4xl font-light mb-2" style={{ color: 'rgb(var(--text))' }}>
            {greeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
        </motion.div>

        {/* Today's Focus - Primary CTA */}
        <div className="space-y-4">
          <TodaysFocus
            onStartCheckIn={handleStartCheckIn}
            onStartExercise={handleStartExercise}
            onStartReflection={handleStartReflection}
          />

          {/* 7-Day Starter Path */}
          <StarterPathCard />
        </div>

      {/* Secondary Content - Below the fold */}
      <div className="mt-8 space-y-4">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 text-center" style={{ 
            borderRadius: 'var(--r-md)',
            backgroundColor: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))'
          }}>
            <p className="text-2xl font-bold" style={{ color: 'rgb(var(--text))' }}>{recentGoals.length}</p>
            <p className="text-xs" style={{ color: 'rgb(var(--muted))' }}>Active Goals</p>
          </div>
          <div className="p-4 text-center" style={{ 
            borderRadius: 'var(--r-md)',
            backgroundColor: 'rgb(var(--surface))',
            border: '1px solid rgb(var(--border))'
          }}>
            <p className="text-2xl font-bold" style={{ color: 'rgb(var(--text))' }}>{journalCount}</p>
            <p className="text-xs" style={{ color: 'rgb(var(--muted))' }}>Journal Entries</p>
          </div>
          <StreakWidget compact />
          <BadgeDisplay compact />
        </div>

        {/* Quick Actions - Simplified */}
        <QuickActions />
      </div>



      {/* Mood Check-in Modal */}
      {showMoodCheckIn && (
        <MoodCheckIn onClose={handleCheckInComplete} />
      )}

      {/* Exercise Modal */}
      {showExercise && todayExercise && (
        <ExerciseDetail
          exercise={todayExercise}
          onClose={() => setShowExercise(false)}
          onComplete={handleExerciseComplete}
        />
      )}

      {/* Reflection Modal */}
      {showReflection && (
        <DailyReflection
          todayFlow={todayFlow}
          exercise={todayExercise}
          onClose={() => setShowReflection(false)}
        />
      )}

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <WelcomeWizard
          onComplete={() => {
            setShowOnboarding(false);
            queryClient.invalidateQueries(['currentUser']);
          }}
        />
      )}
      </div>
    </div>
  );
}
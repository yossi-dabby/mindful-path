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
    <div style={{ 
      minHeight: '100vh',
      background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)'
    }}>
      <div className="page-container max-w-5xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-4 mt-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-xl md:text-2xl font-normal mb-2" style={{ color: '#1A3A34' }}>
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
          <div className="p-5 text-center" style={{ 
            borderRadius: '28px',
            background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.85) 0%, rgba(180, 220, 210, 0.75) 100%)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(38, 166, 154, 0.18), 0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.4)'
          }}>
            <p className="text-2xl font-bold mb-1" style={{ color: '#1A3A34' }}>{recentGoals.length}</p>
            <p className="text-xs" style={{ color: '#3D5A52' }}>Active Goals</p>
          </div>
          <div className="p-5 text-center" style={{ 
            borderRadius: '28px',
            background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.85) 0%, rgba(180, 220, 210, 0.75) 100%)',
            backdropFilter: 'blur(12px)',
            boxShadow: '0 8px 32px rgba(38, 166, 154, 0.18), 0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.4)'
          }}>
            <p className="text-2xl font-bold mb-1" style={{ color: '#1A3A34' }}>{journalCount}</p>
            <p className="text-xs" style={{ color: '#3D5A52' }}>Journal Entries</p>
          </div>
          <StreakWidget compact />
          <BadgeDisplay compact />
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <QuickActions />
        </div>
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
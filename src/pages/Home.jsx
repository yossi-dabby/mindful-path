import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, BookOpen, Target } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import MoodCheckIn from '../components/home/MoodCheckIn';
import QuickActions from '../components/home/QuickActions';
import WelcomeWizard from '../components/onboarding/WelcomeWizard';
import StreakWidget from '../components/gamification/StreakWidget';
import BadgeDisplay from '../components/gamification/BadgeDisplay';
import StandaloneDailyCheckIn from '../components/home/StandaloneDailyCheckIn';
import DailyReflection from '../components/home/DailyReflection';
import ExerciseDetail from '../components/exercises/ExerciseDetail';
import VideoModal from '../components/home/VideoModal';
import GoalsDashboardWidget from '../components/goals/GoalsDashboardWidget';
import PullToRefresh from '../components/utils/PullToRefresh';

export default function Home() {
  const { t } = useTranslation();
  const [user, setUser] = useState(null);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showReflection, setShowReflection] = useState(false);
  const [showExercise, setShowExercise] = useState(false);
  const [showGoalsVideo, setShowGoalsVideo] = useState(false);
  const [showJournalVideo, setShowJournalVideo] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    // Use sessionStorage cache from Layout.js if available
    const cached = sessionStorage.getItem('user_prefs_loaded');
    if (cached) {
      try {
        const { name, onboarding_completed } = JSON.parse(cached);
        if (name) setUser({ full_name: name });
        if (onboarding_completed === false) setShowOnboarding(true);
      } catch (_) {}
    }
    base44.auth.me().then(userData => {
      setUser(userData);
      if (!userData.onboarding_completed) {
        setShowOnboarding(true);
      }
      // Update cache with onboarding status
      try {
        const prev = JSON.parse(sessionStorage.getItem('user_prefs_loaded') || '{}');
        sessionStorage.setItem('user_prefs_loaded', JSON.stringify({
          ...prev,
          name: userData.full_name,
          onboarding_completed: userData.onboarding_completed
        }));
      } catch (_) {}
    }).catch(() => {});
  }, []);

  const { data: todayMood, isError: moodError, refetch: refetchMood } = useQuery({
    queryKey: ['todayMood'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const moods = await base44.entities.MoodEntry.filter({ date: today });
      return moods[0] || null;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  const { data: recentGoals, isError: goalsError, refetch: refetchGoals } = useQuery({
    queryKey: ['recentGoals'],
    queryFn: () => base44.entities.Goal.filter({ status: 'active' }, '-created_date', 3),
    initialData: [],
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  // Combined query for journal data - fetch recent entries and use for both count and latest
  const { data: recentJournals, isError: journalsError, refetch: refetchJournals } = useQuery({
    queryKey: ['recentJournals'],
    queryFn: async () => {
      const entries = await base44.entities.ThoughtJournal.list('-created_date', 10);
      return entries;
    },
    initialData: [],
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
  });

  // Derive values from combined query
  const latestGoal = recentGoals[0] || null;
  const journalCount = recentJournals.length;
  const latestJournalEntry = recentJournals[0] || null;
  const savedEntryId = latestJournalEntry ? latestJournalEntry.id : null;

  // Get today's flow
  const { data: todayFlow } = useQuery({
    queryKey: ['todayFlow'],
    queryFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      const flows = await base44.entities.DailyFlow.filter({ date: today });
      return flows[0] || null;
    },
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false
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

  // Cache all exercises with longer stale time for assignment logic
  const { data: allExercises } = useQuery({
    queryKey: ['allExercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: [],
    staleTime: 1000 * 60 * 30 // 30 minutes - exercises don't change often
  });

  // Auto-assign exercise when check-in is completed
  const assignExerciseMutation = useMutation({
    mutationFn: async () => {
      const today = new Date().toISOString().split('T')[0];
      
      // Get or create today's flow (prevent duplicates)
      let flow = todayFlow;
      if (!flow) {
        // Check if flow already exists before creating
        const existingFlows = await base44.entities.DailyFlow.filter({ date: today });
        if (existingFlows.length > 0) {
          flow = existingFlows[0];
        } else {
          const newFlow = await base44.entities.DailyFlow.create({
            date: today,
            check_in_completed: true,
            check_in_time: new Date().toISOString()
          });
          flow = newFlow;
        }
      }

      // Select exercise based on recent mood data
      const recentMoods = await base44.entities.MoodEntry.list('-created_date', 7);
      
      // Use cached exercises from query instead of fetching again
      const exercises = allExercises.length > 0 ? allExercises : await base44.entities.Exercise.list();
      
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

      const matchingExercises = exercises.filter(e => e.category === targetCategory);
      const selectedExercise = matchingExercises[Math.floor(Math.random() * matchingExercises.length)] 
        || exercises[0];

      await base44.entities.DailyFlow.update(flow.id, {
        exercise_id: selectedExercise.id
      });

      return selectedExercise;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['todayFlow'] });
      queryClient.invalidateQueries({ queryKey: ['todayExercise'] });
    }
  });

  const handleStartCheckIn = () => {
    // Route to AI with daily_checkin intent instead of showing form
    window.location.href = createPageUrl('Chat', 'intent=daily_checkin');
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
      queryClient.invalidateQueries({ queryKey: ['todayFlow'] });
    }
    setShowExercise(false);
    setShowReflection(true);
  };

  const handleStartReflection = () => {
    setShowReflection(true);
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return t('home.greeting.morning');
    if (hour < 18) return t('home.greeting.afternoon');
    return t('home.greeting.evening');
  };

  return (
    <PullToRefresh queryKeys={['recentGoals', 'recentJournals', 'todayFlow', 'todayMood', 'todayExercise']}>
      <div className="w-full min-h-[100dvh]">
        <div className="page-container max-w-5xl mx-auto w-full pb-24">
        {/* Header */}
        <div className="mb-6 mt-6">
          <h1 className="text-2xl md:text-3xl font-semibold mb-2 text-foreground">
            {greeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
        </div>

        {/* Daily Check-in - Primary CTA */}
        <div className="space-y-4">
          <StandaloneDailyCheckIn />
          </div>

          {/* Secondary Content - Below the fold */}
        <div className="mt-8 space-y-4">
        
        {/* Goals Dashboard Widget */}
        <GoalsDashboardWidget />
        
        {/* Quick Stats */}
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="surface-secondary rounded-[var(--radius-card)] p-5 text-center relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              {latestGoal && (
                <Link to={createPageUrl('Goals', `goal=${latestGoal.id}`)}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-0 h-8 w-8 hover:bg-secondary/80 text-primary flex items-center justify-center rounded-full bg-secondary"
                    aria-label="View goal details"
                  >
                    <Target className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <p className="text-2xl font-bold text-foreground">{recentGoals.length}</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              {/* Help Video Button - MOBILE: LEFT of text */}
              <Button
                onClick={() => setShowGoalsVideo(true)}
                size="icon"
                variant="ghost"
                className="md:hidden p-0 h-6 w-6 rounded-full bg-accent/15 text-accent hover:bg-accent/20"
                title="Watch help video"
                aria-label="Watch goals help video"
              >
                <Sparkles className="w-3 h-3 text-accent" strokeWidth={2} />
              </Button>
              <p className="text-xs text-muted-foreground">{t('home.active_goals')}</p>
            </div>
            {/* Help Video Button - WEB: Below text */}
            <Button
              onClick={() => setShowGoalsVideo(true)}
              size="icon"
              variant="ghost"
              className="hidden md:flex p-0 h-7 w-7 mt-2 mx-auto rounded-full bg-accent/15 text-accent hover:bg-accent/20"
              title="Watch help video"
              aria-label="Watch goals help video"
            >
              <Sparkles className="w-4 h-4 text-accent" strokeWidth={2} />
            </Button>
          </div>
          <div className="surface-secondary rounded-[var(--radius-card)] p-5 text-center relative">
            <div className="flex items-center justify-center gap-2 mb-1">
              {savedEntryId && (
                <Link to={createPageUrl('Journal', `entry=${savedEntryId}`)}>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="p-0 h-8 w-8 hover:bg-secondary/80 text-primary flex items-center justify-center rounded-full bg-secondary"
                    aria-label="View journal entry"
                  >
                    <BookOpen className="w-4 h-4" />
                  </Button>
                </Link>
              )}
              <p className="text-2xl font-bold text-foreground">{journalCount}</p>
            </div>
            <div className="flex items-center justify-center gap-2">
              {/* Help Video Button - MOBILE: LEFT of text */}
              <Button
                onClick={() => setShowJournalVideo(true)}
                size="icon"
                variant="ghost"
                className="md:hidden p-0 h-6 w-6 rounded-full bg-accent/15 text-accent hover:bg-accent/20"
                title="Watch help video"
                aria-label="Watch journal help video"
              >
                <Sparkles className="w-3 h-3 text-accent" strokeWidth={2} />
              </Button>
              <p className="text-xs text-muted-foreground">{t('home.journal_entries')}</p>
            </div>
            {/* Help Video Button - WEB: Below text */}
            <Button
              onClick={() => setShowJournalVideo(true)}
              size="icon"
              variant="ghost"
              className="hidden md:flex p-0 h-7 w-7 mt-2 mx-auto rounded-full bg-accent/15 text-accent hover:bg-accent/20"
              title="Watch help video"
              aria-label="Watch journal help video"
            >
              <Sparkles className="w-4 h-4 text-accent" strokeWidth={2} />
            </Button>
          </div>
          <StreakWidget compact />
          <BadgeDisplay compact />
        </div>

        {/* Error State for Goals */}
        {goalsError && (
          <Card className="mt-6 border border-destructive/20 bg-destructive/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-foreground mb-2">{t('home.error.goals_load')}</p>
              <Button
                onClick={() => refetchGoals()}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                {t('common.retry')}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Error State for Journal */}
        {journalsError && (
          <Card className="mt-6 border border-destructive/20 bg-destructive/5">
            <CardContent className="p-4 text-center">
              <p className="text-sm text-foreground mb-2">{t('home.error.journal_load')}</p>
              <Button
                onClick={() => refetchJournals()}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                {t('common.retry')}
              </Button>
            </CardContent>
          </Card>
        )}

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
            queryClient.invalidateQueries({ queryKey: ['currentUser'] });
          }}
        />
      )}

      {/* Video Modals */}
      {showGoalsVideo && (
        <VideoModal
          videoUrl="https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%208.mp4?alt=media&token=cc85d70d-251f-41d9-a5a8-44a0b350f40b"
          onClose={() => setShowGoalsVideo(false)}
        />
      )}
      {showJournalVideo && (
        <VideoModal
          videoUrl="https://firebasestorage.googleapis.com/v0/b/my-cbt-therapy.firebasestorage.app/o/cbt%209.mp4?alt=media&token=4a8ae8b9-e803-4108-bc3e-26c4c25751f8"
          onClose={() => setShowJournalVideo(false)}
        />
      )}
        </div>
      </div>
    </PullToRefresh>
  );
}
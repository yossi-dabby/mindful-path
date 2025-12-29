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
import { motion } from 'framer-motion';

export default function Home() {
  const [user, setUser] = useState(null);
  const [showMoodCheckIn, setShowMoodCheckIn] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--bg))' }}>
      <div className="page-container max-w-5xl">
        {/* Header with increased spacing */}
        <motion.div 
          className="mb-12 mt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-light mb-3" style={{ color: 'rgb(var(--text))' }}>
            {greeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-xl" style={{ color: 'rgb(var(--muted))' }}>How are you feeling today?</p>
        </motion.div>

      {/* Daily Check-in Card */}
      {!todayMood ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 border-0 shadow-soft hover:shadow-lg transition-calm" style={{ 
            borderRadius: 'var(--r-xl)',
            backgroundColor: 'rgb(var(--surface))',
            background: 'linear-gradient(135deg, rgb(var(--surface)), rgb(var(--accent) / 0.05))'
          }}>
            <CardContent className="p-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div
                      animate={{ scale: [1, 1.15, 1] }}
                      transition={{ duration: 3, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
                    >
                      <Heart className="w-6 h-6 icon-default" style={{ color: 'rgb(var(--accent))' }} strokeWidth={2} />
                    </motion.div>
                    <h2 className="text-2xl font-semibold" style={{ color: 'rgb(var(--text))' }}>Daily Check-in</h2>
                  </div>
                  <p className="mb-6" style={{ color: 'rgb(var(--muted))' }}>
                    Taking a moment to understand your emotions helps build awareness and track your journey.
                  </p>
                  <Button 
                    onClick={() => setShowMoodCheckIn(true)}
                    className="px-8 py-7 text-lg shadow-soft hover:shadow-lg transition-calm"
                    style={{ 
                      borderRadius: 'var(--r-lg)',
                      backgroundColor: 'rgb(var(--accent))',
                      color: 'rgb(var(--accent-contrast))'
                    }}
                  >
                    Check in now
                    <Sparkles className="w-5 h-5 ml-2 icon-default" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="mb-6 border-0 shadow-soft" style={{ 
            borderRadius: 'var(--r-lg)',
            backgroundColor: 'rgb(var(--surface))'
          }}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-12 h-12 flex items-center justify-center"
                    style={{ 
                      borderRadius: 'var(--r-xl)',
                      backgroundColor: 'rgb(var(--success) / 0.15)'
                    }}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Heart className="w-6 h-6 icon-default" style={{ color: 'rgb(var(--success))' }} strokeWidth={2} />
                  </motion.div>
                  <div>
                    <p className="text-sm" style={{ color: 'rgb(var(--muted))' }}>Today's mood</p>
                    <p className="text-lg font-semibold capitalize" style={{ color: 'rgb(var(--text))' }}>
                      {todayMood.mood.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="secondary" className="border-0" style={{ 
                    borderRadius: 'var(--r-sm)',
                    backgroundColor: 'rgb(var(--success) / 0.15)',
                    color: 'rgb(var(--success))'
                  }}>
                    Checked in ✓
                  </Badge>
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Proactive Nudges */}
      <ProactiveNudges />

      {/* Personalized Content Feed */}
      <PersonalizedFeed />

      {/* Gamification Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <StreakWidget />
        <BadgeDisplay compact />
      </div>

      {/* Daily Program */}
      <div className="mb-8">
        <DailyProgram />
      </div>

      {/* Daily Challenges */}
      <div className="mb-8">
        <DailyChallenges />
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Stats Overview with better spacing */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          whileHover={{ y: -4 }}
        >
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all cursor-pointer rounded-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Active Goals</p>
                  <motion.p 
                    className="text-3xl font-bold text-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {recentGoals.length}
                  </motion.p>
                </div>
                <motion.div 
                  className="w-12 h-12 rounded-2xl bg-purple-100 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <Target className="w-6 h-6 text-purple-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          whileHover={{ y: -4 }}
        >
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all cursor-pointer rounded-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">Journal Entries</p>
                  <motion.p 
                    className="text-3xl font-bold text-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    {journalCount}
                  </motion.p>
                </div>
                <motion.div 
                  className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <BookOpen className="w-6 h-6 text-green-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          whileHover={{ y: -4 }}
        >
          <Card className="border-0 shadow-lg bg-white hover:shadow-xl transition-all cursor-pointer rounded-2xl">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500 mb-1">This Week</p>
                  <motion.p 
                    className="text-3xl font-bold text-gray-800"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    5
                  </motion.p>
                  <p className="text-xs text-green-600 mt-1">+2 from last week</p>
                </div>
                <motion.div 
                  className="w-12 h-12 rounded-2xl bg-coral-100 flex items-center justify-center"
                  whileHover={{ rotate: 360 }}
                  transition={{ duration: 0.5 }}
                >
                  <TrendingUp className="w-6 h-6 text-coral-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Recent Progress */}
      <RecentProgress goals={recentGoals} />

      {/* Mood Check-in Modal */}
      {showMoodCheckIn && (
        <MoodCheckIn onClose={() => setShowMoodCheckIn(false)} />
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
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
import OnboardingTour from '../components/onboarding/OnboardingTour';
import ProactiveNudges from '../components/home/ProactiveNudges';
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
    <div className="min-h-screen bg-warm-gradient">
      <div className="page-container max-w-5xl">
        {/* Header with increased spacing */}
        <motion.div 
          className="mb-12 mt-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-3">
            {greeting()}{user?.full_name ? `, ${user.full_name.split(' ')[0]}` : ''}
          </h1>
          <p className="text-gray-600 text-xl">How are you feeling today?</p>
        </motion.div>

      {/* Daily Check-in Card */}
      {!todayMood ? (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="mb-8 border-0 shadow-xl bg-gradient-to-br from-orange-50 via-white to-pink-50 hover:shadow-2xl transition-all duration-300 rounded-3xl">
            <CardContent className="p-10">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-3">
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Heart className="w-6 h-6 text-coral-500" />
                    </motion.div>
                    <h2 className="text-2xl font-semibold text-gray-800">Daily Check-in</h2>
                  </div>
                  <p className="text-gray-600 mb-6">
                    Taking a moment to understand your emotions helps build awareness and track your journey.
                  </p>
                  <Button 
                    onClick={() => setShowMoodCheckIn(true)}
                    className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white px-8 py-7 text-lg rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    Check in now
                    <Sparkles className="w-5 h-5 ml-2" />
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
          <Card className="mb-6 border-0 shadow-md bg-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <motion.div 
                    className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center"
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <Heart className="w-6 h-6 text-green-600" />
                  </motion.div>
                  <div>
                    <p className="text-sm text-gray-500">Today's mood</p>
                    <p className="text-lg font-semibold text-gray-800 capitalize">
                      {todayMood.mood.replace('_', ' ')}
                    </p>
                  </div>
                </div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <Badge variant="secondary" className="bg-green-100 text-green-700 border-0">
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
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
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
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
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
          <Card className="border-0 shadow-md bg-white hover:shadow-lg transition-shadow cursor-pointer">
            <CardContent className="p-6">
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

      {/* Onboarding Tour */}
      {showOnboarding && (
        <OnboardingTour
          onComplete={() => setShowOnboarding(false)}
          onSkip={() => setShowOnboarding(false)}
        />
      )}
    </div>
  );
}
import React, { useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Flame, Award, Star, Zap, Trophy, TrendingUp, 
  BookOpen, Dumbbell, Heart, Target, Calendar, Sparkles,
  CheckCircle, Lock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { format, differenceInDays, isToday, isYesterday } from 'date-fns';
import confetti from 'canvas-confetti';

const POINT_VALUES = {
  mood_check: 10,
  journal_entry: 20,
  exercise_complete: 15,
  goal_milestone: 25,
  goal_complete: 50,
  daily_streak: 5,
  weekly_streak: 30
};

const LEVEL_THRESHOLDS = [0, 100, 250, 500, 1000, 2000, 3500, 5500, 8000, 12000];

const DEFAULT_BADGES = [
  { name: 'First Check-in', description: 'Complete your first mood check-in', icon: '🌟', category: 'milestone', rarity: 'common', requirement: { type: 'mood_checks', value: 1 } },
  { name: 'Week Warrior', description: '7-day mood check-in streak', icon: '🔥', category: 'streak', rarity: 'rare', requirement: { type: 'mood_streak', value: 7 } },
  { name: 'Journal Starter', description: 'Write your first journal entry', icon: '📝', category: 'milestone', rarity: 'common', requirement: { type: 'journals', value: 1 } },
  { name: 'Thoughtful Writer', description: 'Complete 10 journal entries', icon: '✍️', category: 'milestone', rarity: 'rare', requirement: { type: 'journals', value: 10 } },
  { name: 'Exercise Explorer', description: 'Try 5 different exercises', icon: '🏃', category: 'achievement', rarity: 'common', requirement: { type: 'exercises_tried', value: 5 } },
  { name: 'Goal Getter', description: 'Complete your first goal', icon: '🎯', category: 'achievement', rarity: 'rare', requirement: { type: 'goals_completed', value: 1 } },
  { name: 'Mood Master', description: 'Achieve stable mood for 14 days', icon: '😌', category: 'achievement', rarity: 'epic', requirement: { type: 'stable_mood', value: 14 } },
  { name: 'Consistency King', description: '30-day overall streak', icon: '👑', category: 'streak', rarity: 'legendary', requirement: { type: 'overall_streak', value: 30 } }
];

export default function GamificationHub() {
  const queryClient = useQueryClient();

  // Fetch all required data
  const { data: streaks = [] } = useQuery({
    queryKey: ['userStreaks'],
    queryFn: () => base44.entities.UserStreak.list(),
    initialData: []
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges'],
    queryFn: () => base44.entities.Badge.list('-earned_date'),
    initialData: []
  });

  const { data: points = [] } = useQuery({
    queryKey: ['userPoints'],
    queryFn: () => base44.entities.UserPoints.list(),
    initialData: []
  });

  const { data: moodEntries = [] } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 30)
  });

  const { data: journals = [] } = useQuery({
    queryKey: ['journals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 100)
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list()
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list()
  });

  // Get or create user points
  const userPoints = points[0] || { total_points: 0, weekly_points: 0, level: 1 };
  const overallStreak = streaks.find(s => s.streak_type === 'overall') || { current_streak: 0, longest_streak: 0 };
  const moodStreak = streaks.find(s => s.streak_type === 'mood_check') || { current_streak: 0, longest_streak: 0 };
  const journalStreak = streaks.find(s => s.streak_type === 'journal') || { current_streak: 0, longest_streak: 0 };
  const exerciseStreak = streaks.find(s => s.streak_type === 'exercise') || { current_streak: 0, longest_streak: 0 };

  // Calculate level progress
  const currentLevel = userPoints.level || 1;
  const currentLevelThreshold = LEVEL_THRESHOLDS[currentLevel - 1] || 0;
  const nextLevelThreshold = LEVEL_THRESHOLDS[currentLevel] || LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const levelProgress = ((userPoints.total_points - currentLevelThreshold) / (nextLevelThreshold - currentLevelThreshold)) * 100;

  // Calculate badge progress
  const earnedBadges = badges.filter(b => b.earned_date);
  const inProgressBadges = badges.filter(b => !b.earned_date);

  const totalExercisesCompleted = exercises.reduce((sum, e) => sum + (e.completed_count || 0), 0);
  const exercisesTried = exercises.filter(e => e.completed_count > 0).length;
  const goalsCompleted = goals.filter(g => g.status === 'completed').length;

  // Streak display data
  const streakData = [
    { type: 'Overall', icon: Flame, current: overallStreak.current_streak, best: overallStreak.longest_streak, color: '#F6AD55' },
    { type: 'Check-ins', icon: Heart, current: moodStreak.current_streak, best: moodStreak.longest_streak, color: '#ED64A6' },
    { type: 'Journaling', icon: BookOpen, current: journalStreak.current_streak, best: journalStreak.longest_streak, color: '#9F7AEA' },
    { type: 'Exercises', icon: Dumbbell, current: exerciseStreak.current_streak, best: exerciseStreak.longest_streak, color: '#4299E1' }
  ];

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Points & Level Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="border-0 overflow-hidden" style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          boxShadow: '0 8px 24px rgba(38, 166, 154, 0.12)'
        }}>
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0], scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(145deg, #F6AD55 0%, #ED8936 100%)' }}
                >
                  <Trophy className="w-7 h-7 sm:w-8 sm:h-8 text-white" />
                </motion.div>
                <div>
                  <p className="text-xs sm:text-sm" style={{ color: '#5A7A72' }}>Your Level</p>
                  <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A3A34' }}>Level {currentLevel}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2 rounded-full" style={{ background: 'linear-gradient(145deg, rgba(246, 173, 85, 0.2) 0%, rgba(237, 137, 54, 0.15) 100%)' }}>
                <Zap className="w-4 h-4 sm:w-5 sm:h-5" style={{ color: '#F6AD55' }} />
                <span className="text-base sm:text-lg font-bold" style={{ color: '#1A3A34' }}>{userPoints.total_points}</span>
                <span className="text-xs sm:text-sm" style={{ color: '#5A7A72' }}>points</span>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span style={{ color: '#5A7A72' }}>Progress to Level {currentLevel + 1}</span>
                <span style={{ color: '#26A69A' }}>{Math.round(levelProgress)}%</span>
              </div>
              <div className="w-full h-3 rounded-full overflow-hidden" style={{ background: 'rgba(200, 230, 225, 0.6)' }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(levelProgress, 100)}%` }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ background: 'linear-gradient(90deg, #26A69A 0%, #38B2AC 100%)' }}
                />
              </div>
              <p className="text-xs" style={{ color: '#7A9A92' }}>
                {nextLevelThreshold - userPoints.total_points} points to next level
              </p>
            </div>

            {/* Points Breakdown */}
            <div className="mt-4 pt-4 border-t" style={{ borderColor: 'rgba(38, 166, 154, 0.2)' }}>
              <p className="text-xs font-medium mb-2" style={{ color: '#5A7A72' }}>Earn Points By:</p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center gap-1"><Heart className="w-3 h-3" style={{ color: '#ED64A6' }} /> Check-in: +{POINT_VALUES.mood_check}</div>
                <div className="flex items-center gap-1"><BookOpen className="w-3 h-3" style={{ color: '#9F7AEA' }} /> Journal: +{POINT_VALUES.journal_entry}</div>
                <div className="flex items-center gap-1"><Dumbbell className="w-3 h-3" style={{ color: '#4299E1' }} /> Exercise: +{POINT_VALUES.exercise_complete}</div>
                <div className="flex items-center gap-1"><Target className="w-3 h-3" style={{ color: '#26A69A' }} /> Goal: +{POINT_VALUES.goal_complete}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Streaks Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {streakData.map((streak, index) => {
          const Icon = streak.icon;
          return (
            <motion.div
              key={streak.type}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card className="border-0" style={{
                borderRadius: '20px',
                background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
                boxShadow: '0 4px 12px rgba(38, 166, 154, 0.08)'
              }}>
                <CardContent className="p-3 sm:p-4 text-center">
                  <motion.div
                    animate={streak.current > 0 ? { scale: [1, 1.15, 1] } : {}}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <Icon className="w-6 h-6 sm:w-7 sm:h-7 mx-auto mb-2" style={{ color: streak.color }} />
                  </motion.div>
                  <p className="text-xl sm:text-2xl font-bold" style={{ color: '#1A3A34' }}>{streak.current}</p>
                  <p className="text-xs" style={{ color: '#5A7A72' }}>{streak.type}</p>
                  <p className="text-xs mt-1" style={{ color: '#7A9A92' }}>Best: {streak.best}</p>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Badges Section */}
      <Card className="border-0" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        boxShadow: '0 8px 24px rgba(38, 166, 154, 0.1)'
      }}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg" style={{ color: '#1A3A34' }}>
            <Award className="w-5 h-5" style={{ color: '#ECC94B' }} />
            Achievements
            <Badge className="ml-auto text-xs" style={{ background: 'rgba(236, 201, 75, 0.2)', color: '#B7791F' }}>
              {earnedBadges.length} / {badges.length || DEFAULT_BADGES.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
            {(badges.length > 0 ? badges : DEFAULT_BADGES.map(b => ({ ...b, progress: 0 }))).map((badge, i) => {
              const isEarned = !!badge.earned_date;
              return (
                <motion.div
                  key={badge.id || badge.name}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -4 }}
                  className="relative"
                >
                  <div 
                    className={`aspect-square rounded-2xl flex flex-col items-center justify-center p-2 transition-all ${
                      isEarned ? '' : 'opacity-50 grayscale'
                    }`}
                    style={{
                      background: isEarned 
                        ? `linear-gradient(145deg, ${
                            badge.rarity === 'legendary' ? 'rgba(246, 173, 85, 0.3)' :
                            badge.rarity === 'epic' ? 'rgba(159, 122, 234, 0.3)' :
                            badge.rarity === 'rare' ? 'rgba(66, 153, 225, 0.3)' :
                            'rgba(200, 230, 225, 0.5)'
                          } 0%, rgba(255, 255, 255, 0.8) 100%)`
                        : 'rgba(200, 200, 200, 0.3)',
                      boxShadow: isEarned ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                    }}
                  >
                    <span className="text-2xl sm:text-3xl mb-1">{badge.icon}</span>
                    <p className="text-xs text-center font-medium line-clamp-2" style={{ color: '#1A3A34' }}>
                      {badge.name}
                    </p>
                    {!isEarned && badge.progress > 0 && (
                      <div className="absolute bottom-1 left-1 right-1 h-1 rounded-full overflow-hidden" style={{ background: 'rgba(0,0,0,0.1)' }}>
                        <div 
                          className="h-full rounded-full"
                          style={{ width: `${badge.progress}%`, background: '#26A69A' }}
                        />
                      </div>
                    )}
                    {!isEarned && !badge.progress && (
                      <Lock className="absolute top-1 right-1 w-3 h-3" style={{ color: '#999' }} />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Activity */}
      <Card className="border-0" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        boxShadow: '0 8px 24px rgba(38, 166, 154, 0.1)'
      }}>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg" style={{ color: '#1A3A34' }}>
            <Calendar className="w-5 h-5" style={{ color: '#26A69A' }} />
            This Week's Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-end gap-1 h-20 sm:h-24">
            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => {
              const dayIndex = i === 6 ? 0 : i + 1; // Adjust for week starting Monday
              const today = new Date().getDay();
              const isToday = dayIndex === today;
              const isPast = dayIndex < today || (dayIndex === 0 && today !== 0);
              const hasActivity = moodEntries.some(m => {
                const entryDay = new Date(m.date).getDay();
                return entryDay === dayIndex;
              });
              
              return (
                <div key={day} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: hasActivity ? '100%' : '20%' }}
                    transition={{ duration: 0.5, delay: i * 0.1 }}
                    className="w-full rounded-t-lg transition-all"
                    style={{
                      background: hasActivity 
                        ? 'linear-gradient(180deg, #26A69A 0%, #38B2AC 100%)'
                        : 'rgba(200, 230, 225, 0.5)',
                      minHeight: hasActivity ? '80%' : '20%'
                    }}
                  />
                  <span className={`text-xs ${isToday ? 'font-bold' : ''}`} style={{ color: isToday ? '#26A69A' : '#7A9A92' }}>
                    {day.charAt(0)}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-between text-xs" style={{ color: '#5A7A72' }}>
            <span>Weekly points: <strong style={{ color: '#1A3A34' }}>{userPoints.weekly_points || 0}</strong></span>
            <span>{moodEntries.filter(m => {
              const weekAgo = new Date();
              weekAgo.setDate(weekAgo.getDate() - 7);
              return new Date(m.date) >= weekAgo;
            }).length} / 7 days active</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
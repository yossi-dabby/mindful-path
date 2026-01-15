import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Flame, TrendingUp, Award, Heart, BookOpen, Dumbbell } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function StreakWidget({ compact = false }) {
  const { data: streaks, isLoading } = useQuery({
    queryKey: ['userStreaks'],
    queryFn: () => base44.entities.UserStreak.list(),
    initialData: []
  });
  const streaksArr = Array.isArray(streaks) ? streaks : [];
  const overallStreak = streaksArr.find(s => s.streak_type === 'overall');
  const moodStreak = streaksArr.find(s => s.streak_type === 'mood_check');
  const journalStreak = streaksArr.find(s => s.streak_type === 'journal');
  const exerciseStreak = streaksArr.find(s => s.streak_type === 'exercise');

  
  const currentStreak = overallStreak?.current_streak || 0;
  const longestStreak = overallStreak?.longest_streak || 0;

  if (isLoading) return null;

  // Compact display for Home grid
  if (compact) {
    return (
      <Card className="border-0 hover:shadow-xl transition-calm" style={{ 
        borderRadius: '28px',
        background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.85) 0%, rgba(180, 220, 210, 0.75) 100%)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(38, 166, 154, 0.18), 0 4px 12px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.4)'
      }}>
        <CardContent className="p-5 text-center">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ duration: 2, repeat: Infinity, ease: [0.2, 0.8, 0.2, 1] }}
            className="inline-flex mb-2"
          >
            <Flame className="w-8 h-8" style={{ color: '#F6AD55' }} strokeWidth={2} />
          </motion.div>
          <p className="text-2xl font-bold mb-1" style={{ color: '#1A3A34' }}>
            {currentStreak}
          </p>
          <p className="text-xs" style={{ color: '#3D5A52' }}>day streak</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="border-0 shadow-lg bg-gradient-to-br from-orange-50 to-red-50 overflow-hidden rounded-2xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <motion.div
                animate={{ 
                  scale: currentStreak > 0 ? [1, 1.2, 1] : 1,
                  rotate: currentStreak > 0 ? [0, 10, -10, 0] : 0
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center shadow-lg"
              >
                <Flame className="w-6 h-6 text-white" />
              </motion.div>
              <div>
                <h3 className="font-semibold text-gray-800">Daily Streak</h3>
                <p className="text-xs text-gray-600">Keep the momentum going!</p>
              </div>
            </div>
            {currentStreak >= 7 && (
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-300">
                <Award className="w-3 h-3 mr-1" />
                On Fire!
              </Badge>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-orange-600" />
                <p className="text-xs text-gray-600">Current</p>
              </div>
              <p className="text-3xl font-bold text-orange-600">
                {currentStreak}
                <span className="text-sm text-gray-500 ml-1">days</span>
              </p>
            </div>

            <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4">
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="w-4 h-4 text-purple-600" />
                <p className="text-xs text-gray-600">Best</p>
              </div>
              <p className="text-3xl font-bold text-purple-600">
                {longestStreak}
                <span className="text-sm text-gray-500 ml-1">days</span>
              </p>
            </div>
          </div>

          {/* Streak Calendar */}
          <div className="mt-4 pt-4 border-t border-orange-200">
            <div className="flex justify-between items-center gap-1">
              {[...Array(7)].map((_, i) => {
                const isActive = i < currentStreak;
                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={cn(
                      "flex-1 h-2 rounded-full",
                      isActive 
                        ? "bg-gradient-to-r from-orange-400 to-red-500" 
                        : "bg-gray-200"
                    )}
                  />
                );
              })}
            </div>
            <div className="flex justify-between mt-2">
              <p className="text-xs text-gray-500">7 days</p>
              {currentStreak >= 7 && (
                <p className="text-xs text-orange-600 font-semibold">Week complete! 🎉</p>
              )}
            </div>
          </div>

          {/* Individual Activity Streaks */}
          <div className="mt-4 pt-4 border-t border-orange-200 grid grid-cols-3 gap-2">
            <div className="text-center p-2 rounded-lg bg-white/50">
              <Heart className="w-4 h-4 mx-auto mb-1 text-pink-500" />
              <p className="text-sm font-bold text-gray-800">{moodStreak?.current_streak || 0}</p>
              <p className="text-xs text-gray-500">Check-ins</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/50">
              <BookOpen className="w-4 h-4 mx-auto mb-1 text-purple-500" />
              <p className="text-sm font-bold text-gray-800">{journalStreak?.current_streak || 0}</p>
              <p className="text-xs text-gray-500">Journals</p>
            </div>
            <div className="text-center p-2 rounded-lg bg-white/50">
              <Dumbbell className="w-4 h-4 mx-auto mb-1 text-blue-500" />
              <p className="text-sm font-bold text-gray-800">{exerciseStreak?.current_streak || 0}</p>
              <p className="text-xs text-gray-500">Exercises</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

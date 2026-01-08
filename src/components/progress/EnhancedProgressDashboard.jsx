import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, BookOpen, Dumbbell, Calendar, Award, Sparkles, Flame, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';

const COLORS = ['#26A69A', '#9F7AEA', '#F6AD55', '#4299E1', '#ED8936', '#38B2AC'];

export default function EnhancedProgressDashboard() {
  const { data: moodEntries = [] } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 90),
    initialData: []
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['thoughtJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 100),
    initialData: []
  });

  const { data: exercises = [] } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: []
  });

  const { data: goals = [] } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list(),
    initialData: []
  });

  const { data: streaks = [] } = useQuery({
    queryKey: ['userStreaks'],
    queryFn: () => base44.entities.UserStreak.list(),
    initialData: []
  });

  const { data: points = [] } = useQuery({
    queryKey: ['userPoints'],
    queryFn: () => base44.entities.UserPoints.list(),
    initialData: []
  });

  const { data: badges = [] } = useQuery({
    queryKey: ['userBadges'],
    queryFn: () => base44.entities.Badge.list('-earned_date'),
    initialData: []
  });

  // Get gamification data
  const overallStreak = streaks.find(s => s.streak_type === 'overall') || { current_streak: 0 };
  const userPoints = points[0] || { total_points: 0, level: 1 };
  const earnedBadges = badges.filter(b => b.earned_date);

  // Calculate mood trends (last 30 days)
  const moodTrendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayMoods = moodEntries.filter(m => m.date === dateStr);
      
      return {
        date: format(date, 'MMM dd'),
        mood: dayMoods.length > 0 
          ? dayMoods.reduce((sum, m) => sum + (m.mood_level || 5), 0) / dayMoods.length 
          : null
      };
    });
    return last30Days.filter(d => d.mood !== null);
  }, [moodEntries]);

  // Calculate exercise completion frequency
  const exerciseFrequencyData = useMemo(() => {
    const categoryStats = exercises.reduce((acc, ex) => {
      const category = ex.category || 'other';
      if (!acc[category]) {
        acc[category] = { name: category, count: 0, totalTime: 0 };
      }
      acc[category].count += ex.completed_count || 0;
      acc[category].totalTime += ex.total_time_practiced || 0;
      return acc;
    }, {});
    return Object.values(categoryStats);
  }, [exercises]);

  // Calculate journal consistency (last 30 days)
  const journalConsistencyData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayJournals = journalEntries.filter(j => {
        const jDate = format(new Date(j.created_date), 'yyyy-MM-dd');
        return jDate === dateStr;
      });
      
      return {
        date: format(date, 'MMM dd'),
        entries: dayJournals.length
      };
    });
    return last30Days;
  }, [journalEntries]);

  // Goal progress distribution
  const goalProgressData = useMemo(() => {
    return goals.map(g => ({
      name: g.title?.substring(0, 20) + (g.title?.length > 20 ? '...' : ''),
      progress: g.progress || 0
    })).slice(0, 5);
  }, [goals]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const avgMood = moodTrendData.length > 0
      ? (moodTrendData.reduce((sum, d) => sum + d.mood, 0) / moodTrendData.length).toFixed(1)
      : 'N/A';
    
    const totalExercises = exercises.reduce((sum, e) => sum + (e.completed_count || 0), 0);
    const totalExerciseTime = Math.round(exercises.reduce((sum, e) => sum + (e.total_time_practiced || 0), 0));
    const journalCount = journalEntries.length;
    const completedGoals = goals.filter(g => g.status === 'completed').length;
    const activeGoals = goals.filter(g => g.status === 'active').length;

    // Trend calculation
    const recent7 = moodTrendData.slice(-7);
    const previous7 = moodTrendData.slice(-14, -7);
    const recentAvg = recent7.length > 0 ? recent7.reduce((sum, d) => sum + d.mood, 0) / recent7.length : 0;
    const previousAvg = previous7.length > 0 ? previous7.reduce((sum, d) => sum + d.mood, 0) / previous7.length : recentAvg;
    const moodTrend = recentAvg > previousAvg ? 'improving' : recentAvg < previousAvg ? 'declining' : 'stable';

    return {
      avgMood,
      moodTrend,
      totalExercises,
      totalExerciseTime,
      journalCount,
      completedGoals,
      activeGoals
    };
  }, [moodTrendData, exercises, journalEntries, goals]);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Gamification Summary Banner */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 sm:p-5 rounded-2xl"
        style={{
          background: 'linear-gradient(145deg, rgba(246, 173, 85, 0.2) 0%, rgba(237, 137, 54, 0.15) 100%)',
          boxShadow: '0 4px 16px rgba(246, 173, 85, 0.15)'
        }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(145deg, #F6AD55 0%, #ED8936 100%)' }}
            >
              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </motion.div>
            <div>
              <p className="text-xs sm:text-sm" style={{ color: '#5A7A72' }}>Current Streak</p>
              <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A3A34' }}>
                {overallStreak.current_streak} days
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Zap className="w-4 h-4" style={{ color: '#F6AD55' }} />
                <span className="text-lg sm:text-xl font-bold" style={{ color: '#1A3A34' }}>{userPoints.total_points}</span>
              </div>
              <p className="text-xs" style={{ color: '#5A7A72' }}>Points</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Award className="w-4 h-4" style={{ color: '#ECC94B' }} />
                <span className="text-lg sm:text-xl font-bold" style={{ color: '#1A3A34' }}>{earnedBadges.length}</span>
              </div>
              <p className="text-xs" style={{ color: '#5A7A72' }}>Badges</p>
            </div>
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Sparkles className="w-4 h-4" style={{ color: '#9F7AEA' }} />
                <span className="text-lg sm:text-xl font-bold" style={{ color: '#1A3A34' }}>Lv.{userPoints.level}</span>
              </div>
              <p className="text-xs" style={{ color: '#5A7A72' }}>Level</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="border-0" style={{
          borderRadius: '20px',
          background: 'linear-gradient(145deg, rgba(38, 166, 154, 0.15) 0%, rgba(56, 178, 172, 0.1) 100%)',
          boxShadow: '0 4px 12px rgba(38, 166, 154, 0.1)'
        }}>
          <CardContent className="p-4 sm:p-6 text-center">
            <div className="flex items-center justify-center mb-2">
              {metrics.moodTrend === 'improving' ? (
                <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" />
              ) : metrics.moodTrend === 'declining' ? (
                <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" />
              ) : (
                <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
              )}
            </div>
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A3A34' }}>{metrics.avgMood}</p>
            <p className="text-xs sm:text-sm mt-1" style={{ color: '#5A7A72' }}>Avg Mood</p>
            <Badge className="mt-2 text-xs" variant="secondary">{metrics.moodTrend}</Badge>
          </CardContent>
        </Card>

        <Card className="border-0" style={{
          borderRadius: '20px',
          background: 'linear-gradient(145deg, rgba(159, 122, 234, 0.15) 0%, rgba(139, 92, 246, 0.1) 100%)',
          boxShadow: '0 4px 12px rgba(159, 122, 234, 0.1)'
        }}>
          <CardContent className="p-4 sm:p-6 text-center">
            <Dumbbell className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: '#9F7AEA' }} />
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A3A34' }}>{metrics.totalExercises}</p>
            <p className="text-xs sm:text-sm mt-1" style={{ color: '#5A7A72' }}>Exercises</p>
            <p className="text-xs mt-1" style={{ color: '#7A9A92' }}>{metrics.totalExerciseTime} min</p>
          </CardContent>
        </Card>

        <Card className="border-0" style={{
          borderRadius: '20px',
          background: 'linear-gradient(145deg, rgba(246, 173, 85, 0.15) 0%, rgba(237, 137, 54, 0.1) 100%)',
          boxShadow: '0 4px 12px rgba(246, 173, 85, 0.1)'
        }}>
          <CardContent className="p-4 sm:p-6 text-center">
            <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: '#F6AD55' }} />
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A3A34' }}>{metrics.journalCount}</p>
            <p className="text-xs sm:text-sm mt-1" style={{ color: '#5A7A72' }}>Journal Entries</p>
          </CardContent>
        </Card>

        <Card className="border-0" style={{
          borderRadius: '20px',
          background: 'linear-gradient(145deg, rgba(66, 153, 225, 0.15) 0%, rgba(56, 178, 172, 0.1) 100%)',
          boxShadow: '0 4px 12px rgba(66, 153, 225, 0.1)'
        }}>
          <CardContent className="p-4 sm:p-6 text-center">
            <Target className="w-5 h-5 sm:w-6 sm:h-6 mx-auto mb-2" style={{ color: '#4299E1' }} />
            <p className="text-2xl sm:text-3xl font-bold" style={{ color: '#1A3A34' }}>{metrics.completedGoals}</p>
            <p className="text-xs sm:text-sm mt-1" style={{ color: '#5A7A72' }}>Goals Achieved</p>
            <p className="text-xs mt-1" style={{ color: '#7A9A92' }}>{metrics.activeGoals} active</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Trend Chart */}
      <Card className="border-0" style={{
        borderRadius: '24px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        boxShadow: '0 8px 24px rgba(38, 166, 154, 0.1)'
      }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg" style={{ color: '#1A3A34' }}>
            <TrendingUp className="w-5 h-5" style={{ color: '#26A69A' }} />
            Mood Trends (Last 30 Days)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodTrendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 10 }}
                interval={Math.floor(moodTrendData.length / 6)}
              />
              <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#26A69A" 
                strokeWidth={3}
                dot={{ fill: '#26A69A', r: 4 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two-column layout for remaining charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Exercise Frequency */}
        <Card className="border-0" style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          boxShadow: '0 8px 24px rgba(38, 166, 154, 0.1)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg" style={{ color: '#1A3A34' }}>
              <Dumbbell className="w-5 h-5" style={{ color: '#9F7AEA' }} />
              Exercise by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={exerciseFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#9F7AEA" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Journal Consistency */}
        <Card className="border-0" style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          boxShadow: '0 8px 24px rgba(38, 166, 154, 0.1)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg" style={{ color: '#1A3A34' }}>
              <BookOpen className="w-5 h-5" style={{ color: '#F6AD55' }} />
              Journal Consistency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={journalConsistencyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  tick={{ fontSize: 10 }}
                  interval={Math.floor(journalConsistencyData.length / 6)}
                />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="entries" fill="#F6AD55" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress */}
      {goalProgressData.length > 0 && (
        <Card className="border-0" style={{
          borderRadius: '24px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          boxShadow: '0 8px 24px rgba(38, 166, 154, 0.1)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg" style={{ color: '#1A3A34' }}>
              <Target className="w-5 h-5" style={{ color: '#4299E1' }} />
              Goal Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goalProgressData.map((goal, index) => (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium" style={{ color: '#3D5A52' }}>{goal.name}</span>
                    <span className="text-sm font-bold" style={{ color: '#26A69A' }}>{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="h-2 rounded-full transition-all"
                      style={{ 
                        width: `${goal.progress}%`,
                        background: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
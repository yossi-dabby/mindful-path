import React, { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Target, BookOpen, Dumbbell, Award, Sparkles, Flame, Zap } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays, startOfDay } from 'date-fns';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

const COLORS = ['#26A69A', '#9F7AEA', '#F6AD55', '#4299E1', '#ED8936', '#38B2AC'];

export default function EnhancedProgressDashboard() {
  const { t } = useTranslation();
  const { data: moodEntries = [] } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 30),
    initialData: []
  });

  const { data: journalEntries = [] } = useQuery({
    queryKey: ['thoughtJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 30),
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
  const overallStreak = streaks.find((s) => s.streak_type === 'overall') || { current_streak: 0 };
  const userPoints = points[0] || { total_points: 0, level: 1 };
  const earnedBadges = badges.filter((b) => b.earned_date);

  // Calculate mood trends (last 30 days)
  const moodTrendData = useMemo(() => {
    const last30Days = Array.from({ length: 30 }, (_, i) => {
      const date = startOfDay(subDays(new Date(), 29 - i));
      const dateStr = format(date, 'yyyy-MM-dd');
      const dayMoods = moodEntries.filter((m) => m.date === dateStr);

      return {
        date: format(date, 'MMM dd'),
        mood: dayMoods.length > 0 ?
        dayMoods.reduce((sum, m) => sum + (m.mood_level || 5), 0) / dayMoods.length :
        null
      };
    });
    return last30Days.filter((d) => d.mood !== null);
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
      const dayJournals = journalEntries.filter((j) => {
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
    return goals.map((g) => ({
      name: g.title?.substring(0, 20) + (g.title?.length > 20 ? '...' : ''),
      progress: g.progress || 0
    })).slice(0, 5);
  }, [goals]);

  // Calculate key metrics
  const metrics = useMemo(() => {
    const avgMood = moodTrendData.length > 0 ?
    (moodTrendData.reduce((sum, d) => sum + d.mood, 0) / moodTrendData.length).toFixed(1) :
    'N/A';

    const totalExercises = exercises.reduce((sum, e) => sum + (e.completed_count || 0), 0);
    const totalExerciseTime = Math.round(exercises.reduce((sum, e) => sum + (e.total_time_practiced || 0), 0));
    const journalCount = journalEntries.length;
    const completedGoals = goals.filter((g) => g.status === 'completed').length;
    const activeGoals = goals.filter((g) => g.status === 'active').length;

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
        className="surface-secondary rounded-[var(--radius-card)] p-4 sm:p-5 border-border/80">

        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <motion.div
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center"
              style={{ background: 'linear-gradient(145deg, #F6AD55 0%, #ED8936 100%)' }}>

              <Flame className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </motion.div>
            <div>
              <p className="text-xs sm:text-sm text-muted-foreground">{t('progress.dashboard.current_streak')}</p>
              <p className="text-2xl sm:text-3xl font-bold text-foreground">
                {overallStreak.current_streak} {t('progress.dashboard.days')}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="text-center">
              <div className="flex items-center gap-1 justify-center">
                <Zap className="w-4 h-4" style={{ color: '#F6AD55' }} />
                <span className="text-lg sm:text-xl font-bold text-foreground">{userPoints.total_points}</span>
              </div>
              <p className="text-xs break-words text-muted-foreground">{t('progress.dashboard.points')}</p>
            </div>
            <div className="text-center min-w-0">
              <div className="flex items-center gap-1 justify-center">
                <Award className="w-4 h-4 text-accent" />
                <span className="text-lg sm:text-xl font-bold text-foreground">{earnedBadges.length}</span>
              </div>
              <p className="text-xs break-words text-muted-foreground">{t('progress.dashboard.badges')}</p>
            </div>
            <div className="text-center min-w-0">
              <div className="flex items-center gap-1 justify-center">
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-lg sm:text-xl font-bold whitespace-nowrap text-foreground">{t('progress.dashboard.level_prefix')}{userPoints.level}</span>
              </div>
              <p className="text-xs break-words text-muted-foreground">{t('progress.dashboard.level')}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Key Metrics Grid */}
      <div className="text-teal-600 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card className="surface-secondary rounded-[var(--radius-card)] border-border/80">
          <CardContent className="bg-teal-100 p-4 text-center rounded-2xl sm:p-6">
            <div className="flex items-center justify-center mb-2">
              {metrics.moodTrend === 'improving' ?
              <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-600" /> :
              metrics.moodTrend === 'declining' ?
              <TrendingDown className="w-5 h-5 sm:w-6 sm:h-6 text-orange-600" /> :

              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-teal-600" />
              }
            </div>
            <p className="text-teal-600 text-2xl font-bold sm:text-3xl">{metrics.avgMood}</p>
            <p className="text-teal-600 mt-1 text-xs sm:text-sm">{t('progress.dashboard.avg_mood')}</p>
            <Badge className="bg-secondary/86 text-teal-600 mt-2 px-2.5 py-1 text-xs font-medium tracking-[0.01em] rounded-[var(--radius-chip)] inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/60" variant="secondary">{t(`progress.dashboard.trend_${metrics.moodTrend}`)}</Badge>
          </CardContent>
        </Card>

        <Card className="bg-red-50 text-card-foreground rounded-2xl border shadow-[var(--shadow-md)] backdrop-blur-[10px] surface-secondary border-border/80">
          <CardContent className="p-4 text-center rounded-2xl sm:p-6">
            <Dumbbell className="text-red-600 mb-2 mx-auto lucide lucide-dumbbell w-5 h-5 sm:w-6 sm:h-6" />
            <p className="text-red-600 text-2xl font-bold sm:text-3xl">{metrics.totalExercises}</p>
            <p className="text-red-600 mt-1 text-xs sm:text-sm">{t('progress.tabs.exercises')}</p>
            <p className="text-red-600 mt-1 text-xs">{metrics.totalExerciseTime} {t('common.minutes_short')}</p>
          </CardContent>
        </Card>

        <Card className="bg-lime-50 text-card-foreground rounded-[var(--radius-card)] border shadow-[var(--shadow-md)] backdrop-blur-[10px] surface-secondary border-border/80">
          <CardContent className="p-4 text-center rounded-2xl sm:p-6">
            <BookOpen className="text-lime-600 mb-2 mx-auto lucide lucide-book-open w-5 h-5 sm:w-6 sm:h-6" />
            <p className="text-lime-600 text-2xl font-bold sm:text-3xl">{metrics.journalCount}</p>
            <p className="text-lime-600 mt-1 text-xs sm:text-sm">{t('home.journal_entries')}</p>
          </CardContent>
        </Card>

        <Card className="surface-secondary rounded-[var(--radius-card)] border-border/80">
          <CardContent className="bg-teal-100 p-4 text-center rounded-2xl sm:p-6">
            <Target className="text-teal-600 mb-2 mx-auto lucide lucide-target w-5 h-5 sm:w-6 sm:h-6" />
            <p className="text-teal-600 text-2xl font-bold sm:text-3xl">{metrics.completedGoals}</p>
            <p className="text-teal-600 mt-1 text-xs sm:text-sm">{t('progress.dashboard.goals_achieved')}</p>
            <p className="text-teal-600 mt-1 text-xs">{metrics.activeGoals} {t('progress.dashboard.active')}</p>
          </CardContent>
        </Card>
      </div>

      {/* Mood Trend Chart */}
      <Card className="border border-border/80 bg-card shadow-[var(--shadow-md)]">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
            <TrendingUp className="w-5 h-5 text-primary" />
            {t('progress.dashboard.charts.mood_trends')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={moodTrendData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 10 }}
                interval={Math.floor(moodTrendData.length / 6)} />

              <YAxis domain={[0, 10]} tick={{ fontSize: 10 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="mood"
                stroke="#26A69A"
                strokeWidth={3}
                dot={{ fill: '#26A69A', r: 4 }} />

            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Two-column layout for remaining charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Exercise Frequency */}
        <Card className="border border-border/80 bg-card shadow-[var(--shadow-md)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
              <Dumbbell className="w-5 h-5 text-primary" />
              {t('progress.dashboard.charts.exercise_by_category')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={exerciseFrequencyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} angle={-45} textAnchor="end" height={80} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#68B39B" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Journal Consistency */}
        <Card className="border border-border/80 bg-card shadow-[var(--shadow-md)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
              <BookOpen className="w-5 h-5 text-accent" />
              {t('progress.dashboard.charts.journal_consistency')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={journalConsistencyData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10 }}
                  interval={Math.floor(journalConsistencyData.length / 6)} />

                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip />
                <Bar dataKey="entries" fill="#E6B86E" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Goal Progress */}
      {goalProgressData.length > 0 &&
      <Card className="border border-border/80 bg-card shadow-[var(--shadow-md)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base sm:text-lg text-foreground">
              <Target className="w-5 h-5 text-primary" />
              {t('progress.dashboard.charts.goal_progress')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goalProgressData.map((goal, index) =>
            <div key={index}>
                  <div className="flex items-center justify-between mb-1 gap-2">
                    <span className="text-sm font-medium break-words flex-1 min-w-0 text-foreground/85">{goal.name}</span>
                    <span className="text-sm font-bold text-primary">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div
                  className="h-2 rounded-full transition-all"
                  style={{
                    width: `${goal.progress}%`,
                    background: COLORS[index % COLORS.length]
                  }} />

                  </div>
                </div>
            )}
            </div>
          </CardContent>
        </Card>
      }
    </div>);

}
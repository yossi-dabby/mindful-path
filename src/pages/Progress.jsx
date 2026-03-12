import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, Calendar, Activity, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EnhancedMoodChart from '../components/progress/EnhancedMoodChart';
import InsightsPanel from '../components/progress/InsightsPanel';
import ExerciseTracker from '../components/progress/ExerciseTracker';
import CorrelationInsights from '../components/progress/CorrelationInsights';
import GoalsProgressTracker from '../components/progress/GoalsProgressTracker';
import HealthDashboard from '../components/health/HealthDashboard';
import EnhancedProgressDashboard from '../components/progress/EnhancedProgressDashboard';
import GamificationHub from '../components/gamification/GamificationHub';

export default function Progress() {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState('7');

  const { data: moodEntries, isLoading: loadingMoods } = useQuery({
    queryKey: ['moodEntries'],
    queryFn: () => base44.entities.MoodEntry.list('-date', 30),
    initialData: []
  });

  const { data: journalEntries, isLoading: loadingJournal } = useQuery({
    queryKey: ['journalEntries'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 30),
    initialData: []
  });

  const { data: goals } = useQuery({
    queryKey: ['goals'],
    queryFn: () => base44.entities.Goal.list(),
    initialData: []
  });

  const { data: conversations } = useQuery({
    queryKey: ['progressConversations'],
    queryFn: () => base44.agents.listConversations({ agent_name: 'cbt_therapist' }),
    initialData: []
  });

  const { data: exercises, isLoading: loadingExercises } = useQuery({
    queryKey: ['exercises'],
    queryFn: () => base44.entities.Exercise.list(),
    initialData: []
  });

  const filteredMoodEntries = moodEntries.filter((entry) => {
    const entryDate = new Date(entry.date);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    return entryDate >= daysAgo;
  });

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="bg-teal-50 text-teal-600 mx-auto pb-32 p-4 md:p-8 md:pb-24 max-w-7xl w-full min-h-[100dvh]">
      {/* Header */}
      <div className="mb-6 sm:mb-8 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            style={{ borderRadius: '50%' }}
            aria-label={t('common.go_back_aria')}>

            <svg className="rtl:scale-x-[-1]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </Button>
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-semibold break-words text-foreground">{t('progress.page_title')}</h1>
            <p className="text-sm md:text-base md:hidden break-words text-muted-foreground">{t('progress.page_subtitle')}</p>
          </div>
        </div>
        <p className="text-sm md:text-base ml-0 md:ml-12 hidden md:block text-muted-foreground">{t('progress.page_subtitle_full')}</p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full mb-4 sm:mb-6">
          <TabsTrigger value="overview" className="bg-blue-600 text-slate-50 px-3 py-1 text-xs font-medium tracking-[0.003em] rounded-2xl inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)] sm:text-sm" style={{ borderRadius: '16px' }}>{t('progress.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="achievements" className="bg-purple-500 text-slate-50 px-3 py-1 text-xs font-medium tracking-[0.003em] rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)] sm:text-sm" style={{ borderRadius: '16px' }}>
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">{t('progress.tabs.achievements')}</span>
            <span className="sm:hidden">{t('progress.tabs.rewards')}</span>
          </TabsTrigger>
          <TabsTrigger value="mood" className="bg-indigo-500 text-slate-50 px-3 py-1 text-xs font-medium tracking-[0.003em] rounded-[calc(var(--radius-control)-2px)] inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)] sm:text-sm" style={{ borderRadius: '16px' }}>{t('progress.tabs.mood')}</TabsTrigger>
          <TabsTrigger value="goals" className="bg-blue-600 text-slate-50 px-3 py-1 text-xs font-medium tracking-[0.003em] rounded-2xl inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)] sm:text-sm" style={{ borderRadius: '16px' }}>{t('progress.tabs.goals')}</TabsTrigger>
          <TabsTrigger value="exercises" className="bg-indigo-600 text-slate-50 px-3 py-1 text-xs font-medium tracking-[0.003em] rounded-2xl inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)] sm:text-sm" style={{ borderRadius: '16px' }}>{t('progress.tabs.exercises')}</TabsTrigger>
          <TabsTrigger value="health" className="bg-violet-600 text-slate-50 px-3 py-1 text-xs font-medium tracking-[0.003em] rounded-2xl inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)] sm:text-sm" style={{ borderRadius: '16px' }}>{t('progress.tabs.health')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EnhancedProgressDashboard />
        </TabsContent>

        <TabsContent value="achievements">
          <GamificationHub />
        </TabsContent>

        <TabsContent value="mood">
          <Card className="border border-border/80 bg-card shadow-[var(--shadow-md)]">
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2 text-foreground">
                  <TrendingUp className="w-5 h-5 text-primary" />
                  {t('mood_tracker.mood_trends')}
                </CardTitle>
                <Tabs value={timeRange} onValueChange={setTimeRange}>
                  <TabsList>
                    <TabsTrigger value="7" className="text-xs sm:text-sm">{t('mood_tracker.time_range.7_days')}</TabsTrigger>
                    <TabsTrigger value="14" className="text-xs sm:text-sm">{t('mood_tracker.time_range.14_days')}</TabsTrigger>
                    <TabsTrigger value="30" className="text-xs sm:text-sm">{t('mood_tracker.time_range.30_days')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMoods ?
              <div className="h-64 flex items-center justify-center">
                  <p className="text-muted-foreground">{t('mood_tracker.loading_chart')}</p>
                </div> :
              filteredMoodEntries.length === 0 ?
              <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3 text-primary/30" />
                    <p className="text-muted-foreground">{t('mood_tracker.no_data')}</p>
                    <p className="text-sm mt-1 text-muted-foreground/80">{t('mood_tracker.no_data_subtitle')}</p>
                  </div>
                </div> :

              <EnhancedMoodChart data={filteredMoodEntries} />
              }
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals">
          <GoalsProgressTracker goals={goals} />
        </TabsContent>

        <TabsContent value="exercises">
          <ExerciseTracker exercises={exercises} />
        </TabsContent>

        <TabsContent value="health">
          <Card className="border border-border/80 bg-card shadow-[var(--shadow-md)]">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-foreground">
                <Activity className="w-5 h-5 text-primary" />
                {t('progress.health_wellness')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <HealthDashboard />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* AI Insights - Below tabs */}
      <div className="mt-6 rounded-2xl grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsPanel
          moodEntries={filteredMoodEntries}
          journalEntries={journalEntries} />

        <CorrelationInsights
          moodEntries={moodEntries}
          journalEntries={journalEntries}
          exercises={exercises} />

      </div>

    </div>);

}
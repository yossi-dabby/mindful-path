import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, Calendar, Brain, Target, Activity, Trophy } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import EnhancedMoodChart from '../components/progress/EnhancedMoodChart';
import InsightsPanel from '../components/progress/InsightsPanel';
import StatsOverview from '../components/progress/StatsOverview';
import AIInsights from '../components/progress/AIInsights';
import ExerciseTracker from '../components/progress/ExerciseTracker';
import JournalTracker from '../components/progress/JournalTracker';
import CorrelationInsights from '../components/progress/CorrelationInsights';
import GoalsProgressTracker from '../components/progress/GoalsProgressTracker';
import HealthDashboard from '../components/health/HealthDashboard';
import HealthInsights from '../components/health/HealthInsights';
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

  const filteredMoodEntries = moodEntries.filter(entry => {
    const entryDate = new Date(entry.date);
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    return entryDate >= daysAgo;
  });

  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="p-4 md:p-8 pb-32 md:pb-24 max-w-7xl mx-auto w-full overflow-x-hidden" style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)' }}>
      {/* Header */}
      <div className="mb-6 sm:mb-8 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            style={{ borderRadius: '50%' }}
            aria-label={t('common.go_back_aria')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light" style={{ color: '#1A3A34' }}>{t('progress.page_title')}</h1>
            <p className="text-sm md:text-base md:hidden" style={{ color: '#5A7A72' }}>{t('progress.page_subtitle')}</p>
          </div>
        </div>
        <p className="text-sm md:text-base ml-0 md:ml-12 hidden md:block" style={{ color: '#5A7A72' }}>{t('progress.page_subtitle_full')}</p>
      </div>

      {/* Tabs Navigation */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 sm:grid-cols-6 w-full mb-4 sm:mb-6" style={{
          background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)',
          borderRadius: '20px',
          padding: '4px'
        }}>
          <TabsTrigger value="overview" className="text-xs sm:text-sm" style={{ borderRadius: '16px' }}>{t('progress.tabs.overview')}</TabsTrigger>
          <TabsTrigger value="achievements" className="text-xs sm:text-sm" style={{ borderRadius: '16px' }}>
            <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
            <span className="hidden sm:inline">{t('progress.tabs.achievements')}</span>
            <span className="sm:hidden">{t('progress.tabs.rewards')}</span>
          </TabsTrigger>
          <TabsTrigger value="mood" className="text-xs sm:text-sm" style={{ borderRadius: '16px' }}>{t('progress.tabs.mood')}</TabsTrigger>
          <TabsTrigger value="goals" className="text-xs sm:text-sm" style={{ borderRadius: '16px' }}>{t('progress.tabs.goals')}</TabsTrigger>
          <TabsTrigger value="exercises" className="text-xs sm:text-sm" style={{ borderRadius: '16px' }}>{t('progress.tabs.exercises')}</TabsTrigger>
          <TabsTrigger value="health" className="text-xs sm:text-sm" style={{ borderRadius: '16px' }}>{t('progress.tabs.health')}</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <EnhancedProgressDashboard />
        </TabsContent>

        <TabsContent value="achievements">
          <GamificationHub />
        </TabsContent>

        <TabsContent value="mood">
          <Card className="border-0" style={{
            borderRadius: '24px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
            boxShadow: '0 8px 24px rgba(38, 166, 154, 0.1)'
          }}>
            <CardHeader>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <CardTitle className="flex items-center gap-2" style={{ color: '#1A3A34' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#26A69A' }} />
                  {t('mood_tracker.mood_trends')}
                </CardTitle>
                <Tabs value={timeRange} onValueChange={setTimeRange}>
                  <TabsList style={{
                    background: 'rgba(200, 230, 225, 0.6)',
                    borderRadius: '16px'
                  }}>
                    <TabsTrigger value="7" className="text-xs sm:text-sm">{t('mood_tracker.time_range.7_days')}</TabsTrigger>
                    <TabsTrigger value="14" className="text-xs sm:text-sm">{t('mood_tracker.time_range.14_days')}</TabsTrigger>
                    <TabsTrigger value="30" className="text-xs sm:text-sm">{t('mood_tracker.time_range.30_days')}</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMoods ? (
                <div className="h-64 flex items-center justify-center">
                  <p style={{ color: '#5A7A72' }}>{t('mood_tracker.loading_chart')}</p>
                </div>
              ) : filteredMoodEntries.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: '#A8D4CB' }} />
                    <p style={{ color: '#5A7A72' }}>{t('mood_tracker.no_data')}</p>
                    <p className="text-sm mt-1" style={{ color: '#7A9A92' }}>{t('mood_tracker.no_data_subtitle')}</p>
                  </div>
                </div>
              ) : (
                <EnhancedMoodChart data={filteredMoodEntries} />
              )}
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
          <Card className="border-0" style={{
            borderRadius: '24px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
            boxShadow: '0 8px 24px rgba(38, 166, 154, 0.1)'
          }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2" style={{ color: '#1A3A34' }}>
                <Activity className="w-5 h-5" style={{ color: '#26A69A' }} />
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
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        <InsightsPanel
          moodEntries={filteredMoodEntries}
          journalEntries={journalEntries}
        />
        <CorrelationInsights
          moodEntries={moodEntries}
          journalEntries={journalEntries}
          exercises={exercises}
        />
      </div>

    </div>
  );
}
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { TrendingUp, Calendar, Brain, Target, Activity } from 'lucide-react';
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

export default function Progress() {
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

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto" style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)' }}>
      {/* Header */}
      <div className="mb-8 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            style={{ borderRadius: '50%' }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-light" style={{ color: '#1A3A34' }}>Your Progress</h1>
            <p className="text-sm md:text-base md:hidden" style={{ color: '#5A7A72' }}>Track your journey</p>
          </div>
        </div>
        <p className="text-sm md:text-base ml-0 md:ml-12 hidden md:block" style={{ color: '#5A7A72' }}>Track your journey and celebrate your growth</p>
      </div>

      {/* Stats Overview */}
      <StatsOverview
        moodEntries={moodEntries}
        journalEntries={journalEntries}
        goals={goals}
        conversations={conversations}
      />

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        {/* Mood Trends */}
        <div className="lg:col-span-2">
          <Card className="border-0" style={{
            borderRadius: '32px',
            background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
            boxShadow: '0 12px 40px rgba(38, 166, 154, 0.12), 0 4px 16px rgba(0,0,0,0.04)'
          }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2" style={{ color: '#1A3A34' }}>
                  <TrendingUp className="w-5 h-5" style={{ color: '#26A69A' }} />
                  Mood Trends
                </CardTitle>
                <Tabs value={timeRange} onValueChange={setTimeRange}>
                  <TabsList style={{
                    background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)',
                    borderRadius: '24px'
                  }}>
                    <TabsTrigger value="7">7 days</TabsTrigger>
                    <TabsTrigger value="14">14 days</TabsTrigger>
                    <TabsTrigger value="30">30 days</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>
            </CardHeader>
            <CardContent>
              {loadingMoods ? (
                <div className="h-64 flex items-center justify-center">
                  <p className="text-gray-500">Loading chart...</p>
                </div>
              ) : filteredMoodEntries.length === 0 ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Calendar className="w-12 h-12 mx-auto mb-3" style={{ color: '#A8D4CB' }} />
                    <p style={{ color: '#5A7A72' }}>No mood data yet</p>
                    <p className="text-sm mt-1" style={{ color: '#7A9A92' }}>Start checking in daily to see trends</p>
                  </div>
                </div>
              ) : (
                <EnhancedMoodChart data={filteredMoodEntries} />
              )}
            </CardContent>
          </Card>
        </div>

        {/* Insights */}
        <div>
          <InsightsPanel
            moodEntries={filteredMoodEntries}
            journalEntries={journalEntries}
          />
        </div>
      </div>

      {/* Health Dashboard */}
      <div className="mt-6">
        <Card className="border-0" style={{
          borderRadius: '32px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          boxShadow: '0 12px 40px rgba(38, 166, 154, 0.12), 0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#1A3A34' }}>
              <Activity className="w-5 h-5" style={{ color: '#26A69A' }} />
              Health & Wellness Tracking
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthDashboard />
          </CardContent>
        </Card>
      </div>

      {/* Goals Progress Tracker */}
      <div className="mt-6">
        <GoalsProgressTracker goals={goals} />
      </div>

      {/* Exercise & Journal Trackers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <ExerciseTracker exercises={exercises} />
        <JournalTracker journalEntries={journalEntries} />
      </div>

      {/* Holistic Health Insights */}
      <div className="mt-6">
        <Card className="border-0" style={{
          borderRadius: '32px',
          background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
          boxShadow: '0 12px 40px rgba(38, 166, 154, 0.12), 0 4px 16px rgba(0,0,0,0.04)'
        }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2" style={{ color: '#1A3A34' }}>
              <Brain className="w-5 h-5" style={{ color: '#26A69A' }} />
              Holistic Health Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <HealthInsights />
          </CardContent>
        </Card>
      </div>

      {/* Correlation Insights */}
      <div className="mt-6">
        <CorrelationInsights
          moodEntries={moodEntries}
          journalEntries={journalEntries}
          exercises={exercises}
        />
      </div>

      {/* AI-Powered Insights */}
      <div className="mt-6">
        <AIInsights 
          moodEntries={moodEntries}
          journalEntries={journalEntries}
          exercises={exercises}
        />
      </div>

      {/* Activity Timeline */}
      <Card className="border-0 mt-6" style={{
        borderRadius: '32px',
        background: 'linear-gradient(145deg, rgba(255, 255, 255, 0.95) 0%, rgba(232, 246, 243, 0.9) 100%)',
        boxShadow: '0 12px 40px rgba(38, 166, 154, 0.12), 0 4px 16px rgba(0,0,0,0.04)'
      }}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2" style={{ color: '#1A3A34' }}>
            <Brain className="w-5 h-5" style={{ color: '#26A69A' }} />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {journalEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 transition-colors" style={{
                borderRadius: '18px',
                background: 'linear-gradient(145deg, rgba(232, 246, 243, 0.5) 0%, rgba(212, 237, 232, 0.4) 100%)'
              }}>
                <div className="w-10 h-10 flex items-center justify-center flex-shrink-0" style={{
                  borderRadius: '50%',
                  background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)'
                }}>
                  <Brain className="w-5 h-5" style={{ color: '#26A69A' }} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium" style={{ color: '#1A3A34' }}>Thought Journal Entry</p>
                  <p className="text-xs line-clamp-1" style={{ color: '#5A7A72' }}>{entry.situation}</p>
                  <p className="text-xs mt-1" style={{ color: '#7A9A92' }}>
                    {new Date(entry.created_date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {journalEntries.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
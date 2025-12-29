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
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 mt-4">
        <div className="flex items-center gap-3 mb-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="rounded-full"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
          </Button>
          <h1 className="text-3xl md:text-4xl font-light text-gray-800">Your Progress</h1>
        </div>
        <p className="text-gray-500 ml-12">Track your journey and celebrate your growth</p>
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
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Mood Trends
                </CardTitle>
                <Tabs value={timeRange} onValueChange={setTimeRange}>
                  <TabsList className="bg-gray-100">
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
                    <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No mood data yet</p>
                    <p className="text-sm text-gray-400 mt-1">Start checking in daily to see trends</p>
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
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-600" />
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
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-purple-600" />
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
      <Card className="border-0 shadow-lg mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-600" />
            Recent Activity
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {journalEntries.slice(0, 5).map((entry) => (
              <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                  <Brain className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-800">Thought Journal Entry</p>
                  <p className="text-xs text-gray-500 line-clamp-1">{entry.situation}</p>
                  <p className="text-xs text-gray-400 mt-1">
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
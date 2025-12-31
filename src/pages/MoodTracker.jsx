import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, Brain, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import DetailedMoodForm from '../components/mood/DetailedMoodForm';
import MoodTrendChart from '../components/mood/MoodTrendChart';
import MoodInsights from '../components/mood/MoodInsights';
import TriggerAnalysis from '../components/mood/TriggerAnalysis';
import MoodCalendar from '../components/mood/MoodCalendar';

export default function MoodTracker() {
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [dateRange, setDateRange] = useState(30); // days

  const { data: moodEntries, isLoading } = useQuery({
    queryKey: ['moodEntries', dateRange],
    queryFn: async () => {
      try {
        return await base44.entities.MoodEntry.list('-date', dateRange * 2);
      } catch (error) {
        console.error('Error fetching mood entries:', error);
        return [];
      }
    },
    initialData: []
  });

  const todayEntry = moodEntries.find(e => e.date === new Date().toISOString().split('T')[0]);

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div 
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => window.history.back()}
                className="rounded-full"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Mood Tracker</h1>
                <p className="text-gray-600">Track your emotional well-being and discover patterns</p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg"
            >
              <Plus className="w-5 h-5 mr-2" />
              {todayEntry ? 'Update Today' : 'Log Mood'}
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="bg-white/80 backdrop-blur-xl border shadow-sm">
            <TabsTrigger value="overview" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              Calendar
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="w-4 h-4" />
              AI Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Mood Trend Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <MoodTrendChart 
                entries={moodEntries} 
                dateRange={dateRange}
                onDateRangeChange={setDateRange}
              />
            </motion.div>

            {/* Trigger Analysis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <TriggerAnalysis entries={moodEntries} />
            </motion.div>
          </TabsContent>

          <TabsContent value="calendar">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MoodCalendar entries={moodEntries} onEditEntry={handleEdit} />
            </motion.div>
          </TabsContent>

          <TabsContent value="insights">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <MoodInsights entries={moodEntries} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mood Form Modal */}
      {showForm && (
        <DetailedMoodForm
          entry={editingEntry || todayEntry}
          onClose={handleClose}
        />
      )}
    </div>
  );
}
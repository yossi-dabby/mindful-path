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
    <div className="p-4 md:p-6" style={{ minHeight: '100vh', background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)' }}>
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
                style={{ borderRadius: '50%' }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
              </Button>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold mb-1 md:mb-2" style={{ color: '#1A3A34' }}>Mood Tracker</h1>
                <p className="text-sm md:text-base" style={{ color: '#5A7A72' }}>Track your emotional well-being and discover patterns</p>
              </div>
            </div>
            <Button
              onClick={() => setShowForm(true)}
              className="text-white shadow-lg text-sm md:text-base"
              size="sm"
              style={{
                borderRadius: '24px',
                backgroundColor: '#26A69A',
                boxShadow: '0 6px 20px rgba(38, 166, 154, 0.3)'
              }}
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              {todayEntry ? 'Update Today' : 'Log Mood'}
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="backdrop-blur-xl border shadow-sm" style={{
            background: 'linear-gradient(145deg, rgba(200, 230, 225, 0.7) 0%, rgba(180, 220, 210, 0.6) 100%)',
            borderColor: 'rgba(38, 166, 154, 0.25)',
            borderRadius: '28px'
          }}>
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
import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, TrendingUp, Brain, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import DetailedMoodForm from '../components/mood/DetailedMoodForm';
import MoodTrendChart from '../components/mood/MoodTrendChart';
import MoodInsights from '../components/mood/MoodInsights';
import TriggerAnalysis from '../components/mood/TriggerAnalysis';
import MoodCalendar from '../components/mood/MoodCalendar';
import PullToRefresh from '../components/utils/PullToRefresh';

export default function MoodTracker() {
  const { t } = useTranslation();
  const [showForm, setShowForm] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [dateRange, setDateRange] = useState(30); // days

  // Persist tab state via URL query param
  const urlParams = new URLSearchParams(window.location.search);
  const [activeTab, setActiveTab] = useState(urlParams.get('tab') || 'overview');

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

  const todayEntry = moodEntries.find((e) => e.date === new Date().toISOString().split('T')[0]);

  const handleEdit = (entry) => {
    setEditingEntry(entry);
    setShowForm(true);
  };

  const handleClose = () => {
    setShowForm(false);
    setEditingEntry(null);
  };

  return (
    <PullToRefresh queryKeys={['moodEntries']}>
    <div className="p-4 md:p-6 pb-32 md:pb-24 w-full min-h-[100dvh] bg-transparent">
      <div className="max-w-7xl mx-auto w-full">
        {/* Header */}
        <motion.div
            className="mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => window.history.back()}
                  style={{ borderRadius: '50%' }}
                  aria-label={t('common.go_back_aria')}>

                <svg className="rtl:scale-x-[-1]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
              </Button>
              <div className="min-w-0">
                <h1 className="text-teal-600 mb-1 text-2xl font-semibold md:text-3xl md:mb-2 break-words">{t('mood_tracker.page_title')}</h1>
                <p className="text-teal-600 text-sm font-medium md:text-base break-words">{t('mood_tracker.page_subtitle')}</p>
              </div>
            </div>
            <Button
                onClick={() => setShowForm(true)} className="bg-teal-600 text-primary-foreground px-6 py-5 text-sm font-medium tracking-[0.005em] rounded-full inline-flex items-center justify-center gap-2 whitespace-nowrap border border-transparent transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-45 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 shadow-[var(--shadow-md)] hover:bg-primary/92 hover:shadow-[var(--shadow-lg)] active:bg-primary/95 h-8 min-h-[44px] md:min-h-0 md:text-base"

                size="sm">

              <Plus className="w-4 h-4 md:w-5 md:h-5 mr-1 md:mr-2" />
              {todayEntry ? t('mood_tracker.update_today') : t('mood_tracker.log_mood')}
            </Button>
          </div>
        </motion.div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(newTab) => {
            setActiveTab(newTab);
            const newUrl = `${window.location.pathname}?tab=${newTab}`;
            window.history.replaceState({}, '', newUrl);
          }} className="space-y-6">
          <TabsList className="bg-emerald-50 text-muted-foreground p-1 rounded-full inline-flex min-h-[44px] items-center justify-center gap-1 border border-border/60 shadow-[var(--shadow-sm)] backdrop-blur-[8px]">
            <TabsTrigger value="overview" className="bg-teal-600 text-muted-foreground px-3 py-1 font-medium tracking-[0.003em] leading-none rounded-2xl inline-flex items-center justify-center whitespace-nowrap min-h-[44px] md:min-h-0 ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1 disabled:pointer-events-none disabled:opacity-45 hover:bg-secondary/65 hover:text-foreground data-[state=active]:border data-[state=active]:border-primary/12 data-[state=active]:bg-[hsl(var(--card)/0.96)] data-[state=active]:text-primary data-[state=active]:shadow-[var(--shadow-sm)] gap-2">
              <TrendingUp className="bg-slate-50 lucide lucide-trending-up w-4 h-4" />
              {t('mood_tracker.tabs.overview')}
            </TabsTrigger>
            <TabsTrigger value="calendar" className="gap-2">
              <Calendar className="w-4 h-4" />
              {t('mood_tracker.tabs.calendar')}
            </TabsTrigger>
            <TabsTrigger value="insights" className="gap-2">
              <Brain className="w-4 h-4" />
              {t('mood_tracker.tabs.insights')}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Mood Trend Chart */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}>

              <MoodTrendChart
                  entries={moodEntries}
                  dateRange={dateRange}
                  onDateRangeChange={setDateRange} />

            </motion.div>

            {/* Trigger Analysis */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}>

              <TriggerAnalysis entries={moodEntries} />
            </motion.div>
          </TabsContent>

          <TabsContent value="calendar">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}>

              <MoodCalendar entries={moodEntries} onEditEntry={handleEdit} />
            </motion.div>
          </TabsContent>

          <TabsContent value="insights">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}>

              <MoodInsights entries={moodEntries} />
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Mood Form Modal */}
      {showForm &&
        <DetailedMoodForm
          entry={editingEntry || todayEntry}
          onClose={handleClose} />

        }
    </div>
    </PullToRefresh>);

}
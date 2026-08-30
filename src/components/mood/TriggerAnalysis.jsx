import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useTranslation } from 'react-i18next';

const COLORS = ['#ef4444', '#f97316', '#fbbf24', '#84cc16', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];

export default function TriggerAnalysis({ entries }) {
  const { t } = useTranslation();
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640;

  const analysis = React.useMemo(() => {
    const triggerImpact = {};
    const activityImpact = {};
    const emotionFrequency = {};

    entries.forEach((entry) => {
      const moodValue = { excellent: 5, good: 4, okay: 3, low: 2, very_low: 1 }[entry.mood];

      if (Array.isArray(entry.triggers)) {
        entry.triggers.forEach((trigger) => {
          if (!triggerImpact[trigger]) {
            triggerImpact[trigger] = { total: 0, count: 0, avgMood: 0 };
          }
          triggerImpact[trigger].total += moodValue;
          triggerImpact[trigger].count += 1;
          triggerImpact[trigger].avgMood = triggerImpact[trigger].total / triggerImpact[trigger].count;
        });
      }

      if (Array.isArray(entry.activities)) {
        entry.activities.forEach((activity) => {
          if (!activityImpact[activity]) {
            activityImpact[activity] = { total: 0, count: 0, avgMood: 0 };
          }
          activityImpact[activity].total += moodValue;
          activityImpact[activity].count += 1;
          activityImpact[activity].avgMood = activityImpact[activity].total / activityImpact[activity].count;
        });
      }

      if (Array.isArray(entry.emotions)) {
        entry.emotions.forEach((emotion) => {
          emotionFrequency[emotion] = (emotionFrequency[emotion] || 0) + 1;
        });
      }
    });

    const topTriggers = Object.entries(triggerImpact).
    map(([name, data]) => ({ name, avgMood: data.avgMood, count: data.count })).
    sort((a, b) => a.avgMood - b.avgMood).
    slice(0, 8);

    const topActivities = Object.entries(activityImpact).
    map(([name, data]) => ({ name, avgMood: data.avgMood, count: data.count })).
    sort((a, b) => b.avgMood - a.avgMood).
    slice(0, 8);

    const topEmotions = Object.entries(emotionFrequency).
    map(([name, value]) => ({ name, value })).
    sort((a, b) => b.value - a.value).
    slice(0, 6);

    return { topTriggers, topActivities, topEmotions };
  }, [entries]);

  if (entries.length === 0) {
    return (
      <Card className="border-0 shadow-xl">
        <CardContent className="p-12 text-center">
          <Activity className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-500">{t('mood_tracker.analytics.start_tracking')}</p>
        </CardContent>
      </Card>);

  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Mood Triggers */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-teal-100 p-6 flex flex-col space-y-1.5 border-b">
          <CardTitle className="text-teal-600 text-lg font-semibold tracking-[-0.012em] flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            {t('mood_tracker.analytics.triggers_title')}
          </CardTitle>
          <p className="text-teal-600 text-sm font-medium">{t('mood_tracker.analytics.triggers_subtitle')}</p>
        </CardHeader>
        <CardContent className="bg-teal-100 p-6">
          {analysis.topTriggers.length > 0 ?
          <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.topTriggers} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="name" width={100} style={{ fontSize: '12px' }} />
                <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => [t('mood_tracker.analytics.average_mood_value', { value: value.toFixed(1) }), '']} />

                <Bar dataKey="avgMood" fill="#ef4444" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer> :

          <p className="text-center text-gray-500 py-8">{t('mood_tracker.analytics.no_trigger_data')}</p>
          }
        </CardContent>
      </Card>

      {/* Positive Activities */}
      <Card className="border-0 shadow-xl">
        <CardHeader className="bg-teal-100 p-6 flex flex-col space-y-1.5 border-b">
          <CardTitle className="text-teal-600 text-lg font-semibold tracking-[-0.012em] flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            {t('mood_tracker.analytics.boosters_title')}
          </CardTitle>
          <p className="text-teal-600 text-sm font-medium">{t('mood_tracker.analytics.boosters_subtitle')}</p>
        </CardHeader>
        <CardContent className="bg-teal-100 p-6">
          {analysis.topActivities.length > 0 ?
          <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analysis.topActivities} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis type="number" domain={[0, 5]} />
                <YAxis type="category" dataKey="name" width={100} style={{ fontSize: '12px' }} />
                <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
                formatter={(value) => [t('mood_tracker.analytics.average_mood_value', { value: value.toFixed(1) }), '']} />

                <Bar dataKey="avgMood" fill="#10b981" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer> :

          <p className="text-center text-gray-500 py-8">{t('mood_tracker.analytics.no_activity_data')}</p>
          }
        </CardContent>
      </Card>

      {/* Emotion Distribution */}
      <Card className="border-0 shadow-xl lg:col-span-2">
        <CardHeader className="bg-teal-100 p-6 flex flex-col space-y-1.5 border-b">
          <CardTitle className="text-teal-600 text-lg font-semibold tracking-[-0.012em] flex items-center gap-2">
            <Activity className="text-teal-600 lucide lucide-activity w-5 h-5" />
            {t('mood_tracker.analytics.emotional_patterns')}
          </CardTitle>
          <p className="text-teal-600 text-sm font-medium">{t('mood_tracker.analytics.emotional_patterns_subtitle')}</p>
        </CardHeader>
        <CardContent className="bg-orange-100 p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="min-w-0">
              {analysis.topEmotions.length > 0 ?
              <ResponsiveContainer width="100%" height={isMobile ? 220 : 250}>
                  <PieChart>
                    <Pie
                    data={analysis.topEmotions}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={isMobile ? false : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={isMobile ? 64 : 80}
                    fill="#8884d8"
                    dataKey="value">

                      {analysis.topEmotions.map((entry, index) =>
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    )}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer> :

              <p className="text-center text-gray-500 py-12">{t('mood_tracker.analytics.no_emotion_data')}</p>
              }
            </div>
            <div className="flex flex-col justify-center space-y-3 min-w-0">
              {analysis.topEmotions.map((emotion, index) =>
              <div key={emotion.name} className="bg-orange-50 text-orange-500 px-3 py-3 rounded-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }} />

                    <span dir="auto" className="font-medium capitalize">{emotion.name}</span>
                  </div>
                  <Badge variant="secondary" className="bg-secondary/86 text-orange-600 px-2.5 py-1 font-medium tracking-[0.01em] leading-4 rounded-[var(--radius-chip)] inline-flex items-center border transition-colors focus:outline-none focus:ring-1 focus:ring-ring focus:ring-offset-1 border-border/60">{t('mood_tracker.analytics.times_count', { count: emotion.value })}</Badge>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>);

}
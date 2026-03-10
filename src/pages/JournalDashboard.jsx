import React, { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, BarChart, Bar, Legend, ReferenceLine
} from 'recharts';
import { format, subDays, subMonths, isAfter } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, TrendingDown, TrendingUp, Minus, Brain, BookOpen, BarChart2, Target } from 'lucide-react';

const RANGE_OPTIONS = [
  { label: '2 weeks', days: 14 },
  { label: '1 month', days: 30 },
  { label: '3 months', days: 90 },
  { label: 'All time', days: null },
];

const DISTORTION_COLORS = ['#26A69A', '#7C3AED', '#F59E0B', '#EF4444', '#10B981', '#3B82F6', '#EC4899', '#6366F1'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-teal-100 rounded-xl shadow-lg p-3 text-sm">
      <p className="font-semibold text-gray-700 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full inline-block" style={{ background: p.color }} />
          {p.name}: <strong>{typeof p.value === 'number' ? p.value.toFixed(1) : p.value}</strong>
        </p>
      ))}
    </div>
  );
};

export default function JournalDashboard() {
  const [range, setRange] = useState(30);

  const { data: journals = [], isLoading } = useQuery({
    queryKey: ['thoughtJournals'],
    queryFn: () => base44.entities.ThoughtJournal.list('-created_date', 200),
    initialData: [],
  });

  const filteredJournals = useMemo(() => {
    if (!range) return journals;
    const cutoff = subDays(new Date(), range);
    return journals.filter(e => isAfter(new Date(e.created_date), cutoff));
  }, [journals, range]);

  // Intensity trend over time (before and after per entry)
  const intensityTrend = useMemo(() => {
    return filteredJournals
      .filter(e => e.emotion_intensity)
      .map(e => ({
        date: format(new Date(e.created_date), 'MMM d'),
        fullDate: e.created_date,
        before: e.emotion_intensity,
        after: e.outcome_emotion_intensity || null,
        reduction: e.outcome_emotion_intensity
          ? +(e.emotion_intensity - e.outcome_emotion_intensity).toFixed(1)
          : null,
      }))
      .reverse();
  }, [filteredJournals]);

  // Average intensity per week
  const weeklyAvg = useMemo(() => {
    const buckets = {};
    filteredJournals.filter(e => e.emotion_intensity).forEach(e => {
      const week = format(new Date(e.created_date), 'MMM d');
      if (!buckets[week]) buckets[week] = { before: [], after: [] };
      buckets[week].before.push(e.emotion_intensity);
      if (e.outcome_emotion_intensity) buckets[week].after.push(e.outcome_emotion_intensity);
    });
    return Object.entries(buckets).map(([week, vals]) => ({
      week,
      avgBefore: +(vals.before.reduce((a, b) => a + b, 0) / vals.before.length).toFixed(1),
      avgAfter: vals.after.length
        ? +(vals.after.reduce((a, b) => a + b, 0) / vals.after.length).toFixed(1)
        : null,
    })).reverse();
  }, [filteredJournals]);

  // Cognitive distortions frequency
  const distortionFreq = useMemo(() => {
    const counts = {};
    filteredJournals.forEach(e => {
      e.cognitive_distortions?.forEach(d => {
        counts[d] = (counts[d] || 0) + 1;
      });
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([name, count], i) => ({ name: name.replace(/_/g, ' '), count, fill: DISTORTION_COLORS[i % DISTORTION_COLORS.length] }));
  }, [filteredJournals]);

  // Emotion frequency
  const emotionFreq = useMemo(() => {
    const counts = {};
    filteredJournals.forEach(e => {
      e.emotions?.forEach(em => {
        counts[em] = (counts[em] || 0) + 1;
      });
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [filteredJournals]);

  // Summary stats
  const stats = useMemo(() => {
    const withBoth = filteredJournals.filter(e => e.emotion_intensity && e.outcome_emotion_intensity);
    const avgReduction = withBoth.length
      ? +(withBoth.reduce((sum, e) => sum + (e.emotion_intensity - e.outcome_emotion_intensity), 0) / withBoth.length).toFixed(1)
      : null;
    const avgBefore = filteredJournals.filter(e => e.emotion_intensity).length
      ? +(filteredJournals.filter(e => e.emotion_intensity).reduce((s, e) => s + e.emotion_intensity, 0) / filteredJournals.filter(e => e.emotion_intensity).length).toFixed(1)
      : null;
    return { total: filteredJournals.length, avgReduction, avgBefore, withBoth: withBoth.length };
  }, [filteredJournals]);

  const TrendIcon = stats.avgReduction > 0 ? TrendingDown : stats.avgReduction < 0 ? TrendingUp : Minus;
  const trendColor = stats.avgReduction > 0 ? '#26A69A' : stats.avgReduction < 0 ? '#EF4444' : '#9CA3AF';

  return (
    <div className="p-4 md:p-8 pb-32 md:pb-16 max-w-5xl mx-auto w-full min-h-dvh"
      style={{ background: 'linear-gradient(165deg, #D4EDE8 0%, #BDE0D9 30%, #A8D4CB 60%, #9ECCC2 100%)' }}>

      {/* Header */}
      <div className="flex items-center gap-3 mb-6 mt-4">
        <Link to={createPageUrl('Journal')}>
          <Button variant="ghost" size="icon" style={{ borderRadius: '50%' }} aria-label="Back to Journal">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl md:text-3xl font-light" style={{ color: '#1A3A34' }}>Emotional Progress</h1>
          <p className="text-sm" style={{ color: '#5A7A72' }}>Your long-term emotional intensity trends</p>
        </div>
      </div>

      {/* Range Selector */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {RANGE_OPTIONS.map(opt => (
          <Button
            key={opt.label}
            variant={range === opt.days ? 'default' : 'outline'}
            size="sm"
            onClick={() => setRange(opt.days)}
            style={{
              borderRadius: '20px',
              ...(range === opt.days
                ? { backgroundColor: '#26A69A', color: '#fff', boxShadow: '0 4px 12px rgba(38,166,154,0.3)' }
                : { borderColor: 'rgba(38,166,154,0.4)', color: '#26A69A' })
            }}
          >
            {opt.label}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-gray-500">Loading your journal data...</div>
      ) : filteredJournals.length === 0 ? (
        <Card className="border-0 shadow-md" style={{ borderRadius: '24px' }}>
          <CardContent className="p-12 text-center">
            <BookOpen className="w-12 h-12 mx-auto mb-4" style={{ color: '#26A69A' }} />
            <h2 className="text-xl font-semibold mb-2" style={{ color: '#1A3A34' }}>No journal entries yet</h2>
            <p className="text-gray-500 mb-4">Start journaling to see your emotional trends here.</p>
            <Link to={createPageUrl('Journal')}>
              <Button style={{ borderRadius: '20px', backgroundColor: '#26A69A', color: '#fff' }}>Go to Journal</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">

          {/* Summary Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: 'Entries', value: stats.total, icon: BookOpen, color: '#26A69A' },
              { label: 'Avg. Start Intensity', value: stats.avgBefore ? `${stats.avgBefore}/10` : '—', icon: Brain, color: '#7C3AED' },
              { label: 'Avg. Reduction', value: stats.avgReduction != null ? `${stats.avgReduction > 0 ? '-' : '+'}${Math.abs(stats.avgReduction)}` : '—', icon: TrendIcon, color: trendColor },
              { label: 'Reframed Entries', value: stats.withBoth, icon: Target, color: '#F59E0B' },
            ].map(({ label, value, icon: Icon, color }) => (
              <Card key={label} className="border-0 shadow-sm" style={{ borderRadius: '20px', background: 'rgba(255,255,255,0.88)' }}>
                <CardContent className="p-4 flex flex-col gap-1">
                  <Icon className="w-5 h-5 mb-1" style={{ color }} />
                  <p className="text-2xl font-bold" style={{ color }}>{value}</p>
                  <p className="text-xs text-gray-500">{label}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Intensity Trend - Before vs After */}
          {intensityTrend.length > 1 && (
            <Card className="border-0 shadow-sm" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#1A3A34' }}>
                  <BarChart2 className="w-5 h-5 text-teal-600" />
                  Emotion Intensity: Before vs After Reframing
                </CardTitle>
                <p className="text-xs text-gray-500">Per journal entry — lower "after" scores indicate successful reframing</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={260}>
                  <AreaChart data={intensityTrend} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <defs>
                      <linearGradient id="gradBefore" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#7C3AED" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#7C3AED" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradAfter" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#26A69A" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#26A69A" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <ReferenceLine y={5} stroke="rgba(0,0,0,0.1)" strokeDasharray="4 4" />
                    <Area type="monotone" dataKey="before" name="Before reframing" stroke="#7C3AED" strokeWidth={2.5} fill="url(#gradBefore)" dot={{ fill: '#7C3AED', r: 3 }} activeDot={{ r: 5 }} connectNulls />
                    <Area type="monotone" dataKey="after" name="After reframing" stroke="#26A69A" strokeWidth={2.5} fill="url(#gradAfter)" dot={{ fill: '#26A69A', r: 3 }} activeDot={{ r: 5 }} connectNulls />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Weekly Average Trend */}
          {weeklyAvg.length > 1 && (
            <Card className="border-0 shadow-sm" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)' }}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#1A3A34' }}>
                  <TrendingDown className="w-5 h-5 text-teal-600" />
                  Daily Average Intensity Over Time
                </CardTitle>
                <p className="text-xs text-gray-500">Rolling averages — a downward trend indicates long-term progress</p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={220}>
                  <LineChart data={weeklyAvg} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <YAxis domain={[0, 10]} ticks={[0, 2, 4, 6, 8, 10]} tick={{ fontSize: 11, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                    <Line type="monotone" dataKey="avgBefore" name="Avg before" stroke="#7C3AED" strokeWidth={2.5} dot={{ fill: '#7C3AED', r: 4 }} activeDot={{ r: 6 }} connectNulls />
                    <Line type="monotone" dataKey="avgAfter" name="Avg after" stroke="#26A69A" strokeWidth={2.5} strokeDasharray="5 3" dot={{ fill: '#26A69A', r: 4 }} activeDot={{ r: 6 }} connectNulls />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}

          {/* Two-column: Distortions + Emotions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Cognitive Distortions */}
            {distortionFreq.length > 0 && (
              <Card className="border-0 shadow-sm" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#1A3A34' }}>
                    <Brain className="w-5 h-5 text-purple-600" />
                    Common Thinking Patterns
                  </CardTitle>
                  <p className="text-xs text-gray-500">Frequency of identified cognitive distortions</p>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={distortionFreq} layout="vertical" margin={{ top: 0, right: 10, left: 0, bottom: 0 }}>
                      <XAxis type="number" tick={{ fontSize: 10, fill: '#9CA3AF' }} tickLine={false} axisLine={false} />
                      <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#555' }} tickLine={false} axisLine={false} width={110} />
                      <Tooltip content={<CustomTooltip />} />
                      <Bar dataKey="count" name="Times identified" radius={[0, 6, 6, 0]}>
                        {distortionFreq.map((entry, i) => (
                          <rect key={i} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {/* Emotions */}
            {emotionFreq.length > 0 && (
              <Card className="border-0 shadow-sm" style={{ borderRadius: '24px', background: 'rgba(255,255,255,0.92)' }}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-semibold flex items-center gap-2" style={{ color: '#1A3A34' }}>
                    <Target className="w-5 h-5 text-amber-500" />
                    Emotions You've Recorded
                  </CardTitle>
                  <p className="text-xs text-gray-500">Most frequently logged emotions in this period</p>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2 pt-2">
                    {emotionFreq.map(([emotion, count], i) => (
                      <Badge
                        key={emotion}
                        className="text-sm px-3 py-1 rounded-full"
                        style={{
                          background: `rgba(38,166,154,${0.1 + (i / emotionFreq.length) * 0.4})`,
                          color: '#1A3A34',
                          border: '1px solid rgba(38,166,154,0.25)',
                          fontSize: `${Math.max(11, 14 - i)}px`
                        }}
                      >
                        {emotion} <span className="ml-1 opacity-60">×{count}</span>
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

        </div>
      )}
    </div>
  );
}
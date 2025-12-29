import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';

const moodValues = {
  excellent: 5,
  good: 4,
  okay: 3,
  low: 2,
  very_low: 1
};

const moodColors = {
  excellent: '#10b981',
  good: '#3b82f6',
  okay: '#fbbf24',
  low: '#f97316',
  very_low: '#ef4444'
};

export default function MoodTrendChart({ entries, dateRange, onDateRangeChange }) {
  const energyValue = (level) => {
    const map = { very_low: 2, low: 4, moderate: 6, high: 8, very_high: 10 };
    return map[level] || 6;
  };

  const chartData = React.useMemo(() => {
    const today = new Date();
    const data = [];
    
    for (let i = dateRange - 1; i >= 0; i--) {
      const date = format(subDays(today, i), 'yyyy-MM-dd');
      const entry = entries.find(e => e.date === date);
      
      data.push({
        date: format(subDays(today, i), 'MMM dd'),
        mood: entry ? moodValues[entry.mood] : null,
        stress: entry ? entry.stress_level : null,
        energy: entry ? energyValue(entry.energy_level) : null,
        intensity: entry ? entry.intensity : null
      });
    }
    
    return data;
  }, [entries, dateRange]);

  const stats = React.useMemo(() => {
    const validEntries = entries.slice(0, dateRange);
    if (validEntries.length === 0) return null;

    const avgMood = validEntries.reduce((sum, e) => sum + moodValues[e.mood], 0) / validEntries.length;
    
    // Calculate stress average, handling missing data
    const entriesWithStress = validEntries.filter(e => e.stress_level != null && !isNaN(e.stress_level));
    const avgStress = entriesWithStress.length > 0
      ? entriesWithStress.reduce((sum, e) => sum + e.stress_level, 0) / entriesWithStress.length
      : null;
    
    const trend = validEntries.length >= 2 
      ? moodValues[validEntries[0].mood] - moodValues[validEntries[validEntries.length - 1].mood]
      : 0;

    return { avgMood, avgStress, trend };
  }, [entries, dateRange]);

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="border-b">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-purple-600" />
            Mood Trends
          </CardTitle>
          <Select value={dateRange.toString()} onValueChange={(v) => onDateRangeChange(parseInt(v))}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="14">Last 2 weeks</SelectItem>
              <SelectItem value="30">Last month</SelectItem>
              <SelectItem value="90">Last 3 months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
              <p className="text-xs font-medium text-gray-600 mb-1">Average Mood</p>
              <p className="text-2xl font-bold text-blue-700">{stats.avgMood.toFixed(1)}/5</p>
            </div>
            <div className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl">
              <p className="text-xs font-medium text-gray-600 mb-1">Average Stress</p>
              <p className="text-2xl font-bold text-amber-700">
                {stats.avgStress != null ? `${stats.avgStress.toFixed(1)}/10` : 'No data yet'}
              </p>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
              <p className="text-xs font-medium text-gray-600 mb-1">Trend</p>
              <div className="flex items-center gap-2">
                {stats.trend > 0.5 ? (
                  <>
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    <span className="text-xl font-bold text-green-700">Improving</span>
                  </>
                ) : stats.trend < -0.5 ? (
                  <>
                    <TrendingDown className="w-5 h-5 text-blue-600" />
                    <span className="text-xl font-bold text-blue-700">Shifting</span>
                  </>
                ) : (
                  <span className="text-xl font-bold text-gray-700">Steady</span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Mood Line Chart */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Mood & Stress Levels</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="mood" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                name="Mood (1-5)"
                dot={{ fill: '#8b5cf6', r: 4 }}
                connectNulls
              />
              <Line 
                type="monotone" 
                dataKey="stress" 
                stroke="#f97316" 
                strokeWidth={2}
                name="Stress (1-10)"
                dot={{ fill: '#f97316', r: 3 }}
                connectNulls
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Energy Area Chart */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Energy & Intensity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis 
                dataKey="date" 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis 
                stroke="#6b7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'white', 
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px'
                }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="energy" 
                stroke="#3b82f6" 
                fill="#93c5fd"
                name="Energy"
                connectNulls
              />
              <Area 
                type="monotone" 
                dataKey="intensity" 
                stroke="#ec4899" 
                fill="#f9a8d4"
                name="Intensity"
                connectNulls
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
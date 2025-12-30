import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { format } from 'date-fns';

const moodMap = {
  'very_low': 1,
  'low': 2,
  'okay': 3,
  'good': 4,
  'excellent': 5
};

const moodLabels = ['', 'Very Low', 'Low', 'Okay', 'Good', 'Excellent'];

export default function EnhancedMoodChart({ data }) {
  const chartData = data.map(entry => ({
    date: format(new Date(entry.date), 'MMM d'),
    mood: moodMap[entry.mood],
    intensity: entry.intensity || 5,
    fullDate: entry.date
  }));

  // Memoize mood distribution to avoid recalculating on every render
  const moodDistribution = useMemo(() => {
    const counts = { very_low: 0, low: 0, okay: 0, good: 0, excellent: 0 };
    for (const entry of data) {
      if (counts.hasOwnProperty(entry.mood)) {
        counts[entry.mood]++;
      }
    }
    const total = data.length;
    return Object.keys(moodMap).reverse().map(mood => ({
      mood,
      count: counts[mood],
      percentage: total > 0 ? ((counts[mood] / total) * 100).toFixed(0) : '0'
    }));
  }, [data]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="font-semibold text-gray-800">{data.date}</p>
          <p className="text-sm text-purple-600">Mood: {moodLabels[data.mood]}</p>
          {data.intensity && (
            <p className="text-sm text-gray-600">Intensity: {data.intensity}/10</p>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-4">
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart data={chartData}>
          <defs>
            <linearGradient id="colorMood" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12 }}
            stroke="#9ca3af"
          />
          <YAxis 
            domain={[0, 6]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={(value) => moodLabels[value]}
            tick={{ fontSize: 11 }}
            stroke="#9ca3af"
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="mood" 
            stroke="#8b5cf6" 
            strokeWidth={3}
            fill="url(#colorMood)"
            dot={{ fill: '#8b5cf6', r: 5 }}
            activeDot={{ r: 7 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Mood Distribution */}
      <div className="grid grid-cols-5 gap-2">
        {moodDistribution.map(({ mood, count, percentage }) => (
          <div key={mood} className="text-center p-2 bg-gray-50 rounded-lg">
            <p className="text-xs font-medium text-gray-600 capitalize">{mood.replace('_', ' ')}</p>
            <p className="text-lg font-bold text-purple-600">{percentage}%</p>
            <p className="text-xs text-gray-500">{count} days</p>
          </div>
        ))}
      </div>
    </div>
  );
}
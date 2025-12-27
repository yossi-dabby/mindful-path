import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Dumbbell, TrendingUp, Award } from 'lucide-react';

export default function ExerciseTracker({ exercises }) {
  const completedExercises = exercises.filter(e => e.completed_count > 0);
  const totalCompletions = exercises.reduce((sum, e) => sum + (e.completed_count || 0), 0);
  
  const topExercises = [...exercises]
    .sort((a, b) => (b.completed_count || 0) - (a.completed_count || 0))
    .slice(0, 5)
    .map(e => ({
      name: e.title.length > 20 ? e.title.substring(0, 20) + '...' : e.title,
      count: e.completed_count || 0,
      category: e.category
    }));

  const categoryColors = {
    breathing: '#3b82f6',
    grounding: '#10b981',
    cognitive_restructuring: '#8b5cf6',
    behavioral_activation: '#f59e0b',
    mindfulness: '#06b6d4',
    exposure: '#ec4899'
  };

  const categoryStats = exercises.reduce((acc, e) => {
    if (e.completed_count > 0) {
      acc[e.category] = (acc[e.category] || 0) + e.completed_count;
    }
    return acc;
  }, {});

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Dumbbell className="w-5 h-5 text-green-600" />
          Exercise Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <p className="text-3xl font-bold text-green-600">{completedExercises.length}</p>
            <p className="text-sm text-gray-600 mt-1">Exercises Tried</p>
          </div>
          <div className="text-center p-4 bg-blue-50 rounded-xl">
            <p className="text-3xl font-bold text-blue-600">{totalCompletions}</p>
            <p className="text-sm text-gray-600 mt-1">Total Sessions</p>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-xl">
            <p className="text-3xl font-bold text-purple-600">{Object.keys(categoryStats).length}</p>
            <p className="text-sm text-gray-600 mt-1">Categories</p>
          </div>
        </div>

        {topExercises.length > 0 && (
          <>
            <h4 className="font-semibold text-gray-800 mb-3">Most Practiced</h4>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topExercises}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {topExercises.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={categoryColors[entry.category] || '#6b7280'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>

            <div className="mt-4 space-y-2">
              {Object.entries(categoryStats).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                  <span className="text-sm capitalize text-gray-700">{category.replace(/_/g, ' ')}</span>
                  <Badge style={{ backgroundColor: categoryColors[category] }} className="text-white">
                    {count} sessions
                  </Badge>
                </div>
              ))}
            </div>
          </>
        )}

        {totalCompletions === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Dumbbell className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p>Start practicing exercises to see your activity</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
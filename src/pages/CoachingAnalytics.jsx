import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, CheckCircle, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

const focusAreaLabels = {
  mood_improvement: 'Mood Improvement',
  stress_management: 'Stress Management',
  goal_achievement: 'Goal Achievement',
  behavior_change: 'Behavior Change',
  relationship: 'Relationship',
  self_esteem: 'Self-Esteem',
  general: 'General Support'
};

const stageLabels = {
  discovery: 'Discovery',
  planning: 'Planning',
  action: 'Action',
  review: 'Review',
  completed: 'Completed'
};

export default function CoachingAnalytics() {
  const { data: sessions, isLoading } = useQuery({
    queryKey: ['coachingSessions'],
    queryFn: () => base44.entities.CoachingSession.list(),
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-gray-500">Loading analytics...</p>
      </div>
    );
  }

  // Calculate metrics
  const activeSessions = sessions.filter(s => s.status === 'active');
  const completedSessions = sessions.filter(s => s.status === 'completed');
  const completionRate = sessions.length > 0 
    ? Math.round((completedSessions.length / sessions.length) * 100) 
    : 0;

  // Most common challenges (focus areas)
  const focusAreaCounts = sessions.reduce((acc, session) => {
    const area = session.focus_area;
    acc[area] = (acc[area] || 0) + 1;
    return acc;
  }, {});

  const focusAreaData = Object.entries(focusAreaCounts)
    .map(([area, count]) => ({
      name: focusAreaLabels[area] || area,
      value: count
    }))
    .sort((a, b) => b.value - a.value);

  // Stage distribution
  const stageCounts = sessions.reduce((acc, session) => {
    const stage = session.stage;
    acc[stage] = (acc[stage] || 0) + 1;
    return acc;
  }, {});

  const stageData = Object.entries(stageCounts).map(([stage, count]) => ({
    stage: stageLabels[stage] || stage,
    count
  }));

  // Action plan completion rate
  const sessionsWithActions = sessions.filter(s => s.action_plan?.length > 0);
  const totalActions = sessionsWithActions.reduce((sum, s) => sum + (s.action_plan?.length || 0), 0);
  const completedActions = sessionsWithActions.reduce((sum, s) => 
    sum + (s.action_plan?.filter(a => a.completed).length || 0), 0);
  const actionCompletionRate = totalActions > 0 
    ? Math.round((completedActions / totalActions) * 100) 
    : 0;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 mt-4">
        <Link to={createPageUrl('Coach')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Coaching
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">Coaching Analytics</h1>
        <p className="text-gray-500">Insights into your coaching journey</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Total Sessions</p>
                <p className="text-3xl font-bold text-gray-800">{sessions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Active Sessions</p>
                <p className="text-3xl font-bold text-blue-600">{activeSessions.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Target className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-green-600">{completionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Action Completion</p>
                <p className="text-3xl font-bold text-orange-600">{actionCompletionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {completedActions} of {totalActions} actions completed
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Focus Areas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Most Common Challenges</CardTitle>
          </CardHeader>
          <CardContent>
            {focusAreaData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={focusAreaData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {focusAreaData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">No data available</p>
            )}
          </CardContent>
        </Card>

        {/* Stage Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Session Stage Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {stageData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={stageData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="stage" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="count" fill="#8B5CF6" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-center text-gray-500 py-12">No data available</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Challenges List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>Challenge Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {focusAreaData.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold`} 
                       style={{ backgroundColor: COLORS[index % COLORS.length] }}>
                    {index + 1}
                  </div>
                  <span className="text-gray-700 font-medium">{item.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${(item.value / sessions.length) * 100}%`,
                        backgroundColor: COLORS[index % COLORS.length]
                      }}
                    />
                  </div>
                  <span className="text-gray-600 font-semibold w-16 text-right">
                    {item.value} {item.value === 1 ? 'session' : 'sessions'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
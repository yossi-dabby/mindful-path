import React from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Target, CheckCircle, Users, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../utils';
import { useTranslation } from 'react-i18next';

const COLORS = ['#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

export default function CoachingAnalytics() {
  const { t } = useTranslation();

  const focusAreaLabels = {
    mood_improvement: t('coaching_analytics.focus_areas.mood_improvement'),
    stress_management: t('coaching_analytics.focus_areas.stress_management'),
    goal_achievement: t('coaching_analytics.focus_areas.goal_achievement'),
    behavior_change: t('coaching_analytics.focus_areas.behavior_change'),
    relationship: t('coaching_analytics.focus_areas.relationship'),
    self_esteem: t('coaching_analytics.focus_areas.self_esteem'),
    general: t('coaching_analytics.focus_areas.general')
  };

  const stageLabels = {
    discovery: t('coaching_analytics.stages.discovery'),
    planning: t('coaching_analytics.stages.planning'),
    action: t('coaching_analytics.stages.action'),
    review: t('coaching_analytics.stages.review'),
    completed: t('coaching_analytics.stages.completed')
  };

  const { data: sessions, isLoading } = useQuery({
    queryKey: ['coachingSessions'],
    queryFn: () => base44.entities.CoachingSession.list(),
    initialData: []
  });

  if (isLoading) {
    return (
      <div className="min-h-screen p-8 flex items-center justify-center">
        <p className="text-gray-500">{t('coaching_analytics.loading')}</p>
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
  const hasSessionData = sessions.length > 0;

  if (!hasSessionData) {
    return (
      <div className="min-h-dvh p-4 md:p-8 max-w-7xl mx-auto">
        <div className="mb-8 mt-4">
          <Link to={createPageUrl('Coach')}>
            <Button variant="ghost" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              {t('coaching_analytics.back_to_coaching')}
            </Button>
          </Link>
          <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">{t('coaching_analytics.title')}</h1>
          <p className="text-gray-500">{t('coaching_analytics.subtitle')}</p>
        </div>

        <Card className="border-0 shadow-lg">
          <CardContent className="p-8 md:p-12 text-center space-y-4">
            <p className="text-gray-500">{t('coaching_analytics.no_data')}</p>
            <Link to={createPageUrl('Coach')}>
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                {t('coaching_analytics.back_to_coaching')}
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-dvh p-4 md:p-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 mt-4">
        <Link to={createPageUrl('Coach')}>
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t('coaching_analytics.back_to_coaching')}
          </Button>
        </Link>
        <h1 className="text-3xl md:text-4xl font-light text-gray-800 mb-2">{t('coaching_analytics.title')}</h1>
        <p className="text-gray-500">{t('coaching_analytics.subtitle')}</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">{t('coaching_analytics.total_sessions')}</p>
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
                <p className="text-sm text-gray-500 mb-1">{t('coaching_analytics.active_sessions')}</p>
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
                <p className="text-sm text-gray-500 mb-1">{t('coaching_analytics.completion_rate')}</p>
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
                <p className="text-sm text-gray-500 mb-1">{t('coaching_analytics.action_completion')}</p>
                <p className="text-3xl font-bold text-orange-600">{actionCompletionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              {t('coaching_analytics.actions_completed', { completed: completedActions, total: totalActions })}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Focus Areas */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>{t('coaching_analytics.most_common_challenges')}</CardTitle>
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
              <p className="text-center text-gray-500 py-12">{t('coaching_analytics.no_data')}</p>
            )}
          </CardContent>
        </Card>

        {/* Stage Distribution */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>{t('coaching_analytics.stage_distribution')}</CardTitle>
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
              <p className="text-center text-gray-500 py-12">{t('coaching_analytics.no_data')}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top Challenges List */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle>{t('coaching_analytics.challenge_breakdown')}</CardTitle>
        </CardHeader>
        <CardContent>
          {focusAreaData.length > 0 ? (
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
                      {item.value} {item.value === 1 ? t('coaching_analytics.session_singular') : t('coaching_analytics.session_plural')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 py-8">{t('coaching_analytics.no_data')}</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

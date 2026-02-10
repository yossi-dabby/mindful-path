import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, Target, AlertCircle, TrendingUp, CheckCircle2 } from 'lucide-react';
import { format, isAfter, isBefore, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { createPageUrl } from '@/utils';
import { Link } from 'react-router-dom';

export default function GoalsDashboardWidget() {
  const { data: goals = [], isLoading } = useQuery({
    queryKey: ['allGoals'],
    queryFn: () => base44.entities.Goal.list(),
    staleTime: 30000
  });

  const activeGoals = goals.filter(g => g.status !== 'completed');
  const completedGoals = goals.filter(g => g.status === 'completed');

  // Calculate overdue goals
  const overdueGoals = activeGoals.filter(g => {
    if (!g.target_date) return false;
    try {
      return isBefore(new Date(g.target_date), new Date());
    } catch {
      return false;
    }
  });

  // Calculate upcoming deadlines (next 7 days)
  const upcomingDeadlines = activeGoals
    .filter(g => {
      if (!g.target_date) return false;
      try {
        const targetDate = new Date(g.target_date);
        const weekFromNow = addDays(new Date(), 7);
        return isAfter(targetDate, new Date()) && isBefore(targetDate, weekFromNow);
      } catch {
        return false;
      }
    })
    .sort((a, b) => new Date(a.target_date) - new Date(b.target_date));

  // Calculate overall progress
  const totalProgress = activeGoals.length > 0
    ? Math.round(activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length)
    : 0;

  // Count total milestones and completed milestones
  const allMilestones = activeGoals.flatMap(g => g.milestones || []);
  const completedMilestones = allMilestones.filter(m => m.completed);

  if (isLoading) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/3" />
            <div className="h-20 bg-gray-200 rounded" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (goals.length === 0) {
    return (
      <Card className="border-0 shadow-md">
        <CardContent className="p-6 text-center">
          <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <p className="text-sm text-gray-500 mb-3">No goals yet</p>
          <Link to={createPageUrl('Goals')}>
            <Button size="sm">Create Your First Goal</Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          Goals Overview
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-blue-600">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-2" />
          <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
            <span>{activeGoals.length} active</span>
            <span>{completedMilestones.length}/{allMilestones.length} tasks done</span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-green-50 rounded-lg p-3 border border-green-200">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              <span className="text-xs text-gray-600">Completed</span>
            </div>
            <p className="text-2xl font-bold text-green-700">{completedGoals.length}</p>
          </div>

          <div className={cn(
            "rounded-lg p-3 border",
            overdueGoals.length > 0 
              ? "bg-red-50 border-red-200" 
              : "bg-gray-50 border-gray-200"
          )}>
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle className={cn(
                "w-4 h-4",
                overdueGoals.length > 0 ? "text-red-600" : "text-gray-400"
              )} />
              <span className="text-xs text-gray-600">Overdue</span>
            </div>
            <p className={cn(
              "text-2xl font-bold",
              overdueGoals.length > 0 ? "text-red-700" : "text-gray-400"
            )}>
              {overdueGoals.length}
            </p>
          </div>
        </div>

        {/* Overdue Goals Alert */}
        {overdueGoals.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm font-medium text-red-800 mb-2">Overdue Goals:</p>
            <div className="space-y-2">
              {overdueGoals.slice(0, 3).map(goal => (
                <div key={goal.id} className="flex items-start gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-red-900 truncate">{goal.title}</p>
                    <p className="text-xs text-red-700">
                      Due {format(new Date(goal.target_date), 'MMM d')}
                    </p>
                  </div>
                </div>
              ))}
              {overdueGoals.length > 3 && (
                <p className="text-xs text-red-600">+{overdueGoals.length - 3} more</p>
              )}
            </div>
          </div>
        )}

        {/* Upcoming Deadlines */}
        {upcomingDeadlines.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm font-medium text-amber-800 mb-2">Coming Up This Week:</p>
            <div className="space-y-2">
              {upcomingDeadlines.slice(0, 3).map(goal => (
                <div key={goal.id} className="flex items-start gap-2 text-sm">
                  <Calendar className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-amber-900 truncate">{goal.title}</p>
                    <p className="text-xs text-amber-700">
                      Due {format(new Date(goal.target_date), 'MMM d')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <Link to={createPageUrl('Goals')} className="block">
          <Button variant="outline" className="w-full" size="sm">
            <TrendingUp className="w-4 h-4 mr-2" />
            View All Goals
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
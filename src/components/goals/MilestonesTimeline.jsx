import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, CheckCircle2, AlertCircle, Clock, Filter } from 'lucide-react';
import { format, isAfter, isBefore, startOfDay, endOfDay, addDays } from 'date-fns';
import { cn } from '@/lib/utils';
import { safeArray, safeText } from '@/components/utils/aiDataNormalizer';

export default function MilestonesTimeline({ goals }) {
  const [selectedGoalId, setSelectedGoalId] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  // Extract all milestones with goal info - now includes milestones without due_date
  const allMilestones = useMemo(() => {
    const milestones = [];
    
    goals.forEach(goal => {
      if (goal.status !== 'active') return;
      
      safeArray(goal.milestones).forEach((milestone, index) => {
        const ms = typeof milestone === 'object' ? milestone : { title: milestone };
        milestones.push({
          ...ms,
          goalId: goal.id,
          goalTitle: goal.title,
          goalCategory: goal.category,
          milestoneIndex: index,
          completed: Boolean(ms.completed),
          due_date: ms.due_date || null
        });
      });
    });

    return milestones.sort((a, b) => {
      // Sort: items with due_date first, then by date, then no due_date last
      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });
  }, [goals]);

  // Filter milestones
  const filteredMilestones = useMemo(() => {
    let filtered = allMilestones;

    // Filter by goal
    if (selectedGoalId !== 'all') {
      filtered = filtered.filter(m => m.goalId === selectedGoalId);
    }

    // Filter by date range
    const now = new Date();
    if (dateFilter === 'overdue') {
      filtered = filtered.filter(m => !m.completed && new Date(m.due_date) < startOfDay(now));
    } else if (dateFilter === 'week') {
      const weekEnd = addDays(now, 7);
      filtered = filtered.filter(m => {
        const date = new Date(m.due_date);
        return date >= startOfDay(now) && date <= endOfDay(weekEnd);
      });
    } else if (dateFilter === 'month') {
      const monthEnd = addDays(now, 30);
      filtered = filtered.filter(m => {
        const date = new Date(m.due_date);
        return date >= startOfDay(now) && date <= endOfDay(monthEnd);
      });
    }

    return filtered;
  }, [allMilestones, selectedGoalId, dateFilter]);

  const getMilestoneStatus = (milestone) => {
    if (milestone.completed) return 'completed';
    if (!milestone.due_date) return 'no-date';
    
    const dueDate = new Date(milestone.due_date);
    const now = new Date();
    const daysUntil = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));

    if (daysUntil < 0) return 'overdue';
    if (daysUntil <= 3) return 'due-soon';
    if (daysUntil <= 7) return 'upcoming';
    return 'future';
  };

  const statusConfig = {
    completed: {
      color: 'bg-green-500',
      textColor: 'text-green-700',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      icon: CheckCircle2,
      label: 'Completed'
    },
    overdue: {
      color: 'bg-red-500',
      textColor: 'text-red-700',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      icon: AlertCircle,
      label: 'Overdue'
    },
    'due-soon': {
      color: 'bg-amber-500',
      textColor: 'text-amber-700',
      bgColor: 'bg-amber-50',
      borderColor: 'border-amber-200',
      icon: Clock,
      label: 'Due Soon'
    },
    upcoming: {
      color: 'bg-blue-500',
      textColor: 'text-blue-700',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-200',
      icon: Calendar,
      label: 'Upcoming'
    },
    future: {
      color: 'bg-gray-400',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-200',
      icon: Calendar,
      label: 'Future'
    },
    'no-date': {
      color: 'bg-slate-400',
      textColor: 'text-slate-700',
      bgColor: 'bg-slate-50',
      borderColor: 'border-slate-200',
      icon: Clock,
      label: 'No Date Set'
    }
  };

  const categoryColors = {
    behavioral: 'bg-blue-100 text-blue-700',
    emotional: 'bg-purple-100 text-purple-700',
    social: 'bg-green-100 text-green-700',
    cognitive: 'bg-orange-100 text-orange-700',
    lifestyle: 'bg-pink-100 text-pink-700'
  };

  const activeGoals = goals.filter(g => g.status === 'active');

  const stats = useMemo(() => {
    const completed = filteredMilestones.filter(m => m.completed).length;
    const overdue = filteredMilestones.filter(m => getMilestoneStatus(m) === 'overdue').length;
    const dueSoon = filteredMilestones.filter(m => getMilestoneStatus(m) === 'due-soon').length;
    const allCompleted = allMilestones.filter(m => m.completed).length;
    const allTotal = allMilestones.length;
    return { completed: allCompleted, overdue, dueSoon, total: allTotal };
  }, [filteredMilestones, allMilestones]);

  return (
    <Card className="border-0 shadow-md">
      <CardHeader>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <CardTitle className="text-2xl font-bold">Milestones Timeline</CardTitle>
          
          <div className="flex flex-col md:flex-row gap-2">
            <Select value={selectedGoalId} onValueChange={setSelectedGoalId}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by goal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Goals</SelectItem>
                {activeGoals.map(goal => (
                  <SelectItem key={goal.id} value={goal.id}>
                    {goal.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={dateFilter} onValueChange={setDateFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <Calendar className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Dates</SelectItem>
                <SelectItem value="overdue">Overdue</SelectItem>
                <SelectItem value="week">Next 7 Days</SelectItem>
                <SelectItem value="month">Next 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-4">
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
            <div className="text-xs text-gray-500">Total</div>
          </div>
          <div className="p-3 bg-red-50 rounded-lg border border-red-200">
            <div className="text-2xl font-bold text-red-700">{stats.overdue}</div>
            <div className="text-xs text-red-600">Overdue</div>
          </div>
          <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
            <div className="text-2xl font-bold text-amber-700">{stats.dueSoon}</div>
            <div className="text-xs text-amber-600">Due Soon</div>
          </div>
          <div className="p-3 bg-green-50 rounded-lg border border-green-200">
            <div className="text-xl md:text-2xl font-bold text-green-700 truncate">
              {stats.completed}/{stats.total}
            </div>
            <div className="text-xs text-green-600">Completed</div>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {filteredMilestones.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p>No milestones found with the selected filters</p>
          </div>
        ) : (
          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

            {/* Milestones */}
            <div className="space-y-6">
              {filteredMilestones.map((milestone, idx) => {
                const status = getMilestoneStatus(milestone);
                const config = statusConfig[status];
                const Icon = config.icon;
                const dueDate = new Date(milestone.due_date);
                const daysUntil = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));

                return (
                  <div key={`${milestone.goalId}-${milestone.milestoneIndex}`} className="relative flex gap-4">
                    {/* Timeline dot */}
                    <div className={cn(
                      "relative z-10 flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center border-4 border-white shadow-md",
                      config.color
                    )}>
                      <Icon className="w-5 h-5 text-white" />
                    </div>

                    {/* Content */}
                    <div className={cn(
                      "flex-1 p-4 rounded-lg border-2 transition-all",
                      config.bgColor,
                      config.borderColor,
                      milestone.completed && "opacity-75"
                    )}>
                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-2 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={cn(
                              "text-sm font-semibold",
                              milestone.completed && "line-through"
                            )}>
                              {safeText(milestone.title, 'Milestone')}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge className={categoryColors[milestone.goalCategory]} variant="secondary">
                              {milestone.goalTitle}
                            </Badge>
                            <Badge className={cn("text-xs", config.textColor)} variant="outline">
                              {config.label}
                            </Badge>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-1">
                          {milestone.due_date ? (
                            <>
                              <div className="text-sm font-medium text-gray-700">
                                {format(dueDate, 'MMM d, yyyy')}
                              </div>
                              {!milestone.completed && daysUntil >= 0 && daysUntil <= 7 && (
                                <div className={cn("text-xs font-medium", config.textColor)}>
                                  {daysUntil === 0 ? 'Today' : daysUntil === 1 ? 'Tomorrow' : `${daysUntil} days`}
                                </div>
                              )}
                              {!milestone.completed && daysUntil < 0 && (
                                <div className="text-xs font-medium text-red-600">
                                  {Math.abs(daysUntil)} days overdue
                                </div>
                              )}
                            </>
                          ) : (
                            <div className="text-sm text-slate-500 italic">
                              No due date
                            </div>
                          )}
                        </div>
                      </div>

                      {milestone.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {safeText(milestone.description)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Target, TrendingUp, Calendar, CheckCircle2, Circle, Clock } from 'lucide-react';
import { format, differenceInDays } from 'date-fns';
import { Link } from 'react-router-dom';
import { createPageUrl } from '../../utils';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const categoryColors = {
  behavioral: 'bg-blue-100 text-blue-700',
  emotional: 'bg-purple-100 text-purple-700',
  social: 'bg-pink-100 text-pink-700',
  cognitive: 'bg-indigo-100 text-indigo-700',
  lifestyle: 'bg-green-100 text-green-700'
};

const statusIcons = {
  active: Clock,
  completed: CheckCircle2,
  paused: Circle
};

export default function GoalsProgressTracker({ goals }) {
  const activeGoals = goals.filter(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');
  const avgProgress = activeGoals.length > 0 
    ? activeGoals.reduce((sum, g) => sum + (g.progress || 0), 0) / activeGoals.length 
    : 0;

  // Calculate milestones stats
  const totalMilestones = activeGoals.reduce((sum, g) => sum + (g.milestones?.length || 0), 0);
  const completedMilestones = activeGoals.reduce((sum, g) => 
    sum + (g.milestones?.filter(m => m.completed).length || 0), 0
  );

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-600" />
            Goals Progress
          </CardTitle>
          <Link to={createPageUrl('Goals')}>
            <Button variant="outline" size="sm">
              Manage Goals
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl">
            <p className="text-3xl font-bold text-orange-600">{activeGoals.length}</p>
            <p className="text-sm text-gray-600 mt-1">Active Goals</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl">
            <p className="text-3xl font-bold text-green-600">{completedGoals.length}</p>
            <p className="text-sm text-gray-600 mt-1">Completed</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl">
            <p className="text-3xl font-bold text-blue-600">{avgProgress.toFixed(0)}%</p>
            <p className="text-sm text-gray-600 mt-1">Avg Progress</p>
          </div>
          <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl">
            <p className="text-3xl font-bold text-purple-600">{completedMilestones}/{totalMilestones}</p>
            <p className="text-sm text-gray-600 mt-1">Milestones</p>
          </div>
        </div>

        {/* Active Goals List */}
        {activeGoals.length > 0 ? (
          <div className="space-y-4">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Your Active Goals
            </h4>
            {activeGoals.map((goal, idx) => {
              const StatusIcon = statusIcons[goal.status];
              const daysLeft = goal.target_date 
                ? differenceInDays(new Date(goal.target_date), new Date())
                : null;

              return (
                <motion.div
                  key={goal.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="p-4 bg-gradient-to-r from-white to-gray-50 rounded-xl border border-gray-200 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <StatusIcon className="w-5 h-5 text-orange-600" />
                        <h5 className="font-semibold text-gray-800">{goal.title}</h5>
                      </div>
                      {goal.description && (
                        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{goal.description}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge className={cn('text-xs', categoryColors[goal.category])}>
                          {goal.category}
                        </Badge>
                        {goal.target_date && (
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Calendar className="w-3 h-3" />
                            {daysLeft > 0 ? `${daysLeft} days left` : 'Overdue'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-bold text-orange-600">{goal.progress || 0}%</span>
                    </div>
                    <Progress value={goal.progress || 0} className="h-2" />
                  </div>

                  {/* Milestones */}
                  {goal.milestones && goal.milestones.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-600">
                        Milestones ({goal.milestones.filter(m => m.completed).length}/{goal.milestones.length})
                      </p>
                      <div className="space-y-1">
                        {goal.milestones.slice(0, 3).map((milestone, mIdx) => (
                          <div key={mIdx} className="flex items-center gap-2 text-sm">
                            {milestone.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                            ) : (
                              <Circle className="w-4 h-4 text-gray-400 flex-shrink-0" />
                            )}
                            <span className={cn(
                              "text-xs",
                              milestone.completed ? "text-gray-500 line-through" : "text-gray-700"
                            )}>
                              {milestone.title}
                            </span>
                          </div>
                        ))}
                        {goal.milestones.length > 3 && (
                          <p className="text-xs text-gray-500 ml-6">
                            +{goal.milestones.length - 3} more
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Target className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium mb-2">No active goals yet</p>
            <p className="text-sm mb-4">Set goals to track your progress and stay motivated</p>
            <Link to={createPageUrl('Goals')}>
              <Button className="bg-orange-600 hover:bg-orange-700">
                <Target className="w-4 h-4 mr-2" />
                Create Your First Goal
              </Button>
            </Link>
          </div>
        )}

        {/* Recently Completed */}
        {completedGoals.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <h4 className="font-semibold text-gray-800 flex items-center gap-2 mb-3">
              <CheckCircle2 className="w-4 h-4 text-green-600" />
              Recently Completed
            </h4>
            <div className="space-y-2">
              {completedGoals.slice(0, 3).map((goal) => (
                <div key={goal.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800">{goal.title}</p>
                    <p className="text-xs text-gray-500">
                      Completed {goal.updated_date ? format(new Date(goal.updated_date), 'MMM d, yyyy') : ''}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
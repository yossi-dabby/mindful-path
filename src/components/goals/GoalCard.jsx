import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Calendar, CheckCircle2, ChevronDown, ChevronUp, TrendingUp, BookOpen, Trash2, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { safeArray, safeText } from '@/components/utils/aiDataNormalizer';
import GoalProgressChart from './GoalProgressChart';
import LinkedJournalEntries from './LinkedJournalEntries';
import AiGoalAdjustment from './AiGoalAdjustment';

const categoryColors = {
  behavioral: 'bg-blue-100 text-blue-700',
  emotional: 'bg-purple-100 text-purple-700',
  social: 'bg-green-100 text-green-700',
  cognitive: 'bg-orange-100 text-orange-700',
  lifestyle: 'bg-pink-100 text-pink-700'
};

export default function GoalCard({ goal, onEdit, onDelete, isDeleting }) {
  const [showChart, setShowChart] = useState(false);
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [showObstacles, setShowObstacles] = useState(false);
  const [showAiAdjustment, setShowAiAdjustment] = useState(false);
  const queryClient = useQueryClient();

  const toggleMilestoneMutation = useMutation({
    mutationFn: async ({ milestones }) => {
      await base44.entities.Goal.update(goal.id, { milestones });
    },
    onMutate: async ({ milestones }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries(['allGoals']);
      await queryClient.cancelQueries(['goals']);

      // Snapshot previous values
      const previousGoals = queryClient.getQueryData(['allGoals']);
      const previousGoalsList = queryClient.getQueryData(['goals']);

      // Optimistically update
      queryClient.setQueryData(['allGoals'], (old) => {
        if (!old) return old;
        return old.map(g => g.id === goal.id ? { ...g, milestones } : g);
      });

      queryClient.setQueryData(['goals'], (old) => {
        if (!old) return old;
        return old.map(g => g.id === goal.id ? { ...g, milestones } : g);
      });

      return { previousGoals, previousGoalsList };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousGoals) {
        queryClient.setQueryData(['allGoals'], context.previousGoals);
      }
      if (context?.previousGoalsList) {
        queryClient.setQueryData(['goals'], context.previousGoalsList);
      }
      console.error('Failed to update milestone:', error);
    },
    onSettled: () => {
      queryClient.invalidateQueries(['allGoals']);
      queryClient.invalidateQueries(['goals']);
    }
  });

  const toggleMilestone = (index) => {
    if (toggleMilestoneMutation.isPending) return;
    
    const milestones = safeArray(goal.milestones).map((m, i) => {
      if (typeof m === 'string') {
        return { title: m, completed: false, description: '', due_date: null };
      }
      return {
        title: safeText(m.title || m, `Step ${i + 1}`),
        description: safeText(m.description, ''),
        completed: Boolean(m.completed),
        due_date: m.due_date || null
      };
    });
    
    milestones[index] = {
      ...milestones[index],
      completed: !milestones[index].completed,
      completed_date: !milestones[index].completed ? new Date().toISOString() : null
    };
    
    toggleMilestoneMutation.mutate({ milestones });
  };

  const isCompleted = goal.status === 'completed';
  const isOverdue =
    goal.target_date && new Date(goal.target_date) < new Date() && !isCompleted;

  const handleApplyAdjustment = async (updates) => {
    try {
      await base44.entities.Goal.update(goal.id, updates);
      queryClient.invalidateQueries(['allGoals']);
      queryClient.invalidateQueries(['goals']);
      setShowAiAdjustment(false);
    } catch (error) {
      console.error('Failed to apply adjustment:', error);
      alert('Failed to apply changes. Please try again.');
    }
  };

  return (
    <Card className={cn('border-0 shadow-md w-full', isCompleted && 'opacity-75')}>
      <CardContent className="p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 md:gap-0 mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className={cn('text-xl font-semibold text-gray-800', isCompleted && 'line-through')}>
                {goal.title}
              </h3>
              {isCompleted && <CheckCircle2 className="w-5 h-5 text-green-600" />}
            </div>
            {goal.description && (
              <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
            )}
            <div className="flex items-center gap-2 flex-wrap">
                <Badge className={categoryColors[goal.category]} variant="secondary">
                  {goal.category}
                </Badge>
                {goal.target_date && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'flex items-center gap-1',
                      isOverdue && 'border-red-300 text-red-600'
                    )}
                  >
                    <Calendar className="w-3 h-3" />
                    {format(new Date(goal.target_date), 'MMM d, yyyy')}
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                onEdit(goal);
              }}
              aria-label="Edit goal"
            >
              <Edit className="w-4 h-4 text-gray-400" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={(e) => {
                e.stopPropagation();
                if (isDeleting) return;
                if (confirm(`Are you sure you want to delete "${goal.title}"? This action cannot be undone.`)) {
                  onDelete(goal.id);
                }
              }}
              disabled={isDeleting}
              aria-label="Delete goal"
            >
              <Trash2 className="w-4 h-4 text-red-400 hover:text-red-600" />
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-sm font-bold text-blue-600">{goal.progress}%</span>
          </div>
          <Progress value={goal.progress} className="h-3" />
        </div>

        {/* Milestones */}
        {safeArray(goal.milestones).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Tasks:</p>
            {safeArray(goal.milestones).map((milestoneRaw, index) => {
              const milestone = typeof milestoneRaw === 'object' ? milestoneRaw : { title: safeText(milestoneRaw, `Step ${index + 1}`), completed: false };
              return (
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg border border-gray-100">
                <label className="flex items-center justify-center min-w-[44px] min-h-[44px] md:min-w-0 md:min-h-0 cursor-pointer -m-2 md:m-0">
                  <Checkbox
                    checked={milestone.completed}
                    onCheckedChange={() => toggleMilestone(index)}
                    disabled={toggleMilestoneMutation.isPending}
                  />
                </label>
                <div className="flex-1 min-w-0">
                  <span
                    className={cn(
                      'text-sm font-medium block',
                      milestone.completed
                        ? 'line-through text-gray-400'
                        : 'text-gray-700'
                    )}
                  >
                    {safeText(milestone.title, `Step ${index + 1}`)}
                  </span>
                  {milestone.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{safeText(milestone.description)}</p>
                  )}
                  {milestone.due_date && (
                    <Badge variant="outline" className="mt-1 text-xs">
                      <Calendar className="w-3 h-3 mr-1" />
                      {format(new Date(milestone.due_date), 'MMM d')}
                    </Badge>
                  )}
                </div>
              </div>
            );
            })}
          </div>
        )}

        {/* Obstacles Section */}
        {(goal.obstacles?.identified_obstacles?.length > 0 || goal.obstacles?.cognitive_distortions?.length > 0) && (
          <div className="mt-4">
            <Button
              variant="outline"
              onClick={() => setShowObstacles(!showObstacles)}
              className="flex items-center justify-center gap-2 w-full min-w-0"
            >
              <span className="flex-1 text-left font-medium min-w-0 break-words">Obstacles & CBT Work</span>
              {showObstacles ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
            </Button>
            {showObstacles && (
              <div className="mt-3 p-4 bg-amber-50 rounded-lg border border-amber-200 space-y-3">
                {goal.obstacles.identified_obstacles?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Identified Obstacles:</p>
                    <ul className="space-y-1">
                      {goal.obstacles.identified_obstacles.map((obstacle, i) => (
                        <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
                          <span className="text-amber-600 mt-1">•</span>
                          <span>{obstacle}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {goal.obstacles.cognitive_distortions?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Thinking Patterns:</p>
                    <div className="flex flex-wrap gap-1">
                      {goal.obstacles.cognitive_distortions.map((dist, i) => (
                        <Badge key={i} variant="outline" className="text-xs bg-white">
                          {dist}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
                {goal.obstacles.balanced_thoughts?.length > 0 && (
                  <div>
                    <p className="text-sm font-medium text-gray-700 mb-2">Balanced Thoughts:</p>
                    <ul className="space-y-1">
                      {goal.obstacles.balanced_thoughts.slice(0, 3).map((thought, i) => (
                        <li key={i} className="text-sm text-green-700 flex items-start gap-2">
                          <span className="text-green-600 mt-1">✓</span>
                          <span>{thought}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setShowChart(!showChart)}
            className="flex items-center justify-center gap-2 w-full min-w-0"
          >
            <TrendingUp className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left min-w-0 break-words">{showChart ? 'Hide' : 'Show'} Chart</span>
            {showChart ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowJournalEntries(!showJournalEntries)}
            className="flex items-center justify-center gap-2 w-full min-w-0"
          >
            <BookOpen className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left min-w-0 break-words">{showJournalEntries ? 'Hide' : 'Show'} Journal</span>
            {showJournalEntries ? <ChevronUp className="w-4 h-4 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 flex-shrink-0" />}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAiAdjustment(true)}
            className="flex items-center justify-center gap-2 w-full min-w-0 border-purple-300 text-purple-700 hover:bg-purple-50"
          >
            <Sparkles className="w-4 h-4 flex-shrink-0" />
            <span className="flex-1 text-left min-w-0 break-words">AI Adjust</span>
          </Button>
        </div>

        {/* Progress Chart */}
        {showChart && (
          <div className="mt-4 pt-4 border-t">
            <GoalProgressChart goal={goal} />
          </div>
        )}

        {/* Linked Journal Entries */}
        {showJournalEntries && (
          <div className="mt-4 pt-4 border-t">
            <LinkedJournalEntries goalId={goal.id} />
          </div>
        )}
      </CardContent>

      {/* AI Adjustment Modal */}
      {showAiAdjustment && (
        <AiGoalAdjustment
          goal={goal}
          onApply={handleApplyAdjustment}
          onClose={() => setShowAiAdjustment(false)}
        />
      )}
    </Card>
  );
}
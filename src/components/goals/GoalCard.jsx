import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Calendar, CheckCircle2, ChevronDown, ChevronUp, TrendingUp, BookOpen, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { safeArray, safeText } from '@/components/utils/aiDataNormalizer';
import GoalProgressChart from './GoalProgressChart';
import LinkedJournalEntries from './LinkedJournalEntries';

const categoryColors = {
  behavioral: 'bg-blue-100 text-blue-700',
  emotional: 'bg-purple-100 text-purple-700',
  social: 'bg-green-100 text-green-700',
  cognitive: 'bg-orange-100 text-orange-700',
  lifestyle: 'bg-pink-100 text-pink-700'
};

export default function GoalCard({ goal, onEdit, onDelete }) {
  const [showChart, setShowChart] = useState(false);
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const queryClient = useQueryClient();

  const toggleMilestoneMutation = useMutation({
    mutationFn: async ({ milestones }) => {
      await base44.entities.Goal.update(goal.id, { milestones });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['allGoals']);
      queryClient.invalidateQueries(['goals']);
    },
    onError: (error) => {
      console.error('Failed to update milestone:', error);
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
            <Button variant="ghost" size="icon" onClick={() => onEdit(goal)}>
              <Edit className="w-4 h-4 text-gray-400" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${goal.title}"? This action cannot be undone.`)) {
                  onDelete(goal.id);
                }
              }}
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
              <div key={index} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-100">
                <Checkbox
                  checked={milestone.completed}
                  onCheckedChange={() => toggleMilestone(index)}
                  disabled={toggleMilestoneMutation.isPending}
                  className="rounded mt-0.5 cursor-pointer"
                />
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

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setShowChart(!showChart)}
            className="flex items-center justify-center gap-2 w-full"
          >
            <TrendingUp className="w-4 h-4" />
            <span className="flex-1 text-left">{showChart ? 'Hide' : 'Show'} Chart</span>
            {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowJournalEntries(!showJournalEntries)}
            className="flex items-center justify-center gap-2 w-full"
          >
            <BookOpen className="w-4 h-4" />
            <span className="flex-1 text-left">{showJournalEntries ? 'Hide' : 'Show'} Journal</span>
            {showJournalEntries ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
    </Card>
  );
}
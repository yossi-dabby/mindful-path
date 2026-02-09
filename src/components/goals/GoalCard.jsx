import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Calendar, CheckCircle2, ChevronDown, ChevronUp, TrendingUp, BookOpen, Trash2, Sparkles, Bell, LayoutGrid } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { safeArray, safeText } from '@/components/utils/aiDataNormalizer';
import GoalProgressChart from './GoalProgressChart';
import GoalKanbanBoard from './GoalKanbanBoard';
import LinkedJournalEntries from './LinkedJournalEntries';
import AiGoalAdjustment from './AiGoalAdjustment';
import ReminderSettings from './ReminderSettings';

const categoryColors = {
  behavioral: 'bg-blue-100 text-blue-700',
  emotional: 'bg-purple-100 text-purple-700',
  social: 'bg-green-100 text-green-700',
  cognitive: 'bg-orange-100 text-orange-700',
  lifestyle: 'bg-pink-100 text-pink-700'
};

export default function GoalCard({ goal, onEdit, onDelete, isDeleting }) {
  const [showChart, setShowChart] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showJournalEntries, setShowJournalEntries] = useState(false);
  const [showObstacles, setShowObstacles] = useState(false);
  const [showAiAdjustment, setShowAiAdjustment] = useState(false);
  const [showReminders, setShowReminders] = useState(false);
  
  const queryClient = useQueryClient();
  
  // Normalize milestones from goal prop and sync to local state
  const getNormalizedMilestones = (milestones) => {
    return safeArray(milestones).map((m, i) => {
      if (typeof m === 'string') {
        return { title: m, completed: false, description: '', due_date: null };
      }
      return {
        title: safeText(m.title || m, `Step ${i + 1}`),
        description: safeText(m.description, ''),
        completed: Boolean(m.completed),
        due_date: m.due_date || null,
        completed_date: m.completed_date || null
      };
    });
  };

  const [localMilestones, setLocalMilestones] = useState(() => getNormalizedMilestones(goal.milestones));

  // Sync local state when goal prop changes
  React.useEffect(() => {
    setLocalMilestones(getNormalizedMilestones(goal.milestones));
  }, [goal.milestones]);

  // Mutation with optimistic update
  const updateMilestone = useMutation({
    mutationFn: async ({ updatedMilestones, newProgress }) => {
      return await base44.entities.Goal.update(goal.id, { 
        milestones: updatedMilestones, 
        progress: newProgress 
      });
    },
    onSuccess: (data) => {
      // Update local state with server response
      if (data?.milestones) {
        setLocalMilestones(getNormalizedMilestones(data.milestones));
      }
      // Invalidate queries to sync with other components
      queryClient.invalidateQueries(['allGoals']);
    },
    onError: (err) => {
      // Revert local state on error
      setLocalMilestones(getNormalizedMilestones(goal.milestones));
      alert('Failed to update: ' + (err.message || 'Unknown error'));
    }
  });

  const toggleMilestone = (index, checked) => {
    // Immediately update local state for instant UI feedback
    const updatedMilestones = localMilestones.map((m, i) => 
      i === index 
        ? { ...m, completed: checked, completed_date: checked ? new Date().toISOString() : null }
        : m
    );
    
    setLocalMilestones(updatedMilestones);
    
    const completedCount = updatedMilestones.filter(m => m.completed).length;
    const newProgress = Math.round((completedCount / updatedMilestones.length) * 100);
    
    // Send to server
    updateMilestone.mutate({ updatedMilestones, newProgress });
  };

  const isCompleted = goal.status === 'completed';
  const isOverdue = (() => {
    if (!goal.target_date || isCompleted) return false;
    try {
      const targetDate = new Date(goal.target_date);
      return !isNaN(targetDate.getTime()) && targetDate < new Date();
    } catch {
      return false;
    }
  })();

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
                {goal.target_date && (() => {
                  try {
                    const date = new Date(goal.target_date);
                    if (isNaN(date.getTime())) return null;
                    return (
                      <Badge
                        variant="outline"
                        className={cn(
                          'flex items-center gap-1',
                          isOverdue && 'border-red-300 text-red-600'
                        )}
                      >
                        <Calendar className="w-3 h-3" />
                        {format(date, 'MMM d, yyyy')}
                      </Badge>
                    );
                  } catch {
                    return null;
                  }
                })()}
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
            <span className="text-sm font-medium text-gray-700">Progress {updateMilestone.isPending && <span className="text-xs text-gray-500 ml-2">Saving...</span>}</span>
            <span className="text-sm font-bold text-blue-600">{goal.progress || 0}%</span>
          </div>
          <Progress value={goal.progress || 0} className="h-3" />
        </div>

        {/* Milestones */}
        {safeArray(goal.milestones).length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-700">Tasks:</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">
                  {normalizedMilestones.filter(m => m.completed).length}/{normalizedMilestones.length}
                </span>
                <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-blue-500 transition-all duration-300"
                    style={{ 
                      width: `${normalizedMilestones.length > 0 ? (normalizedMilestones.filter(m => m.completed).length / normalizedMilestones.length) * 100 : 0}%` 
                    }}
                  />
                </div>
              </div>
            </div>
            {normalizedMilestones.map((milestone, index) => {
              const isOverdue = (() => {
                if (!milestone.due_date || milestone.completed) return false;
                try {
                  const dueDate = new Date(milestone.due_date);
                  return !isNaN(dueDate.getTime()) && dueDate < new Date();
                } catch {
                  return false;
                }
              })();

              const isDueSoon = (() => {
                if (!milestone.due_date || milestone.completed) return false;
                try {
                  const dueDate = new Date(milestone.due_date);
                  const daysUntil = Math.ceil((dueDate - new Date()) / (1000 * 60 * 60 * 24));
                  return daysUntil >= 0 && daysUntil <= 3;
                } catch {
                  return false;
                }
              })();

              return (
              <div 
                key={index}
                className={cn(
                  "flex items-start gap-3 p-3 rounded-lg border transition-colors relative",
                  milestone.completed ? "border-green-100 bg-green-50/30" : "border-gray-100 hover:bg-gray-50",
                  isOverdue && "border-red-200 bg-red-50/30",
                  isDueSoon && !isOverdue && "border-amber-200 bg-amber-50/30",
                  updateMilestone.isPending && "opacity-60"
                )}
              >
                {milestone.completed && (
                  <div className="absolute top-2 right-2">
                    <CheckCircle2 className="w-4 h-4 text-green-600" />
                  </div>
                )}
                <Checkbox
                  checked={Boolean(milestone.completed)}
                  onCheckedChange={(checked) => toggleMilestone(index, checked)}
                  className="mt-0.5 flex-shrink-0"
                  id={`milestone-${goal.id}-${index}`}
                  disabled={updateMilestone.isPending}
                />
                <label 
                  htmlFor={`milestone-${goal.id}-${index}`}
                  className="flex-1 min-w-0 cursor-pointer"
                >
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
                  {milestone.due_date && (() => {
                    try {
                      const date = new Date(milestone.due_date);
                      if (isNaN(date.getTime())) return null;
                      const daysUntil = Math.ceil((date - new Date()) / (1000 * 60 * 60 * 24));
                      return (
                        <Badge 
                          variant="outline" 
                          className={cn(
                            "mt-1 text-xs pointer-events-none",
                            isOverdue && "border-red-300 bg-red-100 text-red-700",
                            isDueSoon && !isOverdue && "border-amber-300 bg-amber-100 text-amber-700"
                          )}
                        >
                          <Calendar className="w-3 h-3 mr-1" />
                          {format(date, 'MMM d')}
                          {!milestone.completed && daysUntil >= 0 && daysUntil <= 7 && (
                            <span className="ml-1">• {daysUntil === 0 ? 'Today' : `${daysUntil}d`}</span>
                          )}
                          {isOverdue && <span className="ml-1">• Overdue</span>}
                        </Badge>
                      );
                    } catch {
                      return null;
                    }
                  })()}
                </label>
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
        <div className="flex flex-wrap gap-2 mt-4">
          <Button
            variant="outline"
            onClick={() => setShowChart(!showChart)}
            className="flex items-center gap-1.5 text-sm"
            size="sm"
          >
            <TrendingUp className="w-4 h-4" />
            <span>{showChart ? 'Hide' : 'Show'} Chart</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowKanban(!showKanban)}
            className="flex items-center gap-1.5 text-sm"
            size="sm"
          >
            <LayoutGrid className="w-4 h-4" />
            <span>{showKanban ? 'Hide' : 'Show'} Board</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowJournalEntries(!showJournalEntries)}
            className="flex items-center gap-1.5 text-sm"
            size="sm"
          >
            <BookOpen className="w-4 h-4" />
            <span>{showJournalEntries ? 'Hide' : 'Show'} Journal</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowAiAdjustment(true)}
            className="flex items-center gap-1.5 text-sm border-purple-300 text-purple-700 hover:bg-purple-50"
            size="sm"
          >
            <Sparkles className="w-4 h-4" />
            <span>AI Adjust</span>
          </Button>
          <Button
            variant="outline"
            onClick={() => setShowReminders(true)}
            className="flex items-center gap-1.5 text-sm"
            size="sm"
          >
            <Bell className="w-4 h-4" />
            <span>Reminders</span>
          </Button>
        </div>

        {/* Progress Chart */}
        {showChart && (
          <div className="mt-4 pt-4 border-t">
            <GoalProgressChart goal={goal} />
          </div>
        )}

        {/* Kanban Board */}
        {showKanban && (
          <div className="mt-4 pt-4 border-t">
            <GoalKanbanBoard goal={goal} />
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

      {/* Reminder Settings Modal */}
      {showReminders && (
        <ReminderSettings
          goal={goal}
          onClose={() => setShowReminders(false)}
        />
      )}
    </Card>
  );
}
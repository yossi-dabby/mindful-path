import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Edit, Calendar, CheckCircle2, ChevronDown, ChevronUp, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import GoalProgressChart from './GoalProgressChart';

const categoryColors = {
  behavioral: 'bg-blue-100 text-blue-700',
  emotional: 'bg-purple-100 text-purple-700',
  social: 'bg-green-100 text-green-700',
  cognitive: 'bg-orange-100 text-orange-700',
  lifestyle: 'bg-pink-100 text-pink-700'
};

export default function GoalCard({ goal, onEdit }) {
  const [showChart, setShowChart] = useState(false);
  const queryClient = useQueryClient();

  const toggleMilestoneMutation = useMutation({
    mutationFn: ({ milestones }) => base44.entities.Goal.update(goal.id, { milestones }),
    onSuccess: () => queryClient.invalidateQueries(['allGoals'])
  });

  const toggleMilestone = (index) => {
    const newMilestones = [...goal.milestones];
    newMilestones[index] = {
      ...newMilestones[index],
      completed: !newMilestones[index].completed
    };
    toggleMilestoneMutation.mutate({ milestones: newMilestones });
  };

  const isCompleted = goal.status === 'completed';
  const isOverdue =
    goal.target_date && new Date(goal.target_date) < new Date() && !isCompleted;

  return (
    <Card className={cn('border-0 shadow-md', isCompleted && 'opacity-75')}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
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
          <Button variant="ghost" size="icon" onClick={() => onEdit(goal)}>
            <Edit className="w-4 h-4 text-gray-400" />
          </Button>
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
        {goal.milestones?.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-700 mb-2">Milestones:</p>
            {goal.milestones.map((milestone, index) => (
              <div key={index} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50">
                <Checkbox
                  checked={milestone.completed}
                  onCheckedChange={() => toggleMilestone(index)}
                  className="rounded"
                />
                <span
                  className={cn(
                    'text-sm flex-1',
                    milestone.completed
                      ? 'line-through text-gray-400'
                      : 'text-gray-700'
                  )}
                >
                  {milestone.title}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Toggle Chart Button */}
        <Button
          variant="outline"
          onClick={() => setShowChart(!showChart)}
          className="w-full mt-4 flex items-center justify-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          {showChart ? 'Hide' : 'View'} Progress Chart
          {showChart ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </Button>

        {/* Progress Chart */}
        {showChart && (
          <div className="mt-4 pt-4 border-t">
            <GoalProgressChart goal={goal} />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
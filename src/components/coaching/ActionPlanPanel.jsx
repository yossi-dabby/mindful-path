import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useMutation } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Plus, CheckCircle2, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ActionPlanPanel({ session, onClose, onUpdate }) {
  const [newAction, setNewAction] = useState({ action: '', timeline: '' });
  const [isAdding, setIsAdding] = useState(false);

  const updateActionsMutation = useMutation({
    mutationFn: (actions) => 
      base44.entities.CoachingSession.update(session.id, { action_plan: actions })
  });

  const toggleAction = (index) => {
    const updatedActions = [...(session.action_plan || [])];
    updatedActions[index].completed = !updatedActions[index].completed;
    updateActionsMutation.mutate(updatedActions);
  };

  const addAction = () => {
    if (!newAction.action.trim()) return;
    
    const updatedActions = [
      ...(session.action_plan || []),
      { ...newAction, completed: false }
    ];
    updateActionsMutation.mutate(updatedActions);
    setNewAction({ action: '', timeline: '' });
    setIsAdding(false);
  };

  const removeAction = (index) => {
    const updatedActions = session.action_plan.filter((_, i) => i !== index);
    updateActionsMutation.mutate(updatedActions);
  };

  const completedCount = session.action_plan?.filter(a => a.completed).length || 0;
  const totalCount = session.action_plan?.length || 0;

  return (
    <Card className="w-96 border-l-0 rounded-none h-full overflow-y-auto">
      <CardHeader className="border-b sticky top-0 bg-white z-10">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-purple-600" />
            Action Plan
          </CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-500 transition-all"
              style={{ width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%` }}
            />
          </div>
          <span className="text-sm font-medium text-gray-600">
            {completedCount}/{totalCount}
          </span>
        </div>
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        {session.action_plan?.map((action, index) => (
          <div
            key={index}
            className={cn(
              'p-3 rounded-xl border-2 transition-all',
              action.completed 
                ? 'bg-green-50 border-green-200' 
                : 'bg-white border-gray-200'
            )}
          >
            <div className="flex items-start gap-3">
              <Checkbox
                checked={action.completed}
                onCheckedChange={() => toggleAction(index)}
                className="mt-1"
              />
              <div className="flex-1">
                <p className={cn(
                  'text-sm font-medium',
                  action.completed ? 'line-through text-gray-500' : 'text-gray-800'
                )}>
                  {action.action}
                </p>
                {action.timeline && (
                  <p className="text-xs text-gray-500 mt-1">📅 {action.timeline}</p>
                )}
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => removeAction(index)}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        ))}

        {isAdding ? (
          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardContent className="p-3 space-y-2">
              <Input
                value={newAction.action}
                onChange={(e) => setNewAction({ ...newAction, action: e.target.value })}
                placeholder="Action step..."
                className="bg-white"
              />
              <Input
                value={newAction.timeline}
                onChange={(e) => setNewAction({ ...newAction, timeline: e.target.value })}
                placeholder="Timeline (optional)"
                className="bg-white"
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={addAction}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  Add
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    setIsAdding(false);
                    setNewAction({ action: '', timeline: '' });
                  }}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Button
            variant="outline"
            className="w-full border-dashed"
            onClick={() => setIsAdding(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Action
          </Button>
        )}

        {session.action_plan?.length === 0 && !isAdding && (
          <div className="text-center py-8 text-gray-500">
            <Circle className="w-8 h-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No actions yet</p>
            <p className="text-xs mt-1">Work with your coach to create your plan</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}